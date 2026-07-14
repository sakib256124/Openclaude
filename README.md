# OpenCloud Compute Console

OpenCloud Compute Console is a university final project that provides an EC2-inspired virtual machine management experience using real OpenStack APIs. It is designed as an original dark cloud console for Nova, Glance, Neutron, Cinder, Keystone, and optional Telemetry services.

## Legal Disclaimer

This is an independent educational project and is not affiliated with, endorsed by, sponsored by, or connected to Amazon Web Services. It does not use AWS proprietary code, private APIs, AWS logos, official EC2 icons, copyrighted AWS screenshots, or an exact copy of the AWS Management Console.

## Phase 1 and 1.5 Scope

Phase 1 establishes the architecture, folder tree, dependencies, environment template, Docker services, Prisma schema, seed data, route surface, and documentation. Phase 1.5 refines the design system, shell navigation, reusable UI states, and missing navigation routes. Authentication, OpenStack calls, live metrics, and production actions are intentionally scheduled for later phases.

## Architecture

```text
Browser
  -> Next.js frontend
  -> authenticated Next.js server API route
  -> server-only OpenStack service layer
  -> Keystone token and service catalog
  -> Nova / Glance / Neutron / Cinder / Telemetry
  -> normalized application DTO
  -> frontend response
```

## Technology Stack

Next.js App Router, TypeScript strict mode, Tailwind CSS, shadcn/ui conventions, Lucide icons, Recharts, PostgreSQL, Prisma ORM, Auth.js, Zod, TanStack Query, Vitest, Playwright, Docker, Docker Compose, and Nginx.

## Setup Commands

```bash
cp .env.example .env
npm install
docker compose up -d postgres
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run db:seed
npm run dev
```

Expected output:

- PostgreSQL is reachable on `localhost:5432`.
- Prisma creates the Phase 1 schema.
- The seed command inserts local pricing rules and, when `SEED_ADMIN_PASSWORD` is set, a bootstrap admin user.
- The app starts at `http://localhost:3000`.

## Environment Variables

Never expose OpenStack credentials through `NEXT_PUBLIC_*` variables. Application credential secrets are stored only server-side and encrypted before persistence.

Important variables:

- `DATABASE_URL`: PostgreSQL connection string.
- `AUTH_SECRET`: Auth.js signing secret.
- `CREDENTIAL_ENCRYPTION_KEY`: 32-byte base64 key for authenticated encryption.
- `OPENSTACK_DEFAULT_AUTH_URL`: optional default Keystone v3 URL.
- `OPENSTACK_DEFAULT_REGION`: default OpenStack region.
- `OPENSTACK_DEFAULT_INTERFACE`: `public`, `internal`, or `admin`.
- `OPENSTACK_TLS_VERIFY`: must remain true in production.

## Docker

```bash
cp .env.example .env
docker compose up --build
```

The app is exposed directly on `http://localhost:3000` and through Nginx on `http://localhost:8080`.

## OpenStack Services

Planned integrations:

- Keystone Identity API v3 for application credential authentication and service catalog resolution.
- Nova Compute API for instances, flavors, key pairs, actions, and snapshots.
- Glance Image API v2 for usable active images.
- Neutron Networking API v2 for networks, subnets, ports, floating IPs, and security groups.
- Cinder Block Storage API v3 for volumes and attachments.
- Ceilometer or Gnocchi only when available for real utilization metrics.

## Security Notes

OpenStack requests must originate from server-side modules and route handlers only. Phase 1 includes server-only module boundaries, authenticated encryption helpers, strict environment validation, security headers, and database models for role-based access and safe activity logs.

## Testing

```bash
npm run typecheck
npm run test
npm run test:e2e
```

Unit, integration, and end-to-end test suites are scaffolded in `tests/`. Concrete tests are added with the phases that introduce behavior.

## Known Limitations

- Login is not active until Phase 2.
- Keystone token acquisition starts in Phase 3.
- Nova, Glance, Neutron, Cinder, and Telemetry endpoints currently return explicit `501` phase responses.
- No fake utilization metrics are displayed.
- Phase 1.5 pages use designed unavailable states until real OpenStack integration exists.

## Screenshots

Place screenshots in `docs/screenshots/` after UI flows become interactive.

## License

MIT. See `LICENSE`.
