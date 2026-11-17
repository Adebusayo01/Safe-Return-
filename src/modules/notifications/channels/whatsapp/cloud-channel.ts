import "server-only";

import { toWaRecipient } from "../../phone";
import type { MessageChannel, OutboundMessage, SendResult } from "../channel";
import { classifySendError } from "./errors";

/**
 * WhatsApp Business Cloud API adapter.
 *
 * Sends template messages through Meta's Graph API:
 *   POST https://graph.facebook.com/{version}/{phone-number-id}/messages
 *
 * It is not connected to a live account yet. Tests run it against recorded
 * responses, and it is only used when MESSAGE_CHANNEL=whatsapp and credentials
 * are configured (Track B / P8).
 */

export interface WhatsAppCloudConfig {
  accessToken: string;
  phoneNumberId: string;
  /** Graph API version, e.g. "v24.0". */
  apiVersion: string;
  /** Give up waiting after this long. Default 10 seconds. */
  timeoutMs?: number;
  baseUrl?: string;
}

type FetchLike = (input: string, init: RequestInit) => Promise<Response>;

interface TemplateComponent {
  type: "body" | "button";
  sub_type?: "quick_reply";
  index?: string;
  parameters: Array<{ type: "text"; text: string } | { type: "payload"; payload: string }>;
}

/** Builds the JSON body Meta expects for a template message. */
export function buildTemplateRequest(message: OutboundMessage): Record<string, unknown> {
  const components: TemplateComponent[] = [];
  if (message.params.length > 0) {
    components.push({ type: "body", parameters: message.params.map((text) => ({ type: "text", text })) });
  }
  message.buttonPayloads.forEach((payload, index) => {
    components.push({
      type: "button",
      sub_type: "quick_reply",
      index: String(index),
      parameters: [{ type: "payload", payload }],
    });
  });
  return {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: toWaRecipient(message.to),
    type: "template",
    template: { name: message.template, language: { code: message.language }, components },
    // Echoed back in status webhooks so an "unknown" send can be reconciled.
    biz_opaque_callback_data: message.notificationId,
  };
}

export class WhatsAppCloudChannel implements MessageChannel {
  readonly name = "whatsapp" as const;

  private readonly fetchImpl: FetchLike;

  constructor(
    private readonly config: WhatsAppCloudConfig,
    fetchImpl?: FetchLike,
  ) {
    this.fetchImpl = fetchImpl ?? ((input, init) => fetch(input, init));
  }

  async send(message: OutboundMessage): Promise<SendResult> {
    const base = this.config.baseUrl ?? "https://graph.facebook.com";
    const url = `${base}/${this.config.apiVersion}/${encodeURIComponent(this.config.phoneNumberId)}/messages`;

    let response: Response;
    try {
      response = await this.fetchImpl(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buildTemplateRequest(message)),
        signal: AbortSignal.timeout(this.config.timeoutMs ?? 10_000),
      });
    } catch (error) {
      // We can't tell whether Meta received the request before the connection
      // failed, so the outcome is "unknown", not "failed".
      const reason = error instanceof Error && error.name === "TimeoutError" ? "timeout" : "network_error";
      return { outcome: "unknown", reason };
    }

    let body: unknown = null;
    try {
      body = await response.json();
    } catch {
      body = null;
    }

    if (response.ok) {
      const id = (body as { messages?: Array<{ id?: unknown }> } | null)?.messages?.[0]?.id;
      if (typeof id === "string" && id.length > 0) return { outcome: "accepted", providerMessageId: id };
      return { outcome: "unknown", reason: "success_response_without_message_id" };
    }

    return {
      outcome: "rejected",
      failure: classifySendError(response.status, body, response.headers.get("retry-after")),
    };
  }
}
