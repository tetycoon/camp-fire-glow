/**
 * POST /api/razorpay-webhook
 * Backup record of paid orders. It catches payments where the person closed
 * the browser before the page could verify them.
 *
 * Razorpay Dashboard > Settings > Webhooks > Add new webhook
 *   URL:    https://<your-site>/api/razorpay-webhook
 *   Secret: any long random text (set the same value as RAZORPAY_WEBHOOK_SECRET)
 *   Events: order.paid
 *
 * Environment variables:
 *   RAZORPAY_WEBHOOK_SECRET
 *   SHEET_WEBHOOK_URL, SHEET_SECRET (optional, to save to the Google Sheet)
 */

const PACKAGES = {
  class: { amount: 29900, label: 'Class Only' },
  class_doc: { amount: 79900, label: 'Class + Recorded Video Access + Learning Document' }
};

export async function onRequestPost({ request, env }) {
  if (!env.RAZORPAY_WEBHOOK_SECRET) return new Response('Not configured', { status: 503 });

  const raw = await request.text();
  const given = request.headers.get('x-razorpay-signature') || '';
  const expected = await hmacHex(env.RAZORPAY_WEBHOOK_SECRET, raw);
  if (!safeEqual(expected, given)) return new Response('Invalid signature', { status: 401 });

  let event;
  try { event = JSON.parse(raw); } catch { return new Response('Bad JSON', { status: 400 }); }

  if (event.event === 'order.paid') {
    const order = event.payload && event.payload.order && event.payload.order.entity;
    const payment = event.payload && event.payload.payment && event.payload.payment.entity;
    const notes = (order && order.notes) || {};
    const pkg = PACKAGES[notes.package];
    if (order && payment && pkg && order.amount === pkg.amount) {
      await saveToSheet(env, {
        paid_at: new Date((payment.created_at || Date.now() / 1000) * 1000).toISOString(),
        ...notes,
        whatsapp: payment.contact || '',
        email: payment.email || '',
        package_label: pkg.label,
        amount_inr: order.amount / 100,
        payment_id: payment.id,
        order_id: order.id,
        payment_status: payment.status,
        method: payment.method || '',
        source: 'webhook'
      });
    }
  }
  // Always 200 for a valid signature, so Razorpay does not keep retrying.
  return new Response('ok');
}

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
  if (!env.SHEET_WEBHOOK_URL) return;
  try {
    await fetch(env.SHEET_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: env.SHEET_SECRET || '', record })
    });
  } catch (e) {
    console.error('Sheet save failed', e);
  }
}
