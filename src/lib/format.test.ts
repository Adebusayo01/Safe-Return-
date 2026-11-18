import { describe, expect, it } from "vitest";

import { formatDayAndTime, formatDuration, formatLongDate, formatTime, greetingFor, minutesUntil } from "./format";

// 18:30 in Lagos (UTC+1)
const evening = new Date("2026-11-18T17:30:00Z");

describe("formatting in Lagos time", () => {
  it("formats 12-hour times", () => {
    expect(formatTime(evening)).toBe("6:30 pm");
    expect(formatTime(new Date("2026-11-18T08:05:00Z"))).toBe("9:05 am");
  });

  it("formats long dates", () => {
    expect(formatLongDate(evening)).toBe("Wednesday 18 November");
  });

  it("uses Lagos time to decide today and yesterday", () => {
    // 23:30 UTC on the 17th is 00:30 on the 18th in Lagos: "Today".
    expect(formatDayAndTime(new Date("2026-11-17T23:30:00Z"), evening)).toBe("Today, 12:30 am");
    expect(formatDayAndTime(new Date("2026-11-17T20:12:00Z"), evening)).toBe("Yesterday, 9:12 pm");
    expect(formatDayAndTime(new Date("2026-11-15T20:12:00Z"), evening)).toBe("Sun 15 Nov, 9:12 pm");
  });

  it("chooses a greeting by Lagos hour", () => {
    expect(greetingFor(new Date("2026-11-18T06:00:00Z"))).toBe("Good morning"); // 07:00
    expect(greetingFor(new Date("2026-11-18T12:00:00Z"))).toBe("Good afternoon"); // 13:00
    expect(greetingFor(evening)).toBe("Good evening"); // 18:30
    expect(greetingFor(new Date("2026-11-18T01:00:00Z"))).toBe("Hello"); // 02:00
  });
});

describe("durations", () => {
  it.each([
    [0, "0 min"],
    [-5, "0 min"],
    [45, "45 min"],
    [60, "1 hr"],
    [65, "1 hr 5 min"],
    [150, "2 hr 30 min"],
  ])("%i minutes -> %s", (minutes, expected) => {
    expect(formatDuration(minutes)).toBe(expected);
  });

  it("counts minutes until a time", () => {
    expect(minutesUntil(new Date("2026-11-18T18:12:00Z"), evening)).toBe(42);
    expect(minutesUntil(new Date("2026-11-18T17:20:00Z"), evening)).toBe(-10);
  });
});
