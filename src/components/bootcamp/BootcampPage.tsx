import React from "react";
import Navbar from "./Navbar";
import HeroSection from "./HeroSection";
import NeuralNetworkBackground from "./NeuralNetworkBackground";
import WhySection from "./WhySection";
import ProgramStructure from "./ProgramStructure";
import WhoCanJoin from "./WhoCanJoin";
import ModulesSection from "./ModulesSection";
import AchievementsSection from "./AchievementsSection";
import GuestSection from "./GuestSection";
import TrainerSection from "./TrainerSection";
import PricingSection from "./PricingSection";
import RegisterSection from "./RegisterSection";
import Footer from "./Footer";

const BootcampPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden relative">
      <NeuralNetworkBackground />
      <Navbar />
      <HeroSection />
      <WhySection />
      <ProgramStructure />
      <WhoCanJoin />
      <ModulesSection />
      <AchievementsSection />
      <GuestSection />
      <TrainerSection />
      <PricingSection />
      <RegisterSection />
      <Footer />
    </div>
  );
};

export default BootcampPage;
