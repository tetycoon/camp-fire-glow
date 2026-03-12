import React from "react";
import { AlertCircle, Target, Zap } from "lucide-react";

const features = [
    {
        icon: <AlertCircle className="w-8 h-8 text-red-400" />,
        title: "Time Drain",
        description: "Professionals spend 30+ hours a week on manual content and follow-ups. AI cuts this by 80%.",
        border: "border-red-500/20",
        bg: "bg-red-500/5"
    },
    {
        icon: <Target className="w-8 h-8 text-amber-400" />,
        title: "No Strategy",
        description: "Posting randomly leads to zero conversion. We build AI-powered lead funnels that work.",
        border: "border-amber-500/20",
        bg: "bg-amber-500/5"
    },
    {
        icon: <Zap className="w-8 h-8 text-emerald-400" />,
        title: "The AI Solution",
        description: "Build automated systems that generate leads and content while you sleep.",
        border: "border-emerald-500/20",
        bg: "bg-emerald-500/5"
    }
];

const AIMasterclass2WhySection: React.FC = () => {
    return (
        <section id="about" className="section-border py-32 px-4 relative overflow-hidden">
            <div className="absolute inset-0 grid-bg opacity-10" />
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <div className="section-label mb-4 mx-auto w-fit">💡 The Why</div>
                    <h2 className="font-display text-4xl sm:text-6xl font-black text-foreground mb-6">
                        Why Your Marketing <span className="text-gradient-green italic">Isn't Working</span>
                    </h2>
                    <p className="font-body text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
                        Most professionals chase leads and create content manually.
                        AI changes the game by automating the grunt work.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((f, i) => (
                        <div
                            key={i}
                            className={`p-10 rounded-3xl border ${f.border} ${f.bg} backdrop-blur-sm transition-all hover:-translate-y-2 duration-300`}
                        >
                            <div className="mb-6">{f.icon}</div>
                            <h3 className="font-display text-2xl font-bold mb-4 italic">{f.title}</h3>
                            <p className="font-body text-muted-foreground leading-relaxed">{f.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default AIMasterclass2WhySection;
