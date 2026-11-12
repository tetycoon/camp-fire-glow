/**
 * ============================================================================
 * 3-HOURS AI FILMMAKING & VIDEO GENERATION LIVE WEBINAR — APPS SCRIPT SYSTEM
 * Schedule: Every Sunday Morning (10:00 AM – 1:00 PM IST)
 * Pricing: ₹99 (Live Session) | ₹499 (₹99 Live Session + ₹400 Session PDF & Material)
 * Technical logs go to "Logs" | Registrations go to "Sheet1" | Leads go to "Landing_Leads"
 * ============================================================================
 */

const SHEET_NAME_REG = "Sheet1";
const SHEET_NAME_LOGS = "Logs";
const SHEET_NAME_LANDING_LEADS = "Landing_Leads";
const REG_SHEET_HEADERS = [
  "Timestamp", "Name", "Email", "Phone", "Profession", "Language", "Amount",
  "Status", "Batch", "SessionDate", "Order ID", "Payment ID", "Email Status",
  "WhatsApp Clicked", "Reminder 24h", "Reminder 2h", "Reminder 15m",
  "Page URL", "Session Time", "Preferred Slot"
];
const LANDING_LEAD_HEADERS = [
  "Timestamp", "Lead ID", "Full Name", "Phone", "Email", "Page URL",
  "UTM Source", "UTM Medium", "UTM Campaign", "GCLID", "FBCLID", "User Agent"
];
const EXPECTED_PRODUCT_KEY = "ai_filmmaking";
const DEFAULT_WEBHOOK_VERIFY_TOKEN = "techtycoon_verify_2026";

/**
 * Run this function ONCE from the Apps Script editor after creating your new Google Sheet
 * to automatically initialize the 3 tabs (Sheet1, Landing_Leads, Logs) and default Script Properties.
 * Note: GST Sales Register is handled centrally across all tools (via FunnelsDone / Central GST),
 * so no local GST_Sales_Register tab is created in this sheet.
 */
function setupSheetHeaders() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Auto-set default non-secret Script Properties if not already set
  try {
    const props = PropertiesService.getScriptProperties();
    if (props) {
      const defaults = {
        "APP_ENVIRONMENT": "production",
        "WEBHOOK_VERIFY_TOKEN": DEFAULT_WEBHOOK_VERIFY_TOKEN,
        "RAZORPAY_KEY_ID": "rzp_live_T2CbVONQc6qrqj",
        "RAZORPAY_KEY_ID_INTL": "rzp_live_gfoS1OjC8tvWjP",
        "FUNNELSDONE_LOCATION_ID": "uUUUKRH7EP2A0oJBv4Zb",
        "WHATSAPP_PHONE_NUMBER_ID": "1089787377552637",
        "WA_GROUP_LINK_FILMMAKING": "https://chat.whatsapp.com/GuJIGDcfIIfDZHlG0MduvM"
      };
      Object.keys(defaults).forEach(function(k) {
        if (!props.getProperty(k)) {
          props.setProperty(k, defaults[k]);
        }
      });
    }
  } catch (e) {}

  // 1. Sheet1 (Registrations)
  let regSheet = ss.getSheetByName(SHEET_NAME_REG) || ss.insertSheet(SHEET_NAME_REG);
  if (regSheet.getLastRow() === 0) {
    regSheet.appendRow(REG_SHEET_HEADERS);
    regSheet.getRange(1, 1, 1, REG_SHEET_HEADERS.length).setFontWeight("bold").setBackground("#ede9fe");
    regSheet.setFrozenRows(1);
  }

  // 2. Landing_Leads
  let leadsSheet = ss.getSheetByName(SHEET_NAME_LANDING_LEADS) || ss.insertSheet(SHEET_NAME_LANDING_LEADS);
  if (leadsSheet.getLastRow() === 0) {
    leadsSheet.appendRow(LANDING_LEAD_HEADERS);
    leadsSheet.getRange(1, 1, 1, LANDING_LEAD_HEADERS.length).setFontWeight("bold").setBackground("#e0f2fe");
    leadsSheet.setFrozenRows(1);
  }

  // 3. Logs
  let logSheet = ss.getSheetByName(SHEET_NAME_LOGS) || ss.insertSheet(SHEET_NAME_LOGS);
  if (logSheet.getLastRow() === 0) {
    logSheet.appendRow(["Timestamp", "Event", "Details"]);
    logSheet.getRange(1, 1, 1, 3).setFontWeight("bold").setBackground("#f1f5f9");
    logSheet.setFrozenRows(1);
  }

  return "All 3 tabs (Sheet1, Landing_Leads, Logs) initialized successfully!";
}

function getScriptSecret(key) {
  const props = PropertiesService.getScriptProperties();
  const val = props ? props.getProperty(key) : "";
  if (!val || !String(val).trim()) {
    throw new Error("Missing required Script Property: " + key);
  }
  return String(val).trim();
}

function getOptionalScriptSecret(key) {
  try {
    const props = PropertiesService.getScriptProperties();
    return props ? String(props.getProperty(key) || "").trim() : "";
  } catch (e) {
    return "";
  }
}

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
  return "production";
}

function isAuthorizedLiveTest(email, amount) {
  const cleanEmail = String(email || "").trim().toLowerCase();
  const numAmount = Number(amount) || 0;
  return (cleanEmail === "ambroseselva001@gmail.com" || cleanEmail === "techtycoondigitalsolutions@gmail.com" || cleanEmail === "techtycoondigitors@gmail.com") && numAmount === 1;
}

function getRazorpayKeyId(isIntl) {
  const env = getAppEnvironment();
  const secretKeyName = isIntl ? "RAZORPAY_KEY_ID_INTL" : "RAZORPAY_KEY_ID";
  const configuredKey = getOptionalScriptSecret(secretKeyName);
  if (env === "staging") {
    if (configuredKey && configuredKey.startsWith("rzp_live_")) {
      throw new Error("LIVE_CREDENTIALS_IN_STAGING: Live Razorpay credentials cannot be used in staging environment.");
    }
    return configuredKey || (isIntl ? "rzp_test_intl_staging_dummy" : "rzp_test_staging_dummy");
  }
  if (env === "production") {
    if (configuredKey && configuredKey.startsWith("rzp_test_")) {
      throw new Error("TEST_CREDENTIALS_IN_PRODUCTION: Test Razorpay credentials cannot be used in production environment.");
    }
    return configuredKey || (isIntl ? "rzp_live_gfoS1OjC8tvWjP" : "rzp_live_T2CbVONQc6qrqj");
  }
  return configuredKey || (isIntl ? "rzp_test_intl_local" : "rzp_test_local");
}

function getRazorpayKeyIdIntl() {
  return getRazorpayKeyId(true);
}

function isForeignUser(data) {
  if (!data) return false;
  if (data.isInternational === true || data.isInternational === "true") return true;
  const cc = String(data.countryCode || "").trim();
  if (cc && cc !== "+91" && cc !== "91") return true;
  const phone = String(data.phone || "").trim();
  if (phone.startsWith("+") && !phone.startsWith("+91")) return true;
  return false;
}

function getFunnelsDoneLocationId() {
  const env = getAppEnvironment();
  const configuredLocation = getOptionalScriptSecret("FUNNELSDONE_LOCATION_ID");
  if (env === "staging") {
    if (configuredLocation === "uUUUKRH7EP2A0oJBv4Zb") {
      throw new Error("PRODUCTION_LOCATION_IN_STAGING: Production FunnelsDone location ID cannot be used in staging environment.");
    }
    return configuredLocation || "staging_location_mock";
  }
  return configuredLocation || "uUUUKRH7EP2A0oJBv4Zb";
}

function getWhatsAppPhoneNumberId() {
  const env = getAppEnvironment();
  const configuredPhoneId = getOptionalScriptSecret("WHATSAPP_PHONE_NUMBER_ID");
  if (env === "staging") {
    if (configuredPhoneId === "1089787377552637") {
      throw new Error("PRODUCTION_PHONE_IN_STAGING: Production WhatsApp phone number ID cannot be used in staging environment.");
    }
    return configuredPhoneId || "staging_phone_mock";
  }
  return configuredPhoneId || "1089787377552637";
}

