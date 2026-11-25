import React, { useState, useEffect } from "react";
import { Clock, ArrowRight, MessageSquare } from "lucide-react";
import { useAIMasterclassRegisterModal } from "./AIMasterclassRegisterModalContext";

const AIMasterclassStickyBar: React.FC = () => {
    const { openRegisterModal } = useAIMasterclassRegisterModal();
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
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 px-4 py-3 shadow-[0_-10px_35px_rgba(15,23,42,0.08)] transition-all duration-300 animate-in slide-in-from-bottom-5">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                {/* Left Side Info */}
                <div className="hidden md:flex items-center gap-6">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600"></span>
                            </span>
                            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">AI MASTERCLASS SESSIONS ON HOLD</span>
                        </div>
                        <p className="text-sm font-bold text-slate-900 tracking-tight">Admissions Temporarily Paused • Join WhatsApp Community for Next Batch</p>
                    </div>

                    <div className="h-8 w-px bg-slate-200" />

                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span>Sessions Currently Paused</span>
                    </div>
                </div>

                {/* Right Side / Mobile Layout */}
                <div className="flex items-center justify-between w-full md:w-auto gap-4">
                    <div className="flex flex-col md:hidden">
                        <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">ADMISSIONS PAUSED</span>
                        <span className="text-xs font-bold text-slate-900">Sessions On Hold</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <a
                            href="https://chat.whatsapp.com/EpsuzpxGz6F98ml2GUBejC"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-xs sm:text-sm font-bold px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl shadow-md shadow-amber-600/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap"
                        >
                            <span>Join WhatsApp Community</span>
                            <ArrowRight className="w-3.5 h-3.5 text-white" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIMasterclassStickyBar;
