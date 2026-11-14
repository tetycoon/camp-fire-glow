import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, Loader2, Lock, ShieldCheck, AlertCircle, X } from "lucide-react";
import { countryCodes } from "../../lib/countryCodes";
import {
    submitLandingLead,
    validateLandingLead,
    type LandingLeadErrors,
    type LandingLeadInput,
} from "../../lib/landingLeadService";

const STORAGE_KEY = "tt_claude_masterclass_lead_gate";
const REMEMBER_MS = 30 * 24 * 60 * 60 * 1000;
const REDIRECT_DELAY_MS = 900;

export const hasCompletedClaudeLeadGate = (): boolean => {
    try {
        if (typeof window === "undefined" || !window.localStorage) return false;
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return false;
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed.timestamp !== "number") return false;
        return Date.now() - parsed.timestamp < REMEMBER_MS;
    } catch {
        return false;
    }
};

const CLAUDE_APPS_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbwP2rffwhgGYQjJFlfxYU4XHt-jFbUlWtYPAJOZcxIO--yvw2NTlnLvJDHHh4_giLq7/exec";

export const submitClaudeLandingLead = async (
    input: LandingLeadInput
): Promise<{ leadId: string }> => {
    const payload = {
        action: "saveLandingLead",
        name: input.name.replace(/\s+/g, " ").trim(),
        phone: `${input.countryCode}${input.phone.replace(/\D/g, "")}`,
        email: (input.email || "").trim().toLowerCase(),
        website: input.website || "",
        pageUrl: typeof window !== "undefined" ? window.location.href : "",
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
    };

    try {
        const response = await fetch(CLAUDE_APPS_SCRIPT_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (data && data.success && data.leadId) {
            return { leadId: data.leadId };
        }
    } catch (_) {}

    // Fallback to central lead service if Claude sheet is still compiling/updating
    return submitLandingLead(input);
};

export const markClaudeLeadGateCompleted = (leadId: string): void => {
    try {
        if (typeof window === "undefined" || !window.localStorage) return;
        window.localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ leadId, timestamp: Date.now() })
        );
    } catch {}
};

interface ClaudeMasterclassLeadGateProps {
    submitLead?: typeof submitLandingLead;
    badgeText?: string;
    title?: React.ReactNode;
    description?: React.ReactNode;
    mobileBadge?: string;
    trainerRole?: string;
}

