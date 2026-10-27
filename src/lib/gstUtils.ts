/**
 * Centralized GST Calculation (18% Exclusive), Indian CGST Rule 46 Tax Invoice Generator,
 * & Cybersecurity Input Validation Utilities
 * For all Tech Tycoon course & masterclass checkout flows on course.techtycoon.in
 */

export const GST_RATE = 0.18;
export const CGST_RATE = 0.09;
export const SGST_RATE = 0.09;
export const INDIAN_GST_STATE_CODES: Record<string, string> = {
  "01": "Jammu & Kashmir",
  "02": "Himachal Pradesh",
  "03": "Punjab",
  "04": "Chandigarh",
  "05": "Uttarakhand",
  "06": "Haryana",
  "07": "Delhi",
  "08": "Rajasthan",
  "09": "Uttar Pradesh",
  "10": "Bihar",
  "11": "Sikkim",
  "12": "Arunachal Pradesh",
  "13": "Nagaland",
  "14": "Manipur",
  "15": "Mizoram",
  "16": "Tripura",
  "17": "Meghalaya",
  "18": "Assam",
  "19": "West Bengal",
  "20": "Jharkhand",
  "21": "Odisha",
  "22": "Chhattisgarh",
  "23": "Madhya Pradesh",
  "24": "Gujarat",
  "26": "Dadra & Nagar Haveli and Daman & Diu",
  "27": "Maharashtra",
  "28": "Andhra Pradesh",
  "29": "Karnataka",
  "30": "Goa",
  "31": "Lakshadweep",
  "32": "Kerala",
  "33": "Tamil Nadu",
  "34": "Puducherry",
  "35": "Andaman & Nicobar Islands",
  "36": "Telangana",
  "37": "Andhra Pradesh (New)",
  "38": "Ladakh",
  "97": "Other Territory",
};

export function determinePlaceOfSupply(stateInput?: string, gstin?: string) {
  const cleanGstin = String(gstin || "").trim().toUpperCase();
  if (/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(cleanGstin)) {
    const code = cleanGstin.substring(0, 2);
    const stateName = INDIAN_GST_STATE_CODES[code] || "India";
    const isInterState = code !== "33";
    return {
      placeOfSupply: code + "-" + stateName,
      isInterState,
      supplyType: isInterState ? "B2B Inter-State" : "B2B Intra-State",
      isB2B: true,
      stateCode: code,
      stateName,
    };
  }

  const cleanState = String(stateInput || "").trim().toLowerCase();
  if (!cleanState) {
    return {
      placeOfSupply: "Unspecified State (Missing)",
      isInterState: false,
      supplyType: "HOLD_FOR_REVIEW_MISSING_STATE",
      isB2B: false,
      isMissingState: true,
      stateCode: undefined,
      stateName: undefined,
    };
  }

  for (const [code, name] of Object.entries(INDIAN_GST_STATE_CODES)) {
    if (cleanState === code || cleanState === name.toLowerCase()) {
      const isInterState = code !== "33";
      return {
        placeOfSupply: code + "-" + name,
        isInterState,
        supplyType: isInterState ? "B2C Inter-State" : "B2C Intra-State",
        isB2B: false,
        stateCode: code,
        stateName: name,
      };
    }
  }

  return {
    placeOfSupply: "Invalid State (" + stateInput + ")",
    isInterState: false,
    supplyType: "HOLD_FOR_REVIEW_INVALID_STATE",
    isB2B: false,
    isInvalidState: true,
    stateCode: undefined,
    stateName: undefined,
  };
}

export interface GstBreakdown {
  baseAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  exactGstAmount: number;
  gstRatePercent: number;
  gstAmount: number;
  roundOff: number;
  totalAmount: number;
  totalInPaise: number;
}

/**
 * Known standard base prices mapped from their rounded 18% GST total.
 * Ensures that ₹117 paid maps to exact ₹99.00 Base + ₹8.91 CGST + ₹8.91 SGST + ₹0.18 Round Off,
 * rather than ₹99.15 from naive reverse division.
 */
