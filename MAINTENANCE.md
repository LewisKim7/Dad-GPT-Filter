# Dad GPT Filter — Maintenance Guide

ChatGPT UI가 바뀌어 필터가 깨졌을 때, GPT/Claude가 **실험 10번 대신 순서대로 따라가면 끝나도록** 만든 문서입니다.

---

## 1. Postmortem (2026-09-25 ~ 09-26)

### 1.1 최초 문제
- 2026-09-25 전후 ChatGPT Project 모바일 웹 UI 변경.
- 기존 대화 진입 시 대화 본문이 통째로 사라짐.
- 복구 후에는 Project Home 상단(초록 아이콘·제목·공유·…)과 대화 화면 연필(새 채팅)이 어떤 규칙으로도 숨겨지지 않음.

### 1.2 잘못된 가설과 그 이유
| 가설 | 왜 틀렸나 |
|---|---|
| "Whale Device Mode의 DOM = Samsung 실기기 DOM" | Whale에서 찾은 exact selector가 실기기에서 반복 실패. 에뮬레이터 결과를 실기기 증거로 취급한 것이 가장 큰 시간 손실 |
| "sidebar가 숨겨지니 필터 엔진은 정상" | 순환논리. 그 규칙들은 구버전에도 있었고, 실제로는 다른 이유로 안 보였을 수 있음 |
| "필터가 폰에 아예 적용되지 않는다" (진단 과정) | `chatgpt.com##button` canary가 즉시 성공 → 전달·엔진 모두 정상이었음 |
| "한글 selector만 문제" | 영문 전용 속성 selector(`button[data-testid="composer-plus-btn"]`)도 실패 |

### 1.3 실제로 유효했던 진단
1. **강한 태그 canary** `chatgpt.com##button` → 전달·엔진 문제와 selector 문제를 한 번에 분리.
2. 성공한 태그 규칙에서 **속성 없이 범위만 좁히기** → `:not(form button):not(section button)`.

현재 실기기 성공 기준점:
- 버전 문자열: `2026-09-27-tag-only-buttons`
- commit: `43e12e81ee52463399bf51ea30e6c76021d91d2c`

### 1.4 selector 유형별 실측 결과
| 유형 | 예시 | 실기기 결과 |
|---|---|---|
| 태그 단독 | `button` | ✅ 성공 (확정) |
| 태그 + 속성 없는 `:not(tag tag)` | `button:not(form button):not(section button)` | ✅ 성공 (확정) |
| 속성 exact | `button[data-testid="composer-plus-btn"]`, `button[name="project-title"]` | ❌ 실패 |
| 속성 prefix/substring | `a[href^="/g/…/c/"]`, `[id*="project-home-tabs"]` | ❌ 실패 |
| 속성이 들어간 `:not()` | `button:not(form[data-type="unified-composer"] button)…` | ❌ 실패 (전체 규칙 무효로 추정) |
| 한글 속성 | `button[aria-label="파일 등 추가"]` | ❌ 실패 |

### 1.5 최종 원인 설명 (확정 vs 추정)
- **확정**: 태그 기반 규칙은 적용되고, 화면에 분명히 존재하는 요소를 겨냥한 속성 규칙은 반복적으로 적용되지 않았다.
  특히 `a[href^="…/c/"]` 실패가 중요하다. 프로젝트 대화 목록은 눌렀을 때 그 주소로 이동하므로 해당 href를 가질 수밖에 없다.
- **추정**: Samsung Adblock(또는 Samsung Internet content blocker 변환 단계)이 속성 selector를 포함한 규칙을 버린다. 따옴표(`"`) 처리 문제일 가능성도 있다.
- **모순점 (미해결)**: 09-26 대화 본문 사라짐은 속성 규칙(`div[class*=…]`)이 원인이었다고 기록돼 있다. 이게 사실이라면 당시엔 속성 규칙이 작동했다는 뜻이다. 다만 본문이 사라진 상태에서 이 규칙이 없는 파일(`2026-09-25-safe`)도 같은 증상을 보였기 때문에, 인과관계는 확정되지 않았다. → 6.1 선택 실험으로 해소 가능.

### 1.6 왜 최종 규칙이 성공했나
- 속성을 전혀 쓰지 않아 엔진 제약을 피한다.
- ChatGPT 구조상 입력창은 `form`, 대화 턴은 `section` 안에 있다. 이 두 태그를 **구조적 안전 구역**으로 삼았다.
- 숨기려던 대상(아이콘·제목·공유·…·탭·연필·사이드바 버튼)은 모두 **안전 구역 밖의 `button`** 이었다.

---

## 2. Selector 설계 원칙 (이 환경 한정)

