import type { ReactNode } from "react";

import { BrandLogo } from "@/components/brand/BrandLogo";

import { NavBar } from "./NavBar";
import styles from "./AppShell.module.css";

/** Frame for signed-in app screens: header, main content, navigation. */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <a href="#main" className={styles.skipLink}>
        Skip to content
      </a>
      <header className={styles.header}>
        <BrandLogo />
      </header>
      <NavBar />
      <main id="main" className={styles.main}>
        {children}
      </main>
    </div>
  );
}
