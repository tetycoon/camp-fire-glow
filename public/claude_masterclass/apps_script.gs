/**
 * ============================================================================
 * CLAUDE MASTERCLASS 2026 — COMPLETE GOOGLE APPS SCRIPT AUTOMATION SYSTEM
 * Technical logs go to "Logs" | Registrations go to "Sheet1"
 * 
 * Google Sheet URL: https://docs.google.com/spreadsheets/d/1JA3FZf8xkpZ8GjuYiETXz9R0ivfW80-rf3PZIzQum9g/edit?gid=0#gid=0
 * ============================================================================
 */

const RAZORPAY_KEY_ID = "rzp_live_T2CbVONQc6qrqj";
const RAZORPAY_KEY_SECRET = "0ZmzKfvHlwbnvkTCPxkWC1a6";
const SPREADSHEET_ID = "1JA3FZf8xkpZ8GjuYiETXz9R0ivfW80-rf3PZIzQum9g";
const SHEET_NAME_REG = "Sheet1";
const SHEET_NAME_LOGS = "Logs"; 
const VERIFY_TOKEN = "claude_masterclass_auto_2026"; 

const WHATSAPP_CONFIG = {
  ACCESS_TOKEN: "EAAU3qgM444cBRSPzgBf8ZADgHdtVimYAdkzvo3fD0p8ldhlnPOMpr7U8t3RQ9H6rvcvmZCs3EZAnKtHv1dHOB1a4hSyWLjGluThXneEyCKGuvgUBnAV2WTSFZCLL4YFZAvoc5h8axCbIVCLZAZB7YHyGgb2aTLudh04SV5XUIZCbUevZBQukQuCZBaeFdFPZBhv0R1iLQZDZD",
  PHONE_NUMBER_ID: "1089787377552637",
  PHONE_NUMBER: "917010340494", 
  WA_GROUP_LINK: "https://chat.whatsapp.com/ILDnUfU4dqRB4HvjMADgjL",
  POSTER_URL: "https://aitycoon.in/images/logo.png" 
};

const TRIGGER_MESSAGE = "HI I am completed registration of Claude MasterClass";

/**
 * Computes the upcoming Claude MasterClass webinar start time.
 * Target: Saturday, July 25th, 2026 at 5:00 PM (17:00 IST)
 */
function getUpcomingWebinarTime() {
  return new Date(2026, 6, 25, 17, 0, 0); // Month 6 = July (0-indexed)
}

// ------------------------------------------------------------
// 0. SETUP: RUN THIS ONCE TO AUTO-FORMAT SPREADSHEET HEADERS
// ------------------------------------------------------------
function setupSheetHeaders() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME_REG) || ss.getSheets()[0];
  
  const headers = [
    "Date & Time",
    "Name",
    "Email",
    "Phone",
    "Profession",
    "Preferred Language",
    "Amount",
    "Status",
    "Order ID",
    "Payment ID",
    "Email Status",
    "Whatsapp Clicked",
    "WhatsApp Sent (Welcome)",
    "1-Day Reminder Sent",
    "60-Min Reminder Sent",
    "30-Min Reminder Sent",
    "10-Min Reminder Sent",
    "5-Min Reminder Sent",
    "Session started(Join soon)"
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight("bold");
  headerRange.setBackground("#da7756");
  headerRange.setFontColor("#ffffff");
  headerRange.setHorizontalAlignment("center");
  sheet.setFrozenRows(1);
  
  let logSheet = ss.getSheetByName(SHEET_NAME_LOGS);
  if (!logSheet) {
    logSheet = ss.insertSheet(SHEET_NAME_LOGS);
    logSheet.appendRow(["Timestamp", "Event Type", "Log Content"]);
    logSheet.getRange(1, 1, 1, 3).setFontWeight("bold").setBackground("#1e293b").setFontColor("#ffffff");
  }
  
  Logger.log("19-Column Headers successfully created and styled in Sheet1!");
}

