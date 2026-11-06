# Lead Intake Routing & Internal Notification — Sandbox Runtime

**Status:** P6.4 sandbox plus P6.5 private operator console; internal testing only. This is not connected to the public website and is not a live customer-facing service.

## What is implemented

- A separate Node.js/TypeScript intake API.
- Timestamped HMAC-SHA256 authentication for trusted server-to-server events.
- Strict versioned event validation, source allowlisting, request-size limits and a per-process rate limit.
- PostgreSQL persistence with a transactionally-created outbox job.
- Idempotent event handling keyed by source + event ID.
- A separate worker using row leases and `FOR UPDATE SKIP LOCKED`.
- Deterministic fake notification outcomes: success, transient failure, permanent failure and timeout.
- Bounded retries, attempt history, dead-letter state and sanitized audit events.
- PostgreSQL-backed integration tests in CI.
- Private operator console at `/operator`, protected by a server-side scrypt password hash and HTTP-only session cookies.
- Authenticated lead inbox, status filter, lead detail, delivery-attempt and audit history.
- CSRF-protected manual retry for dead-letter jobs, preserving past attempts across retry generations.

The fake transport deliberately performs **no network, email or SMS I/O**. There is no production transport module. The sandbox API and fake-transport worker refuse to start when NODE_ENV is set to production; the guard is intentional until P6.6 production approval.

## Local setup

Requirements: Node.js 22+, npm and Docker Compose.

1. Install project dependencies from the repository root:

   ```bash
   npm install
   ```

2. Start the local-only PostgreSQL service:

   ```bash
   docker compose -f automation-runtime/docker-compose.dev.yml up -d
   ```

3. Configure your private shell environment. The following PowerShell example uses a test-only key:

   ```powershell
   $env:DATABASE_URL = "postgres://agency_automation:local-dev-only@127.0.0.1:5432/agency_automation"
   $env:AUTOMATION_HMAC_KEYS = '{"local-dev":"replace-this-with-a-random-secret-of-at-least-32-bytes"}'
   $env:AUTOMATION_DEMO_SECRET = "use-the-same-secret-value-as-the-local-dev-key"
   $env:AUTOMATION_ALLOWED_SOURCES = "agency-contact-form"
   $env:AUTOMATION_FAKE_TRANSPORT_MODE = "success"
   $env:NODE_ENV = "development"
   ```

   Generate a unique random secret for your own local environment. Never commit it, paste it into a browser, or reuse the example value.

4. Generate a private operator password hash. The prompt hides the password while typing:

   ```bash
   npm run automation:operator-hash
   ```

   Set the returned `salt:hash` value privately as `AUTOMATION_OPERATOR_PASSWORD_HASH`. Do not put the password itself or the generated hash in Git.

5. Apply the schema:



   ```bash
   npm run automation:migrate
   ```

6. Run the API in one terminal:

   ```bash
   npm run automation:api
   ```

7. Run the worker in another terminal:

   ```bash
   npm run automation:worker
   ```

The API listens on port 8787 by default. Check `GET /healthz` and `GET /readyz`. The private intake route is `POST /v1/intake/lead-submitted`. The internal operator console is available at `http://127.0.0.1:8787/operator`; it requires the password whose scrypt hash is configured in `AUTOMATION_OPERATOR_PASSWORD_HASH`.

With the API and worker running in separate terminals, submit a synthetic event from a third terminal:

```bash
npm run automation:demo
```

The demo sender signs a newly generated synthetic event. Its `AUTOMATION_DEMO_SECRET` must exactly match the value configured under the `local-dev` key in `AUTOMATION_HMAC_KEYS`. The example uses an `.invalid` email address and never sends email.

## Event authentication

Headers:
- `Content-Type: application/json`
- `X-Automation-Key-Id: <configured key id>`
- `X-Automation-Timestamp: <Unix seconds>`
- `X-Automation-Signature: v1=<hex HMAC-SHA256>`

The signature is calculated over the exact raw request bytes using:

```text
HMAC-SHA256(secret, timestamp + "." + rawRequestBody)
```

The receiver enforces a five-minute timestamp window by default, compares signatures in constant time, and never logs request bodies, signatures or secrets. Rotate keys by adding a new key ID, transitioning the trusted sender, then removing the old key.

The only default permitted source is `agency-contact-form`. A browser must never call this endpoint using a shared signing secret. The intended future PHP adapter remains unimplemented until fallback semantics are separately designed and tested.

## Test and simulate

Run the PostgreSQL-backed integration suite:

```bash
npm run test:automation
```

The tests cover durable intake, atomic lead/outbox writes, duplicate-event idempotency, invalid/stale signatures, malformed and oversized payloads, worker success, retries, dead letters, expired-lease recovery and concurrent worker claims.

The CI workflow starts a disposable PostgreSQL 16 service and runs the migration and integration suite. Tests use synthetic `.invalid` addresses only.

## Failure behavior

- A newly accepted event commits the lead and notification intent in one database transaction.
- Duplicate events return an idempotent accepted response without creating another lead or job.
- Worker leases expire so a crashed worker does not keep a job locked forever.
- Retryable errors are retried with bounded exponential backoff; the fifth failed attempt is dead-lettered by default.
- Permanent fake failures are dead-lettered immediately.
- Logs use generic, sanitized status codes and do not include lead details.

Delivery semantics are **at least once**, not exactly once. A future external adapter would need its own provider idempotency/reconciliation behavior.

## P6.6 production safety boundary

The current API/worker package is a sandbox. It is not suitable for a production environment, does not connect the public PHP form and has no real delivery adapter. The API and worker now fail closed when `NODE_ENV=production`. Do not bypass this guard or run the fake adapter in a live environment. Production use requires the separate gates in `docs/PRODUCTION_SECURITY_PRIVACY_REVIEW.md` and an explicit owner-approved release PR.

## Explicit non-goals and live-release blockers

- No changes to `contact.php`; no real website form is forwarded here.
- No production mail, SMS, WhatsApp, CRM, social, ecommerce or AI provider.
- No customer accounts, multi-tenancy, configurable routing or billing.
- No production secrets, provider credentials, hosting, DNS, deployment or provider spending.
- The simple in-memory rate limiter is per process; production needs a gateway/shared limiter and abuse monitoring.
- The fake notification transport is for end-to-end workflow mechanics only. It does not prove deliverability.
- The operator console is single-owner/internal only. It has no invitation, roles, customer workspace or public sign-up.
- Operator sessions expire after eight hours and are server-side revocable. The login failure limiter is in-process and must be moved to shared infrastructure for multi-instance production.
- No automatic retention/deletion schedule is enabled. The retention period and deletion process remain owner/privacy decisions before real personal data is accepted.
- Live use requires P6.6 review: approved retention/deletion policy, provider and runtime selection, production secret management, TLS termination, backup/restore, monitoring, incident response, privacy/legal approval and explicit release authorization.

Do not configure the public website to forward real inquiries to this sandbox.