const ClaudeMasterclassLeadGate: React.FC<ClaudeMasterclassLeadGateProps> = ({
    submitLead = submitClaudeLandingLead,
    badgeText = "⚡ Exclusive Masterclass Offer",
    title,
    description,
    mobileBadge = "₹499 Offer",
    trainerRole = "AI Engineer",
}) => {
    const [mounted, setMounted] = useState(false);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState<LandingLeadInput>({
        name: "",
        countryCode: "+91",
        phone: "",
        email: "",
        website: "",
    });
    const [errors, setErrors] = useState<LandingLeadErrors>({});
    const [status, setStatus] = useState<"idle" | "saving" | "success">("idle");
    const [submitError, setSubmitError] = useState<string | null>(null);

    const nameRef = useRef<HTMLInputElement>(null);
    const isSubmittingRef = useRef(false);

    useEffect(() => {
        setMounted(true);
        if (!hasCompletedClaudeLeadGate()) {
            setOpen(true);
        }
    }, []);

    useEffect(() => {
        if (open && nameRef.current) {
            const timer = setTimeout(() => nameRef.current?.focus(), 150);
            return () => clearTimeout(timer);
        }
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [open]);

    if (!mounted || !open) return null;

    const updateField = (field: keyof LandingLeadInput, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
        if (submitError) setSubmitError(null);
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e && typeof e.preventDefault === "function") e.preventDefault();
        if (isSubmittingRef.current || status === "saving") return;
        setSubmitError(null);

        const validationErrors = validateLandingLead(form);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        isSubmittingRef.current = true;
        setStatus("saving");
        try {
            const result = await submitLead(form);
            if (result && result.leadId) {
                markClaudeLeadGateCompleted(result.leadId);

                // Meta Pixel Lead tracking (clean, no PII / no monetary values)
                if (typeof window !== "undefined" && typeof (window as any).fbq === "function") {
                    try {
                        (window as any).fbq(
                            "track",
                            "Lead",
                            {
                                content_name: "Claude 3.5 AI Masterclass",
                                content_category: "Landing Page Enquiry Popup",
                            },
                            { eventID: result.leadId }
                        );
                    } catch (_) {}
                }

                // Google Analytics 4 generate_lead tracking
                if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
                    try {
                        (window as any).gtag("event", "generate_lead", {
                            event_category: "Lead Form",
                            event_label: "Claude Masterclass Landing Popup",
                        });
                    } catch (_) {}
                }

                setStatus("success");
                setTimeout(() => setOpen(false), REDIRECT_DELAY_MS);
            } else {
                isSubmittingRef.current = false;
                setStatus("idle");
                setSubmitError("Unable to save your details. Please check your connection.");
            }
        } catch (err: any) {
            isSubmittingRef.current = false;
            setStatus("idle");
            setSubmitError(err?.message || "Something went wrong. Please try again.");
        }
    };

    const inputClass = (hasError: boolean) =>
        `w-full bg-white border ${
            hasError ? "border-red-400 focus:border-red-500 focus:ring-red-100" : "border-slate-200 focus:border-[#D85A30] focus:ring-[#D85A30]/15"
        } rounded-xl px-3.5 py-3 text-[15px] text-slate-900 placeholder:text-slate-400 outline-none transition-all shadow-sm focus:ring-4`;

    return (
        <div
            className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
            style={{ backdropFilter: "blur(10px)", background: "rgba(15, 23, 42, 0.70)" }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="lead-gate-title"
                aria-describedby="lead-gate-desc"
                className="relative w-full sm:max-w-lg md:max-w-3xl overflow-hidden rounded-t-3xl sm:rounded-3xl bg-white border border-slate-200 shadow-2xl shadow-slate-950/20 animate-in fade-in slide-in-from-bottom-4 duration-300"
            >
                {/* Gradient top accent line */}
                <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-[#D85A30] to-orange-600" />
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-100/60 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-amber-100/60 rounded-full blur-3xl pointer-events-none" />

                {/* Close Button */}
                <button
                    type="button"
                    onClick={() => {
                        markClaudeLeadGateCompleted("skip_" + Date.now());
                        setOpen(false);
                    }}
                    className="absolute top-3 right-3 z-30 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                    aria-label="Close"
                >
                    <X className="w-4 h-4" />
                </button>

                {status === "success" ? (
                    <div className="text-center py-16 px-6 bg-gradient-to-br from-orange-50/50 via-white to-amber-50/50" role="status" aria-live="polite">
                        <div className="w-16 h-16 rounded-full bg-orange-100 border-2 border-[#D85A30] flex items-center justify-center mx-auto mb-4 animate-bounce">
                            <CheckCircle2 className="w-9 h-9 text-[#D85A30]" />
                        </div>
                        <h2 id="lead-gate-title" className="text-2xl font-black text-slate-900">You're in!</h2>
                        <p id="lead-gate-desc" className="text-sm text-slate-600 mt-2 flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-[#D85A30]" />
                            Taking you to the Masterclass…
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col md:flex-row min-h-[480px]">
                        {/* LEFT COLUMN: Full-Height Trainer Visual (Desktop Only) */}
                        <div className="hidden md:flex md:w-[44%] relative flex-col justify-between overflow-hidden bg-slate-950 border-r border-slate-200 md:min-h-full">
                            {/* Full-bleed Antony Stage Portrait */}
                            <img
                                src="/images/antony_full.jpg"
                                alt="Antony Praveen - AI Engineer"
                                className="absolute inset-0 w-full h-full object-cover object-top filter brightness-[0.96] contrast-[1.04]"
                            />

                            {/* Top dark gradient overlay for header readability */}
                            <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/80 via-black/35 to-transparent pointer-events-none" />

                            {/* Bottom dark gradient overlay for text readability */}
                            <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent pointer-events-none" />

                            {/* Top Brand Tag & Live Pill */}
                            <div className="relative z-10 p-4 sm:p-5 flex items-center justify-between">
                                <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md border border-slate-200 px-3 py-1 rounded-full shadow-md">
                                    <img src="/logo.png" alt="Tech Tycoon" className="w-5 h-5 rounded-full border border-slate-100 shrink-0" />
                                    <span className="text-[10px] font-black text-slate-900 tracking-wider">TECH TYCOON</span>
                                </div>
                                <span className="bg-emerald-500 text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border border-white/60 flex items-center gap-1 shadow-md">
                                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                    LIVE MENTOR
                                </span>
                            </div>

                            {/* Bottom Trainer Name & Trust Badges */}
                            <div className="relative z-10 p-5 text-left space-y-2.5">
                                <div>
                                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-md">
                                        Antony Praveen
                                    </h3>
                                    <p className="text-xs text-amber-300 font-semibold drop-shadow">
                                        {trainerRole}
                                    </p>
                                </div>

                                <div className="pt-2.5 border-t border-white/20 space-y-1.5 text-xs text-slate-100 font-medium drop-shadow">
                                    <p className="flex items-center gap-2">
                                        <span className="text-emerald-400 font-bold text-sm">✓</span>
                                        <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded border border-white/15">5000+ Trained</span>
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <span className="text-emerald-400 font-bold text-sm">✓</span>
                                        <span>Live Interactive Session in Tamil</span>
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <span className="text-emerald-400 font-bold text-sm">✓</span>
                                        <span>Direct Q&A with Antony</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Offer Headline & Form */}
                        <div className="w-full md:w-[56%] relative p-5 sm:p-7 md:p-8 flex flex-col justify-between bg-gradient-to-br from-[#faf7f2] via-white to-orange-50/40 overflow-hidden">
                            {/* Mobile Background Image */}
                            <div className="md:hidden absolute inset-0 overflow-hidden pointer-events-none z-0">
                                <img
                                    src="/images/antony_full.jpg"
                                    alt=""
                                    aria-hidden="true"
                                    className="w-full h-full object-cover object-top opacity-[0.14] filter contrast-125"
                                />
                                <div className="absolute inset-0 bg-gradient-to-b from-[#faf7f2]/95 via-white/95 to-white/98" />
                            </div>

                            <div className="relative z-10">
                                {/* Mobile-Only Live Mentor Banner */}
                                <div className="md:hidden flex items-center justify-between gap-2.5 p-2.5 rounded-2xl bg-white/95 border border-slate-200 shadow-sm backdrop-blur-md mb-3.5">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="relative shrink-0">
                                            <img
                                                src="/images/antony_full.jpg"
                                                alt="Antony Praveen"
                                                className="w-10 h-10 rounded-xl object-cover object-top border-2 border-emerald-400 shadow-xs"
                                            />
                                            <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white text-[7px] font-black uppercase px-1 py-0.2 rounded-full border border-white flex items-center gap-0.5 shadow-xs">
                                                <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                                                LIVE
                                            </span>
                                        </div>
                                        <div className="min-w-0 text-left">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <h4 className="text-xs font-black text-slate-900 leading-tight">Antony Praveen</h4>
                                                <span className="text-[9px] bg-orange-100 text-[#D85A30] font-bold px-1.5 py-0.2 rounded">AI Engineer</span>
                                            </div>
                                            <p className="text-[10px] text-emerald-600 font-bold leading-tight mt-0.5">
                                                ✓ 5000+ Trained • Live in Tamil
                                            </p>
                                        </div>
                                    </div>
                                    <span className="shrink-0 bg-[#D85A30] text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-xs">
                                        {mobileBadge}
                                    </span>
                                </div>

                                <div className="hidden md:inline-flex items-center gap-1.5 bg-orange-100/90 border border-orange-200 text-[#D85A30] px-2.5 py-0.5 rounded-full text-[11px] font-bold mb-3 shadow-xs">
                                    <span>{badgeText}</span>
                                </div>

                                <h2 id="lead-gate-title" className="text-xl sm:text-2xl md:text-[25px] font-black text-slate-900 tracking-tight leading-tight">
                                    {title || (
                                        <>
                                            Unlock the <span className="text-[#D85A30] bg-gradient-to-r from-[#D85A30] via-orange-600 to-amber-600 bg-clip-text text-transparent">₹499 Masterclass</span> Offer
                                        </>
                                    )}
                                </h2>
                                <p id="lead-gate-desc" className="text-xs sm:text-sm text-slate-600 mt-1.5 mb-5 leading-relaxed">
                                    {description || (
                                        <>
                                            Submit your enquiry details to instantly claim the special <strong className="text-slate-900 font-bold">₹499 delegate pass</strong> (Original price <span className="line-through text-slate-400">₹1,999</span>) and reserve your live seat.
                                        </>
                                    )}
                                </p>

                                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                                    <div className="space-y-1.5 text-left">
                                        <label htmlFor="lead-name" className="text-xs font-bold text-slate-700 flex justify-between">
                                            Full Name <span className="text-[#D85A30] font-semibold">Required</span>
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
                                        {errors.name && <p id="lead-name-error" className="text-xs text-red-500 font-medium">{errors.name}</p>}
                                    </div>

                                    <div className="space-y-1.5 text-left">
                                        <label htmlFor="lead-phone" className="text-xs font-bold text-slate-700 flex justify-between">
                                            Phone Number <span className="text-[#D85A30] font-semibold">Required</span>
                                        </label>
                                        <div className="flex gap-2">
                                            <select
                                                aria-label="Country code"
                                                value={form.countryCode}
                                                onChange={e => updateField("countryCode", e.target.value)}
                                                className="w-[96px] shrink-0 bg-white border border-slate-200 rounded-xl px-2 py-3 text-[14px] text-slate-800 outline-none shadow-sm focus:border-[#D85A30] focus:ring-4 focus:ring-[#D85A30]/15 transition-all font-medium"
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
                                        {errors.phone && <p id="lead-phone-error" className="text-xs text-red-500 font-medium">{errors.phone}</p>}
                                    </div>

                                    {/* Honeypot */}
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
                                        <div role="alert" className="flex items-center justify-between gap-2 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-xl px-3.5 py-2.5">
                                            <div className="flex items-start gap-2">
                                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                                                <span>{submitError}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    markClaudeLeadGateCompleted("skip_err_" + Date.now());
                                                    setOpen(false);
                                                }}
                                                className="underline font-bold text-[#D85A30] hover:text-orange-800 whitespace-nowrap cursor-pointer ml-2 text-xs"
                                            >
                                                Proceed →
                                            </button>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        onClick={handleSubmit}
                                        disabled={status === "saving"}
                                        className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#D85A30] via-orange-600 to-[#D85A30] hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 text-white font-bold text-[15px] py-3.5 px-4 rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 transition-all disabled:opacity-70 disabled:cursor-wait cursor-pointer transform active:scale-[0.99]"
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

                                <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 text-center">
                                    <ShieldCheck className="w-3.5 h-3.5 text-[#D85A30] shrink-0" />
                                    <span>
                                        Your details are kept private. No spam.{" "}
                                        <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-800 font-medium">
                                            Privacy
                                        </a>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bottom Secured Footer */}
                <div className="relative border-t border-slate-200 bg-slate-50 px-5 py-2.5 text-[10px] text-slate-500 flex items-center justify-center gap-1.5 font-medium">
                    <Lock className="w-3 h-3 text-[#D85A30]" />
                    Secured by TECH TYCOON DIGITAL SOLUTION LLP
                </div>
            </div>
        </div>
    );
};

export default ClaudeMasterclassLeadGate;
