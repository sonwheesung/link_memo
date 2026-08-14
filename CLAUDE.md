# LinkMemo — 설계 정본

> 이 문서는 Claude Code가 개발을 진행하기 위한 단일 기준 문서다.
> 모호하면 이 문서의 "핵심 기둥"을 우선한다. **새 결정은 코드보다 먼저 이 문서에 반영한 뒤** 진행한다.
> 서버 경계는 [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md), 색인은 [`docs/README.md`](./docs/README.md),
> 문서 규율은 [`docs/DOC_DISCIPLINE.md`](./docs/DOC_DISCIPLINE.md).
> 사업자·연락처·스토어 정보의 단일 출처는 `C:\project\common\BUSINESS_INFO.md` (커밋 금지 파일).

작성일: 2026-08-14 · 원본 기획서를 프로젝트 문서 체계(조각 `C:\project\diary` 승계)로 옮긴 것.

---

## 1. 한 줄 요약

> **Save links. Keep what matters.**

자주 쓰는 웹사이트의 링크를 저장하고, 사이트별로 **여러 계정(ID)과 메모**를 함께 관리하는
**개인용 로컬 링크 관리 앱**. 저장한 사이트는 탭 한 번으로 OS 기본 브라우저에서 연다.

북마크 앱과 비밀번호 관리 앱의 **중간 영역**이 목표다 — 단, 비밀번호 관리자가 **아니다**(§8).
**출시 초기부터 글로벌**(기본 언어 English, §9.1).

### 제품 포지션

> **No account. No cloud. Just your links.**
> Save → Organize → Remember → Open

---

## 2. 핵심 기둥 (설계 충돌 시 판단 기준)

1. **Simple — 회원가입 없이 바로 사용.** 설치 → 실행 → 링크 추가까지 아무 가입 절차가 없다.
   자체 회원 시스템·소셜 로그인·사용자 계정 서버를 **만들지 않는다**(§4).
2. **Private — 사용자 데이터는 서버에 저장하지 않는다.** 사이트·계정·메모 전부 기기 로컬.
   클라우드 동기화 없음. 서버가 죽어도 앱은 완전히 동작해야 한다(§6).
3. **Organized — 사이트별로 계정과 메모를 정리.** 하나의 사이트에 여러 계정(Personal·Work·Test…)을
   연결한다. 모든 계정 필드는 선택사항 — **URL만 필수**다(§5).
4. **Fast — 저장된 사이트를 한 번에 브라우저로.** LinkMemo의 역할은 "사이트를 빠르게 찾아서 여는 것"까지다.
   자동 로그인·자동 입력·앱 내 WebView는 하지 않는다(§8).
5. **Personal — 테마 10종으로 분위기를 바꾼다.** 전부 무료. 유료 테마 없음(§9).
6. **광고가 주요 작업을 막지 않는다.** 사이트/계정 추가 중·메모 작성 중·민감한 메모 확인 중·
   브라우저 실행 직전·삭제 확인 중에는 전면 광고를 띄우지 않는다(§7).

---

## 3. MVP 범위 (2026-08-14 기획 확정)

