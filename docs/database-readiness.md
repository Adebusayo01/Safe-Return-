# Database readiness: what works before Neon, and what doesn't

Neon PostgreSQL setup is **postponed**. This page is the honest status of the
project until it is connected. No other database or storage is used in its place.

## What works without a database

| Capability | Status | Where |
|---|---|---|
| App builds and deploys | ✅ | Next.js / Vercel |
| `GET /api/health` | ✅ Reports `"database": "not_configured"` | `src/app/api/health/route.ts` |
| Message channel interface | ✅ | `src/modules/notifications/channels/channel.ts` |
| Fake messaging provider (with simulated failures) | ✅ Prints to the terminal or records in test memory only | `channels/fake-channel.ts` |
| WhatsApp Cloud API adapter | ✅ Tested against recorded responses; **not** connected to a live account | `channels/whatsapp/cloud-channel.ts` |
| WhatsApp error classification | ✅ | `channels/whatsapp/errors.ts` |
| Webhook signature and setup checks | ✅ Functions only; no webhook route yet | `channels/whatsapp/webhook-security.ts` |
| Webhook payload parsing | ✅ | `channels/whatsapp/webhook-parser.ts` |
| Template catalogue and validation | ✅ | `templates.ts` |
| Delivery state rules (out-of-order reports, unknown outcomes) | ✅ Rules only | `delivery-status.ts` |
| Retry/backoff decisions | ✅ Rules only | `retry-policy.ts` |
| Production guard against the fake channel | ✅ | `src/server/env.ts` |
| Automated tests (118) | ✅ Run in CI | `*.test.ts` |

## What is NOT functional until Neon is connected

None of the following exists yet, and none of it can be made reliable without
persistent storage. Nothing in the app should be described as having these features:

- **User accounts and login**: users, sessions and login codes must be stored.
- **Trusted contacts and consent records**
- **Journeys and journey scheduling**: deadlines must survive restarts.
- **Reliable notifications**: the notification records, dedupe keys, the `jobs`
  queue, leases, retries and recovery after missed scheduler runs all depend on
  the database. Today the code can *decide* what to do after a failure, but
  nothing remembers that decision.
- **Duplicate-alert prevention**: enforced by unique keys in the database.
- **WhatsApp webhook endpoint**: events must be stored and deduplicated before
  they are processed.
- **The `/dev/inbox` page**: it shows stored messages.
- **The scheduler endpoint (`/api/jobs/tick`)**
- **Location sharing, data export and deletion**

The fake channel's in-memory sink (`MemoryFakeSink`) exists **only for automated
tests**. It is never used as storage by the application.

## How Neon will be connected without rewriting the app

The code is split so that storage is added in one layer:

```
 src/modules/*        Decisions and rules (pure TypeScript, no storage)
   │                  e.g. "apply this delivery report", "retry in 2 minutes?"
   ▼
 src/server/db/       Storage layer (added when Neon is connected)
   │                  schema, migrations, and functions such as
   │                  createNotification(), claimDueJobs(), recordStatus()
   ▼
 Neon PostgreSQL
```

- The rules in `src/modules` take plain values and return decisions. They don't
  import the database, so they won't change when it arrives.
- `src/server/db/client.ts` already connects to Neon lazily from `DATABASE_URL`
  and has a health check. The schema, migrations (Drizzle ORM, as planned) and
  storage functions will be added next to it.
- Configuration is read only through `src/server/env.ts`.

## Steps once you're ready for Neon

1. Create the Neon project and the `dev` branch (see the README).
2. Add `DATABASE_URL` to Codespaces and Vercel.
3. Confirm `/api/health` reports `"database": "ok"`.
4. Then I'll build the rest of P1: schema and migrations, the `jobs` queue,
   notification storage, the webhook route and the dev inbox.
