# Production Capacity Model (Proposal)

## Status

Draft proposal for the next documentation layer. This document defines direction, not implemented behavior.

## Why this document exists

SKOSS already models the operational transformation loop well:

`orders -> grouped demand -> production interpretation -> WIP -> shift handoff -> final output`

What is still missing is a practical way to answer one critical intake question:

**Can we promise this order at this date/time without overloading the operation?**

Today, the repo has strong foundations for demand, production visibility, and WIP, but not yet a formal capacity/plausibility model tied to promise-date guidance.

## What already exists vs what is missing

### Already present in SKOSS docs/direction

- order capture and recurring demand
- production-day grouping and production board
- WIP as a first-class concept
- shift logs and handoff context
- lightweight recipes/formulas and material-cost context
- role-based workspaces and setup surfaces

### Missing today

- explicit distinction between **available stock**, **available WIP**, and **available productive capacity**
- a documented, staged model for feasibility estimation
- a lightweight capability to suggest a realistic promise date/time during order intake
- clear warning semantics for near/beyond capacity states

## Capacity in kitchen terms

Capacity is not one number.

For SKOSS, early capacity should combine three practical checks:

1. **Stock availability**: how much ready product is already available.
2. **WIP availability**: how much in-progress work can realistically become ready by the promise time.
3. **Productive capacity**: how much additional work the team can still execute (people + key equipment + stage bottlenecks) without unsafe overload.

If stock and WIP are enough, capacity pressure may be low.
If stock/WIP are not enough, the missing quantity must fit remaining productive capacity.

## Smallest useful model (MVP direction)

The smallest useful version SKOSS can support soon is:

- day-level (or shift-level) **heuristic capacity envelopes**
- per product family or process family (for example: brioche family)
- reduced required production after subtracting usable stock + usable WIP
- non-blocking warning levels for order intake
- suggested date/time based on the next feasible window

This is intentionally approximate. It is enough to reduce unrealistic promises without building a full scheduler.

## Layered maturity model

## Level A — Heuristic / day-level capacity (near-term target)

**Goal:** practical feasibility guidance with minimal setup burden.

Inputs can be incomplete and still usable:

- grouped demand by production date
- current WIP summary by stage
- simple shift presence assumptions
- optional per-product-family max units/day or max units/shift

Behavior:

- compute `required_new_output = requested - usable_stock - usable_wip`
- compare required output against remaining envelope
- produce a recommendation:
  - likely feasible
  - feasible with pressure
  - likely needs next day/next window

No optimizer, no minute-by-minute assignment.

## Level B — Resource-aware capacity (mid-term)

**Goal:** expose shared bottlenecks and improve promise-date realism.

Adds lightweight resource awareness:

- worker-role presence windows
- key equipment/workstation availability (ovens, mixers, prep tables, fermentation space, packing station)
- simple process-stage load estimates (prep, ferment/rest, bake, pack, dispatch)

Behavior:

- estimate whether the missing work can pass through key bottleneck stages in time
- show which stage/resource is limiting
- keep recommendations approximate and transparent

Still not a full scheduling engine.

## Level C — Queue/schedule refinement (future, optional)

**Goal:** optional deeper planning for teams that need it.

Potential additions:

- intra-day sequencing proposals
- queue balancing between shifts
- tighter stage timing assumptions

Must remain optional and should never become mandatory for core order capture.

## Practical examples

### Example 1: Brioche family shared dough

- Thursday demand includes brioche buns and brioche rolls.
- WIP already has one mixed brioche base batch from night shift.
- Intake order asks for 120 extra burger buns by Friday 11:00.

SKOSS should:

- treat shared dough WIP as reducing required new prep
- still check bake/packing windows and oven pressure
- suggest Friday 11:00 only if remaining bottlenecks are acceptable

### Example 2: Night prep vs morning bake

- Night shift can mix/shape enough units.
- Morning shift has one oven and heavy existing queue.

Even if prep capacity is sufficient, promise guidance should flag bake bottleneck risk and propose later ready time.

### Example 3: Technically possible but operationally unsafe

- A large order can fit mathematically if every shift runs at maximum with zero disruptions.

SKOSS should mark this as **near/beyond safe capacity** rather than “green”, and keep order capture possible with explicit warning.

## Incomplete-data behavior (required for progressive adoption)

Feasibility must degrade gracefully when setup is partial.

If data is missing, SKOSS should:

- fall back from resource-aware logic to heuristic/day-level envelopes
- mark confidence as `low`, `medium`, or `high`
- indicate why confidence is reduced (for example: no oven profile, no shift window, no process profile)
- avoid hard blocking order capture

This preserves “work now, structure later”.

## Warning model for order intake

Recommended non-blocking statuses:

- **Enough stock**
- **Requires production**
- **Requires extra shift effort**
- **Near capacity**
- **Beyond safe capacity**

Behavior principle:

- warnings should inform promise decisions, not punish fast intake
- hard block should be rare and explicit (for example, impossible due date in closed hours if business chooses strict rule)

## Relationship to existing docs

This proposal extends, not replaces:

- production logic and grouped demand interpretation
- WIP-centric operational flow
- shift handoff and role-based workspace design
- lightweight setup philosophy and low-spec technical direction

## Non-goals for this stage

- no full MRP engine
- no industrial optimizer
- no mandatory recipe completeness
- no microservice split
- no heavy infrastructure assumptions

## Suggested next documentation links

- [Capacity resources model](./capacity-resources.md)
- [Promise date and feasibility flow](./promise-date-and-feasibility.md)
- [Capacity setup UX proposal](./setup-capacity-and-resources-ux.md)
- [ADR 0002 production capacity direction](./adr/0002-production-capacity-direction.md)