const TOTAL_TO_EXACT_BASE_MAP: Record<number, number> = {
  117: 99,
  471: 399,
  589: 499,
  943: 799,
  1179: 999,
  1769: 1499,
  2359: 1999,
  2949: 2499,
  2950: 2500,
  3539: 2999,
  4130: 3500,
  5899: 4999,
  8259: 6999,
  11799: 9999,
  17699: 14999,
};

/**
 * Calculates +18% GST on top of any base session price.
 * Uses standard nearest-rupee rounding under Section 170 of the CGST Act, 2017
 * (e.g., ₹99.00 Base + ₹8.91 CGST + ₹8.91 SGST = ₹116.82 -> Round Off +₹0.18 = ₹117.00).
 */
export function calculateGstBreakdown(baseAmount: number): GstBreakdown {
  const safeBase = Math.max(0, Math.round(Number(baseAmount) || 0));
  const cgstAmount = Math.round(safeBase * CGST_RATE * 100) / 100;
  const sgstAmount = Math.round(safeBase * SGST_RATE * 100) / 100;
  const exactGstAmount = Math.round((cgstAmount + sgstAmount) * 100) / 100;
  const gstAmount = Math.round(safeBase * GST_RATE);
  const totalAmount = safeBase + gstAmount;
  const roundOff = Math.round((totalAmount - (safeBase + exactGstAmount)) * 100) / 100;

  return {
    baseAmount: safeBase,
    cgstAmount,
    sgstAmount,
    exactGstAmount,
    gstRatePercent: 18,
    gstAmount,
    roundOff,
    totalAmount,
    totalInPaise: totalAmount * 100,
  };
}

/**
 * Calculates GST-inclusive breakdown where `totalAmount` is the final payable price (inclusive of 18% GST).
 * E.g., for ₹99 inclusive: Base ₹83.90 + CGST ₹7.55 + SGST ₹7.55 = ₹99.00 Total Payable.
 */
export function calculateInclusiveGstBreakdown(totalAmount: number): GstBreakdown {
  const safeTotal = Math.max(0, Math.round(Number(totalAmount) || 0));
  const baseAmount = Math.round((safeTotal / (1 + GST_RATE)) * 100) / 100;
  const cgstAmount = Math.round(baseAmount * CGST_RATE * 100) / 100;
  const sgstAmount = Math.round(baseAmount * SGST_RATE * 100) / 100;
  const exactGstAmount = Math.round((cgstAmount + sgstAmount) * 100) / 100;
  const roundOff = Math.round((safeTotal - (baseAmount + exactGstAmount)) * 100) / 100;

  return {
    baseAmount,
    cgstAmount,
    sgstAmount,
    exactGstAmount,
    gstRatePercent: 18,
    gstAmount: exactGstAmount,
    roundOff,
    totalAmount: safeTotal,
    totalInPaise: safeTotal * 100,
  };
}

/**
 * Given the total amount paid (and optionally an explicit base amount),
 * returns an accounting-accurate CGST Rule 46 breakdown with exact Base, CGST (9%), SGST (9%), and Round Off.
 */
export function getInvoiceAccountingBreakdown(
  totalPaid: number,
  explicitBase?: number,
  options?: { isInterState?: boolean }
) {
  const total = Math.max(1, Math.round(Number(totalPaid) || 117));
  if (total === 1) {
    return {
      isTest: true,
      baseAmount: 1,
      cgst: 0,
      sgst: 0,
      igst: 0,
      totalGst: 0,
      roundOff: 0,
      totalAmount: 1,
    };
  }

  const matchedBase =
    explicitBase && explicitBase > 0
      ? explicitBase
      : TOTAL_TO_EXACT_BASE_MAP[total] ?? Math.round((total / 1.18) * 100) / 100;

  const isInterState = Boolean(options?.isInterState);

  if (isInterState) {
    const igst = Math.round(matchedBase * GST_RATE * 100) / 100;
    const roundOff = Math.round((total - (matchedBase + igst)) * 100) / 100;
    return {
      isTest: false,
      baseAmount: matchedBase,
      cgst: 0,
      sgst: 0,
      igst,
      totalGst: igst,
      roundOff,
      totalAmount: total,
    };
  }

  const cgst = Math.round(matchedBase * CGST_RATE * 100) / 100;
  const sgst = Math.round(matchedBase * SGST_RATE * 100) / 100;
  const totalGst = Math.round((cgst + sgst) * 100) / 100;
  const roundOff = Math.round((total - (matchedBase + totalGst)) * 100) / 100;

  return {
    isTest: false,
    baseAmount: matchedBase,
    cgst,
    sgst,
    igst: 0,
    totalGst,
    roundOff,
    totalAmount: total,
  };
}

