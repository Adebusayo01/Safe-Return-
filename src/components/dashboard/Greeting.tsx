import { formatLongDate, greetingFor } from "@/lib/format";

import styles from "./Greeting.module.css";

export function Greeting({ firstName, now }: { firstName: string; now: Date }) {
  return (
    <header className={styles.greeting}>
      <p className={styles.date}>{formatLongDate(now)}</p>
      <h1 className={styles.title}>
        {greetingFor(now)}, <span className={styles.name}>{firstName}</span>.
      </h1>
      <p className={styles.intro}>
        SafeReturn keeps you company on the way. Tell us where you&apos;re going and when you expect to arrive. We&apos;ll
        check in with you, and if we don&apos;t hear back, we&apos;ll let the people you trust know.
      </p>
    </header>
  );
}