const KNOWN_PRODUCTION_SPREADSHEET_IDS = [
  "1PC9ZYxd4O7ofuDwcN5AhPHTvW6RYO7V2LgQqrbPTQ5I",
  "1XyFhw6cTJAOE2XT7Ra8lmL0rcvq2meCT9LlGuzOF0nk",
  "1JA3FZf8xkpZ8GjuYiETXz9R0ivfW80-rf3PZIzQum9g",
  "1LP37n3zb1d0UkXjddQBCKqmSU0j5-HvPSI-Rda36E3s",
  "1RpwPPMH6nf8CsIAfITF1gNc5gBNhq7CJ0zckotAgq4I"
];

function assertSpreadsheetIsolation(ss) {
  if (!ss) return;
  const env = getAppEnvironment();
  if (env === "staging") {
    let sheetId = "";
    try {
      sheetId = ss.getId ? ss.getId() : "";
    } catch (e) {}
    if (sheetId && KNOWN_PRODUCTION_SPREADSHEET_IDS.indexOf(sheetId) !== -1) {
      const errMsg = "PRODUCTION_SPREADSHEET_IN_STAGING: Staging environment cannot write to production spreadsheet ID " + sheetId;
      if (typeof writeToLogs === "function") {
        writeToLogs("SECURITY_REJECT", errMsg);
      }
      throw new Error(errMsg);
    }
  }
}

function isMockInvoiceAdapterEnabled() {
  const env = getAppEnvironment();
  const explicit = getOptionalScriptSecret("MOCK_INVOICE_ADAPTER");
  if (explicit === "true") return true;
  if (explicit === "false") {
    if (env === "staging") {
      throw new Error("MOCK_INVOICE_REQUIRED_IN_STAGING: Mock invoice adapter cannot be disabled in staging.");
    }
    return false;
  }
  return env === "staging" || env === "local_test";
}

function isNotificationSuppressed() {
  const env = getAppEnvironment();
  const explicit = getOptionalScriptSecret("SUPPRESS_NOTIFICATIONS");
  if (explicit === "true") return true;
  if (explicit === "false") {
    if (env === "staging") {
      throw new Error("NOTIFICATION_UNSUPPRESSED_IN_STAGING: Outbound notifications cannot be unsuppressed in staging.");
    }
    return false;
  }
  return env === "staging" || env === "local_test";
}

function validatePaymentEnvironment(paymentEntity) {
  const env = getAppEnvironment();
  const notes = (paymentEntity && paymentEntity.notes) || {};
  const paymentId = String((paymentEntity && paymentEntity.id) || "").trim();
  const keyId = getRazorpayKeyId(false);

  const isTestPayment = (
    notes.test_mode === "true" ||
    notes.test_mode === true ||
    notes.environment === "test" ||
    notes.environment === "staging" ||
    paymentId.startsWith("pay_test_") ||
    keyId.startsWith("rzp_test_")
  );

  const isExplicitLive = (
    notes.test_mode === "false" ||
    notes.environment === "live" ||
    notes.environment === "production" ||
    keyId.startsWith("rzp_live_") ||
    (!isTestPayment && paymentId.startsWith("pay_"))
  );

  if (env === "staging") {
    if (isExplicitLive && !isTestPayment) {
      const errMsg = "LIVE_PAYMENT_IN_STAGING: Live payment " + paymentId + " cannot be processed in staging environment.";
      if (typeof writeToLogs === "function") writeToLogs("SECURITY_REJECT", errMsg);
      throw new Error(errMsg);
    }
  } else if (env === "production") {
    if (isTestPayment) {
      const errMsg = "TEST_PAYMENT_IN_PRODUCTION: Test mode payment " + paymentId + " cannot be processed in production environment.";
      if (typeof writeToLogs === "function") writeToLogs("SECURITY_REJECT", errMsg);
      throw new Error(errMsg);
    }
  }
}

const WHATSAPP_CONFIG = {
  get ACCESS_TOKEN() { return getScriptSecret("WHATSAPP_ACCESS_TOKEN"); },
  get PHONE_NUMBER_ID() { return getWhatsAppPhoneNumberId(); },
  PHONE_NUMBER: "917010340494",
  SUPPORT_PHONE: "916379209689",
  WA_GROUP_LINK: getOptionalScriptSecret("WA_GROUP_LINK_FILMMAKING") || "https://chat.whatsapp.com/GuJIGDcfIIfDZHlG0MduvM",
  WA_COMMUNITY_LINK: "https://chat.whatsapp.com/EpsuzpxGz6F98ml2GUBejC",
  POSTER_URL: getOptionalScriptSecret("POSTER_URL_FILMMAKING") || ""
};

const FUNNELSDONE_CONFIG = {
  get PIT_TOKEN() { return getScriptSecret("FUNNELSDONE_PIT_TOKEN"); },
  get LOCATION_ID() { return getFunnelsDoneLocationId(); },
  API_BASE: "https://services.leadconnectorhq.com",
  API_VERSION: "2021-07-28",
  COMPANY_NAME: "TECH TYCOON DIGITAL SOLUTION LLP",
  COMPANY_GSTIN: "33AAZFT9667P1ZP",
  COMPANY_SAC: "999293",
  COMPANY_LOGO: "https://assets.cdn.filesafe.space/uUUUKRH7EP2A0oJBv4Zb/media/6accab95bbad531ac8a6b1af.png",
  COMPANY_PHONE: "7558133039",
  COMPANY_WEBSITE: "https://www.techtycoon.in/",
  ADDRESS_LINE1: "No. 31, Ramalinga Nagar",
  CITY: "Madipakkam, Chennai",
  STATE: "TAMILNADU",
  POSTAL_CODE: "600091"
};

const TEST_EMAILS = ["ambroseselva001@gmail.com", "techtycoondigitalsolutions@gmail.com", "techtycoondigitors@gmail.com"];

/**
 * Returns the upcoming Sunday Morning 10:00 AM IST session date/time.
 */
function getNextSundaySession(now) {
  now = now || new Date();
  const day = now.getDay(); // 0: Sunday
  const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0, 0);
  if (day === 0) {
    const cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 11, 0, 0);
    if (now.getTime() >= cutoff.getTime()) target.setDate(target.getDate() + 7);
  } else {
    const diff = (7 - day) % 7;
    target.setDate(target.getDate() + diff);
  }
  return target;
}

function getUpcomingWebinarTime() {
  return getNextSundaySession(new Date());
}

// ------------------------------------------------------------
// 1. WEBHOOK: GET (WhatsApp Verification, Invoice Lookup & Registration Fetching)
// ------------------------------------------------------------
function doGet(e) {
  const params = (e && e.parameter) ? e.parameter : {};
  const verifyToken = getOptionalScriptSecret("WEBHOOK_VERIFY_TOKEN") || DEFAULT_WEBHOOK_VERIFY_TOKEN;

  if (params['hub.mode'] === 'subscribe' && verifyToken && params['hub.verify_token'] === verifyToken) {
    return ContentService.createTextOutput(params['hub.challenge']);
  }

  if (params.action === 'getVerifiedInvoice') {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME_REG) || ss.getSheets()[0];
    return createJsonResponse(getVerifiedInvoiceRecord(sheet, params.paymentId, params.orderId, params.token, params.email || params.phone || params.contact));
  }

  if (params.action === 'reconcile') {
    return ContentService.createTextOutput(reconcileAiFilmmakingRows());
  }

  if (params.action === 'whatsapp') {
    markWhatsappClicked(params.orderId);
    const msgText = "HI I completed registration of AI Filmmaking & Video Generation Live Webinar";
    const waChatLink = `https://wa.me/${WHATSAPP_CONFIG.PHONE_NUMBER}?text=${encodeURIComponent(msgText)}`;
    const html = `<html><body style="font-family:sans-serif;text-align:center;padding-top:50px;background:#030712;color:white;">
      <h2>Redirecting to WhatsApp...</h2>
      <script>window.top.location.href="${waChatLink}";</script>
    </body></html>`;
    return HtmlService.createHtmlOutput(html).setTitle("Redirecting...");
  }

  if (params.action === 'getRegistrations') {
    if (!verifyToken || params.token !== verifyToken) {
      return createJsonResponse({ success: false, error: "Unauthorized access token" });
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME_REG) || ss.getSheets()[0];
    const layout = getRegSheetLayout(sheet);
    const values = sheet.getDataRange().getValues();

    const list = [];
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      list.push({
        timestamp: row[0] instanceof Date ? row[0].toISOString() : row[0],
        name: row[1],
        email: row[2],
        phone: row[3],
        profession: row[4],
        language: row[5],
        amount: row[6],
        status: row[layout.status],
        orderId: row[layout.orderId],
        paymentId: row[layout.paymentId],
        emailStatus: row[layout.emailStatus],
        whatsappClicked: row[layout.whatsappClicked],
        reminder24h: row[layout.reminder24h],
        reminder2h: row[layout.reminder2h],
        reminder15m: row[layout.reminder15m],
        pageUrl: row[layout.pageUrl],
        batch: row[layout.batch],
        sessionDate: row[layout.sessionDate],
        sessionTime: row[layout.sessionTime]
      });
    }

    list.reverse();
    return createJsonResponse({ success: true, registrations: list });
  }

  if (params.action === 'getLandingLeads') {
    if (!verifyToken || params.token !== verifyToken) {
      return createJsonResponse({ success: false, error: "Unauthorized access token" });
    }
    return createJsonResponse({ success: true, leads: getLandingLeads() });
  }

  return ContentService.createTextOutput("AI Filmmaking & Video Generation Live Webinar Automation is running.");
}

