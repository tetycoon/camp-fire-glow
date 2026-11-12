(function () {
  'use strict';

  var C = window.SITE_CONFIG;

  // ---- Apply central config -------------------------------------------
  if (C) {
    var get = function (key) {
      return key.split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, C);
    };
    var links = {
      checkout: C.checkoutUrl,
      whatsapp: 'https://wa.me/' + C.whatsapp.number + '?text=' + encodeURIComponent(C.whatsapp.message),
      phone1: 'tel:' + C.contact.phones[0].tel,
      phone2: 'tel:' + C.contact.phones[1].tel,
      email: 'mailto:' + C.contact.email,
    };
    document.querySelectorAll('[data-text]').forEach(function (el) {
      var key = el.getAttribute('data-text');
      var value = get(key);
      // Any key ending in "price" is formatted as money, e.g. "₹499".
      if (/(^|\.)price$/.test(key) && value != null) value = C.currency + value;
      if (value != null && value !== '') el.textContent = value;
    });

    // Sections that need a config value (e.g. a checkout URL) stay hidden without it.
    document.querySelectorAll('[data-requires]').forEach(function (el) {
      if (get(el.getAttribute('data-requires'))) el.hidden = false;
    });

    document.querySelectorAll('[data-href]').forEach(function (el) {
      var key = el.getAttribute('data-href');
      var href = links[key] || get(key);
      if (key === 'checkout') {
        // Direct CTA registration & checkout trigger
        el.setAttribute('href', '#');
        el.setAttribute('role', 'button');
        el.setAttribute('data-pay', '');
        el.classList.remove('is-pending');
        el.removeAttribute('aria-disabled');
        el.removeAttribute('title');
        el.addEventListener('click', function (e) {
          e.preventDefault();
          if (typeof window.openRegisterModal === 'function') {
            window.openRegisterModal();
          }
        });
      } else if (href) {
        el.setAttribute('href', href);
      }
    });

    // Staging banner lists exactly what is still missing before launch.
    var banner = document.querySelector('[data-staging]');
    if (banner && C.staging) {
      var pending = [];
      if (!C.checkoutUrl && !payOnPage) pending.push('checkout link');
      if (!document.querySelector('link[rel="canonical"]')) pending.push('website URL');
      if (document.querySelector('[data-placeholder="skill screenshot"]')) pending.push('skill screenshots');
      if (document.querySelector('[data-placeholder="customer reviews"]')) pending.push('customer reviews');
      banner.textContent = 'STAGING · Not for publishing' +
        (pending.length ? ' · Pending: ' + pending.join(', ') : '');
      banner.hidden = false;
    }

    // Tutorial video: lightweight facade, iframe loads only on click.
    var video = document.querySelector('[data-video]');
    if (video && C.tutorialVideoId) {
      var id = encodeURIComponent(C.tutorialVideoId);
      video.innerHTML =
        '<button type="button" class="video-play" aria-label="Play the tutorial video">' +
        '<img src="https://i.ytimg.com/vi/' + id + '/hqdefault.jpg" alt="" width="480" height="360" loading="lazy">' +
        '<span class="video-btn"><svg aria-hidden="true"><use href="#i-play"/></svg></span></button>';
      video.hidden = false;
      document.querySelector('[data-tutorial-label]').textContent = 'VIDEO TUTORIAL';
      video.querySelector('button').addEventListener('click', function () {
        video.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id +
          '?autoplay=1&rel=0" title="How to use the Claude skills" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
      });
    }
  }

  var year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();

  // ---- FAQ: keep one item open at a time ------------------------------
  var faqItems = document.querySelectorAll('.faq details');
  faqItems.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (!item.open) return;
      faqItems.forEach(function (other) { if (other !== item) other.open = false; });
    });
  });

  // ---- Sticky offer bar ------------------------------------------------
  // Visible once the hero CTAs have scrolled away; hidden while the final
  // CTA is on screen so two offers never compete.
  var bar = document.getElementById('sticky-offer');
  var heroCtas = document.getElementById('hero-ctas');
  var finalCta = document.getElementById('final-cta');
  if (bar && heroCtas && 'IntersectionObserver' in window) {
    var pastHero = false;
    var atFinal = false;
    var barLink = bar.querySelector('a');
    var setHeight = function () {
      document.documentElement.style.setProperty('--sticky-h', bar.offsetHeight + 'px');
    };
    setHeight();
    window.addEventListener('resize', setHeight);
    var update = function () {
      var show = pastHero && !atFinal;
      bar.classList.toggle('is-visible', show);
      bar.setAttribute('aria-hidden', show ? 'false' : 'true');
      barLink.tabIndex = show && barLink.hasAttribute('href') ? 0 : -1;
      document.body.classList.toggle('has-sticky', pastHero);
    };
    new IntersectionObserver(function (entries) {
      var e = entries[0];
      pastHero = !e.isIntersecting && e.boundingClientRect.top < 0;
      update();
    }).observe(heroCtas);
    if (finalCta) {
      new IntersectionObserver(function (entries) {
        atFinal = entries[0].isIntersecting;
        update();
      }, { threshold: 0.25 }).observe(finalCta);
    }
  }

  // ---- Review lightbox -------------------------------------------------
  var dialog = document.getElementById('lightbox');
  if (dialog && typeof dialog.showModal === 'function') {
    var img = null;
    document.querySelectorAll('[data-lightbox]').forEach(function (a) {
      a.addEventListener('click', function (ev) {
        ev.preventDefault();
        if (!img) img = dialog.appendChild(document.createElement('img'));
        img.src = a.getAttribute('href');
        img.alt = a.querySelector('img').alt;
        dialog.showModal();
      });
    });
    dialog.querySelector('.lightbox-close').addEventListener('click', function () { dialog.close(); });
    dialog.addEventListener('click', function (ev) { if (ev.target === dialog) dialog.close(); });
  }
})();
