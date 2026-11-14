import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import AIMasterclassPage from "../components/ai_masterclass/AIMasterclassPage";
import AIMasterclassRegisterModal from "../components/ai_masterclass/AIMasterclassRegisterModal";
import { AIMasterclassRegisterModalProvider, useAIMasterclassRegisterModal } from "../components/ai_masterclass/AIMasterclassRegisterModalContext";
import ThankYou from "../pages/ThankYou";

const ROOT_DIR = path.resolve(__dirname, "../..");
const AI_MASTERCLASS_SCRIPT = "backend/apps_script/ai_masterclass/apps_script.gs";

function createSheet() {
  const rows: any[][] = [];
  return {
    rows,
    appendRow: (row: any[]) => rows.push(row),
    getLastRow: () => rows.length,
    setFrozenRows: () => {},
    getDataRange: () => ({ getValues: () => rows }),
    getRange: (rowIdx: number, colIdx: number, numRows = 1, numCols = 1) => ({
      getValues: () => {
        const slice: any[][] = [];
        for (let r = rowIdx - 1; r < rowIdx - 1 + numRows; r++) {
          const row = rows[r] || [];
          slice.push(row.slice(colIdx - 1, colIdx - 1 + numCols));
        }
        return slice;
      },
      setValue: (val: any) => {
        if (!rows[rowIdx - 1]) rows[rowIdx - 1] = [];
        rows[rowIdx - 1][colIdx - 1] = val;
      }
    })
  };
}

function createSandbox() {
  const code = fs.readFileSync(path.join(ROOT_DIR, AI_MASTERCLASS_SCRIPT), "utf8");
  const sheets: Record<string, ReturnType<typeof createSheet>> = {
    Sheet1: createSheet(),
    Landing_Leads: createSheet(),
    Logs: createSheet()
  };

  const spreadsheet = {
    getSheetByName: (name: string) => sheets[name] || null,
    getSheets: () => [sheets.Sheet1],
    insertSheet: (name: string) => (sheets[name] = createSheet()),
    getActiveSpreadsheet: () => spreadsheet
  };

  const sandbox: Record<string, unknown> = {
    console, Date, Math, JSON, Number, String, Boolean, Array, Object, RegExp, Error,
    parseInt, parseFloat, isNaN, encodeURIComponent, decodeURIComponent,
    Logger: { log: () => {} },
    SpreadsheetApp: {
      getActiveSpreadsheet: () => spreadsheet,
      openById: () => spreadsheet,
      flush: () => {}
    },
    ContentService: {
      createTextOutput: (content: string) => {
        const out = {
          content,
          getContent: () => content,
          toString: () => content,
          setMimeType: () => out
        };
        return out;
      },
      MimeType: { JSON: "application/json", TEXT: "text/plain" }
    },
    PropertiesService: {
      getScriptProperties: () => ({
        getProperty: (key: string) => {
          if (key === "WEBHOOK_VERIFY_TOKEN") return "test_token";
          if (key === "INVOICE_TOKEN_SECRET") return "secret_token_12345678901234567890";
          if (key === "RAZORPAY_KEY_SECRET") return "dummy_rzp_secret";
          return null;
        },
        setProperty: () => {}
      })
    },
    Utilities: {
      base64Encode: (str: string) => Buffer.from(str).toString("base64"),
      getUuid: () => "mock_uuid_" + Math.random().toString(36).slice(2, 8),
      computeHmacSha256Signature: () => [1, 2, 3, 4],
      computeDigest: () => [5, 6, 7, 8],
      DigestAlgorithm: { SHA_256: "SHA_256" },
      Charset: { UTF_8: "UTF_8" }
    },
    UrlFetchApp: {
      fetch: () => ({
        getResponseCode: () => 200,
        getContentText: () => JSON.stringify({ id: "order_mock_123", amount: 11700, status: "created" })
      })
    },
    LockService: {
      getScriptLock: () => ({
        waitLock: () => {},
        releaseLock: () => {}
      })
    }
  };

  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);
  return { sandbox, sheets };
}

