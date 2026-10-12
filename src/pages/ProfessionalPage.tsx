import React, { useState, useEffect } from "react";
import ProfessionalNavbar from "../components/professionals/ProfessionalNavbar";
import ProfessionalHero from "../components/professionals/ProfessionalHero";
import ProfessionalComparison from "../components/professionals/ProfessionalComparison";
import ProfessionalRolesSection from "../components/professionals/ProfessionalRolesSection";
import ProfessionalCurriculum from "../components/professionals/ProfessionalCurriculum";
import ProfessionalToolsSection from "../components/professionals/ProfessionalToolsSection";
import ProfessionalBonuses from "../components/professionals/ProfessionalBonuses";
import ProfessionalTrainer from "../components/professionals/ProfessionalTrainer";
import ProfessionalRegistrationForm from "../components/professionals/ProfessionalRegistrationForm";
import ProfessionalFAQ from "../components/professionals/ProfessionalFAQ";
import ProfessionalFooter from "../components/professionals/ProfessionalFooter";
import ProfessionalRegisterModal from "../components/professionals/ProfessionalRegisterModal";
import { Lock, ArrowRight, Zap, Sparkles, CheckCircle2 } from "lucide-react";

const ProfessionalPage: React.FC = () => {
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    document.title = "Advance AI for Non-Tech Working Professionals — Tech Tycoon";

    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 450);
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
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-600 selection:text-white flex flex-col relative">
      <ProfessionalNavbar onRegisterClick={openRegisterModal} />

      <main className="flex-grow">
        <ProfessionalHero onUnlockClick={openRegisterModal} />
        <ProfessionalComparison onRegisterClick={openRegisterModal} />
        <ProfessionalRolesSection onRegisterClick={openRegisterModal} />
        <ProfessionalCurriculum onRegisterClick={openRegisterModal} />
        <ProfessionalToolsSection onRegisterClick={openRegisterModal} />
        <ProfessionalBonuses onRegisterClick={openRegisterModal} />

        {/* Dedicated On-Page Enrollment Section */}
        <section id="enrollment" className="py-14 sm:py-20 bg-gradient-to-b from-slate-50 via-indigo-50/30 to-white border-t border-slate-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-black uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5" /> SECURE YOUR SEAT
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2">
                Accelerate Your Workplace Trajectory
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Join 3,200+ working professionals who have transformed how they work with practical AI.
              </p>
            </div>

            <div className="max-w-xl mx-auto">
              <ProfessionalRegistrationForm />
            </div>
          </div>
        </section>

        <ProfessionalTrainer onRegisterClick={openRegisterModal} />
        <ProfessionalFAQ />
      </main>

      <ProfessionalFooter />

      {/* Popup Registration Modal */}
      <ProfessionalRegisterModal
        isOpen={isRegisterModalOpen}
        onClose={closeRegisterModal}
      />

      {/* Floating Sticky Mobile & Desktop CTA Bar */}
      {showStickyBar && (
        <div className="fixed bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 z-40 max-w-md mx-auto animate-in slide-in-from-bottom duration-300">
          <div className="p-1.5 sm:p-2 rounded-xl sm:rounded-2xl bg-white/95 border border-slate-200/90 backdrop-blur-xl shadow-2xl shadow-slate-900/10 flex items-center justify-between gap-2 sm:gap-3">
            <div className="pl-2 sm:pl-3 min-w-0">
              <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-indigo-600 truncate">
                Advance AI for Professionals
              </div>
              <div className="text-[11px] sm:text-xs font-bold text-slate-900 truncate">
                VIP Rate: ₹2,999 • 20+ Hrs
              </div>
            </div>

            <button
              onClick={openRegisterModal}
              className="px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 text-white font-bold text-[11px] sm:text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/25 flex items-center gap-1 sm:gap-1.5 hover:scale-105 active:scale-95 transition-all whitespace-nowrap flex-shrink-0"
            >
              <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300" />
              <span>Enroll Now</span>
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessionalPage;
