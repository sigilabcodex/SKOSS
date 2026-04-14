# ADR 0003: Admin/Core plane and Operator plane split

- Status: Accepted
- Date: 2026-04-14

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
- no repo split and no microservice overhead
