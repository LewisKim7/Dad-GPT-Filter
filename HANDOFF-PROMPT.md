# Dad GPT Filter 유지보수 요청 프롬프트

아래 전체를 복사해 GPT/Claude에게 붙여넣고, 맨 아래 [현재 증상]만 채우세요. 스크린샷(Project Home, 기존 대화)을 함께 첨부하세요.

---

```text
너는 지금부터 GitHub repo LewisKim7/Dad-GPT-Filter 의 유지보수를 맡는다.

## Source of truth
대화 내용보다 GitHub 실제 상태가 우선이다. 작업 전에 반드시 직접 읽어라.
- main 의 dad-gpt-filter.txt, README.md, MAINTENANCE.md
- 최근 commit history
읽을 수 없다면 추측하지 말고 읽을 수 없다고 말해라.

## 목적
Samsung Galaxy + Samsung Internet + Samsung Internet용 Adblock + GitHub Raw 맞춤 필터로,
내 ChatGPT 계정의 Project "아빠의 GPT"만 아버지가 단순하게 쓰게 한다.
- Project: https://chatgpt.com/g/g-p-6a7defb2053c8191ac660e89eb8680b6-abbayi-gpt/project
- Raw: https://raw.githubusercontent.com/LewisKim7/Dad-GPT-Filter/main/dad-gpt-filter.txt

## 고정 제약
- Raw URL, repo 이름, dad-gpt-filter.txt 경로 변경 금지
- Unicorn, Userscript, GitHub Pages, 확장 프로그램 금지. 필터 파일만 수정
- Samsung 실기기 결과만 최종 증거로 인정. PC 에뮬레이션(Whale/Chrome Device Mode)은 참고용

## 이 환경에서 확정된 사실 (실기기 성공 기준)
- chatgpt.com##button → 실기기에서 작동 (확정)
- chatgpt.com##button:not(form button):not(section button) → 실기기에서 의도대로 작동. 현재 주력 규칙
- 속성 selector([data-testid=…], [aria-label=…], [href^=…], [name=…], [id*=…])는
  화면에 분명히 존재하는 요소를 겨냥해도 반복적으로 적용되지 않았다 (원인은 추정: 엔진이 속성 규칙을 처리 못함)
→ 새 규칙은 태그만으로 만든다. 속성은 :not() 안에도 넣지 않는다.
- 현재 성공 기준점: version `2026-09-27-tag-only-buttons`, commit `43e12e81ee52463399bf51ea30e6c76021d91d2c`.
- 단, 현재 필터 상단의 기존 attribute/class 규칙은 legacy다. 정상 상태에서 즉시 삭제하지 말고, 새 설계의 선례로도 사용하지 않는다. 제거는 별도 cleanup commit + 실기기 회귀 체크로만 한다.

## 현재 아키텍처
- form = 입력창 안전 구역, section = 대화 턴 안전 구역
- 이 둘 밖의 button을 숨겨서 Project Home 상단(아이콘·제목·공유·…), 채팅/소스 탭, 대화 화면 연필, 사이드바 버튼을 제거

## 반드시 유지 (회귀 체크)
Project 대화 목록 / 사용자·Assistant 메시지 / 입력창 / + / High(메뉴 포함) / 마이크 / Voice(종료 버튼 포함) / 보내기

## 반드시 숨김
Project Home 아이콘·제목·공유·… / 채팅·소스 탭 / 대화 화면 연필(새 채팅) / 사이드바 버튼

## 금지 selector
- div[class*="relative"][class*="shrink-0"][class*="flex"] (대화 본문 삭제 사고의 원인)
- 모든 class 기반, 범용 Tailwind 조합
- header / main / form / section / div / nav 통째 숨김
- :has-text, #?#, #$#, XPath
- 속성 selector (MAINTENANCE.md 6.1 실험으로 작동이 증명되기 전까지)

## 작업 절차 (MAINTENANCE.md 3장 Decision Tree를 그대로 따를 것)
1. GitHub 실제 상태 확인 후, 증상을 "필요한 UI가 사라짐 / 숨긴 UI가 다시 보임 / 본문 사라짐"으로 분류
2. 원인이 불명확하면 표준 canary 1회 (MAINTENANCE.md 4장):
   Title 변경 + chatgpt.com##button + example.com##h1
   → 결과로 전달 문제 / chatgpt.com 예외 문제 / selector 문제 분리
   → 결과 확인 즉시 canary 제거 (production에 남기지 말 것)
3. selector 문제면: 대상 요소의 태그와 조상 태그 체인을 파악 (가능하면 chrome://inspect 로 Samsung Internet 실기기)
4. 태그 전용 최소 수정 1개만 제안. 여러 실험을 섞지 말 것. 실패한 규칙은 누적하지 말고 제거
5. commit 전에 나에게: 무엇을 바꾸는지 / 왜 / 실기기에서 무엇을 확인할지 설명
6. 실기기 결과를 받은 뒤에만 "완료" 처리. 성공 시 Version 갱신, README 기록표 업데이트

## 보고 형식
- 확정 사실과 추정을 반드시 구분 ("추정입니다"로 표시)
- 변경은 diff로 제시

## [현재 증상]
(여기에 무엇이 보이고 무엇이 사라졌는지, 언제부터인지 적는다)
```