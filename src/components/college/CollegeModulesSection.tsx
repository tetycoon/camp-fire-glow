import React, { useState } from "react";
import { Brain, MessageSquare, Bot, BookOpen, Target, GraduationCap, Globe, Shield, Wrench, Code, Compass, Rocket, ChevronDown } from "lucide-react";
import { useCollegeRegisterModal } from "./CollegeRegisterModalContext";

const iconColors = [
    { iconColor: "text-cyan-400", iconClass: "icon-box-cyan" },
    { iconColor: "text-purple-400", iconClass: "icon-box-purple" },
    { iconColor: "text-orange-400", iconClass: "icon-box-orange" },
    { iconColor: "text-emerald-400", iconClass: "icon-box-green" },
    { iconColor: "text-cyan-400", iconClass: "icon-box-cyan" },
    { iconColor: "text-purple-400", iconClass: "icon-box-purple" },
    { iconColor: "text-orange-400", iconClass: "icon-box-orange" },
    { iconColor: "text-emerald-400", iconClass: "icon-box-green" },
    { iconColor: "text-cyan-400", iconClass: "icon-box-cyan" },
    { iconColor: "text-purple-400", iconClass: "icon-box-purple" },
    { iconColor: "text-orange-400", iconClass: "icon-box-orange" },
    { iconColor: "text-emerald-400", iconClass: "icon-box-green" },
];

