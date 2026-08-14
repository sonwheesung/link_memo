# LinkMemo — MVP 구현 플랜

> 범위 정본은 [`../CLAUDE.md`](../CLAUDE.md) §3(MVP)·§14(확정 결정). 이 문서는 **착수 순서와 완료 기준**이다.
> 형식은 `common_server/docs/PLAN.md` 승계. 각 Phase는 완료 기준을 만족하고 실기기(Tailscale)에서
> 눈으로 확인한 뒤 다음으로 넘어간다. 작성일: 2026-08-14.

## 진행 상황

| Phase | 내용 | 상태 |
|---|---|---|
| 0 | 기반 정리 — 템플릿 청소·폴더 구조·i18n 뼈대 | ✅ 2026-08-14 — typecheck·lint·번들(1512모듈) 통과. ⏳ 실기기 눈확인만 남음(사용자) |
| 1 | 테마 시스템 — 토큰 + 10종 팔레트 + 선택 화면 | ✅ 2026-08-14 — typecheck·lint·콜드 번들(1527모듈) 통과. ⏳ 실기기 10종 전환·재시작 유지 확인(사용자) |
| 2 | DB + 사이트·계정 CRUD (핵심 도메인) | ⬜ |
| 3 | 검색 · 즐겨찾기 · 사이트 아이콘 | ⬜ |
| 4 | i18n 완성 — 5개 언어 + 검사 스크립트 | ⬜ |
| 5 | common_server 연동 — 공지·점검 게이트·문의 | ⬜ |
| 6 | 광고 — dev build 전환 · 배너 · App Open · UMP | ⬜ |
| 7 | Remove Ads — RevenueCat 익명 · 구매/복원 | ⬜ |
| 8 | 출시 준비 — 아이콘/스플래시 · 처리방침 · EAS · 스토어 | ⬜ |

⚠ = 사용자 계정 작업 포함(AdMob·Play·RC 콘솔) — 해당 Phase에 명시.

---

## Phase 0 — 기반 정리 (0.5일)

템플릿 예제를 걷어내고 이후 전 Phase가 딛을 구조를 세운다.

- 템플릿 예제 제거: explore 탭·hello-wave·parallax 등 데모 화면/컴포넌트
- 폴더 구조 확립(CLAUDE.md §12): `features/` `db/` `theme/` `locales/` `lib/`
- **하단 네비 4탭 골격**: Home · +(추가 진입) · Favorites · Settings (빈 화면)
- **i18n 뼈대**: i18next + expo-localization, `locales/en`·`ko`만 우선.
  ⚠ **화면은 처음부터 `t()` 키로 작성한다** — 문장 하드코딩 후 Phase 4에서 걷어내는 재작업 금지(조각 규약)
- ESLint에 `any` 금지 강제 확인

**완료 기준**: typecheck·lint 통과 + 실기기에서 4탭 빈 골격 확인.

## Phase 1 — 테마 시스템 (1일)

모든 화면이 토큰을 참조해야 하므로 **UI 본격 작업 전에** 토큰이 서야 재작업이 없다.

- `theme/palettes.ts` — 토큰 인터페이스(13종: Background·Surface·Card·SearchBar·Primary·Secondary·
  Text·Icon·Button·Navigation·Selected·FavoriteArea·Badge) + **10종 팔레트**
  (시안 `design/theme-mockups-10.png`에서 색 추출)
- 테마 store(Zustand) + 로컬 저장(재시작 유지) + 상태바 스타일 파생
- 공통 컴포넌트 시작: `components/Screen`(세이프에어리어·배너 footer 자리) · Card · Button — 토큰만 참조
- Settings → Theme 화면: 토큰으로 그린 미니어처 미리보기 그리드(이미지 10장 금지 — THEME_SYSTEM §3)

**완료 기준**: 실기기에서 10종 전환 즉시 적용 + 재시작 후 유지, 다크 계열 3종 상태바 정상.

## Phase 2 — DB + 사이트·계정 CRUD (2일) — 핵심

- `db/` — expo-sqlite 스키마(`sites`·`accounts`, CLAUDE.md §5) + `user_version` 마이그레이션 규약,
  **`docs/DATABASE.md` 작성**(문서 먼저)
- 사이트 추가: URL만 필수, `https://` 보정, **이름 자동 제안(도메인 파싱만)**, 수정·삭제(계정 연쇄 삭제 + 확인)
- Home: 즐겨찾기 영역 + 전체 목록(계정 수 배지) + 첫 실행 빈 화면(**데이터 손실 안내** + 추가 유도)
- 사이트 상세 + **Open in Browser**(expo-linking, 실패 알림)
- 계정 CRUD: 전 필드 선택, 사이트당 N개
- **민감한 메모**: `memoSensitive` 플래그 — 목록·상세에서 `••••` + 눈 아이콘 토글

**완료 기준**: 실기기에서 사이트 등록 → 계정 2개 → 민감 메모 숨김/보기 → 브라우저 열기 → 삭제 왕복.

## Phase 3 — 검색 · 즐겨찾기 · 아이콘 (1일)

- 검색: **입구는 홈 검색바 하나.** 대상 5필드(사이트 이름·URL·계정 이름·ID·메모), 디바운스,
  민감 메모는 매치돼도 미리보기 마스킹(SITE_SYSTEM §5)
- 즐겨찾기: 토글 + 홈 상단 영역 + Favorites 탭
- 사이트 아이콘: **해당 사이트 직접 fetch**(`/favicon.ico` → HTML link 폴백) + 로컬 캐시 +
  이니셜 폴백. 아이콘 실패가 저장을 막지 않는다

