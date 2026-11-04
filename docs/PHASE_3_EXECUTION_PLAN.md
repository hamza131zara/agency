# Phase 3 — Service Depth, Positioning & Team Profiles

**Status:** IN PROGRESS — execution branch `phase3/service-depth-positioning-team-profiles` created from Phase 2 merge commit `d069caaf3fc10d462199d945d3c4729fed0b70a6`.  
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

- [ ] All six service pages explain fit, practical scope, delivery approach, important decisions and useful FAQs.
- [ ] Related-service links provide working routes and do not imply false project/client relationships.
- [ ] Service Finder related recommendations are real accessible links; brief and contact preselection remain correct.
- [ ] Team page contains no unapproved numeric experience, qualification or team-size claims.
- [ ] Profile publication requirements and owner-approval workflow are documented.
- [ ] No invented customer evidence, testimonials, prices, timelines, performance claims or guaranteed outcomes are introduced.
- [ ] Page titles, descriptions, headings, breadcrumbs and English-only policy remain correct.
- [ ] All browser, responsive, keyboard and accessibility checks pass on the exact PR head.
- [ ] Screenshots of all changed service/team pages are reviewed.
- [ ] Owner reviews and merges the Phase 3 implementation PR.

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

## 6. Current progress snapshot — 4 November 2026

| Work package | Status | Evidence / next action |
|---|---|---|
| P3.1 — Service page depth | FIRST INCREMENT IMPLEMENTED | All six service pages now include a tailored four-step delivery path, pre-engagement scope decisions and three FAQs. Exact-head QA still required. |
| P3.2 — Related journeys | FIRST INCREMENT IMPLEMENTED | Each service page links to complementary service pages; Service Finder recommendations now render as real accessible internal links. Exact-head QA still required. |
| P3.3 — Team profiles | PROFILE GOVERNANCE IMPLEMENTED | Removed unverified numerical experience, degree and 10+ team-size claims from public Team page. Added a profile consent/approval note and a publication checklist to `docs/PORTFOLIO_CONTENT_EVIDENCE.md`. Individual profiles remain deferred until approved evidence exists. |
| P3.4 — Evidence-led refinement | BLOCKED ON EVIDENCE | No approved analytics or inquiry-pattern dataset supplied. Do not call changes research-based. |
| P3.5 — QA | IN PROGRESS | Added Playwright tests for six service pages, four-step process, FAQs, related-link 200 responses, Service Finder links and team-claim safeguards. Run complete CI and inspect changed-page screenshots before acceptance. |

This is an execution plan, not a completion declaration. Update the table and acceptance checklist only when implementation and QA evidence exist.
