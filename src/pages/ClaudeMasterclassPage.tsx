import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Calendar, Clock, UserCheck, ShieldCheck, 
  Crown, Check, X, ChevronDown, Globe, Lock,
  Zap, Plug, Terminal, Laptop, Gift, FileCode, Award, ArrowRight, Star,
  User, Mail, Phone, Briefcase, ArrowLeft, Video, CheckCircle2, MessageSquare
} from 'lucide-react';
import techTycoonLogo from '../assets/tech_tycoon_logo.png';
import antonyPraveenPhoto from '../assets/antony_praveen.jpg';
import onlineWebp from '../assets/online.webp';
import offlineWebp from '../assets/offline.webp';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const APPS_SCRIPT_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbwP2rffwhgGYQjJFlfxYU4XHt-jFbUlWtYPAJOZcxIO--yvw2NTlnLvJDHHh4_giLq7/exec";

const ALL_COUNTRIES = [
  { name: "Afghanistan", code: "+93", flag: "🇦🇫" },
  { name: "Albania", code: "+355", flag: "🇦🇱" },
  { name: "Algeria", code: "+213", flag: "🇩🇿" },
  { name: "Andorra", code: "+376", flag: "🇦🇩" },
  { name: "Angola", code: "+244", flag: "🇦🇴" },
  { name: "Argentina", code: "+54", flag: "🇦🇷" },
  { name: "Armenia", code: "+374", flag: "🇦🇲" },
  { name: "Australia", code: "+61", flag: "🇦🇺" },
  { name: "Austria", code: "+43", flag: "🇦🇹" },
  { name: "Azerbaijan", code: "+994", flag: "🇦🇿" },
  { name: "Bahamas", code: "+1-242", flag: "🇧🇸" },
  { name: "Bahrain", code: "+973", flag: "🇧🇭" },
  { name: "Bangladesh", code: "+880", flag: "🇧🇩" },
  { name: "Barbados", code: "+1-246", flag: "🇧🇧" },
  { name: "Belarus", code: "+375", flag: "🇧🇾" },
  { name: "Belgium", code: "+32", flag: "🇧🇪" },
  { name: "Belize", code: "+501", flag: "🇧🇿" },
  { name: "Benin", code: "+229", flag: "🇧🇯" },
  { name: "Bhutan", code: "+975", flag: "🇧🇹" },
  { name: "Bolivia", code: "+591", flag: "🇧🇴" },
  { name: "Bosnia & Herzegovina", code: "+387", flag: "🇧🇦" },
  { name: "Botswana", code: "+267", flag: "🇧🇼" },
  { name: "Brazil", code: "+55", flag: "🇧🇷" },
  { name: "Brunei", code: "+673", flag: "🇧🇳" },
  { name: "Bulgaria", code: "+359", flag: "🇧🇬" },
  { name: "Burkina Faso", code: "+226", flag: "🇧🇫" },
  { name: "Burundi", code: "+257", flag: "🇧🇮" },
  { name: "Cambodia", code: "+855", flag: "🇰🇭" },
  { name: "Cameroon", code: "+237", flag: "🇨🇲" },
  { name: "Canada", code: "+1", flag: "🇨🇦" },
  { name: "Cape Verde", code: "+238", flag: "🇨🇻" },
  { name: "Central African Republic", code: "+236", flag: "🇨🇫" },
  { name: "Chad", code: "+235", flag: "🇹🇩" },
  { name: "Chile", code: "+56", flag: "🇨🇱" },
  { name: "China", code: "+86", flag: "🇨🇳" },
  { name: "Colombia", code: "+57", flag: "🇨🇴" },
  { name: "Comoros", code: "+269", flag: "🇰🇲" },
  { name: "Congo (Brazzaville)", code: "+242", flag: "🇨🇬" },
  { name: "Congo (Kinshasa)", code: "+243", flag: "🇨🇩" },
  { name: "Costa Rica", code: "+506", flag: "🇨🇷" },
  { name: "Croatia", code: "+385", flag: "🇭🇷" },
  { name: "Cuba", code: "+53", flag: "🇨🇺" },
  { name: "Cyprus", code: "+357", flag: "🇨🇾" },
  { name: "Czechia", code: "+420", flag: "🇨🇿" },
  { name: "Denmark", code: "+45", flag: "🇩🇰" },
  { name: "Djibouti", code: "+253", flag: "🇩🇯" },
  { name: "Dominica", code: "+1-767", flag: "🇩🇲" },
  { name: "Dominican Republic", code: "+1-809", flag: "🇩🇴" },
  { name: "Ecuador", code: "+593", flag: "🇪🇨" },
  { name: "Egypt", code: "+20", flag: "🇪🇬" },
  { name: "El Salvador", code: "+503", flag: "🇸🇻" },
  { name: "Equatorial Guinea", code: "+240", flag: "🇬🇶" },
  { name: "Eritrea", code: "+291", flag: "🇪🇷" },
  { name: "Estonia", code: "+372", flag: "🇪🇪" },
  { name: "Eswatini", code: "+268", flag: "🇸🇿" },
  { name: "Ethiopia", code: "+251", flag: "🇪🇹" },
  { name: "Fiji", code: "+679", flag: "🇫🇯" },
  { name: "Finland", code: "+358", flag: "🇫🇮" },
  { name: "France", code: "+33", flag: "🇫🇷" },
  { name: "Gabon", code: "+241", flag: "🇬🇦" },
  { name: "Gambia", code: "+220", flag: "🇬🇲" },
  { name: "Georgia", code: "+995", flag: "🇬🇪" },
  { name: "Germany", code: "+49", flag: "🇩🇪" },
  { name: "Ghana", code: "+233", flag: "🇬🇭" },
  { name: "Greece", code: "+30", flag: "🇬🇷" },
  { name: "Grenada", code: "+1-473", flag: "🇬🇩" },
  { name: "Guatemala", code: "+502", flag: "🇬🇹" },
  { name: "Guinea", code: "+224", flag: "🇬🇳" },
  { name: "Guinea-Bissau", code: "+245", flag: "🇬🇼" },
  { name: "Guyana", code: "+592", flag: "🇬🇾" },
  { name: "Haiti", code: "+509", flag: "🇭🇹" },
  { name: "Honduras", code: "+504", flag: "🇭🇳" },
  { name: "Hong Kong", code: "+852", flag: "🇭🇰" },
  { name: "Hungary", code: "+36", flag: "🇭🇺" },
  { name: "Iceland", code: "+354", flag: "🇮🇸" },
  { name: "India", code: "+91", flag: "🇮🇳" },
  { name: "Indonesia", code: "+62", flag: "🇮🇩" },
  { name: "Iran", code: "+98", flag: "🇮🇷" },
  { name: "Iraq", code: "+964", flag: "🇮🇶" },
  { name: "Ireland", code: "+353", flag: "🇮🇪" },
  { name: "Israel", code: "+972", flag: "🇮🇱" },
  { name: "Italy", code: "+39", flag: "🇮🇹" },
  { name: "Ivory Coast", code: "+225", flag: "🇨🇮" },
  { name: "Jamaica", code: "+1-876", flag: "🇯🇲" },
  { name: "Japan", code: "+81", flag: "🇯🇵" },
  { name: "Jordan", code: "+962", flag: "🇯🇴" },
  { name: "Kazakhstan", code: "+7", flag: "🇰🇿" },
  { name: "Kenya", code: "+254", flag: "🇰🇪" },
  { name: "Kiribati", code: "+686", flag: "🇰🇮" },
  { name: "Kuwait", code: "+965", flag: "🇰🇼" },
  { name: "Kyrgyzstan", code: "+996", flag: "🇰🇬" },
  { name: "Laos", code: "+856", flag: "🇱🇦" },
  { name: "Latvia", code: "+371", flag: "🇱🇻" },
  { name: "Lebanon", code: "+961", flag: "🇱🇧" },
  { name: "Lesotho", code: "+266", flag: "🇱🇸" },
  { name: "Liberia", code: "+231", flag: "🇱🇷" },
  { name: "Libya", code: "+218", flag: "🇱🇾" },
  { name: "Liechtenstein", code: "+423", flag: "🇱🇮" },
  { name: "Lithuania", code: "+370", flag: "🇱🇹" },
  { name: "Luxembourg", code: "+352", flag: "🇱🇺" },
  { name: "Macau", code: "+853", flag: "🇲🇴" },
  { name: "Madagascar", code: "+261", flag: "🇲🇬" },
  { name: "Malawi", code: "+265", flag: "🇲🇼" },
  { name: "Malaysia", code: "+60", flag: "🇲🇾" },
  { name: "Maldives", code: "+960", flag: "🇲🇻" },
  { name: "Mali", code: "+223", flag: "🇲🇱" },
  { name: "Malta", code: "+356", flag: "🇲🇹" },
  { name: "Marshall Islands", code: "+692", flag: "🇲🇭" },
  { name: "Mauritania", code: "+222", flag: "🇲🇷" },
  { name: "Mauritius", code: "+230", flag: "🇲🇺" },
  { name: "Mexico", code: "+52", flag: "🇲🇽" },
  { name: "Micronesia", code: "+691", flag: "🇫🇲" },
  { name: "Moldova", code: "+373", flag: "🇲🇩" },
  { name: "Monaco", code: "+377", flag: "🇲🇨" },
  { name: "Mongolia", code: "+976", flag: "🇲🇳" },
  { name: "Montenegro", code: "+382", flag: "🇲🇪" },
  { name: "Morocco", code: "+212", flag: "🇲🇦" },
  { name: "Mozambique", code: "+258", flag: "🇲🇿" },
  { name: "Myanmar", code: "+95", flag: "🇲🇲" },
  { name: "Namibia", code: "+264", flag: "🇳🇦" },
  { name: "Nauru", code: "+674", flag: "🇳🇷" },
  { name: "Nepal", code: "+977", flag: "🇳🇵" },
  { name: "Netherlands", code: "+31", flag: "🇳🇱" },
  { name: "New Zealand", code: "+64", flag: "🇳🇿" },
  { name: "Nicaragua", code: "+505", flag: "🇳🇮" },
  { name: "Niger", code: "+227", flag: "🇳🇪" },
  { name: "Nigeria", code: "+234", flag: "🇳🇬" },
  { name: "North Korea", code: "+850", flag: "🇰🇵" },
  { name: "North Macedonia", code: "+389", flag: "🇲🇰" },
  { name: "Norway", code: "+47", flag: "🇳🇴" },
  { name: "Oman", code: "+968", flag: "🇴🇲" },
  { name: "Pakistan", code: "+92", flag: "🇵🇰" },
  { name: "Palau", code: "+680", flag: "🇵🇼" },
  { name: "Palestine", code: "+970", flag: "🇵🇸" },
  { name: "Panama", code: "+507", flag: "🇵🇦" },
  { name: "Papua New Guinea", code: "+675", flag: "🇵🇬" },
  { name: "Paraguay", code: "+595", flag: "🇵🇾" },
  { name: "Peru", code: "+51", flag: "🇵🇪" },
  { name: "Philippines", code: "+63", flag: "🇵🇭" },
  { name: "Poland", code: "+48", flag: "🇵🇱" },
  { name: "Portugal", code: "+351", flag: "🇵🇹" },
  { name: "Qatar", code: "+974", flag: "🇶🇦" },
  { name: "Romania", code: "+40", flag: "🇷🇴" },
  { name: "Russia", code: "+7", flag: "🇷🇺" },
  { name: "Rwanda", code: "+250", flag: "🇷🇼" },
  { name: "Samoa", code: "+685", flag: "🇼🇸" },
  { name: "San Marino", code: "+378", flag: "🇸🇲" },
  { name: "Saudi Arabia", code: "+966", flag: "🇸🇦" },
  { name: "Senegal", code: "+221", flag: "🇸🇳" },
  { name: "Serbia", code: "+381", flag: "🇷🇸" },
  { name: "Seychelles", code: "+248", flag: "🇸🇨" },
  { name: "Sierra Leone", code: "+232", flag: "🇸🇱" },
  { name: "Singapore", code: "+65", flag: "🇸🇬" },
  { name: "Slovakia", code: "+421", flag: "🇸🇰" },
  { name: "Slovenia", code: "+386", flag: "🇸🇮" },
  { name: "Solomon Islands", code: "+677", flag: "🇸🇧" },
  { name: "Somalia", code: "+252", flag: "🇸🇴" },
  { name: "South Africa", code: "+27", flag: "🇿🇦" },
  { name: "South Korea", code: "+82", flag: "🇰🇷" },
  { name: "South Sudan", code: "+211", flag: "🇸🇸" },
  { name: "Spain", code: "+34", flag: "🇪🇸" },
  { name: "Sri Lanka", code: "+94", flag: "🇱🇰" },
  { name: "Sudan", code: "+249", flag: "🇸🇩" },
  { name: "Suriname", code: "+597", flag: "🇸🇷" },
  { name: "Sweden", code: "+46", flag: "🇸🇪" },
  { name: "Switzerland", code: "+41", flag: "🇨🇭" },
  { name: "Syria", code: "+963", flag: "🇸🇾" },
  { name: "Taiwan", code: "+886", flag: "🇹🇼" },
  { name: "Tajikistan", code: "+992", flag: "🇹🇯" },
  { name: "Tanzania", code: "+255", flag: "🇹🇿" },
  { name: "Thailand", code: "+66", flag: "🇹🇭" },
  { name: "Timor-Leste", code: "+670", flag: "🇹🇱" },
  { name: "Togo", code: "+228", flag: "🇹🇬" },
  { name: "Tonga", code: "+676", flag: "🇹🇴" },
  { name: "Trinidad & Tobago", code: "+1-868", flag: "🇹🇹" },
  { name: "Tunisia", code: "+216", flag: "🇹🇳" },
  { name: "Turkey", code: "+90", flag: "🇹🇷" },
  { name: "Turkmenistan", code: "+993", flag: "🇹🇲" },
  { name: "Tuvalu", code: "+688", flag: "🇹🇻" },
  { name: "Uganda", code: "+256", flag: "🇺🇬" },
  { name: "Ukraine", code: "+380", flag: "🇺🇦" },
  { name: "United Arab Emirates", code: "+971", flag: "🇦🇪" },
  { name: "United Kingdom", code: "+44", flag: "🇬🇧" },
  { name: "United States", code: "+1", flag: "🇺🇸" },
  { name: "Uruguay", code: "+598", flag: "🇺🇾" },
  { name: "Uzbekistan", code: "+998", flag: "🇺🇿" },
  { name: "Vanuatu", code: "+678", flag: "🇻🇺" },
  { name: "Vatican City", code: "+379", flag: "🇻🇦" },
  { name: "Venezuela", code: "+58", flag: "🇻🇪" },
  { name: "Vietnam", code: "+84", flag: "🇻🇳" },
  { name: "Yemen", code: "+967", flag: "🇾🇪" },
  { name: "Zambia", code: "+260", flag: "🇿🇲" },
  { name: "Zimbabwe", code: "+263", flag: "🇿🇼" }
];

