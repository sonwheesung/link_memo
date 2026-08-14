# I18N_SYSTEM — 다국어

> 정책은 [`../CLAUDE.md`](../CLAUDE.md) §9.1. 2026-08-14 기획 확정 — 구현 0%.
> **글로벌 출시가 전제**다 — 한국 대상 로컬 앱이 아니다.

## 구현 현황

| 영역 | 상태 |
|---|---|
| i18next · react-i18next · expo-localization 세팅 | ❌ |
| Phase 1 언어 5종 리소스 | ❌ |
| 키 검사 스크립트(`check:i18n` 승계) | ❌ |

---

## 1. 언어

| Phase | 언어 | 비고 |
|---|---|---|
| **1 (MVP)** | **English(기본)** · 한국어 · 日本語 · 简体中文 · 繁體中文 | 폴백은 영어 |
| 2 | es · pt · de · fr · it · id · th · vi 후보 | **실제 유입 국가 데이터로 순서 결정** — 미리 확정하지 않는다 |

- 기기 언어 자동 감지, 미지원 언어는 영어 폴백. 설정에서 수동 변경 가능(조각 방식 승계).

---

## 2. 키 규약 (기획 확정)

UI 코드에 한국어/영어 문장을 직접 쓰지 않는다. 전 문자열이 번역 리소스를 거친다.

```
common.home / common.search / common.settings / common.add / common.cancel / common.save
site.add / site.edit / site.delete / site.openInBrowser
account.add / account.edit / account.delete
settings.theme / settings.removeAds / settings.restorePurchase
```

- 네임스페이스 = 도메인(`common` / `site` / `account` / `settings` / `ads` / `purchase`).
- ⚠ 성격이 다른 고지 문구는 키를 분리해 재사용을 막는다(조각 규약 승계) — 예: 데이터 손실 안내(`data.notice.*`)를
  다른 화면 안내와 섞어 쓰지 않는다.

---

## 3. 언어 추가 절차

1. `locales/<lang>/` 리소스 추가 (영어 기준으로 전 키 번역)
2. `check:i18n` 통과 — 키 누락 · 언어 간 불일치 · **다른 언어 파일에 한글 잔존** 검사(조각 스크립트 이식)
3. 스토어 등록정보(설명·스크린샷 캡션)도 같은 릴리스에서 함께
4. 이 문서와 `docs/README.md` 구현 현황 갱신

---

## 4. 주의

- **날짜·숫자 현지화**는 dayjs locale로 — 문자열 조합으로 날짜를 만들지 않는다.
- 중국어는 간체(zh-Hans)·번체(zh-Hant)가 **별개 언어**다 — 폴백 체인에서 서로 섞지 않는다.
- 가격은 번역 대상이 아니다 — **스토어 가격 정보를 그대로 표시**(CLAUDE.md §7.1). "₩1,500"을 리소스에 넣지 않는다.
- 원어민 검수 전 기계 번역 상태임을 릴리스 노트에 인지하고 관리한다(조각도 ⚠ 검수 전 상태로 출시 준비).
