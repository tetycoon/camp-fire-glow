/**
 * Phase 1T: Final Pre-Installation Security Review and Verification Suite
 *
 * Verifies the 10 targeted security scenarios for backend/apps_script/staging/apps_script.gs:
 * (1) Missing is_test in genuine Razorpay response (verified via staging test credentials + absence of live markers)
 * (2) Razorpay API auth failure (401/403) and malformed JSON response
 * (3) Unknown order with valid catalog price but no trusted binding (UNBOUND_ORDER_PRODUCT)
 * (4) Spreadsheet read exception fails closed (SPREADSHEET_READ_FAILED, never silently swallowed)
 * (5) Browser-supplied product key differing from verified order (PRODUCT_ORDER_MISMATCH)
 * (6) Amount/currency mismatch in integer paise
 * (7) Manipulated isIntl flag safely handled without trusting unverified client flags
 * (8) Duplicate webhook delivery and partial fulfillment recovery (PENDING_INV_ reuse)
 * (9) Missing invoice record fails closed (zero fabrication) and retrieval after cache loss from GST_Sales_Register
 * (10) Valid staging payment flow remains fully functional
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import * as vm from "vm";

const APPS_SCRIPT_PATH = path.resolve(__dirname, "../../backend/apps_script/staging/apps_script.gs");
const TEST_PROXY_SECRET = "test_proxy_secret_for_staging_only_32_chars";
const TEST_RZP_KEY_ID = "rzp_test_k9876543210abc";
const TEST_RZP_SECRET = "test_rzp_secret_32_chars_staging";
const TEST_INVOICE_SECRET = "test_invoice_secret_32_chars_stg";
const VALID_STAGING_SPREADSHEET_ID = "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms";

interface SandboxOptions {
  props?: Record<string, string>;
  sheetRows?: Record<string, any[][]>;
  urlFetchHandler?: (url: string, params: any) => any;
  throwOnDataRange?: boolean;
}

function createStagingSandbox(options: SandboxOptions = {}) {
  const propsStore: Record<string, string> = {
    APP_ENVIRONMENT: "staging",
    SPREADSHEET_ID: VALID_STAGING_SPREADSHEET_ID,
    RAZORPAY_KEY_ID: TEST_RZP_KEY_ID,
    RAZORPAY_KEY_SECRET: TEST_RZP_SECRET,
    WEBHOOK_PROXY_SECRET: TEST_PROXY_SECRET,
    INVOICE_TOKEN_SECRET: TEST_INVOICE_SECRET,
    MOCK_INVOICE_ADAPTER: "true",
    SUPPRESS_NOTIFICATIONS: "true",
    STRICT_PROXY_MODE: "true",
    STAGING_INVOICE_COUNTER: "1000",
    ...(options.props || {}),
  };

  const sheetsData: Record<string, any[][]> = {
    Sheet1: [
      [
        "Timestamp", "Name", "Email", "Phone", "Target Product",
        "Payment Status", "Amount Paid", "Payment ID", "Order ID", "Notes"
      ],
      ...(options.sheetRows?.Sheet1 || []),
    ],
    GST_Sales_Register: [
      [
        "Timestamp", "Invoice No", "Invoice Date", "Customer Name", "Customer Email",
        "Customer Phone", "Place of Supply", "Supply Type", "Reverse Charge", "SAC Code",
        "Service Description", "Taxable Value (₹)", "CGST Rate (%)", "CGST Amount (₹)",
        "SGST Rate (%)", "SGST Amount (₹)", "Round Off (₹)", "Total Invoice Value (₹)",
        "Payment ID", "Order ID"
      ],
      ...(options.sheetRows?.GST_Sales_Register || []),
    ],
    Logs: [
      ["Timestamp", "Event", "Details"],
      ...(options.sheetRows?.Logs || []),
    ],
  };

  const fetchCalls: Array<{ url: string; params: any }> = [];
  const mailCalls: any[] = [];

  const makeSheetMock = (name: string) => ({
    getName: () => name,
    getLastColumn: () => (sheetsData[name] && sheetsData[name][0] ? sheetsData[name][0].length : 0),
    getLastRow: () => (sheetsData[name] ? sheetsData[name].length : 0),
    getRange: (_row: number, _col: number, _numRows?: number, _numCols?: number) => ({
      getValues: () => [sheetsData[name] ? sheetsData[name][0] : []],
      setValue: (val: unknown) => {
        if (!sheetsData[name]) sheetsData[name] = [];
        if (!sheetsData[name][_row - 1]) sheetsData[name][_row - 1] = [];
        sheetsData[name][_row - 1][_col - 1] = val;
      },
    }),
    getDataRange: () => {
      if (options.throwOnDataRange) {
        throw new Error("Google Spreadsheet API Quota/Service Error during read");
      }
      return {
        getValues: () => sheetsData[name] || [],
      };
    },
    appendRow: (row: unknown[]) => {
      if (!sheetsData[name]) sheetsData[name] = [];
      sheetsData[name].push(row);
    },
  });

  const mockSpreadsheet = {
    getId: () => propsStore.SPREADSHEET_ID || "",
    getSheetByName: (name: string) => (sheetsData[name] ? makeSheetMock(name) : null),
    getSheets: () => Object.keys(sheetsData).map(makeSheetMock),
    insertSheet: (name: string) => {
      if (!sheetsData[name]) sheetsData[name] = [];
      return makeSheetMock(name);
    },
  };

  const sandbox: Record<string, any> = {
    console: console,
    Logger: { log: () => {} },
    PropertiesService: {
      getScriptProperties: () => ({
        getProperty: (key: string) => propsStore[key] || null,
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
        waitLock: () => true,
        releaseLock: () => true,
      }),
    },
    SpreadsheetApp: {
      openById: (id: string) => {
        if (id.includes("production")) {
          throw new Error("PRODUCTION_SPREADSHEET_IN_STAGING: Cannot open production spreadsheet ID " + id);
        }
        return mockSpreadsheet;
      },
      getActiveSpreadsheet: () => mockSpreadsheet,
    },
    Utilities: {
      Charset: { UTF_8: "UTF-8" },
      DigestAlgorithm: { SHA_256: "SHA_256" },
      base64Encode: (str: string) => Buffer.from(str).toString("base64"),
      formatDate: (_date: Date, _tz: string, _fmt: string) => "20 Oct 2026",
      computeHmacSha256Signature: (value: string, key: string) => {
        const hmac = crypto.createHmac("sha256", key);
        hmac.update(value, "utf8");
        const buf = hmac.digest();
        return Array.from(buf).map((b) => (b > 127 ? b - 256 : b));
      },
      computeDigest: (_algo: unknown, value: string) => {
        const hash = crypto.createHash("sha256");
        hash.update(value, "utf8");
        const buf = hash.digest();
        return Array.from(buf).map((b) => (b > 127 ? b - 256 : b));
      },
    },
    UrlFetchApp: {
      fetch: (url: string, params: any) => {
        fetchCalls.push({ url, params });
        if (options.urlFetchHandler) {
          return options.urlFetchHandler(url, params);
        }
        const payMatch = url.match(/\/payments\/([^/?#]+)/);
        const payId = payMatch ? decodeURIComponent(payMatch[1]) : "pay_test_default";
        const inferredOrderId = payId.startsWith("pay_test_order_")
          ? payId.replace(/^pay_test_/, "")
          : payId.replace(/^pay_test_/, "order_").replace(/^pay_/, "order_");

        let mockAmount = 29900;
        let mockProduct: string | null = "claude_masterclass";
        if (payId.includes("ai_masterclass") || payId.includes("stg_001")) {
          mockAmount = 9900;
          mockProduct = "ai_masterclass";
        } else if (payId.includes("academy")) {
          mockAmount = 49900;
          mockProduct = "academy";
        } else if (payId.includes("ai_bgm")) {
          mockAmount = 49900;
          mockProduct = "ai_bgm";
        } else if (payId.includes("consulting")) {
          mockAmount = 99900;
          mockProduct = "consulting";
        } else if (payId.includes("advanced") || payId.includes("cb_")) {
          mockAmount = 29900;
          mockProduct = "advanced_masterclass";
        } else if (payId.includes("stg_002")) {
          mockAmount = 29900;
          mockProduct = "claude_masterclass";
        } else if (payId.includes("professionals")) {
          mockAmount = 29900;
          mockProduct = "professionals";
        } else if (payId.includes("upscale")) {
          mockAmount = 29900;
          mockProduct = "upscale";
        } else if (payId.includes("claude") || payId.includes("299")) {
          mockAmount = 29900;
          mockProduct = "claude_masterclass";
        }

        const respObj: Record<string, any> = {
          id: payId,
          order_id: inferredOrderId,
          status: "captured",
          currency: "INR",
          amount: mockAmount,
        };
        if (mockProduct) {
          respObj.notes = { product_key: mockProduct };
        }

        return {
          getResponseCode: () => 200,
          getContentText: () => JSON.stringify(respObj),
        };
      },
    },
    MailApp: {
      sendEmail: (...args: any[]) => {
        mailCalls.push(args);
      },
    },
    ContentService: {
      MimeType: { JSON: "application/json" },
      createTextOutput: (str: string) => ({
        setMimeType: () => ({
          getContent: () => str,
        }),
      }),
    },
  };

  const code = fs.readFileSync(APPS_SCRIPT_PATH, "utf8");
  const script = new vm.Script(code);
  const context = vm.createContext(sandbox);
  script.runInContext(context);

  return { context, propsStore, sheetsData, fetchCalls, mailCalls };
}

describe("PHASE 1T: Pre-Installation Security Review and Verification Suite", () => {
  // Scenario 1: Strict authoritative test-payment verification & missing is_test handling
  describe("Scenario 1: Strict Authoritative Test-Payment Verification", () => {
    it("accepts genuine Razorpay payment where is_test is absent, relying on staging credentials and absence of live markers", () => {
      const sb = createStagingSandbox();
      // Genuine Razorpay payment entity has NO is_test property
      const genuinePayment = {
        id: "pay_test_genuine_01",
        order_id: "order_genuine_01",
        status: "captured",
        amount: 29900,
        currency: "INR",
        // is_test is intentionally omitted
        notes: { product_key: "claude_masterclass" },
      };

      // Must not throw for authoritative server data when running with rzp_test_ key in staging
      expect(() => {
        sb.context.validatePaymentEnvironment(genuinePayment, true);
      }).not.toThrow();

      // Does NOT invent is_test = true on the object
      expect((genuinePayment as any).is_test).toBeUndefined();
    });

    it("rejects payment entity if is_test is explicitly false (live payment marker)", () => {
      const sb = createStagingSandbox();
      const livePayment = {
        id: "pay_test_masquerading",
        order_id: "order_01",
        status: "captured",
        amount: 29900,
        currency: "INR",
        is_test: false, // Explicitly live!
      };

      expect(() => {
        sb.context.validatePaymentEnvironment(livePayment, true);
      }).toThrow(/LIVE_PAYMENT_IN_STAGING|UNVERIFIED_PAYMENT_MODE/);
    });

    it("rejects payment entity if ID has pay_live_ prefix", () => {
      const sb = createStagingSandbox();
      const liveIdPayment = {
        id: "pay_live_realProductionPay",
        order_id: "order_01",
        status: "captured",
        amount: 29900,
        currency: "INR",
      };

      expect(() => {
        sb.context.validatePaymentEnvironment(liveIdPayment, true);
      }).toThrow(/LIVE_PAYMENT_IN_STAGING/);
    });

    it("rejects payment entity if notes indicate mode: 'live'", () => {
      const sb = createStagingSandbox();
      const liveNotesPayment = {
        id: "pay_test_tagged_live",
        order_id: "order_01",
        status: "captured",
        amount: 29900,
        currency: "INR",
        notes: { mode: "live" },
      };

      expect(() => {
        sb.context.validatePaymentEnvironment(liveNotesPayment, true);
      }).toThrow(/LIVE_PAYMENT_IN_STAGING/);
    });
  });

  // Scenario 2: Razorpay API auth failure / malformed JSON
  describe("Scenario 2: Razorpay API Auth Failure & Malformed Responses", () => {
    it("fails closed with RAZORPAY_AUTH_FAILED when Razorpay returns HTTP 401 Unauthorized", () => {
      const sb = createStagingSandbox({
        urlFetchHandler: () => ({
          getResponseCode: () => 401,
          getContentText: () => JSON.stringify({ error: { description: "Invalid API Key" } }),
        }),
      });

      expect(() => {
        sb.context.verifyPaymentWithRazorpayServer("order_01", "pay_test_01", 299, false);
      }).toThrow(/RAZORPAY_AUTH_FAILED/);
    });

    it("fails closed with RAZORPAY_AUTH_FAILED when Razorpay returns HTTP 403 Forbidden", () => {
      const sb = createStagingSandbox({
        urlFetchHandler: () => ({
          getResponseCode: () => 403,
          getContentText: () => JSON.stringify({ error: { description: "Access Denied" } }),
        }),
      });

      expect(() => {
        sb.context.verifyPaymentWithRazorpayServer("order_01", "pay_test_01", 299, false);
      }).toThrow(/RAZORPAY_AUTH_FAILED/);
    });

    it("fails closed with MALFORMED_API_RESPONSE when Razorpay returns invalid JSON", () => {
      const sb = createStagingSandbox({
        urlFetchHandler: () => ({
          getResponseCode: () => 200,
          getContentText: () => "<html>502 Bad Gateway</html>",
        }),
      });

      expect(() => {
        sb.context.verifyPaymentWithRazorpayServer("order_01", "pay_test_01", 299, false);
      }).toThrow(/MALFORMED_API_RESPONSE/);
    });

    it("fails closed with PAYMENT_LOOKUP_FAILED when Razorpay returns HTTP 404 or 500", () => {
      const sb = createStagingSandbox({
        urlFetchHandler: () => ({
          getResponseCode: () => 404,
          getContentText: () => JSON.stringify({ error: { code: "BAD_REQUEST_ERROR" } }),
        }),
      });

      expect(() => {
        sb.context.verifyPaymentWithRazorpayServer("order_01", "pay_test_01", 299, false);
      }).toThrow(/PAYMENT_LOOKUP_FAILED.*404/);
    });
  });

  // Scenario 3: Unknown order with valid catalog price but no trusted binding (UNBOUND_ORDER_PRODUCT)
  describe("Scenario 3: Unbound Order Product Rejection", () => {
    it("fails closed with UNBOUND_ORDER_PRODUCT when order has valid catalog price but neither Sheet1 nor server notes bind the product", () => {
      const orderId = "order_unbound_999";
      const paymentId = "pay_test_unbound_999";
      const eventId = "evt_unbound_01";

      const sb = createStagingSandbox({
        urlFetchHandler: () => ({
          getResponseCode: () => 200,
          getContentText: () =>
            JSON.stringify({
              id: paymentId,
              order_id: orderId,
              status: "captured",
              currency: "INR",
              amount: 99900, // Matches consulting price, but no notes!
              // notes is empty!
            }),
        }),
      });

      const entity = {
        id: paymentId,
        order_id: orderId,
        amount: 99900,
        currency: "INR",
        status: "captured",
      };

      const digest = sb.context.computeCanonicalPayloadDigestGas(entity);
      const now = Date.now();
      const sigTuple = `v2|${eventId}|payment.captured|${orderId}|${paymentId}|${now}|consulting|${entity.amount}|INR|captured||${digest}`;
      const sig = crypto.createHmac("sha256", TEST_PROXY_SECRET).update(sigTuple).digest("hex");

      const postEvent = {
        postData: {
          contents: JSON.stringify({
            event: "payment.captured",
            eventId,
            timestamp: now,
            proxy_version: "v2.1",
            target_product: "consulting",
            payload_digest: digest,
            proxy_signature: sig,
            payload: { payment: { entity } },
          }),
        },
      };

      const res = JSON.parse(sb.context.doPost(postEvent).getContent());
      expect(res.status).toBe(500);
      expect(res.success).toBe(false);
      expect(res.error).toContain("UNBOUND_ORDER_PRODUCT");
    });
  });

  // Scenario 4: Spreadsheet read exception fails closed (SPREADSHEET_READ_FAILED)
  describe("Scenario 4: Spreadsheet Read Exception Fails Closed", () => {
    it("throws SPREADSHEET_READ_FAILED and refuses fallback when spreadsheet read throws", () => {
      const sb = createStagingSandbox({
        throwOnDataRange: true,
      });

      expect(() => {
        sb.context.resolveTrustedOrderBinding(
          sb.context.getStagingSpreadsheet(),
          "order_test_err_01",
          "claude_masterclass",
          { notes: { product_key: "claude_masterclass" } }
        );
      }).toThrow(/SPREADSHEET_READ_FAILED/);
    });
  });

  // Scenario 5: Browser-supplied product key differing from verified order (PRODUCT_ORDER_MISMATCH)
  describe("Scenario 5: Product Order Mismatch Rejection", () => {
    it("rejects client callback when requested productKey conflicts with Sheet1 registered product", () => {
      const orderId = "order_mismatch_01";
      const paymentId = "pay_test_mismatch_01";
      const validSig = crypto.createHmac("sha256", TEST_RZP_SECRET).update(`${orderId}|${paymentId}`).digest("hex");

      const sb = createStagingSandbox({
        sheetRows: {
          Sheet1: [
            ["2026-10-20T10:00:00.000Z", "Student", "s@test.com", "9876543210", "ai_masterclass", "PENDING", 99, "", orderId, ""]
          ]
        },
        urlFetchHandler: () => ({
          getResponseCode: () => 200,
          getContentText: () =>
            JSON.stringify({
              id: paymentId,
              order_id: orderId,
              status: "captured",
              currency: "INR",
              amount: 29900,
            }),
        }),
      });

      // Browser maliciously claims claude_masterclass (₹299) for an order registered for ai_masterclass (₹99)
      const res = JSON.parse(
        sb.context.handleClientPaymentCallback(sb.context.getStagingSpreadsheet(), {
          orderId,
          paymentId,
          signature: validSig,
          productKey: "claude_masterclass",
        }).getContent()
      );

      expect(res.success).toBe(false);
      expect(res.status).toBe(400);
      expect(res.error).toContain("PRODUCT_ORDER_MISMATCH");
    });
  });

  // Scenario 6: Amount/currency mismatch in integer paise
  describe("Scenario 6: Integer Paise Amount and Currency Verification", () => {
    it("fails closed when Razorpay amount is off by even 1 paisa (29901 vs 29900 paise)", () => {
      const orderId = "order_paise_01";
      const paymentId = "pay_test_paise_01";
      const eventId = "evt_paise_01";

      const sb = createStagingSandbox({
        sheetRows: {
          Sheet1: [
            ["2026-10-20T10:00:00.000Z", "Student", "s@test.com", "9876543210", "claude_masterclass", "PENDING", 299, "", orderId, ""]
          ]
        },
        urlFetchHandler: () => ({
          getResponseCode: () => 200,
          getContentText: () =>
            JSON.stringify({
              id: paymentId,
              order_id: orderId,
              status: "captured",
              currency: "INR",
              amount: 29901, // 1 paisa too high!
              notes: { product_key: "claude_masterclass" },
            }),
        }),
      });

      const entity = {
        id: paymentId,
        order_id: orderId,
        amount: 29901,
        currency: "INR",
        status: "captured",
        notes: { product_key: "claude_masterclass" },
      };

      const digest = sb.context.computeCanonicalPayloadDigestGas(entity);
      const now = Date.now();
      const sigTuple = `v2|${eventId}|payment.captured|${orderId}|${paymentId}|${now}|claude_masterclass|29901|INR|captured||${digest}`;
      const sig = crypto.createHmac("sha256", TEST_PROXY_SECRET).update(sigTuple).digest("hex");

      const postEvent = {
        postData: {
          contents: JSON.stringify({
            event: "payment.captured",
            eventId,
            timestamp: now,
            proxy_version: "v2.1",
            target_product: "claude_masterclass",
            payload_digest: digest,
            proxy_signature: sig,
            payload: { payment: { entity } },
          }),
        },
      };

      const res = JSON.parse(sb.context.doPost(postEvent).getContent());
      expect(res.status).toBe(500);
      expect(res.success).toBe(false);
      expect(res.error).toContain("AMOUNT_MISMATCH");
    });

    it("fails closed when currency is not INR", () => {
      const sb = createStagingSandbox({
        urlFetchHandler: () => ({
          getResponseCode: () => 200,
          getContentText: () =>
            JSON.stringify({
              id: "pay_test_usd",
              order_id: "order_usd",
              status: "captured",
              currency: "USD",
              amount: 29900,
            }),
        }),
      });

      expect(() => {
        sb.context.verifyPaymentWithRazorpayServer("order_usd", "pay_test_usd", 299, false);
      }).toThrow(/CURRENCY_MISMATCH/);
    });
  });

  // Scenario 7: Manipulated isIntl flag
  describe("Scenario 7: International Routing Flag Safeguards", () => {
    it("disregards untrusted isIntl: true flag and falls back to primary staging test key if intl key is unconfigured", () => {
      const orderId = "order_intl_unconfig_01";
      const paymentId = "pay_test_intl_unconfig_01";
      const eventId = "evt_intl_unconfig_01";

      const sb = createStagingSandbox({
        sheetRows: {
          Sheet1: [
            ["2026-10-20T10:00:00.000Z", "Student", "s@test.com", "9876543210", "claude_masterclass", "PENDING", 299, "", orderId, ""]
          ]
        },
      });

      const entity = {
        id: paymentId,
        order_id: orderId,
        amount: 29900,
        currency: "INR",
        status: "captured",
        notes: { product_key: "claude_masterclass" },
      };

      const digest = sb.context.computeCanonicalPayloadDigestGas(entity);
      const now = Date.now();
      const sigTuple = `v2|${eventId}|payment.captured|${orderId}|${paymentId}|${now}|claude_masterclass|${entity.amount}|INR|captured||${digest}`;
      const sig = crypto.createHmac("sha256", TEST_PROXY_SECRET).update(sigTuple).digest("hex");

      const postEvent = {
        postData: {
          contents: JSON.stringify({
            event: "payment.captured",
            eventId,
            timestamp: now,
            proxy_version: "v2.1",
            target_product: "claude_masterclass",
            isIntl: true, // Malicious or unconfigured client sends isIntl: true
            payload_digest: digest,
            proxy_signature: sig,
            payload: { payment: { entity } },
          }),
        },
      };

      const res = JSON.parse(sb.context.doPost(postEvent).getContent());
      expect(res.status).toBe(200);
      expect(res.success).toBe(true);

      // Verify the fetch call used the primary test key, NOT an undefined or live key
      expect(sb.fetchCalls).toHaveLength(1);
      const authHeader = sb.fetchCalls[0].params.headers.Authorization;
      const decodedAuth = Buffer.from(authHeader.replace("Basic ", ""), "base64").toString("utf8");
      expect(decodedAuth.startsWith(TEST_RZP_KEY_ID)).toBe(true);
    });
  });

  // Scenario 8: Duplicate webhook and partial fulfillment recovery
  describe("Scenario 8: Duplicate Webhook Delivery & Partial Failure Recovery", () => {
    it("handles replayed webhook delivery idempotently without creating duplicate invoices", () => {
      const orderId = "order_replay_01";
      const paymentId = "pay_test_replay_01";
      const eventId = "evt_replay_01";

      const sb = createStagingSandbox({
        sheetRows: {
          Sheet1: [
            ["2026-10-20T10:00:00.000Z", "Student", "s@test.com", "9876543210", "claude_masterclass", "PENDING", 299, "", orderId, ""]
          ]
        },
      });

      const entity = {
        id: paymentId,
        order_id: orderId,
        amount: 29900,
        currency: "INR",
        status: "captured",
        notes: { product_key: "claude_masterclass" },
      };

      const digest = sb.context.computeCanonicalPayloadDigestGas(entity);
      const now = Date.now();
      const sigTuple = `v2|${eventId}|payment.captured|${orderId}|${paymentId}|${now}|claude_masterclass|${entity.amount}|INR|captured||${digest}`;
      const sig = crypto.createHmac("sha256", TEST_PROXY_SECRET).update(sigTuple).digest("hex");

      const postEvent = {
        postData: {
          contents: JSON.stringify({
            event: "payment.captured",
            eventId,
            timestamp: now,
            proxy_version: "v2.1",
            target_product: "claude_masterclass",
            payload_digest: digest,
            proxy_signature: sig,
            payload: { payment: { entity } },
          }),
        },
      };

      // 1st delivery
      const res1 = JSON.parse(sb.context.doPost(postEvent).getContent());
      expect(res1.status).toBe(200);
      expect(res1.invoiceNumber).toBe("STAGE-INV-1001");
      expect(sb.sheetsData.GST_Sales_Register).toHaveLength(2);

      // 2nd delivery (replayed)
      const res2 = JSON.parse(sb.context.doPost(postEvent).getContent());
      expect(res2.status).toBe(200);
      expect(res2.duplicate).toBe(true);
      expect(res2.alreadyProcessed).toBe(true);
      // Zero additional rows appended
      expect(sb.sheetsData.GST_Sales_Register).toHaveLength(2);
    });

    it("recovers safely on retry by reusing PENDING_INV without burning an extra invoice counter", () => {
      const sb = createStagingSandbox();
      const paymentId = "pay_test_pending_reuse";
      const orderId = "order_pending_reuse";

      const inv1 = sb.context.createStagingMockInvoice(paymentId, orderId, "claude_masterclass");
      expect(inv1).toBe("STAGE-INV-1001");
      expect(sb.propsStore["PENDING_INV_" + paymentId]).toBe("STAGE-INV-1001");

      // Second invocation for the same paymentId reuses the pending invoice
      const inv2 = sb.context.createStagingMockInvoice(paymentId, orderId, "claude_masterclass");
      expect(inv2).toBe("STAGE-INV-1001");
      // Counter was incremented only once
      expect(sb.propsStore["STAGING_INVOICE_COUNTER"]).toBe("1001");
    });
  });

  // Scenario 9: Authentic invoice retrieval & zero fabrication
  describe("Scenario 9: Authentic Invoice Retrieval & Zero Fabrication", () => {
    it("fails closed with INVOICE_NOT_FOUND when invoice record is absent from both cache and GST_Sales_Register", () => {
      const sb = createStagingSandbox();
      const paymentId = "pay_test_missing_inv";
      const orderId = "order_missing_inv";

      const exp = Date.now() + 3600000;
      const sig = crypto.createHmac("sha256", TEST_INVOICE_SECRET).update(`${paymentId}|${orderId}|${exp}`).digest("hex");
      const token = `${exp}.${sig}`;

      const res = sb.context.getVerifiedInvoiceRecord(sb.context.getStagingSpreadsheet(), paymentId, orderId, token);
      expect(res.success).toBe(false);
      expect(res.verified).toBe(false);
      expect(res.error).toContain("INVOICE_NOT_FOUND");
    });

    it("reconstructs authentic invoice record from GST_Sales_Register when VERIFIED_INV cache is lost", () => {
      const paymentId = "pay_test_cache_loss";
      const orderId = "order_cache_loss";

      const sb = createStagingSandbox({
        sheetRows: {
          GST_Sales_Register: [
            [
              "2026-10-20T10:00:00.000Z",
              "STAGE-INV-1055",
              "20 Oct 2026",
              "Jane Doe",
              "jane@test.com",
              "9876543210",
              "Karnataka",
              "Interstate",
              "No",
              "999293",
              "Claude Masterclass",
              253.39,
              9,
              22.81,
              9,
              22.81,
              -0.01,
              299,
              paymentId,
              orderId,
            ],
          ],
        },
      });

      // Confirm cache is empty
      expect(sb.propsStore["VERIFIED_INV_" + paymentId]).toBeUndefined();

      const exp = Date.now() + 3600000;
      const sig = crypto.createHmac("sha256", TEST_INVOICE_SECRET).update(`${paymentId}|${orderId}|${exp}`).digest("hex");
      const token = `${exp}.${sig}`;

      const res = sb.context.getVerifiedInvoiceRecord(sb.context.getStagingSpreadsheet(), paymentId, orderId, token);
      expect(res.success).toBe(true);
      expect(res.verified).toBe(true);
      expect(res.invoice.invoiceNumber).toBe("STAGE-INV-1055");
      expect(res.invoice.totalAmountPaid).toBe(299);
    });
  });

  // Scenario 10: Valid staging payment flow remains functional
  describe("Scenario 10: Valid End-to-End Staging Payment Flow", () => {
    it("completes full staging fulfillment with zero external calls and zero notifications", () => {
      const orderId = "order_valid_e2e_01";
      const paymentId = "pay_test_valid_e2e_01";
      const eventId = "evt_valid_e2e_01";

      const sb = createStagingSandbox({
        sheetRows: {
          Sheet1: [
            ["2026-10-20T10:00:00.000Z", "Student", "student@test.com", "9876543210", "claude_masterclass", "PENDING", 299, "", orderId, ""]
          ]
        },
      });

      const entity = {
        id: paymentId,
        order_id: orderId,
        amount: 29900,
        currency: "INR",
        status: "captured",
        notes: { product_key: "claude_masterclass" },
      };

      const digest = sb.context.computeCanonicalPayloadDigestGas(entity);
      const now = Date.now();
      const sigTuple = `v2|${eventId}|payment.captured|${orderId}|${paymentId}|${now}|claude_masterclass|${entity.amount}|INR|captured||${digest}`;
      const sig = crypto.createHmac("sha256", TEST_PROXY_SECRET).update(sigTuple).digest("hex");

      const postEvent = {
        postData: {
          contents: JSON.stringify({
            event: "payment.captured",
            eventId,
            timestamp: now,
            proxy_version: "v2.1",
            target_product: "claude_masterclass",
            payload_digest: digest,
            proxy_signature: sig,
            payload: { payment: { entity } },
          }),
        },
      };

      const res = JSON.parse(sb.context.doPost(postEvent).getContent());
      expect(res.status).toBe(200);
      expect(res.success).toBe(true);
      expect(res.invoiceNumber).toBe("STAGE-INV-1001");
      expect(res.notificationsSuppressed).toBe(true);

      // Verify Sheet1 updated to PAID
      const updatedSheet1Row = sb.sheetsData.Sheet1[1];
      expect(updatedSheet1Row[7]).toBe("✅ PAID");
      expect(updatedSheet1Row[9]).toBe(paymentId);

      // Verify GST_Sales_Register row appended
      expect(sb.sheetsData.GST_Sales_Register).toHaveLength(2);
      const gstRow = sb.sheetsData.GST_Sales_Register[1];
      expect(gstRow[1]).toBe("STAGE-INV-1001");
      expect(gstRow[9]).toBe("999293"); // SAC Code
      expect(gstRow[17]).toBe(299); // Total invoice value

      // Verify zero external calls to LeadConnector/FunnelsDone and zero emails sent
      const externalApiCalls = sb.fetchCalls.filter((c) =>
        c.url.includes("leadconnector") || c.url.includes("funnelsdone")
      );
      expect(externalApiCalls).toHaveLength(0);
      expect(sb.mailCalls).toHaveLength(0);
    });
  });
});
