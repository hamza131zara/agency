import { createHmac, randomUUID } from "node:crypto";

const baseUrl = process.env.AUTOMATION_API_URL ?? "http://127.0.0.1:8787";
const keyId = process.env.AUTOMATION_DEMO_KEY_ID ?? "local-dev";
const secret = process.env.AUTOMATION_DEMO_SECRET;
if (!secret || Buffer.byteLength(secret, "utf8") < 32) {
  throw new Error("Set AUTOMATION_DEMO_SECRET to a private random value of at least 32 bytes");
}

const timestamp = String(Math.floor(Date.now() / 1000));
const event = {
  schema_version: 1,
  event_id: randomUUID(),
  occurred_at: new Date().toISOString(),
  source: "agency-contact-form",
  lead: {
    name: "Synthetic Demo Visitor",
    email: "demo@example.invalid",
    service: "Software & website development",
    message: "This is a synthetic demonstration inquiry and contains no real customer data.",
  },
};
const rawBody = Buffer.from(JSON.stringify(event));
const signature = createHmac("sha256", secret)
  .update(timestamp, "utf8")
  .update(".", "utf8")
  .update(rawBody)
  .digest("hex");

const response = await fetch(`${baseUrl}/v1/intake/lead-submitted`, {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "x-automation-key-id": keyId,
    "x-automation-timestamp": timestamp,
    "x-automation-signature": `v1=${signature}`,
  },
  body: rawBody,
});
const payload = await response.json();
process.stdout.write(JSON.stringify({ status: response.status, response: payload }, null, 2) + "\n");
if (!response.ok) process.exitCode = 1;
