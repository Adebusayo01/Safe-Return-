/**
 * Notification delivery states, kept separate from journey states.
 *
 *   pending ─▶ sending ─▶ sent ─▶ delivered ─▶ read
 *      │          │         └──────────────▶ failed   (provider reports failure later)
 *      │          ├─▶ failed     (permanent or configuration error)
 *      │          ├─▶ unknown    (outcome unclear, e.g. timeout)
 *      │          └─▶ pending    (temporary error, retry scheduled)
 *      └─▶ cancelled             (no longer needed, e.g. user already checked in)
 *   unknown ─▶ pending (one retry after waiting) | sent/delivered/read/failed (provider report)
 *
 * A delivery result NEVER changes a journey's state. Journey logic may read it
 * (e.g. to choose alert wording) but escalation timing does not wait for it.
 */

export const DELIVERY_STATUSES = [
  "pending",
  "sending",
  "sent",
  "delivered",
  "read",
  "failed",
  "cancelled",
  "unknown",
] as const;

export type DeliveryStatus = (typeof DELIVERY_STATUSES)[number];

/** Statuses a provider (e.g. WhatsApp webhooks) can report. */
export type ProviderStatus = "sent" | "delivered" | "read" | "failed";

const ALLOWED_TRANSITIONS: Readonly<Record<DeliveryStatus, readonly DeliveryStatus[]>> = {
  pending: ["sending", "cancelled", "sent", "delivered", "read", "failed"],
  sending: ["sent", "failed", "unknown", "pending"],
  unknown: ["pending", "sent", "delivered", "read", "failed", "cancelled"],
  sent: ["delivered", "read", "failed"],
  delivered: ["read"],
  read: [],
  failed: [],
  cancelled: ["sent", "delivered", "read"],
};

export const TERMINAL_STATUSES: ReadonlySet<DeliveryStatus> = new Set(["read", "failed"]);

export function canTransition(from: DeliveryStatus, to: DeliveryStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

/** How far a message has provably travelled, according to the provider. */
const PROGRESS_RANK: Readonly<Record<DeliveryStatus, number>> = {
  pending: 0,
  sending: 0,
  unknown: 0,
  cancelled: 0,
  failed: 0,
  sent: 1,
  delivered: 2,
  read: 3,
};

export interface StatusUpdateResult {
  next: DeliveryStatus;
  /** False when the update was ignored (duplicate, out of order, or after a final state). */
  changed: boolean;
}

/**
 * Applies a status report from the provider.
 *
 * Reports can arrive twice or out of order (e.g. "delivered" before "sent").
 * Status only moves forward: an older or repeated report is ignored.
 *
 * Provider evidence beats our own uncertainty: if we marked a message
 * "unknown", or even "cancelled" or "pending" for a retry, and the provider
 * says it was delivered, we record it as delivered, because that is what
 * really happened. The pending retry must then see the new status and do nothing.
 */
export function applyProviderStatus(current: DeliveryStatus, reported: ProviderStatus): StatusUpdateResult {
  if (reported === "failed") {
    const canFail = current === "sending" || current === "unknown" || current === "sent" || current === "pending";
    return canFail ? { next: "failed", changed: true } : { next: current, changed: false };
  }
  if (current === "failed") return { next: current, changed: false };
  if (PROGRESS_RANK[reported] > PROGRESS_RANK[current] && canTransition(current, reported)) {
    return { next: reported, changed: true };
  }
  return { next: current, changed: false };
}
