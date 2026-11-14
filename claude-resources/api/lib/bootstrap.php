<?php
/**
 * Shared Razorpay helpers for the api/*.php endpoints.
 *
 * SECRETS ARE NEVER STORED IN THIS FOLDER. They are read from, in order:
 *   1. environment variables  RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET,
 *      SHEET_WEBHOOK_URL, SHEET_TOKEN, PAYMENT_DATA_DIR
 *   2. a PHP file OUTSIDE the public web folder (default: ~/razorpay-private/secrets.php,
 *      i.e. next to public_html, never inside it). Override with env RZP_SECRETS_FILE.
 * Template: deploy/razorpay-secrets.example.php
 */
declare(strict_types=1);

if (PHP_SAPI !== 'cli' && basename($_SERVER['SCRIPT_FILENAME'] ?? '') === 'bootstrap.php') {
    http_response_code(404);
    exit;
}

// Products sold through Razorpay. The amount is decided HERE, on the server,
// never by the browser. Amounts are in paise (₹499 = 49900).
const RZP_PRODUCTS = [
    'claude-skills' => [
        'amount'      => 49900,
        'currency'    => 'INR',
        'name'        => 'TechTycoon',
        'description' => 'Ultimate Claude Skills library',
    ],
];

function rzp_config(): array
{
    static $cfg = null;
    if ($cfg !== null) return $cfg;

    $file = getenv('RZP_SECRETS_FILE') ?: dirname(__DIR__, 3) . '/razorpay-private/secrets.php';
    $fromFile = is_file($file) ? (array) require $file : [];

    $pick = function (string $env, string $key, $default = '') use ($fromFile) {
        $v = getenv($env);
        if ($v !== false && $v !== '') return $v;
        return $fromFile[$key] ?? $default;
    };

    $cfg = [
        'key_id'         => (string) $pick('RAZORPAY_KEY_ID', 'key_id'),
        'key_secret'     => (string) $pick('RAZORPAY_KEY_SECRET', 'key_secret'),
        'webhook_secret' => (string) $pick('RAZORPAY_WEBHOOK_SECRET', 'webhook_secret'),
        'sheet_url'      => (string) $pick('SHEET_WEBHOOK_URL', 'sheet_webhook_url'),
        'sheet_token'    => (string) $pick('SHEET_TOKEN', 'sheet_token'),
        'data_dir'       => (string) $pick('PAYMENT_DATA_DIR', 'data_dir', dirname($file) . '/data'),
    ];
    return $cfg;
}

function json_out(int $code, array $body): void
{
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($body, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

/** Endpoints only accept their method and same-site browser requests. */
function require_method(string $method): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== $method) {
        header('Allow: ' . $method);
        json_out(405, ['error' => 'Method not allowed']);
    }
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin !== '') {
        $host = parse_url($origin, PHP_URL_HOST) . (parse_url($origin, PHP_URL_PORT) ? ':' . parse_url($origin, PHP_URL_PORT) : '');
        if (strcasecmp($host, $_SERVER['HTTP_HOST'] ?? '') !== 0) json_out(403, ['error' => 'Forbidden']);
    }
}

function require_keys(): array
{
    $c = rzp_config();
    if ($c['key_id'] === '' || $c['key_secret'] === '') {
        error_log('[razorpay] key_id / key_secret not configured');
        json_out(503, ['error' => 'Payments are not configured yet.']);
    }
    if (!preg_match('/^rzp_(test|live)_[A-Za-z0-9]+$/', $c['key_id'])) {
        error_log('[razorpay] key_id has an unexpected format');
        json_out(503, ['error' => 'Payments are not configured correctly.']);
    }
    return $c;
}

function read_json_body(): array
{
    $raw = file_get_contents('php://input', false, null, 0, 8192);
    $data = json_decode($raw ?: '', true);
    return is_array($data) ? $data : [];
}

/**
 * JSON HTTP request. Uses cURL when available (standard on Hostinger), otherwise
 * PHP's built-in HTTPS streams. Returns [status code, body or false, error text].
 */
