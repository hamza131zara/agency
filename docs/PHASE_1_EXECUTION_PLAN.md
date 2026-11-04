# Phase 1 — Multi-page Platform Foundation & Experience

**Status:** Implementation pull request open; automated CI passed; owner/manual acceptance remains pending  
**Implementation branch:** `phase1/multipage-foundation`  
**Pull request:** [#14 — Multi-page platform foundation](https://github.com/hamza131zara/agency/pull/14)  
**Latest complete CI run:** [Run #86 — validation and browser/accessibility passed](https://github.com/hamza131zara/agency/actions/runs/41801289514)  
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

The first Phase 1 implementation slice is on the feature branch and open for review. The following work has been implemented:

- Shared page navigation/footer destinations are connected across the platform.
- Home remains an overview and now links visitors to independent platform destinations.
- Six service divisions have an overview and their own detail routes under `services/`.
- About, Approach and Team are separate pages.
- Products and Automation are separate pages with explicit lifecycle labels; planned automation is not represented as operational.
- The homepage has a CSS 3D service constellation. Its six nodes are real HTML links to the dedicated service detail pages. The visual uses no WebGL runtime or external 3D library; the content and navigation remain usable as ordinary HTML.
- Service choices are aligned across Home, Contact, Project Brief Builder, Service Finder and the PHP endpoint allow-list.
- Route validation, sitemap entries, E2E route checks and responsive screenshot coverage include the expanded pages.

The platform currently covers 23 public HTML routes: 12 primary pages, six service detail pages and five project detail pages. The 404 route is included in route validation but is not listed as an indexable sitemap destination.

### Verified engineering evidence

- GitHub Actions run #86 completed with both `validate` and `browser-and-accessibility` jobs passing.
- The run includes Python site validation, JavaScript syntax, PHP lint, the contact endpoint smoke test, Playwright E2E checks, responsive checks at 320/390/768/1440px and automated axe checks.
- The screenshot artifact includes desktop and mobile captures for Home, Services, all six service detail pages, Products, Automation, Work and Contact.
- Desktop/mobile samples from Home, Services, a service detail page, Products and Automation were manually inspected. The remaining page-by-page visual review and manual assistive-technology checks remain open.

### Still required before Phase 1 acceptance

- Complete the manual keyboard, focus order, screen-reader naming, contrast and reduced-motion review across primary journeys.
- Review remaining screenshots/page details and confirm final visual identity and brand assets.
- Confirm and approve public service/team credentials and the project ownership, contribution, stack, status and screenshot claims.
- Finalize Terms and Disclaimer content with the actual legal operator/jurisdiction; do not publish invented legal details.
- Confirm canonical domain, monitored inquiry inbox and verified sender. The sitemap/domain placeholders remain intentionally unresolved.
- Obtain owner approval for the public content and release. Production deployment remains out of scope and unauthorized in this phase.

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
- [ ] Services, Work, About, Approach, Contact and legal destinations are independent pages.
- [x] Products and Automation have dedicated navigation/page destinations; unavailable capabilities are labelled as planned or in development.
- [x] Primary navigation uses independent page destinations; homepage 3D service nodes and service cards link to dedicated service detail pages.
- [x] English-only language policy is applied consistently across the 23 audited routes.

### Content
- [x] Website copy explicitly says the agency can build all kinds of websites/platforms across different technologies.
- [x] Six service divisions are represented consistently across Home, Services, service detail pages and inquiry routes.
- [ ] Project and product status claims are checked.
- [ ] No fabricated client proof, metrics, credentials or testimonials.
- [ ] Any conceptual mockup is labelled illustrative.

### Theme and visuals
- [ ] Shared visual system is consistent across routes.
- [ ] Typography, spacing, colour and interactive states are readable and coherent.
- [x] The homepage CSS 3D service constellation explains the six divisions and links directly to each detail page.
- [x] The 3D effect is progressive CSS only: labels and links remain normal HTML, there is no WebGL dependency, and reduced-motion disables hover transitions.
- [ ] The website remains fully navigable if WebGL is unavailable.
- [ ] Desktop and mobile screenshot review is complete.

### Quality and release
- [x] Automated validation, syntax, PHP contact smoke test, Playwright, responsive and axe checks passed in CI run #86.
- [ ] Keyboard-only navigation and key form flows pass manual tests.
- [x] No critical/high-severity automated accessibility or functional blocker was reported by CI run #86; manual review remains open.
- [ ] Contact behavior continues to report unsent inquiries honestly when delivery is not configured.
- [ ] Owner accepts public identity, claims, visuals and project content.
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
