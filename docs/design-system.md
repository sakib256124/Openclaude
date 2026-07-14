# Design System

OpenCloud Compute Console uses an original dark charcoal and teal interface. It is EC2-inspired in workflow only, not in branding, layout, icons, screenshots, or proprietary behavior.

## Fonts

- Primary: Inter through `next/font`.
- Monospace: JetBrains Mono through `next/font`.
- Monospace is reserved for UUIDs, IP addresses, request IDs, fingerprints, ports, CIDR values, and technical identifiers.

## Color Tokens

The core tokens live in `src/app/globals.css`:

- `--app-background`: page background.
- `--sidebar-background`: navigation surface.
- `--surface`, `--surface-elevated`, `--surface-hover`: content surfaces.
- `--border-color`: borders and separators.
- `--text-primary`, `--text-secondary`, `--text-muted`: text hierarchy.
- `--accent`, `--accent-hover`, `--accent-subtle`: primary action and active states.
- `--success`, `--warning`, `--danger`, `--information`: semantic states.

## Shell

- Desktop sidebar expands to 248px and collapses to 72px.
- Mobile navigation uses a slide-over drawer.
- Navigation groups are collapsible and persisted in local storage.
- Sidebar collapse state is persisted in local storage.
- Topbar reserves space for region, project, connection state, refresh, notifications, and user menu.

## Components

Phase 1.5 adds reusable primitives for:

- Page headers and breadcrumbs.
- Metric cards.
- Resource tables.
- Empty, error, and loading states.
- Status and connection badges.
- Copy and refresh buttons.
- Last-updated labels.
- Quota progress.
- Filter bars and pagination.
- Confirmation dialogs and destructive confirmation dialogs.
- Details drawers.
- Toast provider.
- Resource action menus.

## Unavailable States

Unavailable states are intentional. They prevent fake OpenStack data from appearing before live service integration exists.
