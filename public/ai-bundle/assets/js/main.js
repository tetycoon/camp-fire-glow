(function () {
  // Scale the 1440px stage scene to fit the screen (same behaviour as the reference)
  function fitStage() {
    var w = window.innerWidth;
    // grow to fill wide screens edge-to-edge, shrink to fit phones
    var s = Math.max(w / 1440, Math.min(1, w / 1060));
    document.documentElement.style.setProperty("--s", s.toFixed(4));
  }
  fitStage();
  window.addEventListener("resize", fitStage);

  // Fade-in on scroll
  var items = document.querySelectorAll(".fade");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("show"); io.unobserve(e.target); }
      });
    }, { threshold: 0.1 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("show"); });
  }

  // Countdown: 30 minutes from the visitor's first visit.
  // The end time is saved once and never reset on refresh — it stops at 00:00.
  var KEY = "tta_offer_end_30m", end = 0;
  try { end = parseInt(localStorage.getItem(KEY), 10) || 0; } catch (e) {}
  if (!end) {
    end = Date.now() + 30 * 60 * 1000;
    try { localStorage.setItem(KEY, String(end)); } catch (e) {}
  }
  var timers = document.querySelectorAll("[data-countdown]");
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  var iv;
  function tick() {
    var left = Math.max(0, end - Date.now());
    var m = pad(Math.floor(left / 6e4));
    var s = pad(Math.floor(left % 6e4 / 1e3));
    timers.forEach(function (t) {
      t.querySelector("[data-m]").textContent = m;
      t.querySelector("[data-s]").textContent = s;
      if (left === 0) t.classList.add("is-over");
    });
    if (left === 0 && iv) clearInterval(iv);
  }
  tick();
  iv = setInterval(tick, 1000);

  document.getElementById("year").textContent = new Date().getFullYear();

  // Confetti burst on load — same pattern as reference: 26 from left, 26 from right, 30 falling from top
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var colors = ["#0B1B3F", "#38BDF8", "#7DD3FC", "#0284C7", "#FFFFFF", "#BAE6FD"];
    var box = document.createElement("div");
    box.className = "confetti";
    box.setAttribute("aria-hidden", "true");
    function rnd(a, b) { return a + Math.random() * (b - a); }
    function piece(side) {
      var el = document.createElement("span");
      el.className = "cf " + side;
      var s = el.style, sign = side === "r" ? -1 : 1;
      var w = [8, 10, 12][Math.floor(Math.random() * 3)];
      var h = [6, 12, 16][Math.floor(Math.random() * 3)];
      if (side === "c") {
        s.left = rnd(0, 100) + "%";
        s.setProperty("--x", rnd(-80, 80).toFixed(0) + "px");
        s.animationDelay = rnd(0, 1.2).toFixed(2) + "s";
      } else {
        var x = rnd(180, 780);
        s.setProperty("--x", (sign * x).toFixed(0) + "px");
        s.setProperty("--y", (-rnd(400, 780)).toFixed(0) + "px");
        s.setProperty("--x2", (sign * (x + rnd(40, 190))).toFixed(0) + "px");
        s.setProperty("--r", rnd(-450, 450).toFixed(0) + "deg");
        s.animationDelay = rnd(.15, .5).toFixed(2) + "s";
      }
      s.setProperty("--r2", rnd(-1000, 1000).toFixed(0) + "deg");
      s.width = w + "px";
      s.height = h + "px";
      s.borderRadius = Math.random() < .5 ? "50%" : "2px";
      s.background = colors[Math.floor(Math.random() * colors.length)];
      if (s.background.indexOf("255, 255, 255") > -1 || s.background === "#FFFFFF") s.boxShadow = "0 0 0 1px #BAE6FD";
      box.appendChild(el);
    }
    for (var i = 0; i < 26; i++) { piece("l"); piece("r"); }
    for (var j = 0; j < 30; j++) piece("c");
    document.body.appendChild(box);
    setTimeout(function () { box.remove(); }, 5500);
  }
})();