function http_request(string $method, string $url, ?string $json, ?string $auth = null, int $timeout = 20): array
{
    $headers = ['Content-Type: application/json', 'Accept: application/json'];
    if ($auth) $headers[] = 'Authorization: ' . $auth;

    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            // Plain POST (not CUSTOMREQUEST) so a 302 redirect is followed with GET, as Apps Script needs.
            ($method === 'POST' ? CURLOPT_POST : CURLOPT_CUSTOMREQUEST) => $method === 'POST' ? true : $method,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_MAXREDIRS      => 3,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_TIMEOUT        => $timeout,
            CURLOPT_HTTPHEADER     => $headers,
        ] + ($json !== null ? [CURLOPT_POSTFIELDS => $json] : []));
        $res = curl_exec($ch);
        $code = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        $err = curl_error($ch);
        curl_close($ch);
        return [$code, $res, $err];
    }

    $ctx = stream_context_create(['http' => [
        'method' => $method, 'header' => implode("\r\n", $headers), 'content' => $json ?? '',
        'timeout' => $timeout, 'ignore_errors' => true, 'follow_location' => 1, 'max_redirects' => 3,
    ]]);
    $res = @file_get_contents($url, false, $ctx);
    $code = 0;
    // $http_response_header holds every response in a redirect chain; the last status wins.
    foreach ($http_response_header ?? [] as $h) {
        if (preg_match('#^HTTP/\S+\s+(\d{3})#', $h, $m)) $code = (int) $m[1];
    }
    return [$code, $res, $res === false ? 'stream request failed' : ''];
}

/** Call the Razorpay REST API with the secret key (server side only). */
function rzp_api(string $method, string $path, ?array $body = null): array
{
    $c = require_keys();
    // RZP_API_BASE exists only for automated local tests against a mock API.
    $url = (getenv('RZP_API_BASE') ?: 'https://api.razorpay.com/v1') . $path;
    [$code, $res, $err] = http_request($method, $url, $body === null ? null : json_encode($body),
        'Basic ' . base64_encode($c['key_id'] . ':' . $c['key_secret']));

    if ($res === false) {
        error_log('[razorpay] network error: ' . $err);
        return ['_ok' => false, '_code' => 0, 'error' => ['description' => 'network error']];
    }
    $data = json_decode($res, true) ?: [];
    $data['_ok'] = $code >= 200 && $code < 300;
    $data['_code'] = $code;
    if (!$data['_ok']) error_log("[razorpay] $method $path -> $code " . substr($res, 0, 300));
    return $data;
}

// ---- Order records (JSON files in the private data folder) -------------------

function data_path(string $sub): string
{
    $dir = rtrim(rzp_config()['data_dir'], '/\\') . '/' . $sub;
    if (!is_dir($dir) && !mkdir($dir, 0700, true) && !is_dir($dir)) {
        error_log('[razorpay] cannot create data dir ' . $dir);
        json_out(500, ['error' => 'Server storage error.']);
    }
    return $dir;
}

function valid_order_id(string $id): bool { return (bool) preg_match('/^order_[A-Za-z0-9]{8,30}$/', $id); }
function valid_payment_id(string $id): bool { return (bool) preg_match('/^pay_[A-Za-z0-9]{8,30}$/', $id); }

/**
 * Read-modify-write one order record under an exclusive lock, so the browser
 * verify call, the status poll and the webhook can never double-process a payment.
 * $fn receives the record (null if unknown) and returns the record to save (or null to leave it).
 */
