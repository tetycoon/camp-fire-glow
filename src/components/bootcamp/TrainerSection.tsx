import React, { useEffect, useRef, useState } from "react";
import trainerImg from "@/assets/trainer.jpg";

const stats = [
  { value: 50, label: "Programs Conducted" },
  { value: 20, label: "Corporate Sectors" },
  { value: 100, label: "Colleges Reached" },
  { value: 5000, label: "People Impacted" },
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

const TrainerSection: React.FC = () => {
  return (
    <section id="trainer" className="section-border py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <p className="font-body text-xs tracking-[0.3em] text-primary uppercase font-semibold mb-3">Your Guide</p>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-foreground mb-4">
            Meet Your <span className="text-gradient">Trainer</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/30 to-secondary/30 blur-2xl scale-110" />
              <img
                src={trainerImg}
                alt="Antony Praveen - AI Trainer"
                className="relative z-10 w-64 h-64 sm:w-80 sm:h-80 rounded-3xl object-cover border-2 border-primary/30"
              />
            </div>
          </div>

          {/* Info */}
          <div>
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">Antony Praveen</h3>
            <p className="font-body text-sm text-primary font-semibold mb-6 tracking-wider">Founder, Tech Tycoon Digital Solutions</p>
            <p className="font-body text-muted-foreground leading-relaxed mb-10">
              A seasoned AI trainer and digital transformation expert with a proven track record across corporate, academic, and entrepreneurial spaces. Antony has empowered thousands of individuals with cutting-edge AI skills, helping them unlock new opportunities in their careers and businesses.
            </p>

            <div className="grid grid-cols-2 gap-6">
              {stats.map((s, i) => (
                <div key={i} className="card-glow rounded-2xl p-6 text-center">
                  <div className="font-display text-2xl sm:text-3xl font-black text-gradient-cyan mb-1">
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
