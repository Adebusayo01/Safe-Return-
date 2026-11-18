import "server-only";

import { buildSampleDashboard, type SampleScenario } from "./sample-data";
import type { DashboardData } from "./types";

/**
 * Loads everything the dashboard shows.
 *
 * NOT CONNECTED TO A DATABASE YET: returns sample data (dataSource: "sample").
 * When Neon is connected, this function will load the signed-in user's real
 * journeys and contacts and return dataSource: "database". The dashboard
 * screen will not need to change.
 */
export async function getDashboardData(options: { now: Date; sampleScenario?: SampleScenario }): Promise<DashboardData> {
  return buildSampleDashboard(options.now, options.sampleScenario);
}
