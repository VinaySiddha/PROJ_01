# Deployment Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Deploy theMagicshow to production at `themagicscreen.com` with AiSensy replacing WATI for WhatsApp notifications.

**Architecture:** Next.js frontend on Vercel, Express backend on Railway, Supabase PostgreSQL, Upstash Redis, Cloudinary images, AiSensy WhatsApp.

**Tech Stack:** Next.js 14, Express.js + TypeScript, Prisma, Railway, Vercel, AiSensy API

---

## Overview

### What changes in code
1. `backend/src/config/index.ts` — swap WATI env vars for AiSensy vars
2. `backend/src/services/whatsapp.service.ts` — rewrite API calls to use AiSensy
3. `backend/.env.example` — replace WATI block with AiSensy block

### What doesn't change
- `backend/src/app.ts` — CORS already reads `config.FRONTEND_URL` from env; no code change needed
- `frontend/lib/constants.ts` — already reads `NEXT_PUBLIC_API_URL` from env; no code change needed
- All other files — zero code changes

### Deployment sequence
1. Code changes (local) → commit → push to `main`
2. Backend: Railway deploy → env vars → migrate DB → custom domain
3. Frontend: Vercel deploy → env vars → custom domain
4. DNS: point themagicscreen.com and api.themagicscreen.com
5. AiSensy: sign up → create campaigns → get API key
6. Smoke test end-to-end

---

## Task 1: Sign Up for AiSensy and Create Message Templates

> Do this first — Meta template approval can take a few hours. Get it queued.

**Step 1: Create AiSensy account**
- Go to https://aisensy.com → click "Get Started Free"
- Register with your business email
- Connect your WhatsApp Business number (the one customers will receive messages from)
- Note your **API Key** from Settings → API Keys

**Step 2: Create 6 message campaigns (templates)**

In AiSensy dashboard → Campaigns → Create Campaign:

| Campaign Name | Category | Message template |
|---|---|---|
| `magicshow_otp` | OTP | `Your theMagicshow verification code is: {{1}}. This code expires in 5 minutes. Do not share it with anyone.` |
| `magicshow_booking_confirmed` | UTILITY | `🎬 *Booking Confirmed!* Hi {{1}}! Your theMagicshow booking is confirmed. 📍 Theater: {{2}} 📅 Date: {{3}} 🕐 Slot: {{4}} 🎫 Booking ID: {{5}}. Please bring your OTT account credentials. See you soon! 🎉` |
| `magicshow_reminder` | UTILITY | `⏰ *Reminder: Your theMagicshow experience is tomorrow!* Hi {{1}}! 📍 Theater: {{2}} 📅 Date: {{3}} 🕐 Slot: {{4}} 🎫 Booking ID: {{5}}. Don't forget to bring your OTT account credentials (Netflix, Prime, etc.). See you soon! 🎬` |
| `magicshow_review` | MARKETING | `⭐ *How was your theMagicshow experience?* Hi {{1}}! We hope you had an amazing time (Booking: {{2}}). Share your feedback: {{3}}. Your review helps us improve! 🎬` |
| `magicshow_cancelled` | UTILITY | `❌ *Booking Cancelled* Hi {{1}}, your booking *{{2}}* has been cancelled. {{3}}. Hope to see you again soon!` |
| `magicshow_payment_failed` | UTILITY | `⚠️ *Payment Failed* Hi {{1}}, your payment for booking *{{2}}* could not be processed. Please retry: {{3}}. Need help? Contact us on WhatsApp.` |

> Templates must be submitted for Meta approval. While waiting, proceed with the remaining tasks.

**Step 3: Note your campaign names exactly as entered**
You'll put them in env vars next.

---

## Task 2: Update Backend Config to Use AiSensy

**Files:**
- Modify: `backend/src/config/index.ts`
- Modify: `backend/.env.example`

**Step 1: Update Zod schema in `backend/src/config/index.ts`**

Replace lines 29–31 (the three WATI lines):
```typescript
  WATI_API_KEY: z.string().min(1, 'WATI_API_KEY is required'),
  WATI_API_ENDPOINT: z.string().url('WATI_API_ENDPOINT must be a valid URL'),
  WATI_BUSINESS_PHONE: z.string().min(10, 'WATI_BUSINESS_PHONE is required'),
```

