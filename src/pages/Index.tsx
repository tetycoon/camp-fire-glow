import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Calendar, Clock, IndianRupee, ArrowRight, ExternalLink, 
  Menu, X, Globe, Linkedin, Instagram, Mail, ShieldCheck, 
  CheckCircle2, Users, Star, Award, Zap, PlayCircle,
  MessageSquare, LayoutGrid, CheckCircle, TrendingUp, Handshake,
  Facebook, Youtube, Phone
} from "lucide-react";
import imgEntrepreneur from "../assets/indian_entrepreneur.png";
import imgAnalytics from "../assets/indian_analytics.png";

interface Course {
  title: string;
  intro: string;
  fees: string;
  date: string;
  timing: string;
  image: string;
  link: string;
  isExternal: boolean;
  tag?: string;
}

const courses: Course[] = [
  {
    title: "AI Secrets Revealed",
    tag: "Most Popular",
    intro: "Our AI Business Generative Foundation Class is a specialized 3-hour session where you'll learn ChatGPT Personalization, Prompt Engineering practice, and everything you need to build a business from scratch—starting with niche selection, name, logo, images, video, and slogan, plus hands-on practice with 10+ AI tools! 🚀",
    fees: "₹99",
    date: "Upcoming Saturday",
    timing: "6:00 PM – 9:00 PM IST",
    image: imgEntrepreneur,
    link: "/ai_masterclass",
    isExternal: false,
  },
  {
    title: "Mastering AI Business Generative Model",
    tag: "Advanced",
    intro: "The definitive program for business leaders. Automate complex operations and build high-converting generative systems for your enterprise.",
    fees: "₹4,999",
    date: "Live (4 Weekend Days)",
    timing: "6:00 PM – 9:00 PM IST",
    image: imgAnalytics,
    link: "/advanced_masterclass/",
    isExternal: false,
  },
  {
    title: "AI Business Principles",
    tag: "Offline Workshop",
    intro: "Master the 9 pillars of Business Generative Models in this 8-hour deep dive. Build your complete AI system live with expert guidance.",
    fees: "₹4,999",
    date: "May 31st",
    timing: "9:30 AM – 5:30 PM IST",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
    link: "/upscale",
    isExternal: false,
  },
  {
    title: "AI Summer Bootcamp",
    tag: "Certification",
    intro: "A rigorous 30-day architectural immersion. Master agentic workflows, LLM orchestration, and the foundations of professional AI autonomy.",
    fees: "Enquire for Pricing",
    date: "Starting May 1st",
    timing: "3 Hrs Daily (Flexi Slots)",
    image: "/images/summer_camp.jpg",
    link: "/bootcamp",
    isExternal: false,
  }
];

const testimonials = [
  {
    name: "Rajesh Kumar",
    role: "Proprietor, RK Enterprises",
    content: "The ₹99 masterclass was an eye-opener. I automated my client follow-ups in just one day. Incredible value!",
    rating: 5
  },
  {
    name: "Priya Sharma",
    role: "Digital Marketer",
    content: "The AI Bootcamp is hands-down the best investment I've made this year. The agentic workflow module is pure gold.",
    rating: 5
  },
  {
    name: "Arun V.",
    role: "MBA Student",
    content: "Learned more about real-world AI applications in 8 hours than my entire semester. Practical and fast-paced.",
    rating: 5
  }
];

const partners = ["Meta Business", "Razorpay", "Google Cloud", "AWS", "OpenAI", "Anthropic", "Canvas", "Zapier"];

