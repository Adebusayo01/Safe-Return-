import "server-only";

/**
 * Server-side environment configuration.
 *
 * All reads of `process.env` for server code go through this file so that:
 *  - every variable the app depends on is listed in one place, and
 *  - a mis-configured value fails loudly with a clear message instead of
 *    causing confusing errors later.
 *
 * The `server-only` import above makes the build fail if this file is ever
 * imported into code that runs in the browser, so secrets cannot leak there.
 */

export type DeploymentEnvironment = "development" | "preview" | "production" | "test";

export interface ServerEnv {
  /** Where the app is running. On Vercel this comes from VERCEL_ENV. */
  deploymentEnvironment: DeploymentEnvironment;
  /** Neon pooled connection string, or null when not configured yet. */
  databaseUrl: string | null;
}

export class EnvConfigError extends Error {
  constructor(message: string) {
    super(`[env] ${message}`);
    this.name = "EnvConfigError";
  }
}

function readOptional(name: string): string | null {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

export function resolveDeploymentEnvironment(): DeploymentEnvironment {
  const vercelEnv = process.env.VERCEL_ENV;
  if (vercelEnv === "production" || vercelEnv === "preview" || vercelEnv === "development") {
    return vercelEnv;
  }
  if (process.env.NODE_ENV === "test") return "test";
  if (process.env.NODE_ENV === "production") return "production";
  return "development";
}

function parseDatabaseUrl(raw: string | null): string | null {
  if (raw === null) return null;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    // Never echo the value: it contains a password.
    throw new EnvConfigError("DATABASE_URL is not a valid URL.");
  }
  if (url.protocol !== "postgres:" && url.protocol !== "postgresql:") {
    throw new EnvConfigError("DATABASE_URL must start with postgresql:// or postgres://.");
  }
  return raw;
}

function parseAppBaseUrl(raw: string | null, env: DeploymentEnvironment): string {
  if (raw === null) {
    // On Vercel, fall back to the deployment's own URL so previews work without setup.
    const vercelUrl = readOptional("VERCEL_URL");
    if (vercelUrl) return `https://${vercelUrl}`;
    if (env === "development" || env === "test") return "http://localhost:3000";
    throw new EnvConfigError("APP_BASE_URL is required outside development.");
  }
  try {
    const url = new URL(raw);
    return url.origin;
  } catch {
    throw new EnvConfigError("APP_BASE_URL is not a valid URL.");
  }
}

let cached: ServerEnv | null = null;

/**
 * Returns validated server configuration. Validation runs once per process.
 * Throws EnvConfigError if a variable is set but malformed.
 */
export function getServerEnv(): ServerEnv {
  if (cached) return cached;
  cached = {
    deploymentEnvironment: resolveDeploymentEnvironment(),
    databaseUrl: parseDatabaseUrl(readOptional("DATABASE_URL")),
  };
  return cached;
}

/**
 * Public base URL of the app, without a trailing slash.
 * Read separately (and only when needed) so that a missing value does not
 * break unrelated code such as the health check. First used in P3/P6 to
 * build invite and share links.
 */
export function getAppBaseUrl(): string {
  return parseAppBaseUrl(readOptional("APP_BASE_URL"), resolveDeploymentEnvironment());
}
