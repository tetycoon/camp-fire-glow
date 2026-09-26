/**
 * AI SECRETS REVEALED MASTERCLASS — CENTRAL AUTOMATION SYSTEM
 * Technical logs go to "Logs" | Registrations go to "Sheet1"
 */

const RAZORPAY_KEY_ID = "rzp_live_T2CbVONQc6qrqj";
const RAZORPAY_KEY_SECRET = "0ZmzKfvHIwbnvkTCPxkWC1a6";
const SHEET_NAME_REG = "Sheet1";
const SHEET_NAME_LOGS = "Logs"; 
const VERIFY_TOKEN = "ai_tycoon_auto_662"; 

const WHATSAPP_CONFIG = {
  ACCESS_TOKEN: "EAAU3qgM444cBRSPzgBf8ZADgHdtVimYAdkzvo3fD0p8ldhlnPOMpr7U8t3RQ9H6rvcvmZCs3EZAnKtHv1dHOB1a4hSyWLjGluThXneEyCKGuvgUBnAV2WTSFZCLL4YFZAvoc5h8axCbIVCLZAZB7YHyGgb2aTLudh04SV5XUIZCbUevZBQukQuCZBaeFdFPZBhv0R1iLQZDZD",
  PHONE_NUMBER_ID: "1089787377552637",
  PHONE_NUMBER: "917010340494", 
  SUPPORT_PHONE: "916379209689",
  WA_GROUP_LINK: "https://chat.whatsapp.com/FQZ85s071Id1VZifKUj7n0", // AI Secrets Revealed Group
  WA_GROUP_LINK_CLAUDE_ONLINE: "https://chat.whatsapp.com/HfVfYc6ea7iEHAMFjOb4WS", // Claude Online Group
  WA_GROUP_LINK_CLAUDE_OFFLINE: "https://chat.whatsapp.com/DMp2tRRhjwN1fziYujeQhb", // Claude Offline Group
  POSTER_URL: "https://course.techtycoon.in/images/AI_Secrets_Revealed_Banner.jpg" 
};

const TRIGGER_MESSAGE = "HI I am completed registration of AI Secret Reveals";

function getUpcomingWebinarTime() {
  const now = new Date();
  // Special scheduling: Friday, September 11th, 2026 at 6:00 PM (month index 8 for September)
  const specialSession = new Date(2026, 8, 11, 18, 0, 0);
  
  if (now.getTime() < specialSession.getTime()) {
    return specialSession;
  }
  
  const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 0, 0);
  const day = now.getDay();
  
  if (day === 5) {
    if (now.getTime() > target.getTime()) {
      target.setDate(target.getDate() + 7);
    }
  } else {
    const daysToAdd = (5 - day + 7) % 7;
    target.setDate(target.getDate() + daysToAdd);
  }
  
  return target;
}

