import React from "react";
import { 
  Users, 
  Target, 
  Send, 
  HeartHandshake, 
  IndianRupee, 
  Cpu, 
  Zap, 
  Layers, 
  TrendingDown, 
  ArrowRight,
  Sparkles,
  CheckCircle2
} from "lucide-react";

interface BMCBlock {
  number: string;
  title: string;
  principle: string;
  aiPower: string;
  desc: string;
  deliverable: string;
  icon: React.ReactNode;
}

const bmcBlocks: BMCBlock[] = [
  {
    number: "01",
    title: "Customer Segments",
    principle: "Hyper-Niche Audience Discovery",
    aiPower: "AI Predictive Persona Synthesizer",
    desc: "Move past generic demographics. We use AI models to extract raw customer pain points, buying psychological triggers, and identify micro-niches that actively pay premium prices.",
    deliverable: "Target Customer Persona Matrix & Niche Validation Dossier",
    icon: <Users className="w-6 h-6 text-blue-400" />
  },
  {
    number: "02",
    title: "Value Propositions",
    principle: "Irresistible Offer Crafting",
    aiPower: "AI Offer Architect & Value Maximizer",
    desc: "Engineer offers so compelling people feel stupid saying no. Learn how to structure guarantees, transform features into visceral benefits, and formulate high-ticket propositions.",
    deliverable: "High-Ticket Value Proposition & Core Hook Script",
    icon: <Target className="w-6 h-6 text-indigo-400" />
  },
  {
    number: "03",
    title: "Distribution Channels",
    principle: "High-Converting Websites & Funnels",
    aiPower: "AI Full-Stack Website & Landing Page Generator",
    desc: "Build lightning-fast, high-converting digital storefronts and landing pages with AI. Direct organic and paid traffic through seamless frictionless conversion funnels.",
    deliverable: "Live High-Converting AI Website & Omnichannel Traffic Plan",
    icon: <Send className="w-6 h-6 text-violet-400" />
  },
  {
    number: "04",
    title: "Customer Relationships",
    principle: "Automated Trust & Community Building",
    aiPower: "AI Autonomous Relationship Agents",
    desc: "Nurture prospects on complete autopilot. Deploy smart AI email sequences, conversational WhatsApp assistants, and engagement protocols that convert strangers into advocates.",
    deliverable: "30-Day Automated AI Nurture Sequence & Retention Flows",
    icon: <HeartHandshake className="w-6 h-6 text-rose-400" />
  },
  {
    number: "05",
    title: "Revenue Streams",
    principle: "Multi-Tiered Monetization Engine",
    aiPower: "AI Pricing & Monetization Forecaster",
    desc: "Map out predictable cashflow. Design upfront offers, recurring memberships, upsells, backend software access, and high-margin consulting programs with zero friction.",
    deliverable: "Multi-Tiered Revenue Architecture (Frontend to High-Ticket)",
    icon: <IndianRupee className="w-6 h-6 text-emerald-400" />
  },
  {
    number: "06",
    title: "Key Resources",
    principle: "Living LLM Software & Proprietary Assets",
    aiPower: "Custom Domain-Trained AI Agents & Repositories",
    desc: "Leverage the ultimate asset: our Living LLM software. Build your private knowledge vaults, prompt banks, and algorithmic workflows that run as your proprietary business IP.",
    deliverable: "Custom LLM Knowledge Base & Asset Library",
    icon: <Cpu className="w-6 h-6 text-amber-400" />
  },
  {
    number: "07",
    title: "Key Activities",
    principle: "Automated Execution & Video Creation",
    aiPower: "AI Video Studio & Content Flywheel",
    desc: "Eliminate bottleneck execution. Generate studio-quality AI video ads, social content reels, ad copy, and campaign scripts in minutes without recording equipment or cameras.",
    deliverable: "Hyper-Realistic AI Video Creatives & Production Pipeline",
    icon: <Zap className="w-6 h-6 text-cyan-400" />
  },
  {
    number: "08",
    title: "Key Partnerships",
    principle: "Strategic Ecosystem Alliances",
    aiPower: "AI Partnership & Platform Orchestration",
    desc: "Connect seamlessly with global payment gateways (Razorpay, Stripe), marketing ad networks (Meta, Google), and API integrations to amplify distribution without team overhead.",
    deliverable: "Automated Tech-Stack & Payment Gateway Integration Map",
    icon: <Layers className="w-6 h-6 text-teal-400" />
  },
  {
    number: "09",
    title: "Cost Structure",
    principle: "Hyper-Lean High-Margin Economics",
    aiPower: "AI Cost Elimination & Unit Optimization",
    desc: "Run a venture with 80-90% gross margins. Replace \$5,000/month agency bills with intelligent AI workflows that run 24/7 at near-zero marginal cost.",
    deliverable: "Unit Economics Model & Cost Minimization Framework",
    icon: <TrendingDown className="w-6 h-6 text-pink-400" />
  }
];

