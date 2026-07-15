# OpenCloud EC2 Platform Audit And Roadmap

## Completed

- Next.js 15 console with dashboard navigation, authentication, users, settings, logs, and protected API routes.
- Multipass integration for instance list, launch, start, stop, restart, suspend, and terminate.
- Local fallback mode when Multipass is not installed, useful for classroom demo and UI validation.
- Demo login mode for localhost, with production opt-out through `LOCAL_DEMO_LOGIN_ANY=false`.
- Functional instance launch form, instance table filtering, sorting, and terminate action.
- PostgreSQL/Prisma models for users, sessions, activity logs, operations, pricing, preferences, notifications, and application settings.
- EC2-style persisted control-plane models for instances, images, networks, subnets, security groups, firewall rules, key pairs, elastic IPs, volumes, snapshots, and usage records.
- IAM role model for `ADMIN`, `DEVELOPER`, and `VIEWER`, while retaining legacy `USER` compatibility.
- Resource APIs for images, networks, key pairs, security groups, firewall rules, volumes, snapshots, billing, and monitoring.

## Incomplete Or Partially Implemented

- Multipass can provision real VMs, but it does not provide native AWS-style VPCs, security groups, EBS volumes, or public IP allocation. Those are modeled in the control plane and need host-level enforcement if required.
- Custom AMI creation is represented as metadata today. Full image capture needs a snapshot/export workflow or a different virtualization backend.
- Web SSH terminal is not implemented yet. It needs a websocket route, terminal frontend, and server-side command/session broker.
- Monitoring uses Multipass runtime info plus estimates. True CPU/RAM/network samples need an agent inside each VM or periodic `multipass exec` collection.
- Billing is an estimate from persisted resources and pricing rules. It is not yet backed by immutable hourly usage aggregation jobs.
- Browser resource pages still need to be fully migrated from simple local managers to API-backed CRUD tables.

## Security Issues To Keep In Mind

- `LOCAL_DEMO_LOGIN_ANY=true` is acceptable for localhost demos only. Production should set it to `false` and use seeded or managed users.
- API routes validate input with Zod, but owner checks should be tightened per-resource before multi-tenant production use.
- Generated private SSH keys are returned once by the key-pair API. They must never be stored unencrypted.
- Multipass command execution must remain server-only and must continue using `execFile` with argument arrays, not shell interpolation.

## Implementation Roadmap

1. Apply the Prisma migration to Neon/PostgreSQL and seed defaults with `npm run prisma:deploy && npm run db:seed`.
2. Replace the remaining localStorage resource pages with API-backed tables and forms.
3. Add websocket-based SSH console using stored/imported key pairs and `multipass exec` or SSH sessions.
4. Add an instance metrics collector that periodically samples `multipass info` and `multipass exec` output into `UsageRecord`.
5. Add host-level firewall and mount automation where Multipass can safely support it.
6. Add tests for every resource API, permission level, and instance lifecycle action.
7. Harden production deployment: rate limiting, CSRF-sensitive mutations, structured audit logs, backup/restore docs, and secret rotation.
