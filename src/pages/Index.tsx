import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, IndianRupee, ArrowRight, ExternalLink, Menu, X, Globe, Linkedin, Instagram, Mail, ShieldCheck, CheckCircle2 } from "lucide-react";
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
}

const courses: Course[] = [
  {
    title: "AI Secrets Revealed",
    intro: "In just 3 hours, learn to build a powerful digital brand, attract quality leads, and automate your marketing using the latest AI tools.",
    fees: "₹99",
    date: "Every Saturday",
    timing: "6:00 PM – 9:00 PM IST",
    image: imgEntrepreneur,
    link: "/ai_masterclass",
    isExternal: false,
  },
  {
    title: "Executive AI Mastery Program",
    intro: "Stop guessing. Start scaling. We train business owners & entrepreneurs to automate growth and build high-converting websites.",
    fees: "₹4,999",
    date: "4 Days (May 16, 17, 23, 24)",
    timing: "6:00 PM – 9:00 PM IST",
    image: imgAnalytics,
    link: "/advanced_masterclass/",
    isExternal: true,
  },
  {
    title: "AI Business Generative Model (Advanced)",
    intro: "Build Your Complete AI Business System in 8 Hours. Master the high-performance 9 Principles of Business Generative Models.",
    fees: "₹4,999",
    date: "May 31, 2026",
    timing: "9:30 AM – 5:30 PM IST",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
    link: "/upscale",
    isExternal: false,
  },
  {
    title: "AI Summer Bootcamp '26",
    intro: "The ultimate 30-day architectural deep-dive into generative systems, agentic workflows, and the future of professional autonomy.",
    fees: "₹9,999",
    date: "May 1 – May 30, 2026",
    timing: "3 Hrs Daily (AM/PM Slots)",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80",
    link: "/bootcamp",
    isExternal: false,
  }
];

