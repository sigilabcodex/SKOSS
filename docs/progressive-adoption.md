# Progressive Adoption

SKOSS should be usable before a business has time to model itself perfectly.

This document explains why progressive adoption matters and how draft-first workflows should work.

## Why heavy upfront setup kills adoption

Small food businesses often evaluate software in the middle of active work, not during a quiet transformation project.

In practice, many teams do **not** have time to:

- create every customer before entering the first order
- define the full product catalog before tomorrow's production
- enter every ingredient and supplier before tracking prep
- formalize every recipe before the kitchen starts work

If the software demands that all of this happen first, the likely result is:

- the team postpones usage
- the team uses paper or chat instead
- the system gets blamed for being heavy
- real operational knowledge never enters the product

For SKOSS, that is a product failure.

## Core principle

**Immediate usability first, structured refinement second.**

A useful system should let the business work now and become more organized over time.

That means:

- operators can capture demand immediately
- the system can mix structured and unstructured records in one workflow
- repeated draft patterns can later be formalized
- formalization should improve future work without erasing past reality

## "You can work now, organize later"

This phrase should be treated as a real product rule, not just messaging.

It implies that operator-facing flows should never require full setup before first use.

Examples:

- a seller should be able to enter an order without first opening customer administration
- a shift lead should be able to record an ad hoc prep item without creating a perfect product tree
- a kitchen worker should be able to note a substitution or one-off request without waiting for schema changes

## Placeholder entities

SKOSS should support placeholder records that keep work moving while still leaving room for later structure.

### Draft customer

Use when:

- a new buyer appears for the first time
- the operator only knows a name, phone number, or informal label
- the team wants to capture the order now and enrich the customer later

Expected behavior:

- easy to create during order entry
- clearly marked as draft or incomplete
- later convertible into a structured customer profile

### Draft product

Use when:

- a requested item exists in practice but is not yet in the catalog
- the operator knows a practical label but not the full structure
- a new item is being tested or sold informally

Expected behavior:

- usable directly in order lines
- visible in production views
- later mergeable into a structured product and variant definition

### Draft item / uncategorized item

Use when:

- the requested work matters but the team is not ready to classify it
- the item may be temporary, seasonal, experimental, or ambiguous
- the operator should not be forced into a wrong category just to continue

Expected behavior:

- retains text label, quantity, and notes
- can remain lightweight for a while
- can later be categorized, merged, or retired

### Freeform note item

Use when:

- a request is best captured as text
- the issue is more about context than a clean catalog line
- the item may never need a permanent structured representation

Examples:

- "prepare extra tasting tray for landlord visit"
- "hold 6 plain rolls in case cafe calls"
- "special decoration similar to last Friday"

Expected behavior:

- easy to enter
- visible where it matters operationally
- not falsely treated as a fully modeled product

## Draft vs structured records

The distinction should stay explicit.

### Draft records

Draft records are:

- good enough for active work
- lightweight to create
- allowed to be incomplete
- honest about their ambiguity

### Structured records

Structured records are:

- reusable across future work
- more reliable for planning and reporting
- better connected to recipes, base doughs, process profiles, and recurrence
- preferred when available

The product should not shame draft usage. It should simply make structure increasingly worthwhile when the business is ready.

## Gradual formalization

Formalization should happen as a smooth upgrade path.

A healthy progression might look like this:

1. an order is entered with a draft customer and a draft product
2. the item appears in production views with clear notes
3. the same item appears several more times over two weeks
4. the team decides it is now common enough to formalize
5. a structured product and variant are created
6. future orders prefer the structured version
7. old records remain historically accurate, optionally linked back to the new structure where useful

The point is not to achieve perfect data hygiene on day one. The point is to let real usage reveal what deserves structure.

## Bakery / kitchen examples

### Example 1: New wholesale customer

A cafe calls and asks for 20 burger buns for tomorrow.

The bakery has never delivered to this cafe before.

SKOSS should allow:

- entering a draft customer such as "Cafe Molino"
- recording the order immediately
- assigning a destination later if needed
- enriching the customer after the rush

It should **not** require a full customer profile before saving the order.

### Example 2: Seasonal item not yet modeled

The bakery starts selling a temporary lent bun for Lent.

SKOSS should allow:

- entering it as a draft product or uncategorized item
- recording quantities against real orders
- letting the kitchen see it in production planning
- formalizing it later if it becomes recurring

### Example 3: One-off production note

A shift lead wants the night baker to reserve leftover dough for a trial item.

SKOSS should allow:

- a freeform note item or production note
- clear visibility in handoff
- no requirement to invent a full product definition for an experiment

## Guardrails

Progressive adoption should not become uncontrolled mess.

Useful guardrails include:

- clearly mark draft and placeholder records
- make repeated draft usage visible so teams can decide what to formalize
- keep structured records easy to reuse when they exist
- avoid duplicate creation when a good existing record is already available
- preserve search and review tools that help clean up later

## Design implications

This direction affects both product and future architecture.

It suggests that SKOSS should:

- tolerate partially structured state in core workflows
- avoid hard foreign-key assumptions in UX before records exist
- support later conversion, merging, or linking behavior
- preserve the original operational entry, not just the later cleaned-up interpretation
- keep planning logic understandable when data quality varies

## What this does not promise

Progressive adoption does **not** mean:

- every workflow should stay permanently unstructured
- cleanup can be ignored forever
- planning accuracy is identical with complete and incomplete data
- the system already solves all reconciliation problems

It means first use should be practical, and increased structure should be a benefit rather than a barrier.