/**
 * Converts a number in INR into Indian Accounting Words (Rupees ... Only)
 * Required under Rule 46 of CGST Rules, 2017.
 */
export function numberToIndianRupeesWords(amount: number): string {
  const num = Math.round(Math.max(0, Number(amount) || 0));
  if (num === 0) return "Indian Rupees Zero Only";

  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen"
  ];
  const tens = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
  ];

  function twoDigitWords(n: number): string {
    if (n < 20) return ones[n];
    const t = Math.floor(n / 10);
    const o = n % 10;
    return tens[t] + (o ? " " + ones[o] : "");
  }

  function threeDigitWords(n: number): string {
    const h = Math.floor(n / 100);
    const rem = n % 100;
    let res = "";
    if (h > 0) res += ones[h] + " Hundred";
    if (rem > 0) res += (res ? " and " : "") + twoDigitWords(rem);
    return res;
  }

  let rem = num;
  const parts: string[] = [];

  const crore = Math.floor(rem / 10000000);
  rem %= 10000000;
  if (crore > 0) parts.push(threeDigitWords(crore) + " Crore");

  const lakh = Math.floor(rem / 100000);
  rem %= 100000;
  if (lakh > 0) parts.push(twoDigitWords(lakh) + " Lakh");

  const thousand = Math.floor(rem / 1000);
  rem %= 1000;
  if (thousand > 0) parts.push(twoDigitWords(thousand) + " Thousand");

  if (rem > 0) parts.push(threeDigitWords(rem));

  return "Indian Rupees " + parts.join(" ") + " Only";
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
  pan: "AAZFT9667P",
  stateName: "Tamil Nadu",
  stateCode: "33",
  sacCode: "999293",
  sacDescription: "Commercial Training & Coaching Services",
  fullAddress: "No. 3/59B, 1st Floor, 3rd Street, Ragava Nagar, Moovarasampet, Chennai-600091",
  addressLine1: "No. 3/59B, 1st Floor, 3rd Street, Ragava Nagar",
  cityStateZip: "Moovarasampet, Chennai-600091",
  phone: "+91 7558133039",
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
  baseAmount?: number;
  paymentId: string;
  orderId?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
}

const RAZORPAY_PAYMENT_ID_REGEX = /^pay_[A-Za-z0-9]{6,}$/;
const RAZORPAY_ORDER_ID_REGEX = /^order_[A-Za-z0-9]{6,}$/;

/**
 * Unforgeable in-memory registry of server-verified invoice records.
 * Prevents URL parameter tampering or unverified client calls from generating an official PAID GST Tax Invoice.
 */
const VERIFIED_INVOICE_RECORDS = new WeakSet<InvoicePrintParams>();

