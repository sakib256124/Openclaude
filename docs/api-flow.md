# API Flow

Browser components never call Multipass directly. They call local `/api/*` route handlers, and those handlers call server-only modules under `src/lib/multipass`.

## Implemented in Phase 1

Multipass-backed API routes return live data when the Ubuntu host has the `multipass` CLI installed. If the CLI is missing, the routes return a structured service-unavailable response instead of crashing.

## Implemented in Phase 1.5

The UI now has reusable loading, empty, error, refresh, table, badge, and confirmation primitives. API-driven pages still use unavailable states until live server-side integrations replace the placeholders.

Example response:

```json
{
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "Multipass CLI was not found. Install Multipass on Ubuntu with: sudo snap install multipass.",
    "requestId": null
  }
}
```

## Common Errors and Fixes

- `401`: the application session is missing or expired. This is handled in Phase 2.
- `503 MISSING_HOST`: no Ubuntu Multipass host has been configured.
- `METRICS_UNAVAILABLE`: host sampling is unavailable; the UI must show a clear unavailable state instead of fake values.
