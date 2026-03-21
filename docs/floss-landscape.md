# FLOSS Dependency Landscape

This document reviews FLOSS libraries, tools, and components that SKOSS could potentially adopt instead of rebuilding from scratch.

The review is intentionally conservative.

SKOSS should prefer:

- stable, well-documented, replaceable tools
- permissive licensing
- portable deployment
- low operational overhead
- small composable building blocks over monolithic platforms

It should avoid dependencies that would turn the project into a fragile tree of indirect obligations.

## Reading guide

The recommendations use these statuses:

- **adopt now** — strong candidate if implementation begins in a matching stack area
- **consider later** — plausible, but only if a real need appears
- **avoid for now** — not wrong in general, but too early or too heavy for SKOSS right now
- **reject** — poor fit for current SKOSS direction

A status here is not a repository lock. It is a fit assessment.

## 1. Persistence / database

## SQLite

- **What it does:** embedded SQL database stored in a local file.
- **Why it might fit SKOSS:** excellent fit for small deployments, local/LAN installs, portability, simple backup copies, and low operational overhead.
- **Risks / tradeoffs:** write concurrency is more constrained than a client-server database, and remote multi-node patterns become awkward fast.
- **Maturity / stability signals:** extraordinarily mature, enormous install base, long-term file-format stability, strong testing reputation, public-domain source.
- **Recommended status:** **adopt now** for prototypes and possibly v0 if the selected implementation stack suits it.
- **Primary sources:** https://www.sqlite.org/about.html ; https://sqlite.org/whentouse.html

## PostgreSQL

- **What it does:** full client-server relational database.
- **Why it might fit SKOSS:** strong transactional model, robust concurrency, mature backup tooling, and broad contributor familiarity.
- **Risks / tradeoffs:** higher operational footprint than SQLite; may be unnecessary if early SKOSS stays single-node and modest in load.
- **Maturity / stability signals:** decades of stable releases, current official documentation and active maintained branches.
- **Recommended status:** **adopt now** as a serious option to compare against SQLite when implementation planning begins.
- **Primary sources:** https://www.postgresql.org/docs/ ; https://www.postgresql.org/docs/current/index.htm

### Persistence takeaway

SKOSS should likely compare **SQLite** and **PostgreSQL** as the only serious primary database candidates for v0. Adding more database options now would create noise rather than insight.

## 2. Recurrence / scheduling

Recurrence is core to SKOSS, so it is worth adopting an RFC-informed recurrence library instead of hand-rolling date math.

## rrule.js

- **What it does:** JavaScript implementation of RFC 5545 recurrence rules.
- **Why it might fit SKOSS:** directly aligned with recurring orders and recurring internal tasks; useful if a JavaScript or TypeScript layer handles recurrence evaluation.
- **Risks / tradeoffs:** JavaScript-specific; timezone and series-edit semantics still need application-level rules.
- **Maturity / stability signals:** longstanding widely used library; official GitHub project and ecosystem integrations.
- **Recommended status:** **adopt now** if the chosen implementation stack includes JavaScript-side recurrence logic.
- **Primary sources:** https://github.com/jkbrzt/rrule

## python-dateutil rrule

- **What it does:** Python date/time utility package including recurrence rule support.
- **Why it might fit SKOSS:** strong option if recurrence logic is evaluated server-side in Python; broad maturity beyond recurrence alone.
- **Risks / tradeoffs:** Python-specific; accepts a superset of iCalendar behavior, so SKOSS would still need explicit product rules.
- **Maturity / stability signals:** long-lived package, thorough documentation, maintained under the Python ecosystem.
- **Recommended status:** **adopt now** if Python is later chosen.
- **Primary sources:** https://dateutil.readthedocs.io/ ; https://github.com/dateutil/dateutil

## php-rrule

- **What it does:** lightweight PHP recurrence-rule implementation.
- **Why it might fit SKOSS:** focused and comparatively small if a PHP stack is later selected.
- **Risks / tradeoffs:** narrower ecosystem footprint than dateutil; still requires application-level series and exception handling.
- **Maturity / stability signals:** clear RFC focus, maintained GitHub project, readable documentation.
- **Recommended status:** **consider later**.
- **Primary sources:** https://github.com/rlanvin/php-rrule

