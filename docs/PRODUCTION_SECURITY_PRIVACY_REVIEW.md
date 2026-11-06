# P6.6 — Production Security, Privacy and Operational Readiness Review

**Status:** review baseline; production release remains blocked.  
**Review date:** 7 November 2026  
**Scope:** public PHP/static website, contact endpoint, P6.4/P6.5 Node/PostgreSQL automation sandbox, and release/hosting boundary.

## 1. Executive assessment

The repository has a useful secure-development baseline and automated checks, but it is **not a production-ready lead-management or automation service**.

### Current controls observed

- PHP contact endpoint uses a server-side session CSRF token, strict-mode cookie-only PHP sessions, an HttpOnly/SameSite=Strict session cookie, exact same-origin validation (scheme, hostname and effective port), a 16 KiB request-body ceiling when Content-Length is supplied, request validation, a honeypot, per-session throttling and safe failure when mail configuration is missing.
- Live mail settings are expected in server-only config.php; the repository ignores that file and provides only config.example.php.
- The PHP endpoint does not persist inquiry content to an application database. On successful host mail acceptance, the inquiry is handed to the host's mail mechanism; delivery to the final inbox is not guaranteed.
- .htaccess supplies an Apache/LiteSpeed security-header/CSP baseline and prevents directory listing; its effectiveness must be verified on the actual hosting stack.
- P6.4/P6.5 automation sandbox validates signed source events, uses PostgreSQL transactions/outbox/idempotency, keeps the notification adapter fake, hashes operator passwords and stores only hashes of opaque session/CSRF tokens.
- Operator APIs require server-side session authentication, CSRF and same-origin checks for state changes; the console uses a restrictive CSP and DOM text rendering.
- CI runs a disposable PostgreSQL integration suite, site validation and browser/accessibility checks.

### Release blockers

1. Automation runtime is still a sandbox with no production notification adapter. Production startup is now fail-closed.
2. The Node API itself does not terminate TLS. A selected runtime/reverse proxy must provide HTTPS, safe headers and controlled network access.
3. Database TLS, backups, restore testing, monitoring, alerting, incident response and service-level ownership have not been configured.
4. Operator failed-login limiting is in process memory and is only suitable for a single-instance internal test. It is not a production abuse-control system.
5. The operator console has one password-based owner account, no MFA, no staff roles and no recovery/invitation workflow.
6. No inquiry, lead, attempt, session or audit retention/deletion period has been approved or automated.
7. Legal operator, jurisdiction, privacy basis, official contact, domain, mail provider and production hosting are not confirmed.
8. The Privacy Notice, Terms and Disclaimer remain drafts/noindex and require review against the actual deployment and data flows.

A CI pass proves only the checks executed by that workflow. It does not prove a legal/privacy review, production penetration test, provider deliverability, backup recovery, or deployment configuration.

## 2. Data-flow inventory

### Public website and project enquiry

| Data / activity | Current handling | Storage or recipient | Outstanding verification |
|---|---|---|---|
| Name, email, selected service, project message | Validated by contact.php | Sent to configured recipient through PHP host mail(); not written to an application database | Confirm server mail path, recipient, sender identity, inbox retention and access |
| CSRF token and submission throttling | Session state | PHP session storage on hosting provider | Confirm PHP session storage location, expiry and cleanup behavior |
| Request metadata / IP | May be present in web-host access logs | Hosting provider logs | Confirm log fields, access, processor terms and retention |
| Project Brief Builder answers | Assembled in the browser | Current page memory; the handoff summary uses sessionStorage temporarily and is removed during contact-page initialization | Re-verify browser storage behavior and avoid adding persistence without approval |
| Web fonts | Requested from Google Fonts | Browser makes third-party requests to Google Fonts infrastructure | Decide whether to self-host fonts or disclose the actual third-party request in the final notice |
| Local copy / text download | User-triggered browser action | User's device only | Keep wording clear that these controls do not submit or store a server-side inquiry |

The contact endpoint currently returns an honest not-configured response if private mail settings are missing. The site must not describe the form as reliably delivering email until a real deployed test confirms receipt and Reply-To behavior.

