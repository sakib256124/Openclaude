# Security

Security goals for this project:

- Use Keystone application credentials, not OpenStack user passwords.
- Keep all OpenStack secrets on the server.
- Encrypt application credential secrets before storing them.
- Redact tokens, database passwords, encryption keys, and credential secrets from logs.
- Validate environment variables and request payloads with Zod.
- Enforce role-based access for `ADMIN`, `USER`, and `VIEWER`.
- Use safe audit messages that do not expose credentials.
- Add confirmations for destructive operations.
- Send security headers and a restrictive Content Security Policy.

## Phase 1 Controls

Phase 1 includes encrypted credential helpers, environment schemas, Prisma models for roles and audit logs, server-only OpenStack module imports, and middleware security headers.

## Phase 1.5 Controls

Phase 1.5 preserves unavailable states for API-driven sections. It does not add fake OpenStack data, does not move OpenStack calls into browser components, and keeps all cloud integration modules server-only.

## Production Notes

`OPENSTACK_TLS_VERIFY` must remain true in production. Do not commit `.env`, database dumps, Keystone tokens, application credential secrets, screenshots containing secrets, or local Docker volumes.
