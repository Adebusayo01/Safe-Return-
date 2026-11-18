import type { ReactNode } from "react";

import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon, type IconName } from "@/components/ui/Icon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { formatDuration, formatTime, minutesUntil } from "@/lib/format";
import type { ActiveJourneySummary } from "@/modules/dashboard/types";

import { LOCATION_LABEL, OPEN_STATUS_LABEL } from "./journey-labels";
import styles from "./ActiveJourneySection.module.css";

function Detail({ icon, term, children }: { icon: IconName; term: string; children: ReactNode }) {
  return (
    <div className={styles.detail}>
      <Icon name={icon} size={20} className={styles.detailIcon} />
      <div>
        <dt>{term}</dt>
        <dd>{children}</dd>
      </div>
    </div>
  );
}

function ActiveJourneyCard({ journey, now }: { journey: ActiveJourneySummary; now: Date }) {
  const status = OPEN_STATUS_LABEL[journey.status];
  const remaining = minutesUntil(journey.expectedArrivalAt, now);
  return (
    <Card as="article" className={styles.card} aria-labelledby="active-journey-destination">
      <div className={styles.top}>
        <Badge tone={status.tone} dot>
          {status.label}
        </Badge>
        <span className={styles.started}>Started {formatTime(journey.startedAt)}</span>
      </div>

      <div>
        <h3 id="active-journey-destination" className={styles.destination}>
          {journey.destination}
        </h3>
        {journey.area ? (
          <p className={styles.area}>
            <Icon name="pin" size={18} />
            {journey.area}
          </p>
        ) : null}
      </div>

      <div className={styles.times}>
        <div className={styles.time}>
          <p className={styles.timeLabel}>Expected</p>
          <p className={styles.timeValue}>{formatTime(journey.expectedArrivalAt)}</p>
        </div>
        <div className={styles.time}>
          <p className={styles.timeLabel}>{remaining >= 0 ? "Time left" : "Overdue by"}</p>
          <p className={styles.timeValue}>{formatDuration(Math.abs(remaining))}</p>
        </div>
      </div>

      <dl className={styles.details}>
        <Detail icon="clock" term="Grace period">
          {journey.gracePeriodMinutes} minutes after your expected arrival
        </Detail>
        <Detail icon="contacts" term="Contacts for this journey">
          {journey.contactNames.join(", ")}
        </Detail>
        <Detail icon="location" term="Location">
          {LOCATION_LABEL[journey.locationSharing]}
        </Detail>
      </dl>

      <ButtonLink href="/journeys/active" fullWidth iconEnd="arrowRight">
        Open journey
      </ButtonLink>
    </Card>
  );
}

export function ActiveJourneySection({ journey, now }: { journey: ActiveJourneySummary | null; now: Date }) {
  return (
    <section aria-labelledby="active-journey-heading">
      <SectionHeading id="active-journey-heading" title="Active journey" />
      {journey ? (
        <ActiveJourneyCard journey={journey} now={now} />
      ) : (
        <Card className={styles.empty}>
          <p className={styles.emptyTitle}>No journey in progress</p>
          <p className={styles.emptyText}>
            When you start a journey, it appears here with your expected arrival and check-in time.
          </p>
        </Card>
      )}
    </section>
  );
}
