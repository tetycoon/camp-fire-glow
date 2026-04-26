import React from "react";
import { Zap, Twitter, Instagram, Linkedin } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="section-border py-12 px-4 relative overflow-hidden">
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, hsl(222 47% 5%), hsl(222 40% 4%))" }} />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] rounded-full blur-3xl pointer-events-none" style={{ background: "radial-gradient(ellipse, hsl(199 100% 55% / 0.05), transparent 70%)" }} />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="rounded-full p-1.5 bg-brand-500/10 border border-brand-500/20">
              <Zap className="w-4 h-4 text-brand-500" />
            </div>
            <span className="font-display text-sm font-bold tracking-[0.2em] text-foreground uppercase">TECH TYCOON DIGITAL SOLUTIONS</span>
          </div>

          <div className="flex items-center gap-3">
            {[Twitter, Instagram, Linkedin].map((Icon, i) => (
              <div key={i} className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-110 bg-white/5 border border-white/10 hover:border-brand-500/40 hover:bg-brand-500/10 group">
                <Icon className="w-4 h-4 text-muted-foreground group-hover:text-brand-500 transition-colors" />
              </div>
            ))}
          </div>

          <p className="font-body text-xs text-muted-foreground text-center">
            © 2026 Tech Tycoon Digital Solutions. All rights reserved.
          </p>
        </div>

        <div className="mt-8 pt-6 text-center border-t border-white/5">
          <p className="font-body text-[10px] text-muted-foreground/60 tracking-widest uppercase font-bold">
            AI Summer Bootcamp 2026 · Powered by Tech Tycoon Digital Solutions ·{" "}
            <span className="text-brand-500">Shaping Tomorrow's Leaders</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
