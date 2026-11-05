import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import crypto from "node:crypto";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import AIMasterclassLeadGate from "../components/ai_masterclass/AIMasterclassLeadGate";
import {
  buildLandingLeadPayload,
  hasCompletedLeadGate,
  landingLeadsToCsv,
  markLeadGateCompleted,
  submitLandingLead,
  validateLandingLead,
  type LandingLead,
} from "../lib/landingLeadService";

const ROOT_DIR = path.resolve(__dirname, "../..");
const AI_MASTERCLASS_SCRIPT = "backend/apps_script/ai_masterclass/apps_script.gs";
const VERIFY_TOKEN = "test_verify_token";

type Row = unknown[];

function createSheet() {
  const rows: Row[] = [];
  return {
    rows,
    appendRow: (row: Row) => rows.push(row),
    getLastRow: () => rows.length,
    setFrozenRows: () => {},
    getDataRange: () => ({ getValues: () => rows }),
  };
}

function createSandbox() {
  const code = fs.readFileSync(path.join(ROOT_DIR, AI_MASTERCLASS_SCRIPT), "utf8");
  const sheets: Record<string, ReturnType<typeof createSheet>> = { Sheet1: createSheet(), Logs: createSheet() };
  const fetchedUrls: string[] = [];

  const spreadsheet = {
    getSheetByName: (name: string) => sheets[name] || null,
    getSheets: () => [sheets.Sheet1],
    insertSheet: (name: string) => (sheets[name] = createSheet()),
  };

  const sandbox: Record<string, unknown> = {
    console, Date, Math, JSON, Number, String, Boolean, Array, Object, RegExp, Error,
    parseInt, parseFloat, isNaN, encodeURIComponent, decodeURIComponent,
    Logger: { log: () => {} },
    PropertiesService: {
      getScriptProperties: () => ({
        getProperty: (key: string) => ({ WEBHOOK_VERIFY_TOKEN: VERIFY_TOKEN, RAZORPAY_KEY_ID: "rzp_test", RAZORPAY_KEY_SECRET: "secret" } as Record<string, string>)[key] ?? null,
      }),
    },
    LockService: { getScriptLock: () => ({ waitLock: () => {}, releaseLock: () => {} }) },
    ContentService: {
      MimeType: { JSON: "application/json" },
      createTextOutput: (text: string) => ({
        setMimeType() { return this; },
        getContent: () => text,
      }),
    },
    SpreadsheetApp: { getActiveSpreadsheet: () => spreadsheet, flush: () => {} },
    UrlFetchApp: {
      fetch: (url: string) => {
        fetchedUrls.push(url);
        return { getResponseCode: () => 200, getContentText: () => JSON.stringify({ id: "order_X" }) };
      },
    },
    Utilities: {
      base64Encode: (s: string) => Buffer.from(s).toString("base64"),
      getUuid: () => crypto.randomUUID(),
    },
  };

  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { filename: AI_MASTERCLASS_SCRIPT });

  return {
    sheets,
    fetchedUrls,
    post: (payload: Record<string, unknown>) => {
      const res = (sandbox.doPost as (e: unknown) => { getContent: () => string })({
        parameter: {},
        postData: { contents: JSON.stringify(payload) },
      });
      return JSON.parse(res.getContent());
    },
    get: (params: Record<string, string>) => {
      const res = (sandbox.doGet as (e: unknown) => { getContent: () => string })({ parameter: params });
      return JSON.parse(res.getContent());
    },
  };
}