With AiSensy vars:
```typescript
  AISENSY_API_KEY: z.string().min(1, 'AISENSY_API_KEY is required'),
  AISENSY_CAMPAIGN_OTP: z.string().default('magicshow_otp'),
  AISENSY_CAMPAIGN_BOOKING_CONFIRMED: z.string().default('magicshow_booking_confirmed'),
  AISENSY_CAMPAIGN_REMINDER: z.string().default('magicshow_reminder'),
  AISENSY_CAMPAIGN_REVIEW: z.string().default('magicshow_review'),
  AISENSY_CAMPAIGN_CANCELLED: z.string().default('magicshow_cancelled'),
  AISENSY_CAMPAIGN_PAYMENT_FAILED: z.string().default('magicshow_payment_failed'),
```

**Step 2: Update `backend/.env.example`**

Replace the WATI block:
```
# ─────────────────────────────────────────────
# WHATSAPP (WATI)
# ─────────────────────────────────────────────
WATI_API_KEY=your_wati_api_key
WATI_API_ENDPOINT=https://live-server-XXXXX.wati.io
WATI_BUSINESS_PHONE=919948954545
```

With:
```
# ─────────────────────────────────────────────
# WHATSAPP (AiSensy)
# ─────────────────────────────────────────────
AISENSY_API_KEY=your_aisensy_api_key
AISENSY_CAMPAIGN_OTP=magicshow_otp
AISENSY_CAMPAIGN_BOOKING_CONFIRMED=magicshow_booking_confirmed
AISENSY_CAMPAIGN_REMINDER=magicshow_reminder
AISENSY_CAMPAIGN_REVIEW=magicshow_review
AISENSY_CAMPAIGN_CANCELLED=magicshow_cancelled
AISENSY_CAMPAIGN_PAYMENT_FAILED=magicshow_payment_failed
```

**Step 3: Verify TypeScript compiles**
```bash
cd backend && npx tsc --noEmit
```
Expected: no errors

**Step 4: Commit**
```bash
git add backend/src/config/index.ts backend/.env.example
git commit -m "feat(config): swap WATI env vars for AiSensy"
```

---

## Task 3: Rewrite WhatsApp Service for AiSensy

**Files:**
- Modify: `backend/src/services/whatsapp.service.ts`

**Step 1: Understand AiSensy API format**

AiSensy sends template messages. Every call is a POST to:
```
POST https://backend.aisensy.com/campaign/t1/api/v2
```
with JSON body:
```json
{
  "apiKey": "YOUR_KEY",
  "campaignName": "campaign_name",
  "destination": "919948954545",
  "userName": "Customer Name",
  "templateParams": ["param1", "param2"]
}
```
`destination` = phone number with country code, NO `+` prefix.
`templateParams` = array of values to fill {{1}}, {{2}}, etc. in your template.

**Step 2: Replace the full file content**

Replace `backend/src/services/whatsapp.service.ts` with:

