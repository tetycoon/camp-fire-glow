# Ultimate Claude Skills — Landing Page (TechTycoon)

Static landing page for the Ultimate Claude Skills library (**₹499**), plus the separately sold
1,500+ AI Prompts Bundle (**₹499**). No build step, no dependencies.

## Run locally

```bash
npx serve .            # or: python -m http.server 8080
```

Opening `index.html` directly in a browser also works.

## Change price, links, counts

Edit **`assets/js/config.js`** only. It controls:

- main offer price and currency
- checkout URL (used by every main-offer purchase button)
- AI Prompts Bundle price and its own checkout URL. The ₹499 offer stays hidden until
  `aiPromptsBundle.checkoutUrl` is set.
- WhatsApp number and message
- skill and bonus counts
- tutorial video ID
- policy links

`index.html` contains the same values as no-JS/SEO fallback text. After editing the config, update the matching text in `index.html` and run:

```bash
node scripts/check.mjs
```

The check fails if any of these are true:
- an old price, discount or unverified claim (₹299, ₹7,997, "94% OFF", "lifetime", "10x", …) appears anywhere
- fallback text differs from the config
- a purchase button points to a different URL

## Structure

```
index.html              page markup (sections in reference order)
assets/css/styles.css   design tokens + all styles
assets/js/config.js     central offer configuration
assets/js/main.js       config binding, FAQ, sticky CTA, lightbox, video
assets/img/             client assets (review screenshots have avatars/numbers blurred)
scripts/check.mjs       offer consistency check
```

## Deploy

Upload the folder to any static host (Netlify, Vercel, Cloudflare Pages, cPanel) once `node scripts/check.mjs --launch` passes.
`<meta name="robots" content="noindex, nofollow">` is kept from the live page. Remove it if the page should be indexed.
