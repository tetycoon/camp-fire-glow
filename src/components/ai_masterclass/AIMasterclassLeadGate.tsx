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
            style={{ backdropFilter: "blur(10px)", background: "rgba(2, 6, 23, 0.78)" }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="lead-gate-title"
                aria-describedby="lead-gate-desc"
                className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-gradient-to-b from-[#0f172a] to-[#020617] border border-white/10 shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300"
            >
                {/* Brand accent */}
                <div className="h-1 w-full bg-gradient-to-r from-brandGreen via-emerald-400 to-blue-500" />
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-brandGreen/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

                <div className="relative px-5 pt-6 pb-5 sm:px-7 sm:pt-7 sm:pb-6">
                    {status === "success" ? (
                        <div className="text-center py-8" role="status" aria-live="polite">
                            <CheckCircle2 className="w-14 h-14 text-brandGreen mx-auto mb-4" />
                            <h2 id="lead-gate-title" className="text-xl font-black text-white">You're in!</h2>
                            <p id="lead-gate-desc" className="text-sm text-slate-300 mt-1.5 flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Taking you to the Masterclass…
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-2.5 mb-5">
                                <img src="/logo.png" alt="" className="w-9 h-9 rounded-full border border-white/20 shrink-0" />
                                <div className="leading-tight">
                                    <p className="text-[13px] font-black text-white tracking-wide">TECH TYCOON</p>
                                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.18em]">AI Masterclass</p>
                                </div>
                            </div>

                            <h2 id="lead-gate-title" className="text-2xl sm:text-[26px] font-black text-white tracking-tight leading-tight">
                                Unlock the <span className="text-brandGreen">AI Secrets</span> Masterclass
                            </h2>
                            <p id="lead-gate-desc" className="text-sm text-slate-300 mt-2 mb-5">
                                Enter your details to view the full workshop agenda, batch timings and exclusive bonuses.
                            </p>

                            <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
                                <div className="space-y-1.5">
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
                                        placeholder="Your full name"
                                        aria-invalid={Boolean(errors.name)}
                                        aria-describedby={errors.name ? "lead-name-error" : undefined}
                                        className={inputClass(Boolean(errors.name))}
                                    />
                                    {errors.name && <p id="lead-name-error" className="text-xs text-red-300">{errors.name}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label htmlFor="lead-phone" className="text-xs font-bold text-slate-200 flex justify-between">
                                        Phone Number <span className="text-brandGreen font-semibold">Required</span>
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
                                </div>

                                <div className="space-y-1.5">
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
                                        placeholder="you@example.com"
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
                                    className="w-full mt-1 inline-flex items-center justify-center gap-2 bg-brandGreen hover:brightness-105 active:brightness-95 text-slate-950 font-black text-[15px] py-3.5 rounded-xl shadow-lg shadow-brandGreen/20 transition-all disabled:opacity-70 disabled:cursor-wait cursor-pointer"
                                >
                                    {status === "saving" ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Saving your details…
                                        </>
                                    ) : (
                                        <>
                                            Continue to Masterclass
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </form>

                            <p className="mt-4 text-[11px] text-slate-400 flex items-center justify-center gap-1.5 text-center">
                                <ShieldCheck className="w-3.5 h-3.5 text-brandGreen shrink-0" />
                                Your details are kept private. No spam.
                                <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-200">
                                    Privacy
                                </a>
                            </p>
                        </>
                    )}
                </div>

                <div className="relative border-t border-white/5 bg-black/20 px-5 py-2.5 text-[10px] text-slate-500 flex items-center justify-center gap-1.5">
                    <Lock className="w-3 h-3" />
                    Secured by TECH TYCOON DIGITAL SOLUTION LLP
                </div>
            </div>
        </div>
    );
};

export default AIMasterclassLeadGate;
