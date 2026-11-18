# server

Shared server-only infrastructure (never imported by browser code).

- `env.ts`: reads and validates environment variables. Add new variables here
  **and** to `.env.example`.
- `db/client.ts`: Neon PostgreSQL connection and the health check. The schema and
  migrations arrive in P1.
