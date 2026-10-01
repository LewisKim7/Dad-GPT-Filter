# 이전 기록 (1단계: GitHub 정리)

## 변경하지 않은 것

- 기존 GitHub 저장소 (이름·브랜치·내용 그대로, 삭제·Archive 없음)
- Vercel 프로젝트·도메인·환경 변수·Git 연결·Root Directory·Cron
- 기존 저장소의 GitHub Actions
- **Dad-GPT-Filter**: 이동·복사·이름 변경·브랜치/경로 변경 없음 (구독 URL 보호)

## 이전 방식과 제외 파일

| 앱 | 방식 | 제외한 것 |
|---|---|---|
| family-gpt-web, chatgpt-web-coder | git subtree (히스토리 보존) | 없음 |

## 최소 변경

- 없음. 모든 앱이 원본 그대로입니다.

## 검증 결과 (2026-10-01)

| 앱 | 명령 | 결과 |
|---|---|---|
| family-gpt-web | `npm run check` (구문 검사) | 자동 테스트 없음 |
| chatgpt-web-coder | — | 문서 저장소, 검증 대상 아님 |

## 허브 정리 (2026-10-01)

- README에 앱 설명·운영 주소·기존 저장소 링크·검증 명령·전체 저장소 구조를 추가했습니다.
- 루트 `.gitignore`에 `.env*` 안전망을 추가했습니다(예시 파일 제외). 추적 중인 `.env*` 파일이 없어 기존 파일에는 영향이 없습니다.
  `apps/chatgpt-web-coder`에는 자체 `.gitignore`가 없어 이 안전망이 특히 유효합니다.
- 점검 결과: 루트 `.github/workflows` 없음, 추적 중인 `.env`·비밀값 패턴·2MB 초과 파일·빌드 산출물 없음.

## 다음 단계(배포 연결 전환)에서 확인할 것

- Dad-GPT-Filter를 옮기려면 구독하는 기기의 주소부터 바꿔야 합니다. 비공개 저장소는 raw 구독이 되지 않으므로, 옮기지 않고 그대로 두는 것이 기본입니다.
- 워크플로를 루트로 옮길 때는 `working-directory: apps/<앱>`을 지정합니다.
