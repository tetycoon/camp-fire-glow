import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "node:crypto";
import {
  sanitizeForDeadLetterQueue,
  recordDeadLetterQueueEntry,
  queryDeadLetterQueue,
  handleAdminReconciliationRequest,
  verifyPaymentWithRazorpayServer,
  determineAuthoritativeProductRoute,
  DEFAULT_DLQ_RETENTION_MS,
} from "../../backend/webhook_proxy/razorpay_webhook_proxy.js";

const TEST_ADMIN_SECRET = "admsec_high_entropy_reconciliation_key_987654321";
const LIVE_RAZORPAY_KEY_ID = "rzp_live_LIVEKEY123456";
const LIVE_RAZORPAY_KEY_SECRET = "rzp_live_LIVESECRET987654";
const TEST_RAZORPAY_KEY_ID = "rzp_test_TESTKEY123456";
const TEST_RAZORPAY_KEY_SECRET = "rzp_test_TESTSECRET987654";
const PROD_MERCHANT_ACCOUNT = "acc_ProdMerchantTT01";
const TEST_PROXY_SECRET = "proxy_test_secret_for_gas_auth_abcdef123456";

describe("PHASE 1G: DLQ Security, Reconciliation Authorization & Staging Gate Suite", () => {
  // 1. Secure Dead-Letter Queue (DLQ)
  describe("1. Secure Dead-Letter Queue (DLQ) Implementation", () => {
    it("1a. Redacts authorization headers, webhook secrets, cookies, and tokens before logging", () => {
      const maliciousHeaders = {
        "x-razorpay-signature": "abcdef1234567890abcdef1234567890",
        "authorization": "Bearer secret_admin_token_do_not_leak",
        "cookie": "session_id=attacker_session_12345",
        "x-custom-secret": "super_secret_key",
        "content-type": "application/json",
      };

      const dlqEntry = sanitizeForDeadLetterQueue({
        eventId: "evt_dlq_001",
        errorCategory: "ROUTING_FAILURE",
        errorMessage: "Unknown product mapping",
        headers: maliciousHeaders,
        payload: {
          id: "evt_dlq_001",
          event: "payment.captured",
          payload: {
            payment: {
              entity: {
                id: "pay_dlq_001",
                order_id: "order_dlq_001",
                amount: 11700,
                currency: "INR",
                status: "captured",
                email: "customer@sensitive-domain.com",
                contact: "+919876543210",
              },
            },
          },
        },
      });

      // Assert zero secret leakage in headers
      expect(dlqEntry.sanitizedHeaders["x-razorpay-signature"]).toBe("[REDACTED]");
      expect(dlqEntry.sanitizedHeaders["authorization"]).toBe("[REDACTED]");
      expect(dlqEntry.sanitizedHeaders["cookie"]).toBe("[REDACTED]");
      expect(dlqEntry.sanitizedHeaders["x-custom-secret"]).toBe("[REDACTED]");
      expect(dlqEntry.sanitizedHeaders["content-type"]).toBe("application/json");

      // Assert raw signature string nowhere in DLQ entry
      const serialized = JSON.stringify(dlqEntry);
      expect(serialized).not.toContain("abcdef1234567890abcdef1234567890");
      expect(serialized).not.toContain("secret_admin_token_do_not_leak");
      expect(serialized).not.toContain("attacker_session_12345");
      expect(serialized).not.toContain("super_secret_key");
    });

    it("1b. Strips customer PII (email, phone, street address) and raw body to prevent replay attacks", () => {
      const sensitivePayload = {
        id: "evt_pii_001",
        event: "payment.captured",
        payload: {
          payment: {
            entity: {
              id: "pay_pii_001",
              order_id: "order_pii_001",
              amount: 11700,
              currency: "INR",
              status: "captured",
              email: "john.doe.personal@gmail.com",
              contact: "+919988776655",
              notes: {
                shipping_address: "Flat 402, Lotus Towers, Chennai",
                product_key: "ai_masterclass",
              },
            },
          },
        },
      };

      const dlqEntry = sanitizeForDeadLetterQueue({
        eventId: "evt_pii_001",
        errorCategory: "TRANSIENT_GAS_TIMEOUT",
        errorMessage: "Downstream Apps Script unreachable",
        payload: sensitivePayload,
      });

      // Stored summary includes only operational non-sensitive identifiers
      expect(dlqEntry.paymentId).toBe("pay_pii_001");
      expect(dlqEntry.orderId).toBe("order_pii_001");
      expect(dlqEntry.summary.payment?.amount).toBe(11700);
      expect(dlqEntry.summary.payment?.currency).toBe("INR");

      // Customer PII strictly omitted
      const serialized = JSON.stringify(dlqEntry);
      expect(serialized).not.toContain("john.doe.personal@gmail.com");
      expect(serialized).not.toContain("+919988776655");
      expect(serialized).not.toContain("Lotus Towers");

      // Anti-Replay: Raw payload body is NOT stored in entry
      expect((dlqEntry as any).rawBody).toBeUndefined();
    });

    it("1c. Enforces strong administrator authentication and retention expiry on DLQ queries", () => {
      const customStore: any[] = [];
      const now = Date.now();

      // Active entry
      recordDeadLetterQueueEntry(
        {
          eventId: "evt_active_001",
          errorCategory: "UNROUTABLE",
          timestamp: now,
        },
        customStore
      );

      // Expired entry (older than 7 days)
      recordDeadLetterQueueEntry(
        {
          eventId: "evt_expired_001",
          errorCategory: "OLD_ERROR",
          timestamp: now - (DEFAULT_DLQ_RETENTION_MS + 10000),
        },
        customStore
      );

      // Unauthenticated query rejected
      const unauthRes = queryDeadLetterQueue(null as any, TEST_ADMIN_SECRET, customStore);
      expect(unauthRes.status).toBe(401);
      expect(unauthRes.success).toBe(false);

      // Wrong token rejected
      const badTokenRes = queryDeadLetterQueue("Bearer invalid_token_123", TEST_ADMIN_SECRET, customStore);
      expect(badTokenRes.status).toBe(403);
      expect(badTokenRes.success).toBe(false);

      // Authorized query returns active entries and filters expired entries
      const authRes = queryDeadLetterQueue(`Bearer ${TEST_ADMIN_SECRET}`, TEST_ADMIN_SECRET, customStore);
      expect(authRes.status).toBe(200);
      expect(authRes.success).toBe(true);
      expect(authRes.count).toBe(1);
      expect(authRes.entries[0].eventId).toBe("evt_active_001");
    });
  });

  // 2. Secure Administrative Reconciliation Endpoint
  describe("2. Secure Administrative Reconciliation Endpoint", () => {
    it("2a. Rejects reconciliation requests lacking strong Bearer administrator authentication", async () => {
      const resMissing = await handleAdminReconciliationRequest({
        authHeader: undefined,
        expectedAdminSecret: TEST_ADMIN_SECRET,
        paymentId: "pay_rec_001",
        orderId: "order_rec_001",
      });
      expect(resMissing.status).toBe(401);
      expect(resMissing.success).toBe(false);

      const resBad = await handleAdminReconciliationRequest({
        authHeader: "Bearer wrong_admin_secret",
        expectedAdminSecret: TEST_ADMIN_SECRET,
        paymentId: "pay_rec_001",
        orderId: "order_rec_001",
      });
      expect(resBad.status).toBe(403);
      expect(resBad.success).toBe(false);
    });

    it("2b. Enforces rate limiting at proxy to protect against brute-force attacks (HTTP 429)", async () => {
      const customRateLimitTracker = new Map();
      const clientIp = "192.168.1.100";

      // Execute 10 allowed calls under default policy (10 requests / minute)
      for (let i = 0; i < 10; i++) {
        await handleAdminReconciliationRequest({
          authHeader: `Bearer ${TEST_ADMIN_SECRET}`,
          expectedAdminSecret: TEST_ADMIN_SECRET,
          paymentId: `pay_rate_${i}`,
          orderId: `order_rate_${i}`,
          clientIp,
          rateLimitTracker: customRateLimitTracker,
          fetchImpl: vi.fn().mockResolvedValue({ ok: false, status: 404 }) as any,
        });
      }

      // 11th call exceeds default 10 req/min rate limit
      const rateLimitedRes = await handleAdminReconciliationRequest({
        authHeader: `Bearer ${TEST_ADMIN_SECRET}`,
        expectedAdminSecret: TEST_ADMIN_SECRET,
        paymentId: "pay_rate_overflow",
        orderId: "order_rate_overflow",
        clientIp,
        rateLimitTracker: customRateLimitTracker,
        fetchImpl: vi.fn() as any,
      });

      expect(rateLimitedRes.status).toBe(429);
      expect(rateLimitedRes.error).toContain("RATE_LIMIT_EXCEEDED");
    });

    it("2c. Verifies payment and order server-to-server and rejects status, amount, or merchant mismatches", async () => {
      // Razorpay reports payment as 'authorized' rather than 'captured'
      const mockFetchUncaptured = vi.fn().mockImplementation((url: string) => {
        if (url.includes("/payments/")) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({
              id: "pay_uncaptured_001",
              order_id: "order_rec_001",
              amount: 11700,
              currency: "INR",
              status: "authorized", // NOT captured
            }),
          });
        }
        return Promise.resolve({ ok: true, status: 200, json: async () => ({ id: "order_rec_001" }) });
      });

      const resUncaptured = await handleAdminReconciliationRequest({
        authHeader: `Bearer ${TEST_ADMIN_SECRET}`,
        expectedAdminSecret: TEST_ADMIN_SECRET,
        paymentId: "pay_uncaptured_001",
        orderId: "order_rec_001",
        keyId: LIVE_RAZORPAY_KEY_ID,
        keySecret: LIVE_RAZORPAY_KEY_SECRET,
        fetchImpl: mockFetchUncaptured as any,
      });

      expect(resUncaptured.status).toBe(422);
      expect(resUncaptured.error).toContain("PAYMENT_NOT_CAPTURED");
    });

    it("2d. Successfully reconciles verified captured payment and dispatches authenticated proxy payload to Apps Script", async () => {
      const mockFetch = vi.fn().mockImplementation((url: string, opts: any) => {
        if (url.includes("api.razorpay.com/v1/payments/")) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({
              id: "pay_rec_valid_001",
              order_id: "order_rec_valid_001",
              amount: 11700,
              currency: "INR",
              status: "captured",
              account_id: PROD_MERCHANT_ACCOUNT,
            }),
          });
        }
        if (url.includes("api.razorpay.com/v1/orders/")) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({
              id: "order_rec_valid_001",
              amount: 11700,
              currency: "INR",
              notes: {
                product_key: "ai_masterclass",
              },
            }),
          });
        }
        if (url.includes("script.google.com/macros/s/")) {
          // Verify forward payload contains proxy signature
          const body = JSON.parse(opts.body);
          expect(body.proxy_signature).toBeDefined();
          expect(body.reconciliation).toBe(true);
          expect(body.target_product).toBe("ai_masterclass");
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({ success: true, verified: true }),
          });
        }
        return Promise.reject(new Error("Unexpected URL: " + url));
      });

      const res = await handleAdminReconciliationRequest({
        authHeader: `Bearer ${TEST_ADMIN_SECRET}`,
        expectedAdminSecret: TEST_ADMIN_SECRET,
        paymentId: "pay_rec_valid_001",
        orderId: "order_rec_valid_001",
        expectedMerchantAccount: PROD_MERCHANT_ACCOUNT,
        keyId: LIVE_RAZORPAY_KEY_ID,
        keySecret: LIVE_RAZORPAY_KEY_SECRET,
        proxySecret: TEST_PROXY_SECRET,
        fetchImpl: mockFetch as any,
      });

      expect(res.success).toBe(true);
      expect(res.status).toBe(200);
      expect(res.reconciled).toBe(true);
      expect(res.targetProduct).toBe("ai_masterclass");
    });
  });

  // 3. Test/Production Separation & Environment Isolation
  describe("3. Test / Production Separation & Environment Isolation", () => {
    it("3a. Fails closed when accidental live-key is used with test-mode payment", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          id: "pay_test_CrossEnv001",
          order_id: "order_test_CrossEnv001",
          amount: 11700,
          currency: "INR",
          status: "captured",
          notes: {
            test_mode: "true",
          },
        }),
      });

      const res = await verifyPaymentWithRazorpayServer({
        paymentId: "pay_test_CrossEnv001",
        orderId: "order_test_CrossEnv001",
        keyId: LIVE_RAZORPAY_KEY_ID, // Production live key
        keySecret: LIVE_RAZORPAY_KEY_SECRET,
        isolateProduction: true,
        fetchImpl: mockFetch as any,
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain("TEST_PAYMENT_IN_PRODUCTION");
    });

    it("3b. Authoritative routing fails closed if test-mode payment is sent to production environment", () => {
      const orderEntity = {
        id: "order_test_001",
        notes: {
          product_key: "ai_bgm",
          test_mode: "true",
        },
      };

      const paymentEntity = {
        id: "pay_test_001",
        order_id: "order_test_001",
        notes: {
          product_key: "ai_bgm",
          test_mode: "true",
        },
      };

      const routeRes = determineAuthoritativeProductRoute(
        orderEntity,
        paymentEntity,
        {},
        { environment: "production" }
      );

      expect(routeRes.success).toBe(false);
      expect(routeRes.error).toContain("TEST_PAYMENT_IN_PRODUCTION");
    });

    it("3c. Fails closed when environment configuration or credentials are empty or missing", async () => {
      const emptyCredsRes = await verifyPaymentWithRazorpayServer({
        paymentId: "pay_test_001",
        orderId: "order_test_001",
        keyId: "", // Missing key ID
        keySecret: "",
      });

      expect(emptyCredsRes.success).toBe(false);
      expect(emptyCredsRes.error).toContain("MISSING_RAZORPAY_API_CREDENTIALS");
    });
  });
});
