# ADR 0004: persistence repository boundary before relational migration

- Status: Accepted
- Date: 2026-04-19

## Context

SKOSS runtime data has been persisted in JSON through `readStore()` / `writeStore()` and a mutable `AppData` structure.

As setup/admin/operator surfaces grew, persistence concerns started leaking into route/actions and role/bootstrap logic, increasing migration risk.

The project needs a phased migration path toward relational persistence (target direction: PostgreSQL with Drizzle), but cannot afford a full rewrite in one PR.

## Decision

Introduce an explicit persistence boundary with domain-segmented repository contracts and keep JSON as the current adapter implementation.

### Boundary location

`lib/server/persistence/` now provides:

- repository contracts (`contracts.ts`)
- JSON runtime adapter (`json-runtime-adapter.ts`)
- app-facing entry points (`index.ts`)

### Repository segmentation (initial)

- instance/workspace/session
- users
- customers
- orders
- recurring templates
- catalog (products/destinations)
- procurement (suppliers/raw materials/price entries/recipes)
- production (WIP/shift logs)
- activities

### Migration stance

- JSON remains active storage adapter for now
- app/business flows should consume persistence boundary, not `store.ts` directly
- new relational adapter(s) should implement the same contracts incrementally

## Consequences

### Positive

- storage concerns are localized
- route/action refactors for PostgreSQL become narrower
- role/bootstrap/admin boundary work is less entangled with file IO details
- phased migration is realistic without pausing current operation

### Tradeoffs

- `AppData` shape still exists and some callers still operate on it
- repository methods are currently array-oriented and will need tighter query/update semantics over time
- dual-adapter parity tests are still pending

## Explicitly not done yet

- no full PostgreSQL schema migration
- no Drizzle integration in runtime path
- no offline sync architecture redesign
- no microservice split
