import React from "react";
import { 
  Cpu, 
  Infinity, 
  RefreshCw, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Layers, 
  Bot, 
  CheckCircle2, 
  Database,
  ArrowRight
} from "lucide-react";

interface AIBGMLivingLLMProps {
  onRegisterClick?: () => void;
}

const AIBGMLivingLLM: React.FC<AIBGMLivingLLMProps> = ({ onRegisterClick }) => {
  return (
    <section id="living-llm" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900 relative overflow-hidden">
      {/* Background Accent Gradients */}
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-10 -left-40 w-96 h-96 bg-blue-600/15 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Explanatory Copy */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs font-bold uppercase tracking-widest mb-6">
              <RefreshCw className="w-3.5 h-3.5 text-violet-400 animate-spin" style={{ animationDuration: '8s' }} />
              THE EVERGREEN ADVANTAGE
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-6">
              Why Static Courses Fail. <br />
              Meet the <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-300 to-blue-400">Living LLM Software</span>.
            </h2>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-8 font-normal">
              Most online courses are obsolete 90 days after you purchase them. The AI frontier moves at warp speed. 
              <br /><br />
              With <strong className="text-white">AI-BGM</strong>, your enrollment grants you <strong className="text-emerald-400">Lifetime Access</strong> to our specialized LLM software portal. Every new AI model breakthrough, marketing feature, workflow automation, and commercial business tactic is <span className="text-amber-300 font-semibold underline decoration-amber-400/50 underline-offset-4">continuously added and updated directly inside the LLM</span>.
            </p>

            {/* Feature List */}
            <div className="space-y-4 mb-10">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0 text-violet-400">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white mb-1">Continuous Real-Time Knowledge Ingestion</h4>
                  <p className="text-xs sm:text-sm text-slate-400">
                    Whenever OpenAI, Anthropic, Google, or leading AI tools release updates, our engineering team synthesizes the business perspective applications and injects them straight into your portal.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 text-blue-400">
                  <Infinity className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white mb-1">True Lifetime Access Guarantee</h4>
                  <p className="text-xs sm:text-sm text-slate-400">
                    No recurring subscription fees. No sneaky upgrades. You secure your seat once, and you own the full course library plus software updates perpetually.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 text-emerald-400">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white mb-1">Trained on Pure Business Utility</h4>
                  <p className="text-xs sm:text-sm text-slate-400">
                    The software is specifically fine-tuned for high-converting sales copy, 9 BMC model execution, ad scripts, unit economics, and operational automation.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onRegisterClick}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-xl shadow-violet-600/30 transition-transform hover:scale-105"
            >
              <span>Unlock Secret Pricing For Lifetime Access</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right Column: Visual Dashboard Mockup */}
          <div className="lg:col-span-5">
            <div className="p-1 rounded-3xl bg-gradient-to-br from-indigo-500/30 via-slate-800 to-violet-500/30 shadow-2xl">
              <div className="bg-slate-950 rounded-[22px] p-6 sm:p-8 border border-slate-800">
                {/* Simulated Terminal / LLM Hub UI */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    AI_BGM_LLM_v4.8_LIVE
                  </div>
                </div>

                {/* System Status Indicators */}
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-300">Continuous Sync Engine</span>
                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      ACTIVE • EVERGREEN
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-300">Course Content Vault</span>
                    <span className="text-[11px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                      20+ HOURS 4K HD
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-300">Access Tier</span>
                    <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                      LIFETIME UNRESTRICTED
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-300">Latest Model Sync</span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Auto-Updated 2026
                    </span>
                  </div>
                </div>

                {/* Simulated Prompt Execution Log */}
                <div className="mt-6 p-4 rounded-2xl bg-black/70 border border-slate-800/80 font-mono text-[11px] text-slate-300 space-y-2">
                  <div className="text-indigo-400 font-bold">$ init_business_generative_model</div>
                  <div className="text-slate-400">&gt; Loading 9-Core Business Model Canvas... [OK]</div>
                  <div className="text-slate-400">&gt; Generating High-Converting Website Copy... [OK]</div>
                  <div className="text-slate-400">&gt; Synthesizing AI Video Script & Avatars... [OK]</div>
                  <div className="text-emerald-400 font-bold">&gt; Business Perspective Status: READY TO DEPLOY</div>
                </div>

                {/* Trust Badge */}
                <div className="mt-6 pt-4 border-t border-slate-900 text-center">
                  <p className="text-[11px] text-slate-500">
                    🔒 Protected under Tech Tycoon Intellectual Property & Living Software Licensing
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIBGMLivingLLM;
