# Deployment Modes

This document compares practical deployment modes for SKOSS.

The goal is not to define packaging yet. The goal is to understand the operational tradeoffs that should shape later technical choices.

## Shared assumptions

Across all modes, SKOSS should aim for:

- one understandable application deployment
- modest infrastructure requirements
- clear backup and restore steps
- practical upgrades and rollback paths
- no mandatory dependence on large managed cloud services

## Mode 1: small VPS

A hosted Linux VPS is the most likely default deployment for many small businesses and FOSS self-hosters.

### Typical profile

- one low-cost Linux VM
- public HTTPS access
- app process plus database on the same machine in early stages
- routine backups to independent storage

### Strengths

- easiest way to provide access from anywhere
- no on-site hardware dependency for daily availability
- simple to document as a default deployment path
- good fit for small teams with occasional remote access needs
- upgrades and backups can be centralized

### Weaknesses

- depends on internet quality for day-to-day use
- poor WAN connectivity can hurt operator experience if the app is too round-trip heavy
- a bakery may still need local fallback procedures during internet outages
- public internet exposure raises the importance of secure defaults and updates

### Operational tradeoffs

- easiest shared-access mode
- usually simplest for certificate management and remote support
- requires stronger hosting hygiene than a LAN-only install

### Best fit

- businesses comfortable with hosted software
- teams that want remote access from multiple locations
- early public pilot deployments where central administration matters

## Mode 2: local laptop or local server on LAN

SKOSS runs on-site on a bakery laptop, mini-PC, or small office server, and operators connect over the local network.

### Typical profile

- one local machine hosts the application
- phones and tablets connect through local Wi-Fi
- internet may be optional for daily operation if the local host stays up

### Strengths

- strong resilience against internet outages
- low local latency for operator workflows
- good fit for a single-site bakery or kitchen
- supports operator trust for teams that want local control
- aligns with low-cloud and self-hosting goals

### Weaknesses

- on-site hardware becomes part of the reliability story
- backups may be neglected unless the process is made very explicit
- remote access becomes harder
- local networking, naming, and TLS can be awkward for non-technical users
- power loss or laptop failure can interrupt the whole operation unless backup discipline exists

### Operational tradeoffs

- better day-to-day resilience in poor internet environments
- higher burden for physical device care and local support
- documentation must explain backup, replacement, and restart procedures clearly

### Best fit

- single-site operators with unreliable internet
- teams that strongly prefer local control
- temporary fallback deployments during outages or migration

## Mode 3: future hybrid backup/sync model

A future deployment path where one site can run locally while also backing up to, mirroring to, or selectively syncing with a hosted environment.

This should be treated carefully because "hybrid" can mean very different things.

## Version A: local primary with remote backup

The local server is authoritative and pushes backups or replicas outward.

### Strengths

- preserves local operational resilience
- improves disaster recovery
- avoids some complexity of active multi-master sync

### Weaknesses

- restore and failover procedures must be well defined
- remote backup does not automatically provide hot failover unless designed for it

### Fit

- plausible medium-term direction
- much safer than active bidirectional sync

## Version B: hosted primary with local standby cache or mirror

A hosted system remains authoritative, with some local resilience mechanism added later.

### Strengths

- preserves central management
- may improve disaster recovery or read-local performance

### Weaknesses

- complicated consistency questions
- can drift toward infrastructure complexity quickly

### Fit

- possible later, but not a good early target

## Version C: active bidirectional sync between local and hosted instances

Both environments can accept changes and reconcile later.

### Strengths

- potentially very resilient in theory
- attractive on paper for offline-heavy environments

### Weaknesses

- hardest model by far
- requires conflict semantics at the business-process level
- increases support burden dramatically
- can undermine trust if reconciliation is confusing

### Fit

- not appropriate for v0

## Practical comparison

| Mode | Internet dependence | Local resilience | Remote access | Operational burden | v0 suitability |
| --- | --- | --- | --- | --- | --- |
| Small VPS | High | Low unless extra fallback exists | Strong | Moderate | Strong default |
| Local/LAN server | Low for on-site work | Strong | Weak by default | Moderate | Strong supported mode |
| Hybrid with backup only | Medium | Potentially strong | Medium | Higher | Consider later |
| Hybrid with active sync | Low to medium | Potentially strong | Strong | High | Avoid for v0 |

## Backup and restore considerations by mode

## Small VPS

Needs:

- routine off-machine backups
- documented restore onto a new host
- attention to secure upgrade procedures

## Local/LAN server

Needs:

- automated local plus external backup if possible
- explicit instructions for replacing failed hardware
- simple service restart procedure
- optional export path that an owner can trigger manually

## Hybrid backup model

Needs:

- clear statement of which system is authoritative
- tested recovery drills
- documented failover behavior

## Recommended deployment posture for v0

SKOSS should likely support two practical deployment modes first:

1. **small VPS as the simplest default public deployment**
2. **local/LAN deployment as a first-class supported alternative**

This matches the product goals better than forcing cloud-only assumptions or overcommitting to sync-heavy hybrid operation.

## Why this two-mode stance works

- it covers both always-online and unreliable-internet environments
- it respects small-operator self-hosting preferences
- it keeps implementation pressure focused on one application architecture rather than many infrastructure roles
- it allows the same core product to be evaluated in both hosted and on-premises contexts

## What should wait

The following should remain future work until real usage justifies them:

- automatic bidirectional sync between local and hosted nodes
- active multi-site replication semantics
- complex deployment control planes
- dependency on orchestration platforms that small operators do not need

A good deployment story for SKOSS should feel boring, predictable, and recoverable.
