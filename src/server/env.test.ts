import { afterEach, describe, expect, it, vi } from "vitest";

import { EnvConfigError, getMessagingConfig } from "./env";

afterEach(() => {
  vi.unstubAllEnvs();
});

function stub(vars: Record<string, string | undefined>) {
  for (const [key, value] of Object.entries(vars)) vi.stubEnv(key, value);
}

describe("getMessagingConfig", () => {
  it("defaults to the fake channel outside production", () => {
    stub({ VERCEL_ENV: "preview", MESSAGE_CHANNEL: undefined });
    expect(getMessagingConfig()).toEqual({ channel: "fake" });
  });

  it("refuses the fake channel in production", () => {
    stub({ VERCEL_ENV: "production", MESSAGE_CHANNEL: "fake" });
    expect(() => getMessagingConfig()).toThrow(EnvConfigError);
    expect(() => getMessagingConfig()).toThrow(/not allowed in production/);
  });

  it("requires an explicit choice in production", () => {
    stub({ VERCEL_ENV: "production", MESSAGE_CHANNEL: undefined });
    expect(() => getMessagingConfig()).toThrow(/must be set in production/);
  });

  it("requires WhatsApp credentials when WhatsApp is selected, without printing values", () => {
    stub({ VERCEL_ENV: "preview", MESSAGE_CHANNEL: "whatsapp", WHATSAPP_ACCESS_TOKEN: "secret-value", WHATSAPP_PHONE_NUMBER_ID: undefined });
    expect(() => getMessagingConfig()).toThrow(/WHATSAPP_PHONE_NUMBER_ID/);
    try {
      getMessagingConfig();
    } catch (error) {
      expect(String(error)).not.toContain("secret-value");
    }
  });

  it("builds the WhatsApp configuration", () => {
    stub({
      VERCEL_ENV: "production",
      MESSAGE_CHANNEL: "whatsapp",
      WHATSAPP_ACCESS_TOKEN: "t",
      WHATSAPP_PHONE_NUMBER_ID: "123",
      WHATSAPP_GRAPH_API_VERSION: undefined,
    });
    expect(getMessagingConfig()).toEqual({ channel: "whatsapp", accessToken: "t", phoneNumberId: "123", apiVersion: "v24.0" });
  });

  it("rejects unknown channels", () => {
    stub({ VERCEL_ENV: "preview", MESSAGE_CHANNEL: "sms" });
    expect(() => getMessagingConfig()).toThrow(/must be "fake" or "whatsapp"/);
  });
});