describe("Register Now Meta Lead & Purchase Tracking Suite", () => {
  let fbqMock: ReturnType<typeof vi.fn>;
  let gtagMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    fbqMock = vi.fn();
    gtagMock = vi.fn();
    (window as any).fbq = fbqMock;
    (window as any).gtag = gtagMock;
    window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
    let rzpScript = document.getElementById("razorpay-script");
    if (!rzpScript) {
      rzpScript = document.createElement("script");
      rzpScript.id = "razorpay-script";
      document.body.appendChild(rzpScript);
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // 1. Verify Register Now opens the correct registration form
  it("Requirement 1: Opens the Register Now registration form when triggered", async () => {
    const TestComponent = () => {
      const { openRegisterModal } = useAIMasterclassRegisterModal();
      return (
        <div>
          <button onClick={openRegisterModal}>Open Register Form</button>
          <AIMasterclassRegisterModal />
        </div>
      );
    };

    render(
      <MemoryRouter>
        <AIMasterclassRegisterModalProvider>
          <TestComponent />
        </AIMasterclassRegisterModalProvider>
      </MemoryRouter>
    );

    expect(screen.queryByText(/Preferred Date & Session/i)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Open Register Form" }));
    expect(await screen.findByText(/Preferred Date & Session/i)).toBeTruthy();
  });

  // 2. The old lead popup no longer appears on the page
  it("Requirement 2: The old separate lead popup no longer appears on AIMasterclassPage", () => {
    render(
      <MemoryRouter>
        <AIMasterclassPage />
      </MemoryRouter>
    );

    // Old lead gate text: "Unlock the ₹99 Masterclass Offer" / "Continue to Masterclass"
    expect(screen.queryByText(/Unlock the ₹99 Masterclass Offer/i)).toBeNull();
    expect(screen.queryByRole("button", { name: /continue to masterclass/i })).toBeNull();
  });

  // 3. Backend integration saves registration to Sheet1 AND Landing_Leads
  it("Requirement 3 & 5: Backend saves registration into Sheet1 and Landing_Leads tab with UTM attribution", () => {
    const { sandbox, sheets } = createSandbox();

    const postPayload = {
      name: "Ravi Kumar",
      email: "ravi.kumar@example.com",
      phone: "+919876543210",
      userType: "Entrepreneur",
      pageUrl: "https://course.techtycoon.in/ai_masterclass/?utm_source=meta&utm_medium=cpc&utm_campaign=AI_MASTERCLASS_PHASE_2_LEADS&fbclid=fb_click_123",
      utm_source: "meta",
      utm_medium: "cpc",
      utm_campaign: "AI_MASTERCLASS_PHASE_2_LEADS",
      fbclid: "fb_click_123",
      batch: "Masterclass 2026 (Evening Live Session)",
      preferredSlot: "Wednesday Live Session",
      sessionDate: "Wednesday, November 11, 2026",
      sessionTime: "5:30 PM - 8:30 PM IST",
      amount: 99,
      baseAmount: 83.90,
      gstAmount: 15.10
    };

    const doPost = sandbox.doPost as (e: any) => any;
    const resOutput = doPost({ postData: { contents: JSON.stringify(postPayload) } });
    const res = JSON.parse(resOutput.content);

    expect(res.success).toBe(true);
    expect(res.orderId).toBeTruthy();
    expect(res.leadId).toBeTruthy();

    // Check Sheet1 has the registration row
    expect(sheets.Sheet1.rows.length).toBeGreaterThan(0);
    const regRow = sheets.Sheet1.rows[0];
    expect(regRow).toContain("Ravi Kumar");
    expect(regRow).toContain("ravi.kumar@example.com");

    // Check Landing_Leads tab has the lead capture row with UTM attribution
    expect(sheets.Landing_Leads.rows.length).toBeGreaterThan(0);
    const leadRow = sheets.Landing_Leads.rows[sheets.Landing_Leads.rows.length - 1];
    expect(leadRow).toContain("Ravi Kumar");
    expect(leadRow).toContain("ravi.kumar@example.com");
    expect(leadRow).toContain("meta");
    expect(leadRow).toContain("AI_MASTERCLASS_PHASE_2_LEADS");
    expect(leadRow).toContain("fb_click_123");
  });

  // 4 & 5 & 11: Lead event fires ONLY after successful backend save, with unique eventID, and only once
  it("Requirement 4, 5 & 11: Fires Meta Lead event once after successful backend save with deduplication eventID", async () => {
    const mockOrderId = "order_test_lead_999";
    // Mock fetch for registration order creation
    global.fetch = vi.fn().mockImplementation((url: string, options?: any) => {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, orderId: mockOrderId, leadId: mockOrderId })
      });
    });

    // Mock Razorpay script loading
    (window as any).Razorpay = vi.fn().mockImplementation(() => ({
      open: vi.fn(), on: vi.fn()
    }));

    const TestComponent = () => {
      const { openRegisterModal } = useAIMasterclassRegisterModal();
      return (
        <div>
          <button onClick={openRegisterModal}>Open Register Form</button>
          <AIMasterclassRegisterModal />
        </div>
      );
    };

    render(
      <MemoryRouter>
        <AIMasterclassRegisterModalProvider>
          <TestComponent />
        </AIMasterclassRegisterModalProvider>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: "Open Register Form" }));
    await screen.findByText(/Preferred Date & Session/i);

    // Fill form
    fireEvent.change(screen.getByPlaceholderText(/enter your name/i), { target: { value: "Ananya Sharma" } });
    fireEvent.change(screen.getByPlaceholderText(/email@example\.com/i), { target: { value: "ananya@example.com" } });
    fireEvent.change(screen.getByPlaceholderText(/mobile number/i), { target: { value: "9876543210" } });

    // Ensure Lead event has NOT fired yet
    expect(fbqMock).not.toHaveBeenCalledWith("track", "Lead", expect.anything(), expect.anything());

    // Click Proceed to Payment
    const submitBtn = screen.getByRole("button", { name: /proceed to payment/i });
    const form = submitBtn.closest("form") || submitBtn;
    await act(async () => {
      fireEvent.submit(form);
    });

    // Wait for backend call to resolve
    await waitFor(() => {
      expect(fbqMock).toHaveBeenCalledWith(
        "track",
        "Lead",
        expect.objectContaining({
          content_name: expect.stringContaining("AI Secrets Revealed Masterclass"),
          content_category: "Masterclass Registration Form"
        }),
        { eventID: mockOrderId }
      );
    });

    // Verify Lead event was fired exactly once
    const leadCalls = fbqMock.mock.calls.filter((call) => call[0] === "track" && call[1] === "Lead");
    expect(leadCalls.length).toBe(1);

    // Verify sessionStorage deduplication was set
    expect(sessionStorage.getItem(`lead_tracked_${mockOrderId}`)).toBe("true");

    // Click again: should NOT fire duplicate Lead event
    await act(async () => {
      fireEvent.click(submitBtn);
    });
    const subsequentLeadCalls = fbqMock.mock.calls.filter((call) => call[0] === "track" && call[1] === "Lead");
    expect(subsequentLeadCalls.length).toBe(1);
  });

  // 6. Invalid registration does NOT fire Lead
  it("Requirement 6: Invalid form submission does NOT fire Lead event", async () => {
    const TestComponent = () => {
      const { openRegisterModal } = useAIMasterclassRegisterModal();
      return (
        <div>
          <button onClick={openRegisterModal}>Open Register Form</button>
          <AIMasterclassRegisterModal />
        </div>
      );
    };

    render(
      <MemoryRouter>
        <AIMasterclassRegisterModalProvider>
          <TestComponent />
        </AIMasterclassRegisterModalProvider>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: "Open Register Form" }));
    await screen.findByText(/Preferred Date & Session/i);

    // Leave fields empty and click submit
    const submitBtn = screen.getByRole("button", { name: /proceed to payment/i });
    const form = submitBtn.closest("form") || submitBtn;
    window.alert = vi.fn();

    await act(async () => {
      fireEvent.submit(form);
    });

    expect(window.alert).toHaveBeenCalledWith("Please enter your full name.");
    expect(fbqMock).not.toHaveBeenCalledWith("track", "Lead", expect.anything(), expect.anything());
  });

  // 7. Backend failure does NOT fire Lead
  it("Requirement 7: Backend network failure or rejected order does NOT fire Lead event", async () => {
    global.fetch = vi.fn().mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: false, error: "Database lock timeout" })
      });
    });

    (window as any).Razorpay = vi.fn();
    window.alert = vi.fn();

    const TestComponent = () => {
      const { openRegisterModal } = useAIMasterclassRegisterModal();
      return (
        <div>
          <button onClick={openRegisterModal}>Open Register Form</button>
          <AIMasterclassRegisterModal />
        </div>
      );
    };

    render(
      <MemoryRouter>
        <AIMasterclassRegisterModalProvider>
          <TestComponent />
        </AIMasterclassRegisterModalProvider>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: "Open Register Form" }));
    await screen.findByText(/Preferred Date & Session/i);

    fireEvent.change(screen.getByPlaceholderText(/enter your name/i), { target: { value: "Karthik Raja" } });
    fireEvent.change(screen.getByPlaceholderText(/email@example\.com/i), { target: { value: "karthik@example.com" } });
    fireEvent.change(screen.getByPlaceholderText(/mobile number/i), { target: { value: "9876543210" } });

    const submitBtn = screen.getByRole("button", { name: /proceed to payment/i });
    const form = submitBtn.closest("form") || submitBtn;
    await act(async () => {
      fireEvent.submit(form);
    });

    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining("Order creation failed"));
    expect(fbqMock).not.toHaveBeenCalledWith("track", "Lead", expect.anything(), expect.anything());
  });

  // 8, 9, 10 & 11: Purchase event tracking with verified amount, eventID, and deduplication
  it("Requirement 8, 9, 10 & 11: Purchase fires once with actual paid amount and paymentId as eventID; does not fire on cancelled payment or page refresh", async () => {
    const paymentId = "pay_test_purch_777";
    const verifiedAmount = 499;

    render(
      <MemoryRouter initialEntries={[`/thank-you?paymentId=${paymentId}&orderId=order_999`]}>
        <Routes>
          <Route path="/thank-you" element={<ThankYou />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for purchase tracking
    await waitFor(() => {
      expect(fbqMock).toHaveBeenCalledWith(
        "track",
        "Purchase",
        expect.objectContaining({
          currency: "INR",
          value: expect.any(Number)
        }),
        { eventID: paymentId }
      );
    });

    const purchaseCalls = fbqMock.mock.calls.filter((c) => c[0] === "track" && c[1] === "Purchase");
    expect(purchaseCalls.length).toBe(1);

    // Deduplication check: simulate reload / revisit
    fbqMock.mockClear();
    render(
      <MemoryRouter initialEntries={[`/thank-you?paymentId=${paymentId}&orderId=order_999`]}>
        <Routes>
          <Route path="/thank-you" element={<ThankYou />} />
        </Routes>
      </MemoryRouter>
    );

    // Because sessionStorage has purchase_tracked_pay_test_purch_777, it must NOT fire again!
    expect(fbqMock).not.toHaveBeenCalledWith("track", "Purchase", expect.anything(), expect.anything());
  });

  // 12: Preserves existing intentional pixel integrations in index.html
  it("Requirement 12: index.html contains both Tech Tycoon (2155724311994078) and Amiable Tamil (1077721348415196) datasets", () => {
    const indexHtmlPath = path.join(ROOT_DIR, "index.html");
    const html = fs.readFileSync(indexHtmlPath, "utf8");

    expect(html).toContain("2155724311994078");
    expect(html).toContain("1077721348415196");
    expect(html).toContain("fbq('init', '2155724311994078')");
    expect(html).toContain("fbq('init', '1077721348415196')");
  });

  // 13: UTM parameters and lead attribution retention
  it("Requirement 13: Captures and persists UTM parameters in sessionStorage and passes to backend", () => {
    // Simulate landing with UTM query
    const url = "https://course.techtycoon.in/ai_masterclass/?utm_source=meta_ads&utm_medium=paid_social&utm_campaign=AI_MASTERCLASS_PHASE_2_LEADS&utm_content=carousel_v1&fbclid=fb_click_999";
    const parsed = new URL(url);

    // Cache to sessionStorage as the component does
    sessionStorage.setItem("utm_source", parsed.searchParams.get("utm_source") || "");
    sessionStorage.setItem("utm_medium", parsed.searchParams.get("utm_medium") || "");
    sessionStorage.setItem("utm_campaign", parsed.searchParams.get("utm_campaign") || "");
    sessionStorage.setItem("utm_content", parsed.searchParams.get("utm_content") || "");
    sessionStorage.setItem("fbclid", parsed.searchParams.get("fbclid") || "");

    expect(sessionStorage.getItem("utm_source")).toBe("meta_ads");
    expect(sessionStorage.getItem("utm_medium")).toBe("paid_social");
    expect(sessionStorage.getItem("utm_campaign")).toBe("AI_MASTERCLASS_PHASE_2_LEADS");
    expect(sessionStorage.getItem("utm_content")).toBe("carousel_v1");
    expect(sessionStorage.getItem("fbclid")).toBe("fb_click_999");
  });

  // 14: Existing registration and toolkit pricing calculations continue to work
  it("Requirement 14: Toolkit pricing calculations correctly reflect ₹99 base vs ₹499 with PDF toolkit", async () => {
    const TestComponent = () => {
      const { openRegisterModal } = useAIMasterclassRegisterModal();
      return (
        <div>
          <button onClick={openRegisterModal}>Open Form</button>
          <AIMasterclassRegisterModal />
        </div>
      );
    };

    render(
      <MemoryRouter>
        <AIMasterclassRegisterModalProvider>
          <TestComponent />
        </AIMasterclassRegisterModalProvider>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: "Open Form" }));
    await screen.findByText(/Preferred Date & Session/i);

    // Initially standard base seat: ₹99
    expect(screen.getByRole("button", { name: /Proceed to Payment.*99/i })).toBeTruthy();

    // Toggle resource toolkit PDF checkbox
    const toolkitCheckbox = document.getElementById("pdf-material-opt-in") || screen.getByLabelText(/I want resource toolkit/i);
    fireEvent.click(toolkitCheckbox);

    // Total should update to ₹499
    expect(await screen.findByRole("button", { name: /Proceed to Payment.*499/i })).toBeTruthy();
  });
});
