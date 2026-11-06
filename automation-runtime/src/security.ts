import { createHmac, timingSafeEqual } from "node:crypto";
import type { IncomingHttpHeaders } from "node:http";

export type Keyring = ReadonlyMap<string, string>;

export function parseKeyring(raw: string | undefined): Map<string, string> {
  if (!raw) throw new Error("AUTOMATION_HMAC_KEYS is required");
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("AUTOMATION_HMAC_KEYS must be a JSON object");
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("AUTOMATION_HMAC_KEYS must be a JSON object");
  }
  const entries = Object.entries(parsed as Record<string, unknown>);
  if (entries.length === 0 || entries.length > 10) {
    throw new Error("AUTOMATION_HMAC_KEYS must contain between 1 and 10 keys");
  }
  const keys = new Map<string, string>();
  for (const [id, secret] of entries) {
    if (!/^[a-z0-9._-]{1,64}$/u.test(id)
      || typeof secret !== "string"
      || Buffer.byteLength(secret, "utf8") < 32) {
      throw new Error("Each HMAC key must have a valid id and at least 32 bytes of secret material");
    }
    keys.set(id, secret);
  }
  return keys;
}

export function createSignature(rawBody: Buffer, timestamp: string, secret: string): string {
  const digest = createHmac("sha256", secret)
    .update(timestamp, "utf8")
    .update(".", "utf8")
    .update(rawBody)
    .digest("hex");
  return `v1=${digest}`;
}

export function verifyRequestSignature(
  rawBody: Buffer,
  headers: IncomingHttpHeaders,
  keys: Keyring,
  nowSeconds = Math.floor(Date.now() / 1000),
  toleranceSeconds = 300,
): boolean {
  const keyId = headers["x-automation-key-id"];
  const timestamp = headers["x-automation-timestamp"];
  const signature = headers["x-automation-signature"];

  if (typeof keyId !== "string"
    || typeof timestamp !== "string"
    || typeof signature !== "string"
    || !/^\d{10}$/u.test(timestamp)
    || !/^v1=[a-f0-9]{64}$/u.test(signature)) return false;

  const timestampNumber = Number(timestamp);
  if (!Number.isSafeInteger(timestampNumber)
    || Math.abs(nowSeconds - timestampNumber) > toleranceSeconds) return false;

  const secret = keys.get(keyId);
  if (!secret) return false;

  const expected = Buffer.from(createSignature(rawBody, timestamp, secret).slice(3), "hex");
  const supplied = Buffer.from(signature.slice(3), "hex");
  return expected.length === supplied.length && timingSafeEqual(expected, supplied);
}
