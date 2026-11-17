// Offer consistency check. Run: node scripts/check.mjs
// - fails on any old price / discount / removed term anywhere in the project
// - fails if fallback text in index.html differs from assets/js/config.js
// - fails if any purchase CTA points somewhere other than its configured checkout
// - warns about leftover "Blizmatt" branding outside URLs
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = fileURLToPath(new URL('..', import.meta.url));
const errors = [];
const warnings = [];

// Load config the same way the browser does.
const sandbox = { window: {} };
vm.runInNewContext(readFileSync(join(root, 'assets/js/config.js'), 'utf8'), sandbox);
const C = sandbox.window.SITE_CONFIG;
const get = (k) => k.split('.').reduce((o, p) => (o == null ? o : o[p]), C);
// Mirrors main.js: keys ending in "price" are shown as money.
const display = (k) => (/(^|\.)price$/.test(k) ? C.currency + get(k) : String(get(k)));
const price = display('price');
const addonPrice = display('aiPromptsBundle.price');

// 1. Old prices, discount claims and removed content.
const banned = [
  /299/, /7,?997/, /6,?998/, /₹\s?999\b/, /\b9[46]\s?%/, /%\s*OFF/i, /save\s+\d+\s*%/i,
  /LIMITED10/, /lifetime/i, /10x/i, /4,?140/, /5,?000\+/, /chatgpt/i,
  /9234220213/, /92342 20213/, /7558133099/, /75581 33099/, /₹99(?!\d)/, /logo\.png/, /favicon\.png/,
  /9973596593/, /99735 96593/, /contact@blizmatt/i, /soluations/i,
  // Nothing from the reference site (a different company) may ship:
  /blizmatt/i, /assets\/img\/(skills|reviews)\//, /payment-methods\.webp/, /claude-icon\.jpg/,
];
const textFiles = [];
(function walk(dir) {
  for (const f of readdirSync(dir)) {
    if (f === 'node_modules' || f.startsWith('.')) continue;
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (['.html', '.css', '.js', '.json'].includes(extname(f))) textFiles.push(p);
  }
})(root);
for (const file of textFiles) {
  readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
    const where = `${file.slice(root.length)}:${i + 1}`;
    for (const re of banned) {
      if (re.test(line)) errors.push(`${where} outdated/removed term ${re}: ${line.trim().slice(0, 100)}`);
    }
  });
}
if (existsSync(join(root, 'assets/img/chatgpt-icon.webp'))) errors.push('assets/img/chatgpt-icon.webp still exists');

// 2. Fallback text must match config.
const html = readFileSync(join(root, 'index.html'), 'utf8');
for (const m of html.matchAll(/data-text="([^"]+)"[^>]*>([^<]*)</g)) {
  const [, key, text] = m;
  const want = display(key);
  if (text !== want) errors.push(`index.html: data-text="${key}" shows "${text}" but config says "${want}"`);
}

// 3. Every CTA uses its configured checkout URL.
const hrefOf = (tag) => (tag.match(/\shref="([^"]*)"/) || [])[1];
let ctas = 0;
for (const m of html.matchAll(/<a\b[^>]*data-href="checkout"[^>]*>/g)) {
  ctas++;
  const href = hrefOf(m[0]);
  // Pending checkout: buttons must carry no link at all (main.js shows them disabled).
  if (!C.checkoutUrl ? href !== undefined : href !== C.checkoutUrl) {
    errors.push(`checkout CTA has href "${href}", expected ${C.checkoutUrl || 'no href while checkout is pending'}`);
  }
}
if (ctas !== 7) errors.push(`expected 7 checkout CTAs, found ${ctas}`);
// The ₹499 bundle must never link to the ₹99 checkout, and its block must be hidden
// (data-requires) while it has no checkout of its own.
for (const m of html.matchAll(/<a\b[^>]*data-href="aiPromptsBundle\.checkoutUrl"[^>]*>/g)) {
  const href = hrefOf(m[0]);
  if (href && href === C.checkoutUrl) errors.push('AI Prompts Bundle CTA points at the main ₹99 checkout');
}
if (!/data-requires="aiPromptsBundle\.checkoutUrl" hidden/.test(html)) errors.push('AI Prompts Bundle block is not gated on its checkout URL');
if (C.aiPromptsBundle.checkoutUrl && C.aiPromptsBundle.checkoutUrl === C.checkoutUrl) errors.push('aiPromptsBundle.checkoutUrl is the same as the ₹99 checkout');
// Every WhatsApp link opens a chat with the configured number.
let waLinks = 0;
for (const m of html.matchAll(/https:\/\/wa\.me\/(\d+)/g)) {
  waLinks++;
  if (m[1] !== C.whatsapp.number) errors.push(`WhatsApp link uses ${m[1]}, expected ${C.whatsapp.number}`);
}
// Every call / email link uses a configured number or address.
const tels = C.contact.phones.map((p) => p.tel);
const telLinks = [...html.matchAll(/href="tel:([^"]+)"/g)].map((m) => m[1]);
for (const t of telLinks) if (!tels.includes(t)) errors.push(`tel link ${t} is not a configured number`);
for (const t of tels) if (!telLinks.includes(t)) errors.push(`configured number ${t} has no tel link`);
const mailLinks = [...html.matchAll(/href="mailto:([^"]+)"/g)].map((m) => m[1]);
for (const e of mailLinks) if (e !== C.contact.email) errors.push(`mailto link ${e}, expected ${C.contact.email}`);
if (!mailLinks.length) errors.push('no mailto link found');

