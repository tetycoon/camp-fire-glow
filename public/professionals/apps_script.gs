/**
 * ============================================================================
 * AI FOR WORKING PROFESSIONALS — DEDICATED GOOGLE APPS SCRIPT AUTOMATION
 * Course: "Advance AI for Non-Tech Working Professionals"
 * 
 * Target Google Sheet URL:
 * https://docs.google.com/spreadsheets/d/1RpwPPMH6nf8CsIAfITF1gNc5gBNhq7CJ0zckotAgq4I/edit?gid=0#gid=0
 * Spreadsheet ID: 1RpwPPMH6nf8CsIAfITF1gNc5gBNhq7CJ0zckotAgq4I
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

// Razorpay Credentials
const RAZORPAY_KEY_ID = "rzp_live_T2CbVONQc6qrqj";
const RAZORPAY_KEY_SECRET = "0ZmzKfvHIwbnvkTCPxkWC1a6";

// International Razorpay Credentials
const RAZORPAY_KEY_ID_INTL = "rzp_live_gfoS1OjC8tvWjP";
const RAZORPAY_KEY_SECRET_INTL = "B0q7JAz8YhMat2QkTa3YCUGd";

const SPREADSHEET_ID = "1RpwPPMH6nf8CsIAfITF1gNc5gBNhq7CJ0zckotAgq4I";
const SHEET_NAME = "Sheet1";

/**
 * Safely retrieve target sheet
 */
function getTargetSheet(requestedSpreadsheetId) {
  let ss = null;
  const targetId = requestedSpreadsheetId || SPREADSHEET_ID;
  
  try {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  } catch (e) {
    Logger.log("getActiveSpreadsheet notice: " + e.toString());
  }

  if (!ss) {
    try {
      ss = SpreadsheetApp.openById(targetId);
    } catch (e) {
      Logger.log("openById notice: " + e.toString());
      throw new Error("Cannot open Spreadsheet ID " + targetId + ". Please run via Extensions -> Apps Script inside the sheet.");
    }
  }

  return ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
}

/**
 * Handle GET Requests
 */
