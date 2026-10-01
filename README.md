# family-gpt

가족용 GPT 및 브라우저 연결 관련 도구를 한 GitHub 저장소로 정리한 **repository hub**입니다. 각 앱은 서로 독립된 프로젝트입니다.

| 앱 | 폴더 | 설명 | 기존 저장소 | 이전 방식 |
|---|---|---|---|---|
| Family GPT Web | `apps/family-gpt-web` | 가족용 GPT 웹 환경 | Family-GPT-Web | 히스토리 보존 |
| ChatGPT Web Coder | `apps/chatgpt-web-coder` | 일반 ChatGPT 웹 채팅 기반 개발 워크플로 템플릿 | ChatGPT-Web-Coder | 히스토리 보존 |

## 관련 standalone 저장소

- **[Dad-GPT-Filter](https://github.com/LewisKim7/Dad-GPT-Filter)**: 외부 기기가 GitHub raw URL을 직접 구독하는 구조라 이 저장소로 옮기지 않았고 복사본도 두지 않았습니다. 기존 저장소가 유일한 원본(canonical source)입니다.

## 원칙

- 각 `apps/*`는 자기 의존성, lockfile, 빌드 방식, `.github`를 그대로 가지며 단독으로 clone/export해도 실행됩니다.
- 루트에는 workspace, 공통 의존성, 공통 패키지, 빌드 도구가 없습니다.
- Vercel, 기존 저장소, GitHub Actions는 이번 단계에서 변경하지 않았습니다.

자세한 내용은 [docs/MIGRATION-NOTES.md](docs/MIGRATION-NOTES.md)를 보세요.