### Recurrence takeaway

SKOSS should **adopt a recurrence library rather than invent recurrence math internally**. The project should still keep exception handling, instance generation policy, and edit semantics in core domain code.

## 3. UI interaction

These are not full application stacks. They are interaction approaches that could keep the UI simpler and more maintainable.

## htmx

- **What it does:** allows AJAX, SSE, and similar interactions directly from HTML attributes.
- **Why it might fit SKOSS:** encourages server-driven UI, small JavaScript surface area, and simpler mobile-first pages.
- **Risks / tradeoffs:** not a full application architecture by itself; some teams find larger interactive flows harder to structure if they expect SPA patterns.
- **Maturity / stability signals:** strong documentation, active releases, small dependency-free distribution, large GitHub community.
- **Recommended status:** **consider later** as a serious low-complexity interaction layer if server-rendered HTML is chosen.
- **Primary sources:** https://htmx.org/docs/ ; https://github.com/bigskysoftware/htmx

## Stimulus

- **What it does:** lightweight JavaScript framework for modest behavior on top of server-rendered HTML.
- **Why it might fit SKOSS:** can add touch-friendly interaction without forcing a large client-state architecture.
- **Risks / tradeoffs:** still another framework layer; benefits depend on the eventual rendering approach.
- **Maturity / stability signals:** longstanding Hotwire component with clear documentation and broad usage.
- **Recommended status:** **consider later**.
- **Primary sources:** https://stimulus.hotwired.dev/

### UI interaction takeaway

SKOSS should prefer **lightweight progressive enhancement** over a heavyweight SPA-by-default posture unless later prototypes prove otherwise.

## 4. Offline / local data

## Dexie

- **What it does:** wrapper around IndexedDB for browser-side persistence.
- **Why it might fit SKOSS:** useful if later prototypes need limited local draft buffering or cached operational data in a PWA-like layer.
- **Risks / tradeoffs:** introduces local data migrations and reconciliation responsibilities; tempting gateway to premature offline complexity.
- **Maturity / stability signals:** mature documentation, broad browser support orientation, public known-user examples, active ecosystem.
- **Recommended status:** **consider later**.
- **Primary sources:** https://dexie.org/docs ; https://dexie.org/docs/Dexie.js.html

## PouchDB

- **What it does:** browser and Node database designed for local storage and sync with CouchDB-compatible servers.
- **Why it might fit SKOSS:** mature offline-sync-oriented tool with proven browser storage patterns.
- **Risks / tradeoffs:** strongly nudges architecture toward CouchDB-style replication and document semantics; maintenance cadence appears slower than some alternatives.
- **Maturity / stability signals:** long-lived project with extensive documentation and Apache governance, but slower release rhythm should be noted.
- **Recommended status:** **avoid for now**.
- **Primary sources:** https://pouchdb.com/ ; https://github.com/apache/pouchdb ; https://github.com/pouchdb/pouchdb/releases

## Apache CouchDB

- **What it does:** document database with built-in replication and multi-primary sync model.
- **Why it might fit SKOSS:** attractive if the project someday truly needs sync-heavy offline workflows.
- **Risks / tradeoffs:** data model and replication semantics would shape the whole system; heavier than current SKOSS needs; risks pulling the product into sync-first architecture prematurely.
- **Maturity / stability signals:** long-standing Apache project with official replication docs and active releases.
- **Recommended status:** **avoid for now**.
- **Primary sources:** https://docs.couchdb.org/ ; https://docs.couchdb.org/en/stable/replication/intro.html ; https://github.com/apache/couchdb

### Offline/local data takeaway

SKOSS should keep browser-local data **narrow and optional** unless real usage proves otherwise.

## 5. Realtime

## Native polling + server-sent events

