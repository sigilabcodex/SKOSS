# Domain Model

This document describes the conceptual model for SKOSS. It is intentionally implementation-agnostic.

The goal is to define the operational concepts that matter most, how they relate, and how the model can expand without forcing early ERP-style complexity.

## Modeling stance

SKOSS should be modeled as an operational transformation system.

The core question is:

**How does the business move from demand to coordinated production and fulfillment work?**

That is why the model starts from orders, recurrence, production interpretation, WIP, and handoff.

A second stance matters just as much:

**operational capture must work before full normalization exists.**

The model should support:

- immediate, practical capture during active work
- progressive enrichment into more structured records
- clear relationships between lightweight records and richer future data

## Progressive structuring

SKOSS should distinguish between operational capture and structured reference data.

Examples:

- an order can begin with a draft customer instead of a fully maintained customer profile
- an order line can use a draft product or uncategorized item instead of a formal catalog entry
- fulfillment context can begin with simple mode and notes before advanced delivery tracking exists
- customer, supplier, and ingredient records can start lightweight and gain structure over time

This allows the system to remain useful before setup is complete.

## Core operational entities

### Order

An order represents external demand.

Responsibilities:

- capture who needs what
- preserve timing and fulfillment expectations
- hold notes and exceptions
- act as a source of production demand
- stay usable with either draft or structured references

An order contains one or more order lines and may reference a customer or a draft customer.

### OrderLine

An order line represents a specific requested item within an order.

Responsibilities:

- identify the requested product, variant, draft item, or freeform note item
- hold quantity and unit context
- preserve line-specific notes
- support grouping into production requirements

Order lines are the main bridge between sales capture and kitchen interpretation.

### RecurrenceTemplate

A recurrence template defines repeated expected work.

Responsibilities:

- express a schedule pattern
- generate future recurring orders or internal tasks
- separate template changes from one-off occurrence changes
- reduce repeated manual entry

### InternalTask

An internal task represents work that matters operationally even when it is not tied to a sale.

Responsibilities:

- capture prep, staging, or routine work
- support recurring internal routines
- appear in role-appropriate workspaces
- carry notes, status, and handoff relevance

### ProductionBatch

A production batch is a concrete planned or active chunk of kitchen work.

Responsibilities:

- group production requirements into executable work
- carry quantities, notes, and status
- reflect what the kitchen actually does
- anchor partial completion and handoff

### WIP

WIP represents already-started or partially completed work.

Responsibilities:

- show current reality before more work is planned
- reduce duplicate production
- support manual adjustment when execution diverges from plan
- preserve state across shifts

WIP may apply to dough, prep, shaping, packing, or other in-progress stages.

### ShiftLog

A shift log records meaningful updates across a shift boundary.

Responsibilities:

- document what happened
- preserve exceptions, shortages, substitutions, and notes
- support continuity across night, morning, and later-day work
- reduce dependence on memory or verbal-only handoff

## Supporting structured entities

### Customer (CRM light)

A customer represents a person or organization that places demand.

Responsibilities:

- provide reusable identity and contact context
- support recurring work and order history
- carry practical notes, tags, or service context later
- remain optional at first through draft customer support

A customer may be lightweight at first and later support richer CRM-style extensions.

### Supplier

A supplier represents a business or person that provides ingredients or materials.

Responsibilities:

- provide reusable purchasing context
- support historical pricing by supplier
- hold contact details and practical notes
- stay available historically even when inactive

### RawMaterial / Ingredient

A raw material or ingredient represents a reusable kitchen input.

Responsibilities:

- provide a stable reference for recipes and purchasing memory
- support supplier price history
- enable future costing without requiring it immediately
- remain practical in naming and unit choice

This entity should stay lightweight and kitchen-readable rather than inventory-heavy.

### SupplierPriceEntry

A supplier price entry represents a historical price observation for a material from a supplier.

Responsibilities:

- record dated price evidence instead of overwriting a single current price
- preserve package quantity, unit, and optional presentation details
- support later comparison and normalization
- prepare the model for recipe costing and purchasing visibility

### Product

A product represents a recognizable sellable or operational item.

Responsibilities:

- provide a stable item concept for orders and planning
- group related variants
- connect to recipe or process definitions where useful
- coexist with draft products during adoption

### Variant

