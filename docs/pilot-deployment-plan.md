# Pilot deployment plan (internal bakery rollout)

## Purpose of this pilot

This pilot is a **controlled internal rollout** for one bakery team, not a public launch.

The purpose is to validate whether SKOSS can reduce daily operational confusion in real work by improving:

- order capture consistency (especially from WhatsApp intake)
- production-day visibility
- WIP and shift handoff clarity
- role-shaped attention for sales, manager, and night production

## Pilot scope

### In scope (1–2 week pilot)

- one bakery workspace on a VPS/internal subdomain
- one small team using SKOSS in real shifts:
  - manager + morning baker
  - sales/frontdesk/customer contact
  - night production worker
- order intake and update in SKOSS
- production-day review from grouped demand + WIP
- shift handoff notes and open-item tracking
- local demo/testing mode for safe rehearsal

### Out of scope (for this pilot)

- full ERP-style inventory/accounting workflows
- deep recipe/capacity optimization engines
- marketplace/platform integrations beyond lightweight notes
- advanced multi-location behavior
- broad public onboarding and self-serve signup

## Pilot workflows in scope

1. **Sales/frontdesk captures orders** from WhatsApp/phone/walk-in into SKOSS.
2. **Manager reviews demand + production-day needs** and monitors changed/high-risk items.
3. **Night production updates WIP** and leaves handoff notes.
4. **Morning shift reviews handoff** and closes/continues open items.

## Recommended pilot roles and boundaries

### Admin/Manager

Should see:

- setup + users + operational settings
- timeline/orders/customers/production/handoff

Should not do by default:

- heavy data-governance cleanup during active shifts

### Sales/Frontdesk

Should see:

- orders, customers, timeline

Should not be required to use:

- setup/config screens
- production internals and admin-heavy structures

### Production/Night shift

Should see:

- production board, handoff, timeline

Should not be required to use:

- customer maintenance and setup administration

## Minimal success criteria after 1–2 weeks

Pilot is considered successful if all are true:

- team can complete daily order capture and updates in SKOSS
- manager can review next production day without Excel-only fallback
- night shift can consistently leave actionable handoff notes
- role boundaries reduce visible noise for frontdesk and production users
- at least one full week runs without data-loss incidents

## Fallback process if SKOSS fails during pilot

If SKOSS is unavailable or unstable:

1. Continue intake in WhatsApp + existing manual notebook/Excel immediately.
2. Keep production continuity first (do not block kitchen execution).
3. Record missing SKOSS actions in a temporary handoff note sheet.
4. Once SKOSS recovers, backfill only the critical records (active orders, WIP, handoff).
5. Log failure details (time, impact, workaround) for the next stabilization PR.

## Deployment recommendation

Deploy first to an internal subdomain (example: `pilot.skoss.<company-domain>`), with restricted team access.

Why:

- avoids public exposure while flows are still being stabilized
- keeps pilot traffic and data clearly separated from future public rollout plans
- allows faster operational fixes during first real usage cycles

## Proposed rollout sequence

1. Local desktop validation with seeded demo users/data.
2. Internal VPS deployment (pilot subdomain).
3. 2–3 days shadow use (team still keeps legacy fallback ready).
4. 1–2 weeks active pilot with daily review notes.
5. Decide go/no-go for wider rollout based on concrete pilot metrics.
