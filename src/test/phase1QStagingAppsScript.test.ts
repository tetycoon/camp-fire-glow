import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import crypto from "node:crypto";
import {
  computeHardenedPayloadDigest,
  computeHardenedProxySignature,
  KNOWN_PRODUCTION_SPREADSHEET_IDS,
  KNOWN_PRODUCTION_GAS_URLS,
} from "../../backend/webhook_proxy/razorpay_webhook_proxy.js";
import { validateStagingConfiguration } from "../../scripts/verify-staging-config.cjs";

const STAGING_SCRIPT_PATH = path.resolve(__dirname, "../../backend/apps_script/staging/apps_script.gs");
const TEST_PROXY_SECRET = "staging_proxy_secret_high_entropy_32_characters_123456";
const TEST_INVOICE_SECRET = "staging_invoice_secret_high_entropy_32_chars_123456";
const TEST_RZP_SECRET = "staging_rzp_test_secret_32_chars_long_123456";
const VALID_STAGING_SPREADSHEET_ID = "1staging_payments_dedicated_sheet_987654321";

interface SandboxOptions {
  propsOverrides?: Record<string, string | null>;
  sheetRows?: Record<string, unknown[][]>;
  urlFetchHandler?: (url: string, params: any) => { getResponseCode: () => number; getContentText: () => string };
}