| # | 기능 | 저장/의존 | 비고 |
|---|---|---|---|
| 1 | Home | 로컬 | 즐겨찾기 영역 + 전체 사이트 목록(+계정 수 배지). ~~최근 사이트 고려~~ → **MVP 제외, P1로**(2026-08-14 판단) |
| 2 | 사이트 추가/수정/삭제 | 로컬 | **URL만 필수.** 이름 미입력 시 **도메인 파싱만으로** 자동 제안(오프라인 동작, 2026-08-14 결정) |
| 3 | 사이트 아이콘 | 로컬 | **해당 사이트에서 직접 fetch + 로컬 캐시, 실패 시 이니셜 기본 아이콘**(2026-08-14 결정 — 외부 아이콘 서비스 🚫, §14) |
| 4 | 사이트 상세 | 로컬 | 아이콘 · 이름 · URL · **Open in Browser** · 계정 카드 목록 |
| 5 | 브라우저 열기 | OS | 외부 기본 브라우저로. WebView·세션 관리 없음 |
| 6 | 계정 CRUD | 로컬 | 사이트당 N개. 이름·ID·메모·민감 여부 **전부 선택** |
| 7 | 민감한 메모 | 로컬 | MVP는 **메모 전체 숨김**(`••••` + 눈 아이콘). 부분 숨김은 이후(§8.1) |
| 8 | 검색 | 로컬 | 사이트 이름 · URL · 계정 이름 · ID · 메모 전체 대상. 입구는 ~~홈 검색바~~ → **홈 우상단 검색 버튼 → 검색 화면**(2026-08-14 사용자 결정) |
| 9 | 즐겨찾기 | 로컬 | 사이트 단위 등록/해제. 홈 상단 + 전용 탭 |
| 10 | 테마 | 로컬 | 10종 · 미리보기 · 선택 저장([`docs/THEME_SYSTEM.md`](./docs/THEME_SYSTEM.md)) |
| 11 | 다국어 | 로컬 | en(기본)·ko·ja·zh-Hans·zh-Hant([`docs/I18N_SYSTEM.md`](./docs/I18N_SYSTEM.md)) |
| 12 | 광고 | AdMob | 하단 배너 + **앱 시작 App Open 광고, 쿨타임 3시간**(2026-08-14 결정). §7 |
| 13 | 광고 제거 | 스토어 IAP | **일회성 구매**(₩1,500 수준·스토어 현지 가격) + Restore Purchases. **RevenueCat 익명 경유**(2026-08-14 판단). §7.1 |
| 14 | 공지·점검·강제업데이트 | common_server | bootstrap 1회 호출. 실패해도 앱을 막지 않는다 |
| 15 | 문의하기 | common_server | **익명 단방향**(v1 경로). 로그인 없으므로 답변 확인 경로 없음 |

하단 네비게이션: ~~`Home · Search · + · Favorites · Settings`~~ → ~~4탭(+ 포함)~~ →
**`Home · Favorites · Settings` 3탭**(2026-08-14 사용자 결정 — **+도 네비에서 제거.**
추가·검색은 **홈 우상단 헤더 버튼 2개**로: [🔍 검색][＋ 추가]. Search 탭 제거는 조각의 강등 실증 승계).
데이터 손실 안내(§6)를 앱 내에 명시한다.

### MVP에서 제외 (기획서 §41)

회원가입 · 로그인 · 클라우드 동기화 · LinkMemo 전용 서버 DB · 웹 버전 · **비밀번호 전용 필드** ·
자동 로그인/자동 입력 · 비밀번호 생성기 · 팀 공유/협업/SNS · 구독제 · Pro 등급 · 유료 테마 ·
클라우드 백업 · **로컬 백업 파일**(Priority 1으로 이후) · 앱 잠금/생체 인증(Priority 1) ·
카테고리/태그/그룹 · 위젯 · 커스텀 테마.

### 출시 후 확장 우선순위 (기획서 §42)

- **P1**: 앱 잠금 · 생체 인증 · 로컬 백업/복원 · 최근 방문 · 카테고리 · 정렬 옵션 · 아이콘 개선
- **P2**: 부분 텍스트 민감 처리 · 위젯 · 커스텀 아이콘 · 커스텀 테마 · 태그 · 사이트 그룹
- **P3**: 암호화 백업 · 기기 간 직접 이동 · 선택적 클라우드 동기화 · 웹 버전

---

## 4. 회원·로그인 정책 — **없음** (기획 확정)

이메일 가입·비밀번호 로그인·소셜 로그인·사용자 계정 서버·클라우드 계정을 **전부 제공하지 않는다.**

```
Install → Launch → Start using → Add links
```

- 광고 제거 구매도 로그인 없이 스토어 인앱결제로만 처리한다(§7.1).
- 문의하기는 common_server **v1 익명 경로**를 쓴다 — 조각(`jogak`)과 달리 subjects/토큰(Phase 7)을
  **쓰지 않는다.** 익명이므로 문의 답변 확인 화면도 없다(reply는 운영자 내부 메모 성격).
- ⚠ 이 결정 덕에 Play의 "계정 삭제 URL" 요건이 **해당 없음**이다 — 계정을 만들지 않으니까.
  로그인을 나중에 붙이는 순간 탈퇴 경로·웹 삭제 URL이 세트로 필요해진다(조각 §4 참고).

---

## 5. 도메인 규칙 — 사이트·계정 (핵심)

상세는 [`docs/SITE_SYSTEM.md`](./docs/SITE_SYSTEM.md). 여기엔 어기면 안 되는 것만.

