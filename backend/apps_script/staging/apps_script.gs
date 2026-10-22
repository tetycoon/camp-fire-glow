/**
 * ============================================================================
 * TECH TYCOON STAGING PAYMENTS — DEDICATED ISOLATED AUTOMATION SYSTEM
 * Organization: TECH TYCOON DIGITAL SOLUTION LLP
 * Project: Tech Tycoon Staging Payments (Standalone Google Apps Script)
 * Target Spreadsheet: "Tech Tycoon Staging Payments" (Configured via SPREADSHEET_ID)
 * 
 * Safety & Isolation Assertions:
 * 1. Strictly requires APP_ENVIRONMENT="staging". Rejects missing or "production".
 * 2. Reads SPREADSHEET_ID from Script Properties; rejects known production spreadsheet IDs.
 * 3. Enforces MOCK_INVOICE_ADAPTER="true" as mandatory. Zero external invoice calls.
 * 4. Enforces SUPPRESS_NOTIFICATIONS="true" as mandatory. Zero WhatsApp or email sends.
 * 5. Rejects live Razorpay credentials ("rzp_live_") and live payment entities.
 * 6. Enforces strict v2.1 proxy signature verification and 8-field payload digest.
 * 7. Provides read-only diagnostic function runStagingDiagnostics() without writing rows or leaking secrets.
 * ============================================================================
 */

// ----------------------------------------------------------------------------
// CONSTANTS & CATALOG REGISTRY
// ----------------------------------------------------------------------------
const SHEET_NAME_DEFAULT_REG = "Sheet1";
const SHEET_NAME_LOGS = "Logs";
const SHEET_NAME_GST = "GST_Sales_Register";
const REQUIRED_PROXY_VERSION = "v2.1";

// Required tab headers verified by runStagingDiagnostics()
const REQUIRED_SHEET1_HEADERS = [
  "timestamp", "name", "email", "phone", "course", "usertype", "amount",
  "payment status", "order id", "payment id", "email status", "whatsapp status"
];

const REQUIRED_GST_HEADERS = [
  "timestamp", "invoice no", "invoice date", "customer name", "customer email",
  "customer phone", "place of supply", "supply type", "reverse charge", "sac code",
  "service description", "taxable value", "cgst rate", "cgst amount", "sgst rate",
  "sgst amount", "round off", "total invoice value", "payment id", "order id"
];

const REQUIRED_LOGS_HEADERS = [
  "timestamp", "event", "details"
];

// Known production spreadsheet IDs to prevent accidental cross-environment writes
const KNOWN_PRODUCTION_SPREADSHEET_IDS = [
  "1PC9ZYxd4O7ofuDwcN5AhPHTvW6RYO7V2LgQqrbPTQ5I", // Academy
  "1XyFhw6cTJAOE2XT7Ra8lmL0rcvq2meCT9LlGuzOF0nk", // AI BGM
  "1JA3FZf8xkpZ8GjuYiETXz9R0ivfW80-rf3PZIzQum9g", // Claude Masterclass
  "1LP37n3zb1d0UkXjddQBCKqmSU0j5-HvPSI-Rda36E3s", // Consulting
  "1RpwPPMH6nf8CsIAfITF1gNc5gBNhq7CJ0zckotAgq4I"  // Professionals
];

// Product catalog registry for all eight Tech Tycoon educational courses (Updated Live Prices)
const STAGING_PRODUCT_CATALOG = {
  ai_masterclass: {
    key: "ai_masterclass",
    name: "AI Secrets Revealed Masterclass",
    sacCode: "999293",
    sheetName: "Sheet1",
    basePrice: 99,
    price: 117, // ₹99 + 18% GST (₹18) = ₹117 Total
    validPrices: [99, 117]
  },
  advanced_masterclass: {
    key: "advanced_masterclass",
    name: "Advance AI Masterclass",
    sacCode: "999293",
    sheetName: "Sheet1",
    basePrice: 500,
    price: 590, // Seat Reservation: ₹500 + 18% GST (₹90) = ₹590 Total (Full: ₹5,899)
    validPrices: [299, 500, 590, 4999, 5899]
  },
  claude_masterclass: {
    key: "claude_masterclass",
    name: "Claude Coding Masterclass",
    sacCode: "999293",
    sheetName: "Sheet1",
    basePrice: 499,
    price: 589, // Standard Live Pass: ₹499 + 18% GST (₹90) = ₹589 Total
    // Multi-tier support for all options on the Claude Masterclass page:
    // - Live Standard: ₹499 base -> ₹589 total
    // - VIP Recording: ₹999 base -> ₹1,179 total
    // - Certificate Add-on (+₹1,000 base): ₹1,499 / ₹1,769, ₹1,999 / ₹2,359
    // - In-Person Chennai (Vestin Park): ₹4,999 base -> ₹5,899 total
    // - In-Person + Certificate: ₹5,999 base -> ₹7,079 total
    validPrices: [299, 499, 589, 999, 1179, 1499, 1769, 1999, 2359, 4999, 5899, 5999, 7079]
  },
  academy: {
    key: "academy",
    name: "TECH TYCOON Academy Pre-Register",
    sacCode: "999293",
    sheetName: "Sheet1",
    basePrice: 4999,
    price: 5899, // 50% Off Pre-Register: ₹4,999 + 18% GST (₹900) = ₹5,899 Total
    validPrices: [1, 499, 2499, 2949, 4999, 5899, 5999, 7079, 9999, 11799]
  },
  ai_bgm: {
    key: "ai_bgm",
    name: "Advance AI-Business Generative Model (AI-BGM)",
    sacCode: "999293",
    sheetName: "Sheet1",
    basePrice: 4999,
    price: 5899, // Discounted: ₹4,999 + 18% GST (₹900) = ₹5,899 Total
    validPrices: [1, 499, 4999, 5899, 6999, 8259, 9999, 11799]
  },
  consulting: {
    key: "consulting",
    name: "1-on-1 AI Strategy Session",
    sacCode: "999293",
    sheetName: "Sheet1",
    basePrice: 2500,
    price: 2950, // 60-Min Consultation: ₹2,500 + 18% GST (₹450) = ₹2950 Total
    validPrices: [1, 999, 2500, 2950]
  },
  professionals: {
    key: "professionals",
    name: "Advance AI for Professionals",
    sacCode: "999293",
    sheetName: "Sheet1",
    basePrice: 4999,
    price: 5899, // VIP Offer: ₹4,999 + 18% GST (₹900) = ₹5,899 Total
    validPrices: [1, 299, 2999, 3539, 4999, 5899, 6999, 8259, 9999, 11799]
  },
  upscale: {
    key: "upscale",
    name: "UPSCALE: 1-Day AI Mastery Workshop",
    sacCode: "999293",
    sheetName: "Sheet1",
    basePrice: 4999,
    price: 5899, // 1-Day In-Person Workshop: ₹4,999 + 18% GST (₹900) = ₹5,899 Total
    validPrices: [1, 299, 4999, 5899, 9999, 11799]
  }
};

// ----------------------------------------------------------------------------
// SCRIPT PROPERTIES & ENVIRONMENT ACCESSORS (FAIL-CLOSED)
// ----------------------------------------------------------------------------
function getScriptSecret(key) {
  var props = PropertiesService.getScriptProperties();
  var val = props ? props.getProperty(key) : "";
  if (!val || !String(val).trim()) {
    throw new Error("Missing required Script Property: " + key);
  }
  return String(val).trim();
}

function getOptionalScriptSecret(key) {
  try {
    var props = PropertiesService.getScriptProperties();
    return props ? String(props.getProperty(key) || "").trim() : "";
  } catch (e) {
    return "";
  }
}

/**
 * Validates that this project is strictly operating in staging mode.
 * Rejects missing environment, invalid strings, and unconditionally blocks "production".
 */
function getAppEnvironment() {
  var isNodeTestEnv = (typeof process !== "undefined" && Boolean(process.env) && process.env.NODE_ENV === "test");
  var envVal = String(getOptionalScriptSecret("APP_ENVIRONMENT") || getOptionalScriptSecret("ENVIRONMENT") || "").trim().toLowerCase();

  if (!envVal) {
    if (isNodeTestEnv) return "local_test";
    throw new Error("MISSING_ENVIRONMENT: APP_ENVIRONMENT must be explicitly configured as 'staging'.");
  }

  if (envVal === "staging") {
    return "staging";
  }

  if (isNodeTestEnv && envVal === "local_test") {
    return "local_test";
  }

  if (envVal === "production") {
    throw new Error("PRODUCTION_ENVIRONMENT_REJECTED: Staging project strictly prohibits 'production' environment setting.");
  }

  throw new Error("INVALID_ENVIRONMENT: Unknown environment '" + envVal + "'. Staging project requires APP_ENVIRONMENT='staging'.");
}

/**
 * Resolves the dedicated staging spreadsheet ID and fails closed if
 * missing or matching any known production spreadsheet.
 */
