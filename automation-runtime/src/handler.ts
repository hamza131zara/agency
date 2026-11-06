import { randomUUID } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Pool } from "pg";
import { MAX_BODY_BYTES, SIGNATURE_TOLERANCE_SECONDS, validateLeadSubmittedEvent } from "./contracts.js";
import { acceptLeadEvent } from "./repository.js";
import { verifyRequestSignature, type Keyring } from "./security.js";
import { createOperatorHandler } from "./operator.js";

class HttpInputError extends Error {
  constructor(public readonly status: number, public readonly code: string) {
    super(code);
  }
}

interface HandlerOptions {
  pool: Pool;
  keys: Keyring;
  allowedSources: ReadonlySet<string>;
  maxBodyBytes?: number;
  signatureToleranceSeconds?: number;
  rateLimitPerMinute?: number;
  now?: () => number;
  operatorPasswordHash?: string;
  operatorCookieSecure?: boolean;
}

interface RateEntry {
  windowStartedAt: number;
  count: number;
}

function sendJson(response: ServerResponse, status: number, body: Record<string, unknown>): void {
  const encoded = JSON.stringify(body);
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
    "content-length": Buffer.byteLength(encoded),
  });
  response.end(encoded);
}

async function readBody(request: IncomingMessage, limit: number): Promise<Buffer> {
  const declaredLength = request.headers["content-length"];
  if (typeof declaredLength === "string") {
    const parsed = Number(declaredLength);
    if (!Number.isSafeInteger(parsed) || parsed < 0) throw new HttpInputError(400, "invalid_content_length");
    if (parsed > limit) throw new HttpInputError(413, "payload_too_large");
  }

  const chunks: Buffer[] = [];
  let total = 0;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    total += buffer.length;
    if (total > limit) throw new HttpInputError(413, "payload_too_large");
    chunks.push(buffer);
  }
  return Buffer.concat(chunks, total);
}

function createRateLimiter(maxPerMinute: number, now: () => number) {
  const entries = new Map<string, RateEntry>();
  return (key: string): boolean => {
    const current = now();
    let entry = entries.get(key);
    if (!entry || current - entry.windowStartedAt >= 60_000) {
      entry = { windowStartedAt: current, count: 0 };
      entries.set(key, entry);
    }
    entry.count += 1;
    if (entries.size > 5_000) {
      for (const [entryKey, entryValue] of entries) {
        if (current - entryValue.windowStartedAt >= 60_000) entries.delete(entryKey);
      }
    }
    return entry.count <= maxPerMinute;
  };
}

export function createIntakeHandler(options: HandlerOptions) {
  const maxBodyBytes = options.maxBodyBytes ?? MAX_BODY_BYTES;
  const tolerance = options.signatureToleranceSeconds ?? SIGNATURE_TOLERANCE_SECONDS;
  const rateLimit = createRateLimiter(options.rateLimitPerMinute ?? 30, options.now ?? Date.now);
  const operatorHandler = createOperatorHandler({
    pool: options.pool,
    passwordHash: options.operatorPasswordHash,
    cookieSecure: options.operatorCookieSecure,
  });

  return async (request: IncomingMessage, response: ServerResponse): Promise<void> => {
    const url = new URL(request.url ?? "/", "http://automation.local");
    if (await operatorHandler(request, response)) return;
    if (request.method === "GET" && url.pathname === "/healthz") {
      sendJson(response, 200, { status: "ok" });
      return;
    }
    if (request.method === "GET" && url.pathname === "/readyz") {
      try {
        await options.pool.query("SELECT 1");
        sendJson(response, 200, { status: "ready" });
      } catch {
        sendJson(response, 503, { status: "unavailable" });
      }
      return;
    }
    if (request.method !== "POST" || url.pathname !== "/v1/intake/lead-submitted") {
      sendJson(response, 404, { error: "not_found" });
      return;
    }

    const remoteAddress = request.socket.remoteAddress ?? "unknown";
    if (!rateLimit(remoteAddress)) {
      sendJson(response, 429, { error: "rate_limited" });
      return;
    }

    if (!request.headers["content-type"]?.toLowerCase().startsWith("application/json")) {
      sendJson(response, 415, { error: "content_type_required" });
      return;
    }

    try {
      const rawBody = await readBody(request, maxBodyBytes);
      if (!verifyRequestSignature(
        rawBody,
        request.headers,
        options.keys,
        Math.floor((options.now ?? Date.now)() / 1000),
        tolerance,
      )) {
        sendJson(response, 401, { error: "invalid_signature" });
        return;
      }

      let decoded: unknown;
      try {
        decoded = JSON.parse(rawBody.toString("utf8"));
      } catch {
        sendJson(response, 400, { error: "invalid_json" });
        return;
      }

      const validation = validateLeadSubmittedEvent(decoded, options.allowedSources, (options.now ?? Date.now)());
      if (!validation.ok) {
        sendJson(response, validation.code === "unsupported_source" ? 403 : 422, { error: validation.code });
        return;
      }

      const result = await acceptLeadEvent(options.pool, validation.event);
      sendJson(response, 202, {
        accepted: true,
        duplicate: result.duplicate,
        lead_id: result.leadId,
        request_id: randomUUID(),
      });
    } catch (error) {
      if (error instanceof HttpInputError) {
        sendJson(response, error.status, { error: error.code });
        return;
      }
      // Never serialize database errors, request bodies, headers or personal data.
      sendJson(response, 503, { error: "intake_unavailable" });
    }
  };
}
