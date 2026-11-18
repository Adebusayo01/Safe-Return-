# SafeReturn Engineering Plan (approved v3, summary)

This is the reference summary of the approved plan. Each phase adds its own
detailed design notes to `docs/` as it is built.

## Non-negotiable constraints

- Stack: Next.js + TypeScript, Neon PostgreSQL, GitHub, Codespaces, Vercel,
  WhatsApp Business Cloud API. No Supabase. Any new service needs approval first.
- First version is a responsive **PWA**. No native app.
- WhatsApp delivery is never assumed. Every message's delivery is tracked.
- A user's location is never exposed without explicit consent for that journey.
- Never send duplicate alerts for the same journey.
- A missed check-in is never treated or described as proof of danger.
- Must stay achievable for a solo developer.

## Architecture

- **Next.js on Vercel** holds the UI pages, API routes, the WhatsApp webhook and
  the scheduler endpoint (`/api/jobs/tick`).
- **Core logic** is plain TypeScript in `src/modules`: the journey state machine,
  notification policy, consent rules and the deletion planner.
- **Adapters** can be swapped per environment:
  - `MessageChannel`: Fake (dev inbox), WhatsApp test, WhatsApp prod. SMS later.
  - `OtpDelivery`: DevInbox, TestCapture, WhatsApp template.
  - `Clock`: System, Fake (for tests).
  - A startup guard refuses fake adapters in production.
- **Neon PostgreSQL** stores all data plus the persistent `jobs` queue and
  `notifications` table. Branches: `main` (prod), `dev`, and one per preview.
- **Scheduler triggers** all call the same secured tick endpoint:
  - Vercel Cron every minute (production, needs Vercel Pro from P4)
  - GitHub Actions every ~10 minutes as a backup
  - A dev loop script
  - An admin "run now" button

## Two state machines (kept separate)

**Journey states.** Open: `ACTIVE`, `CHECKIN_DUE`, `FINAL_WARNING`, `ALERTED`,
`HELP_REQUESTED`. Closed: `SAFE`, `SAFE_LATE`, `CANCELLED`, `EXPIRED`.

| Transition | From → To |
|---|---|
| T1 start | — → ACTIVE |
| T2 ETA reached | ACTIVE → CHECKIN_DUE (reminder) |
| T3 final-warning time | CHECKIN_DUE → FINAL_WARNING (final warning) |
| T4 alert_at | FINAL_WARNING → ALERTED (one alert per contact) |
| T5 extend (max 3) | ACTIVE / CHECKIN_DUE / FINAL_WARNING → ACTIVE |
| T6 cancel | ACTIVE / CHECKIN_DUE / FINAL_WARNING → CANCELLED (blocked once contacts are notified) |
| T7 "I'm safe" | ACTIVE / CHECKIN_DUE / FINAL_WARNING → SAFE |
| T8 help (once per journey) | ACTIVE / CHECKIN_DUE / FINAL_WARNING / ALERTED → HELP_REQUESTED |
| T9 late "I'm safe" | ALERTED / HELP_REQUESTED → SAFE_LATE (all-clear) |
| T10 12 h without check-in | ALERTED / HELP_REQUESTED → EXPIRED |

- Every transition is a conditional update, so the first trigger wins a race.
- A contact's "I've reached them" is **information only**. It never changes the
  journey state.

**Notification delivery states:** `pending → sending → sent → delivered → read`, or
`failed` / `cancelled` / `unknown`. A delivery outcome never changes a journey's state.

**Job states:** `pending → running → succeeded`, or `failed_retrying → … → dead`.

## Queue and scheduler rules

- Due journeys are found with `next_action_at <= now()` and claimed with
  `FOR UPDATE SKIP LOCKED`. Missed ticks catch up automatically.
- A state transition and its notifications and jobs are written in one transaction
  (the outbox pattern).
- Duplicates are prevented with unique `dedupe_key`s on notifications and jobs,
  unique webhook event IDs and unique check-in `client_request_id`s.
- Leases with expiry, retries with backoff (max 6), a `stale_after` per message
  type, and a `dead` state with an admin alert.
- If a crash leaves a send outcome unknown, it is reconciled through Meta's
  `biz_opaque_callback_data`.
- Catch-up policy after an outage: if the user never received a reminder, send a
  final warning first and alert contacts 5 minutes later.

## Platform limits to respect

- **Vercel Hobby** cron runs at most once a day, at any point within the hour. **Pro**
  allows every minute. Vercel is moving Cron Jobs to "Vercel Schedules": confirm the
  current limits in the dashboard before P4.
- **PWA location** only updates while the app is open in the foreground. There is no
  background location on Android or iOS. Never promise continuous tracking.
- **Offline check-ins** stay *pending* on the device until the server confirms them.
  The server uses its own receive time for decisions.

## Phases

| Phase | Scope | Est. (full-time) |
|---|---|---|
| P0 | Foundations: repo, Codespaces, CI, Neon/Vercel readiness | 1 wk |
| P1 | Schema, jobs queue, notifications, fake channel + dev inbox, webhook | 2 wks |
| P2 | Authentication (pluggable OTP delivery) | 1 wk |
| P3 | Trusted contacts and consent | 1.5 wks |
| P4 | Journey engine and scheduler (Vercel Pro, submit templates) | 2 wks |
| P5 | Replies, check-ins, offline pending queue | 1.5 wks |
| P6 | Location sharing (consent, share links, purge) | 1 wk |
| P7 | PWA polish, data export and deletion | 1.5 wks |
| P8 | Hardening; switch to production WhatsApp | 1.5 wks |
| P9 | Closed pilot in Lagos | 3–4 wks |

Business registration and Meta onboarding (Track B) run in parallel. Only P8/P9
depend on them.
