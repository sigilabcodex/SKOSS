# UI System Guidance

This document captures the lightweight UI rules introduced in the current polish pass.

The goal is not a full design system with heavy tooling. It is a practical visual language that keeps SKOSS readable, touch-friendly, and coherent as the product grows.

## 1. Visual principles

SKOSS UI should feel:

- operator-first
- calm under pressure
- clear on phones and tablets
- practical before decorative
- modern, but not fragile
- consistent across workspaces

Core intent:

1. **Important information should scan fast.**
   Dates, status, quantities, destinations, and notes should stand out without needing dense reading.
2. **Actions should feel obviously interactive.**
   Buttons, navigation items, toggles, and editable rows should have visible active, hover, pressed, focus, disabled, and pending states.
3. **Forms should feel grouped, not like a wall of fields.**
   Related inputs belong in section cards with concise helper text.
4. **Operational state should be visible in color and shape.**
   Chips, callouts, and card emphasis should reinforce status instead of relying only on text.
5. **Decoration must not slow operators down.**
   Use icons sparingly and only when they improve scanability.

## 2. Theme approach

SKOSS now uses CSS-variable themes.

Implemented themes:

- `light`
- `dark`
- `garden` (green/colorful)

Guidance:

- define colors via semantic variables rather than hardcoded component colors
- prefer `--surface`, `--surface-soft`, `--border`, `--ink`, and semantic state variables
- keep contrast strong enough for busy kitchens and imperfect lighting
- avoid theme-specific component overrides unless absolutely necessary

Persistence:

- theme choice is stored locally in the browser
- the shell applies the saved theme on initial load before the app renders
- future themes should follow the same token contract instead of adding ad hoc classes

## 3. Tokens and layout rules

### Spacing

Use spacing tokens consistently.

- `--space-1` to `--space-8`
- default card and section spacing should come from these tokens
- prefer larger vertical gaps between sections than between related controls

Practical rule of thumb:

- field label to input: small gap
- input groups within a section: medium gap
- section to section: large gap
- page sections: largest gap

### Typography

Use hierarchy to reduce cognitive load.

- `h1`: workspace/page focus
- `h2`: section title
- `h3`: sub-group title within forms
- `eyebrow`: workspace context / category label
- helper text: short, muted, and immediately relevant

Guidance:

- avoid long explanatory paragraphs inside forms
- keep helper text close to the field or section it explains
- prefer strong labels over long placeholder-driven instruction

### Radii and elevation

Use soft, tactile shapes.

- large panels: `--radius-xl`
- cards and field groups: `--radius-lg`
- inputs: `--radius-md`
- chips/buttons: `--radius-pill`

Use shadows lightly.

- default cards use low elevation
- hover/active states can slightly increase elevation
- warning/high-attention cards can use slightly stronger shadow for emphasis

## 4. Semantic color usage

Use semantic colors by meaning, not by page.

- **accent**: primary actions, active navigation, key highlights
- **success**: done, ready, saved success, acknowledged/closed states
- **warning / changed**: changed, in progress, watch items, attention-needed states
- **danger**: validation problems, destructive or blocked situations
- **info**: prepared/shaped/baked or informative progress states
- **draft**: recurring/generated/draft-like states
- **neutral**: manual/default/passive states

Guidance:

- do not invent new one-off status colors for each feature
- when adding a new state, map it onto an existing semantic meaning first
- chips should combine color with a clear label; never rely on color alone

## 5. Interaction states

Every interactive control should support the following where applicable:

- hover
- pressed
- keyboard focus visible
- disabled
- pending/loading
- selected / active

### Buttons

Current variants:

- primary
- secondary
- ghost

Usage:

- **primary**: main save/create action for the section or page
- **secondary**: navigation or supportive actions
- **ghost**: lightweight row-level actions such as remove

### Inputs

Inputs should visibly show:

- hover border strengthening
- focus ring
- invalid state
- disabled state

### Navigation

Primary navigation should show:

- icon + label
- active state
- current workspace indicator in the shell

## 6. Forms and data-entry guidance

When adding or editing forms:

- group fields by operator intent, not by raw data model shape
- mark required items clearly
- mark optional items quietly
- use helper text only when it reduces confusion
- keep notes and exceptions easy to reach
- preserve draft-friendly flows

For repeating line-item editors:

- rows should be card-like and individually scannable
- add/remove actions should be obvious
- line kind, label, quantity, unit, and note should stay visually grouped
- progress or existing completion state should appear at row level when available

## 7. Boards and cards

Operational boards should prioritize:

1. date / workspace context
2. high-level counts and state summaries
3. grouped demand or task cards
4. exception lists and handoff context
5. fast action controls

Card guidance:

- lead with the most decision-relevant label
- keep secondary metadata muted
- use badges for state, not for every fact
- make partial or changed work slightly more prominent than settled items

## 8. Icon usage

Use icons sparingly and functionally.

Good uses:

- primary navigation
- key action buttons
- summary cards or callouts
- theme switcher

Avoid:

- decorative icon spam inside every list item
- icons that duplicate already-obvious meaning without improving scan speed

## 9. Guidance for future PRs

Future UI work should follow these rules:

- extend tokens first before adding hardcoded values
- reuse existing panel/card/button/input patterns where possible
- add new semantic states through shared badge and token conventions
- preserve strong mobile behavior before desktop refinements
- avoid introducing heavy component libraries just for visual polish
- prefer local, understandable CSS over complex styling abstractions
- keep the interface operational and fast even when adding personality

If a proposed UI change improves aesthetics but adds typing, clicks, or ambiguity for operators, it should be reconsidered.
