# Website Launch Readiness — 7 November 2026

**Release target:** Saturday, 7 November 2026  
**Current state:** NOT READY TO DEPLOY — code/CI is healthy; Software Damage Control (SDC) and `softwaredamagecontrol.com` are owner-supplied and repository canonical SEO is configured, but DNS, Hostinger, SSL, mail, legal and manual release evidence remain outstanding.  
**Release record:** `docs/LAUNCH_APPROVALS.json`  
**Strict pre-deploy preflight:** `python scripts/validate_launch_readiness.py --strict-predeploy`  
**Full post-deploy release gate:** `python scripts/validate_launch_readiness.py --strict`

## What is already in place

- 30 HTML routes: 14 root pages, six service detail pages, five portfolio project-note pages and five product detail pages.
- Product catalogue search, category and availability filters.
- Five dedicated product detail pages with documented limitations and release decisions.
- Six-product readiness and release-governance registers.
- Contact endpoint with CSRF validation, field validation, honeypot, per-session throttling and a safe “not sent” response when mail is unconfigured.
- Server-side mail configuration is excluded from Git by `.gitignore`; `config.example.php` is a template only.
- Legal pages are deliberately marked noindex and excluded from the sitemap while draft.
- `sitemap.xml`, `robots.txt` and self-referencing canonical tags on all 26 indexable routes now use `https://softwaredamagecontrol.com`; live DNS/HTTPS/sitemap fetch remains unverified.
- Hostinger deployment runbook is present; repository status remains NOT DEPLOYED.

## Launch blockers — owner action required

These details cannot safely be invented or inferred from the repository.

### 1. Brand and legal operator

- [x] Owner supplied public display name: Software Damage Control (SDC).
- [x] Owner supplied the final SDC shield image and separate favicon on 8 November 2026. Use only the exact owner-supplied files `assets/brand/sdc-logo.webp` and `assets/favicon.webp`; all generated SVG shield variants and the old placeholder mark are retired. Social-preview assets remain a separate approval item.
- [ ] Confirm the legal operator's full name/entity, jurisdiction and business address.
- [ ] Supply an official legal contact email.
- [ ] Have the Privacy Notice reviewed against actual data collection, mail hosting, session cookies, server logs, third-party fonts and retention.
- [ ] Have Terms and Disclaimer reviewed for the real operator, applicable jurisdiction and scope.
- [ ] Record reviewer, date and approval evidence in `docs/LAUNCH_APPROVALS.json`.
- [ ] Only after approval: remove draft labels, update legal content and allow indexing as appropriate. Keep them noindex until then.

### 2. Domain, DNS and SEO

- [x] Owner supplied `softwaredamagecontrol.com`; repository uses `https://softwaredamagecontrol.com` (apex) as the canonical origin.
- [ ] Point domain DNS to the selected Hostinger site and verify propagation.
- [ ] Enable SSL; verify the certificate and HTTPS response.
- [ ] Verify HTTP redirects to the chosen HTTPS canonical host and that www/non-www behavior is consistent.
- [x] Replace the sitemap host and robots Sitemap directive with `https://softwaredamagecontrol.com`.
- [x] Add and validate self-referencing canonical URL tags on all 26 indexable pages.
- [ ] After DNS/SSL/deployment, fetch the live sitemap over HTTPS; confirm 26 indexable URLs, no duplicates, no placeholders and no draft/noindex URLs.
- [ ] Verify the 404 page is noindex and absent from the sitemap.
- [ ] Verify Search Console domain property ownership; request indexing only after final checks.

### 3. Contact delivery

- [ ] Choose a monitored agency inquiry inbox.
- [ ] Create/verify a sender address on the approved domain.
- [ ] Configure SPF/DKIM (and DMARC policy as appropriate) using Hostinger/email-provider instructions.
- [ ] Copy `config.example.php` to `config.php` on the server only. Never commit or upload it to the public Git repository.
- [ ] Set `recipient_email`, `from_email` and `from_name` with verified values.
- [ ] Submit a real test inquiry from the deployed HTTPS site.
- [ ] Verify it reaches the inbox (including spam), has the correct Reply-To and does not expose errors/secrets.
- [ ] Record that the endpoint's success message means host mail acceptance, not guaranteed final inbox delivery.

Until this is done, the contact endpoint intentionally returns a clear “Your inquiry has not been sent” response and provides local copy/download alternatives. Do not advertise the form as working email delivery before the test passes.

### 4. Hostinger deployment

- [ ] Confirm the Hostinger plan supports the current PHP endpoint and identify the document root.
- [ ] Verify the supported PHP version and required extensions/session behavior.
- [ ] Back up the current `public_html` and any existing configuration before replacing files.
- [ ] Approve the exact release commit and deployment owner.
- [ ] Upload the approved files with `index.html` at the document root.
- [ ] Install private `config.php` server-side only.
- [ ] Confirm `.htaccess` is honored on the hosting stack; verify security headers and CSP using the deployed response.
- [ ] Enable HTTPS before enabling any permanent HTTPS redirect.
- [ ] Record deployed commit, timestamp, domain, backup location and approver.

### 5. Final production smoke test

