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
  var regDiscountRow = document.getElementById('reg-discount-row');
  var regDiscountAmount = document.getElementById('reg-discount-amount');
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

  // ---- Coupon Evaluation Logic ---------------------------------------------
  function evaluateCoupon() {
    if (!regCoupon) return;
    var entered = regCoupon.value.trim().toUpperCase();

    if (entered === VALID_COUPON) {
      currentPayable = DISCOUNTED_PRICE;
      currentCouponApplied = true;
      if (regDiscountRow) regDiscountRow.style.display = 'flex';
      if (regDiscountAmount) regDiscountAmount.textContent = '-₹' + COUPON_DISCOUNT;
      if (regFinalPrice) regFinalPrice.textContent = '₹' + currentPayable;
      if (btnPriceDisplay) btnPriceDisplay.textContent = '₹' + currentPayable;
      if (regCouponMsg) {
        regCouponMsg.className = 'coupon-msg success is-visible';
        regCouponMsg.textContent = "✓ Coupon '" + VALID_COUPON + "' active: ₹" + COUPON_DISCOUNT + " OFF (You pay ₹" + currentPayable + ")";
      }
    } else if (entered === '') {
      currentPayable = ORIGINAL_PRICE;
      currentCouponApplied = false;
      if (regDiscountRow) regDiscountRow.style.display = 'none';
      if (regFinalPrice) regFinalPrice.textContent = '₹' + currentPayable;
      if (btnPriceDisplay) btnPriceDisplay.textContent = '₹' + currentPayable;
      if (regCouponMsg) {
        regCouponMsg.className = 'coupon-msg neutral is-visible';
        regCouponMsg.textContent = "No coupon applied. Standard price is ₹" + ORIGINAL_PRICE + ". Use 'AMIABLE' for ₹" + COUPON_DISCOUNT + " OFF.";
      }
    } else {
      currentPayable = ORIGINAL_PRICE;
      currentCouponApplied = false;
      if (regDiscountRow) regDiscountRow.style.display = 'none';
      if (regFinalPrice) regFinalPrice.textContent = '₹' + currentPayable;
      if (btnPriceDisplay) btnPriceDisplay.textContent = '₹' + currentPayable;
      if (regCouponMsg) {
        regCouponMsg.className = 'coupon-msg error is-visible';
        regCouponMsg.textContent = "✕ Invalid coupon code. Enter '" + VALID_COUPON + "' to save ₹" + COUPON_DISCOUNT + ".";
      }
    }
  }

  if (regCouponBtn) {
    regCouponBtn.addEventListener('click', function (e) {
      e.preventDefault();
      evaluateCoupon();
    });
  }

  if (regCoupon) {
    regCoupon.addEventListener('input', evaluateCoupon);
    regCoupon.addEventListener('blur', evaluateCoupon);
  }

  // ---- Open & Close Modal --------------------------------------------------
  window.openRegisterModal = function () {
    if (!regDialog) return;
    clearErrors();
    evaluateCoupon();
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

      // Set button to loading
      regSubmitBtn.disabled = true;
      regSubmitBtn.innerHTML = '<span class="pay-spinner" style="width:16px;height:16px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:8px;"></span> Connecting to Payment...';

      // 1. Send registration data to Google Apps Script asynchronously
      var leadPayload = {
        action: 'registration',
        date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        timestamp: new Date().toISOString(),
        name: nameVal,
        email: emailVal,
        phone: fullPhone,
        coupon: appliedCouponText,
        originalPrice: ORIGINAL_PRICE,
        discount: currentCouponApplied ? COUPON_DISCOUNT : 0,
        amount: currentPayable,
        status: 'INITIATED',
        product: 'Ultimate Claude Skills',
        pageUrl: window.location.href,
        userAgent: navigator.userAgent
      };

      try {
        fetch(appsScriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(leadPayload)
        });
      } catch (err) {
        console.warn('Lead logging notice:', err);
      }

      // 2. Launch Razorpay Checkout
      if (typeof window.Razorpay !== 'function') {
        alert('Razorpay payment gateway is still loading. Please check your internet connection and try again.');
        resetSubmitBtn();
        return;
      }

      var isTest = (emailVal === 'ambroseselva001@gmail.com' || emailVal === 'techtycoondigitalsolutions@gmail.com');
      var amountToCharge = isTest ? 1 : currentPayable;
      var isIntl = countryCode !== '+91';
      var rzpKey = isIntl ? (C.razorpayKeyIntl || 'rzp_live_gfoS1OjC8tvWjP') : (C.razorpayKeyIn || 'rzp_live_T2CbVONQc6qrqj');

      var rzpOptions = {
        key: rzpKey,
        amount: amountToCharge * 100, // paise
        currency: 'INR',
        name: 'TechTycoon',
        description: '4,000+ Ultimate Claude Skills Library' + (isTest ? ' (Test Mode)' : ''),
        image: 'https://course.techtycoon.in/claude_resources/assets/img/logo-techtycoon.png',
        prefill: {
          name: nameVal,
          email: emailVal,
          contact: phoneDigits
        },
        notes: {
          product: 'claude_resources',
          coupon: appliedCouponText,
          original_price: String(ORIGINAL_PRICE),
          paid_price: String(currentPayable)
        },
        theme: {
          color: '#FF7A47'
        },
        handler: function (response) {
          // Send payment confirmation to Google Apps Script
          var paySuccessPayload = {
            action: 'payment_success',
            date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
            timestamp: new Date().toISOString(),
            name: nameVal,
            email: emailVal,
            phone: fullPhone,
            coupon: appliedCouponText,
            originalPrice: ORIGINAL_PRICE,
            discount: currentCouponApplied ? COUPON_DISCOUNT : 0,
            amount: currentPayable,
            status: 'PAID',
            paymentId: response.razorpay_payment_id || '',
            orderId: response.razorpay_order_id || '',
            signature: response.razorpay_signature || '',
            product: 'Ultimate Claude Skills',
            pageUrl: window.location.href
          };

          try {
            fetch(appsScriptUrl, {
              method: 'POST',
              mode: 'no-cors',
              headers: { 'Content-Type': 'text/plain;charset=utf-8' },
              body: JSON.stringify(paySuccessPayload)
            });
          } catch (e) {
            console.warn('Payment logging notice:', e);
          }

          // Close modal and show success screen
          closeRegisterModal();
          resetSubmitBtn();

          showStatusDialog('success', 'Payment Successful!',
            'Thank you, ' + nameVal + '! Your payment of ₹' + currentPayable + ' is confirmed.\n\nYour instant access link to the 4,000+ Ultimate Claude Skills library & prompt bundles has been sent to ' + emailVal + '.\n\nPlease keep your Payment ID for your records.',
            { paymentId: response.razorpay_payment_id });
        },
        modal: {
          ondismiss: function () {
            resetSubmitBtn();
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

      rzp.open();
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
