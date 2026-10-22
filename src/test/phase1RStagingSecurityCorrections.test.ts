import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import vm from "vm";
import crypto from "crypto";

const STAGING_APPS_SCRIPT_PATH = path.resolve(
  __dirname,
  "../../backend/apps_script/staging/apps_script.gs"
);

const TEST_PROXY_SECRET = "mock_proxy_secret_for_staging_unit_tests_only_32_chars";
const TEST_INVOICE_SECRET = "mock_invoice_secret_for_staging_unit_tests_only_32_chars";
const TEST_RZP_SECRET = "mock_rzp_secret_for_staging_unit_tests_only_32_chars";
const VALID_STAGING_SPREADSHEET_ID = "1StagingSpreadsheetId_Dedicated_Isolated_999";

const KNOWN_PRODUCTION_SPREADSHEET_IDS = [
  "1PC9ZYxd4O7ofuDwcN5AhPHTvW6RYO7V2LgQqrbPTQ5I",
  "1XyFhw6cTJAOE2XT7Ra8lmL0rcvq2meCT9LlGuzOF0nk",
  "1JA3FZf8xkpZ8GjuYiETXz9R0ivfW80-rf3PZIzQum9g",
  "1LP37n3zb1d0UkXjddQBCKqmSU0j5-HvPSI-Rda36E3s",
  "1RpwPPMH6nf8CsIAfITF1gNc5gBNhq7CJ0zckotAgq4I",
];

