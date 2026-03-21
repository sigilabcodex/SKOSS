# Security and Portability

SKOSS will store customer information and operational business data. Even for a small-business self-hosted product, that requires a practical security baseline and a trustworthy portability story.

This document keeps that baseline grounded rather than enterprise-heavy.

## Security baseline

SKOSS should aim for sensible default protections without assuming a large IT department.

### Secure authentication

Future implementation should provide:

- reliable sign-in flows
- protection against trivial unauthorized access
- a path for owners to manage user access without excessive complexity

### Safe password handling

Future implementation should:

- store passwords using modern one-way hashing practices
- avoid reversible or plain-text password storage
- support reasonable reset or recovery flows

### Encrypted transport where applicable

When the system is used over a network, especially across the public internet, encrypted transport should be the default expectation.

In practice, that means:

- HTTPS or equivalent secure transport for hosted access
- avoiding designs that normalize sending credentials or sensitive data in the clear

### Role separation

The system should support practical role separation.

This does not require a huge enterprise permission matrix at the start. It does require enough control that:

- not every user sees every administrative function
- operator views stay focused
- sensitive account-management actions are limited appropriately

### Sensible data protection defaults

The product should minimize unnecessary exposure of customer and operational data.

Examples:

- do not surface more personal detail than the workflow needs
- keep audit or change visibility practical where it affects coordination
- avoid making confidential notes broadly visible without reason

## Practical security posture for small self-hosting

Security guidance should remain realistic for small operators.

That means favoring:

- simple deployment patterns that are easier to secure correctly
- clear default configuration
- fewer moving parts to misconfigure
- documentation that explains the basic operational security expectations plainly

## Portability principles

Data portability is part of user trust.

SKOSS should favor:

- **exportability** — useful records can be exported in practical formats
- **backup friendliness** — routine backups are easy to understand and perform
- **recoverability** — a failed server or host should not mean mysterious data loss
- **simple restore paths** — restoration should be possible without reconstructing a complex cloud environment

## Export expectations

Useful export should aim to be:

- practical for owners
- understandable by future maintainers
- human-manageable where possible
- suitable for migration or audit needs

Likely examples later may include:

- structured data exports for key records
- printable or readable operational summaries
- documentation of what an export contains and what it does not

## Backup expectations

A backup story should exist from early implementation, not as a late enterprise add-on.

Desirable properties:

- backups can be created regularly without special expertise
- backups can be stored independently from the running system
- the scope of backup is clear
- restore steps are documented and testable

## Restore and recovery expectations

A good restore path should be:

- explicit
- documented
- possible on modest infrastructure
- understandable by a technically capable operator or helper

The system should avoid designs where recovery depends on hidden managed services or scattered state that is hard to reconstruct.

## Why simple architecture matters here

Simple architecture supports both security and FOSS sustainability.

Benefits include:

- fewer components to secure
- fewer secrets and services to manage
- easier upgrades and patching
- easier backups
- easier onboarding for future contributors
- lower risk of the project becoming maintainable only by a small expert group

For SKOSS, architecture simplicity is not aesthetic minimalism. It is part of being trustworthy and sustainable.

## What remains open

This document does not yet specify:

- exact authentication mechanisms
- exact encryption deployment guidance
- exact backup file formats
- exact audit or retention policy
- exact hosting hardening checklist

Those decisions should follow later technical evaluation, but they should be measured against the principles above.
