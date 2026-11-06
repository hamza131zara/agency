# P6.4 — Lead Intake Routing & Internal Notification Sandbox

**Status:** implementation ready for merge; synthetic sandbox only.  
**Owner authorization:** 7 November 2026, limited to P6.4.  
**Implementation:** `automation-runtime/`.

## Delivered workflow

1. A trusted server-side source posts a versioned lead-submitted event to `POST /v1/intake/lead-submitted`.
2. The API verifies a timestamped HMAC-SHA256 signature, configured key ID, source allowlist and replay window.
3. The API validates the strict event contract, caps request size and applies a basic per-process request limit.
4. One PostgreSQL transaction inserts the lead, its internal-notification outbox job and sanitized audit events.
5. The API returns `202 Accepted` only after that transaction commits. Repeated source/event IDs are idempotent and do not create another job.
6. A separate worker leases due outbox rows with `FOR UPDATE SKIP LOCKED`, calls only the deterministic fake transport, and records the attempt.
7. Success marks the job sent; transient errors schedule bounded exponential retries; permanent or exhausted failures move to dead-letter. Expired worker leases are recoverable.

## API contract

`POST /v1/intake/lead-submitted`

Required headers:
- `Content-Type: application/json`
- `X-Automation-Key-Id`
- `X-Automation-Timestamp` — Unix seconds
- `X-Automation-Signature` — `v1=<hex>`

The signature input is the exact request body prefixed by `<timestamp>.`, signed with HMAC-SHA256. The default accepted timestamp tolerance is five minutes.

Required event fields:
- `schema_version: 1`
- UUID `event_id`
- ISO timestamp `occurred_at`
- configured `source`
- `lead.name`, `lead.email`, `lead.service`, `lead.message`

The source must be in `AUTOMATION_ALLOWED_SOURCES`. The browser must never receive the signing key. Only the signed server-to-server caller is trusted.

## Persistence and worker behavior

Tables:
- `leads`
- `outbox_jobs`
- `delivery_attempts`
- `audit_events`
- `schema_migrations`

The lead record and outbox item commit atomically. The outbox has a unique idempotency key. Worker claims use row locks with `SKIP LOCKED`, a lease owner and expiry. The default limit is five attempts. Audit metadata contains event identifiers and state details but not a lead's name, email or message.

Delivery is at-least-once. The fake transport is deliberately the only transport implementation in this phase and performs no network, email or SMS I/O.

## Verification

Exact-head pull request CI [#42283098059](https://github.com/hamza131zara/agency/actions/runs/42283098059) passed all three jobs: repository validation, browser/accessibility and the automation sandbox. The PostgreSQL suite reports 10 passed, 0 failed, 0 skipped.

The CI job creates a disposable PostgreSQL 16 service, applies the migration, compiles the TypeScript and runs integration tests for:
- valid signed intake and durable lead/outbox/audit persistence;
- duplicate-event idempotency;
- invalid signatures, stale timestamps, unknown sources and malformed JSON;
- oversized request rejection;
- transactional rollback if outbox insertion fails;
- fake success and attempt/audit state;
- transient retry, exhausted retry and permanent dead-letter behavior;
- expired-lease recovery and competing worker claims;
- health/readiness endpoints.

All fixtures use reserved `.invalid` email addresses and synthetic inquiry content.

## Known limitations and explicit non-goals

- `contact.php` is unchanged; real inquiries are not forwarded.
- The in-memory rate limiter is process-local; a production deployment needs a shared rate limiter or gateway and abuse monitoring.
- No operator dashboard, authentication UI, role system or manual retry control is included yet.
- No real email/SMS/provider transport, provider idempotency, delivery receipt or deliverability claim exists.
- Retention/deletion, real-data handling, production secrets, TLS termination, monitoring, incident response and backup/restore are not configured by this sandbox.
- No paid runtime, provider, DNS, hosting, deployment or public product status is approved.

## Required next gates

- P6.5: authenticated internal operator controls, safe inspection, authorized manual retry, retention and operational controls.
- P6.6: security/privacy/accessibility/operations acceptance, provider and runtime decision, backups/monitoring/incident plan and explicit release approval.

Do not connect the public website or accept real personal data until those gates are complete.
