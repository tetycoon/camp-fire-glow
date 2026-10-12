import React from "react";
import { ArrowUp } from "lucide-react";
import logoImg from "../../assets/tech_tycoon_logo_llp.png";

const AIBGMFooter: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-white border-t border-slate-200 text-slate-600 text-xs py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6">
        {/* Brand & Logo */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <div className="flex items-center gap-2.5 sm:gap-3 mb-2">
            <img 
              src={logoImg} 
              alt="Tech Tycoon Digital Solution LLP" 
              className="h-8 sm:h-10 w-auto object-contain flex-shrink-0" 
            />
            <div className="flex flex-col text-left justify-center">
              <span className="text-xs sm:text-base font-black tracking-wider text-slate-900 uppercase leading-none whitespace-nowrap">
                TECH TYCOON
              </span>
              <span className="text-[7.5px] sm:text-[9.5px] font-bold text-slate-500 uppercase tracking-wider leading-none mt-[1px] whitespace-nowrap">
                Digital Solution LLP
              </span>
            </div>
          </div>
          <p className="text-slate-500 text-[11px] sm:text-xs max-w-sm">
            Advance AI-Business Generative Model • Empowering the next generation of AI-driven business leaders.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-slate-600 font-medium text-[11px] sm:text-xs">
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
            <ArrowUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-6 pt-4 sm:mt-8 sm:pt-6 border-t border-slate-100 text-center text-slate-500 text-[10px] sm:text-[11px] space-y-1.5 sm:space-y-2">
        <p>
          © {new Date().getFullYear()} Tech Tycoon Digital Solutions LLP. All Rights Reserved. "Advance AI-Business Generative Model" (AI-BGM) is a proprietary executive education program.
        </p>
        <p>
          Disclaimer: Results depend on personal commitment and execution of business fundamentals. Tech Tycoon provides high-level frameworks, continuous AI updates, and actionable business strategies.
        </p>
      </div>
    </footer>
  );
};

export default AIBGMFooter;
