const fs = require('fs');
const path = require('path');

console.log('=== 1. VERIFYING DIST HTML FILES ===');
const filesToCheck = [
  { p: 'dist/index.html', isStandalone: false },
  { p: 'dist/bootcamp/index.html', isStandalone: false },
  { p: 'dist/upscale/index.html', isStandalone: false },
  { p: 'dist/academy/index.html', isStandalone: false },
  { p: 'dist/ai_masterclass/index.html', isStandalone: false },
  { p: 'dist/advanced_masterclass/index.html', isStandalone: true },
  { p: 'dist/claude_masterclass/index.html', isStandalone: true }
];

let allPassed = true;

for (const { p, isStandalone } of filesToCheck) {
  if (!fs.existsSync(p)) {
    console.error(`FAIL: ${p} does not exist!`);
    allPassed = false;
    continue;
  }
  const content = fs.readFileSync(p, 'utf8');
  const hasInit = content.includes("fbq('init', '2155724311994078')");
  // Check if <head> contains static PageView call
  const headMatch = content.match(/<head[\s\S]*?<\/head>/i);
  const headContent = headMatch ? headMatch[0] : '';
  const headHasPageView = headContent.includes("fbq('track', 'PageView')");

  console.log(`Checking ${p}:`);
  console.log(`  - Has Pixel init 2155724311994078: ${hasInit}`);
  console.log(`  - Head has static PageView: ${headHasPageView} (expected: ${isStandalone})`);

  if (!hasInit) {
    console.error(`  FAIL: Missing Pixel Init`);
    allPassed = false;
  }
  if (isStandalone && !headHasPageView) {
    console.error(`  FAIL: Standalone page should have static PageView`);
    allPassed = false;
  }
  if (!isStandalone && headHasPageView) {
    console.error(`  FAIL: SPA template should NOT have static PageView in <head>`);
    allPassed = false;
  }
}

console.log('\n=== 2. VERIFYING BUNDLED JS FOR ROUTE TRACKER ===');
const assetsDir = path.join('dist', 'assets');
const jsFiles = fs.readdirSync(assetsDir).filter(f => f.startsWith('index-') && f.endsWith('.js'));
if (jsFiles.length === 0) {
  console.error('FAIL: No index bundle found in dist/assets!');
  allPassed = false;
} else {
  const bundleContent = fs.readFileSync(path.join(assetsDir, jsFiles[0]), 'utf8');
  const hasFbqTracker = bundleContent.includes('"track","PageView"') || bundleContent.includes("'track','PageView'") || bundleContent.includes('fbq("track","PageView")') || bundleContent.includes('.fbq("track","PageView")');
  console.log(`Bundle ${jsFiles[0]}:`);
  console.log(`  - Contains React Router PageView tracker: ${hasFbqTracker}`);
  if (!hasFbqTracker) {
    console.error('  FAIL: PageView tracker not found in JS bundle');
    allPassed = false;
  }
}

console.log('\n=== 3. SIMULATING STRICTMODE & ROUTE CHANGE LOGIC ===');
// Simulate tracker logic
const trackedEvents = [];
const mockFbq = (action, event) => {
  trackedEvents.push({ action, event, url: mockLocation.pathname + mockLocation.search });
};
let mockLocation = { pathname: '/', search: '' };
let lastTrackedUrl = null;

function simulateRouteTrackerEffect() {
  const currentUrl = mockLocation.pathname + mockLocation.search;
  if (lastTrackedUrl === currentUrl) {
    return; // guard against duplicate
  }
  lastTrackedUrl = currentUrl;
  mockFbq('track', 'PageView');
}

// Test initial mount (StrictMode runs effect twice)
simulateRouteTrackerEffect();
simulateRouteTrackerEffect(); // duplicate run on initial mount
console.log(`Initial mount (with StrictMode double-run): PageViews fired = ${trackedEvents.length} (expected: 1)`);
if (trackedEvents.length !== 1) allPassed = false;

// Test client-side navigation to /bootcamp/
mockLocation = { pathname: '/bootcamp/', search: '' };
simulateRouteTrackerEffect();
simulateRouteTrackerEffect(); // duplicate run
console.log(`After nav to /bootcamp/: Total PageViews = ${trackedEvents.length} (expected: 2), latest URL = ${trackedEvents[1].url}`);
if (trackedEvents.length !== 2 || trackedEvents[1].url !== '/bootcamp/') allPassed = false;

// Test client-side navigation to /upscale/
mockLocation = { pathname: '/upscale/', search: '' };
simulateRouteTrackerEffect();
console.log(`After nav to /upscale/: Total PageViews = ${trackedEvents.length} (expected: 3), latest URL = ${trackedEvents[2].url}`);
if (trackedEvents.length !== 3 || trackedEvents[2].url !== '/upscale/') allPassed = false;

// Test client-side navigation to /academy/
mockLocation = { pathname: '/academy/', search: '' };
simulateRouteTrackerEffect();
console.log(`After nav to /academy/: Total PageViews = ${trackedEvents.length} (expected: 4), latest URL = ${trackedEvents[3].url}`);
if (trackedEvents.length !== 4 || trackedEvents[3].url !== '/academy/') allPassed = false;

console.log(`\nOverall Test Result: ${allPassed ? 'ALL CHECKS PASSED ✓' : 'TESTS FAILED ✗'}`);
process.exit(allPassed ? 0 : 1);