// ------------------------------------------------------------
// 2. WEBHOOK: POST (Leads, Payments, & Incoming Messages)
// ------------------------------------------------------------
function doPost(e) {
  const rawData = (e && e.postData && e.postData.contents) ? e.postData.contents : "{}";
  writeToLogs("RAW_WEBHOOK", rawData.substring(0, 500));

  try {
    const body = JSON.parse(rawData);

    if (body.action === "saveLandingLead") {
      return createJsonResponse(saveLandingLead(body));
    }

    if (body.action === "getVerifiedInvoice") {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = ss.getSheetByName(SHEET_NAME_REG) || ss.getSheets()[0];
      return createJsonResponse(getVerifiedInvoiceRecord(sheet, body.paymentId, body.orderId, body.token, body.email || body.phone || body.contact));
    }

    if (body.action === "reconcile") {
      return createJsonResponse({ success: true, message: reconcileAiFilmmakingRows() });
    }

    if (body.action === "markWhatsappChatted") {
      const updated = markWhatsappClicked(body.orderId, body.phone);
      return createJsonResponse({ success: true, updated: updated });
    }

    if (body.event === "payment.captured" || body.event === "order.paid") {
      const paymentEntity = body.payload && body.payload.payment && body.payload.payment.entity;
      if (!paymentEntity || !paymentEntity.order_id || !paymentEntity.id) {
        return createJsonResponse({ success: false, error: "Invalid webhook payment entity" });
      }
      // Strict isolation: only process ai_filmmaking payments, never ai_masterclass
      const noteProductKey = String((paymentEntity.notes && paymentEntity.notes.product_key) || body.target_product || "").trim().toLowerCase();
      if (noteProductKey && noteProductKey !== EXPECTED_PRODUCT_KEY) {
        writeToLogs("ISOLATION_SKIP", "Ignored non-filmmaking payment (" + noteProductKey + "): " + paymentEntity.id);
        return createJsonResponse({ success: false, ignored: true, reason: "Belongs to " + noteProductKey + ", not ai_filmmaking" });
      }
      const res = updatePaymentStatusFromWebhook(
        paymentEntity.order_id,
        paymentEntity.id,
        paymentEntity.email,
        body.proxy_signature,
        body.timestamp,
        body.eventId || body.event_id,
        body.target_product,
        body.payload_digest,
        paymentEntity,
        body.proxy_version,
        body.event
      );
      return createJsonResponse(res);
    }

    if (body.paymentSuccess === true || body.action === "payment_success") {
      const res = updatePaymentStatus(body);
      return createJsonResponse(res);
    }

    if (body.name && body.email && body.phone && !body.object) {
      const isIntl = isForeignUser(body);
      const orderId = createRazorpayOrder(body);
      saveToSheet(body, orderId);
      return createJsonResponse({
        success: true,
        orderId: orderId,
        keyId: getRazorpayKeyId(isIntl),
        isInternational: isIntl
      });
    }

    if (body.object === "whatsapp_business_account") {
      handleWhatsAppIncoming(body);
      return ContentService.createTextOutput("EVENT_RECEIVED");
    }

    return createJsonResponse({ success: false, message: "Unknown action" });
  } catch (err) {
    writeToLogs("ERROR", err.message);
    return createJsonResponse({ success: false, error: err.message });
  }
}

function handleWhatsAppIncoming(body) {
  const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!message || !message.text?.body) return;

  const rawText = message.text.body;
  const textReceived = rawText.toLowerCase().trim();
  const phone = message.from;

  if (textReceived.includes("filmmaking") || textReceived.includes("video generation") || textReceived.includes("completed registration")) {
    let sessionDate = "Upcoming Sunday";
    let sessionTime = "10:00 AM – 1:00 PM IST";
    const match = rawText.match(/on\s+(.+?)\s+at\s+(.+)$/i);
    if (match) {
      sessionDate = match[1].trim();
      sessionTime = match[2].trim();
    }

    if (WHATSAPP_CONFIG.POSTER_URL) {
      sendWhatsAppImage(phone, WHATSAPP_CONFIG.POSTER_URL, "3-Hours AI Filmmaking & Video Generation Live Webinar");
    }

    let welcomeMsg = "Welcome! 🎬 Your registration is confirmed for the 3-Hours AI Filmmaking & Video Generation Live Webinar.\n\n";
    welcomeMsg += `📅 Date: ${sessionDate} (Every Sunday Morning)\n🕒 Time: ${sessionTime}\n📚 Topics: AI Logo Animation, AI Avatar Creation & AI Video Generation\n\n`;
    welcomeMsg += "📄 Note: Your official GST Tax Invoice has been sent to your registered email address.\n\n";
    welcomeMsg += "Please join our exclusive WhatsApp Community below to receive the live session link:\n" + WHATSAPP_CONFIG.WA_GROUP_LINK + "\n\n";
    welcomeMsg += "If you have any doubts, feel free to call or WhatsApp us at +91 63792 09689.";

    sendWhatsAppText(phone, welcomeMsg);
  }
}

// ------------------------------------------------------------
// 3. DUAL GST INVOICE: OUR PDF BLOB + FUNNELSDONE API v2 SYNC
// ------------------------------------------------------------
const TOTAL_TO_EXACT_BASE_MAP = {
  99: 83.90,
  117: 99,
  400: 338.98,
  471: 399,
  499: 422.88,
  589: 499
};

