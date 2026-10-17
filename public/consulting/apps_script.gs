/**
 * ============================================================================
 * 1-ON-1 AI CONSULTATION — GOOGLE APPS SCRIPT AUTOMATION
 * Spreadsheet: "consulting" (ID: 1LP37n3zb1d0UkXjddQBCKqmSU0j5-HvPSI-Rda36E3s)
 * Fee: ₹2,500 + 18% GST (₹2,950) / 1 Hour Consultation
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

const RAZORPAY_KEY_ID = "rzp_live_T2CbVONQc6qrqj";
const RAZORPAY_KEY_SECRET = "0ZmzKfvHIwbnvkTCPxkWC1a6";

const RAZORPAY_KEY_ID_INTL = "rzp_live_gfoS1OjC8tvWjP";
const RAZORPAY_KEY_SECRET_INTL = "B0q7JAz8YhMat2QkTa3YCUGd";

const SPREADSHEET_ID = "1LP37n3zb1d0UkXjddQBCKqmSU0j5-HvPSI-Rda36E3s";
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
      throw new Error("Cannot open Spreadsheet ID " + targetId);
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

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "success",
    service: "1-on-1 AI Consultation (₹2,500 + 18% GST)",
    spreadsheetId: SPREADSHEET_ID,
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
  } catch (lockErr) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: "Could not acquire lock. Please try again."
    })).setMimeType(ContentService.MimeType.JSON);
  }

  try {
    const rawData = e.postData ? e.postData.contents : "{}";
    const data = JSON.parse(rawData);
    const targetSpreadsheetId = data.spreadsheetId || SPREADSHEET_ID;
    const sheet = getTargetSheet(targetSpreadsheetId);

    ensureHeaders(sheet);

    // Razorpay Server Webhook Fallback
    if (data.event === "payment.captured" || data.event === "order.paid") {
      const paymentEntity = data.payload.payment.entity;
      data.paymentSuccess = true;
      data.razorpay_order_id = paymentEntity.order_id;
      data.razorpay_payment_id = paymentEntity.id;
      data.email = paymentEntity.email;
      data.amount = Math.round((Number(paymentEntity.amount) || 295000) / 100);
    }

    // SCENARIO 1: Payment Success Update
    if (data.paymentSuccess === true || (data.razorpay_payment_id && !data.orderId && !data.status)) {
      const orderIdToFind = data.razorpay_order_id || data.orderId || "";
      const paymentId = data.razorpay_payment_id || data.paymentId || "PAID";
      let userName = data.name || "Consulting Client";
      let userEmail = (data.email || "").toLowerCase().trim();
      let userPhone = (data.phone || "").trim();
      let paidAmount = Number(data.amount) || 2950;

      const lastRow = sheet.getLastRow();
      let matched = false;
      let alreadyPaid = false;

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
            if (String(values[i][6] || "").trim() === "PAID") {
              alreadyPaid = true;
            }
            userName = values[i][1] || userName;
            userEmail = values[i][2] || userEmail;
            userPhone = values[i][3] || userPhone;
            paidAmount = Number(data.amount || values[i][5] || 2950);

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

      if (!matched) {
        const now = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
        sheet.appendRow([
          now,
          sanitizeCell(userName),
          sanitizeCell(userEmail),
          sanitizeCell(userPhone),
          sanitizeCell(data.profession || "1-on-1 AI Consultation"),
          paidAmount,
          "PAID",
          orderIdToFind || ("ORD_DIRECT_" + Date.now()),
          paymentId
        ]);
      }

      // Trigger Dual GST Invoices (FunnelsDone API v2 + Our GST PDF Invoice Email)
      if (!alreadyPaid && userEmail && userEmail.includes("@")) {
        try {
          sendConsultationEmail(userName, userEmail, userPhone, paidAmount, paymentId, orderIdToFind);
        } catch (mailErr) {
          Logger.log("Consultation Invoice Email Error: " + mailErr.toString());
        }
      }

      lock.releaseLock();
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: "Consultation payment saved & GST Invoice issued.",
        paymentId: paymentId
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // SCENARIO 2: Create Order & Log INITIATED
    const now = data.dateTime || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    const name = sanitizeCell(data.name || "");
    const email = sanitizeCell(data.email || "");
    const phone = sanitizeCell(data.phone || "");
    const profession = sanitizeCell(data.profession || "1-on-1 AI Consultation");
    const emailLower = email.toLowerCase().trim();
    const rawAmt = Number(data.amount) || 2950;
    const amount = (TEST_EMAILS.indexOf(emailLower) !== -1 && rawAmt === 1) ? 1 : (rawAmt < 2500 ? 2950 : Math.round(rawAmt));
    const isInternational = data.isInternational === true;

    let orderId = data.orderId || ("ORD_CONSULT_" + Date.now());

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
          amount: amount * 100,
          currency: "INR",
          receipt: orderId.slice(0, 40),
          notes: {
            service: "1-on-1 AI Strategy Session",
            name: name,
            email: email,
            phone: phone,
            profession: profession,
            base_amount: data.baseAmount || 2500,
            gst_amount: data.gstAmount || 450
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

    sheet.appendRow([
      now,
      name,
      email,
      phone,
      profession,
      amount,
      "INITIATED",
      orderId,
      ""
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

// ------------------------------------------------------------
// DUAL GST INVOICE: OUR PDF BLOB + FUNNELSDONE API v2 SYNC
// ------------------------------------------------------------
function generateOurGstInvoicePdfBlob(customerName, customerEmail, customerPhone, courseName, totalAmount, paymentId, orderId, invoiceNo) {
  const total = Math.max(1, Number(totalAmount) || 2950);
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
        <strong>${sanitizeCell(customerName || "Client")}</strong><br/>
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
        <td><strong>${sanitizeCell(courseName || "1-on-1 AI Strategy & Implementation Consultation (1 Hour)")}</strong><br/><span style="color:#64748b;font-size:10px;">Executive AI Advisory & Architecture Consultation</span></td>
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

    // 1. Upsert Contact in FunnelsDone
    const contactPayload = {
      locationId: FUNNELSDONE_CONFIG.LOCATION_ID,
      name: customerName || "Client",
      email: customerEmail || "",
      phone: cleanPhone,
      tags: ["consulting_paid", "gst_invoice_issued"]
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
    const total = Math.max(1, Number(totalAmount) || 2950);
    const isTest = total === 1;
    const baseAmt = isTest ? 1 : Math.round((total / 1.18) * 100) / 100;
    const todayStr = Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyy-MM-dd");

    const createPayload = {
      altId: FUNNELSDONE_CONFIG.LOCATION_ID,
      altType: "location",
      name: courseName || "1-on-1 AI Strategy & Implementation Consultation",
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
        name: customerName || "Client",
        email: customerEmail || "",
        phoneNo: cleanPhone,
        address: { countryCode: "IN", state: "TAMILNADU" }
      },
      items: [
        {
          name: courseName || "1-on-1 AI Strategy & Implementation Consultation",
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

function sendConsultationEmail(userName, userEmail, userPhone, paidAmount, paymentId, orderId) {
  const courseTitle = "1-on-1 AI Strategy & Implementation Consultation (1 Hour)";

  // 1. Sync with FunnelsDone Private Integration API & get official Invoice Number
  const fdInvoiceNo = syncInvoiceWithFunnelsDone(userName, userEmail, userPhone, courseTitle, paidAmount, paymentId, orderId);

  // 2. Generate our side's official GST Tax Invoice PDF attachment
  let pdfAttachment = null;
  try {
    pdfAttachment = generateOurGstInvoicePdfBlob(userName, userEmail, userPhone, courseTitle, paidAmount, paymentId, orderId, fdInvoiceNo);
  } catch (pdfErr) {
    Logger.log("PDF_GEN_ERROR: " + pdfErr.message);
  }

  const subject = "✅ 1-on-1 AI Consultation Confirmed & GST Invoice — TECH TYCOON";
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; color: #0f172a; padding: 30px; border-radius: 16px; border: 1px solid #e2e8f0;">
      <h2 style="color: #0f172a; margin-top: 0;">Dear ${sanitizeCell(userName)},</h2>
      <p style="color: #334155; font-size: 14px; line-height: 1.6;">
        Your booking and payment for the <strong>1-on-1 AI Strategy & Implementation Consultation</strong> with Tech Tycoon is officially confirmed! Your official <strong>GST Tax Invoice (PDF)</strong> is attached to this email for your records.
      </p>
      <div style="background-color: #f8fafc; padding: 18px; border-radius: 12px; border: 1px solid #e2e8f0; margin: 20px 0;">
        <p style="margin: 6px 0; font-size: 13px;"><strong>Service:</strong> ${courseTitle}</p>
        <p style="margin: 6px 0; font-size: 13px;"><strong>Total Paid (Incl. 18% GST):</strong> ₹${Number(paidAmount).toLocaleString("en-IN")}</p>
        <p style="margin: 6px 0; font-size: 13px;"><strong>Payment ID:</strong> ${sanitizeCell(paymentId)}</p>
        <p style="margin: 6px 0; font-size: 13px;"><strong>Invoice No:</strong> ${fdInvoiceNo || "Attached PDF"}</p>
      </div>
      <p style="color: #334155; font-size: 14px; line-height: 1.6;">
        Our team will reach out to you on WhatsApp to finalize your preferred 1-hour slot, or you can message us directly at <strong>+91 75581 33039</strong>.
      </p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="color: #64748b; font-size: 11px; text-align: center; margin: 0;">
        © 2026 ${FUNNELSDONE_CONFIG.COMPANY_NAME} (GSTIN: ${FUNNELSDONE_CONFIG.COMPANY_GSTIN})<br/>
        No. 3/59B, 1st Floor, 3rd Street, Ragava Nagar, Moovarasampet, Chennai-600091
      </p>
    </div>
  `;

  const mailOptions = {
    to: userEmail,
    subject: subject,
    htmlBody: htmlBody,
    name: "Tech Tycoon AI Consulting",
    replyTo: "techtycoondigitalsolutions@gmail.com"
  };
  if (pdfAttachment) {
    mailOptions.attachments = [pdfAttachment];
  }
  MailApp.sendEmail(mailOptions);
}

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
