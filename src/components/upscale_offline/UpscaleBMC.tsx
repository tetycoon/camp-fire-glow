import React from "react";
import { 
    Users, 
    Star, 
    Send, 
    Heart, 
    IndianRupee, 
    Database, 
    Zap, 
    Handshake, 
    CreditCard,
    ArrowRight
} from "lucide-react";

const blocks = [
    {
        title: "Identify Your Tribe",
        subtitle: "Customer Segments",
        icon: <Users className="w-5 h-5 text-blue-600" />,
        desc: "Who are your people? From ambitious students to corporate leaders, we use AI to pinpoint the exact audience that's waiting for you."
    },
    {
        title: "Define Your Power",
        subtitle: "Value Propositions",
        icon: <Star className="w-5 h-5 text-blue-600" />,
        desc: "What's your unique promise? We draft value statements that solve real problems—like mastering AI business models in just days."
    },
    {
        title: "Own Your Reach",
        subtitle: "Channels",
        icon: <Send className="w-5 h-5 text-blue-600" />,
        desc: "How do you show up? Dominate Instagram, YouTube, and WhatsApp using AI-accelerated delivery systems and high-converting pages."
    },
    {
        title: "Scale Your Trust",
        subtitle: "Customer Relationships",
        icon: <Heart className="w-5 h-5 text-blue-600" />,
        desc: "How do you bond? Automate your emails and nurture high-impact communities on Telegram that turn strangers into advocates."
    },
    {
        title: "Unlock Wealth",
        subtitle: "Revenue Streams",
        icon: <IndianRupee className="w-5 h-5 text-blue-600" />,
        desc: "Where's the growth? Map out diversified income sources—from course enrollments to advanced program subscriptions."
    },
    {
        title: "Leverage Your Assets",
        subtitle: "Key Resources",
        icon: <Database className="w-5 h-5 text-blue-600" />,
        desc: "What fuels you? Inventory your content, your brand voice, and your digital infrastructure to build a robust foundation."
    },
    {
        title: "Master Execution",
        subtitle: "Key Activities",
        icon: <Zap className="w-5 h-5 text-blue-600" />,
        desc: "What counts daily? Focus your energy on high-impact teaching, AI content creation, and lead-gen campaigns that work 24/7."
    },
    {
        title: "Form Alliances",
        subtitle: "Key Partnerships",
        icon: <Handshake className="w-5 h-5 text-blue-600" />,
        desc: "Who has your back? Leverage influencers, secure payment gateways, and ad platforms like Meta and Google to amplify your scale."
    },
    {
        title: "Optimize Your Math",
        subtitle: "Cost Structure",
        icon: <CreditCard className="w-5 h-5 text-blue-600" />,
        desc: "Where does the fuel go? Manage your ad spend, tool subscriptions, and overheads with AI precision to maximize your margins."
    }
];

const UpscaleBMC: React.FC = () => {
    return (
        <section id="bmc" className="py-16 px-6 bg-white relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-50 rounded-full blur-[100px] opacity-60"></div>
            
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                        🏗️ THE BLUEPRINT FOR SUCCESS
                    </div>
                    <h2 className="text-4xl lg:text-7xl font-black text-slate-900 leading-[0.9] mb-6 tracking-tighter">
                        The 9 Pillars of <br />
                        <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 bg-clip-text text-transparent italic">Business Dominance.</span>
                    </h2>
                    <p className="max-w-3xl mx-auto text-xl text-slate-600 font-medium leading-relaxed">
                        We don't just teach theory. In our session, <span className="text-slate-950 font-bold underline decoration-blue-500 underline-offset-4">using AI</span>, we help you build your complete 
                        snapshot of how to create, deliver, and capture value in the modern economy.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {blocks.map((block, i) => (
                        <div key={i} className="group p-8 rounded-[40px] border border-slate-100 bg-white hover:border-blue-200 hover:shadow-[0_40px_100px_rgba(59,130,246,0.08)] transition-all duration-700 flex flex-col items-start text-left relative overflow-hidden h-full">
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-50/50 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                            <div className="w-16 h-16 rounded-[24px] bg-slate-50 flex items-center justify-center mb-6 group-hover:bg-gradient-to-br group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:text-white transition-all duration-500 shadow-sm group-hover:shadow-xl group-hover:shadow-blue-500/20 group-hover:rotate-6">
                                {React.cloneElement(block.icon as React.ReactElement, { className: "w-7 h-7" })}
                            </div>
                            <div className="text-[11px] font-black text-blue-600 uppercase tracking-[0.3em] mb-3">
                                {block.subtitle}
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight group-hover:text-blue-700 transition-colors">
                                {block.title}
                            </h3>
                            <p className="text-slate-500 font-semibold leading-relaxed text-base mb-2 flex-grow">
                                {block.desc}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Core Logic Banner */}
                <div className="mt-12 p-6 lg:p-8 rounded-[40px] bg-slate-950 text-white flex flex-col lg:flex-row items-center justify-between gap-6 overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    
                    <div className="relative z-10 text-center lg:text-left">
                        <div className="text-blue-500 font-black text-[9px] uppercase tracking-[0.4em] mb-3">THE CORE FLOW</div>
                        <div className="flex flex-wrap lg:flex-nowrap items-center justify-center lg:justify-start gap-3 lg:gap-6">
                            {["Customers", "Value", "Delivery", "Wealth", "Mastery"].map((word, i) => (
                                <React.Fragment key={word}>
                                    <span className={`text-xl sm:text-2xl lg:text-3xl font-black tracking-tighter whitespace-nowrap ${i === 4 ? "text-blue-500" : "text-white"}`}>{word}</span>
                                    {i < 4 && <ArrowRight className="w-4 h-4 text-slate-700 hidden lg:block flex-shrink-0" />}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
 
                    <div className="relative z-10 flex-shrink-0">
                        <div className="p-0.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                            <div className="px-5 py-3 rounded-2xl bg-blue-600 text-white font-black text-[10px] tracking-widest uppercase shadow-xl shadow-blue-600/30 whitespace-nowrap">
                                9 Principles, 1 Outcome.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default UpscaleBMC;
