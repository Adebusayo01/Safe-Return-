import "server-only";

import { getMessagingConfig, type MessagingConfig } from "@/server/env";

import type { MessageChannel } from "./channel";
import { ConsoleFakeSink, FakeMessageChannel, type FakeMessageSink } from "./fake-channel";
import { WhatsAppCloudChannel } from "./whatsapp/cloud-channel";

/**
 * Picks the message channel for this environment (see getMessagingConfig for
 * the safety rules). Code that sends messages calls this instead of creating a
 * channel itself, so the choice is made in exactly one place.
 */
export function createMessageChannel(
  config: MessagingConfig = getMessagingConfig(),
  options: { fakeSink?: FakeMessageSink } = {},
): MessageChannel {
  switch (config.channel) {
    case "fake":
      return new FakeMessageChannel({ sink: options.fakeSink ?? new ConsoleFakeSink() });
    case "whatsapp":
      return new WhatsAppCloudChannel({
        accessToken: config.accessToken,
        phoneNumberId: config.phoneNumberId,
        apiVersion: config.apiVersion,
      });
  }
}
