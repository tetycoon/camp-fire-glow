import React, { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
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

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 shadow-sm border-b border-gray-100 backdrop-blur-md" : "bg-white/80 backdrop-blur-sm"}`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 sm:h-20">
                    {/* Logo */}
                    <a href="/" className="flex items-center gap-2 hover:opacity-85 transition-opacity" title="Back to TechTycoon Hub">
                        <img src="/logo.png" alt="Tech Tycoon" className="w-7 h-7 sm:w-8 sm:h-8 rounded-full" />
                        <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900">TECH TYCOON</span>
                    </a>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        <a
                            href="/"
                            className="text-xs font-bold text-slate-700 hover:text-black bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full transition-colors"
                        >
                            ← Main Hub
                        </a>
                        <button
                            onClick={openRegisterModal}
                            className="flex items-center justify-center bg-brandGreen hover:bg-[#95c06b] text-slate-900 text-sm font-black px-6 py-2.5 rounded-xl transition-all duration-200 border border-[#a3c77e] shadow-sm hover:scale-105"
                        >
                            REGISTER NOW — ₹99
                        </button>
                    </div>

                    {/* Mobile Quick Action Button + Menu Button */}
                    <div className="flex items-center gap-2 md:hidden">
                        <button
                            onClick={openRegisterModal}
                            className="bg-brandGreen text-slate-900 text-xs font-black px-3.5 py-2 rounded-lg shadow-sm"
                        >
                            REGISTER — ₹99
                        </button>
                        <button
                            className="text-slate-900 hover:text-brandGreen transition-colors p-1.5"
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
                <div className="md:hidden bg-white border-b border-gray-100 px-4 pb-6 shadow-xl animate-in slide-in-from-top-2">
                    <div className="flex flex-col gap-3 pt-2">
                        <a
                            href="/"
                            className="text-left text-sm font-bold text-slate-800 hover:text-brandGreen py-2 border-b border-slate-100"
                        >
                            ← Main Hub (All Programs)
                        </a>
                        <button
                            onClick={() => { openRegisterModal(); setOpen(false); }}
                            className="w-full bg-brandGreen hover:bg-[#95c06b] text-slate-900 text-sm font-black px-5 py-3.5 rounded-xl mt-1 shadow-md border border-[#a3c77e]"
                        >
                            GET MY DISCOUNTED SEAT — ₹99
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default AIMasterclassNavbar;
