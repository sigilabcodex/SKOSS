# AGENTS.md

This repository is in a **blueprint-first** stage.

Before writing significant implementation code, understand the product intent in `README.md` and the documents under `docs/`.

## Project philosophy

SKOSS is being designed as a practical operational system for small food businesses, starting from bakery reality rather than software convention.

Core principles:

- **operator-first, not admin-first**
- **mobile-first, tablet-friendly, desktop-capable**
- **use kitchen language, not ERP language**
- **support real work before advanced master data**
- **keep recurring work, WIP, and handoff central**
- **prefer maintainable simplicity over broad feature sprawl**
- **you can work now, organize later**

## UX constraints

When implementation begins, all product decisions should respect these constraints:

- screens should work well on phones and tablets first
- touch targets should be comfortable and forgiving
- common actions should require minimal typing
- important status should be visible quickly
- notes, exceptions, and partial completion must be easy
- role-based views should reduce cognitive load
- operators should not be forced through admin-heavy workflows to complete daily work
- incomplete setup must not block order capture or shift execution

## Domain-first approach

Do not start from generic CRUD modeling and then try to force the kitchen into it.

Start from the operational flow:

1. orders arrive
2. demand is grouped and interpreted
3. production requirements are derived
4. existing WIP affects what still needs doing
5. work is handed across shifts
6. final outputs are produced and delivered

Model the domain around this transformation flow.

When uncertain, prefer concepts that match how kitchen teams already talk and work.

## Naming guidance

Use practical, human-readable names.

Prefer:

- `order`, `orderLine`, `productionBatch`, `shiftLog`, `baseDough`, `processProfile`
- `kitchen workspace`, `sales workspace`, `handoff`, `destination`
- `draft customer`, `draft product`, `uncategorized item`, `note item`

Avoid introducing user-facing names that sound like ERP internals, such as:

- `third party` when `customer`, `supplier`, or `contact` is clearer
- `stock movement` when `prep usage` or `adjustment` is clearer
- `manufacturing order` when `production batch` is clearer
- `resource allocation` when `assignment` or `work queue` is clearer
- `master data` in user-facing copy when `setup`, `catalog`, or a domain term is clearer

Additional guidance:

- distinguish clearly between **product**, **variant**, and **base dough**
- treat **WIP** as a real first-class concept, not just a status label
- keep advanced identifiers optional and separate from the core user experience
- if bilingual-friendly terminology is needed, prefer plain terms that map well across English and Spanish kitchen usage

## What not to do

Avoid the following unless the docs explicitly evolve to require them:

- do not turn the project into a generic ERP clone
- do not introduce accounting, payroll, or deep inventory complexity early
- do not assume desktop admin usage is the primary workflow
- do not make SKU, barcode, or internal-code setup mandatory
- do not hard-block order entry or production updates behind admin setup screens
- do not over-design the database before the product model is stable
- do not add architecture theater, premature microservices, or speculative abstractions
- do not replace domain terms with framework-driven terminology
- do not treat exceptions and manual overrides as rare edge cases
- do not overengineer offline sync before the product proves what degraded operation actually needs
- do not choose infrastructure that assumes heavy cloud services by default

## Performance and simplicity constraints

Future implementation should preserve the possibility of running well on modest infrastructure.

Prefer decisions that support:

- low-spec Linux VPS hosting
- self-hosted small servers or local machines
- straightforward deployment and restore paths
- small operational overhead for owners and maintainers
- good responsiveness on ordinary phones and tablets over imperfect networks

Be skeptical of choices that add large memory footprints, many moving parts, or mandatory always-on cloud dependencies without strong proof.

## Preferred development behavior

When working in this repo:

1. read the relevant docs first
2. extend documentation and specs before building large features
3. keep implementation decisions reversible when the domain is still forming
4. propose narrow increments tied to real operator workflows
5. document assumptions explicitly
6. preserve a clear difference between confirmed behavior and open questions
7. favor straightforward code and docs that future FOSS contributors can follow
8. prefer progressive structuring over hard normalization that blocks first use
9. treat offline-aware direction as a design constraint, not an excuse for premature sync architecture

## Docs before premature implementation

At this stage, good contributions often look like:

- clarifying domain concepts
- refining glossary terms
- tightening MVP boundaries
- describing workspace behavior
- identifying open questions
- capturing real bakery/kitchen examples
- documenting tradeoffs around hosting, portability, and degraded-network operation

Be cautious about building major infrastructure before these docs are stable enough to guide it.

## If you do implement code later

When code work begins, try to ensure that:

- the UI can support role-oriented workspaces
- the data model can represent recurrence, WIP, notes, handoff, and draft placeholders cleanly
- user-facing copy remains practical and jargon-light
- workflows remain usable without advanced identifiers
- the system can degrade gracefully when setup is incomplete or the network is unreliable
- complexity stays proportional to proven product value
- deployment can stay viable for small self-hosted installations
