/**
 * ============================================================================
 * TECH TYCOON ACADEMY — DEDICATED GOOGLE APPS SCRIPT AUTOMATION
 * Target Google Sheet URL: https://docs.google.com/spreadsheets/d/1PC9ZYxd4O7ofuDwcN5AhPHTvW6RYO7V2LgQqrbPTQ5I/edit?gid=0#gid=0
 * Spreadsheet ID: 1PC9ZYxd4O7ofuDwcN5AhPHTvW6RYO7V2LgQqrbPTQ5I
 * 
 * Target Columns in Sheet1:
 * Col A: Date & Time
 * Col B: Name
 * Col C: Email
 * Col D: Phone number
 * Col E: Course
 * Col F: Payment detail
 * Col G: Amount PAID
 * Col H: Balance Amount
 * Col I: Order ID
 * Col J: Payment ID
 * Col K: Email Sent
 * ============================================================================
 */

// Domestic Razorpay Credentials (India +91)
const RAZORPAY_KEY_ID = "rzp_live_T2CbVONQc6qrqj";
const RAZORPAY_KEY_SECRET = "0ZmzKfvHIwbnvkTCPxkWC1a6";

// International Razorpay Credentials
const RAZORPAY_KEY_ID_INTL = "rzp_live_gfoS1OjC8tvWjP";
const RAZORPAY_KEY_SECRET_INTL = "B0q7JAz8YhMat2QkTa3YCUGd";

const SPREADSHEET_ID = "1PC9ZYxd4O7ofuDwcN5AhPHTvW6RYO7V2LgQqrbPTQ5I";
const SHEET_NAME = "Sheet1";

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

/**
 * Safely retrieves the active sheet object
 */
function getTargetSheet() {
  let ss = null;
  
  // 1. Try active spreadsheet first (if script is bound to sheet via Extensions -> Apps Script)
  try {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  } catch (e) {
    Logger.log("getActiveSpreadsheet Notice: " + e.toString());
  }

  // 2. Fallback to openById if active is null
  if (!ss) {
    try {
      ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    } catch (e) {
      Logger.log("openById Notice: " + e.toString());
      throw new Error("Cannot open Spreadsheet ID " + SPREADSHEET_ID + ". Please make sure the Apps Script is opened via Extensions -> Apps Script inside the Academy Google Sheet.");
    }
  }

  if (!ss) {
    throw new Error("Spreadsheet container not found.");
  }

  return ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
}

function sanitizeCell(val) {
  if (val === null || val === undefined) return "";
  const str = String(val).replace(/[\u0000-\u001F\u007F]/g, "").trim();
  if (/^[=+\-@\t\r]/.test(str)) return "'" + str;
  return str;
}

/**
 * Handles HTTP GET requests (Health check, Webhook, or Admin Panel Stream)
 */
