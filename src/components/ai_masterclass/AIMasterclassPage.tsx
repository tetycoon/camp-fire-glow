import React, { useEffect } from "react";
import { useSearchParams, useParams, useLocation } from "react-router-dom";
import AIMasterclassNavbar from "./AIMasterclassNavbar";
import AIMasterclassHeroSection from "./AIMasterclassHeroSection";
import AIMasterclassWhySection from "./AIMasterclassWhySection";
import AIMasterclassModulesSection from "./AIMasterclassModulesSection";
import AIMasterclassTrainerSection from "./AIMasterclassTrainerSection";
import TestimonialCarousel from "./TestimonialCarousel";
import AIMasterclassPricingSection from "./AIMasterclassPricingSection";
import AIMasterclassFAQSection from "./AIMasterclassFAQSection";
import AIMasterclassFooter from "./AIMasterclassFooter";
import AIMasterclassRegisterModal from "./AIMasterclassRegisterModal";
import { AIMasterclassRegisterModalProvider, useAIMasterclassRegisterModal } from "./AIMasterclassRegisterModalContext";
import AIMasterclassWhatsApp from "./AIMasterclassWhatsApp";
import SocialProofToast from "../common/SocialProofToast";
import AIMasterclassStickyBar from "./AIMasterclassStickyBar";

const AIMasterclassUrlTrigger: React.FC = () => {
    const { openRegisterModal } = useAIMasterclassRegisterModal();
    const [searchParams] = useSearchParams();
    const { slug } = useParams();
    const location = useLocation();

    useEffect(() => {
        // 1. Query parameter check (?ai=1000055, ?ref=..., ?affiliate=..., ?lead=...)
        let affiliateId = searchParams.get("ai") || searchParams.get("ref") || searchParams.get("affiliate") || searchParams.get("lead");

        // 2. Slug check (/ai=1000055 or /1000055)
        if (!affiliateId && slug) {
            affiliateId = slug.startsWith("ai=") ? slug.replace(/^ai=/, "") : slug;
        }

        // 3. Fallback check for raw pathname containing /ai= or /ai_
        if (!affiliateId) {
            const match = location.pathname.match(/\/ai[=_]([a-zA-Z0-9_-]+)/i);
            if (match && match[1] && match[1].toLowerCase() !== "masterclass" && match[1].toLowerCase() !== "masterclass2") {
                affiliateId = match[1];
            }
        }

        const shouldOpen = Boolean(affiliateId) ||
            searchParams.get("popup") === "true" ||
            searchParams.get("popup") === "open" ||
            searchParams.get("register") === "true" ||
            searchParams.get("open") === "true" ||
            searchParams.get("form") === "true" ||
            window.location.hash === "#register";

        if (affiliateId) {
            sessionStorage.setItem("ai_affiliate_id", affiliateId);
            localStorage.setItem("ai_affiliate_id", affiliateId);
        }

        if (shouldOpen) {
            const timer = setTimeout(() => {
                openRegisterModal();
            }, 350);
            return () => clearTimeout(timer);
        }
    }, [searchParams, slug, location.pathname, openRegisterModal]);

    return null;
};

interface AIMasterclassPageProps {
    showLeadGate?: boolean;
}

const AIMasterclassPage: React.FC<AIMasterclassPageProps> = ({ showLeadGate = false }) => {
    useEffect(() => {
        document.title = "AI Secrets Revealed & Business Automation Masterclass | TECH TYCOON DIGITAL SOLUTION LLP";
        if (typeof (window as any).fbq === 'function') {
            (window as any).fbq('track', 'ViewContent', {
                content_name: 'AI Secrets Revealed'
            });
        }
    }, []);

    return (
        <AIMasterclassRegisterModalProvider>
            <AIMasterclassUrlTrigger />
            <div className="min-h-screen bg-white text-slate-900 font-sans overflow-x-hidden relative pb-16">
                {/* Admissions Paused Notification Banner */}
                <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white py-2.5 px-4 text-center text-xs sm:text-sm font-bold flex flex-wrap items-center justify-center gap-2 shadow-md relative z-[70]">
                    <span className="flex items-center gap-1.5">
                        <span className="inline-block w-2 h-2 rounded-full bg-amber-300 animate-ping" />
                        <span>⚠️ Notice: AI Masterclass Live Sessions Are Currently Paused • Admissions On Hold</span>
                    </span>
                    <a
                        href="https://chat.whatsapp.com/EpsuzpxGz6F98ml2GUBejC"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full text-xs font-bold transition-all inline-flex items-center gap-1 ml-2 border border-white/30"
                    >
                        <span>Join WhatsApp Community for Future Batch Updates →</span>
                    </a>
                </div>
                <AIMasterclassNavbar />
                <AIMasterclassHeroSection />
                <AIMasterclassWhySection />
                <AIMasterclassModulesSection />
                <AIMasterclassTrainerSection />
                <TestimonialCarousel />
                <AIMasterclassPricingSection />
                <AIMasterclassFAQSection />
                <AIMasterclassFooter />
                <AIMasterclassRegisterModal />
                <AIMasterclassWhatsApp />
                <SocialProofToast />
                <AIMasterclassStickyBar />
                            </div>
        </AIMasterclassRegisterModalProvider>
    );
};

export default AIMasterclassPage;
