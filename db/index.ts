import * as SQLite from 'expo-sqlite';

// 마이그레이션 규약: 배열에 추가만 한다(Expand-only). 상세는 docs/DATABASE.md.
const MIGRATIONS: string[] = [
  // v1 — sites · accounts
  `
  CREATE TABLE sites (
    id         TEXT PRIMARY KEY,
    name       TEXT NOT NULL,
    url        TEXT NOT NULL,
    favicon    TEXT,
    favorite   INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
  CREATE TABLE accounts (
    id             TEXT PRIMARY KEY,
    site_id        TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    name           TEXT,
    username       TEXT,
    memo           TEXT,
    memo_sensitive INTEGER NOT NULL DEFAULT 0,
    created_at     INTEGER NOT NULL,
    updated_at     INTEGER NOT NULL
  );
  CREATE INDEX idx_accounts_site ON accounts(site_id);
  `,
];

let db: SQLite.SQLiteDatabase | null = null;

export function getDb(): SQLite.SQLiteDatabase {
  if (db) return db;
  const opened = SQLite.openDatabaseSync('linkmemo.db');
  opened.execSync('PRAGMA foreign_keys = ON'); // SQLite 기본 OFF — CASCADE가 이 줄에 달려 있다
  migrate(opened);
  db = opened;
  return opened;
}

function migrate(database: SQLite.SQLiteDatabase) {
  const row = database.getFirstSync<{ user_version: number }>('PRAGMA user_version');
  const current = row?.user_version ?? 0;
  for (let v = current; v < MIGRATIONS.length; v++) {
    database.withTransactionSync(() => {
      database.execSync(MIGRATIONS[v]);
      database.execSync(`PRAGMA user_version = ${v + 1}`);
    });
  }
}
