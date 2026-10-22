/**
 * STAGING CONFIGURATION ISOLATION VERIFIER
 * TECH TYCOON DIGITAL SOLUTION LLP
 * 
 * Purpose:
 * Pre-flight audit tool to verify staging configurations before deployment.
 * Strictly guarantees that no production credentials, destinations, spreadsheets,
 * or accounts can be accidentally loaded into a staging environment.
 * 
 * Safety Rule:
 * Never prints secrets, API keys, or private tokens to stdout/stderr.
 */

const KNOWN_PRODUCTION_GAS_URLS = [
  "https://script.google.com/macros/s/AKfycbzPxPpp0ksCcE6IY8mUlzcu0jqY1RSfhCl2Locq1iOYbbe5beBeeQ6uefCV93Nxy8rbsg/exec", // upscale
  "https://script.google.com/macros/s/AKfycbw59X8thSpB9xrJSI0GhACEm617vAbc7BDH6hJFOOBsOeq-B4az0p3B_O6koMjYfsppgA/exec", // advanced_masterclass
  "https://script.google.com/macros/s/AKfycbwGaOKJYsQiHuhueRVy_iosxeKKO1qPj748jnUqkfwnmYmvgxWdkHiXB4cON6wF4iXnaA/exec", // ai_bgm
  "https://script.google.com/macros/s/AKfycbwP2rffwhgGYQjJFlfxYU4XHt-jFbUlWtYPAJOZcxIO--yvw2NTlnLvJDHHh4_giLq7/exec", // claude_masterclass
  "https://script.google.com/macros/s/AKfycbwl1WKBrQxxMRbz7aj6GBUNbmR4ePHshhrBwcNjhxorIayQpMTmHaHHT_MvTroQ-ZrFbA/exec", // academy
  "https://script.google.com/macros/s/AKfycbzF4e05xth7Kdzx8gJKXI-vqPgKUSacLE8aGRT8hvg-7B75qvQw_gYwmRacsq3cNIsD/exec", // consulting
  "https://script.google.com/macros/s/AKfycbzuTE9PUoTneN4PF0TKhHwrDXZEfSo-92Ly10dHFd8pGsY1DzjmBa6A5A3aTCRSd6TpFQ/exec", // professionals
  "https://script.google.com/macros/s/AKfycby0fX7tjbOciJbg0Mw1SRMhlazBe4FG1Ko-f5mIFCW6Y7zGKHGZjdUZQKXclfye1FzegA/exec", // ai_masterclass
];

const KNOWN_PRODUCTION_SPREADSHEET_IDS = [
  "1PC9ZYxd4O7ofuDwcN5AhPHTvW6RYO7V2LgQqrbPTQ5I", // Academy
  "1XyFhw6cTJAOE2XT7Ra8lmL0rcvq2meCT9LlGuzOF0nk", // AI BGM
  "1JA3FZf8xkpZ8GjuYiETXz9R0ivfW80-rf3PZIzQum9g", // Claude Masterclass
  "1LP37n3zb1d0UkXjddQBCKqmSU0j5-HvPSI-Rda36E3s", // Consulting
  "1RpwPPMH6nf8CsIAfITF1gNc5gBNhq7CJ0zckotAgq4I", // Professionals
];

const PROD_FUNNELSDONE_LOCATION = "uUUUKRH7EP2A0oJBv4Zb";
const PROD_WHATSAPP_PHONE_ID = "1089787377552637";

/**
 * Validates a configuration dictionary against strict staging isolation rules.
 * Returns { valid: boolean, errors: string[], warnings: string[] }
 */
