CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY,
  source VARCHAR(80) NOT NULL,
  event_id VARCHAR(100) NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(254) NOT NULL,
  service VARCHAR(120) NOT NULL,
  message TEXT NOT NULL,
  received_at TIMESTAMPTZ NOT NULL,
  status VARCHAR(24) NOT NULL DEFAULT 'received'
    CHECK (status IN ('received', 'notification_pending', 'notified', 'notification_failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (source, event_id)
);

CREATE TABLE IF NOT EXISTS outbox_jobs (
  id UUID PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  job_type VARCHAR(64) NOT NULL CHECK (job_type = 'internal_notification'),
  idempotency_key VARCHAR(180) NOT NULL UNIQUE,
  status VARCHAR(24) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'sent', 'dead_letter')),
  attempt_count INTEGER NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  available_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  locked_at TIMESTAMPTZ,
  locked_by VARCHAR(120),
  last_error_code VARCHAR(80),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((status = 'processing' AND locked_at IS NOT NULL AND locked_by IS NOT NULL)
      OR (status <> 'processing' AND locked_at IS NULL AND locked_by IS NULL))
);

CREATE INDEX IF NOT EXISTS outbox_jobs_due_idx
  ON outbox_jobs (available_at, created_at)
  WHERE status IN ('pending', 'processing');

CREATE TABLE IF NOT EXISTS delivery_attempts (
  id UUID PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES outbox_jobs(id) ON DELETE CASCADE,
  attempt_number INTEGER NOT NULL CHECK (attempt_number > 0),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  outcome VARCHAR(32) NOT NULL
    CHECK (outcome IN ('started', 'sent', 'retry_scheduled', 'dead_letter')),
  sanitized_error_code VARCHAR(80),
  UNIQUE (job_id, attempt_number)
);

CREATE TABLE IF NOT EXISTS audit_events (
  id UUID PRIMARY KEY,
  actor_type VARCHAR(32) NOT NULL CHECK (actor_type IN ('system', 'worker', 'operator')),
  actor_id VARCHAR(120) NOT NULL,
  action VARCHAR(80) NOT NULL,
  entity_type VARCHAR(40) NOT NULL,
  entity_id UUID NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS audit_events_entity_idx
  ON audit_events (entity_type, entity_id, occurred_at DESC);
