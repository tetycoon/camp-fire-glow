import React from "react";
import { BookOpen, University, TrendingUp } from "lucide-react";

const audiences = [
  {
    icon: BookOpen,
    title: "School Students",
    desc: "High school learners eager to get ahead with AI skills for academics and future careers.",
    tag: "Grades 9–12",
    iconClass: "icon-box-cyan",
    iconColor: "text-cyan-400",
    badgeClass: "badge-module",
    accent: "hsl(199 100% 55%)",
  },
  {
    icon: University,
    title: "College Students",
    desc: "University students looking to boost employability and build AI-powered projects.",
    tag: "UG / PG",
    iconClass: "icon-box-purple",
    iconColor: "text-purple-400",
    badgeClass: "badge-purple",
    accent: "hsl(265 85% 65%)",
  },
  {
    icon: TrendingUp,
    title: "Entrepreneurs",
    desc: "Business professionals and aspiring founders who want to leverage AI for growth.",
    tag: "Founders & Professionals",
    iconClass: "icon-box-orange",
    iconColor: "text-orange-400",
    badgeClass: "badge-orange",
    accent: "hsl(25 100% 60%)",
  },
];

const WhoCanJoin: React.FC = () => {
  return (
    <section id="who" className="section-border py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-3xl pointer-events-none" style={{ background: "radial-gradient(ellipse, hsl(199 100% 55% / 0.06), transparent 70%)" }} />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="section-label mb-4 mx-auto w-fit">🎯 Eligibility</div>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-foreground mb-4">
            Who Can <span className="text-gradient">Join?</span>
          </h2>
          <p className="font-body text-muted-foreground">Anyone ready to level up their future with AI</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {audiences.map((a, i) => (
            <div key={i} className="card-glow rounded-2xl p-10 flex flex-col items-center text-center gap-5 group relative overflow-hidden">
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(circle at 50% 0%, ${a.accent}12, transparent 60%)` }} />
              <div className={`w-16 h-16 rounded-2xl ${a.iconClass} flex items-center justify-center relative z-10`}>
                <a.icon className={`w-8 h-8 ${a.iconColor}`} />
              </div>
              <span className={`${a.badgeClass} font-body text-xs font-semibold px-3 py-1 rounded-full relative z-10`}>{a.tag}</span>
              <h3 className="font-display text-base font-bold text-foreground relative z-10">{a.title}</h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed relative z-10">{a.desc}</p>
            </div>
          ))}
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

export default WhoCanJoin;
