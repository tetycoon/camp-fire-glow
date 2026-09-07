/**
 * ============================================================================
 * CLAUDE MASTERCLASS 2026 — EXCLUSIVE GOOGLE APPS SCRIPT AUTOMATION SYSTEM
 * Technical logs go to "Logs" | Registrations go to "Sheet1"
 * 
 * Google Sheet URL: https://docs.google.com/spreadsheets/d/1JA3FZf8xkpZ8GjuYiETXz9R0ivfW80-rf3PZIzQum9g/edit?gid=0#gid=0
 * THIS SHEET & SCRIPT ARE STRICTLY FOR CLAUDE MASTERCLASS (ONLINE & OFFLINE ONLY)
 * ============================================================================
 */

// Domestic Razorpay Credentials (India +91)
const RAZORPAY_KEY_ID = "rzp_live_T2CbVONQc6qrqj";
const RAZORPAY_KEY_SECRET = "0ZmzKfvHIwbnvkTCPxkWC1a6";

// International Razorpay Credentials (for non-India / away from India users)
const RAZORPAY_KEY_ID_INTL = "rzp_live_gfoS1OjC8tvWjP";
const RAZORPAY_KEY_SECRET_INTL = "B0q7JAz8YhMat2QkTa3YCUGd";

const SPREADSHEET_ID = "1JA3FZf8xkpZ8GjuYiETXz9R0ivfW80-rf3PZIzQum9g"; // Claude Masterclass Sheet ID
const SHEET_NAME_REG = "Sheet1";
const SHEET_NAME_LOGS = "Logs"; 
const VERIFY_TOKEN = "ai_tycoon_auto_662"; 

const WHATSAPP_CONFIG = {
  ACCESS_TOKEN: "EAAU3qgM444cBRSPzgBf8ZADgHdtVimYAdkzvo3fD0p8ldhlnPOMpr7U8t3RQ9H6rvcvmZCs3EZAnKtHv1dHOB1a4hSyWLjGluThXneEyCKGuvgUBnAV2WTSFZCLL4YFZAvoc5h8axCbIVCLZAZB7YHyGgb2aTLudh04SV5XUIZCbUevZBQukQuCZBaeFdFPZBhv0R1iLQZDZD",
  PHONE_NUMBER_ID: "1089787377552637",
  PHONE_NUMBER: "917010340494", 
  WA_GROUP_LINK_CLAUDE_ONLINE: "https://chat.whatsapp.com/HfVfYc6ea7iEHAMFjOb4WS", // Claude Online Community
  WA_GROUP_LINK_CLAUDE_OFFLINE: "https://chat.whatsapp.com/DMp2tRRhjwN1fziYujeQhb", // Claude Offline Group
  POSTER_URL: "https://aitycoon.in/claude_masterclass/images/poster_v2.jpg" 
};

const TRIGGER_MESSAGE_ONLINE = "Hello Tech Tycoon Team I successfully complete the registration of claude masterclass online session";
const TRIGGER_MESSAGE_OFFLINE = "Hello Tech Tycoon Team I successfully complete the registration claude masterclass offline session";

/**
 * Ensures registration is exclusively for Claude Masterclass and filters out ₹99 AI Masterclass rows.
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
    if (amount === 99 && !promo.includes("CLAUDE")) return false;
    return true;
  }
  
  // Exclude ₹99 or AI Masterclass / Secrets Revealed registrations from other apps
  if (amount === 99) return false;
  if (prod.includes("secret") || batch.includes("secret") || (batch.includes("ai masterclass") && !batch.includes("claude"))) return false;
  return true;
}

/**
 * Utility function to clean up non-Claude registrations (e.g. ₹99 rows) from Sheet1.
 * Run this function directly inside Google Apps Script Editor to delete unwanted rows!
 */
