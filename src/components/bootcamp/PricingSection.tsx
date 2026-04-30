import React, { useState } from "react";
import { Calendar, Users, CheckCircle2, Zap, ShieldCheck } from "lucide-react";
import { useRegisterModal } from "./RegisterModalContext";

const batches = [
  { id: "batch2", name: "Executive Cohort", dates: "May 1 – May 30, 2026", color: "gold" },
];

const features = [
  { text: "Complete 30-Day Architectural Deep-Dive", color: "text-amber-400" },
  { text: "Dual-Slot Flexibility (AM/PM Sessions)", color: "text-amber-400" },
  { text: "Live Interactive Masterclasses via Neural-Net Zoom", color: "text-amber-400" },
  { text: "Industry-Certified AI Practitioner Credential", color: "text-amber-400" },
  { text: "Exclusive Expert Strategy Guest Modules", color: "text-amber-400" },
  { text: "All-Inclusive Professional Tuition", color: "text-amber-400" },
];

const PricingSection: React.FC = () => {
  const [selected, setSelected] = useState<string | null>("batch2");
  const { openRegisterModal } = useRegisterModal();

  return (
    <section id="pricing" className="section-border py-24 sm:py-32 px-4 relative overflow-hidden bg-midnight">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(45_100%_50%_/_0.05),transparent_50%)]" />
      <div className="absolute inset-0 grid-bg opacity-10" />
      
      {/* Floating Gold Orbs */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 rounded-full blur-[100px] opacity-10 animate-pulse pointer-events-none" style={{ background: "radial-gradient(circle, hsl(45 100% 50%), transparent 70%)" }} />
      <div className="absolute bottom-1/4 -left-20 w-80 h-80 rounded-full blur-[80px] opacity-10 animate-pulse pointer-events-none" style={{ background: "radial-gradient(circle, hsl(28 100% 50%), transparent 70%)", animationDelay: "1.5s" }} />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-16 sm:mb-20">
          <div className="section-label mb-6 mx-auto w-fit tracking-[0.4em] border-gold text-amber-500 bg-amber-500/10">✦ INVESTMENT ARCHITECTURE</div>
          <h2 className="font-display text-4xl sm:text-7xl font-[900] text-white mb-6 tracking-tighter">
            Choose Your <span className="text-gradient-gold">Pathway</span>
          </h2>
          <p className="font-body text-base sm:text-lg text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed">
            Invest in a career-defining skillset. Our cohorts are strictly capped at 20 elites to ensure high-fidelity mentorship.
          </p>
        </div>

        <div className="glass-panel-gold rounded-[2.5rem] p-1 sm:p-2 border-gold/30">
          <div className="bg-midnight/40 rounded-[2.2rem] p-8 sm:p-16 relative overflow-hidden">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Pricing & Selection */}
              <div className="lg:col-span-7">
                {/* Batch Selector */}
                <div className="mb-10">
                  <p className="font-body text-[10px] uppercase tracking-[0.3em] text-amber-500/60 font-black mb-4 ml-1">Available Enrollments</p>
                  <div className="grid grid-cols-1 gap-4">
                    {batches.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => setSelected(b.id)}
                        className={`group relative flex items-center justify-between p-6 rounded-2xl transition-all border-2 overflow-hidden ${
                          selected === b.id 
                            ? "border-amber-500/50 bg-amber-500/5 shadow-[0_0_40px_rgba(245,158,11,0.15)]" 
                            : "border-white/5 bg-white/5 hover:border-white/10"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${selected === b.id ? "bg-amber-500 text-midnight" : "bg-white/5 text-muted-foreground"}`}>
                            <Calendar className="w-6 h-6" />
                          </div>
                          <div className="text-left">
                            <h4 className={`font-display text-lg font-bold ${selected === b.id ? "text-white" : "text-muted-foreground"}`}>{b.name}</h4>
                            <p className="font-body text-sm text-muted-foreground/60 tracking-tight">{b.dates}</p>
                          </div>
                        </div>
                        {selected === b.id && <CheckCircle2 className="w-6 h-6 text-amber-500 animate-in zoom-in-50" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Display */}
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 bg-amber-500/10 border border-amber-500/20 text-amber-500">
                    <span className="font-display text-[10px] font-black tracking-widest uppercase">
                      ⌛ Enrollment Windows Closing
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 mb-6">
                    <span className="font-display text-4xl sm:text-6xl font-black text-white glow-text tracking-tighter uppercase">
                      Enquire for <span className="text-amber-500">Pricing</span>
                    </span>
                    <p className="font-body text-sm text-muted-foreground/60 italic">
                      Special cohort pricing available upon enquiry
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-6">
                    <div className="badge-green px-4 py-2 rounded-full font-display text-[11px] font-black tracking-widest flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      PREMIUM ACCESS
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 px-4 py-2 rounded-full font-display text-[11px] font-black tracking-widest flex items-center gap-2">
                      <Users className="w-3.5 h-3.5" />
                      8 SEATS LEFT
                    </div>
                  </div>
                </div>
              </div>

              {/* Action & Features */}
              <div className="lg:col-span-5 flex flex-col gap-8 h-full">
                <div className="flex-1 bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
                  <p className="font-body text-[10px] uppercase tracking-[0.3em] text-white/40 font-black mb-6">Program Deliverables</p>
                  <ul className="space-y-5">
                    {features.map((f, i) => (
                      <li key={i} className="flex items-start gap-4 group">
                        <div className="mt-1 w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                          <CheckCircle2 className="w-3 h-3 text-amber-500" />
                        </div>
                        <span className="font-body text-sm text-foreground/80 leading-snug">{f.text}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-10 pt-10 border-t border-white/10">
                    <div className="flex items-center gap-4 mb-8">
                       <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                          <Calendar className="w-7 h-7" />
                       </div>
                       <div>
                          <p className="font-display text-sm font-bold text-white">Admissions Open</p>
                          <p className="font-body text-[11px] text-muted-foreground">Limited Selection Cohort</p>
                       </div>
                    </div>
                    
                    <button 
                      onClick={openRegisterModal}
                      className="w-full btn-gold font-display text-sm font-black py-5 rounded-2xl tracking-[0.3em] uppercase group"
                    >
                      <span className="flex items-center justify-center gap-3">
                         ENQUIRE NOW
                         <Zap className="w-4 h-4 fill-current group-hover:animate-bounce" />
                      </span>
                    </button>
                    
                    <p className="text-[10px] text-center text-muted-foreground/40 mt-6 font-medium tracking-tight">
                        *Program schedule and logistics provided upon successful enquiry
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
