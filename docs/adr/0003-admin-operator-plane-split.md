# ADR 0003: Admin/Core plane and Operator plane split

- Status: Accepted
- Date: 2026-04-14

> Update note (2026-04-23): The plane split is now explicitly tied to the persistence repository boundary so Admin/Core and SKOSSina work can be separated without blocking ongoing PostgreSQL + Drizzle migration.

## Context

The app mixed admin/setup concerns into the same workspace shell used for daily operator flow.

That created ambiguity between:

1. instance bootstrap (`/bootstrap`)
2. structural admin setup
3. daily operator work

It also made module control and role routing harder to reason about.

## Decision

Keep one monolith, but split internal planes by route and navigation intent:

- `/entry` = instance gateway
- `/bootstrap` = first-run bootstrap only
- `/admin/*` = SKOSS Core / Admin Console
- `/` and operational routes = SKOSSina operator surface

Admin is no longer a normal operator workspace tab.

## Plane boundary and persistence interaction

The route-plane split and persistence split must evolve together:

- Plane separation is **UI/application composition intent**, not separate deployables.
- Persistence separation is **domain repository segmentation**, not separate databases per plane.
- Admin/Core and SKOSSina surfaces may read/write the same domain repositories, but they should do so through explicit repository contracts rather than full `AppData` mutation.
- During hybrid migration, plane work must not bypass adapter boundaries or re-introduce direct store IO.

Boundary rule for upcoming refactors:

- If a change is plane-related (shell/navigation/routes), keep persistence behavior unchanged unless repository-level tests or parity checks are included.
- If a change is persistence-related (domain migration), keep route/shell intent stable unless explicitly scoped to plane cleanup.

## Role model normalization (v0)

Canonical roles are now:

- `owner_admin`
- `shift_lead`
- `kitchen`
- `sales`

Legacy role values are normalized at runtime for backwards compatibility.

## Module registry foundation

A first internal module registry now distinguishes required and optional modules, with preset-aware defaults and instance-level enable/disable state.

This is not a plugin system. It is a core manifest for admin control.

## Consequences

- clearer route hierarchy and shell intent
- simpler onboarding boundaries
- easier path for future module control work
- safer sequence for splitting admin-core vs operator actions while migration is active
- no repo split and no microservice overhead
