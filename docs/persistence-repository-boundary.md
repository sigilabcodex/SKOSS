# Persistence repository boundary (refactor preparation)

Date: 2026-04-19
Status: implemented (JSON adapter active)

## Why this pass was needed

SKOSS runtime persistence has been centered around direct `readStore()` / `writeStore()` calls against one mutable `AppData` JSON blob.

That made it too easy for route/actions and domain workflow code to couple directly to storage shape and mutation mechanics.

Before introducing PostgreSQL + Drizzle, SKOSS now introduces a persistence boundary so storage can be swapped with smaller blast radius.

## Coupling audit summary (before this pass)

Direct `readStore()` / `writeStore()` usage had spread across:

- server actions (`lib/server/actions.ts`)
- auth/session context (`lib/server/auth.ts`)
- request preference/i18n resolution (`lib/i18n/server.ts`)
- workspace loaders in `lib/server/demo-data.ts`
- app pages and route handlers (`app/**`, `components/app-shell.tsx`)

This created storage leakage into:

- role/session shaping
- bootstrap and entry-gateway decisions
- admin/setup flows
- workspace read models (orders, customers, production, handoff, timeline)

## What is now in place

A new persistence module exists under `lib/server/persistence/`:

- `contracts.ts`: domain-segmented repository contracts
- `json-runtime-adapter.ts`: current JSON runtime adapter implementation
- `index.ts`: application-facing persistence entry points

### Current segmented repositories

The boundary is intentionally practical and keeps domain language:

- instance/workspace/session state
- users
- customers
- orders
- recurring templates
- catalog (products/destinations)
- procurement (suppliers, raw materials, supplier prices, recipes)
- production (WIP, shift logs)
- activities

## JSON in the new architecture

JSON runtime storage remains active, but now sits behind the persistence gateway.

`lib/server/store.ts` is now infrastructure-level file IO + hydration logic, with upstream callers routed through `lib/server/persistence`.

This keeps current behavior while making adapter replacement viable.

## What was refactored to depend on the boundary

Direct `store` imports were removed from app/business surfaces and replaced with persistence entry points.

Notable conversions include:

- auth user/session resolution (`lib/server/auth.ts`)
- i18n request preference resolution (`lib/i18n/server.ts`)
- route handlers for orders/handoff (`app/api/orders/route.ts`, `app/api/handoff/route.ts`)
- all previously direct store readers in pages/components/actions now use `lib/server/persistence`

## Remaining direct coupling and why

Remaining direct store coupling is intentionally concentrated in one place:

- `lib/server/persistence/json-runtime-adapter.ts` (adapter implementation)
- `lib/server/store.ts` (JSON runtime storage implementation)

This is expected for current phase: storage details are localized while app flows move to persistence contracts.

## What this unlocks next

This boundary enables a phased adapter transition:

1. introduce PostgreSQL schema and Drizzle mapping by repository segment
2. add a Postgres/Drizzle adapter implementing the same contracts
3. move callers without rewriting route/action flow contracts
4. run coexistence/testing with JSON adapter as fallback during migration work

## Constraints kept in this pass

- no feature-level behavior rewrite
- no full relational migration yet
- no microservice split
- current seed/runtime reset flows preserved
