import React, { useState, useEffect, useRef, useMemo } from "react";
import { CheckCircle2, Loader2, ShieldCheck, X, Laptop, Utensils, MapPin, Search, FileText } from "lucide-react";
import { useUpscaleRegisterModal } from "./UpscaleRegisterModalContext";
import { RazorpayOptions } from "@/types/razorpay";
import { countryCodes } from "../../lib/countryCodes";
import logo from "@/assets/tech_tycoon_logo.png";
import GstPriceBreakdown from "../common/GstPriceBreakdown";
import { InvoicePrintParams, calculateGstBreakdown, isAuthorizedTestEmail, isValidEmail, isValidGstin, openPrintableGstInvoice, registerVerifiedInvoiceRecord, sanitizeTextInput } from "@/lib/gstUtils";

const RAZORPAY_KEY_ID = "rzp_live_T2CbVONQc6qrqj"; 
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbzPxPpp0ksCcE6IY8mUlzcu0jqY1RSfhCl2Locq1iOYbbe5beBeeQ6uefCV93Nxy8rbsg/exec";

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

const UpscaleRegisterModal: React.FC = () => {
    const { isOpen, closeRegisterModal } = useUpscaleRegisterModal();
    const [form, setForm] = useState({ name: "", email: "", phone: "", countryCode: "+91", profession: "" });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [seatsCount, setSeatsCount] = useState(1);
    const [paymentId, setPaymentId] = useState<string>("");
    const [verifiedInvoice, setVerifiedInvoice] = useState<InvoicePrintParams | null>(null);
    const [visible, setVisible] = useState(false);
    const paymentHandled = useRef(false);

    // GST Invoice fields
    const [claimGst, setClaimGst] = useState(false);
    const [gstin, setGstin] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [gstError, setGstError] = useState("");

    const baseTotal = 6499 * seatsCount;

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
    }, [isOpen]);

    const handleClose = () => {
        setVisible(false);
        setTimeout(() => {
            closeRegisterModal();
            if (!submitted) {
                setForm({ name: "", email: "", phone: "", countryCode: "+91", profession: "" });
                setSelectedCountry(defaultCountry);
            }
        }, 300);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setGstError("");

        const sanitizedName = sanitizeTextInput(form.name, 100);
        const sanitizedEmail = form.email.trim().toLowerCase();
        const sanitizedCompany = claimGst ? sanitizeTextInput(companyName, 120) : "";
        const sanitizedGstin = claimGst ? gstin.trim().toUpperCase() : "";

        if (!sanitizedName || !isValidEmail(sanitizedEmail)) {
            alert("Please enter a valid name and email address.");
            return;
        }

        if (claimGst) {
            if (!isValidGstin(sanitizedGstin)) {
                setGstError("Please enter a valid 15-character GSTIN (e.g. 33AAAAA0000A1Z5)");
                return;
            }
            if (!sanitizedCompany) {
                setGstError("Please enter your registered Legal Company Name for the GST invoice");
                return;
            }
        }

        setLoading(true);

        const loaded = await loadRazorpayScript();
        if (!loaded) {
            alert("Payment gateway failed to load.");
            setLoading(false);
            return;
        }

        const isTestEmail = isAuthorizedTestEmail(sanitizedEmail);
        const finalPayableInr = isTestEmail ? 1 : baseTotal;
        const finalAmount = finalPayableInr * 100;

        const payloadObj = {
            name: sanitizedName + (seatsCount > 1 ? ` (+ ${seatsCount - 1} Seats)` : ""),
            email: sanitizedEmail,
            phone: `${form.countryCode}${form.phone}`,
            countryCode: form.countryCode,
            userType: sanitizeTextInput(form.profession || "Professional", 80),
            language: "Chennai Offline",
            baseAmount: isTestEmail ? 1 : finalPayableInr,
            gstAmount: 0,
            amount: finalPayableInr,
            paymentSuccess: false,
            companyName: sanitizedCompany,
            gstin: sanitizedGstin,
            seats: seatsCount
        };

        try {
            const response = await fetch(GOOGLE_SHEET_URL, {
                method: "POST",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify(payloadObj),
            });
            const result = await response.json();

            if (!result.success || !result.orderId) {
                alert("Order creation failed. If payment failed please contact +91 7558133039");
                setLoading(false);
                return;
            }

            const options: RazorpayOptions = {
                key: form.countryCode !== "+91" ? "rzp_live_gfoS1OjC8tvWjP" : RAZORPAY_KEY_ID,
                order_id: result.orderId,
                amount: finalAmount,
                currency: "INR",
                name: "Tech Tycoon",
                description: `UPSCALE: 1-Day AI Mastery Chennai (${seatsCount} ${seatsCount === 1 ? "Seat" : "Seats"})`,
                prefill: {
                    name: sanitizedName,
                    email: sanitizedEmail,
                    contact: `${form.countryCode}${form.phone}`,
                },
                notes: {
                    batch: "OFFLINE_CHENNAI_AUG09",
                    base_amount: String(gstBreakdown.baseAmount),
                    gst_amount: String(gstBreakdown.gstAmount),
                    gstin: sanitizedGstin || "N/A",
                    company_name: sanitizedCompany || "N/A",
                },
                theme: { color: "#2563eb" },
                handler: async (resp) => {
                    if (paymentHandled.current) return;
                    const payId = String(resp?.razorpay_payment_id || "").trim();
                    const ordId = String(resp?.razorpay_order_id || result.orderId || "").trim();
                    const sig = String(resp?.razorpay_signature || "").trim();

                    if (!payId || !ordId || !sig) {
                        alert("Payment verification failed: Missing Razorpay signature or payment ID.");
                        setLoading(false);
                        setVerifying(false);
                        return;
                    }

                    paymentHandled.current = true;
                    setLoading(true);
                    setVerifying(true);
                    setPaymentId(payId);

                    try {
                        const verifyRes = await fetch(GOOGLE_SHEET_URL, {
                            method: "POST",
                            headers: { "Content-Type": "text/plain;charset=utf-8" },
                            body: JSON.stringify({
                                paymentSuccess: true,
                                razorpay_order_id: ordId,
                                razorpay_payment_id: payId,
                                razorpay_signature: sig,
                                email: sanitizedEmail,
                                name: sanitizedName,
                                baseAmount: isTestEmail ? 1 : finalPayableInr,
                                gstAmount: 0,
                                amount: finalPayableInr,
                                companyName: sanitizedCompany,
                                gstin: sanitizedGstin,
                            })
                        });
                        const verifyData = await verifyRes.json();
                        if (!verifyData || !verifyData.success) {
                            paymentHandled.current = false;
                            setVerifying(false);
                            setLoading(false);
                            alert(`Payment verification failed: ${verifyData?.error || "Unable to verify payment signature."}`);
                            return;
                        }

                        const verifiedAmt = Number(verifyData.amount) || finalPayableInr;
                        const registeredInv = registerVerifiedInvoiceRecord({
                            customerName: sanitizedName,
                            customerEmail: sanitizedEmail,
                            customerPhone: `${form.countryCode} ${form.phone}`,
                            courseName: "UPSCALE: 1-Day Offline AI Mastery Workshop (Chennai)",
                            totalAmountPaid: verifiedAmt,
                            paymentId: payId,
                            orderId: ordId,
                            invoiceNumber: verifyData.invoiceNumber || undefined,
                        });
                        setVerifiedInvoice(registeredInv);
                        setSubmitted(true);
                        setVerifying(false);
                        setLoading(false);

                        // Automatic Redirection to WhatsApp after allowing time to download GST Invoice
                        const TRIGGER_MESSAGE = "Hi I am complete Registration of AI- Business Generative Model workshop in chennai";
                        const waChatLink = `https://wa.me/917010340494?text=${encodeURIComponent(TRIGGER_MESSAGE)}`;
                        
                        setTimeout(() => {
                            window.open(waChatLink, "_blank", "noopener,noreferrer");
                        }, 4000);
                    } catch (err) {
                        paymentHandled.current = false;
                        setVerifying(false);
                        setLoading(false);
                        alert("Could not verify payment with server. Please check your email or contact +91 7558133039");
                    }
                },
                modal: { ondismiss: () => setLoading(false) },
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
                alert(`Payment failed. Please contact +91 7558133039`);
            });
            rzp.open();
        } catch (err) {
            alert("System error. Please try again. If payment failed please contact +91 7558133039");
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className={`fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 transition-all duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
            style={{ backdropFilter: "blur(12px)", background: "rgba(15, 23, 42, 0.8)" }}
            onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
            <div className={`relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col md:flex-row transition-all duration-300 ${visible ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}`}>
                <button 
                    onClick={handleClose} 
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 p-1.5 rounded-full hover:bg-slate-100 transition-colors z-30 cursor-pointer"
                    aria-label="Close"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Left Info Panel */}
                <div className="hidden md:flex flex-col justify-between w-64 bg-slate-900 p-7 text-white shrink-0">
                    <div>
                        <img src={logo} alt="Tech Tycoon" className="w-10 h-10 object-contain mb-6" />
                        <h3 className="text-lg font-black leading-tight mb-2">You're one step away.</h3>
                        <p className="text-xs text-slate-400 mb-6">Build your complete AI business system live in Chennai.</p>
                        <div className="space-y-3.5">
                            <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-300">
                                <MapPin className="w-4 h-4 text-blue-400 shrink-0" /> Egmore, Chennai
                            </div>
                            <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-300">
                                <Laptop className="w-4 h-4 text-emerald-400 shrink-0" /> Bring Laptop (Live Build)
                            </div>
                            <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-300">
                                <Utensils className="w-4 h-4 text-amber-400 shrink-0" /> Lunch & High Tea Included
                            </div>
                        </div>
                    </div>
                    <div className="pt-6 border-t border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                        Limited to 30 seats • Strictly corporate executive cohort
                    </div>
                </div>

                {/* Form Panel */}
                <div className="flex-1 p-5 sm:p-7 overflow-y-auto">
                    {submitted ? (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5 animate-bounce">
                                <CheckCircle2 className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-2">Registration Complete!</h3>
                            <p className="text-slate-600 text-sm font-medium mb-6">Your payment was successful and your seat is secured for 6th December 2026 (Sunday).</p>
                            
                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 mb-6">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Final Step: Join the community</p>
                                <a 
                                    href={`https://wa.me/917010340494?text=${encodeURIComponent("Hi I am complete Registration of AI- Business Generative Model workshop in chennai")}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20bd5b] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-green-200 transition-all active:scale-95"
                                >
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.067 2.877 1.215 3.076.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                    <span>SEND MESSAGE</span>
                                </a>
                            </div>

                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 font-mono">
                                TXN ID: {paymentId}
                            </div>
                            <p className="text-xs text-slate-500 mb-4 text-center font-medium">
                                📧 Confirmation and details emailed to <strong>{form.email}</strong>.
                            </p>
                            <button onClick={handleClose} className="w-full text-slate-400 hover:text-slate-900 py-2 font-black text-[10px] uppercase tracking-widest transition-colors cursor-pointer">Close Window</button>
                        </div>
                    ) : (
                        <>
                            <div className="mb-4">
                                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                    Register <span className="text-blue-600">Now.</span>
                                </h2>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                                    <span className="line-through text-slate-300 mr-1.5">₹9,999</span>
                                    <span className="text-slate-900 font-extrabold">₹6,499</span>
                                    <span className="text-emerald-700 ml-1.5 bg-emerald-50 px-2 py-0.5 rounded text-[10px]">No GST Added</span>
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider px-0.5">Full Name</label>
                                        <input 
                                            required 
                                            type="text" 
                                            placeholder="John Doe" 
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                                            value={form.name}
                                            onChange={e => setForm({...form, name: e.target.value})}
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider px-0.5">Business Email</label>
                                        <input 
                                            required 
                                            type="email" 
                                            placeholder="john@company.com" 
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                                            value={form.email}
                                            onChange={e => setForm({...form, email: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider px-0.5">WhatsApp Number</label>
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
                                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2 py-2 text-sm text-slate-900 outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer flex items-center justify-center gap-1"
                                            >
                                                <span className="text-base leading-none">{selectedCountry.flag}</span>
                                                <span className="font-bold text-xs">{selectedCountry.code}</span>
                                                <svg className="w-3 h-3 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                            </button>

                                            {showCountryDropdown && (
                                                <div className="absolute top-full left-0 mt-1 w-64 max-h-56 rounded-xl bg-white border border-slate-200 shadow-2xl z-50 overflow-hidden flex flex-col">
                                                    <div className="p-2 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
                                                        <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                        <input
                                                            ref={countryInputRef}
                                                            type="text"
                                                            value={countrySearch}
                                                            onChange={e => setCountrySearch(e.target.value)}
                                                            placeholder="Search..."
                                                            className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 outline-none"
                                                            autoComplete="off"
                                                        />
                                                    </div>
                                                    <div className="overflow-y-auto flex-1 max-h-44">
                                                        {filteredCountries.length === 0 ? (
                                                            <div className="px-3 py-2 text-xs text-slate-400 text-center">No results</div>
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
                                                                    className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-blue-50 transition-colors text-left ${
                                                                        selectedCountry.iso === c.iso && selectedCountry.code === c.code ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-700'
                                                                    }`}
                                                                >
                                                                    <span className="text-sm leading-none w-5 text-center">{c.flag}</span>
                                                                    <span className="flex-1 truncate">{c.name}</span>
                                                                    <span className="text-[10px] text-slate-400 font-mono">{c.code}</span>
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
                                            placeholder="Mobile Number" 
                                            className="flex-1 min-w-0 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                                            value={form.phone}
                                            onChange={e => setForm({...form, phone: e.target.value.replace(/\D/g, '')})}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-start gap-2 px-0.5">
                                    <input 
                                        type="checkbox" 
                                        required 
                                        id="upscale-wa-opt-in"
                                        defaultChecked
                                        className="mt-0.5 w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor="upscale-wa-opt-in" className="text-[11px] text-slate-500 font-medium leading-tight">
                                        I agree to receive workshop updates and automated reminders on WhatsApp.
                                    </label>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={loading || verifying}
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-4 rounded-xl font-bold text-sm sm:text-base shadow-lg shadow-blue-600/25 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                                >
                                    {verifying ? "VERIFYING..." : loading ? "CONNECTING..." : `PAY & ENROLL — ₹${baseTotal.toLocaleString("en-IN")}`}
                                </button>

                                <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider pt-0.5">
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Razorpay 256-Bit SSL Encrypted Checkout
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UpscaleRegisterModal;
