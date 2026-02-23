import React from "react";
import heroBg from "@/assets/hero-bg.jpg";
import { ChevronDown, Sparkles } from "lucide-react";
import { useCollegeRegisterModal } from "./CollegeRegisterModalContext";

const CollegeHeroSection: React.FC = () => {
    const { openRegisterModal } = useCollegeRegisterModal();
    const scrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 pt-24 overflow-hidden bg-[#020408]">
            {/* Background */}
            <div
                className="absolute inset-0 bg-cover bg-center opacity-40"
                style={{ backgroundImage: `url(${heroBg})` }}
            />
            <div className="absolute inset-0 bg-background/40" />
            <div className="absolute inset-0 grid-bg opacity-20" />

            {/* Vivid glowing orbs - Gold & Amber theme */}
            <div className="absolute top-1/4 left-1/5 w-72 h-72 rounded-full blur-3xl animate-float" style={{ background: "radial-gradient(circle, hsl(45 100% 50% / 0.2), transparent 70%)" }} />
            <div className="absolute bottom-1/3 right-1/5 w-96 h-96 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s", background: "radial-gradient(circle, hsl(28 100% 50% / 0.15), transparent 70%)" }} />
            <div className="absolute top-2/3 left-1/3 w-64 h-64 rounded-full blur-3xl animate-float" style={{ animationDelay: "4s", background: "radial-gradient(circle, hsl(38 100% 50% / 0.1), transparent 70%)" }} />

            <div className="relative z-10 max-w-5xl mx-auto">
                {/* Attention badge */}
                <div className="inline-flex items-center gap-2 mb-8 px-5 py-2 rounded-full border border-primary/30 bg-midnight/50 backdrop-blur-sm">
                    <Sparkles className="w-4 h-4 text-gold" style={{ color: "hsl(45 100% 50%)" }} />
                    <span className="font-body text-xs tracking-[0.25em] text-gold uppercase font-semibold">
                        Tech Tycoon Digital Solutions · Est. 2026
                    </span>
                    <Sparkles className="w-4 h-4 text-gold" style={{ color: "hsl(45 100% 50%)" }} />
                </div>

                <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-black leading-tight mb-6">
                    <span className="text-gradient-gold glow-text">AI Mastery</span>
                    <br />
                    <span className="text-foreground">Bootcamp</span>
                    <span className="text-gradient-gold"> 2026</span>
                </h1>

                <p className="font-body text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                    The future belongs to college students & entrepreneurs who master AI early. Build real-world skills that drive careers & startups — in just{" "}
                    <span className="text-gradient-gold font-semibold">30 days.</span>
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                        onClick={openRegisterModal}
                        className="btn-gold font-display text-sm font-bold px-10 py-4 rounded-full tracking-widest w-full sm:w-auto"
                    >
                        🚀 REGISTER NOW
                    </button>
                    <button
                        onClick={() => scrollTo("modules")}
                        className="font-display text-sm font-bold px-8 py-4 rounded-full tracking-widest border text-foreground hover:text-gold transition-all w-full sm:w-auto backdrop-blur-sm"
                        style={{ borderColor: "hsl(45 100% 50% / 0.3)", background: "hsl(45 100% 50% / 0.05)" }}
                    >
                        EXPLORE MODULES
                    </button>
                </div>

                {/* Stats row */}
                <div className="mt-16 flex flex-wrap items-center justify-center gap-6 sm:gap-10">
                    {[
                        { value: "30", label: "Days", color: "text-gradient-gold" },
                        { value: "3hrs", label: "Per Day", color: "text-gradient-gold" },
                        { value: "12", label: "Modules", color: "text-gradient-gold" },
                    ].map((stat) => (
                        <div key={stat.label} className="text-center px-6 py-4 rounded-2xl backdrop-blur-md" style={{ background: "hsl(224 71% 4% / 0.8)", border: "1px solid hsl(45 100% 50% / 0.15)" }}>
                            <div className={`font-display text-2xl sm:text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                            <div className="font-body text-xs text-muted-foreground mt-1 tracking-wider uppercase">{stat.label}</div>
                        </div>
                    ))}
                    {/* Special pricing card */}
                    <div className="text-center px-6 py-4 rounded-2xl relative overflow-hidden backdrop-blur-md" style={{ background: "linear-gradient(135deg, hsl(45 100% 50% / 0.1), hsl(28 100% 50% / 0.08))", border: "1px solid hsl(45 100% 50% / 0.3)", boxShadow: "0 0 20px hsl(45 100% 50% / 0.1)" }}>
                        <div className="flex items-baseline justify-center gap-2">
                            <span className="font-display text-base sm:text-lg text-muted-foreground/60 line-through">₹14,999</span>
                            <span className="font-display text-2xl sm:text-3xl font-bold text-gradient-gold">₹9,999</span>
                        </div>
                        <div className="font-body text-xs text-gold mt-1 tracking-wider uppercase font-semibold">🔥 Early Bird Offer</div>
                        <div className="font-body mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: "hsl(45 100% 50% / 0.15)", color: "hsl(45 100% 60%)", border: "1px solid hsl(45 100% 50% / 0.25)" }}>
                            Valid till March 15
                        </div>
                    </div>
                </div>
            </div>

            <button
                onClick={() => scrollTo("why")}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground hover:text-gold transition-colors animate-bounce"
            >
                <ChevronDown className="w-6 h-6" />
            </button>
        </section>
    );
};

export default CollegeHeroSection;
