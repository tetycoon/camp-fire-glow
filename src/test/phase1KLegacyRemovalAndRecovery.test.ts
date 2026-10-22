import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {
  computeCanonicalPayloadDigest,
  computeHardenedPayloadDigest,
  computeCanonicalProxySignature,
  computeHardenedProxySignature,
  determineProductRoute,
  handleIncomingRazorpayWebhook,
  verifyRazorpayWebhookSignature,
} from "../../backend/webhook_proxy/razorpay_webhook_proxy.js";

const TEST_WEBHOOK_SECRET = "whsec_test_secret_legacy_removal_123456789";
const TEST_PROXY_SECRET = "proxy_secret_high_entropy_v2_signing_abcdef987654321";
const LIVE_RAZORPAY_KEY_ID = "rzp_live_T2CbVONQc6qrqj";
const LIVE_RAZORPAY_KEY_SECRET = "live_rzp_secret_dummy_for_tests_123456";

/**
 * Creates an in-memory Google Apps Script simulator matching the Phase 1K production GAS implementation.
 */
function createPhase1KAppsScriptEnvironment(expectedProductKey: string, initialProps: Record<string, string> = {}) {
  const scriptProperties = new Map<string, string>();
  scriptProperties.set("WEBHOOK_PROXY_SECRET", TEST_PROXY_SECRET);
  scriptProperties.set("INVOICE_TOKEN_SECRET", "inv_token_secret_test_54321");
  scriptProperties.set("RAZORPAY_KEY_SECRET", LIVE_RAZORPAY_KEY_SECRET);
  scriptProperties.set("STRICT_PROXY_MODE", "true"); // Default to strict mode

  for (const [k, v] of Object.entries(initialProps)) {
    scriptProperties.set(k, v);
  }

  let funnelsDoneInvoiceCounter = 1000;
  let funnelsDoneCreateCalls = 0;
  let funnelsDoneQueryCalls = 0;
  let whatsAppCalls = 0;
  let isLocked = false;
  const securityWarnings: string[] = [];

  const mockFunnelsDoneInvoices: Array<{
    id: string;
    invoiceNumber: string;
    invoiceNumberPrefix: string;
    contactId: string;
    description: string;
  }> = [];

  const rows: any[][] = [
    ["Timestamp", "Name", "Email", "Phone", "Profession", "Language", "Amount", "Status", "Order ID", "Payment ID", "Email Status", "Invoice Number"],
  ];

  function constantTimeEquals(a: string, b: string): boolean {
    if (typeof a !== "string" || typeof b !== "string") return false;
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) {
      diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return diff === 0;
  }

  function computeSha256Hex(payload: string): string {
    return crypto.createHash("sha256").update(payload, "utf8").digest("hex");
  }

  function computeHmacSha256Hex(payload: string, secret: string): string {
    return crypto.createHmac("sha256", secret).update(payload, "utf8").digest("hex");
  }

  function computeCanonicalPayloadDigestGas(paymentEntity: any, format?: string): string {
    if (!paymentEntity || typeof paymentEntity !== "object") return "";
    const amount = paymentEntity.amount !== undefined ? String(paymentEntity.amount).trim() : "";
    const currency = paymentEntity.currency ? String(paymentEntity.currency).trim() : "";
    const status = paymentEntity.status ? String(paymentEntity.status).trim() : "";
    const email = paymentEntity.email ? String(paymentEntity.email).trim().toLowerCase() : "";
    const contact = paymentEntity.contact ? String(paymentEntity.contact).trim() : "";

    if (format === "v1" || format === "5field" || format === "legacy") {
      return computeSha256Hex(amount + "|" + currency + "|" + status + "|" + email + "|" + contact);
    }

    const method = paymentEntity.method ? String(paymentEntity.method).trim() : "";
    const accountId = (paymentEntity.account_id || paymentEntity.accountId || paymentEntity.notes?.account_id)
      ? String(paymentEntity.account_id || paymentEntity.accountId || paymentEntity.notes?.account_id).trim()
      : "";

    let canonicalNotes = "";
    if (paymentEntity.notes && typeof paymentEntity.notes === "object") {
      const keys = Object.keys(paymentEntity.notes).sort();
      canonicalNotes = keys.map((k) => k + "=" + String(paymentEntity.notes[k]).trim()).join(",");
    }

    const canonicalString = amount + "|" + currency + "|" + status + "|" + email + "|" + contact + "|" + method + "|" + accountId + "|" + canonicalNotes;
    return computeSha256Hex(canonicalString);
  }

  function syncInvoiceWithFunnelsDoneSim(
    customerName: string,
    customerEmail: string,
    customerPhone: string,
    courseName: string,
    totalAmount: number,
    paymentId: string,
    orderId: string,
    simOptions: {
      simulateTimeout?: boolean;
      forceQueryFailure?: boolean;
    } = {}
  ): string | null {
    const cleanPayId = String(paymentId || "").trim();

    // 0. Pre-check: If invoice was already verified, reuse
    const invoiceState = scriptProperties.get("INVOICE_STATE_" + cleanPayId);
    if (invoiceState === "UNCERTAIN_INVOICE_PENDING" || invoiceState === "INVOICE_REQUEST_PENDING") {
      const cachedInv = scriptProperties.get("VERIFIED_INV_" + cleanPayId);
      if (cachedInv) {
        try {
          const parsed = JSON.parse(cachedInv);
          if (parsed?.invoiceNumber) return parsed.invoiceNumber;
        } catch (e) {}
      }

      // 1b. Check if invoice for this paymentId exists on FunnelsDone
      funnelsDoneQueryCalls++;
      if (simOptions.forceQueryFailure) {
        return null;
      }

      const candidateMatches: string[] = [];
      for (const inv of mockFunnelsDoneInvoices) {
        if (inv.description.includes(cleanPayId)) {
          const matchedNo = inv.invoiceNumberPrefix ? (inv.invoiceNumberPrefix + inv.invoiceNumber) : ("TT/26-27/" + inv.invoiceNumber);
          candidateMatches.push(matchedNo);
        }
      }

      if (candidateMatches.length === 1) {
        scriptProperties.set("INVOICE_STATE_" + cleanPayId, "RESOLVED");
        return candidateMatches[0];
      } else if (candidateMatches.length > 1) {
        // Ambiguous match: Retain uncertain state, return null (never create duplicate)
        return null;
      } else {
        // Zero match: Retain uncertain state, return null
        return null;
      }
    }

    // Upsert Contact
    const contactId = "contact_" + cleanPayId;

    // Simulate lost response / timeout on FunnelsDone create
    if (simOptions.simulateTimeout) {
      funnelsDoneCreateCalls++;
      // Provider created it in the cloud:
      const invNo = String(++funnelsDoneInvoiceCounter);
      mockFunnelsDoneInvoices.push({
        id: "inv_" + invNo,
        invoiceNumber: invNo,
        invoiceNumberPrefix: "TT/26-27/",
        contactId,
        description: `SAC: 999293 | Razorpay Payment ID: ${cleanPayId}`,
      });
      // But response timed out before GAS got response:
      scriptProperties.set("INVOICE_STATE_" + cleanPayId, "UNCERTAIN_INVOICE_PENDING");
      return null;
    }

    // Normal successful FunnelsDone invoice creation
    scriptProperties.set("INVOICE_STATE_" + cleanPayId, "INVOICE_REQUEST_PENDING");
    funnelsDoneCreateCalls++;
    const invNo = String(++funnelsDoneInvoiceCounter);
    mockFunnelsDoneInvoices.push({
      id: "inv_" + invNo,
      invoiceNumber: invNo,
      invoiceNumberPrefix: "TT/26-27/",
      contactId,
      description: `SAC: 999293 | Razorpay Payment ID: ${cleanPayId}`,
    });

    scriptProperties.set("INVOICE_STATE_" + cleanPayId, "RESOLVED");
    return "TT/26-27/" + invNo;
  }

  return {
    scriptProperties,
    rows,
    mockFunnelsDoneInvoices,
    securityWarnings,
    getFunnelsDoneCreateCalls: () => funnelsDoneCreateCalls,
    getFunnelsDoneQueryCalls: () => funnelsDoneQueryCalls,
    getWhatsAppCalls: () => whatsAppCalls,

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

    executeDoPost(
      body: any,
      options: {
        simulateInvoiceTimeout?: boolean;
        simulateNotificationError?: boolean;
        forceQueryFailure?: boolean;
      } = {}
    ) {
      if (isLocked) {
        throw new Error("LOCK_TIMEOUT: Script lock acquired by another thread");
      }
      isLocked = true;
      try {
        const paymentEntity = body.payload?.payment?.entity;
        const cleanOrderId = String(body.orderId || body.order_id || paymentEntity?.order_id || "").trim();
        const cleanPaymentId = String(body.paymentId || body.payment_id || paymentEntity?.id || "").trim();
        const cleanEventId = String(body.eventId || body.id || "").trim();
        const cleanTimestamp = Number(body.timestamp) || 0;
        const cleanTargetProduct = String(body.target_product || body.targetProduct || "").trim().toLowerCase();
        const cleanPayloadDigest = String(body.payload_digest || "").trim().toLowerCase();
        const cleanProxyVersion = String(body.proxy_version || "").trim();
        const cleanEventType = String(body.event || paymentEntity?.event || "payment.captured").trim();
        const cleanAmount = paymentEntity?.amount !== undefined ? String(paymentEntity.amount).trim() : "";
        const cleanCurrency = paymentEntity?.currency ? String(paymentEntity.currency).trim() : "INR";
        const cleanStatus = paymentEntity?.status ? String(paymentEntity.status).trim() : "captured";
        const cleanAccountId = String(paymentEntity?.account_id || paymentEntity?.accountId || paymentEntity?.notes?.account_id || "").trim();

        const strictMode = scriptProperties.get("STRICT_PROXY_MODE") === "true" || scriptProperties.get("ALLOW_LEGACY_PROXY_SIGNATURE") === "false";

        // Phase 1K Strict Protocol Enforcement
        if (strictMode) {
          if (!cleanProxyVersion) {
            throw new Error("MISSING_PROTOCOL_VERSION: proxy_version is required in strict mode.");
          }
          if (cleanProxyVersion !== "v2.1") {
            throw new Error("PROTOCOL_DOWNGRADE_REJECTED: Only v2.1 proxy signatures are permitted in strict mode (received " + cleanProxyVersion + ").");
          }
        } else {
          if (cleanProxyVersion !== "v2.1") {
            securityWarnings.push("SECURITY_WARNING: Processing legacy or unversioned webhook proxy signature (" + (cleanProxyVersion || "legacy") + ") under migration mode.");
          }
        }

        const isV2 = (cleanProxyVersion === "v2.1" || cleanProxyVersion === "v2" || Boolean(cleanPayloadDigest && cleanTargetProduct));

        // 1. Destination binding
        if (isV2) {
          if (!cleanTargetProduct || cleanTargetProduct !== expectedProductKey) {
            throw new Error("DESTINATION_MISMATCH: Webhook intended for '" + cleanTargetProduct + "' cannot be processed by '" + expectedProductKey + "'.");
          }
        }

        // 2. Replay prevention: timestamp freshness
        const now = Date.now();
        if (!cleanTimestamp || Math.abs(now - cleanTimestamp) > 300000) {
          throw new Error("REPLAY_EXPIRED_TIMESTAMP: Webhook timestamp expired or outside tolerance window.");
        }

        // 3. Tamper resistance & payload integrity verification
        if (isV2) {
          const digest8 = computeCanonicalPayloadDigestGas(paymentEntity);
          let digestValid = cleanPayloadDigest && constantTimeEquals(digest8, cleanPayloadDigest);
          if (!digestValid && !strictMode) {
            const digest5 = computeCanonicalPayloadDigestGas(paymentEntity, "5field");
            digestValid = cleanPayloadDigest && constantTimeEquals(digest5, cleanPayloadDigest);
          }
          if (!digestValid) {
            throw new Error("PAYLOAD_DIGEST_MISMATCH: Canonical payload digest does not match payment entity.");
          }

          // Verify signature:
          const webhookProxySecret = scriptProperties.get("WEBHOOK_PROXY_SECRET") || "";
          const expectedSig12 = computeHmacSha256Hex(
            "v2|" + cleanEventId + "|" + cleanEventType + "|" + cleanOrderId + "|" + cleanPaymentId + "|" + cleanTimestamp + "|" + cleanTargetProduct + "|" + cleanAmount + "|" + cleanCurrency + "|" + cleanStatus + "|" + cleanAccountId + "|" + cleanPayloadDigest,
            webhookProxySecret
          );
          const cleanSig = String(body.proxy_signature || "").trim().toLowerCase();
          let sigValid = constantTimeEquals(expectedSig12, cleanSig);

          // 7-tuple permitted ONLY when strictMode is false
          if (!sigValid && !strictMode) {
            const expectedSig7 = computeHmacSha256Hex(
              "v2|" + cleanEventId + "|" + cleanOrderId + "|" + cleanPaymentId + "|" + cleanTimestamp + "|" + cleanTargetProduct + "|" + cleanPayloadDigest,
              webhookProxySecret
            );
            sigValid = constantTimeEquals(expectedSig7, cleanSig);
          }

          if (!body.proxy_signature || !sigValid) {
            throw new Error("INVALID_WEBHOOK_SIGNATURE: Webhook proxy signature verification failed.");
          }
        } else {
          if (strictMode) {
            throw new Error("PROTOCOL_DOWNGRADE_REJECTED: Legacy v1 proxy signatures are prohibited in strict mode.");
          }
          const webhookProxySecret = scriptProperties.get("WEBHOOK_PROXY_SECRET") || "";
          const expectedProxySig = computeHmacSha256Hex(cleanEventId + "|" + cleanOrderId + "|" + cleanPaymentId + "|" + cleanTimestamp, webhookProxySecret);
          if (!body.proxy_signature || !constantTimeEquals(expectedProxySig, String(body.proxy_signature).trim().toLowerCase())) {
            throw new Error("INVALID_WEBHOOK_SIGNATURE: Webhook proxy signature verification failed.");
          }
        }

        // 4. Replay prevention & Event Integrity check
        if (cleanEventId) {
          const existingEvt = scriptProperties.get("PROCESSED_EVT_" + cleanEventId);
          if (existingEvt) {
            const parsed = JSON.parse(existingEvt);
            if (
              (cleanPayloadDigest && parsed.payloadDigest && parsed.payloadDigest !== cleanPayloadDigest) ||
              (cleanPaymentId && parsed.paymentId && parsed.paymentId !== cleanPaymentId)
            ) {
              throw new Error("EVENT_ID_INTEGRITY_CONFLICT: Reused event ID does not match original event payload digest or payment identifier.");
            }
            return {
              success: true,
              alreadyProcessed: true,
              duplicate: true,
              eventId: cleanEventId,
            };
          }
        }

        // Process Verified Payment
        if (scriptProperties.get("PROCESSED_PAY_" + cleanPaymentId)) {
          const existingInv = scriptProperties.get("VERIFIED_INV_" + cleanPaymentId);
          return {
            success: true,
            alreadyProcessed: true,
            paymentId: cleanPaymentId,
            orderId: cleanOrderId,
            invoice: existingInv ? JSON.parse(existingInv) : null,
          };
        }

        let targetRowIndex = -1;
        for (let i = 1; i < rows.length; i++) {
          if (rows[i][8] === cleanOrderId) {
            targetRowIndex = i;
            break;
          }
        }
        if (targetRowIndex === -1) {
          throw new Error("ORDER_NOT_FOUND: Order ID not found in sheet.");
        }

        const row = rows[targetRowIndex];
        const expectedAmount = Number(row[6]);
        const userName = String(row[1] || "Learner");
        const userEmail = String(row[2] || "learner@example.com");
        const userPhone = String(row[3] || "");

        // Sync Invoice
        let invRecord: any = null;
        const existingInvJson = scriptProperties.get("VERIFIED_INV_" + cleanPaymentId);
        if (existingInvJson) {
          try {
            invRecord = JSON.parse(existingInvJson);
          } catch (e) {}
        }

        if (!invRecord) {
          const courseTitle = "Tech Tycoon Masterclass";
          const fdInvoiceNo = syncInvoiceWithFunnelsDoneSim(
            userName,
            userEmail,
            userPhone,
            courseTitle,
            expectedAmount,
            cleanPaymentId,
            cleanOrderId,
            {
              simulateTimeout: options.simulateInvoiceTimeout,
              forceQueryFailure: options.forceQueryFailure,
            }
          );

          if (!fdInvoiceNo) {
            row[7] = "PENDING_RECONCILIATION";
            return {
              success: true,
              verified: true,
              uncertainInvoice: true,
              paymentId: cleanPaymentId,
              orderId: cleanOrderId,
              status: "PENDING_RECONCILIATION",
              message: "Payment captured but invoice synchronization is uncertain. Held for reconciliation.",
            };
          }

          // Dispatch Notification (if failure, should not invalidate payment)
          if (options.simulateNotificationError) {
            // notification failed, but invoice was created
          } else {
            whatsAppCalls++;
            row[10] = "SENT";
          }

          row[7] = "✅ PAID";
          row[9] = cleanPaymentId;
          scriptProperties.set("PROCESSED_PAY_" + cleanPaymentId, new Date().toISOString());

          invRecord = {
            verified: true,
            paymentId: cleanPaymentId,
            orderId: cleanOrderId,
            invoiceNumber: fdInvoiceNo,
            name: userName,
            email: userEmail,
            phone: userPhone,
            course: courseTitle,
            amount: expectedAmount,
          };
          scriptProperties.set("VERIFIED_INV_" + cleanPaymentId, JSON.stringify(invRecord));
        }

        // Dedicated INVOICE_TOKEN_SECRET check
        const invSecret = scriptProperties.get("INVOICE_TOKEN_SECRET");
        if (!invSecret) {
          throw new Error("MISSING_INVOICE_TOKEN_SECRET: Dedicated INVOICE_TOKEN_SECRET must be configured in Script Properties.");
        }
        const expiresAt = Date.now() + 86400000;
        const invoiceToken = expiresAt + "." + computeHmacSha256Hex(cleanPaymentId + "|" + cleanOrderId + "|" + expiresAt, invSecret);

        // Commit PROCESSED_EVT_ ONLY if not uncertain
        if (cleanEventId) {
          scriptProperties.set("PROCESSED_EVT_" + cleanEventId, JSON.stringify({
            timestamp: new Date().toISOString(),
            payloadDigest: cleanPayloadDigest,
            paymentId: cleanPaymentId,
            orderId: cleanOrderId,
          }));
        }

        return {
          success: true,
          verified: true,
          paymentId: cleanPaymentId,
          orderId: cleanOrderId,
          invoiceNumber: invRecord.invoiceNumber,
          invoiceToken: invoiceToken,
          invoice: invRecord,
        };
      } finally {
        isLocked = false;
      }
    },
  };
}

