/**
 * ============================================================================
 * CLAUDE MASTERCLASS 2026 — EXCLUSIVE GOOGLE APPS SCRIPT AUTOMATION SYSTEM
 * Technical logs go to "Logs" | Registrations go to "Sheet1"
 * ============================================================================
 */

const DEFAULT_SPREADSHEET_ID = "1JA3FZf8xkpZ8GjuYiETXz9R0ivfW80-rf3PZIzQum9g";
const SPREADSHEET_ID = null;
const SHEET_NAME_REG = "Sheet1";
const SHEET_NAME_LOGS = "Logs";
const EXPECTED_PRODUCT_KEY = "claude_masterclass";

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
  // Claude Masterclass production script defaults to "production" when deployed (prevents MISSING_ENVIRONMENT runtime failure)
  return "production";
}

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

function getClaudeSpreadsheet() {
  let ss = null;
  try {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  } catch (e) {}

  const targetId = getSpreadsheetId();
  if (!ss && targetId) {
    try {
      ss = SpreadsheetApp.openById(targetId);
    } catch (e) {
      throw new Error("Cannot open Spreadsheet ID " + targetId + ".");
    }
  }
  if (!ss) {
    throw new Error("Spreadsheet container not found.");
  }
  assertSpreadsheetIsolation(ss);
  return ss;
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

function isAuthorizedLiveTest(email, amount) {
  const cleanEmail = String(email || "").trim().toLowerCase();
  const numAmount = Number(amount) || 0;
  return (cleanEmail === "ambroseselva001@gmail.com" || cleanEmail === "techtycoondigitalsolutions@gmail.com" || cleanEmail === "techtycoondigitors@gmail.com") && numAmount === 1;
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

// Deprecated static constants removed for staging isolation: dynamic getters implemented
const RAZORPAY_KEY_ID = null;
const RAZORPAY_KEY_ID_INTL = null;

const WHATSAPP_CONFIG = {
  get ACCESS_TOKEN() { return getScriptSecret("WHATSAPP_ACCESS_TOKEN"); },
  get PHONE_NUMBER_ID() { return getWhatsAppPhoneNumberId(); },
  PHONE_NUMBER: "917010340494", 
  WA_GROUP_LINK_CLAUDE_ONLINE: "https://chat.whatsapp.com/HfVfYc6ea7iEHAMFjOb4WS",
  WA_GROUP_LINK_CLAUDE_OFFLINE: "https://chat.whatsapp.com/DMp2tRRhjwN1fziYujeQhb",
  POSTER_URL: "https://aitycoon.in/claude_masterclass/images/poster_v2.jpg" 
};

const TRIGGER_MESSAGE_ONLINE = "Hello Tech Tycoon Team I successfully complete the registration of claude masterclass online session";
const TRIGGER_MESSAGE_OFFLINE = "Hello Tech Tycoon Team I successfully complete the registration claude masterclass offline session";

// ------------------------------------------------------------
// FUNNELSDONE PRIVATE INTEGRATION API v2 + GST PDF INVOICE CONFIG
// ------------------------------------------------------------
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
  ADDRESS_LINE1: "No. 3/59B, 1st Floor, 3rd Street, Ragava Nagar",
  CITY: "Moovarasampet, Chennai",
  STATE: "TAMILNADU",
  POSTAL_CODE: "600091"
};

/**
 * Ensures registration is exclusively for Claude Masterclass and filters out ₹99 / ₹117 AI Masterclass rows.
 */
function isClaudeRegistration(data) {
  if (!data) return false;
  const amount = parseInt(data.amount) || 0;
  const promo = (data.promoCode || "").toString().toUpperCase();
  const prod = (data.product || "").toString().toLowerCase();
  const batch = (data.batch || "").toString().toLowerCase();
  const pageUrl = (data.pageUrl || "").toString().toLowerCase();
  const modeOfSession = (data.modeOfSession || "").toString().toLowerCase();
  
  // Explicitly allow any test payment or registration originating from Claude Masterclass
  if (pageUrl.includes("claude_masterclass") || modeOfSession.includes("online") || modeOfSession.includes("offline") || promo.includes("CLAUDE") || batch.includes("claude")) {
    if ((amount === 99 || amount === 117) && !promo.includes("CLAUDE")) return false;
    return true;
  }
  
  // Exclude ₹99 / ₹117 or AI Masterclass / Secrets Revealed registrations from other apps
  if (amount === 99 || amount === 117) return false;
  if (prod.includes("secret") || batch.includes("secret") || (batch.includes("ai masterclass") && !batch.includes("claude"))) return false;
  return true;
}

function getUpcomingMasterclassWeekend(nowDate) {
  const now = nowDate ? new Date(nowDate.getTime()) : new Date();
  // Baseline minimum Saturday: October 24, 2026
  const minSat = new Date(2026, 9, 24, 18, 0, 0); // Month 9 = October

  const day = now.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  let daysUntilSat = (6 - day + 7) % 7;

  if (day === 6 && now.getHours() >= 21) {
    daysUntilSat = 7;
  } else if (day === 0) {
    daysUntilSat = 6;
  }

  let nextSat = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilSat, 18, 0, 0);
  if (nextSat.getTime() < minSat.getTime()) {
    nextSat = minSat;
  }

  const nextSun = new Date(nextSat.getFullYear(), nextSat.getMonth(), nextSat.getDate() + 1, 18, 0, 0);

  const fullMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const satM = fullMonths[nextSat.getMonth()];
  const sunM = fullMonths[nextSun.getMonth()];
  const satMShort = shortMonths[nextSat.getMonth()];
  const sunMShort = shortMonths[nextSun.getMonth()];

  const satDay = nextSat.getDate();
  const sunDay = nextSun.getDate();
  const year = nextSat.getFullYear();

  const isSameMonth = satM === sunM;
  const shortRange = isSameMonth ? (satM + " " + satDay + " & " + sunDay) : (satMShort + " " + satDay + " & " + sunMShort + " " + sunDay);
  const dateRange = isSameMonth ? (satM + " " + satDay + " & " + sunDay + ", " + year) : (satM + " " + satDay + " & " + sunM + " " + sunDay + ", " + year);
  const fullDisplay = dateRange + " (Saturday & Sunday)";

  return {
    targetTimestamp: nextSat.getTime(),
    satDateText: "Saturday, " + satM + " " + satDay,
    sunDateText: "Sunday, " + sunM + " " + sunDay,
    shortRange: shortRange,
    dateRange: dateRange,
    fullDisplay: fullDisplay
  };
}

function getNextSaturday(fromDate) {
  const weekend = getUpcomingMasterclassWeekend(fromDate);
  return new Date(weekend.targetTimestamp);
}

function getUpcomingMasterclassDates(isOffline) {
  if (isOffline) {
    return {
      dateText: "Coming Soon (Dates to be announced)",
      timeText: "9:00 AM – 5:30 PM IST",
      venueText: "🏨 Vestin Park Hotel, Egmore, Chennai"
    };
  }

  const weekend = getUpcomingMasterclassWeekend();
  return {
    dateText: weekend.fullDisplay,
    timeText: "6:00 PM – 9:00 PM IST",
    venueText: "🌐 Live Online Virtual Classroom"
  };
}

