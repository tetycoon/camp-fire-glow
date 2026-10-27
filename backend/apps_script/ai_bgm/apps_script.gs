/**
 * ============================================================================
 * AI_BGM_LLM — DEDICATED GOOGLE APPS SCRIPT AUTOMATION
 * Course: "Advance AI-Business Generative Model" (AI-BGM)
 * 
 * Target Google Sheet URL:
 * https://docs.google.com/spreadsheets/d/1XyFhw6cTJAOE2XT7Ra8lmL0rcvq2meCT9LlGuzOF0nk/edit?gid=0#gid=0
 * Spreadsheet ID: 1XyFhw6cTJAOE2XT7Ra8lmL0rcvq2meCT9LlGuzOF0nk
 * 
 * Columns in Sheet1:
 * Col A: Date and Time
 * Col B: Name
 * Col C: Email
 * Col D: Phone
 * Col E: Profession
 * Col F: Amount
 * Col G: Status
 * Col H: Order ID
 * Col I: Payment ID
 * ============================================================================
 */

// Known production spreadsheet IDs to prevent cross-environment pollution
const KNOWN_PRODUCTION_SPREADSHEET_IDS = [
  "1PC9ZYxd4O7ofuDwcN5AhPHTvW6RYO7V2LgQqrbPTQ5I", // Academy
  "1XyFhw6cTJAOE2XT7Ra8lmL0rcvq2meCT9LlGuzOF0nk", // AI BGM
  "1JA3FZf8xkpZ8GjuYiETXz9R0ivfW80-rf3PZIzQum9g", // Claude Masterclass
  "1LP37n3zb1d0UkXjddQBCKqmSU0j5-HvPSI-Rda36E3s", // Consulting
  "1RpwPPMH6nf8CsIAfITF1gNc5gBNhq7CJ0zckotAgq4I"  // Professionals
];

function getAppEnvironment() {
  const isNodeTestEnv = (typeof process !== "undefined" && Boolean(process.env) && process.env.NODE_ENV === "test");
  const envVal = String(getOptionalScriptSecret("APP_ENVIRONMENT") || getOptionalScriptSecret("ENVIRONMENT") || getOptionalScriptSecret("APP_ENV") || "").trim().toLowerCase();
  if (envVal) {
    if (["production", "staging", "local_test", "development"].includes(envVal)) {
      return envVal;
    }
    throw new Error("INVALID_ENVIRONMENT: Unknown environment '" + envVal + "'. Allowed: production, staging, local_test, development.");
  }
  if (isNodeTestEnv) {
    return "local_test";
  }
  // Deployed production fallback (prevents MISSING_ENVIRONMENT runtime failure)
  return "production";
}

function isAuthorizedLiveTest(email, amount) {
  const cleanEmail = String(email || "").trim().toLowerCase();
  const numAmount = Number(amount) || 0;
  return (cleanEmail === "ambroseselva001@gmail.com" || cleanEmail === "techtycoondigitalsolutions@gmail.com" || cleanEmail === "techtycoondigitors@gmail.com") && numAmount === 1;
}

function getRazorpayKeyId(isIntl) {
  const env = getAppEnvironment();
  const secretKey = isIntl ? "RAZORPAY_KEY_ID_INTL" : "RAZORPAY_KEY_ID";
  const fallback = isIntl ? "rzp_live_gfoS1OjC8tvWjP" : "rzp_live_T2CbVONQc6qrqj";
  const keyId = getOptionalScriptSecret(secretKey) || fallback;
  if (!keyId) {
    throw new Error("MISSING_RAZORPAY_KEY_ID: Razorpay key ID not configured for " + secretKey);
  }
  if (env === "staging" && !keyId.startsWith("rzp_test_")) {
    throw new Error("LIVE_CREDENTIALS_IN_STAGING: Live Razorpay key ID '" + keyId + "' cannot be used in staging.");
  }
  if (env === "production" && !keyId.startsWith("rzp_live_")) {
    throw new Error("TEST_CREDENTIALS_IN_PRODUCTION: Test Razorpay key ID '" + keyId + "' cannot be used in production.");
  }
  return keyId;
}

function getFunnelsDoneLocationId() {
  const env = getAppEnvironment();
  const locationId = getOptionalScriptSecret("FUNNELSDONE_LOCATION_ID") || "uUUUKRH7EP2A0oJBv4Zb";
  if (!locationId) {
    throw new Error("MISSING_FUNNELSDONE_LOCATION_ID: FunnelsDone location ID not configured.");
  }
  if (env === "staging" && locationId === "uUUUKRH7EP2A0oJBv4Zb" && !isMockInvoiceAdapterEnabled()) {
    throw new Error("PRODUCTION_LOCATION_IN_STAGING: Production FunnelsDone location ID cannot be used in staging.");
  }
  return locationId;
}

function assertSpreadsheetIsolation(ss) {
  const env = getAppEnvironment();
  if (env === "staging") {
    const id = ss && typeof ss.getId === "function" ? ss.getId() : (typeof ss === "string" ? ss : "");
    if (id && KNOWN_PRODUCTION_SPREADSHEET_IDS.includes(id)) {
      throw new Error("PRODUCTION_SPREADSHEET_IN_STAGING: Production spreadsheet ID '" + id + "' cannot be used in staging.");
    }
  }
}

function isMockInvoiceAdapterEnabled() {
  const env = getAppEnvironment();
  const mockSetting = String(getOptionalScriptSecret("ENABLE_MOCK_INVOICE_ADAPTER") || "").trim().toLowerCase();
  if (mockSetting === "true" || mockSetting === "1") return true;
  if (mockSetting === "false" || mockSetting === "0") {
    if (env === "staging") {
      throw new Error("INSECURE_STAGING_CONFIG: Mock invoice adapter cannot be explicitly disabled in staging without verified sandbox credentials.");
    }
    return false;
  }
  return env === "staging" || env === "local_test" || env === "development";
}

function isNotificationSuppressed() {
  const env = getAppEnvironment();
  const suppressSetting = String(getOptionalScriptSecret("SUPPRESS_NOTIFICATIONS") || "").trim().toLowerCase();
  if (suppressSetting === "false" || suppressSetting === "0") {
    if (env === "staging") {
      throw new Error("INSECURE_STAGING_CONFIG: Customer notification suppression cannot be disabled in staging.");
    }
    return false;
  }
  return env === "staging" || env === "local_test" || env === "development" || suppressSetting === "true" || suppressSetting === "1";
}

function validatePaymentEnvironment(paymentEntity) {
  const env = getAppEnvironment();
  if (!paymentEntity) return;

  const paymentId = String(paymentEntity.id || paymentEntity.payment_id || "").trim();
  const isTestMode = Boolean(
    paymentEntity.is_test ||
    paymentEntity.test ||
    (paymentEntity.notes && (paymentEntity.notes.mode === "test" || paymentEntity.notes.is_test === "true")) ||
    (paymentId && paymentId.startsWith("pay_test_"))
  );

  if (env === "staging") {
    if (paymentEntity.is_test === false || (paymentEntity.notes && paymentEntity.notes.mode === "live")) {
      throw new Error("LIVE_PAYMENT_IN_STAGING: Live Razorpay payment received in staging environment.");
    }
  }

  if (env === "production") {
    if (isTestMode) {
      throw new Error("TEST_PAYMENT_IN_PRODUCTION: Test payment cannot be processed in production environment.");
    }
  }
}

const DEFAULT_SPREADSHEET_ID = "1XyFhw6cTJAOE2XT7Ra8lmL0rcvq2meCT9LlGuzOF0nk";
const SPREADSHEET_ID = null;
const SHEET_NAME = "Sheet1";
const EXPECTED_PRODUCT_KEY = "ai_bgm";

function getSpreadsheetId() {
  const env = getAppEnvironment();
  const explicitId = getOptionalScriptSecret("SPREADSHEET_ID");
  if (env === "staging") {
    if (explicitId && KNOWN_PRODUCTION_SPREADSHEET_IDS.indexOf(explicitId) !== -1) {
      throw new Error("PRODUCTION_SPREADSHEET_IN_STAGING: Production spreadsheet ID '" + explicitId + "' cannot be used in staging.");
    }
    return explicitId || "";
  }
  return explicitId || DEFAULT_SPREADSHEET_ID;
}

function getScriptSecret(keyName) {
  const val = PropertiesService.getScriptProperties().getProperty(keyName);
  if (!val || !String(val).trim()) {
    throw new Error("MISSING_SCRIPT_PROPERTY: " + keyName + " must be configured in Project Settings -> Script Properties.");
  }
  return String(val).trim();
}

function getOptionalScriptSecret(keyName) {
  try {
    const props = PropertiesService.getScriptProperties();
    const val = props ? props.getProperty(keyName) : null;
    return val && String(val).trim() ? String(val).trim() : null;
  } catch (e) {
    return null;
  }
}

// ------------------------------------------------------------
// FUNNELSDONE PRIVATE INTEGRATION API v2 + GST PDF INVOICE CONFIG
// ------------------------------------------------------------
const FUNNELSDONE_CONFIG = {
  get LOCATION_ID() { return getFunnelsDoneLocationId(); },
  API_BASE: "https://services.leadconnectorhq.com",
  API_VERSION: "2021-07-28",
  COMPANY_NAME: "TECH TYCOON DIGITAL SOLUTION LLP",
  COMPANY_GSTIN: "33AAZFT9667P1ZP",
  COMPANY_SAC: "999293",
  COMPANY_LOGO: "https://assets.cdn.filesafe.space/uUUUKRH7EP2A0oJBv4Zb/media/6accab95bbad531ac8a6b1af.png",
  COMPANY_PHONE: "7558133039",
  COMPANY_WEBSITE: "https://www.techtycoon.in/",
  ADDRESS_LINE1: "No. 3/59B, 1st Floor, 3rd Street, Ragava Nagar",
  CITY: "Moovarasampet, Chennai",
  STATE: "TAMILNADU",
  POSTAL_CODE: "600091"
};

const TEST_EMAILS = ["ambroseselva001@gmail.com", "techtycoondigitalsolutions@gmail.com"];

function constantTimeEquals(a, b) {
  const strA = String(a || "");
  const strB = String(b || "");
  if (strA.length === 0 || strA.length !== strB.length) return false;
  let diff = 0;
  for (let i = 0; i < strA.length; i++) {
    diff |= strA.charCodeAt(i) ^ strB.charCodeAt(i);
  }
  return diff === 0;
}

function computeHmacSha256Hex(message, secret) {
  const rawHmac = Utilities.computeHmacSha256Signature(message, secret);
  return rawHmac.map(function(byte) {
    return ("0" + (byte & 0xff).toString(16)).slice(-2);
  }).join("");
}

