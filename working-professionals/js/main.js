/* =========================================================
   EDIT YOUR SESSION DETAILS HERE
   Leave a value as "" to keep the placeholder text in the HTML.
   ========================================================= */
const CONFIG = {
  mode: "",           // e.g. "Live online on Zoom" or "In person, Pune"

  // WhatsApp enquiry (country code + number, digits only)
  whatsappNumber: "917558133039",
  whatsappMessage: "Hi, I am interested in joining the AI-Powered Career Development Session. Please share the details.",

  // Google Apps Script web app URL that saves registrations to your Google Sheet.
  // See google-apps-script/README.md. Looks like: https://script.google.com/macros/s/XXXX/exec
  registrationEndpoint: "",

  // Packages shown in the form. Prices are display only here; the Google Apps Script
  // sets the real amount from the package key, so keep both in sync.
  packages: {
    session: { name: "Session Only", price: 99 },
    bundle: { name: "Session + Document", price: 499 }
  },

  // One Razorpay Payment Page / Payment Link per package (fixed amount on each page).
  paymentUrls: {
    session: "",   // ₹99 page,  e.g. https://pages.razorpay.com/ai-session-99
    bundle: ""     // ₹499 page, e.g. https://pages.razorpay.com/ai-session-499
  }
};
const inr = (n) => "₹" + Number(n).toLocaleString("en-IN");

document.documentElement.classList.add("js");

/* ---------- Apply config ---------- */
const waLink = (text = CONFIG.whatsappMessage) =>
  `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`;

document.querySelectorAll("[data-wa]").forEach((a) => { a.href = waLink(); });

document.querySelectorAll("[data-bind]").forEach((el) => {
  const value = CONFIG[el.dataset.bind];
  if (value) el.textContent = value;
});

const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

/* ---------- Header: shadow on scroll + mobile menu ---------- */
const header = document.querySelector(".site-header");
const nav = document.getElementById("nav");
const toggle = document.querySelector(".menu-toggle");

const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 8);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

const setMenu = (open) => {
  nav.classList.toggle("open", open);
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
};
toggle.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
nav.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

/* ---------- Reveal on scroll ---------- */
const revealEls = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  // Stagger is worked out when items enter the screen, so items that appear together
  // cascade, while an item scrolled to later (e.g. stacked cards on mobile) appears at once.
  // A parent can set data-stagger="<base ms> <step ms>"; base is a lead-in used only for
  // the first batch (lets the section heading animate first). An item can set data-delay.
  const startedGroups = new WeakSet();
  const io = new IntersectionObserver((entries) => {
    const groups = new Map();
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const parent = entry.target.parentElement;
      if (!groups.has(parent)) groups.set(parent, []);
      groups.get(parent).push(entry.target);
    });

    groups.forEach((els, parent) => {
      const [base, step] = (parent.dataset.stagger || "0 70").split(/\s+/).map(Number);
      const firstBatch = !startedGroups.has(parent);
      startedGroups.add(parent);
      els.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));

      els.forEach((el, i) => {
        const delay = el.dataset.delay
          ? (firstBatch ? Number(el.dataset.delay) : 0)
          : (firstBatch ? base : 0) + Math.min(i, 8) * step;
        el.style.transitionDelay = `${delay}ms`;
        el.classList.add("in");
        io.unobserve(el);
        // When the entrance is done, drop the reveal styles so the element's own
        // hover transitions (lift, glow) take over with no delay.
        setTimeout(() => {
          el.style.transitionDelay = "";
          el.classList.remove("reveal");
        }, delay + 900);
      });
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("in"));
}

/* ---------- Weak vs strong prompt tabs ---------- */
const tabs = document.querySelectorAll(".toggle [role=tab]");
const selectTab = (tab) => {
  tabs.forEach((t) => {
    const on = t === tab;
    t.setAttribute("aria-selected", String(on));
    t.tabIndex = on ? 0 : -1;
    document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
  });
};
tabs.forEach((tab, i) => {
  tab.addEventListener("click", () => selectTab(tab));
  tab.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
    selectTab(next);
    next.focus();
  });
});

/* =========================================================
   TEXT ANIMATIONS
   ========================================================= */
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Split an element's text into masked words. Child elements (e.g. the
   gradient "AI") are kept intact and treated as a single word. */
