<?php
// GET ?order_id=... -> {status: created|pending|paid|failed}
// Used while a payment is still being confirmed. Asks Razorpay directly; never trusts the browser.
declare(strict_types=1);
require __DIR__ . '/lib/bootstrap.php';

require_method('GET');
require_keys();

$orderId = (string) ($_GET['order_id'] ?? '');
if (!valid_order_id($orderId)) json_out(400, ['error' => 'Invalid order.']);
if (!order_exists($orderId)) json_out(404, ['error' => 'Unknown order.']);

$rec = json_decode((string) file_get_contents(data_path('orders') . "/$orderId.json"), true) ?: [];
if (($rec['status'] ?? '') === 'paid') {
    if (empty($rec['sheet_logged'])) log_to_sheet($orderId);
    json_out(200, ['status' => 'paid', 'payment_id' => $rec['payment_id']]);
}

$list = rzp_api('GET', "/orders/$orderId/payments");
if (!$list['_ok']) json_out(200, ['status' => $rec['status'] ?? 'created']);

$best = null;
$rank = ['captured' => 3, 'authorized' => 2, 'failed' => 1];
foreach ($list['items'] ?? [] as $p) {
    if (!$best || ($rank[$p['status']] ?? 0) > ($rank[$best['status']] ?? 0)) $best = $p;
}
if (!$best) json_out(200, ['status' => $rec['status'] ?? 'created']);

$status = apply_payment($orderId, $best, 'status');
json_out(200, ['status' => $status, 'payment_id' => $best['id']]);
