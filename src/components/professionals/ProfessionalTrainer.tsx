import React from "react";
import trainerImg from "../../assets/antony_praveen.jpg";
import { CheckCircle2, Star, Award, ShieldCheck, Users, TrendingUp, ArrowRight } from "lucide-react";

interface ProfessionalTrainerProps {
  onRegisterClick?: () => void;
}

const ProfessionalTrainer: React.FC<ProfessionalTrainerProps> = ({ onRegisterClick }) => {
  return (
    <section id="trainer" className="py-12 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-200 text-slate-900 relative">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-3 sm:mb-4">
            <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-600" />
            ENTERPRISE AI MENTORSHIP
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-2 sm:mb-4">
            Meet Your Lead <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">AI Strategist</span>
          </h2>
          <p className="text-slate-600 text-xs sm:text-base">
            Learn practical workplace execution from an enterprise architect who trains corporate leaders to transform complex operations into automated high-leverage workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-16 items-center">
          {/* Trainer Image */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-200 to-blue-200 rounded-2xl sm:rounded-3xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity"></div>
              <img
                src={trainerImg}
                alt="Antony Praveen - Founder Tech Tycoon Digital Solution LLP"
                className="relative z-10 w-56 sm:w-80 lg:w-96 rounded-2xl sm:rounded-3xl object-cover border-2 border-slate-200 shadow-2xl"
              />
              <div className="absolute -bottom-3 -right-3 sm:-bottom-6 sm:-right-6 z-20 bg-white border border-slate-200 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl shadow-xl text-center">
                <div className="flex items-center justify-center gap-0.5 sm:gap-1 text-amber-500 mb-0.5 sm:mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-500" />
                  ))}
                </div>
                <div className="text-base sm:text-lg font-black text-slate-900">4.9 / 5.0</div>
                <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-500 font-bold">Executive Rating</div>
              </div>
            </div>
          </div>

          {/* Bio & Credentials */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            <div>
              <div className="text-xs sm:text-sm font-bold text-indigo-600 uppercase tracking-widest mb-1">
                Founder & Enterprise AI Strategist
              </div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900">
                Antony Praveen
              </h3>
              <p className="text-slate-500 text-xs sm:text-sm font-medium">
                Tech Tycoon Digital Solution LLP
              </p>
            </div>

            <p className="text-slate-700 leading-relaxed text-xs sm:text-base">
              Antony has trained over <strong>3,200+ working professionals, managers, and enterprise executives</strong> on cutting-edge generative AI orchestration. Having worked across corporate operations, digital systems, and enterprise automation, he translates technical complexity into actionable, zero-code workflows that deliver real business impact.
            </p>

            {/* Credential Bullets */}
            <div className="space-y-2.5 sm:space-y-3 pt-2">
              <div className="flex items-start gap-2.5 sm:gap-3">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-slate-700">
                  <strong>3,200+ Working Professionals Trained</strong> across IT, BFSI, Consulting, Operations, and Healthcare.
                </span>
              </div>
              <div className="flex items-start gap-2.5 sm:gap-3">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-slate-700">
                  <strong>Zero-Code Pedagogy:</strong> 100% focused on mental models, prompt architectures, and intuitive browser tools.
                </span>
              </div>
              <div className="flex items-start gap-2.5 sm:gap-3">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-slate-700">
                  <strong>Immediate Workplace ROI:</strong> Every workflow is built to save 2+ hours from Day 1 on the job.
                </span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-3 sm:pt-4 border-t border-slate-200">
              <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-lg sm:text-2xl font-black text-indigo-600">3.2K+</div>
                <div className="text-[9px] sm:text-[11px] text-slate-500 font-semibold uppercase">Learners</div>
              </div>
              <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-lg sm:text-2xl font-black text-blue-600">20+ Hrs</div>
                <div className="text-[9px] sm:text-[11px] text-slate-500 font-semibold uppercase">Coursework</div>
              </div>
              <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-lg sm:text-2xl font-black text-emerald-600">100%</div>
                <div className="text-[9px] sm:text-[11px] text-slate-500 font-semibold uppercase">Non-Tech</div>
              </div>
            </div>

            {onRegisterClick && (
              <div className="pt-2">
                <button
                  onClick={onRegisterClick}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>Learn with Antony Praveen</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfessionalTrainer;