function createStagingSandbox(options: {
  propsOverrides?: Record<string, string | null>;
  sheetRows?: Record<string, unknown[][]>;
  urlFetchHandler?: (url: string, params: any) => any;
} = {}) {
  const code = fs.readFileSync(STAGING_APPS_SCRIPT_PATH, "utf-8");

  const propsStore: Record<string, string> = {
    APP_ENVIRONMENT: "staging",
    SPREADSHEET_ID: VALID_STAGING_SPREADSHEET_ID,
    RAZORPAY_KEY_ID: "rzp_test_stagingKey999",
    RAZORPAY_KEY_SECRET: TEST_RZP_SECRET,
    WEBHOOK_PROXY_SECRET: TEST_PROXY_SECRET,
    INVOICE_TOKEN_SECRET: TEST_INVOICE_SECRET,
    MOCK_INVOICE_ADAPTER: "true",
    ENABLE_MOCK_INVOICE_ADAPTER: "true",
    SUPPRESS_NOTIFICATIONS: "true",
    STRICT_PROXY_MODE: "true",
    RAZORPAY_KEY_ID_INTL: "rzp_test_intlKey888",
    RAZORPAY_KEY_SECRET_INTL: TEST_RZP_SECRET,
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

  const sheetsData: Record<string, unknown[][]> = {
    Sheet1: [
      [
        "Timestamp", "Name", "Email", "Phone", "Course", "UserType", "Amount",
        "Payment Status", "Order ID", "Payment ID", "Email Status", "WhatsApp Status"
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
    getDataRange: () => ({
      getValues: () => sheetsData[name] || [],
    }),
    appendRow: (row: unknown[]) => {
      if (!sheetsData[name]) sheetsData[name] = [];
      sheetsData[name].push(row);
    },
  });

  const mockSpreadsheet = {
    getId: () => propsStore.SPREADSHEET_ID || "",
    getSheetByName: (name: string) => (sheetsData[name] ? makeSheetMock(name) : null),
    insertSheet: (name: string) => {
      if (!sheetsData[name]) sheetsData[name] = [];
      return makeSheetMock(name);
    },
    getSheets: () => Object.keys(sheetsData).map((k) => makeSheetMock(k)),
  };

  const sandbox: Record<string, unknown> = {
    console,
    Math,
    Date,
    JSON,
    String,
    Number,
    Boolean,
    parseInt,
    parseFloat,
    isNaN,
    Array,
    Object,
    RegExp,
    Error,
    encodeURIComponent,
    decodeURIComponent,
    Logger: {
      log: () => {},
    },
    PropertiesService: {
      getScriptProperties: () => ({
        getProperty: (key: string) => propsStore[key] ?? null,
        setProperty: (key: string, val: string) => {
          propsStore[key] = val;
        },
        deleteProperty: (key: string) => {
          delete propsStore[key];
        },
      }),
    },
    SpreadsheetApp: {
      openById: (id: string) => {
        if (KNOWN_PRODUCTION_SPREADSHEET_IDS.includes(id)) {
          throw new Error("PRODUCTION_SPREADSHEET_IN_STAGING: ID " + id);
        }
        return mockSpreadsheet;
      },
    },
    LockService: {
      getScriptLock: () => ({
        waitLock: () => true,
        releaseLock: () => true,
      }),
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
        let mockProduct = "advanced_masterclass";
        if (payId.includes("stg_001") || payId.includes("ai_masterclass")) {
          mockAmount = 9900;
          mockProduct = "ai_masterclass";
        } else if (payId.includes("consulting")) {
          mockAmount = 99900;
          mockProduct = "consulting";
        } else if (payId.includes("academy")) {
          mockAmount = 49900;
          mockProduct = "academy";
        } else if (payId.includes("ai_bgm")) {
          mockAmount = 49900;
          mockProduct = "ai_bgm";
        } else if (payId.includes("claude")) {
          mockProduct = "claude_masterclass";
        } else if (payId.includes("professionals")) {
          mockProduct = "professionals";
        } else if (payId.includes("upscale")) {
          mockProduct = "upscale";
        }

        return {
          getResponseCode: () => 200,
          getContentText: () =>
            JSON.stringify({
              id: payId,
              order_id: inferredOrderId,
              status: "captured",
              currency: "INR",
              amount: mockAmount,
              is_test: true,
              notes: { product_key: mockProduct },
            }),
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

  const context = vm.createContext(sandbox);
  vm.runInContext(code, context);

  return {
    context,
    propsStore,
    sheetsData,
    fetchCalls,
    mailCalls,
  };
}

describe("PHASE 1R: Final Staging Apps Script Security Corrections Suite", () => {
  describe("Requirement 1: Removal of Fallback Razorpay Key IDs (Fail-Closed)", () => {
    it("fails closed when RAZORPAY_KEY_ID is missing or null (zero fallback string)", () => {
      const sb = createStagingSandbox({ propsOverrides: { RAZORPAY_KEY_ID: null } });
      expect(() => sb.context.getRazorpayKeyId(false)).toThrowError(/MISSING_RAZORPAY_KEY_ID/);
    });

    it("fails closed when RAZORPAY_KEY_ID is empty or blank", () => {
      const sb = createStagingSandbox({ propsOverrides: { RAZORPAY_KEY_ID: "   " } });
      expect(() => sb.context.getRazorpayKeyId(false)).toThrowError(/MISSING_RAZORPAY_KEY_ID/);
    });

    it("strictly rejects live Razorpay credentials starting with 'rzp_live_'", () => {
      const sb = createStagingSandbox({ propsOverrides: { RAZORPAY_KEY_ID: "rzp_live_productionLiveKey" } });
      expect(() => sb.context.getRazorpayKeyId(false)).toThrowError(/LIVE_CREDENTIALS_IN_STAGING/);
    });

    it("strictly rejects malformed keys without 'rzp_test_' prefix", () => {
      const sb = createStagingSandbox({ propsOverrides: { RAZORPAY_KEY_ID: "invalid_key_prefix_999" } });
      expect(() => sb.context.getRazorpayKeyId(false)).toThrowError(/INVALID_TEST_KEY_PREFIX/);
    });

    it("fails closed when RAZORPAY_KEY_ID_INTL is missing for international payments", () => {
      const sb = createStagingSandbox({ propsOverrides: { RAZORPAY_KEY_ID_INTL: null } });
      expect(() => sb.context.getRazorpayKeyId(true)).toThrowError(/MISSING_RAZORPAY_KEY_ID/);
    });

    it("diagnostics reports FAIL if RAZORPAY_KEY_ID is missing", () => {
      const sb = createStagingSandbox({ propsOverrides: { RAZORPAY_KEY_ID: null } });
      const diag = sb.context.runStagingDiagnostics();
      expect(diag.status).toBe("FAIL");
      expect(diag.checks.razorpayKey).toBe("FAIL");
      expect(diag.errorCodes).toContain("MISSING_RAZORPAY_KEY_ID");
    });
  });

  describe("Requirements 2, 3 & 5: Direct Client Callback & Authoritative Server Verification", () => {
    it("rejects client callback when Razorpay server returns payment NOT captured (e.g. authorized)", () => {
      const orderId = "order_staging_cb_uncaptured";
      const payId = "pay_test_staging_cb_uncaptured";
      const validSig = crypto.createHmac("sha256", TEST_RZP_SECRET).update(`${orderId}|${payId}`).digest("hex");

      const sb = createStagingSandbox({
        urlFetchHandler: () => ({
          getResponseCode: () => 200,
          getContentText: () =>
            JSON.stringify({
              id: payId,
              order_id: orderId,
              status: "authorized", // NOT captured
              currency: "INR",
              amount: 29900,
              is_test: true,
            }),
        }),
      });

      const res = JSON.parse(
        sb.context.handleClientPaymentCallback(sb.context.getStagingSpreadsheet(), {
          orderId,
          paymentId: payId,
          signature: validSig,
          productKey: "advanced_masterclass",
        }).getContent()
      );

      expect(res.success).toBe(false);
      expect(res.status).toBe(400);
      expect(res.error).toContain("PAYMENT_VERIFICATION_FAILED");
      expect(res.error).toContain("PAYMENT_NOT_CAPTURED");
      expect(res.invoiceToken).toBeUndefined();
    });

    it("rejects client callback when Razorpay server returns order ID mismatch", () => {
      const orderId = "order_staging_cb_expected";
      const payId = "pay_test_staging_cb_mismatch";
      const validSig = crypto.createHmac("sha256", TEST_RZP_SECRET).update(`${orderId}|${payId}`).digest("hex");

      const sb = createStagingSandbox({
        urlFetchHandler: () => ({
          getResponseCode: () => 200,
          getContentText: () =>
            JSON.stringify({
              id: payId,
              order_id: "order_SOME_OTHER_ORDER", // Mismatch
              status: "captured",
              currency: "INR",
              amount: 29900,
              is_test: true,
            }),
        }),
      });

      const res = JSON.parse(
        sb.context.handleClientPaymentCallback(sb.context.getStagingSpreadsheet(), {
          orderId,
          paymentId: payId,
          signature: validSig,
          productKey: "advanced_masterclass",
        }).getContent()
      );

      expect(res.success).toBe(false);
      expect(res.status).toBe(400);
      expect(res.error).toContain("ORDER_MISMATCH");
      expect(res.invoiceToken).toBeUndefined();
    });

    it("rejects client callback when Razorpay server returns amount mismatch against registered order", () => {
      const orderId = "order_staging_cb_amt_check";
      const payId = "pay_test_staging_cb_amt_check";
      const validSig = crypto.createHmac("sha256", TEST_RZP_SECRET).update(`${orderId}|${payId}`).digest("hex");

      const sb = createStagingSandbox({
        sheetRows: {
          Sheet1: [
            [
              new Date().toISOString(), "Registered Learner", "learner@test.com", "9876543210",
              "ai_masterclass", "Developer", 299, "PENDING", orderId, "", "PENDING", "PENDING"
            ]
          ]
        },
        urlFetchHandler: () => ({
          getResponseCode: () => 200,
          getContentText: () =>
            JSON.stringify({
              id: payId,
              order_id: orderId,
              status: "captured",
              currency: "INR",
              amount: 100, // Attacker paid ₹1 instead of ₹299
              is_test: true,
            }),
        }),
      });

      const res = JSON.parse(
        sb.context.handleClientPaymentCallback(sb.context.getStagingSpreadsheet(), {
          orderId,
          paymentId: payId,
          signature: validSig,
        }).getContent()
      );

      expect(res.success).toBe(false);
      expect(res.status).toBe(400);
      expect(res.error).toContain("AMOUNT_MISMATCH");
      expect(res.invoiceToken).toBeUndefined();
    });

    it("rejects client callback when payment entity indicates live mode (Requirement 5)", () => {
      const orderId = "order_staging_cb_live";
      const payId = "pay_live_staging_tamper";
      const validSig = crypto.createHmac("sha256", TEST_RZP_SECRET).update(`${orderId}|${payId}`).digest("hex");

      const sb = createStagingSandbox();

      const res = JSON.parse(
        sb.context.handleClientPaymentCallback(sb.context.getStagingSpreadsheet(), {
          orderId,
          paymentId: payId,
          signature: validSig,
        }).getContent()
      );

      expect(res.success).toBe(false);
      expect(res.status).toBe(400);
      expect(res.invoiceToken).toBeUndefined();
    });

    it("issues cryptographically signed invoice token when authoritative server checks succeed", () => {
      const orderId = "order_staging_cb_valid";
      const payId = "pay_test_staging_cb_valid";
      const validSig = crypto.createHmac("sha256", TEST_RZP_SECRET).update(`${orderId}|${payId}`).digest("hex");

      const sb = createStagingSandbox({
        sheetRows: {
          Sheet1: [
            [
              new Date().toISOString(), "Valid Student", "student@test.com", "9876543210",
              "advanced_masterclass", "Developer", 299, "PENDING", orderId, "", "PENDING", "PENDING"
            ]
          ]
        },
        urlFetchHandler: () => ({
          getResponseCode: () => 200,
          getContentText: () =>
            JSON.stringify({
              id: payId,
              order_id: orderId,
              status: "captured",
              currency: "INR",
              amount: 29900,
              is_test: true,
            }),
        }),
      });

      const res = JSON.parse(
        sb.context.handleClientPaymentCallback(sb.context.getStagingSpreadsheet(), {
          orderId,
          paymentId: payId,
          signature: validSig,
        }).getContent()
      );

      expect(res.success).toBe(true);
      expect(res.status).toBe(200);
      expect(res.verified).toBe(true);
      expect(res.invoiceToken).toBeDefined();

      const [expStr, tokenHmac] = res.invoiceToken.split(".");
      const expectedTokenHmac = crypto
        .createHmac("sha256", TEST_INVOICE_SECRET)
        .update(`${payId}|${orderId}|${expStr}`)
        .digest("hex");
      expect(tokenHmac).toBe(expectedTokenHmac);
    });
  });

  describe("Requirement 4: Elimination of GET Invoice Retrieval & Protected POST Only", () => {
    it("strictly rejects GET retrieval with action=getverifiedinvoice with 405 METHOD_NOT_ALLOWED", () => {
      const sb = createStagingSandbox();
      const getEvent = {
        parameter: {
          action: "getverifiedinvoice",
          paymentId: "pay_test_get_01",
          orderId: "order_get_01",
          token: "123.sig",
        },
      };

      const res = JSON.parse(sb.context.doGet(getEvent).getContent());
      expect(res.success).toBe(false);
      expect(res.status).toBe(405);
      expect(res.error).toContain("METHOD_NOT_ALLOWED");
      expect(res.error).toContain("POST");
    });

    it("strictly rejects GET requests containing token query parameter with 405", () => {
      const sb = createStagingSandbox();
      const getEvent = {
        parameter: {
          token: "secret_token_in_url",
          paymentId: "pay_test_get_02",
        },
      };

      const res = JSON.parse(sb.context.doGet(getEvent).getContent());
      expect(res.success).toBe(false);
      expect(res.status).toBe(405);
      expect(res.error).toContain("METHOD_NOT_ALLOWED");
    });

    it("allows protected POST invoice retrieval with valid token", () => {
      const sb = createStagingSandbox();
      const paymentId = "pay_test_post_inv_01";
      const orderId = "order_post_inv_01";
      const exp = Date.now() + 3600000;
      const sig = crypto.createHmac("sha256", TEST_INVOICE_SECRET).update(`${paymentId}|${orderId}|${exp}`).digest("hex");
      const token = `${exp}.${sig}`;

      sb.propsStore["VERIFIED_INV_" + paymentId] = JSON.stringify({
        verified: true,
        status: "PAID",
        paymentId,
        orderId,
        invoiceNumber: "STAGE-INV-7001",
      });

      const postEvent = {
        postData: {
          contents: JSON.stringify({
            action: "getVerifiedInvoice",
            paymentId,
            orderId,
            token,
          }),
        },
      };

      const res = JSON.parse(sb.context.doPost(postEvent).getContent());
      expect(res.success).toBe(true);
      expect(res.verified).toBe(true);
      expect(res.invoice.invoiceNumber).toBe("STAGE-INV-7001");
    });

    it("rejects invoice retrieval if registration in Sheet1 is not fulfilled (not PAID)", () => {
      const paymentId = "pay_test_unfulfilled_01";
      const orderId = "order_unfulfilled_01";
      const exp = Date.now() + 3600000;
      const sig = crypto.createHmac("sha256", TEST_INVOICE_SECRET).update(`${paymentId}|${orderId}|${exp}`).digest("hex");
      const token = `${exp}.${sig}`;

      const sb = createStagingSandbox({
        sheetRows: {
          Sheet1: [
            [
              new Date().toISOString(), "Pending Student", "pending@test.com", "9876543210",
              "ai_masterclass", "Developer", 99, "PENDING", orderId, paymentId, "PENDING", "PENDING"
            ]
          ]
        }
      });

      const res = sb.context.getVerifiedInvoiceRecord(sb.context.getStagingSpreadsheet().getSheetByName("Sheet1"), paymentId, orderId, token);
      expect(res.success).toBe(false);
      expect(res.error).toContain("PAYMENT_NOT_FULFILLED");
    });
  });

  describe("Requirement 6: Exact Spreadsheet Header Order & Column Matching", () => {
    it("fails diagnostics if column order in Sheet1 is swapped", () => {
      const sb = createStagingSandbox();
      // Swapped columns 2 & 3: "Phone" before "Email"
      sb.sheetsData.Sheet1[0] = [
        "Timestamp", "Name", "Phone", "Email", "Course", "UserType", "Amount",
        "Payment Status", "Order ID", "Payment ID", "Email Status", "WhatsApp Status"
      ];

      const report = sb.context.runStagingDiagnostics();
      expect(report.status).toBe("FAIL");
      expect(report.checks.sheetHeaders).toBe("FAIL");
      expect(report.errorCodes).toContain("INVALID_SHEET1_HEADERS");
    });

    it("fails diagnostics if substring match is used instead of exact header match in GST tab", () => {
      const sb = createStagingSandbox();
      // Replaced exact "Customer Email" with substring "Customer Email Address"
      sb.sheetsData.GST_Sales_Register[0] = [
        "Timestamp", "Invoice No", "Invoice Date", "Customer Name", "Customer Email Address",
        "Customer Phone", "Place of Supply", "Supply Type", "Reverse Charge", "SAC Code",
        "Service Description", "Taxable Value (₹)", "CGST Rate (%)", "CGST Amount (₹)",
        "SGST Rate (%)", "SGST Amount (₹)", "Round Off (₹)", "Total Invoice Value (₹)",
        "Payment ID", "Order ID"
      ];

      const report = sb.context.runStagingDiagnostics();
      expect(report.status).toBe("FAIL");
      expect(report.checks.gstHeaders).toBe("FAIL");
      expect(report.errorCodes).toContain("INVALID_GST_HEADERS");
    });

    it("fails diagnostics if Logs tab has swapped columns", () => {
      const sb = createStagingSandbox();
      // Swapped Event and Timestamp
      sb.sheetsData.Logs[0] = ["Event", "Timestamp", "Details"];

      const report = sb.context.runStagingDiagnostics();
      expect(report.status).toBe("FAIL");
      expect(report.checks.logsTab).toBe("FAIL");
      expect(report.errorCodes).toContain("INVALID_LOGS_HEADERS");
    });
  });

  describe("Requirement 7: Cached Invoice Mismatched Order Rejection", () => {
    it("rejects retrieval when cached invoice belongs to a different order ID", () => {
      const sb = createStagingSandbox();
      const paymentId = "pay_test_order_bound_01";
      const victimOrder = "order_victim_01";
      const attackerOrder = "order_attacker_02";

      // Cached under victimOrder
      sb.propsStore["VERIFIED_INV_" + paymentId] = JSON.stringify({
        verified: true,
        status: "PAID",
        paymentId,
        orderId: victimOrder,
        invoiceNumber: "STAGE-INV-5555",
      });

      // Token generated for attackerOrder and paymentId
      const exp = Date.now() + 3600000;
      const sig = crypto.createHmac("sha256", TEST_INVOICE_SECRET).update(`${paymentId}|${attackerOrder}|${exp}`).digest("hex");
      const token = `${exp}.${sig}`;

      const res = sb.context.getVerifiedInvoiceRecord(null, paymentId, attackerOrder, token);
      expect(res.success).toBe(false);
      expect(res.error).toContain("ORDER_MISMATCH");
    });

    it("webhook deduplication rejects replay if payment is already cached for a different order", () => {
      const sb = createStagingSandbox();
      const paymentId = "pay_test_rep_mismatch";
      const originalOrder = "order_original_111";
      const spoofedOrder = "order_spoofed_222";

      sb.propsStore["VERIFIED_INV_" + paymentId] = JSON.stringify({
        verified: true,
        status: "PAID",
        paymentId,
        orderId: originalOrder,
        invoiceNumber: "STAGE-INV-8888",
      });

      const entity = {
        id: paymentId,
        order_id: spoofedOrder,
        amount: 29900,
        currency: "INR",
        status: "captured",
        is_test: true,
      };

      const digest = sb.context.computeCanonicalPayloadDigestGas(entity);
      const now = Date.now();
      const eventId = "evt_rep_01";

      const sigTuple = `v2|${eventId}|payment.captured|${spoofedOrder}|${paymentId}|${now}|ai_masterclass|${entity.amount}|INR|captured||${digest}`;
      const sig = crypto.createHmac("sha256", TEST_PROXY_SECRET).update(sigTuple).digest("hex");

      const postEvent = {
        postData: {
          contents: JSON.stringify({
            event: "payment.captured",
            eventId,
            timestamp: now,
            proxy_version: "v2.1",
            target_product: "ai_masterclass",
            payload_digest: digest,
            proxy_signature: sig,
            payload: { payment: { entity } },
          }),
        },
      };

      const res = JSON.parse(sb.context.doPost(postEvent).getContent());
      expect(res.status).toBe(500);
      expect(res.error).toContain("ORDER_MISMATCH");
    });
  });

  describe("Requirements 8, 9 & 10: State Persistence Timing, Read-Only Diagnostics & Zero Secret Leakage", () => {
    it("persists PROCESSED_EVT and VERIFIED_INV only after fulfillment operations succeed", () => {
      const sb = createStagingSandbox();
      const paymentId = "pay_test_order_persist_01";
      const orderId = "order_persist_01";
      const eventId = "evt_persist_01";

      const entity = {
        id: paymentId,
        order_id: orderId,
        amount: 29900,
        currency: "INR",
        status: "captured",
        is_test: true,
      };

      const digest = sb.context.computeCanonicalPayloadDigestGas(entity);
      const now = Date.now();

      const sigTuple = `v2|${eventId}|payment.captured|${orderId}|${paymentId}|${now}|advanced_masterclass|${entity.amount}|INR|captured||${digest}`;
      const sig = crypto.createHmac("sha256", TEST_PROXY_SECRET).update(sigTuple).digest("hex");

      const postEvent = {
        postData: {
          contents: JSON.stringify({
            event: "payment.captured",
            eventId,
            timestamp: now,
            proxy_version: "v2.1",
            target_product: "advanced_masterclass",
            payload_digest: digest,
            proxy_signature: sig,
            payload: { payment: { entity } },
          }),
        },
      };

      expect(sb.propsStore["PROCESSED_EVT_" + eventId]).toBeUndefined();
      expect(sb.propsStore["VERIFIED_INV_" + paymentId]).toBeUndefined();

      const res = JSON.parse(sb.context.doPost(postEvent).getContent());
      expect(res.status).toBe(200);

      // Verify persisted state after success
      expect(sb.propsStore["PROCESSED_EVT_" + eventId]).toBeDefined();
      const cached = JSON.parse(sb.propsStore["VERIFIED_INV_" + paymentId]);
      expect(cached.orderId).toBe(orderId);
      expect(cached.paymentId).toBe(paymentId);
      expect(cached.status).toBe("PAID");
    });

    it("diagnostics makes zero external network calls, sends zero emails, and appends zero rows", () => {
      const sb = createStagingSandbox();
      const diag = sb.context.runStagingDiagnostics();
      expect(diag.status).toBe("PASS");
      expect(sb.fetchCalls).toHaveLength(0);
      expect(sb.mailCalls).toHaveLength(0);
      expect(sb.sheetsData.Sheet1).toHaveLength(1);
      expect(sb.sheetsData.GST_Sales_Register).toHaveLength(1);
      expect(sb.sheetsData.Logs).toHaveLength(1);
    });

    it("diagnostic output never exposes secrets, passwords, or tokens", () => {
      const sb = createStagingSandbox();
      const reportStr = JSON.stringify(sb.context.runStagingDiagnostics());
      expect(reportStr).not.toContain(TEST_PROXY_SECRET);
      expect(reportStr).not.toContain(TEST_INVOICE_SECRET);
      expect(reportStr).not.toContain(TEST_RZP_SECRET);
    });

    it("diagnostics validates mandatory STRICT_PROXY_MODE and fails if missing or false", () => {
      const sb = createStagingSandbox({ propsOverrides: { STRICT_PROXY_MODE: "false" } });
      const diag = sb.context.runStagingDiagnostics();
      expect(diag.status).toBe("FAIL");
      expect(diag.checks.strictProxyMode).toBe("FAIL");
      expect(diag.errorCodes).toContain("STRICT_PROXY_MODE_REQUIRED");
    });

    it("handleProxyWebhook rejects unknown product keys instead of silently defaulting to ai_masterclass", () => {
      const sb = createStagingSandbox();
      const paymentId = "pay_test_unknown_prod_01";
      const orderId = "order_unknown_prod_01";
      const eventId = "evt_unknown_prod_01";
      const entity = {
        id: paymentId,
        order_id: orderId,
        amount: 29900,
        currency: "INR",
        status: "captured",
        is_test: true,
      };
      const digest = sb.context.computeCanonicalPayloadDigestGas(entity);
      const now = Date.now();
      const postEvent = {
        postData: {
          contents: JSON.stringify({
            event: "payment.captured",
            eventId,
            timestamp: now,
            proxy_version: "v2.1",
            target_product: "non_existent_course_key",
            payload_digest: digest,
            proxy_signature: "sig",
            payload: { payment: { entity } },
          }),
        },
      };

      const res = JSON.parse(sb.context.doPost(postEvent).getContent());
      expect(res.status).toBe(500);
      expect(res.error).toContain("UNKNOWN_PRODUCT_KEY");
      // Zero rows written
      expect(sb.sheetsData.Sheet1).toHaveLength(1);
      expect(sb.sheetsData.GST_Sales_Register).toHaveLength(1);
    });

    it("handleProxyWebhook invokes authoritative Razorpay verification and rejects if payment is not captured", () => {
      const paymentId = "pay_test_webhook_uncaptured";
      const orderId = "order_webhook_uncaptured";
      const eventId = "evt_uncaptured_01";
      const entity = {
        id: paymentId,
        order_id: orderId,
        amount: 29900,
        currency: "INR",
        status: "captured", // Client/webhook claimed captured
        is_test: true,
      };

      const sb = createStagingSandbox({
        urlFetchHandler: () => ({
          getResponseCode: () => 200,
          getContentText: () =>
            JSON.stringify({
              id: paymentId,
              order_id: orderId,
              status: "failed", // Razorpay authoritative server says payment failed!
              currency: "INR",
              amount: 29900,
              is_test: true,
            }),
        }),
      });

      const digest = sb.context.computeCanonicalPayloadDigestGas(entity);
      const now = Date.now();
      const sigTuple = `v2|${eventId}|payment.captured|${orderId}|${paymentId}|${now}|advanced_masterclass|${entity.amount}|INR|captured||${digest}`;
      const sig = crypto.createHmac("sha256", TEST_PROXY_SECRET).update(sigTuple).digest("hex");

      const postEvent = {
        postData: {
          contents: JSON.stringify({
            event: "payment.captured",
            eventId,
            timestamp: now,
            proxy_version: "v2.1",
            target_product: "advanced_masterclass",
            payload_digest: digest,
            proxy_signature: sig,
            payload: { payment: { entity } },
          }),
        },
      };

      const res = JSON.parse(sb.context.doPost(postEvent).getContent());
      expect(res.status).toBe(500);
      expect(res.error).toContain("PAYMENT_NOT_CAPTURED");
      // Zero rows written
      expect(sb.sheetsData.Sheet1).toHaveLength(1);
      expect(sb.sheetsData.GST_Sales_Register).toHaveLength(1);
      // Not marked processed
      expect(sb.propsStore["PROCESSED_EVT_" + eventId]).toBeUndefined();
    });

    it("recovers safely on retry when invoice generation succeeds but spreadsheet write throws: reuses PENDING_INV without burning extra counter", () => {
      const paymentId = "pay_test_retry_recovery";
      const orderId = "order_retry_recovery";
      const eventId = "evt_retry_recovery";
      const entity = {
        id: paymentId,
        order_id: orderId,
        amount: 29900,
        currency: "INR",
        status: "captured",
        is_test: true,
      };

      const sb = createStagingSandbox();
      const digest = sb.context.computeCanonicalPayloadDigestGas(entity);
      const now = Date.now();
      const sigTuple = `v2|${eventId}|payment.captured|${orderId}|${paymentId}|${now}|advanced_masterclass|${entity.amount}|INR|captured||${digest}`;
      const sig = crypto.createHmac("sha256", TEST_PROXY_SECRET).update(sigTuple).digest("hex");

      const initialCounter = parseInt(sb.propsStore["STAGING_INVOICE_COUNTER"] || "1000", 10);

      // 1. Manually simulate invoice counter increment with a pending invoice
      const invoice1 = sb.context.createStagingMockInvoice(paymentId, orderId, "advanced_masterclass");
      expect(invoice1).toBe("STAGE-INV-" + (initialCounter + 1));
      expect(sb.propsStore["PENDING_INV_" + paymentId]).toBe(invoice1);

      // 2. On subsequent attempt for the SAME paymentId, createStagingMockInvoice reuses the pending invoice
      const invoice2 = sb.context.createStagingMockInvoice(paymentId, orderId, "advanced_masterclass");
      expect(invoice2).toBe(invoice1); // Exactly the same invoice number!
      expect(sb.propsStore["STAGING_INVOICE_COUNTER"]).toBe(String(initialCounter + 1)); // Counter was NOT incremented again!

      // 3. Now let the full webhook run and succeed
      const postEvent = {
        postData: {
          contents: JSON.stringify({
            event: "payment.captured",
            eventId,
            timestamp: now,
            proxy_version: "v2.1",
            target_product: "advanced_masterclass",
            payload_digest: digest,
            proxy_signature: sig,
            payload: { payment: { entity } },
          }),
        },
      };

      const res = JSON.parse(sb.context.doPost(postEvent).getContent());
      expect(res.status).toBe(200);
      expect(res.invoiceNumber).toBe(invoice1);

      // Confirm PENDING_INV was cleaned up and VERIFIED_INV was committed
      expect(sb.propsStore["PENDING_INV_" + paymentId]).toBeUndefined();
      expect(sb.propsStore["VERIFIED_INV_" + paymentId]).toBeDefined();
    });
  });
});
