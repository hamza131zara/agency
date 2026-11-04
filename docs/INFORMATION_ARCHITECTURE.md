# Information Architecture & Page Settings

**Status:** Planning baseline  
**Public language:** English only  
**Principle:** The homepage introduces the agency; dedicated pages carry the full information and functionality.

## 1. Global navigation model

Recommended primary navigation:

- **Home**
- **Services** — overview plus six service divisions.
- **Work** — portfolio index and case studies.
- **Products** — product catalogue and product detail pages.
- **Automation** — automation capabilities, available tools and planned tools.
- **About** — agency identity and principles.
- **Approach** — delivery method and engagement process.
- **Team** — verified people and expertise.
- **Contact** — inquiry and project brief entry.

Use a restrained desktop navigation with clear active states. Group long destinations into accessible dropdowns or mega-menu panels only when the number of pages justifies it. On mobile, provide a simple, keyboard-operable menu with a visible close action and logical focus behavior.

The Project Brief Builder can be linked as a utility CTA within Contact/Services rather than occupying the same prominence as the primary sections. Legal pages belong in the footer and must remain reachable.

## 2. Page inventory and purpose

| Page / route proposal | Purpose | Required content and behavior |
|---|---|---|
| `index.html` — Home | Orient visitors and direct them to the platform | Clear value proposition, service overview, selected verified work, product/automation entry points, process summary, contact CTA |
| `services.html` — Services | Explain the full service portfolio | Six service divisions, what each delivers, links to detail pages and Service Finder |
| `services/software-engineering.html` | Software engineering detail | Website types, technology-agnostic approach, applications, platforms, integrations, process and inquiry CTA |
| `services/ai-automation.html` | AI/LLM detail | Models, agents, RAG, integrations, automation, evaluation and safety boundaries |
| `services/blockchain-web3.html` | Web3 detail | Smart contracts, DApps, DAO, integrations, testing and audit limitations |
| `services/creative-design.html` | Design detail | Brand identity, graphic design, UI assets, marketing creative and approved designer profile |
| `services/digital-growth.html` | Marketing detail | SEO, AEO, GEO, ads, affiliate, content, analytics and no-guarantee statement |
| `services/ecommerce-operations.html` | Marketplace operations detail | Marketplaces supported, operational services, role coverage and approved team information |
| `work.html` — Work | Searchable project catalogue | Filters, categories, status, project type and direct case-study links |
| `work/{project}.html` | Individual project/case study | Problem, audience, role, scope, solution, verified stack, screenshots, status, links and measured outcomes only when evidenced |
| `products.html` — Products | Ready-made software catalogue | Categories, availability filters, featured products and product statuses |
| `products/{product}.html` | Product detail | Features, limitations, real screenshots, demo, install requirements, licence, price if approved, support and changelog |
| `automation.html` — Automation | Explain automation offerings | Use cases, categories, available vs planned tools, permissions model and tool links |
| `automation/{tool}.html` | Specific automation tool | Supported integrations, inputs/outputs, permissions, setup, test mode, execution history, failure handling and limitations |
| `about.html` — About | Explain identity and purpose | Agency story, principles, operating model and approved business details |
| `approach.html` — Approach | Show how work is delivered | Discovery-to-launch methodology, communication, reviews, QA and handover |
| `team.html` — Team | Establish people and expertise | Approved names, roles, biographies, skills and credentials; no invented profiles |
| `brief-builder.html` — Project brief | Help a visitor prepare a useful brief | Guided requirements, local draft/export and explicit handoff |
| `contact.html` — Contact | Receive project inquiries | Clear categories, consent/privacy text, validation, delivery status and safe fallback |
| `privacy.html` — Privacy | Disclose real data handling | Actual operator, collection, purposes, retention, processors, rights and contact |
| `terms.html` — Terms | Define site and service terms | Draft-only, noindex until legal operator, jurisdiction, scope, intellectual property, warranties and liability wording are reviewed and approved |
| `disclaimer.html` — Disclaimer | Clarify limitations | Draft-only, noindex until claims, service scope, professional-advice and jurisdiction-specific wording are reviewed and approved |
| `404.html` | Recover from invalid routes | Clear message and links to Home, Services, Work and Contact |

