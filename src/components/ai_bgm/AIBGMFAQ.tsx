import React, { useState } from "react";
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";

interface FAQItem {
  q: string;
  a: string;
}

const faqs: FAQItem[] = [
  {
    q: "What makes AI-BGM different from regular AI prompt courses?",
    a: "Most courses teach isolated prompts to write emails or generate basic text. AI-BGM teaches AI with a 100% BUSINESS PERSPECTIVE: taking you systematically from business ideation, niche selection, the 9 Core BMC Principles, visual branding, AI websites, hyper-realistic AI video creation, to full-funnel digital marketing that converts strangers into paying customers."
  },
  {
    q: "What is the 'Living LLM Software' and how do continuous updates work?",
    a: "Traditional courses become outdated within months as AI tools evolve. With AI-BGM, you receive lifetime access to our proprietary software dashboard. Whenever major AI model upgrades or commercial strategies emerge, our team tests them and integrates the new capabilities directly into the LLM platform—so your software stays continuously updated at zero extra charge."
  },
  {
    q: "How many hours of content is included and for how long do I have access?",
    a: "You get over 20+ hours of structured video lessons, downloadable templates, and execution blueprints. You receive Lifetime Access with zero subscription fees and zero renewal costs."
  },
  {
    q: "Why was the price hidden on the landing page?",
    a: "We protect our VIP cohort pricing so that genuine learners receive maximum scholarship value. Entering your mobile number and secret coupon code 'AMIABLE' unlocks our 50% discount grant."
  },
  {
    q: "What is the pricing breakdown with the 'AMIABLE' coupon?",
    a: "For Indian participants (+91), the standard price of ₹9,999 drops to ₹4,999 (saving ₹5,000). For international participants, the standard price of ₹13,999 drops to ₹6,999 (saving ₹7,000)."
  },
  {
    q: "Do I need technical or coding experience to enroll?",
    a: "No prior technical or coding experience is required. We teach using intuitive visual AI tools, prompt architecture, and no-code website deployment frameworks designed specifically for business owners, creators, and professionals."
  },
  {
    q: "How do I receive access after completing payment?",
    a: "Payment is processed securely through Razorpay. Once completed, your registration details are immediately recorded in our central system, and you will receive instant confirmation along with access details via email and our private WhatsApp onboarding portal."
  }
];

const AIBGMFAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-12 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-slate-200 text-slate-900 relative">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-3 sm:mb-4">
            <HelpCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600" />
            FREQUENTLY ASKED QUESTIONS
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-2 sm:mb-4">
            Everything You Need to Know
          </h2>
          <p className="text-slate-600 text-xs sm:text-base">
            Have questions about the Advance AI-Business Generative Model? We have answers.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3 sm:space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-xl sm:rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? "bg-white border-blue-400 shadow-md"
                    : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
                }`}
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full p-3.5 sm:p-5 sm:p-6 text-left flex items-center justify-between gap-3 sm:gap-4 focus:outline-none"
                >
                  <span className="font-bold text-xs sm:text-base text-slate-900">
                    {faq.q}
                  </span>
                  <span className="p-1 sm:p-1.5 rounded-md sm:rounded-lg bg-slate-100 text-slate-600 flex-shrink-0">
                    {isOpen ? <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-3.5 pb-3.5 pt-2 sm:px-6 sm:pb-6 text-slate-600 text-xs sm:text-sm leading-relaxed border-t border-slate-100 bg-white">
                    {faq.a}
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

export default AIBGMFAQ;
