import React from "react";
import { Briefcase, Rocket, Building2, GraduationCap } from "lucide-react";

const personas = [
    {
        icon: <Briefcase className="w-7 h-7" />,
        title: "Business Owners",
        pain: "Spending too much on agencies for basic marketing tasks",
        outcome: "Build your own AI-powered lead generation system that runs 24/7",
        tag: "REVENUE GROWTH"
    },
    {
        icon: <Rocket className="w-7 h-7" />,
        title: "Entrepreneurs",
        pain: "Struggling to stand out in a crowded market without a big budget",
        outcome: "Create a premium AI-built brand presence that outperforms competitors",
        tag: "MARKET EDGE"
    },
    {
        icon: <Building2 className="w-7 h-7" />,
        title: "Corporate Leaders",
        pain: "Teams are slow to adopt AI, losing competitive advantage",
        outcome: "Master the exact AI frameworks to 10x your team's productivity",
        tag: "TEAM LEVERAGE"
    },
    {
        icon: <GraduationCap className="w-7 h-7" />,
        title: "Trainers & Coaches",
        pain: "Content creation takes weeks and eats into client delivery time",
        outcome: "Produce pro-grade AI videos, websites, and content in hours not weeks",
        tag: "CONTENT SCALE"
    }
];

const UpscaleAudience: React.FC = () => {
    return (
        <section id="audience" className="py-24 px-6 bg-white border-t border-slate-100">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                        🎯 IS THIS FOR YOU?
                    </div>
                    <h2 className="text-4xl lg:text-6xl font-black text-slate-900 leading-tight mb-6 tracking-tighter">
                        Built For Leaders <br />
                        <span className="bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent italic">Who Execute.</span>
                    </h2>
                    <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">
                        This isn't a beginner class. It's a boardroom-level execution session for professionals who want results, not theory.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {personas.map((p, i) => (
                        <div key={i} className="group relative p-8 rounded-[32px] border border-slate-100 bg-white hover:border-blue-200 hover:shadow-[0_32px_80px_rgba(59,130,246,0.08)] transition-all duration-500 overflow-hidden">
                            <div className="absolute -top-8 -right-8 w-24 h-24 bg-blue-50/50 rounded-full blur-[30px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            
                            <div className="flex items-start gap-6">
                                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 group-hover:bg-gradient-to-br group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:text-white group-hover:shadow-xl group-hover:shadow-blue-500/20 transition-all duration-500">
                                    {React.cloneElement(p.icon as React.ReactElement, { className: "w-7 h-7" })}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-700 transition-colors">{p.title}</h3>
                                        <span className="text-[8px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-widest">{p.tag}</span>
                                    </div>
                                    <div className="mb-4">
                                        <div className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">THE PROBLEM</div>
                                        <p className="text-sm text-slate-500 font-medium leading-relaxed">{p.pain}</p>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">AFTER THIS WORKSHOP</div>
                                        <p className="text-sm text-slate-700 font-bold leading-relaxed">{p.outcome}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default UpscaleAudience;
