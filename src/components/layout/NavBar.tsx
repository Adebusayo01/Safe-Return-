"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { BrandLogo } from "@/components/brand/BrandLogo";
import { Icon } from "@/components/ui/Icon";

import { NAV_ITEMS, isActive } from "./nav-items";
import styles from "./NavBar.module.css";

/** Bottom tab bar on phones; side menu on wide screens. */
export function NavBar() {
  const pathname = usePathname();
  return (
    <nav className={styles.nav} aria-label="Main">
      <div className={styles.brand}>
        <BrandLogo />
      </div>
      <ul className={styles.list} role="list">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link href={item.href} className={styles.link} aria-current={active ? "page" : undefined}>
                <span className={styles.iconWrap}>
                  <Icon name={item.icon} size={22} />
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
