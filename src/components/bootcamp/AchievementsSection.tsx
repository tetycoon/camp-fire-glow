import React from "react";
import { CheckCircle2 } from "lucide-react";

const achievements = [
  "Build and deploy AI-powered applications",
  "Master 20+ industry AI tools",
  "Create an AI-optimized professional portfolio",
  "Earn an industry-recognized AI certification",
  "Develop real-world AI projects for your resume",
  "Understand ethical AI principles and best practices",
  "Launch AI-driven side hustles and freelance services",
  "Network with industry experts and like-minded peers",
];

const AchievementsSection: React.FC = () => {
  return (
    <section className="section-border py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="font-body text-xs tracking-[0.3em] text-primary uppercase font-semibold mb-3">Outcomes</p>
            <h2 className="font-display text-3xl sm:text-5xl font-bold text-foreground mb-6">
              What You'll <span className="text-gradient">Achieve</span>
            </h2>
            <p className="font-body text-muted-foreground leading-relaxed">
              By the end of 30 days, you'll have a complete toolkit of AI skills, real projects, and the confidence to lead in the AI-driven world.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {achievements.map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="font-body text-sm text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AchievementsSection;
