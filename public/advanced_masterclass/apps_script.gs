/**
 * GOOGLE APPS SCRIPT: Tech Tycoon MasterClass Payment Handler with Webhook
 * 1. Targeted Spreadsheet: Advanced_Masterclass (ID: 1aczs49JlSNZGyg7Q_8BJkZYkqZQmU_pjwOwll0-GvVE)
 * 2. Razorpay API Integration: Automated Order Creation
 * 3. Razorpay Webhook Integration: Secure Signature Verification
 */

const SPREADSHEET_ID = "1aczs49JlSNZGyg7Q_8BJkZYkqZQmU_pjwOwll0-GvVE";
const SHEET_NAME = "Sheet1";

// RAZORPAY LIVE CREDENTIALS
const RZP_KEY_ID = "rzp_live_T2CbVONQc6qrqj";
const RZP_KEY_SECRET = "0ZmzKfvHIwbnvkTCPxkWC1a6";

// WEBHOOK SECRET (DEFINE YOURS HERE AND IN RAZORPAY DASHBOARD)
const WEBHOOK_SECRET = "TECHTYCOON";

function doPost(e) {
    try {
        const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        const sheet = ss.getSheetByName(SHEET_NAME);
        if (!sheet) throw new Error("Sheet '" + SHEET_NAME + "' not found in " + SPREADSHEET_ID);

        // --- WEBHOOK VERIFICATION (IF SENT FROM RAZORPAY) ---
        const headers = e.headers || {};
        // Google Apps Script usually lowercases headers, but check both just in case
        const rzpSignature = headers['X-Razorpay-Signature'] || headers['x-razorpay-signature'];

        if (rzpSignature) {
            // It's a webhook request
            const rawBody = e.postData.contents;
            if (!verifySignature(rawBody, rzpSignature)) {
                return ContentService.createTextOutput("Invalid Signature").setStatusCode(400);
            }

            // Signature is valid, parse the webhook data
            const webhookData = JSON.parse(rawBody);
            return handleRazorpayWebhook(sheet, webhookData);
        }

        // --- NORMAL CLIENT REQUESTS ---
        const data = JSON.parse(e.postData.contents);

        // ACTION: INITIAL LEAD & ORDER CREATION
        if (data.action === "record_lead" || !data.action) {
            return handleLeadAndOrder(sheet, data);
        }

        // ACTION: CLIENT-SIDE PAYMENT SUCCESS (Fallback Backup)
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
        return ContentService.createTextOutput(JSON.stringify({
            success: false,
            error: err.toString()
        })).setMimeType(ContentService.MimeType.JSON);
    }
}

/**
 * Creates a real Razorpay Order and logs the lead
 */
