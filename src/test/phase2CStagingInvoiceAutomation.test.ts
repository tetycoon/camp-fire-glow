import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import {
  determinePlaceOfSupply,
  getInvoiceAccountingBreakdown,
  INDIAN_GST_STATE_CODES,
  calculateGstBreakdown,
} from "../lib/gstUtils";

const STAGING_SCRIPT_PATH = path.resolve(__dirname, "../../backend/apps_script/staging/apps_script.gs");
const VALID_STAGING_SPREADSHEET_ID = "1staging_payments_dedicated_sheet_987654321";

interface SandboxOptions {
  propsOverrides?: Record<string, string | null>;
  sheetRows?: Record<string, unknown[][]>;
}

function createStagingScriptSandbox(options: SandboxOptions = {}) {
  const code = fs.readFileSync(STAGING_SCRIPT_PATH, "utf8");

  const propsStore: Record<string, string> = {
    APP_ENVIRONMENT: "staging",
    SPREADSHEET_ID: VALID_STAGING_SPREADSHEET_ID,
    RAZORPAY_KEY_ID: "rzp_test_mockKey123",
    RAZORPAY_KEY_SECRET: "mock_secret_key_1234567890123456",
    WEBHOOK_PROXY_SECRET: "mock_proxy_secret_1234567890123456",
    INVOICE_TOKEN_SECRET: "mock_token_secret_1234567890123456",
    MOCK_INVOICE_ADAPTER: "true",
    ENABLE_MOCK_INVOICE_ADAPTER: "true",
    SUPPRESS_NOTIFICATIONS: "true",
    STRICT_PROXY_MODE: "true",
    STAGING_INVOICE_COUNTER: "1000",
    STAGING_CREDIT_NOTE_COUNTER: "100",
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
    Master_GST_Sales_Register: [
      [
        "Timestamp", "Document Type", "Invoice / Note No", "Invoice Date", "Customer Name",
        "Customer Email", "Customer Phone", "Customer GSTIN", "Place of Supply", "Supply Type",
        "Reverse Charge", "SAC Code", "Service Description", "Taxable Value (₹)", "CGST Amount (₹)",
        "SGST Amount (₹)", "IGST Amount (₹)", "Round Off (₹)", "Total Invoice Value (₹)", "Payment ID",
        "Order ID", "Original Invoice No"
      ],
      ...(options.sheetRows?.Master_GST_Sales_Register || []),
    ],
    Logs: [
      ["Timestamp", "Event", "Details"],
      ...(options.sheetRows?.Logs || []),
    ],
  };

  const logsOutput: string[] = [];

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

  const ssMock = {
    getId: () => propsStore.SPREADSHEET_ID,
    getSheetByName: (name: string) => (sheetsData[name] ? makeSheetMock(name) : null),
    getSheets: () => Object.keys(sheetsData).map(makeSheetMock),
    insertSheet: (name: string) => {
      if (!sheetsData[name]) sheetsData[name] = [];
      return makeSheetMock(name);
    },
  };

  const sandboxContext: Record<string, any> = {
    PropertiesService: {
      getScriptProperties: () => ({
        getProperty: (k: string) => (k in propsStore ? propsStore[k] : null),
        setProperty: (k: string, v: string) => { propsStore[k] = String(v); },
        deleteProperty: (k: string) => { delete propsStore[k]; },
        getProperties: () => ({ ...propsStore }),
      }),
    },
    SpreadsheetApp: {
      openById: (id: string) => {
        if (id !== propsStore.SPREADSHEET_ID) {
          throw new Error("CANNOT_OPEN_SPREADSHEET: " + id);
        }
        return ssMock;
      },
      flush: () => {},
    },
    LockService: {
      getScriptLock: () => ({
        waitLock: () => true,
        releaseLock: () => true,
      }),
    },
    Utilities: {
      formatDate: (_d: Date, _tz: string, fmt: string) => {
        if (fmt.includes("MMM")) return "23 Oct 2026";
        return "2026-10-23";
      },
      base64Encode: (str: string) => Buffer.from(str).toString("base64"),
      computeDigest: (_algo: any, value: string) => {
        const hash = require("node:crypto").createHash("sha256").update(value).digest();
        return Array.from(hash);
      },
      computeHmacSha256Signature: (value: string, key: string) => {
        const hash = require("node:crypto").createHmac("sha256", key).update(value).digest();
        return Array.from(hash);
      },
      DigestAlgorithm: { SHA_256: "SHA_256" },
    },
    ContentService: {
      MimeType: { JSON: "application/json" },
      createTextOutput: (txt: string) => ({
        setMimeType: () => ({
          getContent: () => txt,
        }),
      }),
    },
    Logger: {
      log: (msg: string) => logsOutput.push(msg),
    },
    console: {
      log: (msg: string) => logsOutput.push(msg),
      warn: (msg: string) => logsOutput.push(msg),
      error: (msg: string) => logsOutput.push(msg),
    },
  };

  vm.createContext(sandboxContext);
  vm.runInContext(code, sandboxContext);

  return {
    context: sandboxContext,
    propsStore,
    sheetsData,
    ssMock,
    logsOutput,
  };
}

