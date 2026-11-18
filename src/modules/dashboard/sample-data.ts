import type { DashboardData } from "./types";

/**
 * SAMPLE DATA for previewing the dashboard before Neon is connected.
 *
 * - It is not stored anywhere and nothing the user does changes it.
 * - Times are calculated from "now" on each request, so the preview always
 *   looks current. This is not a running journey.
 * - Every screen that shows it also shows the SampleDataNotice.
 *
 * Delete this file once the dashboard reads from the database.
 */

export type SampleScenario = "active" | "none";

const MINUTE = 60_000;
const LAGOS_UTC_OFFSET_HOURS = 1;

/** A time `daysAgo` days before `now`, at a given Lagos clock time. */
function lagosTimeDaysAgo(now: Date, daysAgo: number, hour: number, minute: number): Date {
  const lagosNow = new Date(now.getTime() + LAGOS_UTC_OFFSET_HOURS * 60 * MINUTE);
  return new Date(
    Date.UTC(
      lagosNow.getUTCFullYear(),
      lagosNow.getUTCMonth(),
      lagosNow.getUTCDate() - daysAgo,
      hour - LAGOS_UTC_OFFSET_HOURS,
      minute,
    ),
  );
}

export function buildSampleDashboard(now: Date, scenario: SampleScenario = "active"): DashboardData {
  const t = (minutesFromNow: number) => new Date(now.getTime() + minutesFromNow * MINUTE);

  return {
    dataSource: "sample",
    user: { firstName: "Ada" },
    activeJourney:
      scenario === "active"
        ? {
            id: "sample-journey",
            destination: "Home",
            area: "Yaba, Lagos",
            startedAt: t(-23),
            expectedArrivalAt: t(42),
            gracePeriodMinutes: 15,
            status: "ACTIVE",
            contactNames: ["Tunde Bakare", "Chioma Okafor"],
            locationSharing: "on_alert",
          }
        : null,
    contacts: {
      total: 3,
      preview: [
        { id: "sample-c1", name: "Tunde Bakare", relationship: "Brother", status: "active" },
        { id: "sample-c2", name: "Chioma Okafor", relationship: "Friend", status: "active" },
        { id: "sample-c3", name: "Mrs Adeyemi", relationship: "Mother", status: "invited" },
      ],
    },
    recentJourneys: [
      { id: "sample-j1", destination: "Lekki Phase 1", outcome: "SAFE", endedAt: lagosTimeDaysAgo(now, 1, 21, 12) },
      { id: "sample-j2", destination: "Ikeja City Mall", outcome: "SAFE_LATE", endedAt: lagosTimeDaysAgo(now, 2, 19, 48) },
      { id: "sample-j3", destination: "Victoria Island", outcome: "CANCELLED", endedAt: lagosTimeDaysAgo(now, 4, 18, 5) },
    ],
  };
}
