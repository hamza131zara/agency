# Agency Platform — Master Product & Delivery Roadmap

**Document status:** Approved planning baseline for implementation  
**Audience:** Agency owner, product/design, engineering, QA and operations  
**Website language:** English only  
**Hosting baseline:** PHP-enabled shared hosting (Hostinger-compatible) unless a later approved phase requires a different deployment model

## 1. Product vision

Build a professional, multi-page digital agency platform that explains what the agency does, demonstrates real work, introduces its people and methods, presents ready-made software products, and provides clear ways to start a project or use an available tool.

The website is not a single landing page. The homepage is the front door to a connected platform with dedicated pages, clear navigation, useful content, and consistent page-level settings.

The agency brings together six service divisions:

1. Software and digital product engineering.
2. AI, LLMs and intelligent automation.
3. Blockchain and Web3 engineering.
4. Graphic design and creative services.
5. Digital marketing and growth.
6. E-commerce and marketplace operations.

The platform will also grow into two connected product areas:

- **Products:** ready-to-use or ready-to-install software, tools and platforms, with transparent status, requirements, licensing and support details.
- **Automation:** practical automation services first, then customer-facing automation tools and workspaces as each tool becomes genuinely operational.

## 2. Positioning and public-language rules

### 2.1 Core positioning

The agency designs, builds, improves and grows digital products and business systems. It can build websites and web platforms of many kinds across different technologies and stacks, selecting the implementation approach according to the project's goals, constraints, maintainability and operating environment.

The public message must make this clear:

> We build all kinds of websites and web platforms across a wide range of technologies—from business and e-commerce websites to marketplaces, portals, SaaS products, dashboards and custom web applications.

Do not imply that the agency is limited to one language, framework, CMS or website category.

### 2.2 English-only policy

- Every public page, navigation label, form, validation message, email template, product description and editorial article is written in English.
- Use `<html lang="en">` on every HTML page.
- Do not add language selectors, translated duplicates, locale routing or multilingual content at this stage.
- Keep wording direct, accessible and understandable to non-technical buyers. Explain technical terms when they materially help.

### 2.3 Truth and evidence

- Do not invent client names, testimonials, case-study outcomes, revenue figures, team credentials, certifications, project contributions or technology stacks.
- Mark each project/product as **Live**, **In development**, **Planned**, or **Retired** using its real current status.
- Separate agency-owned products from client work and third-party tools.
- Use screenshots from actual products only after they have been reviewed and approved. Label conceptual visuals and UI mockups as illustrative.
- Never describe a planned automation or product as available for customer use.
- Avoid guaranteed search rankings, guaranteed ad results, guaranteed investment returns or unsupported security claims.
- Publish biographies, years of experience and qualifications only after the relevant person approves the wording and evidence is available.

## 3. Service portfolio

### 3.1 Software & Digital Product Engineering

Build websites and digital products across suitable technologies and delivery models, including:

- Corporate, business, portfolio and service websites.
- E-commerce stores, multi-vendor marketplaces and booking websites.
- SaaS platforms, portals, dashboards, directories and content platforms.
- Custom web applications, social/community platforms and internal business systems.
- Front-end, back-end and full-stack development.
- APIs, integrations, databases, cloud-connected services and CMS implementations.
- Flutter and other suitable cross-platform or native mobile application work.
- UI implementation, accessibility, performance, maintenance, modernization and quality engineering.

Technology is selected per project. Public examples may include the technologies actually used by the agency team, but the service must not be represented as tied to one stack.

### 3.2 AI, LLMs & Intelligent Automation

- AI-powered web applications and features.
- LLM integration, model orchestration and evaluation.
- Chatbots, assistants, AI agents and multi-agent workflows.
- Retrieval-augmented generation (RAG), knowledge search and document workflows.
- MCP and other tool/API integrations where appropriate.
- Business-process automation, AI-assisted operations and human approval steps.
- Guardrails, access controls, observability, privacy-aware design and testing.

### 3.3 Blockchain & Web3

- Smart contracts and decentralized applications.
- Blockchain integrations, wallets and on-chain data workflows.
- DAO governance and voting systems.
- Token utility and tokenomics engineering support.
- DeFi and Web3 product engineering.
- Contract testing, threat modelling and security-aware implementation.

Do not imply that a product is audited or safe for production funds unless an independent audit and its scope are verifiable. Tokenomics or financial content must not be presented as investment advice.

### 3.4 Graphic Design & Creative Services

- Brand identity, logo systems and visual guidelines.
- Marketing campaigns, social media assets and advertising creatives.
- Web and app graphics, UI assets and design systems.
- Presentations, pitch decks, packaging and print-ready artwork.
- Illustrations, infographics and creative direction.

A designer profile may describe 8+ years of experience and a bachelor's degree in graphic design only after the person approves the public profile and the qualifications are verified.

