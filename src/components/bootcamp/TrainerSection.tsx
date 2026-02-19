import React, { useEffect, useRef, useState } from "react";
import trainerImg from "@/assets/trainer-photo.png";

const stats = [
  { value: 50, label: "Programs Conducted", color: "text-gradient-cyan" },
  { value: 20, label: "Corporate Sectors", color: "text-gradient" },
  { value: 100, label: "Colleges Reached", color: "text-gradient-orange" },
  { value: 5000, label: "People Impacted", color: "text-gradient-green" },
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
  { border: "hsl(183 100% 55% / 0.35)", bg: "hsl(183 100% 55% / 0.07)" },
  { border: "hsl(265 85% 65% / 0.35)", bg: "hsl(265 85% 65% / 0.07)" },
  { border: "hsl(25 100% 60% / 0.35)", bg: "hsl(25 100% 60% / 0.07)" },
  { border: "hsl(142 70% 50% / 0.35)", bg: "hsl(142 70% 50% / 0.07)" },
];

const TrainerSection: React.FC = () => {
  return (
    <section id="trainer" className="section-border py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, hsl(265 85% 65% / 0.08), transparent 70%)" }} />
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, hsl(25 100% 60% / 0.07), transparent 70%)" }} />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="section-label mb-4 mx-auto w-fit">👨‍💻 Your Guide</div>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-foreground mb-4">
            Meet Your <span className="text-gradient">Trainer</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl blur-3xl scale-110" style={{ background: "linear-gradient(135deg, hsl(199 100% 55% / 0.35), hsl(265 85% 65% / 0.25))" }} />
              <div className="absolute -inset-1 rounded-3xl" style={{ background: "linear-gradient(135deg, hsl(199 100% 55% / 0.5), hsl(265 85% 65% / 0.4), hsl(25 100% 60% / 0.3))", padding: "2px" }}>
                <div className="w-full h-full rounded-3xl" style={{ background: "hsl(222 40% 7%)" }} />
              </div>
              <img
                src={trainerImg}
                alt="Antony Praveen - AI Trainer"
                className="relative z-10 w-64 h-64 sm:w-80 sm:h-80 rounded-3xl object-cover"
              />
              {/* Floating badge */}
              <div className="absolute -bottom-4 -right-4 z-20 rounded-2xl px-4 py-3 text-center"
                style={{ background: "linear-gradient(135deg, hsl(199 100% 55%), hsl(265 85% 65%))", boxShadow: "0 0 30px hsl(199 100% 55% / 0.5)" }}>
                <div className="font-display text-xl font-black" style={{ color: "hsl(222 47% 5%)" }}>5K+</div>
                <div className="font-body text-xs font-semibold" style={{ color: "hsl(222 47% 5% / 0.8)" }}>Impacted</div>
              </div>
            </div>
          </div>

          {/* Info */}
          <div>
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">Antony Praveen</h3>
            <p className="font-body text-sm font-semibold mb-6 tracking-wider text-gradient-cyan">Founder, Tech Tycoon Digital Solutions</p>
            <p className="font-body text-muted-foreground leading-relaxed mb-10">
              A seasoned AI trainer and digital transformation expert with a proven track record across corporate, academic, and entrepreneurial spaces. Antony has empowered thousands of individuals with cutting-edge AI skills, helping them unlock new opportunities in their careers and businesses.
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

        <div className="text-center mt-16">
          <button
            onClick={() => document.getElementById("register")?.scrollIntoView({ behavior: "smooth" })}
            className="btn-glow text-primary-foreground font-display text-sm font-bold px-10 py-4 rounded-full tracking-widest"
          >
            🚀 SECURE YOUR SEAT
          </button>
        </div>
      </div>
    </section>
  );
};

export default TrainerSection;
