import React, { useEffect } from "react";
import AIBGMNavbar from "../components/ai_bgm/AIBGMNavbar";
import AIBGMHero from "../components/ai_bgm/AIBGMHero";
import AIBGMBMCSection from "../components/ai_bgm/AIBGMBMCSection";
import AIBGMCurriculum from "../components/ai_bgm/AIBGMCurriculum";
import AIBGMLivingLLM from "../components/ai_bgm/AIBGMLivingLLM";
import AIBGMTrainer from "../components/ai_bgm/AIBGMTrainer";
import AIBGMRegistrationForm from "../components/ai_bgm/AIBGMRegistrationForm";
import AIBGMFAQ from "../components/ai_bgm/AIBGMFAQ";
import AIBGMFooter from "../components/ai_bgm/AIBGMFooter";

const AIBGMPage: React.FC = () => {
  useEffect(() => {
    document.title = "Advance AI-Business Generative Model (AI-BGM) — Tech Tycoon";
  }, []);

  const scrollToRegistration = () => {
    const el = document.getElementById("register");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white flex flex-col">
      <AIBGMNavbar onRegisterClick={scrollToRegistration} />
      <main className="flex-grow">
        <AIBGMHero onUnlockClick={scrollToRegistration} />
        <AIBGMBMCSection />
        <AIBGMCurriculum />
        <AIBGMLivingLLM />
        <AIBGMTrainer />
        <AIBGMRegistrationForm />
        <AIBGMFAQ />
      </main>
      <AIBGMFooter />
    </div>
  );
};

export default AIBGMPage;
