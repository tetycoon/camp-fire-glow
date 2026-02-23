import React from "react";
import { Users, Star, Mic2 } from "lucide-react";
import { useCollegeRegisterModal } from "./CollegeRegisterModalContext";

const CollegeGuestSection: React.FC = () => {
    const { openRegisterModal } = useCollegeRegisterModal();
    return (
        <section className="section-border py-24 px-4 relative overflow-hidden bg-midnight">
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, hsl(224 71% 4%), hsl(224 71% 2%))" }} />
            <div className="absolute inset-0 grid-bg opacity-10" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-3xl pointer-events-none" style={{ background: "radial-gradient(ellipse, hsl(45 100% 50% / 0.05), transparent 70%)" }} />

            <div className="max-w-5xl mx-auto text-center relative z-10">
                <div className="section-label mb-4 mx-auto w-fit border-gold/30 text-gold bg-gold/10">🎤 Special Sessions</div>
                <h2 className="font-display text-3xl sm:text-5xl font-bold text-foreground mb-6">
                    Guest <span className="text-gradient-gold">Expert Sessions</span>
                </h2>
                <p className="font-body text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
                    Learn directly from industry leaders and AI practitioners. Our guest sessions bring real-world insights from professionals working at the forefront of artificial intelligence.
                </p>

                <div className="rounded-3xl p-10 sm:p-14 relative overflow-hidden backdrop-blur-sm"
                    style={{ background: "linear-gradient(135deg, hsl(45 100% 50% / 0.1), hsl(28 100% 50% / 0.05), hsl(224 71% 4%))", border: "1px solid hsl(45 100% 50% / 0.3)", boxShadow: "0 0 60px hsl(45 100% 50% / 0.1)" }}>
                    <div className="absolute top-4 left-6" style={{ color: "hsl(45 100% 50% / 0.3)", fontSize: "8rem", fontFamily: "Orbitron", fontWeight: 900, lineHeight: 1 }}>"</div>
                    <div className="absolute bottom-4 right-6" style={{ color: "hsl(45 100% 50% / 0.15)", fontSize: "8rem", fontFamily: "Orbitron", fontWeight: 900, lineHeight: 1 }}>"</div>

                    <div className="relative z-10">
                        <div className="w-14 h-14 rounded-2xl icon-box-gold flex items-center justify-center mx-auto mb-6">
                            <Mic2 className="w-7 h-7 text-gold" />
                        </div>
                        <p className="font-body text-lg sm:text-xl text-foreground/90 leading-relaxed mb-8 italic">
                            Exclusive interactions with AI industry experts, startup founders, and tech leaders who share their journey and insights.
                        </p>
                        <div className="flex items-center justify-center gap-4 flex-wrap">
                            <div className="flex -space-x-3">
                                {[0, 1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 flex items-center justify-center"
                                        style={{ background: `linear-gradient(135deg, hsl(45 100% 50%), hsl(28 100% 50%))`, borderColor: "hsl(224 71% 2%)" }}>
                                        <Users className="w-4 h-4" style={{ color: "hsl(224 71% 2%)" }} />
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center gap-1">
                                {[0, 1, 2, 3, 4].map(i => <Star key={i} className="w-4 h-4 fill-gold text-gold" />)}
                            </div>
                            <span className="font-body text-sm text-muted-foreground">Expert speakers each session</span>
                        </div>
                    </div>
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

export default CollegeGuestSection;
