# Deployment readiness checklist (internal pilot)

Use this checklist before switching real internal users onto SKOSS.

## 1. Environment setup

- [ ] VPS provisioned with stable hostname/subdomain for internal pilot.
- [ ] Runtime mode explicitly set (`SKOSS_RUNTIME_MODE=pilot` for pilot).
- [ ] TLS/HTTPS configured.
- [ ] `.env` reviewed for non-production-safe defaults.
- [ ] Team can access the app on phones/tablets and desktop browsers.

## 2. Auth readiness

- [ ] Pilot users created for manager, sales/frontdesk, and production/night.
- [ ] Each user can sign in with known credentials.
- [ ] Session behavior verified (login/logout, stale session handling).
- [ ] Role visibility checked against pilot boundaries.

## 3. Database/data readiness

- [ ] Initial workspace and seed records verified for pilot relevance.
- [ ] Non-production/demo data not mixed into intended live pilot records.
- [ ] Daily critical records identified (orders, WIP, shift logs).
- [ ] Basic recovery drill tested (restore from last known good data file/backup).

## 4. Backup expectations

- [ ] Minimum daily backup schedule defined.
- [ ] Backup location is outside application runtime directory.
- [ ] Team knows who validates backup success.
- [ ] Restore instructions are documented and tested once.

## 5. Update procedure expectations

- [ ] Deployment update steps documented (build/start/restart flow).
- [ ] Maintenance window expectation agreed with pilot team.
- [ ] Post-update smoke checks defined (orders, production, handoff).

## 6. Rollback expectations

- [ ] Last known working build/version is identifiable.
- [ ] Rollback command/procedure documented.
- [ ] Data rollback policy clarified (when to rollback code only vs code+data).

## 7. Staging / internal pilot recommendation

- [ ] Pilot runs on internal subdomain first.
- [ ] No public launch messaging tied to this deployment.
- [ ] Team fallback process (WhatsApp + Excel/manual) is ready.

## 8. Operational pre-switch checks

Run this on the day you enable real internal usage:

- [ ] Create and edit one sample order.
- [ ] Confirm due date/promised time visibility.
- [ ] Review production board grouping.
- [ ] Add one WIP update.
- [ ] Save one handoff summary/open item.
- [ ] Validate role visibility for manager, sales, and production users.

If any core check fails, keep fallback process active and delay pilot cutover.