const Index: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setOpen(false);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans overflow-x-hidden selection:bg-brandGreen selection:text-slate-900">
      
      {/* Navigation Layer */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 py-3" : "bg-white py-5"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
              <img src="/logo.png" alt="TechTycoon Digital Solutions LLP" className="w-10 h-10 rounded-full border border-gray-200 shadow-sm" />
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-slate-900 uppercase leading-none">TechTycoon</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Digital Solutions LLP</span>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollTo("services")} className="text-sm font-bold text-slate-600 hover:text-brandGreen transition-colors">Services</button>
              <button onClick={() => scrollTo("training")} className="text-sm font-bold text-slate-600 hover:text-brandGreen transition-colors">Training Programs</button>
              <button onClick={() => scrollTo("contact")} className="text-sm font-bold text-slate-600 hover:text-brandGreen transition-colors">Contact</button>
              <button onClick={() => scrollTo("training")} className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold px-6 py-2.5 rounded-lg transition-all">Explore Courses</button>
            </div>

            <button className="md:hidden p-2 text-slate-900" onClick={() => setOpen(!open)}>
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {open && (
           <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-xl px-4 py-6 flex flex-col gap-4">
              <button onClick={() => scrollTo("services")} className="text-left font-bold text-slate-600 text-lg">Services</button>
              <button onClick={() => scrollTo("training")} className="text-left font-bold text-slate-600 text-lg">Training Programs</button>
              <button onClick={() => scrollTo("contact")} className="text-left font-bold text-slate-600 text-lg">Contact</button>
              <button onClick={() => scrollTo("training")} className="bg-slate-900 text-white font-bold py-3 rounded-lg mt-2">Explore Courses</button>
           </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-4 overflow-hidden border-b border-gray-100">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-50 via-white to-white opacity-60"></div>
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div className="flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-[#f0fdf4] border border-brandGreen/30">
              <span className="w-2 h-2 rounded-full bg-brandGreen animate-pulse" />
              <span className="text-xs font-black text-green-800 uppercase tracking-wider">
                India's Premiere AI Training Hub
              </span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-slate-900 leading-[1.05] tracking-tight mb-6">
              Transforming <span className="text-brandGreen">Intelligence</span> Into ROI.
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-600 font-medium leading-relaxed max-w-xl mb-10">
              TechTycoon Digital Solutions LLP is the trusted leader in <span className="text-slate-900 font-bold">corporate enablement</span> and <span className="text-slate-900 font-bold">executive education</span>. We provide world-class AI training specialized for corporate teams, ambitious students, and scaling business owners.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <button onClick={() => scrollTo("training")} className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-black px-8 py-4 rounded-xl flex items-center justify-center gap-3 transition-transform hover:-translate-y-1">
                Explore Programs <ArrowRight className="w-5 h-5" />
              </button>
              <button onClick={() => scrollTo("services")} className="w-full sm:w-auto bg-white hover:bg-gray-50 text-slate-900 border border-gray-200 font-bold px-8 py-4 rounded-xl transition-all">
                Learn About Us
              </button>
            </div>
          </div>

          <div className="relative">
             <div className="absolute inset-0 bg-brandGreen blur-3xl opacity-20 rounded-full"></div>
             <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80" alt="Corporate Training" className="relative z-10 w-full h-[500px] object-cover rounded-[2.5rem] shadow-2xl border-4 border-white" />
             
             {/* Floating Badge */}
             <div className="absolute bottom-8 -left-8 z-20 bg-white p-5 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-4 animate-float">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-brandGreen" />
                </div>
                <div>
                   <p className="text-3xl font-black text-slate-900 leading-none mb-1">4.9/5</p>
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Average Rating</p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Training Programs */}
      <section id="training" className="py-24 px-4 bg-gray-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto mb-16 text-center">
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">Our Elite <span className="text-brandGreen">Programs</span></h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium">Reserve your seat in our upcoming live sessions, offline workshops, and rigorous bootcamps.</p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10">
        {courses.map((course, idx) => (
          <div key={idx} className="bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col md:flex-row transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] group">
            {/* Image section */}
            <div className="h-56 md:h-auto md:w-2/5 md:max-w-[300px] bg-slate-100 relative overflow-hidden flex items-center justify-center">
              <img 
                src={course.image} 
                alt={course.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              />
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm border border-gray-200 flex items-center gap-1">
                <IndianRupee className="w-3.5 h-3.5 text-brandGreen" />
                <span className="text-sm font-black text-slate-900">{course.fees.replace('₹', '')}</span>
              </div>
            </div>

            {/* Content section */}
            <div className="p-8 flex-1 flex flex-col justify-between">
              <div>
                 <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight leading-tight">
                   {course.title}
                 </h3>
                 <p className="text-slate-600 text-sm leading-relaxed mb-6">
                   {course.intro}
                 </p>
              </div>

              <div>
                 <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                       <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Calendar className="w-3 h-3"/> Date</div>
                       <div className="text-sm font-bold text-slate-900 leading-tight">{course.date}</div>
                    </div>
                    <div>
                       <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Clock className="w-3 h-3"/> Timing</div>
                       <div className="text-sm font-bold text-slate-900 leading-tight">{course.timing}</div>
                    </div>
                 </div>

                 {course.isExternal ? (
                   <a 
                     href={course.link}
                     className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors border border-slate-900"
                   >
                     View Full Details <ExternalLink className="w-4 h-4 ml-1" />
                   </a>
                 ) : (
                   <Link 
                     to={course.link}
                     className="w-full bg-brandGreen hover:bg-[#a3c77e] text-slate-900 font-black py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors border border-[#a3c77e]"
                   >
                     View Full Details <ArrowRight className="w-4 h-4 ml-1" />
                   </Link>
                 )}
              </div>
            </div>
          </div>
        ))}
      </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 px-4 bg-white border-b border-gray-100">
         <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
               <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4 tracking-tight">Who We Train</h2>
               <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium">Our curriculums are rigorously engineered for three distinct demographics to ensure maximum impact and practical application.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-shadow">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                     <span className="text-2xl">🏢</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-4">Corporate Teams</h3>
                  <p className="text-slate-600 leading-relaxed font-medium">Enterprise-grade AI adoption strategy and upskilling to automate workflows, optimize productivity, and securely integrate LLMs into your current tech stack.</p>
               </div>
               
               <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-shadow">
                  <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-6">
                     <span className="text-2xl">💼</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-4">Business Owners</h3>
                  <p className="text-slate-600 leading-relaxed font-medium">Executive mastery programs designed exclusively for entrepreneurs to multiply turnover, automate lead generation, and build high-converting digital systems.</p>
               </div>

               <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-shadow">
                  <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-6">
                     <span className="text-2xl">🎓</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-4">Aspiring Students</h3>
                  <p className="text-slate-600 leading-relaxed font-medium">Comprehensive bootcamps giving college students the exact architectural skills top employers demand to secure premium roles in the digital era.</p>
               </div>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-slate-900 pt-20 pb-10 px-4 border-t border-slate-800">
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2">
               <div className="flex items-center gap-3 mb-6">
                 <img src="/logo.png" alt="TechTycoon Logo" className="w-12 h-12 rounded-full border border-slate-700 bg-white" />
                 <div className="flex flex-col">
                   <span className="text-xl font-black tracking-tight text-white uppercase leading-none">TechTycoon</span>
                   <span className="text-[10px] font-bold text-brandGreen uppercase tracking-widest mt-0.5">Digital Solutions LLP</span>
                 </div>
               </div>
               <p className="text-slate-400 font-medium leading-relaxed max-w-sm mb-8">
                  Leading the charge in digital transformation. We train modern professionals, students, and corporate teams to master AI automation and generative models.
               </p>
               <div className="flex items-center gap-3">
                  <a href="https://www.techtycoon.in/" target="_blank" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-brandGreen hover:text-slate-900 text-slate-400 transition-colors">
                     <Globe className="w-4 h-4" />
                  </a>
                  <a href="https://www.linkedin.com/in/antony-praveen-techtycoon" target="_blank" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-brandGreen hover:text-slate-900 text-slate-400 transition-colors">
                     <Linkedin className="w-4 h-4" />
                  </a>
                  <a href="https://www.instagram.com/amiable_antony" target="_blank" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-brandGreen hover:text-slate-900 text-slate-400 transition-colors">
                     <Instagram className="w-4 h-4" />
                  </a>
               </div>
            </div>

            <div>
               <h4 className="text-sm font-black text-white uppercase tracking-widest mb-6 relative pl-3 before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-brandGreen">Programs</h4>
               <ul className="space-y-4">
                  <li><button onClick={() => scrollTo("training")} className="text-slate-400 hover:text-brandGreen font-bold text-sm transition-colors">AI Secrets Revealed</button></li>
                  <li><button onClick={() => scrollTo("training")} className="text-slate-400 hover:text-brandGreen font-bold text-sm transition-colors">Executive Mastery</button></li>
                  <li><button onClick={() => scrollTo("training")} className="text-slate-400 hover:text-brandGreen font-bold text-sm transition-colors">Upscale Workshop</button></li>
                  <li><button onClick={() => scrollTo("training")} className="text-slate-400 hover:text-brandGreen font-bold text-sm transition-colors">Summer Bootcamp</button></li>
               </ul>
            </div>

            <div>
               <h4 className="text-sm font-black text-white uppercase tracking-widest mb-6 relative pl-3 before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-brandGreen">Contact</h4>
               <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 text-slate-400">
                     <Mail className="w-4 h-4 text-brandGreen" />
                     <a href="mailto:techtycoondigitalsolutions@gmail.com" className="hover:text-brandGreen text-sm font-bold transition-colors">techtycoondigitalsolutions@gmail.com</a>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-brandGreen bg-slate-800/50 p-3 rounded-xl border border-slate-800 w-fit">
                     <ShieldCheck className="w-5 h-5" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Payments Secured</span>
                  </div>
               </div>
            </div>
         </div>

         <div className="max-w-7xl mx-auto border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
               © 2026 TechTycoon Digital Solutions LLP. All Rights Reserved.
            </p>
         </div>
      </footer>

    </div>
  );
};

export default Index;
