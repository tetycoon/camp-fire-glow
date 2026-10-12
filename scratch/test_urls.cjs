const https = require('https');

const urls = [
  'https://aitycoon.in/',
  'https://aitycoon.in/bootcamp/',
  'https://aitycoon.in/upscale/',
  'https://aitycoon.in/academy/',
  'https://aitycoon.in/claude_masterclass/',
  'https://aitycoon.in/advanced_masterclass/',
  'https://aitycoon.in/ai_masterclass/'
];

async function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const titleMatch = data.match(/<title>([^<]+)<\/title>/i);
        const hasFbqInit = data.includes("fbq('init'");
        const hasFbqPageView = data.includes("fbq('track', 'PageView')");
        const isSpa = data.includes('src="/src/main.tsx"') || data.includes('dist/assets/index') || data.includes('/assets/index');
        resolve({
          url,
          status: res.statusCode,
          title: titleMatch ? titleMatch[1] : 'none',
          hasFbqInit,
          hasFbqPageView,
          isSpa
        });
      });
    }).on('error', (err) => {
      resolve({ url, error: err.message });
    });
  });
}

(async () => {
  for (const url of urls) {
    const res = await checkUrl(url);
    console.log(JSON.stringify(res, null, 2));
  }
})();
