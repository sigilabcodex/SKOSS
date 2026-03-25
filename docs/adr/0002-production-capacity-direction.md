# ADR 0002: Production Capacity and Promise-Date Direction

- **Status:** Accepted (documentation direction)
- **Date:** 2026-03-25
- **Related:** `docs/production-capacity-model.md`, `docs/promise-date-and-feasibility.md`, `docs/capacity-resources.md`

## Context

SKOSS v0 focuses on the operational loop from orders to production and handoff. The documentation already supports grouped demand, WIP, and shift context, but does not yet define a formal approach for capacity-aware promise guidance.

Teams need practical help answering "can we promise this date/time?" during intake without turning SKOSS into a heavy manufacturing ERP.

## Decision

SKOSS adopts a staged capacity direction:

1. **Stage 1: heuristic/day-level capacity**
   - product or product-family envelopes
   - WIP-aware gap estimation
   - non-blocking warnings
   - suggested promise window
2. **Stage 2: resource-aware planning**
   - key human + equipment bottlenecks
   - simple availability windows
   - clearer bottleneck reasons
3. **Stage 3: optional schedule refinement**
   - queue/sequencing improvements as optional layer
   - not required for core operational value

## Why this decision

- aligns with operator-first and progressive-adoption philosophy
- gives near-term value with low setup burden
- remains compatible with low-spec single-app direction
- avoids premature architecture and optimizer complexity
- preserves reversibility while domain detail matures

## What we are explicitly not doing now

- no full finite-capacity scheduling optimizer
- no MRP-style planning explosion
- no mandatory complete recipe/process setup
- no microservice split for planning
- no hard dependency on advanced infrastructure

## Consequences

### Positive

- faster path to feasible promise guidance in intake
- better visibility of overload risk
- preserves practical UX and kitchen-readable language
- supports incremental model improvement with real data

### Tradeoffs

- early estimates are approximate, not exact
- confidence indicators are required to avoid false precision
- some teams may still rely on manual override until stage 2 matures

## Validation approach

Early validation should focus on:

- reduction of unrealistic promise commitments
- operator trust in warnings and suggested windows
- usefulness under incomplete setup
- minimal overhead for setup maintenance

## Revisit triggers

Revisit this ADR when:

- stage 1 is implemented and field-tested
- resource-aware signals show consistent demand for deeper sequencing
- operational evidence justifies stage 3 complexity
