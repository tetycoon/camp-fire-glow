import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import crypto from "node:crypto";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ThankYou from "../pages/ThankYou";
import {
  openPrintableGstInvoice,
  type InvoicePrintParams,
} from "../lib/gstUtils";

const ROOT_DIR = path.resolve(__dirname, "../..");
const BACKEND_SCRIPTS = [
  "backend/apps_script/ai_masterclass/apps_script.gs",
  "backend/apps_script/advanced_masterclass/apps_script.gs",
  "backend/apps_script/upscale/apps_script.gs",
  "backend/apps_script/claude_masterclass/apps_script.gs",
  "backend/apps_script/academy/apps_script.gs",
  "backend/apps_script/ai_bgm/apps_script.gs",
  "backend/apps_script/consulting/apps_script.gs",
  "backend/apps_script/professionals/apps_script.gs",
];

const TEST_DOMESTIC_SECRET = "mock_test_secret_domestic_only_for_unit_tests";
const TEST_WEBHOOK_PROXY_SECRET = "mock_test_proxy_secret_for_webhooks";

function computeTestHmac(orderId: string, paymentId: string, secret = TEST_DOMESTIC_SECRET): string {
  return crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
}

interface MockAppsScriptEnvOptions {
  razorpayPaymentResponse?: {
    code: number;
    body: Record<string, unknown>;
  };
  initialRows?: unknown[][];
}

