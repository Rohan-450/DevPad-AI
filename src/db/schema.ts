import { db } from "./client";

const DATABASE_VERSION = 4;

type VersionRow = { user_version: number };

// Idempotent — runs every launch. New tables/indexes go here.
async function ensureSchema(): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = 'wal';

    CREATE TABLE IF NOT EXISTS snippets (
      id          TEXT    PRIMARY KEY NOT NULL,
      title       TEXT    NOT NULL,
      code        TEXT    NOT NULL,
      language    TEXT    NOT NULL,
      is_favorite INTEGER NOT NULL DEFAULT 0,
      created_at  INTEGER NOT NULL,
      updated_at  INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_snippets_updated_at  ON snippets(updated_at DESC);
    CREATE INDEX IF NOT EXISTS idx_snippets_is_favorite ON snippets(is_favorite);

    CREATE TABLE IF NOT EXISTS tags (
      id   INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE COLLATE NOCASE
    );

    CREATE TABLE IF NOT EXISTS snippet_tags (
      snippet_id TEXT    NOT NULL REFERENCES snippets(id) ON DELETE CASCADE,
      tag_id     INTEGER NOT NULL REFERENCES tags(id)     ON DELETE CASCADE,
      PRIMARY KEY (snippet_id, tag_id)
    );
    CREATE INDEX IF NOT EXISTS idx_snippet_tags_tag ON snippet_tags(tag_id);

    CREATE TABLE IF NOT EXISTS attachments (
      id         TEXT    PRIMARY KEY NOT NULL,
      snippet_id TEXT    NOT NULL REFERENCES snippets(id) ON DELETE CASCADE,
      uri        TEXT    NOT NULL,
      name       TEXT    NOT NULL,
      kind       TEXT    NOT NULL,
      size       INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_attachments_snippet ON attachments(snippet_id);

    CREATE TABLE IF NOT EXISTS ai_generations (
      id         TEXT    PRIMARY KEY NOT NULL,
      snippet_id TEXT    NOT NULL REFERENCES snippets(id) ON DELETE CASCADE,
      kind       TEXT    NOT NULL,
      content    TEXT    NOT NULL,
      model      TEXT,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_ai_gen_snippet_kind_time
      ON ai_generations(snippet_id, kind, created_at DESC);
  `);
}

export async function migrate(): Promise<void> {
  await db.execAsync("PRAGMA foreign_keys = ON;");
  await ensureSchema();

  // One-off ALTERs go here, gated on user_version.
  const row = await db.getFirstAsync<VersionRow>("PRAGMA user_version");
  const current = row?.user_version ?? 0;
  if (current >= DATABASE_VERSION) return;

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
