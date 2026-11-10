import React from "react";
import { AlertCircle, CheckCircle2, TrendingUp, ArrowRight } from "lucide-react";
import { useAIMasterclassRegisterModal } from "./AIMasterclassRegisterModalContext";

const comparisons = [
    {
        withoutAi: "Spending 15–20 hours weekly drafting business emails, marketing copy, and client reports manually.",
        withAi: "Produce a full month of executive communication, marketing copy, and proposals in 45 minutes.",
        metric: "80% Time Saved"
    },
    {
        withoutAi: "Retaining expensive external agencies for routine creative assets, presentations, and landing page copy.",
        withAi: "Generate enterprise-grade brand assets, pitch decks, and video scripts internally using AI workflows.",
        metric: "Save ₹30,000+/mo"
    },
    {
        withoutAi: "Following up with prospects inconsistently without a structured qualification or nurturing system.",
        withAi: "Deploy automated 24/7 AI lead qualification and follow-up systems that convert inquiries predictably.",
        metric: "3x Pipeline Output"
    }
];

const AIMasterclassWhySection: React.FC = () => {
    const { openRegisterModal } = useAIMasterclassRegisterModal();

    return (
        <section id="about" className="py-20 sm:py-28 px-4 bg-[#080b17] border-y border-white/[0.06] relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="max-w-7xl mx-auto relative">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-500/10 rounded-full text-[11px] font-bold uppercase tracking-widest text-indigo-200 border border-indigo-400/20 mb-4">
                        <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
                        <span>Enterprise Productivity Benchmark</span>
                    </div>
                    <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
                        Why Modern Organizations Are <span className="bg-gradient-to-r from-sky-300 via-indigo-300 to-violet-300 bg-clip-text text-transparent">Upgrading Operations</span> With AI
                    </h2>
                    <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        High-performing businesses don't scale by adding manual headcount—they scale through operational leverage. Compare traditional execution against AI-enabled workflows.
                    </p>
                </div>

                {/* Comparison Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                    {comparisons.map((c, i) => (
                        <div
                            key={i}
                            className="bg-white/[0.03] backdrop-blur-sm rounded-2xl p-6 sm:p-7 border border-white/10 hover:border-indigo-400/40 hover:bg-white/[0.05] hover:-translate-y-1 hover:shadow-[0_24px_60px_-30px_rgba(99,102,241,0.6)] transition-all duration-300 flex flex-col justify-between"
                        >
                            <div>
                                <div className="inline-block px-3 py-1 rounded-md bg-amber-400/10 border border-amber-300/25 text-amber-200 text-xs font-bold uppercase tracking-wider mb-6">
                                    {c.metric}
                                </div>

                                <div className="space-y-4">
                                    {/* Without AI */}
                                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08]">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                            <AlertCircle className="w-4 h-4 text-slate-500" />
                                            <span>Traditional Manual Workflow</span>
                                        </div>
                                        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                                            {c.withoutAi}
                                        </p>
                                    </div>

                                    {/* With AI */}
                                    <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/15 to-sky-500/5 border border-indigo-400/30">
                                        <div className="flex items-center gap-2 text-xs font-bold text-sky-300 uppercase tracking-wider mb-1.5">
                                            <CheckCircle2 className="w-4 h-4 text-sky-400" />
                                            <span>AI-Enabled Executive Workflow</span>
                                        </div>
                                        <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed">
                                            {c.withAi}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Corporate Value Callout Strip */}
                <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600/25 via-[#0c1024] to-sky-600/20 rounded-2xl p-7 sm:p-9 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_20px_60px_-25px_rgba(99,102,241,0.6)] border border-indigo-400/25">
                    <div className="space-y-1.5 text-center md:text-left">
                        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                            Ready to modernize your daily business operations?
                        </h3>
                        <p className="text-sm text-slate-300">
                            Join 4,850+ business leaders and professionals in our upcoming live cohort for ₹99 (Inclusive of GST).
                        </p>
                    </div>

                    <button
                        onClick={openRegisterModal}
                        className="bg-gradient-to-r from-indigo-500 via-blue-500 to-sky-500 hover:brightness-110 text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-indigo-500/30 ring-1 ring-white/15 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap"
                    >
                        <span>Reserve Your Delegate Seat — ₹99</span>
                        <ArrowRight className="w-4 h-4 text-white" />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default AIMasterclassWhySection;
