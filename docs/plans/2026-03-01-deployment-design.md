# Deployment Design — theMagicshow → themagicscreen.com

**Date:** 2026-03-01
**Status:** Approved
**Author:** Brainstorming session

---

## Context

Deploy the theMagicshow private theater booking platform (Next.js 14 frontend + Express.js backend) to production at `themagicscreen.com`.

The user owns the domain and has accounts for: Vercel, Railway, Supabase, Razorpay, Upstash Redis, and Cloudinary. WATI (WhatsApp) is replaced with **AiSensy** (free plan, 1,000 sessions/month).

---

## Architecture

```
themagicscreen.com           → Vercel (Next.js 14 frontend)
api.themagicscreen.com       → Railway (Express.js API)
                                  ↓
                             Supabase (PostgreSQL)
                             Upstash (Redis)
                             Cloudinary (images)
                             Razorpay + PhonePe (payments)
                             AiSensy (WhatsApp notifications)
```

---

## Decisions Made

| Decision | Choice | Rationale |
|---|---|---|
| Frontend host | Vercel | Next.js native, Hobby plan free |
| Backend host | Railway | Simple Node.js deploy, ~$5/mo |
| Database | Supabase (already set up) | PostgreSQL, generous free tier |
| Redis | Upstash (already set up) | Serverless Redis, free tier |
| Images | Cloudinary (already set up) | Free tier sufficient |
| WhatsApp | AiSensy (free plan) | Replaces WATI — 1K sessions/mo free |
| Domain | themagicscreen.com (owned) | DNS via registrar |

---

## Services Configuration

### Vercel (Frontend)
- Root Directory: `frontend`
- Build Command: `next build`
- Environment variable: `NEXT_PUBLIC_API_URL=https://api.themagicscreen.com`
- Custom domains: `themagicscreen.com`, `www.themagicscreen.com`
- Framework preset: Next.js

### Railway (Backend)
- Root Directory: `backend`
- Build Command: `npm run build`
- Start Command: `npm start`
- All env vars from `backend/.env.example` with production values
- Custom domain: `api.themagicscreen.com`
- Post-deploy hook: `npx prisma migrate deploy`

---

## DNS Records (themagicscreen.com registrar)

| Subdomain | Type | Value |
|---|---|---|
| `@` (root) | A | `76.76.21.21` (Vercel) |
| `www` | CNAME | `cname.vercel-dns.com` |
| `api` | CNAME | Railway public URL (e.g. `themagicshow-backend.up.railway.app`) |

> Exact Vercel IPs/CNAME values are provided by Vercel's domain dashboard.

---

## Code Changes Required

### 1. `backend/src/services/whatsapp.service.ts`
Replace WATI API integration with AiSensy API:
- New env vars: `AISENSY_API_KEY`, `AISENSY_CAMPAIGN_NAME`
- AiSensy endpoint: `https://backend.aisensy.com/campaign/t1/api/v2`
- Message types to update: booking confirmation, reminder, review request

### 2. `backend/.env.example`
Remove WATI vars, add AiSensy vars:
```
# WHATSAPP (AiSensy)
AISENSY_API_KEY=your_aisensy_api_key
AISENSY_CAMPAIGN_BOOKING=your_booking_campaign_name
AISENSY_CAMPAIGN_REMINDER=your_reminder_campaign_name
AISENSY_CAMPAIGN_REVIEW=your_review_campaign_name
```

### 3. `backend/src/app.ts`
Update CORS allowed origin to include `https://themagicscreen.com`.

---

## Environments

| Environment | Frontend URL | API URL |
|---|---|---|
| Development | `http://localhost:3000` | `http://localhost:4000` |
| Production | `https://themagicscreen.com` | `https://api.themagicscreen.com` |

---

## Out of Scope
- CI/CD pipeline automation (Vercel and Railway auto-deploy from `main` branch — no additional config needed)
- SSL certificates (auto-managed by Vercel and Railway)
- GitHub branch protection rules (to be configured separately)