function getSpreadsheetId() {
  var configuredId = String(getOptionalScriptSecret("SPREADSHEET_ID") || "").trim();
  if (!configuredId) {
    throw new Error("MISSING_SPREADSHEET_ID: SPREADSHEET_ID must be configured in Script Properties for staging project.");
  }
  if (KNOWN_PRODUCTION_SPREADSHEET_IDS.indexOf(configuredId) !== -1) {
    throw new Error("PRODUCTION_SPREADSHEET_IN_STAGING: Production spreadsheet ID '" + configuredId + "' is strictly rejected in staging.");
  }
  return configuredId;
}

/**
 * Asserts that the provided spreadsheet instance is not a production sheet.
 */
function assertSpreadsheetIsolation(ss) {
  if (!ss) return;
  var sheetId = "";
  try {
    sheetId = ss.getId ? ss.getId() : "";
  } catch (e) {
    throw new Error("SPREADSHEET_ACCESS_ERROR: Failed to retrieve spreadsheet ID for isolation check: " + e.message);
  }
  if (!sheetId) {
    throw new Error("SPREADSHEET_ACCESS_ERROR: Empty spreadsheet ID encountered.");
  }
  if (KNOWN_PRODUCTION_SPREADSHEET_IDS.indexOf(sheetId) !== -1) {
    throw new Error("PRODUCTION_SPREADSHEET_IN_STAGING: Staging environment cannot write to production spreadsheet ID " + sheetId);
  }
}

/**
 * Opens and verifies the dedicated staging spreadsheet.
 */
function getStagingSpreadsheet() {
  var sheetId = getSpreadsheetId();
  try {
    var ss = SpreadsheetApp.openById(sheetId);
    assertSpreadsheetIsolation(ss);
    return ss;
  } catch (err) {
    throw new Error("SPREADSHEET_ACCESS_ERROR: Unable to open staging spreadsheet ID: " + err.message);
  }
}

/**
 * Enforces mock invoice adapter as mandatory in staging.
 * Fails closed if missing or set to false.
 */
function isMockInvoiceAdapterEnabled() {
  var explicit = String(getOptionalScriptSecret("MOCK_INVOICE_ADAPTER") || getOptionalScriptSecret("ENABLE_MOCK_INVOICE_ADAPTER") || "").trim().toLowerCase();
  if (explicit !== "true" && explicit !== "1") {
    throw new Error("MOCK_INVOICE_REQUIRED_IN_STAGING: MOCK_INVOICE_ADAPTER must be explicitly set to 'true' in staging.");
  }
  return true;
}

/**
 * Enforces customer notification suppression as mandatory in staging.
 * Fails closed if missing or set to false.
 */
function isNotificationSuppressed() {
  var explicit = String(getOptionalScriptSecret("SUPPRESS_NOTIFICATIONS") || "").trim().toLowerCase();
  if (explicit !== "true" && explicit !== "1") {
    throw new Error("NOTIFICATION_SUPPRESSION_REQUIRED_IN_STAGING: SUPPRESS_NOTIFICATIONS must be explicitly set to 'true' in staging.");
  }
  return true;
}

/**
 * Validates that configured Razorpay credentials are test credentials only.
 */
function getRazorpayKeyId(isIntl) {
  var secretKeyName = isIntl ? "RAZORPAY_KEY_ID_INTL" : "RAZORPAY_KEY_ID";
  var configuredKey = String(getOptionalScriptSecret(secretKeyName) || "").trim();
  if (!configuredKey) {
    throw new Error("MISSING_RAZORPAY_KEY_ID: " + secretKeyName + " is required in Script Properties.");
  }
  if (configuredKey.startsWith("rzp_live_")) {
    throw new Error("LIVE_CREDENTIALS_IN_STAGING: Live Razorpay key ID '" + configuredKey + "' cannot be used in staging.");
  }
  if (!configuredKey.startsWith("rzp_test_")) {
    throw new Error("INVALID_TEST_KEY_PREFIX: Test Razorpay key ID must start with 'rzp_test_'.");
  }
  return configuredKey;
}

/**
 * Validates FunnelsDone location ID isolation in staging.
 * Strictly prohibits the production location ID 'uUUUKRH7EP2A0oJBv4Zb'.
 */
function getFunnelsDoneLocationId() {
  var env = getAppEnvironment();
  var configuredLocation = getOptionalScriptSecret("FUNNELSDONE_LOCATION_ID");
  if (env === "staging") {
    if (configuredLocation === "uUUUKRH7EP2A0oJBv4Zb") {
      throw new Error("PRODUCTION_LOCATION_IN_STAGING: Production FunnelsDone location ID cannot be used in staging environment.");
    }
    return configuredLocation || "staging_location_mock";
  }
  return configuredLocation || "uUUUKRH7EP2A0oJBv4Zb";
}

/**
 * Validates WhatsApp phone number ID isolation in staging.
 * Strictly prohibits the production phone number ID '1089787377552637'.
 */
function getWhatsAppPhoneNumberId() {
  var env = getAppEnvironment();
  var configuredPhoneId = getOptionalScriptSecret("WHATSAPP_PHONE_NUMBER_ID");
  if (env === "staging") {
    if (configuredPhoneId === "1089787377552637") {
      throw new Error("PRODUCTION_PHONE_IN_STAGING: Production WhatsApp phone number ID cannot be used in staging environment.");
    }
    return configuredPhoneId || "staging_phone_mock";
  }
  return configuredPhoneId || "1089787377552637";
}

/**
 * Validates payment environment and rejects live markers in staging.
 */
function validatePaymentEnvironment(paymentEntity, isAuthoritativeServerData) {
  var env = getAppEnvironment();
  if (env !== "staging" && env !== "local_test") {
    throw new Error("UNVERIFIED_PAYMENT_MODE: Staging environment required to validate mode.");
  }

  if (!paymentEntity) {
    throw new Error("MISSING_PAYMENT_ENTITY: Payment entity is required for environment validation.");
  }

  var payId = String(paymentEntity.id || paymentEntity.payment_id || "").trim();

  // 1. Strict ID format check
  if (payId && !/^pay_[A-Za-z0-9_]+$/.test(payId)) {
    throw new Error("FAKE_PAYMENT_ID: Payment ID format is invalid.");
  }

  // 2. Reject live markers in staging
  if (payId.startsWith("pay_live_") || paymentEntity.is_test === false || (paymentEntity.notes && (paymentEntity.notes.mode === "live" || paymentEntity.notes.environment === "live" || paymentEntity.notes.environment === "production"))) {
    throw new Error("LIVE_PAYMENT_IN_STAGING: Live payment data cannot be processed in staging.");
  }

  // 3. Establish valid credential configuration (must start with rzp_test_)
  var configuredKeyId = getRazorpayKeyId(false);
  var configuredSecret = getScriptSecret("RAZORPAY_KEY_SECRET");
}