// ------------------------------------------------------------
// 1. WEBHOOK: GET (WhatsApp Verification & Redirect)
// ------------------------------------------------------------
function doGet(e) {
  if (e.parameter['hub.mode'] === 'subscribe' && e.parameter['hub.verify_token'] === VERIFY_TOKEN) {
    return ContentService.createTextOutput(e.parameter['hub.challenge']);
  }
  
  if (e.parameter.action === 'whatsapp') {
    markWhatsappClicked(e.parameter.orderId);
    const waChatLink = `https://wa.me/${WHATSAPP_CONFIG.PHONE_NUMBER}?text=${encodeURIComponent(TRIGGER_MESSAGE)}`;
    const html = `<html><body style="font-family:sans-serif;text-align:center;padding-top:50px;background:#0d0d12;color:white;">
      <h2>Redirecting to WhatsApp...</h2>
      <script>window.top.location.href="${waChatLink}";</script>
    </body></html>`;
    return HtmlService.createHtmlOutput(html).setTitle("Redirecting...");
  }
  return ContentService.createTextOutput("Claude MasterClass Automation Webhook is running.");
}

// ------------------------------------------------------------
// 2. WEBHOOK: POST (Leads, Payments, & Incoming Messages)
// ------------------------------------------------------------
function doPost(e) {
  const rawData = e.postData.contents;
  writeToLogs("RAW_WEBHOOK", rawData.substring(0, 500));

  try {
    const body = JSON.parse(rawData);

    // 🌟 1. Handle Razorpay Server Webhook (Direct server-to-server backup)
    if (body.event === "payment.captured" || body.event === "order.paid") {
      const paymentEntity = body.payload.payment.entity;
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;
      const email = paymentEntity.email;
      
      updatePaymentStatusFromWebhook(orderId, paymentId, email);
      return createJsonResponse({ success: true, source: "razorpay_webhook" });
    }

    // 🌟 2. Handle Browser Payment Success (Client fallback)
    if (body.paymentSuccess === true) {
      updatePaymentStatus(body);
      return createJsonResponse({ success: true, source: "client_browser" });
    }

    // 🌟 3. Handle New Lead / Order Generation
    if (body.name && body.email && body.phone && !body.object) {
      const orderId = createRazorpayOrder(body);
      saveToSheet(body, orderId);
      return createJsonResponse({ success: true, orderId: orderId });
    }

    // 🌟 4. Handle WhatsApp Webhook
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
// 3. WHATSAPP & EMAIL CONFIRMATION LOGIC
// ------------------------------------------------------------
function handleWhatsAppIncoming(body) {
  const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!message || !message.text?.body) return;

  const rawText = message.text.body;
  const textReceived = rawText.toLowerCase().trim();
  const phone = message.from;

  // CLAUDE MASTERCLASS LOGIC
  if (textReceived.includes("claude") || textReceived.includes("masterclass")) {
    sendWhatsAppImage(phone, WHATSAPP_CONFIG.POSTER_URL, "Claude MasterClass 2026");
    
    let welcomeMsg = "Welcome! 🎉 Your registration is confirmed for the Claude MasterClass in Tamil.\n\n";
    welcomeMsg += `📅 Date: July 25th & 26th, 2026 (Sat & Sun)\n🕒 Time: 5:00 PM – 8:30 PM IST\n📍 Platform: Zoom Live\n\n`;
    welcomeMsg += "Please join our exclusive WhatsApp Community below to receive the webinar session link:\n" + WHATSAPP_CONFIG.WA_GROUP_LINK;
    
    sendWhatsAppText(phone, welcomeMsg);
  }
}

function sendMasterclassEmail(email, name, amount) {
  const dateVal = "July 25th & 26th, 2026 (Saturday & Sunday)";
  const timeVal = "5:00 PM – 8:30 PM IST";
  const passType = parseInt(amount) === 999 
    ? "VIP All-Access Pass (Live + Lifetime Video Recordings + Source Code & Templates)" 
    : "Standard Live Session Pass";
  
  const subject = `🎉 Registration Confirmed: Claude MasterClass (July 25 & 26)`;
  
  const htmlBody = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0d0d12;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#f0f0f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0d0d12;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" style="max-width:600px;width:100%;background-color:#16161e;border:1px solid #da7756;border-radius:24px;overflow:hidden;box-shadow:0 10px 30px rgba(218,119,86,0.2);">
          <tr>
            <td style="background:linear-gradient(135deg,#e28568,#da7756);padding:40px 32px;text-align:center;">
              <div style="font-size:48px;margin-bottom:16px;">🤖</div>
              <h1 style="font-size:28px;font-weight:800;color:#ffffff;margin:0;letter-spacing:-0.025em;line-height:1.2;">Claude MasterClass</h1>
              <p style="color:rgba(255,255,255,0.9);font-size:13px;letter-spacing:0.2em;margin:8px 0 0;text-transform:uppercase;font-weight:700;">Live 2-Day Workshop in Tamil</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 36px;">
              <h2 style="color:#ffffff;font-size:22px;margin:0 0 12px;font-weight:800;">Welcome, ${name}!</h2>
              <p style="color:#a0a0b2;font-size:15px;line-height:1.6;margin:0 0 24px;">
                Your payment for <strong>${passType}</strong> @ ₹${amount || 299} was successful and your seat is officially reserved! Get ready to master Claude AI, MCPs, Claude Code, and Web App Automation.
              </p>
              <table width="100%" style="background-color:#0b0b0f;border:1px solid rgba(255,255,255,0.1);border-radius:16px;margin-bottom:32px;">
                <tr>
                  <td style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.1);font-size:14px;color:#a0a0b2;">📅 Date</td>
                  <td style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.1);font-size:14px;color:#ffffff;font-weight:700;">${dateVal}</td>
                </tr>
                <tr>
                  <td style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.1);font-size:14px;color:#a0a0b2;">🕒 Time</td>
                  <td style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.1);font-size:14px;color:#ffffff;font-weight:700;">${timeVal}</td>
                </tr>
                <tr>
                  <td style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.1);font-size:14px;color:#a0a0b2;">🌐 Language</td>
                  <td style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.1);font-size:14px;color:#da7756;font-weight:700;">100% Tamil (தமிழ்)</td>
                </tr>
                <tr>
                  <td style="padding:16px 20px;font-size:14px;color:#a0a0b2;">📍 Platform</td>
                  <td style="padding:16px 20px;font-size:14px;color:#da7756;font-weight:700;">Zoom Live (Link sent in WhatsApp Group)</td>
                </tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:32px;">
                    <a href="${WHATSAPP_CONFIG.WA_GROUP_LINK}" target="_blank" style="display:inline-block;background-color:#da7756;color:#ffffff;text-decoration:none;padding:16px 36px;border-radius:100px;font-size:16px;font-weight:700;box-shadow:0 4px 15px rgba(218,119,86,0.4);">
                      📱 Join Official WhatsApp Community
                    </a>
                  </td>
                </tr>
              </table>
              <div style="background-color:rgba(218,119,86,0.1);border:1px solid rgba(218,119,86,0.3);border-radius:12px;padding:20px;margin-bottom:24px;">
                <h4 style="color:#e58a6c;font-size:14px;margin:0 0 8px;font-weight:700;">⚡ Session Instructions:</h4>
                <p style="color:#f0f0f5;font-size:13px;margin:0 0 6px;line-height:1.5;">1. Join the WhatsApp community above to receive Zoom credentials.</p>
                <p style="color:#f0f0f5;font-size:13px;margin:0 0 6px;line-height:1.5;">2. Log in 10 minutes before 5:00 PM IST on July 25th.</p>
                <p style="color:#f0f0f5;font-size:13px;margin:0;line-height:1.5;">3. A free Claude account is sufficient for all live hands-on exercises.</p>
              </div>
              <p style="color:#6c6c80;font-size:12px;text-align:center;margin:32px 0 0;line-height:1.5;">
                Questions? Contact support at<br>
                <a href="mailto:techtycoondigitalsolutions@gmail.com" style="color:#da7756;text-decoration:none;font-weight:600;">techtycoondigitalsolutions@gmail.com</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#0b0b0f;border-top:1px solid rgba(255,255,255,0.1);padding:24px;text-align:center;">
              <p style="color:#6c6c80;font-size:11px;margin:0;">© 2026 AI Tycoon / Tech Tycoon Digital Solutions. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  MailApp.sendEmail({
    to: email,
    subject: subject,
    htmlBody: htmlBody,
    name: "Claude MasterClass Team",
    replyTo: "techtycoondigitalsolutions@gmail.com"
  });
}