```typescript
/**
 * whatsapp.service.ts
 *
 * Sends WhatsApp messages via AiSensy Campaign API (WhatsApp Business API).
 * All methods are fire-and-forget from the caller's perspective — they can be awaited
 * but failures are caught, logged as warnings, and do NOT propagate to callers.
 *
 * Template params map to {{1}}, {{2}}, etc. in AiSensy campaign templates.
 *
 * Trigger events and templates:
 *   1. OTP verification code              → magicshow_otp
 *   2. Booking confirmation               → magicshow_booking_confirmed
 *   3. 24-hour slot reminder              → magicshow_reminder
 *   4. Post-slot review request           → magicshow_review
 *   5. Booking cancellation notification  → magicshow_cancelled
 *   6. Payment failure with retry link    → magicshow_payment_failed
 */
import axios from 'axios';
import { config } from '../config/index';
import { logger } from '../utils/logger';
import { maskPhone } from '../utils/formatters';

/** AiSensy Campaign API endpoint */
const AISENSY_URL = 'https://backend.aisensy.com/campaign/t1/api/v2';

/**
 * Sends a WhatsApp template message via AiSensy.
 * Internal helper — all public methods call this.
 *
 * @param phone          - Recipient phone with country code, no '+' (e.g. '919948954545')
 * @param campaignName   - AiSensy campaign name (must match dashboard exactly)
 * @param userName       - Customer name (shown in AiSensy logs)
 * @param templateParams - Array of strings mapping to {{1}}, {{2}}, ... in the template
 */
const sendAiSensyMessage = async (
  phone: string,
  campaignName: string,
  userName: string,
  templateParams: string[],
): Promise<void> => {
  await axios.post(
    AISENSY_URL,
    {
      apiKey: config.AISENSY_API_KEY,
      campaignName,
      destination: phone,
      userName,
      templateParams,
    },
    { timeout: 10_000 },
  );
};

export class WhatsAppService {
  /**
   * Sends a one-time OTP to the customer's WhatsApp number.
   * Called by AuthService.sendOtp().
   *
   * Template: magicshow_otp
   * Params: {{1}} = OTP code
   *
   * @param phone - Customer phone with country code prefix (e.g. '+919948954545')
   * @param otp   - 6-digit OTP string
   */
  static async sendOtpMessage(phone: string, otp: string): Promise<void> {
    const normalizedPhone = phone.replace(/^\+/, '');

    try {
      await sendAiSensyMessage(
        normalizedPhone,
        config.AISENSY_CAMPAIGN_OTP,
        'Customer',
        [otp],
      );

      logger.info('WhatsApp OTP sent', { event: 'whatsapp.otp_sent', phone: maskPhone(phone) });
    } catch (err) {
      logger.error('WhatsApp OTP send failed', {
        event: 'whatsapp.otp_failed',
        phone: maskPhone(phone),
        error: (err as Error).message,
      });
      // Re-throw so AuthService can handle it
      throw err;
    }
  }

  /**
   * Sends a booking confirmation message after successful payment.
   *
   * Template: magicshow_booking_confirmed
   * Params: {{1}} name, {{2}} theaterName, {{3}} date, {{4}} slot, {{5}} bookingRef
   */
  static async sendBookingConfirmation(params: {
    phone: string;
    name: string;
    bookingRef: string;
    theaterName: string;
    date: string;
    slot: string;
  }): Promise<void> {
    const { phone, name, bookingRef, theaterName, date, slot } = params;
    const normalizedPhone = phone.replace(/^\+/, '');

    try {
      await sendAiSensyMessage(
        normalizedPhone,
        config.AISENSY_CAMPAIGN_BOOKING_CONFIRMED,
        name,
        [name, theaterName, date, slot, bookingRef],
      );

      logger.info('Booking confirmation WhatsApp sent', {
        event: 'whatsapp.booking_confirmed',
        bookingRef,
        phone: maskPhone(phone),
      });
    } catch (err) {
      logger.warn('WhatsApp booking confirmation failed — will retry via cron', {
        event:      'whatsapp.booking_confirmation_failed',
        bookingRef,
        phone:      maskPhone(phone),
        error:      (err as Error).message,
      });
    }
  }

  /**
   * Sends a 24-hour reminder before the booked slot.
   * Triggered by the nightly cron job.
   *
   * Template: magicshow_reminder
   * Params: {{1}} name, {{2}} theaterName, {{3}} date, {{4}} slot, {{5}} bookingRef
   */
  static async send24HourReminder(params: {
    phone: string;
    name: string;
    bookingRef: string;
    theaterName: string;
    date: string;
    slot: string;
  }): Promise<void> {
    const { phone, name, bookingRef, theaterName, date, slot } = params;
    const normalizedPhone = phone.replace(/^\+/, '');

    try {
      await sendAiSensyMessage(
        normalizedPhone,
        config.AISENSY_CAMPAIGN_REMINDER,
        name,
        [name, theaterName, date, slot, bookingRef],
      );

      logger.info('24hr reminder WhatsApp sent', { event: 'whatsapp.reminder_sent', bookingRef });
    } catch (err) {
      logger.warn('WhatsApp 24hr reminder failed', {
        event: 'whatsapp.reminder_failed',
        bookingRef,
        error: (err as Error).message,
      });
    }
  }

  /**
   * Sends a review request 2 hours after the slot ends.
   * Triggered by a cron job.
   *
   * Template: magicshow_review
   * Params: {{1}} name, {{2}} bookingRef, {{3}} reviewUrl
   */
  static async sendReviewRequest(params: {
    phone: string;
    name: string;
    bookingRef: string;
    reviewToken: string;
    frontendUrl: string;
  }): Promise<void> {
    const { phone, name, bookingRef, reviewToken, frontendUrl } = params;
    const normalizedPhone = phone.replace(/^\+/, '');
    const reviewUrl = `${frontendUrl}/review?token=${reviewToken}`;

    try {
      await sendAiSensyMessage(
        normalizedPhone,
        config.AISENSY_CAMPAIGN_REVIEW,
        name,
        [name, bookingRef, reviewUrl],
      );

      logger.info('Review request WhatsApp sent', { event: 'whatsapp.review_request_sent', bookingRef });
    } catch (err) {
      logger.warn('WhatsApp review request failed', {
        event: 'whatsapp.review_request_failed',
        bookingRef,
        error: (err as Error).message,
      });
    }
  }

  /**
   * Sends a cancellation notification with refund information.
   *
   * Template: magicshow_cancelled
   * Params: {{1}} name, {{2}} bookingRef, {{3}} refundLine
   */
  static async sendCancellationNotice(params: {
    phone: string;
    name: string;
    bookingRef: string;
    refundAmount: number;
  }): Promise<void> {
    const { phone, name, bookingRef, refundAmount } = params;
    const normalizedPhone = phone.replace(/^\+/, '');

    const refundLine = refundAmount > 0
      ? `A refund of ₹${refundAmount} will be processed within 7 working days.`
      : `No refund is applicable as the cancellation was made within 72 hours of the slot.`;

    try {
      await sendAiSensyMessage(
        normalizedPhone,
        config.AISENSY_CAMPAIGN_CANCELLED,
        name,
        [name, bookingRef, refundLine],
      );

      logger.info('Cancellation notice WhatsApp sent', { event: 'whatsapp.cancellation_sent', bookingRef });
    } catch (err) {
      logger.warn('WhatsApp cancellation notice failed', {
        event: 'whatsapp.cancellation_failed',
        bookingRef,
        error: (err as Error).message,
      });
    }
  }

  /**
   * Sends a payment failure message with a retry link.
   *
   * Template: magicshow_payment_failed
   * Params: {{1}} name, {{2}} bookingRef, {{3}} retryUrl
   */
  static async sendPaymentFailureNotice(params: {
    phone: string;
    name: string;
    bookingRef: string;
    retryUrl: string;
  }): Promise<void> {
    const { phone, name, bookingRef, retryUrl } = params;
    const normalizedPhone = phone.replace(/^\+/, '');

    try {
      await sendAiSensyMessage(
        normalizedPhone,
        config.AISENSY_CAMPAIGN_PAYMENT_FAILED,
        name,
        [name, bookingRef, retryUrl],
      );

      logger.info('Payment failure WhatsApp sent', { event: 'whatsapp.payment_failed_sent', bookingRef });
    } catch (err) {
      logger.warn('WhatsApp payment failure notice failed', {
        event: 'whatsapp.payment_failed_send_failed',
        bookingRef,
        error: (err as Error).message,
      });
    }
  }
}
```

