import React, { useState } from "react";
import { Sparkles, Terminal, Briefcase, BookOpen, CheckCircle2, Clock, Wrench, ArrowRight } from "lucide-react";
import { useAIMasterclassRegisterModal } from "./AIMasterclassRegisterModalContext";

const modules = [
    {
        id: "module-1",
        number: "01",
        label: "Module 1",
        duration: "45 Minutes",
        icon: Sparkles,
        title: "AI Fundamentals & ChatGPT Customization",
        desc: "Transform ChatGPT from a generic chatbot into your personalized 24/7 business consultant that understands your specific industry and voice.",
        tools: ["ChatGPT-4o", "Claude 3.5 Sonnet", "Custom Instructions"],
        deliverable: "A fully calibrated AI assistant configured for your business niche.",
        points: [
            "Demystifying AI: How Large Language Models actually process business tasks",
            "Configuring ChatGPT Custom Instructions and memory for personalized responses",
            "Setting up multi-role AI personas (Copywriter, Business Strategist, Customer Rep)",
            "Avoiding common AI hallucinations and ensuring factual business outputs"
        ]
    },
    {
        id: "module-2",
        number: "02",
        label: "Module 2",
        duration: "60 Minutes",
        icon: Terminal,
        title: "Master Prompt Engineering with Proven Templates",
        desc: "Stop getting mediocre AI outputs. Master the frameworks used by top prompt engineers to generate high-converting copy, marketing funnels, and sales scripts.",
        tools: ["RTFC Framework", "Few-Shot Prompting", "Chain of Thought"],
        deliverable: "50+ Copy-paste prompt templates ready for immediate client acquisition.",
        points: [
            "The 4-step framework to get 10x better outputs on your very first try",
            "Crafting high-converting social media posts, Reels scripts, and LinkedIn articles",
            "Writing persuasive sales emails, cold outreach messages, and WhatsApp follow-ups",
            "Iterative prompt refinement: Guiding the AI to polish and perfect any output"
        ]
    },
    {
        id: "module-3",
        number: "03",
        label: "Module 3",
        duration: "75 Minutes",
        icon: Briefcase,
        title: "Building an End-to-End AI-Powered Business",
        desc: "Witness how an entire digital brand — from name and logo to promo video and lead magnet — can be created in minutes without hiring an agency.",
        tools: ["Canva AI", "Gamma App", "ElevenLabs", "Midjourney"],
        deliverable: "A full digital marketing pack: Logo, Banner, Slogan, Video Script & Presentation.",
        points: [
            "Brainstorming high-recall Business Names, Catchy Slogans, and Brand Identity",
            "Generating eye-catching promotional banners, thumbnails, and social media flyers",
            "Creating AI voiceovers and high-impact short-form videos with zero video skills",
            "Building automated lead magnets and presentations in under 10 minutes"
        ]
    }
];

const AIMasterclassModulesSection: React.FC = () => {
    const { openRegisterModal } = useAIMasterclassRegisterModal();
    const [activeTab, setActiveTab] = useState<string>("all");

    return (
        <section id="modules" className="py-20 sm:py-24 px-4 bg-white relative">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 rounded-full text-xs font-bold text-blue-700 border border-blue-200 mb-4">
                        <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                        <span>Curriculum Overview</span>
                    </div>
                    <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
                        What You Will Learn In <span className="text-blue-600">3 Intensive Hours</span>
                    </h2>
                    <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        No boring theory or complicated jargon. Every minute is packed with live demonstrations, practical tools, and immediately usable templates.
                    </p>
                </div>

                {/* Modules Grid */}
                <div className="space-y-6 mb-14">
                    {modules.map((m) => {
                        const Icon = m.icon;
                        return (
                            <div
                                key={m.id}
                                className="bg-slate-50/70 border border-slate-200/90 rounded-3xl p-6 sm:p-8 hover:bg-white hover:border-blue-300 hover:shadow-xl transition-all duration-300"
                            >
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                                    {/* Left: Icon, Number & Header */}
                                    <div className="lg:col-span-4 flex flex-col justify-between h-full">
                                        <div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="text-xs font-black text-blue-700 bg-blue-100/70 border border-blue-200 px-3 py-1 rounded-full uppercase tracking-wider">
                                                    {m.label}
                                                </span>
                                                <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5 text-slate-400" /> {m.duration}
                                                </span>
                                            </div>

                                            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-3 leading-snug">
                                                {m.title}
                                            </h3>

                                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                                                {m.desc}
                                            </p>
                                        </div>

                                        {/* Tools Pill Bar */}
                                        <div className="pt-3 border-t border-slate-200/60">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                                                Tools Covered:
                                            </span>
                                            <div className="flex flex-wrap gap-1.5">
                                                {m.tools.map((t, idx) => (
                                                    <span key={idx} className="text-[11px] font-bold text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
                                                        {t}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Key Topics & Practical Deliverable */}
                                    <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
                                        <div>
                                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block mb-3">
                                                Practical Step-by-Step Breakdown:
                                            </span>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                                                {m.points.map((pt, idx) => (
                                                    <div key={idx} className="flex items-start gap-2.5">
                                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                                        <span className="text-xs sm:text-sm text-slate-700 leading-snug font-medium">
                                                            {pt}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Deliverable Badge */}
                                        <div className="bg-emerald-50 border border-emerald-200/90 rounded-xl p-3 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                                                ✓
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider block">
                                                    What You Walk Away With:
                                                </span>
                                                <span className="text-xs font-bold text-slate-900">
                                                    {m.deliverable}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Bottom CTA Banner */}
                <div className="text-center bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-left">
                        <h4 className="text-lg font-black text-slate-900">Get All 3 Modules For Just ₹99</h4>
                        <p className="text-xs sm:text-sm text-slate-500">Pick Wednesday Evening or Sunday Morning at registration.</p>
                    </div>

                    <button
                        onClick={openRegisterModal}
                        className="bg-brandGreen hover:bg-[#a3c77e] text-slate-900 font-black text-sm px-7 py-3.5 rounded-xl border border-[#95c06b] shadow-sm hover:scale-105 transition-all cursor-pointer whitespace-nowrap"
                    >
                        ENROLL FOR ₹99 TODAY
                    </button>
                </div>
            </div>
        </section>
    );
};

export default AIMasterclassModulesSection;
