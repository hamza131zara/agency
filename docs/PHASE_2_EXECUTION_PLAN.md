# Phase 2 — Premium Visual Identity & Purposeful 3D Experience

**Status:** IN PROGRESS — execution plan and first CSS 3D refinement are being developed on `phase2/premium-visual-identity-3d`.  
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

- Capture and review screenshots at 320, 390, 768 and 1440px for changed routes.
- Test keyboard, visible focus, touch, zoom/reflow and reduced-motion behavior.
- Validate the static/no-WebGL experience and ensure navigation/content still work when effects are unavailable.
- Measure image/asset additions and avoid increasing runtime dependencies without a documented reason.
- Run the complete existing CI suite; fix new regressions before requesting review.

## 4. Acceptance criteria

- [ ] Owner-reviewable visual direction and design-token changes are documented; final official brand approval is recorded separately.
- [ ] Home has a more dimensional, understandable hero/spatial object that supports the agency's six-discipline proposition.
- [ ] Any interactive visual has an equally useful static/semantic fallback.
- [ ] All six service links remain accessible and route to their existing detail pages.
- [ ] No essential information depends on hover, animation, WebGL or colour alone.
- [ ] Responsive layouts remain usable at 320, 390, 768 and 1440px.
- [ ] Reduced-motion, keyboard and touch checks pass.
- [ ] No unapproved project screenshots, fake UI, fabricated outcome metrics or unsupported brand claims are introduced.
- [ ] Asset/runtime impact is measured and documented.
- [ ] CI passes on the exact final PR head and owner visual review is recorded.

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
**Current head:** `4446d928c35ada4a7478e431a54c4ee533abb1d8`  
**Latest run:** [CI #41835653951](https://github.com/hamza131zara/agency/actions/runs/41835653951) — static validation passed; browser/responsive/accessibility job is still running.

| Work package | Progress | Evidence / next check |
|---|---|---|
| P2.1 — Visual baseline and art direction | Baseline reviewed; current palette/wordmark explicitly remain provisional. | Screenshot review at 1440px and 390px; design notes in `docs/VISUAL_DESIGN_3D_STANDARD.md`. |
| P2.2 — Hero / spatial brand object | First CSS-only visual refinement implemented. | Desktop/mobile captures reviewed; the nonessential hub caption was hidden on mobile after the shortened caption still clipped in the 390px screenshot; verify the final screenshot in the latest CI run. |
| P2.3 — Interactive service map | Focus, hover and active feedback refined; all six destinations remain native links. | Existing keyboard/touch test coverage; verify latest run before closing this work package. |
| P2.4 — Evidence-led work/product visuals | Not started; current project mockups remain illustrative. | Await approved project screenshots and contribution/usage permissions. Do not add unverified assets. |
| P2.5 — Performance, accessibility and regression | In progress. | CSS increased by 2,188 characters versus `main`; no new assets, JavaScript or runtime dependencies. Latest browser/responsive/axe run must pass and screenshots must be reviewed. |

This is a progress record, not a Phase 2 completion declaration. The acceptance checklist above remains open until final CI and owner visual review are recorded.
