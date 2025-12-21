# Project Rules

## Git 규칙
- git commit, git push 실행 전에 반드시 사용자 검토 및 승인을 받을 것

## 배포 규칙
- "prod에 배포해" = main 브랜치를 prod 브랜치에 병합 (Netlify 자동 배포됨)
- 모든 커밋은 반드시 main 브랜치에 먼저 푸시 후, prod로 병합
- prod 브랜치에 직접 커밋/푸시 금지

## 릴리즈 규칙
- 릴리즈 생성 시 이전 태그 조회: `gh api repos/{owner}/{repo}/releases/latest`
- 릴리즈 노트에는 이전 태그 이후의 변경사항 요약 포함

## Frontend 코드 컨벤션 (frontend/src/)

### 디렉토리별 파일 배치 기준
| 디렉토리 | 용도 | 예시 |
|----------|------|------|
| `adapters/` | 외부 데이터를 내부 모델로 변환하는 어댑터 | API 응답 변환 |
| `components/` | React UI 컴포넌트 (.tsx) | KakaoMap.tsx, HLSPlayer.tsx |
| `constants/` | 상수값 (API URL, SVG 경로, 설정값) | api.ts, icons.ts, map.ts |
| `datas/` | 정적 JSON 데이터 파일 | cctv-data.json |
| `hooks/` | React 커스텀 훅 (`use*` 접두사, 상태/생명주기 관련) | useFavorites.ts, useIsMobile.ts |
| `services/` | 외부 API 호출, 비즈니스 로직 (React 독립적, import React 없음) | cctvService.ts, trafficInfoService.ts |
| `styles/` | CSS 스타일 파일 | HLSPlayer.css, CCTVSearch.css |
| `types/` | TypeScript 인터페이스/타입 정의 | cctv.ts, player.ts |
| `utils/` | 순수 유틸리티 함수 | envValidator.ts |

### hooks vs services 구분
- **hooks**: React에 의존적 (useState, useEffect 등 사용), `use` 접두사 필수
- **services**: React와 무관, 순수 함수/클래스, 다른 환경에서도 재사용 가능

### 기타 규칙
- interface는 `types/` 디렉토리에 정의
- CSS 스타일은 `styles/` 디렉토리에 별도 파일로 정의 (인라인 스타일 지양)
- 상수값(SVG 경로, 설정값 등)은 `constants/` 디렉토리에 정의

### 매직 넘버 상수화 규칙
비즈니스 로직에 영향을 주는 숫자값은 반드시 `constants/` 디렉토리에 상수로 정의해야 한다.

**상수화 필수:**
- 시간 간격 (예: 갱신 주기, 디바운스 시간)
- 개수 제한 (예: 최대 즐겨찾기 수, 검색 결과 개수)
- 크기/거리 값 (예: 검색 반경, 브레이크포인트)
- 임계값 (예: 속도 기준, 매칭 조건)

**상수화 불필요:**
- 초기값 0, 1 (예: `useState(0)`, `for문 시작 인덱스`)
- 배열 인덱스 접근 (예: `arr[0]`)
- 수학적 상수 (예: `* 2`, `/ 100`)

**상수 파일 분류:**
| 파일 | 용도 |
|------|------|
| `ui.ts` | UI 관련 (브레이크포인트, 개수 제한, 크기) |
| `traffic.ts` | 교통정보 관련 (갱신 주기, 속도 임계값) |
| `map.ts` | 지도 관련 (줌 레벨, 마커 크기, 좌표) |
| `api.ts` | API URL |
| `icons.ts` | 아이콘 SVG 경로 |
