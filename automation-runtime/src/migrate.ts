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

const migrations = [
  { version: "001_initial_schema", file: "001_initial_schema.sql" },
  { version: "002_operator_controls", file: "002_operator_controls.sql" },
] as const;

try {
  await pool.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
    version TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);

  for (const migration of migrations) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("SELECT pg_advisory_xact_lock(610240501)");
      const existing = await client.query(
        "SELECT version FROM schema_migrations WHERE version = $1",
        [migration.version],
      );
      if (existing.rowCount === 0) {
        const sql = await readFile(
          new URL(`../../sql/${migration.file}`, import.meta.url),
          "utf8",
        );
        await client.query(sql);
        await client.query(
          "INSERT INTO schema_migrations (version) VALUES ($1)",
          [migration.version],
        );
        await client.query("COMMIT");
        process.stdout.write(`Applied migration ${migration.version}\n`);
      } else {
        await client.query("COMMIT");
        process.stdout.write(`Migration ${migration.version} already applied\n`);
      }
    } catch (error) {
      await client.query("ROLLBACK").catch(() => undefined);
      throw error;
    } finally {
      client.release();
    }
  }
} finally {
  await pool.end();
}
