# P6.5 — Private Operator Console and Controls

**Status:** implementation in review; internal single-operator sandbox only.  
**Scope:** P6.5 in `docs/PHASE_6_EXECUTION_PLAN.md`.  
**Runtime:** `automation-runtime/`.

## Operator experience

The console is served at `/operator` by the automation API. It provides:
- password sign-in and sign-out;
- a paginated lead inbox with a status filter and summary counts;
- lead details, including the inquiry content visible only after authentication;
- notification job state, attempt history, safe error codes and audit history;
- a manual retry action only for jobs in `dead_letter`.

All dynamic user-supplied lead content is rendered with DOM text nodes, not interpreted as HTML. The console has responsive layouts, keyboard focus styles, labelled controls, live status messages and a restrictive Content Security Policy.

## Identity and session model

P6.5 is intentionally a **single internal operator** implementation, not a customer identity system.

- The password is never stored in plaintext. Generate a random salt + scrypt hash with `npm run automation:operator-hash` using a terminal with hidden input.
- Store the returned `saltHex:derivedKeyHex` in the server-only `AUTOMATION_OPERATOR_PASSWORD_HASH` environment variable.
- The login handler rate-limits failed attempts to five per source IP per 15-minute process-local window.
- Successful login creates a random opaque session token. Only its SHA-256 hash is persisted in PostgreSQL.
- The browser receives the token only in an `HttpOnly; SameSite=Strict` cookie, with `Secure` enabled outside local development.
- Sessions have an eight-hour absolute expiry and are revocable on logout. Session creation and revocation are audited.
- A separate CSRF token hash is stored server-side; the raw token exists only in the page's runtime memory and is required for mutations.
- Login and state-changing requests require an exact same-host Origin and, when supplied, `Sec-Fetch-Site: same-origin`.

The failed-login limiter is in process memory; it is suitable only for a single-process internal pilot. A multi-instance deployment requires a shared limiter or gateway. The current session implementation does not provide MFA, staff roles, invitations or customer workspaces.

## API routes

| Route | Access | Purpose |
|---|---|---|
| `GET /operator` | Public shell only | Serve login page; no lead data is embedded |
| `POST /v1/operator/login` | Same-origin + password | Create operator session |
| `GET /v1/operator/session` | Session cookie | Validate session and rotate CSRF token |
| `POST /v1/operator/logout` | Session + CSRF + same-origin | Revoke current session |
| `GET /v1/operator/leads` | Authenticated session | List, filter and cursor-paginate leads |
| `GET /v1/operator/leads/:id` | Authenticated session | Inspect one lead, attempts and audit entries |
| `POST /v1/operator/jobs/:id/retry` | Session + CSRF + same-origin | Retry a dead-letter job |

Manual retry locks the job row and accepts only `dead_letter`. It starts a new retry generation, resets the automatic-attempt counter for that generation, preserves previous attempts and records `notification.manual_retry_requested` as an operator audit event. Already pending, processing or sent jobs cannot be manually requeued.

## Retry-generation migration

Migration `002_operator_controls.sql` adds a retry-generation counter to jobs and attempts and changes the uniqueness constraint to `(job_id, retry_generation, attempt_number)`. This allows a manually retried job to start at attempt 1 without overwriting its earlier failed attempt history.

Migration runner is versioned and takes a PostgreSQL advisory transaction lock before applying each migration. Existing installations that already applied `001_initial_schema` receive only the new `002_operator_controls` migration.

## Privacy and retention

The dashboard can display lead names, email addresses and inquiry messages to the authenticated operator. No customer-facing access or data sharing is introduced.

**No automatic retention or deletion period is selected or activated.** Before the runtime accepts real inquiries, the owner must approve the retention period, legal/privacy basis, deletion behavior for leads/jobs/attempts, and audit metadata retention. Do not use production personal data in the P6.5 sandbox.

## Operational limits / release blockers

- No real contact-form forwarding or change to `contact.php`.
- No live email/SMS transport, provider, OAuth, customer account or multi-tenant access.
- No production deployment, DNS, hosting or provider spend.
- No backup, restore or monitoring service is configured by this PR.
- TLS termination, secure secret storage/rotation, shared login rate limiting, incident response and a documented retention policy are required before any live use.
- Session expiry/revocation is supported, but production session cleanup and operations monitoring still need a runbook.
- Manual retry replays an internal notification intent only; with the current fake adapter it sends no message.

P6.6 remains the release-acceptance package and requires a separate explicit production decision.
