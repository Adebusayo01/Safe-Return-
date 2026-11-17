# notifications (Phase P1)

Everything about sending messages and tracking their delivery. Journey and
contact logic call this module; they never talk to WhatsApp directly.

## Built so far (no database needed)

| File | Purpose |
|---|---|
| `channels/channel.ts` | `MessageChannel` interface, `OutboundMessage`, `SendResult` (accepted / rejected / unknown) |
| `channels/fake-channel.ts` | Fake provider for development and tests, with simulated failures |
| `channels/whatsapp/cloud-channel.ts` | WhatsApp Cloud API adapter (tested against recorded responses, not live) |
| `channels/whatsapp/errors.ts` | Sorts WhatsApp error codes into transient / permanent / configuration |
| `channels/whatsapp/webhook-security.ts` | Webhook signature check and setup-challenge check |
| `channels/whatsapp/webhook-parser.ts` | Turns Meta webhook JSON into simple message and status events |
| `channels/create-channel.ts` | Picks the channel from `MESSAGE_CHANNEL`; refuses `fake` in production |
| `templates.ts` | Template catalogue (wording, parameters, buttons) and validation |
| `delivery-status.ts` | Delivery state machine and handling of out-of-order status reports |
| `retry-policy.ts` | Retry / give-up / dead decisions after a failed or unknown send |
| `phone.ts` | Nigerian number normalisation, E.164 checks, masking for logs |

## Waiting for Neon (not built)

- `notifications` and `notification_attempts` tables, and dedupe keys enforced by the database
- The persistent `jobs` queue and the sender that applies `retry-policy` decisions
- `POST/GET /api/webhooks/whatsapp`: storing and deduplicating events before processing
- The `/dev/inbox` page with simulated replies (it must read stored messages)

Until then, nothing in this module *stores* anything. It decides and sends;
persistence is added in the database layer without changing these files.
