import React, { useState } from "react";
import { Play, Film } from "lucide-react";

const VideoSection: React.FC = () => {
    const [isPlaying, setIsPlaying] = useState(false);

    // Replace this URL with your actual video when ready
    // Supported: YouTube embed URL, direct MP4 link, or Vimeo embed URL
    const VIDEO_URL = "https://www.youtube.com/embed/dQw4w9WgXcQ";

    return (
        <section className="section-border py-20 px-4 relative overflow-hidden">
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, hsl(222 47% 5%), hsl(222 40% 6%))" }} />
            <div className="absolute inset-0 grid-bg opacity-15" />
            <div className="absolute top-10 right-10 w-80 h-80 rounded-full blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, hsl(265 85% 65% / 0.08), transparent 70%)" }} />
            <div className="absolute bottom-10 left-10 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, hsl(199 100% 55% / 0.07), transparent 70%)" }} />

            <div className="max-w-5xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="section-label mb-4 mx-auto w-fit">🎬 Sneak Peek</div>
                    <h2 className="font-display text-3xl sm:text-5xl font-bold text-foreground mb-4">
                        A Glimpse of the <span className="text-gradient">Bootcamp</span>
                    </h2>
                    <p className="font-body text-muted-foreground max-w-xl mx-auto">
                        Watch what awaits you in this transformative 30-day AI journey
                    </p>
                </div>

                {/* Video Container */}
                <div className="relative rounded-3xl overflow-hidden group"
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

                    <div className="relative aspect-video rounded-3xl overflow-hidden z-10">
                        {!isPlaying ? (
                            /* Thumbnail / Play overlay */
                            <div className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer"
                                onClick={() => setIsPlaying(true)}
                                style={{ background: "linear-gradient(135deg, hsl(222 40% 8%), hsl(222 47% 6%))" }}>

                                {/* Decorative grid and glow */}
                                <div className="absolute inset-0 grid-bg opacity-20" />
                                <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 50%, hsl(199 100% 55% / 0.08), transparent 60%)" }} />

                                {/* Film reel decoration */}
                                <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1.5 rounded-full"
                                    style={{ background: "hsl(199 100% 55% / 0.1)", border: "1px solid hsl(199 100% 55% / 0.2)" }}>
                                    <Film className="w-4 h-4 text-primary" />
                                    <span className="font-body text-xs text-primary font-semibold">BOOTCAMP PREVIEW</span>
                                </div>

                                {/* Central play button */}
                                <div className="relative mb-8">
                                    {/* Pulsing rings */}
                                    <div className="absolute inset-0 -m-4 rounded-full animate-ping opacity-20"
                                        style={{ background: "hsl(199 100% 55% / 0.3)" }} />
                                    <div className="absolute inset-0 -m-8 rounded-full animate-pulse opacity-10"
                                        style={{ background: "hsl(265 85% 65% / 0.3)" }} />

                                    <div className="w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 group-hover:scale-110"
                                        style={{
                                            background: "linear-gradient(135deg, hsl(199 100% 55%), hsl(265 85% 65%))",
                                            boxShadow: "0 0 40px hsl(199 100% 55% / 0.4), 0 0 80px hsl(265 85% 65% / 0.2)",
                                        }}>
                                        <Play className="w-10 h-10 ml-1" style={{ color: "hsl(222 47% 5%)" }} fill="hsl(222 47% 5%)" />
                                    </div>
                                </div>

                                <p className="font-display text-lg font-bold text-foreground mb-2 relative z-10">
                                    AI Summer Bootcamp 2026
                                </p>
                                <p className="font-body text-sm text-muted-foreground relative z-10">
                                    Click to play the preview video
                                </p>

                                {/* Bottom tags */}
                                <div className="absolute bottom-6 flex items-center gap-3">
                                    {["30 Days", "12 Modules", "Hands-on AI"].map((tag) => (
                                        <span key={tag} className="px-3 py-1 rounded-full font-body text-xs font-semibold"
                                            style={{ background: "hsl(199 100% 55% / 0.1)", border: "1px solid hsl(199 100% 55% / 0.2)", color: "hsl(199 100% 55%)" }}>
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            /* Embedded Video */
                            <iframe
                                src={`${VIDEO_URL}?autoplay=1&rel=0`}
                                title="AI Summer Bootcamp 2026 — Glimpse Video"
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        )}
                    </div>
                </div>

                {/* Helper text for easy replacement */}
                {/* 
          ============================================
          TO REPLACE THE VIDEO:
          Open this file and change the VIDEO_URL 
          constant at the top to your actual video URL.
          
          Examples:
          - YouTube: "https://www.youtube.com/embed/YOUR_VIDEO_ID"
          - Vimeo:   "https://player.vimeo.com/video/YOUR_VIDEO_ID"
          ============================================
        */}
            </div>
        </section>
    );
};

export default VideoSection;
