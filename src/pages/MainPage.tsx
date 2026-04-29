import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowRight, Zap, Star, ShieldCheck, 
  Users, Award, PlayCircle, LayoutGrid, 
  TrendingUp, Handshake, Globe, Bot, 
  Cpu, Rocket, Sparkles, ChevronRight
} from "lucide-react";

const MainPage: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans overflow-x-hidden selection:bg-brandGreen selection:text-slate-900">
      
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/10 blur-[120px]"></div>
        <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] rounded-full bg-cyan-500/5 blur-[100px]"></div>
        <div className="absolute inset-0 grid-bg opacity-20"></div>
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? "glass-navbar py-3 border-white/5 bg-[#020617]/80 shadow-2xl" : "bg-transparent py-8"}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-brandGreen rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <img src="/logo.png" alt="TechTycoon" className="relative w-10 h-10 rounded-full border border-white/10 shadow-lg transition-transform group-hover:scale-110" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter uppercase leading-none text-white">TechTycoon</span>
              <span className="text-[8px] font-bold text-brandGreen uppercase tracking-[0.3em] mt-1">Intelligence Systems</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#vision" className="text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors">Vision</a>
            <a href="#ecosystem" className="text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors">Ecosystem</a>
            <a href="#results" className="text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors">Results</a>
            <Link to="/ai_masterclass" className="btn-gold px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:shadow-gold transition-all">
              Launch Console
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full glass-panel-gold border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-200">The New Era of AI Autonomy</span>
          </div>
          
          <h1 className="text-5xl sm:text-7xl lg:text-9xl font-black leading-[0.9] tracking-tighter mb-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
            <span className="text-white block">RECODE THE</span>
            <span className="text-royal-gold block italic">FUTURE.</span>
          </h1>

          <p className="text-lg sm:text-2xl text-slate-400 max-w-3xl mx-auto mb-16 leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
            We don't just teach AI—we build the <span className="text-white font-bold">Systems of Intelligence</span> that power the next decade of digital dominance. Welcome to the elite tier of corporate evolution.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
            <Link to="/ai_masterclass" className="w-full sm:w-auto btn-gold px-12 py-6 rounded-2xl flex items-center justify-center gap-4 text-xs font-black uppercase tracking-widest active:scale-95 shadow-2xl">
              Initiate System <Zap className="w-5 h-5 fill-slate-900" />
            </Link>
            <button className="w-full sm:w-auto glass-panel px-10 py-6 rounded-2xl flex items-center justify-center gap-4 text-xs font-black uppercase tracking-widest text-white hover:bg-white/5 transition-all active:scale-95 border-white/10">
              View Blueprint <PlayCircle className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-24 pt-20 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-20">
            {[
              { label: "AI AGENTS", value: "480+", icon: Bot },
              { label: "LLM DEPLOYMENTS", value: "1.2k+", icon: Cpu },
              { label: "EFFICIENCY GAIN", value: "85%", icon: TrendingUp },
              { label: "GLOBAL TRUST", value: "4.9/5", icon: Globe }
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center">
                <stat.icon className="w-6 h-6 text-brandGreen mb-4" />
                <p className="text-4xl font-black mb-1">{stat.value}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Systems Section */}
      <section id="ecosystem" className="py-32 px-6 relative bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-24">
            <div className="max-w-2xl">
              <div className="section-label mb-6">INTELLIGENCE STACK</div>
              <h2 className="text-5xl sm:text-7xl font-black tracking-tighter leading-none mb-8">
                Proprietary <span className="text-royal-gold">Architectures.</span>
              </h2>
              <p className="text-xl text-slate-400 leading-relaxed font-medium">
                Our ecosystem is designed for maximum velocity. From autonomous agents to hyper-personalized marketing funnels, we provide the full stack of AI capability.
              </p>
            </div>
            <div className="hidden lg:block pb-4">
              <Award className="w-20 h-20 text-white/5 animate-pulse" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "AGENTIC FLOWS",
                desc: "Build autonomous workflows that handle complexity without human intervention. The future of operations is hands-free.",
                icon: Bot,
                color: "cyan"
              },
              {
                title: "PREDICTIVE CORE",
                desc: "Harness LLMs to anticipate market shifts and customer needs before they happen. Data-driven intuition at scale.",
                icon: TrendingUp,
                color: "gold"
              },
              {
                title: "GEN-VIZ SYSTEMS",
                desc: "High-fidelity visual asset generation for branding, ads, and product visualization. Instant creativity, zero overhead.",
                icon: LayoutGrid,
                color: "orange"
              }
            ].map((item, i) => (
              <div key={i} className={`card-${item.color} p-10 rounded-[2.5rem] group relative overflow-hidden`}>
                <div className={`icon-box-${item.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-8`}>
                  <item.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black mb-4 tracking-tight">{item.title}</h3>
                <p className="text-slate-400 font-medium leading-relaxed mb-10">
                  {item.desc}
                </p>
                <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white group-hover:gap-4 transition-all">
                  Deep Dive <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision/CTA Section */}
      <section className="py-40 px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto rounded-[4rem] bg-gradient-to-br from-slate-900 to-[#020617] p-12 sm:p-24 relative border border-white/5 text-center">
          <div className="absolute top-0 left-0 w-full h-full bg-brandGreen/5 blur-[120px] pointer-events-none"></div>
          <div className="relative z-10">
            <Bot className="w-16 h-16 text-brandGreen mx-auto mb-10 animate-bounce" />
            <h2 className="text-5xl sm:text-8xl font-black tracking-tighter leading-[0.9] mb-12">
              STOP WATCHING.<br />
              <span className="text-royal-gold">START BUILDING.</span>
            </h2>
            <p className="text-xl sm:text-2xl text-slate-400 max-w-2xl mx-auto mb-16 leading-relaxed font-medium">
              Join the ranks of elite entrepreneurs and corporate leaders who are using our systems to outperform the market by 10x.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link to="/ai_masterclass" className="w-full sm:w-auto btn-gold px-14 py-7 rounded-2xl text-sm font-black uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all">
                Access Masterclass
              </Link>
              <Link to="/bootcamp" className="w-full sm:w-auto glass-panel px-12 py-7 rounded-2xl text-sm font-black uppercase tracking-widest text-white border-white/10 hover:bg-white/5 transition-all">
                View Bootcamp
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5 bg-slate-950/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="TechTycoon" className="w-12 h-12 rounded-full border border-white/10 opacity-50" />
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tighter uppercase leading-none opacity-50">TechTycoon</span>
              <span className="text-[8px] font-bold text-slate-600 uppercase tracking-[0.3em] mt-1">Digital Solution LLP</span>
            </div>
          </div>

          <div className="flex gap-10">
            <Link to="/privacy" className="text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-colors">Privacy</Link>
            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Chennai, India</span>
          </div>

          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            © 2026 TechTycoon. Systems Ready.
          </p>
        </div>
      </footer>

    </div>
  );
};

export default MainPage;
