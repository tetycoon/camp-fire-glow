// Lead capture for the popup shown before the AI Masterclass landing page.
// Leads are stored in the "Landing_Leads" tab of the AI Masterclass Google Sheet.

export const LANDING_LEAD_ENDPOINT =
  "https://script.google.com/macros/s/AKfycby0fX7tjbOciJbg0Mw1SRMhlazBe4FG1Ko-f5mIFCW6Y7zGKHGZjdUZQKXclfye1FzegA/exec";

const STORAGE_KEY = "tt_ai_masterclass_lead_gate";
// Returning visitors who already submitted skip the popup for this long
const REMEMBER_MS = 30 * 24 * 60 * 60 * 1000;

export interface LandingLeadInput {
  name: string;
  countryCode: string;
  phone: string;
  email: string;
  website?: string; // honeypot
}

export type LandingLeadErrors = Partial<Record<"name" | "phone" | "email", string>>;

export interface LandingLead {
  timestamp: string;
  leadId: string;
  name: string;
  phone: string;
  email: string;
  pageUrl: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  gclid: string;
  fbclid: string;
  userAgent: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const validateLandingLead = (input: LandingLeadInput): LandingLeadErrors => {
  const errors: LandingLeadErrors = {};
  const name = input.name.replace(/\s+/g, " ").trim();
  const phoneDigits = input.phone.replace(/\D/g, "");
  const email = input.email.trim();

  if (!name) errors.name = "Full name is required.";
  else if (name.length < 2) errors.name = "Please enter your full name.";
  else if (name.length > 100) errors.name = "Name is too long.";

  if (!phoneDigits) errors.phone = "Phone number is required.";
  else if (input.countryCode === "+91" && !/^[6-9]\d{9}$/.test(phoneDigits)) {
    errors.phone = "Enter a valid 10-digit mobile number.";
  } else if (phoneDigits.length < 6 || phoneDigits.length > 14) {
    errors.phone = "Enter a valid phone number.";
  }

  if (email && !EMAIL_REGEX.test(email)) errors.email = "Enter a valid email address.";

  return errors;
};

const getTrackingParams = (search: string) => {
  const params = new URLSearchParams(search);
  const keys = ["utm_source", "utm_medium", "utm_campaign", "gclid", "fbclid"] as const;
  return keys.reduce<Record<string, string>>((acc, key) => {
    acc[key] = params.get(key) || "";
    return acc;
  }, {});
};

export const buildLandingLeadPayload = (input: LandingLeadInput) => ({
  action: "saveLandingLead",
  name: input.name.replace(/\s+/g, " ").trim(),
  phone: `${input.countryCode}${input.phone.replace(/\D/g, "")}`,
  email: input.email.trim().toLowerCase(),
  website: input.website || "",
  pageUrl: window.location.href,
  utm: getTrackingParams(window.location.search),
  userAgent: navigator.userAgent,
});

export const submitLandingLead = async (
  input: LandingLeadInput,
  fetchImpl: typeof fetch = fetch
): Promise<{ leadId: string }> => {
  let data: { success?: boolean; leadId?: string; error?: string };
  try {
    const response = await fetchImpl(LANDING_LEAD_ENDPOINT, {
      method: "POST",
      // text/plain avoids a CORS preflight, which Apps Script web apps do not answer
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(buildLandingLeadPayload(input)),
    });
    data = await response.json();
  } catch {
    throw new Error("We couldn't reach our server. Please check your connection and try again.");
  }

  if (!data || data.success !== true) {
    throw new Error(data?.error || "We couldn't save your details. Please try again.");
  }
  return { leadId: data.leadId || "" };
};

export const hasCompletedLeadGate = (now = Date.now()): boolean => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const savedAt = Number(JSON.parse(raw).savedAt);
    return Number.isFinite(savedAt) && now - savedAt < REMEMBER_MS;
  } catch {
    return false;
  }
};

export const markLeadGateCompleted = (leadId: string) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ leadId, savedAt: Date.now() }));
  } catch {
    // Storage unavailable (private mode); the popup will simply show again next visit
  }
};

export const fetchLandingLeads = async (endpoint: string, token: string): Promise<LandingLead[]> => {
  const response = await fetch(`${endpoint}?action=getLandingLeads&token=${encodeURIComponent(token)}`);
  const data = await response.json();
  if (!data.success || !Array.isArray(data.leads)) {
    throw new Error(data.error || "Failed to load landing leads.");
  }
  return data.leads;
};

const csvCell = (value: unknown) => {
  let str = String(value ?? "");
  // Neutralise spreadsheet formula injection when the CSV is opened in Excel/Sheets
  if (/^[=+\-@]/.test(str) && !/^\+?[\d\s-]+$/.test(str)) str = `'${str}`;
  return `"${str.replace(/"/g, '""')}"`;
};

export const landingLeadsToCsv = (leads: LandingLead[]): string => {
  const headers = ["Submitted At", "Lead ID", "Full Name", "Phone", "Email", "UTM Source", "UTM Medium", "UTM Campaign", "GCLID", "FBCLID", "Page URL"];
  const rows = leads.map((l) =>
    [l.timestamp, l.leadId, l.name, l.phone, l.email, l.utmSource, l.utmMedium, l.utmCampaign, l.gclid, l.fbclid, l.pageUrl]
      .map(csvCell)
      .join(",")
  );
  // BOM so Excel opens UTF-8 names (Tamil, etc.) correctly
  return "﻿" + [headers.join(","), ...rows].join("\n");
};
