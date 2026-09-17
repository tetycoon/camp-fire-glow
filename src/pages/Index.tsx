import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Calendar, Clock, IndianRupee, ArrowRight, ExternalLink, 
  Menu, X, Globe, Instagram, Mail, ShieldCheck, 
  CheckCircle2, Users, Star, Award, Zap, PlayCircle,
  MessageSquare, LayoutGrid, CheckCircle, TrendingUp,
  Facebook, Youtube, Phone, ChevronDown, Sparkles,
  BookOpen, Laptop, Video, MapPin, BadgeCheck, HelpCircle,
  Terminal, Shield, Compass, ArrowUpRight
} from "lucide-react";

import imgEntrepreneur from "../assets/indian_entrepreneur.png";
import imgAnalytics from "../assets/indian_analytics.png";
import event1 from "../assets/event-1.jpg";
import event2 from "../assets/event-2.jpg";
import event3 from "../assets/event-3.jpg";
import event4 from "../assets/event-4.jpg";
import event7 from "../assets/event-7.jpg";
import event8 from "../assets/event-8.jpg";

interface Course {
  id: string;
  title: string;
  category: "online" | "offline" | "bootcamp" | "academy";
  tag: string;
  intro: string;
  fees: string;
  originalFees?: string;
  date: string;
  timing: string;
  format: string;
  image: string;
  link: string;
  isExternal: boolean;
  highlights: string[];
}

const courses: Course[] = [
  {
    id: "claude-masterclass",
    title: "Claude 3.5 AI Masterclass",
    category: "online",
    tag: "Hot & Trending",
    intro: "Master Anthropic Claude 3.5 Sonnet, prompt engineering architecture, custom MCP creation, and full web application development with direct guidance in Tamil.",
    fees: "From ₹499",
    originalFees: "₹2,499",
    date: "Every Saturday & Sunday",
    timing: "6:00 PM – 9:00 PM IST",
    format: "Online Zoom Live",
    image: "/images/antony_praveen.jpg",
    link: "/claude_masterclass",
    isExternal: false,
    highlights: [
      "Custom Model Context Protocol (MCP) server creation",
      "Claude Code CLI & Automated Software Engineering",
      "100% Tamil & English live interactive Q&A"
    ]
  },
  {
    id: "ai-secrets",
    title: "AI Secrets Revealed & Business Automation",
    category: "online",
    tag: "Most Popular",
    intro: "A specialized 3-hour foundational session covering ChatGPT personalization, prompt frameworks, and full business setup with 10+ practical AI tools.",
    fees: "₹99",
    originalFees: "₹1,999",
    date: "Upcoming Saturday",
    timing: "6:00 PM – 9:00 PM IST",
    format: "Online Live Virtual",
    image: imgEntrepreneur,
    link: "/ai_masterclass",
    isExternal: false,
    highlights: [
      "Brand identity generation: Name, logo, voice & video",
      "Lead generation & automated customer follow-ups",
      "Hands-on practice with top 10+ AI productivity tools"
    ]
  },
  {
    id: "upscale-offline",
    title: "AI Business Principles (Chennai In-Person)",
    category: "offline",
    tag: "Offline Workshop (Chennai)",
    intro: "Master the 9 pillars of Business Generative Models in an 8-hour executive deep dive. Build your complete automated AI system live at the venue.",
    fees: "₹4,999",
    originalFees: "₹9,999",
    date: "Sunday, Oct 11, 2026",
    timing: "9:00 AM – 5:30 PM IST",
    format: "Hotel Vestin Park, Egmore",
    image: "/images/upscale_offline_banner.png",
    link: "/upscale",
    isExternal: false,
    highlights: [
      "Live 1-on-1 machine debugging with Antony Praveen",
      "Executive buffet lunch & morning/evening high tea included",
      "Strictly limited to 30 seats for focused personal mentoring"
    ]
  },
  {
    id: "advanced-masterclass",
    title: "Mastering AI Business Generative Models",
    category: "online",
    tag: "Executive Advanced",
    intro: "The definitive 4-day intensive for founders, operators, and business leaders seeking multi-agent orchestration and automated customer funnels.",
    fees: "₹4,999",
    originalFees: "₹14,999",
    date: "Live (4 Weekend Days)",
    timing: "6:00 PM – 9:00 PM IST",
    format: "Online Executive Studio",
    image: imgAnalytics,
    link: "/advanced_masterclass/",
    isExternal: true,
    highlights: [
      "Enterprise autonomous workflows with Make & Zapier",
      "High-converting AI sales copy and video generation",
      "Strategic roadmap to scale operational margins by 2x"
    ]
  },
  {
    id: "bootcamp",
    title: "AI Master Bootcamp (30-Day Immersion)",
    category: "bootcamp",
    tag: "Certification Program",
    intro: "A rigorous 30-day architectural immersion. Master agentic workflows, LLM orchestration, and the foundations of professional AI autonomy.",
    fees: "Admissions Open",
    originalFees: "₹24,999",
    date: "Upcoming Monthly Cohort",
    timing: "3 Hrs Daily (Flexi Slots)",
    format: "Neural-Net Zoom Cohort",
    image: "/images/summer_camp.jpg",
    link: "/bootcamp",
    isExternal: false,
    highlights: [
      "30-day deep dive into autonomous agentic systems",
      "Dual-slot flexibility for working professionals & students",
      "Industry-verified practitioner credential upon project defense"
    ]
  },
  {
    id: "academy",
    title: "Tech Tycoon AI Academy (Lifetime Mentorship)",
    category: "academy",
    tag: "Pre-Register (50% Off)",
    intro: "Continuous, lifetime curriculum covering cutting-edge AI agent orchestration, business generative frameworks, and continuous weekly updates.",
    fees: "From ₹2,499",
    originalFees: "₹4,999",
    date: "Admissions Open",
    timing: "Lifetime Access & Updates",
    format: "Private Portal + Community",
    image: "/images/AI_Secrets_Revealed_Banner.png",
    link: "/academy",
    isExternal: false,
    highlights: [
      "Lifetime access to all current and future curriculum modules",
      "Private VIP WhatsApp network with Antony Praveen",
      "Weekly live mastermind office hours and code updates"
    ]
  }
];

