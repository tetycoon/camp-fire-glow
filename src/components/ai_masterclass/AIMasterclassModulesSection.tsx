import React from "react";
import { BookOpen, Box, Cpu, Globe, CheckCircle2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { useAIMasterclassRegisterModal } from "./AIMasterclassRegisterModalContext";

const modules = [
    {
        id: "module-1",
        label: "Module 1",
        title: "Concept of AI",
        desc: "Understanding Generative AI, LLMs, and the shift from manual to automated systems.",
        points: [
            "What is Generative AI and how it actually works",
            "The evolution from manual tasks to AI pipelines",
            "Setting up your first AI workspace"
        ]
    },
    {
        id: "module-2",
        label: "Module 2",
        title: "Power of AI in Digital Marketing",
        desc: "Build AI pipelines for social content and high-value lead generation funnels.",
        points: [
            "Creating a content calendar in 5 minutes",
            "Automating lead generation and capture",
            "Writing high-converting landing page copy"
        ]
    },
    {
        id: "module-3",
        label: "Module 3",
        title: "10+ AI Tools for Productivity",
        desc: "Master ChatGPT, Claude, Napkin AI, Finalround AI, and Kling/flow AI for high-quality video generation.",
        points: [
            "Advanced Prompting techniques for ChatGPT & Claude",
            "Creating stunning visuals & decks with Napkin AI & Finalround AI",
            "Professional Video Generation with Kling/flow AI"
        ]
    }
];

const AIMasterclassModulesSection: React.FC = () => {
    const { openRegisterModal } = useAIMasterclassRegisterModal();

    return (
        <section id="modules" className="py-24 px-4 bg-white relative">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <div className="inline-block px-4 py-2 bg-gray-50 rounded-full text-sm font-bold text-slate-600 shadow-sm border border-gray-200 mb-6">
                        📚 Curriculum
                    </div>
                    <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-6 tracking-tight">
                        What You Will <span className="text-blue-600">Learn</span>
                    </h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Three comprehensive modules designed to take you from AI novice to power user.
                    </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-10 shadow-xl shadow-blue-900/5 mb-12">
                    <Accordion type="single" collapsible className="w-full space-y-4" defaultValue="module-1">
                        {modules.map((m) => (
                            <AccordionItem key={m.id} value={m.id} className="border border-gray-100 bg-gray-50/50 rounded-2xl px-6 data-[state=open]:bg-white data-[state=open]:border-blue-100 data-[state=open]:shadow-md transition-all">
                                <AccordionTrigger className="hover:no-underline py-6">
                                    <div className="flex flex-col md:flex-row md:items-center text-left gap-2 md:gap-6">
                                        <div className="flex-shrink-0 text-sm font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-md w-fit">
                                            {m.label}
                                        </div>
                                        <h3 className="text-xl md:text-2xl font-black text-slate-900">{m.title}</h3>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pb-6 pt-2">
                                    <p className="text-slate-600 text-base mb-6 leading-relaxed">
                                        {m.desc}
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {m.points.map((point, idx) => (
                                            <div key={idx} className="flex items-start gap-3">
                                                <CheckCircle2 className="w-5 h-5 text-brandGreen flex-shrink-0 mt-0.5" />
                                                <span className="text-slate-700 font-medium">{point}</span>
                                            </div>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
                
                <div className="flex justify-center">
                    <button
                        onClick={openRegisterModal}
                        className="bg-brandGreen hover:bg-[#a3c77e] text-slate-900 text-lg font-black px-12 py-5 rounded-lg transition-transform hover:scale-[1.02] shadow-xl shadow-green-900/10 border border-[#a3c77e]"
                    >
                        GET MY DISCOUNTED SEAT
                    </button>
                </div>
            </div>
        </section>
    );
};

export default AIMasterclassModulesSection;
