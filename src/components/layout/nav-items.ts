import type { IconName } from "@/components/ui/Icon";

export interface NavItem {
  href: string;
  label: string;
  icon: IconName;
}

/** Main app navigation. Order is the order shown in the tab bar. */
export const NAV_ITEMS: readonly NavItem[] = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/journeys", label: "Journeys", icon: "journey" },
  { href: "/contacts", label: "Contacts", icon: "contacts" },
  { href: "/settings", label: "Settings", icon: "settings" },
];

export function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
