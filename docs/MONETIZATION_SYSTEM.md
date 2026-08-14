# MONETIZATION_SYSTEM — 광고 + Remove Ads

> 정책 요약은 [`../CLAUDE.md`](../CLAUDE.md) §7·§7.1, 여기는 상세. 2026-08-14 기획 확정 — 구현 0%.

## 구현 현황

| 영역 | 상태 | 비고 |
|---|---|---|
| ~~하단 배너 — 자리 플레이스홀더~~ | 🚫 | 실배너로 교체하며 삭제(2026-08-14) |
| 하단 배너 — 실제 AdMob | ✅ | 2026-08-14 — `components/ad-banner.tsx`(ANCHORED_ADAPTIVE). 미수신·미초기화·구매자면 자리 미점유. dev는 테스트 단위 |
| App Open 광고 + 쿨타임 3시간 | ✅ | 2026-08-14 — `features/ads/app-open.ts`. 콜드 스타트만, 쿨타임 전엔 로드 안 함, 로드 8초 타임아웃(시작을 안 붙잡음) |
| UMP 동의 폼(EEA) — 앱 코드 | ✅ | 2026-08-14 — `features/ads/ads.ts`(requestInfoUpdate→REQUIRED면 showForm→init). 실패해도 앱 진행 |
| 광고 게이트 `adsEnabled()` | ✅ | 2026-08-14 — `features/ads/store.ts` 단일 출처. Phase 7에서 removeAds 연결 |
| AdMob 앱·광고단위 발급 | ✅ | 2026-08-14 브라우저로 직접 발급(§AdMob 계정) |
| Remove Ads 구매 (RevenueCat 익명) | ❌ | 2026-08-14 확정(§4) |
| Restore Purchases | ❌ | |

---

## 1. 수익 모델

**무료 + 광고**가 기본. 무료 사용자도 **모든 기능**을 쓴다(사이트·계정·메모·민감 메모·검색·즐겨찾기·
테마 10종·브라우저 연결·로컬 저장 — 전부 무제한).

| | 무료 | Remove Ads |
|---|---|---|
| 기능 | 전부 | 전부 (차이 없음) |
| 광고 | O | X |
| 가격 | 무료 | ₩1,500 수준 · **1회 구매** |
| 구독 | 없음 | 없음 |

Remove Ads는 **기능 상품이 아니다** — 광고만 사라진다. 서비스 구조를 단순하게 유지하는 것이 목적.

---

## 2. 광고 지면

### 2.1 하단 배너

~~하단 네비게이션 위~~ → **홈 화면 최하단(세이프에어리어 위)**(2026-08-14 — 단일 화면 구조로 네비 자체가
없어졌다, CLAUDE.md §3). 기획서의 "네비를 가리지 않는다" 의도는 "시스템 제스처 바를 가리지 않는다"로 승계.

Phase 6 전까지는 같은 자리에 **점선 플레이스홀더**를 표시해 레이아웃을 미리 검증한다(2026-08-14 사용자 요청).
App Open 광고는 전면(풀스크린)이라 상주 영역이 없다 — 플레이스홀더는 배너만.

```
│  Site List            │
├────────────────────────┤
│      Banner Ad         │
├────────────────────────┤
│ Home Search + Fav Set  │
```

### 2.2 App Open 광고 (앱 첫 진입)

~~홈 진입 전면(interstitial)~~ → **App Open 포맷으로 확정**(2026-08-14).

| 항목 | 값 |
|---|---|
| 포맷 | **App Open Ad** — 앱 실행 지점 전용 전면형 포맷. 언제든 닫을 수 있다 |
| 트리거 | **콜드 스타트(앱 첫 진입)만** |
| 쿨타임 | **3시간** (2026-08-14 사용자 결정) — 마지막 노출 시각을 로컬 저장, 경과 전엔 로드조차 안 한다 |

```
Launch → last shown ≥ 3h ago? → Show App Open Ad : Continue
```

