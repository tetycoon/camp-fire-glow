import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import crypto from "node:crypto";
import {
  handleIncomingRazorpayWebhook,
  verifyRazorpayWebhookSignature,
} from "../../backend/webhook_proxy/razorpay_webhook_proxy.js";

const ROOT_DIR = path.resolve(__dirname, "../..");
const SCRIPT_PATH = "backend/apps_script/ai_masterclass/apps_script.gs";

const TEST_DOMESTIC_SECRET = "mock_secret_domestic_phase1b_unit_tests";
const TEST_WEBHOOK_PROXY_SECRET = "mock_proxy_secret_phase1b_unit_tests";
const TEST_RAZORPAY_WEBHOOK_SECRET = "mock_rzp_webhook_secret_phase1b";

function computeTestHmac(orderId: string, paymentId: string, secret = TEST_DOMESTIC_SECRET): string {
  return crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
}

function computeProxyHmac(eventId: string, orderId: string, paymentId: string, timestamp: number, secret = TEST_WEBHOOK_PROXY_SECRET): string {
  return crypto.createHmac("sha256", secret).update(`${eventId}|${orderId}|${paymentId}|${timestamp}`).digest("hex");
}

interface SandboxOptions {
  propsOverrides?: Record<string, string | null>;
  razorpayStatusCode?: number;
  razorpayResponseData?: Record<string, unknown>;
  sheetThrowOnSetCount?: number;
}

