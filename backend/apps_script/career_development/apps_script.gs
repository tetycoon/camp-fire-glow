/**
 * ============================================================================
 * TECH TYCOON — AI-POWERED CAREER DEVELOPMENT
 * Google Apps Script backend: Razorpay orders + payment verification + Google Sheet
 * Page: course.techtycoon.in/ai-powered-career-development/
 * ============================================================================
 *
 * FLOW
 *  1. Page sends {action:"createOrder", name, mobile, whatsapp, email, education,
 *     institution, city, package}. This script looks up the price itself (₹99 / ₹299),
 *     creates a Razorpay order, adds an "INITIATED" row to the sheet and returns the order.
 *  2. Visitor pays in Razorpay Checkout.
 *  3. Page sends {action:"verifyPayment", razorpay_order_id, razorpay_payment_id,
 *     razorpay_signature}. This script checks the signature, then asks Razorpay's API
 *     that the payment is captured, belongs to this order and has the order's exact amount.
 *     Only then does it mark the row "PAID" and reply {verified:true}. The page shows the
 *     confirmation only after that reply.
 *  4. (Optional) A Razorpay webhook (payment.captured / order.paid) pointed at this
 *     web app marks the row PAID even if the visitor closed the browser after paying.
 *
 * SETUP (one time)
 *  1. Create a Google Sheet → Extensions → Apps Script → paste this file.
 *  2. Project Settings → Script Properties → add:
 *       RAZORPAY_KEY_ID      = rzp_live_xxxxxxxx
 *       RAZORPAY_KEY_SECRET  = your Razorpay key secret (never put it in the website)
 *  3. Deploy → New deployment → Web app → Execute as: Me, Who has access: Anyone.
 *  4. Copy the /exec URL into CONFIG.appsScriptUrl in
 *     public/ai-powered-career-development/index.html
 *  5. Optional: Razorpay Dashboard → Webhooks → URL = the same /exec URL,
 *     events: payment.captured, order.paid.
 * ============================================================================
 */

// Prices live here, on the server, so they cannot be changed from the browser.
const PACKAGES = {
  class:  { label: "Class Only", amount: 99 },
  bundle: { label: "Class + Learning Document", amount: 299 }
};

const PRODUCT_KEY = "career_development";
const SHEET_NAME = "Registrations";
const LOG_SHEET_NAME = "Logs";
const HEADERS = [
  "Timestamp", "Status", "Order ID", "Payment ID", "Package", "Amount (₹)",
  "Full Name", "Mobile", "WhatsApp", "Email", "Education / Qualification",
  "College / Institution", "City", "Paid At", "Page URL"
];
const COL = {}; HEADERS.forEach(function (h, i) { COL[h] = i + 1; });

// Optional: link emailed to ₹299 buyers. Leave "" to say it will be shared on WhatsApp.
const LEARNING_DOCUMENT_URL = "";
const SEND_CONFIRMATION_EMAIL = true;

// ---------------------------------------------------------------------------
// Entry points
// ---------------------------------------------------------------------------
function doGet() {
  return ContentService.createTextOutput("OK — AI-Powered Career Development API active");
}

function doPost(e) {
  const raw = (e && e.postData && e.postData.contents) ? e.postData.contents : "{}";
  try {
    const body = JSON.parse(raw);

    if (body.action === "createOrder") return json(createOrder(body));
    if (body.action === "verifyPayment") return json(verifyPayment(body));

    // Razorpay webhook. Apps Script cannot read the signature header, so the
    // payment is re-checked directly with Razorpay's API before it is trusted.
    if (body.event === "payment.captured" || body.event === "order.paid") {
      const p = body.payload && body.payload.payment && body.payload.payment.entity;
      if (!p || !p.id || !p.order_id) return json({ success: false, error: "Bad webhook" });
      const order = fetchRazorpay("orders/" + encodeURIComponent(p.order_id));
      if (!order.notes || order.notes.product !== PRODUCT_KEY) return json({ success: true, ignored: true });
      confirmPaid(order, p.id);
      return json({ success: true });
    }

    return json({ success: false, error: "Unknown action" });
  } catch (err) {
    log("ERROR", String(err && err.message || err) + " | " + raw.substring(0, 300));
    return json({ success: false, error: publicError(err) });
  }
}

