import React from "react";
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Lock, 
  Clock, 
  Infinity, 
  RefreshCw, 
  CheckCircle2, 
  TrendingUp, 
  Layers, 
  Bot, 
  Play
} from "lucide-react";

interface AIBGMHeroProps {
  onUnlockClick: () => void;
}

const AIBGMHero: React.FC<AIBGMHeroProps> = ({ onUnlockClick }) => {
  return (
    <section className="relative pt-12 pb-20 lg:pt-16 lg:pb-32 overflow-hidden bg-white text-slate-900">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none">
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-blue-100/60 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-indigo-100/60 rounded-full blur-[120px]"></div>
        <div className="absolute top-48 left-1/3 w-80 h-80 bg-violet-100/50 rounded-full blur-[100px]"></div>
      </div>

      {/* Subtle Grid overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #0f172a 1px, transparent 1px), linear-gradient(to bottom, #0f172a 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      ></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Top Pill / Super-Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 shadow-sm mb-8 backdrop-blur-md">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] sm:text-xs font-black tracking-widest uppercase">
              EXECUTIVE LLM SOFTWARE COURSE • 2026 EDITION
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.08] mb-6">
            Advance AI-Business <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">
              Generative Model
            </span>
            <span className="text-blue-700"> (AI-BGM)</span>
          </h1>

          {/* Core Philosophy Callout */}
          <div className="inline-block mx-auto mb-8 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50/70 to-amber-50 border border-amber-200/80 shadow-sm">
            <p className="text-base sm:text-xl font-black text-amber-900 tracking-wide flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600 animate-spin" style={{ animationDuration: '6s' }} />
              We Teach AI With a 100% BUSINESS PERSPECTIVE
              <Sparkles className="w-5 h-5 text-amber-600 animate-spin" style={{ animationDuration: '6s' }} />
            </p>
          </div>

          {/* Sub-Headline Description */}
          <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-10 font-normal">
            Stop learning isolated prompts. Master how to orchestrate generative models to create profitable businesses:
            <span className="text-slate-900 font-bold"> Business Ideas & Niche Picking</span>, 
            <span className="text-slate-900 font-bold"> 9-Core Business Model Canvas (BMC)</span>, 
            <span className="text-slate-900 font-bold"> High-Converting Creatives</span>, 
            <span className="text-slate-900 font-bold"> AI Websites</span>, 
            <span className="text-slate-900 font-bold"> Hyper-Realistic AI Videos</span>, and 
            <span className="text-slate-900 font-bold"> Automated Digital Marketing Systems</span>.
          </p>

          {/* Value Highlights Chips */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-12">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold shadow-sm">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>20+ Hours Video Mastery</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold shadow-sm">
              <Infinity className="w-4 h-4 text-emerald-600" />
              <span>Lifetime Unrestricted Access</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold shadow-sm">
              <RefreshCw className="w-4 h-4 text-indigo-600" />
              <span>Living LLM Software Updates</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold shadow-sm">
              <Layers className="w-4 h-4 text-amber-600" />
              <span>9-Part Business Model Canvas</span>
            </div>
          </div>

          {/* Primary CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <button
              onClick={onUnlockClick}
              className="w-full sm:w-auto px-8 py-5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-base uppercase tracking-wider shadow-xl shadow-blue-500/25 hover:scale-[1.03] active:scale-95 transition-all duration-300 border border-blue-400/30 flex items-center justify-center gap-3 group"
            >
              <Lock className="w-5 h-5 text-amber-300" />
              <span>Unlock Secret Pricing & Register</span>
              <ArrowRight className="w-5 h-5 text-blue-100 group-hover:translate-x-1 transition-transform" />
            </button>

            <a
              href="#curriculum"
              className="w-full sm:w-auto px-7 py-5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-bold text-base transition-colors border border-slate-200 shadow-sm flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 text-blue-600" />
              <span>Explore 20+ Hr Syllabus</span>
            </a>
          </div>

          {/* Pricing Secrecy Notice */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 max-w-xl mx-auto flex items-center justify-center gap-3 text-slate-600 text-xs text-center shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              <strong className="text-slate-900 font-bold">Exclusive Cohort Access:</strong> Official pricing is hidden on the public page. Enter your mobile number & coupon code in the secure portal to reveal your discounted tier.
            </span>
          </div>
        </div>

        {/* 4 Feature Key Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-16 max-w-6xl mx-auto">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all group shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
              <Clock className="w-6 h-6" />
            </div>
            <div className="text-2xl font-black text-slate-900 mb-1">20+ Hours</div>
            <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">Comprehensive Deep-Dive</div>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Step-by-step master sessions taking you from raw zero to a fully operational AI business machine.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-lg transition-all group shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
              <Infinity className="w-6 h-6" />
            </div>
            <div className="text-2xl font-black text-slate-900 mb-1">Lifetime Access</div>
            <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">Never Expires</div>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Permanent access to all modules, frameworks, templates, and the exclusive member dashboard.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all group shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition-transform">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div className="text-2xl font-black text-slate-900 mb-1">Living LLM Software</div>
            <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">Evergreen Updates</div>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              As AI models and commercial strategies evolve, updates are continuously fed into our proprietary LLM software.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-amber-300 hover:shadow-lg transition-all group shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mb-4 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="text-2xl font-black text-slate-900 mb-1">Business First</div>
            <div className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">Zero Fluff Mechanics</div>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Not just hobby prompts. Every concept is tethered to monetizable revenue, customer acquisition, and high margins.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIBGMHero;
