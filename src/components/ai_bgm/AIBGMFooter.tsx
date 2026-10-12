import React from "react";
import { ArrowUp } from "lucide-react";
import logoImg from "../../assets/tech_tycoon_logo_llp.png";

const AIBGMFooter: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-white border-t border-slate-200 text-slate-600 text-xs py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand & Logo */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <div className="flex items-center gap-3 mb-2">
            <img 
              src={logoImg} 
              alt="Tech Tycoon Digital Solution LLP" 
              className="h-10 w-auto object-contain" 
            />
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-extrabold">
              AI-BGM Executive Suite
            </span>
          </div>
          <p className="text-slate-500 max-w-sm">
            Advance AI-Business Generative Model • Empowering the next generation of AI-driven business leaders.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-slate-600 font-medium">
          <a href="/privacy" className="hover:text-blue-600 transition-colors">
            Privacy Policy
          </a>
          <a href="/privacy" className="hover:text-blue-600 transition-colors">
            Terms of Service
          </a>
          <a href="https://wa.me/917558133039" target="_blank" rel="noreferrer" className="hover:text-emerald-600 transition-colors">
            Direct Support WhatsApp
          </a>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-bold transition-colors"
          >
            <span>Top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-100 text-center text-slate-500 text-[11px] space-y-2">
        <p>
          © {new Date().getFullYear()} Tech Tycoon Digital Solutions LLP. All Rights Reserved. "Advance AI-Business Generative Model" (AI-BGM) is a proprietary education program and LLM software system.
        </p>
        <p>
          Disclaimer: Results depend on personal commitment and execution of business fundamentals. Tech Tycoon provides high-level frameworks, continuous LLM software access, and actionable business strategies.
        </p>
      </div>
    </footer>
  );
};

export default AIBGMFooter;
