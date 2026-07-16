# Functionality Audit

## Summary

The app now includes protected API routes for instance lifecycle, images, key pairs, networks, security groups, addresses, volumes, snapshots, monitoring, billing, users, settings, logs, registration, and profile access. The main remaining limitation is infrastructure enforcement: Multipass can create and control VMs, but AWS-only primitives such as VPC security groups, Elastic IP routing, and EBS block devices are represented in the control-plane database unless host-level automation is added.

## Pages

- Dashboard: fetches `/api/instances`; metrics are derived from real/local runtime data. Needs deeper historical charts from a metrics collector.
- Instances: fetches `/api/instances`; search, filters, sort, refresh, start, stop, restart, terminate, and detail links are functional.
- Launch Instance: posts to `/api/instances`; creates a Multipass VM when Multipass exists and local fallback otherwise.
- Instance Details: fetches `/api/instances/[instanceId]`; start, stop, restart, snapshot, terminal notice, and delete actions are connected.
- Images: API-backed create/list/delete through `/api/images`.
- Key Pairs: API-backed create/list/delete through `/api/keypairs`.
- Networks: API-backed create/list/delete through `/api/networks`.
- Addresses: API-backed allocate/list/associate/release through `/api/floating-ips`.
- Security Groups: API-backed create/list/delete plus add-rule through `/api/security-groups`.
- Volumes: API-backed create/list/attach/detach/delete through `/api/volumes`.
- Snapshots and Volume Snapshots: API-backed create/list/delete through `/api/snapshots`.
- Monitoring: fetches `/api/metrics`; shows live Multipass/local estimates and instance health rows.
- Billing: fetches `/api/billing`; calculates estimates from persisted resources and pricing rules.
- Global Search: topbar search queries `/api/search` across instances, images, key pairs, networks, security groups, addresses, volumes, and snapshots.
- Users and Roles: API-backed user CRUD, roles, active state, reset password, and admin protection.
- Authentication: login, logout, and public self-registration are wired to password hashing and NextAuth sessions.
- Profile: protected profile page shows account status and preferences.
- Activity Logs: database-backed, permission-filtered.
- Settings: database-backed general settings and Multipass configuration display.

## API Requirements

- Authentication: enforced through `requireApiPermission` on protected routes.
- Authorization: Admin, Developer/User, Viewer permissions are enforced centrally.
- Validation: mutating APIs use Zod or route-level validation.
- Error handling: routes return JSON errors with stable error codes.
- Database: Prisma schema contains User, ComputeInstance, MachineImage, Volume, VirtualNetwork, SecurityGroup, KeyPair, ElasticIpAddress, Snapshot, UsageRecord, PricingRule, ActivityLog, and related models.

## Remaining Professional Work

- Browser SSH terminal: requires websocket/session broker and safe command streaming.
- True metrics: requires periodic collector or guest agent instead of estimates.
- Host firewall enforcement: security-group rules need iptables/ufw automation if required.
- Real block volume mounting: Multipass supports mounts, not AWS EBS; host path provisioning can be added.
- Immutable billing records: add scheduled usage aggregation into `UsageRecord`.
- Dark/light toggle persistence: theme setting exists, but full toggle UI can be expanded.
