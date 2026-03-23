# Customer memory (CRM-light)

## Purpose

SKOSS needs practical customer memory, not a heavy sales CRM.

This layer exists so a team can remember:

- who the customer is
- how to reach them
- what delivery or pickup context matters
- what recent operational history is worth seeing during order-taking, fulfillment, handoff, and delivery-adjacent work

The goal is operational continuity.

## What CRM-light means in SKOSS

In SKOSS, **CRM-light** means a small reusable customer card that supports daily work without pulling the product toward pipeline management or marketing software.

A customer card can hold:

- display name
- phone
- email
- preferred contact method
- address
- delivery note
- internal operational note
- active / inactive state
- recent linked orders

That is enough to improve repeat order capture and fulfillment context while staying aligned with the project philosophy:

- operator-first
- progressive complexity
- draft-first / refine later
- domain-neutral core
- avoid ERP and back-office bloat

## How this supports operations

### Order-taking

Customer memory helps order intake stay faster and calmer:

- repeat customers can be linked instead of retyped from scratch every time
- teams can still type a draft label when no saved customer exists yet
- incomplete customer setup does not block order capture
- phone or contact details remain easy to reuse when needed

### Fulfillment and handoff

Customer memory helps the team avoid avoidable mistakes:

- pickup and delivery context can stay visible near the order
- delivery notes can surface in production-adjacent and handoff views when they matter
- repeat operational notes do not need to live only in people’s heads or chat threads
- recent linked orders give quick context without forcing analytics screens

### Delivery-oriented work

Where delivery context matters, customer memory can quietly reinforce:

- address context
- preferred contact path
- recurring handoff reminders
- whether the customer is a saved repeat stop or just a one-off draft order

## Draft-first behavior

This customer layer is intentionally tolerant of partial data.

SKOSS should still support:

- orders with only a typed customer label
- orders with a linked saved customer and lightly adjusted order-specific details
- lightweight customer cards that can be refined later
- inactive customer cards kept for memory and history

This keeps customer structure useful without making it mandatory too early.

## What this PR adds

This PR adds a first operational customer foundation:

- a lightweight `Customer` model
- optional order-to-customer linkage
- a compact customer surface for create, edit, activate/deactivate, and recent context
- quiet customer context in order, fulfillment, and handoff-adjacent surfaces
- simple recent linked order history on the customer detail view
- i18n coverage in English, Spanish, and Portuguese

## Explicit non-goals

This is **not** a sales CRM.

This work does **not** add:

- sales pipeline management
- lead tracking
- campaign or marketing automation
- heavy account / contact hierarchies
- enterprise CRM entity graphs
- customer scoring
- broad customer analytics suites
- admin-heavy mandatory customer setup before order capture

## Design tradeoff

The main tradeoff is deliberate:

- keep reusable customer memory in the system
- keep order capture tolerant of drafts and partial data
- avoid building a second product inside SKOSS

That tradeoff fits the current stage of the repository better than a larger CRM model.