const modules = [
    {
        icon: Brain,
        title: "Generative AI Fundamentals",
        num: "01",
        goal: "Build a solid understanding of AI, its landscape, and the opportunities it creates for professionals and entrepreneurs.",
        skills: [
            "What is Artificial Intelligence? – Beyond the buzzwords",
            "Difference between AI, Machine Learning, and Deep Learning",
            "How AI powers real businesses and products",
            "Examples: ChatGPT, Midjourney, Notion AI, Jasper",
            "Types of AI (Narrow AI vs General AI)",
            "AI myths vs reality in the professional world",
        ],
        activities: [
            "Map AI tools to real business functions",
            "AI disruption analysis for your industry",
            "Identify 5 AI opportunities in your field",
        ],
        takeaway: "Builds strategic awareness of the AI landscape.",
    },
    {
        icon: MessageSquare,
        title: "Prompt Engineering",
        num: "02",
        goal: "Master the art of communicating with AI to extract maximum value for work and business.",
        skills: [
            "What is a prompt and why it's a career superpower",
            "Anatomy of a great prompt for business use",
            "Zero-shot, few-shot, and chain-of-thought prompting",
            "Prompt techniques for ChatGPT, Gemini, and Claude",
            "Advanced prompt patterns for complex tasks",
            "Building reusable prompt templates for your workflow",
        ],
        activities: [
            "Prompt battle: who gets the best business output?",
            "Build a prompt library for your industry",
            "Create automated workflows using prompt chains",
        ],
        takeaway: "Unlocks the full power of AI for professional use.",
    },
    {
        icon: Bot,
        title: "Agentic AI",
        num: "03",
        goal: "Understand AI agents that autonomously execute complex business tasks.",
        skills: [
            "What are AI agents and how they differ from chatbots",
            "How AI agents plan, reason, and take action",
            "Tools and frameworks behind agentic AI",
            "Real-world use cases: auto-research, lead gen, reporting",
            "Building multi-step agent workflows",
            "Safety and guardrails for AI agents in business",
        ],
        activities: [
            "Build an AI agent for market research",
            "Create an automated content pipeline",
            "Design an AI agent for customer support",
        ],
        takeaway: "Prepares you to build autonomous AI systems.",
    },
    {
        icon: BookOpen,
        title: "AI for Research & Analysis",
        num: "04",
        goal: "Use AI as a powerful research assistant for academic and market research.",
        skills: [
            "Using AI to conduct literature reviews and surveys",
            "Market research and competitive analysis with AI",
            "Summarizing reports, papers, and long documents",
            "Data-driven decision making with AI insights",
            "Creating research presentations with AI",
            "Fact-checking and source verification",
        ],
        activities: [
            "Conduct a market analysis for a startup idea using AI",
            "Summarize and critique a research paper with AI",
            "Build a competitive landscape report",
        ],
        takeaway: "Makes research 10x faster and more thorough.",
    },
    {
        icon: Target,
        title: "AI-Powered Productivity",
        num: "05",
        goal: "Transform your daily workflow with AI tools that 10x your output.",
        skills: [
            "AI-powered email and communication management",
            "Meeting summaries and action items with AI",
            "Project management automation with AI",
            "Smart scheduling and time optimization",
            "Document creation and formatting at scale",
            "AI dashboards for tracking goals and KPIs",
        ],
        activities: [
            "Automate your weekly reporting workflow",
            "Build an AI-powered personal assistant setup",
            "Create a productivity dashboard with AI tools",
        ],
        takeaway: "Transforms how you work and manage your time.",
    },
    {
        icon: GraduationCap,
        title: "AI for Content & Marketing",
        num: "06",
        goal: "Master AI-powered content creation for personal branding, marketing, and business growth.",
        skills: [
            "AI tools for blog posts, social media, and ad copy",
            "Video scripting and editing with AI",
            "SEO optimization using AI tools",
            "Email marketing automation with AI",
            "Creating marketing funnels with AI assistance",
            "Personal branding and LinkedIn optimization",
        ],
        activities: [
            "Create a 30-day content calendar using AI",
            "Build and optimize a LinkedIn profile with AI",
            "Design a marketing campaign for a product/service",
        ],
        takeaway: "Saves time and supercharges your marketing.",
    },
    {
        icon: Globe,
        title: "AI for Business & Startups",
        num: "07",
        goal: "Learn how to leverage AI to build, launch, and scale business ideas.",
        skills: [
            "Validating business ideas with AI research",
            "Building MVPs with AI-assisted development",
            "AI tools for financial planning and forecasting",
            "Customer persona creation with AI",
            "Pitch deck creation and investor research",
            "AI-powered customer acquisition strategies",
        ],
        activities: [
            "Validate a startup idea using AI research tools",
            "Create a pitch deck with AI in 30 minutes",
            "Build a customer acquisition plan with AI",
        ],
        takeaway: "Accelerates your entrepreneurial journey.",
    },
    {
        icon: Shield,
        title: "Ethical AI & Responsible Use",
        num: "08",
        goal: "Understand the ethical, legal, and professional implications of using AI.",
        skills: [
            "AI bias: what it is and its impact on business",
            "Deepfakes and misinformation in the corporate world",
            "Intellectual property and copyright with AI",
            "Data privacy and compliance (GDPR, regulations)",
            "Responsible AI usage in the workplace",
            "The future of AI and the job market",
        ],
        activities: [
            "Create an AI ethics policy for a company",
            "Debate: The limits of AI in hiring decisions",
            "Audit an AI tool for bias and fairness",
        ],
        takeaway: "Develops professional responsibility with AI.",
    },
    {
        icon: Wrench,
        title: "Hands-on AI Tools Mastery",
        num: "09",
        goal: "Get practical mastery of the most powerful AI tools for professionals.",
        skills: [
            "ChatGPT, Gemini, Claude: choosing the right AI for the task",
            "AI image generators: Midjourney, DALL·E, Canva AI",
            "AI video and audio production tools",
            "AI coding assistants and no-code app builders",
            "AI for data analysis, visualization, and reporting",
            "Enterprise AI tools vs free alternatives",
        ],
        activities: [
            "Complete a business project using 5+ AI tools",
            "Create a tool comparison matrix for your industry",
            "Build a creative portfolio piece with AI",
        ],
        takeaway: "Hands-on mastery of the professional AI ecosystem.",
    },
    {
        icon: Code,
        title: "AI + No-Code Development",
        num: "10",
        goal: "Build functional apps and automations without traditional coding skills.",
        skills: [
            "No-code and low-code platforms powered by AI",
            "Building apps with AI copilots (Cursor, Replit, v0)",
            "Automating workflows with Zapier, Make, and n8n",
            "Creating chatbots and AI assistants for your business",
            "Using AI to write, debug, and ship code fast",
            "Introduction to Python basics with AI assistance",
        ],
        activities: [
            "Build a functional web app with AI assistance",
            "Create an automated workflow for a business process",
            "Deploy a chatbot for customer engagement",
        ],
        takeaway: "Bridges the gap between ideas and execution.",
    },
    {
        icon: Compass,
        title: "AI Career Strategy",
        num: "11",
        goal: "Map out your AI-powered career path with actionable strategies.",
        skills: [
            "AI-powered careers: what roles will dominate in 2030?",
            "How AI is transforming every industry",
            "Building an AI-ready resume and LinkedIn profile",
            "Freelancing and consulting with AI skills",
            "Creating an AI services portfolio",
            "Interview preparation with AI coaching",
        ],
        activities: [
            "Build an AI-optimized resume and cover letter",
            "Create a freelance services page with AI",
            "Mock interview with AI feedback and scoring",
        ],
        takeaway: "Gives clarity and direction for your career.",
    },
    {
        icon: Rocket,
        title: "Capstone Project & Demo Day",
        num: "12",
        goal: "Apply everything learned in a hands-on capstone project that you can showcase professionally.",
        skills: [
            "Project planning and ideation with AI",
            "Combining multiple AI tools for a complete solution",
            "Professional presentation and storytelling",
            "Peer review and collaborative feedback",
            "Documenting and showcasing your work",
            "Pitching your project to a professional audience",
        ],
        activities: [
            "Choose a real-world business problem and solve it with AI",
            "Build a complete project using at least 5 AI tools",
            "Present your project in a professional demo day",
        ],
        takeaway: "Proves you're ready to lead with AI in the real world.",
    },
];

