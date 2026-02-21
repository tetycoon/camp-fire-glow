import React, { useState } from "react";
import { Brain, MessageSquare, Bot, BookOpen, Target, GraduationCap, Globe, Shield, Wrench, Code, Compass, Rocket, ChevronDown } from "lucide-react";

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
    goal: "Help students understand what AI is and remove fear or confusion.",
    skills: [
      "What is Artificial Intelligence?",
      "Difference between AI, Machine Learning, and Robotics",
      "How AI works in daily life",
      "Examples: YouTube recommendations, Google Maps, ChatGPT",
      "Types of AI (Narrow AI vs General AI)",
      "AI myths vs reality",
    ],
    activities: [
      "Identify AI tools used daily",
      "AI vs Human decision games",
      "Simple AI demonstrations",
    ],
    takeaway: "Builds curiosity and awareness.",
  },
  {
    icon: MessageSquare,
    title: "Prompt Engineering",
    num: "02",
    goal: "Teach students how to communicate effectively with AI tools to get the best results.",
    skills: [
      "What is a prompt and why it matters",
      "Anatomy of a great prompt",
      "Zero-shot, few-shot, and chain-of-thought prompting",
      "Prompt techniques for ChatGPT, Gemini, and Copilot",
      "Common mistakes and how to fix them",
      "Crafting prompts for different subjects and tasks",
    ],
    activities: [
      "Prompt battle: who gets the best AI response?",
      "Rewrite bad prompts into great ones",
      "Create a prompt library for school subjects",
    ],
    takeaway: "Unlocks the full power of AI assistants.",
  },
  {
    icon: Bot,
    title: "Agentic AI",
    num: "03",
    goal: "Introduce students to AI agents that can perform tasks autonomously.",
    skills: [
      "What are AI agents and how they differ from chatbots",
      "How AI agents plan, reason, and take action",
      "Tools and frameworks behind agentic AI",
      "Real-world use cases: auto-research, scheduling, coding",
      "Understanding agent workflows and loops",
      "Safety and guardrails for AI agents",
    ],
    activities: [
      "Build a simple AI agent workflow",
      "Experiment with auto-GPT style tools",
      "Design an AI agent for a school task",
    ],
    takeaway: "Prepares students for the next wave of AI.",
  },
  {
    icon: BookOpen,
    title: "AI for Exam Preparation",
    num: "04",
    goal: "Help students use AI as a smart study companion for board and competitive exams.",
    skills: [
      "Using AI to create study plans and schedules",
      "Generating practice questions and mock tests",
      "Summarizing textbook chapters with AI",
      "Explaining difficult concepts in simple language",
      "Creating flashcards and revision notes with AI",
      "Analyzing weak areas and targeted practice",
    ],
    activities: [
      "Create an AI-powered study plan for upcoming exams",
      "Generate a mock test paper using AI",
      "Summarize a chapter and compare with textbook",
    ],
    takeaway: "Makes exam preparation smarter and more efficient.",
  },
  {
    icon: Target,
    title: "AI-Powered Study Techniques",
    num: "05",
    goal: "Teach advanced study methods enhanced by AI tools.",
    skills: [
      "Spaced repetition with AI scheduling",
      "Active recall techniques using AI quizzes",
      "Mind mapping and concept linking with AI",
      "Note-taking strategies powered by AI",
      "Visual learning: AI-generated diagrams and charts",
      "Time management and focus techniques",
    ],
    activities: [
      "Build a spaced repetition schedule with AI",
      "Create visual mind maps for a topic",
      "Design a personalized study routine",
    ],
    takeaway: "Transforms how students learn and retain information.",
  },
  {
    icon: GraduationCap,
    title: "Student Productivity",
    num: "06",
    goal: "Boost everyday productivity using AI-powered tools and workflows.",
    skills: [
      "AI tools for writing essays and assignments",
      "Automating repetitive school tasks",
      "Organizing notes, files, and schedules with AI",
      "Presentation creation with AI assistance",
      "Email and communication drafting",
      "Research and information gathering with AI",
    ],
    activities: [
      "Create a presentation using AI in 15 minutes",
      "Automate a weekly school task",
      "Build a personal productivity dashboard",
    ],
    takeaway: "Saves time and improves quality of school work.",
  },
  {
    icon: Globe,
    title: "Digital Skills & Online Presence",
    num: "07",
    goal: "Equip students with essential digital literacy and online branding skills.",
    skills: [
      "Building a positive digital footprint",
      "Creating content with AI (blogs, videos, social posts)",
      "Understanding social media algorithms",
      "Online safety and privacy essentials",
      "Basic website and portfolio creation",
      "Digital communication etiquette",
    ],
    activities: [
      "Create a personal brand bio using AI",
      "Design a mini portfolio website",
      "Analyze your digital footprint",
    ],
    takeaway: "Builds confidence in the digital world.",
  },
  {
    icon: Shield,
    title: "Ethical AI & Responsible Use",
    num: "08",
    goal: "Teach students to use AI responsibly and understand its societal impact.",
    skills: [
      "AI bias: what it is and why it matters",
      "Deepfakes and misinformation detection",
      "Copyright and plagiarism in the age of AI",
      "Privacy concerns with AI tools",
      "Responsible AI usage guidelines",
      "The future of AI and jobs",
    ],
    activities: [
      "Spot the deepfake challenge",
      "Debate: Should AI write school essays?",
      "Create an ethical AI usage pledge",
    ],
    takeaway: "Develops critical thinking about technology.",
  },
  {
    icon: Wrench,
    title: "Hands-on AI Tools",
    num: "09",
    goal: "Give students practical experience with the best AI tools available today.",
    skills: [
      "ChatGPT, Gemini, Claude: choosing the right AI",
      "AI image generators: Midjourney, DALL·E, Canva AI",
      "AI video and audio tools",
      "AI coding assistants and no-code builders",
      "AI for data analysis and visualization",
      "Comparing free vs paid AI tools",
    ],
    activities: [
      "Complete a project using 5 different AI tools",
      "Create an AI tool comparison chart",
      "Build something creative with AI image generators",
    ],
    takeaway: "Hands-on mastery of the AI ecosystem.",
  },
  {
    icon: Code,
    title: "AI + Coding Basics",
    num: "10",
    goal: "Introduce coding fundamentals through the lens of AI and automation.",
    skills: [
      "What is coding and why it matters in the AI era",
      "Introduction to Python basics with AI assistance",
      "Using AI to write, debug, and explain code",
      "Building simple programs with AI copilots",
      "Understanding how AI models work at a basic level",
      "No-code and low-code AI platforms",
    ],
    activities: [
      "Write your first Python program with AI help",
      "Debug a broken code using AI assistants",
      "Build a simple chatbot with no-code tools",
    ],
    takeaway: "Bridges the gap between AI users and AI creators.",
  },
  {
    icon: Compass,
    title: "AI for Career Awareness",
    num: "11",
    goal: "Help students explore future career paths shaped by AI across industries.",
    skills: [
      "AI-powered careers: what jobs will exist in 2030?",
      "How AI is transforming different industries",
      "Skills employers will look for in the AI age",
      "Building an AI-ready resume and portfolio",
      "Choosing the right stream and courses for an AI career",
      "Scholarships and opportunities in AI and tech",
    ],
    activities: [
      "Research an AI-powered career and present findings",
      "Create a future career roadmap using AI",
      "Mock interview with AI feedback",
    ],
    takeaway: "Gives clarity and direction for future careers.",
  },
  {
    icon: Rocket,
    title: "Real-Life Mini Project",
    num: "12",
    goal: "Apply everything learned in a hands-on capstone project using AI tools.",
    skills: [
      "Project planning and ideation with AI",
      "Combining multiple AI tools for a single project",
      "Presentation and storytelling with AI",
      "Peer review and feedback using AI",
      "Documenting and showcasing your work",
      "Pitching your AI project to an audience",
    ],
    activities: [
      "Choose a real-world problem and solve it with AI",
      "Build a complete project using at least 3 AI tools",
      "Present your project in a demo day format",
    ],
    takeaway: "Proves readiness to use AI in the real world.",
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
            {/* Goal */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3"
                style={{ background: "hsl(199 100% 55% / 0.1)", border: "1px solid hsl(199 100% 55% / 0.25)", color: "hsl(199 100% 55%)" }}>
                🎯 Goal
              </div>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">{module.goal}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Skills */}
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3"
                  style={{ background: "hsl(265 85% 65% / 0.1)", border: "1px solid hsl(265 85% 65% / 0.25)", color: "hsl(265 85% 65%)" }}>
                  📘 Skills to Teach
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

              {/* Activities */}
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

const ModulesSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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
          <p className="font-body text-muted-foreground">12 comprehensive modules designed for real-world AI mastery</p>
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
            onClick={() => document.getElementById("register")?.scrollIntoView({ behavior: "smooth" })}
            className="btn-glow text-primary-foreground font-display text-sm font-bold px-10 py-4 rounded-full tracking-widest"
          >
            🚀 SECURE YOUR SEAT
          </button>
        </div>
      </div>
    </section>
  );
};

export default ModulesSection;
