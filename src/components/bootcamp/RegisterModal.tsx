import React, { useState, useEffect } from "react";
import { CheckCircle2, Loader2, Phone, X } from "lucide-react";
import { useRegisterModal } from "./RegisterModalContext";

const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbzUwK8DNYomJfz_NmcXoRyQ3dMZgqL_ZLNQBnHw8PY27kSE_SjS80q801WJ5uDkPTl1/exec";

const batches = [
    { value: "batch2", label: "May Batch — May 1–30, 2026" },
];

const RegisterModal: React.FC = () => {
    const { isOpen, closeRegisterModal } = useRegisterModal();
    const [form, setForm] = useState({ name: "", email: "", phone: "", schoolName: "", batch: "batch2", timing: "10 AM to 1 PM", coupon: "WELCOME33" });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [couponChecking, setCouponChecking] = useState(false);
    const [visible, setVisible] = useState(false);

    // Animate in/out
    useEffect(() => {
        if (isOpen) {
            requestAnimationFrame(() => setVisible(true));
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
            if (!submitted) {
                setForm({ name: "", email: "", phone: "", schoolName: "", batch: "batch2", timing: "10 AM to 1 PM", coupon: "WELCOME33" });
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

        const pageUrl = window.location.href;

        try {
            const response = await fetch(GOOGLE_SHEET_URL, {
                method: "POST",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify({
                    userType: "school students",
                    pageUrl,
                    name: form.name,
                    email: form.email,
                    phone: form.phone,
                    schoolName: form.schoolName,
                    batch: `${form.batch} (${form.timing})`,
                    amount: 0 // Enquire mode
                }),
            });

            const result = await response.json();

            if (result.success) {
                setSubmitted(true);
            } else {
                alert("Failed to submit enquiry. Please try again.");
            }
        } catch (error) {
            alert("Server error. Please try again later.");
            console.error("Error submitting enquiry:", error);
        } finally {
            setLoading(false);
        }
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
                className={`relative w-full max-w-xl rounded-3xl p-6 sm:p-8 transition-all duration-300 ${visible ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
                    }`}
                style={{
                    background: "linear-gradient(145deg, hsl(222 40% 10%), hsl(222 40% 7%))",
                    border: "1px solid hsl(199 100% 55% / 0.25)",
                    boxShadow: "0 0 60px hsl(199 100% 55% / 0.15), 0 25px 50px hsl(222 47% 5% / 0.5)",
                }}
            >
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                {submitted ? (
                    <div className="text-center py-8">
                        <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
                            <CheckCircle2 className="w-10 h-10 text-primary" />
                        </div>
                        <h3 className="font-display text-2xl font-bold text-foreground mb-3">Enquiry Received</h3>
                        <p className="font-body text-base text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
                            Thank you for enquiring about our <span className="text-white font-bold">AI Summer Bootcamp '26</span>. Our admissions team will review your profile shortly.
                        </p>
                        
                        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 mb-8">
                            <p className="font-body text-sm text-primary/80 mb-4 font-medium uppercase tracking-wider">To Confirm Your Seat Immediately</p>
                            <div className="flex flex-col items-center gap-3">
                                <a href="tel:+917558133039" className="flex items-center gap-3 font-display text-xl sm:text-2xl font-black text-white hover:text-primary transition-colors">
                                    <Phone className="w-6 h-6 text-primary animate-bounce" />
                                    +91 7558133039
                                </a>
                                <p className="font-body text-xs text-muted-foreground px-4">
                                    Please call our program coordinator to discuss pricing details and finalize your enrollment.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleClose}
                            className="font-display text-xs font-bold px-8 py-3 rounded-full tracking-wider border border-primary/30 text-primary hover:bg-primary/10 transition-all uppercase"
                        >
                            CLOSE PORTAL
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="text-center mb-6">
                            <p className="font-body text-[10px] tracking-[0.4em] text-primary uppercase font-bold mb-2">AI Summer Bootcamp 2026</p>
                            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-1">
                                Professional <span className="text-gradient">Enquiry</span>
                            </h2>
                            <p className="font-body text-xs text-muted-foreground">Submit your interest to receive detailed program and pricing information</p>
                        </div>

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3.5">
                            <div className="flex flex-col gap-1">
                                <label className="font-body text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Full Name</label>
                                <input
                                    id="name"
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    placeholder="e.g. John Doe"
                                    className="bg-muted/30 border border-border/50 rounded-xl px-4 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:bg-primary/5 transition-all shadow-inner"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="font-body text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Email Address</label>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    placeholder="john@example.com"
                                    className="bg-muted/30 border border-border/50 rounded-xl px-4 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:bg-primary/5 transition-all shadow-inner"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="font-body text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">WhatsApp Number</label>
                                <input
                                    id="phone"
                                    type="tel"
                                    required
                                    value={form.phone}
                                    onChange={e => setForm({ ...form, phone: e.target.value })}
                                    placeholder="+91 00000 00000"
                                    className="bg-muted/30 border border-border/50 rounded-xl px-4 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:bg-primary/5 transition-all shadow-inner"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="font-body text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">School & Location</label>
                                <input
                                    id="schoolName"
                                    type="text"
                                    required
                                    value={form.schoolName}
                                    onChange={e => setForm({ ...form, schoolName: e.target.value })}
                                    placeholder="School name, City"
                                    className="bg-muted/30 border border-border/50 rounded-xl px-4 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:bg-primary/5 transition-all shadow-inner"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="font-body text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Enrollment Batch</label>
                                <div className="relative">
                                    <select
                                        id="batch"
                                        required
                                        value={form.batch}
                                        onChange={e => setForm({ ...form, batch: e.target.value })}
                                        className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-2.5 font-body text-sm text-foreground focus:outline-none focus:border-primary/50 focus:bg-primary/5 transition-all appearance-none cursor-pointer shadow-inner"
                                    >
                                        <option value="" className="bg-slate-900">Select Batch</option>
                                        {batches.map(b => (
                                            <option key={b.value} value={b.value} className="bg-slate-900">{b.label}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="font-body text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Preferred Timing</label>
                                <div className="relative">
                                    <select
                                        id="timing"
                                        required
                                        value={form.timing}
                                        onChange={e => setForm({ ...form, timing: e.target.value })}
                                        className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-2.5 font-body text-sm text-foreground focus:outline-none focus:border-primary/50 focus:bg-primary/5 transition-all appearance-none cursor-pointer shadow-inner"
                                    >
                                        <option value="10 AM to 1 PM" className="bg-slate-900">10:00 AM — 01:00 PM</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-2 mt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full btn-glow text-primary-foreground font-display text-sm font-bold py-4 rounded-xl tracking-[0.2em] flex items-center justify-center gap-3 disabled:opacity-70 transition-transform active:scale-[0.98]"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>SUBMITTING ENQUIRY...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>SUBMIT ENQUIRY</span>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div >
    );
};

export default RegisterModal;
