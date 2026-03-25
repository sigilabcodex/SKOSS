# Promise Date and Feasibility (Proposal)

## Status

Draft proposal. No implementation is claimed.

## Goal

Define a practical estimation flow for order intake that answers:

- what is **available to promise** (ATP)?
- what is **capable to promise** (CTP)?
- what delivery/ready date-time should SKOSS suggest?

This should stay approximate, transparent, and operator-usable.

## Terms

- **ATP (available to promise):** quantity that can be fulfilled from ready stock and near-term usable WIP.
- **CTP (capable to promise):** quantity that can be produced in time given remaining capacity and bottlenecks.
- **Suggested promise:** recommended ready/delivery window based on ATP + CTP + safety thresholds.

## Inputs from existing SKOSS concepts

Primary inputs should reuse current domain foundations:

- orders and grouped demand for target production dates
- production-day context and existing commitments
- WIP entries and stage notes
- shift logs and handoff notes
- product/variant and optional formula/process hints

Secondary (optional) inputs:

- productive resource setup
- material risk flags (rough, non-blocking)

## Estimation flow (Level A to Level B)

1. **Normalize request**
   - map order line to product/variant/product family.
2. **Check ATP**
   - estimate usable ready stock.
   - estimate usable WIP that can convert before requested time.
3. **Compute gap**
   - `gap = requested - ATP`.
4. **Check CTP for gap**
   - level A: compare gap to day/shift heuristic envelope.
   - level B: compare stage load against human + equipment bottlenecks.
5. **Determine warning level**
   - enough stock / requires production / requires extra shift effort / near capacity / beyond safe capacity.
6. **Suggest promise window**
   - if current request window unsafe, propose next feasible window/date.
7. **Report confidence**
   - high/medium/low based on data completeness.

## WIP treatment (required)

WIP should reduce required new production only when stage and timing make it realistically usable.

Example:

- mixed dough WIP can reduce mixing load
- but still requires fermentation/bake capacity before ready time

So WIP subtraction must be stage-aware, not just quantity-aware.

## Warnings for sales/order intake

Recommended semantics:

- **Enough stock**: can fulfill from current ready/near-ready amounts.
- **Requires production**: needs additional production but within normal envelope.
- **Requires extra shift effort**: feasible if team stretches or reprioritizes.
- **Near capacity**: high risk of delay; suggest alternative window.
- **Beyond safe capacity**: strong warning; still allow override with note.

Design principle:

- warn early
- avoid hard blocking in normal cases
- keep manual override path explicit and auditable

## Suggested promise date/time behavior

When requested slot is risky, SKOSS should propose the nearest safer window.

Example:

- request: Thursday 06:00
- forecast: oven and pack bottlenecks overloaded
- suggested: Friday 11:00 with status “requires production / safer window”

The UI should show “why” in one short reason line (example: "oven load already near limit Thursday morning").

## Incomplete data strategy

The estimation must remain useful with partial setup.

Fallback sequence:

1. product-family day envelope
2. shift-envelope heuristics
3. last-known practical throughput hints
4. manual confirmation with low-confidence warning

The system should never pretend precision it does not have.

## Material availability handling (rough, near-term)

Early feasibility can include coarse material risk signals without deep inventory:

- `material_ok` (no known issue)
- `material_risk` (known thin supply soon)
- `material_unknown` (insufficient evidence)

This is advisory, not an automatic procurement planner.

## Bakery scenario walkthrough

Order intake at Wednesday 15:00:

- New order: 300 burger buns for Thursday 06:00
- Existing grouped demand already heavy for Thursday morning
- WIP: 120 equivalent units mixed overnight-ready
- Oven: one major bake bottleneck
- Packing: near full in same window

Result:

- ATP covers part of request
- CTP indicates Thursday 06:00 is beyond safe window
- SKOSS suggests Friday 11:00 or split fulfillment
- Warning: `near capacity` or `beyond safe capacity` depending on threshold

## What this document does not propose

- no exact optimizer
- no rigid schedule lock
- no mandatory complete recipe/process setup
- no heavy planning engine

## API and UI implications (future docs)

Likely future additions (not implemented yet):

- feasibility-check endpoint/action for order draft context
- warning payload with confidence and reason codes
- suggested promise window in order capture flow
- optional override reason capture for risky commitments
