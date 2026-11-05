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
| Products | Products | Product detail pages, installation and licence information |
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

The current validated platform contains 25 HTML routes: 14 root pages, six service detail pages and five project detail pages. The expanded page hierarchy, six service divisions, visual/3D system and product/automation lifecycle are defined in `docs/`. Privacy, Terms and Disclaimer are draft-only, marked noindex and excluded from the sitemap until owner/legal review; the 404 page is also noindex and excluded. The sitemap currently contains 21 URLs and must be updated with the owner-approved canonical domain before launch. Not every planned product module is implemented yet.

## Documentation index

- `docs/PLATFORM_MASTER_PLAN.md` — vision, six services, platform modules and all phases.
- `docs/INFORMATION_ARCHITECTURE.md` — navigation, page inventory, page settings and content models.
- `docs/VISUAL_DESIGN_3D_STANDARD.md` — theme direction, 3D interaction, accessibility and performance.
- `docs/DELIVERY_METHODOLOGY.md` — workflows, Git practices, QA and release methodology.
- `docs/PHASE_1_EXECUTION_PLAN.md` — current Phase 1 scope, work packages and acceptance.
- `docs/PHASE_1_ACCEPTANCE.md` — acceptance checklist.
- `docs/PHASE_2_EXECUTION_PLAN.md` — accepted premium visual identity and 3D implementation record.
- `docs/PHASE_2_VISUAL_EVIDENCE_AUDIT.md` — evidence review for project and product visuals.
- `docs/PHASE_3_EXECUTION_PLAN.md` — service depth, positioning and team profile governance.
- `docs/PHASE_4_EXECUTION_PLAN.md` — portfolio and case-study system; accepted implementation record.\n- `docs/PHASE_4_QA_ACCEPTANCE.md` — Phase 4 automated acceptance evidence and outstanding manual launch gates.\n- `docs/PHASE_5_EXECUTION_PLAN.md` — ready-made product marketplace scope and execution plan.\n- `docs/PRODUCT_AUTOMATION_GOVERNANCE.md` — product and automation status/release controls.
- `docs/PORTFOLIO_CONTENT_EVIDENCE.md` — repository-backed product descriptions, owner-provided claims and final verification checklist.
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

The master roadmap is in `docs/PLATFORM_MASTER_PLAN.md`. Phase 1 (multi-page platform foundation) is complete at the repository implementation level; PR #14 is merged and its exact PR-head CI passed. Phase 2 (premium visual identity and purposeful 3D) is complete: PR #15 merged at `d069caaf` and post-merge CI #41864959360 passed both required jobs. Human assistive-technology review, official legal identity, canonical domain, inbox, project permission and launch approvals remain pre-launch gates. Phase 3 (service depth, positioning and team profiles) is now in progress under `docs/PHASE_3_EXECUTION_PLAN.md`. Customer accounts, payments, licences, and live automation integrations are later phases and require their own security and owner approval gates.

## Hosting and release

The site is not considered deployed merely because CI passes. Domain, branding, legal operator, monitored inbox, verified sender and final content require owner confirmation. Follow `docs/HOSTINGER_DEPLOYMENT.md` only after explicit launch approval.

Never commit `config.php`, credentials, API keys, private customer data or production secrets.
