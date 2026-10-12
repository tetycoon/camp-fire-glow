import React from "react";
import trainerImg from "../../assets/antony_praveen.jpg";
import { CheckCircle2, Star, Award, ShieldCheck, Users, TrendingUp } from "lucide-react";

interface AIBGMTrainerProps {
  onRegisterClick?: () => void;
}

const AIBGMTrainer: React.FC<AIBGMTrainerProps> = ({ onRegisterClick }) => {
  return (
    <section id="trainer" className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-200 text-slate-900 relative">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-widest mb-4">
            <Award className="w-3.5 h-3.5 text-blue-600" />
            MENTORSHIP & LEADERSHIP
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Meet Your Lead <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Architect</span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Learn from someone who doesn't just read about AI algorithms, but builds 7-figure digital agencies and automated software ventures.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Trainer Image */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-200 to-indigo-200 rounded-3xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity"></div>
              <img
                src={trainerImg}
                alt="Antony Praveen - Founder Tech Tycoon"
                className="relative z-10 w-72 sm:w-96 rounded-3xl object-cover border-2 border-slate-200 shadow-2xl"
              />
              <div className="absolute -bottom-6 -right-6 z-20 bg-white border border-slate-200 p-4 rounded-2xl shadow-xl text-center">
                <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                  ))}
                </div>
                <div className="text-lg font-black text-slate-900">4.9 / 5.0</div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Learner Rating</div>
              </div>
            </div>
          </div>

          {/* Bio & Credentials */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <h3 className="text-3xl sm:text-4xl font-black text-slate-900 mb-1">Antony Praveen</h3>
              <p className="text-blue-600 text-sm font-bold uppercase tracking-wider">
                Founder & Lead Strategist, Tech Tycoon Digital Solutions
              </p>
            </div>

            <blockquote className="p-5 rounded-2xl bg-slate-50 border-l-4 border-blue-600 text-slate-700 italic text-base leading-relaxed">
              "AI will not replace business founders; but founders who orchestrate Business Generative Models will radically outperform those who don't. Our mission with AI-BGM is to hand you the exact technical, creative, and strategic blueprint to build lasting commercial value."
            </blockquote>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900 text-sm">4,800+ Professionals Mentored</div>
                  <div className="text-xs text-slate-500">Entrepreneurs, marketers, founders & students</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900 text-sm">50+ Corporate Masterclasses</div>
                  <div className="text-xs text-slate-500">Delivered enterprise AI workflows for executives</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900 text-sm">Real-World Case Studies</div>
                  <div className="text-xs text-slate-500">Built using tested campaigns with real ad spend</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900 text-sm">Lifetime Software Integration</div>
                  <div className="text-xs text-slate-500">Continuous curation into the living LLM engine</div>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={onRegisterClick}
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-600 hover:text-blue-800 transition-colors"
              >
                <span>Join Antony's Next Executive Cohort &rarr;</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIBGMTrainer;
