# v0 state transitions

This document defines the most important workflow states and transitions for SKOSS v0.

The goal is not to model every nuance. The goal is to keep day-to-day execution clear.

## 1. Orders

### States

- `draft`
- `active`
- `changed`
- `cancelled`
- `completed`

### Main transitions

- `draft -> active`
  - when an order is saved as real operational demand
- `active -> changed`
  - when a meaningful late edit affects production or fulfillment
- `changed -> active`
  - when changes are reviewed and the order becomes the current expected version
- `active -> cancelled`
  - when demand is withdrawn
- `changed -> cancelled`
  - when a changed order is then withdrawn
- `active -> completed`
  - when fulfillment is done

### Notes

- `changed` exists to make operational edits visible instead of silently mutating reality
- v0 does not need separate approval sub-states

## 2. Order lines

### States

- `draft`
- `planned`
- `in_progress`
- `done`
- `cancelled`

### Main transitions

- `draft -> planned`
  - when the order becomes active demand
- `planned -> in_progress`
  - when work starts or linked WIP exists
- `in_progress -> done`
  - when required output is complete
- `planned -> cancelled`
  - when line is removed before work begins
- `in_progress -> cancelled`
  - only with a note explaining why work stopped or was superseded

### Notes

- line-level partiality should usually be expressed by quantity plus notes, not by many extra states

## 3. WIP

### States

- `planned`
- `in_progress`
- `ready`
- `consumed`
- `discarded`

### Main transitions

- `planned -> in_progress`
  - when prep or dough work starts
- `in_progress -> ready`
  - when the WIP is available for the next stage
- `ready -> consumed`
  - when the WIP is used in downstream production
- `ready -> discarded`
  - when spoilage, failure, or unusable output is recorded
- `in_progress -> discarded`
  - if work is abandoned before ready state

### Notes

- v0 should allow quantity edits and notes without forcing every quantity change into a separate state transition

## 4. Recurring instances

### States

- `pending`
- `generated`
- `adjusted`
- `skipped`

### Main transitions

- `pending -> generated`
  - when the system creates the dated occurrence
- `generated -> adjusted`
  - when one occurrence is edited without changing the template
- `generated -> skipped`
  - when that occurrence should not create demand
- `adjusted -> generated`
  - only if the override is removed and the occurrence returns to template shape

### Notes

- template edits are not represented as instance transitions
- v0 should keep template scope and one-off scope visually distinct

## 5. Shift handoff

### States

- `open`
- `ready_for_handoff`
- `acknowledged`
- `closed`

### Main transitions

- `open -> ready_for_handoff`
  - when the outgoing shift has written summary and open items
- `ready_for_handoff -> acknowledged`
  - when the incoming shift reviews and accepts the handoff
- `acknowledged -> closed`
  - when the handoff no longer needs active follow-up as a handoff object

### Notes

- a shift log may still contain unresolved work after `acknowledged`; that work remains visible through WIP/open items
- v0 does not need a rejection or dispute workflow beyond additional notes