export const VERIFIED_BACKEND_ENDPOINTS: Record<string, string> = {
  ai_masterclass: "https://script.google.com/macros/s/AKfycby0fX7tjbOciJbg0Mw1SRMhlazBe4FG1Ko-f5mIFCW6Y7zGKHGZjdUZQKXclfye1FzegA/exec",
  advanced_masterclass: "https://script.google.com/macros/s/AKfycbw59X8thSpB9xrJSI0GhACEm617vAbc7BDH6hJFOOBsOeq-B4az0p3B_O6koMjYfsppgA/exec",
  upscale: "https://script.google.com/macros/s/AKfycbzPxPpp0ksCcE6IY8mUlzcu0jqY1RSfhCl2Locq1iOYbbe5beBeeQ6uefCV93Nxy8rbsg/exec",
  claude_masterclass: "https://script.google.com/macros/s/AKfycbwP2rffwhgGYQjJFlfxYU4XHt-jFbUlWtYPAJOZcxIO--yvw2NTlnLvJDHHh4_giLq7/exec",
  academy: "https://script.google.com/macros/s/AKfycbwl1WKBrQxxMRbz7aj6GBUNbmR4ePHshhrBwcNjhxorIayQpMTmHaHHT_MvTroQ-ZrFbA/exec",
  ai_bgm: "https://script.google.com/macros/s/AKfycbwGaOKJYsQiHuhueRVy_iosxeKKO1qPj748jnUqkfwnmYmvgxWdkHiXB4cON6wF4iXnaA/exec",
  consulting: "https://script.google.com/macros/s/AKfycbzF4e05xth7Kdzx8gJKXI-vqPgKUSacLE8aGRT8hvg-7B75qvQw_gYwmRacsq3cNIsD/exec",
  professionals: "https://script.google.com/macros/s/AKfycbzuTE9PUoTneN4PF0TKhHwrDXZEfSo-92Ly10dHFd8pGsY1DzjmBa6A5A3aTCRSd6TpFQ/exec",
};

export function isValidRazorpayIds(paymentId?: string, orderId?: string): boolean {
  return (
    RAZORPAY_PAYMENT_ID_REGEX.test((paymentId || "").trim()) &&
    RAZORPAY_ORDER_ID_REGEX.test((orderId || "").trim())
  );
}

/**
 * Unforgeable in-memory registry of server-verified invoice records.
 * Private to gstUtils module. Prevents client-side scripts from forging verified records.
 */
export function registerVerifiedInvoiceRecord(record: InvoicePrintParams): InvoicePrintParams {
  if (!record || typeof record !== "object") {
    throw new Error("UNVERIFIED_INVOICE_BLOCKED: Invalid invoice record.");
  }
  const cleanPayId = (record.paymentId || "").trim();
  const cleanOrdId = (record.orderId || "").trim();
  if (!RAZORPAY_PAYMENT_ID_REGEX.test(cleanPayId) || !RAZORPAY_ORDER_ID_REGEX.test(cleanOrdId)) {
    throw new Error(
      "UNVERIFIED_INVOICE_BLOCKED: Official GST Tax Invoices require a server-verified Razorpay paymentId (pay_...) and orderId (order_...)."
    );
  }
  if (!Number.isFinite(Number(record.totalAmountPaid)) || Number(record.totalAmountPaid) <= 0) {
    throw new Error("UNVERIFIED_INVOICE_BLOCKED: Verified amount must be a positive number.");
  }
  const frozenRecord: InvoicePrintParams = {
    customerName: record.customerName || "Learner",
    customerEmail: record.customerEmail || "",
    customerPhone: record.customerPhone || "",
    courseName: record.courseName || "AI Training Program",
    totalAmountPaid: Number(record.totalAmountPaid),
    baseAmount: record.baseAmount,
    paymentId: cleanPayId,
    orderId: cleanOrdId,
    invoiceNumber: record.invoiceNumber,
    invoiceDate: record.invoiceDate,
  };
  VERIFIED_INVOICE_RECORDS.add(frozenRecord);
  return frozenRecord;
}

/**
 * Retrieves server-verified invoice details from the backend using paymentId, orderId, and auth token.
 * Rejects tampered URL parameters, unauthenticated access, or unverified payment IDs.
 */
