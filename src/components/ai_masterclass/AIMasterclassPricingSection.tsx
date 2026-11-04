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
        <section id="pricing" className="py-20 sm:py-24 px-4 bg-slate-50/70 border-t border-slate-200/90 relative">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-slate-200 rounded-md text-[11px] font-bold text-blue-700 tracking-widest uppercase shadow-2xs mb-4">
                        <Zap className="w-3.5 h-3.5 text-blue-600" />
                        <span>Program Fee & Value Summary</span>
                    </div>
                    <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
                        Executive AI Training <br className="hidden sm:block" />
                        For Just <span className="text-blue-600">₹99</span>
                    </h2>
                    <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        One subsidized registration fee grants full live cohort participation, the executive resource toolkit, and an official GST invoice.
                    </p>
                </div>

                <div className="mx-auto max-w-4xl bg-white rounded-2xl border border-slate-200/90 shadow-xl relative overflow-hidden">
                    {/* Top corporate accent bar */}
                    <div className="h-1.5 bg-gradient-to-r from-slate-900 via-blue-600 to-indigo-600 w-full" />

                    <div className="p-7 sm:p-10 lg:p-12">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
                            {/* Left: Pricing & CTAs */}
                            <div className="md:col-span-5 flex flex-col justify-between">
                                <div>
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md mb-4 bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-bold uppercase tracking-wider">
                                        <Building2 className="w-3.5 h-3.5" /> Official Delegate Pass
                                    </div>

                                    <div className="flex items-baseline gap-2.5 mb-1">
                                        <span className="text-2xl text-slate-400 line-through font-semibold">₹999</span>
                                        <span className="text-5xl sm:text-6xl font-black text-slate-900 leading-none">₹99</span>
                                    </div>
                                    <p className="text-xs font-semibold text-blue-700 mb-6">
                                        Inclusive of 18% GST (Final Fee ₹99)
                                    </p>

                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 mb-6">
                                        <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                                            <span>Next Live Cohort:</span>
                                            <span className="font-bold text-slate-900">{nextSession.dayName}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                                            <span>Cohort Timings:</span>
                                            <span className="font-bold text-slate-900">Wed & Fri 5:30-8:30 PM / Sun 10-1 PM</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                                            <span>Delivery Medium:</span>
                                            <span className="font-bold text-slate-900">Live Online (Tamil & English)</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <button
                                        onClick={openRegisterModal}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-base sm:text-lg font-bold py-4 px-6 rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer mb-3"
                                    >
                                        <span>Enroll for Live Masterclass — ₹99</span>
                                        <ArrowRight className="w-4 h-4 text-white" />
                                    </button>

                                    <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-500">
                                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Razorpay 256-Bit SSL • Official GST Tax Invoice Emailed
                                    </div>
                                </div>
                            </div>

                            {/* Right: Full Value Stack Table */}
                            <div className="md:col-span-7 bg-slate-50/80 border border-slate-200 rounded-xl p-6 sm:p-7">
                                <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                        Delegate Deliverables Included
                                    </span>
                                    <span className="text-xs font-bold text-slate-400 uppercase">Standard Value</span>
                                </div>

                                <ul className="space-y-3.5 mb-6">
                                    {valueStack.map((item, idx) => (
                                        <li key={idx} className="flex items-start justify-between gap-3 text-xs sm:text-sm">
                                            <div className="flex items-start gap-2.5">
                                                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                                                <span className="text-slate-700 font-medium leading-snug">{item.item}</span>
                                            </div>
                                            <span className="text-xs font-semibold text-slate-400 line-through shrink-0">{item.value}</span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                                    <span className="text-xs sm:text-sm font-bold text-slate-700">Total Program Value:</span>
                                    <span className="text-sm sm:text-base font-bold text-slate-400 line-through">₹16,995</span>
                                </div>
                                <div className="pt-1.5 flex items-center justify-between">
                                    <span className="text-sm font-bold text-slate-900">Subsidized Delegate Fee:</span>
                                    <span className="text-lg font-black text-blue-600">₹99 (Incl. 18% GST)</span>
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
