import React, { useState } from 'react';
import { 
  ShieldCheck, ArrowRight, Rocket, X, ChevronDown, Search, Tag, Check, Infinity, Video, Code, Award, Heart, Gift
} from 'lucide-react';
import { countryCodes, CountryCode } from '../lib/countryCodes';
import { useNavigate } from 'react-router-dom';
import SocialProofToast from '../components/common/SocialProofToast';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwl1WKBrQxxMRbz7aj6GBUNbmR4ePHshhrBwcNjhxorIayQpMTmHaHHT_MvTroQ-ZrFbA/exec";
const RAZORPAY_KEY_ID = "rzp_live_T2CbVONQc6qrqj";
const RAZORPAY_INTL_KEY_ID = "rzp_live_gfoS1OjC8tvWjP";

export default function AcademyPreRegisterPage() {
  const navigate = useNavigate();

  // Secret Coupon Code State: "AMIABLE" (Not default entered, empty by default)
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  // Form & Registration Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(
    countryCodes.find(c => c.code === "+91") || countryCodes[0]
  );
  const [countrySearch, setCountrySearch] = useState("");
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Dynamic Pricing & Mobile Number Validation Logic
  const cleanPhone = formData.phone.replace(/\D/g, '');
  const isPhoneFullyEntered = selectedCountry.code === '+91'
    ? cleanPhone.length === 10
    : (cleanPhone.length >= 6 && cleanPhone.length <= 15);

  const isInternational = selectedCountry.code !== '+91';
  const isCouponValid = appliedCoupon.trim().toUpperCase() === "AMIABLE";

  // Domestic (+91): ₹4,999 standard, ₹2,499 with AMIABLE
  // International (other): ₹8,000 standard, ₹4,000 with AMIABLE
  const actualPrice = isInternational ? 8000 : 4999;
  const offerPrice = isCouponValid ? (isInternational ? 4000 : 2499) : actualPrice;
  const savings = actualPrice - offerPrice;

  const filteredCountries = countryCodes.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.code.includes(countrySearch)
  );

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    setCouponSuccess("");

    const cleaned = couponInput.trim().toUpperCase();
    if (!cleaned) {
      setAppliedCoupon("");
      return;
    }

    if (cleaned === "AMIABLE") {
      setAppliedCoupon("AMIABLE");
      const discountVal = selectedCountry.code !== '+91' ? 4000 : 2499;
      setCouponSuccess(`✓ Secret Member Coupon 'AMIABLE' Applied! 50% Existing Learner Offer Unlocked (₹${discountVal.toLocaleString()}) 🎉`);
    } else {
      setCouponError("Invalid coupon code.");
      setAppliedCoupon("");
    }
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!isPhoneFullyEntered) {
      setErrorMsg('Please enter your complete mobile number to proceed');
      return;
    }

    if (!formData.name.trim() || !formData.email.trim()) {
      setErrorMsg('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    const fullPhone = selectedCountry.code + cleanPhone;

    const testEmails = ["ambroseselva001@gmail.com", "techtycoondigitalsolutions@gmail.com"];
    const isTestEmail = testEmails.includes(formData.email.toLowerCase().trim());
    const finalAmount = isTestEmail ? 1 : offerPrice; // ₹1 test, else calculated offerPrice
    const amountInPaise = finalAmount * 100;

    try {
      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded) {
        alert('Razorpay payment gateway failed to load. Please check your internet connection.');
        setIsSubmitting(false);
        return;
      }

      const payloadData = {
        name: formData.name,
        email: formData.email,
        phone: fullPhone,
        countryCode: selectedCountry.code,
        isInternational: isInternational,
        course: "TECH TYCOON Academy",
        modeOfSession: "TECH TYCOON Academy Pre-Registration (Udemy Platform Access)",
        amount: finalAmount,
        batch: "TECH TYCOON Academy Launch Sept 10",
        promoCode: appliedCoupon,
        pageUrl: window.location.href
      };

      let orderId = "";
      try {
        const orderRes = await fetch(APPS_SCRIPT_URL, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(payloadData)
        });

        const orderData = await orderRes.json();
        if (orderData && orderData.orderId) {
          orderId = orderData.orderId;
        }
      } catch (err) {
        console.warn("Standard fetch notice, sending backup no-cors request", err);
        fetch(APPS_SCRIPT_URL, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(payloadData)
        }).catch(() => {});
      }

      const options = {
        key: isInternational ? RAZORPAY_INTL_KEY_ID : RAZORPAY_KEY_ID,
        order_id: orderId || undefined,
        amount: amountInPaise,
        currency: "INR",
        name: "TECH TYCOON Academy",
        description: `Pre-Register Access ${appliedCoupon ? `(Coupon ${appliedCoupon})` : ''} — Launch Sept 10th`,
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: fullPhone
        },
        theme: {
          color: "#0EA5E9" // Light Blue Brand Accent
        },
        handler: function (response: any) {
          setIsSubmitting(false);
          setIsModalOpen(false);
          const paymentId = response.razorpay_payment_id || "PAID";
          const rzpOrderId = response.razorpay_order_id || orderId;

          const successPayload = {
            paymentSuccess: true,
            razorpay_payment_id: paymentId,
            razorpay_order_id: rzpOrderId,
            email: formData.email,
            name: formData.name,
            phone: fullPhone,
            amount: finalAmount,
            promoCode: appliedCoupon
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

          const thankYouUrl = `/claude_masterclass/thank-you?name=${encodeURIComponent(formData.name)}&email=${encodeURIComponent(formData.email)}&phone=${encodeURIComponent(fullPhone)}&paymentId=${encodeURIComponent(paymentId)}&amount=${finalAmount}&course=${encodeURIComponent("TECH TYCOON Academy")}&coupon=${encodeURIComponent(appliedCoupon)}&orderId=${encodeURIComponent(rzpOrderId)}`;

          navigate(thankYouUrl, {
            state: {
              name: formData.name,
              email: formData.email,
              phone: fullPhone,
              amount: finalAmount,
              paymentId: paymentId,
              orderId: rzpOrderId,
              coupon: appliedCoupon,
              course: "TECH TYCOON Academy"
            }
          });
        },
        modal: {
          ondismiss: function() {
            setIsSubmitting(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert('An error occurred initializing payment. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between selection:bg-sky-500 selection:text-white">
      
      <div>
        {/* 🚀 Clean Announcement Top Bar */}
        <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-sky-600 text-white text-[11px] sm:text-xs py-2 px-3 text-center shadow-sm flex items-center justify-center gap-2 leading-tight">
          <Heart className="w-3.5 h-3.5 text-rose-200 fill-rose-200 shrink-0 animate-pulse" />
          <span>
            <strong>FOR EXISTING LEARNERS:</strong> Exclusive 50% OFF Gratitude Offer for Sept 10th Launch!
          </span>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1 text-[10px] bg-white text-sky-700 font-bold px-2.5 py-0.5 rounded-full hover:bg-sky-50 transition-all ml-1 shadow-sm shrink-0"
          >
            Claim 50% Off <ArrowRight className="w-2.5 h-2.5" />
          </button>
        </div>

        {/* 🧭 Clean Navbar */}
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/90 border-b border-sky-100 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center shadow-md shadow-sky-500/20 shrink-0">
                <Rocket className="w-4 h-4 text-white" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-slate-900 via-sky-900 to-blue-800 bg-clip-text text-transparent">
                  TECH TYCOON
                </span>
                <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded-full border border-sky-200">
                  ACADEMY
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all shadow-md shadow-sky-500/20 flex items-center gap-1 border border-sky-400/30"
            >
              <span>Pre-Register</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* 🌟 Ultra-Clean Minimal Hero Section */}
        <section className="relative overflow-hidden py-10 sm:py-16 bg-gradient-to-b from-sky-50/50 via-white to-slate-50">
          {/* Subtle Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-100/60 rounded-full blur-[120px] pointer-events-none" />

          <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center space-y-5">
            
            {/* Existing Learners 50% OFF Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100/80 border border-sky-200 text-sky-800 text-[11px] sm:text-xs font-bold shadow-sm">
              <Gift className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span>50% OFF Offer for Our Existing Learners</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Master <span className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">Claude & AI Engineering</span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto font-medium">
              Exclusive detailed Claude sessions & lifetime platform access. 
              <span className="block text-sky-700 font-bold mt-1">Special 50% OFF pre-registration offer for our existing learners.</span>
            </p>

            {/* Main Action Bar */}
            <div className="pt-2 flex justify-center max-w-xs mx-auto">
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-gradient-to-r from-sky-500 via-blue-600 to-sky-600 hover:from-sky-600 hover:to-blue-700 text-white font-extrabold text-base px-8 py-3.5 rounded-xl shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2 border border-sky-400/30 transform hover:-translate-y-0.5"
              >
                <span>Pre-Register Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 flex items-center justify-center gap-1 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>256-Bit SSL Encrypted • Secret 50% coupon code applicable at checkout</span>
            </p>

            {/* Clean 4 Key Feature Pillars */}
            <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto text-left">
              <div className="bg-white border border-sky-100 p-3 rounded-xl shadow-sm space-y-0.5">
                <div className="text-sky-600 font-bold text-xs flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-sky-500 shrink-0" /> Detailed Claude Sessions
                </div>
                <p className="text-[11px] text-slate-500">Claude Sonnet & Code CLI</p>
              </div>

              <div className="bg-white border border-sky-100 p-3 rounded-xl shadow-sm space-y-0.5">
                <div className="text-blue-600 font-bold text-xs flex items-center gap-1.5">
                  <Code className="w-4 h-4 shrink-0" /> MCP & AI Agents
                </div>
                <p className="text-[11px] text-slate-500">Custom servers & workflows</p>
              </div>

              <div className="bg-white border border-sky-100 p-3 rounded-xl shadow-sm space-y-0.5">
                <div className="text-emerald-600 font-bold text-xs flex items-center gap-1.5">
                  <Award className="w-4 h-4 shrink-0" /> Certificate Included
                </div>
                <p className="text-[11px] text-slate-500">Official completion credentials</p>
              </div>

              <div className="bg-white border border-sky-100 p-3 rounded-xl shadow-sm space-y-0.5">
                <div className="text-sky-700 font-bold text-xs flex items-center gap-1.5">
                  <Infinity className="w-4 h-4 text-sky-600 shrink-0" /> Lifetime Access
                </div>
                <p className="text-[11px] text-slate-500">Unlimited course portal access</p>
              </div>
            </div>

          </div>
        </section>
      </div>

      {/* 🛒 Pre-Registration Payment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="bg-white border border-sky-200 rounded-2xl max-w-md w-full p-4 sm:p-5 shadow-2xl relative space-y-3 my-auto text-slate-900">
            
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-700 bg-slate-100 p-1.5 rounded-full border border-slate-200 transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="space-y-0.5 pr-6">
              <div className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full border border-sky-200">
                <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> Existing Learner 50% Privilege
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                TECH TYCOON Academy Pre-Registration
              </h3>
            </div>

            {/* Secret Coupon Box */}
            <div className="bg-sky-50/70 border border-sky-200 p-2.5 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-700">
                <span className="font-semibold flex items-center gap-1">
                  <Tag className="w-3 h-3 text-sky-600 shrink-0" /> Existing Member Coupon Code?
                </span>
                {appliedCoupon && (
                  <span className="text-emerald-600 font-bold text-[10px] flex items-center gap-1">
                    <Check className="w-3 h-3" /> {appliedCoupon} Applied
                  </span>
                )}
              </div>

              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Enter secret coupon code..."
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  className="flex-1 bg-white border border-sky-200 rounded-lg px-2.5 py-1 text-xs text-slate-900 uppercase tracking-wider font-mono focus:outline-none focus:border-sky-500 h-8"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-3 py-1 rounded-lg transition-all h-8"
                >
                  Apply
                </button>
              </div>

              {couponSuccess && (
                <p className="text-[10px] text-emerald-600 font-semibold">{couponSuccess}</p>
              )}
              {couponError && (
                <p className="text-[10px] text-rose-600">{couponError}</p>
              )}
            </div>

            {/* Dynamic Price Summary Banner: Revealed ONLY once mobile number is entered fully */}
            {isPhoneFullyEntered && (
              <div className="bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 p-2.5 rounded-xl flex items-center justify-between text-xs animate-fadeIn">
                <div>
                  <span className="text-slate-500 text-[10px]">Price: </span>
                  <span className="text-slate-900 font-bold text-base">₹{offerPrice.toLocaleString()}</span>
                  {isCouponValid && (
                    <span className="text-slate-400 line-through text-[11px] ml-1">₹{actualPrice.toLocaleString()}</span>
                  )}
                </div>
                <div>
                  {isCouponValid ? (
                    <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                      SAVE 50% (₹{savings.toLocaleString()})
                    </span>
                  ) : (
                    <span className="bg-slate-200 text-slate-700 text-[10px] px-2 py-0.5 rounded border border-slate-300">
                      {isInternational ? "International Rate" : "Standard Rate"}
                    </span>
                  )}
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-[11px] p-2 rounded-lg">
                {errorMsg}
              </div>
            )}

            {/* Clean 3-Field Form */}
            <form onSubmit={handleRegisterSubmit} className="space-y-2.5">
              
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                  Full Name <span className="text-sky-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ambrose Selva"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 focus:border-sky-500 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500 h-9"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                  Email Address <span className="text-sky-600">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. name@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 focus:border-sky-500 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500 h-9"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                  Mobile / WhatsApp Number <span className="text-sky-600">*</span>
                </label>
                
                <div className="flex gap-1.5">
                  {/* Country Selector */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                      className="bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-lg px-2 py-1 text-xs text-slate-800 flex items-center gap-1 h-9"
                    >
                      <span>{selectedCountry.flag}</span>
                      <span>{selectedCountry.code}</span>
                      <ChevronDown className="w-3 h-3 text-slate-500" />
                    </button>

                    {isCountryDropdownOpen && (
                      <div className="absolute left-0 bottom-full mb-1 w-60 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto p-2 space-y-1">
                        <div className="relative">
                          <Search className="w-3 h-3 text-slate-400 absolute left-2 top-2" />
                          <input
                            type="text"
                            placeholder="Search country..."
                            value={countrySearch}
                            onChange={(e) => setCountrySearch(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded pl-7 pr-2 py-1 text-xs text-slate-900 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-0.5">
                          {filteredCountries.map((c, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => {
                                setSelectedCountry(c);
                                setIsCountryDropdownOpen(false);
                                if (appliedCoupon.trim().toUpperCase() === "AMIABLE") {
                                  const discountVal = c.code !== '+91' ? 4000 : 2499;
                                  setCouponSuccess(`✓ Secret Member Coupon 'AMIABLE' Applied! 50% Existing Learner Offer Unlocked (₹${discountVal.toLocaleString()}) 🎉`);
                                }
                              }}
                              className="w-full text-left px-2 py-1 hover:bg-sky-50 rounded text-xs flex items-center justify-between text-slate-700"
                            >
                              <span>{c.flag} {c.name}</span>
                              <span className="text-sky-600 font-mono text-[11px]">{c.code}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <input
                    type="tel"
                    required
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="flex-1 bg-slate-50 border border-slate-300 focus:border-sky-500 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500 h-9"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-sky-500 via-blue-600 to-sky-600 hover:from-sky-600 hover:to-blue-700 text-white font-extrabold py-2.5 rounded-xl shadow-md shadow-sky-500/25 transition-all flex items-center justify-center gap-1.5 border border-sky-400/30 disabled:opacity-50 text-xs sm:text-sm h-10 mt-1"
              >
                {isSubmitting ? (
                  <span>Processing Checkout...</span>
                ) : (
                  <>
                    <span>
                      {isPhoneFullyEntered 
                        ? `Proceed to Pay ₹${offerPrice.toLocaleString()}`
                        : 'Proceed to Pay'
                      }
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              <div className="text-center text-[10px] text-slate-500 font-medium">
                🔒 256-Bit SSL Encrypted Razorpay Checkout
              </div>

            </form>

          </div>
        </div>
      )}

      {/* 🦶 Clean Footer */}
      <footer className="border-t border-sky-100 bg-white py-4 text-xs text-slate-500 mt-auto">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-sky-600 flex items-center justify-center text-white font-bold text-xs">
              TT
            </div>
            <span className="font-bold text-xs text-slate-900">TECH TYCOON Academy</span>
          </div>

          <div className="text-slate-500 text-[11px]">
            © {new Date().getFullYear()} TECH TYCOON Academy. All rights reserved. Launching Sept 10.
          </div>

        </div>
      </footer>

      {/* Social Proof Component */}
      <SocialProofToast />

    </div>
  );
}