describe("Landing lead gate — Apps Script backend", () => {
  it("saves a lead with timestamp to the Landing_Leads sheet without creating a Razorpay order", () => {
    const env = createSandbox();
    const res = env.post({
      action: "saveLandingLead",
      name: "Priya Ravi",
      phone: "+919876543210",
      email: "priya@example.com",
      pageUrl: "https://course.techtycoon.in/ai_masterclass/?utm_source=google",
      utm: { utm_source: "google", gclid: "abc123" },
    });

    expect(res.success).toBe(true);
    expect(res.leadId).toMatch(/^lead_/);
    expect(env.fetchedUrls.some(u => u.includes("razorpay"))).toBe(false);
    expect(env.sheets.Sheet1.rows).toHaveLength(0);

    const leadRows = env.sheets.Landing_Leads.rows;
    expect(leadRows[0][0]).toBe("Timestamp");
    expect(leadRows).toHaveLength(2);
    expect(leadRows[1][0]).toBeInstanceOf(Date);
    expect(leadRows[1].slice(2, 5)).toEqual(["Priya Ravi", "'+919876543210", "priya@example.com"]);
    expect(leadRows[1][6]).toBe("google");
    expect(leadRows[1][9]).toBe("abc123");
  });

  it("accepts a lead without email", () => {
    const env = createSandbox();
    expect(env.post({ action: "saveLandingLead", name: "Arun K", phone: "+919876543210" }).success).toBe(true);
    expect(env.sheets.Landing_Leads.rows[1][4]).toBe("");
  });

  it("rejects missing name, invalid phone, invalid email and honeypot submissions", () => {
    const env = createSandbox();
    expect(env.post({ action: "saveLandingLead", name: "", phone: "+919876543210" }).success).toBe(false);
    expect(env.post({ action: "saveLandingLead", name: "Arun", phone: "12" }).success).toBe(false);
    expect(env.post({ action: "saveLandingLead", name: "Arun", phone: "+919876543210", email: "bad" }).success).toBe(false);
    expect(env.post({ action: "saveLandingLead", name: "Arun", phone: "+919876543210", website: "spam.com" }).success).toBe(false);
    expect(env.sheets.Landing_Leads).toBeUndefined();
  });

  it("neutralises spreadsheet formula injection in the name", () => {
    const env = createSandbox();
    env.post({ action: "saveLandingLead", name: "=HYPERLINK(\"x\")", phone: "+919876543210" });
    expect(String(env.sheets.Landing_Leads.rows[1][2]).startsWith("'=")).toBe(true);
  });

  it("returns leads newest-first only with a valid admin token", () => {
    const env = createSandbox();
    env.post({ action: "saveLandingLead", name: "First Lead", phone: "+919876543210" });
    env.post({ action: "saveLandingLead", name: "Second Lead", phone: "+919876543211" });

    expect(env.get({ action: "getLandingLeads", token: "wrong" }).success).toBe(false);

    const res = env.get({ action: "getLandingLeads", token: VERIFY_TOKEN });
    expect(res.success).toBe(true);
    expect(res.leads.map((l: LandingLead) => l.name)).toEqual(["Second Lead", "First Lead"]);
    expect(res.leads[0].phone).toBe("+919876543211");
  });
});

describe("Landing lead gate — client validation & helpers", () => {
  const base = { name: "Priya Ravi", countryCode: "+91", phone: "9876543210", email: "" };

  it("requires name and phone but not email", () => {
    expect(validateLandingLead(base)).toEqual({});
    expect(validateLandingLead({ ...base, name: " " }).name).toBeTruthy();
    expect(validateLandingLead({ ...base, phone: "" }).phone).toBeTruthy();
    expect(validateLandingLead({ ...base, phone: "12345" }).phone).toBeTruthy();
    expect(validateLandingLead({ ...base, email: "nope" }).email).toBeTruthy();
    expect(validateLandingLead({ ...base, countryCode: "+1", phone: "4155552671" })).toEqual({});
  });

  it("builds a payload with country code and UTM params", () => {
    window.history.pushState({}, "", "/ai_masterclass/?utm_source=meta&fbclid=fb1");
    const payload = buildLandingLeadPayload({ ...base, phone: "98765 43210", email: " A@B.com " });
    expect(payload).toMatchObject({ action: "saveLandingLead", phone: "+919876543210", email: "a@b.com" });
    expect(payload.utm).toMatchObject({ utm_source: "meta", fbclid: "fb1" });
  });

  it("throws the server error when saving fails", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ json: async () => ({ success: false, error: "Sheet locked" }) });
    await expect(submitLandingLead(base, fetchMock as unknown as typeof fetch)).rejects.toThrow("Sheet locked");
  });

  it("throws a connection error when the network fails", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));
    await expect(submitLandingLead(base, fetchMock as unknown as typeof fetch)).rejects.toThrow(/couldn't reach/);
  });

  it("escapes CSV cells and keeps phone numbers readable", () => {
    const csv = landingLeadsToCsv([{
      timestamp: "2026-11-03T10:00:00.000Z", leadId: "lead_1", name: 'Ravi "R" =cmd', phone: "+919876543210",
      email: "", pageUrl: "", utmSource: "", utmMedium: "", utmCampaign: "", gclid: "", fbclid: "", userAgent: "",
    }]);
    expect(csv).toContain('"Ravi ""R"" =cmd"');
    expect(csv).toContain('"+919876543210"');
  });
});

