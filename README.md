# Agency — Multi-page Digital Studio Platform

The agency website is a multi-page portfolio, services, products and automation platform. It is not intended to be a one-page landing site.

The current implementation uses semantic HTML, CSS, browser JavaScript and a PHP inquiry endpoint for PHP-enabled hosting such as Hostinger. Keep this lightweight architecture unless a documented feature need justifies a change.

## Public language and positioning

- Public website language: **English only**.
- The agency builds all kinds of websites and web platforms across different technologies and stacks.
- The six service divisions are Software & Digital Product Engineering; AI, LLMs & Intelligent Automation; Blockchain & Web3; Graphic Design & Creative Services; Digital Marketing & Growth; and E-commerce & Marketplace Operations.
- Products and customer-facing automation tools must show their real status. Planned or in-development work must never be presented as live.

## Platform page map

| Area | Main page | Detail pages |
|---|---|---|
| Agency | Home, About, Approach, Team | Approved profile and trust content |
| Services | Services | Six service-division pages |
| Portfolio | Work | Individual project/case-study pages |
| Products | Products | Five product detail pages, availability, requirements and release/licence information |
| Automation | Automation | Tool-specific pages and later customer workspaces |
| Contact | Contact, Project Brief Builder | Inquiry workflow |
| Legal | Privacy, Terms, Disclaimer, 404 | Privacy notice and clearly marked noindex legal drafts awaiting operator/jurisdiction review |

The homepage introduces the agency and links to dedicated destinations. It must not contain the entire platform as one continuous page.

## Current repository baseline

Existing pages and features include:
- Home, Services, Work, About, Approach, Team, Contact, Privacy, Terms and Disclaimer.
- Project detail pages under `work/`.
- Service Finder and portfolio search/filter controls.
- Browser-local Project Brief Builder with copy/export/print actions.
- PHP inquiry endpoint with validation and safe unsent fallback behavior.
- SEO metadata, sitemap/robots templates, 404 page, security headers and GitHub Actions checks.

The current validated platform contains 30 HTML routes: 14 root pages, six service detail pages, five portfolio project-note pages and five product detail pages. The expanded page hierarchy, six service divisions, visual/3D system and product/automation lifecycle are defined in `docs/`. Privacy, Terms and Disclaimer are draft-only, marked noindex and excluded from the sitemap until owner/legal review; the 404 page is also noindex and excluded. The sitemap template currently contains 26 URLs, including five product detail pages; it still uses a placeholder host and must be updated with the owner-approved canonical domain before launch. Not every planned product module is implemented yet.

## Documentation index

- `docs/PLATFORM_MASTER_PLAN.md` — vision, six services, platform modules and all phases.
- `docs/INFORMATION_ARCHITECTURE.md` — navigation, page inventory, page settings and content models.
- `docs/VISUAL_DESIGN_3D_STANDARD.md` — theme direction, 3D interaction, accessibility and performance.
- `docs/DELIVERY_METHODOLOGY.md` — workflows, Git practices, QA and release methodology.
- `docs/PHASE_1_EXECUTION_PLAN.md` and `docs/PHASE_1_ACCEPTANCE.md` — platform foundation scope and acceptance.
- `docs/PHASE_2_EXECUTION_PLAN.md` and `docs/PHASE_2_VISUAL_EVIDENCE_AUDIT.md` — visual identity, 3D and evidence review.
- `docs/PHASE_3_EXECUTION_PLAN.md` — service depth, positioning and team profile governance.
- `docs/PHASE_4_EXECUTION_PLAN.md` and `docs/PHASE_4_QA_ACCEPTANCE.md` — portfolio/case-study implementation and automated QA acceptance.
- `docs/PHASE_5_EXECUTION_PLAN.md` — product marketplace phases, package sequence and release boundaries.
- `docs/PRODUCT_CATALOGUE_READINESS.json` — six-candidate product ownership, licensing, installation and release-readiness audit.
- `docs/PRODUCT_RELEASE_GOVERNANCE.md` and `docs/PRODUCT_RELEASE_GOVERNANCE.json` — release gates, owner approvals and structured product release decisions.
- `docs/PRODUCT_SUBMISSION_CHECKLIST.md` — evidence checklist for each product submission and release review.
- `docs/PRODUCT_CHANGELOG_TEMPLATE.md` — versioned release/change-history template; do not publish unreleased placeholders.
- `docs/LAUNCH_READINESS_CHECKLIST.md` — dated pre-publication checklist for domain, legal, email, Hostinger, SEO and final smoke tests.
- `docs/LAUNCH_APPROVALS.json` — explicit owner/production approval record; unresolved items block deployment.
- `docs/PRODUCT_AUTOMATION_GOVERNANCE.md` — product and automation status/release controls.
- `docs/PHASE_6_EXECUTION_PLAN.md` — automation catalogue, sandbox, operator console and production-readiness sequence.
- `docs/PRODUCTION_SECURITY_PRIVACY_REVIEW.md` — security threat model, data-flow inventory and production/privacy blockers.
- `docs/AGENCY_MARKETING_SEO_AEO_GEO_STRATEGY.md` — agency positioning hypotheses, 90-day marketing test and search-discoverability strategy.
- `docs/P6_6_OWNER_DECISION_REGISTER.md` — unresolved owner decisions, evidence register and release-gate sequence.
- `docs/PORTFOLIO_CONTENT_EVIDENCE.md` and `docs/PORTFOLIO_EVIDENCE_VISUAL_GOVERNANCE.md` — portfolio evidence, owner claims, asset permissions and publication safeguards.
- `docs/HOSTINGER_DEPLOYMENT.md` — deployment runbook (owner approval required).

