import React from "react";
import { BookOpen, University, TrendingUp } from "lucide-react";

const audiences = [
  {
    icon: BookOpen,
    title: "School Students",
    desc: "High school learners eager to get ahead with AI skills for academics and future careers.",
    tag: "Grades 9–12",
  },
  {
    icon: University,
    title: "College Students",
    desc: "University students looking to boost employability and build AI-powered projects.",
    tag: "UG / PG",
  },
  {
    icon: TrendingUp,
    title: "Entrepreneurs",
    desc: "Business professionals and aspiring founders who want to leverage AI for growth.",
    tag: "Founders & Professionals",
  },
];

const WhoCanJoin: React.FC = () => {
  return (
    <section id="who" className="section-border py-24 px-4 relative">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <p className="font-body text-xs tracking-[0.3em] text-primary uppercase font-semibold mb-3">Eligibility</p>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-foreground mb-4">
            Who Can <span className="text-gradient">Join?</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {audiences.map((a, i) => (
            <div key={i} className="card-glow rounded-2xl p-10 flex flex-col items-center text-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <a.icon className="w-8 h-8 text-primary" />
              </div>
              <span className="badge-module font-body text-xs font-semibold px-3 py-1 rounded-full">{a.tag}</span>
              <h3 className="font-display text-base font-bold text-foreground">{a.title}</h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">{a.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhoCanJoin;
