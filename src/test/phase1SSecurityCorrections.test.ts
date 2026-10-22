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
        let mockProduct: string | null = "claude_masterclass";
        if (payId.includes("no_catalog")) {
          mockProduct = null;
        } else if (payId.includes("ai_masterclass") || payId.includes("stg_001")) {
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
        } else if (payId.includes("advanced") || payId.includes("stg_002")) {
          mockAmount = 29900;
          mockProduct = "advanced_masterclass";
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
          is_test: true,
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

describe("PHASE 1S: Final Source-Level Security Corrections Suite", () => {
  describe("Requirement 1: timingSafeEqualGas Character-by-Character Comparison", () => {
    it("returns true for identical matching strings", () => {
      const sb = createStagingSandbox();
      expect(sb.context.timingSafeEqualGas("secret_signature_12345", "secret_signature_12345")).toBe(true);
      expect(sb.context.timingSafeEqualGas("", "")).toBe(true);
      const longHex = "a".repeat(64);
      expect(sb.context.timingSafeEqualGas(longHex, longHex)).toBe(true);
    });

    it("returns false for equal-length strings differing at first character", () => {
      const sb = createStagingSandbox();
      expect(sb.context.timingSafeEqualGas("xecret_signature_12345", "secret_signature_12345")).toBe(false);
    });

    it("returns false for equal-length strings differing at middle character", () => {
      const sb = createStagingSandbox();
      expect(sb.context.timingSafeEqualGas("secret_xignature_12345", "secret_signature_12345")).toBe(false);
    });

    it("returns false for equal-length strings differing at last character", () => {
      const sb = createStagingSandbox();
      expect(sb.context.timingSafeEqualGas("secret_signature_12344", "secret_signature_12345")).toBe(false);
    });

    it("returns false for strings of different lengths", () => {
      const sb = createStagingSandbox();
      expect(sb.context.timingSafeEqualGas("short", "longer_string")).toBe(false);
      expect(sb.context.timingSafeEqualGas("secret_signature_12345", "secret_signature_1234")).toBe(false);
      expect(sb.context.timingSafeEqualGas("secret_signature_12345", "secret_signature_123456")).toBe(false);
      expect(sb.context.timingSafeEqualGas("", "non_empty")).toBe(false);
      expect(sb.context.timingSafeEqualGas("non_empty", "")).toBe(false);
    });

    it("returns false for non-string inputs", () => {
      const sb = createStagingSandbox();
      expect(sb.context.timingSafeEqualGas(null, "secret")).toBe(false);
      expect(sb.context.timingSafeEqualGas("secret", undefined)).toBe(false);
      expect(sb.context.timingSafeEqualGas(12345, 12345)).toBe(false);
      expect(sb.context.timingSafeEqualGas({}, {})).toBe(false);
      expect(sb.context.timingSafeEqualGas(["a"], ["a"])).toBe(false);
    });
  });

  describe("Requirement 2: Test-Mode Validation via Trusted Credentials & Environment", () => {
    it("fails closed if environment is not staging or local_test", () => {
      const sb = createStagingSandbox({ propsOverrides: { APP_ENVIRONMENT: "dev_custom" } });
      expect(() => {
        sb.context.validatePaymentEnvironment({ id: "pay_test_01", status: "captured" }, false);
      }).toThrowError(/INVALID_ENVIRONMENT/);
    });

    it("fails closed if RAZORPAY_KEY_ID is missing or not a test credential (rzp_test_)", () => {
      const sbMissing = createStagingSandbox({ propsOverrides: { RAZORPAY_KEY_ID: null } });
      expect(() => {
        sbMissing.context.validatePaymentEnvironment({ id: "pay_test_01", status: "captured" }, false);
      }).toThrowError(/MISSING_RAZORPAY_KEY_ID/);

      const sbLive = createStagingSandbox({ propsOverrides: { RAZORPAY_KEY_ID: "rzp_live_realSecretKey" } });
      expect(() => {
        sbLive.context.validatePaymentEnvironment({ id: "pay_test_01", status: "captured" }, false);
      }).toThrowError(/LIVE_CREDENTIALS_IN_STAGING/);
    });

    it("fails closed if RAZORPAY_KEY_SECRET is missing", () => {
      const sb = createStagingSandbox({ propsOverrides: { RAZORPAY_KEY_SECRET: null } });
      expect(() => {
        sb.context.validatePaymentEnvironment({ id: "pay_test_01", status: "captured" }, false);
      }).toThrowError(/Missing required Script Property: RAZORPAY_KEY_SECRET/);
    });

    it("does NOT treat status === 'captured' or payment ID prefix alone as proof of test mode", () => {
      // In this test, an attacker presents a captured status and a pay_test_ ID,
      // but configured credentials are live or corrupted
      const sb = createStagingSandbox({ propsOverrides: { RAZORPAY_KEY_ID: "invalid_key_prefix" } });
      expect(() => {
        sb.context.validatePaymentEnvironment({ id: "pay_test_123456789", status: "captured", is_test: true }, true);
      }).toThrowError(/INVALID_TEST_KEY_PREFIX/);
    });

    it("strictly rejects payment entities marked with is_test: false, pay_live_, or notes.mode: live", () => {
      const sb = createStagingSandbox();
      expect(() => {
        sb.context.validatePaymentEnvironment({ id: "pay_live_realPayment123", status: "captured" }, false);
      }).toThrowError(/LIVE_PAYMENT_IN_STAGING/);

      expect(() => {
        sb.context.validatePaymentEnvironment({ id: "pay_test_123", status: "captured", is_test: false }, false);
      }).toThrowError(/LIVE_PAYMENT_IN_STAGING/);

      expect(() => {
        sb.context.validatePaymentEnvironment({ id: "pay_test_123", status: "captured", notes: { mode: "live" } }, false);
      }).toThrowError(/LIVE_PAYMENT_IN_STAGING/);
    });

    it("succeeds when staging environment and test credentials are fully established", () => {
      const sb = createStagingSandbox();
      expect(() => {
        sb.context.validatePaymentEnvironment({ id: "pay_test_staging_01", status: "captured", is_test: true }, true);
      }).not.toThrow();
    });
  });

  describe("Requirement 3: Expected Payment Amount Derivation in Webhook Processing", () => {
    it("derives expected amount from Sheet1 order registration when pre-registered", () => {
      const orderId = "order_prereg_amt_01";
      const paymentId = "pay_test_prereg_amt_01";
      const eventId = "evt_prereg_amt_01";

      const sb = createStagingSandbox({
        sheetRows: {
          Sheet1: [
            [
              new Date().toISOString(), "Pre-registered Student", "student@test.com", "9876543210",
              "claude_masterclass", "Developer", 299, "PENDING", orderId, "", "PENDING", "PENDING"
            ]
          ]
        },
        urlFetchHandler: (url: string) => ({
          getResponseCode: () => 200,
          getContentText: () =>
            JSON.stringify({
              id: paymentId,
              order_id: orderId,
              status: "captured",
              currency: "INR",
              amount: 29900, // 29900 paise = ₹299
              is_test: true,
            }),
        }),
      });

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
    });

    it("falls back to product catalog price when order was not pre-registered in Sheet1", () => {
      const orderId = "order_catalog_amt_01";
      const paymentId = "pay_test_catalog_amt_01";
      const eventId = "evt_catalog_amt_01";

      const sb = createStagingSandbox({
        urlFetchHandler: () => ({
          getResponseCode: () => 200,
          getContentText: () =>
            JSON.stringify({
              id: paymentId,
              order_id: orderId,
              status: "captured",
              currency: "INR",
              amount: 99900, // 99900 paise = ₹999 for consulting
              is_test: true,
              notes: { product_key: "consulting" },
            }),
        }),
      });

      const entity = {
        id: paymentId,
        order_id: orderId,
        amount: 99900,
        currency: "INR",
        status: "captured",
        is_test: true,
        notes: { product_key: "consulting" },
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
      expect(res.status).toBe(200);
      expect(res.success).toBe(true);
      expect(res.invoiceNumber).toBe("STAGE-INV-1001");
    });

    it("fails closed when incoming webhook amount tries to define itself but Razorpay amount mismatches catalog price", () => {
      const orderId = "order_tamper_amt_01";
      const paymentId = "pay_test_tamper_amt_01";
      const eventId = "evt_tamper_amt_01";

      // Attacker paid ₹1 (100 paise) for a ₹299 product (claude_masterclass)
      const sb = createStagingSandbox({
        urlFetchHandler: () => ({
          getResponseCode: () => 200,
          getContentText: () =>
            JSON.stringify({
              id: paymentId,
              order_id: orderId,
              status: "captured",
              currency: "INR",
              amount: 100, // Razorpay has ₹1
              is_test: true,
              notes: { product_key: "claude_masterclass" },
            }),
        }),
      });

      const entity = {
        id: paymentId,
        order_id: orderId,
        amount: 100, // Attacker claims ₹1 in webhook
        currency: "INR",
        status: "captured",
        is_test: true,
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
      expect(res.status).toBe(500);
      expect(res.success).toBe(false);
      expect(res.error).toContain("AMOUNT_MISMATCH");
    });
  });

  describe("Requirement 4: Elimination of data.amount Fallback in Client Callback", () => {
    it("rejects client callback with UNVERIFIED_EXPECTED_AMOUNT when expected amount cannot be established", () => {
      const sb = createStagingSandbox();
      const orderId = "order_no_catalog_no_sheet";
      const payId = "pay_test_no_catalog_no_sheet";
      const validSig = crypto.createHmac("sha256", TEST_RZP_SECRET).update(`${orderId}|${payId}`).digest("hex");

      const res = JSON.parse(
        sb.context.handleClientPaymentCallback(sb.context.getStagingSpreadsheet(), {
          orderId,
          paymentId: payId,
          signature: validSig,
          amount: 299, // Client passes amount: 299, but server refuses to trust it!
        }).getContent()
      );

      expect(res.success).toBe(false);
      expect(res.status).toBe(400);
      expect(res.error).toMatch(/UNVERIFIED_EXPECTED_AMOUNT|UNBOUND_ORDER_PRODUCT/);
    });

    it("accepts client callback and issues invoice token when productKey is provided and validated", () => {
      const orderId = "order_with_valid_catalog_key";
      const payId = "pay_test_with_valid_catalog_key";
      const validSig = crypto.createHmac("sha256", TEST_RZP_SECRET).update(`${orderId}|${payId}`).digest("hex");
      const sb = createStagingSandbox({
        sheetRows: {
          Sheet1: [
            ["2026-10-20T10:00:00.000Z", "Student", "s@test.com", "9876543210", "claude_masterclass", "PENDING", 299, "", orderId, ""]
          ]
        }
      });

      const res = JSON.parse(
        sb.context.handleClientPaymentCallback(sb.context.getStagingSpreadsheet(), {
          orderId,
          paymentId: payId,
          signature: validSig,
          productKey: "claude_masterclass", // Catalog price is ₹299 (29900 paise)
          amount: 1, // Tampered client amount is completely ignored
        }).getContent()
      );

      expect(res.success).toBe(true);
      expect(res.status).toBe(200);
      expect(res.verified).toBe(true);
      expect(res.invoiceToken).toBeDefined();
    });
  });

  describe("Requirement 5: Authentic Invoice Retrieval & Zero Fabrication", () => {
    it("fails closed with INVOICE_NOT_FOUND when no authoritative invoice record exists", () => {
      const sb = createStagingSandbox();
      const paymentId = "pay_test_unissued_inv";
      const orderId = "order_unissued_inv";

      const exp = Date.now() + 3600000;
      const sig = crypto.createHmac("sha256", TEST_INVOICE_SECRET).update(`${paymentId}|${orderId}|${exp}`).digest("hex");
      const token = `${exp}.${sig}`;

      // Neither in VERIFIED_INV_ cache nor in GST_Sales_Register
      const res = sb.context.getVerifiedInvoiceRecord(sb.context.getStagingSpreadsheet(), paymentId, orderId, token);
      expect(res.success).toBe(false);
      expect(res.verified).toBe(false);
      expect(res.error).toContain("INVOICE_NOT_FOUND");
    });

    it("never fabricates a synthetic invoice number from payment ID characters", () => {
      const sb = createStagingSandbox({
        sheetRows: {
          Sheet1: [
            [
              new Date().toISOString(), "Student A", "student@test.com", "9876543210",
              "ai_masterclass", "Developer", 99, "✅ PAID", "order_paid_no_gst", "pay_test_paid_no_gst", "SUPPRESSED", "SUPPRESSED"
            ]
          ]
        }
      });
      const paymentId = "pay_test_paid_no_gst";
      const orderId = "order_paid_no_gst";

      const exp = Date.now() + 3600000;
      const sig = crypto.createHmac("sha256", TEST_INVOICE_SECRET).update(`${paymentId}|${orderId}|${exp}`).digest("hex");
      const token = `${exp}.${sig}`;

      // Sheet1 has PAID, but GST_Sales_Register has NO invoice row and cache is empty
      const res = sb.context.getVerifiedInvoiceRecord(sb.context.getStagingSpreadsheet(), paymentId, orderId, token);
      expect(res.success).toBe(false);
      expect(res.error).toContain("INVOICE_NOT_FOUND");
      // Assert zero fabricated invoice object returned
      expect(res.invoice).toBeUndefined();
    });

    it("retrieves authentic invoice recorded in GST_Sales_Register when cache is cold", () => {
      const paymentId = "pay_test_gst_retrieval_01";
      const orderId = "order_gst_retrieval_01";
      const authenticInvoiceNo = "STAGE-INV-9876";

      const sb = createStagingSandbox({
        sheetRows: {
          Sheet1: [
            [
              new Date().toISOString(), "Registered Student", "student@test.com", "9876543210",
              "claude_masterclass", "Developer", 299, "✅ PAID", orderId, paymentId, "SUPPRESSED", "SUPPRESSED"
            ]
          ],
          GST_Sales_Register: [
            [
              new Date().toISOString(),
              authenticInvoiceNo,
              "20 Oct 2026",
              "Registered Student",
              "student@test.com",
              "9876543210",
              "Tamil Nadu (33)",
              "B2C",
              "No",
              "999293",
              "Claude Coding Masterclass",
              253.39,
              "9%",
              22.81,
              "9%",
              22.8,
              0,
              299,
              paymentId,
              orderId,
            ]
          ]
        }
      });

      const exp = Date.now() + 3600000;
      const sig = crypto.createHmac("sha256", TEST_INVOICE_SECRET).update(`${paymentId}|${orderId}|${exp}`).digest("hex");
      const token = `${exp}.${sig}`;

      const res = sb.context.getVerifiedInvoiceRecord(sb.context.getStagingSpreadsheet(), paymentId, orderId, token);
      expect(res.success).toBe(true);
      expect(res.verified).toBe(true);
      expect(res.invoice.invoiceNumber).toBe(authenticInvoiceNo);
      expect(res.invoice.totalAmountPaid).toBe(299);
      expect(res.invoice.courseName).toBe("Claude Coding Masterclass");
    });
  });
});