**Step 3: Verify TypeScript compiles**
```bash
cd backend && npx tsc --noEmit
```
Expected: no errors

**Step 4: Commit**
```bash
git add backend/src/services/whatsapp.service.ts
git commit -m "feat(whatsapp): replace WATI with AiSensy campaign API"
```

---

## Task 4: Push to main and Verify Build

**Step 1: Make sure you're on develop and push**
```bash
git status
git push origin develop
```

**Step 2: Merge develop → main**
```bash
git checkout main
git merge develop --no-ff -m "chore: merge develop → main for production deploy"
git push origin main
```

**Step 3: Verify backend build succeeds locally**
```bash
cd backend && npm run build
```
Expected: `dist/` folder created with no TypeScript errors.

**Step 4: Verify frontend build succeeds locally**
```bash
cd ../frontend && npm run build
```
Expected: build completes. Note any warnings — they're fine for now. Errors must be fixed.

---

## Task 5: Deploy Backend to Railway

> Do this in Railway's web dashboard at railway.app

**Step 1: Create Railway project**
1. Go to https://railway.app → New Project → Deploy from GitHub repo
2. Select your repo `VinaySiddha/PROJ_01`
3. When asked for root directory, enter: `backend`
4. Railway detects Node.js and uses `npm run build` + `npm start` automatically