// ------------------------------------------------------------
// 1. WEBHOOK: GET (WhatsApp Verification & Registration Fetching)
// ------------------------------------------------------------
function doGet(e) {
  if (e.parameter['hub.mode'] === 'subscribe' && e.parameter['hub.verify_token'] === VERIFY_TOKEN) {
    return ContentService.createTextOutput(e.parameter['hub.challenge']);
  }
  
  if (e.parameter.action === 'whatsapp') {
    markWhatsappClicked(e.parameter.orderId);
    const isOffline = e.parameter.mode === 'offline';
    const msgText = isOffline 
      ? "Hello Tech Tycoon Team I successfully complete the registration claude masterclass offline session"
      : "Hello Tech Tycoon Team I successfully complete the registration of claude masterclass online session";
    const waChatLink = `https://wa.me/${WHATSAPP_CONFIG.PHONE_NUMBER}?text=${encodeURIComponent(msgText)}`;
    const html = `<html><body style="font-family:sans-serif;text-align:center;padding-top:50px;background:#030712;color:white;">
      <h2>Redirecting to WhatsApp...</h2>
      <script>window.top.location.href="${waChatLink}";</script>
    </body></html>`;
    return HtmlService.createHtmlOutput(html).setTitle("Redirecting...");
  }

  // Dashboard Registrations Fetching
  if (e.parameter.action === 'getRegistrations') {
    if (e.parameter.token !== VERIFY_TOKEN) {
      return createJsonResponse({ success: false, error: "Unauthorized access token" });
    }
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME_REG) || ss.getSheets()[0];
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
        status: row[7],
        orderId: row[8],
        paymentId: row[9],
        emailStatus: row[10],
        whatsappClicked: row[11],
        reminder24h: row[12],
        reminder2h: row[13],
        reminder15m: row[14],
        pageUrl: row[15],
        batch: row[16],
        sessionDate: row[17],
        sessionTime: row[18]
      });
    }
    
    list.reverse();
    return createJsonResponse({ success: true, registrations: list });
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

    if (body.event === "payment.captured" || body.event === "order.paid") {
      const paymentEntity = body.payload.payment.entity;
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;
      const email = paymentEntity.email;
      
      updatePaymentStatusFromWebhook(orderId, paymentId, email);
      return createJsonResponse({ success: true, source: "razorpay_webhook" });
    }

    if (body.paymentSuccess === true) {
      updatePaymentStatus(body);
      return createJsonResponse({ success: true, source: "client_browser" });
    }

    if (body.name && body.email && body.phone && !body.object) {
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

// ------------------------------------------------------------
// 3. WHATSAPP & EMAIL LOGIC (ALL WORKSHOPS)
// ------------------------------------------------------------
function handleWhatsAppIncoming(body) {
  const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!message || !message.text?.body) return;

  const rawText = message.text.body;
  const textReceived = rawText.toLowerCase().trim();
  const phone = message.from;

  // 1. UPSCALE WORKSHOP LOGIC (Chennai Offline)
  if (textReceived.includes("business generative model") || textReceived.includes("upscale")) {
    const posterUrl = "https://course.techtycoon.in/images/upscale_offline_banner.png"; 
    sendWhatsAppImage(phone, posterUrl, "Level-2 Offline AI Workshop (Chennai)");
    
    let welcomeMsg = "Welcome! 🎉 Your registration is confirmed for the Offline AI Workshop in Chennai.\n\n";
    welcomeMsg += `📅 Date: October 2nd week 2026 (Sunday)\n🕒 Time: 9:00 AM — 5:30 PM\n📍 Location: Vestin Park Hotel, Egmore\n\n`;
    welcomeMsg += "Please join our official WhatsApp Community for updates:\nhttps://chat.whatsapp.com/C88mQXMh84j1Qub9wmBTHv\n\n";
    welcomeMsg += "If you have any doubts, feel free to call or WhatsApp us at +91 63792 09689.";
    
    sendWhatsAppText(phone, welcomeMsg);
    return;
  } 

  // 2. CLAUDE MASTERCLASS LOGIC
  if (textReceived.includes("claude")) {
    const posterUrl = "https://course.techtycoon.in/claude_masterclass/images/poster.jpg";
    sendWhatsAppImage(phone, posterUrl, "Claude MasterClass 2026");

    let isOfflineMsg = textReceived.includes("offline") || textReceived.includes("in-person") || textReceived.includes("chennai");

    if (isOfflineMsg) {
      let welcomeMsg = "Welcome! 🎉 Your registration is confirmed for the Claude MasterClass (In-Person Workshop).\n\n";
      welcomeMsg += `📍 Venue: Vestin Park Hotel, Egmore, Chennai\n`;
      welcomeMsg += `📅 Date: September 6th, 2026 (Sunday • Full Day)\n`;
      welcomeMsg += `🕒 Time: 9:00 AM – 5:30 PM IST\n`;
      welcomeMsg += `🍱 Luxury Buffet Lunch & High Tea Included\n`;
      welcomeMsg += `💻 Bring your laptop with internet connectivity\n\n`;
      welcomeMsg += "Please join our exclusive In-Person WhatsApp Community below for venue instructions & updates:\n" + WHATSAPP_CONFIG.WA_GROUP_LINK_CLAUDE_OFFLINE + "\n\n";
      welcomeMsg += "If you have any doubts, feel free to call or WhatsApp us at +91 63792 09689.";
      
      sendWhatsAppText(phone, welcomeMsg);
    } else {
      let welcomeMsg = "Welcome! 🎉 Your registration is confirmed for the Claude MasterClass (Online Live Session).\n\n";
      welcomeMsg += `📍 Platform: Online Live Classroom\n`;
      welcomeMsg += `📅 Date: September 12th & 13th, 2026 (Sat & Sun)\n`;
      welcomeMsg += `🕒 Time: 6:00 PM – 9:00 PM IST\n\n`;
      welcomeMsg += "Please join our exclusive Online WhatsApp Community below to receive session links:\n" + WHATSAPP_CONFIG.WA_GROUP_LINK_CLAUDE_ONLINE + "\n\n";
      welcomeMsg += "If you have any doubts, feel free to call or WhatsApp us at +91 63792 09689.";
      
      sendWhatsAppText(phone, welcomeMsg);
    }
    return;
  }

  // 3. AI SECRETS REVEALED LOGIC
  if (textReceived.includes("secret") || textReceived.includes("reveal")) {
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
    welcomeMsg += "Please join our exclusive WhatsApp Community below to receive the webinar session link:\n" + WHATSAPP_CONFIG.WA_GROUP_LINK + "\n\n";
    welcomeMsg += "If you have any doubts, feel free to call or WhatsApp us at +91 63792 09689.";
    
    sendWhatsAppText(phone, welcomeMsg);
    return;
  }
}

