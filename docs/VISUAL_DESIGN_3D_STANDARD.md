# Visual Design System & 3D Experience Standard

**Status:** Design and engineering baseline  
**Goal:** Premium, memorable, understandable and useful—not visual effects for their own sake.

## 1. Experience principles

The agency website should feel confident, contemporary, technically capable and human. Use strong typography, deliberate spacing, clear content hierarchy, high-quality imagery/diagrams and restrained motion.

Visuals must help a visitor understand at least one of:
- What the agency builds.
- How the service divisions relate.
- How a product works.
- What a project looks like.
- How a workflow moves from input to outcome.

Avoid generic stock-photo grids, random gradients, excessive glassmorphism, unreadable microtext, perpetual motion, decorative dashboards that imply fake analytics, and 3D scenes that hide the site's actual content.

## 2. Theme direction

The design direction is a premium digital studio aesthetic:
- Strong editorial typography and clear page hierarchy.
- A restrained neutral foundation with a deliberately limited accent palette.
- High-contrast surfaces and clear interactive states.
- Depth created through layered composition, lighting, perspective and material—not by placing every card in a floating glass box.
- Consistent component geometry, spacing, borders, radii and icon treatment.
- A balance of light information surfaces and darker/high-impact visual sections where they improve focus.

The current implementation uses a working UI palette and typography system; this is a design baseline, not a confirmed legal/brand identity. Final logo treatment, official agency name and any brand-specific adjustments still require owner approval. Do not invent an official brand identity or logo.

Current implemented CSS tokens in `assets/css/styles.css`:

| Token group | Values / purpose |
|---|---|
| Core colours | `--paper: #f4f3ee`, `--ink: #171b19`, `--muted: #747872`, `--line: #d8d9d1`, `--lime: #d7fc62`, `--orange: #f0784c`, `--white: #fff` |
| Typography | `--sans: "Manrope", Arial, sans-serif`; `--mono: "DM Mono", monospace` |
| Layout | `--max: 1220px` content width |
| Spacing | `--space-1` through `--space-16` (4, 8, 12, 16, 20, 24, 32, 40, 48 and 64px) |
| Shape/motion | `--radius-sm: 2px`, `--radius-md: 4px`, `--motion-fast: 160ms ease` |

Use these shared tokens for new page components and extend them only when a real component need is documented. Existing established page styles may retain a one-off value where changing it would harm layout or regression stability.

## 3. 3D and spatial visual use cases

Use 3D selectively in these places:

### A. Hero / agency identity
A single, memorable spatial composition can express connected disciplines—software, AI, design, commerce and Web3. It should have a clear focal point and short labels. Visitors must understand the visual without needing to rotate it.

### B. Service ecosystem
An interactive map can show the six service divisions and how they connect around product delivery. Selecting a node should reveal a plain-language explanation and a direct link to its service page.

### C. Project and product showcases
Use real product screenshots, 3D device/mockup framing or exploded diagrams when they improve comprehension. Product UI must remain readable; do not make visitors rotate a 3D object just to inspect essential screenshots.

### D. Automation/workflow visualisations
Represent triggers, steps, integrations, approvals and outputs as a comprehensible flow. The flow must remain understandable as a static diagram and provide labels for all nodes and connectors.

### E. Technical explanations
Use architecture views, request/data-flow diagrams, contract interaction maps or process visualisations where the page benefits from them.

## 4. Interaction requirements

Every interactive visual must provide:

- A visible instruction or affordance when interaction is not obvious.
- Mouse, touch and keyboard access where interaction is offered.
- Clear focus states and sensible tab order.
- Click/tap targets large enough for touch.
- A non-interactive/static alternative with the same essential information.
- No essential content available only through hover or canvas rendering.
- A reset/recenter control for rotatable scenes.
- A way to pause or avoid movement.

For a static CSS service constellation with no user-controlled rotation and no continuous animation, reset/recenter and pause controls are not applicable. Document that no persistent movement occurs; retain normal link focus, touch targets and reduced-motion behavior.
- No forced motion, sudden camera movement or disorienting zoom.
- No use of colour alone to communicate state.
- A semantic text summary and relevant accessible labels.

