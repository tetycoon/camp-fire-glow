import React, { useState } from "react";
import { ChevronDown, HelpCircle, Sparkles } from "lucide-react";

const FAQ_ITEMS = [
  {
    q: "How is the 1-on-1 session conducted?",
    a: "The session is held live over Google Meet or Zoom. We utilize high-resolution screen sharing so you can share your actual workflows, spreadsheets, prompts, or software, and Antony can demonstrate solutions in real time."
  },
  {
    q: "When will the consultation take place after payment?",
    a: "Our scheduling team will message you on WhatsApp within 2-4 business hours after booking to coordinate your preferred day and time. Sessions are usually scheduled within 24 to 48 hours of booking."
  },
  {
    q: "Can I bring my co-founder, partner, or team member to the call?",
    a: "Yes! Up to 2 co-founders or key team members are welcome to join the same 1-on-1 video call at no extra charge if you are discussing a joint company project."
  },
  {
    q: "What if I need to reschedule my session?",
    a: "We understand that business schedules change. You can easily reschedule your session with at least 12 hours' notice by messaging our WhatsApp coordination line."
  },
  {
    q: "What should I prepare before our call?",
    a: "No heavy homework is required! Simply have a clear idea of your #1 objective (e.g. automating a specific business process, career transition roadmap, or tool selection) and access to the tools or documents you want to discuss."
  },
  {
    q: "Do I get a recording and notes after the session?",
    a: "Yes! You will receive the private cloud recording of the 60-minute session along with a summarized Action Blueprint highlighting tool recommendations, prompt assets, and next steps."
  }
];

const ConsultingFAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-14 sm:py-20 bg-slate-50 border-t border-slate-200 text-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-black uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5" /> CLARIFICATIONS
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Everything you need to know about your 1-on-1 AI strategy session.
          </p>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition-all"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 hover:text-indigo-600 transition-colors"
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${
                      isOpen ? "rotate-180 text-indigo-600" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 mt-1">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ConsultingFAQ;
