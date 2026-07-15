# OpenCloud Compute Console

OpenCloud Compute Console is a university final project that provides an EC2-inspired virtual machine management experience for Ubuntu Multipass. It is designed as an original dark console for launching, viewing, stopping, deleting, and monitoring local Ubuntu virtual machines.

## Legal Disclaimer

This is an independent educational project and is not affiliated with, endorsed by, sponsored by, or connected to Amazon Web Services. It does not use AWS proprietary code, private APIs, AWS logos, official EC2 icons, copyrighted AWS screenshots, or an exact copy of the AWS Management Console.

## Phase 1 and 1.5 Scope

Phase 1 establishes the architecture, folder tree, dependencies, environment template, Docker services, Prisma schema, seed data, route surface, and documentation. Phase 1.5 refines the design system, shell navigation, reusable UI states, and missing navigation routes. Authentication, Multipass CLI calls, live metrics, and production actions are intentionally scheduled for later phases.

## Architecture

```text
Browser
  -> Next.js frontend
  -> authenticated Next.js server API route
  -> server-only Multipass service layer
  -> Ubuntu host connection settings
  -> Multipass CLI / daemon
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

Never expose host access secrets through `NEXT_PUBLIC_*` variables. Optional Multipass host secrets are stored only server-side and encrypted before persistence.

Important variables:

- `DATABASE_URL`: PostgreSQL connection string.
- `AUTH_SECRET`: Auth.js signing secret.
- `CREDENTIAL_ENCRYPTION_KEY`: 32-byte base64 key for authenticated encryption.
- `MULTIPASS_DEFAULT_HOST`: default Ubuntu host, usually `localhost`.
- `MULTIPASS_DEFAULT_DRIVER`: local Multipass driver such as `qemu` or `lxd`.
- `MULTIPASS_SOCKET_PATH`: optional daemon socket path.
- `MULTIPASS_REQUEST_TIMEOUT_MS`: command timeout for server-side Multipass calls.

## Docker

```bash
cp .env.example .env
docker compose up --build
```

The app is exposed directly on `http://localhost:3000` and through Nginx on `http://localhost:8080`.

## Multipass Workflows

Planned integrations:

- `multipass list --format json` for VM inventory.
- `multipass launch` for Ubuntu VM creation with CPU, memory, disk, and image choices.
- `multipass start`, `stop`, `restart`, `suspend`, and `delete` for instance actions.
- `multipass find` for available Ubuntu images.
- `multipass networks`, `mount`, and `umount` for networking and storage workflows.
- Optional host sampling for CPU, memory, disk, and network utilization metrics.

## Security Notes

Multipass commands must originate from server-side modules and route handlers only. Phase 1 includes server-only module boundaries, authenticated encryption helpers, strict environment validation, security headers, and database models for role-based access and safe activity logs.

## Testing

```bash
npm run typecheck
npm run test
npm run test:e2e
```

Unit, integration, and end-to-end test suites are scaffolded in `tests/`. Concrete tests are added with the phases that introduce behavior.

## Known Limitations

- Login is not active until Phase 2.
- VM list, launch, details, lifecycle actions, and delete require the host `multipass` CLI.
- This development machine returns a safe unavailable response when Multipass is not installed.
- Advanced storage, floating IP, and security-group APIs return Multipass-specific unsupported responses because Multipass does not expose those cloud-provider concepts directly.

## Screenshots

Place screenshots in `docs/screenshots/` after UI flows become interactive.

## License

MIT. See `LICENSE`.
