# Data Lifecycle

This document describes how SKOSS data should evolve over time.

The key idea is that the system must support both:

- immediate operational capture during messy real work
- later structuring, linking, and auditability as the business formalizes

SKOSS should not assume that every record begins fully modeled.

## Lifecycle principles

## 1. Capture first, structure progressively

A record should be allowed to enter the system in an incomplete but operationally useful form.

Examples:

- a new customer can begin as a draft customer
- a requested item can begin as a draft product or note item
- a recurring pattern can be discovered from repeated usage before it becomes a formal template

## 2. Preserve history rather than rewriting it away

When a draft record becomes structured later, the system should preserve the original operational context instead of pretending the data was always formalized.

## 3. Separate operational truth from derived structure

The original entry matters.

Derived planning, grouping, and formalization should enrich that entry, not erase it.

## 4. Keep auditability practical

A small operator system still needs enough history to answer:

- what changed?
- who changed it?
- when did it change?
- was this generated, entered manually, or adjusted from a template?

## Lifecycle layers

## 1. Draft and placeholder records

These are early-stage records used to avoid blocking work.

### Typical examples

- draft customer
- draft product
- uncategorized item
- freeform note item
- provisional destination

### Characteristics

- fast to create
- may contain minimal fields only
- may rely on text labels and notes rather than structured links
- must still be visible in order review, production views, and handoff where relevant

### Expected behaviors

- clearly marked as draft, placeholder, or note-based
- searchable and reviewable later
- eligible for conversion, merging, or retirement
- never silently discarded just because better structure appears later

## 2. Structured records

These are records that have become reliable reusable business entities.

### Typical examples

- customer with contact details
- product with variants
- base dough
- destination
- recurring template
- process profile

### Characteristics

- reusable across future work
- more normalized and linkable
- better for planning, recurrence, reporting, and consistency

### Expected behaviors

- preferred when available
- still allowed to coexist with draft records during adoption
- version or change history should preserve meaningful evolution where relevant

## 3. Recurring templates

Recurring templates describe repeated expected work before any one dated occurrence exists.

### Types

- recurring order template
- recurring internal task template

### Characteristics

- define the pattern for future work
- are not themselves the dated work items operators complete
- may contain structured or partially structured line definitions depending on the maturity of the business setup

### Lifecycle events

- created from known standing work
- edited at the series level
- suspended, ended, or replaced
- may accumulate exception history on their generated instances

## 4. Generated instances

Generated instances are the dated, actionable occurrences produced from recurrence templates.

### Typical examples

- today's café bun order generated from a weekday template
- tonight's recurring starter-feed task

### Characteristics

- dated and actionable
- linked back to a source template when applicable
- can diverge from the template through one-off overrides

### Lifecycle events

- generated automatically or explicitly prepared for a date range
- edited as single occurrences when reality changes
- canceled, skipped, completed, or partially completed
- preserved for historical review even if the source template later changes

## Order line lifecycle

Order lines are central because they bridge sales capture and production interpretation.

A useful state model should remain practical rather than overly enterprise-like.

## Suggested order line states

### 1. Captured

The line exists and is part of demand.

It may be:

- structured
- draft-based
- note-based

This state means the work has been recorded, not necessarily validated or acted on.

### 2. Clarification needed

The line is operationally real but still ambiguous.

Examples:

- unknown exact variant
- unclear quantity unit
- note item needing supervisor review

This state should highlight uncertainty without blocking the entire order.

### 3. Ready for planning

The line is clear enough to enter grouping and production interpretation.

Not every line needs perfect structure to reach this state.

### 4. Included in production interpretation

The line has been pulled into demand grouping and requirement derivation.

This matters because planning should know whether a line is already influencing production views.

### 5. Partially fulfilled or adjusted

Some or all of the line has been satisfied, substituted, reduced, or otherwise modified.

This state should preserve notes and quantity deltas clearly.

### 6. Completed

The line's output obligation has been satisfied operationally.

### 7. Canceled

The line no longer requires fulfillment.