function doGet(e) {
  const params = (e && e.parameter) ? e.parameter : {};
  const verifyToken = getOptionalScriptSecret("WEBHOOK_VERIFY_TOKEN");

  if (params['hub.mode'] === 'subscribe' && verifyToken && params['hub.verify_token'] === verifyToken) {
    return ContentService.createTextOutput(params['hub.challenge']);
  }

  if (params.action === 'getVerifiedInvoice') {
    const ss = getClaudeSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME_REG) || ss.getSheets()[0];
    return createJsonResponse(getVerifiedInvoiceRecord(sheet, params.paymentId, params.orderId, params.token, params.email || params.phone || params.contact));
  }
  
  if (params.action === 'whatsapp') {
    markWhatsappClicked(params.orderId);
    const isOffline = params.mode === 'offline';
    const msgText = isOffline ? TRIGGER_MESSAGE_OFFLINE : TRIGGER_MESSAGE_ONLINE;
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
    
    const ss = getClaudeSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME_REG) || ss.getSheets()[0];
    const values = sheet.getDataRange().getValues();
    
    const list = [];
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      if (!row[0] && !row[1] && !row[2]) continue;
      
      const amount = Number(row[6] || 0);
      const promoCol = (row[19] || "").toString().toLowerCase();
      if ((amount === 99 || amount === 117) && !promoCol.includes("claude")) continue;

      let dateStr = "";
      if (row[0]) {
        try {
          dateStr = row[0] instanceof Date ? row[0].toISOString() : new Date(row[0]).toISOString();
        } catch (errDate) {
          dateStr = row[0].toString();
        }
      }

      list.push({
        timestamp: dateStr,
        name: row[1] || "",
        email: row[2] || "",
        phone: row[3] ? row[3].toString() : "",
        profession: row[4] || "",
        language: row[5] || "Claude Masterclass",
        amount: amount,
        status: row[7] || "INITIATED",
        orderId: row[8] || "",
        paymentId: row[9] || "",
        emailStatus: row[10] || "",
        whatsappClicked: row[11] || "",
        pageUrl: "https://aitycoon.in/claude_masterclass",
        batch: "Claude Masterclass",
        sessionDate: getUpcomingMasterclassDates(amount >= 4000 || (row[5] || "").toString().toLowerCase().includes("offline")).dateText,
        sessionTime: getUpcomingMasterclassDates(amount >= 4000 || (row[5] || "").toString().toLowerCase().includes("offline")).timeText
      });
    }
    
    list.reverse();
    return createJsonResponse({ success: true, registrations: list, count: list.length });
  }

  return ContentService.createTextOutput("Claude MasterClass Automation is running.");
}

