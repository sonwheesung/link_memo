# ARCHITECTURE — 서버 경계와 연동

> 정책 요약은 [`../CLAUDE.md`](../CLAUDE.md) §10. 조각 `docs/ARCHITECTURE.md`의 틀을 승계하되,
> LinkMemo는 **로그인도 전용 서버도 없어서** 훨씬 얇다. 2026-08-14 작성 — 연동 0%.

---

## 1. 전체 그림

```
LinkMemo 앱 (Expo RN)
 │
 ├── 로컬 (expo-sqlite / 로컬 저장) ← 사이트·계정·메모·테마·설정 = 전부 여기. 진실의 전부
 │
 ├── HTTPS ──▶ common_server (https://common-server.vercel.app)
 │              ├─ GET  /api/v1/bootstrap?app=linkmemo   ← 부팅 1회: 점검·강제업데이트·공지
 │              └─ POST /api/v1/tickets                  ← 익명 문의(단방향)
 │
 ├── OS 기본 브라우저 ← Open in Browser (Linking.openURL)
 ├── 저장한 사이트 자체 ← favicon 직접 fetch(+로컬 캐시) — 제3자 아이콘 서비스 🚫 (2026-08-14 확정)
 ├── AdMob SDK ← 광고 (테스트 단위로 개발 · EEA는 UMP 동의 폼)
 └── RevenueCat(익명) + 스토어 인앱결제 ← Remove Ads (2026-08-14 확정 — 서버 웹훅·미러 없음)

LinkMemo 전용 서버: 없음 (만들지 않는다)
```

**우리 서버(common_server)로 나가는 사용자 입력은 문의 본문뿐이다.** 사이트·계정·메모는 어떤 요청에도
실리지 않는다. favicon fetch는 **사용자가 저장한 그 사이트로만** 나간다(제3자 없음 — 어차피 방문하는 곳).

---

## 2. 왜 LinkMemo 전용 서버가 없는가 — ✅ 확정 (2026-08-14 사용자 질의 → 판단)

"별도 서버 vs common_server 튜닝" 질문의 결론: **common_server 그대로, 튜닝조차 불필요.**
1배포 N앱 설계라 앱 추가 = `apps` seed 1행이며, LinkMemo가 쓰는 v1 기능(bootstrap·익명 문의)은
이미 배포·검증 완료다. 별도 서버는 Supabase 무료 티어 한도(활성 2프로젝트)를 깨고 운영만 이중이 된다.
상세 근거는 CLAUDE.md §10.

- 기둥 2(로컬 온리)가 기획의 정체성이다 — 서버가 생기는 순간 "No cloud" 포지셔닝이 흐려진다.
- 조각이 전용 서버를 판 이유(E2EE 백업 저장 · AI 프록시)에 해당하는 기능이 LinkMemo엔 없다.
  로컬 백업 파일(P1)도 서버가 필요 없고, P3의 "암호화 백업"이 실제로 오면 그때 조각의
  service_role 폭발 반경 논리(조각 CLAUDE.md §5)를 그대로 다시 검토한다.
- 공지·문의·점검 게이트는 이미 있는 common_server(1배포 N앱)에 태우면 된다 — 한계비용 0.

## 3. 무엇을 어디에 두는가

| 데이터 | 위치 | 비고 |
|---|---|---|
| 사이트·계정·메모·즐겨찾기 | 기기 로컬 | 유일본. 손실 안내 필수(CLAUDE.md §6) |
| 테마·언어·설정 | 기기 로컬 | |
| 광고 제거 구매 상태 | 스토어(진실) + 로컬 캐시 | 조회 실패에 캐시를 지우지 않는다 |
| 공지·점검·버전 게이트 | common_server DB | 앱은 읽기만 |
| 문의 | common_server DB | 익명. platform·appVersion만 동봉 |
| 공지 읽음 여부 | 기기 로컬(AsyncStorage) | 서버에 읽음 테이블을 두지 않는다(common 규약) |

## 4. 신원 — 없다