| 규칙 | 내용 |
|---|---|
| **URL만 필수** | 사이트 이름·계정의 모든 필드(이름·ID·메모·민감 여부)는 선택. 입력 마찰 최소화(기둥 1·3) |
| 이름 자동 제안 | 미입력 시 URL에서 생성(`https://notion.so` → Notion). 사용자가 수정 가능 |
| 1 사이트 : N 계정 | Personal / Work / Test / Client … |
| 사이트만 저장 가능 | 계정 0개인 사이트도 정상 상태다 |

### 데이터 구조 (기획 확정)

```
Site                          Account
├── id                        ├── id
├── name                      ├── siteId          (Site 1:N)
├── url                       ├── name
├── favicon                   ├── username
├── favorite                  ├── memo            (텍스트 — 계정당 하나)
├── createdAt                 ├── memoSensitive   (boolean 숨김 플래그)
└── updatedAt                 ├── createdAt
                              └── updatedAt
```

**계정당 메모 1개 + 숨김 플래그**로 확정(2026-08-14 — 기획서 §34의 `sensitiveMemo`가 별도 텍스트 필드로
읽힐 여지가 있었으나 §11 정의("메모 숨김 여부")를 따름. 메모 2칸이면 "어느 칸에 쓰지"를 매번 고르게 되고,
부분 숨김(P2)으로의 확장도 플래그 쪽이 자연스럽다).

---

## 6. 데이터 저장 정책 (기획 확정)

**사용자 데이터는 기기에만 저장한다.** 서버에는 사이트·계정·메모·사용자 계정 어느 것도 저장하지 않고,
클라우드 동기화도 없다. (이득: 서버 비용 최소 · 회원 시스템 불필요 · 개인정보 관리 범위 최소 ·
빠른 동작 · 사용자가 데이터를 직접 관리.)

- **데이터 손실 안내를 앱 내에 명시한다**:
  > *Your data is stored only on this device. If you delete the app or change devices, your data may be lost.*
- **백업은 MVP에서 제외.** 이후 필요성이 확인되면 **암호화된 로컬 백업 파일**(Export/Import)로 간다 —
  서버 업로드 방식이 아니라 사용자 기기에서 파일을 직접 관리하는 방식. 서버 백업은 P3에서도 "암호화 백업"으로만 고려.
- 광고 SDK 등 서드파티가 수집하는 정보는 별도로 확인해 개인정보처리방침에 정확히 반영한다(§15 선행 의존).

### ⚠ 정직한 표현 규칙 (조각 §5.1 승계)

- "**우리 서버는 저장하지 않습니다**"(O) — 이것이 정확한 진술이다.
- "**아무 데이터도 나가지 않습니다**"(X) — 광고 SDK·(쓴다면) 외부 favicon 서비스가 있는 한 거짓이 될 수 있다.
  스토어 데이터 보안 선언과 처리방침은 **실제 트래픽 기준**으로 작성한다.

---

## 7. 광고 정책 (기획 확정)

**무료 + 광고**가 기본 수익 구조. 모든 핵심 기능은 무료(기능 제한 없음).
상세는 [`docs/MONETIZATION_SYSTEM.md`](./docs/MONETIZATION_SYSTEM.md).

| 지면 | 어디에 | 언제 |
|---|---|---|
| **하단 배너** | 메인 화면, 하단 네비게이션 **위** | 상시(네비를 가리지 않는다) |
| **App Open 광고** | **앱 첫 진입(콜드 스타트)** | **쿨타임 3시간**(2026-08-14 사용자 결정) |

~~홈 진입 전면(interstitial)~~ → **App Open 포맷으로 정정**(2026-08-14): 앱 시작 시 interstitial은
AdMob **Disallowed interstitial implementations** 위반이고("Do not place interstitial ads on app load"),
앱 실행 지점 전용 포맷이 App Open이다. 사용자 의도(앱 첫 진입 시 전면 광고)는 그대로 — 포맷만 정책에 맞춘 것.
⚠ **"Open in Browser" 다녀온 복귀에는 띄우지 않는다** — App Open은 포그라운드 복귀에도 뜰 수 있는 포맷이지만,
브라우저 열기는 이 앱의 핵심 동선이라 복귀 노출은 기둥 4·6을 정면으로 깬다. 콜드 스타트 + 3시간 쿨타임만.

### 전면 광고를 띄우지 않는 순간 (기둥 6 — 기획 확정)

사이트 추가 중 · 계정 추가 중 · 메모 작성 중 · **민감한 메모 확인 중** · **브라우저 실행 직전** · 삭제 확인 중.

