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

const TEST_WEBHOOK_SECRET = "whsec_test_secret_downgrade_prevention_123456789";
const TEST_PROXY_SECRET = "proxy_secret_high_entropy_v2_signing_abcdef987654321";
const LIVE_RAZORPAY_KEY_ID = "rzp_live_T2CbVONQc6qrqj";
const LIVE_RAZORPAY_KEY_SECRET = "live_rzp_secret_dummy_for_tests_123456";

/**
 * Creates an in-memory Google Apps Script simulator matching the Phase 1L production GAS implementation.
 */
function createPhase1LAppsScriptEnvironment(expectedProductKey: string, initialProps: Record<string, string> = {}) {
  const scriptProperties = new Map<string, string>();
  scriptProperties.set("WEBHOOK_PROXY_SECRET", TEST_PROXY_SECRET);
  scriptProperties.set("INVOICE_TOKEN_SECRET", "inv_token_secret_test_54321");
  scriptProperties.set("RAZORPAY_KEY_SECRET", LIVE_RAZORPAY_KEY_SECRET);
  // Default: ENVIRONMENT unset or production, meaning unconditional production verification
  for (const [k, v] of Object.entries(initialProps)) {
    scriptProperties.set(k, v);
  }

  let funnelsDoneInvoiceCounter = 1000;
  let funnelsDoneCreateCalls = 0;
  let funnelsDoneQueryCalls = 0;
  let whatsAppCalls = 0;
  let emailCalls = 0;
  const securityWarnings: string[] = [];
  const securityRejects: string[] = [];
  const logEntries: Array<{ event: string; data: string }> = [];

  const mockFunnelsDoneInvoices: Array<{
    _id?: string;
    id?: string;
    invoiceNumber?: string;
    invoiceNumberPrefix?: string;
    contactId?: string;
    name?: string;
    title?: string;
    currency?: string;
    total?: number;
    amount?: number;
    status?: string;
    items?: Array<{ name: string; description: string; amount: number }>;
  }> = [];

  const rows: any[][] = [
    ["Timestamp", "Name", "Email", "Phone", "Profession", "Language", "Amount", "Status", "Order ID", "Payment ID", "Email Status"]
  ];

  const getOptionalScriptSecret = (key: string) => scriptProperties.get(key) || "";
  const getScriptSecret = (key: string) => {
    const val = scriptProperties.get(key);
    if (!val) throw new Error("MISSING_SECRET: " + key);
    return val;
  };

  const writeToLogs = (event: string, data: string) => {
    logEntries.push({ event, data });
    if (event === "SECURITY_WARNING") securityWarnings.push(data);
    if (event === "SECURITY_REJECT") securityRejects.push(data);
  };

  const constantTimeEquals = (a: string, b: string) => {
    if (typeof a !== "string" || typeof b !== "string") return false;
    if (a.length !== b.length) return false;
    try {
      return crypto.timingSafeEqual(Buffer.from(a, "utf8"), Buffer.from(b, "utf8"));
    } catch {
      return false;
    }
  };

  const computeHmacSha256Hex = (data: string, key: string) => {
    return crypto.createHmac("sha256", key).update(data, "utf8").digest("hex");
  };

  const appsScriptCanonicalDigest = (entity: any, format?: string) => {
    if (!entity || typeof entity !== "object") return "";
    if (format === "5field" || format === "v1" || format === "legacy") {
      return computeCanonicalPayloadDigest(entity, { legacy: true });
    }
    return computeHardenedPayloadDigest(entity);
  };

  /**
   * Simulates the Phase 1L syncInvoiceWithFunnelsDone with authoritative field validation
   */
  const syncInvoiceWithFunnelsDone = (
    name: string,
    email: string,
    phone: string,
    courseName: string,
    totalAmount: number,
    paymentId: string,
    orderId: string,
    options: { simulateNetworkTimeout?: boolean; simulateSheetsFailure?: boolean } = {}
  ): string | null => {
    const cleanPayId = String(paymentId || "").trim();
    const contactId = "contact_" + (email || "unknown").replace(/[^a-zA-Z0-9]/g, "_");

    // 0. Check pre-cached verified invoice
    const preCachedInv = scriptProperties.get("VERIFIED_INV_" + cleanPayId);
    if (preCachedInv) {
      writeToLogs("INVOICE_PRECACHED", "Using pre-cached invoice " + preCachedInv + " for payment " + cleanPayId);
      return preCachedInv;
    }

    // 1b. Check if an invoice for this contact and paymentId already exists on FunnelsDone
    const currentInvState = cleanPayId ? scriptProperties.get("INVOICE_STATE_" + cleanPayId) : "";
    if (cleanPayId && (currentInvState === "UNCERTAIN_INVOICE_PENDING" || currentInvState === "INVOICE_REQUEST_PENDING")) {
      funnelsDoneQueryCalls++;
      if (options.simulateNetworkTimeout) {
        writeToLogs("INVOICE_LOOKUP_WARN", "Network timeout querying FunnelsDone invoices");
        scriptProperties.set("INVOICE_STATE_" + cleanPayId, "UNCERTAIN_INVOICE_PENDING");
        return null;
      }

      const candidateMatches: any[] = [];
      for (let k = 0; k < mockFunnelsDoneInvoices.length; k++) {
        const inv = mockFunnelsDoneInvoices[k];
        if (!inv || typeof inv !== "object") continue;

        // 1. Authoritative Reference Check: Invoice ID and Invoice Number
        const invId = String(inv._id || inv.id || "").trim();
        const invNum = String(inv.invoiceNumber || "").trim();
        if (!invId || !invNum) {
          writeToLogs("INVOICE_VALIDATION_SKIP", "Candidate invoice missing authoritative ID or invoiceNumber");
          continue;
        }

        // 2. Customer Identity Check: contactId must match if present
        const invContactId = String(inv.contactId || "").trim();
        if (invContactId && invContactId !== String(contactId).trim()) {
          writeToLogs("INVOICE_VALIDATION_SKIP", "Contact ID mismatch on invoice " + invId + ": received '" + invContactId + "', expected '" + contactId + "'");
          continue;
        }

        // 3. Stable Razorpay Payment Reference Check
        const invDump = JSON.stringify(inv);
        const payRefRegex = new RegExp("(?:Payment ID:\\s*|Ref:\\s*|paymentId[\"':\\s]+|\\b)" + cleanPayId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b");
        if (!payRefRegex.test(invDump)) {
          continue;
        }

        // 4. Expected Product / Course Name Check
        const invProductName = String(inv.name || inv.title || (inv.items && inv.items[0] && inv.items[0].name) || "").toLowerCase();
        if (expectedProductKey === "claude_masterclass" && !invProductName.includes("claude")) {
          writeToLogs("INVOICE_VALIDATION_SKIP", "Course mismatch on invoice " + invId + " for claude_masterclass: " + invProductName);
          continue;
        }
        if (expectedProductKey === "ai_bgm" && !invProductName.includes("bgm") && !invProductName.includes("growth")) {
          writeToLogs("INVOICE_VALIDATION_SKIP", "Course mismatch on invoice " + invId + " for ai_bgm: " + invProductName);
          continue;
        }
        if (expectedProductKey === "academy" && !invProductName.includes("academy")) {
          writeToLogs("INVOICE_VALIDATION_SKIP", "Course mismatch on invoice " + invId + " for academy: " + invProductName);
          continue;
        }
        if (expectedProductKey === "consulting" && !invProductName.includes("consult")) {
          writeToLogs("INVOICE_VALIDATION_SKIP", "Course mismatch on invoice " + invId + " for consulting: " + invProductName);
          continue;
        }
        if (expectedProductKey === "professionals" && !invProductName.includes("professional")) {
          writeToLogs("INVOICE_VALIDATION_SKIP", "Course mismatch on invoice " + invId + " for professionals: " + invProductName);
          continue;
        }
        if (expectedProductKey === "upscale" && !invProductName.includes("upscale")) {
          writeToLogs("INVOICE_VALIDATION_SKIP", "Course mismatch on invoice " + invId + " for upscale: " + invProductName);
          continue;
        }
        if (expectedProductKey === "ai_masterclass" && (invProductName.includes("claude") || invProductName.includes("bgm") || invProductName.includes("academy") || invProductName.includes("consulting") || invProductName.includes("professionals") || invProductName.includes("upscale"))) {
          writeToLogs("INVOICE_VALIDATION_SKIP", "Course conflict on invoice " + invId + " for ai_masterclass: " + invProductName);
          continue;
        }

        // 5. Amount and Currency Check
        if (inv.currency && String(inv.currency).trim().toUpperCase() !== "INR") {
          writeToLogs("INVOICE_VALIDATION_SKIP", "Currency mismatch on invoice " + invId + ": " + inv.currency + " expected INR");
          continue;
        }
        const invAmount = inv.total !== undefined ? Number(inv.total) : (inv.amount !== undefined ? Number(inv.amount) : null);
        if (invAmount !== null && !isNaN(invAmount) && totalAmount) {
          const expectedAmt = Number(totalAmount);
          if (Math.abs(invAmount - expectedAmt) > 1.0) {
            writeToLogs("INVOICE_VALIDATION_SKIP", "Amount mismatch on invoice " + invId + ": " + invAmount + " expected " + expectedAmt);
            continue;
          }
        }

        // 6. Status check: Void or cancelled invoices cannot be recovered
        const invStatus = String(inv.status || "").toLowerCase();
        if (invStatus === "void" || invStatus === "cancelled" || invStatus === "deleted") {
          writeToLogs("INVOICE_VALIDATION_SKIP", "Invoice " + invId + " has void/cancelled status: " + invStatus);
          continue;
        }

        candidateMatches.push(inv);
      }

      if (candidateMatches.length === 1) {
        const singleInv = candidateMatches[0];
        const matchedNo = singleInv.invoiceNumberPrefix ? (singleInv.invoiceNumberPrefix + singleInv.invoiceNumber) : ("TT/26-27/" + singleInv.invoiceNumber);
        writeToLogs("INVOICE_RECOVERED", "Found exactly one verified invoice " + matchedNo + " for payment " + cleanPayId);
        scriptProperties.set("INVOICE_STATE_" + cleanPayId, "RESOLVED");
        scriptProperties.set("VERIFIED_INV_" + cleanPayId, matchedNo);
        return matchedNo;
      } else if (candidateMatches.length > 1) {
        writeToLogs("AMBIGUOUS_INVOICE_MATCH", "Found " + candidateMatches.length + " candidate invoices for payment " + cleanPayId + ". Retaining uncertain state.");
        scriptProperties.set("INVOICE_STATE_" + cleanPayId, "UNCERTAIN_INVOICE_PENDING");
        return null;
      } else {
        writeToLogs("ZERO_INVOICE_MATCH", "Zero matching invoices found for payment " + cleanPayId + ". Retaining uncertain state.");
        scriptProperties.set("INVOICE_STATE_" + cleanPayId, "UNCERTAIN_INVOICE_PENDING");
        return null;
      }
    }

    // 2. Mark pending request state before calling external creation endpoint
    if (cleanPayId) {
      scriptProperties.set("INVOICE_STATE_" + cleanPayId, "INVOICE_REQUEST_PENDING");
    }

    if (options.simulateNetworkTimeout) {
      writeToLogs("FUNNELSDONE_INV_TIMEOUT", "Simulated timeout during invoice creation");
      if (cleanPayId) {
        scriptProperties.set("INVOICE_STATE_" + cleanPayId, "UNCERTAIN_INVOICE_PENDING");
      }
      return null;
    }

    // 3. Create Draft Invoice on FunnelsDone
    funnelsDoneCreateCalls++;
    funnelsDoneInvoiceCounter++;
    const nextInvoiceNumber = String(funnelsDoneInvoiceCounter);
    const invoiceId = "inv_" + nextInvoiceNumber;
    const invNo = "TT/26-27/" + nextInvoiceNumber;

    mockFunnelsDoneInvoices.push({
      _id: invoiceId,
      id: invoiceId,
      invoiceNumber: nextInvoiceNumber,
      invoiceNumberPrefix: "TT/26-27/",
      contactId: contactId,
      name: courseName || "AI-Secret Revealed",
      currency: "INR",
      total: totalAmount,
      amount: totalAmount,
      status: "paid",
      items: [
        {
          name: courseName || "AI-Secret Revealed",
          description: "SAC Code: 999293 - Online Training Program | Ref: " + cleanPayId,
          amount: totalAmount
        }
      ]
    });

    if (cleanPayId) {
      scriptProperties.set("INVOICE_STATE_" + cleanPayId, "RESOLVED");
      scriptProperties.set("VERIFIED_INV_" + cleanPayId, invNo);
    }
    return invNo;
  };

  /**
   * Simulates the Phase 1L handleIncomingProxyWebhook verifier
   */
  const handleIncomingProxyWebhook = (data: any) => {
    const webhookProxySecret = getScriptSecret("WEBHOOK_PROXY_SECRET");
    const {
      event_id: eventId,
      event: eventType,
      order_id: orderId,
      payment_id: paymentId,
      timestamp,
      target_product: targetProduct,
      payload_digest: payloadDigest,
      proxy_signature: proxySignature,
      proxy_version: proxyVersion,
      payment: paymentEntity,
    } = data || {};

    const cleanOrderId = String(orderId || "").trim();
    const cleanPaymentId = String(paymentId || "").trim();
    const cleanEventId = String(eventId || "").trim();
    const cleanTimestamp = Number(timestamp) || 0;
    const cleanTargetProduct = String(targetProduct || "").trim().toLowerCase();
    const cleanPayloadDigest = String(payloadDigest || "").trim().toLowerCase();
    const cleanEventType = String(eventType || (paymentEntity && paymentEntity.event) || "payment.captured").trim();
    const cleanAmount = paymentEntity && paymentEntity.amount !== undefined ? String(paymentEntity.amount).trim() : "";
    const cleanCurrency = paymentEntity && paymentEntity.currency ? String(paymentEntity.currency).trim() : "INR";
    const cleanStatus = paymentEntity && paymentEntity.status ? String(paymentEntity.status).trim() : "captured";
    const cleanAccountId = paymentEntity ? String(paymentEntity.account_id || paymentEntity.accountId || (paymentEntity.notes && paymentEntity.notes.account_id) || "").trim() : "";
    const cleanProxyVersion = String(proxyVersion || "").trim();

    // Production Rejection Gate:
    // Production environment unconditionally mandates proxy_version === "v2.1", 12-tuple HMAC, and 8-field digest.
    // Weaker legacy signatures can NEVER be accepted in production, regardless of STRICT_PROXY_MODE or ALLOW_LEGACY_PROXY_SIGNATURE.
    const env = String(getOptionalScriptSecret("ENVIRONMENT") || getOptionalScriptSecret("APP_ENV") || "production").trim().toLowerCase();
    const isExplicitNonProd = (env === "development" || env === "local_test");
    const allowLegacyDev = isExplicitNonProd && getOptionalScriptSecret("ALLOW_LEGACY_PROXY_SIGNATURE") === "true";

    // 1. Destination binding
    const isV2 = (cleanProxyVersion === "v2.1" || cleanProxyVersion === "v2" || Boolean(cleanPayloadDigest && cleanTargetProduct));
    if (isV2 || !allowLegacyDev) {
      if (!cleanTargetProduct || cleanTargetProduct !== expectedProductKey) {
        writeToLogs("SECURITY_REJECT", "Target product mismatch: received '" + cleanTargetProduct + "', expected '" + expectedProductKey + "'");
        throw new Error("DESTINATION_MISMATCH: Webhook intended for '" + cleanTargetProduct + "' cannot be processed by '" + expectedProductKey + "'.");
      }
    }

    // 2. Replay prevention: timestamp freshness
    const now = Date.now();
    if (!cleanTimestamp || Math.abs(now - cleanTimestamp) > 300000) {
      writeToLogs("SECURITY_REJECT", "Expired webhook timestamp: " + cleanTimestamp);
      throw new Error("REPLAY_EXPIRED_TIMESTAMP: Webhook timestamp expired or outside tolerance window.");
    }

    // 3. Signature & Digest Verification
    const cleanSig = String(proxySignature || "").trim().toLowerCase();
    if (!allowLegacyDev) {
      // Unconditional Production Verifier
      if (!cleanProxyVersion) {
        writeToLogs("SECURITY_REJECT", "Missing protocol version in production verifier for event: " + cleanEventId);
        throw new Error("MISSING_PROTOCOL_VERSION: Production requires proxy_version 'v2.1'.");
      }
      if (cleanProxyVersion !== "v2.1") {
        writeToLogs("SECURITY_REJECT", "Protocol downgrade attempt rejected in production: '" + cleanProxyVersion + "' for event: " + cleanEventId);
        throw new Error("PROTOCOL_DOWNGRADE_REJECTED: Production only permits 'v2.1'. Received '" + cleanProxyVersion + "'.");
      }

      const digest8 = appsScriptCanonicalDigest(paymentEntity);
      if (!cleanPayloadDigest || !constantTimeEquals(digest8, cleanPayloadDigest)) {
        writeToLogs("SECURITY_REJECT", "Payload digest mismatch for event: " + cleanEventId);
        throw new Error("PAYLOAD_DIGEST_MISMATCH: Canonical payload digest does not match payment entity.");
      }

      const expectedSig12 = computeHmacSha256Hex(
        "v2|" + cleanEventId + "|" + cleanEventType + "|" + cleanOrderId + "|" + cleanPaymentId + "|" + cleanTimestamp + "|" + cleanTargetProduct + "|" + cleanAmount + "|" + cleanCurrency + "|" + cleanStatus + "|" + cleanAccountId + "|" + cleanPayloadDigest,
        webhookProxySecret
      );
      if (!proxySignature || !constantTimeEquals(expectedSig12, cleanSig)) {
        writeToLogs("SECURITY_REJECT", "Invalid v2.1 12-tuple webhook proxy signature for event: " + cleanEventId);
        throw new Error("INVALID_WEBHOOK_SIGNATURE: Webhook proxy signature verification failed.");
      }
    } else {
      // Isolated non-production development mode ONLY
      writeToLogs("SECURITY_WARNING", "Processing webhook under non-production development mode.");
      if (cleanProxyVersion === "v2.1") {
        const digest8 = appsScriptCanonicalDigest(paymentEntity);
        if (!cleanPayloadDigest || !constantTimeEquals(digest8, cleanPayloadDigest)) {
          writeToLogs("SECURITY_REJECT", "Payload digest mismatch for event: " + cleanEventId);
          throw new Error("PAYLOAD_DIGEST_MISMATCH: Canonical payload digest does not match payment entity.");
        }

        const expectedSig12 = computeHmacSha256Hex(
          "v2|" + cleanEventId + "|" + cleanEventType + "|" + cleanOrderId + "|" + cleanPaymentId + "|" + cleanTimestamp + "|" + cleanTargetProduct + "|" + cleanAmount + "|" + cleanCurrency + "|" + cleanStatus + "|" + cleanAccountId + "|" + cleanPayloadDigest,
          webhookProxySecret
        );
        if (!proxySignature || !constantTimeEquals(expectedSig12, cleanSig)) {
          writeToLogs("SECURITY_REJECT", "Invalid v2.1 12-tuple webhook proxy signature for event: " + cleanEventId);
          throw new Error("INVALID_WEBHOOK_SIGNATURE: Webhook proxy signature verification failed.");
        }
      } else if (isV2) {
        writeToLogs("SECURITY_WARNING", "Legacy v2 signature accepted in non-production development mode for event: " + cleanEventId);
        const digest8 = appsScriptCanonicalDigest(paymentEntity);
        const digest5 = appsScriptCanonicalDigest(paymentEntity, "5field");
        const digestValid = cleanPayloadDigest && (
          constantTimeEquals(digest8, cleanPayloadDigest) ||
          constantTimeEquals(digest5, cleanPayloadDigest)
        );
        if (!digestValid) {
          writeToLogs("SECURITY_REJECT", "Payload digest mismatch for event: " + cleanEventId);
          throw new Error("PAYLOAD_DIGEST_MISMATCH: Canonical payload digest does not match payment entity.");
        }

        const expectedSig12 = computeHmacSha256Hex(
          "v2|" + cleanEventId + "|" + cleanEventType + "|" + cleanOrderId + "|" + cleanPaymentId + "|" + cleanTimestamp + "|" + cleanTargetProduct + "|" + cleanAmount + "|" + cleanCurrency + "|" + cleanStatus + "|" + cleanAccountId + "|" + cleanPayloadDigest,
          webhookProxySecret
        );
        const expectedSig7 = computeHmacSha256Hex(
          "v2|" + cleanEventId + "|" + cleanOrderId + "|" + cleanPaymentId + "|" + cleanTimestamp + "|" + cleanTargetProduct + "|" + cleanPayloadDigest,
          webhookProxySecret
        );
        const sigValid = constantTimeEquals(expectedSig12, cleanSig) || constantTimeEquals(expectedSig7, cleanSig);
        if (!proxySignature || !sigValid) {
          writeToLogs("SECURITY_REJECT", "Invalid v2 webhook proxy signature for event: " + cleanEventId);
          throw new Error("INVALID_WEBHOOK_SIGNATURE: Webhook proxy signature verification failed.");
        }
      } else {
        writeToLogs("SECURITY_WARNING", "Legacy v1 signature accepted in non-production development mode for event: " + cleanEventId);
        const expectedProxySig = computeHmacSha256Hex(
          cleanEventId + "|" + cleanOrderId + "|" + cleanPaymentId + "|" + cleanTimestamp,
          webhookProxySecret
        );
        if (!proxySignature || !constantTimeEquals(expectedProxySig, cleanSig)) {
          writeToLogs("SECURITY_REJECT", "Invalid v1 webhook proxy signature for event: " + cleanEventId);
          throw new Error("INVALID_WEBHOOK_SIGNATURE: Webhook proxy signature verification failed.");
        }
      }
    }

    // 4. Replay prevention & Event Integrity check
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
              writeToLogs("SECURITY_ALERT", "Event ID integrity conflict detected for event: " + cleanEventId);
              throw new Error("EVENT_ID_INTEGRITY_CONFLICT: Reused event ID does not match original event payload digest or payment identifier.");
            }
          }
        } catch (err: any) {
          if (err.message && err.message.indexOf("EVENT_ID_INTEGRITY_CONFLICT") !== -1) {
            throw err;
          }
        }
        return { success: true, alreadyProcessed: true, duplicate: true, eventId: cleanEventId };
      }
    }

    // 5. Registration & Invoice generation
    const email = paymentEntity && paymentEntity.email ? String(paymentEntity.email).trim() : "customer@example.com";
    const name = paymentEntity && paymentEntity.notes && paymentEntity.notes.name ? String(paymentEntity.notes.name).trim() : "Learner";
    const phone = paymentEntity && paymentEntity.contact ? String(paymentEntity.contact).trim() : "";
    const amountNum = Number(cleanAmount) / 100 || 117;

    const fdInvoiceNo = syncInvoiceWithFunnelsDone(name, email, phone, "AI Secrets Revealed Masterclass", amountNum, cleanPaymentId, cleanOrderId);

    if (!fdInvoiceNo) {
      const invState = scriptProperties.get("INVOICE_STATE_" + cleanPaymentId);
      if (invState === "UNCERTAIN_INVOICE_PENDING" || invState === "INVOICE_REQUEST_PENDING") {
        writeToLogs("HOLDING_CONFIRMATION_EMAIL", "Invoice outcome uncertain for payment " + cleanPaymentId + ". Holding customer confirmation.");
        rows.push([new Date().toISOString(), name, email, phone, "Student", "English", amountNum, "PENDING_RECONCILIATION", cleanOrderId, cleanPaymentId, "WAITING_INVOICE"]);
        return {
          success: false,
          uncertainInvoice: true,
          status: "UNCERTAIN_INVOICE_PENDING",
          paymentId: cleanPaymentId,
          orderId: cleanOrderId,
          error: "UNCERTAIN_INVOICE_PENDING: Invoice outcome is uncertain. Held for reconciliation."
        };
      }
    }

    // Payment captured & invoice verified
    scriptProperties.set("PROCESSED_PAY_" + cleanPaymentId, fdInvoiceNo || "PAID");
    rows.push([new Date().toISOString(), name, email, phone, "Student", "English", amountNum, "PAID", cleanOrderId, cleanPaymentId, "SENT"]);
    emailCalls++;
    whatsAppCalls++;

    // Mark event processed ONLY after successful execution without uncertain invoice
    if (cleanEventId) {
      scriptProperties.set("PROCESSED_EVT_" + cleanEventId, JSON.stringify({
        timestamp: new Date().toISOString(),
        payloadDigest: cleanPayloadDigest,
        paymentId: cleanPaymentId,
        orderId: cleanOrderId
      }));
    }

    return { success: true, invoiceNumber: fdInvoiceNo, paymentId: cleanPaymentId, orderId: cleanOrderId };
  };

  return {
    scriptProperties,
    mockFunnelsDoneInvoices,
    rows,
    securityWarnings,
    securityRejects,
    logEntries,
    getInvoiceCount: () => mockFunnelsDoneInvoices.length,
    getFunnelsDoneCreateCalls: () => funnelsDoneCreateCalls,
    getFunnelsDoneQueryCalls: () => funnelsDoneQueryCalls,
    getEmailCalls: () => emailCalls,
    getWhatsAppCalls: () => whatsAppCalls,
    handleIncomingProxyWebhook,
    syncInvoiceWithFunnelsDone,
    appsScriptCanonicalDigest,
  };
}