These paths are proposed static-page paths compatible with the existing PHP-enabled shared-hosting model. Keep the current HTML pages and links working while implementing this hierarchy; introduce rewrites or a routing framework only after a documented need and regression plan.

## 3. Page hierarchy and navigation rules

- Every primary destination must have its own page with a unique title, description and purpose. Draft legal pages remain reachable for review but carry noindex and are excluded from the sitemap until approved.
- Service detail pages sit under Services; project detail pages sit under Work; product detail pages sit under Products; tool detail pages sit under Automation.
- Use breadcrumbs on deep pages, for example: Home → Services → AI & Automation.
- Avoid dead-end pages. Every detail page should link to the parent index and one relevant next action.
- Use descriptive link names. Do not use repeated ambiguous labels such as “Learn more” without context.
- Header and footer structure must remain consistent across all pages.
- Keep the Project Brief Builder reachable from Services and Contact.
- A menu item must never point to an unfinished anchor as a substitute for a real page. When a section is not yet available, either label it clearly as planned on its parent page or keep it out of the primary navigation.

## 4. Page-level settings checklist

Every public HTML page must have:

- `<!doctype html>`, UTF-8 charset and responsive viewport.
- `<html lang="en">`.
- A unique, useful `<title>` and meta description.
- Canonical URL once the final domain is confirmed; do not invent a domain.
- Open Graph title, description and suitable social preview image when approved.
- Favicon and theme colour consistent with the design system.
- Shared stylesheet and scripts with stable version/cache strategy at release.
- One clear page-level H1 and logical heading hierarchy.
- Skip link, semantic header/nav/main/footer, visible keyboard focus and labelled controls.
- Correct active navigation state and meaningful link destinations.
- Contextual CTA and links to parent/related content.
- Appropriate robots/indexability policy.
- Structured data only when page facts are visible and accurate.
- No secrets, private customer data, internal credentials or unapproved third-party embeds.

## 5. Homepage content hierarchy

The homepage should be a concise overview, not a substitute for all other pages.

Recommended sections:

1. Brand-led hero with one primary statement and clear routes to Services and Work.
2. Short agency introduction and the problem types the agency solves.
3. Six service-division overview cards, each linking to its detail page.
4. Selected work with accurate status labels and case-study links.
5. Products preview linking to Products.
6. Automation preview distinguishing consulting, available tools and planned capabilities.
7. How we work preview linking to Approach.
8. Team/expertise preview only if approved profiles are ready.
9. FAQ for real recurring questions.
10. Contact CTA and a complete footer.

Do not duplicate entire service descriptions, product specifications or all case studies on Home.

## 6. Portfolio and product content model

### Portfolio record

Each project should track:
- Name and slug.
- Type: agency-owned product, client engagement, open-source tool, experiment or internal project.
- Status and last verified date.
- Audience/problem and purpose.
- Agency role/contribution.
- Technology stack (only verified).
- Approved screenshots and captions.
- Live URL/repository/demo URL and its availability.
- Outcomes/metrics with source and date, if any.
- Owner approval for public wording.

### Product record

Each product should track:
- Name, category, owner and current release status.
- Intended users and job to be done.
- Features and known limitations.
- Demo/download/install method.
- Supported environments and requirements.
- Version, changelog and update policy.
- Licence, price and billing model where approved.
- Privacy/security notes, support channel and lifecycle policy.

## 7. Contact and inquiry routes

- Service pages preselect the corresponding inquiry category when the visitor chooses to contact the agency.
- Product pages route product questions to a product-support or product-inquiry category when available.
- Automation tool pages explain required permissions before asking a visitor to connect an external account.
- Brief handoff is an explicit user action. Never submit a form automatically.
- The current browser-local brief and contact fallbacks must remain clearly distinguished from an actual server submission.
- Success is displayed only after the server confirms that the configured mail transport accepted the inquiry; delivery to the recipient's inbox must be verified separately.

## 8. Language and content governance

- English is the only public language in this release plan.
- Use consistent spelling, terminology, service names and status labels.
- Keep marketing language clear, specific and plain.
- Technical detail belongs on relevant service/product/project pages rather than in every hero.
- Review all public content for accuracy, ownership, permissions and privacy before launch.