A variant represents an operationally meaningful version of a product.

Responsibilities:

- express differences that change production work
- preserve customer-facing clarity without losing kitchen relevance
- connect demand to upstream preparation more accurately

### BaseDough

A base dough represents a shared upstream preparation family.

Responsibilities:

- group work by what is actually mixed or fermented
- support bakery-style aggregation across multiple final variants
- reflect real kitchen preparation structure

### Recipe

A recipe defines how an item or intermediate is made.

Responsibilities:

- describe ingredient structure and expected yield
- support consistency across workers
- connect operational planning to production reality

Recipe support should stay practical. It does not need to become a full costing engine in the first phase.

### ProcessProfile

A process profile describes how work progresses operationally.

Responsibilities:

- reflect stages, checkpoints, and timing logic
- distinguish items that share inputs but differ in workflow
- help translate demand into executable work

### Fulfillment metadata

Fulfillment metadata describes how an order is expected to reach the customer.

Responsibilities:

- distinguish fulfillment mode such as pickup, own delivery, or app delivery
- preserve dispatch notes and promised timing context
- support assignment and status visibility where relevant
- remain lightweight until a fuller delivery module exists

This metadata may live directly on the order in early stages.

### Destination

A destination identifies where output is going.

Responsibilities:

- group demand by route, client, stall, counter, or delivery point
- support packing and dispatch logic
- keep production connected to fulfillment context

### ProductionDay

A production day is the operational planning frame.

Responsibilities:

- organize demand and work into a usable working period
- support businesses where production spans calendar boundaries

## Placeholder and draft concepts

Progressive adoption requires placeholder entities to be first-class concepts.

### DraftCustomer

A draft customer allows immediate order capture before full customer setup exists.

### DraftProduct

A draft product allows immediate item capture before the catalog is fully structured.

### UncategorizedItem

An uncategorized item allows the team to preserve demand that matters before it has a clean home in the product model.

### FreeformNoteItem

A freeform note item allows unusual requests, exceptions, and one-off work to remain visible operationally.

These placeholders should be clearly marked, searchable, and upgradable into more structured records later.

## Key relationships

### Order -> OrderLine

An order contains one or more order lines.

### Order -> Customer or DraftCustomer

An order may reference:

- a structured customer
- a draft customer
- no customer record yet, if the order still needs to be captured quickly

### Order -> fulfillment metadata

An order carries the fulfillment context that matters to execution, including:

- fulfillment mode
- promised timing
- delivery or dispatch notes
- optional assignment or status fields

### OrderLine -> Product / Variant / placeholder item

An order line may point to:

- a structured product
- a structured variant
- a draft product
- an uncategorized item
- a freeform note item

This flexibility is necessary because real kitchens cannot stop order capture while administration catches up.

### Customer -> Order

A customer may have many orders and may later support notes, tags, and simple history views.

### Supplier -> SupplierPriceEntry

A supplier may have many historical price entries.

### RawMaterial -> SupplierPriceEntry

A raw material may have many historical price entries from one or more suppliers.

### RawMaterial -> Recipe

A raw material may be referenced by one or more recipes.

### Product / Variant -> Recipe / BaseDough / ProcessProfile

A product or variant may link to recipes, shared upstream preparation such as base dough, and process profiles that shape real production work.

### Orders and InternalTasks -> ProductionBatch

Customer demand and internal operational routines both feed production interpretation, which results in production batches or equivalent actionable work units.

### WIP -> ProductionBatch

WIP modifies what still needs to be made. It is an input to planning, not just a historical status field.

### ShiftLog -> ProductionBatch / WIP / Order context

Shift logs preserve continuity across partially completed work, shortages, substitutions, and fulfillment issues.

## Expansion rules

As the model grows, it should preserve a few constraints:

- core workflows must still work with partially structured data
- richer entities should extend the model without forcing all businesses into heavy setup
- historical operational truth should not be erased when records are later formalized
- advanced capabilities such as CRM+, procurement, costing, and deep delivery tracking should build on these entities rather than replacing them

## Deliberate omissions

This document does not lock in:

- table structures
- APIs
- service boundaries
- inventory valuation logic
- accounting models
- advanced permissions
- specific implementation strategy for draft-to-structured conversion

Those decisions should follow only after the domain model and workflow layers are proven in practice.
