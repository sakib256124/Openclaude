# Testing

## Phase 1

The test folders are scaffolded:

- `tests/unit`
- `tests/integration`
- `tests/e2e`

## Planned Unit Tests

- Multipass host config parsing.
- Command helper validation.
- Multipass response normalization.
- Zod validation.
- Error normalization.
- Pricing calculations.

## Planned Integration Tests

Integration tests will mock Multipass CLI responses for list, launch, start, stop, find, networks, mounts, and metrics.

## Planned E2E Tests

Playwright tests will cover login, dashboard, instance list, launch form, instance action confirmation, error states, and metrics unavailable states.

## Commands

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
```

Phase 1.5 validation uses lint, typecheck, and build because it primarily changes UI structure and App Router pages.
