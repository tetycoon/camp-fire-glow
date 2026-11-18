/**
 * ============================================================================
 * TECH TYCOON — ULTIMATE CLAUDE RESOURCES REGISTRATION & RAZORPAY INTEGRATION
 * Features:
 * - Direct "Register Now" modal trigger on all CTAs
 * - Dynamic "AMIABLE" Coupon validation (Original ₹999 -> ₹499 with coupon)
 * - Automatic Lead & Payment logging to Google Sheets via Google Apps Script
 * - Direct Razorpay Checkout integration with Dual Live Keys
 * ============================================================================
 */
(function () {
  'use strict';

  var C = window.SITE_CONFIG || {};
  var appsScriptUrl = C.appsScriptUrl || 'https://script.google.com/macros/s/AKfycbzeQMzCoZPEhQerWG7nXH1k5l7t2StVkjubTIvoqUjvEQJW3Sh_dSS6dkgARGbpHnobkQ/exec';

  var ORIGINAL_PRICE = C.originalPrice || 999;
  var DISCOUNTED_PRICE = C.price || 499;
  var COUPON_DISCOUNT = C.couponDiscount || (ORIGINAL_PRICE - DISCOUNTED_PRICE);
  var VALID_COUPON = (C.couponCode || 'AMIABLE').toUpperCase();
  var CHATGPT_ADDON_PRICE = 400;

  var AUTHORIZED_TEST_EMAILS = [
    'ambroseselva001@gmail.com',
    'techtycoondigitalsolutions@gmail.com',
    'techtycoondigitors@gmail.com'
  ];

  var currentPayable = DISCOUNTED_PRICE;
  var currentCouponApplied = true;

  // DOM Elements - Registration Dialog
  var regDialog = document.getElementById('reg-dialog');
  var regForm = document.getElementById('reg-form');
  var regName = document.getElementById('reg-name');
  var regEmail = document.getElementById('reg-email');
  var regPhone = document.getElementById('reg-phone');
  var regCountryCode = document.getElementById('reg-country-code');
  var regCoupon = document.getElementById('reg-coupon');
  var regCouponBtn = document.getElementById('reg-coupon-btn');
  var regCouponMsg = document.getElementById('reg-coupon-msg');
  var regDiscountBadge = document.getElementById('reg-discount-badge');
  var regDiscountRow = document.getElementById('reg-discount-row');
  var regDiscountAmount = document.getElementById('reg-discount-amount');
  var regAddonRow = document.getElementById('reg-addon-row');
  var regAddonChatgpt = document.getElementById('reg-addon-chatgpt');
  var addonChatgptCard = document.getElementById('addon-chatgpt-card');
  var regFinalPrice = document.getElementById('reg-final-price');
  var btnPriceDisplay = document.getElementById('btn-price-display');
  var regSubmitBtn = document.getElementById('reg-submit-btn');
  var regCloseBtn = document.getElementById('reg-dialog-close');

  // DOM Elements - Status Dialog (Success / Failure)
  var payDialog = document.getElementById('pay-dialog');
  var statusEls = payDialog ? {
    icon: payDialog.querySelector('[data-pay-icon]'),
    title: document.getElementById('pay-title'),
    msg: document.getElementById('pay-msg'),
    ref: payDialog.querySelector('[data-pay-ref]'),
    retry: payDialog.querySelector('[data-pay-retry]'),
    help: payDialog.querySelector('[data-pay-help]'),
    close: payDialog.querySelector('[data-pay-close]')
  } : null;

  var ICONS = { success: 'i-check', failed: 'i-alert', pending: 'i-once', cancelled: 'i-once' };

  // ---- Searchable Country Code Picker (All Countries) -----------------------
  var COUNTRY_CODES = [
    { code: '+91', name: 'India', iso: 'IN', flag: '🇮🇳' },
    { code: '+1', name: 'United States', iso: 'US', flag: '🇺🇸' },
    { code: '+44', name: 'United Kingdom', iso: 'GB', flag: '🇬🇧' },
    { code: '+971', name: 'UAE (United Arab Emirates)', iso: 'AE', flag: '🇦🇪' },
    { code: '+65', name: 'Singapore', iso: 'SG', flag: '🇸🇬' },
    { code: '+61', name: 'Australia', iso: 'AU', flag: '🇦🇺' },
    { code: '+1', name: 'Canada', iso: 'CA', flag: '🇨🇦' },
    { code: '+49', name: 'Germany', iso: 'DE', flag: '🇩🇪' },
    { code: '+93', name: 'Afghanistan', iso: 'AF', flag: '🇦🇫' },
    { code: '+355', name: 'Albania', iso: 'AL', flag: '🇦🇱' },
    { code: '+213', name: 'Algeria', iso: 'DZ', flag: '🇩🇿' },
    { code: '+376', name: 'Andorra', iso: 'AD', flag: '🇦🇩' },
    { code: '+244', name: 'Angola', iso: 'AO', flag: '🇦🇴' },
    { code: '+54', name: 'Argentina', iso: 'AR', flag: '🇦🇷' },
    { code: '+374', name: 'Armenia', iso: 'AM', flag: '🇦🇲' },
    { code: '+43', name: 'Austria', iso: 'AT', flag: '🇦🇹' },
    { code: '+994', name: 'Azerbaijan', iso: 'AZ', flag: '🇦🇿' },
    { code: '+973', name: 'Bahrain', iso: 'BH', flag: '🇧🇭' },
    { code: '+880', name: 'Bangladesh', iso: 'BD', flag: '🇧🇩' },
    { code: '+375', name: 'Belarus', iso: 'BY', flag: '🇧🇾' },
    { code: '+32', name: 'Belgium', iso: 'BE', flag: '🇧🇪' },
    { code: '+501', name: 'Belize', iso: 'BZ', flag: '🇧🇿' },
    { code: '+229', name: 'Benin', iso: 'BJ', flag: '🇧🇯' },
    { code: '+975', name: 'Bhutan', iso: 'BT', flag: '🇧🇹' },
    { code: '+591', name: 'Bolivia', iso: 'BO', flag: '🇧🇴' },
    { code: '+387', name: 'Bosnia', iso: 'BA', flag: '🇧🇦' },
    { code: '+267', name: 'Botswana', iso: 'BW', flag: '🇧🇼' },
    { code: '+55', name: 'Brazil', iso: 'BR', flag: '🇧🇷' },
    { code: '+673', name: 'Brunei', iso: 'BN', flag: '🇧🇳' },
    { code: '+359', name: 'Bulgaria', iso: 'BG', flag: '🇧🇬' },
    { code: '+226', name: 'Burkina Faso', iso: 'BF', flag: '🇧🇫' },
    { code: '+257', name: 'Burundi', iso: 'BI', flag: '🇧🇮' },
    { code: '+855', name: 'Cambodia', iso: 'KH', flag: '🇰🇭' },
    { code: '+237', name: 'Cameroon', iso: 'CM', flag: '🇨🇲' },
    { code: '+238', name: 'Cape Verde', iso: 'CV', flag: '🇨🇻' },
    { code: '+236', name: 'Central African Republic', iso: 'CF', flag: '🇨🇫' },
    { code: '+235', name: 'Chad', iso: 'TD', flag: '🇹🇩' },
    { code: '+56', name: 'Chile', iso: 'CL', flag: '🇨🇱' },
    { code: '+86', name: 'China', iso: 'CN', flag: '🇨🇳' },
    { code: '+57', name: 'Colombia', iso: 'CO', flag: '🇨🇴' },
    { code: '+269', name: 'Comoros', iso: 'KM', flag: '🇰🇲' },
    { code: '+242', name: 'Congo', iso: 'CG', flag: '🇨🇬' },
    { code: '+243', name: 'Congo DR', iso: 'CD', flag: '🇨🇩' },
    { code: '+506', name: 'Costa Rica', iso: 'CR', flag: '🇨🇷' },
    { code: '+385', name: 'Croatia', iso: 'HR', flag: '🇭🇷' },
    { code: '+53', name: 'Cuba', iso: 'CU', flag: '🇨🇺' },
    { code: '+357', name: 'Cyprus', iso: 'CY', flag: '🇨🇾' },
    { code: '+420', name: 'Czech Republic', iso: 'CZ', flag: '🇨🇿' },
    { code: '+45', name: 'Denmark', iso: 'DK', flag: '🇩🇰' },
    { code: '+253', name: 'Djibouti', iso: 'DJ', flag: '🇩🇯' },
    { code: '+593', name: 'Ecuador', iso: 'EC', flag: '🇪🇨' },
    { code: '+20', name: 'Egypt', iso: 'EG', flag: '🇪🇬' },
    { code: '+503', name: 'El Salvador', iso: 'SV', flag: '🇸🇻' },
    { code: '+240', name: 'Equatorial Guinea', iso: 'GQ', flag: '🇬🇶' },
    { code: '+291', name: 'Eritrea', iso: 'ER', flag: '🇪🇷' },
    { code: '+372', name: 'Estonia', iso: 'EE', flag: '🇪🇪' },
    { code: '+251', name: 'Ethiopia', iso: 'ET', flag: '🇪🇹' },
    { code: '+679', name: 'Fiji', iso: 'FJ', flag: '🇫🇯' },
    { code: '+358', name: 'Finland', iso: 'FI', flag: '🇫🇮' },
    { code: '+33', name: 'France', iso: 'FR', flag: '🇫🇷' },
    { code: '+241', name: 'Gabon', iso: 'GA', flag: '🇬🇦' },
    { code: '+220', name: 'Gambia', iso: 'GM', flag: '🇬🇲' },
    { code: '+995', name: 'Georgia', iso: 'GE', flag: '🇬🇪' },
    { code: '+233', name: 'Ghana', iso: 'GH', flag: '🇬🇭' },
    { code: '+30', name: 'Greece', iso: 'GR', flag: '🇬🇷' },
    { code: '+502', name: 'Guatemala', iso: 'GT', flag: '🇬🇹' },
    { code: '+224', name: 'Guinea', iso: 'GN', flag: '🇬🇳' },
    { code: '+592', name: 'Guyana', iso: 'GY', flag: '🇬🇾' },
    { code: '+509', name: 'Haiti', iso: 'HT', flag: '🇭🇹' },
    { code: '+504', name: 'Honduras', iso: 'HN', flag: '🇭🇳' },
    { code: '+852', name: 'Hong Kong', iso: 'HK', flag: '🇭🇰' },
    { code: '+36', name: 'Hungary', iso: 'HU', flag: '🇭🇺' },
    { code: '+354', name: 'Iceland', iso: 'IS', flag: '🇮🇸' },
    { code: '+62', name: 'Indonesia', iso: 'ID', flag: '🇮🇩' },
    { code: '+98', name: 'Iran', iso: 'IR', flag: '🇮🇷' },
    { code: '+964', name: 'Iraq', iso: 'IQ', flag: '🇮🇶' },
    { code: '+353', name: 'Ireland', iso: 'IE', flag: '🇮🇪' },
    { code: '+972', name: 'Israel', iso: 'IL', flag: '🇮🇱' },
    { code: '+39', name: 'Italy', iso: 'IT', flag: '🇮🇹' },
    { code: '+225', name: 'Ivory Coast', iso: 'CI', flag: '🇨🇮' },
    { code: '+1876', name: 'Jamaica', iso: 'JM', flag: '🇯🇲' },
    { code: '+81', name: 'Japan', iso: 'JP', flag: '🇯🇵' },
    { code: '+962', name: 'Jordan', iso: 'JO', flag: '🇯🇴' },
    { code: '+7', name: 'Kazakhstan', iso: 'KZ', flag: '🇰🇿' },
    { code: '+254', name: 'Kenya', iso: 'KE', flag: '🇰🇪' },
    { code: '+965', name: 'Kuwait', iso: 'KW', flag: '🇰🇼' },
    { code: '+996', name: 'Kyrgyzstan', iso: 'KG', flag: '🇰🇬' },
    { code: '+856', name: 'Laos', iso: 'LA', flag: '🇱🇦' },
    { code: '+371', name: 'Latvia', iso: 'LV', flag: '🇱🇻' },
    { code: '+961', name: 'Lebanon', iso: 'LB', flag: '🇱🇧' },
    { code: '+266', name: 'Lesotho', iso: 'LS', flag: '🇱🇸' },
    { code: '+231', name: 'Liberia', iso: 'LR', flag: '🇱🇷' },
    { code: '+218', name: 'Libya', iso: 'LY', flag: '🇱🇾' },
    { code: '+423', name: 'Liechtenstein', iso: 'LI', flag: '🇱🇮' },
    { code: '+370', name: 'Lithuania', iso: 'LT', flag: '🇱🇹' },
    { code: '+352', name: 'Luxembourg', iso: 'LU', flag: '🇱🇺' },
    { code: '+853', name: 'Macau', iso: 'MO', flag: '🇲🇴' },
    { code: '+261', name: 'Madagascar', iso: 'MG', flag: '🇲🇬' },
    { code: '+265', name: 'Malawi', iso: 'MW', flag: '🇲🇼' },
    { code: '+60', name: 'Malaysia', iso: 'MY', flag: '🇲🇾' },
    { code: '+960', name: 'Maldives', iso: 'MV', flag: '🇲🇻' },
    { code: '+223', name: 'Mali', iso: 'ML', flag: '🇲🇱' },
    { code: '+356', name: 'Malta', iso: 'MT', flag: '🇲🇹' },
    { code: '+222', name: 'Mauritania', iso: 'MR', flag: '🇲🇷' },
    { code: '+230', name: 'Mauritius', iso: 'MU', flag: '🇲🇺' },
    { code: '+52', name: 'Mexico', iso: 'MX', flag: '🇲🇽' },
    { code: '+373', name: 'Moldova', iso: 'MD', flag: '🇲🇩' },
    { code: '+377', name: 'Monaco', iso: 'MC', flag: '🇲🇨' },
    { code: '+976', name: 'Mongolia', iso: 'MN', flag: '🇲🇳' },
    { code: '+382', name: 'Montenegro', iso: 'ME', flag: '🇲🇪' },
    { code: '+212', name: 'Morocco', iso: 'MA', flag: '🇲🇦' },
    { code: '+258', name: 'Mozambique', iso: 'MZ', flag: '🇲🇿' },
    { code: '+95', name: 'Myanmar', iso: 'MM', flag: '🇲🇲' },
    { code: '+264', name: 'Namibia', iso: 'NA', flag: '🇳🇦' },
    { code: '+977', name: 'Nepal', iso: 'NP', flag: '🇳🇵' },
    { code: '+31', name: 'Netherlands', iso: 'NL', flag: '🇳🇱' },
    { code: '+64', name: 'New Zealand', iso: 'NZ', flag: '🇳🇿' },
    { code: '+505', name: 'Nicaragua', iso: 'NI', flag: '🇳🇮' },
    { code: '+227', name: 'Niger', iso: 'NE', flag: '🇳🇪' },
    { code: '+234', name: 'Nigeria', iso: 'NG', flag: '🇳🇬' },
    { code: '+850', name: 'North Korea', iso: 'KP', flag: '🇰🇵' },
    { code: '+389', name: 'North Macedonia', iso: 'MK', flag: '🇲🇰' },
    { code: '+47', name: 'Norway', iso: 'NO', flag: '🇳🇴' },
    { code: '+968', name: 'Oman', iso: 'OM', flag: '🇴🇲' },
    { code: '+92', name: 'Pakistan', iso: 'PK', flag: '🇵🇰' },
    { code: '+970', name: 'Palestine', iso: 'PS', flag: '🇵🇸' },
    { code: '+507', name: 'Panama', iso: 'PA', flag: '🇵🇦' },
    { code: '+675', name: 'Papua New Guinea', iso: 'PG', flag: '🇵🇬' },
    { code: '+595', name: 'Paraguay', iso: 'PY', flag: '🇵🇾' },
    { code: '+51', name: 'Peru', iso: 'PE', flag: '🇵🇪' },
    { code: '+63', name: 'Philippines', iso: 'PH', flag: '🇵🇭' },
    { code: '+48', name: 'Poland', iso: 'PL', flag: '🇵🇱' },
    { code: '+351', name: 'Portugal', iso: 'PT', flag: '🇵🇹' },
    { code: '+974', name: 'Qatar', iso: 'QA', flag: '🇶🇦' },
    { code: '+40', name: 'Romania', iso: 'RO', flag: '🇷🇴' },
    { code: '+7', name: 'Russia', iso: 'RU', flag: '🇷🇺' },
    { code: '+250', name: 'Rwanda', iso: 'RW', flag: '🇷🇼' },
    { code: '+966', name: 'Saudi Arabia', iso: 'SA', flag: '🇸🇦' },
    { code: '+221', name: 'Senegal', iso: 'SN', flag: '🇸🇳' },
    { code: '+381', name: 'Serbia', iso: 'RS', flag: '🇷🇸' },
    { code: '+232', name: 'Sierra Leone', iso: 'SL', flag: '🇸🇱' },
    { code: '+421', name: 'Slovakia', iso: 'SK', flag: '🇸🇰' },
    { code: '+386', name: 'Slovenia', iso: 'SI', flag: '🇸🇮' },
    { code: '+252', name: 'Somalia', iso: 'SO', flag: '🇸🇴' },
    { code: '+27', name: 'South Africa', iso: 'ZA', flag: '🇿🇦' },
    { code: '+82', name: 'South Korea', iso: 'KR', flag: '🇰🇷' },
    { code: '+211', name: 'South Sudan', iso: 'SS', flag: '🇸🇸' },
    { code: '+34', name: 'Spain', iso: 'ES', flag: '🇪🇸' },
    { code: '+94', name: 'Sri Lanka', iso: 'LK', flag: '🇱🇰' },
    { code: '+249', name: 'Sudan', iso: 'SD', flag: '🇸🇩' },
    { code: '+597', name: 'Suriname', iso: 'SR', flag: '🇸🇷' },
    { code: '+46', name: 'Sweden', iso: 'SE', flag: '🇸🇪' },
    { code: '+41', name: 'Switzerland', iso: 'CH', flag: '🇨🇭' },
    { code: '+963', name: 'Syria', iso: 'SY', flag: '🇸🇾' },
    { code: '+886', name: 'Taiwan', iso: 'TW', flag: '🇹🇼' },
    { code: '+992', name: 'Tajikistan', iso: 'TJ', flag: '🇹🇯' },
    { code: '+255', name: 'Tanzania', iso: 'TZ', flag: '🇹🇿' },
    { code: '+66', name: 'Thailand', iso: 'TH', flag: '🇹🇭' },
    { code: '+228', name: 'Togo', iso: 'TG', flag: '🇹🇬' },
    { code: '+676', name: 'Tonga', iso: 'TO', flag: '🇹🇴' },
    { code: '+1868', name: 'Trinidad & Tobago', iso: 'TT', flag: '🇹🇹' },
    { code: '+216', name: 'Tunisia', iso: 'TN', flag: '🇹🇳' },
    { code: '+90', name: 'Turkey', iso: 'TR', flag: '🇹🇷' },
    { code: '+993', name: 'Turkmenistan', iso: 'TM', flag: '🇹🇲' },
    { code: '+256', name: 'Uganda', iso: 'UG', flag: '🇺🇬' },
    { code: '+380', name: 'Ukraine', iso: 'UA', flag: '🇺🇦' },
    { code: '+598', name: 'Uruguay', iso: 'UY', flag: '🇺🇾' },
    { code: '+998', name: 'Uzbekistan', iso: 'UZ', flag: '🇺🇿' },
    { code: '+58', name: 'Venezuela', iso: 'VE', flag: '🇻🇪' },
    { code: '+84', name: 'Vietnam', iso: 'VN', flag: '🇻🇳' },
    { code: '+967', name: 'Yemen', iso: 'YE', flag: '🇾🇪' },
    { code: '+260', name: 'Zambia', iso: 'ZM', flag: '🇿🇲' },
    { code: '+263', name: 'Zimbabwe', iso: 'ZW', flag: '🇿🇼' }
  ];

  (function initCountryPicker() {
    var picker = document.getElementById('cc-picker');
    var trigger = document.getElementById('reg-country-trigger');
    var dropdown = document.getElementById('reg-country-dropdown');
    var searchInput = document.getElementById('reg-country-search');
    var listEl = document.getElementById('reg-country-list');
    var flagEl = document.getElementById('cc-trigger-flag');
    var codeEl = document.getElementById('cc-trigger-code');
    if (!picker || !trigger || !dropdown || !searchInput || !listEl || !regCountryCode) return;

    var selectedIso = 'IN';
    var filtered = COUNTRY_CODES.slice();
    var activeIndex = 0;

    function selectCountry(c) {
      selectedIso = c.iso;
      regCountryCode.value = c.code;
      if (flagEl) flagEl.textContent = c.flag;
      if (codeEl) codeEl.textContent = c.code;
      if (regPhone) {
        regPhone.placeholder = c.code === '+91' ? '10-digit mobile number' : 'Phone number (without ' + c.code + ')';
      }
      closeDropdown();
      if (regPhone) regPhone.focus();
    }

    function renderList() {
      listEl.innerHTML = '';
      if (!filtered.length) {
        var empty = document.createElement('li');
        empty.className = 'cc-empty';
        empty.textContent = 'No matching country found';
        listEl.appendChild(empty);
        return;
      }
      filtered.forEach(function (c, idx) {
        var li = document.createElement('li');
        li.className = 'cc-item' +
          (c.iso === selectedIso ? ' is-selected' : '') +
          (idx === activeIndex ? ' is-active' : '');
        li.setAttribute('role', 'option');
        li.setAttribute('aria-selected', c.iso === selectedIso ? 'true' : 'false');
        li.innerHTML =
          '<span class="cc-item-flag">' + c.flag + '</span>' +
          '<span class="cc-item-name"></span>' +
          '<span class="cc-item-code">' + c.code + '</span>';
        li.querySelector('.cc-item-name').textContent = c.name;
        li.addEventListener('mousedown', function (ev) {
          ev.preventDefault();
          selectCountry(c);
        });
        listEl.appendChild(li);
      });
    }

    function filterCountries(query) {
      var q = String(query || '').trim().toLowerCase();
      var qDigits = q.replace(/^\+/, '');
      if (!q) {
        filtered = COUNTRY_CODES.slice();
      } else {
        // Prioritize starts-with matches, then substring matches across name, ISO, or dial code
        var starts = [];
        var contains = [];
        COUNTRY_CODES.forEach(function (c) {
          var nameL = c.name.toLowerCase();
          var isoL = c.iso.toLowerCase();
          var codeL = c.code.toLowerCase();
          var codeNoPlus = codeL.replace(/^\+/, '');
          if (nameL.indexOf(q) === 0 || isoL === q || codeL.indexOf(q) === 0 || (qDigits && codeNoPlus.indexOf(qDigits) === 0)) {
            starts.push(c);
          } else if (nameL.indexOf(q) !== -1 || isoL.indexOf(q) !== -1 || codeL.indexOf(q) !== -1) {
            contains.push(c);
          }
        });
        filtered = starts.concat(contains);
      }
      activeIndex = 0;
      renderList();
    }

    function openDropdown() {
      dropdown.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
      searchInput.value = '';
      filterCountries('');
      setTimeout(function () { searchInput.focus(); }, 10);
    }

    function closeDropdown() {
      dropdown.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
    }

    trigger.addEventListener('click', function (ev) {
      ev.stopPropagation();
      if (dropdown.hidden) openDropdown();
      else closeDropdown();
    });

    searchInput.addEventListener('input', function () {
      filterCountries(searchInput.value);
    });

    searchInput.addEventListener('keydown', function (ev) {
      if (ev.key === 'ArrowDown') {
        ev.preventDefault();
        if (activeIndex < filtered.length - 1) {
          activeIndex++;
          renderList();
          var act = listEl.querySelector('.cc-item.is-active');
          if (act) act.scrollIntoView({ block: 'nearest' });
        }
      } else if (ev.key === 'ArrowUp') {
        ev.preventDefault();
        if (activeIndex > 0) {
          activeIndex--;
          renderList();
          var actUp = listEl.querySelector('.cc-item.is-active');
          if (actUp) actUp.scrollIntoView({ block: 'nearest' });
        }
      } else if (ev.key === 'Enter') {
        ev.preventDefault();
        if (filtered[activeIndex]) selectCountry(filtered[activeIndex]);
      } else if (ev.key === 'Escape') {
        ev.preventDefault();
        closeDropdown();
        trigger.focus();
      }
    });

    document.addEventListener('click', function (ev) {
      if (!dropdown.hidden && !picker.contains(ev.target)) {
        closeDropdown();
      }
    });
  })();

  // ---- Price & Coupon Evaluation Logic ---------------------------------------------
  function evaluatePrice() {
    var basePrice = ORIGINAL_PRICE;
    var entered = regCoupon ? regCoupon.value.trim().toUpperCase() : '';

    if (entered === VALID_COUPON) {
      basePrice = DISCOUNTED_PRICE;
      currentCouponApplied = true;
      if (regDiscountBadge) {
        regDiscountBadge.style.display = 'inline';
        regDiscountBadge.textContent = '⚡ Save ₹' + COUPON_DISCOUNT + ' (' + VALID_COUPON + ')';
      }
      if (regDiscountRow) regDiscountRow.style.display = 'flex';
      if (regDiscountAmount) regDiscountAmount.textContent = '-₹' + COUPON_DISCOUNT;
      if (regCouponMsg) {
        regCouponMsg.className = 'coupon-msg-inline success is-visible';
        regCouponMsg.textContent = '✓ ₹' + COUPON_DISCOUNT + ' OFF';
      }
    } else if (entered === '') {
      basePrice = ORIGINAL_PRICE;
      currentCouponApplied = false;
      if (regDiscountBadge) {
        regDiscountBadge.style.display = 'none';
      }
      if (regDiscountRow) regDiscountRow.style.display = 'none';
      if (regCouponMsg) {
        regCouponMsg.className = 'coupon-msg-inline';
        regCouponMsg.textContent = '';
      }
    } else {
      basePrice = ORIGINAL_PRICE;
      currentCouponApplied = false;
      if (regDiscountBadge) {
        regDiscountBadge.style.display = 'none';
      }
      if (regDiscountRow) regDiscountRow.style.display = 'none';
      if (regCouponMsg) {
        regCouponMsg.className = 'coupon-msg-inline error is-visible';
        regCouponMsg.textContent = '✕ Invalid';
      }
    }

    var isAddonChecked = regAddonChatgpt && regAddonChatgpt.checked;
    var addonCost = isAddonChecked ? CHATGPT_ADDON_PRICE : 0;
    currentPayable = basePrice + addonCost;

    if (regAddonRow) {
      regAddonRow.style.display = isAddonChecked ? 'flex' : 'none';
    }
    if (addonChatgptCard) {
      if (isAddonChecked) {
        addonChatgptCard.classList.add('is-selected');
      } else {
        addonChatgptCard.classList.remove('is-selected');
      }
    }

    // Authorized live test user overrides price to ₹1 for test workflow
    var emailVal = regEmail ? regEmail.value.trim().toLowerCase() : '';
    if (emailVal && AUTHORIZED_TEST_EMAILS.indexOf(emailVal) !== -1) {
      currentPayable = 1;
      if (regDiscountBadge) {
        regDiscountBadge.style.display = 'inline';
        regDiscountBadge.textContent = '⚡ Authorized Test Mode (₹1 Payment)';
      }
      if (regDiscountRow) regDiscountRow.style.display = 'none';
    }

    if (regFinalPrice) regFinalPrice.textContent = '₹' + currentPayable;
    if (btnPriceDisplay) btnPriceDisplay.textContent = '₹' + currentPayable;
  }

  if (regEmail) {
    regEmail.addEventListener('input', evaluatePrice);
    regEmail.addEventListener('blur', evaluatePrice);
    regEmail.addEventListener('change', evaluatePrice);
  }

  if (regCouponBtn) {
    regCouponBtn.addEventListener('click', function (e) {
      e.preventDefault();
      evaluatePrice();
    });
  }

  if (regCoupon) {
    regCoupon.addEventListener('input', evaluatePrice);
    regCoupon.addEventListener('blur', evaluatePrice);
  }

  if (regAddonChatgpt) {
    regAddonChatgpt.addEventListener('change', evaluatePrice);
  }

  // ---- Open & Close Modal --------------------------------------------------
  window.openRegisterModal = function () {
    if (!regDialog) return;
    clearErrors();
    evaluatePrice();
    if (typeof regDialog.showModal === 'function') {
      regDialog.showModal();
    } else {
      regDialog.setAttribute('open', '');
    }
    if (regName) regName.focus();
  };

  function closeRegisterModal() {
    if (!regDialog) return;
    if (typeof regDialog.close === 'function') {
      regDialog.close();
    } else {
      regDialog.removeAttribute('open');
    }
  }

  if (regCloseBtn) {
    regCloseBtn.addEventListener('click', closeRegisterModal);
  }

  if (regDialog) {
    regDialog.addEventListener('click', function (e) {
      if (e.target === regDialog) closeRegisterModal();
    });
  }

  // ---- Form Validation Helpers ---------------------------------------------
  function clearErrors() {
    var errs = ['err-name', 'err-email', 'err-phone'];
    errs.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.textContent = '';
    });
  }

  function validateForm() {
    clearErrors();
    var isValid = true;

    var nameVal = regName ? regName.value.trim() : '';
    if (!nameVal || nameVal.length < 2) {
      document.getElementById('err-name').textContent = 'Please enter your full name.';
      isValid = false;
    }

    var emailVal = regEmail ? regEmail.value.trim().toLowerCase() : '';
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailVal || !emailRegex.test(emailVal)) {
      document.getElementById('err-email').textContent = 'Please enter a valid email address.';
      isValid = false;
    }

    var phoneVal = regPhone ? regPhone.value.trim().replace(/\D/g, '') : '';
    var codeVal = regCountryCode ? regCountryCode.value : '+91';
    if (codeVal === '+91' && phoneVal.length !== 10) {
      document.getElementById('err-phone').textContent = 'Please enter a valid 10-digit mobile number.';
      isValid = false;
    } else if (phoneVal.length < 7) {
      document.getElementById('err-phone').textContent = 'Please enter a valid phone number.';
      isValid = false;
    }

    return isValid;
  }

  function resetSubmitBtn() {
    if (!regSubmitBtn) return;
    regSubmitBtn.disabled = false;
    regSubmitBtn.innerHTML = 'Proceed to Payment — <span id="btn-price-display">₹' + currentPayable + '</span>';
  }

  // ---- Status Dialog Helper ------------------------------------------------
  function showStatusDialog(state, title, msg, opts) {
    if (!payDialog || !statusEls) return;
    opts = opts || {};
    payDialog.className = 'pay-dialog is-' + state;
    if (statusEls.icon) {
      statusEls.icon.innerHTML = ICONS[state]
        ? '<svg aria-hidden="true"><use href="#' + ICONS[state] + '"/></svg>'
        : '<span class="pay-spinner" aria-hidden="true"></span>';
    }
    if (statusEls.title) statusEls.title.textContent = title;
    if (statusEls.msg) statusEls.msg.textContent = msg;

    var ref = [opts.paymentId && 'Payment ID: ' + opts.paymentId, opts.orderId && 'Order ID: ' + opts.orderId]
      .filter(Boolean).join('\n');
    if (statusEls.ref) {
      statusEls.ref.textContent = ref;
      statusEls.ref.hidden = !ref;
    }
    if (statusEls.retry) statusEls.retry.hidden = !opts.retry;
    if (statusEls.help) {
      statusEls.help.hidden = !opts.help;
      if (opts.help) {
        var text = 'Hello! I need help with my Claude Resources enrollment.' + (ref ? '\n' + ref : '');
        var num = (C.whatsapp && C.whatsapp.number) || '917558133039';
        statusEls.help.href = 'https://wa.me/' + num + '?text=' + encodeURIComponent(text);
      }
    }
    if (statusEls.close) statusEls.close.hidden = false;

    if (typeof payDialog.showModal === 'function' && !payDialog.open) {
      payDialog.showModal();
    }
  }

  if (statusEls && statusEls.close) {
    statusEls.close.addEventListener('click', function () { payDialog.close(); });
  }
  if (statusEls && statusEls.retry) {
    statusEls.retry.addEventListener('click', function () {
      payDialog.close();
      window.openRegisterModal();
    });
  }

  // ---- Form Submission & Payment Processing --------------------------------
  if (regForm) {
    regForm.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (!validateForm()) return;

      var nameVal = regName.value.trim();
      var emailVal = regEmail.value.trim().toLowerCase();
      var phoneDigits = regPhone.value.trim().replace(/\D/g, '');
      var countryCode = regCountryCode ? regCountryCode.value : '+91';
      var fullPhone = countryCode + ' ' + phoneDigits;
      var appliedCouponText = currentCouponApplied ? VALID_COUPON : (regCoupon.value.trim().toUpperCase() || 'NONE');
      var isAddonSelected = !!(regAddonChatgpt && regAddonChatgpt.checked);
      var addonText = isAddonSelected ? 'Yes - ChatGPT Hacks (+₹400)' : 'No';
      var productName = isAddonSelected ? 'Ultimate Claude Skills + ChatGPT Hacks Bundle' : 'Ultimate Claude Skills';

      // Set button to loading
      regSubmitBtn.disabled = true;
      regSubmitBtn.innerHTML = '<span class="pay-spinner" style="width:16px;height:16px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:8px;"></span> Connecting to Payment...';

      // 1. Create official Razorpay Order via Google Apps Script
      var leadPayload = {
        name: nameVal,
        email: emailVal,
        phone: fullPhone,
        countryCode: countryCode,
        amount: currentPayable,
        coupon: appliedCouponText,
        addon: addonText,
        hasPdfMaterial: isAddonSelected ? 'YES' : 'NO',
        course: isAddonSelected ? '250+ Ultimate Claude Skills + ChatGPT Hacks' : '250+ Ultimate Claude Skills',
        batch: 'Claude Resources' + (isAddonSelected ? ' (+ ChatGPT Hacks)' : ''),
        pageUrl: window.location.href,
        userAgent: navigator.userAgent
      };

      fetch(appsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(leadPayload)
      })
      .then(function (res) { return res.json(); })
      .then(function (result) {
        if (!result || !result.success || !result.orderId) {
          alert('Payment initiation failed: ' + ((result && result.error) || 'Could not create order. Please try again or contact +91 7558133039'));
          resetSubmitBtn();
          return;
        }

        // 2. Launch Razorpay Checkout with the official server-side order_id
        if (typeof window.Razorpay !== 'function') {
          alert('Razorpay payment gateway is still loading. Please check your internet connection and try again.');
          resetSubmitBtn();
          return;
        }

        var isIntl = countryCode !== '+91';
        var rzpKey = (result && result.razorpayKeyId)
          ? result.razorpayKeyId
          : (isIntl ? (C.razorpayKeyIntl || 'rzp_live_gfoS1OjC8tvWjP') : (C.razorpayKeyIn || 'rzp_live_T2CbVONQc6qrqj'));

        var rzpOptions = {
          key: rzpKey,
          order_id: result.orderId,
          amount: currentPayable * 100, // paise
          currency: 'INR',
          name: 'TechTycoon',
          description: (isAddonSelected ? 'Claude Skills + ChatGPT Hacks' : '250+ Ultimate Claude Skills'),
          image: 'https://course.techtycoon.in/claude_resources/assets/img/logo-techtycoon.png',
          prefill: {
            name: nameVal,
            email: emailVal,
            contact: phoneDigits
          },
          notes: {
            product: 'claude_resources',
            coupon: appliedCouponText,
            addon: addonText,
            paid_price: String(currentPayable)
          },
          theme: {
            color: '#FF7A47'
          },
          handler: function (response) {
            var paymentId = response.razorpay_payment_id || '';
            var orderId = response.razorpay_order_id || result.orderId || '';
            var signature = response.razorpay_signature || '';

            var successPayload = JSON.stringify({
              paymentSuccess: true,
              razorpay_order_id: orderId,
              razorpay_payment_id: paymentId,
              razorpay_signature: signature,
              email: emailVal,
              name: nameVal,
              phone: fullPhone,
              countryCode: countryCode,
              amount: currentPayable,
              addon: addonText,
              hasPdfMaterial: isAddonSelected ? 'YES' : 'NO',
              batch: 'Claude Resources' + (isAddonSelected ? ' (+ ChatGPT Hacks)' : ''),
              course: isAddonSelected ? '250+ Ultimate Claude Skills + ChatGPT Hacks' : '250+ Ultimate Claude Skills',
              pageUrl: window.location.href
            });

            // Send payment confirmation back to Google Apps Script
            fetch(appsScriptUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'text/plain;charset=utf-8' },
              body: successPayload
            }).catch(function (e) {
              console.warn('Apps script notification notice:', e);
            });

            // Close modal and show success screen
            closeRegisterModal();
            resetSubmitBtn();

            showStatusDialog('success', 'Payment Successful!',
              'Thank you, ' + nameVal + '! Your payment of ₹' + currentPayable + ' is confirmed.\n\nYour instant access link to the 250+ Ultimate Claude Skills library & prompt bundles' + (isAddonSelected ? ' (including ChatGPT Hacks)' : '') + ' has been sent to ' + emailVal + '.\n\nPlease keep your Payment ID for your records.',
              { paymentId: paymentId, orderId: orderId });
          },
          modal: {
            ondismiss: function () {
              resetSubmitBtn();
              // If user dismissed or cancelled Razorpay without completing payment, reopen registration modal
              window.openRegisterModal();
            }
          }
        };

        var rzp = new window.Razorpay(rzpOptions);
        rzp.on('payment.failed', function (r) {
          var errDesc = (r && r.error && r.error.description) || 'Payment failed or was cancelled.';
          showStatusDialog('failed', 'Payment Failed',
            errDesc + ' You have not been charged. If any amount was deducted, your bank will reverse it automatically.',
            { retry: true, help: true });
          resetSubmitBtn();
        });

        // Close registration dialog so Razorpay Checkout modal comes directly to the front
        closeRegisterModal();
        resetSubmitBtn();
        rzp.open();
      })
      .catch(function (err) {
        console.error('Order creation network error:', err);
        alert('Failed to connect to payment server. Please check your internet connection or contact +91 7558133039.');
        resetSubmitBtn();
      });
    });
  }

  // Automatically attach click handlers to all checkout triggers
  function bindTriggers() {
    document.querySelectorAll('[data-href="checkout"], [data-pay]').forEach(function (btn) {
      btn.classList.remove('is-pending');
      btn.removeAttribute('aria-disabled');
      btn.removeAttribute('title');
      btn.style.cursor = 'pointer';
      btn.addEventListener('click', function (ev) {
        ev.preventDefault();
        window.openRegisterModal();
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindTriggers);
  } else {
    bindTriggers();
  }

})();