function validateStagingConfiguration(config = {}) {
  const errors = [];
  const warnings = [];

  // 1. Environment check
  const env = String(config.APP_ENVIRONMENT || config.ENVIRONMENT || "").trim().toLowerCase();
  if (!env) {
    errors.push("MISSING_ENVIRONMENT: APP_ENVIRONMENT must be explicitly set to 'staging'.");
  } else if (env !== "staging" && env !== "local_test") {
    errors.push(`INVALID_STAGING_ENVIRONMENT: Expected 'staging' or 'local_test', received '${env}'.`);
  }

  // 2. Razorpay credentials check
  const rzpKeyId = String(config.RAZORPAY_KEY_ID || "").trim();
  if (!rzpKeyId) {
    errors.push("MISSING_RAZORPAY_KEY_ID: Razorpay test Key ID is required.");
  } else if (rzpKeyId.startsWith("rzp_live_")) {
    errors.push("LIVE_CREDENTIALS_IN_STAGING: Live Razorpay key ID detected in staging configuration!");
  } else if (!rzpKeyId.startsWith("rzp_test_")) {
    errors.push("INVALID_TEST_KEY_PREFIX: Staging Razorpay key ID must start with 'rzp_test_'.");
  }

  const rzpKeySecret = String(config.RAZORPAY_KEY_SECRET || "").trim();
  if (!rzpKeySecret) {
    errors.push("MISSING_RAZORPAY_KEY_SECRET: Razorpay test Key Secret is required.");
  } else if (rzpKeySecret.length < 16) {
    warnings.push("LOW_ENTROPY_KEY_SECRET: Key Secret appears short (< 16 characters).");
  }

  // 3. Webhook Proxy Secret check
  const proxySecret = String(config.WEBHOOK_PROXY_SECRET || "").trim();
  if (!proxySecret) {
    errors.push("MISSING_WEBHOOK_PROXY_SECRET: Dedicated staging proxy secret is required.");
  } else if (proxySecret.length < 32) {
    warnings.push("LOW_ENTROPY_PROXY_SECRET: Staging proxy secret should be at least 32 characters.");
  }

  // 4. Spreadsheet isolation check
  const sheetId = String(config.SPREADSHEET_ID || "").trim();
  if (!sheetId) {
    errors.push("MISSING_SPREADSHEET_ID: Dedicated staging spreadsheet ID must be configured.");
  } else if (KNOWN_PRODUCTION_SPREADSHEET_IDS.includes(sheetId)) {
    errors.push(`PRODUCTION_SPREADSHEET_IN_STAGING: Configured spreadsheet ID '${sheetId}' matches a known production sheet!`);
  }

  // 5. Destination URL check (for proxy routing)
  const targetUrls = Object.entries(config)
    .filter(([k]) => k.startsWith("APPS_SCRIPT_URL_") || k === "TARGET_URL")
    .map(([, v]) => String(v).trim());

  for (const url of targetUrls) {
    if (KNOWN_PRODUCTION_GAS_URLS.includes(url)) {
      errors.push(`PRODUCTION_DESTINATION_IN_STAGING: Configured target URL matches a known production Apps Script endpoint: ${url}`);
    }
  }

  // 6. FunnelsDone Location check
  const locationId = String(config.FUNNELSDONE_LOCATION_ID || "").trim();
  if (locationId === PROD_FUNNELSDONE_LOCATION) {
    errors.push("PRODUCTION_LOCATION_IN_STAGING: Production FunnelsDone location ID detected in staging configuration!");
  }

  // 7. WhatsApp Phone Number ID check
  const phoneId = String(config.WHATSAPP_PHONE_NUMBER_ID || "").trim();
  if (phoneId === PROD_WHATSAPP_PHONE_ID) {
    errors.push("PRODUCTION_PHONE_IN_STAGING: Production WhatsApp phone number ID detected in staging configuration!");
  }

  // 8. Mock Invoice Adapter check
  const mockInvoice = String(config.MOCK_INVOICE_ADAPTER || config.ENABLE_MOCK_INVOICE_ADAPTER || "").trim().toLowerCase();
  if (mockInvoice === "false" || mockInvoice === "0") {
    errors.push("MOCK_INVOICE_DISABLED: Staging must keep MOCK_INVOICE_ADAPTER enabled ('true').");
  }

  // 9. Notification Suppression check
  const suppressNotif = String(config.SUPPRESS_NOTIFICATIONS || "").trim().toLowerCase();
  if (suppressNotif === "false" || suppressNotif === "0") {
    errors.push("NOTIFICATIONS_UNSUPPRESSED: Staging must keep SUPPRESS_NOTIFICATIONS enabled ('true').");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

module.exports = {
  validateStagingConfiguration,
  KNOWN_PRODUCTION_GAS_URLS,
  KNOWN_PRODUCTION_SPREADSHEET_IDS,
};

if (require.main === module) {
  const result = validateStagingConfiguration(process.env);
  console.log("=== STAGING CONFIGURATION VERIFICATION ===");
  if (result.valid) {
    console.log("✅ Configuration Passed: All staging isolation boundaries verified.");
    if (result.warnings.length > 0) {
      console.log("⚠️ Warnings:", result.warnings);
    }
    process.exit(0);
  } else {
    console.error("❌ Configuration Failed: Staging isolation violations detected:");
    for (const err of result.errors) {
      console.error("  - " + err);
    }
    process.exit(1);
  }
}
