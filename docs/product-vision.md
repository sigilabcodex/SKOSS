# Product Vision

## Purpose

SKOSS exists to help small food operations run daily work with less friction.

The project focuses on the gap between taking an order and actually making and fulfilling the food. For many small kitchens, that gap is still managed through memory, paper notes, chat messages, and ad hoc routines. SKOSS aims to make that flow visible, shared, and easier to execute.

A core principle is simple:

**adapt to the workflow, do not force the workflow to adapt to the software.**

## SKOSS and SKOSSina

The project distinguishes clearly between two layers:

- **SKOSS** is the core system: the server-side platform, shared operational logic, and main system of record
- **SKOSSina** is the worker-facing client layer: the lighter app experience used by staff across phones, tablets, desktops, and browsers

This separation matters because the project should keep one dependable operational core while still allowing the worker experience to evolve.

In practice, that means:

- SKOSS owns data storage, workflow rules, shared state, coordination, and integrations
- SKOSSina focuses on fast access to role-shaped work such as order capture, production review, WIP updates, handoff, fulfillment checks, and print-triggering actions
- the core should not become bloated by every client-specific experiment
- the client should not become an admin-heavy shell that forces operators through setup-driven flows

SKOSSina may later exist as a browser-first experience, a PWA, or a packaged wrapper, but that packaging choice is still a direction rather than a settled product decision.

## Domain-neutral operational core

SKOSS must remain domain-neutral at its core.

The system should model generic operational concepts that appear across many food businesses, including:

- orders
- work items
- production
- handoff
- destinations
- fulfillment context
- work in progress

These are the durable concepts that matter whether the business is a bakery, cafe, restaurant, dark kitchen, prep kitchen, or food stall.

The core should not hardcode one industry's vocabulary into its data model, rules, or workflow assumptions. Terms such as dough, tray, espresso bar, prep station, or line check may matter in a specific preset or deployment, but they should not define the SKOSS core itself.

This keeps the system flexible enough to support different kitchen styles without turning the shared model into a patchwork of special cases.

## Operator-first systems

SKOSS is explicitly an operator-first system, not an admin-first one.

That means the product should be shaped around people doing real work during active service and production:

- prep cooks moving between staging, batching, finishing, and packing
- front-of-house staff capturing demand quickly
- shift leads coordinating partial completion and handoff
- small teams switching roles during the same day

The software should reduce friction in the kitchen rhythm instead of asking operators to behave like office administrators.

SKOSSina should therefore stay:

- lightweight on ordinary phones and tablets
- clear under time pressure
- touch-friendly for kitchen use
- role-oriented rather than one-size-fits-all
- practical for shared-device and browser-based access

## Progressive complexity

SKOSS should start simple and grow only when the business truly needs more structure.

This is a design rule, not just a roadmap preference.

The system should:

- work before setup is perfect
- allow draft and placeholder records
- make structure increasingly valuable over time
- add deeper capabilities progressively
- keep advanced features modular where possible

A small team should be able to get value early without committing to a large software project.

## Rejection of heavy ERP patterns

SKOSS should not drift into the shape of a traditional heavy ERP.

It should reject patterns such as:

- large back-office setup projects before first use
- forcing every workflow through normalized administration
- assuming desktop admin work is the main user journey
- making advanced identifiers central to daily work
- bundling every business function into one mandatory system

The product boundary should stay disciplined. When deeper business capabilities are useful, they should be added progressively and often as optional modules.

## Target users

Primary users include:

- operators working production shifts
- prep, production, finishing, and packing workers
- front-of-house staff taking or reviewing orders
- shift leads and supervisors coordinating handoff
- admins configuring products, schedules, and recurring work

These users are not assumed to be system specialists. Many will use SKOSSina quickly, under time pressure, on a phone or tablet.

## Target businesses

The project is aimed at small and medium food operations with repeatable production patterns, such as:

- bakeries
- cafes with production or prep flow
- dark kitchens
- food stalls
- small restaurants with recurring mise en place and prep cycles
- compact commissary or prep-kitchen teams

It is not aimed first at large enterprise manufacturing environments.

## Real-world workflow emphasis

SKOSS should remain grounded in the real flow of kitchen work:

- orders arrive
- demand is grouped and interpreted
- production requirements are derived
- WIP changes what still needs to be done
- work is handed across shifts
- final outputs are packed, dispatched, plated, or picked up

This rhythm matters more than abstract data purity.

The system should stay shaped by:

- kitchen timing
- recurring production habits
- role-based visibility
- handoff reality
- notes, substitutions, and partial completion
- paper and print-based touchpoints where operations still rely on them

## Core problems solved

SKOSS is intended to solve a small food operation's coordination problems, especially:

- turning incoming orders into clear production requirements
- supporting recurring orders without re-entering the same work repeatedly
- supporting recurring internal tasks that are not tied directly to a sale
- making WIP visible so teams do not overproduce or lose track of progress
- preserving notes, exceptions, and partial completion across shifts
- reducing the mental overhead required to understand what needs to happen next
- keeping role-based views focused on the work at hand
- allowing teams to start using the system before setup is complete
- supporting practical printed outputs such as tickets, labels, and summaries where that improves execution

## Product boundary

SKOSS should focus on the operational layer between demand and production execution.

That includes:

