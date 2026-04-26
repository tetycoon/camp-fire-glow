import React, { useState, useEffect } from "react";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { useUpscaleRegisterModal } from "./UpscaleRegisterModalContext";

const UpscaleStickyBar: React.FC = () => {
    const { openRegisterModal } = useUpscaleRegisterModal();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Show the bar after scrolling past the hero section (~500px)
            setVisible(window.scrollY > 400);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div 
            className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-500 ${
                visible 
                    ? "translate-y-0 opacity-100" 
                    : "translate-y-full opacity-0 pointer-events-none"
            }`}
        >
            {/* Gradient fade above the bar */}
            <div className="h-6 bg-gradient-to-t from-white/80 to-transparent pointer-events-none"></div>
            
            <div className="bg-white/95 backdrop-blur-2xl border-t border-slate-200 shadow-[0_-16px_48px_rgba(0,0,0,0.08)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex flex-wrap lg:flex-nowrap items-center justify-center gap-4 sm:gap-6 lg:gap-10">
                    {/* Date */}
                    <div className="flex items-center gap-3 group">
                        <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-blue-600 shadow-sm border border-slate-100 transition-transform group-hover:scale-110">
                            <Calendar className="w-4 h-4" />
                        </div>
                        <div className="whitespace-nowrap">
                            <div className="text-[8px] font-black uppercase text-slate-400 tracking-widest">DATE</div>
                            <div className="text-sm font-black text-slate-900 leading-none mt-0.5">May 31, 2026</div>
                        </div>
                    </div>

                    {/* Schedule */}
                    <div className="flex items-center gap-3 group">
                        <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-blue-600 shadow-sm border border-slate-100 transition-transform group-hover:scale-110">
                            <Clock className="w-4 h-4" />
                        </div>
                        <div className="whitespace-nowrap">
                            <div className="text-[8px] font-black uppercase text-slate-400 tracking-widest">SCHEDULE</div>
                            <div className="text-sm font-black text-slate-900 leading-none mt-0.5">9:30 AM - 5:30 PM</div>
                        </div>
                    </div>

                    {/* CTA Button */}
                    <button 
                        onClick={openRegisterModal}
                        className="relative overflow-hidden bg-slate-950 text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl font-black text-sm transition-all shadow-xl shadow-slate-950/20 hover:shadow-blue-500/30 hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-3 group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-transparent to-indigo-600/20 -translate-x-full group-hover:animate-shimmer"></div>
                        <span className="relative z-10 uppercase tracking-wide">Reserve Seat</span>
                        <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                    </button>

                    {/* Price */}
                    <div className="flex flex-col font-black border-l-2 border-slate-200 pl-6">
                        <div className="text-xl text-slate-950 tracking-tighter">₹4,999</div>
                        <div className="text-[7px] text-slate-400 uppercase tracking-[0.15em] mt-0.5 whitespace-nowrap">Includes Lunch & Networking</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpscaleStickyBar;
