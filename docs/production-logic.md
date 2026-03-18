# Production Logic

This document describes the core operational transformation at the heart of SKOSS.

## Core flow

The basic flow is:

**Orders -> grouped by date / destination / product -> transformed into production requirements -> adjusted by WIP -> surfaced as tasks and handoff**

This is the part of the system that turns incoming demand into usable kitchen action.

## Step 1: Collect demand

Demand may come from more than one place.

Primary sources:

- ad hoc orders
- generated recurring order instances
- recurring internal task instances
- manual operational additions when needed

The goal is to build a realistic picture of what the operation expects to do for a given production day.

## Step 2: Group demand meaningfully

The system should group demand in ways the kitchen can actually use.

Useful early grouping axes include:

- by production day
- by destination
- by product
- by variant

This allows the operation to see both the commercial view and the production view.

### Example

If three destinations need burger buns tomorrow, the kitchen may want to see:

- destination-level counts for packing and delivery
- total bun demand for overall planning
- variant-specific differences such as sesame topping or egg wash requirements

## Step 3: Translate demand into production requirements

Grouped demand is still not enough.

The system must transform demand into the things the kitchen actually needs to make, prepare, or check.

Depending on the business, that may include:

- final product counts
- dough requirements
- prep tasks
- shaping tasks
- bake tasks
- packing tasks

This is where product structure, variants, base dough, recipes, and process profiles start to matter.

### Bakery example: brioche family

A bakery may receive demand for:

- vanilla conchas
- chocolate conchas
- burger buns with sesame and egg wash
- braided brioche loaves

Commercially, these are different variants.
Operationally, they may share a brioche base dough.

The production logic should be able to:

1. preserve variant-specific output needs
2. aggregate shared upstream dough requirements
3. reflect finishing differences later in the workflow

## Step 4: Adjust by WIP

Production requirements should not be treated as if nothing has started yet.

The system must ask:

- what dough is already mixed?
- what trays are already shaped?
- what fillings are already prepared?
- what packs are already partially assembled?

WIP changes what remains to be done.

### Bakery example: partial brioche progress

Suppose tomorrow's demand requires 200 pieces of brioche-family output.
If the night shift already mixed dough covering 140 pieces, the morning team should not see a full-mix requirement again. They should see the remaining upstream requirement, plus any downstream shaping or finishing tasks that still apply.

## Step 5: Surface actionable work

Once requirements are adjusted by WIP, the system should surface work in a form operators can use immediately.

That may include:

- production batches
- role-oriented task lists
- grouped prep queues
- handoff summaries

The product should not stop at showing raw totals. It should show what needs action now.

## Step 6: Preserve notes and handoff context

Operational work is rarely clean.

The system should preserve:

- substitutions
- delays
- quality issues
- manual overrides
- missing ingredients
- partial completion
- route-specific notes

These details should feed the handoff view so the next shift inherits context, not just counts.

## Bakery examples

### Example 1: Concha planning

Orders for Friday include:

- 40 vanilla conchas for retail
- 30 chocolate conchas for a café destination

Production logic should allow the team to see:

- total concha demand = 70
- split by variant = vanilla 40, chocolate 30
- shared brioche dough requirement upstream
- variant-specific topping or finishing needs downstream

### Example 2: Sandwich loaf planning

Orders include sandwich loaves for two destinations.
The loaf variant may carry:

- target raw weight
- target baked yield assumptions
- pan or mold requirement
- route-specific packing note

Production logic should support both the final output counts and the intermediate requirements that make those counts realistic.

### Example 3: Laminated production

Demand for croissants and pain au chocolat may share laminated dough upstream but diverge in final shaping and filling.

The system should make shared preparation visible without flattening meaningful variant differences.

## Design intent

The production engine should be:

- practical before perfect
- easy to override manually
- transparent enough that operators understand why requirements appear
- structured enough to reduce missed work and duplicate work

## What this logic is not

The early production logic is not trying to be:

- a full optimization solver
- a deep MRP engine
- an enterprise manufacturing scheduler

It only needs to do one hard, valuable thing well:

**help a small kitchen turn incoming demand and current reality into clear next actions.**
