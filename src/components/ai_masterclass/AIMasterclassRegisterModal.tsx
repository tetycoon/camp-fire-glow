import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Loader2, ShieldCheck, X, Search } from "lucide-react";
import { useAIMasterclassRegisterModal } from "./AIMasterclassRegisterModalContext";
import { RazorpayOptions } from "@/types/razorpay";
import { getMasterclassDateStrings } from "../../lib/masterclassDateUtils";
import { countryCodes } from "../../lib/countryCodes";
import { calculateInclusiveGstBreakdown, isValidGstin, sanitizeTextInput, isAuthorizedTestEmail } from "../../lib/gstUtils";
import GstPriceBreakdown from "../common/GstPriceBreakdown";

const RAZORPAY_KEY_ID = "rzp_live_T2CbVONQc6qrqj";
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycby0fX7tjbOciJbg0Mw1SRMhlazBe4FG1Ko-f5mIFCW6Y7zGKHGZjdUZQKXclfye1FzegA/exec";


function loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
        if (document.getElementById("razorpay-script")) {
            resolve(true);
            return;
        }
        const script = document.createElement("script");
        script.id = "razorpay-script";
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}

const defaultCountry = countryCodes.find(c => c.code === "+91") || countryCodes[0];

const AIMasterclassRegisterModal: React.FC = () => {
    const navigate = useNavigate();
    const purchaseTrackedRef = useRef(false);
    const leadTrackedRef = useRef(false);
    const { isOpen, closeRegisterModal } = useAIMasterclassRegisterModal();
    const { regularDate, orderedSlots, wednesdaySlot, fridaySlot, sundaySlot, nextSession } = getMasterclassDateStrings();
    const [preferredSlotId, setPreferredSlotId] = useState<"wednesday" | "friday" | "sunday">(nextSession.id);
    const selectedSlot = orderedSlots.find(s => s.id === preferredSlotId) || nextSession;
    const [form, setForm] = useState({ name: "", email: "", phone: "", profession: "", language: "Tamil", coupon: "WELCOME33", countryCode: "+91" });
    const [claimGst, setClaimGst] = useState(false);
    const [gstin, setGstin] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [seatsCount, setSeatsCount] = useState(1);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [couponChecking, setCouponChecking] = useState(false);
    const [paymentId, setPaymentId] = useState<string>("");
    const [visible, setVisible] = useState(false);
    const [discountApplied, setDiscountApplied] = useState(false);

    const inclusiveSessionPrice = 99 * seatsCount;
    const { baseAmount: baseSessionAmount, gstAmount, totalAmount, totalInPaise } = calculateInclusiveGstBreakdown(inclusiveSessionPrice);

    // Country code search state
    const [countrySearch, setCountrySearch] = useState("");
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState(defaultCountry);
    const countryDropdownRef = useRef<HTMLDivElement>(null);
    const countryInputRef = useRef<HTMLInputElement>(null);

    const filteredCountries = useMemo(() => {
        if (!countrySearch.trim()) return countryCodes;
        const q = countrySearch.toLowerCase().trim();
        return countryCodes.filter(c =>
            c.name.toLowerCase().includes(q) ||
            c.code.includes(q) ||
            c.iso.toLowerCase().includes(q)
        );
    }, [countrySearch]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target as Node)) {
                setShowCountryDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen) {
            requestAnimationFrame(() => setVisible(true));
            document.body.style.overflow = "hidden";
        } else {
            setVisible(false);
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    const handleClose = () => {
        setVisible(false);
        setTimeout(() => {
            closeRegisterModal();
            if (!submitted) {
                setForm({ name: "", email: "", phone: "", profession: "", language: "Tamil", coupon: "WELCOME33", countryCode: "+91" });
                setClaimGst(false);
                setGstin("");
                setCompanyName("");
                setDiscountApplied(false);
                setPreferredSlotId(nextSession.id);
            }
        }, 300);
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) handleClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (claimGst) {
            if (!isValidGstin(gstin)) {
                alert("Please enter a valid 15-character Indian GSTIN (e.g., 33AAAAA0000A1Z5).");
                return;
            }
            if (!companyName.trim()) {
                alert("Please enter your registered Legal Company Name for the GST Invoice.");
                return;
            }
        }

        const safeName = sanitizeTextInput(form.name, 100);
        const safeEmail = form.email.trim().toLowerCase();
        const safeCompany = claimGst ? sanitizeTextInput(companyName, 120) : "";
        const safeGstin = claimGst ? gstin.trim().toUpperCase() : "";

        // 1. Track Meta Pixel Lead event at earliest reliable point (once per submission attempt)
        if (!leadTrackedRef.current && typeof (window as any).fbq === 'function') {
            leadTrackedRef.current = true;
            (window as any).fbq('track', 'Lead', {
                content_name: 'AI Secrets Revealed Masterclass',
                currency: 'INR',
                value: totalAmount
            });
        }

        setLoading(true);

        const loaded = await loadRazorpayScript();
        if (!loaded) {
            alert("Failed to load payment gateway.");
            setLoading(false);
            return;
        }

        const pageUrl = window.location.href;
        const isTestEmail = isAuthorizedTestEmail(safeEmail);
        const finalAmount = isTestEmail ? 100 : totalInPaise; // 100 paise (₹1) for test, else ₹117 * seatsCount

        try {
            const response = await fetch(GOOGLE_SHEET_URL, {
                method: "POST",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify({
                    userType: sanitizeTextInput(form.profession || "Professional", 60),
                    pageUrl,
                    name: safeName + (seatsCount > 1 ? ` (+ ${seatsCount - 1} Seats)` : ""),
                    email: safeEmail,
                    phone: `${form.countryCode}${form.phone.replace(/\D/g, "")}`,
                    countryCode: form.countryCode,
                    language: form.language,
                    batch: `Masterclass 2026 (${selectedSlot.timingLabel})`,
                    preferredSlot: selectedSlot.fullLabel,
                    baseAmount: isTestEmail ? 1 : baseSessionAmount,
                    gstAmount: isTestEmail ? 0 : gstAmount,
                    amount: isTestEmail ? 1 : totalAmount,
                    sessionDate: selectedSlot.regularDate,
                    sessionTime: selectedSlot.timeSlot,
                    companyName: safeCompany,
                    gstin: safeGstin,
                    seats: seatsCount
                }),
            });

            const result = await response.json();

            if (!result.success || !result.orderId) {
                alert(`Order creation failed: ${result.error || "Please check your network and try again."}\nIf payment failed please contact +91 7558133039`);
                setLoading(false);
                return;
            }

            const options: RazorpayOptions = {
                key: form.countryCode !== "+91" ? "rzp_live_gfoS1OjC8tvWjP" : RAZORPAY_KEY_ID,
                order_id: result.orderId,
                amount: finalAmount,
                currency: "INR",
                name: "TECH TYCOON DIGITAL SOLUTION LLP",
                description: `AI Marketing Masterclass — ${selectedSlot.timingLabel} on ${selectedSlot.dateString} (${seatsCount} Seats, Incl. 18% GST)`,
                prefill: {
                    name: safeName,
                    email: safeEmail,
                    contact: `${form.countryCode}${form.phone.replace(/\D/g, "")}`,
                },
                notes: {
                    batch: `Masterclass: ${form.profession} (${form.language})`,
                    preferredSlot: selectedSlot.fullLabel,
                    sessionDate: selectedSlot.regularDate,
                    sessionTime: selectedSlot.timeSlot,
                    gstin: safeGstin || "N/A",
                    company: safeCompany || "N/A",
                },
                theme: {
                    color: "#10b981",
                },
                handler: async (response) => {
                    const paymentId = String(response?.razorpay_payment_id || "").trim();
                    const orderId = String(response?.razorpay_order_id || result.orderId || "").trim();
                    const signature = String(response?.razorpay_signature || "").trim();

                    if (!paymentId || !orderId || !signature) {
                        setLoading(false);
                        alert("Payment verification failed: Missing Razorpay signature or payment ID.");
                        return;
                    }

                    try {
                        const verifyRes = await fetch(GOOGLE_SHEET_URL, {
                            method: "POST",
                            headers: { "Content-Type": "text/plain;charset=utf-8" },
                            body: JSON.stringify({
                                paymentSuccess: true,
                                razorpay_order_id: orderId,
                                razorpay_payment_id: paymentId,
                                razorpay_signature: signature,
                                isInternational: form.countryCode !== "+91",
                                email: safeEmail,
                                name: safeName,
                                language: form.language,
                                preferredSlot: selectedSlot.fullLabel,
                                sessionDate: selectedSlot.regularDate,
                                sessionTime: selectedSlot.timeSlot,
                                baseAmount: isTestEmail ? 1 : baseSessionAmount,
                                gstAmount: isTestEmail ? 0 : gstAmount,
                                amount: isTestEmail ? 1 : totalAmount,
                                companyName: safeCompany,
                                gstin: safeGstin
                            })
                        });
                        const verifyData = await verifyRes.json();
                        if (!verifyData || !verifyData.success) {
                            setLoading(false);
                            alert(`Payment verification failed: ${verifyData?.error || "Unable to verify payment signature."}`);
                            return;
                        }

                        setPaymentId(paymentId);
                        setSubmitted(true);
                        setLoading(false);

                        // Handle private coupons if used
                        const privateCoupons = ["ATY7K2BX9QM4", "CP3ZN8DW6RL5", "EK4YT1FJ8HP3", "GN2VA6HM5XB9", "IQ7CW2JR1UD4", "KP8MZ3LT5YN1", "MX2QA9NV6BR4", "OW4EC7PF1GS6", "QH9DK5RJ3LV2", "ST7NB8UW4CM6"];
                        if (privateCoupons.includes(form.coupon.trim())) {
                            fetch(GOOGLE_SHEET_URL, {
                                method: "POST",
                                headers: { "Content-Type": "text/plain;charset=utf-8" },
                                body: JSON.stringify({ action: "markCouponUsed", couponCode: form.coupon.trim(), email: safeEmail })
                            }).catch(() => {});
                        }

                        // Track Meta Pixel Purchase event (exactly once upon confirmed payment)
                        const actualPaidAmount = Number(verifyData.amount) || (isTestEmail ? 1 : totalAmount);
                        if (!purchaseTrackedRef.current && typeof (window as any).fbq === 'function') {
                            purchaseTrackedRef.current = true;
                            try {
                                sessionStorage.setItem(`purchase_tracked_${paymentId}`, "true");
                            } catch (_) {}
                            (window as any).fbq('track', 'Purchase', {
                                content_name: 'AI Secrets Revealed Masterclass',
                                currency: 'INR',
                                value: actualPaidAmount
                            });
                        }

                        closeRegisterModal();

                        const token = verifyData.invoiceToken || "";
                        if (token) {
                            try {
                                sessionStorage.setItem(`inv_tok_${paymentId}`, token);
                            } catch (_) {}
                            try {
                                localStorage.setItem(`inv_tok_${paymentId}`, token);
                            } catch (_) {}
                        }

                        // Never place token in URL query params to prevent token leakage in history, logs, or Referer headers
                        const thankYouUrl = `/thank-you?paymentId=${encodeURIComponent(paymentId)}&orderId=${encodeURIComponent(orderId)}`;
                        navigate(thankYouUrl, {
                            state: {
                                paymentId,
                                orderId,
                                token,
                                invoice: verifyData.invoice,
                                backendUrl: GOOGLE_SHEET_URL,
                                alreadyTrackedPurchase: true
                            }
                        });
                    } catch {
                        setLoading(false);
                        alert("Could not verify payment with server. Please check your email or contact +91 7558133039.");
                    }
                },
                modal: { ondismiss: () => setLoading(false) },
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
                alert(`Payment failed. Please contact +91 7558133039`);
            });
            rzp.open();

        } catch (error) {
            console.error("Masterclass registration error:", error);
            alert("Server error. If payment failed please contact +91 7558133039");
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto transition-all duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
            style={{ backdropFilter: "blur(6px)", background: "rgba(15, 23, 42, 0.65)" }}
            onClick={handleBackdropClick}
        >
            <div
                className={`relative w-full max-w-lg my-auto rounded-2xl sm:rounded-3xl p-5 sm:p-6 bg-white border border-slate-200 shadow-2xl transition-all duration-300 max-h-[92vh] flex flex-col ${visible ? "scale-100 translate-y-0" : "scale-95 translate-y-2"}`}
            >
                <button
                    onClick={handleClose}
                    className="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full p-1.5 transition-colors z-20 cursor-pointer"
                    aria-label="Close"
                >
                    <X className="w-4 h-4" />
                </button>

                {submitted ? (
                    <div className="text-center py-6">
                        <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto mb-4" />
                        <h3 className="text-2xl font-black text-slate-900 mb-2">Enrolled Successfully!</h3>
                        <p className="text-slate-600 text-sm mb-4">Welcome to the AI Secrets Revealed Masterclass. See you soon!</p>
                        <div className="bg-slate-100 border border-slate-200 text-slate-700 text-xs px-4 py-2 rounded-full mb-6 inline-block font-mono">Payment ID: {paymentId}</div>
                        <button onClick={handleClose} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-colors cursor-pointer">CLOSE</button>
                    </div>
                ) : (
                    <div className="overflow-y-auto pr-1 -mr-1 flex-1">
                        <div className="text-center mb-3">
                            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                Register <span className="text-blue-600">Now</span>
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">3-Hour Live Interactive Masterclass • Just ₹99 (Incl. 18% GST)</p>
                            <div className="mt-2 inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                                <span>📅 Selected: {selectedSlot.fullLabel}</span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-3">
                            {/* Preferred Date & Session Selection */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider ml-0.5 flex items-center justify-between">
                                    <span>Preferred Date & Session</span>
                                    <span className="text-[9px] text-blue-600 font-semibold uppercase">Required</span>
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    {orderedSlots.map((slot) => {
                                        const isSelected = preferredSlotId === slot.id;
                                        return (
                                            <button
                                                key={slot.id}
                                                type="button"
                                                onClick={() => setPreferredSlotId(slot.id)}
                                                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                                                    isSelected
                                                        ? "bg-emerald-50/90 border-2 border-emerald-600 text-slate-900 shadow-sm"
                                                        : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600"
                                                }`}
                                            >
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <span className="text-xs font-black flex items-center gap-1.5 text-slate-900">
                                                        <span className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? "border-emerald-600 bg-emerald-600" : "border-slate-300 bg-white"}`}>
                                                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                                                        </span>
                                                        <span>{slot.dayName} {slot.id === "sunday" ? "Morning" : "Evening"}</span>
                                                    </span>
                                                    {slot.id === nextSession.id && (
                                                        <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                            Next Up
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[11px] font-bold text-emerald-700 ml-5">{slot.timeSlot}</div>
                                                <div className="text-[11px] text-slate-500 font-medium ml-5">{slot.dateString}</div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider ml-0.5">Full Name</label>
                                    <input
                                        required
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                        placeholder="Enter your name"
                                        autoComplete="name"
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider ml-0.5">Email Address</label>
                                    <input
                                        required
                                        type="email"
                                        value={form.email}
                                        onChange={e => setForm({ ...form, email: e.target.value })}
                                        placeholder="email@example.com"
                                        autoComplete="email"
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider ml-0.5">WhatsApp Number</label>
                                <div className="flex gap-2">
                                    {/* Searchable Country Code Picker */}
                                    <div className="relative shrink-0" ref={countryDropdownRef} style={{ width: '110px' }}>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowCountryDropdown(!showCountryDropdown);
                                                setCountrySearch("");
                                                setTimeout(() => countryInputRef.current?.focus(), 50);
                                            }}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2 py-2 text-sm text-slate-900 hover:bg-slate-100 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all cursor-pointer flex items-center justify-center gap-1.5"
                                        >
                                            <span className="text-base leading-none">{selectedCountry.flag}</span>
                                            <span className="font-semibold text-xs">{selectedCountry.code}</span>
                                            <svg className="w-3 h-3 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </button>

                                        {showCountryDropdown && (
                                            <div className="absolute top-full left-0 mt-1 w-72 max-h-60 rounded-xl border border-slate-200 bg-white shadow-2xl z-50 overflow-hidden flex flex-col">
                                                {/* Search input */}
                                                <div className="p-2 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
                                                    <Search className="w-4 h-4 text-slate-400 shrink-0" />
                                                    <input
                                                        ref={countryInputRef}
                                                        type="text"
                                                        value={countrySearch}
                                                        onChange={e => setCountrySearch(e.target.value)}
                                                        placeholder="Search country or code..."
                                                        className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none"
                                                        autoComplete="off"
                                                    />
                                                </div>
                                                {/* Results list */}
                                                <div className="overflow-y-auto flex-1 max-h-48 divide-y divide-slate-100">
                                                    {filteredCountries.length === 0 ? (
                                                        <div className="px-4 py-3 text-xs text-slate-400 text-center">No results found</div>
                                                    ) : (
                                                        filteredCountries.map((c, idx) => (
                                                            <button
                                                                key={`${c.iso}-${idx}`}
                                                                type="button"
                                                                onClick={() => {
                                                                    setSelectedCountry(c);
                                                                    setForm({ ...form, countryCode: c.code });
                                                                    setShowCountryDropdown(false);
                                                                    setCountrySearch("");
                                                                }}
                                                                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-slate-50 transition-colors text-left ${
                                                                    selectedCountry.iso === c.iso && selectedCountry.code === c.code ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700'
                                                                }`}
                                                            >
                                                                <span className="text-sm leading-none w-5 text-center">{c.flag}</span>
                                                                <span className="flex-1 truncate">{c.name}</span>
                                                                <span className="text-xs text-slate-400 font-mono">{c.code}</span>
                                                            </button>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        required
                                        type="tel"
                                        value={form.phone}
                                        onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })}
                                        placeholder="Mobile Number"
                                        autoComplete="tel"
                                        pattern="[0-9]{6,15}"
                                        title="Please enter a valid phone number"
                                        className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider ml-0.5">Current Profession</label>
                                <select
                                    required
                                    value={form.profession}
                                    onChange={e => setForm({ ...form, profession: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none appearance-none cursor-pointer"
                                >
                                    <option value="" className="text-slate-500">Select your profession...</option>
                                    <option value="Trainer / Coach">Trainer / Coach</option>
                                    <option value="Entrepreneur">Entrepreneur</option>
                                    <option value="Business Owner">Business Owner</option>
                                    <option value="Educator">Educator</option>
                                    <option value="IT Professional">IT Professional</option>
                                    <option value="Student">Student</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <GstPriceBreakdown
                                baseAmount={inclusiveSessionPrice} inclusive={true}
                                claimGst={claimGst}
                                onClaimGstChange={setClaimGst}
                                gstin={gstin}
                                onGstinChange={setGstin}
                                companyName={companyName}
                                onCompanyNameChange={setCompanyName}
                                theme="light"
                                label="Masterclass Seat Fee"
                            />

                            <div className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200/80 rounded-lg py-1 px-2.5 text-center font-medium">
                                ⚠️ Note: We do not provide recorded sessions. Live attendance is required.
                            </div>

                            <div className="flex items-start gap-2 ml-0.5">
                                <input 
                                    type="checkbox" 
                                    required 
                                    id="wa-opt-in"
                                    defaultChecked
                                    className="mt-0.5 w-3.5 h-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <label htmlFor="wa-opt-in" className="text-[11px] text-slate-600 leading-tight">
                                    I agree to receive workshop link, updates and reminders on WhatsApp.
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm py-3 px-4 rounded-xl tracking-wide flex items-center justify-center gap-2 transform active:scale-[0.98] transition-all shadow-lg shadow-emerald-600/20 cursor-pointer disabled:opacity-70"
                            >
                                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : `PROCEED TO PAYMENT — ₹${totalAmount} (INCL. 18% GST)`}
                            </button>

                            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-wider pb-1">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Secured by Razorpay • 256-Bit SSL Encryption
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIMasterclassRegisterModal;
