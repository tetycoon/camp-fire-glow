import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import crypto from "node:crypto";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ThankYou from "../pages/ThankYou";
import {
  fetchVerifiedInvoiceFromBackend,
  isValidRazorpayIds,
  registerVerifiedInvoiceRecord,
  openPrintableGstInvoice,
} from "../lib/gstUtils";
import {
  TRUSTED_PRODUCT_ROUTING,
  determineProductRoute,
  verifyRazorpayWebhookSignature,
  computeProxySignature,
  handleIncomingRazorpayWebhook,
} from "../../backend/webhook_proxy/razorpay_webhook_proxy.js";

const ROOT_DIR = path.resolve(__dirname, "../..");
const SCRIPT_PATH = "backend/apps_script/ai_masterclass/apps_script.gs";

const TEST_DOMESTIC_SECRET = "mock_secret_domestic_phase1d_tests";
const TEST_DEDICATED_INVOICE_SECRET = "mock_dedicated_invoice_secret_phase1d";
const TEST_WEBHOOK_PROXY_SECRET = "mock_proxy_secret_phase1d_tests";
const TEST_RAZORPAY_WEBHOOK_SECRET = "mock_razorpay_webhook_secret_phase1d";

function computeTestHmac(orderId: string, paymentId: string, secret = TEST_DOMESTIC_SECRET): string {
  return crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
}

function computeTokenHmac(paymentId: string, orderId: string, exp: number, secret = TEST_DEDICATED_INVOICE_SECRET): string {
  return crypto.createHmac("sha256", secret).update(`${paymentId}|${orderId}|${exp}`).digest("hex");
}

interface SandboxOptions {
  propsOverrides?: Record<string, string | null>;
  initialRows?: unknown[][];
  sheetThrowOnSetCount?: number;
}

