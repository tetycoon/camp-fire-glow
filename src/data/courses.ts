// Single source of truth for the homepage course catalog.
// Every fee, duration and schedule below is copied from the course's own
// landing page — update both together. Leave `fees` empty when the landing
// page deliberately hides its price (use `feeNote` instead).

import imgEntrepreneur from "../assets/indian_entrepreneur.png";
import imgAnalytics from "../assets/indian_analytics.png";
import imgUpscale from "../assets/upscale_workshop_hero.jpg";
import imgFilmmaking from "../assets/ai_video_sample.jpg";
import imgCollege from "../assets/event-6.jpg";
import imgBusinessCohort from "../assets/event-10.jpg";
import imgExecutive from "../assets/event-9.jpg";

export type CourseCategory = "online" | "offline" | "bootcamp" | "self-paced" | "mentorship";

export interface Course {
  id: string;
  title: string;
  category: CourseCategory;
  tag: string;
  intro: string;
  /** Headline fee as shown on the landing page. Omit when the page hides pricing. */
  fees?: string;
  /** Struck-through reference price, only when the landing page shows one. */
  originalFees?: string;
  /** Short qualifier under the fee (GST note, add-on option, hidden-price notice). */
  feeNote?: string;
  duration: string;
  /** Only when the landing page states a schedule. */
  schedule?: string;
  format: string;
  image: string;
  link: string;
  /**
   * True for standalone pages served from /public (claude_masterclass, advanced_masterclass,
   * working-professionals, ai-powered-career-development). These must be opened with a full
   * page load so the browser gets the static page instead of a client-side SPA route.
   */
  isStatic: boolean;
  highlights: string[];
}

export const courseCategories: { id: "all" | CourseCategory; label: string }[] = [
  { id: "all", label: "All Programs" },
  { id: "online", label: "Online Live" },
  { id: "offline", label: "In-Person Chennai" },
  { id: "bootcamp", label: "30-Day Bootcamps" },
  { id: "self-paced", label: "Academy & Self-Paced" },
  { id: "mentorship", label: "1-on-1" },
];