function getInvoiceAccountingBreakdown(totalAmount) {
  const total = Math.max(1, Math.round(Number(totalAmount) || 99));
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
  // GST Sales Register is managed centrally across all Tech Tycoon tools (and Tech Tycoon Staging Payment / FunnelsDone).
  // Only write if an explicit CENTRAL_GST_SPREADSHEET_ID is configured in Script Properties; never create a local GST_Sales_Register tab.
  try {
    if (acct && acct.isTest) return;
    const centralGstSheetId = getOptionalScriptSecret("CENTRAL_GST_SPREADSHEET_ID");
    if (!centralGstSheetId) return;

    const ss = SpreadsheetApp.openById(centralGstSheetId);
    if (!ss) return;
    assertSpreadsheetIsolation(ss);
    let gstSheet = ss.getSheetByName("GST_Sales_Register") || ss.getSheets()[0];
    if (!gstSheet) return;

    const existingRows = gstSheet.getDataRange().getValues();
    const cleanPayId = String(paymentId || "").replace(/^'/, "").trim();
    const cleanInvNo = String(invNumber || "").trim();
    for (let r = 1; r < existingRows.length; r++) {
      const rowInvNo = String(existingRows[r][1] || "").trim();
      const rowPayId = String(existingRows[r][17] || "").replace(/^'/, "").trim();
      if ((cleanPayId && rowPayId === cleanPayId) || (cleanInvNo && rowInvNo === cleanInvNo)) {
        return;
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
      sanitizeCell(courseName || "AI Filmmaking Live Webinar"),
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
  const invNumber = String(invoiceNo || ("TT/26-27/" + String(paymentId || "1001").replace(/\D/g, "").slice(-4))).trim();
  const dateStr = Utilities.formatDate(new Date(), "Asia/Kolkata", "dd MMM yyyy");

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
        <div style="color:#475569;line-height:1.4;">No. 31, Ramalinga Nagar, Madipakkam, Chennai, Tamil Nadu - 600091<br/>State: Tamil Nadu (Code: 33) | Mobile: +91 ${FUNNELSDONE_CONFIG.COMPANY_PHONE} | Web: ${FUNNELSDONE_CONFIG.COMPANY_WEBSITE}</div>
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
        <td><strong>${sanitizeCell(courseName || "3-Hours AI Filmmaking & Video Generation Live Webinar")}</strong><br/><span style="color:#64748b;font-size:9.5px;">Commercial Training & Coaching Services (Sunday 10:00 AM – 1:00 PM IST)</span></td>
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

  if (isMockInvoiceAdapterEnabled()) {
    const mockInvNum = "STAGE-INV-" + (cleanPayId.replace(/\D/g, "").slice(-4) || "1001");
    if (props && cleanPayId) {
      props.setProperty("INVOICE_STATE_" + cleanPayId, "RESOLVED");
      props.setProperty("VERIFIED_INV_" + cleanPayId, mockInvNum);
    }
    return mockInvNum;
  }

  if (isAuthorizedLiveTest(customerEmail, totalAmount)) {
    const mockInvNum = "TEST-TT/26-27/" + (cleanPayId.replace(/\D/g, "").slice(-4) || "1001");
    if (props && cleanPayId) {
      props.setProperty("INVOICE_STATE_" + cleanPayId, "RESOLVED");
      props.setProperty("VERIFIED_INV_" + cleanPayId, mockInvNum);
    }
    return mockInvNum;
  }

  // Fallback local invoice sequence if FUNNELSDONE_PIT_TOKEN is not configured yet
  const pitToken = getOptionalScriptSecret("FUNNELSDONE_PIT_TOKEN");
  if (!pitToken) {
    const localInv = "TT/26-27/AIF-" + (cleanPayId.replace(/\D/g, "").slice(-5) || "1001");
    if (props && cleanPayId) {
      props.setProperty("INVOICE_STATE_" + cleanPayId, "RESOLVED");
    }
    return localInv;
  }

  try {
    const headers = {
      "Authorization": "Bearer " + pitToken,
      "Version": FUNNELSDONE_CONFIG.API_VERSION,
      "Content-Type": "application/json",
      "Accept": "application/json"
    };

    let cleanPhone = String(customerPhone || "").replace(/\D/g, "");
    if (cleanPhone.length === 10) cleanPhone = "+91" + cleanPhone;
    else if (cleanPhone.length > 10 && !cleanPhone.startsWith("+")) cleanPhone = "+" + cleanPhone;

    const contactPayload = {
      locationId: FUNNELSDONE_CONFIG.LOCATION_ID,
      name: customerName || "Learner",
      email: customerEmail || "",
      phone: cleanPhone,
      tags: ["ai_filmmaking_paid", "gst_invoice_issued"]
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
      return "TT/26-27/AIF-" + (cleanPayId.replace(/\D/g, "").slice(-5) || "1001");
    }

    const numRes = UrlFetchApp.fetch(
      FUNNELSDONE_CONFIG.API_BASE + "/invoices/generate-invoice-number?altId=" + FUNNELSDONE_CONFIG.LOCATION_ID + "&altType=location",
      { method: "get", headers: headers, muteHttpExceptions: true }
    );
    const numJson = JSON.parse(numRes.getContentText() || "{}");
    const rawInvNum = numJson ? (numJson.invoiceNumber || (numJson.invoice && numJson.invoice.invoiceNumber)) : null;
    const nextInvoiceNumber = rawInvNum ? String(rawInvNum).trim() : ("AIF-" + (cleanPayId.replace(/\D/g, "").slice(-5) || "1001"));

    const acct = getInvoiceAccountingBreakdown(totalAmount);
    const total = acct.total;
    const isTest = acct.isTest;
    const baseAmt = acct.baseAmt;
    const todayStr = Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyy-MM-dd");

    const createPayload = {
      altId: FUNNELSDONE_CONFIG.LOCATION_ID,
      altType: "location",
      name: courseName || "3-Hours AI Filmmaking & Video Generation Live Webinar",
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
          name: courseName || "3-Hours AI Filmmaking & Video Generation Live Webinar",
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

    const invRes = UrlFetchApp.fetch(FUNNELSDONE_CONFIG.API_BASE + "/invoices/", {
      method: "post",
      headers: headers,
      payload: JSON.stringify(createPayload),
      muteHttpExceptions: true
    });
    const invJson = JSON.parse(invRes.getContentText() || "{}");
    const invoiceId = invJson._id || (invJson.invoice && invJson.invoice._id);
    if (invoiceId) {
      const recordPayload = {
        altId: FUNNELSDONE_CONFIG.LOCATION_ID,
        altType: "location",
        mode: "other",
        amount: invJson.total || total,
        notes: "Paid via Razorpay | Payment ID: " + (paymentId || "") + " | Order ID: " + (orderId || ""),
        fulfilledAt: new Date().toISOString()
      };
      UrlFetchApp.fetch(FUNNELSDONE_CONFIG.API_BASE + "/invoices/" + invoiceId + "/record-payment", {
        method: "post",
        headers: headers,
        payload: JSON.stringify(recordPayload),
        muteHttpExceptions: true
      });
    }

    if (props && cleanPayId) {
      props.setProperty("INVOICE_STATE_" + cleanPayId, "RESOLVED");
    }
    return "TT/26-27/" + nextInvoiceNumber;
  } catch (err) {
    writeToLogs("FUNNELSDONE_SYNC_ERROR", err.message);
    return "TT/26-27/AIF-" + (cleanPayId.replace(/\D/g, "").slice(-5) || "1001");
  }
}

function sendMasterclassEmail(email, name, sessionDate, sessionTime, totalAmount, paymentId, orderId, phone, modeOrLang) {
  const defaultTime = getUpcomingWebinarTime();
  const dateVal = sessionDate || defaultTime.toDateString();
  const timeVal = sessionTime || "10:00 AM – 1:00 PM IST (Sunday Morning)";
  const isPdfMaterial = Number(totalAmount) === 499 || String(modeOrLang || "").includes("Material") || String(modeOrLang || "").includes("PDF");
  const courseTitle = isPdfMaterial
    ? "3-Hours AI Filmmaking & Video Generation Live Webinar + Session PDF & Material"
    : "3-Hours AI Filmmaking & Video Generation Live Webinar";
  const fdCourseName = isPdfMaterial
    ? "AI Filmmaking Live Webinar + Session PDF & Material"
    : "AI Filmmaking & Video Generation Live Webinar";
  const waGroupLink = WHATSAPP_CONFIG.WA_GROUP_LINK;
  const platformText = "Online Live Interactive Studio (Link will be shared in WhatsApp group)";

  let fdInvoiceNo = syncInvoiceWithFunnelsDone(name, email, phone, fdCourseName, totalAmount || 99, paymentId, orderId);

  let pdfAttachment = null;
  try {
    pdfAttachment = generateOurGstInvoicePdfBlob(name, email, phone, courseTitle, totalAmount || 99, paymentId, orderId, fdInvoiceNo);
  } catch (pdfErr) {
    writeToLogs("PDF_GEN_ERROR", pdfErr.message);
  }

  if (isNotificationSuppressed()) {
    return { invoiceNumber: fdInvoiceNo, courseTitle: courseTitle, suppressed: true };
  }

  const subject = `Thank You for Registering! 🎬 3-Hours AI Filmmaking Live Webinar Confirmation`;

  const htmlBody = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You for Registering</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" style="max-width:600px;width:100%;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:24px;overflow:hidden;box-shadow:0 10px 25px -5px rgba(0,0,0,0.06);">
          <!-- Header Banner -->
          <tr>
            <td style="background:linear-gradient(135deg,#1e3a8a,#2563eb,#06b6d4);padding:40px 32px;text-align:center;">
              <div style="font-size:44px;margin-bottom:12px;">🎬</div>
              <h1 style="font-size:24px;font-weight:900;color:#ffffff;margin:0 0 6px;letter-spacing:-0.02em;line-height:1.3;">
                Thank You for Registering!
              </h1>
              <p style="color:rgba(255,255,255,0.92);font-size:13px;letter-spacing:0.12em;margin:0;text-transform:uppercase;font-weight:700;">
                3-Hours AI Filmmaking &amp; Video Generation Live Webinar
              </p>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding:36px 32px;">
              <h2 style="color:#0f172a;font-size:20px;margin:0 0 12px;font-weight:800;">
                Hi ${name || "Creator"},
              </h2>
              <p style="color:#334155;font-size:15px;line-height:1.65;margin:0 0 24px;">
                Thank you for registering for the <strong>3-Hours AI Filmmaking &amp; Video Generation Live Webinar</strong> (Basic &amp; Foundation Session)! Your seat has been successfully reserved.
              </p>

              <!-- Session Date & Time Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;margin-bottom:28px;overflow:hidden;">
                <tr>
                  <td style="padding:14px 20px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;font-weight:600;width:35%;">
                    📅 Session Date
                  </td>
                  <td style="padding:14px 20px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#0f172a;font-weight:800;">
                    ${dateVal}
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 20px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;font-weight:600;">
                    ⏰ Session Time
                  </td>
                  <td style="padding:14px 20px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#0f172a;font-weight:800;">
                    ${timeVal}
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 20px;font-size:13px;color:#64748b;font-weight:600;">
                    📍 Platform
                  </td>
                  <td style="padding:14px 20px;font-size:13px;color:#2563eb;font-weight:700;">
                    Live Online Interactive Studio (Classroom link shared inside the WhatsApp Community)
                  </td>
                </tr>
              </table>

              <!-- WhatsApp Community CTA Card -->
              <div style="background:linear-gradient(135deg,#ecfdf5,#d1fae5);border:1.5px solid #10b981;border-radius:18px;padding:24px 20px;margin-bottom:28px;text-align:center;">
                <p style="color:#047857;font-size:11px;font-weight:800;letter-spacing:0.15em;text-transform:uppercase;margin:0 0 6px;">
                  ⚡ Action Required — Next Step
                </p>
                <h3 style="color:#064e3b;font-size:18px;font-weight:800;margin:0 0 8px;">
                  Join the Official Webinar WhatsApp Community
                </h3>
                <p style="color:#065f46;font-size:13px;line-height:1.55;margin:0 0 18px;">
                  All live webinar classroom links, Sunday morning reminders, and session materials will be shared directly inside the WhatsApp group.
                </p>
                <a href="${waGroupLink}" target="_blank" style="display:inline-block;background-color:#10b981;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:100px;font-size:15px;font-weight:800;box-shadow:0 4px 12px rgba(16,185,129,0.35);">
                  👉 Click Here to Join WhatsApp Group
                </a>
                <p style="color:#047857;font-size:12px;margin:12px 0 0;word-break:break-all;">
                  Direct link: <a href="${waGroupLink}" target="_blank" style="color:#047857;font-weight:600;">${waGroupLink}</a>
                </p>
              </div>

              <!-- GST Tax Invoice Download Card -->
              <div style="background-color:#f8fafc;border:1.5px solid #cbd5e1;border-radius:18px;padding:22px 20px;margin-bottom:24px;">
                <div style="display:flex;align-items:center;margin-bottom:8px;">
                  <h4 style="color:#0f172a;font-size:15px;font-weight:800;margin:0;">
                    📄 Official GST Tax Invoice Attached
                  </h4>
                </div>
                <p style="color:#475569;font-size:13px;line-height:1.6;margin:0 0 10px;">
                  Your official 100% GST-compliant tax invoice (Invoice No: <strong style="color:#0f172a;">${fdInvoiceNo}</strong>) for your registration payment of <strong style="color:#059669;">₹${totalAmount || 99} INR</strong> has been generated and attached as a PDF to this email.
                </p>
                <p style="color:#64748b;font-size:12px;line-height:1.5;margin:0;">
                  📥 <strong>Download Option:</strong> Scroll to the bottom of this email to preview, download, or print your official PDF invoice.
                </p>
              </div>

              ${isPdfMaterial ? `
              <!-- Resource ToolKit Bonus Card -->
              <div style="background-color:#fef3c7;border:1px solid #f59e0b;border-radius:14px;padding:16px 18px;margin-bottom:24px;">
                <h4 style="color:#92400e;font-size:14px;margin:0 0 6px;font-weight:700;">🎁 Resource ToolKit Worth ₹10,000 Unlocked!</h4>
                <p style="color:#b45309;font-size:12.5px;line-height:1.5;margin:0;">
                  You have added the Resource ToolKit (150+ 3D Logo &amp; AI Video Prompts PDF, 100+ AI Skills, and Content Creation Prompts). Access will be distributed during the live webinar.
                </p>
              </div>` : ''}

              <!-- Support & Footer -->
              <hr style="border:none;border-top:1px solid #e2e8f0;margin:28px 0 20px;">
              <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0;line-height:1.6;">
                TECH TYCOON DIGITAL SOLUTION LLP • Madipakkam, Chennai, Tamil Nadu - 600091<br>
                Need assistance? Call/WhatsApp: <strong style="color:#475569;">+91 63792 09689</strong> / <strong style="color:#475569;">+91 7558133039</strong><br>
                Email: <a href="mailto:support@techtycoon.in" style="color:#2563eb;text-decoration:none;">support@techtycoon.in</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const emailOptions = {
    to: email,
    subject: subject,
    htmlBody: htmlBody,
    name: "Tech Tycoon AI Filmmaking Studio",
    replyTo: "support@techtycoon.in"
  };
  if (pdfAttachment) {
    emailOptions.attachments = [pdfAttachment];
  }
  MailApp.sendEmail(emailOptions);
  return { invoiceNumber: fdInvoiceNo, courseTitle: courseTitle };
}

function sanitizeCell(val) {
  if (val === null || val === undefined) return "";
  const str = String(val).replace(/[\u0000-\u001F\u007F]/g, "").trim();
  if (/^[=+\-@\t\r]/.test(str)) return "'" + str;
  return str;
}

function constantTimeEquals(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function computeHmacSha256Hex(payload, secret) {
  const sigBytes = Utilities.computeHmacSha256Signature(payload, secret);
  return sigBytes.map(function(b) {
    const v = (b < 0) ? 256 + b : b;
    return ("0" + v.toString(16)).slice(-2);
  }).join("");
}

function verifyRazorpayPaymentSignature(orderId, paymentId, signature, isIntl) {
  const cleanOrderId = String(orderId || "").trim();
  const cleanPaymentId = String(paymentId || "").trim();
  const cleanSignature = String(signature || "").trim().toLowerCase();
  if (!/^order_[A-Za-z0-9]+$/.test(cleanOrderId)) return false;
  if (!/^pay_[A-Za-z0-9]+$/.test(cleanPaymentId)) return false;
  if (!/^[0-9a-f]{64}$/.test(cleanSignature)) return false;

  const payload = cleanOrderId + "|" + cleanPaymentId;

  // 1. Check primary secret (Indian or Foreign based on isIntl flag)
  const primaryKey = isIntl ? "RAZORPAY_KEY_SECRET_INTL" : "RAZORPAY_KEY_SECRET";
  const primarySecret = getOptionalScriptSecret(primaryKey);
  if (primarySecret) {
    const expectedSig = computeHmacSha256Hex(payload, primarySecret);
    if (constantTimeEquals(expectedSig, cleanSignature)) return true;
  }

  // 2. Fallback check against the second Razorpay account secret (in case countryCode wasn't passed on callback)
  const secondaryKey = isIntl ? "RAZORPAY_KEY_SECRET" : "RAZORPAY_KEY_SECRET_INTL";
  const secondarySecret = getOptionalScriptSecret(secondaryKey);
  if (secondarySecret) {
    const altExpected = computeHmacSha256Hex(payload, secondarySecret);
    if (constantTimeEquals(altExpected, cleanSignature)) return true;
  }

  if (!primarySecret && !secondarySecret) {
    throw new Error("Missing required Script Property: RAZORPAY_KEY_SECRET or RAZORPAY_KEY_SECRET_INTL");
  }
  return false;
}

function validateMasterclassAmount(data) {
  const email = (data.email || "").toString().toLowerCase().trim();
  if (TEST_EMAILS.indexOf(email) !== -1 && Number(data.amount) === 1) return 1;
  const isPdfMaterial = String(data.hasPdfMaterial || "").toUpperCase() === "YES" || Number(data.amount) === 499;
  if (isPdfMaterial) return 499;
  return 99;
}

function createRazorpayOrder(data) {
  const isInternational = isForeignUser(data);
  const keyId = isInternational ? getRazorpayKeyId(true) : getRazorpayKeyId(false);
  const keySecret = getScriptSecret(isInternational ? "RAZORPAY_KEY_SECRET_INTL" : "RAZORPAY_KEY_SECRET");
  const validAmount = validateMasterclassAmount(data);
  const isPdfMaterial = String(data.hasPdfMaterial || "").toUpperCase() === "YES" || Number(validAmount) === 499;
  const courseName = isPdfMaterial
    ? "3-Hours AI Filmmaking Live Webinar + Session PDF & Material"
    : "3-Hours AI Filmmaking & Video Generation Live Webinar";

  const credentials = Utilities.base64Encode(keyId + ":" + keySecret);
  const options = {
    method: "post",
    headers: { Authorization: "Basic " + credentials, "Content-Type": "application/json" },
    payload: JSON.stringify({
      amount: validAmount * 100,
      currency: "INR",
      notes: {
        product_key: "ai_filmmaking",
        course: courseName,
        has_pdf_material: isPdfMaterial ? "YES" : "NO",
        user_region: isInternational ? "INTERNATIONAL" : "INDIA",
        base_amount: data.baseAmount || (isPdfMaterial ? 422.88 : 83.90),
        gst_amount: data.gstAmount || (isPdfMaterial ? 76.12 : 15.10)
      }
    }),
    muteHttpExceptions: true
  };
  const response = UrlFetchApp.fetch("https://api.razorpay.com/v1/orders", options);
  const resText = response.getContentText();
  if (response.getResponseCode() !== 200) throw new Error("Razorpay Failed: " + resText);
  return JSON.parse(resText).id;
}

function getRegSheetLayout(sheet) {
  return {
    status: 7,
    batch: 8,
    sessionDate: 9,
    orderId: 10,
    paymentId: 11,
    emailStatus: 12,
    whatsappClicked: 13,
    reminder24h: 14,
    reminder2h: 15,
    reminder15m: 16,
    pageUrl: 17,
    sessionTime: 18,
    preferredSlot: 19,
    isCustomOrder: true
  };
}

function buildRegSheetRow(layout, fields) {
  const row = new Array(20).fill("");
  row[0] = fields.timestamp;
  row[1] = fields.name;
  row[2] = fields.email;
  row[3] = fields.phone;
  row[4] = fields.profession;
  row[5] = fields.language;
  row[6] = fields.amount;
  row[layout.status] = fields.status;
  row[layout.batch] = fields.batch;
  row[layout.sessionDate] = fields.sessionDate;
  row[layout.orderId] = fields.orderId;
  row[layout.paymentId] = fields.paymentId;
  row[layout.emailStatus] = fields.emailStatus;
  row[layout.whatsappClicked] = fields.whatsappClicked;
  row[layout.reminder24h] = fields.reminder24h;
  row[layout.reminder2h] = fields.reminder2h;
  row[layout.reminder15m] = fields.reminder15m;
  row[layout.pageUrl] = fields.pageUrl;
  row[layout.sessionTime] = fields.sessionTime;
  row[layout.preferredSlot] = fields.preferredSlot;
  return row;
}

function saveToSheet(data, orderId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME_REG) || ss.insertSheet(SHEET_NAME_REG);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(REG_SHEET_HEADERS);
    sheet.setFrozenRows(1);
  }
  const layout = getRegSheetLayout(sheet);
  const validAmount = validateMasterclassAmount(data);
  sheet.appendRow(buildRegSheetRow(layout, {
    timestamp: new Date(),
    name: sanitizeCell(data.name),
    email: sanitizeCell(data.email),
    phone: "'" + String(data.phone || "").replace(/[^\d+\-\s]/g, ""),
    profession: sanitizeCell(data.userType || "Working Professional"),
    language: sanitizeCell(data.modeOfSession || data.language || "Online Live Session (Sunday 10 AM - 1 PM)"),
    amount: validAmount,
    status: "INITIATED",
    batch: sanitizeCell(data.batch || "Sunday Morning 10:00 AM - 1:00 PM IST"),
    sessionDate: sanitizeCell(data.sessionDate || getUpcomingWebinarTime().toDateString()),
    orderId: orderId,
    paymentId: "",
    emailStatus: "WAITING",
    whatsappClicked: "NO",
    reminder24h: "NO",
    reminder2h: "NO",
    reminder15m: "NO",
    pageUrl: sanitizeCell(data.pageUrl || "https://course.techtycoon.in/ai_filmmaking"),
    sessionTime: sanitizeCell(data.sessionTime || "10:00 AM – 1:00 PM IST"),
    preferredSlot: sanitizeCell(data.preferredSlot || "Sunday 10:00 AM - 1:00 PM IST")
  }));
}

function getLandingLeadsSheet(ss) {
  let sheet = ss.getSheetByName(SHEET_NAME_LANDING_LEADS);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME_LANDING_LEADS);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(LANDING_LEAD_HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function saveLandingLead(data) {
  if (data.website) {
    writeToLogs("LANDING_LEAD_BOT_REJECT", "Honeypot field filled");
    return { success: false, error: "Submission rejected." };
  }
  const name = String(data.name || "").replace(/\s+/g, " ").trim();
  const phone = String(data.phone || "").replace(/[^\d+]/g, "");
  const email = String(data.email || "").trim().toLowerCase();
  if (name.length < 2 || phone.replace(/\D/g, "").length < 7) {
    return { success: false, error: "Invalid lead details." };
  }

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = getLandingLeadsSheet(ss);
    const utm = data.utm || {};
    const leadId = "lead_" + Utilities.getUuid().replace(/-/g, "").substring(0, 16);
    sheet.appendRow([
      new Date(),
      leadId,
      sanitizeCell(name),
      "'" + phone,
      sanitizeCell(email),
      sanitizeCell(String(data.pageUrl || "").substring(0, 500)),
      sanitizeCell(String(utm.utm_source || "").substring(0, 100)),
      sanitizeCell(String(utm.utm_medium || "").substring(0, 100)),
      sanitizeCell(String(utm.utm_campaign || "").substring(0, 150)),
      sanitizeCell(String(utm.gclid || "").substring(0, 200)),
      sanitizeCell(String(utm.fbclid || "").substring(0, 200)),
      sanitizeCell(String(data.userAgent || "").substring(0, 300))
    ]);
    SpreadsheetApp.flush();
    return { success: true, leadId: leadId };
  } catch (err) {
    writeToLogs("LANDING_LEAD_ERROR", err.message);
    return { success: false, error: "Could not save lead details." };
  } finally {
    lock.releaseLock();
  }
}

function getLandingLeads() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME_LANDING_LEADS);
  if (!sheet) return [];
  const values = sheet.getDataRange().getValues();
  const list = [];
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    list.push({
      timestamp: row[0] instanceof Date ? row[0].toISOString() : row[0],
      leadId: row[1],
      name: row[2],
      phone: String(row[3] || "").replace(/^'/, ""),
      email: row[4],
      pageUrl: row[5],
      utmSource: row[6],
      utmMedium: row[7],
      utmCampaign: row[8],
      gclid: row[9],
      fbclid: row[10],
      userAgent: row[11]
    });
  }
  list.reverse();
  return list;
}

function updatePaymentStatus(data) {
  const orderId = data.razorpay_order_id || data.orderId || "";
  const paymentId = data.razorpay_payment_id || data.transactionId || data.paymentId || "";
  const signature = data.razorpay_signature || "";
  const isInternational = Boolean(data.countryCode && data.countryCode !== "+91");

  if (orderId && paymentId && signature) {
    const sigOk = verifyRazorpayPaymentSignature(orderId, paymentId, signature, isInternational);
    if (!sigOk) {
      writeToLogs("SECURITY_REJECT", "Invalid Razorpay signature for order: " + orderId);
      throw new Error("INVALID_SIGNATURE: Payment signature verification failed.");
    }
  }

  return processVerifiedFilmmakingPayment(orderId, paymentId, isInternational, data.amount, data);
}

function updatePaymentStatusFromWebhook(orderId, paymentId, email, proxySignature, timestamp, eventId, targetProduct, payloadDigest, paymentEntity, proxyVersion, eventType) {
  return processVerifiedFilmmakingPayment(orderId, paymentId, false, paymentEntity ? (Number(paymentEntity.amount) / 100) : undefined, { email: email });
}

function processVerifiedFilmmakingPayment(orderId, paymentId, isInternational, clientSuppliedAmount, extraData) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const cleanOrderId = String(orderId || "").trim();
    const cleanPaymentId = String(paymentId || "").trim();
    const props = PropertiesService.getScriptProperties();

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    assertSpreadsheetIsolation(ss);
    let sheet = ss.getSheetByName(SHEET_NAME_REG) || ss.insertSheet(SHEET_NAME_REG);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(REG_SHEET_HEADERS);
      sheet.setFrozenRows(1);
    }
    const layout = getRegSheetLayout(sheet);
    let rows = sheet.getDataRange().getValues();

    let targetRowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][layout.orderId] || "").trim() === cleanOrderId && cleanOrderId) {
        targetRowIndex = i;
        break;
      }
    }

    if (targetRowIndex === -1) {
      const modeLabel = (extraData && (extraData.modeOfSession || extraData.language)) ||
        (Number(clientSuppliedAmount) === 499 ? "Online Live Session + Session PDF & Material" : "Online Live Session (Sunday 10 AM - 1 PM)");
      sheet.appendRow(buildRegSheetRow(layout, {
        timestamp: new Date(),
        name: sanitizeCell((extraData && extraData.name) || "Learner"),
        email: sanitizeCell((extraData && extraData.email) || ""),
        phone: "'" + String((extraData && extraData.phone) || "").replace(/[^\d+\-\s]/g, ""),
        profession: "Working Professional",
        language: modeLabel,
        amount: clientSuppliedAmount || 99,
        status: "INITIATED",
        batch: "Sunday Morning 10:00 AM - 1:00 PM IST",
        sessionDate: sanitizeCell((extraData && extraData.sessionDate) || getUpcomingWebinarTime().toDateString()),
        orderId: cleanOrderId,
        paymentId: cleanPaymentId,
        emailStatus: "WAITING",
        whatsappClicked: "NO",
        reminder24h: "NO",
        reminder2h: "NO",
        reminder15m: "NO",
        pageUrl: sanitizeCell((extraData && extraData.pageUrl) || "https://course.techtycoon.in/ai_filmmaking"),
        sessionTime: sanitizeCell((extraData && extraData.sessionTime) || "10:00 AM – 1:00 PM IST"),
        preferredSlot: "Sunday 10:00 AM - 1:00 PM IST"
      }));
      SpreadsheetApp.flush();
      targetRowIndex = sheet.getLastRow() - 1;
      rows = sheet.getDataRange().getValues();
    }

    const row = rows[targetRowIndex];
    const expectedAmountInr = Number(row[6]) || Number(clientSuppliedAmount) || 99;
    const name = String(row[1] || (extraData && extraData.name) || "Learner").replace(/^'/, "");
    const email = String(row[2] || (extraData && extraData.email) || "").replace(/^'/, "");
    const sessionDate = (extraData && extraData.sessionDate) || row[layout.sessionDate] || getUpcomingWebinarTime().toDateString();
    const sessionTime = (extraData && extraData.sessionTime) || row[layout.sessionTime] || "10:00 AM – 1:00 PM IST";
    const phoneClean = row[3] ? row[3].toString().replace(/\D/g, '') : "";
    const modeOrLang = row[5] || (extraData && (extraData.language || extraData.modeOfSession)) || "";

    let emailResult = { invoiceNumber: "TT/26-27/AIF-" + (cleanPaymentId.replace(/\D/g, "").slice(-4) || "1099"), courseTitle: "3-Hours AI Filmmaking & Video Generation Live Webinar" };
    try {
      emailResult = sendMasterclassEmail(email, name, sessionDate, sessionTime, expectedAmountInr, cleanPaymentId, cleanOrderId, phoneClean, modeOrLang) || emailResult;
      triggerWhatsAppCampaign(name, email, phoneClean, sessionDate, sessionTime);
      // Calendar invite intentionally omitted to avoid Google Meet attachments
    } catch (err) {
      writeToLogs("EMAIL_OR_WA_ERROR", "Failed email/wa to " + email + ": " + err.message);
    }

    const isTestTx = isAuthorizedLiveTest(email, expectedAmountInr);
    sheet.getRange(targetRowIndex + 1, layout.status + 1).setValue(isTestTx ? "✅ TEST_VERIFIED (₹1)" : "✅ PAID");
    sheet.getRange(targetRowIndex + 1, layout.paymentId + 1).setValue(sanitizeCell(cleanPaymentId));
    sheet.getRange(targetRowIndex + 1, layout.emailStatus + 1).setValue("SENT ✅");
    SpreadsheetApp.flush();

    if (props && cleanPaymentId) {
      props.setProperty("PROCESSED_PAY_" + cleanPaymentId, new Date().toISOString());
    }

    return {
      success: true,
      verified: true,
      paymentId: cleanPaymentId,
      orderId: cleanOrderId,
      invoiceNumber: emailResult.invoiceNumber
    };
  } finally {
    lock.releaseLock();
  }
}

