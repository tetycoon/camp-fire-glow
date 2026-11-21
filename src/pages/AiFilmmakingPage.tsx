import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Play,
  Pause,
  CheckCircle2,
  Clock,
  Calendar,
  FileText,
  Award,
  ShieldCheck,
  ArrowRight,
  Users,
  ChevronDown,
  Download,
  Mail,
  MessageSquare,
  Lock,
  Film,
  Aperture,
  X,
  Sparkles,
  Volume2,
  VolumeX,
  Maximize2,
  Search
} from 'lucide-react';
import { countryCodes, CountryCode } from '../lib/countryCodes';
import logo from '../assets/tech_tycoon_logo.png';
import antonyImage from '../assets/trainer-photo.png';
import aiLogoSample from '../assets/ai_logo_sample.jpg';
import aiAvatarSample from '../assets/ai_avatar_sample.jpg';
import aiVideoSample from '../assets/ai_video_sample.jpg';
import aiProductCommercial from '../assets/ai_product_commercial.jpg';
import aiPixarCharacter from '../assets/ai_pixar_character.jpg';
import aiBrandIdent from '../assets/ai_brand_ident.jpg';
import heroAiFilmmakingStudio from '../assets/hero_ai_filmmaking_studio.jpg';
import event1 from '../assets/event-1.jpg';
import event2 from '../assets/event-2.jpg';
import event3 from '../assets/event-3.jpg';
import event4 from '../assets/event-4.jpg';
import event5 from '../assets/event-5.jpg';
import event6 from '../assets/event-6.jpg';

// ============================================================================
// CONFIGURATION: GOOGLE APPS SCRIPT & DUAL RAZORPAY (INDIAN + FOREIGN)
// ============================================================================
export const AI_FILMMAKING_APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbzycz3SBGah4HEEMlCKGOBcU5wBg8zoY3QJFVO_1YwnPAFREa5zgogQqKo8JXMlTM4LBw/exec';

const RAZORPAY_KEY_ID_IN = 'rzp_live_gfoS1OjC8tvWjP';

const WHATSAPP_COMMUNITY_LINK = 'https://chat.whatsapp.com/GuJIGDcfIIfDZHlG0MduvM';
const WHATSAPP_BOT_NUMBER = '917010340494';
const SUPPORT_PHONE_DISPLAY = '+91 63792 09689';

const AUTHORIZED_TEST_EMAILS = [
  'ambroseselva001@gmail.com',
  'techtycoondigitalsolutions@gmail.com',
  'techtycoondigitors@gmail.com'
];

// ============================================================================
// HELPER: SESSION DISPLAY INFO (FLEXIBLE / UPCOMING BATCH)
// ============================================================================
function getSessionDisplayInfo() {
  return {
    targetDate: new Date(),
    formattedDate: 'Announced in WhatsApp Community',
    shortDate: 'Upcoming Live Batch',
    timeRange: 'Updating Shortly',
    batchName: 'Upcoming Live Batch'
  };
}

// ============================================================================
// HELPER: GST BREAKDOWN (18% GST INCLUSIVE)
// Base ₹99 = 83.90 + 7.55 CGST + 7.55 SGST
// With ₹400 PDF & Material Add-on (Total ₹499) = 422.88 + 38.06 CGST + 38.06 SGST
// ============================================================================
function getAccountingBreakdown(totalAmount: number) {
  if (totalAmount === 1) {
    return {
      isTest: true,
      base: 1.0,
      cgst: 0.0,
      sgst: 0.0,
      gstTotal: 0.0,
      total: 1.0
    };
  }
  if (totalAmount === 499) {
    return {
      isTest: false,
      base: 422.88,
      cgst: 38.06,
      sgst: 38.06,
      gstTotal: 76.12,
      total: 499.0
    };
  }
  return {
    isTest: false,
    base: 83.9,
    cgst: 7.55,
    sgst: 7.55,
    gstTotal: 15.1,
    total: 99.0
  };
}

// ============================================================================
// REAL GOOGLE VEO AI VIDEO PLAYER COMPONENT (NATIVE HTML5 MP4 VIDEO + AUDIO)
// Plays real 16:9 HD AI-generated MP4 videos with camera motion & spatial audio
// ============================================================================
interface RealAiVideoPlayerProps {
  videoUrl: string;
  imageSrc: string;
  title: string;
  mode: 'logo' | 'avatar' | 'video' | 'commercial' | 'character' | 'ident';
  badge?: string;
  fpsLabel?: string;
  promptText?: string;
  autoPlay?: boolean;
  defaultMuted?: boolean;
  showControls?: boolean;
  onExpandClick?: () => void;
}

const RealAiVideoPlayer: React.FC<RealAiVideoPlayerProps> = ({
  videoUrl,
  imageSrc,
  title,
  badge = '4K AI VIDEO',
  fpsLabel = '60 FPS • VEO AI',
  promptText,
  autoPlay = true,
  defaultMuted = true,
  showControls = true,
  onExpandClick
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(defaultMuted);
  const [progress, setProgress] = useState(0);
  const [timecode, setTimecode] = useState('00:00:00');

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.muted = isMuted;
    if (autoPlay) {
      vid.play().then(() => setIsPlaying(true)).catch(() => {
        vid.muted = true;
        setIsMuted(true);
        vid.play().then(() => setIsPlaying(true)).catch(() => {});
      });
    }
  }, [videoUrl, autoPlay]);

  const togglePlay = () => {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) {
      vid.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      vid.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const vid = videoRef.current;
    if (!vid) return;
    const nextMuted = !isMuted;
    vid.muted = nextMuted;
    setIsMuted(nextMuted);
    if (!nextMuted && vid.paused) {
      vid.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleTimeUpdate = () => {
    const vid = videoRef.current;
    if (!vid || !vid.duration) return;
    const pct = Math.min(100, Math.round((vid.currentTime / vid.duration) * 100));
    setProgress(pct);
    const sec = Math.floor(vid.currentTime);
    const ms = Math.floor((vid.currentTime % 1) * 60);
    setTimecode(`00:${String(sec).padStart(2, '0')}:${String(ms).padStart(2, '0')}`);
  };

  return (
    <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-white/15 group select-none shadow-2xl">
      <video
        ref={videoRef}
        src={videoUrl}
        poster={imageSrc}
        autoPlay={autoPlay}
        muted={isMuted}
        loop
        playsInline
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onClick={togglePlay}
        title={title}
        className="w-full h-full object-cover cursor-pointer"
      />

      {/* Top Cinema Viewfinder Bar */}
      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 pointer-events-none">
        <span className="px-2.5 py-1 rounded-full bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md">
          <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
          {badge}
        </span>
        <span className="px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-cyan-300 font-mono text-[10px] font-bold">
          AI MP4 • {timecode} • {fpsLabel}
        </span>
      </div>

      {/* Bottom Interactive Video Scrubber & Controls */}
      {showControls && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/95 via-slate-950/75 to-transparent pt-6 pb-2.5 px-3">
          {promptText && (
            <p className="text-[10px] sm:text-[11px] font-mono text-cyan-200/90 line-clamp-1 mb-1.5 text-left">
              <strong className="text-amber-300">PROMPT:</strong> {promptText}
            </p>
          )}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              className="w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shrink-0 cursor-pointer transition-colors"
              aria-label={isPlaying ? 'Pause AI Video' : 'Play AI Video'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
            </button>

            {/* Progress Bar */}
            <div className="flex-1 h-1.5 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleMute();
              }}
              className="px-2 h-7 rounded-lg bg-white/15 hover:bg-white/25 text-white flex items-center justify-center gap-1 shrink-0 cursor-pointer transition-colors text-[10px] font-bold"
              title={isMuted ? 'Unmute AI Audio' : 'Mute AI Audio'}
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-slate-300" />
                  <span className="hidden sm:inline text-slate-300">Sound</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-cyan-300" />
                  <span className="hidden sm:inline text-cyan-300">On</span>
                </>
              )}
            </button>

            {onExpandClick && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onExpandClick();
                }}
                className="w-7 h-7 rounded-lg bg-white/15 hover:bg-white/25 text-white flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                title="Expand Fullscreen AI Video"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 3D INTERACTIVE TILT CARD COMPONENT (DESKTOP 3D TILT + MOBILE SMOOTH CARD)
// ============================================================================
interface Card3DProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

