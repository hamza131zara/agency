# Hostinger deployment runbook — Phase 1

Status: NOT DEPLOYED. Use only after the owner approves the release and confirms the final domain, agency identity and email channel.

1. Confirm the public agency name/logo, final domain, monitored inbox and legal operator details; review project summaries and the privacy draft.
2. Choose a PHP-enabled Hostinger plan. Back up existing public_html content before replacing anything.
3. Upload approved release files to the document root (usually public_html) so index.html is at the root.
4. Copy config.example.php to config.php on the server only. Set the monitored recipient_email and verified sender from_email on the final domain. config.php is git-ignored and must never be committed.
5. Configure mail/DNS records supplied by the host, including SPF/DKIM where available. PHP mail() returning true means the host accepted the message for processing; it does not guarantee inbox delivery.
6. Replace YOUR-DOMAIN.example in robots.txt and sitemap.xml. Enable SSL and verify it works before forcing HTTPS. The provided .htaccess adds restrictive CSP and other security headers; if a later integration needs a new external origin, update the policy narrowly and test it rather than removing CSP.
7. Test all pages, mobile navigation, keyboard behavior, 404 and the form. Before config is correct, the endpoint must state that the inquiry has not been sent.
8. After configuring the inbox, submit a real test inquiry and verify the destination inbox, spam folder and Reply-To.
9. Review and finalize the privacy notice and project details.

Retain a backup of the old web root for rollback. Never commit or share config.php.
