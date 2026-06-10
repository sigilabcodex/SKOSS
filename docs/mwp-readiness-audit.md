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
- Product setup is still indirect. Operators can type draft products in orders and create a starter product in bootstrap, but dedicated product confirmation remains thin.
- The app still contains demo-seed-oriented copy and example setup surfaces that could be mistaken for real operational readiness.

## Rough edges

- `/bootstrap` has an optional starter product step, but product/catalog management after launch is still mostly implied through order capture and setup recipe links.
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
- Add a product/basic catalog confirmation path or make the draft-product flow intentionally documented as the MWP path.
- Validate login/session behavior on the actual target host with at least owner admin and one operator role.
- Run a real scenario: create customer, create order, update production quantities, record WIP, record handoff, print/review output.

## Nice-to-have after first deploy

- Dedicated basic product management outside procurement/recipe setup.
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

- Added operator-home runtime/demo visibility and a first-deploy workflow card.
- Added empty-state guidance to `/orders` for missing recurring templates and missing first orders.
- Added production entry links and clearer empty guidance for production boards with no visible orders.
- Added handoff entry links and empty-list guidance for WIP, packing, assignment, pickup, and focus-day order watches.

## Recommended next PR

Add a narrow basic product/catalog confirmation path for the MWP. Keep it separate from recipes, costing, procurement, and inventory: just enough to confirm product names, default units, active state, and variants so first deploy users are not forced to rely only on draft product text in order lines.
