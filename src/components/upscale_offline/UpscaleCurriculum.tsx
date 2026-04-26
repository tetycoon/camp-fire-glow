import React from "react";
import { Coffee, GraduationCap, Utensils, Timer } from "lucide-react";

const schedule = [
    {
        time: "09:30 AM",
        title: "9 Principles of AI Business Generative Models",
        desc: "Mastering the foundational architecture for building and scaling high-ROI AI business systems.",
        type: "session"
    },
    {
        time: "11:45 AM",
        title: "The Lead Machine & CRM",
        desc: "Building autonomous systems that find, qualify, and nurture your ideal high-ticket clients.",
        type: "session"
    },
    {
        time: "01:15 PM",
        title: "Executive Networking Lunch",
        desc: "Full buffet lunch at Vestin Park Hotel. Connect with 19 other visionaries.",
        type: "break"
    },
    {
        time: "02:00 PM",
        title: "AI Website Design Lab",
        desc: "Constructing and launching a high-converting business presence in real-time using generative web tools.",
        type: "session"
    },
    {
        time: "03:45 PM",
        title: "AI Video Creation Mastery",
        desc: "Mastering consistent AI avatars and high-end video production to dominate your industry's visual space.",
        type: "session"
    },
    {
        time: "05:15 PM",
        title: "Certification & Strategy",
        desc: "Awarding physical certificates and a final deep-dive Q&A session for personalized roadmaps.",
        type: "session"
    }
];

const UpscaleCurriculum: React.FC = () => {
    return (
        <section id="schedule" className="py-24 px-6 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-20">
                    <div className="inline-block px-4 py-2 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                        ⏱️ THE FULL-DAY SCHEDULE
                    </div>
                    <h2 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tight mb-8">
                        8 Hours of <span className="text-blue-600">Pure ROI.</span>
                    </h2>
                    <p className="text-lg text-slate-500 font-medium">Exactly how we'll bridge 4 days of content into one intensive execution session.</p>
                </div>

                <div className="space-y-4">
                    {schedule.map((item, i) => (
                        <div 
                            key={i} 
                            className={`p-8 rounded-[40px] border flex flex-col sm:flex-row gap-8 items-start sm:items-center transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200/50 group ${item.type === 'break' ? 'bg-blue-50/50 border-blue-100' : 'bg-white border-slate-100 shadow-sm'}`}
                        >
                            <div className="flex flex-col items-center justify-center w-32 h-20 rounded-3xl bg-slate-900 group-hover:bg-blue-600 transition-colors text-white shrink-0 shadow-lg relative overflow-hidden">
                                {i === 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-glow shadow-emerald-400"></span>}
                                <div className="text-xl font-black">{item.time.split(' ')[0]}</div>
                                <div className="text-[10px] font-black tracking-widest opacity-60">{item.time.split(' ')[1]}</div>
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    {item.type === 'break' ? <Utensils className="w-4 h-4 text-blue-600" /> : <Timer className="w-4 h-4 text-slate-400" />}
                                    <h3 className="text-xl font-black text-slate-900">{item.title}</h3>
                                </div>
                                <p className="text-slate-500 font-bold text-sm uppercase tracking-wide leading-relaxed">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="mt-16 p-8 rounded-[32px] bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-10 shadow-3xl">
                    <div className="max-w-md">
                        <div className="text-2xl font-black mb-3">Bring your A-Game.</div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">95% Practical. 100% Execution. This isn't a lecture. It's a boardroom session.</p>
                    </div>
                    <div className="flex items-center gap-10">
                        <div className="text-center">
                            <div className="text-3xl font-black text-blue-500">20</div>
                            <div className="text-[9px] uppercase font-black opacity-50 tracking-widest">Seats Total</div>
                        </div>
                        <div className="w-px h-10 bg-white/10"></div>
                        <div className="text-center">
                            <div className="text-3xl font-black text-emerald-400">100%</div>
                            <div className="text-[9px] uppercase font-black opacity-50 tracking-widest">Hands-on</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default UpscaleCurriculum;
