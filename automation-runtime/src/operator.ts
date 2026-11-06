import {
  createHash,
  randomBytes,
  randomUUID,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { readFile } from "node:fs/promises";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Pool, PoolClient } from "pg";

const SESSION_COOKIE = "agency_operator_session";
const SESSION_TTL_SECONDS = 8 * 60 * 60;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_FAILURES = 5;
const OPERATOR_BODY_LIMIT = 4 * 1024;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface HandlerOptions {
  pool: Pool;
  passwordHash?: string;
  cookieSecure?: boolean;
  sessionTtlSeconds?: number;
}

interface Session {
  id: string;
  csrf_hash: string;
  expires_at: Date;
}

interface Cursor {
  createdAt: string;
  id: string;
}

class OperatorInputError extends Error {
  constructor(public readonly status: number, public readonly code: string) {
    super(code);
  }
}

function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function equalHex(left: string, right: string): boolean {
  if (!/^[a-f0-9]{64}$/iu.test(left) || !/^[a-f0-9]{64}$/iu.test(right)) return false;
  return timingSafeEqual(Buffer.from(left, "hex"), Buffer.from(right, "hex"));
}

function verifyPassword(password: string, stored: string | undefined): boolean {
  if (!stored || password.length < 1 || password.length > 1024) return false;
  const parts = stored.split(":");
  if (parts.length !== 2 || !/^[a-f0-9]{32}$/iu.test(parts[0] ?? "")
    || !/^[a-f0-9]{128}$/iu.test(parts[1] ?? "")) return false;
  const salt = Buffer.from(parts[0]!, "hex");
  const expected = Buffer.from(parts[1]!, "hex");
  const actual = scryptSync(password, salt, expected.length, {
    N: 1 << 15,
    r: 8,
    p: 1,
    maxmem: 64 * 1024 * 1024,
  });
  return timingSafeEqual(actual, expected);
}

function sendJson(response: ServerResponse, status: number, body: Record<string, unknown>, extra: Record<string, string> = {}): void {
  const encoded = JSON.stringify(body);
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store, max-age=0",
    "pragma": "no-cache",
    "x-content-type-options": "nosniff",
    "referrer-policy": "no-referrer",
    "content-length": String(Buffer.byteLength(encoded)),
    ...extra,
  });
  response.end(encoded);
}

async function readJson(request: IncomingMessage): Promise<Record<string, unknown>> {
  const contentType = request.headers["content-type"] ?? "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    throw new OperatorInputError(415, "content_type_required");
  }
  const declared = request.headers["content-length"];
  if (typeof declared === "string" && Number(declared) > OPERATOR_BODY_LIMIT) {
    throw new OperatorInputError(413, "payload_too_large");
  }
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > OPERATOR_BODY_LIMIT) throw new OperatorInputError(413, "payload_too_large");
    chunks.push(buffer);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.concat(chunks, size).toString("utf8"));
  } catch {
    throw new OperatorInputError(400, "invalid_json");
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new OperatorInputError(400, "invalid_payload");
  }
  return parsed as Record<string, unknown>;
}

function hasSameOrigin(request: IncomingMessage): boolean {
  const origin = request.headers.origin;
  const host = request.headers.host;
  const fetchSite = request.headers["sec-fetch-site"];
  if (typeof origin !== "string" || typeof host !== "string"
    || (typeof fetchSite === "string" && fetchSite !== "same-origin")) return false;
  try {
    const parsed = new URL(origin);
    return (parsed.protocol === "http:" || parsed.protocol === "https:")
      && parsed.host.toLowerCase() === host.toLowerCase();
  } catch {
    return false;
  }
}

function readCookie(request: IncomingMessage): string | null {
  const header = request.headers.cookie;
  if (!header) return null;
  for (const part of header.split(";")) {
    const separator = part.indexOf("=");
    if (separator < 0) continue;
    if (part.slice(0, separator).trim() === SESSION_COOKIE) {
      const value = part.slice(separator + 1).trim();
      return /^[A-Za-z0-9_-]{40,64}$/u.test(value) ? value : null;
    }
  }
  return null;
}

