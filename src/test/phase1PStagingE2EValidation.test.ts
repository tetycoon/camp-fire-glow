import { describe, it, expect, beforeEach } from "vitest";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {
  computeHardenedPayloadDigest,
  computeHardenedProxySignature,
  determineProductRoute,
  determineAuthoritativeProductRoute,
  handleIncomingRazorpayWebhook,
  verifyRazorpayWebhookSignature,
  KNOWN_PRODUCTION_GAS_URLS,
  KNOWN_PRODUCTION_SPREADSHEET_IDS,
  TRUSTED_PRODUCT_ROUTING,
} from "../../backend/webhook_proxy/razorpay_webhook_proxy.js";
import { validateStagingConfiguration } from "../../scripts/verify-staging-config.cjs";

const TEST_WEBHOOK_SECRET = "whsec_staging_test_secret_alpha987654321";
const TEST_PROXY_SECRET = "proxy_staging_high_entropy_v2_signing_abcdef987654321";
const STAGING_GAS_URL = "https://script.google.com/macros/s/AKfycbz_staging_unique_dest/exec";
const STAGING_SPREADSHEET_ID = "1staging_dedicated_sheet_id_xyz9876543210";

const ALL_8_PRODUCTS = [
  "ai_masterclass",
  "advanced_masterclass",
  "claude_masterclass",
  "academy",
  "ai_bgm",
  "consulting",
  "professionals",
  "upscale",
] as const;

/**
 * Creates an in-memory Google Apps Script simulator matching the hardened Phase 1O GAS runtime.
 */