function splitWords(el, { base = 0, step = 55 } = {}) {
  if (reduceMotion) { el.classList.add("split-ready"); return 0; }
  const nodes = [...el.childNodes];
  el.textContent = "";
  let i = 0;
  const addWord = (content) => {
    const w = document.createElement("span");
    w.className = "w";
    const wi = document.createElement("span");
    wi.className = "wi";
    wi.style.transitionDelay = `${base + i * step}ms`;
    if (typeof content === "string") wi.textContent = content; else wi.appendChild(content);
    w.appendChild(wi);
    el.appendChild(w);
    i++;
  };
  nodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      node.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) el.appendChild(document.createTextNode(" "));
        else addWord(part);
      });
    } else {
      addWord(node);
    }
  });
  el.classList.add("split-ready");
  return i;
}

/* Typewriter that reserves the full text up front, so nothing reflows. */
function typewrite(el, { delay = 0, speed = 32 } = {}) {
  const text = el.textContent.trim().replace(/\s+/g, " ");
  if (reduceMotion) { el.closest(".hero-eyebrow")?.classList.add("tw-ready"); return; }
  const on = document.createElement("span");
  const off = document.createElement("span");
  const sr = document.createElement("span");
  on.className = "tw-on"; off.className = "tw-off"; sr.className = "sr-only";
  on.setAttribute("aria-hidden", "true"); off.setAttribute("aria-hidden", "true");
  off.textContent = text; sr.textContent = text;
  el.replaceChildren(sr, on, off);
  el.closest(".hero-eyebrow")?.classList.add("tw-ready");

  let i = 0;
  const tick = () => {
    i++;
    on.textContent = text.slice(0, i);
    off.textContent = text.slice(i);
    if (i < text.length) {
      // slight human-like rhythm: pause a little longer after punctuation
      const ch = text[i - 1];
      setTimeout(tick, speed + (/[.,·]/.test(ch) ? speed * 4 : Math.random() * speed * 0.6));
    } else {
      setTimeout(() => el.classList.add("tw-done"), 1400);
    }
  };
  setTimeout(tick, delay);
}

/* Hero: typewriter label + word-by-word headline on load */
const heroTitle = document.querySelector(".hero h1");
if (heroTitle) {
  splitWords(heroTitle, { base: 250, step: 70 });
  requestAnimationFrame(() => requestAnimationFrame(() => heroTitle.classList.add("in")));
}
const heroType = document.querySelector('[data-typewriter="hero"]');
if (heroType) typewrite(heroType, { delay: 200, speed: 30 });

/* Section headings: split title, then stagger eyebrow → title → subtitle */
const headTargets = [];
document.querySelectorAll(".section-head").forEach((head) => {
  const eyebrow = head.querySelector(".eyebrow");
  const title = head.querySelector("h2");
  const sub = head.querySelector(".sub");
  const words = title ? splitWords(title, { base: 120, step: 55 }) : 0;
  if (eyebrow) eyebrow.style.transitionDelay = "0ms";
  if (sub) sub.style.transitionDelay = `${Math.min(220 + words * 55, 900)}ms`;
  headTargets.push(head);
});

/* Other important lines revealed word by word */
const finalCta = document.querySelector(".final-cta");
if (finalCta) {
  const words = splitWords(finalCta.querySelector("h2"), { base: 150, step: 60 });
  const after = Math.min(250 + words * 60, 1000);
  finalCta.querySelector(".eyebrow").style.transitionDelay = "0ms";
  finalCta.querySelector(".lead").style.transitionDelay = `${after}ms`;
  finalCta.querySelector(".hero-actions").style.transitionDelay = `${after + 150}ms`;
  headTargets.push(finalCta);
}
document.querySelectorAll(".promise-text, .plan-foot, .sub-title").forEach((el) => {
  splitWords(el, { base: 200, step: 40 });
  headTargets.push(el.closest(".reveal") || el);
});

if ("IntersectionObserver" in window && !reduceMotion) {
  const headIO = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("in");
      headIO.unobserve(entry.target);
    });
  }, { threshold: 0.25, rootMargin: "0px 0px -60px 0px" });
  headTargets.forEach((t) => headIO.observe(t));
} else {
  headTargets.forEach((t) => t.classList.add("in"));
}

