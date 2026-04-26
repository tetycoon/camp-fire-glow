import React, { useState } from "react";
import { Brain, MessageSquare, Bot, BookOpen, Target, GraduationCap, Globe, Shield, Wrench, Code, Compass, Rocket, ChevronDown, CheckCircle, Lightbulb } from "lucide-react";

const iconColors = [
  { iconColor: "text-brand-500", iconClass: "icon-box-cyan" },
  { iconColor: "text-brand-500", iconClass: "icon-box-cyan" },
  { iconColor: "text-brand-500", iconClass: "icon-box-cyan" },
  { iconColor: "text-brand-500", iconClass: "icon-box-cyan" },
  { iconColor: "text-brand-500", iconClass: "icon-box-cyan" },
  { iconColor: "text-brand-500", iconClass: "icon-box-cyan" },
  { iconColor: "text-brand-500", iconClass: "icon-box-cyan" },
  { iconColor: "text-brand-500", iconClass: "icon-box-cyan" },
  { iconColor: "text-brand-500", iconClass: "icon-box-cyan" },
  { iconColor: "text-brand-500", iconClass: "icon-box-cyan" },
  { iconColor: "text-brand-500", iconClass: "icon-box-cyan" },
  { iconColor: "text-brand-500", iconClass: "icon-box-cyan" },
];

