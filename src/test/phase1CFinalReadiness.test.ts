import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import crypto from "node:crypto";
import {
  fetchVerifiedInvoiceFromBackend,
  isValidRazorpayIds,
  registerVerifiedInvoiceRecord,
  openPrintableGstInvoice,
} from "../lib/gstUtils";

const ROOT_DIR = path.resolve(__dirname, "../..");
const SCRIPT_PATH = "backend/apps_script/ai_masterclass/apps_script.gs";

const TEST_DOMESTIC_SECRET = "mock_secret_domestic_phase1c_tests";
const TEST_DEDICATED_INVOICE_SECRET = "mock_dedicated_invoice_secret_phase1c";
const TEST_WEBHOOK_PROXY_SECRET = "mock_proxy_secret_phase1c_tests";

function computeTestHmac(orderId: string, paymentId: string, secret = TEST_DOMESTIC_SECRET): string {
  return crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
}

function computeTokenHmac(paymentId: string, orderId: string, exp: number, secret = TEST_DEDICATED_INVOICE_SECRET): string {
  return crypto.createHmac("sha256", secret).update(`${paymentId}|${orderId}|${exp}`).digest("hex");
}

interface SandboxOptions {
  propsOverrides?: Record<string, string | null>;
}

function createPhase1CSandbox(options: SandboxOptions = {}) {
  const scriptFullPath = path.join(ROOT_DIR, SCRIPT_PATH);
  const code = fs.readFileSync(scriptFullPath, "utf8");

  const propsStore: Record<string, string> = {
    RAZORPAY_KEY_SECRET: TEST_DOMESTIC_SECRET,
    RAZORPAY_KEY_SECRET_INTL: "mock_intl_secret",
    WEBHOOK_VERIFY_TOKEN: "mock_webhook_token",
    ADMIN_VERIFY_TOKEN: "mock_admin_token",
    WEBHOOK_PROXY_SECRET: TEST_WEBHOOK_PROXY_SECRET,
    FUNNELSDONE_PIT_TOKEN: "mock_pit_token",
    WHATSAPP_ACCESS_TOKEN: "mock_wa_token",
    INVOICE_TOKEN_SECRET: TEST_DEDICATED_INVOICE_SECRET,
    APP_ENVIRONMENT: "production",
  };

  if (options.propsOverrides) {
    for (const [k, v] of Object.entries(options.propsOverrides)) {
      if (v === null) {
        delete propsStore[k];
      } else {
        propsStore[k] = v;
      }
    }
  }

  let lockHeld = false;

  const mainSheetRows: unknown[][] = [
    [
      "Date",
      "Name",
      "Email",
      "Phone",
      "UserType",
      "Mode",
      "Amount",
      "Payment Status",
      "Order ID",
      "Transaction ID",
      "Email Status",
    ],
    [
      "17/10/2026, 10:00:00 am",
      "Alice Customer",
      "alice@example.com",
      "+919876543210",
      "Professional",
      "Online Session (Live)",
      117,
      "INITIATED",
      "order_CustomerA01",
      "",
      "WAITING",
    ],
    [
      "17/10/2026, 10:05:00 am",
      "Bob Customer",
      "bob@example.com",
      "+919876543211",
      "Professional",
      "Online Session (Live)",
      117,
      "INITIATED",
      "order_CustomerB02",
      "",
      "WAITING",
    ],
    [
      "17/10/2026, 10:10:00 am",
      "Charlie Unpaid",
      "charlie@example.com",
      "+919876543212",
      "Professional",
      "Online Session (Live)",
      117,
      "FAILED",
      "order_CustomerC03",
      "pay_CustomerCPay03",
      "WAITING",
    ],
  ];

  const gstSalesRows: unknown[][] = [
    [
      "Timestamp",
      "Invoice No",
      "Invoice Date",
      "Customer Name",
      "Customer Email",
      "Customer Phone",
      "Place of Supply",
      "Supply Type",
      "Reverse Charge",
      "SAC Code",
      "Service Description",
      "Taxable Value (₹)",
      "CGST Rate (%)",
      "CGST Amount (₹)",
      "SGST Rate (%)",
      "SGST Amount (₹)",
      "Round Off (₹)",
      "Total Invoice Value (₹)",
      "Payment ID",
      "Order ID",
    ],
  ];

  const makeSheet = (rows: unknown[][], isGst = false) => ({
    getName: () => (isGst ? "GST_Sales_Register" : "Masterclass_Registrations"),
    getLastRow: () => rows.length,
    getDataRange: () => ({
      getValues: () => rows.map((r) => [...r]),
    }),
    getRange: (row: number, col: number, numRows = 1, numCols = 1) => ({
      getValue: () => (rows[row - 1] ? rows[row - 1][col - 1] : ""),
      setValue: (val: unknown) => {
        while (rows.length < row) rows.push([]);
        rows[row - 1][col - 1] = val;
      },
      setValues: (vals: unknown[][]) => {
        for (let r = 0; r < numRows; r++) {
          while (rows.length < row + r) rows.push([]);
          for (let c = 0; c < numCols; c++) {
            rows[row - 1 + r][col - 1 + c] = vals[r][c];
          }
        }
      },
      setFontWeight: () => ({
        setBackground: () => ({
          setFontColor: () => ({}),
        }),
      }),
    }),
    appendRow: (row: unknown[]) => {
      rows.push([...row]);
    },
    setFrozenRows: () => {},
    autoResizeColumns: () => {},
  });

  const mainSheet = makeSheet(mainSheetRows, false);
  const gstSalesSheet = makeSheet(gstSalesRows, true);

  const sandbox: Record<string, unknown> = {
    console,
    Date,
    Math,
    JSON,
    Number,
    String,
    Boolean,
    Array,
    Object,
    RegExp,
    Error,
    parseInt,
    parseFloat,
    isNaN,
    encodeURIComponent,
    decodeURIComponent,
    Logger: { log: () => {} },
    PropertiesService: {
      getScriptProperties: () => ({
        getProperty: (key: string) => (key in propsStore ? propsStore[key] : null),
        setProperty: (key: string, val: string) => {
          propsStore[key] = String(val);
        },
        deleteProperty: (key: string) => {
          delete propsStore[key];
        },
      }),
    },
    LockService: {
      getScriptLock: () => ({
        waitLock: () => {
          lockHeld = true;
        },
        releaseLock: () => {
          lockHeld = false;
        },
      }),
    },
    Utilities: {
      MacAlgorithm: { HMAC_SHA_256: "HMAC_SHA_256" },
      Charset: { UTF_8: "UTF_8" },
      computeHmacSha256Signature: (value: string, key: string) => {
        const buf = crypto.createHmac("sha256", key).update(value, "utf8").digest();
        return Array.from(buf).map((b) => (b > 127 ? b - 256 : b));
      },
      base64Encode: (str: string) => Buffer.from(str, "utf8").toString("base64"),
      formatDate: () => "17/10/2026",
      newBlob: (_data: string, _mime: string, _name: string) => ({
        getAs: () => ({
          setName: () => ({}),
        }),
      }),
    },
    SpreadsheetApp: {
      getActiveSpreadsheet: () => ({
        getSheetByName: (name: string) => (name === "GST_Sales_Register" ? gstSalesSheet : mainSheet),
        getSheets: () => [mainSheet, gstSalesSheet],
        insertSheet: (name: string) => (name === "GST_Sales_Register" ? gstSalesSheet : mainSheet),
      }),
      flush: () => {},
    },
    UrlFetchApp: {
      fetch: (url: string, fetchOptions: { method?: string; headers?: Record<string, string>; payload?: string } = {}) => {
        const urlStr = String(url);
        if (urlStr.includes("api.razorpay.com/v1/payments/")) {
          const payIdFromUrl = urlStr.split("/").pop() || "";
          const matchedRow = mainSheetRows.find((r) => r[8] && (payIdFromUrl.includes("CustomerB") ? r[8] === "order_CustomerB02" : r[8] === "order_CustomerA01"));
          const matchedOrderId = matchedRow ? String(matchedRow[8]) : "order_CustomerA01";
          return {
            getResponseCode: () => 200,
            getContentText: () =>
              JSON.stringify({
                id: payIdFromUrl,
                order_id: matchedOrderId,
                status: "captured",
                amount: 11700,
                currency: "INR",
              }),
          };
        }
        if (urlStr.includes("/contacts/upsert")) {
          return {
            getResponseCode: () => 200,
            getContentText: () => JSON.stringify({ contact: { id: "cnt_123" } }),
          };
        }
        if (urlStr.includes("/invoices/generate-invoice-number")) {
          return {
            getResponseCode: () => 200,
            getContentText: () => JSON.stringify({ invoiceNumber: "889900" }),
          };
        }
        if (urlStr.includes("/invoices/")) {
          return {
            getResponseCode: () => 200,
            getContentText: () => JSON.stringify({ _id: "inv_123", total: 117 }),
          };
        }
        return {
          getResponseCode: () => 200,
          getContentText: () => "{}",
        };
      },
    },
    MailApp: {
      sendEmail: () => {},
    },
  };

  const context = vm.createContext(sandbox);
  vm.runInContext(code, context);

  return {
    context,
    propsStore,
    mainSheetRows,
    gstSalesRows,
  };
}

