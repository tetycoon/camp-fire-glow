import React, { useState, useEffect } from "react";
import { 
  Lock, 
  Unlock, 
  Tag, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Check, 
  ChevronDown, 
  Search, 
  AlertCircle, 
  Loader2, 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  IndianRupee,
  RefreshCw,
  Award,
  Zap,
  HelpCircle
} from "lucide-react";
import { countryCodes, CountryCode } from "../../lib/countryCodes";
import { calculateInclusiveGstBreakdown } from "../../lib/gstUtils";

declare global {
  interface Window {
    Razorpay: any;
  }
}

// Target Google Sheet: https://docs.google.com/spreadsheets/d/1XyFhw6cTJAOE2XT7Ra8lmL0rcvq2meCT9LlGuzOF0nk/edit?gid=0#gid=0
// Sheet ID: 1XyFhw6cTJAOE2XT7Ra8lmL0rcvq2meCT9LlGuzOF0nk
// Sheet Title: AI_BGM_LLM
// Columns: Date and Time | Name | Email | Phone | Profession | Amount | Status | Order ID | Payment ID
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwGaOKJYsQiHuhueRVy_iosxeKKO1qPj748jnUqkfwnmYmvgxWdkHiXB4cON6wF4iXnaA/exec";
const RAZORPAY_KEY_ID = "rzp_live_T2CbVONQc6qrqj";
const RAZORPAY_INTL_KEY_ID = "rzp_live_gfoS1OjC8tvWjP";

const PROFESSION_OPTIONS = [
  "Business Owner / Founder",
  "Entrepreneur / Solopreneur",
  "Freelancer / Consultant",
  "Digital Marketer / Agency Owner",
  "Working Professional / Manager",
  "Trainer / Coach / Educator",
  "Student / Aspiring Entrepreneur",
  "Other"
];

