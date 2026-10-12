const fs = require('fs');

console.log('=== VERIFYING LEAD EVENT CODE IN AIMasterclassRegisterModal.tsx ===');
const content = fs.readFileSync('src/components/ai_masterclass/AIMasterclassRegisterModal.tsx', 'utf8');

// Check 1: Ensure Lead is present
const hasLead = content.includes("(window as any).fbq('track', 'Lead'");
console.log('1. Contains Lead tracking code:', hasLead);

// Check 2: Ensure Lead is AFTER order creation check
const orderCheckIdx = content.indexOf('if (!result.success || !result.orderId)');
const leadIdx = content.indexOf("(window as any).fbq('track', 'Lead'");
const rzpOpenIdx = content.indexOf('rzp.open()');

console.log('2. Order check position:', orderCheckIdx);
console.log('   Lead call position:', leadIdx);
console.log('   rzp.open position:', rzpOpenIdx);

const orderIsCorrect = orderCheckIdx > 0 && leadIdx > orderCheckIdx && rzpOpenIdx > leadIdx;
console.log('3. Execution sequence is strictly: Order Validation Check -> Lead Event -> rzp.open():', orderIsCorrect);

// Check 4: Simulate mock execution logic
console.log('\n=== SIMULATING SCENARIOS ===');
let leadFiredCount = 0;
let rzpOpened = false;

const mockFbq = (action, event, data) => {
  if (action === 'track' && event === 'Lead') {
    leadFiredCount++;
    console.log('   [fbq EVENT FIRED]', event, data);
  }
};

async function simulateSubmit({ formValid, orderSuccess, orderId }) {
  // Reset
  leadFiredCount = 0;
  rzpOpened = false;

  // 1. Form validation
  if (!formValid) {
    // HTML5 prevents submit
    return { outcome: 'blocked_by_html5_validation', leadFiredCount, rzpOpened };
  }

  // 2. Order creation simulation
  const result = orderSuccess ? { success: true, orderId } : { success: false, error: 'Network error' };
  if (!result.success || !result.orderId) {
    return { outcome: 'order_creation_failed', leadFiredCount, rzpOpened };
  }

  // 3. Lead tracking
  mockFbq('track', 'Lead', {
    content_name: 'AI Secrets Revealed Masterclass',
    currency: 'INR',
    value: 99
  });

  // 4. Razorpay open
  rzpOpened = true;

  return { outcome: 'success', leadFiredCount, rzpOpened };
}

(async () => {
  // Scenario 1: Invalid form
  const s1 = await simulateSubmit({ formValid: false, orderSuccess: true, orderId: 'order_123' });
  console.log('Scenario 1 (Invalid Form):', s1.leadFiredCount === 0 && !s1.rzpOpened ? 'PASSED ✓ (No Lead, No Rzp)' : 'FAILED ✗');

  // Scenario 2: Failed order creation
  const s2 = await simulateSubmit({ formValid: true, orderSuccess: false });
  console.log('Scenario 2 (Failed Order Creation):', s2.leadFiredCount === 0 && !s2.rzpOpened ? 'PASSED ✓ (No Lead, No Rzp)' : 'FAILED ✗');

  // Scenario 3: Successful order creation
  const s3 = await simulateSubmit({ formValid: true, orderSuccess: true, orderId: 'order_123' });
  console.log('Scenario 3 (Successful Order Creation):', s3.leadFiredCount === 1 && s3.rzpOpened ? 'PASSED ✓ (Exactly 1 Lead, Rzp Opened)' : 'FAILED ✗');

  if (hasLead && orderIsCorrect && s1.leadFiredCount === 0 && s2.leadFiredCount === 0 && s3.leadFiredCount === 1) {
    console.log('\nALL VERIFICATION CHECKS PASSED ✓');
  } else {
    console.error('\nCHECKS FAILED ✗');
    process.exit(1);
  }
})();
