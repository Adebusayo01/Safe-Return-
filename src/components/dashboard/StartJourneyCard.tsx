import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

import styles from "./StartJourneyCard.module.css";

/** The main call to action: start a journey, with a three-step explanation. */
export function StartJourneyCard({ hasActiveJourney }: { hasActiveJourney: boolean }) {
  return (
    <Card tone="forest" as="section" className={styles.card} aria-labelledby="start-journey-title">
      <div>
        <p className={styles.eyebrow}>New journey</p>
        <h2 id="start-journey-title" className={styles.title}>
          Heading out?
        </h2>
      </div>
      <ol className={styles.steps} role="list">
        <li className={styles.step}>
          <span className={styles.stepText}>Tell us where you&apos;re going and when you expect to arrive.</span>
        </li>
        <li className={styles.step}>
          <span className={styles.stepText}>We check in with you when you should have arrived.</span>
        </li>
        <li className={styles.step}>
          <span className={styles.stepText}>
            If you don&apos;t reply after your grace period, your trusted contacts are told.
          </span>
        </li>
      </ol>
      <ButtonLink href="/journeys/new" variant="inverse" size="lg" fullWidth iconEnd="arrowRight">
        Start a journey
      </ButtonLink>
      {hasActiveJourney ? (
        <p className={styles.note}>You already have a journey in progress. You can have one active journey at a time.</p>
      ) : null}
    </Card>
  );
}
