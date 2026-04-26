import React from "react";
import { Laptop, BookOpen, Coffee, Zap, ShieldCheck } from "lucide-react";

const perks = [
    {
        icon: <Laptop className="w-6 h-6" />,
        title: "Hands-on Implementation",
        desc: "Bring your laptop. We build your AI frameworks locally, together in real-time."
    },
    {
        icon: <BookOpen className="w-6 h-6" />,
        title: "Physical Workbook",
        desc: "A dedicated printed manual for all prompt architectures and systems covered."
    },
    {
        icon: <Coffee className="w-6 h-6" />,
        title: "Executive Dining",
        desc: "Full networking lunch plus morning and evening tea included in your enrollment."
    },
    {
        icon: <Zap className="w-6 h-6" />,
        title: "Real-world Frameworks",
        desc: "Build and deploy actual AI systems that you can start using immediately after."
    }
];

const UpscaleWhy: React.FC = () => {
    return (
        <section id="about" className="py-24 px-6 bg-slate-50 relative overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                    <div className="lg:col-span-5">
                        <div className="inline-block px-4 py-2 bg-blue-100/50 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                            💼 WHY OFFLINE?
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-black text-slate-900 leading-tight mb-8">
                            Proximity Breeds <br />
                            <span className="bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent italic">Performance.</span>
                        </h2>
                        <p className="text-lg text-slate-600 font-semibold mb-12 leading-relaxed">
                            While online training is convenient, high-stakes implementation happens best in a room full of like-minded experts. No distractions. <span className="text-slate-950 underline decoration-blue-500/30 underline-offset-4">Just pure execution.</span>
                        </p>
                        
                        <div className="space-y-6">
                            <div className="flex gap-4 p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="text-lg font-black text-slate-900 mb-1">Expert Presence</div>
                                    <p className="text-sm text-slate-500 font-medium italic">"Get instant feedback as you build your AI agent in the room."</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {perks.map((perk, i) => (
                            <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-100 transition-all hover:border-blue-200 hover:shadow-[0_32px_80px_rgba(59,130,246,0.08)] group relative overflow-hidden">
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-50/50 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mb-6 group-hover:bg-gradient-to-br group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:text-white group-hover:shadow-xl group-hover:shadow-blue-500/20 transition-all duration-500">
                                    {React.cloneElement(perk.icon as React.ReactElement, { className: "w-6 h-6" })}
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mb-3 tracking-tight group-hover:text-blue-700 transition-colors">{perk.title}</h3>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">{perk.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default UpscaleWhy;
