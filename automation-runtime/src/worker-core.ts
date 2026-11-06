import type { Pool } from "pg";
import { MAX_ATTEMPTS } from "./contracts.js";
import { completeJob, leaseNextJob } from "./repository.js";
import { TransportFailure, type NotificationTransport } from "./transport.js";

export interface WorkerOptions {
  maxAttempts?: number;
  leaseSeconds?: number;
  backoffBaseMs?: number;
  now?: () => Date;
}

export async function processNextJob(
  pool: Pool,
  workerId: string,
  transport: NotificationTransport,
  options: WorkerOptions = {},
): Promise<boolean> {
  const maxAttempts = options.maxAttempts ?? MAX_ATTEMPTS;
  const leaseSeconds = options.leaseSeconds ?? 60;
  const backoffBaseMs = options.backoffBaseMs ?? 1_000;
  const now = options.now ?? (() => new Date());
  const job = await leaseNextJob(pool, workerId, leaseSeconds);
  if (!job) return false;

  try {
    await transport.send(job);
    await completeJob(pool, job, { outcome: "sent" });
  } catch (error) {
    const failure = error instanceof TransportFailure
      ? error
      : new TransportFailure("transport_unavailable", true);
    const safeCode = /^[a-z0-9_]{1,80}$/u.test(failure.code) ? failure.code : "transport_error";

    if (failure.retryable && job.attemptCount < maxAttempts) {
      const jitter = 0.75 + Math.random() * 0.5;
      const delay = Math.max(0, Math.round(backoffBaseMs * (2 ** (job.attemptCount - 1)) * jitter));
      await completeJob(pool, job, {
        outcome: "retry_scheduled",
        errorCode: safeCode,
        retryAt: new Date(now().getTime() + delay),
      });
    } else {
      await completeJob(pool, job, {
        outcome: "dead_letter",
        errorCode: safeCode,
      });
    }
  }
  return true;
}
