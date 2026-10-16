import React, { useState } from "react";
import {
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Mail,
  Phone,
  User,
  Briefcase,
  Calendar,
  Clock,
  Video,
  ExternalLink,
  MessageSquare
} from "lucide-react";
import { countryCodes, CountryCode } from "../../lib/countryCodes";
import GstPriceBreakdown from "../common/GstPriceBreakdown";
import { calculateGstBreakdown, isAuthorizedTestEmail, isValidEmail, isValidGstin, sanitizeTextInput } from "../../lib/gstUtils";

declare global {
  interface Window {
    Razorpay: any;
    CONSULTING_APPS_SCRIPT_URL?: string;
  }
}

// Target Google Sheet: https://docs.google.com/spreadsheets/d/1LP37n3zb1d0UkXjddQBCKqmSU0j5-HvPSI-Rda36E3s/edit?gid=0#gid=0
// Spreadsheet ID: 1LP37n3zb1d0UkXjddQBCKqmSU0j5-HvPSI-Rda36E3s
// Sheet Name: Sheet1
// Columns: Date and Time | Name | Email | Phone | Profession | Amount | Status | Order ID | Payment ID
const DEFAULT_CONSULTING_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzF4e05xth7Kdzx8gJKXI-vqPgKUSacLE8aGRT8hvg-7B75qvQw_gYwmRacsq3cNIsD/exec";
const CONSULTING_SPREADSHEET_ID = "1LP37n3zb1d0UkXjddQBCKqmSU0j5-HvPSI-Rda36E3s";

const RAZORPAY_KEY_ID = "rzp_live_T2CbVONQc6qrqj";
const RAZORPAY_INTL_KEY_ID = "rzp_live_gfoS1OjC8tvWjP";

const CONSULTING_FEE = 2500; // ₹2,500 per 1 Hour session (+ 18% GST = ₹2,950)

const PROFESSION_OPTIONS = [
  "Business Owner / Founder / MSME",
  "Working Professional (Operations, Sales, HR, Finance)",
  "Executive / Director / Department Head",
  "Freelancer / Agency Owner / Consultant",
  "Product Manager / Tech Professional",
  "Other"
];

const TOPIC_OPTIONS = [
  "AI for Business Operations & Process Automation",
  "Career Acceleration, AI Transition & Salary Leverage",
  "Custom AI Agent / Workflow Architecture",
  "AI Content, Marketing & Lead Generation Funnels",
  "General 1-on-1 AI Advisory & Guidance"
];

interface ConsultingBookingFormProps {
  onSuccess?: () => void;
}

