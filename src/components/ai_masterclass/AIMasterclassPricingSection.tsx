import React from "react";
import { CheckCircle2, Zap, Clock, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import { useAIMasterclassRegisterModal } from "./AIMasterclassRegisterModalContext";
import { getMasterclassDateStrings } from "../../lib/masterclassDateUtils";

const valueStack = [
    { item: "3-Hour Live Interactive Masterclass (Wed, Fri or Sun)", value: "₹4,999" },
    { item: "Bonus #1: 500+ Master ChatGPT Prompts Vault", value: "₹2,999" },
    { item: "Bonus #2: 30-Day AI Social Content Calendar", value: "₹3,999" },
    { item: "Bonus #3: Lifetime VIP WhatsApp Mastermind Group", value: "₹2,999" },
    { item: "Direct Q&A with Antony Praveen during the live call", value: "₹1,999" },
];

const AIMasterclassPricingSection: React.FC = () => {
    const { openRegisterModal } = useAIMasterclassRegisterModal();
    const { nextSession } = getMasterclassDateStrings();

    return (
        <section id="pricing" className="py-20 sm:py-24 px-4 bg-white border-t border-slate-200/90 relative">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-xs font-black text-blue-700 tracking-wider uppercase mb-4">
                        <Zap className="w-3.5 h-3.5 text-blue-600" />
                        <span>Investment & Value Breakdown</span>
                    </div>
                    <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
                        Everything You Need To Master AI <br className="hidden sm:block" />
                        For Just <span className="text-blue-600">₹99</span>
                    </h2>
                    <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        One simple ticket gives you live workshop access, all 3 exclusive bonuses, and lifetime community access.
                    </p>
                </div>

                <div className="mx-auto max-w-4xl bg-white rounded-3xl border-2 border-slate-900 shadow-2xl relative overflow-hidden">
                    {/* Top brand accent bar */}
                    <div className="h-2.5 bg-gradient-to-r from-brandGreen via-[#a3c77e] to-emerald-500 w-full" />

                    <div className="p-7 sm:p-10 lg:p-12">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
                            {/* Left: Pricing & CTAs */}
                            <div className="md:col-span-5 flex flex-col justify-between">
                                <div>
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-extrabold uppercase tracking-wide">
                                        <Sparkles className="w-3.5 h-3.5" /> 90% Early Bird Discount
                                    </div>

                                    <div className="flex items-baseline gap-2.5 mb-1">
                                        <span className="text-2xl text-slate-400 line-through font-bold">₹999</span>
                                        <span className="text-5xl sm:text-6xl font-black text-slate-900 leading-none">₹99</span>
                                    </div>
                                    <p className="text-xs font-bold text-emerald-700 mb-6">
                                        Inclusive of 18% GST (Final Price ₹99)
                                    </p>

                                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 mb-6">
                                        <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
                                            <span>Next Live Session:</span>
                                            <span className="font-bold text-slate-900">{nextSession.dayName}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
                                            <span>Batch Times:</span>
                                            <span className="font-bold text-slate-900">Wed & Fri 5:30-8:30 PM / Sun 10-1 PM</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
                                            <span>Language:</span>
                                            <span className="font-bold text-slate-900">Tamil & English</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <button
                                        onClick={openRegisterModal}
                                        className="w-full bg-brandGreen hover:bg-[#a3c77e] text-slate-900 text-base sm:text-lg font-black py-4 px-6 rounded-xl shadow-lg shadow-brandGreen/25 hover:scale-[1.02] active:scale-[0.98] transition-all border border-[#95c06b] flex items-center justify-center gap-2 cursor-pointer mb-3"
                                    >
                                        <span>RESERVE YOUR SEAT — ₹99</span>
                                        <ArrowRight className="w-4 h-4 text-slate-900" />
                                    </button>

                                    <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-500">
                                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Razorpay 256-Bit SSL • GST Invoice Included
                                    </div>
                                </div>
                            </div>

                            {/* Right: Full Value Stack Table */}
                            <div className="md:col-span-7 bg-slate-50/80 border border-slate-200 rounded-2xl p-6 sm:p-7">
                                <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                                    <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                                        What's Included In Your Ticket
                                    </span>
                                    <span className="text-xs font-bold text-slate-400 uppercase">Value</span>
                                </div>

                                <ul className="space-y-3.5 mb-6">
                                    {valueStack.map((item, idx) => (
                                        <li key={idx} className="flex items-start justify-between gap-3 text-xs sm:text-sm">
                                            <div className="flex items-start gap-2.5">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                                <span className="text-slate-700 font-medium leading-snug">{item.item}</span>
                                            </div>
                                            <span className="text-xs font-bold text-slate-400 line-through shrink-0">{item.value}</span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                                    <span className="text-xs sm:text-sm font-black text-slate-900">Total Real Value:</span>
                                    <span className="text-sm sm:text-base font-black text-slate-400 line-through">₹16,995</span>
                                </div>
                                <div className="pt-1 flex items-center justify-between">
                                    <span className="text-sm font-black text-emerald-700">Your Price Today:</span>
                                    <span className="text-lg font-black text-emerald-700">₹99 (Incl. 18% GST)</span>
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
