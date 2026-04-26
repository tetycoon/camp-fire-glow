import React from "react";
import { CheckCircle2, Zap, Clock, ShieldCheck } from "lucide-react";
import { useAIMasterclassRegisterModal } from "./AIMasterclassRegisterModalContext";

const features = [
    "Complete 3-hour AI Basic to intermediate Training",
    "Every sunday Live Session",
    "Basic English And Tamil",
    "10+ AI Tools Mastery",
    "WhatsApp Private Community",
    "Inclusive of GST"
];

import { useAIMasterclassRegisterModal } from "./AIMasterclassRegisterModalContext";
import { getMasterclassDateStrings } from "../../lib/masterclassDateUtils";

const AIMasterclassPricingSection: React.FC = () => {
    const { openRegisterModal } = useAIMasterclassRegisterModal();
    const { shortDate } = getMasterclassDateStrings();

    return (
        <section id="pricing" className="py-24 px-4 bg-gray-50 border-t border-gray-100">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-16">
                    <div className="inline-block px-4 py-2 bg-white rounded-full text-sm font-bold text-slate-600 shadow-sm border border-gray-200 mb-6">
                        💳 Investment
                    </div>
                    <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-4 tracking-tight">
                        Launch <span className="text-blue-600">Pricing</span>
                    </h2>
                </div>

                <div className="mx-auto max-w-4xl bg-white rounded-3xl p-8 sm:p-12 border border-blue-100 shadow-2xl relative overflow-hidden">
                    {/* Top green accent bar */}
                    <div className="absolute top-0 left-0 right-0 h-2 bg-brandGreen"></div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 bg-red-100 border border-red-200 animate-pulse">
                                <span className="text-red-600 text-[11px] font-bold tracking-widest uppercase">Early Bird Offer — 90% OFF!</span>
                            </div>

                            <div className="flex items-baseline gap-4 mb-4">
                                <span className="text-2xl text-slate-400 line-through font-bold">₹999</span>
                                <span className="text-6xl font-black text-slate-900">₹99</span>
                            </div>

                            <div className="flex items-center gap-3 mb-8">
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 border border-green-200 text-green-700 text-xs font-bold">
                                    <Zap className="w-3 h-3" /> SAVE ₹900
                                </span>
                            </div>

                            <div className="space-y-4 mb-10">
                                <div className="flex items-center gap-3 text-slate-600">
                                    <Clock className="w-5 h-5 text-blue-600" />
                                    <span className="text-sm font-bold">Offer ends {shortDate}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600">
                                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                                    <span className="text-sm font-bold">Secured by Razorpay</span>
                                </div>
                            </div>

                            <button
                                onClick={openRegisterModal}
                                className="w-full bg-brandGreen hover:bg-[#a3c77e] text-slate-900 text-lg font-black px-10 py-5 rounded-lg shadow-xl shadow-green-900/10 transition-transform hover:scale-[1.02] border border-[#a3c77e]"
                            >
                                SECURE YOUR SEAT 🚀
                            </button>
                        </div>

                        <div className="bg-gray-50 border border-gray-100 p-8 rounded-2xl h-full">
                            <h3 className="text-lg font-black mb-6 text-slate-900">What's Included:</h3>
                            <ul className="space-y-5">
                                {features.map((f, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-brandGreen flex-shrink-0" />
                                        <span className="text-sm text-slate-700 font-bold">{f}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AIMasterclassPricingSection;
