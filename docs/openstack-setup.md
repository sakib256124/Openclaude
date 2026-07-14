# OpenStack Setup

OpenStack integration begins in Phase 3. Phase 1.5 does not authenticate against OpenStack and does not call OpenStack APIs.

## Planned Credential Type

Use Keystone Identity API v3 Application Credentials:

- Application Credential ID.
- Application Credential Secret.
- Keystone Auth URL.
- Region.
- Endpoint interface, usually `public`.
- Project ID when required by the target cloud.

Do not use a normal OpenStack user password in the primary application flow.

## Security Rules

- Store credentials only on the server.
- Never use `NEXT_PUBLIC_*` for secrets.
- Encrypt stored application credential secrets with AES-256-GCM.
- Never log tokens, credential secrets, passwords, database URLs, or encryption keys.
- Keep TLS verification enabled in production.

## Phase 3 Checklist

- Add cloud connection settings form.
- Validate Auth URL, region, interface, credential ID, credential secret, and TLS preference.
- Create Keystone token with an application credential.
- Parse token expiration.
- Cache token server-side until shortly before expiry.
- Resolve Nova, Glance, Neutron, Cinder, and Telemetry endpoints from the service catalog.
- Add a safe connection test and service-health response.
