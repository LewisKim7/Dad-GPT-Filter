# ChatGPT Web Coder

[English README](README.md)

**Version 1.0.0**

> **ChatGPT Web Coder는 OpenAI 모델명이 아니라 리포지토리용 workflow/skill 이름입니다.** 특정 모델로 전환하지 않습니다. 실제 추론과 코딩은 일반 ChatGPT 대화에서 현재 활성화된 호환 모델이 수행합니다.

ChatGPT Web Coder는 일반 ChatGPT 웹채팅에서 안정적으로 GitHub 리포지토리를 개발하기 위한 템플릿입니다. GeekNews/Hada 글에서 소개된 핵심 흐름인 **일반 ChatGPT → GitHub → ChatGPT 샌드박스 → GitHub 반영**, 그리고 정상 경로가 부족할 때만 GitHub Actions를 사용하는 방식을 따릅니다.

## 왜 일반 ChatGPT로 코딩하나?

- GitHub access가 있으면 일반 ChatGPT에서도 repo 확인, 변경 계획, 코드 수정, sandbox 검증, commit/PR 반영까지 할 수 있어 매 작업마다 Codex를 열 필요가 없습니다.
- OpenAI의 현재 코딩 평가에서는 **GPT-5.6 Sol이 GPT-5.6 Luna보다 전반적으로 높게 평가**되어, Sol이 활성화된 일반 ChatGPT에서도 강한 추론·코딩 성능을 활용할 수 있습니다.
- **Codex는 전용 agent harness가 더 강점**이라 긴 terminal loop, 대규모 repo-wide 수정, 장시간 자율 구현에는 여전히 유리합니다.
- 일반 ChatGPT와 Codex는 사용량 메커니즘이 다릅니다. 이 workflow는 Codex agentic 사용량을 아끼는 데 유용하지만, OpenAI가 모든 GitHub-assisted chat workflow에 대해 **Codex credit이 정확히 0만큼 차감된다고 명시적으로 보장한 것은 아닙니다.**

실전 기본값: **일반 ChatGPT + ChatGPT Web Coder를 먼저 사용하고, 전용 agent 환경이 실제로 유리한 작업에서만 Codex를 사용합니다.**

## 권장 구조

```text
일반 ChatGPT 웹채팅
        ↓
GitHub Plugin + ChatGPT Codex Connector
        ↓
ChatGPT Web Coder skill이 들어간 대상 repo
        ↓
ChatGPT sandbox work container
(수정 → 빌드/테스트/디버그 → 검증)
        ↓
GitHub commit / branch / PR
        ↓
정말 필요한 경우에만 GitHub Actions
```

## 빠른 시작

1. **새 프로젝트**라면 이 리포지토리/템플릿에서 새 repo를 만들어 skill을 처음부터 포함합니다.
2. ChatGPT에서 **GitHub Plugin**을 설치/연결합니다.
3. GitHub에서 **ChatGPT Codex Connector**를 설치하고 대상 repo에 access를 부여합니다.
4. 일반 ChatGPT 대화에서 대상 repo URL과 원하는 개발 작업을 요청합니다.

예시:

```text
https://github.com/OWNER/REPO

이 repo 최신 상태를 확인하고 요청한 기능을 구현해줘.
ChatGPT sandbox에서 필요한 테스트까지 하고 검증된 변경만 branch/PR로 반영해줘.
정상 sandbox/GitHub 경로로 할 수 있으면 GitHub Actions는 사용하지 마.
```

매번 `ChatGPT Web Coder`라는 이름을 직접 언급할 필요는 없습니다. repo의 `AGENTS.md`가 모델을 내장 skill로 안내합니다.

## 새 프로젝트와 기존 프로젝트

### 새 프로젝트

이 repo/템플릿에서 시작하면 다음이 이미 포함됩니다.

```text
AGENTS.md
.agents/skills/chatgpt-web-coder/
```

### 기존 프로젝트

다음 폴더를 한 번만 복사합니다.

```text
.agents/skills/chatgpt-web-coder/
```

그리고 이 repo의 `AGENTS.md`에 있는 짧은 진입 지침을 기존 프로젝트의 agent 지침에 병합합니다. 기존 프로젝트의 개발 규칙은 그대로 유지합니다.

**전역 설치는 필요하지 않으며 중앙 원본을 두 개 관리할 필요도 없습니다.**

## skill이 자동으로 하는 일

리포지토리 개발 요청을 받으면 모델은 조용히 다음 순서로 작업합니다.

1. `AGENTS.md`와 `.agents/skills/chatgpt-web-coder/SKILL.md`를 읽습니다.
2. 정확한 repo/PR/commit 상태를 확인합니다.
3. 필요한 정확한 source state를 ChatGPT sandbox에 확보합니다.
4. 새 도구를 설치하거나 원격 작업을 만들기 전에 sandbox에 이미 있는 capability를 확인합니다.
5. 일반적인 수정·빌드·테스트·디버깅은 sandbox에서 수행합니다.
6. 실제 capability/transport/execution gap이 있을 때만 GitHub Actions를 사용합니다.
7. repo와 작업이 요구하는 동작을 검증합니다.
8. 검증된 정확한 변경만 가장 단순하고 신뢰할 수 있는 GitHub 경로로 반영합니다.
9. 실제 수행한 검증만 보고합니다.

## GitHub Actions 원칙

GitHub Actions는 **기본 코딩 환경이 아니라 fallback**입니다.

이 skill을 설치했다는 이유만으로 영구적인 workflow를 만들지 않습니다. sandbox 또는 일반 GitHub 경로로 필요한 capability나 정확한 전송을 제공할 수 없을 때만 제한된 Actions mission을 사용합니다.

상세 규칙은 [`actions-missions.md`](.agents/skills/chatgpt-web-coder/references/actions-missions.md)에 있습니다.

## 복구 원칙

정확한 source의 기준은 GitHub입니다. 복구 우선순위는 다음과 같습니다.

```text
commit / PR head
    > immutable Git 또는 Actions artifact
    > 살아남은 sandbox working tree
    > conversation reconstruction
```

상세 내용은 [`recovery.md`](.agents/skills/chatgpt-web-coder/references/recovery.md)를 참고합니다.

## 리포지토리 구조

```text
AGENTS.md
    -> 짧은 진입점

.agents/skills/chatgpt-web-coder/
  SKILL.md
      -> 핵심 실행 정책
  references/
    actions-missions.md
      -> 제한된 GitHub Actions fallback 규칙
    recovery.md
      -> sandbox/chat/source 상태 복구 규칙
    design-rationale.md
      -> 유지보수용 설계 이유
```

## 이름에 대한 핵심

**ChatGPT Web Coder**라는 이름은 모델이 아니라 사용 환경과 workflow를 설명하기 위해 선택했습니다. 향후 ChatGPT 모델이 바뀌어도 이 skill의 구조는 그대로 사용할 수 있습니다.