// ----------------------------------------------------------------------------
// CRYPTOGRAPHY & TIMING-SAFE VERIFICATION
// ----------------------------------------------------------------------------
function timingSafeEqualGas(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  if (a.length !== b.length) return false;
  var result = 0;
  for (var i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

function computeHmacSha256Gas(message, secret) {
  var signatureBytes = Utilities.computeHmacSha256Signature(
    message,
    secret,
    Utilities.Charset.UTF_8
  );
  return signatureBytes
    .map(function(byte) {
      return ("0" + (byte & 0xff).toString(16)).slice(-2);
    })
    .join("");
}

function computeSha256HashGas(message) {
  var digestBytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    message,
    Utilities.Charset.UTF_8
  );
  return digestBytes
    .map(function(byte) {
      return ("0" + (byte & 0xff).toString(16)).slice(-2);
    })
    .join("");
}

/**
 * Computes the canonical 8-field payload digest matching the proxy.
 * amount|currency|status|email|contact|method|accountId|canonicalNotes
 */
function computeCanonicalPayloadDigestGas(paymentEntity) {
  if (!paymentEntity || typeof paymentEntity !== "object") return "";
  var amount = paymentEntity.amount !== undefined ? String(paymentEntity.amount).trim() : "";
  var currency = paymentEntity.currency ? String(paymentEntity.currency).trim() : "";
  var status = paymentEntity.status ? String(paymentEntity.status).trim() : "";
  var email = paymentEntity.email ? String(paymentEntity.email).trim().toLowerCase() : "";
  var contact = paymentEntity.contact ? String(paymentEntity.contact).trim() : "";
  var method = paymentEntity.method ? String(paymentEntity.method).trim() : "";
  var accountId = (paymentEntity.account_id || paymentEntity.accountId || (paymentEntity.notes && paymentEntity.notes.account_id))
    ? String(paymentEntity.account_id || paymentEntity.accountId || paymentEntity.notes.account_id).trim()
    : "";

  var canonicalNotes = "";
  if (paymentEntity.notes && typeof paymentEntity.notes === "object") {
    var keys = Object.keys(paymentEntity.notes).sort();
    canonicalNotes = keys
      .map(function(k) {
        return k + "=" + String(paymentEntity.notes[k]).trim();
      })
      .join(",");
  }

  var canonicalString = amount + "|" + currency + "|" + status + "|" + email + "|" +
    contact + "|" + method + "|" + accountId + "|" + canonicalNotes;

  return computeSha256HashGas(canonicalString);
}

// ----------------------------------------------------------------------------
// AUDIT LOGGING & RESPONSE HELPERS
// ----------------------------------------------------------------------------
function sanitizeLogData(str) {
  if (!str) return "";
  var s = String(str);
  s = s.replace(/Basic\s+[A-Za-z0-9+/=]+/gi, "Basic [REDACTED]");
  s = s.replace(/rzp_(?:test|live)_[A-Za-z0-9]+/gi, "[REDACTED_RZP_KEY]");
  s = s.replace(/(?:key_secret|secret|proxy_secret|token_secret)["']?\s*[:=]\s*["']?[A-Za-z0-9+/=_\-]{8,}["']?/gi, "secret=[REDACTED]");
  s = s.replace(/[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/gi, "[REDACTED_EMAIL]");
  s = s.replace(/(?:\+?91[\-\s]?)?[6-9]\d{9}/g, "[REDACTED_PHONE]");
  return s.length > 500 ? s.substring(0, 500) + "...[TRUNCATED]" : s;
}

function writeToLogs(event, data) {
  try {
    var ss = getStagingSpreadsheet();
    var logSheet = ss.getSheetByName(SHEET_NAME_LOGS) || ss.insertSheet(SHEET_NAME_LOGS);
    logSheet.appendRow([new Date().toISOString(), event, sanitizeLogData(data)]);
  } catch (e) {
    Logger.log("LOG_WRITE_ERROR: " + sanitizeLogData(e.message));
  }
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON
  );
}

// ----------------------------------------------------------------------------
// READ-ONLY DIAGNOSTIC FUNCTION (TASK 9)
// ----------------------------------------------------------------------------
/**
 * Read-only health check that inspects environment, spreadsheet access, and required headers.
 * Guarantees zero row writes, zero invoice creation, zero customer notifications,
 * and zero secret or PII exposure.
 */
function runStagingDiagnostics() {
  var result = {
    status: "PASS",
    timestamp: new Date().toISOString(),
    checks: {},
    errorCodes: []
  };

  function failCheck(checkName, errorCode) {
    result.status = "FAIL";
    result.checks[checkName] = "FAIL";
    if (result.errorCodes.indexOf(errorCode) === -1) {
      result.errorCodes.push(errorCode);
    }
  }

  function passCheck(checkName) {
    if (!result.checks[checkName]) {
      result.checks[checkName] = "PASS";
    }
  }

  // 1. Environment Verification: Strictly requires APP_ENVIRONMENT="staging" (rejects local_test)
  try {
    var env = String(getOptionalScriptSecret("APP_ENVIRONMENT") || getOptionalScriptSecret("ENVIRONMENT") || "").trim().toLowerCase();
    if (env === "staging") {
      passCheck("environment");
    } else if (env === "production") {
      failCheck("environment", "PRODUCTION_ENVIRONMENT_REJECTED");
    } else if (!env) {
      failCheck("environment", "MISSING_APP_ENVIRONMENT");
    } else {
      failCheck("environment", "INVALID_ENVIRONMENT_FOR_STAGING");
    }
  } catch (e) {
    failCheck("environment", "INVALID_ENVIRONMENT_FOR_STAGING");
  }

  // 2. Mandatory Staging Flags Verification (Strict Boolean check)
  try {
    var mockEnabled = isMockInvoiceAdapterEnabled();
    if (mockEnabled === true) {
      passCheck("mockInvoiceAdapter");
    } else {
      failCheck("mockInvoiceAdapter", "MOCK_INVOICE_ADAPTER_REQUIRED");
    }
  } catch (e) {
    failCheck("mockInvoiceAdapter", "MOCK_INVOICE_ADAPTER_REQUIRED");
  }

  try {
    var notifSuppressed = isNotificationSuppressed();
    if (notifSuppressed === true) {
      passCheck("notificationSuppression");
    } else {
      failCheck("notificationSuppression", "SUPPRESS_NOTIFICATIONS_REQUIRED");
    }
  } catch (e) {
    failCheck("notificationSuppression", "SUPPRESS_NOTIFICATIONS_REQUIRED");
  }

  var strictProxy = String(getOptionalScriptSecret("STRICT_PROXY_MODE") || "").trim().toLowerCase();
  if (strictProxy !== "true" && strictProxy !== "1") {
    failCheck("strictProxyMode", "STRICT_PROXY_MODE_REQUIRED");
  } else {
    passCheck("strictProxyMode");
  }

  // 3. Secrets Sanity & Format Check (Zero values exposed)
  var proxySecret = getOptionalScriptSecret("WEBHOOK_PROXY_SECRET");
  if (!proxySecret || proxySecret.length < 16) {
    failCheck("proxySecret", "INVALID_OR_MISSING_PROXY_SECRET");
  } else {
    passCheck("proxySecret");
  }

  var invoiceSecret = getOptionalScriptSecret("INVOICE_TOKEN_SECRET");
  if (!invoiceSecret || invoiceSecret.length < 16) {
    failCheck("invoiceSecret", "INVALID_OR_MISSING_INVOICE_TOKEN_SECRET");
  } else {
    passCheck("invoiceSecret");
  }

  // 3b. Razorpay Primary Credentials Check (Strictly requires rzp_test_)
  var rzpKeyId = getOptionalScriptSecret("RAZORPAY_KEY_ID");
  if (!rzpKeyId) {
    failCheck("razorpayKey", "MISSING_RAZORPAY_KEY_ID");
  } else if (rzpKeyId.startsWith("rzp_live_")) {
    failCheck("razorpayKey", "LIVE_KEY_IN_STAGING_REJECTED");
  } else if (!rzpKeyId.startsWith("rzp_test_")) {
    failCheck("razorpayKey", "INVALID_OR_MISSING_TEST_KEY");
  } else {
    passCheck("razorpayKey");
  }

  var rzpSecret = getOptionalScriptSecret("RAZORPAY_KEY_SECRET");
  if (!rzpSecret || rzpSecret.length < 8) {
    failCheck("razorpaySecret", "INVALID_OR_MISSING_RAZORPAY_SECRET");
  } else {
    passCheck("razorpaySecret");
  }

  // 3c. Razorpay International Credentials Check (Strictly requires rzp_test_)
  var rzpIntlKey = getOptionalScriptSecret("RAZORPAY_KEY_ID_INTL");
  if (!rzpIntlKey) {
    failCheck("razorpayIntlKey", "MISSING_RAZORPAY_KEY_ID_INTL");
  } else if (rzpIntlKey.startsWith("rzp_live_")) {
    failCheck("razorpayIntlKey", "LIVE_KEY_IN_STAGING_REJECTED");
  } else if (!rzpIntlKey.startsWith("rzp_test_")) {
    failCheck("razorpayIntlKey", "INVALID_OR_MISSING_TEST_KEY");
  } else {
    passCheck("razorpayIntlKey");
  }

  var rzpIntlSecret = getOptionalScriptSecret("RAZORPAY_KEY_SECRET_INTL") || rzpSecret;
  if (!rzpIntlSecret || rzpIntlSecret.length < 8) {
    failCheck("razorpayIntlSecret", "INVALID_OR_MISSING_RAZORPAY_SECRET_INTL");
  } else {
    passCheck("razorpayIntlSecret");
  }

  // 4. Spreadsheet Isolation & Access Check (Read-Only)
  var ss = null;
  try {
    var sheetId = getSpreadsheetId();
    if (KNOWN_PRODUCTION_SPREADSHEET_IDS.indexOf(sheetId) !== -1) {
      failCheck("spreadsheetIsolation", "PRODUCTION_SPREADSHEET_REJECTED");
    } else {
      passCheck("spreadsheetIsolation");
      ss = SpreadsheetApp.openById(sheetId);
      passCheck("spreadsheetAccess");
    }
  } catch (e) {
    if (e.message && e.message.indexOf("PRODUCTION_SPREADSHEET") !== -1) {
      failCheck("spreadsheetIsolation", "PRODUCTION_SPREADSHEET_REJECTED");
    } else if (e.message && e.message.indexOf("MISSING_SPREADSHEET_ID") !== -1) {
      failCheck("spreadsheetIsolation", "MISSING_SPREADSHEET_ID");
    } else {
      failCheck("spreadsheetAccess", "SPREADSHEET_OPEN_FAILED");
    }
  }

  // 5. Sheet Tabs and Headers Check (Read-Only: Verifies Exact Header and Expected Column Order)
  if (ss) {
    try {
      var sheet1 = ss.getSheetByName(SHEET_NAME_DEFAULT_REG);
      if (!sheet1) {
        failCheck("sheetHeaders", "MISSING_SHEET1_TAB");
      } else {
        var numCols1 = Math.max(sheet1.getLastColumn(), 1);
        var headers1 = sheet1.getRange(1, 1, 1, numCols1).getValues()[0];
        if (headers1.length < REQUIRED_SHEET1_HEADERS.length) {
          failCheck("sheetHeaders", "INVALID_SHEET1_HEADERS");
        } else {
          var mismatch1 = false;
          for (var h1 = 0; h1 < REQUIRED_SHEET1_HEADERS.length; h1++) {
            var actualH1 = normalizeDiagnosticHeader(headers1[h1]);
            var expectedH1 = REQUIRED_SHEET1_HEADERS[h1];
            if (actualH1 !== expectedH1) {
              mismatch1 = true;
              break;
            }
          }
          if (mismatch1) {
            failCheck("sheetHeaders", "INVALID_SHEET1_HEADERS");
          } else {
            passCheck("sheetHeaders");
          }
        }
      }

      var gstSheet = ss.getSheetByName(SHEET_NAME_GST);
      if (!gstSheet) {
        failCheck("gstHeaders", "MISSING_GST_SALES_REGISTER_TAB");
      } else {
        var numColsGst = Math.max(gstSheet.getLastColumn(), 1);
        var gstHeaders = gstSheet.getRange(1, 1, 1, numColsGst).getValues()[0];
        if (gstHeaders.length < REQUIRED_GST_HEADERS.length) {
          failCheck("gstHeaders", "INVALID_GST_HEADERS");
        } else {
          var mismatchGst = false;
          for (var hg = 0; hg < REQUIRED_GST_HEADERS.length; hg++) {
            var actualHg = normalizeDiagnosticHeader(gstHeaders[hg]);
            var expectedHg = REQUIRED_GST_HEADERS[hg];
            if (actualHg !== expectedHg) {
              mismatchGst = true;
              break;
            }
          }
          if (mismatchGst) {
            failCheck("gstHeaders", "INVALID_GST_HEADERS");
          } else {
            passCheck("gstHeaders");
          }
        }
      }

      var logSheet = ss.getSheetByName(SHEET_NAME_LOGS);
      if (!logSheet) {
        failCheck("logsTab", "MISSING_LOGS_TAB");
      } else {
        var numColsLog = Math.max(logSheet.getLastColumn(), 1);
        var headersLog = logSheet.getRange(1, 1, 1, numColsLog).getValues()[0];
        if (headersLog.length < REQUIRED_LOGS_HEADERS.length) {
          failCheck("logsTab", "INVALID_LOGS_HEADERS");
        } else {
          var mismatchLog = false;
          for (var hl = 0; hl < REQUIRED_LOGS_HEADERS.length; hl++) {
            var actualHl = normalizeDiagnosticHeader(headersLog[hl]);
            var expectedHl = REQUIRED_LOGS_HEADERS[hl];
            if (actualHl !== expectedHl) {
              mismatchLog = true;
              break;
            }
          }
          if (mismatchLog) {
            failCheck("logsTab", "INVALID_LOGS_HEADERS");
          } else {
            passCheck("logsTab");
          }
        }
      }
    } catch (e) {
      failCheck("sheetHeaders", "HEADER_READ_FAILED");
    }
  }

  // Final status consolidation: PASS only if every check is PASS and no errorCodes
  var allChecksPassed = true;
  for (var k in result.checks) {
    if (result.checks[k] !== "PASS") {
      allChecksPassed = false;
      break;
    }
  }
  if (!allChecksPassed || result.errorCodes.length > 0) {
    result.status = "FAIL";
  } else {
    result.status = "PASS";
  }

  console.log(JSON.stringify(result, null, 2));
  return result;
}

function normalizeDiagnosticHeader(h) {
  return String(h || "").trim().toLowerCase().replace(/\s*\([^)]*\)/g, "").replace(/\s+/g, " ");
}

