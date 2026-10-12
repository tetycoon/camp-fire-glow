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
    <section id="living-llm" className="py-12 sm:py-20 lg:py-24 px-3.5 sm:px-6 lg:px-8 bg-slate-50 border-t border-slate-200 relative overflow-hidden">
      {/* Background Accent Gradients */}
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-100/60 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-10 -left-40 w-96 h-96 bg-blue-100/60 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          {/* Left Column: Explanatory Copy */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-violet-100/70 border border-violet-200 text-violet-700 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-3 sm:mb-6">
              <RefreshCw className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-violet-600 animate-spin" style={{ animationDuration: '8s' }} />
              THE EVERGREEN ADVANTAGE
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-3 sm:mb-6">
              Why Static Courses Fail. <br />
              Meet the <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600">Living LLM Software</span>.
            </h2>

            <p className="text-slate-600 text-xs sm:text-base leading-relaxed mb-6 sm:mb-8 font-normal">
              Most online courses are obsolete 90 days after you purchase them. The AI frontier moves at warp speed. 
              <br /><br />
              With <strong className="text-slate-900">AI-BGM</strong>, your enrollment grants you <strong className="text-emerald-700">Lifetime Access</strong> to our specialized LLM software portal. Every new AI model breakthrough, marketing feature, workflow automation, and commercial business tactic is <span className="text-indigo-700 font-bold underline decoration-indigo-300 underline-offset-4">continuously added directly inside the LLM</span>.
            </p>

            {/* Feature List */}
            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-10">
              <div className="flex items-start gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-slate-200 shadow-sm">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center flex-shrink-0 text-violet-600">
                  <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 mb-0.5 sm:mb-1">Continuous Knowledge Ingestion</h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Whenever OpenAI, Anthropic, Google, or leading AI tools release updates, our team synthesizes the business perspective applications directly into your portal.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-slate-200 shadow-sm">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600">
                  <Infinity className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 mb-0.5 sm:mb-1">True Lifetime Access Guarantee</h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    No recurring subscription fees. No sneaky upgrades. You secure your seat once, and you own the full course library plus software updates perpetually.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-slate-200 shadow-sm">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-600">
                  <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 mb-0.5 sm:mb-1">Trained on Pure Business Utility</h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Fine-tuned for high-converting sales copy, 9 BMC model execution, ad scripts, unit economics, and operational automation.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onRegisterClick}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:px-8 sm:py-4 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-700 hover:to-indigo-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/25 transition-transform hover:scale-105 active:scale-95 text-center"
            >
              <span>Unlock Secret Pricing For Lifetime Access</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          {/* Right Column: Visual Dashboard Mockup */}
          <div className="lg:col-span-5">
            <div className="p-1 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-indigo-200 via-slate-100 to-violet-200 shadow-xl border border-slate-200">
              <div className="bg-white rounded-xl sm:rounded-[22px] p-4 sm:p-6 sm:p-8 border border-slate-200 shadow-sm">
                {/* Simulated Terminal / LLM Hub UI */}
                <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100 mb-4 sm:mb-6">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-rose-400"></span>
                    <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-400"></span>
                    <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-400"></span>
                  </div>
                  <div className="text-[10px] sm:text-[11px] font-mono text-slate-500 flex items-center gap-1.5 font-bold">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    AI_BGM_LLM_v4.8_LIVE
                  </div>
                </div>

                {/* System Status Indicators */}
                <div className="space-y-2.5 sm:space-y-3.5">
                  <div className="p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <span className="text-[11px] sm:text-xs font-semibold text-slate-700">Sync Engine</span>
                    <span className="text-[10px] sm:text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      ACTIVE • EVERGREEN
                    </span>
                  </div>

                  <div className="p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <span className="text-[11px] sm:text-xs font-semibold text-slate-700">Course Vault</span>
                    <span className="text-[10px] sm:text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                      20+ HOURS 4K HD
                    </span>
                  </div>

                  <div className="p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <span className="text-[11px] sm:text-xs font-semibold text-slate-700">Access Tier</span>
                    <span className="text-[10px] sm:text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      LIFETIME UNRESTRICTED
                    </span>
                  </div>

                  <div className="p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <span className="text-[11px] sm:text-xs font-semibold text-slate-700">Latest Sync</span>
                    <span className="text-[10px] sm:text-[11px] font-mono text-slate-500 font-semibold">
                      Auto-Updated 2026
                    </span>
                  </div>
                </div>

                {/* Simulated Prompt Execution Log */}
                <div className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-950 border border-slate-800 font-mono text-[10px] sm:text-[11px] text-slate-300 space-y-1.5 sm:space-y-2 shadow-inner">
                  <div className="text-indigo-400 font-bold">$ init_business_generative_model</div>
                  <div className="text-slate-400">&gt; Loading 9-Core BMC... [OK]</div>
                  <div className="text-slate-400">&gt; Generating High-Converting Copy... [OK]</div>
                  <div className="text-emerald-400 font-bold">&gt; Status: READY TO DEPLOY</div>
                </div>

                {/* Trust Badge */}
                <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-100 text-center">
                  <p className="text-[10px] sm:text-[11px] text-slate-500">
                    🔒 Protected under Tech Tycoon Intellectual Property
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
