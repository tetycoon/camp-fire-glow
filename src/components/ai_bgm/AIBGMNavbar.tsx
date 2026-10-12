import React, { useState, useEffect } from "react";
import { Sparkles, Menu, X, ArrowRight, Lock } from "lucide-react";
import logoImg from "../../assets/tech_tycoon_logo_llp.png";

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
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 text-blue-950 text-[10px] sm:text-xs font-semibold py-1.5 sm:py-2 px-3 sm:px-4 border-b border-blue-100 text-center flex items-center justify-center gap-1.5 sm:gap-2 relative z-50">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-600 text-white font-black uppercase tracking-wider text-[9px] sm:text-[10px] shadow-sm">
          <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-300" /> NEW
        </span>
        <span className="hidden sm:inline text-slate-700">
          Advance AI-Business Generative Model (AI-BGM) • 20+ Hours • Lifetime Access • Continuous AI Updates
        </span>
        <span className="sm:hidden text-slate-700 truncate max-w-[190px]">
          Advance AI-BGM • Continuous AI Updates
        </span>
        <button
          onClick={onRegisterClick}
          className="ml-1 sm:ml-2 font-black text-blue-700 hover:text-blue-900 underline decoration-blue-400 hover:decoration-blue-700 text-[10px] sm:text-[11px] transition-colors whitespace-nowrap"
        >
          Eligibility &rarr;
        </button>
      </div>

      {/* Main Sticky Navbar */}
      <header
        className={`sticky top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-xl border-b border-slate-200/90 shadow-sm py-2 sm:py-2.5"
            : "bg-white/90 backdrop-blur-md border-b border-slate-100 py-2.5 sm:py-3.5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <a href="/" className="flex items-center gap-2.5 sm:gap-3 group">
              <img 
                src={logoImg} 
                alt="Tech Tycoon Digital Solution LLP" 
                className="h-8 sm:h-10 w-auto object-contain transition-transform group-hover:scale-105 flex-shrink-0" 
              />
              <div className="flex flex-col text-left">
                <span className="text-xs sm:text-base font-black tracking-wider text-slate-900 uppercase leading-none whitespace-nowrap">
                  TECH TYCOON
                </span>
                <span className="text-[8px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-tight mt-1 whitespace-nowrap">
                  Digital Solution LLP
                </span>
              </div>
            </a>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7">
            <button
              onClick={() => scrollTo("philosophy")}
              className="text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
            >
              Business Perspective
            </button>
            <button
              onClick={() => scrollTo("bmc-9-principles")}
              className="text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1.5"
            >
              <span>9 BMC Principles</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            </button>
            <button
              onClick={() => scrollTo("curriculum")}
              className="text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
            >
              20+ Hr Curriculum
            </button>
            <button
              onClick={() => scrollTo("living-llm")}
              className="text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
            >
              Continuous AI Updates
            </button>
            <button
              onClick={() => scrollTo("trainer")}
              className="text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
            >
              Mentor
            </button>
            <button
              onClick={() => scrollTo("faq")}
              className="text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
            >
              FAQ
            </button>
          </nav>

          {/* Right Action CTA */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onRegisterClick}
              className="group relative inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-black text-[11px] sm:text-xs uppercase tracking-wider text-white overflow-hidden shadow-md shadow-blue-500/25 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 hover:scale-[1.03] active:scale-95 transition-all duration-300 border border-blue-400/30 whitespace-nowrap"
            >
              <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300" />
              <span className="sm:hidden">Unlock Pricing</span>
              <span className="hidden sm:inline">Unlock Pricing & Register</span>
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-100 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 mt-3 space-y-3 shadow-xl">
            <button
              onClick={() => scrollTo("philosophy")}
              className="block w-full text-left py-2 text-sm font-bold text-slate-700 hover:text-blue-600 border-b border-slate-100"
            >
              Business Perspective
            </button>
            <button
              onClick={() => scrollTo("bmc-9-principles")}
              className="block w-full text-left py-2 text-sm font-bold text-slate-700 hover:text-blue-600 border-b border-slate-100"
            >
              9 Core BMC Principles
            </button>
            <button
              onClick={() => scrollTo("curriculum")}
              className="block w-full text-left py-2 text-sm font-bold text-slate-700 hover:text-blue-600 border-b border-slate-100"
            >
              20+ Hours Course Curriculum
            </button>
            <button
              onClick={() => scrollTo("living-llm")}
              className="block w-full text-left py-2 text-sm font-bold text-slate-700 hover:text-blue-600 border-b border-slate-100"
            >
              Continuous AI Updates
            </button>
            <button
              onClick={() => scrollTo("trainer")}
              className="block w-full text-left py-2 text-sm font-bold text-slate-700 hover:text-blue-600 border-b border-slate-100"
            >
              Mentor & Leadership
            </button>
            <button
              onClick={() => scrollTo("faq")}
              className="block w-full text-left py-2 text-sm font-bold text-slate-700 hover:text-blue-600 border-b border-slate-100"
            >
              FAQ
            </button>
            <div className="pt-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onRegisterClick) onRegisterClick();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-xl text-sm uppercase tracking-wider shadow-lg shadow-blue-500/20"
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
