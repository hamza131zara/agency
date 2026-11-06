export const MAX_BODY_BYTES = 16 * 1024;
export const MAX_ATTEMPTS = 5;
export const SIGNATURE_TOLERANCE_SECONDS = 300;

export const ALLOWED_SERVICES = new Set([
  "Software & website development",
  "AI, LLM & intelligent automation",
  "Blockchain & Web3",
  "Graphic design & creative services",
  "Digital marketing & growth",
  "E-commerce & marketplace operations",
  "Something else",
]);

export interface LeadSubmittedEvent {
  schema_version: 1;
  event_id: string;
  occurred_at: string;
  source: string;
  lead: {
    name: string;
    email: string;
    service: string;
    message: string;
  };
}

export type EventValidation =
  | { ok: true; event: LeadSubmittedEvent }
  | { ok: false; code: "invalid_event" | "unsupported_source" };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(value: Record<string, unknown>, expected: string[]): boolean {
  const actual = Object.keys(value).sort();
  return actual.length === expected.length
    && actual.every((key, index) => key === [...expected].sort()[index]);
}

function containsUnsafeControls(value: string): boolean {
  return /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/u.test(value);
}

export function validateLeadSubmittedEvent(
  value: unknown,
  allowedSources: ReadonlySet<string>,
  nowMs = Date.now(),
): EventValidation {
  if (!isRecord(value)
    || !hasExactKeys(value, ["schema_version", "event_id", "occurred_at", "source", "lead"])
    || value.schema_version !== 1
    || typeof value.event_id !== "string"
    || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.event_id)
    || typeof value.occurred_at !== "string"
    || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/u.test(value.occurred_at)
    || !Number.isFinite(Date.parse(value.occurred_at))
    || Date.parse(value.occurred_at) > nowMs + 5 * 60 * 1000
    || typeof value.source !== "string"
    || !/^[a-z0-9][a-z0-9._-]{2,79}$/u.test(value.source)
    || !isRecord(value.lead)
    || !hasExactKeys(value.lead, ["name", "email", "service", "message"])) {
    return { ok: false, code: "invalid_event" };
  }

  if (!allowedSources.has(value.source as string)) {
    return { ok: false, code: "unsupported_source" };
  }

  const { name, email, service, message } = value.lead;
  if (typeof name !== "string"
    || name.trim().length < 1
    || name.trim().length > 100
    || containsUnsafeControls(name)
    || typeof email !== "string"
    || email.length > 254
    || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email)
    || /[\r\n]/u.test(email)
    || typeof service !== "string"
    || service.length > 120
    || !ALLOWED_SERVICES.has(service)
    || typeof message !== "string"
    || message.trim().length < 20
    || message.length > 3000
    || containsUnsafeControls(message)) {
    return { ok: false, code: "invalid_event" };
  }

  return {
    ok: true,
    event: {
      schema_version: 1,
      event_id: value.event_id,
      occurred_at: value.occurred_at,
      source: value.source,
      lead: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        service,
        message: message.trim(),
      },
    },
  };
}
