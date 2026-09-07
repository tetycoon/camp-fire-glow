import React, { useEffect, useState } from "react";
import { CheckCircle, MessageSquare, ArrowRight, ShieldCheck, Tag } from "lucide-react";
import { useLocation } from "react-router-dom";

const ThankYou = () => {
    const location = useLocation();
    const [countdown, setCountdown] = useState(5);

    // Extract user details from location.state or URL params
    const searchParams = new URLSearchParams(window.location.search);
    const stateData = location.state || {};

    const name = stateData.name || searchParams.get("name") || "Learner";
    const email = stateData.email || searchParams.get("email") || "";
    const phone = stateData.phone || searchParams.get("phone") || "";
    const paymentId = stateData.paymentId || searchParams.get("paymentId") || searchParams.get("pay_id") || "PAID";
    const amount = stateData.amount || searchParams.get("amount") || "2499";
    const course = stateData.course || searchParams.get("course") || "TECH TYCOON Academy";
    const coupon = stateData.coupon || searchParams.get("coupon") || "";
    const orderId = stateData.orderId || searchParams.get("orderId") || "";

    // Build the prefilled WhatsApp message with user details & coupon code
    const prefilledMessage = [
        `Hello Tech Tycoon Team, I have successfully registered for ${course}!`,
        ``,
        `📋 *My Registration Details:*`,
        `• *Name:* ${name}`,
        email ? `• *Email:* ${email}` : ``,
        phone ? `• *Phone:* ${phone}` : ``,
        `• *Amount Paid:* ₹${amount}`,
        coupon ? `• *Coupon Applied:* ${coupon}` : ``,
        paymentId ? `• *Payment ID:* ${paymentId}` : ``,
        ``,
        `Please send me my exclusive course access details for the September 10th Launch! 🚀`
    ].filter(Boolean).join("\n");

    const waChatLink = `https://wa.me/917010340494?text=${encodeURIComponent(prefilledMessage)}`;

    useEffect(() => {
        // Track Purchase event using global fbq
        if (typeof window.fbq === 'function') {
            window.fbq('track', 'Purchase', { currency: "INR", value: parseFloat(amount) || 2499 });
        }

        // Countdown timer for automatic redirect
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    window.location.href = waChatLink;
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [waChatLink, amount]);

    const handleSendWhatsAppMessage = () => {
        // Ping Apps Script webhook if orderId exists
        if (orderId) {
            const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbwl1WKBrQxxMRbz7aj6GBUNbmR4ePHshhrBwcNjhxorIayQpMTmHaHHT_MvTroQ-ZrFbA/exec";
            fetch(`${GOOGLE_SHEET_URL}?action=whatsapp&orderId=${orderId}`).catch(() => {});
        }
        window.location.href = waChatLink;
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-4 selection:bg-sky-500 selection:text-white">
            <div className="bg-white border border-sky-200 rounded-3xl p-8 sm:p-10 max-w-lg w-full text-center shadow-2xl space-y-6 relative overflow-hidden">
                
                {/* Light Blue & Emerald Glow Effects */}
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-sky-200/50 rounded-full blur-3xl pointer-events-none" />

                <CheckCircle className="w-16 h-16 sm:w-20 sm:h-20 text-emerald-500 mx-auto animate-bounce" />
                
                <div className="space-y-2">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Payment Successful!</h1>
                    <p className="text-sm sm:text-base text-slate-600">
                        Thank you for registering for <strong className="text-sky-700">{course}</strong>.
                    </p>
                </div>

                {/* Registration Details Card */}
                <div className="bg-sky-50/70 border border-sky-200 p-4 sm:p-5 rounded-2xl text-left text-xs sm:text-sm space-y-2">
                    <div className="text-xs uppercase tracking-wider text-sky-700 font-bold mb-1 flex items-center justify-between">
                        <span>Pre-Registration Details:</span>
                        {coupon && (
                            <span className="bg-sky-100 text-sky-800 px-2 py-0.5 rounded border border-sky-200 flex items-center gap-1 text-[10px] font-bold">
                                <Tag className="w-3 h-3" /> Coupon: {coupon}
                            </span>
                        )}
                    </div>
                    <div className="flex justify-between py-1 border-b border-sky-200/60">
                        <span className="text-slate-500">Name:</span>
                        <span className="font-semibold text-slate-900">{name}</span>
                    </div>
                    {email && (
                        <div className="flex justify-between py-1 border-b border-sky-200/60">
                            <span className="text-slate-500">Email:</span>
                            <span className="font-semibold text-slate-900">{email}</span>
                        </div>
                    )}
                    {phone && (
                        <div className="flex justify-between py-1 border-b border-sky-200/60">
                            <span className="text-slate-500">Phone:</span>
                            <span className="font-semibold text-slate-900">{phone}</span>
                        </div>
                    )}
                    <div className="flex justify-between py-1 border-b border-sky-200/60">
                        <span className="text-slate-500">Amount Paid:</span>
                        <span className="font-bold text-emerald-600">₹{amount}</span>
                    </div>
                    <div className="flex justify-between py-1">
                        <span className="text-slate-500">Payment ID:</span>
                        <span className="font-mono text-sky-700 text-xs">{paymentId}</span>
                    </div>
                </div>

                <div className="bg-emerald-50 text-emerald-800 p-4 rounded-2xl border border-emerald-200 text-xs sm:text-sm leading-relaxed font-medium">
                    <p>
                        Your pre-registration confirmation email is on its way! Click below to send your details directly to our WhatsApp team. 🎉
                    </p>
                </div>

                <div className="space-y-3 pt-2">
                    <button 
                        onClick={handleSendWhatsAppMessage}
                        className="w-full bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold py-4 px-6 rounded-2xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-3 transform hover:-translate-y-0.5 border border-emerald-400/30 text-sm sm:text-base"
                    >
                        <MessageSquare className="w-5 h-5" />
                        <span>Click Here To Send WhatsApp Message 🚀</span>
                    </button>
                    
                    <p className="text-xs text-slate-500 flex items-center justify-center gap-1.5 font-medium">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Auto-redirecting to WhatsApp in <strong className="text-sky-700">{countdown}</strong> seconds...</span>
                    </p>
                </div>

            </div>
        </div>
    );
};

export default ThankYou;
