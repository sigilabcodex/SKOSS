# Persistence repository boundary (transitioning to PostgreSQL + Drizzle)

Date: 2026-04-19
Status: active transition (hybrid mode available)

## Why this pass was needed

SKOSS runtime persistence was centered around direct JSON file IO against one mutable `AppData` blob.

ADR 0004 introduced a repository boundary. This pass adds PostgreSQL + Drizzle behind that boundary without rewriting every domain at once.

## Current persistence architecture

Persistence entry points remain in `lib/server/persistence/index.ts`.

Runtime now supports two modes:

- `json` mode: JSON-only adapter
- `hybrid` / `postgres` mode: composed persistence adapter

### PostgreSQL-backed source-of-truth domains

The following domains are authoritative in PostgreSQL when hybrid mode is enabled:

- workspace
- workspace preferences
- instance state
- session state
- users and user roles
- customers

### JSON-backed source-of-truth domains (current phase)

These domains remain authoritative in JSON runtime storage:

- destinations
- products
- suppliers
- raw materials
- supplier price entries
- recipes
- recurring templates
- orders
- WIP entries
- shift logs
- activities

## Full-AppData writes in hybrid mode

Many existing flows still mutate full `AppData` objects.

To prevent accidental overwrites of migrated PostgreSQL domains:

- migrated domains are persisted only to PostgreSQL
- JSON write-back explicitly persists only non-migrated domains

This keeps the migration reversible while avoiding ambiguous dual-authority behavior.

## Bootstrap and fallback behavior

When hybrid mode is enabled and PostgreSQL tables are empty, migrated domains are bootstrapped from current runtime JSON once.

If PostgreSQL is unavailable at runtime, persistence falls back to JSON adapter behavior and logs a warning.

## Drizzle/PostgreSQL structure

- Drizzle schema: `lib/server/db/schema.ts`
- DB env/module wiring: `lib/server/db/env.ts`, `lib/server/db/client.ts`
- Hybrid adapter: `lib/server/persistence/postgres-hybrid-adapter.ts`
- Migrated-domain operations: `lib/server/persistence/drizzle/migrated-domains.ts`
- Migration config: `drizzle.config.ts`
- Initial SQL migration: `migrations/0000_initial_persistence_foundation.sql`

## Developer workflow

See README updates for local PostgreSQL setup and migration commands.