- **What it does:** uses ordinary HTTP refresh/polling and one-way push for update notifications.
- **Why it might fit SKOSS:** probably enough for kitchen, handoff, and order-change freshness in v0 without complex connection management.
- **Risks / tradeoffs:** less suitable for high-frequency bidirectional collaboration; requires careful UI design around stale state.
- **Maturity / stability signals:** built on widely supported web standards and ordinary server infrastructure.
- **Recommended status:** **adopt now** as the default posture.
- **Primary sources:** htmx docs also document SSE support at https://htmx.org/docs/

## Socket.IO

- **What it does:** websocket-oriented realtime framework with fallbacks and ecosystem adapters.
- **Why it might fit SKOSS:** useful if the eventual implementation stack truly needs richer bidirectional live updates.
- **Risks / tradeoffs:** adds protocol and server complexity beyond likely v0 needs; can encourage overusing realtime for problems polling could solve.
- **Maturity / stability signals:** large longstanding project, active GitHub activity, extensive documentation.
- **Recommended status:** **consider later**.
- **Primary sources:** https://socket.io/ ; https://github.com/socketio/socket.io

### Realtime takeaway

SKOSS should begin with **polling plus selective push**, not with a full realtime framework assumption.

## 6. Backups / replication

## Built-in database backup tools

- **What it does:** uses the chosen primary database's native backup and restore mechanisms.
- **Why it might fit SKOSS:** simplest, most explainable, and least dependency-heavy baseline.
- **Risks / tradeoffs:** may not provide continuous off-machine protection by itself.
- **Maturity / stability signals:** first-party tooling of the underlying database.
- **Recommended status:** **adopt now** as the baseline expectation.

## Litestream

- **What it does:** continuous SQLite replication/disaster-recovery tool.
- **Why it might fit SKOSS:** strong complement if SKOSS later adopts SQLite and wants off-machine backup with low operational complexity.
- **Risks / tradeoffs:** adds another moving part; only relevant if SQLite is chosen; not a replacement for thoughtful restore procedures.
- **Maturity / stability signals:** clear documentation, active GitHub project, packaged binaries for major Linux and macOS targets.
- **Recommended status:** **consider later**.
- **Primary sources:** https://litestream.io/docs/ ; https://github.com/benbjohnson/litestream ; https://github.com/benbjohnson/litestream/releases

## LiteFS

- **What it does:** replicates SQLite across nodes using a FUSE-based filesystem layer.
- **Why it might fit SKOSS:** interesting for future hosted redundancy if SQLite remains central.
- **Risks / tradeoffs:** explicitly more complex, still beta according to the project, and beyond current SKOSS needs.
- **Maturity / stability signals:** active project, but beta-state warning is important.
- **Recommended status:** **avoid for now**.
- **Primary sources:** https://github.com/superfly/litefs

### Backup/replication takeaway

SKOSS should prioritize **boring restore-tested backups first**, replication second.

## 7. Table / grid editing

## Tabulator

- **What it does:** interactive JavaScript table and grid library.
- **Why it might fit SKOSS:** useful for admin/setup views, imports, review queues, and touch-friendly editable tables where plain HTML becomes unwieldy.
- **Risks / tradeoffs:** still a substantial UI dependency; could tempt the product toward desktop-admin-heavy interfaces if overused.
- **Maturity / stability signals:** mature docs, testing guidance, MIT license, active repository, large install base.
- **Recommended status:** **consider later**.
- **Primary sources:** https://tabulator.info/ ; https://tabulator.info/docs/6.3/virtual-dom ; https://github.com/olifolkerd/tabulator

### Table/grid takeaway

Useful mainly for non-core operator surfaces. SKOSS should not let grid tooling shape the main mobile operator experience.

## 8. Barcode / printing

Barcode is explicitly non-core for early SKOSS, but lightweight support may become useful later.

## JsBarcode

- **What it does:** browser and Node barcode generation library.
- **Why it might fit SKOSS:** lightweight option if optional internal labels or printable route sheets later need barcode support.
- **Risks / tradeoffs:** barcode-first workflows are out of scope for v0; adoption too early risks bending the product toward admin/warehouse behavior.
- **Maturity / stability signals:** long-lived MIT project with broad format support and no required browser dependencies.
- **Recommended status:** **consider later**.
- **Primary sources:** https://github.com/lindell/JsBarcode

