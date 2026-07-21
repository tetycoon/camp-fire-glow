/**
 * AI MASTERCLASS 2026 — ULTIMATE AUTOMATION SYSTEM
 * Technical logs go to "Logs" | Registrations go to "Sheet1"
 */

const RAZORPAY_KEY_ID = "rzp_live_gfoS1OjC8tvWjP";
const RAZORPAY_KEY_SECRET = "B0q7JAz8YhMat2QkTa3YCUGd";
const SHEET_NAME_REG = "Sheet1";
const SHEET_NAME_LOGS = "Logs"; 
const VERIFY_TOKEN = "ai_tycoon_auto_662"; 

const WHATSAPP_CONFIG = {
  ACCESS_TOKEN: "EAAU3qgM444cBRSPzgBf8ZADgHdtVimYAdkzvo3fD0p8ldhlnPOMpr7U8t3RQ9H6rvcvmZCs3EZAnKtHv1dHOB1a4hSyWLjGluThXneEyCKGuvgUBnAV2WTSFZCLL4YFZAvoc5h8axCbIVCLZAZB7YHyGgb2aTLudh04SV5XUIZCbUevZBQukQuCZBaeFdFPZBhv0R1iLQZDZD",
  PHONE_NUMBER_ID: "1089787377552637",
  PHONE_NUMBER: "917010340494", 
  WA_GROUP_LINK: "https://chat.whatsapp.com/ILDnUfU4dqRB4HvjMADgjL",
  
  // ⚠️ CRITICAL: ALWAYS UPDATE THIS TO YOUR UPCOMING WEBINAR DATE/TIME
  WEBINAR_TIME: "2026-06-27T18:00:00+05:30", 
  
  POSTER_URL: "https://aitycoon.in/images/AI_Secrets_Revealed_Banner.jpg" 
};

const TRIGGER_MESSAGE = "HI I am completed registration of AI Secret Reveals";

// ------------------------------------------------------------
// 1. WEBHOOK: GET (WhatsApp Verification)
// ------------------------------------------------------------
function doGet(e) {
  if (e.parameter['hub.mode'] === 'subscribe' && e.parameter['hub.verify_token'] === VERIFY_TOKEN) {
    return ContentService.createTextOutput(e.parameter['hub.challenge']);
  }
  
  if (e.parameter.action === 'whatsapp') {
    markWhatsappClicked(e.parameter.orderId);
    const waChatLink = `https://wa.me/${WHATSAPP_CONFIG.PHONE_NUMBER}?text=${encodeURIComponent(TRIGGER_MESSAGE)}`;
    const html = `<html><body style="font-family:sans-serif;text-align:center;padding-top:50px;background:#030712;color:white;">
      <h2>Redirecting to WhatsApp...</h2>
      <script>window.top.location.href="${waChatLink}";</script>
    </body></html>`;
    return HtmlService.createHtmlOutput(html).setTitle("Redirecting...");
  }
  return ContentService.createTextOutput("OK");
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

    // 2. Handle Browser Payment Success (Client fallback)
    if (body.paymentSuccess === true) {
      updatePaymentStatus(body);
      return createJsonResponse({ success: true, source: "client_browser" });
    }

    // 3. Handle New Order (Initial Lead)
    if (body.name && body.email && body.phone && !body.object) {
      const orderId = createRazorpayOrder(body);
      saveToSheet(body, orderId);
      return createJsonResponse({ success: true, orderId: orderId });
    }

    // 4. Handle WhatsApp Webhook
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
// 3. WHATSAPP & EMAIL LOGIC
// ------------------------------------------------------------
function handleWhatsAppIncoming(body) {
  const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!message || !message.text?.body) return;

  const rawText = message.text.body;
  const textReceived = rawText.toLowerCase().trim();
  const phone = message.from;

  if (textReceived.includes("secret") && (textReceived.includes("reveal") || textReceived.includes("registration"))) {
    let sessionDate = "";
    let sessionTime = "";
    const match = rawText.match(/on\s+(.+?)\s+at\s+(.+)$/i);
    if (match) {
      sessionDate = match[1].trim();
      sessionTime = match[2].trim();
    }

    sendWhatsAppImage(phone, WHATSAPP_CONFIG.POSTER_URL, "AI Secrets Revealed Masterclass");
    
    let welcomeMsg = "Welcome! 🎉 Your registration is confirmed for the AI Masterclass.\n\n";
    if (sessionDate && sessionTime) {
      welcomeMsg += `📅 Date: ${sessionDate}\n🕒 Time: ${sessionTime}\n\n`;
    }
    welcomeMsg += "Please join our exclusive WhatsApp Community below to receive the Zoom session link:\n" + WHATSAPP_CONFIG.WA_GROUP_LINK;
    
    sendWhatsAppText(phone, welcomeMsg);
  } 
}