// ---------------------------------------------------------------------------
// 1. Create order
// ---------------------------------------------------------------------------
function createOrder(d) {
  const pkg = PACKAGES[d.package];
  if (!pkg) throw userError("Please choose a valid package.");

  const reg = {
    name: clean(d.name, 80),
    mobile: digits(d.mobile),
    whatsapp: digits(d.whatsapp),
    email: clean(d.email, 120).toLowerCase(),
    education: clean(d.education, 60),
    institution: clean(d.institution, 120),
    city: clean(d.city, 60)
  };
  if (reg.name.length < 2) throw userError("Please enter your full name.");
  if (!/^[6-9]\d{9}$/.test(reg.mobile)) throw userError("Please enter a valid mobile number.");
  if (!/^[6-9]\d{9}$/.test(reg.whatsapp)) throw userError("Please enter a valid WhatsApp number.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(reg.email)) throw userError("Please enter a valid email address.");
  if (!reg.education || reg.institution.length < 2 || reg.city.length < 2) throw userError("Please fill in all the fields.");

  // Razorpay notes: max 15 keys, 256 chars each.
  const order = fetchRazorpay("orders", {
    amount: pkg.amount * 100,
    currency: "INR",
    receipt: "cd_" + Date.now(),
    notes: {
      product: PRODUCT_KEY,
      package: d.package,
      package_label: pkg.label,
      name: reg.name,
      mobile: reg.mobile,
      whatsapp: reg.whatsapp,
      email: reg.email,
      education: reg.education,
      institution: reg.institution,
      city: reg.city
    }
  });

  const row = {};
  row["Timestamp"] = new Date();
  row["Status"] = "INITIATED";
  row["Order ID"] = order.id;
  row["Package"] = pkg.label;
  row["Amount (₹)"] = pkg.amount;
  row["Full Name"] = reg.name;
  row["Mobile"] = "'" + reg.mobile;
  row["WhatsApp"] = "'" + reg.whatsapp;
  row["Email"] = reg.email;
  row["Education / Qualification"] = reg.education;
  row["College / Institution"] = reg.institution;
  row["City"] = reg.city;
  row["Page URL"] = clean(d.pageUrl, 300);
  sheet().appendRow(HEADERS.map(function (h) { return row[h] !== undefined ? row[h] : ""; }));

  return {
    success: true,
    orderId: order.id,
    amount: pkg.amount,
    packageLabel: pkg.label,
    keyId: prop("RAZORPAY_KEY_ID")
  };
}

// ---------------------------------------------------------------------------
// 2. Verify payment
// ---------------------------------------------------------------------------
function verifyPayment(d) {
  const orderId = String(d.razorpay_order_id || "").trim();
  const paymentId = String(d.razorpay_payment_id || "").trim();
  const signature = String(d.razorpay_signature || "").trim().toLowerCase();

  if (!/^order_[A-Za-z0-9]+$/.test(orderId) || !/^pay_[A-Za-z0-9]+$/.test(paymentId) || !/^[0-9a-f]{64}$/.test(signature)) {
    log("REJECT", "Malformed verification request for " + orderId);
    return { success: false, verified: false, error: "Invalid payment details." };
  }

  const expected = hmacHex(orderId + "|" + paymentId, prop("RAZORPAY_KEY_SECRET"));
  if (!safeEquals(expected, signature)) {
    log("REJECT", "Bad signature for " + orderId + " / " + paymentId);
    return { success: false, verified: false, error: "Payment signature did not match." };
  }

  const order = fetchRazorpay("orders/" + encodeURIComponent(orderId));
  if (!order.notes || order.notes.product !== PRODUCT_KEY) {
    return { success: false, verified: false, error: "This payment is not for this session." };
  }

  const reg = confirmPaid(order, paymentId);
  return { success: true, verified: true, registration: reg };
}

/**
 * Checks the payment with Razorpay's API and marks the sheet row PAID.
 * Safe to call more than once for the same payment.
 */
function confirmPaid(order, paymentId) {
  const payment = fetchRazorpay("payments/" + encodeURIComponent(paymentId));
  if (payment.order_id !== order.id) throw new Error("Payment " + paymentId + " belongs to a different order.");
  if (payment.status !== "captured" && payment.status !== "authorized") {
    throw new Error("Payment " + paymentId + " status is " + payment.status);
  }
  if (Number(payment.amount) !== Number(order.amount)) {
    throw new Error("Payment amount " + payment.amount + " does not match order amount " + order.amount);
  }

  const n = order.notes || {};
  const reg = {
    name: n.name || "",
    mobile: n.mobile || "",
    whatsapp: n.whatsapp || "",
    email: n.email || payment.email || "",
    education: n.education || "",
    institution: n.institution || "",
    city: n.city || "",
    packageLabel: n.package_label || "",
    amount: Number(order.amount) / 100,
    paymentId: paymentId,
    orderId: order.id
  };

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  let firstTime = false;
  try {
    const sh = sheet();
    const last = sh.getLastRow();
    let rowNum = 0;
    if (last > 1) {
      const ids = sh.getRange(2, COL["Order ID"], last - 1, 1).getValues();
      for (let i = ids.length - 1; i >= 0; i--) {
        if (String(ids[i][0]) === order.id) { rowNum = i + 2; break; }
      }
    }
    if (!rowNum) {
      // Row missing (e.g. sheet edited by hand) — recreate it from the order notes.
      sh.appendRow(HEADERS.map(function () { return ""; }));
      rowNum = sh.getLastRow();
      sh.getRange(rowNum, COL["Timestamp"]).setValue(new Date());
      sh.getRange(rowNum, COL["Order ID"]).setValue(order.id);
      sh.getRange(rowNum, COL["Package"]).setValue(reg.packageLabel);
      sh.getRange(rowNum, COL["Amount (₹)"]).setValue(reg.amount);
      sh.getRange(rowNum, COL["Full Name"]).setValue(reg.name);
      sh.getRange(rowNum, COL["Mobile"]).setValue("'" + reg.mobile);
      sh.getRange(rowNum, COL["WhatsApp"]).setValue("'" + reg.whatsapp);
      sh.getRange(rowNum, COL["Email"]).setValue(reg.email);
      sh.getRange(rowNum, COL["Education / Qualification"]).setValue(reg.education);
      sh.getRange(rowNum, COL["College / Institution"]).setValue(reg.institution);
      sh.getRange(rowNum, COL["City"]).setValue(reg.city);
    }
    if (sh.getRange(rowNum, COL["Status"]).getValue() !== "PAID") {
      firstTime = true;
      sh.getRange(rowNum, COL["Status"]).setValue("PAID");
      sh.getRange(rowNum, COL["Payment ID"]).setValue(paymentId);
      sh.getRange(rowNum, COL["Paid At"]).setValue(new Date());
    }
  } finally {
    lock.releaseLock();
  }

  if (firstTime) {
    log("PAID", order.id + " / " + paymentId + " / ₹" + reg.amount);
    if (SEND_CONFIRMATION_EMAIL && reg.email) {
      try { sendConfirmationEmail(reg); } catch (e) { log("EMAIL_ERROR", String(e && e.message || e)); }
    }
  }
  return reg;
}

function sendConfirmationEmail(reg) {
  const isBundle = reg.amount >= 299;
  const docLine = isBundle
    ? (LEARNING_DOCUMENT_URL
        ? '<p><b>Your Learning Document:</b> <a href="' + LEARNING_DOCUMENT_URL + '">Open the document</a></p>'
        : "<p>Your Learning Document will be shared with you on WhatsApp.</p>")
    : "";
  const html =
    '<div style="font-family:Arial,sans-serif;font-size:15px;color:#0b1b3f;line-height:1.6">' +
    "<p>Hi " + esc(reg.name) + ",</p>" +
    "<p>Your registration for <b>AI-Powered Career Development</b> is confirmed. Session details will be shared on WhatsApp.</p>" +
    '<table cellpadding="6" style="border-collapse:collapse;font-size:14px">' +
    "<tr><td>Package</td><td><b>" + esc(reg.packageLabel) + "</b></td></tr>" +
    "<tr><td>Amount paid</td><td><b>₹" + reg.amount + "</b></td></tr>" +
    "<tr><td>Payment ID</td><td>" + esc(reg.paymentId) + "</td></tr>" +
    "</table>" + docLine +
    "<p>See you in the session!<br>Tech Tycoon Academy</p></div>";
  MailApp.sendEmail({
    to: reg.email,
    subject: "Registration confirmed – AI-Powered Career Development",
    htmlBody: html,
    name: "Tech Tycoon Academy"
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function fetchRazorpay(path, payload) {
  const auth = Utilities.base64Encode(prop("RAZORPAY_KEY_ID") + ":" + prop("RAZORPAY_KEY_SECRET"));
  const opts = {
    method: payload ? "post" : "get",
    headers: { Authorization: "Basic " + auth },
    contentType: "application/json",
    muteHttpExceptions: true
  };
  if (payload) opts.payload = JSON.stringify(payload);
  const res = UrlFetchApp.fetch("https://api.razorpay.com/v1/" + path, opts);
  const text = res.getContentText();
  if (res.getResponseCode() !== 200) throw new Error("Razorpay " + path + " failed (" + res.getResponseCode() + "): " + text);
  return JSON.parse(text);
}

function sheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
  }
  return sh;
}

function prop(key) {
  const v = PropertiesService.getScriptProperties().getProperty(key);
  if (!v || !String(v).trim()) throw new Error("Missing Script Property: " + key);
  return String(v).trim();
}

function hmacHex(payload, secret) {
  return Utilities.computeHmacSha256Signature(payload, secret)
    .map(function (b) { return ("0" + ((b < 0 ? b + 256 : b).toString(16))).slice(-2); })
    .join("");
}

function safeEquals(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function clean(v, max) { return String(v || "").replace(/[\r\n\t]+/g, " ").replace(/^[=+\-@]+/, "").trim().substring(0, max); }
function digits(v) { return String(v || "").replace(/\D/g, "").slice(-10); }
function esc(s) { return String(s || "").replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

function userError(msg) { const e = new Error(msg); e.isUser = true; return e; }
function publicError(err) { return err && err.isUser ? err.message : "Something went wrong on our side."; }

function json(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function log(event, data) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    (ss.getSheetByName(LOG_SHEET_NAME) || ss.insertSheet(LOG_SHEET_NAME)).appendRow([new Date(), event, data]);
  } catch (e) {}
}
