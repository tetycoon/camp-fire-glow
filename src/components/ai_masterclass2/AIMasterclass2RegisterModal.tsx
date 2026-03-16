import React, { useState, useEffect } from "react";
import { CheckCircle2, Loader2, ShieldCheck, X } from "lucide-react";
import { useAIMasterclass2RegisterModal } from "./AIMasterclass2RegisterModalContext";

const RAZORPAY_KEY_ID = "rzp_live_gfoS1OjC8tvWjP";
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbxsNlBVyY2LVjPuIBXRs2g1WXZ1r_WzM1b4zOChLVAD-iv2J8f3DXOhF4od7JOliOEa3A/exec";

interface RazorpayOptions {
    key: string;
    order_id?: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    prefill: { name: string; email: string; contact: string };
    notes: { batch: string; profession?: string };
    theme: { color: string };
    handler: (response: { razorpay_payment_id: string }) => void;
    modal: { ondismiss: () => void };
}

interface RazorpayInstance {
    open: () => void;
}

function loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
        if (document.getElementById("razorpay-script")) {
            resolve(true);
            return;
        }
        const script = document.createElement("script");
        script.id = "razorpay-script";
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}

const AIMasterclass2RegisterModal: React.FC = () => {
    const { isOpen, closeRegisterModal } = useAIMasterclass2RegisterModal();
    const [form, setForm] = useState({ name: "", email: "", phone: "", profession: "", language: "", coupon: "WELCOME33" });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [couponChecking, setCouponChecking] = useState(false);
    const [paymentId, setPaymentId] = useState<string>("");
    const [visible, setVisible] = useState(false);
    const [discountApplied, setDiscountApplied] = useState(false);

    useEffect(() => {
        if (isOpen) {
            requestAnimationFrame(() => setVisible(true));
            document.body.style.overflow = "hidden";
        } else {
            setVisible(false);
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    const handleClose = () => {
        setVisible(false);
        setTimeout(() => {
            closeRegisterModal();
            if (!submitted) {
                setForm({ name: "", email: "", phone: "", profession: "", language: "", coupon: "WELCOME33" });
                setDiscountApplied(false);
            }
        }, 300);
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) handleClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const loaded = await loadRazorpayScript();
        if (!loaded) {
            alert("Failed to load payment gateway.");
            setLoading(false);
            return;
        }

        const pageUrl = window.location.href;
        const finalAmount = 9900; // Fixed ₹99 for Masterclass as per index.html logic

        try {
            const response = await fetch(GOOGLE_SHEET_URL, {
                method: "POST",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify({
                    userType: form.profession || "Professional",
                    pageUrl,
                    name: form.name,
                    email: form.email,
                    phone: form.phone,
                    language: form.language,
                    batch: "Masterclass 2026",
                    amount: 99
                }),
            });

            const result = await response.json();

            if (!result.success || !result.orderId) {
                alert("Failed to create order.");
                setLoading(false);
                return;
            }

            const options: RazorpayOptions = {
                key: RAZORPAY_KEY_ID,
                order_id: result.orderId,
                amount: finalAmount,
                currency: "INR",
                name: "Tech Tycoon",
                description: "AI Marketing Masterclass — June 2026",
                prefill: {
                    name: form.name,
                    email: form.email,
                    contact: form.phone,
                },
                notes: {
                    batch: `Masterclass 2: ${form.profession} (${form.language})`,
                },
                theme: {
                    color: "#10b981",
                },
                handler: async (response) => {
                    setPaymentId(response.razorpay_payment_id || "TEST_ID");
                    setSubmitted(true);
                    setLoading(false);

                    // Notify backend of payment success
                    try {
                        await fetch(GOOGLE_SHEET_URL, {
                            method: "POST",
                            headers: { "Content-Type": "text/plain;charset=utf-8" },
                            body: JSON.stringify({
                                paymentSuccess: true,
                                razorpay_order_id: result.orderId,
                                razorpay_payment_id: response.razorpay_payment_id,
                                email: form.email,
                                name: form.name,
                                language: form.language
                            })
                        });
                    } catch (e) {
                        console.error("Failed to notify payment success", e);
                    }

                    // Handle private coupons if used
                    const privateCoupons = ["ATY7K2BX9QM4", "CP3ZN8DW6RL5", "EK4YT1FJ8HP3", "GN2VA6HM5XB9", "IQ7CW2JR1UD4", "KP8MZ3LT5YN1", "MX2QA9NV6BR4", "OW4EC7PF1GS6", "QH9DK5RJ3LV2", "ST7NB8UW4CM6"];
                    if (privateCoupons.includes(form.coupon.trim())) {
                        fetch(GOOGLE_SHEET_URL, {
                            method: "POST",
                            headers: { "Content-Type": "text/plain;charset=utf-8" },
                            body: JSON.stringify({ action: "markCouponUsed", couponCode: form.coupon.trim(), email: form.email })
                        }).catch(() => { });
                    }
                },
                modal: { ondismiss: () => setLoading(false) },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error) {
            alert("Server error.");
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
            style={{ backdropFilter: "blur(8px)", background: "hsl(222 47% 5% / 0.8)" }}
            onClick={handleBackdropClick}
        >
            <div
                className={`relative w-full max-w-lg rounded-3xl p-8 transition-all duration-300 ${visible ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}`}
                style={{
                    background: "linear-gradient(145deg, hsl(222 40% 10%), hsl(222 40% 7%))",
                    border: "1px solid hsl(142 70% 50% / 0.25)",
                    boxShadow: "0 0 60px hsl(142 70% 50% / 0.15)",
                }}
            >
                <button onClick={handleClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"><X /></button>

                {submitted ? (
                    <div className="text-center py-6">
                        <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
                        <h3 className="font-display text-2xl font-bold mb-3">Enrolled Successfully!</h3>
                        <p className="text-muted-foreground mb-4">Welcome to the AI Masterclass 2026. See you soon!</p>
                        <div className="badge-module text-xs px-4 py-2 rounded-full mb-6 inline-block">ID: {paymentId}</div>
                        <button onClick={handleClose} className="w-full border border-emerald-500/30 text-emerald-400 py-3 rounded-full">CLOSE</button>
                    </div>
                ) : (
                    <>
                        <div className="text-center mb-6">
                            <h2 className="font-display text-2xl font-bold mb-1 italic">Register <span className="text-gradient-green">Now</span></h2>
                            <p className="text-sm text-muted-foreground">Join the AI revolution for just ₹99</p>
                            <p className="text-[10px] text-emerald-400/80 mt-1 font-medium italic">Basic English And Tamil</p>
                        </div>

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <input
                                required
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                placeholder="Full Name"
                                autoComplete="name"
                                className="bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:border-emerald-500/50 outline-none transition-colors"
                            />
                            <input
                                required
                                type="email"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                placeholder="Email Address"
                                autoComplete="email"
                                className="bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:border-emerald-500/50 outline-none transition-colors"
                            />
                            <input
                                required
                                type="tel"
                                value={form.phone}
                                onChange={e => setForm({ ...form, phone: e.target.value })}
                                placeholder="WhatsApp Number (e.g. 9876543210)"
                                autoComplete="tel"
                                pattern="[0-9]{10}"
                                title="Please enter a valid 10-digit phone number"
                                className="bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:border-emerald-500/50 outline-none transition-colors"
                            />
                            <select
                                required
                                value={form.language}
                                onChange={e => setForm({ ...form, language: e.target.value })}
                                className="bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:border-emerald-500/50 outline-none appearance-none cursor-pointer"
                            >
                                <option value="">Preferred Language</option>
                                <option value="English">English</option>
                                <option value="Tamil">Tamil</option>
                            </select>

                            <select
                                required
                                value={form.profession}
                                onChange={e => setForm({ ...form, profession: e.target.value })}
                                className="sm:col-span-2 bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:border-emerald-500/50 outline-none appearance-none cursor-pointer"
                            >
                                <option value="">I am a...</option>
                                <option>Trainer / Coach</option>
                                <option>Entrepreneur</option>
                                <option>Business Owner</option>
                                <option>Freelancer</option>
                                <option>Educator</option>
                                <option>Professionals</option>
                                <option>Student</option>
                                <option>Other</option>
                            </select>

                            <button
                                type="submit"
                                disabled={loading}
                                className="col-span-1 sm:col-span-2 bg-emerald-500 hover:bg-emerald-600 text-white font-display text-sm font-bold py-4 rounded-full tracking-widest mt-2 flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : "PROCEED TO PAYMENT — ₹99"}
                            </button>

                            <div className="col-span-1 sm:col-span-2 flex items-center justify-center gap-2 text-[10px] text-muted-foreground opacity-60">
                                <ShieldCheck className="w-3 h-3" /> Secured by Razorpay
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default AIMasterclass2RegisterModal;
