import React, { useEffect } from "react";
import { CheckCircle } from "lucide-react";

const ThankYou = () => {
    useEffect(() => {
        // Track Purchase event using global fbq
        if (typeof window.fbq === 'function') {
            window.fbq('track', 'Purchase', { currency: "INR", value: 99.00 });
        }

        // Auto-redirect to WhatsApp after 5 seconds
        const params = new URLSearchParams(window.location.search);
        const orderId = params.get("orderId");
        if (orderId) {
            const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbxsNlBVyY2LVjPuIBXRs2g1WXZ1r_WzM1b4zOChLVAD-iv2J8f3DXOhF4od7JOliOEa3A/exec";
            const waRedirect = GOOGLE_SHEET_URL + "?action=whatsapp&orderId=" + orderId;
            setTimeout(() => {
                window.location.href = waRedirect;
            }, 5000);
        }

    }, []);

    const handleManualRedirect = () => {
        const params = new URLSearchParams(window.location.search);
        const orderId = params.get("orderId");
        if (orderId) {
            const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbxsNlBVyY2LVjPuIBXRs2g1WXZ1r_WzM1b4zOChLVAD-iv2J8f3DXOhF4od7JOliOEa3A/exec";
            window.location.href = GOOGLE_SHEET_URL + "?action=whatsapp&orderId=" + orderId;
        } else {
            alert("Please check your email for the WhatsApp link or wait for the automatic redirect.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-10 max-w-lg w-full text-center shadow-xl border border-blue-100">
                <CheckCircle className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
                <h1 className="text-4xl font-black text-slate-900 mb-4">Payment Successful!</h1>
                <p className="text-lg text-slate-600 mb-8 font-medium">Thank you for registering for the AI Masterclass. You will be redirected to our WhatsApp community in just a moment...</p>
                <div className="flex justify-center">
                    <button 
                        onClick={handleManualRedirect}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-8 rounded-full shadow-lg transition-transform hover:-translate-y-1"
                    >
                        Click Here To Join WhatsApp Community 🚀
                    </button>
                </div>
            </div>
            <p className="mt-8 text-sm text-slate-400 font-medium">Redirecting in 5 seconds...</p>
        </div>
    );
};

export default ThankYou;