## Local preview and checks

For a local visual preview on Windows, macOS or Linux, install Node.js 22 or newer, clone/download this repository, open a terminal in the repository root, then run:

```bash
npm run preview
```

Open http://127.0.0.1:8000/ in your browser. Stop the server with Ctrl+C. The preview server uses Node's built-in modules, binds to localhost only, does not expose directory listings, and never executes PHP files. The contact endpoint therefore does not submit mail in this preview; use a PHP-enabled local or staging environment to test server-side form handling.

Run the repository checks with:


```bash
python scripts/validate_site.py
node --check assets/js/main.js
php -l contact.php
php -l config.example.php
python tests/test_contact_endpoint.py
npm install
npm run test:e2e
npm run test:a11y
npm run test:responsive
```

The CI workflow also runs HTML/link/site validation across root, service-detail and case-study routes, JavaScript/PHP syntax checks, contact endpoint smoke tests, Playwright browser tests, responsive checks at 320/390/768/1440px and axe accessibility scans across the full 30-page route set, plus product-release and launch-readiness guard checks. Automated accessibility scans do not replace manual keyboard, screen-reader, contrast and screenshot review.

## Phase boundaries

The master roadmap is in docs/PLATFORM_MASTER_PLAN.md.

- **Phases 1–3:** repository implementation is complete at their documented levels. Owner, legal, evidence-consent and human accessibility gates remain where recorded.
- **Phase 4:** portfolio/case-study implementation and automated QA are complete; manual visual, screen-reader and owner evidence reviews remain pre-launch requirements.
- **Phase 5:** P5.1–P5.5 implementation and automated QA are merged. Owner/manual acceptance, legal identity, domain, inbox, Hostinger/SSL/backup evidence and strict website launch preflight remain open. No product is approved as ready-to-install or commercially available.
- **Phase 6:** P6.1–P6.6 repository implementation and automated checks are merged; production acceptance remains open. P6.6 implementation PR [#36](https://github.com/hamza131zara/agency/pull/36) merged at `5e7ce045156e69c66f8c6c0cb6fcf4d7e22cb30d`; documentation/owner-register closeout PR [#37](https://github.com/hamza131zara/agency/pull/37) merged at `8515648dda57324224ef07b8d09458b2f815b4eb`; final contact-security and release-validator hardening PR [#40](https://github.com/hamza131zara/agency/pull/40) merged at `0ab534c797fd3ac3ed007208ed740304f90decde`. Exact-head CI for PR #36 [#42295966546](https://github.com/hamza131zara/agency/actions/runs/42295966546), PR #37 [#42300331776](https://github.com/hamza131zara/agency/actions/runs/42300331776), and PR #40 [#42306629958](https://github.com/hamza131zara/agency/actions/runs/42306629958) passed all three required jobs. Production automation, real customer data, external notification delivery, website deployment and marketing activation remain blocked by the open owner/legal/operational decisions and explicit release approvals.
- **Phases 7–9:** planned; they require separate scope and dependency review.

A merge or green CI run is evidence of repository implementation and automated verification, not legal acceptance, production readiness, public release or customer demand.
## Hosting and release

The site is not considered deployed merely because CI passes. Domain, branding, legal operator, monitored inbox, verified sender and final content require owner confirmation. Follow `docs/HOSTINGER_DEPLOYMENT.md` only after explicit launch approval.

Never commit `config.php`, credentials, API keys, private customer data or production secrets.
