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

    if (regFinalPrice) regFinalPrice.textContent = '₹' + currentPayable;
    if (btnPriceDisplay) btnPriceDisplay.textContent = '₹' + currentPayable;
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
        var rzpKey = isIntl ? (C.razorpayKeyIntl || 'rzp_live_gfoS1OjC8tvWjP') : (C.razorpayKeyIn || 'rzp_live_T2CbVONQc6qrqj');

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