const promoCodes30 = [
  "CLD30A", "TYC30B", "AIT30C", "MCP30D", "WEB30E", 
  "COD30F", "PRO30G", "DIS30H", "RUN30I", "TAM30J", 
  "ENG30K", "LIVE30", "VIP30M", "REG30N", "ZOOM30", 
  "FAST30", "BEST30", "SAVE30", "GIFT30", "PLUS30"
];

const ClaudeMasterclassPage: React.FC = () => {
  // Countdown Timer State
  const [timeLeft, setTimeLeft] = useState({ days: '00', hours: '00', minutes: '00', seconds: '00' });
  
  // Modal State & Step Flow (Step 1: Choose Pass, Step 2: Fill Form)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [modalStep, setModalStep] = useState<1 | 2>(1);
  const [selectedPlan, setSelectedPlan] = useState<number>(499);
  const [masterclassMode, setMasterclassMode] = useState<'online' | 'offline'>('online');
  const [selectedBatch, setSelectedBatch] = useState<'online' | 'offline' | null>(null);

  // User Form Inputs
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    countryCode: '+91',
    phone: '',
    profession: '',
    agreeWhatsapp: true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState('');
  const [promoCodeInput, setPromoCodeInput] = useState('CLAUDE');
  const [appliedPromo, setAppliedPromo] = useState('CLAUDE');
  const [discountPercent, setDiscountPercent] = useState(10);

  const getBasePrice = (plan: number) => {
    if (plan === 999) return 1110;
    return 554;
  };
  const [promoMessage, setPromoMessage] = useState({ text: 'CLAUDE code applied! 10% discount matches. 🎉', type: 'success' as 'info' | 'success' | 'error' });
  const [wantCertificate, setWantCertificate] = useState(false);

  const getCalculatedPrice = () => {
    if (formData.email.trim().toLowerCase() === "ambroseselva001@gmail.com") return 1;
    const passPrice = selectedPlan;
    const certAddon = wantCertificate ? 1000 : 0;
    return passPrice + certAddon;
  };

  // Check URL pathname, hash, or query parameter for direct batch slugs (online / offline)
  useEffect(() => {
    document.title = "Claude 3.5 AI MasterClass — Live Online & In-Person Workshop by Tech Tycoon";
    const checkHash = () => {
      const pathname = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const searchParams = new URLSearchParams(window.location.search);
      const batchParam = searchParams.get('batch');

      if (pathname.includes('/offline') || hash.includes('offline') || batchParam === 'offline') {
        setSelectedBatch('offline');
        setMasterclassMode('offline');
        setSelectedPlan(4999);
      } else if (pathname.includes('/online') || hash.includes('online') || batchParam === 'online') {
        setSelectedBatch('online');
        setMasterclassMode('online');
        setSelectedPlan(499);
      } else {
        setSelectedBatch(null);
      }
    };

    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  const handleSelectBatch = (batch: 'online' | 'offline') => {
    setSelectedBatch(batch);
    setMasterclassMode(batch);
    setSelectedPlan(batch === 'offline' ? 4999 : 499);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', `#${batch}`);
    }
  };

  const handleShowPortal = () => {
    setSelectedBatch(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };



  // Target Date: September 12, 2026 @ 18:00 IST (Online) | Oct 11, 2026 @ 09:00 IST (Offline)
  useEffect(() => {
    const targetISO = masterclassMode === 'offline' 
      ? '2026-10-11T09:00:00+05:30' 
      : '2026-09-12T18:00:00+05:30';
    const targetDate = new Date(targetISO).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({
          days: String(days).padStart(2, '0'),
          hours: String(hours).padStart(2, '0'),
          minutes: String(minutes).padStart(2, '0'),
          seconds: String(seconds).padStart(2, '0')
        });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [masterclassMode]);

  // Scroll Visibility State for Bottom Floating Widget
  const [showFloatingWidget, setShowFloatingWidget] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isAtBottom = (window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 250;
      if (window.scrollY > 400 && !isAtBottom) {
        setShowFloatingWidget(true);
      } else {
        setShowFloatingWidget(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close country dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (isCountryDropdownOpen && !target.closest('.custom-country-select-container')) {
        setIsCountryDropdownOpen(false);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [isCountryDropdownOpen]);


  // FAQ Accordion State
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const handleOpenModal = (plan: 499 | 999 = 499) => {
    setSelectedPlan(plan);
    setPromoCodeInput('CLAUDE');
    setAppliedPromo('CLAUDE');
    setDiscountPercent(10);
    setPromoMessage({ text: 'CLAUDE code applied! 10% discount matches. 🎉', type: 'success' });
    setModalStep(1);
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
      if (name === 'phone' && value.replace(/\D/g, '').length === 10) {
        setPhoneError('');
      }
    }
  };
  const handleApplyPromo = async () => {
    const code = promoCodeInput.trim().toUpperCase();
    if (code === 'CLAUDE' || code === '') {
      setAppliedPromo('CLAUDE');
      setDiscountPercent(10);
      setPromoMessage({ text: 'CLAUDE code applied! 10% discount matches. 🎉', type: 'success' });
    } else if (promoCodes30.includes(code)) {
      setPromoMessage({ text: 'Validating code...', type: 'info' });
      try {
        const res = await fetch(`${APPS_SCRIPT_WEBAPP_URL}?action=checkPromo&code=${code}`);
        const data = await res.json();
        if (data.valid) {
          setAppliedPromo(code);
          setDiscountPercent(30);
          setPromoMessage({ text: 'Promo code applied! 30% discount matches. 🎉', type: 'success' });
        } else {
          setPromoMessage({ text: 'This unique promo code has already been used.', type: 'error' });
          setAppliedPromo('CLAUDE');
          setDiscountPercent(0);
        }
      } catch (err) {
        console.error("Promo validation error, using local fallback", err);
        setAppliedPromo(code);
        setDiscountPercent(30);
        setPromoMessage({ text: 'Promo code applied! 30% discount matches. 🎉', type: 'success' });
      }
    } else {
      setPromoMessage({ text: 'Invalid promo code.', type: 'error' });
      setAppliedPromo('CLAUDE');
      setDiscountPercent(0);
    }
  };


  const handleStep1Proceed = () => {
    setModalStep(2);
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleProceedPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = formData.phone.replace(/\D/g, '');
    
    if (cleanPhone.length < 6 || cleanPhone.length > 15) {
      setPhoneError('Please enter a valid phone number');
      return;
    }
    setPhoneError('');

    if (!formData.name || !formData.email || !formData.profession) {
      alert('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);

    const fullPhone = formData.countryCode + cleanPhone;
    const finalPrice = getCalculatedPrice();

    try {
      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded) {
        alert('Razorpay SDK failed to load. Please check your internet connection.');
        setIsSubmitting(false);
        return;
      }

      const isInternational = selectedCountry.code !== '+91';
      const razorpayKey = isInternational ? "rzp_live_gfoS1OjC8tvWjP" : "rzp_live_T2CbVONQc6qrqj";

      // Step 1: Call Google Apps Script Web App
      let orderId = "";
      try {
        const orderRes = await fetch(APPS_SCRIPT_WEBAPP_URL, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: fullPhone,
            countryCode: selectedCountry.code,
            isInternational: isInternational,
            profession: formData.profession,
            modeOfSession: masterclassMode === 'offline' ? "Offline Session (In-Person Chennai)" : "Online Session (Zoom Live)",
            amount: finalPrice,
            promoCode: appliedPromo,
            mode: masterclassMode,
            venue: masterclassMode === 'offline' ? "Vestin Park Hotel, Egmore, Chennai" : "Zoom Live Virtual"
          })
        });

        const orderData = await orderRes.json();
        if (orderData && orderData.orderId) {
          orderId = orderData.orderId;
        }
      } catch (err) {
        console.warn("Could not generate order ID from backend, falling back to direct Razorpay modal", err);
      }

      // Step 2: Open Razorpay Live Payment Modal
      const options: any = {
        key: razorpayKey,
        amount: finalPrice * 100,
        currency: "INR",
        name: "Claude Masterclass 2026",
        description: selectedPlan === 999 
          ? "Live + Recording Pass (Recorded Video Access)" 
          : "Standard Live Session Pass",
        image: "https://aitycoon.in/images/tech_tycoon_logo.png",
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: fullPhone
        },
        theme: {
          color: "#D85A30"
        },
        handler: async function (response: any) {
          try {
            await fetch(APPS_SCRIPT_WEBAPP_URL, {
              method: "POST",
              headers: { "Content-Type": "text/plain;charset=utf-8" },
              body: JSON.stringify({
                paymentSuccess: true,
                razorpay_order_id: response.razorpay_order_id || orderId,
                razorpay_payment_id: response.razorpay_payment_id,
                name: formData.name,
                email: formData.email,
                phone: fullPhone,
                amount: finalPrice,
                promoCode: appliedPromo,
                mode: masterclassMode
              })
            });
          } catch (e) {
            console.error("Failed to notify backend of payment success", e);
          }

          setIsModalOpen(false);
          setIsSubmitting(false);

          // Ping AppScript to mark whatsapp clicked
          fetch(`${APPS_SCRIPT_WEBAPP_URL}?action=whatsapp&orderId=${response.razorpay_order_id || orderId}`).catch(() => {});

          // Direct redirect to WhatsApp
          const isOffline = masterclassMode === 'offline' || selectedPlan === 4999;
          const msgText = isOffline
            ? "Hello Tech Tycoon Team I successfully complete the registration claude masterclass offline session"
            : "Hello Tech Tycoon Team I successfully complete the registration of claude masterclass online session";
          const waMessage = encodeURIComponent(msgText);
          window.location.href = `https://wa.me/917010340494?text=${waMessage}`;
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
          }
        }
      };

      if (orderId && orderId.startsWith("order_")) {
        options.order_id = orderId;
      }

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert('Error initiating payment. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (selectedBatch === null) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] text-[#1F1E1C] font-sans">
        <header className="bg-[#F7F4EE] border-b border-[#E6E2D9] py-4 px-6">
          <div className="max-w-6xl mx-auto flex justify-center items-center">
            <div className="flex items-center gap-3">
              <img src={techTycoonLogo} alt="Tech Tycoon" className="h-10 w-auto rounded-lg bg-white p-1 border border-[#E6E2D9]" />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#1F1E1C] tracking-tight">TECH TYCOON</span>
                <span className="text-[10px] text-[#D85A30] font-semibold">Digital Solution LLP</span>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-6 py-12 text-center">
          <span className="bg-[#D85A30]/15 text-[#D85A30] border border-[#D85A30]/30 text-xs font-extrabold px-4 py-1.5 rounded-full uppercase tracking-widest inline-block mb-4">
            CLAUDE 3.5 AI MASTERCLASS
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#1F1E1C] mb-3 tracking-tight">
            Select Your Preferred MasterClass Format
          </h1>
          <p className="text-[#524F4A] text-sm sm:text-base max-w-xl mx-auto mb-10 leading-relaxed">
            Choose between our interactive 2-Day Live Zoom session or the 1-Day In-Person Classroom Workshop at Vestin Park Hotel, Chennai.
          </p>

          <div className="grid md:grid-cols-2 gap-6 text-left">
            {/* Card 1: Online Zoom */}
            <div 
              onClick={() => handleSelectBatch('online')}
              className="bg-white border-2 border-[#D85A30] rounded-2xl p-6 cursor-pointer shadow-[0_10px_30px_rgba(216,90,48,0.12)] hover:shadow-[0_15px_35px_rgba(216,90,48,0.2)] transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="w-full h-44 overflow-hidden rounded-xl mb-4 border border-[#E6E2D9]">
                  <img src={onlineWebp} alt="Claude AI Online MasterClass" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="bg-[#D85A30] text-white text-[11px] font-extrabold px-3 py-1 rounded-full uppercase">🌐 ONLINE LIVE SESSION</span>
                  <span className="text-[#D85A30] text-lg font-black">From ₹499</span>
                </div>
                <h2 className="text-[#1F1E1C] text-xl font-bold mb-2">2-Day Live Virtual MasterClass</h2>
                <p className="text-[#524F4A] text-xs mb-4 leading-relaxed">Learn Claude AI prompt architecture, custom MCP creation, and full web application development live from anywhere.</p>
                <ul className="space-y-2.5 text-xs text-[#2C2A29] mb-6">
                  <li className="flex items-center gap-2.5"><Calendar className="w-4 h-4 text-[#D85A30]" /> <strong>September 12 & 13, 2026 (Sat & Sun)</strong></li>
                  <li className="flex items-center gap-2.5"><Clock className="w-4 h-4 text-[#D85A30]" /> 6:00 PM – 9:00 PM IST (3 Hours/day)</li>
                  <li className="flex items-center gap-2.5"><Globe className="w-4 h-4 text-[#D85A30]" /> 100% Tamil Instruction & Direct Q&A</li>
                </ul>
              </div>
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectBatch('online');
                }}
                className="w-full bg-[#D85A30] hover:bg-[#C04E27] text-white font-extrabold py-3.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                Explore Online MasterClass <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Card 2: Offline Chennai */}
            <div 
              onClick={() => handleSelectBatch('offline')}
              className="bg-white border-2 border-[#E6E2D9] hover:border-[#D85A30] rounded-2xl p-6 cursor-pointer shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_15px_35px_rgba(216,90,48,0.15)] transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="w-full h-44 overflow-hidden rounded-xl mb-4 border border-[#E6E2D9]">
                  <img src={offlineWebp} alt="Claude AI In-Person Workshop Chennai" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="bg-[#D85A30] text-white text-[11px] font-extrabold px-3 py-1 rounded-full uppercase">🏨 IN-PERSON CHENNAI</span>
                  <span className="text-[#D85A30] text-lg font-black">₹4,999</span>
                </div>
                <h2 className="text-[#1F1E1C] text-xl font-bold mb-2">1-Day Classroom Workshop @ Vestin Park Hotel</h2>
                <p className="text-[#524F4A] text-xs mb-4 leading-relaxed">Full-day hands-on classroom workshop in Egmore, Chennai. Includes luxury hotel buffet lunch, morning & evening high tea.</p>
                <ul className="space-y-2.5 text-xs text-[#2C2A29] mb-6">
                  <li className="flex items-center gap-2.5"><Calendar className="w-4 h-4 text-[#D85A30]" /> <strong>October 11, 2026 (Sunday • Full Day)</strong></li>
                  <li className="flex items-center gap-2.5"><Clock className="w-4 h-4 text-[#D85A30]" /> 9:00 AM – 5:30 PM IST</li>
                  <li className="flex items-center gap-2.5"><Utensils className="w-4 h-4 text-[#D85A30]" /> <strong>Hotel Buffet Lunch & High Tea Included</strong></li>
                </ul>
              </div>
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectBatch('offline');
                }}
                className="w-full bg-[#1F1E1C] hover:bg-[#D85A30] text-white font-extrabold py-3.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                Explore In-Person Workshop <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F4EE] text-[#1F1E1C] font-sans selection:bg-[#D85A30] selection:text-white pb-20 md:pb-0">
      
      {/* Top Announcement Bar */}
      <div className="bg-[#1F1E1C] text-[#F7F4EE] py-2.5 px-4 text-xs md:text-sm font-medium border-b border-[#33312E]">
        <div className="max-w-6xl mx-auto flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="bg-[#D85A30] text-white px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider">
              MasterClass Tamil
            </span>
            <span>Master Claude AI, MCPs & Code Automation in Tamil</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-[#C5C0B8]">
            <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-[#D85A30]" /> 100% Tamil (தமிழ்)</span>
          </div>
        </div>
      </div>

      {/* Sticky Header / Navigation */}
      <header className="sticky top-0 z-40 bg-[#F7F4EE]/90 backdrop-blur-md border-b border-[#E6E2D9] py-3.5 px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={techTycoonLogo} alt="Tech Tycoon Digital Solutions" className="h-10 w-auto rounded-lg bg-white p-1 border border-[#E6E2D9] shadow-sm object-contain" />
            <div className="flex flex-col" style={{gap: '1px'}}>
              <div className="text-sm font-bold text-[#1a56db] tracking-tight leading-none">TECH TYCOON</div>
              <div className="text-[10px] text-[#1a56db] font-semibold leading-none">Digital Solution LLP</div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4 text-xs text-[#524F4A]">
              <span>{masterclassMode === 'offline' ? 'October 11, 2026' : 'September 12 & 13'}</span>
              <span className="w-1 h-1 rounded-full bg-[#C5C0B8]"></span>
              <span>{masterclassMode === 'offline' ? '9:00 AM – 5:30 PM IST' : '6:00 PM – 9:00 PM IST'}</span>
            </div>
            <button 
              onClick={() => handleOpenModal(masterclassMode === 'offline' ? 4999 : 499)}
              className="bg-[#D85A30] hover:bg-[#C04E27] text-white font-semibold px-4 py-2 rounded-xl text-xs transition-all shadow-sm flex items-center gap-1.5"
            >
              {masterclassMode === 'offline' ? 'Register @ ₹4,999' : 'Register @ ₹499'} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION — Two Column Layout */}
      <section className="py-12 md:py-20 px-6 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-12 gap-10 items-center">
          
          {/* Hero Left Column: Copy & Primary CTA */}
          <div className="md:col-span-7 space-y-6">
            
            <div className="inline-flex items-center gap-2 bg-[#EFECE6] border border-[#E0DCD3] px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#524F4A]">
              <Sparkles className="w-3.5 h-3.5 text-[#D85A30]" />
              <span>{masterclassMode === 'offline' ? 'IN-PERSON CLASSROOM WORKSHOP' : '2-DAY LIVE WORKSHOP'}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#1F1E1C] tracking-tight leading-[1.15]">
              {masterclassMode === 'offline' ? (
                <>Master <span className="text-[#D85A30]">Claude AI</span> In-Person in Chennai</>
              ) : (
                <>Master <span className="text-[#D85A30]">Claude AI</span>, MCPs & Code Automation in 2 Days</>
              )}
            </h1>

            <p className="text-base sm:text-lg text-[#524F4A] leading-relaxed max-w-xl">
              {masterclassMode === 'offline' ? (
                'Join Antony Praveen live at Vestin Park Hotel, Egmore, Chennai for an intensive full-day classroom workshop. Includes luxury hotel buffet lunch, morning & evening high tea.'
              ) : (
                'Learn how to build custom Model Context Protocols (MCP), prompt like an expert, construct web applications, and automate complex workflows with Anthropic\'s Claude 3.5.'
              )}
            </p>

            {/* Direct Access Note */}
            <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[#2C2A29] bg-[#EFECE6]/60 p-3 rounded-xl border border-[#E6E2D9]">
              <CheckCircle2 className="w-4 h-4 text-[#D85A30] shrink-0" />
              <span>
                {masterclassMode === 'offline'
                  ? 'Direct face-to-face mentorship • Hotel Buffet Lunch & High Tea Included'
                  : 'Direct access to Antony across both days • Live Q&A and practical exercises'}
              </span>
            </div>

            {/* Hero CTA & Secondary Action */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button 
                onClick={() => handleOpenModal(masterclassMode === 'offline' ? 4999 : 499)}
                className="bg-[#D85A30] hover:bg-[#C04E27] text-white font-bold py-3.5 px-7 rounded-xl text-base transition-all shadow-md flex items-center justify-center gap-2"
              >
                {masterclassMode === 'offline' ? 'Register In-Person @ ₹4,999' : 'Register Now @ ₹499'} <ArrowRight className="w-4 h-4" />
              </button>
              <a 
                href="#curriculum"
                className="bg-white hover:bg-[#EFECE6] text-[#1F1E1C] font-semibold py-3.5 px-6 rounded-xl text-sm border border-[#E6E2D9] transition-all text-center flex items-center justify-center gap-2"
              >
                View curriculum
              </a>
            </div>

            {/* Honest Scoped Trust Stat */}
            <div className="pt-3 flex items-center gap-3 text-xs text-[#6E6B65]">
              <div className="flex -space-x-2">
                <div className="w-7 h-7 rounded-full bg-[#D85A30] text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#F7F4EE]">AP</div>
                <div className="w-7 h-7 rounded-full bg-[#1F1E1C] text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#F7F4EE]">TT</div>
              </div>
              <span><strong>5,000+ students trained</strong> (career total across AI sessions)</span>
            </div>

          </div>

          {/* Hero Right Column: Info Card & Countdown */}
          <div className="md:col-span-5">
            <div className="bg-white border border-[#E6E2D9] rounded-2xl p-6 sm:p-7 shadow-sm space-y-6">
              
              <div className="flex justify-between items-center border-b border-[#F0ECE1] pb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#6E6B65]">
                  {masterclassMode === 'offline' ? 'In-Person Venue Details' : 'Session Details'}
                </span>
                <span className="bg-[#F7F4EE] text-[#D85A30] font-bold text-xs px-2.5 py-1 rounded-lg border border-[#E6E2D9]">
                  {masterclassMode === 'offline' ? 'In-Person Chennai' : 'Live Online'}
                </span>
              </div>

              {/* Grid Info */}
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-[#F7F4EE] border border-[#E6E2D9] flex items-center justify-center text-[#D85A30] shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block font-bold text-[#1F1E1C]">Date & Days</strong>
                    <span className="text-xs text-[#524F4A]">
                      {masterclassMode === 'offline' 
                        ? 'October 11, 2026 (Sunday • Full Day)' 
                        : 'September 12 & 13, 2026 (Saturday & Sunday)'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-[#F7F4EE] border border-[#E6E2D9] flex items-center justify-center text-[#6B4FBB] shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block font-bold text-[#1F1E1C]">Timing</strong>
                    <span className="text-xs text-[#524F4A]">6:00 PM – 9:00 PM IST (3.0 Hours / day)</span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-[#F7F4EE] border border-[#E6E2D9] flex items-center justify-center text-[#D85A30] shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block font-bold text-[#1F1E1C]">Medium of Instruction</strong>
                    <span className="text-xs text-[#524F4A]">100% Tamil (தமிழ்)</span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-[#F7F4EE] border border-[#E6E2D9] flex items-center justify-center text-[#6B4FBB] shrink-0">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block font-bold text-[#1F1E1C]">Lead Instructor</strong>
                    <span className="text-xs text-[#524F4A]">Mr. Antony Praveen (Founder, Tech Tycoon)</span>
                  </div>
                </div>
              </div>

              {/* Countdown Timer Widget */}
              <div className="bg-[#F7F4EE] border border-[#E6E2D9] rounded-xl p-4 text-center">
                <span className="text-[11px] font-semibold text-[#6E6B65] uppercase tracking-wider block mb-2">
                  {masterclassMode === 'offline' ? 'In-Person Workshop Starts In' : 'Live Session Starts In'}
                </span>
                <div className="grid grid-cols-4 gap-2">
                  <div className="bg-white border border-[#E6E2D9] rounded-lg py-2">
                    <span className="text-xl font-bold text-[#1F1E1C] block leading-none">{timeLeft.days}</span>
                    <span className="text-[9px] text-[#6E6B65] uppercase">Days</span>
                  </div>
                  <div className="bg-white border border-[#E6E2D9] rounded-lg py-2">
                    <span className="text-xl font-bold text-[#1F1E1C] block leading-none">{timeLeft.hours}</span>
                    <span className="text-[9px] text-[#6E6B65] uppercase">Hours</span>
                  </div>
                  <div className="bg-white border border-[#E6E2D9] rounded-lg py-2">
                    <span className="text-xl font-bold text-[#1F1E1C] block leading-none">{timeLeft.minutes}</span>
                    <span className="text-[9px] text-[#6E6B65] uppercase">Mins</span>
                  </div>
                  <div className="bg-white border border-[#E6E2D9] rounded-lg py-2">
                    <span className="text-xl font-bold text-[#1F1E1C] block leading-none">{timeLeft.seconds}</span>
                    <span className="text-[9px] text-[#6E6B65] uppercase">Secs</span>
                  </div>
                </div>
              </div>

              {/* Pricing Callout */}
              <div className="flex justify-between items-center text-xs pt-1">
                <span className="text-[#6E6B65]">Standard Pass starting at</span>
                <strong className="text-lg font-extrabold text-[#D85A30]">₹499 INR</strong>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* WHY JOIN SECTION — 6 Feature Cards */}
      <section className="py-16 px-6 bg-white border-y border-[#E6E2D9]">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-[#D85A30] font-bold text-xs uppercase tracking-widest block mb-2">Core Skills Covered</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F1E1C] tracking-tight">Why join the Claude Masterclass?</h2>
            <p className="text-sm text-[#524F4A] mt-2">Go beyond generic chatting. Learn how to turn Claude 3.5 Sonnet into your dedicated software engineer and workflow assistant.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            
            <div className="bg-[#F7F4EE] border border-[#E6E2D9] rounded-2xl p-6 hover:border-[#D85A30]/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#E6E2D9] flex items-center justify-center text-[#D85A30] mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#1F1E1C] text-base mb-2">Advanced Prompting & Hacks</h3>
              <p className="text-xs text-[#524F4A] leading-relaxed">System prompts, context caching tricks, structured outputs, and getting exact code logic on the first prompt.</p>
            </div>

            <div className="bg-[#F7F4EE] border border-[#E6E2D9] rounded-2xl p-6 hover:border-[#6B4FBB]/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#E6E2D9] flex items-center justify-center text-[#6B4FBB] mb-4">
                <Plug className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#1F1E1C] text-base mb-2">Build Custom MCP Servers</h3>
              <p className="text-xs text-[#524F4A] leading-relaxed">Connect Claude directly to your local file system, APIs, databases, and custom tools with Model Context Protocol.</p>
            </div>

            <div className="bg-[#F7F4EE] border border-[#E6E2D9] rounded-2xl p-6 hover:border-[#D85A30]/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#E6E2D9] flex items-center justify-center text-[#D85A30] mb-4">
                <Terminal className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#1F1E1C] text-base mb-2">Claude Code & CLI Workflows</h3>
              <p className="text-xs text-[#524F4A] leading-relaxed">Master terminal-based coding automation to edit multi-file projects, refactor codebases, and run debug cycles.</p>
            </div>

            <div className="bg-[#F7F4EE] border border-[#E6E2D9] rounded-2xl p-6 hover:border-[#6B4FBB]/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#E6E2D9] flex items-center justify-center text-[#6B4FBB] mb-4">
                <Laptop className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#1F1E1C] text-base mb-2">Websites & App Building</h3>
              <p className="text-xs text-[#524F4A] leading-relaxed">Construct complete web applications, interactive dashboards, and SaaS landing pages live with Claude Artifacts.</p>
            </div>

            <div className="bg-[#F7F4EE] border border-[#E6E2D9] rounded-2xl p-6 hover:border-[#D85A30]/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#E6E2D9] flex items-center justify-center text-[#D85A30] mb-4">
                <Gift className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#1F1E1C] text-base mb-2">Free vs Paid Tier Optimization</h3>
              <p className="text-xs text-[#524F4A] leading-relaxed">Learn how to maximize Claude's free tier without hitting limits, and evaluate when upgrading to Pro pays off.</p>
            </div>

            <div className="bg-[#F7F4EE] border border-[#E6E2D9] rounded-2xl p-6 hover:border-[#6B4FBB]/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#E6E2D9] flex items-center justify-center text-[#6B4FBB] mb-4">
                <FileCode className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#1F1E1C] text-base mb-2">Hands-on Live Projects</h3>
              <p className="text-xs text-[#524F4A] leading-relaxed">Build real-world projects live during the session with direct guidance and feedback from the instructor.</p>
            </div>

          </div>
        </div>
      </section>

      {/* CURRICULUM SECTION — Grouped by Day */}
      <section className="py-16 px-6 max-w-5xl mx-auto" id="curriculum">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-[#D85A30] font-bold text-xs uppercase tracking-widest block mb-2">2-Day Live Roadmap</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F1E1C] tracking-tight">Structured Masterclass Curriculum</h2>
          <p className="text-sm text-[#524F4A] mt-2">7 total hours of hands-on, live interactive training across Saturday and Sunday.</p>
        </div>

        <div className="space-y-8">
          
          {/* Day 1 Card Group */}
          <div className="bg-white border border-[#E6E2D9] rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-[#F0ECE1] mb-6">
              <div className="flex items-center gap-3">
                <span className="bg-[#D85A30] text-white font-bold text-xs px-3 py-1 rounded-md uppercase">Day 1</span>
                <div>
                  <h3 className="font-bold text-base text-[#1F1E1C]">Saturday, September 12th • 6:00 PM – 9:00 PM IST</h3>
                  <span className="text-xs text-[#6E6B65]">Foundations, Prompt Architecture & Building Custom MCPs</span>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-[#F7F4EE] border border-[#E6E2D9] p-4 rounded-xl">
                <span className="text-xs font-bold text-[#D85A30] block mb-1">Module 01</span>
                <h4 className="font-bold text-sm text-[#1F1E1C] mb-1">Claude Architecture & Artifacts</h4>
                <p className="text-xs text-[#524F4A]">System prompts, token context caching, and free vs paid optimization.</p>
              </div>

              <div className="bg-[#F7F4EE] border border-[#E6E2D9] p-4 rounded-xl">
                <span className="text-xs font-bold text-[#D85A30] block mb-1">Module 02</span>
                <h4 className="font-bold text-sm text-[#1F1E1C] mb-1">Advanced Prompt Engineering</h4>
                <p className="text-xs text-[#524F4A]">Structured JSON outputs, few-shot prompting, and bug elimination.</p>
              </div>

              <div className="bg-[#F7F4EE] border border-[#E6E2D9] p-4 rounded-xl">
                <span className="text-xs font-bold text-[#D85A30] block mb-1">Module 03</span>
                <h4 className="font-bold text-sm text-[#1F1E1C] mb-1">Model Context Protocol (MCP)</h4>
                <p className="text-xs text-[#524F4A]">Connecting Claude to local files, external tools, and custom APIs.</p>
              </div>
            </div>
          </div>

          {/* Day 2 Card Group */}
          <div className="bg-white border border-[#E6E2D9] rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-[#F0ECE1] mb-6">
              <div className="flex items-center gap-3">
                <span className="bg-[#6B4FBB] text-white font-bold text-xs px-3 py-1 rounded-md uppercase">Day 2</span>
                <div>
                  <h3 className="font-bold text-base text-[#1F1E1C]">Sunday, September 13th • 6:00 PM – 9:00 PM IST</h3>
                  <span className="text-xs text-[#6E6B65]">Claude Code CLI, Web App Construction & Live Projects</span>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-[#F7F4EE] border border-[#E6E2D9] p-4 rounded-xl">
                <span className="text-xs font-bold text-[#6B4FBB] block mb-1">Module 04</span>
                <h4 className="font-bold text-sm text-[#1F1E1C] mb-1">Claude Code & Terminal Automation</h4>
                <p className="text-xs text-[#524F4A]">Command line workflows, codebase refactoring, and automated testing.</p>
              </div>

              <div className="bg-[#F7F4EE] border border-[#E6E2D9] p-4 rounded-xl">
                <span className="text-xs font-bold text-[#6B4FBB] block mb-1">Module 05</span>
                <h4 className="font-bold text-sm text-[#1F1E1C] mb-1">Building Web Apps & Dashboards</h4>
                <p className="text-xs text-[#524F4A]">Creating full-stack responsive web tools and SaaS UIs live in class.</p>
              </div>

              <div className="bg-[#F7F4EE] border border-[#E6E2D9] p-4 rounded-xl">
                <span className="text-xs font-bold text-[#6B4FBB] block mb-1">Module 06</span>
                <h4 className="font-bold text-sm text-[#1F1E1C] mb-1">Real Projects & Q&A Session</h4>
                <p className="text-xs text-[#524F4A]">Freelance workflows, client deliverables automation, and live Q&A.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* INSTRUCTOR SECTION — Card with Scoped Metric Stats */}
      <section className="py-16 px-6 bg-white border-y border-[#E6E2D9]">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#F7F4EE] border border-[#E6E2D9] rounded-2xl p-6 sm:p-10 flex flex-col md:flex-row gap-8 items-center">
            
            <div className="flex flex-col items-center text-center shrink-0">
              <img src={antonyPraveenPhoto} alt="Mr. Antony Praveen" className="w-36 h-36 rounded-full object-cover object-top border-2 border-[#D85A30] shadow-sm mb-3" />
              <span className="bg-white border border-[#E6E2D9] text-[#D85A30] px-3 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
                <Award className="w-3.5 h-3.5" /> Lead Instructor
              </span>
            </div>

            <div className="space-y-3 text-center md:text-left">
              <span className="text-[#D85A30] font-bold text-xs uppercase tracking-widest block">Meet Your Mentor</span>
              <h2 className="text-2xl font-bold text-[#1F1E1C]">Mr. Antony Praveen</h2>
              <p className="text-[#6B4FBB] font-semibold text-xs">AI Specialist & Founder, Tech Tycoon</p>
              <p className="text-xs sm:text-sm text-[#524F4A] leading-relaxed">
                Antony Praveen has trained thousands of students, developers, and business owners in AI adoption, prompt engineering, and modern developer tools. With hands-on expertise in production AI agents and custom MCPs, he breaks down complex technical workflows into clear Tamil instruction.
              </p>
              
              {/* Scoped Credibility Metrics */}
              <div className="grid grid-cols-3 gap-3 border-t border-[#E6E2D9] pt-4 text-center">
                <div className="bg-white border border-[#E6E2D9] p-2.5 rounded-xl">
                  <strong className="block text-base font-bold text-[#1F1E1C]">5,000+</strong>
                  <span className="text-[11px] text-[#6E6B65]">Students trained (career total)</span>
                </div>
                <div className="bg-white border border-[#E6E2D9] p-2.5 rounded-xl">
                  <strong className="block text-base font-bold text-[#1F1E1C]">100+</strong>
                  <span className="text-[11px] text-[#6E6B65]">Live sessions conducted</span>
                </div>
                <div className="bg-white border border-[#E6E2D9] p-2.5 rounded-xl">
                  <strong className="block text-base font-bold text-[#1F1E1C]">4.9 ★</strong>
                  <span className="text-[11px] text-[#6E6B65]">Average participant rating</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section className="py-16 px-6 max-w-5xl mx-auto" id="pricing">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-[#D85A30] font-bold text-xs uppercase tracking-widest block mb-2">
            {masterclassMode === 'offline' ? 'In-Person Pass Option' : 'Registration Options'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F1E1C] tracking-tight">
            {masterclassMode === 'offline' ? 'Select your pass for the In-Person Workshop' : 'Select your pass for the founding batch'}
          </h2>
          <p className="text-sm text-[#524F4A] mt-2">
            {masterclassMode === 'offline' 
              ? 'Includes 1-Day Full Day Hands-on Workshop, Hotel Buffet Lunch, High Tea & Snacks at Vestin Park Hotel, Egmore, Chennai.' 
              : 'Choose between the standard live interactive pass or the pass with recorded video access.'}
          </p>
        </div>

        {masterclassMode === 'offline' ? (
          <div className="max-w-xl mx-auto">
            <div className="bg-white border-2 border-[#D85A30] rounded-2xl p-7 flex flex-col justify-between relative shadow-md">
              <span className="absolute -top-3 left-6 bg-[#D85A30] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full">
                HOTEL LUNCH & SNACKS INCLUDED
              </span>

              <div>
                <span className="text-xs font-bold text-[#D85A30] uppercase tracking-wider block mb-2 mt-1">IN-PERSON CHENNAI MASTERCLASS</span>
                <div className="flex items-baseline gap-1.5 mb-3">
                  <span className="text-4xl font-extrabold text-[#1F1E1C]">₹4,999</span>
                  <span className="text-xs text-[#6E6B65]">INR</span>
                </div>
                <p className="text-xs text-[#524F4A] mb-6">Full-day in-person hands-on workshop at Vestin Park Hotel, Egmore, Chennai.</p>

                <ul className="space-y-3 mb-8 text-xs text-[#2C2A29]">
                  <li className="flex items-center gap-2.5 font-semibold">
                    <Check className="w-4 h-4 text-[#D85A30]" /> Full-Day In-Person Training (Sep 6 • 9:00 AM - 5:30 PM)
                  </li>
                  <li className="flex items-center gap-2.5 font-semibold bg-[#F7F4EE] p-2 rounded-lg border border-[#E6E2D9]">
                    <Utensils className="w-4 h-4 text-[#D85A30]" /> Luxury Hotel Buffet Lunch Included
                  </li>
                  <li className="flex items-center gap-2.5 font-semibold bg-[#F7F4EE] p-2 rounded-lg border border-[#E6E2D9]">
                    <Coffee className="w-4 h-4 text-[#D85A30]" /> Morning & Evening High Tea & Refreshments
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#D85A30]" /> Hands on Practical Session
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Laptop className="w-4 h-4 text-[#D85A30]" /> Bring your own Laptop with internet connection (No -WiFi connections)
                  </li>
                </ul>
              </div>

              <button 
                onClick={() => handleOpenModal(4999)}
                className="w-full bg-[#D85A30] hover:bg-[#C04E27] text-white font-bold py-3.5 px-5 rounded-xl transition-all text-xs shadow-sm flex items-center justify-center gap-1.5"
              >
                Register In-Person Pass @ ₹4,999 <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8 items-stretch">
            {/* Card 1: Standard Pass ₹499 */}
            <div className="bg-white border border-[#E6E2D9] rounded-2xl p-7 flex flex-col justify-between hover:border-[#C5C0B8] transition-all">
              <div>
                <span className="text-xs font-bold text-[#6E6B65] uppercase tracking-wider block mb-2">Standard Live Pass</span>
                <div className="flex items-baseline gap-1.5 mb-3">
                  <span className="text-4xl font-extrabold text-[#1F1E1C]">₹499</span>
                  <span className="text-xs text-[#6E6B65]">INR</span>
                </div>
                <p className="text-xs text-[#524F4A] mb-6">Ideal for live interactive participation across both days.</p>

                <ul className="space-y-3 mb-8 text-xs text-[#2C2A29]">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#D85A30]" /> 2-Day Live Online Session (September 12 & 13)
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#D85A30]" /> Tamil & English Instruction
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#D85A30]" /> Direct Q&A with Antony Praveen
                  </li>
                  <li className="flex items-center gap-2.5 text-[#A09C94] line-through">
                    <X className="w-4 h-4 text-[#C5C0B8]" /> Recorded Video Access
                  </li>
                </ul>
              </div>

              <button 
                onClick={() => handleOpenModal(499)}
                className="w-full bg-[#F7F4EE] hover:bg-[#EFECE6] text-[#1F1E1C] font-semibold py-3 px-5 rounded-xl border border-[#E6E2D9] transition-all text-xs"
              >
                Select Live Pass @ ₹499
              </button>
            </div>

            {/* Card 2: VIP Pass ₹999 */}
            <div className="bg-white border-2 border-[#D85A30] rounded-2xl p-7 flex flex-col justify-between relative shadow-sm">
              <span className="absolute -top-3 left-6 bg-[#D85A30] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full">
                Recommended
              </span>

              <div>
                <span className="text-xs font-bold text-[#D85A30] uppercase tracking-wider block mb-2 mt-1">Live + Recording Pass</span>
                <div className="flex items-baseline gap-1.5 mb-3">
                  <span className="text-4xl font-extrabold text-[#1F1E1C]">₹999</span>
                  <span className="text-xs text-[#6E6B65]">INR</span>
                </div>
                <p className="text-xs text-[#524F4A] mb-6">Full package with recorded video access of these 2 live classes.</p>

                <ul className="space-y-3 mb-8 text-xs text-[#2C2A29]">
                  <li className="flex items-center gap-2.5 font-semibold">
                    <Check className="w-4 h-4 text-[#D85A30]" /> Everything in Standard Live Pass
                  </li>
                  <li className="flex items-center gap-2.5 font-semibold text-[#1F1E1C]">
                    <Star className="w-4 h-4 text-[#D85A30] fill-[#D85A30]" /> Recorded Video Access of 2-Day Live Classes
                  </li>
                </ul>
              </div>

              <button 
                onClick={() => handleOpenModal(999)}
                className="w-full bg-[#D85A30] hover:bg-[#C04E27] text-white font-bold py-3 px-5 rounded-xl transition-all text-xs shadow-sm flex items-center justify-center gap-1.5"
              >
                Select Recording Pass @ ₹999 <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* FAQ SECTION — Accordion */}
      <section className="py-16 px-6 bg-white border-t border-[#E6E2D9]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-[#D85A30] font-bold text-xs uppercase tracking-widest block mb-2">Frequently Asked Questions</span>
            <h2 className="text-2xl font-extrabold text-[#1F1E1C]">Everything you need to know</h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "What language will the Masterclass be conducted in?",
                a: "The entire session will be taught 100% in Tamil (தமிழ்) by Mr. Antony Praveen for clear, practical understanding."
              },
              {
                q: "What is the difference between the ₹499 Live Pass and ₹999 Recording Pass?",
                a: "The ₹499 pass grants live interactive participation on September 12 & 13. The ₹999 Recording Pass includes everything in the ₹499 pass PLUS recorded video access of these 2 live classes."
              },
              {
                q: "How will I receive the session meeting link?",
                a: "Immediately upon successful registration, your session link and details will be sent to your email and WhatsApp number."
              },
              {
                q: "Do I need a paid Claude Pro account to participate?",
                a: "No. A free Claude account is sufficient. We specifically teach how to utilize the free version effectively without hitting rate limits."
              },
              {
                q: "Do I need prior coding experience?",
                a: "No prior software development background is required. The session is structured step-by-step from foundational prompting to AI-assisted coding."
              }
            ].map((faq, idx) => (
              <div key={idx} className="bg-[#F7F4EE] border border-[#E6E2D9] rounded-xl overflow-hidden">
                <button 
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 text-left font-semibold text-[#1F1E1C] flex justify-between items-center text-xs sm:text-sm"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-[#D85A30] transition-transform duration-200 ${activeFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {activeFaq === idx && (
                  <div className="px-4 pb-4 text-xs text-[#524F4A] leading-relaxed border-t border-[#E6E2D9]/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6 bg-[#1F1E1C] text-[#C5C0B8] border-t border-[#33312E] text-center text-xs">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="mb-4">
            <img src={techTycoonLogo} alt="Tech Tycoon" className="h-7 w-auto bg-white p-0.5 rounded mx-auto" />
          </div>
          <p className="text-[#8E8A83] max-w-md mx-auto">Conducted by TECH TYCOON Digital Solution LLP • September 12 & 13, 2026</p>
          <div className="flex justify-center gap-3 text-[11px] text-[#A09C94] underline flex-wrap">
            <button onClick={() => setIsTermsOpen(true)} className="hover:text-white transition-colors">Terms & Conditions</button>
            <span>•</span>
            <button onClick={() => setIsTermsOpen(true)} className="hover:text-white transition-colors">Privacy Policy</button>
            <span>•</span>
            <button onClick={() => setIsTermsOpen(true)} className="hover:text-white transition-colors">Refund & Cancellation Policy</button>
          </div>
          <div className="pt-4 border-t border-[#33312E] text-[11px] text-[#8E8A83]">
            &copy; 2026 TECH TYCOON Digital Solution LLP. All rights reserved. | aitycoon.in/claude_masterclass
          </div>
        </div>
      </footer>

      {/* BOTTOM CENTER FLOATING WIDGET (3 COLUMNS: DATE | TIME | CTA) */}
      <div className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-40 bg-white/95 backdrop-blur-md border border-[#E6E2D9] rounded-2xl shadow-xl px-4 py-2.5 sm:px-6 sm:py-3 flex items-center justify-between gap-3 sm:gap-6 w-[92%] sm:w-auto max-w-2xl transition-all duration-300 ${
        showFloatingWidget && !isModalOpen 
          ? 'opacity-100 translate-y-0 pointer-events-auto' 
          : 'opacity-0 translate-y-6 pointer-events-none'
      }`}>
        {/* Column 1: Date */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#D85A30] shrink-0" />
          <div>
            <strong className="block text-xs font-bold text-[#1F1E1C] leading-tight">
              {masterclassMode === 'offline' ? 'October 11, 2026' : 'September 12 & 13'}
            </strong>
            <span className="text-[10px] text-[#6E6B65] hidden sm:block">
              {masterclassMode === 'offline' ? 'Sunday (Full Day)' : 'Sat & Sun'}
            </span>
          </div>
        </div>

        <div className="w-[1px] h-7 bg-[#E6E2D9] shrink-0"></div>

        {/* Column 2: Time */}
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#6B4FBB] shrink-0" />
          <div>
            <strong className="block text-xs font-bold text-[#1F1E1C] leading-tight">5:30 PM – 8:30 PM</strong>
            <span className="text-[10px] text-[#6E6B65]">IST</span>
          </div>
        </div>

        <div className="w-[1px] h-7 bg-[#E6E2D9] shrink-0"></div>

        {/* Column 3: CTA Button */}
        <button 
          onClick={() => handleOpenModal(499)}
          className="bg-[#D85A30] hover:bg-[#C04E27] text-white font-bold px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs shadow-sm flex items-center gap-1.5 shrink-0 transition-all"
        >
          <span>Register Now</span>
          <span className="hidden md:inline text-[11px] font-normal opacity-90">@ ₹499</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2-STEP REGISTRATION & PAYMENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white border border-[#E6E2D9] rounded-2xl w-full max-w-md p-5 sm:p-6 relative shadow-2xl my-4 text-[#1F1E1C]">
            
            {/* Close Button */}
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#F7F4EE] border border-[#E6E2D9] text-[#6E6B65] hover:text-[#1F1E1C] flex items-center justify-center transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            {/* STEP 1: PASS SELECTION */}
            {modalStep === 1 && (
              <div>
                <div className="text-center mb-6">
                  <span className="text-[#D85A30] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Secure Checkout
                  </span>
                  <h3 className="text-xl font-bold text-[#1F1E1C] mt-1">Select your registration pass</h3>
                  <p className="text-xs text-[#6E6B65] mt-1">Choose your preferred option to continue</p>
                </div>

                <div className="space-y-3.5 mb-6">
                  {masterclassMode === 'offline' ? (
                    <div 
                      onClick={() => setSelectedPlan(4999)}
                      className="p-4 pt-5 rounded-xl border-2 border-[#D85A30] bg-[#F7F4EE] cursor-pointer transition-all flex gap-3.5 items-start relative"
                    >
                      <span className="absolute -top-2.5 right-4 bg-[#D85A30] text-white text-[9px] font-extrabold px-2.5 py-0.5 rounded uppercase tracking-wider shadow-sm z-10">Hotel Lunch Included</span>
                      <div className="w-4 h-4 rounded-full border-2 border-[#D85A30] bg-[#D85A30] flex items-center justify-center mt-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1 gap-2">
                          <span className="font-bold text-[#1F1E1C] text-sm">In-Person Chennai MasterClass Pass</span>
                          <span className="font-extrabold text-[#D85A30] text-base shrink-0">₹4,999</span>
                        </div>
                        <p className="text-xs text-[#6E6B65] mt-1">
                          Full-day hands-on workshop at <strong>Vestin Park Hotel, Egmore, Chennai</strong>. Includes Hotel Buffet Lunch, High Tea & Refreshments.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Standard Option ₹499 */}
                      <div 
                        onClick={() => setSelectedPlan(499)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex gap-3.5 items-start ${
                          selectedPlan === 499 || selectedPlan === 399
                            ? 'border-[#D85A30] bg-[#F7F4EE]' 
                            : 'border-[#E6E2D9] bg-white hover:border-[#C5C0B8]'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-1 transition-all ${
                          selectedPlan === 499 || selectedPlan === 399 ? 'border-[#D85A30] bg-[#D85A30]' : 'border-[#C5C0B8]'
                        }`}>
                          {(selectedPlan === 499 || selectedPlan === 399) && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-0.5">
                            <span className="font-bold text-[#1F1E1C] text-sm">Standard Live Pass</span>
                            <span className="font-extrabold text-[#D85A30] text-base">₹499</span>
                          </div>
                          <p className="text-xs text-[#524F4A]">Live Zoom Session (No Video Recording Access).</p>
                        </div>
                      </div>

                      {/* VIP Option ₹999 */}
                      <div 
                        onClick={() => setSelectedPlan(999)}
                        className={`p-4 pt-5 rounded-xl border-2 cursor-pointer transition-all flex gap-3.5 items-start relative mt-2 ${
                          selectedPlan === 999 
                            ? 'border-[#D85A30] bg-[#F7F4EE]' 
                            : 'border-[#E6E2D9] bg-white hover:border-[#C5C0B8]'
                        }`}
                      >
                        <span className="absolute -top-2.5 right-4 bg-[#6B4FBB] text-white text-[9px] font-extrabold px-2.5 py-0.5 rounded uppercase tracking-wider shadow-sm z-10">Recommended</span>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-1 transition-all ${
                          selectedPlan === 999 ? 'border-[#D85A30] bg-[#D85A30]' : 'border-[#C5C0B8]'
                        }`}>
                          {selectedPlan === 999 && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1 gap-2">
                            <span className="font-bold text-[#1F1E1C] text-sm">Live + Recording Pass</span>
                            <span className="font-extrabold text-[#D85A30] text-base shrink-0">₹999</span>
                          </div>
                          <p className="text-xs text-[#6E6B65] mt-1">Live Zoom + <strong>Recorded Video Access of these 2 live classes</strong>.</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="border-t border-[#E6E2D9] pt-4">
                  <div className="flex justify-between items-center mb-4 text-xs">
                    <span className="text-[#6E6B65]">Selected Pass Total:</span>
                    <strong className="text-xl font-extrabold text-[#D85A30]">₹{selectedPlan} INR</strong>
                  </div>
                  <button 
                    onClick={handleStep1Proceed}
                    className="w-full bg-[#D85A30] hover:bg-[#C04E27] text-white font-bold py-3.5 px-5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    Proceed to details <Lock className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: USER DETAILS FORM */}
            {modalStep === 2 && (
              <div>
                <button 
                  type="button"
                  onClick={() => setModalStep(1)}
                  className="flex items-center gap-1 text-[11px] text-[#6E6B65] hover:text-[#D85A30] mb-2 font-medium transition-colors"
                >
                  <ArrowLeft className="w-3 h-3" /> Change pass selection (₹{getCalculatedPrice()})
                </button>

                <div className="text-center mb-3">
                  <h3 className="text-lg font-extrabold text-[#1F1E1C]">
                    Complete Your Registration
                  </h3>
                  <p className="text-[11px] text-[#6E6B65] mt-0.5">
                    Registration fee: <strong className="text-[#D85A30]">₹{getCalculatedPrice()} INR</strong>
                  </p>

                  <div className="inline-flex items-center gap-1.5 bg-[#F7F4EE] border border-[#E6E2D9] text-[#524F4A] px-2.5 py-0.5 rounded-md text-[10px] font-medium mt-1">
                    <Calendar className="w-3 h-3 text-[#D85A30]" />
                    {masterclassMode === 'offline' 
                      ? 'October 11, 2026 (Sunday • Full Day) • 9:00 AM IST' 
                      : 'September 12 & 13, 2026 (Sat & Sun) • 6:00 PM IST'}
                  </div>

                  {masterclassMode !== 'offline' && (
                    <div className="mt-2.5 flex bg-[#F7F4EE] p-1 rounded-xl border border-[#E6E2D9] gap-1">
                      <button
                        type="button"
                        onClick={() => setSelectedPlan(499)}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                          selectedPlan === 499 || selectedPlan === 399
                            ? 'bg-white text-[#D85A30] shadow-sm border border-[#E6E2D9]'
                            : 'text-[#6E6B65] hover:text-[#1F1E1C]'
                        }`}
                      >
                        <span>Standard Live</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedPlan(999)}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                          selectedPlan === 999 
                            ? 'bg-white text-[#D85A30] shadow-sm border border-[#E6E2D9]'
                            : 'text-[#6E6B65] hover:text-[#1F1E1C]'
                        }`}
                      >
                        <span>⭐ Live + Recording</span>
                      </button>
                    </div>
                  )}
                </div>

                <form onSubmit={handleProceedPayment} className="space-y-3 text-left">
                  <div>
                    <label className="block text-[10px] font-bold text-[#524F4A] uppercase tracking-wider mb-1">Full Name</label>
                    <input 
                      type="text" 
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your name"
                      className="w-full bg-[#F7F4EE] border border-[#E6E2D9] rounded-xl px-3.5 py-2.5 text-xs text-[#1F1E1C] focus:outline-none focus:border-[#D85A30] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#524F4A] uppercase tracking-wider mb-1">Email Address</label>
                    <input 
                      type="email" 
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="email@example.com"
                      className="w-full bg-[#F7F4EE] border border-[#E6E2D9] rounded-xl px-3.5 py-2.5 text-xs text-[#1F1E1C] focus:outline-none focus:border-[#D85A30] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#524F4A] uppercase tracking-wider mb-1">WhatsApp Number</label>
                    <div className="flex gap-2">
                      <div className="relative w-[90px] shrink-0">
                        <button 
                          type="button" 
                          onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                          className="w-full bg-[#F7F4EE] border border-[#E6E2D9] rounded-xl px-2 py-2.5 text-xs font-semibold text-[#524F4A] flex items-center justify-between gap-1"
                        >
                          <span className="truncate">
                            {(() => {
                              const found = ALL_COUNTRIES.find(item => item.code === formData.countryCode);
                              return found ? `${found.flag} ${found.code}` : '🇮🇳 +91';
                            })()}
                          </span>
                          <ChevronDown className="w-3 h-3 text-[#6E6B65] shrink-0" />
                        </button>
                        
                        {isCountryDropdownOpen && (
                          <div className="absolute bottom-full mb-1 left-0 w-64 bg-white border border-[#E6E2D9] rounded-xl shadow-xl z-50 overflow-hidden">
                            <div className="p-2 border-b border-[#E6E2D9] bg-[#F7F4EE]">
                              <input 
                                type="text"
                                value={countrySearchQuery}
                                onChange={(e) => setCountrySearchQuery(e.target.value)}
                                placeholder="🔍 Search country..."
                                className="w-full bg-white border border-[#E6E2D9] rounded-lg px-2.5 py-1 text-xs text-[#1F1E1C] focus:outline-none"
                              />
                            </div>
                            <div className="max-h-44 overflow-y-auto p-1 space-y-0.5">
                              {ALL_COUNTRIES.filter(c => c.name.toLowerCase().includes(countrySearchQuery.toLowerCase())).map((c) => (
                                <button
                                  key={c.code}
                                  type="button"
                                  onClick={() => {
                                    setFormData({...formData, countryCode: c.code});
                                    setIsCountryDropdownOpen(false);
                                  }}
                                  className="w-full text-left px-2.5 py-1.5 text-xs hover:bg-[#F7F4EE] rounded-lg flex items-center justify-between text-[#1F1E1C]"
                                >
                                  <span>{c.flag} {c.name}</span>
                                  <span className="text-[#6E6B65] font-semibold">{c.code}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <input 
                        type="tel" 
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="WhatsApp number"
                        className="flex-1 bg-[#F7F4EE] border border-[#E6E2D9] rounded-xl px-3.5 py-2.5 text-xs text-[#1F1E1C] focus:outline-none focus:border-[#D85A30] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#524F4A] uppercase tracking-wider mb-1">Current Profession</label>
                    <select 
                      name="profession"
                      required
                      value={formData.profession}
                      onChange={handleInputChange}
                      className="w-full bg-[#F7F4EE] border border-[#E6E2D9] rounded-xl px-3.5 py-2.5 text-xs text-[#1F1E1C] focus:outline-none focus:border-[#D85A30] transition-colors"
                    >
                      <option value="">Select profession...</option>
                      <option value="Trainer / Coach">Trainer / Coach</option>
                      <option value="Entrepreneur">Entrepreneur</option>
                      <option value="Business Owner">Business Owner</option>
                      <option value="Educator">Educator</option>
                      <option value="IT Professional">IT Professional</option>
                      <option value="Student">Student</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#524F4A] uppercase tracking-wider mb-1">Promo Code</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={promoCodeInput}
                        onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                        placeholder="Enter promo code"
                        className="flex-1 bg-[#F7F4EE] border border-[#E6E2D9] rounded-xl px-3.5 py-2 text-xs text-[#1F1E1C] focus:outline-none focus:border-[#D85A30] uppercase font-bold"
                      />
                      <button 
                        type="button" 
                        onClick={handleApplyPromo}
                        className="bg-[#EFECE6] hover:bg-[#E6E2D9] text-[#1F1E1C] font-semibold px-4 py-2 rounded-xl text-xs border border-[#E6E2D9] transition-all"
                      >
                        Apply
                      </button>
                    </div>
                  </div>

                  {/* E-CERTIFICATE ADD-ON CHECKBOX */}
                  <div className="bg-[#D85A30]/5 border border-dashed border-[#D85A30] rounded-xl p-3 text-left">
                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={wantCertificate}
                        onChange={(e) => setWantCertificate(e.target.checked)}
                        className="mt-0.5 w-4 h-4 accent-[#D85A30] rounded cursor-pointer"
                      />
                      <div>
                        <div className="font-bold text-xs text-[#1F1E1C] flex items-center gap-1.5">
                          <span>🎓 Official E-Certificate</span>
                          <span className="bg-[#D85A30] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded">+ ₹1,000</span>
                        </div>
                        <p className="text-[10px] text-[#524F4A] mt-0.5 leading-snug">
                          Get an official verified E-Certificate upon masterclass completion to share on LinkedIn & Resume.
                        </p>
                      </div>
                    </label>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer text-[10px] text-[#8E8A83]">
                    <input 
                      type="checkbox" 
                      name="agreeWhatsapp"
                      checked={formData.agreeWhatsapp} 
                      onChange={handleInputChange}
                      className="accent-[#D85A30] rounded w-3.5 h-3.5" 
                    />
                    <span>I agree to receive workshop updates and automated reminders on WhatsApp.</span>
                  </label>

                  <button 
                    type="submit" 
                    className="w-full bg-[#D85A30] hover:bg-[#C04E27] text-white font-bold py-3.5 px-5 rounded-xl shadow-md transition-all text-sm mt-2"
                  >
                    Proceed to payment — ₹{getCalculatedPrice()}
                  </button>

                  <div className="text-center text-[10px] text-[#8E8A83] font-semibold flex items-center justify-center gap-1 pt-1">
                    <ShieldCheck className="w-3 h-3 text-[#D85A30]" /> SECURED BY RAZORPAY
                  </div>
                </form>
              </div>
            )}

          </div>
        </div>
      )}

      {/* TERMS & CONDITIONS MODAL */}
      {isTermsOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#E6E2D9] rounded-2xl w-full max-w-lg p-6 relative shadow-2xl my-6 text-[#1F1E1C] max-h-[85vh] overflow-y-auto text-left">
            <button 
              onClick={() => setIsTermsOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#F7F4EE] border border-[#E6E2D9] text-[#6E6B65] hover:text-[#1F1E1C] flex items-center justify-center transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold text-[#1F1E1C] mb-1">Terms & Conditions</h3>
            <p className="text-xs text-[#6E6B65] mb-4">Last Updated: August 2026 • Tech Tycoon Digital Solution LLP</p>

            <div className="space-y-3 text-xs text-[#524F4A] leading-relaxed">
              <div>
                <h4 className="font-bold text-[#1F1E1C] text-xs">1. Workshop Schedule & Access</h4>
                <p className="mt-0.5">The Claude MasterClass is a 2-Day Live Virtual Session taking place on September 12th & 13th, 2026 (6:00 PM – 9:00 PM IST). Access details and session meeting links are provided via the official WhatsApp group upon registration.</p>
              </div>

              <div>
                <h4 className="font-bold text-[#1F1E1C] text-xs">2. Registration & Pass Types</h4>
                <p className="mt-0.5"><strong>Standard Live Pass (₹499)</strong> includes live interactive Zoom participation across both days. Video recording access is excluded from the standard pass.</p>
                <p className="mt-0.5"><strong>Live + Recording Pass (₹999)</strong> includes live participation PLUS recorded video access of these 2 live classes.</p>
                <p className="mt-0.5"><strong>Official E-Certificate Add-on (+ ₹1,000)</strong> is an optional verified certificate issued upon completion of the masterclass.</p>
              </div>

              <div>
                <h4 className="font-bold text-[#1F1E1C] text-xs">3. Refund & Cancellation Policy</h4>
                <p className="mt-0.5">All registrations, pass purchases, and add-on payments are strictly non-refundable once processed. In the rare event of a session postponement by Tech Tycoon Digital Solution LLP, registered participants will be accommodated in the rescheduled live batch.</p>
              </div>

              <div>
                <h4 className="font-bold text-[#1F1E1C] text-xs">4. Intellectual Property</h4>
                <p className="mt-0.5">All course materials, custom Model Context Protocol (MCP) code samples, presentation slides, and live recordings belong to Tech Tycoon Digital Solution LLP. Participants are granted a personal, non-exclusive license to use code templates for personal and business projects. Re-distribution or resale of course materials is strictly prohibited.</p>
              </div>

              <div>
                <h4 className="font-bold text-[#1F1E1C] text-xs">5. Contact & Support</h4>
                <p className="mt-0.5">For registration queries or support, email us at <a href="mailto:techtycoondigitalsolutions@gmail.com" className="text-[#D85A30] underline font-medium">techtycoondigitalsolutions@gmail.com</a>.</p>
              </div>
            </div>

            <div className="mt-5 text-center">
              <button 
                onClick={() => setIsTermsOpen(false)}
                className="bg-[#D85A30] hover:bg-[#C04E27] text-white font-bold py-2 px-6 rounded-xl text-xs transition-all"
              >
                Close Terms
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ClaudeMasterclassPage;
