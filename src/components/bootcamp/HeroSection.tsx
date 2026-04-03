import React from "react";
import heroBg from "@/assets/hero-bg.jpg";
import { ChevronDown, Sparkles } from "lucide-react";
import { useRegisterModal } from "./RegisterModalContext";

const HeroSection: React.FC = () => {
  const { openRegisterModal } = useRegisterModal();
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 pt-20 sm:pt-24 pb-12 sm:pb-16 overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      <div className="absolute inset-0 bg-background/65" />
      <div className="absolute inset-0 grid-bg opacity-30" />

      {/* Vivid glowing orbs */}
      <div className="absolute top-1/4 left-1/5 w-72 h-72 rounded-full blur-3xl animate-float opacity-50 sm:opacity-100" style={{ background: "radial-gradient(circle, hsl(199 100% 55% / 0.25), transparent 70%)" }} />
      <div className="absolute bottom-1/3 right-1/5 w-96 h-96 rounded-full blur-3xl animate-float opacity-40 sm:opacity-100" style={{ animationDelay: "2s", background: "radial-gradient(circle, hsl(265 85% 65% / 0.2), transparent 70%)" }} />
      <div className="absolute top-2/3 left-1/3 w-64 h-64 rounded-full blur-3xl animate-float opacity-30 sm:opacity-100" style={{ animationDelay: "4s", background: "radial-gradient(circle, hsl(25 100% 60% / 0.15), transparent 70%)" }} />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Attention badge */}
        <div className="inline-flex items-center gap-1.5 sm:gap-2 mb-4 sm:mb-8 px-3 sm:px-5 py-1.5 sm:py-2 rounded-full border border-primary/40 bg-gradient-to-r from-primary/15 to-secondary/10">
          <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
          <span className="font-body text-[0.6rem] sm:text-xs tracking-[0.2em] sm:tracking-[0.25em] text-primary uppercase font-semibold">
            Tech Tycoon Digital Solutions · Est. 2026
          </span>
          <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-secondary" style={{ color: "hsl(265 85% 65%)" }} />
        </div>

        <h1 className="font-display text-[2.5rem] leading-[1.05] sm:text-7xl lg:text-8xl font-black sm:leading-[1.1] mb-4 sm:mb-6 px-2">
          <span className="text-gradient glow-text">AI Summer</span>
          <br />
          <span className="text-foreground">Bootcamp</span>
          <span className="text-gradient-orange"> 2026</span>
        </h1>

        <p className="font-body text-sm sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-10 leading-relaxed px-2 sm:px-4">
          The future belongs to students who understand AI early. Master the tools shaping tomorrow — in just{" "}
          <span className="text-gradient font-semibold">30 days.</span>
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:gap-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full px-4">
            <button
              onClick={openRegisterModal}
              className="btn-glow text-primary-foreground font-display text-sm sm:text-sm font-bold px-8 py-3.5 sm:py-4 rounded-full tracking-widest w-full sm:w-auto shadow-lg"
            >
              🚀 REGISTER NOW
            </button>
            <button
              onClick={() => scrollTo("modules")}
              className="font-display text-sm sm:text-sm font-bold px-8 py-3.5 sm:py-4 rounded-full tracking-widest border border-primary/30 text-foreground hover:bg-primary/10 transition-all w-full sm:w-auto backdrop-blur-sm"
            >
              EXPLORE MODULES
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          {[
            { value: "30", label: "Days", color: "text-gradient" },
            { value: "3hrs", label: "Per Day", color: "text-gradient-orange" },
            { value: "12", label: "Modules", color: "text-gradient-green" },
          ].map((stat) => (
            <div key={stat.label} className="text-center px-6 py-4 rounded-2xl" style={{ background: "hsl(222 40% 10% / 0.8)", border: "1px solid hsl(199 100% 55% / 0.15)" }}>
              <div className={`font-display text-2xl sm:text-3xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="font-body text-xs text-muted-foreground mt-1 tracking-wider uppercase">{stat.label}</div>
            </div>
          ))}
          {/* Special pricing card */}
          <div className="text-center px-6 py-4 rounded-2xl relative overflow-hidden" style={{ background: "linear-gradient(135deg, hsl(142 70% 50% / 0.1), hsl(199 100% 55% / 0.08))", border: "1px solid hsl(142 70% 50% / 0.3)", boxShadow: "0 0 20px hsl(142 70% 50% / 0.1)" }}>
            <div className="flex items-baseline justify-center gap-2">
              <span className="font-display text-base sm:text-lg text-muted-foreground/60 line-through">₹14,999</span>
              <span className="font-display text-2xl sm:text-3xl font-bold text-gradient-cyan">₹9,999</span>
            </div>
            <div className="font-body text-xs text-emerald-400 mt-1 tracking-wider uppercase font-semibold">🔥 Early Bird Offer</div>
            <div className="font-body mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: "hsl(0 80% 55% / 0.15)", color: "hsl(0 80% 65%)", border: "1px solid hsl(0 80% 55% / 0.25)" }}>
              Valid till April 25
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => scrollTo("why")}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground hover:text-primary transition-colors animate-bounce"
      >
        <ChevronDown className="w-6 h-6" />
      </button>
    </section>
  );
};

export default HeroSection;
