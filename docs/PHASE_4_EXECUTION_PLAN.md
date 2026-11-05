# Phase 4 — Portfolio & Case-Study System

**Status:** IN PROGRESS — P4.1–P4.3 merged and verified on `main`; P4.4 evidence and visual governance is under review; P4.5 remains open.  
**Predecessor:** Phase 3 merged to `main` at [`94954a3`](https://github.com/hamza131zara/agency/commit/94954a3e859ae45070fc84d0e7ff3eba53be11bc); post-merge CI [#41984286337](https://github.com/hamza131zara/agency/actions/runs/41984286337) passed both required jobs.  
**Language:** English only.  
**Hosting baseline:** Existing static HTML/CSS/browser-JavaScript/PHP-compatible architecture; no framework or CMS migration is assumed.

## 1. Objective

Make the existing Work section a trustworthy, navigable portfolio that helps visitors understand what each project is, what was actually built, what evidence supports the description, and where they can inspect the live product or source. Standardize project detail pages into a reusable case-study structure without presenting internal/owned products as paid-client engagements or inventing business outcomes.

## 2. Baseline audit

The current repository already contains:
- `work.html`: a five-project catalogue with search, category filters, status filtering and a live result count.
- Five detail pages: STRIDETO, RegexLab, JotJSON, SiteIntel Pulse and Free AI Mixer.
- Project visuals that are explicitly illustrative rather than production screenshots.
- A portfolio evidence register at `docs/PORTFOLIO_CONTENT_EVIDENCE.md`.

Known limitations to address:
- Detail pages are currently project notes with different levels of specificity, not a consistent reusable case-study system.
- Agency role/contribution, project ownership/type and evidence links are not consistently recorded as structured fields.
- STRIDETO's technology stack and exact agency contribution are explicitly unverified and must remain unclaimed until confirmed.
- Development-stage projects must remain clearly distinguished from live public tools.
- No approved authentic screenshot set or client-attribution permissions are currently recorded in the evidence register.
- The existing catalogue filters must be regression-tested and improved only where evidence or usability findings justify it; do not replace working functionality gratuitously.

## 3. Work packages

**Progress note (5 November 2026):** P4.1 is merged at `9126451e97645436f219e59d8962dbc184ede2d56` (post-merge CI [#41989863844](https://github.com/hamza131zara/agency/actions/runs/41989863844), passed). P4.2 is merged at `c570f9c61ac54ac6df41fa25286ff47b0f78ed78` (post-merge CI [#41996753340](https://github.com/hamza131zara/agency/actions/runs/41996753340), passed). P4.3 is merged at `b0b225586821f57a30c62f1b0a650ebe873cc388` (post-merge CI [#42026701923](https://github.com/hamza131zara/agency/actions/runs/42026701923), passed). P4.3 standardized semantic breadcrumbs, the in-page section index, context/scope/implementation anchors and the versioned case-study article marker across all five public project pages. P4.4 implementation is underway on `phase4/p4-4-evidence-visual-governance`: added a formal evidence/visual publication policy, per-project visual approval records (all currently unapproved), a CI validator that cross-checks public inventory IDs against catalogue cards and checks project-page disclosures/image sources against approved asset lists, and a new required validation workflow step. Exact-head CI and manual visual review are pending; P4.5 remains open.


### P4.1 — Portfolio inventory and evidence model
- Audit every current project card and detail page against `docs/PORTFOLIO_CONTENT_EVIDENCE.md`.
- Define a consistent project record: name/slug, project type, owner, status, audience/problem, purpose, verified scope, agency contribution, verified stack, evidence/source links, approved visuals, public demo, last-verified date and owner approval.
- Separate agency-owned products, client engagements, open-source tools, experiments and internal projects.
- Record unknown fields explicitly; unknown is not a reason to infer or fabricate.

### P4.2 — Portfolio catalogue quality
- Preserve and test search, category filters, status filters, result count, empty state and clear/reset behavior.
- Ensure each card has a clear project type/status and useful links to its detail record and any verified live/source destination.
- Keep labels and filter controls keyboard accessible and understandable to screen readers.
- Add or refine filters only when the current inventory supports meaningful categories.
- Ensure catalogue content and metadata remain accurate at desktop and mobile widths.

### P4.3 — Reusable case-study page system
- Establish a consistent page structure: project context, problem/opportunity, goals, scope, approach, implementation, verified technology, agency contribution, evidence/visuals, current status, constraints and next action.
- Use only sections with supported information; omit or explicitly label unknowns.
- Provide consistent breadcrumbs, parent-index navigation, page metadata and related-project navigation where appropriate.
- Preserve the current lightweight architecture and shared site shell.
- Distinguish a project note from a complete case study when client context, contribution or outcome evidence is unavailable.

### P4.4 — Evidence and visual governance
- Verify repository-derived technical claims against current source repositories and record the date/source.
- Request owner approval for agency attribution, project role, client names, logos, screenshots, testimonials and measured outcomes.
- Use authentic screenshots only after source and publication permission are confirmed.
- Label conceptual compositions as illustrative; do not present them as product screenshots.
- Do not invent traffic, revenue, conversion, user, performance, security or business outcomes.
- Preserve accurate release statuses and avoid presenting static showcases as full interactive products.

### P4.5 — QA and acceptance
- Validate all catalogue/detail routes, internal links, external links and status labels.
- Test catalogue search/filter combinations, reset behavior and empty results.
- Test responsive layout at 320, 390, 768 and 1440px.
- Test keyboard operation, visible focus, semantic headings, link names and accessibility checks.
- Review screenshots for the catalogue and all changed project pages.
- Run the complete repository CI suite on the exact PR head and again after merge.

## 4. Acceptance criteria

- [ ] Every listed project has a current evidence-register entry and a clear type/status.
- [ ] The catalogue's search, category/status filters, live result count, empty state and reset behavior work together.
- [ ] Every project detail page uses the approved shared case-study structure or is explicitly labelled as a project note when evidence is incomplete.
- [ ] Agency contribution, client attribution and technology claims are only published when verified and approved.
- [ ] Project statuses distinguish live/public tools from in-development work.
- [ ] Authentic screenshots and testimonials are published only with owner permission; conceptual visuals are labelled.
- [ ] No unsupported metrics, customer claims, paid-client claims, guarantees or audit/security claims are introduced.
- [ ] All internal links, metadata, breadcrumbs and parent/related navigation are valid.
- [ ] Responsive, keyboard and accessibility checks pass; screenshots are reviewed.
- [ ] Exact-head CI and post-merge CI both pass.

## 5. Owner / evidence dependencies

- Confirm agency contribution and ownership/relationship for each project.
- Confirm whether any project is a client engagement and approve client attribution separately.
- Supply approved source screenshots or authorize specific real product captures.
- Approve any public logos, testimonials, outcome metrics and case-study claims.
- Reconfirm live URLs and product release status before launch.

If owner approval or evidence is unavailable, publish only a factual project overview based on verifiable public repository material and keep the case study explicitly limited. Do not block the catalogue improvements on missing client evidence.

## 6. Explicitly out of scope

- Inventing client work, customer names, testimonials, metrics or project outcomes.
- Publishing unapproved screenshots, logos or confidential material.
- Product checkout, licensing, payments, customer accounts or CMS introduction.
- Analytics/tracking or new data collection.
- Domain, hosting, legal identity, mail or production deployment changes.
- Rewriting the platform in a new framework.

## 7. Evidence record

Each Phase 4 PR must record the project inventory reviewed, evidence sources and dates, owner decisions, changed routes, filter/link regression results, responsive screenshots, accessibility results, CI links and unresolved evidence limitations.