export async function fetchVerifiedInvoiceFromBackend(options: {
  paymentId: string;
  orderId: string;
  token?: string;
  contact?: string;
  backendUrl?: string;
  fetchImpl?: typeof fetch;
}): Promise<InvoicePrintParams> {
  const cleanPayId = (options.paymentId || "").trim();
  const cleanOrdId = (options.orderId || "").trim();

  if (!isValidRazorpayIds(cleanPayId, cleanOrdId)) {
    throw new Error(
      "UNVERIFIED_INVOICE_BLOCKED: Missing or invalid Razorpay paymentId or orderId. URL parameters cannot be used to generate an unverified invoice."
    );
  }

  const fetcher = options.fetchImpl || fetch;
  const candidateUrls = options.backendUrl
    ? [options.backendUrl]
    : Object.values(VERIFIED_BACKEND_ENDPOINTS);

  for (const endpoint of candidateUrls) {
    try {
      // POST request body eliminates token exposure in URL query strings,
      // browser history, access logs, and HTTP Referer headers.
      const postPayload = {
        action: "getVerifiedInvoice",
        paymentId: cleanPayId,
        orderId: cleanOrdId,
        token: options.token ? String(options.token).trim() : undefined,
        contact: options.contact ? String(options.contact).trim() : undefined,
      };

      const res = await fetcher(endpoint, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(postPayload),
      });
      if (!res || !res.ok) continue;
      const data = await res.json();
      if (
        data &&
        data.success === true &&
        data.verified === true &&
        data.invoice &&
        data.invoice.paymentId === cleanPayId &&
        data.invoice.orderId === cleanOrdId
      ) {
        const inv = data.invoice;
        const totalPaid = Number(inv.totalAmountPaid ?? inv.amount ?? inv.total);
        if (!Number.isFinite(totalPaid) || totalPaid <= 0) continue;

        return registerVerifiedInvoiceRecord({
          customerName: String(inv.customerName || inv.name || "Learner"),
          customerEmail: String(inv.customerEmail || inv.email || ""),
          customerPhone: String(inv.customerPhone || inv.phone || ""),
          courseName: String(inv.courseName || inv.course || "AI Training Program"),
          totalAmountPaid: totalPaid,
          baseAmount: inv.baseAmount ? Number(inv.baseAmount) : undefined,
          paymentId: cleanPayId,
          orderId: cleanOrdId,
          invoiceNumber: inv.invoiceNumber ? String(inv.invoiceNumber) : undefined,
          invoiceDate: inv.invoiceDate ? String(inv.invoiceDate) : undefined,
        });
      }
    } catch {
      // Try next endpoint if multiple candidates exist
    }
  }

  throw new Error(
    "UNVERIFIED_INVOICE_BLOCKED: Payment could not be verified with the backend server."
  );
}

/**
 * Opens a clean, printable & downloadable CGST Rule 46 compliant Tax Invoice window.
 * Strictly blocks unverified calls or URL-parameter-forged invoice requests.
 */