function doGet(e) {
  try {
    const params = (e && e.parameter) ? e.parameter : {};
    
    // Action 1: Stream registrations for Admin Panel (aitycoon.in/admin-panel)
    if (params.action === "getRegistrations") {
      const sheet = getTargetSheet();
      const data = sheet.getDataRange().getValues();
      const registrations = [];
      
      // Skip header row
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row[0] && !row[1] && !row[2]) continue;
        
        registrations.push({
          timestamp: row[0] ? new Date(row[0]).toISOString() : "",
          name: row[1] || "",
          email: row[2] || "",
          phone: row[3] || "",
          profession: "Student / Professional",
          language: row[4] || "TECH TYCOON Academy",
          amount: Number(row[6]) || 0,
          status: row[5] || (row[9] ? "PAID" : "INITIATED"),
          orderId: row[8] || "",
          paymentId: row[9] || "",
          emailStatus: row[10] || "",
          batch: "Academy Pre-Registration",
          sessionDate: "Sept 10th Launch",
          pageUrl: "https://course.techtycoon.in/academy"
        });
      }
      
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        count: registrations.length,
        registrations: registrations
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // If GET request includes lead parameters directly
    if (params.name || params.email || params.phone) {
      const sheet = getTargetSheet();
      return createOrderAndLogRow(sheet, params);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "online",
      service: "TECH TYCOON Academy WebApp API",
      spreadsheetId: SPREADSHEET_ID,
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handles HTTP POST requests:
 * 1. Order Creation & Lead Recording (INITIATED)
 * 2. Payment Confirmation & Email Trigger (SUCCESS)
 */
function doPost(e) {
  try {
    let contents = {};
    if (e && e.postData && e.postData.contents) {
      try {
        contents = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        contents = e.parameter || {};
      }
    } else {
      contents = (e && e.parameter) ? e.parameter : {};
    }

    const sheet = getTargetSheet();

    // Razorpay Server Webhook Fallback
    if (contents.event === "payment.captured" || contents.event === "order.paid") {
      const paymentEntity = contents.payload.payment.entity;
      return handlePaymentSuccess(sheet, {
        razorpay_order_id: paymentEntity.order_id,
        razorpay_payment_id: paymentEntity.id,
        email: paymentEntity.email,
        amount: Math.round((Number(paymentEntity.amount) || 294900) / 100)
      });
    }

    // CASE 1: Payment Success Callback from Client
    if (contents.paymentSuccess || contents.razorpay_payment_id) {
      return handlePaymentSuccess(sheet, contents);
    }

    // CASE 2: New Pre-Registration Request -> Log Row & Create Razorpay Order
    return createOrderAndLogRow(sheet, contents);

  } catch (error) {
    Logger.log("doPost Error: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Appends a lead row to Sheet1 and optionally creates a Razorpay Order ID
 */
function createOrderAndLogRow(sheet, data) {
  const name = sanitizeCell(data.name || "Anonymous");
  const email = sanitizeCell(data.email || "");
  const phone = sanitizeCell(data.phone || "");
  const course = sanitizeCell(data.course || data.modeOfSession || "TECH TYCOON Academy");
  const emailLower = email.toLowerCase().trim();
  const rawAmt = parseInt(data.amount) || 2949;
  const amountPaid = (TEST_EMAILS.indexOf(emailLower) !== -1 && rawAmt === 1) ? 1 : (rawAmt < 2499 ? 2949 : rawAmt);
  const balanceAmount = (amountPaid === 2499 || amountPaid === 2949) ? 2500 : 0; // 50% discount off ₹4,999
  const isIntl = data.isInternational || false;
  const dateTimeStr = Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyy-MM-dd HH:mm:ss");

  let orderId = "ORD_" + new Date().getTime();

  // Try creating Razorpay Order ID
  try {
    const keyId = isIntl ? RAZORPAY_KEY_ID_INTL : RAZORPAY_KEY_ID;
    const keySecret = isIntl ? RAZORPAY_KEY_SECRET_INTL : RAZORPAY_KEY_SECRET;
    const amountInPaise = amountPaid * 100;
    const orderUrl = "https://api.razorpay.com/v1/orders";
    const authHeader = "Basic " + Utilities.base64Encode(keyId + ":" + keySecret);

    const payload = {
      amount: amountInPaise,
      currency: "INR",
      receipt: "rcpt_acad_" + new Date().getTime(),
      notes: {
        name: name,
        email: email,
        phone: phone,
        course: course,
        base_amount: data.baseAmount || 2499,
        gst_amount: data.gstAmount || 450
      }
    };

    const response = UrlFetchApp.fetch(orderUrl, {
      method: "post",
      headers: {
        "Authorization": authHeader,
        "Content-Type": "application/json"
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });

    const orderRes = JSON.parse(response.getContentText());
    if (orderRes && orderRes.id) {
      orderId = orderRes.id;
    }
  } catch (err) {
    Logger.log("Razorpay Order API Notice: " + err.toString());
  }

  // ALWAYS append row to Sheet1
  sheet.appendRow([
    dateTimeStr,       // Col A: Date & Time
    name,              // Col B: Name
    email,             // Col C: Email
    phone,             // Col D: Phone number
    course,            // Col E: Course
    "INITIATED",       // Col F: Payment detail
    amountPaid,        // Col G: Amount PAID
    balanceAmount,     // Col H: Balance Amount
    orderId,           // Col I: Order ID
    "",                // Col J: Payment ID
    "No"               // Col K: Email Sent
  ]);

  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    orderId: orderId
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Updates row status to SUCCESS when Razorpay payment completes and triggers confirmation email
 */
function handlePaymentSuccess(sheet, data) {
  const orderId = data.razorpay_order_id || data.orderId || "";
  const paymentId = data.razorpay_payment_id || data.paymentId || "PAID";
  let userEmail = data.email || "";
  let userName = data.name || "Valued Learner";
  let userPhone = data.phone || "";
  let amountPaid = parseInt(data.amount) || 2949;

  const rows = sheet.getDataRange().getValues();
  let targetRowIndex = -1;

  // Search by Order ID or Email
  for (let i = rows.length - 1; i >= 1; i--) {
    const rowOrderId = rows[i][8]; // Col I: Order ID
    const rowEmail = rows[i][2];   // Col C: Email
    
    if (orderId && rowOrderId === orderId) {
      targetRowIndex = i + 1;
      break;
    } else if (userEmail && rowEmail === userEmail) {
      targetRowIndex = i + 1;
      break;
    }
  }

  const dateTimeStr = Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyy-MM-dd HH:mm:ss");

  if (targetRowIndex > 1) {
    // Prevent duplicate sending if already marked SUCCESS & Yes
    if (rows[targetRowIndex - 1][5] === "SUCCESS" && rows[targetRowIndex - 1][10] === "Yes") {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        updatedRow: targetRowIndex,
        emailSent: "Already Sent"
      })).setMimeType(ContentService.MimeType.JSON);
    }
    userName = rows[targetRowIndex - 1][1] || userName;
    userEmail = rows[targetRowIndex - 1][2] || userEmail;
    userPhone = rows[targetRowIndex - 1][3] || userPhone;
    amountPaid = Number(rows[targetRowIndex - 1][6]) || amountPaid;
    sheet.getRange(targetRowIndex, 6).setValue("SUCCESS"); // Col F: Payment detail
    sheet.getRange(targetRowIndex, 10).setValue(paymentId); // Col J: Payment ID
  } else {
    // If no INITIATED row found, append new row
    sheet.appendRow([
      dateTimeStr,
      userName,
      userEmail,
      userPhone,
      "TECH TYCOON Academy",
      "SUCCESS",
      amountPaid,
      (amountPaid === 2499 || amountPaid === 2949) ? 2500 : 0,
      orderId,
      paymentId,
      "No"
    ]);
    targetRowIndex = sheet.getLastRow();
  }

  // Send Pre-Registration Confirmation Email with Dual GST Invoices
  let emailSentStatus = "No";
  if (userEmail && userEmail.includes("@")) {
    try {
      sendConfirmationEmail(userName, userEmail, paymentId, userPhone, amountPaid, orderId);
      emailSentStatus = "Yes";
      sheet.getRange(targetRowIndex, 11).setValue("Yes"); // Col K: Email Sent
    } catch (err) {
      Logger.log("Email Error: " + err.toString());
    }
  }

  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    updatedRow: targetRowIndex,
    emailSent: emailSentStatus
  })).setMimeType(ContentService.MimeType.JSON);
}

// ------------------------------------------------------------
// DUAL GST INVOICE: OUR PDF BLOB + FUNNELSDONE API v2 SYNC
// ------------------------------------------------------------
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
      tags: ["academy_paid", "gst_invoice_issued"]
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
      Logger.log("FUNNELSDONE_CONTACT_ERR: " + contactRes.getContentText());
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
      name: courseName || "TECH TYCOON Academy",
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
          name: courseName || "TECH TYCOON Academy",
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
      Logger.log("FUNNELSDONE_INV_ERR: " + invRes.getContentText());
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
    Logger.log("FUNNELSDONE_INVOICE_PAID: Invoice TT/26-27/" + nextInvoiceNumber + " (" + invoiceId + ") recorded: " + payRes.getResponseCode());
    return "TT/26-27/" + nextInvoiceNumber;
  } catch (err) {
    Logger.log("FUNNELSDONE_SYNC_ERROR: " + err.message);
    return null;
  }
}

