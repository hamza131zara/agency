# Delivery Methodology, Workflows & Quality Gates

**Status:** Operating standard for agency website and product delivery.

## 1. Delivery principles

- Solve the actual user/business problem before choosing a technology.
- Build in small, reviewable increments.
- Prefer clear, maintainable and testable solutions over unnecessary complexity.
- Treat accessibility, security, privacy and performance as requirements, not last-minute polish.
- Show working evidence at each milestone.
- Be transparent about assumptions, constraints, dependencies and risks.
- Do not use fake data or claim unfinished work is complete.
- Obtain owner/client approval before production deployment, paid services, external account connections or irreversible actions.

## 2. Standard project lifecycle

### Stage 1 — Discovery
Capture the business goal, intended audience, current situation, desired outcome, constraints, stakeholders, integrations, budget/timeline context and success criteria.

**Outputs:** discovery notes, stakeholder questions, assumptions, risks and initial scope.

### Stage 2 — Requirements and feasibility
Convert discovery into user stories, acceptance criteria and non-functional requirements. Review technology, hosting, third-party dependencies, privacy, security, data and operational needs.

**Outputs:** functional scope, technical outline, feasibility decision, dependency list and delivery plan.

### Stage 3 — Information architecture and UX
Define page hierarchy, navigation, user journeys, content model, wireframes and responsive behavior. For software products, define user roles and main workflows.

**Outputs:** sitemap, route/page inventory, user flows, wireframes and content requirements.

### Stage 4 — Visual design and prototype
Set visual direction, typography, colour, components, interaction states and representative screen designs. Prototype complex interactions, including 3D, before committing to implementation.

**Outputs:** approved design direction, component inventory, prototypes and design QA notes.

### Stage 5 — Technical design
Define architecture, data flow, integration boundaries, access model, error states, observability, backup/recovery and deployment requirements.

**Outputs:** architecture diagram, technical decisions, threat/risk notes and implementation plan.

### Stage 6 — Incremental implementation
Deliver vertical slices from the user-visible experience through necessary backend/integration behavior. Keep each change focused and reviewable.

**Outputs:** working feature increments, code review notes, tests and updated documentation.

### Stage 7 — Verification and hardening
Run automated tests, accessibility checks, responsive checks, security review and manual acceptance. Validate failure modes, not only the happy path.

**Outputs:** test results, screenshots, issue register, fixes and release candidate.

### Stage 8 — Client/owner review
Demonstrate the actual behavior, explain known limitations and obtain review against acceptance criteria.

**Outputs:** accepted items, rejected items with reasons, remaining actions and approval record.

### Stage 9 — Release and handover
Deploy only after approval. Verify configuration, access, backups, monitoring, domain/SSL, integrations and real delivery flows. Share setup and operational guidance.

**Outputs:** release record, rollback instructions, handover notes and support/maintenance plan.

### Stage 10 — Improvement
Monitor defects and user feedback, prioritize changes and maintain a transparent backlog.

**Outputs:** improvement backlog, maintenance releases and updated documentation.

## 3. Website and platform workflow

For the agency website specifically:

1. Confirm page purpose and visitor intent.
2. Map each destination to a dedicated route/page.
3. Write and review English copy.
4. Build shared design components and page shell.
5. Implement the responsive page structure.
6. Add functional interactions and forms.
7. Add 3D/visual layers only after the static page is useful.
8. Test links, navigation, forms, metadata, accessibility and performance.
9. Review desktop/mobile screenshots manually.
10. Obtain owner approval before production release.

## 4. AI and automation workflow

Before implementing an automation:
- Identify trigger, data inputs, transformation, action and expected result.
- Identify who owns each connected account and dataset.
- Define the minimum required permissions and explain them before connection.
- Use test/dry-run mode where possible.
- Add explicit approval for consequential external actions.
- Define retries, idempotency, rate limits, timeouts, failure states and audit history.
- Provide disconnect/revoke controls and document data retention.
- Never expose API keys or provider credentials in browser code or public repositories.
- Test with synthetic/non-sensitive data before approved production use.

An automation is **Available** only when a customer can configure, test, run, monitor, recover from common failures and disconnect it safely. Otherwise label it **In development** or **Planned**.

## 5. Software product workflow

A product is ready for public release only after:
- Scope and supported use cases are defined.
- Install/deploy prerequisites are written.
- A clean installation or deployment has been tested.
- Core functionality and failure handling are tested.
- Privacy, security, permissions and data handling are reviewed.
- Versioning, licence, support, update and retirement policies are defined.
- Public screenshots and claims are approved.
- Product owner accepts the release.

## 6. Git and repository workflow

- Start from the latest relevant base branch and check repository status/history.
- Use a focused branch named for the task or phase.
- Keep commits small and descriptive.
- Avoid broad resets, force pushes, unrelated formatting and destructive rewrites.
- Do not modify secrets, environment files or production configuration as part of routine feature work.
- Update documentation when behavior, architecture, operations or acceptance criteria change.
- Run the narrowest relevant checks during implementation and the full required suite before merge.
- Open a pull request with scope, changed files, tests, screenshots and risks.
- Merge only after required checks and review pass.
- Do not push directly to the protected/default branch when a review branch is appropriate.

## 7. Quality assurance

### Automated checks currently present in this repository

- `python scripts/validate_site.py`
- `node --check assets/js/main.js`
- `php -l contact.php`
- `php -l config.example.php`
- `python tests/test_contact_endpoint.py`
- `npm run test:e2e`
- `npm run test:a11y`
- `npm run test:responsive`

The CI workflow also runs site validation, syntax checks, contact endpoint smoke tests, Playwright browser tests and axe accessibility scans.

### Manual checks required

- Review screenshots on desktop and mobile.
- Keyboard-only test every navigation, form, menu and interactive control.
- Check screen-reader labels and reading order for key journeys.
- Review contrast and focus states manually.
- Test narrow viewport, browser zoom and reduced motion.
- Verify actual links and project statuses.
- Verify form delivery with the real configured destination inbox after launch configuration.
- Test 3D fallback and non-WebGL behavior.

Automated accessibility scans are valuable but do not prove full accessibility conformance.

## 8. Definition of ready

A task is ready to implement when it has:
- Clear user/business purpose.
- Defined scope and explicit non-goals.
- Acceptance criteria.
- Design/content input where needed.
- Known dependencies and risks.
- Security/privacy implications considered.
- A test approach.

## 9. Definition of done

A task is done only when:
- The agreed behavior is implemented.
- Acceptance criteria pass.
- Relevant automated checks pass.
- Manual visual and interaction review is complete when applicable.
- Errors, empty states and failure states are handled.
- Documentation is updated.
- No fake claims or unapproved content are introduced.
- Owner review/approval is recorded where the task changes public positioning or release behavior.

## 10. Release and deployment controls

- Production deployment is a separate approval gate.
- Confirm agency identity, domain, legal operator, email inbox and content approvals before launch.
- Keep configuration secrets server-side and out of Git.
- Back up the current deployment before replacement.
- Verify SSL, canonical URLs, sitemap, robots, contact delivery and all primary routes.
- Record rollback steps and who is responsible for them.
