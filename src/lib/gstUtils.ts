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