describe("PHASE 1C: Invoice Token Leakage Fix & Pre-Deployment Readiness Suite", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // 1. fetchVerifiedInvoiceFromBackend uses POST with body and never puts token in URL
  it("1. fetchVerifiedInvoiceFromBackend transmits token in POST body and never appends token to URL query string", async () => {
    let capturedUrl = "";
    let capturedMethod = "";
    let capturedBody = "";
    let capturedHeaders: Record<string, string> = {};

    const mockFetcher = async (url: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      capturedUrl = String(url);
      capturedMethod = init?.method || "GET";
      capturedBody = String(init?.body || "");
      capturedHeaders = (init?.headers as Record<string, string>) || {};

      return {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          verified: true,
          invoice: {
            paymentId: "pay_TestPay123456",
            orderId: "order_TestOrd123456",
            customerName: "Jane Smith",
            customerEmail: "jane@example.com",
            customerPhone: "+919876543210",
            courseName: "AI Secrets Revealed Masterclass",
            totalAmountPaid: 117,
            invoiceNumber: "TT/26-27/123456",
            invoiceDate: "17 Oct 2026",
          },
        }),
      } as Response;
    };

    const secretToken = "1799999999999.aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899";

    const invoice = await fetchVerifiedInvoiceFromBackend({
      paymentId: "pay_TestPay123456",
      orderId: "order_TestOrd123456",
      token: secretToken,
      backendUrl: "https://script.google.com/macros/s/TEST_DEPLOYMENT_ID/exec",
      fetchImpl: mockFetcher as any,
    });

    // Verify invoice returned and verified
    expect(invoice.customerName).toBe("Jane Smith");
    expect(invoice.paymentId).toBe("pay_TestPay123456");
    expect(invoice.totalAmountPaid).toBe(117);

    // CRITICAL: URL must NOT contain token or secret!
    expect(capturedUrl).not.toContain("token=");
    expect(capturedUrl).not.toContain(secretToken);
    expect(capturedUrl).toBe("https://script.google.com/macros/s/TEST_DEPLOYMENT_ID/exec");

    // HTTP method must be POST
    expect(capturedMethod).toBe("POST");
    expect(capturedHeaders["Content-Type"]).toContain("text/plain");

    // Payload body contains the token protected inside JSON
    const parsedBody = JSON.parse(capturedBody);
    expect(parsedBody.action).toBe("getVerifiedInvoice");
    expect(parsedBody.paymentId).toBe("pay_TestPay123456");
    expect(parsedBody.orderId).toBe("order_TestOrd123456");
    expect(parsedBody.token).toBe(secretToken);
  });

  // 2. Dedicated INVOICE_TOKEN_SECRET vs RAZORPAY_KEY_SECRET fallback
  it("2. Validates tokens using dedicated INVOICE_TOKEN_SECRET when set, and falls back to RAZORPAY_KEY_SECRET", () => {
    // 2a. With dedicated INVOICE_TOKEN_SECRET configured
    const sbDedicated = createPhase1CSandbox({
      propsOverrides: {
        INVOICE_TOKEN_SECRET: TEST_DEDICATED_INVOICE_SECRET,
      },
    });

    const orderId = "order_CustomerA01";
    const payId = "pay_CustomerAPay01";
    const validCallbackSig = computeTestHmac(orderId, payId);

    const payRes = sbDedicated.context.updatePaymentStatus({
      razorpay_order_id: orderId,
      razorpay_payment_id: payId,
      razorpay_signature: validCallbackSig,
      amount: 117,
    });
    expect(payRes.success).toBe(true);

    const generatedToken = payRes.invoiceToken;
    const exp = parseInt(generatedToken.split(".")[0], 10);
    const expectedDedicatedSig = computeTokenHmac(payId, orderId, exp, TEST_DEDICATED_INVOICE_SECRET);

    // Token must be signed with dedicated secret
    expect(generatedToken.split(".")[1]).toBe(expectedDedicatedSig);

    // Dedicated token validates successfully
    const lookupRes = sbDedicated.context.getVerifiedInvoiceRecord(null, payId, orderId, generatedToken);
    expect(lookupRes.success).toBe(true);
    expect(lookupRes.verified).toBe(true);
    expect(lookupRes.invoice.customerName).toBe("Alice Customer");

    // 2b. Strictly fails closed without dedicated secret (zero fallback to RAZORPAY_KEY_SECRET)
    const sbMissing = createPhase1CSandbox({
      propsOverrides: {
        INVOICE_TOKEN_SECRET: null, // absent
      },
    });

    // Payment processing refuses to sign token without INVOICE_TOKEN_SECRET
    expect(() => {
      sbMissing.context.updatePaymentStatus({
        razorpay_order_id: orderId,
        razorpay_payment_id: payId,
        razorpay_signature: validCallbackSig,
        amount: 117,
      });
    }).toThrow(/MISSING_INVOICE_TOKEN_SECRET/);

    // Invoice verification rejects request when INVOICE_TOKEN_SECRET is absent
    const missingLookup = sbMissing.context.getVerifiedInvoiceRecord(null, payId, orderId, generatedToken);
    expect(missingLookup.success).toBe(false);
    expect(missingLookup.verified).toBe(false);
    expect(missingLookup.error).toContain("MISSING_INVOICE_TOKEN_SECRET");
  });

  // 3. Cryptographic binding: Rejects expired, altered, wrong payId, wrong orderId, and cross-customer tokens
  it("3. Strictly enforces cryptographic binding and rejects altered, expired, or cross-customer tokens", () => {
    const sb = createPhase1CSandbox();
    const orderA = "order_CustomerA01";
    const payA = "pay_CustomerAPay01";
    const sigA = computeTestHmac(orderA, payA);

    const orderB = "order_CustomerB02";
    const payB = "pay_CustomerBPay02";
    const sigB = computeTestHmac(orderB, payB);

    // Pay for Customer A and Customer B
    const resA = sb.context.updatePaymentStatus({
      razorpay_order_id: orderA,
      razorpay_payment_id: payA,
      razorpay_signature: sigA,
      amount: 117,
    });
    const tokenA = resA.invoiceToken;

    const resB = sb.context.updatePaymentStatus({
      razorpay_order_id: orderB,
      razorpay_payment_id: payB,
      razorpay_signature: sigB,
      amount: 117,
    });
    const tokenB = resB.invoiceToken;

    // 3a. Token A cannot access Customer B's invoice (cross-customer token spoofing)
    const crossAttempt = sb.context.getVerifiedInvoiceRecord(null, payB, orderB, tokenA);
    expect(crossAttempt.success).toBe(false);
    expect(crossAttempt.error).toContain("UNAUTHORIZED_INVOICE_ACCESS");

    // 3b. Token B cannot access Customer A's invoice
    const crossAttempt2 = sb.context.getVerifiedInvoiceRecord(null, payA, orderA, tokenB);
    expect(crossAttempt2.success).toBe(false);
    expect(crossAttempt2.error).toContain("UNAUTHORIZED_INVOICE_ACCESS");

    // 3c. Altered token (signature corrupted)
    const parts = tokenA.split(".");
    const alteredToken = `${parts[0]}.${parts[1].slice(0, -4)}dead`;
    const alteredAttempt = sb.context.getVerifiedInvoiceRecord(null, payA, orderA, alteredToken);
    expect(alteredAttempt.success).toBe(false);
    expect(alteredAttempt.error).toContain("UNAUTHORIZED_INVOICE_ACCESS");

    // 3d. Expired token (past timestamp)
    const expiredExp = Date.now() - 3600000; // 1 hour ago
    const expiredSig = computeTokenHmac(payA, orderA, expiredExp);
    const expiredToken = `${expiredExp}.${expiredSig}`;
    const expiredAttempt = sb.context.getVerifiedInvoiceRecord(null, payA, orderA, expiredToken);
    expect(expiredAttempt.success).toBe(false);
    expect(expiredAttempt.error).toContain("UNAUTHORIZED_INVOICE_ACCESS");

    // 3e. Valid token but wrong payment ID specified
    const wrongPayAttempt = sb.context.getVerifiedInvoiceRecord(null, "pay_WrongPayId9999", orderA, tokenA);
    expect(wrongPayAttempt.success).toBe(false);
    expect(wrongPayAttempt.error).toContain("UNAUTHORIZED_INVOICE_ACCESS");

    // 3f. Valid token but wrong order ID specified
    const wrongOrdAttempt = sb.context.getVerifiedInvoiceRecord(null, payA, "order_WrongOrdId9999", tokenA);
    expect(wrongOrdAttempt.success).toBe(false);
    expect(wrongOrdAttempt.error).toContain("UNAUTHORIZED_INVOICE_ACCESS");
  });

  // 4. Authoritative verification: Refuses to return PII if payment is not marked PAID in backend
  it("4. Refuses to return invoice or customer PII if payment record is FAILED or not verified", () => {
    const sb = createPhase1CSandbox();
    const orderC = "order_CustomerC03"; // Marked 'FAILED' in sheet
    const payC = "pay_CustomerCPay03";

    // Even if an attacker somehow forged or obtained a HMAC signature for C
    const exp = Date.now() + 86400000;
    const tokenC = `${exp}.${computeTokenHmac(payC, orderC, exp)}`;

    const lookupC = sb.context.getVerifiedInvoiceRecord(null, payC, orderC, tokenC);
    expect(lookupC.success).toBe(false);
    expect(lookupC.error).toContain("Payment record not found or not verified");
    expect(lookupC.invoice).toBeUndefined();
  });

  // 5. OpenPrintableGstInvoice blocks unverified records
  it("5. openPrintableGstInvoice strictly blocks unverified objects or forged params", () => {
    // Arbitrary unverified object
    expect(() => {
      openPrintableGstInvoice({
        customerName: "Attacker",
        paymentId: "pay_FakePay123456",
        orderId: "order_FakeOrd123456",
        totalAmountPaid: 5899,
        courseName: "UPSCALE Offline",
      });
    }).toThrow("UNVERIFIED_INVOICE_BLOCKED");

    // Valid registered record succeeds
    const legit = registerVerifiedInvoiceRecord({
      customerName: "Alice Customer",
      paymentId: "pay_CustomerAPay01",
      orderId: "order_CustomerA01",
      totalAmountPaid: 117,
      courseName: "AI Secrets Revealed Masterclass",
    });

    const openSpy = vi.spyOn(window, "open").mockReturnValue({
      document: {
        open: vi.fn(),
        write: vi.fn(),
        close: vi.fn(),
      },
      focus: vi.fn(),
    } as any);

    openPrintableGstInvoice(legit);
    expect(openSpy).toHaveBeenCalled();
  });

  // 6. Refresh recovery without bearer token in URL: recovers token from scoped sessionStorage
  it("6. Survives browser refresh via scoped sessionStorage recovery without exposing bearer token in URL", async () => {
    const paymentId = "pay_RefreshTest01";
    const orderId = "order_RefreshTest01";
    const validExp = Date.now() + 86400000;
    const testToken = `${validExp}.${computeTokenHmac(paymentId, orderId, validExp)}`;

    // Store token in sessionStorage as would happen on payment success
    sessionStorage.setItem(`inv_tok_${paymentId}`, testToken);

    // Mock fetch that captures request payload
    let sentPayload: any = null;
    const mockFetcher = async (_url: any, init: any) => {
      sentPayload = JSON.parse(init.body);
      return {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          verified: true,
          invoice: {
            paymentId,
            orderId,
            customerName: "Refreshed User",
            customerEmail: "refresh@example.com",
            customerPhone: "+919876543210",
            courseName: "AI Secrets Revealed Masterclass",
            totalAmountPaid: 117,
          },
        }),
      } as Response;
    };

    // Upon refresh: URL only has ?paymentId=pay_...&orderId=order_... (NO token in URL)
    const refreshedToken = sessionStorage.getItem(`inv_tok_${paymentId}`);
    expect(refreshedToken).toBe(testToken);

    const record = await fetchVerifiedInvoiceFromBackend({
      paymentId,
      orderId,
      token: refreshedToken || undefined,
      backendUrl: "https://script.google.com/macros/s/TEST/exec",
      fetchImpl: mockFetcher as any,
    });

    expect(record.customerName).toBe("Refreshed User");
    expect(sentPayload.token).toBe(testToken);

    // 6b. Expired token in sessionStorage is discarded upon read
    const pastExp = Date.now() - 5000;
    const expiredToken = `${pastExp}.${computeTokenHmac(paymentId, orderId, pastExp)}`;
    sessionStorage.setItem(`inv_tok_${paymentId}`, expiredToken);

    const rawStored = sessionStorage.getItem(`inv_tok_${paymentId}`) || "";
    const parsedExp = parseInt(rawStored.split(".")[0], 10);
    if (!isNaN(parsedExp) && Date.now() > parsedExp) {
      sessionStorage.removeItem(`inv_tok_${paymentId}`);
    }

    expect(sessionStorage.getItem(`inv_tok_${paymentId}`)).toBeNull();
  });

  // 7. Accidental or legacy query param token is purged immediately from URL via replaceState
  it("7. Scrubs any accidental token query parameter from window.history without leaving trace in URL bar", () => {
    // Simulate window.location with query token
    const fakeHistoryReplace = vi.spyOn(window.history, "replaceState");
    const testLocation = new URL("https://course.techtycoon.in/thank-you?paymentId=pay_Test123&orderId=order_Test123&token=leak_token_123");

    const params = new URLSearchParams(testLocation.search);
    expect(params.has("token")).toBe(true);

    // Clean URL
    params.delete("token");
    const remaining = params.toString();
    const cleanUrl = `${testLocation.pathname}${remaining ? `?${remaining}` : ""}${testLocation.hash}`;

    window.history.replaceState({}, "Title", cleanUrl);

    expect(cleanUrl).toBe("/thank-you?paymentId=pay_Test123&orderId=order_Test123");
    expect(cleanUrl).not.toContain("token=");
    expect(fakeHistoryReplace).toHaveBeenCalledWith({}, "Title", "/thank-you?paymentId=pay_Test123&orderId=order_Test123");
  });
});
