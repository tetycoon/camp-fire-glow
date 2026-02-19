import React from "react";
import { Calendar, Clock, Video, Award } from "lucide-react";

const stats = [
  { icon: Calendar, value: "30 Days", label: "Intensive structured learning path", color: "text-primary" },
  { icon: Clock, value: "3 Hrs/Day", label: "10am–1pm or 6pm–9pm sessions", color: "text-secondary" },
  { icon: Video, value: "Live Zoom", label: "Interactive sessions with real-time Q&A", color: "text-primary" },
  { icon: Award, value: "Certificate", label: "Industry-recognized AI certification", color: "text-secondary" },
];

const ProgramStructure: React.FC = () => {
  return (
    <section className="section-border py-24 px-4 bg-muted/20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="font-body text-xs tracking-[0.3em] text-primary uppercase font-semibold mb-3">The Format</p>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-foreground mb-4">
            Program <span className="text-gradient">Structure</span>
          </h2>
          <p className="font-body text-muted-foreground">Live + Practical mode for maximum learning</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <div key={i} className="card-glow rounded-2xl p-8 text-center flex flex-col items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center`}>
                <s.icon className={`w-7 h-7 ${s.color}`} />
              </div>
              <div className={`font-display text-2xl font-bold ${s.color}`}>{s.value}</div>
              <p className="font-body text-xs text-muted-foreground text-center leading-relaxed">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProgramStructure;
