# Architecture

OpenCloud Compute Console keeps OpenStack as the source of truth. The local database stores application users, encrypted cloud connections, audit logs, preferences, and local pricing rules. It does not duplicate full OpenStack server, network, floating IP, or volume state.

## Request Flow

```text
Browser
  -> Next.js route or React component
  -> /api/* route handler with application authentication
  -> server-only OpenStack module
  -> Keystone application credential token
  -> service catalog endpoint resolution
  -> OpenStack service API
  -> normalized DTO
  -> JSON response
```

## Folder Tree

```text
opencloud/
  prisma/
    schema.prisma
    seed.ts
  public/
    logo.svg
    images/
    icons/
  src/
    app/
      (auth)/login/page.tsx
      (console)/layout.tsx
      (console)/dashboard/page.tsx
      (console)/instances/page.tsx
      (console)/instances/launch/page.tsx
      (console)/instances/[instanceId]/page.tsx
      (console)/floating-ips/page.tsx
      (console)/security-groups/page.tsx
      (console)/security-groups/[groupId]/page.tsx
      (console)/volumes/page.tsx
      (console)/monitoring/page.tsx
      (console)/billing/page.tsx
      (console)/activity-logs/page.tsx
      api/
        dashboard/route.ts
        instances/route.ts
        instances/[instanceId]/route.ts
        instances/[instanceId]/actions/route.ts
        images/route.ts
        flavors/route.ts
        networks/route.ts
        keypairs/route.ts
        floating-ips/route.ts
        floating-ips/[floatingIpId]/route.ts
        security-groups/route.ts
        security-groups/[groupId]/rules/route.ts
        security-groups/[groupId]/rules/[ruleId]/route.ts
        volumes/route.ts
        volumes/[volumeId]/route.ts
        volumes/[volumeId]/attach/route.ts
        volumes/[volumeId]/detach/route.ts
        metrics/route.ts
        activity-logs/route.ts
        health/openstack/route.ts
    components/
      layout/
      dashboard/
      instances/
      ui/
    lib/
      openstack/
      auth.ts
      prisma.ts
      encryption.ts
      permissions.ts
      audit-log.ts
      validators.ts
    hooks/
    types/
    middleware.ts
  tests/
    unit/
    integration/
    e2e/
  docs/
    architecture.md
    api-flow.md
    security.md
    testing.md
    deployment.md
    screenshots/
```

## Phase Responsibilities

Phase 1 creates the foundation. Phase 1.5 refines the design system, application shell, reusable UI states, grouped navigation, and missing route placeholders. Phase 2 adds authentication and database-backed sessions. Phase 3 implements Keystone and token caching. Phases 4 through 8 add OpenStack service integrations. Phase 9 completes testing, deployment polish, and final documentation.
