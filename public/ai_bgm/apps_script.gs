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

// Razorpay Credentials
const RAZORPAY_KEY_ID = "rzp_live_T2CbVONQc6qrqj";
const RAZORPAY_KEY_SECRET = "0ZmzKfvHIwbnvkTCPxkWC1a6";

// International Razorpay Credentials
const RAZORPAY_KEY_ID_INTL = "rzp_live_gfoS1OjC8tvWjP";
const RAZORPAY_KEY_SECRET_INTL = "B0q7JAz8YhMat2QkTa3YCUGd";

const SPREADSHEET_ID = "1XyFhw6cTJAOE2XT7Ra8lmL0rcvq2meCT9LlGuzOF0nk";
const SHEET_NAME = "Sheet1";

/**
 * Safely retrieve target sheet
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

/**
 * Handle GET Requests
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

    const sheet = getTargetSheet();

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
  const name = sanitizeCell(data.name || "Participant");
  const email = sanitizeCell(data.email || "");
  const phone = "'" + String(data.phone || "").replace(/[^\d+\-\s]/g, "");
  const gstSuffix = data.gstin ? ` | GSTIN: ${sanitizeCell(data.gstin)} (${sanitizeCell(data.companyName || "")})` : "";
  const profession = sanitizeCell((data.profession || "Business Owner / Professional") + gstSuffix);
  const amount = parseInt(data.amount) || 5899;
  const isIntl = data.isInternational || false;
  const dateTimeStr = Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyy-MM-dd HH:mm:ss");

  let orderId = "ORD_BGM_" + new Date().getTime();

  // Try creating Razorpay Order via API
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
        coupon: sanitizeCell(data.coupon || data.promoCode || ""),
        base_amount: data.baseAmount || 4999,
        gst_amount: data.gstAmount || 900,
        gstin: sanitizeCell(data.gstin || ""),
        company_name: sanitizeCell(data.companyName || "")
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
    Logger.log("Razorpay Order API warning: " + err.toString());
  }

  // Exact Google Sheet Columns:
  // A: Date and Time | B: Name | C: Email | D: Phone | E: Profession | F: Amount | G: Status | H: Order ID | I: Payment ID
  sheet.appendRow([
    dateTimeStr,    // Col A: Date and Time
    name,           // Col B: Name
    email,          // Col C: Email
    phone,          // Col D: Phone
    profession,     // Col E: Profession
    amount,         // Col F: Amount
    "INITIATED",    // Col G: Status
    orderId,        // Col H: Order ID
    ""              // Col I: Payment ID (filled upon payment)
  ]);

  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    orderId: orderId,
    amount: amount
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Updates row when payment completes successfully
 */
