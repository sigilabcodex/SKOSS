# Runtime data and seeds

## Why this separation is required

SKOSS previously wrote runtime mutations into a tracked repository file. That mixed source code with live instance state and caused avoidable git conflicts.

This is unsafe for local development and unacceptable for pilot/real usage because:

- runtime writes can dirty git state during normal use
- `git pull` can fail when tracked data files diverge
- seed intent becomes unclear when mutable state is version-controlled
- deployments cannot cleanly separate shipped code from instance data

## Current file model

SKOSS now uses explicit file roles:

- `data/seeds/demo-store.seed.json` — read-only seed baseline, tracked in git
- `data/runtime/demo-store.json` — mutable runtime store, instance-specific, git-ignored

`.gitignore` ignores all runtime files under `data/runtime/`.

## Startup initialization behavior

On store access/startup:

1. check `data/runtime/demo-store.json`
2. if missing, create `data/runtime/` and copy seed into runtime
3. if present, use runtime file directly

This keeps behavior explicit and predictable.

## Read/write behavior

- all reads happen from runtime store
- all writes happen to runtime store
- seed file is never mutated by runtime actions

This applies to order edits, WIP updates, onboarding changes, restore actions, and demo launch/reset flows.

## Reset / reseed behavior

Two reset paths now exist:

1. **Setup UI reset** (non-production modes only)
   - removes runtime file
   - copies seed to runtime
2. **CLI reset**
   - `npm run reset:demo-runtime`
   - runs `scripts/reset-runtime-demo-store.mjs`

Both paths are deterministic and leave seed untouched.

## Local development impact

For local development this means:

- seed history remains reviewable in git
- runtime edits no longer appear as tracked file changes
- developers can reseed safely between test cycles

Typical loop:

1. `npm run dev`
2. use app normally (runtime file mutates)
3. `npm run reset:demo-runtime` when a clean state is needed

## Pilot deployment impact

For pilot VPS use this supports safer operations:

- code deploy and runtime state are separated
- runtime path can be backed up/restored independently
- pulling updates no longer conflicts with mutable demo/runtime state

## What this enables next (without overengineering)

This structure keeps a simple file-backed approach while preparing for:

- clearer separation of demo vs pilot/real data paths
- instance-specific backup/restore flows
- later environment-specific runtime files without changing core workflow code