function computeSha256Hex(payload) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, payload, Utilities.Charset.UTF_8);
  return bytes.map(function(b) {
    const v = (b < 0) ? 256 + b : b;
    return ("0" + v.toString(16)).slice(-2);
  }).join("");
}

function computeCanonicalPayloadDigest(paymentEntity, format) {
  if (!paymentEntity || typeof paymentEntity !== "object") return "";
  const amount = paymentEntity.amount !== undefined ? String(paymentEntity.amount).trim() : "";
  const currency = paymentEntity.currency ? String(paymentEntity.currency).trim() : "";
  const status = paymentEntity.status ? String(paymentEntity.status).trim() : "";
  const email = paymentEntity.email ? String(paymentEntity.email).trim().toLowerCase() : "";
  const contact = paymentEntity.contact ? String(paymentEntity.contact).trim() : "";

  if (format === "v1" || format === "5field" || format === "legacy") {
    return computeSha256Hex(amount + "|" + currency + "|" + status + "|" + email + "|" + contact);
  }

  // Phase 1J Hardened 8-Field Digest
  const method = paymentEntity.method ? String(paymentEntity.method).trim() : "";
  const accountId = (paymentEntity.account_id || paymentEntity.accountId || (paymentEntity.notes && paymentEntity.notes.account_id)) ? String(paymentEntity.account_id || paymentEntity.accountId || (paymentEntity.notes && paymentEntity.notes.account_id)).trim() : "";

  let canonicalNotes = "";
  if (paymentEntity.notes && typeof paymentEntity.notes === "object") {
    const keys = Object.keys(paymentEntity.notes).sort();
    canonicalNotes = keys.map(function(k) { return k + "=" + String(paymentEntity.notes[k]).trim(); }).join(",");
  }

  const canonicalString = amount + "|" + currency + "|" + status + "|" + email + "|" + contact + "|" + method + "|" + accountId + "|" + canonicalNotes;
  return computeSha256Hex(canonicalString);
}

function verifyRazorpayPaymentSignature(orderId, paymentId, providedSignature, isIntl) {
  if (!orderId || !paymentId || !providedSignature) {
    return { valid: false, reason: "Missing razorpay_order_id, razorpay_payment_id, or razorpay_signature" };
  }
  if (!/^order_[A-Za-z0-9]+$/.test(String(orderId)) || !/^pay_[A-Za-z0-9]+$/.test(String(paymentId))) {
    return { valid: false, reason: "Malformed Razorpay order_id or payment_id" };
  }
  const primarySecretKey = isIntl ? "RAZORPAY_KEY_SECRET_INTL" : "RAZORPAY_KEY_SECRET";
  const fallbackSecretKey = isIntl ? "RAZORPAY_KEY_SECRET" : "RAZORPAY_KEY_SECRET_INTL";
  const message = String(orderId).trim() + "|" + String(paymentId).trim();

  const primarySecret = getScriptSecret(primarySecretKey);
  if (constantTimeEquals(computeHmacSha256Hex(message, primarySecret), String(providedSignature).trim())) {
    return { valid: true, isInternational: Boolean(isIntl) };
  }
  try {
    const fallbackSecret = getScriptSecret(fallbackSecretKey);
    if (constantTimeEquals(computeHmacSha256Hex(message, fallbackSecret), String(providedSignature).trim())) {
      return { valid: true, isInternational: !isIntl };
    }
  } catch (ignoreFallbackErr) {}
  return { valid: false, reason: "HMAC-SHA256 signature mismatch" };
}

function verifyPaymentWithRazorpayServer(paymentId, expectedOrderId, expectedAmountInr, isIntl) {
  const keyId = getRazorpayKeyId(isIntl);
  const keySecret = getScriptSecret(isIntl ? "RAZORPAY_KEY_SECRET_INTL" : "RAZORPAY_KEY_SECRET");
  const authHeader = "Basic " + Utilities.base64Encode(keyId + ":" + keySecret);
  const res = UrlFetchApp.fetch("https://api.razorpay.com/v1/payments/" + encodeURIComponent(paymentId), {
    method: "get",
    headers: { "Authorization": authHeader, "Accept": "application/json" },
    muteHttpExceptions: true
  });
  if (res.getResponseCode() !== 200) {
    throw new Error("Razorpay payment lookup failed with HTTP " + res.getResponseCode());
  }
  const payment = JSON.parse(res.getContentText() || "{}");
  if (payment.id !== paymentId) {
    throw new Error("Payment ID mismatch from Razorpay API");
  }
  if (payment.status !== "captured") {
    throw new Error("Payment is not captured (status: " + payment.status + ")");
  }
  if (expectedOrderId && payment.order_id !== expectedOrderId) {
    throw new Error("Payment order_id (" + payment.order_id + ") does not match expected Order ID (" + expectedOrderId + ")");
  }
  if (payment.currency !== "INR") {
    throw new Error("Unexpected payment currency: " + payment.currency);
  }
  const expectedPaise = Math.round(Number(expectedAmountInr) * 100);
  if (Number(payment.amount) !== expectedPaise) {
    throw new Error("Captured amount (" + payment.amount + " paise) does not match expected order amount (" + expectedPaise + " paise)");
  }
  return payment;
}

function saveVerifiedInvoiceRecord(record) {
  if (!record || !record.paymentId) return;
  const props = PropertiesService.getScriptProperties();
  const payload = JSON.stringify({
    verified: true,
    status: "PAID",
    paymentId: record.paymentId,
    orderId: record.orderId || "",
    invoiceNumber: record.invoiceNumber || "",
    name: record.name || "Learner",
    email: record.email || "",
    phone: record.phone || "",
    course: record.course || "Advance AI-Business Generative Model (AI-BGM)",
    amount: Number(record.amount) || 6449,
    paidAt: record.paidAt || Utilities.formatDate(new Date(), "Asia/Kolkata", "dd MMM yyyy, hh:mm a")
  });
  props.setProperty("VERIFIED_INV_" + record.paymentId, payload);
  if (record.orderId) {
    props.setProperty("VERIFIED_INV_ORD_" + record.orderId, payload);
  }
}

function getVerifiedInvoiceRecord(sheet, paymentId, orderId, token, userContact) {
  const cleanPayId = String(paymentId || "").trim();
  const cleanOrdId = String(orderId || "").trim();
  if (!cleanPayId || !/^pay_[A-Za-z0-9]+$/.test(cleanPayId)) {
    return { success: false, verified: false, error: "Invalid paymentId reference." };
  }

  // Authorization Check: Verify time-limited invoice access token (<expiryTimestamp>.<hmacSignature>)
  // STRICT REQUIREMENT: Dedicated INVOICE_TOKEN_SECRET is required. Zero fallback to Razorpay secrets.
  let isAuthorized = false;
  const invSecret = getOptionalScriptSecret("INVOICE_TOKEN_SECRET");
  if (!invSecret) {
    return {
      success: false,
      verified: false,
      error: "MISSING_INVOICE_TOKEN_SECRET: Dedicated INVOICE_TOKEN_SECRET must be configured in Script Properties."
    };
  }

  if (token && typeof token === "string" && token.indexOf(".") !== -1) {
    const parts = token.split(".");
    if (parts.length === 2) {
      const exp = parseInt(parts[0], 10);
      const providedSig = parts[1];
      const now = Date.now();
      if (!isNaN(exp) && now <= exp) {
        try {
          const expectedSig = computeHmacSha256Hex(cleanPayId + "|" + cleanOrdId + "|" + exp, invSecret);
          if (constantTimeEquals(expectedSig, providedSig.trim().toLowerCase())) {
            isAuthorized = true;
          }
        } catch (e) {}
      }
    }
  }

  if (!isAuthorized) {
    return {
      success: false,
      verified: false,
      error: "UNAUTHORIZED_INVOICE_ACCESS: Valid, unexpired invoice access token required."
    };
  }

  let invRecord = null;
  const props = PropertiesService.getScriptProperties();
  const cached = props.getProperty("VERIFIED_INV_" + cleanPayId);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (!cleanOrdId || parsed.orderId === cleanOrdId) {
        invRecord = parsed;
      }
    } catch (e) {}
  }

  if (!invRecord && sheet) {
    const lastRow = sheet.getLastRow();
    if (lastRow >= 2) {
      const data = sheet.getRange(2, 1, lastRow - 1, 9).getValues();
      for (let i = data.length - 1; i >= 0; i--) {
        const rowStatus = String(data[i][6] || "").trim();
        const rowOrderId = String(data[i][7] || "").trim();
        const rowPayId = String(data[i][8] || "").trim();
        if (rowStatus === "PAID" && rowPayId === cleanPayId && (!cleanOrdId || rowOrderId === cleanOrdId)) {
          invRecord = {
            verified: false,
            status: "UNCERTAIN_INVOICE_PENDING",
            paymentId: rowPayId,
            orderId: rowOrderId,
            invoiceNumber: null,
            needsReconciliation: true,
            customerName: String(data[i][1] || "Learner"),
            customerEmail: String(data[i][2] || ""),
            customerPhone: String(data[i][3] || ""),
            courseName: "Advance AI-Business Generative Model (AI-BGM)",
            totalAmountPaid: Number(data[i][5]) || 6449,
            paidAt: String(data[i][0] || "")
          };
          break;
        }
      }
    }
  }

  if (!invRecord) {
    return { success: false, verified: false, error: "UNVERIFIED_OR_NOT_FOUND: No verified PAID transaction found for this paymentId/orderId." };
  }

  if (invRecord.needsReconciliation || !invRecord.invoiceNumber) {
    return {
      success: true,
      verified: false,
      status: "UNCERTAIN_INVOICE_PENDING",
      needsReconciliation: true,
      error: "INVOICE_RECONCILIATION_REQUIRED: Payment record exists but authoritative invoice number is pending reconciliation.",
      invoice: invRecord
    };
  }

  return { success: true, verified: true, invoice: invRecord };
}

/**
 * Safely retrieve target sheet object
 */
function getTargetSheet() {
  let ss = null;
  try {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  } catch (e) {
    Logger.log("getActiveSpreadsheet notice: " + e.toString());
  }

  const targetId = getSpreadsheetId();
  if (!ss && targetId) {
    try {
      ss = SpreadsheetApp.openById(targetId);
    } catch (e) {
      Logger.log("openById notice: " + e.toString());
      throw new Error("Cannot open Spreadsheet ID " + targetId + ".");
    }
  }

  if (!ss) {
    throw new Error("Spreadsheet container not found.");
  }

  assertSpreadsheetIsolation(ss);

  return ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
}

