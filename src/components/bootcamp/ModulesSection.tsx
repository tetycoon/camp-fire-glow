import React from "react";
import { Brain, MessageSquare, Bot, Lightbulb, Briefcase, GraduationCap, Globe, Shield, Wrench } from "lucide-react";

const iconColors = [
  { iconColor: "text-cyan-400", iconClass: "icon-box-cyan" },
  { iconColor: "text-purple-400", iconClass: "icon-box-purple" },
  { iconColor: "text-orange-400", iconClass: "icon-box-orange" },
  { iconColor: "text-emerald-400", iconClass: "icon-box-green" },
  { iconColor: "text-cyan-400", iconClass: "icon-box-cyan" },
  { iconColor: "text-purple-400", iconClass: "icon-box-purple" },
  { iconColor: "text-orange-400", iconClass: "icon-box-orange" },
  { iconColor: "text-emerald-400", iconClass: "icon-box-green" },
  { iconColor: "text-cyan-400", iconClass: "icon-box-cyan" },
];

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
    <section id="modules" className="section-border py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, hsl(222 40% 6%), hsl(222 47% 5%))" }} />
      <div className="absolute inset-0 grid-bg opacity-25" />
      <div className="absolute top-20 right-20 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, hsl(265 85% 65% / 0.1), transparent 70%)" }} />
      <div className="absolute bottom-20 left-20 w-80 h-80 rounded-full blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, hsl(25 100% 60% / 0.08), transparent 70%)" }} />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="section-label mb-4 mx-auto w-fit">📚 Curriculum</div>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-foreground mb-4">
            Core <span className="text-gradient">Modules</span>
          </h2>
          <p className="font-body text-muted-foreground">9 comprehensive modules designed for real-world AI mastery</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {modules.map((m, i) => {
            const colors = iconColors[i];
            return (
              <div key={i} className="card-glow rounded-2xl p-6 flex items-center gap-5 group relative overflow-hidden">
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: "radial-gradient(circle at 0% 50%, hsl(199 100% 55% / 0.07), transparent 60%)" }} />
                <div className="number-tag font-display text-lg font-black text-gradient-cyan min-w-[2.5rem] text-center flex-shrink-0">
                  {m.num}
                </div>
                <div className={`w-10 h-10 rounded-xl ${colors.iconClass} flex items-center justify-center flex-shrink-0`}>
                  <m.icon className={`w-5 h-5 ${colors.iconColor}`} />
                </div>
                <h3 className="font-display text-xs font-bold text-foreground leading-tight group-hover:text-primary transition-colors">{m.title}</h3>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ModulesSection;