/**
 * Sends a HTML confirmation email to the pre-registered student with Dual GST Invoices
 */
function sendConfirmationEmail(name, email, paymentId, phone, totalAmount, orderId) {
  const paidAmt = Number(totalAmount) || 2949;
  const courseTitle = "TECH TYCOON Academy (50% Pre-Registration Pass)";

  // 1. Sync with FunnelsDone Private Integration API & get official Invoice Number
  const fdInvoiceNo = syncInvoiceWithFunnelsDone(name, email, phone, courseTitle, paidAmt, paymentId, orderId);

  // 2. Generate our side's official GST Tax Invoice PDF attachment
  let pdfAttachment = null;
  try {
    pdfAttachment = generateOurGstInvoicePdfBlob(name, email, phone, courseTitle, paidAmt, paymentId, orderId, fdInvoiceNo);
  } catch (pdfErr) {
    Logger.log("PDF_GEN_ERROR: " + pdfErr.message);
  }

  const subject = "🎉 Pre-Registration Confirmed & GST Invoice — TECH TYCOON Academy (Launch Sept 10th)";
  
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0B0F19; color: #ffffff; padding: 30px; border-radius: 16px; border: 1px solid #374151;">
      
      <div style="text-align: center; margin-bottom: 25px;">
        <h1 style="color: #0EA5E9; margin: 0; font-size: 24px;">TECH TYCOON ACADEMY</h1>
        <p style="color: #E5E7EB; font-size: 14px; margin-top: 5px;">Exclusive Pre-Registration Offer Confirmed (50% OFF)</p>
      </div>

      <div style="background-color: #1F2937; padding: 20px; border-radius: 12px; border-left: 4px solid #10B981; margin-bottom: 25px;">
        <h2 style="color: #10B981; margin-top: 0; font-size: 18px;">Welcome aboard, ${name}! 🚀</h2>
        <p style="color: #D1D5DB; font-size: 14px; line-height: 1.6;">
          Your 50% pre-registration offer for <strong>TECH TYCOON Academy</strong> is successfully locked in! Your official <strong>GST Tax Invoice (PDF)</strong> is attached to this email for your records.
        </p>
      </div>

      <div style="background-color: #111827; padding: 20px; border-radius: 12px; margin-bottom: 25px; border: 1px solid #374151;">
        <h3 style="color: #FBBF24; margin-top: 0; font-size: 15px;">Registration Summary:</h3>
        <table style="width: 100%; text-align: left; border-collapse: collapse; font-size: 13px; color: #D1D5DB;">
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #1F2937; color: #9CA3AF;">Course Platform:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #1F2937; font-weight: bold; color: #FFFFFF;">TECH TYCOON Academy</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #1F2937; color: #9CA3AF;">Official Launch Date:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #1F2937; font-weight: bold; color: #FBBF24;">September 10th, 2026</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #1F2937; color: #9CA3AF;">Offer Price Paid (Incl. 18% GST):</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #1F2937; font-weight: bold; color: #34D399;">₹${paidAmt.toLocaleString("en-IN")} (Base ₹2,499 + 18% GST)</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #9CA3AF;">Payment Transaction ID:</td>
            <td style="padding: 8px 0; font-family: monospace; color: #0EA5E9;">${paymentId}</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; color: #9CA3AF; font-size: 12px;">
        <p>If you have any questions, reach out to us on WhatsApp: <strong>+91 7558133039 / +91 7010340494</strong></p>
        <p style="font-size: 11px; color: #6B7280; margin-top: 12px;">© 2026 ${FUNNELSDONE_CONFIG.COMPANY_NAME} (GSTIN: ${FUNNELSDONE_CONFIG.COMPANY_GSTIN})<br/>No. 3/59B, 1st Floor, 3rd Street, Ragava Nagar, Moovarasampet, Chennai-600091</p>
      </div>

    </div>
  `;

  const mailOptions = {
    htmlBody: htmlBody,
    name: "TECH TYCOON Academy"
  };
  if (pdfAttachment) {
    mailOptions.attachments = [pdfAttachment];
  }

  GmailApp.sendEmail(email, subject, "", mailOptions);
}
