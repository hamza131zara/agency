import { randomUUID } from "node:crypto";
import type { Pool, PoolClient } from "pg";
import type { LeadSubmittedEvent } from "./contracts.js";

export interface AcceptedLead {
  leadId: string;
  duplicate: boolean;
}

export interface LeasedJob {
  jobId: string;
  leadId: string;
  attemptId: string;
  attemptCount: number;
  workerId: string;
  lead: {
    name: string;
    email: string;
    service: string;
    message: string;
    receivedAt: Date;
  };
}

export type JobCompletion =
  | { outcome: "sent"; errorCode?: never; retryAt?: never }
  | { outcome: "retry_scheduled"; errorCode: string; retryAt: Date }
  | { outcome: "dead_letter"; errorCode: string };

async function audit(
  client: PoolClient,
  actorId: string,
  action: string,
  entityType: "lead" | "outbox_job",
  entityId: string,
  metadata: Record<string, string | number | boolean> = {},
): Promise<void> {
  await client.query(
    `INSERT INTO audit_events
      (id, actor_type, actor_id, action, entity_type, entity_id, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)`,
    [randomUUID(), actorId === "system" ? "system" : "worker", actorId, action, entityType, entityId, JSON.stringify(metadata)],
  );
}

export async function acceptLeadEvent(
  pool: Pool,
  event: LeadSubmittedEvent,
  receivedAt = new Date(),
): Promise<AcceptedLead> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const leadId = randomUUID();
    const inserted = await client.query<{ id: string }>(
      `INSERT INTO leads
        (id, source, event_id, name, email, service, message, received_at, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'notification_pending')
       ON CONFLICT (source, event_id) DO NOTHING
       RETURNING id`,
      [leadId, event.source, event.event_id, event.lead.name, event.lead.email, event.lead.service, event.lead.message, receivedAt],
    );

    if (inserted.rowCount === 0) {
      const existing = await client.query<{ id: string }>(
        "SELECT id FROM leads WHERE source = $1 AND event_id = $2",
        [event.source, event.event_id],
      );
      if (!existing.rows[0]) throw new Error("Idempotency record disappeared during intake");
      await client.query("COMMIT");
      return { leadId: existing.rows[0].id, duplicate: true };
    }

    const jobId = randomUUID();
    await client.query(
      `INSERT INTO outbox_jobs (id, lead_id, job_type, idempotency_key)
       VALUES ($1, $2, 'internal_notification', $3)`,
      [jobId, leadId, `${event.source}:${event.event_id}:internal-notification`],
    );
    await audit(client, "system", "lead.accepted", "lead", leadId, {
      source: event.source,
      eventId: event.event_id,
    });
    await audit(client, "system", "notification.queued", "outbox_job", jobId, {
      leadId,
      jobType: "internal_notification",
    });
    await client.query("COMMIT");
    return { leadId, duplicate: false };
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

export async function leaseNextJob(
  pool: Pool,
  workerId: string,
  leaseSeconds = 60,
): Promise<LeasedJob | null> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const claimed = await client.query<{
      id: string;
      lead_id: string;
      attempt_count: number;
    }>(
      `WITH candidate AS (
         SELECT id
         FROM outbox_jobs
         WHERE available_at <= NOW()
           AND (
             status = 'pending'
             OR (status = 'processing' AND locked_at < NOW() - ($2::int * INTERVAL '1 second'))
           )
         ORDER BY available_at ASC, created_at ASC
         FOR UPDATE SKIP LOCKED
         LIMIT 1
       )
       UPDATE outbox_jobs AS job
       SET status = 'processing',
           attempt_count = job.attempt_count + 1,
           locked_at = NOW(),
           locked_by = $1,
           updated_at = NOW()
       FROM candidate
       WHERE job.id = candidate.id
       RETURNING job.id, job.lead_id, job.attempt_count`,
      [workerId, leaseSeconds],
    );

    const job = claimed.rows[0];
    if (!job) {
      await client.query("COMMIT");
      return null;
    }

    const leadResult = await client.query<{
      name: string;
      email: string;
      service: string;
      message: string;
      received_at: Date;
    }>(
      "SELECT name, email, service, message, received_at FROM leads WHERE id = $1",
      [job.lead_id],
    );
    const lead = leadResult.rows[0];
    if (!lead) throw new Error("Outbox job references a missing lead");

    await client.query(
      `UPDATE delivery_attempts
       SET outcome = 'retry_scheduled',
           finished_at = NOW(),
           sanitized_error_code = 'worker_lease_expired'
       WHERE job_id = $1 AND outcome = 'started'`,
      [job.id],
    );

    const attemptId = randomUUID();
    await client.query(
      `INSERT INTO delivery_attempts (id, job_id, attempt_number, outcome)
       VALUES ($1, $2, $3, 'started')`,
      [attemptId, job.id, job.attempt_count],
    );
    await audit(client, workerId, "notification.attempt_started", "outbox_job", job.id, {
      attempt: job.attempt_count,
    });
    await client.query("COMMIT");

    return {
      jobId: job.id,
      leadId: job.lead_id,
      attemptId,
      attemptCount: job.attempt_count,
      workerId,
      lead: {
        name: lead.name,
        email: lead.email,
        service: lead.service,
        message: lead.message,
        receivedAt: lead.received_at,
      },
    };
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

export async function completeJob(
  pool: Pool,
  job: LeasedJob,
  completion: JobCompletion,
): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const outcome = completion.outcome;
    const attemptOutcome = outcome;
    const updatedAttempt = await client.query(
      `UPDATE delivery_attempts
       SET outcome = $2, finished_at = NOW(), sanitized_error_code = $3
       WHERE id = $1 AND outcome = 'started'`,
      [job.attemptId, attemptOutcome, outcome === "sent" ? null : completion.errorCode],
    );
    if (updatedAttempt.rowCount !== 1) throw new Error("Delivery attempt is no longer active");

    let jobStatus: "sent" | "pending" | "dead_letter";
    let errorCode: string | null = null;
    if (outcome === "sent") {
      jobStatus = "sent";
    } else if (outcome === "retry_scheduled") {
      jobStatus = "pending";
      errorCode = completion.errorCode;
    } else {
      jobStatus = "dead_letter";
      errorCode = completion.errorCode;
    }

    const result = await client.query(
      `UPDATE outbox_jobs
       SET status = $2,
           available_at = CASE WHEN $6::boolean THEN $3::timestamptz ELSE available_at END,
           locked_at = NULL,
           locked_by = NULL,
           last_error_code = $4,
           updated_at = NOW()
       WHERE id = $1 AND status = 'processing' AND locked_by = $5`,
      [
        job.jobId,
        jobStatus,
        outcome === "retry_scheduled" ? completion.retryAt : new Date(),
        errorCode,
        job.workerId,
        outcome === "retry_scheduled",
      ],
    );
    if (result.rowCount !== 1) throw new Error("Worker lease was lost before completion");

    if (jobStatus !== "pending") {
      await client.query(
        "UPDATE leads SET status = $2 WHERE id = $1",
        [job.leadId, jobStatus === "sent" ? "notified" : "notification_failed"],
      );
    }

    await audit(client, job.workerId, `notification.${outcome}`, "outbox_job", job.jobId, {
      attempt: job.attemptCount,
      ...(errorCode ? { errorCode } : {}),
    });
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}
