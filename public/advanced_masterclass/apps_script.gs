/**
 * GOOGLE APPS SCRIPT: Tech Tycoon MasterClass Payment Handler with Webhook
 */

const SPREADSHEET_ID = "1aczs49JlSNZGyg7Q_8BJkZYkqZQmU_pjwOwll0-GvVE";
const SHEET_NAME = "Sheet1";
const VERIFY_TOKEN = "ai_tycoon_auto_662";

// Upcoming Session Schedule Configuration
const SESSION_DATES = "October 30, 31 & November 1st, 2026";
const SESSION_TIME = "6:00 PM – 9:00 PM IST";

// Razorpay Credentials (Domestic / Default)
const RZP_KEY_ID_DOMESTIC = "rzp_live_T2CbVONQc6qrqj"; 
const RZP_KEY_SECRET_DOMESTIC = "0ZmzKfvHIwbnvkTCPxkWC1a6";

// Razorpay Credentials (International / Overseas)
const RZP_KEY_ID_INTL = "rzp_live_gfoS1OjC8tvWjP";
const RZP_KEY_SECRET_INTL = "B0q7JAz8YhMat2QkTa3YCUGd";

const WEBHOOK_SECRET = "TECHTYCOON";

// 🔴 YOUR FUNNELSDONE WEBHOOK URL GOES HERE 🔴
const FUNNELSDONE_WEBHOOK_URL = "https://services.leadconnectorhq.com/hooks/uUUUKRH7EP2A0oJBv4Zb/webhook-trigger/5b2b531d-7b8b-4510-843e-212e14bad24c";

function doGet(e) {
    if (e.parameter['hub.mode'] === 'subscribe' && e.parameter['hub.verify_token'] === VERIFY_TOKEN) {
        return ContentService.createTextOutput(e.parameter['hub.challenge']);
    }

    // 🌟 ADMIN PANEL LIVE SYNC ENDPOINT
    if (e.parameter.action === 'getRegistrations') {
        if (e.parameter.token !== VERIFY_TOKEN) {
            return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Unauthorized token" })).setMimeType(ContentService.MimeType.JSON);
        }
        try {
            const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
            const sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
            const data = sheet.getDataRange().getValues();

            const registrations = [];
            for (let i = 1; i < data.length; i++) {
                const row = data[i];
                if (!row[0] && !row[1] && !row[2]) continue;

                let dateStr = "";
                if (row[0]) {
                    try {
                        dateStr = row[0] instanceof Date ? row[0].toISOString() : new Date(row[0]).toISOString();
                    } catch (errDate) {
                        dateStr = row[0].toString();
                    }
                }

                const rawStatus = (row[10] || "").toString().toLowerCase();
                const isPaid = rawStatus === "captured" || rawStatus === "webhook-captured" || rawStatus.includes("paid") || rawStatus.includes("success");

                registrations.push({
                    timestamp: dateStr,
                    name: row[1] || "",
                    email: row[2] || "",
                    phone: row[3] ? row[3].toString() : "",
                    profession: row[4] || "",
                    language: row[5] || "Advance AI Masterclass",
                    amount: Number(row[8] || row[7] || 0),
                    status: isPaid ? "✅ PAID" : "INITIATED",
                    orderId: row[6] || "",
                    paymentId: row[13] || "",
                    emailStatus: row[14] === "Yes" ? "SENT ✅" : "PENDING",
                    whatsappClicked: "NO",
                    pageUrl: "https://course.techtycoon.in/advanced_masterclass",
                    batch: "Advance AI Masterclass",
                    sessionDate: "Upcoming Session",
                    sessionTime: "Live"
                });
            }

            registrations.reverse();
            return ContentService.createTextOutput(JSON.stringify({ success: true, registrations: registrations, count: registrations.length })).setMimeType(ContentService.MimeType.JSON);
        } catch (err) {
            return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.message })).setMimeType(ContentService.MimeType.JSON);
        }
    }

    return ContentService.createTextOutput("Advance AI Masterclass Automation is running.");
}

function sanitizeCell(val) {
    if (val === null || val === undefined) return "";
    const str = String(val).replace(/[\u0000-\u001F\u007F]/g, "").trim();
    if (/^[=+\-@\t\r]/.test(str)) return "'" + str;
    return str;
}

