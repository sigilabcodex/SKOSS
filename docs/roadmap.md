# Roadmap

## Current state (v0 operational slice)

SKOSS now has a stable first operational slice focused on the daily coordination loop:

- order intake for ad hoc and recurring demand
- recurring templates for repeated customer work and internal routines
- production board views that translate demand into actionable work
- WIP visibility and shift handoff support
- an initial UI/UX system shaped for mobile-first operator use

This v0 slice proves the core value of SKOSS: helping a small food operation move from incoming demand to coordinated production without requiring heavy admin setup first.

It also clarifies the product split going forward:

- **SKOSS** remains the core system and shared operational backend
- **SKOSSina** becomes the worker-facing client direction for daily access across devices

## Short-term (next iterations)

The next iterations should strengthen fulfillment clarity and daily operator visibility without making the product heavier.

### Domain-neutral foundation and presets

The next iterations should make the domain-neutral foundation explicit across product and technical work.

Near-term priorities should include:

- keeping core workflow concepts generic across bakery, cafe, restaurant, dark-kitchen, and similar food operations
- introducing presets as the preferred way to express business-specific terminology and startup defaults
- making sure example data, onboarding copy, and default workflows can vary by preset without fragmenting the core model
- validating that preset choice is a starting template rather than a lock-in mechanism

### Internationalization as a foundational requirement

Internationalization should be treated as part of the product foundation rather than deferred UI polish.

Near-term i18n priorities should include:

- English, Spanish, and Portuguese support in SKOSSina
- key-based translation dictionaries for UI strings
- consistent separation between system language, preset terminology, and user-entered content
- avoiding hardcoded interface strings in new client work

### SKOSSina browser-first client direction

The near-term client goal should be a lightweight, browser-first SKOSSina experience that works well on:

- phones used during active shifts
- tablets shared in kitchen or sales areas
- desktop browsers where leads or admins need more screen space
- mixed-device local/LAN environments where multiple workers connect to the same SKOSS core

This should stay focused on worker speed, role-based visibility, and low-friction interactions rather than rich-client complexity for its own sake.

### Fulfillment modes

Orders should clearly support lightweight fulfillment modes:

- `pickup`
- `own_delivery`
- `app_delivery`

These modes should stay close to order entry and handoff views so teams can understand fulfillment context at a glance.

### Delivery assignment and status

SKOSS should add simple delivery coordination where it directly helps operations:

- delivery assignee or route assignment
- visible fulfillment status
- dispatch and handoff notes
- quick review of what is ready, packed, out, or pending

This should remain practical dispatch support, not a full logistics suite.

### Improved order metadata

Order records should gain a small amount of additional structure where it improves execution:

- better contact and destination context
- fulfillment-specific notes
- timing windows or promised-ready context
- source labels when useful
- clearer order tags or priority markers when they reduce confusion

This metadata should improve visibility for operators without turning order capture into an admin form.

### First printing workflows

Printing should enter the roadmap as an explicit operational requirement.

Near-term printing priorities should include:

- kitchen-ticket output for production and packing queues
- order summary prints for handoff or delivery prep
- receipt or ticket-printer friendly formats where front-of-house speed benefits
- print-friendly layouts that can be triggered from SKOSSina without desktop-only assumptions

The emphasis should be lightweight operational output, not a complex reporting subsystem.

### UI refinements where needed

The first UI system should continue improving around real kitchen and front-of-house use:

- clearer status hierarchy
- better touch handling on phones and tablets
- faster order review and edit flows
- stronger visibility for notes, exceptions, and partial completion
- more focused role-oriented views where daily use shows friction

### Admin operability pass (current focus)

The immediate priority is to make existing setup/admin foundations genuinely operable before adding more subsystems.

Current emphasis:

- complete practical CRUD behavior for customers, suppliers, raw materials, recipes, and users
- strengthen linking flows (for example customer-to-order and recipe-to-cost evidence workflows)
- reduce placeholder/demo behavior in setup surfaces
- improve cross-surface navigation so setup feels like a working area, not a static showcase

This stays intentionally lightweight:

- no deep procurement workflow
- no inventory deduction engine
- no accounting extension
- no large architectural rewrite

