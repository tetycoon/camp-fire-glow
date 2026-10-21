import { describe, it, expect, vi } from 'vitest';
import crypto from 'node:crypto';
import http from 'node:http';
import { handleRequest, createProxyServer } from '../../backend/webhook_proxy/server.js';

const TEST_WEBHOOK_SECRET = 'test_webhook_secret_32_characters_long';
const TEST_PROXY_SECRET = 'test_proxy_secret_32_characters_long';
const TEST_ADMIN_SECRET = 'test_admin_secret_32_characters_long';

function mockHttpRequest(options: {
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  body?: string;
}) {
  const method = options.method || 'GET';
  const url = options.url || '/health';
  const headers = options.headers || {};
  const body = options.body || '';

  const req = new http.IncomingMessage({} as any);
  req.method = method;
  req.url = url;
  req.headers = { ...headers, host: 'localhost:3000' };

  let responseData = '';
  let responseStatusCode = 200;
  let responseHeaders: Record<string, string> = {};

  const res = {
    writeHead: (status: number, hdrs?: Record<string, string>) => {
      responseStatusCode = status;
      if (hdrs) responseHeaders = hdrs;
    },
    end: (chunk?: string) => {
      if (chunk) responseData += chunk;
    },
  } as unknown as http.ServerResponse;

  return { req, res, getResponse: () => ({ status: responseStatusCode, headers: responseHeaders, data: responseData ? JSON.parse(responseData) : null }) };
}

describe('Central Webhook Proxy Server Suite', () => {
  it('GET /health returns 200 with service status, version, and environment', async () => {
    const { req, res, getResponse } = mockHttpRequest({ method: 'GET', url: '/health' });

    await handleRequest(req, res, {
      environment: 'production',
      webhookSecret: TEST_WEBHOOK_SECRET,
      proxySecret: TEST_PROXY_SECRET,
      adminSecret: TEST_ADMIN_SECRET,
    });

    const resp = getResponse();
    expect(resp.status).toBe(200);
    expect(resp.data.status).toBe('HEALTHY');
    expect(resp.data.service).toBe('techtycoon-razorpay-proxy');
    expect(resp.data.protocol_version).toBe('v2.1');
    expect(resp.data.environment).toBe('production');
    expect(resp.data.registered_routes).toContain('claude_masterclass');
    expect(resp.data.registered_routes).toContain('ai_masterclass');
  });

  it('GET /unknown returns 404 with NOT_FOUND error', async () => {
    const { req, res, getResponse } = mockHttpRequest({ method: 'GET', url: '/non_existent_route' });

    await handleRequest(req, res, {
      environment: 'production',
      webhookSecret: TEST_WEBHOOK_SECRET,
      proxySecret: TEST_PROXY_SECRET,
    });

    const resp = getResponse();
    expect(resp.status).toBe(404);
    expect(resp.data.error).toContain('NOT_FOUND');
  });

  it('POST /webhook rejects invalid Razorpay signature with HTTP 401', async () => {
    const payload = JSON.stringify({
      event: 'payment.captured',
      payload: { payment: { entity: { id: 'pay_test_123', order_id: 'order_test_123' } } },
    });

    const { req, res, getResponse } = mockHttpRequest({
      method: 'POST',
      url: '/webhook',
      headers: {
        'x-razorpay-signature': 'invalid_forged_signature_hex_value',
        'content-type': 'application/json',
      },
    });

    // Provide body to the mock request
    setTimeout(() => {
      req.emit('data', Buffer.from(payload));
      req.emit('end');
    }, 10);

    await handleRequest(req, res, {
      environment: 'production',
      webhookSecret: TEST_WEBHOOK_SECRET,
      proxySecret: TEST_PROXY_SECRET,
    });

    const resp = getResponse();
    expect(resp.status).toBe(401);
    expect(resp.data.success).toBe(false);
    expect(resp.data.error).toContain('INVALID_RAZORPAY_WEBHOOK_SIGNATURE');
  });

  it('POST /webhook accepts and ignores non-payment events with HTTP 200', async () => {
    const payload = JSON.stringify({
      event: 'payment.failed',
      payload: { payment: { entity: { id: 'pay_test_failed_001', order_id: 'order_test_failed_001' } } },
    });
    const sig = crypto.createHmac('sha256', TEST_WEBHOOK_SECRET).update(payload).digest('hex');

    const { req, res, getResponse } = mockHttpRequest({
      method: 'POST',
      url: '/webhook',
      headers: {
        'x-razorpay-signature': sig,
        'content-type': 'application/json',
      },
    });

    setTimeout(() => {
      req.emit('data', Buffer.from(payload));
      req.emit('end');
    }, 10);

    await handleRequest(req, res, {
      environment: 'production',
      webhookSecret: TEST_WEBHOOK_SECRET,
      proxySecret: TEST_PROXY_SECRET,
    });

    const resp = getResponse();
    expect(resp.status).toBe(200);
    expect(resp.data.success).toBe(true);
    expect(resp.data.ignored).toBe(true);
  });

  it('GET /admin/dlq requires admin authentication', async () => {
    const { req, res, getResponse } = mockHttpRequest({
      method: 'GET',
      url: '/admin/dlq',
      headers: { authorization: 'Bearer wrong_secret' },
    });

    await handleRequest(req, res, {
      environment: 'production',
      webhookSecret: TEST_WEBHOOK_SECRET,
      proxySecret: TEST_PROXY_SECRET,
      adminSecret: TEST_ADMIN_SECRET,
    });

    const resp = getResponse();
    expect(resp.status).toBe(403);
    expect(resp.data.error).toContain('FORBIDDEN');
  });

  it('accepts webhooks signed with international webhook secret (dual-account support)', async () => {
    const INTL_SECRET = 'intl_secret_for_foreign_razorpay_account';
    const payload = JSON.stringify({
      event: 'payment.failed',
      payload: { payment: { entity: { id: 'pay_intl_001', order_id: 'order_intl_001' } } }
    });
    const sig = crypto.createHmac('sha256', INTL_SECRET).update(payload, 'utf8').digest('hex');

    const { req, res, getResponse } = mockHttpRequest({
      method: 'POST',
      url: '/webhook',
      headers: {
        'x-razorpay-signature': sig,
        'content-type': 'application/json',
      },
    });

    setTimeout(() => {
      req.emit('data', Buffer.from(payload));
      req.emit('end');
    }, 10);

    await handleRequest(req, res, {
      environment: 'production',
      webhookSecret: TEST_WEBHOOK_SECRET,
      webhookSecretIntl: INTL_SECRET,
      proxySecret: TEST_PROXY_SECRET,
    });

    const resp = getResponse();
    expect(resp.status).toBe(200);
    expect(resp.data.success).toBe(true);
    expect(resp.data.ignored).toBe(true);
  });

  it('createProxyServer initializes cleanly without crashing', () => {
    const { server, config } = createProxyServer({
      port: 3999,
      environment: 'production',
    });
    expect(server).toBeDefined();
    expect(config.port).toBe(3999);
  });
});
