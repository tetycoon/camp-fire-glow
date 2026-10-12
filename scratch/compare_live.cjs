const https = require('https');

const urls = [
  'https://aitycoon.in/',
  'https://aitycoon.in/advanced_masterclass/',
  'https://aitycoon.in/claude_masterclass/',
  'https://aitycoon.in/bootcamp/'
];

function check(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        const titleMatch = data.match(/<title>([^<]+)<\/title>/i);
        const hasOgUrl = data.match(/<meta[^>]+property=["']og:url["'][^>]*>/i);
        const hasCanonical = data.match(/<link[^>]+rel=["']canonical["'][^>]*>/i);
        const hasFbqInit = data.includes("fbq('init'");
        const hasFbqPageViewInHead = (data.match(/<head[\s\S]*?<\/head>/i)?.[0] || '').includes("fbq('track', 'PageView')");
        const isSpa = data.includes('/assets/index-') || data.includes('/src/main.tsx');
        resolve({
          url,
          httpStatus: res.statusCode,
          contentLength: data.length,
          title: titleMatch ? titleMatch[1] : null,
          isSpa,
          ogUrlTag: hasOgUrl ? hasOgUrl[0] : null,
          canonicalTag: hasCanonical ? hasCanonical[0] : null,
          hasFbqInit,
          hasFbqPageViewInHead
        });
      });
    }).on('error', err => resolve({ url, error: err.message }));
  });
}

(async () => {
  for (const u of urls) {
    const r = await check(u);
    console.log(JSON.stringify(r, null, 2));
  }
})();
