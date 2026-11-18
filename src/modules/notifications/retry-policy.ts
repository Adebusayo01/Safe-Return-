import type { ChannelFailure } from "./channels/channel";

/**
 * Decides what happens after a send attempt fails or has an unknown outcome.
 * Pure function: it returns a decision; the queue (P1, with Neon) stores it.
 */

/** Wait before retry number 1, 2, 3, … after a temporary failure ("backoff"). */
export const RETRY_DELAYS_MS = [30_000, 60_000, 120_000, 300_000, 600_000, 900_000] as const;

/** First attempt + one retry per entry in RETRY_DELAYS_MS. */
export const MAX_SEND_ATTEMPTS = RETRY_DELAYS_MS.length + 1;

/** How long to wait for a delivery report before retrying an "unknown" send. */
export const UNKNOWN_OUTCOME_WAIT_MS = 120_000;

export type RetryDecision =
  | { action: "retry"; retryAt: Date }
  | { action: "fail"; reason: "permanent" | "attempts_exhausted" | "stale" | "unknown_outcome_unresolved" }
  | { action: "dead"; reason: "configuration" };

export interface FailureContext {
  /** Attempts made so far, including the one that just failed. */
  attempts: number;
  now: Date;
  /** After this time the message is pointless (e.g. a login code that has expired). */
  staleAfter: Date | null;
}

function retryOrStale(retryAt: Date, ctx: FailureContext): RetryDecision {
  if (ctx.staleAfter && retryAt.getTime() > ctx.staleAfter.getTime()) {
    return { action: "fail", reason: "stale" };
  }
  return { action: "retry", retryAt };
}

export function decideAfterFailure(failure: ChannelFailure, ctx: FailureContext): RetryDecision {
  switch (failure.category) {
    case "configuration":
      // Our setup is broken. Retrying cannot help and someone must be told.
      return { action: "dead", reason: "configuration" };
    case "permanent":
      return { action: "fail", reason: "permanent" };
    case "transient": {
      if (ctx.attempts >= MAX_SEND_ATTEMPTS) return { action: "fail", reason: "attempts_exhausted" };
      const backoff = RETRY_DELAYS_MS[Math.max(0, ctx.attempts - 1)] ?? RETRY_DELAYS_MS[RETRY_DELAYS_MS.length - 1];
      const delay = Math.max(backoff, failure.retryAfterMs ?? 0);
      return retryOrStale(new Date(ctx.now.getTime() + delay), ctx);
    }
  }
}

/**
 * After an "unknown" outcome we don't resend at once, because the message may
 * already have arrived. We wait for a delivery report; if none comes, we retry
 * exactly once more. A second unknown outcome is recorded as a failure.
 */
export function decideAfterUnknown(ctx: FailureContext & { unknownRetriesUsed: number }): RetryDecision {
  if (ctx.unknownRetriesUsed >= 1) return { action: "fail", reason: "unknown_outcome_unresolved" };
  if (ctx.attempts >= MAX_SEND_ATTEMPTS) return { action: "fail", reason: "attempts_exhausted" };
  return retryOrStale(new Date(ctx.now.getTime() + UNKNOWN_OUTCOME_WAIT_MS), ctx);
}
