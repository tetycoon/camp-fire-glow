/**
 * TECH TYCOON CENTRAL WEBHOOK PROXY SERVER
 * Production Standalone HTTP Service
 *
 * Sits as the authenticated bridge between Razorpay Webhooks and the 8 Google Apps Script backends.
 * Uses native node:http for maximum performance, security, and zero external dependencies.
 */

import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  handleIncomingRazorpayWebhook,
  forwardWebhookToAppsScript,
  recordDeadLetterQueueEntry,
  queryDeadLetterQueue,
  handleAdminReconciliationRequest,
  inMemoryDeadLetterQueue,
  TRUSTED_PRODUCT_ROUTING,
} from './razorpay_webhook_proxy.js';

// Configuration derived authoritatively from environment variables
export function getServerConfig() {
  const env = String(
    process.env.APP_ENVIRONMENT ||
    (process.env.NODE_ENV === 'test' ? 'local_test' : process.env.NODE_ENV) ||
    'production'
  ).trim().toLowerCase();

  return {
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || '0.0.0.0',
    environment: env,
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
    webhookSecretIntl: process.env.RAZORPAY_WEBHOOK_SECRET_INTL || '',
    proxySecret: process.env.WEBHOOK_PROXY_SECRET || '',
    adminSecret: process.env.ADMIN_API_SECRET || '',
    customEndpointMap: {
      upscale: process.env.APPS_SCRIPT_URL_UPSCALE || '',
      advanced_masterclass: process.env.APPS_SCRIPT_URL_ADVANCED_MASTERCLASS || '',
      ai_bgm: process.env.APPS_SCRIPT_URL_AI_BGM || '',
      claude_masterclass: process.env.APPS_SCRIPT_URL_CLAUDE_MASTERCLASS || '',
      academy: process.env.APPS_SCRIPT_URL_ACADEMY || '',
      consulting: process.env.APPS_SCRIPT_URL_CONSULTING || '',
      professionals: process.env.APPS_SCRIPT_URL_PROFESSIONALS || '',
      ai_masterclass: process.env.APPS_SCRIPT_URL_AI_MASTERCLASS || '',
    }
  };
}

/**
 * Reads the entire request body into a UTF-8 string.
 */
function readRequestBody(req, maxBytes = 1048576) { // 1 MB limit
  return new Promise((resolve, reject) => {
    let body = '';
    let totalBytes = 0;

    req.on('data', (chunk) => {
      totalBytes += chunk.length;
      if (totalBytes > maxBytes) {
        req.destroy();
        reject(new Error('PAYLOAD_TOO_LARGE: Request payload exceeded 1MB limit.'));
        return;
      }
      body += chunk;
    });

    req.on('end', () => resolve(body));
    req.on('error', (err) => reject(err));
  });
}

/**
 * Sends a structured JSON response with security headers.
 */
function sendJsonResponse(res, statusCode, data) {
  const payload = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
  });
  res.end(payload);
}

/**
 * Main request router
 */
