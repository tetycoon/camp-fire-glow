import React, { useEffect, useRef, useState } from "react";
import trainerImg from "@/assets/trainer-photo.png";

const stats = [
  { value: 50, label: "Programs Conducted", color: "text-brand-500" },
  { value: 20, label: "Corporate Sectors", color: "text-brand-400" },
  { value: 100, label: "Schools Reached", color: "text-indigo-400" },
  { value: 5000, label: "People Impacted", color: "text-brand-600" },
];

function CountUp({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = Date.now();
        const tick = () => {
          const elapsed = Date.now() - start;
          const progress = Math.min(elapsed / duration, 1);
          setCount(Math.floor(progress * target));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <div ref={ref}>{count.toLocaleString()}+</div>;
}

const statCardBg = [
  { border: "rgba(99, 102, 241, 0.2)", bg: "rgba(99, 102, 241, 0.05)" },
  { border: "rgba(99, 102, 241, 0.2)", bg: "rgba(99, 102, 241, 0.05)" },
  { border: "rgba(99, 102, 241, 0.2)", bg: "rgba(99, 102, 241, 0.05)" },
  { border: "rgba(99, 102, 241, 0.2)", bg: "rgba(99, 102, 241, 0.05)" },
];

const TrainerSection: React.FC = () => {
  return (
    <section id="trainer" className="section-border py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, hsl(265 85% 65% / 0.08), transparent 70%)" }} />
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, hsl(25 100% 60% / 0.07), transparent 70%)" }} />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="section-label mb-4 mx-auto w-fit tracking-[0.3em]">✦ THE EXPERTISE</div>
          <h2 className="font-display text-4xl sm:text-6xl font-extrabold text-foreground mb-4 tracking-tight">
            Meet Your <span className="text-brand-500">Instructor</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl blur-3xl opacity-20" style={{ background: "var(--brand-500)" }} />
              <div className="absolute -inset-1 rounded-[2rem] p-0.5" style={{ background: "linear-gradient(135deg, var(--brand-500), transparent, var(--brand-400))" }}>
                <div className="w-full h-full rounded-[1.95rem] bg-background" />
              </div>
              <img
                src={trainerImg}
                alt="Antony Praveen - AI Trainer"
                className="relative z-10 w-64 h-64 sm:w-80 sm:h-80 rounded-[1.9rem] object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-500 shadow-2xl"
              />
              {/* Floating badge */}
              <div className="absolute -bottom-6 -right-6 z-20 rounded-2xl px-6 py-4 text-center border border-white/10 backdrop-blur-xl bg-brand-500 shadow-xl shadow-brand-500/20">
                <div className="font-display text-2xl font-black text-white">5K+</div>
                <div className="font-body text-[10px] font-bold text-white/80 uppercase tracking-widest">Impacted</div>
              </div>
            </div>
          </div>

          {/* Info */}
          <div>
            <h3 className="font-display text-3xl sm:text-4xl font-extrabold text-foreground mb-2 tracking-tight">Antony Praveen</h3>
            <p className="font-body text-sm font-bold mb-6 tracking-widest text-brand-500 uppercase">Founder, Tech Tycoon Digital Solutions</p>
            <p className="font-body text-base text-muted-foreground leading-relaxed mb-10">
              A visionary AI strategist and educator dedicated to democratizing digital intelligence. With extensive experience in institutional transformation, Antony has pioneered practical AI frameworks that empower students and professionals to excel in the rapidly evolving technological landscape.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {stats.map((s, i) => (
                <div key={i} className="rounded-2xl p-6 text-center transition-all hover:scale-105 duration-300"
                  style={{ background: statCardBg[i].bg, border: `1px solid ${statCardBg[i].border}` }}>
                  <div className={`font-display text-2xl sm:text-3xl font-black ${s.color} mb-1`}>
                    <CountUp target={s.value} />
                  </div>
                  <p className="font-body text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default TrainerSection;
