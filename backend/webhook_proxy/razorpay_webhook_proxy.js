/**
 * RAZORPAY SECURE WEBHOOK PROXY & ROUTER
 * TECH TYCOON DIGITAL SOLUTION LLP
 *
 * Purpose:
 * Razorpay sends webhook signatures in the HTTP request header:
 *   X-Razorpay-Signature: HMAC-SHA256(raw_request_body, RAZORPAY_WEBHOOK_SECRET)
 *
 * Google Apps Script (GAS) `doPost(e)` does NOT expose incoming HTTP request headers,
 * making direct verification of `X-Razorpay-Signature` inside Apps Script impossible.
 *
 * This proxy sits as the trusted gateway between Razorpay and the 8 Google Apps Script projects:
 * 1. Receives the raw HTTP body and X-Razorpay-Signature from Razorpay.
 * 2. Authenticates the webhook using the official Razorpay webhook secret over the raw body.
 * 3. Filters out unhandled/irrelevant events (accepts only payment.captured & order.paid).
 * 4. Extracts verified order/payment metadata (course/product notes) from trusted payment entity.
 * 5. Strictly routes to the correct one of the eight Apps Script projects via an internal routing table.
 *    Arbitrary or client-supplied destination URLs are REJECTED.
 * 6. Signs a tamper-resistant forward payload with timestamp, eventId, orderId, paymentId
 *    using a high-entropy WEBHOOK_PROXY_SECRET.
 * 7. Forwards the authenticated event to the target Apps Script web app.
 * 8. Returns HTTP 200 to Razorpay.
 */

import crypto from 'node:crypto';

/**
 * Trusted, immutable routing registry for the eight Tech Tycoon educational products.
 * Destination URLs are strictly maintained on the server and cannot be overridden by client input.
 */
export const TRUSTED_PRODUCT_ROUTING = {
  upscale: {
    productKey: "upscale",
    name: "UPSCALE: 1-Day AI Mastery Workshop (Chennai)",
    matchPatterns: [/\bupscale\b/i, /upscale\s*workshop/i, /upscale\s*(level-?2|chennai|mastery)/i],
    defaultUrlEnv: "APPS_SCRIPT_URL_UPSCALE",
    defaultEndpoint: "https://script.google.com/macros/s/AKfycbzPxPpp0ksCcE6IY8mUlzcu0jqY1RSfhCl2Locq1iOYbbe5beBeeQ6uefCV93Nxy8rbsg/exec",
  },
  advanced_masterclass: {
    productKey: "advanced_masterclass",
    name: "Advance AI Masterclass",
    matchPatterns: [/advance(d)?\s*ai\s*masterclass/i, /advanced?\s*masterclass/i, /advance\s*master\s*class/i],
    defaultUrlEnv: "APPS_SCRIPT_URL_ADVANCED_MASTERCLASS",
    defaultEndpoint: "https://script.google.com/macros/s/AKfycbw59X8thSpB9xrJSI0GhACEm617vAbc7BDH6hJFOOBsOeq-B4az0p3B_O6koMjYfsppgA/exec",
  },
  ai_bgm: {
    productKey: "ai_bgm",
    name: "Advance AI-Business Generative Model (AI-BGM)",
    matchPatterns: [/ai[-_ ]?bgm/i, /business\s*generative\s*model/i, /ai[-_ ]business\s*generative/i],
    defaultUrlEnv: "APPS_SCRIPT_URL_AI_BGM",
    defaultEndpoint: "https://script.google.com/macros/s/AKfycbwGaOKJYsQiHuhueRVy_iosxeKKO1qPj748jnUqkfwnmYmvgxWdkHiXB4cON6wF4iXnaA/exec",
  },
  claude_masterclass: {
    productKey: "claude_masterclass",
    name: "Claude Coding Masterclass",
    matchPatterns: [/\bclaude\b/i, /claude\s*(coding\s*)?masterclass/i, /claude\s*3(\.7)?/i],
    defaultUrlEnv: "APPS_SCRIPT_URL_CLAUDE_MASTERCLASS",
    defaultEndpoint: "https://script.google.com/macros/s/AKfycbwP2rffwhgGYQjJFlfxYU4XHt-jFbUlWtYPAJOZcxIO--yvw2NTlnLvJDHHh4_giLq7/exec",
  },
  academy: {
    productKey: "academy",
    name: "TECH TYCOON Academy Pre-Register",
    matchPatterns: [/tech\s*tycoon\s*academy/i, /\bacademy\b/i, /academy\s*pre-?register/i],
    defaultUrlEnv: "APPS_SCRIPT_URL_ACADEMY",
    defaultEndpoint: "https://script.google.com/macros/s/AKfycbwl1WKBrQxxMRbz7aj6GBUNbmR4ePHshhrBwcNjhxorIayQpMTmHaHHT_MvTroQ-ZrFbA/exec",
  },
  consulting: {
    productKey: "consulting",
    name: "1-on-1 AI Strategy Session",
    matchPatterns: [/1-on-1\s*ai\s*strategy/i, /1[- ]on[- ]1/i, /strategy\s*session/i, /business\s*ai\s*consulting/i, /\bai\s*consulting\b/i],
    defaultUrlEnv: "APPS_SCRIPT_URL_CONSULTING",
    defaultEndpoint: "https://script.google.com/macros/s/AKfycbzF4e05xth7Kdzx8gJKXI-vqPgKUSacLE8aGRT8hvg-7B75qvQw_gYwmRacsq3cNIsD/exec",
  },
  professionals: {
    productKey: "professionals",
    name: "Advance AI for Professionals",
    matchPatterns: [
      /advance\s*ai\s*for\s*(non-tech\s*)?working\s*professionals/i,
      /advance\s*ai\s*for\s*professionals/i,
      /ai\s*for\s*(non-tech\s*)?(working\s*)?professionals/i,
      /\bworking\s*professionals\b/i,
      /\bprofessionals\s*course\b/i,
    ],
    defaultUrlEnv: "APPS_SCRIPT_URL_PROFESSIONALS",
    defaultEndpoint: "https://script.google.com/macros/s/AKfycbzuTE9PUoTneN4PF0TKhHwrDXZEfSo-92Ly10dHFd8pGsY1DzjmBa6A5A3aTCRSd6TpFQ/exec",
  },
  ai_masterclass: {
    productKey: "ai_masterclass",
    name: "AI Secrets Revealed Masterclass",
    // Disambiguated patterns: broad standalone /masterclass/i completely eliminated to prevent overlapping.
    // Negative lookahead/exclusion ensures Advance, Claude, or BGM masterclasses do not collide.
    matchPatterns: [
      /ai\s*secrets\s*revealed/i,
      /ai\s*marketing\s*masterclass/i,
      /ai\s*masterclass\s*2(\.0)?/i,
      /secrets\s*revealed\s*masterclass/i,
      /ai\s*secrets/i,
      /ai\s*marketing/i,
      /^(?!.*(advance|claude|bgm)).*\bai[-_ ]masterclass\b/i,
    ],
    defaultUrlEnv: "APPS_SCRIPT_URL_AI_MASTERCLASS",
    defaultEndpoint: "https://script.google.com/macros/s/AKfycby0fX7tjbOciJbg0Mw1SRMhlazBe4FG1Ko-f5mIFCW6Y7zGKHGZjdUZQKXclfye1FzegA/exec",
  },
};

