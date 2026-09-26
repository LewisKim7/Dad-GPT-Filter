# Dad GPT Filter

Samsung Internet에서 ChatGPT Project **"아빠의 GPT"**를 아버지가 단순한 GPT처럼 쓰도록, 불필요한 UI를 숨기는 개인용 cosmetic 필터입니다.

## 운영 구조 (고정)

| 항목 | 값 |
|---|---|
| 기기 / 브라우저 | Samsung Galaxy / Samsung Internet |
| 차단기 | Samsung Internet용 Adblock (맞춤 필터 구독) |
| 필터 Raw URL | `https://raw.githubusercontent.com/LewisKim7/Dad-GPT-Filter/main/dad-gpt-filter.txt` |
| 대상 Project | `https://chatgpt.com/g/g-p-6a7defb2053c8191ac660e89eb8680b6-abbayi-gpt/project` |
| 사용 안 함 | Unicorn, Userscript, GitHub Pages, Chrome extension |

**Raw URL, repo 이름, `dad-gpt-filter.txt` 경로는 절대 바꾸지 않습니다.** UI가 바뀌면 파일 내용만 수정합니다.

## 현재 상태: Samsung 실기기 성공

- 실기기 확인: 2026-09-26 KST
- 버전 문자열: `2026-09-27-tag-only-buttons`
- 성공 기준 commit: `43e12e81ee52463399bf51ea30e6c76021d91d2c`
- 핵심 규칙 (이 한 줄이 실제 UI 숨김을 담당):

```text
chatgpt.com##button:not(form button):not(section button)
```

| 숨김 | 유지 |
|---|---|
| Project Home 상단 초록 아이콘 · 제목 · 공유 · … | Project 내부 대화 목록 |
| 채팅 / 소스 탭 | 사용자 · Assistant 메시지 |
| 기존 대화 상단의 연필(새 채팅) | 입력창, `+`, High, 보내기 |
| 사이드바 열기 버튼 (form·section 밖 버튼이므로 함께 숨김) | |

원리: ChatGPT의 입력창은 `form`, 대화 한 턴은 `section` 태그 안에 있습니다. 이 두 태그를 **안전 구역**으로 두고, 그 밖의 버튼만 숨깁니다.

## 이 환경의 핵심 사실

| 구분 | 내용 |
|---|---|
| 확정 | `chatgpt.com##button` (태그만) → 실기기에서 모든 버튼 숨김 성공 |
| 확정 | `chatgpt.com##button:not(form button):not(section button)` → 실기기에서 의도대로 성공 |
| 확정 | 화면에 분명히 존재하는 요소를 겨냥한 속성 selector(`[data-testid=…]`, `[aria-label=…]`, `[href^=…]`, `[name=…]`, `[id*=…]`)가 2026-09-26~27 실험에서 반복적으로 미적용 |
| 추정 | Samsung Adblock이 속성 selector 규칙을 처리하지 못함 (원인 미확정, [MAINTENANCE.md](MAINTENANCE.md) 참고) |

**그래서 새 규칙은 우선 태그와 태그 구조만으로 만듭니다.** 설계 원칙과 장애 대응 절차는 [MAINTENANCE.md](MAINTENANCE.md)에 있습니다.

현재 `dad-gpt-filter.txt` 상단에는 과거의 attribute/class 기반 규칙이 legacy로 남아 있습니다. **현재 화면이 정상인 동안 임의로 삭제하지 말고**, 새 규칙의 설계 근거로도 사용하지 않습니다. 정리는 반드시 별도 cleanup commit에서 회귀 체크와 함께 수행합니다.

## 절대 재도입하지 말 것

```text
chatgpt.com##div[class*="relative"][class*="shrink-0"][class*="flex"]
```

2026-09 UI 변경 후 대화 본문 전체를 숨기는 사고를 일으켰습니다. `relative`, `flex`, `shrink-0` 같은 범용 Tailwind class 조합과 `header`, `main`, `form`, `section`, `div` 통째 숨김도 금지합니다.

## 필터 업데이트 방법

1. `dad-gpt-filter.txt` 수정 후 `! Version:` 갱신 → main에 commit
2. 휴대폰: Samsung Adblock → 광고 필터 업데이트 → **지금 업데이트**
3. Samsung Internet에서 ChatGPT 탭 새로고침
4. [MAINTENANCE.md](MAINTENANCE.md)의 회귀 체크리스트 확인

## 알려진 한계

- 로그인이 풀리면 로그인 버튼도 숨겨집니다. **재로그인 시에만 Adblock을 잠시 끄세요.**
- Voice 종료 버튼, 팝업/모달 버튼, 답변 아래 action 버튼은 ChatGPT DOM이 바뀌면 숨겨질 수 있습니다. 필요하면 MAINTENANCE의 안전 구역 확장 절차를 따릅니다.
- cosmetic 필터는 화면에서 숨길 뿐, 주소 직접 입력 등으로 다른 화면에 가는 것을 막지는 못합니다.

## 유지보수 인수인계

몇 달 뒤 GPT/Claude에게 유지보수를 맡길 때는 [HANDOFF-PROMPT.md](HANDOFF-PROMPT.md)를 그대로 사용합니다.

## 기록

| 날짜 | 버전 | 내용 |
|---|---|---|
| 2026-09-26 | `original-minus-body-killer` | 대화 본문 사라짐 장애 복구 (commit `677d4e0`) |
| 2026-09-26 | `tag-only-buttons` | 태그 전용 규칙으로 의도한 UI 숨김 성공 (commit `43e12e81ee52463399bf51ea30e6c76021d91d2c`) |