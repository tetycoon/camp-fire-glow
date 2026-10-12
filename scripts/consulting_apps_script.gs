/**
 * ============================================================================
 * 1-ON-1 AI CONSULTATION — DEDICATED GOOGLE APPS SCRIPT AUTOMATION
 * Service: "1-on-1 AI Strategy & Mentorship Session" (₹2,500 / Hour)
 * 
 * Target Google Sheet URL:
 * https://docs.google.com/spreadsheets/d/1LP37n3zb1d0UkXjddQBCKqmSU0j5-HvPSI-Rda36E3s/edit?gid=0#gid=0
 * Spreadsheet ID: 1LP37n3zb1d0UkXjddQBCKqmSU0j5-HvPSI-Rda36E3s
 * Sheet Name: Sheet1 (or Active Tab)
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

const SPREADSHEET_ID = "1LP37n3zb1d0UkXjddQBCKqmSU0j5-HvPSI-Rda36E3s";
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
 * Handle GET Requests (Health Check & Verification)
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "success",
    service: "1-on-1 AI Strategy & Consultation (₹2,500/Hour)",
    spreadsheetId: SPREADSHEET_ID,
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle POST Requests from Landing Page & Razorpay
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000); // Wait up to 30s to prevent concurrent write collisions
  } catch (lockErr) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: "Could not acquire sheet lock. Please try again."
    })).setMimeType(ContentService.MimeType.JSON);
  }

  try {
    const rawData = e.postData ? e.postData.contents : "{}";
    const data = JSON.parse(rawData);
    const targetSpreadsheetId = data.spreadsheetId || SPREADSHEET_ID;
    const sheet = getTargetSheet(targetSpreadsheetId);

    // Ensure headers exist
    ensureHeaders(sheet);

    // SCENARIO 1: Payment Success Update
    if (data.paymentSuccess === true || (data.razorpay_payment_id && !data.orderId && !data.status)) {
      const orderIdToFind = data.razorpay_order_id || data.orderId || "";
      const paymentId = data.razorpay_payment_id || data.paymentId || "PAID";
      const userEmail = (data.email || "").toLowerCase().trim();
      const userPhone = (data.phone || "").trim();

      const lastRow = sheet.getLastRow();
      let matched = false;

      if (lastRow > 1) {
        const values = sheet.getRange(2, 1, lastRow - 1, 9).getValues();

        for (let i = values.length - 1; i >= 0; i--) {
          const rowOrderId = String(values[i][7] || "").trim(); // Col H: Order ID
          const rowEmail = String(values[i][2] || "").toLowerCase().trim(); // Col C: Email
          const rowPhone = String(values[i][3] || "").trim(); // Col D: Phone

          if (
            (orderIdToFind && rowOrderId === orderIdToFind) ||
            (userEmail && rowEmail === userEmail) ||
            (userPhone && rowPhone === userPhone)
          ) {
            const sheetRowIndex = i + 2;
            sheet.getRange(sheetRowIndex, 7).setValue("PAID"); // Col G: Status
            sheet.getRange(sheetRowIndex, 9).setValue(paymentId); // Col I: Payment ID
            if (data.amount) {
              sheet.getRange(sheetRowIndex, 6).setValue(data.amount); // Col F: Amount
            }
            matched = true;
            break;
          }
        }
      }

      // If no initiated row matched, append a fresh paid row
      if (!matched) {
        const now = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
        sheet.appendRow([
          now,
          data.name || "Consulting Client",
          data.email || "",
          data.phone || "",
          data.profession || "1-on-1 Consultation",
          data.amount || 2500,
          "PAID",
          orderIdToFind || ("ORD_DIRECT_" + Date.now()),
          paymentId
        ]);
      }

      lock.releaseLock();
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: "Consultation payment recorded successfully.",
        paymentId: paymentId
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // SCENARIO 2: Create Razorpay Order & Log INITIATED Row
    const now = data.dateTime || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    const name = data.name || "";
    const email = data.email || "";
    const phone = data.phone || "";
    const profession = data.profession || "1-on-1 AI Consultation";
    const amount = Number(data.amount) || 2500;
    const isInternational = data.isInternational === true;

    let orderId = data.orderId || ("ORD_CONSULT_" + Date.now());

    // Call Razorpay API to generate live official Order ID
    try {
      const activeKeyId = isInternational ? RAZORPAY_KEY_ID_INTL : RAZORPAY_KEY_ID;
      const activeKeySecret = isInternational ? RAZORPAY_KEY_SECRET_INTL : RAZORPAY_KEY_SECRET;

      const authHeader = "Basic " + Utilities.base64Encode(activeKeyId + ":" + activeKeySecret);
      const rzpResponse = UrlFetchApp.fetch("https://api.razorpay.com/v1/orders", {
        method: "post",
        headers: {
          "Authorization": authHeader,
          "Content-Type": "application/json"
        },
        payload: JSON.stringify({
          amount: amount * 100, // paise
          currency: "INR",
          receipt: orderId.slice(0, 40),
          notes: {
            service: "1-on-1 AI Strategy Session",
            name: name,
            email: email,
            phone: phone,
            profession: profession
          }
        }),
        muteHttpExceptions: true
      });

      const rzpData = JSON.parse(rzpResponse.getContentText());
      if (rzpData && rzpData.id) {
        orderId = rzpData.id;
      }
    } catch (rzpErr) {
      Logger.log("Razorpay Order API fallback: " + rzpErr.toString());
    }

    // Append Col A - Col I row
    // Col A: Date and Time | Col B: Name | Col C: Email | Col D: Phone | Col E: Profession | Col F: Amount | Col G: Status | Col H: Order ID | Col I: Payment ID
    sheet.appendRow([
      now,
      name,
      email,
      phone,
      profession,
      amount,
      "INITIATED",
      orderId,
      "" // Payment ID empty until paid
    ]);

    lock.releaseLock();
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      orderId: orderId,
      amount: amount
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    if (lock.hasLock()) lock.releaseLock();
    Logger.log("doPost Error: " + err.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Ensures Table Headers in Row 1 match expected format
 */
function ensureHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    const headers = [
      "Date and Time",
      "Name",
      "Email",
      "Phone",
      "Profession",
      "Amount",
      "Status",
      "Order ID",
      "Payment ID"
    ];
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#f3f4f6");
    sheet.setFrozenRows(1);
  }
}
