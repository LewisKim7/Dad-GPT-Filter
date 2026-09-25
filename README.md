# Dad GPT Filter

Samsung Internet에서 ChatGPT를 가족용으로 단순하게 사용할 수 있도록 만든 개인용 UI 필터입니다.

현재 운영 방식은 **Samsung Internet용 Adblock 하나 + GitHub Raw 필터 구독**입니다. ChatGPT UI가 바뀌면 이 저장소의 필터 파일만 수정하며, 휴대폰에 등록한 Raw URL은 그대로 유지합니다.

## 목적

- ChatGPT 사이드바 숨김
- 이전 대화 기록 및 대화 링크 숨김
- 프로젝트 관련 탭 숨김
- 프로젝트 이름 / 헤더 액션 숨김
- 공유 버튼 숨김
- Chat / Work 전환 UI 숨김
- 정상 대화 본문과 입력창은 보존

## 고정 Raw URL

```text
https://raw.githubusercontent.com/LewisKim7/Dad-GPT-Filter/main/dad-gpt-filter.txt
```

앞으로도 위 URL을 Samsung Internet용 Adblock의 맞춤 필터 목록에 계속 사용합니다.

## 운영 원칙

Samsung Internet 콘텐츠 차단 호환성을 우선합니다.

ChatGPT UI 업데이트에서 정상 대화 본문까지 숨길 위험이 있는 광범위한 Tailwind class 기반 selector는 사용하지 않습니다. `relative`, `flex`, `shrink-0`, `no-draggable` 같은 범용 class 조합 대신 `data-testid`, `aria-*`, 고유 ID처럼 역할이 명확한 selector를 우선합니다.

## 설치

1. Samsung Internet용 Adblock의 맞춤 필터 목록에 위 Raw URL을 등록합니다.
2. 필터 목록을 활성화합니다.
3. 필터 목록을 갱신한 뒤 ChatGPT 페이지를 새로고침합니다.

## 유지보수

ChatGPT 웹 UI가 변경되어 특정 UI가 다시 보이면 `dad-gpt-filter.txt`만 수정합니다. Raw URL과 파일 경로는 유지합니다.

## 한계

이 필터는 cosmetic filter이므로 화면 표시를 숨기는 보조 수단입니다. 실제 계정 권한 분리 기능을 대체하지 않습니다.

이 프로젝트는 OpenAI 또는 ChatGPT의 공식 프로젝트가 아닙니다.
