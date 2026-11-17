<?php
// POST {razorpay_order_id, razorpay_payment_id, razorpay_signature}
// 1. checks the checkout signature (HMAC-SHA256 with the secret key)
// 2. re-reads the payment from Razorpay and checks order, amount and status
// 3. marks the order paid exactly once
declare(strict_types=1);
require __DIR__ . '/lib/bootstrap.php';

require_method('POST');
$c = require_keys();

$b = read_json_body();
$orderId   = (string) ($b['razorpay_order_id'] ?? '');
$paymentId = (string) ($b['razorpay_payment_id'] ?? '');
$signature = (string) ($b['razorpay_signature'] ?? '');

if (!valid_order_id($orderId) || !valid_payment_id($paymentId) || !preg_match('/^[a-f0-9]{64}$/', $signature)) {
    json_out(400, ['status' => 'failed', 'error' => 'Invalid payment details.']);
}
if (!order_exists($orderId)) json_out(404, ['status' => 'failed', 'error' => 'Unknown order.']);

$expected = hash_hmac('sha256', $orderId . '|' . $paymentId, $c['key_secret']);
if (!hash_equals($expected, $signature)) {
    error_log("[razorpay] signature mismatch for $orderId / $paymentId");
    json_out(400, ['status' => 'failed', 'error' => 'Payment could not be verified.']);
}

$payment = rzp_api('GET', '/payments/' . $paymentId);
if (!$payment['_ok']) {
    // Signature is valid but Razorpay could not be reached: the client polls status.php.
    json_out(200, ['status' => 'pending', 'payment_id' => $paymentId]);
}

// If the account is not set to auto-capture, capture it now (only for the exact order amount).
if (($payment['status'] ?? '') === 'authorized' && ($payment['order_id'] ?? '') === $orderId) {
    $rec = json_decode((string) file_get_contents(data_path('orders') . "/$orderId.json"), true);
    if ((int) $payment['amount'] === (int) $rec['amount']) {
        $cap = rzp_api('POST', "/payments/$paymentId/capture", ['amount' => $rec['amount'], 'currency' => $rec['currency']]);
        if ($cap['_ok']) $payment = $cap;
        else {
            // Already captured by auto-capture in the meantime, or a transient error: re-read.
            $again = rzp_api('GET', '/payments/' . $paymentId);
            if ($again['_ok']) $payment = $again;
        }
    }
}

$status = apply_payment($orderId, $payment, 'verify');
json_out(200, ['status' => $status, 'payment_id' => $paymentId]);
