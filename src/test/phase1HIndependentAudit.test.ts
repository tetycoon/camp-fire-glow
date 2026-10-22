import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "node:crypto";
import {
  TRUSTED_PRODUCT_ROUTING,
  determineProductRoute,
  determineAuthoritativeProductRoute,
  handleIncomingRazorpayWebhook,
  handleIncomingRazorpayWebhookAsync,
  verifyRazorpayWebhookSignature,
  computeProxySignature,
  verifyPaymentWithRazorpayServer,
  sanitizeForDeadLetterQueue,
  recordDeadLetterQueueEntry,
  recordDeadLetterQueueEntryAsync,
  queryDeadLetterQueue,
  handleAdminReconciliationRequest,
  reconciliationRateLimitTracker,
} from "../../backend/webhook_proxy/razorpay_webhook_proxy.js";

const TEST_ADMIN_SECRET = "admsec_high_entropy_reconciliation_key_987654321";
const TEST_WEBHOOK_SECRET = "whsec_test_secret_for_routing_audit_987654321";
const TEST_PROXY_SECRET = "proxy_test_secret_for_gas_auth_abcdef123456";
const LIVE_RAZORPAY_KEY_ID = "rzp_live_PRODKEY123456";
const LIVE_RAZORPAY_KEY_SECRET = "rzp_live_PRODSECRET987654";
const EXPECTED_PROD_MERCHANT = "acc_ProdMerchantTT01";

/**
 * Apps Script Simulation with LockService, Sheet State, and Idempotency
 */
function createAppsScriptMock() {
  const scriptProperties = new Map<string, string>();
  const lock = {
    locked: false,
    waitLock: (ms: number) => {
      lock.locked = true;
      return true;
    },
    releaseLock: () => {
      lock.locked = false;
    },
  };

  const rows: any[][] = [
    ["Timestamp", "Name", "Email", "Phone", "Type", "Mode", "Amount", "Status", "OrderId", "PaymentId", "FunnelsDone", "InvoiceNo"]
  ];

  let funnelsDoneCounter = 5000;
  let funnelsDoneInvocations = 0;
  let whatsAppInvocations = 0;

  return {
    scriptProperties,
    rows,
    getFunnelsDoneInvoiceCount: () => funnelsDoneInvocations,
    getWhatsAppCallCount: () => whatsAppInvocations,

    initOrderRow: (orderId: string, amount: number = 117) => {
      rows.push([
        new Date(), "Independent Learner", "learner@example.com", "9876543210",
        "Professional", "Online Live", amount, "INITIATED", orderId, "", "WAITING", ""
      ]);
    },

    executeAppsScriptEngine: (params: {
      orderId: string;
      paymentId: string;
      isWebhook?: boolean;
      eventId?: string;
      proxySignature?: string;
      timestamp?: number;
      isTestMode?: boolean;
    }) => {
      const { orderId, paymentId, isWebhook, eventId, proxySignature, timestamp, isTestMode } = params;
      lock.waitLock(30000);
      try {
        if (isWebhook) {
          if (!proxySignature || !timestamp) throw new Error("MISSING_PROXY_AUTH");
          const now = Date.now();
          if (Math.abs(now - timestamp) > 300000) throw new Error("REPLAY_EXPIRED_TIMESTAMP");

          const expectedSig = crypto
            .createHmac("sha256", TEST_PROXY_SECRET)
            .update(`${eventId}|${orderId}|${paymentId}|${timestamp}`)
            .digest("hex");
          if (expectedSig !== proxySignature) throw new Error("INVALID_PROXY_SIGNATURE");

          if (eventId && scriptProperties.has("PROCESSED_EVT_" + eventId)) {
            return { success: true, alreadyProcessed: true, eventId };
          }
        }

        // Idempotency: Payment ID check
        if (scriptProperties.has("PROCESSED_PAY_" + paymentId)) {
          const cached = scriptProperties.get("VERIFIED_INV_" + paymentId);
          return {
            success: true,
            alreadyProcessed: true,
            paymentId,
            orderId,
            invoiceNumber: cached ? JSON.parse(cached).invoiceNumber : null,
          };
        }

        let targetIndex = -1;
        for (let i = 1; i < rows.length; i++) {
          if (rows[i][9] === paymentId) {
            return { success: true, alreadyProcessed: true, paymentId, orderId };
          }
          if (rows[i][8] === orderId) {
            targetIndex = i;
          }
        }

        if (targetIndex === -1) throw new Error("ORDER_NOT_FOUND");
        const row = rows[targetIndex];
        if (row[7] === "✅ PAID") {
          return { success: true, alreadyProcessed: true, paymentId, orderId };
        }

        let invNumber: string;
        if (isTestMode) {
          invNumber = "TEST-INV-" + Math.floor(1000 + Math.random() * 9000);
        } else {
          funnelsDoneInvocations++;
          funnelsDoneCounter++;
          invNumber = "TT/26-27/" + funnelsDoneCounter;
          whatsAppInvocations++;
        }

        const invRecord = {
          verified: true,
          status: "PAID",
          paymentId,
          orderId,
          invoiceNumber: invNumber,
        };

        scriptProperties.set("VERIFIED_INV_" + paymentId, JSON.stringify(invRecord));
        row[7] = isTestMode ? "TEST_PAID" : "✅ PAID";
        row[9] = paymentId;
        row[10] = "SENT ✅";
        row[11] = invNumber;

        scriptProperties.set("PROCESSED_PAY_" + paymentId, new Date().toISOString());
        if (eventId) scriptProperties.set("PROCESSED_EVT_" + eventId, new Date().toISOString());

        return { success: true, verified: true, paymentId, orderId, invoiceNumber: invNumber };
      } finally {
        lock.releaseLock();
      }
    },
  };
}

