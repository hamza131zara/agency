# Phase 1 — Multi-page Platform Foundation & Experience

**Status:** Phase 1 implementation is ready for owner review; automated checks and visual review are complete; owner/legal sign-off remains pending  
**Implementation branch:** `phase1/multipage-foundation`  
**Pull request:** [#14 — Multi-page platform foundation](https://github.com/hamza131zara/agency/pull/14)  
**Latest CI:** [Run #150 — validation and browser/accessibility passed on the current PR head](https://github.com/hamza131zara/agency/actions/runs/41812983514)  
**Repository baseline:** Original audit baseline was `main` at `f147f8dae4f84c1397a40113ee6824f16b1f24ee`; documentation PR #13 has since been merged into `main`.  
**Scope:** Website foundation, page hierarchy, shared theme, useful visual experience and verified content  
**Non-goal:** Production launch, paid infrastructure, customer login/checkout or live automation integrations

## 1. Objective

Evolve the existing portfolio site into a polished, genuinely multi-page agency platform. Visitors should understand the agency's six service divisions, inspect selected work, explore the agency's approach and contact the team without relying on a single long homepage.

The public site is English-only. The agency must explicitly state that it builds all kinds of websites and web platforms across different technologies and stacks.

## 2. Current baseline

The repository currently uses semantic HTML, CSS, browser JavaScript and a PHP inquiry endpoint. Its existing routes include:

- Home (`index.html`)
- Services (`services.html`)
- Work (`work.html`)
- About (`about.html`)
- Contact (`contact.html`)
- Privacy (`privacy.html`)
- Project Brief Builder (`brief-builder.html`)
- 404 page (`404.html`)
- Individual project notes under `work/`

Existing capabilities include responsive navigation, service finder, searchable/filterable work catalogue, local project brief generation, contact validation/fallback behavior, metadata templates, security headers and automated checks.

Current gaps from the reviewed source:
- The service taxonomy is narrower than the intended six-division agency offering.
- Some menu destinations are homepage anchors rather than independent platform pages.
- Products and automation are not yet distinct, complete platform modules.
- There is no established interactive 3D system; the current orbit artwork is CSS-based.
- Brand/domain/legal operator details and production deployment remain owner decisions.
- Project visuals and descriptions need continued evidence/approval review.

## 2A. Implementation progress (4 November 2026)

The Phase 1 implementation is on branch `phase1/multipage-foundation` and open as PR #14 against `main`. The completed implementation includes:

- Shared header/footer navigation across the multi-page platform.
- Home is a concise overview, not the entire website.
- Six service divisions on Home and Services, with six standalone detail pages under `services/`.
- Separate About, Approach and Team pages.
- Separate Products and Automation destinations, with truthful lifecycle/status labels.
- A CSS 3D six-discipline service constellation on Home. Its nodes are real HTML links to dedicated service pages; it uses no WebGL runtime or external 3D library.
- Service-specific contact CTAs and consistent categories across Home, Contact, Project Brief Builder, Service Finder and the server-side PHP allow-list.
- Breadcrumbs on all six service detail pages and all five project detail pages.
- Privacy, Terms and Disclaimer draft pages linked in the footer but marked `noindex, nofollow`; the 404 page is also `noindex, nofollow`. All four are excluded from the sitemap. The sitemap has 21 indexable URLs and still needs the owner-approved canonical domain.
- A portfolio evidence register at `docs/PORTFOLIO_CONTENT_EVIDENCE.md`, distinguishing repository-backed facts from owner-provided claims.

### Current route and indexing inventory

- **25 HTML routes are validated:** 14 root pages (including Privacy, Terms, Disclaimer and 404), six service detail pages and five project detail pages.
- **21 URLs are in the sitemap.** Privacy, Terms, Disclaimer and 404 remain outside it until their legal/publication status is approved.
- All routes are English-only, with page-specific titles, descriptions and H1s, checked local links/fragments and unique IDs.
- The 3D CSS visual remains progressively enhanced: its labels and links are normal HTML, no canvas/WebGL is required, reduced-motion is respected, and touch/keyboard interaction is covered by tests.
- The working theme tokens (warm paper, charcoal ink, lime/orange accents, Manrope/DM Mono typography, spacing and radii) are documented and implemented consistently; final official brand/logo approval remains owner-controlled.

### Content and trust review

- Service pages describe scope, capabilities, deliverables and appropriate limitations.
- Product descriptions have been compared with the public project READMEs. SiteIntel Pulse is explicitly described as having a static GitHub Pages showcase while the full scanner runs separately on Node.js. Free AI Mixer is described as requiring a configured generation API. STRIDETO is not described as globally available without evidence.
- Auto-Trading-Agent remains marked in development/unavailable to buy or install; live trading is not authorized.
- No client revenue, usage numbers, ranking guarantees, independent audit claims or other unsupported outcomes have been added.
- Team credentials and size claims remain owner-provided and require approval/consent; see the evidence register.

### Browser and visual evidence

- The latest full-page screenshot artifact captures **all 25 routes at desktop and mobile sizes** (50 captures). The contact sheet and representative full-size Home, Services, service-detail, Products, Automation and Contact captures were reviewed.
- The full contact sheet has been manually reviewed for route/page consistency, responsive layout, visible clipping and navigation hierarchy; representative full-size desktop/mobile captures were also inspected.
- CI covers all 25 routes at 320, 390, 768 and 1440 pixel widths, automated axe checks on all 25 routes, route/navigation/form regressions, breadcrumb behavior, mobile touch activation of the 3D map, keyboard traversal, reduced-motion behavior, service-to-contact preselection, legal noindex/sitemap rules, the 404 noindex rule and a public-content guard against internal release-phase labels.
- Static validation covers nested service pages and project pages, exact English language declarations, page metadata, local links/fragments, non-indexable page rules, JavaScript syntax, PHP lint and the contact endpoint smoke test.

### Remaining acceptance boundary

The implementation cannot truthfully close the final Phase 1 acceptance gate without owner/human inputs:

- Confirm official agency/legal operator name, business address, jurisdiction and official legal contact. Until then, Privacy/Terms/Disclaimer remain drafts and noindex.
- Supply and approve the canonical domain, final brand/logo and social preview assets. The sitemap retains `YOUR-DOMAIN.example` until the domain is known.
- Configure a monitored recipient inbox and verified sender, then perform a real inquiry delivery test. No mail configuration or production inbox was invented.
- Approve public team claims (designer's experience/qualification and e-commerce team size) and any biography/portrait.
- Confirm project ownership, agency contribution, current release status and permission to publish each project screenshot/description.
- Complete a human screen-reader/assistive-technology review and final owner visual/brand sign-off. Automated axe and Playwright checks are not a substitute for that review.
- Obtain owner approval to merge/release. Production deployment, DNS and Hostinger configuration remain outside this phase and have not been performed.

## 3. Work packages

### P1.1 — Content and navigation foundation
- Align the shared header/footer and navigation across every page.
- Create a consistent route hierarchy for Home, Services, Work, Products, Automation, About, Approach, Team, Contact and legal content.
- Remove or replace primary-nav links that point only to homepage anchors when a dedicated page is required.
- Add breadcrumbs on deep pages.
- Ensure every primary route has a useful page, correct title and metadata.
- Keep English as the only public language.

### P1.2 — Agency positioning and service scope
- Update the main value proposition to state that the agency builds all kinds of websites/platforms across different technologies.
- Reflect the six service divisions consistently on Home, Services and Contact.
- Keep details concise on Home and direct visitors to dedicated service pages.
- Clearly distinguish the service divisions from Products and Automation.

### P1.3 — Shared theme and reusable components
- Review current CSS before changing it.
- Define type scale, colour tokens, spacing, layout widths, buttons, cards, forms, status labels, navigation and footer.
- Create reusable page hero, breadcrumb, CTA, feature grid, case-study summary and product summary patterns.
- Ensure responsive behavior and accessibility are part of the component definition.
- Avoid an unnecessary framework rewrite.

### P1.4 — Useful 3D / visual experience
- Select one 3D/interactive experience that materially explains the agency's connected services or delivery system.
- Prototype a static fallback first.
- If a real 3D scene is justified, implement it as a progressive enhancement (candidate: Three.js) without blocking page content.
- Add accessible labels, keyboard/touch support, reset/pause behavior and reduced-motion mode.
- Verify a no-WebGL fallback and mobile performance.
- Avoid decorative 3D on every page.

### P1.5 — Trust and factual content
- Verify the project catalogue, status labels, links, roles and technology claims.
- Mark mockups as illustrative and use production screenshots only after approval.
- Confirm service wording and any public team/credential claims.
- Retain transparent contact and privacy behavior.
- Prepare Terms and Disclaimer pages for review; do not invent legal operator details or jurisdiction.

### P1.6 — QA and review
- Run the existing Python, Node, PHP and Playwright checks.
- Review browser screenshots for every primary route at desktop and mobile sizes.
- Manually test keyboard operation, screen-reader names, contrast, reduced motion and 3D fallback.
- Confirm that no existing feature or form behavior regressed.
- Record findings and fix release-blocking issues before phase acceptance.

## 4. Phase 1 task order

1. Complete the documentation baseline (this change set).
2. Review the documentation branch and approve the route/page inventory.
3. Audit the current shared navigation, CSS components, content and tests against the approved inventory.
4. Implement the shared navigation/page shell and page-level consistency.
5. Implement missing Phase 1 pages or replace anchor-only menu destinations with proper pages.
6. Align service scope and English-only copy.
7. Implement the approved theme foundation and first useful 3D/visual interaction.
8. Verify project facts, statuses and actual links.
9. Run automated checks and manual page review.
10. Submit a Phase 1 acceptance report and pull request.

Do not combine this phase with customer accounts, checkout, payments or live external integrations.

## 5. Acceptance criteria

### Platform structure
- [ ] Website has clear, consistent, usable navigation across dedicated pages.
- [x] Home is an overview, not the only substantive page.
- [x] Services, Work, About, Approach, Contact, Privacy, Terms and Disclaimer have independent destinations; the legal pages remain draft-only until owner/legal approval.
- [x] Products and Automation have dedicated navigation/page destinations; unavailable capabilities are labelled as planned or in development.
- [x] Primary navigation uses independent page destinations; homepage 3D service nodes and service cards link to dedicated service detail pages.
- [x] English-only language policy is applied consistently across the 25 audited routes.

### Content
- [x] Website copy explicitly says the agency can build all kinds of websites/platforms across different technologies.
- [x] Six service divisions are represented consistently across Home, Services, service detail pages and inquiry routes.
- [x] Project/product descriptions and lifecycle labels were compared with public project README evidence and recorded in `docs/PORTFOLIO_CONTENT_EVIDENCE.md`; owner confirmation of public attribution and permission remains required.
- [x] No fabricated client testimonials, metrics or guarantees were introduced. Owner-provided team credentials/size remain separately flagged for approval.
- [x] Conceptual project UI previews are labelled illustrative.

### Theme and visuals
- [x] Shared page shell, navigation, typography, card, breadcrumb and footer patterns are reused across the 25-route platform.
- [x] Full-route desktop/mobile screenshots were visually reviewed as a contact sheet and with representative full-size captures. Final brand/palette approval remains an owner decision.
- [x] The homepage CSS 3D service constellation explains the six divisions and links directly to each detail page.
- [x] The 3D effect is progressive CSS only: labels and links remain normal HTML, there is no WebGL dependency, and reduced-motion disables hover transitions.
- [x] The 3D map has no WebGL dependency; all six nodes are ordinary HTML links and the surrounding content remains available without a 3D runtime.
- [x] Desktop and mobile screenshots were captured and manually reviewed for all 25 HTML routes.

### Quality and release
- [x] Automated validation, syntax, PHP contact smoke test, Playwright, responsive and axe checks passed in CI run #140.
- [ ] Keyboard-only navigation and key form flows pass manual tests.
- [x] No critical/high-severity automated accessibility or functional blocker was reported by CI run #140; manual review remains open.
- [x] Contact flow retains explicit unsent/local-fallback wording when mail is unavailable; automated contact endpoint smoke tests pass. The real inbox delivery test remains an owner configuration step.
- [ ] Owner accepts public identity, claims, visuals and project content after reviewing the evidence register and team-claim permissions.
- [x] Deployment remains deferred until a separate explicit approval.

## 6. Out of scope for Phase 1

- Customer authentication and account management.
- Checkout, payment processing, subscriptions or licence activation.
- Customer-facing workflow execution with real external credentials.
- Social publishing or bulk marketing integrations.
- Admin CMS or complete content-management backend.
- Product downloads or installation claims before product packaging is ready.
- Production domain purchase, DNS changes, Hostinger configuration or deployment.
- A full framework migration solely to support animation or 3D.

## 7. Evidence required for phase completion

The Phase 1 pull request must include:
- Summary of user-visible changes.
- List of changed files.
- Automated test output or CI links.
- Desktop and mobile screenshots.
- Accessibility/manual review notes.
- 3D fallback/reduced-motion verification.
- Known limitations and deferred items.
- Owner decisions still required.