function sendMasterclassEmail(email, name, sessionDate, sessionTime) {
  const dateVal = sessionDate || "Upcoming Saturday";
  const timeVal = sessionTime || "6:00 PM IST";
  
  const subject = `🎉 Registration Confirmed: AI Secrets Revealed Masterclass — ${dateVal}`;
  
  const htmlBody = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" style="max-width:600px;width:100%;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:24px;overflow:hidden;box-shadow:0 10px 15px -3px rgba(0,0,0,0.05);">
          <tr>
            <td style="background:linear-gradient(135deg,#3b82f6,#2563eb);padding:40px 32px;text-align:center;">
              <div style="font-size:48px;margin-bottom:16px;">🚀</div>
              <h1 style="font-size:28px;font-weight:800;color:#ffffff;margin:0;letter-spacing:-0.025em;line-height:1.2;">AI Secrets Revealed</h1>
              <p style="color:rgba(255,255,255,0.9);font-size:13px;letter-spacing:0.2em;margin:8px 0 0;text-transform:uppercase;font-weight:700;">Live Masterclass 2026</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 36px;">
              <h2 style="color:#0f172a;font-size:22px;margin:0 0 12px;font-weight:800;">Welcome, ${name}!</h2>
              <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 24px;">
                Your payment was successful and your seat is officially confirmed. Get ready to learn how to build a powerful digital brand, attract quality leads, and automate your marketing using the latest AI tools!
              </p>
              <table width="100%" style="background-color:#f1f5f9;border:1px solid #e2e8f0;border-radius:16px;margin-bottom:32px;">
                <tr>
                  <td style="padding:16px 20px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#64748b;">📅 Date</td>
                  <td style="padding:16px 20px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#0f172a;font-weight:700;">${dateVal}</td>
                </tr>
                <tr>
                  <td style="padding:16px 20px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#64748b;">🕒 Time</td>
                  <td style="padding:16px 20px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#0f172a;font-weight:700;">${timeVal}</td>
                </tr>
                <tr>
                  <td style="padding:16px 20px;font-size:14px;color:#64748b;">📍 Platform</td>
                  <td style="padding:16px 20px;font-size:14px;color:#3b82f6;font-weight:700;">Zoom (Link will be shared in WhatsApp group)</td>
                </tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:32px;">
                    <a href="${WHATSAPP_CONFIG.WA_GROUP_LINK}" target="_blank" style="display:inline-block;background-color:#22c55e;color:#ffffff;text-decoration:none;padding:16px 36px;border-radius:100px;font-size:16px;font-weight:700;box-shadow:0 4px 6px -1px rgba(34,197,94,0.3);">
                      📱 Join Official WhatsApp Group
                    </a>
                  </td>
                </tr>
              </table>
              <div style="background-color:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:20px;margin-bottom:24px;">
                <h4 style="color:#1e3a8a;font-size:14px;margin:0 0 8px;font-weight:700;">⚡ Important Instructions:</h4>
                <p style="color:#1e40af;font-size:13px;margin:0 0 6px;line-height:1.5;">1. Make sure to join the WhatsApp group using the button above to receive the Zoom session link.</p>
                <p style="color:#1e40af;font-size:13px;margin:0 0 6px;line-height:1.5;">2. Log in 10 minutes prior to the scheduled session time.</p>
                <p style="color:#1e40af;font-size:13px;margin:0;line-height:1.5;">3. Keep a notebook and pen ready to take notes of critical AI tools and workflows.</p>
              </div>
              <p style="color:#94a3b8;font-size:12px;text-align:center;margin:32px 0 0;line-height:1.5;">
                Have questions? Feel free to contact our support team at<br>
                <a href="mailto:techtycoondigitalsolutions@gmail.com" style="color:#3b82f6;text-decoration:none;font-weight:600;">techtycoondigitalsolutions@gmail.com</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f8fafc;border-top:1px solid #e2e8f0;padding:24px;text-align:center;">
              <p style="color:#94a3b8;font-size:11px;margin:0;">© 2026 AI Tycoon – Tech Tycoon Digital Solutions. All rights reserved.</p>
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
    name: "AI Secrets Revealed Masterclass",
    replyTo: "techtycoondigitalsolutions@gmail.com"
  });
}

