import { describe, expect, it } from "vitest";

import { maskPhone, normalizeNigerianMobile, parseE164, phoneFromWaId, toWaRecipient } from "./phone";

describe("normalizeNigerianMobile", () => {
  it.each([
    ["08031234567", "+2348031234567"],
    ["0803 123 4567", "+2348031234567"],
    ["0803-123-4567", "+2348031234567"],
    ["+234 803 123 4567", "+2348031234567"],
    ["2348031234567", "+2348031234567"],
    ["002348031234567", "+2348031234567"],
    ["+234 (0)803 123 4567", "+2348031234567"],
    ["07011112222", "+2347011112222"],
    ["09011112222", "+2349011112222"],
  ])("accepts %s", (input, expected) => {
    expect(normalizeNigerianMobile(input)).toBe(expected);
  });

  it.each([
    "",
    "0803123456", // too short
    "080312345678", // too long
    "01234567890", // landline-style prefix
    "+447911123456", // not Nigerian
    "0803abc4567",
    "8031234567", // missing leading 0 is ambiguous
  ])("rejects %s", (input) => {
    expect(normalizeNigerianMobile(input)).toBeNull();
  });
});

describe("E.164 helpers", () => {
  it("parses valid international numbers and rejects others", () => {
    expect(parseE164(" +2348031234567 ")).toBe("+2348031234567");
    expect(parseE164("2348031234567")).toBeNull();
    expect(parseE164("+0123")).toBeNull();
  });

  it("converts between WhatsApp wa_id and E.164", () => {
    const phone = phoneFromWaId("2348031234567");
    expect(phone).toBe("+2348031234567");
    expect(toWaRecipient(phone!)).toBe("2348031234567");
    expect(phoneFromWaId("+2348031234567")).toBeNull();
  });

  it("masks numbers for logs", () => {
    expect(maskPhone("+2348031234567")).toBe("+234******4567");
    expect(maskPhone("+123")).toBe("****");
  });
});