interface ModuleCardProps {
    module: typeof modules[0];
    colors: typeof iconColors[0];
    isOpen: boolean;
    onToggle: () => void;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ module, colors, isOpen, onToggle }) => {
    return (
        <div
            className={`card-glow rounded-2xl overflow-hidden transition-all duration-500 cursor-pointer ${isOpen ? "col-span-1 sm:col-span-2 lg:col-span-3" : ""}`}
            onClick={onToggle}
        >
            <div className="p-6 flex items-center gap-5 group relative">
                <div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: "radial-gradient(circle at 0% 50%, hsl(199 100% 55% / 0.07), transparent 60%)" }}
                />
                <div className="number-tag font-display text-lg font-black text-gradient-cyan min-w-[2.5rem] text-center flex-shrink-0">
                    {module.num}
                </div>
                <div className={`w-10 h-10 rounded-xl ${colors.iconClass} flex items-center justify-center flex-shrink-0`}>
                    <module.icon className={`w-5 h-5 ${colors.iconColor}`} />
                </div>
                <h3 className="font-display text-xs sm:text-sm font-bold text-foreground leading-tight group-hover:text-primary transition-colors flex-1">
                    {module.title}
                </h3>
                <ChevronDown
                    className={`w-5 h-5 text-muted-foreground transition-transform duration-300 flex-shrink-0 ${isOpen ? "rotate-180 text-primary" : ""}`}
                />
            </div>

            <div
                className="overflow-hidden transition-all duration-500 ease-in-out"
                style={{ maxHeight: isOpen ? "800px" : "0px", opacity: isOpen ? 1 : 0 }}
            >
                <div className="px-6 pb-8 pt-2">
                    <div className="border-t border-white/10 pt-6">
                        <div className="mb-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3"
                                style={{ background: "hsl(199 100% 55% / 0.1)", border: "1px solid hsl(199 100% 55% / 0.25)", color: "hsl(199 100% 55%)" }}>
                                🎯 Goal
                            </div>
                            <p className="font-body text-sm text-muted-foreground leading-relaxed">{module.goal}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3"
                                    style={{ background: "hsl(265 85% 65% / 0.1)", border: "1px solid hsl(265 85% 65% / 0.25)", color: "hsl(265 85% 65%)" }}>
                                    📘 Skills You'll Learn
                                </div>
                                <ul className="space-y-2">
                                    {module.skills.map((skill, j) => (
                                        <li key={j} className="font-body text-sm text-muted-foreground flex items-start gap-2">
                                            <span className="text-primary mt-0.5 flex-shrink-0">▸</span>
                                            {skill}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3"
                                    style={{ background: "hsl(25 100% 60% / 0.1)", border: "1px solid hsl(25 100% 60% / 0.25)", color: "hsl(25 100% 60%)" }}>
                                    🧪 Activities
                                </div>
                                <ul className="space-y-2">
                                    {module.activities.map((activity, j) => (
                                        <li key={j} className="font-body text-sm text-muted-foreground flex items-start gap-2">
                                            <span className="text-orange-400 mt-0.5 flex-shrink-0">▸</span>
                                            {activity}
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-6 flex items-center gap-2 px-4 py-3 rounded-xl"
                                    style={{ background: "hsl(142 70% 50% / 0.08)", border: "1px solid hsl(142 70% 50% / 0.2)" }}>
                                    <span className="text-emerald-400 text-sm">✅</span>
                                    <span className="font-body text-sm text-emerald-400 font-medium">{module.takeaway}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CollegeModulesSection: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const { openRegisterModal } = useCollegeRegisterModal();

    return (
        <section id="modules" className="section-border py-24 px-4 relative overflow-hidden">
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, hsl(222 40% 6%), hsl(222 47% 5%))" }} />
            <div className="absolute inset-0 grid-bg opacity-25" />
            <div className="absolute top-20 right-20 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, hsl(265 85% 65% / 0.1), transparent 70%)" }} />
            <div className="absolute bottom-20 left-20 w-80 h-80 rounded-full blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, hsl(25 100% 60% / 0.08), transparent 70%)" }} />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <div className="section-label mb-4 mx-auto w-fit">📚 Curriculum</div>
                    <h2 className="font-display text-3xl sm:text-5xl font-bold text-foreground mb-4">
                        Core <span className="text-gradient">Modules</span>
                    </h2>
                    <p className="font-body text-muted-foreground">12 comprehensive modules designed for career and business AI mastery</p>
                    <p className="font-body text-xs text-muted-foreground/60 mt-2">Click any module to see full details</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {modules.map((m, i) => {
                        const colors = iconColors[i];
                        return (
                            <ModuleCard
                                key={i}
                                module={m}
                                colors={colors}
                                isOpen={openIndex === i}
                                onToggle={() => setOpenIndex(openIndex === i ? null : i)}
                            />
                        );
                    })}
                </div>

                <div className="text-center mt-12">
                    <button
                        onClick={openRegisterModal}
                        className="btn-glow text-primary-foreground font-display text-sm font-bold px-10 py-4 rounded-full tracking-widest"
                    >
                        🚀 SECURE YOUR SEAT
                    </button>
                </div>
            </div>
        </section>
    );
};

export default CollegeModulesSection;
