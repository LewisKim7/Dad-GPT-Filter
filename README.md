# Dad GPT Filter

삼성 인터넷에서 ChatGPT를 보다 단순하고 안전한 형태로 사용할 수 있도록 만든 개인용 UI 필터입니다.

가족용 기기에서 ChatGPT를 사용할 때 사이드바, 이전 대화 기록, 프로젝트 탭 등 불필요한 인터페이스가 실수로 노출되거나 눌리는 일을 줄이는 것이 목적입니다.

## 목적

이 프로젝트는 ChatGPT 계정이나 서버 데이터를 수정하지 않습니다. 브라우저의 콘텐츠 차단 기능을 이용해 특정 UI 요소만 화면에서 숨기는 **cosmetic filter**입니다.

주요 목적은 다음과 같습니다.

- ChatGPT 사이드바 숨김
- 이전 대화 기록 및 대화 링크 숨김
- 프로젝트 관련 UI 숨김
- 사이드바 열기 / 닫기 버튼 숨김
- 헤더의 일부 드롭다운 UI 숨김
- 가족용 브라우저에서 보다 단순한 ChatGPT 화면 제공

## 필터 파일

실제 필터 목록은 [`dad-gpt-filter.txt`](dad-gpt-filter.txt)에 있습니다.

### Raw URL

```text
https://raw.githubusercontent.com/LewisKim7/Dad-GPT-Filter/main/dad-gpt-filter.txt
```

이 Raw URL을 Samsung Internet용 Adblock 또는 ABP 호환 사용자 정의 필터 목록에 등록해 사용할 수 있습니다.

## 사용 환경

현재 필터는 다음 환경을 기준으로 관리합니다.

- 대상 사이트: `chatgpt.com`
- 주 사용 브라우저: Samsung Internet
- 주력 차단: Unicorn 사용자 필터
- 백업 차단: Samsung Internet용 Adblock + Raw 필터 구독
- 필터 형식: Adblock Plus 호환 cosmetic filter

## 필터가 숨기는 요소

필터는 ChatGPT의 CSS selector 및 `data-testid`, `aria-*` 속성을 기준으로 UI를 숨깁니다.

현재 주요 대상은 다음과 같습니다.

- sidebar container
- sidebar open / close controls
- chat history navigation
- individual history links
- project-home tabs
- history-related dialogs
- selected header popover controls

필터는 화면 표시만 변경하며 ChatGPT 서버의 대화 내용이나 계정 데이터를 삭제하지 않습니다.

## 설치 개념

1. Unicorn 사용자 필터에 FULL 규칙을 등록합니다.
2. Samsung Internet용 Adblock에는 위 Raw URL을 백업 필터로 등록합니다.
3. Samsung Internet에서 `chatgpt.com`을 새로고침해 필터 적용을 확인합니다.

## 유지보수

ChatGPT 웹 UI는 수시로 변경될 수 있습니다. OpenAI가 DOM 구조, class 이름, `data-testid`, ARIA 속성을 변경하면 일부 규칙이 더 이상 작동하지 않을 수 있습니다.

그 경우 `dad-gpt-filter.txt`의 selector만 새 UI 구조에 맞게 업데이트하면 됩니다. 파일 경로를 유지하면 Raw URL은 계속 동일하게 사용할 수 있습니다.

## 개인정보 및 보안

이 저장소에는 다음 정보가 포함되어 있지 않습니다.

- ChatGPT 대화 내용
- 계정 정보
- 비밀번호
- 쿠키
- 인증 토큰

필터 파일에는 화면에서 숨길 UI 요소를 지정하는 selector 규칙만 포함됩니다.

## 한계

이 필터는 편의성과 화면 단순화를 위한 보조 수단입니다. 계정 권한 분리, 로그아웃, 별도 프로필 사용 같은 보안 기능을 대체하지 않습니다.

ChatGPT UI 변경에 따라 특정 selector가 작동하지 않을 수 있으며, 그 경우 필터 업데이트가 필요합니다.

## 비공식 프로젝트

이 프로젝트는 OpenAI 또는 ChatGPT의 공식 프로젝트가 아닙니다.

---

Maintained as a small standalone browser-filter utility for a simplified family-use ChatGPT interface.
