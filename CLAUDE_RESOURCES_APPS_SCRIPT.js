/**
 * ============================================================================
 * TECH TYCOON — 250+ ULTIMATE CLAUDE SKILLS & PROMPTS LIBRARY
 * DEDICATED GOOGLE APPS SCRIPT (RAZORPAY + GOOGLE SHEETS + INSTANT EMAIL DELIVERY)
 * ============================================================================
 *
 * WORKFLOW:
 * 1. User clicks "Get Instant Access" on course.techtycoon.in/claude_resources
 *    and submits Name, Email, Phone, Coupon (AMIABLE), and optional ChatGPT Hacks add-on.
 * 2. Script creates an official Razorpay Order and logs an "INITIATED" row in Sheet1.
 * 3. Once payment is completed on Razorpay, the script verifies the payment with
 *    Razorpay API, updates Sheet1 to "✅ PAID", generates a clean Invoice PDF (without GST),
 *    and immediately emails the resource download links + Invoice PDF to the user.
 *    (Zero Masterclass/Webinar messages, zero WhatsApp/Calendar triggers — 100% Email delivery).
 * ============================================================================
 */

const SHEET_NAME_REG = "Sheet1";
const SHEET_NAME_LOGS = "Logs";
const SHEET_NAME_LANDING_LEADS = "Landing_Leads";
const LANDING_LEAD_HEADERS = [
  "Timestamp", "Lead ID", "Full Name", "Phone", "Email",
  "Page URL", "UTM Source", "UTM Medium", "UTM Campaign", "GCLID", "FBCLID", "User Agent"
];

// ============================================================================
// INSTANT EMAIL DELIVERY RESOURCE LINKS
// ============================================================================
const CLAUDE_RESOURCES_DOWNLOAD_URL = "https://drive.google.com/uc?export=download&id=1ENLxfIPsnqjhQM7jl9NBytW56Cj69aWD";
const CHATGPT_HACKS_DOWNLOAD_URL = "https://drive.google.com/uc?export=download&id=1Zu6GYAaZ-x5gb8xjyb3LwCW8q2oiBfCj";

// Authorized emails allowed to test the live payment & email delivery workflow for ₹1
const TEST_EMAILS = [
  "ambroseselva001@gmail.com",
  "techtycoondigitalsolutions@gmail.com",
  "techtycoondigitors@gmail.com"
];

// Company Details for Attached Invoice PDF (Without GST)
const COMPANY_CONFIG = {
  COMPANY_NAME: "TECH TYCOON DIGITAL SOLUTION LLP",
  COMPANY_PHONE: "7558133039",
  COMPANY_ALT_PHONE: "7010340494",
  COMPANY_EMAIL: "techtycoondigitalsolutions@gmail.com",
  COMPANY_WEBSITE: "https://www.techtycoon.in/",
  ADDRESS_LINE1: "No. 31, Ramalinga Nagar",
  CITY: "Madipakkam, Chennai",
  STATE: "TAMILNADU",
  POSTAL_CODE: "600091"
};

/**
 * ============================================================================
 * STEP 1: SELECT "sendResourcesToExistingCustomers" IN THE TOOLBAR AND CLICK RUN!
 * - Placed at the very top of the file so Google Apps Script's OAuth scanner
 *   immediately detects MailApp.sendEmail + UrlFetchApp + SpreadsheetApp permissions.
 * - Click "Review permissions" -> Choose your Google account -> Advanced -> Allow.
 * - Automatically sends:
 *     * ₹899 customers (e.g. Ekambaram M V) -> 2 Resources (Claude + ChatGPT Hacks) + Invoice
 *     * ₹499 customers (e.g. Muralikrishnan) -> 1 Resource (Only Claude Resources) + Invoice
 * ============================================================================
 */
function sendResourcesToExistingCustomers() {
  // Direct top-level references so Apps Script OAuth scanner prompts for email permission:
  const quota = MailApp.getRemainingDailyQuota();
  Logger.log("Remaining daily email quota: " + quota);
  UrlFetchApp.fetch("https://api.razorpay.com");
  const result = reconcileClaudeResourcesRows();
  Logger.log(result);
  return result;
}

// ----------------------------------------------------------------------------
// SCRIPT PROPERTIES & RAZORPAY CREDENTIALS
// ----------------------------------------------------------------------------
function getScriptSecret(key) {
  const props = PropertiesService.getScriptProperties();
  const val = props ? props.getProperty(key) : "";
  if (!val || !String(val).trim()) {
    throw new Error("Missing required Script Property: " + key);
  }
  return String(val).trim();
}

function getOptionalScriptSecret(key) {
  try {
    const props = PropertiesService.getScriptProperties();
    return props ? String(props.getProperty(key) || "").trim() : "";
  } catch (e) {
    return "";
  }
}

function getRazorpayKeyId(isIntl) {
  const secretKeyName = isIntl ? "RAZORPAY_KEY_ID_INTL" : "RAZORPAY_KEY_ID";
  const configuredKey = getOptionalScriptSecret(secretKeyName);
  return configuredKey || (isIntl ? "rzp_live_gfoS1OjC8tvWjP" : "rzp_live_T2CbVONQc6qrqj");
}

function isAuthorizedLiveTest(email, amount) {
  const cleanEmail = String(email || "").trim().toLowerCase();
  const numAmount = Number(amount) || 0;
  return TEST_EMAILS.indexOf(cleanEmail) !== -1 && numAmount === 1;
}

// ----------------------------------------------------------------------------
// WEBHOOK ENTRYPOINTS (doGet / doPost)
// ----------------------------------------------------------------------------
function doGet(e) {
  const params = (e && e.parameter) ? e.parameter : {};
  if (params.action === "reconcile") {
    return ContentService.createTextOutput(reconcileClaudeResourcesRows());
  }
  return ContentService.createTextOutput("OK — Tech Tycoon Claude Resources Email Delivery API Active");
}

