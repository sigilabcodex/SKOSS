# Deployment Principles

SKOSS should remain practical to run for small operators and sustainable to maintain as a FOSS project.

This document describes deployment and architecture preferences without prematurely choosing a full stack.

## Goals

SKOSS should aim to be deployable on modest infrastructure.

Preferred targets include:

- low-spec Linux VPS
- self-hosted small server
- local office or kitchen machine where practical
- possibly shared hosting if the final shape allows it

Shared hosting should be treated as a design preference for simplicity, **not** as a guaranteed compatibility target.

## SKOSS and SKOSSina in deployment terms

Deployment language should distinguish between:

- **SKOSS** as the core server-side system that stores data, coordinates workflows, and serves clients
- **SKOSSina** as the worker-facing client layer that reaches SKOSS through browser access first and possibly packaged forms later

This distinction helps keep deployment choices simple:

- most deployments should install and maintain one SKOSS core
- many devices should be able to use SKOSSina against that same core
- client packaging choices should not force premature backend fragmentation

## Why lightweight deployment matters

Many small food businesses:

- do not want complicated cloud bills
- may rely on a local technician, a friend, or self-hosting
- need software that can survive modest budgets and simple operations
- may trust a system more if they can run and back it up themselves

A product that only works with heavy managed infrastructure will exclude part of the audience SKOSS is meant to serve.

## Primary mode: VPS or small hosted server

The main expected mode is a straightforward server-hosted deployment reachable over the network.

Desired characteristics:

- simple install path
- modest RAM and CPU expectations
- clear backup story
- manageable upgrades
- good performance over ordinary business internet connections
- straightforward access for SKOSSina from phones, tablets, and desktops

## Secondary mode: local-capable deployment

SKOSS should also leave room for local deployment modes.

Examples:

- a laptop temporarily hosts the system on the bakery network
- a small office mini-PC acts as the local server
- a low-spec machine on the premises serves phones and tablets over Wi-Fi
- printers on the same LAN can support ticket and label workflows more directly

This is especially relevant where:

- internet access is unstable
- teams prefer to keep operations on-site
- temporary fallback hosting is valuable during outages or migration
- local kitchen hardware matters to the workflow

## Local network mode concept

A useful local-network mode would allow devices on the same network to reach the system even if external connectivity is poor.

This does **not** require promising full offline synchronization yet.

It does suggest that future design should consider:

- straightforward local deployment
- URLs or addressing that can work inside a local network
- workflows that remain understandable when internet quality drops
- architecture that does not assume all traffic must route through external cloud services
- lightweight SKOSSina behavior when several workers connect to the same on-site host
- practical printer access patterns for kitchens, counters, and packing areas

## Offline-aware future direction

Offline support is desirable, but it is a hard problem.

The project should be honest about the phases.

### Near-term expectation

- server-hosted operation is the baseline
- degraded network handling should be considered in UX and architecture
- local-network deployment should remain possible
- SKOSSina should communicate clearly about stale state or reconnects instead of hiding them

### Future direction

- selective offline-capable behavior
- degraded-mode operation when internet is unstable
- clearer sync and conflict rules only when real workflows prove what is needed
- possible PWA or packaged-client behaviors only where they genuinely improve resilience or hardware integration

The project should avoid overengineering offline sync before the core workflows and data model are stable.

## Printing as a deployment concern

Printing should be considered part of the deployment story, not just a UI feature.

Deployment planning should leave room for:

- paper ticket output in kitchen or packing areas
- receipt and ticket printers near front-of-house stations
- label printers for trays, dough, boxes, or packaged goods
- print-friendly browser and future app workflows
- future compatibility with common thermal-printer or label-printer scenarios without committing to one vendor stack too early

## Simplicity as an architecture constraint

Future implementation choices should be judged partly by whether they preserve lightweight deployment.

Questions to keep asking:

- does this add mandatory infrastructure pieces?
- does this make low-spec hosting unrealistic?
- does this make local deployment much harder?
- does this create operational fragility for small self-hosted users?
- does this make SKOSSina heavier than the worker experience needs?

Simple architecture is not only a developer preference here. It is part of product fit.

## Backup expectations

Deployment should make backups easy and dependable.

At a minimum, the eventual system should aim for:

- straightforward database backup
- exportable key records in practical formats
- a restore path that does not require heroic debugging
- enough clarity that a small operator or helper can understand what to save

## Portability expectations

SKOSS should not trap users in opaque hosting or tightly coupled infrastructure.

Desirable properties:

- practical data export
- minimal infrastructure lock-in
- ability to move between hosted and self-hosted environments
- clear upgrade and rollback behavior where feasible
- one SKOSS core able to keep serving browser-first SKOSSina clients in either mode

## What this document does not do

This document does **not** yet choose:

- a framework
- a database
- a transport protocol
- a deployment packaging format
- a printer integration stack
- an offline sync model

Those decisions should be evaluated later against the principles above.
