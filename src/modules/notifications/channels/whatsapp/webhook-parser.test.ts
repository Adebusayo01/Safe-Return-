import { describe, expect, it } from "vitest";

import { parseWhatsAppWebhook } from "./webhook-parser";

/** Builds a webhook body shaped like Meta's "messages" field payloads. */
function webhook(value: Record<string, unknown>) {
  return {
    object: "whatsapp_business_account",
    entry: [
      {
        id: "WABA_ID",
        changes: [
          {
            field: "messages",
            value: {
              messaging_product: "whatsapp",
              metadata: { display_phone_number: "2348000000000", phone_number_id: "PHONE_ID" },
              ...value,
            },
          },
        ],
      },
    ],
  };
}

const base = { from: "2348031234567", timestamp: "1767290400" }; // 2026-01-01T18:00:00Z

describe("parseWhatsAppWebhook: messages", () => {
  it("parses a text message", () => {
    const parsed = parseWhatsAppWebhook(
      webhook({
        contacts: [{ profile: { name: "Ada" }, wa_id: "2348031234567" }],
        messages: [{ ...base, id: "wamid.T1", type: "text", text: { body: "SAFE" } }],
      }),
    );
    expect(parsed).toEqual({
      ignored: 0,
      events: [
        {
          kind: "message",
          providerEventId: "wamid.T1",
          from: "+2348031234567",
          sentAt: new Date("2026-01-01T18:00:00Z"),
          phoneNumberId: "PHONE_ID",
          content: { type: "text", text: "SAFE" },
          replyToProviderMessageId: null,
        },
      ],
    });
  });

  it("parses a template quick-reply tap, including the message it replies to", () => {
    const parsed = parseWhatsAppWebhook(
      webhook({
        messages: [
          {
            ...base,
            id: "wamid.B1",
            type: "button",
            context: { from: "2348000000000", id: "wamid.REMINDER" },
            button: { payload: "safe:j1", text: "I'm safe" },
          },
        ],
      }),
    );
    expect(parsed.events[0]).toMatchObject({
      content: { type: "button", payload: "safe:j1", title: "I'm safe" },
      replyToProviderMessageId: "wamid.REMINDER",
    });
  });

  it("parses interactive reply buttons the same way", () => {
    const parsed = parseWhatsAppWebhook(
      webhook({
        messages: [
          {
            ...base,
            id: "wamid.I1",
            type: "interactive",
            interactive: { type: "button_reply", button_reply: { id: "accept:c9", title: "Accept" } },
          },
        ],
      }),
    );
    expect(parsed.events[0]).toMatchObject({ content: { type: "button", payload: "accept:c9", title: "Accept" } });
  });

  it("parses a location pin and rejects impossible coordinates", () => {
    const ok = parseWhatsAppWebhook(
      webhook({ messages: [{ ...base, id: "wamid.L1", type: "location", location: { latitude: 6.5, longitude: 3.37 } }] }),
    );
    expect(ok.events[0]).toMatchObject({ content: { type: "location", latitude: 6.5, longitude: 3.37 } });

    const bad = parseWhatsAppWebhook(
      webhook({ messages: [{ ...base, id: "wamid.L2", type: "location", location: { latitude: 200, longitude: 3 } }] }),
    );
    expect(bad).toEqual({ events: [], ignored: 1 });
  });

  it("marks other message types as unsupported instead of failing", () => {
    const parsed = parseWhatsAppWebhook(webhook({ messages: [{ ...base, id: "wamid.A1", type: "audio", audio: {} }] }));
    expect(parsed.events[0]).toMatchObject({ content: { type: "unsupported", originalType: "audio" } });
  });
});

describe("parseWhatsAppWebhook: statuses", () => {
  it("parses delivery reports with our notification ID", () => {
    const parsed = parseWhatsAppWebhook(
      webhook({
        statuses: [
          {
            id: "wamid.OUT1",
            status: "delivered",
            timestamp: "1767290460",
            recipient_id: "2348031234567",
            biz_opaque_callback_data: "ntf_42",
          },
        ],
      }),
    );
    expect(parsed.events).toEqual([
      {
        kind: "status",
        providerEventId: "wamid.OUT1:delivered",
        providerMessageId: "wamid.OUT1",
        status: "delivered",
        at: new Date("2026-01-01T18:01:00Z"),
        recipient: "+2348031234567",
        notificationId: "ntf_42",
        errors: [],
      },
    ]);
  });

  it("classifies errors on failed statuses", () => {
    const parsed = parseWhatsAppWebhook(
      webhook({
        statuses: [
          {
            id: "wamid.OUT2",
            status: "failed",
            timestamp: "1767290460",
            recipient_id: "2348031234567",
            errors: [{ code: 131026, title: "Message undeliverable", error_data: { details: "Not on WhatsApp" } }],
          },
        ],
      }),
    );
    expect(parsed.events[0]).toMatchObject({
      status: "failed",
      errors: [{ code: "131026", category: "permanent", detail: "Not on WhatsApp" }],
    });
  });
});

describe("parseWhatsAppWebhook: untrusted input", () => {
  it.each([null, "text", 42, [], {}, { object: "page", entry: [] }])("ignores non-WhatsApp payload %#", (payload) => {
    expect(parseWhatsAppWebhook(payload)).toEqual({ events: [], ignored: 1 });
  });

  it("skips malformed items but keeps valid ones", () => {
    const parsed = parseWhatsAppWebhook(
      webhook({
        messages: [
          { id: "wamid.no-from", type: "text", text: { body: "x" }, timestamp: "1767290400" },
          { ...base, id: "wamid.ok", type: "text", text: { body: "hi" } },
          { ...base, from: "not-a-number", id: "wamid.bad-from", type: "text", text: { body: "x" } },
        ],
        statuses: [{ id: "wamid.S", status: "exploded", timestamp: "1767290400" }],
      }),
    );
    expect(parsed.events.map((e) => e.providerEventId)).toEqual(["wamid.ok"]);
    expect(parsed.ignored).toBe(3);
  });

  it("ignores changes for other webhook fields", () => {
    const payload = { object: "whatsapp_business_account", entry: [{ changes: [{ field: "account_update", value: {} }] }] };
    expect(parseWhatsAppWebhook(payload)).toEqual({ events: [], ignored: 1 });
  });
});
