import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "node:crypto";
import {
  computeCanonicalPayloadDigest,
  computeHardenedPayloadDigest,
  computeCanonicalProxySignature,
  computeHardenedProxySignature,
  determineAuthoritativeProductRoute,
  handleIncomingRazorpayWebhook,
  handleAdminReconciliationRequest,
  verifyRazorpayWebhookSignature,
} from "../../backend/webhook_proxy/razorpay_webhook_proxy.js";

const TEST_WEBHOOK_SECRET = "whsec_test_secret_hardening_123456789";
const TEST_PROXY_SECRET = "proxy_secret_high_entropy_v2_signing_abcdef987654321";
const TEST_ADMIN_SECRET = "adm_sec_super_secret_reconciliation_token_2026";
const LIVE_RAZORPAY_KEY_ID = "rzp_live_T2CbVONQc6qrqj";
const LIVE_RAZORPAY_KEY_SECRET = "live_rzp_secret_dummy_for_tests_123456";

/**
 * Creates an in-memory Google Apps Script simulator matching the Phase 1J production GAS implementation.
 */
function createPhase1JAppsScriptEnvironment(expectedProductKey: string) {
  const scriptProperties = new Map<string, string>();
  scriptProperties.set("WEBHOOK_PROXY_SECRET", TEST_PROXY_SECRET);
  scriptProperties.set("INVOICE_TOKEN_SECRET", "inv_token_secret_test_54321");
  scriptProperties.set("RAZORPAY_KEY_SECRET", LIVE_RAZORPAY_KEY_SECRET);

  let funnelsDoneInvoiceCounter = 1000;
  let funnelsDoneCreateCalls = 0;
  let funnelsDoneQueryCalls = 0;
  let whatsAppCalls = 0;
  let isLocked = false;

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
    simOptions: { simulateTimeout?: boolean } = {}
  ): string | null {
    const cleanPayId = String(paymentId || "").trim();

    // 0. Pre-check: If invoice request was already initiated and timed out / pending, avoid creating duplicate
    const invoiceState = scriptProperties.get("INVOICE_STATE_" + cleanPayId);
    if (invoiceState === "UNCERTAIN_INVOICE_PENDING" || invoiceState === "INVOICE_REQUEST_PENDING") {
      const cachedInv = scriptProperties.get("VERIFIED_INV_" + cleanPayId);
      if (cachedInv) {
        try {
          const parsed = JSON.parse(cachedInv);
          if (parsed?.invoiceNumber) return parsed.invoiceNumber;
        } catch (e) {}
      }

      // Query mock FunnelsDone invoices for this contact/paymentId
      funnelsDoneQueryCalls++;
      for (const inv of mockFunnelsDoneInvoices) {
        if (inv.description.includes(cleanPayId)) {
          const matchedNo = inv.invoiceNumberPrefix + inv.invoiceNumber;
          scriptProperties.set("INVOICE_STATE_" + cleanPayId, "RESOLVED");
          return matchedNo;
        }
      }
    }

    // Upsert Contact
    const contactId = "contact_" + cleanPayId;

    // Simulate lost response / timeout on FunnelsDone create
    if (simOptions.simulateTimeout) {
      funnelsDoneCreateCalls++;
      // FunnelsDone actually created it in the cloud:
      const invNo = String(++funnelsDoneInvoiceCounter);
      mockFunnelsDoneInvoices.push({
        id: "inv_" + invNo,
        invoiceNumber: invNo,
        invoiceNumberPrefix: "TT/26-27/",
        contactId,
        description: `SAC: 999293 | Razorpay Payment ID: ${cleanPayId}`,
      });
      // Network drops before GAS gets response:
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
        simulateSheetsFailure?: boolean;
        simulateInvoiceTimeout?: boolean;
      } = {}
    ) {
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
          const notes = paymentEntity.notes || {};
          const proxySignature = body.proxy_signature;
          const timestamp = body.timestamp;
          const eventId = body.eventId || body.event_id;
          const targetProduct = body.target_product;
          const payloadDigest = body.payload_digest;
          const proxyVersion = body.proxy_version;
          const eventType = body.event;

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
          const cleanEventType = String(eventType || paymentEntity.event || "payment.captured").trim();
          const cleanAmount = paymentEntity.amount !== undefined ? String(paymentEntity.amount).trim() : "";
          const cleanCurrency = paymentEntity.currency ? String(paymentEntity.currency).trim() : "INR";
          const cleanStatus = paymentEntity.status ? String(paymentEntity.status).trim() : "captured";
          const cleanAccountId = String(paymentEntity.account_id || paymentEntity.accountId || notes.account_id || "").trim();
          const isV2 = proxyVersion === "v2" || proxyVersion === "v2.1" || Boolean(payloadDigest && targetProduct);

          // 1. Destination binding: Target product must match this script's expected product
          if (isV2) {
            if (!cleanTargetProduct || cleanTargetProduct !== expectedProductKey) {
              throw new Error(`DESTINATION_MISMATCH: Webhook intended for '${cleanTargetProduct}' cannot be processed by '${expectedProductKey}'.`);
            }
          }

          // 2. Freshness check (5 min tolerance)
          const now = Date.now();
          if (!cleanTimestamp || Math.abs(now - cleanTimestamp) > 300000) {
            throw new Error("REPLAY_EXPIRED_TIMESTAMP: Webhook timestamp expired or outside tolerance window.");
          }

          // 3. Payload Integrity & Signature Verification
          if (isV2) {
            const digest8 = computeCanonicalPayloadDigestGas(paymentEntity);
            const digest5 = computeCanonicalPayloadDigestGas(paymentEntity, "5field");
            const digestValid = cleanPayloadDigest && (
              constantTimeEquals(digest8, cleanPayloadDigest) ||
              constantTimeEquals(digest5, cleanPayloadDigest)
            );
            if (!digestValid) {
              throw new Error("PAYLOAD_DIGEST_MISMATCH: Canonical payload digest does not match payment entity.");
            }

            // 12-tuple (Phase 1J hardened) vs 7-tuple (Phase 1I)
            const expectedSig12 = computeHmacSha256Hex(
              `v2|${cleanEventId}|${cleanEventType}|${cleanOrderId}|${cleanPaymentId}|${cleanTimestamp}|${cleanTargetProduct}|${cleanAmount}|${cleanCurrency}|${cleanStatus}|${cleanAccountId}|${cleanPayloadDigest}`,
              webhookProxySecret
            );
            const expectedSig7 = computeHmacSha256Hex(
              `v2|${cleanEventId}|${cleanOrderId}|${cleanPaymentId}|${cleanTimestamp}|${cleanTargetProduct}|${cleanPayloadDigest}`,
              webhookProxySecret
            );

            const cleanSig = String(proxySignature || "").trim().toLowerCase();
            const sigValid = constantTimeEquals(expectedSig12, cleanSig) || constantTimeEquals(expectedSig7, cleanSig);
            if (!proxySignature || !sigValid) {
              throw new Error("INVALID_WEBHOOK_SIGNATURE: Webhook proxy signature verification failed.");
            }
          }

          // 4. Duplicate Event & Integrity Conflict Detection
          if (cleanEventId) {
            const existingEvt = scriptProperties.get("PROCESSED_EVT_" + cleanEventId);
            if (existingEvt) {
              try {
                const parsed = JSON.parse(existingEvt);
                if (parsed && typeof parsed === "object") {
                  const storedDigest = String(parsed.payloadDigest || "").trim();
                  const storedPayId = String(parsed.paymentId || "").trim();
                  if (
                    (cleanPayloadDigest && storedDigest && storedDigest !== cleanPayloadDigest) ||
                    (cleanPaymentId && storedPayId && storedPayId !== cleanPaymentId)
                  ) {
                    throw new Error("EVENT_ID_INTEGRITY_CONFLICT: Reused event ID does not match original event payload digest or payment identifier.");
                  }
                }
              } catch (err: any) {
                if (err.message && err.message.includes("EVENT_ID_INTEGRITY_CONFLICT")) {
                  throw err;
                }
              }
              return { success: true, alreadyProcessed: true, duplicate: true, eventId: cleanEventId };
            }
          }

          // Check if payment already processed
          if (scriptProperties.has("PROCESSED_PAY_" + cleanPaymentId)) {
            const existingInv = scriptProperties.get("VERIFIED_INV_" + cleanPaymentId);
            return {
              success: true,
              alreadyProcessed: true,
              paymentId: cleanPaymentId,
              orderId: cleanOrderId,
              invoice: existingInv ? JSON.parse(existingInv) : null,
            };
          }

          // Find registration row
          let foundRowIndex = -1;
          for (let i = 1; i < rows.length; i++) {
            if (rows[i][8] === cleanOrderId) {
              foundRowIndex = i;
              break;
            }
          }

          if (foundRowIndex === -1) {
            throw new Error("ORDER_NOT_FOUND: Order ID not found in registration sheet.");
          }

          const expectedAmount = Number(rows[foundRowIndex][6]);
          const actualAmount = Number(paymentEntity.amount) / 100;
          if (Math.round(expectedAmount) !== Math.round(actualAmount)) {
            throw new Error(`AMOUNT_MISMATCH: Razorpay amount (₹${actualAmount}) does not match order amount (₹${expectedAmount}).`);
          }

          // Simulate sheets storage failure if requested
          if (options.simulateSheetsFailure) {
            throw new Error("SHEETS_WRITE_FAILURE: Google Sheets temporary outage.");
          }

          // Update Sheet
          rows[foundRowIndex][7] = "✅ PAID";
          rows[foundRowIndex][9] = cleanPaymentId;
          rows[foundRowIndex][10] = "SENT ✅";

          // Invoice Sync with FunnelsDone
          let invNumber = syncInvoiceWithFunnelsDoneSim(
            "Learner",
            email,
            "+919876543210",
            expectedProductKey,
            expectedAmount,
            cleanPaymentId,
            cleanOrderId,
            { simulateTimeout: options.simulateInvoiceTimeout }
          );

          if (!invNumber) {
            // Invoice creation was uncertain/timed out
            return {
              success: false,
              uncertainInvoice: true,
              status: "UNCERTAIN_INVOICE_PENDING",
              error: "FUNNELSDONE_TIMEOUT: Invoice creation pending reconciliation",
            };
          }

          const invRecord = {
            verified: true,
            paymentId: cleanPaymentId,
            orderId: cleanOrderId,
            invoiceNumber: invNumber,
            totalAmountPaid: expectedAmount,
          };
          scriptProperties.set("VERIFIED_INV_" + cleanPaymentId, JSON.stringify(invRecord));
          scriptProperties.set("PROCESSED_PAY_" + cleanPaymentId, new Date().toISOString());

          // WhatsApp Trigger
          whatsAppCalls++;

          // 5. Mark Event ID processed ONLY upon durable completion
          scriptProperties.set("PROCESSED_EVT_" + cleanEventId, JSON.stringify({
            timestamp: new Date().toISOString(),
            payloadDigest: cleanPayloadDigest,
            paymentId: cleanPaymentId,
            orderId: cleanOrderId,
          }));

          return {
            success: true,
            verified: true,
            paymentId: cleanPaymentId,
            orderId: cleanOrderId,
            invoiceNumber: invNumber,
            invoice: invRecord,
          };
        }

        return { success: false, error: "Unsupported event" };
      } finally {
        isLocked = false;
      }
    },
  };
}

