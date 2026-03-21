# MVP v0

This document defines a disciplined first MVP for SKOSS.

The goal is not to prove every future idea. The goal is to create the smallest useful operational loop for a real small bakery or kitchen.

## MVP objective

A team should be able to:

1. capture and review orders immediately
2. manage recurring orders and recurring internal tasks
3. see demand grouped for a production day
4. record basic WIP and shift notes
5. review what remains to be done in a role-appropriate way
6. keep working even when setup is incomplete

If the product cannot do those things clearly, adding more features will not help.

## In scope

### Core domain support

- orders and order lines
- products and variants
- destinations
- recurring order templates
- recurring internal task templates
- generated daily instances
- a simple concept of production day
- basic production requirement views
- WIP recording at a practical level
- shift log / handoff notes
- role-based workspace structure
- draft and placeholder entities needed for first-use workflows

### Practical bakery fit

- support products derived from shared base dough concepts
- support notes and manual adjustment on active work
- support variant differences that affect output and process
- support overnight-to-morning handoff
- support partially structured order capture during adoption

### Minimum admin setup

The MVP should require as little compulsory setup as possible.

At minimum, a user should be able to:

- create an order with a draft customer or no formal customer record
- add line items using structured products when available
- add line items as draft products, uncategorized items, or freeform notes when they are not available
- create or review destinations when useful, without making them mandatory for first capture
- create/edit recurrence templates once the business is ready for them
- use lightweight role distinctions if needed for workspace access

## Out of scope

- accounting
- POS hardware integration
- procurement workflows
- deep inventory management
- costing engine
- barcode/SKU-first workflows
- automation rules engine
- delivery-platform integrations
- advanced analytics and reporting
- complex permission matrixes
- deep recipe scaling or yield simulation tools
- full offline sync guarantees
- architecture choices that require heavy cloud services by default

## First screens

The first useful product likely needs only a small set of screens or views:

1. **Orders list**
   - upcoming orders
   - filters by date and destination
   - visible notes and status
2. **Order entry / edit**
   - simple order creation
   - recurring vs ad hoc distinction
   - line items and notes
   - draft customer and draft item support
3. **Recurring templates**
   - manage recurring orders and internal tasks
4. **Production view**
   - grouped requirements for the active production day
   - visible WIP adjustments
   - sensible handling for partially structured lines
5. **Kitchen task / batch view**
   - actionable production items
   - quick updates for complete / partial / blocked / note
6. **Shift handoff view**
   - summary of current state, open work, and notes
7. **Basic setup / organization view**
   - products, variants, destinations, and other optional structure as the team is ready

## Minimum useful workflow

A realistic minimum workflow under progressive adoption looks like this:

1. an operator enters ad hoc orders immediately, even if customer and catalog setup is incomplete
2. the system also generates today's recurring orders and internal tasks when templates exist
3. order lines can use structured items where available and placeholders where needed
4. the production view groups all relevant demand for the production day, including partially structured demand
5. a kitchen operator records what is already in progress
6. the system surfaces what still needs to be made, with clear visibility into uncertain or note-based items
7. the night shift leaves notes and partial completion updates
8. the morning shift reviews handoff and finishes production
9. the business can later formalize frequent draft items into reusable structured records

If this loop works well for Kalali-style operations, the MVP is doing its job.

## Definition of "minimum useful" under progressive adoption

For SKOSS, "minimum useful" does **not** mean "minimum fully configured."

It means:

- the first order can be captured the same day the software is introduced
- missing admin setup does not stop sales or kitchen coordination
- placeholder data is visible and recoverable rather than hidden in side channels
- structured refinement can happen later without re-entering the business's history
- the software is already helpful before advanced modeling exists

## Non-goals

The MVP is not meant to:

- impress with feature breadth
- provide a final architecture for every future use case
- replace every other tool in the business immediately
- solve every type of kitchen workflow at once
- force teams into a full data-cleanup project before use

It should instead prove that SKOSS can support a real production rhythm with clarity and low friction.

## Quality bar for v0

The MVP should feel:

- understandable in minutes
- fast on touch devices
- resilient to messy real-world changes
- useful even with lightweight setup
- clearly shaped around operators rather than office admins
- deployable without heavy infrastructure assumptions
- honest about degraded-network and offline tradeoffs
