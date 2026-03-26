# SKOSS

SKOSS stands for **Small Kitchen Operations and Services System**.

It is an open-source operations system for small kitchens: bakeries, dark kitchens, food stalls, compact restaurant teams, and other food businesses that need clear daily coordination more than heavyweight enterprise software.

## SKOSS and SKOSSina

The project now uses two related names with different roles:

- **SKOSS** = the core system, server-side platform, shared operational brain, and main system of record
- **SKOSSina** = the worker-facing client experience that connects to SKOSS from phones, tablets, desktops, and browsers

In practical terms:

- SKOSS stores operational data, applies workflow rules, coordinates shared state, and serves connected clients
- SKOSSina gives staff a lighter, role-oriented interface for daily work such as order capture, production review, WIP updates, handoff, and fulfillment checks
- SKOSSina should remain usable across device types and may later exist as a browser-first experience, a PWA, and possibly packaged app forms

This distinction matters because the project should not blur the operational core with every future client surface. One SKOSS core system should be able to serve multiple SKOSSina clients without turning the backend into a fragmented app suite.

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

SKOSSina should expose this flow through lightweight, worker-oriented screens rather than admin-heavy back-office forms.

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

SKOSSina exists so those principles can reach workers directly through a practical client surface instead of making every task happen in a desktop-oriented admin UI.

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
8. **Printing is operational, not cosmetic.**
   Kitchen tickets, paper handoff notes, receipts, labels, and print-friendly summaries matter in real bakery and kitchen workflows.
9. **FOSS maintainability matters.**
   Early scope should stay disciplined, understandable, and implementation-agnostic.

## Progressive adoption

SKOSS should adapt to how a business already works instead of forcing a big admin project before first use.

A team should be able to create and track orders immediately, even if:

- no customer directory exists yet
- the product catalog is incomplete
- ingredients and suppliers are not loaded
- recipes are partially defined, lightweight, or missing
- recurring patterns are still being discovered

Structured data is still valuable, but it should refine real work rather than block it.

That same principle now applies to first-run setup: the initial onboarding flow should stay short and practical, capturing only a business name, language, preset, operating mode, and theme so a team can start quickly and adjust later.

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
- lightweight recipe and base recipe concepts
- base doughs and process profiles
- production batches
- work in progress (WIP)
- shift logs and handoff
- destinations and route-oriented output
- role-based workspaces
- print-friendly operational outputs such as tickets, summaries, and labels
- lightweight customer memory for repeat order-taking, fulfillment context, and handoff visibility
- a lightweight operational timeline surface for seeing due, overdue, and upcoming work across the day
- a browser-print-first foundation that keeps current printing practical without early printer-system bloat

The near-term focus is the transformation engine that connects these concepts rather than trying to solve every business function at once.

## Deployment direction

SKOSS should aim to be practical for small operators, not only for well-funded teams with managed cloud infrastructure.

Target deployment directions:

- **primary mode:** SKOSS hosted on a small Linux VPS or similar modest infrastructure, with SKOSSina clients connecting over the network
- **secondary mode:** SKOSS self-hosted on a local server, small office machine, or low-spec laptop on the local network, with SKOSSina clients connecting over LAN from multiple devices
- **future direction:** offline-aware or degraded-network behavior when internet access is unstable, without pretending full sync is already solved

This does **not** mean the project is promising full offline sync immediately. It means architecture decisions should leave room for local-first and reliability-friendly evolution later.

## Cross-device and printing direction

SKOSSina should be practical across phones, tablets, desktop browsers, and shared workstations.

That cross-device direction should support:

- quick worker access from browsers first
- touch-friendly layouts for kitchen and front-of-house use
- future PWA or packaged-app options where they improve deployment or reliability
- lightweight paper workflows such as kitchen tickets, packing slips, order summaries, and label printing
- future compatibility with common thermal-printer and label-printer scenarios

Printing should be treated as part of real operations, not as a cosmetic reporting feature.

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
- real paper, ticket, and labeling needs during production and packing

That makes Kalali a useful real-world domain for shaping the first version of SKOSS. It is narrow enough to stay grounded and specific, but rich enough to test the system's core ideas.

## SKOSS vs BAGET

For now, **SKOSS** is the umbrella system and repository name.

**BAGET** may later become a more public, product-facing brand or a bakery-focused presentation layer built on top of the same operational foundation.

In simple terms:

- **SKOSS** = the system name and broader operational framework
- **SKOSSina** = the worker-facing client within that framework
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
- printing expectations for real kitchen workflows
- portability and security baselines
- a disciplined MVP

## Repository map

- `AGENTS.md` — guidance for future coding agents and contributors
- `docs/product-vision.md` — project vision, domain-neutral scope, presets, and language strategy
- `docs/vision.md` — compatibility pointer to the main product vision document
- `docs/roadmap.md` — phased roadmap from v0 to a modular platform
- `docs/modules.md` — core, client, and extension architecture direction
- `docs/printing.md` — operational printing requirements and future hardware direction
- `docs/operational-time-surface.md` — why the timeline exists and how it stays intentionally lighter than a generic calendar
- `docs/domain-glossary.md` — practical domain definitions
- `docs/onboarding-and-csv-import.md` — first-run setup and lightweight CSV bootstrap workflow
- `docs/domain-model.md` — conceptual domain model
- `docs/i18n.md` — internationalization principles, dictionary strategy, and language-layer boundaries
- `docs/workspaces.md` — initial role-based workspace definitions
- `docs/operational-data-layer.md` — lightweight suppliers, raw materials, fulfillment context, and price-history direction
- `docs/activity-layer.md` — lightweight activity and audit visibility scope
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
- browser-first SKOSSina access to one shared SKOSS core
- print-friendly operational workflows as part of the product direction

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

For safe local exploration, keep `SKOSS_RUNTIME_MODE=demo` in `.env.local`.
In non-production runtime modes, the shell shows a visible banner and Setup includes a one-click demo reseed action.

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
- `app/api/` — lightweight JSON endpoints for orders, production, and handoff reads
- `components/` — shared shell/navigation components and forms
- `data/` — seed fixtures plus the simple file-backed demo store used by the first write loop
- `lib/domain/` — shared v0 domain types and formatting helpers
- `lib/server/` — workflow-shaped read/write helpers and server actions

The scaffold now also starts a lightweight operational data layer for:

- fulfillment distinctions on orders (`standard`, `pickup`, `own_delivery`, `app_delivery`)
- delivery metadata such as provider/source, optional assignee, promised time, and dispatch notes
- suppliers
- raw materials
- supplier-specific historical prices

This remains intentionally narrow so future recipe costing and supplier comparison can grow without turning the early product into a full procurement suite.

This scaffold is intentionally light. It now supports a first persisted operational loop without pretending the whole application is already designed.


Current fulfillment support is intentionally lightweight. SKOSS can now show pickup vs delivery, own delivery vs app delivery, and practical handoff/packing context. It still intentionally defers routing, GPS, live courier tracking, dispatch optimization, and marketplace API integrations.
