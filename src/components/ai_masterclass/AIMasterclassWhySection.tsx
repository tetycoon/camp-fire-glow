import React from "react";
import { AlertCircle, Target, Zap } from "lucide-react";

const features = [
    {
        icon: <AlertCircle className="w-8 h-8 text-red-500" />,
        title: "Time Drain",
        description: "Professionals spend 30+ hours a week on manual content and follow-ups. AI cuts this by 80%.",
        border: "border-red-100",
        bg: "bg-red-50"
    },
    {
        icon: <Target className="w-8 h-8 text-amber-500" />,
        title: "No Strategy",
        description: "Posting randomly leads to zero conversion. We build AI-powered lead funnels that work.",
        border: "border-amber-100",
        bg: "bg-amber-50"
    },
    {
        icon: <Zap className="w-8 h-8 text-brandGreen" />,
        title: "The AI Solution",
        description: "Build automated systems that generate leads and content while you sleep.",
        border: "border-[#b5d88f]/30",
        bg: "bg-[#b5d88f]/10"
    }
];

const AIMasterclassWhySection: React.FC = () => {
    return (
        <section id="about" className="py-24 px-4 bg-gray-50 border-y border-gray-100">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <div className="inline-block px-4 py-2 bg-white rounded-full text-sm font-bold text-slate-600 shadow-sm border border-gray-200 mb-6">
                        💡 The Why
                    </div>
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 mb-6 tracking-tight">
                        Why Your Marketing <span className="text-red-600">Isn't Working</span>
                    </h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        Most professionals chase leads and create content manually.
                        AI changes the game by automating the grunt work.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((f, i) => (
                        <div
                            key={i}
                            className={`p-10 rounded-3xl border ${f.border} ${f.bg} transition-transform hover:-translate-y-1 duration-300 shadow-sm`}
                        >
                            <div className="mb-6 bg-white w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm border border-gray-100">
                                {f.icon}
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-4">{f.title}</h3>
                            <p className="text-slate-600 leading-relaxed font-medium">{f.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default AIMasterclassWhySection;
