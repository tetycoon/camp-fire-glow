import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, Loader2, Lock, ShieldCheck, AlertCircle, Sparkles, Zap, Gift, Check } from "lucide-react";
import { countryCodes } from "../../lib/countryCodes";
import {
    hasCompletedLeadGate,
    markLeadGateCompleted,
    submitLandingLead,
    validateLandingLead,
    type LandingLeadErrors,
    type LandingLeadInput,
} from "../../lib/landingLeadService";

const REDIRECT_DELAY_MS = 900;

interface AIMasterclassLeadGateProps {
    // Injectable for tests
    submitLead?: typeof submitLandingLead;
}

const AIMasterclassLeadGate: React.FC<AIMasterclassLeadGateProps> = ({ submitLead = submitLandingLead }) => {
    const [open, setOpen] = useState(() => !hasCompletedLeadGate());
    const [form, setForm] = useState<LandingLeadInput>({ name: "", countryCode: "+91", phone: "", email: "", website: "" });
    const [errors, setErrors] = useState<LandingLeadErrors>({});
    const [submitError, setSubmitError] = useState("");
    const [status, setStatus] = useState<"idle" | "saving" | "success">("idle");
    const nameRef = useRef<HTMLInputElement>(null);

    // Lock background scroll while the gate is visible
    useEffect(() => {
        if (!open) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        nameRef.current?.focus();
        return () => {
            document.body.style.overflow = previous;
        };
    }, [open]);

    if (!open) return null;

    const updateField = (field: keyof LandingLeadInput, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field as keyof LandingLeadErrors]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
        setSubmitError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (status !== "idle") return;

        const validation = validateLandingLead(form);
        setErrors(validation);
        if (Object.keys(validation).length > 0) return;

        setStatus("saving");
        setSubmitError("");
        try {
            const { leadId } = await submitLead(form);
            markLeadGateCompleted(leadId);
            setStatus("success");
            setTimeout(() => {
                setOpen(false);
                window.scrollTo(0, 0);
            }, REDIRECT_DELAY_MS);
        } catch (err) {
            setStatus("idle");
            setSubmitError(err instanceof Error ? err.message : "We couldn't save your details. Please try again.");
        }
    };

    const inputClass = (hasError: boolean) =>
        `w-full bg-white/[0.06] border rounded-xl px-3.5 py-3 text-[15px] text-white placeholder:text-slate-400 outline-none transition-all focus:bg-white/[0.09] focus:ring-2 ${
            hasError ? "border-red-400/70 focus:ring-red-400/25" : "border-white/15 focus:border-brandGreen focus:ring-brandGreen/25"
        }`;

    return (
        <div
            className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
            style={{ backdropFilter: "blur(12px)", background: "rgba(2, 6, 23, 0.82)" }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="lead-gate-title"
                aria-describedby="lead-gate-desc"
                className="relative w-full sm:max-w-md max-h-[96vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-gradient-to-b from-[#0f172a] via-[#090d16] to-[#020617] border border-white/15 shadow-2xl shadow-black/80 animate-in fade-in slide-in-from-bottom-4 duration-300"
            >
                {/* Brand gradient accent top bar */}
                <div className="h-1.5 w-full bg-gradient-to-r from-brandGreen via-emerald-400 to-blue-500 sticky top-0 z-10" />
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-brandGreen/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

                <div className="relative px-5 pt-5 pb-5 sm:px-7 sm:pt-6 sm:pb-6">
                    {status === "success" ? (
                        <div className="text-center py-10" role="status" aria-live="polite">
                            <div className="w-16 h-16 rounded-full bg-brandGreen/20 border-2 border-brandGreen flex items-center justify-center mx-auto mb-4 animate-bounce">
                                <CheckCircle2 className="w-9 h-9 text-brandGreen" />
                            </div>
                            <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-black uppercase tracking-wider mb-2">
                                Special ₹99 Offer Unlocked!
                            </span>
                            <h2 id="lead-gate-title" className="text-2xl font-black text-white">You're in!</h2>
                            <p id="lead-gate-desc" className="text-sm text-slate-300 mt-2 flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-brandGreen" />
                                Taking you to the Masterclass…
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Brand Header & Live Offer Tag */}
                            <div className="flex items-center justify-between gap-2 mb-3.5">
                                <div className="flex items-center gap-2.5">
                                    <img src="/logo.png" alt="Tech Tycoon" className="w-9 h-9 rounded-full border border-white/20 shrink-0" />
                                    <div className="leading-tight">
                                        <p className="text-[13px] font-black text-white tracking-wide">TECH TYCOON</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">DIGITAL SOLUTION LLP</p>
                                    </div>
                                </div>
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-[10px] font-extrabold uppercase tracking-wider animate-pulse">
                                    <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                                    90% Off Today
                                </div>
                            </div>

                            {/* Catchy Emotion Headline */}
                            <h2 id="lead-gate-title" className="text-[22px] sm:text-[25px] font-black text-white tracking-tight leading-tight">
                                Unlock Special <span className="text-brandGreen">₹99 Access</span> & ₹9,997 Free AI Bonuses
                            </h2>
                            <p id="lead-gate-desc" className="text-xs sm:text-[13px] text-slate-300 mt-1.5 mb-3.5 leading-relaxed">
                                Don't let AI pass you by. Enter your details below to instantly unlock the heavily subsidized <strong className="text-brandGreen font-bold">₹99 seat</strong> (Original price: <span className="line-through text-slate-400">₹999</span>) before this ad campaign ends!
                            </p>

                            {/* Interactive Price Comparison Box */}
                            <div className="bg-gradient-to-r from-white/[0.08] to-white/[0.03] border border-brandGreen/40 rounded-2xl p-3 sm:p-3.5 mb-3.5 relative overflow-hidden">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Original Price</div>
                                        <div className="text-sm sm:text-base font-bold text-slate-400 line-through">₹999</div>
                                    </div>
                                    <div className="text-center px-2 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-black">
                                        SAVE ₹900 INSTANTLY
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-brandGreen">Your Enquiry Price</div>
                                        <div className="text-xl sm:text-2xl font-black text-brandGreen leading-none">
                                            ₹99 <span className="text-[10px] font-semibold text-slate-300">+18% GST</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-1.5 text-[11px] font-bold text-amber-300">
                                    <Gift className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                                    <span>Includes 500+ AI Prompts Vault & VIP Community Access</span>
                                </div>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} noValidate className="space-y-3">
                                <div className="space-y-1">
                                    <label htmlFor="lead-name" className="text-xs font-bold text-slate-200 flex justify-between">
                                        Full Name <span className="text-brandGreen font-semibold">Required</span>
                                    </label>
                                    <input
                                        ref={nameRef}
                                        id="lead-name"
                                        name="name"
                                        autoComplete="name"
                                        maxLength={100}
                                        value={form.name}
                                        onChange={e => updateField("name", e.target.value)}
                                        placeholder="Enter your full name"
                                        aria-invalid={Boolean(errors.name)}
                                        aria-describedby={errors.name ? "lead-name-error" : undefined}
                                        className={inputClass(Boolean(errors.name))}
                                    />
                                    {errors.name && <p id="lead-name-error" className="text-xs text-red-300">{errors.name}</p>}
                                </div>

                                <div className="space-y-1">
                                    <label htmlFor="lead-phone" className="text-xs font-bold text-slate-200 flex justify-between">
                                        WhatsApp Phone Number <span className="text-brandGreen font-semibold">Required</span>
                                    </label>
                                    <div className="flex gap-2">
                                        <select
                                            aria-label="Country code"
                                            value={form.countryCode}
                                            onChange={e => updateField("countryCode", e.target.value)}
                                            className="w-[92px] shrink-0 bg-white/[0.06] border border-white/15 rounded-xl px-2 py-3 text-[15px] text-white outline-none focus:border-brandGreen focus:ring-2 focus:ring-brandGreen/25"
                                        >
                                            {countryCodes.map(c => (
                                                <option key={c.iso} value={c.code} className="text-slate-900">
                                                    {c.flag} {c.code}
                                                </option>
                                            ))}
                                        </select>
                                        <input
                                            id="lead-phone"
                                            name="phone"
                                            type="tel"
                                            inputMode="tel"
                                            autoComplete="tel-national"
                                            maxLength={16}
                                            value={form.phone}
                                            onChange={e => updateField("phone", e.target.value.replace(/[^\d\s-]/g, ""))}
                                            placeholder={form.countryCode === "+91" ? "98765 43210" : "Phone number"}
                                            aria-invalid={Boolean(errors.phone)}
                                            aria-describedby={errors.phone ? "lead-phone-error" : undefined}
                                            className={inputClass(Boolean(errors.phone))}
                                        />
                                    </div>
                                    {errors.phone && <p id="lead-phone-error" className="text-xs text-red-300">{errors.phone}</p>}
                                    <p className="text-[10px] text-slate-400">
                                        We will send your workshop pass and access links to this WhatsApp number.
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <label htmlFor="lead-email" className="text-xs font-bold text-slate-200 flex justify-between">
                                        Email Address <span className="text-slate-400 font-medium">Optional</span>
                                    </label>
                                    <input
                                        id="lead-email"
                                        name="email"
                                        type="email"
                                        inputMode="email"
                                        autoComplete="email"
                                        maxLength={254}
                                        value={form.email}
                                        onChange={e => updateField("email", e.target.value)}
                                        placeholder="you@example.com (for calendar invite)"
                                        aria-invalid={Boolean(errors.email)}
                                        aria-describedby={errors.email ? "lead-email-error" : undefined}
                                        className={inputClass(Boolean(errors.email))}
                                    />
                                    {errors.email && <p id="lead-email-error" className="text-xs text-red-300">{errors.email}</p>}
                                </div>

                                {/* Honeypot: hidden from people, bots tend to fill it */}
                                <input
                                    type="text"
                                    name="website"
                                    tabIndex={-1}
                                    autoComplete="off"
                                    aria-hidden="true"
                                    value={form.website}
                                    onChange={e => updateField("website", e.target.value)}
                                    className="absolute -left-[9999px] w-px h-px opacity-0"
                                />

                                {submitError && (
                                    <div role="alert" className="flex items-start gap-2 bg-red-500/10 border border-red-400/30 text-red-200 text-sm rounded-xl px-3.5 py-2.5">
                                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                        <span>{submitError}</span>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={status === "saving"}
                                    className="w-full mt-1.5 inline-flex items-center justify-center gap-2 bg-brandGreen hover:brightness-105 active:brightness-95 text-slate-950 font-black text-[15px] sm:text-base py-3.5 px-4 rounded-xl shadow-lg shadow-brandGreen/25 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-wait cursor-pointer"
                                >
                                    {status === "saving" ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Unlocking your ₹99 Pass…
                                        </>
                                    ) : (
                                        <>
                                            <span>Claim ₹99 Offer & Continue to Masterclass</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Trust badges */}
                            <div className="mt-3.5 pt-3 border-t border-white/10 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-slate-400 text-center">
                                <span className="inline-flex items-center gap-1">
                                    <ShieldCheck className="w-3.5 h-3.5 text-brandGreen shrink-0" />
                                    100% Privacy • No Spam
                                </span>
                                <span className="inline-flex items-center gap-1">
                                    <Check className="w-3.5 h-3.5 text-brandGreen shrink-0" />
                                    4,850+ Attendees Trained
                                </span>
                                <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-200">
                                    Privacy Policy
                                </a>
                            </div>
                        </>
                    )}
                </div>

                <div className="relative border-t border-white/5 bg-black/30 px-5 py-2 text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
                    <Lock className="w-3 h-3 text-brandGreen" />
                    Secured by TECH TYCOON DIGITAL SOLUTION LLP
                </div>
            </div>
        </div>
    );
};

export default AIMasterclassLeadGate;
