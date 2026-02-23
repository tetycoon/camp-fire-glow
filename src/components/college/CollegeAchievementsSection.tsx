import React from "react";
import { CheckCircle2 } from "lucide-react";
import { useCollegeRegisterModal } from "./CollegeRegisterModalContext";

const achievements = [
    { text: "Build and deploy AI-powered business solutions", color: "text-cyan-400" },
    { text: "Master 20+ industry AI tools used by top companies", color: "text-purple-400" },
    { text: "Create an AI-optimized LinkedIn profile and portfolio", color: "text-orange-400" },
    { text: "Earn an industry-recognized AI certification", color: "text-emerald-400" },
    { text: "Develop real-world AI projects for your resume", color: "text-cyan-400" },
    { text: "Launch AI-powered freelance services or side hustles", color: "text-purple-400" },
    { text: "Build a startup MVP with AI-assisted development", color: "text-orange-400" },
    { text: "Network with industry experts and potential co-founders", color: "text-emerald-400" },
];

const CollegeAchievementsSection: React.FC = () => {
    const { openRegisterModal } = useCollegeRegisterModal();
    return (
        <section className="section-border py-24 px-4 relative overflow-hidden">
            <div className="absolute inset-0 grid-bg opacity-20" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, hsl(199 100% 55% / 0.07), transparent 70%)" }} />
            <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, hsl(265 85% 65% / 0.07), transparent 70%)" }} />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <div className="section-label mb-6 w-fit">🏆 Outcomes</div>
                        <h2 className="font-display text-3xl sm:text-5xl font-bold text-foreground mb-6">
                            What You'll <span className="text-gradient">Achieve</span>
                        </h2>
                        <p className="font-body text-muted-foreground leading-relaxed mb-8">
                            By the end of 30 days, you'll have a professional AI toolkit, real projects in your portfolio, and the confidence to lead in the AI-driven economy.
                        </p>

                        <div className="flex gap-6 flex-wrap">
                            <div className="text-center">
                                <div className="font-display text-3xl font-black text-gradient-cyan">20+</div>
                                <div className="font-body text-xs text-muted-foreground mt-1">AI Tools</div>
                            </div>
                            <div className="w-px bg-border" />
                            <div className="text-center">
                                <div className="font-display text-3xl font-black text-gradient">30</div>
                                <div className="font-body text-xs text-muted-foreground mt-1">Days Program</div>
                            </div>
                            <div className="w-px bg-border" />
                            <div className="text-center">
                                <div className="font-display text-3xl font-black text-gradient-orange">1</div>
                                <div className="font-body text-xs text-muted-foreground mt-1">Certificate</div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        {achievements.map((item, i) => (
                            <div key={i} className="flex items-start gap-4 p-4 rounded-xl transition-all group cursor-default"
                                style={{ background: "hsl(222 40% 9%)", border: "1px solid hsl(var(--border))" }}
                                onMouseEnter={e => (e.currentTarget.style.borderColor = "hsl(199 100% 55% / 0.35)")}
                                onMouseLeave={e => (e.currentTarget.style.borderColor = "hsl(var(--border))")}>
                                <CheckCircle2 className={`w-5 h-5 ${item.color} flex-shrink-0 mt-0.5`} />
                                <span className="font-body text-sm text-foreground group-hover:text-foreground transition-colors">{item.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="text-center mt-16">
                    <button
                        onClick={openRegisterModal}
                        className="btn-glow text-primary-foreground font-display text-sm font-bold px-10 py-4 rounded-full tracking-widest"
                    >
                        🚀 SECURE YOUR SEAT
                    </button>
                </div>
            </div>
        </section>
    );
};

export default CollegeAchievementsSection;
