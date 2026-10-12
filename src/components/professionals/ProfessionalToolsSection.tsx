import React from "react";
import { 
  Cpu, 
  Sparkles, 
  ArrowRight, 
  Check, 
  FileText, 
  Presentation, 
  Search, 
  Layers, 
  Zap 
} from "lucide-react";

interface ProfessionalToolsSectionProps {
  onRegisterClick: () => void;
}

const tools = [
  {
    name: "Claude 3.7 Sonnet",
    tagline: "The Deep Thinker & Executive Writer",
    category: "Strategic Thinking & Writing",
    description: "Exceptional nuance for complex business memos, sensitive stakeholder negotiations, and long 50-page document synthesis.",
    capabilities: ["200K token document analysis", "Human-level persuasive memos", "Policy and contract review"]
  },
  {
    name: "ChatGPT-4o",
    tagline: "The Multimodal Office Powerhouse",
    category: "General Productivity & Data",
    description: "Versatile assistant for spreadsheet crunching, conversational Excel analysis, visual charts, and rapid brainstorming.",
    capabilities: ["Conversational data analysis", "Voice mode for executive brainstorming", "Custom Department GPTs"]
  },
  {
    name: "Perplexity Pro",
    tagline: "The Real-Time Market Intelligence Engine",
    category: "Research & Fact-Checking",
    description: "Replace hours of messy Google searches with verified, cited industry statistics, competitor analysis, and market trends.",
    capabilities: ["Live web citations & source links", "Competitor SWOT synthesis", "Instant industry benchmark reports"]
  },
  {
    name: "Microsoft Copilot & Google Gemini",
    tagline: "Native Office & Workspace Superpowers",
    category: "Workplace Suite Integration",
    description: "Harness AI directly inside Microsoft Excel, Word, Teams, Google Docs, and Gmail without switching tabs.",
    capabilities: ["Excel formula generation", "Drafting corporate replies inside Outlook/Gmail", "Meeting recap generation"]
  },
  {
    name: "Gamma AI",
    tagline: "Instant Executive Presentation Builder",
    category: "Visual Decks & Reports",
    description: "Turn raw project notes into beautifully formatted, high-stakes presentation slides in under 60 seconds.",
    capabilities: ["Zero manual alignment or formatting", "Boardroom-ready design themes", "Export to PDF & PPTX seamlessly"]
  },
  {
    name: "Notion AI & Task Copilots",
    tagline: "Centralized Department Knowledge Hub",
    category: "Team Wiki & SOPs",
    description: "Build living team knowledge bases, standard operating procedures, and automated project trackers without code.",
    capabilities: ["Automated meeting summary wikis", "Instant SOP documentation", "Department task delegation"]
  }
];

const ProfessionalToolsSection: React.FC<ProfessionalToolsSectionProps> = ({ onRegisterClick }) => {
  return (
    <section id="tools" className="py-14 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-black uppercase tracking-wider mb-3">
            <Cpu className="w-3.5 h-3.5" /> 100% NO-CODE STACK
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Master the World's Leading Corporate AI Tools
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            You don't need to write code or configure complex APIs. Master the intuitive visual interfaces and prompt strategies that multiply your workplace output.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mb-12">
          {tools.map((tool, idx) => (
            <div
              key={idx}
              className="p-5 sm:p-6 rounded-2xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                    {tool.category}
                  </span>
                  <Sparkles className="w-4 h-4 text-amber-500" />
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-0.5">
                  {tool.name}
                </h3>
                <div className="text-xs font-semibold text-indigo-600 mb-3">
                  {tool.tagline}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {tool.description}
                </p>

                <div className="space-y-1.5 pt-3 border-t border-slate-200/60">
                  {tool.capabilities.map((cap, cIdx) => (
                    <div key={cIdx} className="flex items-center gap-2 text-[11px] text-slate-700 font-medium">
                      <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>{cap}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tools Action Box */}
        <div className="p-6 rounded-2xl bg-indigo-50 border border-indigo-200 text-center max-w-2xl mx-auto">
          <h4 className="text-sm sm:text-base font-bold text-slate-900 mb-1">
            Zero Software Installation Required
          </h4>
          <p className="text-xs text-slate-600 mb-4">
            Everything runs in standard browser tabs and the office tools you already use every day.
          </p>
          <button
            onClick={onRegisterClick}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm inline-flex items-center gap-2"
          >
            <span>Start Hands-On Learning</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProfessionalToolsSection;