function doPost(e) {
  const rawData = (e && e.postData && e.postData.contents) ? e.postData.contents : "{}";
  writeToLogs("RAW_POST", rawData.substring(0, 500));

  try {
    const body = JSON.parse(rawData);

    if (body.action === "saveLandingLead") {
      return createJsonResponse(saveLandingLead(body));
    }

    if (body.action === "reconcile") {
      return createJsonResponse({ success: true, message: reconcileClaudeResourcesRows() });
    }

    // 1. Payment Confirmation from Website after Razorpay Checkout completes
    if (body.paymentSuccess === true || body.action === "payment_success") {
      const res = updatePaymentStatus(body);
      return createJsonResponse(res);
    }

    // 2. Direct Razorpay Server Webhook (payment.captured / order.paid)
    if (body.event === "payment.captured" || body.event === "order.paid") {
      const paymentEntity = body.payload && body.payload.payment && body.payload.payment.entity;
      if (!paymentEntity || !paymentEntity.order_id || !paymentEntity.id) {
        return createJsonResponse({ success: false, error: "Invalid webhook payment entity" });
      }
      const notes = paymentEntity.notes || {};
      const noteProductKey = String(notes.product_key || notes.product || body.target_product || "").trim().toLowerCase();
      if (noteProductKey && noteProductKey !== "claude_resources" && noteProductKey !== "claude-skills") {
        writeToLogs("ISOLATION_SKIP", "Ignored non-claude_resources webhook (" + noteProductKey + "): " + paymentEntity.id);
        return createJsonResponse({ success: false, ignored: true });
      }
      const res = processVerifiedClaudePayment(
        paymentEntity.order_id,
        paymentEntity.id,
        false,
        paymentEntity.amount ? Math.round(Number(paymentEntity.amount) / 100) : undefined,
        {
          email: paymentEntity.email || notes.email || "",
          name: notes.name || "",
          phone: paymentEntity.contact || notes.phone || "",
          course: notes.course || "",
          addon: notes.addon || (notes.has_chatgpt_addon === "YES" ? "Yes - ChatGPT Hacks (+₹400)" : "No")
        }
      );
      return createJsonResponse(res);
    }

    // 3. New Registration & Order Creation
    if (body.name && body.email && body.phone) {
      const orderId = createRazorpayOrder(body);
      saveToSheet(body, orderId);
      saveRegistrationToLandingLeads(body, orderId);
      return createJsonResponse({ success: true, orderId: orderId, leadId: body.leadId || orderId });
    }

    return createJsonResponse({ success: false, message: "Unknown action" });
  } catch (err) {
    writeToLogs("ERROR", err.message);
    return createJsonResponse({ success: false, error: err.message });
  }
}

// ----------------------------------------------------------------------------
// RAZORPAY ORDER CREATION & VERIFICATION
// ----------------------------------------------------------------------------
function validateClaudeResourcesAmount(data) {
  const email = String(data.email || "").toLowerCase().trim();
  if (isAuthorizedLiveTest(email, data.amount)) return 1;
  const reqAmount = Number(data.amount) || 499;
  if (reqAmount < 99) return 499;
  return Math.round(reqAmount);
}

function createRazorpayOrder(data) {
  const isInternational = Boolean(data.countryCode && data.countryCode !== "+91");
  const keyId = getRazorpayKeyId(isInternational);
  const keySecret = getScriptSecret(isInternational ? "RAZORPAY_KEY_SECRET_INTL" : "RAZORPAY_KEY_SECRET");
  const validAmount = validateClaudeResourcesAmount(data);
  const hasChatGptAddon =
    Number(validAmount) >= 899 ||
    String(data.addon || "").toLowerCase().includes("chatgpt") ||
    String(data.course || "").toLowerCase().includes("chatgpt") ||
    String(data.hasPdfMaterial || "").toUpperCase() === "YES";

  const courseName = hasChatGptAddon
    ? "250+ Ultimate Claude Skills & Prompts + ChatGPT Hacks Bundle"
    : "250+ Ultimate Claude Skills & 2,500+ Prompts Library";

  const credentials = Utilities.base64Encode(keyId + ":" + keySecret);
  const options = {
    method: "post",
    headers: { Authorization: "Basic " + credentials, "Content-Type": "application/json" },
    payload: JSON.stringify({
      amount: validAmount * 100,
      currency: "INR",
      notes: {
        product_key: "claude_resources",
        course: courseName,
        has_chatgpt_addon: hasChatGptAddon ? "YES" : "NO",
        addon: hasChatGptAddon ? "ChatGPT Hacks (+₹400)" : "No",
        name: String(data.name || "").trim(),
        email: String(data.email || "").trim().toLowerCase(),
        phone: String(data.phone || "").trim(),
        amount_paid: validAmount
      }
    }),
    muteHttpExceptions: true
  };
  const response = UrlFetchApp.fetch("https://api.razorpay.com/v1/orders", options);
  const resText = response.getContentText();
  if (response.getResponseCode() !== 200) {
    throw new Error("Razorpay Order Creation Failed: " + resText);
  }
  return JSON.parse(resText).id;
}

function verifyRazorpayPaymentSignature(orderId, paymentId, signature, isIntl) {
  const cleanOrderId = String(orderId || "").trim();
  const cleanPaymentId = String(paymentId || "").trim();
  const cleanSignature = String(signature || "").trim().toLowerCase();
  if (!/^order_[A-Za-z0-9]+$/.test(cleanOrderId)) return false;
  if (!/^pay_[A-Za-z0-9]+$/.test(cleanPaymentId)) return false;
  if (!/^[0-9a-f]{64}$/.test(cleanSignature)) return false;

  const payload = cleanOrderId + "|" + cleanPaymentId;
  const primaryKey = isIntl ? "RAZORPAY_KEY_SECRET_INTL" : "RAZORPAY_KEY_SECRET";
  const secret = getScriptSecret(primaryKey);
  const expectedSig = computeHmacSha256Hex(payload, secret);
  if (constantTimeEquals(expectedSig, cleanSignature)) return true;

  const altSecret = getOptionalScriptSecret("RAZORPAY_KEY_SECRET_INTL");
  if (altSecret) {
    const altExpected = computeHmacSha256Hex(payload, altSecret);
    if (constantTimeEquals(altExpected, cleanSignature)) return true;
  }
  return false;
}

function verifyPaymentWithRazorpayServer(orderId, paymentId, expectedAmountInr, isIntl) {
  const cleanOrderId = String(orderId || "").trim();
  const cleanPaymentId = String(paymentId || "").trim();
  const expectedPaise = Math.round(Number(expectedAmountInr) * 100);

  const keyId = getRazorpayKeyId(isIntl);
  const keySecret = getScriptSecret(isIntl ? "RAZORPAY_KEY_SECRET_INTL" : "RAZORPAY_KEY_SECRET");
  const credentials = Utilities.base64Encode(keyId + ":" + keySecret);
  const url = "https://api.razorpay.com/v1/payments/" + encodeURIComponent(cleanPaymentId);
  const res = UrlFetchApp.fetch(url, {
    method: "get",
    headers: { Authorization: "Basic " + credentials, "Content-Type": "application/json" },
    muteHttpExceptions: true
  });

  if (res.getResponseCode() !== 200) {
    throw new Error("Razorpay API rejected payment ID (" + res.getResponseCode() + ").");
  }
  const payment = JSON.parse(res.getContentText() || "{}");
  if (!payment || payment.id !== cleanPaymentId) {
    throw new Error("Payment record mismatch.");
  }
  if (payment.order_id !== cleanOrderId) {
    throw new Error("Payment belongs to a different order.");
  }
  if (payment.status !== "captured" && payment.status !== "authorized") {
    throw new Error("Payment status is '" + (payment.status || "unknown") + "', expected 'captured'.");
  }
  if (expectedPaise >= 100 && Number(payment.amount) !== expectedPaise) {
    throw new Error("Razorpay amount (" + payment.amount + " paise) does not match expected order amount (" + expectedPaise + " paise).");
  }
  return payment;
}

