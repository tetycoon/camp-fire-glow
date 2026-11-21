/* =====================================================================
   Tech Tycoon Academy — 10+ Advanced AI Courses Bundle (/ai-bundle/)
   Registration, Google Sheets Logging & Razorpay Checkout Integration
   ---------------------------------------------------------------------
   Workflow (Reference: Claude Academy Masterclass Google Sheet):
   1. Auto-applies AMIABLE coupon (₹50,000 -> ₹30,000) or AIANTONY (₹15,000).
   2. Supports ₹1 live test payment for authorized test emails.
   3. Creates a verified Razorpay Order via Google Apps Script and logs an
      "INITIATED" row in Sheet1 + UTM attribution row in Landing_Leads.
   4. Opens Razorpay Checkout (Dual Live Keys: Domestic India & International).
   5. On payment capture, verifies signature & payment with Google Apps Script,
      marks Sheet1 row as "✅ PAID", generates official Non-GST Invoice PDF,
      and emails confirmation + PDF Invoice to the learner.
   ===================================================================== */
(function () {
  "use strict";

  var REG_CONFIG = {
    // Deployed AI_BUNDLE_APPS_SCRIPT Web App URL:
    endpoint: window.AI_BUNDLE_APPS_SCRIPT_URL || "https://script.google.com/macros/s/AKfycby-UAe8purdGqxjPjR607F0WS_A3wN0aMzfBPDqqBbWy20xtTEXO_3w5rFFpZNZWdus_w/exec",
    razorpayKeyIn: "rzp_live_T2CbVONQc6qrqj",
    razorpayKeyIntl: "rzp_live_gfoS1OjC8tvWjP",
    timeoutMs: 25000
  };

  var DEFAULT_COUPON = "AMIABLE";
  var PRICES = { original: 50000, offer: 30000 };
  var COUPONS = {
    AMIABLE: { price: 30000, message: "AMIABLE applied — ₹20,000 off Early Bird offer unlocked." },
    AIANTONY: { price: 15000, special: true, message: "AIANTONY applied — special price ₹15,000 unlocked!" }
  };

  var AUTHORIZED_TEST_EMAILS = [
    "ambroseselva001@gmail.com",
    "techtycoondigitalsolutions@gmail.com",
    "techtycoondigitors@gmail.com"
  ];

  var modal = document.getElementById("register");
  if (!modal) return;
  var form = document.getElementById("regForm");
  var done = document.getElementById("regDone");
  var f = {
    name: document.getElementById("regName"),
    email: document.getElementById("regEmail"),
    phone: document.getElementById("regPhone"),
    coupon: document.getElementById("regCoupon")
  };
  var couponBox = document.getElementById("couponBox");
  var couponMsg = document.getElementById("couponMsg");
  var sumOffer = document.getElementById("sumOffer");
  var sumSpecial = document.getElementById("sumSpecial");
  var sumFinal = document.getElementById("sumFinal");
  var alertBox = document.getElementById("regAlert");
  var submitBtn = document.getElementById("regSubmit");
  var submitLabel = submitBtn.querySelector(".reg__label");
  var regNote = form.querySelector(".reg__note");
  if (regNote) {
    regNote.textContent = "🔒 100% Secure Razorpay Checkout · Instant Email Confirmation & Official Invoice";
  }

  var lastFocus = null, submitting = false, couponTimer;

  function rupees(n) { return "₹" + Number(n || 0).toLocaleString("en-IN"); }

  function isTestEmailEntered() {
    var em = (f.email && f.email.value || "").trim().toLowerCase();
    return AUTHORIZED_TEST_EMAILS.indexOf(em) !== -1;
  }

  function getTrackingParams() {
    try {
      var params = new URLSearchParams(window.location.search);
      return {
        utm_source: params.get("utm_source") || (document.referrer ? new URL(document.referrer).hostname : "direct"),
        utm_medium: params.get("utm_medium") || "",
        utm_campaign: params.get("utm_campaign") || "",
        gclid: params.get("gclid") || "",
        fbclid: params.get("fbclid") || ""
      };
    } catch (_) {
      return {};
    }
  }

  function ensureRazorpaySdk() {
    return new Promise(function (resolve) {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      var s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.onload = function () { resolve(true); };
      s.onerror = function () { resolve(false); };
      document.head.appendChild(s);
    });
  }

  /* ---------- coupon (case-insensitive) ---------- */
  function couponState() {
    var code = f.coupon.value.trim().toUpperCase();
    if (!code) return { code: "AMIABLE", status: "none", price: PRICES.offer };
    var c = COUPONS[code];
    if (c) return { code: code, status: "valid", price: c.price, special: !!c.special, message: c.message };
    return { code: code, status: "invalid", price: PRICES.offer };
  }

  function getEffectivePayablePrice() {
    var s = couponState();
    if (isTestEmailEntered()) return 1;
    return s.price;
  }

  function renderCoupon() {
    var s = couponState();
    var finalPayable = getEffectivePayablePrice();

    couponBox.classList.toggle("has-value", !!f.coupon.value);
    couponBox.classList.toggle("is-applied", s.status === "valid");
    couponBox.classList.toggle("is-invalid", s.status === "invalid");
    couponMsg.className = "coupon__msg" + (s.status === "valid" ? " ok" : s.status === "invalid" ? " bad" : "");
    couponMsg.textContent = s.status === "valid" ? s.message
      : s.status === "invalid" ? "“" + s.code + "” is not a valid coupon code."
      : "";

    // AIANTONY: strike the ₹30,000 offer price and show ₹15,000 as final
    sumOffer.classList.toggle("is-struck", !!s.special);
    sumSpecial.hidden = !s.special;
    sumFinal.textContent = rupees(finalPayable);
    sumFinal.classList.toggle("is-special", !!s.special);

    if (!submitting && submitLabel) {
      submitLabel.textContent = "PROCEED TO PAY " + rupees(finalPayable);
    }
    return s;
  }

  f.coupon.addEventListener("input", function () {
    clearTimeout(couponTimer);
    couponTimer = setTimeout(renderCoupon, 150);
  });
  f.coupon.addEventListener("blur", renderCoupon);
  f.email.addEventListener("input", renderCoupon);
  f.email.addEventListener("blur", renderCoupon);

  document.getElementById("couponRemove").addEventListener("click", function () {
    f.coupon.value = "";
    renderCoupon();
    f.coupon.focus();
  });

  /* ---------- validation ---------- */
  function normalizePhone(v) {
    var raw = v.replace(/[\s\-().]/g, "");
    if (raw.charAt(0) === "+") {
      var intl = raw.slice(1);
      if (/^91[6-9]\d{9}$/.test(intl)) return "+" + intl;
      return /^\d{8,15}$/.test(intl) ? "+" + intl : null;
    }
    raw = raw.replace(/^(0|91)(?=[6-9]\d{9}$)/, "");
    return /^[6-9]\d{9}$/.test(raw) ? "+91" + raw : null;
  }

  function setErr(key, msg) {
    var el = form.querySelector('[data-err="' + key + '"]');
    el.textContent = msg || "";
    f[key].closest(".field").classList.toggle("has-error", !!msg);
    f[key].setAttribute("aria-invalid", msg ? "true" : "false");
  }

  function validate() {
    var first = null;
    var name = f.name.value.trim().replace(/\s+/g, " ");
    var email = f.email.value.trim();
    var phone = normalizePhone(f.phone.value);

    if (name.length < 2) { setErr("name", "Please enter your full name."); first = first || f.name; }
    else if (!/^[\p{L} .'-]+$/u.test(name)) { setErr("name", "Name can only contain letters, spaces, . ' and -"); first = first || f.name; }
    else setErr("name");

    if (!email) { setErr("email", "Please enter your email address."); first = first || f.email; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { setErr("email", "Please enter a valid email address."); first = first || f.email; }
    else setErr("email");

    if (!f.phone.value.trim()) { setErr("phone", "Please enter your WhatsApp / mobile number."); first = first || f.phone; }
    else if (!phone) { setErr("phone", "Enter a valid 10-digit mobile number (or add your country code with +)."); first = first || f.phone; }
    else setErr("phone");

    var c = renderCoupon();
    if (c.status === "invalid") first = first || f.coupon;

    if (first) { first.focus(); return null; }
    return {
      name: name,
      email: email.toLowerCase(),
      phone: phone,
      isInternational: phone.indexOf("+91") !== 0,
      countryCode: phone.indexOf("+91") === 0 ? "+91" : phone.slice(0, 4),
      coupon: c,
      payableAmount: getEffectivePayablePrice(),
      isTest: isTestEmailEntered()
    };
  }

  ["name", "email", "phone"].forEach(function (k) {
    f[k].addEventListener("input", function () {
      if (f[k].closest(".field").classList.contains("has-error")) setErr(k);
    });
  });

  /* ---------- messages ---------- */
  function showAlert(type, msg) {
    alertBox.className = "reg__alert is-" + type;
    alertBox.textContent = msg;
    alertBox.hidden = false;
  }
  function hideAlert() { alertBox.hidden = true; alertBox.textContent = ""; }

  function setLoading(on, customText) {
    submitting = on;
    submitBtn.disabled = on;
    submitBtn.classList.toggle("is-loading", on);
    submitBtn.setAttribute("aria-busy", on ? "true" : "false");
    submitLabel.textContent = on
      ? (customText || "INITIALIZING PAYMENT…")
      : ("PROCEED TO PAY " + rupees(getEffectivePayablePrice()));
  }

  function showCompletionScreen(data, paymentId, orderId, invoiceNumber) {
    setLoading(false);
    form.hidden = true;
    done.hidden = false;
    var doneHeading = done.querySelector("h3");
    if (doneHeading) doneHeading.textContent = "Enrollment Confirmed! 🎉";

    var firstName = data.name.split(" ")[0] || data.name;
    var invPart = invoiceNumber ? (" · Invoice No: " + invoiceNumber) : "";
    document.getElementById("regDoneText").textContent =
      "Thank you, " + firstName + "! Your payment of " + rupees(data.payableAmount) +
      " for the 10+ Advanced AI Courses Bundle is confirmed (Payment ID: " + paymentId + invPart +
      "). We have sent your confirmation email and official PDF Invoice to " + data.email + ".";

    modal.hidden = false;
    modal.style.display = "";
    document.body.classList.add("reg-open");
    var doneBtn = done.querySelector("button");
    if (doneBtn) doneBtn.focus();
  }

  /* ---------- submit & Razorpay flow ---------- */
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    if (submitting) return;
    hideAlert();
    var data = validate();
    if (!data) {
      if (couponState().status === "invalid") showAlert("error", "Please fix or remove the coupon code to continue.");
      return;
    }

    if (!REG_CONFIG.endpoint) {
      showAlert("info", "Please paste your deployed Google Apps Script Web App URL into REG_CONFIG.endpoint in assets/js/register.js to activate live Razorpay orders & Google Sheets logging.");
      return;
    }

    setLoading(true, "CREATING ORDER…");

    var sdkLoaded = await ensureRazorpaySdk();
    if (!sdkLoaded || !window.Razorpay) {
      setLoading(false);
      showAlert("error", "Unable to load Razorpay Checkout. Please check your internet connection and try again.");
      return;
    }

    var utm = getTrackingParams();
    var appliedCode = data.coupon.status === "valid" ? data.coupon.code : "AMIABLE";
    var orderPayload = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      countryCode: data.countryCode,
      isInternational: data.isInternational,
      coupon: appliedCode,
      promoCode: appliedCode,
      amount: data.payableAmount,
      final_price: data.payableAmount,
      original_price: PRICES.original,
      currency: "INR",
      isTest: data.isTest,
      page: location.href,
      pageUrl: location.href,
      utm: utm,
      utm_source: utm.utm_source || "",
      utm_medium: utm.utm_medium || "",
      utm_campaign: utm.utm_campaign || "",
      gclid: utm.gclid || "",
      fbclid: utm.fbclid || "",
      userAgent: navigator.userAgent,
      submitted_at: new Date().toISOString()
    };

    var orderId = "";
    var razorpayKey = data.isInternational ? REG_CONFIG.razorpayKeyIntl : REG_CONFIG.razorpayKeyIn;
    var serverAmount = data.payableAmount;

    try {
      // text/plain avoids CORS preflight OPTIONS failure on Google Apps Script Web Apps
      var orderRes = await fetch(REG_CONFIG.endpoint, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(orderPayload)
      });
      var orderJson = await orderRes.json();
      if (!orderJson || orderJson.success === false) {
        throw new Error((orderJson && orderJson.error) || "Could not initialize payment order.");
      }
      orderId = orderJson.orderId || "";
      if (orderJson.razorpayKeyId) razorpayKey = orderJson.razorpayKeyId;
      if (orderJson.amount) serverAmount = Number(orderJson.amount);
    } catch (err) {
      setLoading(false);
      showAlert("error", (err && err.message) || "Could not connect to registration server. Please try again.");
      return;
    }

    if (!orderId || orderId.indexOf("order_") !== 0) {
      setLoading(false);
      showAlert("error", "Unable to initialize a verified Razorpay order. Please try again.");
      return;
    }

    // Fire Meta Pixel Lead event if fbq is present
    if (typeof window.fbq === "function") {
      try {
        window.fbq("track", "Lead", {
          content_name: "10+ Advanced AI Courses Bundle",
          content_category: "AI Bundle Register Modal",
          value: serverAmount,
          currency: "INR"
        }, { eventID: orderId });
      } catch (_) {}
    }

    // Temporarily hide registration dialog so Razorpay modal renders cleanly in front
    modal.hidden = true;
    modal.style.display = "none";
    document.body.classList.remove("reg-open");

    var rzpOptions = {
      key: razorpayKey,
      amount: serverAmount * 100,
      currency: "INR",
      order_id: orderId,
      name: "Tech Tycoon Academy",
      description: "10+ Advanced AI Courses Bundle (" + appliedCode + ")",
      image: "https://course.techtycoon.in/ai-bundle/assets/images/logo-icon.png",
      prefill: {
        name: data.name,
        email: data.email,
        contact: data.phone
      },
      notes: {
        product_key: "ai_bundle",
        coupon: appliedCode,
        amount_paid: String(serverAmount)
      },
      theme: {
        color: "#0284C7"
      },
      modal: {
        ondismiss: function () {
          modal.hidden = false;
          modal.style.display = "";
          document.body.classList.add("reg-open");
          setLoading(false);
          showAlert("info", "Payment was cancelled. You can click Proceed to Pay whenever you are ready.");
        }
      },
      handler: async function (response) {
        modal.hidden = false;
        modal.style.display = "";
        document.body.classList.add("reg-open");
        setLoading(true, "VERIFYING PAYMENT…");

        var payId = response.razorpay_payment_id || "";
        var rzpOrdId = response.razorpay_order_id || orderId;
        var rzpSig = response.razorpay_signature || "";

        try {
          var verifyRes = await fetch(REG_CONFIG.endpoint, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify({
              paymentSuccess: true,
              action: "payment_success",
              razorpay_order_id: rzpOrdId,
              razorpay_payment_id: payId,
              razorpay_signature: rzpSig,
              name: data.name,
              email: data.email,
              phone: data.phone,
              countryCode: data.countryCode,
              isInternational: data.isInternational,
              coupon: appliedCode,
              promoCode: appliedCode,
              amount: serverAmount,
              final_price: serverAmount
            })
          });
          var verifyData = await verifyRes.json();
          if (!verifyData || !verifyData.success) {
            setLoading(false);
            showAlert("error", (verifyData && verifyData.error) || ("Payment verification pending. Please contact support with Payment ID: " + payId));
            return;
          }

          if (typeof window.fbq === "function") {
            try {
              window.fbq("track", "Purchase", {
                content_name: "10+ Advanced AI Courses Bundle",
                value: serverAmount,
                currency: "INR"
              }, { eventID: payId });
            } catch (_) {}
          }

          showCompletionScreen(data, payId, rzpOrdId, verifyData.invoiceNumber || "");
        } catch (vErr) {
          setLoading(false);
          showAlert("error", "Payment completed (ID: " + payId + "), but confirmation timed out. Your invoice will be emailed shortly.");
        }
      }
    };

    var rzp = new window.Razorpay(rzpOptions);
    rzp.on("payment.failed", function (resp) {
      modal.hidden = false;
      modal.style.display = "";
      document.body.classList.add("reg-open");
      setLoading(false);
      var errDesc = (resp && resp.error && resp.error.description) || "Payment failed. Please try again.";
      showAlert("error", errDesc);
    });
    rzp.open();
  });

  /* ---------- open / close ---------- */
  function open() {
    lastFocus = document.activeElement;
    if (!done.hidden) {
      form.reset(); done.hidden = true; form.hidden = false;
      ["name", "email", "phone"].forEach(function (k) { setErr(k); });
    }
    hideAlert();
    if (!f.coupon.value) f.coupon.value = DEFAULT_COUPON;
    renderCoupon();
    modal.hidden = false;
    modal.style.display = "";
    document.body.classList.add("reg-open");
    setTimeout(function () { f.name.focus(); }, 60);
  }

  function close() {
    if (submitting) return;
    modal.hidden = true;
    modal.style.display = "none";
    document.body.classList.remove("reg-open");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.querySelectorAll("[data-register]").forEach(function (a) {
    a.addEventListener("click", function (e) { e.preventDefault(); open(); });
  });
  modal.querySelectorAll("[data-reg-close]").forEach(function (b) { b.addEventListener("click", close); });

  document.addEventListener("keydown", function (e) {
    if (modal.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "Tab") {
      var items = Array.prototype.filter.call(
        modal.querySelectorAll("button, input, [href]"),
        function (el) { return !el.disabled && el.offsetParent !== null; });
      if (!items.length) return;
      var firstEl = items[0], lastEl = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) { e.preventDefault(); lastEl.focus(); }
      else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); firstEl.focus(); }
    }
  });

  if (location.hash === "#register" && history.replaceState) {
    history.replaceState(null, "", location.pathname + location.search);
  }
})();