const modules = [
  {
    icon: Brain,
    title: "Generative AI Fundamentals",
    num: "01",
    goal: "Architectural understanding of neural intelligence vs algorithmic patterns.",
    skills: [
      "Deconstructing LLM Architectures",
      "Narrow vs General Intelligence Spectra",
      "Real-world Cognitive Automation Samples",
      "The Math behind 'Next Token Prediction'",
      "AI Myths: Biological vs Synthetic Brains",
    ],
    activities: [
      "Neural Pattern Discovery Session",
      "Decision Tree Logic Games",
      "Live AI Hallucination Stress-Test",
    ],
    takeaway: "Master the foundational syntax of the future.",
  },
  {
    icon: MessageSquare,
    title: "Elite Prompt Engineering",
    num: "02",
    goal: "Transforming natural language into high-fidelity code and logic.",
    skills: [
      "Token Optimization Strategies",
      "Chain-of-Thought (CoT) Logic Chains",
      "Zero-shot vs Recursive Refinement",
      "System Message Hierarchy & Roleplaying",
      "Multimodal Prompting (Vision + Text)",
    ],
    activities: [
      "Competitive Prompt Architecting",
      "Prompt Reverse Engineering",
      "Context-Window Management Drills",
    ],
    takeaway: "Communicate with surgical precision.",
  },
  {
    icon: Bot,
    title: "Autonomous Agentic AI",
    num: "03",
    goal: "Scaling from static chat to goal-oriented autonomous agents.",
    skills: [
      "Agent Reasoning Loops (ReAct)",
      "Tool-Calling & External API Integration",
      "Autonomous Workflow Orchestration",
      "Multi-Agent Collaboration Frameworks",
      "Guardrails for Non-Deterministic Outputs",
    ],
    activities: [
      "Design an Auto-Researcher Agent",
      "Workflow Logic Mapping",
      "Agent Failure Analysis Labs",
    ],
    takeaway: "Build systems that work while you sleep.",
  },
  {
    icon: BookOpen,
    title: "AI Exam & Study Optimization",
    num: "04",
    goal: "Leveraging custom RAG systems for competitive exam dominance.",
    skills: [
      "AI Summarization of Mega-Data (Textbooks)",
      "Custom GPTs for Personal Tutoring",
      "Synthetic Mock Paper Generation",
      "Weak-Point Detection via AI Analytics",
      "Flashcard Automation from Complex Texts",
    ],
    activities: [
      "Build a Board-Exam Strategy Engine",
      "Synthetic Paper 'Solve-athon'",
      "Concept Compression Exercises",
    ],
    takeaway: "Outlearn the competition with technology.",
  },
  {
    icon: Target,
    title: "Cognitive Productivity",
    num: "05",
    goal: "Enhancing human bandwidth through AI-integrated workflows.",
    skills: [
      "AI-Optimized Spaced Repetition",
      "Neural Note-taking & Mind Mapping",
      "Deep-Focus Sprints with AI assistance",
      "Information Triage & Management",
      "Automated Knowledge Retrieval",
    ],
    activities: [
      "Create a Neural Knowledge Base",
      "Productivity Bottleneck Analysis",
      "AI-Assisted Task Mapping",
    ],
    takeaway: "Upgrade your mental processing power.",
  },
  {
    icon: GraduationCap,
    title: "Professional Workflows",
    num: "06",
    goal: "Acing the professional world with zero-delay execution.",
    skills: [
      "AI-Assisted Technical Writing",
      "Ultra-Fast High-Quality Presentations",
      "Data Interpretation & Narrative Building",
      "Email Automation & Ghost-Writing",
      "Autonomous Research & Information Triage",
    ],
    activities: [
      "15-Minute Executive Brief Building",
      "Workflow Automation Sprint",
      "AI Communication Audit",
    ],
    takeaway: "Become a 10x more effective professional.",
  },
  {
    icon: Globe,
    title: "Digital Branding & Influence",
    num: "07",
    goal: "Crafting an undeniable online persona via AI content stacks.",
    skills: [
      "AI-powered Content Ideation",
      "Voice & Persona consistency in AI",
      "Algorithmic Presence Multipliers",
      "Synthetic Media Generation (Image/Video)",
      "Digital Impact Metrics & Optimization",
    ],
    activities: [
      "Build a Digital Portfolio in 60 mins",
      "AI Personification Workshop",
      "Content Matrix Generation",
    ],
    takeaway: "Master the digital attention economy.",
  },
  {
    icon: Shield,
    title: "AI Ethics & Safety Architecture",
    num: "08",
    goal: "Navigating the legal and moral complexity of synthetic intelligence.",
    skills: [
      "Bias Recognition & Mitigation",
      "Misinformation & Deepfake Forensics",
      "Copyright & IP in Generative Systems",
      "Privacy Encryption & AI Guardrails",
      "Responsible AI Development Ethics",
    ],
    activities: [
      "Deepfake Detection Challenge",
      "The 'Moral Machine' AI Ethics Lab",
      "Build an AI Safety Checklist",
    ],
    takeaway: "Rule the machine, don't let it rule you.",
  },
  {
    icon: Wrench,
    title: "Mastering the AI Ecosystem",
    num: "09",
    goal: "Expert-level navigation across the top 1% of AI platforms.",
    skills: [
      "Advanced ChatGPT, Claude, & Gemini Pro",
      "High-Fidelity Art with Midjourney/Flux",
      "No-Code AI App Development (Replit/Cursor)",
      "Audio/Video Synthesis Professionalism",
      "Custom Workflow Hooking with Zapier/Make",
    ],
    activities: [
      "Multi-Tool Project Orchestration",
      "Tool Sensitivity Stress-test",
      "Workflow Cost-Benefit Analysis",
    ],
    takeaway: "Command the entire AI stack.",
  },
  {
    icon: Code,
    title: "Foundational AI Prototyping",
    num: "10",
    goal: "Bridging human logic with Python-assisted AI development.",
    skills: [
      "Python for Non-Coders (Assisted)",
      "Debugging via Context-Injection",
      "Writing Scripted Automations with AI",
      "API Logic and System Integration",
      "Building your first Neural-assisted App",
    ],
    activities: [
      "Build a Terminal Bot in 20 mins",
      "Live Debugging 'Bug-Hunt'",
      "Algorithm Logic Mapping",
    ],
    takeaway: "From user to creator in 30 days.",
  },
  {
    icon: Compass,
    title: "Career & Stream Projection",
    num: "11",
    goal: "Future-proofing your education for jobs that don't exist yet.",
    skills: [
      "Career Trends (Pre-2030 Roadmap)",
      "AI-First Job Market Analysis",
      "Building an AI-Optimized Resume",
      "Mock Interviews with Peerless AI",
      "Scholarship & Growth Matrix Exploration",
    ],
    activities: [
      "2030 Career Visioning Lab",
      "The AI-Ready Portfolio Audit",
      "Streaming Strategy Session",
    ],
    takeaway: "Predict and conquer the future market.",
  },
  {
    icon: Rocket,
    title: "The Great AI Demo Day",
    num: "12",
    goal: "Final capstone project showcasing unified AI mastery.",
    skills: [
      "Complex System Integration",
      "Technical Pitching & Storytelling",
      "Product-Market Fit for AI Concepts",
      "Documenting Technical Architectures",
      "Post-Bootcamp Growth Loops",
    ],
    activities: [
      "The 24-Hour Capstone Challenge",
      "Live Peer Showcase & Feedback",
      "Industry-Ready Presentation Pitch",
    ],
    takeaway: "Launch your career as an AI native.",
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
      className={`group relative rounded-[2rem] overflow-hidden transition-all duration-500 cursor-pointer ${
        isOpen 
          ? "col-span-1 sm:col-span-2 lg:col-span-3 card-glow border-primary/50 bg-white/10 ring-1 ring-primary/20 shadow-2xl" 
          : "bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/[0.08]"
      }`}
      onClick={onToggle}
    >
      <div className="p-6 sm:p-8 flex items-center gap-6 relative z-10">
        <div className="flex-shrink-0 relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center icon-box-cyan transform group-hover:scale-110 transition-transform duration-500">
             <module.icon className={`w-7 h-7 ${colors.iconColor}`} />
          </div>
          <div className="absolute -top-2 -right-2 bg-background border border-border w-6 h-6 rounded-lg text-[10px] font-black flex items-center justify-center text-primary group-hover:border-primary/50 transition-colors">
            {module.num}
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="font-display text-lg sm:text-xl font-black text-white leading-tight mb-1 group-hover:text-primary transition-colors">
            {module.title}
          </h3>
          <p className="font-body text-[11px] text-muted-foreground uppercase tracking-widest font-bold opacity-60">
            Phase Dynamics
          </p>
        </div>

        <div className={`w-10 h-10 rounded-full border border-white/10 flex items-center justify-center transition-all ${isOpen ? "bg-primary border-primary rotate-180" : "group-hover:bg-white/5 group-hover:border-white/20"}`}>
           <ChevronDown className={`w-5 h-5 ${isOpen ? "text-white" : "text-muted-foreground group-hover:text-white"}`} />
        </div>
      </div>

      <div
        className="overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.4, 0, 0.2, 1)]"
        style={{ maxHeight: isOpen ? "1200px" : "0px", opacity: isOpen ? 1 : 0 }}
      >
        <div className="px-8 pb-10 pt-4 relative z-10 border-t border-white/10 bg-gradient-to-b from-white/[0.02] to-transparent">
            {/* Goal Card */}
            <div className="mb-10 p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <Target className="w-4 h-4" />
                   </div>
                   <h4 className="font-display text-sm font-black text-white uppercase tracking-widest">Architectural Goal</h4>
                </div>
                <p className="font-body text-base text-muted-foreground italic leading-relaxed">
                   "{module.goal}"
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              {/* Technical Proficiencies */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
                      <CheckCircle className="w-4 h-4" />
                   </div>
                   <h4 className="font-display text-sm font-black text-white uppercase tracking-widest">Technical Proficiency</h4>
                </div>
                <ul className="space-y-4">
                  {module.skills.map((skill, j) => (
                    <li key={j} className="font-body text-sm text-muted-foreground flex items-start gap-4 group/li">
                      <span className="text-primary font-black mt-0.5 group-hover/li:translate-x-1 transition-transform opacity-60">0{j+1}</span>
                      <span className="group-hover/li:text-white transition-colors">{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Lab Simulations */}
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Lightbulb className="w-4 h-4" />
                   </div>
                   <h4 className="font-display text-sm font-black text-white uppercase tracking-widest">Lab Simulations</h4>
                </div>
                <ul className="space-y-4 mb-8">
                  {module.activities.map((activity, j) => (
                    <li key={j} className="font-body text-sm text-muted-foreground flex items-center gap-4 py-2 px-3 rounded-lg hover:bg-white/5 transition-all group/activity">
                      <div className="w-2 h-2 rounded-full bg-amber-500/40 group-hover/activity:scale-150 transition-transform" />
                      {activity}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-xl flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Rocket className="w-5 h-5" />
                   </div>
                   <div>
                      <p className="font-display text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none mb-1">Outcome Matrix</p>
                      <p className="font-body text-sm text-white font-medium leading-tight">{module.takeaway}</p>
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
    <section id="modules" className="section-border py-24 sm:py-32 px-4 relative overflow-hidden bg-background">
      {/* Background FX */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,hsl(var(--primary)_/_0.05),transparent_40%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,hsl(var(--secondary)_/_0.05),transparent_40%)]" />
      <div className="absolute inset-0 grid-bg opacity-15" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <div className="section-label mb-6 mx-auto w-fit tracking-[0.4em] glow-text">✦ MASTER SYLLABUS</div>
          <h2 className="font-display text-4xl sm:text-7xl font-[1000] text-white mb-6 tracking-tighter">
            Architectural <span className="text-gradient">Logic</span>
          </h2>
          <p className="font-body text-base sm:text-lg text-muted-foreground/80 max-w-3xl mx-auto leading-relaxed">
            A high-fidelity curriculum engineered to provide non-linear growth in AI proficiency, from theoretical physics of data to autonomous agency.
          </p>
          <div className="flex items-center justify-center gap-3 mt-8">
             <div className="h-px w-10 bg-white/20" />
             <p className="font-body text-[10px] text-primary/80 font-black tracking-[0.3em] uppercase animate-pulse">Select a module to decrypt</p>
             <div className="h-px w-10 bg-white/20" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-min">
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

        <div className="mt-24 text-center">
            <div className="inline-block glass-panel p-8 rounded-[2.5rem] border border-white/10 max-w-2xl">
                <p className="font-display text-xl sm:text-2xl font-black text-white mb-4">Ready to begin your specialization?</p>
                <p className="font-body text-sm text-muted-foreground mb-8">Join the elite few who aren't just using AI, but mastering the architectural logic behind the machine.</p>
                <button 
                   onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                   className="btn-glow text-white font-display text-xs font-black px-12 py-5 rounded-2xl tracking-[0.3em] uppercase"
                >
                   VIEW PATHWAY OPTIONS
                </button>
            </div>
        </div>
      </div>
    </section>
  );
};

export default ModulesSection;
