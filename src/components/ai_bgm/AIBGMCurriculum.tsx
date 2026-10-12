import React, { useState } from "react";
import { 
  BookOpen, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Lightbulb, 
  Compass, 
  Palette, 
  Globe, 
  Video, 
  TrendingUp, 
  Cpu, 
  Sparkles,
  Lock
} from "lucide-react";

interface ModuleData {
  id: string;
  hours: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  topics: string[];
  keyOutcome: string;
}

const modules: ModuleData[] = [
  {
    id: "mod-1",
    hours: "3.0 Hours",
    title: "AI Business Ideation & High-Profit Niche Selection",
    subtitle: "Find lucrative market gaps with unfair AI research speed",
    icon: <Lightbulb className="w-5 h-5 text-amber-400" />,
    topics: [
      "AI market trend scraping: Spotting emerging niches before competitors",
      "Validating demand & willingness to pay using predictive LLM prompts",
      "Evaluating TAM (Total Addressable Market) and micro-niche profit pools",
      "Eliminating bad ideas in minutes: Risk-reward scoring algorithms",
      "Formulating your Unique Commercial Advantage (UCA) with AI models"
    ],
    keyOutcome: "A bulletproof, validated business idea and targeted micro-niche."
  },
  {
    id: "mod-2",
    hours: "3.5 Hours",
    title: "The 9-Core AI Business Model Canvas (BMC) Blueprint",
    subtitle: "Deconstruct and architect your venture's complete unit economics",
    icon: <Compass className="w-5 h-5 text-blue-400" />,
    topics: [
      "Deep ICP synthesis: Customer segments, psychographics & pain mapping",
      "High-ticket value proposition design & 'no-brainer' guarantee stacking",
      "Omnichannel distribution architecture: Direct-to-Consumer & B2B channels",
      "Automated relationship workflows: Nurturing trust and brand loyalty",
      "Revenue stream modeling: One-time, recurring, and backend upsell engines",
      "Lean cost engineering: Eliminating 80% overhead using autonomous AI"
    ],
    keyOutcome: "A fully filled, battle-tested Business Model Canvas ready for execution."
  },
  {
    id: "mod-3",
    hours: "3.0 Hours",
    title: "High-Converting AI Creatives, Branding & Visual Ad Assets",
    subtitle: "Produce million-dollar agency-level marketing assets in seconds",
    icon: <Palette className="w-5 h-5 text-violet-400" />,
    topics: [
      "Brand identity generation: Logos, color psychology, and typography guidelines",
      "Hyper-converting ad banners and thumbnail creation using Midjourney & Flux",
      "AI product mockups, 3D renders, and commercial photography generation",
      "Copy-to-Creative alignment: Ensuring visual resonance with buyer intent",
      "Batch-generating 50+ ad creative variations for Meta and Google testing"
    ],
    keyOutcome: "A complete suite of 50+ high-CTR ad creatives and brand guidelines."
  },
  {
    id: "mod-4",
    hours: "3.0 Hours",
    title: "Lightning-Fast AI Website & Landing Page Creation",
    subtitle: "From prompt to a published, high-converting digital storefront",
    icon: <Globe className="w-5 h-5 text-emerald-400" />,
    topics: [
      "Architecting high-converting wireframes using generative AI layout prompts",
      "AI-driven sales copywriting: Headlines, benefit bullets, social proof & FAQs",
      "No-code & full-stack deployment: Publishing responsive websites in under 60 mins",
      "Integrating payment gateways (Razorpay, Stripe) and instant order forms",
      "Setting up Meta Pixel, Google Analytics, and conversion API tracking"
    ],
    keyOutcome: "A published, live, mobile-responsive sales page with payment checkout."
  },
  {
    id: "mod-5",
    hours: "3.5 Hours",
    title: "Studio-Grade AI Video Creation & Faceless Media Production",
    subtitle: "Generate viral reels, video sales letters (VSLs), and dynamic video ads",
    icon: <Video className="w-5 h-5 text-rose-400" />,
    topics: [
      "Writing hypnotic, high-retention video scripts with custom prompt frameworks",
      "Hyper-realistic AI avatars, voice cloning, and emotional speech synthesis",
      "B-roll generation, automated captions, cinematic pacing, and video editing",
      "Creating high-converting Video Sales Letters (VSLs) that sell 24/7",
      "Building faceless viral video pipelines across Instagram, YouTube & TikTok"
    ],
    keyOutcome: "3 polished AI video ads and 1 full-length high-converting Video Sales Letter."
  },
  {
    id: "mod-6",
    hours: "4.0 Hours",
    title: "Full-Funnel AI Digital Marketing & Customer Acquisition",
    subtitle: "Fill your calendar and checkout with qualified, ready-to-buy customers",
    icon: <TrendingUp className="w-5 h-5 text-cyan-400" />,
    topics: [
      "Meta Ads & Google Ads masterplay: Campaign structure and targeting with AI",
      "Algorithmic ad copy testing: Hook testing, angle discovery & budget scaling",
      "Automated lead magnets, opt-in sequences, and CRM pipeline synchronization",
      "Automated WhatsApp & Email marketing flows that trigger automatically",
      "Calculating Customer Acquisition Cost (CAC) and optimizing Return on Ad Spend (ROAS)"
    ],
    keyOutcome: "A live, automated lead-generation and paid advertising acquisition engine."
  },
  {
    id: "mod-7",
    hours: "2.0+ Hours",
    title: "Proprietary AI Architecture — Prompt Systems & Perpetual Updates",
    subtitle: "Harness our proprietary AI engine updated with every breakthrough",
    icon: <Cpu className="w-5 h-5 text-indigo-400" />,
    topics: [
      "How to deploy enterprise prompt repositories and business AI tools",
      "The Perpetual Learning Loop: How new AI models (OpenAI, Claude, Gemini) are continuously added",
      "Building your customized business knowledge base (RAG) for internal workflows",
      "Automating customer support and operations using multi-agent frameworks",
      "Your lifetime roadmap: Staying 2 steps ahead in the AI business revolution"
    ],
    keyOutcome: "Full access to the AI-BGM platform with lifetime continuous updates."
  }
];

