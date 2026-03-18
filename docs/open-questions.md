# Open Questions

These are important unresolved questions that should guide future product discovery. They are listed to keep the project honest about what is not decided yet.

## Production day boundaries

- How should a production day be defined for overnight bakery work?
- Should businesses be able to configure a day boundary that differs from midnight?
- How much of that complexity is necessary in the first MVP?

## Product vs variant modeling depth

- When should something be a product versus a variant?
- Do some businesses need multi-level variant structures, or is that too heavy early on?
- How should the product model stay simple while still respecting operational differences?

## Base dough and intermediate modeling

- How explicitly should intermediate preparations be modeled in v0?
- Is base dough enough initially, or do some cases need other intermediate concepts such as preferments, fillings, or toppings?
- How much process structure is needed before the model becomes too abstract?

## WIP granularity

- What is the minimum useful granularity for WIP?
- Should WIP be tracked at batch level, stage level, quantity level, or all three later?
- How can WIP stay useful without becoming burdensome to maintain?

## Production requirement generation

- How opinionated should the first transformation logic be?
- Should the MVP only group demand, or also derive dough-level requirements immediately?
- How transparent must the generation logic be so operators trust it?

## Recurrence behavior

- How far into the future should recurring instances be generated?
- What is the best UX for series edits versus single-occurrence edits?
- How should skipped or modified occurrences be represented without confusing users?

## Destinations and customer modeling

- Is destination always the same thing as customer?
- How should the system handle one customer with multiple delivery points?
- How much customer detail is really needed in the first phase?

## Shift handoff format

- Should handoff be primarily structured status, free-form notes, or a hybrid?
- What information must be mandatory to make handoff reliable?
- How can handoff stay fast enough that operators will actually use it?

## Role design

- Which role distinctions truly matter in the first MVP?
- Are four workspaces enough initially, or should some be merged?
- How should owner-operators who switch roles frequently experience the product?

## Kalali-specific vs general bakery logic

- Which concepts are genuinely reusable across bakeries?
- Which Kalali practices should remain examples rather than product assumptions?
- When should the system generalize, and when should it stay bakery-first?

## Admin burden

- What is the minimum setup required before the system becomes useful?
- Which configuration tasks can be deferred until after daily usage begins?
- How do we prevent admin setup from overwhelming first-time adoption?

## Future skin/preset strategy

- What should remain in the shared SKOSS core?
- What should later become BAGET-specific or bakery-preset behavior?
- How can preset support emerge without fragmenting the domain model too early?