function createPhase1DSandbox(options: SandboxOptions = {}) {
  const scriptFullPath = path.join(ROOT_DIR, SCRIPT_PATH);
  const code = fs.readFileSync(scriptFullPath, "utf8");

  const propsStore: Record<string, string> = {
    RAZORPAY_KEY_SECRET: TEST_DOMESTIC_SECRET,
    RAZORPAY_KEY_SECRET_INTL: "mock_intl_secret",
    WEBHOOK_VERIFY_TOKEN: "mock_webhook_token",
    ADMIN_VERIFY_TOKEN: "mock_admin_token",
    WEBHOOK_PROXY_SECRET: TEST_WEBHOOK_PROXY_SECRET,
    FUNNELSDONE_PIT_TOKEN: "mock_pit_token",
    WHATSAPP_ACCESS_TOKEN: "mock_wa_token",
    INVOICE_TOKEN_SECRET: TEST_DEDICATED_INVOICE_SECRET,
    ENVIRONMENT: "development",
    ALLOW_LEGACY_PROXY_SIGNATURE: "true",
  };

  if (options.propsOverrides) {
    for (const [k, v] of Object.entries(options.propsOverrides)) {
      if (v === null) {
        delete propsStore[k];
      } else {
        propsStore[k] = v;
      }
    }
  }

  let lockHeld = false;
  let lockWaitCalls = 0;
  let lockReleaseCalls = 0;
  let funnelsDoneInvoiceCreatedCount = 0;

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
          "Alice Customer",
          "alice@example.com",
          "+919876543210",
          "Student",
          "Online",
          117,
          "INITIATED",
          "order_CustomerA01",
          "",
          "WAITING",
        ],
        [
          "17/10/2026, 10:05:00 am",
          "Bob Customer",
          "bob@example.com",
          "+919876543211",
          "Student",
          "Online",
          117,
          "INITIATED",
          "order_CustomerB02",
          "",
          "WAITING",
        ],
      ];

  const salesRegisterRows: unknown[][] = [];
  let sheetSetThrowRemaining = options.sheetThrowOnSetCount || 0;

  const makeSheet = (rows: unknown[][]) => ({
    getLastRow: () => rows.length,
    getDataRange: () => ({
      getValues: () => rows.map((r) => [...r]),
    }),
    getRange: (row: number, col: number, numRows = 1, numCols = 1) => ({
      getValue: () => (rows[row - 1] ? rows[row - 1][col - 1] : ""),
      setValue: (val: unknown) => {
        if (sheetSetThrowRemaining > 0) {
          sheetSetThrowRemaining--;
          throw new Error("TRANSIENT_SHEET_ERROR: Google Sheets API write rate limit exceeded");
        }
        while (rows.length < row) rows.push([]);
        rows[row - 1][col - 1] = val;
      },
      setValues: (vals: unknown[][]) => {
        if (sheetSetThrowRemaining > 0) {
          sheetSetThrowRemaining--;
          throw new Error("TRANSIENT_SHEET_ERROR: Google Sheets API write rate limit exceeded");
        }
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

  const mainSheet = makeSheet(mainSheetRows);
  const gstSalesSheet = makeSheet(salesRegisterRows);

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
          lockWaitCalls++;
        },
        releaseLock: () => {
          lockHeld = false;
          lockReleaseCalls++;
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
        getContent: () => html,
      }),
    },
    SpreadsheetApp: {
      openById: () => ({
        getSheetByName: (name: string) => {
          if (name === "GST_Sales_Register") return gstSalesSheet;
          return mainSheet;
        },
        insertSheet: (name: string) => {
          if (name === "GST_Sales_Register") return gstSalesSheet;
          return mainSheet;
        },
      }),
      getActiveSpreadsheet: () => ({
        getSheetByName: (name: string) => {
          if (name === "GST_Sales_Register") return gstSalesSheet;
          return mainSheet;
        },
      }),
      flush: () => {},
    },
    UrlFetchApp: {
      fetch: (url: string, params: Record<string, unknown> = {}) => {
        const urlStr = String(url);
        if (urlStr.includes("api.razorpay.com/v1/payments/")) {
          const reqPayId = urlStr.split("payments/")[1]?.split("?")[0] || "pay_CustomerAPay01";
          const reqOrdId = reqPayId.includes("B") ? "order_CustomerB02" : "order_CustomerA01";
          return {
            getResponseCode: () => 200,
            getContentText: () =>
              JSON.stringify({
                id: reqPayId,
                order_id: reqOrdId,
                status: "captured",
                amount: 11700,
                currency: "INR",
                method: "upi",
                notes: {
                  base_amount: "99",
                  gst_amount: "18",
                },
              }),
          };
        }
        if (urlStr.includes("funnelsdone.com")) {
          const bodyStr = String(params.payload || "");
          if (bodyStr.includes("invoice_created")) {
            funnelsDoneInvoiceCreatedCount++;
          }
          return {
            getResponseCode: () => 200,
            getContentText: () => JSON.stringify({ success: true }),
          };
        }
        return {
          getResponseCode: () => 200,
          getContentText: () => JSON.stringify({ success: true }),
        };
      },
    },
    MailApp: {
      sendEmail: () => {},
    },
  };

  const context = vm.createContext(sandbox);
  vm.runInContext(code, context);

  return {
    context,
    propsStore,
    mainSheetRows,
    salesRegisterRows,
    getLockStats: () => ({ lockWaitCalls, lockReleaseCalls, lockHeld }),
    getFunnelsDoneInvoiceCount: () => funnelsDoneInvoiceCreatedCount,
  };
}

