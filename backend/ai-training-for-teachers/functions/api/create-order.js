/**
 * POST /api/create-order
 * Creates a Razorpay order for the chosen package.
 * The amount comes from PACKAGES below, never from the browser.
 *
 * Environment variables (Cloudflare Pages > Settings > Environment variables):
 *   RAZORPAY_KEY_ID       rzp_test_... or rzp_live_...
 *   RAZORPAY_KEY_SECRET   keep secret, set as "Encrypted"
 *   ALLOWED_ORIGIN        optional, only if the page is hosted on another domain
 */

const PACKAGES = {
  class: { amount: 29900, label: 'Class Only' },                       // ₹299 in paise
  class_doc: { amount: 79900, label: 'Class + Learning Document' }    // ₹799 in paise
};

export async function onRequestOptions({ env }) {
  return new Response(null, { status: 204, headers: cors(env) });
}

export async function onRequestPost({ request, env }) {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    return json(env, { error: 'Payment is not configured on the server.' }, 503);
  }

  let b;
  try { b = await request.json(); } catch { return json(env, { error: 'Bad request.' }, 400); }

  // The package decides the amount (never a price from the browser).
  // Name, mobile and email come from the registration popup and are
  // pre-filled in Razorpay Checkout.
  const pkg = PACKAGES[b.package];
  if (!pkg) return bad(env, 'package', 'Please choose a package.');

  const name = clean(b.full_name, 80).replace(/\s+/g, ' ');
  const mobile = normaliseMobile(b.mobile);
  const email = clean(b.email, 120).toLowerCase();
  if (name.length < 2 || !/^[\p{L} .'-]+$/u.test(name)) return bad(env, 'full_name', 'Please enter your full name.');
  if (!mobile) return bad(env, 'mobile', 'Please enter a valid 10-digit mobile number.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return bad(env, 'email', 'Please enter a valid email address.');

  // Razorpay allows up to 15 notes of 256 characters. These travel with the
  // order, so verification reads trusted data from Razorpay, not the browser.
  const notes = {
    package: b.package,
    full_name: name,
    mobile: '+91' + mobile,
    reg_email: email,
    utm_source: clean(b.utm_source, 100),
    utm_medium: clean(b.utm_medium, 100),
    utm_campaign: clean(b.utm_campaign, 100),
    utm_term: clean(b.utm_term, 100),
    utm_content: clean(b.utm_content, 100),
    page_url: clean(b.page_url, 250)
  };

  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + btoa(env.RAZORPAY_KEY_ID + ':' + env.RAZORPAY_KEY_SECRET),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount: pkg.amount,
      currency: 'INR',
      receipt: ('tt_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8)).slice(0, 40),
      notes
    })
  });

  if (!res.ok) {
    console.error('Razorpay order failed', res.status, await res.text());
    return json(env, { error: 'Could not start payment. Please try again.' }, 502);
  }

  const order = await res.json();
  return json(env, {
    order_id: order.id,
    amount: order.amount,
    currency: order.currency,
    key_id: env.RAZORPAY_KEY_ID,
    package: b.package,
    package_label: pkg.label
  });
}

/* ---------- helpers ---------- */
function clean(v, max) { return String(v == null ? '' : v).replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max); }
// Accepts 98765 43210, +91 98765-43210, 0919876543210, 09876543210 → 9876543210
function normaliseMobile(v) {
  let d = String(v == null ? '' : v).replace(/\D/g, '');
  if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
  else if (d.length === 13 && d.startsWith('091')) d = d.slice(3);
  else if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d) ? d : '';
}
function bad(env, field, error) { return json(env, { error, field }, 400); }
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