function verifyPaymentSignature(orderId, paymentId, signature, isIntl) {
    if (!orderId || !paymentId || !signature) return true;
    const secret = isIntl ? RZP_KEY_SECRET_INTL : RZP_KEY_SECRET_DOMESTIC;
    const payload = orderId + "|" + paymentId;
    const sigBytes = Utilities.computeHmacSha256Signature(payload, secret);
    const expectedSig = sigBytes.map(function (b) {
        const v = (b < 0) ? 256 + b : b;
        return ("0" + v.toString(16)).slice(-2);
    }).join("");
    return expectedSig === signature;
}

function doPost(e) {
    try {
        const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        const sheet = ss.getSheetByName(SHEET_NAME);
        if (!sheet) throw new Error("Sheet '" + SHEET_NAME + "' not found");

        const headers = e.headers || {};
        const rzpSignature = headers['X-Razorpay-Signature'] || headers['x-razorpay-signature'];

        if (rzpSignature) {
            const rawBody = e.postData.contents;
            if (!verifySignature(rawBody, rzpSignature)) {
                return ContentService.createTextOutput("Invalid Signature").setStatusCode(400);
            }
            const webhookData = JSON.parse(rawBody);
            return handleRazorpayWebhook(sheet, webhookData);
        }

        const data = JSON.parse(e.postData.contents);

        if (data.action === "record_lead" || !data.action) {
            return handleLeadAndOrder(sheet, data);
        }

        if (data.action === "payment_success") {
            if (data.razorpay_signature && data.orderId && data.transactionId) {
                if (!verifyPaymentSignature(data.orderId, data.transactionId, data.razorpay_signature, !!data.isInternational)) {
                    throw new Error("Razorpay payment signature verification failed");
                }
            }
            return handlePaymentSuccess(sheet, {
                orderId: data.orderId,
                transactionId: data.transactionId,
                method: data.method || "Razorpay"
            });
        }

        return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Unknown action" })).setMimeType(ContentService.MimeType.JSON);

    } catch (err) {
        console.error("Critical Apps Script Error:", err);
        return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
    }
}

function handleLeadAndOrder(sheet, data) {
    const amount = Number(data.amount) || 590;
    const baseAmount = Number(data.baseAmount) || (amount === 590 ? 500 : (amount === 5899 ? 4999 : amount));
    const amountInPaise = Math.round(amount * 100);
    const timestamp = new Date();

    const isIntl = !!data.isInternational;
    const rzpOrder = createRazorpayOrder(amountInPaise, isIntl, data.name, data.email, data.gstin, data.companyName);
    if (!rzpOrder || !rzpOrder.id) {
        throw new Error("Failed to generate Razorpay Order ID. Response: " + JSON.stringify(rzpOrder));
    }
    const orderId = rzpOrder.id;
    
    let payableTotal = amount; 
    if (baseAmount === 500 || amount === 590) payableTotal = 8259; // ₹6,999 + 18% GST
    else if (baseAmount === 4999 || amount === 5899) payableTotal = 5899;
    const balance = Math.max(0, payableTotal - amount);

    const gstSuffix = data.gstin ? ` | GSTIN: ${sanitizeCell(data.gstin)} (${sanitizeCell(data.companyName || "")})` : "";
    const feeName = (baseAmount === 500 || amount === 590)
        ? "Partial Enrollment (₹500 + 18% GST = ₹590)"
        : ((baseAmount === 4999 || amount === 5899) ? "Full Enrollment (₹4,999 + 18% GST = ₹5,899)" : `Custom/Test Enrollment (₹${amount})`);

    sheet.appendRow([
        timestamp,
        sanitizeCell(data.name),
        sanitizeCell(data.email),
        "'" + String(data.phone || "").replace(/[^\d+\-\s]/g, ""),
        sanitizeCell((data.profession || "N/A") + gstSuffix),
        feeName,
        orderId,
        payableTotal,
        amount,
        balance,
        "checkout-started",
        timestamp,
        "N/A",
        "N/A",
        "No"
    ]);

    return ContentService.createTextOutput(JSON.stringify({ success: true, orderId: orderId })).setMimeType(ContentService.MimeType.JSON);
}

function createRazorpayOrder(amount, isIntl, customerName, customerEmail, gstin, companyName) {
    const keyId = isIntl ? RZP_KEY_ID_INTL : RZP_KEY_ID_DOMESTIC;
    const keySecret = isIntl ? RZP_KEY_SECRET_INTL : RZP_KEY_SECRET_DOMESTIC;

    const url = "https://api.razorpay.com/v1/orders";
    const auth = "Basic " + Utilities.base64Encode(keyId + ":" + keySecret);
    const payload = { 
        amount: amount, 
        currency: "INR", 
        receipt: "rcpt_" + Math.random().toString(36).substr(2, 9),
        notes: {
            product: "advanced_masterclass",
            customer_name: sanitizeCell(customerName || ""),
            customer_email: sanitizeCell(customerEmail || ""),
            gstin: sanitizeCell(gstin || ""),
            company_name: sanitizeCell(companyName || "")
        }
    };
    const options = { method: "POST", headers: { "Authorization": auth, "Content-Type": "application/json" }, payload: JSON.stringify(payload), muteHttpExceptions: true };
    return JSON.parse(UrlFetchApp.fetch(url, options).getContentText());
}

