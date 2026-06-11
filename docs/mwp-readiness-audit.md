# MWP Readiness Audit

This audit captures the minimum real workflow needed before a first deploy/test of SKOSS with a small food business. It is intentionally focused on operational readiness, not feature expansion.

## Current workflow map

1. `/entry` is the instance gateway. It separates new activation, existing instance sign-in, restore, demo launch, and non-production recovery tools.
2. `/bootstrap` handles first-time activation. Required steps are admin account and workspace basics; team, rhythm, starter product, and imports are optional.
3. `/login` opens an existing initialized workspace for active users.
4. `/` is the SKOSSina operator home. It summarizes today, shows role-shaped workspaces, and now exposes the first-deploy workflow path: customers, orders, production, handoff, and basic setup.
5. `/admin` and `/admin/setup` are SKOSS Core/admin surfaces for structural setup, users, imports, basic catalog/procurement memory, preferences, and module framing.
6. `/customers` supports customer memory, customer edit/create, customer-linked order creation, and recent customer order context.
7. `/orders` supports recurring demand review, one-time order creation, order cards by production date, and links into order editing.
8. `/orders/new` captures orders with draft customer/product support and a default visible-on-production-board path.
9. `/production` groups visible order demand, tracks line progress, exposes fulfillment queues, WIP snapshots, and print-friendly production output.
10. `/handoff` records WIP and shift handoff notes, monitors fulfillment watches, and exposes print-friendly handoff output.

## Blockers found

No hard blocker was found in the basic route path: a user can bootstrap, sign in, add customers, create an order, see it on production, update line progress, and record handoff/WIP.

The main blockers are readiness and clarity issues rather than missing infrastructure:

- Empty operational states did not always tell a first-time user what to do next.
- Runtime/demo state was clearer on `/entry` and `/admin/setup` than on the operator home.
- Production and handoff could look empty or broken before the first order exists.
- Product setup was indirect. This is now partially addressed by a narrow `/admin/setup` product confirmation section for product name, default unit, category, and active state.
- The app still contains demo-seed-oriented copy and example setup surfaces that could be mistaken for real operational readiness.

## Rough edges

- `/bootstrap` has an optional starter product step, and `/admin/setup` now has a narrow product confirmation section. This is still intentionally basic and not a full catalog workflow.
- `/orders` showed an empty recurring-demand grid even when recurring templates did not exist.
- `/production` had good empty handling when there were no boards, but not enough guidance when a board date exists with no visible orders.
- `/handoff` showed several empty lists without explaining what makes items appear.
- `/admin` describes setup with suppliers/materials/recipes before customers/orders, which may overemphasize later procurement foundations for an MWP user.

## Demo/dev/real-data risks

- `SKOSS_RUNTIME_MODE=demo` enables destructive local reset tools and demo launch. This is useful for development but dangerous if confused with a live workspace.
- `demoModeActive` is stored in instance state, but before this pass it was most visible at entry rather than in the operator loop.
- Demo seed data can make the product look more complete than a fresh instance. A real first deploy needs obvious messaging when demo data is active.
- Pilot mode is currently the default for production builds unless `SKOSS_RUNTIME_MODE=production` is set. That should be documented and verified before any hosted live use.

## Must-fix before first deploy

- Confirm production runtime configuration: explicitly set and verify `SKOSS_RUNTIME_MODE` for the target environment.
- Ensure a fresh instance does not ship with demo records unless the deploy is explicitly a demo/pilot training workspace.
- Confirm backup/restore behavior for the chosen persistence adapter and document the manual recovery path.
- Run the new product confirmation path with real starter products and verify order suggestions are helpful without blocking draft product entry.
- Validate login/session behavior on the actual target host with at least owner admin and one operator role.
- Run a real scenario: create customer, create order, update production quantities, record WIP, record handoff, print/review output.

## Nice-to-have after first deploy

- Dedicated product import and richer catalog editing after the basic confirmation path proves useful.
- Better guided first-run checklist on the operator home after bootstrap.
- More complete product/catalog import or quick-add affordances.
- More precise role onboarding for sales, kitchen, and shift lead users.
- Better correction flows for supplier prices and recipes.
- First lightweight backup export UI.

## Explicit non-goals for first deploy

Do not include these in the first deploy readiness scope:

- procurement workflows
- inventory deduction, stock ledgers, or valuation
- WhatsApp integration
- delivery logistics workflows
- printing system integrations beyond browser-print output already present
- full module marketplace behavior
- complex permissions framework
- deploy scripts or infrastructure automation

## Stabilization applied in this pass

- Added a narrow product confirmation path in `/admin/setup` for MWP product name, default unit, optional category, and active state.
- Kept draft product order lines available so catalog setup does not block real work.
- Simplified new order capture so first use starts with one visible line, a clearer customer/date -> item -> save flow, and secondary dispatch details.
- Added operator-home runtime/demo visibility and a first-deploy workflow card.
- Added empty-state guidance to `/orders` for missing recurring templates and missing first orders.
- Added production entry links and clearer empty guidance for production boards with no visible orders.
- Added handoff entry links and empty-list guidance for WIP, packing, assignment, pickup, and focus-day order watches.

## Product/menu benchmark note

The current product setup path is intentionally MWP-only. It is meant to confirm basic sellable product names, default units, optional category labels, and active/inactive state so real orders can be captured. It should not be judged as a full POS/menu manager yet.

Loyverse, Uber Eats, and DiDi Food are useful later benchmarks for product/menu UX patterns such as richer descriptions, prices, images, modifiers, variants, availability, menu grouping, and channel-specific presentation. Those remain post-MWP/beta work for SKOSS. The first deploy should preserve the current principle: product setup helps order capture, but incomplete catalog data must not block daily kitchen work.

## Recommended next PR

Run a first-deploy rehearsal against a fresh non-demo instance: bootstrap, create admin, confirm products/customers, create orders, update production, record WIP, record handoff, and verify browser-print output. Keep the rehearsal focused on operational confidence before adding richer catalog, procurement, inventory, or deployment automation.
