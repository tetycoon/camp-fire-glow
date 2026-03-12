import React from "react";
import { BookOpen, Box, Cpu, Globe, Rocket, Sparkles, Smartphone, BarChart3 } from "lucide-react";

const modules = [
    {
        id: "01",
        title: "Concept of AI",
        desc: "Understanding Generative AI, LLMs, and the shift from manual to automated systems.",
        icon: <Cpu className="w-5 h-5" />,
        color: "emerald"
    },
    {
        id: "02",
        title: "Power of AI in Digital Marketing",
        desc: "Build AI pipelines for social content and high-value lead generation funnels.",
        icon: <Globe className="w-5 h-5" />,
        color: "blue"
    },
    {
        id: "03",
        title: "10+ AI Tools for Productivity Audience",
        desc: "Master ChatGPT, Claude, Midjourney, Canva AI, and professional automation tools.",
        icon: <Box className="w-5 h-5" />,
        color: "amber"
    }
];

const AIMasterclass2ModulesSection: React.FC = () => {
    return (
        <section id="modules" className="section-border py-32 px-4 relative bg-gradient-to-b from-background via-blue-950/20 to-background">
            <div className="max-w-5xl mx-auto px-4 lg:px-8">
                <div className="text-left mb-16">
                    <div className="section-label mb-4 w-fit">📚 Curriculum</div>
                    <h2 className="font-display text-4xl sm:text-6xl font-black text-foreground mb-6">
                        What You Will <span className="text-gradient-green italic">Learn</span>
                    </h2>
                    <p className="font-body text-muted-foreground max-w-2xl text-lg">
                        Three comprehensive modules designed to take you from AI novice to power user.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {modules.map((m) => (
                        <div
                            key={m.id}
                            className="p-8 rounded-3xl bg-muted/30 border border-white/5 hover:border-emerald-500/30 transition-all hover:-translate-y-1 group"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className={`p-3 rounded-2xl bg-${m.color}-500/10 text-${m.color}-400 group-hover:scale-110 transition-transform`}>
                                    {m.icon}
                                </div>
                                <span className="font-display text-3xl font-black opacity-10 italic">{m.id}</span>
                            </div>
                            <h3 className="font-display text-xl font-bold mb-3 italic">{m.title}</h3>
                            <p className="font-body text-sm text-muted-foreground leading-relaxed">{m.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default AIMasterclass2ModulesSection;