- common_server의 subjects·토큰(Phase 7)·서버 엔타이틀먼트(Phase 9)를 **쓰지 않는다.**
- 문의는 v1 익명 경로 — 서버조차 누가 보냈는지 모른다(개인정보 최소수집). 답변 확인 화면도 없다
  (콘솔의 reply는 운영자 내부 메모 성격 — common ONBOARDING §6 주의사항).
- ⏭ 나중에 로그인을 붙이면: 탈퇴 경로 + 웹 삭제 URL이 Play 정책상 세트로 필요해진다(조각 §4).
  그 전까지는 "계정 없음"이 심사 부담을 통째로 없애준다.

---

## 5. common_server 연동 계약

절차 정본은 `common_server/docs/ONBOARDING.md`("새 앱 붙이기") — **위에서 아래로, 확인 명령 출력을 증거로.**

### 5.1 시작 전 확정값

| 항목 | 값 | 변경 가능? |
|---|---|---|
| `app_code` | **`linkmemo` (2026-08-14 확정)** | ❌ 등록 후 사실상 불가 |
| 표시 이름 | LinkMemo | ✅ 콘솔에서 |
| 로그인 | **없음** | ✅ 나중에 추가 가능(subject는 덧붙이는 구조) |
| 구독 | **없음** (일회성 IAP뿐) | ✅ |

### 5.2 연동 순서 (ONBOARDING 승계 — 로그인·구독 절 건너뜀)

1. **앱 등록(서버)**: `node --env-file=.env.local tools/seed.ts linkmemo "LinkMemo"` →
   확인: `curl "https://common-server.vercel.app/api/v1/bootstrap?app=linkmemo&platform=android&appVersion=0.1.0"` **200**
   (404 = 미등록/비활성. "했다"가 아니라 출력을 남긴다)
2. **SDK 복사(앱)**: `common_server/client/` → `lib/common-server/`. 복사본 상단에 `SDK_VERSION` 주석.
   확인: `BASE_URL=... APP=linkmemo node tools/_dv_sdk.ts`
3. **부팅 게이트(앱)**: `fetchBootstrap()` 1회. **실패해도 앱을 막지 않는다** — 로컬 앱이 서버 때문에
   못 열리면 기둥 2 위반이다. 성공 시에만: 점검 화면 / min 미만 강제 업데이트 / latest 미만 소프트 안내 / 공지 배지.
   ⚠ **차단 화면에 반드시 출구를 둔다** — 스토어 URL이 비어 있으면 안내문이라도(my_word 실제 사고).
4. **문의(앱)**: `sendInquiry(category, content)`. 본문 5~2000자, 24h 앱별 캡(기본 30) 초과 시 `rate-limited`.
5. **디스코드 알림(서버·선택)**: `DISCORD_TICKET_WEBHOOK_URL_LINKMEMO` env + **재배포** —
   연동 전 과정에서 유일하게 재배포가 필요한 지점. 없으면 "문의는 들어오는데 알림만 없는" 상태다(고장 아님).

### 5.3 반드시 지킬 것 (common 핸드오프 규약 승계)

- bootstrap 게이트는 **서버 응답으로만** 판정 — 앱 로컬 신뢰 금지(스토어 강제업데이트에 의존하지 않고
  DB로 우회할 수 있는 것이 이 설계의 요점).
- SDK 모듈은 **throw 하지 않는다** — 실패를 타입으로 반환.
- 서버 세션에 상태를 넘길 때는 확인 명령의 **출력을 붙여넣는다**(ONBOARDING §9 표).

---

## 6. 구현 현황

| 항목 | 상태 |
|---|---|
| `apps`에 `linkmemo` 등록 | ❌ |
| SDK 복사 | ❌ |
| 부팅 게이트 | ❌ |
| 문의 화면 | ❌ |
| 디스코드 웹훅 env | ❌ |

## 7. 열린 질문

~~app_code · 결제 경로 · favicon 소스~~ → **전부 해소(2026-08-14).** 결정 내용은 CLAUDE.md §14 확정 표.
현재 열린 질문 없음.