- [ ] Open all 30 HTML routes; confirm expected status and no missing assets.
- [ ] Test all primary navigation, product cards, source/demo links, breadcrumbs and footer links.
- [ ] Test catalogue search/category/availability combinations and clear/reset.
- [ ] Test product details, availability labels, no accidental purchase/install actions and the Auto-Trading-Agent unavailable state.
- [ ] Test contact validation, CSRF, safe not-configured state, and real inbox delivery after configuration.
- [ ] Test the Project Brief Builder copy/export/print and handoff to Contact; ensure it does not submit automatically.
- [ ] Test the 404 page and invalid routes.
- [ ] Review 320px, 390px, 768px and 1440px layouts on actual browsers/devices.
- [ ] Complete keyboard-only and screen-reader review; automated axe checks do not replace human review.
- [ ] Verify SSL, redirects, CSP, security headers, sitemap and robots over the deployed domain.
- [ ] Check browser console, PHP/server logs, spam filtering and analytics/tracking state. Do not enable analytics unless separately approved and disclosed.

### 6. Agency marketing, SEO, AEO and GEO activation

- [ ] Approve the agency's real public brand/name, primary audience, target markets and primary offer.
- [ ] Confirm all public claims, team bios/credentials, project attribution, screenshots, testimonials and outcome metrics are supported and consented.
- [ ] Keep the editorial plan focused on helpful service guides, buyer questions, original project evidence and technical notes; do not publish scaled, thin or keyword-stuffed content.
- [ ] Run `python scripts/validate_discoverability.py`; resolve duplicate/missing titles, descriptions, H1s and index/noindex conflicts.
- [x] Add and validate source-level self-referencing canonical URLs for all 26 indexable pages. [ ] Verify the same URLs on the deployed domain after DNS/SSL.
- [ ] Add approved Open Graph/social preview assets and ensure image rights/alt text are recorded.
- [ ] Add Organization/LocalBusiness markup only when it accurately matches visible, approved identity/location information.
- [ ] Verify the domain in Google Search Console and Bing Webmaster Tools after DNS/HTTPS checks; fetch sitemap and request indexing only after release acceptance.
- [ ] Establish baseline organic search queries, qualified enquiries and conversion measurement without activating unapproved analytics or advertising pixels.
- [ ] Confirm Google Business Profile eligibility before creating any local profile. Do not use virtual offices, unverified addresses, artificial city pages or fake reviews.
- [ ] Do not promise ranking, AI Overview placement, Copilot/ChatGPT citations, traffic or lead volume. Review AI-performance reports only once real data is available.
- [ ] Approve channel budget, campaign owner, lead follow-up responsibility and contact delivery before paid campaigns or outbound activation.

See `docs/AGENCY_MARKETING_SEO_AEO_GEO_STRATEGY.md` for the marketing hypotheses, channel sequence, content plan, metric definitions and platform references.

## Product-marketplace launch boundary

The agency catalogue can describe public tools and development-stage projects accurately. It is not a ready-to-install or transactional marketplace today.

- STRIDETO remains a hosted reference platform, not an agency resale package.
- RegexLab and JotJSON remain public browser tools; no commercial distribution package or paid edition is approved.
- SiteIntel Pulse and Free AI Mixer remain in development.
- Auto-Trading-Agent remains excluded and not available to buy/install.
- Do not add prices, Buy buttons, download links, support SLAs, installation promises or checkout.
- No product is currently approved as ready-to-install or commercially available.

## Strict release gate

Run these checks from the release checkout:

```bash
python scripts/validate_site.py
python scripts/validate_portfolio_evidence.py
python scripts/validate_portfolio_acceptance.py
python scripts/validate_product_release_governance.py
python scripts/validate_launch_readiness.py
python scripts/validate_discoverability.py
node --check assets/js/main.js
php -l contact.php
php -l config.example.php
python tests/test_contact_endpoint.py
npm install
npm run test:e2e

# Before first upload, after owner/legal/domain/hosting inputs are supplied:
python scripts/validate_launch_readiness.py --strict-predeploy

# After staging upload, private config, SSL and live smoke tests:
python scripts/validate_launch_readiness.py --strict
```

The default launch-readiness run is report-only and lists blockers. `--strict-predeploy` must pass before the initial upload. The full `--strict` gate must pass after staging/production smoke tests and before public launch announcement or final DNS cutover.

## Rollback

Before launch, store a complete backup of the current web root and private configuration. If any critical route, contact, SSL, security header or asset fails, restore the previous verified release and investigate before retrying. Do not overwrite the only backup during a rollback.


## Theme and interaction acceptance — 8 November 2026

- [ ] Confirm the approved Chrome-inspired palette is applied consistently to site chrome, service/product panels, forms, filter chips and status labels.
- [ ] Verify primary, secondary and outline buttons in default, hover, active, focus-visible and disabled states.
- [ ] Verify blue hover uses charcoal foreground text for contrast; do not use white on `#4285F4` for small button labels.
- [ ] Confirm the 3D service hub uses `assets/brand/sdc-logo.webp`, not a monogram or alternate logo.
- [ ] Confirm 3D orbit/scroll reveal pauses on interaction and respects `prefers-reduced-motion`.
- [ ] Keep product-specific preview artwork intact; apply the SDC palette to surrounding interface chrome rather than overwriting distinct product identities.
- [ ] Run the full Playwright, responsive and WCAG suites after theme changes.
