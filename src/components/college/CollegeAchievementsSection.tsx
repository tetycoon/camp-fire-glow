import React from "react";
import { CheckCircle2 } from "lucide-react";
import { useCollegeRegisterModal } from "./CollegeRegisterModalContext";

const achievements = [
    { text: "Build and deploy AI-powered business solutions", color: "text-gold" },
    { text: "Master 20+ industry AI tools used by top companies", color: "text-amber" },
    { text: "Create an AI-optimized LinkedIn profile and portfolio", color: "text-gold" },
    { text: "Earn an industry-recognized AI certification", color: "text-gold" },
    { text: "Develop real-world AI projects for your resume", color: "text-amber" },
    { text: "Launch AI-powered freelance services or side hustles", color: "text-gold" },
    { text: "Build a startup MVP with AI-assisted development", color: "text-amber" },
    { text: "Network with industry experts and potential co-founders", color: "text-gold" },
];

const CollegeAchievementsSection: React.FC = () => {
    const { openRegisterModal } = useCollegeRegisterModal();
    return (
        <section className="section-border py-24 px-4 relative overflow-hidden bg-midnight/30">
            <div className="absolute inset-0 grid-bg opacity-10" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, hsl(45 100% 50% / 0.05), transparent 70%)" }} />
            <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, hsl(28 100% 50% / 0.05), transparent 70%)" }} />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <div className="section-label mb-6 w-fit border-gold/30 text-gold bg-gold/10">🏆 Outcomes</div>
                        <h2 className="font-display text-3xl sm:text-5xl font-bold text-foreground mb-6">
                            What You'll <span className="text-gradient-gold">Achieve</span>
                        </h2>
                        <p className="font-body text-muted-foreground leading-relaxed mb-8">
                            By the end of 30 days, you'll have a professional AI toolkit, real projects in your portfolio, and the confidence to lead in the AI-driven economy.
                        </p>

                        <div className="flex gap-6 flex-wrap">
                            <div className="text-center">
                                <div className="font-display text-3xl font-black text-gradient-gold text-gold">20+</div>
                                <div className="font-body text-xs text-muted-foreground mt-1">AI Tools</div>
                            </div>
                            <div className="w-px bg-gold/20" />
                            <div className="text-center">
                                <div className="font-display text-3xl font-black text-gradient-gold">30</div>
                                <div className="font-body text-xs text-muted-foreground mt-1">Days Program</div>
                            </div>
                            <div className="w-px bg-gold/20" />
                            <div className="text-center">
                                <div className="font-display text-3xl font-black text-gradient-gold text-amber">1</div>
                                <div className="font-body text-xs text-muted-foreground mt-1">Certificate</div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        {achievements.map((item, i) => (
                            <div key={i} className="flex items-start gap-4 p-4 rounded-xl transition-all group cursor-default backdrop-blur-sm"
                                style={{ background: "hsl(224 71% 4%)", border: "1px solid hsl(45 100% 50% / 0.15)" }}
                                onMouseEnter={e => (e.currentTarget.style.borderColor = "hsl(45 100% 50% / 0.4)")}
                                onMouseLeave={e => (e.currentTarget.style.borderColor = "hsl(45 100% 50% / 0.15)")}>
                                <CheckCircle2 className={`w-5 h-5 ${item.color} flex-shrink-0 mt-0.5`} style={{ color: item.color === "text-gold" ? "hsl(45 100% 50%)" : "hsl(28 100% 50%)" }} />
                                <span className="font-body text-sm text-foreground group-hover:text-gold transition-colors">{item.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="text-center mt-16">
                    <button
                        onClick={openRegisterModal}
                        className="btn-gold font-display text-sm font-bold px-10 py-4 rounded-full tracking-widest"
                    >
                        🚀 SECURE YOUR SEAT
                    </button>
                </div>
            </div>
        </section>
    );
};

export default CollegeAchievementsSection;
