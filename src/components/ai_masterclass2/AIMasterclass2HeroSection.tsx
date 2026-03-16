import React from "react";
import { ChevronDown, Calendar, Clock, MapPin, IndianRupee, Zap, Languages } from "lucide-react";
import { useAIMasterclass2RegisterModal } from "./AIMasterclass2RegisterModalContext";

const AIMasterclass2HeroSection: React.FC = () => {
    const { openRegisterModal } = useAIMasterclass2RegisterModal();
    const scrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <section
            className="relative min-h-[90vh] flex items-center justify-center px-4 pt-32 pb-16 overflow-hidden"
            style={{
                backgroundImage: `
                    radial-gradient(circle at center, rgba(255, 255, 255, 0.95) 15%, rgba(59, 130, 246, 0.85) 100%),
                    url('/ai_masterclass2/hero-bg.png')
                `,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            {/* Background patterns */}
            <div className="absolute inset-0 opacity-30 pointer-events-none mix-blend-overlay">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-400/40 rounded-full blur-[120px] -mr-64 -mt-64" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-300/50 rounded-full blur-[100px] -ml-32 -mb-32" />
                <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.3) 1px, transparent 0)`, backgroundSize: '40px 40px' }} />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto w-full">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    {/* Left Side: Content */}
                    <div className="lg:col-span-7 flex flex-col items-start text-left">
                        {/* Status Badge */}
                        <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full bg-[#fce7f3] border border-pink-200">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            <span className="font-display text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em]">
                                LIVE MASTERCLASS • 15TH MARCH 2026 • 6:00 PM IST
                            </span>
                        </div>

                        <h1 className="font-display text-6xl sm:text-7xl lg:text-[100px] font-black leading-[0.95] text-[#1e293b] mb-8 select-none">
                            Master <br />
                            <span className="text-blue-600">AI-Powered</span> <br />
                            Digital Marketing
                        </h1>

                        <p className="font-body text-lg text-slate-500 max-w-xl leading-relaxed mb-8">
                            In just <span className="font-bold text-slate-900">3 hours</span>, learn to build a powerful digital brand, attract quality leads, and automate your marketing — all using the latest AI tools. Designed for <span className="font-bold text-slate-900">Trainers, Coaches, Entrepreneurs & Business Owners</span>.
                        </p>

                        <div className="flex flex-wrap items-center gap-3 mb-10">
                            <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} className="w-5 h-5 text-amber-500 fill-amber-500 drop-shadow-sm" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                ))}
                            </div>
                            <p className="font-body text-sm text-slate-600 font-medium">
                                <span className="font-bold text-slate-900">4.9/5</span> average rating based on <span className="font-bold text-slate-900">4.8K+</span> students
                            </p>
                        </div>

                        <button
                            onClick={openRegisterModal}
                            className="relative group bg-[#2563eb] hover:bg-blue-700 text-white font-display text-base font-black px-12 py-5 rounded-md flex items-center gap-3 transition-all hover:scale-[1.02] shadow-xl shadow-blue-500/20"
                        >
                            <Zap className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                            <span>GET MY DISCOUNTED SEAT</span>
                            <span className="text-blue-200/50 line-through text-sm font-bold ml-1">₹999</span>
                        </button>
                    </div>

                    {/* Right Side: Details Card */}
                    <div className="lg:col-span-5 flex justify-center lg:justify-end">
                        <div className="w-full max-w-[420px] bg-white/70 backdrop-blur-xl rounded-[40px] p-10 border border-white/50 shadow-2xl shadow-blue-500/10">
                            <h3 className="font-display text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-10">
                                WORKSHOP DETAILS
                            </h3>

                            <div className="space-y-10">
                                {/* Date */}
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                                        <Calendar className="w-6 h-6 text-blue-500" />
                                    </div>
                                    <div>
                                        <div className="font-display text-xl font-black text-slate-900 leading-none">15th March 2026</div>
                                        <div className="font-body text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">SUNDAY</div>
                                    </div>
                                </div>

                                {/* Time */}
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center">
                                        <Clock className="w-6 h-6 text-pink-500" />
                                    </div>
                                    <div>
                                        <div className="font-display text-xl font-black text-slate-900 leading-none">6:00 PM – 9:00 PM</div>
                                        <div className="font-body text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">IST • ONLINE LIVE</div>
                                    </div>
                                </div>

                                {/* Language */}
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center">
                                        <Languages className="w-6 h-6 text-orange-500" />
                                    </div>
                                    <div>
                                        <div className="font-display text-xl font-black text-slate-900 leading-none">Basic English with mix of Tamil</div>
                                        <div className="font-body text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">SESSION LANGUAGE</div>
                                    </div>
                                </div>

                                {/* Platform */}
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-cyan-50 flex items-center justify-center">
                                        <MapPin className="w-6 h-6 text-cyan-500" />
                                    </div>
                                    <div>
                                        <div className="font-display text-xl font-black text-slate-900 leading-none">Zoom / Google Meet</div>
                                        <div className="font-body text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">LINK SENT AFTER REGISTRATION</div>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-yellow-50 flex items-center justify-center">
                                        <IndianRupee className="w-6 h-6 text-yellow-600" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-display text-xl font-black text-slate-900 leading-none">₹99</span>
                                            <span className="font-display text-sm font-bold text-slate-400 line-through">₹999</span>
                                        </div>
                                        <div className="font-body text-[10px] font-bold text-yellow-600 uppercase tracking-widest mt-1">EARLY BIRD OFFER ENDS SOON</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <button
                onClick={() => scrollTo("about")}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-400 hover:text-blue-500 transition-colors animate-bounce"
            >
                <ChevronDown className="w-6 h-6" />
            </button>
        </section>
    );
};

export default AIMasterclass2HeroSection;
