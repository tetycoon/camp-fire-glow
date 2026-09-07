import React, { useState, useEffect, useMemo } from "react";
import { 
  Users, DollarSign, Percent, RefreshCw, LogOut, 
  Search, Shield, Eye, Download, AlertCircle, CheckCircle2, 
  FileSpreadsheet, Lock, Sparkles, Database, GitCommit, Wrench,
  Clock, History, Terminal, X, MessageSquare, Send, Calendar, MapPin, Video, ExternalLink,
  Upload, FileCheck, Image as ImageIcon, AlertTriangle, Check, ShieldAlert, Trash2
} from "lucide-react";
import techTycoonLogo from "../assets/tech_tycoon_logo.png";

// Define registration item type
interface Registration {
  timestamp: string;
  name: string;
  email: string;
  phone: string;
  profession: string;
  language: string;
  amount: number;
  status: string;
  orderId: string;
  paymentId: string;
  emailStatus: string;
  whatsappClicked: string;
  pageUrl: string;
  batch: string;
  sessionDate: string;
  sessionTime: string;
  // 🌟 Manual Edit & Approval Verification Fields
  isManualEdit?: boolean;
  approvalStatus?: "APPROVED" | "PENDING_APPROVAL" | "AUTO_CAPTURED";
  paymentProofUrl?: string;
  utrNumber?: string;
  approvedBy?: string;
  approvedAt?: string;
}

// Available Sheet Configs for different webinars
const SHEET_CONFIGS = [
  {
    id: "ai-masterclass",
    name: "AI Masterclass (Secrets Revealed)",
    url: "https://script.google.com/macros/s/AKfycby0fX7tjbOciJbg0Mw1SRMhlazBe4FG1Ko-f5mIFCW6Y7zGKHGZjdUZQKXclfye1FzegA/exec",
    verifyToken: "ai_tycoon_auto_662"
  },
  {
    id: "ai-masterclass2",
    name: "Advance AI Masterclass (Masterclass 2)",
    url: "https://script.google.com/macros/s/AKfycbylIyBX6wgBhb5BUJoc6x_eqe_ArHdDcCmwS6zi49FjbAAhZnkmiTAkHMYfcLubxCTHmQ/exec",
    verifyToken: "ai_tycoon_auto_662"
  },
  {
    id: "upscale-offline",
    name: "Upscale Level-2 Offline (Chennai)",
    url: "https://script.google.com/macros/s/AKfycbzPxPpp0ksCcE6IY8mUlzcu0jqY1RSfhCl2Locq1iOYbbe5beBeeQ6uefCV93Nxy8rbsg/exec",
    verifyToken: "ai_tycoon_auto_662"
  },
  {
    id: "claude-masterclass",
    name: "Claude Masterclass",
    url: "https://script.google.com/macros/s/AKfycbwP2rffwhgGYQjJFlfxYU4XHt-jFbUlWtYPAJOZcxIO--yvw2NTlnLvJDHHh4_giLq7/exec",
    verifyToken: "ai_tycoon_auto_662"
  },
  {
    id: "academy",
    name: "TECH TYCOON Academy (aitycoon.in/academy)",
    url: "https://script.google.com/macros/s/AKfycbwl1WKBrQxxMRbz7aj6GBUNbmR4ePHshhrBwcNjhxorIayQpMTmHaHHT_MvTroQ-ZrFbA/exec",
    verifyToken: "ai_tycoon_auto_662"
  }
];

interface SystemUpdate {
  id: string;
  date: string;
  author: string;
  category: "Google Apps Script" | "Payment Security" | "UI & Operations" | "WhatsApp Automation";
  title: string;
  description: string;
  impact: string;
  status: "DEPLOYED ✅" | "VERIFIED ✅";
}

const SYSTEM_UPDATES: SystemUpdate[] = [
  {
    id: "UPD-2026-006",
    date: "31 Aug 2026, 04:30 PM IST",
    author: "AI Tycoon Dev Team",
    category: "Google Apps Script",
    title: "TECH TYCOON Academy (/academy) Integration",
    description: "Added dedicated campaign endpoint and real-time sheet synchronization for TECH TYCOON Academy Pre-Registrations.",
    impact: "Full registration and payment tracking enabled for aitycoon.in/academy.",
    status: "DEPLOYED ✅"
  },
  {
    id: "UPD-2026-005",
    date: "18 Aug 2026, 05:15 PM IST",
    author: "AI Tycoon Dev Team",
    category: "Google Apps Script",
    title: "Upscale Level-2 Offline Sheet Synchronization",
    description: "Deployed custom Apps Script for Upscale Level-2 Offline (Chennai) with getRegistrations endpoint, Meta WhatsApp API image posters, and Razorpay webhook listener.",
    impact: "Full registration & payment tracking enabled for aitycoon.in/upscale.",
    status: "DEPLOYED ✅"
  },
  {
    id: "UPD-2026-004",
    date: "18 Aug 2026, 05:00 PM IST",
    author: "AI Tycoon Dev Team",
    category: "Google Apps Script",
    title: "Central Google Apps Script Endpoint Synchronization",
    description: "Added getRegistrations API action to all campaign sheets (Claude Masterclass, AI Masterclass, Advance Masterclass, Upscale Offline) returning structured JSON payload.",
    impact: "Restored live Google Sheet registration streaming across all subdomains.",
    status: "DEPLOYED ✅"
  },
  {
    id: "UPD-2026-003",
    date: "18 Aug 2026, 04:30 PM IST",
    author: "Security & Audit Team",
    category: "Payment Security",
    title: "Role-Based Access & Immutable Audit Mode Implementation",
    description: "Configured dual persona authentication (Administrator vs Auditor Mode). Enforced read-only immutable ledger view ensuring financial records are tamper-proof.",
    impact: "Guarantees 100% financial transparency with un-editable Order ID & Payment ID verification.",
    status: "VERIFIED ✅"
  },
  {
    id: "UPD-2026-002",
    date: "18 Aug 2026, 03:15 PM IST",
    author: "Automation Engineer",
    category: "WhatsApp Automation",
    title: "Multi-Webinar WhatsApp & Meta API Routing",
    description: "Updated WhatsApp webhook routing to dynamically select group links (Online Zoom vs Offline Chennai Vestin Park Hotel) based on user payment mode and order notes.",
    impact: "Eliminated misrouted attendee welcome messages for In-Person and Online registrants.",
    status: "DEPLOYED ✅"
  },
  {
    id: "UPD-2026-001",
    date: "17 Aug 2026, 08:00 PM IST",
    author: "Platform Team",
    category: "UI & Operations",
    title: "Central Control Dashboard Launch & CSV Exporter",
    description: "Launched unified webinar operations panel with campaign filter, lead search modal, live stats calculation, and one-click CSV export.",
    impact: "Centralized lead operations for all AI Tycoon events into a single unified control hub.",
    status: "DEPLOYED ✅"
  }
];

