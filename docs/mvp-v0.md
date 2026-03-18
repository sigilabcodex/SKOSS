# MVP v0

This document defines a disciplined first MVP for SKOSS.

The goal is not to prove every future idea. The goal is to create the smallest useful operational loop for a real small bakery or kitchen.

## MVP objective

A team should be able to:

1. capture and review orders
2. manage recurring orders and recurring internal tasks
3. see demand grouped for a production day
4. record basic WIP and shift notes
5. review what remains to be done in a role-appropriate way

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

### Practical bakery fit

- support products derived from shared base dough concepts
- support notes and manual adjustment on active work
- support variant differences that affect output and process
- support overnight-to-morning handoff

### Minimum admin setup

- create/edit products and variants
- create/edit destinations
- create/edit recurrence templates
- basic user-role distinctions if needed for workspace access

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
3. **Recurring templates**
   - manage recurring orders and internal tasks
4. **Production view**
   - grouped requirements for the active production day
   - visible WIP adjustments
5. **Kitchen task / batch view**
   - actionable production items
   - quick updates for complete / partial / blocked / note
6. **Shift handoff view**
   - summary of current state, open work, and notes
7. **Basic admin configuration**
   - products, variants, destinations, simple setup

## Minimum useful workflow

A realistic minimum workflow looks like this:

1. an operator enters ad hoc orders
2. the system also generates today's recurring orders and internal tasks
3. the production view groups all relevant demand for the production day
4. a kitchen operator records what is already in progress
5. the system surfaces what still needs to be made
6. the night shift leaves notes and partial completion updates
7. the morning shift reviews handoff and finishes production

If this loop works well for Kalali-style operations, the MVP is doing its job.

## Non-goals

The MVP is not meant to:

- impress with feature breadth
- provide a final architecture for every future use case
- replace every other tool in the business immediately
- solve every type of kitchen workflow at once

It should instead prove that SKOSS can support a real production rhythm with clarity and low friction.

## Quality bar for v0

The MVP should feel:

- understandable in minutes
- fast on touch devices
- resilient to messy real-world changes
- useful even with lightweight setup
- clearly shaped around operators rather than office admins