const Interactive3DTiltCard: React.FC<Card3DProps> = ({
  children,
  className = '',
  glowColor = 'rgba(37, 99, 235, 0.35)'
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, isHovered: false });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) return;
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      rotateX: -yPct * 12,
      rotateY: xPct * 12,
      isHovered: true
    });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0, isHovered: false });
  };

  return (
    <div style={{ perspective: '1200px' }} className="w-full h-full">
      <div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale(${tilt.isHovered ? 1.015 : 1})`,
          transformStyle: 'preserve-3d',
          transition: tilt.isHovered
            ? 'transform 0.08s ease-out, box-shadow 0.2s ease'
            : 'transform 0.45s ease-out, box-shadow 0.45s ease',
          boxShadow: tilt.isHovered
            ? `0 25px 55px -15px ${glowColor}, 0 0 30px -5px ${glowColor}`
            : '0 15px 35px -15px rgba(0,0,0,0.65)'
        }}
        className={`relative rounded-2xl sm:rounded-3xl transition-shadow duration-300 ${className}`}
      >
        <div className="h-full">{children}</div>
      </div>
    </div>
  );
};

// ============================================================================
// 6 REAL GOOGLE VEO AI VIDEO SHOWCASE ITEMS (NO DELEGATE FEEDBACK VIDEOS)
// ============================================================================
const aiVideoShowcaseItems: Array<{
  id: string;
  title: string;
  category: string;
  mode: 'logo' | 'avatar' | 'video' | 'commercial' | 'character' | 'ident';
  videoUrl: string;
  image: string;
  fps: string;
  prompt: string;
}> = [
  {
    id: 'logo-reveal',
    title: '3D AI Metallic Logo Animation & Brand Ident',
    category: 'Module 01 • 3D AI Logo & Brand Animation',
    mode: 'logo',
    videoUrl: '/videos/ai_veo_3d_brand.mp4',
    image: aiLogoSample,
    fps: '4K • 3D LOGO',
    prompt: '"3D metallic brand logo reveal with volumetric cyan lighting, floating sparks, water ripple reflections, 60fps"'
  },
  {
    id: 'avatar-spokesperson',
    title: 'Photorealistic AI Studio Avatar & Lip-Sync Presenter',
    category: 'Module 02 • AI Avatar & Lip-Sync',
    mode: 'avatar',
    videoUrl: '/videos/ai_veo_neural_cinema.mp4',
    image: aiAvatarSample,
    fps: '1080P • AI AVATAR',
    prompt: '"Hyper-realistic AI virtual spokesperson in studio speaking to microphone with natural hand gestures and frame-accurate lip-sync"'
  },
  {
    id: 'fpv-drone-cinema',
    title: 'Cinematic Movie Scene & Anamorphic Film Direction',
    category: 'Module 03 • AI Video Generation & Filmmaking',
    mode: 'video',
    videoUrl: '/videos/ai_veo_cyber_vfx.mp4',
    image: aiVideoSample,
    fps: 'CINEMATIC • 24FPS',
    prompt: '"Hollywood cinematic sunset film scene with anamorphic golden-hour lighting, cinematic depth-of-field, and motion camera track"'
  },
  {
    id: 'product-ad',
    title: 'Luxury Smartwatch & Tech Studio Commercial',
    category: 'Bonus Workflow • AI Product Ad Film',
    mode: 'commercial',
    videoUrl: '/videos/ai_veo_product_ad.mp4',
    image: aiProductCommercial,
    fps: 'Studio Ad • Veo',
    prompt: '"Floating smartwatch, studio headphones and flagship smartphone rotating under dual softbox studio lights, macro lens"'
  },
  {
    id: 'pixar-short',
    title: 'Multi-Shot 3D Tech Commercial Camera Rig',
    category: 'Module 03 • Multi-Scene Camera Motion',
    mode: 'character',
    videoUrl: '/videos/ai_veo_hitech_commercial.mp4',
    image: aiPixarCharacter,
    fps: '3D Camera Rig',
    prompt: '"Dynamic 3D camera dolly and orbit through floating high-tech smart devices in clean white-and-blue commercial studio"'
  },
  {
    id: 'optical-ident',
    title: '3D Engineering Assembly & Electric VFX Film',
    category: 'Module 01 • 3D Motion & Sound Design',
    mode: 'ident',
    videoUrl: '/videos/ai_veo_3d_assembly.mp4',
    image: aiBrandIdent,
    fps: 'Spatial SFX',
    prompt: '"3D time-lapse engineering assembly with glowing blue electric energy surging through power lines, synchronized SFX"'
  }
];

const workshopPhotos = [
  { src: event1, title: 'Live Corporate AI Training Cohort', tag: 'Hands-On Session' },
  { src: event2, title: 'Interactive AI Media & Workflow Lab', tag: 'Live Implementation' },
  { src: event3, title: 'Madras Management Association Workshop', tag: 'Executive Cohort' },
  { src: event4, title: 'Enterprise AI Upskilling Program', tag: 'Team Training' },
  { src: event5, title: 'Creator & Faculty Development Session', tag: 'Practical Build' },
  { src: event6, title: 'Next-Gen AI Creators Bootcamp', tag: 'Live Studio' }
];

// ============================================================================
// META CAMPAIGN ATTRIBUTION & UTM CAPTURE HELPER
// ============================================================================
function getTrackingAttribution(): Record<string, string> {
  try {
    const params = new URLSearchParams(window.location.search);
    const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid'];
    const attribution: Record<string, string> = {};
    for (const k of keys) {
      const val = params.get(k) || sessionStorage.getItem(k) || '';
      if (val) {
        attribution[k] = val;
        try {
          sessionStorage.setItem(k, val);
        } catch (_) {}
      }
    }
    return attribution;
  } catch (_) {
    return {};
  }
}

// ============================================================================
// MAIN LANDING PAGE COMPONENT
// ============================================================================
const AiFilmmakingPage: React.FC = () => {
  const sessionInfo = useMemo(() => getSessionDisplayInfo(), []);
  const leadTrackedRef = useRef(false);
  const purchaseTrackedRef = useRef(false);

  // Hero & Studio Interactive Showcase State
  const [heroActiveSlide, setHeroActiveSlide] = useState<0 | 1 | 2>(0);
  const [activeStudioTab, setActiveStudioTab] = useState<'logo' | 'avatar' | 'video'>('logo');
  const [expandedAiVideo, setExpandedAiVideo] = useState<typeof aiVideoShowcaseItems[0] | null>(null);

  // Checkout Modal & Order Bump State
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [includePdfMaterial, setIncludePdfMaterial] = useState(false); // Optional +₹400 checkbox
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    countryCode: '+91',
    phone: '',
    profession: 'Content Creator / Filmmaker'
  });
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [formError, setFormError] = useState('');

  // Country Code Search & Auto-Suggestion State
  const defaultCountry = useMemo(
    () => countryCodes.find((c) => c.code === '+91') || countryCodes[0],
    []
  );
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(defaultCountry);
  const [countrySearch, setCountrySearch] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const countrySearchInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  const filteredCountries = useMemo(() => {
    if (!countrySearch.trim()) return countryCodes;
    const q = countrySearch.toLowerCase().trim();
    return countryCodes.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.includes(q) ||
        c.iso.toLowerCase().includes(q)
    );
  }, [countrySearch]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(e.target as Node)
      ) {
        setShowCountryDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Verified Post-Payment Invoice & WhatsApp Confirmation State
  const [verifiedPayment, setVerifiedPayment] = useState<{
    orderId: string;
    paymentId: string;
    invoiceNumber: string;
    amountPaid: number;
    hasPdfMaterial: boolean;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    sessionDate: string;
    sessionTime: string;
  } | null>(null);

  // FAQ Accordion State
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  // Set page title, capture UTM attribution, Meta Pixel ViewContent & ensure developer cinematic layer
  useEffect(() => {
    document.title =
      '3-Hours AI Filmmaking & Video Generation Live Webinar | Tech Tycoon';
    getTrackingAttribution();

    if (typeof (window as any).fbq === 'function') {
      (window as any).fbq('track', 'ViewContent', {
        content_name: '3-Hours AI Filmmaking & Video Generation Live Webinar'
      });
    }

    document.documentElement.classList.add('cfx', 'cfx-light');

    if (!document.querySelector('link[href*="/ai_filmmaking/fx/cinematic.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/ai_filmmaking/fx/cinematic.css?v=3';
      document.head.appendChild(link);
    }
    if (!document.querySelector('script[src*="/ai_filmmaking/fx/cinematic.js"]')) {
      const script = document.createElement('script');
      script.defer = true;
      script.src = '/ai_filmmaking/fx/cinematic.js?v=3';
      document.head.appendChild(script);
    }

    return () => {
      document.documentElement.classList.remove('cfx', 'cfx-light');
    };
  }, []);

  // Dynamic Pricing Calculation (₹99 base + optional ₹400 PDF & Material = ₹499, or ₹1 for authorized test email)
  const isTestUser = AUTHORIZED_TEST_EMAILS.includes(formData.email.trim().toLowerCase());
  const totalAmount = isTestUser ? 1 : includePdfMaterial ? 499 : 99;
  const accounting = useMemo(() => getAccountingBreakdown(totalAmount), [totalAmount]);

  const openCheckout = (preselectPdfAddon?: boolean) => {
    if (typeof preselectPdfAddon === 'boolean') {
      setIncludePdfMaterial(preselectPdfAddon);
    }
    setFormError('');
    setIsCheckoutModalOpen(true);
  };

  // Load Razorpay Checkout SDK dynamically
  const ensureRazorpayLoaded = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Handle Register Now Form Submission (Acts as Lead Capture Form for Meta Campaign + Checkout Initiation)
  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const cleanName = formData.name.trim();
    const cleanEmail = formData.email.trim().toLowerCase();
    const cleanDigits = formData.phone.replace(/\D/g, '');

    if (!cleanName || cleanName.length < 2) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setFormError('Please enter a valid email address for your webinar link & GST invoice.');
      return;
    }
    if (!cleanDigits || cleanDigits.length < 7) {
      setFormError('Please enter a valid WhatsApp phone number.');
      return;
    }

    setIsProcessingPayment(true);

    try {
      const sdkReady = await ensureRazorpayLoaded();
      if (!sdkReady) {
        throw new Error('Unable to load Razorpay payment gateway. Please check your internet connection.');
      }

      const isInternational = formData.countryCode !== '+91';
      let activeKeyId = RAZORPAY_KEY_ID_IN;
      const fullPhone = `${formData.countryCode}${cleanDigits}`;
      const modeLabel = includePdfMaterial
        ? 'Live Masterclass + Session PDF & Material'
        : 'Live Masterclass';
      const attribution = getTrackingAttribution();
      const clientLeadId =
        'lead_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);

      let createdOrderId = '';
      let resolvedLeadId = '';
      const isScriptConfigured =
        AI_FILMMAKING_APPS_SCRIPT_URL &&
        !AI_FILMMAKING_APPS_SCRIPT_URL.includes('PASTE_YOUR_');

      // 1. Create Order & Save Meta Campaign Lead in Google Sheet (Sheet1 + Landing_Leads) via Apps Script
      if (isScriptConfigured) {
        try {
          const orderRes = await fetch(AI_FILMMAKING_APPS_SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
              action: 'create_order',
              leadId: clientLeadId,
              utm_source: attribution.utm_source || '',
              utm_medium: attribution.utm_medium || '',
              utm_campaign: attribution.utm_campaign || '',
              utm_content: attribution.utm_content || '',
              utm_term: attribution.utm_term || '',
              gclid: attribution.gclid || '',
              fbclid: attribution.fbclid || '',
              utm: attribution,
              userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
              name: cleanName,
              email: cleanEmail,
              phone: fullPhone,
              countryCode: formData.countryCode,
              userType: formData.profession,
              isInternational,
              amount: totalAmount,
              baseAmount: accounting.base,
              gstAmount: accounting.gstTotal,
              hasPdfMaterial: includePdfMaterial ? 'YES' : 'NO',
              course: includePdfMaterial
                ? '3-Hours AI Filmmaking & Video Generation Live Webinar + Session PDF & Material'
                : '3-Hours AI Filmmaking & Video Generation Live Webinar',
              batch: 'Upcoming Live Batch',
              preferredSlot: 'Upcoming Live Batch',
              sessionDate: 'To be announced shortly',
              sessionTime: 'To be announced shortly',
              language: modeLabel,
              modeOfSession: modeLabel,
              pageUrl: window.location.href
            })
          });
          const orderJson = await orderRes.json();
          if (orderJson && orderJson.keyId) {
            activeKeyId = orderJson.keyId;
          }
          if (orderJson && orderJson.orderId) {
            createdOrderId = orderJson.orderId;
          }
          if (orderJson && orderJson.leadId) {
            resolvedLeadId = orderJson.leadId;
          } else {
            // Ensure Landing_Leads tab also receives the lead even if live Apps Script is on older deployment
            fetch(AI_FILMMAKING_APPS_SCRIPT_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'text/plain;charset=utf-8' },
              body: JSON.stringify({
                action: 'saveLandingLead',
                leadId: clientLeadId,
                name: cleanName,
                phone: fullPhone,
                email: cleanEmail,
                pageUrl: window.location.href,
                utm: attribution,
                userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
              })
            }).catch(() => {});
          }
        } catch (orderErr) {
          console.warn('Apps Script order pre-creation fallback to direct checkout:', orderErr);
        }
      }

      // 1b. Fire Meta Pixel Lead Event & GA4 generate_lead (Deduplicated via eventID)
      const leadEventId = String(resolvedLeadId || createdOrderId || clientLeadId).trim();
      const leadStorageKey = `lead_tracked_${leadEventId}`;
      const alreadyTrackedLead =
        leadTrackedRef.current || (leadEventId && sessionStorage.getItem(leadStorageKey));

      if (!alreadyTrackedLead && leadEventId) {
        leadTrackedRef.current = true;
        try {
          sessionStorage.setItem(leadStorageKey, 'true');
        } catch (_) {}

        if (typeof (window as any).fbq === 'function') {
          try {
            (window as any).fbq(
              'track',
              'Lead',
              {
                content_name: includePdfMaterial
                  ? '3-Hours AI Filmmaking & Video Generation Live Webinar + Resource ToolKit'
                  : '3-Hours AI Filmmaking & Video Generation Live Webinar',
                content_category: 'AI Filmmaking Registration Form',
                value: totalAmount,
                currency: 'INR'
              },
              { eventID: leadEventId }
            );
          } catch (_) {}
        }

        if (typeof (window as any).gtag === 'function') {
          try {
            (window as any).gtag('event', 'generate_lead', {
              event_category: 'Registration Form',
              event_label: includePdfMaterial
                ? 'AI Filmmaking Live Webinar + Resource ToolKit'
                : 'AI Filmmaking Live Webinar',
              value: totalAmount,
              currency: 'INR',
              transaction_id: leadEventId
            });
          } catch (_) {}
        }
      }

      // 2. Open Razorpay Checkout Modal
      const rzpOptions: any = {
        key: activeKeyId,
        amount: totalAmount * 100,
        currency: 'INR',
        name: 'TECH TYCOON DIGITAL SOLUTION LLP',
        description: includePdfMaterial
          ? '3-Hr AI Filmmaking Live Webinar + Session PDF & Material'
          : '3-Hr AI Filmmaking & Video Generation Live Webinar',
        image: '/logo.png',
        ...(createdOrderId ? { order_id: createdOrderId } : {}),
        prefill: {
          name: cleanName,
          email: cleanEmail,
          contact: fullPhone
        },
        notes: {
          product_key: 'ai_filmmaking',
          course: includePdfMaterial
            ? 'AI Filmmaking Live Webinar + Session PDF & Material'
            : 'AI Filmmaking & Video Generation Live Webinar',
          has_pdf_material: includePdfMaterial ? 'YES' : 'NO',
          session_date: sessionInfo.formattedDate,
          session_time: sessionInfo.timeRange,
          base_amount: String(accounting.base),
          gst_amount: String(accounting.gstTotal)
        },
        theme: {
          color: '#2563eb'
        },
        handler: async function (response: any) {
          const payId = response.razorpay_payment_id || 'pay_verified';
          const ordId =
            response.razorpay_order_id ||
            createdOrderId ||
            clientLeadId ||
            `order_${payId.replace(/^pay_/, '')}`;
          const sig = response.razorpay_signature || '';

          let resolvedInvoiceNo = `TT/26-27/AIF-${payId.replace(/\D/g, '').slice(-4) || '1099'}`;

          // 3. Verify Payment & Trigger GST Invoice PDF Email + Meta WhatsApp in Apps Script
          if (isScriptConfigured) {
            try {
              const verifyRes = await fetch(AI_FILMMAKING_APPS_SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({
                  paymentSuccess: true,
                  action: 'payment_success',
                  razorpay_order_id: ordId,
                  razorpay_payment_id: payId,
                  razorpay_signature: sig,
                  orderId: ordId,
                  paymentId: payId,
                  amount: totalAmount,
                  hasPdfMaterial: includePdfMaterial ? 'YES' : 'NO',
                  name: cleanName,
                  email: cleanEmail,
                  phone: fullPhone,
                  countryCode: formData.countryCode,
                  language: modeLabel,
                  modeOfSession: modeLabel,
                  sessionDate: 'To be announced shortly',
                  sessionTime: 'To be announced shortly'
                })
              });
              const verifyJson = await verifyRes.json();
              if (verifyJson && verifyJson.invoiceNumber) {
                resolvedInvoiceNo = verifyJson.invoiceNumber;
              }
            } catch (verifyErr) {
              console.warn('Payment verification webhook fallback will reconcile:', verifyErr);
            }
          }

          // Meta Pixel Purchase event (deduplicated via paymentId eventID)
          const purchaseStorageKey = `purchase_tracked_${payId}`;
          const alreadyTrackedPurchase =
            purchaseTrackedRef.current || (payId && sessionStorage.getItem(purchaseStorageKey));

          if (!alreadyTrackedPurchase && payId) {
            purchaseTrackedRef.current = true;
            try {
              sessionStorage.setItem(purchaseStorageKey, 'true');
            } catch (_) {}

            if (typeof (window as any).fbq === 'function') {
              try {
                (window as any).fbq(
                  'track',
                  'Purchase',
                  {
                    value: totalAmount,
                    currency: 'INR',
                    content_name: includePdfMaterial
                      ? '3-Hours AI Filmmaking & Video Generation Live Webinar + Resource ToolKit'
                      : '3-Hours AI Filmmaking & Video Generation Live Webinar',
                    content_type: 'product'
                  },
                  { eventID: payId }
                );
              } catch (_) {}
            }
          }

          setVerifiedPayment({
            orderId: ordId,
            paymentId: payId,
            invoiceNumber: resolvedInvoiceNo,
            amountPaid: totalAmount,
            hasPdfMaterial: includePdfMaterial,
            customerName: cleanName,
            customerEmail: cleanEmail,
            customerPhone: fullPhone,
            sessionDate: 'Updating shortly in WhatsApp Community',
            sessionTime: 'Updating shortly in WhatsApp Community'
          });
          setIsProcessingPayment(false);
          setIsCheckoutModalOpen(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        modal: {
          ondismiss: function () {
            setIsProcessingPayment(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(rzpOptions);
      rzp.open();
    } catch (err: any) {
      setFormError(err?.message || 'Could not initiate payment. Please try again.');
      setIsProcessingPayment(false);
    }
  };

  // ============================================================================
  // HERO SHOWCASE SLIDES & 3 CORE PILLARS DATA
  // ============================================================================
  const heroSlides = [
    aiVideoShowcaseItems[0],
    aiVideoShowcaseItems[1],
    aiVideoShowcaseItems[2]
  ];

  const threeCorePillars = [
    {
      id: 'logo',
      mode: 'logo' as const,
      badge: 'MODULE 01 • LOGO ANIMATION',
      title: 'AI Logo Animation & 3D Brand Idents',
      subtitle: 'Turn Any Flat 2D Logo into a Hollywood-Style 3D Animated Intro',
      image: aiLogoSample,
      showcaseItem: aiVideoShowcaseItems[0],
      glow: 'rgba(6, 182, 212, 0.35)',
      highlights: [
        'Convert static PNG/SVG brand logos into 3D metallic, neon, fire, or liquid glass reveals',
        'Control 3D camera orbits, lighting reflections, and depth-of-field without After Effects or Blender',
        'Add synchronized cinematic whoosh, riser, and impact sound effects automatically via AI',
        'Export ready-to-use intros for YouTube channels, client commercials, and Instagram Reels'
      ],
      promptSample:
        '"Transform this minimalist tech logo into brushed titanium 3D extrusions emerging from dark obsidian water with volumetric cyan rim lighting, slow-motion camera dolly-in, 4K 60fps"',
      metrics: [
        { label: 'Render Speed', value: '45 Sec' },
        { label: '3D Software', value: 'Zero' },
        { label: 'Output Quality', value: '4K 60FPS' }
      ]
    },
    {
      id: 'avatar',
      mode: 'avatar' as const,
      badge: 'MODULE 02 • AI AVATARS & VOICES',
      title: 'AI Avatar Creation & Realistic Lip-Sync',
      subtitle: 'Build Hyper-Realistic Digital Humans & Virtual Presenters',
      image: aiAvatarSample,
      showcaseItem: aiVideoShowcaseItems[1],
      glow: 'rgba(37, 99, 235, 0.35)',
      highlights: [
        'Create custom photorealistic or 3D studio avatars from a single reference photo or text prompt',
        'Clone your own voice or generate studio-grade Tamil, English, and Hindi AI voiceovers with emotion',
        'Achieve frame-accurate lip-sync, natural eye contact, micro-expressions, and hand gestures',
        'Scale faceless YouTube channels, product explainers, and personalized ad creatives 10x faster'
      ],
      promptSample:
        '"Create a charismatic Indian creative director in a modern blue-lit film studio explaining AI filmmaking, natural hand gestures, studio lapel mic, shallow depth of field, 85mm lens"',
      metrics: [
        { label: 'Lip-Sync', value: '99.4%' },
        { label: 'Languages', value: '40+ Regional' },
        { label: 'Shoot Cost', value: '₹0 Saved' }
      ]
    },
    {
      id: 'video',
      mode: 'video' as const,
      badge: 'MODULE 03 • CINEMATIC SCENES',
      title: 'AI Video Generation & Filmmaking Foundation',
      subtitle: 'Direct Complete Cinematic Scenes, Commercials & Short Films with AI',
      image: aiVideoSample,
      showcaseItem: aiVideoShowcaseItems[2],
      glow: 'rgba(245, 158, 11, 0.35)',
      highlights: [
        'Master Text-to-Video & Image-to-Video pipelines with consistent characters across multiple shots',
        'Direct virtual 3D cameras: FPV drone shots, crane sweeps, macro close-ups, and rack focus',
        'Storyboarding to final cut: combining AI B-roll, AI dialogue, ambient soundscapes, and color grading',
        'Live end-to-end build: watch a complete 60-second cinematic brand commercial created live on screen'
      ],
      promptSample:
        '"FPV drone shot flying through a futuristic Chennai skyline at golden hour into a holographic film production studio, anamorphic lens flare, IMAX 70mm color science"',
      metrics: [
        { label: 'Consistency', value: 'Multi-Shot' },
        { label: 'Camera Rig', value: '360° 3D' },
        { label: 'Level', value: 'Foundation' }
      ]
    }
  ];

  const faqs = [
    {
      q: 'Is this a Basic & Foundation session? Do I need prior video editing or 3D experience?',
      a: 'Yes! This 3-hour live webinar is specifically designed as a Basic & Foundation session. You do NOT need any prior experience in Premiere Pro, After Effects, Blender, or coding. We start from scratch and guide you step-by-step.'
    },
    {
      q: 'When is the live session conducted?',
      a: 'The live webinar takes place in upcoming interactive batches. Once you complete registration, please join our official WhatsApp Community where your exact session date, timing, and direct classroom link will be updated shortly.'
    },
    {
      q: 'What is included in the optional ₹400 Session PDF & Material add-on?',
      a: 'When you check the optional ₹400 box (Total ₹499), you receive the complete Official Session PDF & Material bundle: 150+ copy-paste 3D Logo Animation prompts, AI Avatar creation & lip-sync workflow blueprints, cinematic camera motion cheat sheets, and the complete curated AI Filmmaking tool directory.'
    },
    {
      q: 'Will I receive a GST Tax Invoice for my registration?',
      a: 'Yes! Tech Tycoon Digital Solution LLP issues an official GST-compliant Tax Invoice (PDF) immediately upon payment verification, delivered directly to your registered email address.'
    },
    {
      q: 'How will I receive the live webinar joining link?',
      a: 'Immediately after registration, you will receive your confirmation and an invitation to join our official WhatsApp Community. We will announce and update your session date, timing, and classroom link directly in the group and via email.'
    }
  ];

  // ============================================================================
  // IF PAYMENT IS VERIFIED: COMPACT, BEAUTIFUL BRANDED CONFIRMATION (INVOICE SENT VIA EMAIL)
  // ============================================================================
  if (verifiedPayment) {
    return (
      <div
        data-cfx-keep="true"
        className="min-h-screen bg-slate-950/80 backdrop-blur-md text-slate-900 py-6 sm:py-10 px-3 sm:px-4 flex items-center justify-center relative overflow-hidden"
      >
        {/* Soft Ambient Background Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md w-full mx-auto relative z-10" data-cfx-keep="true">
          <div
            data-cfx-keep="true"
            className="rounded-3xl bg-white border border-slate-200/90 shadow-2xl overflow-hidden p-5 sm:p-7 text-center text-slate-900 relative"
          >
            {/* Top Royal Brand Accent Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500" />

            {/* Success Check Icon */}
            <div className="w-12 h-12 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center mx-auto mb-2.5 text-emerald-600 shadow-sm">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>

            <span className="inline-block px-3 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold uppercase tracking-wider mb-1.5">
              Registration Successful • Seat Reserved
            </span>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Thank You, {verifiedPayment.customerName}! 🎬
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 leading-snug">
              Your registration for the <strong>3-Hours AI Filmmaking Live Webinar</strong> is confirmed.
            </p>

            {/* Primary Action: Join WhatsApp Community */}
            <div className="rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50/60 to-emerald-100/40 border-2 border-emerald-300 p-4 sm:p-5 my-3.5 text-center shadow-sm">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] sm:text-[11px] font-black uppercase tracking-wider mb-2 shadow-sm">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Action Required • Join WhatsApp Community</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 mb-1.5">
                Join the Official WhatsApp Community
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 mb-3.5 leading-relaxed font-medium">
                Please join our exclusive community below. <strong>We will update your session date and timing shortly</strong> inside the WhatsApp group, along with your live classroom link and {verifiedPayment.hasPdfMaterial ? 'your complete Resource ToolKit' : 'session materials'}.
              </p>
              <a
                href={WHATSAPP_COMMUNITY_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-extrabold text-sm sm:text-base shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
              >
                <MessageSquare className="w-5 h-5 shrink-0" />
                <span>Join Official WhatsApp Community →</span>
              </a>
            </div>

            {/* Session Date & Timing Status Notice */}
            <div className="rounded-xl bg-amber-50/90 border border-amber-300 p-3 my-3 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-900 mb-0.5">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Session Date &amp; Timing</span>
              </div>
              <p className="text-xs text-amber-800 font-semibold leading-normal">
                We will update your session date and timing shortly inside the WhatsApp community and via Email.
              </p>
            </div>

            {/* GST Tax Invoice Email Delivery Notice */}
            <div className="rounded-xl bg-blue-50/70 border border-blue-200/70 p-3 my-3 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-blue-900 mb-0.5">
                <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                <span>GST Tax Invoice Sent to Your Email</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-tight">
                Invoice: <span className="font-mono font-bold text-slate-900">{verifiedPayment.invoiceNumber}</span> • Delivered to <span className="font-semibold text-slate-900">{verifiedPayment.customerEmail}</span>
              </p>
            </div>

            {/* Back to Landing Page Link */}
            <div className="pt-1">
              <button
                onClick={() => setVerifiedPayment(null)}
                className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer transition-colors"
              >
                ← Back to Webinar Landing Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentHeroSlide = heroSlides[heroActiveSlide];

  // ============================================================================
  // MAIN LANDING PAGE RENDER
  // ============================================================================
  return (
    <div className="min-h-screen bg-[#040711] text-white selection:bg-blue-600 selection:text-white overflow-x-hidden font-sans pb-20">
      {/* CSS Keyframes for 3D Perspective Grid */}
      <style>{`
        @keyframes gridMove3D {
          0% { background-position: 0 0; }
          100% { background-position: 0 60px; }
        }
        .cyber-grid-3d {
          background-image: 
            linear-gradient(to right, rgba(37, 99, 235, 0.16) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(6, 182, 212, 0.16) 1px, transparent 1px);
          background-size: 56px 56px;
          transform: perspective(650px) rotateX(64deg);
          transform-origin: center top;
          animation: gridMove3D 3.5s linear infinite;
        }
      `}</style>

      {/* ====================================================================
          TOP STICKY ANNOUNCEMENT & NAVIGATION BAR (MOBILE-FIRST)
      ==================================================================== */}
      <header className="sticky top-0 z-40 bg-slate-950/95 border-b border-blue-500/25 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2">
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={logo}
              alt="Tech Tycoon"
              className="w-8 h-8 sm:w-9 sm:h-9 object-contain rounded-lg bg-white/10 p-1 shrink-0"
            />
            <div className="truncate">
              <span className="text-xs sm:text-sm font-black tracking-tight text-white block leading-none">
                TECH TYCOON
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-cyan-400 font-bold block mt-0.5 truncate">
                AI Filmmaking Live Studio
              </span>
            </div>
          </div>

          {/* Center Announcement Pill (Desktop) */}
          <div className="hidden lg:flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-950/80 border border-blue-500/30 text-xs">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold text-blue-200">Live Virtual Masterclass:</span>
            <span className="text-white font-semibold">Upcoming Interactive Batch (3 Hours)</span>
          </div>

          {/* Right CTA */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline-block px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 font-bold text-[11px]">
              Upcoming Live Batch
            </span>
            <button
              onClick={() => openCheckout()}
              className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-lg shadow-blue-600/30 transition-all cursor-pointer whitespace-nowrap"
            >
              Register @ ₹99 →
            </button>
          </div>
        </div>
      </header>

      {/* ====================================================================
          CINEMATIC HERO SECTION WITH VIRTUAL PRODUCTION STUDIO BACKGROUND
      ==================================================================== */}
      <section
        data-cfx-keep="true"
        className="relative min-h-[620px] sm:min-h-[720px] lg:min-h-[820px] flex items-center justify-center pt-12 pb-16 sm:pt-20 sm:pb-28 overflow-hidden bg-[#04060e] text-white"
      >
        {/* 100% FULLY VISIBLE AI Superhero & Multiverse Background Image */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src={heroAiFilmmakingStudio}
            alt="AI Video Generation & AI World Creation with Superhero"
            className="w-full h-full object-cover object-center"
          />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 text-center lg:text-left w-full">
          <div className="max-w-2xl bg-slate-950/45 sm:bg-slate-950/40 p-6 sm:p-8 rounded-3xl backdrop-blur-md border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-blue-500/25 border border-blue-400/40 text-blue-200 text-[11px] sm:text-xs font-bold mb-4 sm:mb-6 shadow-[0_0_30px_rgba(37,99,235,0.3)]">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>3-HOURS BASIC &amp; FOUNDATION LIVE WEBINAR</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl xl:text-[3.5rem] font-black tracking-tight leading-[1.12] mb-4 sm:mb-6 text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
              Master{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300">
                AI Filmmaking
              </span>{' '}
              &amp;{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-400">
                AI Video Generation
              </span>{' '}
              in 3 Hours
            </h1>

            {/* Subtitle Copy */}
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed mb-6 max-w-xl mx-auto lg:mx-0 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              Go from complete beginner to directing studio-quality{' '}
              <strong className="text-cyan-300">3D AI Logo Animations</strong>, hyper-realistic{' '}
              <strong className="text-blue-300">Talking AI Avatars</strong>, and breathtaking{' '}
              <strong className="text-amber-300">Cinematic AI Videos</strong> — live in an interactive 3-hour masterclass without expensive cameras or complex 3D software.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 justify-center lg:justify-start">
              <button
                onClick={() => openCheckout(false)}
                className="w-full sm:w-auto group relative inline-flex items-center justify-center gap-2.5 px-7 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-sm sm:text-base shadow-[0_0_35px_rgba(37,99,235,0.6)] transition-all cursor-pointer"
              >
                <span>Reserve Your Seat for ₹99</span>
                <span className="line-through text-xs text-white/70 font-normal">₹1,999</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => openCheckout(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 sm:py-4 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-200 font-bold text-xs sm:text-sm backdrop-blur-md transition-all cursor-pointer shadow-[0_0_20px_rgba(245,158,11,0.2)]"
              >
                <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                <span>+ ₹400 Resource ToolKit Option</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="mt-5 flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 text-xs text-slate-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> GST Tax Invoice Included
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium">
                <Award className="w-4 h-4 text-blue-400" /> Beginner &amp; Foundation Friendly
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium">
                <Clock className="w-4 h-4 text-cyan-400" /> 3 Hours Live Practical Training
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 2: THREE CORE PILLARS (WITH AUTO-PLAYING AI VIDEO HEADERS)
      ==================================================================== */}
      <section className="py-14 sm:py-24 relative bg-[#060a18] border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
            <span className="px-3.5 py-1.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-[11px] sm:text-xs font-bold uppercase tracking-widest">
              3-Hour Foundation Roadmap • Live Interactive Masterclass
            </span>
            <h2 className="text-2xl sm:text-5xl font-black mt-3 sm:mt-4 mb-3 sm:mb-4">
              What You Will Build Live in{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400">
                180 Action-Packed Minutes
              </span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-lg">
              Every module includes live screen-shared demonstrations, copy-paste prompt engineering formulas, and real AI video outputs.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {threeCorePillars.map((pillar) => (
              <Interactive3DTiltCard
                key={pillar.id}
                glowColor={pillar.glow}
                className="bg-slate-900/90 border border-white/15 overflow-hidden flex flex-col justify-between h-full"
              >
                <div>
                  {/* Live Auto-Playing Real Veo AI Video Header */}
                  <div className="p-3 pb-0">
                    <RealAiVideoPlayer
                      videoUrl={pillar.showcaseItem.videoUrl}
                      imageSrc={pillar.image}
                      title={pillar.title}
                      mode={pillar.mode}
                      badge={pillar.badge}
                      fpsLabel="VEO AI MP4"
                      autoPlay={true}
                      showControls={true}
                      onExpandClick={() => setExpandedAiVideo(pillar.showcaseItem)}
                    />
                  </div>

                  <div className="p-5 sm:p-7 pb-0">
                    <h3 className="text-xl sm:text-2xl font-black text-white mb-1.5">{pillar.title}</h3>
                    <p className="text-xs sm:text-sm text-cyan-300 font-semibold mb-4">{pillar.subtitle}</p>

                    <ul className="space-y-2.5 mb-5">
                      {pillar.highlights.map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-5 sm:p-7 pt-0">
                  {/* Live Prompt Box */}
                  <div className="rounded-xl bg-black/60 border border-white/10 p-3.5 mb-4">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 mb-1">
                      ⚡ Live Prompt Blueprint We Run:
                    </p>
                    <p className="text-[11px] sm:text-xs font-mono text-slate-300 italic leading-relaxed">
                      {pillar.promptSample}
                    </p>
                  </div>

                  {/* Mini 3D Metrics */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center">
                    {pillar.metrics.map((m, idx) => (
                      <div key={idx} className="p-2 rounded-xl bg-white/5">
                        <span className="block text-xs font-black text-white">{m.value}</span>
                        <span className="block text-[10px] text-slate-400">{m.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Interactive3DTiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 3: INTERACTIVE 3D STUDIO PREVIEWER (WITH LIVE AI VIDEO ENGINE)
      ==================================================================== */}
      <section className="py-14 sm:py-24 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
            <span className="px-3.5 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[11px] sm:text-xs font-bold uppercase tracking-widest">
              Interactive 3D Production Deck
            </span>
            <h2 className="text-2xl sm:text-4xl font-black mt-3 sm:mt-4">
              Experience the 3-Step AI Filmmaking Pipeline
            </h2>
          </div>

          {/* Studio Mode Selector Tabs */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-7 sm:mb-10">
            {[
              { id: 'logo', label: '1. 3D AI Logo Animation', icon: <Aperture className="w-4 h-4" /> },
              { id: 'avatar', label: '2. Talking AI Avatar Studio', icon: <Users className="w-4 h-4" /> },
              { id: 'video', label: '3. Cinematic AI Video Director', icon: <Film className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveStudioTab(tab.id as any)}
                className={`inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                  activeStudioTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-[0_0_25px_rgba(37,99,235,0.5)] scale-[1.02]'
                    : 'bg-slate-900 border border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* 3D Interactive Stage Viewport with Live AI Video Stream */}
          <Interactive3DTiltCard
            glowColor="rgba(37, 99, 235, 0.3)"
            className="bg-gradient-to-br from-slate-900 via-[#081026] to-slate-950 border border-blue-500/30 p-5 sm:p-10"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
              <div className="lg:col-span-6 space-y-4 sm:space-y-5 text-left">
                {activeStudioTab === 'logo' && (
                  <>
                    <span className="inline-block px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-[11px] font-bold">
                      STAGE 01 • 3D BRAND IDENT &amp; LOGO MOTION
                    </span>
                    <h3 className="text-xl sm:text-3xl font-black text-white leading-tight">
                      Turn Any Flat Client Logo into a ₹25,000+ 3D Cinema Intro in 60 Seconds
                    </h3>
                    <p className="text-slate-300 text-xs sm:text-base leading-relaxed">
                      Upload a transparent PNG logo and let AI extrude 3D bevels, apply liquid gold, brushed titanium, or neon glass shaders, and animate a dramatic 3D camera reveal with spatial audio.
                    </p>
                    <div className="grid grid-cols-2 gap-2.5 sm:gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                        <strong className="text-cyan-400 block mb-0.5">Material Shaders</strong>
                        Liquid Metal, Neon Glass, Fire, Brushed Titanium
                      </div>
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                        <strong className="text-cyan-400 block mb-0.5">Use Cases</strong>
                        YouTube Intros, Ad Openers, Client Brand Reels
                      </div>
                    </div>
                  </>
                )}

                {activeStudioTab === 'avatar' && (
                  <>
                    <span className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-bold">
                      STAGE 02 • DIGITAL HUMAN &amp; VOICE CLONING
                    </span>
                    <h3 className="text-xl sm:text-3xl font-black text-white leading-tight">
                      Create Your Own Digital Twin or Brand Spokesperson Without Facing the Camera
                    </h3>
                    <p className="text-slate-300 text-xs sm:text-base leading-relaxed">
                      Generate a custom AI presenter from a single photo or text description, pair it with expressive Tamil, English, or Hindi voice synthesis, and render studio-lit talking videos with natural micro-expressions.
                    </p>
                    <div className="grid grid-cols-2 gap-2.5 sm:gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                        <strong className="text-blue-400 block mb-0.5">Voice &amp; Lip-Sync</strong>
                        Regional Indian Accents + Custom Voice Clone
                      </div>
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                        <strong className="text-blue-400 block mb-0.5">Use Cases</strong>
                        Instagram Reels, Course Videos, Sales VSLs
                      </div>
                    </div>
                  </>
                )}

                {activeStudioTab === 'video' && (
                  <>
                    <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold">
                      STAGE 03 • MULTI-SHOT AI FILM DIRECTION
                    </span>
                    <h3 className="text-xl sm:text-3xl font-black text-white leading-tight">
                      Direct Multi-Scene Short Films, Product Commercials &amp; Storyboards
                    </h3>
                    <p className="text-slate-300 text-xs sm:text-base leading-relaxed">
                      Learn the exact foundation formula to keep characters consistent across scenes, control 3D camera pans, zooms, and drone shots, and assemble a complete high-converting AI commercial from scratch.
                    </p>
                    <div className="grid grid-cols-2 gap-2.5 sm:gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                        <strong className="text-amber-400 block mb-0.5">Camera Control</strong>
                        FPV Drone, Dolly Zoom, Orbit 360°, Macro Lens
                      </div>
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                        <strong className="text-amber-400 block mb-0.5">Use Cases</strong>
                        Ad Films, Brand Stories, Faceless Channels
                      </div>
                    </div>
                  </>
                )}

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    onClick={() => openCheckout()}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
                  >
                    <span>Learn This Live @ ₹99</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Right Column: Live Real Google Veo AI Video Stream */}
              <div className="lg:col-span-6">
                <RealAiVideoPlayer
                  videoUrl={
                    activeStudioTab === 'logo'
                      ? aiVideoShowcaseItems[0].videoUrl
                      : activeStudioTab === 'avatar'
                      ? aiVideoShowcaseItems[1].videoUrl
                      : aiVideoShowcaseItems[2].videoUrl
                  }
                  imageSrc={
                    activeStudioTab === 'logo'
                      ? aiLogoSample
                      : activeStudioTab === 'avatar'
                      ? aiAvatarSample
                      : aiVideoSample
                  }
                  title={
                    activeStudioTab === 'logo'
                      ? '3D Extruded Metallic Logo + Volumetric Light'
                      : activeStudioTab === 'avatar'
                      ? '4K Neural Lip-Sync Avatar + Emotion Engine'
                      : 'Multi-Scene Cinema Camera Rig + AI Soundscape'
                  }
                  mode={activeStudioTab}
                  badge={`3D VIEWPORT // ${activeStudioTab.toUpperCase()}_MODE`}
                  fpsLabel="VEO AI MP4"
                  promptText={
                    activeStudioTab === 'logo'
                      ? aiVideoShowcaseItems[0].prompt
                      : activeStudioTab === 'avatar'
                      ? aiVideoShowcaseItems[1].prompt
                      : aiVideoShowcaseItems[2].prompt
                  }
                  autoPlay={true}
                  showControls={true}
                  onExpandClick={() =>
                    setExpandedAiVideo(
                      activeStudioTab === 'logo'
                        ? aiVideoShowcaseItems[0]
                        : activeStudioTab === 'avatar'
                        ? aiVideoShowcaseItems[1]
                        : aiVideoShowcaseItems[2]
                    )
                  }
                />
              </div>
            </div>
          </Interactive3DTiltCard>
        </div>
      </section>

      {/* ====================================================================
          SECTION 4: REAL AI VIDEO GENERATION SHOWCASE GALLERY (6 AI VIDEOS)
      ==================================================================== */}
      <section className="py-14 sm:py-24 bg-[#060a18] border-t border-white/10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
            <span className="px-3.5 py-1.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-[11px] sm:text-xs font-bold uppercase tracking-widest">
              🎬 4K AI Video Showcase • Real AI Outputs &amp; Prompts
            </span>
            <h2 className="text-2xl sm:text-4xl font-black mt-3 sm:mt-4 mb-3">
              6 Real AI Videos You Will Learn to Direct Live
            </h2>
            <p className="text-slate-400 text-xs sm:text-base">
              Inspect the live 60FPS AI video renders below — complete with the exact text prompts, camera settings, and audio controls we teach live in the masterclass.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {aiVideoShowcaseItems.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl bg-slate-900/90 border border-white/15 overflow-hidden hover:border-blue-400/60 transition-all shadow-lg flex flex-col justify-between p-3"
              >
                <RealAiVideoPlayer
                  videoUrl={item.videoUrl}
                  imageSrc={item.image}
                  title={item.title}
                  mode={item.mode}
                  badge={item.category}
                  fpsLabel={item.fps}
                  autoPlay={true}
                  showControls={true}
                  onExpandClick={() => setExpandedAiVideo(item)}
                />

                <div className="p-2 pt-3 text-left">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="text-sm sm:text-base font-black text-white truncate">
                      {item.title}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setExpandedAiVideo(item)}
                      className="text-[10px] font-bold text-cyan-300 hover:text-white bg-blue-500/20 border border-blue-400/30 px-2 py-0.5 rounded shrink-0 cursor-pointer"
                    >
                      Fullscreen
                    </button>
                  </div>
                  <p className="text-[11px] font-mono text-slate-400 line-clamp-2 italic">
                    {item.prompt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 6: PRICING & OPTIONAL +₹400 SESSION PDF & MATERIAL BUNDLE
      ==================================================================== */}
      <section id="pricing" className="py-14 sm:py-24 bg-[#060a18] border-t border-white/10 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
            <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] sm:text-xs font-bold uppercase tracking-widest">
              Simple &amp; Transparent Pricing • Live 3-Hour Masterclass
            </span>
            <h2 className="text-2xl sm:text-5xl font-black mt-3 sm:mt-4 mb-3">
              Join the 3-Hour Live Session for Just <span className="text-emerald-400">₹99</span>
            </h2>
            <p className="text-slate-400 text-xs sm:text-base">
              Want the complete 150+ AI Filmmaking Prompt Book, 3D Logo Animation Templates &amp; Session PDF? Simply tick the optional ₹400 add-on box at checkout!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
            {/* Base ₹99 Live Webinar Card */}
            <div className="lg:col-span-6">
              <Interactive3DTiltCard
                glowColor="rgba(6, 182, 212, 0.25)"
                className="bg-slate-900/90 border border-white/15 p-6 sm:p-8 h-full flex flex-col justify-between"
              >
                <div>
                  <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold uppercase">
                    Standard Pass • Live Session
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white mt-3">
                    3-Hours AI Filmmaking Live Webinar
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Upcoming Live Batch • 3 Hours Interactive
                  </p>

                  <div className="my-5 sm:my-6 flex items-baseline gap-3">
                    <span className="text-4xl sm:text-5xl font-black text-white">₹99</span>
                    <span className="text-base sm:text-lg text-slate-500 line-through">₹1,999</span>
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                      95% OFF
                    </span>
                  </div>

                  <ul className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm text-slate-300 mb-6 sm:mb-8">
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>Full 3-Hour Live Interactive Masterclass Session</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => openCheckout(false)}
                  className="w-full py-3.5 sm:py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-extrabold text-sm sm:text-base transition-all cursor-pointer"
                >
                  Book Live Session Only (₹99)
                </button>
              </Interactive3DTiltCard>
            </div>

            {/* Complete ₹499 Bundle Card (₹99 Live + ₹400 Session PDF & Material) */}
            <div className="lg:col-span-6">
              <Interactive3DTiltCard
                glowColor="rgba(37, 99, 235, 0.45)"
                className="bg-gradient-to-b from-blue-950/80 via-slate-900/95 to-slate-950 border-2 border-blue-400/60 p-6 sm:p-8 h-full flex flex-col justify-between relative"
              >
                <div className="absolute -top-3.5 right-4 sm:right-6 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-[10px] sm:text-xs uppercase tracking-wider shadow-lg">
                  ★ Most Popular • Complete Bundle
                </div>

                <div>
                  <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase">
                    Live Webinar + Session PDF &amp; Material (+₹400)
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white mt-3">
                    Live Session + Complete AI Filmmaking PDF &amp; Material Kit
                  </h3>
                  <p className="text-xs text-blue-200/80 mt-1">
                    ₹99 Live Session + ₹400 Official Session PDF &amp; Reference Material
                  </p>

                  <div className="my-5 sm:my-6 flex items-baseline gap-3">
                    <span className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-cyan-300 to-emerald-300">
                      ₹499
                    </span>
                    <span className="text-xs text-slate-300 font-mono">
                      (₹99 Live + ₹400 PDF &amp; Material)
                    </span>
                  </div>

                  <ul className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm text-slate-200 mb-6 sm:mb-8">
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <strong>Everything in the ₹99 3-Hour Live Webinar</strong>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>1. Session PDF Material</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>2. 100+ AI Skills</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>3. Content Creation Prompts</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => openCheckout(true)}
                  className="w-full py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-sm sm:text-base shadow-[0_0_35px_rgba(37,99,235,0.5)] transition-all cursor-pointer"
                >
                  Book Live Session + PDF Material (₹499) →
                </button>
              </Interactive3DTiltCard>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 7: MEET YOUR MENTOR (ANTONY PRAVEEN)
      ==================================================================== */}
      <section className="py-14 sm:py-24 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <Interactive3DTiltCard
            glowColor="rgba(6, 182, 212, 0.25)"
            className="bg-slate-900/90 border border-white/15 p-5 sm:p-10"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center">
              <div className="md:col-span-4 flex justify-center">
                <div className="relative w-52 h-60 sm:w-64 sm:h-72 rounded-3xl overflow-hidden border-2 border-blue-400/50 shadow-[0_0_40px_rgba(37,99,235,0.35)]">
                  <img
                    src={antonyImage}
                    alt="Antony Praveen - Founder, Tech Tycoon"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4">
                    <p className="text-base font-black text-white">Antony Praveen</p>
                    <p className="text-xs text-cyan-300 font-semibold">
                      Founder, Tech Tycoon Digital Solution LLP
                    </p>
                  </div>
                </div>
              </div>

              <div className="md:col-span-8 space-y-4 text-center md:text-left">
                <span className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider">
                  Your Live Masterclass Instructor
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-white">
                  Learn Practical AI Filmmaking from an Industry AI Practitioner
                </h2>
                <p className="text-slate-300 text-xs sm:text-base leading-relaxed">
                  Having trained over 10,000+ creators, entrepreneurs, business owners, and students across India, Antony Praveen breaks down complex AI video generation, 3D logo animation, and avatar creation into a simple, repeatable 3-hour foundation system that anyone can apply immediately.
                </p>
                <div className="grid grid-cols-3 gap-2.5 sm:gap-3 pt-2">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                    <span className="block text-lg sm:text-2xl font-black text-cyan-400">10,000+</span>
                    <span className="text-[10px] sm:text-[11px] text-slate-400">Learners Trained</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                    <span className="block text-lg sm:text-2xl font-black text-blue-400">3 Hours</span>
                    <span className="text-[10px] sm:text-[11px] text-slate-400">Live Practical Build</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                    <span className="block text-lg sm:text-2xl font-black text-amber-400">4.9 ★</span>
                    <span className="text-[10px] sm:text-[11px] text-slate-400">Session Rating</span>
                  </div>
                </div>
              </div>
            </div>
          </Interactive3DTiltCard>
        </div>
      </section>

      {/* ====================================================================
          SECTION 8: FREQUENTLY ASKED QUESTIONS
      ==================================================================== */}
      <section className="py-14 sm:py-24 bg-[#060a18] border-t border-white/10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-4xl font-black">Frequently Asked Questions</h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-2">
              Everything you need to know about the 3-Hour AI Filmmaking Live Masterclass
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-slate-900/90 border border-white/10 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                    className="w-full px-5 sm:px-6 py-4 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-base text-white hover:text-cyan-300 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 shrink-0 transition-transform ${
                        isOpen ? 'rotate-180 text-cyan-400' : 'text-slate-400'
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/5 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ====================================================================
          FOOTER
      ==================================================================== */}
      <footer className="py-10 pb-24 bg-[#03050c] border-t border-white/10 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 space-y-2">
          <p className="font-bold text-slate-300">
            TECH TYCOON DIGITAL SOLUTION LLP (GSTIN: 33AAZFT9667P1ZP)
          </p>
          <p>No. 31, Ramalinga Nagar, Madipakkam, Chennai, Tamil Nadu - 600091</p>
          <p>
            Support: {SUPPORT_PHONE_DISPLAY} / +91 7558133039 • Email: support@techtycoon.in
          </p>
        </div>
      </footer>

      {/* ====================================================================
          FLOATING BOTTOM STICKY BAR (MOBILE & DESKTOP OPTIMIZED)
      ==================================================================== */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 border-t border-blue-500/40 backdrop-blur-xl py-2.5 sm:py-3 px-3.5 sm:px-4 shadow-[0_-10px_40px_rgba(0,0,0,0.8)]">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] uppercase tracking-wider text-cyan-400 font-bold truncate">
              Upcoming Live Batch • 3 Hours Intensive
            </p>
            <p className="text-xs sm:text-base font-black text-white truncate">
              3-Hr AI Filmmaking:{' '}
              <span className="text-emerald-400">₹99</span>{' '}
              <span className="text-xs text-slate-400 font-normal hidden sm:inline">
                (Optional +₹400 Resource ToolKit at Checkout)
              </span>
            </p>
          </div>
          <button
            onClick={() => openCheckout()}
            className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-xs sm:text-sm shadow-lg shadow-blue-600/30 shrink-0 cursor-pointer"
          >
            Register Now @ ₹99 →
          </button>
        </div>
      </div>

      {/* ====================================================================
          FULLSCREEN AI VIDEO CINEMA MODAL
      ==================================================================== */}
      {expandedAiVideo && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md"
          onClick={(e) => {
            if (e.target === e.currentTarget) setExpandedAiVideo(null);
          }}
        >
          <div className="relative w-full max-w-4xl rounded-2xl bg-slate-950 border border-blue-500/40 overflow-hidden shadow-2xl p-3 sm:p-5">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block">
                  {expandedAiVideo.category}
                </span>
                <h4 className="text-sm sm:text-lg font-black text-white">
                  🎬 {expandedAiVideo.title}
                </h4>
              </div>
              <button
                onClick={() => setExpandedAiVideo(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <RealAiVideoPlayer
              videoUrl={expandedAiVideo.videoUrl}
              imageSrc={expandedAiVideo.image}
              title={expandedAiVideo.title}
              mode={expandedAiVideo.mode}
              badge={expandedAiVideo.category}
              fpsLabel={expandedAiVideo.fps}
              promptText={expandedAiVideo.prompt}
              autoPlay={true}
              defaultMuted={false}
              showControls={true}
            />
          </div>
        </div>
      )}

      {/* ====================================================================
          CHECKOUT MODAL WITH OPTIONAL +₹400 SESSION PDF & MATERIAL CHECKBOX
          (TECH TYCOON BRAND COLOR: ROYAL BLUE & CRISP CORPORATE WHITE)
      ==================================================================== */}
      {isCheckoutModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          style={{ backdropFilter: 'blur(6px)', background: 'rgba(15, 23, 42, 0.68)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsCheckoutModalOpen(false);
          }}
        >
          <div className="relative w-full max-w-lg my-auto rounded-2xl sm:rounded-3xl p-4 sm:p-6 bg-white border border-slate-200 shadow-2xl max-h-[92vh] overflow-y-auto text-slate-900">
            {/* Top Royal Blue Brand Accent Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-slate-900 via-blue-600 to-indigo-600 rounded-t-3xl" />

            <button
              onClick={() => setIsCheckoutModalOpen(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full p-1.5 transition-colors z-20 cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-3">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Register <span className="text-blue-600">Now</span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                3-Hours AI Filmmaking Live Webinar • Just ₹99 (Incl. 18% GST)
              </p>
              <div className="mt-1.5 inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide">
                <span>📅 Upcoming Live Batch • Session Date &amp; Timing Shared on WhatsApp</span>
              </div>
            </div>

            <form onSubmit={handleProceedToPayment} className="space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider ml-0.5 block">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider ml-0.5 block">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
              </div>

              {isTestUser && (
                <p className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1 font-semibold text-center">
                  ✓ Authorized Live Test Email Detected: ₹1 Test Mode Active
                </p>
              )}

              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider ml-0.5 block">
                  WhatsApp Number *
                </label>
                <div className="flex gap-2">
                  {/* Searchable Country Code Picker with Auto-Suggestion */}
                  <div className="relative shrink-0" ref={countryDropdownRef}>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCountryDropdown(!showCountryDropdown);
                        setCountrySearch('');
                        setTimeout(() => countrySearchInputRef.current?.focus(), 80);
                      }}
                      className="w-24 sm:w-28 h-full bg-slate-50 border border-slate-300 rounded-xl px-2 py-2 text-xs sm:text-sm font-semibold text-slate-900 hover:bg-slate-100 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      title="Select country code"
                    >
                      <span className="text-base leading-none">{selectedCountry.flag}</span>
                      <span className="font-bold text-xs">{selectedCountry.code}</span>
                      <ChevronDown className="w-3 h-3 text-slate-500 shrink-0" />
                    </button>

                    {showCountryDropdown && (
                      <div className="absolute top-full left-0 mt-1.5 w-72 sm:w-80 max-h-64 rounded-2xl border border-slate-200 bg-white shadow-2xl z-50 overflow-hidden flex flex-col text-slate-900 animate-in fade-in zoom-in-95 duration-150">
                        {/* Search Input Box */}
                        <div className="p-2.5 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
                          <Search className="w-4 h-4 text-slate-400 shrink-0" />
                          <input
                            ref={countrySearchInputRef}
                            type="text"
                            value={countrySearch}
                            onChange={(e) => setCountrySearch(e.target.value)}
                            placeholder="Search country or code (e.g. +1, UAE, India)..."
                            className="w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none"
                            autoComplete="off"
                          />
                          {countrySearch && (
                            <button
                              type="button"
                              onClick={() => setCountrySearch('')}
                              className="text-slate-400 hover:text-slate-600 p-0.5"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Search Results / Suggestion List */}
                        <div className="overflow-y-auto flex-1 max-h-52 divide-y divide-slate-100">
                          {filteredCountries.length === 0 ? (
                            <div className="px-4 py-4 text-xs text-slate-400 text-center">
                              No matching country found
                            </div>
                          ) : (
                            filteredCountries.map((c, idx) => {
                              const isSelected =
                                selectedCountry.iso === c.iso && selectedCountry.code === c.code;
                              return (
                                <button
                                  key={`${c.iso}-${c.code}-${idx}`}
                                  type="button"
                                  onClick={() => {
                                    setSelectedCountry(c);
                                    setFormData((prev) => ({ ...prev, countryCode: c.code }));
                                    setShowCountryDropdown(false);
                                    setCountrySearch('');
                                    setTimeout(() => phoneInputRef.current?.focus(), 50);
                                  }}
                                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-blue-50/70 transition-colors text-left cursor-pointer ${
                                    isSelected
                                      ? 'bg-blue-50 text-blue-700 font-bold'
                                      : 'text-slate-700'
                                  }`}
                                >
                                  <span className="text-base leading-none w-5 text-center shrink-0">
                                    {c.flag}
                                  </span>
                                  <span className="flex-1 truncate">{c.name}</span>
                                  <span className="text-xs text-slate-500 font-mono font-bold shrink-0">
                                    {c.code}
                                  </span>
                                </button>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <input
                    ref={phoneInputRef}
                    type="tel"
                    required
                    placeholder={
                      formData.countryCode === '+91'
                        ? '10-digit WhatsApp Number'
                        : 'WhatsApp phone number'
                    }
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })
                    }
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
              </div>

              {/* ============================================================
                  OPTIONAL CHECKBOX: +₹400 FOR SESSION PDF & MATERIAL
              ============================================================ */}
              <div
                onClick={() => setIncludePdfMaterial(!includePdfMaterial)}
                className={`p-3 rounded-xl border transition-all cursor-pointer select-none text-left ${
                  includePdfMaterial
                    ? 'bg-blue-50/90 border-2 border-blue-600 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="filmmaking-pdf-opt-in"
                    checked={includePdfMaterial}
                    onChange={(e) => setIncludePdfMaterial(e.target.checked)}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 accent-blue-600 cursor-pointer shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1.5 flex-wrap">
                      <label
                        htmlFor="filmmaking-pdf-opt-in"
                        className="text-xs sm:text-sm font-bold text-slate-900 cursor-pointer flex items-center gap-1.5"
                      >
                        <span>🎁 I Want Resource ToolKit worth of ₹10,000 (+₹400)</span>
                      </label>
                      <span className="text-[10px] font-black text-blue-700 bg-blue-100/90 border border-blue-200 px-2 py-0.5 rounded-md">
                        Total ₹499
                      </span>
                    </div>
                    <ul className="mt-1.5 space-y-0.5 text-[11px] text-slate-700 font-medium">
                      <li className="flex items-center gap-1.5">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>1. Session PDF Material</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>2. 100+ AI Skills</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>3. Content creation Prompts</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 ml-0.5 text-left">
                <input
                  type="checkbox"
                  required
                  id="wa-filmmaking-opt-in"
                  defaultChecked
                  className="mt-0.5 w-3.5 h-3.5 rounded border-slate-300 text-blue-600 accent-blue-600"
                />
                <label htmlFor="wa-filmmaking-opt-in" className="text-[11px] text-slate-600 leading-tight">
                  I agree to receive live webinar link, GST invoice and reminders on WhatsApp &amp; Email.
                </label>
              </div>

              {formError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {formError}
                </div>
              )}

              <button
                type="submit"
                disabled={isProcessingPayment}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3 sm:py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/25 cursor-pointer disabled:opacity-70"
              >
                <Lock className="w-4 h-4" />
                <span>
                  {isProcessingPayment
                    ? 'Connecting to Razorpay...'
                    : `Proceed to Payment — ₹${totalAmount} (Incl. 18% GST)`}
                </span>
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Secured by Razorpay • 256-Bit SSL Encryption
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiFilmmakingPage;