interface AIBGMBMCSectionProps {
  onRegisterClick?: () => void;
}

const AIBGMBMCSection: React.FC<AIBGMBMCSectionProps> = ({ onRegisterClick }) => {
  return (
    <section id="bmc-9-principles" className="py-12 sm:py-20 lg:py-24 px-3.5 sm:px-6 lg:px-8 bg-slate-50 border-t border-slate-200 relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-100/50 rounded-full blur-[160px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-blue-100/70 border border-blue-200 text-blue-700 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-3 sm:mb-4">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600" />
            THE STRATEGIC CORE
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-3 sm:mb-6 leading-tight">
            The 9 CORE Principles of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">
              Business Model Canvas (BMC)
            </span>
          </h2>
          <p className="text-xs sm:text-base text-slate-600 leading-relaxed font-normal">
            Most people approach AI like a novelty toy. In the <strong className="text-slate-900">AI-BGM program</strong>, we rebuild each of the 9 foundational business pillars using autonomous AI workflows so you launch a resilient, highly profitable company.
          </p>
        </div>

        {/* 9 Blocks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6 mb-8 sm:mb-16">
          {bmcBlocks.map((b) => (
            <div
              key={b.number}
              className="group p-4 sm:p-7 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 shadow-sm flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-blue-50 rounded-full blur-2xl group-hover:bg-blue-100/50 transition-all"></div>

              <div>
                {/* Top Number & Icon */}
                <div className="flex items-center justify-between mb-3 sm:mb-6">
                  <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-50/80 border border-blue-100 flex items-center justify-center group-hover:scale-110 transition-all text-blue-600">
                    {b.icon}
                  </div>
                  <span className="text-xl sm:text-3xl font-black text-slate-200 group-hover:text-blue-500/40 transition-colors">
                    {b.number}
                  </span>
                </div>

                {/* Subtitle & Title */}
                <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-blue-600 mb-0.5 sm:mb-1">
                  Principle {b.number}: {b.principle}
                </div>
                <h3 className="text-base sm:text-xl font-black text-slate-900 mb-2 sm:mb-3 group-hover:text-blue-700 transition-colors">
                  {b.title}
                </h3>

                {/* AI Power Tag */}
                <div className="inline-block px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg bg-blue-50 border border-blue-200/70 text-blue-700 text-[10px] sm:text-[11px] font-semibold mb-2.5 sm:mb-4">
                  ⚡ {b.aiPower}
                </div>

                {/* Description */}
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6 font-normal">
                  {b.desc}
                </p>
              </div>

              {/* Deliverable Pill */}
              <div className="pt-3 sm:pt-4 border-t border-slate-100 flex items-start gap-2 text-emerald-700 text-[11px] sm:text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
                <span>
                  <strong className="text-slate-900 font-bold">Outcome:</strong> {b.deliverable}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Synthesis Banner */}
        <div className="p-5 sm:p-10 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-xl shadow-blue-500/20 border border-blue-400/30 flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-6">
          <div className="max-w-2xl text-center lg:text-left">
            <h4 className="text-lg sm:text-2xl font-black text-white mb-1.5 sm:mb-2">
              From Theoretical Strategy to Autonomous Revenue
            </h4>
            <p className="text-blue-100 text-xs sm:text-sm leading-relaxed">
              Every single hour of the 20+ hours of course content is mapped directly into executing these 9 principles. You do not just watch; you build your custom Business Generative Model live.
            </p>
          </div>
          <button
            type="button"
            onClick={onRegisterClick}
            className="w-full sm:w-auto px-5 py-3 sm:px-6 sm:py-3.5 rounded-xl bg-white hover:bg-slate-50 text-blue-700 font-black text-xs uppercase tracking-wider whitespace-nowrap shadow-md transition-transform hover:scale-105 active:scale-95 text-center"
          >
            Claim Your BMC Blueprint &rarr;
          </button>
        </div>
      </div>
    </section>
  );
};

export default AIBGMBMCSection;
