import { describe, it, expect, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  openPrintableGstInvoice,
  registerVerifiedInvoiceRecord,
} from "../lib/gstUtils";

describe("Phase 2D: Invoice Numbering Safety & Anti-Synthetic Fallback Regression Tests", () => {
  const courseProjects = [
    { key: "claude_masterclass", file: "backend/apps_script/claude_masterclass/apps_script.gs" },
    { key: "academy", file: "backend/apps_script/academy/apps_script.gs" },
    { key: "advanced_masterclass", file: "backend/apps_script/advanced_masterclass/apps_script.gs" },
    { key: "ai_bgm", file: "backend/apps_script/ai_bgm/apps_script.gs" },
    { key: "ai_masterclass", file: "backend/apps_script/ai_masterclass/apps_script.gs" },
    { key: "consulting", file: "backend/apps_script/consulting/apps_script.gs" },
    { key: "professionals", file: "backend/apps_script/professionals/apps_script.gs" },
    { key: "upscale", file: "backend/apps_script/upscale/apps_script.gs" },
  ];

  describe("1. Static Audit: Zero Synthetic Numbering Across All 8 Projects", () => {
    for (const project of courseProjects) {
      it(`[${project.key}] has ZERO occurrences of Math.random() in production invoice generation`, () => {
        const fullPath = path.resolve(process.cwd(), project.file);
        expect(fs.existsSync(fullPath)).toBe(true);
        const code = fs.readFileSync(fullPath, "utf8");

        expect(code).not.toContain("Math.random");
      });

      it(`[${project.key}] enforces INVOICE_NUMBER_ALLOCATION_FAILED on missing or malformed provider numbers`, () => {
        const fullPath = path.resolve(process.cwd(), project.file);
        const code = fs.readFileSync(fullPath, "utf8");

        expect(code).toContain("INVOICE_NUM_ALLOC_FAILED");
        expect(code).toContain("INVOICE_NUMBER_ALLOCATION_FAILED");
        expect(code).not.toContain('nextInvoiceNumber = numJson.invoiceNumber || String(Math.floor');
      });

      it(`[${project.key}] strictly prevents PDF generation and GST_Sales_Register writes without authoritative invoice number`, () => {
        const fullPath = path.resolve(process.cwd(), project.file);
        const code = fs.readFileSync(fullPath, "utf8");

        expect(code).toContain("INVOICE_PDF_FAILED");
        expect(code).not.toContain('const invNumber = invoiceNo || ("TT/26-27/"');
      });

      it(`[${project.key}] flags historical un-numbered sheet rows for reconciliation rather than fabricating synthetic numbers`, () => {
        const fullPath = path.resolve(process.cwd(), project.file);
        const code = fs.readFileSync(fullPath, "utf8");

        expect(code).toContain("needsReconciliation: true");
        expect(code).toContain("INVOICE_RECONCILIATION_REQUIRED");
        expect(code).not.toContain('invoiceNumber: "TT/26-27/" + cleanPayId.replace');
      });
    }
  });

  describe("2. Client-Side Printable Invoice Strictness (gstUtils.ts)", () => {
    it("rejects openPrintableGstInvoice if invoiceNumber is missing or empty string", () => {
      const recordWithoutNumber = registerVerifiedInvoiceRecord({
        customerName: "Bob Student",
        paymentId: "pay_TestBobPay01",
        orderId: "order_TestBobOrd01",
        totalAmountPaid: 589,
        courseName: "Claude Masterclass 2026",
      });

      expect(() => openPrintableGstInvoice(recordWithoutNumber)).toThrow(
        /INVOICE_NUMBER_ALLOCATION_FAILED/
      );
    });

    it("accepts openPrintableGstInvoice when authoritative invoiceNumber is present", () => {
      const recordWithNumber = registerVerifiedInvoiceRecord({
        customerName: "Bob Student",
        paymentId: "pay_TestBobPay02",
        orderId: "order_TestBobOrd02",
        totalAmountPaid: 589,
        courseName: "Claude Masterclass 2026",
        invoiceNumber: "TT/26-27/000987",
      });

      const openSpy = vi.spyOn(window, "open").mockReturnValue({
        document: {
          open: vi.fn(),
          write: vi.fn(),
          close: vi.fn(),
        },
        focus: vi.fn(),
      } as any);

      expect(() => openPrintableGstInvoice(recordWithNumber)).not.toThrow();
      expect(openSpy).toHaveBeenCalled();
    });
  });

  describe("3. Reconciliation and Uncertainty Handling Contract", () => {
    it("preserves UNCERTAIN_INVOICE_PENDING state on timeout to prevent duplicate invoice generation", () => {
      const claudeCode = fs.readFileSync(
        path.resolve(process.cwd(), "backend/apps_script/claude_masterclass/apps_script.gs"),
        "utf8"
      );

      // Verify state transitions on failure
      expect(claudeCode).toContain('props.setProperty("INVOICE_STATE_" + cleanPayId, "UNCERTAIN_INVOICE_PENDING")');
      expect(claudeCode).toContain('sheet.getRange(foundIndex + 1, 8).setValue("PENDING_RECONCILIATION")');
      expect(claudeCode).toContain('sheet.getRange(foundIndex + 1, 11).setValue("WAITING_INVOICE")');
      expect(claudeCode).toContain('error: "UNCERTAIN_INVOICE_PENDING: Invoice outcome is uncertain. Held for reconciliation to prevent duplicate invoice creation."');
    });

    it("verifies pre-retry reconciliation is invoked before retrying FunnelsDone creation", () => {
      const claudeCode = fs.readFileSync(
        path.resolve(process.cwd(), "backend/apps_script/claude_masterclass/apps_script.gs"),
        "utf8"
      );

      expect(claudeCode).toContain("INVOICE_RECOVERED");
      expect(claudeCode).toContain("candidateMatches.length === 1");
      expect(claudeCode).toContain("INVOICE_LOOKUP_FAILED");
    });
  });
});
