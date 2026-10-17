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
  let email = sanitizeCell(data.email || "");
  let phone = "'" + String(data.phone || "").replace(/[^\d+\-\s]/g, "");
  let name = sanitizeCell(data.name || "");
  let profession = sanitizeCell(data.profession || "Working Professional");
  let amount = Number(data.amount) || 5899;

  let rowNumber = -1;
  if (orderId) {
    rowNumber = findRowByOrderId(sheet, orderId);
  }

  if (rowNumber === -1 && email) {
    rowNumber = findRowByEmailOrPhone(sheet, email, phone);
  }

  let alreadyPaid = false;

  if (rowNumber > 0) {
    const existingStatus = String(sheet.getRange(rowNumber, 7).getValue() || "").trim();
    if (existingStatus === "PAID") {
      alreadyPaid = true;
    }
    const rowVals = sheet.getRange(rowNumber, 1, 1, 9).getValues()[0];
    if (!name && rowVals[1]) name = String(rowVals[1]);
    if (!email && rowVals[2]) email = String(rowVals[2]);
    if ((!data.phone) && rowVals[3]) phone = String(rowVals[3]);
    if (rowVals[5]) amount = Number(rowVals[5]) || amount;

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

  // Trigger Dual GST Invoices (1. FunnelsDone API v2 + 2. Our GST Invoice PDF attached to confirmation email)
  if (!alreadyPaid && email) {
    try {
      sendProfessionalConfirmationEmail(email, name || "Professional", phone.replace(/^'/, ""), amount, paymentId, orderId);
    } catch (mailErr) {
      Logger.log("Professional Confirmation / Invoice Error: " + mailErr.toString());
    }
  }

  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    status: "PAID",
    orderId: orderId,
    paymentId: paymentId
  })).setMimeType(ContentService.MimeType.JSON);
}

// ============================================================================
// FUNNELSDONE PRIVATE INTEGRATION API v2 + GST PDF INVOICE
// ============================================================================
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
        <strong>${sanitizeCell(customerName || "Professional")}</strong><br/>
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
        <td><strong>${sanitizeCell(courseName || "Advance AI for Non-Tech Working Professionals")}</strong><br/><span style="color:#64748b;font-size:10px;">Live Online Educational & Training Program</span></td>
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

    const contactPayload = {
      locationId: FUNNELSDONE_CONFIG.LOCATION_ID,
      name: customerName || "Professional",
      email: customerEmail || "",
      phone: cleanPhone,
      tags: ["professionals_paid", "gst_invoice_issued"]
    };
    const contactRes = UrlFetchApp.fetch(FUNNELSDONE_CONFIG.API_BASE + "/contacts/upsert", {
      method: "post",
      headers: headers,
      payload: JSON.stringify(contactPayload),
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
      name: courseName || "Advance AI for Non-Tech Working Professionals",
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
        name: customerName || "Professional",
        email: customerEmail || "",
        phoneNo: cleanPhone,
        address: { countryCode: "IN", state: "TAMILNADU" }
      },
      items: [
        {
          name: courseName || "Advance AI for Non-Tech Working Professionals",
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
    if (!invoiceId) return "TT/26-27/" + nextInvoiceNumber;

    const recordPayload = {
      altId: FUNNELSDONE_CONFIG.LOCATION_ID,
      altType: "location",
      mode: "other",
      amount: invJson.total || total,
      notes: "Paid via Razorpay | Payment ID: " + (paymentId || "") + " | Order ID: " + (orderId || ""),
      fulfilledAt: new Date().toISOString()
    };
    UrlFetchApp.fetch(FUNNELSDONE_CONFIG.API_BASE + "/invoices/" + invoiceId + "/record-payment", {
      method: "post",
      headers: headers,
      payload: JSON.stringify(recordPayload),
      muteHttpExceptions: true
    });
    return "TT/26-27/" + nextInvoiceNumber;
  } catch (err) {
    Logger.log("FunnelsDone Sync Error: " + err.toString());
    return null;
  }
}

function sendProfessionalConfirmationEmail(email, name, phone, totalAmount, paymentId, orderId) {
  const courseTitle = "Advance AI for Non-Tech Working Professionals";
  const fdInvoiceNo = syncInvoiceWithFunnelsDone(name, email, phone, courseTitle, totalAmount || 5899, paymentId, orderId);

  let pdfAttachment = null;
  try {
    pdfAttachment = generateOurGstInvoicePdfBlob(name, email, phone, courseTitle, totalAmount || 5899, paymentId, orderId, fdInvoiceNo);
  } catch (pdfErr) {
    Logger.log("PDF Gen Error: " + pdfErr.toString());
  }

  const subject = `🎉 Enrollment Confirmed & GST Invoice: ${courseTitle}`;
  const htmlBody = `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#f8fafc;padding:24px;color:#0f172a;">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:32px;">
      <h2 style="margin-top:0;color:#1d4ed8;">Welcome, ${sanitizeCell(name)}! 🚀</h2>
      <p style="font-size:15px;line-height:1.6;color:#334155;">
        Your enrollment for <strong>${courseTitle}</strong> is officially confirmed. Your official <strong>GST Tax Invoice (PDF)</strong> is attached to this email for your records.
      </p>
      <div style="background:#f1f5f9;border-radius:12px;padding:16px;margin:20px 0;font-size:14px;line-height:1.8;">
        <strong>Course:</strong> ${courseTitle}<br/>
        <strong>Amount Paid (Incl. 18% GST):</strong> Rs. ${Number(totalAmount || 5899).toFixed(2)}<br/>
        <strong>Payment ID:</strong> ${sanitizeCell(paymentId)}<br/>
        <strong>Invoice No:</strong> ${fdInvoiceNo || "Attached"}
      </div>
      <p style="font-size:13px;color:#64748b;">
        Have any questions? Call or WhatsApp us at <strong>+91 7558133039</strong> or email <a href="mailto:support@techtycoon.in">support@techtycoon.in</a>.
      </p>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;"/>
      <p style="font-size:11px;color:#94a3b8;margin:0;">
        © 2026 ${FUNNELSDONE_CONFIG.COMPANY_NAME} (GSTIN: ${FUNNELSDONE_CONFIG.COMPANY_GSTIN})<br/>
        No. 3/59B, 1st Floor, 3rd Street, Ragava Nagar, Moovarasampet, Chennai-600091
      </p>
    </div>
  </body></html>`;

  const emailOptions = {
    to: email,
    subject: subject,
    htmlBody: htmlBody,
    name: "Tech Tycoon AI Programs",
    replyTo: "support@techtycoon.in"
  };
  if (pdfAttachment) {
    emailOptions.attachments = [pdfAttachment];
  }
  MailApp.sendEmail(emailOptions);
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
