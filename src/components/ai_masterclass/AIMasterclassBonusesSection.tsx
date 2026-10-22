import React from "react";
import { Gift, CheckCircle2, FileText, Share2, Users, ArrowRight } from "lucide-react";
import { useAIMasterclassRegisterModal } from "./AIMasterclassRegisterModalContext";

const bonuses = [
    {
        icon: <FileText className="w-7 h-7 text-blue-600" />,
        title: "Bonus #1: 500+ Master ChatGPT Prompts Vault",
        value: "₹2,999 Value",
        desc: "Ready-to-use copy-paste prompts for lead generation, content creation, sales emails, and customer proposals.",
        tag: "FREE TODAY"
    },
    {
        icon: <Share2 className="w-7 h-7 text-purple-600" />,
        title: "Bonus #2: 30-Day AI Social Content Calendar",
        value: "₹3,999 Value",
        desc: "Never run out of content ideas. Generate a full month of engaging social media posts in under 30 minutes.",
        tag: "FREE TODAY"
    },
    {
        icon: <Users className="w-7 h-7 text-emerald-600" />,
        title: "Bonus #3: Private VIP WhatsApp Mastermind Community",
        value: "₹2,999 Value",
        desc: "Get lifetime access to our exclusive community for networking, live updates, tool recommendations, and direct Q&A.",
        tag: "FREE TODAY"
    }
];

const AIMasterclassBonusesSection: React.FC = () => {
    const { openRegisterModal } = useAIMasterclassRegisterModal();

    return (
        <section id="bonuses" className="py-20 sm:py-24 px-4 bg-slate-50/70 border-t border-slate-200/90 relative">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-xs font-black text-amber-800 tracking-wider uppercase mb-4">
                        <Gift className="w-3.5 h-3.5 text-amber-600" />
                        <span>EXCLUSIVE REGISTRATION BONUSES</span>
                    </div>
                    <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
                        Register Today & Get <span className="text-blue-600">₹9,997 Worth Bonuses</span> Absolutely FREE
                    </h2>
                    <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        These premium resources are included at no extra cost when you secure your seat for just ₹99 today.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12">
                    {bonuses.map((b, i) => (
                        <div 
                            key={i} 
                            className="bg-white border border-slate-200 rounded-3xl p-7 flex flex-col justify-between hover:border-blue-400 hover:shadow-xl transition-all duration-300 shadow-md group"
                        >
                            <div>
                                <div className="flex items-center justify-between mb-5">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        {b.icon}
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-bold text-slate-400 line-through block">{b.value}</span>
                                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-black tracking-wider uppercase">
                                            {b.tag}
                                        </span>
                                    </div>
                                </div>
                                <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-2.5 group-hover:text-blue-600 transition-colors">
                                    {b.title}
                                </h3>
                                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium mb-6">
                                    {b.desc}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 pt-4 border-t border-slate-100">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>Included Free With Your ₹99 Ticket</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Total Value Banner */}
                <div className="bg-white rounded-3xl p-8 sm:p-10 border-2 border-slate-900 text-center relative overflow-hidden shadow-2xl">
                    <div className="max-w-3xl mx-auto">
                        <span className="inline-block px-3.5 py-1 rounded-full bg-blue-50 text-[11px] font-black text-blue-700 tracking-wider uppercase mb-3 border border-blue-200">
                            SPECIAL VALUE STACK
                        </span>
                        <h3 className="text-2xl sm:text-4xl font-black text-slate-900 mb-3">
                            Masterclass Pass + ₹9,997 Bonuses = <span className="text-emerald-600">Just ₹99</span>
                        </h3>
                        <p className="text-sm text-slate-600 mb-6">
                            Pick Wednesday Evening (6 PM – 9 PM) or Sunday Morning (10 AM – 1 PM). Instant access to bonuses upon enrollment.
                        </p>
                        <button
                            onClick={openRegisterModal}
                            className="bg-brandGreen hover:bg-[#a3c77e] text-slate-900 font-black text-base px-8 py-4 rounded-xl border border-[#95c06b] shadow-lg hover:scale-105 transition-all cursor-pointer inline-flex items-center gap-2"
                        >
                            <span>CLAIM ALL BONUSES & JOIN FOR ₹99</span>
                            <ArrowRight className="w-4 h-4 text-slate-900" />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AIMasterclassBonusesSection;
