# v0 technical spec

This document translates the existing SKOSS product and domain documents into an implementation-oriented specification for the first buildable version.

It defines what the initial codebase should support and, just as importantly, what it should not attempt yet.

## 1. Product target for v0

v0 should support one realistic small-bakery operational loop:

1. capture ad hoc and recurring demand
2. group demand for a production day
3. record WIP and exceptions
4. hand work from one shift to the next
5. review what remains before final output

The system must remain useful even when setup is incomplete.

## 2. Core entities for v0

These are the first structured entities the implementation should recognize.

### Workspace

Represents the operating business context for v0.

Fields:

- `id`
- `name`
- `slug`
- `timezone`
- `defaultProductionCutoffHour`

Notes:

- v0 assumes one primary workspace in normal use
- multi-workspace support is limited and should not complicate the UI yet

### User

Represents a login with role-shaped access.

Fields:

- `id`
- `displayName`
- `email`
- `passwordHash`
- `role`
- `workspaceId`
- `active`

### Customer

Structured customer record when the operator has enough information.

Fields:

- `id`
- `displayName`
- `phone` nullable
- `notes` nullable
- `defaultDestinationId` nullable
- `status` (`active`, `inactive`)

### Draft customer label

For v0, draft customers do not need a separate heavyweight table if implementation prefers a simpler shape.

Minimum support needed:

- order may reference a structured `customerId`, or
- carry `draftCustomerName` and optional `draftCustomerNote`

### Destination

Represents where an order is expected to end up.

Fields:

- `id`
- `name`
- `kind` (`pickup`, `delivery_stop`, `counter`, `internal`)
- `notes` nullable
- `active`

Destination is useful but must remain optional during early order capture.

### Product

Structured sellable or internally recognized item.

Fields:

- `id`
- `name`
- `category` nullable
- `baseDoughId` nullable
- `defaultUnit` (`pieces`, `trays`, `kg`, `batch`)
- `active`

### Product variant

Operationally meaningful variant of a product.

Fields:

- `id`
- `productId`
- `name`
- `defaultUnit`
- `productionTag` nullable
- `active`

### Draft product reference

Order lines and recurring lines must also support unstructured product capture.

Minimum support needed:

- `draftProductName`
- optional `draftProductDetails`

### Recurring template

Represents repeated expected work.

Fields:

- `id`
- `workspaceId`
- `templateType` (`customer_order`, `internal_task`)
- `title`
- `scheduleRule`
- `startsOn`
- `endsOn` nullable
- `defaultDestinationId` nullable
- `active`
- `notes` nullable

### Generated instance

Represents one dated occurrence created from a recurring template.

Fields:

- `id`
- `recurringTemplateId`
- `productionDate`
- `instanceState`
- `generationSource` (`scheduled`, `manual_regeneration`, `manual_one_off`)
- `notes` nullable

### Order

Represents external demand that contributes to production.

Fields:

- `id`
- `workspaceId`
- `source` (`manual`, `whatsapp`, `phone`, `walk_in`, `generated`)
- `status`
- `customerId` nullable
- `draftCustomerName` nullable
- `destinationId` nullable
- `fulfillmentType` (`standard`, `pickup`, `own_delivery`, `app_delivery`)
- `deliveryProvider` nullable (`internal`, `uber`, `rappi`, `didi`, `other`)
- `deliveryProviderLabel` nullable for custom providers
- `deliveryAssignee` nullable
- `promisedTime` nullable
- `dispatchNotes` nullable
- `dueDate`
- `productionDate`
- `recurringTemplateId` nullable
- `generatedInstanceId` nullable
- `notes` nullable
- `createdByUserId`
- `updatedAt`

The first usable order intake flow should also tolerate a lightweight contact field such as phone or message handle stored directly on the order until customer setup is formalized. Fulfillment fields must stay optional so teams can keep capturing orders even when pickup or delivery detail is still incomplete.

### Order line

Represents one requested item or note-bearing production demand line.

Fields:

- `id`
- `orderId`
- `lineType` (`product_variant`, `draft_product`, `note_item`)
- `productId` nullable
- `variantId` nullable
- `draftProductName` nullable
- `quantity`
- `unit`
- `lineStatus`
- `notes` nullable

### WIP entry

Represents in-progress upstream or downstream work relevant to the active production day.

Fields:

- `id`
- `workspaceId`
- `productionDate`
- `wipType` (`base_dough`, `prep`, `baked_items`, `packed_items`, `other`)
- `referenceLabel`
- `relatedProductId` nullable
- `relatedVariantId` nullable
- `quantity`
- `unit`
- `status`
- `notes` nullable
- `recordedByUserId`
- `updatedAt`

For the first vertical slice, a lightweight `stage` field is also acceptable so operators can quickly mark practical states such as `prepared`, `shaped`, `baked`, or `ready` without forcing recipe logic first.

### Shift log

Represents a shift-level operational summary and handoff.

Fields:

- `id`
- `workspaceId`
- `productionDate`
- `shiftKey` (`night`, `morning`, `afternoon`)
- `status`
- `summary`
- `openItems`
- `handoffNotes`
- `createdByUserId`
- `updatedByUserId`
- `updatedAt`

## 3. Minimal state model

