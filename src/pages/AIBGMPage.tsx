import React, { useState, useEffect } from "react";
import AIBGMNavbar from "../components/ai_bgm/AIBGMNavbar";
import AIBGMHero from "../components/ai_bgm/AIBGMHero";
import AIBGMBMCSection from "../components/ai_bgm/AIBGMBMCSection";
import AIBGMCurriculum from "../components/ai_bgm/AIBGMCurriculum";
import AIBGMLivingLLM from "../components/ai_bgm/AIBGMLivingLLM";
import AIBGMTrainer from "../components/ai_bgm/AIBGMTrainer";
import AIBGMFAQ from "../components/ai_bgm/AIBGMFAQ";
import AIBGMFooter from "../components/ai_bgm/AIBGMFooter";
import AIBGMRegisterModal from "../components/ai_bgm/AIBGMRegisterModal";
import { Lock, ArrowRight } from "lucide-react";

const AIBGMPage: React.FC = () => {
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    document.title = "Advance AI-Business Generative Model (AI-BGM) — Tech Tycoon";

    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const openRegisterModal = () => {
    setIsRegisterModalOpen(true);
  };

  const closeRegisterModal = () => {
    setIsRegisterModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white flex flex-col relative">
      <AIBGMNavbar onRegisterClick={openRegisterModal} />
      
      <main className="flex-grow">
        <AIBGMHero onUnlockClick={openRegisterModal} />
        <AIBGMBMCSection onRegisterClick={openRegisterModal} />
        <AIBGMCurriculum onRegisterClick={openRegisterModal} />
        <AIBGMLivingLLM onRegisterClick={openRegisterModal} />
        <AIBGMTrainer onRegisterClick={openRegisterModal} />
        <AIBGMFAQ />
      </main>

      <AIBGMFooter />

      {/* Popup Registration Modal */}
      <AIBGMRegisterModal 
        isOpen={isRegisterModalOpen} 
        onClose={closeRegisterModal} 
      />

      {/* Floating Sticky Mobile / Bottom CTA Bar */}
      {showStickyBar && (
        <div className="fixed bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 z-40 max-w-md mx-auto animate-in slide-in-from-bottom duration-300">
          <div className="p-1.5 sm:p-2 rounded-xl sm:rounded-2xl bg-white/95 border border-slate-200/90 backdrop-blur-xl shadow-2xl shadow-slate-900/10 flex items-center justify-between gap-2 sm:gap-3">
            <div className="pl-2 sm:pl-3 min-w-0">
              <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-blue-600 truncate">
                AI-BGM Executive Cohort
              </div>
              <div className="text-[11px] sm:text-xs font-bold text-slate-900 truncate">
                20+ Hrs • Living LLM Access
              </div>
            </div>

            <button
              onClick={openRegisterModal}
              className="px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white font-bold text-[11px] sm:text-xs uppercase tracking-wider shadow-lg shadow-blue-600/25 flex items-center gap-1 sm:gap-1.5 hover:scale-105 active:scale-95 transition-all whitespace-nowrap flex-shrink-0"
            >
              <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300" />
              <span>Unlock Pricing</span>
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIBGMPage;
