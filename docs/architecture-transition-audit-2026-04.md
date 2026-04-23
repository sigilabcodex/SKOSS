# Architecture transition audit (Admin/Core vs SKOSSina + persistence boundary)

- Date: 2026-04-23
- Scope: pre-refactor audit for Admin/Core vs SKOSSina separation while PostgreSQL + Drizzle migration is active
- Intent: provide a safe map for the next implementation PR without route churn or storage-adapter removal

## 1) Current persistence architecture

SKOSS runtime persistence is now behind `lib/server/persistence/*` with a gateway selected by persistence mode:

- `json` mode: JSON runtime adapter only.
- `hybrid` / `postgres` mode: PostgreSQL is authoritative for migrated domains, JSON stays authoritative for non-migrated domains.

Current writes are still mostly full-`AppData` mutation style from server actions (`readAppData()` + `mutateAppData()`), but the hybrid adapter prevents migrated-domain overwrite by splitting writes internally.

## 2) Repository segments that already exist

Repository contracts are already segmented and available via persistence context:

- instance (workspace, preferences, instance state, session state)
- users
- customers
- orders
- recurring templates
- catalog (products, destinations)
- procurement (suppliers, raw materials, price entries, recipes)
- production (WIP, shift logs)
- activities

These segments are contract-level boundaries today; many application flows still use raw `AppData` mutation APIs.

## 3) Domains that are Postgres-ready or partially migrated

In hybrid/postgres mode, PostgreSQL is source of truth for:

- workspace
- workspace preferences
- instance state
- session state
- users and user roles
- customers

Initial relational foundation is present through Drizzle schema/migration and containerized local Postgres setup.

## 4) Flows still coupled to JSON/full-AppData style

Main coupling hotspots:

- most server actions in `lib/server/actions.ts` still read/mutate complete `AppData` snapshots.
- view-composition helpers in `lib/server/demo-data.ts` read full app state rather than domain repository slices.
- some routes/api handlers already use repository context, but this is partial and not yet the dominant pattern.

This means persistence boundary exists, but usage discipline is incomplete.

## 5) Current route/shell structure

Current structure aligns with ADR intent but still shares a single shell:

- Entry gateway: `/entry`
- First-run bootstrap: `/bootstrap`
- Admin/Core: `/admin`, `/admin/setup`, `/admin/modules`
- Operator surfaces: `/`, `/timeline`, `/orders`, `/customers`, `/production`, `/handoff`
- Legacy bridge: `/setup` redirects to `/admin/setup`

`AppShell` renders one common chrome for most routes and navigation is role-filtered rather than plane-isolated at layout level.

## 6) Where Admin/Core and Operator concerns are still mixed

Mixing remains in these areas:

- Shared shell/navigation component serves both planes, with admin shown as a nav section rather than a distinct shell boundary.
- Capability checks and role logic are reused across bootstrap, admin setup, and operator flows from the same action module.
- Preferences include `admin` as a selectable default workspace, blending personal operator landing preferences with admin-console destination.
- Large multi-domain server-action file handles bootstrap, auth/session, setup CRUD, and operator updates together.

## 7) Current role names and capability logic

Canonical roles in runtime and docs are:

- `owner_admin`
- `shift_lead`
- `kitchen`
- `sales`

Current practical capability model:

- admin-console access is effectively `owner_admin` only (`canManageSettings`).
- workspace visibility is role-priority-based (attention shaping), not full enterprise RBAC.
- legacy role values are normalized during data hydration.

## 8) Recommended safe order of future refactors

1. **Action-boundary split (no route moves yet).**
   - Split `lib/server/actions.ts` into `admin-core`, `operator`, and `entry/bootstrap` action modules.
   - Keep exported action signatures stable so UI routes remain unchanged.

2. **Repository-first writes by domain segment.**
   - Replace full `mutateAppData()` writes first in migrated domains (instance/users/customers/session), then orders/recurring.
   - Introduce domain-specific persistence helpers to avoid raw blob mutation.

3. **Read-path decoupling for operator views.**
   - Refactor `demo-data` workspace builders to read from segmented repositories rather than full `AppData`.

4. **Plane-aware shell separation.**
   - Introduce dedicated admin-shell wrapper for `/admin/*` while preserving current URLs.
   - Keep operator shell optimized for SKOSSina role workflows.

5. **Route-level cleanup after persistence discipline.**
   - Only then consider larger route or folder restructuring by plane.

## Explicit “do not do in this phase” guardrails

- Do not remove JSON adapter yet.
- Do not force a big-bang PostgreSQL migration.
- Do not introduce plugin architecture.
- Do not perform broad route rewrites before persistence/action boundaries are stabilized.

## Precise implementation TODOs for next PRs

- TODO(next-pr/actions-split): extract action modules by plane and bootstrap lifecycle while preserving existing exported action names via index re-export.
- TODO(next-pr/orders-migration): migrate `orders` + `recurringTemplates` repositories to PostgreSQL-backed adapter methods with parity tests in json/hybrid modes.
- TODO(next-pr/read-model): replace `readAppData()` usage in workspace builders with segmented repository reads (`orders`, `production`, `activities`, `customers`).
- TODO(next-pr/shell-plane): create dedicated admin shell and keep operator nav free of structural admin setup links by default for non-admin roles.
