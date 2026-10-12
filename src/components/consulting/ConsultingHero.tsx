import React from "react";
import {
  Sparkles,
  CheckCircle2,
  Clock,
  Video,
  ShieldCheck,
  TrendingUp,
  Briefcase,
  Zap,
  Target,
  ArrowRight
} from "lucide-react";
import ConsultingBookingForm from "./ConsultingBookingForm";

interface ConsultingHeroProps {
  onSuccess?: () => void;
}

const ConsultingHero: React.FC<ConsultingHeroProps> = ({ onSuccess }) => {
  return (
    <section className="relative pt-8 pb-14 sm:pt-12 sm:pb-20 lg:pt-16 lg:pb-24 bg-gradient-to-b from-slate-50 via-white to-slate-50 overflow-hidden text-slate-900">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none">
        <div className="absolute top-8 left-10 w-96 h-96 bg-indigo-100/60 rounded-full blur-[120px]"></div>
        <div className="absolute top-24 right-10 w-96 h-96 bg-blue-100/60 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Value Proposition & Details */}
          <div className="lg:col-span-6 xl:col-span-6 space-y-6 text-left pt-2 lg:pt-4">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>PRIVATE 1-ON-1 EXECUTIVE CONSULTATION</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Guiding Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-800">Business or Career</span> Through AI
            </h1>

            {/* Subhead */}
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              Get an intensive, private <strong>60-minute strategy call</strong> directly with <strong>Antony Praveen</strong> (Founder, Tech Tycoon). 
              No generic theory—receive a customized, step-by-step roadmap tailored specifically to your business operations, revenue goals, or professional career trajectory.
            </p>

            {/* Transparent Pricing Callout Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  INVESTMENT
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">₹2,500</span>
                  <span className="text-xs sm:text-sm text-slate-500 font-medium">/ 1 Hour Session</span>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] sm:text-xs font-bold uppercase">
                  100% Confidential
                </span>
                <span className="block text-[11px] text-slate-500 mt-1">Google Meet / Zoom</span>
              </div>
            </div>

            {/* 4 Core Value Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-900 mb-1">
                  <Briefcase className="w-4 h-4 text-indigo-600" />
                  <span>Business Automation</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Audit manual workflows, implement AI agents, and build lead generation pipelines.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-900 mb-1">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Career Acceleration</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Position for 2x salary hikes, master executive AI tools, and lead AI initiatives at work.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-900 mb-1">
                  <Video className="w-4 h-4 text-blue-600" />
                  <span>Live Screen-Share</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Hands-on live debugging, prompt engineering, and architecture review in real time.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-900 mb-1">
                  <Target className="w-4 h-4 text-amber-600" />
                  <span>Custom Action Blueprint</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Receive post-session implementation checklist, recommended tools, and prompt assets.
                </p>
              </div>
            </div>

            {/* Social Proof Stats */}
            <div className="pt-2 flex items-center gap-6 text-xs text-slate-600 border-t border-slate-200/70">
              <div>
                <strong className="block text-slate-900 font-black text-base sm:text-lg">500+ Hours</strong>
                <span>1-on-1 AI Mentorship</span>
              </div>
              <div className="w-px h-8 bg-slate-200"></div>
              <div>
                <strong className="block text-slate-900 font-black text-base sm:text-lg">10,000+</strong>
                <span>Professionals Trained</span>
              </div>
              <div className="w-px h-8 bg-slate-200"></div>
              <div>
                <strong className="block text-slate-900 font-black text-base sm:text-lg">4.9 / 5.0</strong>
                <span>Client Rating</span>
              </div>
            </div>
          </div>

          {/* Right Column: Embedded Booking Form */}
          <div id="booking-form" className="lg:col-span-6 xl:col-span-6">
            <ConsultingBookingForm onSuccess={onSuccess} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConsultingHero;
