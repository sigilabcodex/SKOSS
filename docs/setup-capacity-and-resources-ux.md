# Setup Capacity and Resources UX (Proposal)

## Status

Draft UX proposal aligned with `ui-system.md` and `workspaces.md`.

## UX objective

Make capacity setup usable in minutes, not hours, while giving immediate value to order intake promise guidance.

## Constraints to preserve

- mobile-first and touch-friendly
- section-based structure (not deep trees)
- low typing burden
- incomplete setup must not block order capture
- operator language over ERP jargon

## Proposed setup IA (section-based)

Inside **Setup workspace**, add a compact "Capacity & Promise" section with five sub-sections:

1. **Overview**
   - current confidence level
   - configured bottlenecks count
   - missing critical hints
2. **Shift effort**
   - role-based per-shift/day envelopes
3. **Resources**
   - ovens, mixers, prep tables, fermentation/cold, packaging, dispatch
4. **Product capacity hints**
   - per product/family day/shift hints
   - optional batch/yield/load hints
5. **Warning thresholds**
   - near-capacity threshold
   - high-strain threshold
   - default safety buffer

## Mobile-first interaction design

- one section visible at a time
- card-form rows with large touch targets
- simple add/edit flows
- sticky save bar for long forms
- compact status chips for warnings/confidence

## Desktop behavior (same structure)

- optional side-by-side panels for comparison
- no separate desktop-only information architecture
- preserve same labels and flow as mobile

## Sales workspace integration

Order intake should include inline feasibility UI:

- requested slot field
- status chip (`fulfillable_from_stock`, `requires_production`, etc.)
- one-line reason label
- suggested safer slot when needed
- explicit override with note

No context switch to setup is required.

## Production workspace integration

Production/day view should show:

- top bottleneck resources
- overloaded windows
- potential spillover to next shift/day

This supports earlier operational decisions and cleaner handoff.

## Setup-light defaults

Default onboarding sequence:

1. set one global day/shift envelope
2. add at least one real bottleneck (often oven)
3. add product-family hints for top 5 products
4. refine only when warning quality is poor

Teams should get value at step 1.

## Anti-patterns to avoid

- deep navigation hierarchies for setup
- mandatory full resource catalog before first estimate
- table-heavy desktop-only admin screens
- blocking order entry because optional hints are missing
