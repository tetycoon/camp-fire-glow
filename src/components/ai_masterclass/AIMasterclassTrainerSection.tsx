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
        <section id="trainer" className="py-20 sm:py-24 px-4 bg-white border-t border-slate-200/90 relative overflow-hidden">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-slate-100 rounded-md text-[11px] font-bold uppercase tracking-widest text-slate-700 border border-slate-200 mb-4">
                        <Award className="w-3.5 h-3.5 text-blue-600" />
                        <span>Program Lead & Faculty</span>
                    </div>
                    <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
                        Led By An <span className="text-blue-600">Industry AI Practitioner</span>
                    </h2>
                    <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        Learn the exact production-tested AI workflows used daily to advise corporate leadership teams and scale digital operations.
                    </p>
                </div>

                <div className="bg-slate-50/70 rounded-2xl p-7 sm:p-10 lg:p-12 border border-slate-200/90 shadow-lg">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
                        {/* Left Side: Trainer Photo & Badges */}
                        <div className="lg:col-span-5 flex flex-col items-center">
                            <div className="relative">
                                {/* Corporate accent glow ring */}
                                <div className="absolute -inset-2 bg-gradient-to-tr from-slate-900 via-blue-600 to-indigo-500 rounded-2xl opacity-20 blur-lg" />

                                <img
                                    src={trainerImg}
                                    alt="Antony Praveen - AI Lead Trainer"
                                    className="relative z-10 w-64 h-64 sm:w-80 sm:h-80 rounded-2xl object-cover shadow-xl border-2 border-white"
                                />

                                {/* Verified Trainer Pill */}
                                <div className="absolute top-4 left-4 z-20 bg-slate-900/95 backdrop-blur-md border border-slate-700 text-white rounded-md px-3 py-1 flex items-center gap-1.5 shadow-md">
                                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-white">Lead Faculty</span>
                                </div>

                                {/* Floating Rating Badge */}
                                <div className="absolute -bottom-5 -right-3 sm:-right-5 z-20 bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-center shadow-lg">
                                    <div className="flex items-center justify-center gap-0.5 text-amber-500 mb-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                        ))}
                                    </div>
                                    <div className="text-lg font-black text-slate-900 leading-none">4.9 / 5.0</div>
                                    <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mt-1">4,850+ Delegates</div>
                                </div>
                            </div>

                            {/* Social Connect */}
                            <div className="flex items-center gap-3 mt-8">
                                <a
                                    href="https://www.linkedin.com/in/antony-praveen-techtycoon"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-2.5 rounded-lg bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-colors border border-slate-200 shadow-2xs"
                                    title="LinkedIn Profile"
                                >
                                    <Linkedin className="w-4 h-4" />
                                </a>
                                <a
                                    href="https://www.instagram.com/amiable_antony"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-2.5 rounded-lg bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-colors border border-slate-200 shadow-2xs"
                                    title="Instagram Profile"
                                >
                                    <Instagram className="w-4 h-4" />
                                </a>
                                <a
                                    href="https://www.techtycoon.in/"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-2.5 rounded-lg bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-colors border border-slate-200 shadow-2xs"
                                    title="Tech Tycoon Website"
                                >
                                    <Globe className="w-4 h-4" />
                                </a>
                            </div>
                        </div>

                        {/* Right Side: Bio, Credentials & Quote */}
                        <div className="lg:col-span-7 flex flex-col justify-between">
                            <div>
                                <div className="inline-block px-3 py-1 bg-blue-50 border border-blue-200 rounded-md text-blue-700 text-[11px] font-bold tracking-wider uppercase mb-2">
                                    Managing Director & Chief AI Strategist
                                </div>
                                <h3 className="text-2xl sm:text-4xl font-black text-slate-900 mb-1">
                                    Antony Praveen
                                </h3>
                                <p className="text-sm font-bold text-slate-500 mb-5 uppercase tracking-wide">
                                    Founder, TECH TYCOON DIGITAL SOLUTION LLP
                                </p>

                                {/* Executive Quote Card */}
                                <div className="bg-white border-l-4 border-blue-600 p-4 sm:p-5 rounded-r-xl mb-6 italic text-sm sm:text-base text-slate-700 leading-relaxed border border-slate-200/80 shadow-2xs">
                                    "Artificial Intelligence will not replace business leaders—but leaders who systematically deploy AI will outperform those who rely on manual workflows. Our objective is to equip you with practical, code-free AI systems you can implement immediately."
                                </div>

                                {/* Key Highlights */}
                                <div className="space-y-2.5 mb-8">
                                    {credentials.map((item, idx) => (
                                        <div key={idx} className="flex items-start gap-2.5">
                                            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                                            <span className="text-xs sm:text-sm font-semibold text-slate-700 leading-tight">
                                                {item}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 4 Quick Stat Counters */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-200">
                                {stats.map((s, i) => (
                                    <div key={i} className="bg-white rounded-xl p-3.5 text-center border border-slate-200/90 shadow-2xs">
                                        <div className="text-lg sm:text-xl font-black text-slate-900">{s.value}</div>
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
