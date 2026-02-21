import React, { useEffect, useState } from "react";
import { Menu, X, Clock } from "lucide-react";

// ── Countdown to Batch 1 start: April 1, 2026 ──
const TARGET_DATE = new Date("2026-04-01T00:00:00");

function getTimeLeft() {
  const diff = TARGET_DATE.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0 };
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    mins: Math.floor((diff % 3600000) / 60000),
    secs: Math.floor((diff % 60000) / 1000),
  };
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center leading-none">
      <span className="font-display font-black tabular-nums" style={{ fontSize: "0.7rem", color: "hsl(199 100% 65%)" }}>
        {String(value).padStart(2, "0")}
      </span>
      <span className="font-body uppercase tracking-wider" style={{ fontSize: "0.45rem", color: "hsl(var(--muted-foreground))" }}>
        {label}
      </span>
    </div>
  );
}

function CountdownTimer({ compact = false }: { compact?: boolean }) {
  const [t, setT] = useState(getTimeLeft);

  useEffect(() => {
    const id = setInterval(() => setT(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  if (compact) {
    // inline condensed version for mobile pill
    return (
      <span className="font-display font-black tabular-nums text-[0.65rem]" style={{ color: "hsl(199 100% 70%)" }}>
        {t.days}d {String(t.hours).padStart(2, "0")}h {String(t.mins).padStart(2, "0")}m {String(t.secs).padStart(2, "0")}s
      </span>
    );
  }

  return (
    <div
      className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
      style={{
        background: "hsl(199 100% 55% / 0.08)",
        border: "1px solid hsl(199 100% 55% / 0.25)",
      }}
    >
      <Clock className="w-3 h-3 flex-shrink-0" style={{ color: "hsl(199 100% 60%)" }} />
      <div className="flex items-center gap-1.5">
        <CountdownUnit value={t.days} label="days" />
        <span className="font-display font-black text-[0.6rem]" style={{ color: "hsl(199 100% 55% / 0.6)", marginBottom: "2px" }}>:</span>
        <CountdownUnit value={t.hours} label="hrs" />
        <span className="font-display font-black text-[0.6rem]" style={{ color: "hsl(199 100% 55% / 0.6)", marginBottom: "2px" }}>:</span>
        <CountdownUnit value={t.mins} label="min" />
        <span className="font-display font-black text-[0.6rem]" style={{ color: "hsl(199 100% 55% / 0.6)", marginBottom: "2px" }}>:</span>
        <CountdownUnit value={t.secs} label="sec" />
      </div>
    </div>
  );
}

// ── Navbar ──
const Navbar: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showCTA, setShowCTA] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      setShowCTA(window.scrollY > window.innerHeight * 0.6);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setOpen(false);
  };

  return (
    <>
      {/* ── Sticky top urgency bar (desktop) ── */}
      <div
        className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-500 ${showCTA ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
          }`}
        style={{
          background: "linear-gradient(90deg, hsl(199 100% 55% / 0.15), hsl(265 85% 65% / 0.12), hsl(199 100% 55% / 0.15))",
          borderBottom: "1px solid hsl(199 100% 55% / 0.3)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 h-10 flex items-center justify-between gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-[0.65rem] font-body font-semibold uppercase tracking-widest" style={{ color: "hsl(199 100% 70%)" }}>
              ⚡ Batch 1 starts April 1 — Limited seats!
            </span>
          </div>

          <div className="flex items-center gap-3 mx-auto sm:mx-0">
            <Clock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "hsl(25 100% 65%)" }} />
            <span className="font-body text-[0.6rem] text-muted-foreground uppercase tracking-wider hidden sm:block">Closes in</span>
            <CountdownTimer />
            {/* Mobile compact */}
            <div className="sm:hidden flex items-center gap-1.5">
              <CountdownTimer compact />
            </div>
          </div>

          <button
            onClick={() => scrollTo("register")}
            className="hidden sm:block btn-glow text-primary-foreground font-display text-[0.6rem] font-bold px-4 py-1.5 rounded-full tracking-wider whitespace-nowrap animate-pulse-glow"
          >
            🔒 SECURE YOUR SEAT
          </button>
        </div>
      </div>

      {/* ── Main Navbar ── */}
      <nav
        className={`fixed left-0 right-0 z-50 transition-all duration-500 backdrop-blur-md ${showCTA ? "top-10" : "top-0"
          }`}
        style={{
          background: scrolled ? "hsl(222 47% 5% / 0.95)" : "hsl(222 47% 5% / 0.75)",
          borderBottom: "1px solid hsl(199 100% 55% / 0.15)",
          boxShadow: scrolled ? "0 4px 30px hsl(199 100% 55% / 0.08)" : "none",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Tech Tycoon" className="w-8 h-8 rounded-full" />
              <span className="font-display text-sm font-bold tracking-wider text-gradient">TECH TYCOON</span>
            </div>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-6 font-body text-sm text-muted-foreground">
              {["why", "modules", "trainer", "pricing", "register"].map((id) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className="hover:text-primary transition-colors capitalize font-medium relative group"
                >
                  {id === "why" ? "About" : id.charAt(0).toUpperCase() + id.slice(1)}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-primary transition-all duration-300 group-hover:w-full" />
                </button>
              ))}
            </div>

            {/* Desktop CTA */}
            <button
              onClick={() => scrollTo("register")}
              className="hidden md:flex items-center gap-2 btn-glow text-primary-foreground font-display text-xs font-bold px-5 py-2.5 rounded-full tracking-wider transition-all duration-500"
              style={{ boxShadow: showCTA ? "0 0 24px hsl(199 100% 55% / 0.5)" : undefined }}
            >
              {showCTA ? "🔒 SECURE YOUR SEAT" : "REGISTER NOW"}
            </button>

            {/* Mobile hamburger */}
            <button
              className="md:hidden text-muted-foreground hover:text-primary transition-colors"
              onClick={() => setOpen(!open)}
            >
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {open && (
          <div
            className="md:hidden px-4 pb-4"
            style={{ background: "hsl(222 40% 8%)", borderTop: "1px solid hsl(199 100% 55% / 0.15)" }}
          >
            <div className="flex flex-col gap-3 pt-3 font-body text-sm">
              {["why", "modules", "trainer", "pricing", "register"].map((id) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className="text-left text-muted-foreground hover:text-primary transition-colors py-2 capitalize"
                >
                  {id === "why" ? "About" : id.charAt(0).toUpperCase() + id.slice(1)}
                </button>
              ))}
              <button
                onClick={() => scrollTo("register")}
                className="btn-glow text-primary-foreground font-display text-xs font-bold px-5 py-3 rounded-full tracking-wider mt-2"
              >
                🔒 SECURE YOUR SEAT
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* ── Floating bottom pill (mobile only) ── */}
      <div
        className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-50 md:hidden transition-all duration-500 ${showCTA ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
          }`}
      >
        <button
          onClick={() => scrollTo("register")}
          className="btn-glow text-primary-foreground font-display text-[0.65rem] font-bold pl-5 pr-6 py-3 rounded-full tracking-wider flex items-center gap-3 whitespace-nowrap"
          style={{ boxShadow: "0 8px 32px hsl(199 100% 55% / 0.5)" }}
        >
          <span>🔒 SECURE YOUR SEAT</span>
          <span
            className="flex items-center gap-1 px-2 py-0.5 rounded-full"
            style={{ background: "hsl(222 47% 5% / 0.5)", border: "1px solid hsl(199 100% 55% / 0.3)" }}
          >
            <Clock className="w-2.5 h-2.5" style={{ color: "hsl(25 100% 65%)" }} />
            <CountdownTimer compact />
          </span>
        </button>
      </div>
    </>
  );
};

export default Navbar;
