import React from "react";
import { Brain, MessageSquare, Bot, Lightbulb, Briefcase, GraduationCap, Globe, Shield, Wrench } from "lucide-react";

const modules = [
  { icon: Brain, title: "Generative AI Fundamentals", num: "01" },
  { icon: MessageSquare, title: "Prompt Engineering", num: "02" },
  { icon: Bot, title: "Agentic AI", num: "03" },
  { icon: Lightbulb, title: "AI for Entrepreneurship", num: "04" },
  { icon: Briefcase, title: "Career Development with AI", num: "05" },
  { icon: GraduationCap, title: "Student Productivity", num: "06" },
  { icon: Globe, title: "Digital Skills & Online Presence", num: "07" },
  { icon: Shield, title: "Ethical AI & Responsible Use", num: "08" },
  { icon: Wrench, title: "Hands-on AI Tools", num: "09" },
];

const ModulesSection: React.FC = () => {
  return (
    <section id="modules" className="section-border py-24 px-4 bg-muted/20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="font-body text-xs tracking-[0.3em] text-primary uppercase font-semibold mb-3">Curriculum</p>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-foreground mb-4">
            Core <span className="text-gradient">Modules</span>
          </h2>
          <p className="font-body text-muted-foreground">9 comprehensive modules designed for real-world AI mastery</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {modules.map((m, i) => (
            <div key={i} className="card-glow rounded-2xl p-6 flex items-center gap-5 group">
              <div className="font-display text-3xl font-black text-primary/20 group-hover:text-primary/40 transition-colors min-w-[3rem]">
                {m.num}
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                <m.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display text-xs font-bold text-foreground leading-tight">{m.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ModulesSection;
