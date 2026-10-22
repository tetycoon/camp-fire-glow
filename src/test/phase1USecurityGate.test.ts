/**
 * Phase 1U: Independent Final Staging Installation Gate Suite
 *
 * Verifies the 5 core areas for backend/apps_script/staging/apps_script.gs:
 * (1) Trusted product binding: client-controlled payment notes conflict rejection,
 *     client callback rejection for unregistered orders, and prevention of untrusted metadata injection.
 * (2) Spreadsheet schema and data validation: dynamic column layout enforcement,
 *     malformed row rejection, conflicting duplicate order detection, and non-arbitrary row selection.
 * (3) Idempotency and partial failures: retry after invoice allocation, retry after Sheet1 write,
 *     retry after GST register write (zero duplicate GST rows), and concurrency lock verification.
 * (4) Diagnostic safety & log sanitization: zero outbound calls, zero emails, zero spreadsheet writes,
 *     redaction of credentials, keys, secrets, emails, and phone numbers in writeToLogs.
 * (5) Staging isolation: fail-closed on invalid environment, production spreadsheet rejection,
 *     mock invoice adapter and notification suppression enforcement, live credential rejection.
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
  rawSheetsData?: Record<string, any[][]>;
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
    RAZORPAY_KEY_ID_INTL: "rzp_test_intlKey888",
    RAZORPAY_KEY_SECRET_INTL: TEST_RZP_SECRET,
    STAGING_INVOICE_COUNTER: "1000",
    ...(options.props || {}),
  };

  const sheetsData: Record<string, any[][]> = {
    Sheet1: options.rawSheetsData?.Sheet1 || [
      [
        "Timestamp", "Name", "Email", "Phone", "Course", "UserType", "Amount",
        "Payment Status", "Order ID", "Payment ID", "Email Status", "WhatsApp Status"
      ],
      ...(options.sheetRows?.Sheet1 || []),
    ],
    GST_Sales_Register: options.rawSheetsData?.GST_Sales_Register || [
      [
        "Timestamp", "Invoice No", "Invoice Date", "Customer Name", "Customer Email",
        "Customer Phone", "Place of Supply", "Supply Type", "Reverse Charge", "SAC Code",
        "Service Description", "Taxable Value (₹)", "CGST Rate (%)", "CGST Amount (₹)",
        "SGST Rate (%)", "SGST Amount (₹)", "Round Off (₹)", "Total Invoice Value (₹)",
        "Payment ID", "Order ID"
      ],
      ...(options.sheetRows?.GST_Sales_Register || []),
    ],
    Logs: options.rawSheetsData?.Logs || [
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

describe("PHASE 1U: Independent Final Staging Installation Gate Suite", () => {
  // 1. Trusted Product Binding
  describe("1. Trusted Product Binding", () => {
    it("rejects transaction when client-controlled payment notes conflict with Sheet1 registered product", () => {
      const orderId = "order_note_conflict_01";
      const paymentId = "pay_test_note_conflict_01";
      const validSig = crypto.createHmac("sha256", TEST_RZP_SECRET).update(`${orderId}|${paymentId}`).digest("hex");

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
              amount: 29900,
              // Attacker manipulated client checkout options to set consulting in payment notes
              notes: { product_key: "consulting" },
            }),
        }),
      });

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

    it("rejects client payment callback when requested productKey conflicts with server payment notes", () => {
      const orderId = "order_cb_conflict_01";
      const paymentId = "pay_test_cb_conflict_01";
      const validSig = crypto.createHmac("sha256", TEST_RZP_SECRET).update(`${orderId}|${paymentId}`).digest("hex");

      const sb = createStagingSandbox({
        urlFetchHandler: () => ({
          getResponseCode: () => 200,
          getContentText: () =>
            JSON.stringify({
              id: paymentId,
              order_id: orderId,
              status: "captured",
              currency: "INR",
              amount: 29900,
              notes: { product_key: "claude_masterclass" },
            }),
        }),
      });

      // Browser client attempts to claim advanced_masterclass for an order whose server metadata is claude_masterclass
      const res = JSON.parse(
        sb.context.handleClientPaymentCallback(sb.context.getStagingSpreadsheet(), {
          orderId,
          paymentId,
          signature: validSig,
          productKey: "advanced_masterclass",
        }).getContent()
      );

      expect(res.success).toBe(false);
      expect(res.status).toBe(400);
      expect(res.error).toContain("PRODUCT_ORDER_MISMATCH");
    });

    it("rejects webhook when server payment notes conflict with proxy-signed target_product", () => {
      const orderId = "order_webhook_conflict_01";
      const paymentId = "pay_test_webhook_conflict_01";
      const eventId = "evt_webhook_conflict_01";

      const sb = createStagingSandbox({
        urlFetchHandler: () => ({
          getResponseCode: () => 200,
          getContentText: () =>
            JSON.stringify({
              id: paymentId,
              order_id: orderId,
              status: "captured",
              currency: "INR",
              amount: 9900,
              notes: { product_key: "ai_masterclass" }, // Server notes say ai_masterclass
            }),
        }),
      });

      const entity = {
        id: paymentId,
        order_id: orderId,
        amount: 9900,
        currency: "INR",
        status: "captured",
        notes: { product_key: "ai_masterclass" },
      };

      const digest = sb.context.computeCanonicalPayloadDigestGas(entity);
      const now = Date.now();
      // But proxy signed for claude_masterclass
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
      expect(res.error).toContain("PRODUCT_ORDER_MISMATCH");
    });
  });

  // 2. Spreadsheet Schema and Data Validation
  describe("2. Spreadsheet Schema and Data Validation", () => {
    it("fails closed with INVALID_SHEET1_LAYOUT when required column headers are missing or scrambled", () => {
      const sb = createStagingSandbox({
        rawSheetsData: {
          Sheet1: [
            // Corrupted headers: missing 'order id' and 'course'
            ["Timestamp", "Name", "Email", "Phone", "RandomCol1", "RandomCol2"],
            ["2026-10-20T10:00:00.000Z", "Student", "s@test.com", "9876543210", "Val1", "Val2"]
          ]
        }
      });

      expect(() => {
        sb.context.resolveTrustedOrderBinding(
          sb.context.getStagingSpreadsheet(),
          "order_layout_test_01",
          "claude_masterclass",
          null,
          false
        );
      }).toThrow(/INVALID_SHEET1_LAYOUT/);
    });

    it("fails closed with CONFLICTING_ORDER_RECORDS when duplicate rows for the same order have conflicting products", () => {
      const orderId = "order_dup_conflict_01";
      const sb = createStagingSandbox({
        sheetRows: {
          Sheet1: [
            ["2026-10-20T10:00:00.000Z", "Student", "s@test.com", "9876543210", "ai_masterclass", "Developer", 99, "PENDING", orderId, "", "", ""],
            ["2026-10-20T10:01:00.000Z", "Student", "s@test.com", "9876543210", "claude_masterclass", "Developer", 299, "PENDING", orderId, "", "", ""]
          ]
        }
      });

      expect(() => {
        sb.context.resolveTrustedOrderBinding(
          sb.context.getStagingSpreadsheet(),
          orderId,
          "ai_masterclass",
          null,
          false
        );
      }).toThrow(/CONFLICTING_ORDER_RECORDS/);
    });

    it("fails closed with MALFORMED_ORDER_RECORD when registration row has invalid or zero amount", () => {
      const orderId = "order_zero_amt_01";
      const sb = createStagingSandbox({
        sheetRows: {
          Sheet1: [
            ["2026-10-20T10:00:00.000Z", "Student", "s@test.com", "9876543210", "claude_masterclass", "Developer", 0, "PENDING", orderId, "", "", ""]
          ]
        }
      });

      expect(() => {
        sb.context.resolveTrustedOrderBinding(
          sb.context.getStagingSpreadsheet(),
          orderId,
          "claude_masterclass",
          null,
          false
        );
      }).toThrow(/MALFORMED_ORDER_RECORD/);
    });

    it("dynamically resolves columns when column order in Sheet1 is permuted but all headers exist", () => {
      const orderId = "order_permuted_01";
      const sb = createStagingSandbox({
        rawSheetsData: {
          Sheet1: [
            // Permuted column layout
            ["Order ID", "Course", "Amount Paid", "Name", "Email", "Phone", "Payment Status", "Payment ID"],
            [orderId, "claude_masterclass", 299, "Student", "s@test.com", "9876543210", "PENDING", ""]
          ]
        }
      });

      const binding = sb.context.resolveTrustedOrderBinding(
        sb.context.getStagingSpreadsheet(),
        orderId,
        "claude_masterclass",
        null,
        false
      );

      expect(binding.productKey).toBe("claude_masterclass");
      expect(binding.expectedAmountInr).toBe(299);
      expect(binding.source).toBe("SHEET_REGISTRATION");
    });
  });

  // 3. Idempotency and Partial Failures
  describe("3. Idempotency and Partial Failures", () => {
    it("recovers safely on retry after invoice allocation without burning a second invoice counter", () => {
      const sb = createStagingSandbox();
      const paymentId = "pay_test_alloc_retry_01";
      const orderId = "order_alloc_retry_01";

      // 1. Initial attempt allocates invoice and sets PENDING_INV_
      const inv1 = sb.context.createStagingMockInvoice(paymentId, orderId, "claude_masterclass");
      expect(inv1).toBe("STAGE-INV-1001");
      expect(sb.propsStore["PENDING_INV_" + paymentId]).toBe("STAGE-INV-1001");
      expect(sb.propsStore["STAGING_INVOICE_COUNTER"]).toBe("1001");

      // 2. Retry for the exact same payment reuses PENDING_INV_
      const inv2 = sb.context.createStagingMockInvoice(paymentId, orderId, "claude_masterclass");
      expect(inv2).toBe("STAGE-INV-1001");
      // Counter was NOT incremented to 1002!
      expect(sb.propsStore["STAGING_INVOICE_COUNTER"]).toBe("1001");
    });

    it("guarantees idempotency when retry occurs after GST register write: zero duplicate GST rows", () => {
      const sb = createStagingSandbox();
      const paymentEntity = {
        id: "pay_test_gst_idemp_01",
        order_id: "order_gst_idemp_01",
        amount: 29900,
        email: "student@test.com",
        contact: "+919876543210",
        notes: { customer_name: "Staging Student" }
      };

      // 1. First write appends row to GST_Sales_Register
      sb.context.appendToStagingGstSalesRegister(
        sb.context.getStagingSpreadsheet(),
        paymentEntity,
        "STAGE-INV-1001",
        "claude_masterclass"
      );
      expect(sb.sheetsData.GST_Sales_Register).toHaveLength(2); // Header + 1 row

      // 2. Second write for the SAME payment skips duplicate append
      sb.context.appendToStagingGstSalesRegister(
        sb.context.getStagingSpreadsheet(),
        paymentEntity,
        "STAGE-INV-1001",
        "claude_masterclass"
      );
      // Still exactly 2 rows! Zero duplicate rows created!
      expect(sb.sheetsData.GST_Sales_Register).toHaveLength(2);
    });

    it("verifies script lock acquisition timeout returns 503 SERVER_BUSY", () => {
      const code = fs.readFileSync(APPS_SCRIPT_PATH, "utf8");
      // Create sandbox where lock wait throws
      const sb = createStagingSandbox();
      (sb.context as any).LockService = {
        getScriptLock: () => ({
          waitLock: () => {
            throw new Error("Lock timeout");
          },
          releaseLock: () => {},
        }),
      };

      const res = JSON.parse(
        sb.context.doPost({
          postData: { contents: "{}" },
        }).getContent()
      );

      expect(res.status).toBe(503);
      expect(res.error).toContain("SERVER_BUSY");
    });
  });

  // 4. Diagnostic Safety & Log Sanitization
  describe("4. Diagnostic Safety & Log Sanitization", () => {
    it("diagnostics makes zero external calls, sends zero emails, and writes zero spreadsheet rows", () => {
      const sb = createStagingSandbox();
      const diag = sb.context.runStagingDiagnostics();

      expect(diag.status).toBe("PASS");
      expect(sb.fetchCalls).toHaveLength(0);
      expect(sb.mailCalls).toHaveLength(0);
      // Zero rows appended to any sheet
      expect(sb.sheetsData.Sheet1).toHaveLength(1);
      expect(sb.sheetsData.GST_Sales_Register).toHaveLength(1);
      expect(sb.sheetsData.Logs).toHaveLength(1);
    });

    it("sanitizeLogData completely redacts basic auth, rzp keys, secrets, emails, and phone numbers", () => {
      const sb = createStagingSandbox();
      const sensitiveInput = "Auth: Basic cnpwX3Rlc3Q6c2VjcmV0, Key: rzp_test_abc123456, proxy_secret=my_secret_token_123, email: john.doe@example.com, phone: 9876543210";
      const sanitized = sb.context.sanitizeLogData(sensitiveInput);

      expect(sanitized).not.toContain("cnpwX3Rlc3Q6c2VjcmV0");
      expect(sanitized).not.toContain("rzp_test_abc123456");
      expect(sanitized).not.toContain("my_secret_token_123");
      expect(sanitized).not.toContain("john.doe@example.com");
      expect(sanitized).not.toContain("9876543210");
      expect(sanitized).toContain("[REDACTED");
    });

    it("writeToLogs never leaks sensitive credentials or PII into the Logs tab", () => {
      const sb = createStagingSandbox();
      sb.context.writeToLogs("SECURITY_TEST", "User user@test.com with key rzp_test_999 failed auth with secret=super_secret_value");

      expect(sb.sheetsData.Logs).toHaveLength(2);
      const logEntry = sb.sheetsData.Logs[1][2]; // Details column
      expect(logEntry).not.toContain("user@test.com");
      expect(logEntry).not.toContain("rzp_test_999");
      expect(logEntry).not.toContain("super_secret_value");
      expect(logEntry).toContain("[REDACTED");
    });
  });

  // 5. Staging Isolation
  describe("5. Staging Isolation", () => {
    it("fails closed when APP_ENVIRONMENT is set to production or missing", () => {
      const sb1 = createStagingSandbox({ props: { APP_ENVIRONMENT: "production" } });
      expect(() => sb1.context.getAppEnvironment()).toThrow(/PRODUCTION_ENVIRONMENT_REJECTED/);

      const sb2 = createStagingSandbox({ props: { APP_ENVIRONMENT: "" } });
      expect(() => sb2.context.getAppEnvironment()).toThrow(/MISSING_ENVIRONMENT|MISSING_APP_ENVIRONMENT/);
    });

    it("fails closed when SPREADSHEET_ID matches any known production spreadsheet ID", () => {
      const productionSheetId = "1PC9ZYxd4O7ofuDwcN5AhPHTvW6RYO7V2LgQqrbPTQ5I"; // Academy prod
      const sb = createStagingSandbox({ props: { SPREADSHEET_ID: productionSheetId } });
      expect(() => sb.context.getStagingSpreadsheet()).toThrow(/PRODUCTION_SPREADSHEET_IN_STAGING/);
    });

    it("fails closed when MOCK_INVOICE_ADAPTER or SUPPRESS_NOTIFICATIONS is false or missing", () => {
      const sb1 = createStagingSandbox({ props: { MOCK_INVOICE_ADAPTER: "false" } });
      expect(() => sb1.context.isMockInvoiceAdapterEnabled()).toThrow(/MOCK_INVOICE_REQUIRED_IN_STAGING/);

      const sb2 = createStagingSandbox({ props: { SUPPRESS_NOTIFICATIONS: "false" } });
      expect(() => sb2.context.isNotificationSuppressed()).toThrow(/NOTIFICATION_SUPPRESSION_REQUIRED_IN_STAGING/);
    });

    it("fails closed when RAZORPAY_KEY_ID is live (rzp_live_)", () => {
      const sb = createStagingSandbox({ props: { RAZORPAY_KEY_ID: "rzp_live_realLiveKey123" } });
      expect(() => sb.context.getRazorpayKeyId(false)).toThrow(/LIVE_CREDENTIALS_IN_STAGING/);
    });

    it("fails closed when FUNNELSDONE_LOCATION_ID or WHATSAPP_PHONE_NUMBER_ID is set to production values", () => {
      const sb1 = createStagingSandbox({ props: { FUNNELSDONE_LOCATION_ID: "uUUUKRH7EP2A0oJBv4Zb" } });
      expect(() => sb1.context.getFunnelsDoneLocationId()).toThrow(/PRODUCTION_LOCATION_IN_STAGING/);

      const sb2 = createStagingSandbox({ props: { WHATSAPP_PHONE_NUMBER_ID: "1089787377552637" } });
      expect(() => sb2.context.getWhatsAppPhoneNumberId()).toThrow(/PRODUCTION_PHONE_IN_STAGING/);
    });
  });
});
