# Agency — Phase 1 Portfolio Platform

Responsive public portfolio for a software and AI agency. It is independent from the older Skill-Sphere Agency application. The site uses semantic HTML, CSS, browser JavaScript and a PHP inquiry endpoint for PHP-enabled hosting such as Hostinger.

## Phase 1 scope
- Home plus Services, Work, About/Approach, Contact and Privacy pages.
- Full-stack development, AI/LLM/agent work, integrations, cybersecurity, debugging/performance, product design and digital growth.
- Selected project showcases without fabricated testimonials or quantified outcomes.
- Contact validation, CSRF/session token, same-origin check, honeypot, basic per-session throttling.
- Transparent errors when the inbox is missing or the hosting mail service rejects an inquiry.
- Phase 2 roadmap for SMS, Instagram/social publishing, webhooks, approvals and automation workspaces. Those products are not available in Phase 1.
- SEO metadata, favicon, robots/sitemap template, 404 page, restrictive CSP and shared-hosting security headers, detailed project notes and GitHub Actions checks.

## Local checks
Run \`python scripts/validate_site.py\`, \`node --check assets/js/main.js\`, \`php -l contact.php\`, \`php -l config.example.php\`, and \`python tests/test_contact_endpoint.py\`. The endpoint smoke test does not send real email.

## Hostinger upload package
After the package workflow is merged into `main`, a successful main-branch run creates the root-level upload bundle `agency-hostinger-phase1-template.zip` and its SHA-256 checksum. Open GitHub Actions → latest successful **Phase I release checks** run on `main` → Artifacts, and download `agency-hostinger-phase1-upload`. The bundle intentionally includes placeholders and an upload instruction file; it is not production-ready until the real domain, brand, legal/privacy details and server-only email config are completed.

For a local package check, run `python scripts/package_hostinger.py --output ./dist`. The script refuses to package `config.php` and verifies that development-only files are excluded.

## Hostinger setup — only after launch approval
1. Confirm the agency name/logo, final domain, recipient inbox and legal operator details.
2. Use a PHP-enabled Hostinger plan. Back up existing public_html content before replacing files.
3. Upload approved site files into the document root so index.html is at the root.
4. Copy config.example.php to config.php on the server only. Set recipient_email to the monitored inbox and from_email to a verified sender on the final domain. Never commit config.php.
5. Configure domain mail/DNS records from your mail host, including SPF/DKIM where available. PHP mail() acceptance does not guarantee final inbox delivery.
6. Replace YOUR-DOMAIN.example in robots.txt and sitemap.xml. Enable SSL and verify it before forcing HTTPS.
7. Review the privacy notice, project descriptions and approved screenshots. Follow docs/HOSTINGER_DEPLOYMENT.md and docs/PHASE_1_ACCEPTANCE.md.

The visible name AGENCY and domain values are deliberate placeholders. Project artwork is illustrative, not production screenshots. Summaries do not claim unverified outcomes, credentials or contributions.

## Phase boundary
Phase 1 is the portfolio/services site plus a configured inquiry path. SMS, Instagram/social publishing, webhook flows, approvals and client automation workspaces are Phase 2 items.
