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

const TEST_DOMESTIC_SECRET = "mock_secret_domestic_phase1a_unit_tests";
const TEST_WEBHOOK_PROXY_SECRET = "mock_proxy_secret_phase1a_unit_tests";
const TEST_RAZORPAY_WEBHOOK_SECRET = "mock_rzp_webhook_secret_phase1a";

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
  sheetThrowOnSet?: boolean;
}

function createTestSandbox(options: SandboxOptions = {}) {
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
      "Alice Learner",
      "alice@example.com",
      "+919876543210",
      "Professional",
      "Online Session (Live)",
      117,
      "INITIATED",
      "order_Phase1ATest01",
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
        if (options.sheetThrowOnSet && !isGst) {
          throw new Error("GOOGLE_SHEETS_QUOTA_EXCEEDED: Simulated spreadsheet service outage");
        }
        while (rows.length < row) rows.push([]);
        rows[row - 1][col - 1] = val;
      },
      setValues: (vals: unknown[][]) => {
        if (options.sheetThrowOnSet && !isGst) {
          throw new Error("GOOGLE_SHEETS_QUOTA_EXCEEDED: Simulated spreadsheet service outage");
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
      flush: () => {
        if (options.sheetThrowOnSet) {
          throw new Error("SPREADSHEET_FLUSH_FAILED: Google Sheets temporary write error");
        }
      },
    },
    UrlFetchApp: {
      fetch: (url: string, fetchOptions: { method?: string; headers?: Record<string, string>; payload?: string } = {}) => {
        const urlStr = String(url);

        // Razorpay Payment Verification endpoint
        if (urlStr.includes("api.razorpay.com/v1/payments/")) {
          const status = options.razorpayStatusCode ?? 200;
          if (status !== 200) {
            return {
              getResponseCode: () => status,
              getContentText: () => JSON.stringify({ error: { description: "Invalid payment or credentials" } }),
            };
          }
          return {
            getResponseCode: () => 200,
            getContentText: () =>
              JSON.stringify(
                options.razorpayResponseData || {
                  id: "pay_Phase1APay01",
                  order_id: "order_Phase1ATest01",
                  status: "captured",
                  amount: 11700,
                  currency: "INR",
                }
              ),
          };
        }

        // FunnelsDone APIs
        if (urlStr.includes("/contacts/upsert")) {
          return {
            getResponseCode: () => 200,
            getContentText: () => JSON.stringify({ contact: { id: "contact_mock_123" } }),
          };
        }
        if (urlStr.includes("/invoices/generate-invoice-number")) {
          return {
            getResponseCode: () => 200,
            getContentText: () => JSON.stringify({ invoiceNumber: "889901" }),
          };
        }
        if (urlStr.includes("/invoices/") && fetchOptions.method === "post") {
          funnelsDoneInvoiceCreatedCount++;
          return {
            getResponseCode: () => 200,
            getContentText: () => JSON.stringify({ _id: "inv_mock_fd_001", total: 117 }),
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

describe("PHASE 1A: Security Gap Review and Corrections Suite", () => {
  // Test 1: Forged proxy requests (tampered proxy signature, missing proxy secret)
  it("1. Rejects forged proxy requests with tampered signature and fails closed when proxy secret is missing", () => {
    const sb = createTestSandbox();
    const eventId = "evt_tamper_01";
    const orderId = "order_Phase1ATest01";
    const paymentId = "pay_Phase1APay01";
    const timestamp = Date.now();
    const forgedSignature = "0000000000000000000000000000000000000000000000000000000000000000";

    // Tampered signature must throw INVALID_WEBHOOK_SIGNATURE
    expect(() => {
      sb.context.updatePaymentStatusFromWebhook(
        orderId,
        paymentId,
        "alice@example.com",
        forgedSignature,
        timestamp,
        eventId
      );
    }).toThrow("INVALID_WEBHOOK_SIGNATURE");

    // Missing proxy secret must fail closed
    const sbNoSecret = createTestSandbox({
      propsOverrides: { WEBHOOK_PROXY_SECRET: null },
    });
    expect(() => {
      sbNoSecret.context.updatePaymentStatusFromWebhook(
        orderId,
        paymentId,
        "alice@example.com",
        "some_sig",
        timestamp,
        eventId
      );
    }).toThrow(/WEBHOOK_PROXY_SECRET/);
  });

  // Test 2: Invalid original Razorpay webhook signatures (HMAC mismatch on raw body)
  it("2. Verifies Razorpay Webhook signature on raw body and rejects HMAC mismatches", () => {
    const rawBody = JSON.stringify({
      entity: "event",
      id: "evt_raw_001",
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_Phase1APay01",
            order_id: "order_Phase1ATest01",
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

    // Valid raw body and matching header succeeds
    const validResult = handleIncomingRazorpayWebhook({
      rawBody: rawBody,
      signatureHeader: validSig,
      webhookSecret: TEST_RAZORPAY_WEBHOOK_SECRET,
      proxySecret: TEST_WEBHOOK_PROXY_SECRET,
    });
    expect(validResult.success).toBe(true);
    expect(validResult.status).toBe(200);
    expect(validResult.forwardPayload.proxy_signature).toBeDefined();

    // Tampered raw body (e.g. attacker modified amount in payload) must be rejected
    const tamperedBody = rawBody.replace("11700", "100");
    const tamperedResult = handleIncomingRazorpayWebhook({
      rawBody: tamperedBody,
      signatureHeader: validSig,
      webhookSecret: TEST_RAZORPAY_WEBHOOK_SECRET,
      proxySecret: TEST_WEBHOOK_PROXY_SECRET,
    });
    expect(tamperedResult.success).toBe(false);
    expect(tamperedResult.status).toBe(401);
    expect(tamperedResult.error).toContain("INVALID_RAZORPAY_WEBHOOK_SIGNATURE");
  });

  // Test 3: Replayed webhook events (expired timestamp > 5 min, duplicate eventId)
  it("3. Blocks replayed webhook events (expired timestamps > 5 min and duplicate eventIds)", () => {
    const sb = createTestSandbox();
    const eventId = "evt_replay_001";
    const orderId = "order_Phase1ATest01";
    const paymentId = "pay_Phase1APay01";

    // Stale timestamp (10 minutes in the past)
    const staleTimestamp = Date.now() - 600000;
    const staleSig = computeProxyHmac(eventId, orderId, paymentId, staleTimestamp);

    expect(() => {
      sb.context.updatePaymentStatusFromWebhook(
        orderId,
        paymentId,
        "alice@example.com",
        staleSig,
        staleTimestamp,
        eventId
      );
    }).toThrow("REPLAY_EXPIRED_TIMESTAMP");

    // Valid timestamp processes successfully the first time
    const freshTimestamp = Date.now();
    const validSig = computeProxyHmac(eventId, orderId, paymentId, freshTimestamp);
    const firstCall = sb.context.updatePaymentStatusFromWebhook(
      orderId,
      paymentId,
      "alice@example.com",
      validSig,
      freshTimestamp,
      eventId
    );
    expect(firstCall.success).toBe(true);

    // Duplicate eventId with fresh timestamp must return alreadyProcessed without re-executing
    const replayCall = sb.context.updatePaymentStatusFromWebhook(
      orderId,
      paymentId,
      "alice@example.com",
      validSig,
      freshTimestamp,
      eventId
    );
    expect(replayCall.success).toBe(true);
    expect(replayCall.alreadyProcessed).toBe(true);
  });

  // Test 4: Accessing another customer's invoice (wrong auth token or ID guessing)
  it("4. Blocks unauthorized access to invoices via ID guessing and verifies HMAC token or matching contact", () => {
    const sb = createTestSandbox();
    const orderId = "order_Phase1ATest01";
    const paymentId = "pay_Phase1APay01";

    // First process payment so record exists
    const validSig = computeTestHmac(orderId, paymentId);
    const processResult = sb.context.updatePaymentStatus({
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: validSig,
      amount: 117,
    });
    expect(processResult.success).toBe(true);
    const expectedToken = processResult.invoiceToken;

    // Attacker guesses paymentId and orderId without token or contact
    const unauthAttempt = sb.context.getVerifiedInvoiceRecord(
      null,
      paymentId,
      orderId,
      null, // no token
      null  // no contact
    );
    expect(unauthAttempt.success).toBe(false);
    expect(unauthAttempt.error).toContain("UNAUTHORIZED_INVOICE_ACCESS");

    // Attacker provides wrong token
    const wrongTokenAttempt = sb.context.getVerifiedInvoiceRecord(
      null,
      paymentId,
      orderId,
      "9999999999999.deadbeefbadtoken000000000000000000000000000000000000000000000000",
      null
    );
    expect(wrongTokenAttempt.success).toBe(false);
    expect(wrongTokenAttempt.error).toContain("UNAUTHORIZED_INVOICE_ACCESS");

    // Attacker tries to access with expired token
    const expiredTime = Date.now() - 3600000; // 1 hour ago
    const expiredSig = crypto.createHmac("sha256", TEST_DOMESTIC_SECRET).update(`${paymentId}|${orderId}|${expiredTime}`).digest("hex");
    const expiredTokenAttempt = sb.context.getVerifiedInvoiceRecord(
      null,
      paymentId,
      orderId,
      `${expiredTime}.${expiredSig}`,
      null
    );
    expect(expiredTokenAttempt.success).toBe(false);
    expect(expiredTokenAttempt.error).toContain("UNAUTHORIZED_INVOICE_ACCESS");

    // Attacker guesses customer email/phone without cryptographic token -> rejected!
    const unauthContactGuessAttempt = sb.context.getVerifiedInvoiceRecord(
      null,
      paymentId,
      orderId,
      null,
      "alice@example.com"
    );
    expect(unauthContactGuessAttempt.success).toBe(false);
    expect(unauthContactGuessAttempt.error).toContain("UNAUTHORIZED_INVOICE_ACCESS");

    // Legitimate customer with matching unexpired token succeeds
    const legitTokenAttempt = sb.context.getVerifiedInvoiceRecord(
      null,
      paymentId,
      orderId,
      expectedToken,
      null
    );
    expect(legitTokenAttempt.success).toBe(true);
    expect(legitTokenAttempt.verified).toBe(true);
    expect(legitTokenAttempt.invoice.paymentId).toBe(paymentId);
  });

  // Test 5: Simultaneous payment requests (LockService contention)
  it("5. Enforces critical section with LockService and releases lock in finally block", () => {
    const sb = createTestSandbox();
    const orderId = "order_Phase1ATest01";
    const paymentId = "pay_Phase1APay01";
    const validSig = computeTestHmac(orderId, paymentId);

    // Simulate another concurrent worker holding the lock
    sb.setLockHeld(true);

    expect(() => {
      sb.context.updatePaymentStatus({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: validSig,
        amount: 117,
      });
    }).toThrow("LOCK_CONTENTION");

    // Verify lock released and state clean for next request
    sb.setLockHeld(false);
    const res = sb.context.updatePaymentStatus({
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: validSig,
      amount: 117,
    });
    expect(res.success).toBe(true);
    const metrics = sb.getLockMetrics();
    expect(metrics.lockHeld).toBe(false); // Lock must be released
    expect(metrics.lockWaitCalls).toBe(2);
    expect(metrics.lockReleaseCalls).toBe(1);
  });

  // Test 6: Partial failure after invoice creation (FunnelsDone succeeded, but sheet update throws)
  it("6. Handles partial failure gracefully when invoice created but sheet update throws", () => {
    const sb = createTestSandbox({ sheetThrowOnSet: true });
    const orderId = "order_Phase1ATest01";
    const paymentId = "pay_Phase1APay01";
    const validSig = computeTestHmac(orderId, paymentId);

    // Processing will create invoice in FunnelsDone & save to VERIFIED_INV_..., but throw on sheet write
    expect(() => {
      sb.context.updatePaymentStatus({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: validSig,
        amount: 117,
      });
    }).toThrow("GOOGLE_SHEETS_QUOTA_EXCEEDED");

    // Confirm that the invoice record was safely cached in script properties before the crash
    const cachedInv = sb.propsStore["VERIFIED_INV_" + paymentId];
    expect(cachedInv).toBeDefined();
    const parsed = JSON.parse(cachedInv);
    expect(parsed.paymentId).toBe(paymentId);
    expect(parsed.invoiceNumber).toBe("TT/26-27/889901");
  });

  // Test 7: Retry after successful invoice but failed spreadsheet write (recovers existing invoice, zero duplicate rows in GST register)
  it("7. Recovers existing invoice upon retry and prevents duplicate GST Sales Register rows", () => {
    // Step 1: Pre-populate the cache with the invoice generated during the partial failure
    const paymentId = "pay_Phase1APay01";
    const orderId = "order_Phase1ATest01";
    const validSig = computeTestHmac(orderId, paymentId);

    const sb = createTestSandbox({
      propsOverrides: {
        ["VERIFIED_INV_" + paymentId]: JSON.stringify({
          verified: true,
          paymentId: paymentId,
          orderId: orderId,
          invoiceNumber: "TT/26-27/889901",
          customerName: "Alice Learner",
          customerEmail: "alice@example.com",
          customerPhone: "+919876543210",
          courseName: "AI Secrets Revealed Masterclass",
          totalAmountPaid: 117,
        }),
      },
    });

    // Step 2: Retry with normal sheet write functionality
    const retryResult = sb.context.updatePaymentStatus({
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: validSig,
      amount: 117,
    });

    expect(retryResult.success).toBe(true);
    expect(retryResult.invoiceNumber).toBe("TT/26-27/889901");
    // Verify that FunnelsDone was NOT called a second time because existing invoice was recovered
    expect(sb.getFunnelsDoneInvoiceCount()).toBe(0);

    // Step 3: Check appendToGstSalesRegister deduplication
    const acct = sb.context.getInvoiceAccountingBreakdown(117);
    sb.context.appendToGstSalesRegister(
      "TT/26-27/889901",
      "17/10/2026",
      "Alice Learner",
      "alice@example.com",
      "+919876543210",
      "AI Secrets Revealed Masterclass",
      acct,
      paymentId,
      orderId
    );
    // Calling it again with same invoice number & payment ID must not add duplicate rows
    sb.context.appendToGstSalesRegister(
      "TT/26-27/889901",
      "17/10/2026",
      "Alice Learner",
      "alice@example.com",
      "+919876543210",
      "AI Secrets Revealed Masterclass",
      acct,
      paymentId,
      orderId
    );

    // Filter GST rows for this invoice number
    const matchingRows = sb.gstSalesRows.filter(
      (r) => r[1] === "TT/26-27/889901" || r[18] === paymentId
    );
    expect(matchingRows.length).toBe(1); // Exactly one row, no duplicates
  });

  // Test 8: Missing Script Properties (system fails closed with clean error)
  it("8. Fails closed with clean exception when required Script Properties are missing", () => {
    const sb = createTestSandbox({
      propsOverrides: {
        RAZORPAY_KEY_SECRET: null,
      },
    });
    const orderId = "order_Phase1ATest01";
    const paymentId = "pay_Phase1APay01";
    const validSig = computeTestHmac(orderId, paymentId);

    expect(() => {
      sb.context.updatePaymentStatus({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: validSig,
        amount: 117,
      });
    }).toThrow(/RAZORPAY_KEY_SECRET/);
  });

  // Test 9: Wrong Razorpay credentials (API 401/403 fails closed, order stays PENDING)
  it("9. Fails closed on Razorpay API rejection and keeps order status INITIATED", () => {
    const sb = createTestSandbox({
      razorpayStatusCode: 401, // Razorpay rejects credentials or payment
    });
    const orderId = "order_Phase1ATest01";
    const paymentId = "pay_Phase1APay01";
    const validSig = computeTestHmac(orderId, paymentId);

    expect(() => {
      sb.context.updatePaymentStatus({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: validSig,
        amount: 117,
      });
    }).toThrow("FAKE_PAYMENT_ID");

    // Verify order row 1 is still INITIATED and was NOT marked PAID
    const orderRow = sb.mainSheetRows[1];
    expect(orderRow[7]).toBe("INITIATED");
    expect(orderRow[9]).toBe(""); // Transaction ID empty
  });

  // Test 10: Scan confirming zero secrets appear in built site or deployed files
  it("10. Confirms zero .gs files or hardcoded credentials exist in public/ or dist/", () => {
    const forbiddenPatterns = [
      { label: "RAZORPAY_KEY_SECRET assignment", regex: /RAZORPAY_KEY_SECRET(?:_INTL)?\s*=\s*["'][^"']+["']/ },
      { label: "FunnelsDone PIT token", regex: /pit-us-[0-9a-f-]{20,}/i },
      { label: "Meta Graph EAA access token", regex: /EAef8[A-Za-z0-9]{30,}/ },
    ];

    function scanDirectory(dir: string, violations: string[] = []): string[] {
      if (!fs.existsSync(dir)) return violations;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanDirectory(fullPath, violations);
        } else if (entry.isFile()) {
          if (entry.name.endsWith(".gs")) {
            violations.push(`Found .gs file in public/dist directory: ${fullPath}`);
          }
          if (/\.(js|html|json|txt|gs|map|css)$/i.test(entry.name)) {
            const content = fs.readFileSync(fullPath, "utf8");
            for (const p of forbiddenPatterns) {
              if (p.regex.test(content)) {
                violations.push(`Found secret pattern (${p.label}) in: ${fullPath}`);
              }
            }
          }
        }
      }
      return violations;
    }

    const publicViolations = scanDirectory(path.join(ROOT_DIR, "public"));
    const distViolations = scanDirectory(path.join(ROOT_DIR, "dist"));

    expect(publicViolations).toEqual([]);
    expect(distViolations).toEqual([]);
  });
});
