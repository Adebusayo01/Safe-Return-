/**
 * Journey states from the approved state machine (docs/engineering-plan.md).
 * The transition rules arrive with the journey engine (P4); for now these
 * types let the interface describe journeys consistently.
 */
export const JOURNEY_STATUSES = [
  "ACTIVE",
  "CHECKIN_DUE",
  "FINAL_WARNING",
  "ALERTED",
  "HELP_REQUESTED",
  "SAFE",
  "SAFE_LATE",
  "CANCELLED",
  "EXPIRED",
] as const;

export type JourneyStatus = (typeof JOURNEY_STATUSES)[number];

export const OPEN_JOURNEY_STATUSES = ["ACTIVE", "CHECKIN_DUE", "FINAL_WARNING", "ALERTED", "HELP_REQUESTED"] as const;
export type OpenJourneyStatus = (typeof OPEN_JOURNEY_STATUSES)[number];
export type ClosedJourneyStatus = Exclude<JourneyStatus, OpenJourneyStatus>;

/** Grace period choices offered when starting a journey. */
export const GRACE_PERIOD_OPTIONS = [10, 15, 30] as const;
export type GracePeriodMinutes = (typeof GRACE_PERIOD_OPTIONS)[number];

export type LocationSharingMode = "off" | "on_alert" | "live";
