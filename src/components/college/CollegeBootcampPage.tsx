import React from "react";
import CollegeNavbar from "./CollegeNavbar";
import CollegeHeroSection from "./CollegeHeroSection";
import VideoSection from "../bootcamp/VideoSection";
import NeuralNetworkBackground from "../bootcamp/NeuralNetworkBackground";
import CollegeWhySection from "./CollegeWhySection";
import CollegeProgramStructure from "./CollegeProgramStructure";
import CollegeWhoCanJoin from "./CollegeWhoCanJoin";
import CollegeModulesSection from "./CollegeModulesSection";
import CollegeAchievementsSection from "./CollegeAchievementsSection";
import CollegeGuestSection from "./CollegeGuestSection";
import CollegeTrainerSection from "./CollegeTrainerSection";
import GallerySection from "../bootcamp/GallerySection";
import CollegePricingSection from "./CollegePricingSection";
import CollegeFooter from "./CollegeFooter";
import CollegeRegisterModal from "./CollegeRegisterModal";
import { CollegeRegisterModalProvider } from "./CollegeRegisterModalContext";

const CollegeBootcampPage: React.FC = () => {
    return (
        <CollegeRegisterModalProvider>
            <div className="min-h-screen bg-background text-foreground overflow-x-hidden relative">
                <NeuralNetworkBackground />
                <CollegeNavbar />
                <CollegeHeroSection />
                <VideoSection />
                <CollegeWhySection />
                <CollegeProgramStructure />
                <CollegeWhoCanJoin />
                <CollegeModulesSection />
                <CollegeAchievementsSection />
                <CollegeGuestSection />
                <CollegeTrainerSection />
                <GallerySection />
                <CollegePricingSection />
                <CollegeFooter />
                <CollegeRegisterModal />
            </div>
        </CollegeRegisterModalProvider>
    );
};

export default CollegeBootcampPage;
