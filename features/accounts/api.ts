import { randomUUID } from 'expo-crypto';

import { getDb } from '@/db';

export interface Account {
  id: string;
  siteId: string;
  name: string | null;
  username: string | null;
  memo: string | null;
  memoSensitive: boolean;
  createdAt: number;
  updatedAt: number;
}

interface AccountRow {
  id: string;
  site_id: string;
  name: string | null;
  username: string | null;
  memo: string | null;
  memo_sensitive: number;
  created_at: number;
  updated_at: number;
}

function toAccount(row: AccountRow): Account {
  return {
    id: row.id,
    siteId: row.site_id,
    name: row.name,
    username: row.username,
    memo: row.memo,
    memoSensitive: row.memo_sensitive === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface AccountInput {
  name: string;
  username: string;
  memo: string;
  memoSensitive: boolean;
}

// 빈 문자열은 NULL로 저장 — "전 필드 선택" 규칙(CLAUDE.md §5)
function orNull(value: string): string | null {
  const v = value.trim();
  return v.length > 0 ? v : null;
}

export function listAccounts(siteId: string): Account[] {
  const rows = getDb().getAllSync<AccountRow>(
    'SELECT * FROM accounts WHERE site_id = ? ORDER BY created_at ASC',
    [siteId],
  );
  return rows.map(toAccount);
}

export function getAccount(id: string): Account | null {
  const row = getDb().getFirstSync<AccountRow>('SELECT * FROM accounts WHERE id = ?', [id]);
  return row ? toAccount(row) : null;
}

export function createAccount(siteId: string, input: AccountInput): Account {
  const now = Date.now();
  const id = randomUUID();
  getDb().runSync(
    `INSERT INTO accounts (id, site_id, name, username, memo, memo_sensitive, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, siteId, orNull(input.name), orNull(input.username), orNull(input.memo), input.memoSensitive ? 1 : 0, now, now],
  );
  return {
    id,
    siteId,
    name: orNull(input.name),
    username: orNull(input.username),
    memo: orNull(input.memo),
    memoSensitive: input.memoSensitive,
    createdAt: now,
    updatedAt: now,
  };
}

export function updateAccount(id: string, input: AccountInput): void {
  getDb().runSync(
    'UPDATE accounts SET name = ?, username = ?, memo = ?, memo_sensitive = ?, updated_at = ? WHERE id = ?',
    [orNull(input.name), orNull(input.username), orNull(input.memo), input.memoSensitive ? 1 : 0, Date.now(), id],
  );
}

export function deleteAccount(id: string): void {
  getDb().runSync('DELETE FROM accounts WHERE id = ?', [id]);
}
