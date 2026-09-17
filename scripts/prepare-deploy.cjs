const fs = require('fs');
const path = require('path');

// 1. Ensure CNAME and .nojekyll for GitHub Pages
if (!fs.existsSync('dist/CNAME')) {
  fs.writeFileSync('dist/CNAME', 'aitycoon.in\n');
  console.log('✓ Created dist/CNAME');
}
if (!fs.existsSync('dist/.nojekyll')) {
  fs.writeFileSync('dist/.nojekyll', '');
  console.log('✓ Created dist/.nojekyll');
}

// 2. Copy index.html to 404.html for SPA fallback
fs.copyFileSync('dist/index.html', 'dist/404.html');
console.log('✓ Created dist/404.html');

// 3. Pre-generate physical route folders with index.html for direct HTTP 200 delivery
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
  'ai_masterclass',
  'ai-masterclass',
  'webinar-access',
  'watch',
  'main'
];

spaRoutes.forEach(route => {
  const dir = path.join('dist', route);
  fs.mkdirSync(dir, { recursive: true });
  const targetFile = path.join(dir, 'index.html');
  // Don't overwrite if dedicated static html already exists
  if (!fs.existsSync(targetFile)) {
    fs.copyFileSync('dist/index.html', targetFile);
    console.log(`✓ Created SPA route entry: ${targetFile}`);
  }
});

console.log('✓ Static SPA route preparation complete.');
