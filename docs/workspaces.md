# Workspaces

SKOSS should present work through role-based workspaces rather than one universal interface.

## First-contact layer before workspaces

Before users enter role workspaces, SKOSS now introduces an **instance entry gateway** so first-run intent is explicit:

- start new kitchen (admin setup)
- explore demo environment
- restore from backup
- open existing instance
- learn/help links

This layer is intentionally outside normal workspace navigation and should stay lightweight.

The purpose of a workspace is to reduce noise and show each role the information needed to act quickly.

## 1. Sales / Order Intake

### Primary user

- front-of-house staff
- order takers
- owners handling customer messages
- operators entering phone, chat, or in-person requests

### What they need to see

- today's and upcoming orders
- simple order creation and editing
- recurring order management at a practical level
- lightweight saved customer context visible during capture when repeat contact, address, or delivery notes matter
- destinations, pickup times, and customer notes
- lightweight customer memory when repeat contact or delivery context matters
- line items in clear product language
- obvious flags for special requests or changes
- visibility into whether an order is new, adjusted, confirmed, or already affecting production

### What they should not be burdened with

- recipe internals
- batch planning details
- dough-stage complexity unless needed for a special case
- inventory/accounting workflows
- overly technical identifiers

The sales workspace should prioritize speed, clarity, and low-friction order capture.

## 2. Kitchen / Production

### Primary user

- bakers
- prep operators
- production staff
- packers working from production requirements

### What they need to see

- what must be made for the active production day
- grouped demand by date, destination, and product/variant
- production requirements derived from orders and internal tasks
- work organized by meaningful operational units such as base dough, prep family, batch, or stage
- current WIP and what remains unfinished
- notes, exceptions, shortages, and substitutions
- the ability to mark complete, partial, adjusted, or blocked work quickly

### What they should not be burdened with

- full customer management details unless relevant
- sales-style CRM workflow noise
- configuration screens
- unnecessary back-office metadata
- abstract reports detached from current work

The kitchen workspace should help an operator answer: **What do I need to do now, what is already in progress, and what changed?**

## Operational timeline / day attention

### Primary user

- shift leads
- frontdesk operators checking upcoming pickups
- production leads checking what lands next
- delivery-adjacent staff checking promised windows and assignment gaps

### What they need to see

- what is overdue
- what is due now or next
- what is coming soon later in the day
- promised pickup or delivery timing when it exists
- enough customer, destination, fulfillment, and note context to act without opening every order
- role-shaped emphasis so production, frontdesk, and delivery do not all scan the same details first

### What it should not become

- a generic month-view calendar
- a staff scheduler
- a route-planning board
- a project-management or kanban system
- a second admin-heavy planning module

This surface should stay practical and lightweight.

Its job is not to create abstract events. Its job is to organize **real operational work across time** using the orders, fulfillment promises, and handoff-sensitive context the system already knows.

## 3. Shift Handoff / Morning Review

### Primary user

- shift leads
- morning bakers
- supervisors
- owners reviewing overnight or prior-shift progress

### What they need to see

- a concise summary of current WIP
- what was completed in the previous shift
- what remains partial or blocked
- key notes and deviations
- priority items for the incoming shift
- destination-sensitive urgency, such as early route needs or opening-counter needs
- a clear operational snapshot rather than a raw activity dump

### What they should not be burdened with

- full historical logs when a summary view is enough
- deep admin setup
- unnecessary customer-entry tasks
- low-value reporting before immediate issues are understood

This workspace should feel like an operational briefing, not a report generator.

## 4. Admin / Configuration

### Primary user

- owner-operators
- supervisors doing setup
- admins maintaining structure and recurring rules

### What they need to see

- products and variants
- base dough families
- recipes and process profiles
- a compact costing snapshot for recipe-linked products
- destinations
- recurrence templates for orders and internal tasks
- user and role setup
- business rules needed to keep daily work flowing

### What they should not be burdened with

- implementation-level system complexity that does not serve the product
- enterprise configuration ceremony
- settings that should be optional but are made mandatory

Admin matters, but it should remain in service of operations. The project should resist the common trap of letting admin screens dominate the product's design.

The costing snapshot belongs here as an operational setup surface, not as a separate finance workspace. It should help an owner or lead see:

- what is fully costed
- what is only partially costed
- what is missing supplier evidence
- what still has no recipe

That visibility should support cleanup and trust in the estimate without turning setup into accounting software.

## Workspace design rule

A workspace is successful when the main user can complete common tasks quickly without seeing the full complexity of the system.

The same underlying data may support multiple workspaces, but the presentation, vocabulary, and default actions should be role-shaped.

## Current preset-aware behavior

The onboarding assistant can now choose a starting preset such as bakery, café, small restaurant, dark kitchen, food stall, generic, or other.

At the moment this preset layer stays intentionally light:

- it can shift terminology through the i18n layer
- it can reorder which workspaces are emphasized first on the home surface
- it can show starter suggestions and example setup hints that match the chosen operating style

It does **not** yet hide major parts of the product, fork business logic, or force a team into one workspace model permanently.

## Role-shaped attention foundation

The project now starts applying workspace shaping through a lightweight user and role foundation.

This is intentionally modest:

