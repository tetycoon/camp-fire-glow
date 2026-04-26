import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
    {
        q: "Do I need prior AI experience?",
        a: "No prior AI experience is needed. However, this is an advanced business workshop — you should have a basic understanding of digital marketing and business fundamentals. We'll guide you through every AI tool step by step."
    },
    {
        q: "What should I bring?",
        a: "A laptop is mandatory — we build live at the venue. Make sure it's fully charged. A notebook for personal notes is recommended, though we provide a printed workbook with all frameworks."
    },
    {
        q: "What's included in the ₹4,999 fee?",
        a: "Everything: Full-day workshop (9:30 AM – 5:30 PM), printed practical workbook, executive networking lunch, morning and evening tea/coffee, post-event WhatsApp support group, and a participation certificate."
    },
    {
        q: "Is there a refund policy?",
        a: "Due to limited seats (30 per batch) and venue commitments, we offer seat transfers to a future batch but no monetary refunds. You can transfer your seat to another person at no extra cost."
    },
    {
        q: "How is this different from online AI courses?",
        a: "Online courses give you theory. Here, you build real AI systems live with expert guidance. You leave with a working AI business framework, not just knowledge. Plus, the networking with 29 other professionals is invaluable."
    },
    {
        q: "Is parking available at the venue?",
        a: "Yes, Vestin Park Hotel in Egmore has parking facilities. The venue is also easily accessible via Egmore Railway Station and public transport."
    },
    {
        q: "Will I get recordings of the session?",
        a: "No. This is a premium in-person experience designed for focused execution. The printed workbook serves as your permanent reference material with all frameworks and prompt architectures covered."
    },
    {
        q: "Can I attend with a colleague?",
        a: "Absolutely! Each person needs a separate ticket and seat reservation. Contact us at +91 70103 40494 for group booking assistance."
    }
];

const UpscaleFAQ: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section id="faq" className="py-24 px-6 bg-slate-50">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-slate-200 shadow-sm">
                        ❓ FREQUENTLY ASKED QUESTIONS
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-black text-slate-900 leading-tight mb-6 tracking-tighter">
                        Got Questions?<br />
                        <span className="text-blue-600 italic">We've Got Answers.</span>
                    </h2>
                </div>

                <div className="space-y-3">
                    {faqs.map((faq, i) => (
                        <div 
                            key={i} 
                            className={`rounded-[24px] border transition-all duration-300 overflow-hidden ${
                                openIndex === i 
                                    ? "bg-white border-blue-200 shadow-lg shadow-blue-500/5" 
                                    : "bg-white border-slate-100 hover:border-slate-200"
                            }`}
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                className="w-full flex items-center justify-between px-8 py-6 text-left group"
                            >
                                <span className={`text-base font-black transition-colors ${openIndex === i ? "text-blue-600" : "text-slate-900"}`}>
                                    {faq.q}
                                </span>
                                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 shrink-0 ml-4 ${openIndex === i ? "rotate-180 text-blue-600" : ""}`} />
                            </button>
                            <div className={`transition-all duration-300 ${openIndex === i ? "max-h-60 opacity-100" : "max-h-0 opacity-0"} overflow-hidden`}>
                                <div className="px-8 pb-6 text-slate-500 font-medium leading-relaxed text-[15px]">
                                    {faq.a}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default UpscaleFAQ;