/**
 * Immutable set of known production Google Apps Script deployment endpoints.
 * Staging proxy instances strictly fail closed if attempting to route to any of these.
 */
export const KNOWN_PRODUCTION_GAS_URLS = new Set(
  Object.values(TRUSTED_PRODUCT_ROUTING).map((r) => r.defaultEndpoint)
);

/**
 * Immutable list of known production spreadsheet IDs to prevent cross-environment pollution.
 */
export const KNOWN_PRODUCTION_SPREADSHEET_IDS = [
  "1PC9ZYxd4O7ofuDwcN5AhPHTvW6RYO7V2LgQqrbPTQ5I", // Academy
  "1XyFhw6cTJAOE2XT7Ra8lmL0rcvq2meCT9LlGuzOF0nk", // AI BGM
  "1JA3FZf8xkpZ8GjuYiETXz9R0ivfW80-rf3PZIzQum9g", // Claude Masterclass
  "1LP37n3zb1d0UkXjddQBCKqmSU0j5-HvPSI-Rda36E3s", // Consulting
  "1RpwPPMH6nf8CsIAfITF1gNc5gBNhq7CJ0zckotAgq4I", // Professionals
];

/**
 * Constant-time string comparison to prevent timing attacks.
 */
export function constantTimeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a, 'utf8'), Buffer.from(b, 'utf8'));
  } catch (e) {
    return false;
  }
}

/**
 * Verifies Razorpay Webhook signature over the exact raw request body.
 * Supports a single secret, comma-separated secrets, or an array of secrets (e.g. domestic + international accounts).
 */
export function verifyRazorpayWebhookSignature(rawBody, signature, webhookSecret) {
  if (!rawBody || !signature || !webhookSecret) return false;
  const secrets = Array.isArray(webhookSecret)
    ? webhookSecret
    : String(webhookSecret).split(',').map(s => s.trim()).filter(Boolean);

  const cleanSig = signature.trim().toLowerCase();
  return secrets.some(sec => {
    const expectedSig = crypto
      .createHmac('sha256', sec)
      .update(rawBody, 'utf8')
      .digest('hex');
    return constantTimeCompare(expectedSig, cleanSig);
  });
}

/**
 * Computes a deterministic SHA-256 digest of canonical payment entity fields.
 * Phase 1J hardened format binds 8 fields:
 * (amount|currency|status|email|contact|method|accountId|canonicalNotes)
 * with deterministic sorted key-value pairs for notes.
 * Fallback format binds 5 fields:
 * (amount|currency|status|email|contact)
 */
export function computeCanonicalPayloadDigest(paymentEntity, options = {}) {
  if (!paymentEntity || typeof paymentEntity !== 'object') return '';
  const amount = paymentEntity.amount !== undefined ? String(paymentEntity.amount).trim() : '';
  const currency = paymentEntity.currency ? String(paymentEntity.currency).trim() : '';
  const status = paymentEntity.status ? String(paymentEntity.status).trim() : '';
  const email = paymentEntity.email ? String(paymentEntity.email).trim().toLowerCase() : '';
  const contact = paymentEntity.contact ? String(paymentEntity.contact).trim() : '';

  if (options && (options.legacy === true || options.fiveField === true)) {
    const canonicalString = `${amount}|${currency}|${status}|${email}|${contact}`;
    return crypto.createHash('sha256').update(canonicalString, 'utf8').digest('hex');
  }

  if (options && (options.extended === true || options.hardened === true || options.version === 'v2.1' || options.fields8 === true)) {
    const method = paymentEntity.method ? String(paymentEntity.method).trim() : '';
    const accountId = (paymentEntity.account_id || paymentEntity.accountId || paymentEntity.notes?.account_id) ? String(paymentEntity.account_id || paymentEntity.accountId || paymentEntity.notes?.account_id).trim() : '';
    let canonicalNotes = '';
    if (paymentEntity.notes && typeof paymentEntity.notes === 'object') {
      const keys = Object.keys(paymentEntity.notes).sort();
      canonicalNotes = keys.map(k => `${k}=${String(paymentEntity.notes[k]).trim()}`).join(',');
    }
    const canonicalString = `${amount}|${currency}|${status}|${email}|${contact}|${method}|${accountId}|${canonicalNotes}`;
    return crypto.createHash('sha256').update(canonicalString, 'utf8').digest('hex');
  }

  // Default: 5-field digest for backward compatibility with Phase 1I tests
  const canonicalString = `${amount}|${currency}|${status}|${email}|${contact}`;
  return crypto.createHash('sha256').update(canonicalString, 'utf8').digest('hex');
}

/**
 * Explicitly computes the Phase 1J 8-field canonical payload digest binding:
 * amount | currency | status | email | contact | method | accountId | canonicalNotes
 */
export function computeHardenedPayloadDigest(paymentEntity) {
  return computeCanonicalPayloadDigest(paymentEntity, { extended: true });
}

/**
 * Computes the version 2 (v2) canonical proxy signature binding:
 * If 12-tuple parameters (Phase 1J) are provided:
 * v2 | eventId | eventType | orderId | paymentId | timestamp | productKey | amount | currency | status | accountId | payloadDigest
 * Otherwise 7-tuple (Phase 1I):
 * v2 | eventId | orderId | paymentId | timestamp | productKey | payloadDigest
 */
