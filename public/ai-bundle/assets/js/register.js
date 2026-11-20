/* =====================================================================
   Tech Tycoon Academy — Registration form
   ---------------------------------------------------------------------
   No backend exists yet. To connect one, set REG_CONFIG.endpoint to the
   URL that should receive registrations (your server, a Google Apps
   Script web app, Formspree, etc.). The form POSTs JSON:
     { name, email, phone, coupon, final_price, currency, page, submitted_at }
   Until an endpoint is set, the form validates everything but clearly
   tells the visitor the registration was NOT saved.
   NOTE: coupon prices here are for display only — your server must
   re-check the coupon before charging any amount.
   ===================================================================== */
(function () {
  "use strict";

  var REG_CONFIG = {
    endpoint: "",            // e.g. "https://your-server.com/api/register"
    timeoutMs: 15000
  };

  var DEFAULT_COUPON = "AMIABLE";
  var PRICES = { original: 50000, offer: 30000 };
  var COUPONS = {
    AMIABLE: { price: 30000, message: "AMIABLE applied — offer price unlocked." },
    AIANTONY: { price: 15000, special: true, message: "AIANTONY applied — special price ₹15,000 unlocked!" }
  };

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
  var lastFocus = null, submitting = false, couponTimer;

  function rupees(n) { return "₹" + n.toLocaleString("en-IN"); }

  /* ---------- coupon (case-insensitive) ---------- */
  function couponState() {
    var code = f.coupon.value.trim().toUpperCase();
    if (!code) return { code: "", status: "none", price: PRICES.offer };
    var c = COUPONS[code];
    if (c) return { code: code, status: "valid", price: c.price, special: !!c.special, message: c.message };
    return { code: code, status: "invalid", price: PRICES.offer };
  }

  function renderCoupon() {
    var s = couponState();
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
    sumFinal.textContent = rupees(s.price);
    sumFinal.classList.toggle("is-special", !!s.special);
    return s;
  }

  f.coupon.addEventListener("input", function () {
    clearTimeout(couponTimer);
    couponTimer = setTimeout(renderCoupon, 200);
  });
  f.coupon.addEventListener("blur", renderCoupon);
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
      return /^\d{8,15}$/.test(intl) ? "+" + intl : null;   // other countries
    }
    raw = raw.replace(/^(0|91)(?=[6-9]\d{9}$)/, "");
    return /^[6-9]\d{9}$/.test(raw) ? "+91" + raw : null;   // Indian mobile
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
    return { name: name, email: email.toLowerCase(), phone: phone, coupon: c };
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

  function setLoading(on) {
    submitting = on;
    submitBtn.disabled = on;
    submitBtn.classList.toggle("is-loading", on);
    submitBtn.setAttribute("aria-busy", on ? "true" : "false");
    submitLabel.textContent = on ? "PROCESSING…" : "REGISTER NOW";
  }

  /* ---------- submit ---------- */
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (submitting) return;                       // prevent duplicate submissions
    hideAlert();
    var data = validate();
    if (!data) {
      if (couponState().status === "invalid") showAlert("error", "Please fix or remove the coupon code to continue.");
      return;
    }

    var payload = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      coupon: data.coupon.status === "valid" ? data.coupon.code : "",
      final_price: data.coupon.price,
      currency: "INR",
      page: location.href,
      submitted_at: new Date().toISOString()
    };

    if (!REG_CONFIG.endpoint) {
      console.info("[Registration] No endpoint configured. Payload that would be sent:", payload);
      showAlert("info", "Your details look good, but online registration isn’t connected yet — this registration was NOT saved. Please contact Tech Tycoon Academy directly to register.");
      return;
    }

    setLoading(true);
    var ctrl = "AbortController" in window ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, REG_CONFIG.timeoutMs);

    fetch(REG_CONFIG.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(payload),
      signal: ctrl ? ctrl.signal : undefined
    })
      .then(function (res) {
        clearTimeout(timer);
        if (!res.ok) throw new Error("HTTP " + res.status);
        setLoading(false);
        form.hidden = true;
        done.hidden = false;
        document.getElementById("regDoneText").textContent =
          "Thank you, " + data.name.split(" ")[0] + "! Your registration for the 10+ Advanced AI Courses at " +
          rupees(payload.final_price) + " has been sent to Tech Tycoon Academy.";
        done.querySelector("button").focus();
      })
      .catch(function (err) {
        clearTimeout(timer);
        setLoading(false);
        showAlert("error", err && err.name === "AbortError"
          ? "The request timed out. Please check your connection and try again."
          : "Something went wrong and your registration was not submitted. Please try again.");
      });
  });

  /* ---------- open / close ---------- */
  function open() {
    lastFocus = document.activeElement;
    if (!done.hidden) {                            // fresh form after a completed registration
      form.reset(); done.hidden = true; form.hidden = false;
      ["name", "email", "phone"].forEach(function (k) { setErr(k); });
    }
    hideAlert();
    if (!f.coupon.value) f.coupon.value = DEFAULT_COUPON;   // auto-apply AMIABLE
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
    if (e.key === "Tab") {                         // keep focus inside the dialog
      var items = Array.prototype.filter.call(
        modal.querySelectorAll("button, input, [href]"),
        function (el) { return !el.disabled && el.offsetParent !== null; });
      if (!items.length) return;
      var firstEl = items[0], lastEl = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) { e.preventDefault(); lastEl.focus(); }
      else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); firstEl.focus(); }
    }
  });

  // Never open the form on page load — only when a button is clicked.
  if (location.hash === "#register" && history.replaceState) {
    history.replaceState(null, "", location.pathname + location.search);
  }
})();
