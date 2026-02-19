import React from "react";
import { GraduationCap, Zap, Briefcase, Rocket, DollarSign } from "lucide-react";

const benefits = [
  {
    icon: GraduationCap,
    title: "Academic Excellence",
    desc: "Strengthen fundamentals with AI-powered learning techniques that accelerate your studies.",
  },
  {
    icon: Zap,
    title: "Productivity Boost",
    desc: "Automate tasks and 10x your output with the best AI tools available today.",
  },
  {
    icon: Briefcase,
    title: "Career Skills",
    desc: "Build an AI-powered portfolio that stands out to top employers and recruiters.",
  },
  {
    icon: Rocket,
    title: "Entrepreneurship",
    desc: "Launch AI-driven side projects and startups with confidence and a proven framework.",
  },
  {
    icon: DollarSign,
    title: "Side Hustles",
    desc: "Monetize your AI skills through freelancing, consulting, and digital products.",
  },
];

const WhySection: React.FC = () => {
  return (
    <section id="why" className="section-border py-24 px-4 relative">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <p className="font-body text-xs tracking-[0.3em] text-primary uppercase font-semibold mb-3">The Advantage</p>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-foreground mb-4">
            Why This <span className="text-gradient">Bootcamp?</span>
          </h2>
          <p className="font-body text-muted-foreground max-w-xl mx-auto">
            A comprehensive 30-day journey to master AI — from fundamentals to real-world applications
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b, i) => (
            <div key={i} className="card-glow rounded-2xl p-8 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <b.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-base font-bold text-foreground">{b.title}</h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
            </div>
          ))}

          {/* Wide card */}
          <div className="card-glow rounded-2xl p-8 sm:col-span-2 lg:col-span-1 flex flex-col justify-center gap-4 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30">
            <div className="font-display text-5xl font-black text-gradient">30</div>
            <p className="font-display text-sm font-bold text-foreground">Days to Transform</p>
            <p className="font-body text-sm text-muted-foreground">From zero to AI-powered professional in one intensive month.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhySection;
