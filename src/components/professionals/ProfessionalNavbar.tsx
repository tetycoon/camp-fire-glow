import React, { useState, useEffect } from "react";
import logoImg from "../../assets/tech_tycoon_logo_llp.png";
import { 
  Sparkles, 
  Menu, 
  X, 
  ArrowRight, 
  Briefcase, 
  Award,
  Zap,
  TrendingUp,
  ShieldCheck
} from "lucide-react";

interface ProfessionalNavbarProps {
  onRegisterClick: () => void;
}

const ProfessionalNavbar: React.FC<ProfessionalNavbarProps> = ({ onRegisterClick }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Top Professional Urgency / Trust Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white text-[11px] sm:text-xs py-2 px-3 text-center font-medium border-b border-indigo-900/40 relative z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
          <span className="inline-flex items-center gap-1.5 bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px]">
            <Sparkles className="w-3 h-3 text-amber-400" /> 100% NON-TECH
          </span>
          <span className="font-semibold text-slate-200">
            Advance AI for Non-Tech Working Professionals • Zero Coding Required
          </span>
          <span className="hidden md:inline-block text-emerald-400 font-bold">
            • 3,200+ Corporate Learners Trained
          </span>
        </div>
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
              <div className="flex flex-col text-left justify-center">
                <span className="text-xs sm:text-base font-black tracking-wider text-slate-900 uppercase leading-none whitespace-nowrap">
                  TECH TYCOON
                </span>
                <span className="text-[7.5px] sm:text-[9.5px] font-bold text-slate-500 uppercase tracking-wider leading-none -mt-[3px] sm:-mt-[4.5px] whitespace-nowrap">
                  Digital Solution LLP
                </span>
              </div>
            </a>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7">
            <button
              onClick={() => scrollTo("career-impact")}
              className="text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
            >
              Career Impact
            </button>
            <button
              onClick={() => scrollTo("roles")}
              className="text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors flex items-center gap-1.5"
            >
              <span>Who It's For</span>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            </button>
            <button
              onClick={() => scrollTo("curriculum")}
              className="text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
            >
              7 Core Modules
            </button>
            <button
              onClick={() => scrollTo("tools")}
              className="text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
            >
              Tools Mastered
            </button>
            <button
              onClick={() => scrollTo("trainer")}
              className="text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
            >
              Mentor
            </button>
            <button
              onClick={() => scrollTo("faq")}
              className="text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
            >
              FAQ
            </button>
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={onRegisterClick}
              className="relative group overflow-hidden px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/35 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2 whitespace-nowrap"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Enroll Now</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={onRegisterClick}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-[11px] uppercase tracking-wider flex items-center gap-1 shadow-sm"
            >
              <span>Enroll</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-slate-700 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-100 bg-white/95 backdrop-blur-xl px-4 py-4 space-y-3 shadow-xl">
            <button
              onClick={() => scrollTo("career-impact")}
              className="w-full text-left py-2 text-xs font-bold text-slate-700 hover:text-indigo-600 flex items-center justify-between"
            >
              <span>Career Impact</span>
              <TrendingUp className="w-4 h-4 text-slate-400" />
            </button>
            <button
              onClick={() => scrollTo("roles")}
              className="w-full text-left py-2 text-xs font-bold text-slate-700 hover:text-indigo-600 flex items-center justify-between"
            >
              <span>Who It's For</span>
              <Briefcase className="w-4 h-4 text-slate-400" />
            </button>
            <button
              onClick={() => scrollTo("curriculum")}
              className="w-full text-left py-2 text-xs font-bold text-slate-700 hover:text-indigo-600 flex items-center justify-between"
            >
              <span>7 Core Modules</span>
              <Award className="w-4 h-4 text-slate-400" />
            </button>
            <button
              onClick={() => scrollTo("tools")}
              className="w-full text-left py-2 text-xs font-bold text-slate-700 hover:text-indigo-600 flex items-center justify-between"
            >
              <span>Tools Mastered</span>
              <Zap className="w-4 h-4 text-slate-400" />
            </button>
            <button
              onClick={() => scrollTo("trainer")}
              className="w-full text-left py-2 text-xs font-bold text-slate-700 hover:text-indigo-600 flex items-center justify-between"
            >
              <span>Mentor Profile</span>
              <ShieldCheck className="w-4 h-4 text-slate-400" />
            </button>
            <button
              onClick={() => scrollTo("faq")}
              className="w-full text-left py-2 text-xs font-bold text-slate-700 hover:text-indigo-600 flex items-center justify-between"
            >
              <span>Frequently Asked Questions</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>

            <div className="pt-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onRegisterClick();
                }}
                className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20"
              >
                <span>Unlock VIP Enrollment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default ProfessionalNavbar;
