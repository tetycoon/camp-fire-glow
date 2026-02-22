import React from "react";
import Navbar from "./Navbar";
import HeroSection from "./HeroSection";
import VideoSection from "./VideoSection";
import NeuralNetworkBackground from "./NeuralNetworkBackground";
import WhySection from "./WhySection";
import ProgramStructure from "./ProgramStructure";
import WhoCanJoin from "./WhoCanJoin";
import ModulesSection from "./ModulesSection";
import AchievementsSection from "./AchievementsSection";
import GuestSection from "./GuestSection";
import TrainerSection from "./TrainerSection";
import GallerySection from "./GallerySection";
import PricingSection from "./PricingSection";
import Footer from "./Footer";
import RegisterModal from "./RegisterModal";
import { RegisterModalProvider } from "./RegisterModalContext";

const BootcampPage: React.FC = () => {
  return (
    <RegisterModalProvider>
      <div className="min-h-screen bg-background text-foreground overflow-x-hidden relative">
        <NeuralNetworkBackground />
        <Navbar />
        <HeroSection />
        <VideoSection />
        <WhySection />
        <ProgramStructure />
        <WhoCanJoin />
        <ModulesSection />
        <AchievementsSection />
        <GuestSection />
        <TrainerSection />
        <GallerySection />
        <PricingSection />
        <Footer />
        <RegisterModal />
      </div>
    </RegisterModalProvider>
  );
};

export default BootcampPage;
