<?php
// POST {product} -> creates a Razorpay order for the server-defined price.
declare(strict_types=1);
require __DIR__ . '/lib/bootstrap.php';

require_method('POST');
$c = require_keys();
// Generous on purpose: many Indian mobile users share one carrier IP (CGNAT).
rate_limit('order', 60, 600);

$body = read_json_body();
$productKey = (string) ($body['product'] ?? 'claude-skills');
$product = RZP_PRODUCTS[$productKey] ?? null;
if (!$product) json_out(400, ['error' => 'Unknown product.']);

$order = rzp_api('POST', '/orders', [
    'amount'   => $product['amount'],
    'currency' => $product['currency'],
    'receipt'  => 'tt_' . gmdate('ymdHis') . '_' . bin2hex(random_bytes(3)),
    'notes'    => ['product' => $productKey],
]);
if (!$order['_ok'] || empty($order['id']) || !valid_order_id($order['id'])) {
    json_out(502, ['error' => 'Could not start the payment. Please try again.']);
}

with_order($order['id'], fn () => [
    'order_id'   => $order['id'],
    'product'    => $productKey,
    'amount'     => $product['amount'],
    'currency'   => $product['currency'],
    'status'     => 'created',
    'created_at' => gmdate('c'),
]);

json_out(200, [
    'key_id'      => $c['key_id'], // public key id only; the secret never leaves the server
    'order_id'    => $order['id'],
    'amount'      => $product['amount'],
    'currency'    => $product['currency'],
    'name'        => $product['name'],
    'description' => $product['description'],
    'test_mode'   => str_starts_with($c['key_id'], 'rzp_test_'),
]);