// ------------------------------------------------------------
// 4. RAZORPAY & SHEET SYNC
// ------------------------------------------------------------
function createRazorpayOrder(data) {
  const credentials = Utilities.base64Encode(RAZORPAY_KEY_ID + ":" + RAZORPAY_KEY_SECRET);
  
  // Test mode override for Rs. 1
  let amount = data.amount || 99;
  if (data.email === "ambroseselva001@gmail.com") {
    amount = 1;
  }
  
  const options = {
    method: "post",
    headers: { Authorization: "Basic " + credentials, "Content-Type": "application/json" },
    payload: JSON.stringify({ amount: amount * 100, currency: "INR" }),
    muteHttpExceptions: true
  };
  const response = UrlFetchApp.fetch("https://api.razorpay.com/v1/orders", options);
  const resText = response.getContentText();
  if (response.getResponseCode() !== 200) throw new Error("Razorpay Failed: " + resText);
  return JSON.parse(resText).id;
}

function saveToSheet(data, orderId) {
  const ss = SpreadsheetApp.openById("1A-TrzJZsDpXM0sRgUGF-9GIC6fUEtlkQbFs6OKn1hUA");
  let sheet = ss.getSheetByName(SHEET_NAME_REG) || ss.getSheets()[0];
  sheet.appendRow([
    new Date(), data.name, data.email, "'" + data.phone, data.userType || "Professional", 
    data.language, data.amount, "INITIATED", orderId, "", "WAITING", "NO", "NO", "NO", "NO",
    data.pageUrl || "", data.batch || "",
    data.sessionDate || "", data.sessionTime || "" 
  ]);
}

// Handler for browser-side payment update
function updatePaymentStatus(data) {
  const ss = SpreadsheetApp.openById("1A-TrzJZsDpXM0sRgUGF-9GIC6fUEtlkQbFs6OKn1hUA");
  const sheet = ss.getSheetByName(SHEET_NAME_REG) || ss.getSheets()[0];
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][8] === data.razorpay_order_id) {
      if (rows[i][7] === "✅ PAID") return; // Already updated
      
      sheet.getRange(i + 1, 8).setValue("✅ PAID");
      sheet.getRange(i + 1, 10).setValue(data.razorpay_payment_id);
      sheet.getRange(i + 1, 11).setValue("SENT ✅");
      
      const sessionDate = data.sessionDate || rows[i][17] || "";
      const sessionTime = data.sessionTime || rows[i][18] || "";
      
      // Extract phone safely from the sheet
      const phoneClean = rows[i][3] ? rows[i][3].toString().replace(/\D/g, '') : "";
      
      try {
        sendMasterclassEmail(data.email, data.name, sessionDate, sessionTime);
        
        // 🌟 TRIGGER AI FUNNELS CAMPAIGN
        triggerWhatsAppCampaign(data.name, data.email, phoneClean);
      } catch (err) {
        writeToLogs("EMAIL_OR_WA_ERROR", `Failed email/wa to ${data.email}: ${err.message}`);
      }
      break;
    }
  }
}