### Order states

- `draft`
- `active`
- `changed`
- `cancelled`
- `completed`

### Order line states

- `draft`
- `planned`
- `in_progress`
- `done`
- `cancelled`

### Generated instance states

- `pending`
- `generated`
- `adjusted`
- `skipped`

### WIP states

- `planned`
- `in_progress`
- `ready`
- `consumed`
- `discarded`

### Shift handoff states

- `open`
- `ready_for_handoff`
- `acknowledged`
- `closed`

These states are intentionally small. v0 should prefer notes over fine-grained status taxonomies.

## 4. First user roles

### Owner admin

Can:

- access all workspaces/screens in v0
- manage products, recurring templates, destinations, and users
- review operational activity

### Sales

Can:

- create and edit orders
- use draft customer and draft product capture
- review recurring-generated orders
- see production-impact warnings

### Kitchen

Can:

- review production-day demand
- update WIP entries
- add line and production notes
- see handoff summaries

### Shift lead

Can:

- do kitchen actions
- write shift logs and handoff notes
- review incomplete items and morning priorities

## 5. First workflows

### Workflow A: ad hoc order capture

1. user opens sales workspace
2. creates order for a due date / production date
3. selects structured customer or enters draft customer name
4. adds one or more order lines
5. line may use structured variant, draft product, or note item
6. saves order as `active`
7. production view includes it in grouped demand

### Workflow B: recurring generation

1. admin creates recurring template
2. system generates dated instances for the planning horizon
3. user reviews generated instances
4. system creates generated orders/tasks for active dates
5. one occurrence may be adjusted without rewriting the template

### Workflow C: production-day review

1. kitchen user opens production workspace for a date
2. sees grouped demand from ad hoc and recurring sources
3. sees unclear/draft demand separately but visibly
4. records WIP already prepared or partly completed
5. uses notes for substitutions, shortages, or exceptions

### Workflow D: shift handoff

1. night shift opens handoff screen
2. records summary, open work, and exceptions
3. marks shift log `ready_for_handoff`
4. morning shift reviews summary and WIP
5. morning shift acknowledges handoff and continues execution

## 6. First screens

### Home / workspace switcher

Purpose:

- orient the user quickly
- provide fast entry to sales, production, handoff, and setup

### Orders list

Must show:

- upcoming orders
- status
- source
- customer or draft customer label
- destination
- pickup vs delivery mode at a glance
- own delivery vs app delivery at a glance
- optional assignee, promised time, and dispatch notes when present
- due/production dates
- warnings for changed/cancelled orders

### Order detail / edit

Must support:

- quick create/edit
- draft customer capture
- draft product and note item lines
- order notes
- simple status updates

### Recurring templates

Must support:

- list templates
- create/edit template basics
- review next generated occurrences
- distinguish template vs one-off occurrence edits

### Production workspace

Must show:

- lightweight fulfillment awareness alongside grouped demand
- delivery orders still needing packing
- own-delivery orders still needing assignment
- pickup orders waiting for collection

- grouped demand for selected production date
- unresolved draft lines
- current WIP entries
- remaining work snapshot
- last updated time

### Shift handoff workspace

Must show:

- current shift log
- open items
- notable WIP
- incoming/outgoing summary

### Setup workspace

Must support:

- products
- variants
- destinations
- users

This setup area must remain secondary to daily operations.

## 7. Key validations

### Orders

- `dueDate` is required
- `productionDate` is required
- order must have at least one line or a meaningful order note
- order must have either `customerId` or `draftCustomerName` when external demand is customer-linked
- cancelled orders require a note in v0 if already active

### Order lines

- quantity must be positive for product/draft product lines
- line must be either structured variant, draft product, or note item
- note item lines may omit quantity only if the text clearly describes action

### Recurring templates

- schedule rule is required
- template must define at least one line or one internal task note
- inactive templates do not generate new instances

### WIP entries

- quantity must be non-negative
- `referenceLabel` is required
- status transitions must be forward-moving unless a note explains reversal

### Shift logs

- `summary` required before `ready_for_handoff`
- `handoffNotes` required when open items remain

## 8. What may remain draft or freeform in v0

The following can remain intentionally loose:

- customer name as draft text
- draft product names
- freeform line notes
- handoff notes
- shortage and substitution notes
- open-item summaries
- destination notes
- product category labels

This is a feature, not a failure. It protects first-use viability.

## 9. What must be structured in v0

The following should be structured from the start:

- users and roles
- workspace
- order header dates
- order/order-line relationship
- recurring template identity and generation date
- core status/state fields
- WIP quantity + status + production date
- shift log production date and shift key

## 10. Data boundaries for v0

### Persisted

- orders and order lines
- recurring templates and generated instances
- products, variants, destinations
- WIP entries
- shift logs
- users/workspace basics

### Not required yet

- recipes as execution-critical records
- costing
- ingredient stock ledger
- purchasing records
- full audit log detail
- attachments/media handling
- deep reporting tables

## 11. Non-goals for implementation

v0 should not attempt:

- batch optimization engines
- recipe-driven auto-scaling with inventory reservation
- route planning
- deep customer CRM
- warehouse-style inventory transactions
- complex permission matrices
- generalized workflow builder behavior
