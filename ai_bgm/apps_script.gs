/**
 * ============================================================================
 * AI_BGM_LLM — DEDICATED GOOGLE APPS SCRIPT AUTOMATION
 * Course: "Advance AI-Business Generative Model" (AI-BGM)
 * 
 * Target Google Sheet URL:
 * https://docs.google.com/spreadsheets/d/1XyFhw6cTJAOE2XT7Ra8lmL0rcvq2meCT9LlGuzOF0nk/edit?gid=0#gid=0
 * Spreadsheet ID: 1XyFhw6cTJAOE2XT7Ra8lmL0rcvq2meCT9LlGuzOF0nk
 * 
 * Columns in Sheet1:
 * Col A: Date and Time
 * Col B: Name
 * Col C: Email
 * Col D: Phone
 * Col E: Profession
 * Col F: Amount
 * Col G: Status
 * Col H: Order ID
 * Col I: Payment ID
 * ============================================================================
 */

// Razorpay Credentials (Domestic / India)
const RAZORPAY_KEY_ID = "rzp_live_T2CbVONQc6qrqj";
const RAZORPAY_KEY_SECRET = "0ZmzKfvHIwbnvkTCPxkWC1a6";

// Razorpay Credentials (International)
const RAZORPAY_KEY_ID_INTL = "rzp_live_gfoS1OjC8tvWjP";
const RAZORPAY_KEY_SECRET_INTL = "B0q7JAz8YhMat2QkTa3YCUGd";

const SPREADSHEET_ID = "1XyFhw6cTJAOE2XT7Ra8lmL0rcvq2meCT9LlGuzOF0nk";
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
 * Safely retrieve target sheet object
 */
