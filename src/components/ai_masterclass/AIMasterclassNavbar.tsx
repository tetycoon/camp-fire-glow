import React, { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useAIMasterclassRegisterModal } from "./AIMasterclassRegisterModalContext";

const AIMasterclassNavbar: React.FC = () => {
    const [open, setOpen] = React.useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [showCTA, setShowCTA] = useState(false);
    const { openRegisterModal } = useAIMasterclassRegisterModal();

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
            {/* Urgency Top Bar */}
            <div
                className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-500 bg-red-600 text-white ${showCTA ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"}`}
            >
                <div className="max-w-7xl mx-auto px-4 h-10 flex items-center justify-center gap-4">
                    <div className="hidden sm:flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider">
                            ⚡ Launch Offer: Get Masterclass @ ₹99 — Limited seats!
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Navigation */}
            <nav
                className={`fixed left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 shadow-sm border-b border-gray-100 backdrop-blur-md" : "bg-transparent"} ${showCTA ? "top-10" : "top-0"}`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo */}
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
                            <img src="/logo.png" alt="Tech Tycoon" className="w-8 h-8 rounded-full" />
                            <span className="text-xl font-black tracking-tight text-slate-900">TECH TYCOON</span>
                        </div>

                        {/* Desktop CTA */}
                        {showCTA && (
                            <button
                                onClick={openRegisterModal}
                                className="hidden md:flex items-center justify-center bg-brandGreen hover:bg-[#a3c77e] text-slate-900 text-sm font-bold px-8 py-3 rounded-md transition-all duration-200"
                            >
                                GET MY DISCOUNTED SEAT
                            </button>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden text-slate-900 hover:text-brandGreen transition-colors p-2"
                            onClick={() => setOpen(!open)}
                        >
                            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {open && (
                    <div className="md:hidden bg-white border-t border-gray-100 px-4 pb-6 shadow-xl">
                        <div className="flex flex-col gap-4 pt-4">
                            <button
                                onClick={() => { openRegisterModal(); setOpen(false); }}
                                className="w-full bg-brandGreen hover:bg-[#a3c77e] text-slate-900 text-sm font-bold px-5 py-4 rounded-md mt-2"
                            >
                                GET MY DISCOUNTED SEAT
                            </button>
                        </div>
                    </div>
                )}
            </nav>
        </>
    );
};

export default AIMasterclassNavbar;
