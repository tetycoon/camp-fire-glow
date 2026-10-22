import React from "react";
import { Linkedin, Instagram, Globe, Mail, ShieldCheck, Phone } from "lucide-react";

const AIMasterclassFooter: React.FC = () => {
    return (
        <footer className="py-16 sm:py-20 px-4 bg-slate-900 text-white border-t border-slate-800">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-3 mb-5">
                            <img src="/logo.png" alt="TECH TYCOON DIGITAL SOLUTION LLP" className="w-10 h-10 rounded-full border border-slate-700 shrink-0" />
                            <div className="flex flex-col text-left leading-none">
                                <span className="text-lg sm:text-xl font-black tracking-tight text-white uppercase">TECH TYCOON</span>
                                <span className="text-[10px] sm:text-xs font-bold tracking-wider text-slate-400 uppercase mt-1">DIGITAL SOLUTION LLP</span>
                            </div>
                        </div>
                        <p className="text-slate-400 leading-relaxed max-w-sm mb-6 text-sm font-medium">
                            Empowering professionals, freelancers, and entrepreneurs with practical, cutting-edge AI workflows to thrive in the modern digital era.
                        </p>
                        <div className="flex items-center gap-3">
                            <a 
                                href="https://www.techtycoon.in/" 
                                target="_blank" 
                                rel="noreferrer"
                                className="p-2.5 rounded-xl bg-slate-800 hover:bg-brandGreen hover:text-slate-900 text-slate-400 transition-colors border border-slate-700"
                                title="Website"
                            >
                                <Globe className="w-4 h-4" />
                            </a>
                            <a 
                                href="https://www.linkedin.com/in/antony-praveen-techtycoon" 
                                target="_blank" 
                                rel="noreferrer"
                                className="p-2.5 rounded-xl bg-slate-800 hover:bg-brandGreen hover:text-slate-900 text-slate-400 transition-colors border border-slate-700"
                                title="LinkedIn"
                            >
                                <Linkedin className="w-4 h-4" />
                            </a>
                            <a 
                                href="https://www.instagram.com/amiable_antony" 
                                target="_blank" 
                                rel="noreferrer"
                                className="p-2.5 rounded-xl bg-slate-800 hover:bg-brandGreen hover:text-slate-900 text-slate-400 transition-colors border border-slate-700"
                                title="Instagram"
                            >
                                <Instagram className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xs font-black uppercase tracking-widest mb-5 text-white border-l-4 border-brandGreen pl-3">Navigation</h4>
                        <ul className="space-y-3 text-sm font-bold text-slate-400">
                            <li><a href="#about" className="hover:text-brandGreen transition-colors">Why AI Secrets</a></li>
                            <li><a href="#modules" className="hover:text-brandGreen transition-colors">Curriculum Breakdown</a></li>
                            <li><a href="#trainer" className="hover:text-brandGreen transition-colors">Meet Antony Praveen</a></li>
                            <li><a href="#bonuses" className="hover:text-brandGreen transition-colors">Registration Bonuses</a></li>
                            <li><a href="#pricing" className="hover:text-brandGreen transition-colors">Pricing & Enrollment</a></li>
                            <li><a href="#faq" className="hover:text-brandGreen transition-colors">FAQ</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-xs font-black uppercase tracking-widest mb-5 text-white border-l-4 border-brandGreen pl-3">Official Support</h4>
                        <div className="flex items-center gap-3 text-slate-400 mb-3 text-sm">
                            <Mail className="w-4 h-4 text-brandGreen shrink-0" />
                            <a href="mailto:support@techtycoon.in" className="hover:text-brandGreen font-medium transition-colors">support@techtycoon.in</a>
                        </div>
                        <div className="flex items-center gap-3 text-slate-400 mb-6 text-sm">
                            <Phone className="w-4 h-4 text-brandGreen shrink-0" />
                            <a href="tel:+916379209689" className="hover:text-brandGreen font-medium transition-colors">+91 63792 09689</a>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 mb-5 bg-slate-800/80 p-3 rounded-xl border border-slate-800">
                            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Razorpay 256-Bit SSL Protected</span>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
                    <p>© 2026 TECH TYCOON DIGITAL SOLUTION LLP. All Rights Reserved.</p>
                    <p className="text-[11px]">Designed with excellence for ambitious professionals.</p>
                </div>
            </div>
        </footer>
    );
};

export default AIMasterclassFooter;
