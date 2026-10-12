import React from "react";
import { 
  Gift, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  FileText, 
  FileSpreadsheet, 
  Presentation, 
  FolderLock, 
  Users 
} from "lucide-react";

interface ProfessionalBonusesProps {
  onRegisterClick: () => void;
}

const bonuses = [
  {
    tag: "BONUS #1",
    title: "500+ Executive Workplace Prompt Vault",
    value: "₹4,999",
    description: "Plug-and-play battle-tested prompts for stakeholder negotiations, difficult performance reviews, crisis emails, and board updates.",
    icon: FileText
  },
  {
    tag: "BONUS #2",
    title: "The Conversational Excel & Financial Modeling Toolkit",
    value: "₹2,999",
    description: "Instant formula cheat sheets and copy-paste prompts that turn raw messy spreadsheets into executive summaries without formula errors.",
    icon: FileSpreadsheet
  },
  {
    tag: "BONUS #3",
    title: "Boardroom Presentation & Slide Deck Frameworks",
    value: "₹3,499",
    description: "10 proven presentation narrative structures that turn complex data into compelling executive decks that win budget and approval.",
    icon: Presentation
  },
  {
    tag: "BONUS #4",
    title: "Standard Operating Procedure (SOP) & Team Playbook Builder",
    value: "₹3,999",
    description: "Complete department workflow templates for onboarding, project tracking, delegation, and quality control.",
    icon: FolderLock
  },
  {
    tag: "BONUS #5",
    title: "Lifetime Community & Monthly 2026 AI Strategy Sessions",
    value: "₹9,999",
    description: "Stay ahead of every major AI model update, new workplace features, and live corporate Q&A sessions with industry mentors.",
    icon: Users
  }
];

const ProfessionalBonuses: React.FC<ProfessionalBonusesProps> = ({ onRegisterClick }) => {
  return (
    <section className="py-14 sm:py-20 bg-slate-50 border-t border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black uppercase tracking-wider mb-3">
            <Gift className="w-3.5 h-3.5" /> EXCLUSIVE ENROLLMENT BONUSES
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Get ₹25,495 Worth of Executive Toolkits & Templates 100% Free
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            These ready-to-use resource toolkits allow you to deploy high-leverage AI workflows in your current workplace from Day 1.
          </p>
        </div>

        {/* Bonuses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-10">
          {bonuses.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                      {b.tag}
                    </span>
                    <span className="text-xs font-bold text-slate-400 line-through">
                      Value: {b.value}
                    </span>
                  </div>

                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                      {b.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {b.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-emerald-600 font-bold text-xs">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Included Free
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase">Lifetime Access</span>
                </div>
              </div>
            );
          })}

          {/* Bonus Highlight Card */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl text-white p-5 sm:p-6 flex flex-col justify-between shadow-lg">
            <div>
              <div className="inline-flex items-center gap-1.5 text-amber-400 text-xs font-black uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" /> ALL-INCLUSIVE PASS
              </div>
              <h3 className="text-lg font-black mb-2 text-white">
                Total Value: ₹40,494+
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Full 7-Module Course + All 5 Executive Toolkits + Official Completion Certificate + Lifetime Community Access.
              </p>
            </div>

            <div>
              <div className="text-xl sm:text-2xl font-black text-amber-400 mb-2">
                VIP Enrollee Rate: ₹2,999
              </div>
              <button
                onClick={onRegisterClick}
                className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-100 text-indigo-950 font-bold text-xs uppercase tracking-wider text-center shadow-md flex items-center justify-center gap-1.5"
              >
                <span>Unlock All Bonuses</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfessionalBonuses;
