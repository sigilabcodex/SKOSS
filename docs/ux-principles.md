# UX Principles

SKOSS should feel light, clear, and forgiving in daily use.

These principles should guide product decisions before visual style trends or framework habits.

## 1. Forgiving by default

Operators should be able to correct mistakes quickly.

Implications:

- make editing easy
- support manual overrides
- allow notes on exceptions
- avoid flows where one mistake traps the user in admin cleanup

## 2. Never block operation because setup is incomplete

A user should be able to keep working even when the catalog, customer list, or recipes are unfinished.

Implications:

- order entry must allow draft and placeholder data
- missing structured records should degrade capability, not stop work
- admin setup should follow repeated need, not precede first use
- operator workflows should never require a fully populated back office

## 3. Draft first, refine later

The product should support gradual formalization.

Implications:

- let users capture a draft customer, draft product, or note item quickly
- make later cleanup and conversion straightforward
- prefer reusing structured records when they exist
- preserve original operational context even after later normalization

## 4. Touch-friendly first

The primary experience should work well on phones and tablets.

Implications:

- large tap targets
- readable spacing
- simple navigation depth
- core actions reachable without fine pointer precision

## 5. Minimal typing

Typing on the production floor is expensive.

Implications:

- favor quick selection over free-form entry where reasonable
- reuse templates and defaults
- make recurrence reduce repeated input
- reserve text entry for notes and true exceptions

## 6. Clear status visibility

Users should understand the state of work at a glance.

Implications:

- make completion state obvious
- show what is partial, blocked, or adjusted
- distinguish planned work from active WIP
- highlight changes that affect the current shift

## 7. Fast notes

Notes are not secondary. They often carry the missing context that keeps work moving.

Implications:

- make notes quick to add and quick to see
- surface the most relevant notes near the work itself
- support handoff notes without forcing a long reporting workflow

## 8. Partial completion support

Real work is frequently half-done, split, delayed, or handed over.

Implications:

- support partial states directly
- avoid binary done/not-done assumptions
- preserve what remains vs what has already been completed

## 9. Degraded-network awareness

The product should remain usable when connectivity is imperfect.

Implications:

- make important reads and writes efficient
- avoid UX that depends on constant high-quality internet
- keep critical actions understandable if refreshes or updates are delayed
- design flows that could later support stronger offline behavior without rewriting the whole experience

## 10. Real-time shared state, lightly applied

The system should help teams see the same reality without assuming a heavy collaboration stack.

Implications:

- updates should be visible to others quickly
- handoff should not depend only on verbal communication
- the latest operational state should be easier to find than old plans
- use the lightest real-time approach that meaningfully helps kitchen coordination

## 11. Simple surface, deeper structure underneath

The product can have meaningful domain depth without showing all of it at once.

Implications:

- keep common screens simple
- reveal deeper detail only when needed
- separate operator flows from heavy configuration concerns
- avoid exposing advanced identifiers unless they actually help

## 12. Use practical language

Words shape usability.

Implications:

- prefer kitchen-friendly terms
- avoid ERP jargon in user-facing flows
- choose labels that map to how operators actually speak about work
- avoid abstract setup language when a concrete term is available

## 13. Reality beats plan

A plan is useful only if it can bend when the kitchen does.

Implications:

- let operators adjust active work
- preserve exceptions instead of hiding them
- treat WIP and handoff as operational truth, not awkward afterthoughts
