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
        <section className="relative min-h-[calc(100vh-70px)] flex flex-col justify-between px-4 pt-24 pb-12 bg-slate-50 overflow-hidden">
            {/* Background Image Layer */}
            <div
                className="absolute inset-0 bg-cover bg-center pointer-events-none transform scale-105 opacity-35"
                style={{
                    backgroundImage: `url(${heroBg})`,
                    filter: "saturate(0.9)"
                }}
            />

            {/* Clean Corporate Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/90 to-slate-50/95 pointer-events-none" />

            {/* Subtle Architectural Grid Pattern */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, #0f172a 1px, transparent 0)`,
                    backgroundSize: '28px 28px'
                }}
            />

            {/* Executive Royal Blue & Indigo Ambient Glows */}
            <div className="absolute top-12 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-20 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto w-full my-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                    {/* Left Column: Core Value Proposition */}
                    <div className="lg:col-span-7 flex flex-col items-start text-left">
                        {/* Executive Program Badge */}
                        <div className="inline-flex items-center gap-2.5 mb-5 px-4 py-1.5 rounded-full bg-slate-900 text-white shadow-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400"></span>
                            </span>
                            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-100">
                                EXECUTIVE 3-HOUR LIVE WORKSHOP • WED, FRI & SUN COHORTS
                            </span>
                        </div>

                        {/* Corporate Headline */}
                        <h1 className="text-3xl sm:text-5xl lg:text-[3.4rem] font-black leading-[1.12] text-slate-900 mb-4 tracking-tight">
                            AI Secrets <span className="text-blue-600">Revealed</span> <br className="hidden sm:block" />
                            For Business Productivity
                        </h1>

                        {/* Subheadline */}
                        <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed mb-6 font-normal">
                            Eliminate 20+ hours of repetitive weekly operations across content, design, and client acquisition. Deploy structured AI workflows to scale your organization with precision.
                        </p>

                        {/* Corporate Benefit Pills with Vector Icons */}
                        <div className="flex flex-wrap items-center gap-2.5 mb-6">
                            {benefitPills.map((pill, i) => {
                                const Icon = pill.icon;
                                return (
                                    <span key={i} className="text-xs font-semibold text-slate-700 bg-white border border-slate-200/90 shadow-xs px-3.5 py-2 rounded-lg flex items-center gap-2">
                                        <Icon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                        <span>{pill.label}</span>
                                    </span>
                                );
                            })}
                        </div>

                        {/* Executive Rating & Social Proof */}
                        <div className="flex flex-wrap items-center gap-3 mb-7 bg-white border border-slate-200/90 rounded-xl px-4 py-3 shadow-xs">
                            <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} className="w-4 h-4 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
                            <p className="text-xs sm:text-sm text-slate-600 font-medium">
                                Rated <span className="font-bold text-slate-900">4.9/5</span> by <span className="font-bold text-slate-900">4,850+</span> founders, executives & working professionals
                            </p>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                            <button
                                onClick={openRegisterModal}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-base sm:text-lg font-bold px-8 py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-600/25 hover:shadow-xl cursor-pointer"
                            >
                                <span>Register for Masterclass — ₹99</span>
                                <span className="text-blue-200 line-through text-sm font-semibold">₹999</span>
                                <ArrowRight className="w-4 h-4 text-white" />
                            </button>

                            <button
                                onClick={() => scrollTo("modules")}
                                className="bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold px-6 py-4 rounded-xl border border-slate-300 hover:border-slate-400 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                            >
                                <span>View Executive Syllabus</span>
                                <ArrowRight className="w-4 h-4 text-slate-500" />
                            </button>
                        </div>

                        <div className="flex items-center gap-2 mt-3.5 text-xs font-semibold text-slate-500">
                            <ShieldCheck className="w-4 h-4 text-blue-600" /> Verified Corporate Checkout via Razorpay • Official GST Tax Invoice Included
                        </div>
                    </div>

                    {/* Right Column: Interactive Live Batch Selector Card */}
                    <div className="lg:col-span-5 flex justify-center lg:justify-end">
                        <div className="w-full max-w-[430px] bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-xl relative overflow-hidden">
                            {/* Corporate Royal Blue top accent */}
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-slate-900 via-blue-600 to-indigo-600" />

                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                                    EXECUTIVE DELEGATE PASS
                                </span>
                                <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> Subsidized Seat
                                </span>
                            </div>

                            {/* Batch Selection Tabs */}
                            <div className="mb-5">
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
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
                                                        ? "bg-blue-50/70 border-2 border-blue-600 shadow-xs"
                                                        : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600"
                                                }`}
                                            >
                                                <div className="text-[11px] font-bold text-slate-900 flex items-center justify-between gap-1">
                                                    <span className="truncate">{slot.dayName}</span>
                                                    {slot.id === nextSession.id && (
                                                        <span className="text-[7px] font-extrabold uppercase bg-blue-100 text-blue-800 px-1 py-0.5 rounded shrink-0">
                                                            Next
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[10px] font-bold text-blue-700 mt-1 leading-tight">
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
                            <div className="bg-slate-50/90 border border-slate-200/80 rounded-xl p-4 space-y-3 mb-5">
                                <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-slate-900">{activeSlot.dateString}</div>
                                        <div className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider">{activeSlot.dayName} Live Cohort</div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center shrink-0 shadow-2xs">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-slate-900">{activeSlot.timeSlot}</div>
                                        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">3 Hours Intensive Executive Training</div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center shrink-0 shadow-2xs">
                                        <Languages className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-slate-900">Tamil & English (Bilingual)</div>
                                        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Clear, Practical Business Delivery</div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center shrink-0 shadow-2xs">
                                        <Video className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-slate-900">Live Online</div>
                                        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Joining Credentials Sent via WhatsApp & Email</div>
                                    </div>
                                </div>
                            </div>

                            {/* Ticket Price & Direct CTA */}
                            <div className="pt-2 border-t border-slate-100">
                                

                                <button
                                    onClick={openRegisterModal}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 hover:shadow-lg transition-all cursor-pointer"
                                >
                                    <span>Enroll for {activeSlot.dayName} Batch — ₹99</span>
                                    <ArrowRight className="w-4 h-4 text-white" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Corporate Trust Logos */}
                <div className="mt-14 pt-8 border-t border-slate-200/90 w-full text-center">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                        ATTENDED BY PROFESSIONALS, MANAGERS & BUSINESS LEADERS FROM
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-slate-600 font-bold text-xs uppercase tracking-wider">
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
                                className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-200/80 text-slate-600 text-[11px] font-bold tracking-wider shadow-2xs"
                            >
                                {org}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Scroll Cue */}
            <div className="relative z-10 flex justify-center mt-6">
                <a href="#about" aria-label="Scroll down" className="text-slate-400 hover:text-blue-600 transition-colors">
                    <ArrowRight className="w-5 h-5 rotate-90" />
                </a>
            </div>
        </section>
    );
};

export default AIMasterclassHeroSection;
