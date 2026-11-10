import React from "react";
import { Gift, CheckCircle2, FileText, Share2, Users, ArrowRight } from "lucide-react";
import { useAIMasterclassRegisterModal } from "./AIMasterclassRegisterModalContext";

const bonuses = [
    {
        icon: <FileText className="w-6 h-6 text-sky-300" />,
        title: "Resource #1: 500+ Enterprise AI Prompts Library",
        value: "₹2,999 Value",
        desc: "Structured, copy-paste prompt frameworks for executive communication, sales outreach, proposals, and marketing.",
        tag: "INCLUDED"
    },
    {
        icon: <Share2 className="w-6 h-6 text-sky-300" />,
        title: "Resource #2: 30-Day AI Content & Campaign Matrix",
        value: "₹3,999 Value",
        desc: "A systematic calendar and prompt matrix to generate a full month of corporate social media and brand content.",
        tag: "INCLUDED"
    },
    {
        icon: <Users className="w-6 h-6 text-sky-300" />,
        title: "Resource #3: Executive AI Network & Updates Access",
        value: "₹2,999 Value",
        desc: "Ongoing access to our professional learning network for AI tool updates, implementation support, and live Q&A.",
        tag: "INCLUDED"
    }
];

const AIMasterclassBonusesSection: React.FC = () => {
    const { openRegisterModal } = useAIMasterclassRegisterModal();

    return (
        <section id="bonuses" className="py-20 sm:py-28 px-4 bg-[#080b17] border-t border-white/[0.06] relative overflow-hidden">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
            <div className="max-w-6xl mx-auto relative">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-400/10 border border-amber-300/25 rounded-full text-[11px] font-bold text-amber-200 tracking-widest uppercase mb-4">
                        <Gift className="w-3.5 h-3.5 text-amber-300" />
                        <span>Executive Resource Suite</span>
                    </div>
                    <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
                        Complimentary <span className="bg-gradient-to-r from-amber-200 via-amber-300 to-orange-300 bg-clip-text text-transparent">₹9,997 Resource Toolkit</span> Included
                    </h2>
                    <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Every registered delegate receives our complete implementation toolkit at no additional charge upon enrollment.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12">
                    {bonuses.map((b, i) => (
                        <div
                            key={i}
                            className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-7 flex flex-col justify-between hover:bg-white/[0.05] hover:border-indigo-400/40 hover:-translate-y-1 hover:shadow-[0_24px_60px_-30px_rgba(99,102,241,0.7)] transition-all duration-300 group"
                        >
                            <div>
                                <div className="flex items-center justify-between mb-5">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/25 to-sky-500/10 border border-indigo-400/30 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                        {b.icon}
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-semibold text-slate-500 line-through block">{b.value}</span>
                                        <span className="inline-block px-2.5 py-0.5 rounded-md bg-emerald-400/10 border border-emerald-300/25 text-emerald-300 text-[10px] font-bold tracking-wider uppercase mt-0.5">
                                            {b.tag}
                                        </span>
                                    </div>
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold text-white mb-2.5 group-hover:text-sky-200 transition-colors">
                                    {b.title}
                                </h3>
                                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6">
                                    {b.desc}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 pt-4 border-t border-white/[0.08]">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span>Included With Delegate Pass</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Total Value Banner */}
                <div className="bg-gradient-to-br from-indigo-600/30 via-[#0c1024] to-violet-600/25 rounded-3xl p-8 sm:p-12 border border-indigo-400/25 text-center relative overflow-hidden shadow-[0_30px_80px_-30px_rgba(99,102,241,0.7)]">
                    <div className="max-w-3xl mx-auto relative">
                        <span className="inline-block px-3.5 py-1 rounded-full bg-white/[0.06] text-[11px] font-bold text-indigo-100 tracking-widest uppercase mb-3 border border-white/15">
                            COMPLETE DELEGATE PACKAGE
                        </span>
                        <h3 className="text-2xl sm:text-4xl font-black text-white mb-3 tracking-tight">
                            Live 3-Hour Workshop + ₹9,997 Toolkit = <span className="bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">₹99</span>
                        </h3>
                        <p className="text-sm text-slate-300 mb-6">
                            Select Wednesday & Friday Evening (5:30 PM – 8:30 PM) or Sunday Morning (10:00 AM – 1:00 PM). Official GST tax invoice provided upon registration.
                        </p>
                        <button
                            onClick={openRegisterModal}
                            className="bg-gradient-to-r from-indigo-500 via-blue-500 to-sky-500 hover:brightness-110 text-white font-bold text-base px-8 py-4 rounded-xl shadow-[0_12px_40px_-10px_rgba(99,102,241,0.8)] hover:-translate-y-0.5 ring-1 ring-white/20 transition-all cursor-pointer inline-flex items-center gap-2"
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
