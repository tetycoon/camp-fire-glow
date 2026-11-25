import React from "react";
import { ArrowRight } from "lucide-react";
import { useAIMasterclassRegisterModal } from "./AIMasterclassRegisterModalContext";

const AIMasterclassBonusesSection: React.FC = () => {
    const { openRegisterModal } = useAIMasterclassRegisterModal();

    return (
        <section id="bonuses" className="py-12 sm:py-16 px-4 bg-white border-t border-slate-200/90 relative">
            <div className="max-w-5xl mx-auto">
                {/* Complete Delegate Package Banner */}
                <div className="bg-slate-900 rounded-2xl p-8 sm:p-12 border border-slate-800 text-center relative overflow-hidden shadow-xl">
                    <div className="max-w-3xl mx-auto">
                        <span className="inline-block px-3.5 py-1 rounded-md bg-blue-500/15 text-[11px] font-bold text-blue-300 tracking-widest uppercase mb-3 border border-blue-400/25">
                            COMPLETE DELEGATE PACKAGE
                        </span>
                        <h3 className="text-2xl sm:text-4xl font-black text-white mb-3 tracking-tight">
                            Live 3-Hour Workshop + ₹9,997 Toolkit = <span className="text-blue-400">₹499</span>
                        </h3>
                        <p className="text-sm text-slate-300 mb-6 max-w-2xl mx-auto">
                            Live 3-Hour virtual masterclass + complete digital resource suite. Live masterclass sessions are currently on hold.
                        </p>
                        <button
                            disabled
                            className="bg-slate-700 text-slate-400 font-bold text-base px-8 py-4 rounded-xl cursor-not-allowed inline-flex items-center gap-2"
                        >
                            <span>Admissions Paused</span>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AIMasterclassBonusesSection;
