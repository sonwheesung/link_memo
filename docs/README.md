# LinkMemo — 문서 색인

> 이 파일이 **문서 색인이자 구현 현황 정본**이다. 새 `*_SYSTEM.md`를 추가하면 반드시 아래 목록과
> 구현 현황표에 함께 등록한다([`DOC_DISCIPLINE.md`](./DOC_DISCIPLINE.md) 부록 체크리스트).
> 설계 원칙·기둥·MVP 범위·결정 로그는 루트 [`CLAUDE.md`](../CLAUDE.md).

---

## 1. 문서 목록

| 문서 | 범위 | 상태 |
|---|---|---|
| [`../CLAUDE.md`](../CLAUDE.md) | 설계 정본 — 기둥·MVP 범위·회원 없음/로컬 온리 정책·BM·스택·결정 로그 | ✅ |
| [`PLAN.md`](./PLAN.md) | MVP 구현 플랜 — Phase 0~8 착수 순서·완료 기준·진행 현황 | ✅ |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | 서버 경계 — common_server 연동(공지·익명 문의)·전용 서버 없음·선행 작업 | ✅ |
| [`DOC_DISCIPLINE.md`](./DOC_DISCIPLINE.md) | 문서 작업 규율 (조각 승계) | ✅ |
| [`SITE_SYSTEM.md`](./SITE_SYSTEM.md) | 도메인 — 사이트·계정·민감 메모·검색·즐겨찾기·브라우저 열기·화면 구조 | ✅ |
| [`MONETIZATION_SYSTEM.md`](./MONETIZATION_SYSTEM.md) | 광고(배너·전면·쿨타임·금지 순간) + Remove Ads 일회성 구매·복원 | ✅ |
| [`THEME_SYSTEM.md`](./THEME_SYSTEM.md) | 테마 10종 — 토큰 세트·미리보기 UX·저장 | ✅ |
| [`design/theme-mockups-10.png`](./design/theme-mockups-10.png) | **테마 10종 화면 시안 정본** (2026-08-14 사용자 제공) — 팔레트 추출 기준 | ✅ |
| [`I18N_SYSTEM.md`](./I18N_SYSTEM.md) | 다국어 — en 기본·5개 언어·키 규약·언어 추가 절차 | ✅ |
| [`DATABASE.md`](./DATABASE.md) | expo-sqlite 스키마·마이그레이션 규약 (개요는 CLAUDE.md §5) | ✅ |
| `UI_GUIDE.md` | 공통 컴포넌트·여백·타이포 사용법 | ❌ 미작성 |
| `CHANGELOG.md` | 릴리스 변경 이력 | ❌ 미작성(첫 빌드 시점부터) |

---

## 2. 구현 현황

프로젝트는 2026-08-14 문서 체계 수립 단계 — **코드 0줄.** 아래 표가 착수 순서의 기준이 된다.

### 앱

