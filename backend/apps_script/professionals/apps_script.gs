/**
 * ============================================================================
 * AI FOR WORKING PROFESSIONALS — DEDICATED GOOGLE APPS SCRIPT AUTOMATION
 * Course: "Advance AI for Non-Tech Working Professionals"
 * 
 * Target Google Sheet URL:
 * https://docs.google.com/spreadsheets/d/1RpwPPMH6nf8CsIAfITF1gNc5gBNhq7CJ0zckotAgq4I/edit?gid=0#gid=0
 * Spreadsheet ID: 1RpwPPMH6nf8CsIAfITF1gNc5gBNhq7CJ0zckotAgq4I
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
  // Default to production for deployed script if property not set (prevents MISSING_ENVIRONMENT runtime failure)
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

const DEFAULT_SPREADSHEET_ID = "1RpwPPMH6nf8CsIAfITF1gNc5gBNhq7CJ0zckotAgq4I";
const SPREADSHEET_ID = null;
const EXPECTED_PRODUCT_KEY = "professionals";
const SHEET_NAME = "Sheet1";

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

const TEST_EMAILS = ["ambroseselva001@gmail.com", "techtycoondigitalsolutions@gmail.com", "techtycoondigitors@gmail.com"];

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

function saveVerifiedInvoiceRecord(recordOrPaymentId, orderId, invoiceNumber, name, email, phone, course, amount) {
  let record = {};
  if (recordOrPaymentId && typeof recordOrPaymentId === "object") {
    record = recordOrPaymentId;
  } else {
    record = {
      paymentId: recordOrPaymentId,
      orderId: orderId,
      invoiceNumber: invoiceNumber,
      name: name,
      email: email,
      phone: phone,
      course: course,
      amount: amount
    };
  }
  if (!record || !record.paymentId) return null;
  const props = PropertiesService.getScriptProperties();
  const recordObj = {
    verified: true,
    status: "PAID",
    paymentId: record.paymentId,
    orderId: record.orderId || "",
    invoiceNumber: record.invoiceNumber || "",
    name: record.name || "Learner",
    email: record.email || "",
    phone: record.phone || "",
    course: record.course || "Advance AI for Non-Tech Working Professionals",
    amount: Number(record.amount) || 6449,
    paidAt: record.paidAt || Utilities.formatDate(new Date(), "Asia/Kolkata", "dd MMM yyyy, hh:mm a")
  };
  const payload = JSON.stringify(recordObj);
  props.setProperty("VERIFIED_INV_" + record.paymentId, payload);
  if (record.orderId) {
    props.setProperty("VERIFIED_INV_ORD_" + record.orderId, payload);
  }
  return recordObj;
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
            courseName: "Advance AI for Non-Tech Working Professionals",
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
 * Safely retrieve target sheet
 */
