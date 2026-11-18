import { Icon } from "@/components/ui/Icon";

import styles from "./SampleDataNotice.module.css";

/**
 * Shown on any screen that displays sample data, so it is never mistaken for
 * real, saved information. Remove it per screen as real data is connected.
 */
export function SampleDataNotice() {
  return (
    <aside className={styles.notice} aria-label="Preview notice">
      <Icon name="info" size={20} className={styles.icon} />
      <p>
        <strong>Preview with sample data.</strong> Nothing is saved, no reminders run and no messages are sent yet.
      </p>
    </aside>
  );
}