The quality bar is operational usability first: teams should be able to maintain core setup records and connect them to daily work with low friction.

## Medium-term (structured operations data)

Once the v0 loop is stable, SKOSS should add a lightweight structured operations layer that supports repeatable setup without blocking daily work.

### Customer (CRM light)

Customer records should become more useful while remaining operationally lightweight:

- reusable customer profiles
- practical contact details
- preferred destinations or fulfillment context
- customer notes that support real service and production coordination

This is not meant to become a full sales CRM.

### Suppliers

Supplier records should capture the minimum structure needed for purchasing memory:

- supplier identity and contact details
- active or inactive state
- practical notes
- links to historical pricing

### Raw materials / ingredients

Raw materials should provide a stable ingredient reference for future recipe and cost intelligence:

- practical material names
- categories
- default units
- optional brand or presentation context
- notes for operator clarity

### Supplier price history

Supplier pricing should be historical rather than overwritten in place:

- dated price entries by supplier and ingredient
- package quantity and package unit
- total price and optional normalized rate later
- notes for brand, presentation, or market context

### Basic purchasing visibility

SKOSS should support lightweight purchasing awareness before introducing procurement workflows:

- recent supplier prices
- alternate supplier comparison
- simple visibility into what materials are usually sourced where
- basic awareness of price changes over time

### Preparation for recipe costing

Recipe costing should remain deferred, but the data model should prepare for it.

The goal is to make later costing possible by establishing:

- reusable ingredient references
- supplier-specific price history
- date-aware price evidence
- relationships that can later support recipe cost snapshots

This stage should stop short of building full costing, margin engines, or inventory accounting.

### Cross-device SKOSSina progression

Once the browser-first client is stable, medium-term client work can explore:

- installable PWA behavior where it clearly improves repeat access
- packaged desktop or mobile wrappers only if they simplify deployment or hardware integration
- shared-device login and role-switching flows
- better local caching of static assets and selected draft interactions without promising full offline sync

These should remain directionally open, not treated as already-solved packaging decisions.

### LAN and local-server milestones

Medium-term deployment and client milestones should include:

- clearer local/LAN discovery and setup guidance
- practical multi-device access against one on-site SKOSS host
- admin-light configuration for single-site kitchens running on local hardware
- stronger degraded-network behavior when SKOSSina can still reach a local server during internet outages

### Printing expansion

After initial print workflows exist, medium-term printing work should include:

- label-printing support for trays, boxes, prep containers, or packaged outputs
- thermal-printer friendly layouts for common kitchen and counter scenarios
- explicit printer-targeted templates for ticket, summary, and label use cases
- practical print queues or print actions that do not overload the core workflow model

### Preset system maturation

Once the initial preset approach is proven, medium-term work should include:

- preset packages for bakery, cafe, restaurant, dark-kitchen, and similar business types
- editable terminology and workflow-emphasis settings per preset
- preset-managed starter data such as default units, example destinations, and role-oriented workspace hints
- migration-safe ways to evolve presets without rewriting stored operational data

### Broader kitchen coverage

The roadmap should explicitly extend beyond bakery-first discovery. Medium-term product validation should test whether the same core model works for:

- cafes with light production and service coordination
- restaurants with recurring prep and handoff needs
- dark kitchens with order-driven batching and dispatch flow
- mixed operations that combine retail, prep, and delivery modes

### Language expansion and governance

After the launch set of English, Spanish, and Portuguese is stable, medium-term i18n work should include:

- translation review workflows for new languages
- dictionary organization that scales without duplicating business logic
- terminology overrides where presets need business-specific wording without forking component code
- clear fallback behavior when translations are incomplete

## Medium-term extensions (still lightweight)

After the first structured data layer is stable, SKOSS can add higher-value operational extensions that still preserve core simplicity.

### CRM light features

Possible CRM light additions include:

- customer notes
- tags
- order history review
- simple segmentation such as wholesale, retail, recurring, or seasonal

These should support better service and planning without creating a heavy sales pipeline system.

### Delivery tracking improvements

Possible lightweight delivery improvements include:

- better dispatch status flow
- route or driver visibility
- clearer packed vs handed-off vs delivered states
- optional delivery-provider references for app delivery work

