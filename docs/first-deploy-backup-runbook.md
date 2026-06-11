# First Deploy Backup Runbook

This runbook is for safely retrying a first local SKOSS deploy rehearsal. It is intentionally narrow: it gives maintainers a way to snapshot rehearsal state, restore locally, and understand what is still manual. It is not a production-grade disaster recovery plan.

## When To Take A Snapshot

Take a snapshot before each destructive or hard-to-repeat step:

- before running reset or reseed tools;
- before restoring another backup;
- after bootstrap and admin login are confirmed;
- after customers and basic products are confirmed;
- after the first real order is created;
- after production and handoff are verified.

Label backup files with the rehearsal step in external notes if the filename alone is not enough.

## Identify Persistence Mode

SKOSS currently selects persistence mode with `SKOSS_PERSISTENCE_MODE`:

- unset or `json`: JSON runtime mode;
- `hybrid`: migrated domains in PostgreSQL when `DATABASE_URL` is set, with remaining domains still in JSON;
- `postgres`: currently uses the same hybrid gateway shape and still needs the JSON-backed domains until migration is complete.

PostgreSQL is only active when `SKOSS_PERSISTENCE_MODE` is `hybrid` or `postgres` and `DATABASE_URL` is set. If PostgreSQL is unavailable, the gateway logs a fallback and uses JSON runtime data.

## JSON Runtime Backup

JSON runtime state is stored at:

```text
data/runtime/demo-store.json
```

Create a timestamped local rehearsal backup with:

```bash
npm run skoss:backup:json
```

The backup is written to:

```text
data/backups/skoss-json-runtime-<timestamp>.json
```

`data/backups/*` is ignored by git so local rehearsal records are not committed by accident.

## JSON Runtime Restore

Restore is destructive because it replaces `data/runtime/demo-store.json`. The CLI restore command refuses to run unless the explicit guard flag is set:

```bash
SKOSS_ALLOW_JSON_RESTORE=1 npm run skoss:restore:json -- data/backups/skoss-json-runtime-<timestamp>.json
```

Before replacing the runtime store, the script creates a safety copy of the current runtime JSON file:

```text
data/backups/pre-json-restore-<timestamp>.json
```

For app-based restore, `/entry` can upload a JSON backup. Use the CLI path when rehearsing from a terminal and the `/entry` path when validating the user-facing restore surface.

## Hybrid And PostgreSQL Backup Considerations

In hybrid mode, a complete rehearsal snapshot has two parts:

1. the JSON runtime store, for JSON-backed domains such as orders, products, destinations, recurring templates, suppliers, raw materials, recipes, WIP, shift logs, and activities;
2. a PostgreSQL dump, for migrated domains such as workspace, preferences, instance state, session state, users, user roles, and customers.

Start the local PostgreSQL service from `docker-compose.postgres.yml` when using the included compose setup. A maintainer can create a database dump with either a local `pg_dump` or Docker Compose command, depending on where PostgreSQL is running.

Local `pg_dump` shape:

```bash
pg_dump "$DATABASE_URL" --format=custom --file=data/backups/skoss-postgres-<timestamp>.dump
```

Docker Compose shape for the included service:

```bash
docker compose -f docker-compose.postgres.yml exec -T skoss-postgres pg_dump -U skoss -d skoss --format=custom > data/backups/skoss-postgres-<timestamp>.dump
```

Do not commit `.dump` files or JSON backups.

## Hybrid Restore And Retry

A safe hybrid retry should restore both halves from the same rehearsal point:

1. stop the app;
2. restore the PostgreSQL dump with `pg_restore` using the matching database connection;
3. restore the JSON runtime backup with `SKOSS_ALLOW_JSON_RESTORE=1 npm run skoss:restore:json -- <json-backup>`;
4. restart the app with the same `SKOSS_PERSISTENCE_MODE` and `DATABASE_URL`;
5. open `/entry` and confirm instance/admin/onboarding/demo state before continuing.

This repository does not provide a PostgreSQL restore script yet. That is intentional: a database restore is destructive, environment-specific, and should not be hidden behind a premature npm alias.

## Safe Vs Unsafe

Safe for first local rehearsal:

- timestamped JSON runtime backups;
- guarded JSON runtime restore with a pre-restore safety copy;
- manual PostgreSQL dump files kept outside git;
- restore testing on a local rehearsal instance.

Unsafe or not ready:

- treating JSON-only backup as complete when hybrid/PostgreSQL mode is active;
- running restore commands against a production database;
- committing backup files with real customer/order data;
- assuming this replaces real disaster recovery;
- restoring PostgreSQL without confirming the target database and credentials.

## Not Production Grade Yet

This runbook does not provide:

- scheduled backups;
- encrypted backup storage;
- cloud or offsite backup;
- retention policy;
- point-in-time recovery;
- production restore automation;
- user-facing export management;
- validation that a backup contains every future migrated domain.

For the first deploy rehearsal, the goal is narrower: make it possible to retry local setup and operational-flow tests without losing the current rehearsal state by accident.