function sendMasterclassEmail(email, name, sessionDate, sessionTime) {
  const defaultTime = getUpcomingWebinarTime();
  const dateVal = sessionDate || defaultTime.toDateString();
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
                  <td style="padding:16px 20px;font-size:14px;color:#3b82f6;font-weight:700;">Online Live Classroom (Link will be shared in WhatsApp group)</td>
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
                <p style="color:#1e40af;font-size:13px;margin:0 0 6px;line-height:1.5;">1. Make sure to join the WhatsApp group using the button above to receive the session link.</p>
                <p style="color:#1e40af;font-size:13px;margin:0 0 6px;line-height:1.5;">2. Log in 10 minutes prior to the scheduled session time.</p>
                <p style="color:#1e40af;font-size:13px;margin:0 0 6px;line-height:1.5;">3. Keep a notebook and pen ready to take notes of critical AI tools and workflows.</p>
                <p style="color:#1e40af;font-size:13px;margin:6px 0 0;line-height:1.5;">4. If you have any doubts, feel free to call or WhatsApp us at +91 63792 09689.</p>
              </div>
              <p style="color:#94a3b8;font-size:12px;text-align:center;margin:32px 0 0;line-height:1.5;">
                Have questions or doubts? Feel free to call us at +91 63792 09689 or email our support team at<br>
                <a href="mailto:support@techtycoon.in" style="color:#3b82f6;text-decoration:none;font-weight:600;">support@techtycoon.in</a>
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
    replyTo: "support@techtycoon.in"
  });
}

