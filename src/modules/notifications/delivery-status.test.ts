import { describe, expect, it } from "vitest";

import { applyProviderStatus, canTransition, type DeliveryStatus } from "./delivery-status";

describe("delivery state transitions", () => {
  it.each<[DeliveryStatus, DeliveryStatus, boolean]>([
    ["pending", "sending", true],
    ["pending", "cancelled", true],
    ["sending", "sent", true],
    ["sending", "unknown", true],
    ["sending", "pending", true], // transient failure, retry scheduled
    ["unknown", "pending", true], // retry after waiting
    ["sent", "delivered", true],
    ["delivered", "read", true],
    ["read", "delivered", false],
    ["failed", "sending", false],
    ["delivered", "sending", false],
    ["sent", "pending", false], // never resend something the provider accepted
  ])("%s -> %s allowed: %s", (from, to, allowed) => {
    expect(canTransition(from, to)).toBe(allowed);
  });
});

describe("applyProviderStatus", () => {
  it("moves forward through sent, delivered, read", () => {
    expect(applyProviderStatus("sending", "sent")).toEqual({ next: "sent", changed: true });
    expect(applyProviderStatus("sent", "delivered")).toEqual({ next: "delivered", changed: true });
    expect(applyProviderStatus("delivered", "read")).toEqual({ next: "read", changed: true });
  });

  it("ignores duplicate and out-of-order reports", () => {
    expect(applyProviderStatus("delivered", "delivered")).toEqual({ next: "delivered", changed: false });
    expect(applyProviderStatus("delivered", "sent")).toEqual({ next: "delivered", changed: false });
    expect(applyProviderStatus("read", "delivered")).toEqual({ next: "read", changed: false });
  });

  it("accepts a later 'failed' report after 'sent', but not after delivery", () => {
    expect(applyProviderStatus("sent", "failed")).toEqual({ next: "failed", changed: true });
    expect(applyProviderStatus("delivered", "failed")).toEqual({ next: "delivered", changed: false });
  });

  it("lets provider evidence resolve an unknown outcome", () => {
    expect(applyProviderStatus("unknown", "delivered")).toEqual({ next: "delivered", changed: true });
  });

  it("records real delivery even if we had scheduled a retry or cancelled", () => {
    expect(applyProviderStatus("pending", "delivered")).toEqual({ next: "delivered", changed: true });
    expect(applyProviderStatus("cancelled", "read")).toEqual({ next: "read", changed: true });
  });

  it("treats failed as final", () => {
    expect(applyProviderStatus("failed", "delivered")).toEqual({ next: "failed", changed: false });
  });
});
