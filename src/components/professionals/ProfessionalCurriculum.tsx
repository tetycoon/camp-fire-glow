import React, { useState } from "react";
import { 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  ShieldAlert,
  FileSpreadsheet,
  Mail,
  Presentation,
  Workflow,
  TrendingUp,
  BrainCircuit
} from "lucide-react";

interface ProfessionalCurriculumProps {
  onRegisterClick: () => void;
}

const modules = [
  {
    number: "01",
    title: "The Executive AI Mindset & Core Foundations",
    duration: "Module 1 • 3 Hours",
    icon: BrainCircuit,
    headline: "Unlearn amateur prompts. Master the mental models used by top 1% AI corporate operators.",
    topics: [
      "Why 90% of professionals get generic answers from AI and how to fix it immediately",
      "Model Comparison Matrix: When to deploy Claude 3.7 vs ChatGPT-4o vs Perplexity vs DeepSeek",
      "The Anchor-Constraint-Context Framework for zero hallucinations in business tasks",
      "Setting up high-leverage System Instructions for consistent executive voice"
    ]
  },
  {
    number: "02",
    title: "Workplace Communication, High-Stakes Memos & Emails",
    duration: "Module 2 • 3.5 Hours",
    icon: Mail,
    headline: "Draft persuasive client proposals, board memos, and conflict-resolution emails in 120 seconds.",
    topics: [
      "Persona Emulation: Training AI on your writing voice, executive tone, and company style guide",
      "Handling sensitive negotiations, vendor pushback, and performance feedback with empathy",
      "The 60-Second Executive Summary: Turning messy 10-page email chains into actionable briefs",
      "B2B cold outreach formulas that generate verified 40%+ open and response rates"
    ]
  },
  {
    number: "03",
    title: "Non-Tech Data Analytics & Smart Excel Workflows",
    duration: "Module 3 • 3.5 Hours",
    icon: FileSpreadsheet,
    headline: "Talk to your data in plain English. Master Excel formulas, macros, and financial insights without code.",
    topics: [
      "Generating complex nested Excel formulas (XLOOKUP, INDEX-MATCH, SUMIFS) with conversational prompts",
      "Uploading messy spreadsheets and CSVs to Claude & ChatGPT for instant variance and anomaly detection",
      "Automating financial statement breakdowns (P&L, balance sheets, expense audits)",
      "Transforming raw tables into boardroom-ready visual data takeaways and narrative insights"
    ]
  },
  {
    number: "04",
    title: "Presentation & Report Automation (10x Slide Decks)",
    duration: "Module 4 • 3 Hours",
    icon: Presentation,
    headline: "Never start a PowerPoint or pitch deck from a blank white slide ever again.",
    topics: [
      "Transforming 3 bullet points into a structured 10-slide executive pitch deck with narrative flow",
      "Automated presentation generators (Gamma AI, Canva AI) with custom corporate branding",
      "Synthesizing 60-page PDF reports and industry whitepapers into 1-page visual summaries",
      "Generating speaker notes, anticipate tough leadership questions, and live Q&A defense briefs"
    ]
  },
  {
    number: "05",
    title: "The Meeting & Daily Work Productivity Operating System",
    duration: "Module 5 • 3 Hours",
    icon: Clock,
    headline: "Reclaim 10+ hours every week by automating meeting synthesis, calendar triage, and daily ops.",
    topics: [
      "AI Meeting Copilots: Extracting decisions, risks, deadlines, and owners from recorded calls",
      "The Inbox Zero System: Auto-categorizing incoming emails and pre-drafting responses",
      "Daily time-blocking and high-priority delegation frameworks using conversational AI",
      "Rapid Standard Operating Procedure (SOP) generator for training team members and interns"
    ]
  },
  {
    number: "06",
    title: "Zero-Code Automation & Custom AI Department Assistants",
    duration: "Module 6 • 3 Hours",
    icon: Workflow,
    headline: "Build your own specialized AI assistants and connect everyday office tools with zero programming.",
    topics: [
      "Creating Custom GPTs & Claude Projects tailored to your department's specific guidelines",
      "Uploading company documents, brand manuals, and past proposals to create team knowledge hubs",
      "Connecting AI to Google Sheets, Gmail, and Slack using simple no-code trigger logic",
      "Data privacy, enterprise confidentiality, and best practices for using AI safely at work"
    ]
  },
  {
    number: "07",
    title: "Career Acceleration & Leading AI in Your Company",
    duration: "Module 7 • 2 Hours",
    icon: TrendingUp,
    headline: "Position yourself as the indispensable AI champion in your organization and accelerate your career.",
    topics: [
      "How to present AI productivity gains to senior leadership to justify raises and promotions",
      "Conducting internal AI lunch-and-learns to establish leadership authority within your team",
      "The 2026 Non-Tech Career Roadmap: How to stay irreplaceable as AI capabilities evolve",
      "Building a public personal brand on LinkedIn as an AI-powered domain specialist"
    ]
  }
];

const ProfessionalCurriculum: React.FC<ProfessionalCurriculumProps> = ({ onRegisterClick }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const toggleModule = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <section id="curriculum" className="py-14 sm:py-20 bg-slate-50 border-t border-slate-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-black uppercase tracking-wider mb-3">
            <BookOpen className="w-3.5 h-3.5" /> 20+ HOURS PRACTICAL CURRICULUM
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-4">
            7 Comprehensive Modules Built Exclusively for Working Professionals
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Every lesson is designed for immediate application on your current job starting tomorrow morning. No theoretical fluff — 100% workplace execution.
          </p>
        </div>

        {/* Modules Accordion */}
        <div className="space-y-3.5 sm:space-y-4 mb-10 sm:mb-14">
          {modules.map((m, index) => {
            const isExpanded = expandedIndex === index;
            const Icon = m.icon;
            return (
              <div
                key={index}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isExpanded
                    ? "bg-white border-indigo-300 shadow-md ring-1 ring-indigo-200"
                    : "bg-white/80 border-slate-200 hover:border-slate-300 shadow-sm"
                }`}
              >
                {/* Module Bar */}
                <button
                  onClick={() => toggleModule(index)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-3 focus:outline-none"
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center font-black text-xs sm:text-sm flex-shrink-0 transition-colors ${
                      isExpanded 
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" 
                        : "bg-slate-100 text-slate-700"
                    }`}>
                      {m.number}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] sm:text-xs font-bold text-indigo-600 uppercase tracking-wider">
                          {m.duration}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                        {m.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="hidden sm:inline-block text-xs font-semibold text-slate-400">
                      {isExpanded ? "Collapse" : "View Details"}
                    </span>
                    <div className={`p-1.5 rounded-lg text-slate-500 transition-transform ${isExpanded ? "rotate-180 bg-indigo-50 text-indigo-600" : "bg-slate-100"}`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-5 sm:px-6 sm:pb-6 pt-1 border-t border-slate-100 bg-slate-50/50">
                    <p className="text-xs sm:text-sm font-semibold text-slate-800 mb-4 bg-indigo-50/60 p-3 rounded-xl border border-indigo-100/80">
                      💡 {m.headline}
                    </p>

                    <div className="space-y-2.5">
                      {m.topics.map((topic, tIdx) => (
                        <div key={tIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                          <span className="leading-relaxed">{topic}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <button
            onClick={onRegisterClick}
            className="px-6 py-3.5 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-indigo-600/25 hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Enroll & Master All 7 Modules</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProfessionalCurriculum;
