import React, { useState, useEffect, useRef } from "react";
import { Play, Film, X, Maximize2 } from "lucide-react";

const CollegeVideoSection: React.FC = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isSticky, setIsSticky] = useState(false);
    const [isClosed, setIsClosed] = useState(false);
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsSticky(!entry.isIntersecting);
            },
            { threshold: 0.1 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => {
            if (sectionRef.current) {
                observer.unobserve(sectionRef.current);
            }
        };
    }, []);

    // Replace this URL with your actual video when ready
    const VIDEO_URL = "https://www.youtube.com/embed/k8QE4RahamM";

    return (
        <section ref={sectionRef} className="section-border py-20 px-4 relative overflow-hidden bg-midnight">
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, hsl(224 71% 4%), hsl(224 71% 2%))" }} />
            <div className="absolute inset-0 grid-bg opacity-10" />
            <div className="absolute top-10 right-10 w-80 h-80 rounded-full blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, hsl(45 100% 50% / 0.05), transparent 70%)" }} />
            <div className="absolute bottom-10 left-10 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, hsl(28 100% 50% / 0.05), transparent 70%)" }} />

            <div className="max-w-5xl mx-auto relative z-10">
                <div className="text-center mb-12">
                    <div className="section-label mb-4 mx-auto w-fit border-gold/30 text-gold bg-gold/10">🎬 Sneak Peek</div>
                    <h2 className="font-display text-3xl sm:text-5xl font-bold text-foreground mb-4">
                        A Glimpse of the <span className="text-gradient-gold">Bootcamp</span>
                    </h2>
                    <p className="font-body text-muted-foreground max-w-xl mx-auto">
                        Watch what awaits you in this transformative 30-day AI journey
                    </p>
                </div>

                <div className="relative rounded-3xl overflow-hidden group"
                    style={{
                        border: "1px solid hsl(45 100% 50% / 0.25)",
                        boxShadow: "0 0 80px hsl(45 100% 50% / 0.1)",
                    }}>

                    <div className="absolute -inset-[1px] rounded-3xl pointer-events-none z-0"
                        style={{
                            background: "linear-gradient(135deg, hsl(45 100% 50% / 0.4), hsl(28 100% 50% / 0.3), hsl(38 100% 50% / 0.2))",
                            padding: "1px",
                        }}>
                        <div className="w-full h-full rounded-3xl" style={{ background: "hsl(224 71% 4%)" }} />
                    </div>

                    <div className={`${isPlaying && isSticky && !isClosed
                            ? "fixed bottom-8 right-8 w-72 sm:w-80 z-[9999] shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_30px_hsl(45,100%,50%,0.2)] animate-in fade-in slide-in-from-bottom-10"
                            : "relative w-full h-full"
                        } aspect-video rounded-3xl overflow-hidden z-10 transition-all duration-500 hover:scale-[1.02]`}>
                        {!isPlaying ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer"
                                onClick={() => setIsPlaying(true)}
                                style={{ background: "linear-gradient(135deg, hsl(224 71% 4%), hsl(224 71% 2%))" }}>

                                <div className="absolute inset-0 grid-bg opacity-10" />
                                <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 50%, hsl(45 100% 50% / 0.08), transparent 60%)" }} />

                                <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1.5 rounded-full"
                                    style={{ background: "hsl(45 100% 50% / 0.1)", border: "1px solid hsl(45 100% 50% / 0.2)" }}>
                                    <Film className="w-4 h-4 text-gold" />
                                    <span className="font-body text-xs text-gold font-bold">BOOTCAMP PREVIEW</span>
                                </div>

                                <div className="relative mb-8">
                                    <div className="absolute inset-0 -m-4 rounded-full animate-ping opacity-20"
                                        style={{ background: "hsl(45 100% 50% / 0.3)" }} />
                                    <div className="absolute inset-0 -m-8 rounded-full animate-pulse opacity-10"
                                        style={{ background: "hsl(28 100% 50% / 0.3)" }} />

                                    <div className="w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 group-hover:scale-110"
                                        style={{
                                            background: "linear-gradient(135deg, hsl(45 100% 50%), hsl(28 100% 50%))",
                                            boxShadow: "0 0 40px hsl(45 100% 50% / 0.4), 0 0 80px hsl(28 100% 50% / 0.2)",
                                        }}>
                                        <Play className="w-10 h-10 ml-1 text-midnight" fill="currentColor" />
                                    </div>
                                </div>

                                <p className="font-display text-lg font-bold text-foreground mb-2 relative z-10">
                                    AI Summer Bootcamp 2026
                                </p>
                                <p className="font-body text-sm text-muted-foreground relative z-10">
                                    Click to play the preview video
                                </p>

                                <div className="absolute bottom-6 flex items-center gap-3">
                                    {["30 Days", "12 Modules", "Hands-on AI"].map((tag) => (
                                        <span key={tag} className="px-3 py-1 rounded-full font-body text-xs font-bold"
                                            style={{ background: "hsl(45 100% 50% / 0.1)", border: "1px solid hsl(45 100% 50% / 0.2)", color: "hsl(45 100% 50%)" }}>
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            /* Embedded Video (Single Instance) */
                            <div className="relative w-full h-full group/player">
                                {/* Header/Controls (Only visible in sticky mode) */}
                                {isSticky && !isClosed && (
                                    <div className="absolute top-0 inset-x-0 h-10 bg-gradient-to-b from-black/80 to-transparent z-20 flex items-center justify-end px-3 opacity-0 group-hover/player:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                sectionRef.current?.scrollIntoView({ behavior: 'smooth' });
                                            }}
                                            className="p-1.5 hover:bg-white/10 rounded-full text-white transition-colors mr-1"
                                            title="Scroll to video"
                                        >
                                            <Maximize2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsClosed(true);
                                            }}
                                            className="p-1.5 hover:bg-white/10 rounded-full text-white transition-colors"
                                            title="Close mini player"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}

                                <iframe
                                    src={`${VIDEO_URL}?autoplay=1&rel=0`}
                                    title="AI Summer Bootcamp 2026 — Glimpse Video"
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />

                                {/* Mini player border glow */}
                                {isSticky && !isClosed && (
                                    <div className="absolute inset-0 pointer-events-none border-2 border-gold/40 rounded-3xl z-10" />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CollegeVideoSection;