**Step 2: Add environment variables in Railway dashboard**

Navigate to your service → Variables tab → Add all of these:

```
NODE_ENV=production
PORT=4000
DATABASE_URL=<your Supabase connection string>
REDIS_URL=<your Upstash Redis URL>
JWT_SECRET=<generate: openssl rand -hex 32>
JWT_EXPIRES_IN=7d
RAZORPAY_KEY_ID=<your live key>
RAZORPAY_KEY_SECRET=<your live secret>
RAZORPAY_WEBHOOK_SECRET=<your webhook secret>
CLOUDINARY_CLOUD_NAME=<your cloud name>
CLOUDINARY_API_KEY=<your api key>
CLOUDINARY_API_SECRET=<your api secret>
AISENSY_API_KEY=<your AiSensy API key>
AISENSY_CAMPAIGN_OTP=magicshow_otp
AISENSY_CAMPAIGN_BOOKING_CONFIRMED=magicshow_booking_confirmed
AISENSY_CAMPAIGN_REMINDER=magicshow_reminder
AISENSY_CAMPAIGN_REVIEW=magicshow_review
AISENSY_CAMPAIGN_CANCELLED=magicshow_cancelled
AISENSY_CAMPAIGN_PAYMENT_FAILED=magicshow_payment_failed
FRONTEND_URL=https://themagicscreen.com
```

> For `JWT_SECRET`, generate one by running in terminal:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

**Step 3: Trigger deploy**
- Railway auto-deploys when env vars are saved. Watch the deploy logs.
- Expected: `Server running on port 4000` in logs.

**Step 4: Run Prisma migrations**

In Railway dashboard → your service → Shell tab (or via Railway CLI):
```bash
npx prisma migrate deploy
```
Expected: `All migrations have been successfully applied.`

> If Shell tab is not available, use Railway CLI:
> ```bash
> npm install -g @railway/cli
> railway login
> railway link
> railway run npx prisma migrate deploy
> ```

**Step 5: Note your Railway public URL**
It will look like: `https://proj01-backend-production.up.railway.app`
You'll need this for the DNS CNAME and Vercel setup.

**Step 6: Test the backend health**
```bash
curl https://proj01-backend-production.up.railway.app/api/health
```
Expected: `{"success": true, "message": "OK"}` or similar

---

## Task 6: Set Up Custom Domain for Backend (api.themagicscreen.com)

**Step 1: Add custom domain in Railway**
- Railway dashboard → your service → Settings → Domains → Add Custom Domain
- Enter: `api.themagicscreen.com`
- Railway shows you a CNAME value (e.g. `proj01-backend-production.up.railway.app`)

**Step 2: Add DNS record at your domain registrar**

Log in to where you bought themagicscreen.com. Add:
| Type | Name | Value |
|---|---|---|
| CNAME | `api` | `<railway public URL without https://>`  |

Example: `api` → `proj01-backend-production.up.railway.app`

**Step 3: Wait for DNS propagation (5–30 minutes), then verify**
```bash
curl https://api.themagicscreen.com/api/health
```
Expected: same healthy response as Step 6 above.

---

## Task 7: Deploy Frontend to Vercel

> Do this in Vercel's web dashboard at vercel.com

**Step 1: Import project**
1. Go to https://vercel.com → New Project → Import Git Repository
2. Select `VinaySiddha/PROJ_01`
3. **Root Directory**: click "Edit" → enter `frontend`
4. Framework Preset: Next.js (auto-detected)
5. Click Deploy

