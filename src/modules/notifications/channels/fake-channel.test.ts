import { describe, expect, it } from "vitest";

import { FakeClock } from "@/lib/clock";

import { parseE164 } from "../phone";
import { TemplateValidationError } from "../templates";
import { buildOutboundMessage } from "./channel";
import { FakeMessageChannel, MemoryFakeSink, SIMULATED_NUMBERS } from "./fake-channel";

function setup() {
  const sink = new MemoryFakeSink();
  const clock = new FakeClock("2026-03-01T17:00:00Z");
  let n = 0;
  const channel = new FakeMessageChannel({ sink, clock, generateId: () => `fake.${++n}` });
  return { sink, clock, channel };
}

const ada = parseE164("+2348031234567")!;

function reminderTo(to = ada) {
  return buildOutboundMessage({
    notificationId: "ntf_1",
    to,
    template: "checkin_reminder",
    params: ["Ada", "Yaba", "6:00 pm"],
    buttonPayloads: ["safe:j1", "extend:j1", "help:j1"],
  });
}

describe("FakeMessageChannel", () => {
  it("records an accepted message with the text the recipient would read", async () => {
    const { sink, channel } = setup();
    const result = await channel.send(reminderTo());

    expect(result).toEqual({ outcome: "accepted", providerMessageId: "fake.1" });
    expect(sink.entries).toHaveLength(1);
    expect(sink.entries[0]).toMatchObject({
      providerMessageId: "fake.1",
      renderedText: "Hi Ada, you expected to arrive at Yaba by 6:00 pm. Have you arrived safely?",
      acceptedAt: new Date("2026-03-01T17:00:00Z"),
    });
    expect(sink.to(ada)).toHaveLength(1);
  });

  it("simulates a recipient who is not on WhatsApp (permanent failure, nothing recorded)", async () => {
    const { sink, channel } = setup();
    const result = await channel.send(reminderTo(parseE164(SIMULATED_NUMBERS.notOnWhatsApp)!));
    expect(result).toMatchObject({ outcome: "rejected", failure: { category: "permanent", code: "131026" } });
    expect(sink.entries).toHaveLength(0);
  });

  it("simulates temporary outages, unknown outcomes and configuration errors", async () => {
    const { channel } = setup();
    const send = (n: string) => channel.send(reminderTo(parseE164(n)!));
    expect(await send(SIMULATED_NUMBERS.temporaryOutage)).toMatchObject({ failure: { category: "transient" } });
    expect(await send(SIMULATED_NUMBERS.unknownOutcome)).toMatchObject({ outcome: "unknown" });
    expect(await send(SIMULATED_NUMBERS.configurationError)).toMatchObject({ failure: { category: "configuration" } });
  });

  it("can be scripted to fail then succeed, to exercise retries", async () => {
    const { sink, channel } = setup();
    channel.scriptNext({ outcome: "rejected", failure: { category: "transient", code: "130429", detail: "rate limited" } });

    expect((await channel.send(reminderTo())).outcome).toBe("rejected");
    expect((await channel.send(reminderTo())).outcome).toBe("accepted");
    expect(channel.sendAttempts).toBe(2);
    expect(sink.entries).toHaveLength(1);
  });

  it("refuses to build a message that does not match its template", () => {
    expect(() =>
      buildOutboundMessage({ notificationId: "x", to: ada, template: "checkin_reminder", params: ["Ada"] }),
    ).toThrow(TemplateValidationError);
  });
});
