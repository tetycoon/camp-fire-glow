import React, { useEffect } from "react";
import RegistrationEmbed from "../components/RegistrationEmbed";

const WebinarAccess = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4">
            <div className="bg-white rounded-3xl p-10 max-w-4xl w-full shadow-xl border border-blue-100 mb-8">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black text-slate-900 mb-4">You're almost there!</h1>
                    <p className="text-lg text-slate-600 font-medium">Please complete the final step below to access the webinar.</p>
                </div>
                
                {/* Embed the FunnelsDone Registration Form */}
                <div className="w-full">
                    <RegistrationEmbed />
                </div>
            </div>
            
            <p className="mt-4 text-sm text-slate-400 font-medium">© 2026 AI Tycoon. All Rights Reserved.</p>
        </div>
    );
};

export default WebinarAccess;
