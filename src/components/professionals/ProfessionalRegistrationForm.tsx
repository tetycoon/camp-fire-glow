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
  ExternalLink,
  FileText
} from "lucide-react";
import { countryCodes, CountryCode } from "../../lib/countryCodes";
import GstPriceBreakdown from "../common/GstPriceBreakdown";
import { calculateGstBreakdown, isAuthorizedTestEmail, isValidEmail, isValidGstin, openPrintableGstInvoice, sanitizeTextInput } from "../../lib/gstUtils";

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
const DEFAULT_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzuTE9PUoTneN4PF0TKhHwrDXZEfSo-92Ly10dHFd8pGsY1DzjmBa6A5A3aTCRSd6TpFQ/exec";
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

  // GST Invoice fields
  const [claimGst, setClaimGst] = useState(false);
  const [gstin, setGstin] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [gstError, setGstError] = useState("");

  // Country Code State - Default to India (IN / +91)
  const defaultCountry = countryCodes.find(c => c.iso === "IN") || countryCodes.find(c => c.code === "+91") || countryCodes[0];
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(defaultCountry);

  // Price Reveal State
  // RULE: Price must NOT be revealed in the form or landing page until user enters mobile and coupon
  const [isPriceRevealed, setIsPriceRevealed] = useState(false);

  // VIP Pricing & Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

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

  // Pricing Calculation matching /ai_bgm:
  // Domestic (+91): Standard = 9999, with AMIABLE = 4999 (Save 5000)
  // International: Standard = 13999, with AMIABLE = 6999 (Save 7000)
  const isInternational = selectedCountry.iso !== "IN" && selectedCountry.code !== "+91";
  const standardPrice = isInternational ? 13999 : 9999;
  const isVipApplied = appliedCoupon.toUpperCase() === "AMIABLE" || appliedCoupon.toUpperCase() === "TECHTYCOON";
  const finalPrice = isVipApplied ? (isInternational ? 6999 : 4999) : standardPrice;
  const discountAmount = standardPrice - finalPrice;
  const gstBreakdown = calculateGstBreakdown(finalPrice);

  // Phone validation
  const cleanPhone = formData.phone.replace(/\D/g, "");
  const isPhoneValid = selectedCountry.iso === "IN" || selectedCountry.code === "+91"
    ? cleanPhone.length === 10
    : cleanPhone.length >= 7 && cleanPhone.length <= 15;

  // Handle Input Changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Apply Coupon Code & Reveal Price
  const handleApplyCoupon = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCouponError("");
    setCouponSuccess("");

    if (!cleanPhone) {
      setCouponError("Please enter your mobile number first to unlock your pricing.");
      return;
    }

    if (!isPhoneValid) {
      setCouponError(
        selectedCountry.iso === "IN" || selectedCountry.code === "+91"
          ? "Please enter a valid 10-digit mobile number."
          : "Please enter a valid phone number (7-15 digits)."
      );
      return;
    }

    const code = couponCode.trim().toUpperCase();

    if (!code) {
      setAppliedCoupon("");
      setIsPriceRevealed(true);
      setCouponSuccess(`Standard corporate tuition unlocked (₹${standardPrice.toLocaleString("en-IN")} + 18% GST). Enter coupon 'AMIABLE' for 50% VIP discount.`);
      return;
    }

    if (code === "AMIABLE" || code === "TECHTYCOON" || code === "VIP" || code === "PRO2026") {
      setAppliedCoupon("AMIABLE");
      setIsPriceRevealed(true);
      const targetVipPrice = isInternational ? 6999 : 4999;
      const saved = standardPrice - targetVipPrice;
      setCouponSuccess(`🎉 Secret VIP Voucher 'AMIABLE' Applied! You saved ₹${saved.toLocaleString("en-IN")} (50% Off)! Base Fee: ₹${targetVipPrice.toLocaleString("en-IN")} (+ 18% GST)`);
    } else {
      setAppliedCoupon("");
      setIsPriceRevealed(true);
      setCouponError("Invalid coupon code. Valid code is 'AMIABLE' for 50% VIP discount.");
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
    setGstError("");

    const sanitizedName = sanitizeTextInput(formData.name, 100);
    const sanitizedEmail = formData.email.trim().toLowerCase();
    const sanitizedCompany = claimGst ? sanitizeTextInput(companyName, 120) : "";
    const sanitizedGstin = claimGst ? gstin.trim().toUpperCase() : "";

    // Validations
    if (!sanitizedName) {
      alert("Please enter your full name.");
      return;
    }
    if (!isValidEmail(sanitizedEmail)) {
      alert("Please enter a valid business/personal email address.");
      return;
    }
    if (!cleanPhone || !isPhoneValid) {
      alert(
        selectedCountry.iso === "IN" || selectedCountry.code === "+91"
          ? "Please enter a valid 10-digit mobile number."
          : "Please enter a valid phone number (7-15 digits)."
      );
      return;
    }

    // If price is not yet revealed, clicking reveals the price
    if (!isPriceRevealed) {
      handleApplyCoupon();
      return;
    }

    if (claimGst) {
      if (!isValidGstin(sanitizedGstin)) {
        setGstError("Please enter a valid 15-character GSTIN (e.g. 33AAAAA0000A1Z5)");
        return;
      }
      if (!sanitizedCompany) {
        setGstError("Please enter your registered Legal Company Name for the GST invoice");
        return;
      }
    }

    setIsSubmitting(true);

    const fullPhone = `${selectedCountry.code} ${cleanPhone}`;
    const finalProfession = sanitizeTextInput(
      formData.profession === "Other Working Professional" 
        ? (formData.customProfession.trim() || "Working Professional")
        : formData.profession,
      80
    );

    const currentDateTime = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "medium"
    });

    const isTestEmail = isAuthorizedTestEmail(sanitizedEmail);
    const payableInr = isTestEmail ? 1 : gstBreakdown.totalAmount;
    const amountInPaise = payableInr * 100;
    let generatedOrderId = `ORD_PROF_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const scriptUrl = window.PROFESSIONALS_APPS_SCRIPT_URL || DEFAULT_APPS_SCRIPT_URL;

    // Col A: Date and Time | Col B: Name | Col C: Email | Col D: Phone | Col E: Profession | Col F: Amount | Col G: Status | Col H: Order ID | Col I: Payment ID
    const leadPayload = {
      dateTime: currentDateTime,
      name: sanitizedName,
      email: sanitizedEmail,
      phone: fullPhone,
      profession: finalProfession,
      baseAmount: isTestEmail ? 1 : gstBreakdown.baseAmount,
      gstAmount: isTestEmail ? 0 : gstBreakdown.gstAmount,
      amount: payableInr,
      companyName: sanitizedCompany,
      gstin: sanitizedGstin,
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
        description: `Advance AI for Professionals (Incl. 18% GST) ${appliedCoupon ? `(Coupon: ${appliedCoupon})` : ""}`,
        prefill: {
          name: sanitizedName,
          email: sanitizedEmail,
          contact: fullPhone
        },
        notes: {
          course: "Advance AI for Non-Tech Working Professionals",
          profession: finalProfession,
          coupon: appliedCoupon,
          phone: fullPhone,
          base_amount: String(gstBreakdown.baseAmount),
          gst_amount: String(gstBreakdown.gstAmount),
          gstin: sanitizedGstin || "N/A",
          company_name: sanitizedCompany || "N/A",
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
            razorpay_signature: response.razorpay_signature || "",
            email: sanitizedEmail,
            name: sanitizedName,
            phone: fullPhone,
            profession: finalProfession,
            baseAmount: isTestEmail ? 1 : gstBreakdown.baseAmount,
            gstAmount: isTestEmail ? 0 : gstBreakdown.gstAmount,
            amount: payableInr,
            companyName: sanitizedCompany,
            gstin: sanitizedGstin,
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
            amount: payableInr,
            name: sanitizedName,
            email: sanitizedEmail,
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
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xl text-center max-w-xl mx-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
          <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8" />
        </div>

        <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider mb-1.5">
          Payment Confirmed • Enrollment Successful
        </span>

        <h3 className="text-base sm:text-lg font-black text-slate-900 mb-2">
          Welcome to Advance AI for Professionals!
        </h3>

        <div className="p-3 rounded-lg bg-indigo-50/80 border border-indigo-100 text-left space-y-1.5 mb-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Participant:</span>
            <span className="font-bold text-slate-900">{successDetails.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Registered Email:</span>
            <span className="font-bold text-slate-900">{successDetails.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Order ID:</span>
            <span className="font-mono text-slate-700 text-[11px]">{successDetails.orderId}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Payment ID:</span>
            <span className="font-mono text-slate-700 text-[11px]">{successDetails.paymentId}</span>
          </div>
          <div className="flex items-center justify-between pt-1.5 border-t border-indigo-200">
            <span className="text-slate-600 font-medium">Amount Paid:</span>
            <span className="font-black text-emerald-700 text-sm">₹{successDetails.amount?.toLocaleString()}</span>
          </div>
        </div>

        {/* Clear Email Course Access Delivery Notice */}
        <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-left mb-3.5 space-y-1">
          <div className="flex items-center gap-1.5 text-amber-900 font-bold text-[11px] uppercase tracking-wide">
            <Mail className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
            <span>Course Access Dispatched via Email</span>
          </div>
          <p className="text-[11px] text-amber-950 leading-relaxed">
            Your login credentials and portal access link have been dispatched to <strong>{successDetails.email}</strong>. 
            Please check your inbox (and spam folder) in the next 2 minutes.
          </p>
        </div>

        <div className="space-y-2">
          <a
            href="https://academy.techtycoon.in"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/25 transition-all"
          >
            <span>Open Academy Student Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={() =>
              openPrintableGstInvoice({
                customerName: successDetails.name,
                customerEmail: successDetails.email,
                customerPhone: `${selectedCountry.code} ${phone}`,
                courseName: "Advance AI for Non-Tech Working Professionals",
                totalAmountPaid: successDetails.amount || 5899,
                paymentId: successDetails.paymentId,
                orderId: successDetails.orderId,
              })
            }
            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span>Download Official GST Tax Invoice (PDF)</span>
          </button>
        </div>
      </div>
    );
  }

  // Active Enrollment Form View
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-4 sm:p-6 lg:p-7 shadow-xl relative overflow-hidden text-left">
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-slate-100 pr-8">
        <div>
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-indigo-600 block mb-0.5">
            EXECUTIVE REGISTRATION • 2026 COHORT
          </span>
          <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
            Advance AI for Non-Tech Professionals
          </h3>
        </div>
        <span className="hidden sm:inline-block px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider border border-emerald-200 flex-shrink-0">
          Fast-Track Pass
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-3.5">
        {/* Row 1: Name and Email in 2 columns on sm+ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
          {/* Full Name */}
          <div>
            <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Rahul Sharma"
                className="w-full pl-9 pr-3.5 py-2 sm:py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-medium transition-all"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                placeholder="rahul@company.com"
                className="w-full pl-9 pr-3.5 py-2 sm:py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-medium transition-all"
              />
            </div>
          </div>
        </div>

        {/* Row 2: Mobile Number & Profession in 2 columns on sm+ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
          {/* Mobile Number with Country Code */}
          <div>
            <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Mobile (WhatsApp) <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <div className="w-28 sm:w-32 flex-shrink-0">
                <select
                  value={selectedCountry.iso}
                  onChange={(e) => {
                    const country = countryCodes.find(c => c.iso === e.target.value);
                    if (country) setSelectedCountry(country);
                  }}
                  className="w-full px-2 py-2 sm:py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 text-xs sm:text-sm text-slate-900 font-medium bg-slate-50 transition-all truncate cursor-pointer"
                >
                  {countryCodes.map((c) => (
                    <option key={c.iso} value={c.iso}>
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative flex-grow">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="98765 43210"
                  className="w-full pl-9 pr-3 py-2 sm:py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-medium transition-all"
                />
              </div>
            </div>
          </div>

          {/* Profession / Role Dropdown */}
          <div>
            <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Current Role <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                name="profession"
                value={formData.profession}
                onChange={handleInputChange}
                className="w-full pl-9 pr-3.5 py-2 sm:py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 text-xs sm:text-sm text-slate-900 font-medium bg-white transition-all appearance-none cursor-pointer truncate"
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
                className="mt-1.5 w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-900"
              />
            )}
          </div>
        </div>

        {/* Row 3: Coupon Code Section */}
        <div>
          <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            VIP Subsidy Coupon
          </label>
          <div className="flex gap-2">
            <div className="relative flex-grow">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value.toUpperCase());
                  if (couponError || couponSuccess) {
                    setCouponError("");
                    setCouponSuccess("");
                  }
                }}
                placeholder="Enter coupon code (e.g. AMIABLE)"
                className="w-full pl-9 pr-3.5 py-2 sm:py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 text-xs sm:text-sm uppercase font-mono tracking-wider"
              />
            </div>
            <button
              type="button"
              onClick={() => handleApplyCoupon()}
              className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider flex-shrink-0 shadow-sm transition-all"
            >
              Apply & Reveal
            </button>
          </div>

          {couponSuccess && (
            <div className="mt-2 text-left text-xs font-semibold text-emerald-700 flex items-center gap-1.5 p-2 rounded-xl bg-emerald-50 border border-emerald-200 leading-tight">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>{couponSuccess}</span>
            </div>
          )}

          {couponError && (
            <div className="mt-2 text-left text-xs font-semibold text-red-600 flex items-center gap-1.5 p-2 rounded-xl bg-red-50 border border-red-200 leading-tight">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{couponError}</span>
            </div>
          )}
        </div>

        {/* Dynamic Price Breakdown — ONLY shown once user enters mobile & coupon */}
        {isPriceRevealed ? (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="p-3 sm:p-3.5 rounded-xl bg-gradient-to-r from-indigo-50/90 via-blue-50/60 to-white border border-indigo-200 text-left flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span>Base Tuition: <span className="line-through font-mono">₹{standardPrice.toLocaleString("en-IN")}</span></span>
                  {isVipApplied && (
                    <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[10px] uppercase tracking-wide">
                      Save ₹{discountAmount.toLocaleString("en-IN")} ({appliedCoupon})
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                  {isInternational ? "International Participant (+ 18% GST)" : "Domestic (+91) Participant (+ 18% GST)"}
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg sm:text-xl text-indigo-700 font-mono font-black">
                  ₹{finalPrice.toLocaleString("en-IN")} + GST
                </span>
              </div>
            </div>

            <GstPriceBreakdown
              baseAmount={finalPrice}
              claimGst={claimGst}
              onClaimGstChange={(checked) => {
                setClaimGst(checked);
                if (!checked) setGstError("");
              }}
              gstin={gstin}
              onGstinChange={(val) => {
                setGstin(val);
                if (gstError) setGstError("");
              }}
              companyName={companyName}
              onCompanyNameChange={(val) => {
                setCompanyName(val);
                if (gstError) setGstError("");
              }}
              gstError={gstError}
              theme="light"
            />
          </div>
        ) : (
          <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-dashed border-indigo-200 text-center flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 text-xs">
              <Lock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              <span>Tuition Protected</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Enter mobile & coupon above to reveal rate
            </p>
          </div>
        )}

        {/* Submit & Pay Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 sm:py-3.5 px-6 rounded-xl sm:rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-blue-700 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-lg hover:scale-[1.005] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-75 disabled:pointer-events-none"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Opening Gateway...</span>
            </div>
          ) : !isPriceRevealed ? (
            <div className="flex items-center gap-1.5">
              <Unlock className="w-4 h-4 text-amber-300" />
              <span>Enter Mobile & Reveal Tuition</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-amber-300" />
              <span>Complete Enrollment — ₹{gstBreakdown.totalAmount.toLocaleString("en-IN")} (Incl. GST)</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          )}
        </button>

        {/* Security / Guarantee Trust Badges */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 text-[10px] sm:text-[11px] text-slate-500 pt-0.5">
          <span className="flex items-center gap-1 text-slate-600">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 256-Bit SSL
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-slate-600">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" /> Razorpay Verified
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-slate-600">
            <Mail className="w-3.5 h-3.5 text-blue-600" /> Instant Email Access
          </span>
        </div>
      </form>
    </div>
  );
};

export default ProfessionalRegistrationForm;
