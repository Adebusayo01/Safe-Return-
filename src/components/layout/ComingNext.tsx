import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

import styles from "./ComingNext.module.css";

/**
 * Stand-in for a screen that hasn't been built yet, so navigation never leads
 * to a broken page. Each screen is designed and built only after its design
 * direction is approved.
 */
export function ComingNext({ title, description }: { title: string; description: string }) {
  return (
    <div className={styles.wrap}>
      <div>
        <p className={styles.eyebrow}>Not built yet</p>
        <h1 className={styles.title}>{title}</h1>
      </div>
      <Card>
        <p className={styles.text}>{description}</p>
      </Card>
      <div>
        <ButtonLink href="/" variant="secondary" iconStart="home">
          Back to home
        </ButtonLink>
      </div>
    </div>
  );
}
