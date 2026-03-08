import React, { useEffect, useState } from "react";
import { Menu, X, Clock } from "lucide-react";
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
            <div
                className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-500 ${showCTA ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
                    }`}
                style={{
                    background: "rgba(224, 242, 254, 0.9)",
                    borderBottom: "1px solid rgba(186, 230, 253, 0.5)",
                    backdropFilter: "blur(12px)",
                }}
            >
                <div className="max-w-7xl mx-auto px-4 h-10 flex items-center justify-center gap-4">
                    <div className="hidden sm:flex items-center gap-2">
                        <span className="text-[0.65rem] font-body font-bold uppercase tracking-widest text-[#2563eb]">
                            ⚡ Launch Offer: Get Masterclass @ ₹99 — Limited seats!
                        </span>
                    </div>
                </div>
            </div>

            <nav
                className={`fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-500 backdrop-blur-md rounded-2xl mt-4 px-6 w-[95%] max-w-7xl ${showCTA ? "top-10" : "top-0"
                    }`}
                style={{
                    background: scrolled ? "rgba(255, 255, 255, 0.85)" : "rgba(224, 242, 254, 0.7)",
                    border: "1px solid rgba(186, 230, 253, 0.5)",
                    boxShadow: scrolled ? "0 10px 30px rgba(0, 0, 0, 0.05)" : "none",
                }}
            >
                <div className="">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <img src="/logo.png" alt="Tech Tycoon" className="w-8 h-8 rounded-full" />
                            <span className="font-display text-sm font-black tracking-tighter text-slate-900 italic">TECH TYCOON</span>
                        </div>


                        <button
                            onClick={openRegisterModal}
                            className="hidden md:flex items-center gap-2 bg-[#3b82f6] hover:bg-blue-600 text-white font-display text-[11px] font-bold px-7 py-3 rounded-full tracking-wider transition-all duration-500"
                            style={{ boxShadow: showCTA ? "0 4px 15px rgba(59, 130, 246, 0.4)" : undefined }}
                        >
                            GET MY DISCOUNTED SEAT
                        </button>

                        <button
                            className="md:hidden text-slate-900 hover:text-blue-600 transition-colors"
                            onClick={() => setOpen(!open)}
                        >
                            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {open && (
                    <div
                        className="md:hidden px-4 pb-4"
                        style={{ background: "white", borderTop: "1px solid rgba(0,0,0,0.05)" }}
                    >
                        <div className="flex flex-col gap-3 pt-3 font-body text-sm font-bold">

                            <button
                                onClick={() => { openRegisterModal(); setOpen(false); }}
                                className="bg-[#3b82f6] text-white font-display text-xs font-bold px-5 py-3 rounded-full tracking-wider mt-2"
                            >
                                GET MY DISCOUNTED SEAT
                            </button>
                        </div>
                    </div>
                )}
            </nav>

            <div
                className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-50 md:hidden transition-all duration-500 w-[90%] max-w-sm ${showCTA ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
                    }`}
            >
                <button
                    onClick={openRegisterModal}
                    className="w-full justify-center bg-[#2563eb] text-white font-display text-base font-black px-6 py-4 rounded-full tracking-wider flex items-center gap-3 shadow-2xl transition-transform active:scale-95 border border-blue-400/30"
                    style={{ boxShadow: "0 8px 32px rgba(37, 99, 235, 0.5)" }}
                >
                    <span className="text-lg">⚡</span>
                    <span>GET MY DISCOUNTED SEAT</span>
                </button>
            </div>
        </>
    );
};

export default AIMasterclassNavbar;
