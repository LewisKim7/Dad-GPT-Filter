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

1단계에서는 원본 그대로 이전했습니다. 이후 2단계 준비로 Family GPT Web의 GitHub raw URL 의존성만 제거했습니다.

- `public/worker.py` 추가: 기존 `bridge/worker.py`와 동일한 worker를 Vercel 정적 경로로 제공
- macOS/Windows launcher: 기존 `raw.githubusercontent.com/LewisKim7/Family-GPT-Web/...` 대신 `${SITE_URL}/worker.py` 사용
- `vercel.json`: `/worker.py -> /public/worker.py` rewrite 및 no-store 헤더 추가
- 문서의 canonical code source를 `LewisKim7/family-gpt/apps/family-gpt-web`로 변경
- 앱 로직·API·환경변수·도메인·Vercel Project 자체는 변경하지 않음

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

## 원본 저장소 삭제 전 보존한 refs (2026-10-01)

ChatGPT-Web-Coder 원본의 `main` 밖 브랜치 `improve/add-gitignore`(2026-09-30, `.gitignore` 추가 1커밋)를
태그 `chatgpt-web-coder/branch/improve/add-gitignore`로 그대로 옮겼습니다(`git fetch --tags` 후 확인).
원본 `main`의 트리 해시가 `apps/chatgpt-web-coder`(`1f968db…`) 트리 해시와 일치해 내용이 동일하며, 커밋 역사는 이미 subtree로 들어와 있습니다.

## 원본 Family-GPT-Web full archive (2026-10-02)

- GitHub Actions run: `36882420760` → success
- Artifact: `family-gpt-web-full-git-bundle`
- Artifact digest: `sha256:1388b131fe74dd328c1df171e7d6a9936c2e8b1297ec08ff8b2e68192566d009`
- Google Drive 보존본: `1ajS6LYuxJqlQ4aeCoOlvG2gZf9TL4d4w` (`family-gpt-web-full-git-bundle.zip`, 63,447 bytes)
- Drive readback 완료
- 완료 후 원본 저장소의 임시 `one-time-repository-archive.yml` 제거

## 2단계 준비 상태 (2026-10-01)

- 기존 standalone GitHub raw URL 의존성: **제거 완료**
- `bridge/worker.py`와 `public/worker.py`: 동일 내용으로 유지
- 새 launcher는 production site의 `/worker.py`를 받도록 변경
- Vercel Git 연결 자체: **아직 기존 Family-GPT-Web 저장소**
- 따라서 기존 Family-GPT-Web 저장소는 Vercel Git source를 `family-gpt`로 전환하고 Production 확인하기 전에는 삭제하지 않음

## 다음 단계(배포 연결 전환)에서 확인할 것

- Dad-GPT-Filter를 옮기려면 구독하는 기기의 주소부터 바꿔야 합니다. 비공개 저장소는 raw 구독이 되지 않으므로, 옮기지 않고 그대로 두는 것이 기본입니다.
- 워크플로를 루트로 옮길 때는 `working-directory: apps/<앱>`을 지정합니다.
