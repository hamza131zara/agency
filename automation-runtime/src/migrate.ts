import { readFile } from "node:fs/promises";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required");

const pool = new Pool({
  connectionString,
  max: 2,
  ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: true } : undefined,
  application_name: "agency-automation-migrator",
});

try {
  await pool.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
    version TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
  const version = "001_initial_schema";
  const existing = await pool.query("SELECT version FROM schema_migrations WHERE version = $1", [version]);
  if (existing.rowCount === 0) {
    const sql = await readFile(new URL("../../sql/001_initial_schema.sql", import.meta.url), "utf8");
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (version) VALUES ($1)", [version]);
      await client.query("COMMIT");
      process.stdout.write(`Applied migration ${version}\n`);
    } catch (error) {
      await client.query("ROLLBACK").catch(() => undefined);
      throw error;
    } finally {
      client.release();
    }
  } else {
    process.stdout.write(`Migration ${version} already applied\n`);
  }
} finally {
  await pool.end();
}
