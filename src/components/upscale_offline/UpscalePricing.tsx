import React from "react";
import { CheckCircle2, ShieldCheck, Zap, Laptop, Utensils, Award, BookOpen } from "lucide-react";
import { useUpscaleRegisterModal } from "./UpscaleRegisterModalContext";

const inclusions = [
    { text: "Full Execution Roadmap", icon: <CheckCircle2 className="w-4 h-4" /> },
    { text: "Lunch & Morning/Evening Tea", icon: <Utensils className="w-4 h-4" /> },
    { text: "Printed Practical Workbook", icon: <BookOpen className="w-4 h-4" /> },
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
                            Your investment covers the entire curriculum, physical assets, executive dining, and direct implementation guidance.
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
                            
                            <div className="mb-12">
                                <div className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mb-4">FULL ENROLLMENT</div>
                                <div className="flex items-baseline gap-4 mb-2">
                                    <span className="text-2xl text-slate-500 line-through font-bold">₹9,999</span>
                                    <span className="text-6xl lg:text-7xl font-black tracking-tighter bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">₹4,999</span>
                                    <span className="text-slate-400 font-bold text-sm tracking-widest uppercase">/ PERSON</span>
                                </div>
                                <div className="inline-block bg-emerald-500/20 text-emerald-300 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-2">50% OFF — Early Bird</div>
                                <div className="text-emerald-400 font-black text-[11px] uppercase tracking-[0.2em] flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                    Inclusive of GST & F&B Expenses
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 mb-14">
                                {inclusions.map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 group/item">
                                        <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-emerald-400 group-hover/item:bg-emerald-400 group-hover/item:text-slate-900 transition-all">
                                            {item.icon}
                                        </div>
                                        <span className="text-slate-300 font-bold text-xs uppercase tracking-widest group-hover/item:text-white transition-colors">{item.text}</span>
                                    </div>
                                ))}
                            </div>

                            <button 
                                onClick={openRegisterModal}
                                className="relative overflow-hidden w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-[24px] font-black text-xl shadow-2xl shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-4 group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                                <span className="relative z-10">RESERVE MY SEAT</span>
                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center relative z-10 transition-transform group-hover:rotate-12">
                                    <Zap className="w-4 h-4 fill-current" />
                                </div>
                            </button>

                            <p className="text-center mt-8 text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">
                                🔒 Secure Payment Gateway by Razorpay
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
