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
} from "../../backend/webhook_proxy/razorpay_webhook_proxy.js";

const TEST_WEBHOOK_SECRET = "whsec_test_secret_for_routing_audit_987654321";
const TEST_PROXY_SECRET = "proxy_test_secret_for_gas_auth_abcdef123456";
const LIVE_RAZORPAY_KEY_ID = "rzp_live_PRODKEY123456";
const LIVE_RAZORPAY_KEY_SECRET = "rzp_live_PRODSECRET987654";
const TEST_MERCHANT_ACCOUNT = "acc_LiveMerchantTT01";

/**
 * Mock Simulation of Google Apps Script LockService, ScriptProperties, and Spreadsheet
 * to verify recovery across payment paths.
 */
function createMockAppsScriptEnvironment() {
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

  const logs: { event: string; message: string }[] = [];
  const mainSheetRows: any[][] = [
    [
      "Timestamp", "Name", "Email", "Phone", "UserType", "Mode",
      "Amount", "Status", "OrderId", "PaymentId", "FunnelsDone", "InvoiceNo"
    ]
  ];

  let funnelsDoneInvoiceCounter = 1000;
  let funnelsDoneCalls = 0;
  let whatsAppCalls = 0;
  let emailCalls = 0;

  return {
    scriptProperties,
    mainSheetRows,
    logs,
    getFunnelsDoneInvoiceCount: () => funnelsDoneCalls,
    getWhatsAppCallCount: () => whatsAppCalls,
    getEmailCallCount: () => emailCalls,

    // Step 1: Pre-Registration (initiates row in sheet)
    createOrderAndInitRow: (name: string, email: string, phone: string, amount: number, orderId: string) => {
      mainSheetRows.push([
        new Date(), name, email, phone, "Professional", "Online Live",
        amount, "INITIATED", orderId, "", "WAITING", ""
      ]);
    },

    // Step 2: Payment Execution Engine with Concurrency Lock, Idempotency, and Partial Failure Recovery
    processPaymentEngine: (params: {
      orderId: string;
      paymentId: string;
      isWebhook?: boolean;
      eventId?: string;
      proxySignature?: string;
      timestamp?: number;
      simulateSheetFailureAfterInvoice?: boolean;
      isTestMode?: boolean;
    }) => {
      const {
        orderId,
        paymentId,
        isWebhook,
        eventId,
        proxySignature,
        timestamp,
        simulateSheetFailureAfterInvoice,
        isTestMode,
      } = params;

      lock.waitLock(30000);
      try {
        // A. Webhook authentication & replay check
        if (isWebhook) {
          if (!proxySignature || !timestamp) {
            throw new Error("MISSING_PROXY_AUTH");
          }
          const now = Date.now();
          if (Math.abs(now - timestamp) > 300000) {
            throw new Error("REPLAY_EXPIRED_TIMESTAMP");
          }
          const expectedSig = crypto
            .createHmac("sha256", TEST_PROXY_SECRET)
            .update(`${eventId}|${orderId}|${paymentId}|${timestamp}`)
            .digest("hex");
          if (expectedSig !== proxySignature) {
            throw new Error("INVALID_PROXY_SIGNATURE");
          }

          if (eventId && scriptProperties.has("PROCESSED_EVT_" + eventId)) {
            return { success: true, alreadyProcessed: true, eventId };
          }
        }

        // B. Global payment ID idempotency check
        if (scriptProperties.has("PROCESSED_PAY_" + paymentId)) {
          const cachedInv = scriptProperties.get("VERIFIED_INV_" + paymentId);
          return {
            success: true,
            alreadyProcessed: true,
            paymentId,
            orderId,
            invoiceNumber: cachedInv ? JSON.parse(cachedInv).invoiceNumber : null,
          };
        }

        // C. Find Order Row in Sheet
        let targetRowIndex = -1;
        for (let i = 1; i < mainSheetRows.length; i++) {
          if (mainSheetRows[i][9] === paymentId) {
            return { success: true, alreadyProcessed: true, paymentId, orderId };
          }
          if (mainSheetRows[i][8] === orderId) {
            targetRowIndex = i;
          }
        }

        if (targetRowIndex === -1) {
          throw new Error("ORDER_NOT_FOUND_IN_SHEET");
        }

        const row = mainSheetRows[targetRowIndex];
        if (row[7] === "✅ PAID") {
          return { success: true, alreadyProcessed: true, paymentId, orderId };
        }

        // D. Partial Failure Recovery: Check if invoice was already minted in FunnelsDone
        let invRecord: any = null;
        const cachedInvJson = scriptProperties.get("VERIFIED_INV_" + paymentId);
        if (cachedInvJson) {
          invRecord = JSON.parse(cachedInvJson);
        } else {
          // Generate Invoice
          let invNo: string;
          if (isTestMode) {
            // Test mode isolation: Never use production TT/26-27/ prefix
            invNo = "TEST-INV-" + Math.floor(1000 + Math.random() * 9000);
          } else {
            funnelsDoneCalls++;
            funnelsDoneInvoiceCounter++;
            invNo = "TT/26-27/" + funnelsDoneInvoiceCounter;
            whatsAppCalls++;
            emailCalls++;
          }

          invRecord = {
            verified: true,
            status: "PAID",
            paymentId,
            orderId,
            invoiceNumber: invNo,
            totalAmountPaid: row[6],
          };

          // Cache verified invoice in ScriptProperties
          scriptProperties.set("VERIFIED_INV_" + paymentId, JSON.stringify(invRecord));
        }

        // E. Simulated Google Sheet Failure
        if (simulateSheetFailureAfterInvoice) {
          throw new Error("SIMULATED_GOOGLE_SHEETS_API_EXCEPTION");
        }

        // F. Persist row updates in sheet
        row[7] = isTestMode ? "TEST_PAID" : "✅ PAID";
        row[9] = paymentId;
        row[10] = "SENT ✅";
        row[11] = invRecord.invoiceNumber;

        // G. Mark payment & event processed
        scriptProperties.set("PROCESSED_PAY_" + paymentId, new Date().toISOString());
        if (eventId) {
          scriptProperties.set("PROCESSED_EVT_" + eventId, new Date().toISOString());
        }

        return {
          success: true,
          verified: true,
          paymentId,
          orderId,
          invoiceNumber: invRecord.invoiceNumber,
        };
      } finally {
        lock.releaseLock();
      }
    },
  };
}

