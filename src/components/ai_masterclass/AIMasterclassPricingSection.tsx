import React from "react";
import { CheckCircle2, Zap, ShieldCheck, ArrowRight, Building2 } from "lucide-react";
import { useAIMasterclassRegisterModal } from "./AIMasterclassRegisterModalContext";
import { getMasterclassDateStrings } from "../../lib/masterclassDateUtils";

const valueStack = [
    { item: "3-Hour Live Interactive Executive Workshop (Wed, Fri or Sun)", value: "₹4,999" },
    { item: "Resource #1: 500+ Enterprise AI Prompts Library", value: "₹2,999" },
    { item: "Resource #2: 30-Day AI Content & Campaign Matrix", value: "₹3,999" },
    { item: "Resource #3: Executive AI Network & Updates Access", value: "₹2,999" },
    { item: "Live Q&A Consultation with Antony Praveen", value: "₹1,999" },
];

const AIMasterclassPricingSection: React.FC = () => {
    const { openRegisterModal } = useAIMasterclassRegisterModal();
    const { nextSession } = getMasterclassDateStrings();

    return (
        <section id="pricing" className="py-20 sm:py-28 px-4 bg-[#05070f] border-t border-white/[0.06] relative overflow-hidden">
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-indigo-600/15 rounded-full blur-[150px] pointer-events-none" />
            <div className="max-w-5xl mx-auto relative">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-500/10 border border-indigo-400/20 rounded-full text-[11px] font-bold text-indigo-200 tracking-widest uppercase mb-4">
                        <Zap className="w-3.5 h-3.5 text-sky-400" />
                        <span>Program Fee & Value Summary</span>
                    </div>
                    <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
                        Executive AI Training <br className="hidden sm:block" />
                        For Just <span className="bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">₹99</span>
                    </h2>
                    <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        One subsidized registration fee grants full live cohort participation, the executive resource toolkit, and an official GST invoice.
                    </p>
                </div>

                <div className="mx-auto max-w-4xl bg-[#0a0e1c]/90 backdrop-blur-xl rounded-3xl border border-indigo-400/25 shadow-[0_40px_120px_-40px_rgba(99,102,241,0.75)] ring-1 ring-white/5 relative overflow-hidden">
                    {/* Top corporate accent bar */}
                    <div className="h-1 bg-gradient-to-r from-indigo-500 via-sky-400 to-violet-500 w-full" />

                    <div className="p-7 sm:p-10 lg:p-12">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
                            {/* Left: Pricing & CTAs */}
                            <div className="md:col-span-5 flex flex-col justify-between">
                                <div>
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md mb-4 bg-sky-400/10 border border-sky-300/25 text-sky-200 text-[11px] font-bold uppercase tracking-wider">
                                        <Building2 className="w-3.5 h-3.5" /> Official Delegate Pass
                                    </div>

                                    <div className="flex items-baseline gap-2.5 mb-1">
                                        <span className="text-2xl text-slate-500 line-through font-semibold">₹999</span>
                                        <span className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-amber-200 via-amber-300 to-amber-500 bg-clip-text text-transparent leading-none drop-shadow-[0_0_24px_rgba(251,191,36,0.25)]">₹99</span>
                                    </div>
                                    <p className="text-xs font-semibold text-sky-300 mb-6">
                                        Inclusive of 18% GST (Final Fee ₹99)
                                    </p>

                                    <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 space-y-2 mb-6">
                                        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                                            <span>Next Live Cohort:</span>
                                            <span className="font-bold text-white">{nextSession.dayName}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                                            <span>Cohort Timings:</span>
                                            <span className="font-bold text-white">Wed & Fri 5:30-8:30 PM / Sun 10-1 PM</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                                            <span>Delivery Medium:</span>
                                            <span className="font-bold text-white">Live Online (Tamil & English)</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <button
                                        onClick={openRegisterModal}
                                        className="w-full bg-gradient-to-r from-indigo-500 via-blue-500 to-sky-500 hover:brightness-110 text-white text-base sm:text-lg font-bold py-4 px-6 rounded-xl shadow-[0_12px_40px_-10px_rgba(99,102,241,0.85)] hover:-translate-y-0.5 ring-1 ring-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer mb-3"
                                    >
                                        <span>Enroll for Live Masterclass — ₹99</span>
                                        <ArrowRight className="w-4 h-4 text-white" />
                                    </button>

                                    <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-500">
                                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Razorpay 256-Bit SSL • Official GST Tax Invoice Emailed
                                    </div>
                                </div>
                            </div>

                            {/* Right: Full Value Stack Table */}
                            <div className="md:col-span-7 bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 sm:p-7">
                                <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                                        Delegate Deliverables Included
                                    </span>
                                    <span className="text-xs font-bold text-slate-500 uppercase">Standard Value</span>
                                </div>

                                <ul className="space-y-3.5 mb-6">
                                    {valueStack.map((item, idx) => (
                                        <li key={idx} className="flex items-start justify-between gap-3 text-xs sm:text-sm">
                                            <div className="flex items-start gap-2.5">
                                                <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                                                <span className="text-slate-300 font-medium leading-snug">{item.item}</span>
                                            </div>
                                            <span className="text-xs font-semibold text-slate-500 line-through shrink-0">{item.value}</span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                                    <span className="text-xs sm:text-sm font-bold text-slate-300">Total Program Value:</span>
                                    <span className="text-sm sm:text-base font-bold text-slate-500 line-through">₹16,995</span>
                                </div>
                                <div className="pt-1.5 flex items-center justify-between">
                                    <span className="text-sm font-bold text-white">Subsidized Delegate Fee:</span>
                                    <span className="text-lg font-black text-amber-300">₹99 (Incl. 18% GST)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AIMasterclassPricingSection;
