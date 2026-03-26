# ADR 0002: Production Capacity and Promise-Date Direction

- **Status:** Accepted (documentation direction)
- **Date:** 2026-03-25
- **Related:** `docs/production-capacity-model.md`, `docs/promise-date-and-feasibility.md`, `docs/capacity-resources.md`, `docs/setup-capacity-and-resources-ux.md`

## Context

SKOSS already defines the demand-to-production-to-handoff loop and treats WIP as first-class. What is missing is a formal, practical way to estimate feasibility and suggest promise dates during order intake.

The system must stay operator-first and progressive. It cannot require perfect setup or become an ERP scheduler before proving value.

## Decision

Adopt a staged capacity model.

### Stage 1 — heuristic capacity (near-term)

- per-day/per-shift envelopes
- product/product-family capacity hints
- stock + WIP subtraction before capacity check
- non-blocking feasibility warnings and suggested promise windows

### Stage 2 — resource-aware capacity (mid-term)

- key human shift effort by role
- key equipment and bottleneck resources
- simple stage/resource mapping for clearer reason labels

### Stage 3 — scheduling refinement (optional future)

- optional timeline/queue refinement
- optional sequencing support
- explicitly not required for core SKOSS value

## Rationale

Why not start with a scheduler:

- high setup burden and fragile assumptions early
- risks blocking operations when data is incomplete
- increases complexity before operator trust is established

Why not build MRP:

- MRP scope exceeds current product intent
- introduces ERP-heavy concepts too early
- conflicts with progressive adoption and low-friction intake goals

Why this stays aligned with SKOSS:

- practical heuristics first
- non-blocking guidance over rigid automation
- reversible increments with real-kitchen feedback
- compatible with low-spec/self-host deployment constraints

## Consequences

### Positive

- immediate promise-date guidance can be delivered in a narrow PR
- overload risk becomes visible earlier in sales and production flows
- keeps domain language kitchen-readable

### Tradeoffs

- early guidance is approximate
- confidence and reason labels are mandatory to avoid false precision
- overrides remain important until Stage 2 matures

## What is explicitly out of scope now

- finite-capacity optimizer
- full timeline scheduler as required core behavior
- mandatory complete recipe/process modeling
- architecture split into planning microservices

## Revisit triggers

Revisit when:

- Stage 1 is implemented and measured
- field evidence shows Stage 2 bottleneck signals are insufficient
- specific workflows prove Stage 3 scheduling value