function cleanUpNonClaudeRows() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME_REG) || ss.getSheets()[0];
  const rows = sheet.getDataRange().getValues();
  
  let deletedCount = 0;
  for (let i = rows.length - 1; i >= 1; i--) {
    const amount = parseInt(rows[i][6]) || 0;
    const promoCol = (rows[i][19] || "").toString().toLowerCase();
    
    if (amount === 99 || (promoCol.includes("secret") && !promoCol.includes("claude"))) {
      sheet.deleteRow(i + 1);
      deletedCount++;
    }
  }
  
  Logger.log(`Successfully deleted ${deletedCount} non-Claude (₹99) rows from the Google Sheet!`);
}

/**
 * Calculates upcoming Saturday date dynamically for recurring weekend sessions.
 */
function getNextSaturday(fromDate = new Date()) {
  const date = new Date(fromDate.getTime());
  const day = date.getDay(); // 0 = Sun, 6 = Sat
  const diff = (6 - day + 7) % 7;
  if (day === 6 && fromDate.getHours() >= 18) {
    date.setDate(date.getDate() + 7);
  } else {
    date.setDate(date.getDate() + diff);
  }
  return date;
}

/**
 * Dynamically generates session date and time strings for Online and Offline sessions.
 */
function getUpcomingMasterclassDates(isOffline = false) {
  if (isOffline) {
    return {
      dateText: "October 11th, 2026 (Sunday • Full Day)",
      timeText: "9:00 AM – 5:30 PM IST",
      venueText: "🏨 Vestin Park Hotel, Egmore, Chennai"
    };
  }

  return {
    dateText: "September 12 & 13, 2026 (Saturday & Sunday)",
    timeText: "6:00 PM – 9:00 PM IST",
    venueText: "🌐 Live Online Virtual Classroom"
  };
}

function getUpcomingWebinarTime(isOffline = false) {
  if (isOffline) {
    return new Date(2026, 8, 6, 9, 0, 0);
  }
  const nextSat = getNextSaturday(new Date());
  nextSat.setHours(18, 0, 0, 0);
  return nextSat;
}

function setupSheetHeaders() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME_REG) || ss.getSheets()[0];
  
  const headers = [
    "Date & Time", "Name", "Email", "Phone", "Profession", "Mode of Session",
    "Amount", "Status", "Order ID", "Payment ID", "Email Status", "Whatsapp Clicked",
    "WhatsApp Sent (Welcome)", "1-Day Reminder Sent", "60-Min Reminder Sent",
    "30-Min Reminder Sent", "10-Min Reminder Sent", "5-Min Reminder Sent",
    "Session started(Join soon)", "Promo Code & Mode & Gateway"
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight("bold").setBackground("#da7756").setFontColor("#ffffff").setHorizontalAlignment("center");
  sheet.setFrozenRows(1);
  
  let logSheet = ss.getSheetByName(SHEET_NAME_LOGS);
  if (!logSheet) {
    logSheet = ss.insertSheet(SHEET_NAME_LOGS);
    logSheet.appendRow(["Timestamp", "Event Type", "Log Content"]);
    logSheet.getRange(1, 1, 1, 3).setFontWeight("bold").setBackground("#1e293b").setFontColor("#ffffff");
  }
}

