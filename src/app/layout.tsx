import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";

import "./globals.css";

/*
 * Brand typefaces, self-hosted by Next.js at build time (no requests to
 * Google from visitors' browsers).
 *  - Cormorant Garamond: expressive headlines (--font-display)
 *  - DM Sans: interface text (--font-sans)
 */
const display = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const sans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SafeReturn",
    template: "%s · SafeReturn",
  },
  description:
    "Journey check-ins for getting home safely. Tell the people you trust if you don't confirm a safe arrival.",
  appleWebApp: {
    title: "SafeReturn",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Lets the layout use the full iPhone screen; safe areas are handled in CSS.
  viewportFit: "cover",
  themeColor: "#f5f0e5",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-NG" className={`${display.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
