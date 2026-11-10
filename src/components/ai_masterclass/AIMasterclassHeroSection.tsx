import React, { useState } from "react";
import heroBg from "@/assets/hero-bg.jpg";
import { Calendar, Clock, Video, Languages, ShieldCheck, CheckCircle2, ArrowRight, Zap, Cpu, Building2 } from "lucide-react";
import { useAIMasterclassRegisterModal } from "./AIMasterclassRegisterModalContext";
import { getMasterclassDateStrings } from "../../lib/masterclassDateUtils";

const AIMasterclassHeroSection: React.FC = () => {
    const { openRegisterModal } = useAIMasterclassRegisterModal();
    const { orderedSlots, nextSession } = getMasterclassDateStrings();
    const [selectedSlotId, setSelectedSlotId] = useState<"wednesday" | "friday" | "sunday">(nextSession.id);

    const activeSlot = orderedSlots.find(s => s.id === selectedSlotId) || nextSession;

    const scrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    };

    const benefitPills = [
        { icon: Zap, label: "100% Practical Implementation" },
        { icon: CheckCircle2, label: "Zero Coding Prerequisite" },
        { icon: Languages, label: "Tamil & English Bilingual" },
        { icon: Cpu, label: "10+ Enterprise AI Tools" },
    ];

    return (
        <section className="relative min-h-[calc(100vh-70px)] flex flex-col justify-between px-4 pt-24 pb-12 bg-[#05070f] overflow-hidden">
            {/* Background Image Layer */}
            <div
                className="absolute inset-0 bg-cover bg-center pointer-events-none transform scale-105 opacity-25 mix-blend-luminosity"
                style={{
                    backgroundImage: `url(${heroBg})`,
                    filter: "saturate(0.6)"
                }}
            />

            {/* Midnight Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#05070f]/70 via-[#05070f]/85 to-[#05070f] pointer-events-none" />

            {/* Subtle Architectural Grid Pattern */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.07] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
                style={{
                    backgroundImage: `linear-gradient(to right, #94a3b8 1px, transparent 1px), linear-gradient(to bottom, #94a3b8 1px, transparent 1px)`,
                    backgroundSize: '56px 56px'
                }}
            />

            {/* Indigo, Sky & Violet Ambient Glows */}
            <div className="absolute -top-24 left-[10%] w-[520px] h-[520px] bg-indigo-600/25 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-32 right-[5%] w-[460px] h-[460px] bg-sky-500/15 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-violet-600/15 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto w-full my-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                    {/* Left Column: Core Value Proposition */}
                    <div className="lg:col-span-7 flex flex-col items-start text-left">
                        {/* Executive Program Badge */}
                        <div className="inline-flex items-center gap-2.5 mb-5 px-4 py-1.5 rounded-full bg-white/[0.05] border border-indigo-400/25 text-white shadow-[0_0_30px_-8px_rgba(99,102,241,0.6)] backdrop-blur-md">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-400"></span>
                            </span>
                            <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-100">
                                EXECUTIVE 3-HOUR LIVE WORKSHOP • WED, FRI & SUN COHORTS
                            </span>
                        </div>

                        {/* Corporate Headline */}
                        <h1 className="text-3xl sm:text-5xl lg:text-[3.6rem] font-black leading-[1.08] text-white mb-5 tracking-tight">
                            AI Secrets <span className="bg-gradient-to-r from-sky-300 via-indigo-300 to-violet-300 bg-clip-text text-transparent">Revealed</span> <br className="hidden sm:block" />
                            For Business Productivity
                        </h1>

                        {/* Subheadline */}
                        <p className="text-base sm:text-lg text-slate-300/90 max-w-xl leading-relaxed mb-6 font-normal">
                            Eliminate 20+ hours of repetitive weekly operations across content, design, and client acquisition. Deploy structured AI workflows to scale your organization with precision.
                        </p>

                        {/* Corporate Benefit Pills with Vector Icons */}
                        <div className="flex flex-wrap items-center gap-2.5 mb-6">
                            {benefitPills.map((pill, i) => {
                                const Icon = pill.icon;
                                return (
                                    <span key={i} className="text-xs font-semibold text-slate-200 bg-white/[0.04] border border-white/10 backdrop-blur-md px-3.5 py-2 rounded-lg flex items-center gap-2 hover:border-indigo-400/40 hover:bg-white/[0.07] transition-colors">
                                        <Icon className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                                        <span>{pill.label}</span>
                                    </span>
                                );
                            })}
                        </div>

                        {/* Executive Rating & Social Proof */}
                        <div className="flex flex-wrap items-center gap-3 mb-7 bg-white/[0.04] border border-white/10 backdrop-blur-md rounded-xl px-4 py-3">
                            <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} className="w-4 h-4 text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                            <div className="h-4 w-px bg-white/15 hidden sm:block" />
                            <p className="text-xs sm:text-sm text-slate-400 font-medium">
                                Rated <span className="font-bold text-amber-300">4.9/5</span> by <span className="font-bold text-white">4,850+</span> founders, executives & working professionals
                            </p>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                            <button
                                onClick={openRegisterModal}
                                className="group bg-gradient-to-r from-indigo-500 via-blue-500 to-sky-500 hover:brightness-110 text-white text-base sm:text-lg font-bold px-8 py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-[0_12px_40px_-10px_rgba(99,102,241,0.8)] hover:shadow-[0_16px_50px_-8px_rgba(99,102,241,0.9)] hover:-translate-y-0.5 ring-1 ring-white/20 cursor-pointer"
                            >
                                <span>Register for Masterclass — ₹99</span>
                                <span className="text-indigo-100/70 line-through text-sm font-semibold">₹999</span>
                                <ArrowRight className="w-4 h-4 text-white transition-transform group-hover:translate-x-0.5" />
                            </button>

                            <button
                                onClick={() => scrollTo("modules")}
                                className="bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-sm font-bold px-6 py-4 rounded-xl border border-white/15 hover:border-white/30 backdrop-blur-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
                            >
                                <span>View Executive Syllabus</span>
                                <ArrowRight className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>

                        <div className="flex items-center gap-2 mt-3.5 text-xs font-semibold text-slate-400">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Verified Corporate Checkout via Razorpay • Official GST Tax Invoice Included
                        </div>
                    </div>

                    {/* Right Column: Interactive Live Batch Selector Card */}
                    <div className="lg:col-span-5 flex justify-center lg:justify-end">
                        <div className="relative w-full max-w-[430px]">
                            {/* Gradient halo behind the pass */}
                            <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-indigo-400/50 via-sky-400/20 to-violet-500/40 pointer-events-none" />
                            <div className="absolute -inset-6 rounded-[2rem] bg-indigo-600/20 blur-3xl pointer-events-none" />

                            <div className="relative w-full bg-[#0a0e1c]/90 backdrop-blur-xl rounded-2xl p-6 sm:p-7 shadow-2xl shadow-black/60 overflow-hidden">
                                {/* Accent top bar */}
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-sky-400 to-violet-500" />

                                <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                                    <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                                        <Building2 className="w-3.5 h-3.5 text-indigo-300" />
                                        EXECUTIVE DELEGATE PASS
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-300 border border-emerald-400/25 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Subsidized Seat
                                    </span>
                                </div>

                                {/* Batch Selection Tabs */}
                                <div className="mb-5">
                                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
                                        Select Your Preferred Cohort:
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {orderedSlots.map((slot) => {
                                            const isSelected = selectedSlotId === slot.id;
                                            const isEvening = slot.id === "wednesday" || slot.id === "friday";
                                            return (
                                                <button
                                                    key={slot.id}
                                                    type="button"
                                                    onClick={() => setSelectedSlotId(slot.id)}
                                                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                                                        isSelected
                                                            ? "bg-indigo-500/15 border-indigo-400 shadow-[0_0_24px_-6px_rgba(99,102,241,0.7)]"
                                                            : "bg-white/[0.03] hover:bg-white/[0.06] border-white/10 text-slate-400"
                                                    }`}
                                                >
                                                    <div className="text-[11px] font-bold text-white flex items-center justify-between gap-1">
                                                        <span className="truncate">{slot.dayName}</span>
                                                        {slot.id === nextSession.id && (
                                                            <span className="text-[7px] font-extrabold uppercase bg-sky-400/20 text-sky-200 px-1 py-0.5 rounded shrink-0">
                                                                Next
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-[10px] font-bold text-sky-300 mt-1 leading-tight">
                                                        {isEvening ? "5:30 – 8:30 PM" : "10 AM – 1 PM"}
                                                    </div>
                                                    <div className="text-[9px] text-slate-500 font-medium mt-0.5">
                                                        {isEvening ? "Evening" : "Morning"}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Active Slot Detailed Snapshot */}
                                <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 space-y-3 mb-5">
                                    <div className="flex items-start gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500/30 to-sky-500/20 border border-indigo-400/30 text-sky-300 flex items-center justify-center shrink-0">
                                            <Calendar className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white">{activeSlot.dateString}</div>
                                            <div className="text-[11px] font-semibold text-sky-300 uppercase tracking-wider">{activeSlot.dayName} Live Cohort</div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-white/[0.05] border border-white/10 text-slate-300 flex items-center justify-center shrink-0">
                                            <Clock className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white">{activeSlot.timeSlot}</div>
                                            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">3 Hours Intensive Executive Training</div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-white/[0.05] border border-white/10 text-slate-300 flex items-center justify-center shrink-0">
                                            <Languages className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white">Tamil & English (Bilingual)</div>
                                            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Clear, Practical Business Delivery</div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-white/[0.05] border border-white/10 text-slate-300 flex items-center justify-center shrink-0">
                                            <Video className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white">Live Online via Zoom</div>
                                            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Joining Credentials Sent via WhatsApp & Email</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Ticket Price & Direct CTA */}
                                <div className="pt-2 border-t border-white/10">
                                    <div className="flex items-center justify-between mb-3.5">
                                        <div>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-3xl font-black bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent leading-none">₹99</span>
                                                <span className="text-sm font-semibold text-slate-500 line-through">₹999</span>
                                            </div>
                                            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Inclusive of 18% GST • GST Invoice Provided</span>
                                        </div>
                                        <span className="text-[11px] font-bold text-amber-200 bg-amber-400/10 border border-amber-300/25 px-2.5 py-1 rounded-md">
                                            90% Corporate Subsidy
                                        </span>
                                    </div>

                                    <button
                                        onClick={openRegisterModal}
                                        className="w-full bg-gradient-to-r from-indigo-500 via-blue-500 to-sky-500 hover:brightness-110 text-white font-bold text-sm py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 ring-1 ring-white/15 transition-all cursor-pointer"
                                    >
                                        <span>Enroll for {activeSlot.dayName} Batch — ₹99</span>
                                        <ArrowRight className="w-4 h-4 text-white" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Corporate Trust Logos */}
                <div className="mt-14 pt-8 border-t border-white/[0.08] w-full text-center">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">
                        ATTENDED BY PROFESSIONALS, MANAGERS & BUSINESS LEADERS FROM
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-slate-400 font-bold text-xs uppercase tracking-wider">
                        {[
                            "Amazon Web Services",
                            "Tata Consultancy Services",
                            "Cognizant",
                            "Zoho Corporation",
                            "Freshworks",
                            "Infosys",
                            "HCLTech"
                        ].map((org, idx) => (
                            <span
                                key={idx}
                                className="px-3.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-slate-400 hover:text-slate-200 hover:border-white/20 transition-colors text-[11px] font-bold tracking-wider"
                            >
                                {org}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Scroll Cue */}
            <div className="relative z-10 flex justify-center mt-6">
                <a href="#about" aria-label="Scroll down" className="text-slate-500 hover:text-sky-300 transition-colors">
                    <ArrowRight className="w-5 h-5 rotate-90" />
                </a>
            </div>
        </section>
    );
};

export default AIMasterclassHeroSection;