const partners = [
  "Claude 3.5 Sonnet", 
  "OpenAI GPT-4o", 
  "Model Context Protocol", 
  "Cursor AI", 
  "Make.com", 
  "Perplexity AI", 
  "n8n AI Agents", 
  "Midjourney", 
  "Razorpay"
];

const stats = [
  { value: "4,800+", label: "Students & Executives Trained" },
  { value: "150+", label: "Corporate Workshops & Clients" },
  { value: "4.9/5", label: "Average Rating (Google & Trustpilot)" },
  { value: "100%", label: "Practical Hands-On Building" },
];

const pillars = [
  {
    icon: Terminal,
    title: "100% Practical Implementation",
    description: "No passive theory. Every attendee opens their laptop and builds functional AI scripts, custom tools, and automated pipelines live."
  },
  {
    icon: MessageSquare,
    title: "Bilingual Tamil & English Instruction",
    description: "Complex AI concepts demystified intuitively in Tamil by Antony Praveen, paired with industry-standard English technical terms."
  },
  {
    icon: Sparkles,
    title: "Production-Ready Blueprints",
    description: "Take home ready-to-deploy prompt libraries, MCP server templates, and workflow architectures to apply in your business immediately."
  },
  {
    icon: Users,
    title: "Lifetime WhatsApp Community",
    description: "Direct access to our private mastermind network for live troubleshooting, continuous updates, and networking with fellow entrepreneurs."
  }
];

const galleryPhotos = [
  { img: event1, title: "Chennai Classroom Workshop", desc: "Interactive live prompt engineering" },
  { img: event2, title: "Executive Coaching", desc: "1-on-1 hands-on debugging sessions" },
  { img: event3, title: "Group AI Demonstrations", desc: "Building live business automations" },
  { img: event4, title: "Enterprise Attendees", desc: "Founders scaling with AI workflows" },
  { img: event7, title: "Full Day Immersion", desc: "Vestin Park Hotel, Egmore Chennai" },
  { img: event8, title: "Certificate Distribution", desc: "Recognizing certified AI practitioners" },
];