/* Stats count-up */
const statNums = document.querySelectorAll(".stat strong");
const countUp = (el) => {
  const match = (el.dataset.final || el.textContent).match(/^(\d+)(.*)$/);
  if (!match || reduceMotion) return;
  const target = +match[1];
  const suffix = match[2];
  const start = performance.now();
  const dur = 1300;
  const frame = (now) => {
    const p = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(target * eased) + suffix;
    if (p < 1) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  // safety net if rAF is throttled (background tab, low-power mode)
  setTimeout(() => { el.textContent = target + suffix; }, dur + 300);
};
if ("IntersectionObserver" in window && statNums.length && !reduceMotion) {
  statNums.forEach((el) => { el.dataset.final = el.textContent; el.textContent = el.textContent.replace(/^\d+/, "0"); });
  const statIO = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      statNums.forEach(countUp);
      statIO.disconnect();
    });
  }, { threshold: 0.5 });
  statIO.observe(document.querySelector(".stats"));
}

/* Scroll progress bar (rAF-throttled, transform only) */
const progress = document.querySelector(".scroll-progress");
if (progress && !reduceMotion) {
  let ticking = false;
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    ticking = false;
  };
  window.addEventListener("scroll", () => {
    if (!ticking) { ticking = true; requestAnimationFrame(updateProgress); }
  }, { passive: true });
  updateProgress();
}

/* ---------- Mobile sticky CTA: show after the hero ---------- */
const sticky = document.querySelector(".sticky-cta");
const hero = document.querySelector(".hero");
if (sticky && hero && "IntersectionObserver" in window) {
  let heroVisible = true;
  let finalVisible = false;
  const update = () => sticky.classList.toggle("show", !heroVisible && !finalVisible);
  new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; update(); }).observe(hero);
  if (finalCta) new IntersectionObserver(([e]) => { finalVisible = e.isIntersecting; update(); }).observe(finalCta);
}

/* =========================================================
   REGISTRATION FORM  →  Google Sheet  →  ₹99 Razorpay payment
   Nothing here pretends to save or take payment: step 2 only
   appears after the Google Sheet endpoint confirms the save.
   ========================================================= */
const regDialog = document.getElementById("register");
const regForm = document.getElementById("reg-form");

