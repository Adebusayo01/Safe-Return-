import type { HTMLAttributes, ReactNode } from "react";

import styles from "./Card.module.css";

export type CardTone = "plain" | "sage" | "wheat" | "forest";

export interface CardProps extends HTMLAttributes<HTMLElement> {
  tone?: CardTone;
  /** Remove inner padding (for lists that run edge to edge). */
  flush?: boolean;
  as?: "div" | "section" | "article" | "aside";
  children: ReactNode;
}

/** A surface that groups related content. Tones map to the brand palette. */
export function Card({ tone = "plain", flush, as: Element = "div", className, children, ...rest }: CardProps) {
  return (
    <Element
      className={[styles.card, styles[tone], flush ? styles.flush : "", className ?? ""].filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
    </Element>
  );
}
