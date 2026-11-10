import React from "react";
import { CheckCircle2, ShieldCheck, Zap, Laptop, Utensils, Award, BookOpen, Tag, ArrowRight } from "lucide-react";
import { useUpscaleRegisterModal } from "./UpscaleRegisterModalContext";

const inclusions = [
    { text: "Full Execution Roadmap", icon: <CheckCircle2 className="w-4 h-4" /> },
    { text: "Lunch & Morning/Evening Tea", icon: <Utensils className="w-4 h-4" /> },
    { text: "Direct Q&A with Trainer", icon: <ShieldCheck className="w-4 h-4" /> },
    { text: "Post-event WhatsApp Support", icon: <Zap className="w-4 h-4" /> }
];

const UpscalePricing: React.FC = () => {
    const { openRegisterModal } = useUpscaleRegisterModal();

    return (
        <section id="pricing" className="py-24 px-6 bg-white border-t border-slate-100">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <div className="inline-block px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                            🎫 TICKETS & INVESTMENT
                        </div>
                        <h2 className="text-4xl lg:text-6xl font-black text-slate-900 leading-tight mb-8 tracking-tighter">
                            One Day. <br />
                            <span className="bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent italic">Exponential Value.</span>
                        </h2>
                        <p className="text-lg text-slate-500 font-semibold mb-12 max-w-lg leading-relaxed">
                            Your investment covers the entire curriculum, live hands-on execution, executive dining, and direct implementation guidance.
                        </p>
                        
                        <div className="bg-slate-50 border border-slate-200 rounded-[32px] p-8 flex items-center gap-6 mb-12">
                            <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-600/20 shrink-0">
                                <Laptop className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-lg font-black text-slate-900 mb-1 leading-tight">Laptop Mandatory</div>
                                <p className="text-sm text-slate-500 font-bold uppercase tracking-wide">WE BUILD LIVE AT THE VENUE</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        {/* Pricing Card */}
                        <div className="bg-slate-900 rounded-[64px] p-10 md:p-14 shadow-[0_48px_100px_rgba(0,0,0,0.3)] text-white relative overflow-hidden group border border-white/5">
                            <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] group-hover:bg-blue-600/20 transition-all duration-700 animate-pulse"></div>
                            
                            <div className="absolute top-0 right-0 p-8 flex flex-col items-end gap-2">
                                <span className="bg-blue-600 text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-[0.2em] shadow-lg">OFFLINE ONLY</span>
                                <span className="bg-white/10 backdrop-blur-md text-white/60 text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest leading-none">Limited VIP Pass</span>
                            </div>
                            
                            <div className="mb-8">
                                <div className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mb-3">FULL ENROLLMENT</div>
                                <div className="flex items-baseline gap-3 mb-2">
                                    <span className="text-2xl text-slate-500 line-through font-bold">₹9,999</span>
                                    <span className="text-6xl lg:text-7xl font-black tracking-tighter bg-gradient-to-br from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">₹6,499</span>
                                    <span className="text-slate-400 font-bold text-sm tracking-widest uppercase">/ PERSON</span>
                                </div>
                                <div className="text-emerald-400 font-bold text-xs flex items-center gap-2 mb-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                    Includes Full Course, Executive Lunch & High Tea
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 mb-10 pt-4 border-t border-white/10">
                                {inclusions.map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 group/item">
                                        <div className="w-7 h-7 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover/item:bg-emerald-500 group-hover/item:text-slate-950 transition-all shrink-0">
                                            {item.icon}
                                        </div>
                                        <span className="text-slate-200 font-semibold text-xs tracking-wide group-hover/item:text-white transition-colors">{item.text}</span>
                                    </div>
                                ))}
                            </div>

                            <button 
                                onClick={openRegisterModal}
                                className="relative overflow-hidden w-full bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-5 rounded-2xl font-black text-lg shadow-2xl shadow-blue-600/40 transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-3 group cursor-pointer"
                            >
                                <span className="relative z-10 tracking-wider">RESERVE MY SEAT NOW</span>
                                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1.5 transition-transform" />
                            </button>

                            <p className="text-center mt-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] flex items-center justify-center gap-2">
                                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Razorpay 256-Bit SSL Encrypted Checkout
                            </p>
                        </div>

                        {/* Inventory Indicator */}
                        <div className="mt-8 text-center flex items-center justify-center gap-4 text-slate-400 font-black text-[10px] uppercase tracking-widest">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            ONLY 30 SEATS PER BATCH — RESERVE YOURS
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default UpscalePricing;
