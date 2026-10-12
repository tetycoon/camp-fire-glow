import React, { useState, useEffect } from "react";
import { ChevronDown, Calendar, Clock, IndianRupee, Video, Languages, ShieldCheck, Sparkles } from "lucide-react";
import { useAIMasterclassRegisterModal } from "./AIMasterclassRegisterModalContext";
import { getMasterclassDateStrings } from "../../lib/masterclassDateUtils";

const AIMasterclassHeroSection: React.FC = () => {
    const { openRegisterModal } = useAIMasterclassRegisterModal();
    const { upperDate, regularDate, dayOfWeek } = getMasterclassDateStrings();
    
    // Countdown Timer State
    const [timeLeft, setTimeLeft] = useState({ minutes: 14, seconds: 59 });

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
                if (prev.minutes > 0) return { minutes: prev.minutes - 1, seconds: 59 };
                return { minutes: 14, seconds: 59 };
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const scrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <section className="relative min-h-[calc(100vh-70px)] lg:min-h-screen lg:max-h-[860px] flex flex-col justify-between px-4 pt-20 pb-6 bg-white overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, black 1px, transparent 0)`, backgroundSize: '32px 32px' }} />

            <div className="relative z-10 max-w-7xl mx-auto w-full my-auto">
                {/* High Urgency Countdown Header Bar */}
                <div className="mb-4 w-full max-w-3xl mx-auto bg-gradient-to-r from-red-600 via-amber-600 to-red-600 text-white p-2.5 sm:p-3 rounded-xl shadow-lg flex flex-wrap items-center justify-between gap-2 text-center sm:text-left">
                    <div className="flex items-center gap-2 mx-auto sm:mx-0">
                        <span className="w-2 h-2 rounded-full bg-yellow-300 animate-ping" />
                        <span className="text-xs sm:text-xs font-black tracking-wider uppercase">
                            ⚡ EARLY BIRD OFFER ENDING SOON — SEATS FILLING FAST
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 mx-auto sm:mx-0 bg-black/30 px-2.5 py-0.5 rounded-lg text-xs font-black font-mono">
                        <Clock className="w-3.5 h-3.5 text-yellow-300" />
                        <span>{String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    {/* Left Side: Content */}
                    <div className="lg:col-span-7 flex flex-col items-start text-left">
                        {/* Status Badge */}
                        <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-blue-50 border border-blue-200">
                            <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                            <span className="text-[10px] font-black text-blue-700 uppercase tracking-wider">
                                LIVE MASTERCLASS • {upperDate} • 6:00 PM IST
                            </span>
                        </div>

                        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-[1.1] text-slate-900 mb-3 tracking-tight">
                            AI Secrets <span className="text-[#3b82f6]">Revealed</span> <br />
                            For Business Productivity
                        </h1>

                        <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed mb-4">
                            In just <span className="font-bold text-slate-900">3 hours</span>, learn to build a powerful digital brand, attract quality leads, and automate your marketing — all using the latest AI tools. Designed for <span className="font-bold text-slate-900">Trainers, Coaches, Entrepreneurs & Business Owners</span>.
                        </p>

                        <div className="flex flex-wrap items-center gap-3 mb-5">
                            <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} className="w-4 h-4 text-amber-400 fill-amber-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                ))}
                            </div>
                            <p className="text-xs sm:text-sm text-slate-600 font-medium">
                                <span className="font-bold text-slate-900">4.9/5</span> rating by <span className="font-bold text-slate-900">4,850+</span> business professionals
                            </p>
                        </div>

                        {/* CTA Block */}
                        <div className="w-full sm:w-auto">
                            <button
                                onClick={openRegisterModal}
                                className="w-full sm:w-auto bg-brandGreen hover:bg-[#95c06b] text-slate-900 text-base sm:text-lg font-black px-8 py-3.5 rounded-xl flex items-center justify-center gap-3 transition-transform hover:scale-[1.02] shadow-xl border border-[#a3c77e]"
                            >
                                <span>GET MY DISCOUNTED SEAT — ₹99</span>
                                <span className="text-slate-700 line-through text-sm font-bold">₹999</span>
                                <Sparkles className="w-4 h-4 text-slate-900" />
                            </button>

                            <div className="flex items-center gap-1.5 mt-2 text-[11px] font-bold text-slate-500">
                                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> 100% Secure Checkout via Razorpay
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Details Card */}
                    <div className="lg:col-span-5 flex justify-center lg:justify-end">
                        <div className="w-full max-w-[380px] bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-xl relative overflow-hidden">
                            {/* Accent line at top */}
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-brandGreen"></div>
                            
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 text-center">
                                WORKSHOP DETAILS
                            </h3>

                            <div className="space-y-4">
                                {/* Date */}
                                <div className="flex items-center gap-3.5">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                                        <Calendar className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <div className="text-base font-black text-slate-900 leading-none">{regularDate.split(" (")[0]}</div>
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mt-0.5">{dayOfWeek}</div>
                                    </div>
                                </div>

                                {/* Time */}
                                <div className="flex items-center gap-3.5">
                                    <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center shrink-0">
                                        <Clock className="w-5 h-5 text-pink-600" />
                                    </div>
                                    <div>
                                        <div className="text-base font-black text-slate-900 leading-none">6:00 PM – 9:00 PM</div>
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mt-0.5">IST • ONLINE LIVE</div>
                                    </div>
                                </div>

                                {/* Language */}
                                <div className="flex items-center gap-3.5">
                                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                                        <Languages className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <div className="text-base font-black text-slate-900 leading-none">Basic English And Tamil</div>
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mt-0.5">SESSION LANGUAGE</div>
                                    </div>
                                </div>

                                {/* Platform */}
                                <div className="flex items-center gap-3.5">
                                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                                        <Video className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <div className="text-base font-black text-slate-900 leading-none">Online Live Session</div>
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mt-0.5">LINK SENT AFTER REGISTRATION</div>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="flex items-center gap-3.5 pt-3 border-t border-gray-100">
                                    <div className="w-10 h-10 rounded-xl bg-brandGreen/20 flex items-center justify-center shrink-0">
                                        <IndianRupee className="w-5 h-5 text-green-700" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl font-black text-slate-900 leading-none">₹99</span>
                                            <span className="text-xs font-bold text-slate-400 line-through">₹999</span>
                                        </div>
                                        <div className="text-[10px] font-bold text-red-600 uppercase tracking-wide mt-0.5">EARLY BIRD OFFER (90% OFF)</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* B2B Trust Builder */}
                <div className="mt-6 pt-4 border-t border-slate-100 w-full text-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">TRUSTED BY TEAMS AT LEADING CORPORATIONS & STARTUPS</p>
                    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 opacity-50 hover:opacity-80 transition-opacity">
                        <div className="text-xs font-black text-slate-800 tracking-tighter uppercase">Amazon Web Services</div>
                        <span className="hidden sm:block text-slate-300">•</span>
                        <div className="text-xs font-black text-slate-800 tracking-tighter uppercase">Cognizant Tech</div>
                        <span className="hidden sm:block text-slate-300">•</span>
                        <div className="text-xs font-black text-slate-800 tracking-tighter uppercase">TATA Consultancy Services</div>
                        <span className="hidden sm:block text-slate-300">•</span>
                        <div className="text-xs font-black text-slate-800 tracking-tighter uppercase">Infosys Limited</div>
                        <span className="hidden sm:block text-slate-300">•</span>
                        <div className="text-xs font-black text-slate-800 tracking-tighter uppercase">HCL Technologies</div>
                        <span className="hidden sm:block text-slate-300">•</span>
                        <div className="text-xs font-black text-slate-800 tracking-tighter uppercase">Zoho Corp</div>
                    </div>
                </div>
            </div>

            <button
                onClick={() => scrollTo("about")}
                className="hidden lg:block absolute bottom-2 left-1/2 -translate-x-1/2 text-slate-400 hover:text-slate-600 transition-colors animate-bounce"
            >
                <ChevronDown className="w-5 h-5" />
            </button>
        </section>
    );
};

export default AIMasterclassHeroSection;
