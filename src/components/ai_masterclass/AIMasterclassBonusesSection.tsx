import React from "react";
import { Gift, CheckCircle2, Sparkles, Zap, FileText, Share2, Users } from "lucide-react";
import { useAIMasterclassRegisterModal } from "./AIMasterclassRegisterModalContext";

const bonuses = [
    {
        icon: <FileText className="w-8 h-8 text-blue-600" />,
        title: "Bonus #1: 500+ Master ChatGPT Prompts Vault",
        value: "₹2,999 Value",
        desc: "Ready-to-use copy-paste prompts for marketing, content creation, sales emails, and lead magnet creation.",
        tag: "FREE TODAY"
    },
    {
        icon: <Zap className="w-8 h-8 text-amber-500" />,
        title: "Bonus #2: AI Lead Generation & Automation Blueprint",
        value: "₹4,999 Value",
        desc: "Step-by-step workflow guide to set up automated lead capture and follow-ups without paying for expensive tools.",
        tag: "FREE TODAY"
    },
    {
        icon: <Share2 className="w-8 h-8 text-purple-600" />,
        title: "Bonus #3: 30-Day AI Social Content Calendar",
        value: "₹3,999 Value",
        desc: "Never run out of content ideas. Generate a full month of engaging social media posts in under 30 minutes.",
        tag: "FREE TODAY"
    },
    {
        icon: <Users className="w-8 h-8 text-green-600" />,
        title: "Bonus #4: Private VIP WhatsApp Mastermind Community",
        value: "₹2,999 Value",
        desc: "Get lifetime access to our exclusive community for networking, live updates, tool recommendations, and Q&A.",
        tag: "FREE TODAY"
    }
];

const AIMasterclassBonusesSection: React.FC = () => {
    const { openRegisterModal } = useAIMasterclassRegisterModal();

    return (
        <section id="bonuses" className="py-24 px-4 bg-slate-900 text-white relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-full text-xs font-black text-amber-400 tracking-wider uppercase mb-6">
                        <Gift className="w-4 h-4 text-amber-400" />
                        EXCLUSIVE REGISTRATION BONUSES
                    </div>
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 tracking-tight">
                        Register Today & Get <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-400">₹14,996 Worth Bonuses</span> Absolutely FREE
                    </h2>
                    <p className="text-lg text-slate-300 max-w-2xl mx-auto font-medium">
                        These premium resources are included at no extra cost when you secure your seat for just ₹99 today.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    {bonuses.map((b, i) => (
                        <div 
                            key={i} 
                            className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/60 p-8 rounded-3xl relative flex flex-col justify-between hover:border-amber-500/40 transition-all duration-300 group shadow-xl"
                        >
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        {b.icon}
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-bold text-slate-400 line-through block">{b.value}</span>
                                        <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-black tracking-wider uppercase">
                                            {b.tag}
                                        </span>
                                    </div>
                                </div>
                                <h3 className="text-xl font-black text-white mb-3 group-hover:text-amber-400 transition-colors">
                                    {b.title}
                                </h3>
                                <p className="text-slate-300 text-sm leading-relaxed font-medium mb-6">
                                    {b.desc}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 pt-4 border-t border-slate-700/50">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                Included Free With Your ₹99 Ticket
                            </div>
                        </div>
                    ))}
                </div>

                {/* Total Value Banner */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 sm:p-12 border border-blue-400/30 text-center relative overflow-hidden shadow-2xl">
                    <div className="max-w-3xl mx-auto">
                        <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-xs font-black text-white tracking-widest uppercase mb-4">
                            LIMITED TIME SPECIAL OFFER
                        </span>
                        <h3 className="text-3xl sm:text-4xl font-black text-white mb-4">
                            Masterclass Pass + ₹14,996 Bonuses = <span className="text-amber-300">Just ₹99</span>
                        </h3>
                        <p className="text-blue-100 text-base mb-8 max-w-xl mx-auto font-medium">
                            Join 4,800+ professionals who transformed their digital workflow. Price increases to ₹999 soon.
                        </p>
                        <button
                            onClick={openRegisterModal}
                            className="bg-brandGreen hover:bg-[#95c06b] text-slate-900 text-xl font-black px-12 py-5 rounded-2xl transition-all hover:scale-105 shadow-2xl border border-[#a3c77e] inline-flex items-center gap-3"
                        >
                            CLAIM ALL BONUSES & SEAT — ₹99
                            <Sparkles className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AIMasterclassBonusesSection;
