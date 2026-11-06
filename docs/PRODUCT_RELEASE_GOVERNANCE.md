# Product Submission, Release & Commercial Governance

**Policy version:** 1.0  
**Review date:** 6 November 2026  
**Applies to:** Product catalogue cards, product detail pages, hosted tools, downloadable distributions and any future commercial offer.

## 1. Purpose and authority

This policy defines the evidence and approval required before a product may be represented as a public release, a ready-to-install package or a paid offer. It is a publication and release control, not a legal opinion or an approval by itself.

The structured source of truth is `docs/PRODUCT_RELEASE_GOVERNANCE.json`. Every product must have one record. The register must match the visible public status. An unknown or unrecorded decision is not an approval.

A repository README, GitHub release, public demo, internal project note or passing CI run can provide evidence about code or a tested build. None alone proves agency ownership, redistribution rights, operational readiness, support capacity, customer terms or commercial authority.

## 2. Product submission workflow

Every new or materially changed product is submitted with:

1. Product identity: stable ID, name, owner/operator, category and intended audience.
2. Product type: hosted public tool, hosted service, source-only project, installable package, private deployment or development preview.
3. Evidence: source repository and reviewed commit, live URL and test date, architecture and data-flow notes, dependencies and third-party services.
4. Release proposal: target version, artifact format, platforms/runtimes, prerequisites, installation and upgrade process, rollback plan and known limitations.
5. Trust material: licence scope, third-party notices, brand/visual permissions, privacy/security review, data retention and deletion behavior.
6. Operational proposal: support owner and channel, response expectations, update policy, compatibility window, end-of-life and incident route.
7. Commercial proposal, only when requested: price/currency, billing model, applicable tax treatment, refunds, cancellations, renewals, transfer/seat/install limits and permitted use.

Submission does not mean acceptance. A named reviewer records each decision with its evidence before publication.

## 3. Lifecycle and publication labels

Use these labels precisely:

| State | Public meaning | Minimum basis |
|---|---|---|
| Planned | Idea or roadmap item | No usable release is implied |
| In development | Active work; not a customer-ready release | Current implementation/known blockers are described |
| Preview / Beta | Restricted test use with explicit limitations | Audience, duration, known issues and data handling are approved |
| Public tool | Public browser destination exists | Destination and actual behavior checked; this does not imply installability or paid support |
| Hosted service | Operator provides a hosted application | Runtime, operator, service availability and terms are confirmed |
| Ready to install | Customer can install/deploy a specific version | All install/release gates in section 5 pass |
| Commercially available | A specific offer may be purchased | Ownership, rights, approved price and customer terms plus actual fulfilment are ready |
| Maintenance / Retired | Existing release is limited or withdrawn | Migration, support and retirement information are approved |

Do not use “Live”, “Ready to install”, “Download”, “Buy”, “Supported” or “Production-ready” as interchangeable labels. State exactly what a visitor can access.

## 4. Evidence and approval records

Each approval record in `PRODUCT_RELEASE_GOVERNANCE.json` must identify:

- Approver name/role and authority to approve.
- Decision and exact scope (product, version, copy claim, asset, licence, channel or commercial terms).
- Date/time and review outcome.
- Evidence location (immutable URL, PR/commit, signed approval or controlled document).
- For a binary/package: version, filename, platform, SHA-256 digest, build source and build date.
- For a screenshot/logo: exact asset, source/rights holder, approved derivative, allowed channels and edits, sensitive-data inspection and withdrawal/expiry conditions.
- For a claim or metric: source, measurement definition, period, reviewer and exact approved wording.

Do not record a blanket “approved” decision for unspecified future assets or releases. Permissions are asset-, version- and channel-specific.

## 5. Ready-to-install release gate

A product cannot be labelled ready to install until every applicable item is complete:

