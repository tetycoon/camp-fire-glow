/**
 * ============================================================================
 * TECH TYCOON ACADEMY — 10+ ADVANCED AI COURSES BUNDLE (/ai-bundle/)
 * EXCLUSIVE GOOGLE APPS SCRIPT AUTOMATION SYSTEM
 * Reference Architecture: Claude Academy Masterclass Google Sheet
 *
 * Tabs automatically managed in Google Sheet:
 *   1. "Sheet1"        — All Registrations & Razorpay Payment Status (20 columns)
 *   2. "Landing_Leads" — All Popup / Form Leads with UTM & Meta Attribution
 *   3. "Logs"          — Technical Webhook, Order, Verification & Email Logs
 *
 * Pricing & Coupons (0% GST — Flat Non-GST Invoice PDF):
 *   - Original Price : ₹50,000
 *   - Offer Price    : ₹30,000 (Default / Coupon: AMIABLE — Save ₹20,000)
 *   - Special Price  : ₹15,000 (Coupon: AIANTONY — Save ₹35,000)
 *   - Live ₹1 Test   : ₹1 for authorized test emails
 * ============================================================================
 */

const DEFAULT_SPREADSHEET_ID = ""; // Optional: leave empty when bound to the Google Sheet (Extensions -> Apps Script)
const SHEET_NAME_REG = "Sheet1";
const SHEET_NAME_LANDING_LEADS = "Landing_Leads";
const SHEET_NAME_LOGS = "Logs";
const EXPECTED_PRODUCT_KEY = "ai_bundle";
const DEFAULT_WEBHOOK_VERIFY_TOKEN = "techtycoon_verify_2026";

const REG_SHEET_HEADERS = [
  "Timestamp",           // Col A (1)
  "Name",                // Col B (2)
  "Email",               // Col C (3)
  "Phone",               // Col D (4)
  "Course / Program",    // Col E (5)
  "Package / Coupon",    // Col F (6)
  "Amount",              // Col G (7)
  "Status",              // Col H (8)
  "Order ID",            // Col I (9)
  "Payment ID",          // Col J (10)
  "Email Status",        // Col K (11)
  "WhatsApp Clicked",    // Col L (12)
  "Invoice Number",      // Col M (13)
  "Coupon Code",         // Col N (14)
  "Original Price",      // Col O (15)
  "Discount Applied",    // Col P (16)
  "Country Code",        // Col Q (17)
  "Page URL",            // Col R (18)
  "Paid At",             // Col S (19)
  "Promo & Gateway Meta" // Col T (20)
];

const LANDING_LEAD_HEADERS = [
  "Timestamp",
  "Lead ID",
  "Full Name",
  "Phone",
  "Email",
  "Page URL",
  "UTM Source",
  "UTM Medium",
  "UTM Campaign",
  "GCLID",
  "FBCLID",
  "User Agent"
];

const PRICING_CONFIG = {
  ORIGINAL_PRICE: 50000,
  DEFAULT_OFFER_PRICE: 30000,
  COUPONS: {
    "AMIABLE": { price: 30000, discount: 20000, label: "AMIABLE Offer (₹30,000)" },
    "AIANTONY": { price: 15000, discount: 35000, label: "AIANTONY Special Offer (₹15,000)" }
  }
};

const INCLUDED_COURSES = [
  "Advanced Claude Masterclass",
  "AI Business & Generative Models",
  "AI for Non-Tech Working Professionals",
  "AI Graphic Designing",
  "End-to-End AI Business Automation",
  "AI Passive Income Setup",
  "AI-Powered Digital Marketing",
  "AI Financial Management",
  "Prompt Engineering",
  "AI Content Creation"
];

// Authorized emails allowed to test the live payment & email delivery workflow for ₹1
const TEST_EMAILS = [
  "ambroseselva001@gmail.com",
  "techtycoondigitalsolutions@gmail.com",
  "techtycoondigitors@gmail.com"
];

// Company Details for Official Non-GST Invoice PDF & Emails
const COMPANY_CONFIG = {
  COMPANY_NAME: "TECH TYCOON DIGITAL SOLUTION LLP",
  COMPANY_BRAND: "Tech Tycoon Academy",
  COMPANY_PHONE: "7558133039",
  COMPANY_ALT_PHONE: "7010340494",
  COMPANY_EMAIL: "techtycoondigitalsolutions@gmail.com",
  COMPANY_WEBSITE: "https://www.techtycoon.in/",
  COURSE_PAGE_URL: "https://course.techtycoon.in/ai-bundle/",
  ADDRESS_LINE1: "No. 31, Ramalinga Nagar",
  CITY: "Madipakkam, Chennai",
  STATE: "TAMILNADU",
  POSTAL_CODE: "600091",
  WA_PHONE_NUMBER: "917558133039"
};

/**
 * ============================================================================
 * STEP 1: SELECT "setupSheetHeaders" IN THE TOOLBAR AND CLICK RUN!
 * - Placed at the very top of the file so Google Apps Script's OAuth scanner
 *   immediately prompts for MailApp + UrlFetchApp + SpreadsheetApp permissions.
 * - Automatically creates & styles the 3 tabs: "Sheet1", "Landing_Leads", "Logs".
 * - Automatically sets default Script Properties (RAZORPAY_KEY_ID, etc.).
 * ============================================================================
 */
function setupSheetHeaders() {
  // Top-level OAuth permission triggers for MailApp, UrlFetchApp, and SpreadsheetApp
  const quota = MailApp.getRemainingDailyQuota();
  Logger.log("Remaining daily email quota: " + quota);
  try {
    UrlFetchApp.fetch("https://api.razorpay.com", { muteHttpExceptions: true });
  } catch (e) {}

  const ss = getBundleSpreadsheet();

  // Auto-set default non-secret Script Properties if not already set
  try {
    const props = PropertiesService.getScriptProperties();
    if (props) {
      const defaults = {
        "APP_ENVIRONMENT": "production",
        "WEBHOOK_VERIFY_TOKEN": DEFAULT_WEBHOOK_VERIFY_TOKEN,
        "RAZORPAY_KEY_ID": "rzp_live_T2CbVONQc6qrqj",
        "RAZORPAY_KEY_SECRET": "0ZmzKfvHIwbnvkTCPxkWC1a6",
        "RAZORPAY_KEY_ID_INTL": "rzp_live_gfoS1OjC8tvWjP",
        "FUNNELSDONE_LOCATION_ID": "uUUUKRH7EP2A0oJBv4Zb",
        "WHATSAPP_PHONE_NUMBER_ID": "1089787377552637"
      };
      Object.keys(defaults).forEach(function (k) {
        if (!props.getProperty(k)) {
          props.setProperty(k, defaults[k]);
        }
      });
    }
  } catch (e) {}

  // 1. Sheet1 (Registrations)
  let regSheet = ss.getSheetByName(SHEET_NAME_REG);
  if (!regSheet) {
    regSheet = ss.insertSheet(SHEET_NAME_REG);
  }
  if (regSheet.getLastRow() === 0) {
    regSheet.appendRow(REG_SHEET_HEADERS);
  } else {
    regSheet.getRange(1, 1, 1, REG_SHEET_HEADERS.length).setValues([REG_SHEET_HEADERS]);
  }
  const regHeaderRange = regSheet.getRange(1, 1, 1, REG_SHEET_HEADERS.length);
  regHeaderRange.setFontWeight("bold").setBackground("#0B1B3F").setFontColor("#FFFFFF");
  regSheet.setFrozenRows(1);

  // 2. Landing_Leads
  let leadsSheet = ss.getSheetByName(SHEET_NAME_LANDING_LEADS);
  if (!leadsSheet) {
    leadsSheet = ss.insertSheet(SHEET_NAME_LANDING_LEADS);
  }
  if (leadsSheet.getLastRow() === 0) {
    leadsSheet.appendRow(LANDING_LEAD_HEADERS);
  } else {
    leadsSheet.getRange(1, 1, 1, LANDING_LEAD_HEADERS.length).setValues([LANDING_LEAD_HEADERS]);
  }
  const leadsHeaderRange = leadsSheet.getRange(1, 1, 1, LANDING_LEAD_HEADERS.length);
  leadsHeaderRange.setFontWeight("bold").setBackground("#0284C7").setFontColor("#FFFFFF");
  leadsSheet.setFrozenRows(1);

  // 3. Logs
  let logSheet = ss.getSheetByName(SHEET_NAME_LOGS);
  if (!logSheet) {
    logSheet = ss.insertSheet(SHEET_NAME_LOGS);
  }
  if (logSheet.getLastRow() === 0) {
    logSheet.appendRow(["Timestamp", "Event", "Details"]);
  } else {
    logSheet.getRange(1, 1, 1, 3).setValues([["Timestamp", "Event", "Details"]]);
  }
  const logHeaderRange = logSheet.getRange(1, 1, 1, 3);
  logHeaderRange.setFontWeight("bold").setBackground("#334155").setFontColor("#FFFFFF");
  logSheet.setFrozenRows(1);

  SpreadsheetApp.flush();
  writeToLogs("SETUP_COMPLETE", "Initialized Sheet1, Landing_Leads, and Logs tabs for AI Bundle.");
  Logger.log("✅ All 3 tabs (Sheet1, Landing_Leads, Logs) initialized successfully!");
  return "All 3 tabs (Sheet1, Landing_Leads, Logs) initialized successfully!";
}

