import React from "react";
import NeuralNetworkBackground from "../bootcamp/NeuralNetworkBackground";
import AIMasterclass2Navbar from "./AIMasterclass2Navbar";
import AIMasterclass2HeroSection from "./AIMasterclass2HeroSection";
import AIMasterclass2WhySection from "./AIMasterclass2WhySection";
import AIMasterclass2ModulesSection from "./AIMasterclass2ModulesSection";
import AIMasterclass2TrainerSection from "./AIMasterclass2TrainerSection";
import AIMasterclass2PricingSection from "./AIMasterclass2PricingSection";
import AIMasterclass2Footer from "./AIMasterclass2Footer";
import AIMasterclass2RegisterModal from "./AIMasterclass2RegisterModal";
import { AIMasterclass2RegisterModalProvider } from "./AIMasterclass2RegisterModalContext";

const AIMasterclass2Page: React.FC = () => {
    return (
        <AIMasterclass2RegisterModalProvider>
            <div className="min-h-screen bg-background text-foreground overflow-x-hidden relative">
                <NeuralNetworkBackground />
                <AIMasterclass2Navbar />
                <AIMasterclass2HeroSection />
                <AIMasterclass2WhySection />
                <AIMasterclass2ModulesSection />
                <AIMasterclass2TrainerSection />
                <AIMasterclass2PricingSection />
                <AIMasterclass2Footer />
                <AIMasterclass2RegisterModal />
            </div>
        </AIMasterclass2RegisterModalProvider>
    );
};

export default AIMasterclass2Page;
