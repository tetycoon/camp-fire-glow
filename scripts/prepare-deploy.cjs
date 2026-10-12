const fs = require('fs');
const path = require('path');

// 1. Ensure CNAME and .nojekyll for GitHub Pages
fs.writeFileSync('dist/CNAME', 'course.techtycoon.in\n');
console.log('✓ Created dist/CNAME (course.techtycoon.in)');

if (!fs.existsSync('dist/.nojekyll')) {
  fs.writeFileSync('dist/.nojekyll', '');
  console.log('✓ Created dist/.nojekyll');
}

// 2. Copy index.html to 404.html for SPA fallback
fs.copyFileSync('dist/index.html', 'dist/404.html');
console.log('✓ Created dist/404.html');

// 3. Pre-generate physical route folders with index.html for direct HTTP 200 delivery
const spaRoutes = [
  'academy',
  'academy-preregister',
  'academy_preregister',
  'academy/preregister',
  'preregister',
  'main',
  'bootcamp',
  'college',
  'ai-masterclass',
  'ai_masterclass',
  'ai_masterclass/webinar',
  'ai_masterclass/watch',
  'ai_masterclass/webinar-watch',
  'ai_masterclass/thank-you',
  'ai_masterclass/thankyou',
  'ai_masterclass/webinar-access',
  'ai_masterclass2',
  'ai-masterclass2',
  'claude_masterclass',
  'claude-masterclass',
  'claude_masterclass/online',
  'claude_masterclass/offline',
  'claude-masterclass/online',
  'claude-masterclass/offline',
  'claude_masterclass/thank-you',
  'claude_masterclass/thankyou',
  'advanced_masterclass',
  'advanced-masterclass',
  'ai_bgm',
  'aibgm',
  'ai-bgm',
  'professionals',
  'professional',
  'upscale',
  'admin-panel',
  'admin',
  'thank-you',
  'thankyou',
  'privacy',
  'webinar-access',
  'webinar',
  'watch',
  'webinar-watch'
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
