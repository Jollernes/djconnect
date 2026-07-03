# DJConnect

DJConnect is a Danish B2B managed-agency booking platform for corporate events.
It is not an open marketplace. The product is built around a guided flow:

1. The customer submits a brief.
2. The platform recommends a package.
3. The platform returns a curated shortlist of up to three DJs.
4. The customer reserves the solution with contract, technical coordination, and backup handled by the platform.

The UI is intentionally demo-friendly and premium in tone, with Danish copy throughout the app.

## Tech stack

- React 19 + TypeScript
- Vite
- React Router
- Tailwind CSS + shadcn/ui
- react-hook-form + zod
- localStorage-backed demo store
- Framer Motion for subtle transitions
- lucide-react for icons
- sonner for toast notifications

## Demo mode

DJConnect runs fully in demo mode without any backend.
Seed data is stored in localStorage, so the app is clickable offline and does not require Supabase.

- Open `/login` to switch between demo roles:
  - client
  - dj
  - admin
- Use `resetDemoData()` from `src/lib/store.ts` to restore the seeded demo state.

If Supabase environment variables are present, the app can still be configured for a future backend, but the current product does not depend on it.

## Local development

```bash
pnpm install
pnpm dev
pnpm build
pnpm lint
```

## Route map

### Public pages

- `/` — marketing home page
- `/pakker`
- `/saadan-fungerer-det`
- `/tryghed-og-kvalitet`
- `/faq`
- `/kontakt`
- `/handelsbetingelser`
- `/privatlivspolitik`
- `/bliv-dj-partner`
- `/dj-til-firmafest`
- `/dj-til-julefrokost`
- `/dj-til-sommerfest`
- `/dj-til-firmaarrangement`
- `/dj-til-middag-og-fest`
- `/mobildiskotek-firmafest`
- `/login`

### Booking flow

- `/brief`
- `/proposal/:id`
- `/reserve/:proposalId`
- `/reservation/:bookingId/kvittering`

### Role dashboards

- `/client`
- `/client/event/:bookingId`
- `/dj`
- `/admin`
- `/admin/leads`
- `/admin/leads/:id`
- `/admin/bookings`
- `/admin/bookings/:id`
- `/admin/djs`
- `/admin/djs/:id`
- `/admin/pakker`
- `/admin/anmeldelser`
- `/admin/indhold`

## Project layout

```text
src/
  App.tsx
  components/
    common/    shared utility and display components
    layout/    public and dashboard shells
    marketing/ reusable public marketing components
    ui/        shadcn/ui primitives
  data/       seeded demo data and availability helpers
  hooks/      app hooks and auth helpers
  lib/        store, matching, SEO, constants, utilities
  pages/
    admin/    admin/operations console pages
    client/   client portal pages
    dj/       DJ dashboard pages
    flow/     brief/proposal/reserve/success flow pages
    public/   home, static pages, use-case pages, partner application
  types/      domain types and booking status metadata
supabase/
  migrations/ SQL migrations mirroring the domain model
  seed.sql    seed data that mirrors src/data/seed.ts
```

## Supabase note

The optional `supabase/` folder contains SQL migrations and seed data that mirror the TypeScript domain model.
They are included for future parity with a real backend, but the app itself does not require Supabase to run.

## License

Proprietary — all rights reserved.