| 영역 | 상태 | 비고 |
|---|---|---|
| Expo 부트(SDK 54 · expo-router · TS strict) | ✅ | 2026-08-14 스캐폴드 — expo ~54.0.35 · RN 0.81.5 · React 19.1.0(조각과 동일 조합). typecheck·lint 통과, Metro **:8086** 기동 확인 |
| expo-sqlite 스키마(Site·Account) | ✅ | 2026-08-14 Phase 2 — [`DATABASE.md`](./DATABASE.md). user_version 마이그레이션·FK CASCADE |
| Home(전체 목록 + 계정 수 배지 + 빈 화면 안내) | ✅ | 2026-08-14 Phase 2 — 즐겨찾기 섹션은 Phase 3 |
| 사이트 추가/수정/삭제 (URL만 필수 · 이름 자동 제안) | ✅ | 2026-08-14 Phase 2 — 도메인 파싱 제안 + https 보정 + 삭제 확인(계정 수 명시) + 중복 URL 차단(2026-08-14) |
| 사이트 아이콘 | ✅ | 2026-08-14 Phase 3 — HTML link 파싱→URL 해석(사이트 직접 fetch만) + expo-image 디스크 캐시 + 이니셜 폴백 |
| 사이트 상세 + Open in Browser | ✅ | 2026-08-14 Phase 2 — 외부 기본 브라우저, 실패 알림. WebView 금지 |
| 계정 CRUD (사이트당 N개 · 전 필드 선택) | ✅ | 2026-08-14 Phase 2 — 빈 필드는 NULL 저장 |
| 민감한 메모(전체 숨김 + 눈 아이콘) | ✅ | 2026-08-14 Phase 2 — 숨김 ≠ 암호화 표기 규칙(CLAUDE.md §8) |
| 검색(이름·URL·계정 이름·ID·메모) | ✅ | 2026-08-14 Phase 3 — 250ms 디바운스 · 매치 힌트 · 민감 메모 마스킹 |
| 즐겨찾기(상세 하트 토글 + 홈 가로 섹션) | ✅ | 2026-08-14 Phase 3 — 전용 화면 없음(단일 화면 구조) |
| 화면 골격 | ✅ | 2026-08-14 Phase 0. ~~4탭~~→~~3탭~~→**단일 화면(네비 없음) + 홈 우상단 [🔍][＋][⚙]**(같은 날 사용자 재정정). 화면은 전부 골격, `t()` 키 |
| 테마 10종 + 미리보기 | ✅ | 2026-08-14 Phase 1 — 토큰 19종·zustand persist·미니어처 그리드. [`THEME_SYSTEM.md`](./THEME_SYSTEM.md) |
| 다국어 5종 | ✅ | 2026-08-14 Phase 4 — 5언어 전 키 동기(`check:i18n`이 개수 정본) · 설정→언어 수동 변경. ⚠ ja·zh 원어민 검수 전 |
| 하단 배너 광고 | ❌ | 네비게이션 위. dev는 테스트 단위만 |
| **App Open 광고(콜드 스타트 · 쿨타임 3시간)** | ❌ | ~~홈 진입 전면~~ → 포맷 정정(2026-08-14, 정책 위반 회피). 금지 순간 목록 준수 |
| UMP 동의 폼(EEA 포함 출시) | ❌ | 2026-08-14 확정(MONETIZATION §3) |
| Remove Ads 구매 + Restore Purchases | ❌ | **RevenueCat 익명 모드** 확정(2026-08-14) |
| 공지·점검·강제업데이트(bootstrap) | ✅ | 2026-08-14 Phase 5 — 실패 시 통과, 차단 화면 출구 포함. ⏸ latest 소프트 안내 |
| 문의하기 + **문의 내역(상태·답변)** | ✅ | 2026-08-14 Phase 5 — ~~완전 익명 단방향~~ → **기기 토큰 귀속**(로그인 아님, SecureStore UUID). 서버 `POST /v1/devices` 신설·프로덕션 E2E 실측. 앱 삭제 시 연결 끊김 고지 |
| 데이터 손실 안내 문구 | ✅ | 2026-08-14 — 홈 빈 화면에 표시(CLAUDE.md §6) |

### 서버·외부 (LinkMemo 밖 선행 작업)

| 영역 | 상태 | 비고 |
|---|---|---|
| common_server `apps`에 `linkmemo` 등록 | ✅ | 2026-08-14 — `bootstrap?app=linkmemo` **200 실측** |
| common_server SDK 복사(`lib/common-server/`) | ✅ | 2026-08-14 — SDK_VERSION 2026-08-10 |
| 디스코드 문의 웹훅 env + 재배포 | ⏸ | 사용자 웹훅 URL 필요 — 없으면 알림만 없고 접수는 된다 |
| AdMob 앱·광고단위(배너 1 · **App Open** 1) + GDPR 메시지 설정 | ❌ | 스토어 미출시 상태의 "게재 제한"은 정상 |
| RevenueCat 프로젝트 생성(익명 모드) | ❌ | 웹훅·서버 연동 없음 |
| 스토어 Remove Ads 상품 등록 | ❌ | 비소모성 1상품 |
| 처리방침·약관 게시 | ❌ | 사업자 값은 `C:\project\common\BUSINESS_INFO.md` |

🚫 = 안 하기로 결정 / ⏸ = 보류 / ❌ = 미착수 / ✅ = 완료