export function computeCanonicalProxySignature(params, proxySecret) {
  const {
    eventId,
    orderId,
    paymentId,
    timestamp,
    productKey,
    payloadDigest,
    eventType,
    amount,
    currency,
    status,
    accountId,
  } = params || {};

  // If 12-tuple parameters are provided:
  if (eventType !== undefined && amount !== undefined) {
    const cleanEventType = String(eventType || 'payment.captured').trim();
    const cleanAmount = String(amount !== undefined ? amount : '').trim();
    const cleanCurrency = String(currency || 'INR').trim();
    const cleanStatus = String(status || 'captured').trim();
    const cleanAccountId = String(accountId || '').trim();
    const message = `v2|${eventId}|${cleanEventType}|${orderId}|${paymentId}|${timestamp}|${productKey}|${cleanAmount}|${cleanCurrency}|${cleanStatus}|${cleanAccountId}|${payloadDigest}`;
    return crypto.createHmac('sha256', proxySecret).update(message, 'utf8').digest('hex');
  }

  const message = `v2|${eventId}|${orderId}|${paymentId}|${timestamp}|${productKey}|${payloadDigest}`;
  return crypto.createHmac('sha256', proxySecret).update(message, 'utf8').digest('hex');
}

/**
 * Explicitly computes the Phase 1J 12-tuple canonical proxy signature binding:
 * v2 | eventId | eventType | orderId | paymentId | timestamp | productKey | amount | currency | status | accountId | payloadDigest
 */
export function computeHardenedProxySignature(params, proxySecret) {
  const {
    eventId,
    eventType = 'payment.captured',
    orderId,
    paymentId,
    timestamp,
    productKey,
    amount,
    currency = 'INR',
    status = 'captured',
    accountId = '',
    payloadDigest,
  } = params || {};

  const cleanEventType = String(eventType).trim();
  const cleanAmount = String(amount !== undefined ? amount : '').trim();
  const cleanCurrency = String(currency).trim();
  const cleanStatus = String(status).trim();
  const cleanAccountId = String(accountId).trim();
  const message = `v2|${eventId}|${cleanEventType}|${orderId}|${paymentId}|${timestamp}|${productKey}|${cleanAmount}|${cleanCurrency}|${cleanStatus}|${cleanAccountId}|${payloadDigest}`;
  return crypto.createHmac('sha256', proxySecret).update(message, 'utf8').digest('hex');
}

/**
 * Computes the tamper-resistant proxy signature for Apps Script authentication.
 * Defaults to legacy v1 format for backwards compatibility, or v2 if specified.
 */
export function computeProxySignature(eventId, orderId, paymentId, timestamp, proxySecret, options = {}) {
  if (options && (options.version === 'v2' || options.version === 'v2.1') && options.productKey && options.payloadDigest) {
    return computeCanonicalProxySignature({
      eventId,
      eventType: options.eventType,
      orderId,
      paymentId,
      timestamp,
      productKey: options.productKey,
      amount: options.amount,
      currency: options.currency,
      status: options.status,
      accountId: options.accountId,
      payloadDigest: options.payloadDigest,
    }, proxySecret);
  }
  const message = `${eventId}|${orderId}|${paymentId}|${timestamp}`;
  return crypto.createHmac('sha256', proxySecret).update(message, 'utf8').digest('hex');
}

/**
 * Determines the target Apps Script project and URL from authoritative payment entity notes and description.
 * Rejects unknown products, ambiguous/conflicting course names, or arbitrary client-supplied destinations.
 */
export function determineProductRoute(paymentEntity, customEndpointMap = {}, options = {}) {
  if (!paymentEntity || typeof paymentEntity !== 'object') {
    return {
      success: false,
      error: "MISSING_PAYMENT_ENTITY: Payment entity is required for routing.",
    };
  }

  const notes = paymentEntity.notes || {};
  let matchedKey = null;
  let matchType = null;

  // 1. Authoritative Explicit Key Matching (highest precedence, zero ambiguity)
  const candidateKeys = [
    notes.product_key,
    notes.product_id,
    notes.course_key,
    notes.product,
    notes.course,
    notes.service,
    notes.program,
  ];

  for (const cand of candidateKeys) {
    if (cand) {
      const normalized = String(cand).trim().toLowerCase();
      if (TRUSTED_PRODUCT_ROUTING[normalized]) {
        matchedKey = normalized;
        matchType = "explicit_key";
        break;
      }
    }
  }

  if (!matchedKey) {
    // 2. Pattern Matching over authoritative notes and description
    const courseNote = String(notes.course || notes.service || notes.program || "").trim();
    const description = String(paymentEntity.description || "").trim();
    const searchCorpus = `${courseNote} ${description}`.trim();

    if (!searchCorpus) {
      return {
        success: false,
        error: "MISSING_PRODUCT_IDENTIFIER: Payment notes.course and description are empty. Cannot determine course route.",
      };
    }

    // Find all products matching the search corpus
    const matchingKeys = [];
    for (const [key, config] of Object.entries(TRUSTED_PRODUCT_ROUTING)) {
      const isMatch = config.matchPatterns.some((pattern) => pattern.test(searchCorpus));
      if (isMatch) {
        matchingKeys.push(key);
      }
    }

    // Reject missing / unknown products
    if (matchingKeys.length === 0) {
      return {
        success: false,
        error: `UNKNOWN_PRODUCT_MAPPING: Product '${searchCorpus}' did not match any of the 8 registered Tech Tycoon courses. Routing rejected.`,
      };
    }

    // Reject ambiguous / conflicting products
    if (matchingKeys.length > 1) {
      return {
        success: false,
        error: `CONFLICTING_PRODUCT_MAPPING: Payment metadata matches multiple products: [${matchingKeys.join(", ")}]. Ambiguous routing rejected.`,
      };
    }

    // Exactly one unique product matched
    matchedKey = matchingKeys[0];
    matchType = "pattern_match";
  }

  const config = TRUSTED_PRODUCT_ROUTING[matchedKey];
  const targetUrl = (customEndpointMap && customEndpointMap[matchedKey]) || (options && options.targetUrl) || config.defaultEndpoint;

  const isTestPayment = (
    notes.test_mode === 'true' ||
    notes.test_mode === true ||
    notes.environment === 'staging' ||
    notes.environment === 'test' ||
    String(paymentEntity.id || '').startsWith('pay_test_')
  );

  if (options && options.environment) {
    const rawEnv = String(options.environment).trim().toLowerCase();
    if (!['production', 'staging', 'local_test', 'development'].includes(rawEnv)) {
      return {
        success: false,
        error: `INVALID_ENVIRONMENT: Unknown environment '${rawEnv}'. Allowed: production, staging, local_test, development.`,
      };
    }
  }

  // Isolation check: Staging rejects live payments and production GAS destinations
  if (options && options.environment === 'staging') {
    if (!isTestPayment) {
      return {
        success: false,
        error: "LIVE_PAYMENT_IN_STAGING: Live payment cannot be processed in staging environment.",
      };
    }
    if (KNOWN_PRODUCTION_GAS_URLS.has(targetUrl)) {
      return {
        success: false,
        error: "PRODUCTION_DESTINATION_IN_STAGING: Staging proxy cannot route to production Apps Script destination.",
      };
    }
  }

  // Isolation check: Production rejects test mode payments
  if (options && (options.environment === 'production' || options.isolateProduction)) {
    if (isTestPayment) {
      return {
        success: false,
        error: "TEST_PAYMENT_IN_PRODUCTION: Test mode payment cannot be routed to production Apps Script.",
      };
    }
  }

  return {
    success: true,
    productKey: matchedKey,
    productName: config.name,
    targetUrl: targetUrl,
    matchType: matchType,
  };
}

