# Vision

## Purpose

SKOSS exists to help small food operations run daily work with less friction.

The project focuses on the gap between taking an order and actually making the food. For many small kitchens, that gap is managed through memory, paper notes, chat messages, and ad hoc routines. SKOSS aims to make that flow visible, shared, and easier to execute.

A core principle is simple:

**adapt to the workflow, do not force the workflow to adapt to the software.**

That means first use must be possible before every customer, product, ingredient, or recipe is perfectly configured.

## Target users

Primary users:

- operators working production shifts
- bakers, prep workers, and packers
- front-of-house staff taking or reviewing orders
- shift leads and supervisors coordinating handoff
- admins configuring products, schedules, and recurring work

These users are not assumed to be system specialists. Many will use the product quickly, under time pressure, on a phone or tablet.

## Target businesses

The project is aimed first at small and medium food operations with repeatable production patterns, such as:

- artisanal bakeries
- neighborhood bakeries with wholesale or recurring clients
- dark kitchens with repeated prep routines
- food stalls with predictable daily production
- small restaurants with recurring mise en place and prep cycles

It is not aimed first at large enterprise manufacturing environments.

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

It does not need to own every business function.

It also should not assume that full normalization comes before real work. Operator-facing flows should continue functioning when the business is still formalizing its catalog, customer list, or production definitions.

## Progressive adoption stance

Early adoption matters.

Many small operators abandon software when it asks them to spend days on setup before it provides value. SKOSS should avoid that failure mode.

The vision is:

- take the order now
- capture the operational note now
- keep production moving now
- enrich structure later when there is time and clarity

That means the product should support draft and placeholder records without pretending they are ideal forever.

## Long-term direction

Over time, SKOSS may grow into a flexible operational platform for multiple kitchen types, with presets or skins for different business models.

A likely long-term path includes:

- strong bakery support first
- reusable operational patterns for other kitchen formats
- optional advanced modules for identifiers, integrations, automation, and analytics
- a domain model stable enough to support both SKOSS and future product-facing skins such as BAGET
- architecture that stays practical for small self-hosted deployments

The long-term goal is breadth through a strong operational core, not breadth through a shallow pile of features.

## Deployment direction

SKOSS should aspire to be deployable in ways that match the realities of small businesses.

Preferred direction:

- run well on a modest Linux VPS
- remain feasible on a small self-hosted server
- leave room for local-network use on a laptop or office machine
- avoid unnecessary dependence on heavyweight cloud infrastructure

A future offline-capable or degraded-network mode is desirable, but the project should be honest that reliable sync and conflict handling are hard problems. The vision is to design with that future in mind without pretending it is already solved.

## Why bakery is a strong first domain

Bakery operations highlight the exact kinds of coordination problems SKOSS is meant to solve:

- production often starts long before fulfillment
- fermentation and rest periods matter
- the same base dough can feed multiple product variants
- night and morning shifts depend on reliable handoff
- small process changes can affect quality, timing, and yield

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

The initial success condition is much simpler: help a small kitchen run daily operations more clearly, reliably, and lightly.
