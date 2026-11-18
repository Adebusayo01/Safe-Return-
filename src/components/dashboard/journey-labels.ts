import type { BadgeTone } from "@/components/ui/Badge";
import type { IconName } from "@/components/ui/Icon";
import type { ClosedJourneyStatus, LocationSharingMode, OpenJourneyStatus } from "@/modules/journeys/status";

/**
 * Words and tones used to describe journeys. Wording follows the plan:
 * a missed check-in is never described as danger.
 */

export const OPEN_STATUS_LABEL: Record<OpenJourneyStatus, { label: string; tone: BadgeTone }> = {
  ACTIVE: { label: "On the way", tone: "sage" },
  CHECKIN_DUE: { label: "Check-in due", tone: "wheat" },
  FINAL_WARNING: { label: "Please check in", tone: "wheat" },
  ALERTED: { label: "Contacts notified", tone: "terracotta" },
  HELP_REQUESTED: { label: "Help requested", tone: "terracotta" },
};

export const OUTCOME_LABEL: Record<ClosedJourneyStatus, { label: string; icon: IconName }> = {
  SAFE: { label: "Arrived safely", icon: "checkCircle" },
  SAFE_LATE: { label: "Checked in late · contacts updated", icon: "clock" },
  CANCELLED: { label: "Cancelled", icon: "close" },
  EXPIRED: { label: "No check-in · monitoring ended", icon: "info" },
};

export const LOCATION_LABEL: Record<LocationSharingMode, string> = {
  off: "Not shared",
  on_alert: "Shared only if you miss your check-in",
  live: "Shared with your contacts during this journey",
};
