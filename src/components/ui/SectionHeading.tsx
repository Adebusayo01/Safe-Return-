import type { ReactNode } from "react";

import styles from "./SectionHeading.module.css";

export interface SectionHeadingProps {
  id?: string;
  title: string;
  eyebrow?: string;
  /** Optional action at the right, e.g. a "See all" link. */
  action?: ReactNode;
  level?: 2 | 3;
}

/** Heading for a page section: optional small eyebrow, display-font title, optional action. */
export function SectionHeading({ id, title, eyebrow, action, level = 2 }: SectionHeadingProps) {
  const Heading = level === 2 ? "h2" : "h3";
  return (
    <div className={styles.heading}>
      <div className={styles.text}>
        {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
        <Heading id={id} className={styles.title}>
          {title}
        </Heading>
      </div>
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}
