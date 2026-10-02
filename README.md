# family-gpt

가족용 GPT 및 브라우저 연결 관련 도구를 한 GitHub 저장소로 정리한 **repository hub**입니다. 각 앱은 서로 독립된 코드베이스·빌드 단위·서비스입니다. 2026-10-02부터 코드 관리와 운영(배포)의 기준은 **이 저장소**입니다. 기존 standalone 저장소는 삭제했으며, 전체 Git 아카이브는 [릴리스](https://github.com/LewisKim7/family-gpt/releases)에 있습니다.

## 앱

| 앱 | 폴더 | 설명 | 운영 주소 | 기존 저장소 (삭제됨) | 이전 방식 |
|---|---|---|---|---|---|
| Family GPT Web | [`apps/family-gpt-web`](apps/family-gpt-web) | 공개 사이트가 소유자 Mac mini의 로그인된 chatgpt.com 세션에 작업을 보내 답을 받는 가족용 GPT 웹(Vercel Functions) | [family-gpt-web.vercel.app](https://family-gpt-web.vercel.app) | Family-GPT-Web | 히스토리 보존 |
| ChatGPT Web Coder | [`apps/chatgpt-web-coder`](apps/chatgpt-web-coder) | ChatGPT 웹 채팅으로 개발하는 워크플로/스킬 템플릿(문서 저장소, 모델이 아님) | — | ChatGPT-Web-Coder | 히스토리 보존 |

`family-gpt-web.vercel.app`의 기존 Vercel Project·도메인·환경변수는 그대로이며, Git source는 `LewisKim7/family-gpt`, Root Directory는 `apps/family-gpt-web`입니다. `main`에 push하면 `apps/family-gpt-web`이 바뀐 경우에만 Production 배포됩니다(`vercel.json`의 `ignoreCommand`). 워커 런처는 `https://family-gpt-web.vercel.app/worker.py`에서 워커를 받습니다.

## 관련 standalone 저장소

- **[Dad-GPT-Filter](https://github.com/LewisKim7/Dad-GPT-Filter)**: 외부 기기가 GitHub raw URL을 직접 구독하는 구조라 이 저장소로 옮기지 않았고 복사본도 두지 않았습니다. 기존 저장소가 유일한 원본(canonical source)입니다. 이름·브랜치·경로를 바꾸지 않습니다.

## 로컬 실행·검증

| 앱 | 도구 | 검증 명령 | 2026-10-01 검증 결과 |
|---|---|---|---|
| family-gpt-web | npm | `npm install && npm run check` (구문 검사, lockfile 없음) | 자동 테스트 없음 |
| chatgpt-web-coder | — | 문서 저장소, 검증 대상 아님 | — |

## 원칙

- 각 `apps/*`는 자기 의존성, lockfile, 빌드 방식, `.github`를 그대로 가지며 단독으로 clone/export해도 실행됩니다.
- 루트에는 workspace, 공통 의존성, 공통 패키지, 빌드 도구, `.github/workflows`가 없습니다.
- 앱을 수정할 때는 해당 `apps/<앱>` 안에서만 바꾸고, 앱 사이에 공유 코드를 만들지 않습니다.
- 비밀값(`.env`, 토큰, 키)은 커밋하지 않습니다. 루트 `.gitignore`가 `.env*`를 막습니다(예시 파일은 허용).
- Vercel 전환과 기존 저장소 삭제는 2026-10-02에 완료했습니다. 상세는 [work-hub/docs/GITHUB-CONSOLIDATION-STATUS.md](https://github.com/LewisKim7/work-hub/blob/main/docs/GITHUB-CONSOLIDATION-STATUS.md)를 보세요.

## 전체 저장소 구조

| 저장소 | 역할 |
|---|---|
| [work-hub](https://github.com/LewisKim7/work-hub) | 업무·투자 리서치 도구 4개 |
| [lewis-lab](https://github.com/LewisKim7/lewis-lab) | 개인 프로젝트·실험 8개 + 보관 1개 |
| [angelic-galore-hub](https://github.com/LewisKim7/angelic-galore-hub) | 앤젤릭갤로어 운영 관련 앱 2개 |
| **family-gpt** (이 저장소) | 가족용 GPT 도구 2개 |
| [investment-ai-portfolio](https://github.com/LewisKim7/investment-ai-portfolio) | 기존 그대로 유지(standalone) |
| [Dad-GPT-Filter](https://github.com/LewisKim7/Dad-GPT-Filter) | standalone. 외부 기기가 raw URL을 구독하는 유일한 원본이라 이동·복사하지 않음 |
| [Lewis-Kim-Applicant](https://github.com/LewisKim7/Lewis-Kim-Applicant) | standalone 공개 포트폴리오 |

이전 과정과 제외 파일은 [docs/MIGRATION-NOTES.md](docs/MIGRATION-NOTES.md)를 보세요.
