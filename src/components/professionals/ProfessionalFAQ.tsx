import React, { useState } from "react";
import { HelpCircle, ChevronDown, Sparkles } from "lucide-react";

const faqs = [
  {
    question: "I have zero programming or tech background. Will I be able to follow this course?",
    answer: "100% Yes. This course was created specifically for non-technical professionals — managers, HR, finance, sales, marketing, and operations specialists. There is zero Python, zero software coding, and zero terminal commands. Everything is conducted through clear conversational English, visual interfaces, and ready-to-use executive prompt frameworks."
  },
  {
    question: "How is this different from free ChatGPT tutorials on YouTube?",
    answer: "Most free YouTube tutorials show trivial toys (like writing a birthday poem or basic blog outlines). This course is engineered for corporate workplace reality: dealing with confidential client memos, analyzing multi-tab financial spreadsheets, synthesizing messy meetings, building automated no-code workflows, and presenting AI productivity ROI to your leadership to secure promotions."
  },
  {
    question: "How much time do I need to invest alongside my busy full-time job?",
    answer: "The curriculum is designed for busy corporate schedules. Modules are self-paced, organized in digestible 20-30 minute practical chapters that you can complete during weekends or in the evenings. Most importantly, you will begin saving 2+ hours per day at your job starting from the very first week."
  },
  {
    question: "How will I receive access after completing payment?",
    answer: "Access is completely automated and instant. Within 60 seconds of completing your enrollment, your personalized login credentials and course portal link (hosted on academy.techtycoon.in) are delivered directly to your registered email address. You can begin learning immediately on desktop or mobile."
  },
  {
    question: "Will I receive an official certificate for LinkedIn and my resume?",
    answer: "Yes! Upon completing the course modules and practical assignments, you will receive a verifiable Certificate in 'Advance AI for Non-Tech Working Professionals' from Tech Tycoon Digital Solution LLP, perfectly suited to showcase on your LinkedIn profile and resume."
  },
  {
    question: "Do I need expensive paid subscriptions to AI tools to take this course?",
    answer: "No. All core frameworks and practical workflows can be implemented using the generous free tiers of Claude 3.7, ChatGPT, Perplexity, and Google Gemini. We also teach you how to evaluate when a paid tier is worth the ROI for your specific department."
  },
  {
    question: "Is my corporate data and privacy safe when using these methods?",
    answer: "Yes. Module 6 covers enterprise data privacy, confidentiality protocols, and how to use modern LLMs with client information safely without leaking proprietary data or violating company compliance policies."
  }
];

const ProfessionalFAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-14 sm:py-20 bg-slate-50 border-t border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-black uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5" /> COMMON QUESTIONS
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Everything you need to know about taking Advance AI as a working professional.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm transition-all"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 focus:outline-none"
                >
                  <span className="text-xs sm:text-base font-bold text-slate-900 leading-snug">
                    {faq.question}
                  </span>
                  <div className={`p-1.5 rounded-lg text-slate-500 transition-transform flex-shrink-0 ${isOpen ? "rotate-180 bg-indigo-50 text-indigo-600" : "bg-slate-100"}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 sm:pb-5 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                    {faq.answer}
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

export default ProfessionalFAQ;