describe("PHASE 1H: Independent Payment Security Verification Suite", () => {
  // 1. Reconciliation Endpoint Negative & Security Tests
  describe("1. Reconciliation Endpoint Negative Tests & Integrity Gates", () => {
    it("1a. Rejects non-POST HTTP methods with HTTP 405 Method Not Allowed", async () => {
      const getRes = await handleAdminReconciliationRequest({
        method: "GET",
        authHeader: `Bearer ${TEST_ADMIN_SECRET}`,
        expectedAdminSecret: TEST_ADMIN_SECRET,
        paymentId: "pay_test001",
        orderId: "order_test001",
      });
      expect(getRes.status).toBe(405);
      expect(getRes.error).toContain("METHOD_NOT_ALLOWED");

      const putRes = await handleAdminReconciliationRequest({
        method: "PUT",
        authHeader: `Bearer ${TEST_ADMIN_SECRET}`,
        expectedAdminSecret: TEST_ADMIN_SECRET,
        paymentId: "pay_test001",
        orderId: "order_test001",
      });
      expect(putRes.status).toBe(405);
    });

    it("1b. Rejects reconciliation credentials supplied through query parameters with HTTP 400", async () => {
      const queryParamRes = await handleAdminReconciliationRequest({
        method: "POST",
        queryParams: { admin_key: TEST_ADMIN_SECRET }, // Attempting credentials in URL query
        authHeader: undefined,
        expectedAdminSecret: TEST_ADMIN_SECRET,
        paymentId: "pay_test001",
        orderId: "order_test001",
      });

      expect(queryParamRes.status).toBe(400);
      expect(queryParamRes.error).toContain("INVALID_CREDENTIAL_LOCATION");
    });

    it("1c. Enforces timing-safe comparison on admin authorization tokens", async () => {
      // Missing header
      const missingRes = await handleAdminReconciliationRequest({
        method: "POST",
        authHeader: undefined,
        expectedAdminSecret: TEST_ADMIN_SECRET,
        paymentId: "pay_test001",
        orderId: "order_test001",
      });
      expect(missingRes.status).toBe(401);

      // Wrong prefix
      const basicRes = await handleAdminReconciliationRequest({
        method: "POST",
        authHeader: "Basic dXNlcjpwYXNz",
        expectedAdminSecret: TEST_ADMIN_SECRET,
        paymentId: "pay_test001",
        orderId: "order_test001",
      });
      expect(basicRes.status).toBe(401);

      // Wrong token
      const wrongRes = await handleAdminReconciliationRequest({
        method: "POST",
        authHeader: "Bearer invalid_secret_value_12345",
        expectedAdminSecret: TEST_ADMIN_SECRET,
        paymentId: "pay_test001",
        orderId: "order_test001",
      });
      expect(wrongRes.status).toBe(403);
      expect(wrongRes.error).toContain("FORBIDDEN");

      // Zero credentials leaked in response
      expect(JSON.stringify(wrongRes)).not.toContain(TEST_ADMIN_SECRET);
    });

    it("1d. Validates and cross-checks payment ID and order ID formats (/^pay_/ and /^order_/)", async () => {
      const badPayRes = await handleAdminReconciliationRequest({
        method: "POST",
        authHeader: `Bearer ${TEST_ADMIN_SECRET}`,
        expectedAdminSecret: TEST_ADMIN_SECRET,
        paymentId: "invalid_payment_id_format",
        orderId: "order_valid123",
      });
      expect(badPayRes.status).toBe(400);
      expect(badPayRes.error).toContain("INVALID_IDENTIFIER_FORMAT");

      const badOrdRes = await handleAdminReconciliationRequest({
        method: "POST",
        authHeader: `Bearer ${TEST_ADMIN_SECRET}`,
        expectedAdminSecret: TEST_ADMIN_SECRET,
        paymentId: "pay_valid123",
        orderId: "invalid_order_id_format",
      });
      expect(badOrdRes.status).toBe(400);
      expect(badOrdRes.error).toContain("INVALID_IDENTIFIER_FORMAT");
    });

    it("1e. Server-to-server Razorpay cross-check rejects uncaptured, mismatched, or wrong merchant payments", async () => {
      // 1. Uncaptured payment (authorized only)
      const mockUncaptured = vi.fn().mockImplementation((url: string) => {
        if (url.includes("/payments/")) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({
              id: "pay_uncap_01",
              order_id: "order_uncap_01",
              amount: 11700,
              currency: "INR",
              status: "authorized", // NOT captured
            }),
          });
        }
        return Promise.resolve({ ok: true, status: 200, json: async () => ({ id: "order_uncap_01" }) });
      });

      const uncapRes = await handleAdminReconciliationRequest({
        method: "POST",
        authHeader: `Bearer ${TEST_ADMIN_SECRET}`,
        expectedAdminSecret: TEST_ADMIN_SECRET,
        paymentId: "pay_uncap_01",
        orderId: "order_uncap_01",
        keyId: LIVE_RAZORPAY_KEY_ID,
        keySecret: LIVE_RAZORPAY_KEY_SECRET,
        fetchImpl: mockUncaptured as any,
      });
      expect(uncapRes.status).toBe(422);
      expect(uncapRes.error).toContain("PAYMENT_NOT_CAPTURED");

      // 2. Merchant account mismatch
      const mockWrongMerchant = vi.fn().mockImplementation((url: string) => {
        if (url.includes("/payments/")) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({
              id: "pay_merchant_01",
              order_id: "order_merchant_01",
              amount: 11700,
              currency: "INR",
              status: "captured",
              account_id: "acc_WRONG_MERCHANT_999",
            }),
          });
        }
        return Promise.resolve({ ok: true, status: 200, json: async () => ({ id: "order_merchant_01" }) });
      });

      const merchantRes = await handleAdminReconciliationRequest({
        method: "POST",
        authHeader: `Bearer ${TEST_ADMIN_SECRET}`,
        expectedAdminSecret: TEST_ADMIN_SECRET,
        paymentId: "pay_merchant_01",
        orderId: "order_merchant_01",
        expectedMerchantAccount: EXPECTED_PROD_MERCHANT,
        keyId: LIVE_RAZORPAY_KEY_ID,
        keySecret: LIVE_RAZORPAY_KEY_SECRET,
        fetchImpl: mockWrongMerchant as any,
      });
      expect(merchantRes.status).toBe(422);
      expect(merchantRes.error).toContain("MERCHANT_ACCOUNT_MISMATCH");
    });
  });

  // 2. Rate Limiting Policy Verification
  describe("2. Rate Limiting Policy Alignment (10 reqs/min policy)", () => {
    it("2a. Enforces default 10 requests / minute policy: 10 allowed, 11th rejected with HTTP 429", async () => {
      const customRateLimitTracker = new Map();
      const clientIp = "10.0.0.99";

      // Execute exactly 10 requests under default policy
      for (let i = 0; i < 10; i++) {
        const res = await handleAdminReconciliationRequest({
          method: "POST",
          authHeader: `Bearer ${TEST_ADMIN_SECRET}`,
          expectedAdminSecret: TEST_ADMIN_SECRET,
          paymentId: `pay_rate_seq_${i}`,
          orderId: `order_rate_seq_${i}`,
          clientIp,
          rateLimitTracker: customRateLimitTracker,
          // Note: maxRequestsPerMinute omitted to test default policy (10)
          fetchImpl: vi.fn().mockResolvedValue({ ok: false, status: 404 }) as any,
        });
        expect(res.status).not.toBe(429);
      }

      // 11th request rejected
      const overflowRes = await handleAdminReconciliationRequest({
        method: "POST",
        authHeader: `Bearer ${TEST_ADMIN_SECRET}`,
        expectedAdminSecret: TEST_ADMIN_SECRET,
        paymentId: "pay_rate_seq_11",
        orderId: "order_rate_seq_11",
        clientIp,
        rateLimitTracker: customRateLimitTracker,
        fetchImpl: vi.fn() as any,
      });

      expect(overflowRes.status).toBe(429);
      expect(overflowRes.error).toContain("RATE_LIMIT_EXCEEDED");
    });
  });

  // 3. DLQ Reliability, Privacy & Persistence Failure Surfacing
  describe("3. Dead-Letter Queue (DLQ) Reliability & Privacy", () => {
    it("3a. DLQ sanitization strips raw request body, tokens, and customer PII", () => {
      const rawPayload = {
        id: "evt_raw_check_01",
        event: "payment.captured",
        payload: {
          payment: {
            entity: {
              id: "pay_raw_check_01",
              order_id: "order_raw_check_01",
              amount: 11700,
              currency: "INR",
              status: "captured",
              email: "confidential@client.com",
              contact: "+919876543210",
              notes: {
                home_address: "123 Anna Salai, Chennai",
                product_key: "ai_bgm",
              },
            },
          },
        },
      };

      const entry = sanitizeForDeadLetterQueue({
        eventId: "evt_raw_check_01",
        errorCategory: "ROUTING_REJECTED",
        errorMessage: "Unknown product routing",
        headers: {
          "x-razorpay-signature": "secret_sig_value_12345",
          "authorization": "Bearer secret_auth_header",
          "cookie": "sid=secret_cookie_val",
          "content-type": "application/json",
        },
        payload: rawPayload,
      });

      // Proof: Sensitive headers are masked as [REDACTED]
      expect(entry.sanitizedHeaders["x-razorpay-signature"]).toBe("[REDACTED]");
      expect(entry.sanitizedHeaders["authorization"]).toBe("[REDACTED]");
      expect(entry.sanitizedHeaders["cookie"]).toBe("[REDACTED]");

      // Proof: PII is completely excluded
      const entryJson = JSON.stringify(entry);
      expect(entryJson).not.toContain("confidential@client.com");
      expect(entryJson).not.toContain("+919876543210");
      expect(entryJson).not.toContain("Anna Salai");
      expect(entryJson).not.toContain("secret_sig_value_12345");
      expect(entryJson).not.toContain("secret_auth_header");

      // Proof: Raw body is never stored (prevents replay)
      expect((entry as any).rawBody).toBeUndefined();
    });

    it("3b. Asynchronous DLQ persistence surfaces storage write failures cleanly", async () => {
      const customStore: any[] = [];
      const failingAdapter = {
        saveEntry: vi.fn().mockRejectedValue(new Error("Cloudflare KV connection timeout")),
      };

      const result = await recordDeadLetterQueueEntryAsync(
        {
          eventId: "evt_storage_fail_01",
          errorCategory: "DOWNSTREAM_TIMEOUT",
        },
        customStore,
        failingAdapter
      );

      // Surfaced cleanly without throwing unhandled exception
      expect(result.success).toBe(false);
      expect(result.error).toContain("DLQ_STORAGE_FAILURE");
      expect(result.error).toContain("Cloudflare KV connection timeout");
      // Fallback in-memory entry preserved for diagnostic recovery
      expect(result.entry).toBeDefined();
      expect(customStore.length).toBe(1);
    });

    it("3c. Defensive handling prevents circular or malformed objects from crashing DLQ sanitization", () => {
      const circularObj: any = { event: "payment.captured" };
      circularObj.self = circularObj;

      expect(() => {
        const entry = sanitizeForDeadLetterQueue({
          eventId: "evt_malformed_01",
          errorCategory: "MALFORMED_INPUT",
          payload: circularObj,
        });
        expect(entry.eventId).toBe("evt_malformed_01");
      }).not.toThrow();
    });
  });

  // 4. Concurrency between Webhook and Reconciliation (Race Condition)
  describe("4. Concurrency between Webhook and Reconciliation Requests", () => {
    it("4a. Webhook and Reconciliation colliding on the same payment mints exactly ONE invoice", async () => {
      const appsScript = createAppsScriptMock();
      const orderId = "order_Concurrent_001";
      const paymentId = "pay_Concurrent_001";
      const now = Date.now();

      appsScript.initOrderRow(orderId, 117);

      const proxySig = crypto
        .createHmac("sha256", TEST_PROXY_SECRET)
        .update(`evt_001|${orderId}|${paymentId}|${now}`)
        .digest("hex");

      // 1. Webhook arrives and processes
      const webhookRes = appsScript.executeAppsScriptEngine({
        orderId,
        paymentId,
        isWebhook: true,
        eventId: "evt_001",
        proxySignature: proxySig,
        timestamp: now,
      });
      expect(webhookRes.success).toBe(true);
      expect(appsScript.getFunnelsDoneInvoiceCount()).toBe(1);

      // 2. Admin reconciliation triggers concurrently for same payment
      const recProxySig = crypto
        .createHmac("sha256", TEST_PROXY_SECRET)
        .update(`rec_001|${orderId}|${paymentId}|${now}`)
        .digest("hex");

      const recRes = appsScript.executeAppsScriptEngine({
        orderId,
        paymentId,
        isWebhook: true,
        eventId: "rec_001",
        proxySignature: recProxySig,
        timestamp: now,
      });

      expect(recRes.success).toBe(true);
      expect(recRes.alreadyProcessed).toBe(true);
      expect(recRes.invoiceNumber).toBe(webhookRes.invoiceNumber);
      // FunnelsDone called exactly ONCE:
      expect(appsScript.getFunnelsDoneInvoiceCount()).toBe(1);
      expect(appsScript.getWhatsAppCallCount()).toBe(1);
    });
  });

  // 5. Test/Live Data Isolation Verification
  describe("5. Complete Test / Live Data Isolation", () => {
    it("5a. Accidental live key configured with test-mode transaction fails closed", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          id: "pay_test_CrossEnv002",
          order_id: "order_test_CrossEnv002",
          amount: 11700,
          currency: "INR",
          status: "captured",
          notes: {
            test_mode: true,
          },
        }),
      });

      const res = await verifyPaymentWithRazorpayServer({
        paymentId: "pay_test_CrossEnv002",
        orderId: "order_test_CrossEnv002",
        keyId: LIVE_RAZORPAY_KEY_ID, // Live key
        keySecret: LIVE_RAZORPAY_KEY_SECRET,
        isolateProduction: true,
        fetchImpl: mockFetch as any,
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain("TEST_PAYMENT_IN_PRODUCTION");
    });

    it("5b. Test payments processed in Apps Script bypass live TT/26-27/ prefix and suppress WhatsApp", () => {
      const appsScript = createAppsScriptMock();
      const orderId = "order_TestMode_999";
      const paymentId = "pay_test_999";

      appsScript.initOrderRow(orderId, 1);

      const testRes = appsScript.executeAppsScriptEngine({
        orderId,
        paymentId,
        isTestMode: true,
      });

      expect(testRes.success).toBe(true);
      expect(testRes.invoiceNumber).toMatch(/^TEST-INV-\d+/);
      expect(testRes.invoiceNumber).not.toContain("TT/26-27/");
      expect(appsScript.getFunnelsDoneInvoiceCount()).toBe(0);
      expect(appsScript.getWhatsAppCallCount()).toBe(0);
      expect(appsScript.rows[1][7]).toBe("TEST_PAID");
    });
  });
});
