-- CerebreX Registry — D1 Schema

CREATE TABLE IF NOT EXISTS packages (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT NOT NULL,
  version      TEXT NOT NULL,
  description  TEXT NOT NULL DEFAULT '',
  author       TEXT NOT NULL DEFAULT '',
  tags         TEXT NOT NULL DEFAULT '[]',   -- JSON array
  tarball_key  TEXT NOT NULL,                -- KV key for the tarball
  tarball_size INTEGER NOT NULL DEFAULT 0,
  sha256       TEXT NOT NULL DEFAULT '',     -- SHA-256 hex digest of the tarball
  published_at TEXT NOT NULL,
  UNIQUE(name, version)
);

CREATE INDEX IF NOT EXISTS idx_packages_name ON packages(name);
CREATE INDEX IF NOT EXISTS idx_packages_published_at ON packages(published_at DESC);

-- Token registry: store hashed tokens, never plaintext
CREATE TABLE IF NOT EXISTS tokens (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  token_hash   TEXT NOT NULL UNIQUE,  -- SHA-256(token) hex
  owner        TEXT NOT NULL,
  created_at   TEXT NOT NULL,
  last_used_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_tokens_hash ON tokens(token_hash);
