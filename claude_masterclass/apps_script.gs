/**
 * ============================================================================
 * CLAUDE MASTERCLASS 2026 — EXCLUSIVE GOOGLE APPS SCRIPT AUTOMATION SYSTEM
 * Technical logs go to "Logs" | Registrations go to "Sheet1"
 * ============================================================================
 */

// Domestic Razorpay Credentials (India +91)
const RAZORPAY_KEY_ID = "rzp_live_T2CbVONQc6qrqj";
const RAZORPAY_KEY_SECRET = "0ZmzKfvHIwbnvkTCPxkWC1a6";

// International Razorpay Credentials (for non-India / away from India users)
const RAZORPAY_KEY_ID_INTL = "rzp_live_gfoS1OjC8tvWjP";
const RAZORPAY_KEY_SECRET_INTL = "B0q7JAz8YhMat2QkTa3YCUGd";

const SPREADSHEET_ID = "1JA3FZf8xkpZ8GjuYiETXz9R0ivfW80-rf3PZIzQum9g";
const SHEET_NAME_REG = "Sheet1";
const SHEET_NAME_LOGS = "Logs"; 
const VERIFY_TOKEN = "ai_tycoon_auto_662"; 

const WHATSAPP_CONFIG = {
  ACCESS_TOKEN: "EAAU3qgM444cBRSPzgBf8ZADgHdtVimYAdkzvo3fD0p8ldhlnPOMpr7U8t3RQ9H6rvcvmZCs3EZAnKtHv1dHOB1a4hSyWLjGluThXneEyCKGuvgUBnAV2WTSFZCLL4YFZAvoc5h8axCbIVCLZAZB7YHyGgb2aTLudh04SV5XUIZCbUevZBQukQuCZBaeFdFPZBhv0R1iLQZDZD",
  PHONE_NUMBER_ID: "1089787377552637",
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

function getNextSaturday(fromDate = new Date()) {
  const date = new Date(fromDate.getTime());
  const day = date.getDay();
  const diff = (6 - day + 7) % 7;
  if (day === 6 && fromDate.getHours() >= 18) {
    date.setDate(date.getDate() + 7);
  } else {
    date.setDate(date.getDate() + diff);
  }
  return date;
}

function getUpcomingMasterclassDates(isOffline = false) {
  if (isOffline) {
    return {
      dateText: "October 11th, 2026 (Sunday • Full Day)",
      timeText: "9:00 AM – 5:30 PM IST",
      venueText: "🏨 Vestin Park Hotel, Egmore, Chennai"
    };
  }

  return {
    dateText: "October 3 & 4, 2026 (Saturday & Sunday)",
    timeText: "6:00 PM – 9:00 PM IST",
    venueText: "🌐 Live Online Virtual Classroom"
  };
}

function doGet(e) {
  if (e.parameter['hub.mode'] === 'subscribe' && e.parameter['hub.verify_token'] === VERIFY_TOKEN) {
    return ContentService.createTextOutput(e.parameter['hub.challenge']);
  }
  
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
        sessionDate: "September 12 & 13, 2026",
        sessionTime: "6:00 PM IST"
      });
    }
    
    list.reverse();
    return createJsonResponse({ success: true, registrations: list, count: list.length });
  }

  return ContentService.createTextOutput("Claude MasterClass Automation is running.");
}

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
      if (!isClaudeRegistration(body)) return createJsonResponse({ success: false, message: "Ignored non-Claude payment" });
      updatePaymentStatus(body);
      return createJsonResponse({ success: true, source: "client_browser" });
    }

    if (body.name && body.email && body.phone && !body.object) {
      if (!isClaudeRegistration(body)) return createJsonResponse({ success: false, message: "Ignored non-Claude lead" });
      let orderId = "";
      try {
        orderId = createRazorpayOrder(body);
      } catch (err) {
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

function sendMasterclassEmail(email, name, amount, mode, paymentId, orderId, phone) {
  const numAmount = parseInt(amount) || 589;
  const isOffline = (mode && mode.toString().toLowerCase() === 'offline') || numAmount >= 4000;
  const dates = getUpcomingMasterclassDates(isOffline);
  const courseTitle = isOffline ? "Claude MasterClass 2026 (In-Person Workshop Chennai)" : "Claude MasterClass 2026 (Online Live Session)";

  // 1. Sync with FunnelsDone Private Integration API & get official Invoice Number
  const fdInvoiceNo = syncInvoiceWithFunnelsDone(name, email, phone, courseTitle, numAmount, paymentId, orderId);

  // 2. Generate our side's official GST Tax Invoice PDF attachment
  let pdfAttachment = null;
  try {
    pdfAttachment = generateOurGstInvoicePdfBlob(name, email, phone, courseTitle, numAmount, paymentId, orderId, fdInvoiceNo);
  } catch (pdfErr) {
    writeToLogs("PDF_GEN_ERROR", pdfErr.message);
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
  const amount = parseInt(data.amount) || 589;
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
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
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
      sendMasterclassEmail(email, name, amount, mode, data.razorpay_payment_id, targetOrderId, phoneClean);
      triggerWhatsAppCampaign(name, email, phoneClean);
    } catch (err) { writeToLogs("EMAIL_ERROR", err.message); }
  } else {
    const mode = data.mode || (parseInt(data.amount) >= 4000 ? "OFFLINE" : "ONLINE");
    const sessionModeDisplay = getModeOfSessionDisplay(mode, data.amount);

    sheet.appendRow([
      new Date(), sanitizeCell(data.name || "Customer"), sanitizeCell(data.email || ""), "'" + String(data.phone || "").replace(/[^\d+\-\s]/g, ""),
      "General", sessionModeDisplay, data.amount || 589, "✅ PAID", data.razorpay_order_id || "",
      data.razorpay_payment_id || "", "SENT ✅", "NO", "NO", "NO", "NO", "NO", "NO", "NO", "NO",
      (data.promoCode || "CLAUDE") + " | MODE: " + mode.toUpperCase() + (data.wantCertificate ? " | CERT: YES" : "") + " | " + rzpTag
    ]);

    try {
      sendMasterclassEmail(data.email, data.name || "Customer", data.amount || 589, mode, data.razorpay_payment_id, data.razorpay_order_id, targetPhone10);
      triggerWhatsAppCampaign(data.name || "Customer", data.email, targetPhone10);
    } catch (err) { writeToLogs("EMAIL_ERROR", err.message); }
  }
}

function updatePaymentStatusFromWebhook(orderId, paymentId, email, notes, rawAmount) {
  const isClaudePayment = notes && (notes.product === "claude_masterclass" || notes.masterclass === "claude");
  const amount = rawAmount ? rawAmount / 100 : 0;
  
  if (notes && notes.product && notes.product !== "claude_masterclass") {
    writeToLogs("NON_CLAUDE_WEBHOOK_SKIPPED", `Ignored ${notes.product} payment for ${email} (Order: ${orderId}).`);
    return;
  }

  if ((amount === 99 || amount === 117) && (!notes || !notes.product || !notes.product.toLowerCase().includes("claude"))) {
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
      sendMasterclassEmail(email, name, rowAmount, mode, paymentId, orderId, phoneClean);
      triggerWhatsAppCampaign(name, email, phoneClean);
    } catch (err) { writeToLogs("EMAIL_ERROR", err.message); }
  } else {
    if (isClaudePayment) {
      const mode = notes?.mode || (amount >= 4000 ? "OFFLINE" : "ONLINE");
      const sessionModeDisplay = getModeOfSessionDisplay(mode, amount);

      sheet.appendRow([
        new Date(), notes.customer_name || "Customer", email || "", "", "General", sessionModeDisplay, amount, "✅ PAID",
        orderId || "", paymentId || "", "SENT ✅", "NO", "NO", "NO", "NO", "NO", "NO", "NO", "NO", "CLAUDE | MODE: " + mode.toUpperCase()
      ]);

      try {
        sendMasterclassEmail(email, notes.customer_name || "Customer", amount, mode, paymentId, orderId, "");
      } catch (err) { writeToLogs("EMAIL_ERROR", err.message); }
    } else {
      writeToLogs("OTHER_PAGE_WEBHOOK_SKIPPED", `Ignored payment for ${email} (Order: ${orderId}) as it is not identified as Claude.`);
    }
  }
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
