/**
 * ============================================================================
 * TECH TYCOON — ULTIMATE CLAUDE RESOURCES REGISTRATION & PAYMENT AUTOMATION
 * Platform: course.techtycoon.in/claude_resources
 * ============================================================================
 * 
 * SETUP INSTRUCTIONS (Takes 1 minute):
 * 1. Open Google Sheets (create a new blank sheet or use your existing sheet).
 * 2. Click "Extensions" -> "Apps Script".
 * 3. Delete any existing code, paste this entire file, and click "Save" (disk icon).
 * 4. Click "Deploy" (top right) -> "New deployment".
 * 5. Select type: "Web app".
 * 6. Configuration:
 *    - Description: "Claude Resources Registration API"
 *    - Execute as: "Me" (your email)
 *    - Who has access: "Anyone" (IMPORTANT: must be "Anyone", NOT "Only myself")
 * 7. Click "Deploy". Authorize permissions when prompted (Advanced -> Go to Untitled project -> Allow).
 * 8. Copy the "Web app URL" (ends in /exec).
 * 9. Paste this URL into `assets/js/config.js` under `appsScriptUrl`.
 * ============================================================================
 */

const SHEET_NAME = "Claude_Resources_Leads";
const HEADERS = [
  "Timestamp",
  "Full Name",
  "Email Address",
  "Phone / WhatsApp",
  "Coupon Code",
  "Original Price (₹)",
  "Discount (₹)",
  "ChatGPT Hacks Addon",
  "Final Amount (₹)",
  "Payment Status",
  "Payment ID",
  "Order ID",
  "Page URL"
];

// Optional: Link to send automatically via email upon confirmed payment
const ACCESS_DRIVE_LINK = "https://drive.google.com/drive/folders/your-claude-skills-folder";

function getTargetSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  
  // Initialize headers if empty
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setBackground("#0F172A");
    headerRange.setFontColor("#FFFFFF");
    headerRange.setFontWeight("bold");
    headerRange.setFontFamily("Inter");
    headerRange.setHorizontalAlignment("center");
    sheet.setFrozenRows(1);
    
    // Auto-adjust column widths
    for (let c = 1; c <= HEADERS.length; c++) {
      sheet.setColumnWidth(c, 160);
    }
  }
  return sheet;
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (err) {
    return jsonResponse({ success: false, error: "Server busy. Please try again." });
  }

  try {
    let data;
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    } else {
      data = {};
    }

    const sheet = getTargetSheet();
    const action = String(data.action || "registration").toLowerCase();
    const timestamp = data.date || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    const name = String(data.name || "").trim();
    const email = String(data.email || "").trim().toLowerCase();
    const phone = String(data.phone || "").trim();
    const coupon = String(data.coupon || "NONE").trim().toUpperCase();
    const originalPrice = Number(data.originalPrice || data.originalAmount || 999);
    const discount = Number(data.discount || (coupon === "AMIABLE" ? 500 : 0));
    const addon = String(data.addon || "No").trim();
    const finalAmount = Number(data.amount || data.finalAmount || (coupon === "AMIABLE" ? 499 : 999));
    const status = String(data.status || (action === "payment_success" ? "PAID" : "INITIATED")).toUpperCase();
    const paymentId = String(data.paymentId || data.transactionId || "").trim();
    const orderId = String(data.orderId || "").trim();
    const pageUrl = String(data.pageUrl || "course.techtycoon.in/claude_resources").trim();

    // If payment_success: check if a recent row for this email/phone exists and update it
    let updated = false;
    if (action === "payment_success" && (email || phone) && sheet.getLastRow() > 1) {
      const lastRow = sheet.getLastRow();
      const numRows = Math.min(lastRow - 1, 50); // Search last 50 entries
      const startRow = lastRow - numRows + 1;
      const values = sheet.getRange(startRow, 1, numRows, HEADERS.length).getValues();

      for (let i = values.length - 1; i >= 0; i--) {
        const rowEmail = String(values[i][2] || "").trim().toLowerCase();
        const rowPhone = String(values[i][3] || "").trim();
        const rowStatus = String(values[i][9] || values[i][8] || "").toUpperCase();

        if ((rowEmail === email || (phone && rowPhone === phone)) && rowStatus !== "PAID") {
          const targetRowIndex = startRow + i;
          sheet.getRange(targetRowIndex, 10).setValue("PAID"); // Payment Status
          sheet.getRange(targetRowIndex, 11).setValue(paymentId); // Payment ID
          if (orderId) sheet.getRange(targetRowIndex, 12).setValue(orderId);
          updated = true;
          break;
        }
      }
    }

    // If not updated an existing row, append a new row
    if (!updated) {
      sheet.appendRow([
        timestamp,
        name,
        email,
        phone,
        coupon,
        originalPrice,
        discount,
        addon,
        finalAmount,
        status,
        paymentId,
        orderId,
        pageUrl
      ]);
    }

    // Optional: send automated delivery email upon payment confirmation
    if (status === "PAID" && email && ACCESS_DRIVE_LINK && !ACCESS_DRIVE_LINK.includes("your-claude-skills-folder")) {
      try {
        sendAccessEmail(email, name, finalAmount, paymentId);
      } catch (mailErr) {
        console.error("Email send error:", mailErr);
      }
    }

    return jsonResponse({
      success: true,
      action: action,
      status: status,
      paymentId: paymentId,
      message: "Data successfully recorded in Google Sheet"
    });

  } catch (error) {
    console.error("doPost error:", error);
    return jsonResponse({ success: false, error: error.toString() });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return jsonResponse({
    status: "online",
    message: "Tech Tycoon Claude Resources API is active and ready to accept registrations.",
    headers: HEADERS
  });
}

function sendAccessEmail(email, name, amount, paymentId) {
  const subject = "🎉 Access Granted: 4,000+ Ultimate Claude Skills Library | TechTycoon";
  const body = 
`Hello ${name || "Creator"},

Thank you for your enrollment in the Ultimate Claude Skills Library!

Your payment of ₹${amount} is confirmed (Payment ID: ${paymentId}).

Access Your Entire Library Here:
${ACCESS_DRIVE_LINK}

What's Inside:
- 4,000+ Production-Ready Claude Skills across 130+ categories (.md files)
- 2,500+ Claude AI Prompts Vault
- Quick Copy-and-Paste Instructions Guide

Need any assistance?
Message us on WhatsApp: +91 75581 33039 / +91 70103 40494
Email: techtycoondigitalsolutions@gmail.com

Best regards,
Antony Praveen & The TechTycoon Team
https://course.techtycoon.in
`;

  GmailApp.sendEmail(email, subject, body, {
    name: "TechTycoon"
  });
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
