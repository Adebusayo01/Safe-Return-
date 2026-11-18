import { describe, expect, it } from "vitest";

import { formatDayAndTime } from "@/lib/format";

import { buildSampleDashboard } from "./sample-data";

const now = new Date("2026-11-18T00:35:00Z"); // 1:35 am in Lagos

describe("sample dashboard data", () => {
  it("is always labelled as sample data", () => {
    expect(buildSampleDashboard(now).dataSource).toBe("sample");
    expect(buildSampleDashboard(now, "none").dataSource).toBe("sample");
  });

  it("places the active journey relative to now", () => {
    const journey = buildSampleDashboard(now).activeJourney!;
    expect(journey.startedAt.getTime()).toBeLessThan(now.getTime());
    expect(journey.expectedArrivalAt.getTime()).toBeGreaterThan(now.getTime());
  });

  it("can show the no-active-journey state", () => {
    expect(buildSampleDashboard(now, "none").activeJourney).toBeNull();
  });

  it("gives past journeys realistic Lagos evening times", () => {
    const labels = buildSampleDashboard(now).recentJourneys.map((j) => formatDayAndTime(j.endedAt, now));
    expect(labels[0]).toBe("Yesterday, 9:12 pm");
    expect(labels[1]).toMatch(/, 7:48 pm$/);
  });
});
