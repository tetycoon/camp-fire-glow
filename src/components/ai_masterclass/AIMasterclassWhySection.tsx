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
        <section id="about" className="py-20 sm:py-24 px-4 bg-white border-y border-slate-200/80 relative">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-slate-100 rounded-md text-[11px] font-bold uppercase tracking-widest text-slate-700 border border-slate-200 mb-4">
                        <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                        <span>Enterprise Productivity Benchmark</span>
                    </div>
                    <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
                        Why Modern Organizations Are <span className="text-blue-600">Upgrading Operations</span> With AI
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
                            className="bg-slate-50/60 rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-xs hover:shadow-lg hover:bg-white transition-all duration-300 flex flex-col justify-between"
                        >
                            <div>
                                <div className="inline-block px-3 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-6">
                                    {c.metric}
                                </div>

                                <div className="space-y-4">
                                    {/* Without AI */}
                                    <div className="p-4 rounded-xl bg-white border border-slate-200">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                            <AlertCircle className="w-4 h-4 text-slate-400" />
                                            <span>Traditional Manual Workflow</span>
                                        </div>
                                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                            {c.withoutAi}
                                        </p>
                                    </div>

                                    {/* With AI */}
                                    <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200">
                                        <div className="flex items-center gap-2 text-xs font-bold text-blue-800 uppercase tracking-wider mb-1.5">
                                            <CheckCircle2 className="w-4 h-4 text-blue-600" />
                                            <span>AI-Enabled Executive Workflow</span>
                                        </div>
                                        <p className="text-xs sm:text-sm text-slate-900 font-medium leading-relaxed">
                                            {c.withAi}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Corporate Value Callout Strip */}
                <div className="bg-slate-900 rounded-2xl p-7 sm:p-9 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-slate-800">
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
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap"
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