function updatePaymentStatus(data) {
  const orderId = data.razorpay_order_id || data.orderId || "";
  const paymentId = data.razorpay_payment_id || data.transactionId || data.paymentId || "";
  const signature = data.razorpay_signature || "";
  const isInternational = Boolean(data.countryCode && data.countryCode !== "+91");

  if (!orderId || !paymentId || !signature) {
    writeToLogs("SECURITY_REJECT", "Missing required Razorpay verification fields for order: " + orderId);
    throw new Error("Missing razorpay_order_id, razorpay_payment_id, or razorpay_signature.");
  }

  const sigOk = verifyRazorpayPaymentSignature(orderId, paymentId, signature, isInternational);
  if (!sigOk) {
    writeToLogs("SECURITY_REJECT", "Invalid Razorpay signature for order: " + orderId);
    throw new Error("Payment signature verification failed.");
  }

  return processVerifiedClaudePayment(orderId, paymentId, isInternational, data.amount, data);
}

// ----------------------------------------------------------------------------
// INSTANT EMAIL DELIVERY (RESOURCES + GST INVOICE PDF)
// ----------------------------------------------------------------------------
function allocateNextInvoiceNumber(paymentId, orderId, isTest) {
  const cleanSuffix = String(paymentId || orderId || Date.now()).replace(/[^A-Za-z0-9]/g, "").slice(-6).toUpperCase();
  if (isTest) {
    return "TEST-TT/26-27/" + cleanSuffix;
  }
  try {
    const props = PropertiesService.getScriptProperties();
    if (props) {
      const currentSeq = Number(props.getProperty("CLAUDE_INVOICE_SEQ") || "1000") + 1;
      props.setProperty("CLAUDE_INVOICE_SEQ", String(currentSeq));
      return "TT/26-27/CR-" + currentSeq;
    }
  } catch (e) {}
  return "TT/26-27/" + cleanSuffix;
}

