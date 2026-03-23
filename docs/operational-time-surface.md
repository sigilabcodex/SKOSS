# Operational time surface

## Purpose

SKOSS now includes a lightweight operational time surface.

Its purpose is simple:

**help a team see what needs attention across the day without turning SKOSS into calendar software.**

This surface exists because timing matters operationally even before a business wants a full planning stack.

Small kitchen teams still need quick answers to questions such as:

- what is overdue
- what is due now
- what is coming soon
- what is later today
- which pickup or delivery promises need attention next
- where handoff-sensitive work is starting to bunch up

## What this surface is

In SKOSS, the timeline is:

- a **day-oriented operational surface**
- built from existing order and fulfillment data
- focused on **real work**, not abstract event management
- role-shaped so different users can scan the parts that matter most to them
- lightweight enough to stay usable on phones and tablets

The timeline primarily reuses current operational objects such as:

- orders
- promised pickup time
- delivery timing
- fulfillment mode
- dispatch notes
- customer memory context
- due and overdue state

## What this surface is not

Explicit non-goals for this stage:

- no staff scheduling
- no route planning or route optimization
- no generic recurring-event engine
- no project-management or kanban suite
- no generic calendar product ambitions
- no attempt to turn SKOSS into a broad planning platform

The timeline should stay close to the workflow SKOSS already models:

**orders -> production -> WIP / handoff -> fulfillment**

## Why it fits the product philosophy

This direction fits the current SKOSS / SKOSSina philosophy because it is:

- **operator-first**: it answers what needs attention next
- **progressive complexity**: it adds timing visibility without a planning subsystem
- **draft-first / refine later**: it can still show useful order timing even when setup is partial
- **domain-neutral core**: it organizes generic operational timing rather than bakery-only event types
- **anti-ERP-bloat**: it avoids turning timing into a giant admin module

## Current implementation boundary

The current implementation intentionally keeps the boundary narrow.

It adds:

- a compact timeline workspace in the current app navigation
- summary counts for overdue, due now, coming soon, and later today
- compact time-based cards for focus-day orders
- role-sensitive attention panels for production, frontdesk, delivery, or broader coordination
- future-day grouping that stays lightweight instead of becoming a planning calendar
- i18n coverage in English, Spanish, and Portuguese

It does not add:

- separate event records
- shift staffing tools
- route sequencing tools
- drag-and-drop planning boards
- broad recurrence editing beyond what orders already support

## Relationship to the existing focus-day model

The current repo already uses a shared **focus date** to anchor operational views.

The timeline follows that same model.

If there is no live work on the literal current date, the timeline can anchor itself to the next active operational day instead of showing an empty generic "today" shell.

That keeps the surface aligned with how the rest of the current demo data and workflow model already work.

## Design rule

When the timeline grows later, the rule should stay the same:

**time organizes real operational work; it does not become a separate product inside SKOSS.**
