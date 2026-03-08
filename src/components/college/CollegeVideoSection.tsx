import React, { useState, useEffect, useRef } from "react";
import { Play, Film, X, Maximize2 } from "lucide-react";
import { useCollegeRegisterModal } from "./CollegeRegisterModalContext";

const CollegeVideoSection: React.FC = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isSticky, setIsSticky] = useState(false);
    const [isClosed, setIsClosed] = useState(false);
    const sectionRef = useRef<HTMLElement>(null);
    const { openRegisterModal, setIsVideoDocked } = useCollegeRegisterModal();

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

    useEffect(() => {
        const isDocked = isPlaying && isSticky && !isClosed;
        setIsVideoDocked(isDocked);

        if (isDocked) {
            document.body.classList.add('video-dock-bottom');
        } else {
            document.body.classList.remove('video-dock-bottom');
        }
        return () => {
            document.body.classList.remove('video-dock-bottom');
            setIsVideoDocked(false);
        };
    }, [isPlaying, isSticky, isClosed, setIsVideoDocked]);

    // Replace this URL with your actual video when ready
    const VIDEO_URL = "https://www.youtube.com/embed/k8QE4RahamM";

    return (
        <section ref={sectionRef} className={`section-border py-10 sm:py-20 px-4 relative bg-midnight ${isPlaying && isSticky && !isClosed ? "z-[99999]" : "overflow-hidden"}`}>
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, hsl(224 71% 4%), hsl(224 71% 2%))" }} />
            <div className="absolute inset-0 grid-bg opacity-10" />
            <div className="absolute top-10 right-10 w-80 h-80 rounded-full blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, hsl(45 100% 50% / 0.05), transparent 70%)" }} />
            <div className="absolute bottom-10 left-10 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, hsl(28 100% 50% / 0.05), transparent 70%)" }} />

            <div className="max-w-5xl mx-auto relative z-10">
                <div className="text-center mb-8 sm:mb-12">
                    <div className="section-label mb-3 sm:mb-4 mx-auto w-fit border-gold/30 text-gold bg-gold/10">🎬 Sneak Peek</div>
                    <h2 className="font-display text-[1.75rem] leading-tight sm:text-5xl font-bold text-foreground mb-3 sm:mb-4">
                        A Glimpse of the <span className="text-gradient-gold">Bootcamp</span>
                    </h2>
                    <p className="font-body text-muted-foreground max-w-xl mx-auto">
                        Watch what awaits you in this transformative 30-day AI journey
                    </p>
                </div>

                <div className={`relative rounded-3xl group ${isPlaying && isSticky && !isClosed ? "z-[99999]" : "overflow-hidden"}`}
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

                    <div className={`relative w-full h-full aspect-video rounded-3xl transition-all duration-500 ${isPlaying && isSticky && !isClosed ? "z-[99999]" : "z-10 overflow-hidden hover:scale-[1.05]"
                        }`}>

                        {/* Placeholder message */}
                        {isPlaying && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-midnight z-0">
                                <Film className="w-8 h-8 text-gold/40 mb-3 animate-pulse" />
                                <p className="text-gold/60 font-body text-sm font-medium tracking-wide">Video is playing in mini-player</p>
                            </div>
                        )}

                        {!isPlaying ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer z-10"
                                onClick={() => setIsPlaying(true)}
                                style={{ background: "linear-gradient(135deg, hsl(224 71% 4%), hsl(224 71% 2%))" }}>

                                <div className="absolute inset-0 grid-bg opacity-10" />
                                <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 50%, hsl(45 100% 50% / 0.08), transparent 60%)" }} />

                                <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1.5 rounded-full"
                                    style={{ background: "hsl(45 100% 50% / 0.1)", border: "1px solid hsl(45 100% 50% / 0.2)" }}>
                                    <Film className="w-4 h-4 text-gold" />
                                    <span className="font-body text-xs text-gold font-bold">BOOTCAMP PREVIEW</span>
                                </div>

                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="relative">
                                        <div className="absolute inset-0 -m-2 sm:-m-4 rounded-full animate-ping opacity-20"
                                            style={{ background: "hsl(45 100% 50% / 0.3)" }} />
                                        <div className="absolute inset-0 -m-8 rounded-full animate-pulse opacity-10"
                                            style={{ background: "hsl(28 100% 50% / 0.3)" }} />

                                        <div className="w-14 h-14 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all duration-500 group-hover:scale-110"
                                            style={{
                                                background: "linear-gradient(135deg, hsl(45 100% 50%), hsl(45 100% 35%))",
                                                boxShadow: "0 0 20px hsl(45 100% 50% / 0.5)",
                                            }}>
                                            <Play className="w-5 h-5 sm:w-10 sm:h-10 ml-0.5 sm:ml-1 text-midnight" fill="currentColor" />
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute bottom-12 sm:bottom-16 w-full text-center px-4">
                                    <p className="font-display text-base sm:text-lg font-bold text-foreground mb-1">
                                        AI Summer Bootcamp 2026
                                    </p>
                                    <p className="font-body text-[0.65rem] sm:text-sm text-muted-foreground">
                                        Click to play the preview video
                                    </p>
                                </div>

                                <div className="absolute bottom-4 sm:bottom-6 flex flex-wrap justify-center items-center gap-2 sm:gap-3 w-full px-4">
                                    {["30 Days", "12 Modules", "Hands-on AI"].map((tag) => (
                                        <span key={tag} className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full font-body text-[0.65rem] sm:text-xs font-bold whitespace-nowrap"
                                            style={{ background: "hsl(45 100% 50% / 0.1)", border: "1px solid hsl(45 100% 50% / 0.2)", color: "hsl(45 100% 50%)" }}>
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            /* Video Container (Morphs between inline and docked via CSS) */
                            <div className={
                                isSticky && !isClosed
                                    ? "fixed bottom-4 left-1/2 -translate-x-1/2 sm:bottom-8 sm:right-8 z-[999999] animate-in fade-in slide-in-from-bottom-5 duration-500 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,1)] border-2 border-gold/40 max-w-[calc(100vw-2rem)] pointer-events-auto"
                                    : "absolute inset-0 w-full h-full z-10 pointer-events-auto"
                            }>
                                {/* Docking Bar Background (Only visible when sticky) */}
                                {isSticky && !isClosed && (
                                    <div className="absolute inset-0 rounded-2xl pointer-events-none"
                                        style={{
                                            background: "linear-gradient(180deg, hsl(224 71% 6% / 0.95), hsl(224 71% 3% / 0.98))",
                                            backdropFilter: "blur(16px)",
                                            boxShadow: "0 10px 40px hsl(224 71% 3% / 0.8), 0 0 20px hsl(45 100% 50% / 0.08)",
                                        }}
                                    />
                                )}

                                {/* Main Layout Wrapper */}
                                <div className={
                                    isSticky && !isClosed
                                        ? "relative h-full flex items-center p-3 sm:p-4 gap-3 sm:gap-4 z-10"
                                        : "w-full h-full"
                                }>
                                    {/* Left CTA (Only in dock mode and only on desktop/tablet) */}
                                    {isSticky && !isClosed && (
                                        <div className="hidden sm:flex items-center pl-1 sm:pl-2">
                                            <button
                                                onClick={openRegisterModal}
                                                className="btn-gold font-display text-xs sm:text-base font-bold px-6 sm:px-10 py-3 sm:py-4 rounded-xl tracking-wide whitespace-nowrap shadow-lg shrink-0"
                                            >
                                                SECURE SPOT
                                            </button>
                                        </div>
                                    )}

                                    {/* Right Video + Controls */}
                                    <div className={
                                        isSticky && !isClosed
                                            ? "flex items-center gap-2 shrink-0 h-full"
                                            : "w-full h-full"
                                    }>
                                        {/* The Persistent Iframe Container */}
                                        <div
                                            id={isSticky && !isClosed ? "college-video-dock" : "college-video-inline"}
                                            className={
                                                isSticky && !isClosed
                                                    ? "w-40 sm:w-64 aspect-video rounded-lg overflow-hidden shadow-lg bg-black shrink-0"
                                                    : "w-full h-full bg-black rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl"
                                            }>
                                            <iframe
                                                src={`${VIDEO_URL}?autoplay=1&rel=0`}
                                                title="AI Summer Bootcamp 2026 — Glimpse Video"
                                                className="w-full h-full"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            />
                                        </div>

                                        {/* Controls (Only in dock mode) */}
                                        {isSticky && !isClosed && (
                                            <div className="flex flex-col gap-1 shrink-0">
                                                <button
                                                    onClick={() => {
                                                        const scrollTarget = sectionRef.current;
                                                        if (scrollTarget) {
                                                            const navHeight = 80;
                                                            const elementPosition = scrollTarget.getBoundingClientRect().top + window.pageYOffset;
                                                            window.scrollTo({ top: elementPosition - navHeight, behavior: 'smooth' });
                                                        }
                                                    }}
                                                    className="p-1 hover:bg-white/10 rounded-full text-muted-foreground hover:text-white transition-colors"
                                                    title="Return to video"
                                                >
                                                    <Maximize2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => setIsClosed(true)}
                                                    className="p-1 hover:bg-white/10 rounded-full text-muted-foreground hover:text-white transition-colors"
                                                    title="Close"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CollegeVideoSection;
