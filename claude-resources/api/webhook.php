<?php
// Razorpay webhook (Dashboard -> Settings -> Webhooks), events:
//   payment.captured, payment.failed, order.paid
// Confirms payments even if the customer closes the browser before verify.php runs.
declare(strict_types=1);
require __DIR__ . '/lib/bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') json_out(405, ['error' => 'Method not allowed']);

$c = rzp_config();
if ($c['webhook_secret'] === '') {
    error_log('[razorpay] webhook received but webhook_secret is not configured');
    json_out(503, ['error' => 'Not configured']);
}

$raw = (string) file_get_contents('php://input', false, null, 0, 1048576);
$sig = $_SERVER['HTTP_X_RAZORPAY_SIGNATURE'] ?? '';
if ($sig === '' || !hash_equals(hash_hmac('sha256', $raw, $c['webhook_secret']), $sig)) {
    error_log('[razorpay] webhook signature mismatch');
    json_out(400, ['error' => 'Invalid signature']);
}

// Razorpay may deliver the same event more than once: skip events already handled.
// (apply_payment is idempotent too, so a duplicate racing past this check is harmless.)
$eventId = preg_replace('/[^A-Za-z0-9_]/', '', $_SERVER['HTTP_X_RAZORPAY_EVENT_ID'] ?? '');
$marker = $eventId !== '' ? data_path('events') . '/' . $eventId : '';
if ($marker !== '' && is_file($marker)) json_out(200, ['ok' => true, 'duplicate' => true]);

$event = json_decode($raw, true) ?: [];
$payment = $event['payload']['payment']['entity'] ?? null;
$orderId = (string) ($payment['order_id'] ?? '');

if (in_array($event['event'] ?? '', ['payment.captured', 'payment.failed', 'order.paid'], true)
    && $payment && valid_order_id($orderId) && order_exists($orderId)) {
    apply_payment($orderId, $payment, 'webhook');
}
if ($marker !== '') @touch($marker); // only after successful processing, so failures are retried

json_out(200, ['ok' => true]);
