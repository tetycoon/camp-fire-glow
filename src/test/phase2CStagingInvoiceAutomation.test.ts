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
  beforeAppendHook?: (sheetName: string, row: unknown[]) => void;
  pdfFailHook?: () => void;
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
      if (options.beforeAppendHook) {
        options.beforeAppendHook(name, row);
      }
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
      Charset: { UTF_8: "UTF_8" },
    },
    ContentService: {
      MimeType: { JSON: "application/json" },
      createTextOutput: (txt: string) => ({
        setMimeType: () => ({
          getContent: () => txt,
        }),
      }),
    },
    generateStagingCreditNotePdf: (_cn: string, _orig: string, _amt: number) => {
      if (options.pdfFailHook) {
        options.pdfFailHook();
      }
      return { blob: "mock_pdf_bytes" };
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

describe("PHASE 3B: Critical Code Audit & Staging Automation Verification", () => {
  describe("1. Missing Billing-State Handling (No Silent Tamil Nadu Default)", () => {
    it("flags missing billing state explicitly and marks for review", () => {
      const posMissing = determinePlaceOfSupply("");
      expect(posMissing.isMissingState).toBe(true);
      expect(posMissing.supplyType).toBe("HOLD_FOR_REVIEW_MISSING_STATE");
      expect(posMissing.placeOfSupply).toContain("Missing");
      expect(posMissing.stateCode).toBeUndefined(); // Never silently 33!
    });

    it("flags invalid billing state explicitly", () => {
      const posInvalid = determinePlaceOfSupply("AtlantisTerritory");
      expect(posInvalid.isInvalidState).toBe(true);
      expect(posInvalid.supplyType).toBe("HOLD_FOR_REVIEW_INVALID_STATE");
      expect(posInvalid.placeOfSupply).toContain("Invalid State");
    });

    it("correctly identifies valid Tamil Nadu state as B2C Intra-State (33)", () => {
      const pos = determinePlaceOfSupply("Tamil Nadu");
      expect(pos.placeOfSupply).toBe("33-Tamil Nadu");
      expect(pos.isInterState).toBe(false);
      expect(pos.supplyType).toBe("B2C Intra-State");
      expect(pos.stateCode).toBe("33");
    });

    it("identifies valid non-Tamil Nadu state as Inter-State", () => {
      const pos = determinePlaceOfSupply("Karnataka");
      expect(pos.placeOfSupply).toBe("29-Karnataka");
      expect(pos.isInterState).toBe(true);
      expect(pos.supplyType).toBe("B2C Inter-State");
      expect(pos.stateCode).toBe("29");
    });
  });

  describe("2. Credit-Note Idempotency & Failure Stage Recovery", () => {
    it("recovers safely if failure occurs before credit-note numbering", () => {
      const { context, ssMock, propsStore } = createStagingScriptSandbox();

      // Attempt 1: Call with missing refund identifiers (fails before numbering)
      expect(() => context.handleStagingRefund(ssMock, {})).toThrow(/MISSING_REFUND_IDENTIFIERS/);
      expect(propsStore.STAGING_CREDIT_NOTE_COUNTER).toBe("100"); // Unchanged!

      // Attempt 2: Next call cleanly allocates next sequential number
      const result = context.handleStagingRefund(ssMock, { id: "rfnd_clean_01", payment_id: "pay_01", amount: 100000 });
      expect(result.creditNoteNumber).toBe("STAGE-CN-101");
      expect(propsStore.STAGING_CREDIT_NOTE_COUNTER).toBe("101");
    });

    it("reuses exact same credit-note number if failure occurs after numbering but before register writes", () => {
      let failOnFirstWrite = true;
      const { context, ssMock, sheetsData, propsStore } = createStagingScriptSandbox({
        beforeAppendHook: (sheetName) => {
          if (sheetName === "GST_Sales_Register" && failOnFirstWrite) {
            failOnFirstWrite = false;
            throw new Error("SIMULATED_NETWORK_TIMEOUT_BEFORE_WRITE");
          }
        },
      });

      const refundEntity = { id: "rfnd_crash_after_num", payment_id: "pay_target_01", amount: 200000 };

      // Attempt 1 fails during register write, but PENDING_CN_ was already recorded
      expect(() => context.handleStagingRefund(ssMock, refundEntity)).toThrow(/SIMULATED_NETWORK_TIMEOUT_BEFORE_WRITE/);
      expect(propsStore.PENDING_CN_rfnd_crash_after_num).toBe("STAGE-CN-101");
      expect(propsStore.STAGING_CREDIT_NOTE_COUNTER).toBe("101");

      // Attempt 2 (Retry): Reuses STAGE-CN-101 without burning STAGE-CN-102!
      const retryResult = context.handleStagingRefund(ssMock, refundEntity);
      expect(retryResult.creditNoteNumber).toBe("STAGE-CN-101");
      expect(propsStore.STAGING_CREDIT_NOTE_COUNTER).toBe("101"); // Did not increment!
      expect(sheetsData.GST_Sales_Register.length).toBe(2); // Exactly 1 row added
      expect(sheetsData.Master_GST_Sales_Register.length).toBe(2);
    });

    it("repairs master register without duplicating local register if failure occurs between writes", () => {
      let failMaster = true;
      const { context, ssMock, sheetsData, propsStore } = createStagingScriptSandbox({
        beforeAppendHook: (sheetName) => {
          if (sheetName === "Master_GST_Sales_Register" && failMaster) {
            failMaster = false;
            throw new Error("SIMULATED_MASTER_REGISTER_OUTAGE");
          }
        },
      });

      const refundEntity = { id: "rfnd_partial_write_fail", payment_id: "pay_partial_01", amount: 300000 };

      // Attempt 1: Local write succeeds, master write fails
      expect(() => context.handleStagingRefund(ssMock, refundEntity)).toThrow(/MASTER_REGISTER_WRITE_FAILED/);
      expect(sheetsData.GST_Sales_Register.length).toBe(2); // Local wrote 1 row
      expect(sheetsData.Master_GST_Sales_Register.length).toBe(1); // Master has 0 rows (header only)

      // Attempt 2 (Retry): Skips local write (deduplicates), writes missing master row!
      const retryResult = context.handleStagingRefund(ssMock, refundEntity);
      expect(retryResult.creditNoteNumber).toBe("STAGE-CN-101");
      expect(sheetsData.GST_Sales_Register.length).toBe(2); // Still exactly 1 row (no duplication!)
      expect(sheetsData.Master_GST_Sales_Register.length).toBe(2); // Master now has 1 row (repaired!)
      expect(propsStore.CREDIT_NOTE_rfnd_partial_write_fail).toBe("STAGE-CN-101");
    });

    it("resumes and completes safely if failure occurs during or after PDF generation", () => {
      let failPdf = true;
      const { context, ssMock, sheetsData, propsStore } = createStagingScriptSandbox({
        pdfFailHook: () => {
          if (failPdf) {
            failPdf = false;
            throw new Error("SIMULATED_PDF_CONVERSION_ERROR");
          }
        },
      });

      const refundEntity = { id: "rfnd_pdf_fail_01", payment_id: "pay_pdf_01", amount: 400000 };

      // Attempt 1: Fails during PDF generation after registers were written
      expect(() => context.handleStagingRefund(ssMock, refundEntity)).toThrow(/PDF_GENERATION_FAILED/);
      expect(sheetsData.GST_Sales_Register.length).toBe(2);
      expect(sheetsData.Master_GST_Sales_Register.length).toBe(2);

      // Attempt 2: Reuses same credit note, detects existing register rows, completes PDF
      const res2 = context.handleStagingRefund(ssMock, refundEntity);
      expect(res2.success).toBe(true);
      expect(res2.creditNoteNumber).toBe("STAGE-CN-101");
      expect(sheetsData.GST_Sales_Register.length).toBe(2); // No duplicate rows
      expect(sheetsData.Master_GST_Sales_Register.length).toBe(2);
      expect(propsStore.CREDIT_NOTE_rfnd_pdf_fail_01).toBe("STAGE-CN-101");
    });

    it("serializes concurrent duplicate refund processing without duplicate financial entries", () => {
      const { context, ssMock, sheetsData, propsStore } = createStagingScriptSandbox();

      const refundEntity = { id: "rfnd_concurrent_01", payment_id: "pay_conc_01", amount: 500000 };

      // Simulated concurrent call 1
      const call1 = context.handleStagingRefund(ssMock, refundEntity);
      // Simulated concurrent call 2
      const call2 = context.handleStagingRefund(ssMock, refundEntity);

      expect(call1.creditNoteNumber).toBe("STAGE-CN-101");
      expect(call2.creditNoteNumber).toBe("STAGE-CN-101"); // Exactly identical
      expect(call2.alreadyProcessed).toBe(true);
      expect(propsStore.STAGING_CREDIT_NOTE_COUNTER).toBe("101");
      expect(sheetsData.GST_Sales_Register.length).toBe(2); // 1 header + 1 row
      expect(sheetsData.Master_GST_Sales_Register.length).toBe(2);
    });
  });

  describe("3. Master-Register Recovery on Invoice Creation", () => {
    it("repairs missing master register write on retry without duplicating GST_Sales_Register", () => {
      let failMaster = true;
      const { context, ssMock, sheetsData } = createStagingScriptSandbox({
        beforeAppendHook: (sheetName) => {
          if (sheetName === "Master_GST_Sales_Register" && failMaster) {
            failMaster = false;
            throw new Error("SIMULATED_SHEETS_MASTER_APPEND_TIMEOUT");
          }
        },
      });

      const paymentEntity = {
        id: "pay_recovery_test_01",
        order_id: "order_rec_01",
        amount: 589900,
        currency: "INR",
        notes: { customer_name: "Repair Learner", billing_state: "Tamil Nadu" },
      };

      // Call 1: Local register succeeds, master register fails
      expect(() => {
        context.appendToStagingGstSalesRegister(ssMock, paymentEntity, "STAGE-INV-1001", "academy");
      }).toThrow(/MASTER_REGISTER_WRITE_FAILED/);

      expect(sheetsData.GST_Sales_Register.length).toBe(2); // Local wrote 1 row
      expect(sheetsData.Master_GST_Sales_Register.length).toBe(1); // Master has 0 rows

      // Call 2 (Retry): Local register detects existing paymentId (skips write), master register appends missing row!
      context.appendToStagingGstSalesRegister(ssMock, paymentEntity, "STAGE-INV-1001", "academy");

      expect(sheetsData.GST_Sales_Register.length).toBe(2); // Local still has 1 row (zero duplicates!)
      expect(sheetsData.Master_GST_Sales_Register.length).toBe(2); // Master register repaired!
    });
  });

  describe("4. Academy Worker Staging Endpoint Transport", () => {
    it("processes createVerifiedInvoice request from Academy worker with server HMAC signature", () => {
      const { context, ssMock, sheetsData } = createStagingScriptSandbox();
      const timestamp = Date.now();
      const secret = "mock_proxy_secret_1234567890123456";
      const crypto = require("node:crypto");
      const sig = crypto.createHmac("sha256", secret)
        .update(`invoice|pay_worker_01|order_worker_01|4999|${timestamp}`)
        .digest("hex");

      const postEvent = {
        postData: {
          contents: JSON.stringify({
            action: "createVerifiedInvoice",
            paymentId: "pay_worker_01",
            orderId: "order_worker_01",
            customerName: "Worker Student",
            customerEmail: "worker@example.com",
            customerMobile: "9876543210",
            billingState: "Tamil Nadu",
            amount: 4999,
            timestamp,
            signature: sig,
          }),
        },
      };

      const res = context.doPost(postEvent);
      const parsed = JSON.parse(res.getContent());

      expect(parsed.success).toBe(true);
      expect(parsed.invoiceNumber).toBe("STAGE-INV-1001");
      expect(parsed.paymentId).toBe("pay_worker_01");
      expect(sheetsData.GST_Sales_Register.length).toBe(2);
      expect(sheetsData.Master_GST_Sales_Register.length).toBe(2);
    });

    it("rejects createVerifiedInvoice if worker HMAC signature is invalid", () => {
      const { context } = createStagingScriptSandbox();
      const timestamp = Date.now();

      const postEvent = {
        postData: {
          contents: JSON.stringify({
            action: "createVerifiedInvoice",
            paymentId: "pay_worker_bad",
            orderId: "order_worker_bad",
            amount: 4999,
            timestamp,
            signature: "invalid_tampered_signature_hex",
          }),
        },
      };

      const res = context.doPost(postEvent);
      const parsed = JSON.parse(res.getContent());

      expect(parsed.success).toBe(false);
      expect(parsed.error).toContain("INVALID_WORKER_SIGNATURE");
    });
  });
});