**Step 2: Add environment variables**

After first deploy, go to Settings → Environment Variables → add for **Production**:

```
NEXT_PUBLIC_API_URL=https://api.themagicscreen.com/api
NEXT_PUBLIC_RAZORPAY_KEY_ID=<your Razorpay live key ID>
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=<your Cloudinary cloud name>
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<your Google Maps API key, or leave empty>
```

> Note: `NEXT_PUBLIC_*` vars must be set before build to be embedded in the client bundle.

**Step 3: Redeploy with env vars**
- Deployments tab → click the three dots on the latest deploy → Redeploy
- Or push a small commit to `main` to trigger auto-deploy

**Step 4: Test on the Vercel preview URL**
- Vercel gives you a URL like `https://proj01-frontend.vercel.app`
- Open it in browser. Check: homepage loads, theaters page loads, no console errors.

---

## Task 8: Set Up Custom Domain for Frontend (themagicscreen.com)

**Step 1: Add domains in Vercel**
- Vercel dashboard → your project → Settings → Domains
- Add `themagicscreen.com`
- Add `www.themagicscreen.com`
- Vercel shows you required DNS records

**Step 2: Add DNS records at your registrar**

| Type | Name | Value |
|---|---|---|
| A | `@` | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com` |

> Vercel's dashboard shows the exact values. Use those — they may differ from above.

**Step 3: Wait for DNS propagation (5–60 minutes)**

Check status in Vercel's Domains tab — it shows "Valid Configuration" when ready.

**Step 4: Verify**
Open https://themagicscreen.com in browser.
Expected: site loads with valid HTTPS certificate.

---

## Task 9: Update Razorpay Webhook URL

**Step 1: Log in to Razorpay dashboard**
Go to Settings → Webhooks

**Step 2: Add/Update webhook endpoint**
- URL: `https://api.themagicscreen.com/api/payments/razorpay/webhook`
- Events: `payment.captured`, `payment.failed`
- Copy the webhook secret and confirm it matches `RAZORPAY_WEBHOOK_SECRET` in Railway env vars

---

## Task 10: End-to-End Smoke Test

Work through this checklist on `https://themagicscreen.com`:

**Step 1: Public pages**
- [ ] Homepage loads (no broken images, no JS errors in console)
- [ ] Theaters listing page loads
- [ ] About, Contact, FAQ, Gallery pages load
- [ ] Mobile layout looks correct (use DevTools mobile view)

**Step 2: Auth flow**
- [ ] Go to `/theater/[any-id]/book` → redirected to login
- [ ] Enter phone number → receive WhatsApp OTP (if AiSensy is approved; skip if pending)
- [ ] Enter OTP → logged in

**Step 3: Booking flow**
- [ ] Select date → slot → occasion → addons → cake → food → summary
- [ ] Summary shows correct totals
- [ ] Click Pay → Razorpay checkout opens
- [ ] Complete test payment (use Razorpay test card: 4111 1111 1111 1111)
- [ ] Booking confirmation page appears with booking reference

**Step 4: Admin**
- [ ] Go to `/admin/login`
- [ ] Login with `admin@themagicshow.com` / `Admin@123`
- [ ] Dashboard shows booking counts
- [ ] Bookings list shows the test booking from Step 3

**Step 5: Fix any failures before considering deployment complete**

---

## Task 11: Set Up Auto-Deploy from main Branch

**Vercel** — already auto-deploys on push to `main` by default (confirmed in dashboard under Git settings).

**Railway** — already auto-deploys on push to `main` by default.

No action needed. Verify in both dashboards that the GitHub branch is set to `main`.

---

## Final Checklist

- [ ] AiSensy campaigns created and submitted for approval
- [ ] Backend running on Railway with all env vars
- [ ] Prisma migrations applied to Supabase
- [ ] `api.themagicscreen.com` resolves to Railway backend
- [ ] Frontend running on Vercel with all env vars
- [ ] `themagicscreen.com` resolves to Vercel frontend
- [ ] Razorpay webhook URL updated
- [ ] End-to-end booking test completed
- [ ] Admin login works