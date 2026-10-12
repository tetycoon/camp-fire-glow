import React from "react";
import { Calendar, MessageSquare, Video, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

interface ConsultingHowItWorksProps {
  onBookClick: () => void;
}

const ConsultingHowItWorks: React.FC<ConsultingHowItWorksProps> = ({ onBookClick }) => {
  const steps = [
    {
      num: "01",
      icon: Calendar,
      title: "Reserve Your Slot",
      description: "Fill the quick consultation form with your background and goals, and pay the transparent ₹2,500 session fee.",
      badge: "Step 1 • 2 Mins"
    },
    {
      num: "02",
      icon: MessageSquare,
      title: "Slot Confirmation & Intake",
      description: "Our coordinator contacts you on WhatsApp within 2-4 business hours to lock in a mutually convenient Zoom or Google Meet time.",
      badge: "Step 2 • Fast Scheduling"
    },
    {
      num: "03",
      icon: Video,
      title: "60-Minute 1-on-1 Deep Dive",
      description: "Meet directly with Antony Praveen for an intensive strategy session. You receive full screen-sharing, recording, and an actionable roadmap.",
      badge: "Step 3 • Action Blueprint"
    }
  ];

  return (
    <section id="how-it-works" className="py-14 sm:py-20 bg-slate-50 border-t border-slate-200 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-black uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" /> SIMPLE PROCESS
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2">
            How The 1-on-1 Session Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            From booking to execution in 3 frictionless steps. No automated chatbots—real expert guidance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto mb-10 sm:mb-12">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm text-left relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-2xl sm:text-3xl font-black text-slate-200 font-mono">
                      {step.num}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block mb-1">
                    {step.badge}
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA banner */}
        <div className="max-w-3xl mx-auto p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-xl">
          <div>
            <h4 className="text-base sm:text-lg font-black mb-1">
              Ready to Accelerate With AI?
            </h4>
            <p className="text-xs text-slate-300">
              Only 4 private consultation slots are opened per week to maintain quality.
            </p>
          </div>
          <button
            onClick={onBookClick}
            className="px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap shadow-md flex items-center gap-2 flex-shrink-0"
          >
            <span>Book 1-on-1 • ₹2,500</span>
            <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default ConsultingHowItWorks;
