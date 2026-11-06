import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createServer, type Server } from "node:http";
import { AddressInfo } from "node:net";
import { createHash, randomUUID, scryptSync } from "node:crypto";
import { after, before, beforeEach, test } from "node:test";
import { Pool } from "pg";
import type { LeadSubmittedEvent } from "../src/contracts.js";
import { createIntakeHandler } from "../src/handler.js";
import { acceptLeadEvent, leaseNextJob } from "../src/repository.js";
import { createSignature } from "../src/security.js";
import { FakeNotificationTransport } from "../src/transport.js";
import { processNextJob } from "../src/worker-core.js";

const databaseUrl = process.env.TEST_DATABASE_URL;
const secret = "test-only-secret-material-that-is-at-least-32-bytes";
const operatorPassword = "CI-only-test-operator-password-long-enough";
const operatorSalt = Buffer.from("00112233445566778899aabbccddeeff", "hex");
const operatorPasswordHash = `${operatorSalt.toString("hex")}:${scryptSync(operatorPassword, operatorSalt, 64, {
  N: 1 << 15,
  r: 8,
  p: 1,
  maxmem: 64 * 1024 * 1024,
}).toString("hex")}`;
let pool: Pool | undefined;

function db(): Pool {
  if (!pool) throw new Error("Test PostgreSQL pool is unavailable");
  return pool;
}

function event(eventId = randomUUID()): LeadSubmittedEvent {
  return {
    schema_version: 1,
    event_id: eventId,
    occurred_at: new Date().toISOString(),
    source: "agency-contact-form",
    lead: {
      name: "Synthetic Test Visitor",
      email: "visitor@example.invalid",
      service: "Software & website development",
      message: "Synthetic project inquiry used only for automated sandbox verification.",
    },
  };
}

async function startApi(): Promise<{ server: Server; baseUrl: string; close: () => Promise<void> }> {
  const server = createServer((request, response) => {
    void createIntakeHandler({
      pool: db(),
      keys: new Map([["ci-test", secret]]),
      allowedSources: new Set(["agency-contact-form"]),
      operatorPasswordHash,
      operatorCookieSecure: false,
    })(request, response);
  });
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address() as AddressInfo;
  return {
    server,
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: () => new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve())),
  };
}

async function loginOperator(api: { baseUrl: string }): Promise<{ cookie: string; csrfToken: string }> {
  const response = await fetch(`${api.baseUrl}/v1/operator/login`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: api.baseUrl },
    body: JSON.stringify({ password: operatorPassword }),
  });
  assert.equal(response.status, 200);
  const body = await response.json() as { csrfToken: string };
  const setCookie = response.headers.get("set-cookie");
  assert.ok(setCookie);
  const cookie = setCookie.split(";")[0]!;
  assert.match(setCookie, /HttpOnly/iu);
  assert.match(setCookie, /SameSite=Strict/iu);
  return { cookie, csrfToken: body.csrfToken };
}

async function operatorRequest(
  api: { baseUrl: string },
  path: string,
  session: { cookie: string; csrfToken: string },
  method = "GET",
): Promise<Response> {
  const headers: Record<string, string> = { cookie: session.cookie };
  if (method !== "GET") {
    headers.origin = api.baseUrl;
    headers["x-csrf-token"] = session.csrfToken;
  }
  return fetch(`${api.baseUrl}${path}`, { method, headers });
}

async function sendEvent(
  baseUrl: string,
  value: unknown,
  options: { signature?: string; timestamp?: string; rawBody?: Buffer } = {},
): Promise<Response> {
  const rawBody = options.rawBody ?? Buffer.from(JSON.stringify(value));
  const timestamp = options.timestamp ?? String(Math.floor(Date.now() / 1000));
  const signature = options.signature ?? createSignature(rawBody, timestamp, secret);
  return fetch(`${baseUrl}/v1/intake/lead-submitted`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-automation-key-id": "ci-test",
      "x-automation-timestamp": timestamp,
      "x-automation-signature": signature,
    },
    body: new Uint8Array(rawBody),
  });
}

