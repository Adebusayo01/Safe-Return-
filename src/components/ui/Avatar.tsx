import styles from "./Avatar.module.css";

const TONES = ["sage", "wheat", "terracotta"] as const;

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? "") : "";
  return (first + last).toUpperCase();
}

/** Picks a stable tone from the name, so a person keeps the same colour. */
function toneFor(name: string): (typeof TONES)[number] {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return TONES[hash % TONES.length];
}

export interface AvatarProps {
  name: string;
  size?: "sm" | "md";
}

/** Initials in a coloured circle. Decorative: the name is always shown as text nearby. */
export function Avatar({ name, size = "md" }: AvatarProps) {
  return (
    <span className={[styles.avatar, styles[size], styles[toneFor(name)]].join(" ")} aria-hidden="true">
      {initialsOf(name)}
    </span>
  );
}
