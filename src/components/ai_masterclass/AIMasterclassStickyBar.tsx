import React, { useState, useEffect } from "react";
import { Sparkles, Clock, ShieldCheck, ArrowRight } from "lucide-react";
import { useAIMasterclassRegisterModal } from "./AIMasterclassRegisterModalContext";
import { getMasterclassDateStrings } from "../../lib/masterclassDateUtils";

const AIMasterclassStickyBar: React.FC = () => {
    const { openRegisterModal } = useAIMasterclassRegisterModal();
    const { nextSession } = getMasterclassDateStrings();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 400) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-4 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 animate-in slide-in-from-bottom-5">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                {/* Left Side Info */}
                <div className="hidden md:flex items-center gap-6">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                            </span>
                            <span className="text-[11px] font-black text-blue-700 uppercase tracking-wider">LIVE MASTERCLASS • WED 6-9 PM & SUN 10-1 PM</span>
                        </div>
                        <p className="text-sm font-black text-slate-900 tracking-tight">Next Session: {nextSession.regularDate} • {nextSession.shortTime}</p>
                    </div>

                    <div className="h-8 w-px bg-slate-200" />

                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                        <Clock className="w-4 h-4 text-emerald-600" />
                        <span>3 Hours Live Interactive Training</span>
                    </div>
                </div>

                {/* Right Side / Mobile Layout */}
                <div className="flex items-center justify-between w-full md:w-auto gap-4">
                    <div className="flex flex-col md:hidden">
                        <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">NEXT SESSION: {nextSession.dayName.toUpperCase()}</span>
                        <span className="text-xs font-black text-slate-900">{nextSession.shortTime} • ₹99</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-[10px] text-slate-400 line-through font-bold">₹999</span>
                            <span className="text-lg font-black text-slate-900 leading-none">₹99 <span className="text-[10px] text-slate-500 font-bold">+ GST</span></span>
                        </div>

                        <button
                            onClick={openRegisterModal}
                            className="bg-brandGreen hover:bg-[#a3c77e] text-slate-900 text-xs sm:text-sm font-black px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl border border-[#95c06b] shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap"
                        >
                            <span>CLAIM SEAT — ₹99</span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-900" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIMasterclassStickyBar;