const Index: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const [imageOrder, setImageOrder] = useState([0, 1, 2]);
  
  const heroImages = [
    "/images/D55A8334.JPG",
    "/images/D55A0055.JPG",
    "/images/WhatsApp Image 2025-04-29 at 23.09.37_e0aca46f.jpg"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setImageOrder(prev => [prev[1], prev[2], prev[0]]);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      setShowStickyCTA(window.scrollY > 800);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
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

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans overflow-x-hidden selection:bg-brandGreen selection:text-slate-900">
      
      {/* Premium Glass Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? "glass-navbar py-3 shadow-lg" : "bg-transparent py-6"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="relative">
                <div className="absolute inset-0 bg-brandGreen rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <img src="/logo.png" alt="TechTycoon" className="relative w-11 h-11 rounded-full border border-gray-100 shadow-md transform transition-transform group-hover:rotate-12" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tighter text-slate-900 uppercase leading-none">TechTycoon</span>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">Digital Solution LLP</span>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-10">
              <button onClick={() => scrollTo("services")} className="text-[13px] font-black text-slate-500 hover:text-slate-900 uppercase tracking-widest transition-colors relative group">
                Curriculum
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brandGreen transition-all group-hover:w-full"></span>
              </button>
              <button onClick={() => scrollTo("training")} className="text-[13px] font-black text-slate-500 hover:text-slate-900 uppercase tracking-widest transition-colors relative group">
                Programs
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brandGreen transition-all group-hover:w-full"></span>
              </button>
              <button onClick={() => scrollTo("mentor")} className="text-[13px] font-black text-slate-500 hover:text-slate-900 uppercase tracking-widest transition-colors relative group">
                Mentor
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brandGreen transition-all group-hover:w-full"></span>
              </button>
              <Link to="/main" className="text-[13px] font-black text-slate-500 hover:text-slate-900 uppercase tracking-widest transition-colors relative group">
                Vision
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brandGreen transition-all group-hover:w-full"></span>
              </Link>
              <button onClick={() => scrollTo("training")} className="bg-slate-900 hover:bg-slate-800 text-white text-[12px] font-black tracking-widest uppercase px-7 py-3 rounded-full transition-all hover:shadow-[0_10px_20px_rgba(0,0,0,0.1)] active:scale-95">
                Join Now
              </button>
            </div>

            <button className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full bg-slate-900 text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
           <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-2xl px-6 py-10 flex flex-col gap-6 animate-in slide-in-from-top duration-300">
              <button onClick={() => scrollTo("services")} className="text-left font-black text-slate-900 text-2xl tracking-tight">Curriculum</button>
              <button onClick={() => scrollTo("training")} className="text-left font-black text-slate-900 text-2xl tracking-tight">Programs</button>
              <button onClick={() => scrollTo("mentor")} className="text-left font-black text-slate-900 text-2xl tracking-tight">Mentor</button>
              <button onClick={() => scrollTo("contact")} className="text-left font-black text-slate-900 text-2xl tracking-tight">Contact</button>
              <button onClick={() => scrollTo("training")} className="bg-slate-900 text-white font-black py-5 rounded-2xl mt-4 text-center tracking-widest uppercase">Explore Programs</button>
           </div>
        )}
      </nav>

      {/* Dynamic Hero Section */}
      <section className="relative pt-20 pb-16 px-4 overflow-hidden bg-[#E899B0]/5">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brandGreen/5 rounded-full blur-[120px] -z-10 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#E899B0]/10 rounded-full blur-[150px] -z-10"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#E899B0]/10 rounded-full blur-[120px] -z-10"></div>
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-100/20 rounded-full blur-[100px] -z-10"></div>
        
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="flex flex-col items-start">
            <div className="inline-flex items-center gap-3 mb-8 px-5 py-2.5 rounded-full bg-slate-50 border border-slate-100 shadow-sm">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brandGreen opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brandGreen"></span>
                </span>
                <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.25em]">
                  The Future of Corporate AI Enablement
                </span>
            </div>
            
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black leading-tight tracking-tighter mb-10">
               <span className="text-royal-blue block mb-2">Master AI &</span> 
               <span className="text-royal-gold text-3xl sm:text-4xl lg:text-5xl block tracking-[0.15em] uppercase">Transform Your Future.</span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-slate-600 font-medium leading-relaxed max-w-xl mb-12">
               TechTycoon is the premium destination for <span className="text-slate-900 font-black">AI Learning Platform</span>. We weaponize executives, students, and teams with the systems needed to lead the AI digital era.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto">
              <button onClick={() => scrollTo("training")} className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-black px-10 py-5 rounded-2xl flex items-center justify-center gap-4 transition-all hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)] hover:-translate-y-1 active:scale-95">
                Secure Your Seat <ArrowRight className="w-6 h-6" />
              </button>
              <div className="flex -space-x-4">
                 {[1,2,3,4].map(i => (
                    <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center overflow-hidden">
                       <img src={`https://i.pravatar.cc/150?u=${i+10}`} alt="user" />
                    </div>
                 ))}
                 <div className="w-12 h-12 rounded-full border-4 border-white bg-brandGreen flex items-center justify-center text-white text-[10px] font-black">
                    4.8k+
                 </div>
              </div>
            </div>
          </div>

          <div className="relative lg:block hidden">
             <div className="absolute -inset-10 bg-brandGreen/5 blur-[80px] rounded-full"></div>
             <div className="relative z-10 grid grid-cols-6 grid-rows-6 gap-4 h-[600px]">
                <div className="col-span-4 row-span-4 overflow-hidden rounded-[3rem] shadow-2xl border-4 border-white animate-float-slow transition-all duration-1000">
                  <img 
                    key={imageOrder[0]}
                    src={heroImages[imageOrder[0]]} 
                    className="w-full h-full object-cover animate-shuffle" 
                    alt="Elite Training" 
                  />
                </div>
                <div className="col-span-2 row-span-2 col-start-5 row-start-2 overflow-hidden rounded-3xl shadow-xl border-4 border-white animate-float-medium delay-75 transition-all duration-1000">
                  <img 
                    key={imageOrder[1]}
                    src={heroImages[imageOrder[1]]} 
                    className="w-full h-full object-cover animate-in fade-in duration-1000" 
                    alt="Web Systems" 
                  />
                </div>
                <div className="col-span-3 row-span-3 col-start-3 row-start-4 overflow-hidden rounded-[2.5rem] shadow-2xl border-4 border-white z-20 translate-y-4 animate-float-slow delay-150 transition-all duration-1000">
                  <img 
                    key={imageOrder[2]}
                    src={heroImages[imageOrder[2]]} 
                    className="w-full h-full object-cover animate-in fade-in duration-1000" 
                    alt="Bootcamp" 
                  />
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Infinite Scroll Trust Bar */}
      <div className="py-6 bg-white border-y border-gray-100 overflow-hidden relative">
         <div className="absolute left-0 top-0 bottom-0 w-40 bg-gradient-to-r from-white to-transparent z-10 transition-opacity duration-300"></div>
         <div className="absolute right-0 top-0 bottom-0 w-40 bg-gradient-to-l from-white to-transparent z-10"></div>
         
         <div className="animate-scroll-left opacity-30 grayscale hover:grayscale-0 transition-all duration-300">
            {[...partners, ...partners].map((partner, i) => (
              <div key={i} className="flex items-center gap-3 px-12">
                < Award className="w-6 h-6" />
                <span className="text-2xl font-black uppercase tracking-widest">{partner}</span>
              </div>
            ))}
         </div>
      </div>

      {/* Training Programs Grid */}
      <section id="training" className="py-16 px-4 bg-gray-50 relative">
        <div className="max-w-7xl mx-auto mb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
               <div>
                  <div className="inline-block px-4 py-1.5 rounded-full bg-brandGreen/10 text-brandGreen text-[10px] font-black uppercase tracking-widest mb-6">Upcoming Cohorts</div>
                  <h2 className="text-5xl sm:text-7xl font-black text-slate-900 tracking-tighter leading-none">Elite <span className="hero-gradient-text">Programs.</span></h2>
               </div>
               <p className="text-lg text-slate-500 max-w-md font-medium leading-relaxed">
                  Strictly limited seats to maintain quality. Choose your intensity level and start your transformation today.
               </p>
            </div>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
          {courses.map((course, idx) => (
            <div key={idx} className="bg-white rounded-[2.5rem] overflow-hidden group border border-gray-100/50 flex flex-col md:flex-row transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_40px_80px_rgba(0,0,0,0.08)]">
              {/* Image section */}
              <div className="h-64 md:h-auto md:w-2/5 relative overflow-hidden">
                <img 
                  src={course.image} 
                  alt={course.title} 
                  className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105" 
                />
                <div className="absolute top-6 left-6 bg-slate-900 text-white px-4 py-2 rounded-2xl text-xs font-black shadow-xl">
                  {course.fees}
                </div>
                {course.tag && (
                  <div className="absolute top-16 left-6 bg-brandGreen text-slate-900 px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl">
                    {course.tag}
                  </div>
                )}
              </div>

              {/* Content section */}
              <div className="p-10 flex-1 flex flex-col justify-between">
                <div>
                   <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter leading-tight">
                     {course.title}
                   </h3>
                   <p className="text-slate-500 text-sm leading-relaxed mb-8 font-medium">
                     {course.intro}
                   </p>
                </div>

                <div>
                   <div className="grid grid-cols-2 gap-6 mb-10">
                      <div>
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Schedule</p>
                         <p className="text-sm font-black text-slate-900">{course.date}</p>
                      </div>
                      <div>
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Timings</p>
                         <p className="text-sm font-black text-slate-900">{course.timing}</p>
                      </div>
                   </div>

                   {course.isExternal ? (
                     <a 
                       href={course.link}
                       className="w-full bg-slate-50 hover:bg-slate-100 text-slate-900 font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all border border-gray-100 group/btn tracking-widest uppercase text-xs"
                     >
                       Full Details <ExternalLink className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                     </a>
                   ) : (
                     <Link 
                       to={course.link}
                       className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all tracking-widest uppercase text-xs hover:shadow-xl active:scale-95 group/btn"
                     >
                       {course.link === "/bootcamp" ? "Enquire Now" : "Reserve Seat"} <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                     </Link>
                   )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Meet the Founder Section */}
      <section id="mentor" className="py-32 px-4 bg-slate-900 overflow-hidden relative border-y border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-brandGreen/10 via-slate-900 to-slate-900"></div>
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
                <div className="absolute inset-0 bg-brandGreen/20 blur-[100px] rounded-full"></div>
                <div className="relative rounded-[3rem] overflow-hidden border-8 border-slate-800 shadow-2xl skew-y-2 transform hover:skew-y-0 transition-transform duration-700">
                    <img src="/images/profile.png" alt="Antony Praveen" className="w-full grayscale hover:grayscale-0 transition-all duration-1000" />
                    <div className="absolute bottom-4 left-4 right-4 p-5 glass-panel border-white/5 rounded-2xl">
                       <p className="text-white font-black text-xl mb-0.5 tracking-tight">Antony Praveen</p>
                       <p className="text-brandGreen font-black uppercase tracking-widest text-[9px]">Founder & Lead AI Strategist</p>
                    </div>
                </div>
            </div>
            
            <div className="flex flex-col items-start">
               <div className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-brandGreen font-black text-[10px] uppercase tracking-[0.2em]">
                  The Architect Behind the Funnel
               </div>
               <h2 className="text-5xl sm:text-6xl font-black text-white mb-8 tracking-tighter leading-none">Learn From Someone Who <span className="text-brandGreen">Does.</span></h2>
               <p className="text-xl text-slate-400 font-medium leading-relaxed mb-10 max-w-xl">
                  Antony is a systems architect who has trained thousands of corporate leaders. He doesn't just teach AI—he builds the infrastructures that run AI-first businesses. His mission is to turn complex algorithms into <span className="text-white font-bold">practical, profit-generating systems.</span>
               </p>
               
               <div className="grid grid-cols-2 gap-8 mb-12 w-full">
                  <div>
                     <p className="text-4xl font-black text-white mb-1">4.8k+</p>
                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Students Trained</p>
                  </div>
                  <div>
                     <p className="text-4xl font-black text-white mb-1">150+</p>
                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Corporate Clients</p>
                  </div>
               </div>
               
               <button onClick={() => scrollTo("training")} className="bg-brandGreen text-slate-900 font-black px-10 py-5 rounded-2xl flex items-center justify-center gap-4 transition-all hover:shadow-[0_20px_40px_rgba(202,255,145,0.2)] active:scale-95 leading-none tracking-widest uppercase text-xs">
                  Join the Session <Zap className="w-5 h-5 fill-slate-900" />
               </button>
            </div>
        </div>
      </section>

      {/* Social Proof Masonry */}
      <section className="py-32 px-4 bg-white overflow-hidden">
         <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-20 items-center">
            <div className="lg:w-1/3">
               <h2 className="text-5xl font-black text-slate-900 mb-8 tracking-tighter leading-tight">What the <span className="hero-gradient-text">Alumni</span> Say.</h2>
               <p className="text-lg text-slate-500 mb-10 font-medium">Join 4,800+ professionals who have redefined their career trajectory with our systems.</p>
               <div className="flex items-center gap-6 p-6 rounded-3xl bg-slate-50 border border-slate-100">
                  <div className="w-14 h-14 bg-brandGreen rounded-2xl flex items-center justify-center text-slate-900 font-black text-xl">4.9</div>
                  <div>
                     <div className="flex gap-1 mb-1">
                        {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-brandGreen text-brandGreen" />)}
                     </div>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Across Google & Trustpilot</p>
                  </div>
               </div>
            </div>
            
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
               {testimonials.map((t, i) => (
                  <div key={i} className={`p-8 rounded-3xl border border-gray-100 hover:shadow-xl transition-all duration-500 ${i === 1 ? "md:mt-8 bg-slate-50" : "bg-white"}`}>
                     <div className="flex gap-1 mb-6">
                        {[1,2,3,4,5].map(j => <Star key={j} className="w-3 h-3 fill-slate-900 text-slate-900 opacity-20" />)}
                     </div>
                     <p className="text-lg font-black text-slate-900 italic mb-8 leading-relaxed">"{t.content}"</p>
                     <div>
                        <p className="text-[12px] font-black text-slate-900 uppercase tracking-widest">{t.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.role}</p>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* CTA Final Banner */}
      <section className="px-4 py-20 pb-40">
         <div className="max-w-7xl mx-auto rounded-[3rem] bg-slate-900 p-12 sm:p-24 relative overflow-hidden flex flex-col items-center text-center">
            <div className="absolute inset-0 bg-brandGreen opacity-20 blur-[100px] -z-0"></div>
            <h2 className="relative z-10 text-5xl sm:text-7xl font-black text-white mb-10 tracking-tighter leading-none">Ready to <span className="text-brandGreen underline decoration-8 underline-offset-8">Lead?</span></h2>
            <p className="relative z-10 text-xl sm:text-2xl text-slate-400 mb-12 max-w-2xl font-medium">
               The window for early AI adoption is closing. Secure your competitive edge with India's most practical training hub.
            </p>
            <button onClick={() => scrollTo("training")} className="relative z-10 bg-white text-slate-900 font-black px-12 py-6 rounded-2xl flex items-center justify-center gap-4 transition-all hover:scale-105 hover:bg-brandGreen hover:shadow-[0_20px_50px_rgba(202,255,145,0.3)] shadow-2xl active:scale-95 leading-none tracking-widest uppercase text-sm">
               Start Transformation <Zap className="w-5 h-5 fill-slate-900" />
            </button>
         </div>
      </section>

      {/* Premium Footer */}
      <footer id="contact" className="bg-slate-900 pt-32 pb-16 px-4 border-t border-white/5 relative z-20">
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
            <div className="md:col-span-2">
               <div className="flex items-center gap-4 mb-8 group">
                 <img src="/logo.png" alt="TechTycoon" className="w-14 h-14 rounded-full border-2 border-slate-700 bg-white shadow-xl transform transition-transform group-hover:scale-110" />
                 <div className="flex flex-col">
                   <span className="text-2xl font-black tracking-tighter text-white uppercase leading-none">TechTycoon</span>
                   <span className="text-[10px] font-black text-brandGreen uppercase tracking-[0.3em] mt-1.5">Digital Solution LLP</span>
                 </div>
               </div>
               <p className="text-slate-400 font-medium leading-relaxed max-w-md mb-10 text-lg">
                  Engineering the next generation of digital leaders through practical AI systems and autonomous workflows. High performance is no longer optional.
               </p>
               <div className="flex items-center gap-4">
                  {[
                    { icon: Instagram, link: "https://www.instagram.com/amiable_antony?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" },
                    { icon: Facebook, link: "https://www.facebook.com/profile.php?id=61575729196300" },
                    { icon: Youtube, link: "https://www.youtube.com/@amiable_antony?si=755DGI2EubK40yTJ" }
                  ].map((social, i) => (
                    <a key={i} href={social.link} target="_blank" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-brandGreen hover:text-slate-900 text-white transition-all transform hover:-translate-y-1">
                       <social.icon className="w-5 h-5" />
                    </a>
                  ))}
               </div>
            </div>

            <div>
               <h4 className="text-[11px] font-black text-white uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
                  <span className="w-6 h-px bg-brandGreen"></span> Ecosystem
               </h4>
               <ul className="space-y-6">
                  {["AI Secrets Revealed", "Executive Mastery", "Upscale Workshop", "Summer Bootcamp"].map(name => (
                    <li key={name}>
                       <button onClick={() => scrollTo("training")} className="text-slate-400 hover:text-white font-black text-[13px] uppercase tracking-widest transition-all hover:translate-x-1 block">
                          {name}
                       </button>
                    </li>
                  ))}
               </ul>
            </div>

            <div>
               <h4 className="text-[11px] font-black text-white uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
                  <span className="w-6 h-px bg-brandGreen"></span> Secure Access
               </h4>
               <div className="flex flex-col gap-8">
                  <div className="flex items-center gap-4 text-slate-400 group">
                     <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-brandGreen group-hover:text-brandGreen transition-all">
                        <Mail className="w-4 h-4" />
                     </div>
                     <a href="mailto:techtycoondigitalsolutions@gmail.com" className="hover:text-white text-[13px] font-black uppercase tracking-widest transition-colors">techtycoondigitalsolutions@gmail.com</a>
                  </div>
                  <div className="flex items-center gap-4 text-slate-400 group">
                     <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-brandGreen group-hover:text-brandGreen transition-all">
                        <Phone className="w-4 h-4" />
                     </div>
                     <a href="tel:+917558133039" className="hover:text-white text-[13px] font-black uppercase tracking-widest transition-colors">+91 75581 33039</a>
                  </div>
                  <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-brandGreen/5 border border-brandGreen/20 text-brandGreen">
                     <ShieldCheck className="w-5 h-5" />
                     <span className="text-[10px] font-black uppercase tracking-widest">SSL Payments Secured</span>
                  </div>
               </div>
            </div>
         </div>

         <div className="max-w-7xl mx-auto pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
               © 2026 TechTycoon Digital Solutions LLP. No Play. All Work.
            </p>
            <div className="flex gap-8">
               <Link to="/privacy" className="text-[9px] font-black text-slate-600 hover:text-brandGreen uppercase tracking-widest transition-colors">Privacy Policy</Link>
               <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Chennai, India</span>
            </div>
         </div>
      </footer>

      {/* High-Conversion Sticky Mobile CTA */}
      <div className={`lg:hidden fixed bottom-6 left-6 right-6 z-[1000] transition-all duration-700 transform ${showStickyCTA ? "translate-y-0 opacity-100" : "translate-y-32 opacity-0"}`}>
         <button onClick={() => scrollTo("training")} className="w-full bg-slate-900 border border-white/20 text-white font-black py-4 rounded-2xl shadow-2xl flex items-center justify-center gap-3 animate-pulse-glow">
            Enroll Now <IndianRupee className="w-4 h-4" />
         </button>
      </div>

    </div>
  );
};

export default Index;