## ZXing JS browser layer

- **What it does:** browser barcode/QR scanning support using camera input.
- **Why it might fit SKOSS:** could support optional scanning later without proprietary SDKs.
- **Risks / tradeoffs:** scanning is not an early requirement; browser camera flows can be device-sensitive and support-heavy.
- **Maturity / stability signals:** clear open-source lineage, permissive licensing, active broader ZXing ecosystem.
- **Recommended status:** **consider later**.
- **Primary sources:** https://github.com/zxing-js/browser ; https://github.com/zxing-js

### Barcode/printing takeaway

Keep barcode support optional and late. Do not let it become a hidden MVP assumption.

## 9. Authentication / admin helpers

## App-native authentication and sessions

- **What it does:** ordinary in-app user management, password handling, and role-based access.
- **Why it might fit SKOSS:** simplest fit for small operators and self-hosters; avoids external identity complexity.
- **Risks / tradeoffs:** must be implemented carefully with secure defaults.
- **Maturity / stability signals:** depends on the eventual framework, but the architectural stance is stable.
- **Recommended status:** **adopt now** as the default architecture stance.

## Authelia

- **What it does:** reverse-proxy companion for SSO and MFA across self-hosted applications.
- **Why it might fit SKOSS:** potentially useful for advanced self-hosting environments later.
- **Risks / tradeoffs:** heavier than likely necessary for v0, adds operational complexity, and solves a broader infrastructure problem than SKOSS immediately has.
- **Maturity / stability signals:** active project, substantial community, strong documentation.
- **Recommended status:** **avoid for now**.
- **Primary sources:** https://www.authelia.com/ ; https://github.com/authelia/authelia

### Auth takeaway

SKOSS should prefer **simple built-in auth for v0**, not external SSO infrastructure.

## 10. Import / export

## CSV as a first-class interchange format

- **What it does:** human-manageable import/export path for tabular data.
- **Why it might fit SKOSS:** strongly aligned with portability, small-operator trust, and low dependency burden.
- **Risks / tradeoffs:** needs explicit mapping and validation rules for draft vs structured records.
- **Maturity / stability signals:** universal format, easy to support across languages.
- **Recommended status:** **adopt now** as an architectural stance.

## Papa Parse

- **What it does:** browser-side CSV parsing and generation library.
- **Why it might fit SKOSS:** useful if imports are handled directly in a web UI, especially for large files or streamed parsing.
- **Risks / tradeoffs:** only relevant if browser-side import is actually needed; not necessary if imports remain server-side.
- **Maturity / stability signals:** longstanding documentation, worker support, performance focus.
- **Recommended status:** **consider later**.
- **Primary sources:** https://www.papaparse.com/ ; https://www.papaparse.com/docs

### Import/export takeaway

The important choice is not a library first. It is the commitment to **plain export formats and documented import rules**.

## Shortlist of strongest candidates

The strongest candidates worth serious continued evaluation are:

- **SQLite**
- **PostgreSQL**
- **an RFC-aware recurrence library** such as rrule.js or python-dateutil depending on language
- **polling plus selective SSE** as the default freshness strategy
- **CSV import/export** as a core portability mechanism
- **Litestream later**, but only if SQLite is selected and off-machine replication becomes important
- **htmx or similarly lightweight progressive enhancement**, if the UI direction stays server-centered

## Dependencies that should probably be avoided for now

The weakest fits for current SKOSS needs are:

- **CouchDB/PouchDB-style sync-first architecture**
- **LiteFS-level multi-node SQLite complexity**
- **external SSO infrastructure such as Authelia for baseline auth**
- **barcode/scanning dependencies as an MVP driver**
- **heavy realtime frameworks as a default assumption**

## Final stance

SKOSS should mostly:

- build its domain-specific behavior itself
- rely on mature database and recurrence foundations
- use boring web standards where possible
- add client-side libraries only when they clearly improve a real workflow

That is the best path toward a simple surface, durable implementation, and sustainable FOSS maintenance.
