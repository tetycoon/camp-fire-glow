import React, { useState, useEffect } from "react";
import { 
  Lock, 
  Unlock, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  CreditCard, 
  AlertCircle, 
  Mail, 
  Phone, 
  User, 
  Briefcase, 
  Tag, 
  Clock, 
  Gift, 
  Check, 
  ExternalLink 
} from "lucide-react";
import { countryCodes, CountryCode } from "../../lib/countryCodes";

declare global {
  interface Window {
    Razorpay: any;
    PROFESSIONALS_APPS_SCRIPT_URL?: string;
  }
}

// Target Google Sheet: https://docs.google.com/spreadsheets/d/1RpwPPMH6nf8CsIAfITF1gNc5gBNhq7CJ0zckotAgq4I/edit?gid=0#gid=0
// Spreadsheet ID: 1RpwPPMH6nf8CsIAfITF1gNc5gBNhq7CJ0zckotAgq4I
// Sheet Title: AI For Working Professionals (Sheet1)
// Columns: Date and Time | Name | Email | Phone | Profession | Amount | Status | Order ID | Payment ID
const DEFAULT_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwGaOKJYsQiHuhueRVy_iosxeKKO1qPj748jnUqkfwnmYmvgxWdkHiXB4cON6wF4iXnaA/exec";
const SPREADSHEET_ID = "1RpwPPMH6nf8CsIAfITF1gNc5gBNhq7CJ0zckotAgq4I";

const RAZORPAY_KEY_ID = "rzp_live_T2CbVONQc6qrqj";
const RAZORPAY_INTL_KEY_ID = "rzp_live_gfoS1OjC8tvWjP";

const PROFESSION_OPTIONS = [
  "Operations / Project Manager",
  "Marketing / Sales / Business Development",
  "HR / Talent / People Operations",
  "Finance / Accounting / Business Analyst",
  "Team Lead / Department Head / Director",
  "Strategy / Management Consultant",
  "Executive / General Manager",
  "Other Working Professional"
];

