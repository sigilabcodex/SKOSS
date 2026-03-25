# Activity Layer (Lightweight Audit Visibility)

## Purpose

SKOSS now includes a lightweight activity layer to make key operational changes visible without adding enterprise audit complexity.

This layer is designed to improve:

- trust (teams can see what changed)
- collaboration (shared context across shifts and roles)
- debugging (recent actions are easier to trace)

## What is tracked

The activity feed records high-value events only.

Current tracked event families:

- **orders**: create, update, status-changing updates
- **customers**: create, update, active/inactive change
- **suppliers**: create, update, active/inactive change
- **raw materials**: create, update, active/inactive change
- **recipes**: create, update, active/inactive change
- **users**: create, update, active/inactive change

Each activity entry includes:

- entity type
- entity id
- action type
- timestamp
- acting user id (when available)
- human-readable summary

## What is intentionally not tracked

To keep this layer practical and maintainable, SKOSS intentionally does **not** track:

- every field-level mutation
- low-value UI interactions
- full before/after state snapshots
- replay-grade event streams
- event sourcing mechanics

The goal is operational visibility, not a heavy compliance ledger.

## Current UI surfaces

Activity is currently visible in:

- **Home**: recent cross-system activity panel
- **Timeline**: recent activity alongside time-based operational attention
- **Customers**: per-customer recent activity

## i18n stance

The activity UI remains compatible with existing multilingual support (English, Spanish, Portuguese).

The feed keeps summaries human-readable and concise.

## Evolution path

Future increments may add:

- additional per-entity activity views (for example orders, recipes, suppliers)
- basic filtering by entity type or action
- configurable retention or export patterns

Future work should preserve the current principle:

**make activity visible, not complex.**
