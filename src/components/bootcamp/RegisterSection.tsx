import React, { useState } from "react";
import { Send, Loader2 } from "lucide-react";

const batches = [
  { value: "batch1", label: "Batch 1 — April 1–30, 2026" },
  { value: "batch2", label: "Batch 2 — May 1–30, 2026" },
];

const RegisterSection: React.FC = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", batch: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
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
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
                <Send className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-3">Registration Received!</h3>
              <p className="font-body text-muted-foreground">
                We'll reach out to you with payment details shortly. Welcome aboard!
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
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>PROCEED TO PAYMENT — ₹3,999</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default RegisterSection;
