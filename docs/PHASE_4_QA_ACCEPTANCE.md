# Phase 4 — Final QA & Acceptance Record

**Review date:** 6 November 2026  
**Scope:** Portfolio catalogue and the five public project-note pages.  
**Status:** REPOSITORY / AUTOMATED-QA ACCEPTED — PR #22 merged at `b89adee04b9fe9ebae5e56e01e5cf440605fee9f`; post-merge CI [#42080702755](https://github.com/hamza131zara/agency/actions/runs/42080702755) passed. Manual owner and assistive-technology review remains a pre-launch gate.

## Automated acceptance coverage

The required GitHub Actions workflow runs the following checks:

| Area | Automated check | Acceptance evidence |
|---|---|---|
| Site integrity | `scripts/validate_site.py` | Page metadata, unique titles/IDs, required files, local links/fragments and existing site safeguards |
| Evidence governance | `scripts/validate_portfolio_evidence.py` | Six inventory records, explicit visibility, public-card parity, evidence boundaries, visual disclosures and approved image-source allowlist |
| Portfolio structure | `scripts/validate_portfolio_acceptance.py` | Exactly five public cards and detail pages; one main landmark and H1; semantic breadcrumbs, section index, shared article marker, evidence panel, related navigation and stable section anchors |
| Browser behavior | `npm run test:e2e` | Route smoke tests, catalogue search/category/status combinations, result count, empty state/reset, project-page navigation, responsive checks, keyboard behavior and WCAG accessibility assertions |
| Existing site checks | Workflow validate job | JavaScript/PHP syntax, contact endpoint smoke test and Python helper compilation |

The browser suite uses the existing viewport matrix (320, 390, 768 and 1440 pixels) and produces Playwright artifacts where configured. CI success is evidence that automated assertions passed; it is not a substitute for visual review by a person.

## Project acceptance matrix

| Project | Catalogue card | Detail page | Evidence boundary | Status treatment |
|---|---|---|---|---|
| STRIDETO | Public | Project notes | Contribution and stack not independently verified | Live per owner statement; recheck |
| RegexLab | Public | Project notes | No usage/performance metrics claimed | Live public tool |
| JotJSON | Public | Project notes | Local-first processing; no backend-upload implication | Live public tool |
| SiteIntel Pulse | Public | Project notes | Static showcase distinguished from full scanner | In development |
| Free AI Mixer | Public | Project notes | No hosted demo; provider configuration dependency | In development |
| Auto-Trading-Agent | Excluded | No public catalogue detail page | Not available to buy/install; live trading not authorized | Excluded from public catalogue |

## Manual owner review — still required before launch

- [ ] Open the Work catalogue and all five project pages at 320, 390, 768 and 1440px; inspect layout, clipping, overflow, spacing and typography.
- [ ] Review the Playwright screenshot/report artifacts for unexpected visual regressions.
- [ ] Keyboard-only review: skip link, main navigation, catalogue search/filter/reset, project links, breadcrumbs, section index and related-project navigation.
- [ ] Screen-reader review of navigation labels, live result count, status labels, headings and evidence panels.
- [ ] Recheck all external live destinations and regional availability on the actual launch environment.
- [ ] Confirm owner-approved agency contribution and relationship wording for every project; otherwise retain current neutral boundary.
- [ ] Confirm permission for any client/team identity, logos, screenshots, testimonials or outcome metrics. None are currently approved in the inventory.
- [ ] Reconfirm project status, support routes, canonical domain and launch contact details.
- [ ] Confirm legal operator/jurisdiction and review draft legal pages separately; these are not Phase 4 automated acceptance claims.

Record reviewer, date, browser/device, routes inspected, findings and evidence links in the release review before marking the manual launch gate complete. Do not infer manual approval from a green CI badge.

## Acceptance decision

Phase 4 implementation is accepted at repository/automated-QA level: the corrected exact PR head passed both required jobs and post-merge CI on `main` passed. The public launch remains conditional on the manual owner-review items above. Missing owner evidence must result in omission or qualified wording, never invented claims or unapproved assets.
