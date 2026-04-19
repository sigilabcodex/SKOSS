# ADR 0005: PostgreSQL + Drizzle foundation with hybrid persistence transition

- Status: Accepted
- Date: 2026-04-19

## Context

ADR 0004 introduced a repository boundary but kept JSON runtime persistence as the only adapter.

SKOSS now needs a real relational foundation without forcing a rewrite of all domain segments.

## Decision

Adopt PostgreSQL + Drizzle as the persistence foundation and move an initial domain subset to PostgreSQL while keeping non-migrated domains on JSON during transition.

### Migrated domains (PostgreSQL source of truth)

- workspace
- workspace preferences
- instance state
- session state
- users + user roles
- customers

### Remaining domains (JSON source of truth)

- catalog (products, destinations)
- procurement (suppliers, raw materials, price entries, recipes)
- recurring templates
- orders
- production (WIP, shift logs)
- activities

### Runtime strategy

- `SKOSS_PERSISTENCE_MODE=json`: JSON adapter only (fallback and compatibility mode)
- `SKOSS_PERSISTENCE_MODE=hybrid|postgres`: composed read model
  - PostgreSQL is authoritative for migrated domains
  - JSON remains authoritative for non-migrated domains
- Full-AppData writes are persisted with explicit split:
  - migrated segments -> PostgreSQL
  - non-migrated segments -> JSON

## Consequences

### Positive

- Introduces real relational persistence immediately for identity/bootstrap/customer memory segments.
- Preserves progressive migration path and avoids big-bang rewrite risk.
- Keeps route/actions stable while tightening persistence boundaries.

### Tradeoffs

- Temporary hybrid persistence increases operational complexity.
- JSON runtime file can hold stale copies of migrated segments by design; it is no longer authoritative for those segments in hybrid mode.
- Repository contracts remain coarse (`replaceAll`) and should be refined over time.

## Follow-up

Recommended next migration target: orders + order lines + recurring templates.
