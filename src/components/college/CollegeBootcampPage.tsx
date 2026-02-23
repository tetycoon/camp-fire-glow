import React from "react";
import CollegeNavbar from "./CollegeNavbar";
import CollegeHeroSection from "./CollegeHeroSection";
import CollegeVideoSection from "./CollegeVideoSection";
import NeuralNetworkBackground from "../bootcamp/NeuralNetworkBackground";
import CollegeWhySection from "./CollegeWhySection";
import CollegeProgramStructure from "./CollegeProgramStructure";
import CollegeWhoCanJoin from "./CollegeWhoCanJoin";
import CollegeModulesSection from "./CollegeModulesSection";
import CollegeAchievementsSection from "./CollegeAchievementsSection";
import CollegeGuestSection from "./CollegeGuestSection";
import CollegeTrainerSection from "./CollegeTrainerSection";
import CollegeGallerySection from "./CollegeGallerySection";
import CollegePricingSection from "./CollegePricingSection";
import CollegeFooter from "./CollegeFooter";
import CollegeRegisterModal from "./CollegeRegisterModal";
import { CollegeRegisterModalProvider } from "./CollegeRegisterModalContext";

const CollegeBootcampPage: React.FC = () => {
    return (
        <CollegeRegisterModalProvider>
            <div className="min-h-screen bg-midnight text-foreground overflow-x-hidden relative">
                <NeuralNetworkBackground />
                <CollegeNavbar />
                <CollegeHeroSection />
                <CollegeVideoSection />
                <CollegeWhySection />
                <CollegeProgramStructure />
                <CollegeWhoCanJoin />
                <CollegeModulesSection />
                <CollegeAchievementsSection />
                <CollegeGuestSection />
                <CollegeTrainerSection />
                <CollegeGallerySection />
                <CollegePricingSection />
                <CollegeFooter />
                <CollegeRegisterModal />
            </div>
        </CollegeRegisterModalProvider>
    );
};

export default CollegeBootcampPage;
