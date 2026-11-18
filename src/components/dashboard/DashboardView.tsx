import { SampleDataNotice } from "@/components/layout/SampleDataNotice";
import type { DashboardData } from "@/modules/dashboard/types";

import { ActiveJourneySection } from "./ActiveJourneySection";
import { ContactsPreview } from "./ContactsPreview";
import { Greeting } from "./Greeting";
import { RecentJourneys } from "./RecentJourneys";
import { StartJourneyCard } from "./StartJourneyCard";
import styles from "./DashboardView.module.css";

/** The dashboard layout. Receives data; knows nothing about where it came from. */
export function DashboardView({ data, now }: { data: DashboardData; now: Date }) {
  return (
    <div className={styles.page}>
      {data.dataSource !== "database" ? (
        <div className={styles.full}>
          <SampleDataNotice />
        </div>
      ) : null}
      <div className={styles.full}>
        <Greeting firstName={data.user.firstName} now={now} />
      </div>
      <StartJourneyCard hasActiveJourney={data.activeJourney !== null} />
      <ActiveJourneySection journey={data.activeJourney} now={now} />
      <ContactsPreview contacts={data.contacts.preview} total={data.contacts.total} />
      <RecentJourneys items={data.recentJourneys} now={now} />
    </div>
  );
}
