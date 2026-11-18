import { describe, expect, it } from "vitest";

import { TEMPLATES, TemplateValidationError, isTemplateName, renderTemplate, validateTemplateArgs } from "./templates";

const ALL = Object.entries(TEMPLATES);

describe("template catalogue", () => {
  it.each(ALL)("%s has placeholders numbered 1..n matching its params", (_name, def) => {
    const numbers = [...def.body.matchAll(/\{\{(\d+)\}\}/g)].map((m) => Number(m[1]));
    const distinct = [...new Set(numbers)].sort((a, b) => a - b);
    expect(distinct).toEqual(def.params.map((_, i) => i + 1));
    // Meta requires each placeholder to be used once, and not at the very start or end.
    expect(numbers.length).toBe(distinct.length);
    expect(def.body.startsWith("{{")).toBe(false);
    expect(def.body.trimEnd().endsWith("}}")).toBe(false);
  });

  it.each(ALL)("%s has at most 3 quick replies of up to 25 characters", (_name, def) => {
    expect(def.quickReplies.length).toBeLessThanOrEqual(3);
    for (const label of def.quickReplies) expect(label.length).toBeLessThanOrEqual(25);
  });

  it("never describes a missed check-in as danger", () => {
    for (const name of ["contact_alert_missed", "contact_alert_missed_unreached"] as const) {
      const body = TEMPLATES[name].body.toLowerCase();
      expect(body).toContain("does not necessarily mean");
      expect(body).not.toMatch(/\b(danger|emergency|missing|kidnap)/);
    }
  });

  it("keeps help alerts distinct and points to emergency services", () => {
    expect(TEMPLATES.contact_alert_help.body).toContain("112");
  });

  it("the contact update reports what a contact said, not that the user is safe", () => {
    const body = TEMPLATES.contact_update.body.toLowerCase();
    expect(body).toContain("says");
    expect(body).not.toContain("is safe");
  });
});

describe("validateTemplateArgs", () => {
  it("accepts correct arguments", () => {
    expect(() =>
      validateTemplateArgs("checkin_reminder", ["Ada", "Yaba", "6:00 pm"], ["safe:j1", "extend:j1", "help:j1"]),
    ).not.toThrow();
  });

  it.each([
    [["Ada", "Yaba"], ["a", "b", "c"], /expected 3 parameters/],
    [["Ada", "", "6:00 pm"], ["a", "b", "c"], /is empty/],
    [["Ada", "Yaba\nLagos", "6:00 pm"], ["a", "b", "c"], /new line/],
    [["Ada", "Yaba", "6:00 pm"], ["a", "b"], /expected 3 button payloads/],
    [["Ada", "Yaba", "x".repeat(201)], ["a", "b", "c"], /too long/],
  ])("rejects bad arguments %#", (params, buttons, message) => {
    expect(() => validateTemplateArgs("checkin_reminder", params, buttons)).toThrow(TemplateValidationError);
    expect(() => validateTemplateArgs("checkin_reminder", params, buttons)).toThrow(message);
  });
});

describe("renderTemplate", () => {
  it("fills placeholders", () => {
    expect(renderTemplate("checkin_reminder", ["Ada", "Yaba", "6:00 pm"])).toBe(
      "Hi Ada, you expected to arrive at Yaba by 6:00 pm. Have you arrived safely?",
    );
  });

  it("recognises template names", () => {
    expect(isTemplateName("login_code")).toBe(true);
    expect(isTemplateName("toString")).toBe(false);
  });
});
