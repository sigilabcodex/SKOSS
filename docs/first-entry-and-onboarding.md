# First entry and onboarding (instance gateway model)

## Why this change

Previous behavior was linear:

- first contact often assumed either immediate login or direct setup
- onboarding lived inside Home and did not expose intent-based entry choices
- demo and restore paths existed but were not framed as first-contact decisions

This created confusion for new pilots and local dev use.

## Entry gateway concept

SKOSS now introduces an explicit **Instance Entry Gateway** (`/entry`) as the first-contact layer.

Primary question shown to users:

> What do you want to do right now?

The gateway offers five paths:

1. **Start a new kitchen** (admin setup)
2. **Explore demo environment** (seeded, resettable, non-production)
3. **Restore from backup** (minimal file-based JSON restore)
4. **Open existing instance** (sign-in flow)
5. **Learn / help / documentation** (README + pilot/testing docs)

This keeps first use intent-first, not login-first.

## Instance state model

A lightweight `instance` object is persisted in the store:

- `initialized`
- `onboardingStatus` (`not_started`, `in_progress`, `completed`)
- `demoModeActive`
- `environmentType` (`dev`, `demo`, `pilot`, `production`)
- `backupHintAvailable`
- `lastRestoreAt`
- `onboardingProgress` flags:
  - `adminAccount`
  - `workspaceBasics`
  - `timezone`
  - `users`
  - `roles`
  - `shifts`
  - `optionalImports`
- `operatorOnboardingByUserId` (future role onboarding tracking)

Detection is intentionally simple and reversible.

## Instance detection logic

Gateway detection currently checks:

- no instance initialized
- admin user missing
- active users present or absent
- onboarding incomplete
- demo mode active
- backup file hint available (`data/backups/*.json`) or state flag

This powers lightweight first-login routing decisions.

## Routing logic (first login and return)

Current routing behavior:

- fresh or missing-admin state -> `/entry`
- no session user -> `/entry` then sign-in path
- onboarding incomplete + admin/manager login -> `/setup?section=business-setup`
- returning user with valid state -> workspace home flow

Goal: predictable routing with small condition sets.

## Admin setup flow

From gateway, **Start a new kitchen** routes to setup onboarding entry (`/setup?section=business-setup`).

Current onboarding progress support includes:

- step flags in `instance.onboardingProgress`
- save progress by persisted store updates
- resume via deterministic setup route

Detailed multi-step wizard UX can be layered in later PRs without changing the state contract.

## Demo mode flow

From gateway, **Explore demo environment**:

- reseeds data from demo seed
- marks instance as demo-active
- preserves non-production posture
- routes to sign-in for role exploration

Local dev target is preserved:

- fresh clone -> run -> open browser -> gateway -> demo -> usable app

## Restore flow (minimal)

From gateway, **Restore from backup** provides:

- JSON file upload
- minimal structure validation
- store replacement
- `lastRestoreAt` update
- redirect back to gateway with restore status

This is intentionally file-based and extensible, not a heavy backup system.

## Learn/help entry

Gateway includes direct links to:

- README
- pilot deployment workflow
- local testing and demo mode guide

This remains intentionally lightweight.

## Operator onboarding direction

Non-admin onboarding remains a separate track:

- role-aware “what to do first” steps should be attached to role workspaces
- admin complexity should stay out of worker-first entry
- `operatorOnboardingByUserId` exists to support progressive rollout in upcoming PRs

## Local development experience alignment

The gateway model supports local workflows by default:

- no manual DB editing to reach a usable system
- demo launch available quickly in non-production
- restore path available for scenario replay
- behavior remains reversible via reseed/reset

## Pilot usage alignment

For pilot teams, this clarifies first contact:

- admin can intentionally enter setup
- trainers can open demo quickly
- operators can sign in directly once instance is ready
- support staff has a clear restore lane during recovery drills

## What still needs follow-up

1. richer admin onboarding step UI (skip/resume visuals)
2. explicit operator onboarding cards per role/workspace
3. backup manifest/version metadata checks
4. optional “open existing instance” auto-highlight when state is stable