function sendClaudeResourcesEmail(email, name, totalAmount, paymentId, orderId, phone, modeOrLang, batchOrCourse) {
  const numAmount = Math.round(Number(totalAmount) || 499);
  const combinedMeta = (String(modeOrLang || "") + " " + String(batchOrCourse || "")).toLowerCase();
  // ₹899+ = BOTH Resources (Claude Resources + ChatGPT Hacks)
  // ₹499  = ONLY Claude Resources
  // ₹1    = Authorized test (check if ChatGPT Hacks add-on was selected)
  const hasChatGptAddon =
    numAmount >= 899 ||
    (numAmount === 1 && (combinedMeta.includes("chatgpt") || combinedMeta.includes("hacks") || combinedMeta.includes("899")));

  const claudeDownloadUrl = getOptionalScriptSecret("CLAUDE_RESOURCES_DOWNLOAD_URL") || CLAUDE_RESOURCES_DOWNLOAD_URL;
  const chatGptDownloadUrl = getOptionalScriptSecret("CHATGPT_HACKS_DOWNLOAD_URL") || CHATGPT_HACKS_DOWNLOAD_URL;

  const courseTitle = hasChatGptAddon
    ? "250+ Ultimate Claude Skills & Prompts + ChatGPT Hacks Bundle"
    : "250+ Ultimate Claude Skills & 2,500+ Prompts Library";

  const isTest = isAuthorizedLiveTest(email, totalAmount);
  const officialInvoiceNo = allocateNextInvoiceNumber(paymentId, orderId, isTest);

  // Generate official Invoice PDF attachment (Without GST)
  let pdfAttachment = null;
  try {
    pdfAttachment = generateOurInvoicePdfBlob(name, email, phone, courseTitle, totalAmount || 499, paymentId, orderId, officialInvoiceNo);
  } catch (pdfErr) {
    writeToLogs("PDF_GEN_ERROR", pdfErr.message);
  }

  const subject = "🎉 Instant Access Unlocked & Invoice: " + courseTitle;

  const addonSectionHtml = hasChatGptAddon
    ? '<div style="background:linear-gradient(135deg,#EFF6FF 0%,#DBEAFE 100%);border:2px dashed #2563EB;border-radius:18px;padding:24px;margin:0 0 24px;text-align:center;">' +
        '<div style="font-size:34px;margin-bottom:8px;">🎁</div>' +
        '<div style="display:inline-block;background:#2563EB;color:#ffffff;font-size:10.5px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;padding:4px 10px;border-radius:6px;margin-bottom:10px;">' +
          'ADD-ON UNLOCKED (+₹400 PACKAGE)' +
        '</div>' +
        '<h3 style="color:#0f172a;font-size:18px;margin:0 0 8px;font-weight:800;">ChatGPT Secret Hacks &amp; Prompting Toolkit</h3>' +
        '<p style="color:#475569;font-size:13.5px;line-height:1.5;margin:0 0 18px;">' +
          'You also unlocked the <strong>ChatGPT Hacks Package</strong> (ChatGPT Secret Hacks, Prompting Hacks &amp; Bonus Free Gift). Click below to download your toolkit immediately:' +
        '</p>' +
        '<a href="' + chatGptDownloadUrl + '" target="_blank" style="display:inline-block;background-color:#2563EB;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:100px;font-size:15px;font-weight:700;box-shadow:0 4px 12px rgba(37,99,235,0.3);">' +
          '📥 Download ChatGPT Hacks Toolkit' +
        '</a>' +
        '<p style="color:#64748b;font-size:11.5px;margin:12px 0 0;">' +
          'Direct Download Link:<br/>' +
          '<a href="' + chatGptDownloadUrl + '" style="color:#2563EB;word-break:break-all;font-size:11.5px;font-weight:600;">' + chatGptDownloadUrl + '</a>' +
        '</p>' +
      '</div>'
    : '';

  const htmlBody = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" style="max-width:600px;width:100%;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:24px;overflow:hidden;box-shadow:0 10px 15px -3px rgba(0,0,0,0.05);">
          <!-- HEADER BANNER -->
          <tr>
            <td style="background:linear-gradient(135deg,#0B0A09 0%,#1C1917 100%);padding:40px 32px;text-align:center;border-bottom:4px solid #FF7A47;">
              <div style="display:inline-block;background:rgba(255,122,71,0.18);border:1px solid rgba(255,122,71,0.45);color:#FF7A47;font-size:11px;font-weight:800;letter-spacing:0.16em;text-transform:uppercase;padding:6px 14px;border-radius:100px;margin-bottom:16px;">
                ⚡ INSTANT EMAIL DELIVERY
              </div>
              <h1 style="font-size:26px;font-weight:800;color:#ffffff;margin:0;letter-spacing:-0.02em;line-height:1.25;">${courseTitle}</h1>
              <p style="color:#A8A29E;font-size:13px;letter-spacing:0.12em;margin:10px 0 0;text-transform:uppercase;font-weight:600;">Tech Tycoon Digital Solution LLP</p>
            </td>
          </tr>

          <!-- MAIN CONTENT -->
          <tr>
            <td style="padding:36px 32px;">
              <h2 style="color:#0f172a;font-size:22px;margin:0 0 12px;font-weight:800;">Hi ${name}, Your Resources Are Ready! 🎉</h2>
              <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 24px;">
                Thank you for your purchase! Your payment of <strong>₹${totalAmount}</strong> is confirmed. Below is your direct access link to download your complete resource bundle immediately. Your official <strong>Invoice (PDF)</strong> is also attached to this email.
              </p>

              <!-- PRIMARY RESOURCE: 250+ CLAUDE SKILLS & 2,500+ PROMPTS -->
              <div style="background:linear-gradient(135deg,#FFF7ED 0%,#FFEDD5 100%);border:2px solid #FF7A47;border-radius:18px;padding:26px 24px;margin:0 0 24px;text-align:center;">
                <div style="font-size:36px;margin-bottom:8px;">🚀</div>
                <div style="display:inline-block;background:#FF7A47;color:#ffffff;font-size:10.5px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;padding:4px 10px;border-radius:6px;margin-bottom:10px;">
                  MAIN RESOURCE LIBRARY + BONUS GIFT
                </div>
                <h3 style="color:#0f172a;font-size:19px;margin:0 0 8px;font-weight:800;">250+ Ultimate Claude Skills &amp; 2,500+ Claude Prompts</h3>
                <p style="color:#475569;font-size:13.5px;line-height:1.55;margin:0 0 20px;">
                  Includes <strong>250+ plug-and-play Claude Skills</strong> across 130+ categories, <strong>2,500+ ready-to-use Claude Prompts</strong>, and your <strong>Additional Bonus Gift</strong>. Click below to access and download your files:
                </p>
                <a href="${claudeDownloadUrl}" target="_blank" style="display:inline-block;background-color:#FF7A47;color:#ffffff;text-decoration:none;padding:15px 34px;border-radius:100px;font-size:15px;font-weight:800;box-shadow:0 6px 16px rgba(255,122,71,0.35);">
                  📥 Download 250+ Claude Skills &amp; Prompts
                </a>
                <p style="color:#64748b;font-size:11.5px;margin:14px 0 0;line-height:1.4;">
                  Direct Access Link:<br/>
                  <a href="${claudeDownloadUrl}" style="color:#EA580C;word-break:break-all;font-size:11.5px;font-weight:600;">${claudeDownloadUrl}</a>
                </p>
              </div>

              ${addonSectionHtml}

              <!-- ORDER SUMMARY TABLE -->
              <table width="100%" style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;margin-bottom:28px;border-collapse:separate;border-spacing:0;">
                <tr>
                  <td style="padding:14px 20px;border-bottom:1px solid #e2e8f0;font-size:13.5px;color:#64748b;width:38%;">📦 Product</td>
                  <td style="padding:14px 20px;border-bottom:1px solid #e2e8f0;font-size:13.5px;color:#0f172a;font-weight:700;">${courseTitle}</td>
                </tr>
                <tr>
                  <td style="padding:14px 20px;border-bottom:1px solid #e2e8f0;font-size:13.5px;color:#64748b;">📧 Delivery Mode</td>
                  <td style="padding:14px 20px;border-bottom:1px solid #e2e8f0;font-size:13.5px;color:#16a34a;font-weight:700;">Instant Email Delivery</td>
                </tr>
                <tr>
                  <td style="padding:14px 20px;border-bottom:1px solid #e2e8f0;font-size:13.5px;color:#64748b;">💳 Amount Paid</td>
                  <td style="padding:14px 20px;border-bottom:1px solid #e2e8f0;font-size:13.5px;color:#0f172a;font-weight:700;">₹${totalAmount}</td>
                </tr>
                <tr>
                  <td style="padding:14px 20px;border-bottom:1px solid #e2e8f0;font-size:13.5px;color:#64748b;">🧾 Invoice No</td>
                  <td style="padding:14px 20px;border-bottom:1px solid #e2e8f0;font-size:13.5px;color:#0f172a;font-weight:700;">${officialInvoiceNo}</td>
                </tr>
                <tr>
                  <td style="padding:14px 20px;font-size:13.5px;color:#64748b;">🔑 Payment ID</td>
                  <td style="padding:14px 20px;font-size:13.5px;color:#475569;font-family:monospace;">${paymentId}</td>
                </tr>
              </table>

              <p style="color:#94a3b8;font-size:12px;text-align:center;margin:24px 0 0;line-height:1.5;">
                Need any help with your files? Call +91 75581 33039 / +91 70103 40494 or email<br>
                <a href="mailto:techtycoondigitalsolutions@gmail.com" style="color:#FF7A47;text-decoration:none;font-weight:700;">techtycoondigitalsolutions@gmail.com</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f8fafc;border-top:1px solid #e2e8f0;padding:24px;text-align:center;">
              <p style="color:#94a3b8;font-size:11px;margin:0;">© 2026 Tech Tycoon Digital Solution LLP.<br/>No. 31, Ramalinga Nagar, Madipakkam, Chennai, Tamil Nadu - 600091</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const emailOptions = {
    to: email,
    subject: subject,
    htmlBody: htmlBody,
    name: "Tech Tycoon",
    replyTo: "techtycoondigitalsolutions@gmail.com"
  };
  if (pdfAttachment) {
    emailOptions.attachments = [pdfAttachment];
  }

  try {
    MailApp.sendEmail(emailOptions);
    writeToLogs("EMAIL_SENT", "Claude Resources email delivered to " + email + " | Addon: " + hasChatGptAddon + " | Inv: " + officialInvoiceNo);
  } catch (mailErr) {
    writeToLogs("EMAIL_SEND_ERROR", mailErr.message);
    if (pdfAttachment) {
      MailApp.sendEmail({
        to: email,
        subject: subject,
        htmlBody: htmlBody,
        name: "Tech Tycoon",
        replyTo: "techtycoondigitalsolutions@gmail.com"
      });
      writeToLogs("EMAIL_FALLBACK_SENT", "Sent Claude Resources email without attachment to " + email);
    } else {
      throw mailErr;
    }
  }

  return { invoiceNumber: officialInvoiceNo, courseTitle: courseTitle, hasChatGptAddon: hasChatGptAddon };
}

