import type { PhoneE164 } from "../phone";
import { TEMPLATE_LANGUAGE, validateTemplateArgs, type TemplateName } from "../templates";

/**
 * The MessageChannel interface: the "socket" every messaging provider plugs into.
 *
 * Journey and contact logic only ever asks a channel to send an
 * OutboundMessage. It never knows whether the message goes to WhatsApp, the
 * fake channel or (later) SMS. That is what lets us build and test everything
 * before Meta approves our account.
 */

export type ChannelName = "fake" | "whatsapp";

export interface OutboundMessage {
  /**
   * Our own notification ID. Providers echo it back (WhatsApp:
   * `biz_opaque_callback_data`) so a send with an unknown outcome can be matched
   * to later delivery reports.
   */
  notificationId: string;
  to: PhoneE164;
  template: TemplateName;
  language: string;
  /** Values for {{1}}, {{2}}, … in order. */
  params: readonly string[];
  /** One payload per quick-reply button, in button order. Returned when tapped. */
  buttonPayloads: readonly string[];
}

/**
 * How a failure should be handled:
 *  - transient: temporary (network, provider overload, rate limit). Retry later.
 *  - permanent: this recipient can't receive it (not on WhatsApp, blocked, opted out). Don't retry.
 *  - configuration: our setup is wrong (bad token, unapproved template). Don't retry; alert the developer.
 */
export type FailureCategory = "transient" | "permanent" | "configuration";

export interface ChannelFailure {
  category: FailureCategory;
  /** Provider error code, e.g. "131026", or "http_503". */
  code: string;
  /** Short explanation, safe to store. Never contains secrets or full phone numbers. */
  detail: string;
  /** Minimum wait the provider asked for, if any. */
  retryAfterMs?: number;
}

/**
 * The result of one send attempt:
 *  - accepted: the provider took the message (not yet "delivered").
 *  - rejected: the provider refused it, with a reason.
 *  - unknown:  we can't tell (e.g. timeout after sending). The message may or
 *              may not have been sent. Handled carefully to avoid duplicates.
 */
export type SendResult =
  | { outcome: "accepted"; providerMessageId: string }
  | { outcome: "rejected"; failure: ChannelFailure }
  | { outcome: "unknown"; reason: string };

export interface MessageChannel {
  readonly name: ChannelName;
  send(message: OutboundMessage): Promise<SendResult>;
}

/** Builds an OutboundMessage after validating it against the template catalogue. */
export function buildOutboundMessage(input: {
  notificationId: string;
  to: PhoneE164;
  template: TemplateName;
  params: readonly string[];
  buttonPayloads?: readonly string[];
}): OutboundMessage {
  const buttonPayloads = input.buttonPayloads ?? [];
  validateTemplateArgs(input.template, input.params, buttonPayloads);
  return {
    notificationId: input.notificationId,
    to: input.to,
    template: input.template,
    language: TEMPLATE_LANGUAGE,
    params: [...input.params],
    buttonPayloads: [...buttonPayloads],
  };
}
