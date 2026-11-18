/**
 * POST /api/verify-payment
 * Confirms a Razorpay payment before the page shows "You are registered".
 *
 * Checks, in order:
 *  1. The signature: HMAC-SHA256(order_id + "|" + payment_id, key secret).
 *  2. With Razorpay's API: the payment belongs to this order, it is
 *     captured (or authorized), and the amount matches our package price.
 * Then it saves the registration to the Google Sheet (optional).
 *
 * Environment variables:
 *   RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
 *   SHEET_WEBHOOK_URL   optional, Google Apps Script web app URL
 *   SHEET_SECRET        optional, same value as SHARED_SECRET in the Apps Script
 *   ALLOWED_ORIGIN      optional
 */

const PACKAGES = {
  class: { amount: 29900, label: 'Class Only' },
  class_doc: { amount: 79900, label: 'Class + Recorded Video Access + Learning Document' }
};

export async function onRequestOptions({ env }) {
  return new Response(null, { status: 204, headers: cors(env) });
}

export async function onRequestPost({ request, env }) {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    return json(env, { verified: false, error: 'Payment is not configured on the server.' }, 503);
  }

  let b;
  try { b = await request.json(); } catch { return json(env, { verified: false, error: 'Bad request.' }, 400); }

  const orderId = String(b.razorpay_order_id || '');
  const paymentId = String(b.razorpay_payment_id || '');
  const signature = String(b.razorpay_signature || '');
  if (!/^order_\w+$/.test(orderId) || !/^pay_\w+$/.test(paymentId) || !/^[a-f0-9]{64}$/.test(signature)) {
    return json(env, { verified: false, error: 'Bad request.' }, 400);
  }

  // 1. Signature
  const expected = await hmacHex(env.RAZORPAY_KEY_SECRET, orderId + '|' + paymentId);
  if (!safeEqual(expected, signature)) {
    return json(env, { verified: false, error: 'Signature mismatch.' }, 400);
  }

  // 2. Confirm with Razorpay
  const auth = 'Basic ' + btoa(env.RAZORPAY_KEY_ID + ':' + env.RAZORPAY_KEY_SECRET);
  const [payRes, orderRes] = await Promise.all([
    fetch('https://api.razorpay.com/v1/payments/' + paymentId, { headers: { Authorization: auth } }),
    fetch('https://api.razorpay.com/v1/orders/' + orderId, { headers: { Authorization: auth } })
  ]);
  if (!payRes.ok || !orderRes.ok) {
    console.error('Razorpay lookup failed', payRes.status, orderRes.status);
    return json(env, { verified: false, error: 'Could not reach Razorpay.' }, 502);
  }
  const payment = await payRes.json();
  const order = await orderRes.json();
  const notes = order.notes || {};
  const pkg = PACKAGES[notes.package];

  const ok =
    payment.order_id === orderId &&
    (payment.status === 'captured' || payment.status === 'authorized') &&
    pkg && order.amount === pkg.amount && payment.amount === order.amount && payment.currency === 'INR';

  if (!ok) {
    console.error('Payment check failed', { status: payment.status, order: orderId, amount: payment.amount });
    return json(env, { verified: false, error: 'Payment not complete.' }, 402);
  }

  // 3. Save (the webhook also saves; the Sheet script skips duplicates)
  const record = {
    paid_at: new Date((payment.created_at || Date.now() / 1000) * 1000).toISOString(),
    ...notes,
    whatsapp: payment.contact || '',   // collected by Razorpay Checkout
    email: payment.email || '',        // collected by Razorpay Checkout
    package_label: pkg.label,
    amount_inr: order.amount / 100,
    payment_id: paymentId,
    order_id: orderId,
    payment_status: payment.status,
    method: payment.method || '',
    source: 'checkout'
  };
  const saved = await saveToSheet(env, record);

  return json(env, {
    verified: true,
    saved,
    payment_id: paymentId,
    order_id: orderId,
    amount: order.amount / 100,
    package: notes.package,
    package_label: pkg.label
  });
}

/* ---------- helpers ---------- */
async function hmacHex(secret, message) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return [...new Uint8Array(sig)].map((x) => x.toString(16).padStart(2, '0')).join('');
}
function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
async function saveToSheet(env, record) {
  if (!env.SHEET_WEBHOOK_URL) return false;
  try {
    const r = await fetch(env.SHEET_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: env.SHEET_SECRET || '', record })
    });
    return r.ok;
  } catch (e) {
    console.error('Sheet save failed', e);
    return false;
  }
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