function handleLeadAndOrder(sheet, data) {
    const amountInPaise = data.amount * 100;
    const timestamp = new Date();

    // 1. Create Razorpay Order via API
    const rzpOrder = createRazorpayOrder(amountInPaise);
    if (!rzpOrder || !rzpOrder.id) {
        throw new Error("Failed to generate Razorpay Order ID.");
    }

    const orderId = rzpOrder.id; // Real Razorpay Order ID (order_...)
    
    // Updated Logic: ₹99 Executive Offer Pricing
    const payableTotal = data.amount; 
    const balance = payableTotal - data.amount;

    // 2. Log to Spreadsheet
    sheet.appendRow([
        timestamp,           // A: Timestamp
        data.name,           // B: Name
        data.email,          // C: Email
        data.phone,          // D: Whatsapp Number
        "N/A",               // E: Age (Optional: you can change this to data.userType to log profession)
        `Executive Offer (₹${data.amount})`, // F: Registration Fee Name
        orderId,             // G: Payable Order ID (Real Razorpay ID)
        payableTotal,        // H: Payable Total (99)
        data.amount,         // I: Amount Paid (99)
        balance,             // J: Balance Payment (0)
        "checkout-started",  // K: Payable Status
        timestamp,           // L: Payable Last Updated
        "N/A",               // M: Payment Method
        "N/A",               // N: Transaction ID
        "No"                 // O: Email Sent
    ]);

    return ContentService.createTextOutput(JSON.stringify({
        success: true,
        orderId: orderId
    })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Calls Razorpay API to create an order
 */
function createRazorpayOrder(amount) {
    const url = "https://api.razorpay.com/v1/orders";
    const auth = "Basic " + Utilities.base64Encode(RZP_KEY_ID + ":" + RZP_KEY_SECRET);

    const payload = {
        amount: amount,
        currency: "INR",
        receipt: "rcpt_" + Math.random().toString(36).substr(2, 9)
    };

    const options = {
        method: "POST",
        headers: { "Authorization": auth, "Content-Type": "application/json" },
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(url, options);
    return JSON.parse(response.getContentText());
}

/**
 * Verifies Razorpay Webhook HMAC SHA256 Signature
 */
function verifySignature(rawBody, signatureProvided) {
    const computedSignatureBytes = Utilities.computeHmacSha256Signature(rawBody, WEBHOOK_SECRET);

    // Convert byte array to hex string
    let computedSignatureHex = computedSignatureBytes.map(function (byte) {
        let v = (byte < 0) ? 256 + byte : byte;
        return ("0" + v.toString(16)).slice(-2);
    }).join('');

    return computedSignatureHex === signatureProvided;
}

/**
 * Processes valid Razorpay Webhook Payload
 */
function handleRazorpayWebhook(sheet, eventData) {
    const eventType = eventData.event; // e.g., "payment.captured" or "order.paid"

    // We primarily care about successful captures
    if (eventType !== "payment.captured" && eventType !== "order.paid") {
        return ContentService.createTextOutput("Event ignored: " + eventType).setStatusCode(200);
    }

    let orderId = "";
    let transactionId = "";
    let paymentMethod = "Webhook";

    if (eventType === "payment.captured" && eventData.payload && eventData.payload.payment && eventData.payload.payment.entity) {
        orderId = eventData.payload.payment.entity.order_id;
        transactionId = eventData.payload.payment.entity.id;
        paymentMethod = eventData.payload.payment.entity.method || "Webhook";
    } else if (eventType === "order.paid" && eventData.payload && eventData.payload.order && eventData.payload.order.entity) {
        orderId = eventData.payload.order.entity.id;
        paymentMethod = "Webhook Event (Order Paid)";
    }

    if (!orderId) {
        return ContentService.createTextOutput("No Order ID found in Webhook Event payload").setStatusCode(200);
    }

    return handlePaymentSuccess(sheet, {
        orderId: orderId,
        transactionId: transactionId,
        method: paymentMethod
    });
}

/**
 * Process successful payment update (Called by Webhook or Client)
 */
function handlePaymentSuccess(sheet, data) {
    const rows = sheet.getDataRange().getValues();
    const orderId = data.orderId;
    let rowIndex = -1;

    for (let i = 1; i < rows.length; i++) {
        if (rows[i][6] === orderId) { // Column G
            rowIndex = i + 1;
            break;
        }
    }

    if (rowIndex > -1) {
        // Prevent duplicate processing if webhook & client both hit at the same time
        const currentStatus = rows[rowIndex - 1][10]; // Column K
        if (currentStatus === "captured" || currentStatus === "webhook-captured") {
            // Already processed, acknowledge receipt.
            return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Already captured" })).setMimeType(ContentService.MimeType.JSON);
        }

        const amountPaidInitial = rows[rowIndex - 1][8];
        const name = rows[rowIndex - 1][1];
        const email = rows[rowIndex - 1][2];

        sheet.getRange(rowIndex, 11).setValue("captured");
        sheet.getRange(rowIndex, 12).setValue(new Date());

        // Only update method/tx if it wasn't captured before, or if provided valid ones (webhook is better source of truth)
        sheet.getRange(rowIndex, 13).setValue(data.method);
        if (data.transactionId) {
            sheet.getRange(rowIndex, 14).setValue(data.transactionId);
        }

        // Check if email already sent
        const emailSent = rows[rowIndex - 1][14]; // Column O
        if (emailSent !== "Yes") {
            // Automatically send email
            sendConfirmationEmail(email, name, amountPaidInitial);
            sheet.getRange(rowIndex, 15).setValue("Yes");
        }

        return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Order not found" })).setMimeType(ContentService.MimeType.JSON);
}

function sendConfirmationEmail(email, name, amount) {
    let subject = "Welcome to the Executive Masterclass!";
    let body = `Hi ${name},\n\nWelcome! Your registration for the Executive Masterclass (₹${amount}) is confirmed. You now have everything you need to master AI-Powered Digital Marketing Strategy.\n\nMore details on how to join the session will be sent to you shortly.\n\nRegards,\nTeam Tech Tycoon`;

    try {
        GmailApp.sendEmail(email, subject, body);
    } catch (e) {
        console.warn("Mail send error for " + email + ": " + e.toString());
    }
}

function doGet() {
    return ContentService.createTextOutput("Tech Tycoon MasterClass Ledger API with Webhook Support is Online.");
}
