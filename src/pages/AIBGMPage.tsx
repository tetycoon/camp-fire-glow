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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white flex flex-col relative">
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
        <div className="fixed bottom-4 left-4 right-4 z-40 max-w-md mx-auto animate-in slide-in-from-bottom duration-300">
          <div className="p-2 rounded-2xl bg-slate-900/90 border border-indigo-500/40 backdrop-blur-xl shadow-2xl shadow-indigo-950/60 flex items-center justify-between gap-3">
            <div className="pl-3">
              <div className="text-[10px] font-black uppercase tracking-wider text-indigo-400">
                AI-BGM Executive Cohort
              </div>
              <div className="text-xs font-bold text-white">
                20+ Hrs • Living LLM Access
              </div>
            </div>

            <button
              onClick={openRegisterModal}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
            >
              <Lock className="w-3.5 h-3.5 text-amber-300" />
              <span>Unlock Pricing</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIBGMPage;