describe("PHASE 3 / 2C: Authorized Staging GST Invoice Automation & Recovery", () => {
  describe("1. Staging Mock Invoice Numbering & Atomic Recovery", () => {
    it("allocates sequential STAGE-INV- numbers when invoiceNumber is omitted", () => {
      const { context, propsStore } = createStagingScriptSandbox();

      const inv1 = context.createStagingMockInvoice("pay_stage_001", "order_stage_001", "academy");
      expect(inv1).toBe("STAGE-INV-1001");
      expect(propsStore.STAGING_INVOICE_COUNTER).toBe("1001");

      const inv2 = context.createStagingMockInvoice("pay_stage_002", "order_stage_002", "academy");
      expect(inv2).toBe("STAGE-INV-1002");
      expect(propsStore.STAGING_INVOICE_COUNTER).toBe("1002");
    });

    it("idempotently reuses pending invoice number for retry of the same payment without incrementing counter", () => {
      const { context, propsStore } = createStagingScriptSandbox();

      const invFirst = context.createStagingMockInvoice("pay_stage_retry_01", "order_stage_retry_01", "academy");
      expect(invFirst).toBe("STAGE-INV-1001");
      expect(propsStore.STAGING_INVOICE_COUNTER).toBe("1001");

      // Simulated network retry / duplicate request
      const invRetry = context.createStagingMockInvoice("pay_stage_retry_01", "order_stage_retry_01", "academy");
      expect(invRetry).toBe("STAGE-INV-1001");
      expect(propsStore.STAGING_INVOICE_COUNTER).toBe("1001"); // Counter must NOT have incremented!
    });
  });

  describe("2. Dual-Write to Master GST Sales Register & Deduplication", () => {
    it("dual-writes 20-col GST_Sales_Register and 22-col Master_GST_Sales_Register", () => {
      const { context, ssMock, sheetsData } = createStagingScriptSandbox();

      const paymentEntity = {
        id: "pay_test_dual_001",
        order_id: "order_test_dual_001",
        amount: 589900,
        currency: "INR",
        email: "student@techtycoon.in",
        contact: "9876543210",
        notes: {
          customer_name: "Tamil Learner",
          billing_state: "Tamil Nadu",
          gstin: "33AAAAA0000A1Z5",
        },
      };

      context.appendToStagingGstSalesRegister(ssMock, paymentEntity, "STAGE-INV-1001", "academy");

      // Check GST_Sales_Register row
      const gstRows = sheetsData.GST_Sales_Register;
      expect(gstRows.length).toBe(2);
      const row = gstRows[1];
      expect(row[1]).toBe("STAGE-INV-1001");
      expect(row[3]).toBe("Tamil Learner");
      expect(row[6]).toBe("33-RegisteredState"); // Place of Supply
      expect(row[7]).toBe("B2B Intra-State"); // Intra-state (33)
      expect(row[11]).toBe(4999.15); // Base amount (5899 / 1.18)
      expect(row[13]).toBe(449.93); // CGST 9% (Math.round(449.925) = 449.93)
      expect(row[15]).toBe(449.92); // SGST 9% (899.85 - 449.93 = 449.92)
      expect(row[17]).toBe(5899); // Gross
      expect(row[18]).toBe("pay_test_dual_001");
      expect(row[19]).toBe("order_test_dual_001");

      // Check Master_GST_Sales_Register row (22 columns)
      const masterRows = sheetsData.Master_GST_Sales_Register;
      expect(masterRows.length).toBe(2);
      const masterRow = masterRows[1];
      expect(masterRow.length).toBe(22);
      expect(masterRow[1]).toBe("INVOICE"); // Document Type
      expect(masterRow[2]).toBe("STAGE-INV-1001"); // Invoice No
      expect(masterRow[4]).toBe("Tamil Learner"); // Customer Name
      expect(masterRow[7]).toBe("33AAAAA0000A1Z5"); // Customer GSTIN
      expect(masterRow[8]).toBe("33-RegisteredState"); // Place of supply
      expect(masterRow[9]).toBe("B2B Intra-State");
      expect(masterRow[13]).toBe(4999.15); // Base
      expect(masterRow[14]).toBe(449.93); // CGST
      expect(masterRow[15]).toBe(449.92); // SGST
      expect(masterRow[16]).toBe(0); // IGST
      expect(masterRow[18]).toBe(5899); // Gross
      expect(masterRow[19]).toBe("pay_test_dual_001");
      expect(masterRow[20]).toBe("order_test_dual_001");
      expect(masterRow[21]).toBe("-"); // Original Invoice No for invoice row
    });

    it("prevents duplicate rows in both registers on webhook retries", () => {
      const { context, ssMock, sheetsData } = createStagingScriptSandbox();

      const paymentEntity = {
        id: "pay_test_dedup_001",
        order_id: "order_test_dedup_001",
        amount: 589900,
        currency: "INR",
        email: "dedup@techtycoon.in",
        contact: "9876543210",
        notes: { customer_name: "Dedup User", billing_state: "Tamil Nadu" },
      };

      // Call 1
      context.appendToStagingGstSalesRegister(ssMock, paymentEntity, "STAGE-INV-1001", "academy");
      expect(sheetsData.GST_Sales_Register.length).toBe(2);
      expect(sheetsData.Master_GST_Sales_Register.length).toBe(2);

      // Call 2 (Retry)
      context.appendToStagingGstSalesRegister(ssMock, paymentEntity, "STAGE-INV-1001", "academy");
      expect(sheetsData.GST_Sales_Register.length).toBe(2); // Still 2, no duplicates!
      expect(sheetsData.Master_GST_Sales_Register.length).toBe(2); // Still 2!
    });
  });

  describe("3. Credit Note (Rule 54) Generation & Original Invoice Linkage", () => {
    it("generates sequential STAGE-CN- credit note linked to original invoice", () => {
      const { context, ssMock, sheetsData, propsStore } = createStagingScriptSandbox();

      // Step 1: Pre-populate an original invoice in GST_Sales_Register
      const paymentEntity = {
        id: "pay_refund_target_01",
        order_id: "order_refund_target_01",
        amount: 589900,
        currency: "INR",
        email: "refundee@techtycoon.in",
        contact: "9876543210",
        notes: { customer_name: "Refundee Learner", billing_state: "Tamil Nadu" },
      };
      context.appendToStagingGstSalesRegister(ssMock, paymentEntity, "STAGE-INV-1050", "academy");

      // Step 2: Issue full refund
      const refundEntity = {
        id: "rfnd_test_stage_01",
        payment_id: "pay_refund_target_01",
        amount: 589900,
        currency: "INR",
      };

      const result = context.handleStagingRefund(ssMock, refundEntity);

      expect(result.success).toBe(true);
      expect(result.creditNoteNumber).toBe("STAGE-CN-101");
      expect(result.originalInvoiceNumber).toBe("STAGE-INV-1050");
      expect(result.refundAmount).toBe(5899);
      expect(result.baseRefund).toBe(-4999.15);
      expect(result.totalGstRefund).toBe(-899.85);
      expect(propsStore.STAGING_CREDIT_NOTE_COUNTER).toBe("101");

      // Verify GST_Sales_Register has negative row
      const gstRows = sheetsData.GST_Sales_Register;
      expect(gstRows.length).toBe(3); // Header + Invoice + Credit Note
      const cnRow = gstRows[2];
      expect(cnRow[1]).toBe("STAGE-CN-101");
      expect(cnRow[11]).toBe(-4999.15); // Negative taxable value
      expect(cnRow[13]).toBe(-449.93); // Negative CGST
      expect(cnRow[15]).toBe(-449.92); // Negative SGST
      expect(cnRow[17]).toBe(-5899); // Negative total
      expect(cnRow[18]).toBe("rfnd_test_stage_01");
      expect(cnRow[19]).toBe("STAGE-INV-1050"); // Original invoice linked

      // Verify Master_GST_Sales_Register has 22-column Credit Note row
      const masterRows = sheetsData.Master_GST_Sales_Register;
      expect(masterRows.length).toBe(3);
      const masterCnRow = masterRows[2];
      expect(masterCnRow[1]).toBe("CREDIT_NOTE");
      expect(masterCnRow[2]).toBe("STAGE-CN-101");
      expect(masterCnRow[13]).toBe(-4999.15);
      expect(masterCnRow[14]).toBe(-449.93);
      expect(masterCnRow[15]).toBe(-449.92);
      expect(masterCnRow[18]).toBe(-5899);
      expect(masterCnRow[21]).toBe("STAGE-INV-1050"); // Linked original invoice!
    });

    it("idempotently returns cached Credit Note on duplicate refund webhook", () => {
      const { context, ssMock, sheetsData, propsStore } = createStagingScriptSandbox();

      const refundEntity = {
        id: "rfnd_duplicate_test_01",
        payment_id: "pay_unknown_01",
        amount: 200000,
      };

      const res1 = context.handleStagingRefund(ssMock, refundEntity);
      expect(res1.creditNoteNumber).toBe("STAGE-CN-101");
      expect(propsStore.STAGING_CREDIT_NOTE_COUNTER).toBe("101");

      // Second call (replay)
      const res2 = context.handleStagingRefund(ssMock, refundEntity);
      expect(res2.creditNoteNumber).toBe("STAGE-CN-101");
      expect(res2.alreadyProcessed).toBe(true);
      expect(propsStore.STAGING_CREDIT_NOTE_COUNTER).toBe("101"); // No counter increment!
    });
  });

  describe("4. State-Based Tax Determination & Statutory Place of Supply", () => {
    it("correctly identifies Tamil Nadu as B2C Intra-State (33)", () => {
      const pos = determinePlaceOfSupply("Tamil Nadu");
      expect(pos.placeOfSupply).toBe("33-Tamil Nadu");
      expect(pos.isInterState).toBe(false);
      expect(pos.supplyType).toBe("B2C Intra-State");
      expect(pos.stateCode).toBe("33");
    });

    it("identifies out-of-state customer as Inter-State", () => {
      const pos = determinePlaceOfSupply("Karnataka");
      expect(pos.placeOfSupply).toBe("29-Karnataka");
      expect(pos.isInterState).toBe(true);
      expect(pos.supplyType).toBe("B2C Inter-State");
      expect(pos.stateCode).toBe("29");
    });

    it("derives place of supply and B2B status directly from customer GSTIN", () => {
      // B2B Tamil Nadu
      const posTnB2b = determinePlaceOfSupply("", "33AAAAA0000A1Z5");
      expect(posTnB2b.isB2B).toBe(true);
      expect(posTnB2b.isInterState).toBe(false);
      expect(posTnB2b.supplyType).toBe("B2B Intra-State");

      // B2B Maharashtra (27)
      const posMhB2b = determinePlaceOfSupply("", "27AAAAA0000A1Z5");
      expect(posMhB2b.isB2B).toBe(true);
      expect(posMhB2b.isInterState).toBe(true);
      expect(posMhB2b.supplyType).toBe("B2B Inter-State");
      expect(posMhB2b.stateCode).toBe("27");
    });

    it("calculates exact CGST+SGST for Intra-State and IGST for Inter-State", () => {
      // Intra-state ₹5899 (using canonical ₹4999 base from map)
      const intra = getInvoiceAccountingBreakdown(5899, undefined, { isInterState: false });
      expect(intra.baseAmount).toBe(4999);
      expect(intra.cgst).toBe(449.91);
      expect(intra.sgst).toBe(449.91);
      expect(intra.igst).toBe(0);
      expect(intra.totalAmount).toBe(5899);

      // Inter-state ₹5899
      const inter = getInvoiceAccountingBreakdown(5899, undefined, { isInterState: true });
      expect(inter.baseAmount).toBe(4999);
      expect(inter.cgst).toBe(0);
      expect(inter.sgst).toBe(0);
      expect(inter.igst).toBe(899.82);
      expect(inter.totalAmount).toBe(5899);
    });
  });

  describe("5. Strict Staging Isolation & Fail-Closed Guards", () => {
    it("fails closed if APP_ENVIRONMENT is set to production", () => {
      const { context } = createStagingScriptSandbox({
        propsOverrides: { APP_ENVIRONMENT: "production" },
      });
      expect(() => context.getAppEnvironment()).toThrow(/PRODUCTION_ENVIRONMENT_REJECTED/);
    });

    it("fails closed if MOCK_INVOICE_ADAPTER is not enabled", () => {
      const { context } = createStagingScriptSandbox({
        propsOverrides: { MOCK_INVOICE_ADAPTER: "false" },
      });
      expect(() => context.isMockInvoiceAdapterEnabled()).toThrow(/MOCK_INVOICE_REQUIRED_IN_STAGING/);
    });

    it("fails closed if SUPPRESS_NOTIFICATIONS is disabled", () => {
      const { context } = createStagingScriptSandbox({
        propsOverrides: { SUPPRESS_NOTIFICATIONS: "false" },
      });
      expect(() => context.isNotificationSuppressed()).toThrow(/NOTIFICATION_SUPPRESSION_REQUIRED_IN_STAGING/);
    });

    it("fails closed if any production spreadsheet ID is configured", () => {
      const { context } = createStagingScriptSandbox({
        propsOverrides: { SPREADSHEET_ID: "1PC9ZYxd4O7ofuDwcN5AhPHTvW6RYO7V2LgQqrbPTQ5I" }, // Academy prod sheet
      });
      expect(() => context.getStagingSpreadsheet()).toThrow(/PRODUCTION_SPREADSHEET_IN_STAGING/);
    });

    it("fails closed if live Razorpay key is detected in staging", () => {
      const { context } = createStagingScriptSandbox();
      const livePaymentEntity = { id: "pay_live_123", order_id: "order_live_123" };
      expect(() => context.validatePaymentEnvironment(livePaymentEntity, false)).toThrow(/LIVE_PAYMENT_IN_STAGING/);
    });
  });
});