**완료 기준**: 5필드 검색 매치 확인 · 오프라인 등록 시 이니셜 폴백 · 즐겨찾기 반영 즉시.

## Phase 4 — i18n 완성 (1일)

- ja · zh-Hans · zh-Hant 리소스 추가(en 기준 번역)
- 조각 `check:i18n` 스크립트 이식(키 누락·언어 간 불일치·타 언어 한글 잔존)
- dayjs locale 연동(날짜 표기)

**완료 기준**: `npm run check:i18n` 통과, 기기 언어 자동 감지 + 설정에서 수동 변경.

## Phase 5 — common_server 연동 (0.5일)

절차 정본: [`ARCHITECTURE.md`](./ARCHITECTURE.md) §5 · `common_server/docs/ONBOARDING.md`.

- 서버 쪽: `seed.ts linkmemo` 등록 → `bootstrap?app=linkmemo` **200 출력 확보**
- 앱 쪽: SDK 복사(`lib/common-server/`, SDK_VERSION 주석) → 부팅 게이트(실패해도 앱 진행,
  차단 화면엔 반드시 출구) → 공지 화면(읽음은 로컬) → 문의 화면(익명)
- 디스코드 웹훅 env `DISCORD_TICKET_WEBHOOK_URL_LINKMEMO` + 재배포(유일한 재배포 지점)

**완료 기준**: 실기기에서 공지 노출 + 문의 전송 → 관리자 콘솔·디스코드 도착.

## Phase 6 — 광고 (1일) ⚠ 사용자 작업 포함

- ⚠ **사용자**: AdMob 콘솔에서 LinkMemo 앱 생성 + 광고단위 2개(배너·App Open) 발급,
  Privacy & messaging에서 GDPR 메시지 설정
- `react-native-google-mobile-ads` **16.0.0 고정** 설치 → **Expo Go 탈출, dev build 전환**
  (`npm run android` — 이후 개발은 dev client)
- 배너: `Screen` footer(홈, 네비 위), 미수신 시 자리 미점유, 키보드 시 숨김
- App Open: 콜드 스타트 + **쿨타임 3시간**(마지막 노출 로컬 저장), 브라우저 복귀 노출 금지
- UMP: `AdsConsent` 흐름 + `delay_app_measurement_init: true`
- `adsEnabled()` 단일 게이트(dev는 테스트 단위 고정)

**완료 기준**: dev build에서 테스트 배너·App Open 노출, 3시간 캡 동작(시간 조작 테스트), 금지 순간 미노출.

## Phase 7 — Remove Ads (1일) ⚠ 사용자 작업 포함

- ⚠ **사용자**: Play 콘솔 비소모성 상품 등록(선행: 앱 최초 AAB 업로드 필요할 수 있음), RC 대시보드
  프로젝트 생성·상품 attach — `store-iap-setup` 스킬 절차대로
- `react-native-purchases` — **익명 모드**(`logIn` 호출 안 함), entitlement `remove_ads`
- Settings → Remove Ads: 구매(스토어 가격 표시)·**Restore Purchases**
- 캐시 규칙: 로컬 캐시 + 조회 실패에 캐시 유지, 환불 회수는 온라인 확인 시 갱신

**완료 기준**: 라이선스 테스터 샌드박스 구매 → 광고 0 · 재설치 후 복원 동작.

## Phase 8 — 출시 준비 ⚠ 사용자 작업 포함

- 앱 아이콘·스플래시(조각 `make-assets` 방식 참고), 스토어 그래픽
- 처리방침·약관: `privacy-terms` 스킬 — **실제 트래픽 기준**(광고 SDK·favicon 직접 fetch 반영),
  `vivace-games.com` 게시, 값은 `common/BUSINESS_INFO.md`
- Play 데이터 보안 선언(광고 SDK 수집 항목), `payment-security-compliance` 점검
- EAS 빌드(eas.json) → AAB
- ⚠ **사용자**: 출시 계정 확정 — **`volleyball/docs/GOOGLE_ACCOUNT_CASE.md` 최신 상태 먼저 확인**
  (개인 계정이면 비공개 테스트 12명×14일이 일정에 들어간다)
- 제출 전 `play-store-launch-checklist` 스킬 전체 점검

**완료 기준**: 비공개 테스트 트랙 게시 + 실기기 설치 확인.

---

## 순서에 대한 근거

- **테마(1)가 도메인(2)보다 먼저**: 화면 전부가 토큰을 참조해야 하므로, 토큰 없이 화면부터 만들면
  Phase 1에서 전 화면 재작업이 된다. i18n 뼈대를 Phase 0에 두는 것도 같은 이유.
- **광고(6)를 도메인(2~3) 뒤로**: 광고 SDK가 dev build를 강제한다 — Expo Go의 빠른 반복이 유효한
  동안(순수 JS 단계) 핵심 도메인을 끝내는 게 이득이다.
- **common_server(5)를 광고(6)보다 먼저**: 서버 등록·문의는 순수 JS라 Expo Go에서 검증 가능.
- **결제(7)가 마지막 기능**: Play 상품 등록이 AAB 업로드에 묶일 수 있어 어차피 후반이다.

## 일정 감각

Phase 0~4(코어, 순수 JS) ≈ 5.5일 · Phase 5~7(연동·수익화) ≈ 2.5일 + 사용자 콘솔 작업 · Phase 8은
심사·테스트 트랙 대기가 지배한다. 개인 계정 경로면 **12명×14일**이 크리티컬 패스.