before(async () => {
  if (!databaseUrl) return;
  pool = new Pool({ connectionString: databaseUrl, max: 6 });
  await db().query(`CREATE TABLE IF NOT EXISTS schema_migrations (
    version TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
  for (const migration of [
    { version: "001_initial_schema", file: "001_initial_schema.sql" },
    { version: "002_operator_controls", file: "002_operator_controls.sql" },
  ]) {
    const existing = await db().query(
      "SELECT version FROM schema_migrations WHERE version = $1",
      [migration.version],
    );
    if (existing.rowCount === 0) {
      const sql = await readFile(new URL(`../../sql/${migration.file}`, import.meta.url), "utf8");
      const client = await db().connect();
      try {
        await client.query("BEGIN");
        await client.query(sql);
        await client.query("INSERT INTO schema_migrations (version) VALUES ($1)", [migration.version]);
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK").catch(() => undefined);
        throw error;
      } finally {
        client.release();
      }
    }
  }
});

beforeEach(async () => {
  if (!databaseUrl) return;
  await db().query("TRUNCATE operator_sessions, audit_events, delivery_attempts, outbox_jobs, leads CASCADE");
});

after(async () => {
  await pool?.end();
});

test("valid signed lead is durably stored with exactly one outbox job", { skip: !databaseUrl }, async () => {
  const api = await startApi();
  try {
    const response = await sendEvent(api.baseUrl, event());
    assert.equal(response.status, 202);
    const body = await response.json() as { accepted: boolean; duplicate: boolean; lead_id: string };
    assert.equal(body.accepted, true);
    assert.equal(body.duplicate, false);
    assert.match(body.lead_id, /^[0-9a-f-]{36}$/iu);

    const lead = await db().query("SELECT id, status, email FROM leads WHERE id = $1", [body.lead_id]);
    const jobs = await db().query("SELECT id, status FROM outbox_jobs WHERE lead_id = $1", [body.lead_id]);
    const audits = await db().query("SELECT action, metadata FROM audit_events WHERE entity_id = $1", [body.lead_id]);
    assert.equal(lead.rowCount, 1);
    assert.equal(lead.rows[0].status, "notification_pending");
    assert.equal(lead.rows[0].email, "visitor@example.invalid");
    assert.equal(jobs.rowCount, 1);
    assert.equal(jobs.rows[0].status, "pending");
    assert.ok(audits.rows.some((row) => row.action === "lead.accepted"));
    assert.equal(JSON.stringify(audits.rows).includes("Synthetic Test Visitor"), false);
  } finally {
    await api.close();
  }
});

test("duplicate signed event is idempotent and does not enqueue twice", { skip: !databaseUrl }, async () => {
  const api = await startApi();
  try {
    const value = event();
    const first = await sendEvent(api.baseUrl, value);
    const second = await sendEvent(api.baseUrl, value);
    assert.equal(first.status, 202);
    assert.equal(second.status, 202);
    const firstBody = await first.json() as { lead_id: string; duplicate: boolean };
    const secondBody = await second.json() as { lead_id: string; duplicate: boolean };
    assert.equal(firstBody.duplicate, false);
    assert.equal(secondBody.duplicate, true);
    assert.equal(firstBody.lead_id, secondBody.lead_id);
    assert.equal((await db().query("SELECT COUNT(*)::int AS count FROM leads")).rows[0].count, 1);
    assert.equal((await db().query("SELECT COUNT(*)::int AS count FROM outbox_jobs")).rows[0].count, 1);
  } finally {
    await api.close();
  }
});

test("rejects invalid signatures, stale timestamps, unsupported source and malformed JSON", { skip: !databaseUrl }, async () => {
  const api = await startApi();
  try {
    const value = event();
    const raw = Buffer.from(JSON.stringify(value));
    const badSignature = await sendEvent(api.baseUrl, value, { signature: `v1=${"0".repeat(64)}` });
    assert.equal(badSignature.status, 401);

    const staleTimestamp = String(Math.floor(Date.now() / 1000) - 900);
    const stale = await sendEvent(api.baseUrl, value, {
      timestamp: staleTimestamp,
      signature: createSignature(raw, staleTimestamp, secret),
    });
    assert.equal(stale.status, 401);

    const unsupported = await sendEvent(api.baseUrl, { ...value, source: "untrusted-site" });
    assert.equal(unsupported.status, 403);

    const malformedRaw = Buffer.from("{not-json");
    const malformed = await sendEvent(api.baseUrl, value, {
      rawBody: malformedRaw,
      signature: createSignature(malformedRaw, String(Math.floor(Date.now() / 1000)), secret),
    });
    assert.equal(malformed.status, 400);
    assert.equal((await db().query("SELECT COUNT(*)::int AS count FROM leads")).rows[0].count, 0);
  } finally {
    await api.close();
  }
});

test("rejects oversized request bodies before JSON parsing", { skip: !databaseUrl }, async () => {
  const api = await startApi();
  try {
    const raw = Buffer.alloc(16 * 1024 + 1, 65);
    const response = await sendEvent(api.baseUrl, {}, {
      rawBody: raw,
      signature: createSignature(raw, String(Math.floor(Date.now() / 1000)), secret),
    });
    assert.equal(response.status, 413);
  } finally {
    await api.close();
  }
});

test("lead and outbox creation roll back atomically on outbox failure", { skip: !databaseUrl }, async () => {
  const eventId = "00000000-0000-4000-8000-000000000001";
  await db().query(`ALTER TABLE outbox_jobs
    ADD CONSTRAINT test_force_outbox_failure
    CHECK (idempotency_key <> $1)`.replace("$1", "'agency-contact-form:" + eventId + ":internal-notification'"));
  try {
    await assert.rejects(acceptLeadEvent(db(), event(eventId)));
    const leadCount = await db().query("SELECT COUNT(*)::int AS count FROM leads WHERE event_id = $1", [eventId]);
    assert.equal(leadCount.rows[0].count, 0);
  } finally {
    await db().query("ALTER TABLE outbox_jobs DROP CONSTRAINT IF EXISTS test_force_outbox_failure");
  }
});

test("worker success records attempt, audit event and notified lead state", { skip: !databaseUrl }, async () => {
  const accepted = await acceptLeadEvent(db(), event());
  const processed = await processNextJob(db(), "worker-success", new FakeNotificationTransport("success"));
  assert.equal(processed, true);

  const job = await db().query("SELECT status, attempt_count FROM outbox_jobs WHERE lead_id = $1", [accepted.leadId]);
  const attempts = await db().query("SELECT outcome, finished_at FROM delivery_attempts WHERE job_id = (SELECT id FROM outbox_jobs WHERE lead_id = $1)", [accepted.leadId]);
  const lead = await db().query("SELECT status FROM leads WHERE id = $1", [accepted.leadId]);
  const audit = await db().query("SELECT action FROM audit_events WHERE entity_type = 'outbox_job' AND entity_id = (SELECT id FROM outbox_jobs WHERE lead_id = $1)", [accepted.leadId]);
  assert.equal(job.rows[0].status, "sent");
  assert.equal(job.rows[0].attempt_count, 1);
  assert.equal(attempts.rows[0].outcome, "sent");
  assert.ok(attempts.rows[0].finished_at);
  assert.equal(lead.rows[0].status, "notified");
  assert.ok(audit.rows.some((row) => row.action === "notification.sent"));
});

test("transient failures retry and exhausted jobs move to dead letter", { skip: !databaseUrl }, async () => {
  const accepted = await acceptLeadEvent(db(), event());
  const fake = new FakeNotificationTransport("transient_failure");
  assert.equal(await processNextJob(db(), "worker-retry", fake, { maxAttempts: 2, backoffBaseMs: 0 }), true);
  let state = await db().query("SELECT status, attempt_count FROM outbox_jobs WHERE lead_id = $1", [accepted.leadId]);
  assert.equal(state.rows[0].status, "pending");
  assert.equal(state.rows[0].attempt_count, 1);

  assert.equal(await processNextJob(db(), "worker-retry", fake, { maxAttempts: 2, backoffBaseMs: 0 }), true);
  state = await db().query("SELECT status, attempt_count, last_error_code FROM outbox_jobs WHERE lead_id = $1", [accepted.leadId]);
  assert.equal(state.rows[0].status, "dead_letter");
  assert.equal(state.rows[0].attempt_count, 2);
  assert.equal(state.rows[0].last_error_code, "fake_temporary_failure");
  const attempts = await db().query("SELECT outcome FROM delivery_attempts WHERE job_id = (SELECT id FROM outbox_jobs WHERE lead_id = $1) ORDER BY attempt_number", [accepted.leadId]);
  assert.deepEqual(attempts.rows.map((row) => row.outcome), ["retry_scheduled", "dead_letter"]);
});

test("permanent failures dead-letter immediately", { skip: !databaseUrl }, async () => {
  const accepted = await acceptLeadEvent(db(), event());
  await processNextJob(db(), "worker-permanent", new FakeNotificationTransport("permanent_failure"));
  const state = await db().query("SELECT status, last_error_code FROM outbox_jobs WHERE lead_id = $1", [accepted.leadId]);
  assert.equal(state.rows[0].status, "dead_letter");
  assert.equal(state.rows[0].last_error_code, "fake_permanent_failure");
});

test("expired worker lease is recoverable and concurrent workers cannot claim the same job", { skip: !databaseUrl }, async () => {
  const accepted = await acceptLeadEvent(db(), event());
  await db().query(
    `UPDATE outbox_jobs
     SET status = 'processing', locked_at = NOW() - INTERVAL '2 minutes',
         locked_by = 'crashed-worker', attempt_count = 1
     WHERE lead_id = $1`,
    [accepted.leadId],
  );
  const [first, second] = await Promise.all([
    leaseNextJob(db(), "recovery-worker-a", 60),
    leaseNextJob(db(), "recovery-worker-b", 60),
  ]);
  assert.equal([first, second].filter(Boolean).length, 1);
  const recovered = first ?? second;
  assert.ok(recovered);
  assert.equal(recovered.leadId, accepted.leadId);
  assert.equal(recovered.attemptCount, 2);
  const active = await db().query("SELECT status, locked_by FROM outbox_jobs WHERE lead_id = $1", [accepted.leadId]);
  assert.equal(active.rows[0].status, "processing");
  assert.match(active.rows[0].locked_by, /^recovery-worker-/u);
});

test("health and readiness endpoints expose no infrastructure details", { skip: !databaseUrl }, async () => {
  const api = await startApi();
  try {
    const health = await fetch(`${api.baseUrl}/healthz`);
    const readiness = await fetch(`${api.baseUrl}/readyz`);
    assert.equal(health.status, 200);
    assert.deepEqual(await health.json(), { status: "ok" });
    assert.equal(readiness.status, 200);
    assert.deepEqual(await readiness.json(), { status: "ready" });
  } finally {
    await api.close();
  }
});


test("operator console assets are served with a restrictive content security policy", { skip: !databaseUrl }, async () => {
  const api = await startApi();
  try {
    const response = await fetch(`${api.baseUrl}/operator`);
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-security-policy") ?? "", /default-src 'none'/u);
    assert.match(response.headers.get("x-frame-options") ?? "", /DENY/iu);
    assert.match(await response.text(), /Operator sign in/u);
    const script = await fetch(`${api.baseUrl}/operator.js`);
    assert.equal(script.status, 200);
    assert.match(script.headers.get("content-type") ?? "", /javascript/u);
  } finally {
    await api.close();
  }
});

test("operator lead APIs deny anonymous access and reject cross-origin login", { skip: !databaseUrl }, async () => {
  const api = await startApi();
  try {
    const anonymous = await fetch(`${api.baseUrl}/v1/operator/leads`);
    assert.equal(anonymous.status, 401);
    const crossOrigin = await fetch(`${api.baseUrl}/v1/operator/login`, {
      method: "POST",
      headers: { "content-type": "application/json", origin: "https://attacker.invalid" },
      body: JSON.stringify({ password: operatorPassword }),
    });
    assert.equal(crossOrigin.status, 403);
    const badPassword = await fetch(`${api.baseUrl}/v1/operator/login`, {
      method: "POST",
      headers: { "content-type": "application/json", origin: api.baseUrl },
      body: JSON.stringify({ password: "wrong-password" }),
    });
    assert.equal(badPassword.status, 401);
  } finally {
    await api.close();
  }
});

test("operator session signs in, lists leads and returns details only to the authenticated operator", { skip: !databaseUrl }, async () => {
  const api = await startApi();
  try {
    const accepted = await acceptLeadEvent(db(), event());
    const anonymousDetail = await fetch(`${api.baseUrl}/v1/operator/leads/${accepted.leadId}`);
    assert.equal(anonymousDetail.status, 401);

    const session = await loginOperator(api);
    const refreshed = await operatorRequest(api, "/v1/operator/session", session);
    assert.equal(refreshed.status, 200);
    const refreshBody = await refreshed.json() as { csrfToken: string };
    session.csrfToken = refreshBody.csrfToken;

    const list = await operatorRequest(api, "/v1/operator/leads?limit=10", session);
    assert.equal(list.status, 200);
    const listBody = await list.json() as {
      leads: Array<{ id: string; email: string; notificationStatus: string }>;
      counts: { total: string; notification_pending: string };
    };
    assert.equal(listBody.leads.length, 1);
    assert.equal(listBody.leads[0]?.id, accepted.leadId);
    assert.equal(listBody.leads[0]?.email, "visitor@example.invalid");
    assert.equal(listBody.leads[0]?.notificationStatus, "pending");
    assert.equal(listBody.counts.total, "1");
    assert.equal(listBody.counts.notification_pending, "1");

    const detail = await operatorRequest(api, `/v1/operator/leads/${accepted.leadId}`, session);
    assert.equal(detail.status, 200);
    const detailBody = await detail.json() as {
      lead: { name: string; message: string };
      notification: { status: string; attempts: unknown[] };
      audit: Array<{ action: string }>;
    };
    assert.equal(detailBody.lead.name, "Synthetic Test Visitor");
    assert.match(detailBody.lead.message, /Synthetic project inquiry/u);
    assert.equal(detailBody.notification.status, "pending");
    assert.equal(detailBody.notification.attempts.length, 0);
    assert.ok(detailBody.audit.some((item) => item.action === "lead.accepted"));
  } finally {
    await api.close();
  }
});

test("operator can manually retry a dead-letter job without erasing prior attempts", { skip: !databaseUrl }, async () => {
  const api = await startApi();
  try {
    const accepted = await acceptLeadEvent(db(), event());
    await processNextJob(db(), "operator-retry-fixture", new FakeNotificationTransport("permanent_failure"));
    const before = await db().query(
      "SELECT id FROM outbox_jobs WHERE lead_id = $1 AND status = 'dead_letter'",
      [accepted.leadId],
    );
    const jobId = before.rows[0]?.id as string;
    assert.ok(jobId);

    const session = await loginOperator(api);
    const missingCsrf = await fetch(`${api.baseUrl}/v1/operator/jobs/${jobId}/retry`, {
      method: "POST",
      headers: { origin: api.baseUrl, cookie: session.cookie },
    });
    assert.equal(missingCsrf.status, 403);

    const retry = await operatorRequest(api, `/v1/operator/jobs/${jobId}/retry`, session, "POST");
    assert.equal(retry.status, 200);
    assert.deepEqual(await retry.json(), { retried: true });

    const state = await db().query(
      "SELECT status, attempt_count, retry_generation FROM outbox_jobs WHERE id = $1",
      [jobId],
    );
    assert.equal(state.rows[0].status, "pending");
    assert.equal(state.rows[0].attempt_count, 0);
    assert.equal(state.rows[0].retry_generation, 1);

    const history = await db().query(
      "SELECT retry_generation, attempt_number, outcome FROM delivery_attempts WHERE job_id = $1",
      [jobId],
    );
    assert.equal(history.rowCount, 1);
    assert.equal(history.rows[0].retry_generation, 0);
    assert.equal(history.rows[0].outcome, "dead_letter");

    const audit = await db().query(
      "SELECT actor_type, action, metadata FROM audit_events WHERE entity_id = $1",
      [jobId],
    );
    assert.ok(audit.rows.some((row) => row.actor_type === "operator"
      && row.action === "notification.manual_retry_requested"
      && row.metadata.retryGeneration === 1));

    await processNextJob(db(), "operator-retry-success", new FakeNotificationTransport("success"));
    const completed = await db().query("SELECT status FROM outbox_jobs WHERE id = $1", [jobId]);
    assert.equal(completed.rows[0].status, "sent");
    const allAttempts = await db().query(
      "SELECT retry_generation, attempt_number, outcome FROM delivery_attempts WHERE job_id = $1 ORDER BY retry_generation, attempt_number",
      [jobId],
    );
    assert.deepEqual(allAttempts.rows.map((row) => [row.retry_generation, row.attempt_number, row.outcome]), [
      [0, 1, "dead_letter"],
      [1, 1, "sent"],
    ]);
  } finally {
    await api.close();
  }
});

test("operator cannot manually retry a job unless it is dead-lettered", { skip: !databaseUrl }, async () => {
  const api = await startApi();
  try {
    const accepted = await acceptLeadEvent(db(), event());
    const job = await db().query("SELECT id FROM outbox_jobs WHERE lead_id = $1", [accepted.leadId]);
    const session = await loginOperator(api);
    const response = await operatorRequest(api, `/v1/operator/jobs/${job.rows[0]?.id}/retry`, session, "POST");
    assert.equal(response.status, 409);
    assert.deepEqual(await response.json(), { error: "job_not_retryable" });
  } finally {
    await api.close();
  }
});

test("operator logout revokes the server-side session", { skip: !databaseUrl }, async () => {
  const api = await startApi();
  try {
    const session = await loginOperator(api);
    const logout = await operatorRequest(api, "/v1/operator/logout", session, "POST");
    assert.equal(logout.status, 200);
    const after = await fetch(`${api.baseUrl}/v1/operator/leads`, {
      headers: { cookie: session.cookie },
    });
    assert.equal(after.status, 401);
  } finally {
    await api.close();
  }
});

test("expired operator sessions cannot access lead records", { skip: !databaseUrl }, async () => {
  const api = await startApi();
  try {
    const session = await loginOperator(api);
    await db().query(
      "UPDATE operator_sessions SET expires_at = NOW() - INTERVAL '1 minute' WHERE token_hash = $1",
      [createHash("sha256").update(session.cookie.split("=")[1]!, "utf8").digest("hex")],
    );
    const response = await fetch(`${api.baseUrl}/v1/operator/leads`, {
      headers: { cookie: session.cookie },
    });
    assert.equal(response.status, 401);
  } finally {
    await api.close();
  }
});

if (!databaseUrl) {
  test("PostgreSQL integration suite requires TEST_DATABASE_URL", { skip: true }, () => {});
}
