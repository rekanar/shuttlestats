'use strict';
require('dotenv').config();

// ─── PostgreSQL pool (used when DATABASE_URL is set — Supabase/Render/etc.) ──
const { Pool } = require('pg');

const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS team_fixtures (
    id                  TEXT PRIMARY KEY,
    team_a_name         TEXT NOT NULL,
    team_b_name         TEXT NOT NULL,
    team_a_players      TEXT NOT NULL,
    team_b_players      TEXT NOT NULL,
    schedule_mode       TEXT NOT NULL DEFAULT 'fair_rounds',
    courts_available    INTEGER NOT NULL DEFAULT 4,
    match_duration_mins INTEGER DEFAULT 30,
    points_win          INTEGER DEFAULT 2,
    points_draw         INTEGER DEFAULT 1,
    points_loss         INTEGER DEFAULT 0,
    is_finished         INTEGER DEFAULT 0,
    finished_at         TEXT,
    share_token         TEXT UNIQUE,
    created_at          TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS match_results (
    id              TEXT PRIMARY KEY,
    fixture_id      TEXT NOT NULL,
    round_number    INTEGER NOT NULL,
    court           INTEGER NOT NULL,
    team_a_player1  TEXT NOT NULL,
    team_a_player2  TEXT NOT NULL,
    team_b_player1  TEXT NOT NULL,
    team_b_player2  TEXT NOT NULL,
    result          TEXT,
    score_a         TEXT,
    score_b         TEXT,
    status          TEXT NOT NULL DEFAULT 'pending',
    entered_at      TEXT,
    FOREIGN KEY (fixture_id) REFERENCES team_fixtures(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_mr_fixture ON match_results(fixture_id);
  CREATE INDEX IF NOT EXISTS idx_mr_round   ON match_results(fixture_id, round_number);
`;

let pool;
let schemaReady = false;

async function getDb() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('supabase')
        ? { rejectUnauthorized: false }
        : false,
    });
  }
  if (!schemaReady) {
    await pool.query(SCHEMA_SQL);
    schemaReady = true;
  }
  return pool;
}

// ─── Helper wrappers to mimic the old sync API style in routes ────────────────

// Single row — returns row or undefined
async function dbGet(sql, params = []) {
  const db = await getDb();
  const { rows } = await db.query(pgify(sql), params);
  return rows[0];
}

// All rows
async function dbAll(sql, params = []) {
  const db = await getDb();
  const { rows } = await db.query(pgify(sql), params);
  return rows;
}

// Run (INSERT / UPDATE / DELETE)
async function dbRun(sql, params = []) {
  const db = await getDb();
  await db.query(pgify(sql), params);
}

// Execute raw SQL (schema / transactions)
async function dbExec(sql) {
  const db = await getDb();
  await db.query(sql);
}

// Convert SQLite ? placeholders → PostgreSQL $1,$2,... placeholders
function pgify(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

module.exports = { getDb, dbGet, dbAll, dbRun, dbExec };
