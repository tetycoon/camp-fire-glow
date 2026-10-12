import React, { useState, useEffect } from "react";
import { 
  X,
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

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface AIBGMRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Live Deployed Apps Script URL
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

const AIBGMRegisterModal: React.FC<AIBGMRegisterModalProps> = ({ isOpen, onClose }) => {
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

  // Coupon State
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponStatus, setCouponStatus] = useState<{
    type: "idle" | "success" | "error";
    message: string;
  }>({ type: "idle", message: "" });

  // Price Reveal State
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

  // Manage Body Scroll & Esc Key
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "unset";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Phone Validation
  const cleanPhone = formData.phone.replace(/\D/g, "");
  const isPhoneValid = selectedCountry.code === "+91" 
    ? cleanPhone.length === 10 
    : cleanPhone.length >= 7 && cleanPhone.length <= 15;

  const isInternational = selectedCountry.code !== "+91";
  const isCouponValid = appliedCoupon.trim().toUpperCase() === "AMIABLE";

  // Dynamic Pricing:
  // Domestic (+91): Standard = 9999, AMIABLE = 4999
  // Foreigners (!=+91): Standard = 13999, AMIABLE = 6999
  const standardPrice = isInternational ? 13999 : 9999;
  const discountedPrice = isCouponValid 
    ? (isInternational ? 6999 : 4999) 
    : standardPrice;
  const savings = standardPrice - discountedPrice;

  const filteredCountries = countryCodes.filter(
    (c) =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.code.includes(countrySearch)
  );

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
      setAppliedCoupon("");
      setIsPriceRevealed(true);
      setCouponStatus({
        type: "idle",
        message: "Standard tuition tier unlocked. Enter coupon 'AMIABLE' for 50% discount."
      });
      return;
    }

    if (code === "AMIABLE") {
      setAppliedCoupon("AMIABLE");
      setIsPriceRevealed(true);
      const discountAmount = isInternational ? 7000 : 5000;
      setCouponStatus({
        type: "success",
        message: `🎉 Secret VIP Voucher 'AMIABLE' Applied! You saved ₹${discountAmount.toLocaleString()} (50% Off)!`
      });
    } else {
      setAppliedCoupon("");
      setIsPriceRevealed(true);
      setCouponStatus({
        type: "error",
        message: "Invalid coupon code. Enter 'AMIABLE' for 50% discount."
      });
    }
  };

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

    if (!isPriceRevealed) {
      const code = couponInput.trim().toUpperCase();
      if (code === "AMIABLE") {
        setAppliedCoupon("AMIABLE");
        const discountAmount = isInternational ? 7000 : 5000;
        setCouponStatus({
          type: "success",
          message: `🎉 Secret VIP Voucher 'AMIABLE' Applied! You saved ₹${discountAmount.toLocaleString()} (50% Off)!`
        });
      } else if (code) {
        setAppliedCoupon("");
        setCouponStatus({
          type: "error",
          message: "Invalid coupon code. Enter 'AMIABLE' for 50% discount."
        });
      }
      setIsPriceRevealed(true);
      return;
    }

    setIsSubmitting(true);
    const fullPhone = `${selectedCountry.code} ${cleanPhone}`;
    const finalProfession = formData.profession === "Other" 
      ? (formData.customProfession.trim() || "Professional") 
      : formData.profession;

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
        description: `AI-BGM Course Enrollment ${appliedCoupon ? `(Coupon: ${appliedCoupon})` : ""}`,
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
          color: "#4f46e5"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl my-auto bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/90 sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-black uppercase tracking-wider text-slate-900">
              AI-BGM Executive Admission
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-extrabold border border-blue-200">
              Living LLM
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors focus:outline-none"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-6 sm:p-8 overflow-y-auto">
          {paymentSuccess && successDetails ? (
            /* Post-Payment Acknowledgement View */
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4 text-emerald-600">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black uppercase tracking-wider mb-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Official Acknowledgement: Payment Received</span>
              </div>

              <h3 className="text-xl sm:text-3xl font-black text-slate-900 mb-2">
                Payment Confirmed, {successDetails.name}! 🎉
              </h3>

              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 max-w-md mx-auto text-blue-900 text-xs mb-5 flex items-center justify-center gap-2">
                <Mail className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>
                  Official Payment Receipt dispatched to: <strong className="text-blue-950 underline">{successDetails.email}</strong>
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2.5 mb-6">
                <div className="flex justify-between border-b border-slate-200/80 pb-1.5">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-bold text-emerald-700">✓ PAID & VERIFIED</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/80 pb-1.5">
                  <span className="text-slate-500">Payment ID:</span>
                  <span className="font-mono text-blue-700 font-bold">{successDetails.paymentId}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/80 pb-1.5">
                  <span className="text-slate-500">Order ID:</span>
                  <span className="font-mono text-slate-700">{successDetails.orderId}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/80 pb-1.5">
                  <span className="text-slate-500">Course Tier:</span>
                  <span className="font-bold text-slate-900">Advance AI-BGM (20+ Hrs • Lifetime Access)</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-700 font-bold">Amount Paid:</span>
                  <span className="font-black text-emerald-700 text-base">₹{successDetails.amount.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href="https://wa.me/917558133039?text=Hi%20Antony%2C%20I%20have%20completed%20payment%20for%20AI-BGM%20Course!%20My%20Payment%20ID%20is%20"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/25 transition-transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <span>Join VIP WhatsApp Community</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300"
                >
                  🖨️ Print Receipt
                </button>
              </div>
            </div>
          ) : (
            /* Registration Form View */
            <form onSubmit={handleSubmitAndPay} className="space-y-5">
              <div className="text-center mb-6">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
                  Advance AI-Business Generative Model
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  Tuition rate is locked. Enter your mobile number & coupon code below to reveal your custom fee.
                </p>
              </div>

              {/* Step 1: Personal Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. rahul@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Profession */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Profession / Business Background <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={formData.profession}
                    onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                    className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 appearance-none cursor-pointer"
                  >
                    {PROFESSION_OPTIONS.map((p) => (
                      <option key={p} value={p} className="bg-white text-slate-900">
                        {p}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {formData.profession === "Other" && (
                  <input
                    type="text"
                    placeholder="Specify profession"
                    value={formData.customProfession}
                    onChange={(e) => setFormData({ ...formData, customProfession: e.target.value })}
                    className="mt-2 w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:bg-white focus:border-blue-600"
                  />
                )}
              </div>

              {/* Step 2: Mobile & Country Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2 relative">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                      className="h-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm flex items-center gap-1.5 hover:bg-slate-100 focus:outline-none"
                    >
                      <span>{selectedCountry.flag}</span>
                      <span className="font-bold">{selectedCountry.code}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                    </button>

                    {isCountryDropdownOpen && (
                      <div className="absolute top-full left-0 mt-1.5 w-64 max-h-56 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col">
                        <div className="p-2 border-b border-slate-100 sticky top-0 bg-white">
                          <div className="relative">
                            <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              placeholder="Search country..."
                              value={countrySearch}
                              onChange={(e) => setCountrySearch(e.target.value)}
                              className="w-full pl-7 pr-2 py-1 text-xs bg-slate-50 rounded-lg text-slate-900 border border-slate-200 focus:outline-none focus:bg-white"
                            />
                          </div>
                        </div>
                        <div className="overflow-y-auto max-h-44 divide-y divide-slate-100">
                          {filteredCountries.map((c) => (
                            <button
                              key={`${c.iso}-${c.code}`}
                              type="button"
                              onClick={() => {
                                setSelectedCountry(c);
                                setIsCountryDropdownOpen(false);
                                setCountrySearch("");
                              }}
                              className="w-full px-3 py-1.5 text-left hover:bg-slate-50 flex items-center justify-between text-xs text-slate-800"
                            >
                              <span className="flex items-center gap-1.5 truncate max-w-[130px]">
                                <span>{c.flag}</span>
                                <span>{c.name}</span>
                              </span>
                              <span className="font-mono text-slate-500 font-bold">{c.code}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="relative flex-grow">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      placeholder={selectedCountry.code === "+91" ? "98765 43210" : "Mobile number"}
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value });
                        if (errorMessage) setErrorMessage("");
                      }}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Coupon Code */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Secret Voucher / Coupon Code
                  </label>
                  <span className="text-[10px] text-amber-700 font-bold">
                    💡 Tip: Enter <strong>AMIABLE</strong> for 50% off
                  </span>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-grow">
                    <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. AMIABLE"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs sm:text-sm font-mono uppercase tracking-wider focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider whitespace-nowrap transition-colors"
                  >
                    Apply & Reveal
                  </button>
                </div>

                {couponStatus.message && (
                  <div
                    className={`mt-2 p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                      couponStatus.type === "success"
                        ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                        : couponStatus.type === "error"
                        ? "bg-rose-50 border border-rose-200 text-rose-800"
                        : "bg-slate-100 border border-slate-200 text-slate-700"
                    }`}
                  >
                    {couponStatus.type === "success" ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                    )}
                    <span>{couponStatus.message}</span>
                  </div>
                )}
              </div>

              {/* Price Reveal Box (Rendered upon coupon apply or details submission) */}
              {isPriceRevealed && (
                <div className="pt-2 border-t border-slate-200 animate-in fade-in duration-200">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/80 via-indigo-50/50 to-white border border-blue-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-700 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        {isCouponValid ? "50% VIP Grant Unlocked" : "Standard Tier Active"}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {isInternational ? "International Participant" : "Domestic (+91)"}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between pt-1 border-t border-blue-100">
                      <div>
                        <div className="text-[11px] text-slate-500">Total Course Fee</div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-black text-slate-900">
                            ₹{discountedPrice.toLocaleString()}
                          </span>
                          {isCouponValid && (
                            <span className="text-sm font-bold text-slate-400 line-through">
                              ₹{standardPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>

                      {isCouponValid && (
                        <div className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
                          Save ₹{savings.toLocaleString()}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-600 pt-1 font-medium">
                      <div className="flex items-center gap-1">✓ 20+ Hours Content</div>
                      <div className="flex items-center gap-1">✓ Lifetime Access</div>
                      <div className="flex items-center gap-1">✓ Living LLM Software</div>
                      <div className="flex items-center gap-1">✓ 9-Core BMC Blueprint</div>
                    </div>
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-blue-500/25 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Processing Enrollment...</span>
                    </>
                  ) : !isPriceRevealed ? (
                    <>
                      <Unlock className="w-4 h-4 text-amber-300" />
                      <span>Submit Details & Reveal Pricing</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-amber-300" />
                      <span>Proceed to Payment — ₹{discountedPrice.toLocaleString()}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-3 text-slate-500 text-[10px] text-center pt-1 font-medium">
                <span>🔒 256-Bit SSL Secured</span>
                <span>•</span>
                <span>⚡ Instant Sheet & Email Sync</span>
                <span>•</span>
                <span>📜 Lifetime Certification</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIBGMRegisterModal;
