# Multipass Setup

Multipass integration begins in Phase 3. Phase 1.5 does not execute Multipass commands.

## Planned Host Settings

Use Ubuntu Multipass on the server host:

- Multipass host, usually `localhost`.
- Multipass driver, usually `qemu` or `lxd` on Ubuntu.
- Optional daemon socket path.
- Optional encrypted host access secret if remote access is added later.
- Request timeout for long-running VM commands.

Do not execute shell commands from browser components.

## Security Rules

- Store host access settings only on the server.
- Never use `NEXT_PUBLIC_*` for secrets.
- Encrypt stored host access secrets with AES-256-GCM.
- Never log command output that may contain secrets, passwords, database URLs, or encryption keys.

## Phase 3 Checklist

- Add Multipass host settings form.
- Validate host, driver, socket path, and timeout.
- Add a safe `multipass version` or `multipass list --format json` connection test.
- Parse VM inventory from JSON output.
- Add service-health and command timeout responses.
