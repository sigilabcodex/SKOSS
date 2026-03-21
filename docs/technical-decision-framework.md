# Technical Decision Framework

This document defines how SKOSS should evaluate architectural and technical choices.

It is intentionally stack-neutral. The point is not to decide tools in the abstract. The point is to choose only what helps the product remain operator-first, portable, and maintainable.

## How to use this framework

Before adopting a major technical approach, dependency, or deployment assumption, ask:

1. does this improve daily operator work in a meaningful way?
2. does it preserve simplicity on modest infrastructure?
3. does it keep future maintenance realistic for a FOSS project?
4. does it keep options open for local deployment and degraded networks?
5. is it solving a real SKOSS problem now, or an imagined future one?

If a choice scores poorly on those questions, it should usually be deferred.

## Primary decision criteria

## 1. Operator speed

The system exists to help working kitchen teams move faster and with less friction.

### What this means

- common actions should be fast on phones and tablets
- the UI should avoid unnecessary page complexity and typing
- save, update, and review flows should feel responsive even on imperfect networks
- important state changes should be obvious quickly

### Questions to ask

- does this technical choice reduce time to complete common daily actions?
- does it improve perceived performance for touch users?
- does it avoid creating lag through too many round trips, large bundles, or chatty APIs?

### Priority

**Very high.** A technically elegant choice that slows operators is a bad fit.

## 2. Simplicity

Simplicity is a product constraint, an operational constraint, and a contributor constraint.

### What this means

- fewer moving parts
- fewer required services
- easier debugging
- fewer hard-to-explain concepts in code and deployment

### Questions to ask

- can a new contributor understand the flow without reading a platform thesis?
- does this introduce new infrastructure just to support a marginal feature?
- can the system still be explained as one understandable application?

### Priority

**Very high.** Complexity must be earned.

## 3. Low-spec hosting viability

SKOSS should remain feasible on a modest VPS or a small local machine.

### What this means

- moderate RAM and CPU usage
- no mandatory cloud-only components
- no assumption of managed distributed infrastructure
- practical deployment on a single Linux host

### Questions to ask

- can this run comfortably on a small VPS?
- can a bakery host it on a mini-PC or laptop if needed?
- does this create operational burden that small operators cannot sustain?

### Priority

**Very high.** If infrastructure needs drift upward too early, product fit drifts with them.

## 4. Progressive adoption support

SKOSS must tolerate incomplete setup without blocking real work.

### What this means

- draft and placeholder records are normal, not edge cases
- core workflows cannot depend on perfect normalization
- the data model and UI must handle ambiguity honestly

### Questions to ask

- does this design tolerate partially structured data?
- does it allow records to mature over time?
- does it force admin setup before operational use?

### Priority

**Very high.** Technical choices that assume perfect setup are misaligned with the product.

## 5. Maintainability

The system should remain understandable and repairable by future contributors.

### What this means

- straightforward code paths
- replaceable dependencies
- clear boundaries between domain logic and generic infrastructure
- limited hidden magic

### Questions to ask

- can this still be maintained if the original authors step away?
- is the dependency replaceable later?
- does it improve clarity, or only reduce short-term coding effort?

### Priority

**Very high.** FOSS sustainability depends more on maintainability than on cleverness.

## 6. Realtime needs

SKOSS should support live coordination where it actually matters, but should not assume every screen must be realtime.

### What this means

- kitchen and handoff state may need timely updates
- many administrative views do not
- a spectrum exists between manual refresh, polling, SSE, and websocket collaboration

### Questions to ask

- is this screen harmed by a 10 to 30 second delay?
- do users need shared awareness, or just recent data?
- can polling solve this cheaply before heavier transport is introduced?

### Priority

**Medium.** Important, but often overestimated at the start.

## 7. Offline tolerance

SKOSS should be designed to degrade gracefully, but should not fake solved sync semantics.

### What this means

- the system should behave reasonably under weak or unstable connectivity
- local/LAN deployment is a valid resilience strategy
- client-side offline mutation should be scoped carefully

