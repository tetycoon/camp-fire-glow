import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { HelpCircle } from "lucide-react";

const faqs = [
    {
        q: "What days and times are the masterclass sessions conducted?",
        a: "Sessions are conducted live every week in three convenient batches: Wednesday Evening (5:30 PM to 8:30 PM IST), Friday Evening (5:30 PM to 8:30 PM IST), and Sunday Morning (10:00 AM to 1:00 PM IST). You can select your preferred session date and time directly in the registration form."
    },
    {
        q: "Do I need technical or coding skills?",
        a: "Not at all! This masterclass is specially designed for non-technical professionals, coaches, trainers, and business owners. If you can type an email, you can easily use ChatGPT and modern AI tools with our step-by-step practical frameworks."
    },
    {
        q: "How much does the masterclass cost and what packages are available?",
        a: "We offer two options: (1) Standard Live Pass for ₹99 (inclusive of 18% GST), which grants full access to the 3-hour live interactive masterclass. (2) Complete Package for ₹499, which includes the live session plus our complete Resource Toolkit: Session PDF Material, 10+ AI Tool Kit, Multiple AI Agent Links, and 10+ Secret AI Websites delivered directly to your email."
    },
    {
        q: "How are the Resource Toolkit assets delivered?",
        a: "When you choose the ₹499 Masterclass + Resource Toolkit pass, your complete asset bundle (Session PDF Material, 10+ AI Tool Kit, Multiple AI Agent Links, and 10+ Secret AI Websites) will be delivered directly to your registered email upon enrollment."
    },
    {
        q: "How will I receive the meeting link after registering?",
        a: "Immediately after completing your payment via Razorpay, your live training credentials and session access link will be sent directly to your registered email and WhatsApp number."
    },
    {
        q: "What if I have questions during the session?",
        a: "We have an interactive Live Q&A segment during the masterclass where you can ask your specific business automation and prompt engineering questions directly."
    }
];

const AIMasterclassFAQSection: React.FC = () => {
    return (
        <section id="faq" className="py-24 px-4 bg-white border-t border-slate-100 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-xs font-bold text-slate-700 shadow-2xs border border-slate-200 mb-6">
                        <HelpCircle className="w-4 h-4 text-blue-600" />
                        FREQUENTLY ASKED QUESTIONS
                    </div>
                    <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-6 tracking-tight">
                        Got <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">Questions?</span> We've Got Answers
                    </h2>
                    <p className="text-slate-600 text-lg font-medium max-w-xl mx-auto">
                        Everything you need to know about the AI Secrets Revealed Live Masterclass.
                    </p>
                </div>

                <div className="space-y-4">
                    <Accordion type="single" collapsible className="w-full space-y-4">
                        {faqs.map((faq, i) => (
                            <AccordionItem key={i} value={`faq-${i}`} className="border border-slate-200/90 bg-slate-50/60 rounded-2xl px-6 sm:px-8 data-[state=open]:bg-white data-[state=open]:border-blue-300 data-[state=open]:shadow-xl transition-all duration-300">
                                <AccordionTrigger className="hover:no-underline py-6 text-left">
                                    <span className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">{faq.q}</span>
                                </AccordionTrigger>
                                <AccordionContent className="pb-8 pt-2">
                                    <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-medium">
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