function verifySignature(rawBody, signatureProvided) {
    const computedSignatureBytes = Utilities.computeHmacSha256Signature(rawBody, WEBHOOK_SECRET);
    let computedSignatureHex = computedSignatureBytes.map(function (byte) {
        let v = (byte < 0) ? 256 + byte : byte;
        return ("0" + v.toString(16)).slice(-2);
    }).join('');
    return computedSignatureHex === signatureProvided;
}

function handleRazorpayWebhook(sheet, eventData) {
    const eventType = eventData.event;
    if (eventType !== "payment.captured" && eventType !== "order.paid") {
        return ContentService.createTextOutput("Event ignored").setStatusCode(200);
    }
    let orderId = "", transactionId = "", paymentMethod = "Webhook";

    if (eventType === "payment.captured" && eventData.payload?.payment?.entity) {
        orderId = eventData.payload.payment.entity.order_id;
        transactionId = eventData.payload.payment.entity.id;
        paymentMethod = eventData.payload.payment.entity.method || "Webhook";
    } else if (eventType === "order.paid" && eventData.payload?.order?.entity) {
        orderId = eventData.payload.order.entity.id;
        paymentMethod = "Webhook Event (Order Paid)";
    }
    if (!orderId) return ContentService.createTextOutput("No Order ID found").setStatusCode(200);

    return handlePaymentSuccess(sheet, { orderId, transactionId, method: paymentMethod });
}

