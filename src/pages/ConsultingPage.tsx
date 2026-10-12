import React, { useState, useEffect } from "react";
import ConsultingNavbar from "../components/consulting/ConsultingNavbar";
import ConsultingHero from "../components/consulting/ConsultingHero";
import ConsultingTracks from "../components/consulting/ConsultingTracks";
import ConsultingHowItWorks from "../components/consulting/ConsultingHowItWorks";
import ConsultingMentor from "../components/consulting/ConsultingMentor";
import ConsultingFAQ from "../components/consulting/ConsultingFAQ";
import ConsultingFooter from "../components/consulting/ConsultingFooter";
import { Calendar, ArrowRight, Clock, Video } from "lucide-react";

const ConsultingPage: React.FC = () => {
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    document.title = "1-on-1 AI Strategy & Consultation (₹2,500/Hr) — Tech Tycoon";

    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToBooking = () => {
    const el = document.getElementById("booking-form");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-600 selection:text-white flex flex-col relative">
      <ConsultingNavbar onBookClick={scrollToBooking} />

      <main className="flex-grow">
        <ConsultingHero onSuccess={() => {}} />
        <ConsultingTracks onSelectTrack={scrollToBooking} />
        <ConsultingHowItWorks onBookClick={scrollToBooking} />
        <ConsultingMentor onBookClick={scrollToBooking} />
        <ConsultingFAQ />
      </main>

      <ConsultingFooter />

      {/* Floating Sticky Mobile/Desktop CTA Bar */}
      {showStickyBar && (
        <div className="fixed bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 z-40 max-w-md mx-auto animate-in slide-in-from-bottom duration-300">
          <div className="p-2 rounded-xl sm:rounded-2xl bg-slate-900/95 text-white border border-slate-700/80 backdrop-blur-xl shadow-2xl flex items-center justify-between gap-3">
            <div className="pl-2 min-w-0 text-left">
              <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 truncate">
                1-on-1 AI Advisory
              </div>
              <div className="text-xs font-black text-amber-300 truncate">
                ₹2,500 / 1 Hour Deep Dive
              </div>
            </div>

            <button
              onClick={scrollToBooking}
              className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-extrabold text-[11px] sm:text-xs uppercase tracking-wider shadow-md flex items-center gap-1.5 transition-all whitespace-nowrap flex-shrink-0"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Slot</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultingPage;