function handlePaymentSuccess(sheet, data) {
  const orderId = sanitizeCell(data.razorpay_order_id || data.orderId || "");
  const paymentId = sanitizeCell(data.razorpay_payment_id || data.paymentId || "PAID");
  const isIntl = data.isInternational || false;
  if (data.razorpay_signature && orderId && paymentId) {
    if (!verifyPaymentSignature(orderId, paymentId, data.razorpay_signature, isIntl)) {
      throw new Error("Payment signature verification failed");
    }
  }
  const userEmail = sanitizeCell(data.email || "");
  const userName = sanitizeCell(data.name || "Learner");
  const userPhone = "'" + String(data.phone || "").replace(/[^\d+\-\s]/g, "");
  const amountPaid = parseInt(data.amount) || 5899;

  const rows = sheet.getDataRange().getValues();
  let targetRowIndex = -1;

  // Search by orderId first (Col H, index 7)
  if (orderId) {
    for (let i = rows.length - 1; i >= 1; i--) {
      if (rows[i][7] && rows[i][7].toString().trim() === orderId.toString().trim()) {
        targetRowIndex = i + 1;
        break;
      }
    }
  }

  // Fallback search by email (Col C, index 2) or phone (Col D, index 3)
  if (targetRowIndex === -1 && userEmail) {
    for (let i = rows.length - 1; i >= 1; i--) {
      if (rows[i][2] && rows[i][2].toString().toLowerCase().trim() === userEmail.toLowerCase().trim()) {
        targetRowIndex = i + 1;
        break;
      }
    }
  }

  if (targetRowIndex !== -1) {
    // Update Col G (Status) to "PAID"
    sheet.getRange(targetRowIndex, 7).setValue("PAID");
    // Update Col I (Payment ID)
    sheet.getRange(targetRowIndex, 9).setValue(paymentId);
  } else {
    // If not found, append a complete new success row
    const dateTimeStr = Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyy-MM-dd HH:mm:ss");
    sheet.appendRow([
      dateTimeStr,
      userName,
      userEmail,
      userPhone,
      sanitizeCell(data.profession || "Business Owner / Professional"),
      amountPaid,
      "PAID",
      orderId,
      paymentId
    ]);
  }

  // Sync with FunnelsDone Private Integration API & Send Official Payment Received Acknowledgement Email
  try {
    const fdInvoiceNo = syncInvoiceWithFunnelsDone(userName, userEmail, userPhone, "Advance AI-Business Generative Model (AI-BGM)", amountPaid, paymentId, orderId);
    if (userEmail && userEmail.includes("@")) {
      const dateTimeFormatted = Utilities.formatDate(new Date(), "Asia/Kolkata", "dd MMM yyyy, hh:mm a 'IST'");
      const emailSubject = "🧾 Payment Received & GST Tax Invoice: Advance AI-Business Generative Model (AI-BGM)";
      let pdfAttachment = null;
      try {
        pdfAttachment = generateOurGstInvoicePdfBlob(userName, userEmail, userPhone, "Advance AI-Business Generative Model (AI-BGM)", amountPaid, paymentId, orderId, fdInvoiceNo);
      } catch (e) {}

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
            .receipt-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #e2e8f0; font-size: 13px; }
            .receipt-row:last-child { border-bottom: none; }
            .receipt-label { color: #64748b; font-weight: 500; }
            .receipt-val { color: #0f172a; font-weight: 700; text-align: right; }
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
              <h1 class="title">Tech Tycoon Digital Solution LLP</h1>
              <p class="subtitle">Official Payment Receipt, GST Tax Invoice & Course Admission</p>
            </div>
            
            <div class="content">
              <div class="greeting">Dear ${userName},</div>
              <p style="font-size: 14px; line-height: 1.6; color: #334155;">
                We have successfully received and confirmed your payment for the <strong>Advance AI-Business Generative Model (AI-BGM)</strong> executive course. Your official <strong>GST Tax Invoice (PDF)</strong> is attached to this email!
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
                    <td style="padding: 6px 0; color: #64748b;">Invoice Number:</td>
                    <td style="padding: 6px 0; font-family: monospace; font-weight: 700; text-align: right; color: #0f172a;">${fdInvoiceNo || "Attached PDF"}</td>
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
                  <span class="total-label">Total Amount Paid (Incl. 18% GST):</span>
                  <span class="total-val">₹${amountPaid.toLocaleString()}</span>
                </div>
              </div>

              <!-- Enclosed Benefits -->
              <div class="deliverables">
                <div class="deliverable-title">Your Unlocked Cohort Inclusions</div>
                <div class="deliv-item">✓ <strong>20+ Hours of Course Content:</strong> High-definition video modules teaching AI with a 100% Business Perspective.</div>
                <div class="deliv-item">✓ <strong>Lifetime Unrestricted Access:</strong> Permanent access to the course platform with zero subscription renewals.</div>
                <div class="deliv-item">✓ <strong>Continuous AI Updates:</strong> Real-time model updates and business prompt repositories as AI advances.</div>
                <div class="deliv-item">✓ <strong>9 CORE Principles BMC Blueprint:</strong> Full execution framework from business ideas to automated lead systems.</div>
                <div class="deliv-item">✓ <strong>AI Creatives, Websites & Video Engines:</strong> Production-grade assets for rapid market execution.</div>
              </div>

              <!-- Academy Course Access Notification -->
              <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 18px; margin: 20px 0; text-align: center;">
                <div style="font-size: 14px; font-weight: 800; color: #065f46; margin-bottom: 6px;">
                  🎓 Academy Course Access Will Be Provided Through Email
                </div>
                <p style="font-size: 13px; color: #047857; margin: 0; line-height: 1.5;">
                  Your enrollment for <strong>Advance AI Business Generative Model</strong> is being activated on the <strong>Tech Tycoon Academy Portal (<a href="https://academy.techtycoon.in" style="color: #065f46; font-weight: 700; text-decoration: underline;">academy.techtycoon.in</a>)</strong>. Your login credentials and portal access instructions will be delivered directly to this email address.
                </p>
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
              <p style="margin: 0 0 6px 0; font-weight: 700; color: #334155;">Tech Tycoon Digital Solution LLP (GSTIN: 33AAZFT9667P1ZP)</p>
              <p style="margin: 0;">Building the Next Generation of AI Entrepreneurs • All Rights Reserved</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const emailOpts = {
        to: userEmail,
        subject: emailSubject,
        htmlBody: emailHtml,
        name: "Tech Tycoon AI Academy"
      };
      if (pdfAttachment) emailOpts.attachments = [pdfAttachment];
      MailApp.sendEmail(emailOpts);
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

function generateOurGstInvoicePdfBlob(customerName, customerEmail, customerPhone, courseName, totalAmount, paymentId, orderId, invoiceNo) {
  const total = Math.max(1, Number(totalAmount) || 5899);
  const isTest = total === 1;
  const baseAmt = isTest ? 1 : Math.round((total / 1.18) * 100) / 100;
  const totalGst = isTest ? 0 : Math.round((total - baseAmt) * 100) / 100;
  const cgst = Math.round((totalGst / 2) * 100) / 100;
  const sgst = Math.round((totalGst - cgst) * 100) / 100;
  const invNumber = invoiceNo || ("TT/26-27/" + String(paymentId || orderId || Date.now()).replace(/[^A-Za-z0-9]/g, "").slice(-6).toUpperCase());
  const dateStr = Utilities.formatDate(new Date(), "Asia/Kolkata", "dd MMM yyyy");

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    body { font-family: Arial, Helvetica, sans-serif; color: #0f172a; margin: 20px; font-size: 12px; }
    .box { border: 1px solid #cbd5e1; border-radius: 10px; padding: 24px; }
    .header { border-bottom: 2px solid #0f172a; padding-bottom: 14px; margin-bottom: 18px; width: 100%; }
    .badge { background: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; font-weight: bold; padding: 3px 8px; border-radius: 4px; font-family: monospace; font-size: 11px; }
    .paid { background: #dcfce7; color: #15803d; font-weight: bold; padding: 4px 10px; border-radius: 12px; font-size: 11px; }
    table.items { width: 100%; border-collapse: collapse; margin: 18px 0; }
    table.items th { background: #0f172a; color: #ffffff; padding: 8px 10px; text-align: left; font-size: 11px; text-transform: uppercase; }
    table.items td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
    .right { text-align: right; font-family: monospace; }
  </style></head><body><div class="box">
    <table class="header"><tr>
      <td>
        <h2 style="margin:0 0 4px 0;font-size:16px;">${FUNNELSDONE_CONFIG.COMPANY_NAME}</h2>
        <div style="color:#475569;line-height:1.4;">${FUNNELSDONE_CONFIG.ADDRESS_LINE1}, ${FUNNELSDONE_CONFIG.CITY}, ${FUNNELSDONE_CONFIG.STATE} - ${FUNNELSDONE_CONFIG.POSTAL_CODE}<br/>Phone: +91 ${FUNNELSDONE_CONFIG.COMPANY_PHONE} | Website: ${FUNNELSDONE_CONFIG.COMPANY_WEBSITE}</div>
        <div style="margin-top:6px;"><span class="badge">GSTIN: ${FUNNELSDONE_CONFIG.COMPANY_GSTIN}</span></div>
      </td>
      <td style="text-align:right;vertical-align:top;">
        <h1 style="margin:0;font-size:20px;">TAX INVOICE</h1>
        <div style="color:#64748b;font-size:10px;margin-bottom:6px;">ORIGINAL FOR RECIPIENT</div>
        <span class="paid">PAID</span>
      </td>
    </tr></table>
    <table style="width:100%;margin-bottom:16px;"><tr>
      <td style="width:50%;vertical-align:top;background:#f8fafc;padding:10px;border-radius:6px;border:1px solid #e2e8f0;">
        <strong style="color:#64748b;font-size:10px;text-transform:uppercase;">Billed To (Customer)</strong><br/>
        <strong>${sanitizeCell(customerName || "Learner")}</strong><br/>
        Email: ${sanitizeCell(customerEmail || "")}<br/>
        Phone: ${sanitizeCell(customerPhone || "")}<br/>
        Place of Supply: Tamil Nadu (33), India
      </td>
      <td style="width:50%;vertical-align:top;background:#f8fafc;padding:10px;border-radius:6px;border:1px solid #e2e8f0;">
        <strong style="color:#64748b;font-size:10px;text-transform:uppercase;">Invoice & Payment Details</strong><br/>
        <strong>Invoice No:</strong> ${invNumber}<br/>
        <strong>Invoice Date:</strong> ${dateStr}<br/>
        <strong>Payment ID:</strong> ${sanitizeCell(paymentId || "PAID")}<br/>
        <strong>Order ID:</strong> ${sanitizeCell(orderId || "")}
      </td>
    </tr></table>
    <table class="items">
      <thead><tr><th>#</th><th>Description of Service</th><th>SAC Code</th><th class="right">Qty</th><th class="right">Taxable Value (INR)</th></tr></thead>
      <tbody><tr>
        <td>1</td>
        <td><strong>${sanitizeCell(courseName || "Advance AI-Business Generative Model (AI-BGM)")}</strong><br/><span style="color:#64748b;font-size:10px;">Executive Educational & Training Program</span></td>
        <td>${FUNNELSDONE_CONFIG.COMPANY_SAC}</td>
        <td class="right">1</td>
        <td class="right">Rs. ${baseAmt.toFixed(2)}</td>
      </tr></tbody>
    </table>
    <table style="width:280px;margin-left:auto;border-collapse:collapse;">
      <tr><td style="padding:5px 0;border-bottom:1px solid #e2e8f0;">Taxable Base Amount:</td><td class="right" style="padding:5px 0;border-bottom:1px solid #e2e8f0;">Rs. ${baseAmt.toFixed(2)}</td></tr>
      <tr><td style="padding:5px 0;border-bottom:1px solid #e2e8f0;">CGST (9%):</td><td class="right" style="padding:5px 0;border-bottom:1px solid #e2e8f0;">+ Rs. ${cgst.toFixed(2)}</td></tr>
      <tr><td style="padding:5px 0;border-bottom:1px solid #e2e8f0;">SGST (9%):</td><td class="right" style="padding:5px 0;border-bottom:1px solid #e2e8f0;">+ Rs. ${sgst.toFixed(2)}</td></tr>
      <tr><td style="padding:8px 0;font-weight:bold;font-size:13px;">Total Paid (Incl. GST):</td><td class="right" style="padding:8px 0;font-weight:bold;font-size:13px;">Rs. ${total.toFixed(2)}</td></tr>
    </table>
    <p style="margin-top:20px;padding-top:10px;border-top:1px dashed #cbd5e1;font-size:10px;color:#64748b;">This is a computer-generated GST Tax Invoice from ${FUNNELSDONE_CONFIG.COMPANY_NAME} and requires no physical signature.</p>
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

    const contactRes = UrlFetchApp.fetch(FUNNELSDONE_CONFIG.API_BASE + "/contacts/upsert", {
      method: "post",
      headers: headers,
      payload: JSON.stringify({
        locationId: FUNNELSDONE_CONFIG.LOCATION_ID,
        name: customerName || "Learner",
        email: customerEmail || "",
        phone: cleanPhone,
        tags: ["ai_bgm_paid", "gst_invoice_issued"]
      }),
      muteHttpExceptions: true
    });
    const contactJson = JSON.parse(contactRes.getContentText() || "{}");
    const contactId = contactJson.contact && contactJson.contact.id ? contactJson.contact.id : null;
    if (!contactId) return null;

    const numRes = UrlFetchApp.fetch(
      FUNNELSDONE_CONFIG.API_BASE + "/invoices/generate-invoice-number?altId=" + FUNNELSDONE_CONFIG.LOCATION_ID + "&altType=location",
      { method: "get", headers: headers, muteHttpExceptions: true }
    );
    const numJson = JSON.parse(numRes.getContentText() || "{}");
    const nextInvoiceNumber = numJson.invoiceNumber || String(Math.floor(100000 + Math.random() * 900000));

    const total = Math.max(1, Number(totalAmount) || 5899);
    const isTest = total === 1;
    const baseAmt = isTest ? 1 : Math.round((total / 1.18) * 100) / 100;
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
    if (invoiceId) {
      UrlFetchApp.fetch(FUNNELSDONE_CONFIG.API_BASE + "/invoices/" + invoiceId + "/record-payment", {
        method: "post",
        headers: headers,
        payload: JSON.stringify({
          altId: FUNNELSDONE_CONFIG.LOCATION_ID,
          altType: "location",
          mode: "other",
          amount: invJson.total || total,
          notes: "Paid via Razorpay | Payment ID: " + (paymentId || "") + " | Order ID: " + (orderId || ""),
          fulfilledAt: new Date().toISOString()
        }),
        muteHttpExceptions: true
      });
    }
    return "TT/26-27/" + nextInvoiceNumber;
  } catch (err) {
    Logger.log("FunnelsDone Sync Error: " + err.toString());
    return null;
  }
}
