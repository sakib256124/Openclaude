# API Flow

Browser components never call Multipass directly. They call local `/api/*` route handlers, and those handlers call server-only modules under `src/lib/multipass`.

## Implemented in Phase 1

All required API routes exist and return a structured `501 PHASE_NOT_IMPLEMENTED` response until their owning phase is implemented.

## Implemented in Phase 1.5

The UI now has reusable loading, empty, error, refresh, table, badge, and confirmation primitives. API-driven pages still use unavailable states until live server-side integrations replace the placeholders.

Example response:

```json
{
  "error": {
    "code": "PHASE_NOT_IMPLEMENTED",
    "message": "Instance list API is planned for Phase 4.",
    "requestId": null
  }
}
```

## Common Errors and Fixes

- `401`: the application session is missing or expired. This is handled in Phase 2.
- `503 MISSING_HOST`: no Ubuntu Multipass host has been configured.
- `METRICS_UNAVAILABLE`: host sampling is unavailable; the UI must show a clear unavailable state instead of fake values.
