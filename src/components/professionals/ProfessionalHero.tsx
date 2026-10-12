import React from "react";
import { 
  Sparkles, 
  ArrowRight, 
  Lock, 
  Clock, 
  Infinity, 
  RefreshCw, 
  CheckCircle2, 
  TrendingUp, 
  Briefcase, 
  FileText,
  Layers,
  Award,
  BarChart3,
  Zap,
  Users,
  ShieldCheck
} from "lucide-react";

interface ProfessionalHeroProps {
  onUnlockClick: () => void;
}

const ProfessionalHero: React.FC<ProfessionalHeroProps> = ({ onUnlockClick }) => {
  return (
    <section className="relative pt-8 pb-14 sm:pt-14 sm:pb-24 lg:pt-16 lg:pb-28 overflow-hidden bg-white text-slate-900">
      {/* Background Subtle Gradient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[560px] pointer-events-none">
        <div className="absolute top-6 left-1/4 w-96 h-96 bg-indigo-100/60 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-blue-100/60 rounded-full blur-[120px]"></div>
        <div className="absolute top-44 left-1/3 w-80 h-80 bg-violet-100/50 rounded-full blur-[100px]"></div>
      </div>

      {/* Subtle Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #0f172a 1px, transparent 1px), linear-gradient(to bottom, #0f172a 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      ></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Top Pill / Badge */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 shadow-sm mb-4 sm:mb-8 backdrop-blur-md">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] sm:text-xs font-black tracking-widest uppercase">
              FOR MANAGERS • EXECUTIVES • OPERATIONS • HR • FINANCE • SALES
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.12] mb-3 sm:mb-6">
            Advance AI for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-800">
              Non-Tech Working Professionals
            </span>
          </h1>

          {/* Career Transformation Callout */}
          <div className="inline-block mx-auto mb-4 sm:mb-8 px-3.5 py-1.5 sm:px-6 sm:py-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50/70 to-amber-50 border border-amber-200/80 shadow-sm">
            <p className="text-xs sm:text-lg font-black text-amber-900 tracking-wide flex items-center justify-center gap-1.5 sm:gap-2">
              <Sparkles className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-amber-600 animate-spin" style={{ animationDuration: '6s' }} />
              DOUBLE YOUR OUTPUT & ACCELERATE YOUR CAREER WITH PRACTICAL AI
              <Sparkles className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-amber-600 animate-spin" style={{ animationDuration: '6s' }} />
            </p>
          </div>

          {/* Sub-Headline Description */}
          <p className="text-xs sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed mb-6 sm:mb-10 font-normal">
            No Python. No coding. No complex tech jargon. Master how corporate leaders use 
            <span className="text-slate-900 font-bold"> Claude 3.7</span>, 
            <span className="text-slate-900 font-bold"> ChatGPT-4o</span>, 
            <span className="text-slate-900 font-bold"> Perplexity AI</span>, and 
            <span className="text-slate-900 font-bold"> Smart Automation</span> to finish 8 hours of reports, presentations, spreadsheet insights, and executive communication in just 45 minutes.
          </p>

          {/* Value Highlights Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3.5 mb-8 sm:mb-12">
            <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-[11px] sm:text-sm font-semibold shadow-sm">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600" />
              <span>Save 10+ Hours Every Week</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-[11px] sm:text-sm font-semibold shadow-sm">
              <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
              <span>100% Non-Tech & Zero Coding</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-[11px] sm:text-sm font-semibold shadow-sm">
              <Infinity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
              <span>Lifetime Self-Paced Access</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-[11px] sm:text-sm font-semibold shadow-sm">
              <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" />
              <span>Executive AI Certification</span>
            </div>
          </div>

          {/* Primary CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-4 mb-6 sm:mb-8">
            <button
              onClick={onUnlockClick}
              className="w-full sm:w-auto px-6 py-3.5 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-blue-700 text-white font-black text-xs sm:text-base uppercase tracking-wider shadow-lg sm:shadow-xl shadow-indigo-600/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 sm:gap-3 group"
            >
              <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
              <span>Unlock Secret Pricing & Register</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-100 group-hover:translate-x-1 transition-transform" />
            </button>

            <a
              href="#curriculum"
              className="w-full sm:w-auto px-5 py-3 sm:px-7 sm:py-4 rounded-xl sm:rounded-2xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-bold text-xs sm:text-sm transition-colors border border-slate-200 shadow-sm flex items-center justify-center gap-2"
            >
              <span>Explore 7 Core Modules</span>
              <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
            </a>
          </div>

          {/* Pricing Secrecy Notice */}
          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200 max-w-xl mx-auto flex items-center justify-center gap-2.5 sm:gap-3 text-slate-600 text-[11px] sm:text-xs text-center shadow-sm mb-8 sm:mb-12">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              <strong className="text-slate-900 font-bold">Exclusive Cohort Access:</strong> Official pricing is hidden on the public page. Enter your mobile number & coupon code in the secure portal to reveal your discounted tier.
            </span>
          </div>

          {/* Corporate Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto pt-2">
            <div className="p-3 sm:p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm text-center">
              <div className="text-xl sm:text-3xl font-black text-indigo-600 mb-0.5">10+ Hrs</div>
              <div className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Saved Per Week</div>
            </div>
            <div className="p-3 sm:p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm text-center">
              <div className="text-xl sm:text-3xl font-black text-blue-600 mb-0.5">3,200+</div>
              <div className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Working Pros Trained</div>
            </div>
            <div className="p-3 sm:p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm text-center">
              <div className="text-xl sm:text-3xl font-black text-indigo-600 mb-0.5">4.9 / 5.0</div>
              <div className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Learner Satisfaction</div>
            </div>
            <div className="p-3 sm:p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm text-center">
              <div className="text-xl sm:text-3xl font-black text-emerald-600 mb-0.5">0 Code</div>
              <div className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Pure Visual & Prompts</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfessionalHero;