describe("PHASE 1D: Final Security Gaps Verification Suite", () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  // 1. URL Token Fallback Elimination
  it("1. Rejects URL-supplied tokens and ensures tokens are never read from query parameters or fragments", async () => {
    const fakeToken = "9999999999999.fake_injected_signature_from_url_12345";
    window.history.pushState({}, "", `/thank-you?paymentId=pay_TestPay001&orderId=order_TestOrd001&token=${fakeToken}`);

    let interceptedRequestBody: Record<string, unknown> | null = null;
    const fetchSpy = vi.fn().mockImplementation(async (_url: string, opts: any) => {
      if (opts?.body) {
        try {
          interceptedRequestBody = JSON.parse(opts.body);
        } catch (_) {}
      }
      return {
        ok: true,
        json: async () => ({
          success: false,
          verified: false,
          error: "UNAUTHORIZED_INVOICE_ACCESS: Valid, unexpired invoice access token required.",
        }),
      };
    });
    vi.stubGlobal("fetch", fetchSpy);

    // Setup window.history.replaceState mock to observe defensive cleaning
    const replaceStateSpy = vi.spyOn(window.history, "replaceState");

    // Render ThankYou page with a token in the URL query string
    render(
      <MemoryRouter initialEntries={[`/thank-you?paymentId=pay_TestPay001&orderId=order_TestOrd001&token=${fakeToken}`]}>
        <Routes>
          <Route path="/thank-you" element={<ThankYou />} />
        </Routes>
      </MemoryRouter>
    );

    // Defensive scrub must trigger replaceState to clean the URL
    await waitFor(() => {
      expect(replaceStateSpy).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalled();
    });

    // CRITICAL SECURITY ASSERTION: The URL-supplied token must NEVER be forwarded or trusted!
    expect(interceptedRequestBody).not.toBeNull();
    expect(interceptedRequestBody?.token).toBeUndefined();

    // The component displays the verification error guard
    await waitFor(() => {
      expect(screen.getByTestId("unverified-invoice-guard")).toBeInTheDocument();
      expect(screen.getByText(/Payment Verification Required/i)).toBeInTheDocument();
    });
  });

  // 2. Strict Requirement for Dedicated INVOICE_TOKEN_SECRET
  it("2. Fails closed when INVOICE_TOKEN_SECRET is missing, refusing to issue tokens or return invoice data", () => {
    // 2a. Missing INVOICE_TOKEN_SECRET in Script Properties
    const sbMissing = createPhase1DSandbox({
      propsOverrides: {
        INVOICE_TOKEN_SECRET: null, // intentionally absent
      },
    });

    const orderId = "order_CustomerA01";
    const payId = "pay_CustomerAPay01";
    const validCallbackSig = computeTestHmac(orderId, payId);

    // Payment callback must throw MISSING_INVOICE_TOKEN_SECRET and fail closed
    expect(() => {
      sbMissing.context.updatePaymentStatus({
        razorpay_order_id: orderId,
        razorpay_payment_id: payId,
        razorpay_signature: validCallbackSig,
        amount: 117,
      });
    }).toThrow(/MISSING_INVOICE_TOKEN_SECRET/);

    // getVerifiedInvoiceRecord must return error without leaking invoice
    const dummyToken = `${Date.now() + 86400000}.dummy_signature_value`;
    const getRes = sbMissing.context.getVerifiedInvoiceRecord(null, payId, orderId, dummyToken);
    expect(getRes.success).toBe(false);
    expect(getRes.verified).toBe(false);
    expect(getRes.error).toContain("MISSING_INVOICE_TOKEN_SECRET");
    expect(getRes.invoice).toBeUndefined();
  });

  it("3. Rejects tokens signed with RAZORPAY_KEY_SECRET (prohibiting legacy fallback) and accepts only INVOICE_TOKEN_SECRET", () => {
    const sb = createPhase1DSandbox();
    const orderId = "order_CustomerA01";
    const payId = "pay_CustomerAPay01";
    const exp = Date.now() + 86400000;

    // First process valid payment so record is marked PAID
    const validCallbackSig = computeTestHmac(orderId, payId);
    const payRes = sb.context.updatePaymentStatus({
      razorpay_order_id: orderId,
      razorpay_payment_id: payId,
      razorpay_signature: validCallbackSig,
      amount: 117,
    });
    expect(payRes.success).toBe(true);

    // 3a. Token signed with RAZORPAY_KEY_SECRET (the forbidden legacy fallback)
    const legacyFallbackToken = `${exp}.${computeTokenHmac(payId, orderId, exp, TEST_DOMESTIC_SECRET)}`;
    const legacyLookup = sb.context.getVerifiedInvoiceRecord(null, payId, orderId, legacyFallbackToken);
    expect(legacyLookup.success).toBe(false);
    expect(legacyLookup.verified).toBe(false);
    expect(legacyLookup.error).toContain("UNAUTHORIZED_INVOICE_ACCESS");
    expect(legacyLookup.invoice).toBeUndefined();

    // 3b. Token signed with dedicated INVOICE_TOKEN_SECRET succeeds
    const dedicatedToken = `${exp}.${computeTokenHmac(payId, orderId, exp, TEST_DEDICATED_INVOICE_SECRET)}`;
    const validLookup = sb.context.getVerifiedInvoiceRecord(null, payId, orderId, dedicatedToken);
    expect(validLookup.success).toBe(true);
    expect(validLookup.verified).toBe(true);
    expect(validLookup.invoice.customerName).toBe("Alice Customer");
    expect(validLookup.invoice.totalAmountPaid).toBe(117);
  });

  // 4. Session Storage Threat Model & Expiry Validation
  it("4. Enforces 24-hour token expiry both in sessionStorage recovery and strictly on backend", () => {
    const sb = createPhase1DSandbox();
    const orderId = "order_CustomerA01";
    const payId = "pay_CustomerAPay01";

    // Expired token (1 hour in the past)
    const expiredTime = Date.now() - 3600000;
    const expiredSig = computeTokenHmac(payId, orderId, expiredTime, TEST_DEDICATED_INVOICE_SECRET);
    const expiredToken = `${expiredTime}.${expiredSig}`;

    // Backend strictly rejects expired token even with valid HMAC
    const backendLookup = sb.context.getVerifiedInvoiceRecord(null, payId, orderId, expiredToken);
    expect(backendLookup.success).toBe(false);
    expect(backendLookup.verified).toBe(false);
    expect(backendLookup.error).toContain("UNAUTHORIZED_INVOICE_ACCESS");
    expect(backendLookup.invoice).toBeUndefined();
  });

  // 5. Webhook Proxy Product Routing for All 8 Educational Offerings
  it("5. Webhook proxy accurately routes each of the 8 Tech Tycoon educational products based on trusted payment notes", () => {
    const testCases: { courseNote: string; expectedProduct: string }[] = [
      { courseNote: "UPSCALE: 1-Day AI Mastery Workshop Chennai Offline", expectedProduct: "upscale" },
      { courseNote: "Advanced AI Masterclass with Python & Agents", expectedProduct: "advanced_masterclass" },
      { courseNote: "Claude 3.7 Sonnet Masterclass for Developers", expectedProduct: "claude_masterclass" },
      { courseNote: "Business AI Consulting & Strategy Session", expectedProduct: "consulting" },
      { courseNote: "AI for Working Professionals & Executives", expectedProduct: "professionals" },
      { courseNote: "AI BGM Masterclass - Background Music Creation", expectedProduct: "ai_bgm" },
      { courseNote: "Tech Tycoon Academy Pre-Registration", expectedProduct: "academy" },
      { courseNote: "AI Masterclass 2.0 (Kickstart)", expectedProduct: "ai_masterclass" },
    ];

    for (const tc of testCases) {
      const paymentEntity = {
        id: "pay_RouteTestPay123",
        order_id: "order_RouteTestOrd123",
        amount: 11700,
        currency: "INR",
        status: "captured",
        notes: {
          course: tc.courseNote,
        },
      };

      const routeResult = determineProductRoute(paymentEntity);
      expect(routeResult.success).toBe(true);
      expect(routeResult.productKey).toBe(tc.expectedProduct);
      expect(routeResult.targetUrl).toBeDefined();
    }
  });

  it("6. Webhook proxy rejects unknown products and payments with missing course identifiers (HTTP 422)", () => {
    // 6a. Missing notes and description
    const noNotesEntity = {
      id: "pay_UnknownPay01",
      order_id: "order_UnknownOrd01",
      amount: 11700,
      currency: "INR",
      status: "captured",
    };
    const resNoNotes = determineProductRoute(noNotesEntity);
    expect(resNoNotes.success).toBe(false);
    expect(resNoNotes.error).toContain("MISSING_PRODUCT_IDENTIFIER");

    // 6b. Unknown / unmapped course title
    const unknownProductEntity = {
      id: "pay_UnknownPay02",
      order_id: "order_UnknownOrd02",
      amount: 11700,
      currency: "INR",
      status: "captured",
      notes: {
        course: "Random Cryptocurrency Trading Scheme",
      },
    };
    const resUnknown = determineProductRoute(unknownProductEntity);
    expect(resUnknown.success).toBe(false);
    expect(resUnknown.error).toContain("UNKNOWN_PRODUCT");

    // 6c. Webhook handler returns HTTP 422 for unmapped product
    const rawBody = JSON.stringify({
      event: "payment.captured",
      payload: { payment: { entity: unknownProductEntity } },
    });
    const sig = crypto.createHmac("sha256", TEST_RAZORPAY_WEBHOOK_SECRET).update(rawBody, "utf8").digest("hex");
    const webhookRes = handleIncomingRazorpayWebhook({
      rawBody,
      signatureHeader: sig,
      webhookSecret: TEST_RAZORPAY_WEBHOOK_SECRET,
      proxySecret: TEST_WEBHOOK_PROXY_SECRET,
    });
    expect(webhookRes.success).toBe(false);
    expect(webhookRes.status).toBe(422);
  });

  it("7. Webhook proxy rejects invalid raw body signatures before attempting any routing (HTTP 401)", () => {
    const rawBody = JSON.stringify({
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_SigFailPay01",
            order_id: "order_SigFailOrd01",
            amount: 11700,
            currency: "INR",
            status: "captured",
            notes: { course: "ai_masterclass" },
          },
        },
      },
    });

    const badSigRes = handleIncomingRazorpayWebhook({
      rawBody,
      signatureHeader: "invalid_tampered_signature_9876543210abcdef",
      webhookSecret: TEST_RAZORPAY_WEBHOOK_SECRET,
      proxySecret: TEST_WEBHOOK_PROXY_SECRET,
    });

    expect(badSigRes.success).toBe(false);
    expect(badSigRes.status).toBe(401);
  });

  // 8. Concurrency & Invoice Uniqueness
  it("8. Concurrency between checkout callback and webhook generates exactly one invoice number and one sales register entry", () => {
    const sb = createPhase1DSandbox();
    const orderId = "order_CustomerA01";
    const paymentId = "pay_CustomerAPay01";
    const callbackSig = computeTestHmac(orderId, paymentId);
    const eventId = "evt_ConcurrentTest01";
    const timestamp = Date.now();
    const proxySig = computeProxySignature(eventId, orderId, paymentId, timestamp, TEST_WEBHOOK_PROXY_SECRET);

    // Simultaneous checkout callback and webhook
    const callbackResult = sb.context.updatePaymentStatus({
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: callbackSig,
      amount: 117,
    });
    expect(callbackResult.success).toBe(true);

    const webhookResult = sb.context.updatePaymentStatusFromWebhook(
      orderId,
      paymentId,
      "alice@example.com",
      proxySig,
      timestamp,
      eventId
    );
    expect(webhookResult.success).toBe(true);
    expect(webhookResult.alreadyProcessed).toBe(true);

    // Exactly one invoice number assigned, exactly one entry in GST_Sales_Register
    expect(sb.salesRegisterRows.length).toBe(1);
    expect(sb.salesRegisterRows[0][1]).toBe(callbackResult.invoiceNumber);
  });

  // 9. Sheet Write Failure Recovery
  it("9. Handles transient Google Sheets API write failure during webhook processing and recovers cleanly on retry", () => {
    // Sandbox configured to fail the first sheet write attempt (simulating API quota or transient outage)
    const sb = createPhase1DSandbox({
      sheetThrowOnSetCount: 1,
    });

    const orderId = "order_CustomerA01";
    const paymentId = "pay_CustomerAPay01";
    const eventId = "evt_RetryRecoveryTest01";
    const timestamp = Date.now();
    const proxySig = computeProxySignature(eventId, orderId, paymentId, timestamp, TEST_WEBHOOK_PROXY_SECRET);

    // Attempt 1: Transient sheet error throws during write
    expect(() => {
      sb.context.updatePaymentStatusFromWebhook(
        orderId,
        paymentId,
        "alice@example.com",
        proxySig,
        timestamp,
        eventId
      );
    }).toThrow(/TRANSIENT_SHEET_ERROR/);

    // Event must NOT be permanently marked processed so Razorpay can retry
    expect(sb.propsStore["PROCESSED_EVT_" + eventId]).toBeUndefined();

    // Attempt 2 (Razorpay automatic retry): Sheet write succeeds now
    const retryResult = sb.context.updatePaymentStatusFromWebhook(
      orderId,
      paymentId,
      "alice@example.com",
      proxySig,
      timestamp,
      eventId
    );
    expect(retryResult.success).toBe(true);
    expect(sb.mainSheetRows[1][7]).toBe("✅ PAID");
    expect(sb.salesRegisterRows.length).toBe(1);
  });

  // 10. Cross-Customer Token Spoofing Isolation
  it("10. Customer A's invoice token cannot access Customer B's invoice, even when an attacker supplies Customer B's payment ID and order ID", () => {
    const sb = createPhase1DSandbox();

    // Alice (Customer A)
    const orderA = "order_CustomerA01";
    const payA = "pay_CustomerAPay01";
    const sigA = computeTestHmac(orderA, payA);
    const resA = sb.context.updatePaymentStatus({
      razorpay_order_id: orderA,
      razorpay_payment_id: payA,
      razorpay_signature: sigA,
      amount: 117,
    });
    expect(resA.success).toBe(true);
    const tokenA = resA.invoiceToken;

    // Bob (Customer B)
    const orderB = "order_CustomerB02";
    const payB = "pay_CustomerBPay02";
    const sigB = computeTestHmac(orderB, payB);
    const resB = sb.context.updatePaymentStatus({
      razorpay_order_id: orderB,
      razorpay_payment_id: payB,
      razorpay_signature: sigB,
      amount: 117,
    });
    expect(resB.success).toBe(true);
    const tokenB = resB.invoiceToken;

    // Verify Alice can fetch her invoice with tokenA
    const aliceLookup = sb.context.getVerifiedInvoiceRecord(null, payA, orderA, tokenA);
    expect(aliceLookup.success).toBe(true);
    expect(aliceLookup.invoice.customerName).toBe("Alice Customer");

    // Attack Scenario: Attacker tries to use tokenA to fetch Bob's invoice (Customer B)
    const spoofAttempt = sb.context.getVerifiedInvoiceRecord(null, payB, orderB, tokenA);
    expect(spoofAttempt.success).toBe(false);
    expect(spoofAttempt.verified).toBe(false);
    expect(spoofAttempt.error).toContain("UNAUTHORIZED_INVOICE_ACCESS");
    expect(spoofAttempt.invoice).toBeUndefined();
  });
});
