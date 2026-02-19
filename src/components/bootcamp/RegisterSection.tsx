import React, { useState } from "react";
import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react";

// Razorpay key_id is a publishable key — safe to use in frontend
const RAZORPAY_KEY_ID = "rzp_live_gfoS1OjC8tvWjP";

const batches = [
  { value: "batch1", label: "Batch 1 — April 1–30, 2026" },
  { value: "batch2", label: "Batch 2 — May 1–30, 2026" },
];

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  prefill: { name: string; email: string; contact: string };
  notes: { batch: string };
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

const RegisterSection: React.FC = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", batch: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentId, setPaymentId] = useState<string>("");

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

    const options: RazorpayOptions = {
      key: RAZORPAY_KEY_ID,
      amount: 399900, // ₹3,999 in paise
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
        color: "#00b4d8",
      },
      handler: (response) => {
        setPaymentId(response.razorpay_payment_id);
        setSubmitted(true);
        setLoading(false);
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

  return (
    <section id="register" className="section-border py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-3xl" />
      <div className="max-w-2xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <p className="font-body text-xs tracking-[0.3em] text-primary uppercase font-semibold mb-3">Enroll Now</p>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-foreground mb-4">
            Register <span className="text-gradient">Now</span>
          </h2>
          <p className="font-body text-muted-foreground">Secure your spot in the AI revolution</p>
        </div>

        <div className="card-glow rounded-3xl p-8 sm:p-12">
          {submitted ? (
            <div className="text-center py-12">
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
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="font-body text-xs font-semibold text-muted-foreground uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter your full name"
                  className="bg-muted/50 border border-border rounded-xl px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:bg-primary/5 transition-all"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-body text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="Enter your email address"
                  className="bg-muted/50 border border-border rounded-xl px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:bg-primary/5 transition-all"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-body text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone</label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="Enter your phone number"
                  className="bg-muted/50 border border-border rounded-xl px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:bg-primary/5 transition-all"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-body text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select Batch</label>
                <select
                  required
                  value={form.batch}
                  onChange={e => setForm({ ...form, batch: e.target.value })}
                  className="bg-muted/50 border border-border rounded-xl px-4 py-3 font-body text-sm text-foreground focus:outline-none focus:border-primary/50 focus:bg-primary/5 transition-all appearance-none cursor-pointer"
                >
                  <option value="" className="bg-card">Choose your batch</option>
                  {batches.map(b => (
                    <option key={b.value} value={b.value} className="bg-card">{b.label}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-glow text-primary-foreground font-display text-sm font-bold px-8 py-4 rounded-full tracking-widest flex items-center justify-center gap-3 mt-2 disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>OPENING PAYMENT...</span>
                  </>
                ) : (
                  <span>PROCEED TO PAYMENT — ₹3,999</span>
                )}
              </button>

              {/* Trust badge */}
              <div className="flex items-center justify-center gap-2 mt-1">
                <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                <span className="font-body text-xs text-muted-foreground">Secured by Razorpay · 256-bit SSL</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default RegisterSection;