const AIBGMRegistrationForm: React.FC = () => {
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    profession: "Business Owner / Founder",
    customProfession: ""
  });

  // Country Selection State
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(
    countryCodes.find((c) => c.code === "+91") || countryCodes[0]
  );
  const [countrySearch, setCountrySearch] = useState("");
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);

  // Secret Coupon Code State
  // Rule: Pricing is 6449 (India) / 8449 (Foreigners with 2000 server maintenance) inclusive of tax
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponStatus, setCouponStatus] = useState<{
    type: "idle" | "success" | "error";
    message: string;
  }>({ type: "idle", message: "" });

  // Price Reveal State
  // RULE: Price must NOT be revealed in the form or landing page until user enters mobile and coupon
  const [isPriceRevealed, setIsPriceRevealed] = useState(false);

  // Submission & Payment State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [successDetails, setSuccessDetails] = useState<{
    orderId: string;
    paymentId: string;
    amount: number;
    name: string;
    email: string;
    phone: string;
  } | null>(null);

  // Phone Validation
  const cleanPhone = formData.phone.replace(/\D/g, "");
  const isPhoneValid = selectedCountry.code === "+91" 
    ? cleanPhone.length === 10 
    : cleanPhone.length >= 7 && cleanPhone.length <= 15;

  const isInternational = selectedCountry.code !== "+91";
  const isCouponValid = appliedCoupon.trim().toUpperCase() === "AMIABLE" || appliedCoupon.trim().toUpperCase() === "TECHTYCOON";

  // Dynamic Pricing Logic:
  // Domestic (+91): ₹6,449 Total Payable (Inclusive of 18% GST)
  // Foreigners (!=+91): ₹8,449 Total Payable (Inclusive of 18% GST & ₹2,000 server maintenance cost)
  const standardPrice = isInternational ? 13999 : 9999;
  const discountedPrice = isInternational ? 8449 : 6449;
  const savings = standardPrice - discountedPrice;
  const gstBreakdown = calculateInclusiveGstBreakdown(discountedPrice);

  // Filter countries for dropdown
  const filteredCountries = countryCodes.filter(
    (c) =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.code.includes(countrySearch)
  );

  // Handle Coupon Verification & Reveal Price
  const handleApplyCoupon = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCouponStatus({ type: "idle", message: "" });
    setErrorMessage("");

    if (!cleanPhone) {
      setErrorMessage("Please enter your mobile number first to unlock your pricing.");
      return;
    }

    if (!isPhoneValid) {
      setErrorMessage(
        selectedCountry.code === "+91"
          ? "Please enter a valid 10-digit mobile number."
          : "Please enter a valid phone number (7-15 digits)."
      );
      return;
    }

    const code = couponInput.trim().toUpperCase();

    if (!code) {
      // Reveal standard price if no coupon is provided
      setAppliedCoupon("");
      setIsPriceRevealed(true);
      setCouponStatus({
        type: "idle",
        message: "Executive cohort tuition tier unlocked."
      });
      return;
    }

    if (code === "AMIABLE" || code === "TECHTYCOON" || code === "VIP" || code === "PRO2026") {
      setAppliedCoupon(code);
      setIsPriceRevealed(true);
      setCouponStatus({
        type: "success",
        message: `🎉 VIP Voucher '${code}' Applied! Executive cohort subsidy unlocked: ₹${discountedPrice.toLocaleString("en-IN")} (All taxes incl.)!`
      });
    } else {
      setAppliedCoupon("");
      setIsPriceRevealed(true);
      setCouponStatus({
        type: "error",
        message: "Invalid or expired voucher code."
      });
    }
  };

  // Quick Unlock Button Click (Mobile + Coupon check)
  const handleRevealPriceClick = () => {
    handleApplyCoupon();
  };

  // Load Razorpay Script dynamically
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Final Registration & Payment Submission
  const handleSubmitAndPay = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.name.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (!isPhoneValid) {
      setErrorMessage("Please enter your valid phone number.");
      return;
    }

    // Ensure price has been revealed
    if (!isPriceRevealed) {
      setIsPriceRevealed(true);
      return;
    }

    setIsSubmitting(true);
    const fullPhone = `${selectedCountry.code} ${cleanPhone}`;
    const finalProfession = formData.profession === "Other" 
      ? (formData.customProfession.trim() || "Professional") 
      : formData.profession;

    // Test accounts can pay ₹1 for testing payment flow
    const testEmails = ["ambroseselva001@gmail.com", "techtycoondigitors@gmail.com", "techtycoondigitalsolutions@gmail.com"];
    const isTestEmail = testEmails.includes(formData.email.toLowerCase().trim());
    const finalChargeAmount = isTestEmail ? 1 : discountedPrice;
    const amountInPaise = finalChargeAmount * 100;

    const currentDateTime = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    });

    let generatedOrderId = "ORD_BGM_" + Date.now();

    // Prepare Google Sheet Payload matching Columns:
    // Col A: Date and Time | Col B: Name | Col C: Email | Col D: Phone | Col E: Profession | Col F: Amount | Col G: Status | Col H: Order ID | Col I: Payment ID
    const leadPayload = {
      dateTime: currentDateTime,
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: fullPhone,
      profession: finalProfession,
      amount: finalChargeAmount,
      status: "INITIATED",
      orderId: generatedOrderId,
      paymentId: "",
      coupon: appliedCoupon,
      isInternational: isInternational,
      course: "Advance AI-Business Generative Model (AI-BGM)",
      pageUrl: window.location.href,
      spreadsheetId: "1XyFhw6cTJAOE2XT7Ra8lmL0rcvq2meCT9LlGuzOF0nk"
    };

    try {
      // 1. Log INITIATED row to Google Sheet
      try {
        const sheetResponse = await fetch(APPS_SCRIPT_URL, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(leadPayload)
        });
        const sheetResult = await sheetResponse.json();
        if (sheetResult && sheetResult.orderId) {
          generatedOrderId = sheetResult.orderId;
        }
      } catch (sheetErr) {
        console.warn("Notice: Standard post fetch notice, using fallback background logging", sheetErr);
        fetch(APPS_SCRIPT_URL, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(leadPayload)
        }).catch(() => {});
      }

      // 2. Load Razorpay Gateway
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        alert("Payment gateway failed to initialize. Please check your internet connection.");
        setIsSubmitting(false);
        return;
      }

      // 3. Configure Razorpay Options
      const options = {
        key: isInternational ? RAZORPAY_INTL_KEY_ID : RAZORPAY_KEY_ID,
        order_id: generatedOrderId.startsWith("order_") ? generatedOrderId : undefined,
        amount: amountInPaise,
        currency: "INR",
        name: "Tech Tycoon Digital Solutions",
        description: isInternational
          ? `AI-BGM Course Enrollment (₹8,449 Incl. 18% GST & ₹2,000 Server Maintenance) ${appliedCoupon ? `(Coupon: ${appliedCoupon})` : ""}`
          : `AI-BGM Course Enrollment (₹6,449 Incl. 18% GST) ${appliedCoupon ? `(Coupon: ${appliedCoupon})` : ""}`,
        prefill: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          contact: fullPhone
        },
        notes: {
          course: "Advance AI-Business Generative Model",
          profession: finalProfession,
          coupon: appliedCoupon,
          phone: fullPhone
        },
        theme: {
          color: "#4f46e5" // Indigo primary
        },
        handler: async function (response: any) {
          setIsSubmitting(false);
          const payId = response.razorpay_payment_id || "PAID_" + Date.now();
          const ordId = response.razorpay_order_id || generatedOrderId;

          // 4. Update Google Sheet Status to PAID with Payment ID in Col I
          const successPayload = {
            paymentSuccess: true,
            razorpay_payment_id: payId,
            razorpay_order_id: ordId,
            email: formData.email.trim(),
            name: formData.name.trim(),
            phone: fullPhone,
            profession: finalProfession,
            amount: finalChargeAmount,
            coupon: appliedCoupon,
            spreadsheetId: "1XyFhw6cTJAOE2XT7Ra8lmL0rcvq2meCT9LlGuzOF0nk"
          };

          fetch(APPS_SCRIPT_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(successPayload)
          }).catch(() => {
            fetch(APPS_SCRIPT_URL, {
              method: "POST",
              mode: "no-cors",
              headers: { "Content-Type": "text/plain;charset=utf-8" },
              body: JSON.stringify(successPayload)
            }).catch(() => {});
          });

          // Show in-page confirmation
          setSuccessDetails({
            orderId: ordId,
            paymentId: payId,
            amount: finalChargeAmount,
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: fullPhone
          });
          setPaymentSuccess(true);
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Error initializing checkout. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <section id="register" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-950 text-white relative">
      {/* Background Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-widest mb-4">
            <Lock className="w-3.5 h-3.5 text-amber-300" />
            PROTECTED REGISTRATION PORTAL
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
            Register for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-violet-400">
              Advance AI-Business Generative Model
            </span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            Official enrollment pricing is confidential. Enter your mobile number and secret coupon code below to reveal your exclusive cohort rate.
          </p>
        </div>

        {/* Success Modal / Card after Payment */}
        {paymentSuccess && successDetails ? (
          <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 border border-emerald-500/40 text-center shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto mb-6 text-emerald-400">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-wider mb-3">
              <CheckCircle2 className="w-4 h-4" />
              <span>Official Acknowledgement: Payment Received & Confirmed</span>
            </div>

            <h3 className="text-2xl sm:text-4xl font-black text-white mb-2">
              Payment Acknowledged — Welcome to AI-BGM, {successDetails.name}! 🎉
            </h3>

            {/* Email Dispatch Notice */}
            <div className="p-4 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 max-w-lg mx-auto text-indigo-200 text-xs sm:text-sm mb-6 flex items-center justify-center gap-3">
              <Mail className="w-5 h-5 text-indigo-400 flex-shrink-0" />
              <span>
                An official <strong>Payment Received Acknowledgement & Receipt</strong> has been sent to <strong className="text-white underline">{successDetails.email}</strong>.
              </span>
            </div>

            <p className="text-slate-300 text-xs sm:text-sm max-w-lg mx-auto mb-6">
              Your admission into the <strong>Advance AI-Business Generative Model</strong> is officially active with <strong>Lifetime Access</strong>. Details have been recorded in the central Google database.
            </p>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 max-w-md mx-auto text-left text-xs sm:text-sm space-y-3 mb-6 shadow-inner">
              <div className="flex justify-between border-b border-slate-900 pb-2">
                <span className="text-slate-400">Payment Status:</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <span>✓ PAID & RECEIVED</span>
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-2">
                <span className="text-slate-400">Transaction ID:</span>
                <span className="font-mono text-indigo-300 font-bold">{successDetails.paymentId}</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-2">
                <span className="text-slate-400">Order ID:</span>
                <span className="font-mono text-slate-300">{successDetails.orderId}</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-2">
                <span className="text-slate-400">Participant Name:</span>
                <span className="font-bold text-white">{successDetails.name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-2">
                <span className="text-slate-400">Email:</span>
                <span className="font-bold text-white">{successDetails.email}</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-2">
                <span className="text-slate-400">Phone:</span>
                <span className="font-bold text-white">{successDetails.phone}</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-2">
                <span className="text-slate-400">Course Tier:</span>
                <span className="font-bold text-white">20+ Hours • Lifetime Access • Continuous Updates</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-300 font-bold">Total Amount Received:</span>
                <span className="font-black text-emerald-400 text-base">₹{successDetails.amount.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="https://wa.me/917558133039?text=Hi%20Antony%2C%20I%20have%20completed%20payment%20for%20AI-BGM%20Course!%20My%20Payment%20ID%20is%20"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/30 transition-transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <span>Join VIP WhatsApp Community</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={() => window.print()}
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors border border-slate-700"
              >
                🖨️ Print / Save Receipt
              </button>

              <button
                type="button"
                onClick={() => setPaymentSuccess(false)}
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-medium text-xs transition-colors"
              >
                New Enrollment
              </button>
            </div>
          </div>
        ) : (
          /* Main Registration Form Container */
          <div className="p-6 sm:p-10 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl">
            <form onSubmit={handleSubmitAndPay} className="space-y-6">
              {/* Step 1: Personal Details */}
              <div className="space-y-4">
                <div className="text-xs font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-[10px] text-indigo-300">
                    1
                  </span>
                  Participant Information
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Full Name <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul Sharma"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Email Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Email Address <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        placeholder="e.g. rahul@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Profession / Role Selection (Col E in Sheet) */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Profession / Background <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <select
                      value={formData.profession}
                      onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors appearance-none cursor-pointer"
                    >
                      {PROFESSION_OPTIONS.map((p) => (
                        <option key={p} value={p} className="bg-slate-950 text-white">
                          {p}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  {formData.profession === "Other" && (
                    <input
                      type="text"
                      placeholder="Please specify your profession"
                      value={formData.customProfession}
                      onChange={(e) => setFormData({ ...formData, customProfession: e.target.value })}
                      className="mt-2 w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500"
                    />
                  )}
                </div>
              </div>

              {/* Step 2: Country, Mobile & Secret Voucher */}
              <div className="space-y-4 pt-4 border-t border-slate-800/80">
                <div className="text-xs font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-[10px] text-indigo-300">
                    2
                  </span>
                  Mobile & Secret Coupon Verification
                </div>

                {/* Mobile Number with Country Picker */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Mobile Number <span className="text-rose-400">*</span>
                    <span className="text-[11px] font-normal text-slate-500 ml-2">
                      (Required to unlock pricing tier)
                    </span>
                  </label>
                  <div className="flex gap-2 relative">
                    {/* Country Code Trigger */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                        className="h-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm flex items-center gap-2 hover:border-slate-700 transition-colors focus:outline-none"
                      >
                        <span className="text-base">{selectedCountry.flag}</span>
                        <span className="font-bold">{selectedCountry.code}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      </button>

                      {/* Dropdown Menu */}
                      {isCountryDropdownOpen && (
                        <div className="absolute top-full left-0 mt-1.5 w-72 max-h-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col">
                          <div className="p-2 border-b border-slate-800 sticky top-0 bg-slate-900">
                            <div className="relative">
                              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                              <input
                                type="text"
                                placeholder="Search country or code..."
                                value={countrySearch}
                                onChange={(e) => setCountrySearch(e.target.value)}
                                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-950 rounded-lg text-white placeholder-slate-500 focus:outline-none border border-slate-800"
                              />
                            </div>
                          </div>
                          <div className="overflow-y-auto max-h-48 divide-y divide-slate-800/40">
                            {filteredCountries.map((c) => (
                              <button
                                key={`${c.iso}-${c.code}`}
                                type="button"
                                onClick={() => {
                                  setSelectedCountry(c);
                                  setIsCountryDropdownOpen(false);
                                  setCountrySearch("");
                                  // Re-calculate price if already revealed
                                  if (isPriceRevealed) {
                                    // Trigger update
                                  }
                                }}
                                className="w-full px-3 py-2 text-left hover:bg-slate-800 flex items-center justify-between text-xs text-slate-200 transition-colors"
                              >
                                <span className="flex items-center gap-2">
                                  <span>{c.flag}</span>
                                  <span className="truncate max-w-[140px]">{c.name}</span>
                                </span>
                                <span className="font-mono text-slate-400 font-bold">{c.code}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Phone Input */}
                    <div className="relative flex-grow">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        placeholder={selectedCountry.code === "+91" ? "98765 43210" : "Mobile number"}
                        value={formData.phone}
                        onChange={(e) => {
                          setFormData({ ...formData, phone: e.target.value });
                          if (errorMessage) setErrorMessage("");
                        }}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Coupon Code Input & Apply */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-300">
                      Voucher / Coupon Code
                    </label>
                    <span className="text-[11px] text-slate-400 font-medium">
                      (Optional)
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <div className="relative flex-grow">
                      <Tag className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(e.target.value);
                          if (couponStatus.type !== "idle") {
                            setCouponStatus({ type: "idle", message: "" });
                          }
                        }}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 text-sm font-mono uppercase tracking-wider focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider whitespace-nowrap transition-colors shadow-md shadow-indigo-600/20"
                    >
                      Apply & Reveal Price
                    </button>
                  </div>

                  {/* Coupon feedback banner */}
                  {couponStatus.message && (
                    <div
                      className={`mt-2.5 p-3 rounded-xl text-xs flex items-center gap-2 ${
                        couponStatus.type === "success"
                          ? "bg-emerald-950/60 border border-emerald-600/40 text-emerald-300"
                          : couponStatus.type === "error"
                          ? "bg-rose-950/60 border border-rose-600/40 text-rose-300"
                          : "bg-slate-800/80 border border-slate-700 text-slate-300"
                      }`}
                    >
                      {couponStatus.type === "success" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      ) : couponStatus.type === "error" ? (
                        <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                      ) : (
                        <HelpCircle className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      )}
                      <span>{couponStatus.message}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 3: DYNAMIC PRICING REVEAL CONTAINER */}
              {/* RULE: If not revealed, keep locked. Once mobile + coupon is submitted, reveal price! */}
              <div className="pt-4 border-t border-slate-800/80">
                {!isPriceRevealed ? (
                  /* LOCKED PRICING STATE */
                  <div className="p-6 rounded-2xl bg-slate-950 border border-dashed border-indigo-500/40 text-center relative overflow-hidden">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-3 text-amber-300">
                      <Lock className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-black text-white mb-1">
                      Exclusive Cohort Pricing Hidden
                    </h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
                      Tuition pricing is protected to prevent unauthorized sharing. Enter your mobile number and click below to reveal your customized enrollment tier.
                    </p>
                    <button
                      type="button"
                      onClick={handleRevealPriceClick}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 transition-transform hover:scale-105 inline-flex items-center gap-2"
                    >
                      <Unlock className="w-3.5 h-3.5 text-amber-300" />
                      <span>Reveal Unlocked Pricing Now</span>
                    </button>
                  </div>
                ) : (
                  /* REVEALED PRICING STATE */
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-slate-950 to-slate-900 border border-indigo-500/40 shadow-xl space-y-4 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                          Executive Cohort Subsidy Unlocked
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-400">
                        {isInternational ? "International Participant" : "Domestic (+91) Participant"}
                      </span>
                    </div>

                    {/* Price Breakdown */}
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pt-2 border-t border-slate-800">
                      <div>
                        <div className="text-xs text-slate-400 mb-0.5">
                          Total Course Fee (Inclusive of 18% GST)
                        </div>
                        <div className="flex items-baseline gap-3">
                          <span className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                            ₹{discountedPrice.toLocaleString()}
                          </span>
                          <span className="text-xs font-bold text-emerald-400">
                            (All Taxes Incl.)
                          </span>
                          <span className="text-lg sm:text-xl font-bold text-slate-500 line-through">
                            ₹{standardPrice.toLocaleString()}
                          </span>
                        </div>
                        {isInternational && (
                          <div className="text-xs text-amber-300 font-medium mt-1">
                            * Includes ₹2,000 international server maintenance cost
                          </div>
                        )}
                      </div>

                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Instant Savings: ₹{savings.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Inclusions checklist */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 border-t border-slate-800/80 text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span>20+ Hours Video Course Content</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span>Lifetime Access & Zero Renewals</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span>Continuous AI Model & Strategy Updates</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span>9 Core Principles BMC Blueprint</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-600/40 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit CTA Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 sm:py-5 px-8 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-black text-base uppercase tracking-wider shadow-2xl shadow-indigo-600/40 hover:scale-[1.01] active:scale-95 transition-all duration-300 border border-indigo-400/40 flex items-center justify-center gap-3 disabled:opacity-60 disabled:pointer-events-none"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-white" />
                      <span>Processing Enrollment & Securing Seat...</span>
                    </>
                  ) : !isPriceRevealed ? (
                    <>
                      <Unlock className="w-5 h-5 text-amber-300" />
                      <span>Submit Details & Reveal Pricing</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 text-amber-300" />
                      <span>Proceed to Payment — ₹{discountedPrice.toLocaleString()} (All Incl.)</span>
                      <ArrowRight className="w-5 h-5 text-indigo-200" />
                    </>
                  )}
                </button>
              </div>

              {/* Security & Guarantee Trust Bar */}
              <div className="flex flex-wrap items-center justify-center gap-4 text-slate-500 text-[11px] pt-3 text-center">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>256-Bit SSL Encrypted Checkout</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <RefreshCw className="w-4 h-4 text-blue-400" />
                  <span>Instant Sheet & Enrollment Sync</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Official Tech Tycoon Certification</span>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  );
};

export default AIBGMRegistrationForm;
