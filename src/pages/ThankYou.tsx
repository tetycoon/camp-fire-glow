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
    const searchParams = new URLSearchParams(window.location.search);
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
        (location.pathname.includes("claude_masterclass")
            ? VERIFIED_BACKEND_ENDPOINTS.academy
            : VERIFIED_BACKEND_ENDPOINTS.ai_masterclass);

    useEffect(() => {
        let cancelled = false;

        async function verifyPaymentRecord() {
            setVerifying(true);
            setVerificationError(null);
            setRetryStatus("");

            if (!isValidRazorpayIds(paymentId, orderId)) {
                if (!cancelled) {
                    setVerifiedInvoice(null);
                    setVerificationError(
                        "Missing or invalid Razorpay Payment ID / Order ID. Official GST Tax Invoices can only be generated for server-verified payments."
                    );
                    setVerifying(false);
                }
                return;
            }

            // Fast-path: If server already returned verified invoice in state with valid token
            if (stateData.invoice && token) {
                try {
                    const reg = registerVerifiedInvoiceRecord(stateData.invoice);
                    if (!cancelled) {
                        setVerifiedInvoice(reg);
                        setVerificationError(null);
                        setVerifying(false);
                        return;
                    }
                } catch (_) {}
            }

            const maxAttempts = 3;
            let lastErrorMsg = "Payment verification failed. Invoice generation is blocked until payment is verified.";

            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                if (cancelled) return;
                try {
                    if (attempt > 1 && !cancelled) {
                        setRetryStatus(`Confirming payment with gateway (Attempt ${attempt} of ${maxAttempts})...`);
                    }
                    const record = await fetchVerifiedInvoiceFromBackend({
                        paymentId,
                        orderId,
                        token: token || undefined,
                        contact: contact || undefined,
                        backendUrl: stateData.backendUrl || inferredBackendUrl,
                    });
                    if (!cancelled) {
                        setVerifiedInvoice(record);
                        setVerificationError(null);
                        setVerifying(false);
                        setRetryStatus("");
                    }
                    return;
                } catch (err: any) {
                    lastErrorMsg = err?.message || lastErrorMsg;
                    // In test environments or when no token exists, fail immediately without polling delay
                    const isTestEnv = typeof process !== "undefined" && Boolean(process.env) && process.env.NODE_ENV === "test";
                    if (
                        !token ||
                        isTestEnv ||
                        lastErrorMsg.includes("UNAUTHORIZED_INVOICE_ACCESS") ||
                        lastErrorMsg.includes("MISSING_INVOICE_TOKEN_SECRET") ||
                        lastErrorMsg.includes("Missing or invalid Razorpay")
                    ) {
                        break;
                    }
                    if (attempt < maxAttempts && !cancelled) {
                        // Spaced backoff between attempts in production to allow backend row creation / webhook execution
                        await new Promise((resolve) => setTimeout(resolve, attempt * 1200));
                    }
                }
            }

            if (!cancelled) {
                setVerifiedInvoice(null);
                setVerificationError(lastErrorMsg);
                setVerifying(false);
                setRetryStatus("");
            }
        }

        verifyPaymentRecord();
        return () => {
            cancelled = true;
        };
    }, [paymentId, orderId, stateData.backendUrl, inferredBackendUrl, token, contact, retryTrigger]);

    const name = verifiedInvoice?.customerName || "Learner";
    const email = verifiedInvoice?.customerEmail || "";
    const phone = verifiedInvoice?.customerPhone || "";
    const course = verifiedInvoice?.courseName || "AI Masterclass";
    const amount = verifiedInvoice ? String(verifiedInvoice.totalAmountPaid) : "";

    // Build the prefilled WhatsApp message ONLY from verified details
    const prefilledMessage = verifiedInvoice
        ? [
              `Hello Tech Tycoon Team, I have successfully registered for ${course}!`,
              ``,
              `📋 *My Verified Registration Details:*`,
              `• *Name:* ${name}`,
              email ? `• *Email:* ${email}` : ``,
              phone ? `• *Phone:* ${phone}` : ``,
              `• *Amount Paid (Incl. 18% GST):* ₹${amount}`,
              coupon ? `• *Coupon Applied:* ${coupon}` : ``,
              `• *Order ID:* ${orderId}`,
              `• *Payment ID:* ${paymentId}`,
              ``,
              `Please send me my exclusive course access details and community link! 🚀`,
          ]
              .filter(Boolean)
              .join("\n")
        : "";

    const waChatLink = prefilledMessage
        ? `https://wa.me/917010340494?text=${encodeURIComponent(prefilledMessage)}`
        : "https://wa.me/917010340494";

    useEffect(() => {
        if (!verifiedInvoice) return;

        // Track Purchase event using global fbq ONLY after backend verification succeeds
        const isTrackedInSession = sessionStorage.getItem(`purchase_tracked_${paymentId}`);
        const alreadyTracked = stateData.alreadyTrackedPurchase || isTrackedInSession;

        if (!alreadyTracked && typeof window.fbq === "function") {
            try {
                sessionStorage.setItem(`purchase_tracked_${paymentId}`, "true");
            } catch (_) {}
            window.fbq("track", "Purchase", {
                content_name: verifiedInvoice.courseName,
                currency: "INR",
                value: verifiedInvoice.totalAmountPaid,
            });
        }

        if (pauseRedirect) return;

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    window.location.href = waChatLink;
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [verifiedInvoice, waChatLink, paymentId, stateData.alreadyTrackedPurchase, pauseRedirect]);

    const handleSendWhatsAppMessage = () => {
        if (!verifiedInvoice) return;
        if (orderId && inferredBackendUrl) {
            fetch(`${inferredBackendUrl}?action=whatsapp&orderId=${encodeURIComponent(orderId)}`).catch(() => {});
        }
        window.location.href = waChatLink;
    };

    const handleDownloadInvoice = () => {
        if (!verifiedInvoice) {
            setVerificationError("Cannot print GST Tax Invoice: payment has not been verified by the server.");
            return;
        }
        setPauseRedirect(true);
        openPrintableGstInvoice(verifiedInvoice);
    };

    if (verifying) {
        return (
            <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-4">
                <div className="bg-white border border-sky-200 rounded-3xl p-8 sm:p-10 max-w-lg w-full text-center shadow-2xl space-y-4">
                    <Loader2 className="w-12 h-12 text-sky-600 mx-auto animate-spin" />
                    <h1 className="text-2xl font-extrabold text-slate-900">Verifying Payment...</h1>
                    <p className="text-sm text-slate-600">
                        {retryStatus || "Please wait while we verify your Razorpay payment and retrieve your official GST Tax Invoice."}
                    </p>
                </div>
            </div>
        );
    }

    if (!verifiedInvoice || verificationError) {
        return (
            <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-4">
                <div
                    data-testid="unverified-invoice-guard"
                    className="bg-white border border-amber-300 rounded-3xl p-8 sm:p-10 max-w-lg w-full text-center shadow-2xl space-y-5"
                >
                    <AlertTriangle className="w-14 h-14 text-amber-500 mx-auto" />
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                        Payment Verification Required
                    </h1>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        {verificationError ||
                            "We could not verify a completed payment for this link. Official GST Tax Invoices are only generated after server-side Razorpay verification."}
                    </p>
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 text-left space-y-1">
                        <div>
                            <strong>Payment Reference:</strong> {paymentId || "Missing"}
                        </div>
                        <div>
                            <strong>Order Reference:</strong> {orderId || "Missing"}
                        </div>
                    </div>
                    {isValidRazorpayIds(paymentId, orderId) && (
                        <div className="pt-2 flex flex-col sm:flex-row gap-2">
                            <button
                                type="button"
                                onClick={() => setRetryTrigger((prev) => prev + 1)}
                                className="flex-1 bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm transition-all shadow flex items-center justify-center gap-2"
                            >
                                <Loader2 className="w-4 h-4" />
                                <span>Re-verify Payment</span>
                            </button>
                            <a
                                href="https://wa.me/917558133039?text=Hi%20Tech%20Tycoon%2C%20I%20completed%20payment%20and%20need%20help%20verifying%20my%20registration."
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm transition-all shadow flex items-center justify-center gap-2"
                            >
                                <MessageSquare className="w-4 h-4" />
                                <span>Contact Support</span>
                            </a>
                        </div>
                    )}
                    <p className="text-xs text-slate-500">
                        If your payment was deducted, please check your registered email for your GST Tax Invoice PDF or contact support at{" "}
                        <strong>+91 75581 33039</strong>.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-4 selection:bg-sky-500 selection:text-white">
            <div className="bg-white border border-sky-200 rounded-3xl p-8 sm:p-10 max-w-lg w-full text-center shadow-2xl space-y-6 relative overflow-hidden">
                {/* Light Blue & Emerald Glow Effects */}
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-sky-200/50 rounded-full blur-3xl pointer-events-none" />

                <CheckCircle className="w-16 h-16 sm:w-20 sm:h-20 text-emerald-500 mx-auto animate-bounce" />

                <div className="space-y-2">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Payment Successful!</h1>
                    <p className="text-sm sm:text-base text-slate-600">
                        Thank you for registering for <strong className="text-sky-700">{course}</strong>.
                    </p>
                </div>

                {/* Verified Registration Details Card */}
                <div className="bg-sky-50/70 border border-sky-200 p-4 sm:p-5 rounded-2xl text-left text-xs sm:text-sm space-y-2">
                    <div className="text-xs uppercase tracking-wider text-sky-700 font-bold mb-1 flex items-center justify-between">
                        <span>Verified Registration & GST Receipt:</span>
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
                    <div className="flex justify-between py-1 border-b border-sky-200/60">
                        <span className="text-slate-500">Amount Paid (Incl. 18% GST):</span>
                        <span className="font-bold text-emerald-600">₹{amount}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-sky-200/60">
                        <span className="text-slate-500">Order ID:</span>
                        <span className="font-mono text-slate-700 text-xs">{orderId}</span>
                    </div>
                    <div className="flex justify-between py-1">
                        <span className="text-slate-500">Payment ID:</span>
                        <span className="font-mono text-sky-700 text-xs">{paymentId}</span>
                    </div>
                </div>

                <div className="bg-emerald-50 text-emerald-800 p-4 rounded-2xl border border-emerald-200 text-xs sm:text-sm leading-relaxed font-medium">
                    <p>
                        Your official GST Tax Invoice has been sent to your email and synced to FunnelsDone! You can also download your verified GST Tax Invoice below. 🎉
                    </p>
                </div>

                <div className="space-y-3 pt-1">
                    <button
                        type="button"
                        onClick={handleDownloadInvoice}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-6 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2.5 text-xs sm:text-sm"
                    >
                        <FileText className="w-4 h-4 text-sky-400" />
                        <span>Download GST Tax Invoice (PDF)</span>
                    </button>

                    <button
                        onClick={handleSendWhatsAppMessage}
                        className="w-full bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold py-4 px-6 rounded-2xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-3 transform hover:-translate-y-0.5 border border-emerald-400/30 text-sm sm:text-base"
                    >
                        <MessageSquare className="w-5 h-5" />
                        <span>Click Here To Send WhatsApp Message 🚀</span>
                    </button>

                    {!pauseRedirect ? (
                        <p className="text-xs text-slate-500 flex items-center justify-center gap-1.5 font-medium">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <span>
                                Auto-redirecting to WhatsApp in <strong className="text-sky-700">{countdown}</strong> seconds...
                            </span>
                        </p>
                    ) : (
                        <p className="text-xs text-emerald-700 font-semibold">
                            ✓ Invoice opened in new tab. Click the green button above whenever you're ready to join WhatsApp!
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ThankYou;