If a visual is only decorative, mark it as hidden from assistive technology and ensure it does not intercept pointer or keyboard input.

## 5. Accessibility and motion

- Respect `prefers-reduced-motion: reduce`; remove non-essential movement and offer static presentation.
- Avoid rapid flashing, strobing and large persistent parallax.
- Keep headings, text, buttons and form controls as real HTML outside the WebGL canvas.
- Maintain readable contrast on all overlays and labels.
- Test keyboard-only flow, screen-reader naming and zoom/reflow.
- Do not rely on hover for mobile interactions.
- Prevent scroll hijacking and do not lock page scrolling while interacting with a scene.
- Ensure menus, dialogs and overlays follow accessible interaction patterns.

## 6. Performance and progressive enhancement

The site must remain useful when WebGL is unsupported, blocked, slow or disabled.

- Deliver a lightweight static image/SVG/CSS fallback first.
- Load 3D code and large assets only where needed; defer non-critical scenes.
- Lazy-load below-the-fold scenes and avoid downloading several 3D engines.
- Prefer compressed, appropriately sized assets and reusable materials.
- Limit mesh/texture complexity and avoid unnecessary post-processing.
- Dispose of GPU resources when scenes unmount or are no longer used.
- Prevent layout shifts by reserving the visual container's size.
- Avoid making the 3D bundle a prerequisite for navigation, forms, SEO content or project details.
- Test on mid-range mobile hardware, not only a powerful desktop.

The exact performance budgets are to be set after the Phase 1 baseline is measured. Record actual bundle and asset sizes; do not claim a performance score without a test result.

## 7. Technology selection

The current platform is static HTML/CSS/JavaScript with a PHP inquiry endpoint and a PHP-enabled shared-hosting target. Keep this architecture unless a feature demonstrates a real need to change it.

Possible implementation choices:
- CSS transforms and SVG for light, responsive depth effects.
- Three.js for carefully scoped WebGL scenes that need real 3D.
- Spline embed only if the scene can be controlled, optimized and made accessible within the site's security policy.
- GSAP or a small motion utility only when CSS/WAAPI does not adequately express the interaction.

Do not migrate the whole site to React or another framework solely to use React Three Fiber. If a later migration is proposed, document hosting, bundle, maintainability, accessibility and deployment trade-offs first.

Third-party scenes/embeds require an origin-specific CSP review. Do not remove the existing security policy to make an embed work.

## 8. Visual quality workflow

For every major page or scene:

1. Define the user question the visual answers.
2. Sketch a low-fidelity layout and content hierarchy.
3. Define a static fallback before building the interaction.
4. Review a desktop and mobile composition.
5. Build the accessible HTML content and functional links first.
6. Add animation/3D as progressive enhancement.
7. Test keyboard, touch, reduced motion, zoom and WebGL failure.
8. Measure asset weight and runtime behavior on representative devices.
9. Capture screenshots and review them manually.
10. Accept only when the visual is both attractive and useful.

## 9. Page-level visual consistency

- Use one shared header, navigation system, footer, button language, form style and content grid.
- Keep page-specific hero layouts within a common design system.
- Distinguish links, buttons, filter controls and status badges visually and semantically.
- Keep project statuses explicit and consistent.
- Use real imagery with appropriate alt text; descriptive alt text should explain the relevant visual, not repeat decorative copy.
- Provide empty, loading, success, warning and error states for interactive elements.

## 10. Acceptance checklist

- [ ] Visual hierarchy and page purpose are clear within the first screen.
- [ ] The design is coherent across all routes.
- [ ] Typography is readable and scales well.
- [ ] Mobile navigation and layout work without horizontal overflow.
- [ ] 3D has a defined purpose and visible instructions if interactive.
- [ ] A static fallback preserves all essential information.
- [ ] Reduced-motion mode is usable.
- [ ] Keyboard and touch interactions work. A static, non-rotating map does not require reset/pause controls; test that its links remain reachable and that reduced-motion removes its hover transition.
- [ ] WebGL failure does not break the page.
- [ ] Assets and bundles are measured and reasonably optimized.
- [ ] Screenshots have been manually reviewed on desktop and mobile.
