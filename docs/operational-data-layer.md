# Operational data layer

## Why this layer exists

SKOSS starts from order flow, production, WIP, and handoff.

As real kitchen use becomes stable, the system also needs a small amount of supporting structure underneath that core loop:

- fulfillment should distinguish pickup from delivery work
- supplier memory should not live only in chat history or one person’s head
- raw materials should exist as practical kitchen concepts before full recipe costing
- purchase prices should be historical, not just “current”

This layer should make SKOSS more useful as a practical micro-ERP foundation **without** turning it into a heavy admin-first system.

## Scope of the first operations data layer

The first slice stays intentionally narrow:

1. order fulfillment context
2. suppliers
3. raw materials
4. lightweight recipes / formulas linked to products and raw materials
5. supplier-specific historical price entries

This first procurement and costing slice should feel like a **buying notebook**, not a purchasing department system.

It should let a team:

- remember who they buy from
- keep a lightweight list of materials or ingredients
- append supplier prices over time
- review price history by supplier or by material
- link products to raw materials with lightweight recipes
- see a small estimated material cost summary when pricing evidence is usable
- leave inventory logic, planning automation, and purchasing workflows for later

It does **not** include:

- accounting
- purchase orders
- receiving workflows
- invoice matching
- stock valuation
- approval chains
- full procurement automation

## Fulfillment on orders

Orders need more than a due date.

The kitchen and handoff flow often need to know whether an order is:

- `pickup`
- `own_delivery`
- `app_delivery`

Additional lightweight fields can stay directly on the order:

- `deliveryProvider` for marketplace/app source or route label
- `deliveryAssignee` for the person or route currently expected to take it
- `dispatchNotes` for handoff, route, packing, or courier exceptions

This keeps fulfillment context visible where operators already work, instead of hiding it behind a separate dispatch module.

## Supplier foundation

A supplier record should stay simple:

- name
- contact
- notes
- active state

Supplier setup should support quick creation and later cleanup. A half-filled supplier record is still useful if it helps the kitchen remember where a price came from.

This is enough to:

- remember who the kitchen actually buys from
- support future comparison of prices by supplier
- avoid blocking first use with complex vendor administration

Inactive suppliers should remain available for historical price references.

## Raw material foundation

A raw material record should also stay practical:

- name
- category
- default unit
- optional brand
- notes
- active state

The default unit should remain lightweight and optional. A team may know they buy \"butter\" or \"paper bags\" before they agree on a perfect standard unit.

This layer is not trying to build deep inventory first.

Its immediate value is:

- giving future recipes a stable ingredient reference
- supporting price history by ingredient
- allowing gradual cleanup from draft naming toward reusable material records

## Supplier price history

Supplier prices should be recorded as time-based entries, not overwritten in place.

Each entry should capture:

- supplier
- raw material
- optional presentation
- optional brand
- package quantity
- package unit
- total price
- date
- note

Package quantity and package unit should remain lightweight. When the operator only knows \"this supplier charged 30 on this date,\" the system should still accept the entry and allow package detail to improve later.

That allows future logic to:

- compare current and previous purchase rates
- normalize package prices into a usable unit rate
- feed recipe costing with dated supplier evidence instead of one hard-coded default
- keep alternate suppliers visible without forcing immediate switching workflows

## Lightweight recipe and costing foundation

SKOSS now needs a small recipe or formula layer, but it should remain deliberately modest.

A recipe should:

- attach to a product or variant
- hold a short title and optional batch yield
- contain simple ingredient lines pointing to raw materials
- allow notes or instructions without becoming a process engine
- stay optional for products that are still draft-first or loosely defined

This makes it possible to answer practical questions like:

- what was the latest known supplier price for butter?
- what did flour cost last month compared with today?
- what package size was used for the quoted price?
- which latest supplier price is usable for a rough material estimate right now?

The first costing pass should stay intentionally lightweight:

- use the latest available supplier price entry per raw material
- estimate only when package quantity and unit make normalization reasonable
- show incomplete costing honestly when a line has no usable price
- avoid pretending to be inventory valuation, accounting, or full margin reporting

For that reason, price history should stay:

- supplier-specific
- material-specific
- date-based
- package-aware
- append-only

Historical entries should preserve the original purchasing context instead of pretending there is only one current price.

## Lightweight management UI

The first UI for this layer should provide:

- a supplier list with quick create/edit
- a raw material list with quick create/edit
- a supplier price entry form optimized for fast capture
- a readable history view that can be filtered by supplier or raw material

This UI should stay clean on phones and tablets, use small forms instead of large admin tables, and avoid blocking entry when setup is incomplete.

## UX direction

Management UI for this layer should feel like lightweight operational setup, not an ERP back office.

Good signs:

- small forms
- clear lists
- practical field names
- notes close to records
- active/inactive toggles
- easy addition without large setup projects

Bad signs:

- multi-step administration flows
- mandatory coding systems before first use
- procurement jargon replacing kitchen language
- forcing operators through setup before they can capture orders

## Relationship to progressive adoption

This layer should strengthen the system underneath real work while preserving draft-first behavior where useful.

That means:

- order capture can still happen before setup is perfect
- supplier and raw material setup can grow progressively
- pricing memory becomes better over time instead of being all-or-nothing
- future costing can arrive on top of existing records rather than requiring a restart of the model

## What this layer still does not do

This foundation layer is intentionally **not** full procurement yet.

It does not add:

- purchase orders
- receiving workflows
- inventory counts
- stock valuation
- invoice matching
- accounting hooks
- automatic costing runs
- inventory consumption from recipes
- automatic production planning or MRP
- full BOM or manufacturing module behavior

Those can build later on top of the same supplier, raw material, and price-history records once the operational model proves its value.
