# Free Netlify publication runbook — Software Damage Control (SDC)

## Deployment model

The repository remains the source of truth on GitHub. Netlify builds the public static website from the `main` branch. The build creates `dist/` and intentionally excludes PHP source, private configuration examples, internal documentation, tests, automation runtime code and developer tooling.

The website is static HTML/CSS/JavaScript. The production contact form in this build uses Netlify Forms. The existing PHP endpoint remains in the Git repository for a future PHP-enabled host but is not deployed or executed by Netlify.

## Netlify account and Git connection

1. Create a Netlify account using the Free plan.
2. Choose **Add new project → Import an existing project → GitHub**.
3. Authorize Netlify to access only the `hamza131zara/agency` repository.
4. Select `main` as the production branch.
5. Netlify reads `netlify.toml`: build command `npm run build:netlify`, publish directory `dist`.
6. Deploy the first preview and inspect its `.netlify.app` URL before adding the custom domain.

Keep the account on Free and do not enable any paid add-ons or credit purchases. The current credit-based Free plan has a 300-credit hard monthly limit; when the balance is exhausted, projects pause until the next cycle. Monitor usage in the dashboard.

## Enable and test form handling

1. In the Netlify site dashboard, open **Forms** and enable automatic form detection.
2. Trigger a new production deploy after enabling detection.
3. Confirm that `sdc-project-inquiry` appears in the detected forms list.
4. Add a submission notification to an inbox the owner can access. The destination mailbox is an owner-provided setting and must not be guessed.
5. Submit a test inquiry using a controlled test identity. Verify it appears in Netlify Forms and the notification arrives.
6. Verify that a failed request does not report success; the page offers a local copy/download fallback.

Netlify Forms submissions are currently free and unlimited on its credit-based plans. Form handling is still a third-party data-processing service: update and approve the privacy notice for the actual operator, purposes, data fields, Netlify processing, access and retention before accepting real prospect information.

## Connect softwaredamagecontrol.com

1. In Netlify, open **Domain management → Add a domain** and add `softwaredamagecontrol.com`.
2. Make it the primary domain. Netlify also adds the `www` alias; configure the preferred redirect to the apex host to match repository canonical URLs.
3. Open **Pending DNS verification** in Netlify and use the exact records shown for this site.
4. At the domain registrar/DNS provider, update only the required website records. For a typical external-DNS setup, this is an apex ALIAS/ANAME/flattened CNAME (or the A-record fallback shown by Netlify) and a `www` CNAME. Keep unrelated MX/TXT records intact.
5. Wait for DNS verification and Netlify HTTPS certificate provisioning. Confirm `https://softwaredamagecontrol.com` and the `www` redirect before declaring the domain live.

Do not transfer the domain registration. The domain can remain with its current registrar; Netlify hosting and DNS are separate from the registrar account. If you already use email on the domain, inspect and preserve existing MX/SPF/DKIM/DMARC records before changing DNS.

## Before public outreach

- Replace provisional AGENCY wordmarks/page-title branding with the approved SDC identity.
- Complete owner/legal review of Privacy, Terms and Disclaimer; they currently remain draft/noindex.
- Review portfolio attribution, visual permissions, team-profile consent and every public commercial claim.
- Confirm a monitored notification inbox and a realistic lead-follow-up process.
- Test mobile/keyboard navigation, all primary links, form spam rejection, submission notifications, HTTPS and canonical redirects.
- Keep payments, customer accounts, automation pilot and paid advertising disabled.

The Netlify Free plan is a suitable zero-hosting-fee starting point for a low-traffic showcase site, not a guaranteed permanent capacity or uptime commitment. Re-check current limits in the Netlify dashboard before scaling.
