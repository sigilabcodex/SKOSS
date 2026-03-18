# Domain Glossary

This glossary uses practical food-operation language and stays friendly to bilingual teams. Terms may later have Spanish labels or aliases in the product, but the concepts below define the working model.

## Order

A request for one or more products to be delivered, picked up, or prepared for a specific date or service window.

An order is demand that the kitchen must respond to.

## Recurring order

An order pattern that repeats on a schedule, such as a café receiving the same delivery every weekday.

A recurring order is not just historical repetition. It is a template that generates expected future order instances.

## Internal task

A repeatable operational task that may not come directly from a customer order.

Examples:

- feed starter
- refresh preferment
- prepare fillings
- clean or reset a station
- pre-portion packaging materials

## Recurrence template

A reusable schedule rule that generates future instances of work.

A recurrence template can generate:

- recurring orders
- recurring internal tasks

It defines the pattern, while generated instances represent the actual work for a specific day.

## Product

A sellable or producible item recognized by the business.

Examples:

- concha
- burger bun
- sandwich loaf
- croissant

A product is the customer-facing concept or base operational item being requested.

## Variant

A specific version of a product that changes something operationally meaningful.

A variant may differ by:

- flavor
- topping
- finish
- shape
- weight
- size
- filling
- process details

Examples:

- vanilla concha
- chocolate concha
- burger bun with sesame and egg wash
- braided brioche loaf

## Base dough

A reusable dough family from which multiple variants can be produced.

Examples for Kalali include:

- French dough / masa francesa
- rustic hydrated dough / chapata-style dough
- brioche / enriched dough
- laminated dough
- pastry or confectionery dough

Base dough is important because production often begins at this level before final shaping or finishing.

## Recipe

The structured definition of how something is made.

A recipe may describe ingredients, ratios, expected yield, and key preparation guidance. In this project, recipe should stay practical and operations-oriented rather than becoming a full food science or costing engine.

## Process profile

The operational pattern that describes how an item moves through production.

A process profile may include concepts such as:

- mix
- bulk ferment
- divide
- bench rest
- shape
- proof
- bake
- finish

It explains the process behavior, not just the ingredient formula.

## Production batch

A concrete unit of production work created to fulfill demand.

A production batch groups work in a way operators can execute, review, and hand off.

## WIP

Short for **work in progress**.

WIP represents partially completed or already-started work that still matters to planning and execution.

Examples:

- dough already mixed
- trays already shaped
- filling already prepared
- half-completed order packs

WIP is not an afterthought. It changes what still needs to be done.

## Shift log

A running record of meaningful operational updates during a shift.

A shift log may include:

- what was completed
- what is partially completed
- issues or deviations
- notes for the next shift
- manual adjustments or substitutions

## Destination

Where output is supposed to go.

Examples:

- retail counter
- café client
- market stall
- wholesale route
- pickup order

Destination matters because production and packing are often organized by delivery point, route, or customer channel.

## Production day

The operational day used for planning and execution.

A production day may not map cleanly to a midnight-to-midnight calendar day, especially in bakeries with night production.

## Operator

A person doing the actual work in the system's daily flows.

This can include bakers, prep workers, sellers, packers, or multi-role staff. The term emphasizes active work rather than administrative authority.

## Supervisor

A person coordinating work, reviewing status, resolving issues, and helping handoff between people or shifts.

A supervisor is still close to operations and should not be forced into a purely administrative interface.

## Admin

A person maintaining business configuration and system setup.

Examples:

- products
- variants
- recurrence templates
- users and roles
- destinations

Admin work is necessary, but the system should not assume admin tasks are the center of daily operation.