/**
 * Authoritatively determines the target Apps Script project and URL strictly from
 * trusted order notes created by the backend.
 * Rejects descriptions, arbitrary regex matches, unkeyed orders, or conflicting notes.
 */
export function determineAuthoritativeProductRoute(orderEntity, paymentEntity, customEndpointMap = {}, options = {}) {
  if (!orderEntity && !paymentEntity) {
    return {
      success: false,
      error: "MISSING_AUTHORITATIVE_ENTITY: Order or payment entity is required for authoritative routing.",
    };
  }

  const orderNotes = (orderEntity && orderEntity.notes) || {};
  const paymentNotes = (paymentEntity && paymentEntity.notes) || {};

  const orderKey = (
    orderNotes.product_key ||
    orderNotes.product_id ||
    orderNotes.course_key
  )?.toString().trim().toLowerCase();

  const paymentKey = (
    paymentNotes.product_key ||
    paymentNotes.product_id ||
    paymentNotes.course_key
  )?.toString().trim().toLowerCase();

  // If both exist, verify they do not conflict
  if (orderKey && paymentKey && orderKey !== paymentKey) {
    return {
      success: false,
      error: `CONFLICTING_PRODUCT_IDENTIFIER: Order notes specify '${orderKey}' but payment notes specify '${paymentKey}'. Routing rejected.`,
    };
  }

  const authoritativeKey = orderKey || paymentKey;

  if (!authoritativeKey) {
    return {
      success: false,
      error: "NON_AUTHORITATIVE_PRODUCT_METADATA: Product identifier missing from authoritative order notes. Unverified description or broad regex matching is prohibited in authoritative mode.",
    };
  }

  if (!TRUSTED_PRODUCT_ROUTING[authoritativeKey]) {
    return {
      success: false,
      error: `UNKNOWN_PRODUCT_MAPPING: Product key '${authoritativeKey}' does not exist in trusted catalog.`,
    };
  }

  const config = TRUSTED_PRODUCT_ROUTING[authoritativeKey];
  const targetUrl = (customEndpointMap && customEndpointMap[authoritativeKey]) || (options && options.targetUrl) || config.defaultEndpoint;

  const isTestPayment = (
    orderNotes.test_mode === 'true' ||
    orderNotes.test_mode === true ||
    paymentNotes.test_mode === 'true' ||
    paymentNotes.test_mode === true ||
    orderNotes.environment === 'staging' ||
    orderNotes.environment === 'test' ||
    paymentNotes.environment === 'staging' ||
    paymentNotes.environment === 'test' ||
    (paymentEntity && String(paymentEntity.id).startsWith('pay_test_'))
  );

  if (options && options.environment) {
    const rawEnv = String(options.environment).trim().toLowerCase();
    if (!['production', 'staging', 'local_test', 'development'].includes(rawEnv)) {
      return {
        success: false,
        error: `INVALID_ENVIRONMENT: Unknown environment '${rawEnv}'. Allowed: production, staging, local_test, development.`,
      };
    }
  }

  // Isolation check: Staging rejects live payments and production GAS destinations
  if (options && options.environment === 'staging') {
    if (!isTestPayment) {
      return {
        success: false,
        error: "LIVE_PAYMENT_IN_STAGING: Live payment cannot be processed in staging environment.",
      };
    }
    if (KNOWN_PRODUCTION_GAS_URLS.has(targetUrl)) {
      return {
        success: false,
        error: "PRODUCTION_DESTINATION_IN_STAGING: Staging proxy cannot route to production Apps Script destination.",
      };
    }
  }

  // Isolation check: In production mode, reject test mode payments
  if (options && (options.environment === 'production' || options.isolateProduction)) {
    if (isTestPayment) {
      return {
        success: false,
        error: "TEST_PAYMENT_IN_PRODUCTION: Test mode payment cannot be routed to production Apps Script.",
      };
    }
  }

  return {
    success: true,
    productKey: authoritativeKey,
    productName: config.name,
    targetUrl: targetUrl,
    matchType: "authoritative_order_key",
  };
}

/**
 * Core handler to process, authenticate, and route an incoming Razorpay webhook.
 */
