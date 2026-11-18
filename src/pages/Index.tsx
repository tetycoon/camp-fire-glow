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

import { courses, courseCategories, type Course } from "../data/courses";
import event1 from "../assets/event-1.jpg";
import event2 from "../assets/event-2.jpg";
import event3 from "../assets/event-3.jpg";
import event4 from "../assets/event-4.jpg";
import event7 from "../assets/event-7.jpg";
import event8 from "../assets/event-8.jpg";

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

/**
 * Course card for the homepage catalog. Static landing pages (served from /public)
 * use a plain <a> so the browser loads the real static page; SPA routes use <Link>.
 */
const CourseCard: React.FC<{ course: Course }> = ({ course }) => {
  const ctaClass =
    "w-full bg-slate-900 hover:bg-indigo-600 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-sm group/btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2";
  const ctaLabel = (
    <>
      <span>View Course</span>
      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
    </>
  );
  const FormatIcon = course.category === "offline" ? MapPin : course.category === "mentorship" ? Users : course.category === "self-paced" ? Laptop : Video;

  return (
    <article className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-indigo-900/5 hover:border-indigo-200 transition-all duration-300 hover:-translate-y-1 flex flex-col group">
      {/* Thumbnail — fixed 16:9 so every card lines up */}
      <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
        <img
          src={course.image}
          alt={course.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>

        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md text-slate-900 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
          {course.tag}
        </div>

        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white text-[11px] font-bold drop-shadow">
          <Clock className="w-3.5 h-3.5" />
          {course.duration}
        </div>

        {course.fees && (
          <div className="absolute bottom-3 right-3 bg-indigo-600 text-white text-xs font-black px-3.5 py-1.5 rounded-xl shadow-md flex items-baseline gap-1.5">
            {course.fees}
            {course.originalFees && (
              <span className="text-[10px] font-semibold text-indigo-200 line-through">{course.originalFees}</span>
            )}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 mb-3">
          <FormatIcon className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{course.format}</span>
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug mb-2.5 group-hover:text-indigo-600 transition-colors">
          {course.title}
        </h3>

        <p className="text-[13px] text-slate-600 leading-relaxed line-clamp-3 mb-5">
          {course.intro}
        </p>

        <ul className="space-y-2 mb-6">
          {course.highlights.map((h, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span>{h}</span>
            </li>
          ))}
        </ul>

        {/* Footer pinned to bottom so CTAs align across a row */}
        <div className="mt-auto pt-4 border-t border-slate-100 space-y-3.5">
          <div className="space-y-1.5 text-[11px] font-semibold text-slate-500">
            {course.schedule && (
              <div className="flex items-start gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-px" />
                <span className="text-slate-700">{course.schedule}</span>
              </div>
            )}
            <div className="flex items-start gap-1.5">
              <IndianRupee className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-px" />
              <span>
                {course.fees && <strong className="text-slate-900">{course.fees}</strong>}
                {course.fees && course.feeNote && " · "}
                {course.feeNote}
              </span>
            </div>
          </div>

          {course.isStatic ? (
            <a href={course.link} className={ctaClass} aria-label={`View course: ${course.title}`}>
              {ctaLabel}
            </a>
          ) : (
            <Link to={course.link} className={ctaClass} aria-label={`View course: ${course.title}`}>
              {ctaLabel}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
};

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

  const categoryTabs = courseCategories
    .map(cat => ({
      ...cat,
      count: cat.id === "all" ? courses.length : courses.filter(c => c.category === cat.id).length,
    }))
    .filter(cat => cat.count > 0);

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
                <span>Explore All {courses.length} Programs</span>
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
      {/* Course data lives in src/data/courses.ts — keep it in sync with each landing page. */}
      <section id="programs" className="py-20 px-4 max-w-7xl mx-auto scroll-mt-24">

        {/* Section Header */}
        <div className="flex flex-col gap-6 mb-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[11px] font-bold uppercase tracking-wider mb-3">
              <BookOpen className="w-3.5 h-3.5" />
              All {courses.length} Programs In One Place
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
              Explore Our <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">AI Courses</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-normal mt-2 max-w-2xl">
              From ₹99 live workshops to 30-day bootcamps, self-paced executive courses and 1-on-1 mentorship. Pick your program and open its page for the full syllabus and registration.
            </p>
          </div>

          {/* Filter Pills — horizontally scrollable on mobile */}
          <div className="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div role="tablist" aria-label="Filter courses" className="inline-flex items-center gap-2 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200 whitespace-nowrap">
              {categoryTabs.map(tab => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === tab.id
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tab.label} <span className={activeTab === tab.id ? "text-indigo-400" : "text-slate-400"}>({tab.count})</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>

        {/* Help line */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 text-center text-sm text-slate-600">
          <span>Not sure which program fits you?</span>
          <a
            href="https://wa.me/917010340494?text=Hi%20Tech%20Tycoon%20team,%20please%20help%20me%20choose%20the%20right%20course"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 font-bold text-emerald-700 hover:text-emerald-800 underline underline-offset-4"
          >
            <MessageSquare className="w-4 h-4" />
            Ask us on WhatsApp
          </a>
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
              {courses.map(c => (
                <li key={c.id}>
                  {c.isStatic ? (
                    <a href={c.link} className="hover:text-indigo-600 transition-colors">{c.title}</a>
                  ) : (
                    <Link to={c.link} className="hover:text-indigo-600 transition-colors">{c.title}</Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Legal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
              Direct Contact
            </h4>
            <div className="space-y-3 text-xs text-slate-600 font-normal">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  No. 31, Ramalinga Nagar, Madipakkam, Chennai, TamilNadu 600091
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-indigo-600" />
                <a href="mailto:support@techtycoon.in" className="hover:underline">
                  support@techtycoon.in
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-indigo-600" />
                <a href="tel:+917558133039" className="hover:underline">
                  +91 7558133039
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <a href="https://wa.me/917558133039" target="_blank" rel="noreferrer" className="hover:underline text-emerald-700 font-semibold">
                  WhatsApp Support (+91 7558133039)
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
          <p>© 2026 Tech Tycoon Digital Solution LLP (GSTIN: 33AAZFT9667P1ZP). All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-slate-800 transition-colors">Privacy Policy</Link>
            <span>•</span>
            <span className="text-slate-400">No. 31, Ramalinga Nagar, Madipakkam, Chennai, TamilNadu 600091</span>
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
