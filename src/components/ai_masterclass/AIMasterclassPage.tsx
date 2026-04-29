import React, { useEffect } from "react";
import AIMasterclassNavbar from "./AIMasterclassNavbar";
import AIMasterclassHeroSection from "./AIMasterclassHeroSection";
import AIMasterclassWhySection from "./AIMasterclassWhySection";
import AIMasterclassModulesSection from "./AIMasterclassModulesSection";
import AIMasterclassTrainerSection from "./AIMasterclassTrainerSection";
import AIMasterclassPricingSection from "./AIMasterclassPricingSection";
import AIMasterclassFooter from "./AIMasterclassFooter";
import AIMasterclassRegisterModal from "./AIMasterclassRegisterModal";
import { AIMasterclassRegisterModalProvider } from "./AIMasterclassRegisterModalContext";
import TestimonialCarousel from "./TestimonialCarousel";
import AIMasterclassWhatsApp from "./AIMasterclassWhatsApp";

const AIMasterclassPage: React.FC = () => {
    useEffect(() => {
        const script = document.createElement("script");
        script.id = "meta-pixel-aimasterclass";
        script.innerHTML = `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '945954808248207');
            fbq('track', 'PageView');
            fbq('track', 'ViewContent');
        `;
        document.head.appendChild(script);
        
        return () => {
            const el = document.getElementById("meta-pixel-aimasterclass");
            if (el) el.remove();
        };
    }, []);

    return (
        <AIMasterclassRegisterModalProvider>
            <noscript>
                <img height="1" width="1" style={{display: "none"}} src="https://www.facebook.com/tr?id=945954808248207&ev=PageView&noscript=1" alt="" />
            </noscript>
            <div className="min-h-screen bg-white text-slate-900 font-sans overflow-x-hidden relative">
                <AIMasterclassNavbar />
                <AIMasterclassHeroSection />
                <AIMasterclassWhySection />
                <AIMasterclassModulesSection />
                <AIMasterclassTrainerSection />
                <TestimonialCarousel />
                <AIMasterclassPricingSection />
                <AIMasterclassFooter />
                <AIMasterclassRegisterModal />
                <AIMasterclassWhatsApp />
            </div>
        </AIMasterclassRegisterModalProvider>
    );
};

export default AIMasterclassPage;