const testimonials = [
  {
    name: "Rajesh Kumar",
    role: "Proprietor, RK Enterprises",
    city: "Chennai",
    content: "The ₹99 masterclass was a game changer for my distribution business. I automated client follow-ups in a single afternoon without writing a single line of code. Incredible return on time.",
    rating: 5
  },
  {
    name: "Priya Sharma",
    role: "Digital Marketing Lead",
    city: "Bengaluru",
    content: "The Claude 3.5 Masterclass showed me how to use MCP servers to query external databases in seconds. Antony explains architecture so clearly in Tamil—worth 10x the price!",
    rating: 5
  },
  {
    name: "Arun Vijay",
    role: "Tech Entrepreneur & Consultant",
    city: "Coimbatore",
    content: "The offline workshop in Egmore was phenomenal. Having Antony personally debug my agentic workflow across my laptop saved me months of trial and error. Highly recommended.",
    rating: 5
  }
];

const faqs = [
  {
    q: "I am a complete beginner. Which course should I start with?",
    a: "If you want a broad, high-impact overview of AI business tools and prompt engineering, begin with 'AI Secrets Revealed' (₹99). If you want to build code, create full web applications, and master Anthropic's flagship models, join the 'Claude 3.5 AI Masterclass' (₹499)."
  },
  {
    q: "What language are the masterclasses conducted in?",
    a: "All sessions are conducted in Tamil (தமிழ்) with technical terms explained clearly in English by Mr. Antony Praveen, ensuring effortless understanding for all participants."
  },
  {
    q: "Are session recordings provided if I miss a live class?",
    a: "Yes! For the Claude Masterclass, selecting the ₹999 Live + Recording Pass grants you full high-definition video access. The AI Academy also includes permanent video replays and continuous updates."
  },
  {
    q: "Do I need coding experience or a paid AI subscription?",
    a: "No prior programming experience is required. We specifically demonstrate how to leverage generous free tiers (ChatGPT, Claude Free, Make.com) before deciding to invest in paid plans."
  },
  {
    q: "How do I receive the meeting link and join the WhatsApp group?",
    a: "Immediately upon completing your registration and payment via Razorpay, you receive instant confirmation on WhatsApp and Email containing your calendar invite and exclusive community access link."
  }
];

