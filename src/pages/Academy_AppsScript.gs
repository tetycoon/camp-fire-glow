/**
 * ============================================================================
 * TECH TYCOON ACADEMY — DEDICATED GOOGLE APPS SCRIPT AUTOMATION
 * Target Google Sheet URL: https://docs.google.com/spreadsheets/d/1PC9ZYxd4O7ofuDwcN5AhPHTvW6RYO7V2LgQqrbPTQ5I/edit#gid=0
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
  
  // 1. Try active spreadsheet first (when script is attached via Extensions -> Apps Script)
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
    }
  }

  if (!ss) {
    throw new Error("Spreadsheet container not found.");
  }

  return ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
}

/**
 * Handles HTTP GET requests (Health check or Direct Webhook)
 */
function doGet(e) {
  try {
    const params = (e && e.parameter) ? e.parameter : {};
    
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
 * Appends a lead row to Sheet1 and creates Razorpay Order ID
 */
function createOrderAndLogRow(sheet, data) {
  const name = sanitizeCell(data.name || "Anonymous");
  const email = sanitizeCell(data.email || "");
  const phone = "'" + String(data.phone || "").replace(/[^\d+\-\s]/g, "");
  const gstSuffix = data.gstin ? ` | GSTIN: ${sanitizeCell(data.gstin)} (${sanitizeCell(data.companyName || "")})` : "";
  const course = sanitizeCell((data.course || data.modeOfSession || "TECH TYCOON Academy") + gstSuffix);
  const amountPaid = parseInt(data.amount) || 5899;
  const balanceAmount = (amountPaid === 4999 || amountPaid === 5899) ? 5900 : ((amountPaid === 5999 || amountPaid === 7079) ? 7080 : 0);
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
  const orderId = sanitizeCell(data.razorpay_order_id || data.orderId || "");
  const paymentId = sanitizeCell(data.razorpay_payment_id || data.paymentId || "PAID");
  const isIntl = data.isInternational || false;
  if (data.razorpay_signature && orderId && paymentId) {
    if (!verifyPaymentSignature(orderId, paymentId, data.razorpay_signature, isIntl)) {
      throw new Error("Payment signature verification failed");
    }
  }
  const userEmail = sanitizeCell(data.email || "");
  const userName = sanitizeCell(data.name || "Valued Learner");
  const userPhone = "'" + String(data.phone || "").replace(/[^\d+\-\s]/g, "");
  const amountPaid = parseInt(data.amount) || 5899;
  const balanceAmount = (amountPaid === 4999 || amountPaid === 5899) ? 5900 : ((amountPaid === 5999 || amountPaid === 7079) ? 7080 : 0);

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
      balanceAmount,
      orderId,
      paymentId,
      "No"
    ]);
    targetRowIndex = sheet.getLastRow();
  }

  // Send Pre-Registration Confirmation Email + Sync FunnelsDone Invoice
  let emailSentStatus = "No";
  if (userEmail && userEmail.includes("@")) {
    try {
      const fdInvoiceNo = syncInvoiceWithFunnelsDone(userName, userEmail, userPhone, "TECH TYCOON Academy", amountPaid, paymentId, orderId);
      sendConfirmationEmail(userName, userEmail, paymentId, amountPaid, userPhone, orderId, fdInvoiceNo);
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
        <div style="color:#475569;line-height:1.4;">No. 3/59B, 1st Floor, 3rd Street, Ragava Nagar, Moovarasampet, Chennai-600091<br/>Mobile: +91 ${FUNNELSDONE_CONFIG.COMPANY_PHONE} | Website: ${FUNNELSDONE_CONFIG.COMPANY_WEBSITE}</div>
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
        <td><strong>${sanitizeCell(courseName || "TECH TYCOON Academy")}</strong><br/><span style="color:#64748b;font-size:10px;">Educational & Training Program</span></td>
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
        tags: ["academy_paid", "gst_invoice_issued"]
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

/**
 * Sends a HTML confirmation email to the pre-registered student
 */
function sendConfirmationEmail(name, email, paymentId, amountPaid, phone, orderId, fdInvoiceNo) {
  const subject = "🎉 Pre-Registration Confirmed & GST Invoice — TECH TYCOON Academy";
  const paidVal = parseInt(amountPaid) || 5899;
  const actualStr = paidVal >= 7000 ? "₹11,999" : "₹9,999";
  const offerStr = `₹${paidVal.toLocaleString()} (incl. 18% GST | Actual ${actualStr})`;
  
  let pdfAttachment = null;
  try {
    pdfAttachment = generateOurGstInvoicePdfBlob(name, email, phone, "TECH TYCOON Academy", paidVal, paymentId, orderId, fdInvoiceNo);
  } catch (e) {}

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0B0F19; color: #ffffff; padding: 30px; border-radius: 16px; border: 1px solid #374151;">
      
      <div style="text-align: center; margin-bottom: 25px;">
        <h1 style="color: #0EA5E9; margin: 0; font-size: 24px;">TECH TYCOON ACADEMY</h1>
        <p style="color: #E5E7EB; font-size: 14px; margin-top: 5px;">Exclusive Pre-Registration Offer Confirmed (50% OFF)</p>
      </div>

      <div style="background-color: #1F2937; padding: 20px; border-radius: 12px; border-left: 4px solid #10B981; margin-bottom: 25px;">
        <h2 style="color: #10B981; margin-top: 0; font-size: 18px;">Welcome aboard, ${name}! 🚀</h2>
        <p style="color: #D1D5DB; font-size: 14px; line-height: 1.6;">
          Your 50% pre-registration offer for <strong>TECH TYCOON Academy</strong> is successfully locked in! Your official <strong>GST Tax Invoice (PDF)</strong> is attached to this email.
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
            <td style="padding: 8px 0; border-bottom: 1px solid #1F2937; font-weight: bold; color: #34D399;">${offerStr}</td>
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

  const mailOpts = {
    htmlBody: htmlBody,
    name: "TECH TYCOON Academy"
  };
  if (pdfAttachment) mailOpts.attachments = [pdfAttachment];
  GmailApp.sendEmail(email, subject, "", mailOpts);
}