const ProfessionalRegistrationForm: React.FC = () => {
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    profession: "Operations / Project Manager",
    customProfession: ""
  });

  // Country Code State
  const defaultCountry = countryCodes.find(c => c.code === "IN") || countryCodes[0];
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(defaultCountry);

  // VIP Pricing & Coupon State
  const [couponCode, setCouponCode] = useState("AMIABLE");
  const [appliedCoupon, setAppliedCoupon] = useState("AMIABLE");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("VIP Code AMIABLE Applied — 80% Corporate Subsidy Unlocked!");

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [successDetails, setSuccessDetails] = useState<{
    orderId?: string;
    paymentId?: string;
    amount?: number;
    name?: string;
    email?: string;
    phone?: string;
  } | null>(null);

  // Pricing Calculation
  const originalPrice = 14999;
  const isVipApplied = appliedCoupon.toUpperCase() === "AMIABLE" || appliedCoupon.toUpperCase() === "TECHTYCOON";
  const finalPrice = isVipApplied ? 2999 : 14999;
  const discountAmount = originalPrice - finalPrice;

  // Handle Input Changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Apply Coupon Code
  const handleApplyCoupon = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCouponError("");
    setCouponSuccess("");

    const code = couponCode.trim().toUpperCase();
    if (!code) {
      setCouponError("Please enter a coupon code");
      return;
    }

    if (code === "AMIABLE" || code === "TECHTYCOON" || code === "VIP" || code === "PRO2026") {
      setAppliedCoupon(code);
      setCouponSuccess(`Coupon "${code}" applied! VIP rate of ₹2,999 unlocked.`);
    } else {
      setCouponError("Invalid or expired coupon code. Use AMIABLE for the VIP rate.");
    }
  };

  // Remove Coupon Code
  const handleRemoveCoupon = () => {
    setAppliedCoupon("");
    setCouponCode("");
    setCouponSuccess("");
    setCouponError("");
  };

  // Load Razorpay SDK
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

  // Handle Form Submission & Payment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!formData.name.trim()) {
      alert("Please enter your full name.");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      alert("Please enter a valid business/personal email address.");
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 7) {
      alert("Please enter a valid mobile number.");
      return;
    }

    setIsSubmitting(true);

    const fullPhone = `${selectedCountry.dialCode} ${formData.phone.trim()}`;
    const finalProfession = formData.profession === "Other Working Professional" 
      ? (formData.customProfession.trim() || "Working Professional")
      : formData.profession;

    const currentDateTime = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "medium"
    });

    const isInternational = selectedCountry.code !== "IN";
    const amountInPaise = finalPrice * 100;
    let generatedOrderId = `ORD_PROF_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const scriptUrl = window.PROFESSIONALS_APPS_SCRIPT_URL || DEFAULT_APPS_SCRIPT_URL;

    // Col A: Date and Time | Col B: Name | Col C: Email | Col D: Phone | Col E: Profession | Col F: Amount | Col G: Status | Col H: Order ID | Col I: Payment ID
    const leadPayload = {
      dateTime: currentDateTime,
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: fullPhone,
      profession: finalProfession,
      amount: finalPrice,
      status: "INITIATED",
      orderId: generatedOrderId,
      paymentId: "",
      coupon: appliedCoupon,
      isInternational: isInternational,
      course: "Advance AI for Non-Tech Working Professionals",
      pageUrl: window.location.href,
      spreadsheetId: SPREADSHEET_ID
    };

    try {
      // 1. Log INITIATED row to Google Sheet
      try {
        const sheetResponse = await fetch(scriptUrl, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(leadPayload)
        });
        const sheetResult = await sheetResponse.json();
        if (sheetResult && sheetResult.orderId) {
          generatedOrderId = sheetResult.orderId;
        }
      } catch (sheetErr) {
        // Fallback no-cors
        fetch(scriptUrl, {
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
        description: `Advance AI for Professionals ${appliedCoupon ? `(Coupon: ${appliedCoupon})` : ""}`,
        prefill: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          contact: fullPhone
        },
        notes: {
          course: "Advance AI for Non-Tech Working Professionals",
          profession: finalProfession,
          coupon: appliedCoupon,
          phone: fullPhone,
          spreadsheetId: SPREADSHEET_ID
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
            amount: finalPrice,
            coupon: appliedCoupon,
            course: "Advance AI for Non-Tech Working Professionals",
            spreadsheetId: SPREADSHEET_ID
          };

          fetch(scriptUrl, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(successPayload)
          }).catch(() => {
            fetch(scriptUrl, {
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
            amount: finalPrice,
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
      rzp.on("payment.failed", function (failResponse: any) {
        setIsSubmitting(false);
        alert(`Payment Failed: ${failResponse.error?.description || "Transaction cancelled."}`);
      });
      rzp.open();

    } catch (err) {
      console.error("Enrollment process error:", err);
      setIsSubmitting(false);
      alert("An unexpected error occurred. Please try again.");
    }
  };

  // Payment Success View
  if (paymentSuccess && successDetails) {
    return (
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-2xl text-center max-w-xl mx-auto animate-in fade-in zoom-in-95 duration-300">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
          <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
        </div>

        <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider mb-2">
          Payment Confirmed • Enrollment Successful
        </span>

        <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
          Welcome to Advance AI for Professionals!
        </h3>

        <div className="p-4 rounded-xl bg-indigo-50/80 border border-indigo-100 text-left space-y-2 mb-6">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-slate-600">Participant:</span>
            <span className="font-bold text-slate-900">{successDetails.name}</span>
          </div>
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-slate-600">Registered Email:</span>
            <span className="font-bold text-slate-900">{successDetails.email}</span>
          </div>
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-slate-600">Order ID:</span>
            <span className="font-mono text-slate-700 text-xs">{successDetails.orderId}</span>
          </div>
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-slate-600">Payment ID:</span>
            <span className="font-mono text-slate-700 text-xs">{successDetails.paymentId}</span>
          </div>
          <div className="flex items-center justify-between text-xs sm:text-sm pt-2 border-t border-indigo-200">
            <span className="text-slate-600">Amount Paid:</span>
            <span className="font-black text-emerald-700 text-base">₹{successDetails.amount?.toLocaleString()}</span>
          </div>
        </div>

        {/* Clear Email Course Access Delivery Notice */}
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-left mb-6 space-y-2">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wide">
            <Mail className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>Course Access Dispatched via Email</span>
          </div>
          <p className="text-xs text-amber-950 leading-relaxed">
            Your login credentials, portal access link, and bonus resource toolkits have been dispatched to <strong>{successDetails.email}</strong>. 
            Please check your inbox (and spam/promotions tab) in the next 2 minutes.
          </p>
        </div>

        <a
          href="https://academy.techtycoon.in"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all"
        >
          <span>Open Academy Student Portal</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    );
  }

  // Active Enrollment Form View
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-5 sm:p-8 shadow-xl relative overflow-hidden">
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
        <div>
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-indigo-600">
            EXECUTIVE REGISTRATION • 2026 COHORT
          </span>
          <h3 className="text-base sm:text-xl font-black text-slate-900">
            Advance AI for Non-Tech Professionals
          </h3>
        </div>
        <span className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider border border-emerald-200 flex-shrink-0">
          Fast-Track Pass
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 text-left">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g. Rahul Sharma"
              className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-medium transition-all"
            />
          </div>
        </div>

        {/* Email Address */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 text-left">
            Email Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              placeholder="e.g. rahul@company.com"
              className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-medium transition-all"
            />
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 mt-1 text-left">
            Course login details and academy credentials will be sent to this email address.
          </p>
        </div>

        {/* Mobile Number with Country Code */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 text-left">
            Mobile Number (WhatsApp) <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <div className="w-28 sm:w-32 flex-shrink-0">
              <select
                value={selectedCountry.code}
                onChange={(e) => {
                  const country = countryCodes.find(c => c.code === e.target.value);
                  if (country) setSelectedCountry(country);
                }}
                className="w-full px-2 py-2.5 sm:py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-xs sm:text-sm text-slate-900 font-medium bg-slate-50 transition-all truncate"
              >
                {countryCodes.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.dialCode}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative flex-grow">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="98765 43210"
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-medium transition-all"
              />
            </div>
          </div>
        </div>

        {/* Profession / Role Dropdown */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 text-left">
            Current Role / Profession <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              name="profession"
              value={formData.profession}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-xs sm:text-sm text-slate-900 font-medium bg-white transition-all appearance-none cursor-pointer"
            >
              {PROFESSION_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {formData.profession === "Other Working Professional" && (
            <input
              type="text"
              name="customProfession"
              value={formData.customProfession}
              onChange={handleInputChange}
              placeholder="Specify your exact job role"
              className="mt-2 w-full px-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900"
            />
          )}
        </div>

        {/* Coupon Code Section */}
        <div className="pt-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 text-left">
            VIP Subsidy Coupon
          </label>
          <div className="flex gap-2">
            <div className="relative flex-grow">
              <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Enter coupon code (e.g. AMIABLE)"
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 text-xs sm:text-sm uppercase font-mono tracking-wider"
              />
            </div>
            <button
              type="button"
              onClick={() => handleApplyCoupon()}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider flex-shrink-0"
            >
              Apply
            </button>
          </div>

          {couponSuccess && (
            <div className="mt-2 text-left text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{couponSuccess}</span>
            </div>
          )}

          {couponError && (
            <div className="mt-2 text-left text-xs font-semibold text-red-600 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{couponError}</span>
            </div>
          )}
        </div>

        {/* Price Breakdown Summary */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>Corporate Enrollment Fee:</span>
            <span className="line-through font-mono">₹{originalPrice.toLocaleString()}</span>
          </div>

          {isVipApplied && (
            <div className="flex items-center justify-between text-xs text-emerald-700 font-semibold">
              <span className="flex items-center gap-1">
                <Tag className="w-3 h-3" /> VIP Subsidy (Coupon {appliedCoupon}):
              </span>
              <span className="font-mono">-₹{discountAmount.toLocaleString()}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-sm sm:text-base font-black text-slate-900 pt-2 border-t border-slate-200">
            <span>Final Investment:</span>
            <span className="text-xl sm:text-2xl text-indigo-700 font-mono">
              ₹{finalPrice.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Submit & Pay Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 sm:py-4 px-6 rounded-xl sm:rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-blue-700 text-white font-extrabold text-sm sm:text-base uppercase tracking-wider shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-75 disabled:pointer-events-none"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Securing Seat & Opening Gateway...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-300" />
              <span>Complete Enrollment (₹{finalPrice.toLocaleString()})</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          )}
        </button>

        {/* Security / Guarantee Trust Badges */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 text-[10px] sm:text-[11px] text-slate-500 pt-1">
          <span className="flex items-center gap-1 text-slate-600">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 256-Bit SSL Secured
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-slate-600">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" /> Razorpay Verified
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-slate-600">
            <Mail className="w-3.5 h-3.5 text-blue-600" /> Instant Access via Email
          </span>
        </div>
      </form>
    </div>
  );
};

export default ProfessionalRegistrationForm;
