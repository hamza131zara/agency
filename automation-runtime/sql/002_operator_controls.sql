ALTER TABLE outbox_jobs
  ADD COLUMN IF NOT EXISTS retry_generation INTEGER NOT NULL DEFAULT 0
  CHECK (retry_generation >= 0);

ALTER TABLE delivery_attempts
  ADD COLUMN IF NOT EXISTS retry_generation INTEGER NOT NULL DEFAULT 0
  CHECK (retry_generation >= 0);

ALTER TABLE delivery_attempts
  DROP CONSTRAINT IF EXISTS delivery_attempts_job_id_attempt_number_key;

ALTER TABLE delivery_attempts
  ADD CONSTRAINT delivery_attempts_job_generation_attempt_key
  UNIQUE (job_id, retry_generation, attempt_number);

CREATE TABLE IF NOT EXISTS operator_sessions (
  id UUID PRIMARY KEY,
  token_hash CHAR(64) NOT NULL UNIQUE,
  csrf_hash CHAR(64) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS operator_sessions_active_idx
  ON operator_sessions (token_hash, expires_at)
  WHERE revoked_at IS NULL;

CREATE INDEX IF NOT EXISTS operator_sessions_expiry_idx
  ON operator_sessions (expires_at);