- order intake and order organization
- production planning logic
- recipe and process-oriented modeling where useful
- batch-oriented or work-item-oriented execution support
- shift logs and handoff visibility
- destination-aware output views
- lightweight administration needed to keep the above usable
- print-friendly operational outputs and printer-oriented workflows where they directly support work

It does not need to own every business function.

## Presets and first-run setup

SKOSS should support multiple business types through presets rather than through hardcoded industry behavior in the core.

A first-run flow should ask only for a few practical inputs:

- business name
- preset or business type, such as bakery, cafe, restaurant, or dark kitchen
- operating mode, such as pickup, delivery, dine-in support, or mixed
- default features enabled
- preferred system language

Presets are starting templates. They should define:

- naming conventions shown in the UI
- default units and measurement preferences
- example data and starter records
- workflow emphasis and visible defaults
- optional terminology packs suitable for a business type

Presets should:

- guide setup
- help teams start faster
- remain editable after setup
- never lock the system into one permanent model
- avoid changing the underlying core semantics

A bakery preset might prefer terminology around batches and proofing, while a cafe preset might emphasize prep lists and service readiness. Both should still map onto the same shared operational model.

## Multi-language support as a product requirement

Multi-language support is a first-class product requirement, not a late polish step.

At launch, SKOSSina should support at least:

- English
- Spanish
- Portuguese

Additional languages should be addable later without changing the core data model.

This matters because food businesses often operate with mixed-language teams, bilingual leads, or staff who are more comfortable executing daily work in a language different from the owner or implementer.

The system should therefore treat language in three separate layers:

1. **system language** — the interface language used by SKOSSina for navigation, labels, statuses, and guidance
2. **preset or business terminology** — the vocabulary a preset chooses for the same operational concept, such as using one term over another for work items or stations
3. **user-entered content** — freeform notes, customer details, order text, and other real-world content entered by users

These layers should remain distinct. Translating the interface should not rewrite stored user content, and choosing a preset should not redefine the core domain model.

## Architecture implications of presets and language

Several architecture constraints follow from the product vision:

- SKOSS core remains language-agnostic and stores stable operational concepts rather than rendered UI strings
- SKOSSina is responsible for language presentation and translation lookup
- translation uses key-based dictionaries rather than hardcoded strings in components
- preset terminology should be applied at the presentation layer or preset configuration layer, not by forking the core model
- stored data should preserve meaning without depending on one display language
- adding a new preset or language should be a configuration and dictionary expansion task, not a schema rewrite

This keeps presets lightweight, translations maintainable, and data portable.

## Progressive adoption stance

Early adoption matters.

Many small operators abandon software when it asks them to spend days on setup before it provides value. SKOSS should avoid that failure mode.

The vision is:

- take the order now
- capture the operational note now
- keep production moving now
- enrich structure later when there is time and clarity

That means the product should support draft and placeholder records without pretending they are ideal forever.

## Long-term direction

Over time, SKOSS should grow into a modular operational platform for multiple kitchen types while keeping the core system lightweight.

A likely long-term path includes:

- strong support for multiple small food business formats through presets
- reusable operational patterns across bakery, cafe, restaurant, and dark-kitchen workflows
- optional modules for richer CRM, procurement, analytics, integrations, and delivery depth
- a domain model stable enough to support presets and future product-facing skins
- architecture that stays practical for small self-hosted deployments
- a SKOSSina client direction that stays worker-oriented even as client packaging options expand
- a translation system that can add new languages without changing business logic

The long-term goal is breadth through a strong operational core, not breadth through indiscriminate feature sprawl.

## Deployment direction

SKOSS should aspire to be deployable in ways that match the realities of small businesses.

Preferred direction:

- run SKOSS well on a modest Linux VPS
- remain feasible on a small self-hosted server or local machine
- leave room for local-network use where SKOSSina clients connect over Wi-Fi or LAN
- support multiple client devices against one shared operational core
- avoid unnecessary dependence on heavyweight cloud infrastructure

A future offline-capable or degraded-network mode is desirable, but the project should be honest that reliable sync and conflict handling are hard problems. The vision is to design with that future in mind without pretending it is already solved.

## Printing as an operational requirement

Printing should be treated as a practical workflow requirement, not as a cosmetic report feature.

Important directions include:

- kitchen tickets that surface what needs to be made or packed
- order summaries and handoff sheets that can travel with work
- receipt or ticket-printer scenarios for fast front-of-house output
- label printing for trays, boxes, prep containers, or packaged items
- print-friendly SKOSSina views that work with lightweight thermal and label hardware later

Many food businesses still rely on paper at key moments. A credible operational system should support that reality instead of pretending every handoff is screen-only.

## Why one first implementation context still helps

A specific early implementation context can still be useful for discovery, but it must not define the product boundary.

For example, a bakery pilot can be valuable because it exposes:

- long-running production cycles
- shared upstream preparation feeding multiple outputs
- handoff between shifts
- recurring daily demand
- ticket and label printing needs

Those lessons should inform the generic model, then flow back into presets rather than becoming hardcoded bakery assumptions.

## What the project will not try to solve initially

The first phase should not try to solve:

- accounting and tax workflows
- full ERP back-office coverage
- complex procurement chains
- deep warehouse management
- enterprise planning optimization
- broad BI/reporting suites
- every business function at once
- high-ceremony configuration that blocks real usage
- infrastructure patterns that demand expensive always-on cloud services

The initial success condition is simpler: help a small food operation run daily operations more clearly, reliably, and lightly.
