/**
 * POST /api/register
 * Saves a "Reserve My Seat" registration (no payment) to the Google Sheet.
 *
 * The browser never talks to the Sheet directly. This function checks the
 * details again on the server, then forwards them to the Apps Script with
 * the shared secret. It only answers "ok" when the Sheet confirms the save.
 *
 * Environment variables (Cloudflare Pages > Settings > Environment variables):
 *   SHEET_WEBHOOK_URL   Google Apps Script web app URL (ends with /exec)
 *   SHEET_SECRET        same value as SHARED_SECRET in the Apps Script
 *   ALLOWED_ORIGIN      optional, only if the page is hosted on another domain
 */

// Same packages and prices as create-order.js (the price is never taken from the browser)
const PACKAGES = {
  class: { amount: 29900, label: 'Class Only' },
  class_doc: { amount: 79900, label: 'Class + Learning Document' }
};

// Optional, kept for older forms that still send it
const STATUSES = {
  student: 'College Student',
  professional: 'Working Professional',
  other: 'Other'
};

export async function onRequestOptions({ env }) {
  return new Response(null, { status: 204, headers: cors(env) });
}

export async function onRequestPost({ request, env }) {
  if (!env.SHEET_WEBHOOK_URL || !env.SHEET_SECRET) {
    console.error('Registration not configured: set SHEET_WEBHOOK_URL and SHEET_SECRET');
    return json(env, { ok: false, error: 'Registration is not connected yet. Please try again later.' }, 503);
  }

  let b;
  try { b = await request.json(); } catch { return json(env, { ok: false, error: 'Bad request.' }, 400); }

  // Bots fill the hidden "website" field. Pretend success, save nothing.
  if (b.website) return json(env, { ok: true });

  const name = clean(b.full_name, 80).replace(/\s+/g, ' ');
  const mobile = normaliseMobile(b.mobile);
  const email = clean(b.email, 120).toLowerCase();
  const statusKey = String(b.status || '');
  const pkg = PACKAGES[b.package];

  const errors = {};
  if (!pkg) errors.package = 'Please choose a package.';
  if (name.length < 2 || !/^[\p{L} .'-]+$/u.test(name)) errors.full_name = 'Please enter your full name.';
  if (!mobile) errors.mobile = 'Please enter a valid 10-digit mobile number.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = 'Please enter a valid email address.';
  if (statusKey && !STATUSES[statusKey]) errors.status = 'Please choose your current status.';
  if (Object.keys(errors).length) return json(env, { ok: false, error: 'Please check the highlighted fields.', fields: errors }, 422);

  const record = {
    registered_at: new Date().toISOString(),
    full_name: name,
    mobile: '+91' + mobile,
    email,
    status: STATUSES[statusKey] || '',
    package: b.package,
    package_label: pkg.label,
    amount_inr: pkg.amount / 100,
    utm_source: clean(b.utm_source, 100),
    utm_medium: clean(b.utm_medium, 100),
    utm_campaign: clean(b.utm_campaign, 100),
    utm_term: clean(b.utm_term, 100),
    utm_content: clean(b.utm_content, 100),
    page_url: clean(b.page_url, 300)
  };

  let res;
  try {
    const r = await fetch(env.SHEET_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: env.SHEET_SECRET, kind: 'registration', record })
    });
    res = await r.json();
  } catch (e) {
    console.error('Sheet request failed', e);
    return json(env, { ok: false, error: 'We could not save your registration. Please try again.' }, 502);
  }

  if (!res || res.ok !== true) {
    console.error('Sheet refused registration', res);
    return json(env, { ok: false, error: 'We could not save your registration. Please try again.' }, 502);
  }

  return json(env, { ok: true, duplicate: !!res.duplicate });
}

/* ---------- helpers ---------- */
function clean(v, max) {
  return String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, max);
}
// Accepts 98765 43210, +91 98765-43210, 0919876543210, 09876543210 → 9876543210
function normaliseMobile(v) {
  let d = String(v == null ? '' : v).replace(/\D/g, '');
  if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
  else if (d.length === 13 && d.startsWith('091')) d = d.slice(3);
  else if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d) ? d : '';
}
function cors(env) {
  return env.ALLOWED_ORIGIN ? {
    'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin'
  } : {};
}
function json(env, data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...cors(env) }
  });
}
