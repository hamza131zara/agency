# Phase 1 Acceptance — Multi-page Platform Foundation

Phase 1 is the current website foundation release gate. It expands the original portfolio scope into a coherent, English-only, multi-page agency platform. A checklist item is complete only when its implementation and evidence exist.

## Existing implementation baseline

- [x] Responsive Home, Services, Work, About, Contact and Privacy pages exist.
- [x] Project detail pages exist under `work/`.
- [x] Project showcases include public source links for verified repositories where available.
- [x] Service Finder and searchable/filterable portfolio explorer exist.
- [x] Project Brief Builder creates a local structured draft and supports copy, text download, JSON export and browser print/Save as PDF without automatic server submission.
- [x] Contact inquiry validation, CSRF/session token, same-origin check, honeypot and basic per-session throttling exist.
- [x] Contact endpoint refuses success when the inbox is not configured or mail is rejected.
- [x] Contact page provides local copy/download fallback when delivery is unconfigured/unreachable.
- [x] Metadata, favicon, sitemap/robots template, 404 page and security headers exist.
- [x] CI checks validate site files/links, JavaScript/PHP syntax and contact behavior.
- [x] Playwright coverage includes routes, mobile navigation, responsive behavior, contact failure states, portfolio explorer and project-brief flow.
- [x] Automated axe scans cover serious/critical WCAG 2.1 A/AA issues; this is not proof of full WCAG conformance.

## Documentation baseline

- [ ] Review and approve `docs/PLATFORM_MASTER_PLAN.md`.
- [ ] Review and approve `docs/INFORMATION_ARCHITECTURE.md`.
- [ ] Review and approve `docs/VISUAL_DESIGN_3D_STANDARD.md`.
- [ ] Review and approve `docs/DELIVERY_METHODOLOGY.md`.
- [ ] Review and approve `docs/PHASE_1_EXECUTION_PLAN.md`.
- [ ] Review and approve `docs/PRODUCT_AUTOMATION_GOVERNANCE.md`.

## Phase 1 implementation acceptance

### Multi-page architecture
- [ ] Shared header/footer and navigation are consistent on all public routes.
- [ ] Home works as an overview and routes visitors to dedicated platform sections.
- [ ] Services, Work, About, Approach, Contact and required legal pages have meaningful independent destinations.
- [ ] Primary navigation has no misleading anchor-only destinations where a dedicated page is required.
- [ ] Products and Automation are shown as distinct modules; unavailable modules are clearly labelled planned rather than presented as live.
- [ ] Breadcrumbs and page-level navigation are clear on deeper pages.
- [ ] Every page has a unique title, description, H1 and correct English language declaration.
- [ ] No second-language interface, translated content or language selector has been introduced.

### Positioning and services
- [ ] Public copy explicitly states the agency builds all types of websites and web platforms across different technologies.
- [ ] All six service divisions are reflected consistently.
- [ ] Each main service overview routes to a detail page or is visibly identified as pending.
- [ ] Service descriptions explain deliverables in plain language.
- [ ] Team size, years of experience, qualifications and other personal/business claims are verified and approved before publication.

### Theme and 3D
- [ ] Shared type, colour, spacing, layout and component tokens are documented and implemented.
- [ ] The visual identity is consistent across main routes.
- [ ] The 3D/interactive visual has a clear explanatory or navigation purpose.
- [ ] A static fallback preserves essential information when WebGL is unavailable.
- [ ] Keyboard, touch, reduced-motion and reset/pause behaviors are tested where applicable.
- [ ] 3D assets are loaded progressively and do not block navigation or essential page content.
- [ ] Desktop and mobile screenshots have been manually reviewed.

### Truth, safety and trust
- [ ] Project ownership, contribution, status, public URLs and technology claims are checked.
- [ ] Conceptual UI visuals are labelled illustrative.
- [ ] No invented client testimonials, metrics, credentials or guarantees appear.
- [ ] Contact delivery status remains honest and no inquiry is reported as sent without server confirmation.
- [ ] Privacy content reflects actual data handling and real operator details.

### Quality
- [ ] Python site validation passes.
- [ ] JavaScript syntax check passes.
- [ ] PHP lint checks pass.
- [ ] Contact endpoint smoke test passes without sending real email.
- [ ] Playwright E2E, responsive and accessibility tests pass.
- [ ] Manual keyboard, focus, screen-reader naming, contrast and reduced-motion review is recorded.
- [ ] No critical/high-severity functional or accessibility blocker remains.

## Owner input before public launch

- [ ] Confirm official agency name, brand mark and final visual identity.
- [ ] Confirm canonical domain; do not invent or use placeholder domains as production URLs.
- [ ] Approve the final public description and service claims.
- [ ] Verify project contributions, statuses, stacks, screenshots and links.
- [ ] Approve team profiles and professional credentials.
- [ ] Confirm legal operator, jurisdiction, privacy and terms wording.
- [ ] Configure the monitored inquiry inbox and verified sender on the final domain.
- [ ] Approve the release and deployment plan.

## Explicitly out of scope for Phase 1

- Customer authentication and dashboards.
- Checkout, payment processing, subscriptions, product licence activation.
- Live customer-facing automation integrations or external account connections.
- Production social publishing and bulk workflow execution.
- Full admin CMS/content-management backend.
- Product installation claims until packaging and clean-install tests exist.
- Domain purchase, DNS changes, Hostinger publishing and production deployment.

## Completion evidence

The Phase 1 pull request must include the changed-file summary, passing CI links, desktop/mobile screenshots, manual accessibility/interaction notes, 3D fallback/reduced-motion evidence, known limitations and recorded owner approvals.