const ConsultingBookingForm: React.FC<ConsultingBookingFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    profession: "Business Owner / Founder / MSME",
    customProfession: "",
    topic: "AI for Business Operations & Process Automation",
    goals: ""
  });

  // GST Invoice fields
  const [claimGst, setClaimGst] = useState(false);
  const [gstin, setGstin] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [gstError, setGstError] = useState("");

  const gstBreakdown = calculateGstBreakdown(CONSULTING_FEE);

  // Country Code State - Default to India (IN / +91)
  const defaultCountry = countryCodes.find(c => c.iso === "IN") || countryCodes.find(c => c.code === "+91") || countryCodes[0];
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(defaultCountry);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [successDetails, setSuccessDetails] = useState<{
    orderId?: string;
    paymentId?: string;
    amount?: number;
    name?: string;
    email?: string;
    phone?: string;
    topic?: string;
  } | null>(null);

  const cleanPhone = formData.phone.replace(/\D/g, "");
  const isPhoneValid = selectedCountry.iso === "IN" || selectedCountry.code === "+91"
    ? cleanPhone.length === 10
    : cleanPhone.length >= 7 && cleanPhone.length <= 15;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGstError("");

    const sanitizedName = sanitizeTextInput(formData.name, 100);
    const sanitizedEmail = formData.email.trim().toLowerCase();
    const sanitizedCompany = claimGst ? sanitizeTextInput(companyName, 120) : "";
    const sanitizedGstin = claimGst ? gstin.trim().toUpperCase() : "";

    if (!sanitizedName) {
      alert("Please enter your full name.");
      return;
    }
    if (!isValidEmail(sanitizedEmail)) {
      alert("Please enter a valid email address.");
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
      formData.profession === "Other"
        ? (formData.customProfession.trim() || "Consulting Client")
        : formData.profession,
      80
    );
    const sanitizedGoals = sanitizeTextInput(formData.goals, 500);

    const currentDateTime = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "medium"
    });

    const isInternational = selectedCountry.iso !== "IN" && selectedCountry.code !== "+91";
    const isTestEmail = isAuthorizedTestEmail(sanitizedEmail);
    const payableInr = isTestEmail ? 1 : gstBreakdown.totalAmount;
    const amountInPaise = payableInr * 100;
    let generatedOrderId = `ORD_CONSULT_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const scriptUrl = window.CONSULTING_APPS_SCRIPT_URL || DEFAULT_CONSULTING_APPS_SCRIPT_URL;

    // Col A: Date and Time | Col B: Name | Col C: Email | Col D: Phone | Col E: Profession | Col F: Amount | Col G: Status | Col H: Order ID | Col I: Payment ID
    const leadPayload = {
      dateTime: currentDateTime,
      name: sanitizedName,
      email: sanitizedEmail,
      phone: fullPhone,
      profession: `${finalProfession} (${formData.topic})`,
      baseAmount: isTestEmail ? 1 : gstBreakdown.baseAmount,
      gstAmount: isTestEmail ? 0 : gstBreakdown.gstAmount,
      amount: payableInr,
      companyName: sanitizedCompany,
      gstin: sanitizedGstin,
      status: "INITIATED",
      orderId: generatedOrderId,
      paymentId: "",
      notes: sanitizedGoals,
      spreadsheetId: CONSULTING_SPREADSHEET_ID
    };

    try {
      // 1. Log to Apps Script if webhook is active
      if (scriptUrl) {
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
          fetch(scriptUrl, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(leadPayload)
          }).catch(() => {});
        }
      }

      // 2. Load Razorpay Gateway
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        alert("Payment gateway failed to load. Please verify your connection.");
        setIsSubmitting(false);
        return;
      }

      // 3. Razorpay Options
      const options = {
        key: isInternational ? RAZORPAY_INTL_KEY_ID : RAZORPAY_KEY_ID,
        order_id: generatedOrderId.startsWith("order_") ? generatedOrderId : undefined,
        amount: amountInPaise,
        currency: "INR",
        name: "Tech Tycoon Digital Solutions",
        description: `1-on-1 AI Strategy Session (1 Hour, Incl. 18% GST) - ${formData.topic}`,
        prefill: {
          name: sanitizedName,
          email: sanitizedEmail,
          contact: fullPhone
        },
        notes: {
          service: "1-on-1 AI Consultation (1 Hour)",
          profession: finalProfession,
          topic: formData.topic,
          goals: sanitizedGoals,
          base_amount: String(gstBreakdown.baseAmount),
          gst_amount: String(gstBreakdown.gstAmount),
          gstin: sanitizedGstin || "N/A",
          company_name: sanitizedCompany || "N/A",
          spreadsheetId: CONSULTING_SPREADSHEET_ID
        },
        theme: {
          color: "#0f172a" // Premium Slate / Navy
        },
        handler: async function (response: any) {
          setIsSubmitting(false);
          const payId = response.razorpay_payment_id || `PAID_${Date.now()}`;
          const ordId = response.razorpay_order_id || generatedOrderId;

          // 4. Update Google Sheet status to PAID
          if (scriptUrl) {
            const successPayload = {
              paymentSuccess: true,
              razorpay_payment_id: payId,
              razorpay_order_id: ordId,
              razorpay_signature: response.razorpay_signature || "",
              email: sanitizedEmail,
              name: sanitizedName,
              phone: fullPhone,
              profession: `${finalProfession} (${formData.topic})`,
              baseAmount: isTestEmail ? 1 : gstBreakdown.baseAmount,
              gstAmount: isTestEmail ? 0 : gstBreakdown.gstAmount,
              amount: payableInr,
              companyName: sanitizedCompany,
              gstin: sanitizedGstin,
              spreadsheetId: CONSULTING_SPREADSHEET_ID
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
          }

          setSuccessDetails({
            orderId: ordId,
            paymentId: payId,
            amount: payableInr,
            name: sanitizedName,
            email: sanitizedEmail,
            phone: fullPhone,
            topic: formData.topic
          });
          setPaymentSuccess(true);
          if (onSuccess) onSuccess();
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
        alert(`Payment Failed: ${failResponse.error?.description || "Transaction incomplete."}`);
      });
      rzp.open();

    } catch (err) {
      console.error("Consultation booking error:", err);
      setIsSubmitting(false);
      alert("An unexpected error occurred. Please try again.");
    }
  };

  // Payment Confirmation Card
  if (paymentSuccess && successDetails) {
    return (
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-5 sm:p-8 shadow-2xl text-center max-w-xl mx-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider mb-2">
          Consultation Confirmed • Slot Reserved
        </span>

        <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
          1-on-1 AI Strategy Session Booked!
        </h3>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-2 mb-4 text-xs sm:text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Client:</span>
            <span className="font-bold text-slate-900">{successDetails.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Email:</span>
            <span className="font-bold text-slate-900">{successDetails.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Phone:</span>
            <span className="font-bold text-slate-900">{successDetails.phone}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Focus Topic:</span>
            <span className="font-semibold text-indigo-700 truncate max-w-[200px]">{successDetails.topic}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Order ID:</span>
            <span className="font-mono text-slate-700 text-xs">{successDetails.orderId}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Payment ID:</span>
            <span className="font-mono text-slate-700 text-xs">{successDetails.paymentId}</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <span className="text-slate-600 font-bold">Investment Paid:</span>
            <span className="font-black text-emerald-700 text-base">₹{successDetails.amount?.toLocaleString()} (1 Hour)</span>
          </div>
        </div>

        {/* Scheduling Instructions */}
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-left mb-5 space-y-1.5">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wide">
            <Video className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>Next Step: Scheduling Your 1-on-1 Call</span>
          </div>
          <p className="text-xs text-amber-950 leading-relaxed">
            Our scheduling coordinator will contact you directly on WhatsApp (<strong>{successDetails.phone}</strong>) within <strong>2 to 4 business hours</strong> to lock in your preferred Google Meet / Zoom slot and send the invite.
          </p>
        </div>

        <a
          href="https://wa.me/919940306161?text=Hi%20Tech%20Tycoon%20Team%2C%20I%20have%20booked%20a%201-on-1%20AI%20Consulting%20session.%20Order%20ID%3A%20"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all"
        >
          <Phone className="w-4 h-4" />
          <span>Connect via WhatsApp Support</span>
        </a>
      </div>
    );
  }

  // Active Booking Form
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xl relative overflow-hidden text-left">
      {/* Form Header */}
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
        <div>
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-indigo-600 block mb-0.5">
            PRIVATE 1-ON-1 APPOINTMENT
          </span>
          <h3 className="text-base sm:text-xl font-black text-slate-900 leading-tight">
            Reserve Your 1-Hour AI Strategy Session
          </h3>
        </div>
        <div className="text-right flex-shrink-0">
          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 text-[11px] font-bold uppercase tracking-wider border border-slate-200 block">
            ₹2,500 + 18% GST / 60 Mins
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-3.5">
        {/* Row 1: Name and Email */}
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
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-medium transition-all"
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
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-medium transition-all"
              />
            </div>
          </div>
        </div>

        {/* Row 2: Mobile Number & Profession */}
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
                  className="w-full px-2 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 text-xs sm:text-sm text-slate-900 font-medium bg-slate-50 transition-all truncate cursor-pointer"
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
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-medium transition-all"
                />
              </div>
            </div>
          </div>

          {/* Profession / Role */}
          <div>
            <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Your Current Role / Domain <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                name="profession"
                value={formData.profession}
                onChange={handleInputChange}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 text-xs sm:text-sm text-slate-900 font-medium bg-white transition-all appearance-none cursor-pointer truncate"
              >
                {PROFESSION_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {formData.profession === "Other" && (
              <input
                type="text"
                name="customProfession"
                value={formData.customProfession}
                onChange={handleInputChange}
                placeholder="Specify your exact role / business"
                className="mt-1.5 w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-900"
              />
            )}
          </div>
        </div>

        {/* Primary Consultation Topic */}
        <div>
          <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Primary Goal for This Call <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              name="topic"
              value={formData.topic}
              onChange={handleInputChange}
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 text-xs sm:text-sm text-slate-900 font-medium bg-white transition-all appearance-none cursor-pointer truncate"
            >
              {TOPIC_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Specific Questions / Notes */}
        <div>
          <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            What challenges would you like to solve? <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <textarea
              name="goals"
              rows={2}
              value={formData.goals}
              onChange={handleInputChange}
              placeholder="e.g. I run an e-commerce agency and want to automate client reporting, or I am a Product Manager looking to master AI agents."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-medium transition-all resize-none"
            />
          </div>
        </div>

        {/* Summary Pricing Card */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <div>
              <div className="text-xs font-bold">1-on-1 Consultation Session</div>
              <div className="text-[11px] text-slate-300">60 Minutes Deep Dive via Zoom / Google Meet</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-300">Base Fee (+ 18% GST):</div>
            <div className="text-lg sm:text-xl font-mono font-black text-amber-300">
              ₹{CONSULTING_FEE.toLocaleString("en-IN")} + GST
            </div>
          </div>
        </div>

        <GstPriceBreakdown
          baseAmount={CONSULTING_FEE}
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

        {/* Submit & Pay Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 px-6 rounded-xl sm:rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-blue-700 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 hover:scale-[1.005] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-75 disabled:pointer-events-none"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Securing Slot & Opening Payment Gateway...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span>Book 1-on-1 Session — ₹{gstBreakdown.totalAmount.toLocaleString("en-IN")} (Incl. GST)</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          )}
        </button>

        {/* Trust & Guarantee Badges */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 text-[10px] sm:text-[11px] text-slate-500 pt-0.5">
          <span className="flex items-center gap-1 text-slate-600">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 256-Bit SSL Secured
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-slate-600">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" /> Verified Razorpay
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-slate-600">
            <Video className="w-3.5 h-3.5 text-blue-600" /> Private Call Recording Included
          </span>
        </div>
      </form>
    </div>
  );
};

export default ConsultingBookingForm;
