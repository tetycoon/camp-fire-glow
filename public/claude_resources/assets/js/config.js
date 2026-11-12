/**
 * Central offer configuration — edit values here only.
 * Every price, purchase link, WhatsApp link and product count on the page
 * is filled from this object (see assets/js/main.js). The matching text in
 * index.html is only a no-JS fallback; keep it in sync when values change
 * (run `node scripts/check.mjs` to catch drift).
 */
window.SITE_CONFIG = {
  // true = staging: shows the "not ready to publish" banner listing what's pending.
  // Set to false only after `node scripts/check.mjs --launch` passes.
  staging: false,

  brand: 'TechTycoon',
  productName: 'Ultimate Claude Skills',

  // Main offer (Claude Skills library) price. Shown as e.g. "₹499".
  // NOTE: the checkout page itself must also charge this amount.
  currency: '₹',
  price: 499,

  // Razorpay checkout on this page (server code in /api, keys in a private file on
  // the server — never here). When enabled, every purchase button opens Razorpay.
  // Keep false until the keys are set up on the server (see README "Payments").
  razorpay: {
    enabled: false,
    apiBase: 'api/',
    product: 'claude-skills', // price is set on the server in api/lib/bootstrap.php
  },

  // Alternative to Razorpay: an external checkout link for every purchase CTA.
  // Used only when razorpay.enabled is false. While both are off, the purchase
  // buttons are shown disabled ("checkout pending").
  checkoutUrl: '',

  whatsapp: {
    number: '917558133039', // country code + number, digits only
    display: '+91 75581 33039',
    message: 'Hello! I have a question about the Ultimate Claude Skills library.',
  },

  // Phone numbers (tel: links) and email (mailto: link) shown on the page.
  contact: {
    phones: [
      { tel: '+917558133039', display: '+91 75581 33039' },
      { tel: '+917010340494', display: '+91 70103 40494' },
    ],
    email: 'techtycoondigitalsolutions@gmail.com',
  },

  // Confirmed by the owner. Change here to update the whole page.
  counts: {
    skills: '4,000+',
    categories: '130+',
    claudePrompts: '2,500+',
    aiPrompts: '1,500+',
  },

  // Separate product, sold on its own (not part of the main Claude Skills offer).
  // The offer stays hidden until checkoutUrl is set, so no dead button ships.
  // NOTE: that checkout page must charge this same amount.
  aiPromptsBundle: {
    price: 499,
    checkoutUrl: '',
  },

  // YouTube video ID for the tutorial (e.g. 'dQw4w9WgXcQ').
  // Leave empty to hide the video player.
  tutorialVideoId: '',
};