function doPost(e) {
  const rawData = (e && e.postData && e.postData.contents) ? e.postData.contents : "{}";
  writeToLogs("RAW_WEBHOOK", rawData.substring(0, 500));

  try {
    const body = JSON.parse(rawData);

    if (body.action === "getVerifiedInvoice") {
      const ss = getClaudeSpreadsheet();
      const sheet = ss.getSheetByName(SHEET_NAME_REG) || ss.getSheets()[0];
      return createJsonResponse(getVerifiedInvoiceRecord(sheet, body.paymentId, body.orderId, body.token, body.email || body.phone || body.contact));
    }

    if (body.event === "payment.captured" || body.event === "order.paid") {
      const paymentEntity = body.payload && body.payload.payment && body.payload.payment.entity;
      if (!paymentEntity || !paymentEntity.order_id || !paymentEntity.id) {
        return createJsonResponse({ success: false, error: "Invalid webhook payment entity" });
      }
      const notes = paymentEntity.notes || {};
      const res = updatePaymentStatusFromWebhook(
        paymentEntity.order_id,
        paymentEntity.id,
        paymentEntity.email,
        notes,
        paymentEntity.amount,
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
      if (!isClaudeRegistration(body)) return createJsonResponse({ success: false, message: "Ignored non-Claude payment" });
      const res = updatePaymentStatus(body);
      return createJsonResponse(res);
    }

    if (body.name && body.email && body.phone && !body.object) {
      if (!isClaudeRegistration(body)) return createJsonResponse({ success: false, message: "Ignored non-Claude lead" });
      const orderId = createRazorpayOrder(body);
      saveToSheet(body, orderId);
      return createJsonResponse({ success: true, orderId: orderId });
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
  const phone10 = getLast10Digits(phone);

  const isClaudeMsg = textReceived.includes("claude") || 
                      textReceived.includes("masterclass") || 
                      textReceived.includes("completed registration") ||
                      textReceived.includes("complete the registration") ||
                      textReceived.includes("tech tycoon team") ||
                      textReceived.includes("online") ||
                      textReceived.includes("offline");

  if (!isClaudeMsg) return;

  let isOfflineMsg = textReceived.includes("offline") || textReceived.includes("in-person") || textReceived.includes("chennai");
  const dates = getUpcomingMasterclassDates(isOfflineMsg);
  sendWhatsAppImage(phone, WHATSAPP_CONFIG.POSTER_URL, "Claude MasterClass 2026");

  if (isOfflineMsg) {
    let welcomeMsg = "Welcome! 🎉 Your registration is confirmed for the Claude MasterClass (In-Person Workshop).\n\n";
    welcomeMsg += `📍 Venue: ${dates.venueText}\n`;
    welcomeMsg += `📅 Date: ${dates.dateText}\n`;
    welcomeMsg += `🕒 Time: ${dates.timeText}\n`;
    welcomeMsg += `🍱 Luxury Buffet Lunch & High Tea Included\n`;
    welcomeMsg += `💻 Bring your laptop with internet connectivity\n\n`;
    welcomeMsg += "Please join our exclusive In-Person WhatsApp Community below for venue instructions & updates:\n" + WHATSAPP_CONFIG.WA_GROUP_LINK_CLAUDE_OFFLINE;
    
    sendWhatsAppText(phone, welcomeMsg);
  } else {
    let welcomeMsg = "Welcome! 🎉 Your registration is confirmed for the Claude MasterClass (Online Live Session).\n\n";
    welcomeMsg += `📍 Platform: ${dates.venueText}\n`;
    welcomeMsg += `📅 Date: ${dates.dateText}\n`;
    welcomeMsg += `🕒 Time: ${dates.timeText}\n\n`;
    welcomeMsg += "Please join our exclusive Online WhatsApp Community below to receive session links:\n" + WHATSAPP_CONFIG.WA_GROUP_LINK_CLAUDE_ONLINE;
    
    sendWhatsAppText(phone, welcomeMsg);
  }
}

// ------------------------------------------------------------
// DUAL GST INVOICE: OUR PDF BLOB + FUNNELSDONE API v2 SYNC
// ------------------------------------------------------------
function sanitizeCell(val) {
  if (val === null || val === undefined) return "";
  const str = String(val).replace(/[\u0000-\u001F\u007F]/g, "").trim();
  if (/^[=+\-@\t\r]/.test(str)) return "'" + str;
  return str;
}

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
  8259: 6999,
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
      if (typeof writeToLogs === "function") {
        writeToLogs("GST_SALES_REGISTER_SKIP", "Test transaction for " + customerEmail + " skipped from GST Sales Register.");
      }
      return;
    }
    let ss = null;
    try { ss = SpreadsheetApp.getActiveSpreadsheet(); } catch (e) {}
    if (!ss) {
      try { ss = getClaudeSpreadsheet(); } catch (e) {}
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
  const invNumber = invoiceNo || ("TT/26-27/" + String(paymentId || orderId || Date.now()).replace(/[^A-Za-z0-9]/g, "").slice(-6).toUpperCase());
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

  // Staging isolation: Mock invoice adapter active by default in staging
  if (isMockInvoiceAdapterEnabled()) {
    const mockInvNum = "STAGE-INV-" + (cleanPayId.replace(/\D/g, "").slice(-4) || "1001");
    Logger.log("MOCK_INVOICE_ADAPTER: Staging mock invoice generated: " + mockInvNum);
    if (typeof writeToLogs === "function") {
      writeToLogs("MOCK_INVOICE_ADAPTER", "Mock invoice generated: " + mockInvNum);
    }
    if (props && cleanPayId) {
      props.setProperty("INVOICE_STATE_" + cleanPayId, "RESOLVED");
      props.setProperty("VERIFIED_INV_" + cleanPayId, mockInvNum);
    }
    return mockInvNum;
  }

  // Authorized live ₹1 test payment isolation:
  if (isAuthorizedLiveTest(customerEmail, totalAmount)) {
    const mockInvNum = "TEST-TT/26-27/" + (cleanPayId.replace(/\D/g, "").slice(-4) || "1001");
    Logger.log("AUTHORIZED_TEST_PAYMENT: Live test payment processed with test invoice: " + mockInvNum);
    if (typeof writeToLogs === "function") {
      writeToLogs("AUTHORIZED_TEST_PAYMENT", "Live test invoice generated: " + mockInvNum);
    }
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
      writeToLogs("INVOICE_RECOVERY", "Detected previous uncertain invoice state for payment " + cleanPayId + ". Attempting idempotent lookup.");
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
      "Authorization": "Bearer " + FUNNELSDONE_CONFIG.PIT_TOKEN,
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
      tags: ["claude_masterclass_paid", "gst_invoice_issued"]
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
      writeToLogs("FUNNELSDONE_CONTACT_ERR", contactRes.getContentText());
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
              writeToLogs("INVOICE_VALIDATION_SKIP", "Candidate invoice missing authoritative ID or invoiceNumber: " + JSON.stringify(inv));
              continue;
            }

            // 2. Customer Identity Check: contactId must match if present
            const invContactId = String(inv.contactId || (inv.contact && inv.contact._id) || "").trim();
            if (invContactId && invContactId !== String(contactId).trim()) {
              writeToLogs("INVOICE_VALIDATION_SKIP", "Contact ID mismatch on invoice " + invId + ": received '" + invContactId + "', expected '" + contactId + "'");
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
            if (!invProductName.includes("claude")) {
              writeToLogs("INVOICE_VALIDATION_SKIP", "Course mismatch on invoice " + invId + " for claude_masterclass: " + invProductName);
              continue;
            }

            // 5. Amount and Currency Check
            if (inv.currency && String(inv.currency).trim().toUpperCase() !== "INR") {
              writeToLogs("INVOICE_VALIDATION_SKIP", "Currency mismatch on invoice " + invId + ": " + inv.currency + " expected INR");
              continue;
            }
            const invAmount = inv.total !== undefined ? Number(inv.total) : (inv.amount !== undefined ? Number(inv.amount) : null);
            if (invAmount !== null && !isNaN(invAmount) && totalAmount) {
              const expectedAmt = Number(totalAmount);
              if (Math.abs(invAmount - expectedAmt) > 1.0) {
                writeToLogs("INVOICE_VALIDATION_SKIP", "Amount mismatch on invoice " + invId + ": " + invAmount + " expected " + expectedAmt);
                continue;
              }
            }

            // 6. Status check: Void or cancelled invoices cannot be recovered
            const invStatus = String(inv.status || "").toLowerCase();
            if (invStatus === "void" || invStatus === "cancelled" || invStatus === "deleted") {
              writeToLogs("INVOICE_VALIDATION_SKIP", "Invoice " + invId + " has void/cancelled status: " + invStatus);
              continue;
            }

            candidateMatches.push(inv);
          }

          if (candidateMatches.length === 1) {
            const singleInv = candidateMatches[0];
            const matchedNo = singleInv.invoiceNumberPrefix ? (singleInv.invoiceNumberPrefix + singleInv.invoiceNumber) : ("TT/26-27/" + singleInv.invoiceNumber);
            writeToLogs("INVOICE_RECOVERED", "Found exactly one verified invoice " + matchedNo + " for payment " + cleanPayId);
            props.setProperty("INVOICE_STATE_" + cleanPayId, "RESOLVED");
            props.setProperty("VERIFIED_INV_" + cleanPayId, matchedNo);
            return matchedNo;
          } else if (candidateMatches.length > 1) {
            writeToLogs("AMBIGUOUS_INVOICE_MATCH", "Found " + candidateMatches.length + " candidate invoices for payment " + cleanPayId + ". Retaining uncertain state.");
            props.setProperty("INVOICE_STATE_" + cleanPayId, "UNCERTAIN_INVOICE_PENDING");
            return null; // Ambiguous: do NOT create duplicate, hold for reconciliation
          } else {
            writeToLogs("ZERO_INVOICE_MATCH", "Zero matching invoices found for payment " + cleanPayId + ". Retaining uncertain state.");
            props.setProperty("INVOICE_STATE_" + cleanPayId, "UNCERTAIN_INVOICE_PENDING");
            return null; // Zero matches: do NOT blindly create a second invoice, retain uncertain state!
          }
        } else {
          writeToLogs("INVOICE_LOOKUP_FAILED", "FunnelsDone lookup HTTP " + queryRes.getResponseCode() + ". Retaining uncertain state.");
          props.setProperty("INVOICE_STATE_" + cleanPayId, "UNCERTAIN_INVOICE_PENDING");
          return null;
        }
      } catch (qErr) {
        writeToLogs("INVOICE_LOOKUP_WARN", "Failed to query existing FunnelsDone invoices: " + qErr.message);
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
    const nextInvoiceNumber = numJson.invoiceNumber || String(Math.floor(100000 + Math.random() * 900000));

    // 3. Create Draft Invoice in FunnelsDone with 9% CGST + 9% SGST
    const acct = getInvoiceAccountingBreakdown(totalAmount);
    const total = acct.total;
    const isTest = acct.isTest;
    const baseAmt = acct.baseAmt;
    const todayStr = Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyy-MM-dd");

    const createPayload = {
      altId: FUNNELSDONE_CONFIG.LOCATION_ID,
      altType: "location",
      name: courseName || "Claude MasterClass 2026",
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
          name: courseName || "Claude MasterClass 2026",
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
      writeToLogs("FUNNELSDONE_INV_ERR", invRes.getContentText());
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
    writeToLogs("FUNNELSDONE_INVOICE_PAID", "Invoice TT/26-27/" + nextInvoiceNumber + " (" + invoiceId + ") recorded: " + payRes.getResponseCode());
    if (props && cleanPayId) {
      props.setProperty("INVOICE_STATE_" + cleanPayId, "RESOLVED");
    }
    return "TT/26-27/" + nextInvoiceNumber;
  } catch (err) {
    writeToLogs("FUNNELSDONE_SYNC_ERROR", err.message);
    if (props && cleanPayId) {
      props.setProperty("INVOICE_STATE_" + cleanPayId, "UNCERTAIN_INVOICE_PENDING");
    }
    return null;
  }
}

function sendMasterclassEmail(email, name, amount, mode, paymentId, orderId, phone) {
  const numAmount = parseInt(amount) || 589;
  const isOffline = (mode && mode.toString().toLowerCase() === 'offline') || numAmount >= 4000;
  const dates = getUpcomingMasterclassDates(isOffline);
  const courseTitle = isOffline ? "Claude MasterClass 2026 (In-Person Workshop Chennai)" : "Claude MasterClass 2026 (Online Live Session)";

  // 1. Sync with FunnelsDone Private Integration API & get official Invoice Number
  const fdInvoiceNo = syncInvoiceWithFunnelsDone(name, email, phone, courseTitle, numAmount, paymentId, orderId);
  if (!fdInvoiceNo) {
    const props = PropertiesService.getScriptProperties();
    const invState = props ? props.getProperty("INVOICE_STATE_" + paymentId) : "";
    if (invState === "UNCERTAIN_INVOICE_PENDING" || invState === "INVOICE_REQUEST_PENDING") {
      writeToLogs("HOLDING_CONFIRMATION_EMAIL", "FunnelsDone invoice outcome is uncertain for payment " + paymentId + ". Holding customer confirmation.");
      writeToLogs("INVOICE_PENDING_HOLD", "FunnelsDone invoice outcome is uncertain for payment " + paymentId + ". Holding customer confirmation.");
      return { invoiceNumber: null, courseTitle: courseTitle, uncertain: true };
    }
  }

  // 2. Generate our side's official GST Tax Invoice PDF attachment
  let pdfAttachment = null;
  try {
    pdfAttachment = generateOurGstInvoicePdfBlob(name, email, phone, courseTitle, numAmount, paymentId, orderId, fdInvoiceNo);
  } catch (pdfErr) {
    writeToLogs("PDF_GEN_ERROR", pdfErr.message);
  }
  
  if (isNotificationSuppressed() || isAuthorizedLiveTest(email, numAmount)) {
    Logger.log("NOTIFICATION_SUPPRESSED: Email to " + email + " suppressed (authorized test/staging)");
    if (typeof writeToLogs === "function") {
      writeToLogs("NOTIFICATION_SUPPRESSED", "Email suppressed to " + email);
    }
    return { invoiceNumber: fdInvoiceNo, courseTitle: courseTitle, suppressed: true };
  }

  if (isOffline) {
    const dateVal = dates.dateText;
    const timeVal = dates.timeText;
    const venueVal = dates.venueText;
    const passType = "In-Person MasterClass Pass (Vestin Park Hotel, Chennai)";
    const waGroupLink = WHATSAPP_CONFIG.WA_GROUP_LINK_CLAUDE_OFFLINE;
    const perksText = "<p style='color:#da7756;font-weight:bold;margin:8px 0;'>🍱 Luxury Hotel Buffet Lunch & High Tea Included ✅</p><p style='color:#6B4FBB;font-weight:bold;margin:8px 0;'>💻 Bring your laptop with internet connectivity ✅</p>";
    const subject = `🎉 Registration Confirmed & GST Invoice: In-Person MasterClass Chennai (${dateVal})`;

    const htmlBody = `<!DOCTYPE html><html><body style="margin:0;padding:0;background-color:#0d0d12;font-family:sans-serif;color:#f0f0f5;">
    <div style="max-width:600px;margin:20px auto;background:#16161e;border:1px solid #da7756;border-radius:24px;padding:32px;text-align:center;">
      <h1 style="color:#ffffff;">🏨 Claude MasterClass — In-Person Chennai</h1>
      <p>Welcome, <strong>${name}</strong>!</p>
      <p>Your payment for <strong>${passType}</strong> @ ₹${numAmount} (Incl. GST) was successful. Your official <strong>GST Tax Invoice (PDF)</strong> is attached to this email.</p>
      ${perksText}
      <p>📍 <strong>${venueVal}</strong></p>
      <p>📅 <strong>${dateVal}</strong> | 🕒 <strong>${timeVal}</strong></p>
      <a href="${waGroupLink}" style="display:inline-block;background:#da7756;color:#fff;padding:14px 28px;border-radius:50px;text-decoration:none;font-weight:bold;margin-top:16px;">📱 Join In-Person WhatsApp Community</a>
      <p style="color:#94a3b8;font-size:11px;margin-top:24px;">© 2026 ${FUNNELSDONE_CONFIG.COMPANY_NAME} (GSTIN: ${FUNNELSDONE_CONFIG.COMPANY_GSTIN})<br/>No. 3/59B, 1st Floor, 3rd Street, Ragava Nagar, Moovarasampet, Chennai-600091</p>
    </div></body></html>`;

    const emailOptions = { to: email, subject: subject, htmlBody: htmlBody, name: "Tech Tycoon", replyTo: "techtycoondigitalsolutions@gmail.com" };
    if (pdfAttachment) emailOptions.attachments = [pdfAttachment];
    MailApp.sendEmail(emailOptions);

  } else {
    const dateVal = dates.dateText;
    const timeVal = dates.timeText;
    const venueVal = dates.venueText;
    const isRecordingPass = numAmount === 999 || numAmount === 1179 || numAmount >= 1800;
    const passType = isRecordingPass ? "Live + Recording Pass (Recorded Video Access)" : "Standard Live Session Pass";
    const waGroupLink = WHATSAPP_CONFIG.WA_GROUP_LINK_CLAUDE_ONLINE;
    const recText = isRecordingPass ? "<p style='color:#10b981;font-weight:bold;margin:8px 0;'>⭐ Recorded Video Access Included ✅</p>" : "";
    const subject = `🎉 Registration Confirmed & GST Invoice: Claude MasterClass Online (${dateVal})`;

    const htmlBody = `<!DOCTYPE html><html><body style="margin:0;padding:0;background-color:#0d0d12;font-family:sans-serif;color:#f0f0f5;">
    <div style="max-width:600px;margin:20px auto;background:#16161e;border:1px solid #da7756;border-radius:24px;padding:32px;text-align:center;">
      <h1 style="color:#ffffff;">🤖 Claude MasterClass — Online Live</h1>
      <p>Welcome, <strong>${name}</strong>!</p>
      <p>Your payment for <strong>${passType}</strong> @ ₹${numAmount} (Incl. GST) was successful. Your official <strong>GST Tax Invoice (PDF)</strong> is attached to this email.</p>
      ${recText}
      <p>📍 <strong>${venueVal}</strong></p>
      <p>📅 <strong>${dateVal}</strong> | 🕒 <strong>${timeVal}</strong></p>
      <a href="${waGroupLink}" style="display:inline-block;background:#da7756;color:#fff;padding:14px 28px;border-radius:50px;text-decoration:none;font-weight:bold;margin-top:16px;">📱 Join Online WhatsApp Community</a>
      <p style="color:#94a3b8;font-size:11px;margin-top:24px;">© 2026 ${FUNNELSDONE_CONFIG.COMPANY_NAME} (GSTIN: ${FUNNELSDONE_CONFIG.COMPANY_GSTIN})<br/>No. 3/59B, 1st Floor, 3rd Street, Ragava Nagar, Moovarasampet, Chennai-600091</p>
    </div></body></html>`;

    const emailOptions = { to: email, subject: subject, htmlBody: htmlBody, name: "Tech Tycoon", replyTo: "techtycoondigitalsolutions@gmail.com" };
    if (pdfAttachment) emailOptions.attachments = [pdfAttachment];
    MailApp.sendEmail(emailOptions);
  }
  return { invoiceNumber: fdInvoiceNo, courseTitle: courseTitle };
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

function verifyRazorpayPaymentSignature(orderId, paymentId, signature, isIntl) {
  const cleanOrderId = String(orderId || "").trim();
  const cleanPaymentId = String(paymentId || "").trim();
  const cleanSignature = String(signature || "").trim().toLowerCase();
  if (!/^order_[A-Za-z0-9]+$/.test(cleanOrderId)) return false;
  if (!/^pay_[A-Za-z0-9]+$/.test(cleanPaymentId)) return false;
  if (!/^[0-9a-f]{64}$/.test(cleanSignature)) return false;

  const payload = cleanOrderId + "|" + cleanPaymentId;
  const primaryKey = isIntl ? "RAZORPAY_KEY_SECRET_INTL" : "RAZORPAY_KEY_SECRET";
  const secret = getScriptSecret(primaryKey);
  const expectedSig = computeHmacSha256Hex(payload, secret);
  if (constantTimeEquals(expectedSig, cleanSignature)) return true;

  if (isIntl === undefined) {
    const altSecret = getOptionalScriptSecret("RAZORPAY_KEY_SECRET_INTL");
    if (altSecret) {
      const altExpected = computeHmacSha256Hex(payload, altSecret);
      if (constantTimeEquals(altExpected, cleanSignature)) return true;
    }
  }
  return false;
}

function verifyPaymentWithRazorpayServer(orderId, paymentId, expectedAmountInr, isIntl) {
  const cleanOrderId = String(orderId || "").trim();
  const cleanPaymentId = String(paymentId || "").trim();
  if (!/^order_[A-Za-z0-9]+$/.test(cleanOrderId)) {
    throw new Error("INVALID_ORDER_ID: Order ID format is invalid.");
  }
  if (!/^pay_[A-Za-z0-9]+$/.test(cleanPaymentId)) {
    throw new Error("FAKE_PAYMENT_ID: Payment ID format is invalid.");
  }
  const expectedPaise = Math.round(Number(expectedAmountInr) * 100);
  if (!expectedPaise || expectedPaise < 100) {
    throw new Error("INVALID_EXPECTED_AMOUNT: Expected course amount is invalid.");
  }

  const keyId = isIntl ? getRazorpayKeyId(true) : getRazorpayKeyId(false);
  const keySecret = getScriptSecret(isIntl ? "RAZORPAY_KEY_SECRET_INTL" : "RAZORPAY_KEY_SECRET");
  const credentials = Utilities.base64Encode(keyId + ":" + keySecret);
  const url = "https://api.razorpay.com/v1/payments/" + encodeURIComponent(cleanPaymentId);
  const res = UrlFetchApp.fetch(url, {
    method: "get",
    headers: { Authorization: "Basic " + credentials, "Content-Type": "application/json" },
    muteHttpExceptions: true
  });

  if (res.getResponseCode() !== 200) {
    throw new Error("FAKE_PAYMENT_ID: Razorpay API rejected payment ID (" + res.getResponseCode() + ").");
  }
  const payment = JSON.parse(res.getContentText() || "{}");
  if (!payment || payment.id !== cleanPaymentId) {
    throw new Error("FAKE_PAYMENT_ID: Payment record mismatch.");
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
  if (Number(payment.amount) !== expectedPaise) {
    throw new Error("AMOUNT_MISMATCH: Razorpay amount (" + payment.amount + " paise) does not match expected order amount (" + expectedPaise + " paise).");
  }
  return payment;
}

function saveVerifiedInvoiceRecord(paymentId, orderId, invoiceNumber, customerName, customerEmail, customerPhone, courseName, totalAmountPaid) {
  const record = {
    verified: true,
    paymentId: String(paymentId || "").trim(),
    orderId: String(orderId || "").trim(),
    invoiceNumber: invoiceNumber || ("TT/26-27/" + String(paymentId).replace(/[^A-Za-z0-9]/g, "").slice(-6).toUpperCase()),
    invoiceDate: Utilities.formatDate(new Date(), "Asia/Kolkata", "dd MMM yyyy"),
    customerName: sanitizeCell(customerName || "Learner"),
    customerEmail: sanitizeCell(customerEmail || ""),
    customerPhone: sanitizeCell(customerPhone || ""),
    courseName: sanitizeCell(courseName || "Claude MasterClass 2026"),
    totalAmountPaid: Number(totalAmountPaid) || 589
  };
  try {
    const props = PropertiesService.getScriptProperties();
    if (props) {
      props.setProperty("VERIFIED_INV_" + record.paymentId, JSON.stringify(record));
    }
  } catch (e) {}
  return record;
}

function getVerifiedInvoiceRecord(sheet, paymentId, orderId, token, userContact) {
  const cleanPayId = String(paymentId || "").trim();
  const cleanOrdId = String(orderId || "").trim();
  if (!/^pay_[A-Za-z0-9]+$/.test(cleanPayId) || !/^order_[A-Za-z0-9]+$/.test(cleanOrdId)) {
    return { success: false, verified: false, error: "Invalid paymentId or orderId reference." };
  }

  // Authorization Check: Verify time-limited invoice access token (<expiryTimestamp>.<hmacSignature>)
  // STRICT REQUIREMENT: Dedicated INVOICE_TOKEN_SECRET is required. Zero fallback to Razorpay secrets.
  let isAuthorized = false;
  const invSecret = getOptionalScriptSecret("INVOICE_TOKEN_SECRET");
  if (!invSecret) {
    if (typeof writeToLogs === "function") {
      writeToLogs("SECURITY_REJECT", "INVOICE_TOKEN_SECRET is not configured in Script Properties. Refusing invoice verification.");
    }
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
  try {
    const props = PropertiesService.getScriptProperties();
    const cached = props ? props.getProperty("VERIFIED_INV_" + cleanPayId) : null;
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.orderId === cleanOrdId && parsed.verified === true) {
        invRecord = parsed;
      }
    }
  } catch (e) {}

  if (!invRecord && sheet) {
    const rows = sheet.getDataRange().getValues();
    for (let i = rows.length - 1; i >= 1; i--) {
      const rowOrdId = String(rows[i][8] || "").trim();
      const rowPayId = String(rows[i][9] || "").trim().replace(/^'/, "");
      const rowStatus = String(rows[i][7] || "").trim();
      if (rowOrdId === cleanOrdId && rowPayId === cleanPayId && rowStatus === "✅ PAID") {
        const amt = Number(rows[i][6]) || 589;
        const courseTitle = amt >= 4000 ? "Claude MasterClass 2026 (In-Person Workshop Chennai)" : "Claude MasterClass 2026 (Online Live Session)";
        invRecord = {
          verified: true,
          status: "PAID",
          paymentId: cleanPayId,
          orderId: cleanOrdId,
          invoiceNumber: "TT/26-27/" + cleanPayId.replace(/[^A-Za-z0-9]/g, "").slice(-6).toUpperCase(),
          invoiceDate: Utilities.formatDate(new Date(), "Asia/Kolkata", "dd MMM yyyy"),
          customerName: String(rows[i][1] || "Learner").replace(/^'/, ""),
          customerEmail: String(rows[i][2] || "").replace(/^'/, ""),
          customerPhone: String(rows[i][3] || "").replace(/^'/, ""),
          courseName: courseTitle,
          totalAmountPaid: amt
        };
        break;
      }
    }
  }

  if (!invRecord) {
    return { success: false, verified: false, error: "Payment record not found or not verified." };
  }

  return { success: true, verified: true, invoice: invRecord };
}

function getRazorpayAccountTag(data) {
  const phoneStr = (data.phone || "").toString();
  const countryCode = (data.countryCode || "").toString();
  const isIntl = data.isInternational === true || 
                 (countryCode && countryCode !== '+91') || 
                 (phoneStr.startsWith('+') && !phoneStr.startsWith('+91'));
  return isIntl ? ("RZP: International (" + getRazorpayKeyId(true) + ")") : ("RZP: Domestic India (" + getRazorpayKeyId(false) + ")");
}

function createRazorpayOrder(data) {
  const isIntl = Boolean(data.isInternational || (data.countryCode && data.countryCode !== '+91'));
  const keyId = isIntl ? getRazorpayKeyId(true) : getRazorpayKeyId(false);
  const keySecret = getScriptSecret(isIntl ? "RAZORPAY_KEY_SECRET_INTL" : "RAZORPAY_KEY_SECRET");

  const credentials = Utilities.base64Encode(keyId + ":" + keySecret);
  const amount = parseInt(data.amount) || 589;
  const mode = data.mode || (amount >= 4000 ? "OFFLINE" : "ONLINE");

  const options = {
    method: "post",
    headers: { Authorization: "Basic " + credentials, "Content-Type": "application/json" },
    payload: JSON.stringify({
      amount: amount * 100,
      currency: "INR",
      notes: {
        product_key: "claude_masterclass",
        product: "claude_masterclass",
        course: "Claude Coding Masterclass",
        mode: mode,
        customer_email: data.email || "",
        customer_name: data.name || "",
        certificate: data.wantCertificate ? "YES" : "NO",
        base_amount: data.baseAmount || Math.round(amount / 1.18),
        gst_amount: data.gstAmount || (amount - Math.round(amount / 1.18))
      }
    }),
    muteHttpExceptions: true
  };
  const response = UrlFetchApp.fetch("https://api.razorpay.com/v1/orders", options);
  if (response.getResponseCode() !== 200) throw new Error("Razorpay Order Creation Failed: " + response.getContentText());
  return JSON.parse(response.getContentText()).id;
}

function getModeOfSessionDisplay(mode, amount) {
  const numAmount = parseInt(amount) || 589;
  const isOffline = (mode && mode.toString().toLowerCase() === 'offline') || numAmount >= 4000;
  return isOffline ? "Offline Session (In-Person Chennai)" : "Online Session (Live Online)";
}

function saveToSheet(data, orderId) {
  if (!isClaudeRegistration(data)) return;
  const ss = getClaudeSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME_REG) || ss.getSheets()[0];
  const certTag = (data.wantCertificate || data.certificate === "YES (+₹1,000)") ? "YES (+₹1000)" : "NO";
  const modeTag = (data.mode || (parseInt(data.amount) >= 4000 ? "OFFLINE" : "ONLINE")).toUpperCase();
  const sessionModeDisplay = getModeOfSessionDisplay(data.mode, data.amount);
  const rzpTag = getRazorpayAccountTag(data);

  sheet.appendRow([
    new Date(), sanitizeCell(data.name), sanitizeCell(data.email), "'" + String(data.phone || "").replace(/[^\d+\-\s]/g, ""), sanitizeCell(data.profession || "General"),
    sessionModeDisplay, data.amount || 589, "INITIATED", orderId, "", "PENDING",
    "NO", "NO", "NO", "NO", "NO", "NO", "NO", "NO", (data.promoCode || "CLAUDE") + " | MODE: " + modeTag + " | CERT: " + certTag + " | " + rzpTag
  ]);
}

function isPromoCodeValid(code) {
  const promoCodes30 = ["CLD30A", "TYC30B", "AIT30C", "MCP30D", "WEB30E", "COD30F", "PRO30G", "DIS30H", "RUN30I", "TAM30J", "ENG30K", "LIVE30", "VIP30M", "REG30N", "ZOOM30", "FAST30", "BEST30", "SAVE30", "GIFT30", "PLUS30"];
  if (code === "CLAUDE") return true;
  if (promoCodes30.indexOf(code) === -1) return false;
  
  const ss = getClaudeSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME_REG) || ss.getSheets()[0];
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][7] === "✅ PAID" && rows[i][19] === code) return false;
  }
  return true;
}

function getLast10Digits(phoneStr) {
  if (!phoneStr) return "";
  const clean = phoneStr.toString().replace(/\D/g, '');
  return clean.length >= 10 ? clean.slice(-10) : clean;
}

function processVerifiedClaudePayment(orderId, paymentId, isInternational, clientSuppliedAmount, extraData) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const cleanOrderId = String(orderId || "").trim();
    const cleanPaymentId = String(paymentId || "").trim();
    validatePaymentEnvironment({ id: cleanPaymentId, notes: (extraData && extraData.notes) || {} });
    const props = PropertiesService.getScriptProperties();

    // Helper to issue an authenticated bearer token for already verified payments
    const issueInvoiceToken = function(pId, oId) {
      const invSecret = getOptionalScriptSecret("INVOICE_TOKEN_SECRET");
      if (!invSecret) {
        throw new Error("MISSING_INVOICE_TOKEN_SECRET: Dedicated INVOICE_TOKEN_SECRET must be configured in Script Properties.");
      }
      const expiresAt = Date.now() + 86400000; // 24 hours validity
      return expiresAt + "." + computeHmacSha256Hex(pId + "|" + oId + "|" + expiresAt, invSecret);
    };

    if (props && props.getProperty("PROCESSED_PAY_" + cleanPaymentId)) {
      const existingInv = props.getProperty("VERIFIED_INV_" + cleanPaymentId);
      const parsedInv = existingInv ? JSON.parse(existingInv) : null;
      const invoiceToken = issueInvoiceToken(cleanPaymentId, cleanOrderId);
      return {
        success: true,
        alreadyProcessed: true,
        paymentId: cleanPaymentId,
        orderId: cleanOrderId,
        invoiceNumber: parsedInv ? parsedInv.invoiceNumber : null,
        invoiceToken: invoiceToken,
        invoice: parsedInv
      };
    }

    const ss = getClaudeSpreadsheet();
    assertSpreadsheetIsolation(ss);
    const sheet = ss.getSheetByName(SHEET_NAME_REG) || ss.getSheets()[0];
    const rows = sheet.getDataRange().getValues();

    let foundIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      const rowPayId = String(rows[i][9] || "").trim().replace(/^'/, "");
      if (rowPayId && rowPayId === cleanPaymentId) {
        const existingInv = props ? props.getProperty("VERIFIED_INV_" + cleanPaymentId) : null;
        const parsedInv = existingInv ? JSON.parse(existingInv) : null;
        const invoiceToken = issueInvoiceToken(cleanPaymentId, cleanOrderId);
        return {
          success: true,
          alreadyProcessed: true,
          paymentId: cleanPaymentId,
          orderId: cleanOrderId,
          invoiceNumber: parsedInv ? parsedInv.invoiceNumber : null,
          invoiceToken: invoiceToken,
          invoice: parsedInv
        };
      }
      if (String(rows[i][8] || "").trim() === cleanOrderId) {
        foundIndex = i;
      }
    }

    if (foundIndex === -1) {
      throw new Error("ORDER_NOT_FOUND: Order ID not found in registration sheet.");
    }

    const row = rows[foundIndex];
    if (String(row[7] || "").trim() === "✅ PAID") {
      const existingInv = props ? props.getProperty("VERIFIED_INV_" + cleanPaymentId) : null;
      const parsedInv = existingInv ? JSON.parse(existingInv) : null;
      const invoiceToken = issueInvoiceToken(cleanPaymentId, cleanOrderId);
      return {
        success: true,
        alreadyProcessed: true,
        paymentId: cleanPaymentId,
        orderId: cleanOrderId,
        invoiceNumber: parsedInv ? parsedInv.invoiceNumber : null,
        invoiceToken: invoiceToken,
        invoice: parsedInv
      };
    }

    const expectedAmountInr = Number(row[6]);
    if (!expectedAmountInr || expectedAmountInr < 1) {
      throw new Error("INVALID_ORDER_AMOUNT: Order row has invalid expected amount.");
    }
    if (clientSuppliedAmount !== undefined && clientSuppliedAmount !== null && clientSuppliedAmount !== "") {
      if (Math.round(Number(clientSuppliedAmount)) !== Math.round(expectedAmountInr)) {
        throw new Error("AMOUNT_MISMATCH: Client-supplied amount does not match order amount.");
      }
    }

    verifyPaymentWithRazorpayServer(cleanOrderId, cleanPaymentId, expectedAmountInr, isInternational);

    const name = String(row[1] || (extraData && extraData.name) || "Learner").replace(/^'/, "");
    const email = String(row[2] || (extraData && extraData.email) || "").replace(/^'/, "");
    const mode = (extraData && extraData.mode) || (expectedAmountInr >= 4000 ? "OFFLINE" : "ONLINE");
    const phoneClean = getLast10Digits(extraData && extraData.phone) || (row[3] ? row[3].toString().replace(/\D/g, '') : "");

    // Partial Failure Recovery: Check if invoice was already created in FunnelsDone / PDF in a previous attempt
    let invRecord = null;
    const existingInvJson = props ? props.getProperty("VERIFIED_INV_" + cleanPaymentId) : null;
    if (existingInvJson) {
      try {
        invRecord = JSON.parse(existingInvJson);
      } catch (e) {}
    }

    if (!invRecord) {
      let emailResult = { invoiceNumber: null, courseTitle: expectedAmountInr >= 4000 ? "Claude MasterClass 2026 (In-Person Workshop Chennai)" : "Claude MasterClass 2026 (Online Live Session)" };
      try {
        emailResult = sendMasterclassEmail(email, name, expectedAmountInr, mode, cleanPaymentId, cleanOrderId, phoneClean) || emailResult;
        triggerWhatsAppCampaign(name, email, phoneClean);
      } catch (err) {
        writeToLogs("EMAIL_ERROR", err.message);
      }

      if (!emailResult.invoiceNumber && emailResult.uncertain) {
        sheet.getRange(foundIndex + 1, 8).setValue("PENDING_RECONCILIATION");
        sheet.getRange(foundIndex + 1, 10).setValue(sanitizeCell(cleanPaymentId));
        sheet.getRange(foundIndex + 1, 11).setValue("WAITING_INVOICE");
        sheet.getRange(foundIndex + 1, 9).setValue(cleanOrderId);
        SpreadsheetApp.flush();
        return {
          success: false,
          uncertainInvoice: true,
          status: "UNCERTAIN_INVOICE_PENDING",
          paymentId: cleanPaymentId,
          orderId: cleanOrderId,
          error: "UNCERTAIN_INVOICE_PENDING: Invoice outcome is uncertain. Held for reconciliation to prevent duplicate invoice creation."
        };
      }

      invRecord = saveVerifiedInvoiceRecord(
        cleanPaymentId,
        cleanOrderId,
        emailResult.invoiceNumber,
        name,
        email,
        phoneClean,
        emailResult.courseTitle,
        expectedAmountInr
      );
    }

    const rzpTag = getRazorpayAccountTag(extraData || {});
    const isTestTx = isAuthorizedLiveTest(email, expectedAmountInr);
    sheet.getRange(foundIndex + 1, 8).setValue(isTestTx ? "✅ TEST_VERIFIED (₹1)" : "✅ PAID");
    sheet.getRange(foundIndex + 1, 10).setValue(sanitizeCell(cleanPaymentId));
    sheet.getRange(foundIndex + 1, 11).setValue(isTestTx ? "TEST_SUPPRESSED" : "SENT ✅");
    sheet.getRange(foundIndex + 1, 9).setValue(cleanOrderId);

    const existingPromoCol = (row[19] || "").toString();
    if (!existingPromoCol.includes("RZP:")) {
      sheet.getRange(foundIndex + 1, 20).setValue(existingPromoCol + " | " + rzpTag);
    }
    SpreadsheetApp.flush();

    if (props) {
      props.setProperty("PROCESSED_PAY_" + cleanPaymentId, new Date().toISOString());
    }

    // Dedicated INVOICE_TOKEN_SECRET is required to sign customer invoice bearer tokens.
    // Zero fallback to Razorpay payment secrets.
    const invSecret = getOptionalScriptSecret("INVOICE_TOKEN_SECRET");
    if (!invSecret) {
      if (typeof writeToLogs === "function") {
        writeToLogs("SECURITY_REJECT", "INVOICE_TOKEN_SECRET is not configured in Script Properties. Cannot generate invoice token.");
      }
      throw new Error("MISSING_INVOICE_TOKEN_SECRET: Dedicated INVOICE_TOKEN_SECRET must be configured in Script Properties.");
    }
    const expiresAt = Date.now() + 86400000; // 24 hours validity
    const invoiceToken = expiresAt + "." + computeHmacSha256Hex(cleanPaymentId + "|" + cleanOrderId + "|" + expiresAt, invSecret);

    return {
      success: true,
      verified: true,
      paymentId: cleanPaymentId,
      orderId: cleanOrderId,
      invoiceNumber: invRecord.invoiceNumber,
      invoiceToken: invoiceToken,
      invoice: invRecord
    };
  } finally {
    lock.releaseLock();
  }
}

function updatePaymentStatus(data) {
  if (!isClaudeRegistration(data)) return { success: false, error: "Ignored non-Claude payment" };
  const orderId = data.razorpay_order_id || data.orderId || "";
  const paymentId = data.razorpay_payment_id || data.transactionId || data.paymentId || "";
  const signature = data.razorpay_signature || "";
  const isIntl = Boolean(data.isInternational || (data.countryCode && data.countryCode !== '+91'));

  if (!orderId || !paymentId || !signature) {
    writeToLogs("SECURITY_REJECT", "Missing required Razorpay verification fields for order: " + orderId);
    throw new Error("MISSING_SIGNATURE: razorpay_order_id, razorpay_payment_id, and razorpay_signature are required.");
  }

  validatePaymentEnvironment({ id: paymentId, notes: data.notes || {} });

  const sigOk = verifyRazorpayPaymentSignature(orderId, paymentId, signature, isIntl);
  if (!sigOk) {
    writeToLogs("SECURITY_REJECT", "Invalid Razorpay signature for order: " + orderId);
    throw new Error("INVALID_SIGNATURE: Payment signature verification failed.");
  }

  return processVerifiedClaudePayment(orderId, paymentId, isIntl, data.amount, data);
}

function updatePaymentStatusFromWebhook(orderId, paymentId, email, notes, rawAmount, proxySignature, timestamp, eventId, targetProduct, payloadDigest, paymentEntity, proxyVersion, eventType) {
  const amount = rawAmount ? rawAmount / 100 : 0;
  if (notes && notes.product && notes.product !== "claude_masterclass") {
    writeToLogs("NON_CLAUDE_WEBHOOK_SKIPPED", `Ignored ${notes.product} payment for ${email} (Order: ${orderId}).`);
    return { success: false, skipped: true };
  }

  if ((amount === 99 || amount === 117) && (!notes || !notes.product || !notes.product.toLowerCase().includes("claude"))) {
    writeToLogs("NON_CLAUDE_WEBHOOK_SKIPPED", `Ignored ₹${amount} payment for ${email} (Order: ${orderId}) from non-Claude page.`);
    return { success: false, skipped: true };
  }

  const webhookProxySecret = getScriptSecret("WEBHOOK_PROXY_SECRET");
  if (!webhookProxySecret) {
    writeToLogs("SECURITY_REJECT", "WEBHOOK_PROXY_SECRET is not configured. Webhooks disabled.");
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

  // Staging and Production Payment Environment Isolation
  validatePaymentEnvironment(paymentEntity);

  // Production and Staging Rejection Gate:
  // Both production and staging environments unconditionally mandate proxy_version === "v2.1", 12-tuple HMAC, and 8-field digest.
  // Weaker legacy signatures can NEVER be accepted in production or staging, regardless of STRICT_PROXY_MODE or ALLOW_LEGACY_PROXY_SIGNATURE.
  // Legacy compatibility is strictly confined to explicit non-production development environments (ENVIRONMENT === "development" or "local_test").
  const isNodeTestEnv = (typeof process !== "undefined" && Boolean(process.env) && process.env.NODE_ENV === "test");
  const env = getAppEnvironment();
  const isExplicitNonProd = (env === "development" || env === "local_test");
  const allowLegacyDev = isExplicitNonProd && (getOptionalScriptSecret("ALLOW_LEGACY_PROXY_SIGNATURE") === "true" || (isNodeTestEnv && !getOptionalScriptSecret("ENVIRONMENT")));

  // 1. Destination binding: Target product must match this script's expected product
  const isV2 = (cleanProxyVersion === "v2" || cleanProxyVersion === "v2.1" || Boolean(cleanPayloadDigest && cleanTargetProduct));
  if (isV2) {
    if (!cleanTargetProduct || cleanTargetProduct !== EXPECTED_PRODUCT_KEY) {
      writeToLogs("SECURITY_REJECT", "Target product mismatch: received '" + cleanTargetProduct + "', expected '" + EXPECTED_PRODUCT_KEY + "'");
      throw new Error("DESTINATION_MISMATCH: Webhook intended for '" + cleanTargetProduct + "' cannot be processed by '" + EXPECTED_PRODUCT_KEY + "'.");
    }
  }

  // 2. Replay prevention: verify timestamp freshness within 5 minutes (300,000 ms)
  const now = Date.now();
  if (!cleanTimestamp || Math.abs(now - cleanTimestamp) > 300000) {
    writeToLogs("SECURITY_REJECT", "Expired webhook timestamp: " + cleanTimestamp);
    throw new Error("REPLAY_EXPIRED_TIMESTAMP: Webhook timestamp expired or outside tolerance window.");
  }

  // 3. Tamper resistance & payload integrity verification
  const cleanSig = String(proxySignature || "").trim().toLowerCase();
  if (!allowLegacyDev) {
    // Unconditional Production and Staging Verifier
    if (!cleanProxyVersion) {
      writeToLogs("SECURITY_REJECT", "Missing protocol version in verifier for event: " + cleanEventId);
      throw new Error("MISSING_PROTOCOL_VERSION: Production and staging require proxy_version 'v2.1'.");
    }
    if (cleanProxyVersion !== "v2.1") {
      writeToLogs("SECURITY_REJECT", "Protocol downgrade attempt rejected: '" + cleanProxyVersion + "' for event: " + cleanEventId);
      throw new Error("PROTOCOL_DOWNGRADE_REJECTED: Production and staging only permit 'v2.1'. Received '" + cleanProxyVersion + "'.");
    }

    const digest8 = computeCanonicalPayloadDigest(paymentEntity);
    if (!cleanPayloadDigest || !constantTimeEquals(digest8, cleanPayloadDigest)) {
      writeToLogs("SECURITY_REJECT", "Payload digest mismatch for event: " + cleanEventId);
      throw new Error("PAYLOAD_DIGEST_MISMATCH: Canonical payload digest does not match payment entity.");
    }

    const expectedSig12 = computeHmacSha256Hex(
      "v2|" + cleanEventId + "|" + cleanEventType + "|" + cleanOrderId + "|" + cleanPaymentId + "|" + cleanTimestamp + "|" + cleanTargetProduct + "|" + cleanAmount + "|" + cleanCurrency + "|" + cleanStatus + "|" + cleanAccountId + "|" + cleanPayloadDigest,
      webhookProxySecret
    );
    if (!proxySignature || !constantTimeEquals(expectedSig12, cleanSig)) {
      writeToLogs("SECURITY_REJECT", "Invalid v2.1 12-tuple webhook proxy signature for event: " + cleanEventId);
      throw new Error("INVALID_WEBHOOK_SIGNATURE: Webhook proxy signature verification failed.");
    }
  } else {
    // Isolated non-production development mode ONLY
    if (cleanProxyVersion === "v2.1") {
      const digest8 = computeCanonicalPayloadDigest(paymentEntity);
      if (!cleanPayloadDigest || !constantTimeEquals(digest8, cleanPayloadDigest)) {
        writeToLogs("SECURITY_REJECT", "Payload digest mismatch for event: " + cleanEventId);
        throw new Error("PAYLOAD_DIGEST_MISMATCH: Canonical payload digest does not match payment entity.");
      }

      const expectedSig12 = computeHmacSha256Hex(
        "v2|" + cleanEventId + "|" + cleanEventType + "|" + cleanOrderId + "|" + cleanPaymentId + "|" + cleanTimestamp + "|" + cleanTargetProduct + "|" + cleanAmount + "|" + cleanCurrency + "|" + cleanStatus + "|" + cleanAccountId + "|" + cleanPayloadDigest,
        webhookProxySecret
      );
      if (!proxySignature || !constantTimeEquals(expectedSig12, cleanSig)) {
        writeToLogs("SECURITY_REJECT", "Invalid v2.1 12-tuple webhook proxy signature for event: " + cleanEventId);
        throw new Error("INVALID_WEBHOOK_SIGNATURE: Webhook proxy signature verification failed.");
      }
    } else if (isV2) {
      writeToLogs("SECURITY_WARNING", "Legacy v2 signature accepted in non-production development mode for event: " + cleanEventId);
      const digest8 = computeCanonicalPayloadDigest(paymentEntity);
      const digest5 = computeCanonicalPayloadDigest(paymentEntity, "5field");
      const digestValid = cleanPayloadDigest && (
        constantTimeEquals(digest8, cleanPayloadDigest) ||
        constantTimeEquals(digest5, cleanPayloadDigest)
      );
      if (!digestValid) {
        writeToLogs("SECURITY_REJECT", "Payload digest mismatch for event: " + cleanEventId);
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
        writeToLogs("SECURITY_REJECT", "Invalid v2 webhook proxy signature for event: " + cleanEventId);
        throw new Error("INVALID_WEBHOOK_SIGNATURE: Webhook proxy signature verification failed.");
      }
    } else {
      writeToLogs("SECURITY_WARNING", "Legacy v1 signature accepted in non-production development mode for event: " + cleanEventId);
      const expectedProxySig = computeHmacSha256Hex(
        cleanEventId + "|" + cleanOrderId + "|" + cleanPaymentId + "|" + cleanTimestamp,
        webhookProxySecret
      );
      if (!proxySignature || !constantTimeEquals(expectedProxySig, cleanSig)) {
        writeToLogs("SECURITY_REJECT", "Invalid v1 webhook proxy signature for event: " + cleanEventId);
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
            writeToLogs("SECURITY_ALERT", "Event ID integrity conflict detected for event: " + cleanEventId);
            throw new Error("EVENT_ID_INTEGRITY_CONFLICT: Reused event ID does not match original event payload digest or payment identifier.");
          }
        }
      } catch (err) {
        if (err.message && err.message.indexOf("EVENT_ID_INTEGRITY_CONFLICT") !== -1) {
          throw err;
        }
      }
      return { success: true, alreadyProcessed: true, duplicate: true, eventId: cleanEventId };
    }
  }

  const result = processVerifiedClaudePayment(cleanOrderId, cleanPaymentId, undefined, undefined, { email: email, mode: notes ? notes.mode : undefined });

  // 5. Mark event processed ONLY after successful execution without uncertain invoice
  if (props && cleanEventId && result && result.success !== false && result.uncertainInvoice !== true) {
    props.setProperty("PROCESSED_EVT_" + cleanEventId, JSON.stringify({
      timestamp: new Date().toISOString(),
      payloadDigest: cleanPayloadDigest,
      paymentId: cleanPaymentId,
      orderId: cleanOrderId
    }));
  }

  return result;
}

