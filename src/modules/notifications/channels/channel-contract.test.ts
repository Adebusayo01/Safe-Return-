import { describe, expect, it } from "vitest";

import { FakeClock } from "@/lib/clock";

import { parseE164 } from "../phone";
import { buildOutboundMessage, type MessageChannel } from "./channel";
import { FakeMessageChannel, MemoryFakeSink } from "./fake-channel";
import { WhatsAppCloudChannel } from "./whatsapp/cloud-channel";

/**
 * Contract tests: every MessageChannel implementation must behave the same way
 * from the caller's point of view. Add new channels (e.g. SMS) to this list.
 */
const message = buildOutboundMessage({
  notificationId: "ntf_contract",
  to: parseE164("+2348031234567")!,
  template: "contact_all_clear",
  params: ["Ada"],
});

const implementations: Array<[string, () => MessageChannel]> = [
  ["fake", () => new FakeMessageChannel({ sink: new MemoryFakeSink(), clock: new FakeClock() })],
  [
    "whatsapp (recorded response)",
    () =>
      new WhatsAppCloudChannel({ accessToken: "test-token", phoneNumberId: "123", apiVersion: "v24.0" }, async () =>
        Response.json({ messaging_product: "whatsapp", messages: [{ id: "wamid.contract" }] }),
      ),
  ],
];

describe.each(implementations)("MessageChannel contract: %s", (_name, create) => {
  it("returns an accepted result with a provider message ID", async () => {
    const result = await create().send(message);
    expect(result.outcome).toBe("accepted");
    if (result.outcome === "accepted") expect(result.providerMessageId.length).toBeGreaterThan(0);
  });

  it("has a known channel name", () => {
    expect(["fake", "whatsapp"]).toContain(create().name);
  });
});