Cancellation should preserve provenance and timing.

## WIP lifecycle

WIP must be treated as real domain state, not only as a boolean status.

## WIP examples

- dough mixed
- dough resting or fermenting
- pieces divided
- trays shaped
- fillings prepared
- packs partially assembled
- batch blocked due to shortage or issue

## Suggested WIP states

### 1. Planned

The work has been derived or scheduled but not yet started.

### 2. In progress

Work has begun and should affect what remains to be done.

### 3. Partial / incomplete

Work exists but does not fully satisfy the requirement.

Examples:

- dough mixed for 140 of 200 required pieces
- 3 of 5 trays shaped

### 4. Held / resting / waiting

The work is in a legitimate non-active intermediate state.

This is especially important for bakery fermentation, proofing, cooling, and wait-time stages.

### 5. Blocked

The work cannot proceed due to a known issue.

Examples:

- missing ingredient
- oven unavailable
- unresolved substitution question

### 6. Completed

The WIP unit has finished its meaningful stage.

### 7. Discarded / voided

The WIP no longer contributes to expected output and should be recorded accordingly.

## Conversion and formalization flow

A recurring SKOSS pattern is:

1. record something as draft because work is happening now
2. reuse it several times
3. recognize the pattern
4. formalize it into structured data
5. link future work to the structured version
6. preserve the historical records that preceded formalization

## Conversion expectations

### Draft customer to customer

The system should allow:

- preserving original names and notes
- attaching better contact details later
- linking old orders to the formal customer where appropriate

### Draft product to structured product/variant

The system should allow:

- retaining old line text
- mapping repeated draft usage to a canonical product
- optionally identifying whether historical records were retro-linked or left as historical originals

### Repeated ad hoc work to recurrence template

The system should allow:

- creating a recurring template from observed repeated orders or tasks
- defining from which date the template becomes authoritative
- avoiding accidental duplication of already-entered ad hoc instances

## Audit and event history

SKOSS should keep practical audit visibility without requiring enterprise event-sourcing.

## Minimum history expectations

At a minimum, important records should retain:

- created at
- updated at
- actor or source when available
- original source type such as manual entry, recurrence generation, import, or system derivation
- important state changes
- meaningful notes attached to the change

## Events worth retaining explicitly

- order created
- order line added, edited, reduced, or canceled
- recurring instance generated
- one-off override applied to a generated instance
- WIP started, adjusted, blocked, resumed, completed, or discarded
- handoff note added
- draft record converted to structured record
- export or backup event optionally logged in admin history

## What not to overbuild yet

SKOSS does not need full event sourcing in v0.

A practical change log plus record timestamps and authorship is likely enough early on.

## Deletion and archival expectations

Operational systems should be reluctant to hard-delete meaningful history.

### Preferred approach

- soft-delete or archive where business history matters
- preserve references needed for audit and restore
- allow true deletion mainly for mistakes, duplicates, or privacy-driven cleanup under explicit rules

### Why this matters

Orders, WIP, and handoff records often explain later confusion. Removing them casually harms trust.

## Export and backup expectations

Data lifecycle design should support portability from the beginning.

## Export expectations

SKOSS should aim to support:

- CSV or similar tabular export for operational records where sensible
- structured export for important linked entities
- readable summaries for orders, production day state, and handoff where useful

## Backup expectations

The backup story should cover:

- primary database content
- uploaded or attached files if they exist later
- essential configuration required to restore operation

## Restore expectations

A restore should preserve:

- historical records
- recurrence templates and generated history
- WIP and handoff context as recorded at backup time
- draft and placeholder records, not only cleaned-up entities

## Lifecycle design consequences

Because of the lifecycle above, SKOSS data design should:

- allow nullable or optional structure where first-use demands it
- keep explicit source/provenance metadata
- distinguish template records from generated instances
- distinguish planned work from WIP and from final completion
- support conversion and linking rather than forcing rewrite
- preserve enough history to reconstruct operational reality

The result should be a system where data can start rough, become clearer over time, and still remain trustworthy.