export function handleIncomingRazorpayWebhook(options) {
  const {
    rawBody,
    signatureHeader,
    signature,
    webhookSecret,
    proxySecret,
    customEndpointMap = {},
    timestampToleranceMs = 300000 // 5 minutes
  } = options;

  if (!webhookSecret) {
    throw new Error('CONFIG_ERROR: Missing RAZORPAY_WEBHOOK_SECRET.');
  }
  if (!proxySecret) {
    throw new Error('CONFIG_ERROR: Missing WEBHOOK_PROXY_SECRET.');
  }

  const env = String(
    options.environment ||
    (typeof process !== 'undefined' && process.env && (process.env.APP_ENVIRONMENT || (process.env.NODE_ENV === 'test' ? 'local_test' : process.env.NODE_ENV))) ||
    ''
  ).trim().toLowerCase();

  if (!env) {
    return {
      status: 500,
      success: false,
      error: 'MISSING_ENVIRONMENT: Webhook proxy requires an explicit environment configuration (production or staging).'
    };
  }

  if (!['production', 'staging', 'local_test', 'development'].includes(env)) {
    return {
      status: 500,
      success: false,
      error: `INVALID_ENVIRONMENT: Unknown environment '${env}'. Allowed: production, staging, local_test, development.`
    };
  }

  options.environment = env;

  // Staging credential check: Reject live Razorpay credentials in staging
  if (env === 'staging' && options.razorpayKeyId && String(options.razorpayKeyId).startsWith('rzp_live_')) {
    return {
      status: 422,
      success: false,
      error: 'LIVE_CREDENTIALS_IN_STAGING: Live Razorpay credentials cannot be used in staging environment.'
    };
  }

  // Production credential check: Reject test Razorpay credentials in production
  if (env === 'production' && options.razorpayKeyId && String(options.razorpayKeyId).startsWith('rzp_test_')) {
    return {
      status: 422,
      success: false,
      error: 'TEST_CREDENTIALS_IN_PRODUCTION: Test Razorpay credentials cannot be used in production environment.'
    };
  }

  // Downgrade protection: Both production and staging strictly require v2.1
  if ((env === 'production' || env === 'staging') && (options.version === 'v1' || options.version === 'v2' || options.legacy === true)) {
    return {
      status: 400,
      success: false,
      error: 'UNSUPPORTED_PROXY_VERSION: Protocol downgrade rejected. Production and staging require v2.1.'
    };
  }

  // 1. Verify exact raw body signature against X-Razorpay-Signature (supports dual domestic + international secrets)
  const sigToVerify = signatureHeader || signature || options.signature;
  const combinedWebhookSecrets = [
    ...(Array.isArray(webhookSecret) ? webhookSecret : String(webhookSecret || '').split(',')),
    options.webhookSecretIntl,
    (typeof process !== 'undefined' && process.env && process.env.RAZORPAY_WEBHOOK_SECRET_INTL),
  ].map(s => String(s || '').trim()).filter(Boolean);

  const isSigValid = verifyRazorpayWebhookSignature(rawBody, sigToVerify, combinedWebhookSecrets);
  if (!isSigValid) {
    return {
      status: 401,
      success: false,
      error: 'INVALID_RAZORPAY_WEBHOOK_SIGNATURE: Webhook signature verification failed.'
    };
  }

  // 2. Parse JSON body safely
  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch (err) {
    return {
      status: 400,
      success: false,
      error: 'MALFORMED_WEBHOOK_JSON: Request body is not valid JSON.'
    };
  }

  // 3. Filter for relevant payment events
  const allowedEvents = ['payment.captured', 'order.paid'];
  if (!allowedEvents.includes(payload.event)) {
    return {
      status: 200,
      success: true,
      ignored: true,
      message: `Ignored unhandled event: ${payload.event}`
    };
  }

  // 4. Extract entities
  const payment = payload.payload?.payment?.entity;
  if (!payment || !payment.id || !payment.order_id) {
    return {
      status: 400,
      success: false,
      error: 'MISSING_PAYMENT_ENTITY: Webhook payload missing payment entity or order_id.'
    };
  }

  const paymentId = String(payment.id).trim();
  const orderId = String(payment.order_id).trim();
  const eventId = String(payload.id || `evt_${paymentId}`).trim();
  const now = Date.now();

  // 5. Determine route based on trusted payment entity notes/description
  const route = determineProductRoute(payment, customEndpointMap, options);
  if (!route.success) {
    return {
      status: 422,
      success: false,
      error: route.error,
    };
  }

  // 6. Generate authenticated proxy forward payload
  const isHardened = (env === 'production' || env === 'staging') ? true : Boolean(options.hardened || options.version === 'v2.1');
  const payloadDigest = isHardened
    ? computeHardenedPayloadDigest(payment)
    : computeCanonicalPayloadDigest(payment);

  const proxySignature = isHardened
    ? computeHardenedProxySignature({
        eventId,
        eventType: payload.event,
        orderId,
        paymentId,
        timestamp: now,
        productKey: route.productKey,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        accountId: payment.account_id || payment.notes?.account_id || '',
        payloadDigest,
      }, proxySecret)
    : computeCanonicalProxySignature({
        eventId,
        orderId,
        paymentId,
        timestamp: now,
        productKey: route.productKey,
        payloadDigest,
      }, proxySecret);

  const forwardPayload = {
    event: payload.event,
    eventId: eventId,
    timestamp: now,
    proxy_version: isHardened ? 'v2.1' : 'v2',
    target_product: route.productKey,
    payload_digest: payloadDigest,
    proxy_signature: proxySignature,
    payload: {
      payment: {
        entity: {
          id: paymentId,
          order_id: orderId,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          email: payment.email || '',
          contact: payment.contact || '',
          method: payment.method || '',
          account_id: payment.account_id || payment.notes?.account_id || '',
          notes: payment.notes || {}
        }
      }
    }
  };

  return {
    status: 200,
    success: true,
    forwardPayload,
    targetUrl: route.targetUrl,
    targetProduct: route.productKey,
    productName: route.productName
  };
}

/**
 * Forwards an authenticated webhook payload to the target Google Apps Script Web App.
 */
export async function forwardWebhookToAppsScript(options) {
  const {
    forwardPayload,
    targetUrl,
    fetchImpl = fetch,
  } = options;

  if (!targetUrl || !forwardPayload) {
    throw new Error("FORWARD_ERROR: targetUrl and forwardPayload are required.");
  }

  const response = await fetchImpl(targetUrl, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(forwardPayload),
  });

  return response;
}

/**
 * Verifies a payment and its associated order directly against the official Razorpay REST API
 * (server-to-server) to guarantee authenticity before forwarding or fulfilling.
 */