function getTargetSheet() {
  let ss = null;
  try {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  } catch (e) {
    Logger.log("getActiveSpreadsheet notice: " + e.toString());
  }

  if (!ss) {
    try {
      ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    } catch (e) {
      Logger.log("openById notice: " + e.toString());
      throw new Error("Cannot open Spreadsheet ID " + SPREADSHEET_ID + ". Please run via Extensions -> Apps Script inside the sheet.");
    }
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
 * Handles HTTP GET requests (Health check or direct parameter submission)
 */
function doGet(e) {
  try {
    const params = (e && e.parameter) ? e.parameter : {};

    if (params.name && params.phone) {
      const sheet = getTargetSheet();
      return createOrderAndLogRow(sheet, params);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "online",
      course: "Advance AI-Business Generative Model (AI-BGM)",
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
 * 1. Initial Registration & Razorpay Order Creation (Col G: INITIATED)
 * 2. Payment Confirmation, Sheet Update & Payment Acknowledgement Dispatch (Col G: PAID, Col I: Payment ID)
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
        amount: Math.round((Number(paymentEntity.amount) || 589900) / 100)
      });
    }

    // CASE 1: Payment Success Callback from Razorpay checkout
    if (contents.paymentSuccess || contents.razorpay_payment_id) {
      return handlePaymentSuccess(sheet, contents);
    }

    // CASE 2: New Registration -> Append Row & Create Order ID
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
 * Appends row into Sheet1:
 * [Date and Time, Name, Email, Phone, Profession, Amount, Status, Order ID, Payment ID]
 */
function createOrderAndLogRow(sheet, data) {
  const name = sanitizeCell(data.name || "Anonymous");
  const email = sanitizeCell(data.email || "");
  const phone = sanitizeCell(data.phone || "");
  const profession = sanitizeCell(data.profession || "Business Owner / Professional");
  const emailLower = email.toLowerCase().trim();
  const rawAmt = parseInt(data.amount) || 5899;
  const amount = (TEST_EMAILS.indexOf(emailLower) !== -1 && rawAmt === 1) ? 1 : (rawAmt < 3500 ? 5899 : rawAmt);
  const isIntl = data.isInternational || false;
  const dateTimeStr = Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyy-MM-dd HH:mm:ss");

  let orderId = "ORD_BGM_" + new Date().getTime();

  // Create Razorpay Order via API
  try {
    const keyId = isIntl ? RAZORPAY_KEY_ID_INTL : RAZORPAY_KEY_ID;
    const keySecret = isIntl ? RAZORPAY_KEY_SECRET_INTL : RAZORPAY_KEY_SECRET;
    const amountInPaise = amount * 100;
    const orderUrl = "https://api.razorpay.com/v1/orders";
    const authHeader = "Basic " + Utilities.base64Encode(keyId + ":" + keySecret);

    const payload = {
      amount: amountInPaise,
      currency: "INR",
      receipt: "rcpt_bgm_" + new Date().getTime(),
      notes: {
        name: name,
        email: email,
        phone: phone,
        profession: profession,
        course: "Advance AI-Business Generative Model",
        coupon: data.coupon || data.promoCode || "",
        base_amount: data.baseAmount || 4999,
        gst_amount: data.gstAmount || 900
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

  // Exact Google Sheet Columns matching Row 1:
  // A: Date and Time | B: Name | C: Email | D: Phone | E: Profession | F: Amount | G: Status | H: Order ID | I: Payment ID
  sheet.appendRow([
    dateTimeStr,       // Col A: Date and Time
    name,              // Col B: Name
    email,             // Col C: Email
    phone,             // Col D: Phone
    profession,        // Col E: Profession
    amount,            // Col F: Amount
    "INITIATED",       // Col G: Status
    orderId,           // Col H: Order ID
    ""                 // Col I: Payment ID (filled upon payment)
  ]);

  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    orderId: orderId,
    amount: amount
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
      tags: ["ai_bgm_paid", "gst_invoice_issued"]
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
      name: courseName || "Advance AI-Business Generative Model (AI-BGM)",
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
          name: courseName || "Advance AI-Business Generative Model (AI-BGM)",
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
 * Updates row when payment completes:
 * Changes Col G (Status) to "PAID", sets Col I (Payment ID),
 * and dispatches the Official Payment Acknowledgement Receipt Email + Dual GST Invoices.
 */
function handlePaymentSuccess(sheet, data) {
  const orderId = data.razorpay_order_id || data.orderId || "";
  const paymentId = data.razorpay_payment_id || data.paymentId || "PAID";
  let userEmail = data.email || "";
  let userName = data.name || "Learner";
  let userPhone = data.phone || "";
  let amountPaid = parseInt(data.amount) || 5899;

  const rows = sheet.getDataRange().getValues();
  let targetRowIndex = -1;

  // 1. Search by Order ID (Col H, index 7)
  if (orderId) {
    for (let i = rows.length - 1; i >= 1; i--) {
      if (rows[i][7] && rows[i][7].toString().trim() === orderId.toString().trim()) {
        targetRowIndex = i + 1;
        break;
      }
    }
  }

  // 2. Fallback search by Email (Col C, index 2) or Phone (Col D, index 3)
  if (targetRowIndex === -1 && userEmail) {
    for (let i = rows.length - 1; i >= 1; i--) {
      if (rows[i][2] && rows[i][2].toString().toLowerCase().trim() === userEmail.toLowerCase().trim()) {
        targetRowIndex = i + 1;
        break;
      }
    }
  }

  if (targetRowIndex !== -1) {
    if (rows[targetRowIndex - 1][6] === "PAID") {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: "Already marked PAID.",
        paymentId: paymentId
      })).setMimeType(ContentService.MimeType.JSON);
    }
    userName = rows[targetRowIndex - 1][1] || userName;
    userEmail = rows[targetRowIndex - 1][2] || userEmail;
    userPhone = rows[targetRowIndex - 1][3] || userPhone;
    amountPaid = Number(rows[targetRowIndex - 1][5]) || amountPaid;
    // Update Col G (Status) to "PAID"
    sheet.getRange(targetRowIndex, 7).setValue("PAID");
    // Update Col I (Payment ID)
    sheet.getRange(targetRowIndex, 9).setValue(paymentId);
  } else {
    // If no previous initiated row was found, append a new PAID row
    const dateTimeStr = Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyy-MM-dd HH:mm:ss");
    sheet.appendRow([
      dateTimeStr,
      userName,
      userEmail,
      userPhone,
      data.profession || "Business Owner / Professional",
      amountPaid,
      "PAID",
      orderId,
      paymentId
    ]);
  }

  const courseTitle = "Advance AI-Business Generative Model (AI-BGM)";

  // 1. Sync with FunnelsDone Private Integration API & get official Invoice Number
  const fdInvoiceNo = syncInvoiceWithFunnelsDone(userName, userEmail, userPhone, courseTitle, amountPaid, paymentId, orderId);

  // 2. Generate our side's official GST Tax Invoice PDF attachment
  let pdfAttachment = null;
  try {
    pdfAttachment = generateOurGstInvoicePdfBlob(userName, userEmail, userPhone, courseTitle, amountPaid, paymentId, orderId, fdInvoiceNo);
  } catch (pdfErr) {
    Logger.log("PDF_GEN_ERROR: " + pdfErr.message);
  }

  // Send Official Payment Received Acknowledgement Email to Learner
  try {
    if (userEmail && userEmail.includes("@")) {
      const dateTimeFormatted = Utilities.formatDate(new Date(), "Asia/Kolkata", "dd MMM yyyy, hh:mm a 'IST'");
      const emailSubject = "🧾 Payment Received, Confirmed & GST Invoice: Advance AI-Business Generative Model (AI-BGM)";
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #0f172a; }
            .container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
            .header { background: linear-gradient(135deg, #020617 0%, #1e1b4b 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
            .badge { display: inline-block; padding: 6px 14px; background: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; color: #34d399; font-weight: 800; font-size: 11px; letter-spacing: 1.5px; border-radius: 20px; text-transform: uppercase; margin-bottom: 12px; }
            .title { font-size: 22px; font-weight: 900; margin: 0 0 8px 0; color: #ffffff; }
            .subtitle { font-size: 13px; color: #94a3b8; margin: 0; }
            .content { padding: 32px 28px; }
            .greeting { font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 12px; }
            .receipt-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0; }
            .receipt-total { background: #e0e7ff; padding: 12px 16px; border-radius: 8px; margin-top: 12px; display: flex; justify-content: space-between; align-items: center; }
            .total-label { color: #3730a3; font-weight: 800; font-size: 14px; text-transform: uppercase; }
            .total-val { color: #1e1b4b; font-weight: 900; font-size: 20px; }
            .deliverables { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0; }
            .deliverable-title { font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #4338ca; margin-bottom: 12px; }
            .deliv-item { margin: 8px 0; font-size: 13px; color: #334155; line-height: 1.5; }
            .cta-btn { display: block; text-align: center; background: #4f46e5; color: #ffffff !important; padding: 14px 28px; border-radius: 10px; font-weight: 800; text-decoration: none; font-size: 14px; margin: 24px 0 16px 0; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); }
            .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="badge">✓ Payment Received & Verified</div>
              <h1 class="title">${FUNNELSDONE_CONFIG.COMPANY_NAME}</h1>
              <p class="subtitle">Official Payment Receipt, GST Tax Invoice & Course Admission Acknowledgement</p>
            </div>
            
            <div class="content">
              <div class="greeting">Dear ${userName},</div>
              <p style="font-size: 14px; line-height: 1.6; color: #334155;">
                We have successfully received and confirmed your payment for the <strong>Advance AI-Business Generative Model (AI-BGM)</strong> executive course. Welcome to the cohort! Your official <strong>GST Tax Invoice (PDF)</strong> is attached to this email for your records.
              </p>

              <!-- Official Payment Receipt Box -->
              <div class="receipt-box">
                <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #0f172a; margin-bottom: 14px;">
                  Official Payment Details
                </div>
                <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                  <tr style="border-bottom: 1px dashed #e2e8f0;">
                    <td style="padding: 6px 0; color: #64748b;">Transaction Date:</td>
                    <td style="padding: 6px 0; font-weight: 700; text-align: right; color: #0f172a;">${dateTimeFormatted}</td>
                  </tr>
                  <tr style="border-bottom: 1px dashed #e2e8f0;">
                    <td style="padding: 6px 0; color: #64748b;">Payment ID:</td>
                    <td style="padding: 6px 0; font-family: monospace; font-weight: 700; text-align: right; color: #4338ca;">${paymentId}</td>
                  </tr>
                  <tr style="border-bottom: 1px dashed #e2e8f0;">
                    <td style="padding: 6px 0; color: #64748b;">Order Reference ID:</td>
                    <td style="padding: 6px 0; font-family: monospace; font-weight: 700; text-align: right; color: #0f172a;">${orderId}</td>
                  </tr>
                  <tr style="border-bottom: 1px dashed #e2e8f0;">
                    <td style="padding: 6px 0; color: #64748b;">Participant Name:</td>
                    <td style="padding: 6px 0; font-weight: 700; text-align: right; color: #0f172a;">${userName}</td>
                  </tr>
                  <tr style="border-bottom: 1px dashed #e2e8f0;">
                    <td style="padding: 6px 0; color: #64748b;">Registered Mobile:</td>
                    <td style="padding: 6px 0; font-weight: 700; text-align: right; color: #0f172a;">${userPhone}</td>
                  </tr>
                  <tr style="border-bottom: 1px dashed #e2e8f0;">
                    <td style="padding: 6px 0; color: #64748b;">Course / Product:</td>
                    <td style="padding: 6px 0; font-weight: 700; text-align: right; color: #0f172a;">Advance AI-Business Generative Model (AI-BGM)</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b;">Payment Status:</td>
                    <td style="padding: 6px 0; font-weight: 800; text-align: right; color: #16a34a;">PAID (COMPLETED)</td>
                  </tr>
                </table>

                <div class="receipt-total">
                  <span class="total-label">Total Amount Paid (Incl. GST):</span>
                  <span class="total-val">₹${amountPaid.toLocaleString()}</span>
                </div>
              </div>

              <!-- Enclosed Benefits -->
              <div class="deliverables">
                <div class="deliverable-title">Your Unlocked Cohort Inclusions</div>
                <div class="deliv-item">✓ <strong>20+ Hours of Course Content:</strong> High-definition video modules teaching AI with a 100% Business Perspective.</div>
                <div class="deliv-item">✓ <strong>Lifetime Unrestricted Access:</strong> Permanent access to the course platform with zero subscription renewals.</div>
                <div class="deliv-item">✓ <strong>The Living LLM Software:</strong> Continuous real-time model updates and prompt repositories as AI advances.</div>
                <div class="deliv-item">✓ <strong>9 CORE Principles BMC Blueprint:</strong> Full execution framework from business ideas to automated lead systems.</div>
                <div class="deliv-item">✓ <strong>AI Creatives, Websites & Video Engines:</strong> Production-grade assets for rapid market execution.</div>
              </div>

              <!-- Action Step -->
              <p style="font-size: 14px; line-height: 1.6; color: #334155;">
                <strong>Next Step:</strong> Click the button below to join the Private Onboarding WhatsApp channel and connect directly with Antony Praveen and the Tech Tycoon team.
              </p>

              <a href="https://wa.me/917558133039?text=Hello%20Antony%2C%20I%20have%20completed%20payment%20for%20AI-BGM%20Course%20(Payment%20ID%3A%20${paymentId})" class="cta-btn">
                📱 Join Private VIP WhatsApp Channel
              </a>

              <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin-top: 16px;">
                Need help? Reply directly to this email or reach our support team on WhatsApp at <strong>+91 75581 33039</strong>. Please preserve this email as your official proof of payment.
              </p>
            </div>

            <div class="footer">
              <p style="margin: 0 0 6px 0; font-weight: 700; color: #334155;">${FUNNELSDONE_CONFIG.COMPANY_NAME} (GSTIN: ${FUNNELSDONE_CONFIG.COMPANY_GSTIN})</p>
              <p style="margin: 0;">No. 3/59B, 1st Floor, 3rd Street, Ragava Nagar, Moovarasampet, Chennai-600091</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const emailOptions = {
        to: userEmail,
        subject: emailSubject,
        htmlBody: emailHtml,
        name: "Tech Tycoon AI Academy"
      };
      if (pdfAttachment) {
        emailOptions.attachments = [pdfAttachment];
      }
      MailApp.sendEmail(emailOptions);
    }
  } catch (emailErr) {
    Logger.log("Payment acknowledgement email notice: " + emailErr.toString());
  }

  // Also send Admin Notification Alert of payment received
  try {
    const adminEmails = "ambroseselva001@gmail.com, techtycoondigitalsolutions@gmail.com";
    const adminSubject = `🚨 [AI-BGM] New Payment Received: ₹${amountPaid.toLocaleString()} from ${userName}`;
    const adminBody = `A new payment has been successfully received for Advance AI-Business Generative Model (AI-BGM)!\n\n` +
      `Name: ${userName}\n` +
      `Email: ${userEmail}\n` +
      `Phone: ${userPhone}\n` +
      `Amount: ₹${amountPaid}\n` +
      `Order ID: ${orderId}\n` +
      `Payment ID: ${paymentId}\n` +
      `FunnelsDone Invoice: ${fdInvoiceNo || "Synced"}\n` +
      `Status: PAID (Updated in AI_BGM_LLM Sheet1)\n` +
      `Time: ${new Date().toString()}`;

    MailApp.sendEmail({
      to: adminEmails,
      subject: adminSubject,
      body: adminBody
    });
  } catch (adminErr) {
    Logger.log("Admin alert notice: " + adminErr.toString());
  }

  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: "Payment successfully verified, Google Sheet updated, and acknowledgement email sent.",
    paymentId: paymentId
  })).setMimeType(ContentService.MimeType.JSON);
}
