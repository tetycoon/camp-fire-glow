import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

const faqs = [
    {
        q: "Do I need technical or coding skills?",
        a: "Not at all! This masterclass is designed for non-technical professionals. If you can type an email, you can learn prompt engineering and build AI workflows with our step-by-step systems."
    },
    {
        q: "Will I get access to the recordings?",
        a: "Yes! If you choose the Full Enrollment, you'll receive lifetime access to all session recordings, prompt libraries, and the Canva mastery bonus course."
    },
    {
        q: "Will I receive a certificate?",
        a: "Yes. Upon completion, you will receive an industry-recognized digital certificate from Tech Tycoon, which you can easily add to your LinkedIn profile and resume."
    },
    {
        q: "How does the ₹500 registration work?",
        a: "You can reserve your seat immediately by paying just ₹500 today. The remaining balance of ₹6,499 must be cleared before the masterclass begins to gain full access to all materials and live sessions."
    }
];

const AIMasterclassFAQSection: React.FC = () => {
    return (
        <section id="faq" className="py-24 px-4 bg-white border-t border-slate-100">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <div className="inline-block px-4 py-2 bg-slate-50 rounded-full text-[10px] font-black text-slate-500 shadow-sm border border-slate-200 mb-6 uppercase tracking-[0.2em]">
                        ❓ FREQUENTLY ASKED
                    </div>
                    <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-6 tracking-tight">
                        Common <span className="text-blue-600">Questions</span>
                    </h2>
                </div>

                <div className="space-y-4">
                    <Accordion type="single" collapsible className="w-full space-y-4">
                        {faqs.map((faq, i) => (
                            <AccordionItem key={i} value={`faq-${i}`} className="border border-slate-100 bg-slate-50/50 rounded-3xl px-8 data-[state=open]:bg-white data-[state=open]:border-blue-100 data-[state=open]:shadow-xl transition-all duration-300">
                                <AccordionTrigger className="hover:no-underline py-6 text-left">
                                    <span className="text-xl font-black text-slate-900 tracking-tight">{faq.q}</span>
                                </AccordionTrigger>
                                <AccordionContent className="pb-8 pt-2">
                                    <p className="text-slate-600 text-lg leading-relaxed font-medium">
                                        {faq.a}
                                    </p>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>
        </section>
    );
};

export default AIMasterclassFAQSection;