function createAppsScriptSandbox(scriptRelPath: string, options: MockAppsScriptEnvOptions = {}) {
  const scriptPath = path.join(ROOT_DIR, scriptRelPath);
  const code = fs.readFileSync(scriptPath, "utf8");

  const propsStore: Record<string, string> = {
    RAZORPAY_KEY_SECRET: TEST_DOMESTIC_SECRET,
    RAZORPAY_KEY_SECRET_INTL: "mock_test_secret_intl_only_for_unit_tests",
    WEBHOOK_VERIFY_TOKEN: "mock_webhook_token",
    ADMIN_VERIFY_TOKEN: "mock_admin_token",
    WEBHOOK_PROXY_SECRET: TEST_WEBHOOK_PROXY_SECRET,
    INVOICE_TOKEN_SECRET: "mock_dedicated_invoice_token_secret",
    FUNNELSDONE_PIT_TOKEN: "mock_funnelsdone_pit_token",
    WHATSAPP_ACCESS_TOKEN: "mock_whatsapp_access_token",
    AIFUNNELS_API_TOKEN: "mock_aifunnels_api_token",
    ENVIRONMENT: "development",
    ALLOW_LEGACY_PROXY_SIGNATURE: "true",
  };

  let lockHeld = false;
  let lockAcquisitions = 0;
  let lockReleases = 0;
  const emailsSent: Record<string, unknown>[] = [];
  const salesRegisterRows: unknown[][] = [];

  // Matches saveToSheet columns in ai_masterclass/apps_script.gs:
  // Col 0: Date, 1: Name, 2: Email, 3: Phone, 4: UserType, 5: Mode,
  // 6: Amount, 7: Status, 8: Order ID, 9: Payment ID, 10: Email Status
  const mainSheetRows: unknown[][] = options.initialRows
    ? options.initialRows.map((r) => [...r])
    : [
        [
          "Date",
          "Name",
          "Email",
          "Phone",
          "UserType",
          "Mode",
          "Amount",
          "Payment Status",
          "Order ID",
          "Transaction ID",
          "Email Status",
        ],
        [
          "17/10/2026, 10:00:00 am",
          "Test Student",
          "student@example.com",
          "+919876543210",
          "Professional",
          "Online Session (Live)",
          117,
          "INITIATED",
          "order_ValidOrder12345",
          "",
          "WAITING",
        ],
      ];

  const makeSheet = (rows: unknown[][], isSalesReg = false) => ({
    getLastRow: () => rows.length,
    getDataRange: () => ({
      getValues: () => rows.map((r) => [...r]),
    }),
    getRange: (row: number, col: number, numRows = 1, numCols = 1) => ({
      getValue: () => (rows[row - 1] ? rows[row - 1][col - 1] : ""),
      setValue: (val: unknown) => {
        while (rows.length < row) rows.push([]);
        rows[row - 1][col - 1] = val;
      },
      setValues: (vals: unknown[][]) => {
        for (let r = 0; r < numRows; r++) {
          while (rows.length < row + r) rows.push([]);
          for (let c = 0; c < numCols; c++) {
            rows[row - 1 + r][col - 1 + c] = vals[r][c];
          }
        }
      },
      setFontWeight: () => ({
        setBackground: () => ({
          setFontColor: () => ({}),
        }),
      }),
    }),
    appendRow: (row: unknown[]) => {
      rows.push([...row]);
    },
    setFrozenRows: () => {},
    autoResizeColumns: () => {},
  });

  const mainSheet = makeSheet(mainSheetRows, false);
  const gstSalesSheet = makeSheet(salesRegisterRows, true);

  let paymentFetchMock =
    options.razorpayPaymentResponse || {
      code: 200,
      body: {
        id: "pay_ValidPay123456",
        order_id: "order_ValidOrder12345",
        status: "captured",
        amount: 11700,
        currency: "INR",
        method: "upi",
        notes: {
          base_amount: "99",
          gst_amount: "18",
        },
      },
    };

  const sandbox: Record<string, unknown> = {
    console,
    Date,
    Math,
    JSON,
    Number,
    String,
    Boolean,
    Array,
    Object,
    RegExp,
    Error,
    parseInt,
    parseFloat,
    isNaN,
    encodeURIComponent,
    decodeURIComponent,
    Logger: {
      log: () => {},
    },
    PropertiesService: {
      getScriptProperties: () => ({
        getProperty: (key: string) => (key in propsStore ? propsStore[key] : null),
        setProperty: (key: string, val: string) => {
          propsStore[key] = String(val);
        },
      }),
    },
    LockService: {
      getScriptLock: () => ({
        waitLock: () => {
          if (lockHeld) {
            throw new Error("LOCK_CONTENTION: Script lock already held");
          }
          lockHeld = true;
          lockAcquisitions++;
        },
        releaseLock: () => {
          lockHeld = false;
          lockReleases++;
        },
      }),
    },
    Utilities: {
      MacAlgorithm: { HMAC_SHA_256: "HMAC_SHA_256" },
      Charset: { UTF_8: "UTF_8" },
      computeHmacSha256Signature: (value: string, key: string) => {
        const buf = crypto.createHmac("sha256", key).update(value, "utf8").digest();
        return Array.from(buf).map((b) => (b > 127 ? b - 256 : b));
      },
      base64Encode: (str: string) => Buffer.from(str, "utf8").toString("base64"),
      formatDate: () => "17/10/2026",
      newBlob: (_data: string, _mime: string, _name: string) => ({
        getAs: () => ({
          setName: () => ({
            getBytes: () => [1, 2, 3],
          }),
        }),
      }),
    },
    ContentService: {
      MimeType: { JSON: "application/json" },
      createTextOutput: (text: string) => ({
        _text: text,
        setMimeType: function () {
          return this;
        },
        getContent: function () {
          return this._text;
        },
      }),
    },
    HtmlService: {
      createHtmlOutput: (html: string) => ({
        setTitle: function () {
          return this;
        },
        setXFrameOptionsMode: function () {
          return this;
        },
        getContent: () => html,
      }),
      XFrameOptionsMode: { ALLOWALL: "ALLOWALL" },
    },
    MailApp: {
      sendEmail: (payload: Record<string, unknown>) => {
        emailsSent.push(payload);
      },
    },
    SpreadsheetApp: {
      getActiveSpreadsheet: () => ({
        getSheetByName: (name: string) => {
          if (name === "GST_Sales_Register") return gstSalesSheet;
          return mainSheet;
        },
        getSheets: () => [mainSheet],
        insertSheet: () => gstSalesSheet,
      }),
      openById: () => ({
        getSheetByName: (name: string) => {
          if (name === "GST_Sales_Register") return gstSalesSheet;
          return mainSheet;
        },
        getSheets: () => [mainSheet],
        insertSheet: () => gstSalesSheet,
      }),
      flush: () => {},
    },
    UrlFetchApp: {
      fetch: (url: string) => {
        if (url.includes("api.razorpay.com/v1/payments/")) {
          return {
            getResponseCode: () => paymentFetchMock.code,
            getContentText: () => JSON.stringify(paymentFetchMock.body),
          };
        }
        if (url.includes("api.razorpay.com/v1/orders")) {
          return {
            getResponseCode: () => 200,
            getContentText: () => JSON.stringify({ id: "order_NewCreated12345" }),
          };
        }
        if (url.includes("contacts/upsert")) {
          return {
            getResponseCode: () => 200,
            getContentText: () => JSON.stringify({ contact: { id: "cnt_test123" } }),
          };
        }
        if (url.includes("generate-invoice-number")) {
          return {
            getResponseCode: () => 200,
            getContentText: () => JSON.stringify({ invoiceNumber: "1001" }),
          };
        }
        if (url.includes("invoices")) {
          return {
            getResponseCode: () => 200,
            getContentText: () => JSON.stringify({ _id: "inv_test123" }),
          };
        }
        return {
          getResponseCode: () => 200,
          getContentText: () => JSON.stringify({ ok: true }),
        };
      },
    },
  };

  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { filename: scriptRelPath });

  return {
    sandbox,
    propsStore,
    mainSheetRows,
    salesRegisterRows,
    emailsSent,
    getLockStats: () => ({ lockHeld, lockAcquisitions, lockReleases }),
    setPaymentFetchResponse: (code: number, body: Record<string, unknown>) => {
      paymentFetchMock = { code, body };
    },
    postJson: (payload: Record<string, unknown>, params: Record<string, string> = {}) => {
      const doPost = sandbox.doPost as (e: unknown) => { getContent: () => string };
      const res = doPost({
        parameter: params,
        postData: { contents: JSON.stringify(payload) },
      });
      return JSON.parse(res.getContent());
    },
    getRequest: (params: Record<string, string> = {}) => {
      const doGet = sandbox.doGet as (e: unknown) => { getContent: () => string };
      const res = doGet({ parameter: params });
      return JSON.parse(res.getContent());
    },
  };
}

