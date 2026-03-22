# Role and workspace foundation

SKOSS is now reaching the point where one universal surface creates more noise than help.

Orders, recurring demand, production review, WIP handoff, suppliers, recipes, and costing snapshots can all live in the same system, but they should not all compete equally for every person’s attention.

This document explains why the project is adding a lightweight user, role, session, and workspace foundation now.

## Why now

The system has enough operational surfaces that role-aware attention shaping is useful even before full multi-user depth exists.

Recent work added:

- suppliers and supplier price memory
- raw materials
- lightweight recipes / formulas
- costing snapshot visibility
- recurring demand and generated orders
- WIP and handoff surfaces

That makes SKOSS more useful, but also increases the amount of visible structure.

Without some role-aware shaping, a production worker, a frontdesk operator, and an owner-admin all end up starting from roughly the same navigation weight.

That is the wrong direction for an operator-first product.

## Core principle: attention before restriction

In SKOSS, a role is not only about permission.

A role should shape attention.

That means:

- **frontdesk** should see order capture and fulfillment context first
- **production** should land near production and handoff surfaces first
- **delivery** should start near handoff and dispatch-adjacent work first
- **manager** should see broader coordination surfaces first
- **admin** should reach settings and structural cleanup first

This is different from enterprise RBAC.

The early goal is **practical relevance**, not a giant matrix of per-button security rules.

## What this foundation adds

This PR introduces a lightweight foundation for:

1. **users**
   - display name
   - login identifier
   - role / function
   - active flag
   - timestamps
2. **small-business roles**
   - `admin`
   - `manager`
   - `production`
   - `frontdesk`
   - `delivery`
3. **default workspace shaping**
   - each user can have a default workspace
   - navigation shows the surfaces most relevant to that role first
4. **minimal session scaffold**
   - a practical shared-device login chooser
   - lightweight current-user session selection
5. **modest audit groundwork**
   - records can now carry `createdByUserId` and `updatedByUserId`
   - shift notes can carry `authorUserId`
6. **user management inside settings**
   - create users
   - set role
   - activate/deactivate
   - choose default workspace
7. **preferences vs settings split**
   - **Preferences** = personal/session-facing behavior
   - **Settings** = business/system configuration

## Permissions vs workspace attention

The distinction matters.

### Workspace attention

Workspace attention is about:

- what appears first
- which navigation items stay visible
- which workspace feels like “home” for this person
- reducing cognitive load for common daily work

### Permissions

Permissions are about:

- what should be blocked or allowed
- who may change sensitive or structural data
- future accountability and policy

SKOSS is intentionally starting with **attention shaping first**.

This keeps the product useful on real shared devices and small teams without pretending that a full enterprise security policy engine is already needed.

## Preferences vs settings

The project now starts separating two kinds of configuration.

### Preferences

Personal or session-facing behavior, such as:

- language
- theme
- default workspace / home surface

These should follow the signed-in person when possible.

### Settings

Shared business or system structure, such as:

- suppliers
- raw materials
- recipes
- costing snapshot cleanup
- users
- shared workspace setup

This keeps small teams from digging through admin structure just to change a personal default.

## What this PR does not do

This foundation is intentionally modest.

It does **not** introduce:

- enterprise RBAC
- SSO
- external identity providers
- advanced password policy engines
- fine-grained permission matrices
- a full audit log system
- a split into separate SKOSS and SKOSSina apps

## Non-goals

Explicit non-goals for this stage:

- no enterprise-grade RBAC or security theater
- no SSO or external auth stack
- no advanced security policy engine
- no full audit/event log yet
- no separate SKOSSina app split yet

## Why this fits the product philosophy

This direction supports the project’s core principles:

- **operator-first** because each role starts from relevant work
- **progressive complexity** because deeper structure exists without dominating workers
- **draft-first / refine later** because identity-aware behavior does not require heavy admin setup
- **domain-neutral core** because the role set stays practical and small-business oriented rather than bakery-only
- **avoid ERP bloat** because this is shaping and accountability groundwork, not corporate IAM architecture

The intent is to make SKOSS feel more like a practical shared operational system and less like one giant undifferentiated admin screen.
