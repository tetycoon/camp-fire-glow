import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import event1 from "@/assets/event-1.jpg";
import event2 from "@/assets/event-2.jpg";
import event3 from "@/assets/event-3.jpg";
import event4 from "@/assets/event-4.jpg";
import event5 from "@/assets/event-5.jpg";
import event6 from "@/assets/event-6.jpg";
import event7 from "@/assets/event-7.jpg";
import event8 from "@/assets/event-8.jpg";
import event9 from "@/assets/event-9.jpg";
import event10 from "@/assets/event-10.jpg";

const galleryItems = [
    { src: event1, caption: "Corporate AI Training Session" },
    { src: event2, caption: "Interactive Workshop for Professionals" },
    { src: event3, caption: "Hands-on Training at Madras Management Association" },
    { src: event4, caption: "Corporate Team AI Upskilling Program" },
    { src: event5, caption: "Faculty Development Program — Vidhya Sagar Women's College" },
    { src: event6, caption: "AI Awareness Session for School Students" },
    { src: event7, caption: "Student Engagement Program" },
    { src: event8, caption: "AI-Powered Marketing Workshop" },
    { src: event9, caption: "Interactive Q&A Session with AI Experts" },
    { src: event10, caption: "Successful Completion of Corporate AI Training" },
];

const CollegeGallerySection: React.FC = () => {
    const [current, setCurrent] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const total = galleryItems.length;

    const goTo = (index: number) => {
        setCurrent((index + total) % total);
    };

    const next = () => goTo(current + 1);
    const prev = () => goTo(current - 1);

    useEffect(() => {
        if (!isHovered) {
            intervalRef.current = setInterval(next, 4000);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [current, isHovered]);

    return (
        <section className="section-border py-24 px-4 relative overflow-hidden bg-midnight">
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, hsl(224 71% 4%), hsl(224 71% 2%))" }} />
            <div className="absolute inset-0 grid-bg opacity-10" />
            <div className="absolute top-20 left-20 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, hsl(45 100% 50% / 0.05), transparent 70%)" }} />
            <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, hsl(28 100% 50% / 0.05), transparent 70%)" }} />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <div className="section-label mb-4 mx-auto w-fit border-gold/30 text-gold bg-gold/10">📸 Our Impact</div>
                    <h2 className="font-display text-3xl sm:text-5xl font-bold text-foreground mb-4">
                        Past Events & <span className="text-gradient-gold">Programs</span>
                    </h2>
                    <p className="font-body text-muted-foreground max-w-xl mx-auto">
                        A glimpse into our training sessions across schools, colleges, and corporate organizations
                    </p>
                </div>

                <div
                    className="relative max-w-5xl mx-auto"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <div className="relative rounded-3xl overflow-hidden" style={{ border: "1px solid hsl(45 100% 50% / 0.2)", boxShadow: "0 0 60px hsl(45 100% 50% / 0.08)" }}>
                        <div className="absolute -inset-[1px] rounded-3xl pointer-events-none" style={{ background: "linear-gradient(135deg, hsl(45 100% 50% / 0.3), hsl(28 100% 50% / 0.2), hsl(38 100% 50% / 0.15))", padding: "1px" }}>
                            <div className="w-full h-full rounded-3xl" style={{ background: "hsl(224 71% 4%)" }} />
                        </div>

                        <div className="relative aspect-[16/9] overflow-hidden rounded-3xl">
                            {galleryItems.map((item, i) => (
                                <div
                                    key={i}
                                    className="absolute inset-0 transition-all duration-700 ease-in-out"
                                    style={{
                                        opacity: i === current ? 1 : 0,
                                        transform: i === current ? "scale(1)" : "scale(1.05)",
                                    }}
                                >
                                    <img
                                        src={item.src}
                                        alt={item.caption}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-x-0 bottom-0 h-32" style={{ background: "linear-gradient(transparent, hsl(224 71% 2% / 0.9))" }} />
                                </div>
                            ))}

                            <div className="absolute bottom-6 left-8 right-8 z-20 flex items-end justify-between">
                                <div>
                                    <p className="font-display text-sm sm:text-lg font-bold text-foreground drop-shadow-lg">
                                        {galleryItems[current].caption}
                                    </p>
                                    <p className="font-body text-xs text-muted-foreground mt-1">
                                        {current + 1} / {total}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={prev}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                        style={{ background: "hsl(224 71% 4% / 0.8)", border: "1px solid hsl(45 100% 50% / 0.3)", backdropFilter: "blur(10px)" }}
                    >
                        <ChevronLeft className="w-6 h-6 text-gold" />
                    </button>
                    <button
                        onClick={next}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                        style={{ background: "hsl(224 71% 4% / 0.8)", border: "1px solid hsl(45 100% 50% / 0.3)", backdropFilter: "blur(10px)" }}
                    >
                        <ChevronRight className="w-6 h-6 text-gold" />
                    </button>
                </div>

                <div className="flex items-center justify-center gap-3 mt-8">
                    {galleryItems.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => goTo(i)}
                            className="group relative transition-all duration-300"
                        >
                            <div
                                className="h-2 rounded-full transition-all duration-500"
                                style={{
                                    width: i === current ? "2.5rem" : "0.5rem",
                                    background: i === current
                                        ? "linear-gradient(90deg, hsl(45 100% 50%), hsl(28 100% 50%))"
                                        : "hsl(45 100% 50% / 0.25)",
                                    boxShadow: i === current ? "0 0 12px hsl(45 100% 50% / 0.4)" : "none",
                                }}
                            />
                        </button>
                    ))}
                </div>

                <div className="flex items-center justify-center gap-3 mt-8">
                    {galleryItems.map((item, i) => (
                        <button
                            key={i}
                            onClick={() => goTo(i)}
                            className="relative rounded-xl overflow-hidden transition-all duration-300 backdrop-blur-sm"
                            style={{
                                width: "100px",
                                height: "65px",
                                border: i === current ? "2px solid hsl(45 100% 50%)" : "2px solid hsl(45 100% 50% / 0.1)",
                                opacity: i === current ? 1 : 0.5,
                                transform: i === current ? "scale(1.1)" : "scale(1)",
                                boxShadow: i === current ? "0 0 20px hsl(45 100% 50% / 0.3)" : "none",
                            }}
                        >
                            <img
                                src={item.src}
                                alt={item.caption}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CollegeGallerySection;
