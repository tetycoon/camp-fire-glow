import React, { useEffect, useState } from "react";
import { Menu, X, Zap } from "lucide-react";

const Navbar: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showCTA, setShowCTA] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      // Show sticky CTA after scrolling past hero (~100vh)
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
      {/* ── Main Navbar ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-md"
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
              <div
                className="animate-pulse-glow rounded-full p-1.5"
                style={{ background: "hsl(199 100% 55% / 0.15)", border: "1px solid hsl(199 100% 55% / 0.3)" }}
              >
                <Zap className="w-5 h-5 text-primary" />
              </div>
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

            {/* Desktop CTA — morphs from "Register Now" → "Secure Your Seat" */}
            <button
              onClick={() => scrollTo("register")}
              className="hidden md:flex items-center gap-2 btn-glow text-primary-foreground font-display text-xs font-bold px-5 py-2.5 rounded-full tracking-wider transition-all duration-500"
              style={{
                boxShadow: showCTA ? "0 0 24px hsl(199 100% 55% / 0.5)" : undefined,
              }}
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

      {/* ── Floating bottom CTA (mobile only) ── */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 md:hidden transition-all duration-500 ${
          showCTA ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
        }`}
      >
        <button
          onClick={() => scrollTo("register")}
          className="btn-glow text-primary-foreground font-display text-xs font-bold px-8 py-3.5 rounded-full tracking-widest flex items-center gap-2 whitespace-nowrap"
          style={{ boxShadow: "0 8px 32px hsl(199 100% 55% / 0.45)" }}
        >
          🔒 SECURE YOUR SEAT — ₹3,999
        </button>
      </div>
    </>
  );
};

export default Navbar;
