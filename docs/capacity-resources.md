# Capacity Resources (Proposal)

## Status

Draft domain proposal. Not implemented.

## Purpose

Define a lightweight resource model for production feasibility that fits SKOSS progressive adoption and kitchen language.

## Resource model overview

Capacity should be represented by **productive resources** that affect output.

Two groups are required:

1. **Human resources** (workers, roles, shifts)
2. **Non-human resources** (ovens, mixers, prep tables, fermentation space, packaging stations, dispatch bottlenecks)

## Core domain objects

## 1) productiveResource (core)

A generic bottleneck/capacity contributor.

Suggested fields:

- `id`
- `workspaceId`
- `name`
- `resourceType` (`human`, `equipment`, `station`, `space`, `dispatch`)
- `capacityUnit` (human-readable, example: `trays_per_shift`)
- `defaultAvailability`
- `active`
- `notes`

## 2) capacityProfile (core)

A coarse envelope used in Level A and Level B checks.

Suggested fields:

- `id`
- `profileScope` (`product`, `product_family`, `resource`, `role`)
- `scopeRef`
- `maxPerDay` optional
- `maxPerShift` optional
- `safetyBufferPercent` optional
- `effectiveFrom` optional

## 3) operationHint / processHint (optional-core bridge)

Light hint about which stage consumes which resources.

Suggested fields:

- `stepKey` (`prep`, `mix`, `ferment`, `shape`, `bake`, `pack`, `dispatch`)
- `primaryResourceRef` optional
- `secondaryResourceRef` optional
- `durationHint` optional

This improves estimates but remains optional.

## Human resource modeling

Keep it lightweight:

- role-level shift effort is enough at first (not full HR roster)
- examples: `morning_bake_crew`, `night_prep_crew`, `packing_shift`
- allow simple shift overrides by day when needed

## Non-human resource modeling

Start with real bottlenecks only:

- ovens
- mixers
- prep tables
- fermentation/proofing/cold space
- packaging stations
- dispatch handoff points when they constrain throughput

Avoid modeling every tool in the kitchen.

## Shared bottlenecks

Shared bottlenecks are first-class.

Example:

- one deck oven is consumed by buns, conchas, and loaves
- all those flows reference the same oven resource
- oven load becomes a single limiting signal

This is the practical model for "one oven" constraints.

## Core vs optional scope

### Core (near-term)

- `productiveResource` basic record
- `capacityProfile` at product/product-family and role/resource scope
- shift-level human effort envelopes
- key equipment bottlenecks

### Optional later

- minute-level changeovers
- maintenance calendars
- individual worker assignment logic
- complex dependency networks
- route optimization

## Lightweight setup strategy

To keep setup practical:

1. start with 1-3 critical bottlenecks
2. set rough day/shift limits
3. optionally add stage hints only where warnings are noisy
4. improve progressively from shift logs and observed misses

No perfect configuration is required before value.

## Incomplete data behavior

If some resources are missing:

- estimate with known envelopes
- reduce confidence
- return clear reason labels (example: `missing_oven_profile`)
- never force a setup-complete gate for order capture

## Kitchen examples

- **Bakery oven bottleneck:** enough dough, not enough bake slots.
- **Mixer bottleneck:** multiple brioche variants compete for one mixer.
- **Packaging bottleneck:** baking completes on time but one packing station delays delivery readiness.