export async function verifyPaymentWithRazorpayServer(options) {
  const {
    paymentId,
    orderId,
    expectedAmount,
    expectedCurrency = 'INR',
    keyId = process.env.RAZORPAY_KEY_ID,
    keySecret = process.env.RAZORPAY_KEY_SECRET,
    fetchImpl = fetch,
  } = options || {};

  if (!paymentId || !orderId) {
    return {
      success: false,
      error: 'MISSING_PAYMENT_OR_ORDER_ID: Both paymentId and orderId are required for Razorpay verification.',
    };
  }

  if (!keyId || !keySecret) {
    return {
      success: false,
      error: 'MISSING_RAZORPAY_API_CREDENTIALS: RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be configured.',
    };
  }

  const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

  try {
    const res = await fetchImpl(`https://api.razorpay.com/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      return {
        success: false,
        status: res.status,
        error: `RAZORPAY_API_REJECTED: Remote API returned HTTP ${res.status}.`,
      };
    }

    const payment = await res.json();

    if (payment.id !== paymentId) {
      return {
        success: false,
        error: `PAYMENT_ID_MISMATCH: Expected ${paymentId}, got ${payment.id}.`,
      };
    }

    if (payment.order_id !== orderId) {
      return {
        success: false,
        error: `ORDER_ID_MISMATCH: Expected order ${orderId}, payment belongs to ${payment.order_id}.`,
      };
    }

    if (payment.status !== 'captured') {
      return {
        success: false,
        error: `PAYMENT_NOT_CAPTURED: Payment status is '${payment.status}'. Expected 'captured'.`,
      };
    }

    if (expectedAmount !== undefined && Number(payment.amount) !== Number(expectedAmount)) {
      return {
        success: false,
        error: `AMOUNT_MISMATCH: Expected ${expectedAmount}, remote record shows ${payment.amount}.`,
      };
    }

    if (expectedCurrency && String(payment.currency).toUpperCase() !== String(expectedCurrency).toUpperCase()) {
      return {
        success: false,
        error: `CURRENCY_MISMATCH: Expected ${expectedCurrency}, remote record shows ${payment.currency}.`,
      };
    }

    // Authoritative Merchant Account verification
    if (options.expectedMerchantAccount && payment.account_id && payment.account_id !== options.expectedMerchantAccount) {
      return {
        success: false,
        error: `MERCHANT_ACCOUNT_MISMATCH: Expected merchant account ${options.expectedMerchantAccount}, remote record shows ${payment.account_id}.`,
      };
    }

    // Authoritative Server-to-Server Order verification
    let authoritativeOrder = null;
    if (options.verifyAuthoritativeOrder || options.fetchOrder) {
      const orderRes = await fetchImpl(`https://api.razorpay.com/v1/orders/${orderId}`, {
        method: 'GET',
        headers: {
          Authorization: `Basic ${basicAuth}`,
          Accept: 'application/json',
        },
      });

      if (!orderRes.ok) {
        return {
          success: false,
          status: orderRes.status,
          error: `RAZORPAY_ORDER_API_REJECTED: Remote Order API returned HTTP ${orderRes.status}.`,
        };
      }

      authoritativeOrder = await orderRes.json();
      if (authoritativeOrder.id !== orderId) {
        return {
          success: false,
          error: `ORDER_ID_MISMATCH: Remote order ID ${authoritativeOrder.id} does not match expected ${orderId}.`,
        };
      }

      if (expectedAmount !== undefined && Number(authoritativeOrder.amount) !== Number(expectedAmount)) {
        return {
          success: false,
          error: `ORDER_AMOUNT_MISMATCH: Order amount ${authoritativeOrder.amount} does not match expected ${expectedAmount}.`,
        };
      }
    }

    // Test-Mode vs Staging Isolation
    if (options.environment === 'staging') {
      if (keyId && keyId.startsWith('rzp_live_')) {
        return {
          success: false,
          error: 'LIVE_CREDENTIALS_IN_STAGING: Live Razorpay credentials cannot be used in staging environment.',
        };
      }
      const isTestPayment = (
        payment.notes?.test_mode === 'true' ||
        payment.notes?.test_mode === true ||
        payment.notes?.environment === 'staging' ||
        payment.notes?.environment === 'test' ||
        (authoritativeOrder && (
          authoritativeOrder.notes?.test_mode === 'true' ||
          authoritativeOrder.notes?.test_mode === true ||
          authoritativeOrder.notes?.environment === 'staging' ||
          authoritativeOrder.notes?.environment === 'test'
        )) ||
        String(payment.id).startsWith('pay_test_')
      );
      if (!isTestPayment) {
        return {
          success: false,
          error: 'LIVE_PAYMENT_IN_STAGING: Live payment cannot be processed in staging environment.',
        };
      }
    }

    // Test-Mode vs Production Isolation
    if ((options.isolateProduction || options.environment === 'production') && keyId.startsWith('rzp_live_')) {
      if (
        payment.notes?.test_mode === 'true' ||
        payment.notes?.test_mode === true ||
        payment.notes?.environment === 'staging' ||
        payment.notes?.environment === 'test' ||
        (authoritativeOrder && (
          authoritativeOrder.notes?.test_mode === 'true' ||
          authoritativeOrder.notes?.test_mode === true ||
          authoritativeOrder.notes?.environment === 'staging' ||
          authoritativeOrder.notes?.environment === 'test'
        )) ||
        String(payment.id).startsWith('pay_test_')
      ) {
        return {
          success: false,
          error: 'TEST_PAYMENT_IN_PRODUCTION: Test mode payment cannot be processed with production live keys.',
        };
      }
    }

    return {
      success: true,
      verifiedPayment: payment,
      authoritativeOrder,
    };
  } catch (err) {
    return {
      success: false,
      error: `RAZORPAY_API_CONNECTION_ERROR: ${err.message}`,
    };
  }
}

/**
 * Async wrapper around handleIncomingRazorpayWebhook that optionally executes
 * server-to-server Razorpay API verification before generating the forward payload.
 */
export async function handleIncomingRazorpayWebhookAsync(options) {
  const syncResult = handleIncomingRazorpayWebhook(options);
  if (!syncResult.success || syncResult.ignored) {
    return syncResult;
  }

  // If Razorpay API verification credentials or flag are supplied, verify with Razorpay
  const {
    verifyWithRazorpay = false,
    razorpayKeyId,
    razorpayKeySecret,
    fetchImpl = fetch,
  } = options;

  if (verifyWithRazorpay || (razorpayKeyId && razorpayKeySecret)) {
    const payment = syncResult.forwardPayload.payload.payment.entity;
    const verifyRes = await verifyPaymentWithRazorpayServer({
      paymentId: payment.id,
      orderId: payment.order_id,
      expectedAmount: payment.amount,
      expectedCurrency: payment.currency,
      keyId: razorpayKeyId,
      keySecret: razorpayKeySecret,
      expectedMerchantAccount: options.expectedMerchantAccount,
      verifyAuthoritativeOrder: Boolean(options.verifyAuthoritativeOrder || options.requireAuthoritativeOrder),
      isolateProduction: Boolean(options.isolateProduction),
      fetchImpl,
    });

    if (!verifyRes.success) {
      return {
        status: 422,
        success: false,
        error: `RAZORPAY_SERVER_VERIFICATION_FAILED: ${verifyRes.error}`,
      };
    }

    if (options.requireAuthoritativeOrder && verifyRes.authoritativeOrder) {
      const orderNotes = verifyRes.authoritativeOrder.notes || {};
      const orderProductKey = (orderNotes.product_key || orderNotes.product_id || orderNotes.course_key)?.toString().trim().toLowerCase();
      if (!orderProductKey || orderProductKey !== syncResult.targetProduct) {
        return {
          status: 422,
          success: false,
          error: `AUTHORITATIVE_ORDER_MISMATCH: Order notes product_key '${orderProductKey}' does not match target product '${syncResult.targetProduct}'.`,
        };
      }
    }

    syncResult.razorpayVerified = true;
    syncResult.authoritativePayment = verifyRes.verifiedPayment;
    syncResult.authoritativeOrder = verifyRes.authoritativeOrder;
  }

  return syncResult;
}

// ============================================================================
// SECURE DEAD-LETTER QUEUE (DLQ) SYSTEM
// ============================================================================

export const DEFAULT_DLQ_RETENTION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days retention
export const inMemoryDeadLetterQueue = [];

