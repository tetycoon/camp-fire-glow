/**
 * Google Sheet receiver for registrations and paid registrations.
 * AI Skills for Teachers and Professors · Tech Tycoon Digital Solution LLP
 *
 * Only our server (Cloudflare Pages Functions) writes here:
 *  - /api/register sends "Reserve My Seat" form entries  → tab "Registrations"
 *  - payment verification and the Razorpay webhook send  → tab "Paid registrations"
 * The browser never writes to the Sheet directly.
 *
 * Setup (5 minutes):
 * 1. Create a Google Sheet. Extensions > Apps Script. Paste this file.
 * 2. Project Settings (gear) > Script properties > Add property:
 *      SHARED_SECRET = any long random text
 * 3. Deploy > New deployment > Web app
 *      Execute as: Me    Who has access: Anyone
 * 4. Copy the Web app URL (ends with /exec).
 * 5. In Cloudflare Pages > Settings > Environment variables, add:
 *      SHEET_WEBHOOK_URL = that URL
 *      SHEET_SECRET      = the same SHARED_SECRET value
 *
 * Updating this file later: paste the new code, then Deploy > Manage deployments >
 * edit (pencil) > Version: New version > Deploy. The URL stays the same.
 */

var SHEET_NAME = 'Paid registrations';
var COLUMNS = [
  'paid_at', 'whatsapp', 'email',
  'package', 'package_label', 'amount_inr', 'payment_id', 'order_id', 'payment_status', 'method', 'source',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'page_url',
  // added later: details typed in the registration popup (new columns go at the end)
  'full_name', 'mobile', 'reg_email'
];

var REG_SHEET_NAME = 'Registrations';
var REG_COLUMNS = [
  'registered_at', 'full_name', 'mobile', 'email', 'status',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'page_url',
  // added later: the package chosen in the popup
  'package', 'package_label', 'amount_inr'
];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var secret = PropertiesService.getScriptProperties().getProperty('SHARED_SECRET');
    if (!secret || body.secret !== secret) return json({ ok: false, error: 'unauthorised' });

    var r = body.record || {};

    if (body.kind === 'registration') {
      if (!r.mobile || !r.email || !r.full_name) return json({ ok: false, error: 'missing fields' });
      var reg = getSheet(REG_SHEET_NAME, REG_COLUMNS);
      // One registration per mobile number (double clicks, repeat visits)
      if (exists(reg, REG_COLUMNS.indexOf('mobile') + 1, r.mobile)) return json({ ok: true, duplicate: true });
      reg.appendRow(toRow(REG_COLUMNS, r, 'mobile'));
      return json({ ok: true });
    }

    if (!r.payment_id) return json({ ok: false, error: 'missing payment_id' });
    var sheet = getSheet(SHEET_NAME, COLUMNS);
    // Skip duplicates: checkout and webhook can both report the same payment.
    if (exists(sheet, COLUMNS.indexOf('payment_id') + 1, r.payment_id)) return json({ ok: true, duplicate: true });
    sheet.appendRow(toRow(COLUMNS, r, 'whatsapp'));
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function getSheet(name, columns) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name) || ss.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(columns);
    sheet.setFrozenRows(1);
  } else if (sheet.getLastColumn() < columns.length) {
    // An older sheet: add the headers for the new columns
    sheet.getRange(1, 1, 1, columns.length).setValues([columns]);
  }
  return sheet;
}

function exists(sheet, col, value) {
  var last = sheet.getLastRow();
  if (last < 2) return false;
  var text = String(value);
  var values = sheet.getRange(2, col, last - 1, 1).getDisplayValues();
  for (var i = 0; i < values.length; i++) {
    if (values[i][0] === text) return true;
  }
  return false;
}

function toRow(columns, r, phoneKey) {
  return columns.map(function (key) {
    var v = String(r[key] == null ? '' : r[key]).slice(0, 500);
    // Stop spreadsheet formula injection. Phone numbers start with + on purpose,
    // so they are stored as text too (the leading ' is hidden in the Sheet).
    if (key === phoneKey && /^\+/.test(v)) return "'" + v;
    return /^[=+\-@]/.test(v) ? "'" + v : v;
  });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
