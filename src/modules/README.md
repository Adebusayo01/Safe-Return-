# Feature modules

Each folder holds one area of the product. Business rules live here, not in
`src/app`: route files in `src/app` should stay thin and call into a module.

| Module | Built in | Responsibility |
|---|---|---|
| `auth/` | P2 | Phone + one-time-code login, sessions, rate limits, sign-up consent |
| `contacts/` | P3 | Trusted contacts, invite links, Accept/Decline, STOP/START/DELETE, reachability |
| `journeys/` | P4–P5 | Journey state machine, deadlines, check-ins (including offline), extend/cancel/help |
| `notifications/` | P1 | Notification records, delivery states, message channels (fake, WhatsApp) |
| `admin/` | P8 | Operations screens: dead jobs, unknown deliveries, scheduler lag |

More modules arrive with their phases: `jobs/` (P1 queue runner), `location/` (P6)
and `privacy/` (P7 export and deletion).

Conventions:
- Code inside a module may import from `src/server` (database, env) and from
  other modules' public `index.ts` only, never from their internal files.
- Server-only files start with `import "server-only";`.