### Questions to ask

- is the problem actually internet outage, or just remote-host latency?
- can local hosting solve the problem more simply than multi-device sync?
- what conflicts would occur if multiple devices edit the same work offline?

### Priority

**Medium to high.** Important for product direction, but dangerous when overgeneralized.

## 8. Portability

Operators should be able to move SKOSS between environments and retain control of their data.

### What this means

- practical export formats
- clear backups
- recoverable state
- limited coupling to one vendor or one hosting pattern

### Questions to ask

- can the data be exported and restored without reverse engineering?
- can the application move between VPS and local hosting?
- does this choice create hidden lock-in?

### Priority

**High.** Portability underpins trust.

## 9. Security baseline

SKOSS needs sensible default security without enterprise ceremony.

### What this means

- reliable authentication and password handling
- role-oriented access boundaries
- encrypted transport where relevant
- small attack surface through fewer components

### Questions to ask

- does this increase the exposed surface area unnecessarily?
- does it require extra secrets or services to manage?
- can small operators deploy it safely with documented defaults?

### Priority

**High.** Security should be practical, not ornamental.

## 10. Implementation complexity

A choice may be good in theory but too expensive for the current stage.

### What this means

- prefer reversible early implementation paths
- avoid building infrastructure whose main benefit is hypothetical future scale
- recognize when solving one problem creates three new ones

### Questions to ask

- how much complexity is introduced relative to proven value?
- how hard is this to test well?
- what future obligations does this create?

### Priority

**High.** Complexity cost must be paid in maintenance, not just initial coding.

## Decision weighting

Not all criteria are equal.

### Default weighting for v0

| Criterion | Weight |
| --- | --- |
| Operator speed | Very high |
| Simplicity | Very high |
| Low-spec hosting | Very high |
| Progressive adoption support | Very high |
| Maintainability | Very high |
| Portability | High |
| Security baseline | High |
| Implementation complexity | High |
| Offline tolerance | Medium to high |
| Realtime needs | Medium |

## Decision patterns SKOSS should prefer

When comparing two reasonable options, SKOSS should generally prefer the one that is:

- easier to self-host
- easier to back up and restore
- easier to explain to future contributors
- friendlier to partially structured workflows
- less dependent on always-on network assumptions
- less coupled to large proprietary ecosystems
- more replaceable if project needs evolve

## Decision patterns SKOSS should be skeptical of

SKOSS should be skeptical of choices that:

- require multiple always-on infrastructure services from day one
- assume desktop office usage as the primary operating mode
- impose strict schemas before draft workflows are proven
- create a distributed-systems problem before single-site workflows are stable
- add large client frameworks or state layers mainly to look modern
- solve speculative scale rather than actual bakery coordination

## A practical scorecard

For major choices, contributors should be able to write a short assessment like this:

| Criterion | Score | Notes |
| --- | --- | --- |
| Operator speed | 1-5 | What user-facing benefit is concrete? |
| Simplicity | 1-5 | How many moving parts does it add? |
| Low-spec hosting | 1-5 | Can a small VPS handle it well? |
| Progressive adoption | 1-5 | Does it tolerate incomplete setup? |
| Maintainability | 1-5 | Can future contributors own it? |
| Realtime fit | 1-5 | Is the transport proportionate to need? |
| Offline tolerance | 1-5 | Does it improve degraded behavior honestly? |
| Portability | 1-5 | Can users move and export easily? |
| Security baseline | 1-5 | Does it improve or complicate secure defaults? |
| Implementation complexity | 1-5 | Is the added complexity worth it now? |

Scores are not a substitute for judgment, but they help expose when a decision is being driven by fashion rather than fit.

## Decision rule for v0

For v0, a choice should usually move forward only if it is:

- strong on operator speed and simplicity
- acceptable on low-spec hosting and maintainability
- honest about offline and realtime tradeoffs
- clearly better than the simplest alternative

If the case depends mainly on future theoretical needs, SKOSS should usually defer it.