function cookieValue(token: string, secure: boolean, maxAge: number): string {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure ? "; Secure" : ""}`;
}

function cursorEncode(cursor: Cursor): string {
  return Buffer.from(JSON.stringify(cursor), "utf8").toString("base64url");
}

function cursorDecode(raw: string | null): Cursor | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as Partial<Cursor>;
    if (typeof parsed.createdAt !== "string"
      || !Number.isFinite(Date.parse(parsed.createdAt))
      || typeof parsed.id !== "string"
      || !UUID_PATTERN.test(parsed.id)) return null;
    return { createdAt: parsed.createdAt, id: parsed.id };
  } catch {
    return null;
  }
}

function loginRateLimiter() {
  const failures = new Map<string, { count: number; resetAt: number }>();
  return {
    blocked(key: string, now: number): boolean {
      const entry = failures.get(key);
      if (!entry || entry.resetAt <= now) {
        failures.delete(key);
        return false;
      }
      return entry.count >= LOGIN_MAX_FAILURES;
    },
    fail(key: string, now: number): void {
      const entry = failures.get(key);
      if (!entry || entry.resetAt <= now) {
        failures.set(key, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
      } else {
        entry.count += 1;
      }
    },
    clear(key: string): void {
      failures.delete(key);
    },
  };
}

async function authenticate(pool: Pool, request: IncomingMessage): Promise<Session | null> {
  const token = readCookie(request);
  if (!token) return null;
  const result = await pool.query<Session>(
    `SELECT id, csrf_hash, expires_at
     FROM operator_sessions
     WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > NOW()
     LIMIT 1`,
    [sha256(token)],
  );
  const session = result.rows[0];
  if (!session) return null;
  await pool.query("UPDATE operator_sessions SET last_seen_at = NOW() WHERE id = $1", [session.id]);
  return session;
}

function validCsrf(session: Session, request: IncomingMessage): boolean {
  const token = request.headers["x-csrf-token"];
  return typeof token === "string" && token.length <= 128 && equalHex(session.csrf_hash, sha256(token));
}

async function serveStatic(path: string, response: ServerResponse): Promise<boolean> {
  const assets: Record<string, { file: string; type: string }> = {
    "/operator": { file: "operator.html", type: "text/html; charset=utf-8" },
    "/operator/": { file: "operator.html", type: "text/html; charset=utf-8" },
    "/operator.js": { file: "operator.js", type: "text/javascript; charset=utf-8" },
    "/operator.css": { file: "operator.css", type: "text/css; charset=utf-8" },
  };
  const asset = assets[path];
  if (!asset) return false;
  const content = await readFile(new URL(`../../public/${asset.file}`, import.meta.url));
  response.writeHead(200, {
    "content-type": asset.type,
    "cache-control": "no-store, max-age=0",
    "x-content-type-options": "nosniff",
    "referrer-policy": "no-referrer",
    "x-frame-options": "DENY",
    "content-security-policy": "default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'; object-src 'none'",
  });
  response.end(content);
  return true;
}

async function login(
  pool: Pool,
  request: IncomingMessage,
  response: ServerResponse,
  passwordHash: string | undefined,
  secure: boolean,
  ttlSeconds: number,
  limiter: ReturnType<typeof loginRateLimiter>,
): Promise<void> {
  if (!hasSameOrigin(request)) {
    sendJson(response, 403, { error: "same_origin_required" });
    return;
  }
  if (!passwordHash) {
    sendJson(response, 503, { error: "operator_auth_not_configured" });
    return;
  }
  const ip = request.socket.remoteAddress ?? "unknown";
  const now = Date.now();
  if (limiter.blocked(ip, now)) {
    sendJson(response, 429, { error: "login_rate_limited" });
    return;
  }
  const body = await readJson(request);
  if (typeof body.password !== "string" || !verifyPassword(body.password, passwordHash)) {
    limiter.fail(ip, now);
    sendJson(response, 401, { error: "invalid_credentials" });
    return;
  }
  limiter.clear(ip);

  const token = randomBytes(32).toString("base64url");
  const csrfToken = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
  await pool.query(
    `INSERT INTO operator_sessions (id, token_hash, csrf_hash, expires_at)
     VALUES ($1, $2, $3, $4)`,
    [randomUUID(), sha256(token), sha256(csrfToken), expiresAt],
  );
  await pool.query("DELETE FROM operator_sessions WHERE expires_at < NOW() - INTERVAL '7 days' OR revoked_at < NOW() - INTERVAL '7 days'");
  sendJson(response, 200, {
    authenticated: true,
    csrfToken,
    expiresAt: expiresAt.toISOString(),
  }, { "set-cookie": cookieValue(token, secure, ttlSeconds) });
}

async function listLeads(pool: Pool, url: URL, response: ServerResponse): Promise<void> {
  const status = url.searchParams.get("status");
  const allowedStatuses = new Set(["received", "notification_pending", "notified", "notification_failed"]);
  if (status && !allowedStatuses.has(status)) {
    sendJson(response, 400, { error: "invalid_status_filter" });
    return;
  }
  const rawLimit = Number(url.searchParams.get("limit") ?? "25");
  if (!Number.isSafeInteger(rawLimit) || rawLimit < 1 || rawLimit > 50) {
    sendJson(response, 400, { error: "invalid_limit" });
    return;
  }
  const cursorRaw = url.searchParams.get("cursor");
  const cursor = cursorDecode(cursorRaw);
  if (cursorRaw && !cursor) {
    sendJson(response, 400, { error: "invalid_cursor" });
    return;
  }

  const result = await pool.query<{
    id: string;
    name: string;
    email: string;
    service: string;
    status: string;
    received_at: Date;
    created_at: Date;
    job_status: string | null;
    attempt_count: number | null;
    last_error_code: string | null;
  }>(
    `SELECT lead.id, lead.name, lead.email, lead.service, lead.status,
            lead.received_at, lead.created_at,
            job.status AS job_status, job.attempt_count, job.last_error_code
     FROM leads AS lead
     LEFT JOIN outbox_jobs AS job ON job.lead_id = lead.id
     WHERE ($1::text IS NULL OR lead.status = $1)
       AND ($2::timestamptz IS NULL OR (lead.created_at, lead.id) < ($2::timestamptz, $3::uuid))
     ORDER BY lead.created_at DESC, lead.id DESC
     LIMIT $4`,
    [status, cursor?.createdAt ?? null, cursor?.id ?? null, rawLimit + 1],
  );
  const hasMore = result.rows.length > rawLimit;
  const rows = result.rows.slice(0, rawLimit);
  const counts = await pool.query<{
    total: string;
    received: string;
    notification_pending: string;
    notified: string;
    notification_failed: string;
  }>(
    `SELECT COUNT(*)::text AS total,
       COUNT(*) FILTER (WHERE status = 'received')::text AS received,
       COUNT(*) FILTER (WHERE status = 'notification_pending')::text AS notification_pending,
       COUNT(*) FILTER (WHERE status = 'notified')::text AS notified,
       COUNT(*) FILTER (WHERE status = 'notification_failed')::text AS notification_failed
     FROM leads`,
  );
  const last = rows[rows.length - 1];
  sendJson(response, 200, {
    leads: rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      service: row.service,
      status: row.status,
      receivedAt: row.received_at.toISOString(),
      notificationStatus: row.job_status,
      attemptCount: row.attempt_count,
      lastErrorCode: row.last_error_code,
    })),
    nextCursor: hasMore && last ? cursorEncode({ createdAt: last.created_at.toISOString(), id: last.id }) : null,
    counts: counts.rows[0],
  });
}

async function leadDetail(pool: Pool, leadId: string, response: ServerResponse): Promise<void> {
  const leadResult = await pool.query<{
    id: string;
    name: string;
    email: string;
    service: string;
    message: string;
    status: string;
    source: string;
    event_id: string;
    received_at: Date;
    created_at: Date;
    job_id: string | null;
    job_status: string | null;
    attempt_count: number | null;
    retry_generation: number | null;
    available_at: Date | null;
    last_error_code: string | null;
  }>(
    `SELECT lead.id, lead.name, lead.email, lead.service, lead.message, lead.status,
            lead.source, lead.event_id, lead.received_at, lead.created_at,
            job.id AS job_id, job.status AS job_status, job.attempt_count,
            job.retry_generation, job.available_at, job.last_error_code
     FROM leads AS lead
     LEFT JOIN outbox_jobs AS job ON job.lead_id = lead.id
     WHERE lead.id = $1`,
    [leadId],
  );
  const lead = leadResult.rows[0];
  if (!lead) {
    sendJson(response, 404, { error: "lead_not_found" });
    return;
  }
  const attempts = lead.job_id
    ? await pool.query<{
      id: string;
      retry_generation: number;
      attempt_number: number;
      started_at: Date;
      finished_at: Date | null;
      outcome: string;
      sanitized_error_code: string | null;
    }>(
      `SELECT id, retry_generation, attempt_number, started_at, finished_at,
              outcome, sanitized_error_code
       FROM delivery_attempts
       WHERE job_id = $1
       ORDER BY retry_generation DESC, attempt_number DESC`,
      [lead.job_id],
    )
    : { rows: [] };
  const audit = await pool.query<{
    id: string;
    actor_type: string;
    actor_id: string;
    action: string;
    occurred_at: Date;
    metadata: Record<string, unknown>;
  }>(
    `SELECT id, actor_type, actor_id, action, occurred_at, metadata
     FROM audit_events
     WHERE (entity_type = 'lead' AND entity_id = $1)
        OR (entity_type = 'outbox_job' AND entity_id = $2)
     ORDER BY occurred_at DESC
     LIMIT 100`,
    [lead.id, lead.job_id],
  );
  sendJson(response, 200, {
    lead: {
      id: lead.id,
      name: lead.name,
      email: lead.email,
      service: lead.service,
      message: lead.message,
      status: lead.status,
      source: lead.source,
      eventId: lead.event_id,
      receivedAt: lead.received_at.toISOString(),
      createdAt: lead.created_at.toISOString(),
    },
    notification: lead.job_id ? {
      id: lead.job_id,
      status: lead.job_status,
      attemptCount: lead.attempt_count,
      retryGeneration: lead.retry_generation,
      nextAttemptAt: lead.available_at?.toISOString() ?? null,
      lastErrorCode: lead.last_error_code,
      attempts: attempts.rows.map((attempt) => ({
        id: attempt.id,
        retryGeneration: attempt.retry_generation,
        attemptNumber: attempt.attempt_number,
        startedAt: attempt.started_at.toISOString(),
        finishedAt: attempt.finished_at?.toISOString() ?? null,
        outcome: attempt.outcome,
        errorCode: attempt.sanitized_error_code,
      })),
    } : null,
    audit: audit.rows.map((item) => ({
      id: item.id,
      actorType: item.actor_type,
      actor: item.actor_id,
      action: item.action,
      occurredAt: item.occurred_at.toISOString(),
      metadata: item.metadata,
    })),
  });
}

async function retryDeadLetter(pool: Pool, jobId: string, operatorId: string): Promise<"retried" | "not_found" | "not_dead_letter"> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const selected = await client.query<{ lead_id: string; status: string; retry_generation: number }>(
      "SELECT lead_id, status, retry_generation FROM outbox_jobs WHERE id = $1 FOR UPDATE",
      [jobId],
    );
    const row = selected.rows[0];
    if (!row) {
      await client.query("ROLLBACK");
      return "not_found";
    }
    if (row.status !== "dead_letter") {
      await client.query("ROLLBACK");
      return "not_dead_letter";
    }
    const nextGeneration = row.retry_generation + 1;
    const updated = await client.query(
      `UPDATE outbox_jobs
       SET status = 'pending', attempt_count = 0, retry_generation = $2,
           available_at = NOW(), locked_at = NULL, locked_by = NULL,
           last_error_code = NULL, updated_at = NOW()
       WHERE id = $1 AND status = 'dead_letter'`,
      [jobId, nextGeneration],
    );
    if (updated.rowCount !== 1) throw new Error("Dead-letter job changed during retry");
    await client.query(
      "UPDATE leads SET status = 'notification_pending' WHERE id = $1",
      [row.lead_id],
    );
    await client.query(
      `INSERT INTO audit_events
       (id, actor_type, actor_id, action, entity_type, entity_id, metadata)
       VALUES ($1, 'operator', $2, 'notification.manual_retry_requested', 'outbox_job', $3, $4::jsonb)`,
      [randomUUID(), operatorId, jobId, JSON.stringify({
        previousGeneration: row.retry_generation,
        retryGeneration: nextGeneration,
      })],
    );
    await client.query("COMMIT");
    return "retried";
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

export function createOperatorHandler(options: HandlerOptions) {
  const secure = options.cookieSecure ?? true;
  const ttlSeconds = options.sessionTtlSeconds ?? SESSION_TTL_SECONDS;
  const limiter = loginRateLimiter();

  return async (request: IncomingMessage, response: ServerResponse): Promise<boolean> => {
    const url = new URL(request.url ?? "/", "http://automation.local");
    if (await serveStatic(url.pathname, response)) return true;
    if (!url.pathname.startsWith("/v1/operator/")) return false;

    try {
      if (request.method === "POST" && url.pathname === "/v1/operator/login") {
        await login(options.pool, request, response, options.passwordHash, secure, ttlSeconds, limiter);
        return true;
      }
      const session = await authenticate(options.pool, request);
      if (!session) {
        sendJson(response, 401, { error: "authentication_required" });
        return true;
      }

      if (request.method === "GET" && url.pathname === "/v1/operator/session") {
        const csrfToken = randomBytes(32).toString("base64url");
        await options.pool.query(
          "UPDATE operator_sessions SET csrf_hash = $2, last_seen_at = NOW() WHERE id = $1",
          [session.id, sha256(csrfToken)],
        );
        sendJson(response, 200, {
          authenticated: true,
          csrfToken,
          expiresAt: session.expires_at.toISOString(),
        });
        return true;
      }

      if (request.method === "POST" && !hasSameOrigin(request)) {
        sendJson(response, 403, { error: "same_origin_required" });
        return true;
      }
      if (request.method === "POST" && !validCsrf(session, request)) {
        sendJson(response, 403, { error: "csrf_failed" });
        return true;
      }

      if (request.method === "POST" && url.pathname === "/v1/operator/logout") {
        await options.pool.query(
          "UPDATE operator_sessions SET revoked_at = NOW() WHERE id = $1",
          [session.id],
        );
        sendJson(response, 200, { loggedOut: true }, {
          "set-cookie": cookieValue("", secure, 0),
        });
        return true;
      }

      if (request.method === "GET" && url.pathname === "/v1/operator/leads") {
        await listLeads(options.pool, url, response);
        return true;
      }

      const leadMatch = url.pathname.match(/^\/v1\/operator\/leads\/([0-9a-f-]{36})$/iu);
      if (request.method === "GET" && leadMatch) {
        if (!UUID_PATTERN.test(leadMatch[1]!)) {
          sendJson(response, 400, { error: "invalid_lead_id" });
          return true;
        }
        await leadDetail(options.pool, leadMatch[1]!, response);
        return true;
      }

      const retryMatch = url.pathname.match(/^\/v1\/operator\/jobs\/([0-9a-f-]{36})\/retry$/iu);
      if (request.method === "POST" && retryMatch) {
        if (!UUID_PATTERN.test(retryMatch[1]!)) {
          sendJson(response, 400, { error: "invalid_job_id" });
          return true;
        }
        const result = await retryDeadLetter(options.pool, retryMatch[1]!, "agency-owner");
        if (result === "not_found") sendJson(response, 404, { error: "job_not_found" });
        else if (result === "not_dead_letter") sendJson(response, 409, { error: "job_not_retryable" });
        else sendJson(response, 200, { retried: true });
        return true;
      }

      sendJson(response, 404, { error: "not_found" });
      return true;
    } catch (error) {
      if (error instanceof OperatorInputError) {
        sendJson(response, error.status, { error: error.code });
        return true;
      }
      sendJson(response, 503, { error: "operator_service_unavailable" });
      return true;
    }
  };
}
