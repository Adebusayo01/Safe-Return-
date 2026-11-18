import type { ReactNode } from "react";

import styles from "./Badge.module.css";

export type BadgeTone = "forest" | "sage" | "wheat" | "terracotta" | "outline";

export interface BadgeProps {
  tone?: BadgeTone;
  /** Small leading dot, e.g. for live status. */
  dot?: boolean;
  children: ReactNode;
  className?: string;
}

/** Short status label. Status is always written in words, never shown by colour alone. */
export function Badge({ tone = "outline", dot, children, className }: BadgeProps) {
  return (
    <span className={[styles.badge, styles[tone], className].filter(Boolean).join(" ")}>
      {dot ? <span className={styles.dot} aria-hidden="true" /> : null}
      {children}
    </span>
  );
}
