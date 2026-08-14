# SITE_SYSTEM — 사이트·계정·검색·즐겨찾기 (도메인 정본)

> LinkMemo의 핵심 도메인. 정책 요약과 기둥은 [`../CLAUDE.md`](../CLAUDE.md) §5·§8, 여기는 상세.
> 2026-08-14 기획 확정 내용을 옮긴 것 — 구현 0%.

## 구현 현황

| 영역 | 상태 |
|---|---|
| 사이트 CRUD · 이름 자동 제안 · 아이콘 | ❌ |
| 계정 CRUD · 민감한 메모 | ❌ |
| 사이트 상세 · Open in Browser | ❌ |
| 검색 | ❌ |
| 즐겨찾기 | ❌ |
| 홈 · 하단 네비게이션 | ❌ |

---

## 1. 핵심 컨셉

> "링크를 저장하고, 그 링크에 필요한 정보를 함께 기록한다."

```
GitHub (https://github.com)
 ├─ Personal  — ID: personal@example.com · Memo: Personal projects
 ├─ Work      — ID: work@example.com     · Memo: Company account
 └─ Test      — ID: test@example.com     · Memo: Development testing account
```

사이트와 관련 계정을 하나의 공간에서 관리한다. 대표 시나리오: 개인 계정 관리 · 업무 계정 관리 ·
개발자 사이트 모음(GitHub·Stack Overflow·Vercel…) · 쇼핑몰 관리(기획서 §39).

---

## 2. 사이트 등록

| 항목 | 필수 | 설명 |
|---|---|---|
| URL | **O** | 유일한 필수값 |
| Site Name | X | 미입력 시 자동 제안 |

### 이름 자동 제안

`https://github.com` → `GitHub`, `https://notion.so` → `Notion`. 사용자가 제안값을 수정할 수 있다.

