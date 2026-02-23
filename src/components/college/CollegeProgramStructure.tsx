import React from "react";
import { Calendar, Clock, Video, Award } from "lucide-react";
import { useCollegeRegisterModal } from "./CollegeRegisterModalContext";

const stats = [
    {
        icon: Calendar,
        value: "30 Days",
        label: "Intensive structured learning path",
        iconClass: "icon-box-gold",
        iconColor: "text-gold",
        valueClass: "text-gradient-gold",
        accent: "hsl(45 100% 50%)",
    },
    {
        icon: Clock,
        value: "3 Hrs/Day",
        label: "10am–1pm or 6pm–9pm sessions",
        iconClass: "icon-box-amber",
        iconColor: "text-amber",
        valueClass: "text-gradient-gold",
        accent: "hsl(28 100% 50%)",
    },
    {
        icon: Video,
        value: "Live Zoom",
        label: "Interactive sessions with real-time Q&A",
        iconClass: "icon-box-gold",
        iconColor: "text-gold",
        valueClass: "text-gradient-gold",
        accent: "hsl(45 100% 50%)",
    },
    {
        icon: Award,
        value: "Certificate",
        label: "Industry-recognized AI certification",
        iconClass: "icon-box-amber",
        iconColor: "text-amber",
        valueClass: "text-gradient-gold",
        accent: "hsl(28 100% 50%)",
    },
];

const CollegeProgramStructure: React.FC = () => {
    const { openRegisterModal } = useCollegeRegisterModal();
    return (
        <section className="section-border py-24 px-4 relative overflow-hidden bg-midnight">
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, hsl(224 71% 4%), hsl(224 71% 2%))" }} />
            <div className="absolute inset-0 grid-bg opacity-10" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <div className="section-label mb-4 mx-auto w-fit border-gold/30 text-gold bg-gold/10">⚡ The Format</div>
                    <h2 className="font-display text-3xl sm:text-5xl font-bold text-foreground mb-4">
                        Program <span className="text-gradient-gold">Structure</span>
                    </h2>
                    <p className="font-body text-muted-foreground">Live + Practical mode for maximum learning</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((s, i) => (
                        <div key={i} className="card-gold rounded-2xl p-8 text-center flex flex-col items-center gap-4 group relative overflow-hidden backdrop-blur-sm">
                            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                                style={{ background: `radial-gradient(circle at 50% 0%, ${s.accent}18, transparent 70%)` }} />
                            <div className={`w-14 h-14 rounded-2xl ${s.iconClass} flex items-center justify-center relative z-10`}>
                                <s.icon className={`w-7 h-7`} style={{ color: s.accent }} />
                            </div>
                            <div className={`font-display text-2xl font-bold ${s.valueClass} relative z-10`}>{s.value}</div>
                            <p className="font-body text-xs text-muted-foreground text-center leading-relaxed relative z-10">{s.label}</p>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-12">
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

export default CollegeProgramStructure;
