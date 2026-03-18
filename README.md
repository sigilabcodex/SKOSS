# SKOSS

SKOSS stands for **Small Kitchen Operations and Services System**.

It is an open-source operations system for small kitchens: bakeries, dark kitchens, food stalls, compact restaurant teams, and other food businesses that need clear daily coordination more than heavyweight enterprise software.

## What SKOSS is

SKOSS is not just a POS, not just inventory, and not just task management.

Its core purpose is to help a real food operation move from:

**orders -> production plan -> prep and dough work -> work in progress -> shift handoff -> final output**

That means the system is designed around the actual flow of work in a kitchen:

- taking and organizing orders
- understanding what must be produced
- converting demand into batches, prep, and tasks
- tracking what is already in progress
- handing work from one shift to another
- keeping operators aligned without burying them in admin overhead

## Who it is for

SKOSS is for small and medium food operations that usually do not fit well inside traditional ERP-style systems, including:

- artisanal bakeries
- small production kitchens
- dark kitchens
- food stalls and market operators
- compact restaurants with repeatable prep and production workflows

It is especially aimed at teams where:

- one person may wear multiple roles in a day
- phones and tablets are more common than office desktops
- process consistency matters, but simplicity matters even more
- planning and real-world execution drift apart constantly

## Why it exists

Most available systems split the problem badly.

Some focus on sales, but not production reality.
Some focus on inventory and accounting, but not operator speed.
Some assume barcodes, SKUs, fixed manufacturing models, or dedicated back-office admins.
Many feel too heavy, too abstract, or too rigid for a working kitchen.

SKOSS exists to offer a lighter, more practical alternative:

- **operator-first, not admin-first**
- **mobile-first and touch-friendly**
- **forgiving when reality changes**
- **clear enough for shift work**
- **structured enough to support consistency**

## Project philosophy

The project starts from a few strong beliefs:

1. **Daily operation matters more than perfect master data.**
   A small kitchen must be able to work even without SKUs, barcodes, or complex setup.
2. **Reality overrides plan.**
   Manual adjustments, partial completion, notes, and exceptions are not edge cases.
3. **Operators need role-shaped views.**
   A baker, seller, shift lead, and admin should not all see the same screen.
4. **Language should fit the kitchen.**
   User-facing flows should avoid ERP jargon and use practical terms.
5. **The system should grow from real use.**
   Domain understanding comes before premature architecture.
6. **FOSS maintainability matters.**
   Early scope should stay disciplined, understandable, and implementation-agnostic.

## Initial scope

The initial product direction centers on the operational backbone of small kitchen work:

- orders and order lines
- recurring orders
- recurring internal tasks
- products and product variants
- recipe and base recipe concepts
- base doughs and process profiles
- production batches
- work in progress (WIP)
- shift logs and handoff
- destinations and route-oriented output
- role-based workspaces

The near-term focus is the transformation engine that connects these concepts rather than trying to solve every business function at once.

## Non-goals for the first phase

SKOSS should **not** try to become a full ERP from day one.

Early non-goals include:

- accounting and bookkeeping
- full procurement suites
- deep inventory valuation
- payroll and HR workflows
- enterprise manufacturing complexity
- mandatory barcode or SKU-centric operations
- broad analytics before the operational core is reliable

Advanced identifiers such as SKU, barcode, and internal codes may exist later as optional power features, but they should not shape the first user experience.

## Why Kalali is the first implementation context

The first real implementation target is **Kalali**, a small artisanal bakery.

Kalali is a strong proving ground because it combines:

- long fermentation cycles
- night production and morning baking
- reusable base dough families
- multiple sellable variants from the same dough
- standardized processes shared across different workers
- frequent need for handoff between shifts

That makes Kalali a useful real-world domain for shaping the first version of SKOSS. It is narrow enough to stay grounded and specific, but rich enough to test the system's core ideas.

## SKOSS vs BAGET

For now, **SKOSS** is the umbrella system and repository name.

**BAGET** may later become a more public, product-facing brand or a bakery-focused presentation layer built on top of the same operational foundation.

In simple terms:

- **SKOSS** = the system name and broader operational framework
- **BAGET** = a possible future product/branding expression, especially for bakery use

## Current status

This repository currently establishes the documentation and product-spec foundation for the project.

Before heavy implementation begins, the goal is to clarify:

- domain language
- product boundaries
- operational model
- role-based workspaces
- recurrence logic
- production logic
- a disciplined MVP

## Repository map

- `AGENTS.md` — guidance for future coding agents and contributors
- `docs/vision.md` — project vision and scope boundaries
- `docs/domain-glossary.md` — practical domain definitions
- `docs/domain-model.md` — conceptual domain model
- `docs/workspaces.md` — initial role-based workspace definitions
- `docs/recurring-logic.md` — recurrence model and editing rules
- `docs/production-logic.md` — order-to-production transformation logic
- `docs/mvp-v0.md` — narrow first MVP definition
- `docs/future-ideas.md` — intentionally deferred ideas
- `docs/ux-principles.md` — practical UX rules
- `docs/open-questions.md` — unresolved product and domain questions

## Contributing mindset

The best early contributions are not flashy abstractions. They are careful clarifications of:

- what operators actually do
- what information they need at each moment
- what should remain optional
- what should stay out of scope until the core loop works

If you contribute, prefer concrete operational understanding over generic software patterns.
