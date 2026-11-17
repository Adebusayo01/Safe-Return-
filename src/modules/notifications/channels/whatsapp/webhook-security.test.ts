import { createHmac } from "node:crypto";

import { describe, expect, it } from "vitest";

import { verifySubscriptionChallenge, verifyWebhookSignature } from "./webhook-security";

const secret = "test-app-secret";
const body = '{"object":"whatsapp_business_account","entry":[]}';
const sign = (b: string, s = secret) => `sha256=${createHmac("sha256", s).update(b).digest("hex")}`;

describe("verifyWebhookSignature", () => {
  it("accepts a correctly signed body", () => {
    expect(verifyWebhookSignature(body, sign(body), secret)).toBe(true);
  });

  it("rejects a tampered body, wrong secret, or missing/malformed header", () => {
    expect(verifyWebhookSignature(`${body} `, sign(body), secret)).toBe(false);
    expect(verifyWebhookSignature(body, sign(body, "other-secret"), secret)).toBe(false);
    expect(verifyWebhookSignature(body, null, secret)).toBe(false);
    expect(verifyWebhookSignature(body, "sha1=abc", secret)).toBe(false);
    expect(verifyWebhookSignature(body, sign(body), "")).toBe(false);
  });
});

describe("verifySubscriptionChallenge", () => {
  const params = (p: Record<string, string>) => new URLSearchParams(p);

  it("returns the challenge when the verify token matches", () => {
    expect(
      verifySubscriptionChallenge(
        params({ "hub.mode": "subscribe", "hub.verify_token": "tok", "hub.challenge": "12345" }),
        "tok",
      ),
    ).toBe("12345");
  });

  it("returns null otherwise", () => {
    expect(
      verifySubscriptionChallenge(params({ "hub.mode": "subscribe", "hub.verify_token": "bad", "hub.challenge": "1" }), "tok"),
    ).toBeNull();
    expect(verifySubscriptionChallenge(params({ "hub.mode": "subscribe", "hub.challenge": "1" }), "tok")).toBeNull();
    expect(
      verifySubscriptionChallenge(params({ "hub.mode": "unsubscribe", "hub.verify_token": "tok", "hub.challenge": "1" }), "tok"),
    ).toBeNull();
  });
});