### P6.4/P6.5 automation sandbox

| Data / activity | Current handling | Storage | Production status |
|---|---|---|---|
| Lead event | Signed server-to-server synthetic event | PostgreSQL leads table | Synthetic fixtures only; public form is not connected |
| Notification work | Transactional outbox intent | PostgreSQL outbox_jobs | Fake transport only; no message is sent |
| Delivery attempt | Attempt number, retry generation, outcome and sanitized code | PostgreSQL delivery_attempts | Test data only |
| Audit metadata | Event/job identifiers, action, actor and timestamps | PostgreSQL audit_events | Avoid adding lead message/name/email to audit metadata |
| Operator credential | Scrypt salt + derived password hash supplied via server environment | Environment/secret configuration, not Git | No production secret manager selected |
| Operator session | Random opaque token and CSRF hashes only | PostgreSQL operator_sessions | Single internal operator; 8-hour absolute expiry |
| HMAC source keys | Server-side keyring environment variable | Runtime environment | No real source/production key rotation procedure approved |

## 3. P6.6 code hardening included in this package

- Operator session cookie path is scoped to /v1/operator, rather than the entire host, while retaining HttpOnly, SameSite=Strict and Secure outside local development.
- The sandbox-only API and fake-transport worker refuse to start when NODE_ENV=production. This is a fail-closed guard, not a production deployment mechanism.
- CI tests the production guard and operator cookie scope.
- The runtime remains isolated from contact.php; no live contact forwarding has been introduced.

## 4. Threat model and required controls before real inquiries

| Threat | Current position | Required before live use |
|---|---|---|
| Forged source event / replay | HMAC-SHA256, key ID, timestamp window, constant-time signature comparison, source allowlist and idempotent event ID | Real sender adapter, key rotation runbook, network/rate controls and adversarial tests |
| Duplicate / lost notification intent | Transactional outbox and unique idempotency key | Provider idempotency/reconciliation, delivery receipts and operational alerting |
| Operator session theft | Opaque random cookie; only hash stored; HTTP-only, SameSite, scoped path; revocation and expiry | HTTPS enforcement, secure proxy/header policy, session monitoring, MFA decision, recovery and key rotation |
| Login brute force | Five failures per IP per 15-minute in-process window | Shared rate limiter/gateway, trusted proxy design and alerting; current limiter is not production-grade |
| CSRF / cross-origin mutation | Required Origin header must match scheme, hostname and effective port; session CSRF token; cookie-only strict-mode PHP sessions | Verify proxy/host configuration and include browser/security tests in release environment |
| Cross-site scripting in inquiry content | Operator UI inserts dynamic values as text nodes, not HTML; restrictive CSP | Continue output encoding, dependency review and manual security testing |
| Secret exposure | No secrets committed by design; runtime config is environment-based | Managed secret store, least-privilege access, rotation, audit and emergency revoke procedure |
| Database compromise / data loss | PostgreSQL schema and transaction tests | TLS, least-privilege DB user, encryption-at-rest decision, automated backups, restore drills, access review and incident plan |
| Abuse / denial of service | Body limits and process-local limits on API/login | Edge throttling/WAF, bounded concurrency, resource limits, monitoring and incident response |
| Excess personal-data retention | No retention job is active | Owner/legal-approved schedule, deletion workflow, backup expiry, deletion verification and audit evidence |

### Production runtime prerequisites

The automation runtime is a Node.js API + background worker + PostgreSQL service. The marketing website targets PHP-enabled shared hosting. Do not assume the current Hostinger shared plan can run a durable Node worker or scheduled process.

Before a live pilot:
- Select a Node-capable application runtime and PostgreSQL provider based on region, TLS, backups, logging, scaling, support and cost.
- Decide where TLS terminates; only expose the API through the approved HTTPS ingress. Do not expose the database publicly.
- Use a dedicated least-privilege database role and TLS-verified database connections.
- Put HMAC secrets and the operator password hash in a managed secret store or equivalent protected server environment.
- Define deployment, migration, rollback and secret rotation procedures.
- Add metrics/alerts for intake rejection, database health, queue age, retry rate, dead-letter growth, worker heartbeats, mail/provider failures and session abuse.
- Define backup frequency, retention, point-in-time recovery expectations and conduct a restore exercise.
- Configure an on-call/support owner and incident severity/escalation process.

