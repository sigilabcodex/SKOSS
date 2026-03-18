# Workspaces

SKOSS should present work through role-based workspaces rather than one universal interface.

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
- destinations, pickup times, and customer notes
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
- configuration screens
- unnecessary back-office metadata
- abstract reports detached from current work

The kitchen workspace should help an operator answer: **What do I need to do now, what is already in progress, and what changed?**

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
- destinations
- recurrence templates for orders and internal tasks
- user and role setup
- business rules needed to keep daily work flowing

### What they should not be burdened with

- implementation-level system complexity that does not serve the product
- enterprise configuration ceremony
- settings that should be optional but are made mandatory

Admin matters, but it should remain in service of operations. The project should resist the common trap of letting admin screens dominate the product's design.

## Workspace design rule

A workspace is successful when the main user can complete common tasks quickly without seeing the full complexity of the system.

The same underlying data may support multiple workspaces, but the presentation, vocabulary, and default actions should be role-shaped.
