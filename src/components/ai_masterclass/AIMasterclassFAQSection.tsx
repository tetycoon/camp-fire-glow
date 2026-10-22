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
        a: "Sessions are conducted live every week in two convenient batches: Wednesday Evening from 6:00 PM to 9:00 PM IST, and Sunday Morning from 10:00 AM to 1:00 PM IST. You can select your preferred session date and time directly in the registration form."
    },
    {
        q: "Do I need technical or coding skills?",
        a: "Not at all! This masterclass is specially designed for non-technical professionals, coaches, trainers, and business owners. If you can type an email, you can easily use ChatGPT and AI tools with our step-by-step frameworks."
    },
    {
        q: "How much does the masterclass cost and are there hidden charges?",
        a: "The early bird ticket is just ₹99 (discounted from ₹999). There are no hidden fees or recurring subscriptions. Your ₹99 ticket gives you full access to the live 3-hour session and all ₹9,997 worth of bonus resources."
    },
    {
        q: "Will I receive access to session templates and prompts?",
        a: "Yes! All registered participants will receive our 500+ Master ChatGPT Prompts Vault and 30-Day Social Content Calendar free of charge."
    },
    {
        q: "How will I receive the meeting link after registering?",
        a: "Immediately after completing your payment of ₹99 via Razorpay, you will be redirected to our official WhatsApp VIP Community where the live session access link and reminders are shared."
    },
    {
        q: "What if I have questions during the session?",
        a: "We have a dedicated Live Q&A segment at the end of the masterclass where you can ask your specific business automation and prompt engineering questions directly."
    }
];

const AIMasterclassFAQSection: React.FC = () => {
    return (
        <section id="faq" className="py-24 px-4 bg-white border-t border-slate-100">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-xs font-bold text-slate-700 shadow-sm border border-slate-200 mb-6">
                        <HelpCircle className="w-4 h-4 text-blue-600" />
                        FREQUENTLY ASKED QUESTIONS
                    </div>
                    <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-6 tracking-tight">
                        Got <span className="text-blue-600">Questions?</span> We've Got Answers
                    </h2>
                    <p className="text-slate-600 text-lg font-medium max-w-xl mx-auto">
                        Everything you need to know about the AI Secrets Revealed Live Masterclass.
                    </p>
                </div>

                <div className="space-y-4">
                    <Accordion type="single" collapsible className="w-full space-y-4">
                        {faqs.map((faq, i) => (
                            <AccordionItem key={i} value={`faq-${i}`} className="border border-slate-200 bg-slate-50/50 rounded-2xl px-6 sm:px-8 data-[state=open]:bg-white data-[state=open]:border-blue-200 data-[state=open]:shadow-xl transition-all duration-300">
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
