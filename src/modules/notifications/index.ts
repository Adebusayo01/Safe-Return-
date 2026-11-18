/**
 * Public API of the notifications module. Other modules import from here,
 * never from the internal files.
 *
 * Server-only pieces (WhatsApp adapter, webhook security, channel factory) are
 * imported from their own files so they can't end up in browser code.
 */
export * from "./phone";
export * from "./templates";
export * from "./delivery-status";
export * from "./retry-policy";
export * from "./channels/channel";
export * from "./channels/fake-channel";
export { parseWhatsAppWebhook } from "./channels/whatsapp/webhook-parser";
export type { InboundEvent, InboundMessageEvent, StatusEvent, InboundContent } from "./channels/whatsapp/webhook-parser";
