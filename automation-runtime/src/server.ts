import { assertSandboxOnlyRuntime } from "./runtime-guard.js";
import { createServer } from "node:http";
import { Pool } from "pg";
import { MAX_BODY_BYTES, SIGNATURE_TOLERANCE_SECONDS } from "./contracts.js";
import { createIntakeHandler } from "./handler.js";
import { parseKeyring } from "./security.js";

assertSandboxOnlyRuntime();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required");

const keys = parseKeyring(process.env.AUTOMATION_HMAC_KEYS);
const allowedSources = new Set(
  (process.env.AUTOMATION_ALLOWED_SOURCES ?? "agency-contact-form")
    .split(",")
    .map((source) => source.trim())
    .filter(Boolean),
);
if (allowedSources.size === 0) throw new Error("At least one allowed source is required");

function readPositiveInteger(name: string, fallback: number, maximum: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > maximum) {
    throw new Error(`${name} must be an integer between 1 and ${maximum}`);
  }
  return parsed;
}

const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
  ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: true } : undefined,
  application_name: "agency-automation-api",
});
const handler = createIntakeHandler({
  pool,
  keys,
  allowedSources,
  maxBodyBytes: readPositiveInteger("AUTOMATION_MAX_BODY_BYTES", MAX_BODY_BYTES, 65_536),
  signatureToleranceSeconds: readPositiveInteger(
    "AUTOMATION_SIGNATURE_TOLERANCE_SECONDS",
    SIGNATURE_TOLERANCE_SECONDS,
    900,
  ),
  rateLimitPerMinute: readPositiveInteger("AUTOMATION_RATE_LIMIT_PER_MINUTE", 30, 600),
  operatorPasswordHash: process.env.AUTOMATION_OPERATOR_PASSWORD_HASH,
  operatorCookieSecure: process.env.NODE_ENV !== "development",
});

const port = readPositiveInteger("PORT", 8787, 65_535);
const server = createServer((request, response) => {
  void handler(request, response).catch(() => {
    if (!response.headersSent) {
      response.writeHead(503, { "content-type": "application/json", "cache-control": "no-store" });
    }
    response.end(JSON.stringify({ error: "service_unavailable" }));
  });
});
server.headersTimeout = 12_000;
server.requestTimeout = 10_000;
server.keepAliveTimeout = 5_000;

let closing = false;
async function shutdown(): Promise<void> {
  if (closing) return;
  closing = true;
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.once("SIGINT", () => void shutdown());
process.once("SIGTERM", () => void shutdown());

server.listen(port, "0.0.0.0", () => {
  process.stdout.write(`Lead intake sandbox API listening on port ${port}\n`);
});
