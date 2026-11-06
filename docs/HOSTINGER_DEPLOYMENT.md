# Hostinger deployment runbook

**Status: NOT DEPLOYED.** This runbook is for the approved release only. CI passing or documentation being complete does not authorize production deployment.

## 1. Pre-deployment approvals

1. Confirm the official agency name, approved logo/brand system and final domain.
2. Confirm the monitored inquiry inbox, verified sender and legal operator details.
3. Approve the public copy, all six service descriptions, team credentials, project contributions, screenshots and product statuses.
4. Review the multi-page page inventory in `docs/INFORMATION_ARCHITECTURE.md`. Do not deploy with primary navigation links pointing to missing pages or misleading placeholders.
5. Finalize the privacy notice, terms and disclaimer for the actual operator, jurisdiction and data handling.
6. Approve the specific release commit and rollback plan.

## 2. Hosting requirements

1. Choose a PHP-enabled Hostinger plan compatible with the current PHP inquiry endpoint.
2. Back up existing `public_html` contents before replacing anything.
3. Confirm the final document root and supported PHP version.
4. Keep the existing lightweight HTML/CSS/JavaScript and PHP deployment model unless a later approved architecture change requires something else.

## 3. Deploy

1. Upload only the approved release files to the document root (usually `public_html`) so `index.html` is at the root.
2. Copy `config.example.php` to `config.php` on the server only.
3. Set `recipient_email` to the monitored inbox and `from_email` to a verified sender on the final domain.
4. Never commit, publish or share `config.php` or its values.
5. Configure mail/DNS records supplied by the host, including SPF/DKIM where available. PHP `mail()` returning true means the host accepted the message for processing; it does not guarantee final inbox delivery.
6. Replace `YOUR-DOMAIN.example` in `robots.txt` and `sitemap.xml` with the approved canonical domain.
7. Enable SSL, verify it works and then enforce HTTPS.
8. Review the security headers and Content Security Policy. If an approved external integration is required, add only the required origin and test it; do not remove CSP wholesale.

## 4. Production smoke tests

- Open every page in the information architecture and verify navigation in both directions.
- Test desktop, tablet and mobile layouts.
- Test menu open/close, keyboard focus, all forms and browser-local brief actions.
- Test the 404 route and key redirects.
- Verify page titles, canonical URLs, sitemap and robots behavior.
- Verify the 3D/visual fallback on a browser/device without WebGL or with reduced motion enabled.
- Submit a real test inquiry and verify the recipient inbox, spam folder and Reply-To address.
- Check logs and errors without exposing sensitive data.

Before mail configuration is correct, the endpoint must clearly state that the inquiry has not been sent. A browser copy/download fallback is not a server submission.

## 5. Rollback and operations

- Retain a backup of the previous web root and configuration.
- Record the deployed commit, date, domain and owner approval.
- Document who owns updates, inbox monitoring, security updates and incident handling.
- If a release causes critical breakage, restore the previous verified release and investigate before redeploying.

## 6. Launch preflight and evidence record

Before any upload, read `docs/LAUNCH_READINESS_CHECKLIST.md` and complete `docs/LAUNCH_APPROVALS.json`. The repository now contains a launch guard:

- Report-only audit (used by CI): `python scripts/validate_launch_readiness.py`
- Strict release gate (must pass before publication): `python scripts/validate_launch_readiness.py --strict`

The strict gate checks:
- Approved canonical HTTPS origin and exact sitemap/robots host.
- Sitemap integrity against the 26 indexable routes; draft legal pages and 404 remain excluded.
- Approved brand and legal operator information.
- Privacy, Terms and Disclaimer approval.
- Monitored recipient inbox, verified sender, server-only mail configuration and real delivery tests.
- Hostinger/PHP/document-root confirmation, SSL, HTTPS redirect and backup.
- Owner approval, copy/asset review, keyboard/screen-reader and responsive review.

The report-only CI step intentionally exits successfully while unresolved owner/production blockers are listed. It is not a deployment approval. Use the two strict modes in order:

1. `python scripts/validate_launch_readiness.py --strict-predeploy` must exit zero before the initial upload. It checks the owner/legal/domain/hosting approvals and static files, including canonical sitemap/robots/canonical URL tags.
2. Upload to the Hostinger staging/preview or prepared target, install the server-only configuration, enable SSL and run the production smoke tests.
3. `python scripts/validate_launch_readiness.py --strict` must exit zero after the staged/production checks. It additionally verifies the real mail submission/inbox/Reply-To, HTTPS redirect, deployed sitemap and deployment record.

CI runs the report-only audit so missing owner inputs remain visible without treating a not-yet-launched website as a failed code build.

## 7. Deployment authority

Do not purchase a domain/plan, change DNS, configure production email, connect customer credentials or publish the website without explicit owner approval. A successful GitHub Actions run or a passing strict static audit does not itself perform or authorize a deployment.
