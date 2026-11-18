import "server-only";

import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

import { getServerEnv } from "@/server/env";

/**
 * Neon PostgreSQL connection.
 *
 * P0 only prepares the connection; there are no tables yet. The schema,
 * migrations and query layer arrive in P1.
 *
 * `neon()` sends each query over HTTPS, which suits Vercel's short-lived
 * serverless functions. The queue code in P1 needs multi-statement
 * transactions with row locks, which will use the driver's WebSocket `Pool`.
 */

export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super("DATABASE_URL is not set. See .env.example.");
    this.name = "DatabaseNotConfiguredError";
  }
}

let sql: NeonQueryFunction<false, false> | null = null;

/** Returns the shared SQL query function, creating it on first use. */
export function getSql(): NeonQueryFunction<false, false> {
  const { databaseUrl } = getServerEnv();
  if (!databaseUrl) throw new DatabaseNotConfiguredError();
  sql ??= neon(databaseUrl);
  return sql;
}

export type DatabaseStatus = "ok" | "not_configured" | "error";

const HEALTH_CHECK_TIMEOUT_MS = 5_000;

/**
 * Runs `SELECT 1` to confirm the database is reachable.
 * Errors are logged on the server but never returned to the caller,
 * because they can contain connection details.
 */
export async function checkDatabase(): Promise<DatabaseStatus> {
  try {
    if (!getServerEnv().databaseUrl) return "not_configured";
  } catch (error) {
    // Malformed DATABASE_URL: report it as an error rather than crashing.
    console.error(error instanceof Error ? error.message : "[env] invalid configuration");
    return "error";
  }
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error("Database health check timed out")), HEALTH_CHECK_TIMEOUT_MS);
    });
    await Promise.race([getSql()`SELECT 1`, timeout]);
    return "ok";
  } catch (error) {
    console.error("[db] health check failed:", error instanceof Error ? error.message : "unknown error");
    return "error";
  } finally {
    clearTimeout(timer);
  }
}
