import React from "react";
import trainerImg from "../../assets/antony_praveen.jpg";
import { Award, CheckCircle2, Sparkles, Star, Users, Briefcase, Video } from "lucide-react";

interface ConsultingMentorProps {
  onBookClick: () => void;
}

const ConsultingMentor: React.FC<ConsultingMentorProps> = ({ onBookClick }) => {
  return (
    <section id="mentor" className="py-14 sm:py-20 bg-white border-t border-slate-200 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 lg:p-12 shadow-2xl overflow-hidden relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Photo Column */}
            <div className="lg:col-span-5 text-center">
              <div className="relative inline-block mx-auto">
                <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-3xl blur-lg opacity-40"></div>
                <img
                  src={trainerImg}
                  alt="Antony Praveen - Founder, Tech Tycoon"
                  className="relative w-64 h-72 sm:w-72 sm:h-80 object-cover object-top rounded-2xl border border-indigo-400/30 shadow-2xl"
                />
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-500 text-slate-950 font-black text-[10px] uppercase tracking-wider rounded-full shadow-lg whitespace-nowrap">
                  Lead AI Consultant
                </div>
              </div>
            </div>

            {/* Info Column */}
            <div className="lg:col-span-7 text-left space-y-4 sm:space-y-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider border border-indigo-500/30">
                <Award className="w-3.5 h-3.5 text-amber-400" /> MEET YOUR CONSULTANT
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                  Antony Praveen
                </h3>
                <p className="text-xs sm:text-sm text-indigo-300 font-medium">
                  Founder & Principal AI Strategist • Tech Tycoon Digital Solutions LLP
                </p>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Antony has mentored over <strong>10,000+ professionals, founders, and executives</strong> across India and internationally. Having consulted with businesses ranging from growing agencies to enterprise teams, his 1-on-1 sessions cut straight through the AI hype to deliver tangible, operational business results.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-lg sm:text-xl font-mono font-black text-amber-400">10,000+</div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Learners Mentored</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-lg sm:text-xl font-mono font-black text-emerald-400">500+</div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">1-on-1 Advisory Hours</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-indigo-900/30 border border-indigo-500/30 text-xs text-indigo-200 leading-relaxed italic">
                "One hour of structured, tailored consultation can easily save you 3 to 6 months of trial-and-error with AI tools. We look at your exact screen, your real workflows, and build what actually works."
              </div>

              <button
                onClick={onBookClick}
                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2"
              >
                <span>Reserve 1-on-1 with Antony • ₹2,500</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConsultingMentor;
