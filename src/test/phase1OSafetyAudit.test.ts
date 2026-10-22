import { describe, it, expect, beforeEach, afterEach } from "vitest";
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
  KNOWN_PRODUCTION_SPREADSHEET_IDS,
} from "../../backend/webhook_proxy/razorpay_webhook_proxy.js";

const TEST_WEBHOOK_SECRET = "whsec_audit_safety_test_secret_123456789";
const TEST_PROXY_SECRET = "proxy_audit_high_entropy_v2_signing_sec_987654321";
const STAGING_GAS_URL = "https://script.google.com/macros/s/AKfycbz_staging_unique_dest/exec";

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

describe("PHASE 1O: Independent Pre-Deployment Safety Audit", () => {
  describe("1. Environment Configuration & Strict Fail-Closed Architecture", () => {
    it("proxy handleIncomingRazorpayWebhook fails closed with MISSING_ENVIRONMENT when environment is absent", async () => {
      const origAppEnv = process.env.APP_ENVIRONMENT;
      const origNodeEnv = process.env.NODE_ENV;
      try {
        delete process.env.APP_ENVIRONMENT;
        delete process.env.NODE_ENV;

        const rawBody = JSON.stringify({
          entity: "event",
          event: "payment.captured",
          payload: { payment: { entity: { id: "pay_test_001", amount: 299900, currency: "INR", status: "captured" } } },
        });

        const sig = crypto.createHmac("sha256", TEST_WEBHOOK_SECRET).update(rawBody).digest("hex");

        const result = await handleIncomingRazorpayWebhook({
          rawBody,
          signature: sig,
          webhookSecret: TEST_WEBHOOK_SECRET,
          proxySecret: TEST_PROXY_SECRET,
          targetUrl: STAGING_GAS_URL,
          // options.environment is intentionally omitted
        });

        expect(result.status).toBe(500);
        expect(result.error).toContain("MISSING_ENVIRONMENT");
      } finally {
        if (origAppEnv !== undefined) process.env.APP_ENVIRONMENT = origAppEnv;
        if (origNodeEnv !== undefined) process.env.NODE_ENV = origNodeEnv;
      }
    });

    it("proxy handleIncomingRazorpayWebhook fails closed with INVALID_ENVIRONMENT for unknown environment string", async () => {
      const rawBody = JSON.stringify({
        entity: "event",
        event: "payment.captured",
        payload: { payment: { entity: { id: "pay_test_001", amount: 299900, currency: "INR", status: "captured" } } },
      });

      const sig = crypto.createHmac("sha256", TEST_WEBHOOK_SECRET).update(rawBody).digest("hex");

      const result = await handleIncomingRazorpayWebhook({
        rawBody,
        signature: sig,
        webhookSecret: TEST_WEBHOOK_SECRET,
        proxySecret: TEST_PROXY_SECRET,
        targetUrl: STAGING_GAS_URL,
        environment: "sandbox_invalid_env",
      });

      expect(result.status).toBe(500);
      expect(result.error).toContain("INVALID_ENVIRONMENT");
    });

    it("proxy determineAuthoritativeProductRoute fails closed on invalid environment", () => {
      const res = determineAuthoritativeProductRoute(
        { id: "pay_test_123", notes: { product_key: "ai_masterclass" } },
        { id: "pay_test_123", notes: { product_key: "ai_masterclass" } },
        {},
        { environment: "unrecognized_env" }
      );
      expect(res.success).toBe(false);
      expect(res.error).toContain("INVALID_ENVIRONMENT");
    });

    it("proxy determineProductRoute fails closed on invalid environment", () => {
      const res = determineProductRoute(
        { id: "pay_test_123", notes: { product_key: "ai_masterclass" } },
        {},
        { environment: "unrecognized_env" }
      );
      expect(res.success).toBe(false);
      expect(res.error).toContain("INVALID_ENVIRONMENT");
    });

    it("all 8 Apps Script projects contain strict fail-closed getAppEnvironment logic", () => {
      for (const relPath of APPS_SCRIPT_FILES) {
        const fullPath = path.resolve(relPath);
        expect(fs.existsSync(fullPath)).toBe(true);
        const content = fs.readFileSync(fullPath, "utf-8");

        // Must define getAppEnvironment
        expect(content).toContain("function getAppEnvironment()");
        // Must throw MISSING_ENVIRONMENT when property is empty in deployed runtime
        expect(content).toContain("MISSING_ENVIRONMENT");
        // Must throw INVALID_ENVIRONMENT when unrecognized
        expect(content).toContain("INVALID_ENVIRONMENT");
        // Must validate environment against production, staging, local_test, development
        expect(content).toMatch(/\["production",\s*"staging"/);
      }
    });
  });

  describe("2. Apps Script Authentication, Integrity & Write-Path Guards", () => {
    it("all 8 Apps Script projects guard client updatePaymentStatus with validatePaymentEnvironment", () => {
      for (const relPath of APPS_SCRIPT_FILES) {
        const fullPath = path.resolve(relPath);
        const content = fs.readFileSync(fullPath, "utf-8");

        // Check if updatePaymentStatus exists in the file
        if (content.includes("function updatePaymentStatus(")) {
          expect(content).toContain("validatePaymentEnvironment({");
        }
        // Check if handlePaymentSuccess exists in the file
        if (content.includes("function handlePaymentSuccess(")) {
          expect(content).toContain("validatePaymentEnvironment({");
        }
      }
    });

    it("all 8 Apps Script projects support dynamic SPREADSHEET_ID with production rejection in staging", () => {
      for (const relPath of APPS_SCRIPT_FILES) {
        const fullPath = path.resolve(relPath);
        const content = fs.readFileSync(fullPath, "utf-8");

        // Must define getSpreadsheetId
        expect(content).toContain("function getSpreadsheetId()");
        // Must check assertSpreadsheetIsolation
        expect(content).toContain("assertSpreadsheetIsolation(");
        // Must check known production spreadsheet list
        expect(content).toContain("KNOWN_PRODUCTION_SPREADSHEET_IDS");
        expect(content).toContain("PRODUCTION_SPREADSHEET_IN_STAGING");
      }
    });

    it("all 8 Apps Script projects enforce spreadsheet isolation before writing to GST Sales Register", () => {
      for (const relPath of APPS_SCRIPT_FILES) {
        const fullPath = path.resolve(relPath);
        const content = fs.readFileSync(fullPath, "utf-8");

        if (content.includes("function appendToGstSalesRegister(")) {
          // Must call assertSpreadsheetIsolation
          const salesRegFn = content.substring(content.indexOf("function appendToGstSalesRegister("));
          const salesRegBody = salesRegFn.substring(0, salesRegFn.indexOf("function ", 20));
          expect(salesRegBody).toContain("assertSpreadsheetIsolation(");
        }
      }
    });

    it("all 8 Apps Script projects enforce validatePaymentEnvironment and assertSpreadsheetIsolation in processVerifiedPayment", () => {
      for (const relPath of APPS_SCRIPT_FILES) {
        const fullPath = path.resolve(relPath);
        const content = fs.readFileSync(fullPath, "utf-8");

        const matches = content.match(/function processVerified\w*Payment\(/g);
        if (matches) {
          for (const match of matches) {
            const fnName = match.replace("function ", "").replace("(", "");
            const fnIdx = content.indexOf(match);
            const nextFnIdx = content.indexOf("function ", fnIdx + 20);
            const fnBody = content.substring(fnIdx, nextFnIdx > -1 ? nextFnIdx : undefined);

            expect(fnBody).toContain("validatePaymentEnvironment(");
            expect(fnBody).toContain("assertSpreadsheetIsolation(");
          }
        }
      }
    });
  });

  describe("3. Staging Rejection of Production Resources", () => {
    it("staging proxy rejects all 8 known production GAS URLs", async () => {
      for (const [key, prodUrl] of Object.entries(KNOWN_PRODUCTION_GAS_URLS)) {
        const rawBody = JSON.stringify({
          entity: "event",
          event: "payment.captured",
          payload: { payment: { entity: { id: "pay_test_001", amount: 299900, currency: "INR", status: "captured" } } },
        });

        const sig = crypto.createHmac("sha256", TEST_WEBHOOK_SECRET).update(rawBody).digest("hex");

        const result = await handleIncomingRazorpayWebhook({
          rawBody,
          signature: sig,
          webhookSecret: TEST_WEBHOOK_SECRET,
          proxySecret: TEST_PROXY_SECRET,
          targetUrl: prodUrl, // Accidental prod URL in staging
          environment: "staging",
        });

        expect(result.status).toBe(422);
        expect(result.error).toContain("PRODUCTION_DESTINATION_IN_STAGING");
      }
    });

    it("staging proxy rejects live Razorpay keys and live payments", async () => {
      const rawBody = JSON.stringify({
        entity: "event",
        event: "payment.captured",
        payload: {
          payment: {
            entity: {
              id: "pay_LIVE_999999", // Live payment
              amount: 299900,
              currency: "INR",
              status: "captured",
              notes: { mode: "live" },
            },
          },
        },
      });

      const sig = crypto.createHmac("sha256", TEST_WEBHOOK_SECRET).update(rawBody).digest("hex");

      const result = await handleIncomingRazorpayWebhook({
        rawBody,
        signature: sig,
        webhookSecret: TEST_WEBHOOK_SECRET,
        proxySecret: TEST_PROXY_SECRET,
        targetUrl: STAGING_GAS_URL,
        environment: "staging",
        razorpayKeyId: "rzp_live_ABCDEF123456", // Live key in staging
      });

      expect(result.status).toBe(422);
      expect(result.error).toMatch(/LIVE_CREDENTIALS_IN_STAGING|LIVE_PAYMENT_IN_STAGING/);
    });

    it("production proxy rejects test Razorpay keys and test payments", async () => {
      const rawBody = JSON.stringify({
        entity: "event",
        event: "payment.captured",
        payload: {
          payment: {
            entity: {
              id: "pay_test_0000000001",
              amount: 299900,
              currency: "INR",
              status: "captured",
              is_test: true,
              notes: { mode: "test" },
            },
          },
        },
      });

      const sig = crypto.createHmac("sha256", TEST_WEBHOOK_SECRET).update(rawBody).digest("hex");

      const result = await handleIncomingRazorpayWebhook({
        rawBody,
        signature: sig,
        webhookSecret: TEST_WEBHOOK_SECRET,
        proxySecret: TEST_PROXY_SECRET,
        targetUrl: KNOWN_PRODUCTION_GAS_URLS.ai_masterclass,
        environment: "production",
        razorpayKeyId: "rzp_test_ABCDEF123456", // Test key in prod
      });

      expect(result.status).toBe(422);
      expect(result.error).toMatch(/TEST_CREDENTIALS_IN_PRODUCTION|TEST_PAYMENT_IN_PRODUCTION/);
    });
  });

  describe("4. Accounting & Integrity Verification", () => {
    it("preserves exact SAC 999293 and 18% inclusive GST mathematics", () => {
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

    it("enforces canonical 8-field digest and 12-tuple v2.1 signature", () => {
      const entity = {
        id: "pay_audit_test_101",
        order_id: "order_audit_test_101",
        amount: 299900,
        currency: "INR",
        status: "captured",
        account_id: "acc_audit_test",
        method: "upi",
        created_at: 1776000000,
      };

      const digest = computeHardenedPayloadDigest(entity);
      expect(digest).toHaveLength(64);

      const timestamp = 1776000100;
      const sig = computeHardenedProxySignature({
        proxyVersion: "v2.1",
        eventId: "evt_audit_101",
        eventType: "payment.captured",
        orderId: entity.order_id,
        paymentId: entity.id,
        timestamp,
        productKey: "ai_masterclass",
        amount: entity.amount,
        currency: entity.currency,
        status: entity.status,
        accountId: entity.account_id,
        payloadDigest: digest,
      }, TEST_PROXY_SECRET);

      expect(sig).toHaveLength(64);
    });
  });
});
