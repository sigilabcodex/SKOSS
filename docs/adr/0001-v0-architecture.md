# ADR 0001: v0 architecture

- Status: Accepted
- Date: 2026-03-21

## Context

SKOSS has completed an exploration phase covering product intent, domain language, deployment principles, realtime/offline posture, and FLOSS landscape review.

The project now needs one concrete implementation path for v0.

That path must respect the repo's documented constraints:

- operator-first workflows over admin-heavy setup
- mobile-first and tablet-friendly UI
- support for draft customers, draft products, and freeform notes
- low-spec VPS and local/LAN hosting viability
- small-team FOSS maintainability
- no premature distributed systems or offline-sync complexity

## Decision

For v0, SKOSS will use a **single deployable monolithic web application** with a **server-centered architecture**.

### Recommended architecture style

- One application repository.
- One deployable web app process.
- One relational database file/service.
- Clear internal module boundaries by domain, not microservices.
- Server remains the system of record.

This is intentionally boring. The product still needs operational learning more than infrastructure novelty.

### Backend approach

Use **TypeScript on Node.js inside the same Next.js application** for v0 server logic.

Concretely:

- Next.js App Router for UI routes.
- Route handlers / server actions for the small v0 backend surface.
- Domain logic kept in plain TypeScript modules under `lib/domain` and `lib/server`.
- No separate backend service in v0.

Why:

- keeps deployment to one app
- reduces context-switching for contributors
- keeps business rules near the UI without forcing them into components
- supports incremental evolution toward clearer service boundaries later if warranted

Tradeoff:

- application concerns are closer together than in a split frontend/backend stack
- disciplined module boundaries will matter to avoid framework-driven sprawl

### Frontend approach

Use a **mobile-first server-rendered React web app** with **Next.js + TypeScript**.

Concretely:

- App Router pages for role-shaped workspaces
- simple shared components
- plain CSS via global stylesheet for now
- no component library in v0
- no complex client state framework in v0

Why:

- easy to ship on phones, tablets, and desktop browsers from one codebase
- server rendering reduces initial client complexity
- supports touch-first UI without committing to native apps
- avoids the overhead of a separate SPA API architecture early

Tradeoff:

- some highly interactive screens may later need more client-side behavior
- visual system maturity will need deliberate iteration because we are not adopting a full design system now

### Database choice

Use **SQLite for v0**.

Concretely:

- SQLite file as the primary data store for local development and initial production pilots
- schema should stay compatible with a later move to PostgreSQL if operational scale proves it necessary

Why:

- excellent portability and backup simplicity
- strong fit for single-instance VPS or local bakery server deployment
- low operational burden for early adopters and FOSS contributors
- enough for a small team and first pilot scope if we stay on a single app instance

Tradeoff:

- weaker fit for high write concurrency and multi-instance deployments
- not the right long-term default if SKOSS later grows to multi-site or heavier traffic

This tradeoff is acceptable because v0 is explicitly a first operational pass, not a scale-out platform.

### Deployment target for v0

Primary deployment target:

- **single Linux host**, either:
  - a small VPS, or
  - a local bakery/server machine on the LAN

Concretely:

- one Node.js app process
- one SQLite database file on local disk
- reverse proxy and TLS handled outside the app in production

Why:

- matches the repo's portability goals
- keeps backup and restore understandable
- avoids introducing managed-cloud dependencies

### Realtime strategy for v0

Use **polling by default**, with room for **selective SSE later**.

Concretely:

- operational views may refresh every 15-30 seconds or on explicit actions
- production/handoff views should show last updated time and stale-state awareness
- do not build websocket infrastructure in v0

Why:

- enough for order changes, WIP, and handoff visibility in an early bakery deployment
- much simpler to debug and host than websocket-heavy coordination

Tradeoff:

- updates are not instant
- some shared-awareness flows may feel slightly stale under rapid changes

That is acceptable for v0 if the UI is honest about freshness.

### Offline stance for v0

Use a **server-first, offline-aware** stance.

Concretely:

- no promise of multi-device offline mutation sync
- no local-first conflict engine
- UI should tolerate reconnects and show connection/staleness states clearly
- local/LAN deployment is the main resilience story for internet outages

Why:

- keeps implementation honest
- avoids inventing sync semantics before real workflow learning
- still supports practical degraded operation through local hosting

### Auth and roles scope for v0

Use **simple password-based auth** with a **small role set**.

Roles for v0:

- `owner_admin`
- `sales`
- `kitchen`
- `shift_lead`

Behavior:

- role-based workspace visibility
- no complex permission matrix
- one business/workspace context in v0
- basic user management only

Why:

- enough to shape screens and reduce noise
- avoids enterprise RBAC complexity

Tradeoff:

- coarse permissions may be too broad for some future teams
- that is acceptable until real usage reveals missing boundaries

## Explicitly deferred

The following are out of scope for v0 architecture:

- microservices or event-bus architecture
- separate SPA frontend plus separate API backend deployment
- PostgreSQL as a required default
- mandatory Docker-first production deployment
- Kubernetes, serverless multi-service hosting, or managed cloud dependencies
- websocket-first realtime infrastructure
- offline mutation sync between multiple devices
- native mobile apps
- advanced inventory, costing, accounting, payroll, or BPM/workflow engines
- complex multi-tenant organization hierarchy
- granular enterprise permission matrices
- analytics warehouse or reporting pipeline

## Consequences

### Positive

- fastest path from blueprint to usable implementation
- low deployment and contributor burden
- portable for small self-hosted installations
- easy to reason about backups and restore
- domain logic can evolve without distributed-systems drag

### Negative

- some future scaling paths will require migration work
- SQLite may eventually be replaced in larger deployments
- polling is less elegant than richer realtime models
- single-app architecture requires discipline to keep module boundaries clean

## Review trigger

Revisit this ADR when any of the following becomes true:

- a pilot shows SQLite write contention or operational limits
- production coordination needs sub-second live updates across many users
- offline queueing becomes a proven requirement for a specific workflow
- multiple independent sites/workspaces require stronger tenancy boundaries
- the app has enough validated domain stability to justify deeper infrastructure separation
