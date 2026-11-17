import type { ChannelFailure, FailureCategory } from "../channel";

/**
 * Sorts WhatsApp Cloud API errors into transient / permanent / configuration.
 * The same codes appear in send responses and in "failed" status webhooks.
 *
 * Unlisted codes fall back on the HTTP status: 5xx and 429 are transient.
 * Any other unrecognised 4xx is treated as "configuration" (probably our bug),
 * so it alerts the developer instead of being silently written off.
 *
 * Re-check these codes against Meta's current error-code reference before
 * production (P8).
 */
const CODE_CATEGORIES: Readonly<Record<number, FailureCategory>> = {
  // Temporary: provider overload, throughput or rate limits.
  1: "transient", // API unknown error
  2: "transient", // API service temporarily unavailable
  4: "transient", // Application request limit reached
  80007: "transient", // WhatsApp Business Account rate limit
  130429: "transient", // Cloud API throughput limit reached
  131000: "transient", // Something went wrong
  131016: "transient", // Service temporarily unavailable
  131048: "transient", // Spam rate limit hit
  131056: "transient", // Too many messages to this recipient in a short time

  // Permanent for this recipient: retrying will not help.
  131021: "permanent", // Recipient cannot be the sender
  131026: "permanent", // Message undeliverable (not on WhatsApp, old app, etc.)
  131049: "permanent", // Meta chose not to deliver
  131050: "permanent", // Recipient stopped this kind of message

  // Our configuration is wrong: needs a developer.
  0: "configuration", // Authentication exception
  3: "configuration", // Capability or permissions issue
  10: "configuration", // Permission denied
  100: "configuration", // Invalid parameter
  190: "configuration", // Access token expired or invalid
  131005: "configuration", // Access denied
  131008: "configuration", // Required parameter missing
  131009: "configuration", // Parameter value invalid
  131031: "configuration", // Business account locked
  131047: "configuration", // Free-form message outside the 24-hour window (we should send templates)
  131051: "configuration", // Unsupported message type
  132000: "configuration", // Template parameter count mismatch
  132001: "configuration", // Template does not exist
  132005: "configuration", // Translated text too long
  132007: "configuration", // Template format policy violation
  132012: "configuration", // Template parameter format mismatch
  132015: "configuration", // Template paused
  132016: "configuration", // Template disabled
  133010: "configuration", // Phone number not registered
};

interface GraphErrorBody {
  error?: { code?: unknown; message?: unknown; error_data?: { details?: unknown } };
}

function categoryForStatus(httpStatus: number): FailureCategory {
  if (httpStatus >= 500 || httpStatus === 429) return "transient";
  return "configuration";
}

function clip(text: string): string {
  return text.length > 300 ? `${text.slice(0, 297)}...` : text;
}

export function classifyWhatsAppCode(code: number | null, httpStatus: number | null): FailureCategory {
  if (code !== null && Object.hasOwn(CODE_CATEGORIES, code)) return CODE_CATEGORIES[code];
  if (httpStatus !== null) return categoryForStatus(httpStatus);
  return "transient";
}

/** Turns an HTTP error response from the Graph API into a ChannelFailure. */
export function classifySendError(httpStatus: number, body: unknown, retryAfterHeader: string | null): ChannelFailure {
  const error = (body as GraphErrorBody | null)?.error;
  const code = typeof error?.code === "number" ? error.code : null;
  const message = typeof error?.message === "string" ? error.message : `HTTP ${httpStatus}`;
  const details = typeof error?.error_data?.details === "string" ? ` (${error.error_data.details})` : "";

  const failure: ChannelFailure = {
    category: classifyWhatsAppCode(code, httpStatus),
    code: code !== null ? String(code) : `http_${httpStatus}`,
    detail: clip(`${message}${details}`),
  };
  const retryAfterSeconds = retryAfterHeader ? Number(retryAfterHeader) : NaN;
  if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0) {
    failure.retryAfterMs = retryAfterSeconds * 1000;
  }
  return failure;
}
