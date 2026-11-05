# Phase 3 — Service Depth, Positioning & Team Profiles

**Status:** COMPLETE — PR #16 merged to `main` on 5 November 2026 at merge commit `94954a3e859ae45070fc84d0e7ff3eba53be11bc`. Post-merge CI run [#41984286337](https://github.com/hamza131zara/agency/actions/runs/41984286337) passed both required jobs (`validate` and `browser-and-accessibility`).  
**Predecessor:** Phase 2 merged through PR #15; post-merge validation and browser/accessibility jobs succeeded on the merge commit.  
**Language:** English only.  
**Purpose:** improve the six service journeys and explain cross-disciplinary delivery without inventing biographies, credentials, clients, results or demand evidence.

## 1. Objective

Build on the six dedicated service pages and Service Finder from Phase 1. Each service page should help a prospective client understand the problem it addresses, the work that may be included, how an engagement is scoped, the decisions needed before work starts, and which related disciplines may be relevant.

The Team page should explain the cross-functional practice honestly. Publish individual profiles, names, portraits, qualifications, experience claims and team sizes only when the relevant people approve the wording and the evidence is confirmed.

## 2. Work packages

### P3.1 — Service positioning and page depth

For all six service detail pages:

- Make the audience/problem fit and likely engagement outcomes clearer in plain English.
- Explain a practical delivery path from discovery to handover, tailored to the service.
- Clarify scope boundaries, inputs and decisions that should be agreed before work begins.
- Add a small set of useful, service-specific questions and answers. Treat these as evergreen buyer guidance, not claims that real customer research or support-ticket analysis has occurred.
- Preserve accurate service claims, existing contact preselection and project-brief links.
- Do not publish unverified prices, delivery durations, success rates, customer examples or guarantees.

### P3.2 — Related-service journeys

- Add useful internal links between complementary service pages.
- Make the Service Finder's related-service recommendations clickable and route to the matching detail page.
- Keep the primary suggestion, project-brief and contact routes working.
- Avoid implying that every project needs every discipline.

### P3.3 — Team and expertise presentation

- Explain the six capability areas and how specialists are selected for engagement scope.
- Remove or hold any profile, experience, qualification or team-size assertion that has not been confirmed and approved for public use.
- Define a profile approval record: name, role, biography, approved portrait, skills, qualifications/experience evidence, consent and owner sign-off.
- Do not invent names, biographies, photos, seniority, employment relationships or certifications.

### P3.4 — Evidence-led conversion refinement

- Use validated inquiry patterns, Service Finder choices and analytics only when owner-approved evidence is available.
- Document what is known, unknown and measured.
- Until that evidence exists, make usability and content improvements without claiming they are data-driven.
- Do not add tracking, third-party analytics, external integrations or new user-data collection as part of this phase without a separate privacy/owner approval.

### P3.5 — Quality and release

- Check all six service routes, unique headings and page metadata.
- Test all related links and Service Finder destinations.
- Test keyboard access and native disclosure behavior for FAQ answers.
- Run responsive and accessibility checks at the established viewport matrix.
- Review screenshots of all changed pages and verify no horizontal overflow or clipped content.
- Preserve current PHP/HTML/CSS/browser-JavaScript architecture and hosting baseline.

## 3. Acceptance criteria

- [x] All six service pages explain fit, practical scope, delivery approach, important decisions and useful FAQs.
- [x] Related-service links provide working routes and do not imply false project/client relationships.
- [x] Service Finder related recommendations are real accessible links; brief and contact preselection remain correct.
- [x] Team page contains no unapproved numeric experience, qualification or team-size claims.
- [x] Profile publication requirements and owner-approval workflow are documented.
- [x] No invented customer evidence, testimonials, prices, timelines, performance claims or guaranteed outcomes are introduced.
- [x] Page titles, descriptions, headings, breadcrumbs and English-only policy remain correct.
- [x] All browser, responsive, keyboard and accessibility checks pass on the exact PR head.
- [x] Screenshots of all changed service/team pages are reviewed.
- [x] Owner reviewed and merged PR #16; post-merge `main` CI passed both required jobs.

## 4. Owner / evidence dependencies

- Consent and verified evidence for each named team profile, portrait, qualification and experience claim.
- Team lead confirmation of actual roles, availability, engagement structure and any team-size statement.
- Approved examples, client contribution statements and publishing permissions before any case-study claims are added.
- Search/query, analytics or inquiry evidence before visitor-question prioritization is described as research-based.
- Any pricing, engagement model or timeline must be supplied and approved before publication.

## 5. Explicitly out of scope

- Inventing individual profiles or publishing unsupported credentials.
- Publishing fabricated case studies, client logos, testimonials or outcome metrics.
- Adding analytics/tracking, customer accounts, forms that collect new data, payments or CRM integrations.
- Changing legal identity, canonical domain, privacy pages, hosting or production deployment.
- Replacing the existing site architecture or introducing a frontend framework.

## 6. Current progress snapshot — 5 November 2026

| Work package | Status | Evidence / next action |
|---|---|---|
| P3.1 — Service page depth | IMPLEMENTED AND VERIFIED | Six tailored service pages include a four-step delivery path, scope decisions and three FAQs each. HTML/link validation and Playwright checks pass on the exact PR head. |
| P3.2 — Related journeys | IMPLEMENTED AND VERIFIED | Related-service links return HTTP 200; Service Finder related links, brief-builder preselection and contact preselection pass regression checks. |
| P3.3 — Team profiles | GOVERNANCE IMPLEMENTED AND VERIFIED | Unverified numerical experience, degree and team-size claims are removed. Profile consent, evidence and owner sign-off requirements are documented; individual profiles remain deferred until approved evidence exists. |
| P3.4 — Evidence-led refinement | EVIDENCE BOUNDARY DOCUMENTED; DATA-LED ITERATION DEFERRED | No approved analytics or inquiry-pattern dataset was supplied. Known/unknown evidence is recorded; usability and content clarity were improved without describing the work as research-based. No tracking or new data collection was added. Revisit only when owner-approved evidence is available. |
| P3.5 — QA | AUTOMATED QA AND VISUAL REVIEW COMPLETE | Exact-head CI [#41983646119](https://github.com/hamza131zara/agency/actions/runs/41983646119) passed `validate` and `browser-and-accessibility` on PR head `742aa980`. Playwright verifies all six service routes, related-link HTTP 200 responses, Service Finder routes, team safeguards, no horizontal overflow at 320/390/768/1440px, and keyboard operation of native FAQ disclosures. Axe/browser checks passed; screenshots of all six service pages and Team at desktop/mobile were reviewed from artifact `13394891838`. |

Phase 3 is complete at repository implementation and automated QA level. Human assistive-technology review remains a separate pre-launch requirement; verified evidence and consent are still required before individual team profiles or unsupported credentials can be published. No deployment or external infrastructure changes were made.
