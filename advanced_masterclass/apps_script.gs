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
  WA_GROUP_LINK: "https://chat.whatsapp.com/FQZ85s071Id1VZifKUj7n0", // AI Secrets Revealed Group
  WA_GROUP_LINK_CLAUDE_ONLINE: "https://chat.whatsapp.com/HfVfYc6ea7iEHAMFjOb4WS", // Claude Online Group
  WA_GROUP_LINK_CLAUDE_OFFLINE: "https://chat.whatsapp.com/DMp2tRRhjwN1fziYujeQhb", // Claude Offline Group
  POSTER_URL: "https://aitycoon.in/images/AI_Secrets_Revealed_Banner.jpg" 
};

const TRIGGER_MESSAGE = "HI I am completed registration of AI Secret Reveals";

// ------------------------------------------------------------
// FUNNELSDONE PRIVATE INTEGRATION API v2 + GST PDF INVOICE CONFIG
// ------------------------------------------------------------
const FUNNELSDONE_CONFIG = {
  PIT_TOKEN: "pit-us-51307c8c-0d88-43f7-b619-3599040515db",
  LOCATION_ID: "uUUUKRH7EP2A0oJBv4Zb",
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

function getUpcomingWebinarTime() {
  const now = new Date();
  // Special scheduling: Friday, August 28th, 2026 at 6:00 PM (month index 7 for August)
  const specialSession = new Date(2026, 7, 28, 18, 0, 0);
  
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
    const posterUrl = "https://aitycoon.in/images/upscale_offline_banner.png"; 
    sendWhatsAppImage(phone, posterUrl, "Level-2 Offline AI Workshop (Chennai)");
    
    let welcomeMsg = "Welcome! 🎉 Your registration is confirmed for the Offline AI Workshop in Chennai.\n\n";
    welcomeMsg += `📅 Date: 9th August 2026 (Sunday)\n🕒 Time: 9:00 AM — 5:30 PM\n📍 Location: Vestin Park Hotel, Egmore\n\n`;
    welcomeMsg += "Please join our official WhatsApp Community for updates:\nhttps://chat.whatsapp.com/C88mQXMh84j1Qub9wmBTHv";
    
    sendWhatsAppText(phone, welcomeMsg);
    return;
  } 

  // 2. CLAUDE MASTERCLASS LOGIC
  if (textReceived.includes("claude")) {
    const posterUrl = "https://aitycoon.in/claude_masterclass/images/poster.jpg";
    sendWhatsAppImage(phone, posterUrl, "Claude MasterClass 2026");

    let isOfflineMsg = textReceived.includes("offline") || textReceived.includes("in-person") || textReceived.includes("chennai");

    if (isOfflineMsg) {
      let welcomeMsg = "Welcome! 🎉 Your registration is confirmed for the Claude MasterClass (In-Person Workshop).\n\n";
      welcomeMsg += `📍 Venue: Vestin Park Hotel, Egmore, Chennai\n`;
      welcomeMsg += `📅 Date: September 6th, 2026 (Sunday • Full Day)\n`;
      welcomeMsg += `🕒 Time: 9:00 AM – 5:30 PM IST\n`;
      welcomeMsg += `🍱 Luxury Buffet Lunch & High Tea Included\n`;
      welcomeMsg += `💻 Bring your laptop with internet connectivity\n\n`;
      welcomeMsg += "Please join our exclusive In-Person WhatsApp Community below for venue instructions & updates:\n" + WHATSAPP_CONFIG.WA_GROUP_LINK_CLAUDE_OFFLINE;
      
      sendWhatsAppText(phone, welcomeMsg);
    } else {
      let welcomeMsg = "Welcome! 🎉 Your registration is confirmed for the Claude MasterClass (Online Live Session).\n\n";
      welcomeMsg += `📍 Platform: Online Live Classroom\n`;
      welcomeMsg += `📅 Date: August 22nd & 23rd, 2026 (Sat & Sun)\n`;
      welcomeMsg += `🕒 Time: 6:00 PM – 9:00 PM IST\n\n`;
      welcomeMsg += "Please join our exclusive Online WhatsApp Community below to receive session links:\n" + WHATSAPP_CONFIG.WA_GROUP_LINK_CLAUDE_ONLINE;
      
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
    welcomeMsg += "Please join our exclusive WhatsApp Community below to receive the webinar session link:\n" + WHATSAPP_CONFIG.WA_GROUP_LINK;
    
    sendWhatsAppText(phone, welcomeMsg);
    return;
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
    let ss = null;
    try { ss = SpreadsheetApp.getActiveSpreadsheet(); } catch (e) {}
    if (!ss && typeof SPREADSHEET_ID !== "undefined" && SPREADSHEET_ID) {
      try { ss = SpreadsheetApp.openById(SPREADSHEET_ID); } catch (e) {}
    }
    if (!ss) return;
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
      tags: ["advanced_masterclass_paid", "gst_invoice_issued"]
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
      name: courseName || "AI-Secret Revealed",
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
          name: courseName || "AI-Secret Revealed",
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
    if (!invoiceId) {
      writeToLogs("FUNNELSDONE_INV_ERR", invRes.getContentText());
      return "TT/26-27/" + nextInvoiceNumber;
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
    return "TT/26-27/" + nextInvoiceNumber;
  } catch (err) {
    writeToLogs("FUNNELSDONE_SYNC_ERROR", err.message);
    return null;
  }
}

function sendMasterclassEmail(email, name, sessionDate, sessionTime, totalAmount, paymentId, orderId, phone) {
  const defaultTime = getUpcomingWebinarTime();
  const dateVal = sessionDate || defaultTime.toDateString();
  const timeVal = sessionTime || "6:00 PM IST";
  const courseTitle = "AI Secrets Revealed Masterclass";

  // 1. Sync with FunnelsDone Private Integration API & get official Invoice Number
  const fdInvoiceNo = syncInvoiceWithFunnelsDone(name, email, phone, "AI-Secret Revealed", totalAmount || 117, paymentId, orderId);

  // 2. Generate our side's official GST Tax Invoice PDF attachment
  let pdfAttachment = null;
  try {
    pdfAttachment = generateOurGstInvoicePdfBlob(name, email, phone, courseTitle, totalAmount || 117, paymentId, orderId, fdInvoiceNo);
  } catch (pdfErr) {
    writeToLogs("PDF_GEN_ERROR", pdfErr.message);
  }
  
  const subject = `🎉 Registration Confirmed & GST Invoice: AI Secrets Revealed Masterclass — ${dateVal}`;
  
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
                Your payment was successful and your seat is officially confirmed. Your official <strong>GST Tax Invoice (PDF)</strong> is attached to this email for your records!
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
                <p style="color:#1e40af;font-size:13px;margin:0;line-height:1.5;">3. Keep a notebook and pen ready to take notes of critical AI tools and workflows.</p>
              </div>
              <p style="color:#94a3b8;font-size:12px;text-align:center;margin:32px 0 0;line-height:1.5;">
                Have questions? Call us at +91 7558133039 or contact our support team at<br>
                <a href="mailto:techtycoondigitalsolutions@gmail.com" style="color:#3b82f6;text-decoration:none;font-weight:600;">techtycoondigitalsolutions@gmail.com</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f8fafc;border-top:1px solid #e2e8f0;padding:24px;text-align:center;">
              <p style="color:#94a3b8;font-size:11px;margin:0;">© 2026 ${FUNNELSDONE_CONFIG.COMPANY_NAME} (GSTIN: ${FUNNELSDONE_CONFIG.COMPANY_GSTIN}).<br/>No. 3/59B, 1st Floor, 3rd Street, Ragava Nagar, Moovarasampet, Chennai-600091</p>
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
    name: "AI Secrets Revealed Masterclass",
    replyTo: "techtycoondigitalsolutions@gmail.com"
  };
  if (pdfAttachment) {
    emailOptions.attachments = [pdfAttachment];
  }
  MailApp.sendEmail(emailOptions);
}

function validateMasterclassAmount(data) {
  const email = (data.email || "").toString().toLowerCase().trim();
  if (TEST_EMAILS.indexOf(email) !== -1 && Number(data.amount) === 1) return 1;
  const reqAmount = Number(data.amount) || 117;
  if (reqAmount < 99) return 117;
  return Math.round(reqAmount);
}

function createRazorpayOrder(data) {
  const isInternational = data.countryCode && data.countryCode !== "+91";
  
  const keyId = isInternational ? "rzp_live_gfoS1OjC8tvWjP" : RAZORPAY_KEY_ID;
  const keySecret = isInternational ? "B0q7JAz8YhMat2QkTa3YCUGd" : RAZORPAY_KEY_SECRET;
  const validAmount = validateMasterclassAmount(data);
  
  const credentials = Utilities.base64Encode(keyId + ":" + keySecret);
  const options = {
    method: "post",
    headers: { Authorization: "Basic " + credentials, "Content-Type": "application/json" },
    payload: JSON.stringify({
      amount: validAmount * 100,
      currency: "INR",
      notes: {
        base_amount: data.baseAmount || 99,
        gst_amount: data.gstAmount || 18
      }
    }),
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
  const validAmount = validateMasterclassAmount(data);
  sheet.appendRow([
    new Date(), sanitizeCell(data.name), sanitizeCell(data.email), "'" + String(data.phone || "").replace(/[^\d+\-\s]/g, ""), sanitizeCell(data.userType || "Professional"), 
    sanitizeCell(data.modeOfSession || data.language || "Online Session (Live)"), validAmount, "INITIATED", orderId, "", "WAITING", "NO", "NO", "NO", "NO",
    sanitizeCell(data.pageUrl || ""), sanitizeCell(data.batch || ""),
    sanitizeCell(data.sessionDate || ""), sanitizeCell(data.sessionTime || "") 
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
      const paidAmt = Number(rows[i][6] || data.amount || 117);
      
      try {
        sendMasterclassEmail(data.email, data.name, sessionDate, sessionTime, paidAmt, data.razorpay_payment_id, data.razorpay_order_id, phoneClean);
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
      const paidAmt = Number(rows[i][6] || 117);
      
      try {
        sendMasterclassEmail(email, name, sessionDate, sessionTime, paidAmt, paymentId, orderId, phoneClean);
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
