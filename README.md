# PT Study ⚡

The most polished study tool ever built for Mayo Clinic DPT students. Upload a lecture, and Flex (the AI mascot, powered by Claude) generates a study guide, 15 flashcards, and a 10-question clinical-reasoning quiz. Then challenge classmates in real time, climb the leaderboard, and keep a streak alive.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion · Supabase (Postgres + Auth + Storage + Realtime) · Anthropic Claude API · Stripe

---

## Features

- 🤖 **AI study kit** — Claude (`claude-sonnet-4-6`) turns any PDF/PPTX/DOCX lecture into a markdown study guide, flashcards, and a quiz
- 🃏 **3D flashcards** — true CSS `preserve-3d` flip with spring physics, known/review queue
- 🧠 **Quizzes** — answer bloom/shake feedback, explanations, XP per correct answer
- ⚔️ **Real-time challenges** — head-to-head timed quizzes with live opponent progress (Supabase Realtime), circular countdown timer
- 💬 **AI tutor chat** — streaming Claude responses with Flex as the persona, per-lecture context
- 👥 **Friends & DMs** — friend requests, online presence, real-time messaging with typing indicators and read receipts
- 🏆 **Gamification** — XP, levels, streaks, 8 badges, class leaderboard
- 💳 **Stripe** — $25/month subscription with webhook-driven access gating
- 🎨 **Design** — dark glassmorphism, 3D tilt cards, particle backgrounds, page transitions, shimmer skeletons, fully responsive from 375px

---

## Local setup

### 1. Clone & install

```bash
git clone <repo-url> pt-study
cd pt-study
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → New project
2. In the SQL editor, run the migrations **in order**:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_guide_reads.sql`
3. Enable **Google OAuth** (optional): Authentication → Providers → Google, add your Google OAuth client ID/secret, and add `http://localhost:3000/auth/callback` style redirect URLs.
4. The migration creates the `lecture-files` storage bucket, RLS policies, Realtime publication, and seeds the 8 badges automatically.

### 3. Create a Stripe product

1. [dashboard.stripe.com](https://dashboard.stripe.com) → Products → Add product
2. Name: *PT Study Membership*, recurring **$25/month** → copy the **Price ID** (`price_...`)
3. Developers → API keys → copy the **secret key** and **publishable key**
4. For local webhooks: `stripe listen --forward-to localhost:3000/api/webhooks/stripe` → copy the `whsec_...` signing secret

### 4. Get an Anthropic API key

[console.anthropic.com](https://console.anthropic.com) → API keys → create one.

### 5. Environment variables

```bash
cp .env.local.example .env.local
```

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API (**server-only — never expose**) |
| `ANTHROPIC_API_KEY` | Anthropic console |
| `STRIPE_SECRET_KEY` | Stripe → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | `stripe listen` output (local) or webhook endpoint settings (prod) |
| `STRIPE_PRICE_ID` | Stripe product price (`price_...`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe → Developers → API keys |
| `ADMIN_EMAIL` | Your email (informational) |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` locally, live URL in prod |

### 6. Run

```bash
npm run dev
```

### 7. Make yourself admin

Sign up once, then in the Supabase SQL editor:

```sql
update profiles set role = 'admin', subscription_status = 'active'
where email = 'you@example.com';
```

Admins bypass the paywall and get the `/admin` section (upload lectures, manage content/exams/users).

---

## Deployment (Vercel)

1. Push the repo to GitHub
2. [vercel.com](https://vercel.com) → **Import** the repo — framework auto-detects as Next.js
3. Add **all** environment variables from `.env.local.example` in Project → Settings → Environment Variables
4. Deploy — live in ~2 minutes
5. Set `NEXT_PUBLIC_APP_URL` to the live URL (e.g. `https://ptstudy.vercel.app`) and **redeploy**
6. **Stripe webhook:** Dashboard → Developers → Webhooks → Add endpoint → `https://<your-domain>/api/webhooks/stripe`, subscribe to `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed` → copy the new signing secret into `STRIPE_WEBHOOK_SECRET` and redeploy
7. **Supabase URLs:** Authentication → URL Configuration → set Site URL to the live domain and add `https://<your-domain>/auth/callback` to redirect URLs

---

## Architecture notes

- **Security:** RLS on every table; the Stripe/Claude/service-role keys only ever run in API routes; admin role is always verified from the database; quizzes and challenges are graded server-side so XP can't be spoofed.
- **Realtime:** `direct_messages`, `challenges`, `friendships`, and `profiles` are in the Realtime publication. Presence = `last_seen` heartbeat (online if seen within 2 minutes). Typing indicators and live challenge progress use Realtime broadcast channels.
- **AI generation:** `POST /api/generate/[contentId]` streams from Claude server-side and writes the guide/flashcards/quiz, replacing prior generations. Quiz/flashcard JSON is parsed defensively.
- **XP rules** live in `lib/xp.ts`; badge logic in `lib/badges.ts`; daily streaks in `lib/streak.ts`.

## Project structure

```
app/            routes (public, (auth), (student), (admin), api/)
components/     mascot/ ui/ layout/ student/ chat/ admin/
lib/            supabase clients, anthropic, stripe, xp, badges, streak, use3DTilt
supabase/       SQL migrations (schema, RLS, seeds, realtime)
types/          shared TypeScript types
```