### 지켜야 할 것 (조각 §7 승계)

- 광고 SDK 초기화·로드 실패가 앱 사용을 막지 않는다.
- 구매자(광고 제거)는 노출 0회 — 게이트는 `adsEnabled()` 류 **한 곳**을 거친다.
- 개발 빌드는 Google **테스트 광고 단위**만 쓴다(실단위로 개발하면 무효 트래픽으로 계정 정지 위험).
- 배너를 못 받으면 자리를 차지하지 않는다(빈 회색 띠 금지).
- 작업 집중 순간의 전면 노출은 AdMob 정책 위반 소지("filling out a form" 조항) — 위 금지 목록이 그 방어다.

## 7.1 광고 제거 BM (기획 확정)

| 항목 | 값 |
|---|---|
| 상품 | **Remove Ads** — 비소모성 **일회성 구매** 단 하나 |
| 가격 | **₩1,500 수준.** 국가별 표시는 스토어 가격 정보 기준(앱 UI에 특정 통화 고정 금지) |
| 제공 | 광고 없음. **그 외 차이 없음** — 무료 = 모든 기능 + 광고, 구매 = 모든 기능 + 광고 없음 |
| 구독 / Pro 등급 / 기능 해제 | 전부 **없음** |
| 복원 | **Restore Purchases** 필수(재설치 대비). 스토어 구매 이력 기반, 서버 로그인 불필요 |
| 로그인 | **불요.** Apple/Google 인앱결제 시스템만 사용 |

구매 흐름: `Settings → Remove Ads → Store Purchase → Ads Removed`.
결제 경로는 **RevenueCat 익명 모드로 확정**(2026-08-14 판단, §14) — 서버·common_server 개입 없음.

---

## 8. 비밀번호 필드 제외 · 민감한 메모 (기획 확정)

LinkMemo는 **Password 전용 필드와 비밀번호 관리자 기능을 제공하지 않는다**:
자동 로그인 · 자동 비밀번호 입력 · 자동 완성 · 쿠키 관리 · 비밀번호 생성기 전부 없음.
비밀번호를 적고 싶으면 메모를 쓰면 된다 — 전문 비밀번호 관리 앱으로 인식되는 것을 피하고 범위를 단순하게 유지한다.

### 8.1 민감한 메모 (Sensitive Memo)

- 계정 메모에 **숨김 플래그** 하나. 켜면 목록·상세에서 `🔒 ••••••••`로 가려지고 눈 아이콘으로 확인.
- **MVP는 메모 전체 숨김만.** 특정 텍스트 부분 숨김은 P2.
- **민감한 메모 확인 중에는 광고를 띄우지 않는다**(§7).

### ⚠ 숨김은 암호화가 아니다 (조각 §7.1 "잠금은 암호화가 아니다" 승계)

Sensitive Memo는 **어깨너머 훔쳐보기(shoulder surfing)를 막는 UI 게이트**다. 로컬 DB가 평문이면
루팅 기기·백업 추출로 읽을 수 있다. 사용자에게 "암호화됩니다"라고 **표기하지 않는다** — 숨김은 숨김이라고만 쓴다.
로컬 저장 암호화 전략(SecureStore 키 + 필드 암호화 등)은 개발 단계에서 설계한다(§14 미결정).
앱 잠금(PIN/생체)은 P1 — 민감 메모 사용자가 많으면 우선순위를 올린다.

---

## 9. 테마 (기획 확정)

**10개 테마 기본 제공, 전부 무료.** 주요 차별화 요소다. 상세는 [`docs/THEME_SYSTEM.md`](./docs/THEME_SYSTEM.md).

Minimal Light · Dark Modern · Nature Green · Sky Blue · Warm Beige ·
Neon Cyber · Carbon Gray · Pastel Lavender · Yellow Point · Ocean Deep

- 테마는 배경색만이 아니라 **디자인 세트 전체**다: Background · Surface · Card · Search Bar ·
  Primary/Secondary · Text · Icon · Button · Navigation · Selected State · Favorite Area · Badge.
- 선택 UX: Settings → Theme, 이름 + **실제 UI 미리보기** 그리드.
- 선택은 로컬 저장. 조각의 `theme/palettes.ts` 방식(팔레트 추가 = 스킨 추가)을 승계한다.

## 9.1 다국어 (기획 확정 — 글로벌 우선)