| 등급 | 유형 | 예시 | 조건 |
|---|---|---|---|
| **추천** | 태그 단독 | `button` | 안전 구역 제외와 함께만 |
| **추천** | 태그 + 태그 구조 | `header button`, `nav a` | 결과가 leaf 요소일 것 |
| **추천** | 속성 없는 `:not(tag tag)` | `button:not(form button):not(section button)` | 현재 주력 방식 |
| 조건부 | id selector | `#stage-popover-sidebar` | 실기기 적용 여부 미검증. 단독 의존 금지 |
| 조건부 | 속성 selector | `[data-testid=…]` | 6.1 실험으로 작동이 증명되기 전까지 사용 금지 |
| **금지** | class 기반 | `[class*="…"]`, `.flex` | UI 업데이트마다 깨지고 컨테이너를 잡음 |
| **금지** | 범용 Tailwind 조합 | `div[class*="relative"][class*="shrink-0"][class*="flex"]` | 대화 본문 삭제 사고의 원인 |
| **금지** | 컨테이너 통째 | `header`, `main`, `form`, `section`, `div`, `nav` 단독 | 보호 요소를 함께 숨김 |
| **금지** | 확장 문법 | `:has-text`, `#?#`, `#$#`, XPath | 지원 불확실 |

규칙 작성 3원칙
1. **leaf만 숨긴다** (`button`, `a` 등). 부모 컨테이너를 숨기면 안쪽 전체가 사라진다.
2. **안전 구역(`form`, `section`)은 항상 `:not()`으로 제외한다.**
3. **한 커밋에 한 목적.** 실패한 규칙은 다음 커밋에서 제거하고 누적하지 않는다.

---

## 3. 장애 대응 Decision Tree

```
[증상] 숨겨졌던 UI가 다시 보임 / 필요한 UI가 사라짐 / 대화 본문이 사라짐
  │
  ├─ STEP 1. 증상 기록: Samsung 실기기 스크린샷 (Project Home, 기존 대화)
  │
  ├─ STEP 2. Raw 최신 확인
  │     curl -s https://raw.githubusercontent.com/LewisKim7/Dad-GPT-Filter/main/dad-gpt-filter.txt | head -5
  │     (commit 직후면 CDN 캐시 약 5분 대기)
  │
  ├─ STEP 3. 강한 canary (4장 표준 절차)
  │     ├─ ChatGPT 버튼 안 사라짐 + example.com 제목 안 사라짐 → [전달 문제] STEP 3A
  │     ├─ ChatGPT 버튼 안 사라짐 + example.com 제목 사라짐 → [chatgpt.com 예외 문제] STEP 3B
  │     └─ 둘 다 사라짐 → [selector 문제] STEP 4
  │
  │   3A. Adblock 앱: 맞춤 필터 활성 체크 → 지금 업데이트 → 안 되면 삭제 후 같은 URL 재등록
  │   3B. Adblock 허용 목록 / Samsung Internet 사이트별 차단 설정에서 chatgpt.com 제거
  │
  ├─ STEP 4. canary 즉시 제거 → 원인 분류
  │     ├─ 필요한 UI가 사라짐 → 그 요소가 form/section 밖으로 이동한 것. STEP 5
  │     └─ 숨긴 UI가 다시 보임 → 그 요소가 button이 아니게 됐거나 안전 구역 안으로 들어감. STEP 5
  │
  ├─ STEP 5. 구조 파악 (읽기만)
  │     PC Chrome → chrome://inspect → Samsung Internet 탭 Inspect (가능하면)
  │     또는 PC 브라우저 모바일 에뮬레이션 (참고용. 실기기 증거로 취급 금지)
  │     확인할 것: 대상 요소의 태그, 조상 태그 체인 (form/section/header/nav/dialog 포함 여부)
  │
  ├─ STEP 6. 태그 전용 최소 수정 (2장 원칙)
  │     예) 보호 추가:  button:not(form button):not(section button):not(article button)
  │     예) 숨김 추가:  header a
  │
  ├─ STEP 7. Samsung 실기기 검증 → 5장 회귀 체크리스트 전부 통과
  │
  └─ STEP 8. 기록: Version 갱신, README 기록표에 날짜·버전·commit·원인 추가
```

---

## 4. Canary 테스트 표준

| 항목 | 규정 |
|---|---|
| 목적 | 전달 문제 / 도메인 예외 문제 / selector 문제를 한 번에 분리 |
| 내용 | 아래 3가지를 한 커밋에 |
| 커밋 메시지 | `test: canary …` |
| 수명 | 결과 확인 즉시 되돌림 (`revert: remove canary`). **production에 남기지 않음** |

```text
! Title: Dad GPT Filter CANARY-YYYYMMDD      ← 앱의 필터 이름 변경으로 수신 확인
chatgpt.com##button                          ← ChatGPT 모든 버튼 숨김
example.com##h1                              ← 대조군: example.com 제목 숨김
```

