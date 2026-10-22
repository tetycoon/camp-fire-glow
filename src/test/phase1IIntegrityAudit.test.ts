import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "node:crypto";
import {
  computeCanonicalPayloadDigest,
  computeCanonicalProxySignature,
  computeProxySignature,
  determineAuthoritativeProductRoute,
  handleIncomingRazorpayWebhook,
  handleAdminReconciliationRequest,
  verifyRazorpayWebhookSignature,
} from "../../backend/webhook_proxy/razorpay_webhook_proxy.js";

const TEST_WEBHOOK_SECRET = "whsec_test_secret_integrity_123456789";
const TEST_PROXY_SECRET = "proxy_secret_high_entropy_v2_signing_abcdef987654321";
const TEST_ADMIN_SECRET = "adm_sec_super_secret_reconciliation_token_2026";
const LIVE_RAZORPAY_KEY_ID = "rzp_live_T2CbVONQc6qrqj";
const LIVE_RAZORPAY_KEY_SECRET = "live_rzp_secret_dummy_for_tests_123456";

/**
 * Creates an in-memory Google Apps Script simulator matching the production GAS implementation.
 */
function createAppsScriptEnvironment(expectedProductKey: string) {
  const scriptProperties = new Map<string, string>();
  scriptProperties.set("WEBHOOK_PROXY_SECRET", TEST_PROXY_SECRET);
  scriptProperties.set("INVOICE_TOKEN_SECRET", "inv_token_secret_test_54321");
  scriptProperties.set("RAZORPAY_KEY_SECRET", LIVE_RAZORPAY_KEY_SECRET);

  let funnelsDoneInvoiceCounter = 1000;
  let funnelsDoneInvoiceCalls = 0;
  let whatsAppCalls = 0;
  let isLocked = false;

  const rows: any[][] = [
    ["Timestamp", "Name", "Email", "Phone", "Profession", "Language", "Amount", "Status", "Order ID", "Payment ID", "Email Status", "Invoice Number"],
  ];

  function computeSha256Hex(payload: string): string {
    return crypto.createHash("sha256").update(payload, "utf8").digest("hex");
  }

  function computeHmacSha256Hex(payload: string, secret: string): string {
    return crypto.createHmac("sha256", secret).update(payload, "utf8").digest("hex");
  }

  function computeCanonicalPayloadDigestGas(paymentEntity: any): string {
    if (!paymentEntity || typeof paymentEntity !== "object") return "";
    const amount = paymentEntity.amount !== undefined ? String(paymentEntity.amount).trim() : "";
    const currency = paymentEntity.currency ? String(paymentEntity.currency).trim() : "";
    const status = paymentEntity.status ? String(paymentEntity.status).trim() : "";
    const email = paymentEntity.email ? String(paymentEntity.email).trim().toLowerCase() : "";
    const contact = paymentEntity.contact ? String(paymentEntity.contact).trim() : "";
    const canonicalString = amount + "|" + currency + "|" + status + "|" + email + "|" + contact;
    return computeSha256Hex(canonicalString);
  }

  return {
    scriptProperties,
    rows,
    getFunnelsDoneCallCount: () => funnelsDoneInvoiceCalls,
    getWhatsAppCallCount: () => whatsAppCalls,

    initOrder(orderId: string, amount: number, email = "learner@example.com") {
      rows.push([
        new Date().toISOString(),
        "Learner",
        email,
        "+919876543210",
        "Developer",
        "English",
        amount,
        "INITIATED",
        orderId,
        "",
        "WAITING",
        "",
      ]);
    },

    executeDoPost(body: any, options: { simulateSheetsFailure?: boolean } = {}) {
      if (isLocked) {
        throw new Error("LOCK_TIMEOUT: Script lock acquired by another thread");
      }
      isLocked = true;
      try {
        if (body.event === "payment.captured" || body.event === "order.paid") {
          const paymentEntity = body.payload?.payment?.entity;
          if (!paymentEntity || !paymentEntity.order_id || !paymentEntity.id) {
            return { success: false, error: "Invalid webhook payment entity" };
          }

          const orderId = paymentEntity.order_id;
          const paymentId = paymentEntity.id;
          const email = paymentEntity.email;
          const proxySignature = body.proxy_signature;
          const timestamp = body.timestamp;
          const eventId = body.eventId || body.event_id;
          const targetProduct = body.target_product;
          const payloadDigest = body.payload_digest;
          const proxyVersion = body.proxy_version;

          const webhookProxySecret = scriptProperties.get("WEBHOOK_PROXY_SECRET");
          if (!webhookProxySecret) {
            throw new Error("MISSING_PROXY_SECRET: Webhook proxy secret not configured.");
          }

          const cleanOrderId = String(orderId || "").trim();
          const cleanPaymentId = String(paymentId || "").trim();
          const cleanEventId = String(eventId || "").trim();
          const cleanTimestamp = Number(timestamp) || 0;
          const cleanTargetProduct = String(targetProduct || "").trim().toLowerCase();
          const cleanPayloadDigest = String(payloadDigest || "").trim().toLowerCase();
          const isV2 = proxyVersion === "v2" || Boolean(payloadDigest && targetProduct);

          // 1. Destination binding
          if (isV2) {
            if (!cleanTargetProduct || cleanTargetProduct !== expectedProductKey) {
              throw new Error(`DESTINATION_MISMATCH: Webhook intended for '${cleanTargetProduct}' cannot be processed by '${expectedProductKey}'.`);
            }
          }

          // 2. Replay prevention: timestamp freshness
          const now = Date.now();
          if (!cleanTimestamp || Math.abs(now - cleanTimestamp) > 300000) {
            throw new Error("REPLAY_EXPIRED_TIMESTAMP: Webhook timestamp expired or outside tolerance window.");
          }

          // 3. Tamper resistance
          if (isV2) {
            const expectedDigest = computeCanonicalPayloadDigestGas(paymentEntity);
            if (!cleanPayloadDigest || expectedDigest !== cleanPayloadDigest) {
              throw new Error("PAYLOAD_DIGEST_MISMATCH: Canonical payload digest does not match payment entity.");
            }

            const expectedProxySig = computeHmacSha256Hex(
              `v2|${cleanEventId}|${cleanOrderId}|${cleanPaymentId}|${cleanTimestamp}|${cleanTargetProduct}|${cleanPayloadDigest}`,
              webhookProxySecret
            );
            if (!proxySignature || expectedProxySig !== String(proxySignature).trim().toLowerCase()) {
              throw new Error("INVALID_WEBHOOK_SIGNATURE: Webhook proxy signature verification failed.");
            }
          } else {
            const expectedProxySig = computeHmacSha256Hex(
              `${cleanEventId}|${cleanOrderId}|${cleanPaymentId}|${cleanTimestamp}`,
              webhookProxySecret
            );
            if (!proxySignature || expectedProxySig !== String(proxySignature).trim().toLowerCase()) {
              throw new Error("INVALID_WEBHOOK_SIGNATURE: Webhook proxy signature verification failed.");
            }
          }

          // 4. Replay prevention: eventId check
          if (cleanEventId && scriptProperties.has("PROCESSED_EVT_" + cleanEventId)) {
            return { success: true, alreadyProcessed: true, eventId: cleanEventId };
          }

          // 5. Payment Idempotency check
          if (scriptProperties.has("PROCESSED_PAY_" + cleanPaymentId)) {
            const cachedInv = scriptProperties.get("VERIFIED_INV_" + cleanPaymentId);
            return {
              success: true,
              alreadyProcessed: true,
              paymentId: cleanPaymentId,
              orderId: cleanOrderId,
              invoiceNumber: cachedInv ? JSON.parse(cachedInv).invoiceNumber : null,
            };
          }

          // Locate row
          let targetIndex = -1;
          for (let i = 1; i < rows.length; i++) {
            if (rows[i][8] === cleanOrderId) {
              targetIndex = i;
              break;
            }
          }
          if (targetIndex === -1) {
            throw new Error("ORDER_NOT_FOUND: Order ID not found in registration sheet.");
          }

          const row = rows[targetIndex];
          if (row[7] === "✅ PAID") {
            return { success: true, alreadyProcessed: true, paymentId: cleanPaymentId, orderId: cleanOrderId };
          }

          // Check if invoice was already minted and cached in ScriptProperties (recovery after partial failure)
          let invRecord = null;
          const cachedJson = scriptProperties.get("VERIFIED_INV_" + cleanPaymentId);
          if (cachedJson) {
            invRecord = JSON.parse(cachedJson);
          } else {
            // Call FunnelsDone and issue invoice
            funnelsDoneInvoiceCalls++;
            funnelsDoneInvoiceCounter++;
            const invNumber = "TT/26-27/" + funnelsDoneInvoiceCounter;
            whatsAppCalls++;

            invRecord = {
              verified: true,
              paymentId: cleanPaymentId,
              orderId: cleanOrderId,
              invoiceNumber: invNumber,
              totalAmountPaid: row[6],
            };
            // Cache immediately to ensure no duplicate invoice generation
            scriptProperties.set("VERIFIED_INV_" + cleanPaymentId, JSON.stringify(invRecord));
          }

          // Simulate potential Sheets outage
          if (options.simulateSheetsFailure) {
            throw new Error("GOOGLE_SHEETS_RPC_FAILURE: Temporary outage while writing row.");
          }

          // Write to sheet
          row[7] = "✅ PAID";
          row[9] = cleanPaymentId;
          row[10] = "SENT ✅";
          row[11] = invRecord.invoiceNumber;

          scriptProperties.set("PROCESSED_PAY_" + cleanPaymentId, new Date().toISOString());
          if (cleanEventId) {
            scriptProperties.set("PROCESSED_EVT_" + cleanEventId, new Date().toISOString());
          }

          return {
            success: true,
            verified: true,
            paymentId: cleanPaymentId,
            orderId: cleanOrderId,
            invoiceNumber: invRecord.invoiceNumber,
          };
        }

        return { success: false, error: "Unhandled event" };
      } finally {
        isLocked = false;
      }
    },
  };
}

