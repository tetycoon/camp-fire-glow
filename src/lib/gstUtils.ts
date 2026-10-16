/**
 * Centralized GST Calculation (18% Exclusive) & Cybersecurity Input Validation Utilities
 * For all Tech Tycoon course & masterclass checkout flows on course.techtycoon.in
 */

export const GST_RATE = 0.18;

export interface GstBreakdown {
  baseAmount: number;
  gstRatePercent: number;
  gstAmount: number;
  totalAmount: number;
  totalInPaise: number;
}

/**
 * Calculates +18% GST on top of any base session price.
 * Uses standard nearest-rupee rounding (e.g., ₹99 + ₹18 GST = ₹117).
 */
export function calculateGstBreakdown(baseAmount: number): GstBreakdown {
  const safeBase = Math.max(0, Math.round(Number(baseAmount) || 0));
  const gstAmount = Math.round(safeBase * GST_RATE);
  const totalAmount = safeBase + gstAmount;
  return {
    baseAmount: safeBase,
    gstRatePercent: 18,
    gstAmount,
    totalAmount,
    totalInPaise: totalAmount * 100,
  };
}

/**
 * Validates standard 15-character Indian GSTIN format:
 * 2 digits (State Code) + 5 letters (PAN) + 4 digits (PAN) + 1 letter (PAN) + 1 alphanumeric + 'Z' + 1 checksum alphanumeric
 */
export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export function isValidGstin(gstin: string): boolean {
  const cleaned = (gstin || "").trim().toUpperCase();
  if (!cleaned) return true; // Optional unless claimed
  return GSTIN_REGEX.test(cleaned);
}

/**
 * Sanitizes text input against XSS and Google Sheets Formula Injection (=, +, -, @)
 */
export function sanitizeTextInput(input: string, maxLength = 150): string {
  if (!input) return "";
  let cleaned = input
    .replace(/[<>]/g, "") // Strip angle brackets to prevent HTML/XSS injection
    .replace(/javascript:/gi, "")
    .trim();

  // Prevent Google Sheets / CSV Formula Injection if string starts with =, +, -, @
  if (/^[=+\-@]/.test(cleaned)) {
    cleaned = "'" + cleaned;
  }

  return cleaned.slice(0, maxLength);
}

/**
 * Validates email format safely
 */
export function isValidEmail(email: string): boolean {
  const cleaned = (email || "").trim();
  return /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/.test(cleaned);
}

/**
 * Checks if the email is an authorized internal ₹1 test email
 */
const AUTHORIZED_TEST_EMAILS = [
  "ambroseselva001@gmail.com",
  "techtycoondigitalsolutions@gmail.com",
  "techtycoondigitors@gmail.com",
];

export function isAuthorizedTestEmail(email: string): boolean {
  return AUTHORIZED_TEST_EMAILS.includes((email || "").trim().toLowerCase());
}

export const COMPANY_GST_DETAILS = {
  legalName: "TECH TYCOON DIGITAL SOLUTION LLP",
  gstin: "33AAZFT9667P1ZP",
  sacCode: "999293",
  addressLine1: "No. 3/59B, 1st Floor, 3rd Street, Ragava Nagar",
  cityStateZip: "Moovarasampet, Chennai, TAMILNADU - 600091",
  phone: "+91 75581 33039",
  email: "support@techtycoon.in",
  website: "https://course.techtycoon.in",
  logoUrl: "https://assets.cdn.filesafe.space/uUUUKRH7EP2A0oJBv4Zb/media/6accab95bbad531ac8a6b1af.png",
};

export interface InvoicePrintParams {
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  courseName: string;
  totalAmountPaid: number;
  paymentId: string;
  orderId?: string;
  invoiceDate?: string;
}

/**
 * Opens a clean, printable & downloadable GST Tax Invoice window from our side
 */