// ----------------------------------------------------------------------------
// PAYMENT PROCESSING & SHEET UPDATING
// ----------------------------------------------------------------------------
function processVerifiedClaudePayment(orderId, paymentId, isInternational, clientSuppliedAmount, extraData) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const cleanOrderId = String(orderId || "").trim();
    const cleanPaymentId = String(paymentId || "").trim();
    const props = PropertiesService.getScriptProperties();

    if (props && props.getProperty("PROCESSED_PAY_" + cleanPaymentId)) {
      return {
        success: true,
        alreadyProcessed: true,
        paymentId: cleanPaymentId,
        orderId: cleanOrderId
      };
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME_REG) || ss.getSheets()[0];
    const layout = getRegSheetLayout(sheet);
    let rows = sheet.getDataRange().getValues();

    let targetRowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      const rowPayId = String(rows[i][layout.paymentId] || rows[i][9] || "").trim().replace(/^'/, "");
      const rowStatus = String(rows[i][layout.status] || rows[i][7] || "").trim();
      if (rowPayId && rowPayId === cleanPaymentId && (rowStatus === "✅ PAID" || rowStatus.indexOf("TEST_VERIFIED") !== -1)) {
        return {
          success: true,
          alreadyProcessed: true,
          paymentId: cleanPaymentId,
          orderId: cleanOrderId
        };
      }
      if (String(rows[i][layout.orderId] || rows[i][8] || "").trim() === cleanOrderId) {
        targetRowIndex = i;
        break;
      }
    }

    if (targetRowIndex === -1 && extraData && extraData.email) {
      const cleanEmail = String(extraData.email).trim().toLowerCase();
      for (let i = rows.length - 1; i >= 1; i--) {
        const rowEmail = String(rows[i][2] || "").trim().toLowerCase();
        const rowStatus = String(rows[i][layout.status] || rows[i][7] || "").trim();
        if (rowEmail === cleanEmail && (rowStatus === "INITIATED" || rowStatus === "WAITING")) {
          targetRowIndex = i;
          break;
        }
      }
    }

    if (targetRowIndex === -1) {
      const fallbackCourse = (extraData && (extraData.course || extraData.addon)) || "250+ Ultimate Claude Skills";
      sheet.appendRow(buildRegSheetRow(layout, {
        timestamp: new Date(),
        name: sanitizeCell((extraData && extraData.name) || "Customer"),
        email: sanitizeCell((extraData && extraData.email) || ""),
        phone: "'" + String((extraData && extraData.phone) || "").replace(/[^\d+\-\s]/g, ""),
        profession: "Professional",
        language: sanitizeCell(fallbackCourse),
        amount: clientSuppliedAmount || 499,
        status: "INITIATED",
        batch: sanitizeCell((extraData && extraData.batch) || "Claude Resources"),
        sessionDate: "Instant Email Delivery",
        orderId: cleanOrderId,
        paymentId: "",
        emailStatus: "WAITING",
        whatsappClicked: "NO",
        reminder24h: "NO",
        reminder2h: "NO",
        reminder15m: "NO",
        pageUrl: sanitizeCell((extraData && extraData.pageUrl) || "https://course.techtycoon.in/claude_resources/"),
        sessionTime: "",
        preferredSlot: ""
      }));
      SpreadsheetApp.flush();
      targetRowIndex = sheet.getLastRow() - 1;
      rows = sheet.getDataRange().getValues();
    }

    const row = rows[targetRowIndex];
    const expectedAmountInr = Number(row[6]) || Number(clientSuppliedAmount) || 499;

    // Verify with Razorpay API
    verifyPaymentWithRazorpayServer(cleanOrderId, cleanPaymentId, expectedAmountInr, isInternational);

    const name = String(row[1] || (extraData && extraData.name) || "Customer").replace(/^'/, "");
    const email = String(row[2] || (extraData && extraData.email) || "").replace(/^'/, "");
    const phoneClean = row[3] ? row[3].toString().replace(/\D/g, "") : "";
    const modeOrLang = String(row[5] || "") + " " + String((extraData && (extraData.course || extraData.addon)) || "");
    const batchOrCourse = String(row[layout.batch] || "") + " " + String((extraData && (extraData.batch || extraData.course || extraData.addon)) || "");

    // Send Instant Email Delivery with Download Links & Invoice PDF (Without GST)
    const emailResult = sendClaudeResourcesEmail(
      email,
      name,
      expectedAmountInr,
      cleanPaymentId,
      cleanOrderId,
      phoneClean,
      modeOrLang,
      batchOrCourse
    );

    const isTestTx = isAuthorizedLiveTest(email, expectedAmountInr);
    sheet.getRange(targetRowIndex + 1, layout.status + 1).setValue(isTestTx ? "✅ TEST_VERIFIED (₹1)" : "✅ PAID");
    sheet.getRange(targetRowIndex + 1, layout.paymentId + 1).setValue(sanitizeCell(cleanPaymentId));
    sheet.getRange(targetRowIndex + 1, layout.emailStatus + 1).setValue("CLAUDE_DELIVERED ✅");
    SpreadsheetApp.flush();

    if (props) {
      props.setProperty("PROCESSED_PAY_" + cleanPaymentId, new Date().toISOString());
    }

    return {
      success: true,
      verified: true,
      paymentId: cleanPaymentId,
      orderId: cleanOrderId,
      invoiceNumber: emailResult ? emailResult.invoiceNumber : null
    };
  } finally {
    lock.releaseLock();
  }
}