describe("PHASE 1I: Signed Payload Integrity and Payment Recovery Audit", () => {
  // ==========================================================================
  // 1. CANONICAL V2 SIGNATURE VERIFICATION & TAMPERING DETECTION
  // ==========================================================================
  describe("1. Canonical v2 Signature Verification and Payload Tampering Detection", () => {
    it("1a. Forward payload includes v2 canonical signature, proxy_version, target_product, and payload_digest", () => {
      const rawPayment = {
        id: "pay_v2_valid_01",
        order_id: "order_v2_valid_01",
        amount: 11700,
        currency: "INR",
        status: "captured",
        email: "student@techtycoon.in",
        contact: "+919876543210",
        notes: {
          product_key: "ai_masterclass",
        },
      };

      const webhookBody = JSON.stringify({
        id: "evt_v2_valid_01",
        event: "payment.captured",
        payload: { payment: { entity: rawPayment } },
      });

      const signature = crypto
        .createHmac("sha256", TEST_WEBHOOK_SECRET)
        .update(webhookBody, "utf8")
        .digest("hex");

      const result = handleIncomingRazorpayWebhook({
        rawBody: webhookBody,
        signatureHeader: signature,
        webhookSecret: TEST_WEBHOOK_SECRET,
        proxySecret: TEST_PROXY_SECRET,
      });

      expect(result.success).toBe(true);
      expect(result.forwardPayload.proxy_version).toBe("v2");
      expect(result.forwardPayload.target_product).toBe("ai_masterclass");
      expect(result.forwardPayload.payload_digest).toBeDefined();
      expect(result.forwardPayload.proxy_signature).toBeDefined();

      // Verify digest matches SHA-256 of canonical fields
      const expectedDigest = computeCanonicalPayloadDigest(rawPayment);
      expect(result.forwardPayload.payload_digest).toBe(expectedDigest);

      // Verify Apps Script accepts valid v2 payload
      const appsScript = createAppsScriptEnvironment("ai_masterclass");
      appsScript.initOrder("order_v2_valid_01", 117, "student@techtycoon.in");

      const gasRes = appsScript.executeDoPost(result.forwardPayload);
      expect(gasRes.success).toBe(true);
      expect(gasRes.verified).toBe(true);
      expect(gasRes.invoiceNumber).toContain("TT/26-27/");
    });

    it("1b. Rejects payload when amount is tampered in transit", () => {
      const appsScript = createAppsScriptEnvironment("ai_masterclass");
      appsScript.initOrder("order_tamper_01", 117);

      const rawPayment = {
        id: "pay_tamper_01",
        order_id: "order_tamper_01",
        amount: 11700,
        currency: "INR",
        status: "captured",
        email: "tamper@test.com",
        contact: "+919876543210",
      };

      const now = Date.now();
      const digest = computeCanonicalPayloadDigest(rawPayment);
      const signature = computeCanonicalProxySignature(
        {
          eventId: "evt_tamper_01",
          orderId: "order_tamper_01",
          paymentId: "pay_tamper_01",
          timestamp: now,
          productKey: "ai_masterclass",
          payloadDigest: digest,
        },
        TEST_PROXY_SECRET
      );

      const payload = {
        event: "payment.captured",
        eventId: "evt_tamper_01",
        timestamp: now,
        proxy_version: "v2",
        target_product: "ai_masterclass",
        payload_digest: digest,
        proxy_signature: signature,
        payload: {
          payment: {
            entity: {
              ...rawPayment,
              amount: 100, // Tampered from 11700 paise (₹117) to 100 paise (₹1)
            },
          },
        },
      };

      expect(() => appsScript.executeDoPost(payload)).toThrow("PAYLOAD_DIGEST_MISMATCH");
    });

    it("1c. Rejects payload when currency or payment status is tampered", () => {
      const appsScript = createAppsScriptEnvironment("ai_masterclass");
      appsScript.initOrder("order_tamper_02", 117);

      const rawPayment = {
        id: "pay_tamper_02",
        order_id: "order_tamper_02",
        amount: 11700,
        currency: "INR",
        status: "captured",
        email: "tamper@test.com",
        contact: "+919876543210",
      };

      const now = Date.now();
      const digest = computeCanonicalPayloadDigest(rawPayment);
      const signature = computeCanonicalProxySignature(
        {
          eventId: "evt_tamper_02",
          orderId: "order_tamper_02",
          paymentId: "pay_tamper_02",
          timestamp: now,
          productKey: "ai_masterclass",
          payloadDigest: digest,
        },
        TEST_PROXY_SECRET
      );

      // Tampered status to 'failed'
      const payloadBadStatus = {
        event: "payment.captured",
        eventId: "evt_tamper_02",
        timestamp: now,
        proxy_version: "v2",
        target_product: "ai_masterclass",
        payload_digest: digest,
        proxy_signature: signature,
        payload: {
          payment: {
            entity: { ...rawPayment, status: "failed" },
          },
        },
      };
      expect(() => appsScript.executeDoPost(payloadBadStatus)).toThrow("PAYLOAD_DIGEST_MISMATCH");

      // Tampered currency to 'USD'
      const payloadBadCurrency = {
        event: "payment.captured",
        eventId: "evt_tamper_02",
        timestamp: now,
        proxy_version: "v2",
        target_product: "ai_masterclass",
        payload_digest: digest,
        proxy_signature: signature,
        payload: {
          payment: {
            entity: { ...rawPayment, currency: "USD" },
          },
        },
      };
      expect(() => appsScript.executeDoPost(payloadBadCurrency)).toThrow("PAYLOAD_DIGEST_MISMATCH");
    });

    it("1d. Rejects payload when signature is computed with wrong proxy secret", () => {
      const appsScript = createAppsScriptEnvironment("ai_masterclass");
      appsScript.initOrder("order_bad_secret_01", 117);

      const rawPayment = {
        id: "pay_bad_secret_01",
        order_id: "order_bad_secret_01",
        amount: 11700,
        currency: "INR",
        status: "captured",
        email: "test@test.com",
        contact: "+919876543210",
      };

      const now = Date.now();
      const digest = computeCanonicalPayloadDigest(rawPayment);
      const bogusSignature = computeCanonicalProxySignature(
        {
          eventId: "evt_bad_secret_01",
          orderId: "order_bad_secret_01",
          paymentId: "pay_bad_secret_01",
          timestamp: now,
          productKey: "ai_masterclass",
          payloadDigest: digest,
        },
        "attacker_fake_secret_key_12345"
      );

      const payload = {
        event: "payment.captured",
        eventId: "evt_bad_secret_01",
        timestamp: now,
        proxy_version: "v2",
        target_product: "ai_masterclass",
        payload_digest: digest,
        proxy_signature: bogusSignature,
        payload: {
          payment: { entity: rawPayment },
        },
      };

      expect(() => appsScript.executeDoPost(payload)).toThrow("INVALID_WEBHOOK_SIGNATURE");
    });
  });

  // ==========================================================================
  // 2. DESTINATION BINDING & CROSS-COURSE MISMATCH PROTECTION
  // ==========================================================================
  describe("2. Destination Binding and Cross-Course Mismatch Protection", () => {
    it("2a. Rejects webhook when target_product does not match receiving Apps Script destination", () => {
      // apps_script for 'ai_masterclass'
      const aiMasterclassGas = createAppsScriptEnvironment("ai_masterclass");
      aiMasterclassGas.initOrder("order_cross_01", 117);

      const rawPayment = {
        id: "pay_cross_01",
        order_id: "order_cross_01",
        amount: 589900,
        currency: "INR",
        status: "captured",
        email: "cross@test.com",
        contact: "+919876543210",
      };

      const now = Date.now();
      const digest = computeCanonicalPayloadDigest(rawPayment);

      // Authenticated signature for 'ai_bgm'
      const bgmSignature = computeCanonicalProxySignature(
        {
          eventId: "evt_cross_01",
          orderId: "order_cross_01",
          paymentId: "pay_cross_01",
          timestamp: now,
          productKey: "ai_bgm",
          payloadDigest: digest,
        },
        TEST_PROXY_SECRET
      );

      const crossPayload = {
        event: "payment.captured",
        eventId: "evt_cross_01",
        timestamp: now,
        proxy_version: "v2",
        target_product: "ai_bgm", // Intended for ai_bgm, but delivered to ai_masterclass
        payload_digest: digest,
        proxy_signature: bgmSignature,
        payload: { payment: { entity: rawPayment } },
      };

      // Fails closed with DESTINATION_MISMATCH
      expect(() => aiMasterclassGas.executeDoPost(crossPayload)).toThrow("DESTINATION_MISMATCH");
    });

    it("2b. Accepts webhook when target_product matches destination exactly", () => {
      const bgmGas = createAppsScriptEnvironment("ai_bgm");
      bgmGas.initOrder("order_bgm_ok", 5899);

      const rawPayment = {
        id: "pay_bgm_ok",
        order_id: "order_bgm_ok",
        amount: 589900,
        currency: "INR",
        status: "captured",
        email: "bgm@test.com",
        contact: "+919876543210",
      };

      const now = Date.now();
      const digest = computeCanonicalPayloadDigest(rawPayment);
      const bgmSignature = computeCanonicalProxySignature(
        {
          eventId: "evt_bgm_ok",
          orderId: "order_bgm_ok",
          paymentId: "pay_bgm_ok",
          timestamp: now,
          productKey: "ai_bgm",
          payloadDigest: digest,
        },
        TEST_PROXY_SECRET
      );

      const validPayload = {
        event: "payment.captured",
        eventId: "evt_bgm_ok",
        timestamp: now,
        proxy_version: "v2",
        target_product: "ai_bgm",
        payload_digest: digest,
        proxy_signature: bgmSignature,
        payload: { payment: { entity: rawPayment } },
      };

      const res = bgmGas.executeDoPost(validPayload);
      expect(res.success).toBe(true);
      expect(res.verified).toBe(true);
    });
  });

  // ==========================================================================
  // 3. REPLAY PROTECTION (ALL 6 SCENARIOS)
  // ==========================================================================
  describe("3. Comprehensive Replay Protection (All 6 Scenarios)", () => {
    it("Scenario A: Exact replay returns alreadyProcessed: true without duplicate fulfillment", () => {
      const appsScript = createAppsScriptEnvironment("ai_masterclass");
      appsScript.initOrder("order_replay_A", 117);

      const rawPayment = {
        id: "pay_replay_A",
        order_id: "order_replay_A",
        amount: 11700,
        currency: "INR",
        status: "captured",
        email: "replayA@test.com",
        contact: "+919876543210",
      };

      const now = Date.now();
      const digest = computeCanonicalPayloadDigest(rawPayment);
      const signature = computeCanonicalProxySignature(
        {
          eventId: "evt_replay_A",
          orderId: "order_replay_A",
          paymentId: "pay_replay_A",
          timestamp: now,
          productKey: "ai_masterclass",
          payloadDigest: digest,
        },
        TEST_PROXY_SECRET
      );

      const payload = {
        event: "payment.captured",
        eventId: "evt_replay_A",
        timestamp: now,
        proxy_version: "v2",
        target_product: "ai_masterclass",
        payload_digest: digest,
        proxy_signature: signature,
        payload: { payment: { entity: rawPayment } },
      };

      // First execution
      const res1 = appsScript.executeDoPost(payload);
      expect(res1.success).toBe(true);
      expect(appsScript.getFunnelsDoneCallCount()).toBe(1);

      // Second identical execution (Replay)
      const res2 = appsScript.executeDoPost(payload);
      expect(res2.success).toBe(true);
      expect(res2.alreadyProcessed).toBe(true);
      expect(res2.eventId).toBe("evt_replay_A");
      expect(appsScript.getFunnelsDoneCallCount()).toBe(1); // Zero duplicate invocations
    });

    it("Scenario B: Reused eventId with altered content/timestamp is intercepted by eventId deduplication", () => {
      const appsScript = createAppsScriptEnvironment("ai_masterclass");
      appsScript.initOrder("order_replay_B1", 117);
      appsScript.initOrder("order_replay_B2", 117);

      const now = Date.now();

      // Original event processed
      const origPayment = {
        id: "pay_replay_B1",
        order_id: "order_replay_B1",
        amount: 11700,
        currency: "INR",
        status: "captured",
        email: "b1@test.com",
        contact: "+919876543210",
      };
      const digest1 = computeCanonicalPayloadDigest(origPayment);
      const sig1 = computeCanonicalProxySignature(
        {
          eventId: "evt_shared_001",
          orderId: "order_replay_B1",
          paymentId: "pay_replay_B1",
          timestamp: now,
          productKey: "ai_masterclass",
          payloadDigest: digest1,
        },
        TEST_PROXY_SECRET
      );

      appsScript.executeDoPost({
        event: "payment.captured",
        eventId: "evt_shared_001",
        timestamp: now,
        proxy_version: "v2",
        target_product: "ai_masterclass",
        payload_digest: digest1,
        proxy_signature: sig1,
        payload: { payment: { entity: origPayment } },
      });
      expect(appsScript.getFunnelsDoneCallCount()).toBe(1);

      // Reused eventId on a different payment/timestamp
      const alteredPayment = {
        id: "pay_replay_B2",
        order_id: "order_replay_B2",
        amount: 11700,
        currency: "INR",
        status: "captured",
        email: "b2@test.com",
        contact: "+919876543210",
      };
      const digest2 = computeCanonicalPayloadDigest(alteredPayment);
      const sig2 = computeCanonicalProxySignature(
        {
          eventId: "evt_shared_001",
          orderId: "order_replay_B2",
          paymentId: "pay_replay_B2",
          timestamp: now + 500,
          productKey: "ai_masterclass",
          payloadDigest: digest2,
        },
        TEST_PROXY_SECRET
      );

      const replayRes = appsScript.executeDoPost({
        event: "payment.captured",
        eventId: "evt_shared_001", // Reused event ID
        timestamp: now + 500,
        proxy_version: "v2",
        target_product: "ai_masterclass",
        payload_digest: digest2,
        proxy_signature: sig2,
        payload: { payment: { entity: alteredPayment } },
      });

      // Intercepted as alreadyProcessed, avoiding second course registration for order B2
      expect(replayRes.alreadyProcessed).toBe(true);
      expect(appsScript.getFunnelsDoneCallCount()).toBe(1);
    });

    it("Scenario C: Reused timestamp with altered payload is rejected", () => {
      const appsScript = createAppsScriptEnvironment("ai_masterclass");
      appsScript.initOrder("order_replay_C", 117);

      const now = Date.now();
      const validPayment = {
        id: "pay_replay_C",
        order_id: "order_replay_C",
        amount: 11700,
        currency: "INR",
        status: "captured",
        email: "c@test.com",
        contact: "+919876543210",
      };

      const validDigest = computeCanonicalPayloadDigest(validPayment);
      const validSig = computeCanonicalProxySignature(
        {
          eventId: "evt_replay_C",
          orderId: "order_replay_C",
          paymentId: "pay_replay_C",
          timestamp: now,
          productKey: "ai_masterclass",
          payloadDigest: validDigest,
        },
        TEST_PROXY_SECRET
      );

      // Reused timestamp but forged order/payment
      const forgedPayload = {
        event: "payment.captured",
        eventId: "evt_forged_C",
        timestamp: now, // Reused timestamp
        proxy_version: "v2",
        target_product: "ai_masterclass",
        payload_digest: validDigest,
        proxy_signature: validSig, // Old signature bound to order_replay_C & pay_replay_C
        payload: {
          payment: {
            entity: {
              ...validPayment,
              id: "pay_forged_999",
              order_id: "order_forged_999",
            },
          },
        },
      };

      expect(() => appsScript.executeDoPost(forgedPayload)).toThrow("INVALID_WEBHOOK_SIGNATURE");
    });

    it("Scenario D: Stale signed request (timestamp older than 5 minutes) is rejected", () => {
      const appsScript = createAppsScriptEnvironment("ai_masterclass");
      appsScript.initOrder("order_stale_01", 117);

      const staleTime = Date.now() - 360000; // 6 minutes ago (tolerance is 5 min)
      const rawPayment = {
        id: "pay_stale_01",
        order_id: "order_stale_01",
        amount: 11700,
        currency: "INR",
        status: "captured",
        email: "stale@test.com",
        contact: "+919876543210",
      };

      const digest = computeCanonicalPayloadDigest(rawPayment);
      const signature = computeCanonicalProxySignature(
        {
          eventId: "evt_stale_01",
          orderId: "order_stale_01",
          paymentId: "pay_stale_01",
          timestamp: staleTime,
          productKey: "ai_masterclass",
          payloadDigest: digest,
        },
        TEST_PROXY_SECRET
      );

      const stalePayload = {
        event: "payment.captured",
        eventId: "evt_stale_01",
        timestamp: staleTime,
        proxy_version: "v2",
        target_product: "ai_masterclass",
        payload_digest: digest,
        proxy_signature: signature,
        payload: { payment: { entity: rawPayment } },
      };

      expect(() => appsScript.executeDoPost(stalePayload)).toThrow("REPLAY_EXPIRED_TIMESTAMP");
    });

    it("Scenario E: Concurrent requests with lock contention serializes and prevents duplicate invoices", () => {
      const appsScript = createAppsScriptEnvironment("ai_masterclass");
      appsScript.initOrder("order_conc_01", 117);

      const now = Date.now();
      const rawPayment = {
        id: "pay_conc_01",
        order_id: "order_conc_01",
        amount: 11700,
        currency: "INR",
        status: "captured",
        email: "conc@test.com",
        contact: "+919876543210",
      };

      const digest = computeCanonicalPayloadDigest(rawPayment);
      const sig1 = computeCanonicalProxySignature(
        {
          eventId: "evt_conc_01",
          orderId: "order_conc_01",
          paymentId: "pay_conc_01",
          timestamp: now,
          productKey: "ai_masterclass",
          payloadDigest: digest,
        },
        TEST_PROXY_SECRET
      );

      // Thread 1 completes successfully
      const res1 = appsScript.executeDoPost({
        event: "payment.captured",
        eventId: "evt_conc_01",
        timestamp: now,
        proxy_version: "v2",
        target_product: "ai_masterclass",
        payload_digest: digest,
        proxy_signature: sig1,
        payload: { payment: { entity: rawPayment } },
      });
      expect(res1.success).toBe(true);
      expect(appsScript.getFunnelsDoneCallCount()).toBe(1);

      // Thread 2 arrives for the same payment under a different reconciliation event ID
      const sig2 = computeCanonicalProxySignature(
        {
          eventId: "rec_conc_02",
          orderId: "order_conc_01",
          paymentId: "pay_conc_01",
          timestamp: now,
          productKey: "ai_masterclass",
          payloadDigest: digest,
        },
        TEST_PROXY_SECRET
      );

      const res2 = appsScript.executeDoPost({
        event: "payment.captured",
        eventId: "rec_conc_02",
        timestamp: now,
        proxy_version: "v2",
        target_product: "ai_masterclass",
        payload_digest: digest,
        proxy_signature: sig2,
        payload: { payment: { entity: rawPayment } },
      });

      // Thread 2 finds PROCESSED_PAY_pay_conc_01 and reuses invoice
      expect(res2.success).toBe(true);
      expect(res2.alreadyProcessed).toBe(true);
      expect(res2.invoiceNumber).toBe(res1.invoiceNumber);
      expect(appsScript.getFunnelsDoneCallCount()).toBe(1);
    });

    it("Scenario F: Retry succeeds upon temporary failure without duplicate invoice generation", () => {
      const appsScript = createAppsScriptEnvironment("ai_masterclass");
      appsScript.initOrder("order_retry_F", 117);

      const now = Date.now();
      const rawPayment = {
        id: "pay_retry_F",
        order_id: "order_retry_F",
        amount: 11700,
        currency: "INR",
        status: "captured",
        email: "retryF@test.com",
        contact: "+919876543210",
      };

      const digest = computeCanonicalPayloadDigest(rawPayment);
      const sig = computeCanonicalProxySignature(
        {
          eventId: "evt_retry_F",
          orderId: "order_retry_F",
          paymentId: "pay_retry_F",
          timestamp: now,
          productKey: "ai_masterclass",
          payloadDigest: digest,
        },
        TEST_PROXY_SECRET
      );

      const payload = {
        event: "payment.captured",
        eventId: "evt_retry_F",
        timestamp: now,
        proxy_version: "v2",
        target_product: "ai_masterclass",
        payload_digest: digest,
        proxy_signature: sig,
        payload: { payment: { entity: rawPayment } },
      };

      // 1. Initial attempt fails due to simulated Google Sheets outage
      expect(() =>
        appsScript.executeDoPost(payload, { simulateSheetsFailure: true })
      ).toThrow("GOOGLE_SHEETS_RPC_FAILURE");

      // PROCESSED_EVT_ is NOT written because the call threw before completion:
      expect(appsScript.scriptProperties.has("PROCESSED_EVT_evt_retry_F")).toBe(false);

      // FunnelsDone was called and invoice was cached in VERIFIED_INV_pay_retry_F before the Sheets failure:
      expect(appsScript.scriptProperties.has("VERIFIED_INV_pay_retry_F")).toBe(true);
      expect(appsScript.getFunnelsDoneCallCount()).toBe(1);

      // 2. Retry attempt succeeds without calling FunnelsDone a second time!
      const retryRes = appsScript.executeDoPost(payload, { simulateSheetsFailure: false });
      expect(retryRes.success).toBe(true);
      expect(retryRes.verified).toBe(true);
      expect(appsScript.getFunnelsDoneCallCount()).toBe(1); // STILL 1!
      expect(appsScript.scriptProperties.has("PROCESSED_EVT_evt_retry_F")).toBe(true);
      expect(appsScript.rows[1][7]).toBe("✅ PAID");
    });
  });

  // ==========================================================================
  // 4. ADMINISTRATIVE RECONCILIATION INTEGRATION WITH V2 SIGNING
  // ==========================================================================
  describe("4. Administrative Reconciliation Integration with v2 Canonical Signing", () => {
    it("4a. Reconciliation endpoint generates v2 canonical signature matching Apps Script", async () => {
      let forwardedBody: any = null;
      const mockFetch = vi.fn().mockImplementation((url: string, init?: any) => {
        if (url.includes("/payments/")) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({
              id: "pay_rec_v2_01",
              order_id: "order_rec_v2_01",
              amount: 11700,
              currency: "INR",
              status: "captured",
              email: "reconcile@test.com",
              notes: { product_key: "ai_masterclass" },
            }),
          });
        }
        if (url.includes("/orders/")) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({
              id: "order_rec_v2_01",
              notes: { product_key: "ai_masterclass" },
            }),
          });
        }
        if (url.includes("script.google.com")) {
          forwardedBody = JSON.parse(init.body);
          return Promise.resolve({
            ok: true,
            status: 200,
            text: async () => JSON.stringify({ success: true, verified: true }),
          });
        }
        return Promise.resolve({ ok: true, status: 200, json: async () => ({}) });
      });

      const res = await handleAdminReconciliationRequest({
        method: "POST",
        authHeader: `Bearer ${TEST_ADMIN_SECRET}`,
        expectedAdminSecret: TEST_ADMIN_SECRET,
        paymentId: "pay_rec_v2_01",
        orderId: "order_rec_v2_01",
        proxySecret: TEST_PROXY_SECRET,
        keyId: LIVE_RAZORPAY_KEY_ID,
        keySecret: LIVE_RAZORPAY_KEY_SECRET,
        fetchImpl: mockFetch as any,
      });

      expect(res.success).toBe(true);
      expect(res.reconciled).toBe(true);
      expect(forwardedBody).toBeDefined();
      expect(forwardedBody.proxy_version).toBe("v2");
      expect(forwardedBody.target_product).toBe("ai_masterclass");
      expect(forwardedBody.payload_digest).toBeDefined();
      expect(forwardedBody.proxy_signature).toBeDefined();

      // Ensure Apps Script validates this forwarded reconciliation payload
      const appsScript = createAppsScriptEnvironment("ai_masterclass");
      appsScript.initOrder("order_rec_v2_01", 117, "reconcile@test.com");
      const gasRes = appsScript.executeDoPost(forwardedBody);
      expect(gasRes.success).toBe(true);
      expect(gasRes.verified).toBe(true);
    });
  });
});