- **기본 언어 English.** Phase 1: en · ko · ja · zh-Hans · zh-Hant.
  Phase 2는 유입 국가 데이터로 결정(es·pt·de·fr·it·id·th·vi 후보).
- UI 코드에 문장을 직접 쓰지 않는다 — 처음부터 번역 리소스(`common.*` `site.*` `account.*` `settings.*` 키)로.
- 상세 규약은 [`docs/I18N_SYSTEM.md`](./docs/I18N_SYSTEM.md). 조각의 `check:i18n`류 키 검사 스크립트를 승계한다.
- 배포 지역: **EEA·영국·스위스 포함 — UMP 동의 폼을 구현한다**(2026-08-14 판단, §14 #4).
  조각은 제외를 택했지만 LinkMemo는 "글로벌 출시"가 기획의 전제다. `react-native-google-mobile-ads`에
  UMP가 내장돼 있고(`AdsConsent` 헬퍼), `app.json`에 `delay_app_measurement_init: true`를 함께 켠다
  (동의 전 측정 데이터 전송 방지).

---

## 10. 서버 경계 (핵심 — 어기면 되돌리기 비싸다)

| | common_server | LinkMemo 전용 서버 |
|---|---|---|
| 위치 | `C:\project\common_server` (배포됨: `https://common-server.vercel.app`) | **없음 — 만들지 않는다** |
| 담당 | 공지 · 점검/강제업데이트 게이트(bootstrap) · 익명 문의 | — |
| 사용자 데이터 | **가지 않는다** (기둥 2) | — |

- 사이트·계정·메모는 어떤 서버에도 보내지 않는다. common_server로 가는 것은
  **bootstrap 조회와 문의 본문(platform·appVersion 포함)뿐**이다.
- 신원(subjects·토큰) · 엔타이틀먼트 서버 판정은 쓰지 않는다 — 로그인이 없다(§4).
- 연동 계약·확인 명령·선행 작업은 [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)와
  `common_server/docs/ONBOARDING.md`("새 앱 붙이기")를 따른다.
- `app_code`는 **`linkmemo` 확정**(2026-08-14 — 규격 `[a-z0-9_]{2,64}` 통과. 등록 후 변경 사실상 불가).

### 별도 서버 vs common_server — **common_server 그대로, 튜닝조차 불필요** (2026-08-14 판단)

사용자 질문("따로 서버를 파는 게 좋은지, common_server를 튜닝하는 게 좋은지")에 대한 결론:

- LinkMemo가 필요한 것은 **v1 기능(bootstrap + 익명 문의)뿐**이고, 이건 이미 배포·검증 완료다
  (프로덕션 가드 공개 10/10). common_server는 애초에 **1배포 N앱**으로 설계됐다 —
  앱 추가 = DB `apps`에 seed 1행. **코드 수정·재배포 없이 붙는다**(유일한 예외: 디스코드 알림 env).
- 별도 서버를 파면: Supabase 무료 티어 한도(활성 2프로젝트)를 깨고(PLAN §11이 "이후 앱은 반드시
  이 하나에 태워야 한다"고 못 박은 이유), Vercel 배포·크론·관리 콘솔·가드가 전부 이중이 된다.
  얻는 것은 없다 — LinkMemo는 사용자 데이터를 서버에 두지 않아 격리할 것 자체가 없다.
- 조각이 전용 서버를 판 기준(service_role 폭발 반경·E2EE 저장·AI 프록시)에 해당하는 기능이
  LinkMemo에는 하나도 없다. P3에서 암호화 백업이 실제로 오면 그때 같은 기준으로 재검토한다.

---

## 11. 기술 스택 (2026-08-14 — 조각 승계 제안)

기준 프로젝트는 `C:\project\diary`(조각) — **버전 조합·구조·문서 방식·커밋 규칙을 승계**한다.
(조각은 `C:\project\volleyball`을 승계했다. 같은 계보.)

| 영역 | 선택 | 상태 |
|---|---|---|
| 앱 | Expo **SDK 54**(~54.0.35) · RN 0.81.5 · React 19.1.0 | ✅ 설치(2026-08-14 스캐폴드) |
| 언어 | TypeScript ~5.9 (`strict` · `any` 금지) | ✅ typecheck 통과 |
| 네비게이션 | expo-router ~6.0.24 | ✅ 설치 |
| 상태 | Zustand (+ AsyncStorage persist) | ✅ 설치(2026-08-14, 테마 store가 첫 사용처) |
| **로컬 DB** | **expo-sqlite** — 검색(이름·URL·ID·메모 전체 대상)에 쿼리가 필요하다 | ❌ |
| 보안 저장 | expo-secure-store — 암호화 전략 확정 시(§14) | ❌ |
| 광고 | react-native-google-mobile-ads (AdMob) — ⚠ **16.0.0 고정** 승계(16.4.0은 Kotlin 2.3 충돌, 조각 §7) | ❌ |
| 개발 실행 | **dev build** (`npx expo run:android`) — 광고 SDK가 네이티브 모듈이라 **Expo Go 불가**(조각 실증) | ❌ |
| 결제 | react-native-purchases (**RevenueCat 익명 모드**) — 비소모성 1상품(2026-08-14 판단, §14 #2) | ❌ |
| 브라우저 열기 | expo-linking (`Linking.openURL`) — 외부 기본 브라우저 | ❌ |
| 다국어 | i18next · react-i18next · expo-localization | ✅ 뼈대(en·ko, 2026-08-14) — ja·zh 2종은 Phase 4 |
| 날짜 | dayjs | ❌ |
| 백엔드 | **없음.** 공지·문의만 common_server SDK 복사(`lib/common-server/`) | ❌ |
| 배포 | Expo EAS | ❌ |

- `android/`·`ios/`는 CNG 산출물 — 커밋하지 않는다.
- 커밋 메시지: `YYMMDD :: [태그] 한국어 요약` (조각·배구 규칙 승계).

---

## 12. 프로젝트 구조 (예정 — 조각 승계)

```
link_memo/
├── app/          # expo-router 라우트
├── features/     # site / account / search / favorites / ads / purchase / support
├── components/   # 공통 UI (Screen · Button · Card …)
├── db/           # expo-sqlite 스키마·마이그레이션 (user_version 기반)
├── theme/        # palettes.ts — 테마 10종
├── locales/      # en · ko · ja · zh-Hans · zh-Hant
├── lib/          # common-server SDK 복사본 등
└── docs/         # 이 문서 체계
```

의존 방향: `app/` → `features/` → `db/`·`lib/`·`theme/`. 역방향 import 금지. `any` 금지, `strict` 유지.

---

## 13. 표준 작업 순서 (조각 §11 승계)

① 플랜 → ② **문서(코드보다 먼저)** → ③ 개발 → ④ 검증(typecheck · lint · i18n 키 검사) → ⑤ 커밋(문서 포함).

---

## 14. 결정 로그 · 미결정

### 확정 (2026-08-14 기획서)

| 결정 | 내용 |
|---|---|
| 회원 시스템 없음 | 가입·로그인·계정 서버 전부 제외. 구매도 스토어만 |
| 로컬 온리 | 서버에 사용자 데이터 저장 없음 · 클라우드 동기화 없음 · MVP 백업 없음 |
| 비밀번호 필드 없음 | 비밀번호 관리자로 포지셔닝하지 않는다 |
| 민감 메모 = 전체 숨김 | 부분 숨김은 P2 |
| BM = 무료+광고 / Remove Ads 일회성 | 구독·Pro 없음. 테마 10종 무료 |
| 글로벌 우선 | 기본 영어 + 4개 언어. 스토어 문구는 기획서 §38 |
| 문서·스택 계보 | 조각(diary) 승계 (2026-08-14, 이 문서 작성 시) |

### 확정 (2026-08-14 — 기획 검토 질의응답으로 매듭)

| # | 결정 | 내용·근거 |
|---|---|---|
| 1 | **공지·문의는 common_server** (사용자 확인) | 별도 서버 🚫, 튜닝도 불필요 — §10 판단 참조. 등록(seed) + 디스코드 env만 |
| 2 | **앱 첫 진입 광고 = App Open 포맷 · 쿨타임 3시간** (사용자 결정 + 포맷 정정) | 앱 시작 interstitial은 AdMob 정책 위반 확인(공식 Disallowed 목록). App Open이 그 자리 전용 포맷 — §7 |
| 3 | **계정당 메모 1개 + `memoSensitive` 플래그** (위임받아 판단) | §5 데이터 구조 참조 |
| 4 | **검색·추가 = 홈 우상단 헤더 버튼 2개, 네비 3탭** (사용자 결정 · 같은 날 재정정) | ~~홈 검색바 + 4탭(+ 포함)~~ → +도 네비에서 제거, [🔍][＋]를 홈 헤더 우측에. 네비 = Home·Favorites·Settings. 검색 버튼은 검색 화면으로 이동 |
| 5-1 | **favicon = 해당 사이트에서 직접 fetch + 로컬 캐시, 실패 시 이니셜** | 외부 서비스(Google S2 등)는 저장 도메인 목록을 제3자에 노출 — 기둥 2 위반이라 🚫. 직접 fetch는 사용자가 어차피 방문하는 사이트라 새 노출이 없다 |
| 5-2 | **결제 = RevenueCat 익명 모드** | 무료 구간(MTR $2.5k/월)이 ₩1,500 일회성 기준 월 ~2,000건까지 — 사실상 영구 무료. 영수증 검증 직접 구현 회피 + 형제 앱(배구·조각) 운영 노하우·`store-iap-setup` 스킬 재사용. 서버 웹훅·미러 없음: 진실은 스토어, 복원은 `restorePurchases()` |
| 5-3 | **로컬 암호화는 MVP 제외** — 평문 SQLite + UI 숨김 | 계정도 백업도 없는 앱에서 암호키를 만들면 "키 유실 = 데이터 유실" 경로가 새로 생긴다. MVP 위협 모델(어깨너머)은 UI 게이트로 충분. §8의 "숨김 ≠ 암호화" 정직 표기가 전제. P1 앱 잠금과 함께 재검토 |
| 5-4 | **EEA·영국·스위스 포함 + UMP 동의 폼 구현** | 글로벌이 기획 전제. UMP는 라이브러리 내장(`AdsConsent`) + `delay_app_measurement_init` — §9.1 |
| 5-5 | **`app_code = linkmemo` 확정** | 규격 통과. 등록 후 변경 불가 |
| 5-6 | **최근 사이트 MVP 제외** → P1 | 기획서에도 "고려" 수준이었다 |
| 5-7 | **이름 자동 제안 = 도메인 파싱만** | 오프라인 동작 보장. `<title>` fetch 안 함(프라이버시·복잡도) |

### ⚠ 미결정 (착수 전에 매듭)

~~1–7 전부 해소(2026-08-14)~~ — 현재 미결정 없음. 새 항목이 생기면 여기에 적는다.

---

## 15. 선행 의존 (LinkMemo 밖 작업)

| 작업 | 어디서 | 비고 |
|---|---|---|
| `apps`에 `linkmemo` 등록 | common_server (`tools/seed.ts`) | 확인: `bootstrap?app=linkmemo` **200** |
| 디스코드 문의 웹훅 env | common_server Vercel | `DISCORD_TICKET_WEBHOOK_URL_LINKMEMO` — **유일하게 재배포 필요한 지점** |
| SDK 복사 | `common_server/client/` → `lib/common-server/` | 복사본 상단에 SDK_VERSION 주석 |
| AdMob 앱·광고단위 발급 | AdMob 콘솔 | **배너 1 + App Open 1.** 스토어 미출시 상태에선 "게재 제한"이 정상(조각 §7). AdMob 콘솔에서 GDPR 메시지(UMP)도 설정 |
| 스토어 상품 등록 (Remove Ads) | Play/App Store 콘솔 | 비소모성 1상품 |
| RevenueCat 프로젝트 생성 | RC 대시보드 | 익명 모드 — 웹훅·서버 연동 없음. `store-iap-setup` 스킬 참조 |
| 처리방침·약관 게시 URL | `vivace-games.com` 계열 | 값은 `common/BUSINESS_INFO.md`. `privacy-terms` 스킬 활용 가능 |

---

## 16. 현재 상태 (2026-08-14)

- 문서 체계 수립 + §14 미결정 전부 해소(질의응답) + 테마 시안 확보(`docs/design/theme-mockups-10.png`).
- ~~코드 0줄~~ → **Expo SDK 54 스캐폴드 완료**(2026-08-14): default 템플릿(expo-router·TS),
  typecheck·lint 통과, **Metro 포트 8086 고정**(scripts 반영) · :8086 기동 실확인.
- 서버 등록 0 · 스토어 등록 0 (§15 선행 의존 미착수).
- 다음 단계: 템플릿 예제 화면 정리 → 테마 토큰(`theme/palettes.ts`) + DB 스키마 → Home/사이트 CRUD(§3 #1–5).
