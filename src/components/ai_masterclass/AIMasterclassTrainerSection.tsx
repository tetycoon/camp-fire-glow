import React from "react";
import trainerImg from "@/assets/trainer-photo.png";
import { CheckCircle2, Globe, Linkedin, Instagram, Award, Users, Briefcase, Star, ShieldCheck } from "lucide-react";
import { useAIMasterclassRegisterModal } from "./AIMasterclassRegisterModalContext";

const stats = [
    { value: "4,850+", label: "Professionals Trained", icon: Users },
    { value: "50+", label: "Corporate Workshops", icon: Briefcase },
    { value: "10+", label: "AI Tools Covered", icon: Award },
    { value: "4.9/5", label: "Average Student Rating", icon: Star },
];

const credentials = [
    "Founder & Managing Director, TECH TYCOON DIGITAL SOLUTION LLP",
    "International Certified Corporate AI Trainer & Consultant",
    "Specialist in Prompt Engineering, AI Marketing & Growth Automation",
    "Keynote Speaker & AI Educator for Corporates, Colleges & Startups",
    "Mentored 4,850+ Trainers, Entrepreneurs & Working Professionals"
];

const AIMasterclassTrainerSection: React.FC = () => {
    const { openRegisterModal } = useAIMasterclassRegisterModal();

    return (
        <section id="trainer" className="py-20 sm:py-24 px-4 bg-slate-50/80 border-t border-slate-200/90 relative overflow-hidden">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white rounded-full text-xs font-bold text-slate-700 shadow-xs border border-slate-200 mb-4">
                        <Award className="w-3.5 h-3.5 text-blue-600" />
                        <span>Meet Your Lead Trainer</span>
                    </div>
                    <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
                        Learn Directly From An <span className="text-blue-600">Industry Practitioner</span>
                    </h2>
                    <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        No theoretical academics. Learn the exact battle-tested AI workflows Antony uses daily to run Tech Tycoon and train corporate leaders.
                    </p>
                </div>

                <div className="bg-white rounded-3xl p-7 sm:p-10 lg:p-12 border border-slate-200/90 shadow-xl">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
                        {/* Left Side: Trainer Photo & Badges */}
                        <div className="lg:col-span-5 flex flex-col items-center">
                            <div className="relative">
                                {/* Brand accent glow ring */}
                                <div className="absolute -inset-2 bg-gradient-to-tr from-brandGreen via-[#a3c77e] to-blue-500 rounded-3xl opacity-30 blur-lg" />
                                
                                <img
                                    src={trainerImg}
                                    alt="Antony Praveen - AI Lead Trainer"
                                    className="relative z-10 w-64 h-64 sm:w-80 sm:h-80 rounded-3xl object-cover shadow-2xl border-2 border-white"
                                />

                                {/* Verified Trainer Pill */}
                                <div className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-md border border-slate-200 text-slate-900 rounded-full px-3 py-1 flex items-center gap-1.5 shadow-md">
                                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-800">Verified AI Mentor</span>
                                </div>

                                {/* Floating Rating Badge */}
                                <div className="absolute -bottom-5 -right-3 sm:-right-5 z-20 bg-white border border-slate-200 text-slate-900 rounded-2xl px-4 py-3 text-center shadow-xl">
                                    <div className="flex items-center justify-center gap-1 text-amber-500 mb-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                        ))}
                                    </div>
                                    <div className="text-lg font-black text-slate-900 leading-none">4.9 / 5.0</div>
                                    <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-1">4,850+ Reviews</div>
                                </div>
                            </div>

                            {/* Social Connect */}
                            <div className="flex items-center gap-3 mt-8">
                                <a 
                                    href="https://www.linkedin.com/in/antony-praveen-techtycoon" 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-colors border border-slate-200"
                                    title="LinkedIn Profile"
                                >
                                    <Linkedin className="w-4 h-4" />
                                </a>
                                <a 
                                    href="https://www.instagram.com/amiable_antony" 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-pink-50 text-slate-600 hover:text-pink-600 transition-colors border border-slate-200"
                                    title="Instagram Profile"
                                >
                                    <Instagram className="w-4 h-4" />
                                </a>
                                <a 
                                    href="https://www.techtycoon.in/" 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 transition-colors border border-slate-200"
                                    title="Tech Tycoon Website"
                                >
                                    <Globe className="w-4 h-4" />
                                </a>
                            </div>
                        </div>

                        {/* Right Side: Bio, Credentials & Quote */}
                        <div className="lg:col-span-7 flex flex-col justify-between">
                            <div>
                                <div className="inline-block px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-xs font-black tracking-wide uppercase mb-2">
                                    Lead Instructor & Strategist
                                </div>
                                <h3 className="text-2xl sm:text-4xl font-black text-slate-900 mb-1">
                                    Antony Praveen
                                </h3>
                                <p className="text-sm font-bold text-slate-500 mb-5">
                                    Founder, TECH TYCOON DIGITAL SOLUTION LLP
                                </p>

                                {/* Personal Philosophy Quote Card */}
                                <div className="bg-slate-50 border-l-4 border-brandGreen p-4 sm:p-5 rounded-r-2xl mb-6 italic text-sm sm:text-base text-slate-700 leading-relaxed shadow-xs">
                                    "AI won't replace you, but a business owner using AI will definitely replace one who doesn't. My mission is to show you how to leverage AI without needing to write a single line of code."
                                </div>

                                {/* Key Highlights */}
                                <div className="space-y-2.5 mb-8">
                                    {credentials.map((item, idx) => (
                                        <div key={idx} className="flex items-start gap-2.5">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                            <span className="text-xs sm:text-sm font-semibold text-slate-700 leading-tight">
                                                {item}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 4 Quick Stat Counters */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-100">
                                {stats.map((s, i) => (
                                    <div key={i} className="bg-slate-50 rounded-2xl p-3 text-center border border-slate-200/80">
                                        <div className="text-lg sm:text-xl font-black text-slate-900">{s.value}</div>
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tight mt-0.5">{s.label}</div>
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