function createRazorpayOrder(data) {
  const isInternational = data.countryCode && data.countryCode !== "+91";
  
  const keyId = isInternational ? "rzp_live_gfoS1OjC8tvWjP" : RAZORPAY_KEY_ID;
  const keySecret = isInternational ? "B0q7JAz8YhMat2QkTa3YCUGd" : RAZORPAY_KEY_SECRET;
  
  const credentials = Utilities.base64Encode(keyId + ":" + keySecret);
  const options = {
    method: "post",
    headers: { Authorization: "Basic " + credentials, "Content-Type": "application/json" },
    payload: JSON.stringify({ amount: (data.amount || 99) * 100, currency: "INR" }),
    muteHttpExceptions: true
  };
  const response = UrlFetchApp.fetch("https://api.razorpay.com/v1/orders", options);
  const resText = response.getContentText();
  if (response.getResponseCode() !== 200) throw new Error("Razorpay Failed: " + resText);
  return JSON.parse(resText).id;
}

function saveToSheet(data, orderId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME_REG) || ss.getSheets()[0];
  sheet.appendRow([
    new Date(), data.name, data.email, "'" + data.phone, data.userType || "Professional", 
    data.modeOfSession || data.language || "Online Session (Live)", data.amount, "INITIATED", orderId, "", "WAITING", "NO", "NO", "NO", "NO",
    data.pageUrl || "", data.batch || "",
    data.sessionDate || "", data.sessionTime || "" 
  ]);
}

function updatePaymentStatus(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME_REG) || ss.getSheets()[0];
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][8] === data.razorpay_order_id) {
      if (rows[i][7] === "✅ PAID") return;
      
      sheet.getRange(i + 1, 8).setValue("✅ PAID");
      sheet.getRange(i + 1, 10).setValue(data.razorpay_payment_id);
      sheet.getRange(i + 1, 11).setValue("SENT ✅");
      
      const sessionDate = data.sessionDate || rows[i][17] || "";
      const sessionTime = data.sessionTime || rows[i][18] || "";
      const phoneClean = rows[i][3] ? rows[i][3].toString().replace(/\D/g, '') : "";
      
      try {
        sendMasterclassEmail(data.email, data.name, sessionDate, sessionTime);
        triggerWhatsAppCampaign(data.name, data.email, phoneClean);
        createCalendarInvite(data.email, data.name, sessionDate, sessionTime);
      } catch (err) {
        writeToLogs("EMAIL_OR_WA_ERROR", `Failed email/wa to ${data.email}: ${err.message}`);
      }
      break;
    }
  }
}

function updatePaymentStatusFromWebhook(orderId, paymentId, email) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME_REG) || ss.getSheets()[0];
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][8] === orderId) {
      if (rows[i][7] === "✅ PAID") return;
      
      sheet.getRange(i + 1, 8).setValue("✅ PAID");
      sheet.getRange(i + 1, 10).setValue(paymentId);
      sheet.getRange(i + 1, 11).setValue("SENT ✅");
      
      const name = rows[i][1];
      const sessionDate = rows[i][17] || "";
      const sessionTime = rows[i][18] || "";
      const phoneClean = rows[i][3] ? rows[i][3].toString().replace(/\D/g, '') : "";
      
      try {
        sendMasterclassEmail(email, name, sessionDate, sessionTime);
        triggerWhatsAppCampaign(name, email, phoneClean);
        createCalendarInvite(email, name, sessionDate, sessionTime);
      } catch (err) {
        writeToLogs("EMAIL_OR_WA_ERROR", `Failed email/wa to ${email}: ${err.message}`);
      }
      break;
    }
  }
}