export async function handleRequest(req, res, configOverrides = {}) {
  const config = { ...getServerConfig(), ...configOverrides };
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname;
  const method = req.method.toUpperCase();

  // 1. Health check endpoint (GET / or GET /health)
  if (method === 'GET' && (pathname === '/health' || pathname === '/')) {
    return sendJsonResponse(res, 200, {
      status: 'HEALTHY',
      service: 'techtycoon-razorpay-proxy',
      protocol_version: 'v2.1',
      environment: config.environment,
      uptime_seconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
      registered_routes: Object.keys(TRUSTED_PRODUCT_ROUTING),
    });
  }

  // 2. Razorpay Webhook Receiver (POST /webhook or POST /webhook/razorpay)
  if (method === 'POST' && (pathname === '/webhook' || pathname === '/webhook/razorpay')) {
    try {
      const rawBody = await readRequestBody(req);
      const signatureHeader = req.headers['x-razorpay-signature'] || '';

      if (!config.webhookSecret) {
        console.error('[CONFIG_ERROR] RAZORPAY_WEBHOOK_SECRET is not configured.');
        return sendJsonResponse(res, 500, {
          success: false,
          error: 'CONFIGURATION_ERROR: Server webhook credentials are missing.',
        });
      }

      if (!config.proxySecret) {
        console.error('[CONFIG_ERROR] WEBHOOK_PROXY_SECRET is not configured.');
        return sendJsonResponse(res, 500, {
          success: false,
          error: 'CONFIGURATION_ERROR: Server proxy credentials are missing.',
        });
      }

      // Authenticate, validate, and construct authenticated v2.1 forward payload
      const webhookResult = handleIncomingRazorpayWebhook({
        rawBody,
        signature: signatureHeader,
        webhookSecret: config.webhookSecret,
        webhookSecretIntl: config.webhookSecretIntl,
        proxySecret: config.proxySecret,
        environment: config.environment,
        customEndpointMap: config.customEndpointMap,
      });

      if (!webhookResult.success) {
        const statusCode = webhookResult.status || 400;
        console.warn(`[WEBHOOK_REJECTED] HTTP ${statusCode} - ${webhookResult.error}`);
        return sendJsonResponse(res, statusCode, {
          success: false,
          error: webhookResult.error,
        });
      }

      // If the event is irrelevant (e.g. payment.pending, refund.created), acknowledge with 200
      if (webhookResult.ignored) {
        return sendJsonResponse(res, 200, {
          success: true,
          ignored: true,
          message: webhookResult.message,
        });
      }

      // Dispatch authenticated v2.1 payload to target Google Apps Script Web App
      try {
        const gasResponse = await forwardWebhookToAppsScript({
          forwardPayload: webhookResult.forwardPayload,
          targetUrl: webhookResult.targetUrl,
        });

        const gasStatus = gasResponse.status;
        console.log(`[FORWARD_SUCCESS] Product: ${webhookResult.targetProduct} | Status: ${gasStatus} | Event: ${webhookResult.forwardPayload.eventId}`);

        return sendJsonResponse(res, 200, {
          success: true,
          forwarded: true,
          product: webhookResult.targetProduct,
          productName: webhookResult.productName,
          eventId: webhookResult.forwardPayload.eventId,
          gasStatus: gasStatus,
        });

      } catch (forwardErr) {
        console.error(`[FORWARD_FAILURE] Failed to dispatch to Google Apps Script (${webhookResult.targetProduct}): ${forwardErr.message}`);

        // Record to Dead Letter Queue for idempotent replay
        recordDeadLetterQueueEntry({
          error: forwardErr.message,
          targetUrl: webhookResult.targetUrl,
          targetProduct: webhookResult.targetProduct,
          forwardPayload: webhookResult.forwardPayload,
        });

        // Return HTTP 503 so Razorpay's exponential backoff retries delivery
        return sendJsonResponse(res, 503, {
          success: false,
          queued_in_dlq: true,
          error: 'FORWARDING_TEMPORARILY_FAILED: Recorded to DLQ for automated retry.',
        });
      }

    } catch (err) {
      console.error(`[REQUEST_ERROR] ${err.message}`);
      return sendJsonResponse(res, err.message.includes('PAYLOAD_TOO_LARGE') ? 413 : 500, {
        success: false,
        error: err.message,
      });
    }
  }

  // 3. Admin Dead Letter Queue (GET /admin/dlq)
  if (method === 'GET' && pathname === '/admin/dlq') {
    const authHeader = req.headers.authorization || '';
    const dlqResult = queryDeadLetterQueue(authHeader, config.adminSecret);
    return sendJsonResponse(res, dlqResult.status, dlqResult);
  }

  // 4. Admin Reconciliation Endpoint (POST /admin/reconcile)
  if (method === 'POST' && pathname === '/admin/reconcile') {
    try {
      const authHeader = req.headers.authorization || '';
      const clientIp = req.socket.remoteAddress || '127.0.0.1';
      const body = JSON.parse((await readRequestBody(req)) || '{}');

      const reconcileResult = await handleAdminReconciliationRequest({
        authHeader,
        expectedAdminSecret: config.adminSecret,
        clientIp,
        method,
        paymentId: body.paymentId,
        orderId: body.orderId,
        productKey: body.productKey,
        keyId: process.env.RAZORPAY_KEY_ID,
        keySecret: process.env.RAZORPAY_KEY_SECRET,
        proxySecret: config.proxySecret,
        environment: config.environment,
      });

      return sendJsonResponse(res, reconcileResult.status || 200, reconcileResult);
    } catch (reconcileErr) {
      return sendJsonResponse(res, 400, {
        success: false,
        error: `RECONCILIATION_FAILED: ${reconcileErr.message}`,
      });
    }
  }

  // 5. Catch-all: Route Not Found
  return sendJsonResponse(res, 404, {
    success: false,
    error: 'NOT_FOUND: The requested route does not exist.',
  });
}

/**
 * Creates and starts the HTTP server
 */
export function createProxyServer(configOverrides = {}) {
  const config = { ...getServerConfig(), ...configOverrides };
  const server = http.createServer((req, res) => handleRequest(req, res, config));
  return { server, config };
}

// Direct execution entrypoint
const isMain = process.argv[1] && (
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url)) ||
  process.argv[1].endsWith('server.js')
);
if (isMain) {
  const { server, config } = createProxyServer();
  server.listen(config.port, config.host, () => {
    console.log('================================================================');
    console.log('TECH TYCOON RAZORPAY CENTRAL WEBHOOK PROXY');
    console.log(`Status: LISTENING on http://${config.host}:${config.port}`);
    console.log(`Environment: ${config.environment}`);
    console.log(`Routes Registered: 8 Course Apps Script Endpoints`);
    console.log('================================================================');
  });

  // Graceful shutdown handling
  const shutdown = (signal) => {
    console.log(`\nReceived ${signal}. Gracefully shutting down webhook proxy...`);
    server.close(() => {
      console.log('HTTP server closed cleanly. Exiting.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}
