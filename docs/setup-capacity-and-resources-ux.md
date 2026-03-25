# Setup Capacity and Resources UX (Proposal)

## Status

Draft UX direction aligned with existing workspace and UI-system docs.

## UX objective

Expose capacity configuration with low friction, so teams get useful promise guidance without building a heavy admin tree.

## Design principles (aligned to SKOSS)

- operator-first, not admin-first
- setup should improve daily work, not block it
- mobile-first flows with compact sections
- practical labels and visible status
- progressive detail: basic first, advanced optional

## Proposed information architecture

Within **Setup workspace**, add a compact section group:

1. **Capacity overview**
   - confidence level
   - configured bottlenecks
   - quick warnings about missing key setup
2. **Shift effort**
   - role-level capacity per shift/day
3. **Resources**
   - ovens, mixers, prep tables, fermentation/cold space, packing stations
4. **Product capacity hints**
   - product/family day limits, batch/yield hints
5. **Promise guidance settings** (lightweight)
   - warning thresholds
   - default safety buffer

Keep each area editable in short forms/cards rather than deep nested pages.

## Sales workspace integration

Order intake should show feasibility guidance inline, not in a hidden admin panel.

On order create/edit:

- show a compact status chip (`enough stock`, `requires production`, `near capacity`, etc.)
- show suggested promise date/time when risk exists
- show short reason line tied to bottleneck or missing setup
- allow override with note when warning is high

This keeps intake fast while reducing unrealistic commitments.

## Production workspace integration

Production board/day view can surface:

- top bottlenecks for the day
- overloaded windows
- expected spillover to next shift/day

This helps leads resolve pressure before intake issues become failures.

## Mobile vs desktop behavior

## Mobile-first behavior

- section list with progressive disclosure
- one resource card per screen chunk
- sticky save bar / clear feedback
- compact chips for warning states
- avoid wide comparison tables as default

## Desktop enhancement

- side-by-side comparison where useful (shift effort vs resource load)
- faster scanning of multi-resource status
- still preserve same section structure and vocabulary

No separate desktop-only admin paradigm.

## Progressive setup path

Recommended onboarding path:

1. enter day/shift capacity envelopes (5 minutes)
2. add 1-3 real bottlenecks (for many bakeries: mixer + oven + pack)
3. optionally map product families to basic capacity hints
4. refine over time based on observed warnings

Users should gain value after step 1.

## Copy guidance

Prefer practical wording:

- "Shift effort" not "labor planning matrix"
- "Bake bottleneck" not "critical work center"
- "Suggested promise" not "finite-capacity commit date"

## Error and warning behavior

- missing setup should show as advisories, not hard errors
- promises can still be entered with manual confirmation
- warnings should be persistent enough to support handoff accountability

## Anti-patterns to avoid

- deep setup hierarchies with many required dependencies
- mandatory resource coding systems before first order
- blocking order flow due to incomplete non-critical setup
- optimizer jargon in frontline screens
