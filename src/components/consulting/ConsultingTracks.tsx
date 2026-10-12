import React from "react";
import {
  Briefcase,
  TrendingUp,
  Cpu,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  BarChart,
  Bot
} from "lucide-react";

interface ConsultingTracksProps {
  onSelectTrack: () => void;
}

const ConsultingTracks: React.FC<ConsultingTracksProps> = ({ onSelectTrack }) => {
  return (
    <section id="tracks" className="py-14 sm:py-20 bg-white border-t border-slate-200 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-black uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" /> 1-ON-1 ADVISORY TRACKS
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">
            What We Can Solve in Your 60-Minute Session
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Every session is 100% focused on your unique objectives. Choose one focus area or combine elements based on what you need.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Track 1: Business Growth & Automation */}
          <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-6 sm:p-7 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5">
                <Briefcase className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 block mb-1">
                FOR FOUNDERS & BUSINESS OWNERS
              </span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-3">
                Business & Revenue Automation
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-5">
                Audit your repetitive business processes and implement AI to save operational hours, reduce headcount costs, and scale client delivery.
              </p>

              <ul className="space-y-2.5 text-xs text-slate-700 mb-6">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Automating client onboarding, emails & invoicing</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>AI sales outreach & lead generation funnels</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Custom AI customer support & WhatsApp bots</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Reviewing agency/freelancer AI service offerings</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onSelectTrack}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-900 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Book Business Session</span>
              <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
            </button>
          </div>

          {/* Track 2: Career Acceleration */}
          <div className="rounded-2xl sm:rounded-3xl border-2 border-indigo-600/30 bg-gradient-to-b from-indigo-50/40 via-white to-slate-50 p-6 sm:p-7 shadow-md flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-3 right-3">
              <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[9px] font-black uppercase tracking-wider">
                Most Popular
              </span>
            </div>

            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-5 shadow-md shadow-indigo-600/25">
                <TrendingUp className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 block mb-1">
                FOR WORKING PROFESSIONALS
              </span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-3">
                Career Roadmap & AI Promotion
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-5">
                Learn how to stand out as the indispensable AI leader in your company, cut your workday in half, and position yourself for promotion.
              </p>

              <ul className="space-y-2.5 text-xs text-slate-700 mb-6">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Mastering Claude 3.7 & ChatGPT for your exact role</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Resume & LinkedIn repositioning for AI-empowered roles</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Automating board reports, data analysis & slide decks</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Personalized 90-day AI upskilling action plan</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onSelectTrack}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5"
            >
              <span>Book Career Session</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Track 3: Custom Technical Advisory */}
          <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-6 sm:p-7 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5">
                <Cpu className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 block mb-1">
                FOR TECH LEADERS & BUILDERS
              </span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-3">
                AI Agents & Architecture
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-5">
                Technical guidance on choosing LLMs, designing agentic architectures, and integrating autonomous agents into your software stack.
              </p>

              <ul className="space-y-2.5 text-xs text-slate-700 mb-6">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Model selection & API cost optimization</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Agentic workflows with n8n, Make, or custom python</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Context window management & prompt chaining</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Enterprise data privacy and compliance best practices</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onSelectTrack}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-900 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Book Tech Advisory</span>
              <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConsultingTracks;
