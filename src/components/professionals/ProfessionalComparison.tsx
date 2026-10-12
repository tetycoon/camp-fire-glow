import React from "react";
import { 
  XCircle, 
  CheckCircle2, 
  ArrowRight, 
  Zap, 
  Clock, 
  TrendingUp, 
  ShieldAlert, 
  Sparkles 
} from "lucide-react";

interface ProfessionalComparisonProps {
  onRegisterClick: () => void;
}

const comparisons = [
  {
    task: "Executive Communication & Stakeholder Memos",
    withoutAI: "45–60 mins agonizing over tone, politeness, and rewrites for sensitive client emails or executive updates.",
    withAI: "2 mins using tailored executive prompt personas in Claude 3.7 to draft polished, persuasive, bulletproof memos."
  },
  {
    task: "Excel Spreadsheets & Data Crunching",
    withoutAI: "Hours wrestling with broken VLOOKUPs, INDEX-MATCH, nested formulas, and manual copy-pasting across sheets.",
    withAI: "Instant natural language queries. Drop CSV into ChatGPT-4o / Claude and get instant formulas, clean tables, and statistical summaries."
  },
  {
    task: "Board Decks & Presentation Outlines",
    withoutAI: "2–3 days formatting PowerPoint slides from scratch, struggling with slide flow and visual bullet points.",
    withAI: "15 minutes. Transform a rough 3-paragraph thought into a 10-slide executive deck structure with speaker notes and charts."
  },
  {
    task: "Meeting Overload & Action Item Tracking",
    withoutAI: "Spending the next 1 hour after every meeting deciphering messy notes and manual follow-up emails.",
    withAI: "Zero post-meeting fatigue. Auto-transcribe and extract decisions, owners, deadlines, and risk items in 30 seconds."
  },
  {
    task: "Market Research & Competitor Analysis",
    withoutAI: "Endless Google searches, skimming through 20 SEO blog tabs, struggling to find verified statistics.",
    withAI: "Live synthesis via Perplexity Pro with cited sources, industry benchmarks, and synthesized SWOT tables in under 3 mins."
  },
  {
    task: "Company SOPs, Policies & Process Guides",
    withoutAI: "Weeks of procrastinating tedious policy documents and onboarding handbooks.",
    withAI: "Speak your workflow out loud or type 5 bullet points — AI structures a full enterprise-grade SOP ready for implementation."
  }
];

const ProfessionalComparison: React.FC<ProfessionalComparisonProps> = ({ onRegisterClick }) => {
  return (
    <section id="career-impact" className="py-14 sm:py-20 bg-slate-50 border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-black uppercase tracking-wider mb-3">
            <TrendingUp className="w-3.5 h-3.5" /> THE CAREER SHIFT
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-4">
            AI Won't Replace Working Professionals. <br />
            <span className="text-indigo-600">Professionals Who Master AI Will.</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            See the undeniable difference in day-to-day corporate throughput between traditional manual methods and the AI-augmented professional workflow.
          </p>
        </div>

        {/* Comparison Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-10 sm:mb-14">
          {comparisons.map((item, index) => (
            <div 
              key={index} 
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden"
            >
              {/* Header Task Title */}
              <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/60">
                <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  WORKPLACE WORKFLOW #{index + 1}
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  {item.task}
                </h3>
              </div>

              {/* Body Comparison */}
              <div className="p-4 sm:p-5 space-y-4 flex-grow">
                {/* Traditional / Without AI */}
                <div className="p-3 rounded-xl bg-red-50/60 border border-red-100 text-left">
                  <div className="flex items-center gap-1.5 text-red-700 font-bold text-xs uppercase tracking-wider mb-1.5">
                    <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>The Old Manual Way</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {item.withoutAI}
                  </p>
                </div>

                {/* AI-Augmented Way */}
                <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200/80 text-left">
                  <div className="flex items-center gap-1.5 text-indigo-700 font-bold text-xs uppercase tracking-wider mb-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>With Advance AI Mastery</span>
                  </div>
                  <p className="text-xs text-slate-900 font-medium leading-relaxed">
                    {item.withAI}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Impact Callout Banner */}
        <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-2xl text-left">
            <div className="inline-flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" /> The Promotion Advantage
            </div>
            <h3 className="text-xl sm:text-3xl font-black mb-2 text-white">
              Become The High-Leverage Go-To Leader in Your Team
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              When others take 3 days to deliver complex analysis, you deliver it in 30 minutes with higher precision, clean visuals, and strategic recommendations. That is how reputations and promotions are built.
            </p>
          </div>

          <button
            onClick={onRegisterClick}
            className="w-full md:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-indigo-900 font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 whitespace-nowrap flex-shrink-0 hover:scale-105 transition-transform"
          >
            <span>Claim Your Corporate Seat</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProfessionalComparison;
