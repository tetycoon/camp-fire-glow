import React from "react";
import { Gift, CheckCircle2, FileText, Share2, Users, ArrowRight } from "lucide-react";
import { useAIMasterclassRegisterModal } from "./AIMasterclassRegisterModalContext";

const bonuses = [
    {
        icon: <FileText className="w-6 h-6 text-blue-600" />,
        title: "Resource #1: 500+ Enterprise AI Prompts Library",
        value: "₹2,999 Value",
        desc: "Structured, copy-paste prompt frameworks for executive communication, sales outreach, proposals, and marketing.",
        tag: "INCLUDED"
    },
    {
        icon: <Share2 className="w-6 h-6 text-blue-600" />,
        title: "Resource #2: 30-Day AI Content & Campaign Matrix",
        value: "₹3,999 Value",
        desc: "A systematic calendar and prompt matrix to generate a full month of corporate social media and brand content.",
        tag: "INCLUDED"
    },
    {
        icon: <Users className="w-6 h-6 text-blue-600" />,
        title: "Resource #3: Executive AI Network & Updates Access",
        value: "₹2,999 Value",
        desc: "Ongoing access to our professional learning network for AI tool updates, implementation support, and live Q&A.",
        tag: "INCLUDED"
    }
];

const AIMasterclassBonusesSection: React.FC = () => {
    const { openRegisterModal } = useAIMasterclassRegisterModal();

    return (
        <section id="bonuses" className="py-20 sm:py-24 px-4 bg-white border-t border-slate-200/90 relative">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-slate-100 border border-slate-200 rounded-md text-[11px] font-bold text-slate-700 tracking-widest uppercase mb-4">
                        <Gift className="w-3.5 h-3.5 text-blue-600" />
                        <span>Executive Resource Suite</span>
                    </div>
                    <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
                        Complimentary <span className="text-blue-600">₹9,997 Resource Toolkit</span> Included
                    </h2>
                    <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        Every registered delegate receives our complete implementation toolkit at no additional charge upon enrollment.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12">
                    {bonuses.map((b, i) => (
                        <div
                            key={i}
                            className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-7 flex flex-col justify-between hover:bg-white hover:border-blue-300 hover:shadow-lg transition-all duration-300 shadow-2xs group"
                        >
                            <div>
                                <div className="flex items-center justify-between mb-5">
                                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-2xs">
                                        {b.icon}
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-semibold text-slate-400 line-through block">{b.value}</span>
                                        <span className="inline-block px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold tracking-wider uppercase mt-0.5">
                                            {b.tag}
                                        </span>
                                    </div>
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2.5 group-hover:text-blue-600 transition-colors">
                                    {b.title}
                                </h3>
                                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6">
                                    {b.desc}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 pt-4 border-t border-slate-200/80">
                                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                                <span>Included With Delegate Pass</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Total Value Banner */}
                <div className="bg-slate-900 rounded-2xl p-8 sm:p-10 border border-slate-800 text-center relative overflow-hidden shadow-xl">
                    <div className="max-w-3xl mx-auto">
                        <span className="inline-block px-3.5 py-1 rounded-md bg-blue-500/15 text-[11px] font-bold text-blue-300 tracking-widest uppercase mb-3 border border-blue-400/25">
                            COMPLETE DELEGATE PACKAGE
                        </span>
                        <h3 className="text-2xl sm:text-4xl font-black text-white mb-3 tracking-tight">
                            Live 3-Hour Workshop + ₹9,997 Toolkit = <span className="text-blue-400">₹99</span>
                        </h3>
                        <p className="text-sm text-slate-300 mb-6">
                            Select Wednesday & Friday Evening (5:30 PM – 8:30 PM) or Sunday Morning (10:00 AM – 1:00 PM). Official GST tax invoice provided upon registration.
                        </p>
                        <button
                            onClick={openRegisterModal}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-base px-8 py-4 rounded-xl shadow-lg shadow-blue-600/25 transition-all cursor-pointer inline-flex items-center gap-2"
                        >
                            <span>Enroll & Claim Resource Suite — ₹99</span>
                            <ArrowRight className="w-4 h-4 text-white" />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AIMasterclassBonusesSection;
