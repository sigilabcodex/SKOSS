# MWP Stabilization Status

This note defines the near-term minimum workable product path for SKOSS. The goal is a usable operational system for a small bakery or kitchen before expanding into heavier business subsystems.

## MWP belongs to the operational core

The MWP should prioritize:

- reliable bootstrap and admin access
- customer memory for repeat order-taking and fulfillment context
- order capture that tolerates draft customers, draft products, note items, and incomplete setup
- products and a basic catalog shaped by real order and recipe use
- production board visibility from grouped demand to work still needing action
- WIP and shift handoff as first-class daily work
- basic setup for users, workspace preferences, customers, products, recipes, suppliers, raw materials, and price evidence

This keeps the product centered on the SKOSS transformation flow: orders arrive, demand is interpreted, production requirements are derived, WIP changes what remains, work crosses shifts, and final output is produced.

## Procurement and inventory are next-stage

Supplier, raw-material, supplier-price, recipe, and costing data remain useful foundations, but the MWP should not become a procurement or inventory project. Near-term procurement work should stay limited to setup memory and price evidence that supports recipes and basic costing.

Defer until after the core MWP stabilizes:

- purchase planning
- stock deduction or inventory valuation
- supplier order workflows
- procurement approvals
- accounting or margin engines

## Current structural direction

Admin setup is being split into section-oriented read models so setup does not keep growing around one broad application-data blob. The compatibility setup workspace can remain while pages move toward explicit section ownership.

Current setup sections are:

- identity setup: instance onboarding state and users
- customer setup: customer memory
- business setup: workspace, preferences, and destinations
- module setup: current module enablement state
- procurement setup: suppliers, raw materials, supplier price history, and latest price evidence
- catalog setup: products, recipes, and recipe costing snapshots

The split supports MWP readiness by making it clearer which data is core operational setup and which data is transitional JSON-backed foundation for later procurement work.