// 4. Launch readiness. `node scripts/check.mjs --launch` fails until all are done.
const live = html.replace(/<!--[\s\S]*?-->/g, ''); // ignore commented-out templates
const pending = [];
const razorpayOn = !!(C.razorpay && C.razorpay.enabled);
if (!C.checkoutUrl && !razorpayOn) pending.push('payment: enable config.razorpay (or set config.checkoutUrl)');
if (razorpayOn) {
  for (const f of ['api/create-order.php', 'api/verify.php', 'api/status.php', 'api/webhook.php', 'assets/js/payment.js']) {
    if (!existsSync(join(root, f))) errors.push(`Razorpay enabled but ${f} is missing`);
  }
  if (!/assets\/js\/payment\.js/.test(live)) errors.push('Razorpay enabled but payment.js is not loaded in index.html');
}
// The server decides the charged amount; it must match the price shown on the page.
const boot = join(root, 'api/lib/bootstrap.php');
if (existsSync(boot)) {
  const m = readFileSync(boot, 'utf8').match(/'claude-skills'\s*=>\s*\[[^\]]*'amount'\s*=>\s*(\d+)/);
  if (!m) errors.push('api/lib/bootstrap.php: claude-skills amount not found');
  else if (Number(m[1]) !== C.price * 100) errors.push(`server charges ${Number(m[1]) / 100} but the page shows ${C.price} (api/lib/bootstrap.php RZP_PRODUCTS amount is in paise)`);
}
// No Razorpay key may be hard-coded anywhere in the project (secrets live outside public_html).
(function walkPhp(dir) {
  for (const f of readdirSync(dir)) {
    if (f === 'node_modules' || f.startsWith('.')) continue;
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walkPhp(p);
    else if (['.php', '.js', '.html', '.json', '.env'].includes(extname(f)) || f === '.env') {
      if (/rzp_(test|live)_(?!X{6,})[A-Za-z0-9]{6,}/.test(readFileSync(p, 'utf8'))) {
        errors.push(`${p.slice(root.length)} contains a Razorpay key. Keys belong in razorpay-private/secrets.php outside the website folder.`);
      }
    }
  }
})(root);
if (!/<link rel="canonical" href="https:\/\/[^"]+">/.test(live)) pending.push('website domain (canonical / og:url / og:image in index.html)');
if (/YOUR-DOMAIN/.test(live)) pending.push('YOUR-DOMAIN placeholder left in live markup');
const skillSlots = (live.match(/data-placeholder="skill screenshot"/g) || []).length;
if (skillSlots) pending.push(`${skillSlots} skill screenshot placeholder(s)`);
if (/data-placeholder="customer reviews"/.test(live)) pending.push('genuine customer reviews');
if (C.staging) pending.push('config.staging is still true');
for (const p of pending) warnings.push(p);

if (warnings.length) console.warn(`! NOT READY TO PUBLISH — ${warnings.length} pending:\n  ` + warnings.join('\n  '));
if (errors.length) {
  console.error(`✗ ${errors.length} problem(s):\n  ` + errors.join('\n  '));
  process.exit(1);
}
const addonState = C.aiPromptsBundle.checkoutUrl ? `live → ${C.aiPromptsBundle.checkoutUrl}` : 'hidden (no checkout URL yet)';
console.log(`✓ Main offer ${price} · ${ctas} checkout CTAs → ${razorpayOn ? 'Razorpay (on-page checkout)' : C.checkoutUrl || 'pending (disabled, no link)'}`);
console.log(`✓ AI Prompts Bundle ${addonPrice} · ${addonState}`);
console.log(`✓ ${waLinks} WhatsApp links → +${C.whatsapp.number}`);
console.log(`✓ ${telLinks.length} call links → ${tels.join(', ')} · ${mailLinks.length} email links → ${C.contact.email}`);
console.log('✓ No outdated prices, reference-site links, borrowed images or ChatGPT references found');
if (process.argv.includes('--launch') && pending.length) {
  console.error('✗ Launch check failed: resolve the pending items above before publishing.');
  process.exit(1);
}