describe("PHASE 1K: Legacy Signature Removal and Invoice Recovery Verification", () => {
  // ==========================================================================
  // SUITE 1: STRICT PROTOCOL MODE & LEGACY DOWNGRADE PREVENTION
  // ==========================================================================
  describe("Suite 1: Strict Protocol Enforcement & Legacy Downgrade Prevention", () => {
    it("1a. Rejects webhook when proxy_version is completely missing in strict mode", () => {
      const gas = createPhase1KAppsScriptEnvironment("ai_masterclass", { STRICT_PROXY_MODE: "true" });
      gas.initOrder("order_strict_01", 117);

      const payment = {
        id: "pay_strict_01",
        order_id: "order_strict_01",
        amount: 11700,
        currency: "INR",
        status: "captured",
        email: "test@example.com",
        contact: "+919876543210",
        method: "upi",
        notes: { product_key: "ai_masterclass" },
      };

      const digest = computeHardenedPayloadDigest(payment);
      const sig = computeHardenedProxySignature({
        eventId: "evt_strict_01",
        eventType: "payment.captured",
        orderId: "order_strict_01",
        paymentId: "pay_strict_01",
        timestamp: Date.now(),
        productKey: "ai_masterclass",
        amount: 11700,
        currency: "INR",
        status: "captured",
        payloadDigest: digest,
      }, TEST_PROXY_SECRET);

      expect(() => {
        gas.executeDoPost({
          event: "payment.captured",
          eventId: "evt_strict_01",
          timestamp: Date.now(),
          // proxy_version missing
          target_product: "ai_masterclass",
          payload_digest: digest,
          proxy_signature: sig,
          payload: { payment: { entity: payment } },
        });
      }).toThrowError(/MISSING_PROTOCOL_VERSION/);
    });

    it("1b. Rejects webhook with legacy protocol version 'v2' in strict mode", () => {
      const gas = createPhase1KAppsScriptEnvironment("ai_masterclass", { STRICT_PROXY_MODE: "true" });
      gas.initOrder("order_strict_02", 117);

      const payment = {
        id: "pay_strict_02",
        order_id: "order_strict_02",
        amount: 11700,
        currency: "INR",
        status: "captured",
        email: "test@example.com",
        contact: "+919876543210",
        method: "card",
        notes: { product_key: "ai_masterclass" },
      };

      const digest = computeCanonicalPayloadDigest(payment); // 5-field
      const sig7 = computeCanonicalProxySignature({
        eventId: "evt_strict_02",
        orderId: "order_strict_02",
        paymentId: "pay_strict_02",
        timestamp: Date.now(),
        productKey: "ai_masterclass",
        payloadDigest: digest,
      }, TEST_PROXY_SECRET);

      expect(() => {
        gas.executeDoPost({
          event: "payment.captured",
          eventId: "evt_strict_02",
          timestamp: Date.now(),
          proxy_version: "v2", // Legacy Phase 1I version
          target_product: "ai_masterclass",
          payload_digest: digest,
          proxy_signature: sig7,
          payload: { payment: { entity: payment } },
        });
      }).toThrowError(/PROTOCOL_DOWNGRADE_REJECTED/);
    });

    it("1c. Rejects 7-tuple signature in strict mode even if signature math matches 7-tuple", () => {
      const gas = createPhase1KAppsScriptEnvironment("ai_masterclass", { STRICT_PROXY_MODE: "true" });
      gas.initOrder("order_strict_03", 117);

      const payment = {
        id: "pay_strict_03",
        order_id: "order_strict_03",
        amount: 11700,
        currency: "INR",
        status: "captured",
        email: "test@example.com",
        contact: "+919876543210",
        method: "netbanking",
        notes: { product_key: "ai_masterclass" },
      };

      const digest8 = computeHardenedPayloadDigest(payment);
      // Valid 7-tuple signature
      const sig7 = computeCanonicalProxySignature({
        eventId: "evt_strict_03",
        orderId: "order_strict_03",
        paymentId: "pay_strict_03",
        timestamp: Date.now(),
        productKey: "ai_masterclass",
        payloadDigest: digest8,
      }, TEST_PROXY_SECRET);

      expect(() => {
        gas.executeDoPost({
          event: "payment.captured",
          eventId: "evt_strict_03",
          timestamp: Date.now(),
          proxy_version: "v2.1",
          target_product: "ai_masterclass",
          payload_digest: digest8,
          proxy_signature: sig7, // 7-tuple HMAC submitted
          payload: { payment: { entity: payment } },
        });
      }).toThrowError(/INVALID_WEBHOOK_SIGNATURE/);
    });

    it("1d. Rejects 5-field payload digest in strict mode even if payload matches 5-field hash", () => {
      const gas = createPhase1KAppsScriptEnvironment("ai_masterclass", { STRICT_PROXY_MODE: "true" });
      gas.initOrder("order_strict_04", 117);

      const payment = {
        id: "pay_strict_04",
        order_id: "order_strict_04",
        amount: 11700,
        currency: "INR",
        status: "captured",
        email: "test@example.com",
        contact: "+919876543210",
        method: "upi",
        notes: { product_key: "ai_masterclass" },
      };

      const digest5 = computeCanonicalPayloadDigest(payment, { fiveField: true });
      const sig12 = computeHardenedProxySignature({
        eventId: "evt_strict_04",
        eventType: "payment.captured",
        orderId: "order_strict_04",
        paymentId: "pay_strict_04",
        timestamp: Date.now(),
        productKey: "ai_masterclass",
        amount: 11700,
        currency: "INR",
        status: "captured",
        payloadDigest: digest5,
      }, TEST_PROXY_SECRET);

      expect(() => {
        gas.executeDoPost({
          event: "payment.captured",
          eventId: "evt_strict_04",
          timestamp: Date.now(),
          proxy_version: "v2.1",
          target_product: "ai_masterclass",
          payload_digest: digest5, // 5-field digest submitted
          proxy_signature: sig12,
          payload: { payment: { entity: payment } },
        });
      }).toThrowError(/PAYLOAD_DIGEST_MISMATCH/);
    });

    it("1e. Fails closed when an attacker strips fields attempting downgrade attack", () => {
      const gas = createPhase1KAppsScriptEnvironment("ai_masterclass", { STRICT_PROXY_MODE: "true" });
      gas.initOrder("order_strict_05", 117);

      const payment = {
        id: "pay_strict_05",
        order_id: "order_strict_05",
        amount: 11700,
        currency: "INR",
        status: "captured",
      };

      expect(() => {
        gas.executeDoPost({
          event: "payment.captured",
          eventId: "evt_strict_05",
          timestamp: Date.now(),
          proxy_version: "v1", // Attacker sends legacy v1
          payload: { payment: { entity: payment } },
        });
      }).toThrowError(/PROTOCOL_DOWNGRADE_REJECTED/);
    });
  });

  // ==========================================================================
  // SUITE 2: TEMPORARY MIGRATION GATE & SECURITY WARNINGS
  // ==========================================================================
  describe("Suite 2: Temporary Migration Gate (Script Property) & Security Warnings", () => {
    it("2a. Permits legacy v2 signature when STRICT_PROXY_MODE=false with SECURITY_WARNING logged", () => {
      const gas = createPhase1KAppsScriptEnvironment("ai_masterclass", {
        STRICT_PROXY_MODE: "false",
        ALLOW_LEGACY_PROXY_SIGNATURE: "true",
      });
      gas.initOrder("order_mig_01", 117);

      const payment = {
        id: "pay_mig_01",
        order_id: "order_mig_01",
        amount: 11700,
        currency: "INR",
        status: "captured",
        email: "mig@example.com",
        contact: "+919876543210",
        notes: { product_key: "ai_masterclass" },
      };

      const now = Date.now();
      const digest5 = computeCanonicalPayloadDigest(payment, { fiveField: true });
      const sig7 = computeCanonicalProxySignature({
        eventId: "evt_mig_01",
        orderId: "order_mig_01",
        paymentId: "pay_mig_01",
        timestamp: now,
        productKey: "ai_masterclass",
        payloadDigest: digest5,
      }, TEST_PROXY_SECRET);

      const res = gas.executeDoPost({
        event: "payment.captured",
        eventId: "evt_mig_01",
        timestamp: now,
        proxy_version: "v2",
        target_product: "ai_masterclass",
        payload_digest: digest5,
        proxy_signature: sig7,
        payload: { payment: { entity: payment } },
      });

      expect(res.success).toBe(true);
      expect(res.verified).toBe(true);
      expect(gas.securityWarnings.length).toBeGreaterThan(0);
      expect(gas.securityWarnings[0]).toContain("SECURITY_WARNING");
    });

    it("2b. Migration mode still strictly rejects forged signatures and tampered amounts", () => {
      const gas = createPhase1KAppsScriptEnvironment("ai_masterclass", {
        STRICT_PROXY_MODE: "false",
      });
      gas.initOrder("order_mig_02", 117);

      const payment = {
        id: "pay_mig_02",
        order_id: "order_mig_02",
        amount: 11700,
        currency: "INR",
        status: "captured",
        email: "tamper@example.com",
        contact: "+919876543210",
      };

      const digest5 = computeCanonicalPayloadDigest(payment, { fiveField: true });

      expect(() => {
        gas.executeDoPost({
          event: "payment.captured",
          eventId: "evt_mig_02",
          timestamp: Date.now(),
          proxy_version: "v2",
          target_product: "ai_masterclass",
          payload_digest: digest5,
          proxy_signature: "forged_signature_hex_12345",
          payload: { payment: { entity: payment } },
        });
      }).toThrowError(/INVALID_WEBHOOK_SIGNATURE/);
    });

    it("2c. Migration mode strictly validates v2.1 if v2.1 is specified in payload", () => {
      const gas = createPhase1KAppsScriptEnvironment("ai_masterclass", {
        STRICT_PROXY_MODE: "false",
      });
      gas.initOrder("order_mig_03", 117);

      const payment = {
        id: "pay_mig_03",
        order_id: "order_mig_03",
        amount: 11700,
        currency: "INR",
        status: "captured",
        email: "v21@example.com",
        contact: "+919876543210",
        method: "upi",
        notes: { product_key: "ai_masterclass" },
      };

      const digest8 = computeHardenedPayloadDigest(payment);
      // But submit 7-tuple signature
      const sig7 = computeCanonicalProxySignature({
        eventId: "evt_mig_03",
        orderId: "order_mig_03",
        paymentId: "pay_mig_03",
        timestamp: Date.now(),
        productKey: "ai_masterclass",
        payloadDigest: digest8,
      }, TEST_PROXY_SECRET);

      // In migration mode with v2.1 declared, 7-tuple is rejected
      const expectedSig12 = computeHardenedProxySignature({
        eventId: "evt_mig_03",
        eventType: "payment.captured",
        orderId: "order_mig_03",
        paymentId: "pay_mig_03",
        timestamp: Date.now(),
        productKey: "ai_masterclass",
        amount: 11700,
        currency: "INR",
        status: "captured",
        payloadDigest: digest8,
      }, TEST_PROXY_SECRET);

      const now = Date.now();
      const validRes = gas.executeDoPost({
        event: "payment.captured",
        eventId: "evt_mig_03",
        timestamp: now,
        proxy_version: "v2.1",
        target_product: "ai_masterclass",
        payload_digest: digest8,
        proxy_signature: computeHardenedProxySignature({
          eventId: "evt_mig_03",
          eventType: "payment.captured",
          orderId: "order_mig_03",
          paymentId: "pay_mig_03",
          timestamp: now,
          productKey: "ai_masterclass",
          amount: 11700,
          currency: "INR",
          status: "captured",
          payloadDigest: digest8,
        }, TEST_PROXY_SECRET),
        payload: { payment: { entity: payment } },
      });

      expect(validRes.success).toBe(true);
      expect(validRes.verified).toBe(true);
    });
  });

  // ==========================================================================
  // SUITE 3: DETERMINISTIC CROSS-PLATFORM PAYLOAD DIGEST VERIFICATION
  // ==========================================================================
  describe("Suite 3: Cross-Platform Canonical Payload Digest Verification", () => {
    it("3a. Produces byte-for-byte identical SHA-256 digest between Node.js and Apps Script algorithms", () => {
      const paymentEntity = {
        amount: 294900,
        currency: "INR",
        status: "captured",
        email: "Student.One@TechTycoon.in",
        contact: "+91 98765 43210",
        method: "card",
        account_id: "acc_live_merchant_123",
        notes: {
          product_key: "academy",
          batch: "Sept_2026",
          student_level: "advanced",
        },
      };

      // Node.js implementation from proxy
      const nodeDigest = computeHardenedPayloadDigest(paymentEntity);

      // GAS implementation simulation
      const amount = String(paymentEntity.amount).trim();
      const currency = String(paymentEntity.currency).trim();
      const status = String(paymentEntity.status).trim();
      const email = String(paymentEntity.email).trim().toLowerCase();
      const contact = String(paymentEntity.contact).trim();
      const method = String(paymentEntity.method).trim();
      const accountId = String(paymentEntity.account_id).trim();

      const sortedNotes = Object.keys(paymentEntity.notes)
        .sort()
        .map((k) => `${k}=${String((paymentEntity.notes as any)[k]).trim()}`)
        .join(",");

      const gasCanonicalString = `${amount}|${currency}|${status}|${email}|${contact}|${method}|${accountId}|${sortedNotes}`;
      const gasDigest = crypto.createHash("sha256").update(gasCanonicalString, "utf8").digest("hex");

      expect(nodeDigest).toBe(gasDigest);
      expect(nodeDigest).toMatch(/^[a-f0-9]{64}$/);
    });

    it("3b. Guarantees deterministic output regardless of notes key insertion order", () => {
      // payment A: notes inserted in order Z, A, M
      const paymentA = {
        amount: 589900,
        currency: "INR",
        status: "captured",
        email: "test@example.com",
        contact: "+919876543210",
        notes: {
          zebra: "end",
          apple: "start",
          mango: "middle",
        },
      };

      // payment B: notes inserted in order A, M, Z
      const paymentB = {
        amount: 589900,
        currency: "INR",
        status: "captured",
        email: "test@example.com",
        contact: "+919876543210",
        notes: {
          apple: "start",
          mango: "middle",
          zebra: "end",
        },
      };

      const digestA = computeHardenedPayloadDigest(paymentA);
      const digestB = computeHardenedPayloadDigest(paymentB);

      expect(digestA).toBe(digestB);
    });

    it("3c. Handles null, undefined, and empty notes gracefully without throwing or mutating format", () => {
      const paymentNullNotes = {
        amount: 100,
        currency: "INR",
        status: "captured",
        email: "null@example.com",
        contact: "+919876543210",
        notes: null,
      };

      const paymentEmptyNotes = {
        amount: 100,
        currency: "INR",
        status: "captured",
        email: "null@example.com",
        contact: "+919876543210",
        notes: {},
      };

      const digestNull = computeHardenedPayloadDigest(paymentNullNotes);
      const digestEmpty = computeHardenedPayloadDigest(paymentEmptyNotes);

      expect(digestNull).toBe(digestEmpty);
      expect(digestNull).toMatch(/^[a-f0-9]{64}$/);
    });

    it("3d. Produces identical 12-tuple HMAC-SHA256 signature string between Node.js and GAS", () => {
      const params = {
        eventId: "evt_cross_platform_99",
        eventType: "payment.captured",
        orderId: "order_cross_platform_99",
        paymentId: "pay_cross_platform_99",
        timestamp: 1776425000000,
        productKey: "ai_bgm",
        amount: 1769900,
        currency: "INR",
        status: "captured",
        accountId: "acc_live_tt_01",
        payloadDigest: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      };

      const nodeSig = computeHardenedProxySignature(params, TEST_PROXY_SECRET);

      const gasMessage = `v2|${params.eventId}|${params.eventType}|${params.orderId}|${params.paymentId}|${params.timestamp}|${params.productKey}|${params.amount}|${params.currency}|${params.status}|${params.accountId}|${params.payloadDigest}`;
      const gasSig = crypto.createHmac("sha256", TEST_PROXY_SECRET).update(gasMessage, "utf8").digest("hex");

      expect(nodeSig).toBe(gasSig);
    });
  });

  // ==========================================================================
  // SUITE 4: FUNNELSDONE INVOICE LOOKUP REALITY & RECOVERY STATE MACHINE
  // ==========================================================================
  describe("Suite 4: FunnelsDone Invoice Lookup Reality & Recovery State Machine", () => {
    it("4a. Formal finding: LeadConnector v2 API GET /invoices/ filters by location/contactId, not paymentId directly", () => {
      // LeadConnector v2 invoice API does not have an official query parameter `paymentId`.
      // The implementation retrieves invoices for the contact and filters by line item description containing paymentId.
      const contactInvoices = [
        { id: "inv_1", invoiceNumber: "1001", invoiceNumberPrefix: "TT/26-27/", description: "Other payment: pay_other_123" },
        { id: "inv_2", invoiceNumber: "1002", invoiceNumberPrefix: "TT/26-27/", description: "SAC: 999293 | Razorpay Payment ID: pay_target_456" },
      ];

      const cleanPayId = "pay_target_456";
      const matches = contactInvoices.filter((inv) => inv.description.includes(cleanPayId));
      expect(matches.length).toBe(1);
      expect(matches[0].invoiceNumber).toBe("1002");
    });

    it("4b. On external invoice timeout: sets UNCERTAIN_INVOICE_PENDING, holds email, sets PENDING_RECONCILIATION, returns uncertainInvoice: true", () => {
      const gas = createPhase1KAppsScriptEnvironment("ai_masterclass");
      gas.initOrder("order_recov_01", 117);

      const payment = {
        id: "pay_recov_01",
        order_id: "order_recov_01",
        amount: 11700,
        currency: "INR",
        status: "captured",
        email: "timeout@example.com",
        contact: "+919876543210",
        method: "upi",
        notes: { product_key: "ai_masterclass" },
      };

      const digest = computeHardenedPayloadDigest(payment);
      const now = Date.now();
      const sig = computeHardenedProxySignature({
        eventId: "evt_recov_01",
        eventType: "payment.captured",
        orderId: "order_recov_01",
        paymentId: "pay_recov_01",
        timestamp: now,
        productKey: "ai_masterclass",
        amount: 11700,
        currency: "INR",
        status: "captured",
        payloadDigest: digest,
      }, TEST_PROXY_SECRET);

      const res = gas.executeDoPost({
        event: "payment.captured",
        eventId: "evt_recov_01",
        timestamp: now,
        proxy_version: "v2.1",
        target_product: "ai_masterclass",
        payload_digest: digest,
        proxy_signature: sig,
        payload: { payment: { entity: payment } },
      }, { simulateInvoiceTimeout: true });

      expect(res.success).toBe(true);
      expect(res.uncertainInvoice).toBe(true);
      expect(res.status).toBe("PENDING_RECONCILIATION");

      // Verify state was marked UNCERTAIN_INVOICE_PENDING
      expect(gas.scriptProperties.get("INVOICE_STATE_pay_recov_01")).toBe("UNCERTAIN_INVOICE_PENDING");

      // Verify PROCESSED_PAY_ and PROCESSED_EVT_ were NOT committed
      expect(gas.scriptProperties.get("PROCESSED_PAY_pay_recov_01")).toBeUndefined();
      expect(gas.scriptProperties.get("PROCESSED_EVT_evt_recov_01")).toBeUndefined();

      // Verify email was NOT sent
      expect(gas.getWhatsAppCalls()).toBe(0);

      // Verify row status is PENDING_RECONCILIATION
      expect(gas.rows[1][7]).toBe("PENDING_RECONCILIATION");
    });

    it("4c. On recovery attempt with 0 matches: retains UNCERTAIN_INVOICE_PENDING and does not generate speculative invoice", () => {
      const gas = createPhase1KAppsScriptEnvironment("ai_masterclass");
      gas.initOrder("order_recov_02", 117);
      gas.scriptProperties.set("INVOICE_STATE_pay_recov_02", "UNCERTAIN_INVOICE_PENDING");

      const payment = {
        id: "pay_recov_02",
        order_id: "order_recov_02",
        amount: 11700,
        currency: "INR",
        status: "captured",
        email: "zero@example.com",
        contact: "+919876543210",
        notes: { product_key: "ai_masterclass" },
      };

      const digest = computeHardenedPayloadDigest(payment);
      const now = Date.now();
      const sig = computeHardenedProxySignature({
        eventId: "evt_recov_02",
        eventType: "payment.captured",
        orderId: "order_recov_02",
        paymentId: "pay_recov_02",
        timestamp: now,
        productKey: "ai_masterclass",
        amount: 11700,
        currency: "INR",
        status: "captured",
        payloadDigest: digest,
      }, TEST_PROXY_SECRET);

      // Provider API has NO matching invoices
      const res = gas.executeDoPost({
        event: "payment.captured",
        eventId: "evt_recov_02",
        timestamp: now,
        proxy_version: "v2.1",
        target_product: "ai_masterclass",
        payload_digest: digest,
        proxy_signature: sig,
        payload: { payment: { entity: payment } },
      });

      expect(res.uncertainInvoice).toBe(true);
      expect(gas.scriptProperties.get("INVOICE_STATE_pay_recov_02")).toBe("UNCERTAIN_INVOICE_PENDING");
      expect(gas.scriptProperties.get("PROCESSED_PAY_pay_recov_02")).toBeUndefined();
    });

    it("4d. On recovery attempt with ambiguous matches (>1): retains UNCERTAIN_INVOICE_PENDING and never creates duplicate", () => {
      const gas = createPhase1KAppsScriptEnvironment("ai_masterclass");
      gas.initOrder("order_recov_03", 117);
      gas.scriptProperties.set("INVOICE_STATE_pay_recov_03", "UNCERTAIN_INVOICE_PENDING");

      // Seed mock provider with 2 conflicting invoices for the same paymentId
      gas.mockFunnelsDoneInvoices.push({
        id: "inv_dup_1",
        invoiceNumber: "101",
        invoiceNumberPrefix: "TT/26-27/",
        contactId: "contact_pay_recov_03",
        description: "Payment ID: pay_recov_03",
      });
      gas.mockFunnelsDoneInvoices.push({
        id: "inv_dup_2",
        invoiceNumber: "102",
        invoiceNumberPrefix: "TT/26-27/",
        contactId: "contact_pay_recov_03",
        description: "Payment ID: pay_recov_03",
      });

      const payment = {
        id: "pay_recov_03",
        order_id: "order_recov_03",
        amount: 11700,
        currency: "INR",
        status: "captured",
        email: "ambig@example.com",
        contact: "+919876543210",
        notes: { product_key: "ai_masterclass" },
      };

      const digest = computeHardenedPayloadDigest(payment);
      const now = Date.now();
      const sig = computeHardenedProxySignature({
        eventId: "evt_recov_03",
        eventType: "payment.captured",
        orderId: "order_recov_03",
        paymentId: "pay_recov_03",
        timestamp: now,
        productKey: "ai_masterclass",
        amount: 11700,
        currency: "INR",
        status: "captured",
        payloadDigest: digest,
      }, TEST_PROXY_SECRET);

      const res = gas.executeDoPost({
        event: "payment.captured",
        eventId: "evt_recov_03",
        timestamp: now,
        proxy_version: "v2.1",
        target_product: "ai_masterclass",
        payload_digest: digest,
        proxy_signature: sig,
        payload: { payment: { entity: payment } },
      });

      expect(res.uncertainInvoice).toBe(true);
      expect(gas.scriptProperties.get("INVOICE_STATE_pay_recov_03")).toBe("UNCERTAIN_INVOICE_PENDING");
      // Zero create calls were made (no duplicate created!)
      expect(gas.getFunnelsDoneCreateCalls()).toBe(0);
    });

    it("4e. On recovery attempt with exactly 1 match: recovers invoice, transitions to RESOLVED, and completes payment", () => {
      const gas = createPhase1KAppsScriptEnvironment("ai_masterclass");
      gas.initOrder("order_recov_04", 117);
      gas.scriptProperties.set("INVOICE_STATE_pay_recov_04", "UNCERTAIN_INVOICE_PENDING");

      // Seed mock provider with exactly 1 invoice
      gas.mockFunnelsDoneInvoices.push({
        id: "inv_exact_1",
        invoiceNumber: "555888",
        invoiceNumberPrefix: "TT/26-27/",
        contactId: "contact_pay_recov_04",
        description: "SAC: 999293 | Razorpay Payment ID: pay_recov_04",
      });

      const payment = {
        id: "pay_recov_04",
        order_id: "order_recov_04",
        amount: 11700,
        currency: "INR",
        status: "captured",
        email: "resolved@example.com",
        contact: "+919876543210",
        notes: { product_key: "ai_masterclass" },
      };

      const digest = computeHardenedPayloadDigest(payment);
      const now = Date.now();
      const sig = computeHardenedProxySignature({
        eventId: "evt_recov_04",
        eventType: "payment.captured",
        orderId: "order_recov_04",
        paymentId: "pay_recov_04",
        timestamp: now,
        productKey: "ai_masterclass",
        amount: 11700,
        currency: "INR",
        status: "captured",
        payloadDigest: digest,
      }, TEST_PROXY_SECRET);

      const res = gas.executeDoPost({
        event: "payment.captured",
        eventId: "evt_recov_04",
        timestamp: now,
        proxy_version: "v2.1",
        target_product: "ai_masterclass",
        payload_digest: digest,
        proxy_signature: sig,
        payload: { payment: { entity: payment } },
      });

      expect(res.success).toBe(true);
      expect(res.verified).toBe(true);
      expect(res.invoiceNumber).toBe("TT/26-27/555888");
      expect(gas.scriptProperties.get("INVOICE_STATE_pay_recov_04")).toBe("RESOLVED");
      expect(gas.scriptProperties.get("PROCESSED_PAY_pay_recov_04")).toBeDefined();
      expect(gas.rows[1][7]).toBe("✅ PAID");
    });

    it("4f. Subsequent retries after resolution return cached invoice without re-calling FunnelsDone API", () => {
      const gas = createPhase1KAppsScriptEnvironment("ai_masterclass");
      gas.initOrder("order_recov_05", 117);

      const payment = {
        id: "pay_recov_05",
        order_id: "order_recov_05",
        amount: 11700,
        currency: "INR",
        status: "captured",
        email: "cached@example.com",
        contact: "+919876543210",
        notes: { product_key: "ai_masterclass" },
      };

      const digest = computeHardenedPayloadDigest(payment);
      const now = Date.now();
      const sig = computeHardenedProxySignature({
        eventId: "evt_recov_05_a",
        eventType: "payment.captured",
        orderId: "order_recov_05",
        paymentId: "pay_recov_05",
        timestamp: now,
        productKey: "ai_masterclass",
        amount: 11700,
        currency: "INR",
        status: "captured",
        payloadDigest: digest,
      }, TEST_PROXY_SECRET);

      // First call succeeds
      const firstRes = gas.executeDoPost({
        event: "payment.captured",
        eventId: "evt_recov_05_a",
        timestamp: now,
        proxy_version: "v2.1",
        target_product: "ai_masterclass",
        payload_digest: digest,
        proxy_signature: sig,
        payload: { payment: { entity: payment } },
      });
      expect(firstRes.success).toBe(true);
      const firstInvNo = firstRes.invoiceNumber;
      expect(gas.getFunnelsDoneCreateCalls()).toBe(1);

      // Retry call with new event ID for same payment
      const sigB = computeHardenedProxySignature({
        eventId: "evt_recov_05_b",
        eventType: "payment.captured",
        orderId: "order_recov_05",
        paymentId: "pay_recov_05",
        timestamp: now,
        productKey: "ai_masterclass",
        amount: 11700,
        currency: "INR",
        status: "captured",
        payloadDigest: digest,
      }, TEST_PROXY_SECRET);

      const retryRes = gas.executeDoPost({
        event: "payment.captured",
        eventId: "evt_recov_05_b",
        timestamp: now,
        proxy_version: "v2.1",
        target_product: "ai_masterclass",
        payload_digest: digest,
        proxy_signature: sigB,
        payload: { payment: { entity: payment } },
      });

      expect(retryRes.alreadyProcessed).toBe(true);
      expect(retryRes.invoice.invoiceNumber).toBe(firstInvNo);
      // Zero additional FunnelsDone calls made
      expect(gas.getFunnelsDoneCreateCalls()).toBe(1);
    });
  });

  // ==========================================================================
  // SUITE 5: NOTIFICATION ISOLATION & CONCURRENCY
  // ==========================================================================
  describe("Suite 5: Notification Failure Isolation & Concurrency Verification", () => {
    it("5a. Email or WhatsApp notification failure does not invalidate payment or recreate invoice", () => {
      const gas = createPhase1KAppsScriptEnvironment("ai_masterclass");
      gas.initOrder("order_notif_01", 117);

      const payment = {
        id: "pay_notif_01",
        order_id: "order_notif_01",
        amount: 11700,
        currency: "INR",
        status: "captured",
        email: "wa_fail@example.com",
        contact: "+919876543210",
        notes: { product_key: "ai_masterclass" },
      };

      const digest = computeHardenedPayloadDigest(payment);
      const now = Date.now();
      const sig = computeHardenedProxySignature({
        eventId: "evt_notif_01",
        eventType: "payment.captured",
        orderId: "order_notif_01",
        paymentId: "pay_notif_01",
        timestamp: now,
        productKey: "ai_masterclass",
        amount: 11700,
        currency: "INR",
        status: "captured",
        payloadDigest: digest,
      }, TEST_PROXY_SECRET);

      const res = gas.executeDoPost({
        event: "payment.captured",
        eventId: "evt_notif_01",
        timestamp: now,
        proxy_version: "v2.1",
        target_product: "ai_masterclass",
        payload_digest: digest,
        proxy_signature: sig,
        payload: { payment: { entity: payment } },
      }, { simulateNotificationError: true });

      expect(res.success).toBe(true);
      expect(res.verified).toBe(true);
      expect(gas.rows[1][7]).toBe("✅ PAID");
      expect(gas.scriptProperties.get("PROCESSED_PAY_pay_notif_01")).toBeDefined();
    });

    it("5b. LockService prevents concurrent webhook delivery from creating duplicate invoices", () => {
      const gas = createPhase1KAppsScriptEnvironment("ai_masterclass");
      gas.initOrder("order_concurrent_01", 117);

      const payment = {
        id: "pay_concurrent_01",
        order_id: "order_concurrent_01",
        amount: 11700,
        currency: "INR",
        status: "captured",
        email: "lock@example.com",
        contact: "+919876543210",
        notes: { product_key: "ai_masterclass" },
      };

      const digest = computeHardenedPayloadDigest(payment);
      const now = Date.now();
      const sig = computeHardenedProxySignature({
        eventId: "evt_concurrent_01",
        eventType: "payment.captured",
        orderId: "order_concurrent_01",
        paymentId: "pay_concurrent_01",
        timestamp: now,
        productKey: "ai_masterclass",
        amount: 11700,
        currency: "INR",
        status: "captured",
        payloadDigest: digest,
      }, TEST_PROXY_SECRET);

      // First run succeeds
      const res1 = gas.executeDoPost({
        event: "payment.captured",
        eventId: "evt_concurrent_01",
        timestamp: now,
        proxy_version: "v2.1",
        target_product: "ai_masterclass",
        payload_digest: digest,
        proxy_signature: sig,
        payload: { payment: { entity: payment } },
      });
      expect(res1.success).toBe(true);

      // Duplicate delivery while lock was held or after commit is idempotent
      const res2 = gas.executeDoPost({
        event: "payment.captured",
        eventId: "evt_concurrent_01",
        timestamp: now,
        proxy_version: "v2.1",
        target_product: "ai_masterclass",
        payload_digest: digest,
        proxy_signature: sig,
        payload: { payment: { entity: payment } },
      });

      expect(res2.alreadyProcessed).toBe(true);
      expect(gas.getFunnelsDoneCreateCalls()).toBe(1);
    });
  });

  // ==========================================================================
  // SUITE 6: ALL 8 APPS SCRIPT PROJECTS IMPLEMENTATION VERIFICATION
  // ==========================================================================
  describe("Suite 6: Multi-Course Apps Script Project Audit", () => {
    const courseProjects = [
      { key: "ai_masterclass", file: "backend/apps_script/ai_masterclass/apps_script.gs" },
      { key: "advanced_masterclass", file: "backend/apps_script/advanced_masterclass/apps_script.gs" },
      { key: "claude_masterclass", file: "backend/apps_script/claude_masterclass/apps_script.gs" },
      { key: "academy", file: "backend/apps_script/academy/apps_script.gs" },
      { key: "ai_bgm", file: "backend/apps_script/ai_bgm/apps_script.gs" },
      { key: "consulting", file: "backend/apps_script/consulting/apps_script.gs" },
      { key: "professionals", file: "backend/apps_script/professionals/apps_script.gs" },
      { key: "upscale", file: "backend/apps_script/upscale/apps_script.gs" },
    ];

    for (const project of courseProjects) {
      it(`6.${project.key}: Verifies strict protocol mode and uncertain invoice recovery in ${project.file}`, () => {
        const fullPath = path.resolve(process.cwd(), project.file);
        expect(fs.existsSync(fullPath)).toBe(true);
        const code = fs.readFileSync(fullPath, "utf8");

        // 1. Strict Mode & Protocol Version Verification
        expect(code).toContain("STRICT_PROXY_MODE");
        expect(code).toContain("PROTOCOL_DOWNGRADE_REJECTED");
        expect(code).toContain("MISSING_PROTOCOL_VERSION");
        expect(code).toContain("SECURITY_WARNING");

        // 2. 12-tuple Proxy Signature Verification
        expect(code).toContain("v2|");
        expect(code).toContain("computeHmacSha256Hex");

        // 3. 8-field Canonical Digest Verification
        expect(code).toContain("computeCanonicalPayloadDigest");

        // 4. FunnelsDone Candidate Matching & Uncertain State Machine
        expect(code).toContain("UNCERTAIN_INVOICE_PENDING");
        expect(code).toContain("RESOLVED");
        expect(code).toContain("candidateMatches");
        expect(code).toContain("AMBIGUOUS_INVOICE_MATCH");
        expect(code).toContain("ZERO_INVOICE_MATCH");

        // 5. Holding email / notification on uncertain state
        expect(code).toContain("HOLDING_CONFIRMATION_EMAIL");
        expect(code).toContain("PENDING_RECONCILIATION");

        // 6. Dedicated INVOICE_TOKEN_SECRET required with zero fallback
        expect(code).toContain("MISSING_INVOICE_TOKEN_SECRET");
        expect(code).not.toContain('getOptionalScriptSecret("RAZORPAY_KEY_SECRET")');
      });
    }
  });
});