- **도메인 파싱만으로 확정**(2026-08-14) — 오프라인에서도 동작한다. 알려진 도메인 표 + 첫 라벨 capitalize 폴백.
- 페이지 `<title>` fetch는 하지 않는다(프라이버시·복잡도 — CLAUDE.md §14 #5-7).

### 사이트 아이콘 — ✅ 직접 fetch로 확정 (2026-08-14)

- **해당 사이트에서 직접 가져온다**(`/favicon.ico` → HTML `<link rel="icon">` 폴백) + **로컬 캐시.**
  실패 시 **이니셜 기본 아이콘**(테마 색 배경 + 도메인 첫 글자).
- 외부 아이콘 서비스(Google S2 등)는 🚫 — 사용자가 저장한 도메인 목록이 제3자에게 흘러간다(기둥 2 위반).
  직접 fetch는 사용자가 어차피 방문하는 사이트라 새로운 노출이 없다.
- 아이콘은 사용자 데이터와 별도로 관리(캐시 성격 — 지워져도 데이터 손실이 아니다). 오프라인 등록 시
  아이콘 없이 저장하고 다음 온라인 시점에 채운다 — **아이콘 실패가 사이트 저장을 막지 않는다.**

---

## 3. 계정

하나의 사이트에 **여러 계정**. 계정 수 상한 없음.

| 항목 | 필수 | 설명 |
|---|---|---|
| Account Name | X | 구분용 이름 (Personal / Work …) |
| Username / ID | X | 로그인 ID |
| Memo | X | 자유 메모 |
| Sensitive Memo | X | 메모 숨김 여부 플래그 |

- **모든 필드가 선택** — 사이트만 저장하고 계정 0개도 정상 상태다.
- **Password 전용 필드는 없다**(CLAUDE.md §8). 적고 싶으면 메모에 적는다.

계정 메모는 **1개 + `memoSensitive` 숨김 플래그**로 확정(2026-08-14 — CLAUDE.md §5.
일반/민감 메모 2칸이 아니다).

### 민감한 메모 (MVP = 전체 숨김)

```
🔒 Sensitive Memo
••••••••••••••••••     ← 눈 아이콘을 누르면 표시
```

- 플래그가 켜진 메모는 목록·상세에서 항상 가려진 상태로 시작한다.
- 확인 중에는 전면 광고를 띄우지 않는다(CLAUDE.md §7).
- 부분 텍스트 숨김은 P2. **숨김은 암호화가 아니다** — 사용자 표기 규칙은 CLAUDE.md §8.

---

## 4. 사이트 상세 화면

```
← GitHub

[ Icon ]  GitHub
          github.com

[ Open in Browser ]

Accounts
┌──────────────────────┐  ┌──────────────────────┐
│ Personal             │  │ Work                 │
│ ID personal@ex.com   │  │ ID work@ex.com       │
│ Memo Personal proj.  │  │ 🔒 •••••••••••       │
└──────────────────────┘  └──────────────────────┘
+ Add Account
```

### Open in Browser

`LinkMemo → OS 기본 브라우저 → Website`. 여기까지가 역할이다.

**제공하지 않는 것**: 자동 로그인 · ID/비밀번호 자동 입력 · 앱 내 WebView · 브라우저 세션 관리.

- 브라우저 실행 직전에 광고를 띄우지 않는다(기둥 6).
- URL 스킴이 없으면 저장 시 `https://`를 보정한다. `openURL` 실패(잘못된 URL)는 조용히 삼키지 말고 알린다.

---

## 5. 검색

검색 대상: **Site Name · URL · Account Name · Username/ID · Memo** 전체.

| 검색어 | 결과 |
|---|---|
| `github` | 사이트 GitHub |
| `work` | Work 계정이 등록된 사이트 |
| `project` | "project"가 포함된 메모의 사이트 |

- 검색 입구는 ~~홈 검색바~~ → **홈 우상단 검색 버튼 하나 → 검색 화면**(2026-08-14 사용자 재정정).
  Search 탭은 없다(조각의 강등 실증 승계 — 검색은 목적지가 아니라 도구다).
- 결과는 사이트 단위로 묶어 보여준다(어느 필드가 맞았는지 힌트 표시).
- **민감(숨김) 메모 본문**: 매치는 시키되 결과 미리보기에 본문을 노출하지 않는다(§3의 숨김 약속과 일관).

---

## 6. 즐겨찾기

- **사이트 단위**로 등록/해제. 홈 상단 즐겨찾기 영역 + Favorites 탭.

## 7. 홈 화면 · 하단 네비게이션

```
LinkMemo                🔍  ＋   ← 우상단 헤더 버튼 2개 = 유일한 검색·추가 입구(2026-08-14 재정정)
Favorites   [GitHub] [Notion] [Gmail]     (+ 편집 — 시안 반영)
All Sites
  YouTube  youtube.com   2      ← 숫자 = 계정 수 배지
  GitHub   github.com    3
─────────────────────────
        Banner Ad               ← 네비 위(MONETIZATION_SYSTEM §2)
─────────────────────────
Home    Favorites    Settings   ← 3탭(2026-08-14 재정정 — Search에 이어 +도 네비에서 제거)
```

- 🔍는 검색 화면으로, ＋는 사이트 추가 화면으로. 홈 본문에 검색바는 두지 않는다(입구 중복 금지).
- Settings에는 Theme · Remove Ads · Security(P1 자리) · Data · App Information.
- ~~"최근 사이트" 고려~~ → **MVP 제외, P1**(2026-08-14 판단).
- ⚠ 테마 시안(`design/theme-mockups-10.png`)은 5탭으로 그려져 있다 — **네비 구성은 이 문서가 정본**이고
  시안은 팔레트·톤 기준으로만 쓴다(THEME_SYSTEM §1).
- 첫 실행 빈 화면에 **데이터 손실 안내**(CLAUDE.md §6)와 사이트 추가 유도를 함께 둔다.

---

## 8. 데이터 구조

정본은 [`../CLAUDE.md`](../CLAUDE.md) §5. `Site 1:N Account`, expo-sqlite.
사이트 삭제 시 소속 계정도 함께 삭제(확인 다이얼로그 필수 — 삭제 확인 중 광고 금지).
스키마·마이그레이션 규약은 `DATABASE.md`(미작성)로 분리 예정.
