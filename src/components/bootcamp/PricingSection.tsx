import React, { useState } from "react";
import { Calendar, Users, CheckCircle2 } from "lucide-react";

const batches = [
  { id: "batch1", name: "Batch 1", dates: "April 1–30, 2026" },
  { id: "batch2", name: "Batch 2", dates: "May 1–30, 2026" },
];

const features = [
  "Complete 30-day program",
  "10am–1pm or 6pm–9pm sessions",
  "Live on Zoom",
  "Industry-recognized certificate",
  "Guest expert sessions",
  "Inclusive of GST",
];

const PricingSection: React.FC = () => {
  const [selected, setSelected] = useState<string | null>(null);

  const scrollToRegister = () => {
    document.getElementById("register")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="pricing" className="section-border py-24 px-4 bg-muted/20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <p className="font-body text-xs tracking-[0.3em] text-primary uppercase font-semibold mb-3">Investment</p>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-foreground mb-4">
            Batches & <span className="text-gradient">Pricing</span>
          </h2>
        </div>

        <div className="card-glow rounded-3xl p-8 sm:p-12">
          {/* Batch selector */}
          <div className="flex gap-4 mb-10 flex-col sm:flex-row">
            {batches.map((b) => (
              <button
                key={b.id}
                onClick={() => setSelected(b.id)}
                className={`flex-1 p-5 rounded-2xl border-2 transition-all text-left ${
                  selected === b.id
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className={`w-5 h-5 ${selected === b.id ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={`font-display text-sm font-bold ${selected === b.id ? "text-primary" : "text-foreground"}`}>{b.name}</span>
                </div>
                <p className="font-body text-sm text-muted-foreground">{b.dates}</p>
              </button>
            ))}
          </div>

          {/* Price */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-8 mb-10">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-5xl sm:text-6xl font-black text-gradient">₹3,999</span>
              </div>
              <p className="font-body text-sm text-muted-foreground mt-1">Inclusive of GST • Complete 30-day program</p>
              <div className="flex items-center gap-2 mt-3">
                <Users className="w-4 h-4 text-primary" />
                <span className="font-body text-sm text-muted-foreground">Limited to 100 seats per batch</span>
              </div>
            </div>

            <button
              onClick={scrollToRegister}
              className="btn-glow text-primary-foreground font-display text-sm font-bold px-10 py-4 rounded-full tracking-widest whitespace-nowrap"
            >
              SECURE YOUR SEAT
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-8 border-t border-border">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="font-body text-sm text-muted-foreground">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
