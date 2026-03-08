# REIOGN — Deploy Guide

## Pre-Deploy Checklist (do these ONCE)

### 1. Razorpay — Create 3 Subscription Plans
Go to: https://dashboard.razorpay.com → Subscriptions → Plans → Create Plan
- Starter: 149900 paise (₹1,499) monthly
- Pro:     399900 paise (₹3,999) monthly  
- Elite:   799900 paise (₹7,999) monthly

Paste the plan_XXXXXXXX IDs into .env.local:
  RAZORPAY_PLAN_STARTER=plan_XXX
  RAZORPAY_PLAN_PRO=plan_XXX
  RAZORPAY_PLAN_ELITE=plan_XXX

### 2. Razorpay — Webhook Secret
Dashboard → Settings → Webhooks → Add Webhook
- URL: https://yourdomain.com/api/webhooks/razorpay
- Events: subscription.activated, subscription.charged, payment.failed, subscription.cancelled
- Paste the SECRET STRING (not the URL) into:
  RAZORPAY_WEBHOOK_SECRET=your_secret_here

### 3. OAuth Redirect URIs to Add
Google  → https://console.cloud.google.com → Credentials → OAuth Client
  Add: http://localhost:3000/api/auth/oauth/google

GitHub  → https://github.com/settings/developers → Your App
  Add: http://localhost:3000/api/auth/oauth/github

Discord → https://discord.com/developers/applications → OAuth2
  Add: http://localhost:3000/api/auth/oauth/discord

---

## Deploy Commands

# 1. Copy env file
cp .env.local .env

# 2. Start Docker stack (Postgres + Redis + Next.js)
docker compose up -d

# 3. Run DB migrations (first time only)
docker compose exec app npx prisma migrate deploy

# 4. Open http://localhost:3000

## After Code Changes
docker compose down && docker compose up -d --build

## DB Utilities
docker compose exec app npx prisma studio        # visual DB browser
docker compose exec app npx prisma migrate reset  # wipe & reset (careful!)
