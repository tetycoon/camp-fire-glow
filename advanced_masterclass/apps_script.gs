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
                    pageUrl: "https://aitycoon.in/advanced_masterclass",
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
    const amountInPaise = data.amount * 100;
    const timestamp = new Date();

    const isIntl = !!data.isInternational;
    const rzpOrder = createRazorpayOrder(amountInPaise, isIntl, data.name, data.email);
    if (!rzpOrder || !rzpOrder.id) {
        throw new Error("Failed to generate Razorpay Order ID. Response: " + JSON.stringify(rzpOrder));
    }
    const orderId = rzpOrder.id;
    
    let payableTotal = data.amount; 
    if (data.amount === 500) payableTotal = 6999;
    else if (data.amount === 4999) payableTotal = 4999;
    const balance = payableTotal - data.amount;

    const feeName = data.amount === 500 ? "Partial Enrollment (₹500)" : (data.amount === 4999 ? "Full Enrollment (₹4,999)" : `Custom/Test Enrollment (₹${data.amount})`);

    sheet.appendRow([
        timestamp, data.name, data.email, data.phone, data.profession || "N/A", 
        feeName, orderId, payableTotal, data.amount, balance, "checkout-started", 
        timestamp, "N/A", "N/A", "No"
    ]);

    return ContentService.createTextOutput(JSON.stringify({ success: true, orderId: orderId })).setMimeType(ContentService.MimeType.JSON);
}

function createRazorpayOrder(amount, isIntl, customerName, customerEmail) {
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
            customer_name: customerName || "",
            customer_email: customerEmail || ""
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
            sendConfirmationEmail(email, name, amountPaidInitial);
            sheet.getRange(rowIndex, 15).setValue("Yes");
            
            // Send the customer data to Funnelsdone
            sendToFunnelsdone(name, email, phone, amountPaidInitial, orderId, data.transactionId);
        }

        return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Order not found" })).setMimeType(ContentService.MimeType.JSON);
}

// ----------------------------------------------------------------------
// NEW FUNCTION: Sends successful payment data to Funnelsdone
// ----------------------------------------------------------------------
function sendToFunnelsdone(name, email, phone, amount, orderId, transactionId) {
    if (!FUNNELSDONE_WEBHOOK_URL || FUNNELSDONE_WEBHOOK_URL === "YOUR_FUNNELSDONE_WEBHOOK_URL_HERE") {
        console.warn("Funnelsdone Webhook URL not set. Skipping.");
        return;
    }
    
    let firstName = name;
    let lastName = "";
    const nameParts = name.trim().split(" ");
    if (nameParts.length > 1) {
        firstName = nameParts[0];
        lastName = nameParts.slice(1).join(" ");
    }
    
    // --- MAGIC FIX: Ensure Phone Number has a '+' for FunnelsDone ---
    let formattedPhone = phone.toString().trim();
    if (formattedPhone.length > 0 && !formattedPhone.startsWith("+")) {
        if (formattedPhone.startsWith("91") && formattedPhone.length > 10) {
            formattedPhone = "+" + formattedPhone;
        } else {
            formattedPhone = "+91" + formattedPhone;
        }
    }
    
    const payload = {
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: formattedPhone, // FunnelsDone will now accept this!
        amount_paid: amount,
        order_id: orderId,
        transaction_id: transactionId,
        tags: "masterclass_paid"
    };

    const options = {
        method: "POST",
        contentType: "application/json",
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
    };

    try {
        UrlFetchApp.fetch(FUNNELSDONE_WEBHOOK_URL, options);
    } catch (e) {
        console.error("Failed to send to Funnelsdone: " + e.toString());
    }
}

function sendConfirmationEmail(email, name, amount) {
    let subject = "Welcome to the Tech Tycoon AI Live MasterClass!";
    
    let htmlBody = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <div style="background-color: #1e1b4b; padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 1px;">TECH TYCOON</h1>
            <p style="color: #818cf8; margin: 10px 0 0; font-size: 16px; font-weight: 600;">Advanced AI Live MasterClass</p>
        </div>
        <div style="padding: 40px 30px; background-color: #ffffff;">
            <h2 style="color: #0f172a; font-size: 22px; margin-top: 0;">Hi ${name},</h2>
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">Your registration for the <strong>Tech Tycoon AI Live MasterClass</strong> is officially confirmed!</p>
            
            <div style="background-color: #f1f5f9; border-left: 4px solid #4f46e5; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
                <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">Schedule & Details</h3>
                <p style="margin: 0 0 10px; color: #334155; font-size: 15px;"><strong>Dates:</strong> ${SESSION_DATES}</p>
                <p style="margin: 0 0 10px; color: #334155; font-size: 15px;"><strong>Time:</strong> ${SESSION_TIME}</p>
                <p style="margin: 0 0 10px; color: #334155; font-size: 15px;"><strong>Session Language:</strong> Tamil mix with English</p>
                <p style="margin: 0; color: #334155; font-size: 15px;"><strong>Amount Paid:</strong> Rs. ${amount.toLocaleString()}/-</p>
            </div>
            
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">The online classroom link and pre-joining instructions will be shared with you closer to the start of the session.</p>
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">If you have any questions, feel free to reach out to us.</p>
            
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            <p style="color: #94a3b8; font-size: 13px; text-align: center; margin: 0;">Tech Tycoon Digital Solutions &copy; 2026</p>
        </div>
    </div>
    `;

    try {
        GmailApp.sendEmail(email, subject, "Your registration is confirmed. Schedule: " + SESSION_DATES + " at " + SESSION_TIME, {
            htmlBody: htmlBody, name: "Tech Tycoon MasterClass"
        });
    } catch (e) {
        console.warn("Mail send error for " + email + ": " + e.toString());
    }
}
