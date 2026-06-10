# First Deploy Rehearsal

This checklist is for the first real local SKOSS rehearsal before any hosted or customer-facing deployment. It verifies the minimum work path with real-looking operational data while keeping demo, development, and production data boundaries visible.

## Local Preflight

- Start from the current `main` branch with no unrelated local edits.
- Install dependencies and confirm the app can typecheck and build.
- Set `SKOSS_RUNTIME_MODE` intentionally:
  - `demo` is for local development and resettable demo data.
  - `pilot` is for rehearsal-like local use with non-production recovery still available.
  - `production` disables local destructive recovery and demo launch actions.
- Confirm which persistence mode is being rehearsed: JSON runtime data, hybrid PostgreSQL/Drizzle, or the current project default.
- Start with a clean runtime data directory or a known rehearsal backup.
- Record the exact environment variables used for the rehearsal.

## Clean Instance Assumptions

A clean local rehearsal should begin with:

- no initialized real workspace, or a deliberately reset local runtime workspace;
- no active real admin session;
- no unlabelled demo records mixed into the rehearsal;
- no expectation that procurement, inventory, WhatsApp, delivery automation, or printing workflows are production-ready;
- a manual filesystem/database backup plan before destructive reset or restore tests.

## Runtime Mode Expectations

| Mode | Expected use | Rehearsal note |
| --- | --- | --- |
| `demo` | Local development and training | Demo launch and local reset tools may be visible. Do not treat records as real operational data. |
| `pilot` | First local rehearsal and controlled pilot runs | Good default for first deploy rehearsal. Local recovery can still be available. |
| `production` | Real deployment posture | Demo launch, destructive local reset, and local admin recovery should be disabled. |

If the runtime mode is unclear in `/entry`, stop the rehearsal and inspect environment configuration before entering real data.

## Step-by-Step Workflow

1. Open `/entry`.
   - Expected: the instance gateway shows whether an instance, admin user, onboarding state, and demo mode are detected.
   - Failure signs: demo mode appears active when preparing a real rehearsal, or guided activation is unavailable on a clean instance.

2. Run `/bootstrap`.
   - Expected: guided activation allows admin creation and workspace basics. Optional setup can remain incomplete.
   - Failure signs: bootstrap is locked even though the instance is clean, or setup cannot create/recover an admin user.

3. Create or recover admin access.
   - Expected: a working admin account can sign in after activation.
   - Failure signs: no active admin user is detected, login loops back to `/entry`, or recovery is needed in `production` mode.

4. Confirm business and workspace setup in `/admin/setup`.
   - Expected: business identity, workspace preferences, customers, and basic catalog setup are visible without requiring procurement or inventory setup.
   - Failure signs: a user must complete suppliers, raw materials, recipes, costing, or inventory before order capture.

5. Confirm customers in `/customers`.
   - Expected: existing customers can be reviewed or a first real customer can be added.
   - Failure signs: customer setup only shows demo customers without clear route to real records.

6. Confirm basic products in `/admin/setup?section=products#products`.
   - Expected: sellable products can be reviewed, created, or marked active/inactive with simple labels.
   - Failure signs: order capture requires recipes, costing, SKU/barcode setup, procurement, or inventory data.

7. Create a real order in `/orders/new`.
   - Expected: product suggestions are available, but freeform lines still work for "work now, organize later".
   - Failure signs: order creation blocks on perfect catalog setup or missing optional customer details.

8. Review orders in `/orders`.
   - Expected: the new order appears with production date, fulfillment, notes, and line progress.
   - Failure signs: the order is saved but cannot be found, or it is hidden from production without clear reason.

9. Move the order through `/production`.
   - Expected: visible order lines appear on the board and can receive progress updates.
   - Failure signs: production board is empty after creating a visible order, or line progress cannot be updated.

10. Complete handoff in `/handoff`.
    - Expected: WIP, packing, pickup, assignment, and focus-day order checks reflect production progress.
    - Failure signs: completed work does not surface for handoff, or there is no clear way to record shift/WIP notes.

11. Verify demo/dev/real-data clarity.
    - Expected: `/entry` and setup screens make demo mode and destructive local tools clear.
    - Failure signs: demo seed records and rehearsal records are indistinguishable.

12. Verify reset, retry, and backup posture.
    - Expected: non-production reset/recovery paths are visible only where appropriate, restore accepts a JSON backup, and the lack of a user-facing export path is understood.
    - Failure signs: a user can destroy real data from production mode, or there is no manual backup before reset/restore testing.

## Common Failure Signs

- `/entry` reports demo mode active during a real-data rehearsal.
- `/bootstrap` cannot run on a clean local instance.
- Login succeeds but redirects back to `/entry`.
- Setup implies procurement, inventory, recipes, or costing are required before orders.
- Products cannot be confirmed before order entry.
- Production board remains empty after a visible order is created.
- Handoff shows no focus-day context after production progress is recorded.
- Reset/recovery actions appear in production mode.
- Restore is available but no backup/export process was prepared first.

## Reset And Retry Notes

- Use reset tools only in `demo` or other non-production local modes.
- Before destructive reset or restore tests, take a manual copy of JSON runtime data and any local database volume used by the rehearsal.
- Restore currently accepts JSON backup uploads from `/entry`.
- A user-facing export/backup creation flow is not ready yet. Treat export as a documented manual operator/maintainer task for the first rehearsal.
- If data mode changes during rehearsal, restart from a clean instance and repeat the path from `/entry`.

## Explicitly Not Ready Yet

The first local deploy rehearsal should not attempt to validate:

- procurement planning;
- inventory tracking;
- recipe costing as a required order path;
- WhatsApp integration;
- printing as an operational dependency;
- delivery workflow automation;
- full module marketplace behavior;
- complex permissions beyond current admin/operator separation;
- hosted deployment automation.

## Must Fix Before A Real First Deploy

- Run this checklist once on a clean local instance and capture failures.
- Confirm the selected runtime mode and persistence mode are documented for the deployment target.
- Define a concrete manual backup/export procedure until a user-facing export flow exists.
- Verify admin recovery expectations in `production` mode.
- Verify demo seed data is not mixed with real rehearsal records.

## Recommended Next PR

Add a narrow backup/export rehearsal path or maintainer runbook that matches the active persistence mode. Keep it focused on "can we safely retry the first deploy rehearsal" rather than broad data lifecycle tooling.