### 3.5 Digital Marketing & Growth

- Technical, on-page, off-page and international SEO.
- AEO (answer engine optimization) and GEO (generative engine optimization).
- Content strategy, editorial planning and internal linking.
- Affiliate marketing and partner acquisition.
- Google Ads, Meta Ads and other suitable paid campaigns.
- Social media strategy and publishing operations.
- Analytics, conversion-rate optimization and growth experiments.

Set realistic scopes and reporting. Never promise a fixed search position, traffic volume, revenue or advertising outcome.

### 3.6 E-commerce & Marketplace Operations

Support businesses selling through marketplaces and commerce platforms, including Amazon, eBay, Walmart Marketplace, TikTok Shop, Etsy, Temu, Mercari and other suitable channels.

Potential work includes:

- Store setup, account operations and marketplace readiness.
- Product research, catalogue structure and listing optimization.
- Marketplace SEO, merchandising and advertising operations.
- Inventory, order, returns and customer-service workflows.
- Store performance reviews and operational consulting.

The planned public profile may mention a specialist team of 10+ only after the team size, roles and permission to publish have been verified.

## 4. Platform modules

The website is organised into connected modules:

- **Marketing and trust website:** agency identity, services, approach, team, contact and legal information.
- **Portfolio:** projects, case studies, evidence links, screenshots, technology details and status.
- **Product catalogue:** ready-to-use and ready-to-install products with honest availability and support information.
- **Automation catalogue:** automation capabilities, available tools, planned tools and later customer workspaces.
- **Lead and project intake:** Service Finder, Project Brief Builder and secure inquiry workflow.
- **Editorial and discovery:** articles, guides, case studies and service/product education.
- **Operations:** later admin controls, customer accounts, licensing, billing and support where justified.

Each module has its own page(s), navigation destination, page metadata, content owner and acceptance criteria. Do not place every module into the homepage as an endless scroll.

## 5. Master phase roadmap

### Execution status — 6 November 2026

| Phase | Status | Evidence / boundary |
|---|---|---|
| Phase 0 — Strategy, documentation and governance | COMPLETE | Planning baseline merged through PR #13. |
| Phase 1 — Multi-page platform foundation | COMPLETE — implementation | PR #14 merged into `main` at [`17637e7`](https://github.com/hamza131zara/agency/commit/17637e7adb3299d0abc5d9263b91d1bac9def609); exact PR-head CI run #151 passed both required jobs. Owner/legal and human accessibility items remain pre-launch gates in `docs/PHASE_1_ACCEPTANCE.md`. |
| Phase 2 — Premium visual identity and 3D experience | COMPLETE | PR #15 merged to `main` on 4 November 2026 at [`d069caaf`](https://github.com/hamza131zara/agency/commit/d069caaf3fc10d462199d945d3c4729fed0b70a6); post-merge CI #41864959360 passed both required jobs. Human assistive-technology and official legal-brand inputs remain pre-launch gates. Evidence in `docs/PHASE_2_EXECUTION_PLAN.md`. |
| Phase 3 — Service depth, positioning and team profiles | COMPLETE — implementation and post-merge QA | PR #16 merged to `main` on 5 November 2026 at [`94954a3`](https://github.com/hamza131zara/agency/commit/94954a3e859ae45070fc84d0e7ff3eba53be11bc). Post-merge CI [#41984286337](https://github.com/hamza131zara/agency/actions/runs/41984286337) passed `validate` and `browser-and-accessibility`. Profile evidence/consent and human assistive-technology review remain pre-launch gates. |
| Phase 4 — Portfolio and case-study system | COMPLETE — repository implementation and automated QA | PR #22 merged at `b89adee0`; post-merge CI [#42080702755](https://github.com/hamza131zara/agency/actions/runs/42080702755) passed. Manual visual/assistive-technology and owner evidence reviews remain pre-launch gates. |
| Phase 5 — Ready-made product marketplace | IN PROGRESS — P5.1 accepted; P5.2 underway | PR #24 merged at `fbfb36e5`; post-merge CI [#42175498028](https://github.com/hamza131zara/agency/actions/runs/42175498028) passed. P5.1 readiness register is in `docs/PRODUCT_CATALOGUE_READINESS.json`; catalogue discovery implementation is on `phase5/p5-2-product-catalogue-discovery`. |
| Phases 6–9 | PLANNED | Start after their predecessor scope and dependencies are reviewed; no implementation is implied by this status table. |

A phase status distinguishes repository implementation from public-release readiness. A merge does not complete legal approvals, human accessibility reviews, external delivery tests or deployment.

Phases are release gates. A phase is complete only when its acceptance criteria, QA evidence and owner decisions are recorded. A phase may contain small implementation increments; do not silently move unfinished work into a completed status.

