import React, { useState, useEffect } from "react";
import { Sparkles, Clock, ShieldCheck } from "lucide-react";
import { useAIMasterclassRegisterModal } from "./AIMasterclassRegisterModalContext";
import { getMasterclassDateStrings } from "../../lib/masterclassDateUtils";

const AIMasterclassStickyBar: React.FC = () => {
    const { openRegisterModal } = useAIMasterclassRegisterModal();
    const { regularDate } = getMasterclassDateStrings();
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
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-t border-slate-700/80 px-4 py-3 shadow-[0_-10px_25px_rgba(0,0,0,0.3)] transition-all duration-300 animate-in slide-in-from-bottom-5">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                {/* Left Side Info */}
                <div className="hidden md:flex items-center gap-6">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-xs font-black text-amber-400 uppercase tracking-wider">LIVE MASTERCLASS</span>
                        </div>
                        <p className="text-sm font-bold text-white tracking-tight">{regularDate} • 6:00 PM IST</p>
                    </div>

                    <div className="h-8 w-px bg-slate-700" />

                    <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                        <Clock className="w-4 h-4 text-emerald-400" />
                        <span>Early Bird Price Expiring Soon</span>
                    </div>
                </div>

                {/* Right Side / Mobile Layout */}
                <div className="flex items-center justify-between w-full md:w-auto gap-4">
                    <div className="flex flex-col md:hidden">
                        <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">LIMITED SEATS @ ₹99</span>
                        <span className="text-xs font-bold text-slate-300">{regularDate}</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-xs text-slate-400 line-through font-bold">₹999</span>
                            <span className="text-xl font-black text-emerald-400">₹99</span>
                        </div>

                        <button
                            onClick={openRegisterModal}
                            className="bg-brandGreen hover:bg-[#95c06b] text-slate-900 font-black text-sm sm:text-base px-6 sm:px-8 py-3 rounded-xl shadow-lg hover:scale-105 transition-all border border-[#a3c77e] flex items-center gap-2 shrink-0"
                        >
                            <span>REGISTER NOW — ₹99</span>
                            <Sparkles className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIMasterclassStickyBar;