// ----------------------------------------------------------------------------
// TRUSTED ORDER & PRODUCT BINDING (PHASE 1T REQUIREMENT 2 & 3)
// ----------------------------------------------------------------------------
/**
 * Authoritatively resolves and verifies the product binding and expected amount for an order.
 * Fails closed if the spreadsheet cannot be read, if the requested product conflicts with
 * registered order data, or if neither Sheet1 nor server order metadata establishes the product.
 */
function resolveTrustedOrderBinding(ss, orderId, requestedProductKey, serverPayment, isClientCallback) {
  var cleanOrderId = String(orderId || "").trim();
  if (!cleanOrderId) {
    throw new Error("MISSING_ORDER_ID: Order ID is required for order binding.");
  }
  if (!/^order_[A-Za-z0-9_]+$/.test(cleanOrderId)) {
    throw new Error("INVALID_ORDER_ID: Order ID format is invalid.");
  }

  var registeredProduct = "";
  var registeredAmountInr = 0;
  var isRegisteredOrder = false;

  if (ss) {
    var regSheet = null;
    try {
      regSheet = ss.getSheetByName(SHEET_NAME_DEFAULT_REG) || ss.getSheets()[0];
    } catch (sheetErr) {
      writeToLogs("SPREADSHEET_ACCESS_ERROR", "Failed to access registration sheet: " + sheetErr.message);
      throw new Error("SPREADSHEET_READ_FAILED: Unable to access registration sheet: " + sheetErr.message);
    }

    if (regSheet) {
      var rows = null;
      try {
        rows = regSheet.getDataRange().getValues();
      } catch (dataErr) {
        writeToLogs("SPREADSHEET_READ_ERROR", "Failed to read registration data: " + dataErr.message);
        throw new Error("SPREADSHEET_READ_FAILED: Unable to read registration records from staging spreadsheet.");
      }

      if (rows && rows.length > 0) {
        // Dynamic column layout discovery
        var headers = rows[0] || [];
        var colMap = {};
        for (var h = 0; h < headers.length; h++) {
          var normH = normalizeDiagnosticHeader(headers[h]);
          colMap[normH] = h;
        }

        var orderIdCol = colMap["order id"];
        var courseCol = colMap["course"] !== undefined ? colMap["course"] : colMap["target product"];
        var amountCol = colMap["amount"] !== undefined ? colMap["amount"] : colMap["amount paid"];
        var statusCol = colMap["payment status"];
        var paymentIdCol = colMap["payment id"];

        if (orderIdCol === undefined || courseCol === undefined || amountCol === undefined) {
          throw new Error("INVALID_SHEET1_LAYOUT: Required column headers missing in Sheet1 (needs order id, course, amount).");
        }

        var matchingRows = [];
        for (var i = 1; i < rows.length; i++) {
          var rowOrderId = String(rows[i][orderIdCol] || "").trim();
          if (rowOrderId === cleanOrderId) {
            matchingRows.push({
              rowIdx: i + 1,
              product: String(rows[i][courseCol] || "").trim(),
              amount: Number(rows[i][amountCol]) || 0,
              status: statusCol !== undefined ? String(rows[i][statusCol] || "").trim() : "",
              paymentId: paymentIdCol !== undefined ? String(rows[i][paymentIdCol] || "").trim() : ""
            });
          }
        }

        if (matchingRows.length > 0) {
          // Check for duplicate / conflicting records across matching rows
          var firstMatch = matchingRows[0];
          for (var m = 1; m < matchingRows.length; m++) {
            if (matchingRows[m].product !== firstMatch.product || matchingRows[m].amount !== firstMatch.amount) {
              writeToLogs("SECURITY_ALERT", "Conflicting rows in Sheet1 for order " + cleanOrderId);
              throw new Error("CONFLICTING_ORDER_RECORDS: Multiple conflicting registration records found for order " + cleanOrderId + ".");
            }
          }
          isRegisteredOrder = true;
          registeredProduct = firstMatch.product;
          registeredAmountInr = firstMatch.amount;
        }
      }
    }
  }

  // 1. If pre-registered in Sheet1:
  if (isRegisteredOrder) {
    if (!registeredProduct || !STAGING_PRODUCT_CATALOG[registeredProduct]) {
      throw new Error("UNKNOWN_PRODUCT_KEY: Registered order product '" + registeredProduct + "' is not recognized in catalog.");
    }
    if (registeredAmountInr <= 0 || isNaN(registeredAmountInr)) {
      throw new Error("MALFORMED_ORDER_RECORD: Invalid amount (" + registeredAmountInr + ") in registration record for order " + cleanOrderId + ".");
    }
    // Browser or webhook supplied product key MUST match the registered order product
    if (requestedProductKey && String(requestedProductKey).trim() !== registeredProduct) {
      throw new Error("PRODUCT_ORDER_MISMATCH: Requested product '" + requestedProductKey + "' conflicts with registered order product '" + registeredProduct + "'.");
    }
    // Authenticated payment notes check: If serverPayment has notes, client-controlled notes MUST NOT conflict with registered product!
    if (serverPayment && serverPayment.notes && typeof serverPayment.notes === "object") {
      var noteProduct = String(serverPayment.notes.product_key || serverPayment.notes.target_product || serverPayment.notes.course || "").trim();
      if (noteProduct && noteProduct !== registeredProduct) {
        writeToLogs("SECURITY_ALERT", "Client-controlled payment notes ('" + noteProduct + "') conflict with Sheet1 ('" + registeredProduct + "')");
        throw new Error("PRODUCT_ORDER_MISMATCH: Payment metadata product '" + noteProduct + "' conflicts with registered order product '" + registeredProduct + "'.");
      }
    }
    var catalogItem = STAGING_PRODUCT_CATALOG[registeredProduct];
    var expectedAmountInr = registeredAmountInr > 0 ? registeredAmountInr : catalogItem.price;
    return {
      productKey: registeredProduct,
      catalogItem: catalogItem,
      expectedAmountInr: expectedAmountInr,
      source: "SHEET_REGISTRATION"
    };
  }

  // 2. If NOT pre-registered in Sheet1, check server order metadata (Phase 1T / 1U)
  var serverProduct = "";
  if (serverPayment && serverPayment.notes && typeof serverPayment.notes === "object") {
    serverProduct = String(serverPayment.notes.product_key || serverPayment.notes.target_product || serverPayment.notes.course || "").trim();
  }

  if (serverProduct && STAGING_PRODUCT_CATALOG[serverProduct]) {
    if (requestedProductKey && String(requestedProductKey).trim() !== serverProduct) {
      throw new Error("PRODUCT_ORDER_MISMATCH: Requested product '" + requestedProductKey + "' conflicts with server-verified order product '" + serverProduct + "'.");
    }
    var serverCatalogItem = STAGING_PRODUCT_CATALOG[serverProduct];
    var expectedAmountInr = serverCatalogItem.price;
    if (serverPayment && serverPayment.amount) {
      var serverPaidInr = Math.round(parseInt(serverPayment.amount, 10) / 100);
      if (serverCatalogItem.validPrices && serverCatalogItem.validPrices.indexOf(serverPaidInr) !== -1) {
        expectedAmountInr = serverPaidInr;
      }
    }
    return {
      productKey: serverProduct,
      catalogItem: serverCatalogItem,
      expectedAmountInr: expectedAmountInr,
      source: "SERVER_METADATA"
    };
  }

  // 3. Fail closed: Unbound order cannot use catalog fallback based solely on untrusted request parameter
  throw new Error("UNBOUND_ORDER_PRODUCT: Order " + cleanOrderId + " has no trusted product binding in registration records or server metadata.");
}