### Phase 0 — Strategy, documentation and governance

**Purpose:** establish one consistent source of truth before implementation expands.

Deliverables:
- Master platform roadmap.
- Information architecture and page inventory.
- Visual design and 3D interaction standard.
- Delivery methodology, QA workflow and contribution rules.
- Phase 1 execution plan and acceptance checklist.

Exit criteria:
- Documentation is reviewed and committed on a reviewable branch.
- Scope, language, page hierarchy, claims policy and phase boundaries are consistent.
- No application code has been changed as part of a documentation-only update.

### Phase 1 — Multi-page platform foundation and experience baseline

**Purpose:** turn the existing portfolio site into a coherent, navigable agency platform foundation.

Deliverables:
- Shared site shell, consistent header/footer and page-level navigation.
- English-only page structure and page settings.
- Homepage that introduces and routes visitors to dedicated sections; it is not the only substantive page.
- Properly connected Services, Work, About/Approach, Contact, Project Brief and legal destinations.
- Clear page hierarchy, breadcrumbs where useful, metadata and active navigation states.
- Six initial service detail pages with wording that explicitly covers all kinds of websites across different technologies.
- Initial shared design tokens and a useful, accessible CSS 3D service map with keyboard/touch navigation and reduced-motion behavior.
- Verified content and project-status labels; no invented claims.

Exit criteria:
- Every primary navigation item reaches a complete page, not a placeholder or a dead anchor.
- Core tasks work on desktop, mobile, keyboard and touch.
- Visual quality is coherent across pages.
- 3D adds understandable value and does not block access to information.
- All existing automated checks pass, and the manual visual/accessibility review is recorded.

### Phase 2 — Premium visual identity and 3D experience

**Purpose:** deepen the visual language and introduce purposeful spatial interaction.

**Execution plan:** `docs/PHASE_2_EXECUTION_PLAN.md`.  
**Accepted implementation:** PR #15 merged to `main` at `d069caaf`; post-merge CI #41864959360 passed.

Deliverables:
- Approved brand direction, typography, colour, spacing, components and motion rules.
- Refined 3D hero/brand object or spatial systems view.
- Interactive service/technology map or project-exploration visual where it improves understanding.
- Selected project/product visualisations based on real product evidence.
- Responsive, reduced-motion and WebGL-fallback treatment.

Exit criteria:
- Each 3D element has a user purpose and accessible equivalent.
- Performance, mobile usability, keyboard access and visual consistency pass review.
- No decorative animation obscures content or creates interaction traps.

### Phase 3 — Service depth, positioning and team profiles

**Purpose:** deepen the six service areas already established in Phase 1, improve their conversion journeys and establish evidence/consent controls for public team expertise.

**Execution plan:** `docs/PHASE_3_EXECUTION_PLAN.md`. Current implementation is limited to factual service-page improvements and profile-governance safeguards; individual credentials require consent and evidence.

Phase 1 provides the six service-detail routes and the initial Service Finder. Phase 3 is an enhancement phase; it must build on those pages rather than recreate them.

Deliverables:
- Expand each service page with service-specific use-case guidance, evergreen buyer FAQs (not represented as customer research), and clearer engagement boundaries. Add client examples only when verified and approved.
- Improve cross-linking between related services and relevant case studies, products or editorial guides where verified material exists.
- Refine the Service Finder's usability and routing; make data-led changes from inquiry feedback or visitor-intent evidence only when owner-approved datasets exist. Do not add tracking or new data collection under this phase.
- Publish individual team/role profiles, biographies and credentials only after consent and owner approval.
- Add service-specific process, scope and handover details where they materially help buyers understand delivery.

Exit criteria:
- Each service page clearly differentiates its capabilities and typical engagement fit.
- All public team and experience claims have evidence/permission or are omitted.
- Service links, inquiry preselection and related-content links remain consistent.

### Phase 4 — Portfolio and case-study system

**Status:** COMPLETE — execution and automated QA accepted in PRs #18–#22; post-merge CI passed on `main`. Manual visual, assistive-technology and owner-approval checks remain pre-launch requirements. See `docs/PHASE_4_EXECUTION_PLAN.md` and `docs/PHASE_4_QA_ACCEPTANCE.md`.

**Purpose:** turn the project list into an evidence-led body of work.

Deliverables:
- Portfolio catalogue with search, category filters, tags and honest project statuses.
- Reusable case-study page template.
- Approved screenshots, architecture/technology summaries, agency contribution and links for each published project.
- Clear separation of owned products, client engagements, experiments and open-source tools.

Exit criteria:
- Every case study has owner-approved facts and links.
- Illustrations are labelled as such.
- No unverified metrics, client claims or production-demo claims appear.

### Phase 5 — Ready-made product marketplace

