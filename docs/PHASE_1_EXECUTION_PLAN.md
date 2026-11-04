# Phase 1 — Multi-page Platform Foundation & Experience

**Status:** Planned / active after documentation baseline  
**Implementation branch:** To be created after documentation review  
**Repository baseline:** `main` at `f147f8dae4f84c1397a40113ee6824f16b1f24ee` when this plan was prepared  
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
- [ ] Home is an overview, not the only substantive page.
- [ ] Services, Work, About, Approach, Contact and legal destinations are independent pages.
- [ ] Products and Automation have dedicated navigation/page destinations when their module release is ready; they must not masquerade as live if still planned.
- [ ] Primary navigation contains no broken or misleading anchor-only destinations.
- [ ] English-only language policy is applied consistently.

### Content
- [ ] Website copy explicitly says the agency can build all kinds of websites/platforms across different technologies.
- [ ] Six service divisions are represented consistently.
- [ ] Project and product status claims are checked.
- [ ] No fabricated client proof, metrics, credentials or testimonials.
- [ ] Any conceptual mockup is labelled illustrative.

### Theme and visuals
- [ ] Shared visual system is consistent across routes.
- [ ] Typography, spacing, colour and interactive states are readable and coherent.
- [ ] At least one selected visual/3D experience adds a clear explanatory or navigation benefit, or its implementation is deferred with a documented reason.
- [ ] 3D has an accessible static fallback and respects reduced motion.
- [ ] The website remains fully navigable if WebGL is unavailable.
- [ ] Desktop and mobile screenshot review is complete.

### Quality and release
- [ ] Existing automated validation, syntax, PHP and Playwright checks pass.
- [ ] Keyboard-only navigation and key form flows pass manual tests.
- [ ] No critical/high-severity accessibility or functional release blocker remains.
- [ ] Contact behavior continues to report unsent inquiries honestly when delivery is not configured.
- [ ] Owner accepts public identity, claims, visuals and project content.
- [ ] Deployment remains deferred until a separate explicit approval.

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
