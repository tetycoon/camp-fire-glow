import React from "react";
import { MapPin, Calendar, Clock, ArrowRight } from "lucide-react";
import { useUpscaleRegisterModal } from "./UpscaleRegisterModalContext";
import heroImg from "@/assets/upscale_workshop_hero.jpg";

const UpscaleHero: React.FC = () => {
    const { openRegisterModal } = useUpscaleRegisterModal();



    return (
        <section id="hero" className="relative pt-36 sm:pt-40 pb-24 sm:pb-28 overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white">
            {/* Premium Atmospheric Lighting */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-100/50 via-transparent to-transparent -z-10 pointer-events-none"></div>
            <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-gradient-to-l from-blue-400/10 to-indigo-500/5 rounded-full blur-[140px] -z-10 pointer-events-none"></div>
            <div className="absolute top-10 left-10 w-72 h-72 bg-blue-300/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
            
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                {/* Text Column — always first on mobile */}
                <div className="relative z-10 order-1 transition-all duration-1000 animate-in fade-in slide-in-from-left-8">
                    {/* Top Executive Tag */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-black uppercase tracking-wider mb-6 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                        Executive Full-Day Masterclass • Chennai
                    </div>

                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-slate-900 leading-[0.94] mb-6 tracking-tighter">
                        <span className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 bg-clip-text text-transparent inline-block mb-1 drop-shadow-sm text-6xl sm:text-7xl lg:text-[92px] mr-4 sm:mr-6">AI</span> Business <br />
                        <span className="bg-gradient-to-r from-slate-950 via-slate-800 to-blue-700 bg-clip-text text-transparent block leading-tight">Generative Model</span>
                        <span className="relative inline-block mt-3 group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500 animate-pulse"></div>
                            <span className="relative text-lg sm:text-xl lg:text-2xl font-black tracking-widest bg-white text-blue-600 px-5 py-2 rounded-2xl border border-blue-200/80 uppercase leading-none shadow-xl shadow-blue-500/10 inline-block">(Advanced)</span>
                        </span>
                    </h1>

                    {/* Sub-headline hook */}
                    <div className="text-xl sm:text-2xl font-black text-slate-900 mb-5 leading-snug">
                        Build Your Complete AI Business System <br className="hidden sm:block" />
                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">in 8 Intensive Hours.</span>
                    </div>
                    
                    <p className="text-base sm:text-lg text-slate-600 mb-8 leading-relaxed font-semibold max-w-xl">
                        Master the high-performance <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-black decoration-blue-500/30 decoration-4 underline-offset-2 underline">9 Principles</span> of Business Generative Models. An exclusive, high-stakes session for founders, leaders, and consultants ready to scale.
                    </p>
                </div>

                {/* Image Column — second on mobile */}
                <div className="flex flex-col order-2">
                    <div className="relative group perspective-2000">
                        <div className="absolute -inset-6 bg-gradient-to-r from-blue-600/15 to-indigo-600/15 rounded-[60px] blur-[80px] opacity-40 group-hover:opacity-60 transition-opacity duration-1000"></div>
                        <div className="relative rounded-[32px] lg:rounded-[52px] overflow-hidden shadow-[0_40px_90px_-20px_rgba(15,23,42,0.2)] border-[8px] lg:border-[12px] border-white group-hover:scale-[1.02] transition-all duration-700">
                            <img 
                                src={heroImg} 
                                alt="Corporate Boardroom" 
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-transparent p-6 lg:p-10 pt-16 lg:pt-28">
                                <div className="flex items-center gap-4 lg:gap-5">
                                    <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-white/15 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white shadow-2xl transition-transform group-hover:rotate-6">
                                        <MapPin className="w-6 h-6 lg:w-7 lg:h-7 text-blue-400" />
                                    </div>
                                    <div>
                                        <div className="text-white font-black text-xl lg:text-2xl tracking-tight leading-none mb-1">Vestin Park Hotel</div>
                                        <div className="text-slate-300 text-[10px] font-bold uppercase tracking-[0.3em]">Egmore, Chennai • Executive Suite</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Executive Cohort Badge */}
                        <div className="absolute -top-5 -right-2 sm:-top-8 sm:-right-6 bg-white/95 backdrop-blur-2xl rounded-3xl p-4 sm:p-6 shadow-[0_24px_60px_rgba(0,0,0,0.12)] border border-slate-200/90 text-center hover:scale-105 transition-all duration-300 cursor-default">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[9px] font-black uppercase tracking-wider mb-2">
                                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                                Executive Cohort
                            </div>
                            <div className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                                Full-Day Workshop
                            </div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
                                8 Hours Hands-On • Live Build
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* B2B Trust Builder */}
            <div className="max-w-7xl mx-auto px-6 mt-16 pt-10 border-t border-slate-200/80 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">TRUSTED BY TEAMS & LEADERS FROM ENTERPRISE ORGANIZATIONS</p>
                <div className="flex flex-wrap items-center justify-center gap-x-8 sm:gap-x-12 gap-y-4 opacity-60 hover:opacity-90 transition-opacity duration-300">
                    <div className="text-xs font-black text-slate-800 tracking-wider uppercase">Amazon Web Services</div>
                    <span className="hidden sm:block text-slate-300">•</span>
                    <div className="text-xs font-black text-slate-800 tracking-wider uppercase">Cognizant</div>
                    <span className="hidden sm:block text-slate-300">•</span>
                    <div className="text-xs font-black text-slate-800 tracking-wider uppercase">TATA Consultancy Services</div>
                    <span className="hidden sm:block text-slate-300">•</span>
                    <div className="text-xs font-black text-slate-800 tracking-wider uppercase">Infosys</div>
                    <span className="hidden sm:block text-slate-300">•</span>
                    <div className="text-xs font-black text-slate-800 tracking-wider uppercase">HCLTech</div>
                    <span className="hidden sm:block text-slate-300">•</span>
                    <div className="text-xs font-black text-slate-800 tracking-wider uppercase">Zoho Corp</div>
                </div>
            </div>

            {/* Linear Utility Row — responsive */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-10 relative z-20 flex justify-center">
                <div className="bg-white/95 backdrop-blur-2xl p-4 sm:p-5 rounded-3xl lg:rounded-[36px] border border-slate-200/80 shadow-[0_24px_50px_-12px_rgba(15,23,42,0.12)] flex flex-col sm:flex-row flex-wrap lg:flex-nowrap items-center justify-center gap-6 sm:gap-8 lg:gap-14 w-full sm:w-auto">
                    {/* Date */}
                    <div className="flex items-center gap-3.5 group">
                        <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm transition-transform group-hover:scale-105">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div className="whitespace-nowrap">
                            <div className="text-[9px] font-black uppercase text-slate-400 tracking-widest">WORKSHOP DATE</div>
                            <div className="text-sm font-black text-slate-900 leading-none mt-1">6th December 2026 (Sunday)</div>
                        </div>
                    </div>

                    {/* Schedule */}
                    <div className="flex items-center gap-3.5 group">
                        <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm transition-transform group-hover:scale-105">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div className="whitespace-nowrap">
                            <div className="text-[9px] font-black uppercase text-slate-400 tracking-widest">SCHEDULE</div>
                            <div className="text-sm font-black text-slate-900 leading-none mt-1">9:00 AM – 5:30 PM IST</div>
                        </div>
                    </div>

                    {/* CTA Button */}
                    <button 
                        onClick={openRegisterModal}
                        className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white px-8 py-3.5 rounded-2xl font-black text-sm sm:text-base transition-all shadow-xl shadow-blue-600/25 hover:shadow-2xl hover:shadow-blue-600/35 hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2.5 group w-full sm:w-auto cursor-pointer"
                    >
                        <span className="relative z-10 uppercase tracking-wider">Reserve Seat</span>
                        <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                    </button>

                    {/* Price with Anchor */}
                    <div className="flex flex-col font-black border-t-2 sm:border-t-0 sm:border-l-2 border-slate-200/80 pt-3 sm:pt-0 sm:pl-7">
                        <div className="flex items-baseline gap-2">
                            <span className="text-xs text-slate-400 line-through">₹9,999</span>
                            <span className="text-2xl text-slate-950 tracking-tight">₹6,499</span>
                        </div>
                        <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5 whitespace-nowrap">Includes Lunch & High Tea</div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default UpscaleHero;
