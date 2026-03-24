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

Implemented appearance modes:

- `light`
- `dark`
- `system`

Guidance:

- define colors via semantic variables rather than hardcoded component colors
- prefer `--surface`, `--surface-soft`, `--border`, `--ink`, and semantic state variables
- keep contrast strong enough for busy kitchens and imperfect lighting
- avoid theme-specific component overrides unless absolutely necessary
- keep theme accent colors distinct from semantic success colors so completed states still scan immediately
- keep light and dark surfaces consistent enough that the same workspace still feels familiar across devices

Persistence:

- appearance preference is stored locally in the browser
- the shell applies the saved preference on initial load before the app renders
- the header should expose only one compact user entry point, with language and appearance grouped inside the user/preferences menu
- a fuller preferences page can still hold longer-lived personal defaults without crowding the shell

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
- enough spacing and contrast to scan quickly without turning navigation into a row of large buttons

Header rule:

- the global header should carry brand identity and primary wayfinding only
- page or workspace context belongs in the page heading, subtitle, and local summary cards
- avoid repeating the same workspace label in the shell and the page body

## 6. Forms and data-entry guidance

When adding or editing forms:

- group fields by operator intent, not by raw data model shape
- mark required items clearly with a light asterisk instead of a heavy status chip
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

## 8. Header and global shell guidance

The shell should stay lighter than the page content it contains.

Guidance:

- keep the header visually short and calm
- separate product identity from page context
- avoid long descriptive copy in the global shell
- keep global controls secondary to navigation and page work
- group session and personal controls behind one compact user trigger instead of scattering them across the header
- keep personal destinations such as Preferences reachable from that compact user surface rather than as a default primary-nav item
- preserve touch-friendly hit areas, but reduce unnecessary bulk in pills and chips

A good shell helps operators orient quickly, then gets out of the way.

## 9. Desktop density and spatial admin behavior

Mobile and desktop should share the same product model, but not the same spatial assumptions.

Current refinement direction:

- keep mobile linear and touch-safe as the baseline interaction
- on desktop, use horizontal room for list/detail or list/editor/context combinations in admin-heavy screens
- prefer compact, section-level navigation aids on desktop when admin surfaces are long
- keep increased density moderate: reduce avoidable whitespace, but preserve scanning clarity and calm grouping
- sticky desktop side/context panels are acceptable when they reduce repeated scrolling in setup and customer-management flows

This is a usability optimization, not a visual redesign.

## 8.1 Desktop layout mode

SKOSS now keeps two shell behaviors that share the same components:

- **mobile/tablet compact mode**: primary navigation stays in the top shell so workflows remain linear and touch-first
- **desktop mode (wide screens)**: primary navigation moves into a left sidebar and the top bar stays minimal (brand/workspace + user/preferences)

Rationale:

- on wide screens, horizontal top navigation felt stretched and reduced scan speed
- admin users need faster movement between setup entities without fighting long vertical scrolls
- preserving mobile behavior avoids disrupting the operator-first compact flow

Desktop sidebar guidance:

- first group: operational workspaces (home, timeline, orders, production, handoff, etc.)
- second group (role-aware): admin/setup links (customers, users, suppliers, materials, recipes)
- keep grouping compact and avoid turning the sidebar into a full settings tree

The desktop mode should increase context and navigation clarity without changing the design language or introducing heavy layout systems.

## 9. Icon usage

Use icons sparingly and functionally.

Good uses:

- primary navigation
- key action buttons
- summary cards or callouts
- theme switcher

Avoid:

- decorative icon spam inside every list item
- icons that duplicate already-obvious meaning without improving scan speed

## 10. Guidance for future PRs

## 11. Local sub-navigation for growing workspaces

When a workspace accumulates multiple functional zones, add **light local sub-navigation** before adding new top-level routes.

Current examples:

- Settings groups sections by business setup, team/users, catalog/costing, and preferences/system boundaries.
- Production boards expose quick jumps for demand, fulfillment queues, WIP/handoff context, and line updates.

Rules:

- keep sub-navigation compact (chips/pills are enough)
- map directly to visible sections, not abstract admin taxonomies
- preserve role-shaped access from primary navigation
- avoid introducing deep menu trees unless a workflow truly needs separate routes

Future UI work should follow these rules:

- extend tokens first before adding hardcoded values
- reuse existing panel/card/button/input patterns where possible
- add new semantic states through shared badge and token conventions
- preserve strong mobile behavior before desktop refinements
- avoid introducing heavy component libraries just for visual polish
- prefer local, understandable CSS over complex styling abstractions
- keep the interface operational and fast even when adding personality

If a proposed UI change improves aesthetics but adds typing, clicks, or ambiguity for operators, it should be reconsidered.
