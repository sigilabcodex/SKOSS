# Architecture Options

This document compares realistic technical architecture directions for SKOSS without prematurely locking the repository into a single stack.

It builds on the existing product constraints:

- operator-first usage on phones and tablets
- progressive adoption with draft and placeholder records
- recurring work, WIP, and handoff near the core
- low-spec VPS viability
- openness to local/LAN deployment
- future offline-aware direction without pretending full sync is solved
- maintainability for a small FOSS project
- practical printing needs in real kitchen workflows

## Architecture language

This comparison should use precise project terms:

- **SKOSS** = the core system, server-side platform, shared workflow engine, and system of record
- **SKOSSina** = the worker-facing client layer that connects to SKOSS from browsers first and possibly PWA or packaged forms later

The question is not whether to build many separate apps immediately. The question is how to keep SKOSS dependable while giving SKOSSina enough flexibility to serve operators on phones, tablets, desktops, and shared stations.

## Evaluation frame

The strongest early architecture for SKOSS is the one that can:

1. keep operator interactions fast on ordinary mobile devices
2. keep SKOSSina lightweight and worker-oriented
3. stay deployable on modest infrastructure
4. keep the system understandable for contributors
5. tolerate degraded connectivity better than a fragile cloud-only design
6. avoid premature distributed-systems complexity
7. leave room for practical print-friendly workflows and future hardware compatibility

## Option 1: classic server-rendered web app

A conventional web application served from one central SKOSS server, with SKOSSina delivered mainly through the browser as a connected client.

### Strengths

- lowest conceptual complexity for an early product
- strong fit for a documentation-first project that still needs domain learning
- simpler security and audit boundaries because most business logic stays server-side
- straightforward deployment on a single VPS or local server
- easy to reason about backups when the main system of record is centralized
- good fit for progressive adoption because server-side forms and workflows can stay forgiving and incremental
- browser printing flows are easier to introduce early than deeper native printer integration

### Weaknesses

- weak resilience when connectivity is poor unless carefully designed
- every interaction risks feeling slower on marginal kitchen Wi-Fi if the UI is too chatty
- local responsiveness on phones may feel worse than more client-heavy approaches if the interaction model is not tuned carefully
- limited offline behavior unless extra client storage layers are added later

### Hosting profile

- very good fit for one small Linux VPS
- very good fit for one on-premises laptop or mini-PC on a LAN
- minimal moving parts if kept to one app process plus one database

### Offline implications

- baseline assumption is online access to the server
- can still support degraded behavior through careful draft-saving flows, retries, and explicit refresh patterns
- true offline capture would need a later client-side persistence layer and conflict rules

### Realtime implications

- polling can handle most v0 needs
- selective server-sent events (SSE) can cover small live updates without requiring a full websocket architecture
- full collaborative realtime is possible later, but not structurally required at the start

### FOSS maintenance burden

- lowest of the options in v0
- broad contributor familiarity
- easier to test and host without specialized tooling
- encourages disciplined dependency selection

### Fit for v0

**Strong.** This is the safest option if the project wants to learn the domain in production without carrying offline-sync or rich-client complexity too early.

## Option 2: PWA-first web app

A web application optimized from the start as a progressive web app, usually with a richer SKOSSina client, installability, service worker support, and meaningful browser-side storage.

### Strengths

- stronger path toward mobile-first responsiveness
- can feel more app-like on phones and tablets
- can improve repeat-entry speed for staff using the same device every day
- creates a cleaner foundation for eventual draft capture during weak connectivity
- installable on devices without app-store overhead
- can cache UI assets aggressively for better repeat performance on unstable networks
- may later help with selected printer or device access depending on platform constraints

### Weaknesses

- easy to overbuild offline expectations before the product proves which workflows truly need them
- service workers, cache invalidation, local data, and sync boundaries add significant operational complexity
- conflict handling becomes a product problem, not only a technical problem
- harder to keep the implementation simple if offline ambitions creep into every feature

### Hosting profile

- still compatible with a small VPS if the server remains modest
- still compatible with local/LAN hosting
- client complexity increases even if server complexity stays moderate

### Offline implications

- much stronger than a classic connected web app
- can support cached shell, local draft capture, and queued actions if the project explicitly builds those paths
- however, reliable offline behavior requires careful decisions about source of truth, conflict detection, and user-visible recovery behavior

### Realtime implications

- a richer client can consume realtime updates well
- but offline-aware clients must also reconcile stale state, retries, and delayed mutations
- the combined realtime-plus-offline model is noticeably more complex than either on its own

### FOSS maintenance burden

- moderate to high relative to v0 needs
- requires long-term discipline around browser APIs, cache behavior, and migration of local data
- narrows the margin for simple volunteer contributions unless the architecture remains very focused

### Fit for v0

**Possible but risky if treated as an offline-first mandate.** Reasonable only if kept intentionally modest: cached shell, minimal client storage, and no promise of full sync semantics.

## Option 3: local/LAN-first deployment model

A deployment-first posture where the primary expected use is a SKOSS server running inside the business network, such as a bakery laptop, office mini-PC, or local Linux box, with SKOSSina clients connecting over Wi-Fi.

