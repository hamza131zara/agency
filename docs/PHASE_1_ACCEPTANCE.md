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

The documentation set has been added/updated and merged through PR #13. These boxes are owner review/approval items, not checks that the files exist.

- [ ] Review and approve `docs/PLATFORM_MASTER_PLAN.md`.
- [ ] Review and approve `docs/INFORMATION_ARCHITECTURE.md`.
- [ ] Review and approve `docs/VISUAL_DESIGN_3D_STANDARD.md`.
- [ ] Review and approve `docs/DELIVERY_METHODOLOGY.md`.
- [ ] Review and approve `docs/PHASE_1_EXECUTION_PLAN.md`.
- [ ] Review and approve `docs/PRODUCT_AUTOMATION_GOVERNANCE.md`.

## Phase 1 implementation acceptance

### Multi-page architecture
- [x] Shared header/footer and navigation destinations are connected across all 25 HTML routes.
- [x] Home works as an overview and routes visitors to dedicated platform sections.
- [x] Services, Work, About, Approach, Contact, Privacy, Terms and Disclaimer have meaningful independent destinations; all legal pages remain draft-only/noindex until operator and jurisdiction details are approved.
- [x] Primary navigation uses independent page routes; 3D map and service cards lead to six dedicated service detail pages.
- [x] Products and Automation are distinct pages; unavailable tools are clearly labelled in development or planned.
- [x] Breadcrumbs are present on all six service detail pages and all five project detail pages, with working parent links.
- [x] All 25 public HTML routes pass the validator for metadata, H1, English language declaration, unique IDs/titles and local links/fragments.
- [x] No second-language interface, translated content or language selector has been introduced.

### Positioning and services
- [x] Public copy explicitly states the agency builds all types of websites and web platforms across different technologies.
- [x] All six service divisions are reflected consistently across the homepage, Services, detail pages and inquiry taxonomy.
- [x] Each main service overview routes to its own dedicated service detail page.
- [x] Each of the six service detail pages explains its plain-language scope, capabilities, deliverables, suitability and service-specific contact path.
- [ ] Team size, designer experience/qualification and other personal/business claims are owner-provided; obtain the relevant person's/team lead's approval and permission before final publication.

### Theme and 3D
- [ ] Shared type, colour, spacing, layout and component tokens are documented and implemented.
- [ ] The visual identity is consistent across main routes.
- [x] The 3D/interactive visual explains the six service divisions and provides direct navigation to their detail pages.
- [x] The CSS perspective visual has no WebGL dependency; essential labels and links are normal HTML and remain usable without a 3D runtime.
- [x] Keyboard traversal of all six service nodes, touch activation in a real touch-enabled mobile context and reduced-motion transition behavior are covered by Playwright. Reset/pause controls are not applicable because this constellation has no continuous animation or user-controlled rotation.
- [x] No external 3D assets or runtime are required; the 3D styling is progressive enhancement and does not block navigation.
- [x] Desktop and mobile screenshots for all 25 routes were captured and manually reviewed (full contact sheet plus representative full-size captures).

### Truth, safety and trust
- [x] Public repository READMEs and project status descriptions were reviewed and recorded in `docs/PORTFOLIO_CONTENT_EVIDENCE.md`. [ ] Owner must still approve agency contribution/attribution, project screenshot permissions and external URL availability.
- [x] Conceptual UI previews and case-study artwork are labelled illustrative.
- [x] No invented client testimonials, business metrics, security audit claims or ranking guarantees appear. Owner-provided team claims remain subject to approval.
- [x] Contact status reflects server mail acceptance only; local copy/download fallbacks explicitly do not submit. Real inbox delivery verification remains pending inbox configuration.
- [x] The draft Privacy notice reflects the current PHP/session/form/local-brief behavior. [ ] Legal operator, jurisdiction, mail-provider/host arrangements and official contact details must be confirmed before it can be approved or indexed.

### Quality
- [x] Python site validation passes in the latest branch-head CI run.
- [x] JavaScript syntax check passes in the latest branch-head CI run.
- [x] PHP lint checks pass in the latest branch-head CI run.
- [x] Contact endpoint smoke test passes without sending real email in the latest branch-head CI run.
- [x] Playwright E2E, responsive and automated axe checks cover all 25 routes; responsive widths are 320/390/768/1440px. Suite includes mobile 3D-map touch, keyboard/reduced-motion, breadcrumb, service-to-contact, legal-policy and 404 noindex/sitemap checks (latest branch-head CI).
- [ ] Manual keyboard, focus, screen-reader naming, contrast and reduced-motion review is recorded.
- [x] No critical/high-severity automated functional/accessibility blocker was reported in CI run #86; manual review remains open.

## Owner input and manual acceptance before public launch

- [ ] Complete human keyboard/screen-reader review of header, menus, filters, forms and project brief flow. Automated keyboard checks cover the mobile menu, skip link, 3D-map node traversal and touch navigation.
- [ ] Complete human screen-reader naming/reading-order review and any remaining manual contrast/reduced-motion review; automated axe/Playwright coverage is not a substitute.
- [x] Review the latest all-route desktop/mobile screenshot contact sheet and representative full-size captures. [ ] Owner still approves final visual identity/brand assets.
- [ ] Owner confirms project ownership, agency contribution/attribution, technologies, external link uptime and permissions to publish screenshots. Repository-backed product descriptions are registered in `docs/PORTFOLIO_CONTENT_EVIDENCE.md`.
- [ ] Approve public team claims (including the designer's experience/qualification and e-commerce team size) before publication.
- [ ] Finalize Privacy, Terms and Disclaimer with the actual legal operator, address, official contact, jurisdiction and applicable data/mail arrangements. All three remain noindex drafts.

- [ ] Confirm official agency name, brand mark and final visual identity.
- [ ] Confirm canonical domain; do not invent or use placeholder domains as production URLs.
- [ ] Approve the final public description and service claims.
- [ ] Verify project contributions, statuses, stacks, screenshots and links.
- [ ] Approve team profiles and professional credentials.
- [ ] Confirm legal operator, address, jurisdiction, official contact and approve Privacy/Terms/Disclaimer wording.
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

## Current evidence (4 November 2026)

- Phase 1 implementation PR: [#14](https://github.com/hamza131zara/agency/pull/14) (open; not merged; owner review required).
- Current route inventory: 25 HTML routes (14 root, six service details, five project details); 21 URLs in sitemap.
- Privacy, Terms, Disclaimer and 404 are noindex and omitted from the sitemap.
- Product/repository factual notes and owner-claim review list: `docs/PORTFOLIO_CONTENT_EVIDENCE.md`.
- Latest branch-head CI is tracked at [Run #137](https://github.com/hamza131zara/agency/actions/runs/41808527626); update this reference only after both jobs finish successfully.
- Browser artifact captures all 25 routes at desktop and mobile sizes (50 screenshots). The contact sheet and representative full-size captures were manually reviewed.
- Automated coverage includes 25-route metadata/local-link validation, responsive checks at 320/390/768/1440px, axe checks across 25 routes, service CTA preselection, breadcrumbs, keyboard/touch/reduced-motion and legal/404 indexing rules.

## Completion evidence

The Phase 1 pull request must include the changed-file summary, passing CI links, desktop/mobile screenshots, manual accessibility/interaction notes, 3D fallback/reduced-motion evidence, known limitations and recorded owner approvals.
