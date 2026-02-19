import React from "react";
import heroBg from "@/assets/hero-bg.jpg";
import { ChevronDown } from "lucide-react";

const HeroSection: React.FC = () => {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      <div className="absolute inset-0 bg-background/70" />
      <div className="absolute inset-0 grid-bg opacity-40" />

      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/10 blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-secondary/10 blur-3xl animate-float" style={{ animationDelay: "2s" }} />

      <div className="relative z-10 max-w-5xl mx-auto">
        <p className="font-body text-xs sm:text-sm tracking-[0.3em] text-primary mb-6 uppercase font-semibold">
          Tech Tycoon Digital Solutions
        </p>

        <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-black leading-tight mb-6">
          <span className="text-gradient glow-text">AI Summer</span>
          <br />
          <span className="text-foreground">Bootcamp 2026</span>
        </h1>

        <p className="font-body text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          The future belongs to students who understand AI early. Master the tools shaping tomorrow — in just 30 days.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => scrollTo("register")}
            className="btn-glow text-primary-foreground font-display text-sm font-bold px-8 py-4 rounded-full tracking-widest w-full sm:w-auto"
          >
            REGISTER NOW
          </button>
          <button
            onClick={() => scrollTo("modules")}
            className="font-display text-sm font-bold px-8 py-4 rounded-full tracking-widest border border-border text-foreground hover:border-primary/50 hover:text-primary transition-all w-full sm:w-auto"
          >
            EXPLORE MODULES
          </button>
        </div>

        {/* Stats row */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 sm:gap-16">
          {[
            { value: "30", label: "Days" },
            { value: "3hrs", label: "Per Day" },
            { value: "9", label: "Modules" },
            { value: "₹3,999", label: "All Inclusive" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-display text-2xl sm:text-3xl font-bold text-gradient-cyan">{stat.value}</div>
              <div className="font-body text-xs text-muted-foreground mt-1 tracking-wider uppercase">{stat.label}</div>
            </div>
          ))}
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
