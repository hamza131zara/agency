# Phase 2 — Premium Visual Identity & Purposeful 3D Experience

**Status:** IMPLEMENTATION READY FOR OWNER REVIEW — PR #15 latest tested head `88a5e0797e8e24593755f86c40d8218425722ac6` passes both required CI jobs. Formal Phase 2 closure still awaits owner approval of the provisional visual/brand direction and PR #15 merge.  
**Baseline:** Phase 1 merged to `main` at `17637e7`; PR #14 exact-head CI run #151 passed.  
**Scope:** Visual-system refinement, a stronger hero/brand object, purposeful spatial navigation and evidence-led project/product visualisation.  
**Non-goals:** Final legal identity, domain purchase, production deployment, customer accounts, payments, live automation or a framework migration.

## 1. Objective

Elevate the Phase 1 multi-page platform from a coherent visual baseline into a distinctive, premium digital-studio experience. The design must remain understandable, accessible, responsive and fast. 3D must clarify the agency's connected disciplines or help visitors explore real work; it must not be decoration that competes with content.

The existing warm-neutral palette, lime/orange accents, Manrope/DM Mono typography and CSS 3D service constellation are the starting concept, not an approved final brand identity. The visible wordmark "AGENCY." remains provisional until the owner confirms the official name and logo.

## 2. Design constraints and decisions

- Keep public copy English-only and retain the six service divisions and page hierarchy established in Phase 1.
- Preserve the current semantic HTML, CSS, browser JavaScript and PHP hosting baseline.
- Prefer CSS 3D and SVG for lightweight scenes. Add Three.js/WebGL only when a documented visual requirement cannot be met accessibly and responsively with CSS/SVG.
- Keep all essential information and links in normal HTML; never put navigation or important text exclusively inside a canvas.
- No continuous auto-rotation, forced parallax, scroll hijacking or motion that cannot be avoided. Respect `prefers-reduced-motion`.
- Every interactive node must be reachable by keyboard and touch, have a visible focus state and link to a meaningful destination.
- Do not fabricate product UI, project screenshots, analytics, client outcomes or team identities. Use project visuals only when source evidence and publishing permission are recorded.
- Do not replace the provisional wordmark, logo, final colour direction or legal identity with invented brand facts. Design explorations can be presented as proposals pending owner approval.

## 3. Work packages

### P2.1 — Visual baseline and art direction

- Review the existing shared tokens and representative pages at desktop, tablet and mobile widths.
- Record the current visual direction, component gaps and any regressions before changing shared styles.
- Prepare a refined visual system using the current provisional direction: typography scale, spacing, surfaces, borders, shadows, controls, status labels and motion.
- Keep the system token-driven and document any new token with its use case.
- Present major identity changes as owner-reviewable proposals; do not claim final brand approval.

### P2.2 — Hero / spatial brand object

- Refine the existing Home service constellation into a more dimensional, polished spatial composition.
- Give the central brand object visible depth through layered geometry, lighting and perspective rather than a generic stock render.
- Retain all six real service destinations as normal HTML links.
- Provide a clear static presentation and keep the text/links usable with CSS effects disabled.
- Do not add a 3D library or large external asset unless measurement and a specific requirement justify it.

### P2.3 — Interactive service and technology map

- Improve visual hierarchy and selection feedback for the six service nodes.
- Ensure selected/focused nodes remain clear without relying on colour alone.
- Keep node names and short explanations readable at 320px and larger.
- Ensure keyboard traversal, touch activation and reduced-motion behavior remain reliable.

### P2.4 — Evidence-led work and product visuals

- Audit project/product previews and identify where a true screenshot, diagram or 3D device frame would materially improve comprehension.
- Prefer actual approved screenshots and source-backed diagrams.
- Label conceptual artwork as illustrative and do not imply a project has features that have not been verified.
- Defer any visual requiring permissions or missing evidence; do not block the whole phase on invented assets.

### P2.5 — Performance, accessibility and regression

- Capture and review screenshots at 320, 390, 768 and 1440px for changed routes; the homepage visual-review artifact now captures all four widths, while the full route set remains captured at 390 and 1440px.
- Test keyboard, visible focus, touch, zoom/reflow and reduced-motion behavior.
- Validate the static/no-WebGL experience and ensure navigation/content still work when effects are unavailable.
- Measure image/asset additions and avoid increasing runtime dependencies without a documented reason.
- Run the complete existing CI suite; fix new regressions before requesting review.

## 4. Acceptance criteria