function handlePaymentSuccess(sheet, data) {
    const rows = sheet.getDataRange().getValues();
    const orderId = data.orderId;
    let rowIndex = -1;

    for (let i = 1; i < rows.length; i++) {
        if (rows[i][6] === orderId) { rowIndex = i + 1; break; }
    }

    if (rowIndex > -1) {
        const currentStatus = rows[rowIndex - 1][10];
        if (currentStatus === "captured" || currentStatus === "webhook-captured") {
            return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Already captured" })).setMimeType(ContentService.MimeType.JSON);
        }

        const name = rows[rowIndex - 1][1];
        const email = rows[rowIndex - 1][2];
        const phone = rows[rowIndex - 1][3];
        const amountPaidInitial = rows[rowIndex - 1][8];

        sheet.getRange(rowIndex, 11).setValue("captured");
        sheet.getRange(rowIndex, 12).setValue(new Date());
        sheet.getRange(rowIndex, 13).setValue(data.method);
        if (data.transactionId) sheet.getRange(rowIndex, 14).setValue(data.transactionId);

        const emailSent = rows[rowIndex - 1][14];
        if (emailSent !== "Yes") {
            const fdInvoiceNo = sendToFunnelsdone(name, email, phone, amountPaidInitial, orderId, data.transactionId);
            sendConfirmationEmail(email, name, amountPaidInitial, phone, data.transactionId, orderId, fdInvoiceNo);
            sheet.getRange(rowIndex, 15).setValue("Yes");
        }

        return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Order not found" })).setMimeType(ContentService.MimeType.JSON);
}

// ----------------------------------------------------------------------
// FUNNELSDONE PRIVATE INTEGRATION API v2 + GST PDF INVOICE
// ----------------------------------------------------------------------
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
    const total = Math.max(1, Number(totalAmount) || 1769);
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
          <td><strong>${sanitizeCell(courseName || "Advanced AI Live MasterClass")}</strong><br/><span style="color:#64748b;font-size:10px;">Live Online Educational & Training Program</span></td>
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

function sendToFunnelsdone(name, email, phone, amount, orderId, transactionId) {
    let formattedPhone = String(phone || "").replace(/\D/g, "");
    if (formattedPhone.length === 10) formattedPhone = "+91" + formattedPhone;
    else if (formattedPhone.length > 10 && !formattedPhone.startsWith("+")) formattedPhone = "+" + formattedPhone;

    try {
        const headers = {
            "Authorization": "Bearer " + FUNNELSDONE_CONFIG.PIT_TOKEN,
            "Version": FUNNELSDONE_CONFIG.API_VERSION,
            "Content-Type": "application/json",
            "Accept": "application/json"
        };

        const contactRes = UrlFetchApp.fetch(FUNNELSDONE_CONFIG.API_BASE + "/contacts/upsert", {
            method: "post",
            headers: headers,
            payload: JSON.stringify({
                locationId: FUNNELSDONE_CONFIG.LOCATION_ID,
                name: name || "Learner",
                email: email || "",
                phone: formattedPhone,
                tags: ["advanced_masterclass_paid", "gst_invoice_issued"]
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

        const total = Math.max(1, Number(amount) || 1769);
        const isTest = total === 1;
        const baseAmt = isTest ? 1 : Math.round((total / 1.18) * 100) / 100;
        const todayStr = Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyy-MM-dd");

        const createPayload = {
            altId: FUNNELSDONE_CONFIG.LOCATION_ID,
            altType: "location",
            name: "Advanced AI Live MasterClass",
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
                name: name || "Learner",
                email: email || "",
                phoneNo: formattedPhone,
                address: { countryCode: "IN", state: "TAMILNADU" }
            },
            items: [
                {
                    name: "Advanced AI Live MasterClass",
                    description: "SAC: " + FUNNELSDONE_CONFIG.COMPANY_SAC + " | Razorpay Payment ID: " + (transactionId || ""),
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
                email: email ? [email] : [],
                phoneNo: formattedPhone ? [formattedPhone] : []
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
                    notes: "Paid via Razorpay | Payment ID: " + (transactionId || "") + " | Order ID: " + (orderId || ""),
                    fulfilledAt: new Date().toISOString()
                }),
                muteHttpExceptions: true
            });
        }
        return "TT/26-27/" + nextInvoiceNumber;
    } catch (e) {
        console.error("Failed to sync invoice with FunnelsDone: " + e.toString());
        return null;
    }
}

function sendConfirmationEmail(email, name, amount, phone, paymentId, orderId, fdInvoiceNo) {
    let subject = "🎉 Registration Confirmed & GST Invoice: Tech Tycoon AI Live MasterClass";
    let pdfAttachment = null;
    try {
        pdfAttachment = generateOurGstInvoicePdfBlob(name, email, phone, "Advanced AI Live MasterClass", amount, paymentId, orderId, fdInvoiceNo);
    } catch (e) {}
    
    let htmlBody = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <div style="background-color: #1e1b4b; padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 1px;">TECH TYCOON</h1>
            <p style="color: #818cf8; margin: 10px 0 0; font-size: 16px; font-weight: 600;">Advanced AI Live MasterClass</p>
        </div>
        <div style="padding: 40px 30px; background-color: #ffffff;">
            <h2 style="color: #0f172a; font-size: 22px; margin-top: 0;">Hi ${name},</h2>
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">Your registration for the <strong>Tech Tycoon AI Live MasterClass</strong> is officially confirmed! Your official <strong>GST Tax Invoice (PDF)</strong> is attached to this email.</p>
            
            <div style="background-color: #f1f5f9; border-left: 4px solid #4f46e5; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
                <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">Schedule & Details</h3>
                <p style="margin: 0 0 10px; color: #334155; font-size: 15px;"><strong>Dates:</strong> ${SESSION_DATES}</p>
                <p style="margin: 0 0 10px; color: #334155; font-size: 15px;"><strong>Time:</strong> ${SESSION_TIME}</p>
                <p style="margin: 0 0 10px; color: #334155; font-size: 15px;"><strong>Session Language:</strong> Tamil mix with English</p>
                <p style="margin: 0; color: #334155; font-size: 15px;"><strong>Amount Paid (Incl. 18% GST):</strong> Rs. ${Number(amount || 1769).toLocaleString()}/-</p>
            </div>
            
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">The online classroom link and pre-joining instructions will be shared with you closer to the start of the session.</p>
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">If you have any questions, feel free to reach out to us.</p>
            
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            <p style="color: #94a3b8; font-size: 13px; text-align: center; margin: 0;">Tech Tycoon Digital Solution LLP (GSTIN: ${FUNNELSDONE_CONFIG.COMPANY_GSTIN}) &copy; 2026</p>
        </div>
    </div>
    `;

    try {
        const mailOpts = { htmlBody: htmlBody, name: "Tech Tycoon MasterClass" };
        if (pdfAttachment) mailOpts.attachments = [pdfAttachment];
        GmailApp.sendEmail(email, subject, "Your registration is confirmed. Schedule: " + SESSION_DATES + " at " + SESSION_TIME, mailOpts);
    } catch (e) {
        console.warn("Mail send error for " + email + ": " + e.toString());
    }
}
