import React from "react";
import { Zap, Shield, Target, Award, Brain, Rocket } from "lucide-react";

const reasons = [
  {
    icon: Brain,
    title: "Syllabus Mastery",
    desc: "A curriculum built by lead AI architects, not just prompt users. Understand the 'Why' behind the neural outputs.",
    theme: "card-purple"
  },
  {
    icon: Target,
    title: "Precision Execution",
    desc: "Hands-on labs that simulate real-world technical challenges. Move from theory to operational proficiency.",
    theme: "card-glow"
  },
  {
    icon: Shield,
    title: "Ethical Integrity",
    desc: "Master the safe and moral deployment of AI systems, ensuring your architecture remains future-proof.",
    theme: "card-glow"
  },
  {
    icon: Award,
    title: "Industry Credential",
    desc: "An elite certification recognized by digital solutions partners. Proof of your specialized capabilities.",
    theme: "card-gold"
  },
  {
    icon: Zap,
    title: "Zero Delay Learning",
    desc: "Live, interactive sessions designed for extreme clarity and instant technical feedback.",
    theme: "card-orange"
  },
  {
    icon: Rocket,
    title: "10x Productivity",
    desc: "Unlock the professional bandwidth required for the upcoming hyper-competitive tech landscape.",
    theme: "card-glow"
  }
];

const WhySection: React.FC = () => {
  return (
    <section id="why" className="section-border py-24 sm:py-32 px-4 relative overflow-hidden bg-background">
       <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)_/_0.03),transparent_70%)]" />
       
       <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
             <div>
                <div className="section-label mb-6 tracking-[0.4em] glow-text">✦ TECHNICAL EDGE</div>
                <h2 className="font-display text-4xl sm:text-6xl font-[1000] text-white mb-6 leading-[1.1] tracking-tighter">
                   Why Specialization <br />
                   <span className="text-gradient">is Mandatory</span>
                </h2>
                <p className="font-body text-lg text-muted-foreground/80 leading-relaxed max-w-xl">
                   In an era where AI is democratized, the true value lies in specialized architectural knowledge. Surface-level usage is no longer an advantage; deep mastery is the new baseline.
                </p>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                   <div className="h-40 rounded-[2rem] bg-white/5 border border-white/10 p-8 flex flex-col justify-end">
                      <div className="font-display text-4xl font-black text-white">95%</div>
                      <div className="font-body text-[10px] text-muted-foreground uppercase tracking-widest">Automation Readiness</div>
                   </div>
                   <div className="h-60 rounded-[2rem] border-gold bg-amber-500/10 p-8 flex flex-col justify-end">
                      <Zap className="w-8 h-8 text-amber-400 mb-4" />
                      <div className="font-display text-4xl font-black text-amber-400">10x</div>
                      <div className="font-body text-[10px] text-amber-800 uppercase tracking-widest font-black">Output Multiplier</div>
                   </div>
                </div>
                <div className="space-y-4 pt-8">
                   <div className="h-60 rounded-[2rem] card-glow p-8 flex flex-col justify-end">
                      <Shield className="w-8 h-8 text-primary mb-4" />
                      <div className="font-display text-4xl font-black text-white">100%</div>
                      <div className="font-body text-[10px] text-primary uppercase tracking-widest font-black">Secure Architecture</div>
                   </div>
                   <div className="h-40 rounded-[2rem] bg-white/5 border border-white/10 p-8 flex flex-col justify-end">
                      <div className="font-display text-4xl font-black text-white">30d</div>
                      <div className="font-body text-[10px] text-muted-foreground uppercase tracking-widest">Mastery Window</div>
                   </div>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {reasons.map((r, i) => (
                <div key={i} className={`${r.theme} rounded-[2rem] p-8 group transition-all duration-500`}>
                   <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-500">
                      <r.icon className="w-7 h-7 text-white opacity-80" />
                   </div>
                   <h3 className="font-display text-xl font-black text-white mb-3 tracking-tight group-hover:text-primary transition-colors">{r.title}</h3>
                   <p className="font-body text-sm text-muted-foreground/80 leading-relaxed">{r.desc}</p>
                </div>
             ))}
          </div>
       </div>
    </section>
  );
};

export default WhySection;
