// 검색 — 로컬 데이터 소량이라 JS 필터로 충분하다 (docs/SITE_SYSTEM.md §5)
import { listAccounts } from '@/features/accounts/api';
import { listSites, type SiteWithCount } from '@/features/sites/api';

export type MatchField = 'siteName' | 'url' | 'accountName' | 'username' | 'memo';

export interface SearchResult {
  site: SiteWithCount;
  matchField: MatchField;
  /** 결과에 보여줄 매치 텍스트. 민감 메모 매치면 null(마스킹) */
  matchText: string | null;
}

export function searchSites(query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const results: SearchResult[] = [];

  for (const site of listSites()) {
    if (site.name.toLowerCase().includes(q)) {
      results.push({ site, matchField: 'siteName', matchText: null });
      continue;
    }
    if (site.url.toLowerCase().includes(q)) {
      results.push({ site, matchField: 'url', matchText: null });
      continue;
    }
    const accounts = listAccounts(site.id);
    let matched: SearchResult | null = null;
    for (const account of accounts) {
      if (account.name?.toLowerCase().includes(q)) {
        matched = { site, matchField: 'accountName', matchText: account.name };
        break;
      }
      if (account.username?.toLowerCase().includes(q)) {
        matched = { site, matchField: 'username', matchText: account.username };
        break;
      }
      if (account.memo?.toLowerCase().includes(q)) {
        // 민감 메모는 매치돼도 본문을 노출하지 않는다 (§3 숨김 약속)
        matched = {
          site,
          matchField: 'memo',
          matchText: account.memoSensitive ? null : account.memo,
        };
        break;
      }
    }
    if (matched) results.push(matched);
  }
  return results;
}