/**
 * Sanitizes and redacts webhook data before writing to the Dead Letter Queue.
 * Anti-Replay & Privacy Guarantees:
 * 1. Raw body is NEVER stored (prevents replaying webhook signatures).
 * 2. Authorization, webhook secrets, cookies, and signature headers are completely redacted.
 * 3. Customer PII (emails, phone numbers, addresses) is completely excluded.
 * 4. Only minimal operational identifiers (eventId, paymentId, orderId, errorCategory, retryCount) are stored.
 */
export function sanitizeForDeadLetterQueue(options) {
  const {
    eventId,
    errorCategory,
    errorMessage,
    payload,
    headers = {},
    status = 422,
    retryCount = 0,
    timestamp = Date.now(),
  } = options || {};

  const payment = payload?.payload?.payment?.entity;
  const order = payload?.payload?.order?.entity;

  // Extract ONLY minimal diagnostic fields. Customer PII (email, phone) is strictly omitted.
  const sanitizedPayment = payment ? {
    id: payment.id ? String(payment.id) : null,
    order_id: payment.order_id ? String(payment.order_id) : null,
    amount: payment.amount !== undefined ? Number(payment.amount) : null,
    currency: payment.currency ? String(payment.currency) : null,
    status: payment.status ? String(payment.status) : null,
    product_key: (payment.notes?.product_key || payment.notes?.course_key || payment.notes?.product) ? String(payment.notes.product_key || payment.notes.course_key || payment.notes.product) : null,
  } : null;

  const sanitizedOrder = order ? {
    id: order.id ? String(order.id) : null,
    amount: order.amount !== undefined ? Number(order.amount) : null,
    product_key: (order.notes?.product_key || order.notes?.course_key || order.notes?.product) ? String(order.notes.product_key || order.notes.course_key || order.notes.product) : null,
  } : null;

  // Header Redaction: Mask all credentials, signatures, and tokens
  const sanitizedHeaders = {};
  for (const [key, val] of Object.entries(headers)) {
    const lowerKey = key.toLowerCase();
    if (
      lowerKey.includes('signature') ||
      lowerKey.includes('auth') ||
      lowerKey.includes('secret') ||
      lowerKey.includes('cookie') ||
      lowerKey.includes('token')
    ) {
      sanitizedHeaders[key] = '[REDACTED]';
    } else {
      sanitizedHeaders[key] = String(val).slice(0, 100);
    }
  }

  return {
    dlqId: `dlq_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    eventId: eventId || payload?.id || 'unknown_event',
    paymentId: sanitizedPayment?.id || null,
    orderId: sanitizedPayment?.order_id || sanitizedOrder?.id || null,
    errorCategory: String(errorCategory || 'UNROUTABLE_WEBHOOK'),
    errorMessage: String(errorMessage || ''),
    status: Number(status) || 422,
    retryCount: Number(retryCount) || 0,
    timestamp,
    expiresAt: timestamp + DEFAULT_DLQ_RETENTION_MS,
    summary: {
      event: payload?.event || 'unknown',
      payment: sanitizedPayment,
      order: sanitizedOrder,
    },
    sanitizedHeaders,
  };
}

/**
 * Persists an unroutable or failed webhook entry into the Dead Letter Queue.
 */
export function recordDeadLetterQueueEntry(entryOptions, store = inMemoryDeadLetterQueue) {
  const entry = sanitizeForDeadLetterQueue(entryOptions);

  // Evict expired entries beyond retention period
  const now = Date.now();
  for (let i = store.length - 1; i >= 0; i--) {
    if (store[i].expiresAt < now) {
      store.splice(i, 1);
    }
  }

  store.push(entry);
  return entry;
}

/**
 * Asynchronously persists a DLQ entry, supporting external distributed persistence adapters
 * (e.g., Cloudflare KV, Redis, DynamoDB). Detects and surfaces storage failures cleanly.
 */
export async function recordDeadLetterQueueEntryAsync(entryOptions, store = inMemoryDeadLetterQueue, persistenceAdapter = null) {
  const entry = sanitizeForDeadLetterQueue(entryOptions);

  try {
    // Evict expired entries
    const now = Date.now();
    for (let i = store.length - 1; i >= 0; i--) {
      if (store[i].expiresAt < now) {
        store.splice(i, 1);
      }
    }
    store.push(entry);

    if (persistenceAdapter && typeof persistenceAdapter.saveEntry === 'function') {
      await persistenceAdapter.saveEntry(entry);
    }

    return {
      success: true,
      entry,
    };
  } catch (err) {
    return {
      success: false,
      error: `DLQ_STORAGE_FAILURE: ${err.message}`,
      entry, // returns in-memory fallback entry
    };
  }
}

/**
 * Queries the Dead Letter Queue with strong administrator authentication.
 */
export function queryDeadLetterQueue(adminAuthHeader, expectedAdminSecret, store = inMemoryDeadLetterQueue) {
  if (!expectedAdminSecret || typeof expectedAdminSecret !== 'string') {
    return {
      success: false,
      status: 500,
      error: 'CONFIG_ERROR: RECONCILIATION_ADMIN_KEY is not configured on proxy.',
    };
  }

  if (!adminAuthHeader || !adminAuthHeader.startsWith('Bearer ')) {
    return {
      success: false,
      status: 401,
      error: 'UNAUTHORIZED: Missing or malformed Bearer authorization header.',
    };
  }

  const token = adminAuthHeader.replace(/^Bearer\s+/i, '').trim();
  if (!constantTimeCompare(token, expectedAdminSecret)) {
    return {
      success: false,
      status: 403,
      error: 'FORBIDDEN: Invalid administrator reconciliation credentials.',
    };
  }

  const now = Date.now();
  const activeEntries = store.filter((e) => e.expiresAt >= now);

  return {
    success: true,
    status: 200,
    count: activeEntries.length,
    entries: activeEntries,
  };
}

// ============================================================================
// SECURE ADMINISTRATIVE RECONCILIATION SYSTEM
// ============================================================================

export const reconciliationRateLimitTracker = new Map();

/**
 * Handles an authorized reconciliation request to heal captured payments
 * that were interrupted or dropped before entering Google Sheets.
 *
 * Security Controls:
 * 1. Requires strong Bearer token authentication (RECONCILIATION_ADMIN_KEY).
 * 2. Never accepts credentials in query parameters or URL paths.
 * 3. Enforces rate limiting per client IP (default: max 10 requests / minute).
 * 4. Verifies payment and order server-to-server with official Razorpay REST API.
 * 5. Strictly requires status === 'captured' and verifies amount, currency, and merchant account.
 * 6. Authoritatively maps to product from trusted order notes.
 * 7. Forwards with proxy signature to Apps Script, where LockService and PROCESSED_PAY_ guarantee idempotency.
 */
export async function handleAdminReconciliationRequest(options) {
  const {
    authHeader,
    expectedAdminSecret,
    paymentId,
    orderId,
    clientIp = '127.0.0.1',
    keyId = process.env.RAZORPAY_KEY_ID,
    keySecret = process.env.RAZORPAY_KEY_SECRET,
    proxySecret = process.env.WEBHOOK_PROXY_SECRET,
    expectedMerchantAccount,
    customEndpointMap = {},
    rateLimitTracker = reconciliationRateLimitTracker,
    fetchImpl = fetch,
    maxRequestsPerMinute = 10,
  } = options || {};

  // 1. Sliding-window Rate Limiting
  const now = Date.now();
  const clientWindow = rateLimitTracker.get(clientIp) || [];
  const recentCalls = clientWindow.filter((ts) => now - ts < 60000);
  if (recentCalls.length >= maxRequestsPerMinute) {
    return {
      success: false,
      status: 429,
      error: 'RATE_LIMIT_EXCEEDED: Too many reconciliation requests. Try again later.',
    };
  }
  recentCalls.push(now);
  rateLimitTracker.set(clientIp, recentCalls);

  // 2. HTTP Method & Route Enforcement
  if (options.method && options.method.toUpperCase() !== 'POST') {
    return {
      success: false,
      status: 405,
      error: 'METHOD_NOT_ALLOWED: Administrative reconciliation requires HTTP POST.',
    };
  }

  // 3. Reject Credentials in Query Parameters
  if (
    options.queryParams &&
    (options.queryParams.token ||
      options.queryParams.key ||
      options.queryParams.secret ||
      options.queryParams.admin_key ||
      options.queryParams.authorization)
  ) {
    return {
      success: false,
      status: 400,
      error: 'INVALID_CREDENTIAL_LOCATION: Credentials cannot be passed in query parameters or URL. Use Authorization Bearer header.',
    };
  }

  // 4. Strong Administrator Authentication (Timing-Safe)
  if (!expectedAdminSecret || typeof expectedAdminSecret !== 'string') {
    return {
      success: false,
      status: 500,
      error: 'CONFIG_ERROR: RECONCILIATION_ADMIN_KEY is not configured on proxy.',
    };
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      success: false,
      status: 401,
      error: 'UNAUTHORIZED: Missing or malformed Bearer authorization header.',
    };
  }

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!constantTimeCompare(token, expectedAdminSecret)) {
    return {
      success: false,
      status: 403,
      error: 'FORBIDDEN: Invalid administrator reconciliation secret.',
    };
  }

  // 5. Parameter Validation & Format Cross-Check
  const cleanPayId = String(paymentId || '').trim();
  const cleanOrdId = String(orderId || '').trim();
  if (!cleanPayId || !cleanOrdId) {
    return {
      success: false,
      status: 400,
      error: 'MISSING_RECONCILIATION_PARAMS: Both paymentId and orderId are required.',
    };
  }

  if (!/^pay_[A-Za-z0-9_-]+$/.test(cleanPayId) || !/^order_[A-Za-z0-9_-]+$/.test(cleanOrdId)) {
    return {
      success: false,
      status: 400,
      error: 'INVALID_IDENTIFIER_FORMAT: paymentId must match /^pay_[A-Za-z0-9_-]+$/ and orderId must match /^order_[A-Za-z0-9_-]+$/.',
    };
  }

  // 6. Remote Server-to-Server Razorpay Verification
  const rzpRes = await verifyPaymentWithRazorpayServer({
    paymentId: cleanPayId,
    orderId: cleanOrdId,
    keyId,
    keySecret,
    expectedMerchantAccount,
    verifyAuthoritativeOrder: true,
    isolateProduction: Boolean(keyId && keyId.startsWith('rzp_live_')),
    fetchImpl,
  });

  if (!rzpRes.success) {
    return {
      success: false,
      status: 422,
      error: `RECONCILIATION_RAZORPAY_VERIFICATION_FAILED: ${rzpRes.error}`,
    };
  }

  const verifiedPayment = rzpRes.verifiedPayment;
  const authoritativeOrder = rzpRes.authoritativeOrder;

  // 5. Authoritative Route Determination from Order Notes
  const routeRes = determineAuthoritativeProductRoute(authoritativeOrder, verifiedPayment, customEndpointMap);
  if (!routeRes.success) {
    return {
      success: false,
      status: 422,
      error: `RECONCILIATION_ROUTING_FAILED: ${routeRes.error}`,
    };
  }

  // 6. Generate Authenticated Proxy Payload for Apps Script
  const eventId = `rec_${paymentId}_${now}`;
  const isHardened = Boolean(options.hardened || options.version === 'v2.1');
  const payloadDigest = isHardened
    ? computeHardenedPayloadDigest(verifiedPayment)
    : computeCanonicalPayloadDigest(verifiedPayment);

  const proxySignature = isHardened
    ? computeHardenedProxySignature({
        eventId,
        eventType: 'payment.captured',
        orderId,
        paymentId,
        timestamp: now,
        productKey: routeRes.productKey,
        amount: verifiedPayment.amount,
        currency: verifiedPayment.currency,
        status: verifiedPayment.status,
        accountId: verifiedPayment.account_id || verifiedPayment.notes?.account_id || '',
        payloadDigest,
      }, proxySecret)
    : computeCanonicalProxySignature({
        eventId,
        orderId,
        paymentId,
        timestamp: now,
        productKey: routeRes.productKey,
        payloadDigest,
      }, proxySecret);

  const forwardPayload = {
    event: 'payment.captured',
    eventId,
    timestamp: now,
    proxy_version: isHardened ? 'v2.1' : 'v2',
    target_product: routeRes.productKey,
    payload_digest: payloadDigest,
    proxy_signature: proxySignature,
    reconciliation: true,
    payload: {
      payment: {
        entity: {
          id: paymentId,
          order_id: orderId,
          amount: verifiedPayment.amount,
          currency: verifiedPayment.currency,
          status: verifiedPayment.status,
          email: verifiedPayment.email || '',
          contact: verifiedPayment.contact || '',
          method: verifiedPayment.method || 'Razorpay',
          notes: verifiedPayment.notes || {},
        },
      },
    },
  };

  // 7. Dispatch to Destination Apps Script Web App
  const forwardResponse = await forwardWebhookToAppsScript({
    forwardPayload,
    targetUrl: routeRes.targetUrl,
    fetchImpl,
  });

  return {
    success: true,
    status: 200,
    reconciled: true,
    paymentId,
    orderId,
    targetProduct: routeRes.productKey,
    targetUrl: routeRes.targetUrl,
    appsScriptStatus: forwardResponse.status,
  };
}