export const courses: Course[] = [
  {
    id: "claude-masterclass",
    title: "Claude 3.5 AI Masterclass",
    category: "online",
    tag: "Hot & Trending",
    intro: "Master Claude prompt architecture, build custom MCP servers, automate coding with Claude Code CLI and build full websites live — taught in Tamil & English.",
    fees: "From ₹499",
    feeNote: "₹999 pass adds class recordings",
    duration: "2 Days · 3 hrs/day",
    schedule: "Every Saturday & Sunday, 5:30 – 8:30 PM IST",
    format: "Online Live",
    image: "/images/antony_praveen.jpg",
    link: "/claude_masterclass/",
    isStatic: true,
    highlights: [
      "Build custom Model Context Protocol (MCP) servers",
      "Claude Code CLI, websites & dashboards built live",
      "Verified e-certificate & project source code",
    ],
  },
  {
    id: "ai-secrets",
    title: "AI Secrets Revealed & Business Automation",
    category: "online",
    tag: "Most Popular",
    intro: "A practical 3-hour live workshop on AI tools, prompt frameworks and business automation — cut repetitive work across content, design and client acquisition.",
    fees: "₹99",
    originalFees: "₹999",
    feeNote: "₹499 pass adds the complete resource toolkit",
    duration: "3 Hours",
    schedule: "Tentative every Friday, 5:30 – 8:30 PM IST",
    format: "Online Live",
    image: imgEntrepreneur,
    link: "/ai_masterclass",
    isStatic: false,
    highlights: [
      "Hands-on practice with 10+ AI productivity tools",
      "Prompt frameworks & business automation workflows",
      "Zero coding needed · Tamil & English",
    ],
  },
  {
    id: "advanced-masterclass",
    title: "Executive AI Mastery: 3-Day Live Masterclass",
    category: "online",
    tag: "Executive Advanced",
    intro: "For business owners and entrepreneurs: automate growth with the 9-block AI Business Model Canvas, build high-converting websites and create viral AI business videos.",
    fees: "₹4,999",
    originalFees: "₹14,999",
    duration: "3 Days · 3 hrs/day",
    schedule: "11, 12 & 13 December 2026 (Fri–Sun), 5:30 – 8:30 PM IST",
    format: "Online Live (Zoom / Meet)",
    image: imgAnalytics,
    link: "/advanced_masterclass/",
    isStatic: true,
    highlights: [
      "9-block Business Model Canvas with AI",
      "AI websites & character-consistent AI videos",
      "Session recordings with lifetime access + certificate",
    ],
  },
  {
    id: "upscale-offline",
    title: "AI Business Generative Model (Advanced) — Chennai",
    category: "offline",
    tag: "In-Person · Chennai",
    intro: "A full-day executive workshop on the 9 principles of Business Generative Models. Build your complete AI business system live, in 8 intensive hours.",
    fees: "₹6,499",
    originalFees: "₹9,999",
    duration: "1 Day · 8 Hours",
    schedule: "Sunday, 6 December 2026",
    format: "Vestin Park Hotel, Egmore",
    image: imgUpscale,
    link: "/upscale",
    isStatic: false,
    highlights: [
      "Live hands-on build with Antony Praveen",
      "Executive lunch & high tea included",
      "Limited to 30 seats per batch",
    ],
  },
  {
    id: "ai-filmmaking",
    title: "AI Filmmaking & Video Generation",
    category: "online",
    tag: "New",
    intro: "Go from beginner to directing 3D AI logo animations, talking AI avatars and cinematic AI videos — no cameras or complex 3D software needed.",
    fees: "₹99",
    originalFees: "₹1,999",
    feeNote: "₹499 option adds session PDF & material",
    duration: "3 Hours",
    format: "Online Live Webinar",
    image: imgFilmmaking,
    link: "/ai_filmmaking",
    isStatic: false,
    highlights: [
      "3D AI logo animations & brand visuals",
      "Talking AI avatars with lip-sync",
      "Cinematic AI video generation workflows",
    ],
  },
  {
    id: "working-professionals",
    title: "AI Skills for Working Professionals",
    category: "online",
    tag: "Career Growth",
    intro: "A practical 3-hour session to create content, prepare reports, automate daily tasks and save hours every week with AI. No coding needed.",
    fees: "From ₹99",
    feeNote: "₹499 option includes the session document",
    duration: "3 Hours",
    format: "Online Live",
    image: "/working-professionals/assets/hero-training-960.jpg",
    link: "/working-professionals/",
    isStatic: true,
    highlights: [
      "Smart prompting & professional content",
      "Reports, presentations and task automation",
      "Personal 7-day AI action plan",
    ],
  },
  {
    id: "ai-career-development",
    title: "AI-Powered Career Development",
    category: "online",
    tag: "Students & Freshers",
    intro: "A 2-day live session for students, fresh graduates and job seekers: practical AI tools, resume and portfolio building with AI, and modern digital skills.",
    fees: "From ₹99",
    feeNote: "₹299 option includes the learning document",
    duration: "2 Days",
    format: "Online Live",
    image: "/ai-powered-career-development/assets/hero.jpg",
    link: "/ai-powered-career-development/",
    isStatic: true,
    highlights: [
      "AI fundamentals & popular AI tools",
      "Resume and portfolio creation using AI",
      "Beginner friendly — finish a project of your own",
    ],
  },
  {
    id: "bootcamp",
    title: "AI Summer Bootcamp",
    category: "bootcamp",
    tag: "30-Day Bootcamp",
    intro: "A 30-day deep-dive into generative AI and agentic workflows for 9th–12th grade students, with expert guest modules and a practitioner credential.",
    feeNote: "Enquire for cohort pricing",
    duration: "30 Days · 3 hrs/day",
    schedule: "Upcoming 30-day batch (limited seats)",
    format: "Live Online (Zoom)",
    image: "/images/summer_camp.jpg",
    link: "/bootcamp",
    isStatic: false,
    highlights: [
      "12+ expert-crafted modules",
      "Dual-slot flexibility (AM / PM sessions)",
      "Industry-certified AI practitioner credential",
    ],
  },
  {
    id: "college-bootcamp",
    title: "AI Mastery Bootcamp for College Students",
    category: "bootcamp",
    tag: "Students & Entrepreneurs",
    intro: "Build real-world AI skills that drive careers and startups in 30 days — designed for college students and young entrepreneurs.",
    fees: "₹9,999",
    originalFees: "₹14,999",
    feeNote: "Inclusive of GST",
    duration: "30 Days · 3 hrs/day",
    format: "Live on Zoom",
    image: imgCollege,
    link: "/college",
    isStatic: false,
    highlights: [
      "12 modules from basics to real projects",
      "10 AM – 1 PM or 6 PM – 9 PM sessions",
      "Industry-recognized certificate",
    ],
  },
  {
    id: "academy",
    title: "Tech Tycoon AI Academy",
    category: "self-paced",
    tag: "Pre-Register",
    intro: "Detailed Claude & AI engineering sessions with lifetime platform access — Claude Sonnet, Claude Code CLI, custom MCP servers and AI agents.",
    fees: "₹9,999",
    feeNote: "Special offer for existing learners at checkout",
    duration: "Lifetime Access",
    format: "Online Course Portal",
    image: "/images/AI_Secrets_Revealed_Banner.png",
    link: "/academy",
    isStatic: false,
    highlights: [
      "Detailed Claude Sonnet & Claude Code CLI sessions",
      "Custom MCP servers & AI agent workflows",
      "Certificate included · lifetime portal access",
    ],
  },
  {
    id: "ai-bgm",
    title: "Advance AI-Business Generative Model (AI-BGM)",
    category: "self-paced",
    tag: "Executive Self-Paced",
    intro: "Orchestrate generative models to build a profitable business: niche picking, 9-core Business Model Canvas, creatives, AI websites, AI videos and automated marketing.",
    feeNote: "Pricing revealed at registration",
    duration: "20+ Hours · Lifetime Access",
    format: "Self-Paced Video Course",
    image: imgBusinessCohort,
    link: "/ai_bgm",
    isStatic: false,
    highlights: [
      "9-part Business Model Canvas with AI",
      "AI websites, hyper-realistic AI videos & creatives",
      "Continuous AI updates included",
    ],
  },
  {
    id: "professionals",
    title: "Advance AI for Non-Tech Working Professionals",
    category: "self-paced",
    tag: "No Coding",
    intro: "For managers, executives, HR, finance, sales and operations: use Claude, ChatGPT, Perplexity and smart automation to finish reports, presentations and analysis in minutes.",
    feeNote: "Pricing revealed at registration",
    duration: "7 Core Modules · Lifetime Access",
    format: "Self-Paced Online",
    image: imgExecutive,
    link: "/professionals",
    isStatic: false,
    highlights: [
      "Save 10+ hours every week",
      "100% non-tech, zero coding",
      "Executive AI certification",
    ],
  },
  {
    id: "consulting",
    title: "1-on-1 AI Strategy & Consultation",
    category: "mentorship",
    tag: "Private Mentorship",
    intro: "A private 60-minute strategy call with Antony Praveen and a customized roadmap for your business operations, revenue goals or career.",
    fees: "₹2,500",
    feeNote: "+ 18% GST per 1-hour session",
    duration: "1 Hour",
    format: "Google Meet / Zoom",
    image: "/images/antony_speaking.jpg",
    link: "/consulting",
    isStatic: false,
    highlights: [
      "Business automation or career acceleration track",
      "Live screen-share debugging & architecture review",
      "Custom post-session action blueprint",
    ],
  },
];
