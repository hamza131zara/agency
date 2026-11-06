# Lead Intake Routing & Internal Notification — Sandbox Runtime

**Status:** owner-approved P6.4 implementation; sandbox only. This is not connected to the public website and is not a live customer-facing service.

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

The fake transport deliberately performs **no network, email or SMS I/O**. There is no production transport module.

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
   $env:AUTOMATION_ALLOWED_SOURCES = "agency-contact-form"
   $env:AUTOMATION_FAKE_TRANSPORT_MODE = "success"
   ```

   Generate a unique random secret for your own local environment. Never commit it, paste it into a browser, or reuse the example value.

4. Apply the schema:

   ```bash
   npm run automation:migrate
   ```

5. Run the API in one terminal:

   ```bash
   npm run automation:api
   ```

6. Run the worker in another terminal:

   ```bash
   npm run automation:worker
   ```

The API listens on port 8787 by default. Check `GET /healthz` and `GET /readyz`. The private intake route is `POST /v1/intake/lead-submitted`.

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

## Explicit non-goals and live-release blockers

- No changes to `contact.php`; no real website form is forwarded here.
- No production mail, SMS, WhatsApp, CRM, social, ecommerce or AI provider.
- No customer accounts, multi-tenancy, admin dashboard, configurable routing or billing.
- No production secrets, provider credentials, hosting, DNS, deployment or provider spending.
- The simple in-memory rate limiter is per process; production needs a gateway/shared limiter and abuse monitoring.
- The fake notification transport is for end-to-end workflow mechanics only. It does not prove deliverability.
- Live use requires a separate P6.5/P6.6 review: authenticated operator controls, approved retention/deletion policy, provider and runtime selection, secret management, TLS, backup/restore, monitoring, incident response, privacy/legal approval and explicit release authorization.

Do not configure the public website to forward real inquiries to this sandbox.
