import React from "react";
import trainerImg from "@/assets/trainer-photo.png";
import { useAIMasterclass2RegisterModal } from "./AIMasterclass2RegisterModalContext";
import { CheckCircle, Globe, Linkedin, Instagram } from "lucide-react";

const stats = [
    { value: "4.8K+", label: "Students Trained", color: "text-emerald-400" },
    { value: "50+", label: "Corporate Workshops", color: "text-blue-400" },
    { value: "10+", label: "AI Tools Covered", color: "text-amber-400" },
    { value: "7-Fig", label: "Business Built", color: "text-purple-400" },
];

const AIMasterclass2TrainerSection: React.FC = () => {
    const { openRegisterModal } = useAIMasterclass2RegisterModal();
    return (
        <section id="trainer" className="section-border py-32 px-4 relative overflow-hidden">
            <div className="absolute inset-0 grid-bg opacity-10" />
            <div className="max-w-5xl mx-auto px-4 lg:px-8 relative z-10">
                <div className="text-left mb-16">
                    <div className="section-label mb-4 w-fit">👨‍🏫 Your Guide</div>
                    <h2 className="font-display text-4xl sm:text-6xl font-black text-foreground mb-4">
                        Meet Your <span className="text-gradient-green">Trainer</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="flex justify-center">
                        <div className="relative">
                            <div className="absolute inset-0 rounded-3xl blur-3xl scale-110 bg-gradient-to-br from-emerald-500/20 to-blue-500/20" />
                            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-emerald-500/30 to-blue-500/30 p-[2px]">
                                <div className="w-full h-full rounded-3xl bg-background" />
                            </div>
                            <img
                                src={trainerImg}
                                alt="Antony Praveen - AI Trainer"
                                className="relative z-10 w-72 h-72 sm:w-96 sm:h-96 rounded-3xl object-cover transition-all duration-500"
                            />
                            <div className="absolute -bottom-6 -right-6 z-20 bg-emerald-500 text-white rounded-2xl px-6 py-4 text-center shadow-[0_0_30px_hsl(142_70%_50%/0.5)]">
                                <div className="font-display text-2xl font-black">4.9/5</div>
                                <div className="font-body text-[10px] font-bold uppercase tracking-wider opacity-80">Rating</div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-display text-3xl font-bold text-foreground mb-2">Antony Praveen</h3>
                        <p className="font-body text-emerald-400 font-semibold mb-6 tracking-widest text-sm uppercase">Founder, Tech Tycoon Digital Solutions</p>

                        <div className="bg-emerald-500/5 border-l-4 border-emerald-500 p-6 rounded-r-2xl mb-8 italic text-lg text-muted-foreground leading-relaxed">
                            "I help professionals build a powerful digital presence and attract
                            quality leads — using the exact AI strategies that scaled my own business."
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                            {[
                                "International Certified Trainer",
                                "AI Marketing Specialist",
                                "50+ Corporate Workshops",
                                "7-Figure Brand Builder"
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                    <span className="font-body text-sm text-foreground/80">{item}</span>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
                            {stats.map((s, i) => (
                                <div key={i} className="bg-muted/30 border border-white/5 rounded-2xl p-4 text-center">
                                    <div className={`font-display text-xl font-black ${s.color} mb-1`}>{s.value}</div>
                                    <p className="font-body text-[10px] text-muted-foreground uppercase tracking-widest">{s.label}</p>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center gap-4">
                            <a href="https://www.techtycoon.in/" target="_blank" className="p-3 rounded-xl bg-muted/50 hover:bg-emerald-500/20 transition-colors border border-white/5">
                                <Globe className="w-5 h-5 text-muted-foreground hover:text-emerald-400" />
                            </a>
                            <a href="https://www.linkedin.com/in/antony-praveen-techtycoon" target="_blank" className="p-3 rounded-xl bg-muted/50 hover:bg-emerald-500/20 transition-colors border border-white/5">
                                <Linkedin className="w-5 h-5 text-muted-foreground hover:text-emerald-400" />
                            </a>
                            <a href="https://www.instagram.com/amiable_antony" target="_blank" className="p-3 rounded-xl bg-muted/50 hover:bg-emerald-500/20 transition-colors border border-white/5">
                                <Instagram className="w-5 h-5 text-muted-foreground hover:text-emerald-400" />
                            </a>
                        </div>
                    </div>
                </div>


            </div>
        </section>
    );
};

export default AIMasterclass2TrainerSection;
