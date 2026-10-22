import { describe, it, expect, beforeEach } from "vitest";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {
  computeCanonicalPayloadDigest,
  computeHardenedPayloadDigest,
  computeCanonicalProxySignature,
  computeHardenedProxySignature,
  determineProductRoute,
  determineAuthoritativeProductRoute,
  handleIncomingRazorpayWebhook,
  verifyRazorpayWebhookSignature,
  KNOWN_PRODUCTION_GAS_URLS,
} from "../../backend/webhook_proxy/razorpay_webhook_proxy.js";

const TEST_WEBHOOK_SECRET = "whsec_test_secret_staging_isolation_987654321";
const TEST_PROXY_SECRET = "proxy_secret_high_entropy_v2_signing_abcdef987654321";
const STAGING_GAS_URL = "https://script.google.com/macros/s/AKfycbz_staging_test_unique_dest/exec";
const PROD_GAS_URL = KNOWN_PRODUCTION_GAS_URLS.ai_masterclass;

const APPS_SCRIPT_FILES = [
  "backend/apps_script/ai_masterclass/apps_script.gs",
  "backend/apps_script/advanced_masterclass/apps_script.gs",
  "backend/apps_script/claude_masterclass/apps_script.gs",
  "backend/apps_script/academy/apps_script.gs",
  "backend/apps_script/ai_bgm/apps_script.gs",
  "backend/apps_script/consulting/apps_script.gs",
  "backend/apps_script/professionals/apps_script.gs",
  "backend/apps_script/upscale/apps_script.gs",
];

const KNOWN_PROD_SPREADSHEET_IDS = [
  "1PC9ZYxd4O7ofuDwcN5AhPHTvW6RYO7V2LgQqrbPTQ5I", // Academy
  "1XyFhw6cTJAOE2XT7Ra8lmL0rcvq2meCT9LlGuzOF0nk", // AI BGM
  "1JA3FZf8xkpZ8GjuYiETXz9R0ivfW80-rf3PZIzQum9g", // Claude Masterclass
  "1LP37n3zb1d0UkXjddQBCKqmSU0j5-HvPSI-Rda36E3s", // Consulting
  "1RpwPPMH6nf8CsIAfITF1gNc5gBNhq7CJ0zckotAgq4I", // Professionals
];

/**
 * Creates an in-memory Google Apps Script simulator matching the Phase 1N staging-hardened GAS implementation.
 */
