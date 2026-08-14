# DATABASE — expo-sqlite 스키마·마이그레이션 규약

> 로컬 데이터 정본. 개요는 [`../CLAUDE.md`](../CLAUDE.md) §5·§6. 작성 2026-08-14(Phase 2 착수).

## 구현 현황

| 영역 | 상태 |
|---|---|
| DB 오픈·마이그레이션 러너(`db/index.ts`) | ✅ 2026-08-14 — user_version 기반, FK ON |
| v1 스키마(sites·accounts) | ✅ 2026-08-14 |

## 1. 규약

- **파일**: `linkmemo.db` (expo-sqlite, sync API — 로컬 소량 데이터라 충분. 조각과 동일 판단).
- **마이그레이션**: `PRAGMA user_version` 기반. `db/index.ts`의 `MIGRATIONS` 배열에 **추가만** 한다
  (Expand-only — 이미 배포된 버전의 마이그레이션을 수정·삭제하면 기존 사용자 DB가 깨진다).
  각 마이그레이션은 트랜잭션으로 적용 후 user_version을 올린다.
- **id**: UUID 문자열(expo-crypto `randomUUID`). **정수 자동증가 금지** — 백업/복원(P1)·병합 시 충돌 방지.
- **시각**: epoch ms 정수(`created_at`·`updated_at`). 표기 현지화는 UI 층에서.
- **FK**: `PRAGMA foreign_keys = ON`을 오픈 시마다 켠다(SQLite 기본 OFF). 사이트 삭제 → 계정 CASCADE.
- 컬럼명은 snake_case, TS 인터페이스는 camelCase — 매핑은 쿼리 AS로.

## 2. v1 스키마

```sql
CREATE TABLE sites (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,            -- 자동 제안값이라도 저장 시점엔 항상 채워진다
  url        TEXT NOT NULL,            -- 정규화된 URL (https:// 보정 후)
  favicon    TEXT,                     -- 로컬 캐시 경로 (Phase 3 전까지 NULL)
  favorite   INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE accounts (
  id             TEXT PRIMARY KEY,
  site_id        TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  name           TEXT,                 -- 전 필드 선택 (CLAUDE.md §5)
  username       TEXT,
  memo           TEXT,
  memo_sensitive INTEGER NOT NULL DEFAULT 0,   -- 숨김 플래그 (메모 1개 + 플래그 결정)
  created_at     INTEGER NOT NULL,
  updated_at     INTEGER NOT NULL
);

CREATE INDEX idx_accounts_site ON accounts(site_id);
```

## 3. 조회 패턴

- 홈 목록: `SELECT s.*, (SELECT COUNT(*) FROM accounts a WHERE a.site_id = s.id) AS account_count
  FROM sites s ORDER BY s.updated_at DESC` — **정렬은 최근 수정 순**(2026-08-14 결정.
  즐겨찾기는 Phase 3에서 별도 섹션이므로 정렬 축에 섞지 않는다).
- 검색(Phase 3): sites LEFT JOIN accounts, LIKE 5필드 — FTS는 데이터 규모상 불요, 필요해지면 마이그레이션.

## 4. 주의

- **스키마 변경은 새 마이그레이션으로만.** 출시 후에는 조각·배구와 같은 세이브 체인 규약이 적용된다
  (v1→vN 순차 적용, 최신 점프 금지).
- 삭제는 즉시 삭제(휴지통 없음 — MVP). 사이트 삭제 확인 다이얼로그에 "계정 N개도 함께 삭제"를 명시한다.
