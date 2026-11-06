import { assertSandboxOnlyRuntime } from "./runtime-guard.js";
import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import { processNextJob } from "./worker-core.js";
import { FakeNotificationTransport, type FakeTransportMode } from "./transport.js";

assertSandboxOnlyRuntime();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required");

const allowedModes: FakeTransportMode[] = [
  "success",
  "transient_failure",
  "permanent_failure",
  "timeout",
];
const configuredMode = process.env.AUTOMATION_FAKE_TRANSPORT_MODE ?? "success";
if (!allowedModes.includes(configuredMode as FakeTransportMode)) {
  throw new Error("AUTOMATION_FAKE_TRANSPORT_MODE must select a supported fake mode");
}

const pollMs = Number(process.env.AUTOMATION_WORKER_POLL_MS ?? 1_000);
if (!Number.isSafeInteger(pollMs) || pollMs < 100 || pollMs > 30_000) {
  throw new Error("AUTOMATION_WORKER_POLL_MS must be between 100 and 30000");
}

const workerId = process.env.AUTOMATION_WORKER_ID ?? `sandbox-worker-${randomUUID()}`;
const pool = new Pool({
  connectionString,
  max: 3,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
  ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: true } : undefined,
  application_name: "agency-automation-worker",
});
const transport = new FakeNotificationTransport(configuredMode as FakeTransportMode);
const once = process.env.AUTOMATION_WORKER_ONCE === "true";

let stopping = false;
let timer: NodeJS.Timeout | undefined;
async function shutdown(): Promise<void> {
  stopping = true;
  if (timer) clearTimeout(timer);
  await pool.end();
}
process.once("SIGINT", () => void shutdown());
process.once("SIGTERM", () => void shutdown());

async function cycle(): Promise<void> {
  if (stopping) return;
  try {
    const processed = await processNextJob(pool, workerId, transport);
    if (processed) process.stdout.write(JSON.stringify({ event: "outbox_job_processed" }) + "\n");
  } catch {
    process.stderr.write(JSON.stringify({ event: "worker_cycle_failed", code: "worker_error" }) + "\n");
  }
  if (once) {
    await shutdown();
    return;
  }
  if (!stopping) timer = setTimeout(() => void cycle(), pollMs);
}

void cycle();
