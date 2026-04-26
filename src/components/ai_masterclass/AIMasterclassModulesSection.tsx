import React from "react";
import { CheckCircle2, Sparkles, Terminal, Briefcase, ChevronDown } from "lucide-react";
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
        icon: Sparkles,
        title: "Intro to AI & ChatGPT Personalization",
        desc: "Learn the fundamentals of Artificial Intelligence and how to customize ChatGPT settings to generate highly effective and tailored results.",
        points: [
            "Introduction to AI concepts and capabilities",
            "Navigating ChatGPT settings and features",
            "Personalizing ChatGPT for your specific use cases"
        ]
    },
    {
        id: "module-2",
        label: "Module 2",
        icon: Terminal,
        title: "Prompt Engineering with Practical Examples",
        desc: "Master the art of crafting precise and powerful prompts to extract the best possible outputs from AI models.",
        points: [
            "Fundamentals of effective prompt engineering",
            "Real-world practical examples and templates",
            "Iterative prompting strategies for complex tasks"
        ]
    },
    {
        id: "module-3",
        label: "Module 3",
        icon: Briefcase,
        title: "Building an AI-Powered Business",
        desc: "Discover exactly what you need to start and run a business using AI, from foundational branding to digital presence.",
        points: [
            "Generating an engaging Business Name, Logo, Phrase & Slogan",
            "Creating a professional Website and promotional Banners",
            "Producing high-quality Videos utilizing AI tools"
        ]
    }
];

const AIMasterclassModulesSection: React.FC = () => {
    const { openRegisterModal } = useAIMasterclassRegisterModal();

    return (
        <section id="modules" className="py-24 px-4 relative overflow-hidden bg-slate-50">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-white to-transparent pointer-events-none"></div>
            <div className="absolute -top-[200px] -right-[200px] w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
            <div className="absolute -bottom-[200px] -left-[200px] w-[600px] h-[600px] bg-green-100/50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

            <div className="max-w-4xl mx-auto relative z-10">
                <div className="text-center mb-16 relative">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-sm font-bold text-slate-700 shadow-sm border border-gray-200 mb-6 transition-transform hover:-translate-y-1">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                        Comprehensive Curriculum
                    </div>
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
                        What You Will <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Learn</span>
                    </h2>
                    <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-medium">
                        Three comprehensive modules designed to take you from AI novice to power user with actionable, real-world skills.
                    </p>
                </div>

                <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-[2.5rem] p-6 md:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] mb-12">
                    <Accordion type="single" collapsible className="w-full space-y-6" defaultValue="module-1">
                        {modules.map((m) => {
                            const Icon = m.icon;
                            return (
                                <AccordionItem 
                                    key={m.id} 
                                    value={m.id} 
                                    className="border border-gray-100/80 bg-white rounded-3xl px-6 data-[state=open]:border-blue-200 data-[state=open]:shadow-[0_8px_30px_rgba(59,130,246,0.1)] data-[state=open]:ring-1 data-[state=open]:ring-blue-100 transition-all duration-300 overflow-hidden group"
                                >
                                    <AccordionTrigger className="hover:no-underline py-8">
                                        <div className="flex flex-col md:flex-row md:items-center text-left gap-4 md:gap-6 w-full pr-4">
                                            {/* Icon Box */}
                                            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/50 flex items-center justify-center group-data-[state=open]:scale-110 transition-transform duration-500 shadow-inner">
                                                <Icon className="w-8 h-8 text-blue-600" />
                                            </div>
                                            
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="text-xs font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-md">
                                                        {m.label}
                                                    </span>
                                                </div>
                                                <h3 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
                                                    {m.title}
                                                </h3>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pb-8 pt-2">
                                        <div className="pl-0 md:pl-[5.5rem]">
                                            <p className="text-slate-600 text-lg mb-8 leading-relaxed font-medium">
                                                {m.desc}
                                            </p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                                {m.points.map((point, idx) => (
                                                    <div key={idx} className="flex items-start gap-3 group/point">
                                                        <div className="mt-1 bg-white rounded-full shadow-sm p-0.5 group-hover/point:scale-110 transition-transform">
                                                            <CheckCircle2 className="w-5 h-5 text-brandGreen flex-shrink-0" />
                                                        </div>
                                                        <span className="text-slate-700 font-semibold leading-snug">{point}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            );
                        })}
                    </Accordion>
                </div>
                
                <div className="flex justify-center relative">
                    <div className="absolute inset-0 bg-brandGreen blur-2xl opacity-20 rounded-full w-3/4 mx-auto pointer-events-none"></div>
                    <button
                        onClick={openRegisterModal}
                        className="relative bg-brandGreen hover:bg-[#95c06b] text-slate-900 text-xl font-black px-14 py-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 shadow-[0_20px_40px_rgba(163,199,126,0.3)] border border-[#a3c77e] flex items-center justify-center gap-3 w-full sm:w-auto"
                    >
                        GET MY DISCOUNTED SEAT
                        <Sparkles className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default AIMasterclassModulesSection;

