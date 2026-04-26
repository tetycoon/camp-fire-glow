import React, { useState, useEffect, useRef, useMemo } from "react";
import { CheckCircle2, Loader2, ShieldCheck, X, Search } from "lucide-react";
import { useAIMasterclassRegisterModal } from "./AIMasterclassRegisterModalContext";
import { RazorpayOptions } from "@/types/razorpay";
import { getMasterclassDateStrings } from "../../lib/masterclassDateUtils";
import { countryCodes } from "../../lib/countryCodes";

const RAZORPAY_KEY_ID = "rzp_live_gfoS1OjC8tvWjP";
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbxsNlBVyY2LVjPuIBXRs2g1WXZ1r_WzM1b4zOChLVAD-iv2J8f3DXOhF4od7JOliOEa3A/exec";


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
    const { isOpen, closeRegisterModal } = useAIMasterclassRegisterModal();
    const { regularDate } = getMasterclassDateStrings();
    const [form, setForm] = useState({ name: "", email: "", phone: "", profession: "", language: "", coupon: "WELCOME33", countryCode: "+91" });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [couponChecking, setCouponChecking] = useState(false);
    const [paymentId, setPaymentId] = useState<string>("");
    const [visible, setVisible] = useState(false);
    const [discountApplied, setDiscountApplied] = useState(false);

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
                setForm({ name: "", email: "", phone: "", profession: "", language: "", coupon: "WELCOME33", countryCode: "+91" });
                setDiscountApplied(false);
            }
        }, 300);
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) handleClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const loaded = await loadRazorpayScript();
        if (!loaded) {
            alert("Failed to load payment gateway.");
            setLoading(false);
            return;
        }

        const pageUrl = window.location.href;
        const isTestEmail = form.email.toLowerCase().trim() === "ambroseselva001@gmail.com";
        const finalAmount = isTestEmail ? 100 : 9900; // 100 paise (₹1) for test, else ₹99

        try {
            const response = await fetch(GOOGLE_SHEET_URL, {
                method: "POST",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify({
                    userType: form.profession || "Professional",
                    pageUrl,
                    name: form.name,
                    email: form.email,
                    phone: `${form.countryCode}${form.phone}`,
                    language: form.language,
                    batch: "Masterclass 2026",
                    amount: isTestEmail ? 1 : 99
                }),
            });

            const result = await response.json();

            if (!result.success || !result.orderId) {
                alert("Failed to create order.");
                setLoading(false);
                return;
            }

            const options: RazorpayOptions = {
                key: RAZORPAY_KEY_ID,
                order_id: result.orderId,
                amount: finalAmount,
                currency: "INR",
                name: "Tech Tycoon",
                description: `AI Marketing Masterclass — ${regularDate}`,
                prefill: {
                    name: form.name,
                    email: form.email,
                    contact: `${form.countryCode}${form.phone}`,
                },
                notes: {
                    batch: `Masterclass: ${form.profession} (${form.language})`,
                },
                theme: {
                    color: "#10b981",
                },
                handler: async (response) => {
                    setPaymentId(response.razorpay_payment_id || "TEST_ID");
                    setSubmitted(true);
                    setLoading(false);

                    // Notify backend of payment success
                    try {
                        await fetch(GOOGLE_SHEET_URL, {
                            method: "POST",
                            headers: { "Content-Type": "text/plain;charset=utf-8" },
                            body: JSON.stringify({
                                paymentSuccess: true,
                                razorpay_order_id: result.orderId,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                email: form.email,
                                name: form.name,
                                language: form.language
                            })
                        });

                        // Direct redirect to WhatsApp tracking
                        // Direct redirect to Thank You page for Meta Pixel purchase tracking
                        setTimeout(() => {
                            window.location.href = `/thankyou?orderId=${result.orderId}`;
                        }, 1500); // 1.5s delay to let the user see the success state briefly

                    } catch (e) {
                        console.error("Failed to notify payment success", e);
                    }

                    // Handle private coupons if used
                    const privateCoupons = ["ATY7K2BX9QM4", "CP3ZN8DW6RL5", "EK4YT1FJ8HP3", "GN2VA6HM5XB9", "IQ7CW2JR1UD4", "KP8MZ3LT5YN1", "MX2QA9NV6BR4", "OW4EC7PF1GS6", "QH9DK5RJ3LV2", "ST7NB8UW4CM6"];
                    if (privateCoupons.includes(form.coupon.trim())) {
                        fetch(GOOGLE_SHEET_URL, {
                            method: "POST",
                            headers: { "Content-Type": "text/plain;charset=utf-8" },
                            body: JSON.stringify({ action: "markCouponUsed", couponCode: form.coupon.trim(), email: form.email })
                        }).catch(() => { });
                    }
                },
                modal: { ondismiss: () => setLoading(false) },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error) {
            alert("Server error.");
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
            style={{ backdropFilter: "blur(8px)", background: "hsl(222 47% 5% / 0.8)" }}
            onClick={handleBackdropClick}
        >
            <div
                className={`relative w-full max-w-lg rounded-3xl p-8 transition-all duration-300 ${visible ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}`}
                style={{
                    background: "linear-gradient(145deg, hsl(222 40% 10%), hsl(222 40% 7%))",
                    border: "1px solid hsl(142 70% 50% / 0.25)",
                    boxShadow: "0 0 60px hsl(142 70% 50% / 0.15)",
                }}
            >
                <button onClick={handleClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"><X /></button>

                {submitted ? (
                    <div className="text-center py-6">
                        <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
                        <h3 className="font-display text-2xl font-bold mb-3">Enrolled Successfully!</h3>
                        <p className="text-muted-foreground mb-4">Welcome to the AI Masterclass 2026. See you soon!</p>
                        <div className="badge-module text-xs px-4 py-2 rounded-full mb-6 inline-block">ID: {paymentId}</div>
                        <button onClick={handleClose} className="w-full border border-emerald-500/30 text-emerald-400 py-3 rounded-full">CLOSE</button>
                    </div>
                ) : (
                    <>
                        <div className="text-center mb-6">
                            <h2 className="font-display text-2xl font-bold mb-1 italic !text-white" style={{ color: "white" }}>Register <span className="text-gradient-green">Now</span></h2>
                            <p className="text-sm text-muted-foreground">Join the AI revolution for just ₹99</p>
                            <p className="text-[10px] text-emerald-400/80 mt-1 font-medium italic">Basic English And Tamil</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-emerald-400/70 uppercase tracking-widest ml-1">Full Name</label>
                                    <input
                                        required
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                        placeholder="Enter your name"
                                        autoComplete="name"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500/50 focus:bg-white/10 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-emerald-400/70 uppercase tracking-widest ml-1">Email Address</label>
                                    <input
                                        required
                                        type="email"
                                        value={form.email}
                                        onChange={e => setForm({ ...form, email: e.target.value })}
                                        placeholder="email@example.com"
                                        autoComplete="email"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500/50 focus:bg-white/10 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-emerald-400/70 uppercase tracking-widest ml-1">WhatsApp Number</label>
                                <div className="flex gap-2">
                                    {/* Searchable Country Code Picker */}
                                    <div className="relative shrink-0" ref={countryDropdownRef} style={{ width: '120px' }}>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowCountryDropdown(!showCountryDropdown);
                                                setCountrySearch("");
                                                setTimeout(() => countryInputRef.current?.focus(), 50);
                                            }}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-2 py-3 text-sm text-white focus:border-emerald-500/50 focus:bg-white/10 outline-none transition-all cursor-pointer flex items-center justify-center gap-1.5"
                                        >
                                            <span className="text-base leading-none">{selectedCountry.flag}</span>
                                            <span className="font-medium">{selectedCountry.code}</span>
                                            <svg className="w-3 h-3 text-emerald-400/40 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </button>

                                        {showCountryDropdown && (
                                            <div className="absolute top-full left-0 mt-1 w-72 max-h-64 rounded-xl border border-white/10 shadow-2xl z-50 overflow-hidden flex flex-col" style={{ background: 'hsl(222 40% 9%)' }}>
                                                {/* Search input */}
                                                <div className="p-2 border-b border-white/10 flex items-center gap-2">
                                                    <Search className="w-4 h-4 text-emerald-400/50 shrink-0" />
                                                    <input
                                                        ref={countryInputRef}
                                                        type="text"
                                                        value={countrySearch}
                                                        onChange={e => setCountrySearch(e.target.value)}
                                                        placeholder="Search country or code..."
                                                        className="w-full bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
                                                        autoComplete="off"
                                                    />
                                                </div>
                                                {/* Results list */}
                                                <div className="overflow-y-auto flex-1" style={{ maxHeight: '220px' }}>
                                                    {filteredCountries.length === 0 ? (
                                                        <div className="px-4 py-3 text-xs text-white/30 text-center">No results found</div>
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
                                                                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-emerald-500/10 transition-colors text-left ${
                                                                    selectedCountry.iso === c.iso && selectedCountry.code === c.code ? 'bg-emerald-500/15 text-emerald-300' : 'text-white/80'
                                                                }`}
                                                            >
                                                                <span className="text-base leading-none w-6 text-center">{c.flag}</span>
                                                                <span className="flex-1 truncate">{c.name}</span>
                                                                <span className="text-xs text-white/40 font-mono">{c.code}</span>
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
                                        onChange={e => setForm({ ...form, phone: e.target.value })}
                                        placeholder="Mobile Number"
                                        autoComplete="tel"
                                        pattern="[0-9]{10}"
                                        title="Please enter a valid 10-digit phone number"
                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500/50 focus:bg-white/10 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-emerald-400/70 uppercase tracking-widest ml-1">Preferred Language</label>
                                    <select
                                        required
                                        value={form.language}
                                        onChange={e => setForm({ ...form, language: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500/50 focus:bg-white/10 outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="" className="bg-slate-900">Select...</option>
                                        <option value="English" disabled className="bg-slate-900" style={{ color: '#ef4444' }}>English (Not Available)</option>
                                        <option value="Tamil" className="bg-slate-900">Tamil</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-emerald-400/70 uppercase tracking-widest ml-1">Current Profession</label>
                                    <select
                                        required
                                        value={form.profession}
                                        onChange={e => setForm({ ...form, profession: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500/50 focus:bg-white/10 outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="" className="bg-slate-900">Select...</option>
                                        <option className="bg-slate-900">Trainer / Coach</option>
                                        <option className="bg-slate-900">Entrepreneur</option>
                                        <option className="bg-slate-900">Business Owner</option>
                                        <option className="bg-slate-900">Freelancer</option>
                                        <option className="bg-slate-900">Educator</option>
                                        <option className="bg-slate-900">Professionals</option>
                                        <option className="bg-slate-900">Student</option>
                                        <option className="bg-slate-900">Other</option>
                                    </select>
                                </div>
                            </div>

                            <p className="text-xs text-red-500 font-bold text-center mt-1">⚠️ We do not provide recorded sessions.</p>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm py-4 rounded-xl tracking-widest mt-2 flex items-center justify-center gap-2 transform active:scale-95 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : "PROCEED TO PAYMENT — ₹99"}
                            </button>

                            <div className="flex items-center justify-center gap-2 text-[10px] text-emerald-400/40 font-bold uppercase tracking-tighter">
                                <ShieldCheck className="w-3 h-3" /> Secured by Razorpay
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default AIMasterclassRegisterModal;
