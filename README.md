# SafeReturn

A mobile (PWA) and WhatsApp-based platform for journey monitoring, automated safety
check-ins and trusted-contact alerts. Initial launch area: Lagos, Nigeria.

> **Status: P0 complete; P1 partly built (no database yet).** The messaging layer
> (channel interface, fake provider, WhatsApp adapter, webhook parsing) is built and
> tested, but **no product feature works yet**. Accounts, journeys, scheduling and
> reliable notifications all need the Neon database, which is postponed. See
> [`docs/database-readiness.md`](docs/database-readiness.md) for exactly what works
> and what doesn't, and [`docs/engineering-plan.md`](docs/engineering-plan.md) for
> the roadmap.

## Tech stack

| Layer | Technology |
|---|---|
| App (UI + API) | [Next.js](https://nextjs.org) 16 (App Router) + TypeScript |
| Database | [Neon](https://neon.com) PostgreSQL (`@neondatabase/serverless` driver) |
| Hosting | [Vercel](https://vercel.com) |
| Messaging (from P1) | WhatsApp Business Cloud API |
| Source control and CI | GitHub + GitHub Actions |
| Development environment | GitHub Codespaces |

## Quick start

### Option A: GitHub Codespaces (recommended)

1. On GitHub, open the repository → **Code** → **Codespaces** → **Create codespace**.
2. Wait for the container to build. It installs Node.js 22 and runs `npm ci` for you.
3. In the terminal, run `npm run dev`.
4. Codespaces shows a pop-up for port **3000**. Click **Open in Browser**.

### Option B: your own computer

Requirements: Node.js 22 (see `.nvmrc`) and npm.

```bash
npm ci                       # install the exact versions in package-lock.json
cp .env.example .env.local   # create your local, git-ignored settings file
npm run dev                  # start at http://localhost:3000
```

### Check that it works

Open `http://localhost:3000/api/health`. You should see something like:

```json
{ "status": "ok", "service": "safereturn", "environment": "development", "database": "not_configured" }
```

`database` reads `not_configured` until you set `DATABASE_URL`, `ok` once Neon is
reachable, and `error` if the URL is wrong or Neon cannot be reached (the endpoint
then returns HTTP 503). Error details only appear in the server terminal, never in
the response.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Starts the development server with hot reload |
| `npm run lint` | Runs ESLint (code-quality rules). Fails on any warning |
| `npm run typecheck` | Generates Next.js route types, then runs the TypeScript compiler without emitting files |
| `npm test` | Runs the automated tests once (Vitest) |
| `npm run test:watch` | Re-runs tests as you edit |
| `npm run check` | Runs `lint`, `typecheck` and `test`. Run this before every commit |
| `npm run build` | Creates a production build, the same thing Vercel does |
| `npm run start` | Serves the production build locally (run `build` first) |

GitHub Actions runs `lint`, `typecheck`, `test` and `build` on every push and pull request
(`.github/workflows/ci.yml`).

## Environment variables

- **`.env.example`** lists every variable by name, with comments. It's committed
  and must never contain real values.
- **`.env.local`** holds your real local values. It's git-ignored.
- **Codespaces:** add secrets under GitHub → *Settings* → *Codespaces* → *Secrets*
  and give the repository access to them. They appear as environment variables,
  so no `.env.local` is needed.
- **Vercel:** add them under *Project* → *Settings* → *Environment Variables*,
  separately for Production, Preview and Development.

All server code reads configuration through `src/server/env.ts`, which validates it.

| Variable | Needed from | Notes |
|---|---|---|
| `DATABASE_URL` | P0 (optional) | Neon **pooled** connection string |
| `APP_BASE_URL` | P3 | Public URL of the app. On Vercel it falls back to the deployment URL |
| `MESSAGE_CHANNEL` | P1 | `fake` (default outside production) or `whatsapp`. Production refuses `fake` |
| Others | Later phases | Listed, commented out, in `.env.example` |

## Project structure

```
.devcontainer/          Codespaces configuration (Node 22, ESLint extension, port 3000)
.github/workflows/      CI: lint, type-check, tests, build
docs/                   Engineering plan and design notes
public/                 Static files served as-is (icons, PWA manifest later)
test/stubs/             Test-only stand-ins (e.g. for the `server-only` marker)
src/
  app/                  Next.js App Router: pages and API routes only (keep these thin)
    (app)/              App screens inside the shared navigation (dashboard at /)
    (app)/design-system Living reference of tokens and components (/design-system)
    api/health/         GET /api/health: liveness and database check
  components/
    ui/                 Design-system components: Button, TextField, Card, Badge, Avatar, Icon…
    layout/             App shell, navigation, sample-data notice
    brand/              Logo (the mark is a TEMPORARY placeholder until a concept is approved)
    dashboard/          Dashboard sections
  styles/tokens.css     Design tokens: every colour, font size, space and radius
  modules/              Product features, one folder per area
    auth/               P2: phone login, sessions
    contacts/           P3: trusted contacts, consent, STOP handling
    dashboard/          Dashboard data loading (sample data until Neon is connected)
    journeys/           P4–P5: journey state machine, check-ins
    notifications/      P1: message channels (fake, WhatsApp), templates, delivery rules
    admin/              P8: operations screens
  lib/                  Small shared helpers (e.g. the Clock used by tests)
  server/               Shared server-only code
    env.ts              Validated environment configuration
    db/client.ts        Neon connection and health check
```

## Deployment (Vercel)

The app deploys to Vercel as-is, with no `vercel.json` needed yet. Vercel detects
Next.js, runs `npm run build`, and uses Node.js 22 from `package.json` → `engines`.

- Every push to a branch creates a **Preview** deployment, and merging to `main`
  creates a **Production** deployment.
- The Hobby (free) plan is enough until P4. The every-minute scheduler needs the
  **Pro** plan, because Hobby cron jobs run at most once a day.

## Security notes

- Never commit secrets. `.gitignore` blocks every `.env*` file except `.env.example`.
- Files that use secrets start with `import "server-only";`, which makes the build
  fail if they are ever imported into browser code.
- Baseline security headers are set in `next.config.ts`.

## Notes for AI coding agents

`AGENTS.md` is written by Next.js. It tells coding agents to read the version-matched
docs in `node_modules/next/dist/docs/`, because Next.js 16 differs from older versions.
