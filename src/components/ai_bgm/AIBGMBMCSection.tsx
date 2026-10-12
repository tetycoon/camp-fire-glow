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

const AIBGMBMCSection: React.FC = () => {
  return (
    <section id="bmc-9-principles" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900 relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[160px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            THE STRATEGIC CORE
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-6">
            The 9 CORE Principles of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-violet-400">
              Business Model Canvas (BMC)
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Most people approach AI like a novelty toy. In the <strong className="text-white">AI-BGM program</strong>, we rebuild each of the 9 foundational business pillars using autonomous AI workflows so you launch a resilient, highly profitable company.
          </p>
        </div>

        {/* 9 Blocks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {bmcBlocks.map((b) => (
            <div
              key={b.number}
              className="group p-8 rounded-3xl bg-slate-950/70 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-950/90 transition-all duration-300 shadow-xl flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-indigo-600/10 rounded-full blur-2xl group-hover:bg-indigo-600/20 transition-all"></div>

              <div>
                {/* Top Number & Icon */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:scale-110 group-hover:border-indigo-500/40 transition-all">
                    {b.icon}
                  </div>
                  <span className="text-3xl font-black text-slate-800 group-hover:text-indigo-400/40 transition-colors">
                    {b.number}
                  </span>
                </div>

                {/* Subtitle & Title */}
                <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 mb-1">
                  Principle {b.number}: {b.principle}
                </div>
                <h3 className="text-xl font-black text-white mb-3 group-hover:text-indigo-200 transition-colors">
                  {b.title}
                </h3>

                {/* AI Power Tag */}
                <div className="inline-block px-2.5 py-1 rounded-lg bg-indigo-950/60 border border-indigo-800/40 text-indigo-300 text-[11px] font-semibold mb-4">
                  ⚡ {b.aiPower}
                </div>

                {/* Description */}
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6 font-normal">
                  {b.desc}
                </p>
              </div>

              {/* Deliverable Pill */}
              <div className="pt-4 border-t border-slate-900 flex items-start gap-2 text-emerald-400 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-400" />
                <span>
                  <strong className="text-slate-300 font-bold">Outcome:</strong> {b.deliverable}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Synthesis Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-indigo-950/80 via-slate-950 to-blue-950/80 border border-indigo-500/30 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="max-w-2xl text-center lg:text-left">
            <h4 className="text-xl sm:text-2xl font-black text-white mb-2">
              From Theoretical Strategy to Autonomous Revenue
            </h4>
            <p className="text-slate-300 text-sm leading-relaxed">
              Every single hour of the 20+ hours of course content is mapped directly into executing these 9 principles. You do not just watch; you build your custom Business Generative Model live.
            </p>
          </div>
          <a
            href="#register"
            className="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider whitespace-nowrap shadow-lg shadow-indigo-600/30 transition-transform hover:scale-105"
          >
            Claim Your BMC Blueprint &rarr;
          </a>
        </div>
      </div>
    </section>
  );
};

export default AIBGMBMCSection;
