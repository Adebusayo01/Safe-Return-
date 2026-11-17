import { describe, expect, it } from "vitest";

import type { ChannelFailure } from "./channels/channel";
import { MAX_SEND_ATTEMPTS, RETRY_DELAYS_MS, UNKNOWN_OUTCOME_WAIT_MS, decideAfterFailure, decideAfterUnknown } from "./retry-policy";

const now = new Date("2026-01-01T18:00:00Z");
const transient: ChannelFailure = { category: "transient", code: "http_503", detail: "down" };

describe("decideAfterFailure", () => {
  it("retries temporary failures with growing delays", () => {
    const delays = RETRY_DELAYS_MS.map((_, i) => {
      const decision = decideAfterFailure(transient, { attempts: i + 1, now, staleAfter: null });
      expect(decision.action).toBe("retry");
      return decision.action === "retry" ? decision.retryAt.getTime() - now.getTime() : 0;
    });
    expect(delays).toEqual([...RETRY_DELAYS_MS]);
  });

  it("stops after the maximum number of attempts", () => {
    expect(decideAfterFailure(transient, { attempts: MAX_SEND_ATTEMPTS, now, staleAfter: null })).toEqual({
      action: "fail",
      reason: "attempts_exhausted",
    });
  });

  it("respects a provider's Retry-After when it is longer than our backoff", () => {
    const decision = decideAfterFailure({ ...transient, retryAfterMs: 90_000 }, { attempts: 1, now, staleAfter: null });
    expect(decision).toEqual({ action: "retry", retryAt: new Date(now.getTime() + 90_000) });
  });

  it("does not retry a message that would be stale by then", () => {
    const staleAfter = new Date(now.getTime() + 10_000); // e.g. an expiring login code
    expect(decideAfterFailure(transient, { attempts: 1, now, staleAfter })).toEqual({ action: "fail", reason: "stale" });
  });

  it("never retries permanent failures", () => {
    const failure: ChannelFailure = { category: "permanent", code: "131026", detail: "not on WhatsApp" };
    expect(decideAfterFailure(failure, { attempts: 1, now, staleAfter: null })).toEqual({ action: "fail", reason: "permanent" });
  });

  it("marks configuration errors dead so the developer is alerted", () => {
    const failure: ChannelFailure = { category: "configuration", code: "190", detail: "token expired" };
    expect(decideAfterFailure(failure, { attempts: 1, now, staleAfter: null })).toEqual({ action: "dead", reason: "configuration" });
  });
});

describe("decideAfterUnknown", () => {
  it("waits for a delivery report before retrying once", () => {
    expect(decideAfterUnknown({ attempts: 1, now, staleAfter: null, unknownRetriesUsed: 0 })).toEqual({
      action: "retry",
      retryAt: new Date(now.getTime() + UNKNOWN_OUTCOME_WAIT_MS),
    });
  });

  it("gives up after a second unknown outcome instead of risking more duplicates", () => {
    expect(decideAfterUnknown({ attempts: 2, now, staleAfter: null, unknownRetriesUsed: 1 })).toEqual({
      action: "fail",
      reason: "unknown_outcome_unresolved",
    });
  });
});
