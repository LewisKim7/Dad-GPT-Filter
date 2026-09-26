# Dad GPT Filter

Samsung Internet에서 ChatGPT를 가족용으로 단순하게 사용할 수 있도록 만든 개인용 UI 필터입니다.

현재 운영 방식은 **Samsung Internet용 Adblock 하나 + GitHub Raw 필터 구독**입니다. ChatGPT UI가 바뀌면 이 저장소의 `dad-gpt-filter.txt`만 수정하며, 휴대폰에 등록한 Raw URL과 파일 경로는 유지합니다.

## 현재 정상 동작 상태

**2026-09-26 Samsung Internet 실기기에서 정상 동작 확인.**

현재 확인된 정상 상태는 다음과 같습니다.

- 왼쪽 글로벌 사이드바 열기 버튼 숨김
- 글로벌 사이드바 및 개인 Chat History 접근 UI 숨김
- 프로젝트 내부 대화 목록은 유지
- 기존 대화 본문 정상 표시
- 새 답변 및 과거 답변 정상 표시
- 입력창 정상 표시
- `+`, High, 마이크, Voice 정상 유지
- 프로젝트 제목/공유 등 대화에 필요한 상단 UI는 유지

2026-09-25~26 ChatGPT 웹 UI가 크게 변경된 시점에 기존 필터가 대화 본문까지 숨기는 문제가 발생했습니다. Astra 관련 UI 변경 시점과 겹쳤지만, 두 사건의 직접적인 인과관계는 확인하지 않았습니다.

## 2026-09-26 장애 원인 및 해결

문제를 일으킨 핵심 규칙은 아래와 같았습니다.

```text
chatgpt.com##div[class*="relative"][class*="shrink-0"][class*="flex"]
```

새 ChatGPT DOM에서는 이 규칙이 단순한 상단 UI뿐 아니라 실제 conversation timeline 내부 wrapper까지 매칭했습니다. 그 결과 사이드바는 숨겨졌지만 기존 대화에 들어가면 대화 본문 전체가 보이지 않는 문제가 발생했습니다.

해결 방법은 **2026-09-25 수정 직전의 작동하던 필터를 기준으로 위 규칙만 제거**하고, 프로젝트 대화 링크는 별도 selector로 처리하는 방식이었습니다.

현재 성공 버전:

```text
! Version: 2026-09-26-original-minus-body-killer
```

성공 반영 commit:

```text
677d4e051e988fc2daec65ac70db96f3698eba55
```

### 절대 재도입하지 말 것

아래 규칙은 현재 ChatGPT UI에서 대화 본문을 숨길 수 있으므로 다시 추가하지 않습니다.

```text
chatgpt.com##div[class*="relative"][class*="shrink-0"][class*="flex"]
```

비슷하게 `relative`, `flex`, `shrink-0` 등 범용 Tailwind class 조합으로 컨테이너를 통째로 숨기는 방식은 UI 변경 시 정상 conversation wrapper까지 매칭할 위험이 큽니다.

현재 필터에 남아 있는 기존 규칙은 Samsung Internet 실기기에서 정상 동작을 확인한 상태이므로, 단순한 정리 목적만으로 한꺼번에 재작성하지 않습니다.

## 고정 Raw URL

```text
https://raw.githubusercontent.com/LewisKim7/Dad-GPT-Filter/main/dad-gpt-filter.txt
```

앞으로도 위 URL을 Samsung Internet용 Adblock의 맞춤 필터 목록에 계속 사용합니다. **Raw URL, repo 이름, `dad-gpt-filter.txt` 경로는 변경하지 않습니다.**

## 설치

1. Samsung Internet용 Adblock의 맞춤 필터 목록에 위 Raw URL을 등록합니다.
2. 필터 목록을 활성화합니다.
3. 필터 목록을 수동 갱신합니다.
4. Samsung Internet의 ChatGPT 탭을 새로고침합니다.

## 유지보수 원칙

ChatGPT UI가 다시 변경되면 다음 순서로 대응합니다.

1. 현재 정상 버전을 먼저 보존합니다.
2. Samsung Internet에서 Adblock을 끄고 대화 본문 자체가 정상인지 확인합니다.
3. 실제 모바일 DOM에서 문제가 생긴 요소의 selector를 확인합니다.
4. 한 번에 많은 규칙을 바꾸지 않고 최소 변경만 적용합니다.
5. 특히 conversation timeline과 composer가 숨겨지지 않는지 확인합니다.
6. 실기기에서 정상 동작을 확인한 뒤에만 해당 버전을 안정 버전으로 기록합니다.

보호 대상의 대표적인 현재 DOM selector:

```text
[data-scroll-root]
section[data-testid^="conversation-turn"]
[data-message-author-role]
form[data-type="unified-composer"]
#prompt-textarea
button[data-testid="composer-plus-btn"]
```

위 요소 또는 그 상위 conversation wrapper를 잡는 cosmetic rule은 피합니다.

## 트러블슈팅

사이드바는 사라지는데 대화 본문도 사라진다면, 먼저 broad class selector가 conversation wrapper를 잡고 있는지 확인합니다.

아무 UI도 전혀 숨겨지지 않는다면 selector를 먼저 바꾸기보다 Samsung Internet의 콘텐츠 차단 활성화, 맞춤 필터 활성화, 필터 갱신 상태를 확인합니다.

정상 동작하던 버전으로 빠르게 비교할 필요가 있을 때는 GitHub commit history를 source of truth로 사용합니다.

## 한계

이 필터는 cosmetic filter이므로 화면 표시를 숨기는 보조 수단입니다. 실제 계정 권한 분리 기능을 대체하지 않습니다.

이 프로젝트는 OpenAI 또는 ChatGPT의 공식 프로젝트가 아닙니다.
