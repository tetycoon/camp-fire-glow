import React from "react";
import { Zap } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="section-border py-12 px-4 bg-muted/20">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="rounded-full p-1.5 bg-primary/10 border border-primary/20">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <span className="font-display text-sm font-bold text-primary tracking-wider">TECH TYCOON DIGITAL SOLUTIONS</span>
        </div>
        <p className="font-body text-xs text-muted-foreground text-center">
          © 2026 Tech Tycoon Digital Solutions. All rights reserved.
        </p>
        <p className="font-body text-xs text-muted-foreground">AI Summer Bootcamp 2026</p>
      </div>
    </footer>
  );
};

export default Footer;
