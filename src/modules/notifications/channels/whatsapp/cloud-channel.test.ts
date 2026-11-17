import { describe, expect, it } from "vitest";

import { parseE164 } from "../../phone";
import { buildOutboundMessage } from "../channel";
import { WhatsAppCloudChannel, buildTemplateRequest } from "./cloud-channel";

const message = buildOutboundMessage({
  notificationId: "ntf_42",
  to: parseE164("+2348031234567")!,
  template: "checkin_reminder",
  params: ["Ada", "Yaba", "6:00 pm"],
  buttonPayloads: ["safe:j1", "extend:j1", "help:j1"],
});

const config = { accessToken: "test-token", phoneNumberId: "1098765", apiVersion: "v24.0" };

function channelReturning(response: Response | Error) {
  const calls: Array<{ url: string; init: RequestInit }> = [];
  const channel = new WhatsAppCloudChannel(config, async (url, init) => {
    calls.push({ url, init });
    if (response instanceof Error) throw response;
    return response;
  });
  return { channel, calls };
}

describe("buildTemplateRequest", () => {
  it("produces the Graph API template message body", () => {
    expect(buildTemplateRequest(message)).toEqual({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: "2348031234567",
      type: "template",
      template: {
        name: "checkin_reminder",
        language: { code: "en" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: "Ada" },
              { type: "text", text: "Yaba" },
              { type: "text", text: "6:00 pm" },
            ],
          },
          { type: "button", sub_type: "quick_reply", index: "0", parameters: [{ type: "payload", payload: "safe:j1" }] },
          { type: "button", sub_type: "quick_reply", index: "1", parameters: [{ type: "payload", payload: "extend:j1" }] },
          { type: "button", sub_type: "quick_reply", index: "2", parameters: [{ type: "payload", payload: "help:j1" }] },
        ],
      },
      biz_opaque_callback_data: "ntf_42",
    });
  });
});

describe("WhatsAppCloudChannel", () => {
  it("posts to the phone number's messages endpoint with the access token", async () => {
    const { channel, calls } = channelReturning(Response.json({ messages: [{ id: "wamid.ABC" }] }));
    const result = await channel.send(message);

    expect(result).toEqual({ outcome: "accepted", providerMessageId: "wamid.ABC" });
    expect(calls[0].url).toBe("https://graph.facebook.com/v24.0/1098765/messages");
    expect(calls[0].init.method).toBe("POST");
    expect((calls[0].init.headers as Record<string, string>).Authorization).toBe("Bearer test-token");
  });

  it.each([
    [400, 131026, "permanent"],
    [400, 132001, "configuration"],
    [401, 190, "configuration"],
    [429, 130429, "transient"],
    [400, 131047, "configuration"],
  ])("HTTP %i with error %i is %s", async (status, code, category) => {
    const { channel } = channelReturning(
      Response.json({ error: { code, message: "Meta error", error_data: { details: "more info" } } }, { status }),
    );
    expect(await channel.send(message)).toEqual({
      outcome: "rejected",
      failure: { category, code: String(code), detail: "Meta error (more info)" },
    });
  });

  it("treats server errors without a body as transient and honours Retry-After", async () => {
    const { channel } = channelReturning(new Response("oops", { status: 503, headers: { "Retry-After": "120" } }));
    expect(await channel.send(message)).toEqual({
      outcome: "rejected",
      failure: { category: "transient", code: "http_503", detail: "HTTP 503", retryAfterMs: 120_000 },
    });
  });

  it("reports an unknown outcome, not a failure, on timeout or network error", async () => {
    const timeout = Object.assign(new Error("timed out"), { name: "TimeoutError" });
    expect(await channelReturning(timeout).channel.send(message)).toEqual({ outcome: "unknown", reason: "timeout" });
    expect(await channelReturning(new TypeError("fetch failed")).channel.send(message)).toEqual({
      outcome: "unknown",
      reason: "network_error",
    });
  });

  it("reports unknown if a success response has no message ID", async () => {
    const { channel } = channelReturning(Response.json({ messages: [] }));
    expect(await channel.send(message)).toMatchObject({ outcome: "unknown" });
  });
});