interface AIBGMCurriculumProps {
  onRegisterClick?: () => void;
}

const AIBGMCurriculum: React.FC<AIBGMCurriculumProps> = ({ onRegisterClick }) => {
  const [openModule, setOpenModule] = useState<string>("mod-1");

  const toggleModule = (id: string) => {
    setOpenModule(openModule === id ? "" : id);
  };

  return (
    <section id="curriculum" className="py-12 sm:py-20 lg:py-24 px-3.5 sm:px-6 lg:px-8 bg-white text-slate-900 relative">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-3 sm:mb-4">
            <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600" />
            COMPREHENSIVE SYLLABUS
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-3 sm:mb-6 leading-tight">
            20+ Hours of Pure <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">
              Business Perspective Mastery
            </span>
          </h2>
          <p className="text-xs sm:text-base text-slate-600 leading-relaxed font-normal">
            No fluff. No surface-level prompts. Every module is a masterclass in building tangible, cash-generating business assets using AI.
          </p>
        </div>

        {/* Modules Accordion */}
        <div className="space-y-3 sm:space-y-4 mb-8 sm:mb-16">
          {modules.map((m, idx) => {
            const isOpen = openModule === m.id;
            return (
              <div
                key={m.id}
                className={`rounded-2xl sm:rounded-3xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? "bg-white border-blue-400 shadow-lg ring-1 ring-blue-500/20"
                    : "bg-slate-50/60 border-slate-200 hover:border-slate-300 hover:bg-white"
                }`}
              >
                {/* Accordion Trigger Header */}
                <button
                  onClick={() => toggleModule(m.id)}
                  className="w-full p-4 sm:p-6 sm:p-8 flex items-center justify-between text-left gap-3 sm:gap-4 focus:outline-none"
                >
                  <div className="flex items-center gap-3 sm:gap-6">
                    <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-50/80 border border-blue-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                      {m.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 sm:gap-3 mb-0.5 sm:mb-1">
                        <span className="text-[10px] sm:text-xs font-black text-blue-600 uppercase tracking-wider">
                          Module 0{idx + 1}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-slate-600 px-2 py-0.5 rounded-full bg-slate-100">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {m.hours}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-xl font-black text-slate-900 tracking-tight leading-snug">
                        {m.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5 hidden sm:block">
                        {m.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-slate-100 text-slate-600 flex-shrink-0">
                    {isOpen ? <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" /> : <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </div>
                </button>

                {/* Accordion Body */}
                {isOpen && (
                  <div className="px-4 sm:px-8 pb-5 sm:pb-8 pt-2 border-t border-slate-100 bg-slate-50/40">
                    <p className="text-xs sm:text-sm text-slate-600 mb-4 sm:mb-6 font-medium sm:hidden">
                      {m.subtitle}
                    </p>

                    <div className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 sm:mb-4">
                      Core Topics & Hands-On Exercises:
                    </div>

                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
                      {m.topics.map((t, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0 mt-1.5 sm:mt-2"></span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Module Outcome Box */}
                    <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-blue-50/80 border border-blue-100 flex items-center gap-2.5 sm:gap-3 text-blue-900 text-xs sm:text-sm">
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 flex-shrink-0" />
                      <span>
                        <strong className="text-slate-900 font-bold">Key Deliverable:</strong> {m.keyOutcome}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Total Summary Footer Box */}
        <div className="p-5 sm:p-10 rounded-2xl sm:rounded-3xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 text-center md:text-left shadow-sm">
          <div>
            <div className="text-blue-600 font-bold text-[10px] sm:text-xs uppercase tracking-widest mb-1">
              THE FULL ACCELERATOR
            </div>
            <div className="text-lg sm:text-2xl font-black text-slate-900">
              20+ Hours of Actionable Instruction + Lifetime Software Access
            </div>
            <p className="text-slate-600 text-xs mt-1">
              Includes templates, prompt libraries, SOPs, and perpetual LLM updates with zero renewal fees.
            </p>
          </div>

          <button
            type="button"
            onClick={onRegisterClick}
            className="w-full sm:w-auto px-6 py-3.5 sm:px-8 sm:py-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs uppercase tracking-wider whitespace-nowrap shadow-md sm:shadow-lg shadow-blue-500/25 hover:scale-105 active:scale-95 transition-all text-center"
          >
            Unlock VIP Pricing & Register &rarr;
          </button>
        </div>
      </div>
    </section>
  );
};

export default AIBGMCurriculum;