/**
 * Custom UI Menu inside Google Sheets (just like Claude Masterclass)
 */
function onOpen() {
  try {
    SpreadsheetApp.getUi()
      .createMenu("🎓 AI Bundle Academy")
      .addItem("🛠️ Initialize Sheet Tabs & Headers", "setupSheetHeaders")
      .addSeparator()
      .addItem("⚡ Reconcile All Stuck Payments (Check Razorpay & Send Invoices)", "menuReconcileStuckPayments")
      .addItem("✅ Mark Selected Row as PAID & Send Invoice", "menuMarkSelectedRowPaidAndSendInvoice")
      .addItem("📧 Resend Confirmation & Invoice to Selected Row", "menuResendInvoiceToSelectedRow")
      .addToUi();
  } catch (e) {}
}

// ----------------------------------------------------------------------------
// SCRIPT PROPERTIES & ENVIRONMENT HELPERS
// ----------------------------------------------------------------------------
function getScriptSecret(key) {
  const props = PropertiesService.getScriptProperties();
  const val = props ? props.getProperty(key) : "";
  if (!val || !String(val).trim()) {
    throw new Error("Missing required Script Property: " + key + ". Please add it in Project Settings -> Script Properties.");
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
  const envVal = String(
    getOptionalScriptSecret("APP_ENVIRONMENT") ||
    getOptionalScriptSecret("ENVIRONMENT") ||
    getOptionalScriptSecret("APP_ENV") ||
    ""
  ).trim().toLowerCase();
  if (envVal) {
    if (["production", "staging", "local_test", "development"].includes(envVal)) {
      return envVal;
    }
    throw new Error("INVALID_ENVIRONMENT: Unknown environment '" + envVal + "'.");
  }
  if (isNodeTestEnv) return "local_test";
  return "production";
}

function getBundleSpreadsheet() {
  let ss = null;
  try {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  } catch (e) {}

  const targetId = getOptionalScriptSecret("SPREADSHEET_ID") || DEFAULT_SPREADSHEET_ID;
  if (!ss && targetId) {
    try {
      ss = SpreadsheetApp.openById(targetId);
    } catch (e) {
      throw new Error("Cannot open Spreadsheet ID " + targetId + ".");
    }
  }
  if (!ss) {
    throw new Error("Spreadsheet container not found. Bind this script to a Google Sheet or set SPREADSHEET_ID in Script Properties.");
  }
  return ss;
}

function getRazorpayKeyId(isIntl) {
  const secretKeyName = isIntl ? "RAZORPAY_KEY_ID_INTL" : "RAZORPAY_KEY_ID";
  const configuredKey = getOptionalScriptSecret(secretKeyName);
  return configuredKey || (isIntl ? "rzp_live_gfoS1OjC8tvWjP" : "rzp_live_T2CbVONQc6qrqj");
}

function getRazorpayCredentials(isIntl) {
  if (isIntl) {
    const intlSecret = getOptionalScriptSecret("RAZORPAY_KEY_SECRET_INTL");
    if (intlSecret) {
      return { keyId: getRazorpayKeyId(true), keySecret: intlSecret, isIntl: true };
    }
  }
  return {
    keyId: getRazorpayKeyId(false),
    keySecret: getOptionalScriptSecret("RAZORPAY_KEY_SECRET") || "0ZmzKfvHIwbnvkTCPxkWC1a6",
    isIntl: false
  };
}

function getRazorpayAccountTag(data) {
  const phoneStr = String((data && data.phone) || "");
  const countryCode = String((data && data.countryCode) || "");
  const isIntl = Boolean(
    (data && data.isInternational === true) ||
    (countryCode && countryCode !== "+91") ||
    (phoneStr.startsWith("+") && !phoneStr.startsWith("+91"))
  );
  const creds = getRazorpayCredentials(isIntl);
  return creds.isIntl
    ? ("RZP: International (" + creds.keyId + ")")
    : ("RZP: Domestic India (" + creds.keyId + ")");
}

function isAuthorizedLiveTest(email, amount) {
  const cleanEmail = String(email || "").trim().toLowerCase();
  const numAmount = Number(amount);
  if (TEST_EMAILS.indexOf(cleanEmail) === -1) return false;
  return numAmount === 1 || isNaN(numAmount) || numAmount === 30000 || numAmount === 15000;
}

function isExplicitOneRupeeTest(email, amount) {
  const cleanEmail = String(email || "").trim().toLowerCase();
  const numAmount = Number(amount) || 0;
  return TEST_EMAILS.indexOf(cleanEmail) !== -1 && numAmount === 1;
}

/**
 * Resolves the authoritative coupon & payable amount for AI Bundle.
 * - AIANTONY -> ₹15,000 (Save ₹35,000)
 * - AMIABLE (or empty/default) -> ₹30,000 (Save ₹20,000)
 * - Authorized test email requesting ₹1 (or testing) -> ₹1
 */
function resolveBundlePricing(data) {
  const email = String((data && data.email) || "").trim().toLowerCase();
  const rawCoupon = String((data && (data.coupon || data.promoCode)) || "").trim().toUpperCase();
  const requestedAmount = Number((data && (data.amount || data.final_price)) || 0);

  const couponObj = PRICING_CONFIG.COUPONS[rawCoupon];
  const effectiveCoupon = couponObj ? rawCoupon : "AMIABLE";
  const standardOfferPrice = couponObj ? couponObj.price : PRICING_CONFIG.DEFAULT_OFFER_PRICE;
  const discountAmount = PRICING_CONFIG.ORIGINAL_PRICE - standardOfferPrice;

  // Allow ₹1 live test for authorized test emails
  if (TEST_EMAILS.indexOf(email) !== -1 && (requestedAmount === 1 || data.isTest === true)) {
    return {
      couponCode: effectiveCoupon,
      originalPrice: PRICING_CONFIG.ORIGINAL_PRICE,
      discountApplied: PRICING_CONFIG.ORIGINAL_PRICE - 1,
      payableAmount: 1,
      isTest: true,
      packageLabel: "10+ Advanced AI Courses Bundle (Test ₹1 - " + effectiveCoupon + ")"
    };
  }

  return {
    couponCode: effectiveCoupon,
    originalPrice: PRICING_CONFIG.ORIGINAL_PRICE,
    discountApplied: discountAmount,
    payableAmount: standardOfferPrice,
    isTest: false,
    packageLabel: effectiveCoupon === "AIANTONY"
      ? "10+ Advanced AI Courses Bundle (AIANTONY Special Offer - ₹15,000)"
      : "10+ Advanced AI Courses Bundle (Early Bird AMIABLE Offer - ₹30,000)"
  };
}

// ----------------------------------------------------------------------------
// WEBHOOK & API ENTRYPOINTS (doGet / doPost)
// ----------------------------------------------------------------------------
function doGet(e) {
  const params = (e && e.parameter) ? e.parameter : {};
  const verifyToken = getOptionalScriptSecret("WEBHOOK_VERIFY_TOKEN") || DEFAULT_WEBHOOK_VERIFY_TOKEN;

  if (params["hub.mode"] === "subscribe" && verifyToken && params["hub.verify_token"] === verifyToken) {
    return ContentService.createTextOutput(params["hub.challenge"]);
  }

  if (params.action === "reconcile" || params.action === "reconcilePending") {
    return createJsonResponse(reconcilePendingPayments());
  }

  if (params.action === "whatsapp") {
    if (params.orderId) markWhatsappClicked(params.orderId);
    const msgText = "Hello Tech Tycoon Academy Team! I have completed my registration for the 10+ Advanced AI Courses Bundle.";
    const waChatLink = "https://wa.me/" + COMPANY_CONFIG.WA_PHONE_NUMBER + "?text=" + encodeURIComponent(msgText);
    const html = '<html><body style="font-family:sans-serif;text-align:center;padding-top:50px;background:#0B1B3F;color:white;">' +
      '<h2>Redirecting to Tech Tycoon Academy WhatsApp...</h2>' +
      '<script>window.top.location.href="' + waChatLink + '";</script>' +
      '</body></html>';
    return HtmlService.createHtmlOutput(html).setTitle("Redirecting to WhatsApp...");
  }

  if (params.action === "getLandingLeads") {
    if (verifyToken && params.token && params.token !== verifyToken) {
      return createJsonResponse({ success: false, error: "Unauthorized token" });
    }
    return createJsonResponse({ success: true, leads: getLandingLeads() });
  }

  if (params.action === "getRegistrations") {
    if (verifyToken && params.token !== verifyToken) {
      return createJsonResponse({ success: false, error: "Unauthorized access token" });
    }
    const ss = getBundleSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME_REG) || ss.getSheets()[0];
    const values = sheet.getDataRange().getValues();
    const list = [];

    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      if (!row[0] && !row[1] && !row[2]) continue;
      let dateStr = "";
      if (row[0]) {
        try {
          dateStr = row[0] instanceof Date ? row[0].toISOString() : new Date(row[0]).toISOString();
        } catch (errDate) {
          dateStr = String(row[0]);
        }
      }
      list.push({
        timestamp: dateStr,
        name: row[1] || "",
        email: row[2] || "",
        phone: row[3] ? String(row[3]).replace(/^'/, "") : "",
        profession: row[4] || "10+ Advanced AI Courses Bundle",
        language: row[5] || "10+ Advanced AI Courses",
        amount: Number(row[6] || 0),
        status: row[7] || "INITIATED",
        orderId: row[8] || "",
        paymentId: row[9] ? String(row[9]).replace(/^'/, "") : "",
        emailStatus: row[10] || "",
        whatsappClicked: row[11] || "",
        invoiceNumber: row[12] || "",
        couponCode: row[13] || "",
        pageUrl: row[17] || COMPANY_CONFIG.COURSE_PAGE_URL,
        batch: "10+ Advanced AI Courses Bundle"
      });
    }
    list.reverse();
    return createJsonResponse({ success: true, registrations: list, count: list.length });
  }

  return ContentService.createTextOutput("OK — Tech Tycoon Academy (10+ Advanced AI Courses Bundle) Automation Active.");
}

function doPost(e) {
  const rawData = (e && e.postData && e.postData.contents) ? e.postData.contents : "{}";
  writeToLogs("RAW_POST", rawData.substring(0, 600));

  try {
    const body = JSON.parse(rawData);

    // 1. Standalone Landing Lead Capture
    if (body.action === "saveLandingLead") {
      return createJsonResponse(saveLandingLead(body));
    }

    // 2. Manual / Automated Reconciliation Trigger
    if (body.action === "reconcile" || body.action === "reconcilePending") {
      return createJsonResponse(reconcilePendingPayments());
    }

    // 3. Payment Confirmation Callback from Website after Razorpay Checkout succeeds
    if (body.paymentSuccess === true || body.action === "payment_success" || body.action === "verifyPayment") {
      const res = updatePaymentStatus(body);
      return createJsonResponse(res);
    }

    // 4. Direct Razorpay Server Webhook (payment.captured / order.paid)
    if (body.event === "payment.captured" || body.event === "order.paid") {
      const paymentEntity = body.payload && body.payload.payment && body.payload.payment.entity;
      if (!paymentEntity || !paymentEntity.order_id || !paymentEntity.id) {
        return createJsonResponse({ success: false, error: "Invalid webhook payment entity" });
      }
      const notes = paymentEntity.notes || {};
      const noteProductKey = String(notes.product_key || notes.product || body.target_product || "").trim().toLowerCase();
      if (noteProductKey && noteProductKey !== EXPECTED_PRODUCT_KEY && noteProductKey !== "ai-bundle") {
        writeToLogs("ISOLATION_SKIP", "Ignored non-ai_bundle webhook (" + noteProductKey + "): " + paymentEntity.id);
        return createJsonResponse({ success: false, ignored: true });
      }
      const res = processVerifiedBundlePayment(
        paymentEntity.order_id,
        paymentEntity.id,
        false,
        paymentEntity.amount ? Math.round(Number(paymentEntity.amount) / 100) : undefined,
        {
          email: paymentEntity.email || notes.email || notes.customer_email || "",
          name: notes.name || notes.customer_name || "",
          phone: paymentEntity.contact || notes.phone || "",
          coupon: notes.coupon || notes.promo_code || "AMIABLE"
        }
      );
      return createJsonResponse(res);
    }

    // 5. New Registration & Razorpay Order Creation (Triggered when user submits Register Now modal)
    if (body.name && body.email && body.phone && !body.object) {
      const pricing = resolveBundlePricing(body);
      let orderResult = {
        orderId: "order_direct_" + Utilities.getUuid().replace(/-/g, "").substring(0, 14),
        keyId: getRazorpayKeyId(false)
      };
      try {
        orderResult = createRazorpayOrder(body, pricing);
      } catch (orderErr) {
        writeToLogs("ORDER_CREATE_FALLBACK", orderErr.message);
      }
      saveToSheet(body, orderResult.orderId, pricing);
      saveRegistrationToLandingLeads(body, orderResult.orderId, pricing);

      return createJsonResponse({
        success: true,
        orderId: orderResult.orderId,
        razorpayKeyId: orderResult.keyId,
        amount: pricing.payableAmount,
        currency: "INR",
        couponCode: pricing.couponCode,
        originalPrice: pricing.originalPrice,
        discountApplied: pricing.discountApplied,
        packageLabel: pricing.packageLabel
      });
    }

    return createJsonResponse({ success: false, message: "Unknown action" });
  } catch (err) {
    writeToLogs("ERROR", err.message);
    return createJsonResponse({ success: false, error: err.message });
  }
}

// ----------------------------------------------------------------------------
// RAZORPAY ORDER CREATION & VERIFICATION
// ----------------------------------------------------------------------------
function createRazorpayOrder(data, pricing) {
  const phoneStr = String(data.phone || "").trim();
  const countryCode = String(data.countryCode || "").trim();
  const isInternational = Boolean(
    data.isInternational === true ||
    (countryCode && countryCode !== "+91") ||
    (phoneStr.startsWith("+") && !phoneStr.startsWith("+91"))
  );

  const creds = getRazorpayCredentials(isInternational);
  const keyId = creds.keyId;
  const keySecret = creds.keySecret;
  const validAmount = pricing.payableAmount;

  const credentials = Utilities.base64Encode(keyId + ":" + keySecret);
  const options = {
    method: "post",
    headers: {
      Authorization: "Basic " + credentials,
      "Content-Type": "application/json"
    },
    payload: JSON.stringify({
      amount: validAmount * 100,
      currency: "INR",
      receipt: "aib_" + Date.now(),
      notes: {
        product_key: EXPECTED_PRODUCT_KEY,
        product: EXPECTED_PRODUCT_KEY,
        course: "10+ Advanced AI Courses Bundle (Tech Tycoon Academy)",
        package_label: pricing.packageLabel,
        coupon: pricing.couponCode,
        original_price: String(pricing.originalPrice),
        discount_applied: String(pricing.discountApplied),
        amount_paid: String(validAmount),
        customer_name: String(data.name || "").trim(),
        customer_email: String(data.email || "").trim().toLowerCase(),
        phone: phoneStr
      }
    }),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch("https://api.razorpay.com/v1/orders", options);
  const resText = response.getContentText();
  if (response.getResponseCode() !== 200) {
    throw new Error("Razorpay Order Creation Failed: " + resText);
  }
  const orderJson = JSON.parse(resText);
  return {
    orderId: orderJson.id,
    keyId: keyId,
    isIntl: creds.isIntl
  };
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
  return sigBytes.map(function (b) {
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
  const creds = getRazorpayCredentials(isIntl);
  const expectedSig = computeHmacSha256Hex(payload, creds.keySecret);
  if (constantTimeEquals(expectedSig, cleanSignature)) return true;

  const domesticSecret = getOptionalScriptSecret("RAZORPAY_KEY_SECRET");
  if (domesticSecret && domesticSecret !== creds.keySecret) {
    if (constantTimeEquals(computeHmacSha256Hex(payload, domesticSecret), cleanSignature)) return true;
  }
  const intlSecret = getOptionalScriptSecret("RAZORPAY_KEY_SECRET_INTL");
  if (intlSecret && intlSecret !== creds.keySecret) {
    if (constantTimeEquals(computeHmacSha256Hex(payload, intlSecret), cleanSignature)) return true;
  }
  return false;
}

function verifyPaymentWithRazorpayServer(orderId, paymentId, expectedAmountInr, isIntl) {
  const cleanOrderId = String(orderId || "").trim();
  const cleanPaymentId = String(paymentId || "").trim();
  const expectedPaise = Math.round(Number(expectedAmountInr) * 100);

  const creds = getRazorpayCredentials(isIntl);
  const credentials = Utilities.base64Encode(creds.keyId + ":" + creds.keySecret);
  const url = "https://api.razorpay.com/v1/payments/" + encodeURIComponent(cleanPaymentId);
  let res = UrlFetchApp.fetch(url, {
    method: "get",
    headers: { Authorization: "Basic " + credentials, "Content-Type": "application/json" },
    muteHttpExceptions: true
  });

  if (res.getResponseCode() !== 200 && creds.isIntl) {
    const domCreds = getRazorpayCredentials(false);
    const domAuth = Utilities.base64Encode(domCreds.keyId + ":" + domCreds.keySecret);
    res = UrlFetchApp.fetch(url, {
      method: "get",
      headers: { Authorization: "Basic " + domAuth, "Content-Type": "application/json" },
      muteHttpExceptions: true
    });
  }

  if (res.getResponseCode() !== 200) {
    throw new Error("Razorpay API rejected payment ID (" + res.getResponseCode() + ").");
  }
  const payment = JSON.parse(res.getContentText() || "{}");
  if (!payment || payment.id !== cleanPaymentId) {
    throw new Error("Payment record mismatch.");
  }
  if (payment.order_id !== cleanOrderId) {
    throw new Error("Payment belongs to a different order.");
  }
  if (payment.status !== "captured" && payment.status !== "authorized") {
    throw new Error("Payment status is '" + (payment.status || "unknown") + "', expected 'captured'.");
  }
  if (expectedPaise >= 100 && Number(payment.amount) !== expectedPaise) {
    throw new Error("Razorpay amount (" + payment.amount + " paise) does not match expected order amount (" + expectedPaise + " paise).");
  }
  return payment;
}

function updatePaymentStatus(data) {
  const orderId = data.razorpay_order_id || data.orderId || "";
  const paymentId = data.razorpay_payment_id || data.transactionId || data.paymentId || "";
  const signature = data.razorpay_signature || "";
  const phoneStr = String(data.phone || "");
  const isInternational = Boolean(
    data.isInternational === true ||
    (data.countryCode && data.countryCode !== "+91") ||
    (phoneStr.startsWith("+") && !phoneStr.startsWith("+91"))
  );

  if (!orderId || !paymentId || !signature) {
    writeToLogs("SECURITY_REJECT", "Missing required Razorpay verification fields for order: " + orderId);
    throw new Error("Missing razorpay_order_id, razorpay_payment_id, or razorpay_signature.");
  }

  const sigOk = verifyRazorpayPaymentSignature(orderId, paymentId, signature, isInternational);
  if (!sigOk) {
    writeToLogs("SECURITY_REJECT", "Invalid Razorpay signature for order: " + orderId);
    throw new Error("Payment signature verification failed.");
  }

  return processVerifiedBundlePayment(orderId, paymentId, isInternational, data.amount || data.final_price, data);
}

// ----------------------------------------------------------------------------
// SHEET STORAGE HELPERS (Sheet1 & Landing_Leads)
// ----------------------------------------------------------------------------
function sanitizeCell(val) {
  if (val === null || val === undefined) return "";
  const str = String(val).replace(/[\u0000-\u001F\u007F]/g, "").trim();
  if (/^[=+\-@\t\r]/.test(str)) return "'" + str;
  return str;
}

function ensureRegSheetInitialized(ss) {
  let sheet = ss.getSheetByName(SHEET_NAME_REG);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME_REG);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(REG_SHEET_HEADERS);
    sheet.getRange(1, 1, 1, REG_SHEET_HEADERS.length)
      .setFontWeight("bold")
      .setBackground("#0B1B3F")
      .setFontColor("#FFFFFF");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function saveToSheet(data, orderId, pricing) {
  const ss = getBundleSpreadsheet();
  const sheet = ensureRegSheetInitialized(ss);
  const rzpTag = getRazorpayAccountTag(data);
  const cleanPhone = String(data.phone || "").replace(/[^\d+\-\s]/g, "");
  const countryCode = String(data.countryCode || (cleanPhone.startsWith("+91") ? "+91" : "+91"));
  const pageUrl = String(data.page || data.pageUrl || COMPANY_CONFIG.COURSE_PAGE_URL);

  sheet.appendRow([
    new Date(),                                                  // Col 1 (A): Timestamp
    sanitizeCell(data.name),                                     // Col 2 (B): Name
    sanitizeCell(String(data.email || "").toLowerCase()),        // Col 3 (C): Email
    "'" + cleanPhone,                                            // Col 4 (D): Phone
    "10+ Advanced AI Courses Bundle",                            // Col 5 (E): Course / Program
    sanitizeCell(pricing.packageLabel),                          // Col 6 (F): Package / Coupon
    pricing.payableAmount,                                       // Col 7 (G): Amount
    "INITIATED",                                                 // Col 8 (H): Status
    orderId,                                                     // Col 9 (I): Order ID
    "",                                                          // Col 10 (J): Payment ID
    "PENDING",                                                   // Col 11 (K): Email Status
    "NO",                                                        // Col 12 (L): WhatsApp Clicked
    "",                                                          // Col 13 (M): Invoice Number
    pricing.couponCode,                                          // Col 14 (N): Coupon Code
    pricing.originalPrice,                                       // Col 15 (O): Original Price
    pricing.discountApplied,                                     // Col 16 (P): Discount Applied
    sanitizeCell(countryCode),                                   // Col 17 (Q): Country Code
    sanitizeCell(pageUrl),                                       // Col 18 (R): Page URL
    "",                                                          // Col 19 (S): Paid At
    pricing.couponCode + " | PRICE: ₹" + pricing.payableAmount + " | " + rzpTag // Col 20 (T): Promo & Gateway Meta
  ]);
  SpreadsheetApp.flush();
}

function getLandingLeadsSheet(ss) {
  let sheet = ss.getSheetByName(SHEET_NAME_LANDING_LEADS);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME_LANDING_LEADS);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(LANDING_LEAD_HEADERS);
    sheet.getRange(1, 1, 1, LANDING_LEAD_HEADERS.length)
      .setFontWeight("bold")
      .setBackground("#0284C7")
      .setFontColor("#FFFFFF");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function saveRegistrationToLandingLeads(data, orderId, pricing) {
  try {
    const ss = getBundleSpreadsheet();
    const sheet = getLandingLeadsSheet(ss);
    const utm = data.utm || {};
    const cleanPhone = String(data.phone || "").replace(/[^\d+]/g, "");
    const pageUrl = String(data.page || data.pageUrl || COMPANY_CONFIG.COURSE_PAGE_URL);

    sheet.appendRow([
      new Date(),
      data.leadId || orderId || ("lead_" + Utilities.getUuid().replace(/-/g, "").substring(0, 16)),
      sanitizeCell(data.name || ""),
      "'" + cleanPhone,
      sanitizeCell(String(data.email || "").toLowerCase()),
      sanitizeCell(pageUrl.substring(0, 500)),
      sanitizeCell(String(data.utm_source || utm.utm_source || pricing.couponCode || "register_modal").substring(0, 100)),
      sanitizeCell(String(data.utm_medium || utm.utm_medium || "ai_bundle").substring(0, 100)),
      sanitizeCell(String(data.utm_campaign || utm.utm_campaign || ("AI_Bundle_" + pricing.payableAmount)).substring(0, 150)),
      sanitizeCell(String(data.gclid || utm.gclid || "").substring(0, 200)),
      sanitizeCell(String(data.fbclid || utm.fbclid || "").substring(0, 200)),
      sanitizeCell(String(data.userAgent || "AI Bundle Register Modal").substring(0, 300))
    ]);
    SpreadsheetApp.flush();
  } catch (err) {
    writeToLogs("LANDING_LEAD_WARN", err.message);
  }
}

function saveLandingLead(data) {
  if (!data || typeof data !== "object") {
    data = {
      name: "Test Visitor (Editor Run)",
      phone: "+919876543210",
      email: "test@techtycoon.in",
      pageUrl: COMPANY_CONFIG.COURSE_PAGE_URL,
      source: "editor_manual_run"
    };
  }
  if (data.website) {
    writeToLogs("LANDING_LEAD_BOT_REJECT", "Honeypot field filled");
    return { success: false, error: "Submission rejected." };
  }

  const name = String(data.name || "").replace(/\s+/g, " ").trim();
  const phone = String(data.phone || "").replace(/[^\d+]/g, "");
  const email = String(data.email || "").trim().toLowerCase();
  if (name.length < 2) return { success: false, error: "Please enter your full name." };
  if (phone.replace(/\D/g, "").length < 7) return { success: false, error: "Please enter a valid phone number." };

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const ss = getBundleSpreadsheet();
    const sheet = getLandingLeadsSheet(ss);
    const utm = data.utm || {};
    const leadId = "lead_" + Utilities.getUuid().replace(/-/g, "").substring(0, 16);
    sheet.appendRow([
      new Date(),
      leadId,
      sanitizeCell(name),
      "'" + phone,
      sanitizeCell(email),
      sanitizeCell(String(data.pageUrl || data.page || COMPANY_CONFIG.COURSE_PAGE_URL).substring(0, 500)),
      sanitizeCell(String(utm.utm_source || data.source || "").substring(0, 100)),
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
    return { success: false, error: "Could not save your details. Please try again." };
  } finally {
    lock.releaseLock();
  }
}

function getLandingLeads() {
  const ss = getBundleSpreadsheet();
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
  return list.reverse();
}

// ----------------------------------------------------------------------------
// PAYMENT PROCESSING & SHEET UPDATING
// ----------------------------------------------------------------------------
function processVerifiedBundlePayment(orderId, paymentId, isInternational, clientSuppliedAmount, extraData) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const cleanOrderId = String(orderId || "").trim();
    const cleanPaymentId = String(paymentId || "").trim();
    const props = PropertiesService.getScriptProperties();

    if (props && props.getProperty("PROCESSED_PAY_" + cleanPaymentId)) {
      const cachedInvNo = props.getProperty("INV_NO_" + cleanPaymentId) || "";
      return {
        success: true,
        alreadyProcessed: true,
        verified: true,
        paymentId: cleanPaymentId,
        orderId: cleanOrderId,
        invoiceNumber: cachedInvNo
      };
    }

    const ss = getBundleSpreadsheet();
    const sheet = ensureRegSheetInitialized(ss);
    let rows = sheet.getDataRange().getValues();

    let foundIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      const rowPayId = String(rows[i][9] || "").trim().replace(/^'/, "");
      const rowStatus = String(rows[i][7] || "").trim();
      if (rowPayId && rowPayId === cleanPaymentId && (rowStatus === "✅ PAID" || rowStatus.indexOf("TEST_VERIFIED") !== -1)) {
        return {
          success: true,
          alreadyProcessed: true,
          verified: true,
          paymentId: cleanPaymentId,
          orderId: cleanOrderId,
          invoiceNumber: String(rows[i][12] || "")
        };
      }
      if (String(rows[i][8] || "").trim() === cleanOrderId) {
        foundIndex = i;
        break;
      }
    }

    // Fallback lookup by email if webhook arrived before or without matching order row
    if (foundIndex === -1 && extraData && extraData.email) {
      const cleanEmail = String(extraData.email).trim().toLowerCase();
      for (let i = rows.length - 1; i >= 1; i--) {
        const rowEmail = String(rows[i][2] || "").trim().toLowerCase();
        const rowStatus = String(rows[i][7] || "").trim();
        if (rowEmail === cleanEmail && (rowStatus === "INITIATED" || rowStatus === "WAITING")) {
          foundIndex = i;
          break;
        }
      }
    }

    // If still not found, create the row so no paid customer is ever lost
    if (foundIndex === -1) {
      const fallbackPricing = resolveBundlePricing({
        email: extraData && extraData.email,
        coupon: (extraData && extraData.coupon) || (Number(clientSuppliedAmount) === 15000 ? "AIANTONY" : "AMIABLE"),
        amount: clientSuppliedAmount || 30000
      });
      saveToSheet({
        name: (extraData && extraData.name) || "Learner",
        email: (extraData && extraData.email) || "",
        phone: (extraData && extraData.phone) || "",
        pageUrl: COMPANY_CONFIG.COURSE_PAGE_URL
      }, cleanOrderId, fallbackPricing);
      rows = sheet.getDataRange().getValues();
      foundIndex = rows.length - 1;
    }

    const row = rows[foundIndex];
    const expectedAmountInr = Number(row[6]) || Number(clientSuppliedAmount) || 30000;

    // Authoritative Server-to-Server Verification with Razorpay API
    verifyPaymentWithRazorpayServer(cleanOrderId, cleanPaymentId, expectedAmountInr, isInternational);

    const name = String(row[1] || (extraData && extraData.name) || "Learner").replace(/^'/, "");
    const email = String(row[2] || (extraData && extraData.email) || "").replace(/^'/, "");
    const phoneClean = String(row[3] || (extraData && extraData.phone) || "").replace(/^'/, "");
    const couponCode = String(row[13] || (extraData && extraData.coupon) || (expectedAmountInr === 15000 ? "AIANTONY" : "AMIABLE")).trim().toUpperCase();

    // Send Confirmation Email + Non-GST Invoice PDF
    let emailResult = {
      invoiceNumber: allocateNextInvoiceNumber(cleanPaymentId, cleanOrderId, isExplicitOneRupeeTest(email, expectedAmountInr)),
      courseTitle: "10+ Advanced AI Courses Bundle (Tech Tycoon Academy)"
    };
    try {
      emailResult = sendBundleConfirmationEmail(
        email,
        name,
        expectedAmountInr,
        couponCode,
        cleanPaymentId,
        cleanOrderId,
        phoneClean
      ) || emailResult;
    } catch (mailErr) {
      writeToLogs("EMAIL_ERROR", mailErr.message);
    }

    const isTestTx = isExplicitOneRupeeTest(email, expectedAmountInr);
    const paidAtStr = Utilities.formatDate(new Date(), "Asia/Kolkata", "dd MMM yyyy, hh:mm a");
    const rzpTag = getRazorpayAccountTag(extraData || { phone: phoneClean });

    sheet.getRange(foundIndex + 1, 8).setValue(isTestTx ? "✅ TEST_VERIFIED (₹1)" : "✅ PAID");
    sheet.getRange(foundIndex + 1, 9).setValue(cleanOrderId);
    sheet.getRange(foundIndex + 1, 10).setValue(sanitizeCell(cleanPaymentId));
    sheet.getRange(foundIndex + 1, 11).setValue("SENT ✅");
    sheet.getRange(foundIndex + 1, 13).setValue(emailResult.invoiceNumber);
    sheet.getRange(foundIndex + 1, 19).setValue(paidAtStr);

    const existingPromoCol = String(row[19] || "");
    if (!existingPromoCol.includes("RZP:")) {
      sheet.getRange(foundIndex + 1, 20).setValue(existingPromoCol + " | " + rzpTag);
    }
    SpreadsheetApp.flush();

    if (props) {
      props.setProperty("PROCESSED_PAY_" + cleanPaymentId, new Date().toISOString());
      props.setProperty("INV_NO_" + cleanPaymentId, emailResult.invoiceNumber);
    }

    return {
      success: true,
      verified: true,
      paymentId: cleanPaymentId,
      orderId: cleanOrderId,
      invoiceNumber: emailResult.invoiceNumber,
      amount: expectedAmountInr,
      couponCode: couponCode
    };
  } finally {
    lock.releaseLock();
  }
}

// ----------------------------------------------------------------------------
// INSTANT EMAIL DELIVERY & OFFICIAL NON-GST INVOICE PDF GENERATOR
// ----------------------------------------------------------------------------
function allocateNextInvoiceNumber(paymentId, orderId, isTest) {
  const cleanSuffix = String(paymentId || orderId || Date.now()).replace(/[^A-Za-z0-9]/g, "").slice(-6).toUpperCase();
  if (isTest) {
    return "TEST-TT/26-27/AIB-" + cleanSuffix;
  }
  try {
    const props = PropertiesService.getScriptProperties();
    if (props) {
      const existing = paymentId ? props.getProperty("INV_NO_" + paymentId) : "";
      if (existing) return existing;
      const currentSeq = Number(props.getProperty("AI_BUNDLE_INVOICE_SEQ") || "1000") + 1;
      props.setProperty("AI_BUNDLE_INVOICE_SEQ", String(currentSeq));
      return "TT/26-27/AIB-" + currentSeq;
    }
  } catch (e) {}
  return "TT/26-27/AIB-" + cleanSuffix;
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

function generateOurInvoicePdfBlob(customerName, customerEmail, customerPhone, courseName, totalAmount, couponCode, paymentId, orderId, invoiceNo) {
  const total = Math.max(1, Math.round(Number(totalAmount) || 30000));
  const originalPrice = PRICING_CONFIG.ORIGINAL_PRICE;
  const discount = total === 1 ? (originalPrice - 1) : Math.max(0, originalPrice - total);
  const amountInWords = numberToIndianRupeesWords(total);
  const invNumber = String(invoiceNo || "TT/26-27/AIB").trim();
  const dateStr = Utilities.formatDate(new Date(), "Asia/Kolkata", "dd MMM yyyy");
  const cleanCoupon = String(couponCode || (total === 15000 ? "AIANTONY" : "AMIABLE")).toUpperCase();

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    body { font-family: Arial, Helvetica, sans-serif; color: #0f172a; margin: 18px; font-size: 11.5px; }
    .box { border: 1px solid #cbd5e1; border-radius: 10px; padding: 24px; }
    .header { border-bottom: 2px solid #0B1B3F; padding-bottom: 14px; margin-bottom: 18px; width: 100%; }
    .paid { background: #dcfce7; color: #15803d; font-weight: bold; padding: 4px 12px; border-radius: 12px; font-size: 11px; }
    table.items { width: 100%; border-collapse: collapse; margin: 16px 0; }
    table.items th { background: #0B1B3F; color: #ffffff; padding: 10px 8px; text-align: left; font-size: 10.5px; text-transform: uppercase; }
    table.items td { padding: 12px 8px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
    .right { text-align: right; font-family: monospace; }
  </style></head><body><div class="box">
    <table class="header"><tr>
      <td>
        <h2 style="margin:0 0 4px 0;font-size:16px;color:#0B1B3F;">${COMPANY_CONFIG.COMPANY_NAME}</h2>
        <div style="color:#0284C7;font-weight:bold;font-size:11.5px;margin-bottom:2px;">${COMPANY_CONFIG.COMPANY_BRAND}</div>
        <div style="color:#475569;line-height:1.5;">${COMPANY_CONFIG.ADDRESS_LINE1}, ${COMPANY_CONFIG.CITY}, ${COMPANY_CONFIG.STATE} - ${COMPANY_CONFIG.POSTAL_CODE}<br/>Mobile: +91 ${COMPANY_CONFIG.COMPANY_PHONE} / +91 ${COMPANY_CONFIG.COMPANY_ALT_PHONE} | Web: ${COMPANY_CONFIG.COMPANY_WEBSITE}</div>
      </td>
      <td style="text-align:right;vertical-align:top;">
        <h1 style="margin:0;font-size:20px;color:#0B1B3F;">INVOICE</h1>
        <div style="color:#64748b;font-size:10px;margin-bottom:6px;">OFFICIAL PAYMENT RECEIPT</div>
        <span class="paid">PAID</span>
      </td>
    </tr></table>
    <table style="width:100%;margin-bottom:16px;"><tr>
      <td style="width:50%;vertical-align:top;background:#f8fafc;padding:12px;border-radius:6px;border:1px solid #e2e8f0;">
        <strong style="color:#64748b;font-size:9.5px;text-transform:uppercase;">Billed To (Learner Details)</strong><br/>
        <strong>${sanitizeCell(customerName || "Learner")}</strong><br/>
        Email: ${sanitizeCell(customerEmail || "")}<br/>
        Phone: ${sanitizeCell(customerPhone || "")}
      </td>
      <td style="width:50%;vertical-align:top;background:#f8fafc;padding:12px;border-radius:6px;border:1px solid #e2e8f0;">
        <strong style="color:#64748b;font-size:9.5px;text-transform:uppercase;">Invoice &amp; Payment Details</strong><br/>
        <strong>Invoice No:</strong> ${invNumber}<br/>
        <strong>Invoice Date:</strong> ${dateStr}<br/>
        <strong>Payment ID:</strong> ${sanitizeCell(paymentId || "PAID")}<br/>
        <strong>Order Ref:</strong> ${sanitizeCell(orderId || "")} | <strong>Mode:</strong> Razorpay
      </td>
    </tr></table>
    <table class="items">
      <thead><tr><th>#</th><th>Description of Program</th><th class="right">Qty</th><th class="right">Original Price</th><th class="right">Offer Total (INR)</th></tr></thead>
      <tbody><tr>
        <td>1</td>
        <td>
          <strong>${sanitizeCell(courseName)}</strong><br/>
          <span style="color:#475569;font-size:10px;line-height:1.45;">
            Includes 10+ Advanced AI Courses on One Platform: Advanced Claude Masterclass, AI Business &amp; Generative Models, AI for Non-Tech Working Professionals, AI Graphic Designing, End-to-End AI Business Automation, AI Passive Income Setup, AI-Powered Digital Marketing, AI Financial Management, Prompt Engineering &amp; AI Content Creation (Including Learning Material).
          </span>
        </td>
        <td class="right">1</td>
        <td class="right">Rs. ${originalPrice.toFixed(2)}</td>
        <td class="right">Rs. ${total.toFixed(2)}</td>
      </tr></tbody>
    </table>
    <table style="width:100%;border-collapse:collapse;"><tr>
      <td style="width:54%;vertical-align:top;padding-right:14px;">
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:12px;">
          <div style="font-size:9.5px;color:#64748b;text-transform:uppercase;font-weight:bold;">Total Amount Paid in Words</div>
          <div style="font-weight:bold;color:#0f172a;margin-top:4px;">${amountInWords}</div>
          <div style="margin-top:6px;font-size:10px;color:#0284C7;font-weight:bold;">Coupon Applied: ${cleanCoupon} (Saved Rs. ${discount.toLocaleString("en-IN")})</div>
        </div>
      </td>
      <td style="width:46%;vertical-align:top;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:5px 0;border-bottom:1px solid #e2e8f0;color:#64748b;">Original Program Fee:</td><td class="right" style="padding:5px 0;border-bottom:1px solid #e2e8f0;color:#64748b;">Rs. ${originalPrice.toFixed(2)}</td></tr>
          <tr><td style="padding:5px 0;border-bottom:1px solid #e2e8f0;color:#15803d;">Scholarship / Coupon (${cleanCoupon}):</td><td class="right" style="padding:5px 0;border-bottom:1px solid #e2e8f0;color:#15803d;">- Rs. ${discount.toFixed(2)}</td></tr>
          <tr><td style="padding:8px 0;font-weight:bold;font-size:13px;color:#0B1B3F;">Total Amount Paid (INR):</td><td class="right" style="padding:8px 0;font-weight:bold;font-size:13px;color:#0B1B3F;">Rs. ${total.toFixed(2)}</td></tr>
        </table>
      </td>
    </tr></table>
    <table style="width:100%;margin-top:20px;padding-top:12px;border-top:1px dashed #cbd5e1;font-size:9.5px;color:#64748b;"><tr>
      <td>Certified that the particulars given above are true and correct.<br/>This is a computer-generated Official Invoice and requires no physical signature.</td>
      <td style="text-align:right;">For <strong>${COMPANY_CONFIG.COMPANY_NAME}</strong><br/><br/><strong style="color:#0f172a;">Authorised Signatory</strong></td>
    </tr></table>
  </div></body></html>`;

  const cleanFileNo = invNumber.replace(/[^A-Za-z0-9_-]/g, "_");
  return Utilities.newBlob(html, "text/html", "Invoice.html")
    .getAs("application/pdf")
    .setName("Invoice_" + cleanFileNo + ".pdf");
}

function sendBundleConfirmationEmail(email, name, totalAmount, couponCode, paymentId, orderId, phone) {
  const numAmount = Math.max(1, Math.round(Number(totalAmount) || 30000));
  const cleanCoupon = String(couponCode || (numAmount === 15000 ? "AIANTONY" : "AMIABLE")).toUpperCase();
  const courseTitle = "10+ Advanced AI Courses Bundle — Tech Tycoon Academy";
  const isTest = isExplicitOneRupeeTest(email, numAmount);
  const officialInvoiceNo = allocateNextInvoiceNumber(paymentId, orderId, isTest);

  // Generate Non-GST Invoice PDF attachment
  let pdfAttachment = null;
  try {
    pdfAttachment = generateOurInvoicePdfBlob(
      name,
      email,
      phone,
      courseTitle,
      numAmount,
      cleanCoupon,
      paymentId,
      orderId,
      officialInvoiceNo
    );
  } catch (pdfErr) {
    writeToLogs("PDF_GEN_ERROR", pdfErr.message);
  }

  const coursesListHtml = INCLUDED_COURSES.map(function (c) {
    return '<li style="padding:6px 0;color:#1e293b;font-size:14px;font-weight:600;">✅ ' + c + '</li>';
  }).join("");

  const waSupportUrl = "https://wa.me/" + COMPANY_CONFIG.WA_PHONE_NUMBER +
    "?text=" + encodeURIComponent("Hello Tech Tycoon Academy Team! I have completed my enrollment for the 10+ Advanced AI Courses Bundle (Order ID: " + orderId + ", Payment ID: " + paymentId + ").");

  const subject = "🎉 Enrollment Confirmed & Official Invoice: 10+ Advanced AI Courses Bundle (Tech Tycoon Academy)";

  const htmlBody = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f0f9ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f9ff;padding:36px 16px;">
    <tr>
      <td align="center">
        <table width="600" style="max-width:600px;width:100%;background-color:#ffffff;border:1px solid #bae6fd;border-radius:24px;overflow:hidden;box-shadow:0 12px 24px -6px rgba(11,27,63,0.1);">
          <!-- HEADER BANNER -->
          <tr>
            <td style="background:linear-gradient(135deg,#0B1B3F 0%,#0284C7 100%);padding:38px 32px;text-align:center;border-bottom:4px solid #38BDF8;">
              <div style="display:inline-block;background:rgba(125,211,252,0.2);border:1px solid #7DD3FC;color:#7DD3FC;font-size:11px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;padding:6px 14px;border-radius:100px;margin-bottom:14px;">
                ★ TECH TYCOON ACADEMY — ENROLLMENT CONFIRMED ★
              </div>
              <h1 style="font-size:25px;font-weight:900;color:#ffffff;margin:0;line-height:1.25;">10+ Advanced AI Courses. One Platform.</h1>
              <p style="color:#BAE6FD;font-size:13.5px;margin:8px 0 0;font-weight:600;">Mentor: Antony Praveen (AI Engineer, Founder &amp; Trainer)</p>
            </td>
          </tr>

          <!-- MAIN CONTENT -->
          <tr>
            <td style="padding:34px 32px;">
              <h2 style="color:#0B1B3F;font-size:21px;margin:0 0 12px;font-weight:800;">Welcome aboard, ${sanitizeCell(name)}! 🎉</h2>
              <p style="color:#334155;font-size:15px;line-height:1.6;margin:0 0 22px;">
                Congratulations! Your registration and payment of <strong>₹${numAmount.toLocaleString("en-IN")}</strong> (Coupon: <strong>${cleanCoupon}</strong>) for the <strong>10+ Advanced AI Courses Bundle</strong> at Tech Tycoon Academy are confirmed. Your official <strong>Payment Invoice (PDF)</strong> is attached to this email.
              </p>

              <!-- ALL 10+ COURSES INCLUDED -->
              <div style="background:linear-gradient(135deg,#F0F9FF 0%,#E0F2FE 100%);border:2px solid #38BDF8;border-radius:18px;padding:22px 24px;margin:0 0 24px;">
                <div style="display:inline-block;background:#0B1B3F;color:#7DD3FC;font-size:10.5px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;padding:4px 10px;border-radius:6px;margin-bottom:10px;">
                  ALL 10+ COURSES &amp; LEARNING MATERIAL INCLUDED
                </div>
                <ul style="list-style:none;padding:0;margin:8px 0 0;">
                  ${coursesListHtml}
                </ul>
              </div>

              <!-- ORDER SUMMARY TABLE -->
              <table width="100%" style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;margin-bottom:24px;border-collapse:separate;border-spacing:0;">
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #e2e8f0;font-size:13.5px;color:#64748b;width:40%;">🎓 Program</td>
                  <td style="padding:12px 18px;border-bottom:1px solid #e2e8f0;font-size:13.5px;color:#0B1B3F;font-weight:700;">10+ Advanced AI Courses Bundle</td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #e2e8f0;font-size:13.5px;color:#64748b;">🏷️ Coupon Applied</td>
                  <td style="padding:12px 18px;border-bottom:1px solid #e2e8f0;font-size:13.5px;color:#0284C7;font-weight:700;">${cleanCoupon}</td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #e2e8f0;font-size:13.5px;color:#64748b;">💳 Amount Paid</td>
                  <td style="padding:12px 18px;border-bottom:1px solid #e2e8f0;font-size:13.5px;color:#15803d;font-weight:800;">₹${numAmount.toLocaleString("en-IN")}</td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #e2e8f0;font-size:13.5px;color:#64748b;">🧾 Invoice Number</td>
                  <td style="padding:12px 18px;border-bottom:1px solid #e2e8f0;font-size:13.5px;color:#0B1B3F;font-weight:700;">${officialInvoiceNo}</td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;font-size:13.5px;color:#64748b;">🔑 Payment ID</td>
                  <td style="padding:12px 18px;font-size:13.5px;color:#475569;font-family:monospace;">${paymentId}</td>
                </tr>
              </table>

              <!-- WHATSAPP ONBOARDING CTA -->
              <div style="text-align:center;margin:24px 0;">
                <a href="${waSupportUrl}" target="_blank" style="display:inline-block;background-color:#0B1B3F;color:#7DD3FC;text-decoration:none;padding:15px 30px;border-radius:14px;font-size:15px;font-weight:800;border:2px solid #0B1B3F;">
                  💬 Connect on WhatsApp for Onboarding &amp; Access
                </a>
              </div>

              <p style="color:#64748b;font-size:12px;text-align:center;margin:20px 0 0;line-height:1.5;">
                Need assistance? Call or WhatsApp us at <strong>+91 75581 33039 / +91 70103 40494</strong> or email<br/>
                <a href="mailto:${COMPANY_CONFIG.COMPANY_EMAIL}" style="color:#0284C7;text-decoration:none;font-weight:700;">${COMPANY_CONFIG.COMPANY_EMAIL}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#0B1B3F;padding:20px;text-align:center;">
              <p style="color:#94a3b8;font-size:11px;margin:0;">© 2026 ${COMPANY_CONFIG.COMPANY_NAME}<br/>${COMPANY_CONFIG.ADDRESS_LINE1}, ${COMPANY_CONFIG.CITY}, ${COMPANY_CONFIG.STATE} - ${COMPANY_CONFIG.POSTAL_CODE}</p>
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
    name: "Tech Tycoon Academy",
    replyTo: COMPANY_CONFIG.COMPANY_EMAIL
  };
  if (pdfAttachment) {
    emailOptions.attachments = [pdfAttachment];
  }

  try {
    MailApp.sendEmail(emailOptions);
    writeToLogs("EMAIL_SENT", "AI Bundle confirmation & invoice (" + officialInvoiceNo + ") sent to " + email);
  } catch (mailErr) {
    writeToLogs("EMAIL_SEND_ERROR", mailErr.message);
    if (pdfAttachment) {
      try {
        MailApp.sendEmail({
          to: email,
          subject: subject,
          htmlBody: htmlBody,
          name: "Tech Tycoon Academy",
          replyTo: COMPANY_CONFIG.COMPANY_EMAIL
        });
        writeToLogs("EMAIL_FALLBACK_SENT", "Sent AI Bundle email without PDF attachment to " + email);
      } catch (e2) {
        writeToLogs("EMAIL_FALLBACK_FAIL", e2.message);
      }
    }
  }

  return {
    invoiceNumber: officialInvoiceNo,
    courseTitle: courseTitle,
    success: true
  };
}

// ----------------------------------------------------------------------------
// RECONCILIATION & GOOGLE SHEETS MENU ACTIONS (Like Claude Masterclass)
// ----------------------------------------------------------------------------
function fetchRazorpayPaymentForOrder(orderId, isIntl) {
  try {
    const creds = getRazorpayCredentials(isIntl);
    const credentials = Utilities.base64Encode(creds.keyId + ":" + creds.keySecret);
    const url = "https://api.razorpay.com/v1/orders/" + encodeURIComponent(orderId) + "/payments";
    const res = UrlFetchApp.fetch(url, {
      method: "get",
      headers: { Authorization: "Basic " + credentials, "Content-Type": "application/json" },
      muteHttpExceptions: true
    });
    if (res.getResponseCode() === 200) {
      const json = JSON.parse(res.getContentText() || "{}");
      const items = json.items || [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].status === "captured" || items[i].status === "authorized") {
          return items[i];
        }
      }
    }
  } catch (e) {
    writeToLogs("FETCH_ORDER_PAYMENT_ERROR", e.message);
  }
  return null;
}

function reconcilePendingPayments() {
  const ss = getBundleSpreadsheet();
  const sheet = ensureRegSheetInitialized(ss);
  const rows = sheet.getDataRange().getValues();
  const props = PropertiesService.getScriptProperties();
  let resolvedCount = 0;
  const resolvedList = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const status = String(row[7] || "").trim();
    const orderId = String(row[8] || "").trim();
    let payId = String(row[9] || "").trim().replace(/^'/, "");
    const emailStatus = String(row[10] || "").trim();

    if (!payId.startsWith("pay_") && orderId.startsWith("order_") && status !== "✅ PAID") {
      const rzpPay = fetchRazorpayPaymentForOrder(orderId, false) || fetchRazorpayPaymentForOrder(orderId, true);
      if (rzpPay && rzpPay.id) {
        payId = rzpPay.id;
      }
    }

    const needsFulfillment =
      (payId.startsWith("pay_") && status !== "✅ PAID" && !status.includes("TEST_VERIFIED")) ||
      (status === "✅ PAID" && emailStatus !== "SENT ✅");

    if (needsFulfillment && payId.startsWith("pay_")) {
      const name = String(row[1] || "Learner").replace(/^'/, "");
      const email = String(row[2] || "").replace(/^'/, "");
      const phone = String(row[3] || "").replace(/^'/, "");
      const amount = Number(row[6]) || 30000;
      const coupon = String(row[13] || (amount === 15000 ? "AIANTONY" : "AMIABLE")).toUpperCase();
      const isTestTx = isExplicitOneRupeeTest(email, amount);

      let invoiceNo = String(row[12] || "").trim();
      if (email && emailStatus !== "SENT ✅") {
        try {
          const emailRes = sendBundleConfirmationEmail(email, name, amount, coupon, payId, orderId, phone);
          if (emailRes && emailRes.invoiceNumber) {
            invoiceNo = emailRes.invoiceNumber;
          }
          sheet.getRange(i + 1, 11).setValue("SENT ✅");
        } catch (e) {
          writeToLogs("RECONCILE_EMAIL_ERROR", e.message);
        }
      }

      if (!invoiceNo) {
        invoiceNo = allocateNextInvoiceNumber(payId, orderId, isTestTx);
      }

      sheet.getRange(i + 1, 8).setValue(isTestTx ? "✅ TEST_VERIFIED (₹1)" : "✅ PAID");
      sheet.getRange(i + 1, 10).setValue(sanitizeCell(payId));
      sheet.getRange(i + 1, 13).setValue(invoiceNo);
      if (!row[18]) {
        sheet.getRange(i + 1, 19).setValue(Utilities.formatDate(new Date(), "Asia/Kolkata", "dd MMM yyyy, hh:mm a"));
      }

      if (props) {
        props.setProperty("PROCESSED_PAY_" + payId, new Date().toISOString());
        props.setProperty("INV_NO_" + payId, invoiceNo);
      }
      resolvedCount++;
      resolvedList.push({ row: i + 1, name: name, email: email, paymentId: payId, invoiceNumber: invoiceNo });
    }
  }

  SpreadsheetApp.flush();
  writeToLogs("RECONCILIATION_DONE", "Resolved " + resolvedCount + " row(s).");
  return { success: true, resolvedCount: resolvedCount, resolved: resolvedList };
}

function menuMarkSelectedRowPaidAndSendInvoice() {
  const ui = SpreadsheetApp.getUi();
  const ss = getBundleSpreadsheet();
  const sheet = ensureRegSheetInitialized(ss);
  const activeRange = sheet.getActiveRange();
  if (!activeRange || activeRange.getRow() <= 1) {
    ui.alert("Selection Error", "Please select a valid customer row (Row 2 or below).", ui.ButtonSet.OK);
    return;
  }

  const rowIndex = activeRange.getRow();
  const row = sheet.getRange(rowIndex, 1, 1, REG_SHEET_HEADERS.length).getValues()[0];
  const name = String(row[1] || "Learner").replace(/^'/, "");
  const email = String(row[2] || "").replace(/^'/, "");
  const phone = String(row[3] || "").replace(/^'/, "");
  const amount = Number(row[6]) || 30000;
  let orderId = String(row[8] || "").trim();
  let payId = String(row[9] || "").trim().replace(/^'/, "");
  const coupon = String(row[13] || (amount === 15000 ? "AIANTONY" : "AMIABLE")).toUpperCase();

  if (!email || !email.includes("@")) {
    ui.alert("Missing Email", "Row " + rowIndex + " does not contain a valid email address.", ui.ButtonSet.OK);
    return;
  }

  if (!payId.startsWith("pay_")) {
    if (orderId.startsWith("order_")) {
      const rzpPay = fetchRazorpayPaymentForOrder(orderId, false) || fetchRazorpayPaymentForOrder(orderId, true);
      if (rzpPay && rzpPay.id) payId = rzpPay.id;
    }
    if (!payId.startsWith("pay_")) {
      payId = "pay_MANUAL_" + Date.now().toString(36).toUpperCase();
    }
  }
  if (!orderId) {
    orderId = "order_MANUAL_" + Date.now().toString(36).toUpperCase();
    sheet.getRange(rowIndex, 9).setValue(orderId);
  }

  let invNo = String(row[12] || "").trim();
  try {
    const emailRes = sendBundleConfirmationEmail(email, name, amount, coupon, payId, orderId, phone);
    if (emailRes && emailRes.invoiceNumber) invNo = emailRes.invoiceNumber;
  } catch (err) {
    writeToLogs("MANUAL_PROCESS_EMAIL_ERROR", err.message);
  }

  sheet.getRange(rowIndex, 8).setValue("✅ PAID");
  sheet.getRange(rowIndex, 10).setValue(sanitizeCell(payId));
  sheet.getRange(rowIndex, 11).setValue("SENT ✅");
  sheet.getRange(rowIndex, 13).setValue(invNo);
  sheet.getRange(rowIndex, 19).setValue(Utilities.formatDate(new Date(), "Asia/Kolkata", "dd MMM yyyy, hh:mm a"));
  SpreadsheetApp.flush();

  ui.alert(
    "Success! 🎉",
    "Row " + rowIndex + " (" + name + " <" + email + ">) marked as ✅ PAID.\nOfficial Invoice (" + invNo + ") has been generated and emailed!",
    ui.ButtonSet.OK
  );
}

function menuResendInvoiceToSelectedRow() {
  menuMarkSelectedRowPaidAndSendInvoice();
}

function menuReconcileStuckPayments() {
  const ui = SpreadsheetApp.getUi();
  const res = reconcilePendingPayments();
  ui.alert(
    "Reconciliation Complete",
    "Checked all rows in Sheet1. Resolved and sent invoices to " + (res.resolvedCount || 0) + " learner(s).",
    ui.ButtonSet.OK
  );
}

function markWhatsappClicked(orderId) {
  const ss = getBundleSpreadsheet();
  const sheet = ensureRegSheetInitialized(ss);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][8] || "").trim() === String(orderId || "").trim()) {
      sheet.getRange(i + 1, 12).setValue("CHATTED ✅");
      break;
    }
  }
}

function writeToLogs(event, data) {
  try {
    const ss = getBundleSpreadsheet();
    let logSheet = ss.getSheetByName(SHEET_NAME_LOGS);
    if (!logSheet) {
      logSheet = ss.insertSheet(SHEET_NAME_LOGS);
      logSheet.appendRow(["Timestamp", "Event", "Details"]);
      logSheet.getRange(1, 1, 1, 3).setFontWeight("bold").setBackground("#334155").setFontColor("#FFFFFF");
      logSheet.setFrozenRows(1);
    }
    logSheet.appendRow([new Date(), event, String(data || "")]);
  } catch (e) {}
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