function sendWhatsAppText(to, message) {
  try {
    const url = "https://graph.facebook.com/v19.0/" + WHATSAPP_CONFIG.PHONE_NUMBER_ID + "/messages";
    const options = {
      method: "post",
      contentType: "application/json",
      headers: { Authorization: "Bearer " + WHATSAPP_CONFIG.ACCESS_TOKEN },
      payload: JSON.stringify({ messaging_product: "whatsapp", to: to, type: "text", text: { body: message } }),
      muteHttpExceptions: true
    };
    const res = UrlFetchApp.fetch(url, options);
    writeToLogs("WA_TEXT_SEND", `To: ${to} | Status: ${res.getResponseCode()} | Response: ${res.getContentText()}`);
  } catch(e) {
    writeToLogs("WA_TEXT_ERROR", `To: ${to} | Error: ${e.message}`);
  }
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
  try {
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
    const res = UrlFetchApp.fetch(url, options);
    writeToLogs("WA_IMAGE_SEND", `To: ${to} | Status: ${res.getResponseCode()} | Response: ${res.getContentText()}`);
  } catch(e) {
    writeToLogs("WA_IMAGE_ERROR", `To: ${to} | Error: ${e.message}`);
  }
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

function markWhatsappClicked(orderId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME_REG) || ss.getSheets()[0];
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][8] === orderId) {
      sheet.getRange(i + 1, 12).setValue("CHATTED ✅");
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

function createCalendarInvite(email, name, sessionDate, sessionTime) {
  try {
    let startTime;
    if (sessionDate && sessionTime) {
      try {
        if (sessionDate instanceof Date) {
          startTime = new Date(sessionDate);
          if (sessionTime) {
            const timeParts = sessionTime.toString().split(":");
            startTime.setHours(parseInt(timeParts[0]) || 18);
            startTime.setMinutes(parseInt(timeParts[1]) || 0);
          }
        } else {
          const cleanDate = sessionDate.toString().trim();
          const cleanTime = sessionTime.toString().trim();
          
          if (cleanDate.toLowerCase().includes("friday") || !cleanDate.match(/\d/)) {
            startTime = getUpcomingWebinarTime();
          } else {
            startTime = new Date(cleanDate + " " + cleanTime);
          }
        }
      } catch (e) {
        startTime = getUpcomingWebinarTime();
      }
    } else {
      startTime = getUpcomingWebinarTime();
    }
    
    if (isNaN(startTime.getTime())) {
      startTime = getUpcomingWebinarTime();
    }

    const endTime = new Date(startTime.getTime() + 3 * 60 * 60 * 1000);

    const title = "🚀 Confirmed: AI Secrets Revealed Live Masterclass";
    const description = `Hi ${name},\n\nYour seat is confirmed for the AI Secrets Revealed Live Masterclass.\n\n` +
      `📅 Date: ${startTime.toDateString()}\n` +
      `🕒 Time: ${startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}\n` +
      `📍 Platform: Online Live Classroom (Link will be shared in the WhatsApp group)\n\n` +
      `Join the WhatsApp community if you haven't already:\n${WHATSAPP_CONFIG.WA_GROUP_LINK}\n\n` +
      `If you have any doubts, feel free to call or WhatsApp us at +91 63792 09689.\n\n` +
      `See you inside!\nAI Tycoon Team`;

    const location = "Online Live Classroom (Link will be sent in WhatsApp)";
    const calendar = CalendarApp.getDefaultCalendar();
    const searchStart = new Date(startTime.getTime() - 12 * 60 * 60 * 1000);
    const searchEnd = new Date(startTime.getTime() + 12 * 60 * 60 * 1000);
    const events = calendar.getEvents(searchStart, searchEnd);
    
    let event = null;
    for (let e of events) {
      if (e.getTitle() === title) {
        event = e;
        break;
      }
    }
    
    if (event) {
      event.addGuest(email);
      writeToLogs("CALENDAR_SUCCESS", `Added guest ${email} to existing calendar event.`);
    } else {
      calendar.createEvent(title, startTime, endTime, {
        description: description,
        location: location,
        guests: email,
        sendInvites: true
      });
      writeToLogs("CALENDAR_SUCCESS", `Created new calendar event and sent invite to ${email}.`);
    }
  } catch (err) {
    writeToLogs("CALENDAR_ERROR", `Failed to create/send calendar invite to ${email}: ${err.message}`);
  }
}

function checkAndSendReminders() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME_REG) || ss.getSheets()[0];
  const data = sheet.getDataRange().getValues();
  const now = new Date();
  const webinarTime = getUpcomingWebinarTime();
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
