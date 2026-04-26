import React from "react";
import { MapPin, Calendar, Clock, ArrowRight } from "lucide-react";
import { useUpscaleRegisterModal } from "./UpscaleRegisterModalContext";
import heroImg from "@/assets/upscale_workshop_hero.jpg";

const UpscaleHero: React.FC = () => {
    const { openRegisterModal } = useUpscaleRegisterModal();



    return (
        <section id="hero" className="relative pt-40 pb-28 overflow-hidden bg-white">
            {/* Premium Background Elements */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-50/40 to-transparent -z-10"></div>
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-100/30 rounded-full blur-[120px] -z-10"></div>
            
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                {/* Text Column — always first on mobile */}
                <div className="relative z-10 order-1 transition-all duration-1000 animate-in fade-in slide-in-from-left-12">
                    <h1 className="text-5xl lg:text-7xl font-black text-slate-900 leading-[0.92] mb-6 tracking-tighter">
                        <span className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 bg-clip-text text-transparent inline-block mb-2 drop-shadow-sm text-7xl lg:text-[100px] mr-6">AI</span> Business <br />
                        <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-600 bg-clip-text text-transparent block leading-tight">Generative Model</span>
                        <span className="relative inline-block mt-3 group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500 animate-pulse"></div>
                            <span className="relative text-xl lg:text-2xl font-black tracking-widest bg-white text-blue-600 px-6 py-2.5 rounded-2xl border border-blue-100 uppercase leading-none shadow-xl shadow-blue-500/10 inline-block">(Advanced)</span>
                        </span>
                    </h1>

                    {/* Sub-headline hook */}
                    <div className="text-xl lg:text-2xl font-black text-slate-900 mb-6 leading-snug">
                        Build Your Complete AI Business System <br className="hidden sm:block" />
                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">in 8 Hours.</span>
                    </div>
                    
                    <p className="text-lg lg:text-xl text-slate-500 mb-8 leading-relaxed font-semibold max-w-xl">
                        Master the high-performance <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-black decoration-blue-500/20 decoration-8 underline-offset-[-2px] underline">9 Principles</span> of Business Generative Models. A high-stakes session for experts ready to scale.
                    </p>
                </div>

                {/* Image Column — second on mobile */}
                <div className="flex flex-col order-2">
                    <div className="relative group perspective-2000">
                        <div className="absolute -inset-10 bg-blue-600/10 rounded-[100px] blur-[100px] opacity-30 group-hover:opacity-50 transition-opacity duration-1000 animate-pulse"></div>
                        <div className="relative rounded-[32px] lg:rounded-[64px] overflow-hidden shadow-[0_48px_100px_rgba(0,0,0,0.12)] border-[8px] lg:border-[16px] border-white group-hover:scale-[1.03] transition-all duration-1000 group-hover:-rotate-1 animate-float">
                            <img 
                                src={heroImg} 
                                alt="Corporate Boardroom" 
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent p-6 lg:p-12 pt-16 lg:pt-32">
                                <div className="flex items-center gap-4 lg:gap-6">
                                    <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-[16px] lg:rounded-[24px] bg-white/10 backdrop-blur-2xl border border-white/20 flex items-center justify-center text-white shadow-2xl transition-transform group-hover:rotate-12">
                                        <MapPin className="w-6 h-6 lg:w-8 lg:h-8" />
                                    </div>
                                    <div>
                                        <div className="text-white font-black text-xl lg:text-3xl tracking-tight leading-none mb-1 lg:mb-2">Vestin Park Hotel</div>
                                        <div className="text-white/60 text-[9px] lg:text-[10px] font-black uppercase tracking-[0.4em]">Egmore, Chennai</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Urgency Badge — repositioned for mobile */}
                        <div className="absolute -top-6 -right-3 lg:-top-12 lg:-right-12 bg-white/95 backdrop-blur-3xl rounded-[24px] lg:rounded-[48px] p-5 lg:p-10 shadow-[0_32px_80px_rgba(0,0,0,0.15)] border border-white text-center hover:scale-110 transition-all duration-500 cursor-default group/badge animate-bounce-subtle">
                            <div className="relative mb-2 lg:mb-3">
                                <span className="absolute -top-1 -right-1 w-4 h-4 lg:w-5 lg:h-5 bg-red-500 rounded-full animate-ping opacity-25"></span>
                                <span className="absolute -top-1 -right-1 w-4 h-4 lg:w-5 lg:h-5 bg-red-500 rounded-full opacity-60"></span>
                                <div className="text-3xl lg:text-5xl font-black text-slate-950 leading-none tracking-tighter group-hover/badge:text-blue-600 transition-colors">30</div>
                            </div>
                            <div className="text-[8px] lg:text-[10px] font-black uppercase text-blue-600 tracking-[0.35em] leading-tight">
                                SEATS LEFT<br />
                                <span className="text-slate-400 font-bold opacity-40">MAY 31 BATCH</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>



            {/* Linear Utility Row — responsive */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 lg:-mt-14 relative z-20 flex justify-center">
                <div className="bg-white p-4 sm:p-6 rounded-[24px] lg:rounded-[40px] border border-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] flex flex-col sm:flex-row flex-wrap lg:flex-nowrap items-center justify-center gap-6 sm:gap-8 lg:gap-16 w-full sm:w-auto">
                    {/* Date */}
                    <div className="flex items-center gap-4 group">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-blue-600 shadow-sm border border-slate-100 transition-transform group-hover:scale-110">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div className="whitespace-nowrap">
                            <div className="text-[9px] font-black uppercase text-slate-400 tracking-widest">DATE</div>
                            <div className="text-sm font-black text-slate-900 leading-none mt-1">May 31, 2026</div>
                        </div>
                    </div>

                    {/* Schedule */}
                    <div className="flex items-center gap-4 group">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-blue-600 shadow-sm border border-slate-100 transition-transform group-hover:scale-110">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div className="whitespace-nowrap">
                            <div className="text-[9px] font-black uppercase text-slate-400 tracking-widest">SCHEDULE</div>
                            <div className="text-sm font-black text-slate-900 leading-none mt-1">9:30 AM - 5:30 PM</div>
                        </div>
                    </div>

                    {/* CTA Button */}
                    <button 
                        onClick={openRegisterModal}
                        className="relative overflow-hidden bg-slate-950 text-white px-8 py-4 rounded-[22px] font-black text-base transition-all shadow-xl shadow-slate-950/20 hover:shadow-blue-500/30 hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 group w-full sm:w-auto"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-transparent to-indigo-600/20 -translate-x-full group-hover:animate-shimmer"></div>
                        <span className="relative z-10 uppercase tracking-wide">Reserve Seat</span>
                        <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                    </button>

                    {/* Price with Anchor */}
                    <div className="flex flex-col font-black border-t-2 sm:border-t-0 sm:border-l-2 border-slate-200 pt-4 sm:pt-0 sm:pl-8">
                        <div className="flex items-baseline gap-2">
                            <span className="text-sm text-slate-400 line-through">₹9,999</span>
                            <span className="text-2xl text-slate-950 tracking-tighter">₹4,999</span>
                        </div>
                        <div className="text-[7.5px] text-slate-400 uppercase tracking-[0.2em] mt-0.5 whitespace-nowrap">Includes Lunch & Networking</div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default UpscaleHero;