// ----------------------------------------------------------------------------
// INVOICING & GST SALES REGISTER (STAGING MOCK ADAPTER)
// ----------------------------------------------------------------------------
/**
 * Generates an isolated staging invoice with STAGE-INV- prefix.
 * Makes zero external calls to LeadConnector or FunnelsDone API.
 */
function createStagingMockInvoice(paymentId, orderId, productKey) {
  isMockInvoiceAdapterEnabled();
  var props = PropertiesService.getScriptProperties();

  // Safe retry recovery: check if a pending invoice was already generated for this payment (Requirement 4)
  var pendingInv = props.getProperty("PENDING_INV_" + paymentId);
  if (pendingInv) {
    writeToLogs("MOCK_INVOICE_REUSED", "Reusing pending invoice " + pendingInv + " for payment " + paymentId);
    return pendingInv;
  }

  var counterKey = "STAGING_INVOICE_COUNTER";
  var currentCount = parseInt(props.getProperty(counterKey) || "1000", 10);
  var nextCount = currentCount + 1;
  props.setProperty(counterKey, String(nextCount));

  var invoiceNumber = "STAGE-INV-" + nextCount;
  props.setProperty("PENDING_INV_" + paymentId, invoiceNumber);
  writeToLogs("MOCK_INVOICE_GENERATED", "Generated " + invoiceNumber + " for " + paymentId);
  return invoiceNumber;
}

/**
 * Appends transaction to GST Sales Register preserving 18% inclusive GST mathematics.
 * Guarantees idempotency on retries by verifying payment has not already been appended.
 */
function appendToStagingGstSalesRegister(ss, paymentEntity, invoiceNumber, productKey) {
  assertSpreadsheetIsolation(ss);
  var gstSheet = ss.getSheetByName(SHEET_NAME_GST) || ss.insertSheet(SHEET_NAME_GST);

  var cleanPayId = String(paymentEntity.id || "").trim();
  var cleanOrdId = String(paymentEntity.order_id || "").trim();

  // Deduplication check: Do not write duplicate row if retry occurs
  var gRows = null;
  try {
    gRows = gstSheet.getDataRange().getValues();
  } catch (gstReadErr) {
    throw new Error("SPREADSHEET_READ_FAILED: Unable to inspect GST Sales Register for deduplication: " + gstReadErr.message);
  }

  if (gRows && gRows.length > 1) {
    for (var gi = 1; gi < gRows.length; gi++) {
      var existingPay = String(gRows[gi][18] || "").trim().replace(/^'/, "");
      var existingOrd = String(gRows[gi][19] || "").trim();
      if (existingPay === cleanPayId && existingOrd === cleanOrdId) {
        writeToLogs("GST_ROW_EXISTS", "Payment " + cleanPayId + " already recorded in GST register (Row " + (gi + 1) + "). Skipping duplicate append.");
        return;
      }
    }
  }

  var grossAmount = (Number(paymentEntity.amount) || 0) / 100;
  var baseAmount = Math.round((grossAmount / 1.18) * 100) / 100;
  var totalGst = Math.round((grossAmount - baseAmount) * 100) / 100;
  var cgst = Math.round((totalGst / 2) * 100) / 100;
  var sgst = Math.round((totalGst - cgst) * 100) / 100;

  var catalogItem = STAGING_PRODUCT_CATALOG[productKey] || {
    name: productKey,
    sacCode: "999293"
  };

  gstSheet.appendRow([
    new Date().toISOString(),
    invoiceNumber,
    new Date().toLocaleDateString("en-IN"),
    (paymentEntity.notes && paymentEntity.notes.customer_name) || "Staging Student",
    paymentEntity.email || "",
    paymentEntity.contact || "",
    "Tamil Nadu (33)",
    "B2C",
    "No",
    catalogItem.sacCode,
    catalogItem.name,
    baseAmount,
    "9%",
    cgst,
    "9%",
    sgst,
    0,
    grossAmount,
    cleanPayId,
    cleanOrdId
  ]);
}

// ----------------------------------------------------------------------------
// CORE WEBHOOK PROCESSING (POST)
// ----------------------------------------------------------------------------
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
  } catch (lockErr) {
    return createJsonResponse({
      success: false,
      status: 503,
      error: "SERVER_BUSY: Lock acquisition timeout. Retry later."
    });
  }

  try {
    // 1. Validate Environment & Staging Spreadsheet
    getAppEnvironment();
    var ss = getStagingSpreadsheet();
    assertSpreadsheetIsolation(ss);

    // 2. Parse Incoming Payload
    var body = null;
    try {
      body = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return createJsonResponse({
        success: false,
        status: 400,
        error: "MALFORMED_JSON: Request body is not valid JSON."
      });
    }

    // Direct Client Payment Callback Route (Task 8: Do not trust unverified client flags)
    if (body.action === "updatePaymentStatus" || body.action === "clientPaymentCallback") {
      return handleClientPaymentCallback(ss, body);
    }

    // Invoice Retrieval Route (Task 4: Token-authorized invoice fetching)
    if (body.action === "getVerifiedInvoice") {
      return createJsonResponse(getVerifiedInvoiceRecord(ss, body.paymentId, body.orderId, body.token, body.email || body.phone || body.contact));
    }

    // Central Webhook Proxy Forwarding Route
    return handleProxyWebhook(ss, body);

  } catch (err) {
    writeToLogs("STAGING_POST_ERROR", err.message);
    return createJsonResponse({
      success: false,
      status: 500,
      error: err.message
    });
  } finally {
    try {
      lock.releaseLock();
    } catch (e) {}
  }
}

/**
 * Handles incoming authenticated v2.1 proxy webhooks.
 */