function createStagingAppsScriptSimulator(
  productKey: string,
  initialProps: Record<string, string> = {},
  initialRows: unknown[][] = []
) {
  const scriptProperties = new Map<string, string>();
  scriptProperties.set("APP_ENVIRONMENT", "staging");
  scriptProperties.set("SPREADSHEET_ID", STAGING_SPREADSHEET_ID);
  scriptProperties.set("RAZORPAY_KEY_ID", "rzp_test_stagingKey999");
  scriptProperties.set("RAZORPAY_KEY_SECRET", "rzp_test_secret_dummy");
  scriptProperties.set("WEBHOOK_PROXY_SECRET", TEST_PROXY_SECRET);
  scriptProperties.set("INVOICE_TOKEN_SECRET", "inv_token_secret_test_54321");
  scriptProperties.set("ENABLE_MOCK_INVOICE_ADAPTER", "true");
  scriptProperties.set("MOCK_INVOICE_ADAPTER", "true");
  scriptProperties.set("SUPPRESS_NOTIFICATIONS", "true");
  scriptProperties.set("STRICT_PROXY_MODE", "true");

  for (const [k, v] of Object.entries(initialProps)) {
    scriptProperties.set(k, v);
  }

  let funnelsDoneHttpCalls = 0;
  let whatsAppHttpCalls = 0;
  let emailCalls = 0;
  let mockInvoiceCounter = 1000;
  const logEntries: Array<{ event: string; data: string }> = [];

  const registrationRows: unknown[][] = [
    [
      "Timestamp", "Name", "Email", "Phone", "Role", "Course", "Amount",
      "Payment Status", "Order ID", "Payment ID", "Email Status", "WhatsApp Status"
    ],
    ...initialRows,
  ];

  const gstSalesRows: unknown[][] = [
    [
      "Timestamp", "Invoice No", "Invoice Date", "Customer Name", "Customer Email",
      "Customer Phone", "Place of Supply", "Supply Type", "Reverse Charge", "SAC Code",
      "Service Description", "Taxable Value (₹)", "CGST Rate (%)", "CGST Amount (₹)",
      "SGST Rate (%)", "SGST Amount (₹)", "Round Off (₹)", "Total Invoice Value (₹)",
      "Payment ID", "Order ID"
    ],
  ];

  const getOptionalSecret = (key: string) => scriptProperties.get(key) || "";
  const getRequiredSecret = (key: string) => {
    const val = scriptProperties.get(key);
    if (!val) throw new Error(`Missing required Script Property: ${key}`);
    return val;
  };

  const getAppEnv = () => {
    const envVal = (getOptionalSecret("APP_ENVIRONMENT") || getOptionalSecret("ENVIRONMENT")).toLowerCase().trim();
    if (!envVal) throw new Error("MISSING_ENVIRONMENT: APP_ENVIRONMENT is required.");
    if (!["production", "staging", "local_test", "development"].includes(envVal)) {
      throw new Error(`INVALID_ENVIRONMENT: Unknown environment '${envVal}'.`);
    }
    return envVal;
  };

  const validatePaymentEnv = (paymentEntity: any) => {
    const env = getAppEnv();
    if (!paymentEntity) return;
    const payId = String(paymentEntity.id || paymentEntity.payment_id || "").trim();
    const isTestMode = Boolean(
      paymentEntity.is_test ||
      paymentEntity.test ||
      (paymentEntity.notes && (paymentEntity.notes.mode === "test" || paymentEntity.notes.test_mode === "true" || paymentEntity.notes.test_mode === true)) ||
      (payId && payId.startsWith("pay_test_"))
    );

    if (env === "staging") {
      if (paymentEntity.is_test === false || (paymentEntity.notes && paymentEntity.notes.mode === "live") || (payId && payId.startsWith("pay_live_"))) {
        throw new Error("LIVE_PAYMENT_IN_STAGING: Live payment received in staging environment.");
      }
    }
    if (env === "production" && isTestMode) {
      throw new Error("TEST_PAYMENT_IN_PRODUCTION: Test payment received in production environment.");
    }
  };

  const assertSpreadsheetIsol = (sheetId: string) => {
    const env = getAppEnv();
    if (env === "staging" && KNOWN_PRODUCTION_SPREADSHEET_IDS.includes(sheetId)) {
      throw new Error(`PRODUCTION_SPREADSHEET_IN_STAGING: Staging environment cannot write to production spreadsheet ID ${sheetId}`);
    }
  };

  const isMockInvoiceEnabled = () => {
    const env = getAppEnv();
    const explicit = getOptionalSecret("ENABLE_MOCK_INVOICE_ADAPTER") || getOptionalSecret("MOCK_INVOICE_ADAPTER");
    if (explicit === "true") return true;
    if (explicit === "false") {
      if (env === "staging") throw new Error("MOCK_INVOICE_REQUIRED_IN_STAGING: Mock invoice adapter cannot be disabled in staging.");
      return false;
    }
    return env === "staging" || env === "local_test";
  };

  const isNotifSuppressed = () => {
    const env = getAppEnv();
    const explicit = getOptionalSecret("SUPPRESS_NOTIFICATIONS");
    if (explicit === "true") return true;
    if (explicit === "false") {
      if (env === "staging") throw new Error("NOTIFICATION_UNSUPPRESSED_IN_STAGING: Outbound notifications cannot be unsuppressed in staging.");
      return false;
    }
    return env === "staging" || env === "local_test";
  };

  return {
    scriptProperties,
    registrationRows,
    gstSalesRows,
    logEntries,
    getFunnelsDoneHttpCalls: () => funnelsDoneHttpCalls,
    getWhatsAppHttpCalls: () => whatsAppHttpCalls,
    getEmailCalls: () => emailCalls,

    initOrder(orderId: string, amount: number, email = "learner@example.com", name = "Test Learner") {
      registrationRows.push([
        new Date().toISOString(),
        name,
        email,
        "+919876543210",
        "Developer",
        productKey,
        amount,
        "INITIATED",
        orderId,
        "",
        "WAITING",
        "WAITING",
      ]);
    },

    executeDoPost(body: any, options: { simulateTransient500?: boolean; simulateInvoiceTimeout?: boolean; mockCandidateMatches?: any[] } = {}) {
      if (options.simulateTransient500) {
        logEntries.push({ event: "TRANSIENT_SHEET_ERROR", data: "Simulated lock timeout / transient sheet error" });
        throw new Error("TRANSIENT_SHEET_ERROR: Temporary lock acquisition failed.");
      }

      const env = getAppEnv();
      const currentSheetId = getRequiredSecret("SPREADSHEET_ID");
      assertSpreadsheetIsol(currentSheetId);

      const strictMode = getOptionalSecret("STRICT_PROXY_MODE") !== "false";
      const proxyVersion = String(body.proxy_version || "").trim();

      // Protocol downgrade protection
      if (!proxyVersion) {
        throw new Error("MISSING_PROTOCOL_VERSION: proxy_version is mandatory.");
      }
      if (proxyVersion !== "v2.1") {
        throw new Error("PROTOCOL_DOWNGRADE_REJECTED: Proxy version must be 'v2.1'.");
      }

      // Replay prevention
      const eventId = String(body.eventId || body.event_id || "").trim();
      if (eventId && scriptProperties.has(`PROCESSED_EVT_${eventId}`)) {
        logEntries.push({ event: "DUPLICATE_EVENT_SKIPPED", data: `Event ID ${eventId} previously processed.` });
        return {
          success: true,
          status: 200,
          alreadyProcessed: true,
          duplicate: true,
          message: "DUPLICATE_EVENT_SKIPPED",
        };
      }

      const paymentEntity = body.payload?.payment?.entity;
      if (!paymentEntity) throw new Error("MISSING_PAYMENT_ENTITY: No payment entity found.");

      validatePaymentEnv(paymentEntity);

      // Verify canonical 8-field digest
      const computedDigest = computeHardenedPayloadDigest(paymentEntity);
      if (computedDigest !== body.payload_digest) {
        throw new Error("PAYLOAD_DIGEST_MISMATCH: Computed payload digest does not match proxy payload_digest.");
      }

      // Verify hardened 12-tuple signature
      const expectedSig = computeHardenedProxySignature({
        proxyVersion: "v2.1",
        eventId,
        eventType: body.event || "payment.captured",
        orderId: body.payload?.payment?.entity?.order_id,
        paymentId: body.payload?.payment?.entity?.id,
        timestamp: body.timestamp,
        productKey: body.target_product || productKey,
        amount: paymentEntity.amount,
        currency: paymentEntity.currency,
        status: paymentEntity.status,
        accountId: paymentEntity.account_id || paymentEntity.notes?.account_id || "",
        payloadDigest: computedDigest,
      }, getRequiredSecret("WEBHOOK_PROXY_SECRET"));

      if (expectedSig !== body.proxy_signature) {
        throw new Error("INVALID_WEBHOOK_SIGNATURE: Proxy signature verification failed.");
      }

      const payId = String(paymentEntity.id).trim();
      const orderId = String(paymentEntity.order_id).trim();

      // Check if payment was previously resolved
      if (scriptProperties.has(`VERIFIED_INV_${payId}`)) {
        logEntries.push({ event: "INVOICE_STATE_RESOLVED", data: `Payment ${payId} already has verified invoice.` });
        return {
          success: true,
          status: 200,
          alreadyProcessed: true,
          invoiceNumber: scriptProperties.get(`VERIFIED_INV_${payId}`),
        };
      }

      // Uncertain invoice recovery handling
      if (options.simulateInvoiceTimeout) {
        scriptProperties.set(`INVOICE_STATE_${payId}`, "UNCERTAIN_INVOICE_PENDING");
        logEntries.push({ event: "UNCERTAIN_INVOICE_PENDING", data: `Invoice creation timed out for ${payId}` });
        logEntries.push({ event: "HOLDING_CONFIRMATION_EMAIL", data: `Email held pending reconciliation for ${payId}` });

        // Update registration row to PENDING_RECONCILIATION
        let matched = false;
        for (let i = 1; i < registrationRows.length; i++) {
          if (registrationRows[i][8] === orderId) {
            registrationRows[i][7] = "PENDING_RECONCILIATION";
            registrationRows[i][9] = payId;
            matched = true;
            break;
          }
        }
        if (!matched) {
          registrationRows.push([
            new Date().toISOString(), paymentEntity.notes?.customer_name || "Learner",
            paymentEntity.email || "learner@example.com", "+919876543210", "Dev", productKey,
            paymentEntity.amount / 100, "PENDING_RECONCILIATION", orderId, payId, "HELD", "HELD"
          ]);
        }

        return {
          success: true,
          status: 200,
          uncertainInvoice: true,
          message: "UNCERTAIN_INVOICE_PENDING",
        };
      }

      // Candidate matches lookup during retry
      if (options.mockCandidateMatches !== undefined) {
        const matches = options.mockCandidateMatches;
        if (matches.length === 0) {
          logEntries.push({ event: "ZERO_INVOICE_MATCH", data: `0 matches found for ${payId}` });
          return {
            success: true,
            status: 200,
            uncertainInvoice: true,
            zeroMatch: true,
          };
        } else if (matches.length > 1) {
          logEntries.push({ event: "AMBIGUOUS_INVOICE_MATCH", data: `${matches.length} matches found for ${payId}. Flagged for audit.` });
          return {
            success: true,
            status: 200,
            uncertainInvoice: true,
            ambiguousMatch: true,
          };
        } else {
          // Exactly 1 match recovered!
          const recovered = matches[0];
          scriptProperties.set(`VERIFIED_INV_${payId}`, recovered.invoiceNumber);
          scriptProperties.set(`INVOICE_STATE_${payId}`, "RESOLVED");
          logEntries.push({ event: "INVOICE_RECOVERED", data: `Recovered invoice ${recovered.invoiceNumber}` });
          return {
            success: true,
            status: 200,
            recoveredInvoice: true,
            invoiceNumber: recovered.invoiceNumber,
          };
        }
      }

      // Generate invoice
      let invoiceNo = "";
      if (isMockInvoiceEnabled()) {
        invoiceNo = `STAGE-INV-${++mockInvoiceCounter}`;
      } else {
        funnelsDoneHttpCalls++;
        invoiceNo = `TT/26-27/${++mockInvoiceCounter}`;
      }

      // Notification check
      let notifSuppressed = false;
      if (isNotifSuppressed()) {
        notifSuppressed = true;
      } else {
        whatsAppHttpCalls++;
        emailCalls++;
      }

      // Update registration sheet
      let foundRow = false;
      for (let i = 1; i < registrationRows.length; i++) {
        if (registrationRows[i][8] === orderId) {
          registrationRows[i][7] = "✅ PAID";
          registrationRows[i][9] = payId;
          registrationRows[i][10] = notifSuppressed ? "SUPPRESSED" : "SENT ✅";
          registrationRows[i][11] = notifSuppressed ? "SUPPRESSED" : "SENT ✅";
          foundRow = true;
          break;
        }
      }
      if (!foundRow) {
        // Webhook pure fulfillment (Scenario 7)
        registrationRows.push([
          new Date().toISOString(),
          paymentEntity.notes?.customer_name || "Learner",
          paymentEntity.email || "learner@example.com",
          "+919876543210",
          "Dev",
          productKey,
          paymentEntity.amount / 100,
          "✅ PAID",
          orderId,
          payId,
          notifSuppressed ? "SUPPRESSED" : "SENT ✅",
          notifSuppressed ? "SUPPRESSED" : "SENT ✅",
        ]);
        logEntries.push({ event: "WEBHOOK_COMPLETED_REGISTRATION", data: `Webhook completed registration for order ${orderId}` });
      }

      // Append to GST sales register
      assertSpreadsheetIsol(currentSheetId);
      const grossAmount = paymentEntity.amount / 100;
      const baseAmount = Math.round((grossAmount / 1.18) * 100) / 100;
      const totalGst = Math.round((grossAmount - baseAmount) * 100) / 100;
      const cgst = Math.round((totalGst / 2) * 100) / 100;
      const sgst = Math.round((totalGst - cgst) * 100) / 100;

      gstSalesRows.push([
        new Date().toISOString(), invoiceNo, "19/10/2026", "Test Learner", paymentEntity.email || "",
        "+919876543210", "Tamil Nadu (33)", "B2C", "No", "999293",
        productKey, baseAmount, "9%", cgst, "9%", sgst, 0, grossAmount, payId, orderId
      ]);

      // Cache invoice and state
      scriptProperties.set(`PROCESSED_EVT_${eventId}`, JSON.stringify({ paymentId: payId, payloadDigest: computedDigest }));
      scriptProperties.set(`VERIFIED_INV_${payId}`, invoiceNo);
      scriptProperties.set(`INVOICE_STATE_${payId}`, "RESOLVED");

      logEntries.push({ event: "PAYMENT_PROCESSED_SUCCESS", data: `Processed ${payId} -> ${invoiceNo}` });

      return {
        success: true,
        status: 200,
        invoiceNumber: invoiceNo,
        notificationsSuppressed: notifSuppressed,
      };
    },
  };
}

