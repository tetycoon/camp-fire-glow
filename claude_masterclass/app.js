const APPS_SCRIPT_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbwP2rffwhgGYQjJFlfxYU4XHt-jFbUlWtYPAJOZcxIO--yvw2NTlnLvJDHHh4_giLq7/exec";
let selectedPlan = 499;
let currentMasterclassMode = 'online'; // 'online' | 'offline'

const countryCodes = [
  { code: "+91", label: "🇮🇳 India (+91)" },
  { code: "+1", label: "🇺🇸 US/Canada (+1)" },
  { code: "+44", label: "🇬🇧 UK (+44)" },
  { code: "+61", label: "🇦🇺 Australia (+61)" },
  { code: "+65", label: "🇸🇬 Singapore (+65)" },
  { code: "+60", label: "🇲🇾 Malaysia (+60)" },
  { code: "+971", label: "🇦🇪 UAE (+971)" },
  { code: "+966", label: "🇸🇦 Saudi Arabia (+966)" },
  { code: "+974", label: "🇶🇦 Qatar (+974)" },
  { code: "+64", label: "🇳🇿 New Zealand (+64)" },
  { code: "+94", label: "🇱🇰 Sri Lanka (+94)" },
  { code: "+880", label: "🇧🇩 Bangladesh (+880)" },
  { code: "+92", label: "🇵🇰 Pakistan (+92)" },
  { code: "+62", label: "🇮🇩 Indonesia (+62)" },
  { code: "+63", label: "🇵🇭 Philippines (+63)" },
  { code: "+66", label: "🇹🇭 Thailand (+66)" },
  { code: "+84", label: "🇻🇳 Vietnam (+84)" },
  { code: "+90", label: "🇹🇷 Turkey (+90)" },
  { code: "+20", label: "🇪🇬 Egypt (+20)" },
  { code: "+27", label: "🇿🇦 South Africa (+27)" },
  { code: "+234", label: "🇳🇬 Nigeria (+234)" },
  { code: "+254", label: "🇰🇪 Kenya (+254)" },
  { code: "+965", label: "🇰🇼 Kuwait (+965)" },
  { code: "+968", label: "🇴🇲 Oman (+968)" },
  { code: "+973", label: "🇧🇭 Bahrain (+973)" },
  { code: "+49", label: "🇩🇪 Germany (+49)" },
  { code: "+33", label: "🇫🇷 France (+33)" },
  { code: "+39", label: "🇮🇹 Italy (+39)" },
  { code: "+34", label: "🇪🇸 Spain (+34)" },
  { code: "+31", label: "🇳🇱 Netherlands (+31)" },
  { code: "+32", label: "🇧🇪 Belgium (+32)" },
  { code: "+41", label: "🇨🇭 Switzerland (+41)" },
  { code: "+46", label: "🇸🇪 Sweden (+46)" },
  { code: "+47", label: "🇳🇴 Norway (+47)" },
  { code: "+45", label: "🇩🇰 Denmark (+45)" },
  { code: "+353", label: "🇮🇪 Ireland (+353)" },
  { code: "+43", label: "🇦🇹 Austria (+43)" },
  { code: "+81", label: "🇯🇵 Japan (+81)" },
  { code: "+82", label: "🇰🇷 South Korea (+82)" },
  { code: "+86", label: "🇨🇳 China (+86)" },
  { code: "+7", label: "🇷🇺 Russia (+7)" },
  { code: "+55", label: "🇧🇷 Brazil (+55)" },
  { code: "+52", label: "🇲🇽 Mexico (+52)" },
  { code: "+54", label: "🇦🇷 Argentina (+54)" },
  { code: "+57", label: "🇨🇴 Colombia (+57)" },
  { code: "+56", label: "🇨🇱 Chile (+56)" },
  { code: "+51", label: "🇵🇪 Peru (+51)" },
  { code: "+972", label: "🇮🇱 Israel (+972)" },
  { code: "+977", label: "🇳🇵 Nepal (+977)" },
  { code: "+95", label: "🇲🇲 Myanmar (+95)" },
  { code: "+855", label: "🇰🇭 Cambodia (+855)" },
  { code: "+856", label: "🇱🇦 Laos (+856)" },
  { code: "+673", label: "🇧🇳 Brunei (+673)" },
  { code: "+852", label: "🇭🇰 Hong Kong (+852)" },
  { code: "+886", label: "🇹🇼 Taiwan (+886)" },
  { code: "+358", label: "🇫🇮 Finland (+358)" },
  { code: "+351", label: "🇵🇹 Portugal (+351)" },
  { code: "+30", label: "🇬🇷 Greece (+30)" },
  { code: "+48", label: "🇵🇱 Poland (+48)" },
  { code: "+40", label: "🇷🇴 Romania (+40)" },
  { code: "+36", label: "🇭🇺 Hungary (+36)" },
  { code: "+420", label: "🇨🇿 Czechia (+420)" },
  { code: "+380", label: "🇺🇦 Ukraine (+380)" },
  { code: "+385", label: "🇭🇷 Croatia (+385)" },
  { code: "+359", label: "🇧🇬 Bulgaria (+359)" },
  { code: "+386", label: "🇸🇮 Slovenia (+386)" },
  { code: "+421", label: "🇸🇰 Slovakia (+421)" },
  { code: "+370", label: "🇱🇹 Lithuania (+370)" },
  { code: "+371", label: "🇱🇻 Latvia (+371)" },
  { code: "+372", label: "🇪🇪 Estonia (+372)" },
  { code: "+354", label: "🇮🇸 Iceland (+354)" },
  { code: "+381", label: "🇷🇸 Serbia (+381)" },
  { code: "+357", label: "🇨🇾 Cyprus (+357)" },
  { code: "+356", label: "🇲🇹 Malta (+356)" },
  { code: "+506", label: "🇨🇷 Costa Rica (+506)" },
  { code: "+507", label: "🇵🇦 Panama (+507)" },
  { code: "+502", label: "🇬🇹 Guatemala (+502)" },
  { code: "+503", label: "🇸🇻 El Salvador (+503)" },
  { code: "+504", label: "🇭🇳 Honduras (+504)" },
  { code: "+505", label: "🇳🇮 Nicaragua (+505)" },
  { code: "+591", label: "🇧🇴 Bolivia (+591)" },
  { code: "+593", label: "🇪🇨 Ecuador (+593)" },
  { code: "+595", label: "🇵🇾 Paraguay (+595)" },
  { code: "+598", label: "🇺🇾 Uruguay (+598)" },
  { code: "+58", label: "🇻🇪 Venezuela (+58)" },
  { code: "+212", label: "🇲🇦 Morocco (+212)" },
  { code: "+213", label: "🇩🇿 Algeria (+213)" },
  { code: "+216", label: "🇹🇳 Tunisia (+216)" },
  { code: "+218", label: "🇱🇾 Libya (+218)" },
  { code: "+244", label: "🇦🇴 Angola (+244)" },
  { code: "+233", label: "🇬🇭 Ghana (+233)" },
  { code: "+255", label: "🇹🇿 Tanzania (+255)" },
  { code: "+256", label: "🇺🇬 Uganda (+256)" },
  { code: "+251", label: "🇪🇹 Ethiopia (+251)" },
  { code: "+250", label: "🇷🇼 Rwanda (+250)" },
  { code: "+263", label: "🇿🇼 Zimbabwe (+263)" },
  { code: "+260", label: "🇿🇲 Zambia (+260)" },
  { code: "+230", label: "🇲🇺 Mauritius (+230)" },
  { code: "+248", label: "🇸🇨 Seychelles (+248)" },
  { code: "+264", label: "🇳🇦 Namibia (+264)" },
  { code: "+267", label: "🇧🇼 Botswana (+267)" },
  { code: "+268", label: "🇸🇿 Eswatini (+268)" },
  { code: "+266", label: "🇱🇸 Lesotho (+266)" },
  { code: "+261", label: "🇲🇬 Madagascar (+261)" },
  { code: "+265", label: "🇲🇼 Malawi (+265)" },
  { code: "+258", label: "🇲🇿 Mozambique (+258)" },
  { code: "+242", label: "🇨🇬 Congo (+242)" },
  { code: "+243", label: "🇨🇩 DR Congo (+243)" },
  { code: "+237", label: "🇨🇲 Cameroon (+237)" },
  { code: "+225", label: "🇨🇮 Côte d'Ivoire (+225)" },
  { code: "+221", label: "🇸🇳 Senegal (+221)" },
  { code: "+253", label: "🇩🇯 Djibouti (+253)" },
  { code: "+962", label: "🇯🇴 Jordan (+962)" },
  { code: "+961", label: "🇱🇧 Lebanon (+961)" },
  { code: "+963", label: "🇸🇾 Syria (+963)" },
  { code: "+964", label: "🇮🇶 Iraq (+964)" },
  { code: "+967", label: "🇾🇪 Yemen (+967)" },
  { code: "+970", label: "🇵🇸 Palestine (+970)" },
  { code: "+994", label: "🇦🇿 Azerbaijan (+994)" },
  { code: "+995", label: "🇬🇪 Georgia (+995)" },
  { code: "+374", label: "🇦🇲 Armenia (+374)" },
  { code: "+993", label: "🇹🇲 Turkmenistan (+993)" },
  { code: "+998", label: "🇺🇿 Uzbekistan (+998)" },
  { code: "+992", label: "🇹🇯 Tajikistan (+992)" },
  { code: "+996", label: "🇰🇬 Kyrgyzstan (+996)" },
  { code: "+7", label: "🇰🇿 Kazakhstan (+7)" },
  { code: "+976", label: "🇲🇳 Mongolia (+976)" },
  { code: "+960", label: "🇲🇻 Maldives (+960)" },
  { code: "+975", label: "🇧🇹 Bhutan (+975)" },
  { code: "+853", label: "🇲🇴 Macau (+853)" },
  { code: "+679", label: "🇫🇯 Fiji (+679)" },
  { code: "+687", label: "🇳🇨 New Caledonia (+687)" },
  { code: "+689", label: "🇵🇫 French Polynesia (+689)" },
  { code: "+676", label: "🇹🇴 Tonga (+676)" },
  { code: "+685", label: "🇼🇸 Samoa (+685)" },
  { code: "+678", label: "🇻🇺 Vanuatu (+678)" },
  { code: "+675", label: "🇵🇬 PNG (+675)" },
  { code: "+677", label: "🇸🇧 Solomon Islands (+677)" },
  { code: "+680", label: "🇵🇼 Palau (+680)" },
  { code: "+691", label: "🇫🇲 Micronesia (+691)" },
  { code: "+692", label: "🇲🇭 Marshall Islands (+692)" },
  { code: "+686", label: "🇰🇮 Kiribati (+686)" },
  { code: "+688", label: "🇹🇻 Tuvalu (+688)" },
  { code: "+670", label: "🇹🇱 Timor-Leste (+670)" }
];

