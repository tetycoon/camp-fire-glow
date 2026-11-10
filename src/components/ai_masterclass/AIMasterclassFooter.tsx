import React from "react";
import { Linkedin, Instagram, Globe, Mail, ShieldCheck, Phone, MapPin } from "lucide-react";

const AIMasterclassFooter: React.FC = () => {
    return (
        <footer className="py-16 sm:py-20 px-4 bg-[#03040a] text-white border-t border-white/[0.06] relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent" />
            <div className="max-w-7xl mx-auto relative">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-3 mb-5">
                            <img src="/logo.png" alt="TECH TYCOON DIGITAL SOLUTION LLP" className="w-10 h-10 rounded-full border border-white/20 ring-2 ring-indigo-500/20 shrink-0" />
                            <div className="flex flex-col text-left leading-none">
                                <span className="text-lg sm:text-xl font-black tracking-tight text-white uppercase">TECH TYCOON</span>
                                <span className="text-[10px] sm:text-xs font-bold tracking-widest text-slate-400 uppercase mt-1">DIGITAL SOLUTION LLP</span>
                            </div>
                        </div>
                        <p className="text-slate-400 leading-relaxed max-w-md mb-6 text-sm">
                            Empowering business leaders, executives, and working professionals with practical enterprise AI workflows and automation strategies.
                        </p>
                        <div className="flex items-center gap-3">
                            <a
                                href="https://www.techtycoon.in/"
                                target="_blank"
                                rel="noreferrer"
                                className="p-2.5 rounded-lg bg-white/[0.04] hover:bg-gradient-to-br hover:from-indigo-500 hover:to-sky-500 text-slate-400 hover:text-white transition-colors border border-white/10"
                                title="Corporate Website"
                            >
                                <Globe className="w-4 h-4" />
                            </a>
                            <a
                                href="https://www.linkedin.com/in/antony-praveen-techtycoon"
                                target="_blank"
                                rel="noreferrer"
                                className="p-2.5 rounded-lg bg-white/[0.04] hover:bg-gradient-to-br hover:from-indigo-500 hover:to-sky-500 text-slate-400 hover:text-white transition-colors border border-white/10"
                                title="LinkedIn"
                            >
                                <Linkedin className="w-4 h-4" />
                            </a>
                            <a
                                href="https://www.instagram.com/amiable_antony"
                                target="_blank"
                                rel="noreferrer"
                                className="p-2.5 rounded-lg bg-white/[0.04] hover:bg-gradient-to-br hover:from-indigo-500 hover:to-sky-500 text-slate-400 hover:text-white transition-colors border border-white/10"
                                title="Instagram"
                            >
                                <Instagram className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest mb-5 text-white border-l-4 border-indigo-400 pl-3">Program Navigation</h4>
                        <ul className="space-y-3 text-sm font-medium text-slate-400">
                            <li><a href="#about" className="hover:text-white transition-colors">Executive Overview</a></li>
                            <li><a href="#modules" className="hover:text-white transition-colors">Curriculum & Modules</a></li>
                            <li><a href="#trainer" className="hover:text-white transition-colors">Lead Faculty</a></li>
                            <li><a href="#bonuses" className="hover:text-white transition-colors">Resource Toolkit</a></li>
                            <li><a href="#pricing" className="hover:text-white transition-colors">Program Fee & Schedule</a></li>
                            <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest mb-5 text-white border-l-4 border-indigo-400 pl-3">Corporate Office & Support</h4>
                        <div className="flex items-start gap-3 text-slate-400 mb-3 text-xs leading-relaxed">
                            <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                            <span>No. 31, Ramalinga Nagar, Madipakkam, Chennai, Tamil Nadu 600091</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-400 mb-3 text-sm">
                            <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                            <a href="mailto:support@techtycoon.in" className="hover:text-white font-medium transition-colors">support@techtycoon.in</a>
                        </div>
                        <div className="flex items-center gap-3 text-slate-400 mb-5 text-sm">
                            <Phone className="w-4 h-4 text-sky-400 shrink-0" />
                            <a href="tel:+916379209689" className="hover:text-white font-medium transition-colors">+91 63792 09689</a>
                        </div>
                        <div className="flex items-center gap-2 text-slate-300 bg-white/[0.03] p-3 rounded-lg border border-white/10">
                            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span className="text-[11px] font-semibold uppercase tracking-wider">Razorpay 256-Bit SSL Protected</span>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                    <p>© 2026 TECH TYCOON DIGITAL SOLUTION LLP. All Rights Reserved.</p>
                    <p className="text-[11px]">Corporate AI Training & Digital Transformation Division</p>
                </div>
            </div>
        </footer>
    );
};

export default AIMasterclassFooter;