export function openPrintableGstInvoice(params: InvoicePrintParams): void {
  const total = Math.max(1, Number(params.totalAmountPaid) || 117);
  const isTest = total === 1;
  const baseAmount = isTest ? 1 : Math.round((total / 1.18) * 100) / 100;
  const totalGst = isTest ? 0 : Math.round((total - baseAmount) * 100) / 100;
  const cgst = Math.round((totalGst / 2) * 100) / 100;
  const sgst = Math.round((totalGst - cgst) * 100) / 100;

  const suffix = (params.paymentId || params.orderId || String(Date.now()))
    .replace(/[^A-Za-z0-9]/g, "")
    .slice(-6)
    .toUpperCase();
  const invoiceNumber = `TT/26-27/${suffix}`;
  const dateStr =
    params.invoiceDate ||
    new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>GST Tax Invoice - ${invoiceNumber}</title>
  <style>
    * { box-sizing: border-box; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif; }
    body { margin: 0; padding: 28px; background: #f1f5f9; color: #0f172a; }
    .invoice-card { max-width: 780px; margin: 0 auto; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 16px; padding: 36px; box-shadow: 0 10px 25px rgba(0,0,0,0.06); }
    .top-bar { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 24px; }
    .company-name { font-size: 20px; font-weight: 900; color: #0f172a; margin: 0 0 4px; letter-spacing: 0.3px; }
    .company-meta { font-size: 12px; color: #475569; line-height: 1.5; margin: 0; }
    .gstin-badge { display: inline-block; margin-top: 6px; padding: 4px 10px; background: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; font-weight: 800; font-size: 12px; border-radius: 6px; font-family: monospace; }
    .invoice-title { text-align: right; }
    .invoice-title h1 { font-size: 24px; font-weight: 900; color: #0f172a; margin: 0; letter-spacing: 1px; }
    .invoice-title .sub { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
    .paid-stamp { display: inline-block; margin-top: 8px; padding: 4px 12px; background: #dcfce7; border: 1px solid #86efac; color: #15803d; font-size: 12px; font-weight: 900; border-radius: 999px; text-transform: uppercase; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
    .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 16px; font-size: 12.5px; line-height: 1.6; }
    .info-box h4 { margin: 0 0 6px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; color: #64748b; font-weight: 800; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; }
    th { background: #0f172a; color: #ffffff; text-align: left; padding: 11px 14px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.7px; }
    td { padding: 12px 14px; border-bottom: 1px solid #e2e8f0; color: #1e293b; }
    .num { text-align: right; font-family: monospace; font-weight: 700; }
    .summary-wrap { display: flex; justify-content: flex-end; }
    .summary-table { width: 340px; border-collapse: collapse; font-size: 13px; }
    .summary-table td { padding: 7px 10px; border-bottom: 1px solid #e2e8f0; }
    .summary-table tr.total-row td { border-top: 2px solid #0f172a; border-bottom: none; font-size: 15px; font-weight: 900; color: #0f172a; padding-top: 12px; }
    .footer-note { margin-top: 28px; padding-top: 16px; border-top: 1px dashed #cbd5e1; font-size: 11px; color: #64748b; display: flex; justify-content: space-between; align-items: center; }
    .actions { max-width: 780px; margin: 0 auto 16px; display: flex; justify-content: flex-end; gap: 10px; }
    .btn { background: #0f172a; color: #fff; border: none; padding: 10px 18px; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; }
    @media print {
      body { background: #fff; padding: 0; }
      .actions { display: none !important; }
      .invoice-card { box-shadow: none; border: none; padding: 16px; }
    }
  </style>
</head>
<body>
  <div class="actions">
    <button class="btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
  </div>
  <div class="invoice-card">
    <div class="top-bar">
      <div>
        <h2 class="company-name">${COMPANY_GST_DETAILS.legalName}</h2>
        <p class="company-meta">
          ${COMPANY_GST_DETAILS.addressLine1}<br/>
          ${COMPANY_GST_DETAILS.cityStateZip}<br/>
          Phone: ${COMPANY_GST_DETAILS.phone} • Email: ${COMPANY_GST_DETAILS.email}
        </p>
        <div class="gstin-badge">GSTIN: ${COMPANY_GST_DETAILS.gstin}</div>
      </div>
      <div class="invoice-title">
        <h1>TAX INVOICE</h1>
        <div class="sub">Original for Recipient</div>
        <div class="paid-stamp">✓ PAID</div>
      </div>
    </div>

    <div class="grid-2">
      <div class="info-box">
        <h4>Billed To (Customer)</h4>
        <strong>${sanitizeTextInput(params.customerName || "Learner", 80)}</strong><br/>
        ${params.customerEmail ? `Email: ${sanitizeTextInput(params.customerEmail, 100)}<br/>` : ""}
        ${params.customerPhone ? `Phone: ${sanitizeTextInput(params.customerPhone, 30)}<br/>` : ""}
        Place of Supply: Tamil Nadu (33), India
      </div>
      <div class="info-box">
        <h4>Invoice & Payment Details</h4>
        <strong>Invoice No:</strong> <span style="font-family:monospace">${invoiceNumber}</span><br/>
        <strong>Invoice Date:</strong> ${dateStr}<br/>
        <strong>Payment ID:</strong> <span style="font-family:monospace">${sanitizeTextInput(params.paymentId || "PAID", 60)}</span><br/>
        ${params.orderId ? `<strong>Order ID:</strong> <span style="font-family:monospace">${sanitizeTextInput(params.orderId, 60)}</span><br/>` : ""}
        <strong>Payment Method:</strong> Razorpay Online
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Description of Service</th>
          <th>SAC Code</th>
          <th class="num">Qty</th>
          <th class="num">Taxable Value (INR)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td><strong>${sanitizeTextInput(params.courseName, 120)}</strong><br/><span style="font-size:11px;color:#64748b">Online / Live Educational & Training Program</span></td>
          <td style="font-family:monospace">${COMPANY_GST_DETAILS.sacCode}</td>
          <td class="num">1</td>
          <td class="num">₹${baseAmount.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>

    <div class="summary-wrap">
      <table class="summary-table">
        <tr>
          <td>Taxable Base Amount:</td>
          <td class="num">₹${baseAmount.toFixed(2)}</td>
        </tr>
        <tr>
          <td>CGST (9%):</td>
          <td class="num">+ ₹${cgst.toFixed(2)}</td>
        </tr>
        <tr>
          <td>SGST (9%):</td>
          <td class="num">+ ₹${sgst.toFixed(2)}</td>
        </tr>
        <tr class="total-row">
          <td>Total Amount Paid (Incl. GST):</td>
          <td class="num">₹${total.toFixed(2)}</td>
        </tr>
      </table>
    </div>

    <div class="footer-note">
      <span>This is a computer-generated GST Tax Invoice and does not require a physical signature.</span>
      <strong>${COMPANY_GST_DETAILS.legalName}</strong>
    </div>
  </div>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (win) {
    win.document.open();
    win.document.write(html);
    win.document.close();
  }
}