function createPhase1BSandbox(options: SandboxOptions = {}) {
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
    INVOICE_TOKEN_SECRET: "mock_dedicated_invoice_token_secret",
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
  let sheetSetThrowsRemaining = options.sheetThrowOnSetCount ?? 0;

  const mainSheetRows: unknown[][] = [
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
      "John Doe",
      "john.doe@example.com",
      "+919876543210",
      "Professional",
      "Online Session (Live)",
      117,
      "INITIATED",
      "order_Phase1BTest01",
      "",
      "WAITING",
    ],
  ];

  const gstSalesRows: unknown[][] = [
    [
      "Timestamp",
      "Invoice No",
      "Invoice Date",
      "Customer Name",
      "Customer Email",
      "Customer Phone",
      "Place of Supply",
      "Supply Type",
      "Reverse Charge",
      "SAC Code",
      "Service Description",
      "Taxable Value (₹)",
      "CGST Rate (%)",
      "CGST Amount (₹)",
      "SGST Rate (%)",
      "SGST Amount (₹)",
      "Round Off (₹)",
      "Total Invoice Value (₹)",
      "Payment ID",
      "Order ID",
    ],
  ];

  const makeSheet = (rows: unknown[][], isGst = false) => ({
    getName: () => (isGst ? "GST_Sales_Register" : "Masterclass_Registrations"),
    getLastRow: () => rows.length,
    getDataRange: () => ({
      getValues: () => rows.map((r) => [...r]),
    }),
    getRange: (row: number, col: number, numRows = 1, numCols = 1) => ({
      getValue: () => (rows[row - 1] ? rows[row - 1][col - 1] : ""),
      setValue: (val: unknown) => {
        if (!isGst && sheetSetThrowsRemaining > 0) {
          sheetSetThrowsRemaining--;
          throw new Error("GOOGLE_SHEETS_QUOTA_EXCEEDED: Simulated temporary outage");
        }
        while (rows.length < row) rows.push([]);
        rows[row - 1][col - 1] = val;
      },
      setValues: (vals: unknown[][]) => {
        if (!isGst && sheetSetThrowsRemaining > 0) {
          sheetSetThrowsRemaining--;
          throw new Error("GOOGLE_SHEETS_QUOTA_EXCEEDED: Simulated temporary outage");
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

  const mainSheet = makeSheet(mainSheetRows, false);
  const gstSalesSheet = makeSheet(gstSalesRows, true);

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
    Logger: { log: () => {} },
    PropertiesService: {
      getScriptProperties: () => ({
        getProperty: (key: string) => (key in propsStore ? propsStore[key] : null),
        setProperty: (key: string, val: string) => {
          propsStore[key] = String(val);
        },
        deleteProperty: (key: string) => {
          delete propsStore[key];
        },
      }),
    },
    LockService: {
      getScriptLock: () => ({
        waitLock: () => {
          lockWaitCalls++;
          if (lockHeld) {
            throw new Error("LOCK_CONTENTION: Script lock already held by concurrent worker");
          }
          lockHeld = true;
        },
        releaseLock: () => {
          lockReleaseCalls++;
          lockHeld = false;
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
          setName: () => ({}),
        }),
      }),
    },
    SpreadsheetApp: {
      getActiveSpreadsheet: () => ({
        getSheetByName: (name: string) => (name === "GST_Sales_Register" ? gstSalesSheet : mainSheet),
        getSheets: () => [mainSheet, gstSalesSheet],
        insertSheet: (name: string) => (name === "GST_Sales_Register" ? gstSalesSheet : mainSheet),
      }),
      flush: () => {},
    },
    UrlFetchApp: {
      fetch: (url: string, fetchOptions: { method?: string; headers?: Record<string, string>; payload?: string } = {}) => {
        const urlStr = String(url);

        if (urlStr.includes("api.razorpay.com/v1/payments/")) {
          const status = options.razorpayStatusCode ?? 200;
          if (status !== 200) {
            return {
              getResponseCode: () => status,
              getContentText: () => JSON.stringify({ error: { description: "Invalid payment" } }),
            };
          }
          return {
            getResponseCode: () => 200,
            getContentText: () =>
              JSON.stringify(
                options.razorpayResponseData || {
                  id: "pay_Phase1BPay01",
                  order_id: "order_Phase1BTest01",
                  status: "captured",
                  amount: 11700,
                  currency: "INR",
                }
              ),
          };
        }

        if (urlStr.includes("/contacts/upsert")) {
          return {
            getResponseCode: () => 200,
            getContentText: () => JSON.stringify({ contact: { id: "contact_mock_fd_01" } }),
          };
        }
        if (urlStr.includes("/invoices/generate-invoice-number")) {
          return {
            getResponseCode: () => 200,
            getContentText: () => JSON.stringify({ invoiceNumber: "991122" }),
          };
        }
        if (urlStr.includes("/invoices/") && !urlStr.includes("/record-payment") && fetchOptions.method === "post") {
          funnelsDoneInvoiceCreatedCount++;
          return {
            getResponseCode: () => 200,
            getContentText: () => JSON.stringify({ _id: "inv_fd_phase1b_001", total: 117 }),
          };
        }

        return {
          getResponseCode: () => 200,
          getContentText: () => "{}",
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
    gstSalesRows,
    getLockMetrics: () => ({ lockHeld, lockWaitCalls, lockReleaseCalls }),
    setLockHeld: (held: boolean) => {
      lockHeld = held;
    },
    getFunnelsDoneInvoiceCount: () => funnelsDoneInvoiceCreatedCount,
  };
}

describe("PHASE 1B: Final Security Verification Suite", () => {
  // 1. Time-limited token expiry check
  it("1. Generates time-limited invoice tokens and strictly rejects expired or tampered tokens", () => {
    const sb = createPhase1BSandbox();
    const orderId = "order_Phase1BTest01";
    const paymentId = "pay_Phase1BPay01";
    const validSig = computeTestHmac(orderId, paymentId);

    const paymentResult = sb.context.updatePaymentStatus({
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: validSig,
      amount: 117,
    });

    expect(paymentResult.success).toBe(true);
    const token = paymentResult.invoiceToken;
    expect(token).toBeDefined();
    expect(token).toMatch(/^\d+\.[a-f0-9]{64}$/); // <exp>.<hmacSha256>

    // 1a. Unexpired valid token succeeds
    const legitResult = sb.context.getVerifiedInvoiceRecord(null, paymentId, orderId, token);
    expect(legitResult.success).toBe(true);
    expect(legitResult.verified).toBe(true);
    expect(legitResult.invoice.customerName).toBe("John Doe");

    // 1b. Expired token (expiry timestamp in the past) is strictly rejected
    const expiredExp = Date.now() - 60000; // 1 minute in the past
    const expiredSig = crypto.createHmac("sha256", TEST_DOMESTIC_SECRET).update(`${paymentId}|${orderId}|${expiredExp}`).digest("hex");
    const expiredToken = `${expiredExp}.${expiredSig}`;
    const expiredResult = sb.context.getVerifiedInvoiceRecord(null, paymentId, orderId, expiredToken);
    expect(expiredResult.success).toBe(false);
    expect(expiredResult.error).toContain("UNAUTHORIZED_INVOICE_ACCESS");

    // 1c. Tampered signature is strictly rejected
    const tamperedToken = `${token.split(".")[0]}.0000000000000000000000000000000000000000000000000000000000000000`;
    const tamperedResult = sb.context.getVerifiedInvoiceRecord(null, paymentId, orderId, tamperedToken);
    expect(tamperedResult.success).toBe(false);
    expect(tamperedResult.error).toContain("UNAUTHORIZED_INVOICE_ACCESS");
  });

  // 2. Elimination of unauthenticated PII guessing attack
  it("2. Blocks invoice access when attacker supplies customer email/phone without cryptographic token", () => {
    const sb = createPhase1BSandbox();
    const orderId = "order_Phase1BTest01";
    const paymentId = "pay_Phase1BPay01";
    const validSig = computeTestHmac(orderId, paymentId);

    sb.context.updatePaymentStatus({
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: validSig,
      amount: 117,
    });

    // Attacker knows John Doe's email and order IDs, but has no valid server-signed token
    const guessEmailAttempt = sb.context.getVerifiedInvoiceRecord(
      null,
      paymentId,
      orderId,
      null,
      "john.doe@example.com"
    );
    expect(guessEmailAttempt.success).toBe(false);
    expect(guessEmailAttempt.error).toContain("UNAUTHORIZED_INVOICE_ACCESS");

    // Attacker knows John Doe's phone number
    const guessPhoneAttempt = sb.context.getVerifiedInvoiceRecord(
      null,
      paymentId,
      orderId,
      null,
      "+919876543210"
    );
    expect(guessPhoneAttempt.success).toBe(false);
    expect(guessPhoneAttempt.error).toContain("UNAUTHORIZED_INVOICE_ACCESS");
  });

  // 3. Webhook event deduplication timing: temporary failure does not lose event update
  it("3. Does not permanently mark webhook event processed if payment execution fails temporarily", () => {
    // sheetThrowOnSetCount = 1 causes the first sheet write to throw an exception
    const sb = createPhase1BSandbox({ sheetThrowOnSetCount: 1 });
    const eventId = "evt_temp_fail_001";
    const orderId = "order_Phase1BTest01";
    const paymentId = "pay_Phase1BPay01";
    const timestamp = Date.now();
    const validProxySig = computeProxyHmac(eventId, orderId, paymentId, timestamp);

    // Attempt 1: Spreadsheet write fails
    expect(() => {
      sb.context.updatePaymentStatusFromWebhook(
        orderId,
        paymentId,
        "john.doe@example.com",
        validProxySig,
        timestamp,
        eventId
      );
    }).toThrow("GOOGLE_SHEETS_QUOTA_EXCEEDED");

    // Verify PROCESSED_EVT_<eventId> was NOT set because the operation failed
    expect(sb.propsStore["PROCESSED_EVT_" + eventId]).toBeUndefined();

    // Attempt 2 (Razorpay webhook retry): Sheet write succeeds now
    const retryResult = sb.context.updatePaymentStatusFromWebhook(
      orderId,
      paymentId,
      "john.doe@example.com",
      validProxySig,
      timestamp,
      eventId
    );
    expect(retryResult.success).toBe(true);

    // Now PROCESSED_EVT_<eventId> is safely marked
    expect(sb.propsStore["PROCESSED_EVT_" + eventId]).toBeDefined();

    // Attempt 3 (Subsequent duplicate webhook delivery): Returns alreadyProcessed without re-executing
    const duplicateDelivery = sb.context.updatePaymentStatusFromWebhook(
      orderId,
      paymentId,
      "john.doe@example.com",
      validProxySig,
      timestamp,
      eventId
    );
    expect(duplicateDelivery.success).toBe(true);
    expect(duplicateDelivery.alreadyProcessed).toBe(true);
  });

  // 4. Concurrency between checkout callback and webhook arrival
  it("4. Prevents race condition and duplicate invoice generation when checkout callback and webhook arrive simultaneously", () => {
    const sb = createPhase1BSandbox();
    const orderId = "order_Phase1BTest01";
    const paymentId = "pay_Phase1BPay01";
    const callbackSig = computeTestHmac(orderId, paymentId);
    const eventId = "evt_race_001";
    const timestamp = Date.now();
    const proxySig = computeProxyHmac(eventId, orderId, paymentId, timestamp);

    // 4a. Checkout callback processes first
    const cbRes = sb.context.updatePaymentStatus({
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: callbackSig,
      amount: 117,
    });
    expect(cbRes.success).toBe(true);
    expect(cbRes.invoiceNumber).toBe("TT/26-27/991122");
    expect(sb.getFunnelsDoneInvoiceCount()).toBe(1);

    // 4b. Webhook arrives immediately after
    const wbRes = sb.context.updatePaymentStatusFromWebhook(
      orderId,
      paymentId,
      "john.doe@example.com",
      proxySig,
      timestamp,
      eventId
    );
    expect(wbRes.success).toBe(true);
    expect(wbRes.alreadyProcessed).toBe(true);

    // FunnelsDone invoice was generated exactly ONCE, not duplicated
    expect(sb.getFunnelsDoneInvoiceCount()).toBe(1);
    expect(sb.mainSheetRows[1][7]).toBe("✅ PAID");
  });

  // 5. Verification of Webhook Proxy Raw Body Signature Verification
  it("5. Webhook proxy verifies raw body HMAC against X-Razorpay-Signature and rejects invalid bodies", () => {
    const rawBody = JSON.stringify({
      entity: "event",
      id: "evt_raw_sig_01",
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_Phase1BPay01",
            order_id: "order_Phase1BTest01",
            amount: 11700,
            currency: "INR",
            status: "captured",
            notes: {
              course: "ai_masterclass",
            },
          },
        },
      },
    });

    const validSig = crypto
      .createHmac("sha256", TEST_RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody, "utf8")
      .digest("hex");

    // Success with matching raw body and signature
    const goodResult = handleIncomingRazorpayWebhook({
      rawBody: rawBody,
      signatureHeader: validSig,
      webhookSecret: TEST_RAZORPAY_WEBHOOK_SECRET,
      proxySecret: TEST_WEBHOOK_PROXY_SECRET,
    });
    expect(goodResult.success).toBe(true);
    expect(goodResult.status).toBe(200);

    // Rejection on signature mismatch
    const badSigResult = handleIncomingRazorpayWebhook({
      rawBody: rawBody,
      signatureHeader: "bad_signature_header_value_1234567890abcdef",
      webhookSecret: TEST_RAZORPAY_WEBHOOK_SECRET,
      proxySecret: TEST_WEBHOOK_PROXY_SECRET,
    });
    expect(badSigResult.success).toBe(false);
    expect(badSigResult.status).toBe(401);
  });
});
