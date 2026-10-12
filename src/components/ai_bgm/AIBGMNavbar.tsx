import React, { useState, useEffect } from "react";
import { Sparkles, Menu, X, ArrowRight, ShieldCheck, Lock } from "lucide-react";

interface AIBGMNavbarProps {
  onRegisterClick?: () => void;
}

const AIBGMNavbar: React.FC<AIBGMNavbarProps> = ({ onRegisterClick }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    } else if (onRegisterClick) {
      onRegisterClick();
    }
  };

  return (
    <>
      {/* Top Value Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 text-white text-[11px] sm:text-xs font-semibold py-2 px-4 border-b border-indigo-900/40 text-center flex items-center justify-center gap-2 relative z-50">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold uppercase tracking-wider text-[10px]">
          <Sparkles className="w-3 h-3 text-indigo-400" /> NEW MASTER-COHORT
        </span>
        <span className="hidden sm:inline text-slate-300">
          Advance AI-Business Generative Model (AI-BGM) • 20+ Hours • Lifetime LLM Software Access
        </span>
        <span className="sm:hidden text-slate-300">
          Advance AI-BGM • Living LLM Software
        </span>
        <button
          onClick={() => scrollTo("register")}
          className="ml-2 font-bold text-amber-300 hover:text-amber-200 underline decoration-amber-400/50 hover:decoration-amber-300 text-[11px] transition-colors"
        >
          Check Eligibility &rarr;
        </button>
      </div>

      {/* Main Sticky Navbar */}
      <header
        className={`sticky top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl py-3"
            : "bg-slate-950/70 backdrop-blur-md border-b border-slate-800/40 py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-600 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <span className="font-black text-transparent bg-clip-text bg-gradient-to-tr from-indigo-400 to-blue-200 text-lg tracking-tighter">
                    TT
                  </span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
                  TECH TYCOON
                  <span className="text-[9px] uppercase tracking-widest px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded font-bold">
                    AI-BGM
                  </span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                  Business Generative Model
                </span>
              </div>
            </a>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7">
            <button
              onClick={() => scrollTo("philosophy")}
              className="text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Business Perspective
            </button>
            <button
              onClick={() => scrollTo("bmc-9-principles")}
              className="text-xs font-semibold text-slate-300 hover:text-white transition-colors flex items-center gap-1"
            >
              <span>9 BMC Principles</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            </button>
            <button
              onClick={() => scrollTo("curriculum")}
              className="text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              20+ Hr Curriculum
            </button>
            <button
              onClick={() => scrollTo("living-llm")}
              className="text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Living LLM Updates
            </button>
            <button
              onClick={() => scrollTo("trainer")}
              className="text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Mentor
            </button>
            <button
              onClick={() => scrollTo("faq")}
              className="text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              FAQ
            </button>
          </nav>

          {/* Right Action CTA */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => scrollTo("register")}
              className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white overflow-hidden shadow-lg shadow-indigo-600/30 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:scale-105 active:scale-95 transition-all duration-300 border border-indigo-400/30"
            >
              <Lock className="w-3.5 h-3.5 text-amber-300" />
              <span>Unlock Pricing & Register</span>
              <ArrowRight className="w-3.5 h-3.5 text-indigo-200 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-900 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-slate-950/95 border-b border-slate-800 px-4 pt-3 pb-6 mt-3 space-y-3">
            <button
              onClick={() => scrollTo("philosophy")}
              className="block w-full text-left py-2 text-sm font-semibold text-slate-300 hover:text-white border-b border-slate-900"
            >
              Business Perspective
            </button>
            <button
              onClick={() => scrollTo("bmc-9-principles")}
              className="block w-full text-left py-2 text-sm font-semibold text-slate-300 hover:text-white border-b border-slate-900"
            >
              9 Core BMC Principles
            </button>
            <button
              onClick={() => scrollTo("curriculum")}
              className="block w-full text-left py-2 text-sm font-semibold text-slate-300 hover:text-white border-b border-slate-900"
            >
              20+ Hours Course Curriculum
            </button>
            <button
              onClick={() => scrollTo("living-llm")}
              className="block w-full text-left py-2 text-sm font-semibold text-slate-300 hover:text-white border-b border-slate-900"
            >
              Living LLM Software & Updates
            </button>
            <button
              onClick={() => scrollTo("trainer")}
              className="block w-full text-left py-2 text-sm font-semibold text-slate-300 hover:text-white border-b border-slate-900"
            >
              Mentor & Leadership
            </button>
            <button
              onClick={() => scrollTo("faq")}
              className="block w-full text-left py-2 text-sm font-semibold text-slate-300 hover:text-white border-b border-slate-900"
            >
              FAQ
            </button>
            <div className="pt-2">
              <button
                onClick={() => scrollTo("register")}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold rounded-xl text-sm uppercase tracking-wider"
              >
                <Lock className="w-4 h-4 text-amber-300" />
                <span>Unlock VIP Pricing</span>
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default AIBGMNavbar;