// ------------------------------------------------------------
// 4. RAZORPAY & SPREADSHEET SYNC
// ------------------------------------------------------------
function createRazorpayOrder(data) {
  const credentials = Utilities.base64Encode(RAZORPAY_KEY_ID + ":" + RAZORPAY_KEY_SECRET);
  const amount = parseInt(data.amount) || 299;

  const options = {
    method: "post",
    headers: { Authorization: "Basic " + credentials, "Content-Type": "application/json" },
    payload: JSON.stringify({ amount: amount * 100, currency: "INR" }),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch("https://api.razorpay.com/v1/orders", options);
  const resText = response.getContentText();
  if (response.getResponseCode() !== 200) throw new Error("Razorpay Order Failed: " + resText);
  return JSON.parse(resText).id;
}

// 🌟 Appends new lead to the 19 columns
function saveToSheet(data, orderId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME_REG) || ss.getSheets()[0];
  
  sheet.appendRow([
    new Date(),                       // Col 1: Date & Time
    data.name,                        // Col 2: Name
    data.email,                       // Col 3: Email
    "'" + data.phone,                 // Col 4: Phone
    data.profession || "General",     // Col 5: Profession
    data.language || "Tamil",         // Col 6: Preferred Language
    data.amount || 299,               // Col 7: Amount
    "INITIATED",                      // Col 8: Status
    orderId,                          // Col 9: Order ID
    "",                               // Col 10: Payment ID
    "PENDING",                        // Col 11: Email Status
    "NO",                             // Col 12: Whatsapp Clicked
    "NO",                             // Col 13: WhatsApp Sent (Welcome)
    "NO",                             // Col 14: 1-Day Reminder Sent
    "NO",                             // Col 15: 60-Min Reminder Sent
    "NO",                             // Col 16: 30-Min Reminder Sent
    "NO",                             // Col 17: 10-Min Reminder Sent
    "NO",                             // Col 18: 5-Min Reminder Sent
    "NO"                              // Col 19: Session started(Join soon)
  ]);
}