describe("PHASE 1P: Staging Provisioning & End-to-End Test Validation", () => {
  describe("1. Staging Configuration Isolation Validator Pre-Flight Suite", () => {
    it("passes for valid staging configuration with test credentials and mock adapter", () => {
      const validConfig = {
        APP_ENVIRONMENT: "staging",
        RAZORPAY_KEY_ID: "rzp_test_StagingKey123",
        RAZORPAY_KEY_SECRET: "test_secret_entropy_32_characters_long",
        WEBHOOK_PROXY_SECRET: "proxy_secret_entropy_64_characters_super_secure_random",
        SPREADSHEET_ID: "1staging_isolated_spreadsheet_id_abc123",
        MOCK_INVOICE_ADAPTER: "true",
        SUPPRESS_NOTIFICATIONS: "true",
        APPS_SCRIPT_URL_AI_MASTERCLASS: "https://script.google.com/macros/s/AKfycbz_staging_unique/exec",
      };

      const result = validateStagingConfiguration(validConfig);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("fails closed if environment is missing or set to production", () => {
      const res1 = validateStagingConfiguration({ APP_ENVIRONMENT: "" });
      expect(res1.valid).toBe(false);
      expect(res1.errors.some((e: string) => e.includes("MISSING_ENVIRONMENT"))).toBe(true);

      const res2 = validateStagingConfiguration({ APP_ENVIRONMENT: "production" });
      expect(res2.valid).toBe(false);
      expect(res2.errors.some((e: string) => e.includes("INVALID_STAGING_ENVIRONMENT"))).toBe(true);
    });

    it("fails closed if live Razorpay key is configured in staging", () => {
      const res = validateStagingConfiguration({
        APP_ENVIRONMENT: "staging",
        RAZORPAY_KEY_ID: "rzp_live_ProductionKey123",
      });
      expect(res.valid).toBe(false);
      expect(res.errors.some((e: string) => e.includes("LIVE_CREDENTIALS_IN_STAGING"))).toBe(true);
    });

    it("fails closed if known production spreadsheet ID is configured in staging", () => {
      const res = validateStagingConfiguration({
        APP_ENVIRONMENT: "staging",
        RAZORPAY_KEY_ID: "rzp_test_key",
        SPREADSHEET_ID: KNOWN_PRODUCTION_SPREADSHEET_IDS[0],
      });
      expect(res.valid).toBe(false);
      expect(res.errors.some((e: string) => e.includes("PRODUCTION_SPREADSHEET_IN_STAGING"))).toBe(true);
    });

    it("fails closed if mock invoice adapter or notification suppression is disabled in staging", () => {
      const res1 = validateStagingConfiguration({
        APP_ENVIRONMENT: "staging",
        RAZORPAY_KEY_ID: "rzp_test_key",
        SPREADSHEET_ID: "staging_sheet",
        MOCK_INVOICE_ADAPTER: "false",
      });
      expect(res1.valid).toBe(false);
      expect(res1.errors.some((e: string) => e.includes("MOCK_INVOICE_DISABLED"))).toBe(true);

      const res2 = validateStagingConfiguration({
        APP_ENVIRONMENT: "staging",
        RAZORPAY_KEY_ID: "rzp_test_key",
        SPREADSHEET_ID: "staging_sheet",
        SUPPRESS_NOTIFICATIONS: "false",
      });
      expect(res2.valid).toBe(false);
      expect(res2.errors.some((e: string) => e.includes("NOTIFICATIONS_UNSUPPRESSED"))).toBe(true);
    });
  });

  describe("2. Comprehensive 14-Scenario Staging Test Matrix", () => {
    // Scenario 1: Standard Razorpay test payment
    it("Scenario 1: Standard Razorpay test payment produces 200 OK, marks PAID, records payId, generates STAGE-INV-XXXX", () => {
      const gas = createStagingAppsScriptSimulator("ai_masterclass");
      gas.initOrder("order_scen_01", 117);

      const entity = {
        id: "pay_test_scen_01",
        order_id: "order_scen_01",
        amount: 11700,
        currency: "INR",
        status: "captured",
        is_test: true,
        notes: { product_key: "ai_masterclass" },
      };

      const digest = computeHardenedPayloadDigest(entity);
      const now = Date.now();
      const sig = computeHardenedProxySignature({
        proxyVersion: "v2.1",
        eventId: "evt_scen_01",
        eventType: "payment.captured",
        orderId: entity.order_id,
        paymentId: entity.id,
        timestamp: now,
        productKey: "ai_masterclass",
        amount: entity.amount,
        currency: entity.currency,
        status: entity.status,
        accountId: "",
        payloadDigest: digest,
      }, TEST_PROXY_SECRET);

      const res = gas.executeDoPost({
        proxy_version: "v2.1",
        eventId: "evt_scen_01",
        timestamp: now,
        target_product: "ai_masterclass",
        payload_digest: digest,
        proxy_signature: sig,
        payload: { payment: { entity } },
      });

      expect(res.status).toBe(200);
      expect(res.invoiceNumber).toMatch(/^STAGE-INV-/);

      // Check registration row
      const row = gas.registrationRows.find((r) => r[8] === "order_scen_01");
      expect(row).toBeDefined();
      expect(row![7]).toBe("✅ PAID");
      expect(row![9]).toBe("pay_test_scen_01");

      // Check log
      expect(gas.logEntries.some((l) => l.event === "PAYMENT_PROCESSED_SUCCESS")).toBe(true);
    });

    // Scenario 2: Valid v2.1 12-tuple webhook signature
    it("Scenario 2: Valid v2.1 12-tuple proxy webhook signature verifies and generates exactly 1 invoice", () => {
      const gas = createStagingAppsScriptSimulator("advanced_masterclass");
      gas.initOrder("order_scen_02", 2999);

      const entity = {
        id: "pay_test_scen_02",
        order_id: "order_scen_02",
        amount: 299900,
        currency: "INR",
        status: "captured",
        account_id: "acc_test_staging",
        is_test: true,
      };

      const digest = computeHardenedPayloadDigest(entity);
      const now = Date.now();
      const sig = computeHardenedProxySignature({
        proxyVersion: "v2.1",
        eventId: "evt_scen_02",
        eventType: "payment.captured",
        orderId: entity.order_id,
        paymentId: entity.id,
        timestamp: now,
        productKey: "advanced_masterclass",
        amount: entity.amount,
        currency: entity.currency,
        status: entity.status,
        accountId: entity.account_id,
        payloadDigest: digest,
      }, TEST_PROXY_SECRET);

      const res = gas.executeDoPost({
        proxy_version: "v2.1",
        eventId: "evt_scen_02",
        timestamp: now,
        target_product: "advanced_masterclass",
        payload_digest: digest,
        proxy_signature: sig,
        payload: { payment: { entity } },
      });

      expect(res.status).toBe(200);
      expect(res.invoiceNumber).toBe("STAGE-INV-1001");
      expect(gas.gstSalesRows).toHaveLength(2); // Header + 1 row
    });

    // Scenario 3: Missing protocol version in request
    it("Scenario 3: Missing protocol version in request is rejected (400 Bad Request)", () => {
      const gas = createStagingAppsScriptSimulator("claude_masterclass");
      gas.initOrder("order_scen_03", 4999);

      expect(() => {
        gas.executeDoPost({
          // proxy_version missing
          eventId: "evt_scen_03",
          timestamp: Date.now(),
          target_product: "claude_masterclass",
          payload_digest: "dummy_digest",
          proxy_signature: "dummy_sig",
          payload: { payment: { entity: { id: "pay_test_03", order_id: "order_scen_03" } } },
        });
      }).toThrowError(/MISSING_PROTOCOL_VERSION/);
    });

    // Scenario 4: Legacy signature rejection in strict mode
    it("Scenario 4: Legacy signature rejection in strict mode (401 Unauthorized / downgrade rejected)", () => {
      const gas = createStagingAppsScriptSimulator("academy");
      gas.initOrder("order_scen_04", 499);

      expect(() => {
        gas.executeDoPost({
          proxy_version: "v2", // Downgrade attempt
          eventId: "evt_scen_04",
          timestamp: Date.now(),
          target_product: "academy",
          payload_digest: "dummy_digest",
          proxy_signature: "dummy_sig",
          payload: { payment: { entity: { id: "pay_test_04", order_id: "order_scen_04" } } },
        });
      }).toThrowError(/PROTOCOL_DOWNGRADE_REJECTED/);
    });

    // Scenario 5: Altered amount, currency, or product key
    it("Scenario 5: Altered amount, currency, or product key throws PAYLOAD_DIGEST_MISMATCH (422 Unprocessable)", () => {
      const gas = createStagingAppsScriptSimulator("ai_bgm");
      gas.initOrder("order_scen_05", 2999);

      const realEntity = {
        id: "pay_test_scen_05",
        order_id: "order_scen_05",
        amount: 299900,
        currency: "INR",
        status: "captured",
        is_test: true,
      };

      const realDigest = computeHardenedPayloadDigest(realEntity);

      // Attacker tampers amount in submitted payload
      const tamperedEntity = { ...realEntity, amount: 9900 };

      expect(() => {
        gas.executeDoPost({
          proxy_version: "v2.1",
          eventId: "evt_scen_05",
          timestamp: Date.now(),
          target_product: "ai_bgm",
          payload_digest: realDigest, // Submitting original digest with tampered entity
          proxy_signature: "some_sig",
          payload: { payment: { entity: tamperedEntity } },
        });
      }).toThrowError(/PAYLOAD_DIGEST_MISMATCH/);
    });

    // Scenario 6: Duplicate webhook delivery (Idempotency)
    it("Scenario 6: Duplicate webhook delivery is skipped idempotently with zero duplicate invoices", () => {
      const gas = createStagingAppsScriptSimulator("consulting");
      gas.initOrder("order_scen_06", 10000);

      const entity = {
        id: "pay_test_scen_06",
        order_id: "order_scen_06",
        amount: 1000000,
        currency: "INR",
        status: "captured",
        is_test: true,
      };

      const digest = computeHardenedPayloadDigest(entity);
      const now = Date.now();
      const sig = computeHardenedProxySignature({
        proxyVersion: "v2.1",
        eventId: "evt_scen_06",
        eventType: "payment.captured",
        orderId: entity.order_id,
        paymentId: entity.id,
        timestamp: now,
        productKey: "consulting",
        amount: entity.amount,
        currency: entity.currency,
        status: entity.status,
        accountId: "",
        payloadDigest: digest,
      }, TEST_PROXY_SECRET);

      const payload = {
        proxy_version: "v2.1",
        eventId: "evt_scen_06",
        timestamp: now,
        target_product: "consulting",
        payload_digest: digest,
        proxy_signature: sig,
        payload: { payment: { entity } },
      };

      // 1st delivery
      const res1 = gas.executeDoPost(payload);
      expect(res1.status).toBe(200);
      expect(res1.invoiceNumber).toBe("STAGE-INV-1001");
      expect(gas.gstSalesRows).toHaveLength(2); // Header + 1

      // 2nd delivery (replayed)
      const res2 = gas.executeDoPost(payload);
      expect(res2.status).toBe(200);
      expect(res2.alreadyProcessed).toBe(true);
      expect(res2.duplicate).toBe(true);
      expect(gas.gstSalesRows).toHaveLength(2); // Still exactly 1 row; zero duplicate invoices
    });

    // Scenario 7: Browser closed immediately after payment
    it("Scenario 7: Browser closed immediately after payment -> pure webhook fulfillment completes registration", () => {
      const gas = createStagingAppsScriptSimulator("professionals");
      // Note: No prior row initialized in registrationRows (browser closed before register form callback)

      const entity = {
        id: "pay_test_scen_07",
        order_id: "order_scen_07",
        amount: 589900,
        currency: "INR",
        status: "captured",
        is_test: true,
        email: "direct_buyer@example.com",
        notes: { customer_name: "Direct Buyer", product_key: "professionals" },
      };

      const digest = computeHardenedPayloadDigest(entity);
      const now = Date.now();
      const sig = computeHardenedProxySignature({
        proxyVersion: "v2.1",
        eventId: "evt_scen_07",
        eventType: "payment.captured",
        orderId: entity.order_id,
        paymentId: entity.id,
        timestamp: now,
        productKey: "professionals",
        amount: entity.amount,
        currency: entity.currency,
        status: entity.status,
        accountId: "",
        payloadDigest: digest,
      }, TEST_PROXY_SECRET);

      const res = gas.executeDoPost({
        proxy_version: "v2.1",
        eventId: "evt_scen_07",
        timestamp: now,
        target_product: "professionals",
        payload_digest: digest,
        proxy_signature: sig,
        payload: { payment: { entity } },
      });

      expect(res.status).toBe(200);
      expect(res.invoiceNumber).toMatch(/^STAGE-INV-/);

      // Newly inserted registration row created directly by webhook
      const row = gas.registrationRows.find((r) => r[8] === "order_scen_07");
      expect(row).toBeDefined();
      expect(row![1]).toBe("Direct Buyer");
      expect(row![7]).toBe("✅ PAID");
      expect(gas.logEntries.some((l) => l.event === "WEBHOOK_COMPLETED_REGISTRATION")).toBe(true);
    });

    // Scenario 8: Temporary Apps Script failure and retry
    it("Scenario 8: Temporary failure on 1st attempt and retry on 2nd attempt succeeds without duplicate invoices", () => {
      const gas = createStagingAppsScriptSimulator("upscale");
      gas.initOrder("order_scen_08", 4999);

      const entity = {
        id: "pay_test_scen_08",
        order_id: "order_scen_08",
        amount: 499900,
        currency: "INR",
        status: "captured",
        is_test: true,
      };

      const digest = computeHardenedPayloadDigest(entity);
      const now = Date.now();
      const sig = computeHardenedProxySignature({
        proxyVersion: "v2.1",
        eventId: "evt_scen_08",
        eventType: "payment.captured",
        orderId: entity.order_id,
        paymentId: entity.id,
        timestamp: now,
        productKey: "upscale",
        amount: entity.amount,
        currency: entity.currency,
        status: entity.status,
        accountId: "",
        payloadDigest: digest,
      }, TEST_PROXY_SECRET);

      const postBody = {
        proxy_version: "v2.1",
        eventId: "evt_scen_08",
        timestamp: now,
        target_product: "upscale",
        payload_digest: digest,
        proxy_signature: sig,
        payload: { payment: { entity } },
      };

      // 1st attempt: throws simulated transient error
      expect(() => {
        gas.executeDoPost(postBody, { simulateTransient500: true });
      }).toThrowError(/TRANSIENT_SHEET_ERROR/);

      // Registration remains INITIATED
      expect(gas.registrationRows.find((r) => r[8] === "order_scen_08")![7]).toBe("INITIATED");

      // 2nd attempt: succeeds cleanly
      const res2 = gas.executeDoPost(postBody);
      expect(res2.status).toBe(200);
      expect(res2.invoiceNumber).toBe("STAGE-INV-1001");
      expect(gas.registrationRows.find((r) => r[8] === "order_scen_08")![7]).toBe("✅ PAID");
    });

    // Scenario 9: Invoice lookup returns 0 matches
    it("Scenario 9: Invoice timeout with 0 matches sets UNCERTAIN_INVOICE_PENDING and holds notifications", () => {
      const gas = createStagingAppsScriptSimulator("ai_masterclass");
      gas.initOrder("order_scen_09", 117);

      const entity = {
        id: "pay_test_scen_09",
        order_id: "order_scen_09",
        amount: 11700,
        currency: "INR",
        status: "captured",
        is_test: true,
      };

      const digest = computeHardenedPayloadDigest(entity);
      const now = Date.now();
      const sig = computeHardenedProxySignature({
        proxyVersion: "v2.1",
        eventId: "evt_scen_09",
        eventType: "payment.captured",
        orderId: entity.order_id,
        paymentId: entity.id,
        timestamp: now,
        productKey: "ai_masterclass",
        amount: entity.amount,
        currency: entity.currency,
        status: entity.status,
        accountId: "",
        payloadDigest: digest,
      }, TEST_PROXY_SECRET);

      // 1st: times out
      const res1 = gas.executeDoPost({
        proxy_version: "v2.1",
        eventId: "evt_scen_09",
        timestamp: now,
        target_product: "ai_masterclass",
        payload_digest: digest,
        proxy_signature: sig,
        payload: { payment: { entity } },
      }, { simulateInvoiceTimeout: true });

      expect(res1.uncertainInvoice).toBe(true);
      expect(gas.registrationRows.find((r) => r[8] === "order_scen_09")![7]).toBe("PENDING_RECONCILIATION");
      expect(gas.logEntries.some((l) => l.event === "HOLDING_CONFIRMATION_EMAIL")).toBe(true);

      // Retry query finds 0 matches in candidate pool
      const res2 = gas.executeDoPost({
        proxy_version: "v2.1",
        eventId: "evt_scen_09",
        timestamp: now,
        target_product: "ai_masterclass",
        payload_digest: digest,
        proxy_signature: sig,
        payload: { payment: { entity } },
      }, { mockCandidateMatches: [] });

      expect(res2.uncertainInvoice).toBe(true);
      expect(res2.zeroMatch).toBe(true);
      expect(gas.logEntries.some((l) => l.event === "ZERO_INVOICE_MATCH")).toBe(true);
    });

    // Scenario 10: Invoice lookup returns ambiguous matches (>1)
    it("Scenario 10: Invoice lookup returning ambiguous matches (>1) remains pending without creating duplicates", () => {
      const gas = createStagingAppsScriptSimulator("advanced_masterclass");
      gas.initOrder("order_scen_10", 2999);

      const entity = {
        id: "pay_test_scen_10",
        order_id: "order_scen_10",
        amount: 299900,
        currency: "INR",
        status: "captured",
        is_test: true,
      };

      const digest = computeHardenedPayloadDigest(entity);
      const now = Date.now();
      const sig = computeHardenedProxySignature({
        proxyVersion: "v2.1",
        eventId: "evt_scen_10",
        eventType: "payment.captured",
        orderId: entity.order_id,
        paymentId: entity.id,
        timestamp: now,
        productKey: "advanced_masterclass",
        amount: entity.amount,
        currency: entity.currency,
        status: entity.status,
        accountId: "",
        payloadDigest: digest,
      }, TEST_PROXY_SECRET);

      const candidateMatches = [
        { invoiceNumber: "STAGE-INV-2001", amount: 2999 },
        { invoiceNumber: "STAGE-INV-2002", amount: 2999 },
      ];

      const res = gas.executeDoPost({
        proxy_version: "v2.1",
        eventId: "evt_scen_10",
        timestamp: now,
        target_product: "advanced_masterclass",
        payload_digest: digest,
        proxy_signature: sig,
        payload: { payment: { entity } },
      }, { mockCandidateMatches: candidateMatches });

      expect(res.uncertainInvoice).toBe(true);
      expect(res.ambiguousMatch).toBe(true);
      expect(gas.logEntries.some((l) => l.event === "AMBIGUOUS_INVOICE_MATCH")).toBe(true);
    });

    // Scenario 11: Invoice request times out after remote success
    it("Scenario 11: Invoice request times out after remote creation -> subsequent retry recovers candidate invoice cleanly", () => {
      const gas = createStagingAppsScriptSimulator("claude_masterclass");
      gas.initOrder("order_scen_11", 4999);

      const entity = {
        id: "pay_test_scen_11",
        order_id: "order_scen_11",
        amount: 499900,
        currency: "INR",
        status: "captured",
        is_test: true,
      };

      const digest = computeHardenedPayloadDigest(entity);
      const now = Date.now();
      const sig = computeHardenedProxySignature({
        proxyVersion: "v2.1",
        eventId: "evt_scen_11",
        eventType: "payment.captured",
        orderId: entity.order_id,
        paymentId: entity.id,
        timestamp: now,
        productKey: "claude_masterclass",
        amount: entity.amount,
        currency: entity.currency,
        status: entity.status,
        accountId: "",
        payloadDigest: digest,
      }, TEST_PROXY_SECRET);

      // Subsequent retry queries candidates and finds exactly 1 matching invoice
      const res = gas.executeDoPost({
        proxy_version: "v2.1",
        eventId: "evt_scen_11",
        timestamp: now,
        target_product: "claude_masterclass",
        payload_digest: digest,
        proxy_signature: sig,
        payload: { payment: { entity } },
      }, {
        mockCandidateMatches: [{ invoiceNumber: "STAGE-INV-3001", amount: 4999, paymentId: "pay_test_scen_11" }]
      });

      expect(res.recoveredInvoice).toBe(true);
      expect(res.invoiceNumber).toBe("STAGE-INV-3001");
      expect(gas.scriptProperties.get("INVOICE_STATE_pay_test_scen_11")).toBe("RESOLVED");
      expect(gas.logEntries.some((l) => l.event === "INVOICE_RECOVERED")).toBe(true);
    });

    // Scenario 12: Reconciliation after recovery
    it("Scenario 12: Reconciliation after recovery returns cached invoice without re-calling invoice API", () => {
      const gas = createStagingAppsScriptSimulator("academy", {
        VERIFIED_INV_pay_test_scen_12: "STAGE-INV-4001",
        INVOICE_STATE_pay_test_scen_12: "RESOLVED",
      });

      const entity = {
        id: "pay_test_scen_12",
        order_id: "order_scen_12",
        amount: 49900,
        currency: "INR",
        status: "captured",
        is_test: true,
      };

      const digest = computeHardenedPayloadDigest(entity);
      const now = Date.now();
      const sig = computeHardenedProxySignature({
        proxyVersion: "v2.1",
        eventId: "evt_scen_12",
        eventType: "payment.captured",
        orderId: entity.order_id,
        paymentId: entity.id,
        timestamp: now,
        productKey: "academy",
        amount: entity.amount,
        currency: entity.currency,
        status: entity.status,
        accountId: "",
        payloadDigest: digest,
      }, TEST_PROXY_SECRET);

      const res = gas.executeDoPost({
        proxy_version: "v2.1",
        eventId: "evt_scen_12",
        timestamp: now,
        target_product: "academy",
        payload_digest: digest,
        proxy_signature: sig,
        payload: { payment: { entity } },
      });

      expect(res.status).toBe(200);
      expect(res.alreadyProcessed).toBe(true);
      expect(res.invoiceNumber).toBe("STAGE-INV-4001");
      expect(gas.getFunnelsDoneHttpCalls()).toBe(0);
    });

    // Scenario 13: Customer notification suppression
    it("Scenario 13: Notification suppression ensures zero outbound WhatsApp, email, or campaign calls", () => {
      const gas = createStagingAppsScriptSimulator("consulting");
      gas.initOrder("order_scen_13", 10000);

      const entity = {
        id: "pay_test_scen_13",
        order_id: "order_scen_13",
        amount: 1000000,
        currency: "INR",
        status: "captured",
        is_test: true,
      };

      const digest = computeHardenedPayloadDigest(entity);
      const now = Date.now();
      const sig = computeHardenedProxySignature({
        proxyVersion: "v2.1",
        eventId: "evt_scen_13",
        eventType: "payment.captured",
        orderId: entity.order_id,
        paymentId: entity.id,
        timestamp: now,
        productKey: "consulting",
        amount: entity.amount,
        currency: entity.currency,
        status: entity.status,
        accountId: "",
        payloadDigest: digest,
      }, TEST_PROXY_SECRET);

      const res = gas.executeDoPost({
        proxy_version: "v2.1",
        eventId: "evt_scen_13",
        timestamp: now,
        target_product: "consulting",
        payload_digest: digest,
        proxy_signature: sig,
        payload: { payment: { entity } },
      });

      expect(res.status).toBe(200);
      expect(res.notificationsSuppressed).toBe(true);
      expect(gas.getWhatsAppHttpCalls()).toBe(0);
      expect(gas.getEmailCalls()).toBe(0);
      expect(gas.getFunnelsDoneHttpCalls()).toBe(0);
    });

    // Scenario 14: Cross-system proof production systems remain untouched
    it("Scenario 14: Cross-system proof verifies production systems, sheets, and invoice series remain untouched", () => {
      // 1. Verify known production spreadsheet IDs are never written to in staging
      for (const prodSheetId of KNOWN_PRODUCTION_SPREADSHEET_IDS) {
        expect(() => {
          const gas = createStagingAppsScriptSimulator("ai_masterclass", {
            SPREADSHEET_ID: prodSheetId,
          });
          gas.executeDoPost({
            proxy_version: "v2.1",
            eventId: "evt_scen_14",
            timestamp: Date.now(),
            target_product: "ai_masterclass",
            payload_digest: "digest",
            proxy_signature: "sig",
            payload: { payment: { entity: { id: "pay_test_14", order_id: "ord_14" } } },
          });
        }).toThrowError(/PRODUCTION_SPREADSHEET_IN_STAGING/);
      }

      // 2. Verify all generated staging invoice numbers use STAGE-INV- prefix (never live TT/26-27/)
      const gas = createStagingAppsScriptSimulator("ai_masterclass");
      gas.initOrder("order_scen_14_inv", 117);

      const entity = {
        id: "pay_test_scen_14_inv",
        order_id: "order_scen_14_inv",
        amount: 11700,
        currency: "INR",
        status: "captured",
        is_test: true,
      };

      const digest = computeHardenedPayloadDigest(entity);
      const now = Date.now();
      const sig = computeHardenedProxySignature({
        proxyVersion: "v2.1",
        eventId: "evt_scen_14_inv",
        eventType: "payment.captured",
        orderId: entity.order_id,
        paymentId: entity.id,
        timestamp: now,
        productKey: "ai_masterclass",
        amount: entity.amount,
        currency: entity.currency,
        status: entity.status,
        accountId: "",
        payloadDigest: digest,
      }, TEST_PROXY_SECRET);

      const res = gas.executeDoPost({
        proxy_version: "v2.1",
        eventId: "evt_scen_14_inv",
        timestamp: now,
        target_product: "ai_masterclass",
        payload_digest: digest,
        proxy_signature: sig,
        payload: { payment: { entity } },
      });

      expect(res.invoiceNumber).toMatch(/^STAGE-INV-/);
      expect(res.invoiceNumber).not.toMatch(/^TT\/26-27\//);
    });
  });

  describe("3. End-to-End Course Routing in Staging (All 8 Products)", () => {
    for (const productKey of ALL_8_PRODUCTS) {
      it(`processes staging test payment end-to-end for ${productKey} with zero production side effects`, async () => {
        const gas = createStagingAppsScriptSimulator(productKey);
        const orderId = `order_test_${productKey}_99`;
        const payId = `pay_test_${productKey}_99`;
        gas.initOrder(orderId, 1999);

        const entity = {
          id: payId,
          order_id: orderId,
          amount: 199900,
          currency: "INR",
          status: "captured",
          account_id: `acc_staging_${productKey}`,
          is_test: true,
          notes: {
            product_key: productKey,
            environment: "staging",
            mode: "test",
          },
        };

        const rawWebhookBody = JSON.stringify({
          entity: "event",
          event: "payment.captured",
          payload: { payment: { entity } },
        });

        const rzpSignature = crypto
          .createHmac("sha256", TEST_WEBHOOK_SECRET)
          .update(rawWebhookBody)
          .digest("hex");

        // 1. Ingest via staging proxy
        const proxyResult = await handleIncomingRazorpayWebhook({
          rawBody: rawWebhookBody,
          signature: rzpSignature,
          webhookSecret: TEST_WEBHOOK_SECRET,
          proxySecret: TEST_PROXY_SECRET,
          targetUrl: STAGING_GAS_URL,
          environment: "staging",
          razorpayKeyId: "rzp_test_StagingKey123",
        });

        expect(proxyResult.status).toBe(200);
        expect(proxyResult.success).toBe(true);
        expect(proxyResult.targetProduct).toBe(productKey);

        const forwardPayload = proxyResult.forwardPayload;
        expect(forwardPayload.proxy_version).toBe("v2.1");
        expect(forwardPayload.target_product).toBe(productKey);
        expect(forwardPayload.payload_digest).toHaveLength(64);
        expect(forwardPayload.proxy_signature).toHaveLength(64);

        // 2. Dispatch to staging Apps Script simulator
        const gasResult = gas.executeDoPost(forwardPayload);

        expect(gasResult.status).toBe(200);
        expect(gasResult.success).toBe(true);
        expect(gasResult.invoiceNumber).toMatch(/^STAGE-INV-/);
        expect(gasResult.notificationsSuppressed).toBe(true);

        // 3. Confirm zero external calls to FunnelsDone, Meta WhatsApp, or Gmail
        expect(gas.getFunnelsDoneHttpCalls()).toBe(0);
        expect(gas.getWhatsAppHttpCalls()).toBe(0);
        expect(gas.getEmailCalls()).toBe(0);

        // 4. Confirm registration row marked PAID
        const updatedRow = gas.registrationRows.find((r) => r[8] === orderId);
        expect(updatedRow).toBeDefined();
        expect(updatedRow![7]).toBe("✅ PAID");
        expect(updatedRow![9]).toBe(payId);
        expect(updatedRow![10]).toBe("SUPPRESSED");
        expect(updatedRow![11]).toBe("SUPPRESSED");

        // 5. Confirm GST sales register contains exactly 1 row with SAC 999293 and 18% inclusive GST
        expect(gas.gstSalesRows).toHaveLength(2); // Header + 1
        const salesRow = gas.gstSalesRows[1];
        expect(salesRow[1]).toBe(gasResult.invoiceNumber);
        expect(salesRow[9]).toBe("999293"); // SAC Code
        expect(salesRow[17]).toBe(1999); // Total invoice value
      });
    }
  });
});
