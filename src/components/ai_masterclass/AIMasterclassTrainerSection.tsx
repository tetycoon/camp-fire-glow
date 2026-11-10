import React from "react";
import trainerImg from "@/assets/trainer-photo.png";
import { CheckCircle2, Globe, Linkedin, Instagram, Award, Users, Briefcase, Star, ShieldCheck } from "lucide-react";

const stats = [
    { value: "4,850+", label: "Professionals Trained", icon: Users },
    { value: "50+", label: "Corporate Workshops", icon: Briefcase },
    { value: "10+", label: "AI Tools Covered", icon: Award },
    { value: "4.9/5", label: "Average Delegate Rating", icon: Star },
];

const credentials = [
    "Founder & Managing Director, TECH TYCOON DIGITAL SOLUTION LLP",
    "International Certified Corporate AI Trainer & Strategy Consultant",
    "Specialist in Prompt Engineering, AI Marketing & Workflow Automation",
    "Keynote Speaker & AI Educator for Corporates, Institutions & Enterprises",
    "Mentored 4,850+ Business Owners, Executives & Working Professionals"
];

const AIMasterclassTrainerSection: React.FC = () => {
    return (
        <section id="trainer" className="py-20 sm:py-28 px-4 bg-[#080b17] border-t border-white/[0.06] relative overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
            <div className="max-w-6xl mx-auto relative">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-500/10 rounded-full text-[11px] font-bold uppercase tracking-widest text-indigo-200 border border-indigo-400/20 mb-4">
                        <Award className="w-3.5 h-3.5 text-sky-400" />
                        <span>Program Lead & Faculty</span>
                    </div>
                    <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
                        Led By An <span className="bg-gradient-to-r from-sky-300 via-indigo-300 to-violet-300 bg-clip-text text-transparent">Industry AI Practitioner</span>
                    </h2>
                    <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Learn the exact production-tested AI workflows used daily to advise corporate leadership teams and scale digital operations.
                    </p>
                </div>

                <div className="bg-white/[0.03] backdrop-blur-sm rounded-3xl p-7 sm:p-10 lg:p-12 border border-white/10 shadow-[0_40px_100px_-50px_rgba(99,102,241,0.6)]">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
                        {/* Left Side: Trainer Photo & Badges */}
                        <div className="lg:col-span-5 flex flex-col items-center">
                            <div className="relative">
                                {/* Corporate accent glow ring */}
                                <div className="absolute -inset-3 bg-gradient-to-tr from-sky-500 via-indigo-500 to-violet-500 rounded-3xl opacity-40 blur-2xl" />

                                <img
                                    src={trainerImg}
                                    alt="Antony Praveen - AI Lead Trainer"
                                    className="relative z-10 w-64 h-64 sm:w-80 sm:h-80 rounded-2xl object-cover shadow-2xl border border-white/20"
                                />

                                {/* Verified Trainer Pill */}
                                <div className="absolute top-4 left-4 z-20 bg-[#05070f]/80 backdrop-blur-md border border-white/15 text-white rounded-md px-3 py-1 flex items-center gap-1.5 shadow-md">
                                    <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-white">Lead Faculty</span>
                                </div>

                                {/* Floating Rating Badge */}
                                <div className="absolute -bottom-5 -right-3 sm:-right-5 z-20 bg-[#0a0e1c]/90 backdrop-blur-xl border border-amber-300/25 text-white rounded-xl px-4 py-3 text-center shadow-[0_12px_40px_-12px_rgba(251,191,36,0.45)]">
                                    <div className="flex items-center justify-center gap-0.5 text-amber-500 mb-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                        ))}
                                    </div>
                                    <div className="text-lg font-black text-amber-200 leading-none">4.9 / 5.0</div>
                                    <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-1">4,850+ Delegates</div>
                                </div>
                            </div>

                            {/* Social Connect */}
                            <div className="flex items-center gap-3 mt-8">
                                <a
                                    href="https://www.linkedin.com/in/antony-praveen-techtycoon"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-2.5 rounded-lg bg-white/[0.04] hover:bg-indigo-500/20 text-slate-400 hover:text-white transition-colors border border-white/10 hover:border-indigo-400/40"
                                    title="LinkedIn Profile"
                                >
                                    <Linkedin className="w-4 h-4" />
                                </a>
                                <a
                                    href="https://www.instagram.com/amiable_antony"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-2.5 rounded-lg bg-white/[0.04] hover:bg-indigo-500/20 text-slate-400 hover:text-white transition-colors border border-white/10 hover:border-indigo-400/40"
                                    title="Instagram Profile"
                                >
                                    <Instagram className="w-4 h-4" />
                                </a>
                                <a
                                    href="https://www.techtycoon.in/"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-2.5 rounded-lg bg-white/[0.04] hover:bg-indigo-500/20 text-slate-400 hover:text-white transition-colors border border-white/10 hover:border-indigo-400/40"
                                    title="Tech Tycoon Website"
                                >
                                    <Globe className="w-4 h-4" />
                                </a>
                            </div>
                        </div>

                        {/* Right Side: Bio, Credentials & Quote */}
                        <div className="lg:col-span-7 flex flex-col justify-between">
                            <div>
                                <div className="inline-block px-3 py-1 bg-sky-400/10 border border-sky-300/25 rounded-md text-sky-200 text-[11px] font-bold tracking-wider uppercase mb-2">
                                    Managing Director & Chief AI Strategist
                                </div>
                                <h3 className="text-2xl sm:text-4xl font-black text-white mb-1">
                                    Antony Praveen
                                </h3>
                                <p className="text-sm font-bold text-slate-400 mb-5 uppercase tracking-wide">
                                    Founder, TECH TYCOON DIGITAL SOLUTION LLP
                                </p>

                                {/* Executive Quote Card */}
                                <div className="bg-gradient-to-r from-indigo-500/10 to-transparent border-l-4 border-indigo-400 p-4 sm:p-5 rounded-r-xl mb-6 italic text-sm sm:text-base text-slate-200 leading-relaxed">
                                    "Artificial Intelligence will not replace business leaders—but leaders who systematically deploy AI will outperform those who rely on manual workflows. Our objective is to equip you with practical, code-free AI systems you can implement immediately."
                                </div>

                                {/* Key Highlights */}
                                <div className="space-y-2.5 mb-8">
                                    {credentials.map((item, idx) => (
                                        <div key={idx} className="flex items-start gap-2.5">
                                            <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                                            <span className="text-xs sm:text-sm font-semibold text-slate-300 leading-tight">
                                                {item}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 4 Quick Stat Counters */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-white/10">
                                {stats.map((s, i) => (
                                    <div key={i} className="bg-white/[0.04] rounded-xl p-3.5 text-center border border-white/10 hover:border-indigo-400/40 transition-colors">
                                        <div className="text-lg sm:text-xl font-black bg-gradient-to-r from-sky-200 to-indigo-300 bg-clip-text text-transparent">{s.value}</div>
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">{s.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AIMasterclassTrainerSection;
