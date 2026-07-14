# Testing

## Phase 1

The test folders are scaffolded:

- `tests/unit`
- `tests/integration`
- `tests/e2e`

## Planned Unit Tests

- Keystone token parsing.
- Service endpoint resolution.
- OpenStack response normalization.
- Zod validation.
- Error normalization.
- Pricing calculations.

## Planned Integration Tests

Integration tests will mock OpenStack responses for Keystone, Nova, Glance, Neutron, Cinder, and Telemetry.

## Planned E2E Tests

Playwright tests will cover login, dashboard, instance list, launch form, instance action confirmation, error states, and telemetry unavailable states.

## Commands

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
```

Phase 1.5 validation uses lint, typecheck, and build because it primarily changes UI structure and App Router pages.