- **왜 interstitial이 아닌가**: AdMob 공식 정책(Disallowed interstitial implementations)이
  *"Do not place interstitial ads on app load"* 라고 명시한다 — 앱 시작 전면은 그대로 정책 위반이고,
  그 자리를 위해 만든 포맷이 App Open이다(2026-08-14 웹 확인).
- ⚠ **App Open은 포그라운드 복귀에도 뜰 수 있는 포맷이지만, 복귀 노출은 하지 않는다.**
  특히 "Open in Browser" 다녀온 복귀에 뜨면 이 앱의 핵심 동선(찾아서 → 연다 → 돌아온다)을 벌주는 꼴이다
  (기둥 4·6 위반). 콜드 스타트 + 3시간 쿨타임만.
- 로드한 App Open 광고의 유효기간은 4시간(AdMob) — 3시간 쿨타임과 조합 시 "미리 로드해 두고 만료" 낭비가
  없도록, **쿨타임이 지난 상태의 실행에서만 로드**한다.

### 2.3 전면형 광고를 띄우지 않는 순간 (기획 확정 — 기둥 6)

- 사이트 추가 중 · 계정 추가 중 · 메모 작성 중
- **민감한 메모 확인 중**
- **브라우저 실행 직전**
- 삭제 확인 중

AdMob 정책 근거(조각 §7에서 확인): *"Placing interstitial ads so that they suddenly appear when a user
is focused on a task at hand (e.g. filling out a form, reading content) may lead to accidental clicks."*

---

## 3. 구현 규칙 (조각 승계)

- 광고 게이트는 `adsEnabled()` 류 **한 곳** — 구매 여부·개발 분기·초기화 실패를 전부 여기서 판정.
- SDK 초기화·로드 실패가 앱 사용을 막지 않는다. 배너 미수신 시 자리를 차지하지 않는다(빈 띠 금지).
- App Open 광고는 쿨타임을 먼저 판정하고, 통과한 실행에서만 로드한다(§2.2) —
  캡에 걸려 있으면 아예 로드하지 않는다(트래픽 낭비).
- **EEA·영국·스위스 포함 출시 — UMP 동의 폼 구현**(2026-08-14 확정): `AdsConsent.requestInfoUpdate()` →
  필요 시 `showForm()`을 **첫 광고 요청 전에**. `app.json`에 `delay_app_measurement_init: true`
  (동의 전 측정 전송 방지). AdMob 콘솔 Privacy & messaging에서 GDPR 메시지 설정이 선행 작업.
- **개발 빌드는 Google 테스트 단위만.** 실단위 노출·클릭은 무효 트래픽 → 계정 정지 위험. `__DEV__` 분기 유지.
- ⚠ `react-native-google-mobile-ads`는 **16.0.0 고정**(조각 실증: 16.4.0의 play-services-ads 25.4.0이
  Kotlin 2.3으로 컴파일 → Expo SDK 54의 2.1.20과 충돌). 올릴 때 pinned ads sdk의 Kotlin 버전 먼저 확인.
- 네이티브 모듈 → **Expo Go 불가, dev build로 개발.** `app.json`의 AdMob 앱 ID는 네이티브 매니페스트에
  박힌다 — 바꾸면 prebuild + 재빌드.
- 스토어 미출시 상태의 AdMob 앱은 "게재 제한"이 정상이다. 출시 후 스토어 연결 → 승인까지 노출 0 —
  코드 문제로 오해하지 않는다.

---

## 3.1 AdMob 계정 (2026-08-14 발급 — 브라우저로 직접)

