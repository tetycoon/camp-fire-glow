import React, { useEffect, useState } from "react";
import { Menu, X, ArrowRight, Building2 } from "lucide-react";
import { useAIMasterclassRegisterModal } from "./AIMasterclassRegisterModalContext";

const AIMasterclassNavbar: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { openRegisterModal } = useAIMasterclassRegisterModal();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        setOpen(false);
    };

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                scrolled
                    ? "bg-[#05070f]/85 shadow-[0_10px_40px_-20px_rgba(79,70,229,0.45)] border-b border-white/10 backdrop-blur-xl py-1"
                    : "bg-transparent border-b border-white/[0.06] backdrop-blur-sm py-2"
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-14 sm:h-16">
                    <a href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity" title="TECH TYCOON DIGITAL SOLUTION LLP">
                        <img src="/logo.png" alt="TECH TYCOON DIGITAL SOLUTION LLP" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-white/20 ring-2 ring-indigo-500/20 shrink-0" />
                        <div className="flex flex-col text-left leading-none">
                            <span className="text-sm sm:text-base font-black tracking-tight text-white">TECH TYCOON</span>
                            <span className="text-[9px] sm:text-[10px] font-bold tracking-widest text-indigo-300/80 uppercase mt-0.5">DIGITAL SOLUTION LLP</span>
                        </div>
                    </a>

                    {/* Desktop Navigation Links */}
                    <div className="hidden lg:flex items-center gap-7 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        <button onClick={() => scrollTo("about")} className="hover:text-white transition-colors cursor-pointer">
                            Overview
                        </button>
                        <button onClick={() => scrollTo("modules")} className="hover:text-white transition-colors cursor-pointer">
                            Curriculum
                        </button>
                        <button onClick={() => scrollTo("trainer")} className="hover:text-white transition-colors cursor-pointer">
                            Lead Trainer
                        </button>
                        <button onClick={() => scrollTo("bonuses")} className="hover:text-white transition-colors cursor-pointer">
                            Resources
                        </button>
                        <button onClick={() => scrollTo("pricing")} className="hover:text-white transition-colors cursor-pointer">
                            Registration Fee
                        </button>
                        <button onClick={() => scrollTo("faq")} className="hover:text-white transition-colors cursor-pointer">
                            FAQ
                        </button>
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-3">
                        <a
                            href="/"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 px-3.5 py-2 rounded-lg transition-colors"
                        >
                            <Building2 className="w-3.5 h-3.5 text-indigo-300" />
                            <span>Corporate Hub</span>
                        </a>
                        <button
                            onClick={openRegisterModal}
                            className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 via-blue-500 to-sky-500 hover:brightness-110 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 cursor-pointer"
                        >
                            <span>Enroll for ₹99</span>
                            <ArrowRight className="w-3.5 h-3.5 text-white" />
                        </button>
                    </div>

                    {/* Mobile Quick Action Button + Menu Button */}
                    <div className="flex items-center gap-2 md:hidden">
                        <button
                            onClick={openRegisterModal}
                            className="bg-gradient-to-r from-indigo-500 to-sky-500 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-md shadow-indigo-500/30"
                        >
                            Enroll — ₹99
                        </button>
                        <button
                            className="text-white hover:text-indigo-300 transition-colors p-1.5 cursor-pointer"
                            onClick={() => setOpen(!open)}
                            aria-label="Toggle menu"
                        >
                            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {open && (
                <div className="md:hidden bg-[#070a16]/95 backdrop-blur-xl border-b border-white/10 px-4 pb-6 pt-2 shadow-2xl animate-in slide-in-from-top-2">
                    <div className="flex flex-col gap-2 text-sm font-semibold text-slate-300">
                        <button onClick={() => scrollTo("about")} className="text-left py-2.5 border-b border-white/[0.06]">
                            Program Overview
                        </button>
                        <button onClick={() => scrollTo("modules")} className="text-left py-2.5 border-b border-white/[0.06]">
                            Curriculum & Modules
                        </button>
                        <button onClick={() => scrollTo("trainer")} className="text-left py-2.5 border-b border-white/[0.06]">
                            Lead Instructor
                        </button>
                        <button onClick={() => scrollTo("bonuses")} className="text-left py-2.5 border-b border-white/[0.06]">
                            Executive Resource Suite
                        </button>
                        <button onClick={() => scrollTo("pricing")} className="text-left py-2.5 border-b border-white/[0.06]">
                            Fee & Schedule
                        </button>
                        <button onClick={() => scrollTo("faq")} className="text-left py-2.5 border-b border-white/[0.06]">
                            Frequently Asked Questions
                        </button>
                        <button
                            onClick={() => { openRegisterModal(); setOpen(false); }}
                            className="w-full bg-gradient-to-r from-indigo-500 via-blue-500 to-sky-500 text-white text-sm font-bold px-5 py-3 rounded-xl mt-2 shadow-lg shadow-indigo-500/30"
                        >
                            Enroll For Masterclass — ₹99
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default AIMasterclassNavbar;
