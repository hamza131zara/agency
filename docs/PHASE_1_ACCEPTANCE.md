# Phase 1 acceptance checklist

## Implemented
- [x] Responsive portfolio home and Services, Work, About, Contact and Privacy pages.
- [x] Project showcases without fabricated testimonials or quantified outcomes.
- [x] Phase 2 automation items labeled planned, not available.
- [x] Server-side contact validation, CSRF token, origin check, honeypot and basic per-session throttling.
- [x] Contact endpoint refuses success when the inbox is not configured or mail is rejected.
- [x] Metadata, favicon, sitemap/robots template, 404 page, host headers and deployment notes.
- [x] CI checks for metadata/links, JavaScript/PHP syntax and contact endpoint smoke tests.
- [ ] Browser visual tests at desktop/tablet/mobile sizes.
- [ ] Manual keyboard/screen-reader and contrast audit.
- [ ] Real email delivery test on the final Hostinger domain.

## Owner input before launch
- [ ] Confirm official agency name/logo.
- [ ] Confirm canonical domain and replace YOUR-DOMAIN.example references.
- [ ] Configure monitored inbox and verified sender in Hostinger config.php.
- [ ] Verify current state, contributions and technology stacks for each project.
- [ ] Add approved project screenshots.
- [ ] Finalize privacy details for actual legal operator and jurisdiction.

## Not in Phase 1
SMS product; Instagram/social scheduling or publishing; client dashboards; workflow builder; approval queue; webhook control plane; payment or analytics integrations.

No deployment is included. Hostinger publishing remains a separate approval step.