function sanitizeCell(val) {
  if (val === null || val === undefined) return "";
  const str = String(val).replace(/[\u0000-\u001F\u007F]/g, "").trim();
  if (/^[=+\-@\t\r]/.test(str)) return "'" + str;
  return str;
}

/**
 * Handles HTTP GET requests (Health check, verified invoice lookup, or registration)
 */
function doGet(e) {
  try {
    const params = (e && e.parameter) ? e.parameter : {};

    if (params.action === "getVerifiedInvoice") {
      const sheet = getTargetSheet();
      const res = getVerifiedInvoiceRecord(sheet, params.paymentId, params.orderId, params.token, params.email || params.phone || params.contact);
      return ContentService.createTextOutput(JSON.stringify(res)).setMimeType(ContentService.MimeType.JSON);
    }

    if (params.name && params.phone) {
      const sheet = getTargetSheet();
      return createOrderAndLogRow(sheet, params);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "online",
      course: "Advance AI-Business Generative Model (AI-BGM)",
      spreadsheetId: SPREADSHEET_ID,
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handles HTTP POST requests:
 * 1. Initial Registration & Razorpay Order Creation (Col G: INITIATED)
 * 2. Verified Payment Confirmation, Sheet Update & Payment Acknowledgement Dispatch (Col G: PAID, Col I: Payment ID)
 */
function doPost(e) {
  try {
    let contents = {};
    if (e && e.postData && e.postData.contents) {
      try {
        contents = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        contents = e.parameter || {};
      }
    } else {
      contents = (e && e.parameter) ? e.parameter : {};
    }

    const sheet = getTargetSheet();

    if (contents.action === "getVerifiedInvoice") {
      const res = getVerifiedInvoiceRecord(sheet, contents.paymentId, contents.orderId, contents.token, contents.email || contents.phone || contents.contact);
      return ContentService.createTextOutput(JSON.stringify(res)).setMimeType(ContentService.MimeType.JSON);
    }

    // Razorpay Server Webhook Fallback — verified via proxy signature + Razorpay API
    if (contents.event === "payment.captured" || contents.event === "order.paid") {
      const paymentEntity = contents.payload && contents.payload.payment && contents.payload.payment.entity;
      if (!paymentEntity || !paymentEntity.id || !paymentEntity.order_id) {
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          error: "Invalid webhook payload: missing payment.entity.id or order_id"
        })).setMimeType(ContentService.MimeType.JSON);
      }
      return handleWebhookPaymentSuccess(
        sheet,
        paymentEntity.order_id,
        paymentEntity.id,
        paymentEntity.email,
        contents.proxy_signature,
        contents.timestamp,
        contents.eventId || contents.event_id,
        contents.target_product,
        contents.payload_digest,
        paymentEntity,
        contents.proxy_version,
        contents.event
      );
    }

    // CASE 1: Payment Success Callback from Razorpay checkout
    if (contents.paymentSuccess || contents.razorpay_payment_id) {
      return handlePaymentSuccess(sheet, contents);
    }

    // CASE 2: New Registration -> Append Row & Create Order ID
    return createOrderAndLogRow(sheet, contents);

  } catch (error) {
    Logger.log("doPost Error: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Appends row into Sheet1:
 * [Date and Time, Name, Email, Phone, Profession, Amount, Status, Order ID, Payment ID]
 */
function createOrderAndLogRow(sheet, data) {
  const name = sanitizeCell(data.name || "Anonymous");
  const email = sanitizeCell(data.email || "");
  const phone = sanitizeCell(data.phone || "");
  const profession = sanitizeCell(data.profession || "Business Owner / Professional");
  const emailLower = email.toLowerCase().trim();
  const rawAmt = parseInt(data.amount) || 6449;
  const amount = (TEST_EMAILS.indexOf(emailLower) !== -1 && rawAmt === 1) ? 1 : (rawAmt < 3500 ? 6449 : rawAmt);
  const isIntl = data.isInternational || false;
  const dateTimeStr = Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyy-MM-dd HH:mm:ss");

  const keyId = getRazorpayKeyId(isIntl);
  const keySecret = getScriptSecret(isIntl ? "RAZORPAY_KEY_SECRET_INTL" : "RAZORPAY_KEY_SECRET");
  const amountInPaise = amount * 100;
  const orderUrl = "https://api.razorpay.com/v1/orders";
  const authHeader = "Basic " + Utilities.base64Encode(keyId + ":" + keySecret);

  const payload = {
    amount: amountInPaise,
    currency: "INR",
    receipt: "rcpt_bgm_" + new Date().getTime(),
    notes: {
      product_key: "ai_bgm",
      name: name,
      email: email,
      phone: phone,
      profession: profession,
      course: "Advance AI-Business Generative Model",
      coupon: data.coupon || data.promoCode || "",
      base_amount: data.baseAmount || 5465.25,
      gst_amount: data.gstAmount || 983.75
    }
  };

  const response = UrlFetchApp.fetch(orderUrl, {
    method: "post",
    headers: {
      "Authorization": authHeader,
      "Content-Type": "application/json"
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  const orderRes = JSON.parse(response.getContentText() || "{}");
  if (!orderRes || !orderRes.id) {
    throw new Error("Failed to create Razorpay order: " + response.getContentText());
  }
  const orderId = orderRes.id;

  // Exact Google Sheet Columns matching Row 1:
  // A: Date and Time | B: Name | C: Email | D: Phone | E: Profession | F: Amount | G: Status | H: Order ID | I: Payment ID
  sheet.appendRow([
    dateTimeStr,       // Col A: Date and Time
    name,              // Col B: Name
    email,             // Col C: Email
    phone,             // Col D: Phone
    profession,        // Col E: Profession
    amount,            // Col F: Amount
    "INITIATED",       // Col G: Status
    orderId,           // Col H: Order ID
    ""                 // Col I: Payment ID (filled upon verified payment)
  ]);

  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    orderId: orderId,
    amount: amount
  })).setMimeType(ContentService.MimeType.JSON);
}

// ------------------------------------------------------------
// DUAL GST INVOICE: OUR PDF BLOB + FUNNELSDONE API v2 SYNC
// ------------------------------------------------------------
const TOTAL_TO_EXACT_BASE_MAP = {
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
  6449: 5465.25,
  8259: 6999,
  8449: 7160.17,
  11799: 9999,
  17699: 14999
};

function getInvoiceAccountingBreakdown(totalAmount) {
  const total = Math.max(1, Math.round(Number(totalAmount) || 117));
  if (total === 1) {
    return { isTest: true, baseAmt: 1, cgst: 0, sgst: 0, totalGst: 0, roundOff: 0, total: 1 };
  }
  const baseAmt = TOTAL_TO_EXACT_BASE_MAP[total] !== undefined
    ? TOTAL_TO_EXACT_BASE_MAP[total]
    : Math.round((total / 1.18) * 100) / 100;
  const cgst = Math.round(baseAmt * 0.09 * 100) / 100;
  const sgst = Math.round(baseAmt * 0.09 * 100) / 100;
  const totalGst = Math.round((cgst + sgst) * 100) / 100;
  const roundOff = Math.round((total - (baseAmt + totalGst)) * 100) / 100;
  return { isTest: false, baseAmt: baseAmt, cgst: cgst, sgst: sgst, totalGst: totalGst, roundOff: roundOff, total: total };
}

function numberToIndianRupeesWords(amount) {
  const num = Math.round(Math.max(0, Number(amount) || 0));
  if (num === 0) return "Indian Rupees Zero Only";
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  function twoDigit(n) {
    if (n < 20) return ones[n];
    return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
  }
  function threeDigit(n) {
    const h = Math.floor(n / 100);
    const rem = n % 100;
    let res = h > 0 ? ones[h] + " Hundred" : "";
    if (rem > 0) res += (res ? " and " : "") + twoDigit(rem);
    return res;
  }
  let rem = num;
  const parts = [];
  const crore = Math.floor(rem / 10000000); rem %= 10000000;
  if (crore > 0) parts.push(threeDigit(crore) + " Crore");
  const lakh = Math.floor(rem / 100000); rem %= 100000;
  if (lakh > 0) parts.push(twoDigit(lakh) + " Lakh");
  const thousand = Math.floor(rem / 1000); rem %= 1000;
  if (thousand > 0) parts.push(twoDigit(thousand) + " Thousand");
  if (rem > 0) parts.push(threeDigit(rem));
  return "Indian Rupees " + parts.join(" ") + " Only";
}

function appendToGstSalesRegister(invNumber, dateStr, customerName, customerEmail, customerPhone, courseName, acct, paymentId, orderId) {
  try {
    if (acct && acct.isTest) {
      Logger.log("GST_SALES_REGISTER_SKIP: Test transaction for " + customerEmail + " skipped from GST Sales Register.");
      return;
    }
    let ss = null;
    try { ss = SpreadsheetApp.getActiveSpreadsheet(); } catch (e) {}
    const targetId = getSpreadsheetId();
    if (!ss && targetId) {
      try { ss = SpreadsheetApp.openById(targetId); } catch (e) {}
    }
    if (!ss) return;
    assertSpreadsheetIsolation(ss);
    let gstSheet = ss.getSheetByName("GST_Sales_Register");
    if (!gstSheet) {
      gstSheet = ss.insertSheet("GST_Sales_Register");
      const headers = [
        "Invoice Date", "Invoice Number", "Customer Name", "Customer Email", "Customer Phone",
        "Place of Supply", "Supply Type", "Reverse Charge (RCM)", "SAC Code", "Description of Service",
        "Taxable Base Value (INR)", "CGST Rate (%)", "CGST Amount (INR)", "SGST Rate (%)", "SGST Amount (INR)",
        "Round Off (INR)", "Total Invoice Value (INR)", "Razorpay Payment ID", "Razorpay Order ID"
      ];
      gstSheet.appendRow(headers);
      gstSheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#e0e7ff");
      gstSheet.setFrozenRows(1);
    }

    // Deduplication: Verify invoice number and payment ID are not already recorded
    const existingRows = gstSheet.getDataRange().getValues();
    const cleanPayId = String(paymentId || "").replace(/^'/, "").trim();
    const cleanInvNo = String(invNumber || "").trim();
    for (let r = 1; r < existingRows.length; r++) {
      const rowInvNo = String(existingRows[r][1] || "").trim();
      const rowPayId = String(existingRows[r][17] || "").replace(/^'/, "").trim();
      if ((cleanPayId && rowPayId === cleanPayId) || (cleanInvNo && rowInvNo === cleanInvNo)) {
        return; // Already recorded, do not duplicate row in sales register
      }
    }

    gstSheet.appendRow([
      dateStr,
      invNumber,
      sanitizeCell(customerName || "Learner"),
      sanitizeCell(customerEmail || ""),
      "'" + String(customerPhone || "").replace(/[^\d+\-\s]/g, ""),
      "33-Tamil Nadu",
      "B2C Intra-State",
      "No",
      FUNNELSDONE_CONFIG.COMPANY_SAC,
      sanitizeCell(courseName || "AI Training Program"),
      acct.baseAmt,
      acct.isTest ? 0 : 9,
      acct.cgst,
      acct.isTest ? 0 : 9,
      acct.sgst,
      acct.roundOff,
      acct.total,
      sanitizeCell(paymentId || "PAID"),
      sanitizeCell(orderId || "")
    ]);
  } catch (regErr) {}
}

function generateOurGstInvoicePdfBlob(customerName, customerEmail, customerPhone, courseName, totalAmount, paymentId, orderId, invoiceNo) {
  const acct = getInvoiceAccountingBreakdown(totalAmount);
  const baseAmt = acct.baseAmt;
  const cgst = acct.cgst;
  const sgst = acct.sgst;
  const total = acct.total;
  const amountInWords = numberToIndianRupeesWords(total);
  const roundOffSign = acct.roundOff >= 0 ? "+" : "-";
  const roundOffAbs = Math.abs(acct.roundOff).toFixed(2);
  if (!invoiceNo || typeof invoiceNo !== "string" || !invoiceNo.trim()) {
    if (typeof writeToLogs === "function") {
      writeToLogs("INVOICE_PDF_FAILED", "Cannot generate Tax Invoice PDF without authoritative invoice number for " + paymentId);
    }
    throw new Error("INVOICE_NUMBER_ALLOCATION_FAILED: Missing authoritative invoice number for PDF generation.");
  }
  const invNumber = String(invoiceNo).trim();
  const dateStr = Utilities.formatDate(new Date(), "Asia/Kolkata", "dd MMM yyyy");

  // Automatically record in GST_Sales_Register sheet tab for monthly GSTR-1 & GSTR-3B filing
  appendToGstSalesRegister(invNumber, dateStr, customerName, customerEmail, customerPhone, courseName, acct, paymentId, orderId);

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    body { font-family: Arial, Helvetica, sans-serif; color: #0f172a; margin: 18px; font-size: 11.5px; }
    .box { border: 1px solid #cbd5e1; border-radius: 10px; padding: 22px; }
    .header { border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; width: 100%; }
    .badge { background: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; font-weight: bold; padding: 3px 8px; border-radius: 4px; font-family: monospace; font-size: 10.5px; }
    .pan { background: #f8fafc; border: 1px solid #cbd5e1; color: #334155; font-weight: bold; padding: 3px 8px; border-radius: 4px; font-family: monospace; font-size: 10.5px; margin-left: 6px; }
    .paid { background: #dcfce7; color: #15803d; font-weight: bold; padding: 4px 10px; border-radius: 12px; font-size: 10.5px; }
    table.items { width: 100%; border-collapse: collapse; margin: 14px 0; }
    table.items th { background: #0f172a; color: #ffffff; padding: 8px; text-align: left; font-size: 10px; text-transform: uppercase; }
    table.items td { padding: 9px 8px; border-bottom: 1px solid #e2e8f0; }
    .right { text-align: right; font-family: monospace; }
  </style></head><body><div class="box">
    <table class="header"><tr>
      <td>
        <h2 style="margin:0 0 4px 0;font-size:15px;">${FUNNELSDONE_CONFIG.COMPANY_NAME}</h2>
        <div style="color:#475569;line-height:1.4;">No. 3/59B, 1st Floor, 3rd Street, Ragava Nagar, Moovarasampet, Chennai-600091<br/>State: Tamil Nadu (Code: 33) | Mobile: +91 ${FUNNELSDONE_CONFIG.COMPANY_PHONE} | Web: ${FUNNELSDONE_CONFIG.COMPANY_WEBSITE}</div>
        <div style="margin-top:6px;">
          <span class="badge">GSTIN: ${FUNNELSDONE_CONFIG.COMPANY_GSTIN}</span>
          <span class="pan">PAN: AAZFT9667P</span>
          <span class="pan">SAC: ${FUNNELSDONE_CONFIG.COMPANY_SAC}</span>
        </div>
      </td>
      <td style="text-align:right;vertical-align:top;">
        <h1 style="margin:0;font-size:19px;">TAX INVOICE</h1>
        <div style="color:#64748b;font-size:9.5px;margin-bottom:6px;">ORIGINAL FOR RECIPIENT (RULE 46 CGST RULES)</div>
        <span class="paid">PAID</span>
      </td>
    </tr></table>
    <table style="width:100%;margin-bottom:14px;"><tr>
      <td style="width:50%;vertical-align:top;background:#f8fafc;padding:10px;border-radius:6px;border:1px solid #e2e8f0;">
        <strong style="color:#64748b;font-size:9.5px;text-transform:uppercase;">Billed To (Recipient Details)</strong><br/>
        <strong>${sanitizeCell(customerName || "Learner")}</strong><br/>
        Email: ${sanitizeCell(customerEmail || "")}<br/>
        Phone: ${sanitizeCell(customerPhone || "")}<br/>
        <strong>Place of Supply:</strong> Tamil Nadu (State Code: 33)<br/>
        <strong>Supply Type:</strong> Intra-State Supply (B2C)
      </td>
      <td style="width:50%;vertical-align:top;background:#f8fafc;padding:10px;border-radius:6px;border:1px solid #e2e8f0;">
        <strong style="color:#64748b;font-size:9.5px;text-transform:uppercase;">Invoice & Statutory Details</strong><br/>
        <strong>Invoice No:</strong> ${invNumber}<br/>
        <strong>Invoice Date:</strong> ${dateStr}<br/>
        <strong>Payment ID:</strong> ${sanitizeCell(paymentId || "PAID")}<br/>
        <strong>Order Ref:</strong> ${sanitizeCell(orderId || "")}<br/>
        <strong>Reverse Charge (RCM):</strong> No | <strong>Mode:</strong> Razorpay
      </td>
    </tr></table>
    <table class="items">
      <thead><tr><th>#</th><th>Description of Service</th><th>SAC</th><th class="right">Taxable Value</th><th class="right">CGST (9%)</th><th class="right">SGST (9%)</th><th class="right">Total (INR)</th></tr></thead>
      <tbody><tr>
        <td>1</td>
        <td><strong>${sanitizeCell(courseName || "AI Training Program")}</strong><br/><span style="color:#64748b;font-size:9.5px;">Commercial Training & Coaching Services</span></td>
        <td>${FUNNELSDONE_CONFIG.COMPANY_SAC}</td>
        <td class="right">Rs. ${baseAmt.toFixed(2)}</td>
        <td class="right">Rs. ${cgst.toFixed(2)}</td>
        <td class="right">Rs. ${sgst.toFixed(2)}</td>
        <td class="right">Rs. ${(baseAmt + acct.totalGst).toFixed(2)}</td>
      </tr></tbody>
    </table>
    <table style="width:100%;border-collapse:collapse;"><tr>
      <td style="width:52%;vertical-align:top;padding-right:14px;">
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:10px;">
          <div style="font-size:9.5px;color:#64748b;text-transform:uppercase;font-weight:bold;">Total Invoice Amount in Words</div>
          <div style="font-weight:bold;color:#0f172a;margin-top:3px;">${amountInWords}</div>
          <div style="margin-top:6px;font-size:9.5px;color:#64748b;">
            • Tax is not payable on Reverse Charge basis (RCM: No).<br/>
            • Rounded off to nearest Rupee u/s 170 of the CGST Act, 2017.
          </div>
        </div>
      </td>
      <td style="width:48%;vertical-align:top;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:4px 0;border-bottom:1px solid #e2e8f0;">Taxable Base Amount:</td><td class="right" style="padding:4px 0;border-bottom:1px solid #e2e8f0;">Rs. ${baseAmt.toFixed(2)}</td></tr>
          <tr><td style="padding:4px 0;border-bottom:1px solid #e2e8f0;">Add: CGST (9%):</td><td class="right" style="padding:4px 0;border-bottom:1px solid #e2e8f0;">+ Rs. ${cgst.toFixed(2)}</td></tr>
          <tr><td style="padding:4px 0;border-bottom:1px solid #e2e8f0;">Add: SGST (9%):</td><td class="right" style="padding:4px 0;border-bottom:1px solid #e2e8f0;">+ Rs. ${sgst.toFixed(2)}</td></tr>
          ${acct.roundOff !== 0 ? `<tr><td style="padding:4px 0;border-bottom:1px solid #e2e8f0;">Round Off (Sec 170 CGST Act):</td><td class="right" style="padding:4px 0;border-bottom:1px solid #e2e8f0;">${roundOffSign} Rs. ${roundOffAbs}</td></tr>` : ""}
          <tr><td style="padding:7px 0;font-weight:bold;font-size:12.5px;">Total Invoice Value (INR):</td><td class="right" style="padding:7px 0;font-weight:bold;font-size:12.5px;">Rs. ${total.toFixed(2)}</td></tr>
        </table>
      </td>
    </tr></table>
    <table style="width:100%;margin-top:16px;padding-top:10px;border-top:1px dashed #cbd5e1;font-size:9.5px;color:#64748b;"><tr>
      <td>Certified that the particulars given above are true and correct.<br/>This is a computer-generated GST Tax Invoice and requires no physical signature.</td>
      <td style="text-align:right;">For <strong>${FUNNELSDONE_CONFIG.COMPANY_NAME}</strong><br/><br/><strong style="color:#0f172a;">Authorised Signatory</strong></td>
    </tr></table>
  </div></body></html>`;

  const cleanFileNo = invNumber.replace(/[^A-Za-z0-9_-]/g, "_");
  return Utilities.newBlob(html, "text/html", "Invoice.html").getAs("application/pdf").setName("GST_Tax_Invoice_" + cleanFileNo + ".pdf");
}

function syncInvoiceWithFunnelsDone(customerName, customerEmail, customerPhone, courseName, totalAmount, paymentId, orderId) {
  const cleanPayId = String(paymentId || "").trim();
  const props = PropertiesService.getScriptProperties();

  // Staging / Test Isolation Gate: Mock invoice adapter
  if (isMockInvoiceAdapterEnabled()) {
    Logger.log("MOCK_INVOICE_ADAPTER: Mock invoice mode active for environment: " + getAppEnvironment());
    const mockInvNo = "STAGE-INV-" + String(cleanPayId).replace(/[^A-Za-z0-9]/g, "").slice(-6).toUpperCase();
    saveVerifiedInvoiceRecord(cleanPayId, orderId, mockInvNo, customerName, customerEmail, customerPhone, courseName, totalAmount);
    return mockInvNo;
  }

  // Authorized live ₹1 test payment isolation:
  if (isAuthorizedLiveTest(customerEmail, totalAmount)) {
    const mockInvNo = "TEST-TT/26-27/" + String(cleanPayId).replace(/[^A-Za-z0-9]/g, "").slice(-4).toUpperCase();
    Logger.log("AUTHORIZED_TEST_PAYMENT: Live test payment processed with test invoice: " + mockInvNo);
    saveVerifiedInvoiceRecord(cleanPayId, orderId, mockInvNo, customerName, customerEmail, customerPhone, courseName, totalAmount);
    if (props && cleanPayId) {
      props.setProperty("INVOICE_STATE_" + cleanPayId, "RESOLVED");
      props.setProperty("VERIFIED_INV_" + cleanPayId, mockInvNo);
    }
    return mockInvNo;
  }

  // 0. Pre-check: If invoice request was already initiated and timed out / pending, avoid creating duplicate
  if (props && cleanPayId) {
    const invoiceState = props.getProperty("INVOICE_STATE_" + cleanPayId);
    if (invoiceState === "UNCERTAIN_INVOICE_PENDING" || invoiceState === "INVOICE_REQUEST_PENDING") {
      Logger.log("INVOICE_RECOVERY: Detected previous uncertain invoice state for payment " + cleanPayId + ". Attempting idempotent lookup.");
      const cachedInv = props.getProperty("VERIFIED_INV_" + cleanPayId);
      if (cachedInv) {
        try {
          const parsed = JSON.parse(cachedInv);
          if (parsed && parsed.invoiceNumber) return parsed.invoiceNumber;
        } catch (e) {}
      }
    }
  }

  try {
    const headers = {
      "Authorization": "Bearer " + getScriptSecret("FUNNELSDONE_PIT_TOKEN"),
      "Version": FUNNELSDONE_CONFIG.API_VERSION,
      "Content-Type": "application/json",
      "Accept": "application/json"
    };

    let cleanPhone = String(customerPhone || "").replace(/\D/g, "");
    if (cleanPhone.length === 10) cleanPhone = "+91" + cleanPhone;
    else if (cleanPhone.length > 10 && !cleanPhone.startsWith("+")) cleanPhone = "+" + cleanPhone;

    // 1. Upsert Contact in FunnelsDone
    const contactPayload = {
      locationId: FUNNELSDONE_CONFIG.LOCATION_ID,
      name: customerName || "Learner",
      email: customerEmail || "",
      phone: cleanPhone,
      tags: ["ai_bgm_paid", "gst_invoice_issued"]
    };
    const contactRes = UrlFetchApp.fetch(FUNNELSDONE_CONFIG.API_BASE + "/contacts/upsert", {
      method: "post",
      headers: headers,
      payload: JSON.stringify(contactPayload),
      muteHttpExceptions: true
    });
    const contactJson = JSON.parse(contactRes.getContentText() || "{}");
    const contactId = contactJson.contact && contactJson.contact.id ? contactJson.contact.id : null;
    if (!contactId) {
      Logger.log("FUNNELSDONE_CONTACT_ERR: " + contactRes.getContentText());
      return null;
    }

    // 1b. Check if an invoice for this contact and paymentId already exists on FunnelsDone
    const currentInvState = props && cleanPayId ? props.getProperty("INVOICE_STATE_" + cleanPayId) : "";
    if (props && cleanPayId && (currentInvState === "UNCERTAIN_INVOICE_PENDING" || currentInvState === "INVOICE_REQUEST_PENDING")) {
      try {
        const queryRes = UrlFetchApp.fetch(
          FUNNELSDONE_CONFIG.API_BASE + "/invoices/?altId=" + FUNNELSDONE_CONFIG.LOCATION_ID + "&altType=location&contactId=" + encodeURIComponent(contactId),
          { method: "get", headers: headers, muteHttpExceptions: true }
        );
        if (queryRes.getResponseCode() === 200) {
          const listJson = JSON.parse(queryRes.getContentText() || "{}");
          const invoices = listJson.invoices || [];
          const candidateMatches = [];

          for (let k = 0; k < invoices.length; k++) {
            const inv = invoices[k];
            if (!inv || typeof inv !== "object") continue;

            // 1. Authoritative Reference Check: Invoice ID and Invoice Number
            const invId = String(inv._id || inv.id || "").trim();
            const invNum = String(inv.invoiceNumber || "").trim();
            if (!invId || !invNum) {
              Logger.log("INVOICE_VALIDATION_SKIP: Candidate invoice missing authoritative ID or invoiceNumber: " + JSON.stringify(inv));
              continue;
            }

            // 2. Customer Identity Check: contactId must match if present
            const invContactId = String(inv.contactId || (inv.contact && inv.contact._id) || "").trim();
            if (invContactId && invContactId !== String(contactId).trim()) {
              Logger.log("INVOICE_VALIDATION_SKIP: Contact ID mismatch on invoice " + invId + ": received '" + invContactId + "', expected '" + contactId + "'");
              continue;
            }

            // 3. Stable Razorpay Payment Reference Check
            const invDump = JSON.stringify(inv);
            const payRefRegex = new RegExp("(?:Payment ID:\\s*|Ref:\\s*|paymentId[\"':\\s]+|\\b)" + cleanPayId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b");
            if (!payRefRegex.test(invDump)) {
              continue;
            }

            // 4. Expected Product / Course Name Check
            const invProductName = String(inv.name || inv.title || (inv.items && inv.items[0] && inv.items[0].name) || "").toLowerCase();
            if (!invProductName.includes("bgm") && !invProductName.includes("growth")) {
              Logger.log("INVOICE_VALIDATION_SKIP: Course mismatch on invoice " + invId + " for ai_bgm: " + invProductName);
              continue;
            }

            // 5. Amount and Currency Check
            if (inv.currency && String(inv.currency).trim().toUpperCase() !== "INR") {
              Logger.log("INVOICE_VALIDATION_SKIP: Currency mismatch on invoice " + invId + ": " + inv.currency + " expected INR");
              continue;
            }
            const invAmount = inv.total !== undefined ? Number(inv.total) : (inv.amount !== undefined ? Number(inv.amount) : null);
            if (invAmount !== null && !isNaN(invAmount) && totalAmount) {
              const expectedAmt = Number(totalAmount);
              if (Math.abs(invAmount - expectedAmt) > 1.0) {
                Logger.log("INVOICE_VALIDATION_SKIP: Amount mismatch on invoice " + invId + ": " + invAmount + " expected " + expectedAmt);
                continue;
              }
            }

            // 6. Status check: Void or cancelled invoices cannot be recovered
            const invStatus = String(inv.status || "").toLowerCase();
            if (invStatus === "void" || invStatus === "cancelled" || invStatus === "deleted") {
              Logger.log("INVOICE_VALIDATION_SKIP: Invoice " + invId + " has void/cancelled status: " + invStatus);
              continue;
            }

            candidateMatches.push(inv);
          }

          if (candidateMatches.length === 1) {
            const singleInv = candidateMatches[0];
            const matchedNo = singleInv.invoiceNumberPrefix ? (singleInv.invoiceNumberPrefix + singleInv.invoiceNumber) : ("TT/26-27/" + singleInv.invoiceNumber);
            Logger.log("INVOICE_RECOVERED: Found existing invoice " + matchedNo + " for payment " + cleanPayId);
            props.setProperty("INVOICE_STATE_" + cleanPayId, "RESOLVED");
            props.setProperty("VERIFIED_INV_" + cleanPayId, matchedNo);
            return matchedNo;
          } else if (candidateMatches.length > 1) {
            Logger.log("AMBIGUOUS_INVOICE_MATCH: Found " + candidateMatches.length + " matching invoices for payment " + cleanPayId + ". Retaining UNCERTAIN_INVOICE_PENDING state.");
            props.setProperty("INVOICE_STATE_" + cleanPayId, "UNCERTAIN_INVOICE_PENDING");
            return null;
          } else {
            Logger.log("ZERO_INVOICE_MATCH: No invoice found on FunnelsDone for uncertain payment " + cleanPayId + ". Retaining UNCERTAIN_INVOICE_PENDING state.");
            props.setProperty("INVOICE_STATE_" + cleanPayId, "UNCERTAIN_INVOICE_PENDING");
            return null;
          }
        } else {
          Logger.log("INVOICE_LOOKUP_FAILED: FunnelsDone lookup HTTP " + queryRes.getResponseCode() + ". Retaining uncertain state.");
          props.setProperty("INVOICE_STATE_" + cleanPayId, "UNCERTAIN_INVOICE_PENDING");
          return null;
        }
      } catch (qErr) {
        Logger.log("INVOICE_LOOKUP_WARN: Failed to query existing FunnelsDone invoices: " + qErr.message);
        props.setProperty("INVOICE_STATE_" + cleanPayId, "UNCERTAIN_INVOICE_PENDING");
        return null;
      }
    }

    // 2. Get Next Invoice Number from FunnelsDone
    const numRes = UrlFetchApp.fetch(
      FUNNELSDONE_CONFIG.API_BASE + "/invoices/generate-invoice-number?altId=" + FUNNELSDONE_CONFIG.LOCATION_ID + "&altType=location",
      { method: "get", headers: headers, muteHttpExceptions: true }
    );
    const numJson = JSON.parse(numRes.getContentText() || "{}");
    const rawInvNum = numJson ? (numJson.invoiceNumber || (numJson.invoice && numJson.invoice.invoiceNumber)) : null;
    if (!rawInvNum || (typeof rawInvNum !== "string" && typeof rawInvNum !== "number") || !String(rawInvNum).trim()) {
      writeToLogs("INVOICE_NUM_ALLOC_FAILED", "Authoritative invoice number allocation failed from FunnelsDone for " + cleanPayId + ". Response: " + numRes.getContentText());
      throw new Error("INVOICE_NUMBER_ALLOCATION_FAILED: FunnelsDone returned missing or malformed sequence number.");
    }
    const nextInvoiceNumber = String(rawInvNum).trim();

    // 3. Create Draft Invoice in FunnelsDone with 9% CGST + 9% SGST
    const acct = getInvoiceAccountingBreakdown(totalAmount);
    const total = acct.total;
    const isTest = acct.isTest;
    const baseAmt = acct.baseAmt;
    const todayStr = Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyy-MM-dd");

    const createPayload = {
      altId: FUNNELSDONE_CONFIG.LOCATION_ID,
      altType: "location",
      name: courseName || "Advance AI-Business Generative Model (AI-BGM)",
      title: "TAX INVOICE",
      currency: "INR",
      invoiceNumber: nextInvoiceNumber,
      invoiceNumberPrefix: "TT/26-27/",
      issueDate: todayStr,
      dueDate: todayStr,
      liveMode: true,
      businessDetails: {
        name: FUNNELSDONE_CONFIG.COMPANY_NAME,
        logoUrl: FUNNELSDONE_CONFIG.COMPANY_LOGO,
        phoneNo: FUNNELSDONE_CONFIG.COMPANY_PHONE,
        website: FUNNELSDONE_CONFIG.COMPANY_WEBSITE,
        address: {
          addressLine1: FUNNELSDONE_CONFIG.ADDRESS_LINE1,
          city: FUNNELSDONE_CONFIG.CITY,
          state: FUNNELSDONE_CONFIG.STATE,
          countryCode: "IN",
          postalCode: FUNNELSDONE_CONFIG.POSTAL_CODE
        },
        customValues: ["GSTIN: " + FUNNELSDONE_CONFIG.COMPANY_GSTIN]
      },
      contactDetails: {
        id: contactId,
        name: customerName || "Learner",
        email: customerEmail || "",
        phoneNo: cleanPhone,
        address: { countryCode: "IN", state: "TAMILNADU" }
      },
      items: [
        {
          name: courseName || "Advance AI-Business Generative Model (AI-BGM)",
          description: "SAC: " + FUNNELSDONE_CONFIG.COMPANY_SAC + " | Razorpay Payment ID: " + (paymentId || ""),
          currency: "INR",
          amount: baseAmt,
          qty: 1,
          taxes: isTest ? [] : [
            { _id: "6ace04c180d27cc259dfb0bf", name: "CGST", rate: 9, calculation: "exclusive", description: "Central GST (9%)" },
            { _id: "6ace04e8460064d4e48c5d10", name: "SGST", rate: 9, calculation: "exclusive", description: "State GST - Tamil Nadu (9%)" }
          ]
        }
      ],
      discount: { type: "percentage", value: 0 },
      sentTo: {
        email: customerEmail ? [customerEmail] : [],
        phoneNo: cleanPhone ? [cleanPhone] : []
      }
    };

    // Mark pending request state before calling external creation endpoint
    if (props && cleanPayId) {
      props.setProperty("INVOICE_STATE_" + cleanPayId, "INVOICE_REQUEST_PENDING");
    }

    const invRes = UrlFetchApp.fetch(FUNNELSDONE_CONFIG.API_BASE + "/invoices/", {
      method: "post",
      headers: headers,
      payload: JSON.stringify(createPayload),
      muteHttpExceptions: true
    });
    const invJson = JSON.parse(invRes.getContentText() || "{}");
    const invoiceId = invJson._id || (invJson.invoice && invJson.invoice._id);
    if (!invoiceId) {
      Logger.log("FUNNELSDONE_INV_ERR: " + invRes.getContentText());
      if (props && cleanPayId) {
        props.setProperty("INVOICE_STATE_" + cleanPayId, "UNCERTAIN_INVOICE_PENDING");
      }
      return null;
    }

    // 4. Record Payment on FunnelsDone Invoice so it is immediately marked PAID
    const recordPayload = {
      altId: FUNNELSDONE_CONFIG.LOCATION_ID,
      altType: "location",
      mode: "other",
      amount: invJson.total || total,
      notes: "Paid via Razorpay | Payment ID: " + (paymentId || "") + " | Order ID: " + (orderId || ""),
      fulfilledAt: new Date().toISOString()
    };
    const payRes = UrlFetchApp.fetch(FUNNELSDONE_CONFIG.API_BASE + "/invoices/" + invoiceId + "/record-payment", {
      method: "post",
      headers: headers,
      payload: JSON.stringify(recordPayload),
      muteHttpExceptions: true
    });
    Logger.log("FUNNELSDONE_INVOICE_PAID: Invoice TT/26-27/" + nextInvoiceNumber + " (" + invoiceId + ") recorded: " + payRes.getResponseCode());
    if (props && cleanPayId) {
      props.setProperty("INVOICE_STATE_" + cleanPayId, "RESOLVED");
    }
    return "TT/26-27/" + nextInvoiceNumber;
  } catch (err) {
    Logger.log("FUNNELSDONE_SYNC_ERROR: " + err.message);
    if (props && cleanPayId) {
      props.setProperty("INVOICE_STATE_" + cleanPayId, "UNCERTAIN_INVOICE_PENDING");
    }
    return null;
  }
}

/**
 * Updates row when payment completes:
 * Changes Col G (Status) to "PAID", sets Col I (Payment ID),
 * and dispatches the Official Payment Acknowledgement Receipt Email + Dual GST Invoices.
 */
function processVerifiedBgmPayment(sheet, orderId, paymentId, isIntl, clientSuppliedAmount, extraData) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const cleanOrderId = String(orderId || "").trim();
    const cleanPaymentId = String(paymentId || "").trim();
    assertSpreadsheetIsolation(sheet && sheet.getParent ? sheet.getParent() : sheet);
    validatePaymentEnvironment({ id: cleanPaymentId, notes: (extraData && extraData.notes) || {} });
    const props = PropertiesService.getScriptProperties();

    if (props && props.getProperty("PROCESSED_PAY_" + cleanPaymentId)) {
      const existingInv = props.getProperty("VERIFIED_INV_" + cleanPaymentId);
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        alreadyProcessed: true,
        paymentId: cleanPaymentId,
        orderId: cleanOrderId,
        invoice: existingInv ? JSON.parse(existingInv) : null
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const rows = sheet.getDataRange().getValues();
    let targetRowIndex = -1;

    for (let i = rows.length - 1; i >= 1; i--) {
      const rowPayId = String(rows[i][8] || "").trim().replace(/^'/, "");
      if (rowPayId && rowPayId === cleanPaymentId) {
        return ContentService.createTextOutput(JSON.stringify({
          success: true,
          alreadyProcessed: true,
          paymentId: cleanPaymentId,
          orderId: cleanOrderId
        })).setMimeType(ContentService.MimeType.JSON);
      }
      if (rows[i][7] && rows[i][7].toString().trim() === cleanOrderId) {
        targetRowIndex = i + 1;
      }
    }

    if (targetRowIndex === -1) {
      throw new Error("ORDER_NOT_FOUND: Order ID not found in AI-BGM sheet.");
    }

    const row = rows[targetRowIndex - 1];
    if (String(row[6] || "").trim() === "PAID") {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        alreadyProcessed: true,
        message: "Already marked PAID.",
        paymentId: cleanPaymentId,
        orderId: cleanOrderId
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const expectedAmountInr = Number(row[5]);
    if (!expectedAmountInr || expectedAmountInr < 1) {
      throw new Error("INVALID_ORDER_AMOUNT: Order row has invalid expected amount.");
    }
    if (clientSuppliedAmount !== undefined && clientSuppliedAmount !== null && clientSuppliedAmount !== "") {
      if (Math.round(Number(clientSuppliedAmount)) !== Math.round(expectedAmountInr)) {
        throw new Error("AMOUNT_MISMATCH: Client-supplied amount does not match order amount.");
      }
    }

    verifyPaymentWithRazorpayServer(cleanOrderId, cleanPaymentId, expectedAmountInr, isIntl);

    const userName = String(row[1] || (extraData && extraData.name) || "Learner").replace(/^'/, "");
    const userEmail = String(row[2] || (extraData && extraData.email) || "").replace(/^'/, "");
    const userPhone = String(row[3] || (extraData && extraData.phone) || "").replace(/^'/, "");
    const amountPaid = expectedAmountInr;
    const courseTitle = "Advance AI-Business Generative Model (AI-BGM)";

    // Partial Failure Recovery: Check if invoice was already created in FunnelsDone / PDF in a previous attempt
    let invRecord = null;
    const existingInvJson = props ? props.getProperty("VERIFIED_INV_" + cleanPaymentId) : null;
    if (existingInvJson) {
      try {
        invRecord = JSON.parse(existingInvJson);
      } catch (e) {}
    }

    if (!invRecord) {
      // 1. Sync with FunnelsDone Private Integration API & get official Invoice Number
      const fdInvoiceNo = syncInvoiceWithFunnelsDone(userName, userEmail, userPhone, courseTitle, amountPaid, cleanPaymentId, cleanOrderId);

      // If FunnelsDone invoice generation failed/timed out, hold customer confirmation until reconciliation
      if (!fdInvoiceNo) {
        sheet.getRange(targetRowIndex, 7).setValue("PENDING_RECONCILIATION");
        SpreadsheetApp.flush();
        Logger.log("HOLDING_CONFIRMATION_EMAIL: Invoice creation uncertain or failed for payment " + cleanPaymentId + ". Suppressing speculative email.");
        return ContentService.createTextOutput(JSON.stringify({
          success: true,
          verified: true,
          uncertainInvoice: true,
          paymentId: cleanPaymentId,
          orderId: cleanOrderId,
          status: "PENDING_RECONCILIATION",
          message: "Payment captured but invoice synchronization is uncertain. Held for reconciliation."
        })).setMimeType(ContentService.MimeType.JSON);
      }

      const isTestTx = isAuthorizedLiveTest(userEmail, amountPaid);
      sheet.getRange(targetRowIndex, 7).setValue(isTestTx ? "✅ TEST_VERIFIED (₹1)" : "PAID");
      sheet.getRange(targetRowIndex, 9).setValue(sanitizeCell(cleanPaymentId));
      if (props) {
        props.setProperty("PROCESSED_PAY_" + cleanPaymentId, new Date().toISOString());
      }
      SpreadsheetApp.flush();

      // 2. Generate our side's official GST Tax Invoice PDF attachment
      let pdfAttachment = null;
      try {
        pdfAttachment = generateOurGstInvoicePdfBlob(userName, userEmail, userPhone, courseTitle, amountPaid, cleanPaymentId, cleanOrderId, fdInvoiceNo);
      } catch (pdfErr) {
        Logger.log("PDF_GEN_ERROR: " + pdfErr.message);
      }

    // Send Official Payment Received Acknowledgement Email to Learner
    try {
      if (isNotificationSuppressed() || isAuthorizedLiveTest(userEmail, amountPaid)) {
        Logger.log("EMAIL_SUPPRESSED: Email notification suppressed in environment: " + getAppEnvironment() + " for " + userEmail);
      } else if (userEmail && userEmail.includes("@")) {
        const dateTimeFormatted = Utilities.formatDate(new Date(), "Asia/Kolkata", "dd MMM yyyy, hh:mm a 'IST'");
        const emailSubject = "🧾 Payment Received, Confirmed & GST Invoice: Advance AI-Business Generative Model (AI-BGM)";
        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #0f172a; }
              .container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
              .header { background: linear-gradient(135deg, #020617 0%, #1e1b4b 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
              .badge { display: inline-block; padding: 6px 14px; background: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; color: #34d399; font-weight: 800; font-size: 11px; letter-spacing: 1.5px; border-radius: 20px; text-transform: uppercase; margin-bottom: 12px; }
              .title { font-size: 22px; font-weight: 900; margin: 0 0 8px 0; color: #ffffff; }
              .subtitle { font-size: 13px; color: #94a3b8; margin: 0; }
              .content { padding: 32px 28px; }
              .greeting { font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 12px; }
              .receipt-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0; }
              .receipt-total { background: #e0e7ff; padding: 12px 16px; border-radius: 8px; margin-top: 12px; display: flex; justify-content: space-between; align-items: center; }
              .total-label { color: #3730a3; font-weight: 800; font-size: 14px; text-transform: uppercase; }
              .total-val { color: #1e1b4b; font-weight: 900; font-size: 20px; }
              .deliverables { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0; }
              .deliverable-title { font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #4338ca; margin-bottom: 12px; }
              .deliv-item { margin: 8px 0; font-size: 13px; color: #334155; line-height: 1.5; }
              .cta-btn { display: block; text-align: center; background: #4f46e5; color: #ffffff !important; padding: 14px 28px; border-radius: 10px; font-weight: 800; text-decoration: none; font-size: 14px; margin: 24px 0 16px 0; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); }
              .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="badge">✓ Payment Received & Verified</div>
                <h1 class="title">${FUNNELSDONE_CONFIG.COMPANY_NAME}</h1>
                <p class="subtitle">Official Payment Receipt, GST Tax Invoice & Course Admission Acknowledgement</p>
              </div>
              
              <div class="content">
                <div class="greeting">Dear ${userName},</div>
                <p style="font-size: 14px; line-height: 1.6; color: #334155;">
                  We have successfully received and confirmed your payment for the <strong>Advance AI-Business Generative Model (AI-BGM)</strong> executive course. Welcome to the cohort! Your official <strong>GST Tax Invoice (PDF)</strong> is attached to this email for your records.
                </p>

                <!-- Official Payment Receipt Box -->
                <div class="receipt-box">
                  <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #0f172a; margin-bottom: 14px;">
                    Official Payment Details
                  </div>
                  <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                    <tr style="border-bottom: 1px dashed #e2e8f0;">
                      <td style="padding: 6px 0; color: #64748b;">Transaction Date:</td>
                      <td style="padding: 6px 0; font-weight: 700; text-align: right; color: #0f172a;">${dateTimeFormatted}</td>
                    </tr>
                    <tr style="border-bottom: 1px dashed #e2e8f0;">
                      <td style="padding: 6px 0; color: #64748b;">Payment ID:</td>
                      <td style="padding: 6px 0; font-family: monospace; font-weight: 700; text-align: right; color: #4338ca;">${cleanPaymentId}</td>
                    </tr>
                    <tr style="border-bottom: 1px dashed #e2e8f0;">
                      <td style="padding: 6px 0; color: #64748b;">Order Reference ID:</td>
                      <td style="padding: 6px 0; font-family: monospace; font-weight: 700; text-align: right; color: #0f172a;">${cleanOrderId}</td>
                    </tr>
                    <tr style="border-bottom: 1px dashed #e2e8f0;">
                      <td style="padding: 6px 0; color: #64748b;">Participant Name:</td>
                      <td style="padding: 6px 0; font-weight: 700; text-align: right; color: #0f172a;">${userName}</td>
                    </tr>
                    <tr style="border-bottom: 1px dashed #e2e8f0;">
                      <td style="padding: 6px 0; color: #64748b;">Registered Mobile:</td>
                      <td style="padding: 6px 0; font-weight: 700; text-align: right; color: #0f172a;">${userPhone}</td>
                    </tr>
                    <tr style="border-bottom: 1px dashed #e2e8f0;">
                      <td style="padding: 6px 0; color: #64748b;">Course / Product:</td>
                      <td style="padding: 6px 0; font-weight: 700; text-align: right; color: #0f172a;">Advance AI-Business Generative Model (AI-BGM)</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #64748b;">Payment Status:</td>
                      <td style="padding: 6px 0; font-weight: 800; text-align: right; color: #16a34a;">PAID (COMPLETED)</td>
                    </tr>
                  </table>

                  <div class="receipt-total">
                    <span class="total-label">Total Amount Paid (Incl. GST):</span>
                    <span class="total-val">₹${amountPaid.toLocaleString()}</span>
                  </div>
                </div>

                <!-- Enclosed Benefits -->
                <div class="deliverables">
                  <div class="deliverable-title">Your Unlocked Cohort Inclusions</div>
                  <div class="deliv-item">✓ <strong>20+ Hours of Course Content:</strong> High-definition video modules teaching AI with a 100% Business Perspective.</div>
                  <div class="deliv-item">✓ <strong>Lifetime Unrestricted Access:</strong> Permanent access to the course platform with zero subscription renewals.</div>
                  <div class="deliv-item">✓ <strong>The Living LLM Software:</strong> Continuous real-time model updates and prompt repositories as AI advances.</div>
                  <div class="deliv-item">✓ <strong>9 CORE Principles BMC Blueprint:</strong> Full execution framework from business ideas to automated lead systems.</div>
                  <div class="deliv-item">✓ <strong>AI Creatives, Websites & Video Engines:</strong> Production-grade assets for rapid market execution.</div>
                </div>

                <!-- Action Step -->
                <p style="font-size: 14px; line-height: 1.6; color: #334155;">
                  <strong>Next Step:</strong> Click the button below to join the Private Onboarding WhatsApp channel and connect directly with Antony Praveen and the Tech Tycoon team.
                </p>

                <a href="https://wa.me/917558133039?text=Hello%20Antony%2C%20I%20have%20completed%20payment%20for%20AI-BGM%20Course%20(Payment%20ID%3A%20${cleanPaymentId})" class="cta-btn">
                  📱 Join Private VIP WhatsApp Channel
                </a>

                <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin-top: 16px;">
                  Need help? Reply directly to this email or reach our support team on WhatsApp at <strong>+91 75581 33039</strong>. Please preserve this email as your official proof of payment.
                </p>
              </div>

              <div class="footer">
                <p style="margin: 0 0 6px 0; font-weight: 700; color: #334155;">${FUNNELSDONE_CONFIG.COMPANY_NAME} (GSTIN: ${FUNNELSDONE_CONFIG.COMPANY_GSTIN})</p>
                <p style="margin: 0;">No. 3/59B, 1st Floor, 3rd Street, Ragava Nagar, Moovarasampet, Chennai-600091</p>
              </div>
            </div>
          </body>
          </html>
        `;

        const emailOptions = {
          to: userEmail,
          subject: emailSubject,
          htmlBody: emailHtml,
          name: "Tech Tycoon AI Academy"
        };
        if (pdfAttachment) {
          emailOptions.attachments = [pdfAttachment];
        }
        MailApp.sendEmail(emailOptions);
      }
    } catch (emailErr) {
      Logger.log("Payment acknowledgement email notice: " + emailErr.toString());
    }

    // Also send Admin Notification Alert of payment received
    try {
      if (isNotificationSuppressed()) {
        Logger.log("EMAIL_SUPPRESSED: Admin notification suppressed in environment: " + getAppEnvironment());
      } else {
        const adminEmails = "ambroseselva001@gmail.com, techtycoondigitalsolutions@gmail.com";
      const adminSubject = `🚨 [AI-BGM] New Payment Received: ₹${amountPaid.toLocaleString()} from ${userName}`;
      const adminBody = `A new payment has been successfully received for Advance AI-Business Generative Model (AI-BGM)!\n\n` +
        `Name: ${userName}\n` +
        `Email: ${userEmail}\n` +
        `Phone: ${userPhone}\n` +
        `Amount: ₹${amountPaid}\n` +
        `Order ID: ${cleanOrderId}\n` +
        `Payment ID: ${cleanPaymentId}\n` +
        `FunnelsDone Invoice: ${fdInvoiceNo || "Synced"}\n` +
        `Status: PAID (Updated in AI_BGM_LLM Sheet1)\n` +
        `Time: ${new Date().toString()}`;

      MailApp.sendEmail({
        to: adminEmails,
        subject: adminSubject,
        body: adminBody
      });
      }
    } catch (adminErr) {
      Logger.log("Admin alert notice: " + adminErr.toString());
    }

      invRecord = saveVerifiedInvoiceRecord(
        cleanPaymentId,
        cleanOrderId,
        fdInvoiceNo,
        userName,
        userEmail,
        userPhone,
        courseTitle,
        amountPaid
      );
    }

    // Dedicated INVOICE_TOKEN_SECRET is required to sign customer invoice bearer tokens.
    // Zero fallback to Razorpay payment secrets.
    const invSecret = getOptionalScriptSecret("INVOICE_TOKEN_SECRET");
    if (!invSecret) {
      throw new Error("MISSING_INVOICE_TOKEN_SECRET: Dedicated INVOICE_TOKEN_SECRET must be configured in Script Properties.");
    }
    const expiresAt = Date.now() + 86400000; // 24 hours validity
    const invoiceToken = expiresAt + "." + computeHmacSha256Hex(cleanPaymentId + "|" + cleanOrderId + "|" + expiresAt, invSecret);

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      verified: true,
      message: "Payment successfully verified, Google Sheet updated, and acknowledgement email sent.",
      paymentId: cleanPaymentId,
      orderId: cleanOrderId,
      invoiceNumber: invRecord.invoiceNumber,
      invoiceToken: invoiceToken,
      invoice: invRecord
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function handlePaymentSuccess(sheet, data) {
  const orderId = data.razorpay_order_id || data.orderId || "";
  const paymentId = data.razorpay_payment_id || data.transactionId || data.paymentId || "";
  const signature = data.razorpay_signature || "";
  const isIntl = Boolean(data.isInternational || (data.countryCode && data.countryCode !== "+91"));

  if (!orderId || !paymentId || !signature) {
    throw new Error("MISSING_SIGNATURE: razorpay_order_id, razorpay_payment_id, and razorpay_signature are required.");
  }

  validatePaymentEnvironment({ id: paymentId, notes: data.notes || {} });

  const sigOk = verifyRazorpayPaymentSignature(orderId, paymentId, signature, isIntl);
  if (!sigOk) {
    throw new Error("INVALID_SIGNATURE: Payment signature verification failed.");
  }

  return processVerifiedBgmPayment(sheet, orderId, paymentId, isIntl, data.amount, data);
}

function handleWebhookPaymentSuccess(sheet, orderId, paymentId, email, proxySignature, timestamp, eventId, targetProduct, payloadDigest, paymentEntity, proxyVersion, eventType) {
  const webhookProxySecret = getScriptSecret("WEBHOOK_PROXY_SECRET");
  if (!webhookProxySecret) {
    throw new Error("MISSING_PROXY_SECRET: Webhook proxy secret not configured.");
  }

  const cleanOrderId = String(orderId || "").trim();
  const cleanPaymentId = String(paymentId || "").trim();
  const cleanEventId = String(eventId || "").trim();
  const cleanTimestamp = Number(timestamp) || 0;
  const cleanTargetProduct = String(targetProduct || "").trim().toLowerCase();
  const cleanPayloadDigest = String(payloadDigest || "").trim().toLowerCase();
  const cleanEventType = String(eventType || (paymentEntity && paymentEntity.event) || "payment.captured").trim();
  const cleanAmount = paymentEntity && paymentEntity.amount !== undefined ? String(paymentEntity.amount).trim() : "";
  const cleanCurrency = paymentEntity && paymentEntity.currency ? String(paymentEntity.currency).trim() : "INR";
  const cleanStatus = paymentEntity && paymentEntity.status ? String(paymentEntity.status).trim() : "captured";
  const cleanAccountId = paymentEntity ? String(paymentEntity.account_id || paymentEntity.accountId || (paymentEntity.notes && paymentEntity.notes.account_id) || "").trim() : "";
  const cleanProxyVersion = String(proxyVersion || "").trim();

  // Validate payment test/live mode against environment
  validatePaymentEnvironment(paymentEntity);

  // Production Rejection Gate:
  // Production environment unconditionally mandates proxy_version === "v2.1", 12-tuple HMAC, and 8-field digest.
  // Weaker legacy signatures can NEVER be accepted in production, regardless of STRICT_PROXY_MODE or ALLOW_LEGACY_PROXY_SIGNATURE.
  // Legacy compatibility is strictly confined to explicit non-production environments (ENVIRONMENT === "development" or "local_test").
  const isNodeTestEnv = (typeof process !== "undefined" && Boolean(process.env) && process.env.NODE_ENV === "test");
  const env = getAppEnvironment();
  const isExplicitNonProd = (env === "development" || env === "local_test");
  const allowLegacyDev = isExplicitNonProd && (getOptionalScriptSecret("ALLOW_LEGACY_PROXY_SIGNATURE") === "true" || (isNodeTestEnv && !getOptionalScriptSecret("ENVIRONMENT")));

  // 1. Destination binding: Target product must match this script's expected product
  const isV2 = (cleanProxyVersion === "v2.1" || cleanProxyVersion === "v2" || Boolean(cleanPayloadDigest && cleanTargetProduct));
  if (isV2) {
    if (!cleanTargetProduct || cleanTargetProduct !== EXPECTED_PRODUCT_KEY) {
      throw new Error("DESTINATION_MISMATCH: Webhook intended for '" + cleanTargetProduct + "' cannot be processed by '" + EXPECTED_PRODUCT_KEY + "'.");
    }
  }

  // 2. Replay prevention: verify timestamp freshness within 5 minutes (300,000 ms)
  const now = Date.now();
  if (!cleanTimestamp || Math.abs(now - cleanTimestamp) > 300000) {
    throw new Error("REPLAY_EXPIRED_TIMESTAMP: Webhook timestamp expired or outside tolerance window.");
  }

  // 3. Tamper resistance & payload integrity verification
  const cleanSig = String(proxySignature || "").trim().toLowerCase();
  if (!allowLegacyDev) {
    // Unconditional Production Verifier
    if (!cleanProxyVersion) {
      throw new Error("MISSING_PROTOCOL_VERSION: Production requires proxy_version 'v2.1'.");
    }
    if (cleanProxyVersion !== "v2.1") {
      throw new Error("PROTOCOL_DOWNGRADE_REJECTED: Production only permits 'v2.1'. Received '" + cleanProxyVersion + "'.");
    }

    const digest8 = computeCanonicalPayloadDigest(paymentEntity);
    if (!cleanPayloadDigest || !constantTimeEquals(digest8, cleanPayloadDigest)) {
      throw new Error("PAYLOAD_DIGEST_MISMATCH: Canonical payload digest does not match payment entity.");
    }

    const expectedSig12 = computeHmacSha256Hex(
      "v2|" + cleanEventId + "|" + cleanEventType + "|" + cleanOrderId + "|" + cleanPaymentId + "|" + cleanTimestamp + "|" + cleanTargetProduct + "|" + cleanAmount + "|" + cleanCurrency + "|" + cleanStatus + "|" + cleanAccountId + "|" + cleanPayloadDigest,
      webhookProxySecret
    );
    if (!proxySignature || !constantTimeEquals(expectedSig12, cleanSig)) {
      throw new Error("INVALID_WEBHOOK_SIGNATURE: Webhook proxy signature verification failed.");
    }
  } else {
    // Isolated non-production development mode ONLY
    Logger.log("SECURITY_WARNING: Processing webhook under non-production development mode.");
    if (cleanProxyVersion === "v2.1") {
      const digest8 = computeCanonicalPayloadDigest(paymentEntity);
      if (!cleanPayloadDigest || !constantTimeEquals(digest8, cleanPayloadDigest)) {
        throw new Error("PAYLOAD_DIGEST_MISMATCH: Canonical payload digest does not match payment entity.");
      }

      const expectedSig12 = computeHmacSha256Hex(
        "v2|" + cleanEventId + "|" + cleanEventType + "|" + cleanOrderId + "|" + cleanPaymentId + "|" + cleanTimestamp + "|" + cleanTargetProduct + "|" + cleanAmount + "|" + cleanCurrency + "|" + cleanStatus + "|" + cleanAccountId + "|" + cleanPayloadDigest,
        webhookProxySecret
      );
      if (!proxySignature || !constantTimeEquals(expectedSig12, cleanSig)) {
        throw new Error("INVALID_WEBHOOK_SIGNATURE: Webhook proxy signature verification failed.");
      }
    } else if (isV2) {
      Logger.log("SECURITY_WARNING: Legacy v2 signature accepted in non-production development mode for event: " + cleanEventId);
      const digest8 = computeCanonicalPayloadDigest(paymentEntity);
      const digest5 = computeCanonicalPayloadDigest(paymentEntity, "5field");
      const digestValid = cleanPayloadDigest && (
        constantTimeEquals(digest8, cleanPayloadDigest) ||
        constantTimeEquals(digest5, cleanPayloadDigest)
      );
      if (!digestValid) {
        throw new Error("PAYLOAD_DIGEST_MISMATCH: Canonical payload digest does not match payment entity.");
      }

      const expectedSig12 = computeHmacSha256Hex(
        "v2|" + cleanEventId + "|" + cleanEventType + "|" + cleanOrderId + "|" + cleanPaymentId + "|" + cleanTimestamp + "|" + cleanTargetProduct + "|" + cleanAmount + "|" + cleanCurrency + "|" + cleanStatus + "|" + cleanAccountId + "|" + cleanPayloadDigest,
        webhookProxySecret
      );
      const expectedSig7 = computeHmacSha256Hex(
        "v2|" + cleanEventId + "|" + cleanOrderId + "|" + cleanPaymentId + "|" + cleanTimestamp + "|" + cleanTargetProduct + "|" + cleanPayloadDigest,
        webhookProxySecret
      );
      const sigValid = constantTimeEquals(expectedSig12, cleanSig) || constantTimeEquals(expectedSig7, cleanSig);
      if (!proxySignature || !sigValid) {
        throw new Error("INVALID_WEBHOOK_SIGNATURE: Webhook proxy signature verification failed.");
      }
    } else {
      Logger.log("SECURITY_WARNING: Legacy v1 signature accepted in non-production development mode for event: " + cleanEventId);
      const expectedProxySig = computeHmacSha256Hex(
        cleanEventId + "|" + cleanOrderId + "|" + cleanPaymentId + "|" + cleanTimestamp,
        webhookProxySecret
      );
      if (!proxySignature || !constantTimeEquals(expectedProxySig, cleanSig)) {
        throw new Error("INVALID_WEBHOOK_SIGNATURE: Webhook proxy signature verification failed.");
      }
    }
  }

  // 4. Replay prevention & Event Integrity check
  const props = PropertiesService.getScriptProperties();
  if (props && cleanEventId) {
    const existingEvt = props.getProperty("PROCESSED_EVT_" + cleanEventId);
    if (existingEvt) {
      try {
        const parsed = JSON.parse(existingEvt);
        if (parsed && typeof parsed === "object") {
          const storedDigest = String(parsed.payloadDigest || "").trim();
          const storedPayId = String(parsed.paymentId || "").trim();
          if (
            (cleanPayloadDigest && storedDigest && storedDigest !== cleanPayloadDigest) ||
            (cleanPaymentId && storedPayId && storedPayId !== cleanPaymentId)
          ) {
            throw new Error("EVENT_ID_INTEGRITY_CONFLICT: Reused event ID does not match original event payload digest or payment identifier.");
          }
        }
      } catch (err) {
        if (err.message && err.message.indexOf("EVENT_ID_INTEGRITY_CONFLICT") !== -1) {
          throw err;
        }
      }
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        alreadyProcessed: true,
        duplicate: true,
        eventId: cleanEventId
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }

  const result = processVerifiedBgmPayment(sheet, cleanOrderId, cleanPaymentId, undefined, undefined, { email: email });

  // 5. Mark event processed ONLY after successful execution to ensure retries succeed upon temporary failure
  if (props && cleanEventId && result) {
    let resultJson = null;
    try {
      resultJson = JSON.parse(result.getContent());
    } catch (e) {}

    // Only commit event processing if the invoice resolution did not enter an uncertain hold state
    if (!resultJson || !resultJson.uncertainInvoice) {
      props.setProperty("PROCESSED_EVT_" + cleanEventId, JSON.stringify({
        timestamp: new Date().toISOString(),
        payloadDigest: cleanPayloadDigest,
        paymentId: cleanPaymentId,
        orderId: cleanOrderId
      }));
    }
  }

  return result;
}