function getTargetSheet(requestedSpreadsheetId) {
  let ss = null;
  const targetId = requestedSpreadsheetId || getSpreadsheetId();
  
  try {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  } catch (e) {
    Logger.log("getActiveSpreadsheet notice: " + e.toString());
  }

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
 * Handle GET Requests
 */
function doGet(e) {
  try {
    const params = (e && e.parameter) ? e.parameter : {};

    if (params.action === "getVerifiedInvoice") {
      const sheet = getTargetSheet(params.spreadsheetId);
      const res = getVerifiedInvoiceRecord(sheet, params.paymentId, params.orderId, params.token, params.email || params.phone || params.contact);
      return ContentService.createTextOutput(JSON.stringify(res)).setMimeType(ContentService.MimeType.JSON);
    }

    if (params.name && params.phone) {
      const sheet = getTargetSheet(params.spreadsheetId);
      return createOrderAndLogRow(sheet, params);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "online",
      course: "Advance AI for Non-Tech Working Professionals",
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
 * Handle POST Requests
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

    const sheet = getTargetSheet(contents.spreadsheetId);

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

    // Check if this is a payment success callback
    if (contents.paymentSuccess || contents.razorpay_payment_id) {
      return handlePaymentSuccess(sheet, contents);
    }

    // Default: Log row and generate Order ID
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
 * Appends row into Sheet1 matching columns:
 * [Date and Time, Name, Email, Phone, Profession, Amount, Status, Order ID, Payment ID]
 */
function createOrderAndLogRow(sheet, data) {
  const currentDateTime = formatISTTimestamp(new Date());
  const name = sanitizeCell((data.name || "").toString().trim());
  const email = sanitizeCell((data.email || "").toString().trim());
  const phone = sanitizeCell((data.phone || "").toString().trim());
  const profession = sanitizeCell((data.profession || data.customProfession || "Working Professional").toString().trim());
  const emailLower = email.toLowerCase();
  const rawAmt = Number(data.amount) || 6449;
  const amount = (TEST_EMAILS.indexOf(emailLower) !== -1 && rawAmt === 1) ? 1 : (rawAmt < 3500 ? 6449 : Math.round(rawAmt));
  const isIntl = data.isInternational === true || data.isInternational === "true";

  const orderId = createRazorpayOrder(amount, isIntl, {
    product_key: "professionals",
    name: name,
    email: email,
    phone: phone,
    profession: profession,
    course: "Advance AI for Non-Tech Working Professionals",
    base_amount: data.baseAmount || 5465.25,
    gst_amount: data.gstAmount || 983.75
  });

  // Check if order already exists in sheet to avoid duplicates
  const existingRow = findRowByOrderId(sheet, orderId);
  if (existingRow === -1) {
    const rowValues = [
      currentDateTime,       // Col A: Date and Time
      name,                  // Col B: Name
      email,                 // Col C: Email
      phone,                 // Col D: Phone
      profession,            // Col E: Profession
      amount,                // Col F: Amount
      "INITIATED",           // Col G: Status
      orderId,               // Col H: Order ID
      ""                     // Col I: Payment ID
    ];
    sheet.appendRow(rowValues);
  }

  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    orderId: orderId,
    amount: amount,
    status: "INITIATED"
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
  if (acct && acct.isTest) {
    Logger.log("GST_SALES_REGISTER_SKIP: Test transaction for " + customerEmail + " skipped from GST Sales Register.");
    return;
  }
  try {
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
    const mockInvNum = "TEST-TT/26-27/" + (cleanPayId.replace(/\D/g, "").slice(-4) || "1001");
    Logger.log("AUTHORIZED_TEST_PAYMENT: Live test payment processed with test invoice: " + mockInvNum);
    if (props && cleanPayId) {
      props.setProperty("INVOICE_STATE_" + cleanPayId, "RESOLVED");
      props.setProperty("VERIFIED_INV_" + cleanPayId, mockInvNum);
    }
    return mockInvNum;
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
      tags: ["professionals_paid", "gst_invoice_issued"]
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
            if (!invProductName.includes("professional")) {
              Logger.log("INVOICE_VALIDATION_SKIP: Course mismatch on invoice " + invId + " for professionals: " + invProductName);
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
      name: courseName || "Advance AI for Non-Tech Working Professionals",
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
          name: courseName || "Advance AI for Non-Tech Working Professionals",
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

function sendProfessionalsEmail(userName, userEmail, userPhone, paidAmount, paymentId, orderId) {
  const courseTitle = "Advance AI for Non-Tech Working Professionals";

  // 1. Sync with FunnelsDone Private Integration API & get official Invoice Number
  const fdInvoiceNo = syncInvoiceWithFunnelsDone(userName, userEmail, userPhone, courseTitle, paidAmount, paymentId, orderId);

  // Staging / Test Isolation Gate: Notification suppression
  if (isNotificationSuppressed() || isAuthorizedLiveTest(userEmail, paidAmount)) {
    Logger.log("EMAIL_SUPPRESSED: Email notification suppressed in environment: " + getAppEnvironment() + " for " + userEmail);
    return { invoiceNumber: fdInvoiceNo, courseTitle: courseTitle, uncertain: false, suppressed: true };
  }

  // If FunnelsDone invoice generation failed/timed out, hold customer confirmation email until reconciliation
  if (!fdInvoiceNo) {
    Logger.log("HOLDING_CONFIRMATION_EMAIL: Invoice creation uncertain or failed for payment " + paymentId + ". Suppressing speculative email.");
    return { invoiceNumber: null, courseTitle: courseTitle, uncertain: true };
  }

  // 2. Generate our side's official GST Tax Invoice PDF attachment
  let pdfAttachment = null;
  try {
    pdfAttachment = generateOurGstInvoicePdfBlob(userName, userEmail, userPhone, courseTitle, paidAmount, paymentId, orderId, fdInvoiceNo);
  } catch (pdfErr) {
    Logger.log("PDF_GEN_ERROR: " + pdfErr.message);
  }

  const subject = "🎉 Enrollment Confirmed & GST Invoice — Advance AI for Working Professionals";
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; color: #0f172a; padding: 30px; border-radius: 16px; border: 1px solid #e2e8f0;">
      <h2 style="color: #0f172a; margin-top: 0;">Welcome, ${sanitizeCell(userName)}! 🚀</h2>
      <p style="color: #334155; font-size: 14px; line-height: 1.6;">
        Your payment and enrollment for <strong>${courseTitle}</strong> are officially confirmed! Your official <strong>GST Tax Invoice (PDF)</strong> is attached to this email for your records.
      </p>
      <div style="background-color: #f8fafc; padding: 18px; border-radius: 12px; border: 1px solid #e2e8f0; margin: 20px 0;">
        <p style="margin: 6px 0; font-size: 13px;"><strong>Course:</strong> ${courseTitle}</p>
        <p style="margin: 6px 0; font-size: 13px;"><strong>Total Paid (Incl. 18% GST):</strong> ₹${Number(paidAmount).toLocaleString("en-IN")}</p>
        <p style="margin: 6px 0; font-size: 13px;"><strong>Payment ID:</strong> ${sanitizeCell(paymentId)}</p>
        <p style="margin: 6px 0; font-size: 13px;"><strong>Invoice No:</strong> ${fdInvoiceNo}</p>
      </div>
      <p style="color: #334155; font-size: 14px; line-height: 1.6;">
        If you need any assistance, reach out to our team on WhatsApp at <strong>+91 75581 33039</strong>.
      </p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="color: #64748b; font-size: 11px; text-align: center; margin: 0;">
        © 2026 ${FUNNELSDONE_CONFIG.COMPANY_NAME} (GSTIN: ${FUNNELSDONE_CONFIG.COMPANY_GSTIN})<br/>
        No. 3/59B, 1st Floor, 3rd Street, Ragava Nagar, Moovarasampet, Chennai-600091
      </p>
    </div>
  `;

  const mailOptions = {
    to: userEmail,
    subject: subject,
    htmlBody: htmlBody,
    name: "Tech Tycoon AI Academy",
    replyTo: "techtycoondigitalsolutions@gmail.com"
  };
  if (pdfAttachment) {
    mailOptions.attachments = [pdfAttachment];
  }
  MailApp.sendEmail(mailOptions);
  return { invoiceNumber: fdInvoiceNo, courseTitle: courseTitle };
}

function processVerifiedProfessionalsPayment(sheet, data, isWebhook) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const orderId = (data.razorpay_order_id || data.orderId || "").toString().trim();
    const paymentId = (data.razorpay_payment_id || data.paymentId || "").toString().trim();
    const signature = (data.razorpay_signature || "").toString().trim();
    const isIntl = Boolean(data.isInternational);

    assertSpreadsheetIsolation(sheet && sheet.getParent ? sheet.getParent() : sheet);
    validatePaymentEnvironment({ id: paymentId, notes: data.notes || {} });

    if (!orderId || !paymentId) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: "PAYMENT_VERIFICATION_FAILED: Missing razorpay_order_id or razorpay_payment_id"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (!isWebhook) {
      const sigCheck = verifyRazorpayPaymentSignature(orderId, paymentId, signature, isIntl);
      if (!sigCheck.valid) {
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          error: "PAYMENT_VERIFICATION_FAILED: " + sigCheck.reason
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    const props = PropertiesService.getScriptProperties();
    const idempotencyKey = "PROCESSED_PAY_" + paymentId;
    if (props.getProperty(idempotencyKey)) {
      const existingInv = getVerifiedInvoiceRecord(sheet, paymentId, orderId);
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        alreadyProcessed: true,
        status: "PAID",
        orderId: orderId,
        paymentId: paymentId,
        invoice: existingInv
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const rowNumber = findRowByOrderId(sheet, orderId);
    if (rowNumber === -1) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: "PAYMENT_VERIFICATION_FAILED: Order ID " + orderId + " not found in sheet"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const rowData = sheet.getRange(rowNumber, 1, 1, 9).getValues()[0];
    if (String(rowData[6] || "").trim() === "PAID") {
      props.setProperty(idempotencyKey, new Date().toISOString());
      const existingInv = getVerifiedInvoiceRecord(sheet, paymentId, orderId);
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        alreadyProcessed: true,
        status: "PAID",
        orderId: orderId,
        paymentId: paymentId,
        invoice: existingInv
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const expectedAmountInr = Number(rowData[5]) || 6449;
    const name = String(rowData[1] || data.name || "Learner").trim();
    const email = String(rowData[2] || data.email || "").trim();
    const phone = String(rowData[3] || data.phone || "").trim();

    let rzpPayment = null;
    try {
      rzpPayment = verifyPaymentWithRazorpayServer(paymentId, orderId, expectedAmountInr, isIntl);
    } catch (primaryErr) {
      try {
        rzpPayment = verifyPaymentWithRazorpayServer(paymentId, orderId, expectedAmountInr, !isIntl);
      } catch (fallbackErr) {
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          error: "PAYMENT_VERIFICATION_FAILED: " + primaryErr.message
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    const verifiedAmountInr = Math.round(Number(rzpPayment.amount) / 100);

    let invRecord = null;
    const existingInvJson = props ? props.getProperty("VERIFIED_INV_" + paymentId) : null;
    if (existingInvJson) {
      try {
        invRecord = JSON.parse(existingInvJson);
      } catch (e) {}
    }

    if (!invRecord) {
      let issuedInvoiceNo = "";
      let courseTitle = "Advance AI for Non-Tech Working Professionals";
      let emailRes = { invoiceNumber: null, courseTitle: courseTitle, uncertain: false };
      if (email && email.includes("@")) {
        try {
          emailRes = sendProfessionalsEmail(name, email, phone, verifiedAmountInr, paymentId, orderId) || emailRes;
          if (emailRes && emailRes.invoiceNumber) issuedInvoiceNo = emailRes.invoiceNumber;
          if (emailRes && emailRes.courseTitle) courseTitle = emailRes.courseTitle;
        } catch (mailErr) {
          Logger.log("Professionals Invoice Email Error: " + mailErr.toString());
        }
      }

      // If FunnelsDone invoice generation failed/timed out, hold customer confirmation until reconciliation
      if (emailRes.uncertain || !issuedInvoiceNo) {
        sheet.getRange(rowNumber, 7).setValue("PENDING_RECONCILIATION");
        SpreadsheetApp.flush();
        Logger.log("HOLDING_CONFIRMATION_EMAIL: Invoice creation uncertain or failed for payment " + paymentId + ". Suppressing speculative email.");
        return ContentService.createTextOutput(JSON.stringify({
          success: true,
          verified: true,
          uncertainInvoice: true,
          paymentId: paymentId,
          orderId: orderId,
          status: "PENDING_RECONCILIATION",
          message: "Payment captured but invoice synchronization is uncertain. Held for reconciliation."
        })).setMimeType(ContentService.MimeType.JSON);
      }

      const isTestTx = isAuthorizedLiveTest(email, verifiedAmountInr) || isAuthorizedLiveTest(email, expectedAmountInr);
      // Col G (Col 7) = Status, Col I (Col 9) = Payment ID
      sheet.getRange(rowNumber, 7).setValue(isTestTx ? "✅ TEST_VERIFIED (₹1)" : "PAID");
      sheet.getRange(rowNumber, 9).setValue(paymentId);
      props.setProperty(idempotencyKey, new Date().toISOString());
      SpreadsheetApp.flush();

      invRecord = saveVerifiedInvoiceRecord({
        paymentId: paymentId,
        orderId: orderId,
        invoiceNumber: issuedInvoiceNo,
        name: name,
        email: email,
        phone: phone,
        course: courseTitle,
        amount: verifiedAmountInr
      });
    }

    // Dedicated INVOICE_TOKEN_SECRET is required to sign customer invoice bearer tokens.
    // Zero fallback to Razorpay payment secrets.
    const invSecret = getOptionalScriptSecret("INVOICE_TOKEN_SECRET");
    if (!invSecret) {
      throw new Error("MISSING_INVOICE_TOKEN_SECRET: Dedicated INVOICE_TOKEN_SECRET must be configured in Script Properties.");
    }
    const expiresAt = Date.now() + 86400000; // 24 hours validity
    const invoiceToken = expiresAt + "." + computeHmacSha256Hex(paymentId + "|" + orderId + "|" + expiresAt, invSecret);

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      verified: true,
      status: "PAID",
      orderId: orderId,
      paymentId: paymentId,
      invoiceNumber: (invRecord && invRecord.invoiceNumber) || "",
      invoiceToken: invoiceToken,
      invoice: invRecord,
      amount: verifiedAmountInr
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Updates row when Razorpay payment succeeds (after strict signature + server verification)
 */
function handlePaymentSuccess(sheet, data) {
  validatePaymentEnvironment({ id: data.razorpay_payment_id || data.paymentId, notes: data.notes || {} });
  return processVerifiedProfessionalsPayment(sheet, data, false);
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
  const isV2 = (cleanProxyVersion === "v2.1" || cleanProxyVersion === "v2" || Boolean(payloadDigest && targetProduct));
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

  const result = processVerifiedProfessionalsPayment(sheet, {
    razorpay_order_id: cleanOrderId,
    razorpay_payment_id: cleanPaymentId,
    email: email
  }, true);

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

/**
 * Find row index by Order ID (Col H / Column 8)
 */
function findRowByOrderId(sheet, orderId) {
  if (!orderId) return -1;
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;

  const orderIds = sheet.getRange(2, 8, lastRow - 1, 1).getValues();
  for (let i = 0; i < orderIds.length; i++) {
    if (orderIds[i][0] && orderIds[i][0].toString().trim() === orderId) {
      return i + 2;
    }
  }
  return -1;
}

/**
 * Create Order in Razorpay API
 */
function createRazorpayOrder(amountInRupees, isIntl, notes) {
  const keyId = getRazorpayKeyId(isIntl);
  const keySecret = getScriptSecret(isIntl ? "RAZORPAY_KEY_SECRET_INTL" : "RAZORPAY_KEY_SECRET");

  const payload = {
    amount: Math.round(amountInRupees * 100),
    currency: "INR",
    receipt: "rcpt_prof_" + Utilities.getUuid().substring(0, 8),
    notes: notes || {}
  };

  const headers = {
    "Authorization": "Basic " + Utilities.base64Encode(keyId + ":" + keySecret),
    "Content-Type": "application/json"
  };

  const options = {
    method: "post",
    headers: headers,
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch("https://api.razorpay.com/v1/orders", options);
  const result = JSON.parse(response.getContentText() || "{}");
  if (!result || !result.id) {
    throw new Error("Failed to create Razorpay order: " + response.getContentText());
  }
  return result.id;
}

/**
 * Format timestamp in IST
 */
function formatISTTimestamp(date) {
  return Utilities.formatDate(date, "Asia/Kolkata", "dd/MM/yyyy HH:mm:ss");
}
