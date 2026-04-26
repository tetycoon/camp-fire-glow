import React from "react";
import UpscaleNavbar from "./UpscaleNavbar";
import UpscaleHero from "./UpscaleHero";
import UpscaleBMC from "./UpscaleBMC";
import UpscaleWhy from "./UpscaleWhy";
import UpscaleAudience from "./UpscaleAudience";
import UpscaleCurriculum from "./UpscaleCurriculum";
import UpscaleVenue from "./UpscaleVenue";
import UpscaleTrainerSection from "./UpscaleTrainerSection";
import UpscaleTestimonials from "./UpscaleTestimonials";
import UpscalePricing from "./UpscalePricing";
import UpscaleFAQ from "./UpscaleFAQ";
import UpscaleFooter from "./UpscaleFooter";
import UpscaleRegisterModal from "./UpscaleRegisterModal";
import UpscaleStickyBar from "./UpscaleStickyBar";
import UpscaleWhatsApp from "./UpscaleWhatsApp";
import { UpscaleRegisterModalProvider } from "./UpscaleRegisterModalContext";

const UpscalePage: React.FC = () => {
    return (
        <UpscaleRegisterModalProvider>
            <div className="min-h-screen bg-white font-sans selection:bg-blue-100 selection:text-blue-900">
                <UpscaleNavbar />
                <UpscaleHero />
                <UpscaleBMC />
                <UpscaleAudience />
                <UpscaleWhy />
                <UpscaleCurriculum />
                <UpscaleVenue />
                <UpscaleTrainerSection />
                <UpscaleTestimonials />
                <UpscalePricing />
                <UpscaleFAQ />
                <UpscaleFooter />
                <UpscaleRegisterModal />
                <UpscaleStickyBar />
                <UpscaleWhatsApp />
            </div>
        </UpscaleRegisterModalProvider>
    );
};

export default UpscalePage;