function sendWhatsAppText(to, message) {
  if (isNotificationSuppressed()) {
    writeToLogs("WA_TEXT_SUPPRESSED", `Notification suppressed in environment: ${getAppEnvironment()} for ${to}`);
    return;
  }
  try {
    const url = "https://graph.facebook.com/v19.0/" + getWhatsAppPhoneNumberId() + "/messages";
    const options = { method: "post", contentType: "application/json", headers: { Authorization: "Bearer " + WHATSAPP_CONFIG.ACCESS_TOKEN }, payload: JSON.stringify({ messaging_product: "whatsapp", to: to, type: "text", text: { body: message } }), muteHttpExceptions: true };
    const res = UrlFetchApp.fetch(url, options);
    writeToLogs("WA_TEXT_SEND", `To: ${to} | Status: ${res.getResponseCode()} | Response: ${res.getContentText()}`);
  } catch(e) {
    writeToLogs("WA_TEXT_ERROR", `To: ${to} | Error: ${e.message}`);
  }
}

function sendWhatsAppImage(to, imageUrl, caption) {
  if (isNotificationSuppressed()) {
    writeToLogs("WA_IMAGE_SUPPRESSED", `Notification suppressed in environment: ${getAppEnvironment()} for ${to}`);
    return;
  }
  try {
    const url = "https://graph.facebook.com/v19.0/" + getWhatsAppPhoneNumberId() + "/messages";
    const options = { method: "post", contentType: "application/json", headers: { Authorization: "Bearer " + WHATSAPP_CONFIG.ACCESS_TOKEN }, payload: JSON.stringify({ messaging_product: "whatsapp", to: to, type: "image", image: { link: imageUrl, caption: caption } }), muteHttpExceptions: true };
    const res = UrlFetchApp.fetch(url, options);
    writeToLogs("WA_IMAGE_SEND", `To: ${to} | Status: ${res.getResponseCode()} | Response: ${res.getContentText()}`);
  } catch(e) {
    writeToLogs("WA_IMAGE_ERROR", `To: ${to} | Error: ${e.message}`);
  }
}

