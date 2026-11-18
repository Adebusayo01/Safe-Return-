import styles from "./DashboardSkeleton.module.css";

/** Placeholder shapes shown for a moment while the dashboard loads. */
export function DashboardSkeleton() {
  return (
    <div className={styles.skeleton} aria-busy="true" aria-label="Loading your dashboard">
      <div className={`${styles.block} ${styles.line}`} />
      <div className={`${styles.block} ${styles.title}`} />
      <div className={`${styles.block} ${styles.hero}`} />
      <div className={`${styles.block} ${styles.card}`} />
    </div>
  );
}
