/**
 * Message template catalogue.
 *
 * WhatsApp only lets a business start a conversation with a template that Meta
 * has approved in advance. This file is our source of truth for those
 * templates: their names, wording, parameters and buttons. The same text is
 * submitted to Meta (Track B) and is used to preview messages in development.
 *
 * Wording rules (from the engineering plan):
 *  - A missed check-in is never described as danger.
 *  - No promotional content (Meta would reclassify the template as marketing).
 */

export type TemplateCategory = "authentication" | "utility";

export interface TemplateDefinition {
  category: TemplateCategory;
  /** Body text with numbered placeholders {{1}}, {{2}}, … as Meta requires. */
  body: string;
  /** Human-readable names for each placeholder, in order. */
  params: readonly string[];
  /** Quick-reply button labels, in order. Each button sends back a payload. */
  quickReplies: readonly string[];
}

export const TEMPLATES = {
  login_code: {
    category: "authentication",
    body: "Your SafeReturn verification code is {{1}}. It expires in 5 minutes. Do not share it with anyone.",
    params: ["code"],
    quickReplies: [],
  },
  checkin_reminder: {
    category: "utility",
    body: "Hi {{1}}, you expected to arrive at {{2}} by {{3}}. Have you arrived safely?",
    params: ["first_name", "destination", "expected_time"],
    quickReplies: ["I'm safe", "Extend 15 min", "Need help"],
  },
  final_warning: {
    category: "utility",
    body: "Hi {{1}}, we haven't heard from you since your expected arrival at {{2}}. If you don't reply by {{3}}, we will let your trusted contacts know.",
    params: ["first_name", "destination", "alert_time"],
    quickReplies: ["I'm safe", "Extend 15 min", "Need help"],
  },
  contact_alert_missed: {
    category: "utility",
    body: "Your trusted contact {{1}} started a journey to {{2}} and expected to arrive by {{3}}, but has not yet confirmed they arrived. This does not necessarily mean something is wrong. Their phone may be off or out of data. Please try calling them on {{4}}.",
    params: ["user_name", "destination", "expected_time", "user_phone"],
    quickReplies: ["I've reached them", "Can't reach them"],
  },
  contact_alert_missed_unreached: {
    category: "utility",
    body: "Your trusted contact {{1}} started a journey to {{2}} and expected to arrive by {{3}}, but has not yet confirmed they arrived. Our reminder may not have reached them, and this does not necessarily mean something is wrong. Please try calling them on {{4}}.",
    params: ["user_name", "destination", "expected_time", "user_phone"],
    quickReplies: ["I've reached them", "Can't reach them"],
  },
  contact_alert_help: {
    category: "utility",
    body: "Your trusted contact {{1}} pressed \"Need help\" during a journey to {{2}}. Please call them now on {{3}}. If you believe they are in immediate danger, contact emergency services (112).",
    params: ["user_name", "destination", "user_phone"],
    quickReplies: ["I've reached them", "Can't reach them"],
  },
  contact_all_clear: {
    category: "utility",
    body: "Update: {{1}} has confirmed they are safe. Thank you for being a trusted contact.",
    params: ["user_name"],
    quickReplies: [],
  },
  contact_update: {
    category: "utility",
    body: "Update on {{1}}: {{2}}, another trusted contact, says they have reached them. They have not checked in with SafeReturn yet.",
    params: ["user_name", "reporting_contact_name"],
    quickReplies: [],
  },
  monitoring_ended: {
    category: "utility",
    body: "We have stopped monitoring {{1}}'s journey to {{2}}. They did not check in. Please continue trying to reach them directly.",
    params: ["user_name", "destination"],
    quickReplies: [],
  },
} as const satisfies Record<string, TemplateDefinition>;

export type TemplateName = keyof typeof TEMPLATES;

export const TEMPLATE_LANGUAGE = "en";

export class TemplateValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TemplateValidationError";
  }
}

/** Meta rejects parameters containing new lines, tabs or more than 4 consecutive spaces. */
const FORBIDDEN_PARAM_PATTERN = /[\n\t]| {5,}/;
const MAX_PARAM_LENGTH = 200;

export function isTemplateName(value: string): value is TemplateName {
  return Object.hasOwn(TEMPLATES, value);
}

/**
 * Checks parameters and button payloads against the template definition.
 * Throws TemplateValidationError so mistakes surface before anything is sent.
 */
export function validateTemplateArgs(
  name: TemplateName,
  params: readonly string[],
  buttonPayloads: readonly string[],
): void {
  const def: TemplateDefinition = TEMPLATES[name];
  if (params.length !== def.params.length) {
    throw new TemplateValidationError(
      `${name}: expected ${def.params.length} parameters (${def.params.join(", ")}), got ${params.length}`,
    );
  }
  params.forEach((value, i) => {
    if (value.trim() === "") {
      throw new TemplateValidationError(`${name}: parameter "${def.params[i]}" is empty`);
    }
    if (FORBIDDEN_PARAM_PATTERN.test(value)) {
      throw new TemplateValidationError(
        `${name}: parameter "${def.params[i]}" contains a new line, tab or too many spaces`,
      );
    }
    if (value.length > MAX_PARAM_LENGTH) {
      throw new TemplateValidationError(`${name}: parameter "${def.params[i]}" is too long`);
    }
  });
  if (buttonPayloads.length !== def.quickReplies.length) {
    throw new TemplateValidationError(
      `${name}: expected ${def.quickReplies.length} button payloads, got ${buttonPayloads.length}`,
    );
  }
  buttonPayloads.forEach((payload, i) => {
    if (payload.trim() === "" || payload.length > 256) {
      throw new TemplateValidationError(`${name}: button ${i + 1} payload is empty or too long`);
    }
  });
}

/** Fills the placeholders, e.g. for development previews and tests. */
export function renderTemplate(name: TemplateName, params: readonly string[]): string {
  const def: TemplateDefinition = TEMPLATES[name];
  return def.body.replace(/\{\{(\d+)\}\}/g, (match, index: string) => {
    const value = params[Number(index) - 1];
    return value ?? match;
  });
}
