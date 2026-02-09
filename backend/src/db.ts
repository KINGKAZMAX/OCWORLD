import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./__generated__/db_schema.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, "../data");

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "ocworld.db");
const sqlite = new Database(dbPath);

// Enable WAL mode for better performance
sqlite.pragma("journal_mode = WAL");

// Initialize tables from raw schema (using IF NOT EXISTS)
const rawSqlPath = path.resolve(__dirname, "./__generated__/db_raw_schema.sql");
const rawSql = fs.readFileSync(rawSqlPath, "utf-8");

// Strip comment lines, then split into statements
const strippedSql = rawSql
  .split("\n")
  .filter((line) => !line.trimStart().startsWith("--"))
  .join("\n");

const statements = strippedSql
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s.length > 0)
  .filter((s) => !s.includes("es_system__auth_user")) // skip platform auth table
  .map((s) =>
    s
      .replace(/CREATE TABLE(?! IF NOT EXISTS)/g, "CREATE TABLE IF NOT EXISTS")
      .replace(
        /CREATE UNIQUE INDEX(?! IF NOT EXISTS)/g,
        "CREATE UNIQUE INDEX IF NOT EXISTS"
      )
      .replace(
        /CREATE INDEX(?! IF NOT EXISTS)/g,
        "CREATE INDEX IF NOT EXISTS"
      )
  );

for (const stmt of statements) {
  try {
    sqlite.exec(stmt);
  } catch (e: any) {
    // Ignore errors from already existing objects
    if (!e.message.includes("already exists")) {
      console.warn("[DB] Warning executing statement:", e.message);
    }
  }
}

// Seed demo user if not exists
const existingUser = sqlite
  .prepare("SELECT id FROM users WHERE id = 1")
  .get();
if (!existingUser) {
  sqlite
    .prepare(
      "INSERT INTO users (id, email, nickname, avatar) VALUES (1, 'demo@example.com', 'Demo User', NULL)"
    )
    .run();
  console.log("[DB] Seeded demo user (id=1)");
}

export const db = drizzle(sqlite, { schema });
export const tables = schema;
export { sqlite };