No host, provider, paid service or infrastructure spend is selected by this review.

## 5. Privacy and legal decision gates

The public notice must describe the actual operating model, not a generic template. Before accepting real inquiry data, the owner and an appropriately qualified reviewer must determine:

- Legal operator/entity, jurisdiction, business address and official privacy contact.
- The purposes and lawful basis for contact handling and any later lead-management system.
- Whether the website is controller, processor or both for each activity, and any processor/subprocessor arrangements.
- Hosting, mail, database, backup, analytics, security-monitoring and font service providers; processing locations and transfer safeguards as applicable.
- What data is mandatory versus optional, who can access it, and how it is secured.
- The approved retention period for unconverted enquiries, active project records, mailboxes, sessions, logs, backups and audit data.
- Access, correction, deletion, objection and complaint handling routes where applicable.
- Whether marketing follow-up needs a separate opt-in and unsubscribe mechanism. An enquiry must not silently become consent to marketing.
- Whether any real or sensitive personal data should be prohibited in the message field and how inbound attachments are handled (the current form has no attachment field).

### Retention decision — intentionally not set

Do not invent a retention period in code or the privacy notice. The owner/reviewer must approve separate periods for:
- Unconverted enquiries
- Active and completed project records
- Operator sessions
- Security and access logs
- Delivery attempts and non-identifying operational metrics
- Backups and disaster-recovery copies

After approval, implement deletion/purge behavior, backup expiry and evidence that deletion is completed. Audit metadata should remain minimal and should not retain inquiry message content by default.

### Required legal-page review

Keep privacy.html, terms.html and disclaimer.html visibly marked as drafts and noindex until the actual operator, jurisdiction, processes and legal text are reviewed. Do not update docs/LAUNCH_APPROVALS.json to claim approval without evidence.

## 6. Release-acceptance evidence

A production release should not be approved until every relevant item below has evidence:

- [ ] Owner approves exact scope, primary market, data flows and the limited live-pilot audience.
- [ ] Legal operator and jurisdiction are confirmed; Privacy Notice, Terms and Disclaimer receive qualified review.
- [ ] Retention and deletion periods are approved and implemented, including backups and logs.
- [ ] Production identity/access model, MFA decision, session recovery, shared login protection and staff access (if any) are reviewed.
- [ ] External security review/penetration testing is completed for the exposed API and operator interface.
- [ ] Secrets, HMAC key rotation and emergency revocation are tested.
- [ ] Node runtime, PostgreSQL, HTTPS ingress, TLS, network restrictions and database access are verified.
- [ ] Backup/restore test succeeds and rollback is rehearsed.
- [ ] Monitoring, alerts, worker liveness, dead-letter handling and incident response are tested.
- [ ] Real provider selection, consent, deliverability tests and provider-specific idempotency/reconciliation are completed.
- [ ] Contact form forwarding is implemented with fallback semantics so the website never falsely reports a successful lead intake.
- [ ] Manual keyboard/screen-reader/mobile accessibility review is complete for the operator console.
- [ ] Public marketing claims, portfolio attribution, team bios and commercial availability are approved.
- [ ] Domain/canonical URLs, robots, sitemap, legal pages, contact inbox and final publication are accepted by the owner.

## 7. Release decision rule

**Current decision: NOT APPROVED FOR PRODUCTION OR REAL CUSTOMER DATA.**

P6.6 may complete repository hardening, strategy, documentation, test gates and release preparation. The sandbox remains blocked from production startup and uses only synthetic test events with a fake transport. A later production PR and explicit owner release approval are required before any live contact integration, external provider or deployment.

This document is a technical readiness review, not legal advice, a certification, or a substitute for an independent security assessment.
