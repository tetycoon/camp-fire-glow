import { describe, it, expect, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const STAGING_SCRIPT_PATH = path.resolve(__dirname, "../../backend/apps_script/staging/apps_script.gs");
const TEST_PROXY_SECRET = "staging_proxy_secret_high_entropy_32_characters_123456";
const TEST_INVOICE_SECRET = "staging_invoice_secret_high_entropy_32_chars_123456";
const TEST_RZP_SECRET = "staging_rzp_test_secret_32_chars_long_123456";
const TEST_RZP_KEY_ID = "rzp_test_stagingKey999";
const TEST_RZP_KEY_ID_INTL = "rzp_test_intlStagingKey888";
const VALID_STAGING_SPREADSHEET_ID = "1staging_payments_dedicated_sheet_987654321";

interface SandboxOptions {
  props?: Record<string, string | null>;
  sheetRows?: Record<string, any[][]>;
  rawSheetsData?: Record<string, any[][]>;
  openByIdError?: Error;
}

function createStagingSandbox(options: SandboxOptions = {}) {
  const code = fs.readFileSync(STAGING_SCRIPT_PATH, "utf-8");

  const propsStore: Record<string, string> = {
    APP_ENVIRONMENT: "staging",
    SPREADSHEET_ID: VALID_STAGING_SPREADSHEET_ID,
    RAZORPAY_KEY_ID: TEST_RZP_KEY_ID,
    RAZORPAY_KEY_SECRET: TEST_RZP_SECRET,
    RAZORPAY_KEY_ID_INTL: TEST_RZP_KEY_ID_INTL,
    RAZORPAY_KEY_SECRET_INTL: TEST_RZP_SECRET,
    WEBHOOK_PROXY_SECRET: TEST_PROXY_SECRET,
    INVOICE_TOKEN_SECRET: TEST_INVOICE_SECRET,
    MOCK_INVOICE_ADAPTER: "true",
    SUPPRESS_NOTIFICATIONS: "true",
    STRICT_PROXY_MODE: "true",
    STAGING_INVOICE_COUNTER: "1000",
  };

  if (options.props) {
    for (const [k, v] of Object.entries(options.props)) {
      if (v === null) {
        delete propsStore[k];
      } else {
        propsStore[k] = v;
      }
    }
  }

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

  const consoleLogs: string[] = [];

  const sandbox: Record<string, any> = {
    console: {
      log: (...args: any[]) => consoleLogs.push(args.map(a => String(a)).join(" ")),
      warn: () => {},
      error: () => {},
    },
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
        getProperties: () => ({ ...propsStore }),
      }),
    },
    SpreadsheetApp: {
      openById: (id: string) => {
        if (options.openByIdError) throw options.openByIdError;
        return mockSpreadsheet;
      },
    },
    LockService: {
      getScriptLock: () => ({
        waitLock: () => {},
        releaseLock: () => {},
      }),
    },
    ContentService: {
      createTextOutput: (content: string) => ({
        setMimeType: () => content,
      }),
      MimeType: { JSON: "application/json" },
    },
    Utilities: {
      computeHmacSha256Signature: () => [],
      computeDigest: () => [],
      base64Encode: (s: string) => Buffer.from(s).toString("base64"),
      formatDate: () => "20 Oct 2026",
      Charset: { UTF_8: "UTF_8" },
      DigestAlgorithm: { SHA_256: "SHA_256" },
    },
  };

  const context = vm.createContext(sandbox);
  vm.runInContext(code, context);

  return { context, propsStore, sheetsData, consoleLogs };
}

