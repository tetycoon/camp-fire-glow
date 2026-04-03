import React, { useState, useEffect } from "react";
import { CheckCircle2, Loader2, ShieldCheck, X } from "lucide-react";
import { useRegisterModal } from "./RegisterModalContext";
import { RazorpayOptions } from "@/types/razorpay";

const RAZORPAY_KEY_ID = "rzp_live_gfoS1OjC8tvWjP";
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbxsNlBVyY2LVjPuIBXRs2g1WXZ1r_WzM1b4zOChLVAD-iv2J8f3DXOhF4od7JOliOEa3A/exec";

const batches = [
    { value: "batch2", label: "May Batch — May 1–30, 2026" },
];


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

const RegisterModal: React.FC = () => {
    const { isOpen, closeRegisterModal } = useRegisterModal();
    const [form, setForm] = useState({ name: "", email: "", phone: "", batch: "batch2", coupon: "WELCOME33" });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [couponChecking, setCouponChecking] = useState(false);
    const [paymentId, setPaymentId] = useState<string>("");
    const [visible, setVisible] = useState(false);
    const [discountApplied, setDiscountApplied] = useState(true);  // WELCOME33 → ₹9,999
    const [friendCouponApplied, setFriendCouponApplied] = useState(false); // 12-digit → ₹7,999

    // Animate in/out
    useEffect(() => {
        if (isOpen) {
            // Small delay for mount animation
            requestAnimationFrame(() => setVisible(true));
            // Prevent body scroll
            document.body.style.overflow = "hidden";
        } else {
            setVisible(false);
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    const handleClose = () => {
        setVisible(false);
        setTimeout(() => {
            closeRegisterModal();
            // Reset form when closing (but keep submitted state if payment done)
            if (!submitted) {
                setForm({ name: "", email: "", phone: "", batch: "batch2", coupon: "WELCOME33" });
                setDiscountApplied(true);
                setFriendCouponApplied(false);
            }
        }, 300);
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const loaded = await loadRazorpayScript();
        if (!loaded) {
            alert("Failed to load payment gateway. Please check your internet connection.");
            setLoading(false);
            return;
        }

        const batchLabel = batches.find(b => b.value === form.batch)?.label || form.batch;

        // 🔥 SEND PAGE URL & CATEGORY
        const pageUrl = window.location.href;
        const path = window.location.pathname.toLowerCase();

        let category = "school students";
        if (path.includes("college") || pageUrl.toLowerCase().includes("/college")) {
            category = "college students";
        }
        console.log("Category detected:", category); // DEBUG

        // Capture lead and generate Razorpay Order ID
        let result: any;
        const finalAmount = friendCouponApplied ? 799900 : discountApplied ? 999900 : 1499900;

        try {
            const response = await fetch(GOOGLE_SHEET_URL, {
                method: "POST",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify({
                    userType: "school students",
                    pageUrl,   // 👈 category decided from this in GAS
                    name: form.name,
                    email: form.email,
                    phone: form.phone,
                    batch: form.batch,
                    amount: finalAmount / 100
                }),
            });

            result = await response.json();

            if (!result.success || !result.orderId) {
                alert("Failed to create payment order. Please try again.");
                setLoading(false);
                return;
            }

        } catch (error) {
            alert("Server error. Please try again later.");
            console.error("Error capturing lead/creating order:", error);
            setLoading(false);
            return;
        }

        const options: RazorpayOptions = {
            key: RAZORPAY_KEY_ID,
            order_id: result.orderId,
            amount: finalAmount,
            currency: "INR",
            name: "Tech Tycoon Digital Solutions",
            description: `AI Summer Bootcamp 2026 — ${batchLabel}`,
            prefill: {
                name: form.name,
                email: form.email,
                contact: form.phone,
            },
            notes: {
                batch: batchLabel,
            },
            theme: {
                color: "#6C63FF",
            },
            handler: async (response) => {
                setPaymentId(response.razorpay_payment_id || "TEST_PAYMENT_ID");
                setSubmitted(true);
                setLoading(false);
                // Removed single-use private coupon tracking
            },
            modal: {
                ondismiss: () => {
                    setLoading(false);
                },
            },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
    };

    if (!isOpen) return null;

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${visible ? "opacity-100" : "opacity-0"
                }`}
            style={{ backdropFilter: "blur(8px)", background: "hsl(222 47% 5% / 0.8)" }}
            onClick={handleBackdropClick}
        >
            <div
                className={`relative w-full max-w-md rounded-3xl p-4 sm:p-10 transition-all duration-300 ${visible ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
                    }`}
                style={{
                    background: "linear-gradient(145deg, hsl(222 40% 10%), hsl(222 40% 7%))",
                    border: "1px solid hsl(199 100% 55% / 0.25)",
                    boxShadow: "0 0 60px hsl(199 100% 55% / 0.15), 0 25px 50px hsl(222 47% 5% / 0.5)",
                }}
            >
                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                >
                    <X className="w-5 h-5" />
                </button>

                {submitted ? (
                    <div className="text-center py-6">
                        <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
                            <CheckCircle2 className="w-10 h-10 text-primary" />
                        </div>
                        <h3 className="font-display text-2xl font-bold text-foreground mb-3">Payment Successful!</h3>
                        <p className="font-body text-muted-foreground mb-4">
                            Welcome to the AI Summer Bootcamp 2026! You're officially enrolled.
                        </p>
                        {paymentId && (
                            <div className="inline-block badge-module font-body text-xs px-4 py-2 rounded-full">
                                Payment ID: {paymentId}
                            </div>
                        )}
                        <p className="font-body text-xs text-muted-foreground mt-4">
                            A confirmation will be sent to <span className="text-primary">{form.email}</span>
                        </p>
                        <button
                            onClick={handleClose}
                            className="mt-6 font-display text-xs font-bold px-6 py-2.5 rounded-full tracking-wider border border-primary/30 text-primary hover:bg-primary/10 transition-all"
                        >
                            CLOSE
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="text-center mb-4 sm:mb-6">
                            <p className="font-body text-[10px] sm:text-xs tracking-[0.3em] text-primary uppercase font-semibold mb-1 sm:mb-2">Enroll Now</p>
                            <h2 className="font-display text-xl sm:text-3xl font-bold text-foreground mb-0.5 sm:mb-1">
                                Register <span className="text-gradient">Now</span>
                            </h2>
                            <p className="font-body text-xs sm:text-sm text-muted-foreground">Secure your spot in the AI revolution</p>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="font-body text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">Full Name</label>
                                <input
                                    id="name"
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    placeholder="Enter your name"
                                    className="bg-muted/50 border border-border rounded-xl px-3 sm:px-4 py-2 sm:py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:bg-primary/5 transition-all"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="font-body text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    placeholder="Enter email address"
                                    className="bg-muted/50 border border-border rounded-xl px-3 sm:px-4 py-2 sm:py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:bg-primary/5 transition-all"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="font-body text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone</label>
                                <input
                                    id="phone"
                                    type="tel"
                                    required
                                    value={form.phone}
                                    onChange={e => setForm({ ...form, phone: e.target.value })}
                                    placeholder="Enter phone number"
                                    className="bg-muted/50 border border-border rounded-xl px-3 sm:px-4 py-2 sm:py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:bg-primary/5 transition-all"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="font-body text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select Batch</label>
                                <select
                                    id="batch"
                                    required
                                    value={form.batch}
                                    onChange={e => setForm({ ...form, batch: e.target.value })}
                                    className="bg-muted/50 border border-border rounded-xl px-3 sm:px-4 py-2 sm:py-3 font-body text-sm text-foreground focus:outline-none focus:border-primary/50 focus:bg-primary/5 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="" className="bg-card">Choose batch</option>
                                    {batches.map(b => (
                                        <option key={b.value} value={b.value} className="bg-card">{b.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="font-body text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">Coupon Code</label>
                                <div className="flex gap-2">
                                    <input
                                        id="coupon"
                                        type="text"
                                        value={form.coupon}
                                        onChange={e => setForm({ ...form, coupon: e.target.value.toUpperCase() })}
                                        placeholder="Optional"
                                        className="bg-muted/50 border border-border rounded-xl px-3 sm:px-4 py-2 sm:py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:bg-primary/5 transition-all flex-1"
                                    />
                                    <button
                                        type="button"
                                        disabled={couponChecking}
                                        onClick={async () => {
                                            const code = form.coupon.trim();
                                            if (code === "WELCOME33") {
                                                setDiscountApplied(true);
                                                setFriendCouponApplied(false);
                                                alert("Early Bird discount applied! Price: ₹9,999");
                                            } else if (code === "AMIABLE30") {
                                                setDiscountApplied(true);
                                                setFriendCouponApplied(true);
                                                alert("Special discount applied! Price reduced to ₹7,999");
                                            } else {
                                                alert("Invalid coupon code. Please try again.");
                                                setDiscountApplied(false);
                                                setFriendCouponApplied(false);
                                            }
                                        }}
                                        className="font-display text-[10px] sm:text-xs font-bold px-3 sm:px-4 rounded-xl border border-primary/30 text-primary hover:bg-primary/10 transition-all uppercase tracking-wider disabled:opacity-50"
                                    >
                                        {couponChecking ? "..." : "Apply"}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-glow text-primary-foreground font-display text-xs sm:text-sm font-bold px-4 py-3 sm:py-4 rounded-full tracking-widest flex items-center justify-center gap-2 sm:gap-3 mt-1 disabled:opacity-70"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                                        <span>OPENING PAYMENT...</span>
                                    </>
                                ) : (
                                    <span>PAY {friendCouponApplied ? "₹7,999" : discountApplied ? "₹9,999" : "₹14,999"}</span>
                                )}
                            </button>

                            {/* Trust badge */}
                            <div className="flex items-center justify-center gap-2 mt-1">
                                <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                                <span className="font-body text-xs text-muted-foreground">Secured by Razorpay · 256-bit SSL</span>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div >
    );
};

export default RegisterModal;
