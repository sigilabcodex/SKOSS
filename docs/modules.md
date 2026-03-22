# Modules

## Purpose

SKOSS should remain lightweight at its core even as it gains more capability.

The purpose of a future modular architecture is to let the system grow without turning the base product into a heavy ERP. Core workflows should stay clear, fast, and usable for small operators. Advanced capabilities should be added progressively and only when they solve a real operational need.

## SKOSS core and SKOSSina client

The project should now use architecture language more precisely:

- **SKOSS** = the core system, shared server-side platform, domain logic, and system of record
- **SKOSSina** = the worker-facing client layer that connects to SKOSS from browser and future app surfaces

This means modularity has two dimensions:

1. **core vs optional business modules** inside or around SKOSS
2. **client surface evolution** inside SKOSSina without bloating the SKOSS core

The core should remain authoritative for data, workflow rules, printing actions, and shared coordination. SKOSSina should remain focused on presenting those capabilities in lightweight, role-oriented ways.

## Core vs modules

### What belongs in core

Core should include the workflows that define SKOSS's operational backbone:

- order intake
- recurring templates
- production interpretation and board views
- WIP tracking
- shift handoff
- practical fulfillment context
- lightweight product-to-raw-material recipe links for costing and print foundations
- role-oriented workspaces
- lightweight draft-first behavior
- core print-oriented actions such as tickets, summaries, or labels where they directly support operations
- the APIs, routes, and server behaviors needed to serve multiple SKOSSina clients

These capabilities are broadly useful across small food businesses and are central to the promise of "work now, organize later."

### What belongs in modules

Modules should contain capabilities that add depth, specialization, or setup burden beyond the base operational loop.

Good module candidates usually have one or more of these traits:

- not every business needs them
- they require more structured data
- they add domain-specific workflows beyond the daily core
- they benefit from being enabled progressively
- they may evolve at different speeds than the core product

Examples include richer CRM, procurement workflows, deeper analytics, external integrations, and multi-location coordination.

## Client architecture direction

SKOSSina should start as a lightweight browser-first client, with room for more packaging options later.

That client direction should preserve:

- mobile-first access on phones and tablets
- useful desktop access for leads, admins, or shared stations
- browser-based use as the default simplest path
- future PWA or packaged-wrapper options when they improve deployment, reliability, or hardware access
- one multifunction operational client rather than many fragmented apps too early

The project should avoid turning the SKOSS core into a pile of client-specific microservices just because more than one access surface may exist later.

## Server and client roles

### SKOSS server responsibilities

The SKOSS core should own:

- data storage
- workflow and domain rules
- authentication and role context
- printing intent and print-job preparation where relevant
- shared operational state across users and devices
- stable integration boundaries for optional modules or future hardware adapters

### SKOSSina client responsibilities

The SKOSSina layer should focus on:

- fast worker interactions
- role-shaped screens and navigation
- touch-friendly input and review flows
- clear status visibility under time pressure
- triggering print-friendly outputs without requiring desktop admin workflows
- staying lightweight enough for modest devices and local/LAN use

## Design principles for modules

Modules should follow a few strict rules.

### 1. Do not break core simplicity

The core product should remain understandable and usable even when no advanced modules are enabled.

### 2. Add depth, not mandatory ceremony

A module should improve capability for teams that need it without forcing all teams into extra setup.

### 3. Integrate through stable domain concepts

Modules should attach to clear shared entities such as orders, customers, suppliers, ingredients, fulfillment records, production history, and print artifacts rather than bypassing the core model.

### 4. Stay operator-aware

Even when a module is more administrative, it should not degrade the operator experience with irrelevant noise or ERP-like terminology.

### 5. Be progressive and reversible

Businesses should be able to enable a module when ready, and the system should avoid assumptions that every deployment will eventually need every module.

### 6. Do not bloat the client to solve backend boundaries

If an optional capability mainly affects business depth, it should usually enter through the SKOSS core or a clean extension boundary rather than by fragmenting SKOSSina into many disconnected mini-apps.

## Example modules

### CRM+

CRM+ could extend the lightweight customer layer with:

- richer notes and relationship history
- tags and simple segmentation
- customer activity summaries
- reminders or basic follow-up context

CRM+ should build on the core customer and order model, not replace it with a sales-heavy pipeline system.

### Procurement+

Procurement+ could extend supplier and ingredient records with:

- purchase order workflows
- receiving
- supplier comparison views
- reorder support
- deeper purchasing history

The core foundation should still stop well before this point. A lightweight supplier list, raw material list, recipe/formula links, and append-only supplier price history belong in the base operational data layer because they support future costing and buying memory without forcing formal procurement workflows.

This should remain optional because many small kitchens will not need formal procurement structure early.

### Delivery tracking+

Delivery tracking+ could extend the fulfillment layer with:

- richer dispatch states
- route coordination
- driver assignment history
- proof-of-delivery style events
- optional GPS or map integrations

The core system should still handle basic pickup and delivery status without this module.

### Analytics+

Analytics+ could extend operational reporting with:

- daily and weekly summaries
- trend views
- recurring-demand analysis
- fulfillment mix analysis
- margin or costing reports when those data layers exist

Analytics+ should focus on practical decision support rather than broad business-intelligence complexity.

### Printing and device integration+

A future printing or device-integration module could extend the core printing layer with:

- richer printer management
- hardware-specific label workflows
- queue routing by station or destination
- vendor-specific printer adapters where needed

Core should still support basic print-friendly outputs and print-trigger actions even without a deeper device module.

## Integration model

Modules should integrate in ways that preserve core clarity.

Preferred characteristics:

- shared domain entities rather than duplicate records
- additional fields or linked records rather than fragmented alternate models
- role-based visibility so module details appear only where useful
- safe defaults when a module is disabled
- minimal coupling between unrelated modules
- browser-based and future app-based SKOSSina clients can keep using the same core workflows

For example:

- CRM+ can extend `Customer` without changing basic order intake
- Procurement+ can extend `Supplier` and `RawMaterial` without requiring purchasing workflows for every deployment
- Delivery tracking+ can extend fulfillment records without making route tools mandatory for pickup-only businesses
- Analytics+ can read operational history without pushing extra fields into every core workflow
- Printing/device integration+ can extend core print actions without forcing every deployment into one hardware stack

## Progressive enablement

A future preset or onboarding flow should be able to enable a sensible starting set of modules based on business type and operating mode.

Examples:

- a bakery preset may emphasize recurring demand, production, handoff, and printing first
- a dark kitchen preset may emphasize fulfillment and delivery visibility
- a cafe preset may keep most advanced modules off by default

These presets should guide configuration, not lock product structure.

## Boundary rule

When deciding whether something belongs in core or a module, SKOSS should ask:

1. does this directly help most operators complete daily work?
2. does it require substantial extra structure or administration?
3. would many small deployments be better off without it at first?
4. can it build cleanly on top of shared domain concepts?
5. does it belong in the core SKOSS platform, or is it only a packaging variation inside SKOSSina?

If the answer points toward optional depth rather than universal need, it should probably be a module.
