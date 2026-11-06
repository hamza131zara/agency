# Phase 5 — Ready-Made Product Marketplace Execution Plan

**Status:** IN PROGRESS — P5.1–P5.4 merged and verified on `main`; P5.5 launch-readiness QA is implemented on the current review branch. Publication remains blocked pending owner-supplied domain, legal, inbox, hosting and final review evidence.  
**Master scope:** `docs/PLATFORM_MASTER_PLAN.md` — Phase 5.  
**Review date:** 6 November 2026.

## Purpose and non-negotiable boundaries

Present software products as distinct products rather than portfolio cards. A product listing must explain what it is, who it is for, what is actually available, requirements, installation, licence, pricing (only when approved), support and update policy.

The existence of a source repository, a public demo, or a project note does not mean that a customer-ready commercial package exists. No product may be labelled ready-to-install until packaging, prerequisites, licensing, installation instructions, clean-install verification, support and update policy are evidenced.

This phase does not authorize checkout, payment processing, licence activation, customer accounts, downloads, or production deployment. Those belong to Phase 7 or the release/deployment phase and require separate approval. Do not purchase services, connect credentials or send external communications.

## Package sequence

| Package | Purpose | Main outputs | Exit gate |
|---|---|---|---|
| P5.1 | Product inventory, ownership and release-readiness audit | `docs/PRODUCT_CATALOGUE_READINESS.json`; evidence-backed candidate dispositions | Every candidate has an evidence boundary, release state, licensing/install/support/pricing gaps and next decision |
| P5.2 | Product catalogue and category discovery | Improved products catalogue, categories, filters and truthful status presentation | Catalogue only presents approved candidate facts and clearly distinguishes hosted tools from installable products |
| P5.3 | Reusable product detail pages | Product detail page structure for approved candidates | Each page explains audience, features, constraints, availability, requirements and evidence-backed links |
| P5.4 | Product submission/review and release information | Submission checklist, version/change history, installation/licence/support/update sections | No release or commercial terms appear without owner approval and evidence |
| P5.5 | QA and acceptance | Responsive, accessibility, link, content and browser tests; final acceptance record | Automated checks pass and owner/manual review gates are recorded |

## P5.1 — Inventory and readiness audit

The normalized register currently covers six candidates. P5.1 merged through PR #24 at `fbfb36e510eb8d92aab1b1dd80cfdea7390aa634`; post-merge CI [#42175498028](https://github.com/hamza131zara/agency/actions/runs/42175498028) passed both required jobs.

### Initial candidate disposition

- **STRIDETO:** reference hosted platform; not presumed to be an agency resale package.
- **RegexLab:** public browser tool; MIT is stated in its README, but exact license scope, asset rights and redistribution packaging still require review.
- **JotJSON:** public browser tool; README states MIT and local-first behavior, but exact license scope, privacy behavior, asset rights and redistribution packaging still require review.
- **SiteIntel Pulse:** in development; static showcase is not the full scanner. README headline wording that calls it a public live platform conflicts with the documented static-showcase boundary and must be reconciled.
- **Free AI Mixer:** in development; README requires a separately configured scene-generation API. No hosted public demo is confirmed.
- **Auto-Trading-Agent:** excluded and gated by its separate roadmap. This phase must not alter that roadmap or imply customer availability.

### P5.1 acceptance checklist

- [x] Six candidates recorded with source repository and reviewed README commit.
- [x] Hosted/public-tool/development/excluded states distinguished.
- [x] Licence evidence separated from verified redistribution permission.
- [x] Installation evidence separated from developer setup instructions.
- [x] Pricing, support and update policy gaps recorded without inventing commercial terms.
- [x] SiteIntel Pulse availability wording conflict identified.
- [x] Ready-to-install gate and follow-up evidence actions documented.
- [ ] Owner confirms ownership/control and which candidates may be offered by the agency.
- [ ] Exact LICENSE files, notices and third-party asset/provider terms reviewed before any distribution.
- [ ] Live URLs and application behavior rechecked independently before public availability claims.

The unchecked owner/legal/operational items are explicit release gates; they are not silently treated as passed by repository documentation.

## P5.2 — Product catalogue and category discovery

**Implementation branch:** `phase5/p5-2-product-catalogue-discovery`.  
**Accepted:** PR #25 merged at `7159084d449891835eff2a6202630fca945a05a0`; post-merge CI [#42179451016](https://github.com/hamza131zara/agency/actions/runs/42179451016) passed both required jobs.

- [x] Add stable product IDs, category keys and availability states to all six catalogue cards.
- [x] Add category filters for platforms, developer tools, AI/intelligence and research/future systems.
- [x] Add availability filtering for public tools/platforms, in-development projects and unavailable/gated work.
- [x] Add name/description search, live result count, empty state and clear/reset behavior.
- [x] Preserve verified demo/source links and distinguish project notes from product detail information.
- [x] Keep Auto-Trading-Agent visible only as a clearly unavailable gated research candidate; do not add buying/installing/trading actions.
- [x] Add Playwright coverage for product card inventory, status/category metadata, combined filters, keyboard activation, empty state and reset.
- [x] Exact-head `validate` and `browser-and-accessibility` checks passed.
- [x] Owner merged PR #25; post-merge `main` CI passed.


## P5.3–P5.5 implementation constraints

