import React from "react";
import { Menu, X, Zap } from "lucide-react";

const Navbar: React.FC = () => {
  const [open, setOpen] = React.useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="animate-pulse-glow rounded-full p-1.5 bg-primary/10">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <span className="font-display text-sm font-bold text-primary tracking-wider">TECH TYCOON</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6 font-body text-sm text-muted-foreground">
            {["why", "modules", "trainer", "pricing", "register"].map((id) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="hover:text-primary transition-colors capitalize font-medium"
              >
                {id === "why" ? "About" : id.charAt(0).toUpperCase() + id.slice(1)}
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
          <button className="md:hidden text-muted-foreground" onClick={() => setOpen(!open)}>
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-card border-t border-border px-4 pb-4">
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
