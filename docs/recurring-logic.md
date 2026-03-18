# Recurring Logic

Recurrence is a core feature in SKOSS, not an optional extra.

Many small kitchens run on repeated patterns:

- the same client orders every weekday
- the same market route happens every weekend
- starter feeding, filling prep, and station reset happen on recurring schedules

If recurrence is treated as a secondary feature, operators will spend too much time re-entering predictable work and too little time managing reality.

## Core concepts

### Recurring order template

A recurring order template defines a reusable customer-demand pattern.

It should capture things such as:

- destination or customer context
- product/variant lines
- expected quantities
- recurrence rule
- default notes
- exceptions or schedule boundaries where relevant

The template itself is not the work for a given day. It is the source from which dated order instances are generated.

### Recurring internal task

A recurring internal task defines repeated operational work that is not directly tied to a customer order.

Examples:

- feed starter every day
- prepare brioche topping mix every Friday night
- clean and reset laminated dough station after the morning bake

This concept matters because recurring kitchen work is broader than recurring sales.

### Generated instances

Generated instances are the actual dated items used by the operation.

Examples:

- an order for Thursday's café delivery
- a task for tonight's preferment refresh

Instances are what operators act on. Templates are what admins and supervisors maintain.

## Distinction from ad hoc orders

An ad hoc order is created directly for a specific occurrence and has no repeating source.

A recurring-generated order instance is different because:

- it comes from a template
- it may inherit default lines or notes
- it belongs to a larger repeating series
- edits may apply either to one instance or to the future pattern

This distinction is operationally important and should be visible, but it should not make daily workflows feel technical.

## Editing model

Recurring systems become frustrating when they are too rigid or too magical. SKOSS should use a practical editing model.

### Edit one occurrence

Use this when a single generated instance needs an exception.

Examples:

- this Friday the client wants 12 conchas instead of 20
- this week the sandwich loaves are canceled
- tonight's starter feed should happen earlier and include a note

Editing one occurrence should affect only that specific dated instance.

### Edit the whole series

Use this when the underlying pattern has changed.

Examples:

- the client permanently changed from 20 buns to 24
- a standing Monday prep task now belongs on Sunday night
- a route stop is no longer active

Editing the series should update the template and future generated instances according to clear rules.

### Edit this and future occurrences

This is often necessary when the series changes from a certain date onward.

Examples:

- beginning next week, all weekday bun orders increase
- starting next month, laminated prep happens on a new schedule

This option should exist early if the implementation can support it cleanly. If not, the product must still document how series changes are handled to avoid silent confusion.

## Exception handling

Recurring work must support exceptions without collapsing the underlying model.

Important exception types include:

- skipped occurrence
- quantity override
- note override
- destination change
- timing change
- temporary product substitution

The system should preserve enough traceability to understand whether an occurrence came from a template and how it differs.

## Why recurrence is core

Recurrence belongs near the center of the product because it shapes real operational load.

Without it:

- daily order entry becomes repetitive and error-prone
- standing prep work stays invisible or informal
- production planning becomes less predictable
- the system drifts away from how small kitchens actually operate

With it:

- expected work appears early
- production planning gains stability
- operators can focus on changes rather than retyping the routine
- exceptions become more meaningful because the baseline is visible

## Design guardrails

The recurring model should be:

- understandable by non-technical users
- flexible enough for one-off exceptions
- explicit about series vs occurrence edits
- usable for both sales demand and internal work
- lightweight enough that setting up recurrence does not require enterprise-level admin effort