describe("PHASE 1U-B: Hardened Staging Diagnostics Suite", () => {
  describe("1. Successful Staging Configuration", () => {
    it("returns status: PASS with 0 errorCodes and all individual checks passing", () => {
      const sb = createStagingSandbox();
      const report = sb.context.runStagingDiagnostics();

      expect(report.status).toBe("PASS");
      expect(report.errorCodes).toHaveLength(0);
      expect(report.checks.environment).toBe("PASS");
      expect(report.checks.mockInvoiceAdapter).toBe("PASS");
      expect(report.checks.notificationSuppression).toBe("PASS");
      expect(report.checks.strictProxyMode).toBe("PASS");
      expect(report.checks.proxySecret).toBe("PASS");
      expect(report.checks.invoiceSecret).toBe("PASS");
      expect(report.checks.razorpayKey).toBe("PASS");
      expect(report.checks.razorpaySecret).toBe("PASS");
      expect(report.checks.razorpayIntlKey).toBe("PASS");
      expect(report.checks.razorpayIntlSecret).toBe("PASS");
      expect(report.checks.spreadsheetIsolation).toBe("PASS");
      expect(report.checks.spreadsheetAccess).toBe("PASS");
      expect(report.checks.sheetHeaders).toBe("PASS");
      expect(report.checks.gstHeaders).toBe("PASS");
      expect(report.checks.logsTab).toBe("PASS");

      // Verify zero tab rows appended (read-only)
      expect(sb.sheetsData.Sheet1).toHaveLength(1);
      expect(sb.sheetsData.GST_Sales_Register).toHaveLength(1);
      expect(sb.sheetsData.Logs).toHaveLength(1);
    });
  });

  describe("2. Strict Staging Environment Validation", () => {
    it("fails when APP_ENVIRONMENT is missing", () => {
      const sb = createStagingSandbox({ props: { APP_ENVIRONMENT: null } });
      const report = sb.context.runStagingDiagnostics();

      expect(report.status).toBe("FAIL");
      expect(report.checks.environment).toBe("FAIL");
      expect(report.errorCodes).toContain("MISSING_APP_ENVIRONMENT");
    });

    it("fails when APP_ENVIRONMENT=production", () => {
      const sb = createStagingSandbox({ props: { APP_ENVIRONMENT: "production" } });
      const report = sb.context.runStagingDiagnostics();

      expect(report.status).toBe("FAIL");
      expect(report.checks.environment).toBe("FAIL");
      expect(report.errorCodes).toContain("PRODUCTION_ENVIRONMENT_REJECTED");
    });

    it("strictly rejects APP_ENVIRONMENT=local_test in staging diagnostics", () => {
      const sb = createStagingSandbox({ props: { APP_ENVIRONMENT: "local_test" } });
      const report = sb.context.runStagingDiagnostics();

      expect(report.status).toBe("FAIL");
      expect(report.checks.environment).toBe("FAIL");
      expect(report.errorCodes).toContain("INVALID_ENVIRONMENT_FOR_STAGING");
    });

    it("rejects unknown environments such as dev or testing", () => {
      const sb = createStagingSandbox({ props: { APP_ENVIRONMENT: "dev" } });
      const report = sb.context.runStagingDiagnostics();

      expect(report.status).toBe("FAIL");
      expect(report.checks.environment).toBe("FAIL");
      expect(report.errorCodes).toContain("INVALID_ENVIRONMENT_FOR_STAGING");
    });
  });

  describe("3. Strict Boolean Flags Validation", () => {
    it("fails when MOCK_INVOICE_ADAPTER is false", () => {
      const sb = createStagingSandbox({ props: { MOCK_INVOICE_ADAPTER: "false", ENABLE_MOCK_INVOICE_ADAPTER: "false" } });
      const report = sb.context.runStagingDiagnostics();

      expect(report.status).toBe("FAIL");
      expect(report.checks.mockInvoiceAdapter).toBe("FAIL");
      expect(report.errorCodes).toContain("MOCK_INVOICE_ADAPTER_REQUIRED");
    });

    it("fails when SUPPRESS_NOTIFICATIONS is false", () => {
      const sb = createStagingSandbox({ props: { SUPPRESS_NOTIFICATIONS: "false" } });
      const report = sb.context.runStagingDiagnostics();

      expect(report.status).toBe("FAIL");
      expect(report.checks.notificationSuppression).toBe("FAIL");
      expect(report.errorCodes).toContain("SUPPRESS_NOTIFICATIONS_REQUIRED");
    });

    it("fails when STRICT_PROXY_MODE is false or missing", () => {
      const sb = createStagingSandbox({ props: { STRICT_PROXY_MODE: "false" } });
      const report = sb.context.runStagingDiagnostics();

      expect(report.status).toBe("FAIL");
      expect(report.checks.strictProxyMode).toBe("FAIL");
      expect(report.errorCodes).toContain("STRICT_PROXY_MODE_REQUIRED");
    });
  });

  describe("4. Dual Razorpay Credential Pair Validation", () => {
    it("fails when primary RAZORPAY_KEY_ID is missing", () => {
      const sb = createStagingSandbox({ props: { RAZORPAY_KEY_ID: null } });
      const report = sb.context.runStagingDiagnostics();

      expect(report.status).toBe("FAIL");
      expect(report.checks.razorpayKey).toBe("FAIL");
      expect(report.errorCodes).toContain("MISSING_RAZORPAY_KEY_ID");
    });

    it("fails when primary RAZORPAY_KEY_ID starts with rzp_live_", () => {
      const sb = createStagingSandbox({ props: { RAZORPAY_KEY_ID: "rzp_live_abc12345678" } });
      const report = sb.context.runStagingDiagnostics();

      expect(report.status).toBe("FAIL");
      expect(report.checks.razorpayKey).toBe("FAIL");
      expect(report.errorCodes).toContain("LIVE_KEY_IN_STAGING_REJECTED");
    });

    it("fails when primary RAZORPAY_KEY_ID does not start with rzp_test_", () => {
      const sb = createStagingSandbox({ props: { RAZORPAY_KEY_ID: "invalid_key_prefix" } });
      const report = sb.context.runStagingDiagnostics();

      expect(report.status).toBe("FAIL");
      expect(report.checks.razorpayKey).toBe("FAIL");
      expect(report.errorCodes).toContain("INVALID_OR_MISSING_TEST_KEY");
    });

    it("fails when primary RAZORPAY_KEY_SECRET is missing or < 8 chars", () => {
      const sb = createStagingSandbox({ props: { RAZORPAY_KEY_SECRET: "short" } });
      const report = sb.context.runStagingDiagnostics();

      expect(report.status).toBe("FAIL");
      expect(report.checks.razorpaySecret).toBe("FAIL");
      expect(report.errorCodes).toContain("INVALID_OR_MISSING_RAZORPAY_SECRET");
    });

    it("fails when international RAZORPAY_KEY_ID_INTL is missing", () => {
      const sb = createStagingSandbox({ props: { RAZORPAY_KEY_ID_INTL: null } });
      const report = sb.context.runStagingDiagnostics();

      expect(report.status).toBe("FAIL");
      expect(report.checks.razorpayIntlKey).toBe("FAIL");
      expect(report.errorCodes).toContain("MISSING_RAZORPAY_KEY_ID_INTL");
    });

    it("fails when international RAZORPAY_KEY_ID_INTL starts with rzp_live_", () => {
      const sb = createStagingSandbox({ props: { RAZORPAY_KEY_ID_INTL: "rzp_live_intl12345" } });
      const report = sb.context.runStagingDiagnostics();

      expect(report.status).toBe("FAIL");
      expect(report.checks.razorpayIntlKey).toBe("FAIL");
      expect(report.errorCodes).toContain("LIVE_KEY_IN_STAGING_REJECTED");
    });

    it("fails when international RAZORPAY_KEY_SECRET_INTL is missing or < 8 chars", () => {
      const sb = createStagingSandbox({ props: { RAZORPAY_KEY_SECRET_INTL: "tiny" } });
      const report = sb.context.runStagingDiagnostics();

      expect(report.status).toBe("FAIL");
      expect(report.checks.razorpayIntlSecret).toBe("FAIL");
      expect(report.errorCodes).toContain("INVALID_OR_MISSING_RAZORPAY_SECRET_INTL");
    });
  });

  describe("5. Secrets Entropy Validation", () => {
    it("fails when WEBHOOK_PROXY_SECRET is missing or < 16 chars", () => {
      const sb = createStagingSandbox({ props: { WEBHOOK_PROXY_SECRET: "tooshort" } });
      const report = sb.context.runStagingDiagnostics();

      expect(report.status).toBe("FAIL");
      expect(report.checks.proxySecret).toBe("FAIL");
      expect(report.errorCodes).toContain("INVALID_OR_MISSING_PROXY_SECRET");
    });

    it("fails when INVOICE_TOKEN_SECRET is missing or < 16 chars", () => {
      const sb = createStagingSandbox({ props: { INVOICE_TOKEN_SECRET: "tooshort" } });
      const report = sb.context.runStagingDiagnostics();

      expect(report.status).toBe("FAIL");
      expect(report.checks.invoiceSecret).toBe("FAIL");
      expect(report.errorCodes).toContain("INVALID_OR_MISSING_INVOICE_TOKEN_SECRET");
    });
  });

  describe("6. Spreadsheet Isolation & Header Order Verification", () => {
    it("rejects known production spreadsheet IDs", () => {
      const prodId = "1PC9ZYxd4O7ofuDwcN5AhPHTvW6RYO7V2LgQqrbPTQ5I"; // Academy
      const sb = createStagingSandbox({ props: { SPREADSHEET_ID: prodId } });
      const report = sb.context.runStagingDiagnostics();

      expect(report.status).toBe("FAIL");
      expect(report.checks.spreadsheetIsolation).toBe("FAIL");
      expect(report.errorCodes).toContain("PRODUCTION_SPREADSHEET_REJECTED");
    });

    it("fails when spreadsheet cannot be opened", () => {
      const sb = createStagingSandbox({ openByIdError: new Error("Permission denied") });
      const report = sb.context.runStagingDiagnostics();

      expect(report.status).toBe("FAIL");
      expect(report.checks.spreadsheetAccess).toBe("FAIL");
      expect(report.errorCodes).toContain("SPREADSHEET_OPEN_FAILED");
    });

    it("fails when Sheet1 tab is missing", () => {
      const sb = createStagingSandbox();
      delete (sb.sheetsData as any).Sheet1;
      const report = sb.context.runStagingDiagnostics();

      expect(report.status).toBe("FAIL");
      expect(report.checks.sheetHeaders).toBe("FAIL");
      expect(report.errorCodes).toContain("MISSING_SHEET1_TAB");
    });

    it("fails when GST_Sales_Register tab is missing", () => {
      const sb = createStagingSandbox();
      delete (sb.sheetsData as any).GST_Sales_Register;
      const report = sb.context.runStagingDiagnostics();

      expect(report.status).toBe("FAIL");
      expect(report.checks.gstHeaders).toBe("FAIL");
      expect(report.errorCodes).toContain("MISSING_GST_SALES_REGISTER_TAB");
    });

    it("fails when Logs tab is missing", () => {
      const sb = createStagingSandbox();
      delete (sb.sheetsData as any).Logs;
      const report = sb.context.runStagingDiagnostics();

      expect(report.status).toBe("FAIL");
      expect(report.checks.logsTab).toBe("FAIL");
      expect(report.errorCodes).toContain("MISSING_LOGS_TAB");
    });

    it("fails when Sheet1 has reversed header order", () => {
      const sb = createStagingSandbox();
      sb.sheetsData.Sheet1[0] = [
        "Timestamp", "Name", "Phone", "Email", "Course", "UserType", "Amount",
        "Payment Status", "Order ID", "Payment ID", "Email Status", "WhatsApp Status"
      ];
      const report = sb.context.runStagingDiagnostics();

      expect(report.status).toBe("FAIL");
      expect(report.checks.sheetHeaders).toBe("FAIL");
      expect(report.errorCodes).toContain("INVALID_SHEET1_HEADERS");
    });

    it("fails when GST_Sales_Register has missing column", () => {
      const sb = createStagingSandbox();
      sb.sheetsData.GST_Sales_Register[0].pop(); // remove Order ID
      const report = sb.context.runStagingDiagnostics();

      expect(report.status).toBe("FAIL");
      expect(report.checks.gstHeaders).toBe("FAIL");
      expect(report.errorCodes).toContain("INVALID_GST_HEADERS");
    });

    it("fails when Logs has wrong headers", () => {
      const sb = createStagingSandbox();
      sb.sheetsData.Logs[0] = ["Timestamp", "WrongEvent", "Details"];
      const report = sb.context.runStagingDiagnostics();

      expect(report.status).toBe("FAIL");
      expect(report.checks.logsTab).toBe("FAIL");
      expect(report.errorCodes).toContain("INVALID_LOGS_HEADERS");
    });
  });

  describe("7. Safe Sanitized Logging & Zero Exposure", () => {
    it("never logs or exposes secret credentials, tokens, or spreadsheet IDs in console or output", () => {
      const sb = createStagingSandbox();
      const report = sb.context.runStagingDiagnostics();
      const reportStr = JSON.stringify(report);

      expect(reportStr).not.toContain(TEST_PROXY_SECRET);
      expect(reportStr).not.toContain(TEST_INVOICE_SECRET);
      expect(reportStr).not.toContain(TEST_RZP_SECRET);
      expect(reportStr).not.toContain(TEST_RZP_KEY_ID);
      expect(reportStr).not.toContain(VALID_STAGING_SPREADSHEET_ID);

      const logsStr = sb.consoleLogs.join("\n");
      expect(logsStr).not.toContain(TEST_PROXY_SECRET);
      expect(logsStr).not.toContain(TEST_INVOICE_SECRET);
      expect(logsStr).not.toContain(TEST_RZP_SECRET);
      expect(logsStr).not.toContain(VALID_STAGING_SPREADSHEET_ID);
    });
  });
});
