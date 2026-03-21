# Realtime and Offline Strategy

This document defines a practical v0 stance on live updates, degraded networks, and offline-aware behavior.

The goal is to be honest:

- some SKOSS workflows benefit from timely shared updates
- not every screen needs true realtime behavior
- offline support is desirable, but full sync is a hard product problem
- local/LAN deployment may solve more early reliability problems than browser-only offline sync

## Core stance

SKOSS should be:

- **realtime-selective** rather than realtime-everywhere
- **offline-aware** rather than offline-first by default
- **local/LAN-capable** as a practical resilience strategy
- **sync-skeptical** until real workflows define the conflict model

## Degraded network assumptions

SKOSS should assume real environments such as:

- bakery Wi-Fi with dead spots
- old phones or tablets
- temporary router failures
- internet outages while the local network still works
- slow WAN connections to a hosted server

These conditions imply two design priorities:

1. avoid fragile interaction patterns that require constant low-latency connectivity
2. distinguish between internet outage and total local disconnection

## What likely needs realtime behavior in v0

These are the areas where timely updates create clear operational value.

## 1. Kitchen production state

Examples:

- WIP quantities change
- a task becomes blocked
- a batch is marked complete
- a note is added that changes what the next worker should do

### Why it matters

Operators can duplicate work or miss exceptions if state is stale for too long.

### v0 target

- near-live updates are useful
- short polling or lightweight server push is likely sufficient
- full collaborative cursor-level realtime is unnecessary

## 2. Shift handoff and morning review

Examples:

- night shift adds a final note
- a key item is marked partial rather than complete
- a shortage or substitution note appears near shift change

### Why it matters

Handoff quality depends on shared awareness of the latest important updates.

### v0 target

- timely summary refresh
- event feed or lightweight push acceptable
- emphasis should be on visibility, not live co-editing complexity

## 3. Order intake affecting active production day

Examples:

- a last-minute order changes today's grouped demand
- a cancellation reduces required output
- a destination note changes urgency

### Why it matters

The production view needs to remain believable.

### v0 target

- updates within seconds or tens of seconds are likely enough
- explicit "production changed" indicators may matter more than invisible instant mutation

## What can likely be polling-based in v0

These areas benefit from freshness, but do not justify heavy realtime infrastructure early.

## 1. Orders list and queue review

A refresh every 15 to 60 seconds, or on focus, is often enough.

## 2. Recurring template management

These are lower-frequency admin actions. Manual refresh or occasional polling is sufficient.

## 3. Product, variant, destination, and setup views

These are not live operational coordination surfaces in v0.

## 4. Reports and historical review

Freshness matters less than correctness and clarity.

## What should wait

The following should be deferred until real usage proves they are worth the complexity.

## 1. Full multi-device offline mutation sync

This requires:

- local authority rules
- conflict resolution semantics
- replay behavior
- duplicate prevention
- user-visible recovery tools

That is too much to assume before the domain workflows stabilize.

## 2. Live collaborative editing of the same record

SKOSS does not need Google Docs-style simultaneous editing in v0.

The product problem is shared operational state, not shared text cursor state.

## 3. Event streaming architecture across many services

The project does not need a message-bus platform to support a small bakery workflow.

## 4. Device-to-device peer sync

This is technically interesting and operationally risky at the current stage.

## Offline-aware boundaries for v0

The safest v0 boundary is:

- the server remains the primary system of record
- browsers may later cache assets and perhaps limited local drafts
- operations should degrade gracefully when the network is poor
- local deployment remains a first-class resilience strategy

## Reasonable v0 offline-aware features

These are realistic without overcommitting to full sync.

### Cached application shell

If a web UI is later chosen to support PWA installation, caching static assets can reduce repeat-load failures and improve perceived reliability.

### Graceful retry and reconnect behavior

The UI should:

- show connection loss clearly
- retry safely
- avoid silent submission failures
- avoid duplicate submissions when connectivity returns

### Explicit stale-state indicators

Users should know when a screen may be stale rather than assuming the system is live.

### Optional local draft buffering later

If workflow testing shows clear need, draft entry for selected actions could be buffered locally and submitted when the connection returns.

This should start with narrow, low-conflict workflows only.

## Local-first aspirations

SKOSS should remain architecturally open to more local-first behavior later, but only by phases.

## Phase 1: server-first, LAN-capable

- single authoritative server
- reachable via internet-hosted or local-LAN deployment
- mobile browsers as clients

## Phase 2: offline-aware UX improvements

- cached assets
- reconnect handling
- stale banners
- optional narrow local draft buffering

## Phase 3: selective local data for specific workflows

Only if proven necessary:

- local queueing for low-conflict actions
- clearer reconciliation of queued mutations
- explicit operator-facing conflict handling

## Phase 4: broader sync model

Only if the product expands enough to justify it:

- true multi-device offline editing
- sync conflict semantics
- hybrid hosted/local synchronization

This phase should not shape v0 implementation prematurely.

## Realtime transport guidance

Without choosing a stack yet, the likely order of complexity should be:

1. manual refresh where perfectly acceptable
2. periodic polling for many operational views
3. selective server-sent events for important update notifications
4. websockets only if polling or SSE prove insufficient

This ordering fits SKOSS because many updates are one-way notifications rather than rich bidirectional sessions.

## What not to overbuild yet

SKOSS should explicitly avoid these early traps:

- building an offline engine before validating the data conflict model
- adopting a heavy client-state architecture just because PWA support sounds modern
- assuming every page needs instant push updates
- introducing queues, brokers, or CRDT-style systems before single-site coordination is proven
- conflating "works during internet outage" with "every device works independently offline"

## Recommended v0 posture

A strong v0 position is:

- mobile-first connected web UX
- short polling for most operational freshness
- optional lightweight push for production and handoff changes
- local/LAN deployment supported as a practical degraded-network answer
- no promise yet of full offline mutation sync across devices

That gives SKOSS room to feel reliable in real bakery conditions while staying honest about what is still unsolved.
