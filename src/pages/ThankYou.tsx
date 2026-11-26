import React, { useEffect, useState } from "react";
import { CheckCircle, MessageSquare, ShieldCheck, Tag, FileText, AlertTriangle, Loader2 } from "lucide-react";
import { useLocation } from "react-router-dom";
import {
    InvoicePrintParams,
    VERIFIED_BACKEND_ENDPOINTS,
    fetchVerifiedInvoiceFromBackend,
    isValidRazorpayIds,
    openPrintableGstInvoice,
} from "../lib/gstUtils";

const ThankYou = () => {
    const location = useLocation();
    const [countdown, setCountdown] = useState(8);
    const [pauseRedirect, setPauseRedirect] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const [verificationError, setVerificationError] = useState<string | null>(null);
    const [verifiedInvoice, setVerifiedInvoice] = useState<InvoicePrintParams | null>(null);

    // Only paymentId and orderId are accepted as lookup keys.
    // Arbitrary URL parameters (name, amount, course, paid, etc.) are NEVER trusted to mint a PAID invoice.
    const searchParams = new URLSearchParams(location.search || window.location.search);
    const stateData = (location.state as Record<string, any>) || {};

    const paymentId = String(stateData.paymentId || searchParams.get("paymentId") || searchParams.get("pay_id") || "").trim();
    const orderId = String(stateData.orderId || searchParams.get("orderId") || "").trim();
    const coupon = String(stateData.coupon || "").trim();

    // Safe Token Recovery Architecture:
    // 1. Primary: In-memory React Router navigation state (zero browser storage or URL exposure)
    // 2. Refresh Recovery: Scoped sessionStorage + localStorage (persists across mobile app handoffs & browser redirects)
    // STRICT SECURITY: Tokens from query parameters, URL path, or URL fragment are NEVER accepted or trusted.
    const getInitialToken = (): string => {
        if (stateData.invoiceToken || stateData.token) {
            return String(stateData.invoiceToken || stateData.token).trim();
        }
        if (paymentId) {
            try {
                const stored = sessionStorage.getItem(`inv_tok_${paymentId}`);
                if (stored) {
                    const exp = parseInt(stored.split(".")[0], 10);
                    if (!isNaN(exp) && Date.now() > exp) {
                        sessionStorage.removeItem(`inv_tok_${paymentId}`);
                    } else {
                        return stored.trim();
                    }
                }
            } catch (_) {}
            try {
                const storedLocal = localStorage.getItem(`inv_tok_${paymentId}`);
                if (storedLocal) {
                    const exp = parseInt(storedLocal.split(".")[0], 10);
                    if (!isNaN(exp) && Date.now() > exp) {
                        localStorage.removeItem(`inv_tok_${paymentId}`);
                    } else {
                        return storedLocal.trim();
                    }
                }
            } catch (_) {}
        }
        // URL tokens are strictly rejected. Never accept bearer tokens from URL query strings or fragments.
        return "";
    };

    const token = getInitialToken();
    const contact = String(stateData.email || stateData.phone || searchParams.get("contact") || "").trim();
    const [retryTrigger, setRetryTrigger] = useState(0);
    const [retryStatus, setRetryStatus] = useState<string>("");

    // Defensive hygiene: Scrub any sensitive token from URL query string immediately to prevent leakage
    // in browser history, bookmarks, screenshots, or HTTP Referer headers.
    useEffect(() => {
        const currentParams = new URLSearchParams(window.location.search);
        if (currentParams.has("token")) {
            currentParams.delete("token");
            const remaining = currentParams.toString();
            const cleanUrl = `${window.location.pathname}${remaining ? `?${remaining}` : ""}${window.location.hash}`;
            window.history.replaceState({}, document.title, cleanUrl);
        }
    }, []);

    // Persist token in scoped sessionStorage and localStorage for refresh and mobile redirect support
    useEffect(() => {
        if (paymentId && token) {
            try {
                sessionStorage.setItem(`inv_tok_${paymentId}`, token);
            } catch (_) {}
            try {
                localStorage.setItem(`inv_tok_${paymentId}`, token);
            } catch (_) {}
        }
    }, [paymentId, token]);

    const inferredBackendUrl =
        stateData.backendUrl ||
        (location.pathname.includes("academy")
            ? VERIFIED_BACKEND_ENDPOINTS.academy
            : location.pathname.includes("claude")
            ? VERIFIED_BACKEND_ENDPOINTS.claude_masterclass
            : VERIFIED_BACKEND_ENDPOINTS.ai_masterclass);

    const name = stateData.name || "Learner";
    const email = stateData.email || "";
    const phone = stateData.phone || "";
    const course = stateData.course || "AI Secrets Revealed Masterclass";
    const amount = stateData.amount || "";
    const noGst = Boolean(stateData.noGst || String(course).toLowerCase().includes("academy"));
    const isClaude = Boolean(String(course).toLowerCase().includes("claude") || location.pathname.includes("claude") || searchParams.get("course")?.toLowerCase().includes("claude"));
    const isFilmmaking = Boolean(String(course).toLowerCase().includes("filmmaking") || String(course).toLowerCase().includes("video") || location.pathname.includes("filmmaking") || location.pathname.includes("video"));

    // Build the prefilled WhatsApp message triggering Meta WhatsApp Automation in Apps Script
    const prefilledMessage = [
        `HI I am completed registration of ${course}`,
        ``,
        `📋 *My Verified Registration Details:*`,
        `• *Name:* ${name}`,
        email ? `• *Email:* ${email}` : ``,
        phone ? `• *Phone:* ${phone}` : ``,
        amount ? `• *Amount Paid${noGst ? '' : ' (Incl. 18% GST)'}:* ₹${amount}` : ``,
        coupon ? `• *Coupon Applied:* ${coupon}` : ``,
        orderId ? `• *Order ID:* ${orderId}` : ``,
        paymentId ? `• *Payment ID:* ${paymentId}` : ``,
        ``,
        `${isClaude ? "Please send me my confirmed session date and Live Zoom joining link!" : "Please confirm my registration and send my access details! 🚀"}`,
    ]
        .filter(Boolean)
        .join("\n");

    const waChatLink = `https://wa.me/917010340494?text=${encodeURIComponent(prefilledMessage)}`;
    // Dedicated WhatsApp Community link per campaign
    // https://chat.whatsapp.com/EpsuzpxGz6F98ml2GUBejC is strictly for AI Masterclass
    const WA_COMMUNITY_LINK = isClaude 
        ? "https://chat.whatsapp.com/GgMP8b9Z5HIKn5duwqgnwU" 
        : isFilmmaking
        ? "https://chat.whatsapp.com/GuJIGDcfIIfDZHlG0MduvM"
        : "https://chat.whatsapp.com/EpsuzpxGz6F98ml2GUBejC";

    useEffect(() => {
        // Track Purchase event exactly once upon landing
        const isTrackedInSession = sessionStorage.getItem(`purchase_tracked_${paymentId}`);
        const alreadyTracked = stateData.alreadyTrackedPurchase || isTrackedInSession;

        if (!alreadyTracked && paymentId) {
            try {
                sessionStorage.setItem(`purchase_tracked_${paymentId}`, "true");
            } catch (_) {}

            // Meta Pixel Purchase
            if (typeof window.fbq === "function") {
                window.fbq("track", "Purchase", {
                    content_name: course,
                    currency: "INR",
                    value: Number(amount) || 117,
                }, { eventID: paymentId });
            }

            // Google Analytics 4 Purchase
            if (typeof (window as any).gtag === "function") {
                (window as any).gtag("event", "purchase", {
                    transaction_id: paymentId,
                    value: Number(amount) || 117,
                    currency: "INR",
                    items: [
                        {
                            item_id: orderId || paymentId,
                            item_name: course,
                            price: Number(amount) || 117,
                            quantity: 1
                        }
                    ]
                });
            }
        }

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    window.location.href = WA_COMMUNITY_LINK;
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [waChatLink, WA_COMMUNITY_LINK, paymentId, stateData.alreadyTrackedPurchase, course, amount, orderId]);

    const handleSendWhatsAppMessage = () => {
        if (orderId && inferredBackendUrl) {
            fetch(`${inferredBackendUrl}?action=whatsapp&orderId=${encodeURIComponent(orderId)}`).catch(() => {});
        }
        window.location.href = waChatLink;
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-4 selection:bg-sky-500 selection:text-white">
            <div className="bg-white border border-sky-200 rounded-3xl p-8 sm:p-10 max-w-lg w-full text-center shadow-2xl space-y-6 relative overflow-hidden">
                {/* Light Blue & Emerald Glow Effects */}
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-sky-200/50 rounded-full blur-3xl pointer-events-none" />

                <CheckCircle className="w-16 h-16 sm:w-20 sm:h-20 text-emerald-500 mx-auto animate-bounce" />

                <div className="space-y-2">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Payment Successful! 🎉</h1>
                    <p className="text-sm sm:text-base text-slate-600">
                        Thank you for registering for <strong className="text-sky-700">{course}</strong>.
                    </p>
                </div>

                {/* Verified Registration Details Card */}
                <div className="bg-sky-50/70 border border-sky-200 p-4 sm:p-5 rounded-2xl text-left text-xs sm:text-sm space-y-2">
                    <div className="text-xs uppercase tracking-wider text-sky-700 font-bold mb-1 flex items-center justify-between">
                        <span>Registration Confirmed:</span>
                        {coupon && (
                            <span className="bg-sky-100 text-sky-800 px-2 py-0.5 rounded border border-sky-200 flex items-center gap-1 text-[10px] font-bold">
                                <Tag className="w-3 h-3" /> Coupon: {coupon}
                            </span>
                        )}
                    </div>
                    <div className="flex justify-between py-1 border-b border-sky-200/60">
                        <span className="text-slate-500">Name:</span>
                        <span className="font-semibold text-slate-900">{name}</span>
                    </div>
                    {email && (
                        <div className="flex justify-between py-1 border-b border-sky-200/60">
                            <span className="text-slate-500">Email:</span>
                            <span className="font-semibold text-slate-900">{email}</span>
                        </div>
                    )}
                    {phone && (
                        <div className="flex justify-between py-1 border-b border-sky-200/60">
                            <span className="text-slate-500">Phone:</span>
                            <span className="font-semibold text-slate-900">{phone}</span>
                        </div>
                    )}
                    {amount && (
                        <div className="flex justify-between py-1 border-b border-sky-200/60">
                            <span className="text-slate-500">Amount Paid{noGst ? ":" : " (Incl. 18% GST):"}</span>
                            <span className="font-bold text-emerald-600">₹{amount}</span>
                        </div>
                    )}
                    {orderId && (
                        <div className="flex justify-between py-1 border-b border-sky-200/60">
                            <span className="text-slate-500">Order ID:</span>
                            <span className="font-mono text-slate-700 text-xs">{orderId}</span>
                        </div>
                    )}
                    {paymentId && (
                        <div className="flex justify-between py-1">
                            <span className="text-slate-500">Payment ID:</span>
                            <span className="font-mono text-sky-700 text-xs">{paymentId}</span>
                        </div>
                    )}
                </div>

                {/* Clean & Simple WhatsApp Community Card */}
                <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-5 text-center space-y-3">
                    <div className="flex items-center justify-center gap-2 text-emerald-950 font-bold text-base">
                        <MessageSquare className="w-5 h-5 text-emerald-600 shrink-0" />
                        <span>Join Official WhatsApp Community</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        Schedule: <strong>{isClaude ? "Every Saturday & Sunday (5:30 PM - 8:30 PM IST)" : "Tentative Every Friday (5:30 PM - 8:30 PM IST)"}</strong><br />
                        <span className="text-emerald-700 font-semibold block mt-1">
                            {isClaude ? "👉 Join our official WhatsApp group below to receive your confirmed session date & Live Zoom link!" : "Meeting link and session updates will be shared inside the community group."}
                        </span>
                    </p>
                    <a
                        href={WA_COMMUNITY_LINK}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
                    >
                        <MessageSquare className="w-5 h-5" />
                        <span>{isClaude ? "Join WhatsApp to Get Session Date" : "Join WhatsApp Community"}</span>
                    </a>
                    <p className="text-xs text-slate-500 font-medium flex items-center justify-center gap-1.5 pt-1">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Redirecting in <strong className="text-emerald-700">{countdown}</strong> seconds...</span>
                    </p>
                </div>

                <p className="text-xs text-slate-500 text-center">
                    📧 Invoice &amp; receipt sent to <strong>{email || "your registered email"}</strong>
                </p>
            </div>
        </div>
    );
};

export default ThankYou;
