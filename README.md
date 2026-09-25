# Dad GPT Filter

Samsung Internet에서 ChatGPT를 가족용으로 단순하게 사용할 수 있도록 만든 개인용 UI 필터입니다.

현재 운영 방식은 **Samsung Internet용 Adblock 하나 + GitHub Raw 필터 구독**으로 단순화했습니다. ChatGPT UI가 바뀌면 이 저장소의 필터 파일만 수정하며, 휴대폰에 등록한 Raw URL은 그대로 유지합니다.

## 목적

- ChatGPT 사이드바 숨김
- 이전 대화 기록 및 대화 링크 숨김
- 프로젝트 관련 탭 숨김
- 프로젝트 이름 / 헤더 영역 숨김
- 공유 버튼 숨김
- Chat / Work 전환 등 헤더 UI 숨김
- 가족용 브라우저에서 불필요한 계정 UI 노출 최소화

이 프로젝트는 ChatGPT 계정이나 서버 데이터를 수정하지 않습니다. Samsung Internet 콘텐츠 차단 기능을 이용한 cosmetic filter입니다.

## 필터 파일

실제 필터 목록:

[`dad-gpt-filter.txt`](dad-gpt-filter.txt)

### 고정 Raw URL

```text
https://raw.githubusercontent.com/LewisKim7/Dad-GPT-Filter/main/dad-gpt-filter.txt
```

앞으로도 위 URL을 Samsung Internet용 Adblock의 **맞춤 필터 목록**에 계속 사용합니다. ChatGPT UI가 변경되면 GitHub의 `dad-gpt-filter.txt`만 업데이트합니다.

## 사용 환경

- 대상 사이트: `chatgpt.com`
- 브라우저: Samsung Internet
- 차단 앱: Samsung Internet용 Adblock
- 필터 형식: Adblock Plus 호환 cosmetic filter
- 운영 방식: GitHub Raw URL 구독

## 설치

1. Samsung Internet용 Adblock의 맞춤 필터 목록을 엽니다.
2. 위 Raw URL을 등록합니다.
3. 필터 목록을 활성화합니다.
4. ChatGPT 페이지를 새로고침해 적용 여부를 확인합니다.

## 유지보수

ChatGPT 웹 UI는 수시로 변경될 수 있습니다. DOM 구조, class, `data-testid`, ARIA 속성이 바뀌어 특정 규칙이 작동하지 않으면 이 저장소의 `dad-gpt-filter.txt`만 수정합니다.

Raw URL과 파일 경로는 유지하므로 휴대폰에서 새 주소를 다시 등록할 필요가 없습니다. Adblock의 필터 목록 갱신 후 새 규칙이 반영됩니다.

Samsung Internet 콘텐츠 차단 호환성을 우선해 고급 userscript나 `:has()` 의존 규칙은 사용하지 않고, 기본 CSS selector 위주로 유지합니다.

## 개인정보 및 보안

저장소에는 대화 내용, 비밀번호, 쿠키, 인증 토큰 등 계정 비밀정보가 포함되지 않습니다.

이 필터는 화면 표시를 숨기는 보조 수단이며 실제 계정 권한 분리 기능을 대체하지 않습니다.

## 비공식 프로젝트

이 프로젝트는 OpenAI 또는 ChatGPT의 공식 프로젝트가 아닙니다.
