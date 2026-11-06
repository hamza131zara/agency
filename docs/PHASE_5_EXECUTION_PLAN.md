# Phase 5 — Ready-Made Product Marketplace Execution Plan

**Status:** IN PROGRESS — P5.1 merged and verified on `main` through PR #24; P5.2 product catalogue discovery is implemented on the current review branch; P5.3–P5.5 remain open.  
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

### P5.1 acceptance checklist

- **STRIDETO:** reference hosted platform; not presumed to be an agency resale package.
- **RegexLab:** public browser tool; MIT is stated in its README, but exact license scope, asset rights and redistribution packaging still require review.
- **JotJSON:** public browser tool; README states MIT and local-first behavior, but exact license scope, privacy behavior, asset rights and redistribution packaging still require review.
- **SiteIntel Pulse:** in development; static showcase is not the full scanner. README headline wording that calls it a public live platform conflicts with the documented static-showcase boundary and must be reconciled.
- **Free AI Mixer:** in development; README requires a separately configured scene-generation API. No hosted public demo is confirmed.
- **Auto-Trading-Agent:** excluded and gated by its separate roadmap. This phase must not alter that roadmap or imply customer availability.

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

- [x] Add stable product IDs, category keys and availability states to all six catalogue cards.
- [x] Add category filters for platforms, developer tools, AI/intelligence and research/future systems.
- [x] Add availability filtering for public tools/platforms, in-development projects and unavailable/gated work.
- [x] Add name/description search, live result count, empty state and clear/reset behavior.
- [x] Preserve verified demo/source links and make the distinction between project notes and actual product access explicit.
- [x] Keep Auto-Trading-Agent visible only as a clearly unavailable gated research candidate; do not add buying/installing/trading actions.
- [x] Add Playwright coverage for product card inventory, status/category metadata, combined filters, keyboard activation, empty state and reset.
- [ ] Exact-head `validate` and `browser-and-accessibility` CI checks pass.
- [ ] Owner merges the PR and post-merge `main` CI passes.

## P5.3–P5.5 implementation constraints

- Keep the current site architecture and visual system; improve existing `products.html` rather than replacing the platform.
- Keep project/portfolio attribution boundaries from Phase 4.
- A hosted free tool, source-code repository, static showcase, development project and installable package are different product types and must not share misleading availability labels.
- Do not invent prices, discounts, licence tiers, support SLAs, update guarantees, installation services, screenshots or product outcomes.
- Do not add checkout, payment provider integrations, customer authentication, licence activation, download entitlements or customer workspaces in Phase 5.
- Do not publish Auto-Trading-Agent as purchasable or installable; its separate roadmap remains authoritative.

## Verification and completion policy

Each package is delivered in a focused PR. Required `validate` and `browser-and-accessibility` checks must pass on the exact PR head before merge. After the owner merges, verify post-merge CI on `main` before accepting that package or beginning the next one.

Phase 5 is complete only after P5.1–P5.5 implementation and automated checks are merged, and the manual owner review has been recorded. Product launch remains separately gated by verified ownership, licensing, installation, pricing/support approvals and deployment readiness.
