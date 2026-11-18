import { connection } from "next/server";

import { checkDatabase } from "@/server/db/client";
import { resolveDeploymentEnvironment } from "@/server/env";

/**
 * GET /api/health
 *
 * A simple "is the app alive?" endpoint. Use it to confirm that a deployment
 * works and can reach Neon. It reveals no secrets or error details.
 * In P8 it will also report scheduler health for the uptime monitor.
 */
export async function GET() {
  // Always run at request time, never prerendered at build time.
  await connection();

  const database = await checkDatabase();
  const healthy = database !== "error";

  return Response.json(
    {
      status: healthy ? "ok" : "degraded",
      service: "safereturn",
      environment: resolveDeploymentEnvironment(),
      database,
      time: new Date().toISOString(),
    },
    {
      status: healthy ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