const promoCodes30 = [
  "CLD30A", "TYC30B", "AIT30C", "MCP30D", "WEB30E", 
  "COD30F", "PRO30G", "DIS30H", "RUN30I", "TAM30J", 
  "ENG30K", "LIVE30", "VIP30M", "REG30N", "ZOOM30", 
  "FAST30", "BEST30", "SAVE30", "GIFT30", "PLUS30"
];
let appliedPromo = "CLAUDE";
let discountPercent = 10;

function getBasePrice(plan) {
    if (plan === 999) return 1110;
    return 554;
}

let wantCertificate = false;

function getFinalPrice() {
    const emailVal = document.getElementById('cust-email')?.value.trim().toLowerCase() || "";
    if (emailVal === "ambroseselva001@gmail.com") {
        return 1;
    }
    const passPrice = selectedPlan; // 499 or 999
    const certAddon = wantCertificate ? 1000 : 0;
    return passPrice + certAddon;
}

function toggleCertificate() {
    const certCb = document.getElementById('want-certificate');
    wantCertificate = certCb ? certCb.checked : false;
    updatePricesUI();
}

function updatePricesUI() {
    const finalPrice = getFinalPrice();
    const selTotal = document.getElementById('selected-pass-total');
    if (selTotal) selTotal.innerText = `₹${selectedPlan.toLocaleString()} INR`;
    if (document.getElementById('form-fee-display')) document.getElementById('form-fee-display').innerText = `₹${finalPrice.toLocaleString()} INR`;
    if (document.getElementById('btn-fee-display')) document.getElementById('btn-fee-display').innerText = `₹${finalPrice.toLocaleString()}`;
    if (document.getElementById('back-pass-price')) document.getElementById('back-pass-price').innerText = `₹${finalPrice.toLocaleString()}`;
    const mobPrice = document.getElementById('mobile-pass-price');
    if (mobPrice) mobPrice.innerText = `₹${finalPrice.toLocaleString()} INR`;
}