if (regDialog && regForm) {
  const payStep = regDialog.querySelector('[data-step="2"]');
  const alertBox = regForm.querySelector(".form-alert");
  const submitBtn = regForm.querySelector(".reg-submit");
  const title = document.getElementById("reg-title");
  const dots = regDialog.querySelectorAll("[data-step-dot]");
  const canModal = typeof regDialog.showModal === "function";
  let lastTrigger = null;
  let attempted = false;

  /* ---- package selection ---- */
  const pkgFieldset = document.getElementById("f-pkg");
  const pkgErr = document.getElementById("f-pkg-err");
  const radios = [...regForm.querySelectorAll('input[name="package"]')];
  const totalEl = regForm.querySelector("[data-total]");
  const sumPkg = regDialog.querySelector("[data-sum-pkg]");
  const sumFee = regDialog.querySelector("[data-sum-fee]");
  const selectedPkg = () => radios.find((r) => r.checked)?.value || "";

  const renderPackage = () => {
    const key = selectedPkg();
    const pkg = CONFIG.packages[key];
    radios.forEach((r) => r.closest(".pkg-opt").classList.toggle("is-checked", r.checked));
    if (pkg) {
      totalEl.textContent = inr(pkg.price);
      totalEl.classList.remove("empty");
      sumPkg.textContent = `Package: ${pkg.name}`;
      sumFee.textContent = inr(pkg.price);
      pkgFieldset.removeAttribute("aria-invalid");
      pkgErr.textContent = "";
    } else {
      totalEl.textContent = "Choose a package";
      totalEl.classList.add("empty");
    }
  };
  radios.forEach((r) => r.addEventListener("change", renderPackage));
  renderPackage();

  const checkPackage = () => {
    if (selectedPkg()) return true;
    pkgFieldset.setAttribute("aria-invalid", "true");
    pkgFieldset.setAttribute("aria-describedby", "f-pkg-err");
    pkgErr.textContent = "Please choose a package.";
    return false;
  };

  /* ---- open / close ---- */
  const openReg = (trigger) => {
    if (!canModal) { document.getElementById("pricing")?.scrollIntoView(); return; }
    lastTrigger = trigger;
    const wanted = trigger?.dataset.package;
    if (wanted && payStep.hidden) {
      const r = radios.find((x) => x.value === wanted);
      if (r) { r.checked = true; renderPackage(); }
    }
    regDialog.showModal();
    document.body.classList.add("modal-open");
    if (!payStep.hidden) return;
    if (!CONFIG.registrationEndpoint) showNotConnected();
    // focus on desktop only; on phones this would pop the keyboard over the summary
    if (window.matchMedia("(min-width: 721px)").matches) {
      (selectedPkg() ? regForm.elements.name : radios[0]).focus();
    }
  };

  document.querySelectorAll("[data-cta]").forEach((a) => {
    a.addEventListener("click", (e) => { e.preventDefault(); openReg(a); });
  });
  regDialog.querySelector("[data-close]").addEventListener("click", () => regDialog.close());
  regDialog.addEventListener("click", (e) => { if (e.target === regDialog) regDialog.close(); }); // backdrop
  regDialog.addEventListener("close", () => {
    document.body.classList.remove("modal-open");
    if (lastTrigger && lastTrigger.tabIndex !== -1) lastTrigger.focus();
  });

  /* ---- alerts (built with DOM nodes, never innerHTML with user input) ---- */
  const showAlert = (text, { type = "warn", linkText, linkHref } = {}) => {
    alertBox.className = `form-alert${type === "error" ? " error" : ""}`;
    alertBox.replaceChildren(document.createTextNode(text));
    if (linkText) {
      const a = document.createElement("a");
      a.href = linkHref; a.target = "_blank"; a.rel = "noopener"; a.textContent = linkText;
      alertBox.append(" ", a);
    }
    alertBox.hidden = false;
  };
  const hideAlert = () => { alertBox.hidden = true; };

  const detailsMessage = (d, extra = "") => {
    const pkg = CONFIG.packages[d.package];
    return `Hi, I would like to register for the AI-Powered Career Development Session.\n\n` +
      (pkg ? `Package: ${pkg.name} (${inr(pkg.price)})\n` : "") +
      `Name: ${d.name}\nWhatsApp: ${d.whatsapp}\nEmail: ${d.email}\nJob role: ${d.role}` +
      (d.company ? `\nCompany: ${d.company}` : "") + extra;
  };

  function showNotConnected(data) {
    showAlert("Online registration isn't connected yet.", {
      linkText: data ? "Send these details on WhatsApp to register" : "Register on WhatsApp instead",
      linkHref: data ? waLink(detailsMessage(data)) : waLink()
    });
  }

  /* ---- validation ---- */
  const normalisePhone = (v) => {
    let d = v.replace(/\D/g, "");
    if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
    if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
    return d;
  };
  const rules = {
    name: (v) => v.trim().length >= 2 || "Please enter your full name.",
    whatsapp: (v) => /^[6-9]\d{9}$/.test(normalisePhone(v)) || "Enter a valid 10-digit Indian mobile number.",
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || "Enter a valid email address.",
    role: (v) => v.trim().length >= 2 || "Please enter your current job role."
  };
  const errorIds = { name: "f-name-err", whatsapp: "f-wa-err", email: "f-email-err", role: "f-role-err" };

  const checkField = (name) => {
    const input = regForm.elements[name];
    const result = rules[name](input.value);
    const err = document.getElementById(errorIds[name]);
    if (result === true) {
      input.removeAttribute("aria-invalid");
      input.removeAttribute("aria-describedby");
      err.textContent = "";
      return true;
    }
    input.setAttribute("aria-invalid", "true");
    input.setAttribute("aria-describedby", errorIds[name]);
    err.textContent = result;
    return false;
  };

  Object.keys(rules).forEach((name) => {
    const input = regForm.elements[name];
    input.addEventListener("blur", () => { if (attempted || input.value) checkField(name); });
    input.addEventListener("input", () => { if (input.getAttribute("aria-invalid")) checkField(name); });
  });

  /* ---- step 2: payment ---- */
  const showPayStep = (id, data, amount) => {
    const pkg = CONFIG.packages[data.package];
    regForm.hidden = true;
    payStep.hidden = false;
    title.textContent = "Complete your payment";
    dots[0].classList.replace("active", "done");
    dots[1].classList.add("active");
    payStep.querySelector(".reg-id").textContent = id;
    payStep.querySelector("[data-pay-pkg]").textContent = pkg.name;
    payStep.querySelector("[data-pay-amt]").textContent = inr(amount);
    sumPkg.textContent = `Package: ${pkg.name}`;
    sumFee.textContent = inr(amount);

    const payBtn = payStep.querySelector(".reg-pay-btn");
    const payLabel = payStep.querySelector("[data-pay-label]");
    const url = CONFIG.paymentUrls[data.package];
    if (url) {
      payBtn.href = url;
      payLabel.textContent = `Pay ${inr(amount)} securely`;
    } else {
      // Registration is saved, but no payment page is configured yet: hand off to WhatsApp honestly.
      payBtn.href = waLink(detailsMessage(data, `\nRegistration ID: ${id}\n\nPlease share the ${inr(amount)} payment link.`));
      payLabel.textContent = `Get the ${inr(amount)} payment link on WhatsApp`;
    }
    payBtn.focus();
    try { sessionStorage.setItem("tt-reg2", JSON.stringify({ id, data, amount })); } catch (_) {}
  };

  // If they already registered in this browser session, reopen at the payment step.
  try {
    const saved = JSON.parse(sessionStorage.getItem("tt-reg2") || "null");
    if (saved && saved.id && CONFIG.packages[saved.data?.package] && saved.amount) showPayStep(saved.id, saved.data, saved.amount);
  } catch (_) {}

  // "Start a new registration" — back to step 1 with a clean form
  regDialog.querySelector("[data-restart]").addEventListener("click", () => {
    try { sessionStorage.removeItem("tt-reg2"); } catch (_) {}
    regForm.reset();
    attempted = false;
    hideAlert();
    renderPackage();
    sumPkg.textContent = "3 hours · Live, hands-on · Choose a package below";
    sumFee.innerHTML = "<span>from</span>₹99";
    payStep.hidden = true;
    regForm.hidden = false;
    title.textContent = "Reserve your seat";
    dots[1].classList.remove("active");
    dots[0].classList.replace("done", "active");
    radios[0].focus();
  });

  /* ---- submit ---- */
  regForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    attempted = true;
    hideAlert();
    if (regForm.elements.website.value) return; // spam bot

    const pkgOk = checkPackage();
    const invalid = Object.keys(rules).filter((n) => !checkField(n));
    if (!pkgOk) { radios[0].focus(); return; }
    if (invalid.length) { regForm.elements[invalid[0]].focus(); return; }

    const params = new URLSearchParams(location.search);
    const data = {
      package: selectedPkg(),
      name: regForm.elements.name.value.trim(),
      whatsapp: "+91" + normalisePhone(regForm.elements.whatsapp.value),
      email: regForm.elements.email.value.trim().toLowerCase(),
      role: regForm.elements.role.value.trim(),
      company: regForm.elements.company.value.trim()
    };

    if (!CONFIG.registrationEndpoint) { showNotConnected(data); return; }

    submitBtn.classList.add("loading");
    submitBtn.querySelector(".btn-label").textContent = "Registering…";
    try {
      const body = new URLSearchParams({
        ...data,
        source: location.origin + location.pathname,
        utm_source: params.get("utm_source") || "",
        utm_medium: params.get("utm_medium") || "",
        utm_campaign: params.get("utm_campaign") || ""
      });
      // Simple form-encoded POST: no CORS preflight, and Apps Script returns readable JSON.
      const res = await fetch(CONFIG.registrationEndpoint, { method: "POST", body });
      const json = await res.json();
      if (!res.ok || !json.ok || !json.id) throw new Error(json.error || "Registration was not saved");
      // The server decides the amount from the package; fall back to the displayed price only if it didn't send one.
      showPayStep(json.id, data, json.amount || CONFIG.packages[data.package].price);
    } catch (err) {
      showAlert("We couldn't save your registration. Please check your connection and try again, or", {
        type: "error",
        linkText: "register on WhatsApp",
        linkHref: waLink(detailsMessage(data))
      });
    } finally {
      submitBtn.classList.remove("loading");
      submitBtn.querySelector(".btn-label").textContent = "Register Now";
    }
  });
}
