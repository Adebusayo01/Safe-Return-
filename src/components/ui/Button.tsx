import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";

import { Icon, type IconName } from "./Icon";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "inverse" | "urgent" | "quiet";
export type ButtonSize = "md" | "lg";

interface SharedProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  iconStart?: IconName;
  iconEnd?: IconName;
  children: ReactNode;
}

function classes({ variant = "primary", size = "md", fullWidth }: SharedProps, extra?: string) {
  return [styles.button, styles[variant], styles[size], fullWidth ? styles.fullWidth : "", extra ?? ""]
    .filter(Boolean)
    .join(" ");
}

function Content({ iconStart, iconEnd, children }: SharedProps) {
  return (
    <>
      {iconStart ? <Icon name={iconStart} size={20} className={styles.icon} /> : null}
      <span>{children}</span>
      {iconEnd ? <Icon name={iconEnd} size={20} className={styles.icon} /> : null}
    </>
  );
}

export type ButtonProps = SharedProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">;

/** An action on this page (submits a form, opens a dialog, …). */
export function Button({ variant, size, fullWidth, iconStart, iconEnd, children, className, type, ...rest }: ButtonProps) {
  const shared = { variant, size, fullWidth, iconStart, iconEnd, children };
  return (
    <button type={type ?? "button"} className={classes(shared, className)} {...rest}>
      <Content {...shared} />
    </button>
  );
}

export type ButtonLinkProps = SharedProps & Omit<ComponentProps<typeof Link>, "children">;

/** Navigation to another page, styled as a button. */
export function ButtonLink({ variant, size, fullWidth, iconStart, iconEnd, children, className, ...rest }: ButtonLinkProps) {
  const shared = { variant, size, fullWidth, iconStart, iconEnd, children };
  return (
    <Link className={classes(shared, className)} {...rest}>
      <Content {...shared} />
    </Link>
  );
}