function triggerWhatsAppCampaign(contactName, contactEmail, contactPhone) {
  if (isNotificationSuppressed() || isAuthorizedLiveTest(contactEmail, 1)) {
    writeToLogs("WA_CAMPAIGN_SUPPRESSED", `Notification suppressed in environment: ${getAppEnvironment()} for ${contactEmail}`);
    return;
  }
  var url = "https://login.aifunnels.app/api/automations/6a43848a31b24/execute";
  var payload = { "api_token": getScriptSecret("AIFUNNELS_API_TOKEN"), "contact_name": contactName, "contact_email": contactEmail, "contact_phone": contactPhone, "sf.p_name": contactName };
  var options = { "method": "post", "contentType": "application/json", "payload": JSON.stringify(payload), "muteHttpExceptions": true };
  try { UrlFetchApp.fetch(url, options); } catch(e) {}
}

function writeToLogs(event, data) {
  try {
    const ss = getClaudeSpreadsheet();
    let logSheet = ss.getSheetByName(SHEET_NAME_LOGS) || ss.insertSheet(SHEET_NAME_LOGS);
    logSheet.appendRow([new Date(), event, data]);
  } catch (e) {}
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function markWhatsappClicked(orderId) {
  const ss = getClaudeSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME_REG) || ss.getSheets()[0];
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][8] === orderId) { sheet.getRange(i + 1, 12).setValue("CHATTED ✅"); break; }
  }
}
