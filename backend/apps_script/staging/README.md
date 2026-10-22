# Tech Tycoon Staging Payments — Apps Script Package

**Project Name in Google Apps Script**: `Tech Tycoon Staging Payments`  
**Dedicated Staging Google Sheet**: `Tech Tycoon Staging Payments`  
**Environment**: `staging`  
**Security Level**: Strict Protocol v2.1 | Isolated Mock Invoicing | Outbound Notification Suppression  

---

## 1. Overview & Architecture

This package provides the dedicated, isolated Google Apps Script implementation for the **"Tech Tycoon Staging Payments"** project. It handles test payments across all eight Tech Tycoon educational courses:
1. `ai_masterclass` (AI Secrets Revealed Masterclass)
2. `advanced_masterclass` (Advance AI Masterclass)
3. `claude_masterclass` (Claude Coding Masterclass)
4. `academy` (TECH TYCOON Academy Pre-Register)
5. `ai_bgm` (Advance AI-Business Generative Model)
6. `consulting` (1-on-1 AI Strategy Session)
7. `professionals` (Advance AI for Professionals)
8. `upscale` (UPSCALE: 1-Day AI Mastery Workshop)

---

## 2. Required Script Properties

In the Apps Script editor, open **Project Settings (gear icon) > Script Properties**, and configure the following keys:

| Property Name | Required Value / Format | Security Rule |
|---|---|---|
| `APP_ENVIRONMENT` | `staging` | **Mandatory**. Strictly required. Fails closed if missing, invalid, or set to `production`. |
| `SPREADSHEET_ID` | `<Dedicated Staging Google Spreadsheet ID>` | **Mandatory**. Rejects any of the 5 known production spreadsheet IDs. |
| `RAZORPAY_KEY_ID` | `rzp_test_<your_razorpay_test_key>` | **Mandatory**. Must start with `rzp_test_`. Strictly rejects `rzp_live_`. |
| `RAZORPAY_KEY_SECRET` | `<your_razorpay_test_secret>` | **Mandatory**. Used to verify direct payment callback signatures. |
| `WEBHOOK_PROXY_SECRET` | `<32+_char_random_proxy_secret>` | **Mandatory**. Shared high-entropy secret between Staging Proxy and Apps Script. |
| `INVOICE_TOKEN_SECRET` | `<32+_char_random_invoice_secret>` | **Mandatory**. Dedicated HMAC secret for client invoice retrieval tokens. |
| `MOCK_INVOICE_ADAPTER` | `true` | **Mandatory**. Guarantees zero external network calls to LeadConnector/FunnelsDone. |
| `SUPPRESS_NOTIFICATIONS`| `true` | **Mandatory**. Guarantees zero outbound WhatsApp or email dispatches to customers. |
| `STRICT_PROXY_MODE` | `true` | **Mandatory**. Enforces v2.1 protocol verification; rejects legacy signatures. |

---

## 3. Dedicated Staging Google Spreadsheet Setup

Open the dedicated Google Spreadsheet named **"Tech Tycoon Staging Payments"** and create the following three tabs with their exact headers:

### Tab 1: `Sheet1` (Registrations)
Headers in Row 1:
```
Timestamp | Name | Email | Phone | Course | UserType | Amount | Payment Status | Order ID | Payment ID | Email Status | WhatsApp Status
```

### Tab 2: `GST_Sales_Register` (Tax Invoices)
Headers in Row 1:
```
Timestamp | Invoice No | Invoice Date | Customer Name | Customer Email | Customer Phone | Place of Supply | Supply Type | Reverse Charge | SAC Code | Service Description | Taxable Value (₹) | CGST Rate (%) | CGST Amount (₹) | SGST Rate (%) | SGST Amount (₹) | Round Off (₹) | Total Invoice Value (₹) | Payment ID | Order ID
```

### Tab 3: `Logs` (Audit Trail)
Headers in Row 1:
```
Timestamp | Event | Details
```

---

## 4. Read-Only Diagnostic Function (`runStagingDiagnostics`)

The script includes a read-only diagnostics utility function: `runStagingDiagnostics()`.

### How to Run in Apps Script Editor:
1. In the Apps Script toolbar, select the function **`runStagingDiagnostics`** from the function dropdown.
2. Click **Run**.
3. Inspect the **Execution log**:
   - Returns `{ status: "PASS", checks: { environment: "PASS", spreadsheetIsolation: "PASS", spreadsheetAccess: "PASS", mockInvoiceAdapter: "PASS", notificationSuppression: "PASS", ... } }`.
   - If any configuration is invalid, it returns `status: "FAIL"` with safe error codes (e.g. `PRODUCTION_SPREADSHEET_REJECTED`, `LIVE_KEY_IN_STAGING_REJECTED`).
   - **Guarantees**: Zero rows appended, zero invoices created, zero notifications dispatched, zero secrets or customer PII printed.

### How to Run via HTTP GET:
You can also run diagnostics by requesting the Web App URL:
```
GET https://script.google.com/macros/s/<STAGING_DEPLOYMENT_ID>/exec?action=diagnostics
```

---

## 5. Authoritative Razorpay Verification (`verifyPaymentWithRazorpayServer`)

The script includes server-to-server verification (`verifyPaymentWithRazorpayServer(orderId, paymentId, expectedAmount, isIntl)`):
- Authoritatively verifies payments against `https://api.razorpay.com/v1/payments/{paymentId}` using basic auth test credentials.
- Checks `payment.id`, `payment.order_id`, `payment.status === 'captured'`, `payment.currency === 'INR'`, and expected amount.
- Rejects uncaptured payments, mismatched order IDs, mismatched amounts, or non-INR currencies.

---

## 6. Token-Bound Invoice Retrieval (`getVerifiedInvoiceRecord`)

The script implements cryptographically bound, time-expiring invoice tokens:
- Direct client callbacks (`handleClientPaymentCallback`) issue an `invoiceToken` signed with `INVOICE_TOKEN_SECRET`: `<expiresAt>.<hmacSha256(paymentId|orderId|expiresAt)>`.
- **Authoritative verification required**: Direct client callback NEVER issues a token or fulfills payment unless authoritative server checks (`verifyPaymentWithRazorpayServer`) confirm the payment is `captured`, in INR, matches `order_id` and expected amount, and belongs to test mode.
- **Protected POST-Only Retrieval**: Insecure GET retrieval via query parameters is strictly rejected (`METHOD_NOT_ALLOWED`). The frontend must use protected POST with `action: "getVerifiedInvoice"`, supplying `paymentId`, `orderId`, and `token`.
- Validates token expiration, signature integrity, and strict payment-order binding.
- Cached invoices (`VERIFIED_INV_`) are stored as structured JSON and strictly bound to `orderId`; mismatched order requests are rejected immediately.
- Tokens bound to Payment A cannot be used to retrieve invoices for Payment B.
- Unfulfilled or unverified registrations cannot retrieve invoices.
