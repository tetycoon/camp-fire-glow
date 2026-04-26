import React, { useState, useEffect } from "react";
import { Menu, X, MapPin } from "lucide-react";
import { useUpscaleRegisterModal } from "./UpscaleRegisterModalContext";
import logo from "@/assets/tech_tycoon_logo.png";

const UpscaleNavbar: React.FC = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { openRegisterModal } = useUpscaleRegisterModal();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: "The Workshop", id: "about" },
        { name: "Venue", id: "venue" },
        { name: "Mentors", id: "trainer" },
    ];

    const scrollTo = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            const offset = 80;
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = el.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
        setMobileOpen(false);
    };

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm py-0" : "bg-transparent py-0"}`}>
            {/* Core Pillars Feature Bar */}
            <div className={`w-full py-2 px-6 transition-all duration-500 ${scrolled ? "bg-slate-900 text-white/70" : "bg-blue-600/10 text-blue-600"}`}>
                {/* Desktop: Full pillars list */}
                <div className="max-w-7xl mx-auto hidden md:flex justify-end gap-6 text-[9px] font-black uppercase tracking-[0.2em]">
                    <span className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-current opacity-40"></span> 9 Principles of AI Business Generative Models</span>
                    <span className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-current opacity-40"></span> AI Video Generation</span>
                    <span className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-current opacity-40"></span> AI Website Design</span>
                    <span className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-current opacity-40"></span> Practise 10+ Effective AI Tools</span>
                </div>
                {/* Mobile: Condensed */}
                <div className="md:hidden flex justify-center gap-4 text-[8px] font-black uppercase tracking-[0.15em]">
                    <span>AI Business</span>
                    <span>•</span>
                    <span>Video Gen</span>
                    <span>•</span>
                    <span>Web Design</span>
                    <span>•</span>
                    <span>10+ Tools</span>
                </div>
            </div>

            <div className={`max-w-7xl mx-auto px-6 flex items-center justify-between transition-all duration-500 ${scrolled ? "py-3" : "py-6"}`}>
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                    <img src={logo} alt="Tech Tycoon Logo" className="w-12 h-12 object-contain" />
                    <div className="flex flex-col">
                        <span className={`text-xl font-black leading-tight tracking-tighter ${scrolled ? "text-slate-900" : "text-slate-900"}`}>TECH TYCOON</span>
                    </div>
                </div>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map(link => (
                        <button 
                            key={link.id} 
                            onClick={() => scrollTo(link.id)}
                            className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
                        >
                            {link.name}
                        </button>
                    ))}
                    <button 
                        onClick={openRegisterModal}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg shadow-blue-200 active:scale-95"
                    >
                        SECURE MY SEAT
                    </button>
                </div>

                {/* Mobile Trigger */}
                <button className="md:hidden p-2 text-slate-900" onClick={() => setMobileOpen(!mobileOpen)}>
                    {mobileOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            <div className={`fixed inset-x-0 top-full bg-white border-t border-slate-100 shadow-xl transition-all duration-300 opacity-0 pointer-events-none translate-y-4 ${mobileOpen ? "opacity-100 pointer-events-auto translate-y-0" : ""}`}>
                <div className="p-6 flex flex-col gap-6">
                    {navLinks.map(link => (
                        <button 
                            key={link.id} 
                            onClick={() => scrollTo(link.id)}
                            className="text-left text-lg font-bold text-slate-900"
                        >
                            {link.name}
                        </button>
                    ))}
                    <button 
                        onClick={openRegisterModal}
                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-lg"
                    >
                        BOOK SEAT — ₹4,999
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default UpscaleNavbar;