- navigation can be filtered so each user sees the surfaces most relevant to their role first
- each user can have a default workspace or home surface
- shared-device login can choose who is active without enterprise auth weight
- personal **Preferences** are now starting to separate from shared **Settings**
- personal/session controls should stay available through a compact user menu instead of competing with operational navigation

This is not meant to lock the product into rigid permissions.

At this stage, the main goal is to reduce noise and keep attention aligned with the work a person is most likely to do next.

## Attention is not the same as permission

A person may still need to cross into another workspace sometimes.

The early role model exists mainly to answer questions like:

- what should this person land on first?
- what should stay visible in primary navigation?
- which surfaces should feel closest for this shift or role?

That is different from a full permission engine.

SKOSS should resist pretending it needs enterprise RBAC before it has proven the smaller operator-first workflow layer.

## Mobile vs desktop interaction model

The workspace model is now intentionally dual-form:

- **Mobile:** focused and linear; top-shell navigation remains primary and each screen emphasizes one main task flow.
- **Desktop:** spatial and multi-panel; left-sidebar navigation and side-by-side list/detail structures are used where higher context improves admin work.

This is not a separate product mode and should not fork feature behavior.

Role-shaped visibility still applies in both layouts:

- non-admin roles should continue to see only relevant workspaces first

## Desktop/admin refinement notes (current increment)

Recent layout refinement keeps mobile behavior intact while making desktop admin work more spatial:

- desktop shell navigation now supports direct setup subsection entry points (users, suppliers, raw materials, recipes, and settings-related sections) so admin movement is less linear
- setup now exposes a compact subsection navigator intended for faster orientation on wider screens
- admin-heavy areas keep list/editor patterns, but desktop now gives more stable list + form + context placement (especially customer and setup flows)
- wider desktop widths use denser horizontal structure so operators see more operational context without opening additional pages

This is intentionally additive and not a desktop-only fork. Mobile remains focused and single-flow first.
- setup-heavy navigation remains conditional on role/workspace visibility
- desktop enhancements are additive and should not force admin complexity into operator flows

## Current structure refresh (settings + production)

As the first operational surfaces matured, two areas started to feel flat:

- **Settings** had too many unrelated cards at one depth, so scanning and orientation slowed down.
- **Production** had strong data but weak internal grouping, making it feel like one long board instead of a workflow.

The current UI pass keeps the same capabilities but tightens information architecture:

1. **Settings now uses grouped local navigation**
   - business setup
   - team and users
   - catalog and costing data
   - preferences/system boundaries
2. **Production now adds board-level section navigation**
   - demand
   - fulfillment queues
   - WIP / handoff context
   - line updates
3. **User control in settings is denser and clearer**
   - active/inactive and role-coverage summary is visible up front
   - role + default workspace + visible workspaces remain visible per user

This keeps growth structured without turning SKOSS into a heavy admin tree.

## Settings simplification pass (action-first)

To reduce cognitive load in day-to-day setup work, Settings now follows a stricter **act-first** structure:

- one primary local navigation surface (section pills)
- one main page header (`Settings`)
- direct list + create/edit surfaces inside each section
- guidance moved away from large concept cards into lightweight helper text and empty states

What was intentionally removed from the Settings UI layer:

- duplicated orientation layers where the same concepts appeared as both group cards and section navigation
- large conceptual blocks (preset workspace narratives, starter suggestion panels, checklist-heavy messaging)
- repeated “admin readiness/setup” framing that slowed simple edits

Current Settings sections are treated as working surfaces:

- Business
- Users
- Preferences
- Suppliers
- Raw materials
- Recipes
- Costing
- Price history

The goal is to keep setup practical on mobile and desktop: open section, scan list, create/edit, move on.

## Capacity guidance in sales and setup workspaces (proposed)

### Sales workspace: promise guidance during intake

Order capture should surface quick feasibility guidance without forcing a context switch.

Suggested additions in order create/edit flows:

- warning/status chip (`fulfillable_from_stock`, `requires_production`, `near_capacity`, etc.)
- suggested promise date/time when requested slot is overloaded
- short reason line for the warning
- explicit override path with note (non-blocking by default)

This keeps intake operator-first while reducing unrealistic commitments.

### Setup workspace: capacity section (compact)

Setup should expose capacity in a small section-based IA, not a deep admin tree.

Suggested setup sections:

1. capacity overview
2. shift effort
3. resources (ovens, mixers, prep tables, fermentation/cold space, packing)
4. product/family capacity hints
5. warning threshold settings

### Production workspace tie-in

Production views should show bottleneck pressure and spillover signals so shift leads can adjust before handoff issues accumulate.

### UX constraints

- mobile-first card/section patterns
- progressive detail (basic setup first, deeper setup optional)
- no hard requirement for complete configuration before order capture

## Bootstrap-to-workspace transition clarification

First-run bootstrap is not a workspace.

Transition behavior:

- users begin in the entry gateway
- first-use bootstrap runs in a dedicated onboarding shell
- after step 8 (launch), bootstrap ends and users return to normal sign-in + role-shaped workspace entry
- ongoing maintenance remains in regular Setup workspace sections, not in bootstrap screens

This separation keeps installation/setup intent distinct from daily operator workflows.