function handleProxyWebhook(ss, body) {
  var props = PropertiesService.getScriptProperties();

  // 1. Strict Protocol Downgrade Rejection
  var proxyVersion = String(body.proxy_version || "").trim();
  if (!proxyVersion) {
    throw new Error("MISSING_PROTOCOL_VERSION: proxy_version is mandatory.");
  }
  if (proxyVersion !== REQUIRED_PROXY_VERSION) {
    throw new Error("PROTOCOL_DOWNGRADE_REJECTED: Proxy version must be 'v2.1'.");
  }

  // 2. Timestamp Freshness Check (5-minute tolerance)
  var timestamp = Number(body.timestamp) || 0;
  var now = Date.now();
  if (Math.abs(now - timestamp) > 300000) {
    throw new Error("TIMESTAMP_DRIFT_EXCEEDED: Webhook timestamp drifted by > 5 minutes.");
  }

  // 3. Extract operational identifiers & Validate Product Catalog (Requirement 3)
  var eventId = String(body.eventId || body.event_id || "").trim();
  var eventType = String(body.event || "payment.captured").trim();
  var targetProduct = String(body.target_product || "").trim();
  if (!targetProduct || !STAGING_PRODUCT_CATALOG[targetProduct]) {
    throw new Error("UNKNOWN_PRODUCT_KEY: Product key '" + targetProduct + "' is not recognized in the 8-product staging catalog.");
  }
  var catalogItem = STAGING_PRODUCT_CATALOG[targetProduct];
  var payloadDigest = String(body.payload_digest || "").trim();
  var proxySignature = String(body.proxy_signature || "").trim().toLowerCase();

  // 4. Replay Prevention & Event Idempotency
  if (eventId && props.getProperty("PROCESSED_EVT_" + eventId)) {
    writeToLogs("DUPLICATE_EVENT_SKIPPED", "Event ID " + eventId + " already processed.");
    return createJsonResponse({
      success: true,
      status: 200,
      alreadyProcessed: true,
      duplicate: true,
      message: "DUPLICATE_EVENT_SKIPPED"
    });
  }

  // 5. Payment Entity Extraction & Mode Validation
  var paymentEntity = body.payload && body.payload.payment && body.payload.payment.entity;
  if (!paymentEntity || !paymentEntity.id || !paymentEntity.order_id) {
    throw new Error("MISSING_PAYMENT_ENTITY: Webhook payload missing valid payment entity.");
  }

  validatePaymentEnvironment(paymentEntity, false);

  var paymentId = String(paymentEntity.id).trim();
  var orderId = String(paymentEntity.order_id).trim();

  // 6. Canonical 8-Field Digest Verification
  var computedDigest = computeCanonicalPayloadDigestGas(paymentEntity);
  if (!timingSafeEqualGas(computedDigest, payloadDigest)) {
    throw new Error("PAYLOAD_DIGEST_MISMATCH: Computed payload digest does not match proxy payload_digest.");
  }

  // 7. Hardened 12-Tuple Proxy Signature Verification
  var proxySecret = getScriptSecret("WEBHOOK_PROXY_SECRET");
  var accountId = paymentEntity.account_id || (paymentEntity.notes && paymentEntity.notes.account_id) || "";
  var sigTuple = "v2|" + eventId + "|" + eventType + "|" + orderId + "|" + paymentId + "|" +
    timestamp + "|" + targetProduct + "|" + paymentEntity.amount + "|" + paymentEntity.currency + "|" +
    paymentEntity.status + "|" + accountId + "|" + payloadDigest;

  var expectedSignature = computeHmacSha256Gas(sigTuple, proxySecret);
  if (!timingSafeEqualGas(expectedSignature, proxySignature)) {
    throw new Error("INVALID_WEBHOOK_SIGNATURE: Proxy signature verification failed.");
  }

  // 7b. Authoritative Razorpay Server Verification & Trusted Order Binding (Phase 1T Requirements 1, 2, 3, 4)
  // Safely derive international routing without trusting unverified request flags
  var isIntlRoute = false;
  if (body.isIntl === true) {
    var configuredIntlKey = getOptionalScriptSecret("RAZORPAY_KEY_ID_INTL");
    if (configuredIntlKey && (configuredIntlKey.startsWith("rzp_live_") || configuredIntlKey.startsWith("rzp_test_"))) {
      isIntlRoute = true;
    } else {
      writeToLogs("ROUTING_WARNING", "Untrusted or unconfigured international routing flag ignored; using primary staging credentials.");
    }
  }

  // Pre-fetch authoritative server payment to inspect status, currency, and notes
  var serverVerifiedPayment = verifyPaymentWithRazorpayServer(orderId, paymentId, 0, isIntlRoute);
  validatePaymentEnvironment(serverVerifiedPayment, true);

  // Authoritatively bind order to product and expected amount
  var orderBinding = resolveTrustedOrderBinding(ss, orderId, targetProduct, serverVerifiedPayment);
  var expectedPaise = Math.round(orderBinding.expectedAmountInr * 100);
  var actualPaise = parseInt(serverVerifiedPayment.amount, 10);
  if (isNaN(actualPaise) || actualPaise !== expectedPaise) {
    throw new Error("AMOUNT_MISMATCH: Razorpay amount (" + serverVerifiedPayment.amount + " paise) does not match expected order amount (" + expectedPaise + " paise).");
  }

  // 8. Payment Deduplication / Cached Invoice Fast-Path (Requirement 7)
  var cachedInvoiceStr = props.getProperty("VERIFIED_INV_" + paymentId);
  if (cachedInvoiceStr) {
    var cachedInv = null;
    try {
      cachedInv = JSON.parse(cachedInvoiceStr);
    } catch (e) {
      cachedInv = { invoiceNumber: cachedInvoiceStr, orderId: orderId };
    }
    if (cachedInv && cachedInv.orderId && cachedInv.orderId !== orderId) {
      throw new Error("ORDER_MISMATCH: Payment ID " + paymentId + " is already cached for order " + cachedInv.orderId);
    }
    var invoiceNumber = (cachedInv && cachedInv.invoiceNumber) || cachedInvoiceStr;
    writeToLogs("PAYMENT_ALREADY_RESOLVED", "Payment " + paymentId + " already has invoice " + invoiceNumber);
    return createJsonResponse({
      success: true,
      status: 200,
      alreadyProcessed: true,
      invoiceNumber: invoiceNumber
    });
  }

  // 9. Generate Staging Mock Invoice
  var invoiceNumber = createStagingMockInvoice(paymentId, orderId, targetProduct);

  // 10. Customer Notifications (100% Suppressed in Staging)
  isNotificationSuppressed();
  var notificationsSuppressed = true;
  writeToLogs("STAGING_NOTIFICATIONS_SUPPRESSED", "WhatsApp & email suppressed for " + paymentId);

  // 11. Append / Update Registration Sheet
  var regSheet = ss.getSheetByName(SHEET_NAME_DEFAULT_REG) || ss.getSheets()[0];
  var data = regSheet.getDataRange().getValues();
  var matchedRow = -1;

  for (var i = 1; i < data.length; i++) {
    if (data[i][8] === orderId || data[i][9] === paymentId) {
      matchedRow = i + 1;
      break;
    }
  }

  if (matchedRow > -1) {
    regSheet.getRange(matchedRow, 8).setValue("✅ PAID");
    regSheet.getRange(matchedRow, 10).setValue(paymentId);
    regSheet.getRange(matchedRow, 11).setValue("SUPPRESSED");
    regSheet.getRange(matchedRow, 12).setValue("SUPPRESSED");
  } else {
    // Webhook pure fulfillment (Scenario 7)
    var customerName = (paymentEntity.notes && paymentEntity.notes.customer_name) || "Staging Student";
    regSheet.appendRow([
      new Date().toISOString(),
      customerName,
      paymentEntity.email || "",
      paymentEntity.contact || "",
      targetProduct,
      "Developer",
      (Number(paymentEntity.amount) || 0) / 100,
      "✅ PAID",
      orderId,
      paymentId,
      "SUPPRESSED",
      "SUPPRESSED"
    ]);
  }

  // 12. Record to GST Sales Register
  appendToStagingGstSalesRegister(ss, paymentEntity, invoiceNumber, targetProduct);

  // 13. Persist State & Anti-Replay Tokens ONLY AFTER all fulfillment operations succeed (Requirement 8 & 7)
  if (eventId) {
    props.setProperty("PROCESSED_EVT_" + eventId, JSON.stringify({
      paymentId: paymentId,
      payloadDigest: computedDigest
    }));
  }
  var invRecord = {
    verified: true,
    status: "PAID",
    paymentId: paymentId,
    orderId: orderId,
    invoiceNumber: invoiceNumber,
    targetProduct: targetProduct,
    invoiceDate: Utilities.formatDate(new Date(), "Asia/Kolkata", "dd MMM yyyy"),
    timestamp: new Date().toISOString()
  };
  props.setProperty("VERIFIED_INV_" + paymentId, JSON.stringify(invRecord));
  props.setProperty("INVOICE_STATE_" + paymentId, "RESOLVED");
  props.deleteProperty("PENDING_INV_" + paymentId);

  writeToLogs("STAGING_PAYMENT_SUCCESS", "Successfully processed " + paymentId + " (" + targetProduct + ") -> " + invoiceNumber);

  return createJsonResponse({
    success: true,
    status: 200,
    invoiceNumber: invoiceNumber,
    paymentId: paymentId,
    orderId: orderId,
    targetProduct: targetProduct,
    notificationsSuppressed: notificationsSuppressed
  });
}

/**
 * Handles client-side direct payment callback requests.
 * Strictly verifies Razorpay HMAC signature and rejects unverified client flags (Task 8).
 */
