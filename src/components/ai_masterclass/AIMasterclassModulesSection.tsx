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
        <section id="modules" className="py-20 sm:py-28 px-4 bg-[#05070f] relative overflow-hidden">
            <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] bg-sky-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 -right-40 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="max-w-6xl mx-auto relative">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-500/10 rounded-full text-[11px] font-bold uppercase tracking-widest text-indigo-200 border border-indigo-400/20 mb-4">
                        <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                        <span>Executive Syllabus & Modules</span>
                    </div>
                    <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
                        Structured <span className="bg-gradient-to-r from-sky-300 via-indigo-300 to-violet-300 bg-clip-text text-transparent">3-Hour Live Curriculum</span>
                    </h2>
                    <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Focused on practical implementation. Every module includes live workflow demonstrations, enterprise tools, and downloadable templates.
                    </p>
                </div>

                {/* Modules Grid */}
                <div className="space-y-6 mb-14">
                    {modules.map((m) => (
                        <div
                            key={m.id}
                            className="group relative bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8 hover:border-indigo-400/40 hover:bg-white/[0.045] hover:shadow-[0_30px_80px_-40px_rgba(99,102,241,0.7)] transition-all duration-300"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                                {/* Left: Number & Header */}
                                <div className="lg:col-span-4 flex flex-col justify-between h-full">
                                    <div>
                                        <div className="flex items-center gap-2.5 mb-3">
                                            <span className="text-[11px] font-bold text-white bg-gradient-to-r from-indigo-500 to-sky-500 px-3 py-1 rounded-md uppercase tracking-wider shadow-md shadow-indigo-500/30">
                                                {m.label}
                                            </span>
                                            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5 text-sky-400" /> {m.duration}
                                            </span>
                                        </div>

                                        <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 leading-snug">
                                            {m.title}
                                        </h3>

                                        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4">
                                            {m.desc}
                                        </p>
                                    </div>

                                    {/* Tools Pill Bar */}
                                    <div className="pt-3 border-t border-white/[0.08]">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                                            Frameworks & Tools Covered:
                                        </span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {m.tools.map((t, idx) => (
                                                <span key={idx} className="text-[11px] font-semibold text-slate-300 bg-white/[0.04] border border-white/10 px-2.5 py-1 rounded-md">
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Key Topics & Practical Deliverable */}
                                <div className="lg:col-span-8 bg-[#0a0e1c]/70 border border-white/[0.08] rounded-xl p-5 sm:p-6 flex flex-col justify-between h-full">
                                    <div>
                                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-3">
                                            Key Implementation Topics:
                                        </span>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                                            {m.points.map((pt, idx) => (
                                                <div key={idx} className="flex items-start gap-2.5">
                                                    <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                                                    <span className="text-xs sm:text-sm text-slate-300 leading-snug font-medium">
                                                        {pt}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Deliverable Badge */}
                                    <div className="bg-gradient-to-r from-indigo-500/15 to-sky-500/5 border border-indigo-400/30 rounded-xl p-3.5 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-sky-500 text-white flex items-center justify-center shrink-0 font-bold text-xs shadow-md shadow-indigo-500/40">
                                            ✓
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold text-sky-300 uppercase tracking-wider block">
                                                Executive Outcome & Deliverable:
                                            </span>
                                            <span className="text-xs font-bold text-white">
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
                        className="bg-gradient-to-r from-indigo-500 via-blue-500 to-sky-500 hover:brightness-110 text-white font-bold text-sm sm:text-base px-8 py-4 rounded-xl shadow-[0_12px_40px_-10px_rgba(99,102,241,0.8)] hover:-translate-y-0.5 ring-1 ring-white/15 transition-all inline-flex items-center gap-2 cursor-pointer"
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
