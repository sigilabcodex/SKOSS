# Development Session Notes

This note captures the current end-of-session state for the first local MWP rehearsal path. It is intentionally narrow: no new product scope, no feature commitments, and no replacement for the detailed checklist in [First Deploy Rehearsal](./first-deploy-rehearsal.md).

## Latest MWP push completed

- Captured the MWP readiness audit and first-deploy rehearsal path.
- Added the first-deploy backup and retry runbook.
- Improved operator-facing empty states and first-deploy workflow guidance.
- Kept the timeline oriented as a support and risk view, not the main cockpit.
- Simplified order capture for rehearsal so a first order starts with the practical customer/date -> item -> save path.
- Added a narrow product confirmation path for basic sellable product setup without turning it into POS or menu management.

## Current MWP status

The core local rehearsal path is ready to test on a clean, non-demo state:

1. bootstrap a local instance;
2. create or recover admin access;
3. confirm basic workspace, customer, and product setup;
4. capture a real-looking order;
5. move that order through production progress;
6. record WIP and handoff notes;
7. verify backup/retry posture before destructive reset or restore testing.

The current priority is operational confidence for first local deploy/test. New product model, menu, procurement, inventory, and costing depth should not interrupt that path.

## Manual rehearsal observations

- Operator flow is improving, but visual hierarchy still needs refinement where users hesitate or misread priority.
- The timeline should remain a support/risk view for due, overdue, and upcoming work rather than becoming the main cockpit.
- Order capture had become too heavy; the simplified path is better aligned with MWP rehearsal.
- Product setup should stay basic for now: name, default unit, optional category, and active state are enough to support order capture.
- Product/menu ideas from Loyverse, Uber Eats, and DiDi Food are useful later benchmarks, but they belong in post-MWP or beta documentation.
- The near-term focus remains getting a first local deploy/test usable with real-looking operational data.

## Intentionally deferred

- Full POS/menu management.
- Advanced product descriptions, images, modifiers, channel menus, and availability rules.
- Rich variants, pricing tiers, recipes, costing, inventory, procurement, and supplier workflows.
- Accounting, payroll, stock valuation, delivery automation, and broad analytics.
- Hosted deployment automation beyond what is needed to understand local first-deploy readiness.

## Next rehearsal checklist

1. Start from updated `main` with no unrelated local edits.
2. Set the intended runtime mode explicitly, preferably `SKOSS_RUNTIME_MODE=pilot` for rehearsal.
3. Start from a clean runtime data directory or a known rehearsal backup.
4. Run the backup check from [First Deploy Backup Runbook](./first-deploy-backup-runbook.md) before any destructive reset or restore step.
5. Open `/entry` and confirm demo mode is not active for the real rehearsal path.
6. Run `/bootstrap` and create the owner/admin account.
7. Confirm workspace basics in `/admin/setup`.
8. Confirm or create a small set of basic products only.
9. Confirm or create one real-looking customer.
10. Create a real-looking order in `/orders/new` using the simplified path.
11. Verify the order appears in `/orders` and is visible for production.
12. Update line progress in `/production`.
13. Record WIP and shift notes in `/handoff`.
14. Check whether the operator home, production board, and handoff screens make the next action obvious.
15. Capture only concrete blockers or confusing moments, with route, action attempted, expected result, and actual result.

## Next likely PR candidates

- Run a fresh local rehearsal on clean/non-demo state and record the concrete findings.
- Fix concrete blockers in order capture, production, or handoff that prevent completing the rehearsal loop.
- Continue the visual hierarchy pass only where rehearsal shows confusion.
- Improve bootstrap sequencing and first-run clarity if the clean-instance path is unclear.
- Later: write a product/menu model benchmark doc based on Loyverse, Uber Eats, and DiDi Food.
- Later: document and design advanced product fields, variants, modifiers, pricing, recipes, costing, inventory, and procurement.
