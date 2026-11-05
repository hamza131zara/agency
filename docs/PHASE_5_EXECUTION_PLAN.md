# Phase 5 — Ready-Made Product Marketplace

**Status:** PLANNING BASELINE — Phase 4 is merged and post-merge CI passed. This document defines Phase 5 scope; implementation begins only after this plan is reviewed and merged.  
**Predecessor:** Phase 4 merged to `main` at `b89adee04b9fe9ebae5e56e01e5cf440605fee9f`; post-merge CI [#42080702755](https://github.com/hamza131zara/agency/actions/runs/42080702755) passed.  
**Language:** English only.  
**Architecture:** Preserve the existing semantic HTML, CSS, browser JavaScript and PHP-compatible static-hosting baseline unless an approved product requirement proves otherwise.

## 1. Objective

Evolve the existing Products page from a project list into a trustworthy product catalogue. Visitors must be able to distinguish public tools, live platforms, development projects and genuinely purchasable/installable software. A product must never be described as ready to buy, install or use unless its actual release, packaging, requirements, licence, support and delivery path have been verified.

Phase 5 is a catalogue and product-readiness phase, not an instruction to build a payment processor, customer account system, download service or licensing backend. Those capabilities remain out of scope unless a later approved plan establishes their security, legal and operational requirements.

## 2. Current baseline

- `products.html` exists and lists STRIDETO, RegexLab, JotJSON, SiteIntel Pulse, Free AI Mixer and Auto-Trading-Agent.
- The current catalogue accurately distinguishes several live/public tools from in-development projects and states that no ready-to-install commercial package is offered.
- Project detail notes are under `work/`; they are portfolio notes, not automatically product detail pages.
- The portfolio inventory and evidence/visual approval model live in `docs/PORTFOLIO_PROJECTS.json` and the Phase 4 evidence governance documents.
- There is no verified product purchase, download, installation, licence activation, customer account, billing or product-support workflow in the current site.
- The current page is a catalogue foundation, not a functioning software marketplace.

## 3. Product classification and initial candidate boundary

Each candidate must have an explicit product type and release state. The Phase 5 inventory must not infer commercial readiness from a public URL or source repository.

| Candidate | Current known state | Phase 5 treatment |
|---|---|---|
| STRIDETO | Live platform; free to use per owner statement | Public platform listing; verify operator, support and current public availability before strengthening claims. Not a downloadable software package. |
| RegexLab | Public browser-based developer tool | Public tool listing; verify live route, actual capabilities and source link. No purchase/install claim. |
| JotJSON | Public browser-based, local-first developer tool | Public tool listing; verify local-processing and data-handling statements against current implementation. No purchase/install claim. |
| SiteIntel Pulse | In development; static showcase is not the full scanner | Development listing only; clearly distinguish static showcase from the separately hosted scanner. No hosted product promise. |
| Free AI Mixer | In development; requires configured provider endpoints/credentials; no hosted demo confirmed | Development listing only; no claim of public hosted generation or included provider access. |
| Auto-Trading-Agent | In development under a separate Solana-only roadmap; not authorized for live trading | Excluded from purchasable/installable listings. Any future mention must retain the non-availability boundary and separate roadmap authorization. |

The first Phase 5 release may legitimately contain zero purchasable products. A truthful public-tools catalogue is preferable to inventing a checkout or saleable package.

## 4. Work packages

### P5.1 — Product inventory and release-readiness model
- Define a structured product record: stable ID/slug, name, category, product type, owner/operator, release state, target user, verified use case, capabilities, exclusions, supported platforms, deployment model, dependencies, data handling, current demo/source, version, last-verified date, support owner and evidence references.
- Add commercial fields only when applicable: distribution format, installation prerequisites, licence model, permitted use, pricing currency/amount, tax/renewal/refund terms, support level, update policy and delivery mechanism.
- Use explicit values such as unknown, not applicable, planned, blocked or verified; never treat a blank field as approval.
- Reconcile the product inventory with the existing portfolio evidence register without conflating a project with a released product.

### P5.2 — Product information architecture and detail-page template
- Define reusable product detail-page sections for overview, audience/use cases, verified features, limitations, availability, requirements, data/security notes, deployment/install steps, licence, pricing, support, version history and changelog.
- Hide or explicitly mark unavailable sections; do not publish placeholder pricing, invented requirements, generic guarantees or unsupported compatibility claims.
- Keep portfolio project notes separate from product documentation and commercial terms.
- Provide clear links to the verified demo, source, documentation or contact route where each exists.

### P5.3 — Catalogue discovery and comparison
- Improve catalogue cards with consistent product type, release status, platform/deployment model and meaningful next action.
- Add search, category/status filters or comparison only where the verified inventory supports useful distinctions.
- Provide accessible keyboard operation, result counts, empty state and reset behavior if interactive filtering is added.
- Do not imply every listing is purchasable; distinguish use-now public tools from development projects and future candidates.
- Keep catalogue copy understandable to non-technical visitors.

### P5.4 — Release, licensing and support governance
- Define a product release checklist and owner sign-off record.
- Require a clean install/deploy test for each distribution target, documented prerequisites, versioned package, integrity/checksum process where relevant, upgrade/rollback notes and support route before an installable claim.
- Require explicit licence text and owner/legal approval before publishing commercial or open-source licence terms.
- Require pricing, billing cadence, currency, tax, refund, renewal and cancellation terms to be approved before displaying a price or accepting payment.
- Require privacy/data-flow review and secret-handling controls before any hosted product collects or processes customer data.
- Keep payment, customer accounts, licence activation, protected downloads and automated fulfilment out of this phase unless separately approved.

### P5.5 — QA and acceptance
- Validate all catalogue and product-detail routes, metadata, local/external links and status labels.
- Test catalogue filtering/search/reset/empty states where implemented.
- Test responsive behavior at 320, 390, 768 and 1440px, keyboard operation and accessibility.
- Verify every product claim against its cited evidence and current product/source state.
- Run exact-head CI, review screenshots and run post-merge CI on `main`.
- Record unresolved owner, legal, support, privacy and operational dependencies as launch gates, not as completed tasks.

## 5. Acceptance criteria

- [ ] Every catalogue entry has a structured, evidence-backed product record and explicit type/status.
- [ ] Product listings distinguish live public tools, hosted platforms, in-development projects and installable software.
- [ ] Every product detail page uses the approved shared information structure or clearly states why the listing remains a limited project/tool note.
- [ ] All feature, compatibility, hosting, data-handling and availability claims are verified.
- [ ] Installation/download claims appear only after a clean installation test and documented prerequisites.
- [ ] Licence and pricing claims appear only after owner/legal approval and complete terms.
- [ ] Support, updates, version and delivery expectations are explicit before commercial release.
- [ ] No unapproved payment, account, licence activation, download or customer-data system is introduced.
- [ ] Responsive, keyboard, accessibility, link and metadata checks pass.
- [ ] Exact-head and post-merge CI pass; owner review and remaining launch dependencies are recorded.

## 6. Explicitly out of scope

- Payment gateway, checkout, subscription billing, tax calculation or refunds.
- Customer authentication, account dashboard or protected download portal.
- Licence-key generation, activation, device limits, DRM or entitlement enforcement.
- Automatic software updates, telemetry or customer usage tracking.
- A CMS/framework migration or new backend solely to make the catalogue appear like a marketplace.
- Publishing Auto-Trading-Agent as a product, authorizing live trading or changing its separate roadmap.
- Fabricating product metrics, testimonials, customer counts, certifications, security audits or compatibility.
- Production deployment, hosting/domain changes or external infrastructure modifications.

## 7. Owner decisions and evidence dependencies

- Confirm the legal seller/operator and whether any candidate is actually intended for paid distribution.
- Confirm which product(s), if any, are authorized for commercial sale in this phase.
- Supply approved licence terms, pricing, support commitments and refund/update policy before publication.
- Confirm current live URLs, supported environments, dependencies and product ownership.
- Approve any screenshots, brand assets, customer names, testimonials or measured outcomes.
- Confirm whether a product processes personal/customer data and provide the accurate data-flow and retention details.

If these decisions or evidence are unavailable, keep the product in its factual public-tool or development state. Do not invent commercial terms to fill the catalogue.

## 8. Delivery sequence

1. Merge this planning baseline.
2. Execute P5.1 inventory and readiness model.
3. Review and merge the inventory before changing public product claims.
4. Execute P5.2 reusable product information architecture.
5. Execute P5.3 catalogue discovery improvements.
6. Execute P5.4 release/licence/support governance.
7. Execute P5.5 automated and human QA; close Phase 5 only after acceptance evidence and post-merge CI.

Each work package is delivered in a separate reviewable PR. The owner reviews and merges PRs; no branch is merged by automation or by the implementation agent.
