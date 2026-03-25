# Capacity Resources (Proposal)

## Status

Draft proposal for domain direction. Not implemented.

## Purpose

Define a lightweight, kitchen-readable resource model for capacity estimation that fits SKOSS progressive adoption.

## Core idea

Capacity should be modeled through **productive resources** that can become bottlenecks during real work.

Use practical categories:

- people (human effort)
- equipment and workstations
- constrained spaces (fermentation/cold hold)
- dispatch/packing bottlenecks when operationally relevant

Do not require full setup before value appears.

## Proposed lightweight domain objects

## 1) Productive resource (core)

A generic operational resource used for feasibility checks.

Suggested fields:

- `id`
- `workspaceId`
- `name` (example: "Deck Oven 1", "Morning bake crew")
- `resourceType` (`human`, `equipment`, `station`, `space`, `dispatch`)
- `capacityUnit` (example: `hours_per_shift`, `trays_per_hour`, `batches_per_shift`)
- `defaultAvailability` (simple windows)
- `active`
- `notes`

This keeps one common shape while allowing practical variety.

## 2) Human capacity profile (core)

A lightweight profile for role-based shift effort.

Suggested fields:

- `roleKey` (example: `prep`, `bake`, `pack`, `dispatch`)
- `expectedPeoplePerShift`
- `effectiveCapacityPerShift` (simple numeric envelope)
- `overrideByDay` optional

This does **not** require full staff rostering to be useful.

## 3) Equipment resource (core)

For major shared tools that can saturate output.

Suggested fields:

- `equipmentKind` (`oven`, `mixer`, `proofer`, `prep_table`, `packing_station`, `fridge_space`)
- `throughputHint` (simple, optional)
- `batchLimitHint` optional
- `availabilityWindow` optional

Start with only the bottlenecks that matter.

## 4) Process step profile (core-light)

A minimal operational stage hint used for level B estimation.

Suggested fields:

- `stepKey` (`prep`, `mix`, `ferment`, `shape`, `bake`, `pack`, `dispatch`)
- `defaultDurationRange`
- `primaryResourceType` (human/equipment/station/space)

This is not a full route sheet; it is a planning hint.

## 5) Product capability / batch profile (core-light)

A product or product-family hint for capacity math when recipes are partial.

Suggested fields:

- `productId` or `productFamilyKey`
- `typicalBatchSize` optional
- `yieldPerBatch` optional
- `capacityWeight` optional (relative load)
- `fallbackDailyMax` optional

This allows estimation without forcing full formulas.

## Human + non-human interaction

Use a bottleneck-first rule:

- for a requested output, estimate load per stage
- stage feasibility is constrained by the minimum of:
  - available human effort for that stage
  - available key equipment/station/space for that stage

Example:

- enough bakers available, but single oven slot is full -> oven is bottleneck
- oven has space, but only one packer available -> packing is bottleneck

## Shared bottlenecks (explicit)

SKOSS should represent shared bottlenecks as single resources consumed by multiple products/processes.

Examples:

- one deck oven shared by burger buns + baguette finishing
- one large prep table shared by shaping and packing overflow
- one fermentation fridge with limited tray slots

The resource model should allow one resource to be referenced by multiple process-step profiles.

## What belongs in core vs optional

## Core (near-term)

- productive resource basic record
- human shift capacity envelopes by role
- key equipment bottlenecks (oven/mixer/critical station)
- simple availability windows
- product-family capacity hints

## Optional (later)

- detailed individual roster rules
- minute-level changeovers
- maintenance calendars
- advanced constraint dependencies
- route/dispatch optimization

## Incomplete setup behavior

If resource setup is partial:

- capacity estimate should still run using available signals
- missing resources should reduce confidence, not block result
- UI should suggest which missing setup would improve estimate quality

## Bakery-grounded examples

### Example A: Burger buns and oven limit

- buns share one oven with other morning items
- resource model flags oven as saturated for Thursday early morning
- suggestion shifts promise to Friday 11:00 window

### Example B: Brioche dough and mixer limit

- multiple brioche variants consume same mixing resource
- partial WIP exists from prior shift
- model reduces required mixing load, but checks remaining bake and pack resources

### Example C: Dispatch bottleneck

- product ready, but only one dispatch handoff window for app deliveries
- system warns “requires extra shift effort” for same-slot additions

## Naming and UX guidance

Use practical names in UI and docs:

- "bake station" instead of "work center"
- "shift effort" instead of "labor allocation matrix"
- "capacity warning" instead of "finite-capacity exception"

Keep bilingual-friendly wording where possible.
