# TECH TYCOON CENTRAL WEBHOOK PROXY

## Overview
The Central Webhook Proxy is a high-performance, secure Node.js service that acts as an authenticated bridge between Razorpay Webhooks and the 8 dedicated Google Apps Script projects powering `course.techtycoon.in`.

### Why this proxy is necessary:
1. **Google Apps Script Limitation**: Google Apps Script's `doPost(e)` does not expose incoming HTTP request headers, preventing direct verification of `X-Razorpay-Signature`.
2. **Multi-Course Routing**: Razorpay accounts receive webhooks for all 8 Tech Tycoon courses on a single webhook URL. This proxy inspects the payment metadata (`product_key` or course title) and routes the event to the correct course's Google Apps Script backend.
3. **Cryptographic Protection**: The proxy verifies the Razorpay signature, computes an 8-field payload digest, and signs a tamper-resistant forward payload using a shared `WEBHOOK_PROXY_SECRET` before forwarding.
4. **Dead Letter Queue (DLQ)**: If Google Apps Script is temporarily unavailable, failed events are queued for automated retry so zero payments are ever lost.

---

## 1. Environment Variables

Configure these variables in your hosting environment (e.g., Render, Railway, VPS, or `.env`):

| Variable Name | Required | Default | Description |
| :--- | :---: | :---: | :--- |
| `PORT` | No | `3000` | HTTP port for the proxy listener. |
| `APP_ENVIRONMENT` | Yes | `production` | Environment mode (`production`, `staging`, or `local_test`). |
| `RAZORPAY_WEBHOOK_SECRET` | Yes | — | Secret configured in the Razorpay Dashboard for webhook signature verification. |
| `WEBHOOK_PROXY_SECRET` | Yes | — | Shared secret between the proxy and Google Apps Script (`WEBHOOK_PROXY_SECRET` in Script Properties). |
| `ADMIN_API_SECRET` | No | — | Bearer token for accessing `/admin/dlq` and `/admin/reconcile`. |
| `RAZORPAY_KEY_ID` | No | — | Razorpay Key ID for administrative payment lookups. |
| `RAZORPAY_KEY_SECRET` | No | — | Razorpay Key Secret for administrative payment lookups. |

### Optional Course URL Overrides:
You can override default Google Apps Script endpoints without touching code:
- `APPS_SCRIPT_URL_CLAUDE_MASTERCLASS`
- `APPS_SCRIPT_URL_ACADEMY`
- `APPS_SCRIPT_URL_ADVANCED_MASTERCLASS`
- `APPS_SCRIPT_URL_AI_BGM`
- `APPS_SCRIPT_URL_AI_MASTERCLASS`
- `APPS_SCRIPT_URL_CONSULTING`
- `APPS_SCRIPT_URL_PROFESSIONALS`
- `APPS_SCRIPT_URL_UPSCALE`

---

## 2. API Routes

### Public Endpoints:
- `GET /health` or `GET /`: Health check endpoint. Returns service status, uptime, protocol version (`v2.1`), and registered course routes.
- `POST /webhook` or `POST /webhook/razorpay`: Razorpay webhook receiver. Validates `X-Razorpay-Signature`, maps course route, signs payload, and dispatches to Apps Script.

### Protected Administrative Endpoints:
Requires `Authorization: Bearer <ADMIN_API_SECRET>` header:
- `GET /admin/dlq`: Inspects the Dead Letter Queue for dropped or failed deliveries.
- `POST /admin/reconcile`: Initiates automated server-to-server reconciliation for interrupted payments.

---

## 3. Running Locally

```bash
# Start the proxy server
export RAZORPAY_WEBHOOK_SECRET="your_razorpay_webhook_secret"
export WEBHOOK_PROXY_SECRET="your_proxy_shared_secret"
node backend/webhook_proxy/server.js
```

### Health Check Probe:
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "HEALTHY",
  "service": "techtycoon-razorpay-proxy",
  "protocol_version": "v2.1",
  "environment": "production",
  "uptime_seconds": 12,
  "timestamp": "2026-10-21T12:00:00.000Z",
  "registered_routes": [
    "upscale",
    "advanced_masterclass",
    "ai_bgm",
    "claude_masterclass",
    "academy",
    "consulting",
    "professionals",
    "ai_masterclass"
  ]
}
```

---

## 4. Deploying to Production (Render / Railway / VPS)

### Option A: Deploy to Render or Railway
1. **Build Command**: (none required, uses Node.js standard runtime)
2. **Start Command**: `node backend/webhook_proxy/server.js`
3. **Environment Variables**: Add `RAZORPAY_WEBHOOK_SECRET` and `WEBHOOK_PROXY_SECRET`.

### Option B: Run with PM2 on VPS
```bash
pm2 start backend/webhook_proxy/server.js --name "techtycoon-webhook-proxy"
pm2 save
pm2 startup
```

---

## 5. Razorpay Dashboard Configuration

1. Log into your **Razorpay Dashboard** (https://dashboard.razorpay.com).
2. Navigate to **Settings > Webhooks > Add New Webhook**.
3. Set **Webhook URL** to: `https://<your-proxy-domain>/webhook`
4. Set **Secret** to: your `RAZORPAY_WEBHOOK_SECRET`.
5. Select the following **Active Events**:
   - `payment.captured`
   - `order.paid`
6. Click **Save Webhook**.
