import React, { useState, useEffect } from "react";
import { Linkedin, Instagram, Globe, Mail, Clock, ShieldCheck, Phone } from "lucide-react";
import { useAIMasterclassRegisterModal } from "./AIMasterclassRegisterModalContext";

const AIMasterclassFooter: React.FC = () => {
    const { openRegisterModal } = useAIMasterclassRegisterModal();
    const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <>
            {/* Sticky Bottom CTA Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-[60] bg-white border-t border-gray-200 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] py-4 px-4 transform translate-y-0 transition-transform duration-500">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="hidden md:flex items-center gap-6">
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Masterclass Offer</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-black text-slate-900 leading-none">₹99</span>
                                <span className="text-sm font-bold text-slate-400 line-through">₹999</span>
                            </div>
                        </div>
                        <div className="h-10 w-px bg-gray-200"></div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-red-500" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest leading-none">Offer Ends In</span>
                                <span className="text-lg font-black text-slate-900 leading-none">{formatTime(timeLeft)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button
                            onClick={openRegisterModal}
                            className="flex-1 md:flex-none bg-brandGreen hover:bg-[#a3c77e] text-slate-900 text-lg font-black px-10 py-4 rounded-lg shadow-lg border border-[#a3c77e] transition-transform active:scale-95"
                        >
                            JOIN NOW
                        </button>
                    </div>
                </div>
            </div>

            {/* Normal Footer */}
            <footer className="py-20 px-4 pb-48 bg-slate-900 border-t border-slate-800">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                        <div className="lg:col-span-2">
                            <div className="flex items-center gap-3 mb-6">
                                <img src="/logo.png" alt="Tech Tycoon" className="w-10 h-10 rounded-full border border-slate-700" />
                                <span className="text-xl font-black tracking-tight text-white uppercase">TECH TYCOON</span>
                            </div>
                            <p className="text-slate-400 leading-relaxed max-w-sm mb-8 font-medium">
                                Empowering professionals, freelancers, and entrepreneurs with
                                cutting-edge AI skills to lead in the digital era.
                            </p>
                            <div className="flex items-center gap-4">
                                <a href="https://www.techtycoon.in/" target="_blank" className="p-3 rounded-full bg-slate-800 hover:bg-brandGreen hover:text-slate-900 text-slate-400 transition-colors border border-slate-700">
                                    <Globe className="w-5 h-5" />
                                </a>
                                <a href="https://www.linkedin.com/in/antony-praveen-techtycoon" target="_blank" className="p-3 rounded-full bg-slate-800 hover:bg-brandGreen hover:text-slate-900 text-slate-400 transition-colors border border-slate-700">
                                    <Linkedin className="w-5 h-5" />
                                </a>
                                <a href="https://www.instagram.com/amiable_antony" target="_blank" className="p-3 rounded-full bg-slate-800 hover:bg-brandGreen hover:text-slate-900 text-slate-400 transition-colors border border-slate-700">
                                    <Instagram className="w-5 h-5" />
                                </a>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-black uppercase tracking-widest mb-6 text-white border-l-4 border-brandGreen pl-3">Explore</h4>
                            <ul className="space-y-4 text-sm font-bold text-slate-400">
                                <li><a href="/" className="hover:text-brandGreen transition-colors">AI Bootcamp</a></li>
                                <li><a href="/college" className="hover:text-brandGreen transition-colors">College Program</a></li>
                                <li><a href="#about" className="hover:text-brandGreen transition-colors">About Masterclass</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-sm font-black uppercase tracking-widest mb-6 text-white border-l-4 border-brandGreen pl-3">Contact</h4>
                            <div className="flex items-center gap-3 text-slate-400 mb-4">
                                <Mail className="w-4 h-4 text-brandGreen" />
                                <a href="mailto:techtycoondigitalsolutions@gmail.com" className="hover:text-brandGreen text-sm font-bold transition-colors">techtycoondigitalsolutions@gmail.com</a>
                            </div>
                            <div className="flex items-center gap-3 text-slate-400 mb-8">
                                <Phone className="w-4 h-4 text-brandGreen" />
                                <a href="tel:+917558133039" className="hover:text-brandGreen text-sm font-bold transition-colors">+91 7558133039</a>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500 mb-6 bg-slate-800/50 p-3 rounded-lg border border-slate-800">
                                <ShieldCheck className="w-5 h-5 text-brandGreen" />
                                <span className="text-xs font-bold uppercase tracking-wider">Payments Secured</span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                                © 2026 Tech Tycoon Digital Solution<br />All Rights Reserved
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
};

export default AIMasterclassFooter;