function createStagingSandbox(options: SandboxOptions = {}) {
  const code = fs.readFileSync(STAGING_SCRIPT_PATH, "utf8");

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
        waitLock: () => {},
        releaseLock: () => {},
      }),
    },
    SpreadsheetApp: {
      openById: (id: string) => {
        if (KNOWN_PRODUCTION_SPREADSHEET_IDS.includes(id)) {
          throw new Error("PRODUCTION_SPREADSHEET_IN_STAGING: Cannot open production spreadsheet ID " + id);
        }
        return mockSpreadsheet;
      },
      getActiveSpreadsheet: () => mockSpreadsheet,
    },
    Utilities: {
      Charset: { UTF_8: "UTF_8" },
      DigestAlgorithm: { SHA_256: "SHA_256" },
      base64Encode: (val: string) => Buffer.from(val, "utf8").toString("base64"),
      formatDate: (_d: any, _tz: any, _fmt: any) => "20 Oct 2026",
      computeHmacSha256Signature: (val: string, key: string) => {
        const buf = crypto.createHmac("sha256", key).update(val, "utf8").digest();
        return Array.from(buf).map((b) => (b > 127 ? b - 256 : b));
      },
      computeDigest: (_algo: string, val: string) => {
        const buf = crypto.createHash("sha256").update(val, "utf8").digest();
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
        let inferredOrderId = payId.replace(/^pay_test_/, "order_").replace(/^pay_/, "order_");
        if (payId.startsWith("pay_test_order_")) {
          inferredOrderId = payId.replace(/^pay_test_/, "");
        } else if (payId.startsWith("pay_test_stg_")) {
          inferredOrderId = payId.replace(/^pay_test_stg_/, "order_stg_");
        } else if (payId.startsWith("pay_test_staging_")) {
          inferredOrderId = payId.replace(/^pay_test_staging_/, "order_staging_");
        } else if (payId.startsWith("pay_test_")) {
          inferredOrderId = payId.replace(/^pay_/, "order_");
        }

        let mockAmount = 29900;
        let mockProduct = "claude_masterclass";
        if (payId.includes("stg_001") || payId.includes("ai_masterclass")) {
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

describe("PHASE 1Q: Isolated Google Apps Script Staging Project Tests", () => {
  describe("1. Environment Requirement (APP_ENVIRONMENT === 'staging')", () => {
    it("fails closed when APP_ENVIRONMENT is missing", () => {
      const sb = createStagingSandbox({ propsOverrides: { APP_ENVIRONMENT: null } });
      expect(() => sb.context.getAppEnvironment()).toThrowError(/MISSING_ENVIRONMENT/);
    });

    it("fails closed when APP_ENVIRONMENT is set to 'production'", () => {
      const sb = createStagingSandbox({ propsOverrides: { APP_ENVIRONMENT: "production" } });
      expect(() => sb.context.getAppEnvironment()).toThrowError(/PRODUCTION_ENVIRONMENT_REJECTED/);
    });

    it("fails closed when APP_ENVIRONMENT is an unrecognized value", () => {
      const sb = createStagingSandbox({ propsOverrides: { APP_ENVIRONMENT: "development_sandbox" } });
      expect(() => sb.context.getAppEnvironment()).toThrowError(/INVALID_ENVIRONMENT/);
    });

    it("accepts APP_ENVIRONMENT='staging'", () => {
      const sb = createStagingSandbox({ propsOverrides: { APP_ENVIRONMENT: "staging" } });
      expect(sb.context.getAppEnvironment()).toBe("staging");
    });
  });

  describe("2. SPREADSHEET_ID Isolation & Known Production Sheet Rejection", () => {
    it("fails closed when SPREADSHEET_ID is missing", () => {
      const sb = createStagingSandbox({ propsOverrides: { SPREADSHEET_ID: null } });
      expect(() => sb.context.getSpreadsheetId()).toThrowError(/MISSING_SPREADSHEET_ID/);
    });

    it("rejects all 5 known production spreadsheet IDs in getSpreadsheetId()", () => {
      for (const prodId of KNOWN_PRODUCTION_SPREADSHEET_IDS) {
        const sb = createStagingSandbox({ propsOverrides: { SPREADSHEET_ID: prodId } });
        expect(() => sb.context.getSpreadsheetId()).toThrowError(/PRODUCTION_SPREADSHEET_IN_STAGING/);
      }
    });

    it("rejects all 5 known production spreadsheet IDs in assertSpreadsheetIsolation()", () => {
      const sb = createStagingSandbox();
      for (const prodId of KNOWN_PRODUCTION_SPREADSHEET_IDS) {
        expect(() => {
          sb.context.assertSpreadsheetIsolation({ getId: () => prodId });
        }).toThrowError(/PRODUCTION_SPREADSHEET_IN_STAGING/);
      }
    });
  });

  describe("3. Mandatory Staging Settings (MOCK_INVOICE_ADAPTER & SUPPRESS_NOTIFICATIONS)", () => {
    it("fails closed if MOCK_INVOICE_ADAPTER is missing", () => {
      const sb = createStagingSandbox({
        propsOverrides: { MOCK_INVOICE_ADAPTER: null, ENABLE_MOCK_INVOICE_ADAPTER: null },
      });
      expect(() => sb.context.isMockInvoiceAdapterEnabled()).toThrowError(/MOCK_INVOICE_REQUIRED_IN_STAGING/);
    });

    it("fails closed if MOCK_INVOICE_ADAPTER is set to 'false'", () => {
      const sb = createStagingSandbox({ propsOverrides: { MOCK_INVOICE_ADAPTER: "false" } });
      expect(() => sb.context.isMockInvoiceAdapterEnabled()).toThrowError(/MOCK_INVOICE_REQUIRED_IN_STAGING/);
    });

    it("fails closed if SUPPRESS_NOTIFICATIONS is missing", () => {
      const sb = createStagingSandbox({ propsOverrides: { SUPPRESS_NOTIFICATIONS: null } });
      expect(() => sb.context.isNotificationSuppressed()).toThrowError(/NOTIFICATION_SUPPRESSION_REQUIRED_IN_STAGING/);
    });

    it("fails closed if SUPPRESS_NOTIFICATIONS is set to 'false'", () => {
      const sb = createStagingSandbox({ propsOverrides: { SUPPRESS_NOTIFICATIONS: "false" } });
      expect(() => sb.context.isNotificationSuppressed()).toThrowError(/NOTIFICATION_SUPPRESSION_REQUIRED_IN_STAGING/);
    });
  });

  describe("4. Credential & Payment Isolation", () => {
    it("rejects live Razorpay key ID in staging", () => {
      const sb = createStagingSandbox({ propsOverrides: { RAZORPAY_KEY_ID: "rzp_live_abc123456" } });
      expect(() => sb.context.getRazorpayKeyId(false)).toThrowError(/LIVE_CREDENTIALS_IN_STAGING/);
    });

    it("rejects live payment entity submitted to staging", () => {
      const sb = createStagingSandbox();
      expect(() => {
        sb.context.validatePaymentEnvironment({ id: "pay_live_999999", is_test: false });
      }).toThrowError(/LIVE_PAYMENT_IN_STAGING/);
    });

    it("rejects production FunnelsDone location ID in staging", () => {
      const sb = createStagingSandbox({ propsOverrides: { FUNNELSDONE_LOCATION_ID: "uUUUKRH7EP2A0oJBv4Zb" } });
      expect(() => sb.context.getFunnelsDoneLocationId()).toThrowError(/PRODUCTION_LOCATION_IN_STAGING/);
    });

    it("rejects production WhatsApp phone number ID in staging", () => {
      const sb = createStagingSandbox({ propsOverrides: { WHATSAPP_PHONE_NUMBER_ID: "1089787377552637" } });
      expect(() => sb.context.getWhatsAppPhoneNumberId()).toThrowError(/PRODUCTION_PHONE_IN_STAGING/);
    });
  });

  describe("5. Client Payment Callback Verification & Rejection of Client-Provided Values (Item 1)", () => {
    it("rejects client callback missing parameters", () => {
      const sb = createStagingSandbox();
      const res = JSON.parse(
        sb.context.handleClientPaymentCallback(sb.context.getStagingSpreadsheet(), {
          orderId: "order_123",
          signature: "some_sig",
        }).getContent()
      );
      expect(res.success).toBe(false);
      expect(res.status).toBe(400);
      expect(res.error).toContain("MISSING_CALLBACK_PARAMS");
    });

    it("rejects client callback with invalid or forged signature", () => {
      const sb = createStagingSandbox();
      const res = JSON.parse(
        sb.context.handleClientPaymentCallback(sb.context.getStagingSpreadsheet(), {
          orderId: "order_123",
          paymentId: "pay_test_123",
          signature: "forged_signature_hex_value",
        }).getContent()
      );
      expect(res.success).toBe(false);
      expect(res.status).toBe(401);
      expect(res.error).toContain("UNAUTHORIZED_PAYMENT_CALLBACK");
    });

    it("direct client callback cannot mark payments paid or issue invoices based solely on client-provided flags", () => {
      const sb = createStagingSandbox();
      const orderId = "order_staging_cb_tamper";
      const payId = "pay_test_staging_cb_tamper";
      const validSig = crypto.createHmac("sha256", TEST_RZP_SECRET).update(`${orderId}|${payId}`).digest("hex");

      const res = JSON.parse(
        sb.context.handleClientPaymentCallback(sb.context.getStagingSpreadsheet(), {
          orderId,
          paymentId: payId,
          signature: validSig,
          productKey: "advanced_masterclass",
          paid: true,
          status: "PAID",
          amount: 1, // Tampered ₹1 amount (ignored by server)
          invoiceNumber: "FORGED-INV-9999",
        }).getContent()
      );

      expect(res.success).toBe(true);
      expect(res.verified).toBe(true);
      // Confirms ZERO rows appended to Sheet1 or GST_Sales_Register by client callback alone
      expect(sb.sheetsData.Sheet1).toHaveLength(1); // Header only
      expect(sb.sheetsData.GST_Sales_Register).toHaveLength(1); // Header only
    });

    it("accepts valid client signature and issues cryptographically signed invoice token", () => {
      const sb = createStagingSandbox();
      const orderId = "order_staging_cb_01";
      const payId = "pay_test_staging_cb_01";
      const validSig = crypto.createHmac("sha256", TEST_RZP_SECRET).update(`${orderId}|${payId}`).digest("hex");

      const res = JSON.parse(
        sb.context.handleClientPaymentCallback(sb.context.getStagingSpreadsheet(), {
          orderId,
          paymentId: payId,
          signature: validSig,
          productKey: "advanced_masterclass",
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

  describe("6. Authoritative Razorpay Server Verification (Item 2)", () => {
    it("verifies valid captured payment with matching order, amount, and currency", () => {
      const orderId = "order_rzp_server_01";
      const paymentId = "pay_test_server_01";
      const sb = createStagingSandbox({
        urlFetchHandler: (_url, _params) => ({
          getResponseCode: () => 200,
          getContentText: () =>
            JSON.stringify({
              id: paymentId,
              order_id: orderId,
              status: "captured",
              amount: 29900,
              currency: "INR",
            }),
        }),
      });

      const payment = sb.context.verifyPaymentWithRazorpayServer(orderId, paymentId, 299, false);
      expect(payment.id).toBe(paymentId);
      expect(payment.status).toBe("captured");
      expect(payment.currency).toBe("INR");
    });

    it("rejects payment if Razorpay status is not captured (e.g. authorized)", () => {
      const orderId = "order_rzp_server_02";
      const paymentId = "pay_test_server_02";
      const sb = createStagingSandbox({
        urlFetchHandler: () => ({
          getResponseCode: () => 200,
          getContentText: () =>
            JSON.stringify({
              id: paymentId,
              order_id: orderId,
              status: "authorized", // NOT captured
              amount: 29900,
              currency: "INR",
            }),
        }),
      });

      expect(() => {
        sb.context.verifyPaymentWithRazorpayServer(orderId, paymentId, 299, false);
      }).toThrowError(/PAYMENT_NOT_CAPTURED/);
    });

    it("rejects payment if order ID does not match", () => {
      const sb = createStagingSandbox({
        urlFetchHandler: () => ({
          getResponseCode: () => 200,
          getContentText: () =>
            JSON.stringify({
              id: "pay_test_server_03",
              order_id: "order_DIFFERENT_999",
              status: "captured",
              amount: 29900,
              currency: "INR",
            }),
        }),
      });

      expect(() => {
        sb.context.verifyPaymentWithRazorpayServer("order_expected_03", "pay_test_server_03", 299, false);
      }).toThrowError(/ORDER_MISMATCH/);
    });

    it("rejects payment if currency is not INR", () => {
      const orderId = "order_rzp_server_04";
      const paymentId = "pay_test_server_04";
      const sb = createStagingSandbox({
        urlFetchHandler: () => ({
          getResponseCode: () => 200,
          getContentText: () =>
            JSON.stringify({
              id: paymentId,
              order_id: orderId,
              status: "captured",
              amount: 29900,
              currency: "USD",
            }),
        }),
      });

      expect(() => {
        sb.context.verifyPaymentWithRazorpayServer(orderId, paymentId, 299, false);
      }).toThrowError(/CURRENCY_MISMATCH/);
    });

    it("rejects payment if amount does not match authoritative expected amount", () => {
      const orderId = "order_rzp_server_05";
      const paymentId = "pay_test_server_05";
      const sb = createStagingSandbox({
        urlFetchHandler: () => ({
          getResponseCode: () => 200,
          getContentText: () =>
            JSON.stringify({
              id: paymentId,
              order_id: orderId,
              status: "captured",
              amount: 100, // ₹1 instead of ₹299
              currency: "INR",
            }),
        }),
      });

      expect(() => {
        sb.context.verifyPaymentWithRazorpayServer(orderId, paymentId, 299, false);
      }).toThrowError(/AMOUNT_MISMATCH/);
    });
  });

  describe("7. Invoice Token Signing, Expiration, and Reuse Prevention (Item 4)", () => {
    it("authorizes invoice retrieval with a valid unexpired invoice token", () => {
      const sb = createStagingSandbox();
      const paymentId = "pay_test_inv_tok_01";
      const orderId = "order_inv_tok_01";
      sb.propsStore["VERIFIED_INV_" + paymentId] = "STAGE-INV-2001";

      const exp = Date.now() + 3600000; // 1 hour in future
      const sig = crypto.createHmac("sha256", TEST_INVOICE_SECRET).update(`${paymentId}|${orderId}|${exp}`).digest("hex");
      const token = `${exp}.${sig}`;

      const res = sb.context.getVerifiedInvoiceRecord(null, paymentId, orderId, token);
      expect(res.success).toBe(true);
      expect(res.verified).toBe(true);
      expect(res.invoice.invoiceNumber).toBe("STAGE-INV-2001");
    });

    it("rejects invoice retrieval when token is expired", () => {
      const sb = createStagingSandbox();
      const paymentId = "pay_test_inv_tok_02";
      const orderId = "order_inv_tok_02";
      sb.propsStore["VERIFIED_INV_" + paymentId] = "STAGE-INV-2002";

      const exp = Date.now() - 3600000; // 1 hour in past (EXPIRED)
      const sig = crypto.createHmac("sha256", TEST_INVOICE_SECRET).update(`${paymentId}|${orderId}|${exp}`).digest("hex");
      const token = `${exp}.${sig}`;

      const res = sb.context.getVerifiedInvoiceRecord(null, paymentId, orderId, token);
      expect(res.success).toBe(false);
      expect(res.error).toContain("UNAUTHORIZED_INVOICE_ACCESS");
    });

    it("rejects token reuse across different payments (token binding security)", () => {
      const sb = createStagingSandbox();
      const paymentA = "pay_test_inv_tok_A";
      const orderA = "order_inv_tok_A";
      const paymentB = "pay_test_inv_tok_B";
      const orderB = "order_inv_tok_B";

      sb.propsStore["VERIFIED_INV_" + paymentA] = "STAGE-INV-2003";
      sb.propsStore["VERIFIED_INV_" + paymentB] = "STAGE-INV-2004";

      // Token generated specifically for Payment A
      const exp = Date.now() + 3600000;
      const sigA = crypto.createHmac("sha256", TEST_INVOICE_SECRET).update(`${paymentA}|${orderA}|${exp}`).digest("hex");
      const tokenA = `${exp}.${sigA}`;

      // Attacker tries to use Token A to authorize Payment B
      const res = sb.context.getVerifiedInvoiceRecord(null, paymentB, orderB, tokenA);
      expect(res.success).toBe(false);
      expect(res.error).toContain("UNAUTHORIZED_INVOICE_ACCESS");
    });

    it("fails closed if INVOICE_TOKEN_SECRET is missing", () => {
      const sb = createStagingSandbox({ propsOverrides: { INVOICE_TOKEN_SECRET: null } });
      const res = sb.context.getVerifiedInvoiceRecord(null, "pay_test_001", "order_001", "123.sig");
      expect(res.success).toBe(false);
      expect(res.error).toContain("MISSING_INVOICE_TOKEN_SECRET");
    });
  });

  describe("8. Read-Only Diagnostic Function & Full Tab Header Verification (Item 6)", () => {
    it("returns status: PASS when all staging configurations and spreadsheet headers are valid", () => {
      const sb = createStagingSandbox();
      const report = sb.context.runStagingDiagnostics();

      expect(report.status).toBe("PASS");
      expect(report.errorCodes).toHaveLength(0);
      expect(report.checks.environment).toBe("PASS");
      expect(report.checks.spreadsheetIsolation).toBe("PASS");
      expect(report.checks.spreadsheetAccess).toBe("PASS");
      expect(report.checks.mockInvoiceAdapter).toBe("PASS");
      expect(report.checks.notificationSuppression).toBe("PASS");
      expect(report.checks.strictProxyMode).toBe("PASS");
      expect(report.checks.razorpayKey).toBe("PASS");
      expect(report.checks.razorpaySecret).toBe("PASS");
      expect(report.checks.razorpayIntlKey).toBe("PASS");
      expect(report.checks.razorpayIntlSecret).toBe("PASS");
      expect(report.checks.sheetHeaders).toBe("PASS");
      expect(report.checks.gstHeaders).toBe("PASS");
      expect(report.checks.logsTab).toBe("PASS");

      // Verify zero rows appended during diagnostics (pure read-only)
      expect(sb.sheetsData.Sheet1).toHaveLength(1);
      expect(sb.sheetsData.GST_Sales_Register).toHaveLength(1);
      expect(sb.sheetsData.Logs).toHaveLength(1);
    });

    it("returns status: FAIL with INVALID_SHEET1_HEADERS if Sheet1 is missing any required header", () => {
      const sb = createStagingSandbox({
        sheetRows: {
          // Missing "WhatsApp Status"
          Sheet1: [],
        },
      });
      // Mutate header row to remove "WhatsApp Status"
      sb.sheetsData.Sheet1[0] = [
        "Timestamp", "Name", "Email", "Phone", "Course", "UserType", "Amount",
        "Payment Status", "Order ID", "Payment ID", "Email Status"
      ];

      const report = sb.context.runStagingDiagnostics();
      expect(report.status).toBe("FAIL");
      expect(report.checks.sheetHeaders).toBe("FAIL");
      expect(report.errorCodes).toContain("INVALID_SHEET1_HEADERS");
    });

    it("returns status: FAIL with INVALID_GST_HEADERS if GST_Sales_Register is missing any required header", () => {
      const sb = createStagingSandbox();
      // Mutate GST headers to remove "SAC Code"
      sb.sheetsData.GST_Sales_Register[0] = [
        "Timestamp", "Invoice No", "Invoice Date", "Customer Name", "Customer Email",
        "Customer Phone", "Place of Supply", "Supply Type", "Reverse Charge",
        "Service Description", "Taxable Value (₹)", "CGST Rate (%)", "CGST Amount (₹)",
        "SGST Rate (%)", "SGST Amount (₹)", "Round Off (₹)", "Total Invoice Value (₹)",
        "Payment ID", "Order ID"
      ];

      const report = sb.context.runStagingDiagnostics();
      expect(report.status).toBe("FAIL");
      expect(report.checks.gstHeaders).toBe("FAIL");
      expect(report.errorCodes).toContain("INVALID_GST_HEADERS");
    });

    it("returns status: FAIL with INVALID_LOGS_HEADERS if Logs tab is missing required headers", () => {
      const sb = createStagingSandbox();
      sb.sheetsData.Logs[0] = ["Timestamp", "Event"]; // Missing "Details"

      const report = sb.context.runStagingDiagnostics();
      expect(report.status).toBe("FAIL");
      expect(report.checks.logsTab).toBe("FAIL");
      expect(report.errorCodes).toContain("INVALID_LOGS_HEADERS");
    });

    it("never prints secrets, keys, or customer PII in diagnostic output", () => {
      const sb = createStagingSandbox();
      const reportStr = JSON.stringify(sb.context.runStagingDiagnostics());

      expect(reportStr).not.toContain(TEST_PROXY_SECRET);
      expect(reportStr).not.toContain(TEST_INVOICE_SECRET);
      expect(reportStr).not.toContain(TEST_RZP_SECRET);
    });
  });

  describe("9. Webhook v2.1 Verification & Anti-Replay (Item 3)", () => {
    it("rejects protocol downgrade if proxy_version is missing or not v2.1", () => {
      const sb = createStagingSandbox();
      const postEvent = {
        postData: {
          contents: JSON.stringify({
            event: "payment.captured",
            proxy_version: "v2", // DOWNGRADE
            payload: { payment: { entity: { id: "pay_test_01", order_id: "order_01" } } },
          }),
        },
      };

      const res = JSON.parse(sb.context.doPost(postEvent).getContent());
      expect(res.status).toBe(500);
      expect(res.error).toContain("PROTOCOL_DOWNGRADE_REJECTED");
    });

    it("rejects webhook if timestamp has drifted > 5 minutes", () => {
      const sb = createStagingSandbox();
      const expiredTimestamp = Date.now() - 400000; // > 6.6 minutes ago
      const postEvent = {
        postData: {
          contents: JSON.stringify({
            event: "payment.captured",
            proxy_version: "v2.1",
            timestamp: expiredTimestamp,
            payload: { payment: { entity: { id: "pay_test_01", order_id: "order_01" } } },
          }),
        },
      };

      const res = JSON.parse(sb.context.doPost(postEvent).getContent());
      expect(res.status).toBe(500);
      expect(res.error).toContain("TIMESTAMP_DRIFT_EXCEEDED");
    });

    it("processes valid v2.1 webhook, generates STAGE-INV-1001, appends to Sheet1 & GST_Sales_Register, suppresses notifications", () => {
      const sb = createStagingSandbox();
      const entity = {
        id: "pay_test_stg_001",
        order_id: "order_stg_001",
        amount: 9900,
        currency: "INR",
        status: "captured",
        account_id: "acc_test_staging",
        is_test: true,
        notes: {
          customer_name: "Staging Learner",
          product_key: "ai_masterclass",
        },
      };

      const digest = computeHardenedPayloadDigest(entity);
      const now = Date.now();
      const eventId = "evt_stg_001";
      const targetProduct = "ai_masterclass";

      const sig = computeHardenedProxySignature({
        proxyVersion: "v2.1",
        eventId,
        eventType: "payment.captured",
        orderId: entity.order_id,
        paymentId: entity.id,
        timestamp: now,
        productKey: targetProduct,
        amount: entity.amount,
        currency: entity.currency,
        status: entity.status,
        accountId: entity.account_id,
        payloadDigest: digest,
      }, TEST_PROXY_SECRET);

      const postEvent = {
        postData: {
          contents: JSON.stringify({
            event: "payment.captured",
            eventId,
            timestamp: now,
            proxy_version: "v2.1",
            target_product: targetProduct,
            payload_digest: digest,
            proxy_signature: sig,
            payload: { payment: { entity } },
          }),
        },
      };

      const res = JSON.parse(sb.context.doPost(postEvent).getContent());

      expect(res.success).toBe(true);
      expect(res.status).toBe(200);
      expect(res.invoiceNumber).toBe("STAGE-INV-1001");
      expect(res.notificationsSuppressed).toBe(true);

      // Verify Sheet1 entry
      expect(sb.sheetsData.Sheet1).toHaveLength(2); // Header + 1
      const regRow = sb.sheetsData.Sheet1[1];
      expect(regRow[1]).toBe("Staging Learner");
      expect(regRow[7]).toBe("✅ PAID");
      expect(regRow[8]).toBe("order_stg_001");
      expect(regRow[9]).toBe("pay_test_stg_001");
      expect(regRow[10]).toBe("SUPPRESSED");
      expect(regRow[11]).toBe("SUPPRESSED");

      // Verify GST Sales Register entry
      expect(sb.sheetsData.GST_Sales_Register).toHaveLength(2); // Header + 1
      const gstRow = sb.sheetsData.GST_Sales_Register[1];
      expect(gstRow[1]).toBe("STAGE-INV-1001");
      expect(gstRow[9]).toBe("999293"); // SAC Code
      expect(gstRow[11]).toBe(83.9); // Taxable value (₹99 / 1.18)
      expect(gstRow[13]).toBe(7.55); // CGST 9%
      expect(gstRow[15]).toBe(7.55); // SGST 9%
      expect(gstRow[17]).toBe(99); // Total invoice value
    });

    it("skips replayed webhook delivery idempotently without creating duplicate invoices", () => {
      const sb = createStagingSandbox();
      const entity = {
        id: "pay_test_stg_002",
        order_id: "order_stg_002",
        amount: 29900,
        currency: "INR",
        status: "captured",
        is_test: true,
      };

      const digest = computeHardenedPayloadDigest(entity);
      const now = Date.now();
      const eventId = "evt_stg_002";
      const targetProduct = "claude_masterclass";

      const sig = computeHardenedProxySignature({
        proxyVersion: "v2.1",
        eventId,
        eventType: "payment.captured",
        orderId: entity.order_id,
        paymentId: entity.id,
        timestamp: now,
        productKey: targetProduct,
        amount: entity.amount,
        currency: entity.currency,
        status: entity.status,
        accountId: "",
        payloadDigest: digest,
      }, TEST_PROXY_SECRET);

      const postEvent = {
        postData: {
          contents: JSON.stringify({
            event: "payment.captured",
            eventId,
            timestamp: now,
            proxy_version: "v2.1",
            target_product: targetProduct,
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

      // 2nd delivery (duplicate event)
      const res2 = JSON.parse(sb.context.doPost(postEvent).getContent());
      expect(res2.status).toBe(200);
      expect(res2.alreadyProcessed).toBe(true);
      expect(res2.duplicate).toBe(true);
      expect(sb.sheetsData.GST_Sales_Register).toHaveLength(2); // Still exactly 1 row
    });
  });

  describe("10. All Eight Product Routes & Zero Outbound External Calls (Items 7, 8, 9, 10)", () => {
    const products = [
      { key: "ai_masterclass", name: "AI Secrets Revealed Masterclass", price: 99 },
      { key: "advanced_masterclass", name: "Advance AI Masterclass", price: 299 },
      { key: "claude_masterclass", name: "Claude Coding Masterclass", price: 299 },
      { key: "academy", name: "TECH TYCOON Academy Pre-Register", price: 499 },
      { key: "ai_bgm", name: "Advance AI-Business Generative Model (AI-BGM)", price: 499 },
      { key: "consulting", name: "1-on-1 AI Strategy Session", price: 999 },
      { key: "professionals", name: "Advance AI for Professionals", price: 299 },
      { key: "upscale", name: "UPSCALE: 1-Day AI Mastery Workshop", price: 299 },
    ];

    for (const prod of products) {
      it(`processes valid webhook for product '${prod.key}' with SAC 999293 and zero external calls`, () => {
        const sb = createStagingSandbox();
        const entity = {
          id: `pay_test_${prod.key}`,
          order_id: `order_test_${prod.key}`,
          amount: prod.price * 100,
          currency: "INR",
          status: "captured",
          is_test: true,
          notes: { customer_name: "Test Student", product_key: prod.key },
        };

        const digest = computeHardenedPayloadDigest(entity);
        const now = Date.now();
        const eventId = `evt_test_${prod.key}`;

        const sig = computeHardenedProxySignature({
          proxyVersion: "v2.1",
          eventId,
          eventType: "payment.captured",
          orderId: entity.order_id,
          paymentId: entity.id,
          timestamp: now,
          productKey: prod.key,
          amount: entity.amount,
          currency: entity.currency,
          status: entity.status,
          accountId: "",
          payloadDigest: digest,
        }, TEST_PROXY_SECRET);

        const postEvent = {
          postData: {
            contents: JSON.stringify({
              event: "payment.captured",
              eventId,
              timestamp: now,
              proxy_version: "v2.1",
              target_product: prod.key,
              payload_digest: digest,
              proxy_signature: sig,
              payload: { payment: { entity } },
            }),
          },
        };

        const res = JSON.parse(sb.context.doPost(postEvent).getContent());
        expect(res.success).toBe(true);
        expect(res.targetProduct).toBe(prod.key);

        // Verify SAC code and GST calculation in GST_Sales_Register
        const gstRow = sb.sheetsData.GST_Sales_Register[1];
        expect(gstRow[9]).toBe("999293"); // Mandatory SAC code
        expect(gstRow[10]).toBe(prod.name); // Product title
        expect(gstRow[17]).toBe(prod.price); // Gross amount

        // PROVE ZERO external invoice provider calls (FunnelsDone/LeadConnector) and ZERO emails
        const funnelsDoneCalls = sb.fetchCalls.filter((c) => c.url.includes("leadconnector") || c.url.includes("funnelsdone"));
        expect(funnelsDoneCalls).toHaveLength(0);
        expect(sb.mailCalls).toHaveLength(0);
      });
    }

    it("verifies staging configuration validator enforces strict isolation boundaries", () => {
      // 1. Valid staging config
      const validConfig = {
        APP_ENVIRONMENT: "staging",
        SPREADSHEET_ID: VALID_STAGING_SPREADSHEET_ID,
        RAZORPAY_KEY_ID: "rzp_test_validKey",
        RAZORPAY_KEY_SECRET: "test_secret_32_chars_long_entropy",
        WEBHOOK_PROXY_SECRET: TEST_PROXY_SECRET,
        MOCK_INVOICE_ADAPTER: "true",
        SUPPRESS_NOTIFICATIONS: "true",
      };
      const validResult = validateStagingConfiguration(validConfig);
      expect(validResult.valid).toBe(true);
      expect(validResult.errors).toHaveLength(0);

      // 2. Accidental live key in staging
      const liveKeyResult = validateStagingConfiguration({
        ...validConfig,
        RAZORPAY_KEY_ID: "rzp_live_abc123456",
      });
      expect(liveKeyResult.valid).toBe(false);
      expect(liveKeyResult.errors.some((e: string) => e.includes("LIVE_CREDENTIALS_IN_STAGING"))).toBe(true);

      // 3. Accidental production spreadsheet ID in staging
      const prodSheetResult = validateStagingConfiguration({
        ...validConfig,
        SPREADSHEET_ID: KNOWN_PRODUCTION_SPREADSHEET_IDS[0],
      });
      expect(prodSheetResult.valid).toBe(false);
      expect(prodSheetResult.errors.some((e: string) => e.includes("PRODUCTION_SPREADSHEET_IN_STAGING"))).toBe(true);

      // 4. Accidental production Apps Script URL in staging proxy
      const prodUrlResult = validateStagingConfiguration({
        ...validConfig,
        TARGET_URL: Array.from(KNOWN_PRODUCTION_GAS_URLS)[0],
      });
      expect(prodUrlResult.valid).toBe(false);
      expect(prodUrlResult.errors.some((e: string) => e.includes("PRODUCTION_DESTINATION_IN_STAGING"))).toBe(true);
    });
  });
});
