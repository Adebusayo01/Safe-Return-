/**
 * Date and time formatting for the interface.
 *
 * SafeReturn launches in Lagos, so times are shown in West Africa Time
 * (Africa/Lagos, UTC+1, no daylight saving) in 12-hour style ("6:30 pm").
 * Formatting happens on the server so every device shows the same result.
 * When users can choose their own time zone, it will be passed in here.
 */

export const APP_TIME_ZONE = "Africa/Lagos";
const LOCALE = "en-NG";

const timeFormatter = new Intl.DateTimeFormat(LOCALE, {
  timeZone: APP_TIME_ZONE,
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

const longDateFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: APP_TIME_ZONE,
  weekday: "long",
  day: "numeric",
  month: "long",
});

const shortDateFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: APP_TIME_ZONE,
  weekday: "short",
  day: "numeric",
  month: "short",
});

const dayKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: APP_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const hourFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: APP_TIME_ZONE,
  hour: "numeric",
  hourCycle: "h23",
});

/** Some ICU versions use narrow no-break spaces; normalise to plain spaces. */
function clean(text: string): string {
  return text.replace(/[  ]/g, " ");
}

/** "6:30 pm" */
export function formatTime(date: Date): string {
  return clean(timeFormatter.format(date));
}

/** "Wednesday 18 November" */
export function formatLongDate(date: Date): string {
  return clean(longDateFormatter.format(date));
}

function dayKey(date: Date): string {
  return dayKeyFormatter.format(date);
}

/** "Today, 6:30 pm" · "Yesterday, 9:12 pm" · "Sat 15 Nov, 9:12 pm" */
export function formatDayAndTime(date: Date, now: Date): string {
  const time = formatTime(date);
  if (dayKey(date) === dayKey(now)) return `Today, ${time}`;
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  if (dayKey(date) === dayKey(yesterday)) return `Yesterday, ${time}`;
  return `${clean(shortDateFormatter.format(date))}, ${time}`;
}

/** "45 min" · "1 hr" · "1 hr 5 min". Negative values are treated as 0. */
export function formatDuration(totalMinutes: number): string {
  const minutes = Math.max(0, Math.round(totalMinutes));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} hr` : `${hours} hr ${rest} min`;
}

/** Whole minutes from `now` until `target` (negative if it has passed). */
export function minutesUntil(target: Date, now: Date): number {
  return Math.round((target.getTime() - now.getTime()) / 60_000);
}

/** Greeting by the time of day in Lagos. */
export function greetingFor(now: Date): string {
  const hour = Number(hourFormatter.format(now));
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  if (hour >= 17) return "Good evening";
  return "Hello";
}
