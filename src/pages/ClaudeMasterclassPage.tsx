import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Calendar, Clock, UserCheck, ShieldCheck, 
  Crown, Check, X, ChevronDown, Globe, Lock,
  Zap, Plug, Terminal, Laptop, Gift, FileCode, Award, ArrowRight, Star,
  User, Mail, Phone, Briefcase, ArrowLeft, Video, CheckCircle2, MessageSquare
} from 'lucide-react';
import techTycoonLogo from '../assets/tech_tycoon_logo.png';
import antonyPraveenPhoto from '../assets/antony_praveen.jpg';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const APPS_SCRIPT_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbwP2rffwhgGYQjJFlfxYU4XHt-jFbUlWtYPAJOZcxIO--yvw2NTlnLvJDHHh4_giLq7/exec";

const ClaudeMasterclassPage: React.FC = () => {
  // Countdown Timer State
  const [timeLeft, setTimeLeft] = useState({ days: '00', hours: '00', minutes: '00', seconds: '00' });
  
  // Modal State & Step Flow (Step 1: Choose Pass, Step 2: Fill Form)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<1 | 2>(1);
  const [selectedPlan, setSelectedPlan] = useState<299 | 999>(299);

  // User Form Inputs
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    profession: '',
    agreeWhatsapp: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  // Target Date: July 25, 2026 @ 17:00 IST
  useEffect(() => {
    const targetDate = new Date('2026-07-25T17:00:00+05:30').getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({
          days: String(days).padStart(2, '0'),
          hours: String(hours).padStart(2, '0'),
          minutes: String(minutes).padStart(2, '0'),
          seconds: String(seconds).padStart(2, '0')
        });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  // FAQ Accordion State
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const handleOpenModal = (plan: 299 | 999 = 299) => {
    setSelectedPlan(plan);
    setModalStep(1);
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
      if (name === 'phone' && value.replace(/\D/g, '').length === 10) {
        setPhoneError('');
      }
    }
  };

  const handleStep1Proceed = () => {
    setModalStep(2);
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

  const handleProceedPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = formData.phone.replace(/\D/g, '');
    
    if (cleanPhone.length !== 10) {
      setPhoneError('Please enter a valid 10-digit phone number');
      return;
    }
    setPhoneError('');

    if (!formData.name || !formData.email || !formData.profession) {
      alert('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded) {
        alert('Razorpay SDK failed to load. Please check your internet connection.');
        setIsSubmitting(false);
        return;
      }

      // Step 1: Call Google Apps Script Web App
      let orderId = "";
      try {
        const orderRes = await fetch(APPS_SCRIPT_WEBAPP_URL, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            profession: formData.profession,
            language: "Tamil (தமிழ்)",
            amount: selectedPlan
          })
        });

        const orderData = await orderRes.json();
        if (orderData && orderData.orderId) {
          orderId = orderData.orderId;
        }
      } catch (err) {
        console.warn("Could not generate order ID from backend, falling back to direct Razorpay modal", err);
      }

      // Step 2: Open Razorpay Live Payment Modal
      const options: any = {
        key: "rzp_live_T2CbVONQc6qrqj",
        amount: selectedPlan * 100,
        currency: "INR",
        name: "Claude Masterclass 2026",
        description: selectedPlan === 999 
          ? "VIP All-Access Pass (Live + Recordings + Source Code)" 
          : "Standard Live Session Pass",
        image: "https://aitycoon.in/images/tech_tycoon_logo.png",
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: "#D85A30"
        },
        handler: async function (response: any) {
          try {
            await fetch(APPS_SCRIPT_WEBAPP_URL, {
              method: "POST",
              headers: { "Content-Type": "text/plain;charset=utf-8" },
              body: JSON.stringify({
                paymentSuccess: true,
                razorpay_order_id: response.razorpay_order_id || orderId,
                razorpay_payment_id: response.razorpay_payment_id,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                amount: selectedPlan
              })
            });
          } catch (e) {
            console.error("Failed to notify backend of payment success", e);
          }

          alert(`🎉 Payment Successful!\nPayment ID: ${response.razorpay_payment_id}\n\nYour registration is confirmed. Check your email & WhatsApp for Zoom details.`);
          setIsModalOpen(false);
          setIsSubmitting(false);
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
          }
        }
      };

      if (orderId) {
        options.order_id = orderId;
      }

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert('Error initiating payment. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F4EE] text-[#1F1E1C] font-sans selection:bg-[#D85A30] selection:text-white pb-20 md:pb-0">
      
      {/* Top Announcement Bar */}
      <div className="bg-[#1F1E1C] text-[#F7F4EE] py-2.5 px-4 text-xs md:text-sm font-medium border-b border-[#33312E]">
        <div className="max-w-6xl mx-auto flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="bg-[#D85A30] text-white px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider">
              Founding batch
            </span>
            <span>Join the inaugural 2-day live Claude Masterclass</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-[#C5C0B8]">
            <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-[#D85A30]" /> 100% Tamil (தமிழ்)</span>
            <span className="hidden sm:flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-[#D85A30]" /> July 25 & 26, 2026</span>
          </div>
        </div>
      </div>

      {/* Sticky Header / Navigation */}
      <header className="sticky top-0 z-40 bg-[#F7F4EE]/90 backdrop-blur-md border-b border-[#E6E2D9] py-3.5 px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={techTycoonLogo} alt="Tech Tycoon Digital Solutions" className="h-10 w-auto rounded-lg bg-white p-1 border border-[#E6E2D9] shadow-sm object-contain" />
            <div>
              <div className="font-bold text-base tracking-tight text-[#1F1E1C] leading-none">Claude Masterclass</div>
              <div className="text-[11px] text-[#6E6B65] font-medium mt-0.5">by Tech Tycoon</div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4 text-xs text-[#524F4A]">
              <span>July 25 & 26</span>
              <span className="w-1 h-1 rounded-full bg-[#C5C0B8]"></span>
              <span>5:00 PM – 8:30 PM IST</span>
            </div>
            <button 
              onClick={() => handleOpenModal(299)}
              className="bg-[#D85A30] hover:bg-[#C04E27] text-white font-semibold px-4 py-2 rounded-xl text-xs transition-all shadow-sm flex items-center gap-1.5"
            >
              Join founding batch <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION — Two Column Layout */}
      <section className="py-12 md:py-20 px-6 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-12 gap-10 items-center">
          
          {/* Hero Left Column: Copy & Primary CTA */}
          <div className="md:col-span-7 space-y-6">
            
            <div className="inline-flex items-center gap-2 bg-[#EFECE6] border border-[#E0DCD3] px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#524F4A]">
              <Sparkles className="w-3.5 h-3.5 text-[#D85A30]" />
              <span>Founding batch • Small group size</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#1F1E1C] tracking-tight leading-[1.15]">
              Master <span className="text-[#D85A30]">Claude AI</span>, MCPs & Code Automation in 2 Days
            </h1>

            <p className="text-base sm:text-lg text-[#524F4A] leading-relaxed max-w-xl">
              Learn how to build custom Model Context Protocols (MCP), prompt like an expert, construct web applications, and automate complex workflows with Anthropic's Claude 3.5.
            </p>

            {/* Direct Access Note */}
            <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[#2C2A29] bg-[#EFECE6]/60 p-3 rounded-xl border border-[#E6E2D9]">
              <CheckCircle2 className="w-4 h-4 text-[#D85A30] shrink-0" />
              <span>Direct access to Antony across both days • Live Q&A and practical exercises</span>
            </div>

            {/* Hero CTA & Secondary Action */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button 
                onClick={() => handleOpenModal(299)}
                className="bg-[#D85A30] hover:bg-[#C04E27] text-white font-bold py-3.5 px-7 rounded-xl text-base transition-all shadow-md flex items-center justify-center gap-2"
              >
                Join founding batch <ArrowRight className="w-4 h-4" />
              </button>
              <a 
                href="#curriculum"
                className="bg-white hover:bg-[#EFECE6] text-[#1F1E1C] font-semibold py-3.5 px-6 rounded-xl text-sm border border-[#E6E2D9] transition-all text-center flex items-center justify-center gap-2"
              >
                View curriculum
              </a>
            </div>

            {/* Honest Scoped Trust Stat */}
            <div className="pt-3 flex items-center gap-3 text-xs text-[#6E6B65]">
              <div className="flex -space-x-2">
                <div className="w-7 h-7 rounded-full bg-[#D85A30] text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#F7F4EE]">AP</div>
                <div className="w-7 h-7 rounded-full bg-[#1F1E1C] text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#F7F4EE]">TT</div>
              </div>
              <span><strong>5,000+ students trained</strong> (career total across AI sessions)</span>
            </div>

          </div>

          {/* Hero Right Column: Info Card & Countdown */}
          <div className="md:col-span-5">
            <div className="bg-white border border-[#E6E2D9] rounded-2xl p-6 sm:p-7 shadow-sm space-y-6">
              
              <div className="flex justify-between items-center border-b border-[#F0ECE1] pb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#6E6B65]">Session Details</span>
                <span className="bg-[#F7F4EE] text-[#D85A30] font-bold text-xs px-2.5 py-1 rounded-lg border border-[#E6E2D9]">
                  Live Zoom
                </span>
              </div>

              {/* Grid Info */}
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-[#F7F4EE] border border-[#E6E2D9] flex items-center justify-center text-[#D85A30] shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block font-bold text-[#1F1E1C]">Date & Days</strong>
                    <span className="text-xs text-[#524F4A]">July 25 & 26, 2026 (Saturday & Sunday)</span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-[#F7F4EE] border border-[#E6E2D9] flex items-center justify-center text-[#6B4FBB] shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block font-bold text-[#1F1E1C]">Timing</strong>
                    <span className="text-xs text-[#524F4A]">5:00 PM – 8:30 PM IST (3.5 Hours / day)</span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-[#F7F4EE] border border-[#E6E2D9] flex items-center justify-center text-[#D85A30] shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block font-bold text-[#1F1E1C]">Medium of Instruction</strong>
                    <span className="text-xs text-[#524F4A]">100% Tamil (தமிழ்)</span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-[#F7F4EE] border border-[#E6E2D9] flex items-center justify-center text-[#6B4FBB] shrink-0">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block font-bold text-[#1F1E1C]">Lead Instructor</strong>
                    <span className="text-xs text-[#524F4A]">Mr. Antony Praveen (Founder, Tech Tycoon)</span>
                  </div>
                </div>
              </div>

              {/* Countdown Timer Widget */}
              <div className="bg-[#F7F4EE] border border-[#E6E2D9] rounded-xl p-4 text-center">
                <span className="text-[11px] font-semibold text-[#6E6B65] uppercase tracking-wider block mb-2">Live Session Starts In</span>
                <div className="grid grid-cols-4 gap-2">
                  <div className="bg-white border border-[#E6E2D9] rounded-lg py-2">
                    <span className="text-xl font-bold text-[#1F1E1C] block leading-none">{timeLeft.days}</span>
                    <span className="text-[9px] text-[#6E6B65] uppercase">Days</span>
                  </div>
                  <div className="bg-white border border-[#E6E2D9] rounded-lg py-2">
                    <span className="text-xl font-bold text-[#1F1E1C] block leading-none">{timeLeft.hours}</span>
                    <span className="text-[9px] text-[#6E6B65] uppercase">Hours</span>
                  </div>
                  <div className="bg-white border border-[#E6E2D9] rounded-lg py-2">
                    <span className="text-xl font-bold text-[#1F1E1C] block leading-none">{timeLeft.minutes}</span>
                    <span className="text-[9px] text-[#6E6B65] uppercase">Mins</span>
                  </div>
                  <div className="bg-white border border-[#E6E2D9] rounded-lg py-2">
                    <span className="text-xl font-bold text-[#1F1E1C] block leading-none">{timeLeft.seconds}</span>
                    <span className="text-[9px] text-[#6E6B65] uppercase">Secs</span>
                  </div>
                </div>
              </div>

              {/* Pricing Callout */}
              <div className="flex justify-between items-center text-xs pt-1">
                <span className="text-[#6E6B65]">Standard Pass starting at</span>
                <strong className="text-lg font-extrabold text-[#D85A30]">₹299 INR</strong>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* WHY JOIN SECTION — 6 Feature Cards */}
      <section className="py-16 px-6 bg-white border-y border-[#E6E2D9]">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-[#D85A30] font-bold text-xs uppercase tracking-widest block mb-2">Core Skills Covered</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F1E1C] tracking-tight">Why join the Claude Masterclass?</h2>
            <p className="text-sm text-[#524F4A] mt-2">Go beyond generic chatting. Learn how to turn Claude 3.5 Sonnet into your dedicated software engineer and workflow assistant.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            
            <div className="bg-[#F7F4EE] border border-[#E6E2D9] rounded-2xl p-6 hover:border-[#D85A30]/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#E6E2D9] flex items-center justify-center text-[#D85A30] mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#1F1E1C] text-base mb-2">Advanced Prompting & Hacks</h3>
              <p className="text-xs text-[#524F4A] leading-relaxed">System prompts, context caching tricks, structured outputs, and getting exact code logic on the first prompt.</p>
            </div>

            <div className="bg-[#F7F4EE] border border-[#E6E2D9] rounded-2xl p-6 hover:border-[#6B4FBB]/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#E6E2D9] flex items-center justify-center text-[#6B4FBB] mb-4">
                <Plug className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#1F1E1C] text-base mb-2">Build Custom MCP Servers</h3>
              <p className="text-xs text-[#524F4A] leading-relaxed">Connect Claude directly to your local file system, APIs, databases, and custom tools with Model Context Protocol.</p>
            </div>

            <div className="bg-[#F7F4EE] border border-[#E6E2D9] rounded-2xl p-6 hover:border-[#D85A30]/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#E6E2D9] flex items-center justify-center text-[#D85A30] mb-4">
                <Terminal className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#1F1E1C] text-base mb-2">Claude Code & CLI Workflows</h3>
              <p className="text-xs text-[#524F4A] leading-relaxed">Master terminal-based coding automation to edit multi-file projects, refactor codebases, and run debug cycles.</p>
            </div>

            <div className="bg-[#F7F4EE] border border-[#E6E2D9] rounded-2xl p-6 hover:border-[#6B4FBB]/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#E6E2D9] flex items-center justify-center text-[#6B4FBB] mb-4">
                <Laptop className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#1F1E1C] text-base mb-2">Websites & App Building</h3>
              <p className="text-xs text-[#524F4A] leading-relaxed">Construct complete web applications, interactive dashboards, and SaaS landing pages live with Claude Artifacts.</p>
            </div>

            <div className="bg-[#F7F4EE] border border-[#E6E2D9] rounded-2xl p-6 hover:border-[#D85A30]/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#E6E2D9] flex items-center justify-center text-[#D85A30] mb-4">
                <Gift className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#1F1E1C] text-base mb-2">Free vs Paid Tier Optimization</h3>
              <p className="text-xs text-[#524F4A] leading-relaxed">Learn how to maximize Claude's free tier without hitting limits, and evaluate when upgrading to Pro pays off.</p>
            </div>

            <div className="bg-[#F7F4EE] border border-[#E6E2D9] rounded-2xl p-6 hover:border-[#6B4FBB]/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#E6E2D9] flex items-center justify-center text-[#6B4FBB] mb-4">
                <FileCode className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#1F1E1C] text-base mb-2">100+ Claude Prompt Library</h3>
              <p className="text-xs text-[#524F4A] leading-relaxed">Get instant access to curated prompt templates, cheat sheets, and starter project repositories.</p>
            </div>

          </div>
        </div>
      </section>

      {/* CURRICULUM SECTION — Grouped by Day */}
      <section className="py-16 px-6 max-w-5xl mx-auto" id="curriculum">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-[#D85A30] font-bold text-xs uppercase tracking-widest block mb-2">2-Day Live Roadmap</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F1E1C] tracking-tight">Structured Masterclass Curriculum</h2>
          <p className="text-sm text-[#524F4A] mt-2">7 total hours of hands-on, live interactive training across Saturday and Sunday.</p>
        </div>

        <div className="space-y-8">
          
          {/* Day 1 Card Group */}
          <div className="bg-white border border-[#E6E2D9] rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-[#F0ECE1] mb-6">
              <div className="flex items-center gap-3">
                <span className="bg-[#D85A30] text-white font-bold text-xs px-3 py-1 rounded-md uppercase">Day 1</span>
                <div>
                  <h3 className="font-bold text-base text-[#1F1E1C]">Saturday, July 25th • 5:00 PM – 8:30 PM IST</h3>
                  <span className="text-xs text-[#6E6B65]">Foundations, Prompt Architecture & Building Custom MCPs</span>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-[#F7F4EE] border border-[#E6E2D9] p-4 rounded-xl">
                <span className="text-xs font-bold text-[#D85A30] block mb-1">Module 01</span>
                <h4 className="font-bold text-sm text-[#1F1E1C] mb-1">Claude Architecture & Artifacts</h4>
                <p className="text-xs text-[#524F4A]">System prompts, token context caching, and free vs paid optimization.</p>
              </div>

              <div className="bg-[#F7F4EE] border border-[#E6E2D9] p-4 rounded-xl">
                <span className="text-xs font-bold text-[#D85A30] block mb-1">Module 02</span>
                <h4 className="font-bold text-sm text-[#1F1E1C] mb-1">Advanced Prompt Engineering</h4>
                <p className="text-xs text-[#524F4A]">Structured JSON outputs, few-shot prompting, and bug elimination.</p>
              </div>

              <div className="bg-[#F7F4EE] border border-[#E6E2D9] p-4 rounded-xl">
                <span className="text-xs font-bold text-[#D85A30] block mb-1">Module 03</span>
                <h4 className="font-bold text-sm text-[#1F1E1C] mb-1">Model Context Protocol (MCP)</h4>
                <p className="text-xs text-[#524F4A]">Connecting Claude to local files, external tools, and custom APIs.</p>
              </div>
            </div>
          </div>

          {/* Day 2 Card Group */}
          <div className="bg-white border border-[#E6E2D9] rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-[#F0ECE1] mb-6">
              <div className="flex items-center gap-3">
                <span className="bg-[#6B4FBB] text-white font-bold text-xs px-3 py-1 rounded-md uppercase">Day 2</span>
                <div>
                  <h3 className="font-bold text-base text-[#1F1E1C]">Sunday, July 26th • 5:00 PM – 8:30 PM IST</h3>
                  <span className="text-xs text-[#6E6B65]">Claude Code CLI, Web App Construction & Live Projects</span>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-[#F7F4EE] border border-[#E6E2D9] p-4 rounded-xl">
                <span className="text-xs font-bold text-[#6B4FBB] block mb-1">Module 04</span>
                <h4 className="font-bold text-sm text-[#1F1E1C] mb-1">Claude Code & Terminal Automation</h4>
                <p className="text-xs text-[#524F4A]">Command line workflows, codebase refactoring, and automated testing.</p>
              </div>

              <div className="bg-[#F7F4EE] border border-[#E6E2D9] p-4 rounded-xl">
                <span className="text-xs font-bold text-[#6B4FBB] block mb-1">Module 05</span>
                <h4 className="font-bold text-sm text-[#1F1E1C] mb-1">Building Web Apps & Dashboards</h4>
                <p className="text-xs text-[#524F4A]">Creating full-stack responsive web tools and SaaS UIs live in class.</p>
              </div>

              <div className="bg-[#F7F4EE] border border-[#E6E2D9] p-4 rounded-xl">
                <span className="text-xs font-bold text-[#6B4FBB] block mb-1">Module 06</span>
                <h4 className="font-bold text-sm text-[#1F1E1C] mb-1">Real Projects & Q&A Session</h4>
                <p className="text-xs text-[#524F4A]">Freelance workflows, client deliverables automation, and live Q&A.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* INSTRUCTOR SECTION — Card with Scoped Metric Stats */}
      <section className="py-16 px-6 bg-white border-y border-[#E6E2D9]">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#F7F4EE] border border-[#E6E2D9] rounded-2xl p-6 sm:p-10 flex flex-col md:flex-row gap-8 items-center">
            
            <div className="flex flex-col items-center text-center shrink-0">
              <img src={antonyPraveenPhoto} alt="Mr. Antony Praveen" className="w-36 h-36 rounded-full object-cover object-top border-2 border-[#D85A30] shadow-sm mb-3" />
              <span className="bg-white border border-[#E6E2D9] text-[#D85A30] px-3 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
                <Award className="w-3.5 h-3.5" /> Lead Instructor
              </span>
            </div>

            <div className="space-y-3 text-center md:text-left">
              <span className="text-[#D85A30] font-bold text-xs uppercase tracking-widest block">Meet Your Mentor</span>
              <h2 className="text-2xl font-bold text-[#1F1E1C]">Mr. Antony Praveen</h2>
              <p className="text-[#6B4FBB] font-semibold text-xs">AI Specialist & Founder, Tech Tycoon</p>
              <p className="text-xs sm:text-sm text-[#524F4A] leading-relaxed">
                Antony Praveen has trained thousands of students, developers, and business owners in AI adoption, prompt engineering, and modern developer tools. With hands-on expertise in production AI agents and custom MCPs, he breaks down complex technical workflows into clear Tamil instruction.
              </p>
              
              {/* Scoped Credibility Metrics */}
              <div className="grid grid-cols-3 gap-3 border-t border-[#E6E2D9] pt-4 text-center">
                <div className="bg-white border border-[#E6E2D9] p-2.5 rounded-xl">
                  <strong className="block text-base font-bold text-[#1F1E1C]">5,000+</strong>
                  <span className="text-[11px] text-[#6E6B65]">Students trained (career total)</span>
                </div>
                <div className="bg-white border border-[#E6E2D9] p-2.5 rounded-xl">
                  <strong className="block text-base font-bold text-[#1F1E1C]">100+</strong>
                  <span className="text-[11px] text-[#6E6B65]">Live sessions conducted</span>
                </div>
                <div className="bg-white border border-[#E6E2D9] p-2.5 rounded-xl">
                  <strong className="block text-base font-bold text-[#1F1E1C]">4.9 ★</strong>
                  <span className="text-[11px] text-[#6E6B65]">Average participant rating</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* PRICING SECTION — Side-by-Side Comparison with Accent on Recommended */}
      <section className="py-16 px-6 max-w-5xl mx-auto" id="pricing">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-[#D85A30] font-bold text-xs uppercase tracking-widest block mb-2">Registration Options</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F1E1C] tracking-tight">Select your pass for the founding batch</h2>
          <p className="text-sm text-[#524F4A] mt-2">Choose between the standard live interactive pass or the VIP pass with lifetime recorded access.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          
          {/* Card 1: Standard Pass ₹299 */}
          <div className="bg-white border border-[#E6E2D9] rounded-2xl p-7 flex flex-col justify-between hover:border-[#C5C0B8] transition-all">
            <div>
              <span className="text-xs font-bold text-[#6E6B65] uppercase tracking-wider block mb-2">Standard Live Pass</span>
              <div className="flex items-baseline gap-1.5 mb-3">
                <span className="text-4xl font-extrabold text-[#1F1E1C]">₹299</span>
                <span className="text-xs text-[#6E6B65]">INR</span>
              </div>
              <p className="text-xs text-[#524F4A] mb-6">Ideal for live interactive participation across both days.</p>

              <ul className="space-y-3 mb-8 text-xs text-[#2C2A29]">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#D85A30]" /> 2-Day Live Zoom Session (July 25 & 26)
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#D85A30]" /> 100% Tamil Language Instruction
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#D85A30]" /> Direct Q&A with Antony Praveen
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#D85A30]" /> 100+ Prompt Template Collection
                </li>
                <li className="flex items-center gap-2.5 text-[#A09C94] line-through">
                  <X className="w-4 h-4 text-[#C5C0B8]" /> Lifetime Video Recording Access
                </li>
                <li className="flex items-center gap-2.5 text-[#A09C94] line-through">
                  <X className="w-4 h-4 text-[#C5C0B8]" /> Session Source Code & App Templates
                </li>
              </ul>
            </div>

            <button 
              onClick={() => handleOpenModal(299)}
              className="w-full bg-[#F7F4EE] hover:bg-[#EFECE6] text-[#1F1E1C] font-semibold py-3 px-5 rounded-xl border border-[#E6E2D9] transition-all text-xs"
            >
              Select Live Pass @ ₹299
            </button>
          </div>

          {/* Card 2: VIP Pass ₹999 (Recommended with 2px Accent Border) */}
          <div className="bg-white border-2 border-[#D85A30] rounded-2xl p-7 flex flex-col justify-between relative shadow-sm">
            <span className="absolute -top-3 left-6 bg-[#D85A30] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full">
              Recommended
            </span>

            <div>
              <span className="text-xs font-bold text-[#D85A30] uppercase tracking-wider block mb-2 mt-1">VIP All-Access Pass</span>
              <div className="flex items-baseline gap-1.5 mb-3">
                <span className="text-4xl font-extrabold text-[#1F1E1C]">₹999</span>
                <span className="text-xs text-[#6E6B65]">INR</span>
              </div>
              <p className="text-xs text-[#524F4A] mb-6">Full package with lifetime video recordings & source code.</p>

              <ul className="space-y-3 mb-8 text-xs text-[#2C2A29]">
                <li className="flex items-center gap-2.5 font-semibold">
                  <Check className="w-4 h-4 text-[#D85A30]" /> Everything in Standard Live Pass
                </li>
                <li className="flex items-center gap-2.5 bg-[#F7F4EE] p-2 rounded-lg font-bold text-[#1F1E1C] border border-[#E6E2D9]">
                  <Star className="w-4 h-4 text-[#D85A30]" /> Lifetime recorded video access
                </li>
                <li className="flex items-center gap-2.5 bg-[#F7F4EE] p-2 rounded-lg font-bold text-[#1F1E1C] border border-[#E6E2D9]">
                  <Star className="w-4 h-4 text-[#D85A30]" /> Session source code & project templates
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#D85A30]" /> Custom MCP server code repository
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#D85A30]" /> Community WhatsApp group access
                </li>
              </ul>
            </div>

            <button 
              onClick={() => handleOpenModal(999)}
              className="w-full bg-[#D85A30] hover:bg-[#C04E27] text-white font-bold py-3 px-5 rounded-xl transition-all text-xs shadow-sm flex items-center justify-center gap-1.5"
            >
              Select VIP pass @ ₹999 <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </section>

      {/* FAQ SECTION — Accordion */}
      <section className="py-16 px-6 bg-white border-t border-[#E6E2D9]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-[#D85A30] font-bold text-xs uppercase tracking-widest block mb-2">Frequently Asked Questions</span>
            <h2 className="text-2xl font-extrabold text-[#1F1E1C]">Everything you need to know</h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "What language will the Masterclass be conducted in?",
                a: "The entire session will be taught 100% in Tamil (தமிழ்) by Mr. Antony Praveen for clear, practical understanding."
              },
              {
                q: "What is the difference between the ₹299 pass and ₹999 VIP pass?",
                a: "The ₹299 pass grants live interactive Zoom participation on July 25 & 26 + 100+ prompt templates. The ₹999 VIP pass includes everything in the ₹299 pass PLUS lifetime recorded video access, complete source code of all live build projects, and community access."
              },
              {
                q: "How will I receive the Zoom meeting link?",
                a: "Immediately upon successful registration, your Zoom link and session details will be sent to your email and WhatsApp number."
              },
              {
                q: "Do I need a paid Claude Pro account to participate?",
                a: "No. A free Claude account is sufficient. We specifically teach how to utilize the free version effectively without hitting rate limits."
              },
              {
                q: "Do I need prior coding experience?",
                a: "No prior software development background is required. The session is structured step-by-step from foundational prompting to AI-assisted coding."
              }
            ].map((faq, idx) => (
              <div key={idx} className="bg-[#F7F4EE] border border-[#E6E2D9] rounded-xl overflow-hidden">
                <button 
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 text-left font-semibold text-[#1F1E1C] flex justify-between items-center text-xs sm:text-sm"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-[#D85A30] transition-transform duration-200 ${activeFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {activeFaq === idx && (
                  <div className="px-4 pb-4 text-xs text-[#524F4A] leading-relaxed border-t border-[#E6E2D9]/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6 bg-[#1F1E1C] text-[#C5C0B8] border-t border-[#33312E] text-center text-xs">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex justify-center items-center gap-2">
            <img src={techTycoonLogo} alt="Tech Tycoon" className="h-7 w-auto bg-white p-0.5 rounded" />
            <span className="font-bold text-white text-sm">Claude Masterclass</span>
          </div>
          <p className="text-[#8E8A83] max-w-md mx-auto">Conducted by Tech Tycoon Digital Solutions • July 25 & 26, 2026</p>
          <div className="pt-4 border-t border-[#33312E] text-[11px] text-[#8E8A83]">
            &copy; 2026 Tech Tycoon. All rights reserved. | aitycoon.in/claude_masterclass
          </div>
        </div>
      </footer>

      {/* BOTTOM CENTER FLOATING WIDGET */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 bg-white/95 backdrop-blur-md border border-[#E6E2D9] rounded-2xl shadow-xl px-4 py-2.5 sm:px-6 sm:py-3 flex items-center justify-between gap-4 sm:gap-6 w-[92%] sm:w-auto max-w-2xl">
        <div className="flex items-center gap-3 sm:gap-6 text-left">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#D85A30] shrink-0" />
            <div>
              <strong className="block text-xs font-bold text-[#1F1E1C] leading-tight">July 25 & 26</strong>
              <span className="text-[10px] text-[#6E6B65] hidden sm:block">Sat & Sun</span>
            </div>
          </div>

          <div className="flex items-center gap-2 border-l border-[#E6E2D9] pl-3 sm:pl-6">
            <Clock className="w-4 h-4 text-[#6B4FBB] shrink-0" />
            <div>
              <strong className="block text-xs font-bold text-[#1F1E1C] leading-tight">5:00 PM – 8:30 PM</strong>
              <span className="text-[10px] text-[#6E6B65]">IST</span>
            </div>
          </div>
        </div>

        <button 
          onClick={() => handleOpenModal(299)}
          className="bg-[#D85A30] hover:bg-[#C04E27] text-white font-bold px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs shadow-sm flex items-center gap-1.5 shrink-0 transition-all"
        >
          <span>Join founding batch</span>
          <span className="hidden md:inline text-[11px] font-normal opacity-90">@ ₹299</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2-STEP REGISTRATION & PAYMENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#E6E2D9] rounded-2xl w-full max-w-lg p-6 sm:p-8 relative shadow-2xl my-8 text-[#1F1E1C]">
            
            {/* Close Button */}
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#F7F4EE] border border-[#E6E2D9] text-[#6E6B65] hover:text-[#1F1E1C] flex items-center justify-center transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            {/* STEP 1: PASS SELECTION */}
            {modalStep === 1 && (
              <div>
                <div className="text-center mb-6">
                  <span className="text-[#D85A30] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Secure Checkout
                  </span>
                  <h3 className="text-xl font-bold text-[#1F1E1C] mt-1">Select your registration pass</h3>
                  <p className="text-xs text-[#6E6B65] mt-1">Choose your preferred option to continue</p>
                </div>

                <div className="space-y-3.5 mb-6">
                  {/* Standard Option ₹299 */}
                  <div 
                    onClick={() => setSelectedPlan(299)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex gap-3.5 items-start ${
                      selectedPlan === 299 
                        ? 'border-[#D85A30] bg-[#F7F4EE]' 
                        : 'border-[#E6E2D9] bg-white hover:border-[#C5C0B8]'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-1 transition-all ${
                      selectedPlan === 299 ? 'border-[#D85A30] bg-[#D85A30]' : 'border-[#C5C0B8]'
                    }`}>
                      {selectedPlan === 299 && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="font-bold text-[#1F1E1C] text-sm">Standard Live Pass</span>
                        <span className="font-extrabold text-[#D85A30] text-base">₹299</span>
                      </div>
                      <p className="text-xs text-[#524F4A]">Live Zoom Session + 100+ Prompts (No Video Recording Access).</p>
                    </div>
                  </div>

                  {/* VIP Option ₹999 */}
                  <div 
                    onClick={() => setSelectedPlan(999)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex gap-3.5 items-start ${
                      selectedPlan === 999 
                        ? 'border-[#D85A30] bg-[#F7F4EE]' 
                        : 'border-[#E6E2D9] bg-white hover:border-[#C5C0B8]'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-1 transition-all ${
                      selectedPlan === 999 ? 'border-[#D85A30] bg-[#D85A30]' : 'border-[#C5C0B8]'
                    }`}>
                      {selectedPlan === 999 && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1 gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-[#1F1E1C] text-sm">VIP All-Access Pass</span>
                          <span className="bg-[#6B4FBB] text-white text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">Recommended</span>
                        </div>
                        <span className="font-extrabold text-[#D85A30] text-base shrink-0">₹999</span>
                      </div>
                      <p className="text-xs text-[#524F4A]">Live Zoom + <strong className="text-[#1F1E1C]">Full Recorded Video Access</strong> + Source Code & App Templates.</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#E6E2D9] pt-4">
                  <div className="flex justify-between items-center mb-4 text-xs">
                    <span className="text-[#6E6B65]">Selected Pass Total:</span>
                    <strong className="text-xl font-extrabold text-[#D85A30]">₹{selectedPlan} INR</strong>
                  </div>
                  <button 
                    onClick={handleStep1Proceed}
                    className="w-full bg-[#D85A30] hover:bg-[#C04E27] text-white font-bold py-3.5 px-5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    Proceed to details <Lock className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: USER DETAILS FORM */}
            {modalStep === 2 && (
              <div>
                <button 
                  onClick={() => setModalStep(1)}
                  className="flex items-center gap-1 text-xs text-[#6E6B65] hover:text-[#D85A30] mb-3 font-medium transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Change pass selection (₹{selectedPlan})
                </button>

                <div className="text-center mb-5">
                  <h3 className="text-xl font-extrabold text-[#1F1E1C]">
                    Join founding batch
                  </h3>
                  <p className="text-xs text-[#6E6B65] mt-0.5">
                    Registration fee: <strong className="text-[#D85A30]">₹{selectedPlan} INR</strong>
                  </p>

                  <div className="inline-flex items-center gap-1.5 bg-[#F7F4EE] border border-[#E6E2D9] text-[#524F4A] px-3 py-1 rounded-md text-[11px] font-medium mt-2">
                    <Calendar className="w-3 h-3 text-[#D85A30]" />
                    July 25 & 26, 2026 (Sat & Sun) • 5:00 PM IST
                  </div>
                </div>

                <form onSubmit={handleProceedPayment} className="space-y-3.5">
                  
                  <div>
                    <label className="block text-[11px] font-bold text-[#524F4A] uppercase tracking-wider mb-1">FULL NAME</label>
                    <input 
                      type="text" 
                      name="name" 
                      required 
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full bg-[#F7F4EE] border border-[#E6E2D9] focus:border-[#D85A30] rounded-xl py-2.5 px-3.5 text-xs text-[#1F1E1C] placeholder-[#A09C94] outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#524F4A] uppercase tracking-wider mb-1">EMAIL ADDRESS</label>
                    <input 
                      type="email" 
                      name="email" 
                      required 
                      placeholder="email@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-[#F7F4EE] border border-[#E6E2D9] focus:border-[#D85A30] rounded-xl py-2.5 px-3.5 text-xs text-[#1F1E1C] placeholder-[#A09C94] outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#524F4A] uppercase tracking-wider mb-1">WHATSAPP NUMBER</label>
                    <div className="flex gap-2 relative">
                      <div className="bg-[#EFECE6] border border-[#E6E2D9] rounded-xl px-3 flex items-center text-xs font-semibold text-[#524F4A] min-w-[75px] justify-center">
                        IN +91
                      </div>
                      <input 
                        type="tel" 
                        name="phone" 
                        required 
                        maxLength={10}
                        placeholder="10-digit mobile number"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full bg-[#F7F4EE] border rounded-xl py-2.5 px-3.5 text-xs text-[#1F1E1C] placeholder-[#A09C94] outline-none transition-all ${
                          phoneError ? 'border-red-500' : 'border-[#E6E2D9] focus:border-[#D85A30]'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#524F4A] uppercase tracking-wider mb-1">CURRENT PROFESSION</label>
                    <select 
                      name="profession" 
                      required
                      value={formData.profession}
                      onChange={handleInputChange}
                      className="w-full bg-[#F7F4EE] border border-[#E6E2D9] focus:border-[#D85A30] rounded-xl py-2.5 px-3.5 text-xs text-[#1F1E1C] outline-none transition-all cursor-pointer"
                    >
                      <option value="">Select profession...</option>
                      <option value="Trainer / Coach">Trainer / Coach</option>
                      <option value="Entrepreneur">Entrepreneur</option>
                      <option value="Business Owner">Business Owner</option>
                      <option value="Educator">Educator</option>
                      <option value="IT Professional">IT Professional</option>
                      <option value="Student">Student</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="text-center py-1">
                    {selectedPlan === 299 ? (
                      <p className="text-[11px] text-[#D85A30] font-semibold">
                        ⚠️ Live session only (No recorded access in ₹299 pass)
                      </p>
                    ) : (
                      <p className="text-[11px] text-[#6B4FBB] font-semibold">
                        ⭐ Includes full recorded video access + source code!
                      </p>
                    )}
                  </div>

                  <div className="flex items-start gap-2 pt-1">
                    <input 
                      type="checkbox" 
                      id="agreeWhatsapp" 
                      name="agreeWhatsapp"
                      checked={formData.agreeWhatsapp}
                      onChange={handleInputChange}
                      className="mt-0.5 w-3.5 h-3.5 accent-[#D85A30] rounded cursor-pointer"
                    />
                    <label htmlFor="agreeWhatsapp" className="text-[11px] text-[#6E6B65] leading-tight cursor-pointer">
                      I agree to receive workshop updates and automated reminders on WhatsApp.
                    </label>
                  </div>

                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#D85A30] hover:bg-[#C04E27] text-white font-bold py-3.5 px-5 rounded-xl shadow-sm transition-all text-sm tracking-wide mt-2 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Initializing payment...' : `Proceed to payment — ₹${selectedPlan}`}
                  </button>

                  <div className="text-center text-[10px] text-[#8E8A83] font-semibold uppercase tracking-wider flex items-center justify-center gap-1 pt-1">
                    <ShieldCheck className="w-3 h-3 text-[#8E8A83]" /> Secured by Razorpay
                  </div>

                </form>

              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default ClaudeMasterclassPage;
