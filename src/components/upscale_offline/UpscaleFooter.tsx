import React from "react";
import { Mail, Phone, Globe, Linkedin, Instagram } from "lucide-react";
import logo from "@/assets/tech_tycoon_logo.png";

const UpscaleFooter: React.FC = () => {
    return (
        <footer className="bg-slate-950 text-white pt-20 pb-28 px-6 border-t border-white/5">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-4 mb-6">
                            <img src={logo} alt="Tech Tycoon Logo" className="w-10 h-10 object-contain" />
                            <span className="text-xl font-black leading-tight tracking-tighter">TECH TYCOON</span>
                        </div>
                        <p className="text-sm text-slate-400 font-medium leading-relaxed mb-6">
                            Empowering professionals with cutting-edge AI business strategies. 4,800+ students trained across 50+ workshops.
                        </p>
                        <div className="flex items-center gap-3">
                            <a href="https://www.techtycoon.in/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-500/30 transition-all">
                                <Globe className="w-4 h-4" />
                            </a>
                            <a href="https://www.linkedin.com/in/antony-praveen-techtycoon" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-500/30 transition-all">
                                <Linkedin className="w-4 h-4" />
                            </a>
                            <a href="https://www.instagram.com/amiable_antony" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-500/30 transition-all">
                                <Instagram className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">WORKSHOP</div>
                        <div className="space-y-3">
                            {[
                                { name: "The 9 Pillars", id: "bmc" },
                                { name: "Why Offline?", id: "about" },
                                { name: "Venue Details", id: "venue" },
                                { name: "Meet the Mentor", id: "trainer" },
                                { name: "Pricing", id: "pricing" },
                                { name: "FAQs", id: "faq" },
                            ].map(link => (
                                <a
                                    key={link.id}
                                    href={`#${link.id}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        document.getElementById(link.id)?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className="block text-sm font-bold text-slate-400 hover:text-white transition-colors"
                                >
                                    {link.name}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Contact */}
                    <div>
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">CONTACT US</div>
                        <div className="space-y-4">
                            <a href="tel:+917010340494" className="flex items-center gap-3 text-sm font-bold text-slate-400 hover:text-blue-500 transition-colors">
                                <Phone className="w-4 h-4" /> +91 70103 40494
                            </a>
                            <a href="tel:+917558133039" className="flex items-center gap-3 text-sm font-bold text-slate-400 hover:text-blue-500 transition-colors">
                                <Phone className="w-4 h-4" /> +91 75581 33039
                            </a>
                            <a href="mailto:techtycoondigitalsolutions@gmail.com" className="flex items-center gap-3 text-sm font-bold text-slate-400 hover:text-blue-500 transition-colors break-all">
                                <Mail className="w-4 h-4 shrink-0" /> techtycoondigitalsolutions@gmail.com
                            </a>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/5">
                            <a href="/privacy.html" className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] hover:text-slate-300 transition-colors">
                                Privacy Policy
                            </a>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5 text-center text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">
                    © 2026 Tech Tycoon Digital Solutions. All Rights Reserved.
                </div>
            </div>
        </footer>
    );
};

export default UpscaleFooter;
