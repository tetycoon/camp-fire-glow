import React from "react";
import { CheckCircle2, Zap, Clock, ShieldCheck } from "lucide-react";
import { useAIMasterclass2RegisterModal } from "./AIMasterclass2RegisterModalContext";

const features = [
    "Complete 3-hour AI Basic to intermediate Training",
    "Every Saturday Live Session",
    "Exclusive Tamil Session",
    "10+ AI Tools Mastery",
    "WhatsApp Private Community",
    "Inclusive of GST"
];

const AIMasterclass2PricingSection: React.FC = () => {
    const { openRegisterModal } = useAIMasterclass2RegisterModal();

    return (
        <section id="pricing" className="section-border py-32 px-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-background/50" />
            <div className="max-w-5xl mx-auto px-4 lg:px-8 relative z-10">
                <div className="text-left mb-16">
                    <div className="section-label mb-4 w-fit">💳 Investment</div>
                    <h2 className="font-display text-3xl sm:text-5xl font-bold text-foreground mb-4">
                        Launch <span className="text-gradient-green">Pricing</span>
                    </h2>
                </div>

                <div className="rounded-3xl p-8 sm:p-12 relative overflow-hidden bg-muted/20 border border-emerald-500/30 backdrop-blur-md shadow-[0_0_60px_hsl(142_70%_50%/0.05)]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 bg-emerald-500/10 border border-emerald-500/30 animate-pulse">
                                <span className="text-emerald-400 text-xs font-bold tracking-widest uppercase">Early Bird Offer — 90% OFF!</span>
                            </div>

                            <div className="flex items-baseline gap-4 mb-4">
                                <span className="font-display text-2xl text-muted-foreground/50 line-through">₹999</span>
                                <span className="font-display text-6xl font-black text-gradient-green">₹99</span>
                            </div>

                            <div className="flex items-center gap-3 mb-8">
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/12 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                                    <Zap className="w-3 h-3" /> SAVE ₹900
                                </span>
                            </div>

                            <div className="space-y-4 mb-10">
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <Clock className="w-5 h-5 text-emerald-400" />
                                    <span className="text-sm font-medium">Offer ends April 18, 2026</span>
                                </div>
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                                    <span className="text-sm font-medium">Secured by Razorpay</span>
                                </div>
                            </div>

                            <button
                                onClick={openRegisterModal}
                                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-display text-sm font-bold px-10 py-5 rounded-full tracking-widest shadow-[0_0_30px_hsl(142_70%_50%/0.4)] transition-all hover:scale-[1.02]"
                            >
                                SECURE YOUR SEAT 🚀
                            </button>
                        </div>

                        <div className="bg-background/40 p-8 rounded-2xl border border-white/5">
                            <h3 className="font-display text-lg font-bold mb-6 italic text-emerald-400">What's Included:</h3>
                            <ul className="space-y-4">
                                {features.map((f, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                        <span className="font-body text-sm text-muted-foreground font-medium">{f}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AIMasterclass2PricingSection;
