import { randomUUID } from 'expo-crypto';

import { getDb } from '@/db';

export interface Site {
  id: string;
  name: string;
  url: string;
  favicon: string | null;
  favorite: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface SiteWithCount extends Site {
  accountCount: number;
}

interface SiteRow {
  id: string;
  name: string;
  url: string;
  favicon: string | null;
  favorite: number;
  created_at: number;
  updated_at: number;
  account_count?: number;
}

function toSite(row: SiteRow): Site {
  return {
    id: row.id,
    name: row.name,
    url: row.url,
    favicon: row.favicon,
    favorite: row.favorite === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// 정렬: 최근 수정 순 (docs/DATABASE.md §3). 즐겨찾기는 홈에서 별도 섹션.
export function listSites(): SiteWithCount[] {
  const rows = getDb().getAllSync<SiteRow>(
    `SELECT s.*, (SELECT COUNT(*) FROM accounts a WHERE a.site_id = s.id) AS account_count
     FROM sites s ORDER BY s.updated_at DESC`,
  );
  return rows.map((r) => ({ ...toSite(r), accountCount: r.account_count ?? 0 }));
}

export function getSite(id: string): Site | null {
  const row = getDb().getFirstSync<SiteRow>('SELECT * FROM sites WHERE id = ?', [id]);
  return row ? toSite(row) : null;
}

// 중복 URL 차단용 — 정규화된 URL의 완전 일치 조회. 수정 시 자기 자신은 excludeId로 제외
// (docs/SITE_SYSTEM.md §2 URL 정규화 규칙)
export function findSiteByUrl(url: string, excludeId?: string): Site | null {
  const row = excludeId
    ? getDb().getFirstSync<SiteRow>('SELECT * FROM sites WHERE url = ? AND id != ?', [url, excludeId])
    : getDb().getFirstSync<SiteRow>('SELECT * FROM sites WHERE url = ?', [url]);
  return row ? toSite(row) : null;
}

export function createSite(input: { name: string; url: string }): Site {
  const now = Date.now();
  const site: Site = {
    id: randomUUID(),
    name: input.name,
    url: input.url,
    favicon: null,
    favorite: false,
    createdAt: now,
    updatedAt: now,
  };
  getDb().runSync(
    'INSERT INTO sites (id, name, url, favicon, favorite, created_at, updated_at) VALUES (?, ?, ?, NULL, 0, ?, ?)',
    [site.id, site.name, site.url, now, now],
  );
  return site;
}

export function updateSite(id: string, input: { name: string; url: string }): void {
  const current = getSite(id);
  // URL이 바뀌면 아이콘을 비워 다시 해석하게 한다 (docs/SITE_SYSTEM.md §2)
  const clearFavicon = current !== null && current.url !== input.url;
  getDb().runSync(
    `UPDATE sites SET name = ?, url = ?, updated_at = ?${clearFavicon ? ', favicon = NULL' : ''} WHERE id = ?`,
    [input.name, input.url, Date.now(), id],
  );
}

export function updateSiteFavicon(id: string, favicon: string): void {
  // 아이콘은 캐시 성격 — updated_at을 건드리지 않는다(목록 순서 불변)
  getDb().runSync('UPDATE sites SET favicon = ? WHERE id = ?', [favicon, id]);
}

export function setSiteFavorite(id: string, favorite: boolean): void {
  // 즐겨찾기 토글은 "수정"이 아니다 — updated_at을 건드리면 목록 순서가 튄다
  getDb().runSync('UPDATE sites SET favorite = ? WHERE id = ?', [favorite ? 1 : 0, id]);
}

export function deleteSite(id: string): void {
  // accounts는 FK CASCADE로 함께 삭제
  getDb().runSync('DELETE FROM sites WHERE id = ?', [id]);
}
