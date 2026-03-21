# Domain Model

This document describes the conceptual model for SKOSS. It is intentionally implementation-agnostic.

The goal is to define the important operational concepts and how they relate, without prematurely freezing a database schema or service architecture.

## Modeling stance

SKOSS should be modeled as an operational transformation system.

The central question is not just "what records exist?" It is:

**How does the business move from demand to coordinated production work?**

That is why the model centers on orders, recurrence, products, dough/prep concepts, production batches, WIP, and handoff.

A second modeling stance matters just as much:

**operational capture must work before full normalization exists.**

The model should therefore support both:

- immediate, messy, practical operational capture
- later enrichment into clearer and more structured records

## Progressive structuring

SKOSS should distinguish between information that is good enough to keep work moving and information that has been fully formalized.

Examples:

- an order can start with a draft customer instead of a fully managed customer record
- an order line can point to a draft product or uncategorized item instead of a finished catalog entry
- a production note can remain freeform when there is not yet a strong structured concept behind it
- a known product, destination, recipe, or base dough should still be reused when it already exists

This is not an excuse for bad data. It is a recognition that small businesses often learn and formalize while operating.

## Operational data vs normalized admin data

The model should preserve a clear difference between two kinds of information.

### Freeform or operational capture

This is the data people enter because work is happening now.

Characteristics:

- fast to enter
- may be incomplete
- may use placeholder labels
- may contain notes instead of structured references
- optimized for immediate usability under time pressure

Examples:

- "walk-in customer wants 3 sesame rolls for tomorrow"
- "special tray for cafe, same as last week"
- "unknown sweet bread item, estimate 12 pieces"
- "use remaining dough from night shift first"

### Structured or administrative data

This is the data that has been reviewed, named clearly, and linked to other concepts.

Characteristics:

- reusable across future work
- more normalized and searchable
- supports better planning and reporting
- often created or cleaned up after operations are already moving

Examples:

- a customer with contact details and preferred destinations
- a product with variants, standard units, and defaults
- a base dough linked to multiple sellable variants
- a recipe or process profile used repeatedly in production planning

The system should support movement from the first category to the second without forcing that conversion too early.

## Placeholder and draft concepts

The following placeholder concepts should be considered first-class in the domain, even if implementation details come later.

### Draft customer

A draft customer represents a person or business known well enough to take an order, but not yet fully set up.

Responsibilities:

- allow immediate order capture
- store minimal identifying context such as a name or note
- be convertible into a fuller customer record later

### Draft product

A draft product represents a sellable item not yet formalized in the catalog.

Responsibilities:

- allow order capture without blocking on product administration
- preserve the label used by the operator or customer
- support later conversion into a structured product and variant model

### Draft item / uncategorized item

A draft item or uncategorized item represents an operational line that is known to matter but does not yet fit the formal catalog.

Responsibilities:

- keep ad hoc demand visible
- avoid forcing false precision
- support later classification or merging into real catalog structure

### Freeform note item

A freeform note item represents demand or work that is easier to capture as text than as a catalog line.

Responsibilities:

- preserve important context immediately
- support unusual requests, one-off prep, substitutions, or verbal commitments
- remain visible in planning and handoff even if it cannot yet drive full automation

## Core entities

### Order

An order represents external demand.

Responsibilities:

- capture who needs what
- hold timing or delivery expectations
- preserve notes and exceptions
- act as one source of production demand
- allow draft or structured references depending on what is available

An order contains one or more order lines.

### Order line

An order line represents a specific requested item and quantity within an order.

Responsibilities:

- identify the requested product, variant, draft item, or note item
- hold quantity and unit context
- preserve line-specific notes
- support grouping for planning

Order lines are often the most direct bridge between sales input and production requirements.

### Recurrence template

A recurrence template defines repeated expected work.

Responsibilities:

- express a schedule pattern
- generate future instances
- distinguish template-level edits from one-off occurrence changes
- support both customer demand and internal operational routines

A recurrence template may generate recurring orders or recurring internal tasks.

### Internal task

An internal task represents work the operation must do even without a customer order.

Responsibilities:

- capture non-sales operational work
- support recurring operational routines
- appear in role-appropriate workspaces
- carry notes, status, and handoff relevance

### Customer

A customer represents a person or organization that places demand.

Responsibilities:

- provide identity and relationship context
- support recurring work, communication, and destination handling
- remain optional for first capture through draft customer support

### Product

A product represents a recognizable operational and commercial item.

Responsibilities:

- provide a stable item concept for ordering and planning
- group related variants
- connect to recipe and process definitions where relevant
- coexist with draft products during progressive formalization

### Variant

A variant represents an operationally meaningful version of a product.

Responsibilities:

- express differences that change production work
- define distinctions in finish, shape, inclusion, size, weight, or handling
- preserve customer-facing clarity without losing kitchen relevance

Variants matter because small kitchens frequently sell many outcomes derived from the same underlying preparation work.

### Base dough

A base dough represents an upstream dough family used by one or more variants.

Responsibilities:

