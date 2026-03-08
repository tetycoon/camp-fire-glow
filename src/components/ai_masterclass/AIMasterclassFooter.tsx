import React from "react";
import { Linkedin, Instagram, Globe, Mail } from "lucide-react";

const AIMasterclassFooter: React.FC = () => {
    return (
        <footer className="py-24 px-4 relative overflow-hidden border-t border-white/5 bg-background">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-3 mb-6">
                            <img src="/logo.png" alt="Tech Tycoon" className="w-10 h-10 rounded-full" />
                            <span className="font-display text-xl font-bold tracking-wider text-gradient-green">TECH TYCOON</span>
                        </div>
                        <p className="font-body text-muted-foreground leading-relaxed max-w-sm mb-8">
                            Empowering professionals, freelancers, and entrepreneurs with
                            cutting-edge AI skills to lead in the digital era.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="https://www.techtycoon.in/" target="_blank" className="p-3 rounded-xl bg-muted/50 hover:bg-emerald-500/20 transition-colors border border-white/5">
                                <Globe className="w-5 h-5 text-muted-foreground hover:text-emerald-400" />
                            </a>
                            <a href="https://www.linkedin.com/in/antony-praveen-techtycoon" target="_blank" className="p-3 rounded-xl bg-muted/50 hover:bg-emerald-500/20 transition-colors border border-white/5">
                                <Linkedin className="w-5 h-5 text-muted-foreground hover:text-emerald-400" />
                            </a>
                            <a href="https://www.instagram.com/amiable_antony" target="_blank" className="p-3 rounded-xl bg-muted/50 hover:bg-emerald-500/20 transition-colors border border-white/5">
                                <Instagram className="w-5 h-5 text-muted-foreground hover:text-emerald-400" />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-display text-sm font-bold uppercase tracking-[0.2em] mb-8 text-foreground">Explore</h4>
                        <ul className="space-y-4 font-body text-sm text-muted-foreground">
                            <li><a href="/" className="hover:text-emerald-400 transition-colors">AI Bootcamp</a></li>
                            <li><a href="/college" className="hover:text-emerald-400 transition-colors">College Program</a></li>
                            <li><a href="#about" className="hover:text-emerald-400 transition-colors">About Masterclass</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-display text-sm font-bold uppercase tracking-[0.2em] mb-8 text-foreground">Contact</h4>
                        <div className="flex items-center gap-3 text-muted-foreground mb-4">
                            <Mail className="w-4 h-4 text-emerald-400" />
                            <a href="mailto:hello@techtycoon.in" className="hover:text-emerald-400 text-sm font-body">hello@techtycoon.in</a>
                        </div>
                        <p className="font-body text-xs text-muted-foreground/60 leading-relaxed uppercase tracking-widest mt-6">
                            © 2026 Tech Tycoon Digital Solutions<br />All Rights Reserved
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default AIMasterclassFooter;
