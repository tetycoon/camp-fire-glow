import React from "react";
import { AlertCircle, CheckCircle2, TrendingUp, Zap, Clock, Users } from "lucide-react";
import { useAIMasterclassRegisterModal } from "./AIMasterclassRegisterModalContext";

const comparisons = [
    {
        withoutAi: "Spending 15–20 hours a week struggling to write emails, captions, and blogs manually.",
        withAi: "Generate a month's worth of high-converting content, emails, and lead magnets in 45 minutes.",
        metric: "80% Time Saved"
    },
    {
        withoutAi: "Hiring expensive agencies or designers for simple logos, banners, and landing page copy.",
        withAi: "Create professional branding, graphic assets, and video scripts in minutes with modern AI tools.",
        metric: "Save ₹30,000+/mo"
    },
    {
        withoutAi: "Chasing cold leads manually without a predictable lead capture or automated follow-up.",
        withAi: "Deploy 24/7 automated AI lead funnels that qualify and nurture prospects while you sleep.",
        metric: "3x More Inquiries"
    }
];

const AIMasterclassWhySection: React.FC = () => {
    const { openRegisterModal } = useAIMasterclassRegisterModal();

    return (
        <section id="about" className="py-20 sm:py-24 px-4 bg-slate-50/70 border-y border-slate-200/80 relative">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white rounded-full text-xs font-bold text-slate-700 shadow-xs border border-slate-200 mb-4">
                        <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                        <span>The AI Productivity Shift</span>
                    </div>
                    <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
                        Why Modern Businesses Are <span className="text-blue-600">Replacing Hustle</span> With AI
                    </h2>
                    <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        The gap between struggling business owners and 7-figure brands isn't hard work — it's leverage. Here is what happens when you install AI into your daily operations.
                    </p>
                </div>

                {/* Comparison Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                    {comparisons.map((c, i) => (
                        <div 
                            key={i} 
                            className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                        >
                            <div>
                                <div className="inline-block px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold uppercase tracking-wide mb-6">
                                    {c.metric}
                                </div>

                                <div className="space-y-5">
                                    {/* Without AI */}
                                    <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100">
                                        <div className="flex items-center gap-2 text-xs font-black text-rose-700 uppercase tracking-wider mb-1.5">
                                            <AlertCircle className="w-4 h-4 text-rose-500" />
                                            <span>Without AI Leverage</span>
                                        </div>
                                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                            {c.withoutAi}
                                        </p>
                                    </div>

                                    {/* With AI */}
                                    <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                                        <div className="flex items-center gap-2 text-xs font-black text-emerald-800 uppercase tracking-wider mb-1.5">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                            <span>With AI Secrets Masterclass</span>
                                        </div>
                                        <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                                            {c.withAi}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Value Callout Strip */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                    <div className="space-y-1 text-center md:text-left">
                        <h3 className="text-xl sm:text-2xl font-black text-white">
                            Ready to stop doing manual busywork?
                        </h3>
                        <p className="text-sm text-slate-300">
                            Join 4,850+ professionals in our next live session for only ₹99.
                        </p>
                    </div>

                    <button
                        onClick={openRegisterModal}
                        className="bg-brandGreen hover:bg-[#a3c77e] text-slate-900 font-black text-sm px-6 py-3.5 rounded-xl border border-[#95c06b] shadow-md hover:scale-105 transition-all cursor-pointer whitespace-nowrap"
                    >
                        CLAIM YOUR SEAT NOW — ₹99
                    </button>
                </div>
            </div>
        </section>
    );
};

export default AIMasterclassWhySection;