const Index: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [heroPhotoIdx, setHeroPhotoIdx] = useState(0);

  const heroPhotos = [
    "/images/D55A8334.JPG",
    "/images/D55A0055.JPG",
    "/images/WhatsApp Image 2025-04-29 at 23.09.37_e0aca46f.jpg"
  ];

  useEffect(() => {
    document.title = "Tech Tycoon | AI Masterclasses, Bootcamps & Business Automation";
  }, []);

  // Smooth photo transition for Hero showcase
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroPhotoIdx(prev => (prev + 1) % heroPhotos.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [heroPhotos.length]);

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      setShowStickyBar(window.scrollY > 700);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
    setMobileMenuOpen(false);
  };

  const filteredCourses = activeTab === "all" 
    ? courses 
    : courses.filter(c => c.category === activeTab);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-900 font-sans overflow-x-hidden selection:bg-indigo-600 selection:text-white">
      
      {/* ── TOP NOTIFICATION URGENCY BAR ── */}
      <div className="bg-slate-950 text-white text-xs py-2 px-4 border-b border-white/10 relative z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 mx-auto sm:mx-0">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-[11px] sm:text-xs text-slate-300">
              ⚡ Weekend Batches Filling Fast: <strong className="text-emerald-400">Claude 3.5 AI Masterclass</strong> runs Every Saturday & Sunday!
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[11px] text-slate-400">
            <span>Official WhatsApp Support: <strong>+91 70103 40494</strong></span>
            <span>•</span>
            <button onClick={() => scrollToSection("programs")} className="text-indigo-400 hover:text-indigo-300 font-bold underline">
              View Schedule &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* ── MODERN FROSTED GLASS NAVBAR ── */}
      <nav className={`fixed top-8 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-md shadow-md py-3 border-b border-slate-200/80" : "bg-white/70 backdrop-blur-sm py-4"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div 
              className="flex items-center gap-3 cursor-pointer group" 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-md opacity-40 group-hover:opacity-70 transition-opacity"></div>
                <img 
                  src="/logo.png" 
                  alt="Tech Tycoon" 
                  className="relative w-10 h-10 rounded-full border border-slate-200 shadow-sm transition-transform duration-300 group-hover:scale-105" 
                />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-slate-900 leading-none">
                  TECH<span className="text-indigo-600">TYCOON</span>
                </span>
                <span className="text-[9px] font-bold text-slate-500 tracking-widest uppercase mt-0.5">
                  Digital Solution LLP
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-8">
              <button onClick={() => scrollToSection("programs")} className="text-xs font-bold text-slate-600 hover:text-indigo-600 uppercase tracking-wider transition-colors">
                Programs
              </button>
              <button onClick={() => scrollToSection("why-us")} className="text-xs font-bold text-slate-600 hover:text-indigo-600 uppercase tracking-wider transition-colors">
                Why Us
              </button>
              <button onClick={() => scrollToSection("mentor")} className="text-xs font-bold text-slate-600 hover:text-indigo-600 uppercase tracking-wider transition-colors">
                Mentor
              </button>
              <button onClick={() => scrollToSection("gallery")} className="text-xs font-bold text-slate-600 hover:text-indigo-600 uppercase tracking-wider transition-colors">
                Workshop Gallery
              </button>
              <button onClick={() => scrollToSection("reviews")} className="text-xs font-bold text-slate-600 hover:text-indigo-600 uppercase tracking-wider transition-colors">
                Reviews
              </button>
              <button onClick={() => scrollToSection("faq")} className="text-xs font-bold text-slate-600 hover:text-indigo-600 uppercase tracking-wider transition-colors">
                FAQ
              </button>
            </div>

            {/* Right Action Button */}
            <div className="hidden sm:flex items-center gap-3">
              <button 
                onClick={() => scrollToSection("programs")} 
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
              >
                <span>Explore Programs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Mobile Hamburger Toggle */}
            <button 
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-900 hover:bg-slate-200 transition-colors" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 shadow-xl px-6 py-6 flex flex-col gap-4 animate-in slide-in-from-top-2 duration-200">
            <button onClick={() => scrollToSection("programs")} className="text-left font-bold text-slate-800 text-base py-2 border-b border-slate-100">
              Training Programs & Schedule
            </button>
            <button onClick={() => scrollToSection("why-us")} className="text-left font-bold text-slate-800 text-base py-2 border-b border-slate-100">
              Why Tech Tycoon
            </button>
            <button onClick={() => scrollToSection("mentor")} className="text-left font-bold text-slate-800 text-base py-2 border-b border-slate-100">
              Lead Strategist (Antony Praveen)
            </button>
            <button onClick={() => scrollToSection("gallery")} className="text-left font-bold text-slate-800 text-base py-2 border-b border-slate-100">
              Workshop Gallery
            </button>
            <button onClick={() => scrollToSection("reviews")} className="text-left font-bold text-slate-800 text-base py-2 border-b border-slate-100">
              Alumni Reviews
            </button>
            <button onClick={() => scrollToSection("faq")} className="text-left font-bold text-slate-800 text-base py-2 border-b border-slate-100">
              Frequently Asked Questions
            </button>
            <button 
              onClick={() => scrollToSection("programs")} 
              className="bg-indigo-600 text-white font-bold py-3.5 rounded-xl text-center shadow-lg shadow-indigo-600/20 mt-2 flex items-center justify-center gap-2"
            >
              <span>Explore Programs & Enroll</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </nav>

      {/* ── HIGH-IMPACT HERO SECTION ── */}
      <section className="relative pt-36 sm:pt-44 pb-20 px-4 overflow-hidden">
        {/* Ambient Gradient Background Glows */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-indigo-500/10 via-purple-500/10 to-emerald-500/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        <div className="absolute -top-24 right-0 w-[450px] h-[450px] bg-indigo-500/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headlines & Primary Pitch */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            
            {/* Live Status Badge */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-sm mb-6">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                India's #1 Practical AI Training Hub
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
              Master Real-World <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 bg-clip-text text-transparent">AI Systems.</span> Built For Business Leaders & Developers.
            </h1>

            {/* Clear Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl mb-8">
              Hands-on AI masterclasses, full-stack prompt engineering, custom MCP server architecture, and generative workflow automation. Delivered with direct live mentoring in <strong>Tamil & English</strong> by Antony Praveen.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-10">
              <button 
                onClick={() => scrollToSection("programs")} 
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-7 py-4 rounded-xl shadow-lg shadow-indigo-600/25 transition-all hover:shadow-indigo-600/35 hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-3 text-sm"
              >
                <span>Explore All 6 Programs</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button 
                onClick={() => scrollToSection("mentor")} 
                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300/80 font-bold px-6 py-4 rounded-xl shadow-sm transition-all hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 text-sm"
              >
                <span>Meet Lead Strategist</span>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Social Proof Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full pt-8 border-t border-slate-200/80">
              {stats.map((stat, idx) => (
                <div key={idx} className="flex flex-col">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {stat.value}
                  </span>
                  <span className="text-[11px] font-medium text-slate-500 leading-tight mt-1">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>

          </div>

          {/* Right Column: Dynamic Hero Visual Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Main Card Frame */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-900">
                <div className="aspect-[4/3] sm:aspect-[16/11] overflow-hidden relative">
                  <img 
                    key={heroPhotoIdx}
                    src={heroPhotos[heroPhotoIdx]} 
                    alt="Tech Tycoon Live Workshop" 
                    className="w-full h-full object-cover transition-opacity duration-700 animate-in fade-in" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                  
                  {/* Floating Overlay Pill */}
                  <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-white/20 shadow-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                        Live Chennai Workshop
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                        <MapPin className="w-3 h-3 text-red-500" /> Vestin Park, Egmore
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 leading-snug">
                      Hands-on AI Business Generative Models & Live Prompt Engineering
                    </p>
                  </div>
                </div>
              </div>

              {/* Decorative Accent Floating Card */}
              <div className="hidden sm:flex absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xl items-center gap-3.5 z-20">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
                  <BadgeCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900">Verified Certificate</div>
                  <div className="text-[10px] font-medium text-slate-500">Official Tech Tycoon Credential</div>
                </div>
              </div>

              {/* Decorative Accent 2 */}
              <div className="hidden sm:flex absolute -top-4 -right-4 bg-slate-900 text-white p-3.5 rounded-2xl border border-slate-700 shadow-xl items-center gap-3 z-20">
                <div className="flex -space-x-2">
                  <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-bold border-2 border-slate-900">4.9</div>
                  <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-bold border-2 border-slate-900">★</div>
                </div>
                <span className="text-[11px] font-bold pr-1">4,800+ Alumni</span>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ── TECHNOLOGY STACK MARQUEE ── */}
      <div className="py-5 bg-white border-y border-slate-200/80 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 mb-3 text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            MASTER INDUSTRY-STANDARD AI INFRASTRUCTURE & FRAMEWORKS
          </span>
        </div>
        <div className="flex whitespace-nowrap overflow-hidden">
          <div className="inline-flex items-center gap-10 animate-scroll-left">
            {[...partners, ...partners, ...partners].map((partner, i) => (
              <div key={i} className="inline-flex items-center gap-2.5 px-4 text-slate-700 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span>{partner}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── INTERACTIVE FILTERABLE COURSE CATALOG ── */}
      <section id="programs" className="py-20 px-4 max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[11px] font-bold uppercase tracking-wider mb-3">
              Comprehensive Curriculum
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
              Featured <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">AI Programs</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-normal mt-2 max-w-xl">
              From beginner prompt engineering to high-performance agentic pipelines. Choose your program and secure your seat.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200">
            {[
              { id: "all", label: "All Programs (6)" },
              { id: "online", label: "Online Live (3)" },
              { id: "offline", label: "In-Person Chennai (1)" },
              { id: "bootcamp", label: "30-Day Bootcamp (1)" },
              { id: "academy", label: "AI Academy (1)" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id 
                    ? "bg-white text-indigo-600 shadow-sm" 
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => (
            <div 
              key={course.id} 
              className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group"
            >
              <div>
                {/* Thumbnail Header */}
                <div className="relative h-48 sm:h-52 overflow-hidden bg-slate-100">
                  <img 
                    src={course.image} 
                    alt={course.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>
                  
                  {/* Badge */}
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md text-slate-900 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                    {course.tag}
                  </div>

                  {/* Pricing Badge */}
                  <div className="absolute bottom-3 right-3 bg-indigo-600 text-white text-xs font-black px-3.5 py-1.5 rounded-xl shadow-md">
                    {course.fees}
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6">
                  {/* Format & Schedule meta */}
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-3 pb-3 border-b border-slate-100">
                    <span className="flex items-center gap-1.5 text-indigo-600">
                      <Video className="w-3.5 h-3.5" />
                      {course.format}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {course.timing}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-slate-900 leading-snug mb-2.5 group-hover:text-indigo-600 transition-colors">
                    {course.title}
                  </h3>

                  {/* Intro */}
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-5 font-normal">
                    {course.intro}
                  </p>

                  {/* Key Highlights */}
                  <div className="space-y-2 mb-6">
                    {course.highlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-2 text-[11px] text-slate-700 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div className="p-6 pt-0">
                <div className="mb-3.5 text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Next Batch: <strong className="text-slate-800">{course.date}</strong></span>
                </div>

                {course.isExternal ? (
                  <a 
                    href={course.link}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <span>View Curriculum & Details</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <Link 
                    to={course.link}
                    className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-sm group/btn"
                  >
                    <span>{course.id === "bootcamp" ? "Enquire for Batch" : "View Details & Register"}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── THE 4 PILLARS OF TECH TYCOON (BENTO GRID) ── */}
      <section id="why-us" className="py-20 px-4 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-3">
              Why Professionals Choose Us
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              The Tech Tycoon Standard
            </h2>
            <p className="text-slate-400 text-sm sm:text-base font-normal mt-3">
              We eliminate fluff, outdated slide decks, and theoretical jargon. Our mission is direct, profitable capability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((pillar, idx) => (
              <div 
                key={idx} 
                className="bg-white/5 border border-white/10 rounded-3xl p-7 flex flex-col justify-between hover:bg-white/10 hover:border-indigo-500/40 transition-all duration-300"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-6">
                    <pillar.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 leading-snug">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-normal">
                    {pillar.description}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center text-xs font-bold text-indigo-400">
                  <span>Guaranteed Outcome</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MENTOR & LEAD STRATEGIST (ANTONY PRAVEEN) ── */}
      <section id="mentor" className="py-24 px-4 max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 rounded-3xl p-8 sm:p-14 text-white relative overflow-hidden shadow-2xl border border-slate-800">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            
            {/* Left: Founder Portrait */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-3xl blur-md opacity-40"></div>
                <div className="relative rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-slate-800 max-w-sm">
                  <img 
                    src="/images/profile.png" 
                    alt="Antony Praveen" 
                    className="w-full object-cover" 
                  />
                  <div className="p-4 bg-slate-900/90 backdrop-blur-md border-t border-white/10 text-center">
                    <h4 className="font-bold text-lg text-white">Antony Praveen</h4>
                    <p className="text-xs text-indigo-400 font-medium">Founder & Lead AI Strategist • Tech Tycoon</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Biography & Vision */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-4">
                The Instructor Behind The Platform
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-6">
                Learn Directly From An Engineer Who <span className="text-indigo-400">Builds In Production.</span>
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                Antony Praveen doesn't teach academic AI theory. He designs and deploys custom Model Context Protocols, autonomous agent pipelines, and enterprise automation engines for businesses across South India and overseas.
              </p>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-8 font-normal">
                His signature teaching methodology breaks down complex machine learning and LLM architectures into clear, practical mental models delivered in your native language (Tamil & English), so you leave capable of building immediately.
              </p>

              {/* Key Credentials Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full mb-8">
                <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl">
                  <span className="text-xl font-black text-white">4,800+</span>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">Students Trained</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl">
                  <span className="text-xl font-black text-white">150+</span>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">Workshops Held</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl col-span-2 sm:col-span-1">
                  <span className="text-xl font-black text-white">100%</span>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">Hands-On Code</p>
                </div>
              </div>

              <button 
                onClick={() => scrollToSection("programs")} 
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-7 py-3.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all hover:-translate-y-0.5"
              >
                <span>Join Antony's Next Session</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ── REAL WORKSHOP GALLERY (AUTHENTIC PHOTOS) ── */}
      <section id="gallery" className="py-20 px-4 bg-slate-50 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-3">
              Real Impact & Classroom Moments
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Behind The Scenes At Our Workshops
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-2 font-normal">
              From our Chennai classroom cohorts at Vestin Park Hotel to enterprise consulting auditoriums.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryPhotos.map((item, idx) => (
              <div 
                key={idx} 
                className="group relative rounded-3xl overflow-hidden bg-slate-200 border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img 
                    src={item.img} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-end p-5 text-white">
                  <h4 className="font-bold text-sm leading-snug">{item.title}</h4>
                  <p className="text-[11px] text-slate-300 font-medium mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ALUMNI REVIEWS & TESTIMONIALS ── */}
      <section id="reviews" className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-3">
            Real Participant Results
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Loved By 4,800+ Professionals & Founders
          </h2>
          <div className="flex items-center justify-center gap-1.5 mt-3 text-amber-500">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
            ))}
            <span className="text-slate-700 text-xs font-bold ml-2">4.9 / 5 Overall Satisfaction</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <div 
              key={idx} 
              className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex gap-1 mb-4 text-amber-400">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-700 text-xs sm:text-sm leading-relaxed mb-6 font-normal">
                  "{t.content}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-900">{t.name}</h4>
                  <p className="text-[10px] text-slate-500">{t.role} • {t.city}</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Verified
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FREQUENTLY ASKED QUESTIONS (ACCORDION) ── */}
      <section id="faq" className="py-20 px-4 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider mb-3">
            Got Questions?
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-2 font-normal">
            Everything you need to know about formats, prerequisites, and registration.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden transition-all"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full p-5 text-left font-bold text-slate-900 text-sm sm:text-base flex items-center justify-between gap-4"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-indigo-600 transition-transform duration-200 ${
                  activeFaq === idx ? "rotate-180" : ""
                }`} />
              </button>
              {activeFaq === idx && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── HIGH-CONVERSION FINAL CALL TO ACTION ── */}
      <section className="px-4 py-16 pb-28">
        <div className="max-w-7xl mx-auto rounded-3xl bg-slate-950 p-10 sm:p-20 text-center text-white relative overflow-hidden shadow-2xl border border-slate-800">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/20 via-purple-600/10 to-transparent pointer-events-none"></div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3.5 py-1 rounded-full border border-indigo-500/20">
              Weekend Cohort Seats Filling
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-5 mb-5 leading-tight">
              Ready To Upgrade Your AI Capability?
            </h2>
            <p className="text-slate-300 text-xs sm:text-base mb-8 font-normal leading-relaxed">
              Don't stay on the sidelines. Join our upcoming live interactive session and learn the exact tools top creators and founders use daily.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => scrollToSection("programs")} 
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:shadow-indigo-600/40 text-sm flex items-center justify-center gap-2"
              >
                <span>Browse All Programs</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <a 
                href="https://wa.me/917010340494?text=Hi%20Tech%20Tycoon%20team,%20I%20have%20a%20question%20about%20your%20courses" 
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto bg-white/10 hover:bg-white/15 text-white font-bold px-7 py-4 rounded-xl border border-white/20 transition-all text-sm flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-white border-t border-slate-200 py-16 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Col */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src="/logo.png" alt="Tech Tycoon" className="w-10 h-10 rounded-full border border-slate-200" />
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-slate-900 leading-none">
                  TECH<span className="text-indigo-600">TYCOON</span>
                </span>
                <span className="text-[9px] font-bold text-slate-500 tracking-widest uppercase mt-0.5">
                  Digital Solution LLP
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md font-normal mb-6">
              Empowering executives, students, and businesses with practical generative AI architectures, prompt systems, and autonomous workflows.
            </p>
            <div className="flex items-center gap-3">
              <a 
                href="https://www.instagram.com/amiable_antony?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" 
                target="_blank" 
                rel="noreferrer" 
                className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href="https://www.facebook.com/profile.php?id=61575729196300" 
                target="_blank" 
                rel="noreferrer" 
                className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a 
                href="https://www.youtube.com/@amiable_antony?si=755DGI2EubK40yTJ" 
                target="_blank" 
                rel="noreferrer" 
                className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 flex items-center justify-center transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Programs */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
              Our Programs
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
              <li><Link to="/claude_masterclass" className="hover:text-indigo-600 transition-colors">Claude 3.5 Masterclass</Link></li>
              <li><Link to="/ai_masterclass" className="hover:text-indigo-600 transition-colors">AI Secrets Revealed (₹99)</Link></li>
              <li><Link to="/upscale" className="hover:text-indigo-600 transition-colors">AI Business Workshop (Chennai)</Link></li>
              <li><a href="/advanced_masterclass/" className="hover:text-indigo-600 transition-colors">Executive Generative Models</a></li>
              <li><Link to="/bootcamp" className="hover:text-indigo-600 transition-colors">30-Day Certification Bootcamp</Link></li>
              <li><Link to="/academy" className="hover:text-indigo-600 transition-colors">Tech Tycoon AI Academy</Link></li>
            </ul>
          </div>

          {/* Contact & Legal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
              Direct Contact
            </h4>
            <div className="space-y-3 text-xs text-slate-600 font-normal">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-indigo-600" />
                <a href="mailto:techtycoondigitalsolutions@gmail.com" className="hover:underline">
                  techtycoondigitalsolutions@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-indigo-600" />
                <a href="tel:+917558133039" className="hover:underline">
                  +91 75581 33039
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <a href="https://wa.me/917010340494" target="_blank" rel="noreferrer" className="hover:underline text-emerald-700 font-semibold">
                  WhatsApp Support (+91 70103 40494)
                </a>
              </div>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" /> 256-Bit SSL Secured Checkout
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright & policies */}
        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-medium">
          <p>© 2026 Tech Tycoon Digital Solution LLP. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-slate-800 transition-colors">Privacy Policy</Link>
            <span>•</span>
            <span className="text-slate-400">Chennai, Tamil Nadu, India</span>
          </div>
        </div>
      </footer>

      {/* ── MOBILE STICKY ACTION BAR ── */}
      <div className={`sm:hidden fixed bottom-4 left-4 right-4 z-50 transition-all duration-300 ${
        showStickyBar ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0 pointer-events-none"
      }`}>
        <div className="bg-slate-900/95 backdrop-blur-md p-2 rounded-2xl border border-white/10 shadow-2xl flex items-center justify-between gap-2">
          <div className="pl-3">
            <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Upcoming Cohorts</div>
            <div className="text-xs font-black text-white">From ₹99 INR</div>
          </div>
          <button 
            onClick={() => scrollToSection("programs")} 
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md active:scale-95"
          >
            <span>View Programs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
};

export default Index;