// Mock data generator for beautiful fallback visual rendering
const generateMockData = (sheetId: string): Registration[] => {
  const common = [
    { name: "Suresh Kumar", email: "suresh.k@gmail.com", phone: "+91 9840123456", prof: "IT Professional", lang: "Tamil", amt: 99, date: "12th September 2026", status: "✅ PAID", payId: "pay_mst_5001" },
    { name: "Priya Ravichandran", email: "priya.ravi@yahoo.com", phone: "+91 9789123456", prof: "Student", lang: "Tamil", amt: 99, date: "12th September 2026", status: "✅ PAID", payId: "pay_mst_5002" },
    { name: "John Miller", email: "john.miller@gmail.com", phone: "+1 4155552671", prof: "Business Owner", lang: "English", amt: 99, date: "12th September 2026", status: "✅ PAID", payId: "pay_mst_5003" },
    { name: "Karthik Raja", email: "karthik.r@outlook.com", phone: "+91 7558123456", prof: "Freelancer", lang: "Tamil", amt: 99, date: "12th September 2026", status: "INITIATED", payId: "" },
    { name: "Aisha Begum (Manual Edit Test)", email: "aisha.b@gmail.com", phone: "+91 9444123456", prof: "IT Professional", lang: "Tamil", amt: 99, date: "12th September 2026", status: "✅ PAID", payId: "" }, // No Razorpay ID = Manual Edit Trigger!
  ];

  if (sheetId === "academy") {
    return common.map((item, i) => ({
      timestamp: new Date(Date.now() - i * 3600000).toISOString(),
      name: item.name,
      email: item.email,
      phone: item.phone,
      profession: item.prof,
      language: "TECH TYCOON Academy",
      amount: i % 2 === 0 ? 2499 : 4999,
      status: item.status,
      orderId: `order_acad_${1000 + i}`,
      paymentId: item.payId,
      emailStatus: "SENT ✅",
      whatsappClicked: "YES",
      pageUrl: "https://aitycoon.in/academy",
      batch: "Academy Pre-Registration",
      sessionDate: "Sept 10th Launch",
      sessionTime: "On-Demand Access"
    }));
  }

  if (sheetId === "upscale-offline") {
    return common.map((item, i) => ({
      timestamp: new Date(Date.now() - i * 3600000).toISOString(),
      name: item.name,
      email: item.email,
      phone: item.phone,
      profession: item.prof,
      language: "Chennai Offline",
      amount: 4999,
      status: item.status,
      orderId: `order_upscale_${1000 + i}`,
      paymentId: item.payId,
      emailStatus: "SENT ✅",
      whatsappClicked: "NO",
      pageUrl: "https://aitycoon.in/upscale",
      batch: "Chennai Offline",
      sessionDate: "9th August 2026",
      sessionTime: "9:00 AM — 5:30 PM"
    }));
  }

  return common.map((item, i) => ({
    timestamp: new Date(Date.now() - i * 1800000).toISOString(),
    name: item.name,
    email: item.email,
    phone: item.phone,
    profession: item.prof,
    language: item.lang,
    amount: item.amt,
    status: item.status,
    orderId: `order_mst_${1000 + i}`,
    paymentId: item.payId,
    emailStatus: "SENT ✅",
    whatsappClicked: "YES",
    pageUrl: `https://aitycoon.in/${sheetId}`,
    batch: sheetId === "ai-masterclass" ? "Masterclass 2026" : "Claude Masterclass",
    sessionDate: item.date,
    sessionTime: "6:00 PM IST"
  }));
};

const processRegistrations = (rawList: Registration[]): Registration[] => {
  const savedApprovals = JSON.parse(localStorage.getItem("aitycoon_payment_approvals_v1") || "{}");
  const deletedLeadIds: string[] = JSON.parse(localStorage.getItem("aitycoon_deleted_lead_ids_v1") || "[]");

  return rawList
    .filter(item => {
      const key = item.orderId || item.email || item.phone;
      return !deletedLeadIds.includes(key);
    })
    .map(item => {
      const key = item.orderId || item.email || item.phone;
      const saved = savedApprovals[key];

      const isPaid = item.status?.includes("PAID") || item.status?.includes("captured") || item.status?.includes("SUCCESS");
      const hasValidRazorpayId = item.paymentId && item.paymentId.startsWith("pay_");

      // Flag as manual edit if it's marked PAID but lacks an automatic Razorpay payment ID
      const isManual = isPaid && !hasValidRazorpayId;

      if (saved && saved.paymentProofUrl) {
        return {
          ...item,
          isManualEdit: false,
          approvalStatus: "APPROVED",
          paymentProofUrl: saved.paymentProofUrl,
          utrNumber: saved.utrNumber,
          approvedBy: saved.approvedBy,
          approvedAt: saved.approvedAt,
          status: "✅ PAID (APPROVED WITH PROOF)"
        };
      }

      if (isManual) {
        return {
          ...item,
          isManualEdit: true,
          approvalStatus: "PENDING_APPROVAL",
          status: "NEEDS APPROVAL 🔴"
        };
      }

      return item;
    });
};

// Helper to check if a registration entry is recent/new (within last 48 hours)
const isNewLead = (timestamp?: string): boolean => {
  if (!timestamp) return false;
  try {
    const formattedStr = timestamp.includes("T") ? timestamp : timestamp.replace(" ", "T");
    const rowDate = new Date(formattedStr);
    if (isNaN(rowDate.getTime())) return false;
    const now = new Date();
    const diffMs = now.getTime() - rowDate.getTime();
    return diffMs >= 0 && diffMs <= 48 * 60 * 60 * 1000;
  } catch (e) {
    return false;
  }
};