- [x] Owner-reviewable visual direction and design-token changes are documented; final official brand approval remains an owner sign-off gate.
- [x] Home has a more dimensional, understandable hero/spatial object that supports the agency's six-discipline proposition.
- [x] The CSS-only spatial map has a semantic HTML/static fallback; all six service destinations remain real links.
- [x] All six service links remain accessible and route to their existing detail pages.
- [x] No essential information depends on hover, animation, WebGL or colour alone.
- [x] Responsive layouts are verified at 320, 390, 768 and 1440px, including explicit map-node containment assertions.
- [x] Reduced-motion, keyboard and touch checks pass in the current browser suite.
- [x] No unapproved project screenshots, fake UI, fabricated outcome metrics or unsupported brand claims were introduced; conceptual artwork is labelled.
- [x] Asset/runtime impact is measured and documented in the visual standard and evidence audit.
- [ ] Owner approves the final visual/brand direction and merges PR #15; human assistive-technology review remains a separate pre-launch gate.
## 5. Owner / external dependencies

These items may be completed independently and must not be fabricated:

- Official agency name and approved logo/brand mark.
- Final brand palette and typography approval.
- Permission to publish project images/screenshots and confirm the agency's contribution to each project.
- Human assistive-technology and keyboard/contrast review before public launch.

Until approved, the current "AGENCY." wordmark and theme remain provisional design direction. Phase 2 implementation may proceed as a reviewable concept without claiming the final identity has been approved.

## 6. Explicitly out of scope

- Domain purchase, DNS, hosting configuration or production deployment.
- Legal operator details or publication/indexing of Privacy, Terms and Disclaimer.
- Inquiry mailbox or sender configuration.
- Customer authentication, checkout, billing, product licensing or live automation integrations.
- Broad framework migration or new runtime solely for decorative 3D.

## 7. Evidence record

Each Phase 2 pull request must record: changed routes/assets, design rationale, before/after screenshots, responsive behavior, reduced-motion and keyboard/touch evidence, asset/runtime measurements, CI links, known limitations and any owner decision still required.

## 8. Current progress snapshot — 4 November 2026

**Active PR:** [#15](https://github.com/hamza131zara/agency/pull/15)  
**Current tested head:** `88a5e0797e8e24593755f86c40d8218425722ac6`  
**Latest CI:** [Run #41844344939](https://github.com/hamza131zara/agency/actions/runs/41844344939) — `validate` and `browser-and-accessibility` both passed.  
**Screenshot artifact:** `phase-one-browser-review` (artifact `13329888450`): full route set at 390px/1440px and Home at 320px/390px/768px/1440px. A Playwright assertion checks all six map nodes stay inside the spatial frame at all four widths, and the tablet navigation test opens the menu and follows its Services link.

| Work package | Progress | Evidence / next check |
|---|---|---|
| P2.1 — Visual baseline and art direction | Visual baseline and owner-reviewable token direction documented; final palette/wordmark approval pending. | Design standard records typography, palette, spacing, surfaces, component rules and motion. Current brand mark/name remain explicitly provisional. |
| P2.2 — Hero / spatial brand object | CSS-only spatial refinement implemented and reviewed at all required breakpoints. | The hub caption is hidden on mobile; max-width: 380px positions the side cards inside the narrow-phone frame; 761–850px rules rebalance the map within the tablet hero column. Screenshots at 320/390/768/1440px reviewed from CI artifact `13329888450`. |
| P2.3 — Interactive service map | Focus, hover and active feedback refined; all six destinations remain native links. | Exact-head CI passes keyboard/touch/reduced-motion checks. New Playwright regression asserts all six node boxes remain within the map frame at 320/390/768/1440px; a 768px tablet-navigation test confirms the hamburger menu and Services route. |
| P2.4 — Evidence-led work/product visuals | Evidence audit complete; authentic screenshot replacements deferred pending owner-selected source captures and publishing permission. | `docs/PHASE_2_VISUAL_EVIDENCE_AUDIT.md` records all five projects plus the service constellation, current preview status, source evidence and replacement decisions. Free AI Mixer detail page now labels its flow as conceptual. No unapproved images or invented UI added. |
| P2.5 — Performance, accessibility and regression | Automated implementation checks and screenshot review complete for this increment. | Stylesheet increased by 5,068 characters versus `main` (character count, not a gzip/performance score); no product image/model/font, production browser JS, 3D engine or WebGL dependency added. CI #41844344939 passed both jobs on exact head `88a5e07`; all four homepage breakpoints and full route captures reviewed. Human assistive-technology review remains a pre-launch owner task. |

The technical implementation is ready for owner review. Phase 2 is **not formally complete** until the owner approves the provisional visual direction/brand identity and PR #15 is merged. Human assistive-technology review remains required before public launch.


### P2.4 audit outcome — 4 November 2026

The preview audit is recorded in `docs/PHASE_2_VISUAL_EVIDENCE_AUDIT.md`. The existing work-index notice already classifies the UI previews as illustrative; STRIDETO, RegexLab, JotJSON and SiteIntel Pulse project pages do the same. Free AI Mixer now explicitly says its prompt-to-media flow is conceptual, not a production screen or available demo.

No authentic screenshot was added because the repository does not contain approved source captures or written project-image publishing approvals. This completes P2.4's audit/classification work and deliberately defers image replacement; it does not claim the missing assets are available.