describe("PHASE 1L: Production Downgrade Prevention and Invoice Match Validation Suite", () => {
  const productKey = "ai_masterclass";
  const now = Date.now();

  const standardPaymentEntity = {
    id: "pay_1L_test_999888",
    amount: 11700,
    currency: "INR",
    status: "captured",
    order_id: "order_1L_test_111222",
    email: "learner.phase1L@example.com",
    contact: "+919876543210",
    notes: { name: "Phase 1L Student" },
    created_at: 1740000000,
  };

  const canonicalDigest = computeHardenedPayloadDigest(standardPaymentEntity);

  const createValid12TupleSignedWebhook = (overrides: Record<string, any> = {}) => {
    const payment = {
      ...standardPaymentEntity,
      ...(overrides.payment || {}),
      id: overrides.payment_id || overrides.paymentId || (overrides.payment && overrides.payment.id) || standardPaymentEntity.id,
      order_id: overrides.order_id || overrides.orderId || (overrides.payment && overrides.payment.order_id) || standardPaymentEntity.order_id,
    };
    const digest = overrides.payload_digest || overrides.payloadDigest || computeHardenedPayloadDigest(payment);
    const base = {
      eventId: overrides.event_id || overrides.eventId || "evt_1L_valid_001",
      eventType: overrides.event || overrides.eventType || "payment.captured",
      orderId: payment.order_id,
      paymentId: payment.id,
      timestamp: overrides.timestamp || now,
      productKey: overrides.target_product || overrides.productKey || productKey,
      amount: overrides.amount !== undefined ? overrides.amount : payment.amount,
      currency: overrides.currency || payment.currency || "INR",
      status: overrides.status || payment.status || "captured",
      accountId: overrides.accountId || "",
      payloadDigest: digest,
    };
    const sig = overrides.proxy_signature || computeHardenedProxySignature(base, TEST_PROXY_SECRET);
    return {
      event_id: base.eventId,
      event: base.eventType,
      order_id: base.orderId,
      payment_id: base.paymentId,
      timestamp: base.timestamp,
      target_product: base.productKey,
      payload_digest: base.payloadDigest,
      proxy_signature: sig,
      proxy_version: overrides.proxy_version !== undefined ? overrides.proxy_version : "v2.1",
      payment: payment,
      ...overrides,
    };
  };

  describe("Suite 1: Production Downgrade Prevention & Strict Rejection", () => {
    it("1.1: Production verifier unconditionally rejects missing proxy_version", () => {
      const gas = createPhase1LAppsScriptEnvironment(productKey, { ENVIRONMENT: "production" });
      const webhook = createValid12TupleSignedWebhook();
      delete (webhook as any).proxy_version;

      expect(() => gas.handleIncomingProxyWebhook(webhook)).toThrow(/MISSING_PROTOCOL_VERSION/);
      expect(gas.securityRejects).toContain("Missing protocol version in production verifier for event: " + webhook.event_id);
    });

    it("1.2: Production verifier unconditionally rejects protocol downgrade to 'v2'", () => {
      const gas = createPhase1LAppsScriptEnvironment(productKey, { ENVIRONMENT: "production" });
      const webhook = createValid12TupleSignedWebhook({ proxy_version: "v2" });

      expect(() => gas.handleIncomingProxyWebhook(webhook)).toThrow(/PROTOCOL_DOWNGRADE_REJECTED/);
      expect(gas.securityRejects).toContain("Protocol downgrade attempt rejected in production: 'v2' for event: " + webhook.event_id);
    });

    it("1.3: Production verifier unconditionally rejects protocol downgrade to 'v1'", () => {
      const gas = createPhase1LAppsScriptEnvironment(productKey, { ENVIRONMENT: "production" });
      const webhook = createValid12TupleSignedWebhook({ proxy_version: "v1" });

      expect(() => gas.handleIncomingProxyWebhook(webhook)).toThrow(/PROTOCOL_DOWNGRADE_REJECTED/);
    });

    it("1.4: Confirming misconfigured STRICT_PROXY_MODE='false' CANNOT weaken production verification", () => {
      // Even if an administrator accidentally adds STRICT_PROXY_MODE="false" or ALLOW_LEGACY_PROXY_SIGNATURE="true" in production!
      const gas = createPhase1LAppsScriptEnvironment(productKey, {
        ENVIRONMENT: "production",
        STRICT_PROXY_MODE: "false",
        ALLOW_LEGACY_PROXY_SIGNATURE: "true"
      });

      // Downgrade attempt with legacy v2 version must STILL be rejected unconditionally in production!
      const webhook = createValid12TupleSignedWebhook({ proxy_version: "v2" });
      expect(() => gas.handleIncomingProxyWebhook(webhook)).toThrow(/PROTOCOL_DOWNGRADE_REJECTED/);
    });

    it("1.5: Production verifier unconditionally rejects 7-tuple signature even if proxy_version is set to v2.1", () => {
      const gas = createPhase1LAppsScriptEnvironment(productKey, { ENVIRONMENT: "production" });
      // Generate 7-tuple signature: v2|eventId|orderId|paymentId|timestamp|productKey|payloadDigest
      const message7 = `v2|${standardPaymentEntity.order_id}|${standardPaymentEntity.id}|${now}|${productKey}|${canonicalDigest}`;
      const sig7 = crypto.createHmac("sha256", TEST_PROXY_SECRET).update(message7, "utf8").digest("hex");

      const webhook = {
        event_id: "evt_1L_sig7_001",
        event: "payment.captured",
        order_id: standardPaymentEntity.order_id,
        payment_id: standardPaymentEntity.id,
        timestamp: now,
        target_product: productKey,
        payload_digest: canonicalDigest,
        proxy_signature: sig7,
        proxy_version: "v2.1",
        payment: standardPaymentEntity,
      };

      expect(() => gas.handleIncomingProxyWebhook(webhook)).toThrow(/INVALID_WEBHOOK_SIGNATURE/);
    });

    it("1.6: Production verifier unconditionally rejects 5-field digest downgrade attempt", () => {
      const gas = createPhase1LAppsScriptEnvironment(productKey, { ENVIRONMENT: "production" });
      const digest5 = gas.appsScriptCanonicalDigest(standardPaymentEntity, "5field");

      const webhook = createValid12TupleSignedWebhook({ payload_digest: digest5 });
      expect(() => gas.handleIncomingProxyWebhook(webhook)).toThrow(/PAYLOAD_DIGEST_MISMATCH/);
    });

    it("1.7: Isolated non-production development mode permits legacy v2 with SECURITY_WARNING only when ENVIRONMENT='development'", () => {
      const gas = createPhase1LAppsScriptEnvironment(productKey, {
        ENVIRONMENT: "development",
        ALLOW_LEGACY_PROXY_SIGNATURE: "true"
      });

      // Valid 7-tuple signature under development mode
      const eventId = "evt_1L_dev_001";
      const message7 = `v2|${eventId}|${standardPaymentEntity.order_id}|${standardPaymentEntity.id}|${now}|${productKey}|${canonicalDigest}`;
      const sig7 = crypto.createHmac("sha256", TEST_PROXY_SECRET).update(message7, "utf8").digest("hex");

      const webhook = {
        event_id: eventId,
        event: "payment.captured",
        order_id: standardPaymentEntity.order_id,
        payment_id: standardPaymentEntity.id,
        timestamp: now,
        target_product: productKey,
        payload_digest: canonicalDigest,
        proxy_signature: sig7,
        proxy_version: "v2",
        payment: standardPaymentEntity,
      };

      const result = gas.handleIncomingProxyWebhook(webhook);
      expect(result.success).toBe(true);
      expect(gas.securityWarnings.length).toBeGreaterThan(0);
      expect(gas.securityWarnings.some(w => /non-production development mode/i.test(w))).toBe(true);
    });
  });

  describe("Suite 2: Authoritative Invoice Recovery Validation Scenarios", () => {
    it("2.1: Rejects matching payment ID in an unrelated customer's invoice (Contact ID mismatch)", () => {
      const gas = createPhase1LAppsScriptEnvironment(productKey);
      const paymentId = "pay_1L_unrelated_001";
      gas.scriptProperties.set("INVOICE_STATE_" + paymentId, "UNCERTAIN_INVOICE_PENDING");

      // Inject candidate invoice belonging to a completely different contact
      gas.mockFunnelsDoneInvoices.push({
        _id: "inv_diff_contact_101",
        invoiceNumber: "101",
        invoiceNumberPrefix: "TT/26-27/",
        contactId: "contact_different_user_999",
        name: "AI Secrets Revealed Masterclass",
        currency: "INR",
        total: 117,
        amount: 117,
        status: "paid",
        items: [
          {
            name: "AI Secrets Revealed Masterclass",
            description: "Some unrelated invoice that mentions Payment ID: " + paymentId,
            amount: 117
          }
        ]
      });

      const recovered = gas.syncInvoiceWithFunnelsDone("Alice", "alice@example.com", "9999999999", "AI Secrets Revealed Masterclass", 117, paymentId, "order_101");
      expect(recovered).toBeNull();
      expect(gas.scriptProperties.get("INVOICE_STATE_" + paymentId)).toBe("UNCERTAIN_INVOICE_PENDING");
      expect(gas.logEntries.some(l => l.event === "INVOICE_VALIDATION_SKIP" && l.data.includes("Contact ID mismatch"))).toBe(true);
      expect(gas.logEntries.some(l => l.event === "ZERO_INVOICE_MATCH")).toBe(true);
      expect(gas.getFunnelsDoneCreateCalls()).toBe(0); // Zero duplicates created!
    });

    it("2.2: Rejects matching payment ID appearing in invoices for different products (Course mismatch)", () => {
      const gas = createPhase1LAppsScriptEnvironment(productKey);
      const paymentId = "pay_1L_product_mismatch_002";
      const email = "bob@example.com";
      const contactId = "contact_" + email.replace(/[^a-zA-Z0-9]/g, "_");
      gas.scriptProperties.set("INVOICE_STATE_" + paymentId, "UNCERTAIN_INVOICE_PENDING");

      // Candidate invoice has same contact, same payment ID, but product is Claude Masterclass
      gas.mockFunnelsDoneInvoices.push({
        _id: "inv_claude_102",
        invoiceNumber: "102",
        invoiceNumberPrefix: "TT/26-27/",
        contactId: contactId,
        name: "Claude MasterClass 2026",
        currency: "INR",
        total: 117,
        amount: 117,
        status: "paid",
        items: [
          {
            name: "Claude MasterClass 2026",
            description: "Ref: " + paymentId,
            amount: 117
          }
        ]
      });

      const recovered = gas.syncInvoiceWithFunnelsDone("Bob", email, "9999999998", "AI Secrets Revealed Masterclass", 117, paymentId, "order_102");
      expect(recovered).toBeNull();
      expect(gas.scriptProperties.get("INVOICE_STATE_" + paymentId)).toBe("UNCERTAIN_INVOICE_PENDING");
      expect(gas.logEntries.some(l => l.event === "INVOICE_VALIDATION_SKIP" && l.data.includes("Course conflict"))).toBe(true);
      expect(gas.getFunnelsDoneCreateCalls()).toBe(0);
    });

    it("2.3: Rejects correct payment ID but incorrect amount or currency", () => {
      const gas = createPhase1LAppsScriptEnvironment(productKey);
      const paymentId = "pay_1L_amt_mismatch_003";
      const email = "carol@example.com";
      const contactId = "contact_" + email.replace(/[^a-zA-Z0-9]/g, "_");
      gas.scriptProperties.set("INVOICE_STATE_" + paymentId, "UNCERTAIN_INVOICE_PENDING");

      // Candidate has wrong currency (USD) and wrong amount (5000)
      gas.mockFunnelsDoneInvoices.push({
        _id: "inv_usd_103",
        invoiceNumber: "103",
        invoiceNumberPrefix: "TT/26-27/",
        contactId: contactId,
        name: "AI Secrets Revealed Masterclass",
        currency: "USD",
        total: 5000,
        amount: 5000,
        status: "paid",
        items: [
          {
            name: "AI Secrets Revealed Masterclass",
            description: "Ref: " + paymentId,
            amount: 5000
          }
        ]
      });

      const recovered = gas.syncInvoiceWithFunnelsDone("Carol", email, "9999999997", "AI Secrets Revealed Masterclass", 117, paymentId, "order_103");
      expect(recovered).toBeNull();
      expect(gas.scriptProperties.get("INVOICE_STATE_" + paymentId)).toBe("UNCERTAIN_INVOICE_PENDING");
      expect(gas.logEntries.some(l => l.event === "INVOICE_VALIDATION_SKIP" && l.data.includes("Currency mismatch"))).toBe(true);
      expect(gas.getFunnelsDoneCreateCalls()).toBe(0);
    });

    it("2.4: Rejects correct customer with wrong payment ID", () => {
      const gas = createPhase1LAppsScriptEnvironment(productKey);
      const targetPaymentId = "pay_1L_target_004";
      const email = "dave@example.com";
      const contactId = "contact_" + email.replace(/[^a-zA-Z0-9]/g, "_");
      gas.scriptProperties.set("INVOICE_STATE_" + targetPaymentId, "UNCERTAIN_INVOICE_PENDING");

      // Candidate belongs to Dave, but references pay_1L_other_999
      gas.mockFunnelsDoneInvoices.push({
        _id: "inv_dave_104",
        invoiceNumber: "104",
        invoiceNumberPrefix: "TT/26-27/",
        contactId: contactId,
        name: "AI Secrets Revealed Masterclass",
        currency: "INR",
        total: 117,
        amount: 117,
        status: "paid",
        items: [
          {
            name: "AI Secrets Revealed Masterclass",
            description: "Ref: pay_1L_other_999",
            amount: 117
          }
        ]
      });

      const recovered = gas.syncInvoiceWithFunnelsDone("Dave", email, "9999999996", "AI Secrets Revealed Masterclass", 117, targetPaymentId, "order_104");
      expect(recovered).toBeNull();
      expect(gas.scriptProperties.get("INVOICE_STATE_" + targetPaymentId)).toBe("UNCERTAIN_INVOICE_PENDING");
      expect(gas.logEntries.some(l => l.event === "ZERO_INVOICE_MATCH")).toBe(true);
      expect(gas.getFunnelsDoneCreateCalls()).toBe(0);
    });

    it("2.5: Rejects ambiguous multiple candidate invoices and retains uncertain state", () => {
      const gas = createPhase1LAppsScriptEnvironment(productKey);
      const paymentId = "pay_1L_multi_005";
      const email = "eve@example.com";
      const contactId = "contact_" + email.replace(/[^a-zA-Z0-9]/g, "_");
      gas.scriptProperties.set("INVOICE_STATE_" + paymentId, "UNCERTAIN_INVOICE_PENDING");

      // Add two matching invoices for the same payment
      gas.mockFunnelsDoneInvoices.push({
        _id: "inv_eve_105A",
        invoiceNumber: "105A",
        invoiceNumberPrefix: "TT/26-27/",
        contactId: contactId,
        name: "AI Secrets Revealed Masterclass",
        currency: "INR",
        total: 117,
        amount: 117,
        status: "paid",
        items: [{ name: "AI Secrets Revealed Masterclass", description: "Ref: " + paymentId, amount: 117 }]
      });
      gas.mockFunnelsDoneInvoices.push({
        _id: "inv_eve_105B",
        invoiceNumber: "105B",
        invoiceNumberPrefix: "TT/26-27/",
        contactId: contactId,
        name: "AI Secrets Revealed Masterclass",
        currency: "INR",
        total: 117,
        amount: 117,
        status: "paid",
        items: [{ name: "AI Secrets Revealed Masterclass", description: "Ref: " + paymentId, amount: 117 }]
      });

      const recovered = gas.syncInvoiceWithFunnelsDone("Eve", email, "9999999995", "AI Secrets Revealed Masterclass", 117, paymentId, "order_105");
      expect(recovered).toBeNull();
      expect(gas.scriptProperties.get("INVOICE_STATE_" + paymentId)).toBe("UNCERTAIN_INVOICE_PENDING");
      expect(gas.logEntries.some(l => l.event === "AMBIGUOUS_INVOICE_MATCH")).toBe(true);
      expect(gas.getFunnelsDoneCreateCalls()).toBe(0);
    });

    it("2.6: Rejects candidate invoice with missing authoritative reference fields (_id or invoiceNumber)", () => {
      const gas = createPhase1LAppsScriptEnvironment(productKey);
      const paymentId = "pay_1L_missing_ref_006";
      const email = "frank@example.com";
      const contactId = "contact_" + email.replace(/[^a-zA-Z0-9]/g, "_");
      gas.scriptProperties.set("INVOICE_STATE_" + paymentId, "UNCERTAIN_INVOICE_PENDING");

      // Candidate has matching description but missing invoiceNumber
      gas.mockFunnelsDoneInvoices.push({
        _id: "inv_frank_106",
        contactId: contactId,
        name: "AI Secrets Revealed Masterclass",
        currency: "INR",
        total: 117,
        items: [{ name: "AI Secrets Revealed Masterclass", description: "Ref: " + paymentId, amount: 117 }]
      });

      const recovered = gas.syncInvoiceWithFunnelsDone("Frank", email, "9999999994", "AI Secrets Revealed Masterclass", 117, paymentId, "order_106");
      expect(recovered).toBeNull();
      expect(gas.scriptProperties.get("INVOICE_STATE_" + paymentId)).toBe("UNCERTAIN_INVOICE_PENDING");
      expect(gas.logEntries.some(l => l.event === "INVOICE_VALIDATION_SKIP" && l.data.includes("missing authoritative ID or invoiceNumber"))).toBe(true);
      expect(gas.getFunnelsDoneCreateCalls()).toBe(0);
    });

    it("2.7: API timeout during invoice lookup retains uncertain state and never creates duplicate", () => {
      const gas = createPhase1LAppsScriptEnvironment(productKey);
      const paymentId = "pay_1L_timeout_007";
      const email = "grace@example.com";
      gas.scriptProperties.set("INVOICE_STATE_" + paymentId, "UNCERTAIN_INVOICE_PENDING");

      const recovered = gas.syncInvoiceWithFunnelsDone(
        "Grace",
        email,
        "9999999993",
        "AI Secrets Revealed Masterclass",
        117,
        paymentId,
        "order_107",
        { simulateNetworkTimeout: true }
      );

      expect(recovered).toBeNull();
      expect(gas.scriptProperties.get("INVOICE_STATE_" + paymentId)).toBe("UNCERTAIN_INVOICE_PENDING");
      expect(gas.logEntries.some(l => l.event === "INVOICE_LOOKUP_WARN")).toBe(true);
      expect(gas.getFunnelsDoneCreateCalls()).toBe(0);
    });

    it("2.8: Exactly 1 valid candidate invoice recovers successfully and transitions state to RESOLVED", () => {
      const gas = createPhase1LAppsScriptEnvironment(productKey);
      const paymentId = "pay_1L_valid_recovery_008";
      const email = "harry@example.com";
      const contactId = "contact_" + email.replace(/[^a-zA-Z0-9]/g, "_");
      gas.scriptProperties.set("INVOICE_STATE_" + paymentId, "UNCERTAIN_INVOICE_PENDING");

      gas.mockFunnelsDoneInvoices.push({
        _id: "inv_harry_108",
        invoiceNumber: "108",
        invoiceNumberPrefix: "TT/26-27/",
        contactId: contactId,
        name: "AI Secrets Revealed Masterclass",
        currency: "INR",
        total: 117,
        amount: 117,
        status: "paid",
        items: [{ name: "AI Secrets Revealed Masterclass", description: "Ref: " + paymentId, amount: 117 }]
      });

      const recovered = gas.syncInvoiceWithFunnelsDone("Harry", email, "9999999992", "AI Secrets Revealed Masterclass", 117, paymentId, "order_108");
      expect(recovered).toBe("TT/26-27/108");
      expect(gas.scriptProperties.get("INVOICE_STATE_" + paymentId)).toBe("RESOLVED");
      expect(gas.scriptProperties.get("VERIFIED_INV_" + paymentId)).toBe("TT/26-27/108");
      expect(gas.logEntries.some(l => l.event === "INVOICE_RECOVERED")).toBe(true);
      expect(gas.getFunnelsDoneCreateCalls()).toBe(0);
    });

    it("2.9: Pre-cached verified invoice (VERIFIED_INV_) protects recovery if Sheets write previously failed", () => {
      const gas = createPhase1LAppsScriptEnvironment(productKey);
      const paymentId = "pay_1L_precached_009";
      gas.scriptProperties.set("INVOICE_STATE_" + paymentId, "RESOLVED");
      gas.scriptProperties.set("VERIFIED_INV_" + paymentId, "TT/26-27/999");

      const recovered = gas.syncInvoiceWithFunnelsDone("Ian", "ian@example.com", "9999999991", "AI Secrets Revealed Masterclass", 117, paymentId, "order_109");
      expect(recovered).toBe("TT/26-27/999");
      expect(gas.getFunnelsDoneQueryCalls()).toBe(0); // Zero network calls needed!
      expect(gas.getFunnelsDoneCreateCalls()).toBe(0);
    });

    it("2.10: Repeated webhook delivery after successful recovery returns idempotent duplicate response", () => {
      const gas = createPhase1LAppsScriptEnvironment(productKey);
      const webhook = createValid12TupleSignedWebhook({
        payment_id: "pay_1L_idempotent_010",
        order_id: "order_1L_idempotent_010",
        event_id: "evt_1L_idempotent_010"
      });

      // First run: succeeds and creates invoice TT/26-27/1001
      const res1 = gas.handleIncomingProxyWebhook(webhook);
      expect(res1.success).toBe(true);
      expect(res1.invoiceNumber).toBe("TT/26-27/1001");
      expect(gas.getFunnelsDoneCreateCalls()).toBe(1);

      // Second run: exactly identical webhook delivered
      const res2 = gas.handleIncomingProxyWebhook(webhook);
      expect(res2.success).toBe(true);
      expect(res2.alreadyProcessed).toBe(true);
      expect(res2.duplicate).toBe(true);
      expect(gas.getFunnelsDoneCreateCalls()).toBe(1); // Never creates a second invoice!
    });
  });

  describe("Suite 3: Payment State Transitions & Notification Isolation", () => {
    it("3.1: Uncertain invoice creation suppresses speculative customer email and marks PENDING_RECONCILIATION", () => {
      const gas = createPhase1LAppsScriptEnvironment(productKey);
      const webhook = createValid12TupleSignedWebhook({
        payment_id: "pay_1L_state_001",
        order_id: "order_1L_state_001",
        event_id: "evt_1L_state_001"
      });

      // Pre-flag payment as UNCERTAIN_INVOICE_PENDING
      gas.scriptProperties.set("INVOICE_STATE_pay_1L_state_001", "UNCERTAIN_INVOICE_PENDING");

      // Execution with zero matching invoices on FunnelsDone
      const result = gas.handleIncomingProxyWebhook(webhook);
      expect(result.success).toBe(false);
      expect(result.uncertainInvoice).toBe(true);
      expect(result.status).toBe("UNCERTAIN_INVOICE_PENDING");

      // Customer notifications MUST be suppressed
      expect(gas.getEmailCalls()).toBe(0);
      expect(gas.getWhatsAppCalls()).toBe(0);
      expect(gas.logEntries.some(l => l.event === "HOLDING_CONFIRMATION_EMAIL")).toBe(true);

      // Sheet registration must be flagged PENDING_RECONCILIATION
      const lastRow = gas.rows[gas.rows.length - 1];
      expect(lastRow[7]).toBe("PENDING_RECONCILIATION");
      expect(lastRow[10]).toBe("WAITING_INVOICE");

      // PROCESSED_EVT_ must NOT be written so that recovery/retries can proceed
      expect(gas.scriptProperties.has("PROCESSED_EVT_evt_1L_state_001")).toBe(false);
    });

    it("3.2: Subsequent retry after resolving invoice completes registration and sends notifications", () => {
      const gas = createPhase1LAppsScriptEnvironment(productKey);
      const webhook = createValid12TupleSignedWebhook({
        payment_id: "pay_1L_recovery_flow_002",
        order_id: "order_1L_recovery_flow_002",
        event_id: "evt_1L_recovery_flow_002"
      });

      // Simulate provider created invoice, but first GAS execution timed out
      const contactId = "contact_" + standardPaymentEntity.email.replace(/[^a-zA-Z0-9]/g, "_");
      gas.scriptProperties.set("INVOICE_STATE_pay_1L_recovery_flow_002", "UNCERTAIN_INVOICE_PENDING");
      gas.mockFunnelsDoneInvoices.push({
        _id: "inv_recovered_flow_202",
        invoiceNumber: "202",
        invoiceNumberPrefix: "TT/26-27/",
        contactId: contactId,
        name: "AI Secrets Revealed Masterclass",
        currency: "INR",
        total: 117,
        amount: 117,
        status: "paid",
        items: [{ name: "AI Secrets Revealed Masterclass", description: "Ref: pay_1L_recovery_flow_002", amount: 117 }]
      });

      // Retry webhook execution
      const result = gas.handleIncomingProxyWebhook(webhook);
      expect(result.success).toBe(true);
      expect(result.invoiceNumber).toBe("TT/26-27/202");
      expect(gas.getEmailCalls()).toBe(1);
      expect(gas.getWhatsAppCalls()).toBe(1);

      // Sheet row must be PAID
      const lastRow = gas.rows[gas.rows.length - 1];
      expect(lastRow[7]).toBe("PAID");
      expect(lastRow[10]).toBe("SENT");

      // PROCESSED_EVT_ now safely set
      expect(gas.scriptProperties.has("PROCESSED_EVT_evt_1L_recovery_flow_002")).toBe(true);
    });
  });

  describe("Suite 4: Multi-Course Apps Script Static Project Audit", () => {
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
      it(`4.${project.key}: Verifies unconditional production verifier and authoritative candidate validation in ${project.file}`, () => {
        const fullPath = path.resolve(process.cwd(), project.file);
        expect(fs.existsSync(fullPath)).toBe(true);
        const code = fs.readFileSync(fullPath, "utf8");

        // 1. Unconditional Production Downgrade Prevention Gate
        expect(code).toContain('getOptionalScriptSecret("ENVIRONMENT")');
        expect(code).toContain("isExplicitNonProd");
        expect(code).toContain("allowLegacyDev");
        expect(code).toContain("MISSING_PROTOCOL_VERSION");
        expect(code).toContain("PROTOCOL_DOWNGRADE_REJECTED");

        // 2. 12-tuple Proxy Signature & 8-field Digest
        expect(code).toContain("v2|");
        expect(code).toContain("computeHmacSha256Hex");
        expect(code).toContain("computeCanonicalPayloadDigest");

        // 3. Authoritative Candidate Matching Checks
        expect(code).toContain("INVOICE_VALIDATION_SKIP");
        expect(code).toContain("payRefRegex");
        expect(code).toContain("candidateMatches.length === 1");
        expect(code).toContain("AMBIGUOUS_INVOICE_MATCH");
        expect(code).toContain("ZERO_INVOICE_MATCH");
        expect(code).toContain("UNCERTAIN_INVOICE_PENDING");
        expect(code).toContain("RESOLVED");
        expect(code).toContain("VERIFIED_INV_");

        // 4. Notifications & Secret checks
        expect(code).toContain("HOLDING_CONFIRMATION_EMAIL");
        expect(code).toContain("MISSING_INVOICE_TOKEN_SECRET");
        expect(code).not.toContain('getOptionalScriptSecret("RAZORPAY_KEY_SECRET")');
      });
    }
  });
});