// Handler for browser-side payment update
function updatePaymentStatus(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME_REG) || ss.getSheets()[0];
  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][8] === data.razorpay_order_id) { // Col 9 Order ID
      if (rows[i][7] === "✅ PAID") return; // Already updated
      
      sheet.getRange(i + 1, 8).setValue("✅ PAID");
      sheet.getRange(i + 1, 10).setValue(data.razorpay_payment_id);
      sheet.getRange(i + 1, 11).setValue("SENT ✅");
      
      const name = rows[i][1];
      const email = data.email || rows[i][2];
      const amount = rows[i][6];
      const phoneClean = rows[i][3] ? rows[i][3].toString().replace(/\D/g, '') : "";

      try {
        sendMasterclassEmail(email, name, amount);
        triggerWhatsAppCampaign(name, email, phoneClean);
        createCalendarInvite(email, name);
      } catch (err) {
        writeToLogs("EMAIL_OR_WA_ERROR", `Failed for ${email}: ${err.message}`);
      }
      break;
    }
  }
}

// Handler for Razorpay direct Server Webhook
function updatePaymentStatusFromWebhook(orderId, paymentId, email) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME_REG) || ss.getSheets()[0];
  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][8] === orderId) { // Col 9 Order ID
      if (rows[i][7] === "✅ PAID") return; // Already updated
      
      sheet.getRange(i + 1, 8).setValue("✅ PAID");
      sheet.getRange(i + 1, 10).setValue(paymentId);
      sheet.getRange(i + 1, 11).setValue("SENT ✅");
      
      const name = rows[i][1];
      const amount = rows[i][6];
      const phoneClean = rows[i][3] ? rows[i][3].toString().replace(/\D/g, '') : "";

      try {
        sendMasterclassEmail(email, name, amount);
        triggerWhatsAppCampaign(name, email, phoneClean);
        createCalendarInvite(email, name);
      } catch (err) {
        writeToLogs("EMAIL_OR_WA_ERROR", `Failed for ${email}: ${err.message}`);
      }
      break;
    }
  }
}

