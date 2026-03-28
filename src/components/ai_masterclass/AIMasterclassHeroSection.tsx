import React from "react";
import { ChevronDown, Calendar, Clock, IndianRupee, Video, Languages } from "lucide-react";
import { useAIMasterclassRegisterModal } from "./AIMasterclassRegisterModalContext";

const AIMasterclassHeroSection: React.FC = () => {
    const { openRegisterModal } = useAIMasterclassRegisterModal();
    const scrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <section className="relative min-h-[90vh] flex items-center justify-center px-4 pt-32 pb-16 bg-white overflow-hidden">
            {/* Minimal Background pattern */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, black 1px, transparent 0)`, backgroundSize: '32px 32px' }} />

            <div className="relative z-10 max-w-7xl mx-auto w-full">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    {/* Left Side: Content */}
                    <div className="lg:col-span-7 flex flex-col items-start text-left">
                        {/* Status Badge */}
                        <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full bg-red-100 border border-red-200">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider">
                                LIVE MASTERCLASS • 5TH APRIL 2026 • 6:00 PM IST
                            </span>
                        </div>

                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight text-slate-900 mb-6 tracking-tight">
                            Master <span className="text-[#3b82f6]">AI-Powered</span> <br />
                            Digital Marketing
                        </h1>

                        <p className="text-lg text-slate-600 max-w-xl leading-relaxed mb-8">
                            In just <span className="font-bold text-slate-900">3 hours</span>, learn to build a powerful digital brand, attract quality leads, and automate your marketing — all using the latest AI tools. Designed for <span className="font-bold text-slate-900">Trainers, Coaches, Entrepreneurs & Business Owners</span>.
                        </p>

                        <div className="flex flex-wrap items-center gap-3 mb-10">
                            <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} className="w-5 h-5 text-amber-400 fill-amber-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                ))}
                            </div>
                            <p className="text-sm text-slate-600 font-medium">
                                <span className="font-bold text-slate-900">4.9/5</span> average rating based on <span className="font-bold text-slate-900">4.8K+</span> students
                            </p>
                        </div>

                        <button
                            onClick={openRegisterModal}
                            className="bg-brandGreen hover:bg-[#a3c77e] text-slate-900 text-lg font-black px-10 py-5 rounded-lg flex items-center gap-3 transition-transform hover:scale-[1.02] shadow-xl border border-[#a3c77e]"
                        >
                            <span>GET MY DISCOUNTED SEAT</span>
                            <span className="text-slate-600 line-through text-sm font-bold ml-2">₹999</span>
                        </button>
                    </div>

                    {/* Right Side: Details Card */}
                    <div className="lg:col-span-5 flex justify-center lg:justify-end">
                        <div className="w-full max-w-[400px] bg-white rounded-3xl p-8 border border-gray-200 shadow-2xl relative overflow-hidden">
                            {/* Accent line at top */}
                            <div className="absolute top-0 left-0 right-0 h-2 bg-brandGreen"></div>
                            
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8 text-center">
                                WORKSHOP DETAILS
                            </h3>

                            <div className="space-y-8">
                                {/* Date */}
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                                        <Calendar className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <div className="text-lg font-black text-slate-900 leading-none">5th April 2026</div>
                                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mt-1">SUNDAY</div>
                                    </div>
                                </div>

                                {/* Time */}
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center shrink-0">
                                        <Clock className="w-6 h-6 text-pink-600" />
                                    </div>
                                    <div>
                                        <div className="text-lg font-black text-slate-900 leading-none">6:00 PM – 9:00 PM</div>
                                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mt-1">IST • ONLINE LIVE</div>
                                    </div>
                                </div>

                                {/* Language */}
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                                        <Languages className="w-6 h-6 text-orange-600" />
                                    </div>
                                    <div>
                                        <div className="text-lg font-black text-slate-900 leading-none">Basic English And Tamil</div>
                                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mt-1">SESSION LANGUAGE</div>
                                    </div>
                                </div>

                                {/* Platform */}
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                                        <Video className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <div className="text-lg font-black text-slate-900 leading-none">Zoom / Meet</div>
                                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mt-1">LINK SENT AFTER REGISTRATION</div>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                                    <div className="w-12 h-12 rounded-xl bg-brandGreen/20 flex items-center justify-center shrink-0">
                                        <IndianRupee className="w-6 h-6 text-green-700" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl font-black text-slate-900 leading-none">₹99</span>
                                            <span className="text-sm font-bold text-slate-400 line-through">₹999</span>
                                        </div>
                                        <div className="text-[11px] font-bold text-red-600 uppercase tracking-wide mt-1">EARLY BIRD OFFER</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <button
                onClick={() => scrollTo("about")}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 text-slate-400 hover:text-slate-600 transition-colors animate-bounce"
            >
                <ChevronDown className="w-6 h-6" />
            </button>
        </section>
    );
};

export default AIMasterclassHeroSection;
