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
        <section id="about" className="py-20 sm:py-24 px-4 bg-white border-y border-slate-200/80 relative overflow-hidden">
            {/* Subtle mesh background accent */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-slate-100 rounded-md text-[11px] font-bold uppercase tracking-widest text-slate-700 border border-slate-200 mb-4 shadow-2xs">
                        <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                        <span>Enterprise Productivity Benchmark</span>
                    </div>
                    <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
                        Why Modern Organizations Are <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">Upgrading Operations</span> With AI
                    </h2>
                    <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        High-performing businesses don't scale by adding manual headcount—they scale through operational leverage. Compare traditional execution against AI-enabled workflows.
                    </p>
                </div>

                {/* Comparison Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                    {comparisons.map((c, i) => (
                        <div
                            key={i}
                            className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-[0_10px_30px_rgba(15,23,42,0.04)] hover:shadow-[0_20px_40px_rgba(15,23,42,0.08)] hover:border-blue-400/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
                        >
                            <div>
                                <div className="inline-block px-3 py-1 rounded-md bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/70 text-blue-700 text-xs font-bold uppercase tracking-wider mb-6 group-hover:border-blue-400/50 transition-colors">
                                    {c.metric}
                                </div>

                                <div className="space-y-4">
                                    {/* Without AI */}
                                    <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                            <AlertCircle className="w-4 h-4 text-slate-400" />
                                            <span>Traditional Manual Workflow</span>
                                        </div>
                                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                            {c.withoutAi}
                                        </p>
                                    </div>

                                    {/* With AI */}
                                    <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-blue-50/70 border border-blue-200/90 shadow-2xs">
                                        <div className="flex items-center gap-2 text-xs font-bold text-blue-800 uppercase tracking-wider mb-1.5">
                                            <CheckCircle2 className="w-4 h-4 text-blue-600" />
                                            <span>AI-Enabled Executive Workflow</span>
                                        </div>
                                        <p className="text-xs sm:text-sm text-slate-900 font-semibold leading-relaxed">
                                            {c.withAi}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Corporate Value Callout Strip */}
                <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 rounded-2xl p-7 sm:p-9 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl border border-slate-800/80 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="space-y-1.5 text-center md:text-left relative z-10">
                        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                            Ready to modernize your daily business operations?
                        </h3>
                        <p className="text-sm text-slate-300">
                            Join 4,850+ business leaders and professionals in our upcoming live cohort for ₹99 (Inclusive of GST).
                        </p>
                    </div>

                    <button
                        onClick={openRegisterModal}
                        className="relative z-10 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm px-7 py-4 rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap"
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