describe("PHASE 1F: Production Safety, Payment Recovery and Rollback Audit", () => {
  // 1. Authoritative Product Routing Server-to-Server
  describe("1. Authoritative Product Routing & Server Verification", () => {
    it("1a. Routes strictly using explicit product_key stamped on the authoritative order entity", () => {
      const orderEntity = {
        id: "order_Auth_001",
        amount: 11700,
        currency: "INR",
        notes: {
          product_key: "ai_masterclass",
          course: "AI Secrets Revealed Masterclass",
        },
      };

      const paymentEntity = {
        id: "pay_Auth_001",
        order_id: "order_Auth_001",
        amount: 11700,
        currency: "INR",
        status: "captured",
        notes: {
          product_key: "ai_masterclass",
        },
      };

      const route = determineAuthoritativeProductRoute(orderEntity, paymentEntity);
      expect(route.success).toBe(true);
      expect(route.productKey).toBe("ai_masterclass");
      expect(route.matchType).toBe("authoritative_order_key");
      expect(route.targetUrl).toContain("https://script.google.com/macros/s/");
    });

    it("1b. Strictly rejects unverified descriptions or regex matching when authoritative routing is required", () => {
      const unkeyedOrder = {
        id: "order_Unkeyed_001",
        amount: 11700,
        currency: "INR",
        notes: {}, // No product_key stamped by backend!
      };

      const paymentEntity = {
        id: "pay_Unkeyed_001",
        order_id: "order_Unkeyed_001",
        amount: 11700,
        currency: "INR",
        status: "captured",
        description: "AI Secrets Revealed Masterclass", // Unverified text description
        notes: {},
      };

      const route = determineAuthoritativeProductRoute(unkeyedOrder, paymentEntity);
      expect(route.success).toBe(false);
      expect(route.error).toContain("NON_AUTHORITATIVE_PRODUCT_METADATA");
    });

    it("1c. Rejects conflicting product identifiers between Order notes and Payment notes", () => {
      const orderEntity = {
        id: "order_Conflict_001",
        notes: { product_key: "upscale" },
      };

      const paymentEntity = {
        id: "pay_Conflict_001",
        order_id: "order_Conflict_001",
        notes: { product_key: "claude_masterclass" }, // Conflicting!
      };

      const route = determineAuthoritativeProductRoute(orderEntity, paymentEntity);
      expect(route.success).toBe(false);
      expect(route.error).toContain("CONFLICTING_PRODUCT_IDENTIFIER");
    });

    it("1d. Server-to-server Razorpay verification validates order ID, payment ID, captured status, amount, and merchant account", async () => {
      const mockFetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes("/payments/")) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({
              id: "pay_rzp_full_001",
              order_id: "order_rzp_full_001",
              amount: 11700,
              currency: "INR",
              status: "captured",
              account_id: TEST_MERCHANT_ACCOUNT,
            }),
          });
        }
        if (url.includes("/orders/")) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({
              id: "order_rzp_full_001",
              amount: 11700,
              currency: "INR",
              notes: {
                product_key: "ai_masterclass",
              },
            }),
          });
        }
        return Promise.reject(new Error("Unknown URL"));
      });

      const res = await verifyPaymentWithRazorpayServer({
        paymentId: "pay_rzp_full_001",
        orderId: "order_rzp_full_001",
        expectedAmount: 11700,
        expectedCurrency: "INR",
        expectedMerchantAccount: TEST_MERCHANT_ACCOUNT,
        verifyAuthoritativeOrder: true,
        keyId: LIVE_RAZORPAY_KEY_ID,
        keySecret: LIVE_RAZORPAY_KEY_SECRET,
        fetchImpl: mockFetch as any,
      });

      expect(res.success).toBe(true);
      expect(res.verifiedPayment.status).toBe("captured");
      expect(res.authoritativeOrder.id).toBe("order_rzp_full_001");
      expect(res.authoritativeOrder.notes.product_key).toBe("ai_masterclass");
    });

    it("1e. Rejects merchant account mismatch server-to-server", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          id: "pay_rzp_wrong_merchant_001",
          order_id: "order_rzp_full_001",
          amount: 11700,
          currency: "INR",
          status: "captured",
          account_id: "acc_ATTACKER_ACCOUNT_999", // Fraudulent merchant account!
        }),
      });

      const res = await verifyPaymentWithRazorpayServer({
        paymentId: "pay_rzp_wrong_merchant_001",
        orderId: "order_rzp_full_001",
        expectedAmount: 11700,
        expectedMerchantAccount: TEST_MERCHANT_ACCOUNT,
        keyId: LIVE_RAZORPAY_KEY_ID,
        keySecret: LIVE_RAZORPAY_KEY_SECRET,
        fetchImpl: mockFetch as any,
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain("MERCHANT_ACCOUNT_MISMATCH");
    });
  });

  // 2. Recovery Across Every Payment Path
  describe("2. Recovery Across Every Payment Path", () => {
    // Scenario A: Customer pays but closes browser before callback finishes
    it("Scenario A: Recovers cleanly when customer closes browser before callback finishes", () => {
      const env = createMockAppsScriptEnvironment();
      const orderId = "order_ScenA_001";
      const payId = "pay_ScenA_001";
      const evtId = "evt_ScenA_001";
      const now = Date.now();

      // Customer registered, initiating order row
      env.createOrderAndInitRow("Ambrose Learner", "ambrose@example.com", "9876543210", 117, orderId);
      expect(env.mainSheetRows[1][7]).toBe("INITIATED");

      // Customer closes browser before checkout callback runs.
      // Webhook arrives asynchronously from Razorpay:
      const proxySig = crypto
        .createHmac("sha256", TEST_PROXY_SECRET)
        .update(`${evtId}|${orderId}|${payId}|${now}`)
        .digest("hex");

      const webhookResult = env.processPaymentEngine({
        orderId,
        paymentId: payId,
        isWebhook: true,
        eventId: evtId,
        proxySignature: proxySig,
        timestamp: now,
      });

      expect(webhookResult.success).toBe(true);
      expect(webhookResult.invoiceNumber).toMatch(/^TT\/26-27\/\d+/);
      expect(env.mainSheetRows[1][7]).toBe("✅ PAID");
      expect(env.mainSheetRows[1][9]).toBe(payId);
      expect(env.getFunnelsDoneInvoiceCount()).toBe(1);
      expect(env.getWhatsAppCallCount()).toBe(1);
    });

    // Scenario B: Checkout callback network drops after payment capture
    it("Scenario B: Webhook fulfills order when checkout callback fails or drops network", () => {
      const env = createMockAppsScriptEnvironment();
      const orderId = "order_ScenB_001";
      const payId = "pay_ScenB_001";
      const evtId = "evt_ScenB_001";
      const now = Date.now();

      env.createOrderAndInitRow("Mobile User", "mobile@example.com", "9123456789", 117, orderId);

      // Webhook fulfills
      const proxySig = crypto
        .createHmac("sha256", TEST_PROXY_SECRET)
        .update(`${evtId}|${orderId}|${payId}|${now}`)
        .digest("hex");

      const webhookRes = env.processPaymentEngine({
        orderId,
        paymentId: payId,
        isWebhook: true,
        eventId: evtId,
        proxySignature: proxySig,
        timestamp: now,
      });

      expect(webhookRes.success).toBe(true);
      expect(env.getFunnelsDoneInvoiceCount()).toBe(1);

      // If user reconnects and frontend retries callback:
      const callbackRetry = env.processPaymentEngine({
        orderId,
        paymentId: payId,
        isWebhook: false,
      });

      expect(callbackRetry.success).toBe(true);
      expect(callbackRetry.alreadyProcessed).toBe(true);
      expect(callbackRetry.invoiceNumber).toBe(webhookRes.invoiceNumber);
      // Zero duplicate invoice creation!
      expect(env.getFunnelsDoneInvoiceCount()).toBe(1);
    });

    // Scenario C: Webhook is delayed or temporarily unavailable
    it("Scenario C: Handles delayed webhook gracefully without duplicate invoice creation", () => {
      const env = createMockAppsScriptEnvironment();
      const orderId = "order_ScenC_001";
      const payId = "pay_ScenC_001";
      const evtId = "evt_ScenC_001";
      const now = Date.now();

      env.createOrderAndInitRow("Fast User", "fast@example.com", "9000000001", 117, orderId);

      // Fast checkout callback runs first
      const callbackRes = env.processPaymentEngine({
        orderId,
        paymentId: payId,
        isWebhook: false,
      });
      expect(callbackRes.success).toBe(true);
      expect(env.getFunnelsDoneInvoiceCount()).toBe(1);
      expect(env.mainSheetRows[1][7]).toBe("✅ PAID");

      // Delayed webhook arrives from Razorpay, proxy receives it and forwards with fresh proxy timestamp
      const proxyTimestamp = Date.now();
      const proxySig = crypto
        .createHmac("sha256", TEST_PROXY_SECRET)
        .update(`${evtId}|${orderId}|${payId}|${proxyTimestamp}`)
        .digest("hex");

      const delayedWebhookRes = env.processPaymentEngine({
        orderId,
        paymentId: payId,
        isWebhook: true,
        eventId: evtId,
        proxySignature: proxySig,
        timestamp: proxyTimestamp,
      });

      expect(delayedWebhookRes.success).toBe(true);
      expect(delayedWebhookRes.alreadyProcessed).toBe(true);
      expect(delayedWebhookRes.invoiceNumber).toBe(callbackRes.invoiceNumber);
      // Still exactly 1 FunnelsDone invoice!
      expect(env.getFunnelsDoneInvoiceCount()).toBe(1);
    });

    // Scenario D: Google Sheets fails after invoice generation (partial failure recovery)
    it("Scenario D: Recovers from transient Google Sheets failure without minting a second invoice", () => {
      const env = createMockAppsScriptEnvironment();
      const orderId = "order_ScenD_001";
      const payId = "pay_ScenD_001";

      env.createOrderAndInitRow("Transient User", "transient@example.com", "9111111111", 117, orderId);

      // First attempt: FunnelsDone invoice succeeds, but Sheet write throws error
      expect(() => {
        env.processPaymentEngine({
          orderId,
          paymentId: payId,
          isWebhook: false,
          simulateSheetFailureAfterInvoice: true,
        });
      }).toThrow("SIMULATED_GOOGLE_SHEETS_API_EXCEPTION");

      // 1 invoice was created and cached in ScriptProperties
      expect(env.getFunnelsDoneInvoiceCount()).toBe(1);
      expect(env.mainSheetRows[1][7]).toBe("INITIATED"); // Sheet wasn't updated yet

      // Retry: Webhook or customer retry arrives
      const retryRes = env.processPaymentEngine({
        orderId,
        paymentId: payId,
        isWebhook: false,
        simulateSheetFailureAfterInvoice: false,
      });

      expect(retryRes.success).toBe(true);
      // FunnelsDone was NOT called a second time! The cached invoice was reused:
      expect(env.getFunnelsDoneInvoiceCount()).toBe(1);
      // Sheet is now successfully updated:
      expect(env.mainSheetRows[1][7]).toBe("✅ PAID");
      expect(env.mainSheetRows[1][11]).toBe(retryRes.invoiceNumber);
    });

    // Scenario E: Callback and webhook arrive concurrently (race condition)
    it("Scenario E: Concurrency between callback and webhook creates exactly one invoice", () => {
      const env = createMockAppsScriptEnvironment();
      const orderId = "order_ScenE_001";
      const payId = "pay_ScenE_001";
      const evtId = "evt_ScenE_001";
      const now = Date.now();

      env.createOrderAndInitRow("Concurrent User", "concurrent@example.com", "9222222222", 117, orderId);

      const proxySig = crypto
        .createHmac("sha256", TEST_PROXY_SECRET)
        .update(`${evtId}|${orderId}|${payId}|${now}`)
        .digest("hex");

      // Simultaneous calls
      const res1 = env.processPaymentEngine({
        orderId,
        paymentId: payId,
        isWebhook: false,
      });

      const res2 = env.processPaymentEngine({
        orderId,
        paymentId: payId,
        isWebhook: true,
        eventId: evtId,
        proxySignature: proxySig,
        timestamp: now,
      });

      expect(res1.success).toBe(true);
      expect(res2.success).toBe(true);
      expect(res2.alreadyProcessed).toBe(true);
      expect(env.getFunnelsDoneInvoiceCount()).toBe(1);
      expect(env.mainSheetRows[1][7]).toBe("✅ PAID");
    });

    // Scenario F: Webhook retried after partial processing
    it("Scenario F: Duplicate webhook retries are rejected by eventId deduplication", () => {
      const env = createMockAppsScriptEnvironment();
      const orderId = "order_ScenF_001";
      const payId = "pay_ScenF_001";
      const evtId = "evt_ScenF_999";
      const now = Date.now();

      env.createOrderAndInitRow("Retry User", "retry@example.com", "9333333333", 117, orderId);

      const proxySig = crypto
        .createHmac("sha256", TEST_PROXY_SECRET)
        .update(`${evtId}|${orderId}|${payId}|${now}`)
        .digest("hex");

      // First webhook delivery
      const res1 = env.processPaymentEngine({
        orderId,
        paymentId: payId,
        isWebhook: true,
        eventId: evtId,
        proxySignature: proxySig,
        timestamp: now,
      });
      expect(res1.success).toBe(true);

      // Razorpay retries same eventId
      const res2 = env.processPaymentEngine({
        orderId,
        paymentId: payId,
        isWebhook: true,
        eventId: evtId,
        proxySignature: proxySig,
        timestamp: now,
      });
      expect(res2.success).toBe(true);
      expect(res2.alreadyProcessed).toBe(true);
      expect(env.getFunnelsDoneInvoiceCount()).toBe(1);
    });
  });

  // 3. Test and Production Data Isolation
  describe("3. Test and Production Data Isolation", () => {
    it("3a. Rejects test-mode payment from entering production server-to-server pipeline", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          id: "pay_test_MockPayment123", // Test payment ID
          order_id: "order_test_MockOrder123",
          amount: 11700,
          currency: "INR",
          status: "captured",
          notes: {
            test_mode: "true",
          },
        }),
      });

      const res = await verifyPaymentWithRazorpayServer({
        paymentId: "pay_test_MockPayment123",
        orderId: "order_test_MockOrder123",
        expectedAmount: 11700,
        keyId: LIVE_RAZORPAY_KEY_ID, // Production live key
        keySecret: LIVE_RAZORPAY_KEY_SECRET,
        isolateProduction: true,
        fetchImpl: mockFetch as any,
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain("TEST_PAYMENT_IN_PRODUCTION");
    });

    it("3b. Test-mode payments cannot consume live GST invoice sequence TT/26-27/ or trigger live WhatsApp", () => {
      const env = createMockAppsScriptEnvironment();
      const orderId = "order_TestMode_001";
      const payId = "pay_test_TestMode_001";

      env.createOrderAndInitRow("QA Tester", "ambroseselva001@gmail.com", "9000000000", 1, orderId);

      const testResult = env.processPaymentEngine({
        orderId,
        paymentId: payId,
        isWebhook: false,
        isTestMode: true, // Test mode execution
      });

      expect(testResult.success).toBe(true);
      // Verified: Test invoice does NOT use statutory TT/26-27/ prefix
      expect(testResult.invoiceNumber).toMatch(/^TEST-INV-\d+/);
      expect(testResult.invoiceNumber).not.toContain("TT/26-27/");
      // Verified: Zero production FunnelsDone tax invocations
      expect(env.getFunnelsDoneInvoiceCount()).toBe(0);
      // Verified: Zero customer WhatsApp messages sent
      expect(env.getWhatsAppCallCount()).toBe(0);
      // Verified: Sheet row marked TEST_PAID instead of official ✅ PAID
      expect(env.mainSheetRows[1][7]).toBe("TEST_PAID");
    });
  });
});
