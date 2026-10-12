import React, { useState, useEffect } from "react";
import logoImg from "../../assets/tech_tycoon_logo_llp.png";
import { Sparkles, Calendar, Phone, Menu, X, ArrowRight, Video } from "lucide-react";

interface ConsultingNavbarProps {
  onBookClick: () => void;
}

const ConsultingNavbar: React.FC<ConsultingNavbarProps> = ({ onBookClick }) => {
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
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white text-[11px] sm:text-xs py-2 px-3 text-center font-medium border-b border-indigo-900/40 relative z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
          <span className="inline-flex items-center gap-1.5 bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px]">
            <Sparkles className="w-3 h-3 text-amber-400" /> PRIVATE 1-ON-1
          </span>
          <span className="font-semibold text-slate-200">
            Personalized AI Guidance for Business & Career • ₹2,500 / 1 Hour
          </span>
          <span className="hidden md:inline-block text-emerald-400 font-bold">
            • 60 Mins Direct Zoom/Meet Call
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
              onClick={() => scrollTo("tracks")}
              className="text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
            >
              Consulting Tracks
            </button>
            <button
              onClick={() => scrollTo("how-it-works")}
              className="text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollTo("mentor")}
              className="text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
            >
              Your Consultant
            </button>
            <button
              onClick={() => scrollTo("faq")}
              className="text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
            >
              FAQ
            </button>
          </nav>

          {/* CTA & Mobile Trigger */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={onBookClick}
              className="px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 hover:from-indigo-900 hover:to-indigo-800 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Book 1-on-1 • ₹2,500</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 shadow-xl">
            <button
              onClick={() => scrollTo("tracks")}
              className="block w-full text-left py-2 text-xs font-bold text-slate-700 hover:text-indigo-600"
            >
              Consulting Tracks
            </button>
            <button
              onClick={() => scrollTo("how-it-works")}
              className="block w-full text-left py-2 text-xs font-bold text-slate-700 hover:text-indigo-600"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollTo("mentor")}
              className="block w-full text-left py-2 text-xs font-bold text-slate-700 hover:text-indigo-600"
            >
              Your Consultant
            </button>
            <button
              onClick={() => scrollTo("faq")}
              className="block w-full text-left py-2 text-xs font-bold text-slate-700 hover:text-indigo-600"
            >
              Frequently Asked Questions
            </button>
            <div className="pt-2">
              <button
                onClick={onBookClick}
                className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <span>Book 1-on-1 Consultation (₹2,500)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default ConsultingNavbar;
