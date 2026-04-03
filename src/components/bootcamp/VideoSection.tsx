import React, { useState, useEffect, useRef } from "react";
import { Play, Film, X, Maximize2 } from "lucide-react";
import { useRegisterModal } from "./RegisterModalContext";

const VideoSection: React.FC = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isSticky, setIsSticky] = useState(false);
    const [isClosed, setIsClosed] = useState(false);
    const sectionRef = useRef<HTMLElement>(null);
    const { setIsVideoDocked } = useRegisterModal();

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                // If the section is not intersecting and video is playing, make it sticky
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
    // Supported: YouTube embed URL, direct MP4 link, or Vimeo embed URL
    const VIDEO_URL = "https://www.youtube.com/embed/k8QE4RahamM";

    return (
        <section ref={sectionRef} className={`section-border py-10 sm:py-20 px-4 relative ${isPlaying && isSticky && !isClosed ? "z-[99999]" : "overflow-hidden"}`}>
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, hsl(222 47% 5%), hsl(222 40% 6%))" }} />
            <div className="absolute inset-0 grid-bg opacity-15" />
            <div className="absolute top-10 right-10 w-80 h-80 rounded-full blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, hsl(265 85% 65% / 0.08), transparent 70%)" }} />
            <div className="absolute bottom-10 left-10 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, hsl(199 100% 55% / 0.07), transparent 70%)" }} />

            <div className="max-w-5xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-8 sm:mb-12">
                    <div className="section-label mb-3 sm:mb-4 mx-auto w-fit">🎬 Sneak Peek</div>
                    <h2 className="font-display text-[1.75rem] leading-tight sm:text-5xl font-bold text-foreground mb-3 sm:mb-4">
                        A Glimpse of the <span className="text-gradient">Bootcamp</span>
                    </h2>
                    <p className="font-body text-muted-foreground max-w-xl mx-auto">
                        Watch what awaits you in this transformative 30-day AI journey
                    </p>
                </div>

                {/* Video Container */}
                <div className={`relative rounded-3xl group ${isPlaying && isSticky && !isClosed ? "z-[99999]" : "overflow-hidden"}`}
                    style={{
                        border: "1px solid hsl(199 100% 55% / 0.25)",
                        boxShadow: "0 0 80px hsl(199 100% 55% / 0.08), 0 0 40px hsl(265 85% 65% / 0.05)",
                    }}>

                    {/* Gradient border glow */}
                    <div className="absolute -inset-[1px] rounded-3xl pointer-events-none z-0"
                        style={{
                            background: "linear-gradient(135deg, hsl(199 100% 55% / 0.4), hsl(265 85% 65% / 0.3), hsl(25 100% 60% / 0.2))",
                            padding: "1px",
                        }}>
                        <div className="w-full h-full rounded-3xl" style={{ background: "hsl(222 40% 7%)" }} />
                    </div>

                    <div className={`relative w-full h-full aspect-video rounded-3xl transition-all duration-500 ${isPlaying && isSticky && !isClosed ? "z-[99999]" : "z-10 overflow-hidden hover:scale-[1.05]"
                        }`}>

                        {/* Placeholder message (Visible when video is playing, but technically behind it until it docks) */}
                        {isPlaying && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#070b14] z-0">
                                <Film className="w-8 h-8 text-primary/40 mb-3 animate-pulse" />
                                <p className="text-primary/60 font-body text-sm font-medium tracking-wide">Video is playing in mini-player</p>
                            </div>
                        )}

                        {!isPlaying ? (
                            /* Thumbnail / Play overlay */
                            <div className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer z-10"
                                onClick={() => setIsPlaying(true)}
                                style={{ background: "linear-gradient(135deg, hsl(222 40% 8%), hsl(222 47% 6%))" }}>

                                {/* Decorative grid and glow */}
                                <div className="absolute inset-0 grid-bg opacity-20" />
                                <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 50%, hsl(199 100% 55% / 0.08), transparent 60%)" }} />

                                {/* Film reel decoration */}
                                <div className="absolute top-4 sm:top-6 left-4 sm:left-6 flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full"
                                    style={{ background: "hsl(199 100% 55% / 0.1)", border: "1px solid hsl(199 100% 55% / 0.2)" }}>
                                    <Film className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                                    <span className="font-body text-[0.65rem] sm:text-xs text-primary font-semibold">BOOTCAMP PREVIEW</span>
                                </div>

                                {/* Perfectly Central Play Button */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="relative">
                                        <div className="absolute inset-0 -m-2 sm:-m-4 rounded-full animate-ping opacity-20"
                                            style={{ background: "hsl(199 100% 55% / 0.3)" }} />
                                        <div className="absolute inset-0 -m-4 sm:-m-8 rounded-full animate-pulse opacity-10"
                                            style={{ background: "hsl(265 85% 65% / 0.3)" }} />

                                        <div className="w-14 h-14 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all duration-500 group-hover:scale-110"
                                            style={{
                                                background: "linear-gradient(135deg, hsl(199 100% 55%), hsl(265 85% 65%))",
                                                boxShadow: "0 0 20px hsl(199 100% 55% / 0.4), 0 0 40px hsl(265 85% 65% / 0.2)",
                                            }}>
                                            <Play className="w-5 h-5 sm:w-10 sm:h-10 ml-0.5 sm:ml-1" style={{ color: "hsl(222 47% 5%)" }} fill="hsl(222 47% 5%)" />
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom Text */}
                                <div className="absolute bottom-12 sm:bottom-16 w-full text-center px-4">
                                    <p className="font-display text-base sm:text-lg font-bold text-foreground mb-1">
                                        AI Summer Bootcamp 2026
                                    </p>
                                    <p className="font-body text-[0.65rem] sm:text-sm text-muted-foreground">
                                        Click to play the preview video
                                    </p>
                                </div>

                                {/* Bottom tags */}
                                <div className="absolute bottom-4 sm:bottom-6 flex flex-wrap justify-center items-center gap-2 sm:gap-3 w-full px-4">
                                    {["30 Days", "12 Modules", "Hands-on AI"].map((tag) => (
                                        <span key={tag} className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full font-body text-[0.65rem] sm:text-xs font-semibold whitespace-nowrap"
                                            style={{ background: "hsl(199 100% 55% / 0.1)", border: "1px solid hsl(199 100% 55% / 0.2)", color: "hsl(199 100% 55%)" }}>
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            /* Video Container (Morphs between inline and docked via CSS) */
                            <div className={
                                isSticky && !isClosed
                                    ? "fixed bottom-4 left-1/2 -translate-x-1/2 sm:bottom-8 sm:right-8 z-[999999] animate-in fade-in slide-in-from-bottom-5 duration-500 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,1)] border-2 border-primary/40 max-w-[calc(100vw-2rem)]"
                                    : "absolute inset-0 w-full h-full z-10"
                            }>
                                {/* Docking Bar Background (Only visible when sticky) */}
                                {isSticky && !isClosed && (
                                    <div className="absolute inset-0 rounded-2xl pointer-events-none"
                                        style={{
                                            background: "linear-gradient(180deg, hsl(222 47% 8% / 0.95), hsl(222 47% 5% / 0.98))",
                                            backdropFilter: "blur(16px)",
                                            boxShadow: "0 10px 40px hsl(222 47% 5% / 0.8), 0 0 20px hsl(199 100% 55% / 0.08)",
                                        }}
                                    />
                                )}

                                {/* Main Layout Wrapper */}
                                <div className={
                                    isSticky && !isClosed
                                        ? "relative h-full flex items-center p-3 sm:p-4 gap-3 sm:gap-4 z-10"
                                        : "w-full h-full"
                                }>

                                    {/* Right Video + Controls */}
                                    <div className={
                                        isSticky && !isClosed
                                            ? "flex items-center gap-2 shrink-0 h-full"
                                            : "w-full h-full"
                                    }>
                                        {/* The Persistent Iframe Container */}
                                        <div className={
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

export default VideoSection;
