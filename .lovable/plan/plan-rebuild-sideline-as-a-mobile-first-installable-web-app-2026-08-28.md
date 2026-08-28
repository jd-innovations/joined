# Plan: Rebuild Sideline as a Mobile-First Installable Web App

## Goal

Port the GitHub repo `jd-innovations/team-joined` (an Expo React Native app codenamed **Sideline**) into a Lovable-hosted, TanStack Start web app that feels like a native phone app and can be installed from the browser. We start with the **Home / Team Dashboard**, then expand to the full 5-tab experience.

## Current state

- The Lovable project is a fresh TanStack Start + Tailwind v4 web template.
- The GitHub repo is a completed Expo React Native frontend with mock data and extensive product docs (`memory/PRD.md`, `PRODUCT_ARCHITECTURE.md`, `NAVIGATION_USER_FLOWS.md`).
- No backend or auth exists yet; the repo planned FastAPI + MongoDB.
- Lovable Cloud is not enabled, so there is no database, auth, or server-side push support yet.

## Rebuild strategy

Translate the native mobile UX to a responsive web app:

- Keep the **5-tab bottom navigation** (Home, Groups, Schedule, Marketplace, Me/Wallet).
- Preserve the **emerald/glass design system** from `design_guidelines.json` and apply it through Tailwind v4 semantic tokens.
- Use **local mock data** initially, matching the repo's `frontend/src/data/mock.ts` structure.
- Add a **web app manifest and service worker** so the app installs to the home screen.
- Wire up **Lovable Cloud** later for auth, database, and push notifications.

## Phases

### Phase 0 — Foundation

1. Enable Lovable Cloud (database, auth, storage, secrets).
2. Replace the placeholder `src/routes/index.tsx` and update `src/routes/__root.tsx` with app-specific metadata and the theme provider.
3. Port the design tokens from `design_guidelines.json` into `src/styles.css` (`:root`/`.dark` semantic colors, Plus Jakarta Sans font, radius, spacing).
4. Add the web app manifest (`public/manifest.webmanifest`) and PWA icons.
5. Create a mobile-first shell: bottom tab bar, safe-area padding, fixed header, and a max-width container that centers on large screens.
6. Set up a local mock-data module that mirrors the repo's data model (groups, events, members, listings, wallet items).

**Deliverable:** A themed, installable shell with a Home route ready to be populated.

### Phase 1 — Team Dashboard (Home)

Rebuild the repo's Home screen as the first real route:

- Sticky header with greeting, avatar, and Messages / Alerts icons.
- Glass-style weather widget for the user's location, with a link to a detailed weather view.
- "Live Activities" strip when an event is happening now or starting soon.
- Featured "Next Up" event card with one-tap RSVP and Check-In affordance when in window.
- "Needs You" action feed (RSVP nudges, polls, volunteer slots).
- "Your Teams" horizontal quick-switch row.
- Empty, loading, and error states matching the design guidelines.

**Deliverable:** A working, polished Home dashboard with mock data and mobile-first interactions.

### Phase 2 — Groups & Schedule

Add the team coordination surfaces:

- `/groups` list, join-by-code input, and create-group flow.
- `/groups/[id]` group hub with feature tiles (Chat, Schedule, Members, Polls, Volunteers, Media).
- Group detail routes for chat, members, polls, and volunteers.
- `/schedule` unified calendar with date strip and filter chips.
- `/schedule/[id]` event detail with RSVP segmented control, venue + directions, weather, live status, and volunteer slots.

**Deliverable:** Core team organization flows are navigable and interactive with mock data.

### Phase 3 — Marketplace & Me/Wallet

Add the commerce and personal surfaces:

- `/marketplace` browse grid, search, category chips, listing detail, and create-listing flow.
- `/me` profile, wallet carousel (coupons/rewards/referrals), notification preferences, appearance toggle (System / Light / Dark), and settings.

**Deliverable:** All five primary tabs are functional in the web app.

### Phase 4 — Cloud wiring & push notifications

1. Replace mock data with Lovable Cloud-backed tables (groups, memberships, events, rsvps, listings, wallet items, etc.).
2. Add auth and join-by-code logic.
3. Implement server functions for event creation, RSVP, check-in, and marketplace listings.
4. Add web push notifications for event reminders, live updates, and RSVP nudges.

**Deliverable:** A full-stack, installable web app with persistent data and notifications.

## Technical notes

- **Routing:** TanStack Start file-based routes under `src/routes/`. The 5 tabs will use a shared layout route, e.g. `src/routes/_tabs.tsx`.
- **State:** React Query + server functions for async data; local state for wizard/draft flows.
- **PWA:** Manifest-only installability in Phase 0; offline caching via `vite-plugin-pwa` only if explicitly requested later.
- **Push:** Web Push requires Lovable Cloud and user subscription; it will be a later phase.
- **Design:** Strictly use the emerald semantic palette from the repo. No hardcoded colors, no emojis, Phosphor-style icons via `lucide-react`.

## Open decisions

1. Should Phase 1 Home use the exact mock groups/events from the repo, or do you want sample data for a specific sport/team?
2. For push notifications in Phase 4, which events should trigger a push? (event reminders, live score updates, RSVP nudges, chat messages)
3. Do you want offline support (cached app shell) now, or only install-to-home-screen?

## First milestone

Enable Lovable Cloud and ship a themed, installable shell with the Home / Team Dashboard populated from mock data.
