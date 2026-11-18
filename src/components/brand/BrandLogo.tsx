import Link from "next/link";

import styles from "./BrandLogo.module.css";

/**
 * SafeReturn logo: mark + wordmark (title case).
 *
 * The mark is a TEMPORARY PLACEHOLDER until the "Connected Path" logo concept
 * is approved. To swap in the final logo, change this file only.
 */
export function BrandLogo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className={styles.logo} aria-label="SafeReturn home">
      <span className={styles.placeholderMark} data-placeholder="logo-mark" aria-hidden="true" />
      <span className={styles.wordmark} aria-hidden="true">
        SafeReturn
      </span>
    </Link>
  );
}
