/**
 * Razorpay checkout for every purchase button ([data-pay], set by main.js).
 * Flow: api/create-order.php -> Razorpay Checkout -> api/verify.php (signature +
 * payment re-check on the server) -> status message. If confirmation is slow,
 * api/status.php is polled. The browser never sees the secret key and never
 * decides that a payment succeeded; only the server does.
 */
(function () {
  'use strict';

  var C = window.SITE_CONFIG;
  if (!C || !C.razorpay || !C.razorpay.enabled) return;

  var API = C.razorpay.apiBase || 'api/';
  var CHECKOUT_JS = 'https://checkout.razorpay.com/v1/checkout.js';
  var PENDING_KEY = 'tt_rzp_pending_order';
  var priceText = C.currency + C.price;

  var dialog = document.getElementById('pay-dialog');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  var $ = function (sel) { return dialog.querySelector(sel); };
  var els = {
    icon: $('[data-pay-icon]'), title: $('#pay-title'), msg: $('#pay-msg'), ref: $('[data-pay-ref]'),
    retry: $('[data-pay-retry]'), help: $('[data-pay-help]'), close: $('[data-pay-close]'),
  };

  var busy = false;      // a checkout is in progress: ignore further clicks
  var locked = false;    // dialog cannot be closed (payment being confirmed)

  // ---- Status dialog ----------------------------------------------------
  var ICONS = { success: 'i-check', failed: 'i-alert', pending: 'i-once', cancelled: 'i-once' };

  function show(state, title, msg, opts) {
    opts = opts || {};
    dialog.className = 'pay-dialog is-' + state;
    els.icon.innerHTML = ICONS[state]
      ? '<svg aria-hidden="true"><use href="#' + ICONS[state] + '"/></svg>'
      : '<span class="pay-spinner" aria-hidden="true"></span>';
    els.title.textContent = title;
    els.msg.textContent = msg;
    var ref = [opts.paymentId && 'Payment ID: ' + opts.paymentId, opts.orderId && 'Order ID: ' + opts.orderId]
      .filter(Boolean).join('\n');
    els.ref.textContent = ref;
    els.ref.hidden = !ref;
    els.retry.hidden = !opts.retry;
    els.help.hidden = !opts.help;
    if (opts.help) {
      var text = 'Hello! I need help with my payment for ' + C.productName + '.' + (ref ? '\n' + ref : '');
      els.help.href = 'https://wa.me/' + C.whatsapp.number + '?text=' + encodeURIComponent(text);
    }
    locked = state === 'processing';
    els.close.hidden = locked;
    dialog.setAttribute('aria-busy', locked ? 'true' : 'false');
    if (!dialog.open) dialog.showModal();
    (opts.retry ? els.retry : locked ? dialog : els.close).focus();
  }

  dialog.addEventListener('cancel', function (ev) { if (locked) ev.preventDefault(); });
  els.close.addEventListener('click', function () { dialog.close(); });
  els.retry.addEventListener('click', function () { dialog.close(); start(); });

  var paid = function (paymentId) {
    try { sessionStorage.removeItem(PENDING_KEY); } catch (e) {}
    show('success', 'Payment successful',
      'Thank you! Your payment of ' + priceText + ' is confirmed. Your access link to the ' +
      C.counts.skills + ' Claude skills will be sent to your email shortly. Please keep your Payment ID for reference.',
      { paymentId: paymentId, help: true });
  };
  var failed = function (reason, ids) {
    try { sessionStorage.removeItem(PENDING_KEY); } catch (e) {}
    show('failed', 'Payment failed',
      (reason ? reason.replace(/\.?$/, '. ') : '') +
      'You have not been charged. If any amount was deducted, it is reversed to your account automatically by your bank. You can try again.',
      Object.assign({ retry: true, help: true }, ids || {}));
  };

  // ---- Network helpers ----------------------------------------------------
  function api(path, body) {
    return fetch(API + path, body ? {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      credentials: 'same-origin',
    } : { credentials: 'same-origin', cache: 'no-store' }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (data) {
        data._http = r.status;
        return data;
      });
    });
  }

  var scriptPromise = null;
  function loadCheckout() {
    if (window.Razorpay) return Promise.resolve();
    if (!scriptPromise) {
      scriptPromise = new Promise(function (resolve, reject) {
        var s = document.createElement('script');
        s.src = CHECKOUT_JS;
        s.async = true;
        s.onload = function () { window.Razorpay ? resolve() : reject(new Error('load')); };
        s.onerror = function () { scriptPromise = null; s.remove(); reject(new Error('load')); };
        document.head.appendChild(s);
      });
    }
    return scriptPromise;
  }

  // ---- Confirmation -------------------------------------------------------
  function waitForConfirmation(orderId, paymentId) {
    show('processing', 'Confirming your payment…',
      'This usually takes a few seconds. Please don’t close or refresh this page, and don’t pay again.',
      { paymentId: paymentId });
    var tries = 0;
    poll();
    function next(pid) {
      paymentId = pid || paymentId;
      if (++tries < 20) return setTimeout(poll, 3000);
      // Still not confirmed after ~1 minute (e.g. bank delay). The server keeps
      // confirming via the webhook; tell the customer clearly not to pay twice.
      show('pending', 'Payment pending',
        'Your bank has not confirmed the payment yet. Please do not pay again. Most payments confirm within a few minutes; ' +
        'if it fails, any deducted amount is reversed automatically. Message us on WhatsApp with the IDs below and we will check it for you.',
        { paymentId: paymentId, orderId: orderId, help: true });
    }
    function poll() {
      api('status.php?order_id=' + encodeURIComponent(orderId)).then(function (r) {
        if (r.status === 'paid') return paid(r.payment_id || paymentId);
        if (r.status === 'failed') return failed(null, { orderId: orderId });
        next(r.payment_id);
      }, function () { next(); });
    }
  }

  function verify(resp, orderId) {
    try { sessionStorage.setItem(PENDING_KEY, orderId); } catch (e) {}
    show('processing', 'Confirming your payment…',
      'Please don’t close or refresh this page.', { paymentId: resp.razorpay_payment_id });
    api('verify.php', {
      razorpay_order_id: resp.razorpay_order_id,
      razorpay_payment_id: resp.razorpay_payment_id,
      razorpay_signature: resp.razorpay_signature,
    }).then(function (r) {
      if (r.status === 'paid') paid(r.payment_id);
      else if (r.status === 'failed') failed(r.error, { paymentId: resp.razorpay_payment_id, orderId: orderId });
      else waitForConfirmation(orderId, resp.razorpay_payment_id);
    }, function () {
      // Lost connection after paying: the server can still confirm it.
      waitForConfirmation(orderId, resp.razorpay_payment_id);
    });
  }

  // ---- Checkout -----------------------------------------------------------
  function setBusy(on) {
    busy = on;
    document.querySelectorAll('[data-pay]').forEach(function (b) {
      b.classList.toggle('is-loading', on);
      b.setAttribute('aria-busy', on ? 'true' : 'false');
    });
  }

  function start() {
    if (busy) return;
    setBusy(true);
    Promise.all([api('create-order.php', { product: C.razorpay.product }), loadCheckout()]).then(function (res) {
      var order = res[0];
      if (!order.order_id) throw new Error(order.error || 'order');

      var lastError = null;
      var done = false;
      var logo = new URL('assets/img/favicon-192.png', location.href).href;
      var rzp = new window.Razorpay({
        key: order.key_id,
        order_id: order.order_id,
        amount: order.amount,
        currency: order.currency,
        name: order.name,
        description: order.description,
        image: location.protocol === 'https:' ? logo : undefined,
        notes: { product: C.razorpay.product },
        theme: { color: '#FF7A47' },
        modal: {
          confirm_close: true,
          ondismiss: function () {
            setBusy(false);
            if (done) return;
            if (lastError) failed(lastError, { orderId: order.order_id });
            else show('cancelled', 'Payment cancelled',
              'You closed the payment window before paying, so nothing was charged. You can try again whenever you’re ready.',
              { retry: true });
          },
        },
        handler: function (resp) {
          done = true;
          setBusy(false);
          verify(resp, order.order_id);
        },
      });
      // Fires for each failed attempt; Razorpay lets the customer retry in the same window.
      rzp.on('payment.failed', function (r) {
        lastError = (r && r.error && r.error.description) || 'The payment did not go through';
      });
      rzp.open();
    }).catch(function (err) {
      setBusy(false);
      var msg = err && err.message && !/^(order|load)$/.test(err.message) ? err.message + ' ' : '';
      show('failed', 'Couldn’t open checkout',
        msg + (err && err.message === 'load'
          ? 'The secure payment window could not load. Please check your internet connection and try again.'
          : 'Nothing has been charged. Please try again, or message us on WhatsApp.'),
        { retry: true, help: true });
    });
  }

  document.querySelectorAll('[data-pay]').forEach(function (btn) {
    btn.addEventListener('click', function (ev) { ev.preventDefault(); start(); });
    // Warm up the checkout script when someone is about to click.
    btn.addEventListener('pointerenter', function () { loadCheckout().catch(function () {}); }, { once: true });
  });

  // Page was refreshed or reopened while a payment was being confirmed.
  try {
    var pendingOrder = sessionStorage.getItem(PENDING_KEY);
    if (pendingOrder) waitForConfirmation(pendingOrder);
  } catch (e) {}
})();
