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

/**
 * Handles HTTP GET requests (Health check or Webhook)
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
          pageUrl: "https://aitycoon.in/academy"
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
  const name = data.name || "Anonymous";
  const email = data.email || "";
  const phone = data.phone || "";
  const course = data.course || data.modeOfSession || "TECH TYCOON Academy";
  const amountPaid = parseInt(data.amount) || 2499;
  const balanceAmount = amountPaid === 2499 ? 2500 : (amountPaid === 4000 ? 4000 : 0); // 50% discount off ₹4,999 (Domestic) or ₹8,000 (International)
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
        course: course
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
  // A: Date & Time, B: Name, C: Email, D: Phone number, E: Course, F: Payment detail, G: Amount PAID, H: Balance Amount, I: Order ID, J: Payment ID, K: Email Sent
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
  const userEmail = data.email || "";
  const userName = data.name || "Valued Learner";
  const userPhone = data.phone || "";
  const amountPaid = parseInt(data.amount) || 2499;

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
      amountPaid === 2499 ? 2500 : 0,
      orderId,
      paymentId,
      "No"
    ]);
    targetRowIndex = sheet.getLastRow();
  }

  // Send Pre-Registration Confirmation Email
  let emailSentStatus = "No";
  if (userEmail && userEmail.includes("@")) {
    try {
      sendConfirmationEmail(userName, userEmail, paymentId);
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

/**
 * Sends a HTML confirmation email to the pre-registered student
 */
function sendConfirmationEmail(name, email, paymentId) {
  const subject = "🎉 Pre-Registration Confirmed — TECH TYCOON Academy (Launch Sept 10th)";
  
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0B0F19; color: #ffffff; padding: 30px; border-radius: 16px; border: 1px solid #374151;">
      
      <div style="text-align: center; margin-bottom: 25px;">
        <h1 style="color: #0EA5E9; margin: 0; font-size: 24px;">TECH TYCOON ACADEMY</h1>
        <p style="color: #E5E7EB; font-size: 14px; margin-top: 5px;">Exclusive Pre-Registration Offer Confirmed (50% OFF)</p>
      </div>

      <div style="background-color: #1F2937; padding: 20px; border-radius: 12px; border-left: 4px solid #10B981; margin-bottom: 25px;">
        <h2 style="color: #10B981; margin-top: 0; font-size: 18px;">Welcome aboard, ${name}! 🚀</h2>
        <p style="color: #D1D5DB; font-size: 14px; line-height: 1.6;">
          Your 50% pre-registration offer for <strong>TECH TYCOON Academy</strong> is successfully locked in!
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
            <td style="padding: 8px 0; border-bottom: 1px solid #1F2937; color: #9CA3AF;">Offer Price Paid:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #1F2937; font-weight: bold; color: #34D399;">₹2,499 (Actual ₹4,999)</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #9CA3AF;">Payment Transaction ID:</td>
            <td style="padding: 8px 0; font-family: monospace; color: #0EA5E9;">${paymentId}</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; color: #9CA3AF; font-size: 12px;">
        <p>If you have any questions, reach out to us on WhatsApp: <strong>+91 7010340494</strong></p>
      </div>

    </div>
  `;

  GmailApp.sendEmail(email, subject, "", {
    htmlBody: htmlBody,
    name: "TECH TYCOON Academy"
  });
}