// ----------------------------------------------------------------------------
// GOOGLE SHEET STORAGE & LAYOUT HELPERS
// ----------------------------------------------------------------------------
function getRegSheetLayout(sheet) {
  const layout = {
    status: 7,
    batch: 8,
    sessionDate: 9,
    orderId: 10,
    paymentId: 11,
    emailStatus: 12,
    whatsappClicked: 13,
    reminder24h: 14,
    reminder2h: 15,
    reminder15m: 16,
    pageUrl: 17,
    sessionTime: 18,
    preferredSlot: 19,
    isCustomOrder: true
  };
  if (!sheet || typeof sheet.getDataRange !== "function") return layout;
  try {
    const rows = sheet.getDataRange().getValues();
    if (!rows || rows.length === 0) return layout;
    const header = rows[0].map(function(c) { return String(c || "").trim().toLowerCase(); });
    const statusIdx = header.indexOf("status") !== -1 ? header.indexOf("status") : header.indexOf("payment status");
    const batchIdx = header.indexOf("batch");
    const sessionDateIdx = header.indexOf("sessiondate") !== -1 ? header.indexOf("sessiondate") : header.indexOf("session date");
    const orderIdx = header.indexOf("order id") !== -1 ? header.indexOf("order id") : header.indexOf("orderid");
    const payIdx = header.indexOf("invoice number") !== -1 ? header.indexOf("invoice number") : (header.indexOf("payment id") !== -1 ? header.indexOf("payment id") : header.indexOf("paymentid"));

    if (statusIdx >= 7 && statusIdx <= 9) layout.status = statusIdx;
    if (batchIdx >= 7 && batchIdx <= 9) layout.batch = batchIdx;
    if (sessionDateIdx >= 7 && sessionDateIdx <= 9) layout.sessionDate = sessionDateIdx;
    if (orderIdx >= 9 && orderIdx <= 12) layout.orderId = orderIdx;
    if (payIdx >= 10 && payIdx <= 13) layout.paymentId = payIdx;
  } catch (e) {}
  return layout;
}

function buildRegSheetRow(layout, fields) {
  const row = new Array(20).fill("");
  row[0] = fields.timestamp;
  row[1] = fields.name;
  row[2] = fields.email;
  row[3] = fields.phone;
  row[4] = fields.profession;
  row[5] = fields.language;
  row[6] = fields.amount;
  row[layout.status] = fields.status;
  row[layout.batch] = fields.batch;
  row[layout.sessionDate] = fields.sessionDate;
  row[layout.orderId] = fields.orderId;
  row[layout.paymentId] = fields.paymentId;
  row[layout.emailStatus] = fields.emailStatus;
  row[layout.whatsappClicked] = fields.whatsappClicked;
  row[layout.reminder24h] = fields.reminder24h;
  row[layout.reminder2h] = fields.reminder2h;
  row[layout.reminder15m] = fields.reminder15m;
  row[layout.pageUrl] = fields.pageUrl;
  row[layout.sessionTime] = fields.sessionTime;
  row[layout.preferredSlot] = fields.preferredSlot;
  return row;
}

function saveToSheet(data, orderId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME_REG) || ss.getSheets()[0];
  const layout = getRegSheetLayout(sheet);
  const validAmount = validateClaudeResourcesAmount(data);
  const hasAddon = String(data.hasPdfMaterial || "").toUpperCase() === "YES" || String(data.addon || "").toLowerCase().includes("chatgpt") || Number(validAmount) >= 899;

  sheet.appendRow(buildRegSheetRow(layout, {
    timestamp: new Date(),
    name: sanitizeCell(data.name),
    email: sanitizeCell(data.email),
    phone: "'" + String(data.phone || "").replace(/[^\d+\-\s]/g, ""),
    profession: sanitizeCell(data.userType || "Professional"),
    language: sanitizeCell(data.course || (hasAddon ? "250+ Ultimate Claude Skills + ChatGPT Hacks" : "250+ Ultimate Claude Skills")),
    amount: validAmount,
    status: "INITIATED",
    batch: sanitizeCell(data.batch || (hasAddon ? "Claude Resources (+ ChatGPT Hacks)" : "Claude Resources")),
    sessionDate: "Instant Email Delivery",
    orderId: orderId,
    paymentId: "",
    emailStatus: "WAITING",
    whatsappClicked: "NO",
    reminder24h: "NO",
    reminder2h: "NO",
    reminder15m: "NO",
    pageUrl: sanitizeCell(data.pageUrl || "https://course.techtycoon.in/claude_resources/"),
    sessionTime: "",
    preferredSlot: ""
  }));
}

function getLandingLeadsSheet(ss) {
  let sheet = ss.getSheetByName(SHEET_NAME_LANDING_LEADS);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME_LANDING_LEADS);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(LANDING_LEAD_HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function saveRegistrationToLandingLeads(data, orderId) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = getLandingLeadsSheet(ss);
    const utm = data.utm || {};
    sheet.appendRow([
      new Date(),
      data.leadId || orderId,
      sanitizeCell(data.name),
      "'" + String(data.phone || "").replace(/[^\d+]/g, ""),
      sanitizeCell(data.email),
      sanitizeCell(String(data.pageUrl || "").substring(0, 500)),
      sanitizeCell(String(data.utm_source || utm.utm_source || "Direct").substring(0, 100)),
      sanitizeCell(String(data.utm_medium || utm.utm_medium || "").substring(0, 100)),
      sanitizeCell(String(data.utm_campaign || utm.utm_campaign || "").substring(0, 150)),
      sanitizeCell(String(data.gclid || utm.gclid || "").substring(0, 200)),
      sanitizeCell(String(data.fbclid || utm.fbclid || "").substring(0, 200)),
      sanitizeCell(String(data.userAgent || "").substring(0, 300))
    ]);
  } catch (err) {}
}

function saveLandingLead(data) {
  if (data && data.website) {
    return { success: false, error: "Submission rejected." };
  }
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = getLandingLeadsSheet(ss);
  const leadId = "lead_" + Utilities.getUuid().replace(/-/g, "").substring(0, 16);
  sheet.appendRow([
    new Date(),
    leadId,
    sanitizeCell((data && data.name) || ""),
    "'" + String((data && data.phone) || "").replace(/[^\d+]/g, ""),
    sanitizeCell((data && data.email) || ""),
    sanitizeCell(String((data && data.pageUrl) || "").substring(0, 500)),
    "", "", "", "", "",
    sanitizeCell(String((data && data.userAgent) || "").substring(0, 300))
  ]);
  return { success: true, leadId: leadId };
}

// ----------------------------------------------------------------------------
// INVOICE PDF GENERATOR (WITHOUT GST)
// ----------------------------------------------------------------------------
function numberToIndianRupeesWords(amount) {
  const num = Math.round(Math.max(0, Number(amount) || 0));
  if (num === 0) return "Indian Rupees Zero Only";
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  function twoDigit(n) {
    if (n < 20) return ones[n];
    return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
  }
  function threeDigit(n) {
    const h = Math.floor(n / 100);
    const rem = n % 100;
    let res = h > 0 ? ones[h] + " Hundred" : "";
    if (rem > 0) res += (res ? " and " : "") + twoDigit(rem);
    return res;
  }
  let rem = num;
  const parts = [];
  const crore = Math.floor(rem / 10000000); rem %= 10000000;
  if (crore > 0) parts.push(threeDigit(crore) + " Crore");
  const lakh = Math.floor(rem / 100000); rem %= 100000;
  if (lakh > 0) parts.push(twoDigit(lakh) + " Lakh");
  const thousand = Math.floor(rem / 1000); rem %= 1000;
  if (thousand > 0) parts.push(twoDigit(thousand) + " Thousand");
  if (rem > 0) parts.push(threeDigit(rem));
  return "Indian Rupees " + parts.join(" ") + " Only";
}

