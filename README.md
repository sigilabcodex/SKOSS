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
- software setup time competes with real kitchen work

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
- **usable before setup is perfect**

## Project philosophy

The project starts from a few strong beliefs:

1. **Daily operation matters more than perfect setup.**
   A small kitchen must be able to work even without complete customer records, full product catalogs, detailed recipes, or advanced identifiers.
2. **You can work now, organize later.**
   The system should allow draft customers, draft products, uncategorized items, and freeform notes so operators can keep moving.
3. **Reality overrides plan.**
   Manual adjustments, partial completion, notes, and exceptions are not edge cases.
4. **Operators need role-shaped views.**
   A baker, seller, shift lead, and admin should not all see the same screen.
5. **Language should fit the kitchen.**
   User-facing flows should avoid ERP jargon and use practical terms.
6. **The system should grow from real use.**
   Domain understanding comes before premature architecture.
7. **Simple deployment matters.**
   The system should stay compatible with low-spec VPS hosting, small self-hosted servers, and practical local deployment.
8. **FOSS maintainability matters.**
   Early scope should stay disciplined, understandable, and implementation-agnostic.

## Progressive adoption

SKOSS should adapt to how a business already works instead of forcing a big admin project before first use.

A team should be able to create and track orders immediately, even if:

- no customer directory exists yet
- the product catalog is incomplete
- ingredients and suppliers are not loaded
- recipes are partially defined or missing
- recurring patterns are still being discovered

Structured data is still valuable, but it should refine real work rather than block it.

This implies support for placeholder records such as:

- draft customer
- draft product
- draft item
- uncategorized item
- freeform note item

These should be enrichable later as the business formalizes its process.

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

## Deployment direction

SKOSS should aim to be practical for small operators, not only for well-funded teams with managed cloud infrastructure.

Target deployment directions:

- **primary mode:** server-hosted use on a small Linux VPS or similar modest infrastructure
- **secondary mode:** self-hosted use on a local server, small office machine, or low-spec laptop on the local network
- **future direction:** offline-aware or degraded-network behavior when internet access is unstable

This does **not** mean the project is promising full offline sync immediately. It means architecture decisions should leave room for local-first and reliability-friendly evolution later.

## Portability and trust

Small businesses should not be trapped inside fragile software.

SKOSS should favor:

- practical exports in human-manageable formats
- reliable backups
- simple restore paths
- architecture that can be understood and maintained by FOSS contributors
- sensible privacy and security defaults for customer and operational data

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
- cloud-heavy architecture assumptions that raise hosting burden early

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
- progressive adoption behavior
- lightweight deployment expectations
- portability and security baselines
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
- `docs/progressive-adoption.md` — draft-first and zero-blocking workflow principles
- `docs/deployment-principles.md` — lightweight hosting and local-first direction
- `docs/security-and-portability.md` — practical security, backup, and restore principles
- `docs/architecture-options.md` — practical architecture direction comparison for v0
- `docs/technical-decision-framework.md` — criteria for choosing architecture and major dependencies
- `docs/data-lifecycle.md` — how draft, structured, recurring, and historical data should evolve
- `docs/realtime-offline-strategy.md` — selective realtime and offline-aware boundaries
- `docs/deployment-modes.md` — likely hosting modes and their tradeoffs
- `docs/floss-landscape.md` — conservative FLOSS dependency landscape review
- `docs/build-vs-adopt.md` — what SKOSS should own directly vs adopt from FLOSS tools
- `docs/future-ideas.md` — intentionally deferred ideas
- `docs/ux-principles.md` — practical UX rules
- `docs/open-questions.md` — unresolved product and domain questions

## Contributing mindset

The best early contributions are not flashy abstractions. They are careful clarifications of:

- what operators actually do
- what information they need at each moment
- what should remain optional
- what should stay out of scope until the core loop works
- what architecture assumptions would accidentally make the system heavier than its users need

If you contribute, prefer concrete operational understanding over generic software patterns.


## v0 implementation direction

The repository now includes a first implementation-oriented convergence pass.

### Chosen v0 path

- single deployable Next.js web application
- server-centered architecture with one Node.js process
- SQLite as the v0 database choice
- mobile-first workspace UI for sales, kitchen, handoff, and setup
- polling-first freshness strategy with room for selective SSE later
- offline-aware but not offline-sync-first

### New v0 documents

- `docs/adr/0001-v0-architecture.md` — concrete architecture decision record for v0
- `docs/v0-technical-spec.md` — implementation-oriented v0 product specification
- `docs/v0-api-surface.md` — minimal conceptual backend surface
- `docs/v0-state-transitions.md` — small workflow state model
- `docs/v0-seed-scenario.md` — Kalali end-to-end demo target

## Local development

The repo now contains a lightweight implementation scaffold.

### Prerequisites

- Node.js 20+
- npm 10+

### Run locally

```bash
cp .env.example .env.local
npm install
npm run dev
```

Then open `http://localhost:3000`.

### Available commands

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
```

## Scaffold overview

The first implementation scaffold includes:

- `app/` — Next.js App Router pages for the first workspaces
- `app/api/` — placeholder JSON endpoints for orders, production, and handoff
- `components/` — shared shell/navigation components
- `data/` — demo fixtures reflecting the Kalali seed scenario
- `lib/domain/` — shared v0 domain types and formatting helpers
- `lib/server/` — workflow-shaped demo aggregation functions

This scaffold is intentionally light. It is meant to give the project a clean place to start implementing real v0 features without pretending the whole application is already designed.
