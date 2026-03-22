# Vision

## Purpose

SKOSS exists to help small food operations run daily work with less friction.

The project focuses on the gap between taking an order and actually making and fulfilling the food. For many small kitchens, that gap is managed through memory, paper notes, chat messages, and ad hoc routines. SKOSS aims to make that flow visible, shared, and easier to execute.

A core principle is simple:

**adapt to the workflow, do not force the workflow to adapt to the software.**

## SKOSS and SKOSSina

The project should now distinguish clearly between two layers:

- **SKOSS** is the core system: the server-side platform, shared operational logic, and main system of record
- **SKOSSina** is the worker-facing client layer: the lighter app experience used by staff across phones, tablets, desktops, and browsers

This separation matters because the project should keep one dependable operational core while still allowing the worker experience to evolve.

In practice, that means:

- SKOSS owns data storage, workflow rules, shared state, coordination, and integrations
- SKOSSina focuses on fast access to role-shaped work such as order capture, production review, WIP updates, handoff, fulfillment checks, and print-triggering actions
- the core should not become bloated by every client-specific experiment
- the client should not become an admin-heavy shell that forces operators through setup-driven flows

SKOSSina may later exist as a browser-first experience, a PWA, or a packaged wrapper, but that packaging choice is still a direction rather than a settled product decision.

## Why this separation matters

A small kitchen often needs one shared operational brain and many lightweight access points.

This distinction helps the project preserve:

- a single source of truth for orders, production state, WIP, handoff, and fulfillment
- multiple device types connected to the same operational picture
- simpler deployment because one SKOSS core can serve many SKOSSina clients over WAN or LAN
- future flexibility to add richer client behaviors without turning the backend into many fragmented services
- clear product language for contributors, operators, and future module design

It also protects the operator-first philosophy. Workers should interact mainly through a lightweight SKOSSina experience, while deeper setup and administration remain supportive rather than dominant.

## Operator-first systems

SKOSS is explicitly an operator-first system, not an admin-first one.

That means the product should be shaped around people doing real work during active service and production:

- bakers moving between dough, proofing, baking, and packing
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

Primary users:

- operators working production shifts
- bakers, prep workers, and packers
- front-of-house staff taking or reviewing orders
- shift leads and supervisors coordinating handoff
- admins configuring products, schedules, and recurring work

These users are not assumed to be system specialists. Many will use SKOSSina quickly, under time pressure, on a phone or tablet.

## Target businesses

The project is aimed first at small and medium food operations with repeatable production patterns, such as:

- artisanal bakeries
- neighborhood bakeries with wholesale or recurring clients
- dark kitchens with repeated prep routines
- food stalls with predictable daily production
- small restaurants with recurring mise en place and prep cycles

It is not aimed first at large enterprise manufacturing environments.

## Real-world workflow emphasis

SKOSS should remain grounded in the real flow of kitchen work:

- orders arrive
- demand is grouped and interpreted
- production requirements are derived
- WIP changes what still needs to be done
- work is handed across shifts
- final outputs are packed, dispatched, or picked up

This rhythm matters more than abstract data purity.

The system should stay shaped by:

- kitchen timing
- recurring production habits
- role-based visibility
- handoff reality
- notes, substitutions, and partial completion
- paper and print-based touchpoints where operations still rely on them

## Core problems solved

SKOSS is intended to solve a small kitchen's operational coordination problems, especially:

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
- recipe and process-oriented modeling
- batch-oriented execution support
- shift logs and handoff visibility
- destination-aware output views
- lightweight administration needed to keep the above usable
- print-friendly operational outputs and printer-oriented workflows where they directly support work

It does not need to own every business function.

## Progressive adoption stance

Early adoption matters.

Many small operators abandon software when it asks them to spend days on setup before it provides value. SKOSS should avoid that failure mode.

The vision is:

- take the order now
- capture the operational note now
- keep production moving now
- enrich structure later when there is time and clarity

That means the product should support draft and placeholder records without pretending they are ideal forever.

## Future onboarding and presets

SKOSS should eventually provide a lightweight first-run setup to help teams start with sensible defaults.

A first-run flow should ask only for a few practical inputs:

- business name
- business type, such as bakery, cafe, restaurant, or dark kitchen
- operating mode, such as pickup, delivery, or mixed
- default features enabled

Presets should:

- guide setup
- tune initial vocabulary and visible features
- recommend a sensible starting configuration
- remain editable after setup
- never lock the system into one permanent model

This supports faster adoption while preserving flexibility.

## Long-term direction

Over time, SKOSS should grow into a modular operational platform for multiple kitchen types while keeping the core system lightweight.

A likely long-term path includes:

- strong bakery support first
- reusable operational patterns for other kitchen formats
- optional modules for richer CRM, procurement, analytics, integrations, and delivery depth
- a domain model stable enough to support presets and future product-facing skins
- architecture that stays practical for small self-hosted deployments
- a SKOSSina client direction that stays worker-oriented even as client packaging options expand

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
- label printing for trays, boxes, dough, or packaged items
- print-friendly SKOSSina views that work with lightweight thermal and label hardware later

Many bakeries and kitchens still rely on paper at key moments. A credible operational system should support that reality instead of pretending every handoff is screen-only.

## Why bakery is a strong first domain

Bakery operations highlight the exact coordination problems SKOSS is meant to solve:

- production often starts long before fulfillment
- fermentation and rest periods matter
- the same base dough can feed multiple product variants
- night and morning shifts depend on reliable handoff
- small process changes can affect quality, timing, and yield
- printed tickets and labels often matter in prep, baking, and packing

If SKOSS can work well for a bakery like Kalali, it has a realistic chance of supporting other compact production kitchens later.

## What the project will not try to solve initially

The first phase should not try to solve:

- accounting and tax workflows
- full ERP back-office coverage
- complex procurement chains
- deep warehouse management
- enterprise planning optimization
- broad BI/reporting suites
- every kitchen type at once
- high-ceremony configuration that blocks real usage
- infrastructure patterns that demand expensive always-on cloud services

The initial success condition is simpler: help a small kitchen run daily operations more clearly, reliably, and lightly.