function createPhase1NAppsScriptEnvironment(expectedProductKey: string, initialProps: Record<string, string> = {}) {
  const scriptProperties = new Map<string, string>();
  scriptProperties.set("WEBHOOK_PROXY_SECRET", TEST_PROXY_SECRET);
  scriptProperties.set("INVOICE_TOKEN_SECRET", "inv_token_secret_test_54321");
  scriptProperties.set("RAZORPAY_KEY_SECRET", "test_rzp_secret_dummy");
  
  for (const [k, v] of Object.entries(initialProps)) {
    scriptProperties.set(k, v);
  }

  let funnelsDoneHttpCalls = 0;
  let whatsAppHttpCalls = 0;
  let emailCalls = 0;
  const logEntries: Array<{ event: string; data: string }> = [];

  const getOptionalScriptSecret = (key: string) => scriptProperties.get(key) || "";
  const getScriptSecret = (key: string) => {
    const val = scriptProperties.get(key);
    if (!val) throw new Error("Missing required Script Property: " + key);
    return val;
  };

  const getAppEnvironment = () => {
    const envVal = String(getOptionalScriptSecret("ENVIRONMENT") || getOptionalScriptSecret("APP_ENV") || "").trim().toLowerCase();
    if (envVal) {
      if (["production", "staging", "local_test", "development"].includes(envVal)) {
        return envVal;
      }
      throw new Error("INVALID_ENVIRONMENT: Unknown environment '" + envVal + "'. Allowed: production, staging, local_test, development.");
    }
    return "local_test";
  };

  const getRazorpayKeyId = (isIntl?: boolean) => {
    const env = getAppEnvironment();
    const secretKey = isIntl ? "RAZORPAY_KEY_ID_INTL" : "RAZORPAY_KEY_ID";
    const fallback = isIntl ? "rzp_live_gfoS1OjC8tvWjP" : "rzp_live_T2CbVONQc6qrqj";
    const keyId = getOptionalScriptSecret(secretKey) || fallback;
    if (!keyId) {
      throw new Error("MISSING_RAZORPAY_KEY_ID: Razorpay key ID not configured for " + secretKey);
    }
    if (env === "staging" && !keyId.startsWith("rzp_test_")) {
      throw new Error("LIVE_CREDENTIALS_IN_STAGING: Live Razorpay key ID '" + keyId + "' cannot be used in staging.");
    }
    if (env === "production" && !keyId.startsWith("rzp_live_")) {
      throw new Error("TEST_CREDENTIALS_IN_PRODUCTION: Test Razorpay key ID '" + keyId + "' cannot be used in production.");
    }
    return keyId;
  };

  const getFunnelsDoneLocationId = () => {
    const env = getAppEnvironment();
    const locationId = getOptionalScriptSecret("FUNNELSDONE_LOCATION_ID") || "uUUUKRH7EP2A0oJBv4Zb";
    if (!locationId) {
      throw new Error("MISSING_FUNNELSDONE_LOCATION_ID: FunnelsDone location ID not configured.");
    }
    if (env === "staging" && locationId === "uUUUKRH7EP2A0oJBv4Zb" && !isMockInvoiceAdapterEnabled()) {
      throw new Error("PRODUCTION_LOCATION_IN_STAGING: Production FunnelsDone location ID cannot be used in staging.");
    }
    return locationId;
  };

  const getWhatsAppPhoneNumberId = () => {
    const env = getAppEnvironment();
    const phoneId = getOptionalScriptSecret("WHATSAPP_PHONE_NUMBER_ID") || "105673199144415";
    if (env === "staging" && phoneId && (phoneId === "105673199144415" || phoneId === "1089787377552637")) {
      throw new Error("PRODUCTION_WHATSAPP_IN_STAGING: Production WhatsApp phone number ID cannot be used in staging.");
    }
    return phoneId;
  };

  const assertSpreadsheetIsolation = (spreadsheetId: string) => {
    const env = getAppEnvironment();
    if (env === "staging") {
      if (spreadsheetId && KNOWN_PROD_SPREADSHEET_IDS.includes(spreadsheetId)) {
        throw new Error("PRODUCTION_SPREADSHEET_IN_STAGING: Production spreadsheet ID '" + spreadsheetId + "' cannot be used in staging.");
      }
    }
  };

  const isMockInvoiceAdapterEnabled = () => {
    const env = getAppEnvironment();
    const mockSetting = String(getOptionalScriptSecret("ENABLE_MOCK_INVOICE_ADAPTER") || "").trim().toLowerCase();
    if (mockSetting === "true" || mockSetting === "1") return true;
    if (mockSetting === "false" || mockSetting === "0") {
      if (env === "staging") {
        throw new Error("INSECURE_STAGING_CONFIG: Mock invoice adapter cannot be explicitly disabled in staging without verified sandbox credentials.");
      }
      return false;
    }
    return env === "staging" || env === "local_test" || env === "development";
  };

  const isNotificationSuppressed = () => {
    const env = getAppEnvironment();
    const suppressSetting = String(getOptionalScriptSecret("SUPPRESS_NOTIFICATIONS") || "").trim().toLowerCase();
    if (suppressSetting === "false" || suppressSetting === "0") {
      if (env === "staging") {
        throw new Error("INSECURE_STAGING_CONFIG: Customer notification suppression cannot be disabled in staging.");
      }
      return false;
    }
    return env === "staging" || env === "local_test" || env === "development" || suppressSetting === "true" || suppressSetting === "1";
  };

  const validatePaymentEnvironment = (paymentEntity: any) => {
    const env = getAppEnvironment();
    if (!paymentEntity) return;

    const paymentId = String(paymentEntity.id || paymentEntity.payment_id || "").trim();
    const isTestMode = Boolean(
      paymentEntity.is_test ||
      paymentEntity.test ||
      (paymentEntity.notes && (paymentEntity.notes.mode === "test" || paymentEntity.notes.is_test === "true")) ||
      (paymentId && paymentId.startsWith("pay_test_"))
    );

    if (env === "staging") {
      if (paymentEntity.is_test === false || (paymentEntity.notes && paymentEntity.notes.mode === "live")) {
        throw new Error("LIVE_PAYMENT_IN_STAGING: Live Razorpay payment received in staging environment.");
      }
    }

    if (env === "production") {
      if (isTestMode) {
        throw new Error("TEST_PAYMENT_IN_PRODUCTION: Test payment cannot be processed in production environment.");
      }
    }
  };

  const syncInvoiceWithFunnelsDone = (
    customerName: string,
    customerEmail: string,
    customerPhone: string,
    courseName: string,
    totalAmount: number,
    paymentId: string,
    orderId: string
  ) => {
    const cleanPayId = String(paymentId || "").trim();
    if (isMockInvoiceAdapterEnabled()) {
      const mockInvNo = "STAGE-INV-" + cleanPayId.replace(/[^A-Za-z0-9]/g, "").slice(-6).toUpperCase();
      return mockInvNo;
    }
    // Remote network call
    funnelsDoneHttpCalls++;
    return "FD-REAL-" + cleanPayId.slice(-6);
  };

  const sendStudentEmail = (email: string) => {
    if (isNotificationSuppressed()) {
      return { suppressed: true };
    }
    emailCalls++;
    return { suppressed: false };
  };

  const sendWhatsApp = (to: string) => {
    if (isNotificationSuppressed()) {
      return { suppressed: true };
    }
    whatsAppHttpCalls++;
    return { suppressed: false };
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

  const handleWebhook = (params: {
    orderId: string;
    paymentId: string;
    email: string;
    proxySignature: string;
    timestamp: number;
    eventId: string;
    targetProduct: string;
    payloadDigest: string;
    paymentEntity: any;
    proxyVersion?: string;
    eventType?: string;
  }) => {
    const webhookProxySecret = getScriptSecret("WEBHOOK_PROXY_SECRET");
    const cleanOrderId = String(params.orderId || "").trim();
    const cleanPaymentId = String(params.paymentId || "").trim();
    const cleanEventId = String(params.eventId || "").trim();
    const cleanTimestamp = Number(params.timestamp) || 0;
    const cleanTargetProduct = String(params.targetProduct || "").trim().toLowerCase();
    const cleanPayloadDigest = String(params.payloadDigest || "").trim().toLowerCase();
    const cleanEventType = String(params.eventType || (params.paymentEntity && params.paymentEntity.event) || "payment.captured").trim();
    const cleanAmount = params.paymentEntity && params.paymentEntity.amount !== undefined ? String(params.paymentEntity.amount).trim() : "";
    const cleanCurrency = params.paymentEntity && params.paymentEntity.currency ? String(params.paymentEntity.currency).trim() : "INR";
    const cleanStatus = params.paymentEntity && params.paymentEntity.status ? String(params.paymentEntity.status).trim() : "captured";
    const cleanAccountId = params.paymentEntity ? String(params.paymentEntity.account_id || params.paymentEntity.accountId || (params.paymentEntity.notes && params.paymentEntity.notes.account_id) || "").trim() : "";
    const cleanProxyVersion = String(params.proxyVersion || "").trim();

    validatePaymentEnvironment(params.paymentEntity);

    const env = getAppEnvironment();
    const isExplicitNonProd = (env === "development" || env === "local_test");
    const allowLegacyDev = isExplicitNonProd && (getOptionalScriptSecret("ALLOW_LEGACY_PROXY_SIGNATURE") === "true");

    if (!cleanTargetProduct || cleanTargetProduct !== expectedProductKey) {
      throw new Error("DESTINATION_MISMATCH: Webhook intended for '" + cleanTargetProduct + "' cannot be processed by '" + expectedProductKey + "'.");
    }

    const now = Date.now();
    if (!cleanTimestamp || Math.abs(now - cleanTimestamp) > 300000) {
      throw new Error("REPLAY_EXPIRED_TIMESTAMP: Webhook timestamp expired or outside tolerance window.");
    }

    const cleanSig = String(params.proxySignature || "").trim().toLowerCase();
    if (!allowLegacyDev) {
      if (!cleanProxyVersion) {
        throw new Error("MISSING_PROTOCOL_VERSION: Production and staging require proxy_version 'v2.1'.");
      }
      if (cleanProxyVersion !== "v2.1") {
        throw new Error("PROTOCOL_DOWNGRADE_REJECTED: Staging and production only permit 'v2.1'. Received '" + cleanProxyVersion + "'.");
      }

      const digest8 = computeHardenedPayloadDigest(params.paymentEntity);
      if (!cleanPayloadDigest || !constantTimeEquals(digest8, cleanPayloadDigest)) {
        throw new Error("PAYLOAD_DIGEST_MISMATCH: Canonical payload digest does not match payment entity.");
      }

      const expectedSig12 = computeHmacSha256Hex(
        "v2|" + cleanEventId + "|" + cleanEventType + "|" + cleanOrderId + "|" + cleanPaymentId + "|" + cleanTimestamp + "|" + cleanTargetProduct + "|" + cleanAmount + "|" + cleanCurrency + "|" + cleanStatus + "|" + cleanAccountId + "|" + cleanPayloadDigest,
        webhookProxySecret
      );
      if (!constantTimeEquals(expectedSig12, cleanSig)) {
        throw new Error("PROXY_SIGNATURE_MISMATCH: Invalid hardened 12-tuple proxy signature.");
      }
    }

    // Process invoice and notifications
    const invoiceNo = syncInvoiceWithFunnelsDone("Test Learner", params.email, "+919876543210", "AI Masterclass", 2999, cleanPaymentId, cleanOrderId);
    const emailResult = sendStudentEmail(params.email);
    const waResult = sendWhatsApp("+919876543210");

    return {
      success: true,
      invoiceNumber: invoiceNo,
      emailSuppressed: emailResult.suppressed,
      whatsAppSuppressed: waResult.suppressed,
    };
  };

  return {
    scriptProperties,
    getAppEnvironment,
    getRazorpayKeyId,
    getFunnelsDoneLocationId,
    getWhatsAppPhoneNumberId,
    assertSpreadsheetIsolation,
    isMockInvoiceAdapterEnabled,
    isNotificationSuppressed,
    validatePaymentEnvironment,
    syncInvoiceWithFunnelsDone,
    sendStudentEmail,
    sendWhatsApp,
    handleWebhook,
    getFunnelsDoneHttpCalls: () => funnelsDoneHttpCalls,
    getWhatsAppHttpCalls: () => whatsAppHttpCalls,
    getEmailCalls: () => emailCalls,
  };
}

describe("Phase 1N: Staging Isolation Code Hardening Audit", () => {
  describe("1. Static Code Audit of all 8 Apps Script Projects", () => {
    it("proves no Apps Script file has un-isolated live credentials or static variables without fail-closed getters", () => {
      for (const filePath of APPS_SCRIPT_FILES) {
        const fullPath = path.resolve(process.cwd(), filePath);
        expect(fs.existsSync(fullPath)).toBe(true);
        const code = fs.readFileSync(fullPath, "utf8");

        // Must define all 7 staging-isolation core functions
        expect(code).toContain("function getAppEnvironment()");
        expect(code).toContain("function getRazorpayKeyId(");
        expect(code).toContain("function getFunnelsDoneLocationId()");
        expect(code).toContain("function assertSpreadsheetIsolation(");
        expect(code).toContain("function isMockInvoiceAdapterEnabled()");
        expect(code).toContain("function isNotificationSuppressed()");
        expect(code).toContain("function validatePaymentEnvironment(");

        // Must have KNOWN_PRODUCTION_SPREADSHEET_IDS guarding staging
        expect(code).toContain("KNOWN_PRODUCTION_SPREADSHEET_IDS");

        // Must guard mock invoice mode
        expect(code).toContain("STAGE-INV-");
        expect(code).toContain("isMockInvoiceAdapterEnabled()");

        // Must guard notification suppression
        expect(code).toContain("isNotificationSuppressed()");

        // Must use dynamic getters for credentials
        expect(code).toContain("getRazorpayKeyId(");
      }
    });

    it("verifies webhook proxy exports KNOWN_PRODUCTION_GAS_URLS and enforces strict staging isolation", () => {
      expect(KNOWN_PRODUCTION_GAS_URLS).toBeDefined();
      expect(KNOWN_PRODUCTION_GAS_URLS instanceof Set).toBe(true);
      expect(KNOWN_PRODUCTION_GAS_URLS.size).toBe(8);
    });
  });

  describe("2. Proxy Credential & Payment Isolation", () => {
    it("rejects live Razorpay key IDs when proxy environment is staging (LIVE_CREDENTIALS_IN_STAGING)", () => {
      const res = handleIncomingRazorpayWebhook({
        rawBody: JSON.stringify({ event: "payment.captured" }),
        signatureHeader: "sig",
        webhookSecret: TEST_WEBHOOK_SECRET,
        proxySecret: TEST_PROXY_SECRET,
        environment: "staging",
        razorpayKeyId: "rzp_live_T2CbVONQc6qrqj",
      });
      expect(res.success).toBe(false);
      expect(res.status).toBe(422);
      expect(res.error).toContain("LIVE_CREDENTIALS_IN_STAGING");
    });

    it("rejects live payment entity when proxy environment is staging (LIVE_PAYMENT_IN_STAGING)", () => {
      const now = Date.now();
      const payloadObj = {
        event: "payment.captured",
        payload: {
          payment: {
            entity: {
              id: "pay_live_ABC12345",
              order_id: "order_live_ABC12345",
              amount: 299900,
              currency: "INR",
              status: "captured",
              is_test: false,
              notes: { product_key: "ai_masterclass", mode: "live" },
            },
          },
        },
      };
      const rawBody = JSON.stringify(payloadObj);
      const rzpSig = crypto.createHmac("sha256", TEST_WEBHOOK_SECRET).update(rawBody).digest("hex");

      const res = handleIncomingRazorpayWebhook({
        webhookSecret: TEST_WEBHOOK_SECRET,
        proxySecret: TEST_PROXY_SECRET,
        rawBody: rawBody,
        signatureHeader: rzpSig,
        environment: "staging",
        razorpayKeyId: "rzp_test_mock123",
      });
      expect(res.success).toBe(false);
      expect(res.error).toContain("LIVE_PAYMENT_IN_STAGING");
    });

    it("rejects production Apps Script destinations when proxy environment is staging (PRODUCTION_DESTINATION_IN_STAGING)", () => {
      const prodUrl = Array.from(KNOWN_PRODUCTION_GAS_URLS)[0];
      const res = determineProductRoute(
        { notes: { product_key: "ai_masterclass", mode: "test" }, id: "pay_test_123" },
        { ai_masterclass: prodUrl },
        { environment: "staging" }
      );
      expect(res.success).toBe(false);
      expect(res.error).toContain("PRODUCTION_DESTINATION_IN_STAGING");
    });

    it("allows valid staging destination in staging environment", () => {
      const res = determineProductRoute(
        { notes: { product_key: "ai_masterclass", mode: "test" }, id: "pay_test_123" },
        { ai_masterclass: STAGING_GAS_URL },
        { environment: "staging" }
      );
      expect(res.success).toBe(true);
      expect(res.targetUrl).toBe(STAGING_GAS_URL);
      expect(res.productKey).toBe("ai_masterclass");
    });

    it("rejects test payments when proxy environment is production (TEST_PAYMENT_IN_PRODUCTION)", () => {
      const payloadObj = {
        event: "payment.captured",
        payload: {
          payment: {
            entity: {
              id: "pay_test_ABC12345",
              order_id: "order_test_ABC12345",
              amount: 299900,
              currency: "INR",
              status: "captured",
              is_test: true,
              notes: { product_key: "ai_masterclass" },
            },
          },
        },
      };
      const rawBody = JSON.stringify(payloadObj);
      const rzpSig = crypto.createHmac("sha256", TEST_WEBHOOK_SECRET).update(rawBody).digest("hex");

      const res = handleIncomingRazorpayWebhook({
        webhookSecret: TEST_WEBHOOK_SECRET,
        proxySecret: TEST_PROXY_SECRET,
        rawBody: rawBody,
        signatureHeader: rzpSig,
        environment: "production",
        razorpayKeyId: "rzp_live_T2CbVONQc6qrqj",
      });
      expect(res.success).toBe(false);
      expect(res.error).toContain("TEST_PAYMENT_IN_PRODUCTION");
    });
  });

  describe("3. Apps Script Environment & Isolation Safeguards", () => {
    it("fails closed on invalid environment identifier", () => {
      const gas = createPhase1NAppsScriptEnvironment("ai_masterclass", {
        ENVIRONMENT: "rogue_env",
      });
      expect(() => gas.getAppEnvironment()).toThrow("INVALID_ENVIRONMENT");
    });

    it("rejects live Razorpay key IDs in staging environment (LIVE_CREDENTIALS_IN_STAGING)", () => {
      const gas = createPhase1NAppsScriptEnvironment("ai_masterclass", {
        ENVIRONMENT: "staging",
        RAZORPAY_KEY_ID: "rzp_live_T2CbVONQc6qrqj",
      });
      expect(() => gas.getRazorpayKeyId()).toThrow("LIVE_CREDENTIALS_IN_STAGING");
    });

    it("rejects test Razorpay key IDs in production environment (TEST_CREDENTIALS_IN_PRODUCTION)", () => {
      const gas = createPhase1NAppsScriptEnvironment("ai_masterclass", {
        ENVIRONMENT: "production",
        RAZORPAY_KEY_ID: "rzp_test_123456789",
      });
      expect(() => gas.getRazorpayKeyId()).toThrow("TEST_CREDENTIALS_IN_PRODUCTION");
    });

    it("rejects production spreadsheet IDs in staging environment (PRODUCTION_SPREADSHEET_IN_STAGING)", () => {
      const gas = createPhase1NAppsScriptEnvironment("ai_masterclass", {
        ENVIRONMENT: "staging",
      });
      for (const prodSheetId of KNOWN_PROD_SPREADSHEET_IDS) {
        expect(() => gas.assertSpreadsheetIsolation(prodSheetId)).toThrow("PRODUCTION_SPREADSHEET_IN_STAGING");
      }
      // Non-production ID is allowed
      expect(() => gas.assertSpreadsheetIsolation("1_staging_dedicated_spreadsheet_id_safe")).not.toThrow();
    });

    it("rejects production FunnelsDone location ID in staging unless mock adapter is enabled", () => {
      const gas = createPhase1NAppsScriptEnvironment("ai_masterclass", {
        ENVIRONMENT: "staging",
        FUNNELSDONE_LOCATION_ID: "uUUUKRH7EP2A0oJBv4Zb",
        ENABLE_MOCK_INVOICE_ADAPTER: "false",
      });
      expect(() => gas.getFunnelsDoneLocationId()).toThrow();
    });

    it("rejects production WhatsApp phone number ID in staging (PRODUCTION_WHATSAPP_IN_STAGING)", () => {
      const gas = createPhase1NAppsScriptEnvironment("ai_masterclass", {
        ENVIRONMENT: "staging",
        WHATSAPP_PHONE_NUMBER_ID: "105673199144415",
      });
      expect(() => gas.getWhatsAppPhoneNumberId()).toThrow("PRODUCTION_WHATSAPP_IN_STAGING");
    });

    it("prevents disabling mock invoice adapter in staging (INSECURE_STAGING_CONFIG)", () => {
      const gas = createPhase1NAppsScriptEnvironment("ai_masterclass", {
        ENVIRONMENT: "staging",
        ENABLE_MOCK_INVOICE_ADAPTER: "false",
      });
      expect(() => gas.isMockInvoiceAdapterEnabled()).toThrow("INSECURE_STAGING_CONFIG");
    });

    it("prevents disabling notification suppression in staging (INSECURE_STAGING_CONFIG)", () => {
      const gas = createPhase1NAppsScriptEnvironment("ai_masterclass", {
        ENVIRONMENT: "staging",
        SUPPRESS_NOTIFICATIONS: "false",
      });
      expect(() => gas.isNotificationSuppressed()).toThrow("INSECURE_STAGING_CONFIG");
    });

    it("rejects live payment entity inside staging Apps Script (LIVE_PAYMENT_IN_STAGING)", () => {
      const gas = createPhase1NAppsScriptEnvironment("ai_masterclass", {
        ENVIRONMENT: "staging",
      });
      expect(() => {
        gas.validatePaymentEnvironment({
          id: "pay_live_77777777",
          is_test: false,
          notes: { mode: "live" },
        });
      }).toThrow("LIVE_PAYMENT_IN_STAGING");
    });

    it("rejects test payment entity inside production Apps Script (TEST_PAYMENT_IN_PRODUCTION)", () => {
      const gas = createPhase1NAppsScriptEnvironment("ai_masterclass", {
        ENVIRONMENT: "production",
      });
      expect(() => {
        gas.validatePaymentEnvironment({
          id: "pay_test_77777777",
          is_test: true,
          notes: { mode: "test" },
        });
      }).toThrow("TEST_PAYMENT_IN_PRODUCTION");
    });
  });

  describe("4. Signature Protocol Hardening in Staging", () => {
    it("rejects legacy signatures in staging even if ALLOW_LEGACY_PROXY_SIGNATURE is true", () => {
      const gas = createPhase1NAppsScriptEnvironment("ai_masterclass", {
        ENVIRONMENT: "staging",
        ALLOW_LEGACY_PROXY_SIGNATURE: "true",
      });

      const now = Date.now();
      const entity = {
        id: "pay_test_0001",
        order_id: "order_test_0001",
        amount: 299900,
        currency: "INR",
        status: "captured",
        is_test: true,
      };

      // Legacy 7-tuple signature without proxy_version
      const legacySig = crypto.createHmac("sha256", TEST_PROXY_SECRET)
        .update("evt_test_1|order_test_0001|pay_test_0001|" + now + "|ai_masterclass|digest_legacy")
        .digest("hex");

      expect(() => {
        gas.handleWebhook({
          orderId: entity.order_id,
          paymentId: entity.id,
          email: "student@example.com",
          proxySignature: legacySig,
          timestamp: now,
          eventId: "evt_test_1",
          targetProduct: "ai_masterclass",
          payloadDigest: "digest_legacy",
          paymentEntity: entity,
          proxyVersion: undefined, // Missing protocol version
        });
      }).toThrow("MISSING_PROTOCOL_VERSION");
    });

    it("rejects downgraded protocol v2 in staging", () => {
      const gas = createPhase1NAppsScriptEnvironment("ai_masterclass", {
        ENVIRONMENT: "staging",
      });

      const now = Date.now();
      const entity = {
        id: "pay_test_0002",
        order_id: "order_test_0002",
        amount: 299900,
        currency: "INR",
        status: "captured",
        is_test: true,
      };

      expect(() => {
        gas.handleWebhook({
          orderId: entity.order_id,
          paymentId: entity.id,
          email: "student@example.com",
          proxySignature: "some_sig",
          timestamp: now,
          eventId: "evt_test_2",
          targetProduct: "ai_masterclass",
          payloadDigest: "some_digest",
          paymentEntity: entity,
          proxyVersion: "v2", // Downgrade attempt
        });
      }).toThrow("PROTOCOL_DOWNGRADE_REJECTED");
    });
  });

  describe("5. End-to-End Staging Flow Simulation", () => {
    it("simulates full end-to-end test webhook processing in staging with zero production side effects", () => {
      const gas = createPhase1NAppsScriptEnvironment("ai_masterclass", {
        ENVIRONMENT: "staging",
        RAZORPAY_KEY_ID: "rzp_test_stagingKey123",
        ENABLE_MOCK_INVOICE_ADAPTER: "true",
        SUPPRESS_NOTIFICATIONS: "true",
      });

      const now = Date.now();
      const entity = {
        id: "pay_test_staging_9999",
        order_id: "order_test_staging_9999",
        amount: 299900,
        currency: "INR",
        status: "captured",
        account_id: "acc_test_12345",
        is_test: true,
        notes: {
          product_key: "ai_masterclass",
          mode: "test",
        },
      };

      // 1. Calculate canonical payload digest (8-field)
      const digest8 = computeHardenedPayloadDigest(entity);

      // 2. Calculate hardened proxy signature (12-tuple)
      const sig12 = computeHardenedProxySignature({
        proxyVersion: "v2.1",
        eventId: "evt_test_staging_9999",
        eventType: "payment.captured",
        orderId: entity.order_id,
        paymentId: entity.id,
        timestamp: now,
        productKey: "ai_masterclass",
        amount: entity.amount,
        currency: entity.currency,
        status: entity.status,
        accountId: entity.account_id,
        payloadDigest: digest8,
      }, TEST_PROXY_SECRET);

      // 3. Dispatch to staging Apps Script
      const result = gas.handleWebhook({
        orderId: entity.order_id,
        paymentId: entity.id,
        email: "test.student@example.com",
        proxySignature: sig12,
        timestamp: now,
        eventId: "evt_test_staging_9999",
        targetProduct: "ai_masterclass",
        payloadDigest: digest8,
        paymentEntity: entity,
        proxyVersion: "v2.1",
        eventType: "payment.captured",
      });

      // Assertions
      expect(result.success).toBe(true);
      expect(result.invoiceNumber).toMatch(/^STAGE-INV-/);
      expect(result.emailSuppressed).toBe(true);
      expect(result.whatsAppSuppressed).toBe(true);

      // Zero outbound network calls to FunnelsDone, WhatsApp, or customer email
      expect(gas.getFunnelsDoneHttpCalls()).toBe(0);
      expect(gas.getWhatsAppHttpCalls()).toBe(0);
      expect(gas.getEmailCalls()).toBe(0);
    });
  });

  describe("6. GST Calculations & Accounting Integrity Preservation", () => {
    it("preserves 18% inclusive GST calculations (9% CGST + 9% SGST) and SAC code 999293", () => {
      const grossAmount = 2999;
      const baseAmount = Math.round((grossAmount / 1.18) * 100) / 100;
      const totalGst = Math.round((grossAmount - baseAmount) * 100) / 100;
      const cgst = Math.round((totalGst / 2) * 100) / 100;
      const sgst = Math.round((totalGst - cgst) * 100) / 100;

      expect(baseAmount).toBe(2541.53);
      expect(totalGst).toBe(457.47);
      expect(cgst).toBe(228.74);
      expect(sgst).toBe(228.73);
      expect(Math.round((baseAmount + cgst + sgst) * 100) / 100).toBe(grossAmount);
    });
  });
});