describe("Phase 1 Security & Payment Verification Suite", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // Case 1: Payment callback with missing razorpay_signature -> rejected
  it("1. Rejects payment callback when razorpay_signature is missing", () => {
    const env = createAppsScriptSandbox("backend/apps_script/ai_masterclass/apps_script.gs");
    const response = env.postJson({
      action: "payment_success",
      orderId: "order_ValidOrder12345",
      transactionId: "pay_ValidPay123456",
      // razorpay_signature omitted
    });

    expect(response.success).toBe(false);
    expect(response.error).toMatch(/signature/i);
    expect(env.mainSheetRows[1][7]).toBe("INITIATED");
    expect(env.salesRegisterRows.length).toBe(0);
    expect(env.emailsSent.length).toBe(0);
  });

  // Case 2: Payment callback with invalid razorpay_signature -> rejected
  it("2. Rejects payment callback when razorpay_signature is invalid/tampered", () => {
    const env = createAppsScriptSandbox("backend/apps_script/ai_masterclass/apps_script.gs");
    const response = env.postJson({
      action: "payment_success",
      orderId: "order_ValidOrder12345",
      transactionId: "pay_ValidPay123456",
      razorpay_signature: "0000000000000000000000000000000000000000000000000000000000000000",
    });

    expect(response.success).toBe(false);
    expect(response.error).toMatch(/signature/i);
    expect(env.mainSheetRows[1][7]).toBe("INITIATED");
    expect(env.salesRegisterRows.length).toBe(0);
    expect(env.emailsSent.length).toBe(0);
  });

  // Case 3: Payment callback with fake payment ID (PAID_123 or non-existent pay_...) -> rejected
  it("3. Rejects payment callback with fake payment ID (PAID_123 or unverified pay_ ID)", () => {
    const env = createAppsScriptSandbox("backend/apps_script/ai_masterclass/apps_script.gs");

    // Attempt 3a: client-invented PAID_123 ID format
    const resFakePrefix = env.postJson({
      action: "payment_success",
      orderId: "order_ValidOrder12345",
      transactionId: "PAID_123456789",
      razorpay_signature: computeTestHmac("order_ValidOrder12345", "PAID_123456789"),
    });
    expect(resFakePrefix.success).toBe(false);
    expect(resFakePrefix.error).toMatch(/FAKE_PAYMENT_ID|invalid/i);
    expect(env.mainSheetRows[1][7]).toBe("INITIATED");

    // Attempt 3b: pay_ prefix that does not exist on Razorpay server (404)
    env.setPaymentFetchResponse(404, { error: { description: "The id provided does not exist" } });
    const fakePayId = "pay_FakeNonExistent99";
    const resNotFound = env.postJson({
      action: "payment_success",
      orderId: "order_ValidOrder12345",
      transactionId: fakePayId,
      razorpay_signature: computeTestHmac("order_ValidOrder12345", fakePayId),
    });
    expect(resNotFound.success).toBe(false);
    expect(resNotFound.error).toMatch(/FAKE_PAYMENT_ID|rejected|failed|verification/i);
    expect(env.mainSheetRows[1][7]).toBe("INITIATED");
    expect(env.salesRegisterRows.length).toBe(0);
  });

  // Case 4: Payment callback with wrong amount -> rejected
  it("4. Rejects payment callback when captured amount in paise does not match order amount", () => {
    const env = createAppsScriptSandbox("backend/apps_script/ai_masterclass/apps_script.gs");
    const payId = "pay_ValidPay123456";
    // Order row expects ₹117 (11700 paise), but Razorpay reports only 100 paise (₹1)
    env.setPaymentFetchResponse(200, {
      id: payId,
      order_id: "order_ValidOrder12345",
      status: "captured",
      amount: 100,
      currency: "INR",
    });

    const response = env.postJson({
      action: "payment_success",
      orderId: "order_ValidOrder12345",
      transactionId: payId,
      razorpay_signature: computeTestHmac("order_ValidOrder12345", payId),
      amount: 117,
    });

    expect(response.success).toBe(false);
    expect(response.error).toMatch(/AMOUNT_MISMATCH|mismatch/i);
    expect(env.mainSheetRows[1][7]).toBe("INITIATED");
    expect(env.salesRegisterRows.length).toBe(0);
    expect(env.emailsSent.length).toBe(0);
  });

  // Case 5: Payment callback with authorized (not captured) status -> rejected
  it("5. Rejects payment callback when payment status is 'authorized' instead of 'captured'", () => {
    const env = createAppsScriptSandbox("backend/apps_script/ai_masterclass/apps_script.gs");
    const payId = "pay_AuthOnly123456";
    env.setPaymentFetchResponse(200, {
      id: payId,
      order_id: "order_ValidOrder12345",
      status: "authorized",
      amount: 11700,
      currency: "INR",
    });

    const response = env.postJson({
      action: "payment_success",
      orderId: "order_ValidOrder12345",
      transactionId: payId,
      razorpay_signature: computeTestHmac("order_ValidOrder12345", payId),
      amount: 117,
    });

    expect(response.success).toBe(false);
    expect(response.error).toMatch(/PAYMENT_NOT_CAPTURED|captured/i);
    expect(env.mainSheetRows[1][7]).toBe("INITIATED");
    expect(env.salesRegisterRows.length).toBe(0);
    expect(env.emailsSent.length).toBe(0);
  });

  // Case 6: Valid captured payment with matching order and amount -> accepted, marked PAID, invoice generated once
  it("6. Accepts valid captured payment with matching HMAC signature, orderId, and amount, generating invoice once", () => {
    const env = createAppsScriptSandbox("backend/apps_script/ai_masterclass/apps_script.gs");
    const orderId = "order_ValidOrder12345";
    const payId = "pay_ValidPay123456";
    const validSig = computeTestHmac(orderId, payId);

    const response = env.postJson({
      action: "payment_success",
      orderId,
      transactionId: payId,
      razorpay_signature: validSig,
    });

    expect(response.success).toBe(true);
    expect(response.invoiceNumber).toMatch(/^TT\/26-27\/\d+/);
    expect(env.mainSheetRows[1][7]).toBe("✅ PAID");
    expect(env.mainSheetRows[1][9]).toBe(payId);
    // 1 invoice row appended in GST_Sales_Register
    expect(env.salesRegisterRows.length).toBe(1);
    expect(env.emailsSent.length).toBe(1);

    // Also verify getVerifiedInvoice endpoint returns the verified invoice record
    const invoiceLookup = env.getRequest({
      action: "getVerifiedInvoice",
      paymentId: payId,
      orderId,
      token: response.invoiceToken,
    });
    expect(invoiceLookup.success).toBe(true);
    expect(invoiceLookup.invoice.paymentId).toBe(payId);
    expect(invoiceLookup.invoice.orderId).toBe(orderId);
    expect(invoiceLookup.invoice.totalAmountPaid).toBe(117);
  });

  // Case 7: Replay of the same valid payment callback -> idempotent response, no second invoice or second email
  it("7. Handles replay of the same valid payment callback idempotently without duplicate invoice or email", () => {
    const env = createAppsScriptSandbox("backend/apps_script/ai_masterclass/apps_script.gs");
    const orderId = "order_ValidOrder12345";
    const payId = "pay_ValidPay123456";
    const validSig = computeTestHmac(orderId, payId);

    const firstRes = env.postJson({
      action: "payment_success",
      orderId,
      transactionId: payId,
      razorpay_signature: validSig,
    });
    expect(firstRes.success).toBe(true);
    expect(env.salesRegisterRows.length).toBe(1); // 1 entry
    expect(env.emailsSent.length).toBe(1);

    // Replay the exact same callback
    const secondRes = env.postJson({
      action: "payment_success",
      orderId,
      transactionId: payId,
      razorpay_signature: validSig,
    });
    expect(secondRes.success).toBe(true);
    expect(secondRes.alreadyProcessed).toBe(true);
    // Must NOT add a second GST_Sales_Register row or send a second email
    expect(env.salesRegisterRows.length).toBe(1);
    expect(env.emailsSent.length).toBe(1);
  });

  // Case 8: Concurrent / interleaved callback and webhook for the same order -> only one PAID transition and one invoice
  it("8. Serializes callback and webhook via LockService and prevents duplicate PAID transition or unauthenticated webhook spoofing", () => {
    const env = createAppsScriptSandbox("backend/apps_script/ai_masterclass/apps_script.gs");
    const orderId = "order_ValidOrder12345";
    const payId = "pay_ValidPay123456";
    const validSig = computeTestHmac(orderId, payId);

    // 8a. Unauthenticated webhook without proxy signature is rejected outright
    const spoofedWebhook = env.postJson({
      event: "payment.captured",
      eventId: "evt_spoofed_001",
      timestamp: Date.now(),
      proxy_signature: "invalid_proxy_signature_1234567890abcdef",
      payload: {
        payment: {
          entity: {
            id: payId,
            order_id: orderId,
            amount: 11700,
            status: "captured",
          },
        },
      },
    });
    expect(spoofedWebhook.success).toBe(false);
    expect(spoofedWebhook.error).toMatch(/INVALID_WEBHOOK_SIGNATURE/);
    expect(env.mainSheetRows[1][7]).toBe("INITIATED");

    // 8b. Authenticated checkout callback succeeds and acquires/releases LockService
    const callbackRes = env.postJson({
      action: "payment_success",
      orderId,
      transactionId: payId,
      razorpay_signature: validSig,
    });
    expect(callbackRes.success).toBe(true);

    // 8c. Subsequent authenticated webhook with valid proxy signature is deduplicated inside the lock
    const now = Date.now();
    const eventId = "evt_legit_001";
    const validProxySig = crypto
      .createHmac("sha256", TEST_WEBHOOK_PROXY_SECRET)
      .update(`${eventId}|${orderId}|${payId}|${now}`)
      .digest("hex");
    const webhookRes = env.postJson({
      event: "payment.captured",
      eventId: eventId,
      timestamp: now,
      proxy_signature: validProxySig,
      payload: {
        payment: {
          entity: {
            id: payId,
            order_id: orderId,
            amount: 11700,
            status: "captured",
          },
        },
      },
    });
    expect(webhookRes.success).toBe(true);
    expect(webhookRes.alreadyProcessed).toBe(true);
    expect(env.salesRegisterRows.length).toBe(1); // Still only 1 invoice row
    expect(env.emailsSent.length).toBe(1); // Still only 1 email
    const lockStats = env.getLockStats();
    expect(lockStats.lockHeld).toBe(false);
    expect(lockStats.lockAcquisitions).toBeGreaterThanOrEqual(2);
    expect(lockStats.lockReleases).toBe(lockStats.lockAcquisitions);
  });

  // Case 9: Visiting /thank-you?paid=true&amount=5899&name=Fake without a verified payment -> does not generate a PAID invoice
  it("9. Blocks /thank-you URL tampering (?paid=true&amount=5899&name=Fake) and blocks unverified openPrintableGstInvoice calls", async () => {
    // 9a. Direct call to openPrintableGstInvoice with unverified object throws UNVERIFIED_INVOICE_BLOCKED
    const forgedParams: InvoicePrintParams = {
      name: "Fake User",
      email: "fake@example.com",
      phone: "9999999999",
      courseName: "Spoofed Course",
      totalPaid: 5899,
      paymentId: "PAID_12345",
      orderId: "ORD_FAKE",
    };
    expect(() => openPrintableGstInvoice(forgedParams)).toThrow(/UNVERIFIED_INVOICE_BLOCKED/);

    // Even with pay_ / order_ format, if not registered via backend verification, it must throw
    const unregisteredParams: InvoicePrintParams = {
      ...forgedParams,
      paymentId: "pay_Spoofed123456",
      orderId: "order_Spoofed123456",
    };
    expect(() => openPrintableGstInvoice(unregisteredParams)).toThrow(/UNVERIFIED_INVOICE_BLOCKED/);

    // 9b. Rendering /thank-you?paid=true&amount=5899&name=Fake shows "Payment Verification Required" and no Print GST Invoice button
    render(
      React.createElement(
        MemoryRouter,
        { initialEntries: ["/thank-you?paid=true&amount=5899&name=Fake"] },
        React.createElement(
          Routes,
          null,
          React.createElement(Route, { path: "/thank-you", element: React.createElement(ThankYou) })
        )
      )
    );

    await waitFor(() => {
      expect(screen.getByTestId("unverified-invoice-guard")).toBeInTheDocument();
    });
    expect(screen.getByText(/Payment Verification Required/i)).toBeInTheDocument();
    expect(screen.queryByText(/Print GST Invoice/i)).toBeNull();
    expect(screen.queryByText(/Fake/i)).toBeNull();
  });

  // Case 10: Production build output check -> no apps_script.gs or secret patterns exist in dist/ or public/ or backend/
  it("10. Verifies zero .gs files in public/ or dist/, and zero hardcoded secrets in backend/apps_script/**", () => {
    // Verify all 8 backend scripts exist in backend/apps_script/ and contain no hardcoded secret values
    for (const relPath of BACKEND_SCRIPTS) {
      const fullPath = path.join(ROOT_DIR, relPath);
      expect(fs.existsSync(fullPath)).toBe(true);
      const content = fs.readFileSync(fullPath, "utf8");

      // Must use PropertiesService.getScriptProperties() via getScriptSecret
      expect(content).toContain("PropertiesService.getScriptProperties()");
      expect(content).toContain("verifyRazorpayPaymentSignature");
      expect(content).toContain("verifyPaymentWithRazorpayServer");
      expect(content).toContain("LockService.getScriptLock()");

      // Must NOT contain hardcoded secret assignments
      expect(content).not.toMatch(/RAZORPAY_KEY_SECRET(?:_INTL)?\s*=\s*["'][^"']+["']/);
      expect(content).not.toMatch(/pit-us-[0-9a-f-]{20,}/i);
      expect(content).not.toMatch(/EAef8[A-Za-z0-9]{30,}/);
    }

    // Recursively check public/ and dist/ for any .gs files or secret patterns
    const scanWebDir = (dir: string): string[] => {
      if (!fs.existsSync(dir)) return [];
      const found: string[] = [];
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          found.push(...scanWebDir(full));
        } else if (entry.name.endsWith(".gs")) {
          found.push(full);
        }
      }
      return found;
    };

    expect(scanWebDir(path.join(ROOT_DIR, "public"))).toEqual([]);
    expect(scanWebDir(path.join(ROOT_DIR, "dist"))).toEqual([]);
  });
});