describe("Landing lead gate — popup", () => {
  beforeEach(() => {
    localStorage.clear();
    window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("blocks submission until name and phone are entered", () => {
    const submitLead = vi.fn();
    render(<AIMasterclassLeadGate submitLead={submitLead} />);

    expect(screen.getByRole("dialog")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /continue to masterclass/i }));

    expect(screen.getByText("Full name is required.")).toBeTruthy();
    expect(screen.getByText("Phone number is required.")).toBeTruthy();
    expect(submitLead).not.toHaveBeenCalled();
  });

  it("saves the lead and then reveals the landing page", async () => {
    const submitLead = vi.fn().mockResolvedValue({ leadId: "lead_abc" });
    render(<AIMasterclassLeadGate submitLead={submitLead} />);

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: "Priya Ravi" } });
    fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: "9876543210" } });
    fireEvent.click(screen.getByRole("button", { name: /continue to masterclass/i }));

    await screen.findByText(/taking you to the masterclass/i);
    expect(submitLead).toHaveBeenCalledWith(expect.objectContaining({ name: "Priya Ravi", phone: "9876543210", email: "" }));
    expect(hasCompletedLeadGate()).toBe(true);

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull(), { timeout: 2000 });
    expect(document.body.style.overflow).toBe("");
  });

  it("shows an error and stays open when saving fails", async () => {
    const submitLead = vi.fn().mockRejectedValue(new Error("We couldn't save your details. Please try again."));
    render(<AIMasterclassLeadGate submitLead={submitLead} />);

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: "Priya Ravi" } });
    fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: "9876543210" } });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /continue to masterclass/i }));
    });

    expect((await screen.findByRole("alert")).textContent).toMatch(/couldn't save/);
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(hasCompletedLeadGate()).toBe(false);
  });

  it("does not show again for a visitor who already submitted", () => {
    markLeadGateCompleted("lead_prev");
    render(<AIMasterclassLeadGate submitLead={vi.fn()} />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  describe("Meta Pixel Lead and GA4 generate_lead tracking", () => {
    let fbqMock: ReturnType<typeof vi.fn>;
    let gtagMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      fbqMock = vi.fn();
      gtagMock = vi.fn();
      window.fbq = fbqMock;
      window.gtag = gtagMock;
    });

    afterEach(() => {
      delete window.fbq;
      delete window.gtag;
    });

    it("fires Meta Lead and GA4 generate_lead only after successful enquiry form submission", async () => {
      const submitLead = vi.fn().mockResolvedValue({ leadId: "lead_test123" });
      render(<AIMasterclassLeadGate submitLead={submitLead} />);

      fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: "Selva Kumar" } });
      fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: "9876543210" } });
      fireEvent.click(screen.getByRole("button", { name: /continue to masterclass/i }));

      await screen.findByText(/taking you to the masterclass/i);

      expect(fbqMock).toHaveBeenCalledTimes(1);
      expect(fbqMock).toHaveBeenCalledWith(
        "track",
        "Lead",
        {
          content_name: "AI Secrets Revealed Masterclass",
          content_category: "Landing Page Enquiry Popup",
        },
        { eventID: "lead_test123" }
      );

      // Verify no monetary value or currency is attached to Lead
      const metaLeadPayload = fbqMock.mock.calls[0][2];
      expect(metaLeadPayload.value).toBeUndefined();
      expect(metaLeadPayload.currency).toBeUndefined();

      // Verify no PII is leaked into Meta event payload
      expect(metaLeadPayload.name).toBeUndefined();
      expect(metaLeadPayload.phone).toBeUndefined();
      expect(metaLeadPayload.email).toBeUndefined();

      // Verify GA4 generate_lead
      expect(gtagMock).toHaveBeenCalledTimes(1);
      expect(gtagMock).toHaveBeenCalledWith("event", "generate_lead", {
        event_category: "Lead Form",
        event_label: "AI Masterclass Landing Popup",
      });
      const gaPayload = gtagMock.mock.calls[0][2];
      expect(gaPayload.value).toBeUndefined();
      expect(gaPayload.currency).toBeUndefined();
    });

    it("does not fire Lead or generate_lead when form validation fails", () => {
      const submitLead = vi.fn();
      render(<AIMasterclassLeadGate submitLead={submitLead} />);

      fireEvent.click(screen.getByRole("button", { name: /continue to masterclass/i }));

      expect(screen.getByText("Full name is required.")).toBeTruthy();
      expect(fbqMock).not.toHaveBeenCalled();
      expect(gtagMock).not.toHaveBeenCalled();
    });

    it("does not fire Lead or generate_lead when server submission fails", async () => {
      const submitLead = vi.fn().mockRejectedValue(new Error("Server submission error"));
      render(<AIMasterclassLeadGate submitLead={submitLead} />);

      fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: "Selva Kumar" } });
      fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: "9876543210" } });
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /continue to masterclass/i }));
      });

      expect(await screen.findByRole("alert")).toBeTruthy();
      expect(fbqMock).not.toHaveBeenCalled();
      expect(gtagMock).not.toHaveBeenCalled();
    });

    it("prevents duplicate Lead events on rapid double-clicks or retries", async () => {
      const submitLead = vi.fn().mockResolvedValue({ leadId: "lead_dup123" });
      render(<AIMasterclassLeadGate submitLead={submitLead} />);

      fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: "Selva Kumar" } });
      fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: "9876543210" } });

      // Capture form button and simulate rapid clicks
      const submitButton = screen.getByRole("button", { name: /continue to masterclass/i });
      fireEvent.click(submitButton);
      fireEvent.click(submitButton);

      await screen.findByText(/taking you to the masterclass/i);

      expect(submitLead).toHaveBeenCalledTimes(1);
      expect(fbqMock).toHaveBeenCalledTimes(1);
      expect(gtagMock).toHaveBeenCalledTimes(1);
    });

    it("gracefully succeeds even if fbq or gtag throws an exception", async () => {
      window.fbq = vi.fn().mockImplementation(() => {
        throw new Error("Meta Pixel blocked by client");
      });
      window.gtag = vi.fn().mockImplementation(() => {
        throw new Error("Gtag blocked by client");
      });

      const submitLead = vi.fn().mockResolvedValue({ leadId: "lead_safe" });
      render(<AIMasterclassLeadGate submitLead={submitLead} />);

      fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: "Selva Kumar" } });
      fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: "9876543210" } });
      fireEvent.click(screen.getByRole("button", { name: /continue to masterclass/i }));

      // Form should still successfully advance despite tracking exceptions
      await screen.findByText(/taking you to the masterclass/i);
      expect(hasCompletedLeadGate()).toBe(true);
    });
  });
});
