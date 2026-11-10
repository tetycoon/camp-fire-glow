import React from "react";
import { CheckCircle2, XCircle, Zap, ShieldCheck, ArrowRight, Building2, Sparkles, FileText, Cpu, Bot, Globe } from "lucide-react";
import { useAIMasterclassRegisterModal } from "./AIMasterclassRegisterModalContext";
import { getMasterclassDateStrings } from "../../lib/masterclassDateUtils";

const AIMasterclassPricingSection: React.FC = () => {
    const { openRegisterModal } = useAIMasterclassRegisterModal();
    const { nextSession } = getMasterclassDateStrings();

    return (
        <section id="pricing" className="py-20 sm:py-24 px-4 bg-slate-50/70 border-t border-slate-200/90 relative">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-14 sm:mb-16">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-slate-200 rounded-md text-[11px] font-bold text-blue-700 tracking-widest uppercase shadow-2xs mb-4">
                        <Zap className="w-3.5 h-3.5 text-blue-600" />
                        <span>Program Fee & Enrollment Options</span>
                    </div>
                    <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
                        Choose Your Masterclass Pass
                    </h2>
                    <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        Select the 3-hour live online session for ₹99, or upgrade to the complete package for ₹499 to include our comprehensive resource toolkit.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch max-w-5xl mx-auto">
                    {/* OPTION 1: ₹99 Standard Live Pass */}
                    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden relative">
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

                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-6 text-xs text-slate-600 space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <span>Next Live Cohort:</span>
                                    <span className="font-bold text-slate-900">{nextSession.dayName} • {nextSession.shortTime}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Medium:</span>
                                    <span className="font-bold text-slate-900">Live Online (Tamil & English)</span>
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-5 mt-auto">
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3.5">
                                    What's Included:
                                </p>
                                <ul className="space-y-3 text-xs sm:text-sm text-slate-700 mb-6">
                                    <li className="flex items-start gap-2.5">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                        <span><strong>3-Hours Live Interactive Training</strong> (Wed, Fri or Sun)</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                        <span><strong>Live Interactive Q&A</strong> with Antony Praveen</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                        <span><strong>Bilingual Delivery</strong> in Tamil & English</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                        <span><strong>Official Certificate of Participation</strong></span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                        <span><strong>WhatsApp VIP Community</strong> Session Access & Updates</span>
                                    </li>
                                    <li className="flex items-start gap-2.5 text-slate-400">
                                        <XCircle className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                                        <span>Resource Toolkit (PDFs, Toolkits & Agents) — <em>Not Included</em></span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="p-7 sm:p-9 pt-0">
                            <button
                                onClick={() => openRegisterModal()}
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-base py-4 px-6 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer mb-3"
                            >
                                <span>Enroll for Live Session — ₹99</span>
                                <ArrowRight className="w-4 h-4 text-white" />
                            </button>
                            <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-500">
                                <ShieldCheck className="w-3.5 h-3.5 text-slate-600" /> Razorpay 256-Bit SSL • Official GST Tax Invoice
                            </div>
                        </div>
                    </div>

                    {/* OPTION 2: ₹499 Complete Live Session + Resource Toolkit Pass */}
                    <div className="bg-slate-900 text-white rounded-2xl border-2 border-blue-500 shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 flex flex-col justify-between overflow-hidden relative">
                        {/* Most Popular Badge */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center py-2 px-4 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2">
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
                                <span className="text-2xl text-slate-500 line-through font-semibold">₹4,999</span>
                                <span className="text-5xl font-black text-white leading-none">₹499</span>
                            </div>
                            <p className="text-xs font-semibold text-blue-400 mb-6">
                                Inclusive of 18% GST (Final Fee ₹499)
                            </p>

                            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3.5 mb-6 text-xs text-slate-300 space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <span>Live Training Cohort:</span>
                                    <span className="font-bold text-white">{nextSession.dayName} • {nextSession.shortTime}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Toolkit Delivery:</span>
                                    <span className="font-bold text-white">Sent Directly to Email & WhatsApp</span>
                                </div>
                            </div>

                            <div className="border-t border-slate-800 pt-5 mt-auto">
                                <p className="text-xs font-bold uppercase tracking-wider text-blue-300 mb-3.5 flex items-center gap-1.5">
                                    <span>Everything in Live Session, Plus:</span>
                                </p>
                                <ul className="space-y-3.5 text-xs sm:text-sm text-slate-200 mb-6">
                                    <li className="flex items-start gap-2.5">
                                        <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                                        <span><strong>3-Hours Live Online Session</strong> (Full interactive training access)</span>
                                    </li>
                                    <li className="flex items-start gap-2.5 bg-blue-500/10 border border-blue-500/20 rounded-lg p-2.5 -mx-1">
                                        <FileText className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                                        <span><strong>1. Session PDF Material:</strong> Complete high-res slide deck, structured step-by-step implementation frameworks & workflows.</span>
                                    </li>
                                    <li className="flex items-start gap-2.5 bg-blue-500/10 border border-blue-500/20 rounded-lg p-2.5 -mx-1">
                                        <Cpu className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                                        <span><strong>2. 10+ AI Tool Kit:</strong> Handpicked enterprise AI software stack with configuration blueprints for marketing & operations.</span>
                                    </li>
                                    <li className="flex items-start gap-2.5 bg-blue-500/10 border border-blue-500/20 rounded-lg p-2.5 -mx-1">
                                        <Bot className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                                        <span><strong>3. Multiple AI Agents Link:</strong> Pre-built autonomous agent templates & links ready for immediate deployment.</span>
                                    </li>
                                    <li className="flex items-start gap-2.5 bg-blue-500/10 border border-blue-500/20 rounded-lg p-2.5 -mx-1">
                                        <Globe className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                                        <span><strong>4. 10+ Secret AI Websites:</strong> High-efficiency, unlisted AI portals for voice synthesis, video gen, and rapid graphic design.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="p-7 sm:p-9 pt-0">
                            <button
                                onClick={() => openRegisterModal({ includePdfMaterial: true })}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-base py-4 px-6 rounded-xl transition-all shadow-lg shadow-blue-600/30 hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer mb-3"
                            >
                                <span>Enroll with Resource Toolkit — ₹499</span>
                                <ArrowRight className="w-4 h-4 text-white" />
                            </button>
                            <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-400">
                                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Razorpay 256-Bit SSL • Instant Digital Asset Access
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AIMasterclassPricingSection;
