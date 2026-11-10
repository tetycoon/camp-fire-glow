import React from "react";
import { Sparkles, Terminal, Briefcase, BookOpen, CheckCircle2, Clock, ArrowRight } from "lucide-react";
import { useAIMasterclassRegisterModal } from "./AIMasterclassRegisterModalContext";

const modules = [
    {
        id: "module-1",
        number: "01",
        label: "Module 01",
        duration: "45 Minutes",
        icon: Sparkles,
        title: "AI Fundamentals & Custom Executive Assistants",
        desc: "Configure ChatGPT and Claude into a specialized 24/7 strategic business advisor aligned with your industry, brand tone, and operational standards.",
        tools: ["ChatGPT-4o", "Claude 3.5 Sonnet", "Custom Instructions"],
        deliverable: "A calibrated AI business assistant tailored to your organization's domain.",
        points: [
            "Executive overview: How Large Language Models process complex business tasks",
            "Configuring persistent Custom Instructions and organizational memory",
            "Deploying specialized AI personas (Strategy, Copywriting, Client Operations)",
            "Eliminating AI hallucinations and ensuring reliable, verifiable outputs"
        ]
    },
    {
        id: "module-2",
        number: "02",
        label: "Module 02",
        duration: "60 Minutes",
        icon: Terminal,
        title: "Structured Prompt Engineering & Business Frameworks",
        desc: "Master structured prompting architectures used by enterprise teams to produce executive reports, marketing funnels, and high-converting sales assets.",
        tools: ["RTFC Framework", "Few-Shot Prompting", "Chain-of-Thought"],
        deliverable: "50+ enterprise-ready prompt templates for marketing, sales, and operations.",
        points: [
            "The 4-part structured prompt architecture for consistent first-pass accuracy",
            "Generating high-authority LinkedIn articles, video scripts, and campaign copy",
            "Drafting persuasive B2B/B2C proposals, outreach sequences, and follow-ups",
            "Iterative prompt refinement workflows for executive-level quality control"
        ]
    },
    {
        id: "module-3",
        number: "03",
        label: "Module 03",
        duration: "75 Minutes",
        icon: Briefcase,
        title: "End-to-End AI Brand, Media & Presentation Automation",
        desc: "Experience a live end-to-end build of a complete corporate digital presence—from brand identity and collateral to pitch decks and video assets.",
        tools: ["Canva AI", "Gamma App", "ElevenLabs", "Midjourney"],
        deliverable: "Complete digital brand kit: Identity, Collateral, Pitch Deck & Video Script.",
        points: [
            "Developing brand positioning, corporate naming, and value propositions",
            "Designing professional marketing creatives and social media campaigns",
            "Producing studio-grade AI voiceovers and promotional videos without a studio",
            "Generating client-ready slide decks and business proposals in under 10 minutes"
        ]
    }
];

const AIMasterclassModulesSection: React.FC = () => {
    const { openRegisterModal } = useAIMasterclassRegisterModal();

    return (
        <section id="modules" className="py-20 sm:py-24 px-4 bg-gradient-to-b from-slate-50/80 via-white to-slate-50/80 relative overflow-hidden">
            {/* Background ambient lighting */}
            <div className="absolute top-1/3 left-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white rounded-md text-[11px] font-bold uppercase tracking-widest text-blue-700 border border-slate-200 shadow-2xs mb-4">
                        <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                        <span>Executive Syllabus & Modules</span>
                    </div>
                    <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
                        Structured <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">3-Hour Live Curriculum</span>
                    </h2>
                    <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        Focused on practical implementation. Every module includes live workflow demonstrations, enterprise tools, and downloadable templates.
                    </p>
                </div>

                {/* Modules Grid */}
                <div className="space-y-6 mb-14">
                    {modules.map((m) => (
                        <div
                            key={m.id}
                            className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 hover:border-blue-400/40 shadow-[0_10px_30px_rgba(15,23,42,0.03)] hover:shadow-[0_20px_40px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 transition-all duration-300"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                                {/* Left: Number & Header */}
                                <div className="lg:col-span-4 flex flex-col justify-between h-full">
                                    <div>
                                        <div className="flex items-center gap-2.5 mb-3">
                                            <span className="text-[11px] font-bold text-white bg-slate-900 px-3 py-1 rounded-md uppercase tracking-wider shadow-2xs">
                                                {m.label}
                                            </span>
                                            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5 text-blue-600" /> {m.duration}
                                            </span>
                                        </div>

                                        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 leading-snug">
                                            {m.title}
                                        </h3>

                                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                                            {m.desc}
                                        </p>
                                    </div>

                                    {/* Tools Pill Bar */}
                                    <div className="pt-3 border-t border-slate-100">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                                            Frameworks & Tools Covered:
                                        </span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {m.tools.map((t, idx) => (
                                                <span key={idx} className="text-[11px] font-semibold text-slate-700 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md">
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Key Topics & Practical Deliverable */}
                                <div className="lg:col-span-8 bg-slate-50/80 border border-slate-200/80 rounded-xl p-5 sm:p-6 flex flex-col justify-between h-full">
                                    <div>
                                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-3">
                                            Key Implementation Topics:
                                        </span>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                                            {m.points.map((pt, idx) => (
                                                <div key={idx} className="flex items-start gap-2.5">
                                                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                                                    <span className="text-xs sm:text-sm text-slate-700 leading-snug font-medium">
                                                        {pt}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Deliverable Badge */}
                                    <div className="bg-white border border-blue-200/80 rounded-xl p-3.5 flex items-center gap-3 shadow-2xs">
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 font-bold text-xs shadow-xs">
                                            ✓
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                                                Executive Outcome & Deliverable:
                                            </span>
                                            <span className="text-xs font-bold text-slate-900">
                                                {m.deliverable}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <div className="text-center">
                    <button
                        onClick={openRegisterModal}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm sm:text-base px-8 py-4 rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all inline-flex items-center gap-2 cursor-pointer"
                    >
                        <span>Enroll in the Full 3-Hour Program — ₹99</span>
                        <ArrowRight className="w-4 h-4 text-white" />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default AIMasterclassModulesSection;