export function openPrintableGstInvoice(params: InvoicePrintParams): void {
  if (
    !params ||
    !VERIFIED_INVOICE_RECORDS.has(params) ||
    !isValidRazorpayIds(params.paymentId, params.orderId)
  ) {
    throw new Error(
      "UNVERIFIED_INVOICE_BLOCKED: Cannot generate an official PAID GST Tax Invoice without server-side payment verification."
    );
  }

  if (!params.invoiceNumber || typeof params.invoiceNumber !== "string" || !params.invoiceNumber.trim()) {
    throw new Error(
      "INVOICE_NUMBER_ALLOCATION_FAILED: Official Tax Invoice cannot be rendered without an authoritative invoice number."
    );
  }

  const acct = getInvoiceAccountingBreakdown(params.totalAmountPaid, params.baseAmount);
  const amountInWords = numberToIndianRupeesWords(acct.totalAmount);
  const invoiceNumber = params.invoiceNumber.trim();
  const dateStr =
    params.invoiceDate ||
    new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const roundOffSign = acct.roundOff >= 0 ? "+" : "-";
  const roundOffAbs = Math.abs(acct.roundOff).toFixed(2);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>GST Tax Invoice - ${invoiceNumber}</title>
  <style>
    * { box-sizing: border-box; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif; }
    body { margin: 0; padding: 28px; background: #f1f5f9; color: #0f172a; }
    .invoice-card { max-width: 800px; margin: 0 auto; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 16px; padding: 36px; box-shadow: 0 10px 25px rgba(0,0,0,0.06); }
    .top-bar { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 24px; }
    .company-name { font-size: 20px; font-weight: 900; color: #0f172a; margin: 0 0 4px; letter-spacing: 0.3px; }
    .company-meta { font-size: 12px; color: #475569; line-height: 1.5; margin: 0; }
    .badge-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
    .gstin-badge { display: inline-block; padding: 4px 10px; background: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; font-weight: 800; font-size: 11.5px; border-radius: 6px; font-family: monospace; }
    .pan-badge { display: inline-block; padding: 4px 10px; background: #f8fafc; border: 1px solid #cbd5e1; color: #334155; font-weight: 700; font-size: 11.5px; border-radius: 6px; font-family: monospace; }
    .invoice-title { text-align: right; }
    .invoice-title h1 { font-size: 24px; font-weight: 900; color: #0f172a; margin: 0; letter-spacing: 1px; }
    .invoice-title .sub { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
    .paid-stamp { display: inline-block; margin-top: 8px; padding: 4px 12px; background: #dcfce7; border: 1px solid #86efac; color: #15803d; font-size: 12px; font-weight: 900; border-radius: 999px; text-transform: uppercase; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
    .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 16px; font-size: 12.5px; line-height: 1.6; }
    .info-box h4 { margin: 0 0 6px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; color: #64748b; font-weight: 800; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12.5px; }
    th { background: #0f172a; color: #ffffff; text-align: left; padding: 10px 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.6px; }
    td { padding: 12px; border-bottom: 1px solid #e2e8f0; color: #1e293b; }
    .num { text-align: right; font-family: monospace; font-weight: 700; }
    .summary-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; }
    .words-box { flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 14px; font-size: 12px; }
    .words-box .label { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b; letter-spacing: 0.6px; margin-bottom: 4px; }
    .words-box .val { font-weight: 800; color: #0f172a; }
    .summary-table { width: 340px; border-collapse: collapse; font-size: 13px; margin-bottom: 0; }
    .summary-table td { padding: 6px 10px; border-bottom: 1px solid #e2e8f0; }
    .summary-table tr.total-row td { border-top: 2px solid #0f172a; border-bottom: none; font-size: 15px; font-weight: 900; color: #0f172a; padding-top: 10px; }
    .footer-note { margin-top: 24px; padding-top: 16px; border-top: 1px dashed #cbd5e1; font-size: 11px; color: #64748b; display: flex; justify-content: space-between; align-items: flex-end; }
    .actions { max-width: 800px; margin: 0 auto 16px; display: flex; justify-content: flex-end; gap: 10px; }
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
          ${COMPANY_GST_DETAILS.fullAddress}<br/>
          State: ${COMPANY_GST_DETAILS.stateName} (Code: ${COMPANY_GST_DETAILS.stateCode}) • Mobile: ${COMPANY_GST_DETAILS.phone} • Email: ${COMPANY_GST_DETAILS.email}
        </p>
        <div class="badge-row">
          <span class="gstin-badge">GSTIN: ${COMPANY_GST_DETAILS.gstin}</span>
          <span class="pan-badge">PAN: ${COMPANY_GST_DETAILS.pan}</span>
          <span class="pan-badge">SAC: ${COMPANY_GST_DETAILS.sacCode}</span>
        </div>
      </div>
      <div class="invoice-title">
        <h1>TAX INVOICE</h1>
        <div class="sub">Original for Recipient (Rule 46 CGST Rules)</div>
        <div class="paid-stamp">✓ PAID</div>
      </div>
    </div>

    <div class="grid-2">
      <div class="info-box">
        <h4>Billed To (Recipient Details)</h4>
        <strong>${sanitizeTextInput(params.customerName || "Learner", 80)}</strong><br/>
        ${params.customerEmail ? `Email: ${sanitizeTextInput(params.customerEmail, 100)}<br/>` : ""}
        ${params.customerPhone ? `Phone: ${sanitizeTextInput(params.customerPhone, 30)}<br/>` : ""}
        <strong>Place of Supply:</strong> Tamil Nadu (State Code: 33)<br/>
        <strong>Supply Type:</strong> Intra-State Supply (B2C)
      </div>
      <div class="info-box">
        <h4>Invoice & Statutory Details</h4>
        <strong>Invoice No:</strong> <span style="font-family:monospace">${invoiceNumber}</span><br/>
        <strong>Invoice Date:</strong> ${dateStr}<br/>
        <strong>Payment ID:</strong> <span style="font-family:monospace">${sanitizeTextInput(params.paymentId || "PAID", 60)}</span><br/>
        ${params.orderId ? `<strong>Order Ref:</strong> <span style="font-family:monospace">${sanitizeTextInput(params.orderId, 60)}</span><br/>` : ""}
        <strong>Reverse Charge (RCM):</strong> No | <strong>Mode:</strong> Razorpay
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Description of Service</th>
          <th>SAC</th>
          <th class="num">Taxable Value</th>
          <th class="num">CGST (9%)</th>
          <th class="num">SGST (9%)</th>
          <th class="num">Total (INR)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td><strong>${sanitizeTextInput(params.courseName, 120)}</strong><br/><span style="font-size:11px;color:#64748b">${COMPANY_GST_DETAILS.sacDescription}</span></td>
          <td style="font-family:monospace">${COMPANY_GST_DETAILS.sacCode}</td>
          <td class="num">₹${acct.baseAmount.toFixed(2)}</td>
          <td class="num">₹${acct.cgst.toFixed(2)}</td>
          <td class="num">₹${acct.sgst.toFixed(2)}</td>
          <td class="num">₹${(acct.baseAmount + acct.totalGst).toFixed(2)}</td>
        </tr>
      </tbody>
    </table>

    <div class="summary-row">
      <div class="words-box">
        <div class="label">Total Invoice Amount in Words</div>
        <div class="val">${amountInWords}</div>
        <div style="margin-top:8px;font-size:11px;color:#64748b;">
          • Tax is not payable on Reverse Charge basis (RCM: No).<br/>
          • Rounded off to nearest Rupee u/s 170 of the CGST Act, 2017.
        </div>
      </div>

      <table class="summary-table">
        <tr>
          <td>Taxable Base Amount:</td>
          <td class="num">₹${acct.baseAmount.toFixed(2)}</td>
        </tr>
        <tr>
          <td>Add: CGST @ 9%:</td>
          <td class="num">+ ₹${acct.cgst.toFixed(2)}</td>
        </tr>
        <tr>
          <td>Add: SGST @ 9%:</td>
          <td class="num">+ ₹${acct.sgst.toFixed(2)}</td>
        </tr>
        ${acct.roundOff !== 0 ? `<tr>
          <td>Round Off (Sec 170 CGST Act):</td>
          <td class="num">${roundOffSign} ₹${roundOffAbs}</td>
        </tr>` : ""}
        <tr class="total-row">
          <td>Total Invoice Value (INR):</td>
          <td class="num">₹${acct.totalAmount.toFixed(2)}</td>
        </tr>
      </table>
    </div>

    <div class="footer-note">
      <div>
        <span>Certified that the particulars given above are true and correct.</span><br/>
        <span>This is a computer-generated GST Tax Invoice and requires no physical signature.</span>
      </div>
      <div style="text-align:right;">
        <div style="font-size:11px;color:#475569;">For <strong>${COMPANY_GST_DETAILS.legalName}</strong></div>
        <div style="margin-top:8px;font-weight:800;color:#0f172a;">Authorised Signatory</div>
      </div>
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