- Ownership/operator authority is recorded.
- Public product copy and screenshots/brand assets have exact-scope approval.
- Licence text and scope have been reviewed; copyright notices, dependencies, bundled assets, SDKs, fonts, datasets and provider/model terms are accounted for.
- Privacy and security review covers data flows, secrets, storage, access control, logging, backups, deletion, vulnerabilities and any third-party processing.
- A versioned distribution artifact exists, is built from a recorded commit and has a checksum or equivalent integrity reference.
- Supported operating systems, browser/runtime, dependencies, resources, network requirements and external services are documented.
- Installation/deployment, configuration, environment variables and secret provisioning are documented safely.
- An independent clean-environment installation/deployment test passes for the stated target.
- Upgrade, migration, backup/restore and rollback procedures are documented and tested where relevant.
- Version number, release date, compatibility notes and a user-readable change history are published.
- A support owner, contact route, coverage/response expectation and escalation process are approved.
- An update and security-patch policy is approved.
- A final release decision is recorded for the exact version and artifact.

A public browser tool can remain available as a hosted/free tool without meeting this installable-package gate. In that case, show its hosted access model, but do not imply a downloadable or self-hosted distribution.

## 6. Commercial offer gate

No price, “Buy” control, subscription, paid support or commercial availability may be published until:

- The owner confirms authority to sell or license the exact product and included assets.
- Licence and third-party rights allow the offer and distribution model.
- Amount, currency, billing cadence and what is included are approved.
- Tax/invoice, refund, cancellation, renewal, transfer, seats and installation limits are reviewed for the relevant markets.
- Support scope, response expectations, maintenance, compatibility and end-of-life terms are approved.
- The fulfilment path is operational and tested.

Phase 5 does not build checkout, payments, customer accounts, licence activation, protected downloads or automatic fulfilment. Those remain later-phase scope. Do not add a purchase CTA simply because a price field exists.

## 7. Privacy, security and provider controls

For hosted or connected products, document data categories, purpose, destination, retention period, deletion behavior and subprocessors/providers. Keep API keys, signing keys, database credentials and payment secrets on trusted server-side systems. Never place secrets in browser bundles, public JSON, screenshots or repository history.

AI/model/provider products must document provider terms, model limitations, prompt/input handling, output ownership caveats, rate limits, usage costs, fallback behavior and how provider credentials are provisioned. Do not promise that provider costs are included unless an approved commercial offer says so.

## 8. Version and change-history policy

Use semantic versioning only where the product's versioning model supports it. Every published release entry identifies version, date, status, compatibility, migration action and user-visible changes. Separate Added, Changed, Fixed, Security and Deprecated entries. Do not backfill invented release dates or imply a versioned customer release based only on a repository README.

The template is `docs/PRODUCT_CHANGELOG_TEMPLATE.md`. Unreleased development notes must not be represented as shipped releases.

## 9. Current register disposition — 6 November 2026

- **STRIDETO:** hosted reference only; not an agency resale package. Confirm operator authority and service terms separately.
- **RegexLab / JotJSON:** public browser tools. README licence statements require exact text, dependency and asset review; no commercial distribution package is approved.
- **SiteIntel Pulse:** in development. Static showcase is not the full scanner; production hosting, data/privacy/security, tenancy and install process remain unresolved.
- **Free AI Mixer:** in development. A separately configured generation API, provider terms/cost controls and secure credential flow are required; no hosted public demo is approved.
- **Auto-Trading-Agent:** excluded from this marketplace and governed by its separate roadmap.

The structured register currently marks all products not ready to install and not approved for commercial sale.

## 10. Change control and withdrawal

A change to ownership, licensing, provider, binary, installation requirements, data handling, price, support scope or customer terms triggers a review. Withdraw or qualify a public claim when its evidence expires or a dependency/service changes. A security issue may require immediate release withdrawal and a customer notice under the approved incident process.

## 11. Approval record template

Use `docs/PRODUCT_SUBMISSION_CHECKLIST.md` for each submission and attach exact evidence. The release register is updated only after the relevant reviewer has made and recorded a decision.
