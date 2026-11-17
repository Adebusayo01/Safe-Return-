# auth (Phase P2)

Phone number + one-time code login. Codes are sent through a pluggable
`OtpDelivery` adapter (dev inbox, test capture, WhatsApp template), so login can
be tested without live WhatsApp delivery. Sessions use HttpOnly cookies whose
tokens are stored only as hashes.

Not implemented yet.
