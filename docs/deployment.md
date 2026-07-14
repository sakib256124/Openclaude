# Deployment

Phase 1 includes a Dockerfile, Docker Compose stack, and Nginx reverse proxy config.

## Local Docker

```bash
cp .env.example .env
docker compose up --build
```

Expected services:

- `postgres` on port `5432`
- `app` on port `3000`
- `nginx` on port `8080`

## Database Migration

```bash
npm run prisma:migrate -- --name init
npm run db:seed
```

## Common Errors and Fixes

- `CREDENTIAL_ENCRYPTION_KEY must decode to 32 bytes`: generate a new key with `openssl rand -base64 32`.
- `P1001 Can't reach database server`: start PostgreSQL with `docker compose up -d postgres`.
- `AUTH_SECRET is too short`: set a random value of at least 32 characters.
- `No Multipass host was configured`: verify host and driver settings after Multipass integration is added.
- `next/font` build failures: verify network access during build or configure a local font fallback before offline deployment.