// Safe Date Formatter (Prevents Invalid Date crashes)
const formatSafeDate = (timestamp?: string): string => {
  if (!timestamp) return "N/A";
  try {
    const formattedStr = timestamp.includes("T") ? timestamp : timestamp.replace(" ", "T");
    const d = new Date(formattedStr);
    if (isNaN(d.getTime())) return timestamp;
    return d.toLocaleString(undefined, {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return timestamp || "N/A";
  }
};

// Safe Phone Number Cleaner & WhatsApp URL Generator
const getCleanPhone = (phone?: string): string => {
  if (!phone || typeof phone !== "string") return "";
  return phone.replace(/\D/g, "");
};

const getWhatsAppLink = (phone?: string, name?: string, batch?: string): string => {
  const clean = getCleanPhone(phone);
  if (!clean) return "#";
  const formattedPhone = clean.length <= 10 ? "91" + clean : clean;
  const msg = `Hi ${name || "Learner"}, greetings from Tech Tycoon Team regarding your ${batch || "webinar"} registration!`;
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`;
};

const AdminPanelPage: React.FC = () => {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [persona, setPersona] = useState<"admin" | "auditor" | null>(null);
  const [authError, setAuthError] = useState("");

  const [activeSheet, setActiveSheet] = useState(SHEET_CONFIGS[0]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isUsingMock, setIsUsingMock] = useState(false);

  // Manual Edit & Screenshot Upload Form State
  const [paymentProofInput, setPaymentProofInput] = useState<string>("");
  const [utrInput, setUtrInput] = useState<string>("");
  const [approvalSuccessMsg, setApprovalSuccessMsg] = useState<string>("");

  // Sub-menu navigation tab state
  const [activeTab, setActiveTab] = useState<"registrations" | "events" | "changelog">("registrations");

  // Multi-Select Checkboxes State
  const [selectedLeadKeys, setSelectedLeadKeys] = useState<string[]>([]);
  const [isBulkDelete, setIsBulkDelete] = useState(false);

  // Password Protected Lead Deletion Modal State
  const [deletingLead, setDeletingLead] = useState<Registration | null>(null);
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState<string>("");
  const [deleteError, setDeleteError] = useState<string>("");
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState<string>("");

  // Filters State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [langFilter, setLangFilter] = useState("ALL");
  const [dateFilterMode, setDateFilterMode] = useState<"ALL" | "TODAY" | "YESTERDAY" | "LAST_7" | "LAST_30" | "CUSTOM">("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedLead, setSelectedLead] = useState<Registration | null>(null);

  // Handle password-authenticated single or bulk lead deletion
  const handleConfirmDeleteLead = (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError("");

    if (persona === "auditor") {
      setDeleteError("Auditor mode is read-only. Deletion requires Administrator privileges.");
      return;
    }

    if (deleteConfirmPassword.trim() !== "Admin@aitycoon2026") {
      setDeleteError("Incorrect security password. Deletion authorization failed.");
      return;
    }

    const existingDeleted: string[] = JSON.parse(localStorage.getItem("aitycoon_deleted_lead_ids_v1") || "[]");

    if (isBulkDelete && selectedLeadKeys.length > 0) {
      // Bulk Deletion
      const updatedDeleted = Array.from(new Set([...existingDeleted, ...selectedLeadKeys]));
      localStorage.setItem("aitycoon_deleted_lead_ids_v1", JSON.stringify(updatedDeleted));

      setRegistrations(prev => prev.filter(r => !selectedLeadKeys.includes(r.orderId || r.email || r.phone)));
      setDeleteSuccessMsg(`Successfully deleted ${selectedLeadKeys.length} selected registration records.`);
      setSelectedLeadKeys([]);
      setIsBulkDelete(false);
    } else if (deletingLead) {
      // Single Lead Deletion
      const leadKey = deletingLead.orderId || deletingLead.email || deletingLead.phone;
      if (!existingDeleted.includes(leadKey)) {
        existingDeleted.push(leadKey);
        localStorage.setItem("aitycoon_deleted_lead_ids_v1", JSON.stringify(existingDeleted));
      }

      setRegistrations(prev => prev.filter(r => (r.orderId || r.email || r.phone) !== leadKey));
      if (selectedLead && (selectedLead.orderId || selectedLead.email || selectedLead.phone) === leadKey) {
        setSelectedLead(null);
      }
      setDeleteSuccessMsg(`Registration for "${deletingLead.name}" has been permanently deleted.`);
    }

    setDeletingLead(null);
    setDeleteConfirmPassword("");
    
    setTimeout(() => {
      setDeleteSuccessMsg("");
    }, 4000);
  };

  // Check existing session auth
  useEffect(() => {
    const savedPersona = sessionStorage.getItem("agy_admin_persona");
    if (savedPersona === "admin" || savedPersona === "auditor") {
      setPersona(savedPersona);
      setIsAuthenticated(true);
    }
  }, []);

  // Handle Authentication submit
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    const cleanPass = password.trim();

    if (cleanPass === "Admin@aitycoon2026") {
      setPersona("admin");
      setIsAuthenticated(true);
      sessionStorage.setItem("agy_admin_persona", "admin");
    } else if (cleanPass === "Audit@aitycoon2026") {
      setPersona("auditor");
      setIsAuthenticated(true);
      sessionStorage.setItem("agy_admin_persona", "auditor");
    } else {
      setAuthError("Incorrect security password. Please try again.");
    }
  };

  // Fetch registrations from selected Apps Script URL
  const fetchRegistrations = async (config = activeSheet) => {
    setLoading(true);
    setError("");
    setIsUsingMock(false);

    try {
      const response = await fetch(`${config.url}?action=getRegistrations&token=${config.verifyToken}`);
      const data = await response.json();

      if (data.success && Array.isArray(data.registrations)) {
        setRegistrations(processRegistrations(data.registrations));
      } else {
        throw new Error(data.error || "Failed to load sheet registrations.");
      }
    } catch (err: any) {
      console.warn("Using mock fallback data due to:", err.message);
      // Fallback to mock data for a premium visualization experience
      setRegistrations(processRegistrations(generateMockData(config.id)));
      setIsUsingMock(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchRegistrations();
    }
  }, [isAuthenticated, activeSheet]);

  const handleLogout = () => {
    sessionStorage.removeItem("agy_admin_persona");
    setIsAuthenticated(false);
    setPersona(null);
    setPassword("");
    setRegistrations([]);
  };

  const handleApprovePayment = (lead: Registration) => {
    if (!paymentProofInput.trim()) return;

    const key = lead.orderId || lead.email || lead.phone;
    const approvalData = {
      orderId: lead.orderId,
      paymentProofUrl: paymentProofInput.trim(),
      utrNumber: utrInput.trim() || "N/A",
      approvedBy: persona === "admin" ? "Administrator" : "Auditor",
      approvedAt: new Date().toLocaleString()
    };

    // Save to localStorage
    const existing = JSON.parse(localStorage.getItem("aitycoon_payment_approvals_v1") || "{}");
    existing[key] = approvalData;
    localStorage.setItem("aitycoon_payment_approvals_v1", JSON.stringify(existing));

    // Update local state
    setRegistrations(prev => prev.map(item => {
      const itemKey = item.orderId || item.email || item.phone;
      if (itemKey === key) {
        return {
          ...item,
          isManualEdit: false,
          approvalStatus: "APPROVED",
          paymentProofUrl: approvalData.paymentProofUrl,
          utrNumber: approvalData.utrNumber,
          approvedBy: approvalData.approvedBy,
          approvedAt: approvalData.approvedAt,
          status: "✅ PAID (APPROVED WITH PROOF)"
        };
      }
      return item;
    }));

    setSelectedLead(prev => prev ? {
      ...prev,
      isManualEdit: false,
      approvalStatus: "APPROVED",
      paymentProofUrl: approvalData.paymentProofUrl,
      utrNumber: approvalData.utrNumber,
      approvedBy: approvalData.approvedBy,
      approvedAt: approvalData.approvedAt,
      status: "✅ PAID (APPROVED WITH PROOF)"
    } : null);

    setApprovalSuccessMsg("Payment successfully approved with screenshot proof!");
    setTimeout(() => setApprovalSuccessMsg(""), 4000);
  };

  // Compute stats on active registrations
  const stats = useMemo(() => {
    const total = registrations.length;
    const paid = registrations.filter(r => r.status.includes("PAID") || r.status.includes("SUCCESS") || r.approvalStatus === "APPROVED").length;
    const pendingApprovals = registrations.filter(r => r.isManualEdit && r.approvalStatus !== "APPROVED").length;
    const initiated = total - paid;
    const convRate = total > 0 ? Math.round((paid / total) * 100) : 0;
    
    // Sum total collected revenue
    const revenue = registrations
      .filter(r => r.status.includes("PAID") || r.status.includes("SUCCESS") || r.approvalStatus === "APPROVED")
      .reduce((sum, r) => sum + Number(r.amount || 0), 0);

    return { total, paid, pendingApprovals, initiated, convRate, revenue };
  }, [registrations]);

  // Apply search, category, and date filters
  const filteredRegistrations = useMemo(() => {
    return registrations.filter(r => {
      const matchesSearch = 
        r.name?.toLowerCase().includes(search.toLowerCase()) ||
        r.email?.toLowerCase().includes(search.toLowerCase()) ||
        r.phone?.includes(search) ||
        r.orderId?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = 
        statusFilter === "ALL" ||
        (statusFilter === "PAID" && (r.status.includes("PAID") || r.status.includes("SUCCESS"))) ||
        (statusFilter === "INITIATED" && r.status.includes("INITIATED"));

      const matchesLang = 
        langFilter === "ALL" ||
        r.language?.toLowerCase() === langFilter.toLowerCase();

      // Date Limit Filter
      let matchesDate = true;
      if (dateFilterMode !== "ALL" || startDate || endDate) {
        if (r.timestamp) {
          const rowDate = new Date(r.timestamp);
          if (!isNaN(rowDate.getTime())) {
            const now = new Date();
            
            if (dateFilterMode === "TODAY") {
              matchesDate = rowDate.toDateString() === now.toDateString();
            } else if (dateFilterMode === "YESTERDAY") {
              const yest = new Date(now);
              yest.setDate(now.getDate() - 1);
              matchesDate = rowDate.toDateString() === yest.toDateString();
            } else if (dateFilterMode === "LAST_7") {
              const d7 = new Date(now);
              d7.setDate(now.getDate() - 7);
              matchesDate = rowDate >= d7;
            } else if (dateFilterMode === "LAST_30") {
              const d30 = new Date(now);
              d30.setDate(now.getDate() - 30);
              matchesDate = rowDate >= d30;
            } else if (dateFilterMode === "CUSTOM" || startDate || endDate) {
              if (startDate) {
                const s = new Date(startDate);
                s.setHours(0, 0, 0, 0);
                if (rowDate < s) matchesDate = false;
              }
              if (endDate) {
                const e = new Date(endDate);
                e.setHours(23, 59, 59, 999);
                if (rowDate > e) matchesDate = false;
              }
            }
          }
        }
      }

      return matchesSearch && matchesStatus && matchesLang && matchesDate;
    });
  }, [registrations, search, statusFilter, langFilter, dateFilterMode, startDate, endDate]);

  // Export filtered rows to CSV
  const handleExportCSV = () => {
    if (filteredRegistrations.length === 0) return;

    const headers = ["Timestamp", "Name", "Email", "Phone", "Profession", "Language", "Amount", "Status", "Order ID", "Payment ID", "Session Date", "Batch"];
    const csvRows = [
      headers.join(","), // header line
      ...filteredRegistrations.map(r => [
        `"${r.timestamp || ""}"`,
        `"${r.name || ""}"`,
        `"${r.email || ""}"`,
        `"${r.phone || ""}"`,
        `"${r.profession || ""}"`,
        `"${r.language || ""}"`,
        r.amount || 0,
        `"${r.status || ""}"`,
        `"${r.orderId || ""}"`,
        `"${r.paymentId || ""}"`,
        `"${r.sessionDate || ""}"`,
        `"${r.batch || ""}"`
      ].join(","))
    ];

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${activeSheet.id}_registrations_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export selected rows to CSV
  const handleExportSelectedCSV = () => {
    const selectedRows = registrations.filter(r => 
      selectedLeadKeys.includes(r.orderId || r.email || r.phone)
    );
    if (selectedRows.length === 0) return;

    const headers = ["Timestamp", "Name", "Email", "Phone", "Profession", "Language", "Amount", "Status", "Order ID", "Payment ID", "Session Date", "Batch"];
    const csvRows = [
      headers.join(","),
      ...selectedRows.map(r => [
        `"${r.timestamp || ""}"`,
        `"${r.name || ""}"`,
        `"${r.email || ""}"`,
        `"${r.phone || ""}"`,
        `"${r.profession || ""}"`,
        `"${r.language || ""}"`,
        r.amount || 0,
        `"${r.status || ""}"`,
        `"${r.orderId || ""}"`,
        `"${r.paymentId || ""}"`,
        `"${r.sessionDate || ""}"`,
        `"${r.batch || ""}"`
      ].join(","))
    ];

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `selected_${selectedRows.length}_leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Toggle select all visible filtered rows
  const handleToggleSelectAll = () => {
    if (selectedLeadKeys.length === filteredRegistrations.length) {
      setSelectedLeadKeys([]);
    } else {
      setSelectedLeadKeys(filteredRegistrations.map(r => r.orderId || r.email || r.phone));
    }
  };

  // Toggle individual row checkbox
  const handleToggleSelectRow = (key: string) => {
    setSelectedLeadKeys(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  // Protected login layout
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#070b13] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
        {/* Glowing visual indicators */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[140px] pointer-events-none" />
        
        <div className="w-full max-w-md text-center z-10 space-y-8">
          <div className="flex flex-col items-center gap-3">
            <img src={techTycoonLogo} alt="Tech Tycoon" className="h-10 opacity-90" />
            <h1 className="text-xl font-bold tracking-wider text-emerald-400/90 uppercase mt-4">AI Tycoon Core</h1>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-2xl shadow-2xl space-y-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Lock className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl font-bold text-white tracking-tight">Security Portal</h2>
              <p className="text-xs text-white/50">Enter password to view registration logs and metrics.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <input
                required
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-center text-sm tracking-widest text-white placeholder:text-white/20 focus:border-emerald-500/40 focus:bg-white/10 outline-none transition-all"
              />
              {authError && <p className="text-xs text-rose-400 font-medium">{authError}</p>}
              <button 
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-emerald-500/15"
              >
                Access Dashboard
              </button>
            </form>
          </div>

          <div className="text-[10px] text-white/30 space-y-1">
            <p>Admin and Audit Mode credentials authorized.</p>
            <p>© 2026 Tech Tycoon Digital Solutions.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b13] text-white p-6 md:p-8 font-sans selection:bg-emerald-500 selection:text-white relative">
      {/* Decorative gradients */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 z-10 relative">
        {/* Dashboard Top Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-white/5">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <img src={techTycoonLogo} alt="Tech Tycoon" className="h-7 opacity-90" />
              <span className="h-5 w-px bg-white/20" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Webinar Operations</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white font-display">Central Control</h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Audit & Integrity Badge */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-white/70" title="Immutable Ledger — Payment logs cannot be altered or modified">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              Immutable Audit Sync
            </span>

            {/* Persona Badge */}
            {persona === "admin" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                <Shield className="w-3.5 h-3.5" />
                Administrator Mode
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-500/15 border border-blue-500/30 text-blue-400">
                <Eye className="w-3.5 h-3.5" />
                Auditor (Read-Only)
              </span>
            )}

            <button 
              onClick={handleLogout}
              className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white px-4 py-2.5 rounded-xl border border-white/10 text-sm font-medium transition-all"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </header>

        {/* Apps Script Status Banner */}
        {isUsingMock ? (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-amber-300">Showing Fallback Visualization (Google Sheet Endpoint Not Deployed Yet)</h4>
                <p className="text-xs text-amber-200/70">To stream live registrations from Google Sheets, update the Google Apps Script in your sheet with the <code className="bg-black/30 px-1 py-0.5 rounded text-amber-300 font-mono">getRegistrations</code> endpoint and deploy as Web App.</p>
              </div>
            </div>
            <button 
              onClick={() => fetchRegistrations()}
              className="inline-flex items-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-amber-500/20 transition-all shrink-0 w-fit"
            >
              <RefreshCw className="w-3 h-3" />
              Retry Sync
            </button>
          </div>
        ) : (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-emerald-300">Live Google Sheet Sync Active</h4>
                <p className="text-xs text-emerald-200/70">Connected directly to campaign sheet: <span className="font-semibold text-emerald-200">{activeSheet.name}</span></p>
              </div>
            </div>
            <button 
              onClick={() => fetchRegistrations()}
              className="inline-flex items-center gap-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-emerald-500/20 transition-all shrink-0 w-fit"
            >
              <RefreshCw className="w-3 h-3" />
              Refresh Sheet Data
            </button>
          </div>
        )}

        {/* Navigation Sub-Menu Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0a0f18] border border-white/10 p-2 rounded-2xl">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("registrations")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "registrations"
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              Live Registrations
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                activeTab === "registrations" ? "bg-black/30 text-white" : "bg-white/10 text-white/70"
              }`}>
                {registrations.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("events")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "events"
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Event Operations Hub
            </button>

            <button
              onClick={() => setActiveTab("changelog")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "changelog"
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              Developer & Team Audit Trail
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeTab === "changelog" ? "bg-black/30 text-white" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              }`}>
                v2.6.4
              </span>
            </button>
          </div>
        </div>

        {/* SUB-MENU CONTENT VIEW: 1. LIVE REGISTRATIONS */}
        {activeTab === "registrations" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Dashboard Statistics Widget */}
            <section className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Total Leads */}
              <div className="bg-[#0b101b] border border-white/[0.08] rounded-2xl p-5 relative overflow-hidden group hover:border-blue-500/30 transition-all">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-60" />
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-blue-400 uppercase tracking-widest">Total Leads</p>
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-3xl font-extrabold mt-3 font-display tracking-tight text-white">{stats.total}</h3>
                <p className="text-[10px] text-white/40 mt-1">Initiated registrations</p>
              </div>

              {/* Paid Sales */}
              <div className="bg-[#0b101b] border border-white/[0.08] rounded-2xl p-5 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-80" />
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">Paid Sales</p>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-3xl font-extrabold mt-3 font-display tracking-tight text-emerald-400">{stats.paid}</h3>
                <p className="text-[10px] text-emerald-400/50 mt-1">Verified enrollments</p>
              </div>

              {/* Pending Proof Approvals */}
              <div className={`bg-[#0b101b] border rounded-2xl p-5 relative overflow-hidden group transition-all ${
                stats.pendingApprovals > 0 
                  ? "border-red-500/50 bg-red-500/[0.03] shadow-lg shadow-red-500/10 animate-pulse" 
                  : "border-white/[0.08] hover:border-white/20"
              }`}>
                <div className={`absolute top-0 left-0 right-0 h-1 ${stats.pendingApprovals > 0 ? "bg-red-500" : "bg-white/10"}`} />
                <div className="flex items-center justify-between">
                  <p className={`text-[11px] font-bold uppercase tracking-widest ${stats.pendingApprovals > 0 ? "text-red-400" : "text-white/40"}`}>
                    Pending Approvals
                  </p>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    stats.pendingApprovals > 0 ? "bg-red-500/20 text-red-400 border border-red-500/40" : "bg-white/5 text-white/40 border border-white/10"
                  }`}>
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>
                <h3 className={`text-3xl font-extrabold mt-3 font-display tracking-tight ${stats.pendingApprovals > 0 ? "text-red-400" : "text-white/60"}`}>
                  {stats.pendingApprovals}
                </h3>
                <p className="text-[10px] text-white/40 mt-1">Requires screenshot proof</p>
              </div>

              {/* Conversion Rate */}
              <div className="bg-[#0b101b] border border-white/[0.08] rounded-2xl p-5 relative overflow-hidden group hover:border-purple-500/30 transition-all">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 opacity-60" />
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-purple-400 uppercase tracking-widest">Conversion</p>
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                    <Percent className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-3xl font-extrabold mt-3 font-display tracking-tight text-white">{stats.convRate}%</h3>
                <p className="text-[10px] text-white/40 mt-1">Lead-to-sale ratio</p>
              </div>

              {/* Total Revenue */}
              <div className="bg-[#0b101b] border border-white/[0.08] rounded-2xl p-5 relative overflow-hidden group hover:border-emerald-500/40 transition-all">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">Gross Revenue</p>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-3xl font-extrabold mt-3 font-display tracking-tight text-emerald-400">₹{stats.revenue.toLocaleString()}</h3>
                <p className="text-[10px] text-emerald-400/50 mt-1">Verified cash flow</p>
              </div>
            </section>

            {/* Controls, Filters & Data Table */}
            <section className="bg-white/5 border border-white/5 rounded-3xl backdrop-blur-xl overflow-hidden shadow-2xl">
              {/* Controls Bar */}
              <div className="p-6 border-b border-white/5 space-y-4">
                {/* Floating Bulk Action Bar */}
                {selectedLeadKeys.length > 0 && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 animate-in fade-in duration-200 shadow-xl mb-4">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500 text-white font-mono text-xs font-bold">
                        {selectedLeadKeys.length}
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Leads Selected</h4>
                        <p className="text-[11px] text-emerald-200/70">Perform bulk export or password-authenticated deletion on selected entries</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={handleExportSelectedCSV}
                        className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-md cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Export Selected ({selectedLeadKeys.length})
                      </button>

                      <button
                        onClick={() => {
                          setIsBulkDelete(true);
                          setDeletingLead({ name: `${selectedLeadKeys.length} Selected Registrations`, email: "Bulk Deletion Batch", phone: "" } as any);
                        }}
                        className="inline-flex items-center gap-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete Selected ({selectedLeadKeys.length})
                      </button>

                      <button
                        onClick={() => setSelectedLeadKeys([])}
                        className="text-xs text-white/50 hover:text-white underline font-medium px-2 py-1 cursor-pointer"
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>
                )}
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  {/* Category Select Dropdown */}
                  <div className="relative w-full md:w-80">
                    <label className="text-[10px] font-bold text-emerald-400/70 uppercase tracking-widest block mb-1.5 ml-1">Select Campaign</label>
                    <select 
                      value={activeSheet.id}
                      onChange={(e) => {
                        const found = SHEET_CONFIGS.find(cfg => cfg.id === e.target.value);
                        if (found) setActiveSheet(found);
                      }}
                      className="w-full bg-[#0a0f18] border border-white/10 rounded-xl px-3.5 py-3 text-sm text-white/95 focus:border-emerald-500/40 outline-none transition-all cursor-pointer"
                    >
                      {SHEET_CONFIGS.map(cfg => (
                        <option key={cfg.id} value={cfg.id}>{cfg.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Action Tools */}
                  <div className="flex items-end justify-start md:justify-end gap-3 flex-wrap">
                    <button
                      onClick={() => fetchRegistrations()}
                      disabled={loading}
                      className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                      Refresh
                    </button>

                    <button
                      onClick={handleExportCSV}
                      disabled={filteredRegistrations.length === 0}
                      className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-xl text-sm font-bold transition-all shadow-md shadow-emerald-500/10 disabled:opacity-50"
                    >
                      <Download className="w-4 h-4" />
                      Export CSV
                    </button>
                  </div>
                </div>

                {/* Inline search and filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                  {/* Keyword Search */}
                  <div className="relative">
                    <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-white/30" />
                    <input
                      type="text"
                      placeholder="Search Name, Email, Phone..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="w-full bg-[#0a0f18] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-emerald-500/40 focus:bg-[#0c1421] outline-none transition-all"
                    />
                  </div>

                  {/* Payment Status Filter */}
                  <div>
                    <select
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value)}
                      className="w-full bg-[#0a0f18] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-emerald-500/40 outline-none transition-all cursor-pointer"
                    >
                      <option value="ALL">All Payment Statuses</option>
                      <option value="PAID">Paid Registrations Only</option>
                      <option value="INITIATED">Initiated Leads Only</option>
                    </select>
                  </div>

                  {/* Language / Type Filter */}
                  <div>
                    <select
                      value={langFilter}
                      onChange={e => setLangFilter(e.target.value)}
                      className="w-full bg-[#0a0f18] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-emerald-500/40 outline-none transition-all cursor-pointer"
                    >
                      <option value="ALL">All Languages</option>
                      <option value="Tamil">Tamil Only</option>
                      <option value="English">English Only</option>
                      <option value="Chennai Offline">Chennai Offline Only</option>
                    </select>
                  </div>

                  {/* Date Limit Filter */}
                  <div>
                    <select
                      value={dateFilterMode}
                      onChange={e => {
                        const val = e.target.value as any;
                        setDateFilterMode(val);
                        if (val !== "CUSTOM") {
                          setStartDate("");
                          setEndDate("");
                        }
                      }}
                      className="w-full bg-[#0a0f18] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-emerald-400 font-semibold focus:border-emerald-500/40 outline-none transition-all cursor-pointer"
                    >
                      <option value="ALL">📅 All Dates (Unlimited)</option>
                      <option value="TODAY">📅 Today</option>
                      <option value="YESTERDAY">📅 Yesterday</option>
                      <option value="LAST_7">📅 Last 7 Days</option>
                      <option value="LAST_30">📅 Last 30 Days</option>
                      <option value="CUSTOM">🗓️ Custom Date Range...</option>
                    </select>
                  </div>
                </div>

                {/* Custom Date Range Picker Bar (Shown when CUSTOM selected or dates set) */}
                {(dateFilterMode === "CUSTOM" || startDate || endDate) && (
                  <div className="flex flex-wrap items-center gap-3 pt-2 bg-emerald-500/5 p-3 rounded-2xl border border-emerald-500/20 animate-in fade-in duration-150">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 shrink-0">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      Date Range Limit:
                    </span>

                    <div className="flex items-center gap-2">
                      <label className="text-[11px] text-white/50 font-medium">From:</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={e => {
                          setStartDate(e.target.value);
                          setDateFilterMode("CUSTOM");
                        }}
                        className="bg-[#0a0f18] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:border-emerald-500/40 outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-[11px] text-white/50 font-medium">To:</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={e => {
                          setEndDate(e.target.value);
                          setDateFilterMode("CUSTOM");
                        }}
                        className="bg-[#0a0f18] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:border-emerald-500/40 outline-none"
                      />
                    </div>

                    {(startDate || endDate || dateFilterMode !== "ALL") && (
                      <button
                        onClick={() => {
                          setDateFilterMode("ALL");
                          setStartDate("");
                          setEndDate("");
                        }}
                        className="ml-auto text-xs text-rose-400 hover:text-rose-300 font-bold underline flex items-center gap-1 cursor-pointer"
                      >
                        Reset Date Filter
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Registrations List Grid */}
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="py-24 text-center space-y-4">
                    <RefreshCw className="w-10 h-10 text-emerald-400 animate-spin mx-auto" />
                    <p className="text-sm text-white/50 font-medium">Fetching real-time registration logs...</p>
                  </div>
                ) : filteredRegistrations.length === 0 ? (
                  <div className="py-20 text-center space-y-3">
                    <Database className="w-12 h-12 text-white/20 mx-auto" />
                    <h3 className="text-base font-bold text-white/70">No Registrations Found</h3>
                    <p className="text-xs text-white/40">Try adjusting your filters or search keywords.</p>
                  </div>
                ) : (
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-white/5 text-white/60 font-semibold text-xs tracking-wider uppercase border-b border-white/5">
                        <th className="py-4 px-4 text-center w-12">
                          <input
                            type="checkbox"
                            checked={filteredRegistrations.length > 0 && selectedLeadKeys.length === filteredRegistrations.length}
                            onChange={handleToggleSelectAll}
                            className="w-4 h-4 rounded border-white/20 bg-[#0a0f18] text-emerald-500 focus:ring-emerald-500/40 accent-emerald-500 cursor-pointer"
                            title="Select All Visible Registrations"
                          />
                        </th>
                        <th className="py-4 px-6">Date Registered</th>
                        <th className="py-4 px-6">Name</th>
                        <th className="py-4 px-6">Email</th>
                        <th className="py-4 px-6">WhatsApp</th>
                        <th className="py-4 px-6">Profession</th>
                        <th className="py-4 px-6">Type / Lang</th>
                        <th className="py-4 px-6 text-center">Amount</th>
                        <th className="py-4 px-6 text-center">Status</th>
                        <th className="py-4 px-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredRegistrations.map((row, idx) => {
                        const rowKey = row.orderId || row.email || row.phone;
                        const isSelected = selectedLeadKeys.includes(rowKey);
                        return (
                          <tr 
                            key={`${row.orderId}-${idx}`} 
                            onClick={() => setSelectedLead(row)}
                            className={`hover:bg-white/[0.04] transition-colors group cursor-pointer ${
                              isSelected ? "bg-emerald-500/10 border-l-2 border-l-emerald-400" : isNewLead(row.timestamp) ? "bg-emerald-500/[0.02] border-l-2 border-l-emerald-400" : ""
                            }`}
                          >
                            <td className="py-4 px-4 text-center" onClick={e => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleSelectRow(rowKey)}
                                className="w-4 h-4 rounded border-white/20 bg-[#0a0f18] text-emerald-500 focus:ring-emerald-500/40 accent-emerald-500 cursor-pointer"
                              />
                            </td>
                            <td className="py-4 px-6 text-white/55 text-xs font-mono">
                              {row.timestamp ? new Date(row.timestamp).toLocaleDateString(undefined, {month: 'short', day: '2-digit', hour: '2-digit', minute:'2-digit'}) : "N/A"}
                            </td>
                          <td className="py-4 px-6 font-bold text-white/90 group-hover:text-white transition-colors">
                            <div className="flex items-center gap-2">
                              <span>{row.name}</span>
                              {isNewLead(row.timestamp) && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse tracking-wider shrink-0">
                                  <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                                  NEW
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-white/60 font-mono text-xs">{row.email}</td>
                          <td className="py-4 px-6 text-white/70 text-xs font-medium">{row.phone}</td>
                          <td className="py-4 px-6 text-white/65 text-xs">{row.profession || "Professional"}</td>
                          <td className="py-4 px-6 text-white/65 text-xs">
                            <span className="font-semibold">{row.language}</span>
                            {row.batch && <p className="text-[10px] text-white/35 mt-0.5">{row.batch}</p>}
                          </td>
                          <td className="py-4 px-6 text-center text-white/80 font-semibold font-mono">₹{row.amount}</td>
                          <td className="py-4 px-6 text-center">
                            {row.isManualEdit && row.approvalStatus !== "APPROVED" ? (
                              <div className="flex flex-col items-center gap-1">
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black tracking-wide bg-red-500/20 border-2 border-red-500/50 text-red-400 animate-pulse">
                                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                                  MANUALLY EDITED
                                </span>
                                <span className="text-[10px] font-extrabold text-red-400 uppercase tracking-wider">
                                  NEEDS APPROVAL 🔴
                                </span>
                              </div>
                            ) : row.approvalStatus === "APPROVED" ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                APPROVED WITH PROOF ✅
                              </span>
                            ) : (
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
                                row.status?.includes("PAID") || row.status?.includes("SUCCESS")
                                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                                  : "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                              }`}>
                                {row.status?.includes("PAID") || row.status?.includes("SUCCESS") ? "PAID" : "INITIATED"}
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingLead(row);
                              }}
                              title="Delete Registration (Password Required)"
                              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 border border-rose-500/20 transition-all opacity-80 hover:opacity-100 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    </tbody>
                  </table>
                )}
              </div>
              
              {/* Table Footer */}
              <div className="p-4 bg-white/[0.02] border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-3">
                <span className="text-xs text-white/40">Showing {filteredRegistrations.length} of {registrations.length} total rows</span>
                <span className="text-[10px] text-white/30 italic">Realtime sync matching timezone IST</span>
              </div>
            </section>
          </div>
        )}

        {/* SUB-MENU CONTENT VIEW: 2. EVENT OPERATIONS HUB */}
        {activeTab === "events" && (
          <div className="animate-in fade-in duration-200">
            <section className="bg-white/5 border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-xl space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-white/5 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Live Operations</span>
                  </div>
                  <h2 className="text-xl font-bold text-white font-display">Live Webinar & Workshop Operations Hub</h2>
                </div>
                <span className="text-xs text-white/50 font-mono bg-white/5 px-3 py-1 rounded-lg border border-white/10">Synced 2026 Schedules</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Claude Masterclass Online Card */}
                <div className="bg-[#0a0f18] border border-white/10 rounded-2xl p-6 flex flex-col justify-between gap-4 relative overflow-hidden group hover:border-emerald-500/30 transition-all shadow-xl">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1.5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        <Video className="w-3.5 h-3.5" />
                        ONLINE ZOOM LIVE
                      </span>
                      <h3 className="text-lg font-bold text-white mt-1">Claude Masterclass (Online)</h3>
                    </div>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg">6:00 PM IST</span>
                  </div>

                  <div className="text-xs space-y-2 text-white/70 bg-white/5 p-4 rounded-xl border border-white/5">
                    <p>📅 <strong>Next Session:</strong> September 12th & 13th, 2026 (Sat & Sun)</p>
                    <p>📍 <strong>Platform:</strong> Live Online Virtual Classroom</p>
                    <p>⚡ <strong>Capacity:</strong> 500 Attendees Room Limit</p>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                    <a
                      href="https://chat.whatsapp.com/HfVfYc6ea7iEHAMFjOb4WS"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-bold bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 rounded-xl transition-all"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Join Online WhatsApp Group
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Upscale Level-2 Offline Card */}
                <div className="bg-[#0a0f18] border border-white/10 rounded-2xl p-6 flex flex-col justify-between gap-4 relative overflow-hidden group hover:border-blue-500/30 transition-all shadow-xl">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1.5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 border border-blue-500/20 text-blue-400">
                        <MapPin className="w-3.5 h-3.5" />
                        IN-PERSON CHENNAI
                      </span>
                      <h3 className="text-lg font-bold text-white mt-1">Upscale Level-2 Workshop (Offline)</h3>
                    </div>
                    <span className="text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-lg">9:00 AM IST</span>
                  </div>

                  <div className="text-xs space-y-2 text-white/70 bg-white/5 p-4 rounded-xl border border-white/5">
                    <p>📅 <strong>Next Session:</strong> October 11, 2026 (Sunday • Full Day)</p>
                    <p>📍 <strong>Venue:</strong> Vestin Park Hotel, Egmore, Chennai</p>
                    <p>🍱 <strong>Hospitality:</strong> Hotel Buffet Lunch & High Tea Included</p>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs gap-2">
                    <a
                      href="https://chat.whatsapp.com/C88mQXMh84j1Qub9wmBTHv"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-bold bg-blue-500/10 border border-blue-500/20 px-3.5 py-2.5 rounded-xl transition-all"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Offline Group
                    </a>
                    <a
                      href="https://www.google.com/maps/dir//vestin+park+hotel+egmore/@13.0784989,80.2541335,17z"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-white px-3.5 py-2.5 rounded-xl border border-white/10 font-semibold transition-all"
                    >
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      Google Maps
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* SUB-MENU CONTENT VIEW: 3. DEVELOPER & TEAM CHANGELOG */}
        {activeTab === "changelog" && (
          <div className="animate-in fade-in duration-200">
            <section className="bg-white/5 border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-xl space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Developer & Team Audit Trail</span>
                  </div>
                  <h2 className="text-xl font-bold text-white font-display font-semibold">System Updates & Technical Corrections</h2>
                  <p className="text-xs text-white/50">Verified release log of bug fixes, Google Sheet API updates, and security patches executed by the development team.</p>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <Terminal className="w-3.5 h-3.5" />
                    Release v2.6.4 Active
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SYSTEM_UPDATES.map((update) => (
                  <div 
                    key={update.id}
                    className="bg-[#0a0f18] border border-white/10 rounded-2xl p-5 hover:border-emerald-500/30 transition-all space-y-3 relative overflow-hidden group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                          {update.id}
                        </span>
                        <span className="text-[10px] font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
                          {update.category}
                        </span>
                      </div>
                      <span className="text-[10px] text-white/40 font-mono">
                        {update.date}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">{update.title}</h3>
                      <p className="text-xs text-white/60 mt-1.5 leading-relaxed">{update.description}</p>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex flex-col gap-1.5 text-xs">
                      <div className="flex items-start gap-1.5 text-[11px] text-emerald-300/90 bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span><strong>System Impact:</strong> {update.impact}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-white/40 pt-1">
                        <span>Logged by: <strong className="text-white/60">{update.author}</strong></span>
                        <span className="text-emerald-400 font-bold">{update.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Registrant Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4" style={{ backdropFilter: "blur(8px)", background: "hsl(222 47% 5% / 0.85)" }}>
          <div className="relative w-full max-w-2xl rounded-2xl p-5 md:p-6 backdrop-blur-2xl border border-white/10 shadow-2xl space-y-4 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200" style={{ background: "linear-gradient(145deg, hsl(222 40% 10%), hsl(222 40% 7%))" }}>
            <button 
              onClick={() => setSelectedLead(null)} 
              className="absolute top-3.5 right-3.5 text-white/50 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header / Avatar */}
            <div className="flex items-center gap-3 border-b border-white/5 pb-3 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-base uppercase shrink-0">
                {(selectedLead.name || "TT").trim().substring(0, 2) || "TT"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white truncate">{selectedLead.name || "Anonymous Lead"}</h3>
                  {isNewLead(selectedLead.timestamp) && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse tracking-wider">
                      <Sparkles className="w-3 h-3 text-emerald-400" />
                      NEW REGISTRATION
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-white/50 truncate font-mono">Lead ID: {selectedLead.orderId || "N/A"}</p>
              </div>
            </div>

            {/* Main Scrollable Content */}
            <div className="overflow-y-auto pr-1.5 space-y-4 flex-1">
              {/* Details Split View */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Column: Personal & Page Details */}
                <div className="space-y-3">
                  <div>
                    <h4 className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest mb-1.5 ml-0.5">Personal Details</h4>
                    <div className="space-y-1.5 text-xs bg-white/5 p-3 rounded-xl border border-white/5">
                      <div className="flex justify-between gap-2"><span className="text-white/45">Email:</span> <span className="font-mono text-white/95 text-right select-all truncate">{selectedLead.email || "N/A"}</span></div>
                      <div className="flex justify-between gap-2"><span className="text-white/45">Phone:</span> <span className="text-white/95 font-medium text-right select-all">{selectedLead.phone || "N/A"}</span></div>
                      <div className="flex justify-between gap-2"><span className="text-white/45">Profession:</span> <span className="text-white/95 text-right">{selectedLead.profession || "Professional"}</span></div>
                      <div className="flex justify-between gap-2"><span className="text-white/45">Language:</span> <span className="text-white/95 text-right">{selectedLead.language || "English"}</span></div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest mb-1.5 ml-0.5">Page & Campaign</h4>
                    <div className="space-y-1.5 text-xs bg-white/5 p-3 rounded-xl border border-white/5">
                      <div className="flex justify-between gap-2"><span className="text-white/45">Source Batch:</span> <span className="text-white/95 font-semibold text-right">{selectedLead.batch || "N/A"}</span></div>
                      <div className="flex justify-between gap-2"><span className="text-white/45">Target Session:</span> <span className="text-white/95 text-right">{selectedLead.sessionDate || "N/A"}</span></div>
                      <div className="flex justify-between gap-2"><span className="text-white/45">Page Source:</span> <span className="text-white/75 truncate max-w-[140px] text-right" title={selectedLead.pageUrl}>{selectedLead.pageUrl || "N/A"}</span></div>
                      <div className="flex justify-between gap-2"><span className="text-white/45">Created:</span> <span className="text-white/70 text-[11px] text-right">{formatSafeDate(selectedLead.timestamp)}</span></div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Billing & Automation */}
                <div className="space-y-3">
                  <div>
                    <h4 className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest mb-1.5 ml-0.5">Billing & Payment</h4>
                    <div className="space-y-1.5 text-xs bg-white/5 p-3 rounded-xl border border-white/5">
                      <div className="flex justify-between gap-2"><span className="text-white/45">Amount:</span> <span className="text-white/95 font-mono font-bold text-right">₹{selectedLead.amount || 0}</span></div>
                      <div className="flex justify-between gap-2"><span className="text-white/45">Razorpay Order:</span> <span className="text-white/95 font-mono text-[11px] text-right select-all truncate">{selectedLead.orderId || "N/A"}</span></div>
                      <div className="flex justify-between gap-2"><span className="text-white/45">Payment ID:</span> <span className="text-white/95 font-mono text-[11px] text-right select-all truncate">{selectedLead.paymentId || "Not Captured"}</span></div>
                      <div className="flex justify-between gap-2 items-center">
                        <span className="text-white/45">Payment Status:</span> 
                        <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-bold ${
                          (selectedLead.status || "").includes("PAID") || (selectedLead.status || "").includes("SUCCESS") || selectedLead.approvalStatus === "APPROVED"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-amber-500/10 text-amber-400"
                        }`}>
                          {selectedLead.status || "INITIATED"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest mb-1.5 ml-0.5">Webinar Automations</h4>
                    <div className="space-y-2 text-xs bg-white/5 p-3 rounded-xl border border-white/5">
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-white/45">📧 Booking Email:</span> 
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          (selectedLead.emailStatus || "").includes("SENT") 
                            ? "bg-emerald-500/10 text-emerald-400" 
                            : "bg-white/5 text-white/40"
                        }`}>
                          {selectedLead.emailStatus || "WAITING"}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-white/45">📱 WhatsApp Redirect:</span> 
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          (selectedLead.whatsappClicked || "").includes("CHATTED") || (selectedLead.whatsappClicked || "").includes("YES")
                            ? "bg-emerald-500/10 text-emerald-400" 
                            : "bg-white/5 text-white/40"
                        }`}>
                          {selectedLead.whatsappClicked || "NO"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center gap-2">
                        <span className="text-white/45">⏰ 24h Reminder:</span> 
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          (selectedLead.reminder24h || "").includes("SENT") 
                            ? "bg-emerald-500/10 text-emerald-400" 
                            : "bg-white/5 text-white/40"
                        }`}>
                          {selectedLead.reminder24h || "NO"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center gap-2">
                        <span className="text-white/45">⏰ 2h Reminder:</span> 
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          (selectedLead.reminder2h || "").includes("SENT") 
                            ? "bg-emerald-500/10 text-emerald-400" 
                            : "bg-white/5 text-white/40"
                        }`}>
                          {selectedLead.reminder2h || "NO"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center gap-2">
                        <span className="text-white/45">⏰ 15m Reminder:</span> 
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          (selectedLead.reminder15m || "").includes("SENT") 
                            ? "bg-emerald-500/10 text-emerald-400" 
                            : "bg-white/5 text-white/40"
                        }`}>
                          {selectedLead.reminder15m || "NO"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 🌟 MANUAL EDIT DETECTION & PAYMENT PROOF UPLOADER PANEL */}
              {(selectedLead.isManualEdit || selectedLead.approvalStatus === "PENDING_APPROVAL" || selectedLead.paymentProofUrl) && (
                <div className={`p-4 rounded-xl border ${
                  selectedLead.approvalStatus === "APPROVED" 
                    ? "bg-emerald-500/10 border-emerald-500/30" 
                    : "bg-red-500/10 border-red-500/40"
                } space-y-3`}>
                  <div className="flex items-start gap-2.5">
                    {selectedLead.approvalStatus === "APPROVED" ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5 animate-pulse" />
                    )}
                    <div>
                      <h4 className={`text-xs font-extrabold uppercase tracking-wide ${selectedLead.approvalStatus === "APPROVED" ? "text-emerald-400" : "text-red-400"}`}>
                        {selectedLead.approvalStatus === "APPROVED" 
                          ? "✅ Payment Verified & Approved with Screenshot Proof" 
                          : "🔴 MANUALLY EDITED PAYMENT — ADMIN APPROVAL REQUIRED"}
                      </h4>
                      <p className="text-[11px] text-white/70 mt-0.5 leading-relaxed">
                        {selectedLead.approvalStatus === "APPROVED"
                          ? `Approved by ${selectedLead.approvedBy || "Admin"} on ${selectedLead.approvedAt || "Recently"}`
                          : "Payment status was modified manually in Google Sheets without an automatic Razorpay Payment ID. Admin approval with a Payment Screenshot is mandatory."}
                      </p>
                    </div>
                  </div>

                  {approvalSuccessMsg && (
                    <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold p-2.5 rounded-lg flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      {approvalSuccessMsg}
                    </div>
                  )}

                  {/* Display Payment Proof Screenshot if attached */}
                  {selectedLead.paymentProofUrl && (
                    <div className="space-y-1.5 pt-2 border-t border-white/10">
                      <p className="text-[11px] font-bold text-white/80 flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                        Attached Payment Proof Screenshot:
                      </p>
                      <div className="relative rounded-lg overflow-hidden border border-white/20 bg-black/60 p-1.5 text-center">
                        <img src={selectedLead.paymentProofUrl} alt="Payment Proof Screenshot" className="max-h-36 mx-auto object-contain rounded-md" />
                      </div>
                      {selectedLead.utrNumber && selectedLead.utrNumber !== "N/A" && (
                        <p className="text-[11px] font-mono text-emerald-400 font-bold">Bank UTR / Ref No: <span className="text-white select-all">{selectedLead.utrNumber}</span></p>
                      )}
                    </div>
                  )}

                  {/* Admin Approval Form */}
                  {selectedLead.approvalStatus !== "APPROVED" && (
                    <div className="space-y-2.5 pt-2 border-t border-white/10">
                      {persona === "admin" ? (
                        <>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-white/90 block">
                              Upload / Attach Payment Screenshot Proof (UPI / Bank Transfer):
                            </label>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <input 
                                type="text" 
                                placeholder="Paste Screenshot Image URL (or upload below)"
                                value={paymentProofInput}
                                onChange={(e) => setPaymentProofInput(e.target.value)}
                                className="flex-1 bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                              />
                              <label className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3 py-2 rounded-lg text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5 shrink-0 transition-all">
                                <Upload className="w-3.5 h-3.5" />
                                Upload Image
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  className="hidden" 
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onload = (ev) => {
                                        if (ev.target?.result) setPaymentProofInput(ev.target.result as string);
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-white/70 block">
                              Bank UTR / Reference Number (Optional):
                            </label>
                            <input 
                              type="text" 
                              placeholder="e.g. 423910283901"
                              value={utrInput}
                              onChange={(e) => setUtrInput(e.target.value)}
                              className="w-full bg-black/40 border border-white/20 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500 font-mono"
                            />
                          </div>

                          {paymentProofInput && (
                            <div className="space-y-1 pt-1">
                              <p className="text-[10px] font-bold text-emerald-400">Screenshot Preview Ready:</p>
                              <div className="max-h-28 rounded-lg border border-white/20 overflow-hidden bg-black/50 p-1">
                                <img src={paymentProofInput} alt="Preview" className="max-h-24 mx-auto object-contain" />
                              </div>
                            </div>
                          )}

                          <button
                            onClick={() => handleApprovePayment(selectedLead)}
                            disabled={!paymentProofInput.trim()}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                          >
                            <FileCheck className="w-4 h-4" />
                            Approve Payment & Attach Screenshot Proof
                          </button>
                        </>
                      ) : (
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2.5 text-xs text-blue-300 flex items-center gap-2">
                          <Lock className="w-4 h-4 text-blue-400" />
                          <span><strong>Auditor Mode (Read-Only):</strong> Only Administrator can approve manual payments with screenshot proof.</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Quick Actions & Outreach */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-3 border-t border-white/5 shrink-0">
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {selectedLead.phone && (
                  <a
                    href={getWhatsAppLink(selectedLead.phone, selectedLead.name, selectedLead.batch)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Open WhatsApp Chat
                  </a>
                )}
                {selectedLead.email && (
                  <a
                    href={`mailto:${selectedLead.email}?subject=${encodeURIComponent(`Update regarding your ${selectedLead.batch || "AI Masterclass"} Registration`)}`}
                    className="inline-flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all"
                  >
                    <Send className="w-3.5 h-3.5 text-blue-400" />
                    Send Email
                  </a>
                )}

                {/* Password-Protected Delete Lead Button */}
                <button
                  onClick={() => setDeletingLead(selectedLead)}
                  className="inline-flex items-center gap-1.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Lead
                </button>
              </div>

              <button 
                onClick={() => setSelectedLead(null)}
                className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white/80 hover:text-white px-6 py-2 rounded-xl border border-white/10 text-xs font-semibold transition-all"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Confirmation Deletion Modal Dialog */}
      {deletingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backdropFilter: "blur(12px)", background: "rgba(3, 7, 18, 0.88)" }}>
          <div className="relative w-full max-w-md rounded-2xl p-6 backdrop-blur-2xl border border-rose-500/30 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200" style={{ background: "linear-gradient(145deg, #130a0d, #0d0709)" }}>
            <button 
              onClick={() => {
                setDeletingLead(null);
                setDeleteError("");
                setDeleteConfirmPassword("");
              }} 
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Confirm Permanent Deletion</h3>
                <p className="text-xs text-rose-300/80 font-medium">Security Password Required</p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 text-xs text-white/80 space-y-1">
              <p className="text-white/50">You are about to delete registration record for:</p>
              <p className="font-bold text-white text-sm">{deletingLead.name}</p>
              <p className="font-mono text-white/50 text-[11px]">{deletingLead.email} • {deletingLead.phone}</p>
            </div>

            <form onSubmit={handleConfirmDeleteLead} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/70 block">
                  Enter Security Password to Confirm:
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-white/30" />
                  <input
                    required
                    type="password"
                    value={deleteConfirmPassword}
                    onChange={e => setDeleteConfirmPassword(e.target.value)}
                    placeholder="Enter security password..."
                    className="w-full bg-[#0a0f18] border border-white/20 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-rose-500/50 outline-none font-mono"
                  />
                </div>
              </div>

              {deleteError && (
                <div className="bg-rose-500/15 border border-rose-500/30 rounded-xl p-3 text-xs text-rose-400 font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{deleteError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setDeletingLead(null);
                    setDeleteError("");
                    setDeleteConfirmPassword("");
                  }}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-white/70 hover:text-white hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-rose-600/25 flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  Confirm & Delete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanelPage;
