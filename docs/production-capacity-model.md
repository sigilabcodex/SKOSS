# Production Capacity Model (Proposal)

## Status

Draft proposal for architecture/domain/product direction. This document describes intended behavior, not implemented behavior.

## Problem in SKOSS context

SKOSS already covers the operational flow:

`order intake -> grouped demand -> production requirements -> WIP adjustment -> actionable work -> shift handoff`

What is missing is a formal way to answer, during order intake:

- can this order be fulfilled without destabilizing the kitchen?
- if yes, what promise date/time is safer?

This proposal adds a lightweight feasibility layer that stays aligned with SKOSS philosophy (operator-first, mobile-first, progressive adoption, non-ERP).

## What capacity means in SKOSS

Capacity is not the same as stock.

### Stock availability

Ready output that can be committed now (for example, already baked and packed units).

### WIP availability

Partially completed output that can likely become ready before the requested promise time (for example, shaped trays that still need baking).

### Production capacity

Remaining ability to create missing output using available shifts and key bottlenecks (people + ovens + mixers + prep/fermentation/packing constraints).

## Feasibility reasoning model

At intake time, SKOSS should reason in this order:

1. subtract usable stock
2. subtract usable WIP
3. compute missing quantity (`required_new_output`)
4. compare missing quantity against remaining capacity envelope
5. return a warning state + suggested promise date/time + confidence

Core formula:

`required_new_output = requested_quantity - usable_stock - usable_wip`

If `required_new_output <= 0`, the order is fulfillable from current readiness.

## Model maturity levels (required)

## LEVEL A — Heuristic (near-term, smallest useful version)

- per-product or per-product-family daily/shift capacity hints
- minimal setup (teams can begin with rough numbers)
- immediate usefulness in sales/order intake
- no detailed scheduling

This is the smallest useful version because it already reduces over-promising with very low setup burden.

## LEVEL B — Resource-aware (mid-term)

- adds workers/roles/shifts + equipment/station bottlenecks
- checks stage pressure (prep/mix/ferment/shape/bake/pack/dispatch)
- exposes bottleneck reason labels (example: `oven_bottleneck`)

Still heuristic and transparent; not an optimizer.

## LEVEL C — Scheduling (optional future)

- optional timeline/sequencing refinement
- optional queue balancing and finer slot logic
- not required for core SKOSS value

## Real kitchen examples

### Example 1: fulfillable from stock

A bakery has 90 packed burger buns ready. New order asks for 60 by today 17:00.

- stock covers all demand
- status: `fulfillable_from_stock`
- no extra production load

### Example 2: WIP reduces required production

Order asks for 200 conchas for tomorrow morning.

- ready stock: 20
- WIP: dough equivalent for 120 (already mixed and resting)
- missing new output: 60

SKOSS should only capacity-check the missing 60, not the full 200.

### Example 3: one-oven bottleneck

Night shift can mix enough dough, but morning has one oven and the existing bake queue is already high.

- prep looks feasible
- bake stage is constrained
- status: `near_capacity` or `high_strain`
- suggested promise moves to a safer slot

## Explicit answers to required questions

1. **Smallest useful version:** LEVEL A with per-day/per-shift heuristic envelopes and WIP-aware subtraction.
2. **Incomplete data:** fallback to coarser heuristics and lower confidence (`low/medium/high`), never hard-fail by default.
3. **Recipes without mandatory setup:** recipes/process hints improve estimates when present; product-family fallback works when absent.
4. **Shifts vs equipment:** feasible load is bounded by both shift effort and equipment throughput; minimum effective stage capacity wins.
5. **Bottlenecks (one oven):** model shared bottlenecks as single resources consumed by many products/processes.
6. **How WIP reduces production:** only stage-usable WIP subtracts from required output before capacity comparison.
7. **Warn without blocking:** show warning states + suggestion + override path with note; no default hard block.
8. **Core vs later:** core = heuristic envelopes + key bottlenecks; later = detailed sequencing, changeovers, advanced optimization.
9. **UI without friction:** inline intake chip + short reason + suggested promise, with compact setup sections.
10. **Low-spec compatibility:** use simple aggregations/heuristics and avoid heavy optimization engines or always-on cloud dependencies.

## Non-goals

- no full MRP or manufacturing optimizer
- no requirement for complete recipes/operations data
- no mandatory scheduler before first value
- no heavy infrastructure increase

## Final summary (mandatory)

### What already existed in the repo

- strong demand-to-production flow
- WIP and shift handoff as first-class concepts
- role-based workspace direction

### What was missing

- formal capacity model for feasibility and promise-date guidance
- explicit maturity path from simple heuristic to resource-aware planning

### What this proposal adds

- clear distinction between stock, WIP, and capacity
- staged model (LEVEL A/B/C)
- explicit warning posture and graceful incomplete-data behavior

### Next implementation PR (recommended)

Implement LEVEL A only:

- add capacity hint records (product/product-family day/shift envelope)
- add intake-time feasibility calculation using stock+WIP subtraction
- return status + confidence + suggested promise window as non-blocking guidance
