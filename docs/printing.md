# Printing

## Purpose

Printing should be treated as an operational requirement for SKOSS, not as a cosmetic reporting extra.

Many bakery and kitchen workflows still rely on paper at specific moments because paper is fast, shareable, and resilient in noisy or messy environments. A realistic system should support that operating reality.

## SKOSS and SKOSSina responsibilities

Printing language should follow the core/client distinction:

- **SKOSS** should own print-relevant data, print intent, and the generation of print-friendly outputs
- **SKOSSina** should let workers trigger, review, and use those outputs from practical devices such as phones, tablets, shared desktops, or station browsers

This keeps printing inside the operational workflow rather than treating it as a separate reporting silo.

## Why printing matters operationally

Printing remains important for workflows such as:

- kitchen tickets that travel with prep or production work
- packing or dispatch slips that summarize what must be handed off
- front-of-house ticket or receipt output where speed matters
- labels for trays, dough containers, boxes, or packaged items
- future recipe or formula reference prints that list practical ingredient lines
- fallback paper references during shift overlap, congestion, or device contention

For many kitchens, paper is still part of the handoff chain. Ignoring it would make the product less credible in real operations.

## Core printing scenarios

### Paper tickets

Important ticket scenarios include:

- production tickets
- kitchen prep tickets
- packing or pickup tickets
- dispatch or route-ready summaries

These should favor clarity, fast scanning, and minimal wasted space.

### Kitchen tickets

Kitchen-facing prints should emphasize:

- what needs to be made
- quantities and variants
- recipe or formula notes only when they support execution without clutter
- timing or due context where useful
- destination or order grouping when it prevents confusion
- notes or exceptions that affect execution

### Receipt and ticket-printer scenarios

Some environments may need lightweight printer output near a counter or service station.

The project should leave room for:

- narrow paper formats
- quick reprint flows
- simple front-of-house handoff prints
- practical browser or future app-based triggering

### Label printing

Label workflows may later matter for:

- trays
- dough bins or fermentation containers
- boxes and packaged items
- destination or customer labeling
- dated production or batch references where useful

Label support should be framed as a practical operations tool, not as a branding exercise.

### Order summaries and handoff sheets

Some workflows need a compact overview rather than a narrow ticket.

Examples:

- end-of-shift handoff sheets
- route or destination summaries
- packing check sheets
- day-part or batch preparation summaries

## Print-friendly layout expectations

Print-oriented outputs should aim for:

- readable layouts on common paper sizes and narrow ticket formats
- high information density without clutter
- strong note visibility
- legible quantities and variant names
- layouts that tolerate ordinary browser printing early on
- progressive enhancement later for specific hardware types

A print-friendly output is valuable even before deep printer integration exists.

## Hardware direction

The project should not overpromise hardware support too early, but it should acknowledge practical future needs.

Important future compatibility goals include:

- common thermal-printer scenarios
- receipt or ticket-printer workflows
- label-printer scenarios
- simple per-station printer targeting where deployment allows it
- vendor-agnostic design where possible

The direction should stay open long enough to learn which printers real pilot kitchens actually use.

## Deployment implications

Printing intersects strongly with deployment choices.

### Hosted server mode

When SKOSS is hosted on a VPS or remote server:

- SKOSSina browser printing may be the simplest early path
- some printer access may happen through the client device or local network
- deployments may need lightweight local print procedures rather than deep central printer management

### Local/LAN mode

When SKOSS runs on-site:

- local printers may be easier to reach
- shared kitchen or counter stations can act as practical print points
- LAN deployment may support ticket and label workflows more naturally

This is one reason LAN-friendly deployment remains strategically important.

## Near-term guidance

Near-term printing work should prioritize:

- print-friendly browser outputs
- kitchen tickets
- order summaries for handoff or packing
- early receipt/ticket-printer awareness
- labels only where the workflow is well defined enough to justify them

## What should wait

The project should avoid jumping too early into:

- printer-fleet administration
- deep vendor-specific SDK commitments
- complex background print daemons unless usage proves they are necessary
- highly customized label languages before the basic layouts are validated

## Principle

Printing is part of kitchen execution.

SKOSS should treat it as a first-class operational need, and SKOSSina should make it easy for workers to use when paper remains the fastest or safest handoff tool.