function getVerifiedInvoiceRecord(sheet, paymentId, orderId, token, userContact) {
  const cleanPayId = String(paymentId || "").trim();
  const cleanOrdId = String(orderId || "").trim();
  if (!sheet) return { success: false, verified: false, error: "Sheet not found" };
  const layout = getRegSheetLayout(sheet);
  const rows = sheet.getDataRange().getValues();
  for (let i = rows.length - 1; i >= 1; i--) {
    const rowOrdId = String(rows[i][layout.orderId] || "").trim();
    const rowPayId = String(rows[i][layout.paymentId] || "").trim().replace(/^'/, "");
    if ((cleanPayId && rowPayId === cleanPayId) || (cleanOrdId && rowOrdId === cleanOrdId)) {
      const amt = Number(rows[i][6]) || 99;
      return {
        success: true,
        verified: true,
        invoice: {
          verified: true,
          paymentId: rowPayId || cleanPayId,
          orderId: rowOrdId || cleanOrdId,
          invoiceNumber: "TT/26-27/AIF-" + ((rowPayId || cleanPayId).replace(/\D/g, "").slice(-4) || "1099"),
          invoiceDate: Utilities.formatDate(new Date(), "Asia/Kolkata", "dd MMM yyyy"),
          customerName: String(rows[i][1] || "Learner").replace(/^'/, ""),
          customerEmail: String(rows[i][2] || "").replace(/^'/, ""),
          customerPhone: String(rows[i][3] || "").replace(/^'/, ""),
          courseName: amt === 499
            ? "3-Hours AI Filmmaking Live Webinar + Session PDF & Material"
            : "3-Hours AI Filmmaking & Video Generation Live Webinar",
          totalAmountPaid: amt
        }
      };
    }
  }
  return { success: false, verified: false, error: "Record not found" };
}

function sendWhatsAppText(to, message) {
  if (isNotificationSuppressed()) return;
  try {
    const url = "https://graph.facebook.com/v19.0/" + WHATSAPP_CONFIG.PHONE_NUMBER_ID + "/messages";
    UrlFetchApp.fetch(url, {
      method: "post",
      contentType: "application/json",
      headers: { Authorization: "Bearer " + WHATSAPP_CONFIG.ACCESS_TOKEN },
      payload: JSON.stringify({ messaging_product: "whatsapp", to: to, type: "text", text: { body: message } }),
      muteHttpExceptions: true
    });
  } catch (e) {}
}

function sendWhatsAppImage(to, imageUrl, caption) {
  if (isNotificationSuppressed()) return;
  try {
    const url = "https://graph.facebook.com/v19.0/" + WHATSAPP_CONFIG.PHONE_NUMBER_ID + "/messages";
    UrlFetchApp.fetch(url, {
      method: "post",
      contentType: "application/json",
      headers: { Authorization: "Bearer " + WHATSAPP_CONFIG.ACCESS_TOKEN },
      payload: JSON.stringify({
        messaging_product: "whatsapp", to: to, type: "image", image: { link: imageUrl, caption: caption }
      }),
      muteHttpExceptions: true
    });
  } catch (e) {}
}

function triggerWhatsAppCampaign(contactName, contactEmail, contactPhone, sessionDate, sessionTime) {
  // Pure Meta WhatsApp Cloud API automation for AI Filmmaking (100% isolated from ai_masterclass AIFunnels)
  if (isNotificationSuppressed() || isAuthorizedLiveTest(contactEmail, 1)) return;
  const cleanTo = String(contactPhone || "").replace(/\D/g, "");
  if (!cleanTo) return;
  const toPhone = cleanTo.length === 10 ? ("91" + cleanTo) : cleanTo;
  const dateStr = sessionDate || getUpcomingWebinarTime().toDateString();
  const timeStr = sessionTime || "10:00 AM – 1:00 PM IST (3 Hours)";

  if (WHATSAPP_CONFIG.POSTER_URL) {
    sendWhatsAppImage(toPhone, WHATSAPP_CONFIG.POSTER_URL, "3-Hours AI Filmmaking & Video Generation Live Webinar");
  }

  let welcomeMsg = "Welcome, " + (contactName || "Creator") + "! 🎬 Your registration is confirmed for the 3-Hours AI Filmmaking & Video Generation Live Webinar (Basic & Foundation Session).\n\n";
  welcomeMsg += "📅 Date: " + dateStr + " (Sunday Morning)\n";
  welcomeMsg += "🕒 Time: " + timeStr + "\n";
  welcomeMsg += "📚 Modules: 1. AI Logo Animation | 2. AI Avatar Creation | 3. AI Video Generation\n\n";
  welcomeMsg += "📄 Note: Your official GST Tax Invoice has been sent to your registered email address.\n\n";
  welcomeMsg += "Please join our exclusive WhatsApp Community below to receive the live session link & materials:\n" + WHATSAPP_CONFIG.WA_GROUP_LINK + "\n\n";
  welcomeMsg += "If you have any doubts, feel free to call or WhatsApp us at +91 63792 09689.";

  sendWhatsAppText(toPhone, welcomeMsg);
}

function createCalendarInvite(email, name, sessionDate, sessionTime) {
  // Disabled as per user request to prevent Google Meet attachments in learner emails
  return null;
}

function markWhatsappClicked(orderId, phone) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME_REG) || ss.getSheets()[0];
  const layout = getRegSheetLayout(sheet);
  const data = sheet.getDataRange().getValues();
  const cleanOrder = String(orderId || "").trim();
  const cleanPhone10 = String(phone || "").replace(/\D/g, "").slice(-10);
  let matched = false;
  for (let i = data.length - 1; i >= 1; i--) {
    const rowOrder = String(data[i][layout.orderId] || "").trim();
    const rowPhone10 = String(data[i][3] || "").replace(/\D/g, "").slice(-10);
    if ((cleanOrder && rowOrder === cleanOrder) || (cleanPhone10 && cleanPhone10.length === 10 && rowPhone10 === cleanPhone10)) {
      sheet.getRange(i + 1, layout.whatsappClicked + 1).setValue("CHATTED ✅");
      matched = true;
      break;
    }
  }
  return matched;
}

function sendWhatsAppTemplate(to, templateName, parameters) {
  if (isNotificationSuppressed()) return { success: true, suppressed: true };
  try {
    const url = "https://graph.facebook.com/v19.0/" + WHATSAPP_CONFIG.PHONE_NUMBER_ID + "/messages";
    const res = UrlFetchApp.fetch(url, {
      method: "post",
      contentType: "application/json",
      headers: { Authorization: "Bearer " + WHATSAPP_CONFIG.ACCESS_TOKEN },
      payload: JSON.stringify({
        messaging_product: "whatsapp",
        to: to,
        type: "template",
        template: {
          name: templateName,
          language: { code: "en" },
          components: [
            {
              type: "body",
              parameters: parameters.map(function(param) { return { type: "text", text: String(param) }; })
            }
          ]
        }
      }),
      muteHttpExceptions: true
    });
    writeToLogs("WA_TEMPLATE_SEND", "To: " + to + " | Template: " + templateName + " | Response: " + res.getContentText());
  } catch (e) {
    writeToLogs("WA_TEMPLATE_ERROR", e.message);
  }
}

function checkAndSendReminders() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME_REG) || ss.getSheets()[0];
  const layout = getRegSheetLayout(sheet);
  const data = sheet.getDataRange().getValues();
  const now = new Date();
  const webinarTime = getUpcomingWebinarTime();
  const hoursLeft = (webinarTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursLeft < -24) return;

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[layout.status] !== "✅ PAID") continue;

    const phone = row[3] ? row[3].toString().replace(/\D/g, '') : "";
    if (!phone) continue;
    const name = String(row[1] || "Learner").replace(/^'/, "");

    try {
      if (hoursLeft <= 24 && hoursLeft > 2 && row[layout.reminder24h] === "NO") {
        sendWhatsAppTemplate(phone, "webinar_24h_reminder", [name]);
        sheet.getRange(i + 1, layout.reminder24h + 1).setValue("SENT ✅");
      } else if (hoursLeft <= 2 && hoursLeft > 0.25 && row[layout.reminder2h] === "NO") {
        sendWhatsAppTemplate(phone, "webinar_2h_reminder", [name]);
        sheet.getRange(i + 1, layout.reminder2h + 1).setValue("SENT ✅");
      } else if (hoursLeft <= 0.25 && hoursLeft > -0.5 && row[layout.reminder15m] === "NO") {
        sendWhatsAppTemplate(phone, "webinar_15m_reminder", [name, WHATSAPP_CONFIG.WA_GROUP_LINK]);
        sheet.getRange(i + 1, layout.reminder15m + 1).setValue("SENT ✅");
      }
    } catch (e) {
      writeToLogs("REMINDER_ERROR", "Row " + (i + 1) + ": " + e.message);
    }
  }
}