| ChatGPT 버튼 | example.com 제목 | 판정 |
|---|---|---|
| 사라짐 | 사라짐 | 전달·엔진 정상 → selector 문제 |
| 그대로 | 사라짐 | chatgpt.com만 예외 처리됨 |
| 그대로 | 그대로 | 맞춤 필터 미수신 / 비활성 |

주의: canary 동안 아버지는 ChatGPT를 쓸 수 없습니다(보내기 버튼도 사라짐). 가족이 안 쓰는 시간에 하세요.

---

## 5. 회귀 체크리스트 (Samsung 실기기, 매 변경 후)

### 유지되어야 함
| # | 화면 | 항목 |
|---|---|---|
| 1 | Project Home | Project 내부 대화 목록 보이고 눌림 |
| 2 | Project Home | 입력창 입력 가능 |
| 3 | 기존 대화 | 사용자 메시지 · Assistant 메시지 |
| 4 | 공통 | `+`, High, 보내기 (입력 중) |
| 5 | 공통 | 마이크, Voice (입력창이 비어 있을 때) |
| 6 | 공통 | High를 눌렀을 때 모델 메뉴가 열리고 선택됨 |
| 7 | 공통 | `+`를 눌렀을 때 첨부 메뉴가 열림 |
| 8 | Voice | Voice 시작 → **종료 버튼 보임** |
| 9 | 기존 대화 | 답변 아래 action 버튼(복사·읽기 등) — 현재 **확인 필요**, 7장 참고 |

### 숨겨져야 함
| # | 화면 | 항목 |
|---|---|---|
| 10 | Project Home | 초록 아이콘 · 제목 · 공유 · … |
| 11 | Project Home | 채팅 / 소스 탭 |
| 12 | 기존 대화 | 연필(새 채팅) |
| 13 | 공통 | 사이드바 열기 버튼 |

---

## 6. 미해결 질문과 선택 실험

### 6.1 속성 selector는 정말 전부 안 먹는가? (선택)
안 해도 운영에는 지장이 없습니다. 원인을 확정하고 싶을 때만, 가족이 안 쓰는 시간에 하세요.
```text
chatgpt.com##a[href]
```
- 대화 목록 등 **모든 링크가 사라짐** → 속성 자체는 작동, **따옴표 값 비교**가 문제일 가능성
- 그대로 → 속성 selector 전반 미지원으로 확정
- 확인 즉시 제거

---

## 7. 잠재 위험과 대응

| 위험 | 가능성 | 증상 | 대응 (태그 전용) |
|---|---|---|---|
| 답변 아래 action 버튼 숨김 | **최종 성공 스크린샷에서 안 보임** | 복사·읽기·다시 생성 없음 | action 행이 `section` 밖에 있는 구조로 추정. 필요하면 조상 태그를 확인해 `:not(article button)` 등 예외 추가. 필요 없다면 현 상태 유지 |
| Voice 화면의 종료 버튼 숨김 | 중 | Voice에서 못 나옴 | Voice overlay의 조상 태그 확인 후 `:not(dialog button)` 등 예외 추가. 임시로 새로고침 |
| 로그인 버튼 숨김 | 확정 (로그아웃 시) | 로그인 불가 | 재로그인 시 Adblock 잠시 끄기 |
| 팝업·모달 버튼 숨김 (공지, 사용량 제한, 쿠키 등) | 중 | "확인"을 못 눌러 화면이 막힘 | 새로고침 → 반복되면 해당 모달 조상 태그 예외 추가 |
| 대화 목록이 링크→버튼으로 바뀜 | 낮음 | Project Home 목록 사라짐 | 목록 조상 태그(`ol`/`ul`/`li`)를 `:not()` 예외에 추가 |
| ChatGPT가 `form`/`section` 구조를 바꿈 | 낮음~중 | 입력창 버튼이나 본문 action 사라짐 | 3장 Decision Tree STEP 5~6 |

---

## 8. 기존 속성 규칙 정리 계획

현재 파일 상단의 속성 selector 규칙 19개(sidebar, history, tabs, `[class*="no-draggable"]` 등)는 **대부분 dead rule일 가능성이 높습니다.** 해당 버튼들은 이미 태그 규칙으로 숨겨지고 있습니다.

| 판단 | 내용 |
|---|---|
| 지금 제거 | **하지 않음.** 정상 동작 중이므로 건드리지 않는다 |
| 제거 시점 | 별도 cleanup 커밋으로, 가족이 안 쓰는 시간에 |
| 방법 | 속성 규칙을 한 커밋에서 전부 제거 → 5장 체크리스트 확인. **화면이 완전히 같으면 dead rule 확정**, 무언가 다시 보이면 그 커밋만 revert |
| 이점 | 파일이 한 눈에 읽힘, 다음 유지보수자가 죽은 규칙을 근거로 오판하지 않음 |
| 주의 | `[class*="no-draggable"]`도 속성 selector다. 금지 유형이므로 cleanup 시 함께 제거 대상 |