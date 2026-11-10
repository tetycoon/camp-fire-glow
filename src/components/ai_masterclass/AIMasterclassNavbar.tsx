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
                    ? "bg-white/95 shadow-sm border-b border-slate-200/90 backdrop-blur-md py-1"
                    : "bg-white/90 border-b border-slate-200/60 backdrop-blur-sm py-2"
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-14 sm:h-16">
                    <a href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity" title="TECH TYCOON DIGITAL SOLUTION LLP">
                        <img src="/logo.png" alt="TECH TYCOON DIGITAL SOLUTION LLP" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-slate-200 shadow-xs shrink-0" />
                        <div className="flex flex-col text-left leading-none">
                            <span className="text-sm sm:text-base font-black tracking-tight text-slate-900">TECH TYCOON</span>
                            <span className="text-[9px] sm:text-[10px] font-bold tracking-widest text-slate-500 uppercase mt-0.5">DIGITAL SOLUTION LLP</span>
                        </div>
                    </a>

                    {/* Desktop Navigation Links */}
                    <div className="hidden lg:flex items-center gap-7 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        <button onClick={() => scrollTo("about")} className="hover:text-blue-600 transition-colors cursor-pointer">
                            Overview
                        </button>
                        <button onClick={() => scrollTo("modules")} className="hover:text-blue-600 transition-colors cursor-pointer">
                            Curriculum
                        </button>
                        <button onClick={() => scrollTo("trainer")} className="hover:text-blue-600 transition-colors cursor-pointer">
                            Lead Trainer
                        </button>
                        <button onClick={() => scrollTo("pricing")} className="hover:text-blue-600 transition-colors cursor-pointer">
                            Registration Fee
                        </button>
                        <button onClick={() => scrollTo("faq")} className="hover:text-blue-600 transition-colors cursor-pointer">
                            FAQ
                        </button>
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-3">
                        <a
                            href="/"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 px-3.5 py-2 rounded-lg transition-colors"
                        >
                            <Building2 className="w-3.5 h-3.5 text-slate-500" />
                            <span>Corporate Hub</span>
                        </a>
                        <button
                            onClick={openRegisterModal}
                            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl transition-all duration-200 shadow-sm shadow-blue-600/20 hover:shadow-md cursor-pointer"
                        >
                            <span>Enroll for ₹99</span>
                            <ArrowRight className="w-3.5 h-3.5 text-white" />
                        </button>
                    </div>

                    {/* Mobile Quick Action Button + Menu Button */}
                    <div className="flex items-center gap-2 md:hidden">
                        <button
                            onClick={openRegisterModal}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-sm"
                        >
                            Enroll — ₹99
                        </button>
                        <button
                            className="text-slate-900 hover:text-blue-600 transition-colors p-1.5 cursor-pointer"
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
                <div className="md:hidden bg-white border-b border-slate-200 px-4 pb-6 pt-2 shadow-xl animate-in slide-in-from-top-2">
                    <div className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
                        <button onClick={() => scrollTo("about")} className="text-left py-2.5 border-b border-slate-100">
                            Program Overview
                        </button>
                        <button onClick={() => scrollTo("modules")} className="text-left py-2.5 border-b border-slate-100">
                            Curriculum & Modules
                        </button>
                        <button onClick={() => scrollTo("trainer")} className="text-left py-2.5 border-b border-slate-100">
                            Lead Instructor
                        </button>
                        <button onClick={() => scrollTo("pricing")} className="text-left py-2.5 border-b border-slate-100">
                            Fee & Schedule
                        </button>
                        <button onClick={() => scrollTo("faq")} className="text-left py-2.5 border-b border-slate-100">
                            Frequently Asked Questions
                        </button>
                        <button
                            onClick={() => { openRegisterModal(); setOpen(false); }}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-5 py-3 rounded-xl mt-2 shadow-md shadow-blue-600/20"
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