**Status:** IN PROGRESS — P5.1 product readiness audit merged through PR #24 and verified by post-merge CI [#42175498028](https://github.com/hamza131zara/agency/actions/runs/42175498028). P5.2 product catalogue and category discovery is underway on `phase5/p5-2-product-catalogue-discovery`. Execution plan: `docs/PHASE_5_EXECUTION_PLAN.md`.

**Purpose:** present software products as distinct products, not just portfolio cards.

Deliverables:
- Products catalogue and product-category pages.
- Product detail page with screenshots/demo, features, constraints, requirements, installation, status, licence, pricing (where approved), support and update policy.
- Product submission/review checklist and version/change history.
- Initial verified product listings.

Initial catalogue candidates and current known status:
- STRIDETO — live platform; free to use.
- RegexLab — public developer tool.
- JotJSON — public developer tool.
- SiteIntel Pulse — in development.
- Free AI Mixer — in development.
- Auto-Trading-Agent — future product showcase only until the separate roadmap authorizes a customer-ready release.

Do not label a product ready-to-install until installation instructions, packaging, prerequisites, licensing, support and a clean installation test exist.

### Phase 6 — Automation catalogue and customer tools

**Purpose:** move from agency-delivered automation services to genuinely usable automation products.

Deliverables:
- Automation overview, use cases, integration directory and tool-specific pages.
- First end-to-end customer-facing automation tool selected by evidence and feasibility.
- Explicit connection permissions, scopes, revocation, execution history and error handling.
- Testing and approval workflows for actions that affect external systems.
- Customer workspaces only after the security and operational model is approved.

Possible categories:
- Marketing and social workflows.
- Business operations and document workflows.
- AI/LLM assistants and agent workflows.
- E-commerce and marketplace operations.
- Notifications and communication.
- API, webhook and data synchronisation.

Exit criteria:
- A customer can discover, configure, test, run, monitor and disconnect the tool.
- No tool is marked live before real integrations, error states and security controls work.
- No secrets are exposed in browser code, logs, screenshots or public repositories.

### Phase 7 — Customer accounts, commerce, licences and support

**Purpose:** add transactional infrastructure only where a real product requires it.

Deliverables, only where approved:
- Authentication, customer profiles and least-privilege authorization.
- Checkout/payment integration and order records.
- Licence activation, expiry/renewal rules and revocation.
- Downloads, update delivery, invoices and customer support.
- Admin actions, audit history, backups, data retention and account deletion.

Exit criteria:
- Threat model, privacy review, payment-provider requirements and recovery procedures are documented.
- A complete test purchase/activation/support/rollback flow passes in a non-production environment.
- Payment secrets and signing keys remain server-side.

### Phase 8 — SEO, editorial, AEO/GEO and organic growth

**Purpose:** make the multi-page platform discoverable and useful over time.

Deliverables:
- Unique titles, descriptions, canonical URLs, sitemap and robots policy.
- Structured data only when it accurately describes visible page content.
- Internal linking between service pages, relevant case studies, product pages and guides.
- English editorial calendar and quality/review workflow.
- Technical SEO, accessibility, indexability and analytics/privacy checks.
- Content for real customer questions rather than keyword-stuffed pages.

Exit criteria:
- Search-facing content is accurate, original, useful and reviewed.
- No thin, duplicate, autogenerated or unsupported claims are published.
- Analytics and consent/privacy behavior match the approved legal setup.

### Phase 9 — Release, deployment and ongoing operations

**Purpose:** launch safely and keep the platform reliable.

Deliverables:
- Owner-approved brand/domain/legal details and final copy.
- Hostinger configuration and secure deployment.
- Backups, rollback, monitoring, inbox verification and maintenance ownership.
- Production smoke tests and post-launch issue register.
- Release notes and a measured improvement cycle.

Exit criteria:
- Domain, SSL, contact delivery, backups, redirects, metadata and all public routes are verified.
- Owner approves launch.
- No unresolved critical/high-severity release blocker remains.

## 6. Cross-phase quality gates

Every release must consider:

- Correctness and truthful content.
- Responsive layout across phone, tablet and desktop.
- Semantic HTML, keyboard navigation, visible focus and accessible labels.
- Contrast and reduced-motion behavior.
- Secure form and integration handling.
- Performance and graceful fallback.
- Search metadata and indexability.
- Browser and regression tests.
- Manual review of real page screenshots.
- Owner acceptance for public claims, identity, project evidence and deployment.

## 7. Change control

- Keep this document as the master scope reference.
- Record scope changes in a dated decision log or pull request.
- Do not mark a phase complete because its documentation exists; implementation and acceptance evidence are required.
- Keep implementation branches focused and reviewable.
- Never deploy, buy services, connect third-party credentials or send external communications without explicit owner approval.
