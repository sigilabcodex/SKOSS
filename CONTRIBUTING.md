# Contributing

## Development philosophy

SKOSS is operator-first software for small food businesses.

When contributing, prefer:

- boring, stable, portable technical choices
- narrow increments tied to real kitchen workflows
- mobile-first, touch-friendly UX
- domain language that sounds like a kitchen, not an ERP
- documentation and reversible decisions over speculative architecture

Avoid accidental ERP-ification.

That means contributions should not drift into:

- accounting scope
- deep inventory complexity before operational need is proven
- heavy admin setup as a prerequisite for daily work
- framework-driven naming that hides the kitchen domain
- distributed-systems complexity without a real operational reason

## Local development

1. Install Node.js 20 or newer.
2. Copy environment defaults if needed:

   ```bash
   cp .env.example .env.local
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the app:

   ```bash
   npm run dev
   ```

5. Open `http://localhost:3000`.

## Coding expectations

- Keep domain logic out of page components when possible.
- Prefer plain TypeScript modules and obvious data flow.
- Keep route and component names aligned with user-visible workspaces.
- Preserve draft-friendly flows; incomplete setup must not block core work.
- Use concise comments only where the domain or tradeoff is not obvious.
- Do not add large dependencies without a clear v0 reason.

## UX expectations

Before adding fields, statuses, or setup screens, ask:

- does this reduce operator confusion?
- does this reduce typing on phones/tablets?
- does this help WIP, recurrence, or handoff?
- does this block first use if the business is still messy?

If the answer is no, the addition probably belongs later.

## Pull request expectations

A good contribution usually includes:

- a small, coherent scope
- updated docs when behavior or assumptions change
- clear naming using domain terms already established in the repo
- tests or checks appropriate to the change
