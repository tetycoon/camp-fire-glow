import React from "react";
import { Zap, Twitter, Instagram, Linkedin } from "lucide-react";

const CollegeFooter: React.FC = () => {
    return (
        <footer className="section-border py-12 px-4 relative overflow-hidden">
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, hsl(222 47% 5%), hsl(222 40% 4%))" }} />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] rounded-full blur-3xl pointer-events-none" style={{ background: "radial-gradient(ellipse, hsl(199 100% 55% / 0.05), transparent 70%)" }} />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <div className="rounded-full p-1.5" style={{ background: "hsl(199 100% 55% / 0.12)", border: "1px solid hsl(199 100% 55% / 0.25)" }}>
                            <Zap className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-display text-sm font-bold tracking-wider text-gradient">TECH TYCOON DIGITAL SOLUTIONS</span>
                    </div>

                    <div className="flex items-center gap-3">
                        {[Twitter, Instagram, Linkedin].map((Icon, i) => (
                            <div key={i} className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-110"
                                style={{ background: "hsl(199 100% 55% / 0.1)", border: "1px solid hsl(199 100% 55% / 0.2)" }}
                                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "hsl(199 100% 55% / 0.2)"; (e.currentTarget as HTMLDivElement).style.borderColor = "hsl(199 100% 55% / 0.5)"; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "hsl(199 100% 55% / 0.1)"; (e.currentTarget as HTMLDivElement).style.borderColor = "hsl(199 100% 55% / 0.2)"; }}>
                                <Icon className="w-4 h-4 text-primary" />
                            </div>
                        ))}
                    </div>

                    <p className="font-body text-xs text-muted-foreground text-center">
                        © 2026 Tech Tycoon Digital Solutions. All rights reserved.
                    </p>
                </div>

                <div className="mt-8 pt-6 text-center" style={{ borderTop: "1px solid hsl(var(--border))" }}>
                    <p className="font-body text-xs text-muted-foreground">
                        AI Mastery Bootcamp 2026 · Powered by Tech Tycoon Digital Solutions ·{" "}
                        <span className="text-gradient font-semibold">Empowering Future Leaders</span>
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default CollegeFooter;