function generateOurInvoicePdfBlob(customerName, customerEmail, customerPhone, courseName, totalAmount, paymentId, orderId, invoiceNo) {
  const total = Math.max(1, Math.round(Number(totalAmount) || 499));
  const amountInWords = numberToIndianRupeesWords(total);
  const invNumber = String(invoiceNo || "TT/26-27/CR").trim();
  const dateStr = Utilities.formatDate(new Date(), "Asia/Kolkata", "dd MMM yyyy");

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    body { font-family: Arial, Helvetica, sans-serif; color: #0f172a; margin: 18px; font-size: 11.5px; }
    .box { border: 1px solid #cbd5e1; border-radius: 10px; padding: 24px; }
    .header { border-bottom: 2px solid #0f172a; padding-bottom: 14px; margin-bottom: 18px; width: 100%; }
    .paid { background: #dcfce7; color: #15803d; font-weight: bold; padding: 4px 12px; border-radius: 12px; font-size: 11px; }
    table.items { width: 100%; border-collapse: collapse; margin: 16px 0; }
    table.items th { background: #0f172a; color: #ffffff; padding: 10px 8px; text-align: left; font-size: 10.5px; text-transform: uppercase; }
    table.items td { padding: 12px 8px; border-bottom: 1px solid #e2e8f0; }
    .right { text-align: right; font-family: monospace; }
  </style></head><body><div class="box">
    <table class="header"><tr>
      <td>
        <h2 style="margin:0 0 4px 0;font-size:16px;">${COMPANY_CONFIG.COMPANY_NAME}</h2>
        <div style="color:#475569;line-height:1.5;">No. 31, Ramalinga Nagar, Madipakkam, Chennai, Tamil Nadu - 600091<br/>Mobile: +91 ${COMPANY_CONFIG.COMPANY_PHONE} / +91 ${COMPANY_CONFIG.COMPANY_ALT_PHONE} | Web: ${COMPANY_CONFIG.COMPANY_WEBSITE}</div>
      </td>
      <td style="text-align:right;vertical-align:top;">
        <h1 style="margin:0;font-size:20px;">INVOICE</h1>
        <div style="color:#64748b;font-size:10px;margin-bottom:6px;">OFFICIAL PAYMENT RECEIPT</div>
        <span class="paid">PAID</span>
      </td>
    </tr></table>
    <table style="width:100%;margin-bottom:16px;"><tr>
      <td style="width:50%;vertical-align:top;background:#f8fafc;padding:12px;border-radius:6px;border:1px solid #e2e8f0;">
        <strong style="color:#64748b;font-size:9.5px;text-transform:uppercase;">Billed To (Customer Details)</strong><br/>
        <strong>${sanitizeCell(customerName || "Customer")}</strong><br/>
        Email: ${sanitizeCell(customerEmail || "")}<br/>
        Phone: ${sanitizeCell(customerPhone || "")}
      </td>
      <td style="width:50%;vertical-align:top;background:#f8fafc;padding:12px;border-radius:6px;border:1px solid #e2e8f0;">
        <strong style="color:#64748b;font-size:9.5px;text-transform:uppercase;">Invoice &amp; Payment Details</strong><br/>
        <strong>Invoice No:</strong> ${invNumber}<br/>
        <strong>Invoice Date:</strong> ${dateStr}<br/>
        <strong>Payment ID:</strong> ${sanitizeCell(paymentId || "PAID")}<br/>
        <strong>Order Ref:</strong> ${sanitizeCell(orderId || "")} | <strong>Mode:</strong> Razorpay
      </td>
    </tr></table>
    <table class="items">
      <thead><tr><th>#</th><th>Description of Digital Product</th><th class="right">Qty</th><th class="right">Unit Price (INR)</th><th class="right">Total (INR)</th></tr></thead>
      <tbody><tr>
        <td>1</td>
        <td><strong>${sanitizeCell(courseName)}</strong><br/><span style="color:#64748b;font-size:10px;">Digital Educational Resources &amp; AI Prompt Library (Instant Email Delivery)</span></td>
        <td class="right">1</td>
        <td class="right">Rs. ${total.toFixed(2)}</td>
        <td class="right">Rs. ${total.toFixed(2)}</td>
      </tr></tbody>
    </table>
    <table style="width:100%;border-collapse:collapse;"><tr>
      <td style="width:54%;vertical-align:top;padding-right:14px;">
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:12px;">
          <div style="font-size:9.5px;color:#64748b;text-transform:uppercase;font-weight:bold;">Total Amount in Words</div>
          <div style="font-weight:bold;color:#0f172a;margin-top:4px;">${amountInWords}</div>
        </div>
      </td>
      <td style="width:46%;vertical-align:top;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:5px 0;border-bottom:1px solid #e2e8f0;">Subtotal:</td><td class="right" style="padding:5px 0;border-bottom:1px solid #e2e8f0;">Rs. ${total.toFixed(2)}</td></tr>
          <tr><td style="padding:8px 0;font-weight:bold;font-size:13px;">Total Amount Paid (INR):</td><td class="right" style="padding:8px 0;font-weight:bold;font-size:13px;">Rs. ${total.toFixed(2)}</td></tr>
        </table>
      </td>
    </tr></table>
    <table style="width:100%;margin-top:18px;padding-top:12px;border-top:1px dashed #cbd5e1;font-size:10px;color:#64748b;"><tr>
      <td>Thank you for your purchase!<br/>This is a computer-generated invoice and requires no physical signature.</td>
      <td style="text-align:right;">For <strong>${COMPANY_CONFIG.COMPANY_NAME}</strong><br/><br/><strong style="color:#0f172a;">Authorised Signatory</strong></td>
    </tr></table>
  </div></body></html>`;

  const cleanFileNo = invNumber.replace(/[^A-Za-z0-9_-]/g, "_");
  return Utilities.newBlob(html, "text/html", "Invoice.html").getAs("application/pdf").setName("Invoice_" + cleanFileNo + ".pdf");
}

// ----------------------------------------------------------------------------
// AUTOMATIC RECONCILIATION (Finds any paid order & emails resources if missed)
// ----------------------------------------------------------------------------
function fetchCapturedPaymentForOrder(orderId) {
  try {
    const cleanOrd = String(orderId || "").trim();
    if (!/^order_[A-Za-z0-9]+$/.test(cleanOrd)) return null;
    const keyId = getRazorpayKeyId(false);
    const keySecret = getOptionalScriptSecret("RAZORPAY_KEY_SECRET");
    if (!keySecret) return null;
    const credentials = Utilities.base64Encode(keyId + ":" + keySecret);
    const res = UrlFetchApp.fetch("https://api.razorpay.com/v1/orders/" + encodeURIComponent(cleanOrd) + "/payments", {
      method: "get",
      headers: { Authorization: "Basic " + credentials, "Content-Type": "application/json" },
      muteHttpExceptions: true
    });
    if (res.getResponseCode() !== 200) return null;
    const data = JSON.parse(res.getContentText() || "{}");
    const items = data.items || [];
    for (let i = 0; i < items.length; i++) {
      if (items[i] && items[i].status === "captured" && items[i].id) {
        return items[i].id;
      }
    }
  } catch (e) {}
  return null;
}

function reconcileClaudeResourcesRows() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME_REG) || ss.getSheets()[0];
  const layout = getRegSheetLayout(sheet);
  const rows = sheet.getDataRange().getValues();
  let resolvedCount = 0;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const status = String(row[layout.status] || row[7] || "").trim();
    const orderId = String(row[layout.orderId] || row[8] || "").trim();
    let payId = String(row[layout.paymentId] || row[9] || "").trim().replace(/^'/, "");
    const emailStatus = String(row[layout.emailStatus] || row[10] || "").trim();

    // If row is still INITIATED and has an orderId, check Razorpay to see if user completed payment
    if (status === "INITIATED" && !payId && orderId.startsWith("order_")) {
      const foundPayId = fetchCapturedPaymentForOrder(orderId);
      if (foundPayId) {
        payId = foundPayId;
      }
    }

    const needsEmail =
      payId.startsWith("pay_") &&
      emailStatus !== "CLAUDE_DELIVERED ✅" &&
      (status === "INITIATED" || status === "✅ PAID" || status.includes("TEST_VERIFIED") || status.includes("RECONCILIATION"));

    if (needsEmail) {
      const name = String(row[1] || "Customer").replace(/^'/, "");
      const email = String(row[2] || "").replace(/^'/, "");
      const phoneClean = row[3] ? row[3].toString().replace(/\D/g, "") : "";
      const expectedAmountInr = Number(row[6]) || 499;
      const isTestTx = isAuthorizedLiveTest(email, expectedAmountInr);
      const modeOrLang = String(row[5] || "");
      const batchOrCourse = String(row[layout.batch] || "");

      sheet.getRange(i + 1, layout.status + 1).setValue(isTestTx ? "✅ TEST_VERIFIED (₹1)" : "✅ PAID");
      sheet.getRange(i + 1, layout.paymentId + 1).setValue(sanitizeCell(payId));

      if (email) {
        try {
          const mailRes = sendClaudeResourcesEmail(email, name, expectedAmountInr, payId, orderId, phoneClean, modeOrLang, batchOrCourse);
          sheet.getRange(i + 1, layout.emailStatus + 1).setValue("CLAUDE_DELIVERED ✅");
          resolvedCount++;
          Logger.log("✅ Sent to " + name + " <" + email + "> | ₹" + expectedAmountInr + " | Package: " + (mailRes.hasChatGptAddon ? "2 Resources (Claude + ChatGPT Hacks)" : "1 Resource (Only Claude Resources)"));
          writeToLogs("ROW_RECONCILED", "Emailed Claude Resources & Invoice to " + email + " (" + payId + ") | Addon: " + mailRes.hasChatGptAddon);
        } catch (mailErr) {
          Logger.log("❌ Error sending to " + email + ": " + mailErr.message);
          writeToLogs("RECONCILE_MAIL_ERROR", "Failed to send email to " + email + ": " + mailErr.message);
        }
      }
    }
  }

  SpreadsheetApp.flush();
  return "Reconciliation complete. Delivered resources to " + resolvedCount + " row(s).";
}

// Alias so any existing time-based trigger named reconcileAiMasterclassRows continues working seamlessly
function reconcileAiMasterclassRows() {
  return reconcileClaudeResourcesRows();
}

// ----------------------------------------------------------------------------
// UTILITY & ONE-CLICK SETUP FUNCTIONS
// ----------------------------------------------------------------------------
function sanitizeCell(val) {
  if (val === null || val === undefined) return "";
  const str = String(val).replace(/[\u0000-\u001F\u007F]/g, "").trim();
  if (/^[=+\-@\t\r]/.test(str)) return "'" + str;
  return str;
}

function constantTimeEquals(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function computeHmacSha256Hex(payload, secret) {
  const sigBytes = Utilities.computeHmacSha256Signature(payload, secret);
  return sigBytes.map(function(b) {
    const v = (b < 0) ? 256 + b : b;
    return ("0" + v.toString(16)).slice(-2);
  }).join("");
}

function writeToLogs(event, data) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const logSheet = ss.getSheetByName(SHEET_NAME_LOGS) || ss.insertSheet(SHEET_NAME_LOGS);
    logSheet.appendRow([new Date(), event, data]);
  } catch (e) {}
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function setupAutoReconcileTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < triggers.length; i++) {
    const fn = triggers[i].getHandlerFunction();
    if (fn === "reconcileAiMasterclassRows" || fn === "reconcileClaudeResourcesRows") {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  ScriptApp.newTrigger("reconcileClaudeResourcesRows")
    .timeBased()
    .everyMinutes(5)
    .create();
  return "Auto-reconcile trigger installed (runs every 5 minutes).";
}

function setRazorpaySecret() {
  PropertiesService.getScriptProperties().setProperty("RAZORPAY_KEY_SECRET", "0ZmzKfvHIwbnvkTCPxkWC1a6");
  Logger.log("✅ RAZORPAY_KEY_SECRET saved successfully!");
}

/**
 * Run this function ONCE from the Apps Script toolbar to:
 * 1. Authorize both Razorpay (UrlFetchApp) and Email Delivery (MailApp)
 * 2. Immediately send a test Resource Delivery + Invoice email to ambroseselva001@gmail.com
 */
function authorizeAndSendTestResourceEmail() {
  MailApp.getRemainingDailyQuota();
  UrlFetchApp.fetch("https://api.razorpay.com");
  const res = sendClaudeResourcesEmail(
    "ambroseselva001@gmail.com",
    "Selva",
    1,
    "pay_TestResource123",
    "order_TestResource123",
    "917639323648",
    "250+ Ultimate Claude Skills + ChatGPT Hacks",
    "Claude Resources (+ ChatGPT Hacks)"
  );
  Logger.log("✅ Authorized and sent Claude Resources + Invoice email to ambroseselva001@gmail.com! " + JSON.stringify(res));
}
