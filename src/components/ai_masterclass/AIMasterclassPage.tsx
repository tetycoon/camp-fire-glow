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
import AIMasterclassLeadGate from "./AIMasterclassLeadGate";

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

const AIMasterclassPage: React.FC<AIMasterclassPageProps> = ({ showLeadGate = true }) => {
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
                {showLeadGate && <AIMasterclassLeadGate />}
            </div>
        </AIMasterclassRegisterModalProvider>
    );
};

export default AIMasterclassPage;
