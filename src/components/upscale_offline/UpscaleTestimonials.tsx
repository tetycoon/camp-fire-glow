import React from "react";
import { Star, Quote } from "lucide-react";

const testimonials = [
    {
        name: "Karthik Raj",
        role: "Founder, DigiScale Agency",
        quote: "This workshop completely changed how I approach AI for lead generation. I built my entire sales funnel during the session itself. Within 2 weeks, I signed 3 new clients using the exact system we built that day.",
        rating: 5,
        initials: "KR"
    },
    {
        name: "Priya Shankar",
        role: "Marketing Head, TechVista",
        quote: "The 9 Principles framework is pure gold. I've attended dozens of AI workshops, but this was the first where I walked out with a fully functional business system, not just theory slides.",
        rating: 5,
        initials: "PS"
    },
    {
        name: "Mohammed Arif",
        role: "Business Coach",
        quote: "Antony's teaching style is phenomenal — practical, no-nonsense, and deeply insightful. The AI video generation module alone was worth 10x the ticket price. My content production tripled.",
        rating: 5,
        initials: "MA"
    },
    {
        name: "Deepa Venkatesh",
        role: "E-commerce Entrepreneur",
        quote: "I was skeptical about paying ₹4,999 for a 1-day workshop. By lunch, I had already built my AI-powered website. Best investment I've made for my business this year.",
        rating: 5,
        initials: "DV"
    },
    {
        name: "Ravi Kumar",
        role: "Freelance Consultant",
        quote: "The networking lunch alone connected me with 3 potential partners. Add the AI tools mastery and the printed workbook — this is elite-level training at an unbeatable price.",
        rating: 5,
        initials: "RK"
    },
    {
        name: "Lakshmi Narayanan",
        role: "Corporate Trainer",
        quote: "I've been training corporates for 8 years. After this session, I integrated AI into every single workshop I deliver. My clients now call me the 'AI Trainer'. Game changer.",
        rating: 5,
        initials: "LN"
    }
];

const UpscaleTestimonials: React.FC = () => {
    return (
        <section id="testimonials" className="py-24 px-6 bg-white relative overflow-hidden">
            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-50 rounded-full blur-[120px] opacity-40"></div>
            
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                        ⭐ REAL RESULTS FROM REAL PEOPLE
                    </div>
                    <h2 className="text-4xl lg:text-6xl font-black text-slate-900 leading-tight mb-6 tracking-tighter">
                        What Our Alumni <br />
                        <span className="bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent italic">Have to Say.</span>
                    </h2>
                    <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">
                        Join 4,800+ professionals who've transformed their businesses with our AI frameworks.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {testimonials.map((t, i) => (
                        <div 
                            key={i} 
                            className="group p-8 rounded-[32px] border border-slate-100 bg-white hover:border-blue-200 hover:shadow-[0_32px_80px_rgba(59,130,246,0.08)] transition-all duration-500 flex flex-col relative overflow-hidden"
                        >
                            <div className="absolute -top-8 -right-8 w-24 h-24 bg-blue-50/50 rounded-full blur-[30px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            
                            <Quote className="w-8 h-8 text-blue-100 mb-4 group-hover:text-blue-300 transition-colors" />
                            
                            <p className="text-slate-600 font-medium leading-relaxed mb-6 flex-grow text-[15px]">
                                "{t.quote}"
                            </p>
                            
                            <div className="flex items-center gap-4 pt-6 border-t border-slate-100">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-500/20">
                                    {t.initials}
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-black text-slate-900">{t.name}</div>
                                    <div className="text-[11px] font-bold text-slate-400">{t.role}</div>
                                </div>
                                <div className="flex gap-0.5">
                                    {Array.from({ length: t.rating }).map((_, j) => (
                                        <Star key={j} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Stats Banner */}
                <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { value: "4,800+", label: "Students Trained" },
                        { value: "4.9/5", label: "Average Rating" },
                        { value: "50+", label: "Workshops Done" },
                        { value: "92%", label: "Recommend to Others" }
                    ].map((stat, i) => (
                        <div key={i} className="text-center p-6 rounded-[24px] bg-slate-50 border border-slate-100">
                            <div className="text-2xl lg:text-3xl font-black text-blue-600 tracking-tighter">{stat.value}</div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default UpscaleTestimonials;
