import React from "react";
import { 
  Briefcase, 
  Target, 
  BarChart3, 
  Users, 
  DollarSign, 
  Megaphone, 
  FolderKanban, 
  ShieldCheck,
  ArrowRight
} from "lucide-react";

interface ProfessionalRolesSectionProps {
  onRegisterClick: () => void;
}

const roles = [
  {
    title: "Operations & Project Managers",
    icon: FolderKanban,
    color: "from-blue-500 to-indigo-600",
    bgLight: "bg-blue-50/50",
    border: "border-blue-200",
    badge: "Operations",
    takeaways: [
      "Auto-generate project charters, risk matrices, and RACI tables in minutes",
      "Convert messy Slack / email threads into crisp sprint action items",
      "Build live status dashboards and executive weekly updates with zero coding"
    ]
  },
  {
    title: "Marketing, Sales & Business Development",
    icon: Megaphone,
    color: "from-purple-500 to-pink-600",
    bgLight: "bg-purple-50/50",
    border: "border-purple-200",
    badge: "Revenue & Growth",
    takeaways: [
      "Write hyper-personalized B2B cold outreach emails that get 4x reply rates",
      "Analyze competitor positioning and pricing strategies in real-time",
      "Generate high-converting landing page copy, ad hooks, and campaign scripts"
    ]
  },
  {
    title: "HR, Talent Acquisition & People Ops",
    icon: Users,
    color: "from-emerald-500 to-teal-600",
    bgLight: "bg-emerald-50/50",
    border: "border-emerald-200",
    badge: "Human Resources",
    takeaways: [
      "Draft benchmark job descriptions and scorecards in 30 seconds",
      "Create unbiased candidate interview questions & evaluation rubrics",
      "Formulate corporate policy docs, employee handbooks, and empathetic internal emails"
    ]
  },
  {
    title: "Finance, Accounting & Business Analysts",
    icon: DollarSign,
    color: "from-amber-500 to-orange-600",
    bgLight: "bg-amber-50/50",
    border: "border-amber-200",
    badge: "Finance & Analytics",
    takeaways: [
      "Generate complex Excel formulas, macros, and debugging logic using plain English",
      "Synthesize 80-page financial audits and P&L reports into 1-page executive briefs",
      "Identify expense anomalies and budget variance trends without manual data slog"
    ]
  },
  {
    title: "Team Leads, Directors & Executives",
    icon: ShieldCheck,
    color: "from-slate-700 to-slate-900",
    bgLight: "bg-slate-50",
    border: "border-slate-300",
    badge: "Leadership & Management",
    takeaways: [
      "Draft strategic department memos and quarterly OKRs aligned with board goals",
      "Prepare high-stakes 1-on-1 talking points and constructive feedback frameworks",
      "Simulate tough negotiations, pushback scenarios, and investor Q&As with AI personas"
    ]
  },
  {
    title: "Consultants & Freelance Domain Experts",
    icon: BarChart3,
    color: "from-indigo-600 to-cyan-600",
    bgLight: "bg-indigo-50/50",
    border: "border-indigo-200",
    badge: "Advisory & Consulting",
    takeaways: [
      "Synthesize deep client domain research and industry benchmarks in 15 minutes",
      "Deliver enterprise-grade strategic advisory proposals with zero junior staff overhead",
      "Package your expertise into scalable, repeatable digital frameworks"
    ]
  }
];

const ProfessionalRolesSection: React.FC<ProfessionalRolesSectionProps> = ({ onRegisterClick }) => {
  return (
    <section id="roles" className="py-14 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-black uppercase tracking-wider mb-3">
            <Target className="w-3.5 h-3.5" /> ROLE-SPECIFIC APPLICATION
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Custom-Built for Your Exact Role in the Organization
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            We don't teach abstract AI theories. You will learn the exact practical workflows that solve the day-to-day bottlenecks in your specific department.
          </p>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mb-12">
          {roles.map((role, idx) => {
            const Icon = role.icon;
            return (
              <div 
                key={idx}
                className={`rounded-2xl border ${role.border} ${role.bgLight} p-5 sm:p-6 flex flex-col justify-between hover:shadow-md transition-shadow`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${role.color} text-white flex items-center justify-center shadow-md`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                      {role.badge}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-3">
                    {role.title}
                  </h3>

                  <ul className="space-y-2.5 text-xs text-slate-700 mb-6">
                    {role.takeaways.map((point, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 flex-shrink-0"></span>
                        <span className="leading-relaxed">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-indigo-700 font-bold text-xs">
                  <span>Included in 2026 Cohort</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Role CTA Box */}
        <div className="text-center">
          <button
            onClick={onRegisterClick}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-md hover:scale-105 transition-all"
          >
            <span>Upgrade Your Role With AI Today</span>
            <ArrowRight className="w-4 h-4 text-indigo-400" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProfessionalRolesSection;
