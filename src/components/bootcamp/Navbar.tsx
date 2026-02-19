import React from "react";
import { Menu, X, Zap } from "lucide-react";

const Navbar: React.FC = () => {
  const [open, setOpen] = React.useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md"
      style={{ background: "hsl(222 47% 5% / 0.85)", borderBottom: "1px solid hsl(199 100% 55% / 0.15)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="animate-pulse-glow rounded-full p-1.5" style={{ background: "hsl(199 100% 55% / 0.15)", border: "1px solid hsl(199 100% 55% / 0.3)" }}>
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <span className="font-display text-sm font-bold tracking-wider text-gradient">TECH TYCOON</span>
          </div>

          {/* Desktop Nav */}
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

          <button
            onClick={() => scrollTo("register")}
            className="hidden md:block btn-glow text-primary-foreground font-display text-xs font-bold px-5 py-2 rounded-full tracking-wider"
          >
            REGISTER NOW
          </button>

          {/* Mobile menu */}
          <button className="md:hidden text-muted-foreground hover:text-primary transition-colors" onClick={() => setOpen(!open)}>
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden px-4 pb-4" style={{ background: "hsl(222 40% 8%)", borderTop: "1px solid hsl(199 100% 55% / 0.15)" }}>
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
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