// 🌟 Handler for Razorpay direct Server Webhook
function updatePaymentStatusFromWebhook(orderId, paymentId, email) {
  const ss = SpreadsheetApp.openById("1A-TrzJZsDpXM0sRgUGF-9GIC6fUEtlkQbFs6OKn1hUA");
  const sheet = ss.getSheetByName(SHEET_NAME_REG) || ss.getSheets()[0];
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][8] === orderId) {
      if (rows[i][7] === "✅ PAID") return; // Already updated, skip sending double email
      
      sheet.getRange(i + 1, 8).setValue("✅ PAID");
      sheet.getRange(i + 1, 10).setValue(paymentId);
      sheet.getRange(i + 1, 11).setValue("SENT ✅");
      
      const name = rows[i][1];
      const sessionDate = rows[i][17] || "";
      const sessionTime = rows[i][18] || "";
      
      // Extract phone safely from the sheet
      const phoneClean = rows[i][3] ? rows[i][3].toString().replace(/\D/g, '') : "";
      
      try {
        sendMasterclassEmail(email, name, sessionDate, sessionTime);
        
        // 🌟 TRIGGER AI FUNNELS CAMPAIGN
        triggerWhatsAppCampaign(name, email, phoneClean);
      } catch (err) {
        writeToLogs("EMAIL_OR_WA_ERROR", `Failed email/wa to ${email}: ${err.message}`);
      }
      break;
    }
  }
}

// ------------------------------------------------------------
// 5. HELPER FUNCTIONS
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

/**
 * Sends a pre-approved template message to bypass Meta's 24-hour customer window block.
 */
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
    const ss = SpreadsheetApp.openById("1A-TrzJZsDpXM0sRgUGF-9GIC6fUEtlkQbFs6OKn1hUA");
    let logSheet = ss.getSheetByName(SHEET_NAME_LOGS) || ss.insertSheet(SHEET_NAME_LOGS);
    logSheet.appendRow([new Date(), event, data]);
  } catch (e) {}
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function markWhatsappClicked(orderId) {
  const ss = SpreadsheetApp.openById("1A-TrzJZsDpXM0sRgUGF-9GIC6fUEtlkQbFs6OKn1hUA");
  const sheet = ss.getSheetByName(SHEET_NAME_REG) || ss.getSheets()[0];
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][8] === orderId) {
      sheet.getRange(i + 1, 12).setValue("CHATTED ✅");
      break;
    }
  }
}

/**
 * Triggers the AI Funnels WhatsApp Campaign
 */
function triggerWhatsAppCampaign(contactName, contactEmail, contactPhone) {
  var url = "https://login.aifunnels.app/api/automations/6a43848a31b24/execute";
  
  var payload = {
    "api_token": "792ca1d7ae51ce36fa29d8636acfd3dd",
    "contact_name": contactName,
    "contact_email": contactEmail,
    "contact_phone": contactPhone,
    "sf.p_name": contactName // Passes user name into the sf.p_name variable in AI Funnels
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

/**
 * Automated cron trigger function to check and deliver masterclass reminders.
 */
function checkAndSendReminders() {
  const ss = SpreadsheetApp.openById("1A-TrzJZsDpXM0sRgUGF-9GIC6fUEtlkQbFs6OKn1hUA");
  const sheet = ss.getSheetByName(SHEET_NAME_REG) || ss.getSheets()[0];
  const data = sheet.getDataRange().getValues();
  const now = new Date();
  const webinarTime = new Date(WHATSAPP_CONFIG.WEBINAR_TIME);
  const hoursLeft = (webinarTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  if (hoursLeft < -24) return;

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[7] !== "✅ PAID") continue;
    
    const phone = row[3] ? row[3].toString().replace(/\D/g, '') : ""; 
    if (!phone) continue;
    const name = row[1];
    
    try {
      if (hoursLeft <= 24 && hoursLeft > 2 && row[12] === "NO") {
        sendWhatsAppTemplate(phone, "webinar_24h_reminder", [name]);
        sheet.getRange(i + 1, 13).setValue("SENT ✅");
      }
      else if (hoursLeft <= 2 && hoursLeft > 0.25 && row[13] === "NO") {
        sendWhatsAppTemplate(phone, "webinar_2h_reminder", [name]);
        sheet.getRange(i + 1, 14).setValue("SENT ✅");
      }
      else if (hoursLeft <= 0.25 && hoursLeft > -0.5 && row[14] === "NO") {
        sendWhatsAppTemplate(phone, "webinar_15m_reminder", [name, WHATSAPP_CONFIG.WA_GROUP_LINK]);
        sheet.getRange(i + 1, 15).setValue("SENT ✅");
      }
    } catch (e) {
      writeToLogs("REMINDER_ERROR", `Row ${i + 1}: ${e.message}`);
    }
  }
}
