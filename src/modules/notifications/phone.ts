/**
 * Phone numbers are always stored and passed around in E.164 format
 * ("+" + country code + number, e.g. +2348031234567).
 *
 * `PhoneE164` is a "branded" string: TypeScript only accepts a value that has
 * passed through one of the functions below, so an unchecked number cannot
 * reach a message channel by accident.
 */
declare const phoneE164Brand: unique symbol;
export type PhoneE164 = string & { readonly [phoneE164Brand]: true };

const E164_PATTERN = /^\+[1-9]\d{7,14}$/;

/** Nigerian mobile numbers: +234 followed by 7, 8 or 9 and nine more digits. */
const NIGERIAN_MOBILE_PATTERN = /^\+234[789]\d{9}$/;

export function isE164(value: string): value is PhoneE164 {
  return E164_PATTERN.test(value);
}

/** Validates an already-international number. Returns null if invalid. */
export function parseE164(value: string): PhoneE164 | null {
  const trimmed = value.trim();
  return isE164(trimmed) ? trimmed : null;
}

/**
 * Accepts the ways Nigerians commonly type a mobile number and converts it to
 * E.164. Returns null if it is not a valid Nigerian mobile number.
 *
 *   "0803 123 4567"     -> "+2348031234567"
 *   "+234 803 123 4567" -> "+2348031234567"
 *   "2348031234567"     -> "+2348031234567"
 *   "+234 (0)803..."    -> "+2348031234567"
 */
export function normalizeNigerianMobile(input: string): PhoneE164 | null {
  const compact = input.trim().replace(/[\s\-().]/g, "");
  let digits: string;
  if (compact.startsWith("+")) {
    digits = compact.slice(1);
  } else if (compact.startsWith("00")) {
    digits = compact.slice(2);
  } else {
    digits = compact;
  }
  if (!/^\d+$/.test(digits)) return null;

  let candidate: string;
  if (digits.startsWith("2340")) {
    candidate = `+234${digits.slice(4)}`; // "+234 (0)803..." style
  } else if (digits.startsWith("234")) {
    candidate = `+${digits}`;
  } else if (digits.startsWith("0") && digits.length === 11) {
    candidate = `+234${digits.slice(1)}`;
  } else {
    return null;
  }
  return NIGERIAN_MOBILE_PATTERN.test(candidate) ? (candidate as PhoneE164) : null;
}

/** WhatsApp identifies people by "wa_id": the number's digits without "+". */
export function phoneFromWaId(waId: string): PhoneE164 | null {
  return /^\d+$/.test(waId) ? parseE164(`+${waId}`) : null;
}

export function toWaRecipient(phone: PhoneE164): string {
  return phone.slice(1);
}

/** For logs: "+234******4567". Never log full phone numbers. */
export function maskPhone(phone: string): string {
  if (phone.length <= 8) return "****";
  return `${phone.slice(0, 4)}${"*".repeat(phone.length - 8)}${phone.slice(-4)}`;
}
