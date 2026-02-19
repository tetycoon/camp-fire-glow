import React from "react";
import { GraduationCap, Zap, Briefcase, Rocket, DollarSign } from "lucide-react";

const benefits = [
  {
    icon: GraduationCap,
    title: "Academic Excellence",
    desc: "Strengthen fundamentals with AI-powered learning techniques that accelerate your studies.",
    iconClass: "icon-box-cyan",
    iconColor: "text-primary",
    accent: "hsl(199 100% 55%)",
  },
  {
    icon: Zap,
    title: "Productivity Boost",
    desc: "Automate tasks and 10x your output with the best AI tools available today.",
    iconClass: "icon-box-orange",
    iconColor: "text-orange-400",
    accent: "hsl(25 100% 60%)",
  },
  {
    icon: Briefcase,
    title: "Career Skills",
    desc: "Build an AI-powered portfolio that stands out to top employers and recruiters.",
    iconClass: "icon-box-purple",
    iconColor: "text-purple-400",
    accent: "hsl(265 85% 65%)",
  },
  {
    icon: Rocket,
    title: "Entrepreneurship",
    desc: "Launch AI-driven side projects and startups with confidence and a proven framework.",
    iconClass: "icon-box-green",
    iconColor: "text-emerald-400",
    accent: "hsl(142 70% 50%)",
  },
  {
    icon: DollarSign,
    title: "Side Hustles",
    desc: "Monetize your AI skills through freelancing, consulting, and digital products.",
    iconClass: "icon-box-cyan",
    iconColor: "text-cyan-400",
    accent: "hsl(183 100% 55%)",
  },
];

const WhySection: React.FC = () => {
  return (
    <section id="why" className="section-border py-24 px-4 relative">
      <div className="absolute inset-0 grid-bg opacity-20" />
      {/* Colorful background blobs */}
      <div className="absolute top-20 left-10 w-80 h-80 rounded-full blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, hsl(265 85% 65% / 0.08), transparent 70%)" }} />
      <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, hsl(25 100% 60% / 0.08), transparent 70%)" }} />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="section-label mb-4 mx-auto w-fit">✦ The Advantage</div>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-foreground mb-4">
            Why This <span className="text-gradient">Bootcamp?</span>
          </h2>
          <p className="font-body text-muted-foreground max-w-xl mx-auto">
            A comprehensive 30-day journey to master AI — from fundamentals to real-world applications
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b, i) => (
            <div key={i} className="card-glow rounded-2xl p-8 flex flex-col gap-4 group relative overflow-hidden">
              {/* Subtle accent glow on hover */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 0% 0%, ${b.accent}15, transparent 60%)` }} />
              <div className={`w-12 h-12 rounded-xl ${b.iconClass} flex items-center justify-center`}>
                <b.icon className={`w-6 h-6 ${b.iconColor}`} />
              </div>
              <h3 className="font-display text-base font-bold text-foreground">{b.title}</h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
            </div>
          ))}

          {/* Wide hero card */}
          <div className="card-glow rounded-2xl p-8 sm:col-span-2 lg:col-span-1 flex flex-col justify-center gap-4 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, hsl(199 100% 55% / 0.12), hsl(265 85% 65% / 0.08), hsl(222 40% 7%))", border: "1px solid hsl(199 100% 55% / 0.3)" }}>
            <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ background: "radial-gradient(circle at 80% 20%, hsl(265 85% 65% / 0.12), transparent 60%)" }} />
            <div className="font-display text-7xl font-black text-gradient relative z-10">30</div>
            <p className="font-display text-sm font-bold text-foreground relative z-10">Days to Transform</p>
            <p className="font-body text-sm text-muted-foreground relative z-10">From zero to AI-powered professional in one intensive month.</p>
          </div>
        </div>

        <div className="text-center mt-12">
          <button
            onClick={() => document.getElementById("register")?.scrollIntoView({ behavior: "smooth" })}
            className="btn-glow text-primary-foreground font-display text-sm font-bold px-10 py-4 rounded-full tracking-widest"
          >
            🚀 SECURE YOUR SEAT
          </button>
        </div>
      </div>
    </section>
  );
};

export default WhySection;