This is a deployment model more than a UI model. It can be combined with a classic web app or a modest PWA.

### Strengths

- excellent fit for kitchens with unreliable internet
- keeps latency low for on-site users
- increases operator trust for businesses that prefer local control
- aligns well with single-site operations such as the first bakery target
- fits the portability and self-hosting goals of the project
- often aligns naturally with on-site ticket and label printer scenarios

### Weaknesses

- local operations still need a practical backup story
- local DNS, TLS, device discovery, and update ergonomics can be awkward for non-technical operators
- remote access becomes optional extra work rather than a default capability
- deployment documentation and support burden can be higher than pure VPS hosting

### Hosting profile

- very strong fit for one low-spec laptop, mini-PC, or small server on a LAN
- weaker fit for multi-site usage until sync or central backup stories mature
- can also be mirrored later by a hosted instance, but that is additional complexity

### Offline implications

- strongest degraded-network story without forcing true multi-device offline sync
- if the server remains reachable on the local network, operators can keep working during internet outages
- does not solve the case where each device goes fully offline from the local server

### Realtime implications

- good fit for lightweight realtime because local latency is low
- polling or SSE over LAN is often sufficient
- full websocket infrastructure is still optional rather than mandatory

### FOSS maintenance burden

- moderate overall
- app complexity can stay low, but operational documentation burden increases
- local deployment support matrices can expand if the project is not disciplined

### Fit for v0

**Strong as a supported mode, but probably not as the only primary framing.** It is valuable because it addresses real bakery constraints without requiring full offline sync.

## Option 4: hybrid hosted-plus-local direction

A longer-term model where SKOSS can run centrally on a VPS, run locally on-premises, and later support some form of backup, failover, or selective synchronization between the two.

### Strengths

- most aligned with the long-term portability vision
- gives room for businesses to start hosted and later self-host, or the reverse
- could eventually support local resilience plus remote backup
- attractive for FOSS users who want deployment choice

### Weaknesses

- quickly becomes a distributed-systems problem if attempted too early
- raises difficult questions around conflict resolution, authority, and recovery
- risks turning an operator-first product into an infrastructure project
- highest chance of dependency sprawl and architectural regret in the current stage

### Hosting profile

- potentially flexible in the long run
- operationally heavy in the short run
- unsuitable as a v0 implementation target unless the "hybrid" part is limited to backup/export, not active bi-directional sync

### Offline implications

- could eventually support robust outage strategies
- but only after the project defines authoritative data ownership, sync cadence, and conflict policies
- not credible to promise in v0 yet

### Realtime implications

- local and remote state propagation increase complexity significantly
- not just a transport problem; it affects business semantics and support workflows

### FOSS maintenance burden

- highest of all options
- significant testing matrix expansion
- easier for the project to become contributor-hostile if introduced too soon

### Fit for v0

**Not recommended as an implementation target.** Useful as a future architectural direction only if narrowed to backup/export portability first.

## Comparison summary

| Option | Simplicity | Offline posture | Hosting flexibility | Maintenance burden | v0 fit |
| --- | --- | --- | --- | --- | --- |
| Classic web app | High | Low to moderate | High | Low | Strong |
| PWA-first web app | Moderate | Moderate to high | High | Moderate to high | Conditional |
| Local/LAN-first model | Moderate | Moderate via local server reachability | High for single-site use | Moderate | Strong as a supported mode |
| Hybrid hosted + local sync | Low | Potentially high later | High later | High | Weak for v0 |

## Recommendation

### Recommended direction for v0

SKOSS should most likely pursue a **classic server-centered web application with deliberate support for both small VPS hosting and local/LAN deployment**, while leaving room for a **modest SKOSSina PWA layer later**.

In practice, that means:

- one authoritative SKOSS server-side system of record
- mobile-first browser UX as the first SKOSSina form factor
- deployment that works either on a modest VPS or on a local machine inside a bakery network
- careful use of polling or lightweight push for live updates
- no early promise of multi-device offline mutation sync
- print-friendly workflows designed early enough to support real kitchen and counter operations

### Why this direction fits SKOSS best right now

- it keeps the project focused on operator workflows instead of infrastructure novelty
- it fits the first real target, Kalali, where one-site operations matter more than multi-site scale
- it keeps backup and restore understandable
- it supports progressive adoption without forcing a heavy client architecture
- it leaves room to add cached assets, limited local draft persistence, and future packaged-client forms later if real usage proves the value

### What to avoid hard-locking yet

The repository should **not** yet hard-lock:

- the frontend framework model
- the backend language or server framework
- the database engine
- the exact realtime transport
- the exact offline storage mechanism
- the final SKOSSina packaging model
- the final printer integration stack

Those choices should be made only after the next implementation pass can score them against the decision framework and actual workflow prototypes.

### Current architectural posture

A practical near-term stance is:

- one shared SKOSS core serving browser-first SKOSSina clients
- hosted and local/LAN deployment both treated as real targets
- optional client packaging deferred until it improves proven workflows
- printing treated as an operational requirement, with hardware depth added progressively
