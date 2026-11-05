import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, Loader2, Lock, ShieldCheck, AlertCircle } from "lucide-react";
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
    const leadTrackedRef = useRef(false);

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

            // Fire Meta Pixel 'Lead' and GA4 'generate_lead' events upon successful enquiry form submission
            if (!leadTrackedRef.current) {
                leadTrackedRef.current = true;
                try {
                    if (typeof window.fbq === "function") {
                        window.fbq(
                            "track",
                            "Lead",
                            {
                                content_name: "AI Secrets Revealed Masterclass",
                                content_category: "Landing Page Enquiry Popup",
                            },
                            leadId ? { eventID: leadId } : undefined
                        );
                    }
                } catch (metaErr) {
                    console.warn("Meta Pixel Lead event dispatch failed:", metaErr);
                }

                try {
                    if (typeof window.gtag === "function") {
                        window.gtag("event", "generate_lead", {
                            event_category: "Lead Form",
                            event_label: "AI Masterclass Landing Popup",
                        });
                    }
                } catch (gaErr) {
                    console.warn("GA4 generate_lead event dispatch failed:", gaErr);
                }
            }

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
            hasError ? "border-red-400/70 focus:ring-red-400/25" : "border-white/15 focus:border-blue-500 focus:ring-blue-500/25"
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
                className="relative w-full sm:max-w-md overflow-hidden rounded-t-2xl sm:rounded-2xl bg-gradient-to-b from-[#0f172a] via-[#090d16] to-[#020617] border border-white/15 shadow-2xl shadow-black/80 animate-in fade-in slide-in-from-bottom-4 duration-300"
            >
                {/* Corporate gradient accent top bar */}
                <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400" />
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

                <div className="relative px-5 pt-6 pb-5 sm:px-7 sm:pt-7 sm:pb-6">
                    {status === "success" ? (
                        <div className="text-center py-10" role="status" aria-live="polite">
                            <div className="w-16 h-16 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center mx-auto mb-4 animate-bounce">
                                <CheckCircle2 className="w-9 h-9 text-blue-400" />
                            </div>
                            <h2 id="lead-gate-title" className="text-2xl font-black text-white">You're in!</h2>
                            <p id="lead-gate-desc" className="text-sm text-slate-300 mt-2 flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                                Taking you to the Masterclass…
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Corporate Brand Header */}
                            <div className="flex items-center gap-2.5 mb-4">
                                <img src="/logo.png" alt="Tech Tycoon" className="w-9 h-9 rounded-full border border-white/20 shrink-0" />
                                <div className="leading-tight">
                                    <p className="text-[13px] font-black text-white tracking-wide">TECH TYCOON</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">DIGITAL SOLUTION LLP</p>
                                </div>
                            </div>

                            {/* Simple, High-Impact Headline */}
                            <h2 id="lead-gate-title" className="text-2xl sm:text-[26px] font-black text-white tracking-tight leading-tight">
                                Unlock the <span className="text-blue-400">₹99 Masterclass</span> Offer
                            </h2>
                            <p id="lead-gate-desc" className="text-xs sm:text-sm text-slate-300 mt-1.5 mb-5 leading-relaxed">
                                Submit your enquiry details to instantly claim the special <strong className="text-white font-bold">₹99 delegate pass</strong> (Original price <span className="line-through text-slate-400">₹999</span>) and reserve your live seat.
                            </p>

                            {/* Simple Form (Name & Phone Only) */}
                            <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
                                <div className="space-y-1">
                                    <label htmlFor="lead-name" className="text-xs font-bold text-slate-200 flex justify-between">
                                        Full Name <span className="text-blue-400 font-semibold">Required</span>
                                    </label>
                                    <input
                                        ref={nameRef}
                                        id="lead-name"
                                        name="name"
                                        autoComplete="name"
                                        maxLength={100}
                                        value={form.name}
                                        onChange={e => updateField("name", e.target.value)}
                                        placeholder="Your full name"
                                        aria-invalid={Boolean(errors.name)}
                                        aria-describedby={errors.name ? "lead-name-error" : undefined}
                                        className={inputClass(Boolean(errors.name))}
                                    />
                                    {errors.name && <p id="lead-name-error" className="text-xs text-red-300">{errors.name}</p>}
                                </div>

                                <div className="space-y-1">
                                    <label htmlFor="lead-phone" className="text-xs font-bold text-slate-200 flex justify-between">
                                        Phone Number <span className="text-blue-400 font-semibold">Required</span>
                                    </label>
                                    <div className="flex gap-2">
                                        <select
                                            aria-label="Country code"
                                            value={form.countryCode}
                                            onChange={e => updateField("countryCode", e.target.value)}
                                            className="w-[92px] shrink-0 bg-white/[0.06] border border-white/15 rounded-xl px-2 py-3 text-[15px] text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25"
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
                                    className="w-full mt-1 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[15px] py-3.5 px-4 rounded-xl shadow-lg shadow-blue-600/25 transition-all disabled:opacity-70 disabled:cursor-wait cursor-pointer"
                                >
                                    {status === "saving" ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Saving your details…
                                        </>
                                    ) : (
                                        <>
                                            <span>Continue to Masterclass</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center">
                                <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                <span>
                                    Your details are kept private. No spam.{" "}
                                    <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-200">
                                        Privacy
                                    </a>
                                </span>
                            </div>
                        </>
                    )}
                </div>

                <div className="relative border-t border-white/5 bg-black/30 px-5 py-2.5 text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
                    <Lock className="w-3 h-3 text-blue-400" />
                    Secured by TECH TYCOON DIGITAL SOLUTION LLP
                </div>
            </div>
        </div>
    );
};

export default AIMasterclassLeadGate;