### Basic analytics

Analytics should stay close to operational decision-making:

- daily summaries
- demand trends
- fulfillment mix trends
- recurring-vs-ad-hoc visibility
- simple production and handoff review signals

The purpose is to help operators and leads see patterns, not to create a broad BI stack.

## Long-term vision (modular ecosystem)

Longer term, SKOSS should evolve into a modular ecosystem built around a disciplined operational core.

### SKOSSina beyond the first browser client

Long-term client direction may include:

- a mature multifunction SKOSSina client rather than many fragmented single-purpose apps
- optional packaged forms for platforms where browser delivery is not enough
- role-focused sub-experiences layered on one shared client foundation
- hardware-specific adaptations for printing, shared kiosks, or station devices where justified

The project should stay careful not to overpromise native/mobile packaging details before real use proves the need.

### Plugin / module system

The core system should stay small and dependable, while advanced capabilities become optional modules.

A future module system could support:

- enablement by business need
- preset bundles for different kitchen types
- clear separation between core workflows and advanced features
- reversible adoption instead of one-way platform bloat

### Advanced CRM

A future CRM-focused module could provide richer customer relationship features beyond the lightweight default layer.

### Full procurement workflows

A procurement-focused module could later add:

- purchase order flows
- receiving
- supplier coordination
- deeper purchasing history and comparison

These should remain outside the core until clearly justified.

### Recipe costing and margin analysis

A future costing module could add:

- recipe cost snapshots
- supplier-aware costing inputs
- margin analysis
- pricing support

This belongs in a later stage because it depends on stable upstream data and should not distort the operator-first core.

### Integrations

Integration modules may later connect SKOSS to:

- POS systems
- delivery platforms
- GPS or route tools
- messaging tools
- printer integrations and hardware adapters
- other practical operational services

### Multi-location support

Multi-location coordination may later become a major extension area, especially for businesses that share templates, products, or reporting across sites.

This should be treated as a deliberate expansion area, not as an assumption built into the earliest product core.

### Hosted/local portability direction

Longer term, SKOSS should preserve the ability to move between:

- server-hosted deployments
- local/LAN deployments
- future backup-or-mirror patterns that improve resilience without jumping too early into active bidirectional sync

## Core vs extension philosophy

SKOSS should grow by protecting a lightweight operational center.

Core should remain focused on:

- orders and recurring demand
- production interpretation
- WIP visibility
- shift handoff
- practical fulfillment context
- role-oriented operator workflows
- core printing actions that directly support daily execution
- one shared backend that can serve multiple SKOSSina clients

Extensions should be used for features that are valuable but not essential for every small kitchen, especially when they add setup burden, data depth, or workflow ceremony.

A good rule is:

- if it helps nearly every operator complete daily work, it may belong in core
- if it adds advanced administration, deeper analysis, or business-specific workflow layers, it likely belongs in a module or progressive layer

## Future onboarding and preset system

SKOSS should eventually offer a lightweight first-run setup that helps a business start quickly without locking it into a rigid template.

### First-run setup

A first-run flow should ask only for a few practical choices:

- business name
- business type, such as bakery, cafe, restaurant, dark kitchen, or food stall
- operating mode, such as pickup, delivery, dine-in support, or mixed
- default features enabled
- preferred system language

### Preset behavior

Presets should:

- guide initial setup
- adjust vocabulary, defaults, visible features, and starter terminology where useful
- recommend a sensible starting module set
- remain fully editable after setup
- never lock the business into one model

The goal is faster activation, not template rigidity.

## Summary

SKOSS should evolve from a stable v0 operational slice into a modular operational platform by expanding in layers:

1. strengthen fulfillment, printing, and daily workflow clarity
2. add lightweight structured data for customers, suppliers, and ingredients
3. introduce cross-device SKOSSina growth, local/LAN maturity, and optional operational intelligence
4. grow advanced capabilities through modules instead of bloating the core

Complexity stays controlled by keeping the operator workflow small, making deeper structure progressive, preserving a clear SKOSS core plus SKOSSina client split, and moving advanced business functions into optional modules rather than forcing every kitchen into ERP-style depth.