// ------------------------------------------------------------
// 1. WEBHOOK: GET (WhatsApp Verification & Registration Fetching)
// ------------------------------------------------------------
function doGet(e) {
  // WhatsApp Verification
  if (e.parameter['hub.mode'] === 'subscribe' && e.parameter['hub.verify_token'] === VERIFY_TOKEN) {
    return ContentService.createTextOutput(e.parameter['hub.challenge']);
  }
  
  // WhatsApp Redirect Link Action
  if (e.parameter.action === 'whatsapp') {
    markWhatsappClicked(e.parameter.orderId);
    const isOffline = e.parameter.mode === 'offline';
    const msgText = isOffline ? TRIGGER_MESSAGE_OFFLINE : TRIGGER_MESSAGE_ONLINE;
    const waChatLink = `https://wa.me/${WHATSAPP_CONFIG.PHONE_NUMBER}?text=${encodeURIComponent(msgText)}`;
    const html = `<html><body style="font-family:sans-serif;text-align:center;padding-top:50px;background:#030712;color:white;">
      <h2>Redirecting to WhatsApp...</h2>
      <script>window.top.location.href="${waChatLink}";</script>
    </body></html>`;
    return HtmlService.createHtmlOutput(html).setTitle("Redirecting...");
  }

  // Dashboard Registrations Fetching (Filtered exclusively for Claude Masterclass)
  if (e.parameter.action === 'getRegistrations') {
    if (e.parameter.token !== VERIFY_TOKEN) {
      return createJsonResponse({ success: false, error: "Unauthorized access token" });
    }
    
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME_REG) || ss.getSheets()[0];
    const values = sheet.getDataRange().getValues();
    
    const list = [];
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      if (!row[0] && !row[1] && !row[2]) continue; // Skip empty rows
      
      const amount = Number(row[6] || 0);
      const promoCol = (row[19] || "").toString().toLowerCase();
      if (amount === 99 && !promoCol.includes("claude")) continue; // STRICT FILTER: Exclude ₹99 AI Masterclass rows

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
        sessionDate: "September 12 & 13, 2026",
        sessionTime: "6:00 PM IST"
      });
    }
    
    list.reverse();
    return createJsonResponse({ success: true, registrations: list, count: list.length });
  }

  if (e.parameter.action === 'checkPromo') {
    const code = (e.parameter.code || "").toUpperCase().trim();
    return createJsonResponse({ valid: isPromoCodeValid(code) });
  }

  return ContentService.createTextOutput("Claude MasterClass Automation is running.");
}