| 것 | 값 |
|---|---|
| AdMob 앱 (Android) | `ca-app-pub-2731473780180274~5530245962` — `app.json` config plugin에 들어간다(네이티브 매니페스트에 박힘 — 변경 시 prebuild 재빌드) |
| 배너 `홈 하단 배너` | `ca-app-pub-2731473780180274/8027778765` |
| 앱 오프닝 `앱 시작 오프닝` | `ca-app-pub-2731473780180274/9500642536` |
| GDPR 메시지 | **"LinkMemo GDPR" 게시됨**(2026-08-14) — 동의/옵션 관리/**동의하지 않음(전 EEA 국가)** 3버튼, 기본 언어 영어 |

- ⚠ **처리방침 URL을 `https://vivace-games.com/linkmemo/privacy`로 지정했다** — 아직 없는 주소다.
  **Phase 8에서 반드시 이 정확한 경로에 게시**하거나, 다른 주소로 게시하면 GDPR 메시지의 URL을 갱신할 것.
- 개발 빌드는 여전히 **Google 테스트 단위**를 쓴다(`__DEV__` 분기) — 실단위로 개발하면 무효 트래픽으로 계정 정지 위험.
- 이 앱은 스토어 미출시라 "검토 필요 · 게재 제한" 상태가 정상. Play 출시 후 스토어 연결 → 승인까지 실노출 0.

## 4. Remove Ads 상품

| 항목 | 값 |
|---|---|
| 유형 | **비소모성(non-consumable) 일회성** 인앱결제. 구독 아님 |
| 가격 | ₩1,500 수준. **국가별 표시는 스토어 가격 정보 기준** — 앱 UI에 특정 통화 고정 금지 |
| 로그인 | 불요 — LinkMemo 회원 시스템이 없다 |
| 흐름 | `Settings → Remove Ads → Store Purchase → Purchase Complete → Ads Removed` |
| 복원 | `Settings → Remove Ads → Restore Purchases → Store Purchase History → Restore` |

### 결제 경로 — ✅ RevenueCat 익명 모드로 확정 (2026-08-14 판단)

~~스토어 SDK 직결(react-native-iap) vs RC 경유~~ → **RC 익명**(`react-native-purchases`).

근거:

- **비용 0**: RC 무료 구간이 MTR $2.5k/월 — ₩1,500 일회성 기준 **월 약 2,000건 판매까지 무료**(2026-08-14 웹 확인).
  그 볼륨이면 기쁜 비명이다.
- **영수증 검증·플랫폼 분기 직접 구현 회피** + 형제 앱(배구·조각)과 운영 도구 통일 —
  `store-iap-setup` 스킬의 절차·함정 도감이 그대로 적용된다.
- 비회원이므로 **RC 익명 ID(`$RCAnonymousID`) 그대로** 쓴다 — `Purchases.logIn()`을 부르지 않는다
  (조각의 "logIn 필수" 규칙은 **로그인 앱** 규칙이다 — LinkMemo는 매칭할 subject가 없다).
- **서버 개입 없음**: common_server 웹훅·엔타이틀먼트 미러를 쓰지 않는다. 진실은 스토어,
  복원은 `restorePurchases()`(재설치·기기 변경 시 스토어 구매 이력 기반).

구현 규칙:

- entitlement 키 `remove_ads` 하나. **구매 상태는 로컬 캐시 + 실행 시 재확인** —
  오프라인·조회 실패에 캐시를 지우지 않는다(조각 규약 승계). 비소모성이라 만료 시각은 없다.
- **환불 시 회수**: RC entitlement가 비활성으로 돌아오면 캐시를 갱신한다(다음 온라인 확인 시점).
- 한국 규제(청약철회 고지 등)는 `payment-security-compliance` 스킬로 착수 전 점검.

---

## 5. 스토어 포지셔닝 (기획서 §38)

- Short: **Save links. Keep what matters.**
- 상세: *LinkMemo is a simple way to organize your favorite websites, accounts, and notes in one place.*
- 핵심 메시지: No account required · No cloud sync · Store everything locally ·
  Multiple accounts per website · Private notes · Quick browser access · 10 beautiful themes.
- ⚠ 스토어 데이터 보안 선언은 **실제 트래픽 기준**으로(광고 SDK 수집 항목 포함 — CLAUDE.md §6).
  출시 직전 `play-store-launch-checklist` 스킬로 점검.