- capture shared preparation logic before final item differentiation
- support grouping production by what is actually mixed or fermented
- make bakery planning more realistic than product-only counting

### Recipe

A recipe defines how an item or intermediate is made.

Responsibilities:

- describe ingredient structure and expected yield
- support consistency across workers
- connect operational planning to production reality

Recipe should stay practical. It does not need to become a full costing engine in the first phase.

Recipes may also be missing or partial early in adoption. Their absence should reduce planning precision, not block basic operation.

### Process profile

A process profile describes how work progresses operationally.

Responsibilities:

- reflect stages, checkpoints, and timing logic
- distinguish products that share dough but differ in workflow
- help translate demand into executable work

This is especially useful in bakery contexts where fermentation, proofing, shaping, and finishing differ materially across variants.

### Production batch

A production batch is a concrete planned or active chunk of work.

Responsibilities:

- group requirements into something the kitchen can execute
- carry quantities, notes, and status
- reflect actual operational work, not just abstract demand
- provide an anchor for partial completion and handoff

### WIP

WIP represents already-started or partially completed work.

Responsibilities:

- reduce duplicate planning
- make current reality visible
- support manual adjustments when work diverges from plan
- preserve state between shifts

WIP can apply to dough, prep, shaped items, partially completed packing, or other in-progress stages.

### Shift log

A shift log records meaningful updates across a shift boundary.

Responsibilities:

- document what happened
- preserve exceptions, shortages, substitutions, and notes
- support morning review and next-shift continuity
- reduce dependence on memory or verbal-only handoff

### Destination

A destination identifies where output is going.

Responsibilities:

- group demand by route, client, stall, or counter
- support packing and dispatch logic
- keep production connected to fulfillment context

### Production day

A production day is the operational planning frame.

Responsibilities:

- organize demand and work into a usable working period
- support businesses where production spans calendar boundaries

## Important relationships

### Orders and order lines -> products, variants, and placeholders

Orders generate demand through order lines.
Order lines may point to:

- a structured product or variant
- a draft product
- an uncategorized item
- a freeform note item

This flexibility is important because the kitchen must stay operational even while its catalog is still forming.

### Variants -> base dough, recipe, and process profile

Variants often inherit or reference shared upstream preparation.

For example:

- vanilla concha and chocolate concha may share a brioche base dough
- burger buns and sandwich loaves may share enriched dough but differ in shape, finish, weight, and bake handling

This relationship is central because demand may need to be aggregated at multiple levels:

- by final sellable item
- by shared dough family
- by process stage

### Orders and internal tasks -> production requirements

Not all work comes from sales.
Some production requirements come from recurring internal tasks, maintenance prep, or routine staging work.

The model must allow both demand types to feed the production view.

### Production requirements -> production batches

Grouped and interpreted requirements become production batches or other actionable work units.

This transition is where the system stops being a passive record store and becomes a real operational engine.

### WIP -> production adjustment

WIP modifies what still needs to happen.

If dough is already mixed, the system should not blindly schedule the same upstream work again. If shaping is partially complete, the remaining task should reflect that. WIP is therefore not just descriptive state; it actively influences planning.

### Shift log -> continuity across production day

Shift logs preserve continuity when responsibility changes between people or time windows.

This is especially important in bakery operations where night production, proofing, baking, and morning packing may be handled by different workers.

## Why variants matter

Variants are not cosmetic.

In a bakery or compact kitchen, variants frequently change the actual work required:

- toppings may alter finishing steps
- fillings may add prep dependencies
- target weight changes dough requirements
- shape changes labor and tray planning
- wash or garnish changes final handling
- process timing may differ even with the same base dough

If the model ignores variants, the system will quickly drift away from kitchen reality.

## Why WIP is first-class

Many systems treat work in progress as a thin status field. That is not enough here.

WIP must be first-class because:

- production can start before final order certainty
- work may pause at intermediate stages
- operators often need to make manual adjustments
- planning without WIP visibility leads to duplication or confusion
- shift changes depend on knowing the current real state of work

In short, WIP is part of planning, not just reporting.

## Why shift handoff is first-class

Small food operations often rely on person-to-person memory for handoff. That works until it does not.

Shift handoff needs to be explicit because:

- production stages span multiple shifts
- night and morning work are tightly linked in bakeries
- partial completion is normal
- problems and substitutions must remain visible
- supervisors need quick review, not forensic reconstruction

The system should therefore treat handoff as part of the operational model itself.

## Modeling implications

The conceptual model should allow progressive formalization without collapsing into chaos.

That implies:

- draft records should have a clear upgrade path into structured records
- structured records should remain reusable and preferred when available
- freeform capture should be preserved as historical operational truth, even if later linked to cleaner entities
- the same workflow may contain both well-structured and lightly structured lines at the same time
- planning logic may need confidence levels or fallback handling when data is incomplete

## Deliberate omissions

This model does not yet lock in:

- table structures
- event models
- service boundaries
- inventory valuation logic
- accounting integration shape
- advanced permission architecture
- the exact persistence strategy for draft versus structured records

Those decisions should follow only after the domain model and MVP workflow are better proven.
