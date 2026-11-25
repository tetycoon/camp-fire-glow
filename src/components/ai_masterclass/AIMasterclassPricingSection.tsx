import React from "react";
import { CheckCircle2, XCircle, Zap, ShieldCheck, ArrowRight, Building2, Sparkles, FileText, Cpu, Bot, Globe } from "lucide-react";
import { useAIMasterclassRegisterModal } from "./AIMasterclassRegisterModalContext";

const AIMasterclassPricingSection: React.FC = () => {
    const { openRegisterModal } = useAIMasterclassRegisterModal();

    return (
        <section id="pricing" className="py-20 sm:py-24 px-4 bg-gradient-to-b from-slate-50/70 via-white to-slate-50/70 border-t border-slate-200/90 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
                <div className="text-center mb-14 sm:mb-16">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-slate-200 rounded-md text-[11px] font-bold text-blue-700 tracking-widest uppercase shadow-2xs mb-4">
                        <Zap className="w-3.5 h-3.5 text-blue-600" />
                        <span>Program Fee & Enrollment Options</span>
                    </div>
                    <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
                        Choose Your <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">Masterclass Pass</span>
                    </h2>
                    <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        Select the 3-hour live online session for ₹99, or upgrade to the complete package for ₹499 to include our comprehensive resource toolkit.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch max-w-5xl mx-auto">
                    {/* OPTION 1: ₹99 Standard Live Pass */}
                    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_10px_30px_rgba(15,23,42,0.04)] hover:shadow-[0_20px_45px_rgba(15,23,42,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden relative">
                        <div className="p-7 sm:p-9 flex-1 flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold uppercase tracking-wider">
                                    <Building2 className="w-3.5 h-3.5 text-slate-500" /> Standard Live Pass
                                </span>
                                <span className="text-[11px] font-semibold text-slate-500">Live Attendance Only</span>
                            </div>

                            <h3 className="text-2xl font-black text-slate-900 mb-2">
                                3-Hours Live Online Session
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
                                Complete live interactive masterclass covering AI tools, prompt frameworks, and business automation strategies.
                            </p>

                            <div className="flex items-baseline gap-2.5 mb-1">
                                <span className="text-2xl text-slate-400 line-through font-semibold">₹999</span>
                                <span className="text-5xl font-black text-slate-900 leading-none">₹99</span>
                            </div>
                            <p className="text-xs font-semibold text-blue-700 mb-6">
                                Inclusive of 18% GST (Final Fee ₹99)
                            </p>

                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 mb-6 text-xs text-amber-900 space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <span>Status:</span>
                                    <span className="font-bold text-amber-700">Admissions Paused</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Medium:</span>
                                    <span className="font-bold text-slate-900">Live Online (On Hold)</span>
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-5 mt-auto">
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3.5">
                                    What's Included:
                                </p>
                                <ul className="space-y-3 text-xs sm:text-sm text-slate-700 mb-6">
                                    <li className="flex items-start gap-2.5">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                        <span><strong>3-Hours Live Interactive Training</strong> (Live Virtual Classroom)</span>
                                    </li>
                                    <li className="flex items-start gap-2.5 text-slate-400">
                                        <XCircle className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                                        <span>Resource Toolkit (PDFs, Toolkits & Agents) — <em>Not Included</em></span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="p-7 sm:p-9 pt-0">
                            <a
                                href="https://chat.whatsapp.com/EpsuzpxGz6F98ml2GUBejC"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-base py-4 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mb-3"
                            >
                                <span>Admissions Paused — Join Waitlist</span>
                                <ArrowRight className="w-4 h-4 text-white" />
                            </a>
                            <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-amber-700">
                                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> Live masterclass sessions currently on hold
                            </div>
                        </div>
                    </div>

                    {/* OPTION 2: ₹499 Complete Live Session + Resource Toolkit Pass */}
                    <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white rounded-2xl border-2 border-blue-500 shadow-[0_0_50px_-10px_rgba(59,130,246,0.3)] hover:shadow-[0_0_60px_-5px_rgba(59,130,246,0.4)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden relative">
                        {/* Most Popular Badge */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center py-2.5 px-4 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xs">
                            <Sparkles className="w-3.5 h-3.5 fill-white text-white" />
                            <span>RECOMMENDED • COMPLETE DELEGATE PACKAGE</span>
                        </div>

                        <div className="p-7 sm:p-9 flex-1 flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[11px] font-bold uppercase tracking-wider">
                                    <Zap className="w-3.5 h-3.5 text-blue-400" /> Live Session + Resource Toolkit
                                </span>
                                <span className="text-[11px] font-bold text-blue-300">All-Inclusive</span>
                            </div>

                            <h3 className="text-2xl font-black text-white mb-2">
                                Masterclass + Complete Toolkit
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
                                Complete live training plus direct downloadable access to our entire implementation suite, prompt vault, and agent links.
                            </p>

                            <div className="flex items-baseline gap-2.5 mb-1">
                                <span className="text-2xl text-slate-500 line-through font-semibold">₹10,000</span>
                                <span className="text-5xl font-black text-white leading-none">₹499</span>
                            </div>
                            <p className="text-xs font-semibold text-blue-400 mb-6">
                                Inclusive of 18% GST (Final Fee ₹499)
                            </p>

                            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3.5 mb-6 text-xs text-slate-300 space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <span>Status:</span>
                                    <span className="font-bold text-amber-400">Admissions Paused</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Live Session:</span>
                                    <span className="font-bold text-slate-400">Cohorts On Hold</span>
                                </div>
                            </div>

                            <div className="border-t border-slate-800 pt-5 mt-auto">
                                <p className="text-xs font-bold uppercase tracking-wider text-blue-300 mb-3.5 flex items-center gap-1.5">
                                    <span>Everything in Live Session, Plus:</span>
                                </p>
                                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-200 mb-6">
                                    <li className="flex items-center gap-2.5">
                                        <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                                        <span className="font-bold text-white">3-Hours Live Online Session</span>
                                    </li>
                                    <li className="flex items-center gap-2.5 bg-blue-500/10 border border-blue-500/20 rounded-lg py-2.5 px-3">
                                        <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                                        <span className="font-semibold text-white">1. Session PDF Material</span>
                                    </li>
                                    <li className="flex items-center gap-2.5 bg-blue-500/10 border border-blue-500/20 rounded-lg py-2.5 px-3">
                                        <Cpu className="w-4 h-4 text-blue-400 shrink-0" />
                                        <span className="font-semibold text-white">2. 10+ AI Tool Kit</span>
                                    </li>
                                    <li className="flex items-center gap-2.5 bg-blue-500/10 border border-blue-500/20 rounded-lg py-2.5 px-3">
                                        <Bot className="w-4 h-4 text-blue-400 shrink-0" />
                                        <span className="font-semibold text-white">3. Multiple AI Agent Link</span>
                                    </li>
                                    <li className="flex items-center gap-2.5 bg-blue-500/10 border border-blue-500/20 rounded-lg py-2.5 px-3">
                                        <Globe className="w-4 h-4 text-blue-400 shrink-0" />
                                        <span className="font-semibold text-white">4. 10+ Secret AI Website</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="p-7 sm:p-9 pt-0">
                            <a
                                href="https://chat.whatsapp.com/EpsuzpxGz6F98ml2GUBejC"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-base py-4 px-6 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer mb-3"
                            >
                                <span>Admissions Paused — Join Waitlist</span>
                                <ArrowRight className="w-4 h-4 text-white" />
                            </a>
                            <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-amber-400">
                                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Live masterclass sessions currently on hold
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AIMasterclassPricingSection;