---

## 3. 검증 루틴

```bash
npm install                    # 의존성

# 커밋 전 필수
npm run typecheck              # tsc --noEmit
npm run lint                   # expo lint
npm run check:i18n             # 5언어 키 누락·잉여·한글 잔존·보간 일치
```

**번들 컴파일 확인**(구현 완료 선언 전 필수 — 2026-08-14 규약): Metro 기동 상태에서

```bash
curl -s -o /dev/null -w "%{http_code}" "http://localhost:8086/node_modules/expo-router/entry.bundle?platform=android&dev=true"
# 200이면 런타임 모듈 에러 없이 번들 생성. 패키지 설치·파일 삭제 후에는 Metro를 --clear로 재시작(조각 실증)
```

⚠ **Metro 재시작은 PowerShell `Stop-Process`로**(2026-08-14 실증) — git-bash `kill`은 Windows 프로세스에
조용히 실패해 구 프로세스가 포트를 계속 쥔다. 재시작 검증은 ① 포트 소유 PID가 바뀌었는지(`netstat -ano`)
② 콜드 번들이 전체 모듈 수(1500+)로 도는지 — "74ms (1 module)"는 캐시 리셋 실패 신호다.

**Metro 포트는 8086 고정**(2026-08-14 사용자 결정 — `package.json` scripts에 반영):

```bash
npm start                      # expo start --port 8086
npm run android                # expo run:android --port 8086 (dev build)
```

- 방화벽: 활성 node.exe(nvm v22.21.1)에 인바운드 허용 규칙이 이미 있어(Public 프로필) 8086이 열려 있다
  (2026-08-14 확인). 실기기 접속 불가 시 조각 순서로 점검: ① 폰 Wi-Fi ② 방화벽 인바운드 ③ 포트 점유 프로세스.

### 외부에서 실기기 접속 — Tailscale (2026-08-14 설정·검증)

집 밖에서도 폰으로 dev 서버에 붙는다. 폰(`s24`)은 이미 같은 테일넷에 등록돼 있다.

```bash
REACT_NATIVE_PACKAGER_HOSTNAME=100.91.69.45 npx expo start --port 8086   # PC의 Tailscale IP로 광고
```

- 폰에서: Tailscale 앱 켜기 → Expo Go에서 `exp://100.91.69.45:8086` (QR도 이 주소로 나온다).
- 방화벽은 손댈 것 없다 — **`Tailscale-In` 규칙이 테일넷 인터페이스의 전 포트를 이미 허용**한다(실측 확인).
  Metro manifest는 요청 Host를 따라가므로 번들 URL도 자동으로 Tailscale IP가 된다(curl로 검증).
- ⚠ 이 방식으로 띄우면 같은 Wi-Fi라도 **폰에 Tailscale이 켜져 있어야** 붙는다. 순수 LAN 개발로
  돌아가려면 env 없이 `npm start`.
- Tailscale IP가 바뀌면(기기 재등록 등) `tailscale ip -4`로 다시 확인.
- 광고 SDK(네이티브 모듈)가 들어가는 시점부터 **Expo Go 불가 → dev build**(`npm run android`)로 전환한다
  (조각 실증). 그 전까지는 Expo Go로 개발 가능.

---

## 4. 아키텍처 원칙

- 의존 방향: `app/`(라우트) → `features/` → `db/`·`lib/`·`theme/`. 역방향 import 금지.
- **사용자 데이터의 진실은 기기 로컬**이다. 서버가 죽어도 앱은 완전히 동작해야 한다.
- **어떤 서버에도 사이트·계정·메모를 보내지 않는다.** 나가는 것은 bootstrap 조회와 문의 본문뿐.
- **공통 기능(공지·문의)은 common_server, LinkMemo 전용 서버는 없다.** 상세는 [`ARCHITECTURE.md`](./ARCHITECTURE.md).
- 로그인이 없으므로 신원·엔타이틀먼트 서버 판정도 없다. 광고 제거는 스토어 구매 이력이 진실.
- 공통 UI는 `components/`에만. `any` 금지, `strict` 유지.
