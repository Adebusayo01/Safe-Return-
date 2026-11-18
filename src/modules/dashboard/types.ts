import type {
  ClosedJourneyStatus,
  GracePeriodMinutes,
  LocationSharingMode,
  OpenJourneyStatus,
} from "@/modules/journeys/status";

/**
 * The data the dashboard needs, in the shape the screen uses it.
 * Today it is filled from sample data; later from Neon. Screens depend only
 * on these types, not on where the data comes from.
 */

/** Where the data came from. The interface shows a notice whenever it isn't "database". */
export type DataSource = "sample" | "database";

export interface ActiveJourneySummary {
  id: string;
  destination: string;
  /** Area or landmark, e.g. "Yaba, Lagos". */
  area: string | null;
  startedAt: Date;
  expectedArrivalAt: Date;
  gracePeriodMinutes: GracePeriodMinutes;
  status: OpenJourneyStatus;
  contactNames: string[];
  locationSharing: LocationSharingMode;
}

export type ContactStatus = "active" | "invited";

export interface ContactPreview {
  id: string;
  name: string;
  relationship: string;
  status: ContactStatus;
}

export interface JourneyActivityItem {
  id: string;
  destination: string;
  outcome: ClosedJourneyStatus;
  endedAt: Date;
}

export interface DashboardData {
  dataSource: DataSource;
  user: { firstName: string };
  activeJourney: ActiveJourneySummary | null;
  contacts: { preview: ContactPreview[]; total: number };
  recentJourneys: JourneyActivityItem[];
}
