# v0 seed scenario: Kalali Saturday production loop

This scenario defines one realistic end-to-end target for early SKOSS development.

If v0 can support this flow clearly, the foundation is doing its job.

## Context

Kalali is preparing for a busy Saturday.

The bakery has:

- a recurring Saturday order for a cafe partner
- normal counter production
- one new WhatsApp order entered late
- one draft customer
- one overnight dough/WIP handoff
- one morning review before baking and packing finish

Production date: **Saturday, 2026-03-28**

## Actors

- **Lucía** — owner/admin, maintains recurring templates
- **Mateo** — sales/order intake, enters a late WhatsApp order
- **Noche** — night shift baker, records dough and handoff notes
- **Amanecer** — morning baker/shift lead, reviews handoff and finishes output

## Structured setup already available

- destination: `Cafe Luna`
- destination: `Front Counter`
- product: `Country Loaf`
- variant: `Country Loaf / 800g`
- product: `Croissant`
- variant: `Croissant / Butter`
- product: `Roll`
- variant: `Roll / Sesame`

## Draft-friendly gaps that still exist

- one customer is not yet fully created in the system
- one requested item is still better captured as a draft product label
- some handoff information remains best as freeform notes

## Scenario flow

### 1. Recurring Saturday production exists

Lucía has already created a recurring template for `Cafe Luna`:

- every Saturday
- 12 `Country Loaf / 800g`
- 30 `Croissant / Butter`
- destination `Cafe Luna`
- due Saturday morning

During planning, SKOSS generates the dated instance for **2026-03-28** and materializes it as an order for that production date.

### 2. Counter demand is represented

A second recurring template creates internal counter demand for Saturday:

- 20 `Roll / Sesame`
- 10 `Croissant / Butter`
- destination `Front Counter`

This ensures internal production demand appears next to customer orders.

### 3. A new WhatsApp order arrives late on Friday

Mateo receives a WhatsApp message from a customer not yet formally set up.

He creates an ad hoc order with:

- source `whatsapp`
- draft customer name `Sofía birthday`
- due Saturday
- one structured line: 6 `Roll / Sesame`
- one draft product line: `mini sweet tray` quantity 2
- order note: `confirm decoration at pickup`

The order is saved without requiring a full customer record or catalog cleanup.

### 4. Late edit happens before night shift ends

The customer writes back asking for:

- 8 `Roll / Sesame` instead of 6

Mateo edits the order.

SKOSS marks the order as `changed` so the kitchen workspace can show that today’s demand moved after the initial plan.

### 5. Night shift records WIP

Noche opens the production workspace for **2026-03-28**.

SKOSS shows grouped demand from:

- `Cafe Luna` recurring order
- `Front Counter` recurring internal demand
- `Sofía birthday` ad hoc order

Noche records WIP entries such as:

- `Country dough` — in progress
- `Croissant dough` — ready
- `Sesame rolls first tray` — ready

Noche also sees the unresolved draft line `mini sweet tray` as a visible planning item rather than hidden text.

### 6. Night shift leaves handoff

Before ending the shift, Noche creates a shift log:

- summary: country dough bulk fermentation complete, croissant dough ready for shaping
- open items: finish 2 trays sweet items, final sesame roll count includes late edit
- handoff note: use croissant dough first; fridge shelf 2 is tagged
- status becomes `ready_for_handoff`

### 7. Morning shift reviews and finishes

Amanecer opens the handoff workspace.

They can see:

- latest shift summary
- open items
- WIP already ready
- that one order changed late
- that one line is still a draft product label

Amanecer acknowledges handoff, completes output, and marks remaining line work done.

### 8. Operational result

By mid-morning, SKOSS has supported:

- recurring demand generation
- ad hoc order capture
- draft customer support
- draft product support
- visible late-change handling
- WIP recording
- cross-shift handoff
- morning review

## Why this scenario matters

This scenario is a strong v0 target because it forces the system to prove the most important early claims:

- recurring work is first-class
- order entry is not blocked by setup
- production sees both structured and draft demand
- WIP is visible as real operational state
- shift handoff is not buried in a generic notes area
- the system remains practical for a bakery rhythm rather than generic CRUD
