import { systemClock, type Clock } from "@/lib/clock";

import { maskPhone } from "../phone";
import { renderTemplate } from "../templates";
import type { MessageChannel, OutboundMessage, SendResult } from "./channel";

/**
 * FakeMessageChannel: a pretend messaging provider for development and tests.
 *
 * It never contacts WhatsApp. It records what *would* have been sent and can
 * imitate WhatsApp's failure modes on purpose, so retry and failure handling
 * can be tested.
 *
 * IMPORTANT: the fake channel does not store anything permanently. Where its
 * records end up depends on the "sink" you give it:
 *  - MemoryFakeSink: kept in memory for automated tests. Lost when the process ends.
 *  - ConsoleFakeSink: printed to the server terminal during development.
 * The persistent development inbox (/dev/inbox) needs the Neon database and is
 * NOT built yet.
 */

export interface FakeSentMessage {
  providerMessageId: string;
  message: OutboundMessage;
  /** The template with its placeholders filled in, as the recipient would read it. */
  renderedText: string;
  acceptedAt: Date;
}

export interface FakeMessageSink {
  record(entry: FakeSentMessage): void | Promise<void>;
}

/** Test-only sink. Holds records in memory; they vanish when the process ends. */
export class MemoryFakeSink implements FakeMessageSink {
  readonly entries: FakeSentMessage[] = [];

  record(entry: FakeSentMessage): void {
    this.entries.push(entry);
  }

  /** Messages sent to one number, oldest first. */
  to(phone: string): FakeSentMessage[] {
    return this.entries.filter((e) => e.message.to === phone);
  }

  clear(): void {
    this.entries.length = 0;
  }
}

/** Development sink: prints each message to the terminal (number masked). */
export class ConsoleFakeSink implements FakeMessageSink {
  record(entry: FakeSentMessage): void {
    console.info(
      `[fake-channel] ${entry.message.template} -> ${maskPhone(entry.message.to)}\n  ${entry.renderedText}` +
        (entry.message.buttonPayloads.length ? `\n  buttons: ${entry.message.buttonPayloads.join(" | ")}` : ""),
    );
  }
}

/**
 * Reserved numbers that always behave in a particular way, so failure paths
 * can be exercised by hand during development. +234 800 000 00xx is not a
 * real-world mobile range we will ever message.
 */
export const SIMULATED_NUMBERS = {
  notOnWhatsApp: "+2348000000001",
  temporaryOutage: "+2348000000002",
  unknownOutcome: "+2348000000003",
  configurationError: "+2348000000004",
} as const;

function builtInBehaviour(message: OutboundMessage): SendResult | undefined {
  switch (message.to as string) {
    case SIMULATED_NUMBERS.notOnWhatsApp:
      return {
        outcome: "rejected",
        failure: { category: "permanent", code: "131026", detail: "Simulated: recipient not on WhatsApp" },
      };
    case SIMULATED_NUMBERS.temporaryOutage:
      return {
        outcome: "rejected",
        failure: { category: "transient", code: "http_503", detail: "Simulated: provider unavailable" },
      };
    case SIMULATED_NUMBERS.unknownOutcome:
      return { outcome: "unknown", reason: "Simulated: timeout after sending" };
    case SIMULATED_NUMBERS.configurationError:
      return {
        outcome: "rejected",
        failure: { category: "configuration", code: "132001", detail: "Simulated: template does not exist" },
      };
    default:
      return undefined;
  }
}

export interface FakeChannelOptions {
  sink: FakeMessageSink;
  clock?: Clock;
  /** Generates provider message IDs. Tests can pass a predictable one. */
  generateId?: () => string;
}

export class FakeMessageChannel implements MessageChannel {
  readonly name = "fake" as const;

  private readonly sink: FakeMessageSink;
  private readonly clock: Clock;
  private readonly generateId: () => string;
  private readonly scripted: SendResult[] = [];
  private attempts = 0;

  constructor(options: FakeChannelOptions) {
    this.sink = options.sink;
    this.clock = options.clock ?? systemClock;
    this.generateId = options.generateId ?? (() => `fake.${crypto.randomUUID()}`);
  }

  /** Makes the next send(s) return these results, in order, whatever the number. */
  scriptNext(...results: SendResult[]): void {
    this.scripted.push(...results);
  }

  /** Total send() calls, including failed ones. */
  get sendAttempts(): number {
    return this.attempts;
  }

  async send(message: OutboundMessage): Promise<SendResult> {
    this.attempts += 1;
    const forced = this.scripted.shift() ?? builtInBehaviour(message);
    if (forced && forced.outcome !== "accepted") return forced;

    const providerMessageId = forced?.providerMessageId ?? this.generateId();
    await this.sink.record({
      providerMessageId,
      message,
      renderedText: renderTemplate(message.template, message.params),
      acceptedAt: this.clock.now(),
    });
    return { outcome: "accepted", providerMessageId };
  }
}