// ------------------------------------------------------------
// 2. WEBHOOK: POST (Leads, Payments, & Incoming Messages)
// ------------------------------------------------------------
function doPost(e) {
  const rawData = e.postData.contents;
  writeToLogs("RAW_WEBHOOK", rawData.substring(0, 500));

  try {
    const body = JSON.parse(rawData);

    if (body.event === "payment.captured" || body.event === "order.paid") {
      const paymentEntity = body.payload.payment.entity;
      const notes = paymentEntity.notes || {};
      updatePaymentStatusFromWebhook(paymentEntity.order_id, paymentEntity.id, paymentEntity.email, notes, paymentEntity.amount);
      return createJsonResponse({ success: true, source: "razorpay_webhook" });
    }

    if (body.paymentSuccess === true) {
      if (!isClaudeRegistration(body)) {
        writeToLogs("NON_CLAUDE_PAYMENT_SKIPPED", `Skipped non-Claude payment of ₹${body.amount} for ${body.email}`);
        return createJsonResponse({ success: false, message: "Ignored non-Claude payment" });
      }
      updatePaymentStatus(body);
      return createJsonResponse({ success: true, source: "client_browser" });
    }

    if (body.name && body.email && body.phone && !body.object) {
      if (!isClaudeRegistration(body)) {
        writeToLogs("NON_CLAUDE_LEAD_SKIPPED", `Skipped non-Claude lead of ₹${body.amount} for ${body.email}`);
        return createJsonResponse({ success: false, message: "Ignored non-Claude lead" });
      }
      let orderId = "";
      try {
        orderId = createRazorpayOrder(body);
      } catch (err) {
        writeToLogs("ORDER_API_ERROR", "Razorpay order creation failed: " + err.message);
        orderId = "ERR_" + Math.random().toString(36).substring(2, 10).toUpperCase();
      }
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

// ------------------------------------------------------------
// 3. WHATSAPP & EMAIL LOGIC (EXCLUSIVE CLAUDE MASTERCLASS)
// ------------------------------------------------------------
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

  if (!isOfflineMsg && phone10) {
    try {
      const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      const sheet = ss.getSheetByName(SHEET_NAME_REG) || ss.getSheets()[0];
      const rows = sheet.getDataRange().getValues();
      for (let i = 1; i < rows.length; i++) {
        const rowPhone10 = getLast10Digits(rows[i][3]);
        if (rowPhone10 && rowPhone10 === phone10) {
          const amount = parseInt(rows[i][6]) || 499;
          const promoMode = (rows[i][19] || "").toString().toUpperCase();
          const colFMode = (rows[i][5] || "").toString().toUpperCase();
          if (amount >= 4000 || promoMode.includes("OFFLINE") || colFMode.includes("OFFLINE")) {
            isOfflineMsg = true;
          }
          break;
        }
      }
    } catch (e) {}
  }

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

function sendMasterclassEmail(email, name, amount, mode) {
  const numAmount = parseInt(amount) || 499;
  const isOffline = (mode && mode.toString().toLowerCase() === 'offline') || numAmount >= 4000;
  const dates = getUpcomingMasterclassDates(isOffline);
  
  if (isOffline) {
    const dateVal = dates.dateText;
    const timeVal = dates.timeText;
    const venueVal = dates.venueText;
    const passType = "In-Person MasterClass Pass (Vestin Park Hotel, Chennai)";
    const waGroupLink = WHATSAPP_CONFIG.WA_GROUP_LINK_CLAUDE_OFFLINE;
    const perksText = "<p style='color:#da7756;font-weight:bold;margin:8px 0;'>🍱 Luxury Hotel Buffet Lunch & High Tea Included ✅</p><p style='color:#6B4FBB;font-weight:bold;margin:8px 0;'>💻 Bring your laptop with internet connectivity ✅</p>";
    const subject = `🎉 Registration Confirmed: In-Person MasterClass Chennai (${dateVal})`;

    const htmlBody = `<!DOCTYPE html><html><body style="margin:0;padding:0;background-color:#0d0d12;font-family:sans-serif;color:#f0f0f5;">
    <div style="max-width:600px;margin:20px auto;background:#16161e;border:1px solid #da7756;border-radius:24px;padding:32px;text-align:center;">
      <h1 style="color:#ffffff;">🏨 Claude MasterClass — In-Person Chennai</h1>
      <p>Welcome, <strong>${name}</strong>!</p>
      <p>Your payment for <strong>${passType}</strong> @ ₹${numAmount} was successful.</p>
      ${perksText}
      <p>📍 <strong>${venueVal}</strong></p>
      <p>📅 <strong>${dateVal}</strong> | 🕒 <strong>${timeVal}</strong></p>
      <a href="${waGroupLink}" style="display:inline-block;background:#da7756;color:#fff;padding:14px 28px;border-radius:50px;text-decoration:none;font-weight:bold;margin-top:16px;">📱 Join In-Person WhatsApp Community</a>
    </div></body></html>`;

    MailApp.sendEmail({ to: email, subject: subject, htmlBody: htmlBody, name: "Tech Tycoon", replyTo: "techtycoondigitalsolutions@gmail.com" });

  } else {
    const dateVal = dates.dateText;
    const timeVal = dates.timeText;
    const venueVal = dates.venueText;
    const isRecordingPass = numAmount === 999 || numAmount >= 1800;
    const passType = isRecordingPass ? "Live + Recording Pass (Recorded Video Access)" : "Standard Live Session Pass";
    const waGroupLink = WHATSAPP_CONFIG.WA_GROUP_LINK_CLAUDE_ONLINE;
    const recText = isRecordingPass ? "<p style='color:#10b981;font-weight:bold;margin:8px 0;'>⭐ Recorded Video Access Included ✅</p>" : "";
    const subject = `🎉 Registration Confirmed: Claude MasterClass Online (${dateVal})`;

    const htmlBody = `<!DOCTYPE html><html><body style="margin:0;padding:0;background-color:#0d0d12;font-family:sans-serif;color:#f0f0f5;">
    <div style="max-width:600px;margin:20px auto;background:#16161e;border:1px solid #da7756;border-radius:24px;padding:32px;text-align:center;">
      <h1 style="color:#ffffff;">🤖 Claude MasterClass — Online Live</h1>
      <p>Welcome, <strong>${name}</strong>!</p>
      <p>Your payment for <strong>${passType}</strong> @ ₹${numAmount} was successful.</p>
      ${recText}
      <p>📍 <strong>${venueVal}</strong></p>
      <p>📅 <strong>${dateVal}</strong> | 🕒 <strong>${timeVal}</strong></p>
      <a href="${waGroupLink}" style="display:inline-block;background:#da7756;color:#fff;padding:14px 28px;border-radius:50px;text-decoration:none;font-weight:bold;margin-top:16px;">📱 Join Online WhatsApp Community</a>
    </div></body></html>`;

    MailApp.sendEmail({ to: email, subject: subject, htmlBody: htmlBody, name: "Tech Tycoon", replyTo: "techtycoondigitalsolutions@gmail.com" });
  }
}

function getRazorpayAccountTag(data) {
  const phoneStr = (data.phone || "").toString();
  const countryCode = (data.countryCode || "").toString();
  const isIntl = data.isInternational === true || 
                 (countryCode && countryCode !== '+91') || 
                 (phoneStr.startsWith('+') && !phoneStr.startsWith('+91'));
  return isIntl ? "RZP: International (rzp_live_gfoS1OjC8tvWjP)" : "RZP: Domestic India (rzp_live_T2CbVONQc6qrqj)";
}

function createRazorpayOrder(data) {
  const isIntl = data.isInternational || (data.countryCode && data.countryCode !== '+91');
  const keyId = isIntl ? RAZORPAY_KEY_ID_INTL : RAZORPAY_KEY_ID;
  const keySecret = isIntl ? RAZORPAY_KEY_SECRET_INTL : RAZORPAY_KEY_SECRET;

  const credentials = Utilities.base64Encode(keyId + ":" + keySecret);
  const amount = parseInt(data.amount) || 499;
  const mode = data.mode || (amount >= 4000 ? "OFFLINE" : "ONLINE");

  const options = {
    method: "post",
    headers: { Authorization: "Basic " + credentials, "Content-Type": "application/json" },
    payload: JSON.stringify({
      amount: amount * 100,
      currency: "INR",
      notes: {
        product: "claude_masterclass",
        mode: mode,
        customer_email: data.email || "",
        customer_name: data.name || "",
        certificate: data.wantCertificate ? "YES" : "NO"
      }
    }),
    muteHttpExceptions: true
  };
  const response = UrlFetchApp.fetch("https://api.razorpay.com/v1/orders", options);
  if (response.getResponseCode() !== 200) throw new Error("Razorpay Order Creation Failed: " + response.getContentText());
  return JSON.parse(response.getContentText()).id;
}

function getModeOfSessionDisplay(mode, amount) {
  const numAmount = parseInt(amount) || 499;
  const isOffline = (mode && mode.toString().toLowerCase() === 'offline') || numAmount >= 4000;
  return isOffline ? "Offline Session (In-Person Chennai)" : "Online Session (Live Online)";
}

function saveToSheet(data, orderId) {
  if (!isClaudeRegistration(data)) return;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME_REG) || ss.getSheets()[0];
  const certTag = (data.wantCertificate || data.certificate === "YES (+₹1,000)") ? "YES (+₹1000)" : "NO";
  const modeTag = (data.mode || (parseInt(data.amount) >= 4000 ? "OFFLINE" : "ONLINE")).toUpperCase();
  const sessionModeDisplay = getModeOfSessionDisplay(data.mode, data.amount);
  const rzpTag = getRazorpayAccountTag(data);

  sheet.appendRow([
    new Date(), data.name, data.email, "'" + data.phone, data.profession || "General",
    sessionModeDisplay, data.amount || 499, "INITIATED", orderId, "", "PENDING",
    "NO", "NO", "NO", "NO", "NO", "NO", "NO", "NO", (data.promoCode || "CLAUDE") + " | MODE: " + modeTag + " | CERT: " + certTag + " | " + rzpTag
  ]);
}

function isPromoCodeValid(code) {
  const promoCodes30 = ["CLD30A", "TYC30B", "AIT30C", "MCP30D", "WEB30E", "COD30F", "PRO30G", "DIS30H", "RUN30I", "TAM30J", "ENG30K", "LIVE30", "VIP30M", "REG30N", "ZOOM30", "FAST30", "BEST30", "SAVE30", "GIFT30", "PLUS30"];
  if (code === "CLAUDE") return true;
  if (promoCodes30.indexOf(code) === -1) return false;
  
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
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

function updatePaymentStatus(data) {
  if (!isClaudeRegistration(data)) return;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME_REG) || ss.getSheets()[0];
  const rows = sheet.getDataRange().getValues();

  let foundIndex = -1;
  const targetOrderId = data.razorpay_order_id;
  const targetEmail = (data.email || "").toLowerCase().trim();
  const targetPhone10 = getLast10Digits(data.phone);

  for (let i = 1; i < rows.length; i++) {
    if (targetOrderId && rows[i][8] === targetOrderId) { foundIndex = i; break; }
  }

  if (foundIndex === -1) {
    for (let i = 1; i < rows.length; i++) {
      const rowEmail = (rows[i][2] || "").toString().toLowerCase().trim();
      const rowPhone10 = getLast10Digits(rows[i][3]);
      if ((targetEmail && rowEmail === targetEmail) || (targetPhone10 && rowPhone10 && rowPhone10 === targetPhone10)) { foundIndex = i; break; }
    }
  }

  const rzpTag = getRazorpayAccountTag(data);

  if (foundIndex !== -1) {
    if (rows[foundIndex][7] === "✅ PAID") return;
    sheet.getRange(foundIndex + 1, 8).setValue("✅ PAID");
    sheet.getRange(foundIndex + 1, 10).setValue(data.razorpay_payment_id || "");
    sheet.getRange(foundIndex + 1, 11).setValue("SENT ✅");
    if (targetOrderId) sheet.getRange(foundIndex + 1, 9).setValue(targetOrderId);
    
    const existingPromoCol = (rows[foundIndex][19] || "").toString();
    if (!existingPromoCol.includes("RZP:")) {
      sheet.getRange(foundIndex + 1, 20).setValue(existingPromoCol + " | " + rzpTag);
    }
    
    const name = rows[foundIndex][1] || data.name;
    const email = data.email || rows[foundIndex][2];
    const amount = rows[foundIndex][6] || data.amount;
    const mode = data.mode || (parseInt(amount) >= 4000 ? "OFFLINE" : "ONLINE");
    const phoneClean = targetPhone10 || (rows[foundIndex][3] ? rows[foundIndex][3].toString().replace(/\D/g, '') : "");

    try {
      sendMasterclassEmail(email, name, amount, mode);
      triggerWhatsAppCampaign(name, email, phoneClean);
    } catch (err) { writeToLogs("EMAIL_ERROR", err.message); }
  } else {
    const mode = data.mode || (parseInt(data.amount) >= 4000 ? "OFFLINE" : "ONLINE");
    const sessionModeDisplay = getModeOfSessionDisplay(mode, data.amount);

    sheet.appendRow([
      new Date(), data.name || "Customer", data.email || "", "'" + (data.phone || ""),
      "General", sessionModeDisplay, data.amount || 499, "✅ PAID", data.razorpay_order_id || "",
      data.razorpay_payment_id || "", "SENT ✅", "NO", "NO", "NO", "NO", "NO", "NO", "NO", "NO",
      (data.promoCode || "CLAUDE") + " | MODE: " + mode.toUpperCase() + (data.wantCertificate ? " | CERT: YES" : "") + " | " + rzpTag
    ]);

    try {
      sendMasterclassEmail(data.email, data.name || "Customer", data.amount || 499, mode);
      triggerWhatsAppCampaign(data.name || "Customer", data.email, targetPhone10);
    } catch (err) { writeToLogs("EMAIL_ERROR", err.message); }
  }
}

function updatePaymentStatusFromWebhook(orderId, paymentId, email, notes, rawAmount) {
  const isClaudePayment = notes && (notes.product === "claude_masterclass" || notes.masterclass === "claude");
  const amount = rawAmount ? rawAmount / 100 : 0;
  
  // 1. Immediately ignore if notes indicate a different product
  if (notes && notes.product && notes.product !== "claude_masterclass") {
    writeToLogs("NON_CLAUDE_WEBHOOK_SKIPPED", `Ignored ${notes.product} payment for ${email} (Order: ${orderId}).`);
    return;
  }

  // 2. Ignore typical ₹99 lead payments from non-Claude pages
  if (amount === 99 && (!notes.product || !notes.product.toLowerCase().includes("claude"))) {
    writeToLogs("NON_CLAUDE_WEBHOOK_SKIPPED", `Ignored ₹${amount} payment for ${email} (Order: ${orderId}) from non-Claude page.`);
    return;
  }

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME_REG) || ss.getSheets()[0];
  const rows = sheet.getDataRange().getValues();

  let foundIndex = -1;
  const targetEmail = (email || "").toLowerCase().trim();

  for (let i = 1; i < rows.length; i++) {
    if (orderId && rows[i][8] === orderId) { foundIndex = i; break; }
  }

  if (foundIndex === -1 && targetEmail) {
    for (let i = 1; i < rows.length; i++) {
      const rowEmail = (rows[i][2] || "").toString().toLowerCase().trim();
      if (rowEmail === targetEmail) { foundIndex = i; break; }
    }
  }

  if (foundIndex !== -1) {
    if (rows[foundIndex][7] === "✅ PAID") return;
    sheet.getRange(foundIndex + 1, 8).setValue("✅ PAID");
    sheet.getRange(foundIndex + 1, 10).setValue(paymentId || "");
    sheet.getRange(foundIndex + 1, 11).setValue("SENT ✅");
    
    const name = rows[foundIndex][1];
    const rowAmount = rows[foundIndex][6];
    const mode = notes?.mode || (parseInt(rowAmount) >= 4000 ? "OFFLINE" : "ONLINE");
    const phoneClean = rows[foundIndex][3] ? rows[foundIndex][3].toString().replace(/\D/g, '') : "";

    try {
      sendMasterclassEmail(email, name, rowAmount, mode);
      triggerWhatsAppCampaign(name, email, phoneClean);
    } catch (err) { writeToLogs("EMAIL_ERROR", err.message); }
  } else {
    // Only append a fallback row if it is explicitly verified as a Claude payment
    if (isClaudePayment) {
      const mode = notes?.mode || (amount >= 4000 ? "OFFLINE" : "ONLINE");
      const sessionModeDisplay = getModeOfSessionDisplay(mode, amount);

      sheet.appendRow([
        new Date(), notes.customer_name || "Customer", email || "", "", "General", sessionModeDisplay, amount, "✅ PAID",
        orderId || "", paymentId || "", "SENT ✅", "NO", "NO", "NO", "NO", "NO", "NO", "NO", "NO", "CLAUDE | MODE: " + mode.toUpperCase()
      ]);

      try {
        sendMasterclassEmail(email, notes.customer_name || "Customer", amount, mode);
      } catch (err) { writeToLogs("EMAIL_ERROR", err.message); }
    } else {
      writeToLogs("OTHER_PAGE_WEBHOOK_SKIPPED", `Ignored payment for ${email} (Order: ${orderId}) as it is not identified as Claude.`);
    }
  }
}

function createCalendarInvite(email, name, amount, mode) {
  try {
    const numAmount = parseInt(amount) || 499;
    const isOffline = (mode && mode.toString().toLowerCase() === 'offline') || numAmount >= 4000;
    const startTime = getUpcomingWebinarTime(isOffline);
    const durationHours = isOffline ? 8.5 : 3;
    const endTime = new Date(startTime.getTime() + durationHours * 60 * 60 * 1000);
    const waGroupLink = isOffline ? WHATSAPP_CONFIG.WA_GROUP_LINK_CLAUDE_OFFLINE : WHATSAPP_CONFIG.WA_GROUP_LINK_CLAUDE_ONLINE;
    const dates = getUpcomingMasterclassDates(isOffline);
    
    const title = isOffline 
      ? "🏨 Confirmed: In-Person Claude MasterClass @ Vestin Park Hotel, Chennai"
      : `🤖 Confirmed: Claude MasterClass (${dates.dateText})`;
    
    const description = isOffline
      ? `Hi ${name},\n\nYour seat is confirmed for the 1-Day In-Person Claude MasterClass Workshop in Chennai.\n\n📍 Venue: Vestin Park Hotel, Egmore, Chennai\n📅 Date: ${dates.dateText}\n🕒 Time: 9:00 AM – 5:30 PM IST\n🍱 Luxury Hotel Buffet Lunch & High Tea Included\n💻 Bring your laptop with internet connectivity\n\nJoin the official Offline Attendees WhatsApp Group below:\n${waGroupLink}`
      : `Hi ${name},\n\nYour seat is confirmed for the 2-Day Claude MasterClass in Tamil.\n\n📅 Date: ${dates.dateText}\n🕒 Time: 6:00 PM – 9:00 PM IST\n📍 Platform: Live Online Virtual Classroom\n\nJoin the official Online Attendees WhatsApp Group below:\n${waGroupLink}`;

    const location = isOffline ? "Vestin Park Hotel, Egmore, Chennai" : "Live Online Virtual Classroom";

    const calendar = CalendarApp.getDefaultCalendar();
    calendar.createEvent(title, startTime, endTime, { description: description, location: location, guests: email, sendInvites: false });
    writeToLogs("CALENDAR_SUCCESS", `Invite added to calendar for ${email}`);
  } catch (err) { writeToLogs("CALENDAR_ERROR", err.message); }
}

function sendWhatsAppText(to, message) {
  try {
    const url = "https://graph.facebook.com/v19.0/" + WHATSAPP_CONFIG.PHONE_NUMBER_ID + "/messages";
    const options = { method: "post", contentType: "application/json", headers: { Authorization: "Bearer " + WHATSAPP_CONFIG.ACCESS_TOKEN }, payload: JSON.stringify({ messaging_product: "whatsapp", to: to, type: "text", text: { body: message } }), muteHttpExceptions: true };
    const res = UrlFetchApp.fetch(url, options);
    writeToLogs("WA_TEXT_SEND", `To: ${to} | Status: ${res.getResponseCode()} | Response: ${res.getContentText()}`);
  } catch(e) {
    writeToLogs("WA_TEXT_ERROR", `To: ${to} | Error: ${e.message}`);
  }
}

function sendWhatsAppImage(to, imageUrl, caption) {
  try {
    const url = "https://graph.facebook.com/v19.0/" + WHATSAPP_CONFIG.PHONE_NUMBER_ID + "/messages";
    const options = { method: "post", contentType: "application/json", headers: { Authorization: "Bearer " + WHATSAPP_CONFIG.ACCESS_TOKEN }, payload: JSON.stringify({ messaging_product: "whatsapp", to: to, type: "image", image: { link: imageUrl, caption: caption } }), muteHttpExceptions: true };
    const res = UrlFetchApp.fetch(url, options);
    writeToLogs("WA_IMAGE_SEND", `To: ${to} | Status: ${res.getResponseCode()} | Response: ${res.getContentText()}`);
  } catch(e) {
    writeToLogs("WA_IMAGE_ERROR", `To: ${to} | Error: ${e.message}`);
  }
}

function triggerWhatsAppCampaign(contactName, contactEmail, contactPhone) {
  var url = "https://login.aifunnels.app/api/automations/6a43848a31b24/execute";
  var payload = { "api_token": "792ca1d7ae51ce36fa29d8636acfd3dd", "contact_name": contactName, "contact_email": contactEmail, "contact_phone": contactPhone, "sf.p_name": contactName };
  var options = { "method": "post", "contentType": "application/json", "payload": JSON.stringify(payload), "muteHttpExceptions": true };
  try { UrlFetchApp.fetch(url, options); } catch(e) {}
}

function writeToLogs(event, data) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let logSheet = ss.getSheetByName(SHEET_NAME_LOGS) || ss.insertSheet(SHEET_NAME_LOGS);
    logSheet.appendRow([new Date(), event, data]);
  } catch (e) {}
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function markWhatsappClicked(orderId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME_REG) || ss.getSheets()[0];
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][8] === orderId) { sheet.getRange(i + 1, 12).setValue("CHATTED ✅"); break; }
  }
}
