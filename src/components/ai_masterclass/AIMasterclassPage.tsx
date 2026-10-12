import React, { useEffect } from "react";
import AIMasterclassNavbar from "./AIMasterclassNavbar";
import AIMasterclassHeroSection from "./AIMasterclassHeroSection";
import AIMasterclassWhySection from "./AIMasterclassWhySection";
import AIMasterclassModulesSection from "./AIMasterclassModulesSection";
import AIMasterclassTrainerSection from "./AIMasterclassTrainerSection";
import AIMasterclassPricingSection from "./AIMasterclassPricingSection";
import AIMasterclassFAQSection from "./AIMasterclassFAQSection";
import AIMasterclassFooter from "./AIMasterclassFooter";
import AIMasterclassRegisterModal from "./AIMasterclassRegisterModal";
import { AIMasterclassRegisterModalProvider } from "./AIMasterclassRegisterModalContext";
import TestimonialCarousel from "./TestimonialCarousel";
import AIMasterclassWhatsApp from "./AIMasterclassWhatsApp";
import SocialProofToast from "../common/SocialProofToast";
import AIMasterclassStickyBar from "./AIMasterclassStickyBar";

const AIMasterclassPage: React.FC = () => {
    useEffect(() => {
        document.title = "AI Secrets Revealed & Business Automation Masterclass | Tech Tycoon";
        if (typeof (window as any).fbq === 'function') {
            (window as any).fbq('track', 'ViewContent', {
                content_name: 'AI Secrets Revealed'
            });
        }
    }, []);

    return (
        <AIMasterclassRegisterModalProvider>
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
            </div>
        </AIMasterclassRegisterModalProvider>
    );
};

export default AIMasterclassPage;