function reconcileAiFilmmakingRows() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME_REG) || ss.getSheets()[0];
  const layout = getRegSheetLayout(sheet);
  const rows = sheet.getDataRange().getValues();
  let resolvedCount = 0;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const status = String(row[layout.status] || "").trim();
    const orderId = String(row[layout.orderId] || "").trim();
    const payId = String(row[layout.paymentId] || "").trim().replace(/^'/, "");
    if (payId.startsWith("pay_") && status !== "✅ PAID" && !status.includes("TEST_VERIFIED")) {
      const name = String(row[1] || "Learner").replace(/^'/, "");
      const email = String(row[2] || "").replace(/^'/, "");
      const phoneClean = row[3] ? row[3].toString().replace(/\D/g, '') : "";
      const amount = Number(row[6]) || 99;
      const sessionDate = row[layout.sessionDate] || getUpcomingWebinarTime().toDateString();
      const sessionTime = row[layout.sessionTime] || "10:00 AM – 1:00 PM IST";
      const modeOrLang = row[5] || "";

      sendMasterclassEmail(email, name, sessionDate, sessionTime, amount, payId, orderId, phoneClean, modeOrLang);
      sheet.getRange(i + 1, layout.status + 1).setValue("✅ PAID");
      sheet.getRange(i + 1, layout.emailStatus + 1).setValue("SENT ✅");
      resolvedCount++;
    }
  }
  SpreadsheetApp.flush();
  return `Reconciliation complete. Resolved ${resolvedCount} rows.`;
}

function setupAutoReconcileTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "reconcileAiFilmmakingRows") {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  ScriptApp.newTrigger("reconcileAiFilmmakingRows")
    .timeBased()
    .everyMinutes(5)
    .create();
  return "Auto-reconcile trigger installed (every 5 minutes).";
}

function writeToLogs(event, data) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let logSheet = ss.getSheetByName(SHEET_NAME_LOGS) || ss.insertSheet(SHEET_NAME_LOGS);
    logSheet.appendRow([new Date(), event, data]);
  } catch (e) {}
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
