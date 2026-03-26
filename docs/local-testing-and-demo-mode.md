# Local testing and demo mode

## Why this exists

SKOSS needs a safe playground so teams can test orders, WIP, and handoff behavior **without risking real bakery records**.

## Local desktop testing baseline

Before VPS pilot use, developers should run desktop checks against seeded data and role switching.

### Recommended baseline flow

1. Start app locally (`npm run dev`).
2. Confirm runtime banner shows non-production mode.
3. Login as each seeded role and run the same day-flow:
   - order capture/edit
   - production review
   - WIP updates
   - shift handoff note
4. Reseed demo workspace when needed.
5. Repeat checks after any significant UI/data-flow change.

## Demo/developer mode definition

In SKOSS context, demo/developer mode means:

- seeded bakery dataset for repeatable testing
- visible non-production banner in the shell
- easy reset/reseed path for local workflows
- strict expectation that this data is not business-of-record

Runtime separation now follows a simple seed/runtime model:

- tracked seed file: `data/seeds/demo-store.seed.json`
- mutable runtime file: `data/runtime/demo-store.json` (git-ignored)
- on startup, runtime data is copied from seed only when runtime is missing

Current runtime modes:

- `demo` (default in local/dev)
- `pilot` (internal real-user trial)
- `production` (real records, no demo reset)

Use `SKOSS_RUNTIME_MODE` in environment configuration.

## Seed/demo/test data behavior

The seeded local workspace should stay small and realistic:

- one bakery workspace
- manager/admin user
- sales/frontdesk user
- production/night user
- realistic products/customers/orders in mixed states
- WIP + handoff sample records

Seed data should represent realistic bakery language and partial/in-progress work, not artificial “perfect” records.

## Avoiding mixed real/test data

Rules:

- do not use production credentials or production exports in demo mode
- do not point local dev to real pilot/production storage
- keep obvious naming for non-production workspace/data
- use runtime mode label and banner as a safety check
- reseed frequently during test cycles so stale mixed records do not accumulate

## Non-destructive reset/reseed workflow

For local or internal pilot rehearsal:

1. Open **Setup** as manager/admin.
2. Use **Reset demo workspace to seed data**.
3. Re-run the role checklist.

CLI alternative:

1. Stop local server.
2. Run `npm run reset:demo-runtime`.
3. Restart and re-run role checks.

Reset is blocked when runtime mode is `production`.

## Recommended local test scenarios

Run these before pilot deployment and after major changes:

- order creation (draft customer + saved customer)
- order editing (status/line adjustments)
- due date + promised time handling
- production-day review sanity
- WIP update (stage + status)
- shift handoff summary + open items
- customer notes visibility
- role visibility sanity (frontdesk vs production vs manager)

## Mock bakery data conventions

Use practical, reusable conventions:

- customer labels that map to real intake channels (WhatsApp/phone/walk-in)
- product labels with clear variant naming
- partial-completion lines and draft items in every seed set
- at least one handoff note with a concrete next-shift action
- at least one changed order to test “reality override” behavior