function with_order(string $orderId, callable $fn)
{
    $file = data_path('orders') . '/' . $orderId . '.json';
    $fh = fopen($file, 'c+');
    if (!$fh) json_out(500, ['error' => 'Server storage error.']);
    flock($fh, LOCK_EX);
    $raw = stream_get_contents($fh);
    $rec = $raw ? json_decode($raw, true) : null;
    $new = null;
    try {
        $new = $fn($rec);
        if (is_array($new)) {
            $new['updated_at'] = gmdate('c');
            ftruncate($fh, 0);
            rewind($fh);
            fwrite($fh, json_encode($new, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
            fflush($fh);
        }
    } finally {
        flock($fh, LOCK_UN);
        fclose($fh);
        if (!$raw && empty($new)) @unlink($file); // don't leave empty files for unknown ids
    }
    return $new ?? $rec;
}

function order_exists(string $orderId): bool
{
    return is_file(data_path('orders') . '/' . $orderId . '.json');
}

/**
 * Check a Razorpay payment entity against our order record and, if it is a
 * genuine captured payment for the right amount, mark the order paid (once).
 * Returns the public status: paid | pending | failed | created.
 */
function apply_payment(string $orderId, array $payment, string $source): string
{
    $rec = with_order($orderId, function (?array $rec) use ($orderId, $payment, $source) {
        if ($rec === null) return null; // not an order this site created
        if (($rec['status'] ?? '') === 'paid') return null; // already processed: never twice

        $matches = ($payment['order_id'] ?? '') === $orderId
            && (int) ($payment['amount'] ?? -1) === (int) $rec['amount']
            && ($payment['currency'] ?? '') === $rec['currency'];
        if (!$matches) {
            error_log("[razorpay] payment {$payment['id']} does not match order $orderId");
            return null;
        }

        $st = $payment['status'] ?? '';
        if ($st === 'captured') {
            $rec['status'] = 'paid';
            $rec['payment_id'] = $payment['id'];
            $rec['method'] = $payment['method'] ?? '';
            $rec['email'] = $payment['email'] ?? '';
            $rec['contact'] = $payment['contact'] ?? '';
            $rec['paid_at'] = gmdate('c');
            $rec['confirmed_by'] = $source;
        } elseif ($st === 'authorized') {
            $rec['status'] = 'pending';
            $rec['payment_id'] = $payment['id'];
        } elseif ($st === 'failed' && ($rec['status'] ?? '') !== 'pending') {
            $rec['status'] = 'failed';
            $rec['last_error'] = $payment['error_description'] ?? 'Payment failed';
        }
        return $rec;
    });

    if ($rec && ($rec['status'] ?? '') === 'paid' && empty($rec['sheet_logged'])) log_to_sheet($orderId);
    return $rec['status'] ?? 'created';
}

/** Append the paid order to the Google Sheet (optional; retried on later calls until it succeeds). */
function log_to_sheet(string $orderId): void
{
    $c = rzp_config();
    if ($c['sheet_url'] === '') return;

    with_order($orderId, function (?array $rec) use ($c, $orderId) {
        if (!$rec || ($rec['status'] ?? '') !== 'paid' || !empty($rec['sheet_logged'])) return null;
        $row = [
            'token'      => $c['sheet_token'],
            'paid_at'    => $rec['paid_at'],
            'order_id'   => $orderId,
            'payment_id' => $rec['payment_id'],
            'product'    => $rec['product'],
            'amount'     => $rec['amount'] / 100,
            'currency'   => $rec['currency'],
            'email'      => $rec['email'],
            'contact'    => $rec['contact'],
            'method'     => $rec['method'],
            'mode'       => str_starts_with(rzp_config()['key_id'], 'rzp_live_') ? 'live' : 'test',
        ];
        // Apps Script answers a POST with a redirect to the result; both clients follow it.
        [$code, $res] = http_request('POST', $c['sheet_url'], json_encode($row), null, 15);
        $ok = $code === 200 && is_string($res) && str_contains($res, '"ok":true');
        if (!$ok) {
            error_log("[razorpay] Google Sheet log failed for $orderId (HTTP $code)");
            return null;
        }
        $rec['sheet_logged'] = true;
        return $rec;
    });
}

/** Very small per-IP limit on order creation, to stop scripted order spam. */
function rate_limit(string $bucket, int $max, int $windowSec): void
{
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $file = data_path('rate') . '/' . $bucket . '_' . hash('sha256', $ip) . '.json';
    $now = time();
    $hits = is_file($file) ? (json_decode((string) file_get_contents($file), true) ?: []) : [];
    $hits = array_values(array_filter($hits, fn ($t) => $t > $now - $windowSec));
    if (count($hits) >= $max) json_out(429, ['error' => 'Too many attempts. Please wait a few minutes and try again.']);
    $hits[] = $now;
    file_put_contents($file, json_encode($hits), LOCK_EX);
}
