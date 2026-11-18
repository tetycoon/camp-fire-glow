# AI Skills for Teachers and Professors

Landing page for **Tech Tycoon Digital Solution LLP**, with paid registration through **Razorpay**.

```
index.html                        the page
css/styles.css                    all styles; brand colours are at the top (:root)
js/main.js                        all behaviour; settings are at the top (CONFIG)
assets/                           logo mark, favicon, apple icon, social share image
functions/api/create-order.js     creates the Razorpay order (price fixed on the server)
functions/api/verify-payment.js   verifies the payment before confirming the seat
functions/api/razorpay-webhook.js backup record if someone closes the page early
google-apps-script.gs             saves paid registrations to a Google Sheet
```

## Packages

| Package | Price | Code |
|---|---|---|
| Class Only | ₹299 | `class` |
| Class + Learning Document | ₹799 | `class_doc` |

The real amounts live in the `PACKAGES` table inside each file in `functions/api/`. If you change a price, change all three files, plus the display prices in `js/main.js` (`CONFIG.packages`) and `index.html`.

## How registration and payment work

There is **one registration popup** for every button:

| Button | Popup opens with |
|---|---|
| **Register for ₹299** | Option 1: Class Only (₹299) selected |
| **Register with Document - ₹799** | Option 2: Class + Learning Document (₹799) selected |
| **Reserve My Seat** (header, hero, demo, footer, mobile bar) | No package yet, or the one picked earlier |

1. The person can switch between the two options in the popup. The selected package and price show above the button ("Register Now · ₹799").
2. They fill in **full name, mobile number and email**. The browser checks every field (a package, 10-digit Indian mobile starting 6-9, a real email) and shows the error under the field.
3. **Register Now** sends the details to `/api/register`, which saves the lead with the package and amount to the **Registrations** tab. This never blocks the payment.
4. `/api/create-order` checks the details again and creates a Razorpay order for **that package's fixed price**. The name, mobile and email go into the order notes.
5. The popup closes and Razorpay Checkout opens with the name, mobile and email filled in.
6. `/api/verify-payment` checks the signature and confirms the payment with Razorpay. Only then does the popup show "Payment received. You are registered" with the package, amount and payment ID (the pricing section shows the same receipt). The payment is saved to **Paid registrations**.

If the payment window is closed, the payment fails or verification fails, no confirmation is shown, the popup comes back with a clear message, and the person can try again.

**What must be connected:**

- Razorpay keys (see below). `SHEET_WEBHOOK_URL` and `SHEET_SECRET` are needed for the Sheet. Without them payment still works but nothing is saved to the Sheet.
- The **updated** `google-apps-script.gs` deployed: paste the new code, then Deploy > Manage deployments > edit (pencil) > Version: **New version** > Deploy. The URL stays the same. New columns (`full_name`, `mobile`, `reg_email` on Paid registrations; `package`, `package_label`, `amount_inr` on Registrations) are added at the end of existing tabs automatically.


## Deploy (Cloudflare Pages, free)

The payment step needs the server functions, so host this folder on **Cloudflare Pages**. Opening `index.html` from your computer works for viewing, but payment will show "not available".

1. Create a Cloudflare Pages project and upload this folder (or connect a Git repo). There's no build command; the output folder is the root.
2. In **Settings > Environment variables**, add:

| Variable | Value |
|---|---|
| `RAZORPAY_KEY_ID` | From Razorpay Dashboard > Account & Settings > API Keys |
| `RAZORPAY_KEY_SECRET` | Same place. Mark it **Encrypted** |
| `RAZORPAY_WEBHOOK_SECRET` | The secret you set on the webhook (below) |
| `SHEET_WEBHOOK_URL` | Apps Script web app URL (required for the registration popup) |
| `SHEET_SECRET` | Same as `SHARED_SECRET` in the Apps Script (required for the registration popup) |
| `ALLOWED_ORIGIN` | Only if the page is on a different domain from the functions, e.g. `https://academy.techtycoon.in` |

3. Razorpay Dashboard > **Webhooks** > add `https://<your-site>/api/razorpay-webhook`, with event **order.paid** and a secret.
4. Razorpay Dashboard > **Payment Capture**: turn on automatic capture.
5. If the page is hosted somewhere else (for example your current host), set `CONFIG.apiBase` in `js/main.js` to `https://<your-pages-site>/api` and set `ALLOWED_ORIGIN`.

**Test first:** use your Razorpay **test** keys (`rzp_test_...`). Pay with Razorpay's test cards or UPI, and check that the Sheet gets a row. Then switch to live keys.

## Google Sheet

Follow the steps at the top of `google-apps-script.gs`. Only our server functions write to the Sheet: popup registrations go to the **Registrations** tab, and paid, verified registrations go to **Paid registrations**. Duplicates are skipped in both.

## Before going live: fill these in

Search `index.html` for `[` and `TODO`.

| What | Where |
|---|---|
| Date, time, mode | `[Date]`, `[Time]`, `[Online or venue]` (hero and the mobile bottom bar) |
| Meta Pixel | `<head>`: replace `YOUR_PIXEL_ID` and remove the comment markers. A `Purchase` event fires after a verified payment |
| Privacy policy and terms | Links marked `data-todo`. Needed before taking payments |
| Live address | Set to `https://course.techtycoon.in/ai-training-for-teachers/` (`canonical`, `og:url`, `og:image` in `<head>`) |
| Learning document | Decide how the ₹799 buyers receive it (for example WhatsApp or email) |

## Brand

| Token | Hex | Use |
|---|---|---|
| `--navy` | #003884 | Headings, wordmark |
| `--navy-deep` | #002A66 | Dark sections, ₹799 card |
| `--brand-blue` | #00A0F7 | "Digital Solution LLP" wordmark |
| `--cyan` / `--sky` / `--indigo` | #71DDFF / #38B6FF / #5271FF | Logo swirl, gradients |
| `--indigo-strong` | #3D5BEF | Text-safe accent and buttons |

Fonts: Fraunces (headlines) and Inter (body).

## Launch checklist

1. Fill the placeholders above.
2. Pay once with test keys for **each** package. Check the confirmation, the Sheet row and the Razorpay dashboard.
3. Close the payment window halfway. There should be no confirmation, and you should be able to retry.
4. Switch to live keys. Make one real ₹299 payment and refund it from the dashboard.
5. Run Lighthouse on mobile (target 85 or more), and test on a real Android phone over 4G.
