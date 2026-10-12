import React from "react";
import { ShieldCheck, ArrowUp } from "lucide-react";

const AIBGMFooter: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 text-xs py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-black text-white text-base tracking-tight">TECH TYCOON</span>
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">
              AI-BGM Executive Suite
            </span>
          </div>
          <p className="text-slate-500 max-w-sm">
            Advance AI-Business Generative Model • Empowering the next generation of AI-driven business leaders.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-slate-400">
          <a href="/privacy" className="hover:text-white transition-colors">
            Privacy Policy
          </a>
          <a href="/privacy" className="hover:text-white transition-colors">
            Terms of Service
          </a>
          <a href="https://wa.me/917558133039" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
            Direct Support WhatsApp
          </a>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-bold transition-colors"
          >
            <span>Top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-900/80 text-center text-slate-600 text-[11px] space-y-2">
        <p>
          © {new Date().getFullYear()} Tech Tycoon Digital Solutions. All Rights Reserved. "Advance AI-Business Generative Model" (AI-BGM) is a proprietary education program and LLM software system.
        </p>
        <p>
          Disclaimer: Results depend on personal commitment and execution of business fundamentals. Tech Tycoon provides high-level frameworks, continuous LLM software access, and actionable business strategies.
        </p>
      </div>
    </footer>
  );
};

export default AIBGMFooter;
