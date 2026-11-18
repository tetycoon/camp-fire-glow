/* =========================================================
   AI Skills for Teachers and Professors
   Tech Tycoon Digital Solution LLP
   ---------------------------------------------------------
   Plain JavaScript. GSAP, ScrollTrigger and Lenis come from a
   CDN. If they fail to load, every section still shows and
   every feature (tabs, flip, copy, slider, FAQ, form) still works.
   ========================================================= */

(function () {
  'use strict';

  /* ---------------------------------------------------------
     1. SETTINGS: edit these before going live
     --------------------------------------------------------- */
  var CONFIG = {
    // Payment API (the Cloudflare Pages Functions in /functions/api).
    // Same site: keep '/api'. If the page is hosted elsewhere, use the full
    // address, for example 'https://your-project.pages.dev/api'.
    apiBase: '/api',

    // Razorpay Checkout script. Loaded only when someone starts a payment.
    razorpayScript: 'https://checkout.razorpay.com/v1/checkout.js',
    merchantName: 'Tech Tycoon Digital Solution LLP',

    // Display only. The real amounts are fixed on the server.
    packages: {
      class: { label: 'Class Only', price: 299 },
      class_doc: { label: 'Class + Practical Learning Document', price: 799 }
    },

    whatsappChannel: 'https://whatsapp.com/channel/0029VbABrzBH5JM0FIG97q2b'
  };

  /* ---------------------------------------------------------
     2. Environment
     --------------------------------------------------------- */
  window.__ttReady = true;
  var root = document.documentElement;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isDesktop = function () { return window.matchMedia('(min-width: 1024px)').matches; };
  var isMobile = function () { return window.matchMedia('(max-width: 767px)').matches; };
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  var animate = hasGsap && !reduced;
  var lenis = null;

  if (animate) {
    gsap.registerPlugin(ScrollTrigger);
    root.classList.add('anim');
  } else {
    root.classList.remove('anim');
  }

  // Run a feature safely. If an animated feature breaks, show all content.
  function safe(name, fn, critical) {
    try { fn(); }
    catch (err) {
      console.error('[landing] ' + name + ' failed:', err);
      if (critical) root.classList.remove('anim');
    }
  }

  var headerH = function () { var h = $('.site-header'); return h ? h.offsetHeight : 0; };
  var pad2 = function (n) { return n < 10 ? '0' + n : String(n); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];

  // UTM capture (kept for the visit, even if people move around)
  function getUtm() {
    var keys = UTM_KEYS;
    var params = new URLSearchParams(window.location.search);
    var utm = {};
    try { utm = JSON.parse(sessionStorage.getItem('tt_utm') || '{}'); } catch (e) {}
    keys.forEach(function (k) { utm[k] = params.get(k) || utm[k] || ''; });
    try { sessionStorage.setItem('tt_utm', JSON.stringify(utm)); } catch (e) {}
    return utm;
  }

  // POST JSON to our API. Rejects with the server's message on any error.
  function api(path, body) {
    return fetch(CONFIG.apiBase + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (json) {
        if (!res.ok) { var err = new Error(json.error || ('HTTP ' + res.status)); err.data = json; err.status = res.status; throw err; }
        return json;
      });
    });
  }

  /* ---------------------------------------------------------
     3. Smooth scroll (Lenis) and anchor links
     --------------------------------------------------------- */
  function initSmoothScroll() {
    if (animate && window.Lenis) {
      lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    }

    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute('href');

      // Links still waiting for a real address (privacy policy, terms)
      if (id === '#' || a.hasAttribute('data-todo')) {
        e.preventDefault();
        console.warn('[landing] Add the real link for: ' + (a.getAttribute('data-todo') || 'this link'));
        return;
      }
      var target = id === '#top' ? document.body : $(id);
      if (!target) return;
      e.preventDefault();

      if (lenis) {
        lenis.scrollTo(id === '#top' ? 0 : target, { offset: id === '#top' ? 0 : -headerH() - 8, duration: 1.2 });
      } else {
        var y = id === '#top' ? 0 : target.getBoundingClientRect().top + window.pageYOffset - headerH() - 8;
        window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
      }
      // Move keyboard focus for screen reader and keyboard users
      if (id !== '#top') {
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
      if (history.replaceState) history.replaceState(null, '', id === '#top' ? ' ' : id);
    });
  }

  function scrollToY(y) {
    if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
    else window.scrollTo(0, y);
  }

  /* ---------------------------------------------------------
     4. Preloader and hero intro
     --------------------------------------------------------- */
  function initPreloader(done) {
    var pre = $('#preloader');
    if (!root.classList.contains('preload') || !pre) { done(); return; }

    var finished = false;

    // Fade out over 0.5 s (CSS transition on .is-done), then remove it.
    function finish() {
      if (finished) return;
      finished = true;
      pre.classList.add('is-done');
      setTimeout(function () { root.classList.remove('preload'); pre.classList.remove('is-done'); }, 500);
      setTimeout(done, 200);
    }

    $('#preloader-skip').addEventListener('click', finish);
    // Show for 2 s from when the page started loading (the progress bar fills in that time).
    setTimeout(finish, Math.max(0, 2000 - performance.now()));
  }

  var heroStarted = false;
  function heroIntro() {
    if (!animate || heroStarted) return;
    heroStarted = true;
    var tl = gsap.timeline();
    // If animation frames stall (background tab, very slow phone), still show the hero within 2.5 s.
    setTimeout(function () { if (tl.progress() < 1) tl.progress(1); }, 2500);
    tl.to('.hero .line-inner', { y: 0, duration: 0.9, ease: 'power4.out', stagger: 0.08 })
      .to('.hero-anim', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08 }, 0.15);  }

  /* ---------------------------------------------------------
     5. Section titles and scroll reveals
     --------------------------------------------------------- */
  function initTitles() {
    $$('[data-title]').forEach(function (el) {
      el.innerHTML = '<span class="line"><span class="line-inner">' + el.innerHTML + '</span></span>';
    });
    if (!animate) return;
    $$('[data-title]').forEach(function (el) {
      gsap.to(el.querySelector('.line-inner'), {
        y: 0, duration: 0.9, ease: 'power4.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });
  }

  function initReveals() {
    if (!animate) return;
    ScrollTrigger.batch('[data-reveal]', {
      start: 'top 88%',
      once: true,
      onEnter: function (batch) {
        gsap.to(batch, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08, overwrite: true });
      }
    });
  }

  /* ---------------------------------------------------------
     6. "Smarter way" line grows as it scrolls into view
     --------------------------------------------------------- */
  function initPain() {
    if (!animate) return;
    gsap.fromTo('.pain-answer', { scale: 0.82, opacity: 0.25 }, {
      scale: 1, opacity: 1, ease: 'none',
      scrollTrigger: { trigger: '.pain-answer', start: 'top 92%', end: 'top 50%', scrub: true }
    });
  }

  /* ---------------------------------------------------------
     7. The 20 problems: tabs, flip, copy, seen counter, pin
     --------------------------------------------------------- */
  function initProblems() {
    var section = $('#problems');
    var track = $('#ptrack');
    var wrap = $('.ptrack-wrap');
    if (!section || !track) return;

    var cards = $$('.pcard', track);
    var tabs = $$('.tab', section);
    var seen = {};
    var seenCount = 0;
    var countEl = $('#seen-count');
    var barEl = $('#seen-bar');
    var status = $('#copy-status');
    var active = 'teaching';
    var pinST = null;
    var pinTween = null;

    /* --- Seen counter --- */
    function markSeen(card) {
      var n = card.getAttribute('data-num');
      if (seen[n]) return;
      seen[n] = true;
      seenCount++;
      countEl.textContent = pad2(seenCount);
      barEl.style.transform = 'scaleX(' + (seenCount / 20) + ')';
    }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) markSeen(en.target); });
      }, { threshold: 0.6 });
      cards.forEach(function (c) { io.observe(c); });
    }

    /* --- Flip --- */
    function setFlipped(card, on, moveFocus) {
      var front = $('.pcard-front', card);
      var back = $('.pcard-back', card);
      card.classList.toggle('is-flipped', on);
      front.inert = on; back.inert = !on;
      front.setAttribute('aria-hidden', on ? 'true' : 'false');
      back.setAttribute('aria-hidden', on ? 'false' : 'true');
      if (on) markSeen(card);
      if (moveFocus) {
        setTimeout(function () {
          var t = on ? $('.btn-copy', card) : $('.pcard-flip', card);
          if (t) t.focus({ preventScroll: true });
        }, 50);
      }
    }
    cards.forEach(function (card) {
      setFlipped(card, false, false);
      card.addEventListener('click', function (e) {
        // Let people select prompt text or press Copy without flipping
        if (e.target.closest('.btn-copy, .pcard-prompt')) return;
        var viaButton = !!e.target.closest('button');
        setFlipped(card, !card.classList.contains('is-flipped'), viaButton);
      });
    });

    /* --- Copy prompt --- */
    function copyText(text) {
      if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
      }
      return new Promise(function (resolve, reject) {
        var ta = document.createElement('textarea');
        ta.value = text; ta.setAttribute('readonly', '');
        ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy') ? resolve() : reject(); } catch (err) { reject(err); }
        document.body.removeChild(ta);
      });
    }
    $$('.btn-copy', track).forEach(function (btn) {
      var label = $('span', btn);
      var use = $('use', btn);
      var timer;
      btn.addEventListener('click', function () {
        var text = $('.pcard-prompt', btn.closest('.pcard')).textContent.trim();
        copyText(text).then(function () {
          clearTimeout(timer);
          btn.classList.add('is-copied');
          label.textContent = 'Copied';
          use.setAttribute('href', '#i-check');
          status.textContent = 'Prompt copied';
          timer = setTimeout(function () {
            btn.classList.remove('is-copied');
            label.textContent = 'Copy prompt';
            use.setAttribute('href', '#i-copy');
            status.textContent = '';
          }, 1500);
        }).catch(function () {
          label.textContent = 'Select and copy';
        });
      });
    });

    /* --- Pinned horizontal scroll (desktop) --- */
    var pinMQ = window.matchMedia('(min-width: 1024px) and (min-height: 680px)');
    function canPin() { return animate && pinMQ.matches; }

    function buildPin() {
      if (pinST) { pinST.kill(true); pinST = null; }
      if (pinTween) { pinTween.kill(); pinTween = null; }
      if (hasGsap) gsap.set(track, { x: 0 });

      section.classList.toggle('is-horizontal', canPin());
      if (!canPin()) return;

      var dist = function () { return Math.max(0, track.scrollWidth - wrap.clientWidth); };
      if (dist() < 40) return; // everything fits, no need to pin

      pinTween = gsap.to(track, { x: function () { return -dist(); }, ease: 'none' });
      pinST = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: function () { return '+=' + dist(); },
        pin: true,
        scrub: 1,
        animation: pinTween,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        refreshPriority: 1
      });
      ScrollTrigger.sort();
    }

    /* --- Tabs --- */
    function applyTab(name) {
      cards.forEach(function (c) {
        c.classList.toggle('is-hidden', c.getAttribute('data-tab') !== name);
        if (c.classList.contains('is-flipped')) setFlipped(c, false, false);
      });
      track.setAttribute('aria-labelledby', 'tab-' + name);
    }

    function selectTab(tab, focus) {
      var name = tab.getAttribute('data-tab');
      if (name === active) return;

      var y = window.pageYOffset;
      var wasInPin = pinST && y >= pinST.start - 2 && y <= pinST.end + 2;

      active = name;
      tabs.forEach(function (t) {
        var on = t === tab;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
      });
      if (focus) tab.focus();
      applyTab(name);

      if (hasGsap) {
        buildPin();
        ScrollTrigger.refresh();
        if (wasInPin) scrollToY(pinST ? pinST.start : section.getBoundingClientRect().top + window.pageYOffset - headerH());
      }

      if (animate) {
        var visible = cards.filter(function (c) { return !c.classList.contains('is-hidden'); });
        gsap.fromTo(visible, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', stagger: 0.06, clearProps: 'opacity,transform' });
      }
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { selectTab(tab, false); });
      tab.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
        if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === 'Home') next = tabs[0];
        if (e.key === 'End') next = tabs[tabs.length - 1];
        if (next) { e.preventDefault(); selectTab(next, true); }
      });
    });

    applyTab(active);
    if (hasGsap) {
      buildPin();
      var onChange = function () { buildPin(); ScrollTrigger.refresh(); };
      if (pinMQ.addEventListener) pinMQ.addEventListener('change', onChange);
      else if (pinMQ.addListener) pinMQ.addListener(onChange);
    }
  }

  /* ---------------------------------------------------------
     8. Live prompt demo: typewriter, then result builds
     --------------------------------------------------------- */
  function initDemo() {
    var typed = $('#demo-typed');
    var result = $('#demo-result');
    var replay = $('#demo-replay');
    if (!typed || !result) return;

    var full = typed.textContent;
    var parts = [$('.dw-label', result)].concat($$('.dw-block', result));
    var runId = 0;

    if (reduced) return; // full text is already on the page

    function reset() {
      typed.textContent = '';
      result.classList.add('is-building');
      parts.forEach(function (p) { p.classList.remove('is-in'); });
    }

    function play() {
      var id = ++runId;
      reset();
      var i = 0;
      (function typeNext() {
        if (id !== runId) return;
        if (i <= full.length) {
          typed.textContent = full.slice(0, i++);
          setTimeout(typeNext, 40); // 40 ms per letter
        } else {
          parts.forEach(function (p, k) {
            setTimeout(function () { if (id === runId) p.classList.add('is-in'); }, 300 + k * 320);
          });
        }
      })();
    }

    reset();
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { play(); io.disconnect(); }
      }, { threshold: 0.35 });
      io.observe($('.demo-window'));
    } else {
      play();
    }
    replay.addEventListener('click', play);
  }

  /* ---------------------------------------------------------
     9. With and without AI: drag slider (mouse, touch, keys)
     --------------------------------------------------------- */
  function initSlider() {
    var ba = $('#ba');
    var handle = $('#ba-handle');
    if (!ba || !handle) return;

    var pos = 50;
    var dragging = false;

    function set(p) {
      pos = clamp(p, 0, 100);
      ba.style.setProperty('--pos', pos + '%');
      handle.setAttribute('aria-valuenow', Math.round(pos));
      handle.setAttribute('aria-valuetext', Math.round(pos) + ' percent shows the way without AI');
    }
    function fromEvent(e) {
      var r = ba.getBoundingClientRect();
      set(((e.clientX - r.left) / r.width) * 100);
    }

    ba.addEventListener('pointerdown', function (e) {
      dragging = true;
      try { ba.setPointerCapture(e.pointerId); } catch (err) {}
      fromEvent(e);
    });
    ba.addEventListener('pointermove', function (e) { if (dragging) fromEvent(e); });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (ev) {
      ba.addEventListener(ev, function () { dragging = false; });
    });

    handle.addEventListener('keydown', function (e) {
      var map = { ArrowLeft: -5, ArrowDown: -5, ArrowRight: 5, ArrowUp: 5, PageDown: -10, PageUp: 10 };
      if (e.key in map) { e.preventDefault(); set(pos + map[e.key]); }
      else if (e.key === 'Home') { e.preventDefault(); set(0); }
      else if (e.key === 'End') { e.preventDefault(); set(100); }
    });

    set(50);

    // A small nudge so people see it can move
    if (animate && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        var o = { p: 50 };
        gsap.timeline({ delay: 0.4, onUpdate: function () { if (!dragging) set(o.p); } })
          .to(o, { p: 34, duration: 0.7, ease: 'power2.inOut' })
          .to(o, { p: 64, duration: 0.9, ease: 'power2.inOut' })
          .to(o, { p: 50, duration: 0.6, ease: 'power2.inOut' });
      }, { threshold: 0.5 });
      io.observe(ba);
    }
  }

  /* ---------------------------------------------------------
     10. Session timeline: line draws, steps light up
     --------------------------------------------------------- */
  function initTimeline() {
    if (!animate) return;
    gsap.to('.tl-fill', {
      scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: '#timeline', start: 'top 65%', end: 'bottom 65%', scrub: true }
    });
    $$('.tl-step').forEach(function (step) {
      ScrollTrigger.create({
        trigger: step, start: 'top 65%',
        onEnter: function () { step.classList.add('is-active'); },
        onLeaveBack: function () { step.classList.remove('is-active'); }
      });
    });
  }

  /* ---------------------------------------------------------
     12. FAQ accordion
     --------------------------------------------------------- */
  function initFaq() {
    $$('.faq-q').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = btn.closest('.faq-item');
        var open = !item.classList.contains('open');
        item.classList.toggle('open', open);
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (hasGsap) setTimeout(function () { ScrollTrigger.refresh(); }, 480);
      });
    });
  }

  /* ---------------------------------------------------------
     13. Registration popup and Razorpay payment
     ---------------------------------------------------------
     One popup for every button:
       ₹299 button        → popup opens with Option 1 (Class Only) selected
       ₹799 button        → popup opens with Option 2 (Class + Document) selected
       "Reserve My Seat"  → popup opens, keeps any earlier choice
     People can switch package inside the popup. "Register Now" checks
     every field, saves the lead (/api/register, best effort), creates the
     order for the selected package (/api/create-order, price fixed on the
     server) and opens Razorpay with name, mobile and email filled in.
     The success view shows only after the server verifies the payment.
     --------------------------------------------------------- */
  function initRegister() {
    var modal = $('#reg-modal');
    if (!modal || typeof modal.showModal !== 'function') return;

    var section = $('#pricing');
    var form = $('#reg-form', modal);
    var formView = $('#reg-form-view', modal);
    var okView = $('#reg-success-view', modal);
    var okTitle = $('#reg-success-title', modal);
    var submit = $('#reg-submit', modal);
    var alertBox = $('#reg-alert', modal);
    var pkgSet = $('.reg-pkg', modal);
    var summary = $('#reg-summary', modal);
    var summaryValue = $('#reg-summary-value', modal);
    var pkgRadios = $$('input[name="package"]', form);
    var fields = {
      full_name: $('#reg-name', modal),
      mobile: $('#reg-mobile', modal),
      email: $('#reg-email', modal)
    };
    var errEl = {
      package: $('#reg-package-err', modal),
      full_name: $('#reg-name-err', modal),
      mobile: $('#reg-mobile-err', modal),
      email: $('#reg-email-err', modal)
    };
    var submitting = false; // creating the order or confirming the payment
    var paying = false;     // Razorpay window is open (popup is closed meanwhile)
    var verifying = false;
    var closing = false;
    var lastFailure = '';

    /* --- Package choice --- */
    function selectedPackage() {
      var r = $('input[name="package"]:checked', form);
      return r ? r.value : '';
    }
    function updateSummary() {
      var p = CONFIG.packages[selectedPackage()];
      summary.classList.toggle('is-empty', !p);
      summaryValue.textContent = p ? p.label + ' · ₹' + p.price : 'Please choose a package';
      if (!submitting) $('.btn-label', submit).textContent = p ? 'Register Now · ₹' + p.price : 'Register Now';
    }
    function selectPackage(pkg) {
      if (!CONFIG.packages[pkg]) return;
      pkgRadios.forEach(function (r) { r.checked = r.value === pkg; });
      showError('package', '');
      updateSummary();
    }
    pkgRadios.forEach(function (r) {
      r.addEventListener('change', function () { showError('package', ''); updateSummary(); });
    });

    /* --- Validation (the server checks the same rules again) --- */
    function normaliseMobile(v) {
      var d = String(v || '').replace(/\D/g, '');
      if (d.length === 12 && d.indexOf('91') === 0) d = d.slice(2);
      else if (d.length === 13 && d.indexOf('091') === 0) d = d.slice(3);
      else if (d.length === 11 && d.charAt(0) === '0') d = d.slice(1);
      return /^[6-9]\d{9}$/.test(d) ? d : '';
    }
    var nameRe;
    try { nameRe = new RegExp("^[\\p{L} .'-]+$", 'u'); } catch (e) { nameRe = /^[^0-9@#$%^&*()_+=<>?\/\\|{}\[\]~`!:;"]+$/; }

    var rules = {
      package: function () {
        return CONFIG.packages[selectedPackage()] ? '' : 'Please choose a package.';
      },
      full_name: function (v) {
        v = v.trim();
        if (!v) return 'Please enter your full name.';
        if (v.length < 2 || !nameRe.test(v)) return 'Please use letters only for your name.';
        return '';
      },
      mobile: function (v) {
        if (!v.trim()) return 'Please enter your mobile number.';
        return normaliseMobile(v) ? '' : 'Please enter a valid 10-digit mobile number, for example 98765 43210.';
      },
      email: function (v) {
        v = v.trim();
        if (!v) return 'Please enter your email address.';
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'Please enter a valid email address, for example name@gmail.com.';
      }
    };

    function showError(key, msg) {
      errEl[key].textContent = msg || '';
      if (key === 'package') pkgSet.classList.toggle('is-invalid', !!msg);
      else fields[key].setAttribute('aria-invalid', msg ? 'true' : 'false');
    }
    function check(key) {
      var msg = rules[key](key === 'package' ? '' : fields[key].value);
      showError(key, msg);
      return !msg;
    }
    function checkAll() {
      var first = null;
      ['package', 'full_name', 'mobile', 'email'].forEach(function (k) {
        if (!check(k) && !first) first = k === 'package' ? pkgRadios[0] : fields[k];
      });
      if (first) first.focus();
      return !first;
    }

    // Check a field when people leave it; clear the error as soon as it is fixed
    Object.keys(fields).forEach(function (k) {
      var el = fields[k];
      el.addEventListener('blur', function () {
        if (!el.value.trim()) return;
        // Tidy a valid number ("+91 98765-43210" → "98765 43210"); +91 is already shown
        if (k === 'mobile') { var m = normaliseMobile(el.value); if (m) el.value = m.slice(0, 5) + ' ' + m.slice(5); }
        check(k);
      });
      el.addEventListener('input', function () { if (el.getAttribute('aria-invalid') === 'true') check(k); });
    });

    function setAlert(msg) {
      alertBox.innerHTML = msg ? '<svg class="icon" aria-hidden="true"><use href="#i-alert"/></svg><span></span>' : '';
      if (msg) $('span', alertBox).textContent = msg;
      alertBox.hidden = !msg;
    }
    function setSubmitting(text) {
      submitting = !!text;
      submit.disabled = submitting;
      pkgRadios.forEach(function (r) { r.disabled = submitting; });
      submit.setAttribute('aria-busy', submitting ? 'true' : 'false');
      if (submitting) {
        submit.innerHTML = '<span class="reg-spinner" aria-hidden="true"></span><span class="btn-label"></span>';
        $('.btn-label', submit).textContent = text;
      } else {
        submit.innerHTML = '<span class="btn-label"></span>';
        updateSummary();
      }
    }

    /* --- Razorpay --- */
    var rzpLoading = null;
    function loadRazorpay() {
      if (window.Razorpay) return Promise.resolve();
      if (rzpLoading) return rzpLoading;
      rzpLoading = new Promise(function (resolve, reject) {
        var s = document.createElement('script');
        s.src = CONFIG.razorpayScript;
        s.async = true;
        s.onload = function () { window.Razorpay ? resolve() : reject(new Error('Razorpay missing')); };
        s.onerror = function () { rzpLoading = null; reject(new Error('Could not load Razorpay')); };
        document.head.appendChild(s);
      });
      return rzpLoading;
    }

    /* --- Submit: save the lead, create the order, open Razorpay --- */
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (submitting || paying) return; // no double submissions
      setAlert('');
      if (!checkAll()) return;

      var pkg = selectedPackage();
      var body = {
        package: pkg,
        full_name: fields.full_name.value.trim().replace(/\s+/g, ' '),
        mobile: normaliseMobile(fields.mobile.value),
        email: fields.email.value.trim(),
        website: form.elements.website.value,
        page_url: window.location.href.split('#')[0]
      };
      var utm = getUtm();
      UTM_KEYS.forEach(function (k) { body[k] = utm[k]; });

      setSubmitting('Opening secure payment...');
      lastFailure = '';

      // Save the lead first-hand (never blocks the payment)
      api('/register', body).then(function () {
        try {
          if (typeof window.fbq === 'function') window.fbq('track', 'Lead');
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({ event: 'generate_lead', form: 'registration', package: pkg, value: CONFIG.packages[pkg].price });
        } catch (err) {}
      }).catch(function (err) { console.warn('[landing] Lead not saved:', err && err.message); });

      var order;
      api('/create-order', body).then(function (o) {
        order = o;
        return loadRazorpay();
      }).then(function () {
        var rzp = new window.Razorpay({
          key: order.key_id,
          amount: order.amount,
          currency: order.currency,
          order_id: order.order_id,
          name: CONFIG.merchantName,
          description: order.package_label + ' · ₹' + (order.amount / 100),
          image: new URL('assets/logo-mark.png', window.location.href).href,
          prefill: { name: body.full_name, email: body.email, contact: '+91' + body.mobile },
          notes: { package: pkg },
          theme: { color: '#3D5BEF' },
          handler: verifyPayment,
          modal: {
            ondismiss: function () {
              if (verifying) return;
              paying = false;
              setSubmitting(false);
              open();
              setAlert((lastFailure ? 'The payment did not go through (' + lastFailure + '). ' : 'Payment window closed. ') +
                'Your seat is not reserved yet. Press Register Now to try again.');
            }
          }
        });
        rzp.on('payment.failed', function (r) {
          lastFailure = r && r.error && r.error.description ? r.error.description : 'payment failed';
        });
        // Razorpay draws its own window; the popup must close first, or it would sit on top
        paying = true;
        close(true);
        rzp.open();
      }).catch(function (err) {
        console.error('[landing] Could not start payment:', err);
        setSubmitting(false);
        var data = err && err.data;
        if (data && data.field && errEl[data.field]) showError(data.field, data.error);
        setAlert(err instanceof TypeError
          ? 'We could not reach the server. Please check your internet connection and try again.'
          : (data && data.field && data.error) || 'Online payment is not available right now. Please try again in a few minutes, or message us on our WhatsApp channel.');
      });
    });

    function verifyPayment(resp) {
      verifying = true;
      paying = false;
      open();
      setSubmitting('Confirming your payment...');
      api('/verify-payment', {
        razorpay_order_id: resp.razorpay_order_id,
        razorpay_payment_id: resp.razorpay_payment_id,
        razorpay_signature: resp.razorpay_signature
      }).then(function (result) {
        if (!result || result.verified !== true) throw new Error('not verified');
        try {
          if (typeof window.fbq === 'function') window.fbq('track', 'Purchase', { value: result.amount, currency: 'INR' });
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({ event: 'purchase', value: result.amount, currency: 'INR', package: result.package });
        } catch (err) {}
        verifying = false;
        setSubmitting(false);
        showSuccess(result);
      }).catch(function (err) {
        console.error('[landing] Payment verification failed:', err);
        verifying = false;
        setSubmitting(false);
        setAlert('We could not confirm your payment yet. If money was deducted, please do not pay again. ' +
          'Message us on our WhatsApp channel with this payment ID: ' + resp.razorpay_payment_id);
      });
    }

    /* Success: only ever called with a server-verified payment */
    function showSuccess(result) {
      var first = fields.full_name.value.trim().split(' ')[0];
      $('#reg-success-text', modal).textContent = 'Thank you' + (first ? ', ' + first : '') +
        '. We will send the joining details to your WhatsApp number and email. Please keep your payment ID for reference.';
      $('#reg-r-package', modal).textContent = result.package_label;
      $('#reg-r-amount', modal).textContent = '₹' + result.amount;
      $('#reg-r-payment', modal).textContent = result.payment_id;
      formView.hidden = true;
      okView.hidden = false;
      modal.setAttribute('aria-labelledby', 'reg-success-title');
      modal.setAttribute('aria-describedby', 'reg-success-text');
      okTitle.focus();

      // The pricing section keeps a copy of the receipt after the popup closes
      var confirmBox = $('#pay-confirm');
      if (section && confirmBox) {
        $('#r-package').textContent = result.package_label;
        $('#r-amount').textContent = '₹' + result.amount;
        $('#r-payment').textContent = result.payment_id;
        section.classList.add('is-paid');
        confirmBox.hidden = false;
        if (hasGsap) ScrollTrigger.refresh();
      }
    }
    function showForm() {
      okView.hidden = true;
      formView.hidden = false;
      modal.setAttribute('aria-labelledby', 'reg-title');
      modal.setAttribute('aria-describedby', 'reg-desc');
    }

    /* --- Open and close --- */
    function open(pkg) {
      if (paying) return;
      if (pkg) {
        if (!okView.hidden) showForm(); // paid before and now picking a package again
        setAlert('');
        selectPackage(pkg);
      }
      if (modal.open) return;
      closing = false;
      modal.classList.remove('is-closing');
      root.classList.add('reg-open');
      if (lenis) lenis.stop();
      modal.showModal();
      var target = !okView.hidden ? okTitle : (selectedPackage() ? fields.full_name : pkgRadios[0]);
      setTimeout(function () { target.focus(); }, 30);
    }
    function unlock() {
      root.classList.remove('reg-open');
      if (lenis) lenis.start();
    }
    function close(instant) {
      if (!modal.open || closing) return;
      if (submitting && !paying) return; // wait while the order is created or the payment confirmed
      unlock();
      if (instant || reduced) { modal.close(); return; }
      closing = true;
      modal.classList.add('is-closing');
      var done = function () {
        if (!closing) return;
        closing = false;
        modal.classList.remove('is-closing');
        modal.close();
      };
      modal.addEventListener('animationend', function onEnd(e) {
        if (e.target !== modal) return;
        modal.removeEventListener('animationend', onEnd);
        done();
      });
      setTimeout(done, 400); // in case animationend never fires
    }

    // Capture phase, so the smooth-scroll link handler does not also run
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-register], #pricing [data-package]');
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      open(btn.getAttribute('data-package') || '');
    }, true);

    modal.addEventListener('cancel', function (e) { e.preventDefault(); close(); }); // Esc key
    modal.addEventListener('close', unlock);
    modal.addEventListener('click', function (e) {
      if (e.target === modal || e.target.closest('[data-reg-close]')) close();
    });

    updateSummary();
  }

  /* ---------------------------------------------------------
     14. Header state and sticky mobile CTA
     --------------------------------------------------------- */
  function initHeader() {
    var header = $('.site-header');
    var onScroll = function () { header.classList.toggle('is-scrolled', window.pageYOffset > 10); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function initStickyCta() {
    var bar = $('#sticky-cta');
    if (!bar || !('IntersectionObserver' in window)) return;
    var link = $('a', bar);
    var heroIn = true, pricingIn = false;
    function update() {
      var show = !heroIn && !pricingIn;
      bar.classList.toggle('is-visible', show);
      bar.setAttribute('aria-hidden', show ? 'false' : 'true');
      link.tabIndex = show ? 0 : -1;
    }
    new IntersectionObserver(function (en) { heroIn = en[0].isIntersecting; update(); }, { threshold: 0.05 }).observe($('#hero'));
    new IntersectionObserver(function (en) { pricingIn = en[0].isIntersecting; update(); }, { threshold: 0.2 }).observe($('#pricing'));
  }

  /* ---------------------------------------------------------
     15. Background parallax on scroll (no mouse-follow effects)
     --------------------------------------------------------- */
  function initParallax() {
    if (!animate || isMobile()) return;
    $$('[data-speed]').forEach(function (el) {
      var speed = parseFloat(el.getAttribute('data-speed')) || 0.2;
      gsap.to(el, {
        '--py': (-400 * speed) + 'px', ease: 'none',
        scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true }
      });
    });
  }

  /* ---------------------------------------------------------
     16. Start
     --------------------------------------------------------- */
  var year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  safe('smooth scroll', initSmoothScroll);
  safe('titles', initTitles, true);
  safe('problems', initProblems, true); // creates the pin first so later triggers measure correctly
  safe('pain', initPain, true);
  safe('reveals', initReveals, true);
  safe('demo', initDemo);
  safe('slider', initSlider);
  safe('timeline', initTimeline, true);
  safe('faq', initFaq);
  safe('register', initRegister);
  safe('header', initHeader);
  safe('sticky cta', initStickyCta);
  safe('parallax', initParallax);

  safe('preloader', function () {
    initPreloader(function () { safe('hero intro', heroIntro, true); });
  }, true);
  // Belt and braces: the hero always starts, even if the preloader path fails.
  setTimeout(function () { safe('hero intro', heroIntro, true); }, 1900);

  // Fonts change text size, so measure again once they are ready.
  if (hasGsap) {
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  }
})();