function handleClientPaymentCallback(ss, data) {
  var orderId = String(data.razorpay_order_id || data.orderId || "").trim();
  var paymentId = String(data.razorpay_payment_id || data.paymentId || "").trim();
  var signature = String(data.razorpay_signature || data.signature || "").trim().toLowerCase();

  if (!orderId || !paymentId || !signature) {
    return createJsonResponse({
      success: false,
      status: 400,
      error: "MISSING_CALLBACK_PARAMS: razorpay_order_id, razorpay_payment_id, and razorpay_signature are required."
    });
  }

  if (!/^order_[A-Za-z0-9_]+$/.test(orderId)) {
    return createJsonResponse({
      success: false,
      status: 400,
      error: "INVALID_ORDER_ID: Order ID format is invalid."
    });
  }

  if (!/^pay_[A-Za-z0-9_]+$/.test(paymentId)) {
    return createJsonResponse({
      success: false,
      status: 400,
      error: "FAKE_PAYMENT_ID: Payment ID format is invalid."
    });
  }

  // Pre-validate that client notes/identifiers do not indicate live mode
  try {
    validatePaymentEnvironment({ id: paymentId, notes: data.notes || {} }, false);
  } catch (envErr) {
    writeToLogs("SECURITY_ALERT", envErr.message);
    return createJsonResponse({
      success: false,
      status: 400,
      error: envErr.message
    });
  }

  // 1. Cryptographic verification of client signature
  var rzpSecret = getScriptSecret("RAZORPAY_KEY_SECRET");
  var payload = orderId + "|" + paymentId;
  var expectedSig = computeHmacSha256Gas(payload, rzpSecret);

  if (!timingSafeEqualGas(expectedSig, signature)) {
    writeToLogs("SECURITY_ALERT", "INVALID_CLIENT_PAYMENT_SIGNATURE for order: " + orderId);
    return createJsonResponse({
      success: false,
      status: 401,
      error: "UNAUTHORIZED_PAYMENT_CALLBACK: Invalid Razorpay payment signature."
    });
  }

  // 2. Derive international routing safely without trusting unverified client flags
  var isIntlRoute = false;
  if (data.isIntl === true) {
    var configuredIntlKey = getOptionalScriptSecret("RAZORPAY_KEY_ID_INTL");
    if (configuredIntlKey && (configuredIntlKey.startsWith("rzp_live_") || configuredIntlKey.startsWith("rzp_test_"))) {
      isIntlRoute = true;
    } else {
      writeToLogs("ROUTING_WARNING", "Untrusted or unconfigured international routing flag ignored; using primary staging credentials.");
    }
  }

  // 3. Authoritative Razorpay Server Verification
  var serverPayment = null;
  try {
    serverPayment = verifyPaymentWithRazorpayServer(orderId, paymentId, 0, isIntlRoute);
    validatePaymentEnvironment(serverPayment, true);
  } catch (verifyErr) {
    writeToLogs("AUTHORITATIVE_VERIFICATION_FAILED", verifyErr.message);
    return createJsonResponse({
      success: false,
      status: 400,
      error: "PAYMENT_VERIFICATION_FAILED: " + verifyErr.message
    });
  }

  // 4. Authoritatively bind order to product and expected amount (Phase 1T Requirement 2 & 3)
  var orderBinding = null;
  try {
    orderBinding = resolveTrustedOrderBinding(ss, orderId, data.productKey || data.target_product || data.courseKey, serverPayment, true);
  } catch (bindingErr) {
    writeToLogs("ORDER_BINDING_FAILED", bindingErr.message);
    return createJsonResponse({
      success: false,
      status: 400,
      error: bindingErr.message
    });
  }

  // 5. Verify integer paise amount
  var expectedPaise = Math.round(orderBinding.expectedAmountInr * 100);
  var actualPaise = parseInt(serverPayment.amount, 10);
  if (isNaN(actualPaise) || actualPaise !== expectedPaise) {
    writeToLogs("AMOUNT_MISMATCH", "Expected " + expectedPaise + " paise, got " + serverPayment.amount);
    return createJsonResponse({
      success: false,
      status: 400,
      error: "AMOUNT_MISMATCH: Razorpay amount (" + serverPayment.amount + " paise) does not match expected order amount (" + expectedPaise + " paise)."
    });
  }

  // 4. Generate cryptographically signed invoice token ONLY AFTER authoritative verification succeeds
  var invoiceSecret = getScriptSecret("INVOICE_TOKEN_SECRET");
  var exp = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
  var tokenSig = computeHmacSha256Gas(paymentId + "|" + orderId + "|" + exp, invoiceSecret);
  var invoiceToken = exp + "." + tokenSig;

  return createJsonResponse({
    success: true,
    status: 200,
    verified: true,
    invoiceToken: invoiceToken
  });
}

/**
 * Authoritatively verifies payment against Razorpay Payments API (Server-to-Server).
 * Validates:
 * 1. paymentId and orderId pattern format
 * 2. Razorpay API response status === 200
 * 3. payment.id === cleanPaymentId
 * 4. payment.order_id === cleanOrderId (authoritative order ID relationship)
 * 5. payment.status === "captured" (authoritative payment status)
 * 6. payment.currency === "INR" (authoritative currency)
 * 7. payment.amount === expectedPaise (authoritative amount)
 */
function verifyPaymentWithRazorpayServer(orderId, paymentId, expectedAmountInr, isIntl) {
  var cleanOrderId = String(orderId || "").trim();
  var cleanPaymentId = String(paymentId || "").trim();
  if (!/^order_[A-Za-z0-9_]+$/.test(cleanOrderId)) {
    throw new Error("INVALID_ORDER_ID: Order ID format is invalid.");
  }
  if (!/^pay_[A-Za-z0-9_]+$/.test(cleanPaymentId)) {
    throw new Error("FAKE_PAYMENT_ID: Payment ID format is invalid.");
  }

  // Derive payment route from trusted server configuration; do not allow untrusted request flags to force credential switching
  var useIntlCredentials = false;
  if (isIntl === true) {
    var intlKey = getOptionalScriptSecret("RAZORPAY_KEY_ID_INTL");
    if (intlKey && (intlKey.startsWith("rzp_live_") || intlKey.startsWith("rzp_test_"))) {
      useIntlCredentials = true;
    } else {
      writeToLogs("ROUTING_WARNING", "International test credentials not configured; defaulting to primary staging credentials.");
    }
  }

  var keyId = useIntlCredentials ? getRazorpayKeyId(true) : getRazorpayKeyId(false);
  var keySecret = getScriptSecret(useIntlCredentials ? "RAZORPAY_KEY_SECRET_INTL" : "RAZORPAY_KEY_SECRET");
  var credentials = Utilities.base64Encode(keyId + ":" + keySecret);
  var url = "https://api.razorpay.com/v1/payments/" + encodeURIComponent(cleanPaymentId);

  var res = null;
  try {
    res = UrlFetchApp.fetch(url, {
      method: "get",
      headers: { Authorization: "Basic " + credentials, "Content-Type": "application/json" },
      muteHttpExceptions: true
    });
  } catch (fetchErr) {
    writeToLogs("API_FETCH_ERROR", "Failed to connect to Razorpay Payments API: " + fetchErr.message);
    throw new Error("RAZORPAY_API_ERROR: Unable to connect to Razorpay Payments API: " + fetchErr.message);
  }

  var statusCode = res.getResponseCode();
  if (statusCode === 401 || statusCode === 403) {
    writeToLogs("API_AUTH_ERROR", "Razorpay API authentication failed (" + statusCode + ")");
    throw new Error("RAZORPAY_AUTH_FAILED: Razorpay API authentication failed (" + statusCode + ").");
  }
  if (statusCode !== 200) {
    writeToLogs("API_REJECT_ERROR", "Razorpay API rejected payment (" + statusCode + ")");
    throw new Error("PAYMENT_LOOKUP_FAILED: Razorpay API rejected payment ID (" + statusCode + ").");
  }

  var payment = null;
  try {
    payment = JSON.parse(res.getContentText());
  } catch (parseErr) {
    writeToLogs("API_PARSE_ERROR", "Failed to parse Razorpay API JSON response");
    throw new Error("MALFORMED_API_RESPONSE: Failed to parse Razorpay API response JSON.");
  }

  if (!payment || typeof payment !== "object" || !payment.id) {
    throw new Error("MALFORMED_API_RESPONSE: Razorpay API returned malformed payment object.");
  }

  if (payment.id !== cleanPaymentId) {
    throw new Error("PAYMENT_ID_MISMATCH: Payment record ID mismatch.");
  }
  if (payment.order_id !== cleanOrderId) {
    throw new Error("ORDER_MISMATCH: Payment belongs to a different order.");
  }
  if (payment.status !== "captured") {
    throw new Error("PAYMENT_NOT_CAPTURED: Payment status is '" + (payment.status || "unknown") + "', expected 'captured'.");
  }
  if (payment.currency !== "INR") {
    throw new Error("CURRENCY_MISMATCH: Expected INR, got " + (payment.currency || "unknown") + ".");
  }

  if (expectedAmountInr && expectedAmountInr > 0) {
    var expectedPaise = Math.round(Number(expectedAmountInr) * 100);
    var actualPaise = parseInt(payment.amount, 10);
    if (isNaN(actualPaise) || actualPaise !== expectedPaise) {
      throw new Error("AMOUNT_MISMATCH: Razorpay amount (" + payment.amount + " paise) does not match expected order amount (" + expectedPaise + " paise).");
    }
  }

  return payment;
}

/**
 * Authoritatively retrieves verified invoice record.
 * Validates:
 * 1. Payment and order identifier format
 * 2. Mandatory presence of dedicated INVOICE_TOKEN_SECRET
 * 3. Token expiration (<timestamp>.<sig>)
 * 4. Token HMAC-SHA256 signature binding (paymentId + "|" + orderId + "|" + exp)
 * 5. Cannot be reused to authorize a different payment (binding check)
 * 6. Authoritative state lookup from script properties or registration sheet
 */
