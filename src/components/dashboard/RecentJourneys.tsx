import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { formatDayAndTime } from "@/lib/format";
import type { JourneyActivityItem } from "@/modules/dashboard/types";
import type { ClosedJourneyStatus } from "@/modules/journeys/status";

import { OUTCOME_LABEL } from "./journey-labels";
import styles from "./ListCard.module.css";

const BUBBLE: Record<ClosedJourneyStatus, string> = {
  SAFE: styles.bubbleSafe,
  SAFE_LATE: styles.bubbleLate,
  CANCELLED: styles.bubbleNeutral,
  EXPIRED: styles.bubbleNeutral,
};

export function RecentJourneys({ items, now }: { items: JourneyActivityItem[]; now: Date }) {
  return (
    <section aria-labelledby="recent-heading">
      <SectionHeading
        id="recent-heading"
        title="Recent journeys"
        action={
          <ButtonLink href="/journeys" variant="quiet">
            See all
          </ButtonLink>
        }
      />
      <Card flush>
        {items.length === 0 ? (
          <p className={styles.footer}>Your finished journeys will be listed here.</p>
        ) : (
          <ul className={styles.list} role="list">
            {items.map((item) => {
              const outcome = OUTCOME_LABEL[item.outcome];
              return (
                <li key={item.id} className={styles.row}>
                  <span className={`${styles.iconBubble} ${BUBBLE[item.outcome]}`}>
                    <Icon name={outcome.icon} size={22} />
                  </span>
                  <div className={styles.body}>
                    <p className={styles.primary}>{item.destination}</p>
                    <p className={styles.secondary}>{outcome.label}</p>
                    <p className={styles.secondary}>
                      <time dateTime={item.endedAt.toISOString()}>{formatDayAndTime(item.endedAt, now)}</time>
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </section>
  );
}