// Countdown Timer Logic
function updateCountdownTimer() {
    const targetISO = currentMasterclassMode === 'offline' 
        ? '2026-10-11T09:00:00+05:30' 
        : '2026-09-12T18:00:00+05:30';
    const targetDate = new Date(targetISO).getTime();
    const now = new Date().getTime();
    const diff = targetDate - now;

    const labelEl = document.querySelector('.countdown-label');
    if (labelEl) {
        labelEl.innerText = currentMasterclassMode === 'offline' 
            ? 'IN-PERSON WORKSHOP STARTS IN' 
            : 'LIVE SESSION STARTS IN';
    }

    if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);

        const elDays = document.getElementById('cd-days');
        const elHours = document.getElementById('cd-hours');
        const elMins = document.getElementById('cd-mins');
        const elSecs = document.getElementById('cd-secs');

        if (elDays) elDays.innerText = String(days).padStart(2, '0');
        if (elHours) elHours.innerText = String(hours).padStart(2, '0');
        if (elMins) elMins.innerText = String(mins).padStart(2, '0');
        if (elSecs) elSecs.innerText = String(secs).padStart(2, '0');
    }
}

(function startCountdown() {
    updateCountdownTimer();
    setInterval(updateCountdownTimer, 1000);
})();

// Scroll-triggered Floating Widget Visibility
window.addEventListener('scroll', function() {
    const widget = document.querySelector('.bottom-floating-widget');
    if (widget) {
        const isAtBottom = (window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 250;
        if (window.scrollY > 400 && !isAtBottom) {
            widget.classList.add('visible');
        } else {
            widget.classList.remove('visible');
        }
    }
});

// Modal Control
function openPaymentModal(plan = 499) {
    if (currentMasterclassMode === 'offline') {
        plan = 4999;
    }
    selectedPlan = plan;
    appliedPromo = "CLAUDE";
    discountPercent = 10;
    
    const promoInput = document.getElementById('cust-promo');
    const promoMsg = document.getElementById('promo-message');
    if (promoInput && promoMsg) {
        promoInput.value = "CLAUDE";
        promoMsg.style.display = "block";
        promoMsg.style.color = "#10b981"; // success green
        promoMsg.innerText = "CLAUDE code applied! 10% discount matches. 🎉";
    }

    const optsOnline = document.getElementById('modal-options-online');
    const optsOffline = document.getElementById('modal-options-offline');
    if (currentMasterclassMode === 'offline' || plan === 4999) {
        if (optsOnline) optsOnline.style.display = 'none';
        if (optsOffline) optsOffline.style.display = 'block';
    } else {
        if (optsOnline) optsOnline.style.display = 'block';
        if (optsOffline) optsOffline.style.display = 'none';
    }

    selectPass(plan);
    goToStep1();
    document.getElementById('payment-modal').classList.add('active');
    document.body.classList.add('modal-open');
}

function closePaymentModal() {
    document.getElementById('payment-modal').classList.remove('active');
    document.body.classList.remove('modal-open');
}

function openTermsModal(e) {
    if (e) e.preventDefault();
    const modal = document.getElementById('terms-modal');
    if (modal) modal.classList.add('active');
    document.body.classList.add('modal-open');
}

function closeTermsModal() {
    const modal = document.getElementById('terms-modal');
    if (modal) modal.classList.remove('active');
    document.body.classList.remove('modal-open');
}

function showPortalView() {
    const portalView = document.getElementById('portal-selection-view');
    const mainContent = document.getElementById('masterclass-main-content');
    if (portalView) portalView.style.setProperty('display', 'block', 'important');
    if (mainContent) mainContent.style.setProperty('display', 'none', 'important');
    if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', window.location.pathname);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openBatchPage(mode) {
    const portalView = document.getElementById('portal-selection-view');
    const mainContent = document.getElementById('masterclass-main-content');
    if (portalView) portalView.style.setProperty('display', 'none', 'important');
    if (mainContent) mainContent.style.setProperty('display', 'block', 'important');
    switchMasterclassMode(mode);
    if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', '#' + mode);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function checkUrlHash() {
    const hash = window.location.hash.toLowerCase();
    const urlParams = new URLSearchParams(window.location.search);
    const batchParam = urlParams.get('batch');
    const pathname = window.location.pathname.toLowerCase();
    
    if (hash.includes('offline') || batchParam === 'offline' || pathname.includes('/offline')) {
        openBatchPage('offline');
    } else if (hash.includes('online') || batchParam === 'online' || pathname.includes('/online')) {
        openBatchPage('online');
    } else {
        showPortalView();
    }
}

document.addEventListener('DOMContentLoaded', checkUrlHash);
window.addEventListener('hashchange', checkUrlHash);
if (document.readyState === 'interactive' || document.readyState === 'complete') {
    checkUrlHash();
}

function switchMasterclassMode(mode) {
    currentMasterclassMode = mode;
    
    const cardOnline = document.getElementById('card-tab-online');
    const cardOffline = document.getElementById('card-tab-offline');
    
    const badgeOnline = document.getElementById('badge-tab-online');
    const badgeOffline = document.getElementById('badge-tab-offline');
    
    const gridOnline = document.getElementById('pricing-grid-online');
    const gridOffline = document.getElementById('pricing-grid-offline');
    
    if (mode === 'offline') {
        if (cardOnline) {
            cardOnline.style.borderColor = '#44413D';
            cardOnline.style.opacity = '0.7';
            cardOnline.style.boxShadow = 'none';
        }
        if (badgeOnline) {
            badgeOnline.style.backgroundColor = '#33312E';
            badgeOnline.style.color = '#A09C94';
        }
        if (cardOffline) {
            cardOffline.style.borderColor = '#D85A30';
            cardOffline.style.opacity = '1';
            cardOffline.style.boxShadow = '0 4px 20px rgba(216,90,48,0.35)';
        }
        if (badgeOffline) {
            badgeOffline.style.backgroundColor = '#D85A30';
            badgeOffline.style.color = '#FFFFFF';
        }
        
        if (gridOnline) gridOnline.style.display = 'none';
        if (gridOffline) gridOffline.style.display = 'grid';
        
        if (document.getElementById('nav-date-text')) document.getElementById('nav-date-text').innerText = 'Oct 11, 2026';
        if (document.getElementById('nav-time-text')) document.getElementById('nav-time-text').innerText = '9:00 AM – 5:30 PM IST';
        if (document.getElementById('nav-reg-btn')) document.getElementById('nav-reg-btn').innerHTML = 'Register In-Person @ ₹4,999 <i class="fa-solid fa-arrow-right"></i>';
        if (document.getElementById('nav-reg-btn')) document.getElementById('nav-reg-btn').setAttribute('onclick', 'openPaymentModal(4999)');
        
        if (document.getElementById('hero-badge-text')) document.getElementById('hero-badge-text').innerText = '🏨 IN-PERSON 1-DAY MASTERCLASS IN TAMIL';
        if (document.getElementById('hero-title-el')) document.getElementById('hero-title-el').innerHTML = 'Master <span class="text-terracotta">Claude AI</span> & MCP In-Person in Chennai';
        if (document.getElementById('hero-desc-el')) document.getElementById('hero-desc-el').innerText = 'Join Antony Praveen live at Vestin Park Hotel, Egmore, Chennai for an intensive full-day classroom workshop. Includes luxury hotel buffet lunch, high tea & hands-on practical session.';
        if (document.getElementById('hero-access-text')) document.getElementById('hero-access-text').innerText = 'Direct face-to-face mentorship • Hotel Buffet Lunch & High Tea Included';
        if (document.getElementById('hero-cta-btn')) document.getElementById('hero-cta-btn').innerHTML = 'Register In-Person @ ₹4,999 <i class="fa-solid fa-arrow-right"></i>';
        if (document.getElementById('hero-cta-btn')) document.getElementById('hero-cta-btn').setAttribute('onclick', 'openPaymentModal(4999)');
        
        if (document.getElementById('session-tag-el')) document.getElementById('session-tag-el').innerText = 'IN-PERSON VENUE DETAILS';
        if (document.getElementById('venue-badge-el')) document.getElementById('venue-badge-el').innerHTML = '<i class="fa-solid fa-hotel"></i> Vestin Park Hotel, Chennai';
        if (document.getElementById('info-date-text')) document.getElementById('info-date-text').innerText = 'October 11, 2026 (Sunday • Full Day)';
        if (document.getElementById('info-time-text')) document.getElementById('info-time-text').innerText = '9:00 AM – 5:30 PM IST (Hotel Lunch Included)';
        if (document.getElementById('info-venue-text')) document.getElementById('info-venue-text').innerText = 'Vestin Park Hotel, Egmore, Chennai, Tamil Nadu';
        
        if (document.getElementById('hero-card-sub-price')) document.getElementById('hero-card-sub-price').innerText = 'In-Person Pass starting at';
        if (document.getElementById('hero-card-main-price')) document.getElementById('hero-card-main-price').innerText = '₹4,999 INR';

        if (document.getElementById('pricing-title-el')) document.getElementById('pricing-title-el').innerText = 'Select your pass for the In-Person Workshop';
        if (document.getElementById('pricing-desc-el')) document.getElementById('pricing-desc-el').innerText = 'Includes 1-Day Full Day Hands-on Workshop, Hotel Buffet Lunch, High Tea & Snacks at Vestin Park Hotel, Egmore, Chennai.';

        if (document.getElementById('float-date-title')) document.getElementById('float-date-title').innerText = 'October 11, 2026';
        if (document.getElementById('float-date-sub')) document.getElementById('float-date-sub').innerText = 'Sunday (Full Day)';
        if (document.getElementById('float-time-title')) document.getElementById('float-time-title').innerText = '9:00 AM – 5:30 PM';
        if (document.getElementById('float-time-sub')) document.getElementById('float-time-sub').innerText = 'IST';
        if (document.getElementById('float-cta-btn')) document.getElementById('float-cta-btn').innerHTML = 'Register In-Person @ ₹4,999 <i class="fa-solid fa-arrow-right"></i>';
        if (document.getElementById('float-cta-btn')) document.getElementById('float-cta-btn').setAttribute('onclick', 'openPaymentModal(4999)');

        selectedPlan = 4999;
    } else {
        if (cardOnline) {
            cardOnline.style.borderColor = '#D85A30';
            cardOnline.style.opacity = '1';
            cardOnline.style.boxShadow = '0 4px 20px rgba(216,90,48,0.35)';
        }
        if (badgeOnline) {
            badgeOnline.style.backgroundColor = '#D85A30';
            badgeOnline.style.color = '#FFFFFF';
        }
        if (cardOffline) {
            cardOffline.style.borderColor = '#44413D';
            cardOffline.style.opacity = '0.7';
            cardOffline.style.boxShadow = 'none';
        }
        if (badgeOffline) {
            badgeOffline.style.backgroundColor = '#33312E';
            badgeOffline.style.color = '#A09C94';
        }
        
        if (gridOnline) gridOnline.style.display = 'grid';
        if (gridOffline) gridOffline.style.display = 'none';
        
        if (document.getElementById('nav-date-text')) document.getElementById('nav-date-text').innerText = 'September 12 & 13';
        if (document.getElementById('nav-time-text')) document.getElementById('nav-time-text').innerText = '6:00 PM – 9:00 PM IST';
        if (document.getElementById('nav-reg-btn')) document.getElementById('nav-reg-btn').innerHTML = 'Register Now @ ₹499 <i class="fa-solid fa-arrow-right"></i>';
        if (document.getElementById('nav-reg-btn')) document.getElementById('nav-reg-btn').setAttribute('onclick', 'openPaymentModal(499)');
        
        if (document.getElementById('hero-badge-text')) document.getElementById('hero-badge-text').innerText = '2-DAY LIVE WORKSHOP';
        if (document.getElementById('hero-title-el')) document.getElementById('hero-title-el').innerHTML = 'Master <span class="text-terracotta">Claude AI</span>, MCPs & Code Automation in 2 Days';
        if (document.getElementById('hero-desc-el')) document.getElementById('hero-desc-el').innerText = 'Learn how to build custom Model Context Protocols (MCP), prompt like an expert, construct web applications, and automate complex workflows with Anthropic\'s Claude 3.5.';
        if (document.getElementById('hero-access-text')) document.getElementById('hero-access-text').innerText = 'Direct access to Antony across both days • Live Q&A and practical exercises';
        if (document.getElementById('hero-cta-btn')) document.getElementById('hero-cta-btn').innerHTML = 'Register Now @ ₹499 <i class="fa-solid fa-arrow-right"></i>';
        if (document.getElementById('hero-cta-btn')) document.getElementById('hero-cta-btn').setAttribute('onclick', 'openPaymentModal(499)');
        
        if (document.getElementById('session-tag-el')) document.getElementById('session-tag-el').innerText = 'SESSION DETAILS';
        if (document.getElementById('venue-badge-el')) document.getElementById('venue-badge-el').innerHTML = '<i class="fa-solid fa-video"></i> Live Online';
        if (document.getElementById('info-date-text')) document.getElementById('info-date-text').innerText = 'September 12 & 13, 2026 (Saturday & Sunday)';
        if (document.getElementById('info-time-text')) document.getElementById('info-time-text').innerText = '6:00 PM – 9:00 PM IST';
        if (document.getElementById('info-venue-text')) document.getElementById('info-venue-text').innerText = 'Live Interactive Virtual Classroom';

        if (document.getElementById('hero-card-sub-price')) document.getElementById('hero-card-sub-price').innerText = 'Standard Pass starting at';
        if (document.getElementById('hero-card-main-price')) document.getElementById('hero-card-main-price').innerText = '₹499 INR';

        if (document.getElementById('pricing-title-el')) document.getElementById('pricing-title-el').innerText = 'Select your pass for the live batch';
        if (document.getElementById('pricing-desc-el')) document.getElementById('pricing-desc-el').innerText = 'Choose between the standard live interactive pass or the pass with recorded video access.';

        if (document.getElementById('float-date-title')) document.getElementById('float-date-title').innerText = 'September 12 & 13';
        if (document.getElementById('float-date-sub')) document.getElementById('float-date-sub').innerText = '6:00 PM IST';
        if (document.getElementById('float-time-title')) document.getElementById('float-time-title').innerText = '6:00 PM – 9:00 PM';
        if (document.getElementById('float-time-sub')) document.getElementById('float-time-sub').innerText = 'IST';
        if (document.getElementById('float-cta-btn')) document.getElementById('float-cta-btn').innerHTML = 'Register Now @ ₹499 <i class="fa-solid fa-arrow-right"></i>';
        if (document.getElementById('float-cta-btn')) document.getElementById('float-cta-btn').setAttribute('onclick', 'openPaymentModal(499)');

        selectedPlan = 499;
    }
    
    updatePricesUI();
    updateCountdownTimer();
}

function selectPass(plan) {
    if (currentMasterclassMode === 'offline') {
        plan = 4999;
    }
    selectedPlan = plan;
    
    // Update Option Cards in Step 1
    if (document.getElementById('opt-499')) document.getElementById('opt-499').classList.toggle('selected', plan === 499 || plan === 399);
    if (document.getElementById('opt-999')) document.getElementById('opt-999').classList.toggle('selected', plan === 999);
    if (document.getElementById('opt-4999')) document.getElementById('opt-4999').classList.toggle('selected', plan === 4999);

    // Update Tab Switcher Buttons in Step 2
    const tab499 = document.getElementById('tab-pass-499');
    const tab999 = document.getElementById('tab-pass-999');
    const step2Switcher = document.getElementById('step2-pass-switcher');

    if (step2Switcher) {
        if (currentMasterclassMode === 'offline' || plan === 4999) {
            step2Switcher.style.display = 'none';
        } else {
            step2Switcher.style.display = 'flex';
        }
    }

    if (tab499 && tab999) {
        if (plan === 999) {
            tab499.style.background = 'transparent';
            tab499.style.color = '#6E6B65';
            tab499.style.boxShadow = 'none';

            tab999.style.background = '#D85A30';
            tab999.style.color = '#ffffff';
            tab999.style.boxShadow = '0 2px 6px rgba(216,90,48,0.3)';
        } else {
            tab499.style.background = '#ffffff';
            tab499.style.color = '#D85A30';
            tab499.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';

            tab999.style.background = 'transparent';
            tab999.style.color = '#6E6B65';
            tab999.style.boxShadow = 'none';
        }
    }

    updatePricesUI();

    // Update Warning Note & Modal Session Pill
    const passNote = document.getElementById('pass-note');
    if (passNote) {
        if (currentMasterclassMode === 'offline' || plan === 4999) {
            passNote.style.display = 'none';
        } else if (plan === 499 || plan === 399) {
            passNote.style.display = 'block';
            passNote.innerHTML = '⚠️ Live session only (No recorded access in ₹499 pass)';
            passNote.style.color = '#D85A30';
        } else {
            passNote.style.display = 'block';
            passNote.innerHTML = '⭐ Includes recorded video access of these 2 live classes!';
            passNote.style.color = '#6B4FBB';
        }
    }

    const modalPill = document.getElementById('modal-session-pill');
    if (modalPill) {
        if (currentMasterclassMode === 'offline' || plan === 4999) {
            modalPill.innerHTML = '<i class="fa-regular fa-calendar"></i> October 11, 2026 (Sunday) • 9:00 AM – 5:30 PM IST';
        } else {
            modalPill.innerHTML = '<i class="fa-regular fa-calendar"></i> September 12 & 13, 2026 • 6:00 PM IST';
        }
    }
}

function goToStep1() {
    document.getElementById('modal-step-1').style.display = 'block';
    document.getElementById('modal-step-2').style.display = 'none';
}

function goToStep2() {
    document.getElementById('modal-step-1').style.display = 'none';
    document.getElementById('modal-step-2').style.display = 'block';
}

// Accordion Control
function toggleFaq(buttonElement) {
    const faqItem = buttonElement.parentElement;
    const isActive = faqItem.classList.contains('active');
    
    document.querySelectorAll('.faq-item').forEach(item => item.classList.remove('active'));
    
    if (!isActive) {
        faqItem.classList.add('active');
    }
}

// Form Submission & Razorpay Checkout
async function handleFormSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('cust-name').value.trim();
    const email = document.getElementById('cust-email').value.trim();
    const countryCode = document.getElementById('cust-country-code')?.value || '+91';
    const phoneRaw = document.getElementById('cust-phone').value.trim().replace(/\D/g, '');
    const phone = countryCode + phoneRaw;
    const profession = document.getElementById('cust-profession').value;

    if (phoneRaw.length < 6) {
        alert('Please enter a valid WhatsApp number.');
        return;
    }

    const submitBtn = document.getElementById('pay-submit-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerText = 'Initializing payment...';
    submitBtn.disabled = true;

    const isInternational = countryCode !== '+91';
    const razorpayKey = isInternational ? "rzp_live_gfoS1OjC8tvWjP" : "rzp_live_T2CbVONQc6qrqj";

    try {
        const finalPrice = getFinalPrice();

        // Step 1: Send lead data to Google Apps Script Web App to get Order ID
        let orderId = "";
        try {
            const res = await fetch(APPS_SCRIPT_WEBAPP_URL, {
                method: "POST",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    phone: phone,
                    countryCode: countryCode,
                    isInternational: isInternational,
                    profession: profession,
                    modeOfSession: currentMasterclassMode === 'offline' ? "Offline Session (In-Person Chennai)" : "Online Session (Zoom Live)",
                    amount: finalPrice,
                    wantCertificate: wantCertificate,
                    certificate: wantCertificate ? "YES (+₹1,000)" : "NO",
                    promoCode: appliedPromo,
                    mode: currentMasterclassMode,
                    venue: currentMasterclassMode === 'offline' ? "Vestin Park Hotel, Egmore, Chennai" : "Zoom Live Virtual"
                })
            });
            const data = await res.json();
            if (data && data.orderId) {
                orderId = data.orderId;
            }
        } catch (err) {
            console.warn("Backend order creation warning, opening Razorpay direct checkout", err);
        }

        // Step 2: Open Razorpay Modal
        const options = {
            key: razorpayKey,
            amount: finalPrice * 100,
            currency: "INR",
            name: "Claude Masterclass 2026",
            description: selectedPlan === 999 
                ? "Live + Recording Pass (Recorded Video Access)" 
                : "Standard Live Session Pass",
            image: "https://aitycoon.in/images/tech_tycoon_logo.png",
            prefill: {
                name: name,
                email: email,
                contact: phone
            },
            theme: {
                color: "#D85A30"
            },
            handler: async function (response) {
                try {
                    await fetch(APPS_SCRIPT_WEBAPP_URL, {
                        method: "POST",
                        headers: { "Content-Type": "text/plain;charset=utf-8" },
                        body: JSON.stringify({
                            paymentSuccess: true,
                            razorpay_order_id: response.razorpay_order_id || orderId,
                            razorpay_payment_id: response.razorpay_payment_id,
                            name: name,
                            email: email,
                            phone: phone,
                            amount: finalPrice,
                            promoCode: appliedPromo,
                            mode: currentMasterclassMode
                        })
                    });
                } catch (e) {
                    console.error("Payment notification error", e);
                }

                closePaymentModal();
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;

                // Ping AppScript to mark whatsapp clicked
                fetch(`${APPS_SCRIPT_WEBAPP_URL}?action=whatsapp&orderId=${response.razorpay_order_id || orderId}`).catch(() => {});

                // Direct redirect to WhatsApp
                const isOffline = currentMasterclassMode === 'offline' || selectedPlan === 4999;
                const msgText = isOffline
                  ? "Hello Tech Tycoon Team I successfully complete the registration claude masterclass offline session"
                  : "Hello Tech Tycoon Team I successfully complete the registration of claude masterclass online session";
                const waMessage = encodeURIComponent(msgText);
                window.location.href = `https://wa.me/917010340494?text=${waMessage}`;
            },
            modal: {
                ondismiss: function () {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }
            }
        };

        if (orderId && orderId.startsWith("order_")) {
            options.order_id = orderId;
        }

        const rzp = new Razorpay(options);
        rzp.open();

    } catch (err) {
        console.error(err);
        alert('Error initiating checkout. Please try again.');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

/* Master pre-sorted A-Z Country List */
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

function toggleCountryDropdown(e) {
  if (e) e.stopPropagation();
  const dropdown = document.getElementById('country-select-dropdown');
  if (!dropdown) return;
  const isHidden = dropdown.style.display === 'none' || !dropdown.style.display;
  dropdown.style.display = isHidden ? 'block' : 'none';
  if (isHidden) {
    const searchInput = document.getElementById('country-search-input');
    if (searchInput) {
      searchInput.value = '';
      filterCountries();
      setTimeout(() => searchInput.focus(), 50);
    }
  }
}

function filterCountries() {
  const query = (document.getElementById('country-search-input')?.value || '').toLowerCase().trim();
  const optionsList = document.getElementById('country-options-list');
  const selectedCode = document.getElementById('cust-country-code')?.value || '+91';
  if (!optionsList) return;

  const filtered = ALL_COUNTRIES.filter(item => 
    item.name.toLowerCase().includes(query) || item.code.toLowerCase().includes(query)
  );

  if (filtered.length === 0) {
    optionsList.innerHTML = '<div style="padding: 10px 12px; font-size: 11px; color: #A09C94;">No countries found</div>';
    return;
  }

  optionsList.innerHTML = filtered.map(item => {
    const isSelected = item.code === selectedCode;
    return `<div onclick="selectCountryItem('${item.code}', '${item.flag} ${item.code}')" style="padding: 8px 12px; font-size: 12px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #F7F4EE; transition: background 0.15s; ${isSelected ? 'background: #F7F4EE; font-weight: 700; color: #D85A30;' : 'color: #1F1E1C;'}" onmouseover="this.style.background='#F7F4EE'" onmouseout="this.style.background='${isSelected ? '#F7F4EE' : '#ffffff'}'">
      <span>${item.flag} ${item.name}</span>
      <span style="font-weight: 700; color: #6E6B65; font-size: 11px;">${item.code}</span>
    </div>`;
  }).join('');
}

function selectCountryItem(code, label) {
  const hiddenInput = document.getElementById('cust-country-code');
  const labelSpan = document.getElementById('selected-country-label');
  const dropdown = document.getElementById('country-select-dropdown');
  if (hiddenInput) hiddenInput.value = code;
  if (labelSpan) labelSpan.textContent = label;
  if (dropdown) dropdown.style.display = 'none';
}

document.addEventListener('click', function(e) {
  const container = document.getElementById('country-select-container');
  const dropdown = document.getElementById('country-select-dropdown');
  if (container && dropdown && !container.contains(e.target)) {
    dropdown.style.display = 'none';
  }
});

document.addEventListener('DOMContentLoaded', function () {
    // Promo Code Apply Logic
    const promoApplyBtn = document.getElementById('promo-apply-btn');
    const promoInput = document.getElementById('cust-promo');
    const promoMsg = document.getElementById('promo-message');

    if (promoApplyBtn && promoInput && promoMsg) {
        promoApplyBtn.addEventListener('click', async function () {
            const rawVal = promoInput.value.trim().toUpperCase();
            if (rawVal === "CLAUDE" || rawVal === "") {
                appliedPromo = "CLAUDE";
                discountPercent = 10;
                promoMsg.style.display = "block";
                promoMsg.style.color = "#10b981"; // success green
                promoMsg.innerText = "CLAUDE code applied! 10% discount matches. 🎉";
            } else if (promoCodes30.includes(rawVal)) {
                promoMsg.style.display = "block";
                promoMsg.style.color = "#8e8a83";
                promoMsg.innerText = "Validating code...";
                
                try {
                    const res = await fetch(`${APPS_SCRIPT_WEBAPP_URL}?action=checkPromo&code=${rawVal}`);
                    const data = await res.json();
                    if (data.valid) {
                        appliedPromo = rawVal;
                        discountPercent = 30;
                        promoMsg.style.color = "#10b981"; // success green
                        promoMsg.innerText = "Promo code applied! 30% discount matches. 🎉";
                    } else {
                        promoMsg.style.color = "#ef4444"; // error red
                        promoMsg.innerText = "This unique promo code has already been used.";
                        appliedPromo = "CLAUDE";
                        discountPercent = 0;
                    }
                } catch (err) {
                    console.error("Promo validation error, using local fallback", err);
                    appliedPromo = rawVal;
                    discountPercent = 30;
                    promoMsg.style.color = "#10b981"; // success green
                    promoMsg.innerText = "Promo code applied! 30% discount matches. 🎉";
                }
            } else {
                promoMsg.style.display = "block";
                promoMsg.style.color = "#ef4444"; // error red
                promoMsg.innerText = "Invalid promo code.";
                appliedPromo = "CLAUDE";
                discountPercent = 0;
            }
            
            // Recalculate and update the price UI display
            const finalPrice = getFinalPrice();
            document.getElementById('btn-fee-display').innerText = `₹${finalPrice}`;
            document.getElementById('form-fee-display').innerText = `₹${finalPrice} INR`;
        });
    }

    // Email Input Listener for dynamic ₹1 test price
    const emailInput = document.getElementById('cust-email');
    if (emailInput) {
        emailInput.addEventListener('input', function() {
            const finalPrice = getFinalPrice();
            document.getElementById('btn-fee-display').innerText = `₹${finalPrice}`;
            document.getElementById('form-fee-display').innerText = `₹${finalPrice} INR`;
            const mobPrice = document.getElementById('mobile-pass-price');
            if (mobPrice) mobPrice.innerText = `₹${finalPrice} INR`;
        });
    }




    // Add .reveal to all section headings, cards, and key blocks
    const revealSelectors = [
        '.section-title', '.section-heading',
        '.curriculum-item', '.feature-card',
        '.pricing-card', '.testimonial-card',
        '.faq-item', '.instructor-card',
        '.stats-row', '.trust-block',
        '.credibility-section', '.section-header'
    ];

    revealSelectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => {
            el.classList.add('reveal');
        });
    });

    // Add stagger to grid containers
    document.querySelectorAll('.curriculum-grid, .features-grid, .pricing-grid').forEach(grid => {
        grid.classList.add('reveal-stagger');
        grid.querySelectorAll(':scope > *').forEach(child => {
            child.classList.add('reveal');
        });
    });

    // IntersectionObserver — trigger .visible when in viewport
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Animate section heading underline
                if (entry.target.classList.contains('section-heading') ||
                    entry.target.classList.contains('section-title')) {
                    entry.target.classList.add('visible');
                }
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    });

    document.querySelectorAll('.reveal').forEach(el => {
        revealObserver.observe(el);
    });

    // 3. Countdown tick animation on seconds change
    let lastSec = null;
    const secEl = document.getElementById('cd-secs');
    if (secEl) {
        const tickObserver = new MutationObserver(() => {
            secEl.closest('.timer-block')?.classList.remove('tick');
            void secEl.closest('.timer-block')?.offsetWidth; // reflow
            secEl.closest('.timer-block')?.classList.add('tick');
        });
        tickObserver.observe(secEl, { childList: true, subtree: true, characterData: true });
    }

    // 4. Smooth number count-up for trust stats
    function countUp(el, target, duration) {
        let start = 0;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
            start += step;
            if (start >= target) { start = target; clearInterval(timer); }
            el.textContent = Math.floor(start).toLocaleString() + '+';
        }, 16);
    }

    const statObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const raw = el.dataset.count;
                if (raw) countUp(el, parseInt(raw), 1200);
                statObserver.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('[data-count]').forEach(el => statObserver.observe(el));
});

