# Phase 1 acceptance checklist

## Implemented
- [x] Responsive portfolio home and Services, Work, About, Contact and Privacy pages.
- [x] Project showcases without fabricated testimonials or quantified outcomes.
- [x] Phase 2 automation items labeled planned, not available.
- [x] Server-side contact validation, CSRF token, origin check, honeypot and basic per-session throttling.
- [x] Contact endpoint refuses success when the inbox is not configured or mail is rejected.
- [x] Metadata, favicon, sitemap/robots template, 404 page, host headers and deployment notes.
- [x] CI checks for metadata/links, JavaScript/PHP syntax and contact endpoint smoke tests.
- [x] Automated Playwright coverage for routes, mobile navigation, narrow-width overflow and contact failure states.
- [x] Homepage and Contact inquiry categories match the PHP server-side allow-list.
- [x] Portfolio explorer supports search, category and status filters with an accessible live result count.
- [x] Project Brief Builder creates a structured local draft and supports copy, plain-text download, structured JSON export and browser print/Save as PDF without server submission or persistent storage.
- [x] Explicit Continue-to-contact handoff prefills a concise summary through temporary session storage and removes it on contact-page load.
- [x] Contact page provides local copy/download fallback when the inbox is unconfigured or the inquiry endpoint is unreachable.
- [x] Services page includes a guided Service Finder and carries the selection into the local Project Brief Builder.
- [x] E2E regression tests cover the portfolio explorer and project-brief flow.
- [x] Automated axe scans for serious/critical WCAG 2.1 A/AA violations, with browser screenshots uploaded as CI artifacts.
- [ ] Review the generated desktop/mobile screenshots and manually keyboard/screen-reader test.
- [ ] Perform a manual contrast/accessibility audit; automated scanning is not proof of full WCAG conformance.
- [ ] Real email delivery test on the final Hostinger domain (deferred until the domain, hosting and mailbox are purchased).

## Owner input before launch
- [ ] Confirm official agency name/logo.
- [ ] Confirm canonical domain and replace YOUR-DOMAIN.example references.
- [ ] Configure monitored inbox and verified sender in Hostinger config.php.
- [ ] Verify current state, contributions and technology stacks for each project.
- [ ] Add approved project screenshots.
- [ ] Finalize privacy details for actual legal operator and jurisdiction.

## Not in Phase 1
SMS product; Instagram/social scheduling or publishing; client dashboards; workflow builder; approval queue; webhook control plane; payment or analytics integrations.

No deployment is included. Domain, hosting, mailbox setup and Hostinger publishing are deliberately deferred until the owner is ready.
