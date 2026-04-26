import React, { useState, useEffect, useRef, useMemo } from "react";
import { CheckCircle2, Loader2, ShieldCheck, X, Laptop, Utensils, MapPin, Search } from "lucide-react";
import { useUpscaleRegisterModal } from "./UpscaleRegisterModalContext";
import { RazorpayOptions } from "@/types/razorpay";
import { countryCodes } from "../../lib/countryCodes";
import logo from "@/assets/tech_tycoon_logo.png";

const RAZORPAY_KEY_ID = "rzp_live_gfoS1OjC8tvWjP"; 
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
    const [paymentId, setPaymentId] = useState<string>("");
    const [visible, setVisible] = useState(false);
    const paymentHandled = useRef(false);

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
        setLoading(true);

        const loaded = await loadRazorpayScript();
        if (!loaded) {
            alert("Payment gateway failed to load.");
            setLoading(false);
            return;
        }

        const isTestEmail = form.email.toLowerCase().trim() === "ambroseselva001@gmail.com";
        const finalAmount = isTestEmail ? 100 : 499900;

        const payloadObj = {
            userType: form.profession || "Professional",
            pageUrl: window.location.href,
            name: form.name,
            email: form.email,
            phone: `${form.countryCode}${form.phone}`,
            language: "Chennai Offline",
            batch: "UPSCALE OFFLINE MAY 31",
            amount: isTestEmail ? 1 : 4999
        };

        try {
            const response = await fetch(GOOGLE_SHEET_URL, {
                method: "POST",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify(payloadObj),
            });
            const result = await response.json();

            if (!result.success || !result.orderId) {
                alert("Order creation failed.");
                setLoading(false);
                return;
            }

            const options: RazorpayOptions = {
                key: RAZORPAY_KEY_ID,
                order_id: result.orderId,
                amount: finalAmount,
                currency: "INR",
                name: "Tech Tycoon",
                description: "UPSCALE: 1-Day AI Mastery Chennai",
                prefill: {
                    name: form.name,
                    email: form.email,
                    contact: `${form.countryCode}${form.phone}`,
                },
                notes: { batch: "OFFLINE_CHENNAI_MAY31" },
                theme: { color: "#2563eb" },
                handler: async (resp) => {
                    if (paymentHandled.current) return;
                    paymentHandled.current = true;
                    setLoading(true);
                    setVerifying(true);
                    setPaymentId(resp.razorpay_payment_id || "OFFLINE_TXN");

                    await fetch(GOOGLE_SHEET_URL, {
                        method: "POST",
                        headers: { "Content-Type": "text/plain;charset=utf-8" },
                        body: JSON.stringify({
                            paymentSuccess: true,
                            razorpay_order_id: result.orderId,
                            razorpay_payment_id: resp.razorpay_payment_id,
                            email: form.email,
                            name: form.name
                        })
                    }).catch(console.error);

                    setSubmitted(true);
                    setVerifying(false);
                    setLoading(false);
                },
                modal: { ondismiss: () => setLoading(false) },
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.open();
        } catch (err) {
            alert("System error. Please try again.");
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
            style={{ backdropFilter: "blur(12px)", background: "rgba(15, 23, 42, 0.8)" }}
            onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
            <div className={`relative w-full max-w-3xl bg-white rounded-[40px] shadow-2xl overflow-hidden transition-all duration-500 ${visible ? "scale-100 translate-y-0" : "scale-95 translate-y-8"}`}>
                <button onClick={handleClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors z-20">
                    <X className="w-6 h-6" />
                </button>

                <div className="flex flex-col md:flex-row h-full">
                    {/* Left Info Panel */}
                    <div className="hidden lg:flex flex-col justify-between w-72 bg-slate-900 p-12 text-white shrink-0">
                        <div>
                            <img src={logo} alt="Tech Tycoon" className="w-12 h-12 object-contain mb-8" />
                            <h3 className="text-xl font-black leading-tight mb-4">You're one step away.</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                                    <MapPin className="w-4 h-4 text-blue-500" /> Egmore, Chennai
                                </div>
                                <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                                    <Laptop className="w-4 h-4 text-emerald-500" /> Bring Laptop
                                </div>
                                <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                                    <Utensils className="w-4 h-4 text-amber-500" /> Lunch Included
                                </div>
                            </div>
                        </div>
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-loose">
                            Limited to 30 seats <br />strictly corporate environment
                        </div>
                    </div>

                    {/* Form Panel */}
                    <div className="flex-1 p-8 sm:p-12">
                        {submitted ? (
                            <div className="text-center py-6">
                                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                                    <CheckCircle2 className="w-10 h-10" />
                                </div>
                                <h3 className="text-3xl font-black text-slate-900 mb-2">Registration Complete!</h3>
                                <p className="text-slate-500 font-bold mb-8">Your payment was successful and your seat is secured for May 31.</p>
                                
                                <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 mb-8">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Final Step: Join the community</p>
                                    <a 
                                        href={`https://wa.me/917010340494?text=${encodeURIComponent("Hai I am complete the registration of Level -2 Offline Session")}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#20bd5b] text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-green-200 transition-all active:scale-95"
                                    >
                                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.067 2.877 1.215 3.076.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                        SEND MESSAGE
                                    </a>
                                </div>

                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                                    TXN ID: {paymentId}
                                </div>
                                <button onClick={handleClose} className="w-full text-slate-400 hover:text-slate-900 py-2 font-black text-[10px] uppercase tracking-widest transition-colors">Close Window</button>
                            </div>
                        ) : (
                            <>
                                <div className="mb-8">
                                    <h2 className="text-3xl font-black text-slate-900 mb-1 tracking-tight">Register <span className="text-blue-600">Now.</span></h2>
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                                        <span className="line-through text-slate-300 mr-2">₹9,999</span>₹4,999 One-Day Premium Access
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                                        <input 
                                            required 
                                            type="text" 
                                            placeholder="John Doe" 
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-sm font-bold text-slate-900 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all"
                                            value={form.name}
                                            onChange={e => setForm({...form, name: e.target.value})}
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Business Email</label>
                                        <input 
                                            required 
                                            type="email" 
                                            placeholder="john@company.com" 
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-sm font-bold text-slate-900 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all"
                                            value={form.email}
                                            onChange={e => setForm({...form, email: e.target.value})}
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">WhatsApp Number</label>
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
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-3 text-sm font-bold text-slate-900 outline-none focus:border-blue-400 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                                                >
                                                    <span className="text-base leading-none">{selectedCountry.flag}</span>
                                                    <span className="font-bold">{selectedCountry.code}</span>
                                                    <svg className="w-3 h-3 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                </button>

                                                {showCountryDropdown && (
                                                    <div className="absolute top-full left-0 mt-1 w-72 max-h-64 rounded-xl bg-white border border-slate-200 shadow-2xl z-50 overflow-hidden flex flex-col">
                                                        {/* Search input */}
                                                        <div className="p-2 border-b border-slate-100 flex items-center gap-2">
                                                            <Search className="w-4 h-4 text-blue-400 shrink-0" />
                                                            <input
                                                                ref={countryInputRef}
                                                                type="text"
                                                                value={countrySearch}
                                                                onChange={e => setCountrySearch(e.target.value)}
                                                                placeholder="Search country or code..."
                                                                className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-300 outline-none"
                                                                autoComplete="off"
                                                            />
                                                        </div>
                                                        {/* Results list */}
                                                        <div className="overflow-y-auto flex-1" style={{ maxHeight: '220px' }}>
                                                            {filteredCountries.length === 0 ? (
                                                                <div className="px-4 py-3 text-xs text-slate-300 text-center">No results found</div>
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
                                                                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-blue-50 transition-colors text-left ${
                                                                            selectedCountry.iso === c.iso && selectedCountry.code === c.code ? 'bg-blue-50 text-blue-600' : 'text-slate-700'
                                                                        }`}
                                                                    >
                                                                        <span className="text-base leading-none w-6 text-center">{c.flag}</span>
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
                                                placeholder="98765 43210" 
                                                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-sm font-bold text-slate-900 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all"
                                                value={form.phone}
                                                onChange={e => setForm({...form, phone: e.target.value.replace(/\D/g, '')})}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">I am a...</label>
                                        <div className="relative">
                                            <select 
                                                required 
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-5 pr-10 py-3 text-sm font-bold text-slate-900 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 appearance-none cursor-pointer transition-all"
                                                value={form.profession}
                                                onChange={e => setForm({...form, profession: e.target.value})}
                                            >
                                                <option value="">Select your role</option>
                                                <option>Business Owner</option>
                                                <option>Entrepreneur</option>
                                                <option>Corporate Leader</option>
                                                <option>Trainer/Coach</option>
                                                <option>Freelancer</option>
                                                <option>Educator</option>
                                                <option>Other</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                <svg width="10" height="6" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                            </div>
                                        </div>
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={loading || verifying}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-black text-base shadow-lg shadow-blue-200 mt-2 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {verifying ? "VERIFYING..." : loading ? "CONNECTING..." : "PAY & ENROLL — ₹4,999"}
                                    </button>

                                    <div className="flex items-center justify-center gap-4 pt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">
                                        <ShieldCheck className="w-3 h-3" /> Encrypted Checkout
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpscaleRegisterModal;
