/* ==========================================================================
   Tech Tycoon – AI Filmmaking cinematic layer
   Visual-only enhancement for /ai_filmmaking:
   - hero video background, particles, camera drift, mouse parallax
   - GSAP ScrollTrigger section, text, card and image reveals
   - 3D tilt / spotlight on images and cards
   It only reads the rendered page and tags elements with data-cfx-*
   attributes. It never edits text, links, form fields or click handlers.
   ========================================================================== */
(function () {
  "use strict";

  var ROUTE = /^\/(ai_filmmaking|ai-filmmaking|ai_video_generation|ai-video-generation)\/?$/;
  if (!ROUTE.test(location.pathname)) return;

  var root = document.documentElement;
  var mq = function (q) { return window.matchMedia && window.matchMedia(q).matches; };
  var reduce = mq("(prefers-reduced-motion: reduce)");
  var fine = mq("(hover: hover) and (pointer: fine)");
  var mobile = mq("(max-width: 767px)");
  var desktop = mq("(min-width: 1024px)");
  var conn = navigator.connection || {};
  var lite = !!conn.saveData || /(^|-)2g$/.test(conn.effectiveType || "");
  var script = document.currentScript;
  var BASE = script && script.src ? script.src.replace(/[^/]*$/, "") : "/ai_filmmaking/fx/";

  // light corporate theme to match the AI Masterclass page (see "Light corporate theme" in cinematic.css)
  var LIGHT = true;

  root.classList.add("cfx");
  if (LIGHT) root.classList.add("cfx-light");

  /* ---------- helpers ---------- */

  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function tag(el, name, value) { if (el && !el.hasAttribute(name)) el.setAttribute(name, value == null ? "" : value); }
  function hasCls(el, s) { return (el.getAttribute("class") || "").indexOf(s) !== -1; }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = src;
      s.async = false;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function whenReady(cb) {
    var find = function () {
      var page = document.querySelector("#root > div.min-h-screen");
      return page && page.querySelector(":scope > section h1") ? page : null;
    };
    var page = find();
    if (page) return cb(page);
    var mo = new MutationObserver(function () {
      var p = find();
      if (p) { mo.disconnect(); cb(p); }
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
  }

  /* ---------- tagging (idempotent; re-run when React remounts nodes) ---------- */

  function scan(page) {
    var sections = $$(":scope > section", page);

    sections.forEach(function (s, i) {
      if (i === 0) return;
      tag(s, "data-cfx-sect");
      if (hasCls(s, "bg-[#060a18]") || !/bg-\[/.test(s.className)) tag(s, "data-cfx-glow");
    });

    // existing tilt cards (the page's own component writes inline transforms – never touch those)
    $$("div.w-full.h-full > div.relative", page).forEach(function (el) {
      if (hasCls(el, "transition-shadow")) tag(el, "data-cfx-card");
    });

    // AI video showcase cards and FAQ items: glow ring, and tilt for the showcase cards
    $$("div.rounded-2xl.overflow-hidden", page).forEach(function (el) {
      if (hasCls(el, "hover:border-blue-400") && el.querySelector("video")) {
        tag(el, "data-cfx-card", "static");
        tag(el, "data-cfx-tilt");
      } else if (el.querySelector(":scope > button") && hasCls(el, "bg-slate-900/90")) {
        tag(el, "data-cfx-card", "static");
      }
    });

    // workshop photos: tilt + scroll parallax inside the frame
    $$("div.group.relative.overflow-hidden", page).forEach(function (el) {
      var img = el.querySelector(":scope > img");
      if (!img) return;
      tag(el, "data-cfx-tilt");
      tag(el, "data-cfx-media");
      tag(img, "data-cfx-parallax");
    });

    // trainer photo
    $$("img", page).forEach(function (img) {
      if (/^Antony Praveen/.test(img.alt || "") && img.parentElement && hasCls(img.parentElement, "rounded-3xl")) {
        tag(img.parentElement, "data-cfx-photo");
        tag(img.parentElement, "data-cfx-tilt");
      }
    });

    // hero topic thumbnails float gently; deck thumbnails lift on hover
    var hero = sections[0];
    if (hero) {
      // requested copy change: hero headline reads "AI Filmmaking" instead of "3D AI Filmmaking".
      // Edits the existing text node so React keeps its reference. Move into the page source once it's in the repo.
      $$("h1 span", hero).forEach(function (s) {
        var t = s.firstChild;
        if (t && t.nodeType === 3 && t.nodeValue === "3D AI Filmmaking") t.nodeValue = "AI Filmmaking";
      });

      $$("img.w-12.h-12", hero).forEach(function (img, i) {
        tag(img, "data-cfx-float");
        img.style.setProperty("--cfx-i", i);
      });
      $$("button", hero).forEach(function (b) {
        if (b.querySelector("img") && hasCls(b, "rounded-xl") && hasCls(b, "p-1.5")) tag(b, "data-cfx-thumb");
      });
    }

    // stat chips
    $$("div.rounded-2xl.text-center, div.rounded-xl.text-center", page).forEach(function (el) {
      if (hasCls(el, "bg-white/5")) tag(el, "data-cfx-lift");
    });

    // primary CTAs (gradient / solid blue registration buttons)
    $$("button", page).forEach(function (b) {
      var c = b.getAttribute("class") || "";
      if (/(^|\s)(before|after):/.test(c)) return;
      var primary = /bg-gradient-to-r/.test(c) && /from-blue-600/.test(c);
      var register = /bg-blue-600/.test(c) && /font-black/.test(c) && /Register|Reserve|Book|Join/i.test(b.textContent || "");
      if (primary || register) tag(b, "data-cfx-cta");
    });

    // media and dark surfaces the light theme must leave alone (white text over imagery)
    $$(".aspect-video, [data-cfx-media], [data-cfx-photo], footer", page).forEach(function (el) {
      tag(el, "data-cfx-keep");
    });
  }

  /* ---------- hero background ---------- */

  function buildHero(hero) {
    if (hero.querySelector(":scope > .cfx-hero-bg")) return null;

    var bg = document.createElement("div");
    bg.className = "cfx-hero-bg";
    bg.setAttribute("aria-hidden", "true");
    bg.innerHTML =
      '<div class="cfx-hero-depth"><div class="cfx-hero-media"></div></div>' +
      '<canvas class="cfx-particles"></canvas>' +
      '<div class="cfx-hero-shade"></div>' +
      '<div class="cfx-hero-sweep"></div>';
    hero.insertBefore(bg, hero.firstChild);

    var media = bg.querySelector(".cfx-hero-media");
    media.style.backgroundImage = "url(" + BASE + "hero-bg-poster.jpg)";

    if (!reduce && !lite) {
      var video = document.createElement("video");
      video.muted = true;
      video.defaultMuted = true;
      video.loop = true;
      video.autoplay = true;
      video.playsInline = true;
      video.setAttribute("muted", "");
      video.setAttribute("playsinline", "");
      video.setAttribute("disablepictureinpicture", "");
      video.setAttribute("preload", "auto");
      video.setAttribute("tabindex", "-1");
      video.poster = BASE + "hero-bg-poster.jpg";
      var sources = mobile
        ? [["hero-bg-mobile.mp4", "video/mp4"]]
        : [["hero-bg.webm", "video/webm"], ["hero-bg.mp4", "video/mp4"]];

      var start = function () {
        sources.forEach(function (s) {
          var el = document.createElement("source");
          el.src = BASE + s[0];
          el.type = s[1];
          video.appendChild(el);
        });
        video.addEventListener("playing", function () { video.classList.add("cfx-on"); }, { once: true });
        media.appendChild(video);
        var p = video.play();
        if (p && p.catch) p.catch(function () { /* autoplay blocked: poster stays */ });
      };
      // let the page's own content load first
      if (document.readyState === "complete") setTimeout(start, 150);
      else window.addEventListener("load", function () { setTimeout(start, 150); }, { once: true });

      // pause when the hero is off screen
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (entries) {
          if (!video.parentNode) return;
          if (entries[0].isIntersecting) { var p = video.play(); if (p && p.catch) p.catch(function () {}); }
          else video.pause();
        }).observe(hero);
      }
    }

    if (!reduce && !LIGHT) particles(bg.querySelector(".cfx-particles"), hero);
    return bg;
  }

  var pointer = { x: 0, y: 0 };

  function particles(canvas, hero) {
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    var count = mobile ? 16 : desktop ? 54 : 30;
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var w = 0, h = 0, dots = [], running = false, visible = true, raf = 0;

    function size() {
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function spawn(d, fresh) {
      d.x = Math.random() * w;
      d.y = fresh ? Math.random() * h : h + 10;
      d.r = Math.random() * 1.6 + 0.4;
      d.z = Math.random() * 0.8 + 0.2;           // depth: drives speed, size, parallax
      d.vy = -(0.12 + d.z * 0.42);
      d.vx = (Math.random() - 0.5) * 0.12;
      d.t = Math.random() * Math.PI * 2;
      d.hue = Math.random() < 0.6 ? "56,189,248" : "167,139,250";
      return d;
    }
    function frame() {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      for (var i = 0; i < dots.length; i++) {
        var d = dots[i];
        d.x += d.vx; d.y += d.vy; d.t += 0.02;
        if (d.y < -10) spawn(d, false);
        var a = (0.35 + Math.sin(d.t) * 0.3) * d.z;
        var px = d.x + pointer.x * 18 * d.z, py = d.y + pointer.y * 12 * d.z;
        var g = ctx.createRadialGradient(px, py, 0, px, py, d.r * 6);
        g.addColorStop(0, "rgba(" + d.hue + "," + a + ")");
        g.addColorStop(1, "rgba(" + d.hue + ",0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(px, py, d.r * 6, 0, Math.PI * 2); ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    }
    function sync() {
      var should = visible && !document.hidden;
      if (should && !running) { running = true; raf = requestAnimationFrame(frame); }
      else if (!should && running) { running = false; cancelAnimationFrame(raf); }
    }

    size();
    for (var i = 0; i < count; i++) dots.push(spawn({}, true));
    window.addEventListener("resize", function () { size(); }, { passive: true });
    document.addEventListener("visibilitychange", sync);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (e) { visible = e[0].isIntersecting; sync(); }).observe(hero);
    }
    sync();
  }

  /* ---------- pointer: card spotlight + 3D tilt (delegated, survives React re-renders) ---------- */

  function bindPointer(gsap, hero, bg) {
    if (!fine) return;
    var active = null;
    var depth = bg && bg.querySelector(".cfx-hero-depth");
    // horizontal only: the hero media stays anchored to the top edge
    var dx = depth && gsap.quickTo(depth, "x", { duration: 1.2, ease: "power3.out" });

    function release(el) {
      gsap.to(el, {
        rotationX: 0, rotationY: 0, scale: 1, duration: 0.7, ease: "power3.out",
        onComplete: function () { gsap.set(el, { clearProps: "transform" }); }
      });
    }

    document.addEventListener("pointermove", function (e) {
      var card = e.target.closest && e.target.closest("[data-cfx-card]");
      if (card) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - r.left) + "px");
        card.style.setProperty("--my", (e.clientY - r.top) + "px");
      }

      var tilt = e.target.closest && e.target.closest("[data-cfx-tilt]");
      if (active && active !== tilt) { release(active); active = null; }
      if (tilt && !tilt.hasAttribute("data-cfx-busy")) {
        var b = tilt.getBoundingClientRect();
        var nx = (e.clientX - b.left) / b.width - 0.5;
        var ny = (e.clientY - b.top) / b.height - 0.5;
        active = tilt;
        gsap.to(tilt, {
          rotationY: nx * 10, rotationX: -ny * 8, scale: 1.02,
          transformPerspective: 900, duration: 0.5, ease: "power2.out", overwrite: "auto"
        });
      }

      if (depth && hero) {
        var hb = hero.getBoundingClientRect();
        if (e.clientY >= hb.top && e.clientY <= hb.bottom) {
          pointer.x = e.clientX / window.innerWidth - 0.5;
          pointer.y = (e.clientY - hb.top) / hb.height - 0.5;
          dx(pointer.x * -22);
        }
      }
    }, { passive: true });

    document.addEventListener("pointerleave", function () { if (active) { release(active); active = null; } });
  }

  /* ---------- scroll choreography ---------- */

  function motion(gsap, ScrollTrigger, page, bg) {
    gsap.registerPlugin(ScrollTrigger);
    var sections = $$(":scope > section", page);
    var hero = sections[0];

    var rise = desktop ? 56 : mobile ? 28 : 40;
    var tiltIn = desktop ? 14 : mobile ? 0 : 8;
    var blur = desktop ? "blur(8px)" : "none";
    var dur = mobile ? 0.7 : 1;

    function settle(targets) {
      gsap.set(targets, { clearProps: "transform,opacity,filter,visibility" });
      [].concat(targets).forEach(function (el) { el.removeAttribute && el.removeAttribute("data-cfx-busy"); });
    }
    function busy(els) { els.forEach(function (el) { el.setAttribute("data-cfx-busy", ""); }); }

    // scroll progress in the header
    ScrollTrigger.create({
      start: 0, end: "max",
      onUpdate: function (self) { root.style.setProperty("--cfx-progress", self.progress.toFixed(4)); }
    });

    // hero: background drifts and dims as the next section takes over
    if (bg && hero) {
      gsap.to(bg, {
        yPercent: 16, opacity: 0.35, ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true }
      });
    }

    sections.forEach(function (s, i) {
      if (i === 0) return;

      ScrollTrigger.create({
        trigger: s, start: "top 82%", once: true,
        onEnter: function () { s.setAttribute("data-cfx-in", ""); }
      });

      if (desktop && !LIGHT && s.hasAttribute("data-cfx-glow")) {
        gsap.fromTo(s, { "--cfx-shift": -1 }, {
          "--cfx-shift": 1, ease: "none",
          scrollTrigger: { trigger: s, start: "top bottom", end: "bottom top", scrub: true }
        });
      }

      var container = s.querySelector(":scope > div");
      if (!container) return;

      // section intro: chip, headline, description
      var head = container.querySelector(":scope > div.text-center");
      if (head && head.children.length) {
        var lines = Array.prototype.slice.call(head.children);
        gsap.from(lines, {
          y: rise * 0.6, opacity: 0, filter: blur, duration: dur, ease: "power3.out", stagger: 0.12,
          scrollTrigger: { trigger: head, start: "top 86%", once: true },
          onComplete: function () { settle(lines); }
        });
      }

      // content blocks: grids, tab rows, FAQ list, single feature cards
      $$(":scope > div:not(.text-center)", container).forEach(function (block) {
        var items = Array.prototype.slice.call(block.children);
        var single = block.classList.contains("w-full") && block.classList.contains("h-full");
        if (single) items = [block];
        if (!items.length) return;
        busy(items);
        gsap.from(items, {
          y: rise, opacity: 0, rotationX: tiltIn, transformPerspective: 1100, transformOrigin: "50% 0%",
          scale: single ? 0.96 : 1, duration: dur * 1.1, ease: "power3.out", stagger: { each: 0.12, from: "start" },
          scrollTrigger: { trigger: block, start: "top 86%", once: true },
          onComplete: function () { settle(items); }
        });
      });
    });

    // media reveals: frames wipe open while the picture settles from a slow zoom
    $$("[data-cfx-media]", page).forEach(function (frame) {
      var img = frame.querySelector("img");
      var tl = gsap.timeline({ scrollTrigger: { trigger: frame, start: "top 88%", once: true } });
      tl.from(frame, { clipPath: "inset(18% 10% 18% 10% round 16px)", duration: 1.2, ease: "expo.out" }, 0);
      if (img) tl.from(img, { scale: 1.35, duration: 1.6, ease: "expo.out", clearProps: "transform" }, 0);
      tl.eventCallback("onComplete", function () { gsap.set(frame, { clearProps: "clipPath" }); });

      if (img && !mobile) {
        ScrollTrigger.create({
          trigger: frame, start: "top bottom", end: "bottom top", scrub: true,
          onUpdate: function (self) { img.style.setProperty("--cfx-py", ((self.progress - 0.5) * 9).toFixed(2) + "%"); }
        });
      }
    });

    // inline AI videos: cinematic push-in on reveal
    $$("section video", page).forEach(function (v) {
      if (hero && hero.contains(v)) return;
      gsap.from(v, {
        scale: 1.22, duration: 1.6, ease: "expo.out", clearProps: "transform",
        scrollTrigger: { trigger: v, start: "top 90%", once: true }
      });
    });

    // trainer photo: rises with a subtle 3D turn
    $$("[data-cfx-photo]", page).forEach(function (p) {
      p.setAttribute("data-cfx-busy", "");
      gsap.from(p, {
        rotationY: desktop ? -18 : 0, y: 40, opacity: 0, transformPerspective: 900, duration: 1.3, ease: "power3.out",
        scrollTrigger: { trigger: p, start: "top 88%", once: true },
        onComplete: function () { settle(p); }
      });
    });

    // layout can change (FAQ open, tab switch, images loading) – keep triggers accurate
    var t = 0;
    var refresh = function () { clearTimeout(t); t = setTimeout(function () { ScrollTrigger.refresh(); }, 250); };
    if ("ResizeObserver" in window) new ResizeObserver(refresh).observe(page);
    window.addEventListener("load", refresh, { once: true });
  }

  /* ---------- boot ---------- */

  whenReady(function (page) {
    var hero = page.querySelector(":scope > section");
    var bg = buildHero(hero);
    scan(page);

    // re-tag nodes React remounts (tab switches, accordions)
    var pending = 0;
    new MutationObserver(function () {
      if (pending) return;
      pending = requestAnimationFrame(function () { pending = 0; scan(page); });
    }).observe(page, { childList: true, subtree: true });

    if (reduce) return;

    var ready = window.gsap && window.ScrollTrigger
      ? Promise.resolve()
      : loadScript(BASE + "gsap.min.js").then(function () { return loadScript(BASE + "ScrollTrigger.min.js"); });

    ready.then(function () {
      var gsap = window.gsap, ScrollTrigger = window.ScrollTrigger;
      motion(gsap, ScrollTrigger, page, bg);
      bindPointer(gsap, hero, bg);
    }).catch(function () { /* GSAP failed to load: page stays fully visible and usable */ });
  });
})();
