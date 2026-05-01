# DJConnect

Two-sided marketplace for booking professional DJs with full mobile disco setups. Built with React 18 + TypeScript + Vite, Tailwind + shadcn/ui, Supabase (Postgres + Auth + Storage), Stripe Connect, and Resend.

## Features

- Customer flow: search → DJ profile → booking request → Stripe Checkout → confirmation → review.
- "Get 3 offers" wizard: 8-step interactive brief at `/get-offers`, persistent live progress page at `/my-requests/:id`, side-by-side quote comparison with on-platform messaging, callback requests, and escrow booking. Currently runs as a client-side simulation with the timeline compressed to ~3 minutes for demo purposes; thresholds and orchestration logic match the production spec (12h expansion / 36h alert / 3-of-N quotes surfaced).
- DJ flow: multi-step onboarding → admin verification → dashboard (bookings, availability, earnings, messages) → Stripe Connect payouts.
- Admin: verification queue, user management, booking overview, financials, review moderation, featured DJs.
- Email triggers wired via a single `send-email` edge function (Resend) covering every event in the spec.
- Escrow: customer pays full amount on booking; payout released 24h after event date via a scheduled edge function.
- RLS locked down on every table — customers only see their own bookings, DJs only see their own data, admins see everything.

## Local development

```bash
pnpm install
cp .env.example .env.local        # fill in values, see below
pnpm dev                          # http://localhost:5173
pnpm build                        # typecheck + production build
pnpm lint
```

If no `VITE_SUPABASE_URL` is set, the app runs in **demo mode** — all data comes from `src/data/mock.ts` and the Login page shows "Demo login" buttons for each role so you can tour every flow without a backend.

## Environment variables

See `.env.example`. Minimum set for a live deployment:

| Name | Where | Notes |
|---|---|---|
| `VITE_SUPABASE_URL` | Client + server | Supabase project URL. |
| `VITE_SUPABASE_ANON_KEY` | Client + server | Public anon key. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Used by edge functions. |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Client | `pk_test_…` / `pk_live_…`. |
| `STRIPE_SECRET_KEY` | Server only | `sk_test_…` / `sk_live_…`. |
| `STRIPE_WEBHOOK_SECRET` | Server only | From the Stripe webhook endpoint. |
| `RESEND_API_KEY` | Server only | Resend API key. |
| `RESEND_FROM_EMAIL` | Server only | Verified sender, e.g. `DJConnect <hello@yourdomain.tld>`. |
| `PLATFORM_FEE_PERCENT` | Server only | Default `10`. |
| `APP_BASE_URL` | Server only | Used for success/cancel URLs and email links. |

## First-time setup (production)

### 1. Supabase

1. Create a new Supabase project.
2. Apply the SQL in order:
   ```
   supabase/migrations/0001_init.sql
   supabase/migrations/0002_rls.sql
   supabase/migrations/0003_storage.sql
   ```
   You can paste them into the SQL editor or use `supabase db push` after linking the project.
3. Enable providers in Auth → Providers:
   - **Email** — enable "Confirm email".
   - **Google** — add OAuth client ID/secret and add `https://<your-domain>/auth/callback` to redirect URLs.
4. Create an admin: sign up via the app with `j.ssl@outlook.com` (or your chosen email), then run `supabase/seed.sql` replacing the email if needed.
5. Deploy the edge functions:
   ```
   supabase functions deploy create-checkout-session
   supabase functions deploy stripe-connect-onboard
   supabase functions deploy stripe-webhook --no-verify-jwt
   supabase functions deploy send-email
   supabase functions deploy release-payouts
   ```
6. Set function secrets:
   ```
   supabase secrets set \
     STRIPE_SECRET_KEY=sk_test_... \
     STRIPE_WEBHOOK_SECRET=whsec_... \
     RESEND_API_KEY=re_... \
     RESEND_FROM_EMAIL="DJConnect <hello@yourdomain.tld>" \
     PLATFORM_FEE_PERCENT=10
   ```
7. Schedule `release-payouts` (Dashboard → Edge Functions → Cron) to run hourly.

### 2. Stripe

1. Enable Stripe Connect (Express) in your Stripe dashboard.
2. Create a webhook endpoint pointing at `https://<project-ref>.supabase.co/functions/v1/stripe-webhook` and subscribe to:
   - `checkout.session.completed`
   - `charge.refunded`
   - `account.updated`
3. Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.

### 3. Resend

1. Verify the domain you want to send from.
2. Generate an API key and set it as `RESEND_API_KEY`.

### 4. Vercel

1. Connect the GitHub repo.
2. Framework preset: **Vite**. Build: `pnpm build`. Output: `dist`.
3. Add all `VITE_*` env vars in Vercel → Settings → Environment Variables.
4. Deploy.

## Testing (spec Section 15)

The app ships with mock data so every page renders without a backend. For end-to-end testing with real Stripe:

1. Use Stripe test mode (`sk_test_…`, card `4242 4242 4242 4242`).
2. Sign up as a DJ → complete multi-step flow → admin approves → DJ completes Stripe Connect (use Stripe's test onboarding shortcut).
3. Sign up as a customer → book the DJ → pay via Stripe Checkout → DJ accepts → after event date, run the `release-payouts` function manually to test the payout path.

## Project layout

```
src/
  components/      # layout, common, shadcn ui
  hooks/           # useAuth, useDJs, useBookings
  pages/
    public/        # homepage, search, DJ profile, booking, static pages
    auth/          # login, signup, dj signup (6 steps), reset password
    customer/      # dashboard, bookings, favourites, settings
    dj/            # dashboard, bookings, availability, earnings, profile editor, messages
    admin/         # verification, users, bookings, financials, reviews, featured
  lib/             # config, constants, supabase client, utils
  types/           # database + domain types
  data/            # demo/mock data
supabase/
  migrations/      # 0001_init, 0002_rls, 0003_storage
  functions/       # create-checkout-session, stripe-webhook, stripe-connect-onboard, send-email, release-payouts
```

## License

Proprietary — all rights reserved.
