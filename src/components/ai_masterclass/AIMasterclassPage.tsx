import React from "react";
import NeuralNetworkBackground from "../bootcamp/NeuralNetworkBackground";
import AIMasterclassNavbar from "./AIMasterclassNavbar";
import AIMasterclassHeroSection from "./AIMasterclassHeroSection";
import AIMasterclassWhySection from "./AIMasterclassWhySection";
import AIMasterclassModulesSection from "./AIMasterclassModulesSection";
import AIMasterclassTrainerSection from "./AIMasterclassTrainerSection";
import AIMasterclassPricingSection from "./AIMasterclassPricingSection";
import AIMasterclassFooter from "./AIMasterclassFooter";
import AIMasterclassRegisterModal from "./AIMasterclassRegisterModal";
import { AIMasterclassRegisterModalProvider } from "./AIMasterclassRegisterModalContext";

const AIMasterclassPage: React.FC = () => {
    return (
        <AIMasterclassRegisterModalProvider>
            <div className="min-h-screen bg-background text-foreground overflow-x-hidden relative">
                <NeuralNetworkBackground />
                <AIMasterclassNavbar />
                <AIMasterclassHeroSection />
                <AIMasterclassWhySection />
                <AIMasterclassModulesSection />
                <AIMasterclassTrainerSection />
                <AIMasterclassPricingSection />
                <AIMasterclassFooter />
                <AIMasterclassRegisterModal />
            </div>
        </AIMasterclassRegisterModalProvider>
    );
};

export default AIMasterclassPage;
