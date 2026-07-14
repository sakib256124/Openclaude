# Demo Checklist

Use this checklist for the Phase 1.5 UI demo.

## Before Demo

- Run `npm.cmd run lint`.
- Run `npm.cmd run typecheck`.
- Run `npm.cmd run build`.
- Start the app with `npm.cmd run dev`.
- Open `http://localhost:3000/dashboard`.

## Visual Checks

- Sidebar expands and collapses on desktop.
- Sidebar groups expand and collapse.
- Collapsed sidebar shows icon tooltips on hover.
- Mobile topbar exposes the navigation drawer.
- Topbar shows host, project, connection state, refresh, notifications, user menu, and phase badge.
- Dashboard uses metric cards, quota placeholders, unavailable telemetry states, and service-health placeholders.
- Instances page has search/filter toolbar, column button, launch button, table empty state, and pagination shell.
- New routes resolve: `/images`, `/key-pairs`, `/snapshots`, `/networks`, `/volume-snapshots`, `/quotas`, `/settings/multipass`, `/settings/users`, and `/settings/general`.

## Safety Checks

- No fake instances, images, networks, metrics, volumes, prices, or quota values are displayed.
- Multipass API placeholders still return safe `501` JSON responses.
- Secrets are not exposed in client components.