// ------------------------------------------------------------
// 5. HELPER AUTOMATIONS (WhatsApp, Calendar & Reminders)
// ------------------------------------------------------------
function sendWhatsAppText(to, message) {
  const url = "https://graph.facebook.com/v19.0/" + WHATSAPP_CONFIG.PHONE_NUMBER_ID + "/messages";
  const options = {
    method: "post",
    contentType: "application/json",
    headers: { Authorization: "Bearer " + WHATSAPP_CONFIG.ACCESS_TOKEN },
    payload: JSON.stringify({ messaging_product: "whatsapp", to: to, type: "text", text: { body: message } }),
    muteHttpExceptions: true
  };
  UrlFetchApp.fetch(url, options);
}

function sendWhatsAppTemplate(to, templateName, parameters) {
  const url = "https://graph.facebook.com/v19.0/" + WHATSAPP_CONFIG.PHONE_NUMBER_ID + "/messages";
  const options = {
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
            parameters: parameters.map(param => ({ type: "text", text: param }))
          }
        ]
      }
    }),
    muteHttpExceptions: true
  };
  const response = UrlFetchApp.fetch(url, options);
  writeToLogs("WA_TEMPLATE_SEND", `To: ${to} | Template: ${templateName} | Response: ${response.getContentText()}`);
}

function sendWhatsAppImage(to, imageUrl, caption) {
  const url = "https://graph.facebook.com/v19.0/" + WHATSAPP_CONFIG.PHONE_NUMBER_ID + "/messages";
  const options = {
    method: "post",
    contentType: "application/json",
    headers: { Authorization: "Bearer " + WHATSAPP_CONFIG.ACCESS_TOKEN },
    payload: JSON.stringify({
      messaging_product: "whatsapp", to: to, type: "image", image: { link: imageUrl, caption: caption }
    }),
    muteHttpExceptions: true
  };
  UrlFetchApp.fetch(url, options);
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
    if (data[i][8] === orderId) { // Col 9 Order ID
      sheet.getRange(i + 1, 12).setValue("CHATTED ✅"); // Col 12 Whatsapp Clicked
      break;
    }
  }
}

function triggerWhatsAppCampaign(contactName, contactEmail, contactPhone) {
  var url = "https://login.aifunnels.app/api/automations/6a43848a31b24/execute";
  var payload = {
    "api_token": "792ca1d7ae51ce36fa29d8636acfd3dd",
    "contact_name": contactName,
    "contact_email": contactEmail,
    "contact_phone": contactPhone,
    "sf.p_name": contactName
  };
  var options = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify(payload),
    "muteHttpExceptions": true 
  };
  try {
    var response = UrlFetchApp.fetch(url, options);
    writeToLogs("AIFUNNELS_SUCCESS", `Triggered for ${contactName}: ${response.getContentText()}`);
  } catch(e) {
    writeToLogs("AIFUNNELS_ERROR", `Failed for ${contactName}: ${e.message}`);
  }
}

