import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Security checks for Meta webhooks. The webhook route itself, which also
 * stores events, needs Neon and is not built yet.
 */

function safeEqual(a: Buffer, b: Buffer): boolean {
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Checks the `X-Hub-Signature-256` header. Meta signs the exact raw request
 * body with our App Secret (HMAC-SHA256). If the signature doesn't match, the
 * request didn't come from Meta and must be rejected.
 *
 * Pass the body exactly as received: re-serialising parsed JSON changes the
 * bytes and breaks the check.
 */
export function verifyWebhookSignature(
  rawBody: string | Uint8Array,
  signatureHeader: string | null,
  appSecret: string,
): boolean {
  if (!signatureHeader || !appSecret) return false;
  const match = /^sha256=([0-9a-f]{64})$/i.exec(signatureHeader.trim());
  if (!match) return false;
  const expected = createHmac("sha256", appSecret).update(rawBody).digest();
  return safeEqual(expected, Buffer.from(match[1], "hex"));
}

/**
 * Meta's one-time webhook setup check (a GET request). Returns the challenge
 * string to echo back if the verify token matches, otherwise null.
 */
export function verifySubscriptionChallenge(params: URLSearchParams, verifyToken: string): string | null {
  const mode = params.get("hub.mode");
  const token = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge");
  if (mode !== "subscribe" || !token || !challenge || !verifyToken) return null;
  return safeEqual(Buffer.from(token), Buffer.from(verifyToken)) ? challenge : null;
}
