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
- How should draft customers evolve into structured customer records without losing the original order history?

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

## Progressive adoption model

- What is the right persistence model for draft customers, draft products, and freeform items?
- Should placeholders be separate entity types, flexible states on core entities, or a hybrid?
- How much validation is enough to keep data usable without blocking work?
- What cleanup or formalization workflows are necessary in v1 versus later?
- How do we balance structure with operator speed when the same team may want both on the same day?

## Admin burden

- What is the minimum setup required before the system becomes useful?
- Which configuration tasks can be deferred until after daily usage begins?
- How do we prevent admin setup from overwhelming first-time adoption?

## Deployment and hosting direction

- What minimum stack best supports low-spec hosting without making development or maintenance fragile?
- Which architecture choices keep local self-hosting practical while still supporting a VPS-first model?
- How far should shared-host feasibility influence technical choices, and where is that constraint unrealistic?
- What deployment path is simple enough for small operators but still healthy for FOSS maintainers?

## Offline and degraded-network direction

- How far should offline support go in v1 versus later phases?
- What degraded-mode behaviors matter most if internet is unstable but the local network still works?
- Which workflows must continue locally, and which can wait for synchronization?
- How do we avoid premature sync complexity while still protecting the possibility of offline-aware evolution?

## Real-time collaboration model

- What is the lightest real-time model that still helps kitchen workflows?
- Are polling or manual refresh patterns good enough early on, or is live push essential for certain screens?
- Which updates truly need to appear immediately for operators to trust the system?

## Security and portability baseline

- What security baseline is practical for small-business self-hosting without becoming enterprise-heavy?
- Which export formats are most useful for operators and maintainers?
- What should a simple, reliable backup and restore path look like from day one?
- How can the project protect user data without locking operators into opaque infrastructure?

## Future skin/preset strategy

- What should remain in the shared SKOSS core?
- What should later become BAGET-specific or bakery-preset behavior?
- How can preset support emerge without fragmenting the domain model too early?
