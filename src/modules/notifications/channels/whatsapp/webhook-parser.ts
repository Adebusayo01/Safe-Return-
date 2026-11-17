import { phoneFromWaId, type PhoneE164 } from "../../phone";
import type { ProviderStatus } from "../../delivery-status";
import { classifyWhatsAppCode } from "./errors";
import type { FailureCategory } from "../channel";

/**
 * Converts Meta's nested webhook JSON into a flat list of simple events.
 *
 * The parser checks every field and never trusts the shape of the payload.
 * Anything it doesn't recognise is counted as "ignored" rather than causing an
 * error, because Meta adds new event types over time.
 */

export type InboundContent =
  | { type: "text"; text: string }
  /** A quick-reply button tap (template button or interactive reply button). */
  | { type: "button"; payload: string; title: string }
  | { type: "location"; latitude: number; longitude: number }
  | { type: "unsupported"; originalType: string };

export interface InboundMessageEvent {
  kind: "message";
  /** Meta's message ID ("wamid…"). Used to ignore duplicate deliveries. */
  providerEventId: string;
  from: PhoneE164;
  sentAt: Date;
  /** The business number it was sent to. */
  phoneNumberId: string;
  content: InboundContent;
  /** If this replies to one of our messages, that message's ID. */
  replyToProviderMessageId: string | null;
}

export interface StatusEvent {
  kind: "status";
  /** Unique per message and status, e.g. "wamid.X:delivered". */
  providerEventId: string;
  providerMessageId: string;
  status: ProviderStatus;
  at: Date;
  recipient: PhoneE164 | null;
  /** Our notification ID, echoed back from biz_opaque_callback_data. */
  notificationId: string | null;
  errors: Array<{ code: string; category: FailureCategory; detail: string }>;
}

export type InboundEvent = InboundMessageEvent | StatusEvent;

export interface ParsedWebhook {
  events: InboundEvent[];
  ignored: number;
}

type Obj = Record<string, unknown>;

function isObj(value: unknown): value is Obj {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function str(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function arr(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function epochSeconds(value: unknown): Date | null {
  const seconds = typeof value === "string" ? Number(value) : typeof value === "number" ? value : NaN;
  return Number.isFinite(seconds) && seconds > 0 ? new Date(seconds * 1000) : null;
}

function parseContent(message: Obj): InboundContent | null {
  const type = str(message.type);
  if (!type) return null;
  switch (type) {
    case "text": {
      const body = isObj(message.text) ? str(message.text.body) : null;
      return body === null ? null : { type: "text", text: body };
    }
    case "button": {
      // Tap on a template quick-reply button.
      if (!isObj(message.button)) return null;
      const payload = str(message.button.payload);
      return payload === null ? null : { type: "button", payload, title: str(message.button.text) ?? "" };
    }
    case "interactive": {
      // Tap on a reply button or list item in an interactive (non-template) message.
      if (!isObj(message.interactive)) return null;
      const reply = isObj(message.interactive.button_reply)
        ? message.interactive.button_reply
        : isObj(message.interactive.list_reply)
          ? message.interactive.list_reply
          : null;
      const id = reply ? str(reply.id) : null;
      return id === null || !reply ? null : { type: "button", payload: id, title: str(reply.title) ?? "" };
    }
    case "location": {
      if (!isObj(message.location)) return null;
      const { latitude, longitude } = message.location;
      if (typeof latitude !== "number" || typeof longitude !== "number") return null;
      if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;
      return { type: "location", latitude, longitude };
    }
    default:
      return { type: "unsupported", originalType: type };
  }
}

function parseMessage(message: unknown, phoneNumberId: string): InboundMessageEvent | null {
  if (!isObj(message)) return null;
  const id = str(message.id);
  const fromWaId = str(message.from);
  const from = fromWaId ? phoneFromWaId(fromWaId) : null;
  const sentAt = epochSeconds(message.timestamp);
  const content = parseContent(message);
  if (!id || !from || !sentAt || !content) return null;
  const context = isObj(message.context) ? str(message.context.id) : null;
  return {
    kind: "message",
    providerEventId: id,
    from,
    sentAt,
    phoneNumberId,
    content,
    replyToProviderMessageId: context,
  };
}

const PROVIDER_STATUSES: ReadonlySet<string> = new Set(["sent", "delivered", "read", "failed"]);

function parseStatus(status: unknown): StatusEvent | null {
  if (!isObj(status)) return null;
  const id = str(status.id);
  const value = str(status.status);
  const at = epochSeconds(status.timestamp);
  if (!id || !value || !PROVIDER_STATUSES.has(value) || !at) return null;
  const recipientWaId = str(status.recipient_id);
  const errors = arr(status.errors)
    .filter(isObj)
    .map((e) => {
      const code = typeof e.code === "number" ? e.code : null;
      const details = isObj(e.error_data) ? str(e.error_data.details) : null;
      return {
        code: code !== null ? String(code) : "unknown",
        category: classifyWhatsAppCode(code, null),
        detail: (details ?? str(e.title) ?? str(e.message) ?? "").slice(0, 300),
      };
    });
  return {
    kind: "status",
    providerEventId: `${id}:${value}`,
    providerMessageId: id,
    status: value as ProviderStatus,
    at,
    recipient: recipientWaId ? phoneFromWaId(recipientWaId) : null,
    notificationId: str(status.biz_opaque_callback_data),
    errors,
  };
}

export function parseWhatsAppWebhook(payload: unknown): ParsedWebhook {
  const events: InboundEvent[] = [];
  let ignored = 0;

  if (!isObj(payload) || payload.object !== "whatsapp_business_account") {
    return { events, ignored: 1 };
  }

  for (const entry of arr(payload.entry)) {
    if (!isObj(entry)) {
      ignored += 1;
      continue;
    }
    for (const change of arr(entry.changes)) {
      if (!isObj(change) || change.field !== "messages" || !isObj(change.value)) {
        ignored += 1;
        continue;
      }
      const value = change.value;
      const phoneNumberId = isObj(value.metadata) ? (str(value.metadata.phone_number_id) ?? "") : "";

      for (const message of arr(value.messages)) {
        const event = parseMessage(message, phoneNumberId);
        if (event) events.push(event);
        else ignored += 1;
      }
      for (const status of arr(value.statuses)) {
        const event = parseStatus(status);
        if (event) events.push(event);
        else ignored += 1;
      }
    }
  }
  return { events, ignored };
}
