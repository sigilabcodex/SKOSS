# v0 API surface

This document defines the minimal conceptual backend surface for SKOSS v0.

It is intentionally practical rather than exhaustive. The goal is to define the first application boundary, not a permanent public API contract.

## API style for v0

- REST-like JSON endpoints are sufficient.
- Server-rendered forms and server actions may call the same domain services internally.
- Endpoint count should stay small.
- Prefer coarse, workflow-shaped endpoints over many tiny generic endpoints.

Base path used in examples: `/api/v0`

## Shared response conventions

### List endpoints

Return:

- `items`
- `page` when pagination exists
- `filters` echo when useful

### Mutation endpoints

Return:

- the updated record where practical
- `warnings` array for non-blocking issues

### Error shape

Return a simple structure:

```json
{
  "error": {
    "code": "validation_error",
    "message": "productionDate is required"
  }
}
```

## 1. Orders

### `GET /api/v0/orders`

Purpose:

- list orders for upcoming dates or filtered review

Suggested filters:

- `from`
- `to`
- `status`
- `productionDate`
- `destinationId`

### `POST /api/v0/orders`

Purpose:

- create a new order quickly

Body shape:

- order header
- line array
- customerId or draft customer text

### `GET /api/v0/orders/:orderId`

Purpose:

- fetch one order with lines

### `PATCH /api/v0/orders/:orderId`

Purpose:

- update header fields or status
- add/change notes
- apply late edits

### `POST /api/v0/orders/:orderId/cancel`

Purpose:

- cancel an order with a reason note

### `POST /api/v0/orders/:orderId/lines`

Purpose:

- append a line to an existing order

### `PATCH /api/v0/orders/:orderId/lines/:lineId`

Purpose:

- update quantity, notes, or line classification

## 2. Products and draft products

### `GET /api/v0/products`

Purpose:

- list active products and variants for fast order entry

### `POST /api/v0/products`

Purpose:

- create a structured product when the team is ready

### `PATCH /api/v0/products/:productId`

Purpose:

- update product basics

Draft products in v0 do not require a separate endpoint family.

Draft support happens through:

- order lines carrying `lineType = draft_product`
- optional later promotion workflow from draft label to structured product

## 3. Recurring templates

### `GET /api/v0/recurring-templates`

Purpose:

- list active/inactive recurring templates

### `POST /api/v0/recurring-templates`

Purpose:

- create recurring customer order or internal task template

### `GET /api/v0/recurring-templates/:templateId`

Purpose:

- fetch template with generated instance preview

### `PATCH /api/v0/recurring-templates/:templateId`

Purpose:

- edit template basics

### `POST /api/v0/recurring-templates/:templateId/generate`

Purpose:

- manually generate or regenerate dated instances in a range

## 4. Generated instances

### `GET /api/v0/generated-instances`

Purpose:

- review generated occurrences by date and state

Suggested filters:

- `from`
- `to`
- `state`
- `templateId`

### `PATCH /api/v0/generated-instances/:instanceId`

Purpose:

- skip, adjust, or annotate one occurrence without changing the template

### `POST /api/v0/generated-instances/:instanceId/materialize`

Purpose:

- convert a generated occurrence into an actual order/task record when needed

## 5. WIP entries

### `GET /api/v0/wip-entries`

Purpose:

- list WIP by production date

Suggested filters:

- `productionDate`
- `status`
- `wipType`

### `POST /api/v0/wip-entries`

Purpose:

- record new WIP

### `PATCH /api/v0/wip-entries/:wipEntryId`

Purpose:

- update quantity, state, or note

## 6. Shift logs / handoff

### `GET /api/v0/shift-logs`

Purpose:

- list shift summaries for a production date

Suggested filters:

- `productionDate`
- `shiftKey`

### `POST /api/v0/shift-logs`

Purpose:

- create a shift log or start a shift summary

### `PATCH /api/v0/shift-logs/:shiftLogId`

Purpose:

- update summary, open items, or handoff notes

### `POST /api/v0/shift-logs/:shiftLogId/ready-for-handoff`

Purpose:

- mark a shift log ready for review

### `POST /api/v0/shift-logs/:shiftLogId/acknowledge`

Purpose:

- incoming shift confirms receipt of handoff

## 7. Production workspace aggregation

### `GET /api/v0/production-day`

Purpose:

- provide one practical payload for the kitchen workspace

Suggested query:

- `productionDate`

Returns a workflow-shaped aggregate such as:

- grouped demand
- unresolved draft lines
- WIP snapshot
- open shift log items
- freshness timestamp

This endpoint is intentionally not normalized. It exists because the kitchen workspace needs a useful operational bundle.

## 8. Users and workspaces

### `GET /api/v0/me`

Purpose:

- current user and workspace context

### `GET /api/v0/users`

Purpose:

- list users for setup

### `POST /api/v0/users`

Purpose:

- create a user with a role

### `PATCH /api/v0/users/:userId`

Purpose:

- update role or active state

### `GET /api/v0/workspaces`

Purpose:

- list accessible workspaces

For v0, this may usually return one workspace.

## 9. What is deliberately omitted

The v0 API surface does not define endpoints for:

- inventory ledger operations
- recipe costing
- procurement
- accounting
- delivery routing
- generalized reports
- attachment upload pipeline
- websocket event channels
- offline sync queues

## 10. Implementation note

The initial codebase does not need to expose every endpoint immediately.

The important thing is that implementation grows along this narrow operational surface rather than drifting into generic CRUD for every possible concept.

## Current vertical-slice note

In the first usable operational slice, the primary user flow may be implemented as **server-rendered forms plus server actions** before the API surface is rounded out.

That means the practical end-to-end path can be:

- create or edit orders from the sales workspace
- review grouped demand in the production workspace
- record WIP and handoff notes from the shift workspace

while still keeping the conceptual API above as the guiding shape for later endpoint hardening.
