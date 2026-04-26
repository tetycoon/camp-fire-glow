import React from "react";
import { CheckCircle2, TrendingUp, Target, Globe, Video, Palette, Users } from "lucide-react";

const skills = [
    {
        icon: <TrendingUp className="w-6 h-6 text-blue-600" />,
        title: "Model Customization",
        desc: "Tailor generative AI to your specific business model for instant overhead reduction."
    },
    {
        icon: <Target className="w-6 h-6 text-indigo-600" />,
        title: "Autonomous Lead Gen",
        desc: "Setup AI systems that find, qualify, and nurture leads while you focus on closing."
    },
    {
        icon: <Globe className="w-6 h-6 text-emerald-600" />,
        title: "Rapid Web Deployment",
        desc: "Live practice: Launch a professional business website in minutes using AI tools."
    },
    {
        icon: <Video className="w-6 h-6 text-pink-600" />,
        title: "Avatar Consistency",
        desc: "Create professional videos with AI avatars that maintain your brand's unique identity."
    },
    {
        icon: <Palette className="w-6 h-6 text-amber-500" />,
        title: "Visual Branding",
        desc: "Design a cohesive visual identity that builds trust and commands higher prices."
    },
    {
        icon: <Users className="w-6 h-6 text-purple-600" />,
        title: "Digital Workforce",
        desc: "Deploy your digital workforce. Scale operations without increasing your headcount."
    }
];

const AIMasterclassSkillsSection: React.FC = () => {
    return (
        <section className="py-24 px-4 bg-slate-50 relative overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <div className="inline-block px-4 py-2 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-6">
                        🎯 CORE COMPETENCIES
                    </div>
                    <h2 className="text-4xl sm:text-6xl font-black text-slate-900 mb-6 tracking-tight">
                        6 Skills You'll <span className="text-blue-600">Master</span>
                    </h2>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium">
                        Hands-on, live, no fluff. Every module gives you something deployable by the next morning.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {skills.map((s, i) => (
                        <div key={i} className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-xl shadow-slate-200/50 transition-all hover:-translate-y-2 duration-500 group">
                            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-8 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
                                {s.icon}
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{s.title}</h3>
                            <p className="text-slate-500 leading-relaxed font-bold text-sm uppercase tracking-wide opacity-80">{s.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default AIMasterclassSkillsSection;
