# Promise Date and Feasibility (Proposal)

## Status

Draft estimation design. Not implemented.

## Goal

Define a practical, non-optimized flow from order intake to:

- suggested delivery/ready date-time
- feasibility classification
- clear warning context

## End-to-end estimation flow

1. **Order intake**
   - capture requested quantity and requested date/time.
2. **Stock check**
   - compute ready quantity available to promise.
3. **WIP adjustment**
   - include only WIP that can become ready before requested time.
4. **Production requirement**
   - `required_new_output = requested - stock - usable_wip`.
5. **Capacity estimation**
   - Level A: compare to day/shift heuristic envelopes.
   - Level B: compare stage load to human + equipment bottlenecks.
6. **Promise suggestion**
   - if unsafe, propose nearest safer date/time window.
7. **Feasibility output**
   - status, confidence, short reason labels, optional override note path.

## Feasibility states (required)

- `fulfillable_from_stock`
- `requires_production`
- `near_capacity`
- `high_strain`
- `not_safely_fulfillable`

Interpretation:

- **fulfillable_from_stock:** no meaningful production impact.
- **requires_production:** additional production needed but within normal range.
- **near_capacity:** risk rising; suggest safer slot.
- **high_strain:** feasible only with stretch/reprioritization.
- **not_safely_fulfillable:** strong warning; keep manual override path.

## WIP handling rules

WIP subtraction must be stage-aware.

Examples:

- mixed dough can reduce mixing load
- shaped trays can reduce prep+shape load
- nothing should skip remaining required stages (example: bake+pack)

## Existing commitments and shift interaction

Capacity estimation must account for:

- already committed production in the same window
- available shift effort (per role/shift)
- equipment/station envelope in that shift window

Effective feasible output is constrained by the tightest stage bottleneck.

## Incomplete-data strategy

Fallback path:

1. product/product-family daily hint
2. shift hint
3. global workspace fallback hint
4. low-confidence warning + manual commitment

Principle: degraded guidance is better than silence, but confidence must be explicit.

## Warning without blocking

Default behavior is advisory:

- show status chip + short reason
- suggest safer slot when needed
- allow commit with override note

Hard blocking should be exceptional and explicitly configured.

## Practical bakery walkthrough

Request: 300 burger buns for Thursday 06:00.

- stock ready: 40
- usable WIP: 120
- required new output: 140
- oven load in Thursday early window already near maximum

Result:

- classification: `high_strain` or `not_safely_fulfillable`
- suggested promise: Thursday late morning or Friday early slot
- reason: `oven_bottleneck`
- confidence based on completeness of shift/resource hints

## Scope boundaries

This proposal is intentionally not:

- a finite-capacity scheduler
- an MRP system
- a strict auto-planner that replaces operator judgment