describe("PHASE 1J: Payment Authorization and Invoice Recovery Hardening Audit", () => {
  const basePayment = {
    id: "pay_Hardened123456",
    order_id: "order_Hardened987654",
    amount: 11700,
    currency: "INR",
    status: "captured",
    method: "upi",
    email: "student@example.com",
    contact: "+919876543210",
    account_id: "acc_live_primary",
    notes: {
      product_key: "ai_masterclass",
      batch: "Saturday 6PM",
      source: "website",
    },
  };

  const baseEvent = {
    entity: "event",
    account_id: "acc_live_primary",
    event: "payment.captured",
    contains: ["payment"],
    payload: {
      payment: {
        entity: basePayment,
      },
    },
    created_at: 1776400000,
  };

  describe("1. Complete Signed Payload Hardening (12-Tuple Signature & 8-Field Digest)", () => {
    it("computes the 8-field payload digest binding all fulfillment-critical fields deterministically", () => {
      const digestA = computeHardenedPayloadDigest(basePayment);
      expect(digestA).toMatch(/^[0-9a-f]{64}$/);

      // Re-ordered notes object keys produce the identical deterministic digest
      const reorderedPayment = {
        ...basePayment,
        notes: {
          source: "website",
          product_key: "ai_masterclass",
          batch: "Saturday 6PM",
        },
      };
      const digestB = computeHardenedPayloadDigest(reorderedPayment);
      expect(digestA).toBe(digestB);
    });

    it("rejects tampering with any individual field of the 8-field canonical payload digest", () => {
      const originalDigest = computeHardenedPayloadDigest(basePayment);

      // Mutate method
      expect(computeHardenedPayloadDigest({ ...basePayment, method: "netbanking" })).not.toBe(originalDigest);

      // Mutate accountId
      expect(computeHardenedPayloadDigest({ ...basePayment, account_id: "acc_rogue" })).not.toBe(originalDigest);

      // Mutate a note value
      expect(
        computeHardenedPayloadDigest({
          ...basePayment,
          notes: { ...basePayment.notes, product_key: "claude_masterclass" },
        })
      ).not.toBe(originalDigest);

      // Add unexpected note key
      expect(
        computeHardenedPayloadDigest({
          ...basePayment,
          notes: { ...basePayment.notes, discount: "100" },
        })
      ).not.toBe(originalDigest);

      // Mutate amount, currency, status, email, contact
      expect(computeHardenedPayloadDigest({ ...basePayment, amount: 9900 })).not.toBe(originalDigest);
      expect(computeHardenedPayloadDigest({ ...basePayment, currency: "USD" })).not.toBe(originalDigest);
      expect(computeHardenedPayloadDigest({ ...basePayment, status: "authorized" })).not.toBe(originalDigest);
      expect(computeHardenedPayloadDigest({ ...basePayment, email: "other@example.com" })).not.toBe(originalDigest);
      expect(computeHardenedPayloadDigest({ ...basePayment, contact: "+911111111111" })).not.toBe(originalDigest);
    });

    it("binds all 12 parameters in computeHardenedProxySignature and detects individual tampering of each", () => {
      const now = Date.now();
      const payloadDigest = computeHardenedPayloadDigest(basePayment);

      const params = {
        eventId: "evt_123456",
        eventType: "payment.captured",
        orderId: basePayment.order_id,
        paymentId: basePayment.id,
        timestamp: now,
        productKey: "ai_masterclass",
        amount: basePayment.amount,
        currency: basePayment.currency,
        status: basePayment.status,
        accountId: basePayment.account_id,
        payloadDigest,
      };

      const validSig = computeHardenedProxySignature(params, TEST_PROXY_SECRET);
      expect(validSig).toMatch(/^[0-9a-f]{64}$/);

      // 1. Mutate eventId
      expect(computeHardenedProxySignature({ ...params, eventId: "evt_999999" }, TEST_PROXY_SECRET)).not.toBe(validSig);

      // 2. Mutate eventType
      expect(computeHardenedProxySignature({ ...params, eventType: "order.paid" }, TEST_PROXY_SECRET)).not.toBe(validSig);

      // 3. Mutate orderId
      expect(computeHardenedProxySignature({ ...params, orderId: "order_tampered" }, TEST_PROXY_SECRET)).not.toBe(validSig);

      // 4. Mutate paymentId
      expect(computeHardenedProxySignature({ ...params, paymentId: "pay_tampered" }, TEST_PROXY_SECRET)).not.toBe(validSig);

      // 5. Mutate timestamp
      expect(computeHardenedProxySignature({ ...params, timestamp: now + 1000 }, TEST_PROXY_SECRET)).not.toBe(validSig);

      // 6. Mutate productKey
      expect(computeHardenedProxySignature({ ...params, productKey: "academy" }, TEST_PROXY_SECRET)).not.toBe(validSig);

      // 7. Mutate amount
      expect(computeHardenedProxySignature({ ...params, amount: 58900 }, TEST_PROXY_SECRET)).not.toBe(validSig);

      // 8. Mutate currency
      expect(computeHardenedProxySignature({ ...params, currency: "EUR" }, TEST_PROXY_SECRET)).not.toBe(validSig);

      // 9. Mutate status
      expect(computeHardenedProxySignature({ ...params, status: "refunded" }, TEST_PROXY_SECRET)).not.toBe(validSig);

      // 10. Mutate accountId
      expect(computeHardenedProxySignature({ ...params, accountId: "acc_fraud" }, TEST_PROXY_SECRET)).not.toBe(validSig);

      // 11. Mutate payloadDigest
      expect(computeHardenedProxySignature({ ...params, payloadDigest: "a".repeat(64) }, TEST_PROXY_SECRET)).not.toBe(validSig);

      // 12. Mutate secret
      expect(computeHardenedProxySignature(params, "wrong_proxy_secret")).not.toBe(validSig);
    });

    it("provides backward compatibility for Phase 1I 7-tuple signatures and 5-field digests", () => {
      const gasEnv = createPhase1JAppsScriptEnvironment("ai_masterclass");
      gasEnv.initOrder(basePayment.order_id, 117);

      const now = Date.now();
      const digest5 = computeCanonicalPayloadDigest(basePayment, { fiveField: true });
      const sig7 = computeCanonicalProxySignature(
        {
          eventId: "evt_phase1i_compat",
          orderId: basePayment.order_id,
          paymentId: basePayment.id,
          timestamp: now,
          productKey: "ai_masterclass",
          payloadDigest: digest5,
        },
        TEST_PROXY_SECRET
      );

      const forwardBody = {
        event: "payment.captured",
        eventId: "evt_phase1i_compat",
        timestamp: now,
        proxy_version: "v2",
        target_product: "ai_masterclass",
        payload_digest: digest5,
        proxy_signature: sig7,
        payload: {
          payment: {
            entity: basePayment,
          },
        },
      };

      const result = gasEnv.executeDoPost(forwardBody);
      expect(result.success).toBe(true);
      expect(result.verified).toBe(true);
      expect(result.paymentId).toBe(basePayment.id);
    });

    it("accepts hardened 12-tuple signatures and 8-field digests seamlessly in Apps Script", () => {
      const gasEnv = createPhase1JAppsScriptEnvironment("ai_masterclass");
      gasEnv.initOrder(basePayment.order_id, 117);

      const now = Date.now();
      const digest8 = computeHardenedPayloadDigest(basePayment);
      const sig12 = computeHardenedProxySignature(
        {
          eventId: "evt_phase1j_hardened",
          eventType: "payment.captured",
          orderId: basePayment.order_id,
          paymentId: basePayment.id,
          timestamp: now,
          productKey: "ai_masterclass",
          amount: basePayment.amount,
          currency: basePayment.currency,
          status: basePayment.status,
          accountId: basePayment.account_id,
          payloadDigest: digest8,
        },
        TEST_PROXY_SECRET
      );

      const forwardBody = {
        event: "payment.captured",
        eventId: "evt_phase1j_hardened",
        timestamp: now,
        proxy_version: "v2.1",
        target_product: "ai_masterclass",
        payload_digest: digest8,
        proxy_signature: sig12,
        payload: {
          payment: {
            entity: basePayment,
          },
        },
      };

      const result = gasEnv.executeDoPost(forwardBody);
      expect(result.success).toBe(true);
      expect(result.verified).toBe(true);
      expect(result.invoiceNumber).toMatch(/^TT\/26-27\/\d+$/);
    });
  });

  describe("2. Harden Duplicate-Event Detection & Collision Defense", () => {
    it("returns duplicate response without re-executing fulfillment on exact redelivery of the same event", () => {
      const gasEnv = createPhase1JAppsScriptEnvironment("ai_masterclass");
      gasEnv.initOrder(basePayment.order_id, 117);

      const now = Date.now();
      const digest = computeHardenedPayloadDigest(basePayment);
      const sig = computeHardenedProxySignature(
        {
          eventId: "evt_exact_repeat",
          eventType: "payment.captured",
          orderId: basePayment.order_id,
          paymentId: basePayment.id,
          timestamp: now,
          productKey: "ai_masterclass",
          amount: basePayment.amount,
          currency: basePayment.currency,
          status: basePayment.status,
          accountId: basePayment.account_id,
          payloadDigest: digest,
        },
        TEST_PROXY_SECRET
      );

      const forwardBody = {
        event: "payment.captured",
        eventId: "evt_exact_repeat",
        timestamp: now,
        proxy_version: "v2.1",
        target_product: "ai_masterclass",
        payload_digest: digest,
        proxy_signature: sig,
        payload: {
          payment: {
            entity: basePayment,
          },
        },
      };

      // First run: processes completely
      const firstRes = gasEnv.executeDoPost(forwardBody);
      expect(firstRes.success).toBe(true);
      expect(firstRes.verified).toBe(true);
      expect(gasEnv.getFunnelsDoneCreateCalls()).toBe(1);
      expect(gasEnv.getWhatsAppCalls()).toBe(1);

      // Second run: exact duplicate
      const secondRes = gasEnv.executeDoPost(forwardBody);
      expect(secondRes.success).toBe(true);
      expect(secondRes.alreadyProcessed).toBe(true);
      expect(secondRes.duplicate).toBe(true);
      expect(secondRes.eventId).toBe("evt_exact_repeat");

      // Verify no duplicate invoice creation or duplicate notifications occurred
      expect(gasEnv.getFunnelsDoneCreateCalls()).toBe(1);
      expect(gasEnv.getWhatsAppCalls()).toBe(1);
    });

    it("fails closed with EVENT_ID_INTEGRITY_CONFLICT when an eventId is reused with a different payload digest", () => {
      const gasEnv = createPhase1JAppsScriptEnvironment("ai_masterclass");
      gasEnv.initOrder(basePayment.order_id, 117);

      const now = Date.now();
      const originalDigest = computeHardenedPayloadDigest(basePayment);
      const originalSig = computeHardenedProxySignature(
        {
          eventId: "evt_reused_attack",
          eventType: "payment.captured",
          orderId: basePayment.order_id,
          paymentId: basePayment.id,
          timestamp: now,
          productKey: "ai_masterclass",
          amount: basePayment.amount,
          currency: basePayment.currency,
          status: basePayment.status,
          accountId: basePayment.account_id,
          payloadDigest: originalDigest,
        },
        TEST_PROXY_SECRET
      );

      // Legitimate first delivery
      gasEnv.executeDoPost({
        event: "payment.captured",
        eventId: "evt_reused_attack",
        timestamp: now,
        proxy_version: "v2.1",
        target_product: "ai_masterclass",
        payload_digest: originalDigest,
        proxy_signature: originalSig,
        payload: { payment: { entity: basePayment } },
      });

      // Attack: Replaying the same event ID but with altered payment entity (e.g. modified notes/email)
      const tamperedPayment = {
        ...basePayment,
        email: "attacker@fraud.com",
      };
      const tamperedDigest = computeHardenedPayloadDigest(tamperedPayment);
      const tamperedSig = computeHardenedProxySignature(
        {
          eventId: "evt_reused_attack",
          eventType: "payment.captured",
          orderId: basePayment.order_id,
          paymentId: basePayment.id,
          timestamp: now,
          productKey: "ai_masterclass",
          amount: basePayment.amount,
          currency: basePayment.currency,
          status: basePayment.status,
          accountId: basePayment.account_id,
          payloadDigest: tamperedDigest,
        },
        TEST_PROXY_SECRET
      );

      expect(() => {
        gasEnv.executeDoPost({
          event: "payment.captured",
          eventId: "evt_reused_attack",
          timestamp: now,
          proxy_version: "v2.1",
          target_product: "ai_masterclass",
          payload_digest: tamperedDigest,
          proxy_signature: tamperedSig,
          payload: { payment: { entity: tamperedPayment } },
        });
      }).toThrow(/EVENT_ID_INTEGRITY_CONFLICT/);
    });

    it("fails closed with EVENT_ID_INTEGRITY_CONFLICT when an eventId is reused with a different paymentId", () => {
      const gasEnv = createPhase1JAppsScriptEnvironment("ai_masterclass");
      gasEnv.initOrder(basePayment.order_id, 117);

      const now = Date.now();
      const originalDigest = computeHardenedPayloadDigest(basePayment);
      const originalSig = computeHardenedProxySignature(
        {
          eventId: "evt_diff_payid",
          eventType: "payment.captured",
          orderId: basePayment.order_id,
          paymentId: basePayment.id,
          timestamp: now,
          productKey: "ai_masterclass",
          amount: basePayment.amount,
          currency: basePayment.currency,
          status: basePayment.status,
          accountId: basePayment.account_id,
          payloadDigest: originalDigest,
        },
        TEST_PROXY_SECRET
      );

      // Legitimate first delivery
      gasEnv.executeDoPost({
        event: "payment.captured",
        eventId: "evt_diff_payid",
        timestamp: now,
        proxy_version: "v2.1",
        target_product: "ai_masterclass",
        payload_digest: originalDigest,
        proxy_signature: originalSig,
        payload: { payment: { entity: basePayment } },
      });

      // Attack: Same event ID, different payment ID
      const secondPayment = {
        ...basePayment,
        id: "pay_Different999999",
      };
      const secondDigest = computeHardenedPayloadDigest(secondPayment);
      const secondSig = computeHardenedProxySignature(
        {
          eventId: "evt_diff_payid",
          eventType: "payment.captured",
          orderId: basePayment.order_id,
          paymentId: secondPayment.id,
          timestamp: now,
          productKey: "ai_masterclass",
          amount: secondPayment.amount,
          currency: secondPayment.currency,
          status: secondPayment.status,
          accountId: secondPayment.account_id,
          payloadDigest: secondDigest,
        },
        TEST_PROXY_SECRET
      );

      expect(() => {
        gasEnv.executeDoPost({
          event: "payment.captured",
          eventId: "evt_diff_payid",
          timestamp: now,
          proxy_version: "v2.1",
          target_product: "ai_masterclass",
          payload_digest: secondDigest,
          proxy_signature: secondSig,
          payload: { payment: { entity: secondPayment } },
        });
      }).toThrow(/EVENT_ID_INTEGRITY_CONFLICT/);
    });

    it("does not mark eventId as processed if execution fails prior to durable completion, allowing safe retry", () => {
      const gasEnv = createPhase1JAppsScriptEnvironment("ai_masterclass");
      gasEnv.initOrder(basePayment.order_id, 117);

      const now = Date.now();
      const digest = computeHardenedPayloadDigest(basePayment);
      const sig = computeHardenedProxySignature(
        {
          eventId: "evt_fail_then_retry",
          eventType: "payment.captured",
          orderId: basePayment.order_id,
          paymentId: basePayment.id,
          timestamp: now,
          productKey: "ai_masterclass",
          amount: basePayment.amount,
          currency: basePayment.currency,
          status: basePayment.status,
          accountId: basePayment.account_id,
          payloadDigest: digest,
        },
        TEST_PROXY_SECRET
      );

      const forwardBody = {
        event: "payment.captured",
        eventId: "evt_fail_then_retry",
        timestamp: now,
        proxy_version: "v2.1",
        target_product: "ai_masterclass",
        payload_digest: digest,
        proxy_signature: sig,
        payload: { payment: { entity: basePayment } },
      };

      // First run: Google Sheets failure triggers exception
      expect(() => {
        gasEnv.executeDoPost(forwardBody, { simulateSheetsFailure: true });
      }).toThrow(/SHEETS_WRITE_FAILURE/);

      // Verify PROCESSED_EVT_ was NOT written
      expect(gasEnv.scriptProperties.has("PROCESSED_EVT_evt_fail_then_retry")).toBe(false);

      // Retry run: Normal execution succeeds cleanly
      const retryRes = gasEnv.executeDoPost(forwardBody);
      expect(retryRes.success).toBe(true);
      expect(retryRes.verified).toBe(true);
      expect(gasEnv.scriptProperties.has("PROCESSED_EVT_evt_fail_then_retry")).toBe(true);
    });
  });

  describe("3. Uncertain Invoice-Creation Outcome & Recovery Lifecycle", () => {
    it("handles the lost-response scenario: identifies UNCERTAIN_INVOICE_PENDING and recovers existing invoice on retry without duplicate creation", () => {
      const gasEnv = createPhase1JAppsScriptEnvironment("ai_masterclass");
      gasEnv.initOrder(basePayment.order_id, 117);

      const now = Date.now();
      const digest = computeHardenedPayloadDigest(basePayment);
      const sig = computeHardenedProxySignature(
        {
          eventId: "evt_lost_response",
          eventType: "payment.captured",
          orderId: basePayment.order_id,
          paymentId: basePayment.id,
          timestamp: now,
          productKey: "ai_masterclass",
          amount: basePayment.amount,
          currency: basePayment.currency,
          status: basePayment.status,
          accountId: basePayment.account_id,
          payloadDigest: digest,
        },
        TEST_PROXY_SECRET
      );

      const forwardBody = {
        event: "payment.captured",
        eventId: "evt_lost_response",
        timestamp: now,
        proxy_version: "v2.1",
        target_product: "ai_masterclass",
        payload_digest: digest,
        proxy_signature: sig,
        payload: { payment: { entity: basePayment } },
      };

      // 1. Initial attempt: FunnelsDone creates the invoice, but HTTP connection drops / times out
      const attempt1 = gasEnv.executeDoPost(forwardBody, { simulateInvoiceTimeout: true });
      expect(attempt1.success).toBe(false);
      expect(attempt1.uncertainInvoice).toBe(true);
      expect(gasEnv.scriptProperties.get("INVOICE_STATE_" + basePayment.id)).toBe("UNCERTAIN_INVOICE_PENDING");
      expect(gasEnv.getFunnelsDoneCreateCalls()).toBe(1);

      // Exactly 1 invoice was created in FunnelsDone cloud:
      expect(gasEnv.mockFunnelsDoneInvoices.length).toBe(1);
      const originalInvoiceNo = gasEnv.mockFunnelsDoneInvoices[0].invoiceNumberPrefix + gasEnv.mockFunnelsDoneInvoices[0].invoiceNumber;

      // 2. Retry attempt: Apps Script detects UNCERTAIN_INVOICE_PENDING, queries FunnelsDone, finds matching invoice, avoids duplicate creation
      const attempt2 = gasEnv.executeDoPost(forwardBody);
      expect(attempt2.success).toBe(true);
      expect(attempt2.verified).toBe(true);
      expect(attempt2.invoiceNumber).toBe(originalInvoiceNo);

      // Verify that NO new invoice was created on FunnelsDone! (Calls remains 1)
      expect(gasEnv.getFunnelsDoneCreateCalls()).toBe(1);
      // Verify query lookup was used
      expect(gasEnv.getFunnelsDoneQueryCalls()).toBe(1);
      // Verify state was marked RESOLVED
      expect(gasEnv.scriptProperties.get("INVOICE_STATE_" + basePayment.id)).toBe("RESOLVED");
    });

    it("immediately returns cached invoice from VERIFIED_INV_ if already resolved, bypassing external network calls entirely", () => {
      const gasEnv = createPhase1JAppsScriptEnvironment("ai_masterclass");
      gasEnv.initOrder(basePayment.order_id, 117);

      const now = Date.now();
      const digest = computeHardenedPayloadDigest(basePayment);
      const sig = computeHardenedProxySignature(
        {
          eventId: "evt_cached_inv",
          eventType: "payment.captured",
          orderId: basePayment.order_id,
          paymentId: basePayment.id,
          timestamp: now,
          productKey: "ai_masterclass",
          amount: basePayment.amount,
          currency: basePayment.currency,
          status: basePayment.status,
          accountId: basePayment.account_id,
          payloadDigest: digest,
        },
        TEST_PROXY_SECRET
      );

      const forwardBody = {
        event: "payment.captured",
        eventId: "evt_cached_inv",
        timestamp: now,
        proxy_version: "v2.1",
        target_product: "ai_masterclass",
        payload_digest: digest,
        proxy_signature: sig,
        payload: { payment: { entity: basePayment } },
      };

      // Pre-seed verified invoice in script properties
      gasEnv.scriptProperties.set(
        "VERIFIED_INV_" + basePayment.id,
        JSON.stringify({
          verified: true,
          paymentId: basePayment.id,
          orderId: basePayment.order_id,
          invoiceNumber: "TT/26-27/PRE_EXISTING_INV",
          totalAmountPaid: 117,
        })
      );
      gasEnv.scriptProperties.set("PROCESSED_PAY_" + basePayment.id, new Date().toISOString());

      const res = gasEnv.executeDoPost(forwardBody);
      expect(res.success).toBe(true);
      expect(res.alreadyProcessed).toBe(true);
      expect(res.invoice?.invoiceNumber).toBe("TT/26-27/PRE_EXISTING_INV");
      expect(gasEnv.getFunnelsDoneCreateCalls()).toBe(0);
    });
  });

  describe("4. End-to-End Processing Order & Security Gate", () => {
    it("enforces strict execution sequence: rejects forged signature before touching sheet, payment records, or external APIs", () => {
      const gasEnv = createPhase1JAppsScriptEnvironment("ai_masterclass");
      gasEnv.initOrder(basePayment.order_id, 117);

      const now = Date.now();
      const digest = computeHardenedPayloadDigest(basePayment);

      const forgedBody = {
        event: "payment.captured",
        eventId: "evt_forged_sig",
        timestamp: now,
        proxy_version: "v2.1",
        target_product: "ai_masterclass",
        payload_digest: digest,
        proxy_signature: "bad_signature_0000000000000000000000000000000000000000000000000000000000",
        payload: { payment: { entity: basePayment } },
      };

      expect(() => {
        gasEnv.executeDoPost(forgedBody);
      }).toThrow(/INVALID_WEBHOOK_SIGNATURE/);

      // Verify sheet row was NOT modified to PAID
      expect(gasEnv.rows[1][7]).toBe("INITIATED");
      // Verify payment was NOT recorded
      expect(gasEnv.scriptProperties.has("PROCESSED_PAY_" + basePayment.id)).toBe(false);
      // Verify no invoices created
      expect(gasEnv.getFunnelsDoneCreateCalls()).toBe(0);
      // Verify no notifications sent
      expect(gasEnv.getWhatsAppCalls()).toBe(0);
    });

    it("verifies timestamp freshness window and rejects expired replays before database access", () => {
      const gasEnv = createPhase1JAppsScriptEnvironment("ai_masterclass");
      gasEnv.initOrder(basePayment.order_id, 117);

      const expiredTimestamp = Date.now() - 360000; // 6 minutes ago (> 5 min tolerance)
      const digest = computeHardenedPayloadDigest(basePayment);
      const sig = computeHardenedProxySignature(
        {
          eventId: "evt_expired_replay",
          eventType: "payment.captured",
          orderId: basePayment.order_id,
          paymentId: basePayment.id,
          timestamp: expiredTimestamp,
          productKey: "ai_masterclass",
          amount: basePayment.amount,
          currency: basePayment.currency,
          status: basePayment.status,
          accountId: basePayment.account_id,
          payloadDigest: digest,
        },
        TEST_PROXY_SECRET
      );

      expect(() => {
        gasEnv.executeDoPost({
          event: "payment.captured",
          eventId: "evt_expired_replay",
          timestamp: expiredTimestamp,
          proxy_version: "v2.1",
          target_product: "ai_masterclass",
          payload_digest: digest,
          proxy_signature: sig,
          payload: { payment: { entity: basePayment } },
        });
      }).toThrow(/REPLAY_EXPIRED_TIMESTAMP/);

      expect(gasEnv.rows[1][7]).toBe("INITIATED");
    });
  });
});
