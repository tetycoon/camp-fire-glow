import React, { useState } from "react";
import heroBg from "@/assets/hero-bg.jpg";
import { ChevronDown, Calendar, Clock, IndianRupee, Video, Languages, ShieldCheck, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { useAIMasterclassRegisterModal } from "./AIMasterclassRegisterModalContext";
import { getMasterclassDateStrings } from "../../lib/masterclassDateUtils";

const AIMasterclassHeroSection: React.FC = () => {
    const { openRegisterModal } = useAIMasterclassRegisterModal();
    const { orderedSlots, nextSession } = getMasterclassDateStrings();
    const [selectedSlotId, setSelectedSlotId] = useState<"wednesday" | "sunday">(nextSession.id);

    const activeSlot = orderedSlots.find(s => s.id === selectedSlotId) || nextSession;

    const scrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <section className="relative min-h-[calc(100vh-70px)] flex flex-col justify-between px-4 pt-20 pb-10 bg-slate-900/5 overflow-hidden">
            {/* Background Image Layer */}
            <div 
                className="absolute inset-0 bg-cover bg-center pointer-events-none transform scale-105"
                style={{ 
                    backgroundImage: `url(${heroBg})`,
                    filter: "saturate(1.15)"
                }} 
            />

            {/* Light Theme Contrast Overlay & Soft Mask */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/80 to-white pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/70 via-white/85 to-white pointer-events-none" />

            {/* Subtle Tech Grid Pattern */}
            <div 
                className="absolute inset-0 pointer-events-none opacity-[0.035]" 
                style={{ 
                    backgroundImage: `radial-gradient(circle at 1px 1px, #0f172a 1px, transparent 0)`, 
                    backgroundSize: '28px 28px' 
                }} 
            />

            {/* Soft Ambient Brand Glows */}
            <div className="absolute top-12 left-1/4 w-96 h-96 bg-brandGreen/25 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-20 right-10 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto w-full my-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                    {/* Left Column: Core Value Proposition */}
                    <div className="lg:col-span-7 flex flex-col items-start text-left">
                        {/* Live Status Badge */}
                        <div className="inline-flex items-center gap-2 mb-4 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 shadow-sm">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
                            </span>
                            <span className="text-[11px] font-black text-blue-800 uppercase tracking-wider">
                                LIVE 3-HOUR PRACTICAL WORKSHOP • 2 CONVENIENT BATCHES
                            </span>
                        </div>

                        {/* High-Impact Headline */}
                        <h1 className="text-3xl sm:text-5xl lg:text-[3.5rem] font-black leading-[1.12] text-slate-900 mb-4 tracking-tight">
                            AI Secrets <span className="text-blue-600">Revealed</span> <br className="hidden sm:block" />
                            For Business Productivity
                        </h1>

                        {/* Subheadline */}
                        <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed mb-6 font-normal">
                            Stop wasting 20+ hours a week on manual content, design, and marketing. Master practical AI workflows to build your brand, attract clients, and automate your operations.
                        </p>

                        {/* Quick Benefit Pills */}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 mb-6">
                            {[
                                "⚡ 100% Practical & Hands-on",
                                "🎯 Zero Coding Needed",
                                "💬 Tamil & English Bilingual",
                                "🛠️ 10+ AI Tools Covered"
                            ].map((pill, i) => (
                                <span key={i} className="text-xs font-bold text-slate-700 bg-white border border-slate-200/90 shadow-xs px-3 py-1.5 rounded-full flex items-center gap-1.5">
                                    {pill}
                                </span>
                            ))}
                        </div>

                        {/* Star Rating & Social Proof */}
                        <div className="flex flex-wrap items-center gap-3 mb-7 bg-white/80 border border-slate-200/80 rounded-2xl px-4 py-2.5 shadow-sm">
                            <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} className="w-4 h-4 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                            <p className="text-xs sm:text-sm text-slate-700 font-medium">
                                <span className="font-bold text-slate-900">4.9/5 Rating</span> from <span className="font-bold text-slate-900">4,850+</span> business owners & professionals
                            </p>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                            <button
                                onClick={openRegisterModal}
                                className="bg-brandGreen hover:bg-[#a3c77e] text-slate-900 text-base sm:text-lg font-black px-8 py-4 rounded-xl flex items-center justify-center gap-2.5 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-brandGreen/25 border border-[#95c06b] cursor-pointer"
                            >
                                <span>RESERVE SEAT — JUST ₹99</span>
                                <span className="text-slate-700 line-through text-sm font-bold">₹999</span>
                                <Sparkles className="w-4 h-4 text-slate-900" />
                            </button>

                            <button
                                onClick={() => scrollTo("modules")}
                                className="bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold px-5 py-4 rounded-xl border border-slate-300 hover:border-slate-400 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                            >
                                <span>Explore Curriculum</span>
                                <ArrowRight className="w-4 h-4 text-slate-500" />
                            </button>
                        </div>

                        <div className="flex items-center gap-2 mt-3 text-xs font-semibold text-slate-500">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" /> 100% Secure Checkout via Razorpay • GST Invoice Included
                        </div>
                    </div>

                    {/* Right Column: Interactive Live Batch Selector Card */}
                    <div className="lg:col-span-5 flex justify-center lg:justify-end">
                        <div className="w-full max-w-[420px] bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xl relative overflow-hidden">
                            {/* Brand green top accent */}
                            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-brandGreen via-[#a3c77e] to-emerald-500" />

                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                                    LIVE MASTERCLASS PASS
                                </span>
                                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> 90% OFF TODAY
                                </span>
                            </div>

                            {/* Batch Selection Tabs */}
                            <div className="mb-5">
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                                    Select Your Preferred Batch:
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {orderedSlots.map((slot) => {
                                        const isSelected = selectedSlotId === slot.id;
                                        return (
                                            <button
                                                key={slot.id}
                                                type="button"
                                                onClick={() => setSelectedSlotId(slot.id)}
                                                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                                                    isSelected
                                                        ? "bg-emerald-50/90 border-2 border-emerald-600 shadow-sm"
                                                        : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600"
                                                }`}
                                            >
                                                <div className="text-xs font-black text-slate-900 flex items-center justify-between">
                                                    <span>{slot.dayName}</span>
                                                    {slot.id === nextSession.id && (
                                                        <span className="text-[8px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                                                            Next
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[11px] font-bold text-emerald-700 mt-1">
                                                    {slot.id === "wednesday" ? "6 PM – 9 PM" : "10 AM – 1 PM"}
                                                </div>
                                                <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                                                    {slot.id === "wednesday" ? "Evening" : "Morning"}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Active Slot Detailed Snapshot */}
                            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3 mb-5">
                                <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-blue-100/80 text-blue-700 flex items-center justify-center shrink-0">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-black text-slate-900">{activeSlot.dateString}</div>
                                        <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">{activeSlot.dayName} Session</div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-amber-100/80 text-amber-700 flex items-center justify-center shrink-0">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-black text-slate-900">{activeSlot.timeSlot}</div>
                                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">3 Hours Live Interactive</div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-purple-100/80 text-purple-700 flex items-center justify-center shrink-0">
                                        <Languages className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-black text-slate-900">Tamil & English (Bilingual)</div>
                                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Easy to understand practical language</div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center shrink-0">
                                        <Video className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-black text-slate-900">Live Online on Zoom</div>
                                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Access link sent to WhatsApp & Email</div>
                                    </div>
                                </div>
                            </div>

                            {/* Ticket Price & Direct CTA */}
                            <div className="pt-2 border-t border-slate-100">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl font-black text-slate-900 leading-none">₹99</span>
                                            <span className="text-sm font-bold text-slate-400 line-through">₹999</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">+ 18% GST (Total ₹117)</span>
                                    </div>
                                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                                        Save ₹900 Today
                                    </span>
                                </div>

                                <button
                                    onClick={openRegisterModal}
                                    className="w-full bg-brandGreen hover:bg-[#a3c77e] text-slate-900 font-black text-sm py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 border border-[#95c06b] shadow-md hover:shadow-lg transition-all transform active:scale-[0.98] cursor-pointer"
                                >
                                    <span>REGISTER FOR {activeSlot.dayName.toUpperCase()} — ₹99</span>
                                    <ArrowRight className="w-4 h-4 text-slate-900" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Corporate Trust Logos */}
                <div className="mt-12 pt-6 border-t border-slate-200/80 w-full text-center">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">
                        TRUSTED BY FOUNDERS, EXECUTIVES & PROFESSIONALS FROM
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2.5 text-slate-600 font-bold text-xs uppercase tracking-wider">
                        <span>Amazon Web Services</span>
                        <span className="hidden sm:inline text-slate-300">•</span>
                        <span>Cognizant</span>
                        <span className="hidden sm:inline text-slate-300">•</span>
                        <span>Tata Consultancy Services</span>
                        <span className="hidden sm:inline text-slate-300">•</span>
                        <span>Infosys</span>
                        <span className="hidden sm:inline text-slate-300">•</span>
                        <span>HCL Tech</span>
                        <span className="hidden sm:inline text-slate-300">•</span>
                        <span>Zoho Corp</span>
                    </div>
                </div>
            </div>

            <button
                onClick={() => scrollTo("about")}
                className="hidden lg:block absolute bottom-3 left-1/2 -translate-x-1/2 text-slate-400 hover:text-slate-600 transition-colors animate-bounce cursor-pointer"
                aria-label="Scroll to content"
            >
                <ChevronDown className="w-5 h-5" />
            </button>
        </section>
    );
};

export default AIMasterclassHeroSection;
