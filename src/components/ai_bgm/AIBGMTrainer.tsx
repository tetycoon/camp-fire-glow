import React from "react";
import trainerImg from "../../assets/antony_praveen.jpg";
import { CheckCircle2, Star, Award, ShieldCheck, Users, TrendingUp } from "lucide-react";

const AIBGMTrainer: React.FC = () => {
  return (
    <section id="trainer" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900 border-t border-slate-800 text-white relative">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-bold uppercase tracking-widest mb-4">
            <Award className="w-3.5 h-3.5 text-blue-400" />
            MENTORSHIP & LEADERSHIP
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
            Meet Your Lead <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Architect</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Learn from someone who doesn't just read about AI algorithms, but builds 7-figure digital agencies and automated software ventures.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Trainer Image */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-blue-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <img
                src={trainerImg}
                alt="Antony Praveen - Founder Tech Tycoon"
                className="relative z-10 w-72 sm:w-96 rounded-3xl object-cover border border-slate-700 shadow-2xl"
              />
              <div className="absolute -bottom-6 -right-6 z-20 bg-slate-950 border border-slate-800 p-4 rounded-2xl shadow-xl text-center">
                <div className="flex items-center justify-center gap-1 text-amber-400 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
                <div className="text-lg font-black text-white">4.9 / 5.0</div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400">Learner Rating</div>
              </div>
            </div>
          </div>

          {/* Bio & Credentials */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <h3 className="text-3xl sm:text-4xl font-black text-white mb-1">Antony Praveen</h3>
              <p className="text-indigo-400 text-sm font-bold uppercase tracking-wider">
                Founder & Lead Strategist, Tech Tycoon Digital Solutions
              </p>
            </div>

            <blockquote className="p-5 rounded-2xl bg-slate-950 border-l-4 border-indigo-500 text-slate-300 italic text-base leading-relaxed">
              "AI will not replace business founders; but founders who orchestrate Business Generative Models will radically outperform those who don't. Our mission with AI-BGM is to hand you the exact technical, creative, and strategic blueprint to build lasting commercial value."
            </blockquote>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white text-sm">4,800+ Professionals Mentored</div>
                  <div className="text-xs text-slate-400">Entrepreneurs, marketers, founders & students</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white text-sm">50+ Corporate Masterclasses</div>
                  <div className="text-xs text-slate-400">Delivered enterprise AI workflows for executives</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white text-sm">Real-World Case Studies</div>
                  <div className="text-xs text-slate-400">Built using tested campaigns with real ad spend</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white text-sm">Lifetime Software Integration</div>
                  <div className="text-xs text-slate-400">Continuous curation into the living LLM engine</div>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <a
                href="#register"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <span>Join Antony's Next Executive Cohort &rarr;</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIBGMTrainer;
