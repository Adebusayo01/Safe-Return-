import type { SVGProps } from "react";

/**
 * SafeReturn icon set: simple line icons drawn on a 24×24 grid,
 * using the current text colour. No icon library is needed.
 *
 * Icons are decorative by default (hidden from screen readers). Pass `label`
 * when an icon is the only content of a control, so it is announced.
 */

const PATHS = {
  home: (
    <>
      <path d="M4 10.2 12 4l8 6.2V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z" />
    </>
  ),
  journey: (
    <>
      <circle cx="6" cy="18.5" r="2" />
      <circle cx="18" cy="5.5" r="2" />
      <path d="M8 18.5h8a3.25 3.25 0 0 0 0-6.5H8a3.25 3.25 0 0 1 0-6.5h8" />
    </>
  ),
  contacts: (
    <>
      <circle cx="9" cy="8.5" r="3.25" />
      <path d="M3 19.5a6 6 0 0 1 12 0" />
      <path d="M15.5 5.4a3.25 3.25 0 0 1 0 6.2" />
      <path d="M17.8 14.2a6 6 0 0 1 3.2 5.3" />
    </>
  ),
  settings: (
    <>
      <path d="M4 7h9M17 7h3M4 12h3M11 12h9M4 17h11M19 17h1" />
      <circle cx="15" cy="7" r="2" />
      <circle cx="9" cy="12" r="2" />
      <circle cx="17" cy="17" r="2" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  chevronRight: <path d="m9.5 6 6 6-6 6" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  checkCircle: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8.5 12.2 2.4 2.4 4.6-4.9" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  pin: (
    <>
      <path d="M12 20.5s-6.5-5.6-6.5-10.6a6.5 6.5 0 0 1 13 0c0 5-6.5 10.6-6.5 10.6z" />
      <circle cx="12" cy="9.9" r="2.3" />
    </>
  ),
  location: (
    <>
      <circle cx="12" cy="12" r="2.5" />
      <path d="M12 3.5v2.5M12 18v2.5M3.5 12H6M18 12h2.5" />
      <circle cx="12" cy="12" r="6.5" />
    </>
  ),
  help: (
    <>
      <path d="M12 3.8 2.8 19.5h18.4z" />
      <path d="M12 10v4.2M12 16.9v.1" />
    </>
  ),
  close: <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />,
  bell: (
    <>
      <path d="M6.5 16.5V11a5.5 5.5 0 0 1 11 0v5.5l1.5 2H5z" />
      <path d="M10 20.5a2.2 2.2 0 0 0 4 0" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5.2M12 7.9v.1" />
    </>
  ),
  extend: (
    <>
      <circle cx="11" cy="13" r="7" />
      <path d="M11 9.5V13l2.2 1.4M17.5 3.5v5M15 6h5" />
    </>
  ),
  message: <path d="M4.5 5.5h15v10h-9l-4.5 3.5v-3.5H4.5z" />,
} as const;

export type IconName = keyof typeof PATHS;

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "children"> {
  name: IconName;
  /** Size in pixels. Default 24. */
  size?: number;
  /** Accessible name. Omit for decorative icons. */
  label?: string;
}

export function Icon({ name, size = 24, label, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}

export const ICON_NAMES = Object.keys(PATHS) as IconName[];
