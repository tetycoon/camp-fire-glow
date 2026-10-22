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
  'ai_bgm',
  'aibgm',
  'ai-bgm',
  'professionals',
  'professional',
  'consulting',
  'consultation',
  '1on1',
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
  // Never overwrite standalone static pages from public/
  const publicStatic = path.join('public', route, 'index.html');
  if (fs.existsSync(publicStatic)) {
    console.log(`✓ Preserving standalone static page: ${route}`);
    return;
  }
  const dir = path.join('dist', route);
  fs.mkdirSync(dir, { recursive: true });
  const targetFile = path.join(dir, 'index.html');
  fs.copyFileSync('dist/index.html', targetFile);
  console.log(`✓ Updated SPA route entry: ${targetFile}`);
});

// Ensure dedicated static landing pages are present and untouched in dist
['advanced_masterclass', 'claude_masterclass'].forEach(folder => {
  const src = path.join('public', folder, 'index.html');
  const destDir = path.join('dist', folder);
  const dest = path.join(destDir, 'index.html');
  if (fs.existsSync(src)) {
    fs.mkdirSync(destDir, { recursive: true });
    fs.copyFileSync(src, dest);
    console.log(`✓ Verified dedicated static page: ${dest}`);
  }
});

// 4. Security Gate: Verify no .gs files or secret patterns exist in public/ or dist/
function scanDirForExposures(dirPath, violations = []) {
  if (!fs.existsSync(dirPath)) return violations;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const forbiddenPatterns = [
    { label: 'RAZORPAY_KEY_SECRET assignment', regex: /RAZORPAY_KEY_SECRET(?:_INTL)?\s*=\s*["'][^"']+["']/ },
    { label: 'FunnelsDone PIT token', regex: /pit-us-[0-9a-f-]{20,}/i },
    { label: 'Meta Graph EAA access token', regex: /EAef8[A-Za-z0-9]{30,}/ }
  ];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      scanDirForExposures(fullPath, violations);
    } else if (entry.isFile()) {
      if (entry.name.endsWith('.gs')) {
        violations.push(`Forbidden backend script file in web-accessible directory: ${fullPath}`);
      }
      if (/\.(js|html|json|txt|gs|map|css)$/i.test(entry.name)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        for (const p of forbiddenPatterns) {
          if (p.regex.test(content)) {
            violations.push(`Forbidden secret pattern (${p.label}) detected in: ${fullPath}`);
          }
        }
      }
    }
  }
  return violations;
}

const securityViolations = [
  ...scanDirForExposures('public'),
  ...scanDirForExposures('dist')
];

if (securityViolations.length > 0) {
  console.error('❌ SECURITY GATE FAILED:');
  securityViolations.forEach(v => console.error('  - ' + v));
  process.exit(1);
}

console.log('✓ Security gate passed: zero .gs files or secret patterns in public/ and dist/.');
console.log('✓ Static SPA route preparation complete.');