function doGet(e) {
  try {
    const params = (e && e.parameter) ? e.parameter : {};

    if (params.name && params.phone) {
      const sheet = getTargetSheet(params.spreadsheetId);
      return createOrderAndLogRow(sheet, params);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "online",
      course: "Advance AI for Non-Tech Working Professionals",
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
 * Handle POST Requests
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

    const sheet = getTargetSheet(contents.spreadsheetId);

    // Check if this is a payment success callback
    if (contents.paymentSuccess || contents.razorpay_payment_id) {
      return handlePaymentSuccess(sheet, contents);
    }

    // Default: Log row and generate Order ID
    return createOrderAndLogRow(sheet, contents);

  } catch (error) {
    Logger.log("doPost Error: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function sanitizeCell(val) {
  if (val === null || val === undefined) return "";
  const str = String(val).replace(/[\u0000-\u001F\u007F]/g, "").trim();
  if (/^[=+\-@\t\r]/.test(str)) return "'" + str;
  return str;
}

function verifyPaymentSignature(orderId, paymentId, signature, isIntl) {
  if (!orderId || !paymentId || !signature) return true;
  const secret = isIntl ? RAZORPAY_KEY_SECRET_INTL : RAZORPAY_KEY_SECRET;
  const payload = orderId + "|" + paymentId;
  const sigBytes = Utilities.computeHmacSha256Signature(payload, secret);
  const expectedSig = sigBytes.map(function (b) {
    const v = (b < 0) ? 256 + b : b;
    return ("0" + v.toString(16)).slice(-2);
  }).join("");
  return expectedSig === signature;
}

/**
 * Appends row into Sheet1 matching columns:
 * [Date and Time, Name, Email, Phone, Profession, Amount, Status, Order ID, Payment ID]
 */
function createOrderAndLogRow(sheet, data) {
  const currentDateTime = formatISTTimestamp(new Date());
  const name = sanitizeCell(data.name || "");
  const email = sanitizeCell(data.email || "");
  const phone = "'" + String(data.phone || "").replace(/[^\d+\-\s]/g, "");
  const gstSuffix = data.gstin ? ` | GSTIN: ${sanitizeCell(data.gstin)} (${sanitizeCell(data.companyName || "")})` : "";
  const profession = sanitizeCell((data.profession || data.customProfession || "Working Professional") + gstSuffix);
  const amount = Number(data.amount) || 5899;
  const isIntl = data.isInternational === true || data.isInternational === "true";
  
  let orderId = sanitizeCell(data.orderId || "");

  // Generate Razorpay Order ID if not provided
  if (!orderId || !orderId.startsWith("order_")) {
    orderId = createRazorpayOrder(amount, isIntl, {
      name: name,
      email: email,
      phone: phone,
      profession: profession,
      course: "Advance AI for Non-Tech Working Professionals",
      base_amount: data.baseAmount || 4999,
      gst_amount: data.gstAmount || 900,
      gstin: sanitizeCell(data.gstin || ""),
      company_name: sanitizeCell(data.companyName || "")
    });
  }

  // Check if order already exists in sheet to avoid duplicates
  const existingRow = findRowByOrderId(sheet, orderId);
  if (!existingRow) {
    const rowValues = [
      currentDateTime,       // Col A: Date and Time
      name,                  // Col B: Name
      email,                 // Col C: Email
      phone,                 // Col D: Phone
      profession,            // Col E: Profession
      amount,                // Col F: Amount
      "INITIATED",           // Col G: Status
      orderId,               // Col H: Order ID
      ""                     // Col I: Payment ID
    ];
    sheet.appendRow(rowValues);
  }

  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    orderId: orderId,
    amount: amount,
    status: "INITIATED"
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Updates row when Razorpay payment succeeds
 */
function handlePaymentSuccess(sheet, data) {
  const orderId = sanitizeCell(data.razorpay_order_id || data.orderId || "");
  const paymentId = sanitizeCell(data.razorpay_payment_id || data.paymentId || "");
  const isIntl = data.isInternational === true || data.isInternational === "true";
  if (data.razorpay_signature && orderId && paymentId) {
    if (!verifyPaymentSignature(orderId, paymentId, data.razorpay_signature, isIntl)) {
      throw new Error("Payment signature verification failed");
    }
  }
  const email = sanitizeCell(data.email || "");
  const phone = "'" + String(data.phone || "").replace(/[^\d+\-\s]/g, "");
  const name = sanitizeCell(data.name || "");
  const profession = sanitizeCell(data.profession || "Working Professional");
  const amount = Number(data.amount) || 5899;

  let rowNumber = -1;
  if (orderId) {
    rowNumber = findRowByOrderId(sheet, orderId);
  }

  if (rowNumber === -1 && email) {
    rowNumber = findRowByEmailOrPhone(sheet, email, phone);
  }

  if (rowNumber > 0) {
    // Col G (Col 7) = Status, Col I (Col 9) = Payment ID
    sheet.getRange(rowNumber, 7).setValue("PAID");
    sheet.getRange(rowNumber, 9).setValue(paymentId);
  } else {
    // Append new PAID row if not found
    const currentDateTime = formatISTTimestamp(new Date());
    sheet.appendRow([
      currentDateTime,
      name,
      email,
      phone,
      profession,
      amount,
      "PAID",
      orderId || ("ORD_" + Date.now()),
      paymentId
    ]);
  }

  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    status: "PAID",
    orderId: orderId,
    paymentId: paymentId
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Find row index by Order ID (Col H / Column 8)
 */
function findRowByOrderId(sheet, orderId) {
  if (!orderId) return -1;
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;

  const orderIds = sheet.getRange(2, 8, lastRow - 1, 1).getValues();
  for (let i = 0; i < orderIds.length; i++) {
    if (orderIds[i][0] && orderIds[i][0].toString().trim() === orderId) {
      return i + 2;
    }
  }
  return -1;
}

/**
 * Find row index by Email (Col C / Column 3) or Phone (Col D / Column 4)
 */
function findRowByEmailOrPhone(sheet, email, phone) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;

  const data = sheet.getRange(2, 3, lastRow - 1, 2).getValues();
  for (let i = 0; i < data.length; i++) {
    const rowEmail = (data[i][0] || "").toString().trim();
    const rowPhone = (data[i][1] || "").toString().trim();
    if ((email && rowEmail.toLowerCase() === email.toLowerCase()) || (phone && rowPhone === phone)) {
      return i + 2;
    }
  }
  return -1;
}

/**
 * Create Order in Razorpay API
 */
function createRazorpayOrder(amountInRupees, isIntl, notes) {
  const keyId = isIntl ? RAZORPAY_KEY_ID_INTL : RAZORPAY_KEY_ID;
  const keySecret = isIntl ? RAZORPAY_KEY_SECRET_INTL : RAZORPAY_KEY_SECRET;

  const payload = {
    amount: Math.round(amountInRupees * 100),
    currency: "INR",
    receipt: "rcpt_prof_" + Utilities.getUuid().substring(0, 8),
    notes: notes || {}
  };

  const headers = {
    "Authorization": "Basic " + Utilities.base64Encode(keyId + ":" + keySecret),
    "Content-Type": "application/json"
  };

  const options = {
    method: "post",
    headers: headers,
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch("https://api.razorpay.com/v1/orders", options);
    const result = JSON.parse(response.getContentText());
    if (result && result.id) {
      return result.id;
    }
  } catch (err) {
    Logger.log("Razorpay Order API fallback: " + err.toString());
  }

  return "order_prof_fallback_" + Date.now();
}

/**
 * Format timestamp in IST
 */
function formatISTTimestamp(date) {
  return Utilities.formatDate(date, "Asia/Kolkata", "dd/MM/yyyy HH:mm:ss");
}
