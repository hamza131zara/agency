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

The current validated platform contains 30 HTML routes: 14 root pages, six service detail pages, five portfolio project-note pages and five product detail pages. The expanded page hierarchy, six service divisions, visual/3D system and product/automation lifecycle are defined in `docs/`. Privacy, Terms and Disclaimer are draft-only, marked noindex and excluded from the sitemap until owner/legal review; the 404 page is also noindex and excluded. The sitemap currently contains 21 URLs and must be updated with the owner-approved canonical domain before launch. Not every planned product module is implemented yet.

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
- `docs/PRODUCT_AUTOMATION_GOVERNANCE.md` — product and automation status/release controls.
- `docs/PORTFOLIO_CONTENT_EVIDENCE.md` and `docs/PORTFOLIO_EVIDENCE_VISUAL_GOVERNANCE.md` — portfolio evidence, owner claims, asset permissions and publication safeguards.
- `docs/HOSTINGER_DEPLOYMENT.md` — deployment runbook (owner approval required).

## Local checks

Run:

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

The CI workflow also runs HTML/link/site validation across root, service-detail and case-study routes, JavaScript/PHP syntax checks, contact endpoint smoke tests, Playwright browser tests, responsive checks at 320/390/768/1440px and axe accessibility scans across the full 25-page route set. Automated accessibility scans do not replace manual keyboard, screen-reader, contrast and screenshot review.

## Phase boundaries

The master roadmap is in `docs/PLATFORM_MASTER_PLAN.md`. Phases 1–3 are complete at their documented repository implementation/QA levels; their owner, legal and human accessibility launch gates remain where recorded. Phase 4 (portfolio and case-study system) is complete at repository/automated-QA level: PR #22 merged at `b89adee0` and post-merge CI #42080702755 passed. Manual visual, screen-reader and owner evidence reviews remain pre-launch requirements. Phase 5 (ready-made product marketplace) is in progress: P5.1 readiness audit PR #24 merged at `fbfb36e5` and post-merge CI #42175498028 passed; P5.2 catalogue discovery is underway. Checkout, payment, customer accounts and licence activation remain later-phase scope and require separate security and owner approval gates.

## Hosting and release

The site is not considered deployed merely because CI passes. Domain, branding, legal operator, monitored inbox, verified sender and final content require owner confirmation. Follow `docs/HOSTINGER_DEPLOYMENT.md` only after explicit launch approval.

Never commit `config.php`, credentials, API keys, private customer data or production secrets.
