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
    title: "The Living LLM Software — Prompt Architecture & Perpetual Updates",
    subtitle: "Harness our proprietary LLM software engine updated with every AI breakthrough",
    icon: <Cpu className="w-5 h-5 text-indigo-400" />,
    topics: [
      "How to use our proprietary 'AI-BGM' software and enterprise prompt repository",
      "The Perpetual Learning Loop: How new AI models (OpenAI, Claude, Gemini) are continuously added",
      "Building your customized business knowledge base (RAG) for internal workflows",
      "Automating customer support and operations using multi-agent frameworks",
      "Your lifetime roadmap: Staying 2 steps ahead in the AI business revolution"
    ],
    keyOutcome: "Full access to the Living LLM Software platform with lifetime continuous updates."
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
    <section id="curriculum" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-950 text-white relative">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-bold uppercase tracking-widest mb-4">
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            COMPREHENSIVE SYLLABUS
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-6">
            20+ Hours of Pure <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-violet-400">
              Business Perspective Mastery
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            No fluff. No surface-level prompts. Every module is a masterclass in building tangible, cash-generating business assets using AI.
          </p>
        </div>

        {/* Modules Accordion */}
        <div className="space-y-4 mb-16">
          {modules.map((m, idx) => {
            const isOpen = openModule === m.id;
            return (
              <div
                key={m.id}
                className={`rounded-3xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? "bg-slate-900 border-indigo-500/60 shadow-2xl shadow-indigo-950/40"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                {/* Accordion Trigger Header */}
                <button
                  onClick={() => toggleModule(m.id)}
                  className="w-full p-6 sm:p-8 flex items-center justify-between text-left gap-4 focus:outline-none"
                >
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center flex-shrink-0 shadow-inner">
                      {m.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-xs font-black text-indigo-400 uppercase tracking-wider">
                          Module 0{idx + 1}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 px-2 py-0.5 rounded-full bg-slate-800/80">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {m.hours}
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                        {m.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-400 font-normal mt-0.5 hidden sm:block">
                        {m.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-800/80 text-slate-400 flex-shrink-0">
                    {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </button>

                {/* Accordion Body */}
                {isOpen && (
                  <div className="px-6 sm:px-8 pb-8 pt-2 border-t border-slate-800/80 bg-slate-950/50">
                    <p className="text-sm text-slate-300 mb-6 font-medium sm:hidden">
                      {m.subtitle}
                    </p>

                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                      Core Topics & Hands-On Exercises:
                    </div>

                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                      {m.topics.map((t, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0 mt-2"></span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Module Outcome Box */}
                    <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-900/50 flex items-center gap-3 text-indigo-200 text-xs sm:text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      <span>
                        <strong className="text-white font-bold">Key Deliverable:</strong> {m.keyOutcome}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Total Summary Footer Box */}
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <div className="text-indigo-400 font-bold text-xs uppercase tracking-widest mb-1">
              THE FULL ACCELERATOR
            </div>
            <div className="text-2xl font-black text-white">
              20+ Hours of Actionable Instruction + Lifetime Software Access
            </div>
            <p className="text-slate-400 text-xs mt-1">
              Includes templates, prompt libraries, SOPs, and perpetual LLM updates with zero renewal fees.
            </p>
          </div>

          <button
            type="button"
            onClick={onRegisterClick}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider whitespace-nowrap shadow-xl shadow-indigo-600/30 hover:scale-105 transition-all"
          >
            Unlock VIP Pricing & Register &rarr;
          </button>
        </div>
      </div>
    </section>
  );
};

export default AIBGMCurriculum;
