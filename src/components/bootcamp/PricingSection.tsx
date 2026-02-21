import React, { useState } from "react";
import { Calendar, Users, CheckCircle2, Zap } from "lucide-react";

const batches = [
  { id: "batch1", name: "Batch 1", dates: "April 1–30, 2026", color: "cyan" },
  { id: "batch2", name: "Batch 2", dates: "May 1–30, 2026", color: "purple" },
];

const features = [
  { text: "Complete 30-day program", color: "text-cyan-400" },
  { text: "10am–1pm or 6pm–9pm sessions", color: "text-purple-400" },
  { text: "Live on Zoom", color: "text-orange-400" },
  { text: "Industry-recognized certificate", color: "text-emerald-400" },
  { text: "Guest expert sessions", color: "text-cyan-400" },
  { text: "Inclusive of GST", color: "text-purple-400" },
];

const PricingSection: React.FC = () => {
  const [selected, setSelected] = useState<string | null>(null);

  const scrollToRegister = () => {
    document.getElementById("register")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="pricing" className="section-border py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, hsl(222 40% 7%), hsl(222 47% 5%))" }} />
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full blur-3xl pointer-events-none" style={{ background: "radial-gradient(ellipse, hsl(199 100% 55% / 0.07), transparent 70%)" }} />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="section-label mb-4 mx-auto w-fit">💳 Investment</div>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-foreground mb-4">
            Batches & <span className="text-gradient">Pricing</span>
          </h2>
        </div>

        <div className="rounded-3xl p-8 sm:p-12 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, hsl(222 40% 10%), hsl(222 40% 7%))", border: "1px solid hsl(199 100% 55% / 0.3)", boxShadow: "0 0 60px hsl(199 100% 55% / 0.08)" }}>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, hsl(265 85% 65% / 0.1), transparent 70%)" }} />

          {/* Batch selector */}
          <div className="flex gap-4 mb-10 flex-col sm:flex-row relative z-10">
            {batches.map((b) => {
              const isSelected = selected === b.id;
              const isCyan = b.color === "cyan";
              return (
                <button
                  key={b.id}
                  onClick={() => setSelected(b.id)}
                  className="flex-1 p-5 rounded-2xl transition-all text-left"
                  style={{
                    border: isSelected
                      ? `2px solid ${isCyan ? "hsl(199 100% 55%)" : "hsl(265 85% 65%)"}`
                      : "2px solid hsl(var(--border))",
                    background: isSelected
                      ? isCyan ? "hsl(199 100% 55% / 0.1)" : "hsl(265 85% 65% / 0.1)"
                      : "transparent",
                    boxShadow: isSelected
                      ? isCyan ? "0 0 30px hsl(199 100% 55% / 0.2)" : "0 0 30px hsl(265 85% 65% / 0.2)"
                      : "none",
                  }}>
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-5 h-5" style={{ color: isSelected ? (isCyan ? "hsl(199 100% 55%)" : "hsl(265 85% 65%)") : "hsl(var(--muted-foreground))" }} />
                    <span className="font-display text-sm font-bold" style={{ color: isSelected ? (isCyan ? "hsl(199 100% 55%)" : "hsl(265 85% 65%)") : "hsl(var(--foreground))" }}>{b.name}</span>
                  </div>
                  <p className="font-body text-sm text-muted-foreground">{b.dates}</p>
                </button>
              );
            })}
          </div>

          {/* Price */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-8 mb-10 relative z-10">
            <div>
              {/* Urgency banner */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5 animate-pulse"
                style={{ background: "hsl(0 80% 55% / 0.12)", border: "1px solid hsl(0 80% 55% / 0.3)" }}>
                <span className="text-sm">🔥</span>
                <span className="font-display text-xs font-bold tracking-wider" style={{ color: "hsl(0 80% 65%)" }}>
                  EARLY BIRD OFFER — ENDS MARCH 15!
                </span>
              </div>

              <div className="flex items-baseline gap-3 mb-1">
                <span className="font-display text-2xl text-muted-foreground/50 line-through">₹9,999</span>
                <span className="font-display text-5xl sm:text-6xl font-black text-gradient">₹3,999</span>
              </div>

              {/* Savings badge */}
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full font-display text-xs font-bold"
                  style={{ background: "hsl(142 70% 50% / 0.12)", border: "1px solid hsl(142 70% 50% / 0.3)", color: "hsl(142 70% 55%)" }}>
                  <Zap className="w-3 h-3" />
                  SAVE ₹6,000
                </span>
                <span className="badge-green font-body text-xs px-3 py-1 rounded-full flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  60% OFF
                </span>
              </div>

              <p className="font-body text-sm text-muted-foreground mt-1">Inclusive of GST • Complete 30-day program</p>
              <div className="flex items-center gap-2 mt-3">
                <Users className="w-4 h-4 text-primary" />
                <span className="font-body text-sm text-muted-foreground">Limited to <span className="text-primary font-semibold">100 seats</span> per batch</span>
              </div>

              {/* Deadline reminder */}
              <div className="flex items-center gap-2 mt-3 px-4 py-2 rounded-xl"
                style={{ background: "hsl(25 100% 60% / 0.08)", border: "1px solid hsl(25 100% 60% / 0.2)" }}>
                <Calendar className="w-4 h-4 text-orange-400" />
                <span className="font-body text-xs text-orange-400 font-semibold">
                  ⏰ Price increases to ₹9,999 after March 15, 2026
                </span>
              </div>
            </div>

            <button
              onClick={scrollToRegister}
              className="btn-glow text-primary-foreground font-display text-sm font-bold px-10 py-4 rounded-full tracking-widest whitespace-nowrap"
            >
              SECURE YOUR SEAT 🚀
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-8 relative z-10" style={{ borderTop: "1px solid hsl(var(--border))" }}>
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${f.color}`} />
                <span className="font-body text-sm text-muted-foreground">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
