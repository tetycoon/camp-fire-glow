import React from "react";
import heroBg from "@/assets/hero-bg.jpg";
import { ChevronDown, Sparkles, Brain, Cpu, Rocket } from "lucide-react";
import { useRegisterModal } from "./RegisterModalContext";

const HeroSection: React.FC = () => {
  const { openRegisterModal } = useRegisterModal();
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 pt-24 sm:pt-32 pb-16 sm:pb-24 overflow-hidden">
      {/* Background Layers */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-[20s] scale-110"
        style={{ backgroundImage: `url(${heroBg})`, filter: "brightness(0.3) saturate(0.8)" }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,hsl(var(--background))_100%)] opacity-80" />
      <div className="absolute inset-0 grid-bg opacity-10" />

      {/* Advanced Animated Orbs */}
      <div className="absolute top-[15%] -left-[10%] w-[40rem] h-[40rem] rounded-full blur-[120px] animate-pulse opacity-20" style={{ background: "radial-gradient(circle, hsl(var(--primary)), transparent 60%)" }} />
      <div className="absolute bottom-[10%] -right-[10%] w-[35rem] h-[35rem] rounded-full blur-[100px] animate-pulse opacity-15" style={{ background: "radial-gradient(circle, hsl(var(--secondary)), transparent 60%)", animationDelay: "1s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50rem] h-[50rem] rounded-full blur-[150px] opacity-10 pointer-events-none" style={{ background: "radial-gradient(circle, hsl(var(--cyan)), transparent 50%)" }} />

      <div className="relative z-20 max-w-6xl mx-auto">
        {/* Elite Badge */}
        <div className="inline-flex items-center gap-3 mb-10 px-6 py-2.5 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-xl animate-float">
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-6 h-6 rounded-full border-2 border-background bg-muted flex items-center justify-center overflow-hidden">
                <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="Student" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          <span className="font-body text-[11px] sm:text-xs tracking-[0.25em] text-foreground/80 uppercase font-bold">
            Trusted by <span className="text-primary italic">500+</span> Future Tech Leaders
          </span>
        </div>

        <h1 className="font-display text-[2.8rem] leading-[1] sm:text-7xl lg:text-9xl font-[900] mb-8 tracking-tighter">
          <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">AI SUMMER</span>
          <br />
          <span className="text-gradient-cyan glow-text italic">BOOTCAMP</span>
          <span className="text-white/80"> '26</span>
        </h1>

        <p className="font-body text-base sm:text-xl text-muted-foreground/90 max-w-3xl mx-auto mb-12 leading-relaxed px-4">
          The ultimate <span className="text-white font-bold underline decoration-brand-500 underline-offset-4 decoration-2">30-day architectural deep-dive</span> into generative systems, agentic workflows, and the future of professional autonomy.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full max-w-2xl mx-auto px-4">
          <button
            onClick={openRegisterModal}
            className="group relative bg-brand-500 hover:bg-brand-600 text-white font-display text-base font-black px-12 py-5 rounded-2xl tracking-widest w-full sm:w-auto overflow-hidden transition-all shadow-2xl shadow-brand-500/30"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <span className="relative flex items-center justify-center gap-3">
              <Rocket className="w-5 h-5 animate-bounce" />
              ENQUIRE NOW
            </span>
          </button>
          <button
            onClick={() => scrollTo("modules")}
            className="font-display text-base font-bold px-12 py-5 rounded-2xl tracking-wider border border-white/20 text-white hover:bg-white/10 transition-all w-full sm:w-auto glass-panel"
          >
            ARCHITECTURE MAP
          </button>
        </div>

        {/* Feature Grid */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto">
          {[
            { icon: Brain, value: "30", label: "Learning Days", sub: "Intensive" },
            { icon: Cpu, value: "3hrs", label: "Daily Session", sub: "Live / Recorded" },
            { icon: Sparkles, value: "12+", label: "Elite Modules", sub: "Expert Crafted" },
            { 
                value: "Price", 
                label: "Enquire for Price", 
                sub: "Best in Industry",
                special: true
            },
          ].map((stat, i) => (
            <div key={i} className={`group p-6 rounded-3xl border transition-all duration-500 ${stat.special ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-white/10 bg-white/5 hover:border-primary/50'} backdrop-blur-md`}>
              {stat.icon && <stat.icon className="w-5 h-5 text-primary mb-3 mx-auto opacity-70" />}
              <div className={`font-display text-2xl sm:text-3xl font-black mb-1 ${stat.special ? 'text-emerald-400' : 'text-white'}`}>{stat.value}</div>
              <div className="font-body text-[10px] text-muted-foreground tracking-widest uppercase font-bold">{stat.label}</div>
              <div className="font-body text-[9px] text-primary/60 mt-0.5 uppercase tracking-tighter">{stat.sub}</div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => scrollTo("why")}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-muted-foreground hover:text-primary transition-all p-3 rounded-full border border-white/10 glass-panel animate-bounce"
      >
        <ChevronDown className="w-6 h-6" />
      </button>
    </section>
  );
};

export default HeroSection;
