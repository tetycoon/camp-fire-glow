import { describe, it, expect, vi } from "vitest";
import crypto from "node:crypto";
import {
  TRUSTED_PRODUCT_ROUTING,
  determineProductRoute,
  handleIncomingRazorpayWebhook,
  handleIncomingRazorpayWebhookAsync,
  verifyRazorpayWebhookSignature,
  computeProxySignature,
  verifyPaymentWithRazorpayServer,
} from "../../backend/webhook_proxy/razorpay_webhook_proxy.js";

const TEST_WEBHOOK_SECRET = "whsec_test_secret_for_routing_audit_987654321";
const TEST_PROXY_SECRET = "proxy_test_secret_for_gas_auth_abcdef123456";
const TEST_RAZORPAY_KEY_ID = "rzp_test_KEYID123456";
const TEST_RAZORPAY_KEY_SECRET = "rzp_test_KEYSECRET987654";

describe("PHASE 1E: Final Payment Routing Audit & Deployment Gate Suite", () => {
  // 1. Comprehensive Routing Matrix: All 8 products routed accurately via explicit product_key
  it("1. Routes all 8 Tech Tycoon educational products via explicit product_key with 100% precision", () => {
    const products = [
      { key: "upscale", expectedName: "UPSCALE: 1-Day AI Mastery Workshop (Chennai)" },
      { key: "advanced_masterclass", expectedName: "Advance AI Masterclass" },
      { key: "ai_bgm", expectedName: "Advance AI-Business Generative Model (AI-BGM)" },
      { key: "claude_masterclass", expectedName: "Claude Coding Masterclass" },
      { key: "academy", expectedName: "TECH TYCOON Academy Pre-Register" },
      { key: "consulting", expectedName: "1-on-1 AI Strategy Session" },
      { key: "professionals", expectedName: "Advance AI for Professionals" },
      { key: "ai_masterclass", expectedName: "AI Secrets Revealed Masterclass" },
    ];

    for (const prod of products) {
      const paymentEntity = {
        id: `pay_explicit_${prod.key}_001`,
        order_id: `order_explicit_${prod.key}_001`,
        amount: 11700,
        currency: "INR",
        status: "captured",
        notes: {
          product_key: prod.key,
          customer_email: "test@example.com",
        },
      };

      const res = determineProductRoute(paymentEntity);
      expect(res.success).toBe(true);
      expect(res.productKey).toBe(prod.key);
      expect(res.productName).toBe(prod.expectedName);
      expect(res.matchType).toBe("explicit_key");
      expect(res.targetUrl).toContain("https://script.google.com/macros/s/");
    }
  });

  // 2. Disambiguated Pattern Matching: Fallback routing without broad /masterclass/i overlap
  it("2. Routes all 8 products via disambiguated pattern matching when explicit keys are omitted", () => {
    const matrix = [
      {
        inputNote: "UPSCALE 1-Day AI Mastery Workshop Chennai Offline",
        expectedProduct: "upscale",
      },
      {
        inputNote: "Advance AI Masterclass - 2 Day Live Workshop",
        expectedProduct: "advanced_masterclass",
      },
      {
        inputNote: "Advance AI-Business Generative Model (AI-BGM) Certification",
        expectedProduct: "ai_bgm",
      },
      {
        inputNote: "Claude Coding Masterclass 3.7 Sonnet for Developers",
        expectedProduct: "claude_masterclass",
      },
      {
        inputNote: "TECH TYCOON Academy Pre-Register Access Pass",
        expectedProduct: "academy",
      },
      {
        inputNote: "1-on-1 AI Strategy Session & Consulting Call",
        expectedProduct: "consulting",
      },
      {
        inputNote: "Advance AI for Non-Tech Working Professionals Course",
        expectedProduct: "professionals",
      },
      {
        inputNote: "AI Secrets Revealed Masterclass Kickstart Batch",
        expectedProduct: "ai_masterclass",
      },
    ];

    for (const item of matrix) {
      const paymentEntity = {
        id: `pay_pat_${item.expectedProduct}`,
        order_id: `order_pat_${item.expectedProduct}`,
        amount: 11700,
        currency: "INR",
        status: "captured",
        notes: {
          course: item.inputNote,
        },
      };

      const res = determineProductRoute(paymentEntity);
      expect(res.success).toBe(true);
      expect(res.productKey).toBe(item.expectedProduct);
      expect(res.matchType).toBe("pattern_match");
      expect(res.targetUrl).toBeDefined();
    }
  });

  // 3. Strict Rejection of Conflicting / Ambiguous Product Mappings (No silent fallback)
  it("3. Strictly rejects conflicting product mappings with CONFLICTING_PRODUCT_MAPPING (HTTP 422)", () => {
    const conflictingInputs = [
      "Advanced AI Masterclass with Claude Sonnet", // Matches both advanced_masterclass & claude_masterclass
      "AI Strategy Session for Working Professionals", // Matches consulting & professionals
      "TECH TYCOON Academy UPSCALE Workshop", // Matches academy & upscale
    ];

    for (const conflict of conflictingInputs) {
      const paymentEntity = {
        id: "pay_conflict_001",
        order_id: "order_conflict_001",
        amount: 11700,
        currency: "INR",
        status: "captured",
        notes: {
          course: conflict,
        },
      };

      const res = determineProductRoute(paymentEntity);
      expect(res.success).toBe(false);
      expect(res.error).toContain("CONFLICTING_PRODUCT_MAPPING");
      expect(res.error).toContain("Ambiguous routing rejected");
    }
  });

  // 4. Strict Rejection of Unknown Products & Missing Course Identifiers
  it("4. Strictly rejects unknown products and empty metadata with UNKNOWN_PRODUCT_MAPPING (HTTP 422)", () => {
    const unknownEntities = [
      {
        notes: { course: "Introduction to Full Stack Web Development" },
      },
      {
        notes: { course: "Unregistered Generic Python Course" },
      },
      {
        notes: {}, // Completely empty notes
      },
    ];

    for (const entity of unknownEntities) {
      const paymentEntity = {
        id: "pay_unknown_001",
        order_id: "order_unknown_001",
        amount: 11700,
        currency: "INR",
        status: "captured",
        ...entity,
      };

      const res = determineProductRoute(paymentEntity);
      expect(res.success).toBe(false);
      expect(
        res.error.includes("UNKNOWN_PRODUCT_MAPPING") ||
        res.error.includes("MISSING_PRODUCT_IDENTIFIER")
      ).toBe(true);
    }
  });

  // 5. Browser Tampering Resistance: Client cannot choose arbitrary Apps Script destination
  it("5. Client cannot supply arbitrary Apps Script destination URL or override trusted routing", () => {
    const maliciousPayload = {
      entity: "event",
      id: "evt_tamper_dest_01",
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_tamper_001",
            order_id: "order_tamper_001",
            amount: 11700,
            currency: "INR",
            status: "captured",
            notes: {
              product_key: "ai_masterclass",
              target_url: "https://evil-attacker-site.com/intercept", // Attacker injected destination
              forward_destination: "https://script.google.com/macros/s/malicious/exec",
            },
          },
        },
      },
    };

    const rawBody = JSON.stringify(maliciousPayload);
    const signature = crypto
      .createHmac("sha256", TEST_WEBHOOK_SECRET)
      .update(rawBody, "utf8")
      .digest("hex");

    const result = handleIncomingRazorpayWebhook({
      rawBody,
      signatureHeader: signature,
      webhookSecret: TEST_WEBHOOK_SECRET,
      proxySecret: TEST_PROXY_SECRET,
    });

    expect(result.success).toBe(true);
    // Verified: targetUrl is strictly the trusted Tech Tycoon Apps Script endpoint, NOT the attacker's URL
    expect(result.targetUrl).toBe(TRUSTED_PRODUCT_ROUTING.ai_masterclass.defaultEndpoint);
    expect(result.targetUrl).not.toContain("evil-attacker-site.com");
    expect(result.targetUrl).not.toContain("malicious");
  });

  // 6. Remote Server-to-Server Razorpay API Verification
  describe("6. Remote Server-to-Server Razorpay Verification (verifyPaymentWithRazorpayServer)", () => {
    it("6a. Verifies valid captured payment with matching order_id, amount, and currency", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          id: "pay_rzp_valid_001",
          order_id: "order_rzp_valid_001",
          amount: 11700,
          currency: "INR",
          status: "captured",
        }),
      });

      const res = await verifyPaymentWithRazorpayServer({
        paymentId: "pay_rzp_valid_001",
        orderId: "order_rzp_valid_001",
        expectedAmount: 11700,
        expectedCurrency: "INR",
        keyId: TEST_RAZORPAY_KEY_ID,
        keySecret: TEST_RAZORPAY_KEY_SECRET,
        fetchImpl: mockFetch as any,
      });

      expect(res.success).toBe(true);
      expect(res.verifiedPayment.status).toBe("captured");
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.razorpay.com/v1/payments/pay_rzp_valid_001",
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            Authorization: expect.stringMatching(/^Basic /),
          }),
        })
      );
    });

    it("6b. Rejects uncaptured payment (e.g. authorized, created, or failed)", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          id: "pay_rzp_uncaptured_001",
          order_id: "order_rzp_valid_001",
          amount: 11700,
          currency: "INR",
          status: "authorized", // NOT captured
        }),
      });

      const res = await verifyPaymentWithRazorpayServer({
        paymentId: "pay_rzp_uncaptured_001",
        orderId: "order_rzp_valid_001",
        expectedAmount: 11700,
        keyId: TEST_RAZORPAY_KEY_ID,
        keySecret: TEST_RAZORPAY_KEY_SECRET,
        fetchImpl: mockFetch as any,
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain("PAYMENT_NOT_CAPTURED");
    });

    it("6c. Rejects order_id mismatch (payment belongs to a different order)", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          id: "pay_rzp_ord_mismatch_001",
          order_id: "order_DIFFERENT_999",
          amount: 11700,
          currency: "INR",
          status: "captured",
        }),
      });

      const res = await verifyPaymentWithRazorpayServer({
        paymentId: "pay_rzp_ord_mismatch_001",
        orderId: "order_EXPECTED_001",
        expectedAmount: 11700,
        keyId: TEST_RAZORPAY_KEY_ID,
        keySecret: TEST_RAZORPAY_KEY_SECRET,
        fetchImpl: mockFetch as any,
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain("ORDER_ID_MISMATCH");
    });

    it("6d. Rejects amount mismatch (tampered payment amount)", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          id: "pay_rzp_amt_mismatch_001",
          order_id: "order_rzp_valid_001",
          amount: 100, // Attacker paid 1 INR instead of 117 INR
          currency: "INR",
          status: "captured",
        }),
      });

      const res = await verifyPaymentWithRazorpayServer({
        paymentId: "pay_rzp_amt_mismatch_001",
        orderId: "order_rzp_valid_001",
        expectedAmount: 11700,
        keyId: TEST_RAZORPAY_KEY_ID,
        keySecret: TEST_RAZORPAY_KEY_SECRET,
        fetchImpl: mockFetch as any,
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain("AMOUNT_MISMATCH");
    });

    it("6e. Rejects when remote Razorpay API returns HTTP 404 Not Found", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      });

      const res = await verifyPaymentWithRazorpayServer({
        paymentId: "pay_nonexistent_001",
        orderId: "order_rzp_valid_001",
        keyId: TEST_RAZORPAY_KEY_ID,
        keySecret: TEST_RAZORPAY_KEY_SECRET,
        fetchImpl: mockFetch as any,
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain("RAZORPAY_API_REJECTED");
    });
  });

  // 7. handleIncomingRazorpayWebhookAsync with Integrated Remote Verification
  it("7. Integrates remote Razorpay verification seamlessly into handleIncomingRazorpayWebhookAsync", async () => {
    const rawPayload = {
      entity: "event",
      id: "evt_async_verify_001",
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_async_001",
            order_id: "order_async_001",
            amount: 11700,
            currency: "INR",
            status: "captured",
            notes: {
              product_key: "ai_bgm",
            },
          },
        },
      },
    };

    const rawBody = JSON.stringify(rawPayload);
    const signature = crypto
      .createHmac("sha256", TEST_WEBHOOK_SECRET)
      .update(rawBody, "utf8")
      .digest("hex");

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        id: "pay_async_001",
        order_id: "order_async_001",
        amount: 11700,
        currency: "INR",
        status: "captured",
      }),
    });

    const asyncResult = await handleIncomingRazorpayWebhookAsync({
      rawBody,
      signatureHeader: signature,
      webhookSecret: TEST_WEBHOOK_SECRET,
      proxySecret: TEST_PROXY_SECRET,
      verifyWithRazorpay: true,
      razorpayKeyId: TEST_RAZORPAY_KEY_ID,
      razorpayKeySecret: TEST_RAZORPAY_KEY_SECRET,
      fetchImpl: mockFetch as any,
    });

    expect(asyncResult.success).toBe(true);
    expect(asyncResult.razorpayVerified).toBe(true);
    expect(asyncResult.targetProduct).toBe("ai_bgm");
    expect(asyncResult.forwardPayload.proxy_signature).toBeDefined();
  });
});