- Keep the current site architecture and visual system; improve existing `products.html` rather than replacing the platform.
- Keep project/portfolio attribution boundaries from Phase 4.
- A hosted free tool, source-code repository, static showcase, development project and installable package are different product types and must not share misleading availability labels.
- Do not invent prices, discounts, licence tiers, support SLAs, update guarantees, installation services, screenshots or product outcomes.
- Do not add checkout, payment provider integrations, customer authentication, licence activation, download entitlements or customer workspaces in Phase 5.
- Do not publish Auto-Trading-Agent as purchasable or installable; its separate roadmap remains authoritative.

## P5.3 — Reusable product detail pages

**Implementation branch:** `phase5/p5-3-product-detail-pages`.  
**Accepted:** PR #26 merged at `301b01ca4cb4b196b83b2881eea7250a86b10b02`; post-merge CI [#42196381737](https://github.com/hamza131zara/agency/actions/runs/42196381737) passed both required jobs.

- [x] Add one reusable semantic product-detail structure for the five public catalogue candidates: STRIDETO, RegexLab, JotJSON, SiteIntel Pulse and Free AI Mixer.
- [x] Include overview, audience, documented capabilities, evidence source, availability/limitations, data/security notes, operating and installation requirements, version/change-history state, licence, price, support and update-policy information.
- [x] Separate product-detail pages from Phase 4 project notes and link between them without treating portfolio notes as installation documentation.
- [x] Keep SiteIntel Pulse's static showcase distinct from its full scanner and Free AI Mixer's separately configured API dependency explicit.
- [x] Preserve STRIDETO's hosted-service/source-code distinction and qualify README license statements for RegexLab/JotJSON.
- [x] Leave Auto-Trading-Agent without a product detail route; retain the not-available research card and its separate roadmap boundary.
- [x] Connect the five eligible catalogue cards to product-detail pages, register the routes in site validation, browser tests and sitemap.
- [x] Exact-head `validate` and `browser-and-accessibility` checks passed; owner merged the PR and post-merge `main` CI passed.



## P5.4 — Product submission, release and commercial governance

**Implementation branch:** `phase5/p5-4-release-commercial-governance`.  
**Accepted:** PR #27 merged at `dea8a92d4bb1d154171692803f6be26b22253f21`; post-merge CI [#42220387993](https://github.com/hamza131zara/agency/actions/runs/42220387993) passed both required jobs.

- [x] Define the release/publication lifecycle, evidence standards, owner authority, copy/asset permissions, licence/third-party review, technical release artifact, privacy/security, support/update and withdrawal requirements in `docs/PRODUCT_RELEASE_GOVERNANCE.md`.
- [x] Add a six-product structured approval register at `docs/PRODUCT_RELEASE_GOVERNANCE.json`; all release and commercial approvals are currently explicitly unapproved/not recorded.
- [x] Add per-submission review steps and evidence fields in `docs/PRODUCT_SUBMISSION_CHECKLIST.md`.
- [x] Add a versioned product changelog/release template in `docs/PRODUCT_CHANGELOG_TEMPLATE.md`; no release versions or dates are fabricated.
- [x] Add `scripts/validate_product_release_governance.py` and a required CI step. The validator prevents `readyToInstall=true` or commercial approval until all applicable gates and evidence fields pass.
- [x] Add visible release-decision disclosures to each of the five product detail pages.
- [x] Add Playwright coverage to ensure the release decision is visible and no unapproved buy/install action appears.
- [x] Exact-head `validate` and `browser-and-accessibility` checks passed; owner merged the PR and post-merge `main` CI passed.

No product is being approved for installation, resale or commercial sale in P5.4. This package establishes the decision and evidence controls; actual product release remains blocked until the owner and technical/legal checks are completed.

## P5.5 — Quality and acceptance

**Implementation branch:** `phase5/p5-5-launch-readiness-qa`.

- [x] Add a structured `docs/LAUNCH_APPROVALS.json` register; no domain, legal identity, inbox or deployment values are invented.
- [x] Add `docs/LAUNCH_READINESS_CHECKLIST.md` for the 7 November 2026 launch target.
- [x] Add `scripts/validate_launch_readiness.py` with report-only CI mode and strict deployment-gate mode (`--strict`).
- [x] Verify the sitemap should contain exactly the 26 indexable routes; legal drafts and 404 remain noindex and excluded.
- [x] Add launch blocker reporting to CI and Python compilation.
- [x] Update the Hostinger runbook and README with the launch preflight process.
- [ ] Run exact-head `validate` and `browser-and-accessibility` checks and resolve any failures.
- [ ] Complete owner legal/brand/contact/hosting inputs and final manual reviews.
- [ ] Run `python scripts/validate_launch_readiness.py --strict` successfully after production evidence is recorded.
- [ ] Owner merges the PR and post-merge `main` CI passes.
- [ ] Deploy only after explicit owner approval and successful production smoke tests.

**Known publication blockers at implementation start:** canonical domain is a placeholder; legal pages are draft/noindex; monitored inbox and verified sender are not supplied; private Hostinger mail configuration, SSL/redirect checks, backup, production deployment and owner final approval are not recorded. The catalogue itself remains intentionally non-transactional and does not advertise products for sale/install.

## Verification and completion policy

Each package is delivered in a focused PR. Required `validate` and `browser-and-accessibility` checks must pass on the exact PR head before merge. After the owner merges, verify post-merge CI on `main` before accepting that package or beginning the next one.

Phase 5 is complete only after P5.1–P5.5 implementation and automated checks are merged, and the manual owner review has been recorded. Product launch remains separately gated by verified ownership, licensing, installation, pricing/support approvals and deployment readiness.
