const fs = require('fs');
const path = require('path');

// 1. Copy index.html to 404.html for GitHub Pages SPA fallback
fs.copyFileSync('dist/index.html', 'dist/404.html');
console.log('✓ Created dist/404.html');

// 2. Pre-generate physical route folders with index.html for direct HTTP 200
const spaRoutes = [
  'bootcamp',
  'upscale',
  'academy',
  'admin-panel',
  'admin',
  'privacy',
  'thank-you',
  'thankyou',
  'college',
  'webinar-access',
  'watch',
  'main'
];

spaRoutes.forEach(route => {
  const dir = path.join('dist', route);
  fs.mkdirSync(dir, { recursive: true });
  const targetFile = path.join(dir, 'index.html');
  if (!fs.existsSync(targetFile)) {
    fs.copyFileSync('dist/index.html', targetFile);
    console.log(`✓ Created SPA route entry: ${targetFile}`);
  }
});

console.log('✓ Static SPA route preparation complete.');