function createCalendarInvite(email, name) {
  try {
    const startTime = getUpcomingWebinarTime(); // July 25, 2026 5:00 PM IST
    const endTime = new Date(startTime.getTime() + 3.5 * 60 * 60 * 1000); // 3.5 hrs

    const title = "🤖 Confirmed: Claude MasterClass (July 25 & 26)";
    const description = `Hi ${name},\n\nYour seat is confirmed for the 2-Day Claude MasterClass in Tamil.\n\n` +
      `📅 Date: July 25th & 26th, 2026 (Saturday & Sunday)\n` +
      `🕒 Time: 5:00 PM – 8:30 PM IST\n` +
      `📍 Platform: Zoom Live\n\n` +
      `Join official WhatsApp community:\n${WHATSAPP_CONFIG.WA_GROUP_LINK}\n\n` +
      `AI Tycoon Team`;

    const calendar = CalendarApp.getDefaultCalendar();
    calendar.createEvent(title, startTime, endTime, {
      description: description,
      location: "Zoom Live Session",
      guests: email,
      sendInvites: true
    });
    writeToLogs("CALENDAR_SUCCESS", `Calendar invite sent to ${email}`);
  } catch (err) {
    writeToLogs("CALENDAR_ERROR", `Failed calendar invite for ${email}: ${err.message}`);
  }
}

/**
 * Automated Cron Trigger function to deliver Reminders matching 19-Column layout:
 * Col 14: 1-Day Reminder Sent (Index 13)
 * Col 15: 60-Min Reminder Sent (Index 14)
 * Col 16: 30-Min Reminder Sent (Index 15)
 * Col 17: 10-Min Reminder Sent (Index 16)
 * Col 18: 5-Min Reminder Sent (Index 17)
 * Col 19: Session started(Join soon) (Index 18)
 */
function checkAndSendReminders() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME_REG) || ss.getSheets()[0];
  const data = sheet.getDataRange().getValues();
  const now = new Date();
  const webinarTime = getUpcomingWebinarTime();
  const minsLeft = (webinarTime.getTime() - now.getTime()) / (1000 * 60);

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[7] !== "✅ PAID") continue; // Check status Col 8
    
    const phone = row[3] ? row[3].toString().replace(/\D/g, '') : ""; 
    if (!phone) continue;
    const name = row[1];

    try {
      // 1. 24-Hour (1-Day) Reminder
      if (minsLeft <= 1440 && minsLeft > 120 && row[13] === "NO") {
        sendWhatsAppTemplate(phone, "claude_1day_reminder", [name]);
        sheet.getRange(i + 1, 14).setValue("SENT ✅");
      }
      // 2. 60-Min Reminder
      else if (minsLeft <= 60 && minsLeft > 30 && row[14] === "NO") {
        sendWhatsAppTemplate(phone, "claude_60min_reminder", [name]);
        sheet.getRange(i + 1, 15).setValue("SENT ✅");
      }
      // 3. 30-Min Reminder
      else if (minsLeft <= 30 && minsLeft > 10 && row[15] === "NO") {
        sendWhatsAppTemplate(phone, "claude_30min_reminder", [name]);
        sheet.getRange(i + 1, 16).setValue("SENT ✅");
      }
      // 4. 10-Min Reminder
      else if (minsLeft <= 10 && minsLeft > 5 && row[16] === "NO") {
        sendWhatsAppTemplate(phone, "claude_10min_reminder", [name, WHATSAPP_CONFIG.WA_GROUP_LINK]);
        sheet.getRange(i + 1, 17).setValue("SENT ✅");
      }
      // 5. 5-Min Reminder
      else if (minsLeft <= 5 && minsLeft > 0 && row[17] === "NO") {
        sendWhatsAppTemplate(phone, "claude_5min_reminder", [name, WHATSAPP_CONFIG.WA_GROUP_LINK]);
        sheet.getRange(i + 1, 18).setValue("SENT ✅");
      }
      // 6. Session Started
      else if (minsLeft <= 0 && minsLeft > -60 && row[18] === "NO") {
        sendWhatsAppTemplate(phone, "claude_started_reminder", [name, WHATSAPP_CONFIG.WA_GROUP_LINK]);
        sheet.getRange(i + 1, 19).setValue("SENT ✅");
      }
    } catch (e) {
      writeToLogs("REMINDER_ERROR", `Row ${i + 1}: ${e.message}`);
    }
  }
}
