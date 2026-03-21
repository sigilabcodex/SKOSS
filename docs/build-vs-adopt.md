# Build vs Adopt

This document summarizes what SKOSS should likely build itself and what it should adopt from existing FLOSS tools.

The guiding rule is conservative:

- build the domain-specific core ourselves
- adopt stable generic infrastructure where it clearly reduces risk
- avoid heavy frameworks for problems SKOSS does not yet have

## Core principle

SKOSS should only adopt dependencies when they provide one of these advantages:

1. solve a generic problem better than a custom solution would
2. reduce long-term maintenance risk
3. preserve portability and self-hosting viability
4. remain small enough to replace later if needed

If a dependency mainly offers speed of initial implementation while adding architectural gravity, SKOSS should be skeptical.

## What SKOSS should likely build itself

## 1. Core domain logic

This includes:

- order capture rules under progressive adoption
- draft and placeholder entity behavior
- recurring order and recurring internal task semantics
- generated-instance editing rules
- demand grouping and production interpretation
- WIP adjustment logic
- shift handoff summarization
- role-shaped workspace behavior

### Why build this ourselves

This is the heart of the product.

These rules are specific to bakery and small-kitchen operations, especially around:

- base dough reuse
- variants
- partial structure
- handoff realities
- operator-first workflows

A generic framework or third-party platform will not model these correctly without forcing SKOSS into someone else's assumptions.

## 2. Data lifecycle and formalization rules

This includes:

- draft-to-structured conversion behavior
- merge/link semantics
- preservation of original labels and notes
- audit visibility rules around operational changes

### Why build this ourselves

These are domain trust rules, not utility concerns.

## 3. Production-day views and operational summaries

This includes:

- grouped demand views
- what-remains-to-do calculations
- handoff summaries
- operator-friendly visibility into uncertainty and notes

### Why build this ourselves

These are exactly where SKOSS becomes useful rather than generic.

## What SKOSS should likely adopt

## 1. Database engine

SKOSS should adopt a mature relational database instead of building custom persistence.

### Likely candidates

- SQLite
- PostgreSQL

### Why adopt

Storage engines, durability, indexing, and transactional correctness are solved problems best left to projects dedicated to them.

## 2. Recurrence library

SKOSS should adopt an RFC-aware recurrence engine rather than implementing date recurrence from scratch.

### Why adopt

Recurrence math is subtle and easy to get wrong. SKOSS should focus on product semantics such as exceptions and series edits, not low-level recurrence expansion.

## 3. Standard import/export tooling

SKOSS should adopt mature CSV parsing and generation libraries only if they are actually needed in the chosen implementation layer.

### Why adopt

CSV handling has many edge cases and little domain value.

## 4. Lightweight UI enhancement tools

If later implementation chooses server-driven HTML, adopting a lightweight enhancement layer may be worthwhile.

### Examples

- htmx
- Stimulus
- a modest table/grid component for admin-only views

### Why adopt

These can improve usability without forcing a full client application architecture.

## 5. Backup helpers where justified

If SQLite is chosen and off-machine replication becomes important, a tool like Litestream may be worth adopting.

### Why adopt

Backup plumbing is generic infrastructure and should not be reinvented casually.

## What SKOSS should avoid adopting early

## 1. Monolithic ERP or workflow platforms

### Why avoid

They would force the wrong data model, vocabulary, and user experience onto the project.

## 2. Sync-heavy offline stacks

### Why avoid

They introduce conflict-resolution obligations before SKOSS has validated the workflows that would need them.

## 3. Heavy SPA-first architecture by default

### Why avoid

SKOSS does not yet need large client-state systems, complex hydration, or sophisticated frontend build complexity just to support the documented v0 workflows.

## 4. Infrastructure-heavy auth and SSO systems

### Why avoid

Built-in authentication is usually sufficient for small self-hosted operations in v0. External identity control planes add more burden than value early on.

## 5. Realtime frameworks as a starting assumption

### Why avoid

Most v0 freshness needs can likely be covered by polling and selective push. Realtime frameworks should be earned by proven need.

## A practical boundary line

A useful rule of thumb is:

### Build when the problem is specific to small-kitchen operations

Examples:

- how recurring orders become dated operational work
- how WIP reduces remaining production requirements
- how a draft product becomes formal without losing historical truth
- how handoff summaries prioritize what the next shift must see

### Adopt when the problem is generic infrastructure

Examples:

- SQL storage
- recurrence expansion
- CSV parsing
- barcode rendering if ever needed
- narrow UI utilities
- backup tooling

## Dependency discipline rules

When SKOSS does adopt a dependency, it should prefer ones that are:

- permissively licensed
- actively maintained enough to trust
- documented clearly
- small enough to replace later
- widely portable across modest hosting environments
- not dependent on large proprietary services

## Red flags for adoption

SKOSS should treat these as warning signs:

- the dependency wants to define the app architecture
- the dependency assumes cloud-only hosting
- the dependency is hard to remove later
- the dependency solves five unrelated problems at once
- the dependency has weak documentation or erratic maintenance
- the dependency pushes the product toward admin-heavy workflows

## Current recommendation

For the next implementation phase, SKOSS should likely aim for:

- **build:** domain model behavior, production logic, recurrence semantics at the product level, WIP and handoff logic, progressive-adoption flows
- **adopt:** database engine, recurrence library, plain export/import helpers, lightweight UI enhancement if needed, backup helper only when justified
- **avoid for now:** sync-first platforms, heavy realtime layers, monolithic admin frameworks, external SSO stacks, barcode-first infrastructure

This keeps the project focused on the part only SKOSS can do well: turning real small-kitchen work into a maintainable, operator-first operational system.
