# Security

Security goals for this project:

- Use server-side Multipass host settings, not browser-side shell access.
- Keep all host access secrets on the server.
- Encrypt optional host access secrets before storing them.
- Redact tokens, database passwords, encryption keys, and credential secrets from logs.
- Validate environment variables and request payloads with Zod.
- Enforce role-based access for `ADMIN`, `USER`, and `VIEWER`.
- Use safe audit messages that do not expose credentials.
- Add confirmations for destructive operations.
- Send security headers and a restrictive Content Security Policy.

## Phase 1 Controls

Phase 1 includes encrypted credential helpers, environment schemas, Prisma models for roles and audit logs, server-only Multipass module imports, and middleware security headers.

## Phase 1.5 Controls

Phase 1.5 preserves unavailable states for API-driven sections. It does not add fake Multipass data, does not move Multipass calls into browser components, and keeps all VM integration modules server-only.

## Production Notes

Do not commit `.env`, database dumps, host access secrets, screenshots containing secrets, or local Docker volumes.
