import React from "react";
import { Briefcase, Zap, TrendingUp, Target, Compass } from "lucide-react";
import { useCollegeRegisterModal } from "./CollegeRegisterModalContext";

const benefits = [
    {
        icon: Briefcase,
        title: "Career Acceleration",
        desc: "Fast-track your career with AI skills that top employers and recruiters are actively seeking.",
        iconClass: "icon-box-cyan",
        iconColor: "text-primary",
        accent: "hsl(199 100% 55%)",
    },
    {
        icon: Zap,
        title: "Startup Growth",
        desc: "Launch and scale your business ideas using AI tools that automate, optimize, and innovate.",
        iconClass: "icon-box-orange",
        iconColor: "text-orange-400",
        accent: "hsl(25 100% 60%)",
    },
    {
        icon: TrendingUp,
        title: "Freelance Income",
        desc: "Build AI-powered services and start earning as a freelancer while still in college.",
        iconClass: "icon-box-purple",
        iconColor: "text-purple-400",
        accent: "hsl(265 85% 65%)",
    },
    {
        icon: Target,
        title: "Industry-Ready Skills",
        desc: "Master 20+ AI tools used by Fortune 500 companies and cutting-edge startups worldwide.",
        iconClass: "icon-box-green",
        iconColor: "text-emerald-400",
        accent: "hsl(142 70% 50%)",
    },
    {
        icon: Compass,
        title: "Professional Network",
        desc: "Connect with industry experts, like-minded peers, and potential co-founders during the bootcamp.",
        iconClass: "icon-box-cyan",
        iconColor: "text-cyan-400",
        accent: "hsl(183 100% 55%)",
    },
];

const CollegeWhySection: React.FC = () => {
    const { openRegisterModal } = useCollegeRegisterModal();
    return (
        <section id="why" className="section-border py-24 px-4 relative">
            <div className="absolute inset-0 grid-bg opacity-20" />
            <div className="absolute top-20 left-10 w-80 h-80 rounded-full blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, hsl(265 85% 65% / 0.08), transparent 70%)" }} />
            <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, hsl(25 100% 60% / 0.08), transparent 70%)" }} />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <div className="section-label mb-4 mx-auto w-fit">✦ The Advantage</div>
                    <h2 className="font-display text-3xl sm:text-5xl font-bold text-foreground mb-4">
                        Why This <span className="text-gradient">Bootcamp?</span>
                    </h2>
                    <p className="font-body text-muted-foreground max-w-xl mx-auto">
                        A comprehensive 30-day journey to master AI — from fundamentals to business applications
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {benefits.map((b, i) => (
                        <div key={i} className="card-glow rounded-2xl p-8 flex flex-col gap-4 group relative overflow-hidden">
                            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 0% 0%, ${b.accent}15, transparent 60%)` }} />
                            <div className={`w-12 h-12 rounded-xl ${b.iconClass} flex items-center justify-center`}>
                                <b.icon className={`w-6 h-6 ${b.iconColor}`} />
                            </div>
                            <h3 className="font-display text-base font-bold text-foreground">{b.title}</h3>
                            <p className="font-body text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
                        </div>
                    ))}

                    {/* Wide hero card */}
                    <div className="card-glow rounded-2xl p-8 sm:col-span-2 lg:col-span-1 flex flex-col justify-center gap-4 relative overflow-hidden"
                        style={{ background: "linear-gradient(135deg, hsl(199 100% 55% / 0.12), hsl(265 85% 65% / 0.08), hsl(222 40% 7%))", border: "1px solid hsl(199 100% 55% / 0.3)" }}>
                        <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ background: "radial-gradient(circle at 80% 20%, hsl(265 85% 65% / 0.12), transparent 60%)" }} />
                        <div className="font-display text-7xl font-black text-gradient relative z-10">30</div>
                        <p className="font-display text-sm font-bold text-foreground relative z-10">Days to Transform</p>
                        <p className="font-body text-sm text-muted-foreground relative z-10">From aspiring professional to AI-powered leader in one intensive month.</p>
                    </div>
                </div>

                <div className="text-center mt-12">
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

export default CollegeWhySection;