function getVerifiedInvoiceRecord(sheet, paymentId, orderId, token, userContact) {
  var cleanPayId = String(paymentId || "").trim();
  var cleanOrdId = String(orderId || "").trim();
  if (!/^pay_[A-Za-z0-9_]+$/.test(cleanPayId) || !/^order_[A-Za-z0-9_]+$/.test(cleanOrdId)) {
    return { success: false, verified: false, error: "INVALID_IDENTIFIERS: Invalid paymentId or orderId reference." };
  }

  var invSecret = getOptionalScriptSecret("INVOICE_TOKEN_SECRET");
  if (!invSecret) {
    writeToLogs("SECURITY_REJECT", "INVOICE_TOKEN_SECRET is not configured. Refusing invoice verification.");
    return {
      success: false,
      verified: false,
      error: "MISSING_INVOICE_TOKEN_SECRET: Dedicated INVOICE_TOKEN_SECRET must be configured in Script Properties."
    };
  }

  var isAuthorized = false;
  if (token && typeof token === "string" && token.indexOf(".") !== -1) {
    var parts = token.split(".");
    if (parts.length === 2) {
      var exp = parseInt(parts[0], 10);
      var providedSig = parts[1];
      var now = Date.now();
      if (!isNaN(exp) && now <= exp) {
        try {
          var expectedSig = computeHmacSha256Gas(cleanPayId + "|" + cleanOrdId + "|" + exp, invSecret);
          if (timingSafeEqualGas(expectedSig, providedSig.trim().toLowerCase())) {
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

  var invRecord = null;
  try {
    var props = PropertiesService.getScriptProperties();
    var cached = props ? props.getProperty("VERIFIED_INV_" + cleanPayId) : null;
    if (cached) {
      if (cached.indexOf("{") === 0) {
        var parsed = JSON.parse(cached);
        // STRICT BINDING: Cached record must match both paymentId and orderId (Requirement 7)
        if (parsed && parsed.orderId && parsed.orderId !== cleanOrdId) {
          writeToLogs("SECURITY_ALERT", "ORDER_MISMATCH on cached invoice: requested " + cleanOrdId + ", cached is " + parsed.orderId);
          return {
            success: false,
            verified: false,
            error: "ORDER_MISMATCH: Invoice is bound to a different order."
          };
        }
        if (parsed && parsed.paymentId && parsed.paymentId !== cleanPayId) {
          return {
            success: false,
            verified: false,
            error: "PAYMENT_MISMATCH: Invoice is bound to a different payment."
          };
        }
        if (parsed && (parsed.status === "PAID" || parsed.verified === true)) {
          invRecord = parsed;
        }
      } else {
        // String format fallback: verify orderId in sheet if sheet is present
        if (sheet) {
          var sRows = sheet.getDataRange().getValues();
          for (var r = 1; r < sRows.length; r++) {
            if (String(sRows[r][8] || "").trim() === cleanOrdId && String(sRows[r][9] || "").trim().replace(/^'/, "") === cleanPayId) {
              if (String(sRows[r][7] || "").trim() === "✅ PAID" || String(sRows[r][7] || "").trim() === "PAID") {
                invRecord = {
                  verified: true,
                  status: "PAID",
                  paymentId: cleanPayId,
                  orderId: cleanOrdId,
                  invoiceNumber: cached
                };
              }
              break;
            }
          }
        } else {
          invRecord = {
            verified: true,
            status: "PAID",
            paymentId: cleanPayId,
            orderId: cleanOrdId,
            invoiceNumber: cached
          };
        }
      }
    }
  } catch (e) {}

  if (!invRecord && sheet) {
    var ssObj = null;
    try {
      ssObj = (sheet && typeof sheet.getSheetByName === "function") ? sheet : (sheet && typeof sheet.getParent === "function" ? sheet.getParent() : null);
    } catch (ssErr) {
      writeToLogs("SPREADSHEET_ACCESS_ERROR", "Failed to access spreadsheet parent: " + ssErr.message);
      throw new Error("SPREADSHEET_READ_FAILED: Failed to access spreadsheet for invoice retrieval: " + ssErr.message);
    }

    var regSheet = null;
    var gstSheet = null;
    try {
      regSheet = ssObj ? ssObj.getSheetByName(SHEET_NAME_DEFAULT_REG) : (sheet.getName && sheet.getName() === SHEET_NAME_DEFAULT_REG ? sheet : null);
      gstSheet = ssObj ? ssObj.getSheetByName(SHEET_NAME_GST) : (sheet.getName && sheet.getName() === SHEET_NAME_GST ? sheet : null);
    } catch (sheetLookupErr) {
      writeToLogs("SPREADSHEET_ACCESS_ERROR", "Failed to locate sheet tabs: " + sheetLookupErr.message);
      throw new Error("SPREADSHEET_READ_FAILED: Failed to locate required sheet tabs for invoice retrieval: " + sheetLookupErr.message);
    }

    // If registration sheet exists, check if payment fulfillment is recorded and complete
    if (regSheet) {
      var rRows = null;
      try {
        rRows = regSheet.getDataRange().getValues();
      } catch (readErr) {
        writeToLogs("SPREADSHEET_READ_ERROR", "Failed to read registration data: " + readErr.message);
        throw new Error("SPREADSHEET_READ_FAILED: Failed to read registration records for invoice verification: " + readErr.message);
      }

      var foundInReg = false;
      var isRegPaid = false;
      for (var ri = rRows.length - 1; ri >= 1; ri--) {
        var rOrd = String(rRows[ri][8] || "").trim();
        var rPay = String(rRows[ri][9] || "").trim().replace(/^'/, "");
        var rStatus = String(rRows[ri][7] || "").trim();
        if (rOrd === cleanOrdId && rPay === cleanPayId) {
          foundInReg = true;
          if (rStatus === "✅ PAID" || rStatus === "PAID") {
            isRegPaid = true;
          }
          break;
        }
      }
      if (foundInReg && !isRegPaid) {
        return {
          success: false,
          verified: false,
          error: "PAYMENT_NOT_FULFILLED: Registration payment fulfillment is incomplete."
        };
      }
    }

    // Authoritative lookup in GST_Sales_Register (where actual STAGE-INV- was recorded)
    // Never fabricate a synthetic invoice number (Phase 1S Requirement 5)
    if (gstSheet) {
      var gRows = null;
      try {
        gRows = gstSheet.getDataRange().getValues();
      } catch (gstReadErr) {
        writeToLogs("SPREADSHEET_READ_ERROR", "Failed to read GST register: " + gstReadErr.message);
        throw new Error("SPREADSHEET_READ_FAILED: Failed to read GST Sales Register for invoice verification: " + gstReadErr.message);
      }
      for (var gi = gRows.length - 1; gi >= 1; gi--) {
        var gPay = String(gRows[gi][18] || "").trim().replace(/^'/, "");
        var gOrd = String(gRows[gi][19] || "").trim();
        var gInvNo = String(gRows[gi][1] || "").trim();
        if (gPay === cleanPayId && gOrd === cleanOrdId) {
          if (gInvNo && gInvNo.startsWith("STAGE-INV-")) {
            invRecord = {
              verified: true,
              status: "PAID",
              paymentId: cleanPayId,
              orderId: cleanOrdId,
              invoiceNumber: gInvNo,
              invoiceDate: String(gRows[gi][2] || Utilities.formatDate(new Date(), "Asia/Kolkata", "dd MMM yyyy")),
              customerName: String(gRows[gi][3] || "Staging Student"),
              customerEmail: String(gRows[gi][4] || ""),
              customerPhone: String(gRows[gi][5] || ""),
              courseName: String(gRows[gi][10] || "Tech Tycoon Course"),
              totalAmountPaid: Number(gRows[gi][17]) || 0
            };
            break;
          }
        }
      }
    }
  }

  if (!invRecord) {
    return {
      success: false,
      verified: false,
      error: "INVOICE_NOT_FOUND: No verified invoice record exists for payment " + cleanPayId
    };
  }

  return {
    success: true,
    verified: true,
    invoice: invRecord
  };
}

// ----------------------------------------------------------------------------
// READ-ONLY GET ENDPOINT
// ----------------------------------------------------------------------------
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? String(e.parameter.action).trim().toLowerCase() : "health";

  if (action === "diagnostics") {
    return createJsonResponse(runStagingDiagnostics());
  }

  // Requirement 4: Prohibit GET invoice retrieval via query params; require secure POST
  if (action === "getverifiedinvoice" || (e && e.parameter && (e.parameter.token || e.parameter.paymentId || e.parameter.orderId))) {
    return createJsonResponse({
      success: false,
      status: 405,
      error: "METHOD_NOT_ALLOWED: Insecure invoice retrieval via GET query parameters is prohibited. Use protected POST with action 'getVerifiedInvoice'."
    });
  }

  return createJsonResponse({
    status: "OK",
    environment: "staging",
    timestamp: new Date().toISOString()
  });
}
